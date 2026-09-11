import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { fdroidRepoUrl, publicEnv } from "@/lib/env";
import { Card, Container, Empty, LinkButton, timeAgo } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const apps = await prisma.app.findMany({
    where: { status: "PUBLISHED" },
    include: { owner: true },
    orderBy: { publishedAt: "desc" },
    take: 60,
  });
  const repoUrl = fdroidRepoUrl();

  return (
    <>
      <section className="bg-canvas-subtle border-b border-border">
        <Container className="py-12">
          <h1 className="text-3xl font-semibold tracking-tight">
            {publicEnv.siteName} — 大学のみんなでアプリを作る
          </h1>
          <p className="mt-3 text-fg-muted max-w-2xl">
            作りたいアプリを日本語で説明するだけで、AI がコードを書いてリポジトリを用意します。
            リリースすると自動でビルドされ、学内アプリストアに並びます。誰かのアプリに Pull Request を送って改良することもできます。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/new" variant="primary">AI でアプリを作る</LinkButton>
            <LinkButton href="/repos">リポジトリを見る</LinkButton>
          </div>
        </Container>
      </section>

      <Container>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold">公開中のアプリ</h2>
          <span className="text-xs text-fg-muted">{apps.length} 件</span>
        </div>
        {apps.length === 0 ? (
          <Empty>まだ公開されたアプリはありません。最初のアプリを作ってみましょう。</Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <Link key={app.id} href={`/apps/${app.slug}`} className="block group">
                <Card className="p-4 h-full group-hover:border-accent transition-colors">
                  <div className="flex items-start gap-3">
                    {app.iconUrl ? (
                      <Image src={app.iconUrl} alt="" width={48} height={48} className="rounded-xl border border-border" unoptimized />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-canvas-subtle border border-border flex items-center justify-center text-lg">
                        📱
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold group-hover:text-accent truncate">{app.name}</div>
                      <div className="text-xs text-fg-muted truncate">
                        {app.owner.login} · v{app.latestVersion ?? "-"}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-fg-muted line-clamp-2">{app.summary}</p>
                  <div className="mt-3 text-xs text-fg-muted">{timeAgo(app.updatedAt)} に更新</div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <Card className="mt-12 p-5">
          <h3 className="font-semibold">スマホでインストールするには</h3>
          <ol className="mt-2 list-decimal pl-5 text-sm text-fg-muted space-y-1">
            <li>{publicEnv.siteName} ストアアプリ、または F-Droid クライアントをインストールする</li>
            <li>
              リポジトリに <code className="font-mono bg-canvas-subtle px-1 rounded">{repoUrl}</code> を追加する
            </li>
            <li>アプリ一覧から好きなアプリをインストールする。更新も自動で通知されます</li>
          </ol>
        </Card>
      </Container>
    </>
  );
}
