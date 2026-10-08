"use client";

import { getTreeById } from "@/data/trees";
import { useActiveCharacter } from "@/store/useCharacterStore";
import { getDadosDePvPorPatamar, getFinalAttribute, getMaxHp } from "@/store/selectors";
import { getVigorFactor } from "@/lib/types";
import { getPvNaMesa } from "@/lib/mesa";

export default function OrigemDosPv() {
  const c = useActiveCharacter();
  const dados = getDadosDePvPorPatamar(c);
  const soma = dados.reduce((n, d) => n + d.media, 0);
  const fator = getVigorFactor(getFinalAttribute(c, "vigor"));
  const natural = Math.floor((14 + 1.67 * soma) * fator);
  const maximo = getMaxHp(c);
  const numero = (n: number) => n.toLocaleString("pt-BR");
  const nome = (id: string) => getTreeById(id)?.name ?? id;
  return <details data-origem-pv className="surface rounded-2xl border border-parchment-300 p-4 text-sm text-parchment-800 dark:border-parchment-800 dark:text-parchment-200">
    <summary className="min-h-10 cursor-pointer font-semibold">De onde vem o seu PV</summary>
    <ul className="mt-2 space-y-2">
      {dados.map(d => <li key={d.rank}>
        <b>{d.rank}</b>: {nome(d.treeId)} · {d.formula} · média {numero(d.media)}
        {d.deFora.map(out => <span className="block" key={out.treeId}><s>{nome(out.treeId)} · {out.formula} · média {numero(out.media)}</s> — não soma neste patamar</span>)}
      </li>)}
    </ul>
    <p className="mt-3 break-words">(14 + 1,67 × {numero(soma)}) × {numero(fator)} = {natural} PV, arredondados para baixo.</p>
    {maximo !== natural && <p>Bônus fixos, talentos, compras e ajustes da ficha: {maximo - natural >= 0 ? "+" : ""}{maximo - natural} PV.</p>}
    <p>PV Máximo: <b>{maximo}</b>.{getPvNaMesa(c) !== maximo && <> Com Exaustão: <b>{getPvNaMesa(c)}</b>.</>}</p>
  </details>;
}
