import { z } from "zod";

const schema = z.object({
  GITHUB_ORG: z.string().min(1),
  GITHUB_ADMIN_TOKEN: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_WEBHOOK_SECRET: z.string().default(""),
  AUTH_SECRET: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-opus-5"),
  DATABASE_URL: z.string().default("file:./data/openap.db"),
  STORE_SERVER_URL: z.string().default("http://store-server:8080"),
  STORE_TOKEN: z.string().default(""),
  TEMPLATE_DIR: z.string().default("/app/template"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

/** Server-side env. Validated lazily so `next build` works without secrets. */
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`環境変数が不足しています: ${missing}`);
  }
  cached = parsed.data;
  return cached;
}

/**
 * Public (non-secret) settings, read at runtime on the server.
 * Next.js inlines literal `process.env.NEXT_PUBLIC_*` accesses at build time, and the Docker
 * image is built without `.env`, so the values are looked up dynamically to honour the runtime
 * environment. Only used from server components / route handlers (no client component reads it).
 */
function runtimeEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const publicEnv = {
  appUrl: runtimeEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  storeUrl: runtimeEnv("NEXT_PUBLIC_STORE_URL", "http://localhost:8080"),
  siteName: runtimeEnv("NEXT_PUBLIC_SITE_NAME", "OpenAP"),
};

export function fdroidRepoUrl(): string {
  return `${publicEnv.storeUrl.replace(/\/$/, "")}/fdroid/repo`;
}
