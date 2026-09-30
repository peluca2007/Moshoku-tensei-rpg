import type { Metadata } from "next";
import { Suspense } from "react";
import TreeBrowser from "@/components/tree/TreeBrowser";

export const metadata: Metadata = {
  title: "Árvores de Progressão",
  description: "O mapa das árvores de Magia, Corpo e Utilidade: patamares, habilidades e o que cada compra abre.",
};

export default function ArvoresPage() {
  return (
    <div>
      <Suspense fallback={null}>
        <TreeBrowser />
      </Suspense>
    </div>
  );
}
