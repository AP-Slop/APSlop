import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { apkDownloadUrl } from "@/lib/store";
import { repoUrl } from "@/lib/github";
import { Markdown } from "@/components/Markdown";
import { Badge, Card, CardHeader, Container, LinkButton, formatDate } from "@/components/ui";
import { SyncButton } from "@/components/SyncButton";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = await prisma.app.findUnique({ where: { slug }, include: { owner: true } });
  if (!app) notFound();
  const session = await auth();
  const name = app.repoFullName.split("/")[1];

  return (
    <Container>
      <div className="flex flex-wrap items-start gap-5">
        {app.iconUrl ? (
          <Image src={app.iconUrl} alt="" width={96} height={96} className="rounded-2xl border border-border" unoptimized />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-canvas-subtle border border-border flex items-center justify-center text-4xl">📱</div>
        )}
        <div className="flex-1 min-w-[16rem]">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold">{app.name}</h1>
            <Badge tone={app.status === "PUBLISHED" ? "success" : app.status === "FAILED" ? "danger" : "attention"}>
              {app.status === "PUBLISHED" ? "公開中" : app.status === "FAILED" ? "取り込み失敗" : "下書き"}
            </Badge>
          </div>
          <p className="text-fg-muted mt-1">{app.summary}</p>
          <div className="text-xs text-fg-muted mt-2 flex gap-3 flex-wrap">
            <span>作者: {app.owner.login}</span>
            {app.packageName && <span className="font-mono">{app.packageName}</span>}
            {app.publishedAt && <span>公開: {formatDate(app.publishedAt)}</span>}
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            {app.latestApkName && (
              <a href={apkDownloadUrl(app.latestApkName)} className="inline-flex items-center rounded-md border border-[#1f883d] bg-[#1f883d] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1a7f37]">
                APK をダウンロード (v{app.latestVersion})
              </a>
            )}
            <LinkButton href={`/repos/${name}`}>ソースコード</LinkButton>
            <a href={repoUrl(name)} className="inline-flex items-center rounded-md border border-border bg-canvas-subtle px-3 py-1.5 text-sm hover:bg-[#eef1f4]" target="_blank" rel="noreferrer">
              GitHub で開く
            </a>
            <LinkButton href={`/repos/${name}/ai`}>AI に改良を依頼</LinkButton>
            {session && <SyncButton slug={app.slug} />}
          </div>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>説明</CardHeader>
        <div className="p-5">
          <Markdown>{app.description}</Markdown>
        </div>
      </Card>

      {app.status !== "PUBLISHED" && (
        <p className="mt-4 text-sm text-fg-muted">
          このアプリはまだストアに配信されていません。<Link href={`/repos/${name}/releases`} className="text-accent">リリースを作成</Link>すると、CI が APK をビルドしてストアに取り込まれます。
        </p>
      )}
    </Container>
  );
}
