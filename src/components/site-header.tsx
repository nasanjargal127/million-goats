import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { navLinks } from "@/lib/content";
import { site } from "@/lib/site";
import { MobileMenu } from "./mobile-menu";
import { UserNav, UserNavFallback } from "./user-nav";

export function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="relative z-20 bg-mg-navy px-4 text-white sm:px-[clamp(16px,4vw,64px)]">
      <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-8 py-3 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label={`${site.name} нүүр`} className="flex items-center">
          <Image
            src={site.logos.horizontalOnDark}
            alt={site.name}
            width={1200}
            height={332}
            priority
            className="h-8 w-auto lg:h-9"
          />
        </Link>

        <nav aria-label="Үндсэн цэс" className="hidden lg:block">
          <ul className="m-0 flex list-none items-center gap-2 whitespace-nowrap p-0 font-semibold text-[15px] xl:gap-3">
            {navLinks.map((l) => {
              const isCurrent = current === l.href;
              const featured = "featured" in l && l.featured;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`block rounded-xl border px-3 py-2 transition-colors ${
                      featured
                        ? "border-mg-blue/80 bg-[#010a20] text-[#2a7bff] hover:border-mg-blue hover:text-mg-sky"
                        : `border-transparent hover:text-mg-sky ${isCurrent ? "text-mg-sky" : "text-white"}`
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2 lg:justify-end lg:gap-3">
          <Suspense fallback={<UserNavFallback />}>
            <UserNav />
          </Suspense>
          <MobileMenu current={current} />
        </div>
      </div>
    </header>
  );
}
