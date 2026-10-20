import { signInWithGitHub } from "@/lib/auth-actions";

/** "Sign in with GitHub" that comes back to `returnTo` afterwards. */
export function SignInButton({ returnTo, className }: { returnTo: string; className: string }) {
  return (
    <form action={signInWithGitHub}>
      <input type="hidden" name="redirectTo" value={returnTo} />
      <button className={className}>Sign in with GitHub</button>
    </form>
  );
}
