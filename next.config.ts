import type { NextConfig } from "next";
import { PRODUCTION_HOST } from "./src/constants/site";

const nextConfig: NextConfig = {
  // No cacheComponents / partialPrefetching: on the Workers runtime they hang the request
  // (Next relies on setTimeout semantics Workers do not provide) → Error 1101.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Only the production host may be indexed: *.workers.dev and preview URLs get noindex.
  async headers() {
    return [
      {
        source: "/:path*",
        ...(PRODUCTION_HOST && { missing: [{ type: "host" as const, value: PRODUCTION_HOST }] }),
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
