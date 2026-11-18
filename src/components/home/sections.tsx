import Image from "next/image";
import Link from "next/link";
import { team } from "@/lib/content";
import { ROOM_IDS, ROOM_NAMES, ROOM_SEAT_COUNT, TOTAL_SEATS } from "@/lib/lab/seats";
import { site } from "@/lib/site";
import { ArrowRight, Eyebrow, HighlightTitle } from "../brand";
import { Reveal } from "../motion/reveal";

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
        <Reveal from="left" className="min-w-0 flex-[1_1_420px]">
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
        </Reveal>
        <Reveal
          from="right"
          delay={0.1}
          className="flex min-w-0 flex-[1_1_520px] flex-col gap-6 text-lg leading-relaxed lg:text-xl"
        >
          <p className="m-0">
            Million Goats бол хүсэл тэмүүлэл, мэдлэг, өсөх өлсгөлөн дээр суурилсан шинэ үеийн
            трейдерүүд. Бид зах зээлийг судалж, энгийнийг сорьж, ялалт ялагдал бүрийг туршлага
            болгон хувиргадаг.
          </p>
          <p className="m-0 font-semibold text-[22px] leading-snug lg:text-[26px]">
            Энэ бол нэг шөнийн дотор баяжих тухай биш. Энэ бол өдөр бүр илүү сайн болох тухай.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** The traders and psychologist behind Million Goats. */
export function Team() {
  return (
    <section
      id="team"
      className={`relative overflow-hidden bg-mg-surface text-mg-navy ${sectionPad}`}
    >
      <div
        aria-hidden="true"
        className="absolute top-0 -right-30 h-40 w-150 bg-linear-to-r from-mg-blue/0 to-mg-blue/15 [clip-path:polygon(35%_0,100%_0,65%_100%,0_100%)]"
      />
      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-x-20 gap-y-8">
          <Reveal from="left" className="min-w-0 flex-[1_1_420px]">
            <Eyebrow className="mb-5 text-mg-link text-sm uppercase tracking-[0.12em]">
              Манай баг
            </Eyebrow>
            <HighlightTitle
              className="text-[clamp(34px,4.6vw,64px)]"
              lines={[
                { text: "Туршлагатай", className: "bg-mg-navy text-white" },
                { text: "багш нар", className: "bg-mg-blue text-white", indent: true },
              ]}
            />
          </Reveal>
          <Reveal from="right" delay={0.1} className="min-w-0 flex-[1_1_420px]">
            <p className="m-0 max-w-140 text-lg text-mg-body leading-relaxed">
              Олон улсын prop firm-ийн шалгалт давсан трейдерүүд, санхүүгийн боловсролтой багш нар,
              трейдерийн сэтгэлзүйд зориулсан сэтгэл засалч — бүгд нэг дор.
            </p>
          </Reveal>
        </div>

        <ul className="m-0 mt-14 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <li key={member.name} className="min-w-0">
              <Reveal delay={0.1 + i * 0.08} className="h-full">
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-mg-line bg-white">
                  <div className="relative aspect-[4/5] overflow-hidden bg-mg-navy">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      style={{ objectPosition: `50% ${member.focus}` }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-mg-navy/80 to-mg-navy/0"
                    />
                    <span className="absolute bottom-4 left-4 bg-mg-orange px-2.5 pt-1 pb-0.5 font-black text-mg-navy text-xs uppercase tracking-wide lg:left-3 lg:px-2 lg:text-[11px] lg:tracking-normal xl:left-4 xl:px-2.5 xl:text-xs xl:tracking-wide">
                      {member.role}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <h3 className="m-0 flex flex-wrap items-center gap-2 font-black text-xl uppercase leading-tight">
                      {member.name}
                      {member.nickname && (
                        <span className="rounded-md bg-mg-blue px-2 py-0.5 font-bold text-white text-xs tracking-wide">
                          {member.nickname}
                        </span>
                      )}
                    </h3>
                    <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px] text-mg-body leading-snug">
                      {member.points.map((point) => (
                        <li key={point} className="flex gap-2">
                          <span
                            aria-hidden="true"
                            className="mt-[0.45em] size-1.5 shrink-0 rotate-45 bg-mg-blue"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                    {member.tags && (
                      <ul className="m-0 mt-auto flex list-none flex-wrap gap-1.5 p-0">
                        {member.tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full border border-mg-line bg-mg-surface px-2.5 py-1 font-semibold text-mg-navy text-xs"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Short Trading Lab promo between the about and join sections. */
export function LabTeaser() {
  return (
    <section id="lab" className={`relative overflow-hidden bg-mg-navy text-white ${sectionPad}`}>
      <div
        aria-hidden="true"
        className="absolute top-0 -right-40 h-full w-190 bg-linear-to-r from-mg-blue/0 to-mg-blue/50 [clip-path:polygon(50%_0,100%_0,50%_100%,0_100%)]"
      />
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-12">
        <Reveal from="left" className="flex min-w-0 flex-[1_1_480px] flex-col gap-6">
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
            {ROOM_IDS.length} танхим, {TOTAL_SEATS} суудал. 3D танхимаас суудлаа сонгоод QPay-ээр
            төлж баталгаажуулаарай.
          </p>
          <Link
            href="/lab"
            className="inline-flex items-center gap-2.5 self-start rounded-xl bg-mg-blue px-7 py-4 font-semibold text-[17px] text-white transition hover:brightness-110"
          >
            Суудал сонгох
            <ArrowRight />
          </Link>
        </Reveal>
        <ul className="m-0 grid min-w-0 flex-[1_1_320px] list-none grid-cols-2 gap-3 p-0">
          {ROOM_IDS.map((room, i) => (
            <li key={room}>
              <Reveal delay={0.1 + i * 0.08}>
                <Link
                  href="/lab"
                  className="flex min-h-28 flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:border-mg-blue hover:bg-mg-blue/15"
                >
                  <span className="font-black text-xl uppercase">{ROOM_NAMES[room]}</span>
                  <span className="text-mg-mint text-sm">{ROOM_SEAT_COUNT[room]} суудал</span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
