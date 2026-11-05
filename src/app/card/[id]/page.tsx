import { CardDetailView } from "@/components/CardDetailView";

export function generateStaticParams() {
  return [{ id: "view" }];
}

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CardDetailView id={id} />;
}
