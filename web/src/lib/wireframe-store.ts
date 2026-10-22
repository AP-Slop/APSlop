// The wireframe editor's project server, for one Design row in D1 (the editor is embedded on
// /wireframe/?design=<id> and talks to /api/wireframe/<id>/api/...). Mirrors the editor's own server
// (utils/wireframe/src/server/serve.ts) for what the embedded editor uses: one flat project (no
// proposals), screens with hash-checked saves, the built-in templates and themes. MySets, type
// Defaults, saved motions, reference images and the guide are not kept here (empty answers).
import * as wf from "@/vendor/wireframe/core";
import type { Change, Device, Project, Screen } from "@/vendor/wireframe/core";
import { prisma } from "@/lib/db";

export const DESIGN_DEVICE: Device = "phone";
export const PROPOSAL_ID = "a";

export type DesignRow = { id: string; project: string; screens: string; updatedAt: Date };
export type Answer = { status: number; body: unknown };

const json = (status: number, body: unknown): Answer => ({ status, body });
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** What a design keeps: the project and its screens by id (a flat project: `screens` is the order). */
export type DesignFiles = { project: Project; screens: Record<string, Screen> };

export function emptyProject(name: string): Project {
  return { version: 1, name, theme: wf.DEFAULT_THEME_ID, device: DESIGN_DEVICE, screens: [] };
}

export function parseFiles(row: Pick<DesignRow, "project" | "screens">): DesignFiles {
  const project = safeParse(row.project);
  const screens = safeParse(row.screens);
  return {
    project: isObject(project) && project.version === 1 ? (project as unknown as Project) : emptyProject(""),
    screens: isObject(screens) ? (screens as Record<string, Screen>) : {},
  };
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** The text a screen is kept as; its hash is what the editor sends back as baseHash. */
const screenText = (s: Screen) => wf.serialize(s);
const projectText = (p: Project) => wf.serialize(wf.normalizeProject(p));

async function entries(files: DesignFiles, modifiedAt: string) {
  const order = files.project.screens ?? [];
  const ids = [...order, ...Object.keys(files.screens).filter((id) => !order.includes(id))];
  const out = [];
  for (const id of ids) {
    const screen = files.screens[id];
    if (!screen) continue;
    out.push({ id, title: screen.title, hash: await wf.hashText(screenText(screen)), modifiedAt });
  }
  return out;
}

/** GET /api/project: everything the editor loads first. */
export async function projectResponse(row: DesignRow): Promise<Answer> {
  const files = parseFiles(row);
  const modifiedAt = row.updatedAt.toISOString();
  const screens = await entries(files, modifiedAt);
  return json(200, {
    project: files.project,
    hash: await wf.hashText(projectText(files.project)),
    screens,
    themes: wf.BUILTIN_THEMES,
    proposals: [{ id: PROPOSAL_ID, name: "Design A", theme: files.project.theme, modifiedAt, screens }],
    proposal: PROPOSAL_ID,
    references: [],
    defaults: wf.emptyDefaults(),
    guide: { guide: null, hash: null },
  });
}

export async function screenResponse(row: DesignRow, id: string): Promise<Answer> {
  const files = parseFiles(row);
  const screen = files.screens[id];
  if (!screen) return json(404, { error: `画面 ${id} がありません` });
  const result = wf.validateScreen(screen, { registry: wf.registry, fileId: id, projectDevice: files.project.device });
  if (result.errors.length) {
    return json(422, { error: wf.formatIssues(`${id}.json`, { errors: result.errors, warnings: [] }).join("\n") });
  }
  return json(200, { screen, hash: await wf.hashText(screenText(screen)) });
}

async function persist(id: string, files: DesignFiles): Promise<void> {
  await prisma.design.update({
    where: { id },
    data: { project: projectText(files.project), screens: JSON.stringify(files.screens) },
  });
}

type ProjectOrAnswer = { project: Project } | { answer: Answer };

function validProject(project: unknown, files: DesignFiles): ProjectOrAnswer {
  if (!isObject(project)) return { answer: json(422, { errors: [{ path: "project", message: "project はオブジェクトである必要があります" }] }) };
  // The editor never edits references; a flat project has none. Keep the server's device.
  const edited = { ...(project as Project) };
  delete edited.references;
  delete edited.proposals;
  const next: Project = { ...edited, device: files.project.device };
  const result = wf.validateProject(next, {
    themeIds: wf.BUILTIN_THEMES.map((t) => t.id),
    screenIds: Object.keys(files.screens),
  });
  if (result.errors.length) return { answer: json(422, { errors: result.errors }) };
  return { project: next };
}

/** PUT /api/project (theme, screen order). */
export async function putProject(row: DesignRow, body: unknown): Promise<Answer> {
  if (!isObject(body)) return json(400, { error: "JSON の本文が必要です" });
  const files = parseFiles(row);
  const v = validProject(body.project, files);
  if ("answer" in v) return v.answer;
  const currentHash = await wf.hashText(projectText(files.project));
  if (currentHash !== body.baseHash && body.force !== true) return json(409, { currentHash });
  files.project = v.project;
  await persist(row.id, files);
  return json(200, { hash: await wf.hashText(projectText(files.project)) });
}

/** The screen as it is written: filled, groups settled, normalized (what the editor's server does). */
export function settled(screen: Screen, device: Device): Screen {
  const filled = wf.fillScreen(screen, device, wf.registry);
  return wf.normalizeScreen({ ...wf.settleStated(filled), device: screen.device });
}

/** PUT /api/screens/:id — the save. Answers the editor's hashes and the diff it shows. */
export async function putScreen(row: DesignRow, id: string, body: unknown): Promise<Answer> {
  if (!isObject(body)) return json(400, { error: "JSON の本文が必要です" });
  const files = parseFiles(row);
  const current = files.screens[id];
  if (!current) return json(404, { error: `画面 ${id} がありません` });
  const force = body.force === true;

  let nextProject: Project | undefined;
  if (body.project !== undefined) {
    const v = validProject(body.project, files);
    if ("answer" in v) return v.answer;
    nextProject = v.project;
  }
  const device = files.project.device;
  const sr = wf.validateScreen(body.screen, { registry: wf.registry, fileId: id, projectDevice: device });
  if (sr.errors.length) return json(422, { errors: sr.errors });

  const currentHash = await wf.hashText(screenText(current));
  if (currentHash !== body.baseHash && !force) return json(409, { currentHash });
  const currentProjectHash = await wf.hashText(projectText(files.project));
  if (nextProject && currentProjectHash !== body.projectBaseHash && !force) {
    return json(409, { currentHash, currentProjectHash });
  }

  const before = wf.fillScreen(current, device, wf.registry);
  const after = wf.fillScreen(body.screen as Screen, device, wf.registry);
  const changes: Change[] = wf.diffScreens(before, after);
  let projectHash: string | undefined;
  if (nextProject) {
    changes.push(...wf.diffTheme(files.project.theme, nextProject.theme));
    files.project = nextProject;
    projectHash = await wf.hashText(projectText(nextProject));
  }
  files.screens[id] = settled(body.screen as Screen, device);
  await persist(row.id, files);
  return json(200, { hash: await wf.hashText(screenText(files.screens[id])), ...(projectHash ? { projectHash } : {}), changes });
}

/** POST /api/screens — a new screen from blank / builtin:<id> / project:<id>. */
export async function createScreen(row: DesignRow, body: unknown): Promise<Answer> {
  if (!isObject(body)) return json(400, { error: "JSON の本文が必要です" });
  const errors: { path: string; message: string }[] = [];
  const id = typeof body.id === "string" ? body.id : "";
  const title = typeof body.title === "string" ? body.title : "";
  const from = typeof body.from === "string" ? body.from : "";
  if (!wf.ID_PATTERN.test(id) || id === "project") errors.push({ path: "id", message: "id は ^[a-z0-9][a-z0-9-]*$ の文字列である必要があります" });
  if (!title) errors.push({ path: "title", message: "title は空でない文字列である必要があります" });
  const ref = wf.parseTemplateRef(from);
  if (!ref) errors.push({ path: "from", message: "from は blank / builtin:<id> / project:<id> です" });
  if (errors.length) return json(422, { errors });
  const files = parseFiles(row);
  if (files.screens[id]) return json(409, { error: `画面 ${id} はもうあります` });

  let base: Screen | undefined;
  if (ref!.source === "blank") base = { version: 1, id, title, elements: [] };
  else if (ref!.source === "builtin") base = wf.findBuiltin(ref!.id);
  else if (ref!.source === "project") base = files.screens[ref!.id];
  else return json(422, { error: "画像からの画面はここでは作れません" });
  if (!base) return json(422, { error: `ひな形 ${from} がありません` });

  const screen: Screen = { ...structuredClone(base), id, title };
  files.screens[id] = settled(screen, files.project.device);
  files.project.screens = [...(files.project.screens ?? []), id];
  await persist(row.id, files);
  return json(201, { id, hash: await wf.hashText(screenText(files.screens[id])) });
}

export async function deleteScreen(row: DesignRow, id: string): Promise<Answer> {
  const files = parseFiles(row);
  if (!files.screens[id]) return json(404, { error: `画面 ${id} がありません` });
  delete files.screens[id];
  files.project.screens = (files.project.screens ?? []).filter((s) => s !== id);
  await persist(row.id, files);
  return json(204, null);
}

export function templatesResponse(): Answer {
  return json(200, {
    templates: wf.BUILTIN_TEMPLATES.map((t) => ({ source: "builtin", id: t.id, title: t.title, device: t.device, template: t })),
  });
}

export function templateResponse(source: string, id: string): Answer {
  if (source !== "builtin") return json(404, { error: "not found" });
  const t = wf.findBuiltin(id);
  return t ? json(200, { template: t }) : json(404, { error: `ひな形 ${id} がありません` });
}

/** Everything the embedded editor may ask for besides the project and its screens. */
export function libraryResponse(method: string, path: string): Answer {
  if (method === "GET") {
    if (path === "/api/guide") return json(200, { guide: null, hash: null });
    if (path === "/api/defaults") return json(200, { defaults: wf.emptyDefaults() });
    if (path === "/api/components") return json(200, { components: [] });
    if (path === "/api/motions") return json(200, { motions: [] });
    if (path === "/api/health") return json(200, { ok: true });
    return json(404, { error: "not found" });
  }
  return json(405, { error: "ここでは使えません(MySet・Default・動き・参考画像・案は、この編集画面では保存できません)" });
}

/** The screen files as committed to the generated app's repo (docs/wireframes/, a flat project). */
export function repoFiles(files: DesignFiles): { path: string; content: string }[] {
  const out = [{ path: "docs/wireframes/project.json", content: projectText(files.project) }];
  for (const id of files.project.screens ?? []) {
    const s = files.screens[id];
    if (s) out.push({ path: `docs/wireframes/${id}.json`, content: screenText(s) });
  }
  return out;
}
