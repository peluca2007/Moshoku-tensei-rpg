"use client";

import { useState } from "react";
import { Dices, Download } from "lucide-react";
import { simularEncontro, type CriaturaEncontro, type LogCombate } from "@/lib/encounterSim";
import type { PedidoRelatorio } from "@/lib/encounterReport";
import type { CharacterData } from "@/lib/types";
import ArenaDoReplay from "./ArenaDoReplay";
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

type Elenco = { grupo: CharacterData[]; criaturas: CriaturaEncontro[] };

function Batalha({ log, rotulo, elenco, nova = false }: { log: LogCombate; rotulo: string; elenco: Elenco; nova?: boolean }) {
  const [aberta, setAberta] = useState(nova);
  const [personagem, setPersonagem] = useState("");
  const temArena = !!log.replay?.quadros.length;
  const [modo, setModo] = useState<"arena" | "recibos" | "texto">(temArena ? "arena" : "recibos");
  const eventos = log.eventos ?? [];
  const nomes = [...new Set(eventos.flatMap((e) => [e.atacante, e.alvo]))];
  const filtrados = eventos.filter((e) => !personagem || e.atacante === personagem || e.alvo === personagem);
  const rodadas = [...new Set(filtrados.map((e) => e.rodada ?? 0))];
  const cor = log.resumo.resultado === "tpk" ? "text-rose-700 dark:text-rose-300" : log.resumo.resultado === "empate" ? "text-amber-800 dark:text-amber-200" : "text-emerald-700 dark:text-emerald-300";
  return <details open={aberta} onToggle={(e) => setAberta(e.currentTarget.open)} className="rounded-xl border border-parchment-300 bg-parchment-100/60 dark:border-parchment-800 dark:bg-parchment-900/50">
    <summary className="cursor-pointer p-3 text-sm text-parchment-900 dark:text-parchment-50">
      <span className="mr-2">{rotulo}</span><b className={cor}>{log.categoria}</b>
      <span className="mt-1 block text-xs text-parchment-600 dark:text-parchment-400">{log.motivo} · {log.resumo.rodadas} rodada(s) · semente {log.seed}</span>
    </summary>
    {aberta && <div className="border-t border-parchment-300 p-3 dark:border-parchment-800">
      {temArena && <div role="tablist" aria-label="Como ver a batalha" className="mb-3 flex gap-1 rounded-lg bg-parchment-200/70 p-1 text-xs font-semibold dark:bg-parchment-800/70">
        {([["arena", "Arena 2.5D"], ["recibos", "Recibos"], ["texto", "Texto"]] as const).map(([valor, rotulo]) =>
          <button key={valor} type="button" role="tab" aria-selected={modo === valor} onClick={() => setModo(valor)}
            className={`min-h-9 flex-1 rounded-md px-2 ${modo === valor ? "bg-parchment-50 text-wine-800 shadow-sm dark:bg-parchment-950 dark:text-wine-200" : "text-parchment-700 dark:text-parchment-300"}`}>{rotulo}</button>)}
      </div>}
      {modo === "arena" && temArena ? <ArenaDoReplay log={log} grupo={elenco.grupo} criaturas={elenco.criaturas} tocarAoAbrir={nova} /> : <>
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <label className="text-xs font-semibold text-parchment-700 dark:text-parchment-300">Participante
          <select value={personagem} onChange={(e) => setPersonagem(e.target.value)} className="mt-1 block max-w-full rounded-lg border border-parchment-300 bg-parchment-50 p-2 dark:border-parchment-700 dark:bg-parchment-950">
            <option value="">Todos os participantes</option>{nomes.map((nome) => <option key={nome}>{nome}</option>)}
          </select>
        </label>
        {!temArena && <button type="button" className="rounded-lg border border-parchment-300 px-3 py-2 text-xs dark:border-parchment-700" onClick={() => setModo(modo === "recibos" ? "texto" : "recibos")}>{modo === "recibos" ? "Ver texto completo" : "Ver ataques por rodada"}</button>}
        <button type="button" onClick={() => baixarLog(log)} className="inline-flex items-center gap-1 rounded-lg border border-parchment-300 px-3 py-2 text-xs dark:border-parchment-700"><Download className="h-3.5 w-3.5" /> Baixar batalha</button>
      </div>
      <div className="max-h-[32rem] overflow-y-auto overscroll-contain">
        {modo === "texto" || eventos.length === 0 ? <pre className="whitespace-pre-wrap break-words font-mono text-xs text-parchment-700 dark:text-parchment-300">{personagem && eventos.length ? filtrados.map(formatarEventoAtaque).join("\n\n") : log.linhas.join("\n")}</pre> : rodadas.map((rodada) => <section key={rodada} className="mb-4">
          <h4 className="mb-2 text-sm font-bold text-parchment-900 dark:text-parchment-50">Rodada {rodada}</h4>
          <div className="space-y-2">{filtrados.filter((e) => (e.rodada ?? 0) === rodada).map((evento, i) => <Recibo key={i} evento={evento} />)}</div>
        </section>)}
      </div>
      </>}
    </div>}
  </details>;
}

/**
 * `entrada` é o instantâneo que gerou o relatório. A batalha nova usa ele, e
 * não o que está na tela agora, para sair do mesmo encontro das notáveis.
 */
export default function EncounterCombatLogs({ logs, entrada }: { logs: LogCombate[]; entrada?: PedidoRelatorio }) {
  const [novas, setNovas] = useState<LogCombate[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const elenco = { grupo: entrada?.grupo ?? [], criaturas: entrada?.criaturas ?? [] };
  function sortearBatalha() {
    if (!entrada) return;
    try {
      // Uma batalha só custa milissegundos: não precisa do worker do relatório.
      const semente = Math.floor(Math.random() * 1_000_000_000);
      const { logsExtremos } = simularEncontro(entrada.grupo, entrada.criaturas, {
        ...entrada.configuracao, batalhas: 1, semente, gerarLogs: true,
      });
      const log = logsExtremos?.[0];
      if (!log) return;
      setErro(null);
      setNovas((atuais) => [{ ...log, motivo: "Sorteada agora" }, ...atuais].slice(0, 3));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível simular esta batalha.");
    }
  }
  return <section className="mt-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-bold text-parchment-900 dark:text-parchment-50">Batalhas notáveis ({logs.length})</h3>
      {entrada && <button type="button" onClick={sortearBatalha}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-wine-600 px-3 text-sm font-semibold text-wine-800 hover:bg-wine-50 dark:border-wine-400 dark:text-wine-200 dark:hover:bg-wine-950">
        <Dices className="h-4 w-4" /> Assistir uma batalha nova
      </button>}
    </div>
    {erro && <p role="alert" className="mt-2 text-sm text-rose-700 dark:text-rose-300">{erro}</p>}
    <p className="mt-1 mb-3 text-xs text-parchment-600 dark:text-parchment-400">Abra uma batalha e assista na arena, com os retratos das fichas, ou escolha um participante e confira cada ataque. Os recibos mostram os dados realmente rolados, os bônus e a perda de PV. O texto completo inclui os demais acontecimentos.</p>
    <div className="space-y-2">
      {novas.map((log) => <Batalha key={`nova-${log.seed}`} log={log} rotulo="Nova" elenco={elenco} nova />)}
      {logs.map((log, i) => <Batalha key={log.seed} log={log} rotulo={`#${i + 1}`} elenco={elenco} />)}
    </div>
  </section>;
}
