import "server-only";
import { prisma } from "./db";
import { emailConfigured, escapeHtml, sendEmail } from "./email";
import { formatMnt } from "./format";
import { INSTALLMENT_DUE_TEXT } from "./lab/packages";
import { site } from "./site";

// Emails for Premium installment orders: one when the first part is paid, and
// reminders before the balance is due. Each is recorded on the order before it
// is sent (and un-recorded if sending fails), so it goes out once.

const DAY_MS = 24 * 60 * 60_000;

/** Reminder stages: a week before the balance is due, then on the last day. */
const REMINDERS = [
  { stage: 1, withinMs: 7 * DAY_MS },
  { stage: 2, withinMs: DAY_MS },
] as const;

type InstallmentOrder = {
  id: string;
  amountMnt: number;
  depositMnt: number | null;
  seatLabels: string[];
  user: { name: string; email: string };
  event: { title: string } | null;
};

const orderInclude = {
  user: { select: { name: true, email: true } },
  event: { select: { title: true } },
} as const;

function letter(order: InstallmentOrder, kind: "deposit" | 1 | 2) {
  const balance = formatMnt(order.amountMnt - (order.depositMnt ?? 0));
  const due = INSTALLMENT_DUE_TEXT.mn.balance;
  const url = `${site.url}/orders/${order.id}`;
  const what = `${order.event?.title ?? "Trading Lab"} · Premium · суудал ${order.seatLabels.join(", ")}`;
  const greeting = order.user.name ? `Сайн байна уу, ${order.user.name}!` : "Сайн байна уу!";

  const { subject, lead } =
    kind === "deposit"
      ? {
          subject: "Эхний төлөлт орлоо — үлдэгдлээ 1-р сарын 1-ээс өмнө төлнө үү",
          lead: `Таны эхний төлөлт ${formatMnt(order.depositMnt ?? 0)} амжилттай орлоо. Суудал таны нэр дээр хадгалагдаж байна.`,
        }
      : kind === 1
        ? {
            subject: "Үлдэгдэл төлөх хугацаа 7 хоног үлдлээ",
            lead: "Premium багцын үлдэгдэл төлөх хугацаа дуусахад 7 хоног үлдлээ.",
          }
        : {
            subject: "Өнөөдөр үлдэгдэл төлөх сүүлийн өдөр",
            lead: "Premium багцын үлдэгдэл төлөх сүүлийн өдөр өнөөдөр.",
          };
  const ask = `Үлдэгдэл ${balance}-ийг ${due} төлж суудлаа баталгаажуулна уу. Хугацаандаа төлөөгүй бол суудал чөлөөлөгдөж, эхний төлбөр буцаагдахгүй.`;

  const text = [
    greeting,
    "",
    lead,
    what,
    "",
    ask,
    "",
    `Үлдэгдэл төлөх: ${url}`,
    "",
    site.name,
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#010D26">
<p>${escapeHtml(greeting)}</p>
<p>${escapeHtml(lead)}<br><span style="color:#4A5670">${escapeHtml(what)}</span></p>
<p>${escapeHtml(ask)}</p>
<p><a href="${escapeHtml(url)}" style="display:inline-block;background:#FF3600;color:#010D26;font-weight:bold;padding:12px 24px;border-radius:10px;text-decoration:none">Үлдэгдэл ${escapeHtml(balance)} төлөх</a></p>
<p style="color:#4A5670">${escapeHtml(site.name)}</p>
</div>`;
  return { subject, html, text };
}

/**
 * Sends the "first part received" email once. Never throws: a payment must not
 * fail because of an email. If it cannot be sent now, the daily reminder run
 * tries again.
 */
export async function sendDepositEmail(orderId: string) {
  if (!emailConfigured) return;
  try {
    const claimed = await prisma.order.updateMany({
      where: { id: orderId, status: "DEPOSIT_PAID", depositEmailSentAt: null },
      data: { depositEmailSentAt: new Date() },
    });
    if (claimed.count === 0) return;
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: orderInclude,
    });
    try {
      await sendEmail({
        to: order.user.email,
        ...letter(order, "deposit"),
        idempotencyKey: `deposit-${order.id}`,
      });
    } catch (error) {
      await prisma.order.update({ where: { id: orderId }, data: { depositEmailSentAt: null } });
      throw error;
    }
  } catch (error) {
    console.error(`Could not send the deposit email for order ${orderId}`, error);
  }
}

/**
 * Daily: emails everyone whose balance is still due — a week before the
 * deadline and on the last day — and sends any missed deposit emails.
 */
export async function sendBalanceReminders(now = new Date()) {
  if (!emailConfigured) {
    console.warn("WESEND_API_KEY is not set: balance reminders were not sent.");
    return { sent: 0, failed: 0, skipped: true };
  }
  const due = await prisma.order.findMany({
    where: { status: "DEPOSIT_PAID", balanceDueAt: { gt: now } },
    include: orderInclude,
    take: 500,
  });

  let sent = 0;
  let failed = 0;
  for (const order of due) {
    if (!order.depositEmailSentAt) await sendDepositEmail(order.id);

    const left = (order.balanceDueAt?.getTime() ?? 0) - now.getTime();
    const stage = REMINDERS.filter((r) => left <= r.withinMs).at(-1)?.stage;
    if (stage === undefined || stage <= order.balanceRemindersSent) continue;

    const claimed = await prisma.order.updateMany({
      where: { id: order.id, balanceRemindersSent: order.balanceRemindersSent },
      data: { balanceRemindersSent: stage },
    });
    if (claimed.count === 0) continue;
    try {
      await sendEmail({
        to: order.user.email,
        ...letter(order, stage),
        idempotencyKey: `balance-${order.id}-${stage}`,
      });
      sent += 1;
    } catch (error) {
      console.error(`Could not send balance reminder ${stage} for order ${order.id}`, error);
      await prisma.order.update({
        where: { id: order.id },
        data: { balanceRemindersSent: order.balanceRemindersSent },
      });
      failed += 1;
    }
  }
  return { sent, failed, skipped: false };
}
