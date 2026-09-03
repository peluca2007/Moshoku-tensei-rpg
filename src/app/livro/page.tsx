import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import Chapter1 from "@/components/book/Chapter1";
import Chapter2 from "@/components/book/Chapter2";
import Chapter3 from "@/components/book/Chapter3";
import Chapter4 from "@/components/book/Chapter4";
import Chapter5 from "@/components/book/Chapter5";
import Appendices from "@/components/book/Appendices";
import BookShell from "@/components/book/BookShell";
import type { TocEntry } from "@/components/book/BookToc";

export const metadata: Metadata = {
  title: "Livro de Regras — Mushoku Tensei RPG",
};

const TOC: TocEntry[] = [
  {
    id: "cap1",
    label: "Cap. 1 — O Núcleo do Sistema",
    children: [
      { id: "cap1-1", label: "1. Criação e Atributos" },
      { id: "cap1-2", label: "2. Pontos de Aprimoramento" },
      { id: "cap1-3", label: "3. Desbloqueio de Ranks" },
      { id: "cap1-4", label: "4. Testes e Perícias" },
      { id: "cap1-5", label: "5. Raças" },
      { id: "cap1-6", label: "6. Destino e Infância" },
      { id: "cap1-7", label: "7. Valor do Rank e BC" },
      { id: "cap1-8", label: "8. Multiclasse" },
    ],
  },
  {
    id: "cap2",
    label: "Cap. 2 — As Leis da Magia",
    children: [
      { id: "cap2-1", label: "1. Categorias da Magia" },
      { id: "cap2-2", label: "2. Encantamentos" },
      { id: "cap2-2-recitacao", label: "— Recitação Perfeita" },
      { id: "cap2-2-cantico-curto", label: "— Cântico Curto (sem bônus)" },
      { id: "cap2-3", label: "3. Tempo de Conjuração" },
      { id: "cap2-4", label: "4. Combinações entre Árvores" },
      { id: "cap2-5", label: "5. Maestrias" },
      { id: "cap2-6", label: "6. Interromper uma Conjuração" },
      { id: "cap2-7", label: "7. Regras Gerais de Conjuração" },
    ],
  },
  {
    id: "cap3",
    label: "Cap. 3 — Árvores de Progressão",
    children: [
      { id: "cap3-como-ler", label: "Como Ler uma Árvore" },
      { id: "cap3-mecanicas", label: "— As 19 Mecânicas" },
      { id: "cap3-mapa", label: "O Mapa Completo" },
      { id: "cap3-corpo", label: "Árvore do Corpo" },
      { id: "cap3-utilidade", label: "Árvore de Utilidade" },
      { id: "cap3-todas", label: "Todas as Sub-árvores" },
    ],
  },
  {
    id: "cap4",
    label: "Cap. 4 — Combate e Sobrevivência",
    children: [
      { id: "cap4-1", label: "1. Cálculos Vitais" },
      { id: "cap4-condicoes", label: "2. Glossário de Condições" },
      { id: "cap4-3-acoes", label: "3. Economia de Ações" },
      { id: "cap4-reacoes-combate", label: "4. Reações e Ações Defensivas" },
      { id: "cap4-4", label: "5. Empilhamento" },
      { id: "cap4-5", label: "6. Críticos e Touki" },
      { id: "cap4-6", label: "7. Sangrando e Morrendo" },
      { id: "cap4-aflicoes", label: "8. Aflições do Mundo de Seis Faces" },
      { id: "cap4-8", label: "9. Exaustão, Fome, Sede e Clima" },
    ],
  },
  {
    id: "cap5",
    label: "Cap. 5 — Entre Aventuras",
    children: [
      { id: "cap5-1", label: "1. Tempo Livre e Downtime" },
      { id: "cap5-2", label: "2. A Guilda de Aventureiros" },
      { id: "cap5-3", label: "3. Reputação com Facções" },
      { id: "cap5-4", label: "4. Crafting e Alquimia" },
    ],
  },
  {
    id: "apendices",
    label: "Apêndices",
    children: [
      { id: "apendice-a", label: "A. Ficha de Exemplo" },
      { id: "apendice-b", label: "B. Molde p/ Novas Escolas" },
      { id: "apendice-c", label: "C. Dano por Turno" },
      { id: "apendice-d", label: "D. Ambiguidades Resolvidas" },
      { id: "apendice-e", label: "E. Viagem entre Continentes" },
      { id: "apendice-f", label: "F. Cerco e Batalha em Exército" },
      { id: "apendice-g", label: "G. Bestiário" },
    ],
  },
];

export default function LivroPage() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <header className="mb-6 flex flex-col gap-3 rounded-2xl border border-parchment-300 bg-gradient-to-br from-wine-50 via-parchment-50 to-parchment-50 p-6 shadow-sm dark:border-parchment-800 dark:from-parchment-900 dark:via-parchment-950 dark:to-parchment-900 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-parchment-900 dark:text-parchment-50">
            <BookOpen className="h-6 w-6 text-wine-500" /> Sistema de RPG Mushoku Tensei
          </h1>
          <p className="mt-1 text-sm text-parchment-600 dark:text-parchment-400">O Mundo de Seis Faces — livro de regras completo, navegável.</p>
        </div>
      </header>

      <BookShell toc={TOC}>
        <Chapter1 />
        <Chapter2 />
        <Chapter3 />
        <Chapter4 />
        <Chapter5 />
        <Appendices />
      </BookShell>
    </div>
  );
}
