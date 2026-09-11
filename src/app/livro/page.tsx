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
import { SUMARIO_DO_LIVRO } from "@/data/sumarioDoLivro";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Livro de Regras — Mushoku Tensei RPG",
};

const TOC = SUMARIO_DO_LIVRO;

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
