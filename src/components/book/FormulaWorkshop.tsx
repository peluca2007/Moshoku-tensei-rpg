"use client";

import { useRef, useState, type PointerEvent } from "react";
import {
  criarFormula,
  ESSENCIAS,
  FORMAS,
  GATILHOS,
  MEIOS,
  RANKS_TEORICOS,
  VERBOS,
  type EssenciaId,
  type FormaId,
  type FormulaEscolha,
  type GatilhoId,
  type MeioId,
  type RankTeorico,
  type VerboId,
} from "@/lib/magiaTeorica";
import styles from "./FormulaWorkshop.module.css";
import { GlifoComposto, TracoNucleo, TracoOperador, type CamadaDoGlifo } from "./FormulaGlyph";
import { useActiveCharacter } from "@/store/useCharacterStore";
import { avaliarFormulaNaFicha } from "@/lib/simbolosTeoricos";

/**
 * O LABORATÓRIO DE FÓRMULAS, como um GRIMÓRIO aberto (2026-09-26).
 *
 * - Página da esquerda, as PALAVRAS: essência, verbo (até dois), forma, e a
 *   potência e onde se desenha. Cada palavra diz o rank em que se aprende; dá
 *   pra tocar mesmo antes, e a carta explica por que não sai do papel.
 * - Página da direita, o DESENHO: o círculo sendo traçado, a conta na lousa
 *   (potência + 1 por palavra) e a carta pronta, no formato do catálogo.
 *
 * Desde "três palavras e uma conta" a ordem dos verbos não importa, e não há
 * mais teto de símbolos nem de PM por célula: a conta é uma linha só.
 */

const INICIAL: FormulaEscolha = {
  rank: "Principiante",
  essencia: "mana",
  verbos: ["lancar"],
  forma: "circulo",
  meio: "ar",
  armada: false,
  gatilho: "entrada",
};

const EXEMPLOS: { nome: string; escolha: FormulaEscolha }[] = [
  { nome: "Dardo Arcano", escolha: INICIAL },
  { nome: "Parede de mana", escolha: { ...INICIAL, verbos: ["erguer"], forma: "quadrado" } },
  { nome: "Sinal arcano", escolha: { ...INICIAL, verbos: ["sinalizar"] } },
  { nome: "Onda de fogo", escolha: { ...INICIAL, rank: "Intermediário", essencia: "fogo", forma: "onda" } },
  { nome: "Égide", escolha: { ...INICIAL, rank: "Avançado", verbos: ["erguer", "selar"] } },
];

const DESAFIOS = [
  {
    id: "alcance",
    titulo: "Leve o Dardo a 13,5 m",
    dica: "Mude só a forma do Dardo Arcano.",
    base: INICIAL,
    certo: (e: FormulaEscolha) => e.essencia === "mana" && e.verbos.join() === "lancar" && e.forma === "linha",
  },
  {
    id: "parede",
    titulo: "Reforce a parede",
    dica: "Mana e Erguer já estão escritos. Escolha a forma.",
    base: { ...INICIAL, verbos: ["erguer"] as VerboId[] },
    certo: (e: FormulaEscolha) => e.essencia === "mana" && e.verbos.join() === "erguer" && e.forma === "quadrado",
  },
  {
    id: "sinal",
    titulo: "Avise sem ferir",
    dica: "Troque só o verbo.",
    base: INICIAL,
    certo: (e: FormulaEscolha) => e.essencia === "mana" && e.verbos.join() === "sinalizar" && e.forma === "circulo",
  },
] as const;

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
    case "onda": return <g><circle cx="260" cy="260" r="130" /><circle cx="260" cy="260" r="170" strokeDasharray="10 12" /><circle cx="260" cy="260" r="205" strokeDasharray="4 16" /></g>;
    case "eco": return <g><circle cx="260" cy="260" r="166" /><circle cx="260" cy="260" r="186" /></g>;
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
    mudar({ ...nova, verbos: [...nova.verbos] });
    setTracos([]);
    setDesafio(idDoDesafio);
  }

  /** Um verbo; tocar num segundo o acrescenta (Avançado), e um terceiro troca o segundo. */
  function alternarVerbo(id: VerboId) {
    const atual = escolha.verbos;
    const verbos = atual.includes(id)
      ? atual.filter((x) => x !== id)
      : atual.length < 2 ? [...atual, id] : [atual[0], id];
    mudar({ ...escolha, verbos });
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
      {/* ── A página das palavras ────────────────────────────────────── */}
      <section className={styles.pagina} aria-label="As palavras da fórmula">
        <header className={styles.cabeca}>
          <p className={styles.selo}>Laboratório de Fórmulas</p>
          <h4>Três palavras e uma conta</h4>
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
          <legend><span>1</span> Essência — o que existe</legend>
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
                <small>{id === "mana" ? "básica" : "+1 PM"}</small>
              </button>
            ))}
          </div>
          <p className={styles.origem}><b>{essencia.nome}:</b> {essencia.origem}.</p>
        </fieldset>

        <fieldset className={styles.bloco}>
          <legend><span>2</span> Verbo — o que acontece</legend>
          <div className={styles.cartas}>
            {(Object.keys(VERBOS) as VerboId[]).map((id) => {
              const ordem = escolha.verbos.indexOf(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={styles.carta}
                  aria-pressed={ordem >= 0}
                  onClick={() => alternarVerbo(id)}
                  title={VERBOS[id].papel}
                >
                  {ordem === 1 && <span className={styles.ordem}>2</span>}
                  <svg viewBox="-100 -100 200 200" aria-hidden="true"><TracoOperador id={id} /></svg>
                  <strong>{VERBOS[id].nome}</strong>
                  <small>{ordem === 1 ? "+1 PM · Avançado" : "básico"}</small>
                </button>
              );
            })}
          </div>
          <p className={styles.origem}>Um verbo; um segundo, a partir do Avançado, custa +1 PM. A ordem não importa.</p>
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
                <small>{id === "circulo" ? "básica" : "+1 PM"}{FORMAS[id].desde !== "Principiante" ? ` · ${FORMAS[id].desde}` : ""}</small>
              </button>
            ))}
          </div>
          <p className={styles.origem}><b>{FORMAS[escolha.forma].nome}:</b> {FORMAS[escolha.forma].efeito}</p>
        </fieldset>

        <fieldset className={styles.bloco}>
          <legend><span>4</span> Potência e onde se desenha</legend>
          <div className={styles.campos}>
            <label>
              Seu rank na Teórica
              <select
                value={escolha.rank}
                onChange={(ev) => {
                  const rank = ev.target.value as RankTeorico;
                  mudar({ ...escolha, rank, potencia: acima(potencia, rank) ? rank : escolha.potencia });
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
              Onde
              <select value={escolha.meio} onChange={(ev) => mudar({ ...escolha, meio: ev.target.value as MeioId })}>
                {(Object.keys(MEIOS) as MeioId[]).map((id) => <option key={id} value={id}>{MEIOS[id].nome}</option>)}
              </select>
            </label>
            <label className={styles.marca}>
              <input type="checkbox" checked={escolha.armada} onChange={(ev) => mudar({ ...escolha, armada: ev.target.checked })} />
              Armada (+2 PM, Santo)
            </label>
            {escolha.armada && (
              <label>
                Dispara quando
                <select value={escolha.gatilho} onChange={(ev) => mudar({ ...escolha, gatilho: ev.target.value as GatilhoId })}>
                  {(Object.keys(GATILHOS) as GatilhoId[]).map((id) => <option key={id} value={id}>{GATILHOS[id]}</option>)}
                </select>
              </label>
            )}
          </div>
          <p className={styles.origem}>A potência é o seu rank, ou menos: menos potência, fórmula mais barata. Onde se desenha muda o preparo e a duração.</p>
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
          aria-label={`Fórmula: ${r.leitura}`}
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
          <g transform="translate(260 260) scale(1.32)" className={styles.glifo}><GlifoComposto essencia={escolha.essencia} verbos={escolha.verbos} camada={camada} /></g>
          {escolha.armada && <text x="260" y="400" textAnchor="middle" className={styles.gatilho}>✦ ARMADA ✦</text>}
          {tracos.map((t, i) => <polyline key={i} points={t.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#fff0ca" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#grimorio-brilho)" />)}
        </svg>
        <div className={styles.camadas} aria-label="Destacar uma camada do símbolo">
          <button type="button" aria-pressed={camada === "todas"} onClick={() => setCamada("todas")}>Tudo</button>
          <button type="button" aria-pressed={camada === "nucleo"} onClick={() => setCamada("nucleo")}>{essencia.nome}</button>
          {escolha.verbos.map((id) => (
            <button type="button" key={id} aria-pressed={camada === id} onClick={() => setCamada(id)}>{VERBOS[id].nome}</button>
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
            <span>ativar: {r.ativacao}</span>
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
            {r.pv !== null && <p className={styles.cartaLinha}><b>Parede:</b> {r.pv} PV</p>}
            {r.bloqueio && <p className={styles.cartaLinha}><b>Segura:</b> {r.bloqueio}</p>}
            {r.efeitoDaEssencia && <p className={styles.cartaLinha}><b>Ao encostar:</b> {r.efeitoDaEssencia}</p>}
            {r.resolucao && <p className={styles.cartaLinha}><b>Como resolver:</b> {r.resolucao}</p>}
            <p className={styles.cartaFormas}>
              <span><small>Ativar</small>{r.ativacao}</span>
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
          {acessoDaFicha.length === 0 ? "você já tem o rank e conhece todas as palavras desta fórmula." : acessoDaFicha.join(" ")}
        </p>
      </section>
    </div>
  );
}
