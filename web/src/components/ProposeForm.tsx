"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, ErrorBox } from "@/components/ui";

/** Sends a change request to AI, then opens the review screen. Nothing reaches GitHub here. */
export async function requestProposal(name: string, prompt: string): Promise<string> {
  const res = await fetch(`/api/repos/${name}/propose`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Could not generate changes");
  return json.id as string;
}

export function ProposeForm({ name, initialPrompt = "" }: { name: string; initialPrompt?: string }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const id = await requestProposal(name, prompt);
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
      <div className="flex items-center gap-4">
        <button disabled={busy || prompt.trim().length < 5} className={buttonClass("primary")}>
          {busy ? "Generating… (1–3 min)" : "Generate changes"}
        </button>
        <span className="text-xs text-fg-muted">At least 5 characters. Takes 1–3 minutes.</span>
      </div>
    </form>
  );
}
