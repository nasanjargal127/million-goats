import "server-only";
import { timingSafeEqual } from "node:crypto";

/** Minimal Telegram Bot API client: only what the signal bot uses. */

export class TelegramError extends Error {
  constructor(
    readonly method: string,
    readonly code: number,
    description: string,
  ) {
    super(`${method}: ${code} ${description}`);
  }
}

const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 10_000;

function token() {
  const value = process.env.TELEGRAM_BOT_TOKEN;
  if (!value) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return value;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calls a Bot API method. Retries only rate limits (429, after `retry_after`):
 * Telegram refused those, so nothing was posted. A 5xx, network error or
 * timeout is not retried here, because the request may already have gone
 * through and retrying could post a signal twice; the caller reports it and
 * the admin decides.
 */
export async function telegram<T>(method: string, params: Record<string, unknown>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = (await response.json().catch(() => null)) as {
      ok: boolean;
      result?: T;
      error_code?: number;
      description?: string;
      parameters?: { retry_after?: number };
    } | null;
    if (body?.ok) return body.result as T;

    const code = body?.error_code ?? response.status;
    if (code !== 429 || attempt >= MAX_ATTEMPTS) {
      throw new TelegramError(method, code, body?.description ?? response.statusText);
    }
    await sleep(Math.min(body?.parameters?.retry_after ?? attempt, 10) * 1000);
  }
}

/** Telegram echoes the `secret_token` given to setWebhook in this header. */
export function webhookAuthorized(header: string | null) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return false;
  const given = Buffer.from(header ?? "");
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Telegram user ids allowed to post signals (TELEGRAM_ADMIN_IDS, comma-separated). */
export function isTelegramAdmin(userId: number | undefined) {
  if (userId === undefined) return false;
  return (process.env.TELEGRAM_ADMIN_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .includes(String(userId));
}

// ─── The parts of the Bot API types we read ─────────────────────────────────

type TgUser = { id: number; first_name: string; last_name?: string; username?: string };

export type TgMessage = {
  message_id: number;
  chat: { id: number; type: string };
  from?: TgUser;
  text?: string;
  caption?: string;
  media_group_id?: string;
};

export type TgCallbackQuery = {
  id: string;
  from: TgUser;
  data?: string;
  message?: TgMessage;
};

export type TgUpdate = {
  update_id: number;
  message?: TgMessage;
  callback_query?: TgCallbackQuery;
};

export type InlineButton = { text: string; callback_data?: string; url?: string };
