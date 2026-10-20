import { env, fdroidRepoUrl } from "@/lib/env";
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
  versionName: string;
  versionCode: number;
  iconUrl: string | null;
  apkUrl: string;
  added: number;
  lastUpdated: number;
};

async function storeFetch(path: string, init?: RequestInit): Promise<Response> {
  const e = env();
  return fetch(`${e.STORE_SERVER_URL.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: { "content-type": "application/json", "X-Store-Token": e.STORE_TOKEN, ...(init?.headers ?? {}) },
    cache: "no-store",
  });
}

/** Ask the store server to ingest the APK from a GitHub release. */
export async function syncRelease(repoFullName: string, tag?: string): Promise<SyncResult> {
  const res = await storeFetch("/sync", {
    method: "POST",
    body: JSON.stringify({ repo: repoFullName, tag }),
  });
  const json = (await res.json().catch(() => ({}))) as Partial<SyncResult> & { error?: string };
  if (!res.ok) throw new Error(json.error ?? `ストアサーバーがエラーを返しました (${res.status})`);
  return json as SyncResult;
}

export async function listStoreApps(): Promise<StoreApp[]> {
  try {
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

export function apkDownloadUrl(apkName: string): string {
  return `${fdroidRepoUrl()}/${apkName}`;
}

/** Sync a release and persist the result on the App row. */
export async function syncAppBySlug(slug: string, tag?: string) {
  const app = await prisma.app.findUnique({ where: { slug } });
  if (!app) throw new Error("アプリが見つかりません");
  try {
    const result = await syncRelease(app.repoFullName, tag);
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
