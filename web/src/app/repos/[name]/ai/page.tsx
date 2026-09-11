import { auth } from "@/lib/auth";
import { ProposeForm } from "@/components/ProposeForm";

export default async function AiPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const session = await auth();
  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-semibold">AI に変更を依頼する</h2>
      <p className="text-sm text-fg-muted mt-1">
        やりたい変更を日本語で書くと、AI がリポジトリ全体を読んで変更を提案し、あなたの名前で Pull Request を作成します。
        自分のリポジトリでも、他の人のリポジトリでも使えます。
      </p>
      {session ? <ProposeForm name={name} /> : <p className="mt-4 text-sm text-fg-muted">この機能を使うにはログインしてください。</p>}
    </div>
  );
}
