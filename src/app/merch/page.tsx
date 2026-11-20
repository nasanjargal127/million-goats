import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";
import { SectionTitle } from "@/components/brand";
import { JsonLd } from "@/components/json-ld";
import { ShirtViewer } from "@/components/merch/shirt-viewer";
import { MerchForm } from "@/components/merch-form";
import { SectionGoat } from "@/components/motion/goat-backdrop";
import { Reveal } from "@/components/motion/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/auth";
import { HOLD_MINUTES } from "@/lib/booking";
import { formatMnt } from "@/lib/format";
import { getProduct, MAX_MERCH_QUANTITY, MERCH_SLUG } from "@/lib/merch";
import { SHIRT_IMAGE } from "@/lib/merch-shirt";
import { ORGANIZATION_ID, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/merch",
  title: "Merch — албан ёсны футболк",
  socialTitle: "Million Goats Merch",
  description:
    "Million Goats-ын албан ёсны хар футболк. Хэмжээгээ сонгоод QPay-ээр төлөөрэй — худалдан авалт бүрд амралтын өдрийн лекцийн эрх.",
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
    image: `${site.url}${product.imagePath ?? SHIRT_IMAGE.src}`,
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
    <div className="flex flex-wrap items-start gap-10">
      <JsonLd data={productJsonLd} />
      <Reveal
        from="left"
        className="min-w-0 flex-[1_1_520px] overflow-hidden rounded-2xl bg-mg-card ring-1 ring-white/5"
      >
        <ShirtViewer alt={`${product.name} — урд болон ар тал`} />
      </Reveal>
      <Reveal from="right" delay={0.1} className="flex min-w-0 flex-[1_1_380px] flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="m-0 font-bold text-[clamp(28px,3vw,40px)] uppercase leading-tight tracking-[-0.01em]">
            {product.name}
          </h2>
          <p className="m-0 font-bold text-3xl text-mg-sky">{formatMnt(product.priceMnt)}</p>
          <p className="m-0 text-white/75 leading-relaxed">{product.description}</p>
        </div>
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
              Million Goats-ын албан ёсны merch. Хэмжээгээ сонгоод QPay-ээр төлөөрэй.
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
