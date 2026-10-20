import { z } from "zod";
import type { App } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { deleteRepo, repoName, updateRepoDescription } from "@/lib/github";
import { removeFromStore, setStoreSummary } from "@/lib/store";

export const SUMMARY_MAX = 80;

/** The store's one-line summary: F-Droid cuts it at 80 characters. */
export const SummarySchema = z
  .string()
  .trim()
  .min(1, "Write a summary.")
  .max(SUMMARY_MAX, `Keep the summary to ${SUMMARY_MAX} characters.`)
  .refine((s) => !/[\r\n]/.test(s), "Keep the summary on one line.");

export const STORE_SUMMARY_LATER =
  "Saved. The store could not be updated right now; it will show the new summary after the next release.";

/**
 * The repo description is where the store reads the summary on every release, so it is changed first;
 * then the app row; then the store, when the app is in it.
 */
export async function updateSummary(app: App, summary: string): Promise<App> {
  await updateRepoDescription(repoName(app.repoFullName), summary);
  const updated = await prisma.app.update({ where: { id: app.id }, data: { summary } });
  if (app.packageName && app.status === "PUBLISHED") {
    try {
      await setStoreSummary(app.packageName, summary);
    } catch (e) {
      console.warn(`setStoreSummary(${app.packageName}) failed:`, (e as Error).message);
      throw Object.assign(new Error(STORE_SUMMARY_LATER), { status: 502 });
    }
  }
  return updated;
}

/**
 * Off the store first (if that fails nothing has changed), then the repo, then the app row.
 * Each step can be repeated, so a delete that stopped half way can simply be run again.
 */
export async function deleteApp(app: App): Promise<void> {
  if (app.packageName) {
    await removeFromStore(app.packageName);
    if (app.status === "PUBLISHED") {
      await prisma.app.update({
        where: { id: app.id },
        data: { status: "DRAFT", latestVersion: null, latestVersionCode: null, latestApkName: null },
      });
    }
  }
  await deleteRepo(repoName(app.repoFullName));
  await prisma.app.delete({ where: { id: app.id } });
}
