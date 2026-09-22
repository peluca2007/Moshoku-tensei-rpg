"use client";
import { useState } from "react";
import { BESTIARIO, instanciarMonstro } from "@/data/preMadeMonsters";
import { useBestiaryStore } from "@/store/useBestiaryStore";

export default function EncounterCatalog({ pastaId }: { pastaId: string | null }) {
  const [busca, setBusca] = useState("");
  const [patamar, setPatamar] = useState(0);
  const importar = useBestiaryStore((s) => s.importarCriatura);
  const encontrados = BESTIARIO.filter((m) => (!patamar || m.patamar === patamar) && `${m.nome} ${m.categoria}`.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR")));
  return <details className="mb-3 rounded-xl border border-parchment-300 p-3 dark:border-parchment-800">
    <summary className="cursor-pointer text-sm font-semibold">Catálogo extra · {BESTIARIO.length} modelos editáveis</summary>
    <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">Adaptações para a mesa, com números e ações do molde do Apêndice G. As descrições sugerem a cena; não concedem poderes além do bloco. Revise especialmente os personagens lendários antes de usá-los.</p>
    <div className="my-3 flex flex-wrap gap-2">
      <input aria-label="Buscar no catálogo extra" placeholder="Nome ou categoria" value={busca} onChange={(e) => setBusca(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 text-sm dark:border-parchment-700 dark:bg-parchment-950" />
      <select aria-label="Patamar do catálogo extra" value={patamar} onChange={(e) => setPatamar(Number(e.target.value))} className="rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 text-sm dark:border-parchment-700 dark:bg-parchment-950"><option value={0}>Todos os patamares</option>{[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}º patamar</option>)}</select>
    </div>
    <div className="grid max-h-96 gap-2 overflow-y-auto sm:grid-cols-2">{encontrados.map((m) => <button type="button" key={m.nome} onClick={() => importar(instanciarMonstro(m), pastaId)} className="rounded-lg border border-parchment-300 p-3 text-left text-xs hover:border-wine-400 dark:border-parchment-700">
      <strong>{m.nome}</strong> · {m.patamar}º patamar · {m.categoria}
      <p className="mt-1 text-parchment-600 dark:text-parchment-400">{m.descricao}</p>
      <span className="mt-2 block font-semibold">Adicionar ao encontro</span>
    </button>)}</div>
    {!encontrados.length && <p className="text-sm">Nenhum modelo corresponde à busca.</p>}
  </details>;
}
