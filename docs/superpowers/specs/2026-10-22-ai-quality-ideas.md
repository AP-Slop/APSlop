# AI 生成の品質向上 — 設計メモ(案の段階)

- 日付: 2026-10-22
- 位置づけ: New app / Create PR with AI が出すコードの品質を上げるための設計案。テストユーザーの回答を受けて
  仕様(増分ごと)に落とす。まだ何も実装していない。

## 現状と根拠

- 生成は 1 回の API 呼び出し(構造化出力)で全ファイルを一括出力。コンパイルも検証もせずに repo / PR を作る
  (`web/src/lib/ai.ts`)。雛形は 1 ファイル 6000 文字で切り詰めて渡している(`templateForPrompt`)。
- Create PR は全テキストファイル(400KB まで)を渡し、変更ファイルを丸ごと出力させる。
- 実績: `pomodoro-timer`(10/20)は CI 成功。`cafeteria-review`(10/22)は CI 失敗 —
  `ReviewStore.kt` で `var authorName` と `fun setAuthorName()` の JVM シグネチャ衝突(Platform declaration clash)。
  これは静的な文字列検査では捕まえられず、コンパイラが要る種類の誤り。
- 生成後の CI 結果はどこにも記録・表示していない(`Generation` に成否の列がない。PR 画面にも CI の表示がない)。
- CI のコンパイル到達まで約 1.5 分(gradle cache あり)。1 往復 2〜3 分。

## 案(優先順)

### 1. CI をコンパイラにして「通るまで AI が直す」(最優先)
- New app: repo 作成直後の CI(push main)の `workflow_run` webhook を受け、失敗ならログの `e: ...` 行を抽出して
  AI に渡し、修正コミットを main に積む(DRAFT の間は AI が main に直接コミットしてよい)。最大 2 回。
- Create PR: PR 作成後の CI(pull_request)が赤なら同じ要領で PR ブランチに修正コミット。
  Design B の「確認前に GitHub に送らない」は守る(修正は PR 作成後)。
- `Generation` に `buildStatus`(PENDING/PASSED/FAILED/FIXING)と `fixRounds` を足し、Dashboard の AI history・
  repo ページ・PR ページに "Building… / Build passed / AI is fixing (1/2) / Build failed" を出す。
- 合わせて成功率を数えられる(評価の土台)。
- 検討して外したもの: Workers / Cloudflare Container で Gradle(Android SDK + メモリで無理筋)、
  Managed Agents のサンドボックスで Gradle(毎セッション SDK 取得が重い)、ストア用コンテナでのビルド(役割混在)。

### 2. 雛形の強化(壊れやすい箇所を AI から遠ざける)
- よく使う依存を最初から入れる: DataStore Preferences、lifecycle-viewmodel-compose、navigation-compose、
  kotlinx-serialization、material-icons-extended。AI に Gradle 系ファイルの変更を禁止できる。
- 雛形内に「確実にビルドできる部品」を置く: ViewModel + DataStore の保存例、一覧/詳細の画面、設定画面。
- `templates/` に見本アプリ 2〜3 個を置き、本リポジトリの CI で雛形と見本を毎回ビルドする(雛形が腐らない)。
- TEMPLATE_RULES に今回のような実例由来の落とし穴(プロパティと setter 名の衝突 など)を足す。

### 3. 生成の仕組みを作り直す(一括 JSON → ツールを使うエージェント)
- Tool Runner(`betaZodTool`)で `list_files` / `read_file` / `write_file` / `check`(TS 製の軽い検査: package 行と
  パスの一致、manifest のクラス、`R.string` の定義有無、catalog にない `libs.*` 参照)を与え、AI が雛形の全文を
  読んで 1 ファイルずつ書く。6000 文字の切り詰めがなくなる。
- Create PR は Anthropic 定義の text editor ツール(`text_editor_20250728`、`str_replace`)をメモリ上の
  ファイル集合に対して実装し、丸ごと出力でなく行単位の編集にする(差分が小さく、取りこぼしが減る)。
- モデル: `claude-opus-5` → `claude-opus-5-5`(安く、強い)。`output_config.effort` は `high` を明示
  (Opus 5.5 の既定は `medium`)。structured outputs は最終結果の受け取りに残す。DeepSeek は現状維持(ツール経由)。
- Workers では Queue 経由で実行(propose と同じ経路)。New app の生成も Queue に乗せる(現状は同期で 600 秒)。

### 4. 作る前に「こう作ります」を確認する(New app)
- 依頼文 → 短い計画(画面、保存するもの、できること、分からない点)を先に出し、利用者が直してから生成。
  画面が増えるので wireframe で案を出す。

### 5. 評価
- 固定の依頼文 20 本を Batch API(半額)で流し、CI 成功率を数える(skill の build-eval 手順)。
  1 の記録があれば本番の成功率も Dashboard から読める。

## テストユーザーに確認すること(2026-10-22 の提案で質問)
- 生成に 5〜8 分かかっても「必ずビルドが通る」方がよいか。
- Draft の間、AI が勝手に修正コミットを積んでよいか。PR も同様か。

## テストユーザーの回答(2026-10-22)

- 待ち時間より確実さ → 案 1(CI をコンパイラにした自動修正ループ)を増分 1 にする。
- AI が Draft の repo / PR に修正コミットを自分で積んでよい → "Apply fix" ボタンは作らない。自動で進める。
- 「`~/workspace/dev/utils/wireframe` をサーバーに置き、AI がコードを書く前に利用者が UI・機能を編集して意図を伝える」
  → 案 4(計画の事前確認)をこれに置き換え、増分 2 にする。

## 増分 2 の設計案: ワイヤーフレームを AI への入力にする

### wireframe の構造(調べた結果)
- 編集画面は単一のブラウザ用バンドル(`dist/editor.js` 714KB + `editor.css` + `index.html`)。
- 配信サーバーは Deno(`src/server/serve.ts`)で、1 プロジェクト = 1 プロセス、`docs/superpowers/wireframes/` をファイルで
  読み書きし、鍵付き URL(単一利用者前提)。編集画面が使う API は小さい: `GET/PUT /api/project`、`GET/PUT/DELETE /api/screens/:id`、
  `POST /api/screens`、`GET /api/templates|defaults|components|motions|guide`、`/api/library/*`、`/api/proposals`、
  `/api/references`、WebSocket `/ws`(外部変更の通知のみ。編集画面→サーバーは ping だけ)。
- `src/core/*`(schema / normalize / validate / defaults / templates / diff / summary)は純粋な TS。`summary.ts` が
  Claude 向けの変更記録の文章を作る(`wireframe changes` の出力)。
- 画面ファイルは 1.6〜16KB の JSON。Claude が描き、Claude が読む形式として実績がある(本リポジトリの `wireframes/b/`)。

### そのまま置けない理由と置き方
- 本番は Cloudflare Workers(ファイルシステムなし、Deno ランタイムでない、WebSocket は Durable Objects が要る)。
  配信サーバーをそのまま動かす(Container で 1 利用者 1 プロセス)は多人数・永続化の点で無理筋。
- 方針: **編集画面(バンドル)をこのサイトに組み込み、API をこのサイト側で持つ。**
  - `web/public/wireframe/` に `editor.js` / `editor.css` を置く(`scripts/bundle-template.mjs` と同様に
    `~/workspace/dev/utils/wireframe` から同期する script。`deno task bundle` 済みの成果物を使う)。
  - `/api/wireframe/...` を Next.js の route handler で実装。保存先は D1: `Design`(generationId / repoFullName ごとの
    project.json + screens JSON + 変更記録)。WebSocket は使わない(編集画面側の再接続ロジックが許すなら no-op、
    許さなければ `net.ts` に「サーバーなし」モードを足す — wireframe 側の小さな変更)。
  - `src/core` を npm 依存にはできない(deno パッケージ)ので、必要な関数(normalize / validate / diff / summary)を
    `deno bundle` で `web/src/generated/wireframe-core.js` に出して使う。
- 流れ(New app): 依頼文 → AI が計画(できること・保存するもの)と画面 2〜4 枚(phone)を JSON で描く(構造化出力。
  テンプレは wireframe の内蔵ひな形 home/list/detail/settings/form)→ 組み込んだ編集画面で利用者が直す →
  "Generate code" → AI に「最終の画面 JSON + 変更記録の文章(summary)+ 依頼文」を渡してコード生成 → 以後は今の流れ。
  画面 JSON は生成した repo に `docs/wireframes/<id>.json` として commit する(アプリの設計元として残る)。
- 流れ(Create PR): repo の `docs/wireframes/` を開いて直し、依頼文(任意)と合わせて AI に渡す。画面のない repo
  (既存の pomodoro-timer / cafeteria-review)は AI が先にコードから画面を起こす。
- AI の prompt には wireframe の `skill/SKILL.md` の「直しの読み方」(位置はピクセルで写さず意図として読む、locked は守る)を入れる。

### 増分の順(更新)
1. CI をコンパイラにした自動修正ループ + Build 状態の表示(小さく、評価の土台)。
2. ワイヤーフレームを AI への入力にする(New app → Create PR の順に 2 つに割るかもしれない)。
3. 雛形の強化。 4. ツール型エージェント化 + Opus 5.5。 5. Dashboard に成功率。

## テストユーザーの回答(2026-10-22、2 回目)
- 画面を直してから作る流れは Create PR with AI でも使う。
- 画面の手順は必ず通る。ただし AI が描いた既定の画面をそのまま承認して、すぐコード生成へ進める("Looks good, generate code" の一押し)。
