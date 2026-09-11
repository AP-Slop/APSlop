import Link from "next/link";
import type { TreeEntry } from "@/lib/github";
import { Card, CardHeader } from "@/components/ui";

export function Breadcrumbs({ name, path }: { name: string; path: string }) {
  const parts = path ? path.split("/") : [];
  return (
    <div className="text-sm mb-3 flex flex-wrap gap-1">
      <Link href={`/repos/${name}`} className="text-accent hover:underline font-semibold">{name}</Link>
      {parts.map((p, i) => {
        const sub = parts.slice(0, i + 1).join("/");
        const last = i === parts.length - 1;
        return (
          <span key={sub} className="flex gap-1">
            <span className="text-fg-muted">/</span>
            {last ? <span className="font-semibold">{p}</span> : <Link href={`/repos/${name}/tree/${sub}`} className="text-accent hover:underline">{p}</Link>}
          </span>
        );
      })}
    </div>
  );
}

export function FileTree({ name, path, entries, branch }: { name: string; path: string; entries: TreeEntry[]; branch: string }) {
  const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
  return (
    <Card>
      <CardHeader>
        <span className="font-mono text-xs rounded border border-border px-1.5 py-0.5 bg-canvas">{branch}</span>
        <span className="text-fg-muted font-normal">{entries.length} 項目</span>
      </CardHeader>
      <ul className="divide-y divide-border text-sm">
        {path && (
          <li className="px-4 py-1.5">
            <Link href={parent ? `/repos/${name}/tree/${parent}` : `/repos/${name}`} className="text-accent hover:underline">..</Link>
          </li>
        )}
        {entries.map((e) => (
          <li key={e.path} className="px-4 py-1.5 flex items-center gap-2 hover:bg-canvas-subtle">
            <span className="w-4 text-center text-fg-muted">{e.type === "dir" ? "📁" : "📄"}</span>
            <Link href={`/repos/${name}/${e.type === "dir" ? "tree" : "blob"}/${e.path}`} className="hover:text-accent hover:underline">
              {e.name}
            </Link>
            {e.type === "file" && <span className="ml-auto text-xs text-fg-muted">{e.size} B</span>}
          </li>
        ))}
      </ul>
    </Card>
  );
}
