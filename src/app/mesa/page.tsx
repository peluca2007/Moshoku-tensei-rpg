import type { Metadata } from "next";
import ModoMesa from "@/components/ModoMesa";

export const metadata: Metadata = {
  title: "Modo Mesa",
  description:
    "A tela que fica aberta a sessão inteira: de quem é a vez, suas reservas, o que está pegando em você, e o dado.",
};

export default function MesaPage() {
  return <ModoMesa />;
}
