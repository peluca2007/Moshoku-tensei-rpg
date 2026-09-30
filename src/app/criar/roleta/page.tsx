import type { Metadata } from "next";
import CreationRoulette from "@/components/CreationRoulette";

export const metadata: Metadata = {
  title: "Roleta do Destino",
  description: "Escolha a Árvore Inicial e as Perícias; o resto é sorteado.",
};

export default function CriarRoletaPage() {
  return (
    <div>
      <CreationRoulette />
    </div>
  );
}
