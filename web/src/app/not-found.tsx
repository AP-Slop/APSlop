import { Container, Empty, LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <Container>
      <Empty>
        <p className="text-lg font-semibold text-fg">Page not found</p>
        <div className="mt-4"><LinkButton href="/">Back to apps</LinkButton></div>
      </Empty>
    </Container>
  );
}
