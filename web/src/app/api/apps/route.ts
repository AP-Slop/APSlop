import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GeneratedAppSchema } from "@/lib/ai";
import { createRepoWithFiles } from "@/lib/github";
import { mergeFiles, readTemplateFiles } from "@/lib/template";

export const maxDuration = 300;

const Body = z.object({ generated: GeneratedAppSchema, generationId: z.string().optional() });

export const POST = handle(async (req: Request) => {
  const session = await requireSession();
  const { generated, generationId } = Body.parse(await readJson(req));

  if (await prisma.app.findUnique({ where: { slug: generated.slug } })) {
    return NextResponse.json({ error: `"${generated.slug}" は既に使われています` }, { status: 409 });
  }

  const template = await readTemplateFiles();
  const files = mergeFiles(template, generated.files);
  const repo = await createRepoWithFiles(generated.slug, generated.summary, files, session.user.login);

  const app = await prisma.app.create({
    data: {
      slug: generated.slug,
      repoFullName: repo.fullName,
      name: generated.name,
      summary: generated.summary,
      description: generated.description,
      platform: "ANDROID",
      packageName: generated.packageName,
      status: "DRAFT",
      ownerId: session.user.id,
    },
  });
  if (generationId) {
    await prisma.generation.updateMany({
      where: { id: generationId, userId: session.user.id },
      data: { repoFullName: repo.fullName },
    });
  }
  return NextResponse.json({ slug: app.slug, repoFullName: repo.fullName, htmlUrl: repo.htmlUrl });
});
