"use client";

import { useMemo } from "react";
import { normalizarAlinhado } from "@/lib/texto";

/**
 * O trecho do resultado com o termo buscado em destaque.
 *
 * Compartilhado entre a página `/busca` e o painel do topo desde 0.1.67: as
 * duas mostram os mesmos resultados, e duas implementações do mesmo destaque
 * divergem na primeira vez que uma delas é ajustada.
 *
 * O casamento é feito sobre o texto NORMALIZADO (sem acento, sem caixa) e as
 * fatias saem do texto ORIGINAL — é o que faz "pocao" achar "Poção" sem imprimir
 * "pocao" de volta na tela.
 */
export default function Realce({ texto, termos }: { texto: string; termos: string[] }) {
  const partes = useMemo(() => {
    if (termos.length === 0) return [texto];
    const norm = normalizarAlinhado(texto);
    const marcas: [number, number][] = [];
    for (const termo of termos) {
      let de = norm.indexOf(termo);
      while (de !== -1) {
        marcas.push([de, de + termo.length]);
        de = norm.indexOf(termo, de + termo.length);
      }
    }
    if (marcas.length === 0) return [texto];
    marcas.sort((a, b) => a[0] - b[0]);

    // Termos que se sobrepõem ("peco" e "peconha" na mesma consulta) viram uma
    // marca só; duas marcas cruzadas cortariam o texto em pedaços fora de ordem.
    const unidas: [number, number][] = [];
    for (const [de, ate] of marcas) {
      const ultima = unidas[unidas.length - 1];
      if (ultima && de <= ultima[1]) ultima[1] = Math.max(ultima[1], ate);
      else unidas.push([de, ate]);
    }

    const saida: (string | { marca: string })[] = [];
    let cursor = 0;
    for (const [de, ate] of unidas) {
      if (de > cursor) saida.push(texto.slice(cursor, de));
      saida.push({ marca: texto.slice(de, ate) });
      cursor = ate;
    }
    if (cursor < texto.length) saida.push(texto.slice(cursor));
    return saida;
  }, [texto, termos]);

  return (
    <>
      {partes.map((p, i) =>
        typeof p === "string" ? (
          p
        ) : (
          <mark
            key={i}
            className="rounded bg-gold-300/60 px-0.5 text-parchment-900 dark:bg-gold-500/30 dark:text-gold-100"
          >
            {p.marca}
          </mark>
        )
      )}
    </>
  );
}
