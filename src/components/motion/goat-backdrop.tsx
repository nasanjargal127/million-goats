"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { usePathname } from "next/navigation";

/** Pages that already fill the screen with their own scene. */
const HIDDEN_ON = new Set(["/lab"]);

/** Softness of the drawing edge, in % of the goat's height. */
const EDGE = 8;

/**
 * The Million Goats goat (line art from the brand book) stays centred
 * behind every page and draws itself in from the horns down as the visitor
 * scrolls: fully drawn by ~70% of the page. It is blended with `screen`, so it
 * glows on navy/blue sections and disappears on white ones, and it never
 * takes clicks.
 */
export function GoatBackdrop() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  // Smooth the raw scroll position so the drawing edge glides.
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  // How much of the goat is drawn, top to bottom (the horns show at the top of the page).
  const drawn = useTransform(p, [0, 0.7], [14, 100 + EDGE], { clamp: true });
  const solid = useTransform(drawn, (d) => d - EDGE);
  const mask = useMotionTemplate`linear-gradient(to bottom, #000 ${solid}%, transparent ${drawn}%)`;

  if (HIDDEN_ON.has(pathname)) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center overflow-hidden mix-blend-screen"
    >
      <motion.div
        className="opacity-25"
        style={reduce ? undefined : { maskImage: mask, WebkitMaskImage: mask }}
      >
        <Image
          src="/brand/goat-line.png"
          alt=""
          width={1000}
          height={993}
          sizes="(min-width: 768px) 640px, 80vw"
          className="h-auto w-[min(80vw,640px)]"
        />
      </motion.div>
    </div>
  );
}
