"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, ErrorBox } from "@/components/ui";

const SUMMARY_MAX = 80;

async function send(url: string, method: "PATCH" | "DELETE", body: unknown) {
  const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Something went wrong. Try again.");
  return json;
}

export function SummaryForm({ slug, summary }: { slug: string; summary: string }) {
  const router = useRouter();
  const [value, setValue] = useState(summary);
  const [saved, setSaved] = useState(summary);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const trimmed = value.trim();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(null);
    setBusy(true);
    try {
      const json = await send(`/api/apps/${slug}`, "PATCH", { summary: trimmed });
      setSaved(json.summary);
      setValue(json.summary);
      setDone(json.published ? "Saved. The store now shows this summary." : "Saved. The store will show this summary once the app is published.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="p-4 text-sm space-y-2">
      <label htmlFor="summary" className="block text-fg-muted">Summary (one line, shown in the store)</label>
      <div className="flex gap-2">
        <input
          id="summary"
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/[\r\n]/g, " "));
            setDone(null);
          }}
          maxLength={SUMMARY_MAX}
          className="flex-1 min-w-0 rounded-md border border-border px-3 py-1.5"
        />
        <button type="submit" disabled={busy || !trimmed || trimmed === saved} className={buttonClass("primary")}>
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
      <div className="flex gap-3 text-xs text-fg-muted">
        <span className="flex-1">
          {done && <span className="text-success">{done}</span>}
        </span>
        <span>{value.length} / {SUMMARY_MAX}</span>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
    </form>
  );
}

export function DeleteApp({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await send(`/api/apps/${slug}`, "DELETE", { confirm: typed });
      router.push(`/dashboard?deleted=${encodeURIComponent(name)}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="p-4 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[16rem]">
          <div className="font-semibold">Delete this app</div>
          <p className="text-fg-muted">
            Removes it from the store and deletes the repository on GitHub. This cannot be undone.
          </p>
        </div>
        {!open && (
          <button onClick={() => setOpen(true)} className={buttonClass("danger")}>Delete app…</button>
        )}
      </div>
      {open && (
        <form onSubmit={remove} className="mt-4 rounded-md border border-danger/40 p-4 space-y-3">
          <p>
            People who installed <strong>{name}</strong> keep it, but they will no longer get updates. The code, issues,
            pull requests and releases are deleted with the repository.
          </p>
          <label htmlFor="confirm-delete" className="block">
            To confirm, type <code className="font-mono bg-canvas-subtle px-1 rounded">{slug}</code> below.
          </label>
          <input
            id="confirm-delete"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            autoFocus
            className="w-full rounded-md border border-border px-3 py-1.5 font-mono"
          />
          {error && <ErrorBox>{error}</ErrorBox>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || typed.trim() !== slug}
              className={`${buttonClass("danger")} enabled:bg-danger enabled:text-white enabled:border-danger`}
            >
              {busy ? "Deleting…" : "Delete this app"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTyped("");
                setError(null);
              }}
              disabled={busy}
              className={buttonClass()}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
