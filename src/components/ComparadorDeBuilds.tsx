"use client";

import Link from "next/link";
import { useState } from "react";
import { GitCompare } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { MOLDES_CRIATURA, rotuloPatamar } from "@/data/bestiary";
import { useCharacterStore } from "@/store/useCharacterStore";
import {
  getArmorClass,
  getHighestUnlockedRank,
  getInitiative,
  getMaxHp,
  getMaxMp,
  getPaSpent,
  getPpPool,
  getPtPool,
} from "@/store/selectors";
import { montarFicha } from "@/lib/combatSim";
import { criaturaDoMolde, simularEncontro } from "@/lib/encounterSim";
import { diceAverage } from "@/lib/dice";
import { getTreeById } from "@/data/trees";
import { CharacterData, RANKS } from "@/lib/types";

/**
 * Comparador de builds — 0.1.30.
 *
 * ## Por que ele existe
 *
 * Metade do `O-QUE-FALTA` é "jogar e ver": a Ordem Partilhada do Invocador, a
 * Dissonância do Bardo, as quatro árvores mexidas na 0.1.14. São perguntas
 * legítimas de mesa — mas parte delas tem um lado que dá pra MEDIR antes da
 * mesa, e enquanto não se mede, "essa build é mais forte" é opinião com número
 * nenhum atrás.
 *
 * O `scripts/simular-combate.mts` já fazia builds de mesmo orçamento se baterem.
 * Isto é aquilo com cara de tela, pra quem não abre terminal.
 *
 * ## A regra que faz a comparação valer
 *
 * **As duas enfrentam o MESMO alvo, com a MESMA semente.** Um alvo diferente
 * pra cada uma compararia dois encontros, não duas builds; e sem semente fixa a
 * diferença entre 62% e 58% pode ser só o dado.
 *
 * O alvo é o molde do Apêndice G, sem ações próprias: assim ele gasta o
 * orçamento de dano do patamar inteiro todo turno, que é exatamente a "criatura
 * média" contra a qual a régua do livro foi calibrada. Uma criatura com truques
 * mediria quão bem cada build responde AQUELE truque.
 *
 * ## O que ele não conclui
 *
 * Ele não diz qual build é melhor. Diz quanto cada uma aguenta e quanto tira
 * contra o mesmo alvo — e uma build que perde nos dois números pode ainda ser a
 * que a mesa precisa, porque cura, controle e utilidade não aparecem numa luta
 * de um contra um. O texto na tela repete isso.
 */
const BATALHAS = 400;
const SEMENTE = 20260910;

function resumoDe(c: CharacterData) {
  const ficha = montarFicha(c);
  const maiorGolpe = [ficha.ataqueBasico, ...ficha.acoes].reduce(
    (melhor, a) => {
      const media = diceAverage(a.dano) + a.dadosDeArma * diceAverage(ficha.ataqueBasico.dano);
      return media > melhor.media ? { nome: a.nome, media } : melhor;
    },
    { nome: "—", media: 0 }
  );

  let patamar = "Sem patamar";
  let maiorRank = -1;
  for (const u of c.unlockedRanks) {
    const tree = getTreeById(u.treeId);
    const rank = tree ? getHighestUnlockedRank(c, tree.id) : undefined;
    if (!tree || !rank) continue;
    const idx = RANKS.indexOf(rank);
    if (idx > maiorRank) {
      maiorRank = idx;
      patamar = `${tree.rankLabels?.[rank] ?? rank} · ${tree.name}`;
    }
  }

  return {
    pa: getPaSpent(c),
    pv: getMaxHp(c),
    ca: getArmorClass(c),
    iniciativa: getInitiative(c).bonus,
    pm: getMaxMp(c),
    pt: getPtPool(c),
    pp: getPpPool(c),
    conhecimentos: c.purchasedAbilities.length,
    maiorGolpe,
    patamar,
    /** O índice do maior rank aberto, pra sugerir o patamar do alvo. */
    indiceDeRank: maiorRank,
  };
}

/** Uma linha da tabela, com o vencedor daquele número marcado. */
function Linha({
  rotulo,
  a,
  b,
  maiorEhMelhor = true,
  sufixo = "",
}: {
  rotulo: string;
  a: number;
  b: number;
  maiorEhMelhor?: boolean;
  sufixo?: string;
}) {
  const aVence = maiorEhMelhor ? a > b : a < b;
  const bVence = maiorEhMelhor ? b > a : b < a;
  const forte = "font-black text-wine-700 dark:text-wine-300";
  const normal = "text-parchment-800 dark:text-parchment-200";

  return (
    <tr className="border-t border-parchment-300/70 dark:border-parchment-800">
      <td className={`py-1 text-right tabular-nums ${aVence ? forte : normal}`}>
        {a}
        {sufixo}
      </td>
      <th scope="row" className="px-2 py-1 text-center text-2xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
        {rotulo}
      </th>
      <td className={`py-1 text-left tabular-nums ${bVence ? forte : normal}`}>
        {b}
        {sufixo}
      </td>
    </tr>
  );
}

export default function ComparadorDeBuilds() {
  const characters = useCharacterStore((s) => s.characters);
  const order = useCharacterStore((s) => s.order);
  const fichas = order.map((id) => characters[id]).filter((c): c is CharacterData => !!c);

  /*
   * A escolha cai de volta na primeira ficha quando o id guardado não existe —
   * e isso não é defensividade solta, é o caso NORMAL do primeiro render.
   *
   * O roster é persistido com `skipHydration` (ver `StoreHydration`), então na
   * primeira passada `fichas` está vazio e um `useState(fichas[0]?.id)` nasce
   * com string vazia. Quando a hidratação chega, o estado continua vazio, as
   * duas listas caem na primeira opção por padrão do navegador, e a tela mostra
   * a MESMA ficha dos dois lados — foi exatamente o que o primeiro print
   * mostrou.
   */
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");
  const a = fichas.find((c) => c.id === idA) ?? fichas[0];
  const b = fichas.find((c) => c.id === idB) ?? fichas[1] ?? fichas[0];

  /*
   * Sem `useMemo`, de propósito — e isto é caro, então vale explicar.
   *
   * `simularEncontro` roda 400 batalhas duas vezes aqui. A primeira versão
   * envolvia tudo em `useMemo`, e o React Compiler (ligado neste projeto)
   * RECUSOU o arquivo inteiro: as fichas saem de um `find` sobre um array
   * montado no corpo do componente, e ele não consegue provar que esse array
   * não muda depois. O resultado seria pior que o problema — o componente
   * inteiro deixaria de ser otimizado pra preservar uma memoização manual que
   * ele mesmo faria melhor.
   *
   * Então a memoização fica com o compilador, que sabe as dependências de
   * verdade. As duas simulações só refazem quando as fichas ou o patamar do
   * alvo mudam.
   */
  const resA = a ? resumoDe(a) : null;
  const resB = b ? resumoDe(b) : null;

  const maiorRank = Math.max(resA?.indiceDeRank ?? 0, resB?.indiceDeRank ?? 0);
  const patamarSugerido = Math.min(MOLDES_CRIATURA.length, Math.max(1, maiorRank + 1));
  const [patamar, setPatamar] = useState<number | null>(null);
  const patamarAlvo = patamar ?? patamarSugerido;

  // Alvo recriado pra cada lado, mas idêntico e com a MESMA semente: é o que
  // transforma dois resultados em uma comparação.
  const alvo = () => criaturaDoMolde(patamarAlvo, "padrao", "Alvo padrão", "cmp_alvo");
  const duelo =
    a && b
      ? {
          a: simularEncontro([a], [alvo()], { batalhas: BATALHAS, semente: SEMENTE }),
          b: simularEncontro([b], [alvo()], { batalhas: BATALHAS, semente: SEMENTE }),
        }
      : null;

  if (fichas.length < 2) {
    return (
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <PageHeader icon={GitCompare} title="Comparar builds">
          Duas fichas lado a lado, contra o mesmo alvo e com a mesma semente.
        </PageHeader>
        <EmptyState
          icon={GitCompare}
          hint={
            <>
              Comparar precisa de duas.{" "}
              <Link href="/personagens" className="font-semibold text-wine-700 underline dark:text-wine-300">
                O roster
              </Link>{" "}
              recebe ficha por link, por arquivo ou criada na hora.
            </>
          }
        >
          {fichas.length === 0 ? "Nenhuma ficha no roster." : "Só uma ficha no roster."}
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <PageHeader icon={GitCompare} title="Comparar builds">
        Duas fichas contra o <b>mesmo</b> alvo, com a <b>mesma</b> semente — é o que separa comparar builds
        de comparar sortes.
      </PageHeader>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <label>
          <span className="sr-only">Primeira ficha</span>
          <select
            value={a?.id ?? ""}
            onChange={(e) => setIdA(e.target.value)}
            className="min-h-[2.25rem] w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 text-xs font-semibold text-parchment-800 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-100"
          >
            {fichas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || "Sem nome"}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Segunda ficha</span>
          <select
            value={b?.id ?? ""}
            onChange={(e) => setIdB(e.target.value)}
            className="min-h-[2.25rem] w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 text-xs font-semibold text-parchment-800 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-100"
          >
            {fichas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || "Sem nome"}
              </option>
            ))}
          </select>
        </label>
      </div>

      {resA && resB && (
        <div className="surface rounded-2xl border border-parchment-300 bg-parchment-100/70 p-3 dark:border-parchment-800 dark:bg-parchment-900/60">
          <table className="w-full">
            <caption className="sr-only">Comparação entre as duas fichas</caption>
            <thead>
              <tr>
                <th className="pb-1 text-right font-display text-sm font-black text-parchment-900 dark:text-parchment-50">
                  {a?.name || "Sem nome"}
                </th>
                <th className="px-2 pb-1" />
                <th className="pb-1 text-left font-display text-sm font-black text-parchment-900 dark:text-parchment-50">
                  {b?.name || "Sem nome"}
                </th>
              </tr>
              <tr className="text-2xs text-parchment-600 dark:text-parchment-400">
                <td className="pb-1 text-right">{resA.patamar}</td>
                <td />
                <td className="pb-1 text-left">{resB.patamar}</td>
              </tr>
            </thead>
            <tbody>
              <Linha rotulo="PA gastos" a={resA.pa} b={resB.pa} maiorEhMelhor={false} />
              <Linha rotulo="Conhecimentos" a={resA.conhecimentos} b={resB.conhecimentos} />
              <Linha rotulo="PV" a={resA.pv} b={resB.pv} />
              <Linha rotulo="CA" a={resA.ca} b={resB.ca} />
              <Linha rotulo="Iniciativa" a={resA.iniciativa} b={resB.iniciativa} />
              {(resA.pm > 0 || resB.pm > 0) && <Linha rotulo="PM" a={resA.pm} b={resB.pm} />}
              {(resA.pt > 0 || resB.pt > 0) && <Linha rotulo="PT" a={resA.pt} b={resB.pt} />}
              {(resA.pp > 0 || resB.pp > 0) && <Linha rotulo="PP" a={resA.pp} b={resB.pp} />}
              <Linha
                rotulo="Maior golpe (média)"
                a={Math.round(resA.maiorGolpe.media)}
                b={Math.round(resB.maiorGolpe.media)}
              />
              {duelo && (
                <>
                  <Linha
                    rotulo="Vence o alvo"
                    a={Math.round(duelo.a.vitorias * 100)}
                    b={Math.round(duelo.b.vitorias * 100)}
                    sufixo="%"
                  />
                  <Linha
                    rotulo="PV sobrando"
                    a={Math.round(duelo.a.pvRestante * 100)}
                    b={Math.round(duelo.b.pvRestante * 100)}
                    sufixo="%"
                  />
                  <Linha
                    rotulo="Rodadas até decidir"
                    a={Number(duelo.a.rodadasMedia.toFixed(1))}
                    b={Number(duelo.b.rodadasMedia.toFixed(1))}
                    maiorEhMelhor={false}
                  />
                </>
              )}
            </tbody>
          </table>

          <p className="mt-2 text-2xs text-parchment-600 dark:text-parchment-400">
            Golpe: <b>{resA.maiorGolpe.nome}</b> contra <b>{resB.maiorGolpe.nome}</b>.
          </p>

          <label className="mt-2 flex flex-wrap items-center gap-1.5 text-2xs text-parchment-700 dark:text-parchment-300">
            Alvo do duelo:
            <select
              value={patamarAlvo}
              onChange={(e) => setPatamar(Number(e.target.value))}
              className="min-h-[2rem] rounded-lg border border-parchment-300 bg-parchment-50 px-2 text-2xs dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-100"
            >
              {MOLDES_CRIATURA.map((m) => (
                <option key={m.patamar} value={m.patamar}>
                  {rotuloPatamar(m.patamar)}
                </option>
              ))}
            </select>
            <span className="text-parchment-600 dark:text-parchment-400">
              — o molde do Apêndice G, sem truques: ele gasta o orçamento de dano do patamar inteiro todo
              turno, que é a criatura média contra a qual a régua do livro foi calibrada.
            </span>
          </label>
        </div>
      )}

      <p className="mt-3 text-2xs leading-relaxed text-parchment-600 dark:text-parchment-400">
        Isto <b>não diz qual build é melhor</b>. Diz quanto cada uma aguenta e quanto tira contra o mesmo
        alvo, em {BATALHAS} batalhas com semente fixa. Uma build que perde nos dois números pode ainda ser a
        que a mesa precisa: cura, controle e utilidade não aparecem numa luta de um contra um.
      </p>
    </div>
  );
}
