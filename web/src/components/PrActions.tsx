"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, Card, CardHeader, ErrorBox } from "@/components/ui";

export function PrActions({
  name,
  number,
  mergeable,
  isAuthor,
  canWrite,
}: {
  name: string;
  number: number;
  mergeable: boolean | null;
  isAuthor: boolean;
  /** The user can push to the repo: only then can they merge, and close someone else's pull request. */
  canWrite: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function post(path: string, payload?: unknown) {
    setError(null);
    setBusy(path === "review" ? (payload as { event: string }).event : path);
    try {
      const res = await fetch(`/api/repos/${name}/pulls/${number}/${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload ? JSON.stringify(payload) : undefined,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Try again.");
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
      <CardHeader>Review</CardHeader>
      <div className="p-4 space-y-3">
        {error && <ErrorBox>{error}</ErrorBox>}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Write a comment (Markdown supported)"
          className="w-full rounded-md border border-border p-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => post("review", { event: "COMMENT", body })} disabled={!!busy || !body.trim()} className={buttonClass()}>
            {busy === "COMMENT" ? "Commenting…" : "Comment"}
          </button>
          <button
            onClick={() => post("review", { event: "APPROVE", body })}
            disabled={!!busy || isAuthor}
            className={buttonClass()}
            title={isAuthor ? "You cannot approve your own pull request." : ""}
          >
            {busy === "APPROVE" ? "Approving…" : "Approve"}
          </button>
          <button
            onClick={() => post("review", { event: "REQUEST_CHANGES", body })}
            disabled={!!busy || !body.trim() || isAuthor}
            className={buttonClass()}
            title={isAuthor ? "You cannot request changes on your own pull request." : "Write what to change first."}
          >
            {busy === "REQUEST_CHANGES" ? "Sending…" : "Request changes"}
          </button>
          {(isAuthor || canWrite) && (
            <button onClick={() => post("close")} disabled={!!busy} className={buttonClass("danger")}>
              {busy === "close" ? "Closing…" : "Close pull request"}
            </button>
          )}
          {canWrite && (
            <button
              onClick={() => post("merge")}
              disabled={!!busy || mergeable === false}
              className={`${buttonClass("primary")} ml-auto`}
              title={mergeable === false ? "This pull request has conflicts and cannot be merged." : ""}
            >
              {busy === "merge" ? "Merging…" : "Squash and merge"}
            </button>
          )}
        </div>
        <p className="text-xs text-fg-muted">
          Actions are performed as your GitHub account. Merging needs write access to the repository.
        </p>
      </div>
    </Card>
  );
}
