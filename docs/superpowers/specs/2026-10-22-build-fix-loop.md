# ビルドが通るまで AI が直す — 仕様(AI 品質向上 増分 1)

- 日付: 2026-10-22
- 背景と案の全体: [2026-10-22-ai-quality-ideas.md](2026-10-22-ai-quality-ideas.md)
- 画面: 既存画面への小さな表示の追加だけなので wireframe は描かない。

## 利用者から見た流れ

1. New app で "Create repository" を押すと、リポジトリの画面の上の帯(アプリの状態の隣)に "Building…" が出る。
   画面は 15 秒ごとに自分で更新される。
2. ビルドが通れば "Build passed"。失敗すれば "AI is fixing the build (1/2)" に変わり、AI が修正をコミットして
   ビルドがもう一度走る。2 回直しても通らなければ "Build failed"(押すと GitHub のビルドのログが開く)。
3. Create PR with AI で "Create pull request" を押したあとの PR の画面にも、同じ印が PR の状態の隣に出る。
   失敗時の修正コミットは PR のブランチに積まれる。
4. Dashboard の AI history の各行にも同じ印が出る。失敗の理由(AI が直せなかったとき)は行の下に赤い字で出る。

## 決めたこと(見た目に出ない)

- コンパイラは GitHub Actions(テンプレの `CI` workflow)。Workers / コンテナで Gradle は回さない。
- `Generation` に `buildStatus`(BUILDING | FIXING | PASSED | FAILED)、`buildBranch`、`buildRounds`、`buildRunUrl` を足す
  (D1 migration `0002_build_status.sql`)。New app はリポジトリ作成時に `BUILDING`/既定ブランチ、Create PR は PR 作成時に
  `BUILDING`/PR ブランチを書く。
- Org webhook の `workflow_run`(completed、`name === "CI"`)で、`repoFullName` + `head_branch` が一致し
  `BUILDING`/`FIXING` の最新の `Generation` を探す。success → PASSED。failure → `buildRounds < 2` なら FIXING にして
  Queue に `fix` ジョブ、そうでなければ FAILED。cancelled / timed_out は FAILED(ログがない)。
- `fix` ジョブ(`runBuildFix`): 失敗したジョブのログ(`actions.downloadJobLogsForWorkflowRun`)から
  `extractBuildErrors`(Kotlin の `e:` と続きの行、`FAILED` のタスク/テスト、`* What went wrong`、タイムスタンプと
  runner のパスを除去、120 行まで)→ ブランチ先頭の全テキストファイルと一緒に `fixBuild`(生成と同じモデル)→
  変更ファイルをサーバー用トークンでコミット(`commitFiles`)。AI が何も変えない・ログがない・API の失敗は FAILED と
  `error` に理由。修正コミットで CI が再び走り、webhook が次の判断をする。
- ジョブは propose と同じ Queue 経路(Workers では要求が終わると処理が止まるため)。
- 対象は AI がコミットしたビルドだけ。利用者が自分で push して壊したビルドは直さない(待っている Generation がない)。
- 雛形の規則に、今回の失敗(プロパティと同名の setter による Platform declaration clash)を足した。

## できないこと

- 修正コミットのあと CI が走らなかった場合(workflow を止めた など)は "AI is fixing" のまま残る。
- 2026-10-22 より前に作ったアプリ(pomodoro-timer, cafeteria-review)には、この印は付かない(CI の結果を見ていなかった)。
