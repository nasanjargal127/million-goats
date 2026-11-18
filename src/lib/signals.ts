import "server-only";
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
 * Signal bot. An admin writes the signal to the bot in a private chat; the bot
 * asks "send this to the channel?"; on Send it copies that exact message
 * (text, formatting, photo + caption) to TELEGRAM_CHANNEL_ID and confirms with
 * a link. Every signal is a row in `signal`, so nothing is posted twice and a
 * failed send stays visible with a Retry button.
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

const sendCancelButtons = (signalId: string, send = "✅ Илгээх") =>
  keyboard([
    [{ text: send, callback_data: `send:${signalId}` }],
    [{ text: "❌ Цуцлах", callback_data: `cancel:${signalId}` }],
  ]);

const HELP = [
  "Signal-аа энд бичээд илгээнэ үү (текст, эсвэл нэг зураг + тайлбар).",
  "Бот танаас «Илгээх үү?» гэж асууна. ✅ Илгээх дарахад яг тэр мессеж channel руу очиж, линктэй баталгаа ирнэ.",
  "Альбом (олон зураг нэг дор) нэг бүрчлэн асуугдана — нэг зураг ашиглах нь найдвартай.",
].join("\n\n");

export async function handleUpdate(update: TgUpdate) {
  if (update.message) await handleMessage(update.message);
  else if (update.callback_query) await handleCallback(update.callback_query);
}

async function reply(chatId: number, text: string, extra: Record<string, unknown> = {}) {
  return telegram<TgMessage>("sendMessage", { chat_id: chatId, text, ...extra });
}

/** Edits the bot's prompt; a failed edit must not undo a send that already happened. */
async function editPrompt(
  chatId: string | number,
  messageId: number,
  text: string,
  markup?: ReturnType<typeof keyboard>,
) {
  try {
    await telegram("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
      reply_markup: markup ?? keyboard([]),
      link_preview_options: { is_disabled: true },
    });
  } catch (error) {
    console.error("Signal prompt edit failed", error);
  }
}

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
      adminName: from?.username ? `@${from.username}` : from?.first_name,
      preview: (message.text ?? message.caption ?? "").slice(0, 200) || null,
    },
    update: {},
  });
  // A redelivered update: this message already has its prompt.
  if (signal.promptMessageId !== null) return;

  const prompt = await reply(message.chat.id, "Энэ мессежийг channel руу илгээх үү?", {
    reply_parameters: { message_id: message.message_id },
    reply_markup: sendCancelButtons(signal.id),
  });
  await prisma.signal.update({
    where: { id: signal.id },
    data: { promptMessageId: prompt.message_id },
  });
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
  const [action, signalId] = (query.data ?? "").split(":");
  if (!signalId || (action !== "send" && action !== "cancel")) {
    await answer();
    return;
  }

  if (action === "cancel") {
    const { count } = await prisma.signal.updateMany({
      where: { id: signalId, status: { in: ["DRAFT", "FAILED"] } },
      data: { status: "CANCELLED" },
    });
    await answer(count ? "Цуцлагдлаа" : "Энэ signal-ыг өөрчлөх боломжгүй.");
    if (count && query.message) {
      await editPrompt(query.message.chat.id, query.message.message_id, "❌ Цуцлагдсан.");
    }
    return;
  }

  // Only one press can move a signal out of DRAFT/FAILED, so a double tap or a
  // redelivered update never posts it twice.
  const { count } = await prisma.signal.updateMany({
    where: { id: signalId, status: { in: ["DRAFT", "FAILED"] } },
    data: { status: "SENDING", attempts: { increment: 1 } },
  });
  if (!count) {
    const current = await prisma.signal.findUnique({ where: { id: signalId } });
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

  const signal = await prisma.signal.findUniqueOrThrow({ where: { id: signalId } });
  const promptChat = signal.sourceChatId;
  const promptId = signal.promptMessageId ?? query.message?.message_id;

  try {
    const posted = await telegram<{ message_id: number }>("copyMessage", {
      chat_id: channelId(),
      from_chat_id: signal.sourceChatId,
      message_id: signal.sourceMessageId,
    });
    const sentAt = new Date();
    await prisma.signal.update({
      where: { id: signal.id },
      data: { status: "SENT", channelMessageId: posted.message_id, sentAt, error: null },
    });
    const url = postUrl(posted.message_id);
    if (promptId) {
      await editPrompt(
        promptChat,
        promptId,
        `✅ Channel руу илгээгдлээ · ${time(sentAt)}`,
        url ? keyboard([[{ text: "Channel-д харах", url }]]) : undefined,
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
    if (promptId) {
      await editPrompt(
        promptChat,
        promptId,
        refused
          ? `⚠️ Илгээж чадсангүй: ${reason}\n\nАсуудлыг засаад дахин оролдоно уу.`
          : `⚠️ Telegram хариу өгсөнгүй: ${reason}\n\nChannel-оо шалгаад, мессеж ороогүй бол дахин илгээнэ үү.`,
        sendCancelButtons(signal.id, "🔁 Дахин илгээх"),
      );
    }
  }
}
