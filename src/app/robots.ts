import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private or per-user pages; they also send noindex.
      disallow: ["/api/", "/admin", "/account", "/orders/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
