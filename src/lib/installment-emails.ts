import "server-only";
import { prisma } from "./db";
import { emailConfigured, escapeHtml, sendEmail } from "./email";
import { formatMnt } from "./format";
import { dueText } from "./lab/packages";
import { installmentCount, invoicePartMnt, partsPaidBeforeLast } from "./sales";
import { site } from "./site";

// Emails for Premium installment orders: one when each part but the last is
// paid, and reminders before the next part is due. Each is recorded on the order before it
// is sent (and un-recorded if sending fails), so it goes out once.

const DAY_MS = 24 * 60 * 60_000;

/** Reminder stages: a week before the next part is due, then on the last day. */
const REMINDERS = [
  { stage: 1, withinMs: 7 * DAY_MS },
  { stage: 2, withinMs: DAY_MS },
] as const;

type InstallmentOrder = {
  id: string;
  amountMnt: number;
  depositMnt: number | null;
  depositPaidAt: Date | null;
  installmentCount: number | null;
  partsPaid: number;
  balanceDueAt: Date | null;
  seatLabels: string[];
  user: { name: string; email: string };
  event: { title: string } | null;
};

const orderInclude = {
  user: { select: { name: true, email: true } },
  event: { select: { title: true } },
} as const;

/** "Үлдэгдэл" for the second of two parts, else e.g. "3-р төлөлт". */
function partName(order: InstallmentOrder, part: number) {
  return installmentCount(order) === 2 ? "Үлдэгдэл" : `${part}-р төлөлт`;
}

function letter(order: InstallmentOrder, kind: "paid" | 1 | 2) {
  const paid = partsPaidBeforeLast(order);
  const next = partName(order, paid + 1);
  const amount = formatMnt(invoicePartMnt(order));
  const due = order.balanceDueAt ? dueText(order.balanceDueAt) : "";
  const url = `${site.url}/orders/${order.id}`;
  const what = `${order.event?.title ?? "Trading Lab"} · Premium · суудал ${order.seatLabels.join(", ")}`;
  const greeting = order.user.name ? `Сайн байна уу, ${order.user.name}!` : "Сайн байна уу!";

  const { subject, lead } =
    kind === "paid"
      ? {
          subject: `${paid === 1 ? "Эхний төлөлт" : `${paid}-р төлөлт`} орлоо — дараагийнхаа ${due} төлнө үү`,
          lead: `Таны ${paid === 1 ? "эхний" : `${paid}-р`} төлөлт ${formatMnt(order.depositMnt ?? 0)} амжилттай орлоо. Суудал таны нэр дээр хадгалагдаж байна.`,
        }
      : kind === 1
        ? {
            subject: `${next} төлөх хугацаа 7 хоног үлдлээ`,
            lead: `Premium багцын ${next.toLowerCase()} төлөх хугацаа дуусахад 7 хоног үлдлээ.`,
          }
        : {
            subject: `Өнөөдөр ${next.toLowerCase()} төлөх сүүлийн өдөр`,
            lead: `Premium багцын ${next.toLowerCase()} төлөх сүүлийн өдөр өнөөдөр.`,
          };
  const ask = `${next} ${amount}-ийг ${due} төлж суудлаа баталгаажуулна уу. Хугацаандаа төлөөгүй бол суудал чөлөөлөгдөж, төлсөн төлбөр буцаагдахгүй.`;

  const text = [greeting, "", lead, what, "", ask, "", `${next} төлөх: ${url}`, "", site.name].join(
    "\n",
  );
  const html = `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#010D26">
<p>${escapeHtml(greeting)}</p>
<p>${escapeHtml(lead)}<br><span style="color:#4A5670">${escapeHtml(what)}</span></p>
<p>${escapeHtml(ask)}</p>
<p><a href="${escapeHtml(url)}" style="display:inline-block;background:#FF3600;color:#010D26;font-weight:bold;padding:12px 24px;border-radius:10px;text-decoration:none">${escapeHtml(next)} ${escapeHtml(amount)} төлөх</a></p>
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
        ...letter(order, "paid"),
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
 * Sends the "part received" email for a part after the first. Best effort: it
 * is not retried, but the reminders for the next part still go out.
 */
export async function sendPartEmail(orderId: string, part: number) {
  if (!emailConfigured) return;
  try {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: orderInclude,
    });
    if (order.status !== "DEPOSIT_PAID" || partsPaidBeforeLast(order) !== part) return;
    await sendEmail({
      to: order.user.email,
      ...letter(order, "paid"),
      idempotencyKey: `part-${order.id}-${part}`,
    });
  } catch (error) {
    console.error(`Could not send the part ${part} email for order ${orderId}`, error);
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
        idempotencyKey: `balance-${order.id}-${partsPaidBeforeLast(order) + 1}-${stage}`,
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
