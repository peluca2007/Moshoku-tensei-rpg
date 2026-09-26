import type { ReactNode } from "react";
import { criarFormula, ESSENCIAS, FORMAS, OPERADORES, type FormaId, type FormulaEscolha } from "@/lib/magiaTeorica";
import { GlifoComposto } from "./FormulaGlyph";

/**
 * A AULA DA ROXY — a Magia Teórica ensinada em lições (2026-09-26).
 *
 * Pedido do autor: "na parte da Magia Teórica, tenta ser o melhor professor
 * possível". A §8 do Cap. 2 virou uma aula em cinco lições, uma peça nova por
 * vez, e cada lição paga um desenho ou uma conta feita na lousa. Nada aqui é
 * número escrito à mão: o desenho, a conta e as respostas dos exercícios saem
 * do mesmo motor que as cartas e o laboratório usam (src/lib/magiaTeorica.ts).
 * Mudou uma constante, a aula muda junto.
 */

const BASE: FormulaEscolha = {
  rank: "Principiante",
  potencia: "Principiante",
  essencia: "mana",
  operadores: ["projetar"],
  forma: "circulo",
  meio: "ar",
  gatilho: false,
  condicao: "entrada",
};

const formula = (e: Partial<FormulaEscolha>): FormulaEscolha => ({ ...BASE, ...e });

/** A fala da professora: uma caixa curta, na voz da Roxy. */
export function FalaDaRoxy({ children }: { children: ReactNode }) {
  return (
    <aside className="livro-caixa livro-roxy rounded-xl border border-l-[3px] border-wine-300/50 border-l-wine-500 bg-parchment-100/60 p-3.5 text-sm italic dark:border-wine-900 dark:bg-parchment-900/40">
      <p className="mb-1 font-semibold not-italic text-wine-800 dark:text-wine-300">A Roxy, na lousa</p>
      <p className="text-parchment-700 dark:text-parchment-300">{children}</p>
    </aside>
  );
}

function Contorno({ forma }: { forma: FormaId }) {
  switch (forma) {
    case "quadrado":
      return <rect x="-78" y="-78" width="156" height="156" rx="4" />;
    case "linha":
      return <path d="M-96 0H96M-96-12V12M96-12V12" />;
    case "triangulo":
      return <polygon points="0,-92 88,62 -88,62" />;
    default:
      return <circle r="84" />;
  }
}

/**
 * O desenho anotado: a fórmula como ela é traçada, com o núcleo, a ação e a
 * forma apontados. É a figura que falta na prosa: "a flecha atravessa o
 * losango" só se entende vendo.
 */
export function DesenhoAnotado({ escolha, titulo }: { escolha: Partial<FormulaEscolha>; titulo: string }) {
  const e = formula(escolha);
  const r = criarFormula(e);
  const essencia = ESSENCIAS[e.essencia];
  const acao = OPERADORES[e.operadores[0]];
  const forma = FORMAS[e.forma];
  const rotulos: [number, string, string][] = [
    [-58, "1 · núcleo", `${essencia.nome}: o que existe`],
    [4, "2 · ação", `${acao.nome}, traçada por cima`],
    [66, "3 · forma", `${forma.nome}: o contorno`],
  ];
  return (
    <figure className="diagrama livro-desenho-anotado my-5 rounded-2xl border border-gold-500/25 bg-gradient-to-br from-parchment-100/80 to-parchment-200/40 p-4 shadow-sm dark:border-gold-600/20 dark:from-parchment-900/70 dark:to-parchment-950/60">
      <p className="mb-2 text-center text-2xs font-bold uppercase tracking-[0.25em] text-gold-700 dark:text-gold-400">{titulo}</p>
      <svg viewBox="-110 -110 430 220" className="mx-auto block w-full max-w-md" role="img" aria-label={`${essencia.nome}, ${acao.nome} e ${forma.nome}: ${r.resumo}`}>
        <g fill="none" stroke="currentColor" strokeWidth="3" className="text-wine-500" strokeLinecap="round" strokeLinejoin="round">
          <Contorno forma={e.forma} />
        </g>
        <g className="text-parchment-800 dark:text-parchment-100">
          <GlifoComposto essencia={e.essencia} operadores={e.operadores} />
        </g>
        {rotulos.map(([y, rotulo, texto], i) => (
          <g key={rotulo}>
            <path
              d={i === 0 ? `M20 -8 L118 ${y}` : i === 1 ? `M8 -70 L118 ${y}` : `M84 20 L118 ${y}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 4"
              className="text-parchment-500"
            />
            <circle cx={i === 0 ? 20 : i === 1 ? 8 : 84} cy={i === 0 ? -8 : i === 1 ? -70 : 20} r="3.5" className="fill-wine-500" />
            <text x="124" y={y - 3} fontSize="15" fontWeight="800" className="fill-wine-600 dark:fill-wine-300" style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {rotulo}
            </text>
            <text x="124" y={y + 15} fontSize="14" className="fill-parchment-700 dark:fill-parchment-300">
              {texto}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 text-center text-xs text-parchment-600 dark:text-parchment-400">
        <b>{r.pm} PM.</b> {r.resumo}
      </figcaption>
    </figure>
  );
}

/**
 * A conta na lousa: a frase, cada parcela do PM numa linha com o total
 * correndo, e o que a fórmula entrega. Igualzinho à conta que a mesa faz.
 */
export function LousaDaConta({ escolha, titulo }: { escolha: Partial<FormulaEscolha>; titulo: string }) {
  const e = formula(escolha);
  const r = criarFormula(e);
  if (!r.valida) throw new Error(`Aula da Teórica: o exemplo "${titulo}" não é uma fórmula válida (${r.erros.join(" ")})`);
  const valores = r.conta.map((parcela) => Number(parcela.match(/(\d+)$/)?.[1] ?? 0));
  const linhas = r.conta.map((parcela, i) => ({
    nome: parcela.replace(/\s*\d+$/, ""),
    valor: valores[i],
    total: valores.slice(0, i + 1).reduce((a, b) => a + b, 0),
  }));
  const frase = [ESSENCIAS[e.essencia].nome, ...e.operadores.map((id) => OPERADORES[id].nome), FORMAS[e.forma].nome].join(" + ");
  return (
    <div className="livro-lousa my-4 rounded-xl border border-parchment-300 bg-parchment-900/90 p-3.5 text-sm text-parchment-100 dark:border-parchment-700">
      <p className="text-2xs font-bold uppercase tracking-[0.22em] text-gold-300">{titulo}</p>
      <p className="livro-lousa-frase mt-1 font-semibold">{frase}</p>
      <p className="text-xs text-parchment-300">
        Construção {e.rank} · potência {r.potencia} · {e.meio === "ar" ? "mana no ar" : e.meio}
      </p>
      <table className="livro-lousa-conta mt-2 w-full text-xs">
        <tbody>
          {linhas.map((l, i) => (
            <tr key={i}>
              <td>{l.nome}</td>
              <td className="text-right">{i === 0 ? l.valor : `+ ${l.valor}`}</td>
              <td className="text-right text-parchment-400">= {l.total}</td>
            </tr>
          ))}
          <tr className="livro-lousa-total">
            <td>Total</td>
            <td />
            <td className="text-right font-bold">{r.pm} PM</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-parchment-200">{r.resumo}</p>
      {r.resolucao && <p className="mt-1 text-xs text-parchment-300">{r.resolucao}</p>}
    </div>
  );
}

const EXERCICIOS: { pergunta: string; escolha: Partial<FormulaEscolha>; resposta: (r: ReturnType<typeof criarFormula>) => string }[] = [
  {
    pergunta:
      "Você tem Teórica Intermediária e conhece o símbolo do Fogo. Monte um projétil de Fogo, potência Intermediária, que chegue o mais longe possível. Que forma você fecha, quanto custa e até onde vai?",
    escolha: { rank: "Intermediário", potencia: "Intermediário", essencia: "fogo", operadores: ["projetar"], forma: "linha" },
    resposta: (r) => `Fogo + Projetar + Linha: ${r.pm} PM (${r.conta.join(" + ")}). Vai a ${r.alcance} e causa ${r.dano} de dano ${r.tipo}. A Linha é a forma que estica o alcance em 50%.`,
  },
  {
    pergunta:
      "A mesma construção Intermediária, agora pra segurar a porta: uma parede de Terra em Quadrado, potência Intermediária, desenhada em giz. Quantos PV ela tem e quanto PM custa?",
    escolha: { rank: "Intermediário", potencia: "Intermediário", essencia: "terra", operadores: ["conter"], forma: "quadrado", meio: "giz" },
    resposta: (r) => `${r.pv} PV por ${r.pm} PM: os PV da potência, +50% da Terra e +50% do Quadrado, somados (não multiplicados). Dura ${r.duracao}.`,
  },
  {
    pergunta:
      "Um colega de Teórica Intermediária escreveu Mana + Expressar + Projetar + Círculo, querendo mandar um sinal de luz até o outro lado do vale. Por que o desenho não sai do papel?",
    escolha: { rank: "Intermediário", potencia: "Principiante", operadores: ["expressar", "projetar"] },
    resposta: (r) => `${r.erros[0]} O sinal nasce no ponto do desenho: pra avisar longe, desenhe o sinal lá (em giz, no caminho) ou use outra célula.`,
  },
];

/** Os exercícios da aula, com a pergunta. As respostas vêm no fim, de cabeça pra baixo. */
export function ExerciciosDaTeorica() {
  return (
    <ol className="livro-exercicios list-decimal space-y-2 pl-5 text-parchment-700 dark:text-parchment-300">
      {EXERCICIOS.map((ex) => (
        <li key={ex.pergunta}>{ex.pergunta}</li>
      ))}
    </ol>
  );
}

/** As respostas — de cabeça pra baixo, como em todo bom livro de exercícios. */
export function RespostasDaTeorica() {
  return (
    <div className="livro-respostas my-4 rounded-xl border border-dashed border-parchment-400 p-3 text-xs text-parchment-600 dark:border-parchment-700 dark:text-parchment-400">
      <div className="livro-respostas-corpo rotate-180">
        <p className="mb-1 font-bold uppercase tracking-[0.2em]">Respostas</p>
        <ol className="list-decimal space-y-1 pl-5">
          {EXERCICIOS.map((ex) => {
            const r = criarFormula(formula(ex.escolha));
            return <li key={ex.pergunta}>{ex.resposta(r)}</li>;
          })}
        </ol>
      </div>
    </div>
  );
}
