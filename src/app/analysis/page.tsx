import type { Metadata } from "next";
import Link from "next/link";
import { AnalysisBrowser } from "@/components/analysis-browser";
import { BiasTag } from "@/components/bias-tag";
import { HighlightTitle, LiveDot } from "@/components/brand";
import { CandleChart } from "@/components/charts";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { analyses, liveSessions } from "@/lib/content";

export const metadata: Metadata = {
  title: "Өдрийн шинжилгээ",
  description:
    "Million Goats — валютын хос, алт, индексийн өдөр тутмын техник шинжилгээ. Боловсролын зорилготой.",
  alternates: { canonical: "/analysis" },
};

const featured = analyses[0];

function Featured() {
  return (
    <article
      id={featured.id}
      className="relative flex scroll-mt-6 flex-col gap-5 overflow-hidden rounded-3xl bg-linear-160 from-[#0B3FA8] to-mg-blue p-6 text-white sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-white px-2.5 py-1.5 font-bold text-mg-navy text-xs uppercase tracking-[0.08em]">
            Онцлох
          </span>
          <BiasTag bias={featured.bias} tone="solid" />
        </div>
        <span className="text-[#DCE9FF] text-sm">
          {featured.date} · {featured.timeframe} · Niju Trader
        </span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="m-0 font-medium text-[clamp(48px,6vw,80px)] leading-none tracking-tight">
          {featured.symbol}
        </h2>
        <p className="m-0 font-medium text-2xl">
          daily chart <span className="text-[#A9CCFF] text-sm">“analysis”</span>
        </p>
      </div>
      <div className="rounded-2xl bg-mg-navy/35 p-4">
        <CandleChart label={`${featured.symbol} лааны графикийн жишээ`} levels />
        <div className="mt-3 flex flex-wrap gap-4 text-[13px]">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="w-4.5 border-mg-orange border-t-2 border-dashed" />
            Эсэргүүцэл [ТҮВШИН]
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="w-4.5 border-mg-mint border-t-2 border-dashed" />
            Дэмжлэг [ТҮВШИН]
          </span>
        </div>
      </div>
      <p className="m-0 max-w-180 text-[#EAF2FF] text-[17px] leading-relaxed">
        Үнэ дэмжлэгийн бүсээс эргэн өсөж, өндөр оргилуудыг шинэчилсээр байна. Эсэргүүцлийн түвшинд
        ойртох үед хариу үйлдлийг ажиглана.
      </p>
    </article>
  );
}

function Aside() {
  return (
    <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-5">
      <section className="flex flex-col gap-4 rounded-[20px] bg-mg-navy p-6 text-white">
        <h2 className="m-0 flex items-center gap-2.5 font-extrabold text-lg uppercase">
          <LiveDot className="size-2.5 bg-mg-orange" />
          Live хуваарь
        </h2>
        {liveSessions.slice(0, 2).map((s) => (
          <div key={s.title} className="flex flex-col gap-1 border-white/10 border-t py-3.5">
            <span className="text-[13px] text-mg-sky">{s.meta.split(" · ")[0]}</span>
            <span className="font-semibold text-base">{s.title}</span>
          </div>
        ))}
        <Link
          href="/#live"
          className="rounded-[10px] bg-mg-blue p-3.5 text-center font-semibold text-[15px] text-white transition hover:brightness-110"
        >
          Бүх хуваарь
        </Link>
      </section>

      <section className="relative flex flex-col gap-4 overflow-hidden rounded-[20px] bg-mg-blue px-6 py-7 text-white">
        <div
          aria-hidden="true"
          className="absolute -right-10 -bottom-2.5 h-27.5 w-55 bg-linear-to-r from-mg-orange/20 to-mg-orange [clip-path:polygon(0_0,55%_0,100%_100%,45%_100%)]"
        />
        <HighlightTitle
          as="p"
          className="relative text-[28px]"
          lines={[
            { text: "Traders", className: "bg-white text-mg-navy" },
            { text: "Dept.", className: "ml-6 bg-white text-mg-navy" },
          ]}
        />
        <p className="relative m-0 text-[15px] leading-normal">
          Шинэ шинжилгээ гарах бүрт мэдэгдэл аваарай.
        </p>
        <Link
          href="/#join"
          className="relative self-start rounded-[10px] bg-mg-navy px-5 py-3.5 font-semibold text-[15px] text-white"
        >
          Хамт олонд нэгдэх
        </Link>
      </section>

      <section className="flex gap-3 rounded-[20px] border border-mg-line bg-white px-6 py-5">
        <svg
          aria-hidden="true"
          className="mt-0.5 size-5.5 flex-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D42D00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l10 18H2L12 3z" />
          <path d="M12 10v5" />
          <path d="M12 18v.01" />
        </svg>
        <p className="m-0 text-[13px] text-mg-body leading-normal">
          <strong className="text-mg-navy">Эрсдэлийн анхааруулга.</strong> Шинжилгээ нь боловсролын
          зорилготой бөгөөд хөрөнгө оруулалтын зөвлөгөө биш. Арилжаа нь хөрөнгө алдах эрсдэлтэй.
        </p>
      </section>
    </aside>
  );
}

export default function AnalysisPage() {
  return (
    <>
      <SiteHeader current="/analysis" />
      <AnalysisBrowser
        analyses={analyses}
        featuredId={featured.id}
        featured={<Featured />}
        aside={<Aside />}
      />
      <SiteFooter />
    </>
  );
}
