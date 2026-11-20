// Single source of truth for brand + SEO settings.
// TODO: set NEXT_PUBLIC_SITE_URL to the production domain (https://www.milliongoats.mn).

import { team } from "./content";
import { ROOM_IDS, TOTAL_SEATS } from "./lab/seats";

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
  /** Home page <title>; other pages use "<page> | Million Goats". */
  homeTitle: "Million Goats — Forex трейдинг сургалт ба Trading Lab",
  description: `Million Goats — шинэ үеийн трейдерүүдийн хамт олон. ${team.length} багштай Forex трейдинг сургалт, Trading Lab: ${ROOM_IDS.length} танхим, ${TOTAL_SEATS} суудал. Улаанбаатар.`,
  keywords: [
    "Million Goats",
    "трейдинг",
    "трейдинг сургалт",
    "Forex",
    "Forex сургалт",
    "Trading Lab",
    "трейдерүүдийн хамт олон",
    "Улаанбаатар",
  ],
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
  contact: {
    web: "www.milliongoats.mn",
    webUrl: "https://www.milliongoats.mn",
    email: "info@milliongoats.mn",
    phone: "9978 3585",
    phoneHref: "tel:+97699783585",
    address: "Улаанбаатарын Их Сургууль, Улаанбаатар",
    /** Structured parts of `address` for schema.org. */
    streetAddress: "Улаанбаатарын Их Сургууль",
    locality: "Улаанбаатар",
    country: "MN",
    /** Google Maps pin for the address. */
    mapUrl: "https://maps.app.goo.gl/wGmqxhpBwc4SY6nK6",
  },
} as const;
