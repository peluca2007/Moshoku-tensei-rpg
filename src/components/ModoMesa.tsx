"use client";

import Link from "next/link";
import { ChevronRight, Minus, Plus, SkipForward, Swords, X, Zap } from "lucide-react";
import { CONDICOES } from "@/data/condicoes";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { useInitiativeStore } from "@/store/useInitiativeStore";
import { useSessionLog } from "@/store/useSessionLog";
import {
  getCondicoesAtivas,
  getCurrentHp,
  getCurrentMp,
  getCurrentPp,
  getCurrentPt,
  getEfeitosDeCondicoes,
  getMaxHp,
  getMaxMp,
  getPpPool,
  getPtPool,
} from "@/store/selectors";

/**
 * Modo Mesa — a tela que fica aberta a sessão inteira (0.1.27).
 *
 * ## O problema
 *
 * Ficha, iniciativa, encontros e rolador são quatro rotas, e durante uma sessão
 * de verdade a pessoa alterna entre elas o tempo todo, num celular, com uma mão
 * só, enquanto é a vez dela. Cada troca de rota é um toque e uma perda de
 * contexto — e o contexto que se perde é justamente "de quem é o turno".
 *
 * ## A regra que define o que entra aqui
 *
 * **Só o que se usa DENTRO de um turno.** Nada de editar ficha, comprar
 * habilidade, montar criatura ou trocar de personagem: essas coisas acontecem
 * entre sessões, e cada uma delas já tem uma tela que faz melhor. Uma tela de
 * mesa que também servisse pra construir personagem voltaria a ser a ficha, e o
 * problema (alternar entre telas) voltaria junto.
 *
 * O que sobrou são quatro coisas: de quem é a vez, quanto eu tenho de cada
 * reserva, o que está pegando em mim, e o dado — que já é global desde a 0.1.22
 * e por isso não precisa ser desenhado aqui.
 *
 * ## Por que os botões são grandes e poucos
 *
 * O alvo é o polegar de quem está de pé, com o aparelho numa mão e a ficha de
 * papel de outra pessoa na frente. Os passos de PV são −1/−5 e +1/+5 em vez de
 * um campo numérico: digitar exige as duas mãos e a atenção que o turno está
 * consumindo.
 */
const PASSOS = [-5, -1, 1, 5];

function Reserva({
  rotulo,
  atual,
  max,
  cor,
  aoMudar,
  aoRegistrar,
}: {
  rotulo: string;
  atual: number;
  max: number;
  cor: string;
  aoMudar: (valor: number) => void;
  /** Recebe o delta aplicado (negativo = dano). Só o PV usa — é o registro de sessão. */
  aoRegistrar?: (delta: number) => void;
}) {
  if (max <= 0) return null;
  const pct = Math.max(0, Math.min(100, (atual / max) * 100));

  return (
    <div className="rounded-xl border border-parchment-300 bg-parchment-50/80 p-2 dark:border-parchment-700 dark:bg-parchment-950/50">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
          {rotulo}
        </span>
        {/*
          O valor é uma região viva: aqui ele muda por botão, no meio do turno,
          e quem só ouve precisa saber em quanto ficou sem ter que voltar o foco
          pra reler. `atomic` porque "19 de 40" só significa alguma coisa junto.
        */}
        <span
          aria-live="polite"
          aria-atomic="true"
          className="tabular-nums text-lg font-black leading-none text-parchment-900 dark:text-parchment-50"
        >
          {atual}
          <span className="text-xs font-normal text-parchment-600 dark:text-parchment-400"> / {max}</span>
        </span>
      </div>

      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-parchment-300/70 dark:bg-parchment-800">
        <div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-1.5 grid grid-cols-4 gap-1">
        {PASSOS.map((passo) => (
          <button
            key={passo}
            type="button"
            onClick={() => {
              const novo = Math.max(0, Math.min(max, atual + passo));
              // O passo negativo de PV É o dano levado — o registro de sessão
              // aproveita isso em vez de pedir que alguém anote o golpe.
              // `registrar` não faz nada com a gravação desligada.
              if (aoRegistrar) aoRegistrar(novo - atual);
              aoMudar(novo);
            }}
            aria-label={`${passo > 0 ? "Recuperar" : "Gastar"} ${Math.abs(passo)} de ${rotulo}`}
            className="flex min-h-[2.25rem] items-center justify-center rounded-lg bg-parchment-200/80 text-xs font-bold text-parchment-700 hover:bg-wine-500/15 hover:text-wine-700 dark:bg-parchment-900 dark:text-parchment-200 dark:hover:text-wine-300"
          >
            {passo > 0 ? "+" : "−"}
            {Math.abs(passo)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ModoMesa() {
  const character = useActiveCharacter();
  const combatants = useInitiativeStore((s) => s.combatants);
  const round = useInitiativeStore((s) => s.round);
  const currentTurnId = useInitiativeStore((s) => s.currentTurnId);

  const maxHp = getMaxHp(character);
  const maxMp = getMaxMp(character);
  const maxPt = getPtPool(character);
  const maxPp = getPpPool(character);
  const ativas = getCondicoesAtivas(character);
  const efeitos = getEfeitosDeCondicoes(character);

  const ordem = [...combatants].sort((a, b) => b.initiative - a.initiative);
  const vez = ordem.find((c) => c.id === currentTurnId);
  const proximo = vez ? ordem[(ordem.indexOf(vez) + 1) % ordem.length] : ordem[0];

  return (
    <div className="mx-auto max-w-2xl space-y-3 p-3 sm:p-5">
      <header className="flex items-baseline justify-between gap-2">
        <h1 className="font-display text-xl font-black text-parchment-900 dark:text-parchment-50">
          {character.name?.trim() || "Sem nome"}
        </h1>
        {/*
          Alvo de toque de verdade, e não um link de 16px: este é o único link
          solto da tela (os outros vivem dentro de frase, que o critério 2.5.8
          isenta), e o `check:mobile` o pegou abaixo dos 24px na primeira
          medição.
        */}
        <Link
          href="/ficha"
          className="flex min-h-[2rem] shrink-0 items-center rounded-full px-2 text-2xs font-semibold text-parchment-600 underline-offset-2 hover:text-wine-600 hover:underline dark:text-parchment-400"
        >
          Ficha completa →
        </Link>
      </header>

      {/* De quem é a vez — o contexto que se perdia a cada troca de tela. */}
      <section className="rounded-2xl border border-parchment-300 bg-parchment-100/70 p-3 dark:border-parchment-800 dark:bg-parchment-900/60">
        {ordem.length === 0 ? (
          <p className="text-xs text-parchment-600 dark:text-parchment-400">
            Nenhum combate rolando.{" "}
            <Link href="/iniciativa" className="font-semibold text-wine-700 underline dark:text-wine-300">
              Montar a ordem
            </Link>{" "}
            — depois é só voltar pra cá.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                  Rodada {round} · agora é a vez de
                </p>
                <p className="truncate font-display text-lg font-black text-wine-700 dark:text-wine-300">
                  {vez?.name ?? "—"}
                </p>
                {proximo && proximo.id !== vez?.id && (
                  <p className="flex items-center gap-1 text-2xs text-parchment-600 dark:text-parchment-400">
                    <ChevronRight className="h-3 w-3" aria-hidden /> depois: {proximo.name}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => useInitiativeStore.getState().nextTurn()}
                className="flex min-h-[2.75rem] shrink-0 items-center gap-1.5 rounded-full bg-wine-600 px-4 text-sm font-bold text-white hover:bg-wine-500"
              >
                <SkipForward className="h-4 w-4" aria-hidden /> Passar
              </button>
            </div>
          </>
        )}
      </section>

      <section className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Reserva
          rotulo="PV"
          atual={getCurrentHp(character)}
          max={maxHp}
          cor="bg-wine-600"
          aoMudar={(v) => useCharacterStore.getState().setCurrentHp(v)}
          aoRegistrar={(delta) =>
            useSessionLog.getState().registrar({
              tipo: delta < 0 ? "dano" : "cura",
              rotulo: character.name?.trim() || "Sem nome",
              valor: Math.abs(delta),
              ator: vez?.name,
            })
          }
        />
        <Reserva
          rotulo="PM"
          atual={getCurrentMp(character)}
          max={maxMp}
          cor="bg-sky-600"
          aoMudar={(v) => useCharacterStore.getState().setCurrentMp(v)}
        />
        <Reserva
          rotulo="PT"
          atual={getCurrentPt(character)}
          max={maxPt}
          cor="bg-gold-600"
          aoMudar={(v) => useCharacterStore.getState().setCurrentPt(v)}
        />
        <Reserva
          rotulo="PP"
          atual={getCurrentPp(character)}
          max={maxPp}
          cor="bg-emerald-600"
          aoMudar={(v) => useCharacterStore.getState().setCurrentPp(v)}
        />
      </section>

      <section className="rounded-2xl border border-parchment-300 bg-parchment-100/70 p-3 dark:border-parchment-800 dark:bg-parchment-900/60">
        <h2 className="mb-1.5 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
          <Zap className="h-3 w-3 text-wine-500" aria-hidden /> Pegando em você
        </h2>

        {ativas.length === 0 ? (
          <p className="text-xs text-parchment-600 dark:text-parchment-400">Nada. Aproveite.</p>
        ) : (
          <>
            <ul className="flex flex-wrap gap-1.5">
              {ativas.map(({ condicao, acumulos }) => (
                <li key={condicao.id}>
                  <button
                    type="button"
                    onClick={() => useCharacterStore.getState().removerCondicao(condicao.id)}
                    aria-label={`Tirar ${condicao.nome}`}
                    title={condicao.efeito}
                    className="flex min-h-[2rem] items-center gap-1 rounded-full border border-wine-400/70 bg-wine-500/10 px-2.5 text-xs font-semibold text-wine-800 hover:bg-wine-500/20 dark:border-wine-700 dark:text-wine-200"
                  >
                    {condicao.nome}
                    {acumulos > 1 && <span className="tabular-nums">×{acumulos}</span>}
                    <X className="h-3 w-3 opacity-60" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>

            {(efeitos.desvantagemEmAtaques.length > 0 ||
              efeitos.deslocamento !== "normal" ||
              efeitos.penalidadeQuebrantado > 0 ||
              efeitos.danoPorTurno.length > 0) && (
              <p className="mt-1.5 text-2xs leading-relaxed text-parchment-700 dark:text-parchment-300">
                {efeitos.desvantagemEmAtaques.length > 0 && <>Ataques com Desvantagem. </>}
                {efeitos.deslocamento !== "normal" && (
                  <>Deslocamento {efeitos.deslocamento === "zero" ? "zerado" : "pela metade"}. </>
                )}
                {efeitos.penalidadeQuebrantado > 0 && <>−{efeitos.penalidadeQuebrantado} CA e dano. </>}
                {efeitos.danoPorTurno.map((d) => (
                  <b key={d.nome}>
                    {d.formula} no início do seu turno ({d.nome}).{" "}
                  </b>
                ))}
              </p>
            )}
          </>
        )}

        <label className="mt-2 block">
          <span className="sr-only">Aplicar uma condição em você</span>
          <select
            value=""
            onChange={(e) => e.target.value && useCharacterStore.getState().aplicarCondicao(e.target.value)}
            className="min-h-[2.25rem] w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 text-xs text-parchment-800 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-100"
          >
            <option value="">Marcar condição…</option>
            {CONDICOES.filter((c) => !ativas.some((a) => a.condicao.id === c.id)).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* Os PV dos OUTROS: o Mestre e a mesa perguntam isso o tempo todo. */}
      {ordem.length > 0 && (
        <section className="rounded-2xl border border-parchment-300 bg-parchment-100/70 p-3 dark:border-parchment-800 dark:bg-parchment-900/60">
          <h2 className="mb-1.5 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
            <Swords className="h-3 w-3 text-wine-500" aria-hidden /> A mesa
          </h2>
          <ul className="space-y-1">
            {ordem.map((c) => (
              <li
                key={c.id}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                  c.id === currentTurnId ? "bg-wine-500/10 ring-1 ring-wine-500/30" : ""
                }`}
              >
                <span className="w-7 shrink-0 text-center text-2xs font-bold tabular-nums text-parchment-500">
                  {c.initiative}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-parchment-800 dark:text-parchment-200">
                  {c.name}
                </span>
                {c.maxHp !== undefined && (
                  <span className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        useInitiativeStore
                          .getState()
                          .updateCombatant(c.id, { currentHp: Math.max(0, (c.currentHp ?? c.maxHp ?? 0) - 1) })
                      }
                      aria-label={`Tirar 1 PV de ${c.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded text-parchment-600 hover:bg-wine-500/15 hover:text-wine-700 dark:text-parchment-400"
                    >
                      <Minus className="h-3 w-3" aria-hidden />
                    </button>
                    <span className="min-w-[3.25rem] text-center text-2xs font-bold tabular-nums text-parchment-700 dark:text-parchment-300">
                      {c.currentHp ?? c.maxHp} / {c.maxHp}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        useInitiativeStore
                          .getState()
                          .updateCombatant(c.id, {
                            currentHp: Math.min(c.maxHp ?? 0, (c.currentHp ?? c.maxHp ?? 0) + 1),
                          })
                      }
                      aria-label={`Dar 1 PV a ${c.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded text-parchment-600 hover:bg-emerald-500/15 hover:text-emerald-700 dark:text-parchment-400"
                    >
                      <Plus className="h-3 w-3" aria-hidden />
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="pb-2 text-center text-2xs text-parchment-600 dark:text-parchment-400">
        Só o que se usa dentro de um turno. Comprar habilidade, montar criatura e editar a ficha continuam
        nas telas delas.
      </p>
    </div>
  );
}
