import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";
import { SectionTitle } from "@/components/brand";
import { JsonLd } from "@/components/json-ld";
import { MerchShop } from "@/components/merch/merch-shop";
import { SectionGoat } from "@/components/motion/goat-backdrop";
import { Reveal } from "@/components/motion/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/auth";
import { HOLD_MINUTES } from "@/lib/booking";
import { getProduct, MAX_MERCH_QUANTITY, MERCH_SLUG } from "@/lib/merch";
import { MERCH_DESIGNS } from "@/lib/merch-shirt";
import { ORGANIZATION_ID, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/merch",
  title: "Merch — албан ёсны футболкнууд",
  socialTitle: "Million Goats Merch",
  description:
    "Million Goats-ын албан ёсны футболкнууд — хар, цагаан өнгөөр хэд хэдэн загвартай. Загвар, хэмжээгээ сонгоод QPay-ээр төлөөрэй — худалдан авалт бүрд амралтын өдрийн лекцийн эрх.",
});

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
      <p className="m-0 rounded-2xl bg-mg-card p-8 text-center text-white/70 ring-1 ring-white/5">
        Merch удахгүй худалдаанд гарна.
      </p>
    );
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: MERCH_DESIGNS.map((d) => `${site.url}${d.mockup.src}`),
    brand: { "@type": "Brand", name: site.name },
    sku: product.slug,
    offers: {
      "@type": "Offer",
      url: `${site.url}/merch`,
      price: product.priceMnt,
      priceCurrency: "MNT",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORGANIZATION_ID },
    },
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <MerchShop
        name={product.name}
        priceMnt={product.priceMnt}
        variants={product.variants.map((v) => ({ id: v.id, design: v.design, size: v.size }))}
        maxQuantity={MAX_MERCH_QUANTITY}
        holdMinutes={HOLD_MINUTES}
        signedIn={Boolean(session)}
      >
        <div className="flex items-start gap-3 rounded-xl border border-mg-blue/50 bg-mg-blue/10 p-4 shadow-[0_0_32px_rgba(0,104,255,0.18)]">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-mg-blue text-white">
            <GiftIcon />
          </span>
          <p className="m-0 leading-snug">
            <span className="block font-bold">Бонус: Амралтын өдрийн лекц</span>
            <span className="text-sm text-white/70">
              Манай merch-ийг худалдаж авбал амралтын өдрийн лекцэнд суух эрх нэмэгдэнэ.
            </span>
          </p>
        </div>
      </MerchShop>
    </>
  );
}

export default function MerchPage() {
  return (
    <>
      <SiteHeader current="/merch" />
      {/* One navy run with the goat drawn behind it, like the home page */}
      <main className="relative isolate flex flex-1 flex-col bg-mg-navy text-white">
        <SectionGoat align="center" />

        <section className="px-4 pt-20 pb-14 sm:px-[clamp(16px,4vw,64px)] lg:pt-28">
          <Reveal className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <span className="rounded-full bg-mg-blue px-3 py-1 font-semibold text-white text-xs">
              Merch
            </span>
            <SectionTitle
              as="h1"
              lines={["Million Goats"]}
              dot={false}
              size="text-[clamp(34px,5vw,68px)]"
              className="mt-5"
            />
            <p className="m-0 mt-8 max-w-140 text-[15px] text-white/85 leading-relaxed">
              Million Goats-ын албан ёсны merch. Загвар, хэмжээгээ сонгоод QPay-ээр төлөөрэй.
            </p>
          </Reveal>
        </section>

        <section className="relative flex-1 overflow-hidden px-4 pb-[clamp(140px,30vw,420px)] sm:px-[clamp(16px,4vw,64px)]">
          {/* A floor of logo coins under the shop, fading into the footer */}
          <Image
            src="/brand/3d/coins.webp"
            alt=""
            width={1920}
            height={820}
            sizes="100vw"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-auto w-full opacity-55 [mask-image:linear-gradient(to_bottom,transparent,#000_35%,#000_80%,transparent)]"
          />
          <div className="relative mx-auto max-w-6xl">
            <Suspense fallback={<div className="h-120 animate-pulse rounded-2xl bg-mg-card" />}>
              <Shop />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
