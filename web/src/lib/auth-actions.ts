"use server";

import { signIn, signOut } from "@/lib/auth";

export async function signInWithGitHub() {
  await signIn("github");
}

export async function signOutToStore() {
  await signOut({ redirectTo: "/" });
}
