import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { Suspense } from "react";
import { HoldCountdown, OrderStatusPoller, PayBalanceButton } from "@/components/order-live";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/auth";
import { getOrderForUser, syncOrder } from "@/lib/booking";
import { formatEventDate, formatMnt } from "@/lib/format";
import {
  dueText,
  type InstallmentParts,
  installmentDueAt,
  PREMIUM_INSTALLMENTS,
} from "@/lib/lab/packages";
import type { QPayBankLink } from "@/lib/qpay";
import { installmentCount, invoicePartMnt, partMnt, partsPaidBeforeLast } from "@/lib/sales";
import { site } from "@/lib/site";
import { payBalanceAction } from "./actions";

export const metadata: Metadata = {
  title: "Төлбөр",
  robots: { index: false },
};

async function qrSrc(qrImage: string | null, qrText: string | null) {
  if (qrImage) return qrImage.startsWith("data:") ? qrImage : `data:image/png;base64,${qrImage}`;
  if (qrText) return QRCode.toDataURL(qrText, { margin: 1, width: 560 });
  return null;
}

function SeatChips({ labels }: { labels: string[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
      {labels.map((l) => (
        <li key={l} className="rounded-lg bg-mg-navy px-3 py-1.5 font-bold text-sm text-white">
          {l}
        </li>
      ))}
    </ul>
  );
}

async function OrderView({ params }: { params: PageProps<"/orders/[id]">["params"] }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(`/orders/${id}`)}`);

  let order = await getOrderForUser(id, session.user.id);
  if (!order) notFound();
  // An overdue balance releases the seat: bring the order up to date first.
  if (order.status === "DEPOSIT_PAID" && order.balanceDueAt && order.balanceDueAt < new Date()) {
    await syncOrder(order.id);
    order = (await getOrderForUser(id, session.user.id)) ?? order;
  }

  const count = installmentCount(order);
  const paidParts = partsPaidBeforeLast(order);
  const balancePhase = paidParts > 0;
  const partPrice = invoicePartMnt(order);
  const nextName = count === 2 ? "Үлдэгдэл" : `${paidParts + 1}-р төлөлт`;
  const nextDue = order.balanceDueAt ? dueText(order.balanceDueAt) : "";
  // Every part with its price, whether it is paid and when it is due.
  const parts =
    count === null
      ? []
      : Array.from({ length: count }, (_, i) => {
          const part = i + 1;
          return {
            label: `${part}-р төлөлт`,
            amount: partMnt(order, part),
            paid: order.status === "PAID" || part <= paidParts,
            when:
              part === 1
                ? count === 2
                  ? dueText(PREMIUM_INSTALLMENTS.twoPartsOpenUntil)
                  : "захиалахдаа"
                : dueText(installmentDueAt(count as InstallmentParts, part, order.createdAt)),
          };
        });

  const merch = order.kind === "MERCH";
  const summary = (
    <div className="flex flex-col gap-4 rounded-xl border border-mg-line bg-white p-6">
      {merch ? (
        <div className="flex flex-col gap-3">
          <h2 className="m-0 font-bold text-xl">{order.itemLabel}</h2>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-mg-muted">Утас</dt>
            <dd className="m-0">{order.contactPhone}</dd>
          </dl>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-mg-muted text-sm">
              {formatEventDate(order.event?.startsAt ?? null)}
            </span>
            <h2 className="m-0 font-bold text-xl">{order.event?.title}</h2>
            <span className="text-mg-muted text-sm">{order.event?.venue}</span>
            {order.itemLabel && (
              <span className="mt-1 self-start rounded-full bg-mg-blue/10 px-3 py-1 font-semibold text-mg-link text-sm">
                {order.itemLabel}
              </span>
            )}
          </div>
          <SeatChips labels={order.seatLabels} />
        </>
      )}
      <div className="flex items-center justify-between border-mg-line border-t pt-4">
        <span className="text-mg-body">Нийт дүн</span>
        <span className="font-bold text-2xl">{formatMnt(order.amountMnt)}</span>
      </div>
      {parts.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
          {parts.map(({ label, amount, paid, when }) => (
            <li key={label} className="flex items-baseline justify-between gap-3">
              <span>
                {label}{" "}
                <span className={paid ? "font-semibold text-mg-mint-text" : "text-mg-muted"}>
                  · {paid ? "төлсөн" : when}
                </span>
              </span>
              <span className="font-semibold">{formatMnt(amount)}</span>
            </li>
          ))}
        </ul>
      )}
      {order.chargedMnt !== null && order.chargedMnt < partPrice && (
        <p className="m-0 rounded-xl bg-[#FFF4DB] px-4 py-3 font-medium text-[#8A5A00] text-sm">
          Тест горим: QPay-ээр {formatMnt(order.chargedMnt)} төлнө.
        </p>
      )}
    </div>
  );

  if (order.status === "PAID") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start gap-4 rounded-xl bg-mg-navy bg-[radial-gradient(ellipse_70%_90%_at_100%_100%,rgba(0,104,255,0.32),transparent_70%)] p-8 text-white">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-mg-mint">
            <svg
              aria-hidden="true"
              className="size-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#010D26"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
          <h1 className="m-0 font-bold text-[clamp(28px,4vw,44px)] uppercase leading-tight tracking-[-0.01em]">
            {merch ? "Захиалга баталгаажлаа" : "Суудал баталгаажлаа"}
          </h1>
          <p className="m-0 text-white/80">
            {merch
              ? `Төлбөр амжилттай. Захиалгын талаар ${order.contactPhone} дугаарт холбогдоно.`
              : "Төлбөр амжилттай. Суудал таны бүртгэл дээр баталгаажлаа."}
          </p>
        </div>
        {summary}
        <Link href="/account" className="self-start font-semibold text-mg-link hover:text-mg-navy">
          Миний захиалгууд →
        </Link>
      </div>
    );
  }

  if (order.status === "DEPOSIT_PAID" && !order.qpayInvoiceId) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start gap-4 rounded-xl bg-mg-navy bg-[radial-gradient(ellipse_70%_90%_at_100%_100%,rgba(0,104,255,0.32),transparent_70%)] p-8 text-white">
          <h1 className="m-0 font-bold text-[clamp(28px,4vw,44px)] uppercase leading-tight tracking-[-0.01em]">
            {paidParts === 1 ? "Эхний төлөлт орлоо" : `${paidParts}-р төлөлт орлоо`}
          </h1>
          <p className="m-0 text-white/80">
            Суудал таны нэр дээр хадгалагдаж байна. {nextName} {formatMnt(partPrice)}-ийг {nextDue}{" "}
            төлж баталгаажуулна уу. Хугацаандаа төлөөгүй бол суудал чөлөөлөгдөж, төлсөн төлбөр
            буцаагдахгүй.
          </p>
          <PayBalanceButton
            action={payBalanceAction.bind(null, order.id)}
            label={`${nextName} ${formatMnt(partPrice)} төлөх`}
          />
        </div>
        {summary}
        <Link href="/account" className="self-start font-semibold text-mg-link hover:text-mg-navy">
          Миний захиалгууд →
        </Link>
      </div>
    );
  }

  if (order.status !== "PENDING" && order.status !== "DEPOSIT_PAID") {
    const message =
      order.status === "REFUND_REQUIRED"
        ? `Төлбөр орж ирсэн ч хугацаа дууссан тул суудал өөр хүнд шилжсэн байна. Буцаан олголтын талаар ${site.contact.email} хаягаар холбогдоно уу.`
        : order.status === "BALANCE_UNPAID"
          ? `Үлдэгдэл хугацаандаа төлөгдөөгүй тул суудал чөлөөлөгдсөн. Асуух зүйл байвал ${site.contact.email} хаягаар холбогдоно уу.`
          : order.status === "EXPIRED"
            ? `Төлбөрийн хугацаа дууссан тул ${merch ? "захиалга цуцлагдлаа" : "суудлууд чөлөөлөгдлөө"}.`
            : "Захиалга цуцлагдсан.";
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-xl border border-mg-line bg-white p-8">
          <h1 className="m-0 font-bold text-3xl uppercase">
            {order.status === "REFUND_REQUIRED" ? "Анхааруулга" : "Захиалга идэвхгүй"}
          </h1>
          <p className="m-0 text-mg-body">{message}</p>
        </div>
        {summary}
        <Link
          href={merch ? "/merch" : "/lab"}
          className="inline-flex min-h-12 items-center self-start rounded-md bg-mg-blue px-5 font-semibold text-white transition hover:brightness-110"
        >
          {merch ? "Дахин захиалах" : "Дахин суудал сонгох"}
        </Link>
      </div>
    );
  }

  const src = await qrSrc(order.qpayQrImage, order.qpayQrText);
  const banks = (Array.isArray(order.qpayUrls) ? order.qpayUrls : []) as QPayBankLink[];

  return (
    <div className="flex flex-wrap gap-6">
      <OrderStatusPoller orderId={order.id} status={order.status} />
      <section className="relative isolate flex min-w-0 flex-[1_1_360px] flex-col items-center gap-5 overflow-hidden rounded-xl bg-mg-navy bg-[radial-gradient(ellipse_70%_90%_at_100%_100%,rgba(0,104,255,0.32),transparent_70%)] p-6 pb-[clamp(96px,14vw,150px)] text-white sm:p-8 sm:pb-[clamp(96px,14vw,150px)]">
        {/* A logo coin standing among others on the floor of the card */}
        <Image
          src="/brand/3d/coin.webp"
          alt=""
          width={1920}
          height={619}
          sizes="(min-width: 768px) 640px, 100vw"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-auto w-full opacity-70 [mask-image:linear-gradient(to_bottom,transparent,#000_40%)]"
        />
        <div className="flex w-full items-center justify-between gap-4">
          <h1 className="m-0 font-bold text-2xl uppercase">
            {count === null ? "QPay-ээр төлөх" : balancePhase ? `${nextName} төлөх` : "1-р төлөлт"}
          </h1>
          <span className="rounded-full bg-white/10 px-3 py-1.5 font-semibold text-sm">
            {balancePhase ? nextDue : <HoldCountdown expiresAt={order.expiresAt.toISOString()} />}
          </span>
        </div>
        {src ? (
          <Image
            src={src}
            alt="QPay төлбөрийн QR код"
            width={280}
            height={280}
            unoptimized
            className="rounded-2xl bg-white p-3"
          />
        ) : (
          <p className="m-0 text-mg-on-dark">QR код үүсгэж чадсангүй.</p>
        )}
        {count !== null && (
          <p className="m-0 font-bold text-3xl text-white">{formatMnt(partPrice)}</p>
        )}
        <p className="m-0 text-center text-mg-on-dark text-sm leading-relaxed">
          Банкны апп эсвэл QPay-ээр QR кодыг уншуулна уу. Төлбөр орсны дараа энэ хуудас автоматаар
          шинэчлэгдэнэ.
        </p>
        {order.qpayShortUrl && (
          <a
            href={order.qpayShortUrl}
            className="inline-flex min-h-12 items-center rounded-md bg-mg-blue px-6 font-semibold text-white transition hover:brightness-110"
          >
            QPay холбоос нээх
          </a>
        )}
      </section>

      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
        {summary}
        {banks.length > 0 && (
          <section className="flex flex-col gap-3 rounded-xl border border-mg-line bg-white p-6 md:hidden">
            <h2 className="m-0 font-bold text-lg">Банкны аппаар төлөх</h2>
            <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0">
              {banks.map((b) => (
                <li key={b.link}>
                  <a
                    href={b.link}
                    className="flex min-h-12 items-center justify-center rounded-md border border-mg-line px-3 text-center font-medium text-sm hover:border-mg-blue"
                  >
                    {b.description || b.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

export default function OrderPage({ params }: PageProps<"/orders/[id]">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-mg-surface px-4 py-12 sm:px-[clamp(16px,4vw,64px)]">
        <div className="mx-auto max-w-5xl">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-white" />}>
            <OrderView params={params} />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
