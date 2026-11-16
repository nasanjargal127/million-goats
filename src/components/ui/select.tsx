import type { ComponentProps } from "react";

/**
 * Native <select> with the browser arrow replaced by a brand chevron that sits
 * inside the field's padding, so it never touches the border.
 */
export function Select({
  className = "",
  wrapperClassName = "",
  children,
  ...props
}: ComponentProps<"select"> & { wrapperClassName?: string }) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <select
        {...props}
        className={`min-h-12 w-full cursor-pointer appearance-none rounded-xl border border-mg-line bg-white py-0 pr-11 pl-4 text-base text-mg-navy focus:border-mg-blue disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-mg-muted"
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
