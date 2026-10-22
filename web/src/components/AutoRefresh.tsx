"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const EVERY_MS = 15_000;

/** Re-renders the page's server data every 15 s while something shown on it is still running (a CI build). */
export function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), EVERY_MS);
    return () => clearInterval(t);
  }, [router]);
  return null;
}
