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
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-8 py-3 lg:min-h-21">
        <Link href="/" aria-label={`${site.name} нүүр`} className="flex items-center">
          <Image
            src={site.logos.horizontalOnDark}
            alt={site.name}
            width={1200}
            height={332}
            priority
            className="h-8 w-auto lg:h-9.5"
          />
        </Link>

        <nav aria-label="Үндсэн цэс" className="hidden lg:block">
          <ul className="m-0 flex list-none gap-7 p-0 font-medium text-[15px]">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={current === l.href ? "page" : undefined}
                  className={`py-3 transition-colors hover:text-mg-mint ${current === l.href ? "text-mg-mint" : "text-white"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 lg:gap-3">
          <Suspense fallback={<UserNavFallback />}>
            <UserNav />
          </Suspense>
          <MobileMenu current={current} />
        </div>
      </div>
    </header>
  );
}
