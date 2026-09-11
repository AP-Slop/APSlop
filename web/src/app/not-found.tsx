import { Container, Empty, LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <Container>
      <Empty>
        <p className="text-lg">ページが見つかりません</p>
        <div className="mt-4"><LinkButton href="/">トップへ戻る</LinkButton></div>
      </Empty>
    </Container>
  );
}
