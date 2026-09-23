"use client";
import { useState } from "react";
import { gerarLootDoEncontro } from "@/lib/lootGenerator";
import { useBestiaryStore } from "@/store/useBestiaryStore";

export default function EncounterRewards({ tamanhoGrupo }: { tamanhoGrupo: number }) {
  const configuracao = useBestiaryStore((s) => s.configuracao);
  const configurar = useBestiaryStore((s) => s.configurarEncontro);
  const [copiado, setCopiado] = useState(false);
  const recompensa = configuracao.recompensa ?? { orcamento: 0, semente: configuracao.semente };
  const loot = gerarLootDoEncontro(recompensa.orcamento, recompensa.semente);
  const texto = [
    `Recompensa do encontro: ${loot.valorTotal} PO de valor total`,
    `${loot.moedas} PO em moedas`,
    ...loot.tralhas.map((i) => `• ${i.name} (${i.price} PO, vende a 100%): ${i.description}`),
    ...loot.itens.map((i) => `• ${i.name} (${i.price} PO, vende a 50%): ${i.description}`),
  ].join("\n");
  return <details className="mt-6 rounded-xl border border-parchment-300 p-4 dark:border-parchment-700">
    <summary className="cursor-pointer font-semibold">Recompensas</summary>
    <p className="mt-2 text-sm text-parchment-600 dark:text-parchment-400">Escolha o valor do tesouro. O sorteio usa itens e preços da Loja da Guilda; a dificuldade do combate não determina automaticamente a riqueza dos inimigos. Esta preparação fica salva com a cena.</p>
    <div className="my-3 flex flex-wrap items-end gap-3">
      <label className="text-sm">Orçamento (PO)<input aria-label="Orçamento da recompensa em PO" type="number" min={0} max={1000000} step={1} value={recompensa.orcamento} onChange={(e) => configurar({ recompensa: { ...recompensa, orcamento: Math.min(1000000, Math.max(0, Math.trunc(Number(e.target.value) || 0))) } })} className="mt-1 block w-36 rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 dark:border-parchment-700 dark:bg-parchment-950" /></label>
      <button type="button" onClick={() => configurar({ recompensa: { ...recompensa, semente: recompensa.semente + 1 } })} className="rounded-lg border border-parchment-300 px-3 py-2 text-sm dark:border-parchment-700">Sortear outros itens</button>
    </div>
    <p className="text-sm font-semibold">{loot.moedas} PO em moedas</p>
    {tamanhoGrupo > 0 && <p className="text-xs text-parchment-600 dark:text-parchment-400">Divisão: {Math.floor(loot.moedas / tamanhoGrupo)} PO por personagem; {loot.moedas % tamanhoGrupo} PO no caixa do grupo.</p>}
    {/* Tralha e equipamento aparecem separados porque são vendidos por regras
        diferentes (Cap. 5, "Vender o que caiu"): a tralha pelo preço cheio, o
        resto pela metade. Numa pilha só, o grupo perde metade do que a tralha
        valia sem saber. */}
    {loot.tralhas.length > 0 && <>
      <p className="mt-3 text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">Espólios — vendem pelo preço cheio</p>
      <ul className="mb-3 mt-1 space-y-2 text-sm">{loot.tralhas.map((i, indice) => <li key={`${i.id}-${indice}`}><strong>{i.name}</strong> · {i.price} PO<p className="text-xs text-parchment-600 dark:text-parchment-400">{i.description}</p></li>)}</ul>
    </>}
    {loot.itens.length > 0 && <>
      <p className="mt-3 text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">Equipamento — revende pela metade</p>
      <ul className="mb-3 mt-1 space-y-2 text-sm">{loot.itens.map((i, indice) => <li key={`${i.id}-${indice}`}><strong>{i.name}</strong> · {i.price} PO<p className="text-xs text-parchment-600 dark:text-parchment-400">{i.description}</p></li>)}</ul>
    </>}
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(texto); setCopiado(true); } catch { setCopiado(false); } }} className="rounded-lg border border-parchment-300 px-3 py-2 text-sm dark:border-parchment-700">{copiado ? "Recompensa copiada" : "Copiar recompensa"}</button>
    <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">A recompensa é uma preparação do mestre; não credita moedas nem itens nas fichas.</p>
  </details>;
}
