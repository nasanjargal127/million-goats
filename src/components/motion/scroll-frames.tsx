"use client";

import {
  type MotionValue,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { type ReactNode, useRef } from "react";

/**
 * Frames of one 3D render (same size and camera crop) that crossfade into each
 * other as the box scrolls through the viewport, so the object seems to turn
 * or grow. Decorative: hidden from assistive tech and never takes clicks. With
 * reduced motion only the last frame shows.
 */
export function ScrollFrames({
  frames,
  width,
  height,
  sizes,
  className,
  range = [0.15, 0.6],
}: {
  frames: readonly string[];
  /** Intrinsic size shared by every frame. */
  width: number;
  height: number;
  sizes: string;
  /** Must position the box (relative or absolute): the later frames stack inside it. */
  className: string;
  /**
   * Stretch of the scroll over which the frames play: 0 is the box's top
   * reaching the bottom of the screen, 1 its bottom leaving the top.
   */
  range?: readonly [number, number];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const last = frames.length - 1;

  const image = (src: string) => (
    <Image src={src} alt="" width={width} height={height} sizes={sizes} className="h-auto w-full" />
  );

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`}>
      {reduce
        ? image(frames[last])
        : frames.map((src, i) => (
            <Frame key={src} progress={progress} index={i} count={frames.length} range={range}>
              {image(src)}
            </Frame>
          ))}
    </div>
  );
}

/** One frame: fades in as the previous one leaves and out as the next arrives. */
function Frame({
  progress,
  index,
  count,
  range,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
  range: readonly [number, number];
  children: ReactNode;
}) {
  const [from, to] = range;
  const at = (k: number) => from + (k * (to - from)) / (count - 1);
  const first = index === 0;
  const last = index === count - 1;
  const input = first
    ? [at(0), at(1)]
    : last
      ? [at(index - 1), at(index)]
      : [at(index - 1), at(index), at(index + 1)];
  const output = first ? [1, 0] : last ? [0, 1] : [0, 1, 0];
  const opacity = useTransform(progress, input, output);

  // The first frame stays in flow and sizes the box; the rest stack over it.
  return (
    <motion.div style={{ opacity }} className={first ? undefined : "absolute inset-0"}>
      {children}
    </motion.div>
  );
}
