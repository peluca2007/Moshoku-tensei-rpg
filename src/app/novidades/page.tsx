import type { Metadata } from "next";
import NotasDeVersao from "@/components/notas/NotasDeVersao";

export const metadata: Metadata = {
  title: "Notas de versão",
};

/**
 * O histórico inteiro de mudanças (0.1.99), por fase e por área (0.1.131).
 * A capa mostra só a versão atual e uma lista curta das anteriores.
 */
export default function NovidadesPage() {
  return <NotasDeVersao />;
}
