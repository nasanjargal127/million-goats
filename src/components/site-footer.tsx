import Image from "next/image";
import Link from "next/link";
import { navLinks, socialLinks } from "@/lib/content";
import { site } from "@/lib/site";

function FooterHeading({ children }: { children: string }) {
  return (
    <p className="m-0 mb-1 font-semibold text-[11px] text-white/90 uppercase tracking-widest">
      {children}
    </p>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative bg-linear-to-b from-[#0a1734] to-mg-navy text-[14px] text-mg-on-dark-muted">
      {/* Brand colour rule: blue, sky, blue, then orange */}
      <div
        aria-hidden="true"
        className="h-0.5 bg-[linear-gradient(to_right,#0068ff_0%,#2f84ff_22%,#55a2ff_30%,#55a2ff_46%,#0068ff_54%,#0068ff_72%,#ff3600_80%,#ff3600_100%)] shadow-[0_0_18px_rgba(0,104,255,0.55)]"
      />
      <div className="mx-auto flex max-w-4xl flex-wrap gap-x-12 gap-y-10 px-4 pt-14 pb-16 sm:px-6">
        <div className="flex min-w-0 flex-[2_1_280px] flex-col gap-4">
          <Image
            src={site.logos.horizontalOnDark}
            alt={site.name}
            width={1200}
            height={332}
            className="h-10 w-auto self-start"
          />
          <p className="m-0 max-w-xs text-[13px] leading-relaxed">
            {site.tagline}
            <br />
            Шинэ үеийн трейдерүүдийн хамт олон.
          </p>
        </div>

        <nav aria-label="Хамт олон" className="flex flex-[1_1_140px] flex-col gap-2">
          <FooterHeading>Хамт олон</FooterHeading>
          {navLinks.slice(0, 4).map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-mg-sky">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-[1_1_140px] flex-col gap-2">
          <FooterHeading>Сошиал</FooterHeading>
          {socialLinks.map((s) =>
            s.href ? (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-mg-sky"
              >
                {s.label}
              </a>
            ) : (
              <span key={s.label}>{s.label}</span>
            ),
          )}
        </div>

        <address className="flex flex-[1_1_200px] flex-col gap-2 not-italic">
          <FooterHeading>Холбоо барих</FooterHeading>
          <a href={site.contact.webUrl} className="transition hover:text-mg-sky">
            {site.contact.web}
          </a>
          <a href={`mailto:${site.contact.email}`} className="transition hover:text-mg-sky">
            {site.contact.email}
          </a>
          <a href={site.contact.phoneHref} className="transition hover:text-mg-sky">
            {site.contact.phone}
          </a>
          <a
            href={site.contact.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-mg-sky"
          >
            {site.contact.address}
          </a>
        </address>
      </div>

      <div className="mx-auto flex max-w-4xl flex-wrap justify-between gap-3 px-4 pb-8 text-[#8A94A8] text-[11px] sm:px-6">
        <span>© {site.name}. Бүх эрх хуулиар хамгаалагдсан.</span>
        <span>Арилжаа нь эрсдэлтэй. Контент нь боловсролын зорилготой.</span>
      </div>
    </footer>
  );
}
