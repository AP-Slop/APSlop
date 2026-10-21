import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: {} }));
const cloudflareEnv = vi.fn((): unknown => undefined);
vi.mock("@/lib/cloudflare", () => ({ cloudflareEnv }));

const storeApp = { packageName: "dev.apslop.store", apkUrl: "http://store.test/fdroid/repo/dev.apslop.store_1.apk" };

async function load(env: Record<string, string>, apps: unknown[]) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(apps))));
  return import("./store");
}

afterEach(() => {
  cloudflareEnv.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const required = {
  GITHUB_ORG: "org",
  GITHUB_ADMIN_TOKEN: "t",
  GITHUB_CLIENT_ID: "c",
  GITHUB_CLIENT_SECRET: "s",
  AUTH_SECRET: "a",
};

describe("storeAppDownloadUrl", () => {
  it("offers the store's signed copy of the store app", async () => {
    const { storeAppDownloadUrl } = await load({ ...required, NEXT_PUBLIC_STORE_APP_URL: "" }, [{ packageName: "x" }, storeApp]);
    expect(await storeAppDownloadUrl()).toBe(storeApp.apkUrl);
  });

  it("prefers the configured URL", async () => {
    const { storeAppDownloadUrl } = await load({ ...required, NEXT_PUBLIC_STORE_APP_URL: "https://dl.example/store.apk" }, [storeApp]);
    expect(await storeAppDownloadUrl()).toBe("https://dl.example/store.apk");
  });

  it("is null while the store app is not in the store", async () => {
    const { storeAppDownloadUrl } = await load({ ...required, NEXT_PUBLIC_STORE_APP_URL: "" }, [{ packageName: "x" }]);
    expect(await storeAppDownloadUrl()).toBeNull();
  });
});

describe("on Cloudflare", () => {
  it("lists the apps from the file the store writes, without asking the store", async () => {
    const { listStoreApps } = await load(required, []);
    const get = vi.fn(async () => ({ json: async () => [storeApp] }));
    const getByName = vi.fn();
    cloudflareEnv.mockReturnValue({ STORE: { getByName }, STORE_FILES: { get } });
    expect(await listStoreApps()).toEqual([storeApp]);
    expect(get).toHaveBeenCalledWith("apps.json");
    expect(getByName).not.toHaveBeenCalled();
  });

  it("is an empty list before the store has written one", async () => {
    const { listStoreApps } = await load(required, []);
    cloudflareEnv.mockReturnValue({ STORE: { getByName: vi.fn() }, STORE_FILES: { get: async () => null } });
    expect(await listStoreApps()).toEqual([]);
  });

  it("sends changes to the store container with the token", async () => {
    const { removeFromStore } = await load({ ...required, STORE_TOKEN: "tok" }, []);
    const fetch = vi.fn(async () => new Response("{}"));
    cloudflareEnv.mockReturnValue({ STORE: { getByName: () => ({ fetch }) }, STORE_FILES: { get: vi.fn() } });
    await removeFromStore("dev.example");
    expect(fetch).toHaveBeenCalledWith(
      "http://store/apps/dev.example",
      expect.objectContaining({ method: "DELETE", headers: expect.objectContaining({ "X-Store-Token": "tok" }) }),
    );
  });
});
