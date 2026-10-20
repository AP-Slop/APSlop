import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { apkDownloadUrl, findStoreApp } from "@/lib/store";
import { getReadme, repoUrl } from "@/lib/github";
import { Markdown } from "@/components/Markdown";
import { Card, CardHeader, Container, formatSize } from "@/components/ui";

export const dynamic = "force-dynamic";

function formatDay(ms: number | null | undefined): string {
  return ms ? new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
}

/** The page of one app, as visitors see it: what it does, how to get it, and where its code is. */
export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = await prisma.app.findUnique({ where: { slug }, include: { owner: true } });
  if (!app) notFound();
  const name = app.repoFullName.split("/")[1];
  const published = app.status === "PUBLISHED" && !!app.latestApkName;
  // The store's copy is what phones show; before the first release the README on GitHub is all there is.
  const store = published ? await findStoreApp(app.packageName) : null;
  const description = store?.description || (await getReadme(name).catch(() => null)) || app.description;

  const info: [string, React.ReactNode][] = [
    ["Author", app.owner.login],
    ["Version", app.latestVersion ? `${app.latestVersion}${app.latestVersionCode ? ` (${app.latestVersionCode})` : ""}` : "Not released yet"],
    ["Size", store?.apkSize ? formatSize(store.apkSize) : "—"],
    ["Min Android API", store?.minSdk ?? "—"],
    ["Updated", formatDay(store?.lastUpdated ?? app.publishedAt?.getTime())],
    ["Package", app.packageName ? <span className="font-mono text-xs break-all">{app.packageName}</span> : "—"],
  ];

  return (
    <Container>
      <div className="flex flex-wrap items-start gap-6">
        {app.iconUrl ? (
          <Image src={app.iconUrl} alt="" width={96} height={96} className="rounded-2xl border border-border" unoptimized />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-canvas-subtle border border-border flex items-center justify-center text-4xl">📱</div>
        )}
        <div className="flex-1 min-w-[16rem]">
          <h1 className="text-2xl font-semibold">{app.name}</h1>
          <p className="text-fg-muted mt-1">{app.summary}</p>
          <p className="text-sm text-fg-muted mt-1">by {app.owner.login}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
        {published ? (
          <>
            <a
              href={apkDownloadUrl(app.latestApkName!)}
              className="inline-flex items-center rounded-md border border-[#1f883d] bg-[#1f883d] px-3 py-1.5 font-medium text-white hover:bg-[#1a7f37]"
            >
              Download APK (v{app.latestVersion})
            </a>
            <span className="text-fg-muted">or install from the APSlop store app on your phone</span>
          </>
        ) : (
          <span className="text-fg-muted">This app is not in the store yet. It appears here once its first release is built.</span>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem] items-start">
        <Card>
          <CardHeader>Description (README)</CardHeader>
          <div className="p-5">
            <Markdown>{description}</Markdown>
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>Information</CardHeader>
            <dl className="p-4 grid grid-cols-[9rem_1fr] gap-y-2 text-sm">
              {info.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-fg-muted">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card>
            <CardHeader>For developers</CardHeader>
            <div className="p-4 space-y-2 text-sm">
              <a href={repoUrl(name)} target="_blank" rel="noreferrer" className="block text-accent hover:underline">
                Source code on GitHub ↗
              </a>
              <Link href={`/repos/${name}`} className="block text-accent hover:underline">
                Open in APSlop Developers →
              </Link>
              <p className="text-xs text-fg-muted">Suggest an improvement with “Create PR with AI”.</p>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
