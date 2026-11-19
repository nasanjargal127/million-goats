import type { Metadata } from "next";
import { site } from "./site";

// The root app/opengraph-image.png and twitter-image.png. A page that sets its own
// `openGraph` or `twitter` replaces the root's whole object (metadata merges
// shallowly) and with it the file-based image, so every page lists it again.
const shareImage = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: `${site.name} logo`,
  type: "image/png",
};

/** Title, description, canonical URL and full Open Graph / Twitter tags for a public page. */
export function pageMetadata({
  path,
  title,
  socialTitle,
  description,
}: {
  path: string;
  /** Becomes "<title> | Million Goats" through the root template. */
  title: string | { absolute: string };
  /** Title for link previews; defaults to the page title. */
  socialTitle?: string;
  description: string;
}): Metadata {
  const shareTitle = socialTitle ?? (typeof title === "string" ? title : title.absolute);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: site.name,
      locale: site.locale,
      title: shareTitle,
      description,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [shareImage],
    },
  };
}

/** Stable @id of the organisation node, so pages can point at it as provider or seller. */
export const ORGANIZATION_ID = `${site.url}/#organization`;
