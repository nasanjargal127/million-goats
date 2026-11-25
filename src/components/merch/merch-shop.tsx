"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { formatMnt } from "@/lib/format";
import { designLabel, MERCH_DESIGNS, type MerchDesign } from "@/lib/merch-shirt";
import { MerchForm } from "../merch-form";
import { ShirtViewer } from "./shirt-viewer";

type Variant = { id: string; design: string; size: string };

/** The /merch shop: pick a design, see it in 3D, then pick a size and pay. */
export function MerchShop({
  name,
  priceMnt,
  variants,
  maxQuantity,
  holdMinutes,
  signedIn,
  children,
}: {
  name: string;
  priceMnt: number;
  variants: Variant[];
  maxQuantity: number;
  holdMinutes: number;
  signedIn: boolean;
  /** Shown under the design picker, e.g. the bonus note. */
  children?: ReactNode;
}) {
  // Only designs that have sizes on sale.
  const designs: MerchDesign[] = MERCH_DESIGNS.filter((d) =>
    variants.some((v) => v.design === d.key),
  );
  const [designKey, setDesignKey] = useState<string>(designs[0]?.key ?? "");
  const design = designs.find((d) => d.key === designKey) ?? designs[0];
  if (!design) return null;

  const sizes = variants
    .filter((v) => v.design === design.key)
    .map((v) => ({ id: v.id, size: v.size }));

  return (
    <div className="flex flex-wrap items-start gap-10">
      <Reveal
        from="left"
        className="min-w-0 flex-[1_1_520px] overflow-hidden rounded-2xl bg-mg-card ring-1 ring-white/5"
      >
        <ShirtViewer
          mockup={design.mockup}
          alt={`${name} — ${designLabel(design)}, урд болон ар тал`}
        />
      </Reveal>
      <Reveal from="right" delay={0.1} className="flex min-w-0 flex-[1_1_380px] flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="m-0 font-bold text-[clamp(28px,3vw,40px)] uppercase leading-tight tracking-[-0.01em]">
            {name}
          </h2>
          <p className="m-0 font-bold text-3xl text-mg-sky">{formatMnt(priceMnt)}</p>
        </div>

        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="mb-3 font-semibold text-sm text-white/85">
            Загвар: <span className="text-white">{designLabel(design)}</span>
          </legend>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
            {designs.map((d) => (
              <label key={d.key} className="cursor-pointer">
                <input
                  type="radio"
                  name="design"
                  value={d.key}
                  checked={d.key === design.key}
                  onChange={() => setDesignKey(d.key)}
                  aria-label={designLabel(d)}
                  className="peer sr-only"
                />
                <span className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-mg-card transition hover:border-mg-blue/60 peer-checked:border-mg-blue peer-checked:shadow-[0_8px_24px_rgba(0,104,255,0.35)] peer-focus-visible:outline-2 peer-focus-visible:outline-mg-sky">
                  {/* The back carries each design's print, so the tile shows that half. */}
                  <Image
                    src={d.mockup.src}
                    alt=""
                    width={d.mockup.width}
                    height={d.mockup.height}
                    sizes="200px"
                    className="aspect-square w-full object-cover object-right p-1"
                  />
                  <span className="px-2 pb-2 text-center text-[11px] text-white/80 leading-tight">
                    <span className="block font-semibold text-white">{d.name}</span>
                    {d.color}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="m-0 text-sm text-white/70 leading-relaxed">{design.blurb}</p>
        </fieldset>

        {children}

        <MerchForm
          sizes={sizes}
          priceMnt={priceMnt}
          maxQuantity={maxQuantity}
          holdMinutes={holdMinutes}
          signedIn={signedIn}
        />
      </Reveal>
    </div>
  );
}
