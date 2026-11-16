import Image from "next/image";
import Link from "next/link";
import { navLinks, socialLinks } from "@/lib/content";
import { site } from "@/lib/site";
import { ColorBar } from "./brand";

function FooterHeading({ children }: { children: string }) {
  return (
    <p className="m-0 mb-1 font-bold text-[13px] text-white uppercase tracking-widest">
      {children}
    </p>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-mg-navy text-[15px] text-mg-on-dark">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-12 px-4 pt-20 pb-14 sm:px-[clamp(16px,4vw,64px)] xl:px-0">
        <div className="flex min-w-0 flex-[2_1_320px] flex-col gap-5">
          <Image
            src={site.logos.horizontalOnDark}
            alt={site.name}
            width={1200}
            height={332}
            className="h-11 w-auto self-start"
          />
          <p className="m-0 max-w-sm leading-relaxed">
            {site.tagline} Шинэ үеийн трейдерүүдийн хамт олон.
          </p>
        </div>

        <nav aria-label="Хамт олон" className="flex flex-[1_1_160px] flex-col gap-3">
          <FooterHeading>Хамт олон</FooterHeading>
          {navLinks.slice(0, 4).map((l) => (
            <Link key={l.href} href={l.href} className="text-mg-on-dark hover:text-mg-mint">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-[1_1_160px] flex-col gap-3">
          <FooterHeading>Сошиал</FooterHeading>
          {socialLinks.map((s) =>
            s.href ? (
              <a key={s.label} href={s.href} className="text-mg-on-dark hover:text-mg-mint">
                {s.label}
              </a>
            ) : (
              <span key={s.label}>{s.label}</span>
            ),
          )}
        </div>

        <address className="flex flex-[1_1_220px] flex-col gap-3 not-italic">
          <FooterHeading>Холбоо барих</FooterHeading>
          <a href={site.contact.webUrl} className="text-mg-on-dark hover:text-mg-mint">
            {site.contact.web}
          </a>
          <a href={`mailto:${site.contact.email}`} className="text-mg-on-dark hover:text-mg-mint">
            {site.contact.email}
          </a>
          <span>{site.contact.phone}</span>
          <span>{site.contact.address}</span>
        </address>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 border-white/10 border-t px-4 py-6 text-[#8A94A8] text-[13px] sm:px-[clamp(16px,4vw,64px)] xl:px-0">
        <span>© {site.name}. Бүх эрх хуулиар хамгаалагдсан.</span>
        <span>Арилжаа нь эрсдэлтэй. Контент нь боловсролын зорилготой.</span>
      </div>
      <ColorBar />
    </footer>
  );
}
