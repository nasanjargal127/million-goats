import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/brand";
import { ClassSchedule } from "@/components/class-schedule";
import { JsonLd } from "@/components/json-ld";
import { SectionGoat } from "@/components/motion/goat-backdrop";
import { Reveal } from "@/components/motion/reveal";
import { ProgramTabs } from "@/components/program/program-tabs";
import { SyllabusPdf } from "@/components/program/syllabus-pdf";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { team } from "@/lib/content";
import { LAB_PACKAGE_IDS, LAB_PACKAGES } from "@/lib/lab/packages";
import {
  CLASS_LOCATION,
  PROGRAM_NOTE,
  PROGRAM_TOPICS,
  PROGRAM_WEEKS,
  programDates,
} from "@/lib/program";
import { ORGANIZATION_ID, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

const first = PROGRAM_WEEKS[0].split("–")[0];
const last = PROGRAM_WEEKS[PROGRAM_WEEKS.length - 1].split("–")[1];
const description = `Million Goats Trading Lab-ын ${PROGRAM_WEEKS.length} долоо хоногийн хөтөлбөр: ${team.length} багш, ${first}–${last}. Анхан шатнаас фундаментал шинжилгээ, трейдингийн сэтгэл зүй хүртэл.`;

export const metadata: Metadata = pageMetadata({
  path: "/program",
  title: "Трейдинг сургалтын хөтөлбөр",
  socialTitle: "Million Goats — Трейдинг сургалтын хөтөлбөр",
  description,
});

const dates = programDates();
const prices = LAB_PACKAGE_IDS.map((id) => LAB_PACKAGES[id].priceMnt);

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Million Goats Trading Lab — Forex трейдинг сургалт",
  description,
  url: `${site.url}/program`,
  inLanguage: "mn",
  provider: { "@id": ORGANIZATION_ID },
  teaches: team.map((t) => t.role),
  syllabusSections: team.map((t) => ({
    "@type": "Syllabus",
    name: t.role,
    description: PROGRAM_TOPICS[t.id]?.join("; "),
  })),
  offers: {
    "@type": "AggregateOffer",
    category: "Paid",
    priceCurrency: "MNT",
    lowPrice: Math.min(...prices),
    highPrice: Math.max(...prices),
    url: `${site.url}/lab`,
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Onsite",
    startDate: dates.start,
    endDate: dates.end,
    courseSchedule: {
      "@type": "Schedule",
      repeatFrequency: "P1W",
      repeatCount: PROGRAM_WEEKS.length,
      startDate: dates.start,
      endDate: dates.end,
    },
    location: {
      "@type": "Place",
      name: CLASS_LOCATION,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.contact.streetAddress,
        addressLocality: site.contact.locality,
        addressCountry: site.contact.country,
      },
    },
    instructor: team.map((t) => ({
      "@type": "Person",
      name: t.name,
      jobTitle: t.role,
      image: `${site.url}${t.photo}`,
      url: `${site.url}/program#${t.id}`,
    })),
  },
};

/** Desktop view: weeks down, teachers across, like the printed schedule. */
function ProgramTable() {
  return (
    <div className="overflow-hidden rounded-2xl bg-mg-card ring-1 ring-white/5">
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
        <thead className="bg-[#071331]">
          <tr>
            <th
              scope="col"
              className="px-5 py-5 align-bottom font-semibold text-white/50 text-xs uppercase tracking-[0.12em]"
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
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-mg-blue font-bold text-[10px] text-white">
                    {i + 1}
                  </span>
                  {t.role}
                </span>
                <span className="mt-1.5 block font-bold text-base uppercase leading-tight xl:text-lg">
                  {t.name}
                  {t.nickname && (
                    <span className="ml-1 align-super font-semibold text-[10px] text-mg-sky tracking-wide">
                      {t.nickname}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PROGRAM_WEEKS.map((dates, w) => (
            <tr key={dates} className="border-white/10 border-t transition hover:bg-white/[0.03]">
              <th scope="row" className="px-5 py-4 align-middle font-normal">
                <span className="block font-bold text-3xl leading-none">{w + 1}</span>
                <span className="mt-1 block font-medium text-mg-sky text-xs">{dates}</span>
              </th>
              {team.map((t) => (
                <td
                  key={t.id}
                  className="border-white/10 border-l px-5 py-4 align-middle font-medium text-[15px] text-white/85 leading-snug"
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

const sectionPad = "px-4 sm:px-[clamp(16px,4vw,64px)]";

export default function ProgramPage() {
  return (
    <>
      <JsonLd data={courseJsonLd} />
      <SiteHeader current="/program" />
      {/* One navy run with the goat drawn behind it, like the home page */}
      <main className="relative isolate flex flex-1 flex-col bg-mg-navy text-white">
        <SectionGoat align="center" />

        <section className={`${sectionPad} pt-20 pb-16 lg:pt-28`}>
          <Reveal className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <span className="rounded-full bg-mg-blue px-3 py-1 font-semibold text-white text-xs">
              Trading Lab
            </span>
            <SectionTitle
              as="h1"
              lines={["Хичээлийн хөтөлбөр"]}
              dot={false}
              size="text-[clamp(34px,5vw,68px)]"
              className="mt-5"
            />
            <p className="m-0 mt-8 max-w-140 text-[15px] text-white/85 leading-relaxed">
              Анхан шатнаас фундаментал шинжилгээ, трейдингийн сэтгэл зүй хүртэл — {team.length}{" "}
              багш, долоо хоног бүр.
            </p>
            <dl className="m-0 mt-10 grid w-full max-w-160 grid-cols-3 gap-3">
              {[
                [`${PROGRAM_WEEKS.length}`, "долоо хоног"],
                [`${team.length}`, "багш"],
                [`${first}–${last}`, "хугацаа"],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col-reverse gap-1">
                  <dt className="text-sm text-white/55">{label}</dt>
                  <dd className="m-0 font-bold text-[clamp(22px,3vw,32px)] leading-none">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>

        <section
          id="schedule"
          aria-label="Хичээлийн хуваарь"
          className={`${sectionPad} scroll-mt-24 py-16`}
        >
          <Reveal className="mx-auto max-w-4xl">
            <ClassSchedule bare />
          </Reveal>
        </section>

        <section className={`${sectionPad} py-16 lg:py-24`}>
          <div className="mx-auto max-w-7xl">
            <Reveal className="flex flex-col items-center text-center">
              <SectionTitle
                lines={[`${PROGRAM_WEEKS.length} долоо хоног`]}
                dot={false}
                size="text-[clamp(28px,3.6vw,48px)]"
              />
              <p className="m-0 mt-6 max-w-160 text-[15px] text-white/55 leading-relaxed">
                {PROGRAM_NOTE}
              </p>
            </Reveal>
            <Reveal className="mt-12 hidden lg:block">
              <ProgramTable />
            </Reveal>
            <div className="mt-10 lg:hidden">
              <ProgramTabs teachers={team} />
            </div>
            <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
              <Link
                href="/lab"
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-mg-blue px-6 font-semibold text-sm text-white transition hover:brightness-110"
              >
                Суудал Сонгох
              </Link>
              <Link
                href="/#team"
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-mg-card px-6 font-semibold text-sm text-white transition hover:bg-[#13214a]"
              >
                Багш нартай танилцах
              </Link>
            </div>
          </div>
        </section>

        <section className={`${sectionPad} pt-8 pb-24`}>
          <div className="mx-auto max-w-7xl">
            <SyllabusPdf />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
