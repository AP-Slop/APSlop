import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: {} }));
const runStructured = vi.fn();
vi.mock("@/lib/ai", () => ({ runStructured }));

const { DrawnDesignSchema, designForPrompt, drawDesign, toFiles } = await import("./design-ai");

afterEach(() => vi.clearAllMocks());

const drawn = {
  plan: "• Rate menus\n• See the average",
  screens: [
    {
      id: "home",
      title: "Today's menu",
      elements: [
        { id: "nav", type: "navbar", x: 0, y: 0, w: 390, h: 96, text: "Today's menu" },
        {
          id: "body",
          type: "rect",
          name: "Body",
          x: 0,
          y: 96,
          w: 390,
          h: 664,
          props: { scroll: "y" },
          children: [
            { id: "menus", type: "list", x: 24, y: 16, w: 342, h: 168, props: { items: [{ text: "Curry", meta: "4.2" }, { text: "Udon", sub: "noodles" }] } },
            { id: "go", type: "button", x: 24, y: 208, w: 342, h: 52, text: "Write a review", variant: "filled" },
          ],
        },
        { id: "tabs", type: "tabbar", x: 0, y: 760, w: 390, h: 84, props: { items: [{ text: "Today" }, { text: "Past" }], active: 0 } },
      ],
    },
  ],
};

describe("toFiles", () => {
  it("turns AI's subset into checked screen files: tab names become strings, rows stay rows, the order is kept", () => {
    expect(DrawnDesignSchema.safeParse(drawn).success).toBe(true);
    const { files, problems } = toFiles(DrawnDesignSchema.parse(drawn));
    expect(problems).toEqual([]);
    expect(files.project.screens).toEqual(["home"]);
    const home = files.screens.home;
    const tabbar = home.elements.find((e) => e.type === "tabbar")!;
    expect(tabbar.props?.items).toEqual(["Today", "Past"]);
    const body = home.elements.find((e) => e.id === "body")!;
    const list = body.children!.find((e) => e.type === "list")!;
    expect(list.props?.items).toEqual([{ text: "Curry", meta: "4.2" }, { text: "Udon", sub: "noodles" }]);
    expect(home.device).toBeUndefined();
  });

  it("renames a reused id instead of losing the part", () => {
    const twice = structuredClone(drawn);
    twice.screens[0].elements.push({ id: "nav", type: "text", x: 0, y: 0, text: "duplicate id" } as never);
    const { files, problems } = toFiles(DrawnDesignSchema.parse(twice));
    expect(problems).toEqual([]);
    expect(files.screens.home.elements.map((e) => e.id)).toContain("nav-2");
  });

  it("drops a part the checker rejects and keeps the screen, naming the problem", () => {
    const bad = structuredClone(drawn);
    bad.screens[0].elements.push({ id: "vol", type: "slider", x: 24, y: 300, props: { min: 10, max: 0 } } as never);
    const { files, problems } = toFiles(DrawnDesignSchema.parse(bad));
    expect(files.screens.home).toBeTruthy();
    expect(files.screens.home.elements.map((e) => e.id)).not.toContain("vol");
    expect(problems[0]).toContain("vol");
  });

  it("leaves out a second screen with the same id", () => {
    const twice = { ...drawn, screens: [drawn.screens[0], { ...drawn.screens[0], title: "Again" }] };
    const { files, problems } = toFiles(DrawnDesignSchema.parse(twice));
    expect(Object.keys(files.screens)).toEqual(["home"]);
    expect(problems[0]).toContain("同じ id");
  });
});

describe("drawDesign", () => {
  it("asks once when the drawing passes", async () => {
    runStructured.mockResolvedValueOnce(DrawnDesignSchema.parse(drawn));
    const r = await drawDesign("Rate cafeteria menus", "claude");
    expect(runStructured).toHaveBeenCalledTimes(1);
    expect(r.plan).toBe(drawn.plan);
    expect(Object.keys(r.files.screens)).toEqual(["home"]);
  });

  it("asks again with the problems when something was dropped, and takes the second drawing", async () => {
    const bad = structuredClone(drawn);
    bad.screens[0].elements.push({ id: "vol", type: "slider", x: 24, y: 300, props: { min: 10, max: 0 } } as never);
    runStructured.mockResolvedValueOnce(DrawnDesignSchema.parse(bad)).mockResolvedValueOnce(DrawnDesignSchema.parse({ ...drawn, plan: "• second" }));
    const r = await drawDesign("Rate cafeteria menus", "claude");
    expect(runStructured).toHaveBeenCalledTimes(2);
    expect(String(runStructured.mock.calls[1][2])).toContain("前回の出力には次の誤り");
    expect(r.plan).toBe("• second");
  });
});

describe("designForPrompt", () => {
  it("writes the plan, an outline per screen and the screen file", () => {
    const { files } = toFiles(DrawnDesignSchema.parse(drawn));
    const text = designForPrompt(drawn.plan, files);
    expect(text).toContain("• Rate menus");
    expect(text).toContain("画面「Today's menu」(id: home)");
    expect(text).toContain('navbar "Today\'s menu"');
    expect(text).toContain("items: Curry / Udon");
    expect(text).toContain("<screen_json>");
  });
});
