import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { env } from "@/lib/env";
import type { RepoFile } from "@/lib/github";
import { readTemplateFiles, readTemplateRules, templateForPrompt } from "@/lib/template";

export const GeneratedFileSchema = z.object({
  path: z.string().describe("リポジトリルートからの相対パス。例: app/src/main/java/dev/apslop/apps/foo/MainActivity.kt"),
  content: z.string().describe("ファイルの完全な内容"),
});

export const GeneratedAppSchema = z.object({
  name: z.string().describe("アプリの表示名"),
  slug: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]{1,38}$/)
    .describe("リポジトリ名。小文字英数字とハイフンのみ、2〜39文字"),
  packageName: z
    .string()
    .regex(/^dev\.apslop\.apps\.[a-z][a-z0-9_]*$/)
    .describe("Android パッケージ名。必ず dev.apslop.apps.<slug の - を _ に置換> の形式"),
  summary: z.string().max(80).describe("80文字以内の一言説明"),
  description: z.string().describe("Markdown 形式の説明 (機能、使い方)"),
  files: z.array(GeneratedFileSchema).describe("生成・変更するファイル一式"),
});

export type GeneratedApp = z.infer<typeof GeneratedAppSchema>;

export const ProposedChangesSchema = z.object({
  title: z.string().max(100).describe("Pull Request のタイトル"),
  body: z.string().describe("Pull Request の説明 (Markdown)。何をなぜ変えたかを書く"),
  branch: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]{1,50}$/)
    .describe("ブランチ名。小文字英数字とハイフン"),
  files: z.array(GeneratedFileSchema).describe("変更・追加するファイル。変更しないファイルは含めない"),
});

export type ProposedChanges = z.infer<typeof ProposedChangesSchema>;

const ANDROID_RULES = `
あなたは大学コミュニティ向けプラットフォーム「APSlop」の Android アプリ生成エンジンです。
利用者はプログラミング初心者のことが多く、生成物はそのまま GitHub Actions で \`./gradlew assembleRelease\` が通り、
F-Droid 互換ストアに配信されます。

## 必ず守るルール
- 言語は Kotlin、UI は Jetpack Compose (Material 3)。XML レイアウトは使わない。
- パッケージ名は \`dev.apslop.apps.<slug>\` (slug の \`-\` は \`_\` に置換)。
  \`app/build.gradle.kts\` の \`namespace\` と \`applicationId\`、AndroidManifest、Kotlin ファイルのディレクトリと package 宣言をすべて一致させる。
- テンプレートの Gradle 設定 (settings.gradle.kts / build.gradle.kts / gradle/libs.versions.toml / gradle.properties / .github/workflows/release.yml) は
  依存関係の追加が必要な場合を除き変更しない。変更する場合も完全なファイルを出力する。
- 出力する各ファイルは差分ではなく完全な内容にする。
- \`app/build.gradle.kts\` には signingConfig を書かない (未署名 APK をビルドし、ストアが署名する)。
- \`versionCode\` は 1、\`versionName\` は "0.1.0" から始める。
- ネットワーク権限が必要なら AndroidManifest に INTERNET を追加する。外部 API キーは埋め込まない。
- ローカル永続化が必要なら DataStore Preferences か Room を使う (依存は libs.versions.toml とテンプレの流儀に合わせる)。
- README.md にはアプリの説明、使い方、生成元が APSlop であることを書く。
- 出力は日本語 UI を基本にする (strings.xml)。
- 生成するファイルは必要最小限にし、テンプレに含まれるファイルで変更不要なものは出力しない。
`;

function client(): Anthropic {
  return new Anthropic({ apiKey: env().ANTHROPIC_API_KEY });
}

function model(): string {
  return env().ANTHROPIC_MODEL;
}

function firstText(message: Anthropic.Message): string {
  for (const block of message.content) {
    if (block.type === "text") return block.text;
  }
  return "";
}

async function runStructured<T>(schema: z.ZodType<T>, system: string, user: string): Promise<T> {
  const stream = client().messages.stream({
    model: model(),
    max_tokens: 64000,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: user }],
    output_config: { format: zodOutputFormat(schema) },
  });
  const message = await stream.finalMessage();
  if (message.stop_reason === "refusal") {
    throw new Error("AI がこのリクエストの生成を拒否しました。内容を見直してください。");
  }
  if (message.stop_reason === "max_tokens") {
    throw new Error("生成結果が長すぎて途中で切れました。アプリの規模を小さくして再試行してください。");
  }
  const text = firstText(message);
  const parsed = schema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error(`AI の出力が想定形式ではありません: ${parsed.error.issues[0]?.message ?? ""}`);
  }
  return parsed.data;
}

/** Generate a brand-new Android app from a natural-language description. */
export async function generateApp(prompt: string): Promise<GeneratedApp> {
  const [template, rules] = await Promise.all([readTemplateFiles(), readTemplateRules()]);
  const system =
    ANDROID_RULES +
    (rules ? `\n## テンプレートの詳細ルール\n${rules}\n` : "") +
    (template.length
      ? `\n## テンプレート (これをベースに生成する。バイナリは省略)\n${templateForPrompt(template)}`
      : "\n## テンプレートは利用できないため、Gradle 設定を含む全ファイルを出力すること。");
  const user = `次の説明から Android アプリを生成してください。\n\n<request>\n${prompt}\n</request>`;
  const app = await runStructured(GeneratedAppSchema, system, user);
  const expectedPkg = `dev.apslop.apps.${app.slug.replace(/-/g, "_")}`;
  if (app.packageName !== expectedPkg) app.packageName = expectedPkg;
  return app;
}

/** Propose changes to an existing repo; returns files to commit on a new branch + PR text. */
export async function proposeChanges(prompt: string, currentFiles: RepoFile[]): Promise<ProposedChanges> {
  const system =
    ANDROID_RULES +
    `
## 変更依頼のルール
- 以下に現在のリポジトリの全テキストファイルがある。依頼に必要な変更だけを行う。
- 変更・追加するファイルのみ、完全な内容で出力する。
- 既存のパッケージ名や Gradle 構成は変えない。
- versionCode / versionName は変更しない (リリース時に別途更新する)。
`;
  const listing = currentFiles.map((f) => `<file path="${f.path}">\n${f.content}\n</file>`).join("\n\n");
  const user = `<repository>\n${listing}\n</repository>\n\n<request>\n${prompt}\n</request>`;
  return runStructured(ProposedChangesSchema, system, user);
}

/** Simple slug sanitizer for user-supplied names. */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 39);
}
