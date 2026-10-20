"use client";

import { Container, buttonClass } from "@/components/ui";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Container>
      <div className="rounded-md border border-danger/40 bg-diff-del px-4 py-3 text-sm">
        <p className="font-semibold text-danger">Something went wrong</p>
        <p className="mt-1 text-fg">{error.message}</p>
      </div>
      <button onClick={reset} className={`${buttonClass()} mt-4`}>Try again</button>
    </Container>
  );
}
