import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getRepo, listReleases, listWorkflowRuns } from "@/lib/github";
import { Markdown } from "@/components/Markdown";
import { Badge, Card, CardHeader, Empty, formatDate, formatSize } from "@/components/ui";
import { ReleaseForm } from "@/components/ReleaseForm";
import { SyncButton } from "@/components/SyncButton";
import { SignInRequired } from "@/components/SignInRequired";

export default async function ReleasesPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const repo = await getRepo(name);
  const [releases, runs, session, app] = await Promise.all([
    listReleases(name),
    listWorkflowRuns(name).catch(() => []),
    auth(),
    prisma.app.findUnique({ where: { repoFullName: repo.full_name } }),
  ]);
  const isOwner = !!app && !!session?.user?.id && app.ownerId === session.user.id;
  const latestTag = releases[0]?.tag_name;
  const nextTag = suggestNextTag(latestTag);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        {releases.length === 0 ? (
          <Empty>No releases yet.{isOwner && " Create the first one with the form on the right."}</Empty>
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
                        <a href={apk.browser_download_url} className="text-accent hover:underline">{apk.name} ({formatSize(apk.size)})</a>
                        {isOwner && <SyncButton slug={app.slug} tag={r.tag_name} />}
                      </>
                    ) : (
                      <span className="text-fg-muted">No APK yet. The CI build attaches it in a few minutes.</span>
                    )}
                    {app?.latestVersion && r.tag_name === `v${app.latestVersion}` && <Badge tone="success">Published</Badge>}
                  </div>
                </div>
              </Card>
            );
          })
        )}

        {runs.length > 0 && (
          <Card>
            <CardHeader>Recent CI runs</CardHeader>
            <ul className="divide-y divide-border text-sm">
              {runs.map((run) => (
                <li key={run.id} className="px-4 py-2 flex items-center gap-3">
                  <span
                    className={`w-4 text-center ${run.conclusion === "success" ? "text-success" : run.status === "completed" ? "text-danger" : "text-fg-muted"}`}
                    title={run.conclusion ?? run.status ?? ""}
                  >
                    {run.conclusion === "success" ? "✓" : run.status === "completed" ? "✗" : "…"}
                  </span>
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
        {isOwner ? (
          <ReleaseForm name={name} suggestedTag={nextTag} />
        ) : (
          !session && app && <SignInRequired returnTo={`/repos/${name}/releases`} compact />
        )}
        <Card className={isOwner || (!session && app) ? "mt-4" : ""}>
          <CardHeader>How releases work</CardHeader>
          <div className="p-4 text-xs text-fg-muted space-y-2">
            <ol className="list-decimal pl-4 space-y-1">
              <li>Create a release with a tag (e.g. v0.1.0)</li>
              <li>GitHub Actions builds the APK and attaches it (a few minutes)</li>
              <li>The store picks it up automatically. If it does not, press “Sync to store”.</li>
            </ol>
            <p>When you bump the version, also update versionCode / versionName in app/build.gradle.kts.</p>
          </div>
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
