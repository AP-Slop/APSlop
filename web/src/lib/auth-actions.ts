"use server";

import { signIn, signOut } from "@/lib/auth";
import { safeReturnPath } from "@/lib/site";

/** Sign in with GitHub and come back to the page the form was on (`redirectTo`, a same-site path). */
export async function signInWithGitHub(form: FormData) {
  await signIn("github", { redirectTo: safeReturnPath(form.get("redirectTo")) });
}

export async function signOutToStore() {
  await signOut({ redirectTo: "/" });
}
