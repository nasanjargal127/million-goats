import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { ArrowRight, HighlightTitle, LiveDot } from "../brand";
import { CandleChart } from "../charts";
import { Reveal } from "../motion/reveal";

const highlights = [
  { label: "Trading Lab", dot: "bg-mg-mint" },
  { label: "4 танхим · 100 суудал", dot: "bg-mg-sky" },
  { label: "QPay-ээр захиалга", dot: "bg-mg-orange" },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-mg-navy px-4 pt-10 pb-14 text-white sm:px-[clamp(16px,4vw,64px)] lg:pt-18 lg:pb-30"
    >
      {/* Brand shards */}
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-30 h-95 w-190 bg-linear-to-r from-mg-blue/0 via-mg-blue/55 to-mg-blue [clip-path:polygon(50%_0,100%_0,50%_100%,0_100%)] max-lg:-right-80 max-lg:h-52 max-lg:w-105"
      />
      <div
        aria-hidden="true"
        className="absolute top-85 -right-65 hidden h-95 w-190 bg-linear-to-r from-mg-orange/0 via-mg-orange/45 to-mg-orange [clip-path:polygon(0_0,50%_0,100%_100%,50%_100%)] lg:block"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-2.5 -left-30 h-50 w-155 bg-linear-to-r from-white/15 via-mg-sky/10 to-mg-sky/0 [clip-path:polygon(30%_0,100%_0,70%_100%,0_100%)]"
      />

      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center gap-10 lg:gap-14">
        <div className="@container flex min-w-0 flex-[1_1_540px] flex-col gap-6 lg:gap-8">
          <Reveal>
            <p className="m-0 inline-flex items-center gap-2.5 font-semibold text-mg-mint text-sm uppercase tracking-[0.12em]">
              <LiveDot className="bg-mg-mint" />
              Traders Dept.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <HighlightTitle
              as="h1"
              // Sized to the column so the longest line (~10.4em incl. indent) never wraps.
              className="text-[clamp(28px,9.2cqw,80px)]"
              lines={[
                { text: "One community.", className: "bg-white text-mg-navy" },
                { text: "A million goals.", className: "bg-mg-orange text-mg-navy", indent: true },
              ]}
            />
          </Reveal>
          <Reveal delay={0.16}>
            <p className="m-0 max-w-140 text-base text-white/80 leading-relaxed lg:text-[19px]">
              Million Goats бол хүсэл тэмүүлэл, мэдлэг, өсөх хүсэл дээр суурилсан шинэ үеийн
              трейдерүүдийн хамт олон. Бид зах зээлийг судалж, ялалт ялагдал бүрийг туршлага
              болгодог.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/lab"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-mg-blue px-7 py-4 font-semibold text-[17px] text-white transition hover:brightness-110"
              >
                Хамт олонд нэгдэх
                <ArrowRight />
              </Link>
              <Link
                href="/#about"
                className="inline-flex items-center justify-center rounded-xl border border-white/40 px-6.5 py-4 font-semibold text-[17px] text-white transition hover:border-white"
              >
                Бидний тухай
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <ul className="m-0 flex list-none flex-wrap gap-x-7 gap-y-3 p-0 text-[15px] text-white/80">
              {highlights.map((h) => (
                <li key={h.label} className="flex items-center gap-2">
                  <span aria-hidden="true" className={`size-1.5 rotate-45 ${h.dot}`} />
                  {h.label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="relative min-w-0 flex-[1_1_440px]">
          <Reveal from="right" delay={0.2}>
            <article className="relative overflow-hidden rounded-3xl bg-linear-160 from-[#0B3FA8] to-mg-blue p-5 shadow-[0_40px_80px_rgba(0,0,0,0.35)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="m-0 font-medium text-[22px] sm:text-[26px]">daily chart</p>
                  <p className="m-0 mt-1 text-[#A9CCFF] text-[13px]">“analysis” · H4</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-mg-navy px-3 py-2 font-semibold text-xs tracking-[0.08em]">
                  <LiveDot />
                  LIVE
                </span>
              </div>
              <div className="mt-5 mb-2">
                <CandleChart label="GBPJPY лааны графикийн жишээ" />
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <p className="m-0 font-medium text-[clamp(40px,5vw,64px)] leading-none tracking-tight">
                  GBPJPY
                </p>
                <div className="flex items-center gap-2.5 text-[#DCE9FF] text-[13px]">
                  <Image
                    src={site.logos.symbolOnDark}
                    alt=""
                    width={512}
                    height={308}
                    className="h-4 w-auto"
                  />
                  {site.contact.web}
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
