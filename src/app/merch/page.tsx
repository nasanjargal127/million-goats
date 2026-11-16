import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { HighlightTitle } from "@/components/brand";
import { ShirtViewer } from "@/components/merch/shirt-viewer";
import { MerchForm } from "@/components/merch-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/auth";
import { HOLD_MINUTES } from "@/lib/booking";
import { formatMnt } from "@/lib/format";
import { getProduct, MAX_MERCH_QUANTITY, MERCH_SLUG } from "@/lib/merch";

export const metadata: Metadata = {
  title: "Merch",
  description: "Million Goats “Traders Dept.” футболк. Хэмжээгээ сонгоод QPay-ээр төлөөрэй.",
  alternates: { canonical: "/merch" },
};

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
      <div className="min-w-0 flex-[1_1_520px] overflow-hidden rounded-3xl border border-mg-line bg-white">
        <ShirtViewer alt={`${product.name} — урд болон ар тал`} />
      </div>
      <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="m-0 font-black text-[clamp(28px,3vw,40px)] uppercase leading-tight">
            {product.name}
          </h2>
          <p className="m-0 font-bold text-3xl text-mg-link">{formatMnt(product.priceMnt)}</p>
          <p className="m-0 text-mg-body leading-relaxed">{product.description}</p>
        </div>
        <MerchForm
          sizes={product.variants.map((v) => ({ id: v.id, size: v.size }))}
          priceMnt={product.priceMnt}
          maxQuantity={MAX_MERCH_QUANTITY}
          holdMinutes={HOLD_MINUTES}
          signedIn={Boolean(session)}
        />
      </div>
    </div>
  );
}

export default function MerchPage() {
  return (
    <>
      <SiteHeader current="/merch" />
      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden bg-mg-navy px-4 py-14 text-white sm:px-[clamp(16px,4vw,64px)]">
          <div
            aria-hidden="true"
            className="absolute top-0 -right-25 h-full w-160 bg-linear-to-r from-mg-blue/0 to-mg-blue/60 [clip-path:polygon(50%_0,100%_0,50%_100%,0_100%)]"
          />
          <div className="relative mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6">
            <HighlightTitle
              as="h1"
              className="text-[clamp(34px,5vw,68px)]"
              lines={[
                { text: "Traders", className: "bg-white text-mg-navy" },
                { text: "Dept.", className: "bg-mg-blue text-white", indent: true },
              ]}
            />
            <p className="m-0 max-w-105 text-[17px] text-white/80 leading-relaxed">
              Million Goats-ын албан ёсны merch. Хэмжээгээ сонгоод QPay-ээр төлөөрэй.
            </p>
          </div>
        </section>
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
