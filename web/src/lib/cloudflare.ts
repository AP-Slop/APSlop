import { getCloudflareContext } from "@opennextjs/cloudflare";

/** The Worker's bindings (wrangler.jsonc) on Cloudflare Workers; undefined under Node (docker / next dev / tests). */
export function cloudflareEnv<T>(): Partial<T> | undefined {
  try {
    return getCloudflareContext().env as Partial<T>;
  } catch {
    return undefined;
  }
}
