import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getIssue, listIssueComments } from "@/lib/github";
import { Markdown } from "@/components/Markdown";
import { Badge, Card, CardHeader, formatDate, timeAgo } from "@/components/ui";
import { IssueActions } from "@/components/IssueActions";
import { SignInRequired } from "@/components/SignInRequired";

export default async function IssuePage({ params }: { params: Promise<{ name: string; number: string }> }) {
  const { name, number } = await params;
  const n = Number(number);
  if (!Number.isInteger(n) || n < 1) notFound();
  let issue: Awaited<ReturnType<typeof getIssue>>;
  try {
    issue = await getIssue(name, n);
  } catch {
    notFound();
  }
  // GitHub numbers issues and pull requests together.
  if (issue.pull_request) redirect(`/repos/${name}/pulls/${n}`);
  const [comments, session] = await Promise.all([listIssueComments(name, n), auth()]);
  const open = issue.state === "open";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl">
          {issue.title} <span className="text-fg-muted font-light">#{issue.number}</span>
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-fg-muted">
          <Badge tone={open ? "success" : "accent"}>{open ? "Open" : "Closed"}</Badge>
          <span>
            {issue.user?.login} opened this issue {timeAgo(issue.created_at)} · {issue.comments}{" "}
            {issue.comments === 1 ? "comment" : "comments"}
          </span>
          <a href={issue.html_url} target="_blank" rel="noreferrer" className="ml-auto text-accent hover:underline">
            Open on GitHub ↗
          </a>
        </div>
      </div>

      <Card>
        <CardHeader>
          {issue.user?.login} <span className="font-normal text-fg-muted">{formatDate(issue.created_at)}</span>
        </CardHeader>
        <div className="p-4">
          {issue.body?.trim() ? <Markdown>{issue.body}</Markdown> : <p className="text-sm text-fg-muted">No description provided.</p>}
        </div>
      </Card>

      {comments.map((c) => (
        <Card key={c.id}>
          <CardHeader>
            {c.user?.login} <span className="font-normal text-fg-muted">{formatDate(c.created_at)}</span>
          </CardHeader>
          <div className="p-4">
            <Markdown>{c.body ?? ""}</Markdown>
          </div>
        </Card>
      ))}

      {session ? (
        <IssueActions name={name} number={n} open={open} />
      ) : (
        <SignInRequired returnTo={`/repos/${name}/issues/${n}`} compact />
      )}
    </div>
  );
}
