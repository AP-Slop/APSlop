"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, Card, CardHeader, ErrorBox } from "@/components/ui";
import { requestProposal } from "@/components/ProposeForm";
import type { ModelChoice } from "@/lib/models";

type Props = {
  name: string;
  id: string;
  prompt: string;
  model: ModelChoice;
  title: string;
  body: string;
  canCreate: boolean;
};

async function post(url: string, payload?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Something went wrong");
  return json;
}

export function ReviewActions({ name, id, prompt, model, title: aiTitle, body: aiBody, canCreate }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(aiTitle);
  const [body, setBody] = useState(aiBody);
  const [busy, setBusy] = useState<null | "create" | "regenerate" | "discard">(null);
  const [error, setError] = useState<string | null>(null);
  const base = `/api/repos/${name}/propose/${id}`;

  async function run(kind: "create" | "regenerate" | "discard") {
    setBusy(kind);
    setError(null);
    try {
      if (kind === "create") {
        const { prNumber } = await post(`${base}/pr`, { title, body });
        router.push(`/repos/${name}/pulls/${prNumber}`);
      } else if (kind === "regenerate") {
        const next = await requestProposal(name, prompt, model); // same AI as this proposal
        await post(`${base}/discard`).catch(() => undefined); // the old proposal is replaced
        router.push(`/repos/${name}/ai/${next}`);
      } else {
        await post(`${base}/discard`);
        router.push(`/repos/${name}/ai`);
      }
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>Pull request</CardHeader>
      <div className="p-4 space-y-3 text-sm">
        {error && <ErrorBox>{error}</ErrorBox>}
        <label className="block">
          <span className="text-xs text-fg-muted">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!!busy}
            className="mt-1 w-full rounded-md border border-border px-2 py-1.5"
          />
        </label>
        <label className="block">
          <span className="text-xs text-fg-muted">Description</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            disabled={!!busy}
            className="mt-1 w-full rounded-md border border-border p-2"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => run("create")} disabled={!!busy || !canCreate || !title.trim()} className={buttonClass("primary")}>
            {busy === "create" ? "Creating…" : "Create pull request"}
          </button>
          <button onClick={() => run("regenerate")} disabled={!!busy} className={buttonClass()}>
            {busy === "regenerate" ? "Regenerating… (1–3 min)" : "Regenerate"}
          </button>
          <button onClick={() => run("discard")} disabled={!!busy} className={buttonClass()}>
            {busy === "discard" ? "Discarding…" : "Discard"}
          </button>
        </div>
        <p className="text-xs text-fg-muted">The pull request is created with your GitHub account.</p>
      </div>
    </Card>
  );
}
