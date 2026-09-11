"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, Card, CardHeader, ErrorBox } from "@/components/ui";

export function PrActions({ name, number, mergeable, isAuthor }: { name: string; number: number; mergeable: boolean | null; isAuthor: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function post(path: string, payload?: unknown) {
    setError(null);
    setBusy(path);
    try {
      const res = await fetch(`/api/repos/${name}/pulls/${number}/${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload ? JSON.stringify(payload) : undefined,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "失敗しました");
      setBody("");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>レビュー</CardHeader>
      <div className="p-4 space-y-3">
        {error && <ErrorBox>{error}</ErrorBox>}
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="コメントを書く (Markdown 可)" className="w-full rounded-md border border-border p-2 text-sm" />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => post("review", { event: "COMMENT", body })} disabled={!!busy || !body.trim()} className={buttonClass()}>コメント</button>
          <button onClick={() => post("review", { event: "APPROVE", body })} disabled={!!busy || isAuthor} className={buttonClass()} title={isAuthor ? "自分の PR は承認できません" : ""}>承認</button>
          <button onClick={() => post("review", { event: "REQUEST_CHANGES", body })} disabled={!!busy || !body.trim() || isAuthor} className={buttonClass("danger")}>変更を要求</button>
          <button onClick={() => post("merge")} disabled={!!busy || mergeable === false} className={`${buttonClass("primary")} ml-auto`} title={mergeable === false ? "コンフリクトがあるためマージできません" : ""}>
            {busy === "merge" ? "マージ中…" : "Squash してマージ"}
          </button>
        </div>
        <p className="text-xs text-fg-muted">操作はあなたの GitHub アカウントとして実行されます。マージにはリポジトリへの書き込み権限が必要です。</p>
      </div>
    </Card>
  );
}
