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
  type FormulaResultado,
  type GatilhoId,
  type MeioId,
  type OperadorId,
  type RankTeorico,
} from "@/lib/magiaTeorica";
import styles from "./FormulaWorkshop.module.css";
import { GlifoComposto, TracoNucleo, TracoOperador, type CamadaDoGlifo } from "./FormulaGlyph";
import { useActiveCharacter } from "@/store/useCharacterStore";
import { avaliarFormulaNaFicha } from "@/lib/simbolosTeoricos";

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
  { nome: "Dardo arcano", escolha: INICIAL },
  { nome: "Parede de mana", escolha: { ...INICIAL, operadores: ["conter"], forma: "quadrado" } },
  { nome: "Sinal arcano", escolha: { ...INICIAL, operadores: ["expressar"] } },
];

const ACOES_INICIAIS: OperadorId[] = ["projetar", "expressar", "conter", "rejeitar"];
const FORMAS_INICIAIS: FormaId[] = ["circulo", "quadrado", "linha"];
const DESAFIOS = [
  { id: "alcance", titulo: "Alcance a 12 m", dica: "Mude só o contorno do Dardo Arcano.", base: INICIAL, passo: 2 },
  { id: "parede", titulo: "Reforce a parede", dica: "Mana e Conter já estão inscritos. Escolha a forma.", base: { ...INICIAL, operadores: ["conter"] as OperadorId[] }, passo: 2 },
  { id: "sinal", titulo: "Avise sem ferir", dica: "Mude só a ação sobre Mana.", base: INICIAL, passo: 1 },
] as const;

type Ponto = { x: number; y: number };
type Traço = Ponto[];
const fixar = (numero: number) => Math.round(numero * 1000) / 1000;

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
  const [modo, setModo] = useState<"guiado" | "livre">("guiado");
  const [passo, setPasso] = useState(0);
  const [desafio, setDesafio] = useState<(typeof DESAFIOS)[number]["id"] | null>(null);
  const [criada, setCriada] = useState<FormulaResultado | null>(null);
  const [tracando, setTracando] = useState(false);
  const [tracos, setTracos] = useState<Traço[]>([]);
  const [camada, setCamada] = useState<CamadaDoGlifo>("todas");
  const desenhando = useRef(false);
  const resultado = criarFormula(escolha);
  const acessoDaFicha = personagem.id === "__none__"
    ? ["Crie ou selecione uma ficha para conferir o que seu personagem já sabe desenhar."]
    : avaliarFormulaNaFicha(personagem, escolha);

  function mudar(nova: FormulaEscolha) {
    setEscolha(nova);
    setCriada(null);
    setCamada("todas");
  }

  function exemplo(nova: FormulaEscolha) {
    mudar({ ...nova, operadores: [...nova.operadores] });
    setTracos([]);
    setPasso(2);
    setDesafio(null);
  }

  function iniciarDesafio(item: (typeof DESAFIOS)[number]) {
    mudar({ ...item.base, operadores: [...item.base.operadores] });
    setTracos([]);
    setModo("guiado");
    setPasso(item.passo);
    setDesafio(item.id);
  }

  function escolherAcaoInicial(id: OperadorId) {
    mudar({ ...escolha, operadores: [id], forma: "circulo", gatilho: false });
  }

  function alternarOperador(id: OperadorId) {
    const atual = escolha.operadores;
    mudar({
      ...escolha,
      operadores: atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id],
    });
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
    setTracos((atual) => atual.map((traco, indice) => indice === atual.length - 1 ? [...traco, ponto] : traco));
  }

  function terminarTraco() {
    desenhando.current = false;
  }

  const essencia = ESSENCIAS[escolha.essencia];
  const guiado = modo === "guiado";
  const potencia = escolha.potencia ?? escolha.rank;
  const acertouDesafio = resultado.valida && escolha.essencia === "mana" && (
    desafio === "alcance" && escolha.operadores.length === 1 && escolha.operadores[0] === "projetar" && escolha.forma === "linha"
    || desafio === "parede" && escolha.operadores.length === 1 && escolha.operadores[0] === "conter" && escolha.forma === "quadrado"
    || desafio === "sinal" && escolha.operadores.length === 1 && escolha.operadores[0] === "expressar" && escolha.forma === "circulo"
  );

  return (
    <div className={styles.workshop}>
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>Laboratório de fórmulas</p>
          <h4>Escreva uma frase em magia</h4>
          <p>Aprenda uma frase de cada vez: <strong>núcleo</strong>, <strong>ação desenhada sobre ele</strong> e <strong>forma</strong>. Depois explore os circuitos avançados.</p>
        </div>
        <div className={styles.examples} aria-label="Exemplos para começar">
          {EXEMPLOS.map((item) => <button key={item.nome} type="button" onClick={() => exemplo(item.escolha)}>{item.nome}</button>)}
        </div>
      </div>
      <p className={styles.accessNote}><strong>Para construir: árvore de Magia Teórica.</strong> Seu personagem precisa ter o rank escolhido e conhecer todos os símbolos usados. Você pode experimentar livremente neste laboratório; alimentar uma fórmula pronta exige apenas o PM necessário.</p>

      <div className={styles.learnBar}>
        <div className={styles.modeSwitch} aria-label="Modo da oficina">
          <button type="button" aria-pressed={guiado} onClick={() => { setModo("guiado"); setPasso(0); setDesafio(null); mudar(INICIAL); }}>Aprender em 3 passos</button>
          <button type="button" aria-pressed={!guiado} onClick={() => { setModo("livre"); setDesafio(null); }}>Explorar fórmulas</button>
        </div>
        {guiado && <div className={styles.learnProgress}>
          <p><strong>{passo + 1}/3 — {(["Escolha o núcleo", "Inscreva a ação", "Feche a forma"])[passo]}</strong> <span>{(["Mana já vem com a árvore. Outras essências pedem outra escola ou 1 PA.", "A ação é traçada por cima do núcleo, não ao lado.", "O contorno muda o resultado; veja custo e efeito antes de criar."])[passo]}</span></p>
          <div>
            {passo > 0 && <button type="button" onClick={() => setPasso(passo - 1)}>Voltar</button>}
            {passo < 2 && <button type="button" onClick={() => setPasso(passo + 1)}>Próximo passo →</button>}
            {passo === 2 && <button type="button" onClick={() => setModo("livre")}>Abrir catálogo completo</button>}
          </div>
        </div>}
        <details className={styles.challenges}>
          <summary>Três pequenos desafios para treinar</summary>
          <div>
            {DESAFIOS.map((item) => <button type="button" key={item.id} onClick={() => iniciarDesafio(item)}>{item.titulo}</button>)}
          </div>
          {desafio && <p aria-live="polite">{acertouDesafio ? `Conseguiu! ${resultado.nome}: ${resultado.pm} PM. Abra a ficha completa para ver os limites.` : DESAFIOS.find((item) => item.id === desafio)?.dica}</p>}
        </details>
      </div>

      <div className={styles.layout}>
        <div className={styles.controls}>
          {(!guiado || passo === 0) && <div className={styles.step}>
            <div className={styles.stepHead}><span>01</span><div><h5>Núcleo</h5><p>O que a fórmula manipula?</p></div></div>
            <div className={styles.choiceGrid}>
              {(Object.keys(ESSENCIAS) as EssenciaId[]).filter((id) => !guiado || ["mana", "fogo", "som", "vida"].includes(id)).map((id) => (
                <button key={id} type="button" className={styles.choice} aria-pressed={escolha.essencia === id}
                  onClick={() => mudar({ ...escolha, essencia: id })} title={ESSENCIAS[id].origem}>
                  <svg className={styles.choiceGlyph} style={{ color: ESSENCIAS[id].cor }} viewBox="-100 -100 200 200" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><TracoNucleo id={id} /></svg>
                  <span>{ESSENCIAS[id].nome}</span>
                  <small>{ESSENCIAS[id].custo} PM</small>
                </button>
              ))}
            </div>
            <p className={styles.source}><strong>{essencia.nome}:</strong> {essencia.origem}. Conhecer uma essência fornece vocabulário; criar fórmulas exige Magia Teórica.</p>
          </div>}

          {(!guiado || passo === 1) && <div className={styles.step}>
            <div className={styles.stepHead}><span>02</span><div><h5>Inscrições de ação</h5><p>Cada ação é um símbolo traçado sobre o núcleo. Escolha a ordem das camadas.</p></div></div>
            <div className={styles.operatorGrid}>
              {(Object.keys(OPERADORES) as OperadorId[]).filter((id) => !guiado || ACOES_INICIAIS.includes(id)).map((id) => (
                <button key={id} type="button" className={styles.operator} aria-pressed={escolha.operadores.includes(id)}
                  onClick={() => guiado ? escolherAcaoInicial(id) : alternarOperador(id)} title={OPERADORES[id].papel}>
                  <svg viewBox="-100 -100 200 200" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><TracoOperador id={id} /></svg><strong>{OPERADORES[id].nome}</strong><small>+{OPERADORES[id].custo} PM</small>
                </button>
              ))}
            </div>
            <div className={styles.sequence} aria-label="Ordem da fórmula">
              <span>{essencia.nome}</span>
              {escolha.operadores.map((id, indice) => <span key={id}>{indice + 1}. {OPERADORES[id].nome}</span>)}
              {!escolha.operadores.length && <em>→ escolha uma ação</em>}
            </div>
            {guiado && <p className={styles.source}>Projetar e Expressar vêm com a árvore. Na entrada, escolha Conter <em>ou</em> Rejeitar; o outro pode ser comprado por 1 PA.</p>}
          </div>}

          {(!guiado || passo === 2) && <div className={styles.step}>
            <div className={styles.stepHead}><span>03</span><div><h5>Forma</h5><p>O contorno altera os números.</p></div></div>
            <div className={styles.formGrid}>
              {(Object.keys(FORMAS) as FormaId[]).filter((id) => !guiado || FORMAS_INICIAIS.includes(id)).map((id) => (
                <button key={id} type="button" className={styles.formChoice} aria-pressed={escolha.forma === id}
                  onClick={() => mudar({ ...escolha, forma: id })}>
                  <span>{FORMAS[id].glifo}</span><strong>{FORMAS[id].nome}</strong><small>{FORMAS[id].efeito}</small>
                </button>
              ))}
            </div>
            {guiado && <p className={styles.source}>Círculo é neutro. Quadrado fortalece Conter. Linha aumenta alcance de Projetar ou a extensão de uma fronteira.</p>}
          </div>}

          {!guiado && <details className={styles.advanced}>
            <summary>Mais decisões: rank, material e gatilho</summary>
            <div className={styles.advancedFields}>
              <label>Rank da Magia Teórica — construção
                <select value={escolha.rank} onChange={(evento) => { const rank = evento.target.value as RankTeorico; mudar({ ...escolha, rank, potencia: RANKS_TEORICOS.indexOf(potencia) > RANKS_TEORICOS.indexOf(rank) ? rank : potencia }); }}>
                  {RANKS_TEORICOS.map((rank) => <option key={rank} value={rank}>{rank}</option>)}
                </select>
              </label>
              <label>Potência do efeito
                <select value={potencia} onChange={(evento) => mudar({ ...escolha, potencia: evento.target.value as RankTeorico })}>
                  {RANKS_TEORICOS.filter((rank) => RANKS_TEORICOS.indexOf(rank) <= RANKS_TEORICOS.indexOf(escolha.rank)).map((rank) => <option key={rank} value={rank}>{rank}</option>)}
                </select>
              </label>
              <label>Como é desenhada
                <select value={escolha.meio} onChange={(evento) => mudar({ ...escolha, meio: evento.target.value as MeioId })}>
                  {(Object.keys(MEIOS) as MeioId[]).map((id) => <option key={id} value={id}>{MEIOS[id].nome}</option>)}
                </select>
              </label>
              <label className={styles.check}><input type="checkbox" checked={escolha.gatilho} onChange={(evento) => mudar({ ...escolha, gatilho: evento.target.checked })} /> Ativar sob uma condição (+2 PM)</label>
              {escolha.gatilho && <label className={styles.condition}>Quando ativar
                <select value={escolha.condicao} onChange={(evento) => mudar({ ...escolha, condicao: evento.target.value as GatilhoId })}>
                  {(Object.keys(GATILHOS) as GatilhoId[]).filter((id) => id !== "quebra").map((id) => <option key={id} value={id}>{GATILHOS[id]}</option>)}
                </select>
              </label>}
            </div>
            <p>Construção limita o tamanho do desenho; potência define a força da saída. O material muda preparo e duração. Esta oficina ainda monta uma célula por vez.</p>
          </details>}
        </div>

        <div className={styles.previewColumn}>
          <div id="desenho-da-formula" className={styles.circleCard}>
            <div className={styles.circleHead}><span>Seu desenho</span><button type="button" aria-pressed={tracando} onClick={() => { setTracando(!tracando); terminarTraco(); }}>{tracando ? "Terminar traço" : "Traçar à mão"}</button></div>
            <svg className={`${styles.circle} ${tracando ? styles.drawing : ""}`} viewBox="0 0 520 520"
              role="img" aria-label={`Fórmula de ${essencia.nome} com ${escolha.operadores.map((id) => OPERADORES[id].nome).join(", ") || "nenhum operador"} em forma de ${FORMAS[escolha.forma].nome}`}
              onPointerDown={iniciarTraco} onPointerMove={moverTraco} onPointerUp={terminarTraco} onPointerCancel={terminarTraco}>
              <defs>
                <radialGradient id="formula-void"><stop offset="0" stopColor="#213b4a"/><stop offset=".62" stopColor="#152733"/><stop offset="1" stopColor="#08121e"/></radialGradient>
                <filter id="formula-glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <circle cx="260" cy="260" r="258" fill="url(#formula-void)"/>
              <circle cx="260" cy="260" r="232" fill="none" stroke="#cba975" strokeOpacity=".22" strokeWidth="2"/>
              <circle cx="260" cy="260" r="215" fill="none" stroke="#cba975" strokeOpacity=".35" strokeWidth="1" strokeDasharray="2 8"/>
              <circle cx="260" cy="260" r="126" fill="none" stroke={essencia.cor} strokeOpacity=".25" strokeWidth="1"/>
              <path d="M260 38l11 18-11 18-11-18z M482 260l-18 11-18-11 18-11z M260 482l-11-18 11-18 11 18z M38 260l18-11 18 11-18 11z" fill="none" stroke="#cba975" strokeOpacity=".55" strokeWidth="1.3"/>
              {Array.from({ length: 32 }, (_, i) => {
                const a = (i / 32) * Math.PI * 2;
                return <line key={i} x1={fixar(260 + Math.cos(a) * 223)} y1={fixar(260 + Math.sin(a) * 223)} x2={fixar(260 + Math.cos(a) * (i % 4 ? 232 : 241))} y2={fixar(260 + Math.sin(a) * (i % 4 ? 232 : 241))} stroke="#d8b88b" strokeOpacity={i % 4 ? .36 : .72} strokeWidth={i % 4 ? 1 : 2} />;
              })}
              <g className={styles.mainShape} stroke={essencia.cor} strokeWidth="4" fill="none" filter="url(#formula-glow)">{contorno(escolha.forma)}</g>
              <g transform="translate(260 260) scale(1.32)"><GlifoComposto essencia={escolha.essencia} operadores={escolha.operadores} camada={camada} /></g>
              {escolha.gatilho && <text x="260" y="392" textAnchor="middle" fill="#efcd9e" fontSize="24" fontFamily="Georgia,serif">✦ GATILHO ✦</text>}
              {tracos.map((traco, i) => <polyline key={i} points={traco.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#fff0ca" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#formula-glow)" />)}
            </svg>
            <div className={styles.layers} aria-label="Destacar uma camada do símbolo">
              <p>Entenda o traço <span>Toque para destacar uma camada.</span></p>
              <div>
                <button type="button" aria-pressed={camada === "todas"} onClick={() => setCamada("todas")}>Símbolo completo</button>
                <button type="button" aria-pressed={camada === "nucleo"} onClick={() => setCamada("nucleo")}>Núcleo: {essencia.nome}</button>
                {escolha.operadores.map((id, indice) => <button type="button" key={id} aria-pressed={camada === id} onClick={() => setCamada(id)}>{indice + 1}. {OPERADORES[id].nome}</button>)}
              </div>
            </div>
            <div className={styles.circleFoot}>
              <span>{tracando ? "Desenhe por cima. As escolhas definem as regras; os traços registram sua criação." : `${essencia.nome} recebe ${escolha.operadores.map((id) => OPERADORES[id].nome).join(" e ") || "as inscrições de ação"}. Os pequenos números indicam a ordem das camadas. A borda é ${FORMAS[escolha.forma].nome}.`}</span>
              {tracos.length > 0 && <button type="button" onClick={() => setTracos([])}>Limpar traços</button>}
            </div>
          </div>

          <div className={styles.mathCard}>
            <div className={styles.mathTop}><span>Custo da fórmula</span><strong>{resultado.pm} <small>PM</small></strong></div>
            <p>{resultado.conta.join(" + ")}</p>
            <div className={styles.meters}><span>{resultado.simbolos}/{resultado.limiteSimbolos} componentes</span><span>teto {resultado.limitePm} PM</span><span>preparo: {resultado.preparo}</span><span>ativação: {resultado.ativacao}</span></div>
            {!resultado.valida && <ul className={styles.errors} aria-live="polite">{resultado.erros.map((erro) => <li key={erro}>{erro}</li>)}</ul>}
            <button className={styles.create} type="button" disabled={!resultado.valida || (guiado && passo < 2)} onClick={() => setCriada(resultado)}>Ver a fórmula completa <span aria-hidden>✦</span></button>
          </div>
        </div>
      </div>

      {criada && <div className={styles.result} aria-live="polite">
        <div><p className={styles.eyebrow}>Fórmula criada</p><h5>{criada.nome}</h5></div>
        <p className={styles.resultLead}>{criada.resumo}</p>
        <div className={styles.resultStats}>
          <span><strong>{criada.pm} PM</strong><small>Custo</small></span>
          <span><strong>{criada.preparo}</strong><small>Preparo</small></span>
          <span><strong>{criada.ativacao}</strong><small>Ativação</small></span>
          <span><strong>{criada.potencia}</strong><small>Potência</small></span>
          <span><strong>{criada.duracao}</strong><small>Duração</small></span>
          <span><strong>{criada.area}</strong><small>Área</small></span>
          {escolha.operadores.includes("projetar") && <span><strong>{criada.alcance}</strong><small>Alcance</small></span>}
          {criada.pv !== null && <span><strong>{criada.pv} PV</strong><small>Estrutura</small></span>}
          {criada.dano && <span><strong>{criada.dano}</strong><small>{criada.tipo === "cura" ? "Cura" : `Dano ${criada.tipo}`}</small></span>}
          {criada.reservaPm !== null && <span><strong>{criada.reservaPm} PM</strong><small>Reserva da espiral</small></span>}
        </div>
        {criada.bloqueio && <p><strong>O que bloqueia:</strong> {criada.bloqueio}.</p>}
        {criada.efeitoDaEssencia && <p><strong>Efeito da essência:</strong> {criada.efeitoDaEssencia}</p>}
        {criada.resolucao && <p><strong>Como resolver:</strong> {criada.resolucao}</p>}
        <p><strong>Como ler:</strong> {criada.leitura}</p>
        <p className={styles.resultNote}>Construir esta fórmula exige Magia Teórica no rank {escolha.rank} ou superior e conhecer todos os símbolos escolhidos. A potência escolhida é {criada.potencia}. Uma pessoa sem essa árvore pode alimentar o desenho pronto, mas não alterar seus traços. Os cálculos desta oficina ainda são uma proposta em teste.</p>
        <p className={styles.resultNote}><strong>{personagem.id === "__none__" ? "Para usar em jogo:" : `Na ficha ativa (${personagem.name}):`}</strong> {acessoDaFicha.length === 0 ? "Você já conhece os símbolos e tem o rank necessários para construir esta fórmula." : acessoDaFicha.join(" ")}</p>
      </div>}
    </div>
  );
}
