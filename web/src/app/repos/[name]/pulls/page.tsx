import Link from "next/link";
import { listPulls } from "@/lib/github";
import { Badge, Card, CardHeader, Empty, LinkButton, timeAgo } from "@/components/ui";

export default async function PullsPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const { name } = await params;
  const { state } = await searchParams;
  const s = state === "closed" ? "closed" : "open";
  const pulls = await listPulls(name, s);
  return (
    <Card>
      <CardHeader>
        <Link href={`/repos/${name}/pulls`} className={s === "open" ? "" : "text-fg-muted font-normal"}>Open</Link>
        <Link href={`/repos/${name}/pulls?state=closed`} className={s === "closed" ? "" : "text-fg-muted font-normal"}>Closed</Link>
        <span className="ml-auto">
          <LinkButton href={`/repos/${name}/ai`} variant="primary">AI で Pull Request を作る</LinkButton>
        </span>
      </CardHeader>
      {pulls.length === 0 ? (
        <Empty>{s === "open" ? "オープンな Pull Request はありません。" : "クローズされた Pull Request はありません。"}</Empty>
      ) : (
        <ul className="divide-y divide-border">
          {pulls.map((pr) => (
            <li key={pr.number} className="px-4 py-3 flex gap-3">
              <span className={pr.merged_at ? "text-[#8250df]" : pr.state === "open" ? "text-success" : "text-danger"}>⎇</span>
              <div className="min-w-0 flex-1">
                <Link href={`/repos/${name}/pulls/${pr.number}`} className="font-semibold hover:text-accent">
                  {pr.title}
                </Link>
                {pr.draft && <Badge>Draft</Badge>}
                <div className="text-xs text-fg-muted mt-0.5">
                  #{pr.number} · {pr.user?.login} が {timeAgo(pr.created_at)} に作成 · {pr.head.ref} → {pr.base.ref}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
