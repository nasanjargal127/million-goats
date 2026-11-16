import Image from "next/image";
import Link from "next/link";
import { analyses, liveSessions, type ServiceIcon, services } from "@/lib/content";
import { site } from "@/lib/site";
import { AnalysisCard } from "../analysis-card";
import { ChevronStrip, Eyebrow, HighlightTitle, LiveDot } from "../brand";
import { JoinForm } from "../join-form";

const sectionPad = "px-4 py-20 sm:px-[clamp(16px,4vw,64px)] lg:py-30";
const h2 = "m-0 font-black text-[clamp(30px,4vw,52px)] uppercase leading-[1.05]";

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

const iconStyles: Record<ServiceIcon, { bg: string; stroke: string }> = {
  live: { bg: "bg-mg-blue", stroke: "#FFFFFF" },
  chart: { bg: "bg-mg-navy", stroke: "#00FFCE" },
  education: { bg: "bg-mg-orange", stroke: "#010D26" },
  community: { bg: "bg-mg-sky", stroke: "#010D26" },
};

function ServiceGlyph({ icon }: { icon: ServiceIcon }) {
  const s = iconStyles[icon];
  return (
    <span
      aria-hidden="true"
      className={`flex size-13 items-center justify-center rounded-[14px] ${s.bg}`}
    >
      <svg
        aria-hidden="true"
        className="size-6.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke={s.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon === "live" && (
          <>
            <circle cx="12" cy="12" r="2" />
            <path d="M16.24 7.76a6 6 0 0 1 0 8.48" />
            <path d="M7.76 16.24a6 6 0 0 1 0-8.48" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
          </>
        )}
        {icon === "chart" && (
          <>
            <path d="M6 3v4" />
            <rect x="4" y="7" width="4" height="8" />
            <path d="M6 15v6" />
            <path d="M14 2v4" />
            <rect x="12" y="6" width="4" height="6" />
            <path d="M14 12v4" />
            <path d="M20 6v3" />
            <rect x="18" y="9" width="4" height="8" stroke="#FF3600" />
            <path d="M20 17v3" />
          </>
        )}
        {icon === "education" && (
          <>
            <path d="M22 10L12 5 2 10l10 5 10-5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </>
        )}
        {icon === "community" && (
          <>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M17 14c2.6 0 4.5 1.9 4.5 4.5" />
          </>
        )}
      </svg>
    </span>
  );
}

export function Services() {
  return (
    <section id="services" className={`bg-white ${sectionPad}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:gap-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow className="text-mg-orange-text">Сэдэв:</Eyebrow>
            <h2 className={h2}>Бид юу хийдэг вэ?</h2>
          </div>
          <p className="m-0 max-w-110 text-[17px] text-mg-body leading-relaxed">
            Зах зээлийг ойлгох, сахилга баттай арилжаа хийх, хамтдаа өсөхөд хэрэгтэй бүхнийг нэг
            дор.
          </p>
        </div>
        <div className="flex flex-wrap gap-5">
          {services.map((s, i) => (
            <article
              key={s.title}
              className="flex min-w-0 flex-[1_1_260px] flex-col gap-4.5 rounded-[20px] border border-mg-line bg-white px-7 py-8 transition-colors hover:border-mg-blue"
            >
              <div className="flex items-center justify-between">
                <ServiceGlyph icon={s.icon} />
                <span className="font-bold text-[#6B768C] text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="m-0 font-bold text-[22px]">{s.title}</h3>
              <p className="m-0 text-base text-mg-body leading-relaxed">{s.body}</p>
              <Link
                href={s.href}
                className="mt-auto font-semibold text-[15px] text-mg-link hover:text-mg-navy"
              >
                {s.cta} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LiveSessions() {
  return (
    <section id="live" className={`bg-mg-surface ${sectionPad}`}>
      <div className="mx-auto flex max-w-7xl flex-wrap gap-12">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-8">
          <div>
            <Eyebrow className="inline-flex items-center gap-2 text-mg-orange-text">
              <LiveDot />
              Live
            </Eyebrow>
            <h2 className={h2}>Дараагийн дамжуулалт</h2>
          </div>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {liveSessions.map((s, i) => (
              <li
                key={s.title}
                className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl bg-white px-6 py-5"
              >
                <div className="flex size-19 flex-col items-center justify-center gap-0.5 rounded-[14px] bg-mg-navy text-white">
                  <span className="font-semibold text-mg-sky text-xs tracking-[0.08em]">
                    {s.month}
                  </span>
                  <span className="font-extrabold text-[26px]">{s.day}</span>
                </div>
                <div className="min-w-0 flex-[1_1_260px]">
                  <h3 className="m-0 mb-1.5 font-bold text-xl">{s.title}</h3>
                  <p className="m-0 text-[15px] text-mg-muted">{s.meta}</p>
                </div>
                {/* TODO: wire reminders (calendar file or notification sign-up). */}
                <Link
                  href="/#join"
                  className={`inline-flex min-h-12 items-center rounded-[10px] px-5.5 font-semibold text-[15px] transition ${
                    i === 0
                      ? "bg-mg-blue text-white hover:brightness-110"
                      : "border border-mg-blue bg-white text-mg-link hover:bg-mg-surface"
                  }`}
                >
                  Сануулах
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <aside className="relative flex min-h-130 min-w-0 flex-[1_1_380px] flex-col justify-end overflow-hidden rounded-3xl bg-mg-blue text-white">
          <div
            aria-hidden="true"
            className="absolute top-[8%] left-[8%] h-[30%] w-[84%] bg-linear-to-r from-white to-white/40 [clip-path:polygon(0_0,30%_0,50%_45%,70%_0,100%_0,65%_100%,35%_100%)]"
          />
          {/* TODO: replace with the host's photo (next/image). */}
          <div className="absolute inset-[14%_14%_34%_14%] flex items-center justify-center rounded-2xl border-2 border-white/55 border-dashed bg-mg-navy/25 text-sm">
            Хөтлөгчийн зураг
          </div>
          <div className="relative flex flex-col gap-2.5 rounded-t-[28px] rounded-b-3xl bg-mg-navy p-7">
            <div className="flex items-center justify-between gap-3">
              <p className="m-0 text-mg-on-dark-muted text-[13px]">[ОГНОО] · [ЦАГ] (GMT+8)</p>
              <Image
                src={site.logos.symbolOnDark}
                alt=""
                width={512}
                height={308}
                className="h-4.5 w-auto"
              />
            </div>
            <p className="m-0 text-[26px] text-mg-sky leading-tight">
              Live technical analysis with Niju Trader
            </p>
            <p className="m-0 text-mg-on-dark-muted text-[13px]">{site.contact.web}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function AnalysisPreview() {
  return (
    <section className={`bg-mg-navy text-white ${sectionPad}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow className="text-mg-mint">Daily chart</Eyebrow>
            <h2 className={h2}>Өдрийн шинжилгээ</h2>
          </div>
          <Link
            href="/analysis"
            className="py-3 font-semibold text-base text-mg-sky hover:text-mg-mint"
          >
            Бүгдийг харах →
          </Link>
        </div>
        <div className="flex flex-wrap gap-5">
          {analyses.slice(0, 3).map((a) => (
            <AnalysisCard key={a.id} analysis={a} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Join() {
  return (
    <section
      id="join"
      className="relative overflow-hidden bg-mg-blue px-4 pt-20 pb-28 text-white sm:px-[clamp(16px,4vw,64px)] lg:pt-30 lg:pb-38"
    >
      <div
        aria-hidden="true"
        className="absolute top-0 right-[8%] h-60 w-105 bg-linear-135 from-mg-navy/0 to-mg-orange/90 [clip-path:polygon(0_0,55%_0,100%_100%,45%_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute right-[16%] bottom-8 hidden h-50 w-95 bg-linear-to-r from-mg-orange to-mg-orange/20 [clip-path:polygon(0_0,55%_0,100%_100%,45%_100%)] lg:block"
      />
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center gap-12">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6">
          <HighlightTitle
            className="text-[clamp(40px,5.6vw,80px)]"
            lines={[
              { text: "Traders", className: "bg-white text-mg-navy" },
              { text: "Dept.", className: "bg-white text-mg-navy", indent: true },
            ]}
          />
          <p className="m-0 max-w-130 text-lg leading-relaxed lg:text-[19px]">
            Million Goats хамт олонд нэгдэж, шинжилгээ, live дамжуулалт, сургалтын мэдээллийг
            хамгийн түрүүнд аваарай.
          </p>
        </div>
        <JoinForm />
      </div>
      <ChevronStrip id="mg-chevron-join" variant="mixed" className="absolute inset-x-0 bottom-0" />
    </section>
  );
}
