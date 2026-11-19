import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ShirtViewer } from "@/components/merch/shirt-viewer";
import { MerchForm } from "@/components/merch-form";
import { Reveal } from "@/components/motion/reveal";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/auth";
import { HOLD_MINUTES } from "@/lib/booking";
import { formatMnt } from "@/lib/format";
import { getProduct, MAX_MERCH_QUANTITY, MERCH_SLUG } from "@/lib/merch";

export const metadata: Metadata = {
  title: "Merch",
  description: "Million Goats хар футболк. Хэмжээгээ сонгоод QPay-ээр төлөөрэй.",
  alternates: { canonical: "/merch" },
};

function GiftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h18v4H3zM5 12v9h14v-9M12 8v13" />
      <path d="M12 8S10.5 3 7.5 3a2.5 2.5 0 0 0 0 5M12 8s1.5-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}

async function Shop() {
  await connection();
  const [product, session] = await Promise.all([getProduct(MERCH_SLUG), getSession()]);

  if (!product) {
    return (
      <p className="m-0 rounded-[20px] border border-mg-line bg-white p-8 text-mg-body">
        Merch удахгүй худалдаанд гарна.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-10">
      <Reveal
        from="left"
        className="min-w-0 flex-[1_1_520px] overflow-hidden rounded-3xl border border-mg-line bg-white"
      >
        <ShirtViewer alt={`${product.name} — урд болон ар тал`} />
      </Reveal>
      <Reveal from="right" delay={0.1} className="flex min-w-0 flex-[1_1_380px] flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="m-0 font-bold text-[clamp(28px,3vw,40px)] uppercase leading-tight">
            {product.name}
          </h2>
          <p className="m-0 font-bold text-3xl text-mg-link">{formatMnt(product.priceMnt)}</p>
          <p className="m-0 text-mg-body leading-relaxed">{product.description}</p>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-mg-blue/30 bg-mg-blue/5 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-mg-blue text-white">
            <GiftIcon />
          </span>
          <p className="m-0 text-mg-navy leading-snug">
            <span className="block font-bold">Бонус: Амралтын өдрийн лекц</span>
            <span className="text-mg-body text-sm">
              Манай merch-ийг худалдаж авбал амралтын өдрийн лекцэнд суух эрх нэмэгдэнэ.
            </span>
          </p>
        </div>
        <MerchForm
          sizes={product.variants.map((v) => ({ id: v.id, size: v.size }))}
          priceMnt={product.priceMnt}
          maxQuantity={MAX_MERCH_QUANTITY}
          holdMinutes={HOLD_MINUTES}
          signedIn={Boolean(session)}
        />
      </Reveal>
    </div>
  );
}

export default function MerchPage() {
  return (
    <>
      <SiteHeader current="/merch" />
      <main className="flex flex-1 flex-col">
        <PageHero
          title={["Million", "Goats"]}
          aside={
            <p className="m-0 max-w-105 text-[17px] text-white/80 leading-relaxed">
              Million Goats-ын албан ёсны merch. Хэмжээгээ сонгоод QPay-ээр төлөөрэй.
            </p>
          }
        />
        <div className="flex-1 bg-mg-surface px-4 py-12 sm:px-[clamp(16px,4vw,64px)]">
          <div className="mx-auto max-w-7xl">
            <Suspense fallback={<div className="h-120 animate-pulse rounded-3xl bg-white" />}>
              <Shop />
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
