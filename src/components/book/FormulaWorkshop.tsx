"use client";

import { useRef, useState, type PointerEvent } from "react";
import {
  criarFormula,
  ESSENCIAS,
  FORMAS,
  GATILHOS,
  MEIOS,
  OPERADORES,
  RANKS_TEORICOS,
  type EssenciaId,
  type FormaId,
  type FormulaEscolha,
  type GatilhoId,
  type MeioId,
  type OperadorId,
  type RankTeorico,
} from "@/lib/magiaTeorica";
import styles from "./FormulaWorkshop.module.css";
import { GlifoComposto, TracoNucleo, TracoOperador, type CamadaDoGlifo } from "./FormulaGlyph";
import { useActiveCharacter } from "@/store/useCharacterStore";
import { avaliarFormulaNaFicha } from "@/lib/simbolosTeoricos";

/**
 * O LABORATÓRIO DE FÓRMULAS, como um GRIMÓRIO aberto (2026-09-26).
 *
 * Pedido do autor: "da um rework geral nele, o estilo não condiz com o
 * livro". Escolha dele entre as opções: o grimório de duas páginas.
 *
 * - Página da esquerda, o ALFABETO: as peças como cartas (núcleo, ações,
 *   forma) e a construção (rank, potência, material, gatilho). Cada peça diz
 *   o rank em que se aprende; dá pra tocar mesmo antes, e a carta explica por
 *   que não sai do papel — é assim que se aprende o limite.
 * - Página da direita, o DESENHO: o círculo sendo traçado, a conta feita na
 *   lousa e a carta pronta, no mesmo formato das cartas do catálogo (Cap. 3).
 *
 * O modo guiado de três passos saiu: quem ensina agora é a Aula da Roxy
 * (Cap. 2, §8). O laboratório é o caderno de exercícios.
 */

const INICIAL: FormulaEscolha = {
  rank: "Principiante",
  potencia: "Principiante",
  essencia: "mana",
  operadores: ["projetar"],
  forma: "circulo",
  meio: "ar",
  gatilho: false,
  condicao: "entrada",
};

const EXEMPLOS: { nome: string; escolha: FormulaEscolha }[] = [
  { nome: "Dardo Arcano", escolha: INICIAL },
  { nome: "Parede de mana", escolha: { ...INICIAL, operadores: ["conter"], forma: "quadrado" } },
  { nome: "Sinal arcano", escolha: { ...INICIAL, operadores: ["expressar"] } },
  { nome: "Onda de fogo", escolha: { ...INICIAL, rank: "Intermediário", potencia: "Intermediário", essencia: "fogo", operadores: ["projetar", "expandir"] } },
];

const DESAFIOS = [
  {
    id: "alcance",
    titulo: "Leve o Dardo a 13,5 m",
    dica: "Mude só o contorno do Dardo Arcano.",
    base: INICIAL,
    certo: (e: FormulaEscolha) => e.essencia === "mana" && e.operadores.join() === "projetar" && e.forma === "linha",
  },
  {
    id: "parede",
    titulo: "Reforce a parede",
    dica: "Mana e Conter já estão inscritos. Escolha a forma.",
    base: { ...INICIAL, operadores: ["conter"] as OperadorId[] },
    certo: (e: FormulaEscolha) => e.essencia === "mana" && e.operadores.join() === "conter" && e.forma === "quadrado",
  },
  {
    id: "sinal",
    titulo: "Avise sem ferir",
    dica: "Mude só a ação sobre Mana.",
    base: INICIAL,
    certo: (e: FormulaEscolha) => e.essencia === "mana" && e.operadores.join() === "expressar" && e.forma === "circulo",
  },
] as const;

/** Onde cada peça se aprende (o livro: Cap. 2, §8, Lição 2). */
const RANK_DA_ACAO: Record<OperadorId, RankTeorico> = {
  projetar: "Principiante",
  expressar: "Principiante",
  conter: "Principiante",
  rejeitar: "Principiante",
  expandir: "Intermediário",
  repetir: "Intermediário",
};
const RANK_DA_FORMA: Record<FormaId, RankTeorico> = {
  circulo: "Principiante",
  quadrado: "Principiante",
  linha: "Principiante",
  triangulo: "Intermediário",
  estrela: "Avançado",
  espiral: "Santo",
};

type Ponto = { x: number; y: number };
type Traco = Ponto[];
const fixar = (numero: number) => Math.round(numero * 1000) / 1000;
const acima = (a: RankTeorico, b: RankTeorico) => RANKS_TEORICOS.indexOf(a) > RANKS_TEORICOS.indexOf(b);

function contorno(forma: FormaId) {
  switch (forma) {
    case "circulo": return <circle cx="260" cy="260" r="166" />;
    case "triangulo": return <polygon points="260,82 444,412 76,412" />;
    case "quadrado": return <rect x="96" y="96" width="328" height="328" rx="7" />;
    case "linha": return <path d="M75 260H445M75 240L75 280M445 240L445 280" />;
    case "espiral": return <path d="M259 260c-34-34-80 14-47 47 49 49 133-26 77-89-79-86-225 21-143 125 111 136 326-6 213-154-150-195-436 2-281 207" />;
    case "estrela": return <polygon points="260,71 310,197 445,197 340,280 380,410 260,329 140,410 180,280 75,197 210,197" />;
  }
}

function pontoDoEvento(evento: PointerEvent<SVGSVGElement>): Ponto {
  const area = evento.currentTarget.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(520, ((evento.clientX - area.left) / area.width) * 520)),
    y: Math.max(0, Math.min(520, ((evento.clientY - area.top) / area.height) * 520)),
  };
}

export default function FormulaWorkshop() {
  const personagem = useActiveCharacter();
  const [escolha, setEscolha] = useState<FormulaEscolha>(INICIAL);
  const [desafio, setDesafio] = useState<(typeof DESAFIOS)[number]["id"] | null>(null);
  const [tracando, setTracando] = useState(false);
  const [tracos, setTracos] = useState<Traco[]>([]);
  const [camada, setCamada] = useState<CamadaDoGlifo>("todas");
  const desenhando = useRef(false);
  const r = criarFormula(escolha);
  const essencia = ESSENCIAS[escolha.essencia];
  const potencia = escolha.potencia ?? escolha.rank;
  const acessoDaFicha = personagem.id === "__none__"
    ? ["Crie ou selecione uma ficha pra conferir o que o seu personagem já sabe desenhar."]
    : avaliarFormulaNaFicha(personagem, escolha);
  const desafioAtual = DESAFIOS.find((d) => d.id === desafio);

  function mudar(nova: FormulaEscolha) {
    setEscolha(nova);
    setCamada("todas");
  }

  function carregar(nova: FormulaEscolha, idDoDesafio: (typeof DESAFIOS)[number]["id"] | null = null) {
    mudar({ ...nova, operadores: [...nova.operadores] });
    setTracos([]);
    setDesafio(idDoDesafio);
  }

  function alternarAcao(id: OperadorId) {
    const atual = escolha.operadores;
    mudar({ ...escolha, operadores: atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id] });
  }

  function iniciarTraco(evento: PointerEvent<SVGSVGElement>) {
    if (!tracando) return;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    desenhando.current = true;
    setTracos((atual) => [...atual, [pontoDoEvento(evento)]]);
  }

  function moverTraco(evento: PointerEvent<SVGSVGElement>) {
    if (!desenhando.current || !tracando) return;
    const ponto = pontoDoEvento(evento);
    setTracos((atual) => atual.map((t, i) => (i === atual.length - 1 ? [...t, ponto] : t)));
  }

  function terminarTraco() {
    desenhando.current = false;
  }

  // A conta da lousa: cada parcela com o total correndo.
  const valores = r.conta.map((parcela) => Number(parcela.match(/(\d+)$/)?.[1] ?? 0));
  const linhasDaConta = r.conta.map((parcela, i) => ({
    nome: parcela.replace(/\s*\d+$/, ""),
    valor: valores[i],
    total: valores.slice(0, i + 1).reduce((a, b) => a + b, 0),
  }));

  return (
    <div className={styles.grimorio} style={{ ["--essencia" as string]: essencia.cor }}>
      {/* ── A página do alfabeto ─────────────────────────────────────── */}
      <section className={styles.pagina} aria-label="As peças da fórmula">
        <header className={styles.cabeca}>
          <p className={styles.selo}>Laboratório de Fórmulas</p>
          <h4>Escreva uma frase em magia</h4>
        </header>

        <div className={styles.fita} aria-label="Exemplos e desafios">
          <span className={styles.fitaRotulo}>Comece por</span>
          {EXEMPLOS.map((ex) => (
            <button key={ex.nome} type="button" onClick={() => carregar(ex.escolha)}>
              {ex.nome}
            </button>
          ))}
          <span className={styles.fitaRotulo}>Desafios</span>
          {DESAFIOS.map((d) => (
            <button key={d.id} type="button" aria-pressed={desafio === d.id} onClick={() => carregar(d.base, d.id)}>
              {d.titulo}
            </button>
          ))}
        </div>
        {desafioAtual && (
          <p className={styles.desafio} aria-live="polite">
            {r.valida && desafioAtual.certo(escolha) ? `Conseguiu! ${r.nome}: ${r.pm} PM.` : desafioAtual.dica}
          </p>
        )}

        <fieldset className={styles.bloco}>
          <legend><span>1</span> Núcleo — o que existe</legend>
          <div className={styles.cartas}>
            {(Object.keys(ESSENCIAS) as EssenciaId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={styles.carta}
                aria-pressed={escolha.essencia === id}
                onClick={() => mudar({ ...escolha, essencia: id })}
                title={ESSENCIAS[id].origem}
                style={{ ["--peca" as string]: ESSENCIAS[id].cor }}
              >
                <svg viewBox="-100 -100 200 200" aria-hidden="true"><TracoNucleo id={id} /></svg>
                <strong>{ESSENCIAS[id].nome}</strong>
                <small>{ESSENCIAS[id].custo} PM</small>
              </button>
            ))}
          </div>
          <p className={styles.origem}><b>{essencia.nome}:</b> {essencia.origem}.</p>
        </fieldset>

        <fieldset className={styles.bloco}>
          <legend><span>2</span> Ações — o que acontece</legend>
          <div className={styles.cartas}>
            {(Object.keys(OPERADORES) as OperadorId[]).map((id) => {
              const ordem = escolha.operadores.indexOf(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={styles.carta}
                  aria-pressed={ordem >= 0}
                  onClick={() => alternarAcao(id)}
                  title={OPERADORES[id].papel}
                >
                  {ordem >= 0 && <span className={styles.ordem}>{ordem + 1}</span>}
                  <svg viewBox="-100 -100 200 200" aria-hidden="true"><TracoOperador id={id} /></svg>
                  <strong>{OPERADORES[id].nome}</strong>
                  <small>+{OPERADORES[id].custo} PM{RANK_DA_ACAO[id] !== "Principiante" ? ` · ${RANK_DA_ACAO[id]}` : ""}</small>
                </button>
              );
            })}
          </div>
          <p className={styles.origem}>A ordem em que você marca é a ordem escrita no desenho: os números nas cartas.</p>
        </fieldset>

        <fieldset className={styles.bloco}>
          <legend><span>3</span> Forma — o contorno</legend>
          <div className={styles.cartas}>
            {(Object.keys(FORMAS) as FormaId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={styles.carta}
                aria-pressed={escolha.forma === id}
                onClick={() => mudar({ ...escolha, forma: id })}
                title={FORMAS[id].efeito}
              >
                <span className={styles.glifoDaForma} aria-hidden="true">{FORMAS[id].glifo}</span>
                <strong>{FORMAS[id].nome}</strong>
                <small>{FORMAS[id].custo} PM{RANK_DA_FORMA[id] !== "Principiante" ? ` · ${RANK_DA_FORMA[id]}` : ""}</small>
              </button>
            ))}
          </div>
          <p className={styles.origem}><b>{FORMAS[escolha.forma].nome}:</b> {FORMAS[escolha.forma].efeito}</p>
        </fieldset>

        <fieldset className={styles.bloco}>
          <legend><span>4</span> Construção</legend>
          <div className={styles.campos}>
            <label>
              Seu rank na Teórica
              <select
                value={escolha.rank}
                onChange={(ev) => {
                  const rank = ev.target.value as RankTeorico;
                  mudar({ ...escolha, rank, potencia: acima(potencia, rank) ? rank : potencia });
                }}
              >
                {RANKS_TEORICOS.map((rank) => <option key={rank} value={rank}>{rank}</option>)}
              </select>
            </label>
            <label>
              Potência
              <select value={potencia} onChange={(ev) => mudar({ ...escolha, potencia: ev.target.value as RankTeorico })}>
                {RANKS_TEORICOS.filter((rank) => !acima(rank, escolha.rank)).map((rank) => <option key={rank} value={rank}>{rank}</option>)}
              </select>
            </label>
            <label>
              Desenhada em
              <select value={escolha.meio} onChange={(ev) => mudar({ ...escolha, meio: ev.target.value as MeioId })}>
                {(Object.keys(MEIOS) as MeioId[]).map((id) => <option key={id} value={id}>{MEIOS[id].nome}</option>)}
              </select>
            </label>
            <label className={styles.marca}>
              <input type="checkbox" checked={escolha.gatilho} onChange={(ev) => mudar({ ...escolha, gatilho: ev.target.checked })} />
              Gatilho (+2 PM, Avançado)
            </label>
            {escolha.gatilho && (
              <label>
                Dispara quando
                <select value={escolha.condicao} onChange={(ev) => mudar({ ...escolha, condicao: ev.target.value as GatilhoId })}>
                  {(Object.keys(GATILHOS) as GatilhoId[]).filter((id) => id !== "quebra").map((id) => <option key={id} value={id}>{GATILHOS[id]}</option>)}
                </select>
              </label>
            )}
          </div>
          <p className={styles.origem}>O rank limita o tamanho do desenho; a potência, a força da saída. O material muda o preparo e a duração.</p>
        </fieldset>
      </section>

      {/* ── A página do desenho ──────────────────────────────────────── */}
      <section className={`${styles.pagina} ${styles.paginaDireita}`} aria-label="O desenho e a carta">
        <div className={styles.bancada}>
        <div className={styles.desenho}>
        <div className={styles.circuloTopo}>
          <p className={styles.selo}>O desenho</p>
          <button type="button" aria-pressed={tracando} onClick={() => { setTracando(!tracando); terminarTraco(); }}>
            {tracando ? "Terminar o traço" : "Traçar à mão"}
          </button>
        </div>
        <svg
          className={`${styles.circulo} ${tracando ? styles.tracando : ""}`}
          viewBox="0 0 520 520"
          role="img"
          aria-label={`Fórmula de ${essencia.nome} com ${escolha.operadores.map((id) => OPERADORES[id].nome).join(", ") || "nenhuma ação"} em ${FORMAS[escolha.forma].nome}`}
          onPointerDown={iniciarTraco}
          onPointerMove={moverTraco}
          onPointerUp={terminarTraco}
          onPointerCancel={terminarTraco}
        >
          <defs>
            <radialGradient id="grimorio-vazio"><stop offset="0" stopColor="#1f2229" /><stop offset=".65" stopColor="#15161b" /><stop offset="1" stopColor="#0c0c0f" /></radialGradient>
            <filter id="grimorio-brilho"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <circle cx="260" cy="260" r="258" fill="url(#grimorio-vazio)" />
          <circle cx="260" cy="260" r="232" fill="none" className={styles.anel} strokeOpacity=".3" strokeWidth="2" />
          <circle cx="260" cy="260" r="215" fill="none" className={styles.anel} strokeOpacity=".45" strokeWidth="1" strokeDasharray="2 8" />
          {Array.from({ length: 32 }, (_, i) => {
            const a = (i / 32) * Math.PI * 2;
            return (
              <line key={i} x1={fixar(260 + Math.cos(a) * 223)} y1={fixar(260 + Math.sin(a) * 223)} x2={fixar(260 + Math.cos(a) * (i % 4 ? 232 : 241))} y2={fixar(260 + Math.sin(a) * (i % 4 ? 232 : 241))} className={styles.anel} strokeOpacity={i % 4 ? 0.35 : 0.75} strokeWidth={i % 4 ? 1 : 2} />
            );
          })}
          <g stroke={essencia.cor} strokeWidth="4" fill="none" filter="url(#grimorio-brilho)">{contorno(escolha.forma)}</g>
          <g transform="translate(260 260) scale(1.32)" className={styles.glifo}><GlifoComposto essencia={escolha.essencia} operadores={escolha.operadores} camada={camada} /></g>
          {escolha.gatilho && <text x="260" y="400" textAnchor="middle" className={styles.gatilho}>✦ GATILHO ✦</text>}
          {tracos.map((t, i) => <polyline key={i} points={t.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#fff0ca" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#grimorio-brilho)" />)}
        </svg>
        <div className={styles.camadas} aria-label="Destacar uma camada do símbolo">
          <button type="button" aria-pressed={camada === "todas"} onClick={() => setCamada("todas")}>Tudo</button>
          <button type="button" aria-pressed={camada === "nucleo"} onClick={() => setCamada("nucleo")}>{essencia.nome}</button>
          {escolha.operadores.map((id, i) => (
            <button type="button" key={id} aria-pressed={camada === id} onClick={() => setCamada(id)}>{i + 1}. {OPERADORES[id].nome}</button>
          ))}
          {tracos.length > 0 && <button type="button" onClick={() => setTracos([])}>Apagar traços</button>}
        </div>
        </div>

        <div className={styles.lousa}>
          <p className={styles.lousaTitulo}>A conta</p>
          <table>
            <tbody>
              {linhasDaConta.map((l, i) => (
                <tr key={i}>
                  <td>{l.nome}</td>
                  <td>{i === 0 ? l.valor : `+ ${l.valor}`}</td>
                  <td>= {l.total}</td>
                </tr>
              ))}
              <tr className={styles.lousaTotal}>
                <td>Total</td>
                <td />
                <td>{r.pm} PM</td>
              </tr>
            </tbody>
          </table>
          <p className={styles.lousaTetos}>
            <span className={r.simbolos > r.limiteSimbolos ? styles.estourou : undefined}>{r.simbolos}/{r.limiteSimbolos} símbolos</span>
            <span className={r.pm > r.limitePm ? styles.estourou : undefined}>teto de {r.limitePm} PM</span>
            <span>preparo: {r.preparo}</span>
          </p>
        </div>
        </div>

        {r.valida ? (
          <article className={styles.cartaPronta} aria-live="polite">
            <p className={styles.cartaNome}>{r.nome}</p>
            <p className={styles.cartaMeta}>— Fórmula · {r.pm} PM · potência {r.potencia}</p>
            <p className={styles.cartaLinha}>Alcance: {r.alcance} · Área: {r.area} · Duração: {r.duracao}</p>
            <p className={styles.cartaEfeito}>{r.resumo}</p>
            {r.dano && <p className={styles.cartaLinha}><b>{r.tipo === "cura" ? "Cura" : "Dano"}:</b> {r.dano}{r.tipo && r.tipo !== "cura" ? ` (${r.tipo})` : ""}</p>}
            {r.pv !== null && <p className={styles.cartaLinha}><b>Estrutura:</b> {r.pv} PV</p>}
            {r.bloqueio && <p className={styles.cartaLinha}><b>Bloqueia:</b> {r.bloqueio}.</p>}
            {r.efeitoDaEssencia && <p className={styles.cartaLinha}><b>Ao contato:</b> {r.efeitoDaEssencia}</p>}
            {r.resolucao && <p className={styles.cartaLinha}><b>Como resolver:</b> {r.resolucao}</p>}
            {r.reservaPm !== null && <p className={styles.cartaLinha}><b>Reserva da espiral:</b> {r.reservaPm} PM</p>}
            <p className={styles.cartaFormas}>
              <span><small>Ativação</small>{r.ativacao}</span>
              <span><small>Preparo</small>{r.preparo}</span>
            </p>
            <p className={styles.cartaLeitura}>{r.leitura}</p>
          </article>
        ) : (
          <div className={styles.naoSai} aria-live="polite">
            <p className={styles.naoSaiTitulo}>Por que não sai do papel</p>
            <ul>{r.erros.map((erro) => <li key={erro}>{erro}</li>)}</ul>
          </div>
        )}

        <p className={styles.ficha}>
          <b>{personagem.id === "__none__" ? "Pra usar em jogo:" : `Na ficha de ${personagem.name}:`}</b>{" "}
          {acessoDaFicha.length === 0 ? "você já tem o rank e conhece todos os símbolos deste desenho." : acessoDaFicha.join(" ")}
        </p>
      </section>
    </div>
  );
}
