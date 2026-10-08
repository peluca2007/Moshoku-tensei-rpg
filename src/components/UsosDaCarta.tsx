"use client";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { limitesDaFicha } from "@/lib/limitesDeUso";
import { mesaDa } from "@/lib/mesa";
export default function UsosDaCarta({ chave }: {
    chave: string;
}) {
    const c = useActiveCharacter();
    const e = limitesDaFicha(c).find(e => e.chave === chave || e.chaveOrigem===chave);
    if (!e?.limite)
        return null;
    const usados = mesaDa(c).usos[e.chave] ?? 0;
    const periodo = { combate: "combate", curto: "Descanso Curto", longo: "Descanso Longo", sessao: "sessão" }[e.limite.periodo];
    return <fieldset className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-sm">
    <legend className="text-parchment-700 dark:text-parchment-200">{e.nome}: {e.limite.quantidade} {e.limite.quantidade === 1 ? "uso" : "usos"} por {periodo}</legend>
    {e.limite.quantidade === 1 ? <label className="flex min-h-10 items-center gap-2"><input type="checkbox" aria-label={`Marcar ${e.nome} usado`} checked={usados > 0} onChange={event => useCharacterStore.getState().usarCarta(e.chave, event.target.checked ? 1 : 0)}/>Usado</label> : <label className="flex min-h-10 items-center gap-2">Usados<input type="number" aria-label={`Usos consumidos de ${e.nome}`} min={0} max={e.limite.quantidade} value={usados} onChange={event => useCharacterStore.getState().usarCarta(e.chave, Number(event.target.value))} className="w-16 rounded border border-parchment-400 bg-parchment-50 p-2 text-parchment-900 dark:border-parchment-600 dark:bg-parchment-900 dark:text-parchment-100"/></label>}
    <span role="status" aria-live="polite">{Math.max(0, e.limite.quantidade - usados)} disponíveis</span>
  </fieldset>;
}
