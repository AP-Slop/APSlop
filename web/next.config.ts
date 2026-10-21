import type { NextConfig } from "next";

// Set by `npm run cf:build` / `preview` / `deploy` (Cloudflare Workers build).
const cloudflare = process.env.APSLOP_CF === "1";

const nextConfig: NextConfig = {
  output: "standalone",
  ...(cloudflare && {
    turbopack: { resolveAlias: { "@/generated/prisma/client": "./src/generated/prisma-cf/client.ts" } },
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
