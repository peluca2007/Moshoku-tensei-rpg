"use client";

import { useMemo, useState } from "react";
import { Skull, Swords } from "lucide-react";
import { CRIATURAS_PRONTAS, rotuloPatamar } from "@/data/bestiary";
import { useActiveCharacter } from "@/store/useCharacterStore";
import { useBestiaryStore } from "@/store/useBestiaryStore";
import { criaturaDoMolde, CriaturaEncontro, simularEncontro } from "@/lib/encounterSim";

/**
 * "Eu aguento isso?" — o simulador do lado do jogador (0.1.26).
 *
 * ## Por que ele existe, tendo o de `/encontros`
 *
 * O motor é o mesmo (`simularEncontro`), mas a pergunta não é. O Mestre pergunta
 * "este encontro mata a mesa?" e monta a criatura; o jogador pergunta "quantos
 * turnos eu aguento contra um Sapo-Lodo? e contra três?" — e não quer montar
 * nada, quer escolher um bicho e ver o número.
 *
 * É a ferramenta que faz alguém ENTENDER a própria build em vez de só montá-la,
 * e ela não inventa nenhum número novo: sai do mesmo motor que já trava o
 * Apêndice C nos testes.
 *
 * ## A honestidade do resultado
 *
 * A simulação é o personagem SOZINHO. Isso é de propósito e está escrito na
 * tela: a pergunta é sobre a build, não sobre o grupo, e um resultado que
 * incluísse aliados imaginários responderia outra coisa. Quem quiser a conta do
 * grupo já tem `/encontros`, que simula contra as fichas de verdade.
 *
 * A semente é FIXA. Duas execuções seguidas com a mesma escolha dão o mesmo
 * número, e é isso que permite comparar duas builds — um resultado que dança a
 * cada clique não serve pra decidir nada.
 */
const BATALHAS = 300;
const SEMENTE = 20260910;

export default function SimuladorPessoal() {
  const character = useActiveCharacter();
  const salvas = useBestiaryStore((s) => s.criaturas);
  const [escolhida, setEscolhida] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  /** As seis do Apêndice G, montadas em memória — sem tocar no bestiário do Mestre. */
  const prontas: CriaturaEncontro[] = useMemo(
    () =>
      CRIATURAS_PRONTAS.map((p) => ({
        ...criaturaDoMolde(p.patamar, p.papel, p.nome, `sim_${p.id}`),
        perigo: p.perigo,
        acoes: p.acoes.map((a, i) => ({ ...a, id: `sim_${p.id}_${i}` })),
      })),
    []
  );

  const opcoes = useMemo(() => [...prontas, ...salvas], [prontas, salvas]);
  const alvo = opcoes.find((c) => c.id === escolhida);

  const resultado = useMemo(() => {
    if (!alvo) return null;
    // `quantidade` é a escolha da tela e sobrescreve a do molde: a pergunta do
    // jogador é literalmente "e contra três?".
    return simularEncontro([character], [{ ...alvo, quantidade }], {
      batalhas: BATALHAS,
      semente: SEMENTE,
    });
  }, [alvo, quantidade, character]);

  const semNada = character.unlockedRanks.length === 0;

  return (
    <div className="surface rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 text-sm dark:border-parchment-800 dark:bg-parchment-900/60">
      <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
        <Swords className="h-3.5 w-3.5 text-wine-500" /> Eu aguento isso?
      </h2>

      {semNada ? (
        <p className="text-xs text-parchment-600 dark:text-parchment-400">
          Abra um patamar primeiro — sem nenhuma árvore, não há build pra medir.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Contra qual criatura</span>
              <select
                value={escolhida}
                onChange={(e) => setEscolhida(e.target.value)}
                className="min-h-[2rem] w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 text-xs text-parchment-800 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-100"
              >
                <option value="">Contra quem?</option>
                <optgroup label="Apêndice G">
                  {prontas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} — {rotuloPatamar(c.patamar)}
                    </option>
                  ))}
                </optgroup>
                {salvas.length > 0 && (
                  <optgroup label="Do seu bestiário">
                    {salvas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} — {rotuloPatamar(c.patamar)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </label>
            <label>
              <span className="sr-only">Quantas delas</span>
              <select
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="min-h-[2rem] rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 text-xs text-parchment-800 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-100"
              >
                {[1, 2, 3, 4, 6].map((n) => (
                  <option key={n} value={n}>
                    ×{n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {resultado && alvo && (
            <div className="mt-2 rounded-lg border border-parchment-300 bg-parchment-50/70 p-2 dark:border-parchment-700 dark:bg-parchment-950/40">
              <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                <Skull className="h-3 w-3" aria-hidden />
                Você sozinho contra {quantidade > 1 ? `${quantidade}× ` : ""}
                {alvo.nome}
              </p>

              <div className="mt-1.5 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-black tabular-nums text-parchment-900 dark:text-parchment-50">
                    {Math.round(resultado.vitorias * 100)}%
                  </p>
                  <p className="text-3xs uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                    você vence
                  </p>
                </div>
                <div>
                  <p className="text-lg font-black tabular-nums text-parchment-900 dark:text-parchment-50">
                    {resultado.rodadasMedia.toFixed(1)}
                  </p>
                  <p className="text-3xs uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                    rodadas
                  </p>
                </div>
                <div>
                  <p className="text-lg font-black tabular-nums text-parchment-900 dark:text-parchment-50">
                    {Math.round(resultado.pvRestante * 100)}%
                  </p>
                  <p className="text-3xs uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                    PV sobrando
                  </p>
                </div>
              </div>

              <p className="mt-1.5 text-2xs leading-relaxed text-parchment-600 dark:text-parchment-400">
                {resultado.vitorias >= 0.9
                  ? "Isso não é uma luta — é uma despesa de PM."
                  : resultado.vitorias >= 0.6
                    ? "Você ganha, mas sai machucado. Com aliados, tranquilo."
                    : resultado.vitorias >= 0.25
                      ? "Moeda ao ar. Sozinho, é o tipo de luta que decide campanha."
                      : "Você morre. Isso é encontro de grupo, não de um."}
              </p>

              <p className="mt-1 text-3xs leading-relaxed text-parchment-500 dark:text-parchment-500">
                {BATALHAS} batalhas simuladas, com semente fixa — repetir dá o mesmo número, e é isso que
                deixa comparar duas builds. É você <b>sozinho</b>: a conta do grupo inteiro vive em{" "}
                <b>Encontros</b>, que simula contra as fichas de verdade.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
