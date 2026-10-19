"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, Card, CardHeader, ErrorBox, LinkButton } from "@/components/ui";

export function IssueActions({ name, number, open }: { name: string; number: number; open: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState<"comment" | "state" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(kind: "comment" | "state") {
    setError(null);
    setBusy(kind);
    try {
      const res =
        kind === "comment"
          ? await fetch(`/api/repos/${name}/issues/${number}/comments`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ body }),
            })
          : await fetch(`/api/repos/${name}/issues/${number}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ state: open ? "closed" : "open" }),
            });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Try again.");
      if (kind === "comment") setBody("");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>Add a comment</CardHeader>
      <div className="p-4 space-y-3">
        {error && <ErrorBox>{error}</ErrorBox>}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Write a comment (Markdown supported)"
          className="w-full rounded-md border border-border p-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => send("comment")} disabled={!!busy || !body.trim()} className={buttonClass("primary")}>
            {busy === "comment" ? "Commenting…" : "Comment"}
          </button>
          <button onClick={() => send("state")} disabled={!!busy} className={buttonClass()}>
            {busy === "state" ? (open ? "Closing…" : "Reopening…") : open ? "Close issue" : "Reopen issue"}
          </button>
          <LinkButton href={`/repos/${name}/ai?issue=${number}`} className="ml-auto">Create PR with AI</LinkButton>
        </div>
        <p className="text-xs text-fg-muted">Actions are performed as your GitHub account.</p>
      </div>
    </Card>
  );
}
