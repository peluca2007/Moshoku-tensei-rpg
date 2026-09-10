"use client";

import { useEffect, useState } from "react";
import { QrCode, X } from "lucide-react";
import { caminhoDoQr, gerarQr, LIMITE_QR, MARGEM_QR, ResultadoQr } from "@/lib/qr";

/**
 * O QR de um link — 0.1.33.
 *
 * ## Por que são DOIS componentes, e não um
 *
 * A primeira versão era um só: botão fechado, painel aberto, no mesmo lugar.
 * Isso quebrou a fileira de botões da ficha de duas maneiras diferentes, as
 * duas visíveis em print — o painel tem largura total, e dentro de um
 * `flex-wrap` com `shrink-0` ele ora empurrava metade dos botões pra linha
 * seguinte, ora estourava a linha inteira pra fora da tela.
 *
 * A separação é a correção estrutural: o BOTÃO vive na fileira, onde é um
 * controle do tamanho dos outros; o PAINEL vive abaixo dela, onde um bloco
 * largo é só um bloco largo. Quem usa segura o estado — três linhas a mais no
 * chamador, e nenhuma surpresa de layout.
 */

export function BotaoQr({
  aberto,
  aoAlternar,
  className = "",
}: {
  aberto: boolean;
  aoAlternar: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={aoAlternar}
      aria-expanded={aberto}
      title="Mostrar um QR pra outro celular apontar a câmera"
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
        aberto
          ? "border-wine-500 bg-wine-600 text-parchment-50"
          : "border-parchment-300 text-parchment-600 hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
      } ${className}`}
    >
      <QrCode className="h-3.5 w-3.5" /> QR
    </button>
  );
}

/**
 * O código desenhado.
 *
 * Monta a matriz só quando aparece: um QR de 165 módulos é trabalho real, e
 * ninguém deveria pagá-lo por abrir a ficha. O SVG é desenhado em unidades de
 * MÓDULO, então o tamanho na tela é decisão de CSS e o código continua nítido em
 * qualquer aparelho — o oposto do que um canvas rasterizado faria.
 */
export function PainelQr({
  gerarLink,
  titulo,
  aoFechar,
}: {
  /** Só é chamado quando o painel aparece — o link é caro de montar (gzip + base64). */
  gerarLink: () => Promise<string>;
  titulo: string;
  aoFechar: () => void;
}) {
  const [resultado, setResultado] = useState<ResultadoQr | null>(null);

  useEffect(() => {
    let vivo = true;
    gerarLink().then((url) => {
      if (vivo) setResultado(gerarQr(url));
    });
    return () => {
      vivo = false;
    };
    // `gerarLink` é recriado a cada render de quem chama; depender dele
    // remontaria o QR sem parar. O painel monta uma vez e pronto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-2 rounded-xl border border-parchment-300 bg-parchment-50/80 p-3 dark:border-parchment-700 dark:bg-parchment-950/50">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
          {titulo}
        </p>
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar o QR"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-parchment-600 hover:text-wine-600 dark:text-parchment-400"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {!resultado ? (
        <p className="text-xs text-parchment-600 dark:text-parchment-400">Montando o código…</p>
      ) : !resultado.ok ? (
        <p className="text-xs leading-relaxed text-parchment-700 dark:text-parchment-300">
          Esta ficha não cabe num QR: são <b>{resultado.caracteres.toLocaleString("pt-BR")} caracteres</b> e o
          máximo que um QR aguenta é {LIMITE_QR.toLocaleString("pt-BR")}. Use <b>Compartilhar</b> ou{" "}
          <b>Copiar link</b> — ou mande o arquivo da ficha, que não tem teto.
        </p>
      ) : (
        <>
          {/*
            Fundo BRANCO fixo, e não a cor do tema.
            A leitura depende do contraste entre módulo e fundo, e um QR escuro
            sobre pergaminho escuro é um QR que a câmera não enxerga. Esta é a
            única superfície do site que ignora o tema de propósito.
          */}
          <div className="mx-auto w-full max-w-[18rem] rounded-lg bg-white p-2">
            <svg
              viewBox={`0 0 ${resultado.qr.tamanho + MARGEM_QR * 2} ${resultado.qr.tamanho + MARGEM_QR * 2}`}
              className="block h-auto w-full"
              role="img"
              aria-label={`QR com ${titulo.toLowerCase()}`}
              shapeRendering="crispEdges"
            >
              <path d={caminhoDoQr(resultado.qr)} fill="#000000" />
            </svg>
          </div>

          <p className="mt-2 text-2xs leading-relaxed text-parchment-600 dark:text-parchment-400">
            {resultado.qr.denso ? (
              <>
                <b>Código denso</b> ({resultado.qr.tamanho}×{resultado.qr.tamanho} módulos): pode exigir a
                câmera perto e a tela no brilho máximo. Se não ler em alguns segundos, o link é mais
                garantido.
              </>
            ) : (
              <>Aponte a câmera do outro celular. Ele abre a tela de importar, que ainda pede confirmação.</>
            )}
          </p>
        </>
      )}
    </div>
  );
}
