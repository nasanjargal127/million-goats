import Image from "next/image";
import { team } from "@/lib/content";
import { CLASS_LOCATION, CLASS_SCHEDULE } from "@/lib/program";
import { site } from "@/lib/site";

const MODULE_BADGE: Record<string, string> = {
  М1: "bg-mg-blue text-white",
  М2: "bg-[#3d8bff] text-white",
  М3: "bg-[#9cc4ff] text-mg-navy",
  М4: "bg-[#dce8ff] text-mg-navy",
};

function PinIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

/** The weekly class timetable (Mon–Fri), as on the printed «Хичээлийн хуваарь». */
export function ClassSchedule({ headingLevel = "h2" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <div className="relative overflow-hidden rounded-3xl bg-mg-navy p-5 text-white sm:p-8 lg:p-10">
      <div
        aria-hidden="true"
        className="absolute top-0 -right-24 h-56 w-96 bg-linear-to-l from-mg-blue/50 to-mg-blue/0 [clip-path:polygon(40%_0,100%_0,100%_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-16 -bottom-10 h-48 w-72 bg-linear-to-l from-mg-blue/40 to-mg-blue/0 [clip-path:polygon(100%_0,100%_100%,0_100%)]"
      />

      <div className="relative flex items-end justify-between gap-6">
        <div>
          <p className="m-0 flex items-center gap-3 font-semibold text-mg-sky text-sm">
            <Image src={site.logos.symbol} alt="" width={512} height={308} className="h-6 w-auto" />
            Million Goats Trading Lab
          </p>
          <Heading className="m-0 mt-3 font-black text-[clamp(30px,4vw,48px)] leading-none tracking-tight">
            Хичээлийн хуваарь
          </Heading>
        </div>
        <span aria-hidden="true" className="mb-3 hidden h-1 w-14 bg-mg-orange sm:block" />
      </div>

      <ol className="relative m-0 mt-8 flex list-none flex-col gap-3 p-0">
        {CLASS_SCHEDULE.map((c) => {
          const teacher = team.find((t) => t.id === c.teacher);
          return (
            <li
              key={c.day}
              className={`grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-4 rounded-2xl border px-5 py-4 sm:px-6 md:grid-cols-[10rem_13rem_minmax(0,1fr)] md:py-5 ${
                c.highlight ? "border-mg-orange bg-mg-orange/10" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <span className="flex flex-col">
                <span
                  className={`font-semibold text-xs ${c.highlight ? "text-mg-orange" : "text-mg-sky"}`}
                >
                  {c.ordinal}
                </span>
                <span className="font-black text-2xl leading-tight">{c.day}</span>
              </span>
              <span className="flex flex-col">
                <span className="whitespace-nowrap font-black text-[clamp(20px,2.4vw,26px)] leading-tight">
                  {c.time}
                </span>
                <span className="text-white/60 text-xs">{c.duration}</span>
              </span>
              <span className="col-span-2 flex min-w-0 items-center gap-3 border-white/10 border-t pt-3 md:col-span-1 md:border-t-0 md:pt-0">
                {c.module ? (
                  <span
                    className={`flex h-7 w-10 shrink-0 items-center justify-center rounded-md font-black text-sm ${MODULE_BADGE[c.module] ?? "bg-white/15 text-white"}`}
                  >
                    {c.module}
                  </span>
                ) : (
                  <span className="flex h-7 w-10 shrink-0 items-center justify-center rounded-md bg-mg-orange">
                    <Image
                      src={site.logos.symbolOnDark}
                      alt=""
                      width={512}
                      height={308}
                      className="h-3.5 w-auto"
                    />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-bold text-lg leading-snug">{c.title}</span>
                  {teacher && (
                    <span className="block text-sm text-white/70">
                      Багш:{" "}
                      <span className="font-semibold text-white">
                        {teacher.name}
                        {teacher.nickname && ` (${teacher.nickname})`}
                      </span>
                    </span>
                  )}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <a
        href={site.contact.mapUrl}
        target="_blank"
        rel="noopener"
        className="relative mt-8 inline-flex items-center gap-4 rounded-xl transition hover:opacity-90"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-mg-blue">
          <PinIcon />
        </span>
        <span className="flex flex-col">
          <span className="font-semibold text-mg-sky text-xs">Байршил</span>
          <span className="font-bold text-lg leading-snug">{CLASS_LOCATION}</span>
        </span>
      </a>
    </div>
  );
}
