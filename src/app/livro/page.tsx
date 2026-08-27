import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import Chapter1 from "@/components/book/Chapter1";
import Chapter2 from "@/components/book/Chapter2";
import Chapter3 from "@/components/book/Chapter3";
import Chapter4 from "@/components/book/Chapter4";
import Appendices from "@/components/book/Appendices";

export const metadata: Metadata = {
  title: "Livro de Regras — Mushoku Tensei RPG",
};

interface TocEntry {
  id: string;
  label: string;
  children?: TocEntry[];
}

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
      { id: "cap2-3", label: "3. Tempo de Conjuração" },
      { id: "cap2-4", label: "4. Magia Combinada" },
      { id: "cap2-5", label: "5. Maestrias" },
    ],
  },
  {
    id: "cap3",
    label: "Cap. 3 — Árvores de Progressão",
    children: [
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
      { id: "cap4-2", label: "2. Economia de Ações" },
      { id: "cap4-3", label: "3. Empilhamento" },
      { id: "cap4-4", label: "4. Críticos e Touki" },
      { id: "cap4-5", label: "5. Sangrando e Morrendo" },
    ],
  },
  {
    id: "apendices",
    label: "Apêndices",
    children: [
      { id: "apendice-a", label: "A. Ficha de Exemplo" },
      { id: "apendice-b", label: "B. Molde p/ Novas Escolas" },
      { id: "apendice-c", label: "C. Dano por Turno" },
      { id: "apendice-d", label: "D. Aflições" },
      { id: "apendice-e", label: "E. Ambiguidades Resolvidas" },
    ],
  },
];

function TocNav() {
  return (
    <nav className="space-y-3 text-sm">
      {TOC.map((chapter) => (
        <div key={chapter.id}>
          <a
            href={`#${chapter.id}`}
            className="font-semibold text-parchment-800 hover:text-wine-600 dark:text-parchment-200 dark:hover:text-wine-400"
          >
            {chapter.label}
          </a>
          {chapter.children && (
            <ul className="mt-1 space-y-0.5 border-l border-parchment-300 pl-3 dark:border-parchment-800">
              {chapter.children.map((c) => (
                <li key={c.id}>
                  <a
                    href={`#${c.id}`}
                    className="block py-0.5 text-parchment-500 hover:text-wine-600 dark:text-parchment-400 dark:hover:text-wine-400"
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
}

export default function LivroPage() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <header className="mb-6 rounded-2xl border border-parchment-300 bg-gradient-to-br from-wine-50 via-parchment-50 to-parchment-50 p-6 shadow-sm dark:border-parchment-800 dark:from-parchment-900 dark:via-parchment-950 dark:to-parchment-900">
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-parchment-900 dark:text-parchment-50">
          <BookOpen className="h-6 w-6 text-wine-500" /> Sistema de RPG Mushoku Tensei
        </h1>
        <p className="mt-1 text-sm text-parchment-500 dark:text-parchment-400">O Mundo de Seis Faces — livro de regras completo, navegável.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-parchment-500 dark:text-parchment-400">
              Sumário
            </p>
            <TocNav />
          </div>
        </aside>

        <details className="rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60 lg:hidden">
          <summary className="cursor-pointer text-sm font-semibold text-parchment-800 dark:text-parchment-200">Sumário</summary>
          <div className="mt-3">
            <TocNav />
          </div>
        </details>

        <main className="min-w-0 space-y-14 rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm sm:p-6 dark:border-parchment-800 dark:bg-parchment-900/60">
          <Chapter1 />
          <Chapter2 />
          <Chapter3 />
          <Chapter4 />
          <Appendices />
        </main>
      </div>
    </div>
  );
}
