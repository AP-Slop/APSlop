"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, ErrorBox } from "@/components/ui";
import type { ModelChoice } from "@/lib/models";
import { ModelSelect, type ModelPick } from "@/components/ModelSelect";

const POLL_MS = 3000;

/**
 * Sends a change request to AI and waits until the proposal is ready for review. Nothing reaches GitHub here.
 * AI works in the background, so closing the page does not lose the result (it shows up on the dashboard).
 */
export async function requestProposal(name: string, prompt: string, model: ModelChoice): Promise<string> {
  const res = await fetch(`/api/repos/${name}/propose`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt, model }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Could not generate changes");
  const id = json.id as string;
  for (;;) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    const poll = await fetch(`/api/repos/${name}/propose/${id}`, { cache: "no-store" }).catch(() => null);
    if (!poll || poll.status >= 500) continue; // a dropped connection or a restart: keep waiting
    const state = await poll.json().catch(() => ({}));
    if (!poll.ok) throw new Error(state.error ?? "Could not generate changes");
    if (state.status === "PENDING") continue;
    if (state.status === "FAILED") throw new Error(state.error ?? "Could not generate changes");
    return id;
  }
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
      <ModelSelect models={models} value={model} onChange={setModel} disabled={busy} />
      <div className="flex items-center gap-4">
        <button disabled={busy || !modelReady || prompt.trim().length < 5} className={buttonClass("primary")}>
          {busy ? "Generating… (1–3 min)" : "Generate changes"}
        </button>
        <span className="text-xs text-fg-muted">At least 5 characters. Takes 1–3 minutes.</span>
      </div>
    </form>
  );
}
