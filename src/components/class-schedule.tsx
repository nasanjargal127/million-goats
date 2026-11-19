import Image from "next/image";
import { team } from "@/lib/content";
import { CLASS_LOCATION, CLASS_SCHEDULE } from "@/lib/program";
import { site } from "@/lib/site";

/** Module chips: filled blue, except М4 which is outlined. */
const MODULE_BADGE: Record<string, string> = {
  М1: "bg-mg-blue text-white",
  М2: "bg-mg-blue text-white",
  М3: "bg-mg-blue text-white",
  М4: "border border-mg-blue text-white",
};

function PinIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
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

/**
 * The weekly class timetable (Mon–Fri): one row per day, divided by thin rules,
 * with the community meeting lit in orange. `bare` drops the navy card for
 * pages whose section is already navy.
 */
export function ClassSchedule({
  headingLevel = "h2",
  bare = false,
}: {
  headingLevel?: "h2" | "h3";
  bare?: boolean;
}) {
  const Heading = headingLevel;
  return (
    <div className={`text-white ${bare ? "" : "rounded-3xl bg-mg-navy p-5 sm:p-8 lg:p-10"}`}>
      <Heading className="m-0 font-bold text-[clamp(28px,3.4vw,44px)] uppercase leading-none tracking-[-0.02em]">
        Хичээлийн хуваарь
      </Heading>

      <ol className="m-0 mt-8 flex list-none flex-col p-0 sm:px-6">
        {CLASS_SCHEDULE.map((c) => {
          const teacher = team.find((t) => t.id === c.teacher);
          return (
            <li
              key={c.day}
              className={`grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-x-4 gap-y-3 py-5 md:grid-cols-[8rem_10rem_2.75rem_minmax(0,1fr)] md:py-6 ${
                c.highlight
                  ? "my-2 rounded-3xl border border-mg-orange/70 bg-linear-to-b from-[#3a0c08] to-mg-navy px-5 shadow-[0_0_32px_rgba(255,54,0,0.25)] sm:-mx-6 sm:px-6 md:rounded-full md:px-6"
                  : "border-white/10 border-b"
              }`}
            >
              <span className="font-medium text-lg leading-snug">{c.day}</span>
              <span className="flex flex-col">
                <span className="whitespace-nowrap font-medium text-lg leading-snug">{c.time}</span>
                <span
                  className={`font-medium text-xs ${c.highlight ? "text-mg-orange" : "text-mg-sky"}`}
                >
                  {c.duration}
                </span>
              </span>
              <span className="col-span-2 flex min-w-0 items-start gap-3 md:contents">
                {c.module ? (
                  <span
                    className={`mt-1 flex h-5 w-8 shrink-0 items-center justify-center rounded-sm font-bold text-[10px] ${MODULE_BADGE[c.module] ?? "bg-white/15"}`}
                  >
                    {c.module}
                  </span>
                ) : (
                  <span
                    className={`mt-1 flex h-5 w-8 shrink-0 items-center justify-center rounded-sm ${c.highlight ? "bg-mg-orange" : "bg-mg-blue"}`}
                  >
                    <Image
                      src={site.logos.symbolOnDark}
                      alt=""
                      width={512}
                      height={308}
                      className="h-2.5 w-auto"
                    />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-medium text-lg leading-snug">{c.title}</span>
                  {teacher && (
                    <span className="block text-white/60 text-xs">
                      Багш:{" "}
                      <span className="text-white/85">
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
        className="mt-6 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-mg-sky sm:ml-6"
      >
        <PinIcon />
        {CLASS_LOCATION}
      </a>
    </div>
  );
}
