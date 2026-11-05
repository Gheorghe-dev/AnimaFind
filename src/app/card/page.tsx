"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CardDetailView } from "@/components/CardDetailView";

function CardContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  return <CardDetailView id={id} />;
}

export default function CardQueryPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center font-bold text-inksoft">Fetching the card…</p>}>
      <CardContent />
    </Suspense>
  );
}
