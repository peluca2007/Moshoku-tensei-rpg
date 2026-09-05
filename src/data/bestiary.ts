/**
 * Apêndice G — o molde de criatura por patamar.
 *
 * Mesma história do `danoPorTurno.ts`: isto era uma tabela digitada à mão dentro
 * de `Appendices.tsx`, e era a régua contra a qual o Mestre monta todo inimigo
 * do jogo. Uma régua impressa em prosa não pode ser usada por nada além de
 * olhos humanos — e o site precisa dela em três lugares ao mesmo tempo: o
 * livro em /livro, o construtor de criaturas em /encontros, e o simulador que
 * diz se o encontro é justo.
 *
 * Ela continua sendo uma CALIBRAGEM humana, não uma fórmula. O que muda é que
 * agora existe UM lugar onde ela vive.
 */

/** Uma linha do molde: tudo que uma criatura daquele patamar traz por padrão. */
export interface MoldeCriatura {
  /** 1 a 6 — o patamar, igual à escada de Ranks dos personagens. */
  patamar: number;
  /** Nome do patamar no Apêndice G ("Comum", "Perigosa", ...). */
  titulo: string;
  pv: number;
  ca: number;
  bonusAtaque: number;
  /** Dano médio que a criatura entrega numa rodada inteira, já somadas as Ações dela. */
  danoPorTurno: number;
  /** CD que os efeitos dela cobram do alvo. */
  cdResistencia: number;
}

/**
 * O Apêndice G, em dados.
 *
 * `bonusResistencia` NÃO está aqui de propósito — o livro define a coluna como
 * "metade do Bônus de Ataque, arredondado pra cima", e escrevê-la à mão seria
 * convidar as duas a divergirem. Ver `bonusResistencia()` abaixo.
 */
export const MOLDES_CRIATURA: MoldeCriatura[] = [
  { patamar: 1, titulo: "Comum", pv: 20, ca: 12, bonusAtaque: 3, danoPorTurno: 10, cdResistencia: 11 },
  { patamar: 2, titulo: "Perigosa", pv: 45, ca: 14, bonusAtaque: 4, danoPorTurno: 20, cdResistencia: 13 },
  { patamar: 3, titulo: "Ameaça", pv: 90, ca: 16, bonusAtaque: 6, danoPorTurno: 35, cdResistencia: 15 },
  { patamar: 4, titulo: "Elite", pv: 150, ca: 18, bonusAtaque: 8, danoPorTurno: 55, cdResistencia: 17 },
  { patamar: 5, titulo: "Terror", pv: 220, ca: 20, bonusAtaque: 10, danoPorTurno: 80, cdResistencia: 19 },
  { patamar: 6, titulo: "Lenda", pv: 320, ca: 22, bonusAtaque: 12, danoPorTurno: 120, cdResistencia: 21 },
];

/**
 * Apêndice G: "metade do Bônus de Ataque, arredondado pra cima". Deriva em vez
 * de guardar — a coluna do livro é uma consequência, não um dado independente.
 */
export function bonusResistencia(molde: MoldeCriatura): number {
  return Math.ceil(molde.bonusAtaque / 2);
}

export function getMoldePorPatamar(patamar: number): MoldeCriatura {
  return MOLDES_CRIATURA.find((m) => m.patamar === patamar) ?? MOLDES_CRIATURA[0];
}

/** Rótulo completo do patamar, como o livro imprime: "3º — Ameaça". */
export function rotuloPatamar(patamar: number): string {
  const molde = getMoldePorPatamar(patamar);
  return `${molde.patamar}º — ${molde.titulo}`;
}

/**
 * O papel da criatura no encontro (Apêndice G, "Ajustando pra cima ou pra baixo").
 *
 * Isto não é sabor: cada papel é uma transformação numérica declarada pelo
 * livro, e é o que separa "três lobos" de "um dragão" com o mesmo molde.
 */
export type PapelCriatura = "lacaio" | "padrao" | "chefe";

export const PAPEIS: { id: PapelCriatura; nome: string; descricao: string }[] = [
  {
    id: "lacaio",
    nome: "Lacaio",
    descricao: "Metade do PV e do dano do patamar — a criatura que existe pra vir em bando.",
  },
  {
    id: "padrao",
    nome: "Padrão",
    descricao: "O molde do Apêndice G, sem ajuste. Um inimigo entre vários do mesmo tipo.",
  },
  {
    id: "chefe",
    nome: "Chefe",
    descricao:
      "PV dobrado, mesmo dano — e uma rodada inteira a cada dois personagens do grupo (mínimo 1). A rodada extra existe pra compensar economia de ação, não pra punir grupo pequeno: com três ou menos, ela não se aplica.",
  },
];

/**
 * Quantas rodadas inteiras o chefe joga por rodada da mesa.
 *
 * Apêndice G: "UMA RODADA INTEIRA A CADA DOIS PERSONAGENS do grupo, arredondado
 * pra baixo, mínimo 1" — e a ressalva de que grupos de três ou menos não
 * disparam a regra, porque ela compensa números, não pune mesa pequena.
 */
export function rodadasDoChefe(tamanhoDoGrupo: number): number {
  if (tamanhoDoGrupo <= 3) return 1;
  return Math.max(1, Math.floor(tamanhoDoGrupo / 2));
}

/**
 * Uma ação de uma criatura pronta (2026-09-03).
 *
 * Espelha `AcaoCriatura` de `encounterSim.ts` sem o `id`, que só existe pra o
 * React e é sorteado quando a criatura entra no bestiário do Mestre. O tipo
 * mora aqui em vez de ser importado de lá porque `bestiary.ts` é DADO do livro:
 * ele não pode depender do simulador, ou o Apêndice G passaria a ser definido
 * pela ferramenta em vez do contrário.
 */
export interface AcaoPronta {
  nome: string;
  acoes: number;
  dano: string;
  alcance: string;
  area: boolean;
  tipo: "ataque" | "resistencia";
  /** Preso, Caído, Molhado e veneno estruturados (`AcaoCriatura` em `encounterSim.ts`) — ver lá o porquê de só estas quatro. */
  aplicaPreso?: boolean;
  aplicaCaido?: boolean;
  aplicaMolhado?: boolean;
  aplicaVeneno?: boolean;
  nota: string;
}

/** As seis criaturas prontas do Apêndice G, pra reskinar. */
export interface CriaturaPronta {
  id: string;
  nome: string;
  patamar: number;
  papel: PapelCriatura;
  /**
   * Retrato da criatura, caminho em `public/criaturas`.
   *
   * Mesma regra de `Tree.icon` e `Race.icon`: o arquivo se chama como o `id`, e
   * `npm run check:livro` confere que ele existe em disco — um caminho em texto
   * é a coisa mais fácil de quebrar em silêncio.
   *
   * Em 0.1.5 o Superd Renegado emprestava o retrato da RAÇA Superd por falta de
   * arte própria; em 0.1.6 ele ganhou a dele, e a regra voltou a valer pras seis.
   */
  icon?: string;
  /** A coluna "O que a torna perigosa" — o que o molde numérico não diz. */
  perigo: string;
  /**
   * O que ela FAZ, e não só quanto ela tira.
   *
   * Cada conjunto foi escrito pra que as três Ações do turno somem o
   * `danoPorTurno` do molde do patamar dela — é o que faz uma criatura pronta
   * jogada com rolagem de verdade continuar valendo o mesmo que a mesma
   * criatura resolvida pelo orçamento fixo. `encounterSim.test.ts` trava isso;
   * se você mexer numa fórmula aqui, o teste avisa qual saiu da faixa.
   */
  acoes: AcaoPronta[];
}

export const CRIATURAS_PRONTAS: CriaturaPronta[] = [
  {
    id: "sapo-lodo",
    nome: "Sapo-Lodo Gigante",
    icon: "/criaturas/sapo-lodo.jpg",
    patamar: 1,
    papel: "padrao",
    perigo: "Língua pegajosa (Preso, CD 11) e a Baba de Sapo-Lodo (Cap. 4, §8) em cada mordida.",
    acoes: [
      {
        nome: "Mordida Babosa",
        acoes: 1,
        dano: "1d6",
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        nota: "Quem for mordido pega Baba de Sapo-Lodo (Cap. 4, §8 — aflição de Rank 1).",
      },
      {
        nome: "Língua Pegajosa",
        acoes: 1,
        dano: "1d4",
        alcance: "4,5 m",
        area: false,
        tipo: "ataque",
        aplicaPreso: true,
        nota: "Se acertar, o alvo fica Preso até passar num teste de Força (CD 11) gastando 1 Ação.",
      },
    ],
  },
  {
    id: "serpente-pantano",
    nome: "Serpente-do-Pântano",
    icon: "/criaturas/serpente-pantano.jpg",
    patamar: 2,
    papel: "padrao",
    perigo: "Peçonha de Serpente-do-Pântano (Cap. 4, §8) em cada picada bem-sucedida.",
    acoes: [
      {
        nome: "Picada Peçonhenta",
        acoes: 1,
        dano: "1d8+2",
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        aplicaVeneno: true,
        nota: "Peçonha de Serpente-do-Pântano em todo acerto (Cap. 4, §8 — aflição de Rank 2).",
      },
      {
        nome: "Bote e Recuo",
        acoes: 2,
        dano: "2d8+4",
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        nota: "Depois do bote ela recua 6 m sem provocar ataque de oportunidade.",
      },
    ],
  },
  {
    id: "aranha-cavernas",
    nome: "Aranha Gigante das Cavernas",
    icon: "/criaturas/aranha-cavernas.jpg",
    patamar: 2,
    papel: "padrao",
    perigo: "Teia que aplica Preso em área antes do combate começar; ataca de emboscada com Vantagem.",
    acoes: [
      {
        nome: "Presas",
        acoes: 1,
        dano: "2d6",
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        nota: "Na primeira rodada, se veio de emboscada, rola com Vantagem.",
      },
      {
        nome: "Teia",
        acoes: 1,
        dano: "",
        alcance: "Esfera de 3 m a até 9 m",
        area: true,
        tipo: "resistencia",
        aplicaPreso: true,
        nota: "Sem dano: quem falha num teste de Agilidade (CD 13) fica Preso na teia. É a montagem, não o golpe.",
      },
    ],
  },
  {
    id: "wyvern",
    nome: "Wyvern",
    icon: "/criaturas/wyvern.jpg",
    patamar: 3,
    papel: "padrao",
    perigo: "Voa, mergulha pra morder e volta a 18m de altura no mesmo turno.",
    acoes: [
      {
        nome: "Mordida em Mergulho",
        acoes: 1,
        dano: "2d8+3",
        alcance: "Corpo a corpo, em voo",
        area: false,
        tipo: "ataque",
        nota: "Ela desce, morde e sobe: no fim do turno está a 18 m de altura, fora de alcance corpo a corpo.",
      },
      {
        nome: "Ferrão da Cauda",
        acoes: 1,
        dano: "1d10+2",
        alcance: "3 m",
        area: false,
        tipo: "ataque",
        nota: "Alvo atingido faz teste de Vigor (CD 15) ou fica Enfraquecido até o fim do próximo turno dele.",
      },
    ],
  },
  {
    id: "ogro-de-guerra",
    nome: "Ogro de Guerra (Onizoku)",
    icon: "/criaturas/ogro-de-guerra.jpg",
    patamar: 4,
    papel: "padrao",
    perigo: "Um golpe de maça rola o Dado de Arma duas vezes; contra alvo Caído, dano triplicado.",
    acoes: [
      {
        nome: "Maça de Duas Mãos",
        acoes: 1,
        dano: "4d8",
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        nota: "Contra alvo Caído, o dano é triplicado.",
      },
      {
        nome: "Pisão",
        acoes: 2,
        dano: "3d10+5",
        alcance: "Esfera de 3 m ao redor dela",
        area: true,
        tipo: "resistencia",
        aplicaCaido: true,
        nota: "Teste de Agilidade (CD 17): quem falha leva o total e cai Caído; quem passa leva metade e fica de pé.",
      },
    ],
  },
  {
    id: "superd-renegado",
    nome: "Superd Renegado",
    icon: "/criaturas/superd-renegado.jpg",
    patamar: 5,
    papel: "padrao",
    perigo: "Usa o Terceiro Olho pra nunca ser flanqueado e conjura Magia de Água até o patamar Rei.",
    acoes: [
      {
        nome: "Lança Demoníaca",
        acoes: 1,
        dano: "5d8+4",
        alcance: "3 m",
        area: false,
        tipo: "ataque",
        nota: "O Terceiro Olho cancela Vantagem por flanqueio e emboscada contra ela.",
      },
      {
        nome: "Canhão de Água (Rei)",
        acoes: 2,
        dano: "8d8+6",
        alcance: "Linha de 18 m",
        area: true,
        tipo: "resistencia",
        aplicaMolhado: true,
        nota: "Teste de Agilidade (CD 19); metade do dano se passar. Aplica Molhado em todo mundo que ela pegar.",
      },
    ],
  },
];
