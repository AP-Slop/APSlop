import { NextResponse } from "next/server";
import { z } from "zod";
import type { ModelChoice as ModelChoiceSchemaType } from "@/lib/models";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateApp } from "@/lib/ai";
import { repoExists } from "@/lib/github";
import { ModelChoiceSchema, choiceForModel, modelOption } from "@/lib/models";
import { designForPrompt } from "@/lib/design-ai";
import { parseFiles } from "@/lib/wireframe-store";

export const maxDuration = 600;

const Body = z.union([
  z.object({ prompt: z.string().min(10).max(8000), model: ModelChoiceSchema.default("claude") }),
  // From a design (the screens the user confirmed): the prompt and the AI are the design's.
  z.object({ designId: z.string().min(1) }),
]);

export const POST = handle(async (req: Request) => {
  const session = await requireSession();
  const body = Body.parse(await readJson(req));
  let prompt: string;
  let model: ModelChoiceSchemaType;
  let designId: string | undefined;
  let request: string;
  if ("designId" in body) {
    const design = await prisma.design.findFirst({ where: { id: body.designId, userId: session.user.id } });
    if (!design || design.status !== "READY") return NextResponse.json({ error: "The screens are not ready yet." }, { status: 409 });
    prompt = design.prompt;
    model = choiceForModel(design.model);
    designId = design.id;
    request = `${design.prompt}\n\n${designForPrompt(design.plan, parseFiles(design))}`;
  } else {
    prompt = body.prompt;
    model = body.model;
    request = body.prompt;
  }
  const generation = await prisma.generation.create({
    data: { userId: session.user.id, kind: "CREATE", prompt, model: modelOption(model).model, designId },
  });
  try {
    const app = await generateApp(request, model);
    // Avoid collisions with existing apps by suffixing.
    let slug = app.slug;
    const taken = async (s: string) => !!(await prisma.app.findUnique({ where: { slug: s } })) || (await repoExists(s));
    for (let i = 2; await taken(slug); i++) slug = `${app.slug}-${i}`;
    if (slug !== app.slug) {
      app.slug = slug;
      app.packageName = `dev.apslop.apps.${slug.replace(/-/g, "_")}`;
    }
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "DONE", finishedAt: new Date() },
    });
    return NextResponse.json({ generationId: generation.id, app });
  } catch (e) {
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "FAILED", error: (e as Error).message, finishedAt: new Date() },
    });
    throw e;
  }
});
