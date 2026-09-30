import type { Metadata } from "next";
import CharacterRoster from "@/components/CharacterRoster";

export const metadata: Metadata = {
  title: "Meus Personagens",
  description: "As fichas salvas neste navegador: abrir, criar, importar e exportar.",
};

export default function PersonagensPage() {
  return (
    <div>
      <CharacterRoster />
    </div>
  );
}
