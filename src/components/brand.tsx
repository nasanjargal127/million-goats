import type { ReactNode } from "react";

/** Staggered Rubik Black highlight boxes — the brand's signature headline treatment. */
export function HighlightTitle({
  as: Tag = "h2",
  lines,
  className = "",
}: {
  as?: "h1" | "h2" | "p";
  lines: { text: ReactNode; className: string; indent?: boolean }[];
  className?: string;
}) {
  return (
    <Tag
      className={`m-0 flex flex-col items-start gap-2 font-black uppercase leading-none tracking-tight ${className}`}
    >
      {lines.map((line, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: static, never reordered
          key={i}
          className={`px-[0.3em] pt-[0.14em] pb-[0.06em] ${line.indent ? "ml-[0.9em]" : ""} ${line.className}`}
        >
          {line.text}
        </span>
      ))}
    </Tag>
  );
}

/** Small uppercase label above section titles. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`m-0 mb-3 font-semibold text-[15px] ${className}`}>{children}</p>;
}

const chevronPatterns = {
  blue: { a: "#0068FF", b: "#0068FF", c: "#55A2FF", d: "#FF3600", bg: "transparent" },
  mixed: { a: "#0068FF", b: "#55A2FF", c: "#0068FF", d: "#FF3600", bg: "#FFFFFF" },
} as const;

/** Repeating chevron pattern strip built from the logo's lower "V" piece. */
export function ChevronStrip({
  id,
  variant = "blue",
  className = "",
}: {
  id: string;
  variant?: keyof typeof chevronPatterns;
  className?: string;
}) {
  const c = chevronPatterns[variant];
  return (
    <svg aria-hidden="true" className={`block h-8 w-full ${className}`}>
      <defs>
        <pattern id={id} width="96" height="32" patternUnits="userSpaceOnUse">
          <rect width="96" height="32" fill={c.bg} />
          <polygon points="0,0 14,0 24,10 34,0 48,0 32,16 16,16" fill={c.a} />
          <polygon points="48,0 62,0 72,10 82,0 96,0 80,16 64,16" fill={c.b} />
          <polygon points="24,16 38,16 48,26 58,16 72,16 56,32 40,32" fill={c.c} />
          <polygon points="72,16 86,16 96,26 106,16 120,16 104,32 88,32" fill={c.d} />
          <polygon points="-24,16 -10,16 0,26 10,16 24,16 8,32 -8,32" fill={c.d} />
        </pattern>
      </defs>
      <rect width="100%" height="32" fill={`url(#${id})`} />
    </svg>
  );
}

/** Four-segment color bar used at the bottom of brand documents. */
export function ColorBar({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex h-1.5 ${className}`}>
      <span className="flex-1 bg-mg-blue" />
      <span className="flex-1 bg-mg-sky" />
      <span className="flex-1 bg-mg-blue" />
      <span className="flex-1 bg-mg-orange" />
    </div>
  );
}

/** Small round status dot (orange = live). */
export function LiveDot({ className = "bg-mg-orange" }: { className?: string }) {
  return <span aria-hidden="true" className={`inline-block size-2 rounded-full ${className}`} />;
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
