import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Container } from "@/components/ui";
import { NewAppWizard } from "@/components/NewAppWizard";

export const dynamic = "force-dynamic";

export default async function NewPage() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin?callbackUrl=/new");
  return (
    <Container className="max-w-3xl">
      <h1 className="text-2xl font-semibold">AI でアプリを作る</h1>
      <p className="text-fg-muted mt-1 text-sm">
        作りたい Android アプリを日本語で説明してください。AI が Kotlin + Jetpack Compose のコードを書き、
        あなたのリポジトリとして GitHub に置きます。
      </p>
      <NewAppWizard />
    </Container>
  );
}
