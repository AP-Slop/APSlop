import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runInBackground } from "@/lib/jobs";
import { ModelChoiceSchema, modelOption } from "@/lib/models";
import { emptyProject } from "@/lib/wireframe-store";
import { serialize } from "@/vendor/wireframe/core";

const Body = z.object({ prompt: z.string().min(10).max(8000), model: ModelChoiceSchema.default("claude") });

/** New app, step 1: AI draws the screens in the background; the page /new/design/<id> shows them. */
export const POST = handle(async (req: Request) => {
  const session = await requireSession();
  const { prompt, model } = Body.parse(await readJson(req));
  const design = await prisma.design.create({
    data: { userId: session.user.id, prompt, model: modelOption(model).model, status: "DRAWING", project: serialize(emptyProject("app")) },
  });
  await runInBackground({ kind: "draw", id: design.id, model });
  return NextResponse.json({ id: design.id });
});
