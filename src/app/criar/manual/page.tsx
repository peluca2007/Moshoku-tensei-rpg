import type { Metadata } from "next";
import CreationWizard from "@/components/CreationWizard";

export const metadata: Metadata = {
  title: "Criar personagem — manual",
  description: "Escolha raça, antecedente, atributos, árvore inicial e perícias, passo a passo.",
};

export default function CriarManualPage() {
  return (
    <div>
      <CreationWizard />
    </div>
  );
}
