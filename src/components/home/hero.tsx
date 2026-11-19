import Link from "next/link";
import { ROOM_IDS, TOTAL_SEATS } from "@/lib/lab/seats";
import { BrandDot } from "../brand";
import { Reveal } from "../motion/reveal";
import { HeroBackdrop } from "./hero-backdrop";

const highlights = [
  "Trading Lab",
  `${ROOM_IDS.length} танхим • ${TOTAL_SEATS} суудал`,
  "QPay-ээр захиалга",
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-start overflow-hidden bg-mg-navy px-4 pt-[clamp(56px,15svh,180px)] pb-28 text-white sm:px-[clamp(16px,4vw,64px)]"
    >
      <HeroBackdrop />
      {/* Melt into the navy "about" section below */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-b from-mg-navy/0 to-mg-navy"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <Reveal>
          <h1 className="m-0 font-bold text-[clamp(34px,6.6vw,128px)] uppercase leading-[0.92] tracking-[-0.02em] [text-shadow:0_8px_40px_rgba(1,13,38,0.55)]">
            <span className="block whitespace-nowrap">
              One community
              <BrandDot />
            </span>
            <span className="block whitespace-nowrap">
              A million goals
              <BrandDot />
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="m-0 mt-10 max-w-220 text-[15px] text-white/90 leading-relaxed sm:text-base lg:mt-24">
            Million Goats бол хүсэл тэмүүлэл, мэдлэг, өсөх хүсэл дээр суурилсан шинэ үеийн
            трейдерүүдийн хамт олон. Бид зах зээлийг судалж, ялалт ялагдал бүрийг туршлага болгодог.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-8 lg:mt-20">
            <Link
              href="/lab"
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-mg-blue px-4 font-semibold text-base text-white transition hover:brightness-110"
            >
              Хамт Олонд Нэгдэх
            </Link>
            <Link
              href="/#about"
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#0b1631]/90 px-8 font-semibold text-base text-white transition hover:bg-[#13214a]"
            >
              Бидний тухай
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.26} className="w-full">
          <ul className="m-0 mx-auto mt-10 grid max-w-200 list-none grid-cols-1 gap-3 p-0 text-lg text-white/85 sm:grid-cols-3 lg:mt-12 lg:text-xl">
            {highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
