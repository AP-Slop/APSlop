"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, Card, CardHeader, ErrorBox } from "@/components/ui";

export function ReleaseForm({ name, suggestedTag }: { name: string; suggestedTag: string }) {
  const router = useRouter();
  const [tag, setTag] = useState(suggestedTag);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/repos/${name}/releases`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tag, name: title || undefined, body: body || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "作成に失敗しました");
      setDone(json.tag);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>新しいリリース</CardHeader>
      <form onSubmit={submit} className="p-4 space-y-3 text-sm">
        {error && <ErrorBox>{error}</ErrorBox>}
        {done && <p className="text-success">{done} を作成しました。CI のビルド完了後に APK が添付されます。</p>}
        <label className="block">
          <span className="text-xs text-fg-muted">タグ (vX.Y.Z)</span>
          <input value={tag} onChange={(e) => setTag(e.target.value)} pattern="^v\d+\.\d+\.\d+$" required className="mt-1 w-full rounded-md border border-border px-2 py-1 font-mono" />
        </label>
        <label className="block">
          <span className="text-xs text-fg-muted">タイトル (任意)</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-md border border-border px-2 py-1" />
        </label>
        <label className="block">
          <span className="text-xs text-fg-muted">リリースノート (任意)</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="mt-1 w-full rounded-md border border-border p-2" />
        </label>
        <button disabled={busy} className={`${buttonClass("primary")} w-full justify-center`}>{busy ? "作成中…" : "リリースを作成"}</button>
      </form>
    </Card>
  );
}
