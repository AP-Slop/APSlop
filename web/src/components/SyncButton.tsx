"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass } from "@/components/ui";

export function SyncButton({ slug, tag }: { slug: string; tag?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function sync() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/apps/${slug}/sync`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tag }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "同期に失敗しました");
      setMsg(`v${json.latestVersion} を取り込みました`);
      router.refresh();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button onClick={sync} disabled={busy} className={buttonClass()}>
        {busy ? "同期中…" : "ストアに同期"}
      </button>
      {msg && <span className="text-xs text-fg-muted">{msg}</span>}
    </span>
  );
}
