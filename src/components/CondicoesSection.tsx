"use client";

import { useState } from "react";
import { Ban, Minus, Plus, Timer, X, Zap } from "lucide-react";
import { CONDICOES } from "@/data/condicoes";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { getCondicoesAtivas, getEfeitosDeCondicoes } from "@/store/selectors";

/**
 * As condições que estão pegando no personagem AGORA — 0.1.24.
 *
 * ## O que muda em relação a anotar num papel
 *
 * A condição deixa de ser lembrete e passa a mexer na ficha: Quebrantado abaixa
 * a CA e o dano de verdade (é a única do livro que mexe num número), o
 * Deslocamento aparece zerado ou pela metade, e o rolador de dados passa a saber
 * que os seus ataques saem com Desvantagem — sem ninguém precisar lembrar disso
 * no meio do turno.
 *
 * ## O que ela NÃO tenta fazer
 *
 * Contar rodadas. A duração das condições do Cap. 4 é escrita em prosa — "até
 * quebrar o gelo", "enquanto a fonte do medo estiver visível", "até o fim do
 * próximo turno" — e um contador numérico obrigaria a mesa a inventar um número
 * que a regra não pediu, e a mantê-lo atualizado a cada turno pra ele não
 * mentir. O campo de nota livre resolve o mesmo problema sem cobrar isso: quem
 * quiser escreve "CD 12 Força pra sair" ou "até o fim do combate".
 */
export default function CondicoesSection() {
  const character = useActiveCharacter();
  const [escolha, setEscolha] = useState("");
  const ativas = getCondicoesAtivas(character);
  const efeitos = getEfeitosDeCondicoes(character);

  const disponiveis = CONDICOES.filter((c) => !ativas.some((a) => a.condicao.id === c.id));

  function aplicar(id: string) {
    if (!id) return;
    useCharacterStore.getState().aplicarCondicao(id);
    setEscolha("");
  }

  const resumo: string[] = [];
  if (efeitos.desvantagemEmAtaques.length > 0) resumo.push(`Desvantagem em ataques (${efeitos.desvantagemEmAtaques.join(", ")})`);
  if (efeitos.desvantagemEmTestes.length > 0) resumo.push(`Desvantagem em testes (${efeitos.desvantagemEmTestes.join(", ")})`);
  if (efeitos.vantagemParaQuemAtaca.length > 0) resumo.push(`Quem te ataca tem Vantagem (${efeitos.vantagemParaQuemAtaca.join(", ")})`);
  if (efeitos.deslocamento !== "normal") resumo.push(`Deslocamento ${efeitos.deslocamento === "zero" ? "zerado" : "pela metade"}`);
  if (efeitos.semAcoes.length > 0) resumo.push(`Sem Ações nem Reação (${efeitos.semAcoes.join(", ")})`);
  if (efeitos.penalidadeQuebrantado > 0) resumo.push(`−${efeitos.penalidadeQuebrantado} na CA e no dano (Quebrantado)`);

  return (
    <div className="surface rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 text-sm dark:border-parchment-800 dark:bg-parchment-900/60">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
          <Zap className="h-3.5 w-3.5 text-wine-500" /> Condições
        </h2>
        {ativas.length > 0 && (
          <button
            type="button"
            onClick={() => useCharacterStore.getState().limparCondicoes()}
            className="flex min-h-[24px] items-center gap-1 rounded-full px-2 text-2xs font-semibold text-parchment-600 hover:text-wine-600 dark:text-parchment-400 dark:hover:text-wine-300"
          >
            <Ban className="h-3 w-3" aria-hidden /> Fim de combate
          </button>
        )}
      </div>

      {ativas.length === 0 ? (
        <p className="text-xs text-parchment-600 dark:text-parchment-400">
          Nada pegando agora. O que for marcado aqui passa a valer na ficha e no rolador.
        </p>
      ) : (
        <ul className="space-y-2">
          {ativas.map(({ condicao, acumulos, nota }) => (
            <li
              key={condicao.id}
              className="rounded-lg border border-wine-300/70 bg-wine-50/60 p-2 dark:border-wine-900 dark:bg-wine-950/30"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-bold text-wine-800 dark:text-wine-200">{condicao.nome}</span>

                {condicao.mecanica?.acumulavel && (
                  <span className="flex items-center gap-1 rounded-full bg-wine-600/10 px-1.5 py-0.5">
                    <button
                      type="button"
                      onClick={() => useCharacterStore.getState().ajustarAcumulos(condicao.id, -1)}
                      aria-label={`Menos um acúmulo de ${condicao.nome}`}
                      className="flex h-6 w-6 items-center justify-center rounded text-wine-700 hover:bg-wine-500/20 dark:text-wine-300"
                    >
                      <Minus className="h-3 w-3" aria-hidden />
                    </button>
                    <span className="min-w-[2.5rem] text-center text-2xs font-bold tabular-nums text-wine-800 dark:text-wine-200">
                      {acumulos}×
                    </span>
                    <button
                      type="button"
                      onClick={() => useCharacterStore.getState().ajustarAcumulos(condicao.id, 1)}
                      aria-label={`Mais um acúmulo de ${condicao.nome}`}
                      className="flex h-6 w-6 items-center justify-center rounded text-wine-700 hover:bg-wine-500/20 dark:text-wine-300"
                    >
                      <Plus className="h-3 w-3" aria-hidden />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => useCharacterStore.getState().removerCondicao(condicao.id)}
                  aria-label={`Remover ${condicao.nome}`}
                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-parchment-600 hover:bg-wine-500/10 hover:text-wine-700 dark:text-parchment-400 dark:hover:text-wine-300"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>

              <p className="mt-1 text-2xs leading-relaxed text-wine-900/80 dark:text-wine-100/70">{condicao.efeito}</p>

              <label className="mt-1.5 flex items-center gap-1.5">
                <Timer className="h-3 w-3 shrink-0 text-parchment-500" aria-hidden />
                <span className="sr-only">Nota de duração de {condicao.nome}</span>
                <input
                  type="text"
                  value={nota ?? ""}
                  onChange={(e) => useCharacterStore.getState().anotarCondicao(condicao.id, e.target.value)}
                  placeholder={condicao.duracaoPadrao ?? "Até quando? quem aplicou? CD pra sair?"}
                  className="min-h-[24px] w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-2xs text-parchment-700 placeholder:text-parchment-500 hover:border-parchment-300 focus:border-parchment-400 dark:text-parchment-200 dark:placeholder:text-parchment-500 dark:hover:border-parchment-700"
                />
              </label>
            </li>
          ))}
        </ul>
      )}

      {resumo.length > 0 && (
        <p className="mt-2 rounded-lg bg-parchment-200/60 p-2 text-2xs leading-relaxed text-parchment-700 dark:bg-parchment-950/50 dark:text-parchment-300">
          <b>Valendo agora: </b>
          {resumo.join(" · ")}
          {efeitos.danoPorTurno.length > 0 && (
            <>
              {" · "}
              {efeitos.danoPorTurno.map((d) => `${d.formula} no início do seu turno (${d.nome})`).join(" · ")}
            </>
          )}
        </p>
      )}

      {disponiveis.length > 0 && (
        <label className="mt-2 block">
          <span className="sr-only">Aplicar uma condição</span>
          <select
            value={escolha}
            onChange={(e) => aplicar(e.target.value)}
            className="min-h-[2rem] w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 text-xs text-parchment-800 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-100"
          >
            <option value="">Aplicar condição…</option>
            {disponiveis.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
