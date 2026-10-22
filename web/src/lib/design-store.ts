// The background step of "New app": AI draws the screens of a design (src/lib/design-ai.ts) and the row
// is updated for the page to show.
import { prisma } from "@/lib/db";
import { drawDesign } from "@/lib/design-ai";
import type { ModelChoice } from "@/lib/models";
import { serialize, normalizeProject } from "@/vendor/wireframe/core";

export async function runDraw(id: string, model: ModelChoice): Promise<void> {
  const design = await prisma.design.findUnique({ where: { id } });
  if (!design) return;
  try {
    const { plan, files } = await drawDesign(design.prompt, model);
    await prisma.design.update({
      where: { id },
      data: { status: "READY", plan, project: serialize(normalizeProject(files.project)), screens: JSON.stringify(files.screens), error: null },
    });
  } catch (e) {
    await prisma.design.update({ where: { id }, data: { status: "FAILED", error: (e as Error).message } });
  }
}
