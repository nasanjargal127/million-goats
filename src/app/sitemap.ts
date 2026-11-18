import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Add new routes here as pages are created.
const routes = ["/", "/lab", "/program", "/merch"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${site.url}${route === "/" ? "" : route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
