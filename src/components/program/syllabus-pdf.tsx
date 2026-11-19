import Image from "next/image";
import { PROGRAM_PDF } from "@/lib/program";
import { site } from "@/lib/site";

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

function OpenIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

/**
 * The full syllabus PDF. Desktop gets the browser's PDF viewer inline; phones
 * (where inline PDFs barely work) get a card that opens or downloads it.
 * Sits above the site-wide goat backdrop (z-10) so the document reads clean.
 */
export function SyllabusPdf() {
  return (
    <section id="syllabus" aria-labelledby="syllabus-title" className="relative z-20 scroll-mt-24">
      <div className="overflow-hidden rounded-2xl border border-mg-line bg-white">
        <div className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden bg-mg-navy p-6 text-white sm:p-8">
          <Image
            src={site.logos.symbolOnDark}
            alt=""
            width={512}
            height={308}
            className="pointer-events-none absolute top-1/2 -right-10 w-72 -translate-y-1/2 opacity-10"
          />
          <div className="relative min-w-0">
            <p className="m-0 font-semibold text-mg-sky text-xs uppercase tracking-[0.12em]">
              Дэлгэрэнгүй хөтөлбөр · PDF · {PROGRAM_PDF.pages} хуудас
            </p>
            <h2
              id="syllabus-title"
              className="m-0 mt-2 max-w-160 font-bold text-[clamp(22px,2.6vw,32px)] uppercase leading-tight"
            >
              Мэргэжлийн трейдерийн 2 сарын сургалтын хөтөлбөр
            </h2>
            <p className="m-0 mt-2 max-w-160 text-white/70">
              Модуль бүрийн 8 лекцийн агуулга, суралцахуйн үр дүн, үнэлгээ, ном, эх сурвалж.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <a
              href={PROGRAM_PDF.href}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/25 px-5 font-semibold text-white transition hover:border-white"
            >
              <OpenIcon />
              Шинэ цонхонд нээх
            </a>
            <a
              href={PROGRAM_PDF.href}
              download={PROGRAM_PDF.fileName}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-mg-blue px-5 font-semibold text-white transition hover:brightness-110"
            >
              <DownloadIcon />
              PDF татах
            </a>
          </div>
        </div>
        <iframe
          src={`${PROGRAM_PDF.href}#view=FitH&navpanes=0`}
          title="Million Goats — хичээлийн хөтөлбөр (PDF)"
          loading="lazy"
          className="hidden h-[min(85vh,960px)] w-full border-0 bg-mg-surface md:block"
        />
      </div>
    </section>
  );
}
