"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, Card, CardHeader, ErrorBox } from "@/components/ui";

type GeneratedFile = { path: string; content: string };
type GeneratedApp = {
  name: string;
  slug: string;
  packageName: string;
  summary: string;
  description: string;
  files: GeneratedFile[];
};

const EXAMPLES = [
  "授業の出席回数を科目ごとに記録できるカウンターアプリ。欠席可能回数も表示する。",
  "学食のメニューをメモして写真なしで星評価できるアプリ。",
  "ポモドーロタイマー。25分作業・5分休憩を繰り返し、完了回数を保存する。",
];

export function NewAppWizard() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<"input" | "generating" | "review" | "creating">("input");
  const [error, setError] = useState<string | null>(null);
  const [app, setApp] = useState<GeneratedApp | null>(null);
  const [generationId, setGenerationId] = useState<string | undefined>();
  const [selected, setSelected] = useState<GeneratedFile | null>(null);

  async function generate() {
    setError(null);
    setPhase("generating");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "生成に失敗しました");
      setApp(json.app);
      setGenerationId(json.generationId);
      setSelected(json.app.files[0] ?? null);
      setPhase("review");
    } catch (e) {
      setError((e as Error).message);
      setPhase("input");
    }
  }

  async function create() {
    if (!app) return;
    setError(null);
    setPhase("creating");
    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ generated: app, generationId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "リポジトリの作成に失敗しました");
      router.push(`/repos/${json.slug}`);
    } catch (e) {
      setError((e as Error).message);
      setPhase("review");
    }
  }

  if (phase === "input" || phase === "generating") {
    return (
      <div className="mt-6 space-y-4">
        {error && <ErrorBox>{error}</ErrorBox>}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          placeholder="例: サークルの会費を管理するアプリ。メンバー一覧と支払い状況を記録し、未払いの人を一覧できる。"
          className="w-full rounded-md border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          disabled={phase === "generating"}
        />
        <div className="flex flex-wrap gap-2 text-xs">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" onClick={() => setPrompt(ex)} className="rounded-full border border-border px-3 py-1 text-fg-muted hover:bg-canvas-subtle">
              {ex.slice(0, 28)}…
            </button>
          ))}
        </div>
        <button onClick={generate} disabled={prompt.trim().length < 10 || phase === "generating"} className={buttonClass("primary")}>
          {phase === "generating" ? "生成中… (1〜3 分かかります)" : "コードを生成する"}
        </button>
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="mt-6 space-y-4">
      {error && <ErrorBox>{error}</ErrorBox>}
      <Card>
        <CardHeader>生成結果</CardHeader>
        <div className="p-4 grid gap-3 sm:grid-cols-2 text-sm">
          <label className="block">
            <span className="text-xs text-fg-muted">アプリ名</span>
            <input value={app.name} onChange={(e) => setApp({ ...app, name: e.target.value })} className="mt-1 w-full rounded-md border border-border px-2 py-1" />
          </label>
          <label className="block">
            <span className="text-xs text-fg-muted">リポジトリ名 (slug)</span>
            <input
              value={app.slug}
              onChange={(e) => {
                const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                setApp({ ...app, slug, packageName: `dev.openap.apps.${slug.replace(/-/g, "_")}` });
              }}
              className="mt-1 w-full rounded-md border border-border px-2 py-1 font-mono"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-fg-muted">一言説明</span>
            <input value={app.summary} onChange={(e) => setApp({ ...app, summary: e.target.value })} className="mt-1 w-full rounded-md border border-border px-2 py-1" />
          </label>
          <div className="sm:col-span-2 text-xs text-fg-muted">
            パッケージ名: <code className="font-mono">{app.packageName}</code>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>ファイル ({app.files.length})</CardHeader>
        <div className="grid sm:grid-cols-[16rem_1fr] min-h-[24rem]">
          <ul className="border-r border-border text-xs font-mono overflow-auto max-h-[32rem]">
            {app.files.map((f) => (
              <li key={f.path}>
                <button
                  onClick={() => setSelected(f)}
                  className={`w-full text-left px-3 py-1.5 truncate hover:bg-canvas-subtle ${selected?.path === f.path ? "bg-canvas-subtle text-accent" : ""}`}
                >
                  {f.path}
                </button>
              </li>
            ))}
          </ul>
          <pre className="p-3 text-xs font-mono overflow-auto max-h-[32rem] bg-canvas-subtle/40">{selected?.content}</pre>
        </div>
      </Card>

      <div className="flex gap-2">
        <button onClick={create} disabled={phase === "creating" || !/^[a-z0-9][a-z0-9-]{1,38}$/.test(app.slug)} className={buttonClass("primary")}>
          {phase === "creating" ? "リポジトリを作成中…" : "リポジトリを作成"}
        </button>
        <button onClick={() => setPhase("input")} disabled={phase === "creating"} className={buttonClass()}>
          やり直す
        </button>
      </div>
      <p className="text-xs text-fg-muted">
        リポジトリはテンプレート (Gradle 設定・CI) と生成コードをまとめて GitHub の Organization に作成されます。作成後はリリースを切ると APK が自動ビルドされます。
      </p>
    </div>
  );
}
