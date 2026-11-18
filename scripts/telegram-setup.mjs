// Points the Telegram bot at this site's webhook and checks that it can post
// to the signal channel. Run after deploying, and whenever the token, secret
// or site URL changes:
//
//   pnpm telegram:setup
//
// Reads TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, TELEGRAM_CHANNEL_ID and
// NEXT_PUBLIC_SITE_URL from .env (use the production values).

import "dotenv/config";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, TELEGRAM_CHANNEL_ID, NEXT_PUBLIC_SITE_URL } =
  process.env;

for (const [name, value] of Object.entries({
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_WEBHOOK_SECRET,
  TELEGRAM_CHANNEL_ID,
  NEXT_PUBLIC_SITE_URL,
})) {
  if (!value) {
    console.error(`✗ ${name} is not set`);
    process.exit(1);
  }
}
if (!/^[A-Za-z0-9_-]{1,256}$/.test(TELEGRAM_WEBHOOK_SECRET)) {
  console.error(
    "✗ TELEGRAM_WEBHOOK_SECRET may only use A-Z, a-z, 0-9, _ and - (try: openssl rand -hex 32)",
  );
  process.exit(1);
}

async function call(method, params = {}) {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
  });
  const body = await response.json();
  if (!body.ok) throw new Error(`${method}: ${body.error_code} ${body.description}`);
  return body.result;
}

try {
  const bot = await call("getMe");
  console.log(`✓ Bot: @${bot.username}`);

  const member = await call("getChatMember", { chat_id: TELEGRAM_CHANNEL_ID, user_id: bot.id });
  const canPost = member.status === "creator" || member.can_post_messages === true;
  if (member.status !== "administrator" && member.status !== "creator") {
    throw new Error(`the bot is "${member.status}" in the channel; make it an admin`);
  }
  if (!canPost) throw new Error('the bot is an admin but lacks "Post messages"');
  const channel = await call("getChat", { chat_id: TELEGRAM_CHANNEL_ID });
  console.log(`✓ Channel: ${channel.title} — the bot can post`);

  const url = `${NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/api/telegram/webhook`;
  await call("setWebhook", {
    url,
    secret_token: TELEGRAM_WEBHOOK_SECRET,
    allowed_updates: ["message", "callback_query"],
  });
  const info = await call("getWebhookInfo");
  console.log(`✓ Webhook: ${info.url}`);
  if (info.pending_update_count) console.log(`  ${info.pending_update_count} update(s) waiting`);
  if (info.last_error_message) console.log(`  last error: ${info.last_error_message}`);
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
