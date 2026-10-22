"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, Card, CardHeader, ErrorBox } from "@/components/ui";
import { Markdown } from "@/components/Markdown";

export type GeneratedFile = { path: string; content: string };
export type GeneratedApp = {
  name: string;
  slug: string;
  packageName: string;
  summary: string;
  description: string;
  files: GeneratedFile[];
};

/** New app, last step: the generated code to look over, then "Create repository". */
export function AppReview({
  initial,
  generationId,
  onStartOver,
}: {
  initial: GeneratedApp;
  generationId?: string;
  onStartOver: () => void;
}) {
  const router = useRouter();
  const [app, setApp] = useState<GeneratedApp>(initial);
  const [selected, setSelected] = useState<GeneratedFile | null>(initial.files[0] ?? null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ generated: app, generationId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not create the repository. Try again.");
      router.push(`/repos/${json.slug}`);
    } catch (e) {
      setError((e as Error).message);
      setCreating(false);
    }
  }

  // The store page shows the README, so show the one that will be committed (the template's when AI did not write one).
  const readme = app.files.find((f) => f.path === "README.md")?.content ?? app.description;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New app — review</h1>
      {error && <ErrorBox>{error}</ErrorBox>}
      <Card>
        <CardHeader>Generated app</CardHeader>
        <div className="p-4 grid gap-3 sm:grid-cols-2 text-sm">
          <label className="block">
            <span className="text-xs text-fg-muted">App name</span>
            <input value={app.name} onChange={(e) => setApp({ ...app, name: e.target.value })} className="mt-1 w-full rounded-md border border-border px-2 py-1" />
          </label>
          <label className="block">
            <span className="text-xs text-fg-muted">Repository name</span>
            <input
              value={app.slug}
              onChange={(e) => {
                const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                setApp({ ...app, slug, packageName: `dev.apslop.apps.${slug.replace(/-/g, "_")}` });
              }}
              className="mt-1 w-full rounded-md border border-border px-2 py-1 font-mono"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-fg-muted">Summary</span>
            <input value={app.summary} maxLength={80} onChange={(e) => setApp({ ...app, summary: e.target.value })} className="mt-1 w-full rounded-md border border-border px-2 py-1" />
          </label>
          <div className="sm:col-span-2 text-xs text-fg-muted">
            Package: <code className="font-mono">{app.packageName}</code>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>Description (README.md) — shown on the store page</CardHeader>
        <div className="p-4 max-h-[24rem] overflow-auto">
          <Markdown>{readme}</Markdown>
        </div>
      </Card>

      <Card>
        <CardHeader>Files ({app.files.length})</CardHeader>
        <div className="grid sm:grid-cols-[16rem_1fr] min-h-[24rem]">
          <ul className="border-r border-border text-xs font-mono overflow-auto max-h-[32rem]">
            {app.files.map((f) => (
              <li key={f.path}>
                <button
                  onClick={() => setSelected(f)}
                  className={`w-full text-left px-3 py-1.5 truncate hover:bg-canvas-subtle ${selected?.path === f.path ? "bg-canvas-subtle text-accent" : ""}`}
                >
                  {f.path}
                </button>
              </li>
            ))}
          </ul>
          <pre className="p-3 text-xs font-mono overflow-auto max-h-[32rem] bg-canvas-subtle/40">{selected?.content}</pre>
        </div>
      </Card>

      <div className="flex gap-2">
        <button onClick={create} disabled={creating || !/^[a-z0-9][a-z0-9-]{1,38}$/.test(app.slug)} className={buttonClass("primary")}>
          {creating ? "Creating repository…" : "Create repository"}
        </button>
        <button onClick={onStartOver} disabled={creating} className={buttonClass()}>
          Start over
        </button>
      </div>
      <p className="text-xs text-fg-muted">
        The repository is created in the GitHub organization with the template (build settings, CI) and the generated
        code. Create a release to build and publish the app.
      </p>
    </div>
  );
}
