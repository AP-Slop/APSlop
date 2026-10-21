import type { NextConfig } from "next";

// Set by `npm run cf:build` / `preview` / `deploy` (Cloudflare Workers build).
const cloudflare = process.env.APSLOP_CF === "1";

const nextConfig: NextConfig = {
  output: "standalone",
  ...(cloudflare && {
    turbopack: {
      resolveAlias: {
        "@/generated/prisma/client": "./src/generated/prisma-cf/client.ts",
        "@prisma/adapter-libsql": "./src/lib/libsql-unavailable.ts",
      },
    },
    // Dev/CLI tooling that gets traced but never runs in the Worker; it would push the Worker past its size limit.
    outputFileTracingExcludes: {
      "*": [
        "node_modules/prisma/**",
        "node_modules/@prisma/dev/**",
        "node_modules/@prisma/client/runtime/*.wasm",
        "node_modules/@prisma/client/runtime/*-base64.mjs",
        "node_modules/@electric-sql/**",
        "node_modules/@libsql/**",
        "node_modules/libsql/**",
        "node_modules/wrangler/**",
        "node_modules/miniflare/**",
        "node_modules/@cloudflare/**",
        "node_modules/cloudflare/**",
        "node_modules/effect/**",
        "node_modules/esbuild/**",
        "node_modules/@esbuild/**",
      ],
    },
  }),
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
  images: {
    // No image optimizer on Cloudflare Workers; the images are small avatars and app icons.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
