import Link from "next/link";
import { type Analysis, categoryLabels } from "@/lib/content";
import { BiasTag } from "./bias-tag";
import { Sparkline } from "./charts";

export function AnalysisCard({
  analysis: a,
  tone = "dark",
}: {
  analysis: Analysis;
  tone?: "dark" | "light";
}) {
  const dark = tone === "dark";
  return (
    <article
      id={a.id}
      className={`flex min-w-0 scroll-mt-6 flex-[1_1_300px] flex-col gap-4 rounded-[20px] border p-6 transition-colors ${
        dark
          ? "border-mg-sky/20 bg-mg-card text-white"
          : "border-mg-line bg-white text-mg-navy hover:border-mg-blue"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`text-[13px] ${dark ? "text-mg-on-dark-muted" : "text-mg-muted"}`}>
          {dark ? a.date : categoryLabels[a.category]} · {a.timeframe}
        </span>
        <BiasTag bias={a.bias} tone={tone} short={!dark} />
      </div>
      <h3 className={`m-0 font-medium tracking-tight ${dark ? "text-[40px]" : "text-[34px]"}`}>
        {a.symbol}
      </h3>
      <Sparkline bias={a.bias} seed={a.seed} tone={tone} className={dark ? "h-24" : "h-20"} />
      <p className={`m-0 text-[15px] leading-relaxed ${dark ? "text-mg-on-dark" : "text-mg-body"}`}>
        {a.summary}
      </p>
      <div className="mt-auto flex items-center justify-between text-[13px]">
        {!dark && <span className="text-mg-muted">{a.date}</span>}
        <Link
          href={`/analysis#${a.id}`}
          className={`font-semibold text-[15px] ${dark ? "text-mg-sky hover:text-mg-mint" : "text-mg-link hover:text-mg-navy"}`}
        >
          Унших →
        </Link>
      </div>
    </article>
  );
}
