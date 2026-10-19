/** Pages for people who build apps; everything else (the store, unknown pages) is for visitors. */
export function isDeveloperPath(pathname: string): boolean {
  return ["/dashboard", "/repos", "/new"].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** A path on this site to return to after signing in; anything else (other sites, "//host") falls back to "/". */
export function safeReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}
