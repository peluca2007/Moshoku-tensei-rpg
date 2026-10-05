"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MAGIC_ACTIONS } from "@/data/trees/shared";
import { ARQUEARIA_TREE } from "@/data/trees/arquearia";
import { getCondicaoPorId } from "@/data/condicoes";
import { RANK_BONUS, RANKS, type RankName } from "@/lib/types";
import styles from "./DiagramaInterativo.module.css";

export type Demonstracao = "turno" | "quebrantado" | "tiro";
export interface EtapaDeTiro { n: string; nome: string; teste: string; cd: boolean; da: string }

/** A ilustração impressa fica intacta. A mesa interativa abre fora do fluxo paginado. */
export default function DiagramaInterativo({ tipo, children, className, etapas = [], caInicial = 15, acoes = 3 }: {
  tipo: Demonstracao; children: ReactNode; className?: string; etapas?: EtapaDeTiro[]; caInicial?: number; acoes?: number;
}) {
  const [aberto, setAberto] = useState(false);
  const titulos = { turno: "Anatomia do Turno", quebrantado: "Quebrantado Empilha", tiro: "Etapas do Tiro Perfeito" };
  return <>
    <div className={`${className ?? ""} ${styles.interativo}`} role="button" tabIndex={0} aria-label={`Experimentar: ${titulos[tipo]}`} aria-haspopup="dialog"
      title="Toque ou pressione Enter para experimentar passo a passo" onClick={() => setAberto(true)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setAberto(true); } }}>
      {children}
    </div>
    {aberto && createPortal(<Mesa tipo={tipo} titulo={titulos[tipo]} etapas={etapas} caInicial={caInicial} acoes={acoes} fechar={() => setAberto(false)} />, document.body)}
  </>;
}

function Mesa({ tipo, titulo, etapas, caInicial, acoes, fechar }: {
  tipo: Demonstracao; titulo: string; etapas: EtapaDeTiro[]; caInicial: number; acoes: number; fechar: () => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [passo, setPasso] = useState(0);
  const [falhas, setFalhas] = useState<number[]>([]);
  const [gastos, setGastos] = useState<string[]>([]);
  const [rank, setRank] = useState<RankName>("Avançado");
  const custoMagia = MAGIC_ACTIONS.Rei?.normal ?? 0;
  const teto = RANK_BONUS[rank];
  const limite = tipo === "quebrantado" ? teto + 1 : tipo === "tiro" ? etapas.length : custoMagia;
  useEffect(() => { dialogo.current?.showModal(); }, []);
  const reiniciar = () => { setPasso(0); setFalhas([]); setGastos([]); };
  const avancar = (falhou = false) => {
    if (passo >= limite) return;
    if (falhou) setFalhas((anteriores) => [...anteriores.filter((p) => p !== passo), passo]);
    setPasso((p) => p + 1);
  };
  const gastar = (nome: string) => { if (gastos.length < acoes) setGastos((anteriores) => [...anteriores, nome]); };
  const fonteTiro = ARQUEARIA_TREE.ranks[0].mastery?.description;
  const cdPreparacao = fonteTiro?.match(/teste CD (\d+)/)?.[1];
  return <dialog ref={dialogo} className={styles.mesa} aria-labelledby={`mesa-${tipo}`} onCancel={fechar}
    onClick={(e) => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) fechar(); } }}>
    <div className="flex items-start justify-between gap-4">
      <h2 id={`mesa-${tipo}`} className="font-display text-xl font-bold">{titulo}</h2>
      <button type="button" autoFocus onClick={fechar} className={styles.botao} aria-label="Fechar demonstração">Fechar</button>
    </div>
    <p className="my-3 text-sm">Você controla o ritmo. Use Tab para escolher um botão e Enter para avançar.</p>
    {tipo === "turno" && <>
      <div className={styles.quadros} aria-label="Ações deste turno">{Array.from({ length: acoes }, (_, i) => <div key={i} className={styles.quadro} data-ativo={gastos[i] ? "" : undefined}><b>Ação {i + 1}</b><span>{gastos[i] ?? "Disponível"}</span></div>)}</div>
      <div className={styles.controles}>{["Andar", "Atacar", "Conjurar"].map((nome) => <button key={nome} className={styles.botao} disabled={gastos.length >= acoes || (gastos.includes("Conjurar") && nome === "Atacar")} onClick={() => gastar(nome)}>{nome}</button>)}</div>
      <p aria-live="polite">{acoes - gastos.length} Ações disponíveis. A Reação permanece separada.</p>
      <h3 className="mt-5 font-bold">Conjuração Padrão de Rei: {custoMagia} Ações</h3>
      <div className={styles.quadros}>{Array.from({ length: custoMagia }, (_, i) => <div key={i} className={styles.quadro} data-ativo={i < passo ? "" : undefined}><b>Turno {Math.floor(i / acoes) + 1}</b><span>Ação {i % acoes + 1}</span></div>)}</div>
      <p aria-live="polite">{passo === custoMagia ? "Conjuração concluída no segundo turno." : `${passo} de ${custoMagia} Ações investidas na conjuração.`}</p>
      <p className="mt-2 text-sm">Este exemplo usa a Tabela de Tempo de Conjuração do Cap. 2. Uma magia pode declarar um custo próprio. Enquanto conjura, você pode andar com metade do Deslocamento, mas não atacar; gastar a Reação encerra a conjuração. Sofrer dano cobra Concentração.</p>
    </>}
    {tipo === "quebrantado" && <>
      <label className="block my-4">Rank de quem aplica <select className={styles.botao} value={rank} onChange={(e) => { setRank(e.target.value as RankName); reiniciar(); }}>{RANKS.map((r) => <option key={r} value={r}>{r} (+{RANK_BONUS[r]})</option>)}</select></label>
      <div className={styles.quadros}><div className={styles.quadro}><b>Acúmulos</b><span>{Math.min(passo, teto)} / {teto}</span></div><div className={styles.quadro}><b>CA do exemplo</b><span>{caInicial - Math.min(passo, teto)}</span></div><div className={styles.quadro}><b>Dano por ataque</b><span>−{Math.min(passo, teto)}</span></div></div>
      <p aria-live="polite">{passo > teto ? "O próximo acúmulo não entra: o teto foi alcançado." : passo === 0 ? "Alvo intacto." : `Cada ataque do alvo causa ${passo} a menos de dano; sua CA também cai em ${passo}.`}</p>
      <p className="mt-3 text-sm">Exemplo sem a Maestria Nada Segura.</p>
      <p className="mt-2 text-sm">{getCondicaoPorId("quebrantado")?.efeito}</p>
    </>}
    {tipo === "tiro" && <>
      <ol className={styles.quadros}>{etapas.map((etapa, i) => <li key={etapa.n} className={styles.quadro} data-ativo={i < passo ? "" : undefined}><b>{etapa.nome}</b><span>{etapa.teste}{etapa.cd ? ` · CD ${cdPreparacao ?? "ver Maestria"}` : " · CA do alvo"}</span><span>{i >= passo ? "Aguardando" : falhas.includes(i) ? etapa.cd ? "Falhou: bônus perdido" : "Disparo errou" : etapa.da}</span><small>Turno {Math.floor(i / acoes) + 1}</small></li>)}</ol>
      <p aria-live="polite">{passo === etapas.length ? "Disparo resolvido. Uma falha de preparação perde só o bônus daquela etapa." : passo === acoes ? "Fim do primeiro turno. A Solta acontece no seguinte." : passo === 0 ? "Declare o alvo na Corda e comece a preparação." : `${passo} etapas resolvidas. A preparação continua, inclusive depois de falhar.`}</p>
      <details className="mt-4"><summary>Ver a regra completa da Maestria</summary><p className="mt-2 text-sm">{fonteTiro}</p></details>
    </>}
    <div className={styles.controles}>
      <button className={styles.botao} onClick={reiniciar}>Rever</button>
      <button className={styles.botao} disabled={passo === 0} onClick={() => { setPasso((p) => Math.max(0, p - 1)); setFalhas((f) => f.filter((n) => n < passo - 1)); }}>Voltar um passo</button>
      <button className={styles.botao} disabled={passo >= limite} onClick={() => avancar()}>Próximo passo</button>
      {tipo === "tiro" && <button className={styles.botao} disabled={passo >= limite} onClick={() => avancar(true)}>{passo === etapas.length - 1 ? "Errar o disparo" : "Falhar nesta etapa"}</button>}
    </div>
  </dialog>;
}
