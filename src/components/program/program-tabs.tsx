"use client";

import Image from "next/image";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import type { TeamMember } from "@/lib/content";
import { PROGRAM_TOPICS, PROGRAM_WEEKS } from "@/lib/program";

/**
 * Phone and tablet view of the programme: one tab per teacher, each listing
 * the 8 weeks. Opens the teacher named in the URL hash, e.g. /program#temuujin.
 */
export function ProgramTabs({ teachers }: { teachers: TeamMember[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    function fromHash() {
      const i = teachers.findIndex((t) => `#${t.id}` === window.location.hash);
      if (i >= 0) setActive(i);
    }
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [teachers]);

  function onKeyDown(e: KeyboardEvent) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + teachers.length) % teachers.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  const teacher = teachers[active];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Багш"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        onKeyDown={onKeyDown}
      >
        {teachers.map((t, i) => {
          const selected = i === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`flex min-h-14 cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition ${
                selected
                  ? "border-mg-blue bg-mg-blue text-white shadow-[0_8px_24px_rgba(0,104,255,0.35)]"
                  : "border-white/5 bg-mg-card text-white hover:border-mg-blue/60"
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-sm font-bold text-xs ${
                  selected ? "bg-white text-mg-blue" : "bg-mg-blue text-white"
                }`}
              >
                {i + 1}
              </span>
              <span className="font-bold text-[13px] uppercase leading-tight tracking-wide">
                {t.role}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${teacher.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${teacher.id}`}
        className="mt-4 overflow-hidden rounded-2xl bg-mg-card text-white ring-1 ring-white/5"
      >
        <div className="flex items-center gap-4 bg-[#071331] p-4">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-mg-navy ring-2 ring-mg-blue">
            <Image
              src={teacher.photo}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
              style={{ objectPosition: `50% ${teacher.focus}` }}
            />
          </div>
          <div className="min-w-0">
            <p className="m-0 font-semibold text-mg-sky text-xs uppercase tracking-[0.12em]">
              {active + 1} · {teacher.role}
            </p>
            <p className="m-0 font-bold text-xl uppercase leading-tight">
              {teacher.name}
              {teacher.nickname && ` · ${teacher.nickname}`}
            </p>
          </div>
        </div>
        <ol className="m-0 list-none p-0">
          {PROGRAM_WEEKS.map((dates, w) => (
            <li
              key={dates}
              className="flex gap-4 border-white/10 border-t px-4 py-3.5 first:border-t-0"
            >
              <span className="flex w-16 shrink-0 flex-col">
                <span className="font-bold text-2xl leading-none">{w + 1}</span>
                <span className="mt-1 font-medium text-[11px] text-mg-sky">{dates}</span>
              </span>
              <span className="self-center font-medium text-[15px] text-white/85 leading-snug">
                {PROGRAM_TOPICS[teacher.id]?.[w]}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
