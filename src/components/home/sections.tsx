import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { ArrowRight, Eyebrow, HighlightTitle } from "../brand";

const sectionPad = "px-4 py-20 sm:px-[clamp(16px,4vw,64px)] lg:py-30";

export function Manifesto() {
  return (
    <section id="about" className={`relative overflow-hidden bg-mg-blue text-white ${sectionPad}`}>
      <Image
        src={site.logos.symbolOnDark}
        alt=""
        width={512}
        height={308}
        className="pointer-events-none absolute top-1/2 -right-20 w-[min(720px,90vw)] -translate-y-1/2 opacity-10"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 -left-15 h-45 w-130 bg-linear-to-r from-white via-white/35 to-white/0 opacity-90 [clip-path:polygon(35%_0,100%_0,65%_100%,0_100%)]"
      />
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-start gap-x-20 gap-y-12">
        <div className="min-w-0 flex-[1_1_420px]">
          <Eyebrow className="mb-5 text-sm text-white uppercase tracking-[0.12em]">
            Бидний тухай
          </Eyebrow>
          <HighlightTitle
            className="text-[clamp(34px,4.6vw,64px)]"
            lines={[
              { text: "Өдөр бүр", className: "bg-white text-mg-navy" },
              { text: "илүү сайн.", className: "bg-mg-navy text-white", indent: true },
            ]}
          />
        </div>
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6 text-lg leading-relaxed lg:text-xl">
          <p className="m-0">
            Million Goats бол хүсэл тэмүүлэл, мэдлэг, өсөх өлсгөлөн дээр суурилсан шинэ үеийн
            трейдерүүд. Бид зах зээлийг судалж, энгийнийг сорьж, ялалт ялагдал бүрийг туршлага
            болгон хувиргадаг.
          </p>
          <p className="m-0 font-semibold text-[22px] leading-snug lg:text-[26px]">
            Энэ бол нэг шөнийн дотор баяжих тухай биш. Энэ бол өдөр бүр илүү сайн болох тухай.
          </p>
        </div>
      </div>
    </section>
  );
}

const labRooms = ["Tokyo", "London", "New York", "Sydney"];

/** Short Trading Lab promo between the about and join sections. */
export function LabTeaser() {
  return (
    <section id="lab" className={`relative overflow-hidden bg-mg-navy text-white ${sectionPad}`}>
      <div
        aria-hidden="true"
        className="absolute top-0 -right-40 h-full w-190 bg-linear-to-r from-mg-blue/0 to-mg-blue/50 [clip-path:polygon(50%_0,100%_0,50%_100%,0_100%)]"
      />
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-12">
        <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-6">
          <Eyebrow className="text-mg-mint">Trading Lab</Eyebrow>
          <HighlightTitle
            className="text-[clamp(34px,4.6vw,64px)]"
            lines={[
              { text: "Мэргэжлийн", className: "bg-white text-mg-navy" },
              {
                text: "трейдерүүдийн танхим",
                className: "bg-mg-orange text-mg-navy",
                indent: true,
              },
            ]}
          />
          <p className="m-0 max-w-140 text-lg text-white/80 leading-relaxed">
            4 танхим, 100 суудал. 3D танхимаас суудлаа сонгоод QPay-ээр төлж баталгаажуулаарай.
          </p>
          <Link
            href="/lab"
            className="inline-flex items-center gap-2.5 self-start rounded-xl bg-mg-blue px-7 py-4 font-semibold text-[17px] text-white transition hover:brightness-110"
          >
            Суудал сонгох
            <ArrowRight />
          </Link>
        </div>
        <ul className="m-0 grid min-w-0 flex-[1_1_320px] list-none grid-cols-2 gap-3 p-0">
          {labRooms.map((room) => (
            <li key={room}>
              <Link
                href="/lab"
                className="flex min-h-28 flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:border-mg-blue hover:bg-mg-blue/15"
              >
                <span className="font-black text-xl uppercase">{room}</span>
                <span className="text-mg-mint text-sm">25 суудал</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
