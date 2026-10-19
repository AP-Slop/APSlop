"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function RepoTabs({
  name,
  openIssues,
  openPulls,
  showSettings,
}: {
  name: string;
  openIssues: number;
  openPulls: number;
  showSettings: boolean;
}) {
  const pathname = usePathname();
  const base = `/repos/${name}`;
  const tabs = [
    { href: base, label: "Code", match: (p: string) => p === base || p.startsWith(`${base}/tree`) || p.startsWith(`${base}/blob`) },
    { href: `${base}/pulls`, label: "Pull requests", match: (p: string) => p.startsWith(`${base}/pulls`), count: openPulls },
    { href: `${base}/issues`, label: "Issues", match: (p: string) => p.startsWith(`${base}/issues`), count: openIssues },
    { href: `${base}/releases`, label: "Releases", match: (p: string) => p.startsWith(`${base}/releases`) },
    ...(showSettings ? [{ href: `${base}/settings`, label: "Settings", match: (p: string) => p.startsWith(`${base}/settings`) }] : []),
  ];
  return (
    <nav className="flex gap-1 mt-4 -mb-px overflow-x-auto">
      {tabs.map((t) => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-3 py-2 text-sm border-b-2 whitespace-nowrap ${active ? "border-[#fd8c73] font-semibold" : "border-transparent text-fg-muted hover:border-border"}`}
          >
            {t.label}
            {typeof t.count === "number" && t.count > 0 && (
              <span className="ml-1.5 rounded-full bg-[#eef1f4] px-1.5 text-xs text-fg">{t.count}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
