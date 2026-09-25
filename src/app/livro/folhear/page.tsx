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
import { PATCH_NOTES } from "@/data/patchNotes";

export const metadata: Metadata = {
  title: "Folhear o Livro — Mushoku Tensei RPG",
};

/** As identidades visuais em avaliação (ver PLANO-LIVRO-DIGITAL.md). */
const IDENTIDADES = ["classica", "ranoa"] as const;

/**
 * O livro inteiro, aberto como livro impresso (ver Folhear.tsx).
 *
 * Os capítulos são os mesmos do /livro — renderizados aqui no servidor e
 * entregues ao leitor como `children` —, então o que a mesa lê no modo Livro
 * e no contínuo é sempre o mesmo texto. O /livro de sempre continua no ar até
 * este ser aprovado.
 *
 * `?identidade=ranoa` mostra a identidade própria em avaliação.
 */
export default async function FolhearPage(props: PageProps<"/livro/folhear">) {
  const { identidade } = await props.searchParams;
  const escolhida = IDENTIDADES.find((i) => i === identidade) ?? "classica";
  return (
    <>
      {/* Sem JavaScript, o palco não pode ficar escondido esperando a
          diagramação: vira leitura contínua e pronto. */}
      <noscript>
        <style>{`.folhear .folhear-palco{visibility:visible!important}`}</style>
      </noscript>
      <Folhear toc={SUMARIO_DO_LIVRO} edicao={PATCH_NOTES[0]?.version} identidade={escolhida}>
        <Chapter0 />
        <Chapter1 />
        <Chapter2 />
        <Chapter3 />
        <Chapter4 />
        <Chapter5 />
        <Appendices />
      </Folhear>
    </>
  );
}
