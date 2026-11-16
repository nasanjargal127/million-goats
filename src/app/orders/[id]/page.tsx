import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { Suspense } from "react";
import { HoldCountdown, OrderStatusPoller } from "@/components/order-live";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/auth";
import { getOrderForUser } from "@/lib/booking";
import { formatEventDate, formatMnt } from "@/lib/format";
import type { QPayBankLink } from "@/lib/qpay";
import { site } from "@/lib/site";

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

  const order = await getOrderForUser(id, session.user.id);
  if (!order) notFound();

  const summary = (
    <div className="flex flex-col gap-4 rounded-[20px] border border-mg-line bg-white p-6">
      <div className="flex flex-col gap-1">
        <span className="text-mg-muted text-sm">{formatEventDate(order.event.startsAt)}</span>
        <h2 className="m-0 font-bold text-xl">{order.event.title}</h2>
        <span className="text-mg-muted text-sm">{order.event.venue}</span>
      </div>
      <SeatChips labels={order.seatLabels} />
      <div className="flex items-center justify-between border-mg-line border-t pt-4">
        <span className="text-mg-body">Нийт дүн</span>
        <span className="font-bold text-2xl">{formatMnt(order.amountMnt)}</span>
      </div>
    </div>
  );

  if (order.status === "PAID") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start gap-4 rounded-[20px] bg-mg-navy p-8 text-white">
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
          <h1 className="m-0 font-black text-[clamp(28px,4vw,44px)] uppercase leading-tight">
            Суудал баталгаажлаа
          </h1>
          <p className="m-0 text-white/80">
            Төлбөр амжилттай. Эвентийн өдөр бүртгэлийн имэйл болон суудлын дугаараа хэлээрэй.
          </p>
        </div>
        {summary}
        <Link href="/account" className="self-start font-semibold text-mg-link hover:text-mg-navy">
          Миний захиалгууд →
        </Link>
      </div>
    );
  }

  if (order.status !== "PENDING") {
    const message =
      order.status === "REFUND_REQUIRED"
        ? `Төлбөр орж ирсэн ч суудлын хугацаа дууссан тул өөр хүнд шилжсэн байна. Буцаан олголтын талаар ${site.contact.email} хаягаар холбогдоно уу.`
        : order.status === "EXPIRED"
          ? "Төлбөрийн хугацаа дууссан тул суудлууд чөлөөлөгдлөө."
          : "Захиалга цуцлагдсан.";
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-[20px] border border-mg-line bg-white p-8">
          <h1 className="m-0 font-black text-3xl uppercase">
            {order.status === "REFUND_REQUIRED" ? "Анхааруулга" : "Захиалга идэвхгүй"}
          </h1>
          <p className="m-0 text-mg-body">{message}</p>
        </div>
        {summary}
        <Link
          href={`/events/${order.event.slug}`}
          className="inline-flex min-h-12 items-center self-start rounded-[10px] bg-mg-blue px-5 font-semibold text-white"
        >
          Дахин суудал сонгох
        </Link>
      </div>
    );
  }

  const src = await qrSrc(order.qpayQrImage, order.qpayQrText);
  const banks = (Array.isArray(order.qpayUrls) ? order.qpayUrls : []) as QPayBankLink[];

  return (
    <div className="flex flex-wrap gap-6">
      <OrderStatusPoller orderId={order.id} />
      <section className="flex min-w-0 flex-[1_1_360px] flex-col items-center gap-5 rounded-[20px] bg-mg-navy p-6 text-white sm:p-8">
        <div className="flex w-full items-center justify-between gap-4">
          <h1 className="m-0 font-black text-2xl uppercase">QPay-ээр төлөх</h1>
          <span className="rounded-full bg-white/10 px-3 py-1.5 font-semibold text-sm">
            <HoldCountdown expiresAt={order.expiresAt.toISOString()} />
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
        <p className="m-0 text-center text-mg-on-dark text-sm leading-relaxed">
          Банкны апп эсвэл QPay-ээр QR кодыг уншуулна уу. Төлбөр орсны дараа энэ хуудас автоматаар
          шинэчлэгдэнэ.
        </p>
        {order.qpayShortUrl && (
          <a
            href={order.qpayShortUrl}
            className="inline-flex min-h-12 items-center rounded-xl bg-mg-blue px-6 font-semibold text-white"
          >
            QPay холбоос нээх
          </a>
        )}
      </section>

      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
        {summary}
        {banks.length > 0 && (
          <section className="flex flex-col gap-3 rounded-[20px] border border-mg-line bg-white p-6 md:hidden">
            <h2 className="m-0 font-bold text-lg">Банкны аппаар төлөх</h2>
            <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0">
              {banks.map((b) => (
                <li key={b.link}>
                  <a
                    href={b.link}
                    className="flex min-h-12 items-center justify-center rounded-xl border border-mg-line px-3 text-center font-medium text-sm hover:border-mg-blue"
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
          <Suspense fallback={<div className="h-96 animate-pulse rounded-[20px] bg-white" />}>
            <OrderView params={params} />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
