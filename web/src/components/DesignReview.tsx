"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppReview, type GeneratedApp } from "@/components/AppReview";
import { AutoRefresh } from "@/components/AutoRefresh";
import { ScreenThumb } from "@/components/ScreenThumb";
import { buttonClass, Card, CardHeader, ErrorBox } from "@/components/ui";
import type { Screen } from "@/vendor/wireframe/core";

export type DesignView = {
  id: string;
  status: string;
  error: string | null;
  plan: string;
  prompt: string;
  theme: string;
  device: string;
  screens: Screen[];
};

/** The screens AI drew: look, fix in the editor, then "Looks good, generate code". */
export function DesignReview({ design }: { design: DesignView }) {
  const router = useRouter();
  const [plan, setPlan] = useState(design.plan);
  const [savedPlan, setSavedPlan] = useState(design.plan);
  const [busy, setBusy] = useState<"generate" | "redraw" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [app, setApp] = useState<GeneratedApp | null>(null);
  const [generationId, setGenerationId] = useState<string | undefined>();

  const editUrl = `/wireframe/index.html?design=${design.id}${design.screens[0] ? `&screen=${design.screens[0].id}` : ""}`;

  async function savePlan() {
    if (plan === savedPlan) return;
    const res = await fetch(`/api/designs/${design.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan }) });
    if (res.ok) setSavedPlan(plan);
  }

  async function generate() {
    setError(null);
    setBusy("generate");
    try {
      await savePlan();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ designId: design.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not generate the app. Try again.");
      setApp(json.app);
      setGenerationId(json.generationId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function redraw() {
    setError(null);
    setBusy("redraw");
    try {
      const res = await fetch(`/api/designs/${design.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ redraw: true }) });
      if (!res.ok) throw new Error("Could not start drawing again.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (app) return <AppReview initial={app} generationId={generationId} onStartOver={() => setApp(null)} />;

  if (design.status === "DRAWING") {
    return (
      <div className="max-w-3xl space-y-4">
        <AutoRefresh />
        <h1 className="text-2xl font-semibold">New app — screens</h1>
        <Card>
          <div className="p-6 text-sm">
            <p className="font-medium">AI is drawing what the app does and its screens… (about 1 minute)</p>
            <p className="text-fg-muted mt-2">This page updates by itself. Your request:</p>
            <blockquote className="mt-2 border-l-2 border-border pl-3 text-fg-muted whitespace-pre-wrap">{design.prompt}</blockquote>
          </div>
        </Card>
        <Link href="/new" className={buttonClass()}>
          Start over
        </Link>
      </div>
    );
  }

  if (design.status === "FAILED") {
    return (
      <div className="max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold">New app — screens</h1>
        <ErrorBox>AI could not draw the screens: {design.error ?? "unknown error"}</ErrorBox>
        {error && <ErrorBox>{error}</ErrorBox>}
        <div className="flex gap-2">
          <button onClick={redraw} disabled={busy !== null} className={buttonClass("primary")}>
            {busy === "redraw" ? "Starting…" : "Draw again"}
          </button>
          <Link href="/new" className={buttonClass()}>
            Start over
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* The editor's part styles for the thumbnails: a static file copied from the wireframe tool, not a module. */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/wireframe/thumb.css" precedence="default" />
      <div>
        <h1 className="text-2xl font-semibold">New app — screens</h1>
        <p className="text-fg-muted mt-1 text-sm">
          AI drew what the app does and its screens from your description. Fix anything that is off, or go straight to the code.
        </p>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      <Card>
        <CardHeader>What the app does (edit freely)</CardHeader>
        <div className="p-4">
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            onBlur={savePlan}
            rows={Math.min(12, Math.max(4, plan.split("\n").length + 1))}
            disabled={busy !== null}
            className="w-full rounded-md border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
      </Card>
      <Card>
        <CardHeader>
          <span>Screens ({design.screens.length})</span>
          <a href={editUrl} className={`${buttonClass()} ml-auto`}>
            Edit screens
          </a>
        </CardHeader>
        <div className="p-4 flex flex-wrap gap-6">
          {design.screens.map((s) => (
            <figure key={s.id} className="space-y-1">
              <ScreenThumb screen={s} theme={design.theme} device={design.device} width={232} />
              <figcaption className="text-xs text-fg-muted text-center">{s.title}</figcaption>
            </figure>
          ))}
          {design.screens.length === 0 && <p className="text-sm text-fg-muted">No screens. Open the editor and add one from a template, or draw again.</p>}
        </div>
      </Card>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={generate} disabled={busy !== null || design.screens.length === 0} className={buttonClass("primary")}>
          {busy === "generate" ? "Generating code… (1–3 min)" : "Looks good, generate code"}
        </button>
        <a href={editUrl} className={buttonClass()}>
          Edit screens
        </a>
        <button onClick={redraw} disabled={busy !== null} className={buttonClass()}>
          {busy === "redraw" ? "Starting…" : "Draw again"}
        </button>
        <Link href="/new" className={buttonClass()}>
          Start over
        </Link>
      </div>
      <p className="text-xs text-fg-muted">Takes 1–3 minutes. You review the code before the repository is created.</p>
    </div>
  );
}
