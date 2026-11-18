import { type NextRequest, NextResponse } from "next/server";
import { handleUpdate } from "@/lib/signals";
import { type TgUpdate, telegram, webhookAuthorized } from "@/lib/telegram";

/**
 * Telegram Bot API webhook (registered by `pnpm telegram:setup`). Telegram
 * sends the secret given to setWebhook in a header; anything without it is
 * refused.
 *
 * Always answers 200 once the update is read: Telegram keeps redelivering an
 * update that got an error, and one stuck update would hold back the signals
 * behind it. A failure is logged and told to the person who sent the update.
 */
export async function POST(request: NextRequest) {
  if (!webhookAuthorized(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const update = (await request.json()) as TgUpdate;
  try {
    await handleUpdate(update);
  } catch (error) {
    console.error("Telegram update failed", update.update_id, error);
    const chatId = update.message?.chat.id ?? update.callback_query?.from.id;
    if (chatId) {
      await telegram("sendMessage", {
        chat_id: chatId,
        text: "⚠️ Ботод алдаа гарлаа. Channel-оо шалгаад, signal ороогүй бол дахин илгээнэ үү.",
      }).catch(() => {});
    }
  }
  return NextResponse.json({ ok: true });
}
