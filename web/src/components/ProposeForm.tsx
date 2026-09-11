"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonClass, Card, ErrorBox } from "@/components/ui";

export function ProposeForm({ name }: { name: string }) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ prNumber: number; url: string; title: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/repos/${name}/propose`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "失敗しました");
      setResult(json);
      setPrompt("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      {error && <ErrorBox>{error}</ErrorBox>}
      {result && (
        <Card className="p-4 bg-diff-add border-success/40 text-sm">
          Pull Request <Link href={`/repos/${name}/pulls/${result.prNumber}`} className="text-accent font-semibold hover:underline">#{result.prNumber} {result.title}</Link> を作成しました。
        </Card>
      )}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={6}
        placeholder="例: ダークモードに対応してほしい / 一覧を日付順に並べ替えるボタンを追加して"
        className="w-full rounded-md border border-border p-3 text-sm"
        disabled={busy}
      />
      <button disabled={busy || prompt.trim().length < 5} className={buttonClass("primary")}>
        {busy ? "AI が変更を作成中… (1〜3 分)" : "Pull Request を作成"}
      </button>
    </form>
  );
}
