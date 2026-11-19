import Link from "next/link";

export function FilterLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-10 items-center rounded-md border px-4 font-semibold text-sm transition ${
        active
          ? "border-mg-blue bg-mg-blue text-white"
          : "border-mg-line bg-white text-mg-navy hover:border-mg-blue"
      }`}
    >
      {label}
    </Link>
  );
}

const SECTIONS = [
  { href: "/admin", key: "sales", label: "Борлуулалт" },
  { href: "/admin/users", key: "users", label: "Хэрэглэгчид" },
] as const;

/** Switches between the admin pages. */
export function AdminNav({ current }: { current: (typeof SECTIONS)[number]["key"] }) {
  return (
    <nav aria-label="Админ" className="flex flex-wrap gap-2">
      {SECTIONS.map((s) => (
        <FilterLink key={s.key} href={s.href} active={s.key === current} label={s.label} />
      ))}
    </nav>
  );
}
