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
      if (!res.ok) throw new Error(json.error ?? "Could not create the release. Try again.");
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
      <CardHeader>New release</CardHeader>
      <form onSubmit={submit} className="p-4 space-y-3 text-sm">
        {error && <ErrorBox>{error}</ErrorBox>}
        {done && <p className="text-success">Created {done}. The APK is attached when the CI build finishes (a few minutes).</p>}
        <label className="block">
          <span className="text-xs text-fg-muted">Tag (vX.Y.Z)</span>
          <input value={tag} onChange={(e) => setTag(e.target.value)} pattern="^v\d+\.\d+\.\d+$" required className="mt-1 w-full rounded-md border border-border px-2 py-1 font-mono" />
        </label>
        <label className="block">
          <span className="text-xs text-fg-muted">Title (optional)</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-md border border-border px-2 py-1" />
        </label>
        <label className="block">
          <span className="text-xs text-fg-muted">Release notes (optional)</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="mt-1 w-full rounded-md border border-border p-2" />
        </label>
        <button disabled={busy} className={`${buttonClass("primary")} w-full justify-center`}>{busy ? "Creating…" : "Create release"}</button>
      </form>
    </Card>
  );
}
