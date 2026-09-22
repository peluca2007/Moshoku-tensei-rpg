"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import type { LogCombate } from "@/lib/encounterSim";
import { formatarEventoAtaque, formatarRolagemDados, type EventoAtaque } from "@/lib/combatTrace";

function baixarLog(log: LogCombate) {
  const blob = new Blob([`Batalha · semente ${log.seed}\n${log.motivo}\n\n${log.linhas.join("\n")}`], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `batalha-${log.seed}.txt`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Recibo({ evento }: { evento: EventoAtaque }) {
  const dano = evento.aplicacao?.perdaPv ?? 0;
  return <details className="rounded-lg border border-parchment-300 bg-parchment-50 p-3 dark:border-parchment-700 dark:bg-parchment-950">
    <summary className="cursor-pointer text-sm text-parchment-900 dark:text-parchment-50">
      <b>{evento.atacante}</b> · {evento.acao} → {evento.alvo}
      <span className="ml-2 font-semibold">{!evento.acertou ? "Errou" : `${evento.critico ? "Crítico · " : ""}${dano} PV perdidos`}</span>
    </summary>
    <div className="mt-3 space-y-2 text-xs text-parchment-700 dark:text-parchment-300">
      {evento.teste && <p><b>{evento.teste.tipo === "ataque" ? "Acerto" : "Resistência"}:</b> d20 [{evento.teste.dados.join(", ")}] {evento.teste.ajuste !== "normal" && `(${evento.teste.ajuste})`} + {evento.teste.bonus} = {evento.teste.total} contra {evento.teste.tipo === "ataque" ? "CA" : "CD"} {evento.teste.defesa}.</p>}
      {evento.arma && <p><b>Arma:</b> {evento.arma.nome} · {evento.arma.baseDie} → {evento.arma.escalatedDie} · {evento.arma.steps} degrau(s).</p>}
      {evento.parcelas.map((p, i) => <p key={i}><b>{p.origem}:</b> <span className="font-mono">{formatarRolagemDados(p.rolagem)}</span></p>)}
      <p>Bônus fixo: {evento.bonusDano}. Dano bruto: {evento.bruto}. Após modificadores: {evento.aposModificadores}.</p>
      {evento.aplicacao && <p>Após resistências: {evento.aplicacao.aposResistencia}. PV temporários absorveram {evento.aplicacao.absorvidoTemporario}. <b>Perda real: {evento.aplicacao.perdaPv} PV.</b></p>}
      {evento.notas.map((nota, i) => <p key={i}>{nota}</p>)}
    </div>
  </details>;
}

function Batalha({ log, indice }: { log: LogCombate; indice: number }) {
  const [aberta, setAberta] = useState(false);
  const [personagem, setPersonagem] = useState("");
  const [modo, setModo] = useState<"recibos" | "texto">("recibos");
  const eventos = log.eventos ?? [];
  const nomes = [...new Set(eventos.flatMap((e) => [e.atacante, e.alvo]))];
  const filtrados = eventos.filter((e) => !personagem || e.atacante === personagem || e.alvo === personagem);
  const rodadas = [...new Set(filtrados.map((e) => e.rodada ?? 0))];
  const cor = log.resumo.resultado === "tpk" ? "text-rose-700 dark:text-rose-300" : log.resumo.resultado === "empate" ? "text-amber-800 dark:text-amber-200" : "text-emerald-700 dark:text-emerald-300";
  return <details onToggle={(e) => setAberta(e.currentTarget.open)} className="rounded-xl border border-parchment-300 bg-parchment-100/60 dark:border-parchment-800 dark:bg-parchment-900/50">
    <summary className="cursor-pointer p-3 text-sm text-parchment-900 dark:text-parchment-50">
      <span className="mr-2">#{indice + 1}</span><b className={cor}>{log.categoria}</b>
      <span className="mt-1 block text-xs text-parchment-600 dark:text-parchment-400">{log.motivo} · {log.resumo.rodadas} rodada(s) · semente {log.seed}</span>
    </summary>
    {aberta && <div className="border-t border-parchment-300 p-3 dark:border-parchment-800">
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <label className="text-xs font-semibold text-parchment-700 dark:text-parchment-300">Participante
          <select value={personagem} onChange={(e) => setPersonagem(e.target.value)} className="mt-1 block max-w-full rounded-lg border border-parchment-300 bg-parchment-50 p-2 dark:border-parchment-700 dark:bg-parchment-950">
            <option value="">Todos os participantes</option>{nomes.map((nome) => <option key={nome}>{nome}</option>)}
          </select>
        </label>
        <button type="button" className="rounded-lg border border-parchment-300 px-3 py-2 text-xs dark:border-parchment-700" onClick={() => setModo(modo === "recibos" ? "texto" : "recibos")}>{modo === "recibos" ? "Ver texto completo" : "Ver ataques por rodada"}</button>
        <button type="button" onClick={() => baixarLog(log)} className="inline-flex items-center gap-1 rounded-lg border border-parchment-300 px-3 py-2 text-xs dark:border-parchment-700"><Download className="h-3.5 w-3.5" /> Baixar batalha</button>
      </div>
      <div className="max-h-[32rem] overflow-y-auto overscroll-contain">
        {modo === "texto" || eventos.length === 0 ? <pre className="whitespace-pre-wrap break-words font-mono text-xs text-parchment-700 dark:text-parchment-300">{personagem && eventos.length ? filtrados.map(formatarEventoAtaque).join("\n\n") : log.linhas.join("\n")}</pre> : rodadas.map((rodada) => <section key={rodada} className="mb-4">
          <h4 className="mb-2 text-sm font-bold text-parchment-900 dark:text-parchment-50">Rodada {rodada}</h4>
          <div className="space-y-2">{filtrados.filter((e) => (e.rodada ?? 0) === rodada).map((evento, i) => <Recibo key={i} evento={evento} />)}</div>
        </section>)}
      </div>
    </div>}
  </details>;
}

export default function EncounterCombatLogs({ logs }: { logs: LogCombate[] }) {
  return <section className="mt-6">
    <h3 className="font-bold text-parchment-900 dark:text-parchment-50">Batalhas notáveis ({logs.length})</h3>
    <p className="mt-1 mb-3 text-xs text-parchment-600 dark:text-parchment-400">Abra uma batalha, escolha um participante e confira cada ataque. Os recibos mostram os dados realmente rolados, os bônus e a perda de PV. O texto completo inclui os demais acontecimentos.</p>
    <div className="space-y-2">{logs.map((log, i) => <Batalha key={log.seed} log={log} indice={i} />)}</div>
  </section>;
}
