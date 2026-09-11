"use client";

import { Container, ErrorBox, buttonClass } from "@/components/ui";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Container>
      <ErrorBox>{error.message}</ErrorBox>
      <button onClick={reset} className={`${buttonClass()} mt-4`}>再試行</button>
    </Container>
  );
}
