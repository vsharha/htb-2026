import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  agentRules: false,
  // Compile and runtime errors still show; this hides only the floating badge.
  devIndicators: false,
  outputFileTracingRoot: path.join(process.cwd(), ".."),
  outputFileTracingIncludes: {
    "/*": ["../data/analysis/*.csv", "../data/analysis/columns.json"],
    "/api/tracts": ["../data/analysis/nyc_tracts.geojson"],
    "/api/competitors": ["../data/subway/stations.csv", "../data/streets/intersections.csv", "../data/competitors/*.json"],
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
