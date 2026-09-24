import type { Metadata } from "next";
import Chapter0 from "@/components/book/Chapter0";
import Chapter1 from "@/components/book/Chapter1";
import Chapter2 from "@/components/book/Chapter2";
import Chapter3 from "@/components/book/Chapter3";
import Chapter4 from "@/components/book/Chapter4";
import Chapter5 from "@/components/book/Chapter5";
import Appendices from "@/components/book/Appendices";
import Folhear from "@/components/book/folhear/Folhear";
import { SUMARIO_DO_LIVRO } from "@/data/sumarioDoLivro";

export const metadata: Metadata = {
  title: "Folhear o Livro — Mushoku Tensei RPG",
};

/**
 * O protótipo do livro em duas páginas (Etapa A do plano do livro digital).
 *
 * Mostra o Capítulo 4 — o que tem mais tabela, caixa de regra e diagrama por
 * página, ou seja, o que mais pode quebrar. `?tudo` carrega o livro inteiro,
 * pra medir o custo de diagramar ~87 mil pixels de texto em colunas. O `/livro`
 * de sempre não muda até o protótipo ser aprovado.
 */
export default async function FolhearPage(props: PageProps<"/livro/folhear">) {
  const { tudo } = await props.searchParams;
  const inteiro = tudo !== undefined;
  const toc = inteiro ? SUMARIO_DO_LIVRO : SUMARIO_DO_LIVRO.filter((c) => c.id === "cap4");

  return (
    <>
      {/* Sem JavaScript, o palco não pode ficar escondido esperando a
          diagramação: vira leitura contínua e pronto. */}
      <noscript>
        <style>{`.folhear .folhear-palco{visibility:visible!important}`}</style>
      </noscript>
      <Folhear toc={toc}>
        {inteiro ? (
          <>
            <Chapter0 />
            <Chapter1 />
            <Chapter2 />
            <Chapter3 />
            <Chapter4 />
            <Chapter5 />
            <Appendices />
          </>
        ) : (
          <Chapter4 />
        )}
      </Folhear>
    </>
  );
}
