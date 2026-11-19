import type { ReactNode } from "react";

/** Small uppercase label above section titles. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`m-0 mb-5 font-semibold text-sm uppercase tracking-[0.14em] ${className}`}>
      {children}
    </p>
  );
}

/** The brand's square full stop, in blue (as in the home hero headline). */
export function BrandDot() {
  return (
    <>
      <span
        aria-hidden="true"
        className="ml-[0.04em] inline-block size-[0.15em] translate-y-[-0.02em] rounded-[0.02em] bg-mg-blue align-baseline"
      />
      <span className="sr-only">.</span>
    </>
  );
}

/**
 * Section headline in the home hero's style: bold uppercase lines ending in the
 * blue square dot. Colour comes from the section.
 */
export function SectionTitle({
  as: Tag = "h2",
  lines,
  size = "text-[clamp(34px,4.6vw,64px)]",
  dot = true,
  className = "",
}: {
  as?: "h1" | "h2";
  lines: string[];
  /** Font-size class; kept separate so it never competes with a default. */
  size?: string;
  /** End with the blue square dot (off for the plain centred section titles). */
  dot?: boolean;
  className?: string;
}) {
  return (
    <Tag
      className={`m-0 font-bold uppercase leading-[0.95] tracking-[-0.02em] ${size} ${className}`}
    >
      {lines.map((line, i) => (
        <span key={line} className="block">
          {line}
          {dot && i === lines.length - 1 && <BrandDot />}
        </span>
      ))}
    </Tag>
  );
}

export function ArrowRight({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
