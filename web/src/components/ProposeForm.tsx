"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, ErrorBox } from "@/components/ui";
import type { ModelChoice } from "@/lib/models";

export type ModelPick = { id: ModelChoice; label: string; available: boolean };

/** Sends a change request to AI, then opens the review screen. Nothing reaches GitHub here. */
export async function requestProposal(name: string, prompt: string, model: ModelChoice): Promise<string> {
  const res = await fetch(`/api/repos/${name}/propose`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt, model }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Could not generate changes");
  return json.id as string;
}

export function ProposeForm({
  name,
  initialPrompt = "",
  models,
  initialModel,
}: {
  name: string;
  initialPrompt?: string;
  models: ModelPick[];
  initialModel: ModelChoice;
}) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [model, setModel] = useState<ModelChoice>(initialModel);
  const modelReady = models.some((m) => m.id === model && m.available);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const id = await requestProposal(name, prompt, model);
      router.push(`/repos/${name}/ai/${id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      {error && <ErrorBox>{error}</ErrorBox>}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={7}
        placeholder="e.g. Support dark mode / Add a button to sort the list by date"
        className="w-full rounded-md border border-border p-3 text-sm"
        disabled={busy}
      />
      <label className="block text-sm">
        <span className="text-xs text-fg-muted">Model</span>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value as ModelChoice)}
          disabled={busy}
          className="mt-1 block w-80 rounded-md border border-border bg-canvas px-2 py-1.5"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id} disabled={!m.available}>
              {m.available ? m.label : `${m.label} — not set up`}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-4">
        <button disabled={busy || !modelReady || prompt.trim().length < 5} className={buttonClass("primary")}>
          {busy ? "Generating… (1–3 min)" : "Generate changes"}
        </button>
        <span className="text-xs text-fg-muted">At least 5 characters. Takes 1–3 minutes.</span>
      </div>
    </form>
  );
}
