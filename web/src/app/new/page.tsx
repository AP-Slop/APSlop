import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { modelOptions, preferredModel } from "@/lib/models";
import { Container } from "@/components/ui";
import { NewAppWizard } from "@/components/NewAppWizard";
import { SignInRequired } from "@/components/SignInRequired";

export const dynamic = "force-dynamic";

export default async function NewPage() {
  const session = await auth();
  if (!session) {
    return (
      <Container>
        <SignInRequired returnTo="/new" />
      </Container>
    );
  }
  const last = await prisma.generation.findFirst({
    where: { userId: session.user.id, status: { not: "FAILED" } },
    orderBy: { createdAt: "desc" },
    select: { model: true },
  });
  const models = modelOptions().map(({ id, label, available }) => ({ id, label, available }));
  return (
    <Container className="max-w-3xl">
      <h1 className="text-2xl font-semibold">AI でアプリを作る</h1>
      <p className="text-fg-muted mt-1 text-sm">
        作りたい Android アプリを日本語で説明してください。AI が Kotlin + Jetpack Compose のコードを書き、
        あなたのリポジトリとして GitHub に置きます。
      </p>
      <NewAppWizard models={models} initialModel={preferredModel(last?.model)} />
    </Container>
  );
}
