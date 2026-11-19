import type { ReactNode } from "react";
import { SectionTitle } from "./brand";

/**
 * Navy title band at the top of inner pages, in the home hero's style: a soft
 * blue glow, the bold headline with the blue square dot, and a glowing rule
 * along the bottom. `aside` sits to the right on wide screens.
 */
export function PageHero({ title, aside }: { title: string[]; aside?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-mg-navy px-4 py-14 text-white sm:px-[clamp(16px,4vw,64px)] lg:py-18">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_90%_at_85%_100%,rgba(0,104,255,0.38),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-mg-blue/0 via-mg-blue to-mg-blue/0 shadow-[0_0_24px_rgba(0,104,255,0.8)]"
      />
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6">
        <SectionTitle as="h1" lines={title} size="text-[clamp(34px,5vw,68px)]" />
        {aside}
      </div>
    </section>
  );
}
