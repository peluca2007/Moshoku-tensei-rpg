import type { Metadata } from "next";
import PainelDoMestre from "@/components/PainelDoMestre";

export const metadata: Metadata = {
  title: "Painel do Mestre",
  description:
    "As fichas do grupo lado a lado: quem está machucado, quem ainda tem recurso, o que está pegando em cada um, e o que cada um tira num acerto.",
};

export default function MestrePage() {
  return <PainelDoMestre />;
}
