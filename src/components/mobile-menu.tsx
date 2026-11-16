"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { navLinks } from "@/lib/content";

export function MobileMenu({ current }: { current?: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Цэс хаах" : "Цэс нээх"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex size-11 items-center justify-center rounded-[10px] border border-white/25 bg-transparent"
      >
        <svg
          aria-hidden="true"
          className="size-5.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {open ? (
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </>
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h10" />
            </>
          )}
        </svg>
      </button>

      <nav
        id={panelId}
        aria-label="Гар утасны цэс"
        hidden={!open}
        className="absolute inset-x-0 top-full border-white/10 border-t bg-mg-navy px-4 pb-6"
      >
        <ul className="m-0 flex list-none flex-col p-0">
          {navLinks.map((l) => (
            <li key={l.href} className="border-white/10 border-b">
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={current === l.href ? "page" : undefined}
                className={`block py-4 font-medium text-lg ${current === l.href ? "text-mg-mint" : "text-white"}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
