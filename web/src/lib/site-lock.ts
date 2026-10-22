// The site lock: while SITE_PASSWORD is set, every request needs it (HTTP Basic auth, any user name).
// Runs in cloudflare/worker.ts before anything else, so it covers pages, APIs, static files and the store.

/** Requests that prove themselves another way and pass without the password. */
function provesItself(request: Request, pathname: string): boolean {
  // GitHub signs its webhooks (GITHUB_WEBHOOK_SECRET); the store app upload carries X-Store-Token.
  return (
    (request.method === "POST" && pathname === "/api/webhooks/github") ||
    (request.method === "PUT" && pathname === "/_store/store-app")
  );
}

/** The password of a Basic Authorization header, or null. */
export function basicPassword(header: string | null): string | null {
  const m = header?.match(/^Basic\s+([A-Za-z0-9+/=]+)\s*$/i);
  if (!m) return null;
  let decoded: string;
  try {
    decoded = new TextDecoder().decode(Uint8Array.from(atob(m[1]), (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
  const colon = decoded.indexOf(":");
  return colon < 0 ? null : decoded.slice(colon + 1);
}

async function samePassword(given: string, expected: string): Promise<boolean> {
  const digest = async (s: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  const [a, b] = await Promise.all([digest(given), digest(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** A 401 that asks the browser for the password, or null when the request may go on. */
export async function siteLock(request: Request, password: string | undefined): Promise<Response | null> {
  if (!password) return null;
  if (provesItself(request, new URL(request.url).pathname)) return null;
  const given = basicPassword(request.headers.get("authorization"));
  if (given !== null && (await samePassword(given, password))) return null;
  return new Response("This site is private.", {
    status: 401,
    headers: { "www-authenticate": 'Basic realm="APSlop", charset="UTF-8"', "cache-control": "no-store" },
  });
}
