"use client";

import { type ReactNode, useState } from "react";
import { type Analysis, type Category, categoryLabels, type Timeframe } from "@/lib/content";
import { AnalysisCard } from "./analysis-card";
import { HighlightTitle } from "./brand";

const categories: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "Бүгд" },
  ...(Object.keys(categoryLabels) as Category[]).map((id) => ({ id, label: categoryLabels[id] })),
];

const timeframes: (Timeframe | "all")[] = ["all", "H1", "H4", "D1"];

const fieldClass =
  "min-h-11.5 rounded-[10px] border border-white/25 bg-mg-card px-3.5 text-[15px] text-white";

export function AnalysisBrowser({
  analyses,
  featuredId,
  featured,
  aside,
}: {
  analyses: Analysis[];
  featuredId: string;
  featured: ReactNode;
  aside: ReactNode;
}) {
  const [category, setCategory] = useState<Category | "all">("all");
  const [timeframe, setTimeframe] = useState<Timeframe | "all">("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toUpperCase();
  const filtering = category !== "all" || timeframe !== "all" || q !== "";
  const results = analyses.filter(
    (a) =>
      (filtering || a.id !== featuredId) &&
      (category === "all" || a.category === category) &&
      (timeframe === "all" || a.timeframe === timeframe) &&
      (q === "" || a.symbol.includes(q)),
  );

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-mg-navy px-4 pt-12 pb-14 text-white sm:px-[clamp(16px,4vw,64px)]">
        <div
          aria-hidden="true"
          className="absolute top-0 -right-25 h-full w-160 bg-linear-to-r from-mg-blue/0 to-mg-blue/60 [clip-path:polygon(50%_0,100%_0,50%_100%,0_100%)]"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-7">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <HighlightTitle
              as="h1"
              className="text-[clamp(34px,5vw,68px)]"
              lines={[
                { text: "Өдрийн", className: "bg-white text-mg-navy" },
                { text: "шинжилгээ", className: "bg-mg-blue text-white", indent: true },
              ]}
            />
            <p className="m-0 max-w-105 text-[17px] text-white/80 leading-relaxed">
              Валютын хос, алт, индексийн өдөр тутмын техник шинжилгээ. Боловсролын зорилготой.
            </p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
              <legend className="sr-only">Ангилал</legend>
              {categories.map((c) => {
                const on = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setCategory(c.id)}
                    className={`min-h-11 cursor-pointer rounded-full border px-4.5 font-semibold text-[15px] transition ${
                      on
                        ? "border-white bg-white text-mg-navy"
                        : "border-white/30 bg-transparent text-white hover:border-white"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </fieldset>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="analysis-search" className="text-[13px] text-mg-on-dark-muted">
                  Хайх
                </label>
                <input
                  id="analysis-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Хос, жишээ нь GBPJPY"
                  className={`w-65 max-w-full placeholder:text-[#7D89A3] ${fieldClass}`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="analysis-tf" className="text-[13px] text-mg-on-dark-muted">
                  Цагийн хүрээ
                </label>
                <select
                  id="analysis-tf"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as Timeframe | "all")}
                  className={fieldClass}
                >
                  {timeframes.map((t) => (
                    <option key={t} value={t}>
                      {t === "all" ? "Бүгд" : t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex-1 bg-mg-surface px-4 pt-12 pb-24 sm:px-[clamp(16px,4vw,64px)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-8">
          <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-8">
            {!filtering && featured}

            <div className="flex items-baseline justify-between gap-4">
              <h2 className="m-0 font-extrabold text-[26px] uppercase">
                {filtering ? "Хайлтын үр дүн" : "Сүүлийн шинжилгээ"}
              </h2>
              <span aria-live="polite" className="text-mg-muted text-sm">
                {results.length} нийтлэл
              </span>
            </div>

            {results.length > 0 ? (
              <div className="flex flex-wrap gap-5">
                {results.map((a) => (
                  <AnalysisCard key={a.id} analysis={a} tone="light" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-[20px] border border-mg-line bg-white p-8">
                <p className="m-0 font-bold text-lg">Илэрц олдсонгүй</p>
                <p className="m-0 text-mg-body">
                  Шүүлтүүрээ өөрчилж эсвэл цэвэрлээд дахин үзнэ үү.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCategory("all");
                    setTimeframe("all");
                    setQuery("");
                  }}
                  className="min-h-11 cursor-pointer rounded-[10px] border border-mg-blue bg-white px-4.5 font-semibold text-mg-link"
                >
                  Шүүлтүүр цэвэрлэх
                </button>
              </div>
            )}
          </div>

          {aside}
        </div>
      </div>
    </main>
  );
}
