import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // Compile and runtime errors still show; this hides only the floating badge.
  devIndicators: false,
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
