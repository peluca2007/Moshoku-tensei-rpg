import type { Metadata } from "next";
import PatchNotes from "@/components/PatchNotes";

export const metadata: Metadata = {
  title: "Notas de versão",
};

/**
 * O histórico inteiro de mudanças de regra (0.1.99). Morava na capa, e a capa
 * carregava ~300 KB de texto que quase ninguém abre; lá ficaram a versão atual
 * e as cinco anteriores, com o link pra cá.
 */
export default function NovidadesPage() {
  return (
    <div className="pt-8">
      <PatchNotes />
    </div>
  );
}
