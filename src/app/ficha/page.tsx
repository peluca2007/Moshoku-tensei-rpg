import type { Metadata } from "next";
import CharacterSheet from "@/components/CharacterSheet";

export const metadata: Metadata = {
  title: "Ficha",
  description: "A ficha do personagem ativo: atributos, árvores, inventário e recursos.",
};

export default function FichaPage() {
  return (
    <div>
      <CharacterSheet />
    </div>
  );
}
