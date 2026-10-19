import { buttonClass, Card } from "@/components/ui";
import { SignInButton } from "@/components/SignInButton";

/** Shown instead of a page (or a form) that needs a GitHub sign-in. */
export function SignInRequired({ returnTo, compact = false }: { returnTo: string; compact?: boolean }) {
  if (compact) {
    return (
      <Card className="p-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-fg-muted flex-1">Sign in to continue. Your actions are made as your GitHub account.</span>
        <SignInButton returnTo={returnTo} className={buttonClass("primary")} />
      </Card>
    );
  }
  return (
    <div className="py-16 flex justify-center">
      <Card className="max-w-xl w-full p-8 text-center">
        <h1 className="text-xl font-semibold">Sign in to continue</h1>
        <p className="mt-3 text-sm text-fg-muted">
          APSlop Developers uses your GitHub account. Your commits, pull requests and reviews are made as you.
        </p>
        <div className="mt-6 flex justify-center">
          <SignInButton returnTo={returnTo} className={buttonClass("primary")} />
        </div>
      </Card>
    </div>
  );
}
