"use client";

import { useState } from "react";
import { Condicao } from "@/data/condicoes";
import { separarCondicoes } from "@/lib/condicoesNaProsa";

/**
 * O texto de uma habilidade, com as condições que ele cita clicáveis.
 *
 * ## O problema que resolve
 *
 * O glossário do Cap. 4 sempre disse que é "aqui, e só aqui" que cada condição
 * tem a definição completa — e centenas de habilidades a citam pelo nome sem
 * repetir o efeito. Na mesa isso significava: ler a magia, não lembrar o que
 * "Quebrantado" faz, sair da magia, procurar o capítulo 4, voltar. No meio do
 * turno, com o grupo esperando.
 *
 * ## Por que abre embaixo, e não num balão
 *
 * Um `title` nativo não existe no toque, que é onde metade da mesa lê o site
 * (a regra do projeto é mobile-first). Um balão flutuante posicionado à mão
 * teria que fugir das bordas em 320px e resolver o que fazer quando dois
 * abrissem juntos. Abrir um bloco logo abaixo do parágrafo empurra o texto,
 * funciona igual no dedo e no mouse, e não precisa saber onde é a borda da tela.
 */
export default function ProsaComCondicoes({ texto, className }: { texto: string; className?: string }) {
  const [aberta, setAberta] = useState<Condicao | null>(null);
  const pedacos = separarCondicoes(texto);

  return (
    <>
      <span className={className}>
        {pedacos.map((p, i) =>
          "condicao" in p ? (
            <button
              key={i}
              type="button"
              onClick={() => setAberta((atual) => (atual?.id === p.condicao.id ? null : p.condicao))}
              aria-expanded={aberta?.id === p.condicao.id}
              title={`O que faz: ${p.condicao.nome}`}
              className="rounded border-b border-dotted border-wine-500/60 font-semibold text-wine-700 underline-offset-2 hover:bg-wine-500/10 dark:border-wine-400/60 dark:text-wine-300"
            >
              {p.texto}
            </button>
          ) : (
            <span key={i}>{p.texto}</span>
          )
        )}
      </span>

      {aberta && (
        <span className="mt-1.5 block rounded-lg border border-wine-300 bg-wine-50/70 p-2 text-xs leading-relaxed text-wine-900 dark:border-wine-900 dark:bg-wine-950/40 dark:text-wine-100">
          <b className="font-bold">{aberta.nome}: </b>
          {aberta.efeito}
          {aberta.duracaoPadrao && (
            <span className="mt-1 block text-2xs text-wine-800/70 dark:text-wine-200/70">
              Duração padrão: {aberta.duracaoPadrao}. Se a habilidade disser outra coisa, a habilidade vence.
            </span>
          )}
        </span>
      )}
    </>
  );
}
