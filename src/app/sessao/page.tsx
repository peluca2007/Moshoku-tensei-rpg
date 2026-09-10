import type { Metadata } from "next";
import RegistroDeSessao from "@/components/RegistroDeSessao";

export const metadata: Metadata = {
  title: "Registro de sessão",
  description:
    "O site contando o que a mesa mostrou: rolagens assinadas por quem estava agindo, críticos e quanto dano cada personagem levou.",
};

/* Fora do menu, como o comparador: é ferramenta de medição, não destino de sessão. */
export default function SessaoPage() {
  return <RegistroDeSessao />;
}
