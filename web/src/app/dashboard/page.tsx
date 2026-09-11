import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge, Card, CardHeader, Container, Empty, LinkButton, formatDate } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin?callbackUrl=/dashboard");
  const [apps, generations] = await Promise.all([
    prisma.app.findMany({ where: { ownerId: session.user.id }, orderBy: { updatedAt: "desc" } }),
    prisma.generation.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <Container>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">ダッシュボード</h1>
        <LinkButton href="/new" variant="primary">AI でアプリを作る</LinkButton>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>自分のアプリ ({apps.length})</CardHeader>
          {apps.length === 0 ? (
            <Empty>まだアプリがありません。</Empty>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {apps.map((a) => (
                <li key={a.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/apps/${a.slug}`} className="font-semibold hover:text-accent">{a.name}</Link>
                    <div className="text-xs text-fg-muted truncate">{a.repoFullName}</div>
                  </div>
                  <Badge tone={a.status === "PUBLISHED" ? "success" : a.status === "FAILED" ? "danger" : "attention"}>
                    {a.status === "PUBLISHED" ? `v${a.latestVersion}` : a.status === "FAILED" ? "失敗" : "下書き"}
                  </Badge>
                  <Link href={`/repos/${a.repoFullName.split("/")[1]}`} className="text-xs text-accent hover:underline">リポジトリ</Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader>AI 生成の履歴</CardHeader>
          {generations.length === 0 ? (
            <Empty>まだ履歴がありません。</Empty>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {generations.map((g) => (
                <li key={g.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={g.status === "DONE" ? "success" : g.status === "FAILED" ? "danger" : "muted"}>
                      {g.kind === "CREATE" ? "新規作成" : "変更提案"}
                    </Badge>
                    <span className="text-xs text-fg-muted">{formatDate(g.createdAt)}</span>
                    {g.repoFullName && (
                      <Link href={`/repos/${g.repoFullName.split("/")[1]}${g.prNumber ? `/pulls/${g.prNumber}` : ""}`} className="text-xs text-accent hover:underline ml-auto">
                        {g.repoFullName.split("/")[1]}{g.prNumber ? ` #${g.prNumber}` : ""}
                      </Link>
                    )}
                  </div>
                  <p className="mt-1 text-fg-muted line-clamp-2">{g.prompt}</p>
                  {g.error && <p className="mt-1 text-xs text-danger">{g.error}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Container>
  );
}
