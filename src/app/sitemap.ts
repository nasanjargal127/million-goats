import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Add new public routes here as pages are created. No lastModified: a fresh date on
// every request tells crawlers nothing, and they learn to ignore the field.
const routes = ["/", "/program", "/lab", "/merch"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${site.url}${route === "/" ? "" : route}`,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
