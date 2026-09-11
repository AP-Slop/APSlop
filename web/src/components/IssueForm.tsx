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
      if (!res.ok) throw new Error(json.error ?? "作成に失敗しました");
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
      <CardHeader>新しい Issue</CardHeader>
      <form onSubmit={submit} className="p-4 space-y-3">
        {error && <ErrorBox>{error}</ErrorBox>}
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトル" required className="w-full rounded-md border border-border px-3 py-1.5 text-sm" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="内容 (Markdown 可)" className="w-full rounded-md border border-border p-2 text-sm" />
        <button disabled={busy || !title.trim()} className={buttonClass("primary")}>{busy ? "作成中…" : "Issue を作成"}</button>
      </form>
    </Card>
  );
}
