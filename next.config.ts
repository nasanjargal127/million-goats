import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Removed sections: send old links somewhere useful instead of a 404.
  async redirects() {
    return [
      { source: "/analysis", destination: "/", permanent: false },
      { source: "/events/:path*", destination: "/lab", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
