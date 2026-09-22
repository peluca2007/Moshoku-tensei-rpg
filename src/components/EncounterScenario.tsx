"use client";

import type { CharacterData } from "@/lib/types";
import type { CriaturaEncontro } from "@/lib/encounterSim";
import type { EstadoInicialCombate } from "@/lib/combatScenario";
import { montarFicha } from "@/lib/combatSim";
import { pactosDeCombate } from "@/lib/combatSummons";
import { useBestiaryStore } from "@/store/useBestiaryStore";

const campo = "rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 text-sm dark:border-parchment-700 dark:bg-parchment-950";
const condicoes = [["escondido", "Escondido"], ["surpreso", "Surpreso"], ["molhado", "Molhado"], ["caido", "Caído"], ["preso", "Preso"], ["envenenado", "Envenenado"]] as const;

export default function EncounterScenario({ grupo, criaturas }: { grupo: CharacterData[]; criaturas: CriaturaEncontro[] }) {
  const configuracao = useBestiaryStore((s) => s.configuracao);
  const configurar = useBestiaryStore((s) => s.configurarEncontro);
  const cenario = configuracao.cenario ?? {};
  const participantes = [
    ...grupo.map((c) => ({ id: c.id, nome: c.name || "Sem nome", agua: montarFicha(c).rankAgua >= 3, ladino: montarFicha(c).rankLadino > 0, criatura: false })),
    ...criaturas.map((c) => ({ id: c.id, nome: `${c.nome}${c.quantidade > 1 ? ` ×${c.quantidade}` : ""}`, agua: false, ladino: false, criatura: true })),
  ];
  const atualizar = (id: string, patch: Partial<EstadoInicialCombate>) => configurar({ cenario: {
    ...cenario, participantes: { ...cenario.participantes, [id]: { ...cenario.participantes?.[id], ...patch } },
  } });
  return <details className="mt-6 rounded-xl border border-parchment-300 p-4 dark:border-parchment-700">
    <summary className="cursor-pointer font-semibold">Detalhes do cenário <span className="text-xs font-normal text-parchment-600 dark:text-parchment-400">· opcionais</span></summary>
    <p className="mt-2 text-sm text-parchment-600 dark:text-parchment-400">As habilidades saem das fichas. O Ladino tenta começar escondido contra a Percepção dos inimigos. Ajuste aqui apenas o terreno e condições específicas da cena.</p>
    <div className="my-3 flex flex-wrap items-center gap-4 text-sm">
      <label className="flex items-center gap-2"><input type="checkbox" checked={cenario.distancia !== undefined} onChange={(e) => configurar({ cenario: { ...cenario, distancia: e.target.checked ? 1.5 : undefined } })} />Usar distância entre as linhas</label>
      {cenario.distancia !== undefined && <label>Distância inicial (m) <input aria-label="Distância inicial em metros" type="number" min={0} max={1000} step={1.5} value={cenario.distancia} onChange={(e) => configurar({ cenario: { ...cenario, distancia: Math.min(1000, Math.max(0, Number(e.target.value) || 0)) } })} className={`${campo} w-24`} /></label>}
      <label className="flex items-center gap-2"><input type="checkbox" checked={!!cenario.terrenoDificil} onChange={(e) => configurar({ cenario: { ...cenario, terrenoDificil: e.target.checked } })} />Terreno difícil</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={!!cenario.cobertura} onChange={(e) => configurar({ cenario: { ...cenario, cobertura: e.target.checked } })} />Há cobertura para se esconder</label>
    </div>
    <p className="mb-3 text-xs text-parchment-600 dark:text-parchment-400">A distância usa uma linha: mover custa 1 Ação; terreno difícil reduz o deslocamento pela metade. Fluxo exige distância conhecida e adjacência. Sem distância, o combate continua abstrato. Cobertura e geometria de áreas precisam de arbitragem.</p>
    {grupo.map((c) => {
      const pactos = pactosDeCombate(c);
      if (!pactos.length) return null;
      return <fieldset key={`pactos-${c.id}`} className="mb-4 rounded-lg border border-parchment-200 p-3 dark:border-parchment-800">
        <legend className="px-1 text-sm font-semibold">Invocações preparadas · {c.name}</legend>
        <p className="mb-2 text-xs text-parchment-600 dark:text-parchment-400">Pactos já em campo: o preparo desconta PM antes da iniciativa. Cada invocado age com 1 Ação por turno, pode receber dano e desaparece a 0 PV. O dano conta para seu invocador; os PV não inflam a sobrevivência do grupo.</p>
        <div className="space-y-2">{pactos.map((p) => <label key={p.id} className="block text-sm">
          <input className="mr-2" type="checkbox" checked={!!cenario.invocadosPreparados?.[c.id]?.includes(p.id)} onChange={(e) => {
            const atuais = cenario.invocadosPreparados?.[c.id] ?? [];
            configurar({ cenario: { ...cenario, invocadosPreparados: { ...cenario.invocadosPreparados, [c.id]: e.target.checked ? [...atuais, p.id] : atuais.filter((id) => id !== p.id) } } });
          }} />{p.nome} · {p.custo} PM · {p.quantidade} criatura(s), {p.golpes} ataque(s) de {p.dano}
          <span className="mt-1 block text-xs text-parchment-600 dark:text-parchment-400">{p.descricao}</span>
        </label>)}</div>
        <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">A simulação resolve os ataques básicos. Voo, empurrões, veneno secundário, interceptações, evoluções com magia, talentos que alteram a invocação e Chamado de Emergência continuam exigindo resolução na mesa. As descrições acima conservam essas regras para consulta.</p>
      </fieldset>;
    })}
    <div className="space-y-3">{participantes.map((p) => <fieldset key={p.id} className="rounded-lg border border-parchment-200 p-3 dark:border-parchment-800">
      <legend className="px-1 text-sm font-semibold">{p.nome}</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {!p.criatura && cenario.distancia !== undefined && <label>Alcance da arma (m) <input aria-label={`Alcance da arma de ${p.nome}`} type="number" min={0.5} max={1000} step={0.5} value={cenario.participantes?.[p.id]?.alcanceArma ?? 1.5} onChange={(e) => atualizar(p.id, { alcanceArma: Math.min(1000, Math.max(0.5, Number(e.target.value) || 1.5)) })} className={`${campo} w-20`} /></label>}
        {condicoes.filter(([chave]) => chave !== "escondido" || p.criatura).map(([chave, nome]) => <label key={chave} className="flex items-center gap-1.5"><input type="checkbox" checked={!!cenario.participantes?.[p.id]?.[chave]} onChange={(e) => atualizar(p.id, { [chave]: e.target.checked })} />{nome}</label>)}
        {p.ladino && <span className="font-medium text-wine-700 dark:text-wine-300">Abertura furtiva calculada pela ficha</span>}
        {p.agua && <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!cenario.participantes?.[p.id]?.postura} onChange={(e) => atualizar(p.id, { postura: e.target.checked })} />Postura de Água preparada</label>}
        {p.criatura && <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!cenario.criaturasUmPv?.includes(p.id)} onChange={(e) => configurar({ cenario: { ...cenario, criaturasUmPv: e.target.checked ? [...(cenario.criaturasUmPv ?? []), p.id] : cenario.criaturasUmPv?.filter((id) => id !== p.id) } })} />Horda: 1 PV por cópia (variante da mesa)</label>}
      </div>
    </fieldset>)}</div>
  </details>;
}
