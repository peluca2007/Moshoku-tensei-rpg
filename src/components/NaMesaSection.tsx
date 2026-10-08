"use client";
import { useState } from "react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { mesaDa, fioDaVida, hpAtualNaMesa, type Mesa } from "@/lib/mesa";
import { CICATRIZES, EXAUSTAO } from "@/data/marcadoresDaMesa";
import { limitesDaFicha } from "@/lib/limitesDeUso";
import { rollFormula } from "@/lib/rollEngine";
import UsosDaCarta from "./UsosDaCarta";
const campo = "min-h-10 rounded border border-parchment-400 bg-parchment-50 p-2 text-parchment-900 dark:border-parchment-600 dark:bg-parchment-900 dark:text-parchment-100";
export default function NaMesaSection() {
    const c = useActiveCharacter(), m = mesaDa(c), fio = fioDaVida(c), zero = hpAtualNaMesa(c) === 0;
    const marcado = zero || m.exaustao > 0 || m.marcas > 0 || m.estabilizado || m.salvacoes > 0 || m.trauma > 0 || m.cicatrizes.length > 0 || Object.values(m.usos).some(n => n > 0);
    const [estado, setEstado] = useState({ marcado, aberto: marcado }), [anuncio, setAnuncio] = useState("");
    if (estado.marcado !== marcado)
        setEstado({ marcado, aberto: marcado || estado.aberto });
    function salvar(patch: Partial<Mesa>, texto: string) { useCharacterStore.getState().setMesa(patch); setAnuncio(texto); }
    function numero(nome: string, chave: "exaustao" | "marcas" | "salvacoes" | "trauma", max: number) {
        return <label className="flex min-w-0 flex-col gap-1">{nome}<input className={campo} type="number" min={0} max={max} value={m[chave]} onChange={e => salvar({ [chave]: Number(e.target.value) }, `${nome}: ${e.target.value}`)}/></label>;
    }
    function cicatriz(n: number) { salvar({ cicatrizes: [...m.cicatrizes, n] }, CICATRIZES[n - 1][1]); }
    return <details data-na-mesa open={estado.aberto} onToggle={e => setEstado({ marcado, aberto: e.currentTarget.open })} className="surface rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 text-sm text-parchment-800 dark:border-parchment-700 dark:bg-parchment-900/60 dark:text-parchment-100">
    <summary className="min-h-10 cursor-pointer font-semibold">Na mesa{marcado ? " · marcadores ativos" : ""}</summary>
    <div className="space-y-4 pt-3">
      <div className="flex flex-wrap gap-2">{(["combate", "sessao"] as const).map(periodo => <button type="button" className={campo} key={periodo} onClick={() => { useCharacterStore.getState().novoPeriodo(periodo); setAnuncio(periodo === "combate" ? "Novo combate: usos de combate e Salvações zerados." : "Nova sessão: usos de sessão zerados."); }}>{periodo === "combate" ? "Novo combate" : "Nova sessão"}</button>)}</div>
      <div className="grid grid-cols-2 gap-3">{numero("Exaustão", "exaustao", 6)}{numero("Salvações do combate", "salvacoes", 2)}{numero("Trauma", "trauma", 999)}</div>
      {m.exaustao > 0 && <ul className="list-disc space-y-1 pl-4">{EXAUSTAO.slice(0, m.exaustao).map(([nivel, texto]) => <li key={nivel}>{nivel}. {texto}</li>)}</ul>}
      {m.exaustao >= 6 && <p>Ao passar do Nível 5 para o Nível 6, faça um teste de resistência de Vigor CD 15. Se passar, fica no Nível 5. Consulte Cap. 4, §9.</p>}
      {m.trauma > 0 && <p>Desvantagem nas perícias sociais — Persuasão, Lábia, Atuação e Enganação — feitas fora de combate.</p>}
      {m.trauma >= 3 && <p>Ao fazer um Descanso Longo, role 1d20; com 5 ou menos, você recupera só metade dos seus PM e PP.</p>}
      {(zero || m.marcas > 0 || m.estabilizado) && <fieldset className="space-y-2 rounded border border-parchment-400 p-3 dark:border-parchment-600"><legend>Fio da Vida</legend>
        <div className="grid grid-cols-2 gap-3">{numero("Marcas da Morte", "marcas", 3)}<label className="flex flex-col gap-1">Quem derrubou<select className={campo} value={m.responsavel} onChange={e => salvar({ responsavel: Number(e.target.value) }, "CD do Fio da Vida atualizada.")}><option value={0}>Sem responsável · CD 10</option>{[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>Rank +{n} · CD {8 + n}</option>)}</select></label></div>
        <label className="flex min-h-10 items-center gap-2"><input type="checkbox" checked={m.estabilizado} onChange={e => salvar({ estabilizado: e.target.checked }, e.target.checked ? "Estabilizado" : "Não estabilizado")}/>Estabilizado</label>
        <p>1d20 + Vigor ({fio.vigor}) + metade do maior Bônus de Rank ({fio.metade}) = 1d20 {fio.bonus >= 0 ? "+" : ""}{fio.bonus} contra CD {fio.cd}. {fio.desvantagem ? "Desvantagem. " : ""}Falha Crítica: {fio.critico} Natural.</p>
        {m.marcas >= 3 ? <p>Se acumular 3 Marcas da Morte, você morre permanentemente.</p> : m.estabilizado ? <p>Sucesso: você fica Estabilizado — para de rolar o Fio da Vida e acorda com 1 PV em 1d4 horas, ou na hora com qualquer cura.</p> : <p>Falha: você recebe 1 Marca da Morte. Falha Crítica: você recebe 2 Marcas da Morte.</p>}
      </fieldset>}
      <fieldset className="space-y-2"><legend className="font-semibold">Cicatrizes</legend><label className="flex flex-col gap-1">Escolher cicatriz<select className={campo} value="" onChange={e => { if (e.target.value)
        cicatriz(Number(e.target.value)); }}><option value="">Escolher da tabela d12…</option>{CICATRIZES.map(([n, t]) => <option key={n} value={n}>{n}. {t.split(":")[0]}</option>)}</select></label>
        <button className={campo} type="button" onClick={() => cicatriz(rollFormula("1d12").total)}>Sortear cicatriz · 1d12</button>
        {m.cicatrizes.map((n, i) => <div key={`${n}:${i}`} className="rounded border border-parchment-400 p-2 dark:border-parchment-600"><p>{n <= 7 ? "Menor" : "Ferimento Crítico"} · {CICATRIZES[n - 1][1]}</p><button type="button" className={campo} aria-label={`Remover cicatriz ${CICATRIZES[n - 1][1].split(":")[0]}, ${i + 1}`} onClick={() => salvar({ cicatrizes: m.cicatrizes.filter((_, j) => i !== j) }, "Cicatriz removida.")}>Remover</button></div>)}
      </fieldset>
      {limitesDaFicha(c).filter(e => e.limite).map(e => <UsosDaCarta key={e.chave} chave={e.chave}/>)}
      <p role="status" aria-live="polite" className="sr-only">{anuncio}</p>
    </div>
  </details>;
}
