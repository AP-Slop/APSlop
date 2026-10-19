"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, Card, CardHeader, ErrorBox } from "@/components/ui";

export function IssueForm({ name }: { name: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/repos/${name}/issues`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not create the issue");
      setTitle("");
      setBody("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>New issue</CardHeader>
      <form onSubmit={submit} className="p-4 space-y-3">
        {error && <ErrorBox>{error}</ErrorBox>}
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required className="w-full rounded-md border border-border px-3 py-1.5 text-sm" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Description (Markdown)" className="w-full rounded-md border border-border p-2 text-sm" />
        <button disabled={busy || !title.trim()} className={buttonClass("primary")}>{busy ? "Creating…" : "Create issue"}</button>
      </form>
    </Card>
  );
}
