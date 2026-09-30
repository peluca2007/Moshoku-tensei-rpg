import type { Metadata } from "next";
import Shop from "@/components/Shop";

export const metadata: Metadata = {
  title: "Loja da Guilda",
  description: "Armas, armaduras, poções e equipamento de aventura, com preço e Rank da Guilda.",
};

export default function LojaPage() {
  return (
    <div>
      <Shop />
    </div>
  );
}
