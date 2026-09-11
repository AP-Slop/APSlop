import Link from "next/link";
import Image from "next/image";
import { auth, signIn, signOut } from "@/lib/auth";
import { publicEnv } from "@/lib/env";

export async function Header() {
  const session = await auth();
  return (
    <header className="bg-[#24292f] text-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="font-semibold text-base flex items-center gap-2">
          <span className="inline-block w-6 h-6 rounded-full bg-white text-[#24292f] text-center leading-6 font-bold text-xs">
            AP
          </span>
          {publicEnv.siteName}
        </Link>
        <nav className="flex items-center gap-4 text-sm text-white/80">
          <Link href="/" className="hover:text-white">アプリ</Link>
          <Link href="/repos" className="hover:text-white">リポジトリ</Link>
          <Link href="/new" className="hover:text-white">AI で作る</Link>
          {session && <Link href="/dashboard" className="hover:text-white">ダッシュボード</Link>}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {session?.user ? (
            <>
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.login}
                  width={28}
                  height={28}
                  className="rounded-full border border-white/20"
                />
              )}
              <span className="text-white/80">{session.user.login}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="text-white/70 hover:text-white">ログアウト</button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <button className="rounded-md border border-white/40 px-3 py-1 hover:bg-white/10">
                GitHub でログイン
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
