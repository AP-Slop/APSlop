"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, Card, CardHeader, ErrorBox } from "@/components/ui";
import { Markdown } from "@/components/Markdown";
import { ModelSelect, type ModelPick } from "@/components/ModelSelect";
import type { ModelChoice } from "@/lib/models";

type GeneratedFile = { path: string; content: string };
type GeneratedApp = {
  name: string;
  slug: string;
  packageName: string;
  summary: string;
  description: string;
  files: GeneratedFile[];
};

const EXAMPLES = [
  {
    label: "Count class attendance per course…",
    prompt: "A counter that records class attendance per course and shows how many more absences are allowed.",
  },
  {
    label: "Rate cafeteria menus with stars…",
    prompt: "An app to note cafeteria menus and rate them with stars, without photos.",
  },
  {
    label: "Pomodoro timer, 25 min work / 5 min break…",
    prompt: "A Pomodoro timer: repeat 25 minutes of work and 5 minutes of break, and keep a count of finished rounds.",
  },
];

export function NewAppWizard({ models, initialModel }: { models: ModelPick[]; initialModel: ModelChoice }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelChoice>(initialModel);
  const modelReady = models.some((m) => m.id === model && m.available);
  const [phase, setPhase] = useState<"input" | "generating" | "review" | "creating">("input");
  const [error, setError] = useState<string | null>(null);
  const [app, setApp] = useState<GeneratedApp | null>(null);
  const [generationId, setGenerationId] = useState<string | undefined>();
  const [selected, setSelected] = useState<GeneratedFile | null>(null);

  async function generate() {
    setError(null);
    setPhase("generating");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, model }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not generate the app. Try again.");
      setApp(json.app);
      setGenerationId(json.generationId);
      setSelected(json.app.files[0] ?? null);
      setPhase("review");
    } catch (e) {
      setError((e as Error).message);
      setPhase("input");
    }
  }

  async function create() {
    if (!app) return;
    setError(null);
    setPhase("creating");
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
      setPhase("review");
    }
  }

  if (phase === "input" || phase === "generating") {
    return (
      <div className="max-w-3xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">New app</h1>
          <p className="text-fg-muted mt-1 text-sm">
            Describe the Android app you want. AI writes the code (Kotlin + Jetpack Compose) and puts it in a GitHub
            repository that you own.
          </p>
        </div>
        {error && <ErrorBox>{error}</ErrorBox>}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          placeholder="e.g. An app for club dues: keep a list of members, record who has paid, and show who has not."
          className="w-full rounded-md border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          disabled={phase === "generating"}
        />
        <div className="flex flex-wrap gap-2 text-xs">
          {EXAMPLES.map((ex) => (
            <button key={ex.label} type="button" onClick={() => setPrompt(ex.prompt)} className="rounded-full border border-border px-3 py-1 text-fg-muted hover:bg-canvas-subtle">
              {ex.label}
            </button>
          ))}
        </div>
        <ModelSelect models={models} value={model} onChange={setModel} disabled={phase === "generating"} />
        <div className="flex items-center gap-4">
          <button onClick={generate} disabled={prompt.trim().length < 10 || !modelReady || phase === "generating"} className={buttonClass("primary")}>
            {phase === "generating" ? "Generating… (1–3 min)" : "Generate code"}
          </button>
          <span className="text-xs text-fg-muted">At least 10 characters. Takes 1–3 minutes.</span>
        </div>
      </div>
    );
  }

  if (!app) return null;
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
        <button onClick={create} disabled={phase === "creating" || !/^[a-z0-9][a-z0-9-]{1,38}$/.test(app.slug)} className={buttonClass("primary")}>
          {phase === "creating" ? "Creating repository…" : "Create repository"}
        </button>
        <button onClick={() => setPhase("input")} disabled={phase === "creating"} className={buttonClass()}>
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
