import "server-only";
import { site } from "./site";

// WeSend (https://wesend.mn/docs/email): POST /v1/email with a Bearer API key.
// Mail goes out from WeSend's shared domain under our sender name; replies go to
// the reply-to address set in the WeSend project settings.
const SEND_URL = "https://api.wesend.mn/v1/email";

export const emailConfigured = Boolean(process.env.WESEND_API_KEY);

/**
 * Queues one email with WeSend. The idempotency key makes a retried call (after
 * a timeout, say) send at most one email. Throws if WeSend refuses it.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}) {
  const key = process.env.WESEND_API_KEY;
  if (!key) throw new Error("WESEND_API_KEY is not set");
  const res = await fetch(SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      from_name: site.name,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code?: string } } | null;
    throw new Error(`WeSend refused the email: ${res.status} ${body?.error?.code ?? ""}`.trim());
  }
}

/** Escapes text for HTML email bodies (names come from users). */
export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
