// Single source of truth for brand + SEO settings.
// TODO: set NEXT_PUBLIC_SITE_URL to the production domain (https://www.milliongoats.mn).

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Million Goats",
  shortName: "Million Goats",
  tagline: "One community. A million goals.",
  description:
    "Million Goats — шинэ үеийн трейдерүүдийн хамт олон. Live техник шинжилгээ, өдрийн чарт, сургалт ба менторшип.",
  keywords: ["Million Goats", "трейдинг", "техник шинжилгээ", "Forex", "трейдерүүдийн хамт олон"],
  url: resolveSiteUrl().replace(/\/$/, ""),
  locale: "mn_MN",
  colors: {
    blue: "#0068FF",
    navy: "#010D26",
  },
  logos: {
    stackedOnLight: "/brand/stacked-blue-navy.png",
    stackedOnDark: "/brand/stacked-blue-white.png",
    horizontalOnLight: "/brand/horizontal-blue-navy.png",
    horizontalOnDark: "/brand/horizontal-blue-white.png",
    symbol: "/brand/symbol-blue.png",
    symbolOnDark: "/brand/symbol-white.png",
  },
  // TODO: fill in real contact details.
  contact: {
    web: "www.milliongoats.mn",
    webUrl: "https://www.milliongoats.mn",
    email: "info@milliongoats.mn",
    phone: "[УТАС]",
    address: "[ХАЯГ], Улаанбаатар",
  },
} as const;
