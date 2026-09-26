"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FormulaWorkshop from "./FormulaWorkshop";
import { FONTES_DO_LIVRO } from "./folhear/fontes";

/**
 * A Oficina de Fórmulas da Magia Teórica, no livro e no site (2026-09-25).
 *
 * No modo contínuo (e no /livro) a oficina fica no meio do texto, como sempre.
 * No livro folheado ela não cabe: é uma ferramenta de tela inteira, e numa
 * coluna de 335 px virava uma torre de 1.800 px cortada no pé da página.
 * Então lá a página mostra uma CHAMADA, e o laboratório abre por cima do
 * livro, num painel do tamanho da tela — como a mídia rica abre num leitor
 * de livro digital. Qual das duas aparece é decidido no CSS (folhear.css),
 * pelo modo do livro.
 *
 * O painel mora num portal, fora do livro: assim a roda, o arrasto e os
 * cliques que viram a folha não o alcançam.
 */
export default function LaboratorioDeFormulas() {
  const [aberto, setAberto] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);

  // O evento nativo de fechar (Esc, o botão, o clique no fundo) desmonta o
  // painel; o `onClose` do React não chegava a disparar num <dialog> em portal.
  useEffect(() => {
    const d = dialogo.current;
    if (!aberto || !d) return;
    const fechar = () => setAberto(false);
    d.addEventListener("close", fechar);
    if (!d.open) d.showModal();
    return () => d.removeEventListener("close", fechar);
  }, [aberto]);

  return (
    <>
      <div className="livro-laboratorio-inline">
        <FormulaWorkshop />
      </div>

      <div className="livro-laboratorio-chamada hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- o glifo da árvore, pequeno. */}
        <img src="/arvores/teorica.svg" alt="" className="livro-laboratorio-glifo" />
        <p className="livro-laboratorio-selo">Laboratório de Fórmulas</p>
        <p className="livro-laboratorio-texto">
          Monte uma frase de símbolos — essência, ações e forma — e veja o custo em PM, o alcance e o efeito
          calculados na hora, com os limites de cada rank.
        </p>
        <button type="button" className="livro-laboratorio-abrir" onClick={() => setAberto(true)}>
          Abrir o laboratório
        </button>
      </div>

      {aberto &&
        createPortal(
          <dialog
            ref={dialogo}
            aria-label="Laboratório de Fórmulas"
            className={`livro-laboratorio-dialogo ${FONTES_DO_LIVRO} m-auto max-h-[94vh] w-[min(1120px,95vw)] overflow-auto bg-transparent p-0 backdrop:bg-black/80`}
            // Clicar fora do laboratório (no fundo escuro) fecha.
            onClick={(e) => {
              if (e.target === e.currentTarget) dialogo.current?.close();
            }}
          >
            <div className="relative">
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => dialogo.current?.close()}
                  className="livro-laboratorio-fechar border-2 border-[#78d5d0] bg-[#141418] px-3 py-1 text-white hover:bg-[#78d5d0] hover:text-[#141418]"
                >
                  Fechar
                </button>
              </div>
              <FormulaWorkshop />
            </div>
          </dialog>,
          document.body
        )}
    </>
  );
}
