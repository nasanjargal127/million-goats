"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { usePathname } from "next/navigation";

/** Pages that already fill the screen with their own scene. */
const HIDDEN_ON = new Set(["/lab"]);

/**
 * The Million Goats goat (line art from the brand book) floats behind every
 * page and drifts, turns and scales as the visitor scrolls. It is blended with
 * `screen`, so it glows on navy/blue sections and disappears on white ones,
 * and it never takes clicks.
 */
export function GoatBackdrop() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  // Smooth the raw scroll position so the goat glides instead of jumping.
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.5 });

  const x = useTransform(p, [0, 0.3, 0.65, 1], ["24vw", "-26vw", "20vw", "0vw"]);
  const y = useTransform(p, [0, 0.5, 1], ["-6vh", "4vh", "10vh"]);
  const rotate = useTransform(p, [0, 0.3, 0.65, 1], [-10, 8, -6, 0]);
  const scale = useTransform(p, [0, 0.3, 0.65, 1], [1, 1.22, 0.92, 1.15]);
  const opacity = useTransform(p, [0, 0.15, 0.85, 1], [0.2, 0.26, 0.2, 0.1]);

  if (HIDDEN_ON.has(pathname)) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center overflow-hidden mix-blend-screen"
    >
      <motion.div style={reduce ? { opacity: 0.16 } : { x, y, rotate, scale, opacity }}>
        <Image
          src="/brand/goat-line.png"
          alt=""
          width={1000}
          height={993}
          sizes="(min-width: 768px) 720px, 80vw"
          className="h-auto w-[min(80vw,720px)]"
        />
      </motion.div>
    </div>
  );
}
