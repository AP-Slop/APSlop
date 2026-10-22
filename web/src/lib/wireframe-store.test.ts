import { afterEach, describe, expect, it, vi } from "vitest";
import { hashText, serialize } from "@/vendor/wireframe/core";

const update = vi.fn(async () => ({}));
vi.mock("@/lib/db", () => ({ prisma: { design: { update } } }));

const { createScreen, deleteScreen, emptyProject, parseFiles, projectResponse, putProject, putScreen, repoFiles, screenResponse, settled } =
  await import("./wireframe-store");

const home = settled({ version: 1, id: "home", title: "Home", elements: [{ id: "nav", type: "navbar", x: 0, y: 0, text: "Home" }] }, "phone");
const project = { ...emptyProject("app"), screens: ["home"] };
const row = () => ({ id: "d1", project: serialize(project), screens: JSON.stringify({ home }), updatedAt: new Date("2026-10-23T00:00:00Z") });

afterEach(() => vi.clearAllMocks());

describe("projectResponse", () => {
  it("answers what the editor loads first: the flat project as proposal a, its screens with hashes, themes", async () => {
    const r = await projectResponse(row());
    expect(r.status).toBe(200);
    const body = r.body as { proposal: string; screens: { id: string; hash: string }[]; themes: { id: string }[]; proposals: { id: string }[] };
    expect(body.proposal).toBe("a");
    expect(body.screens.map((s) => s.id)).toEqual(["home"]);
    expect(body.screens[0].hash).toBe(await hashText(serialize(home)));
    expect(body.themes.map((t) => t.id)).toEqual(["clean", "navy", "ink"]);
    expect(body.proposals[0].id).toBe("a");
  });

  it("reads a broken row as an empty project", () => {
    const files = parseFiles({ project: "{", screens: "nope" });
    expect(files.project.screens).toEqual([]);
    expect(files.screens).toEqual({});
  });
});

describe("putScreen", () => {
  const baseHash = async () => hashText(serialize(home));

  it("saves a valid screen, answers the new hash and the changes, and writes the row", async () => {
    const moved = { ...home, elements: [{ ...home.elements[0], text: "Start" }] };
    const r = await putScreen(row(), "home", { screen: moved, baseHash: await baseHash() });
    expect(r.status).toBe(200);
    const body = r.body as { hash: string; changes: { kind: string }[] };
    expect(body.changes.map((c) => c.kind)).toContain("text");
    expect(update).toHaveBeenCalledTimes(1);
    const data = update.mock.calls[0][0 as never] as unknown as { data: { screens: string } };
    expect(JSON.parse(data.data.screens).home.elements[0].text).toBe("Start");
    expect(body.hash).toBe(await hashText(serialize(JSON.parse(data.data.screens).home)));
  });

  it("refuses a stale save with 409 and the current hash, unless forced", async () => {
    const r = await putScreen(row(), "home", { screen: home, baseHash: "old" });
    expect(r.status).toBe(409);
    expect((r.body as { currentHash: string }).currentHash).toBe(await baseHash());
    expect(update).not.toHaveBeenCalled();
    expect((await putScreen(row(), "home", { screen: home, baseHash: "old", force: true })).status).toBe(200);
  });

  it("refuses a screen the checker rejects with 422", async () => {
    const bad = { ...home, elements: [{ id: "x", type: "nosuch", x: 0, y: 0 }] };
    const r = await putScreen(row(), "home", { screen: bad, baseHash: await baseHash() });
    expect(r.status).toBe(422);
    expect(update).not.toHaveBeenCalled();
  });

  it("saves the theme sent along with the screen", async () => {
    const r = await putScreen(row(), "home", {
      screen: home,
      baseHash: await baseHash(),
      project: { ...project, theme: "navy" },
      projectBaseHash: await hashText(serialize(project)),
    });
    expect(r.status).toBe(200);
    expect((r.body as { projectHash?: string }).projectHash).toBeTruthy();
    const data = update.mock.calls[0][0 as never] as unknown as { data: { project: string } };
    expect(JSON.parse(data.data.project).theme).toBe("navy");
  });

  it("answers 404 for a screen the design does not have", async () => {
    expect((await putScreen(row(), "nope", { screen: home, baseHash: "x" })).status).toBe(404);
  });
});

describe("createScreen / deleteScreen / putProject", () => {
  it("creates a screen from a built-in template and adds it to the order", async () => {
    const r = await createScreen(row(), { id: "settings", title: "Settings", from: "builtin:settings" });
    expect(r.status).toBe(201);
    const data = update.mock.calls[0][0 as never] as unknown as { data: { project: string; screens: string } };
    expect(JSON.parse(data.data.project).screens).toEqual(["home", "settings"]);
    const created = JSON.parse(data.data.screens).settings;
    expect(created.title).toBe("Settings");
    expect(created.elements.length).toBeGreaterThan(0);
  });

  it("creates a blank screen and a copy of a project screen; refuses images and bad ids", async () => {
    expect((await createScreen(row(), { id: "blank", title: "Blank", from: "blank" })).status).toBe(201);
    expect((await createScreen(row(), { id: "home-2", title: "Home 2", from: "project:home" })).status).toBe(201);
    expect((await createScreen(row(), { id: "pic", title: "Pic", from: "ai:ref-1" })).status).toBe(422);
    expect((await createScreen(row(), { id: "Bad Id", title: "x", from: "blank" })).status).toBe(422);
    expect((await createScreen(row(), { id: "home", title: "x", from: "blank" })).status).toBe(409);
  });

  it("deletes a screen and drops it from the order", async () => {
    expect((await deleteScreen(row(), "home")).status).toBe(204);
    const data = update.mock.calls[0][0 as never] as unknown as { data: { project: string; screens: string } };
    expect(JSON.parse(data.data.project).screens).toEqual([]);
    expect(JSON.parse(data.data.screens)).toEqual({});
  });

  it("saves the project (theme, order) with a hash check", async () => {
    const stale = await putProject(row(), { project: { ...project, theme: "ink" }, baseHash: "old" });
    expect(stale.status).toBe(409);
    const ok = await putProject(row(), { project: { ...project, theme: "ink" }, baseHash: await hashText(serialize(project)) });
    expect(ok.status).toBe(200);
  });

  it("answers a screen with its hash, and 404 for an unknown one", async () => {
    expect((await screenResponse(row(), "home")).status).toBe(200);
    expect((await screenResponse(row(), "nope")).status).toBe(404);
  });
});

describe("repoFiles", () => {
  it("lists project.json and the screens under docs/wireframes/ in order", () => {
    const files = repoFiles(parseFiles(row()));
    expect(files.map((f) => f.path)).toEqual(["docs/wireframes/project.json", "docs/wireframes/home.json"]);
    expect(JSON.parse(files[1].content).id).toBe("home");
  });
});
