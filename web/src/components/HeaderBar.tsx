"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signInWithGitHub, signOutToStore } from "@/lib/auth-actions";
import { isDeveloperPath } from "@/lib/site";

type User = { login: string; image: string | null };

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={active ? "text-white font-semibold" : "text-white/80 hover:text-white"}>
      {children}
    </Link>
  );
}

function Logo({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="font-semibold text-base flex items-center gap-2 whitespace-nowrap">
      <span className="inline-block w-6 h-6 rounded-full bg-white text-[#24292f] text-center leading-6 font-bold text-xs">AP</span>
      {label}
    </Link>
  );
}

function Account({ user }: { user: User | null }) {
  if (!user) {
    return (
      <form action={signInWithGitHub}>
        <button className="rounded-md border border-white/40 px-3 py-1 hover:bg-white/10 whitespace-nowrap">Sign in with GitHub</button>
      </form>
    );
  }
  return (
    <>
      {user.image && (
        <Image src={user.image} alt="" width={28} height={28} className="rounded-full border border-white/20" />
      )}
      <span className="text-white/80">{user.login}</span>
      <form action={signOutToStore}>
        <button className="text-white/70 hover:text-white whitespace-nowrap">Sign out</button>
      </form>
    </>
  );
}

export function HeaderBar({ user, siteName }: { user: User | null; siteName: string }) {
  const pathname = usePathname();
  const developer = isDeveloperPath(pathname);
  const under = (p: string) => pathname === p || pathname.startsWith(`${p}/`);

  return (
    <header className="bg-[#24292f] text-white">
      <div className="max-w-6xl mx-auto px-4 min-h-14 py-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {developer ? (
          <>
            <Logo href="/dashboard" label={`${siteName} Developers`} />
            <nav className="flex items-center gap-4">
              <NavLink href="/dashboard" active={under("/dashboard")}>Dashboard</NavLink>
              <NavLink href="/repos" active={under("/repos")}>Repositories</NavLink>
              <NavLink href="/new" active={under("/new")}>New app</NavLink>
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <Link href="/" className="text-white/80 hover:text-white whitespace-nowrap">← Store</Link>
              <Account user={user} />
            </div>
          </>
        ) : (
          <>
            <Logo href="/" label={siteName} />
            <nav className="flex items-center gap-4">
              <NavLink href="/" active={pathname === "/" || under("/apps")}>Apps</NavLink>
              <NavLink href="/#install" active={false}>Install on your phone</NavLink>
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <Link href={user ? "/dashboard" : "/repos"} className="text-white/80 hover:text-white whitespace-nowrap">
                For developers →
              </Link>
              <Account user={user} />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
