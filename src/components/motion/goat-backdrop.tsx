"use client";

import {
  type MotionValue,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef } from "react";

/**
 * Pages that draw the goat themselves (behind their navy sections) or already
 * fill the screen with their own scene.
 */
const HIDDEN_ON = new Set(["/", "/program", "/merch", "/lab"]);

/** Softness of the drawing edge, in % of the goat's height. */
const EDGE = 8;

/**
 * The Million Goats goat (line art from the brand book), drawing itself in from
 * the horns down as `progress` goes 0 → 0.7. Blended with `screen`, so it glows
 * on navy and disappears on white.
 */
function GoatArt({
  progress,
  sizes,
  className,
  opacity = "opacity-25",
}: {
  progress: MotionValue<number>;
  sizes: string;
  className: string;
  /** Opacity class for the drawing. */
  opacity?: string;
}) {
  const reduce = useReducedMotion();
  // Smooth the raw scroll position so the drawing edge glides.
  const p = useSpring(progress, { stiffness: 90, damping: 26, mass: 0.4 });
  const drawn = useTransform(p, [0, 0.7], [14, 100 + EDGE], { clamp: true });
  const solid = useTransform(drawn, (d) => d - EDGE);
  const mask = useMotionTemplate`linear-gradient(to bottom, #000 ${solid}%, transparent ${drawn}%)`;

  return (
    <motion.div
      className={`mix-blend-screen ${opacity}`}
      style={reduce ? undefined : { maskImage: mask, WebkitMaskImage: mask }}
    >
      <Image
        src="/brand/goat-line.png"
        alt=""
        width={1000}
        height={993}
        sizes={sizes}
        className={className}
      />
    </motion.div>
  );
}

/**
 * The goat centred over every page, drawn in as the visitor scrolls (fully
 * drawn by ~70% of the page). It never takes clicks.
 */
export function GoatBackdrop() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  if (HIDDEN_ON.has(pathname)) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center overflow-hidden"
    >
      <GoatArt
        progress={scrollYProgress}
        sizes="(min-width: 768px) 640px, 80vw"
        className="h-auto w-[min(80vw,640px)]"
      />
    </div>
  );
}

/**
 * The goat behind a run of navy sections, offset to the right and kept in view
 * while they scroll past. Its parent must be `relative isolate` with the navy
 * background, and the sections in it transparent.
 */
export function SectionGoat() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="sticky top-0 flex h-svh items-center justify-end overflow-hidden">
        <GoatArt
          progress={scrollYProgress}
          sizes="(min-width: 768px) 900px, 110vw"
          opacity="opacity-15"
          className="h-auto w-[min(110vw,900px)] max-w-none translate-x-[22%]"
        />
      </div>
    </div>
  );
}
