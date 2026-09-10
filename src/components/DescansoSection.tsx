"use client";

import { useState } from "react";
import { BedDouble, Coffee, Coins, Hourglass } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import {
  getMaxHp,
  getMaxMp,
  getPpPool,
  getPtPool,
  getHighestUnlockedRank,
  getFinalAttribute,
} from "@/store/selectors";
import { RANK_BONUS } from "@/lib/types";
import { getTreeById } from "@/data/trees";
import { rollFormula } from "@/lib/rollEngine";
import {
  CURTOS_POR_DIA,
  descansoCurto,
  descansoLongo,
  DOWNTIME,
  GanhoDeDescanso,
  ouroDeTrabalhar,
  ReservasMaximas,
} from "@/lib/descanso";

/**
 * Descanso e Downtime, jogáveis — 0.1.25.
 *
 * O Cap. 4, §7 e o Cap. 5, §1 sempre tiveram as regras escritas com todos os
 * números. O que não existia era o botão: a mesa lia a regra e fazia a conta no
 * papel, toda vez, e uma conta feita no papel a cada sessão é uma conta que
 * eventualmente sai errada e ninguém percebe.
 *
 * ## A conta aparece ANTES de ser aplicada
 *
 * Nada aqui muda a ficha sozinho. O descanso mostra quanto vai devolver de cada
 * reserva, com a origem de cada número ("25% de 40", "50% rolado no Vigor"), e
 * só aplica no segundo toque. É a mesma razão pela qual o rolador mostra os
 * dados que caíram: um número que aparece sem a conta ao lado é um número que a
 * mesa não confere — e o que a mesa não confere, ela não confia.
 */
export default function DescansoSection() {
  const character = useActiveCharacter();
  const [previa, setPrevia] = useState<{ tipo: "curto" | "longo"; ganho: GanhoDeDescanso } | null>(null);
  const [downtime, setDowntime] = useState<{ nome: string; texto: string } | null>(null);

  const maximos: ReservasMaximas = {
    pv: getMaxHp(character),
    pm: getMaxMp(character),
    pt: getPtPool(character),
    pp: getPpPool(character),
  };
  const curtosUsados = character.descansosCurtos ?? 0;
  const podeCurto = curtosUsados < CURTOS_POR_DIA;

  /** O maior Bônus de Rank entre todas as árvores abertas — a escala de "Trabalhar". */
  const maiorBonus = character.unlockedRanks.reduce((maior, u) => {
    const tree = getTreeById(u.treeId);
    const rank = tree ? getHighestUnlockedRank(character, tree.id) : undefined;
    return rank ? Math.max(maior, RANK_BONUS[rank]) : maior;
  }, 0);

  function prepararCurto() {
    setPrevia({ tipo: "curto", ganho: descansoCurto(maximos) });
    setDowntime(null);
  }

  function prepararLongo() {
    // O Vigor rola AGORA e o resultado entra na prévia: quem confere a conta
    // precisa ver o dado que caiu, não só a porcentagem final.
    const vigor = Math.max(1, getFinalAttribute(character, "vigor"));
    const rolado = rollFormula(`${vigor}d10`).total;
    setPrevia({ tipo: "longo", ganho: descansoLongo(maximos, rolado) });
    setDowntime(null);
  }

  function aplicar() {
    if (!previa) return;
    useCharacterStore.getState().descansar(previa.tipo, previa.ganho, maximos);
    setPrevia(null);
  }

  function fazerDowntime(id: string) {
    const atividade = DOWNTIME.find((a) => a.id === id);
    if (!atividade) return;
    setPrevia(null);

    if (atividade.aplica === "ouro") {
      const rolagem = rollFormula("2d6").total;
      const ganho = ouroDeTrabalhar(rolagem, maiorBonus);
      useCharacterStore.getState().setGold(character.gold + ganho);
      setDowntime({
        nome: atividade.nome,
        texto: `+${ganho} PO — 2d6 (${rolagem}) × Bônus de Rank ${maiorBonus || "—"}${
          maiorBonus <= 1 ? ", com o piso do próprio 2d6" : ""
        }. Já entrou na ficha.`,
      });
      return;
    }

    if (atividade.aplica === "pvCheio") {
      useCharacterStore.getState().setCurrentHp(maximos.pv);
      setDowntime({
        nome: atividade.nome,
        texto: `PV cheios (${maximos.pv}). A Exaustão a mais que a regra remove é anotação de mesa — a ficha ainda não a acompanha.`,
      });
      return;
    }

    setDowntime({ nome: atividade.nome, texto: atividade.efeito });
  }

  return (
    <div className="surface rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 text-sm dark:border-parchment-800 dark:bg-parchment-900/60">
      <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
        <BedDouble className="h-3.5 w-3.5 text-wine-500" /> Descanso e Downtime
      </h2>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={prepararCurto}
          disabled={!podeCurto}
          title={podeCurto ? undefined : "Cap. 4, §7: dois Curtos entre dois Longos, e nem um a mais"}
          className="flex min-h-[2rem] flex-1 items-center justify-center gap-1.5 rounded-lg border border-parchment-300 px-3 py-1.5 text-xs font-semibold text-parchment-700 hover:border-wine-400 hover:text-wine-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-parchment-700 dark:text-parchment-200"
        >
          <Coffee className="h-3.5 w-3.5" aria-hidden />
          Curto ({curtosUsados}/{CURTOS_POR_DIA})
        </button>
        <button
          type="button"
          onClick={prepararLongo}
          className="flex min-h-[2rem] flex-1 items-center justify-center gap-1.5 rounded-lg border border-parchment-300 px-3 py-1.5 text-xs font-semibold text-parchment-700 hover:border-wine-400 hover:text-wine-600 dark:border-parchment-700 dark:text-parchment-200"
        >
          <BedDouble className="h-3.5 w-3.5" aria-hidden />
          Longo
        </button>
      </div>

      {previa && (
        <div className="mt-2 rounded-lg border border-wine-300 bg-wine-50/60 p-2 dark:border-wine-900 dark:bg-wine-950/30">
          <p className="text-2xs font-bold uppercase tracking-wide text-wine-700 dark:text-wine-300">
            Descanso {previa.tipo === "curto" ? "Curto" : "Longo"} — confira antes
          </p>
          <ul className="mt-1 space-y-0.5 text-2xs leading-relaxed text-wine-900/80 dark:text-wine-100/80">
            {previa.ganho.detalhe.map((linha) => (
              <li key={linha}>{linha}</li>
            ))}
          </ul>
          <div className="mt-1.5 flex gap-1.5">
            <button
              type="button"
              onClick={aplicar}
              className="min-h-[1.75rem] rounded-full bg-wine-600 px-3 py-1 text-2xs font-bold text-white hover:bg-wine-500"
            >
              Aplicar na ficha
            </button>
            <button
              type="button"
              onClick={() => setPrevia(null)}
              className="min-h-[1.75rem] rounded-full px-3 py-1 text-2xs font-semibold text-parchment-600 hover:text-wine-600 dark:text-parchment-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <label className="mt-2 block">
        <span className="sr-only">Atividade de Downtime (um bloco de uma semana)</span>
        <select
          value=""
          onChange={(e) => fazerDowntime(e.target.value)}
          className="min-h-[2rem] w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 text-xs text-parchment-800 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-100"
        >
          <option value="">Downtime — uma semana livre…</option>
          {DOWNTIME.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      </label>

      {downtime && (
        <p className="mt-2 rounded-lg bg-parchment-200/60 p-2 text-2xs leading-relaxed text-parchment-700 dark:bg-parchment-950/50 dark:text-parchment-300">
          <b className="flex items-center gap-1">
            {downtime.nome === "Trabalhar" ? (
              <Coins className="h-3 w-3 text-gold-600" aria-hidden />
            ) : (
              <Hourglass className="h-3 w-3 text-parchment-500" aria-hidden />
            )}
            {downtime.nome}
          </b>
          {downtime.texto}
        </p>
      )}

      <p className="mt-2 text-2xs italic leading-relaxed text-parchment-600 dark:text-parchment-400">
        Nenhuma atividade de Downtime concede PA, magia, talento ou Rank (Cap. 5, §1) — progressão só vem de
        jogar a campanha.
      </p>

    </div>
  );
}
