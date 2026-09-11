import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getRepo, listReleases, listWorkflowRuns } from "@/lib/github";
import { Markdown } from "@/components/Markdown";
import { Badge, Card, CardHeader, Empty, formatDate } from "@/components/ui";
import { ReleaseForm } from "@/components/ReleaseForm";
import { SyncButton } from "@/components/SyncButton";

export default async function ReleasesPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const repo = await getRepo(name);
  const [releases, runs, session, app] = await Promise.all([
    listReleases(name),
    listWorkflowRuns(name).catch(() => []),
    auth(),
    prisma.app.findUnique({ where: { repoFullName: repo.full_name } }),
  ]);
  const latestTag = releases[0]?.tag_name;
  const nextTag = suggestNextTag(latestTag);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        {releases.length === 0 ? (
          <Empty>まだリリースはありません。右のフォームから最初のリリースを作成しましょう。</Empty>
        ) : (
          releases.map((r) => {
            const apk = r.assets.find((a) => a.name.endsWith(".apk"));
            return (
              <Card key={r.id}>
                <CardHeader>
                  <span className="font-mono">{r.tag_name}</span>
                  {r.name && r.name !== r.tag_name && <span className="font-normal">{r.name}</span>}
                  {r.prerelease && <Badge tone="attention">Pre-release</Badge>}
                  <span className="font-normal text-fg-muted ml-auto">{formatDate(r.published_at)}</span>
                </CardHeader>
                <div className="p-4 space-y-3 text-sm">
                  {r.body && <Markdown>{r.body}</Markdown>}
                  <div className="flex items-center gap-3 flex-wrap">
                    {apk ? (
                      <>
                        <a href={apk.browser_download_url} className="text-accent hover:underline">📦 {apk.name} ({Math.round(apk.size / 1024)} KB)</a>
                        {session && app && (
                          <SyncButton slug={app.slug} tag={r.tag_name} />
                        )}
                      </>
                    ) : (
                      <span className="text-fg-muted">APK はまだ添付されていません (CI のビルド待ち)。</span>
                    )}
                    {app?.latestVersion && r.tag_name === `v${app.latestVersion}` && <Badge tone="success">ストア配信中</Badge>}
                  </div>
                </div>
              </Card>
            );
          })
        )}

        {runs.length > 0 && (
          <Card>
            <CardHeader>最近の CI 実行</CardHeader>
            <ul className="divide-y divide-border text-sm">
              {runs.map((run) => (
                <li key={run.id} className="px-4 py-2 flex items-center gap-3">
                  <span>{run.conclusion === "success" ? "✅" : run.status === "completed" ? "❌" : "⏳"}</span>
                  <a href={run.html_url} target="_blank" rel="noreferrer" className="hover:text-accent">{run.name}</a>
                  <span className="text-xs text-fg-muted font-mono">{run.head_branch}</span>
                  <span className="text-xs text-fg-muted ml-auto">{formatDate(run.created_at)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <div>
        {session ? (
          <ReleaseForm name={name} suggestedTag={nextTag} />
        ) : (
          <p className="text-sm text-fg-muted">リリースを作成するにはログインしてください。</p>
        )}
        <Card className="mt-4 p-4 text-xs text-fg-muted space-y-2">
          <p className="font-semibold text-fg">リリースの流れ</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>タグ (例 v0.1.0) を付けてリリースを作成</li>
            <li>GitHub Actions が APK をビルドしてリリースに添付 (数分)</li>
            <li>Webhook でストアが自動取り込み。届かない場合は「ストアに同期」を押す</li>
          </ol>
          <p>バージョンを上げるときは app/build.gradle.kts の versionCode / versionName も更新してください。</p>
        </Card>
      </div>
    </div>
  );
}

function suggestNextTag(latest?: string): string {
  const m = latest && /^v(\d+)\.(\d+)\.(\d+)$/.exec(latest);
  if (!m) return "v0.1.0";
  return `v${m[1]}.${m[2]}.${Number(m[3]) + 1}`;
}
