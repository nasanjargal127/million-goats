import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import { Suspense } from "react";
import { JsonLd } from "@/components/json-ld";
import { GoatBackdrop } from "@/components/motion/goat-backdrop";
import { MotionProvider } from "@/components/motion/reveal";
import { socialLinks } from "@/lib/content";
import { ORGANIZATION_ID } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

// Brand typeface (Visual Guideline v2.0). Cyrillic subset for Mongolian copy.
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "cyrillic"],
});

// favicon.ico, icon.png, apple-icon.png, opengraph-image.png and
// twitter-image.png in this folder are picked up automatically by Next.js.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.homeTitle,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  // Canonical URLs and og:url are set per page (see pageMetadata in lib/seo.ts), so
  // pages without one, like 404s, don't point search engines at the home page.
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.homeTitle,
    description: site.description,
    locale: site.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: site.homeTitle,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    title: site.shortName,
    capable: true,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: site.colors.navy },
    { media: "(prefers-color-scheme: dark)", color: site.colors.navy },
  ],
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": ORGANIZATION_ID,
      name: site.name,
      url: site.url,
      logo: `${site.url}${site.logos.stackedOnLight}`,
      description: site.description,
      telephone: site.contact.phoneHref.replace("tel:", ""),
      email: site.contact.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.contact.streetAddress,
        addressLocality: site.contact.locality,
        addressCountry: site.contact.country,
      },
      sameAs: socialLinks.flatMap((s) => (s.href ? [s.href] : [])),
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      inLanguage: "mn",
      publisher: { "@id": ORGANIZATION_ID },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={`${rubik.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <JsonLd data={siteJsonLd} />
        <MotionProvider>
          {children}
          {/* Reads the pathname, which on dynamic routes is request data. */}
          <Suspense fallback={null}>
            <GoatBackdrop />
          </Suspense>
        </MotionProvider>
      </body>
    </html>
  );
}
