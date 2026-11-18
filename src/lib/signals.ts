import "server-only";
import { type FocusCard, Prisma, type Signal, type TradeSide } from "@/generated/prisma/client";
import { prisma } from "./db";
import {
  type InlineButton,
  isTelegramAdmin,
  TelegramError,
  type TgCallbackQuery,
  type TgMessage,
  type TgUpdate,
  telegram,
} from "./telegram";

/**
 * Signal bot for the private channel (TELEGRAM_CHANNEL_ID). Admins talk to it
 * in a private chat:
 *
 * - Any message is copied to the channel as-is (text, formatting, photo +
 *   caption) straight away, and the bot replies with a link to the post.
 * - `/focus XAUUSD EURUSD` posts the focus list to the channel, then leaves the
 *   admin one card per pair with BUY / SELL buttons. A press posts
 *   "🟢 BUY XAUUSD" to the channel at once.
 *
 * Every post is a row in `signal` and is claimed before it is sent, so nothing
 * is posted twice; a failed post is reported with a Retry button.
 */

function channelId() {
  const id = process.env.TELEGRAM_CHANNEL_ID;
  if (!id) throw new Error("TELEGRAM_CHANNEL_ID is not set");
  return id;
}

/** Link to a channel post: t.me/c/<id> for private channels, t.me/<name> for public. */
function postUrl(messageId: number) {
  const id = channelId();
  if (id.startsWith("-100")) return `https://t.me/c/${id.slice(4)}/${messageId}`;
  if (id.startsWith("@")) return `https://t.me/${id.slice(1)}/${messageId}`;
  return null;
}

const time = (date: Date) =>
  date.toLocaleTimeString("mn-MN", {
    timeZone: "Asia/Ulaanbaatar",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const keyboard = (rows: InlineButton[][]) => ({ inline_keyboard: rows });

const retryButtons = (signalId: string) =>
  keyboard([
    [{ text: "🔁 Дахин илгээх", callback_data: `send:${signalId}` }],
    [{ text: "❌ Цуцлах", callback_data: `cancel:${signalId}` }],
  ]);

const SIDE_LABEL: Record<TradeSide, string> = { BUY: "🟢 BUY", SELL: "🔴 SELL" };

/** The same button pressed again within this window is taken as a double tap. */
const DOUBLE_TAP_MS = 30_000;
const MAX_PAIRS = 20;

const HELP = [
  "Signal-аа энд бичээд илгээнэ үү (текст, эсвэл зураг + тайлбар). Бот яг тэр мессежийг шууд channel руу илгээж, линктэй баталгаа өгнө.",
  "Focusing: /focus XAUUSD EURUSD GBPJPY гэж бичвэл жагсаалт channel руу очиж, хослол бүрт 🟢 BUY / 🔴 SELL товчтой card ирнэ. Товч дарахад signal шууд channel руу очно.",
  "Илгээж чадаагүй бол шалтгааныг нь «🔁 Дахин илгээх» товчтой хамт хэлнэ.",
].join("\n\n");

const FOCUS_USAGE =
  "Хослолуудаа /focus-ийн ард зайгаар тусгаарлан бичнэ үү.\n\nЖишээ: /focus XAUUSD EURUSD GBPJPY";

export async function handleUpdate(update: TgUpdate) {
  if (update.message) await handleMessage(update.message);
  else if (update.callback_query) await handleCallback(update.callback_query);
}

async function reply(chatId: number, text: string, extra: Record<string, unknown> = {}) {
  return telegram<TgMessage>("sendMessage", { chat_id: chatId, text, ...extra });
}

const adminName = (from: TgMessage["from"]) =>
  from?.username ? `@${from.username}` : from?.first_name;

async function handleMessage(message: TgMessage) {
  if (message.chat.type !== "private") return;
  const from = message.from;
  const admin = isTelegramAdmin(from?.id);
  const text = message.text?.trim();

  if (text === "/start" || text === "/help" || text === "/id") {
    await reply(
      message.chat.id,
      admin
        ? HELP
        : `Энэ бот зөвхөн Million Goats админуудад зориулагдсан.\n\nТаны Telegram ID: ${from?.id}`,
    );
    return;
  }
  if (!admin) {
    await reply(message.chat.id, "Энэ бот зөвхөн Million Goats админуудад зориулагдсан.");
    return;
  }
  const focus = text?.match(/^\/focus(?:@\w+)?(?:\s+([\s\S]*))?$/i);
  if (focus) {
    await handleFocus(message, focus[1] ?? "");
    return;
  }
  if (text?.startsWith("/")) {
    await reply(message.chat.id, HELP);
    return;
  }

  const signal = await prisma.signal.upsert({
    where: {
      sourceChatId_sourceMessageId: {
        sourceChatId: String(message.chat.id),
        sourceMessageId: message.message_id,
      },
    },
    create: {
      sourceChatId: String(message.chat.id),
      sourceMessageId: message.message_id,
      adminName: adminName(from),
      preview: (message.text ?? message.caption ?? "").slice(0, 200) || null,
    },
    update: {},
  });
  // A redelivered update finds the signal already claimed and stops here.
  if (await claim(signal.id, ["DRAFT"])) await deliver(signal.id);
}

/** "xauusd, eurusd\nGBPJPY" → ["XAUUSD", "EURUSD", "GBPJPY"]; null if something is not a pair. */
function parsePairs(input: string) {
  const tokens = input
    .split(/[\s,;]+/)
    .map((token) => token.replace(/^#/, "").toUpperCase())
    .filter(Boolean);
  if (!tokens.length || tokens.length > MAX_PAIRS) return null;
  if (!tokens.every((token) => /^[A-Z0-9][A-Z0-9./_-]{1,19}$/.test(token))) return null;
  return [...new Set(tokens)];
}

async function handleFocus(message: TgMessage, args: string) {
  const pairs = parsePairs(args);
  if (!pairs) {
    await reply(message.chat.id, FOCUS_USAGE);
    return;
  }
  const chatId = String(message.chat.id);
  const text = `🎯 Focusing\n\n${pairs.join("\n")}`;
  const signal = await prisma.signal.upsert({
    where: {
      sourceChatId_sourceMessageId: { sourceChatId: chatId, sourceMessageId: message.message_id },
    },
    create: {
      kind: "FOCUS",
      sourceChatId: chatId,
      sourceMessageId: message.message_id,
      text,
      adminName: adminName(message.from),
      preview: text.slice(0, 200),
    },
    update: {},
  });
  // Redelivered /focus: the list was posted and the cards sent the first time.
  if (!(await claim(signal.id, ["DRAFT"]))) return;

  await retireCards(chatId);
  await deliver(signal.id);
  for (const pair of pairs) {
    const card = await prisma.focusCard.create({
      data: { pair, chatId, focusSignalId: signal.id },
    });
    const sent = await telegram<TgMessage>("sendMessage", {
      chat_id: chatId,
      text: cardText(card),
      reply_markup: cardButtons(card.id),
      link_preview_options: { is_disabled: true },
    });
    await prisma.focusCard.update({ where: { id: card.id }, data: { messageId: sent.message_id } });
  }
}

/** A newer /focus replaces the chat's cards: the old ones lose their buttons. */
async function retireCards(chatId: string) {
  const old = await prisma.focusCard.findMany({ where: { chatId, active: true } });
  if (!old.length) return;
  await prisma.focusCard.updateMany({
    where: { id: { in: old.map((card) => card.id) } },
    data: { active: false },
  });
  for (const card of old) {
    if (card.messageId === null) continue;
    await telegram("editMessageText", {
      chat_id: chatId,
      message_id: card.messageId,
      text: `${card.pair}\n\nХуучин focusing — шинэ жагсаалтын card-уудыг ашиглана уу.`,
      reply_markup: keyboard([]),
    }).catch((error) => console.error("Focus card retire failed", card.id, error));
  }
}

function cardText(card: Pick<FocusCard, "pair">, last?: { side: TradeSide; at: Date }) {
  return last
    ? `${card.pair}\n\nСүүлд: ${SIDE_LABEL[last.side]} · ${time(last.at)} ✅`
    : `${card.pair}\n\nBUY эсвэл SELL дарахад signal шууд channel руу очно.`;
}

function cardButtons(cardId: string, url?: string | null) {
  const rows: InlineButton[][] = [
    [
      { text: SIDE_LABEL.BUY, callback_data: `buy:${cardId}` },
      { text: SIDE_LABEL.SELL, callback_data: `sell:${cardId}` },
    ],
  ];
  if (url) rows.push([{ text: "Сүүлийн signal-ыг харах", url }]);
  return keyboard(rows);
}

/**
 * Moves a signal to SENDING. Only one caller can win, so a redelivered update,
 * a double tap on Retry or two admins at once never post it twice.
 */
async function claim(signalId: string, from: Array<"DRAFT" | "FAILED">) {
  const { count } = await prisma.signal.updateMany({
    where: { id: signalId, status: { in: from } },
    data: { status: "SENDING", attempts: { increment: 1 } },
  });
  return count === 1;
}

type SignalWithCard = Signal & { card: FocusCard | null };

/** Posts a claimed signal to the channel and reports the outcome to the admin. */
async function deliver(signalId: string) {
  const signal = await prisma.signal.findUniqueOrThrow({
    where: { id: signalId },
    include: { card: true },
  });
  try {
    const posted = await post(signal);
    const sentAt = new Date();
    await prisma.signal.update({
      where: { id: signal.id },
      data: { status: "SENT", channelMessageId: posted.message_id, sentAt, error: null },
    });
    const url = postUrl(posted.message_id);
    const done = `✅ Channel руу илгээгдлээ · ${time(sentAt)}`;
    if (signal.kind === "TRADE" && signal.card && signal.side) {
      // The card itself shows the last press; a reply only exists after a failure.
      await updateCard(signal.card, { side: signal.side, at: sentAt }, url);
      if (signal.promptMessageId !== null) await report(signal, done, keyboard([]));
    } else {
      await report(
        signal,
        done,
        url ? keyboard([[{ text: "Channel-д харах", url }]]) : keyboard([]),
      );
    }
  } catch (error) {
    console.error("Signal send failed", signal.id, error);
    const reason = error instanceof Error ? error.message : String(error);
    await prisma.signal.update({
      where: { id: signal.id },
      data: { status: "FAILED", error: reason.slice(0, 500) },
    });
    // A refusal (4xx) means nothing was posted; anything else might have been.
    const refused = error instanceof TelegramError && error.code >= 400 && error.code < 500;
    const what = signal.kind === "TRADE" ? `«${signal.text}» ` : "";
    await report(
      signal,
      refused
        ? `⚠️ ${what}Илгээж чадсангүй: ${reason}\n\nАсуудлыг засаад дахин оролдоно уу.`
        : `⚠️ ${what}Telegram хариу өгсөнгүй: ${reason}\n\nChannel-оо шалгаад, мессеж ороогүй бол дахин илгээнэ үү.`,
      retryButtons(signal.id),
    );
  }
}

function post(signal: Signal) {
  if (signal.text !== null) {
    return telegram<{ message_id: number }>("sendMessage", {
      chat_id: channelId(),
      text: signal.text,
    });
  }
  if (signal.sourceMessageId === null) throw new Error(`signal ${signal.id} has nothing to post`);
  return telegram<{ message_id: number }>("copyMessage", {
    chat_id: channelId(),
    from_chat_id: signal.sourceChatId,
    message_id: signal.sourceMessageId,
  });
}

async function updateCard(
  card: FocusCard,
  last: { side: TradeSide; at: Date },
  url: string | null,
) {
  if (card.messageId === null || !card.active) return;
  await telegram("editMessageText", {
    chat_id: card.chatId,
    message_id: card.messageId,
    text: cardText(card, last),
    reply_markup: cardButtons(card.id, url),
    link_preview_options: { is_disabled: true },
  }).catch((error) => console.error("Focus card update failed", card.id, error));
}

/**
 * Tells the admin how the send went: the first time as a reply to their
 * message (or to the card pressed), after a retry by editing that same reply.
 * A failed report must not undo a send that already happened, so it is only
 * logged.
 */
async function report(signal: SignalWithCard, text: string, markup: ReturnType<typeof keyboard>) {
  try {
    if (signal.promptMessageId !== null) {
      await telegram("editMessageText", {
        chat_id: signal.sourceChatId,
        message_id: signal.promptMessageId,
        text,
        reply_markup: markup,
        link_preview_options: { is_disabled: true },
      });
      return;
    }
    const replyTo = signal.sourceMessageId ?? signal.card?.messageId;
    const sent = await telegram<TgMessage>("sendMessage", {
      chat_id: signal.sourceChatId,
      text,
      ...(replyTo
        ? { reply_parameters: { message_id: replyTo, allow_sending_without_reply: true } }
        : {}),
      reply_markup: markup,
      link_preview_options: { is_disabled: true },
    });
    await prisma.signal.update({
      where: { id: signal.id },
      data: { promptMessageId: sent.message_id },
    });
  } catch (error) {
    console.error("Signal report failed", signal.id, error);
  }
}

async function handleCallback(query: TgCallbackQuery) {
  const answer = (text?: string) =>
    telegram("answerCallbackQuery", { callback_query_id: query.id, text }).catch((error) =>
      console.error("answerCallbackQuery failed", error),
    );

  if (!isTelegramAdmin(query.from.id)) {
    await answer("Эрх байхгүй байна.");
    return;
  }
  const [action, id] = (query.data ?? "").split(":");
  if (!id) {
    await answer();
    return;
  }

  if (action === "buy" || action === "sell") {
    await handleTrade(query, id, action === "buy" ? "BUY" : "SELL", answer);
    return;
  }

  if (action === "cancel") {
    const { count } = await prisma.signal.updateMany({
      where: { id, status: { in: ["DRAFT", "FAILED"] } },
      data: { status: "CANCELLED" },
    });
    await answer(count ? "Цуцлагдлаа" : "Энэ signal-ыг өөрчлөх боломжгүй.");
    if (count && query.message) {
      await telegram("editMessageText", {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        text: "❌ Цуцлагдсан.",
        reply_markup: keyboard([]),
      }).catch((error) => console.error("Signal report failed", id, error));
    }
    return;
  }

  if (action !== "send") {
    await answer();
    return;
  }
  if (!(await claim(id, ["DRAFT", "FAILED"]))) {
    const current = await prisma.signal.findUnique({ where: { id } });
    await answer(
      current?.status === "SENT"
        ? "Аль хэдийн илгээгдсэн."
        : current?.status === "SENDING"
          ? "Илгээж байна…"
          : "Энэ signal цуцлагдсан.",
    );
    return;
  }
  await answer("Илгээж байна…");
  await deliver(id);
}

/** A BUY/SELL press on a focus card: posts "🟢 BUY XAUUSD" to the channel at once. */
async function handleTrade(
  query: TgCallbackQuery,
  cardId: string,
  side: TradeSide,
  answer: (text?: string) => Promise<unknown>,
) {
  const card = await prisma.focusCard.findUnique({ where: { id: cardId } });
  if (!card?.active) {
    await answer("Энэ card хуучирсан. Шинэ /focus илгээнэ үү.");
    return;
  }
  // Double-tap guard: the same side again within DOUBLE_TAP_MS is ignored.
  // Atomic, so two quick presses cannot both pass.
  const now = new Date();
  const { count } = await prisma.focusCard.updateMany({
    where: {
      id: cardId,
      active: true,
      OR: [
        { lastSide: null },
        { lastSide: { not: side } },
        { lastPressedAt: { lt: new Date(now.getTime() - DOUBLE_TAP_MS) } },
      ],
    },
    data: { lastSide: side, lastPressedAt: now },
  });
  if (!count) {
    await answer(`${SIDE_LABEL[side]} ${card.pair} саяхан илгээгдсэн (30 сек).`);
    return;
  }

  const text = `${SIDE_LABEL[side]} ${card.pair}`;
  let signal: Signal;
  try {
    signal = await prisma.signal.create({
      data: {
        kind: "TRADE",
        sourceChatId: card.chatId,
        cardId: card.id,
        side,
        pressId: query.id,
        text,
        preview: text,
        adminName: query.from.username ? `@${query.from.username}` : query.from.first_name,
      },
    });
  } catch (error) {
    // The same press delivered again: it was handled the first time.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      await answer();
      return;
    }
    throw error;
  }
  if (!(await claim(signal.id, ["DRAFT"]))) return;
  await answer(`${text} — илгээж байна…`);
  await deliver(signal.id);
}
