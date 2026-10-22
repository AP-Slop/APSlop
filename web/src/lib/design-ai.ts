// AI draws an app's screens (wireframe files) and lists what it does, from the prompt; and turns the
// confirmed screens back into text for the code generation. The screen format is the wireframe
// editor's (utils/wireframe); AI writes a subset, which is filled, settled and checked with the
// editor's own core (src/vendor/wireframe/core.js) before it is kept.
import { z } from "zod";
import * as wf from "@/vendor/wireframe/core";
import type { Element, Screen } from "@/vendor/wireframe/core";
import { runStructured } from "@/lib/ai";
import type { ModelChoice } from "@/lib/models";
import { DESIGN_DEVICE, emptyProject, settled, type DesignFiles } from "@/lib/wireframe-store";

const ELEMENT_TYPES = [
  "navbar", "tabbar", "text", "button", "input", "list", "rect", "divider", "checkbox", "toggle", "chip",
  "icon", "image", "fab", "tabs", "radio", "progress", "badge", "avatar", "slider",
] as const;

const RowSchema = z.object({
  text: z.string().describe("行の文字"),
  sub: z.string().optional().describe("文字の下の小さな 2 行目"),
  meta: z.string().optional().describe("右端の小さな文字(金額、日付)"),
});

const PropsSchema = z.object({
  placeholder: z.string().optional().describe("input: 例の文字"),
  kind: z.enum(["text", "select", "search"]).optional().describe("input: 入力欄の種類"),
  multiline: z.boolean().optional().describe("input: 複数行"),
  checked: z.boolean().optional().describe("checkbox / toggle / chip: 最初がオン"),
  items: z.array(RowSchema).optional().describe("list: 行(3〜5 行の例で足りる)。tabbar / tabs / radio: 選択肢(text だけ使う)"),
  active: z.number().int().optional().describe("tabbar / tabs / radio: 最初に選ばれている番号(0 から)"),
  rows: z.number().int().optional().describe("list: items を書かないときの行数(灰色の線)"),
  leading: z.enum(["none", "icon", "avatar"]).optional().describe("list: 行の左の印"),
  trailing: z.enum(["none", "chevron", "toggle"]).optional().describe("list: 行の右の印"),
  left: z.enum(["none", "back", "close", "menu"]).optional().describe("navbar: 左のボタン"),
  right: z.string().optional().describe("navbar: 右の文字(ボタン)"),
  elevated: z.boolean().optional().describe("rect: 影付きのカード"),
  scroll: z.enum(["none", "y", "x"]).optional().describe("rect: 中身を送れる箱"),
  value: z.number().optional().describe("slider / progress: 最初の値"),
  min: z.number().optional().describe("slider: 最小"),
  max: z.number().optional().describe("slider / progress: 最大"),
  label: z.boolean().optional().describe("progress: 割合の文字を出す"),
});

const elementFields = {
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/).describe("画面内で一意の id(小文字英数字とハイフン)"),
  type: z.enum(ELEMENT_TYPES),
  x: z.number().int().describe("左上の x(親の左上基準、8 の倍数)"),
  y: z.number().int().describe("左上の y(親の左上基準、8 の倍数)"),
  w: z.number().int().optional().describe("幅(省くと種類の既定)"),
  h: z.number().int().optional().describe("高さ(省くと種類の既定)"),
  text: z.string().optional().describe("表示する主な文字(navbar の題、button の文字、text の本文、input のラベル、image の説明、icon のアイコン名)"),
  name: z.string().optional().describe("役割の名前(rect には必ず。例: Header, Summary Card)"),
  variant: z.enum(["filled", "outline", "ghost"]).optional().describe("button のみ"),
  props: PropsSchema.optional(),
};
const ChildSchema = z.object(elementFields);
const ElementSchema = z.object({
  ...elementFields,
  children: z.array(ChildSchema).optional().describe("rect の中身(座標は rect の左上基準)。rect 以外には書かない"),
});

export const DrawnScreenSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/).describe("画面の id(例: home, add-item, settings)"),
  title: z.string().describe("画面の呼び名(アプリの言語で)"),
  elements: z.array(ElementSchema).describe("配列の順が重なり順(後ろが手前)"),
});

export const DrawnDesignSchema = z.object({
  plan: z.string().describe("このアプリができること。1 行 1 項目、「• 」で始める、4〜8 行、アプリの言語で"),
  screens: z.array(DrawnScreenSchema).min(1).max(6).describe("利用者が辿る順に 2〜5 画面"),
});
export type DrawnDesign = z.infer<typeof DrawnDesignSchema>;

const DRAW_RULES = `
あなたは大学コミュニティ向けプラットフォーム「APSlop」で、Android アプリのコードを書く前に、その画面の下書き(ワイヤーフレーム)と
「できること」の一覧を描く設計者です。利用者はプログラミング初心者で、この下書きをブラウザの編集画面で直してから、コード生成に渡します。

## 出力
- plan: アプリができることを 1 行 1 項目で 4〜8 行(「• 」で始める)。依頼文の言語で書く。依頼にない機能を勝手に足さない。
- screens: 利用者が辿る順に 2〜5 画面。画面の id は英小文字(home, add-item, detail, settings など)。title は依頼文の言語。
  画面の文字(ボタン、見出し、例の行)も依頼文の言語で書く。

## 画面の描き方(端末は phone 390×844、座標は 8 の倍数)
- 上に navbar(y 0, w 390, h 96。text が題。最初の画面以外は props.left を "back")。アプリ名・題・ボタン・例の行の文字は、
  依頼文が日本語なら日本語、英語なら英語で書く。
- 画面を切り替えるタブがあれば下に tabbar(y 760, w 390, h 84, props.items の text がタブ名, active)。
- その間が中身。上から下へ流れる中身(フォーム、カードの列)は rect(name "Body", x 0, y 96, w 390, h 664(tabbar があれば 664、無ければ 748),
  props.scroll "y", children)に入れ、children の座標は rect の左上基準で書く。
- 行の並びは list(props.items に 3〜5 行の例。sub は 2 行目、meta は右端の値)。1 つだけ選ぶ選択肢は radio。
- 入力欄は input(text がラベル、props.placeholder が例)。主な操作のボタンは button variant "filled"(w 342, h 52, x 24)。
  画面の主な操作が 1 つなら右下に fab(x 310, y 680, text は依頼文の言語で "+ Add" / "+ 追加" など)。
- 余白は左右 24、部品の間は 16〜24。重ねない。端末の幅 390 からはみ出さない。
- 種類ごとの既定の大きさ: text 200×24、button 160×48、input 280×56、list 342×168、checkbox/toggle 200×32、rect 200×120、
  divider 342×1、chip 64×32、icon 24×24、image 200×150、fab 56×56、tabs 342×36、radio 342×(行数×48)、progress 342×14、
  badge 80×20、avatar 48×48、slider 342×48。
- rect には name を付ける。rect 以外に children を書かない。rect の中に rect を入れない(1 段だけ)。
- 色・テーマは書かない(編集画面で選ぶ)。

## 守ること
- 依頼文に書かれた機能だけを画面にする。足りない画面があれば足し、要らない画面は作らない。
- 1 画面の部品は 4〜12 個。細かすぎる作り込みはしない(利用者が直す下書き)。
`;

/** AI draws the plan and the screens; checked with the editor's core, with one round of corrections. */
export async function drawDesign(prompt: string, choice: ModelChoice): Promise<{ plan: string; files: DesignFiles }> {
  const user = `次の説明のアプリの「できること」と画面を描いてください。\n\n<request>\n${prompt}\n</request>`;
  const drawn = await runStructured(DrawnDesignSchema, DRAW_RULES, user, choice);
  const { files, problems } = toFiles(drawn);
  if (problems.length) {
    // Once more, with the checker's complaints; what still fails is dropped (the user can redraw it).
    const again = await runStructured(
      DrawnDesignSchema,
      DRAW_RULES,
      `${user}\n\n前回の出力には次の誤りがありました。直して、もう一度すべて出力してください。\n${problems.join("\n")}`,
      choice,
    );
    const second = toFiles(again);
    if (Object.keys(second.files.screens).length) return { plan: again.plan.trim(), files: second.files };
  }
  if (!Object.keys(files.screens).length) throw new Error("AI could not draw a screen that passes the checks. Try again, or change the request.");
  return { plan: drawn.plan.trim(), files };
}

/**
 * The drawn screens as screen files: AI's subset mapped to the editor's shapes, filled and settled,
 * and checked. A screen that fails is left out and its problems reported.
 */
export function toFiles(drawn: DrawnDesign): { files: DesignFiles; problems: string[] } {
  const project = emptyProject("app");
  const screens: Record<string, Screen> = {};
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const d of drawn.screens) {
    if (seen.has(d.id)) {
      problems.push(`画面 ${d.id}: 同じ id の画面が 2 つあります`);
      continue;
    }
    seen.add(d.id);
    const screen: Screen = { version: 1, id: d.id, title: d.title, elements: d.elements.map(toElement) };
    uniqueIds(screen.elements, new Set());
    const dropped = dropFailing(screen);
    problems.push(...dropped.map((m) => `画面 ${d.id}: ${m}`));
    const result = wf.validateScreen(screen, { registry: wf.registry, fileId: d.id, projectDevice: DESIGN_DEVICE });
    if (result.errors.length) {
      problems.push(...result.errors.map((e) => `画面 ${d.id}: ${e.path}: ${e.message}`));
      continue;
    }
    screens[d.id] = settled(screen, DESIGN_DEVICE);
    project.screens!.push(d.id);
  }
  return { files: { project, screens }, problems };
}

type Drawn = z.infer<typeof ElementSchema>;

function toElement(e: Drawn): Element {
  const out: Element = { id: e.id, type: e.type, x: e.x, y: e.y };
  if (e.name) out.name = e.name;
  if (e.w !== undefined) out.w = e.w;
  if (e.h !== undefined) out.h = e.h;
  if (e.text !== undefined) out.text = e.text;
  if (e.variant && e.type === "button") out.variant = e.variant;
  const props = toProps(e.type, e.props);
  if (props) out.props = props;
  if (e.children?.length && e.type === "rect") out.children = e.children.map((c) => toElement({ ...c }));
  return out;
}

function toProps(type: string, p: Drawn["props"]): Record<string, unknown> | undefined {
  if (!p) return undefined;
  const out: Record<string, unknown> = {};
  const choice = type === "tabbar" || type === "tabs" || type === "radio";
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined) continue;
    if (k === "items") out.items = choice ? (v as { text: string }[]).map((r) => r.text) : v;
    else out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

/** AI sometimes reuses an id; the checker refuses that, so a second "nav" becomes "nav-2". */
function uniqueIds(elements: Element[], seen: Set<string>): void {
  for (const e of elements) {
    if (seen.has(e.id)) {
      let n = 2;
      while (seen.has(`${e.id}-${n}`)) n++;
      e.id = `${e.id}-${n}`;
    }
    seen.add(e.id);
    if (e.children) uniqueIds(e.children, seen);
  }
}

/**
 * Drops the elements the checker rejects, a few times, so one bad part does not lose the screen. The
 * checker names a problem by the part's id ("vol.props.max", "bad.type") or by nothing a part owns.
 */
function dropFailing(screen: Screen): string[] {
  const dropped: string[] = [];
  const remove = (list: Element[], id: string): boolean => {
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) {
      list.splice(i, 1);
      return true;
    }
    return list.some((x) => !!x.children && remove(x.children, id));
  };
  for (let round = 0; round < 8; round++) {
    const result = wf.validateScreen(screen, { registry: wf.registry, fileId: screen.id, projectDevice: DESIGN_DEVICE });
    if (!result.errors.length) break;
    const e = result.errors[0];
    const id = e.path.split(".")[0].replace(/\[.*$/, "");
    if (!id || !remove(screen.elements, id)) break;
    dropped.push(`部品 ${id} を外しました(${e.path}: ${e.message})`);
  }
  return dropped;
}

/** The confirmed design as the code generation reads it: the plan, then each screen as an outline and as its file. */
export function designForPrompt(plan: string, files: DesignFiles): string {
  const parts = [`## できること(利用者が確認済み)\n${plan.trim()}`];
  for (const id of files.project.screens ?? []) {
    const s = files.screens[id];
    if (!s) continue;
    const lines = [`### 画面「${s.title}」(id: ${id})`, ...outline(s.elements, 0), "", "<screen_json>", JSON.stringify(s), "</screen_json>"];
    parts.push(lines.join("\n"));
  }
  return parts.join("\n\n");
}

function outline(elements: Element[], depth: number): string[] {
  const pad = "  ".repeat(depth);
  const out: string[] = [];
  for (const e of elements) {
    const bits = [e.type];
    if (e.text) bits.push(`"${e.text}"`);
    if (e.name) bits.push(`(${e.name})`);
    const p = e.props ?? {};
    if (Array.isArray(p.items)) {
      const items = p.items as unknown[];
      bits.push(`items: ${items.map((r) => (typeof r === "string" ? r : (r as { text?: string }).text ?? "")).join(" / ")}`);
    }
    for (const k of ["placeholder", "left", "right", "kind", "checked", "scroll", "trailing", "leading"]) {
      if (p[k] !== undefined) bits.push(`${k}: ${p[k]}`);
    }
    if (e.variant) bits.push(e.variant);
    out.push(`${pad}- ${bits.join(" ")} @${e.x ?? 0},${e.y ?? 0}${e.w !== undefined ? ` ${e.w}×${e.h ?? "?"}` : ""}`);
    if (e.children) out.push(...outline(e.children, depth + 1));
  }
  return out;
}
