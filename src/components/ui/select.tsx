import type { ComponentProps } from "react";

const TONES = {
  /** On the navy pages (merch, lab). */
  dark: {
    select: "rounded-lg border-white/10 bg-mg-card text-white",
    chevron: "text-white/55",
  },
  /** On white cards (admin). */
  light: {
    select: "rounded-xl border-mg-line bg-white text-mg-navy",
    chevron: "text-mg-muted",
  },
} as const;

const SIZES = {
  md: { select: "min-h-12 pr-11 pl-4 text-base", chevron: "right-4 size-4" },
  sm: { select: "min-h-10 pr-9 pl-3 text-sm", chevron: "right-3 size-3.5" },
} as const;

/**
 * Native <select> with the browser arrow replaced by a brand chevron that sits
 * inside the field's padding, so it never touches the border. Use this for
 * every select, so they all look the same.
 */
export function Select({
  tone = "dark",
  size = "md",
  className = "",
  wrapperClassName = "",
  children,
  ...props
}: Omit<ComponentProps<"select">, "size"> & {
  tone?: keyof typeof TONES;
  size?: keyof typeof SIZES;
  wrapperClassName?: string;
}) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <select
        {...props}
        className={`w-full cursor-pointer appearance-none border py-0 focus:border-mg-blue disabled:cursor-not-allowed disabled:opacity-60 ${TONES[tone].select} ${SIZES[size].select} ${className}`}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${TONES[tone].chevron} ${SIZES[size].chevron}`}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 6l4 4 4-4" />
      </svg>
    </div>
  );
}
