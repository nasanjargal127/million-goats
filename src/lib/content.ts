// Site copy and navigation.

export const navLinks = [
  { href: "/#about", label: "Бидний тухай" },
  { href: "/lab", label: "Trading Lab" },
  { href: "/merch", label: "Merch" },
] as const;

// TODO: add real profile URLs; entries without an href render as plain text.
export const socialLinks: { label: string; href?: string }[] = [
  { label: "Facebook" },
  { label: "Instagram" },
  { label: "YouTube" },
  { label: "Discord" },
];
