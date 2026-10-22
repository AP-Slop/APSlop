import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseFiles } from "@/lib/wireframe-store";
import { Container } from "@/components/ui";
import { SignInRequired } from "@/components/SignInRequired";
import { DesignReview } from "@/components/DesignReview";

export const dynamic = "force-dynamic";

/** New app, step 2: the screens AI drew, to fix (in the editor) or confirm; then the code is generated. */
export default async function DesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    return (
      <Container>
        <SignInRequired returnTo={`/new/design/${id}`} />
      </Container>
    );
  }
  const design = await prisma.design.findFirst({ where: { id, userId: session.user.id } });
  if (!design) notFound();
  const files = parseFiles(design);
  const order = files.project.screens ?? Object.keys(files.screens);
  return (
    <Container>
      <DesignReview
        design={{
          id: design.id,
          status: design.status,
          error: design.error,
          plan: design.plan,
          prompt: design.prompt,
          theme: files.project.theme,
          device: typeof files.project.device === "string" ? files.project.device : "phone",
          screens: order.map((sid) => files.screens[sid]).filter((s) => !!s),
        }}
      />
    </Container>
  );
}
