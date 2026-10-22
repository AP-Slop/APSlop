import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GeneratedAppSchema } from "@/lib/ai";
import { createRepoWithFiles, repoExists } from "@/lib/github";
import { mergeFiles, readTemplateFiles } from "@/lib/template";
import { parseFiles, repoFiles } from "@/lib/wireframe-store";

export const maxDuration = 300;

const Body = z.object({ generated: GeneratedAppSchema, generationId: z.string().optional() });

export const POST = handle(async (req: Request) => {
  const session = await requireSession();
  const { generated, generationId } = Body.parse(await readJson(req));

  if ((await prisma.app.findUnique({ where: { slug: generated.slug } })) || (await repoExists(generated.slug))) {
    return NextResponse.json({ error: `The name "${generated.slug}" is already taken. Change the repository name.` }, { status: 409 });
  }

  const template = await readTemplateFiles();
  // The screens the code was written from go into the repo too (docs/wireframes/), for later changes.
  const generation = generationId ? await prisma.generation.findFirst({ where: { id: generationId, userId: session.user.id } }) : null;
  const design = generation?.designId ? await prisma.design.findUnique({ where: { id: generation.designId } }) : null;
  const files = mergeFiles(template, [...generated.files, ...(design ? repoFiles(parseFiles(design)) : [])]);
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
    // CI builds the initial commit; the webhook records the result (and has AI fix a failure).
    await prisma.generation.updateMany({
      where: { id: generationId, userId: session.user.id },
      data: { repoFullName: repo.fullName, buildStatus: "BUILDING", buildBranch: repo.defaultBranch, buildRounds: 0 },
    });
  }
  return NextResponse.json({ slug: app.slug, repoFullName: repo.fullName, htmlUrl: repo.htmlUrl });
});
