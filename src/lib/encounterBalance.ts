/**
 * A recomendação — a parte que o Mestre realmente lê.
 *
 * `simularEncontro` devolve números; isto devolve uma decisão. A tradução é
 * deliberadamente conservadora e declarada aqui em um lugar só, porque uma
 * faixa de dificuldade é uma OPINIÃO de design, e opinião escondida dentro de
 * um `if` no meio de um componente não pode ser discutida nem corrigida.
 *
 * A régua parte de duas coisas que o livro já afirma:
 *
 * - Apêndice G: "a rodada extra não deixa o chefe mais difícil de matar — ela
 *   o deixa PERIGOSO ENQUANTO ESTÁ VIVO, que é a única coisa que faz um
 *   combate contra um inimigo só valer a mesa." Logo, taxa de vitória alta não
 *   basta: um encontro em que ninguém corre risco é trivial mesmo com 100% de
 *   vitória, e por isso `quedasMedia` e `rodadasMedia` entram no veredito.
 * - O mesmo apêndice trata a morte de personagem como consequência normal, não
 *   como falha do Mestre. "Equilibrado" aqui admite perder gente.
 */
import { ResultadoEncontro } from "@/lib/encounterSim";

export type Faixa = "trivial" | "facil" | "equilibrado" | "perigoso" | "letal";

export interface Veredito {
  faixa: Faixa;
  titulo: string;
  resumo: string;
}

/**
 * Os cortes, em ordem de leitura. Não há ciência aqui: são a calibragem que
 * reproduz os três combates contra chefe que o Apêndice G já descreve.
 */
export function avaliar(r: ResultadoEncontro): Veredito {
  const vitoria = r.vitorias;
  const quedas = r.quedasMedia;

  if (vitoria < 0.6) {
    return {
      faixa: "letal",
      titulo: "Letal",
      resumo:
        r.tpk > 0.5
          ? "O grupo morre inteiro na maioria das simulações. Isto não é um combate difícil: é uma cena de fuga ou de derrota narrada."
          : "O grupo perde mais vezes do que vence. Só use assim se a derrota fizer parte do plano da sessão.",
    };
  }
  if (vitoria < 0.85 || quedas >= 1.5) {
    return {
      faixa: "perigoso",
      titulo: "Perigoso",
      resumo:
        "O grupo normalmente vence, mas paga caro e alguém costuma cair de verdade. É o encontro de fim de arco — não o de terça-feira.",
    };
  }
  if (quedas >= 0.4 || vitoria < 0.98) {
    return {
      faixa: "equilibrado",
      titulo: "Equilibrado",
      resumo:
        "O grupo vence quase sempre, com risco real de perder alguém. É a faixa onde o combate ainda importa e a mesa ainda decide coisas.",
    };
  }
  if (r.rodadasMedia >= 2.5) {
    return {
      faixa: "facil",
      titulo: "Fácil",
      resumo:
        "O grupo vence sem sustos, mas o combate ainda ocupa a mesa. Serve como abertura, atrito de viagem ou luta de aquecimento.",
    };
  }
  return {
    faixa: "trivial",
    titulo: "Trivial",
    resumo:
      "Acaba antes de virar combate. Vale narrar em uma frase em vez de rolar Iniciativa — ou empilhar mais criaturas.",
  };
}

export interface AjusteSugerido {
  /** Multiplicador aplicado a PV e dano por turno de todas as criaturas. */
  escala: number;
  /** Taxa de vitória projetada com o ajuste. */
  vitoriaProjetada: number;
  quedasProjetadas: number;
}

/**
 * Procura a escala que põe o encontro na faixa Equilibrado.
 *
 * A taxa de vitória cai de forma monótona conforme PV e dano das criaturas
 * sobem, então busca binária resolve. O alvo é 92% de vitória: dentro do
 * "vence quase sempre" da faixa, com folga suficiente pra que o ruído de
 * algumas centenas de batalhas não jogue a sugestão pra fora dela.
 *
 * Devolve `null` quando a resposta é "não dá pra consertar mexendo nos
 * números" — as duas pontas do intervalo já caem do mesmo lado. Nesse caso o
 * problema é a composição do encontro (número de criaturas, patamar), e uma
 * escala fracionária só esconderia isso.
 */
export function ajustarParaEquilibrio(
  medir: (escala: number) => ResultadoEncontro,
  alvo = 0.92
): AjusteSugerido | null {
  let baixo = 0.2;
  let alto = 6;
  const noBaixo = medir(baixo).vitorias;
  const noAlto = medir(alto).vitorias;
  // Se nem a criatura mínima nem a máxima cruzam o alvo, não existe escala que
  // resolva: o encontro está mal composto, não mal dimensionado.
  if (noBaixo < alvo || noAlto > alvo) return null;

  let resultado = medir(baixo);
  let escala = baixo;
  for (let i = 0; i < 9; i++) {
    const meio = (baixo + alto) / 2;
    const r = medir(meio);
    if (r.vitorias >= alvo) {
      baixo = meio;
      escala = meio;
      resultado = r;
    } else {
      alto = meio;
    }
  }
  return {
    escala,
    vitoriaProjetada: resultado.vitorias,
    quedasProjetadas: resultado.quedasMedia,
  };
}

/** Arredonda PV pra múltiplo de 5 — a tabela do Apêndice G não tem número quebrado. */
export function arredondarPv(v: number): number {
  return Math.max(5, Math.round(v / 5) * 5);
}

export function formatarPorcentagem(fracao: number): string {
  return `${Math.round(fracao * 100)}%`;
}
