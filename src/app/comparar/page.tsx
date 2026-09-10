import type { Metadata } from "next";
import ComparadorDeBuilds from "@/components/ComparadorDeBuilds";

export const metadata: Metadata = {
  title: "Comparar builds",
  description:
    "Duas fichas lado a lado contra o mesmo alvo e com a mesma semente: PA gastos, reservas, maior golpe e quanto cada uma aguenta.",
};

/*
 * Fora do menu, de propósito — e desde a 0.1.36 ela deixou de ser exceção.
 *
 * Comparar duas builds é coisa que se faz de vez em quando, no preparo, e não
 * um destino de sessão como a Ficha. Este era o argumento pra ela não estar na
 * barra do topo enquanto Iniciativa e Encontros estavam; agora as três moram no
 * mesmo lugar, os cartões do Painel do Mestre, e a barra ficou com sete links
 * em vez de dez. Ela também continua alcançada pelo roster, que é o outro lugar
 * de onde a pergunta nasce.
 */
export default function CompararPage() {
  return <ComparadorDeBuilds />;
}
