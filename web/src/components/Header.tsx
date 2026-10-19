import { auth } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { HeaderBar } from "@/components/HeaderBar";

export async function Header() {
  const session = await auth();
  const user = session?.user ? { login: session.user.login, image: session.user.image ?? null } : null;
  return <HeaderBar user={user} siteName={publicEnv.siteName} />;
}
