"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, ErrorBox } from "@/components/ui";
import { ModelSelect, type ModelPick } from "@/components/ModelSelect";
import type { ModelChoice } from "@/lib/models";

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

/** New app, step 1: describe the app; AI draws its screens first (/new/design/<id>), the code comes after. */
export function NewAppWizard({ models, initialModel }: { models: ModelPick[]; initialModel: ModelChoice }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelChoice>(initialModel);
  const modelReady = models.some((m) => m.id === model && m.available);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function draw() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, model }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not start. Try again.");
      router.push(`/new/design/${json.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">New app</h1>
        <p className="text-fg-muted mt-1 text-sm">
          Describe the Android app you want. AI first draws its screens for you to check; then it writes the code (Kotlin +
          Jetpack Compose) and puts it in a GitHub repository that you own.
        </p>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={8}
        placeholder="e.g. An app for club dues: keep a list of members, record who has paid, and show who has not."
        className="w-full rounded-md border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
        disabled={busy}
      />
      <div className="flex flex-wrap gap-2 text-xs">
        {EXAMPLES.map((ex) => (
          <button key={ex.label} type="button" onClick={() => setPrompt(ex.prompt)} className="rounded-full border border-border px-3 py-1 text-fg-muted hover:bg-canvas-subtle">
            {ex.label}
          </button>
        ))}
      </div>
      <ModelSelect models={models} value={model} onChange={setModel} disabled={busy} />
      <div className="flex items-center gap-4">
        <button onClick={draw} disabled={prompt.trim().length < 10 || !modelReady || busy} className={buttonClass("primary")}>
          {busy ? "Starting…" : "Draw screens"}
        </button>
        <span className="text-xs text-fg-muted">
          At least 10 characters. AI first draws what the app does and its screens (about 1 minute); the code comes after you confirm them.
        </span>
      </div>
    </div>
  );
}
