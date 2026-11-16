// Single source of truth for brand + SEO settings.
// TODO: replace `description` and `keywords` with the real copy, and set
// NEXT_PUBLIC_SITE_URL to the production domain (e.g. https://milliongoats.com).

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Million Goats",
  shortName: "Million Goats",
  description: "Million Goats — official website.",
  keywords: ["Million Goats"],
  url: resolveSiteUrl().replace(/\/$/, ""),
  locale: "en_US",
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
  },
} as const;
