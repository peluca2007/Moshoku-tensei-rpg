import type { Metadata } from "next";
import ComparadorDeBuilds from "@/components/ComparadorDeBuilds";

export const metadata: Metadata = {
  title: "Comparar builds",
  description:
    "Duas fichas lado a lado contra o mesmo alvo e com a mesma semente: PA gastos, reservas, maior golpe e quanto cada uma aguenta.",
};

/*
 * Fora do menu, de propósito.
 *
 * Comparar duas builds é coisa que se faz de vez em quando, no preparo — não é
 * um destino de sessão como Ficha ou Mesa. A barra do topo já carrega nove
 * links, e cada um a mais empurra os outros pra fora da tela no celular. Ela é
 * alcançada pelo roster e pelo Painel do Mestre, que são os dois lugares de onde
 * a pergunta nasce.
 */
export default function CompararPage() {
  return <ComparadorDeBuilds />;
}
