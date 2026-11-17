"use client";

import { MotionConfig, motion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Site-wide motion settings: follow the visitor's "reduce motion" preference. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/**
 * Fades and slides its children in the first time they scroll into view.
 * `from` picks the direction; `delay` staggers items in a row.
 */
export function Reveal({
  children,
  delay = 0,
  from = "below",
  className,
}: {
  children: ReactNode;
  delay?: number;
  from?: "below" | "left" | "right";
  className?: string;
}) {
  const offset = from === "below" ? { y: 32 } : { x: from === "left" ? -40 : 40 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
