/**
 * Descanso Curto e Longo (Cap. 4, §7) — a conta, separada de quem a aplica.
 *
 * ## A contradição que existia até a 0.1.73
 *
 * O livro dizia três coisas diferentes sobre o Descanso Curto: a tabela do Cap.
 * 4, §7 dava "25% dos seus PM, PP e PT"; o aviso abaixo dela dizia que PT voltam
 * INTEIROS e que o Curto "devolve metade da reserva de PM"; e o Cap. 3 repetia
 * que "PM voltam pela metade".
 *
 * Este arquivo seguiu sempre a **tabela** — 25% de PM e PP, PT inteiros —
 * porque é o que a mesa lê na hora de aplicar, e porque dobrar por conta própria
 * o recurso que a Magia de Cura converte em PV não é decisão de código.
 *
 * Na 0.1.73 o **texto** foi alinhado a esta conta, nos três lugares: a tabela
 * passou a separar PT dos outros dois em vez de ser corrigida por um aviso
 * abaixo dela, e as duas menções a "metade" viraram 25%. A aritmética do exemplo
 * do curandeiro foi refeita com o número certo. Não há mais divergência a
 * arbitrar: o livro e este arquivo dizem a mesma coisa.
 */

export interface ReservasMaximas {
  pv: number;
  pm: number;
  pt: number;
  pp: number;
}

export interface GanhoDeDescanso {
  pv: number;
  pm: number;
  pt: number;
  pp: number;
  /** Como cada número saiu, pra tela poder mostrar a conta antes de aplicar. */
  detalhe: string[];
}

/** Sempre pra baixo, como a tabela manda ("arredondado para baixo"). */
function porcento(valor: number, pct: number): number {
  return Math.floor((valor * pct) / 100);
}

/**
 * Descanso Curto (1 a 2 horas).
 *
 * PV ficam em ZERO de propósito, e é a regra mais importante do capítulo: "a
 * carne não fecha sozinha". Um Curto que devolvesse PV apagaria a promessa de
 * que um grupo sem curandeiro sangra na segunda luta.
 */
export function descansoCurto(max: ReservasMaximas): GanhoDeDescanso {
  const pm = porcento(max.pm, 25);
  const pp = porcento(max.pp, 25);
  return {
    pv: 0,
    pm,
    pt: max.pt,
    pp,
    detalhe: [
      "PV: nada — a carne não fecha sozinha (Cap. 4, §7)",
      `PM: +${pm} (25% de ${max.pm})`,
      `PT: +${max.pt} — voltam inteiros, é o único recurso que faz isso (Cap. 3)`,
      `PP: +${pp} (25% de ${max.pp})`,
    ],
  };
}

/** Quantos Curtos cabem entre dois Longos. O aviso do Cap. 4 é literal: "dois, e nem um a mais". */
export const CURTOS_POR_DIA = 2;

/**
 * Descanso Longo (8 horas de sono seguro).
 *
 * 2026-09-17 (Revisão do Livro, decisão A1): o Longo devolve TODAS as reservas
 * e um pouco de PV fixo — Vigor + 2 × o maior Bônus de Rank, mínimo 1. Antes
 * ele devolvia 50% de PM, PT e PP (menos PT que o Curto, que devolve inteiro) e
 * 25% dos PV mais Vigor d10 por cento, enquanto o aviso logo abaixo da tabela
 * dizia que dormir não cura. Agora o sono fecha pouco, sem dado, e a semana de
 * cama tem nome próprio: Convalescença.
 */
export function descansoLongo(max: ReservasMaximas, vigor: number, maiorBonus: number): GanhoDeDescanso {
  const pv = Math.max(1, vigor + 2 * maiorBonus);
  return {
    pv,
    pm: max.pm,
    pt: max.pt,
    pp: max.pp,
    detalhe: [
      `PV: +${pv} (Vigor ${vigor} + 2 × Bônus de Rank ${maiorBonus}, mínimo 1)`,
      `PM: +${max.pm} (todos)`,
      `PT: +${max.pt} (todos)`,
      `PP: +${max.pp} (todos)`,
    ],
  };
}

/**
 * As seis atividades de Downtime (Cap. 5, §1), em bloco de uma semana.
 *
 * `aplica` diz o que o site consegue fazer sozinho. As outras quatro são
 * combinação de mesa — "anote um NPC", "o Mestre define o custo" — e o site
 * mostra o texto em vez de fingir que resolve. Nenhuma delas concede PA: o
 * livro é explícito, e Downtime que virasse progressão seria uma segunda forma
 * de subir de patamar sem risco.
 */
export interface AtividadeDeDowntime {
  id: string;
  nome: string;
  efeito: string;
  /** O que o site aplica na ficha: ouro rolado, PV cheios, ou nada além do texto. */
  aplica?: "ouro" | "pvCheio";
}

export const DOWNTIME: AtividadeDeDowntime[] = [
  {
    id: "treinar",
    nome: "Treinar",
    efeito:
      "Ganhe Vantagem no próximo teste de uma Perícia à escolha, ligada à sua Árvore Inicial ou a uma Perícia que você já tenha — dura até ser usado ou até 1 mês passar. Não concede PA.",
  },
  {
    id: "recuperar",
    nome: "Recuperar-se",
    efeito:
      "Convalescença (Cap. 4): todos os PV são restaurados, e mais 1 nível de Exaustão é removido além do normal.",
    aplica: "pvCheio",
  },
  {
    id: "trabalhar",
    nome: "Trabalhar",
    efeito:
      "Ganhe PO igual a 2d6 × seu maior Bônus de Rank (mínimo 2d6), pelo seu Ofício, sua fama ou um trabalho comum da cidade.",
    aplica: "ouro",
  },
  {
    id: "contato",
    nome: "Cultivar um Contato",
    efeito:
      "Anote um NPC nomeado e uma cidade ou facção. Da próxima vez que precisar de uma informação ou um favor pequeno, o Mestre pode deixar esse contato resolver — sem PP, sem teste.",
  },
  {
    id: "oficio",
    nome: "Estudar um Ofício ou Ritual",
    efeito:
      "Com a Perícia de Ofícios ligada ao que quer fazer, produza um item mundano ou prepare os materiais de um ritual que já pode conjurar. O Mestre define o custo em PO — normalmente metade do preço de mercado.",
  },
  {
    id: "vigiar",
    nome: "Vigiar as Costas do Grupo",
    efeito: "Sem efeito próprio, mas concede a outro personagem Vantagem na atividade dele nesta semana.",
  },
];

/**
 * O ouro de "Trabalhar": 2d6 × maior Bônus de Rank, com piso no próprio 2d6.
 *
 * O piso existe pra que um personagem sem nenhum patamar aberto (Bônus 0) não
 * trabalhe uma semana inteira de graça — multiplicar por zero daria zero moeda,
 * que é pior do que o trabalho comum da cidade que a regra descreve.
 */
export function ouroDeTrabalhar(rolagem2d6: number, maiorBonusDeRank: number): number {
  return Math.max(rolagem2d6, rolagem2d6 * maiorBonusDeRank);
}
