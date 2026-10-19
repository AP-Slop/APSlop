"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signInWithGitHub, signOutToStore } from "@/lib/auth-actions";
import { isDeveloperPath } from "@/lib/site";

type User = { login: string; image: string | null };

/** Header link; the page you are on is underlined like the repository tabs. */
function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center border-y-4 border-t-transparent whitespace-nowrap ${active ? "border-b-[#fd8c73] text-white font-semibold" : "border-b-transparent text-white/80 hover:text-white"}`}
    >
      {children}
    </Link>
  );
}

/** "Developer Mode" switch: on in the developer pages, off in the store. Pressing it goes to the other mode. */
function ModeSwitch({ developer, href }: { developer: boolean; href: string }) {
  return (
    <Link
      href={href}
      role="switch"
      aria-checked={developer}
      className="flex items-center gap-2 rounded-md px-2 py-1 text-white/90 hover:bg-white/10 whitespace-nowrap"
    >
      Developer Mode
      <span className={`relative inline-block h-5 w-9 rounded-full transition-colors ${developer ? "bg-[#2da44e]" : "bg-white/30"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${developer ? "left-[18px]" : "left-0.5"}`} />
      </span>
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
      <div className="max-w-6xl mx-auto px-4 min-h-14 flex flex-wrap items-stretch gap-x-6 text-sm">
        {developer ? (
          <>
            <Logo href="/dashboard" label={`${siteName} Developers`} />
            <nav className="flex items-stretch gap-4">
              <NavLink href="/dashboard" active={under("/dashboard")}>Dashboard</NavLink>
              <NavLink href="/repos" active={under("/repos")}>Repositories</NavLink>
              <NavLink href="/new" active={under("/new")}>New app</NavLink>
            </nav>
            <div className="ml-auto flex items-center gap-3 py-2">
              <ModeSwitch developer href="/" />
              <Account user={user} />
            </div>
          </>
        ) : (
          <>
            <Logo href="/" label={siteName} />
            <nav className="flex items-stretch gap-4">
              <NavLink href="/" active={pathname === "/" || under("/apps")}>Apps</NavLink>
              <NavLink href="/#install" active={false}>Install on your phone</NavLink>
            </nav>
            <div className="ml-auto flex items-center gap-3 py-2">
              <ModeSwitch developer={false} href={user ? "/dashboard" : "/repos"} />
              <Account user={user} />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
