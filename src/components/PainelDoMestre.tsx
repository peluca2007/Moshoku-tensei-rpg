"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Heart, Shield, Sparkles, Swords, Zap } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useCharacterStore } from "@/store/useCharacterStore";
import {
  getArmorClass,
  getCondicoesAtivas,
  getCurrentHp,
  getCurrentMp,
  getCurrentPp,
  getCurrentPt,
  getHighestUnlockedRank,
  getInitiative,
  getMaxHp,
  getMaxMp,
  getPpPool,
  getPtPool,
} from "@/store/selectors";
import { montarFicha } from "@/lib/combatSim";
import { diceAverage } from "@/lib/dice";
import { getTreeById } from "@/data/trees";
import { CharacterData, RANK_BONUS } from "@/lib/types";

/**
 * Painel do Mestre — as fichas do grupo lado a lado (0.1.28).
 *
 * ## O que ele responde
 *
 * O `/encontros` já simula contra as fichas de verdade, mas isso responde uma
 * pergunta de PREPARO ("este encontro mata a mesa?"). Entre um turno e outro o
 * Mestre tem outra, e ela é de consulta: quem está mais machucado, quem ainda
 * tem recurso, quem está com o quê pegando, e quanto o golpe mais forte de cada
 * um tira. É o que decide se o monstro morde o mago ou o tanque.
 *
 * ## O que ele NÃO calcula, de propósito
 *
 * "Dano por turno do grupo" contra a régua do Apêndice C. Parecia o número mais
 * óbvio a mostrar aqui, e é justamente o que o `data/danoPorTurno.ts` avisa não
 * ser automatizável: a régua "embute quantas Ações a árvore gasta, quantos alvos
 * ela pega, e se o alvo veste Touki — nada disso está nos dados de uma magia
 * isolada". Somar médias de golpes daria um número com cara de verdade e sem
 * verdade nenhuma.
 *
 * O que aparece no lugar é o que dá pra afirmar: a média do MAIOR golpe único de
 * cada personagem, com o nome do golpe ao lado. Um Mestre olha isso e sabe o que
 * cada um consegue tirar num acerto — que é a pergunta prática.
 */

interface LinhaDoGrupo {
  ficha: CharacterData;
  pvAtual: number;
  pvMax: number;
  ca: number;
  iniciativa: number;
  maiorGolpe: { nome: string; media: number } | null;
  patamar: string;
}

function maiorGolpeDe(c: CharacterData): { nome: string; media: number } | null {
  const ficha = montarFicha(c);
  const candidatos = [ficha.ataqueBasico, ...ficha.acoes];
  let melhor: { nome: string; media: number } | null = null;
  for (const acao of candidatos) {
    // `dadosDeArma` multiplica o dado de arma dentro do próprio motor; aqui ele
    // entra somado à média, pela mesma conta que `resolver` faz na simulação.
    const media = diceAverage(acao.dano) + acao.dadosDeArma * diceAverage(ficha.ataqueBasico.dano);
    if (!melhor || media > melhor.media) melhor = { nome: acao.nome, media };
  }
  return melhor;
}

/** O maior patamar aberto, com o rótulo cosmético da árvore — "Rei do Norte", não "Rei". */
function patamarDe(c: CharacterData): string {
  let melhor = "";
  let melhorBonus = -1;
  for (const u of c.unlockedRanks) {
    const tree = getTreeById(u.treeId);
    if (!tree) continue;
    const rank = getHighestUnlockedRank(c, tree.id);
    if (!rank) continue;
    const bonus = RANK_BONUS[rank];
    if (bonus > melhorBonus) {
      melhorBonus = bonus;
      melhor = `${tree.rankLabels?.[rank] ?? rank} · ${tree.name}`;
    }
  }
  return melhor || "Sem patamar aberto";
}

export default function PainelDoMestre() {
  const characters = useCharacterStore((s) => s.characters);
  const order = useCharacterStore((s) => s.order);
  const [ordenarPorFerimento, setOrdenarPorFerimento] = useState(true);

  const grupo: LinhaDoGrupo[] = useMemo(() => {
    const linhas = order
      .map((id) => characters[id])
      .filter((c): c is CharacterData => !!c)
      .map((ficha) => ({
        ficha,
        pvAtual: getCurrentHp(ficha),
        pvMax: getMaxHp(ficha),
        ca: getArmorClass(ficha),
        iniciativa: getInitiative(ficha).bonus,
        maiorGolpe: maiorGolpeDe(ficha),
        patamar: patamarDe(ficha),
      }));

    if (!ordenarPorFerimento) return linhas;
    // Quem está pior primeiro: é a ordem em que o Mestre olha a mesa quando
    // decide em quem o monstro bate.
    return [...linhas].sort((a, b) => a.pvAtual / (a.pvMax || 1) - b.pvAtual / (b.pvMax || 1));
  }, [characters, order, ordenarPorFerimento]);

  const pvTotal = grupo.reduce((s, l) => s + l.pvAtual, 0);
  const pvTotalMax = grupo.reduce((s, l) => s + l.pvMax, 0);

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <PageHeader icon={Eye} title="Painel do Mestre">
        As fichas do grupo lado a lado — quem está machucado, quem ainda tem recurso, e o que cada um tira
        num acerto.
      </PageHeader>

      {grupo.length === 0 ? (
        <EmptyState
          icon={Eye}
          hint={
            <>
              As fichas do grupo entram pelo{" "}
              <Link href="/personagens" className="font-semibold text-wine-700 underline dark:text-wine-300">
                roster
              </Link>{" "}
              — por link, por arquivo, ou criadas aqui mesmo.
            </>
          }
        >
          Nenhuma ficha no roster ainda.
        </EmptyState>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-parchment-700 dark:text-parchment-300">
              <b>{grupo.length}</b> {grupo.length === 1 ? "personagem" : "personagens"} ·{" "}
              <b className="tabular-nums">
                {pvTotal}/{pvTotalMax}
              </b>{" "}
              PV somados
              {pvTotalMax > 0 && (
                <span className="text-parchment-600 dark:text-parchment-400">
                  {" "}
                  ({Math.round((pvTotal / pvTotalMax) * 100)}% da reserva do grupo)
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setOrdenarPorFerimento((v) => !v)}
              aria-pressed={ordenarPorFerimento}
              className={`min-h-[2rem] rounded-full border px-3 text-xs font-semibold ${
                ordenarPorFerimento
                  ? "border-wine-500 bg-wine-600 text-parchment-50"
                  : "border-parchment-300 text-parchment-700 dark:border-parchment-700 dark:text-parchment-300"
              }`}
            >
              Pior primeiro
            </button>
          </div>

          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {grupo.map((l) => {
              const pct = l.pvMax > 0 ? (l.pvAtual / l.pvMax) * 100 : 0;
              const condicoes = getCondicoesAtivas(l.ficha);
              const maxMp = getMaxMp(l.ficha);
              const maxPt = getPtPool(l.ficha);
              const maxPp = getPpPool(l.ficha);

              return (
                <li
                  key={l.ficha.id}
                  className={`surface rounded-2xl border p-3 ${
                    pct <= 50
                      ? "border-wine-400 bg-wine-50/50 dark:border-wine-800 dark:bg-wine-950/25"
                      : "border-parchment-300 bg-parchment-100/70 dark:border-parchment-800 dark:bg-parchment-900/60"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="min-w-0 truncate font-display text-base font-black text-parchment-900 dark:text-parchment-50">
                      {l.ficha.name || "Sem nome"}
                    </p>
                    <span className="shrink-0 text-2xs text-parchment-600 dark:text-parchment-400">
                      {l.patamar}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 shrink-0 text-wine-600" aria-hidden />
                    <span className="tabular-nums text-sm font-bold text-parchment-900 dark:text-parchment-50">
                      {l.pvAtual}
                      <span className="text-xs font-normal text-parchment-600 dark:text-parchment-400">
                        {" "}
                        / {l.pvMax}
                      </span>
                    </span>
                    <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-parchment-300/70 dark:bg-parchment-800">
                      <span
                        className={`block h-full rounded-full ${pct <= 25 ? "bg-rose-600" : pct <= 50 ? "bg-gold-600" : "bg-wine-600"}`}
                        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                      />
                    </span>
                  </div>

                  <dl className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-2xs text-parchment-700 dark:text-parchment-300">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-parchment-500" aria-hidden />
                      <dt className="sr-only">Classe de Armadura</dt>
                      <dd className="tabular-nums">
                        <b>CA {l.ca}</b>
                      </dd>
                    </div>
                    <div className="flex items-center gap-1">
                      <Swords className="h-3 w-3 text-parchment-500" aria-hidden />
                      <dt className="sr-only">Iniciativa</dt>
                      <dd className="tabular-nums">
                        Ini {l.iniciativa >= 0 ? "+" : ""}
                        {l.iniciativa}
                      </dd>
                    </div>
                    {maxMp > 0 && (
                      <div>
                        <dt className="sr-only">Pontos de Magia</dt>
                        <dd className="tabular-nums">
                          PM {getCurrentMp(l.ficha)}/{maxMp}
                        </dd>
                      </div>
                    )}
                    {maxPt > 0 && (
                      <div>
                        <dt className="sr-only">Pontos de Touki</dt>
                        <dd className="tabular-nums">
                          PT {getCurrentPt(l.ficha)}/{maxPt}
                        </dd>
                      </div>
                    )}
                    {maxPp > 0 && (
                      <div>
                        <dt className="sr-only">Pontos de Preparação</dt>
                        <dd className="tabular-nums">
                          PP {getCurrentPp(l.ficha)}/{maxPp}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {l.maiorGolpe && (
                    <p className="mt-1.5 flex items-center gap-1 text-2xs text-parchment-600 dark:text-parchment-400">
                      <Sparkles className="h-3 w-3 shrink-0 text-gold-600" aria-hidden />
                      Maior golpe: <b>{l.maiorGolpe.nome}</b>, ~{Math.round(l.maiorGolpe.media)} de média
                    </p>
                  )}

                  {condicoes.length > 0 && (
                    <p className="mt-1.5 flex flex-wrap items-center gap-1 text-2xs">
                      <Zap className="h-3 w-3 shrink-0 text-wine-600" aria-hidden />
                      {condicoes.map(({ condicao, acumulos }) => (
                        <span
                          key={condicao.id}
                          title={condicao.efeito}
                          className="rounded-full bg-wine-600/10 px-1.5 py-0.5 font-semibold text-wine-800 dark:text-wine-200"
                        >
                          {condicao.nome}
                          {acumulos > 1 && `×${acumulos}`}
                        </span>
                      ))}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="mt-3 text-2xs leading-relaxed text-parchment-600 dark:text-parchment-400">
            O painel <b>lê</b> as fichas, nunca escreve nelas — mexer nos números de um personagem continua
            sendo coisa de quem joga com ele. Para saber se um encontro mata a mesa, o{" "}
            <Link href="/encontros" className="font-semibold text-wine-700 underline dark:text-wine-300">
              montador de encontros
            </Link>{" "}
            simula 300 batalhas contra estas mesmas fichas. Para pôr duas delas lado a lado contra o mesmo
            alvo, o{" "}
            <Link href="/comparar" className="font-semibold text-wine-700 underline dark:text-wine-300">
              comparador de builds
            </Link>.
          </p>
        </>
      )}
    </div>
  );
}
