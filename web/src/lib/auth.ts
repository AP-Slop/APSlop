import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/db";
import { ensureOrgMember } from "@/lib/github";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      login: string;
      githubId: number;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    login?: string;
    githubId?: number;
    userId?: string;
  }
}

type GitHubProfile = {
  id: number;
  login: string;
  name?: string | null;
  avatar_url?: string;
  email?: string | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: { params: { scope: "read:user user:email repo" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) token.accessToken = account.access_token;
      if (profile) {
        const gh = profile as unknown as GitHubProfile;
        token.login = gh.login;
        token.githubId = gh.id;
        const user = await prisma.user.upsert({
          where: { githubId: gh.id },
          update: {
            login: gh.login,
            name: gh.name ?? null,
            avatarUrl: gh.avatar_url ?? null,
            email: gh.email ?? null,
          },
          create: {
            githubId: gh.id,
            login: gh.login,
            name: gh.name ?? null,
            avatarUrl: gh.avatar_url ?? null,
            email: gh.email ?? null,
          },
        });
        token.userId = user.id;
        await ensureOrgMember(gh.login);
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.userId ?? "";
      session.user.login = token.login ?? "";
      session.user.githubId = token.githubId ?? 0;
      return session;
    },
  },
});

/** Returns the session or throws a 401-style error. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id || !session.accessToken) {
    throw new UnauthorizedError();
  }
  return session as typeof session & { accessToken: string };
}

export class UnauthorizedError extends Error {
  constructor() {
    super("ログインが必要です");
    this.name = "UnauthorizedError";
  }
}
