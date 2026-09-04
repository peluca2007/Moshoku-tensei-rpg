import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import Chapter0 from "@/components/book/Chapter0";
import Chapter1 from "@/components/book/Chapter1";
import Chapter2 from "@/components/book/Chapter2";
import Chapter3 from "@/components/book/Chapter3";
import Chapter4 from "@/components/book/Chapter4";
import Chapter5 from "@/components/book/Chapter5";
import Appendices from "@/components/book/Appendices";
import BookShell from "@/components/book/BookShell";
import type { TocEntry } from "@/components/book/BookToc";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Livro de Regras — Mushoku Tensei RPG",
};

const TOC: TocEntry[] = [
  {
    id: "cap0",
    label: "Comece Aqui",
    children: [
      { id: "cap0-1", label: "1. O que é este jogo" },
      { id: "cap0-2", label: "2. A ficha em seis números" },
      { id: "cap0-3", label: "3. Um turno de combate" },
      { id: "cap0-exemplo", label: "— Uma rodada jogada" },
      { id: "cap0-4", label: "4. Criando um personagem" },
      { id: "cap0-5", label: "5. Onde está cada coisa" },
    ],
  },
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
      { id: "cap3-magia", label: "Árvore da Magia" },
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
      <PageHeader
        icon={BookOpen}
        title="Sistema de RPG Mushoku Tensei"
        faixa="/faixas/livro.jpg"
        faixaPosition="center 65%"
      >
        O Mundo de Seis Faces — livro de regras completo, navegável.
      </PageHeader>

      <BookShell toc={TOC}>
        <Chapter0 />
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
