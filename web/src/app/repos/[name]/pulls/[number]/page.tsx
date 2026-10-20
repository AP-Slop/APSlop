import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { canWriteRepo, getPull, getPullFiles, listIssueComments, listPullReviews } from "@/lib/github";
import { Markdown } from "@/components/Markdown";
import { Badge, Card, CardHeader, formatDate } from "@/components/ui";
import { Diff } from "@/components/Diff";
import { PrActions } from "@/components/PrActions";
import { SignInRequired } from "@/components/SignInRequired";

export default async function PullPage({ params }: { params: Promise<{ name: string; number: string }> }) {
  const { name, number } = await params;
  const n = Number(number);
  if (!Number.isInteger(n)) notFound();
  const [pr, files, reviews, comments, session] = await Promise.all([
    getPull(name, n),
    getPullFiles(name, n),
    listPullReviews(name, n),
    listIssueComments(name, n),
    auth(),
  ]);
  const canWrite = session?.user?.login ? await canWriteRepo(name, session.user.login) : false;
  const additions = files.reduce((a, f) => a + f.additions, 0);
  const deletions = files.reduce((a, f) => a + f.deletions, 0);
  const status = pr.merged ? { label: "Merged", tone: "accent" as const } : pr.state === "open" ? { label: "Open", tone: "success" as const } : { label: "Closed", tone: "danger" as const };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {pr.title} <span className="text-fg-muted font-normal">#{pr.number}</span>
        </h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-fg-muted flex-wrap">
          <Badge tone={status.tone}>{status.label}</Badge>
          <span>
            <strong>{pr.user?.login}</strong> {pr.merged ? "merged" : "wants to merge"} {pr.commits} {pr.commits === 1 ? "commit" : "commits"} into{" "}
            <code className="font-mono bg-canvas-subtle px-1 rounded">{pr.base.ref}</code> from{" "}
            <code className="font-mono bg-canvas-subtle px-1 rounded">{pr.head.ref}</code>
          </span>
          <span className="text-success">+{additions}</span>
          <span className="text-danger">−{deletions}</span>
          <a href={pr.html_url} target="_blank" rel="noreferrer" className="ml-auto text-sm text-accent hover:underline">Open on GitHub ↗</a>
        </div>
      </div>

      {pr.body && (
        <Card>
          <CardHeader>
            {pr.user?.login} <span className="font-normal text-fg-muted">{formatDate(pr.created_at)}</span>
          </CardHeader>
          <div className="p-4">
            <Markdown>{pr.body}</Markdown>
          </div>
        </Card>
      )}

      {(reviews.length > 0 || comments.length > 0) && (
        <div className="space-y-3">
          {reviews
            .filter((r) => r.body || r.state !== "COMMENTED")
            .map((r) => (
              <Card key={`r${r.id}`}>
                <CardHeader>
                  {r.user?.login}
                  <Badge tone={r.state === "APPROVED" ? "success" : r.state === "CHANGES_REQUESTED" ? "danger" : "muted"}>
                    {r.state === "APPROVED" ? "Approved" : r.state === "CHANGES_REQUESTED" ? "Changes requested" : r.state === "DISMISSED" ? "Dismissed" : "Commented"}
                  </Badge>
                  <span className="font-normal text-fg-muted">{formatDate(r.submitted_at)}</span>
                </CardHeader>
                {r.body && (
                  <div className="p-4">
                    <Markdown>{r.body}</Markdown>
                  </div>
                )}
              </Card>
            ))}
          {comments.map((c) => (
            <Card key={`c${c.id}`}>
              <CardHeader>
                {c.user?.login} <span className="font-normal text-fg-muted">{formatDate(c.created_at)}</span>
              </CardHeader>
              <div className="p-4">
                <Markdown>{c.body ?? ""}</Markdown>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Files changed ({files.length})</h2>
        <div className="space-y-4">
          {files.map((f) => (
            <Diff key={f.filename} filename={f.filename} status={f.status} additions={f.additions} deletions={f.deletions} patch={f.patch} />
          ))}
        </div>
      </div>

      {pr.state === "open" &&
        (session ? (
          <PrActions name={name} number={n} mergeable={pr.mergeable} isAuthor={session.user.login === pr.user?.login} canWrite={canWrite} />
        ) : (
          <SignInRequired returnTo={`/repos/${name}/pulls/${n}`} compact />
        ))}
    </div>
  );
}
