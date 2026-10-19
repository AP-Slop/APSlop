/** Pages for people who build apps; everything else (the store, unknown pages) is for visitors. */
export function isDeveloperPath(pathname: string): boolean {
  return ["/dashboard", "/repos", "/new"].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
