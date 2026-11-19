import Image from "next/image";
import Link from "next/link";
import { team } from "@/lib/content";
import { ROOM_IDS, ROOM_NAMES, ROOM_SEAT_COUNT, TOTAL_SEATS } from "@/lib/lab/seats";
import { site } from "@/lib/site";
import { ArrowRight, Eyebrow, SectionTitle } from "../brand";
import { ClassSchedule } from "../class-schedule";
import { Reveal } from "../motion/reveal";

const sectionPad = "px-4 py-20 sm:px-[clamp(16px,4vw,64px)] lg:py-30";

export function Manifesto() {
  return (
    <section id="about" className={`relative overflow-hidden bg-mg-navy text-white ${sectionPad}`}>
      {/* Soft blue glow behind the title, kept off the top edge so the hero blends in */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_55%_at_20%_60%,rgba(0,104,255,0.22),transparent_70%)]"
      />
      <Image
        src={site.logos.symbolOnDark}
        alt=""
        width={512}
        height={308}
        className="pointer-events-none absolute top-1/2 -right-20 w-[min(720px,90vw)] -translate-y-1/2 opacity-[0.05]"
      />
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-start gap-x-20 gap-y-12">
        <Reveal from="left" className="min-w-0 flex-[1_1_420px]">
          <Eyebrow className="text-mg-sky">Бидний тухай</Eyebrow>
          <SectionTitle lines={["Өдөр бүр", "илүү сайн"]} />
        </Reveal>
        <Reveal
          from="right"
          delay={0.1}
          className="flex min-w-0 flex-[1_1_520px] flex-col gap-6 text-lg text-white/80 leading-relaxed lg:text-xl"
        >
          <p className="m-0">
            Million Goats бол хүсэл тэмүүлэл, мэдлэг, өсөх өлсгөлөн дээр суурилсан шинэ үеийн
            трейдерүүд. Бид зах зээлийг судалж, энгийнийг сорьж, ялалт ялагдал бүрийг туршлага
            болгон хувиргадаг.
          </p>
          <p className="m-0 border-mg-blue border-l-2 pl-5 font-semibold text-[22px] text-white leading-snug lg:text-[26px]">
            Энэ бол нэг шөнийн дотор баяжих тухай биш. Энэ бол өдөр бүр илүү сайн болох тухай.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** The traders and psychologist behind Million Goats. Sits on the page's navy. */
export function Team() {
  return (
    <section id="team" className={`relative text-white ${sectionPad}`}>
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="flex flex-col items-center text-center">
          <span className="rounded-full bg-mg-blue px-3 py-1 font-semibold text-white text-xs">
            Манай баг
          </span>
          <SectionTitle lines={["Багш нар"]} dot={false} className="mt-5" />
          <p className="m-0 mt-8 max-w-140 text-[15px] text-white/85 leading-relaxed">
            Олон улсын prop firm-ийн шалгалт давсан трейдерүүд, санхүүгийн боловсролтой багш нар,
            трейдерийн сэтгэлзүйд зориулсан сэтгэл засалч — бүгд нэг дор.
          </p>
        </Reveal>

        <ul className="m-0 mx-auto mt-14 grid max-w-sm list-none grid-cols-1 gap-6 p-0 sm:max-w-none sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <li key={member.name} className="min-w-0">
              <Reveal delay={0.1 + i * 0.08} className="h-full">
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-mg-card ring-1 ring-white/5 transition hover:ring-mg-blue/60">
                  <div className="relative aspect-[3/4] overflow-hidden bg-mg-navy">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      style={{ objectPosition: `50% ${member.focus}` }}
                    />
                    {/* Brand chevron peeking in from the bottom-right corner */}
                    <Image
                      src={site.logos.symbol}
                      alt=""
                      width={512}
                      height={308}
                      className="absolute -right-[16%] -bottom-[2%] w-[62%]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="m-0 font-bold text-lg uppercase leading-tight">
                      {member.name}
                      {member.nickname && (
                        <span className="ml-1 align-super font-semibold text-[10px] text-mg-sky tracking-wide">
                          {member.nickname}
                        </span>
                      )}
                    </h3>
                    <p className="m-0 text-sm text-white/85 leading-snug">
                      {member.points.join(", ")}
                    </p>
                    <div className="mt-auto flex flex-col gap-4 pt-2">
                      {member.tags && (
                        <p className="m-0 self-start border-mg-blue border-b-2 pb-2 font-medium text-white/85 text-xs leading-relaxed">
                          {member.tags.join(" · ")}
                        </p>
                      )}
                      <Link
                        href={`/program#${member.id}`}
                        className="inline-flex items-center gap-1.5 self-start font-semibold text-sm text-white transition hover:gap-2.5 hover:text-mg-sky"
                        aria-label={`${member.name} — хөтөлбөр харах`}
                      >
                        Хөтөлбөр харах
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
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

/** Short Trading Lab promo between the team and schedule sections. */
export function LabTeaser() {
  return (
    <section id="lab" className={`relative text-white ${sectionPad}`}>
      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <Reveal>
          <SectionTitle
            lines={["Мэргэжлийн трейдерүүдийн танхим"]}
            dot={false}
            size="text-[clamp(28px,3.6vw,48px)]"
          />
          <p className="m-0 mt-8 text-[15px] text-white/55 leading-relaxed">
            {ROOM_IDS.length} танхим, {TOTAL_SEATS} суудал. 3D танхимаас суудлаа сонгоод QPay-ээр
            төлж баталгаажуулаарай.
          </p>
        </Reveal>
        <ul className="m-0 mt-8 grid w-full list-none grid-cols-2 gap-4 p-0 lg:grid-cols-4 lg:gap-5">
          {ROOM_IDS.map((room, i) => (
            <li key={room}>
              <Reveal delay={0.1 + i * 0.08}>
                <Link
                  href="/lab"
                  className="group flex min-h-24 flex-col items-start justify-between gap-2 rounded-lg bg-mg-card p-4 text-left transition hover:-translate-y-0.5 hover:bg-mg-blue hover:shadow-[0_12px_32px_rgba(0,104,255,0.35)] lg:min-h-28"
                >
                  <span className="font-semibold text-[clamp(22px,2.4vw,30px)] leading-tight">
                    {ROOM_NAMES[room]}
                  </span>
                  <span className="text-mg-sky text-sm transition group-hover:text-white/75">
                    {ROOM_SEAT_COUNT[room]} суудал
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
        <Reveal delay={0.2}>
          <Link
            href="/lab"
            className="mt-16 inline-flex min-h-10 items-center justify-center rounded-md bg-mg-blue px-6 font-semibold text-sm text-white transition hover:brightness-110"
          >
            Суудал Сонгох
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/** Weekly class times, at the very bottom of the home page. Sits on the page's navy. */
export function Schedule() {
  return (
    <section id="schedule" className={`scroll-mt-20 ${sectionPad}`}>
      <Reveal className="mx-auto max-w-4xl">
        <ClassSchedule bare />
      </Reveal>
    </section>
  );
}
