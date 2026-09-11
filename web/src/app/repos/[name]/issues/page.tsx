import Link from "next/link";
import { auth } from "@/lib/auth";
import { listIssues } from "@/lib/github";
import { Card, CardHeader, Empty, timeAgo } from "@/components/ui";
import { IssueForm } from "@/components/IssueForm";

export default async function IssuesPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const { name } = await params;
  const { state } = await searchParams;
  const s = state === "closed" ? "closed" : "open";
  const [issues, session] = await Promise.all([listIssues(name, s), auth()]);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Link href={`/repos/${name}/issues`} className={s === "open" ? "" : "text-fg-muted font-normal"}>Open</Link>
          <Link href={`/repos/${name}/issues?state=closed`} className={s === "closed" ? "" : "text-fg-muted font-normal"}>Closed</Link>
        </CardHeader>
        {issues.length === 0 ? (
          <Empty>Issue はありません。</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {issues.map((i) => (
              <li key={i.number} className="px-4 py-3 flex gap-3">
                <span className={i.state === "open" ? "text-success" : "text-[#8250df]"}>◉</span>
                <div>
                  <a href={i.html_url} target="_blank" rel="noreferrer" className="font-semibold hover:text-accent">{i.title}</a>
                  <div className="text-xs text-fg-muted mt-0.5">
                    #{i.number} · {i.user?.login} が {timeAgo(i.created_at)} に作成 · コメント {i.comments}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {session ? <IssueForm name={name} /> : <p className="text-sm text-fg-muted">Issue を作成するにはログインしてください。</p>}
    </div>
  );
}
