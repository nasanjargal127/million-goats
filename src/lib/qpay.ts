import "server-only";

// QPay Merchant API v2 — https://developer.qpay.mn
// Endpoints: POST /v2/auth/token (Basic), POST /v2/invoice, POST /v2/payment/check,
// DELETE /v2/invoice/{id}. Response field names below follow QPay's v2 responses;
// they are parsed defensively — confirm against the sandbox before going live.

const BASE_URL = (process.env.QPAY_BASE_URL ?? "https://merchant-sandbox.qpay.mn").replace(
  /\/$/,
  "",
);
const CLIENT_ID = process.env.QPAY_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.QPAY_CLIENT_SECRET ?? "";
const INVOICE_CODE = process.env.QPAY_INVOICE_CODE ?? "";

export const qpayConfigured = Boolean(CLIENT_ID && CLIENT_SECRET && INVOICE_CODE);

class QPayError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "QPayError";
  }
}

// Token cached in server memory and reused until shortly before it expires.
// QPay returns `expires_in` as an absolute Unix timestamp (seconds).
let cachedToken: { value: string; expiresAtMs: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAtMs - 60_000 > Date.now()) return cachedToken.value;
  if (!qpayConfigured) throw new QPayError("QPay is not configured");

  const res = await fetch(`${BASE_URL}/v2/auth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new QPayError(`QPay auth failed (${res.status})`, res.status);

  const data = (await res.json()) as { access_token?: unknown; expires_in?: unknown };
  if (typeof data.access_token !== "string") throw new QPayError("QPay auth: no access_token");
  const exp = Number(data.expires_in);
  cachedToken = {
    value: data.access_token,
    // Fall back to one hour if the expiry is missing or not a timestamp.
    expiresAtMs: exp > 1e9 ? exp * 1000 : Date.now() + 3_600_000,
  };
  return cachedToken.value;
}

/** Authorized request; on 401/403 drops the token and retries once, as QPay recommends. */
async function qpayRequest(path: string, init: RequestInit, retried = false): Promise<Response> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if ((res.status === 401 || res.status === 403) && !retried) {
    cachedToken = null;
    return qpayRequest(path, init, true);
  }
  return res;
}

export type QPayBankLink = { name: string; description: string; logo: string; link: string };

export type QPayInvoice = {
  invoiceId: string;
  qrText: string | null;
  qrImage: string | null;
  shortUrl: string | null;
  urls: QPayBankLink[];
};

const str = (v: unknown) => (typeof v === "string" && v.length > 0 ? v : null);

export async function createInvoice(input: {
  senderInvoiceNo: string;
  receiverCode: string;
  description: string;
  amount: number;
  callbackUrl: string;
}): Promise<QPayInvoice> {
  const res = await qpayRequest("/v2/invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      invoice_code: INVOICE_CODE,
      sender_invoice_no: input.senderInvoiceNo,
      invoice_receiver_code: input.receiverCode,
      invoice_description: input.description,
      amount: input.amount,
      callback_url: input.callbackUrl,
    }),
  });
  if (!res.ok) throw new QPayError(`QPay invoice failed (${res.status})`, res.status);

  const data = (await res.json()) as Record<string, unknown>;
  const invoiceId = str(data.invoice_id);
  if (!invoiceId) throw new QPayError("QPay invoice: no invoice_id");

  const urls = Array.isArray(data.urls)
    ? data.urls.flatMap((u: Record<string, unknown>) => {
        const link = str(u?.link);
        return link
          ? [
              {
                name: str(u.name) ?? "",
                description: str(u.description) ?? str(u.name) ?? "",
                logo: str(u.logo) ?? "",
                link,
              },
            ]
          : [];
      })
    : [];

  return {
    invoiceId,
    qrText: str(data.qr_text),
    qrImage: str(data.qr_image),
    shortUrl: str(data.qPay_shortUrl),
    urls,
  };
}

export type PaymentCheck = { paid: boolean; paidAmount: number; paymentId: string | null };

/** Asks QPay whether the invoice has been paid. Never trust a callback alone. */
export async function checkInvoicePayment(invoiceId: string): Promise<PaymentCheck> {
  const res = await qpayRequest("/v2/payment/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: invoiceId,
      offset: { page_number: 1, page_limit: 100 },
    }),
  });
  if (!res.ok) throw new QPayError(`QPay payment check failed (${res.status})`, res.status);

  const data = (await res.json()) as { rows?: unknown; paid_amount?: unknown };
  const rows = Array.isArray(data.rows) ? (data.rows as Record<string, unknown>[]) : [];
  const paidRows = rows.filter((r) => r?.payment_status === "PAID");
  const rowsTotal = paidRows.reduce((sum, r) => sum + (Number(r.payment_amount) || 0), 0);
  const paidAmount = Math.max(rowsTotal, Number(data.paid_amount) || 0);
  return {
    paid: paidRows.length > 0,
    paidAmount,
    paymentId: paidRows[0] ? String(paidRows[0].payment_id ?? "") || null : null,
  };
}

/** Best-effort cancel of an unpaid invoice (e.g. after the seat hold expires). */
export async function cancelInvoice(invoiceId: string): Promise<void> {
  try {
    await qpayRequest(`/v2/invoice/${encodeURIComponent(invoiceId)}`, { method: "DELETE" });
  } catch {
    // The hold has already expired locally; a failed cancel is not fatal.
  }
}
