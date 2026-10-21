import { cloudflareEnv } from "@/lib/cloudflare";
import { env, fdroidRepoUrl, publicEnv } from "@/lib/env";
import { prisma } from "@/lib/db";

export type SyncResult = {
  packageName: string;
  versionName: string;
  versionCode: number;
  apkName: string;
  sha256: string;
  signer: string;
};

export type StoreApp = {
  packageName: string;
  name: string;
  summary: string;
  /** The README as of the released tag. */
  description: string;
  versionName: string;
  versionCode: number;
  iconUrl: string | null;
  apkUrl: string;
  apkSize: number | null;
  minSdk: number | null;
  added: number;
  lastUpdated: number;
};

/** On Cloudflare (wrangler.jsonc): the store container and the R2 bucket that holds its files. */
type StoreBindings = {
  STORE: { getByName(name: string): { fetch(input: string, init?: RequestInit): Promise<Response> } };
  STORE_FILES: { get(key: string): Promise<{ json(): Promise<unknown> } | null> };
};

async function storeFetch(path: string, init?: RequestInit): Promise<Response> {
  const e = env();
  const headers = { "content-type": "application/json", "X-Store-Token": e.STORE_TOKEN, ...(init?.headers ?? {}) };
  const store = cloudflareEnv<StoreBindings>()?.STORE;
  if (store) return store.getByName("store").fetch(`http://store${path}`, { ...init, headers });
  return fetch(`${e.STORE_SERVER_URL.replace(/\/$/, "")}${path}`, { ...init, headers, cache: "no-store" });
}

/** Ask the store server to ingest the APK from a GitHub release. `author` is shown as the app's author in the store. */
export async function syncRelease(repoFullName: string, tag?: string, author?: string): Promise<SyncResult> {
  const res = await storeFetch("/sync", {
    method: "POST",
    body: JSON.stringify({ repo: repoFullName, tag, author }),
  });
  const json = (await res.json().catch(() => ({}))) as Partial<SyncResult> & { error?: string };
  if (!res.ok) throw new Error(json.error ?? `The store server answered ${res.status}`);
  return json as SyncResult;
}

export async function listStoreApps(): Promise<StoreApp[]> {
  try {
    // On Cloudflare the list is a file the store writes on every change, so pages never wait for the container to start.
    const files = cloudflareEnv<StoreBindings>()?.STORE_FILES;
    if (files) return ((await (await files.get("apps.json"))?.json()) ?? []) as StoreApp[];
    const res = await storeFetch("/apps");
    if (!res.ok) return [];
    return (await res.json()) as StoreApp[];
  } catch {
    return [];
  }
}

async function storeError(res: Response): Promise<Error> {
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  return new Error(json.error ?? `The store server answered ${res.status}`);
}

/** Change the summary the store shows. False when the package is not in the store. */
export async function setStoreSummary(packageName: string, summary: string): Promise<boolean> {
  const res = await storeFetch(`/apps/${encodeURIComponent(packageName)}/summary`, {
    method: "PUT",
    body: JSON.stringify({ summary }),
  });
  if (res.status === 404) return false;
  if (!res.ok) throw await storeError(res);
  return true;
}

/** Take a package off the store. Succeeds when it is not there. */
export async function removeFromStore(packageName: string): Promise<void> {
  const res = await storeFetch(`/apps/${encodeURIComponent(packageName)}`, { method: "DELETE" });
  if (!res.ok) throw await storeError(res);
}

/** The store's entry for one package, or null when it is not in the store (or the store cannot be reached). */
export async function findStoreApp(packageName: string | null): Promise<StoreApp | null> {
  if (!packageName) return null;
  return (await listStoreApps()).find((a) => a.packageName === packageName) ?? null;
}

/** The APSlop store app's own package, published in the store by `android/publish-store-app.sh`. */
export const STORE_APP_PACKAGE = "dev.apslop.store";

/** Where visitors download the store app: NEXT_PUBLIC_STORE_APP_URL if set, else the store's signed copy. Null when neither exists. */
export async function storeAppDownloadUrl(): Promise<string | null> {
  if (publicEnv.storeAppUrl) return publicEnv.storeAppUrl;
  return (await findStoreApp(STORE_APP_PACKAGE))?.apkUrl ?? null;
}

export function apkDownloadUrl(apkName: string): string {
  return `${fdroidRepoUrl()}/${apkName}`;
}

/** Sync a release and persist the result on the App row. */
export async function syncAppBySlug(slug: string, tag?: string) {
  const app = await prisma.app.findUnique({ where: { slug }, include: { owner: { select: { login: true } } } });
  if (!app) throw Object.assign(new Error("App not found."), { status: 404 });
  try {
    const result = await syncRelease(app.repoFullName, tag, app.owner.login);
    const storeApps = await listStoreApps();
    const storeApp = storeApps.find((a) => a.packageName === result.packageName);
    return await prisma.app.update({
      where: { id: app.id },
      data: {
        packageName: result.packageName,
        latestVersion: result.versionName,
        latestVersionCode: result.versionCode,
        latestApkName: result.apkName,
        iconUrl: storeApp?.iconUrl ?? app.iconUrl,
        status: "PUBLISHED",
        publishedAt: app.publishedAt ?? new Date(),
      },
    });
  } catch (e) {
    await prisma.app.update({ where: { id: app.id }, data: { status: app.status === "PUBLISHED" ? "PUBLISHED" : "FAILED" } });
    throw e;
  }
}
