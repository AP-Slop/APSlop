import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateApp } from "@/lib/ai";
import { env } from "@/lib/env";

export const maxDuration = 600;

const Body = z.object({ prompt: z.string().min(10).max(8000) });

export const POST = handle(async (req: Request) => {
  const session = await requireSession();
  const { prompt } = Body.parse(await readJson(req));
  const generation = await prisma.generation.create({
    data: { userId: session.user.id, kind: "CREATE", prompt, model: env().ANTHROPIC_MODEL },
  });
  try {
    const app = await generateApp(prompt);
    // Avoid collisions with existing apps by suffixing.
    let slug = app.slug;
    for (let i = 2; await prisma.app.findUnique({ where: { slug } }); i++) slug = `${app.slug}-${i}`;
    if (slug !== app.slug) {
      app.slug = slug;
      app.packageName = `dev.openap.apps.${slug.replace(/-/g, "_")}`;
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
