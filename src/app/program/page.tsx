import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/brand";
import { ClassSchedule } from "@/components/class-schedule";
import { Reveal } from "@/components/motion/reveal";
import { PageHero } from "@/components/page-hero";
import { ProgramTabs } from "@/components/program/program-tabs";
import { SyllabusPdf } from "@/components/program/syllabus-pdf";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { team } from "@/lib/content";
import { PROGRAM_NOTE, PROGRAM_TOPICS, PROGRAM_WEEKS } from "@/lib/program";

const first = PROGRAM_WEEKS[0].split("–")[0];
const last = PROGRAM_WEEKS[PROGRAM_WEEKS.length - 1].split("–")[1];
const description = `Million Goats Trading Lab-ын ${PROGRAM_WEEKS.length} долоо хоногийн хөтөлбөр: ${team.length} багш, ${first}–${last}. Анхан шатнаас фундаментал шинжилгээ, трейдингийн сэтгэл зүй хүртэл.`;

export const metadata: Metadata = {
  title: "Хичээлийн хөтөлбөр",
  description,
  alternates: { canonical: "/program" },
  openGraph: { title: "Million Goats — Хичээлийн хөтөлбөр", description },
  twitter: { title: "Million Goats — Хичээлийн хөтөлбөр", description },
};

/** Desktop view: weeks down, teachers across, like the printed schedule. */
function ProgramTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-mg-line bg-white">
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">
          {PROGRAM_WEEKS.length} долоо хоногийн хөтөлбөр, багш тус бүрээр
        </caption>
        <colgroup>
          <col className="w-28" />
          {team.map((t) => (
            <col key={t.id} />
          ))}
        </colgroup>
        <thead className="bg-mg-navy text-white">
          <tr>
            <th
              scope="col"
              className="px-5 py-5 align-bottom font-semibold text-mg-on-dark-muted text-xs uppercase tracking-[0.12em]"
            >
              Долоо хоног
            </th>
            {team.map((t, i) => (
              <th
                key={t.id}
                id={t.id}
                scope="col"
                className="scroll-mt-24 border-white/10 border-l px-5 py-5 align-bottom"
              >
                <span className="flex items-center gap-2 font-semibold text-[11px] text-mg-sky uppercase tracking-[0.1em]">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-mg-blue font-bold text-[11px] text-white">
                    {i + 1}
                  </span>
                  {t.role}
                </span>
                <span className="mt-1.5 block font-bold text-base uppercase leading-tight xl:text-xl">
                  {t.name}
                  {t.nickname && (
                    <>
                      {" "}
                      <span className="whitespace-nowrap text-mg-sky">· {t.nickname}</span>
                    </>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PROGRAM_WEEKS.map((dates, w) => (
            <tr key={dates} className="border-mg-line border-t even:bg-mg-surface/70">
              <th scope="row" className="px-5 py-4 align-middle font-normal">
                <span className="block font-bold text-3xl text-mg-navy leading-none">{w + 1}</span>
                <span className="mt-1 block text-mg-muted text-xs">{dates}</span>
              </th>
              {team.map((t) => (
                <td
                  key={t.id}
                  className="border-mg-line border-l px-5 py-4 align-middle font-semibold text-[15px] text-mg-navy leading-snug"
                >
                  {PROGRAM_TOPICS[t.id]?.[w]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProgramPage() {
  return (
    <>
      <SiteHeader current="/program" />
      <main className="flex flex-1 flex-col">
        <PageHero
          title={["Хичээлийн", "хөтөлбөр"]}
          aside={
            <dl className="m-0 flex flex-wrap gap-x-10 gap-y-3">
              {[
                [`${PROGRAM_WEEKS.length}`, "долоо хоног"],
                [`${team.length}`, "багш"],
                [`${first}–${last}`, "хугацаа"],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col-reverse">
                  <dt className="text-sm text-white/60">{label}</dt>
                  <dd className="m-0 font-bold text-3xl text-white">{value}</dd>
                </div>
              ))}
            </dl>
          }
        />

        <div className="flex-1 bg-mg-surface px-4 py-12 sm:px-[clamp(16px,4vw,64px)]">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <section id="schedule" aria-label="Хичээлийн хуваарь" className="mb-6 scroll-mt-24">
              <ClassSchedule />
            </section>
            <Reveal className="hidden lg:block">
              <ProgramTable />
            </Reveal>
            <div className="lg:hidden">
              <ProgramTabs teachers={team} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6">
              <p className="m-0 max-w-160 text-mg-body text-sm leading-relaxed">{PROGRAM_NOTE}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/#team"
                  className="inline-flex min-h-11 items-center rounded-md border border-mg-line bg-white px-5 font-semibold text-mg-navy transition hover:border-mg-blue"
                >
                  Багш нартай танилцах
                </Link>
                <Link
                  href="/lab"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-mg-blue px-5 font-semibold text-white transition hover:brightness-110"
                >
                  Суудал сонгох
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <SyllabusPdf />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
