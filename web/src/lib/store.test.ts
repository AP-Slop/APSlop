import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: {} }));

const storeApp = { packageName: "dev.apslop.store", apkUrl: "http://store.test/fdroid/repo/dev.apslop.store_1.apk" };

async function load(env: Record<string, string>, apps: unknown[]) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(apps))));
  return import("./store");
}

afterEach(() => {
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
