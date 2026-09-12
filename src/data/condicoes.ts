import { RANK_BONUS } from "@/lib/types";

/**
 * O Glossário de Condições do Cap. 4, §2 — agora dado, e não tabela escrita à mão.
 *
 * ## Por que virou dado
 *
 * O aviso que abre o glossário no livro sempre disse a verdade: "dezenas de
 * magias e técnicas aplicam uma condição pelo nome ('o alvo fica Amedrontado')
 * sem repetir o efeito toda vez — é aqui, e só aqui, que cada uma delas tem sua
 * definição completa". O problema é o "aqui": quem lê a magia no meio do turno
 * tinha que sair da magia, achar o capítulo 4, achar a linha da tabela e voltar.
 *
 * Sendo dado, a condição pode ser reconhecida na própria prosa da habilidade
 * (`lib/condicoesNaProsa.ts`) e, a partir da 0.1.24, marcada na ficha com
 * duração — que é o que transforma "o alvo fica Envenenado" de texto em algo que
 * o site sabe cobrar no turno seguinte.
 *
 * ## O que é `mecanica`, e o que continua sendo prosa
 *
 * `mecanica` guarda SÓ o que a ficha consegue aplicar sozinha, sem julgamento:
 * Desvantagem em ataque, Deslocamento zerado, dano no início do turno. Tudo que
 * depende do Mestre decidir ("enquanto a fonte do medo estiver visível", "se
 * precisar respirar") fica na prosa e não vira campo — um campo que finge saber
 * dessas coisas mentiria em metade das mesas.
 *
 * O `efeito` é a fonte da tabela impressa no livro: a tabela é GERADA daqui, e
 * por isso não existe cópia pra divergir.
 */

export interface MecanicaDeCondicao {
  /** Desvantagem em todos os ataques de quem está com a condição. */
  desvantagemEmAtaques?: boolean;
  /** Desvantagem em testes de atributo. */
  desvantagemEmTestes?: boolean;
  /** Ataques CONTRA quem está com a condição têm Vantagem. */
  vantagemParaQuemAtaca?: boolean;
  /** Ataques corpo a corpo contra o alvo têm Vantagem (Caído: só os corpo a corpo). */
  vantagemCorpoACorpo?: boolean;
  /** Ataques à distância contra o alvo têm Desvantagem. */
  desvantagemADistancia?: boolean;
  /** O que acontece com o Deslocamento. */
  deslocamento?: "zero" | "metade";
  /** Dano no início de cada turno do alvo — a fórmula padrão, quando a habilidade não disser outra. */
  danoPorTurno?: string;
  /** Perde Ações e Reação. */
  semAcoes?: boolean;
  /** A condição empilha, e cada acúmulo conta (hoje só Quebrantado). */
  acumulavel?: boolean;
}

export interface Condicao {
  id: string;
  nome: string;
  /** A definição completa, como sai impressa no livro. */
  efeito: string;
  /** O que a ficha sabe aplicar sozinha. Ausente = a condição é toda de julgamento do Mestre. */
  mecanica?: MecanicaDeCondicao;
  /**
   * Como ela termina, quando o livro dá uma regra fechada. Texto curto, pra
   * caber no seletor de duração da ficha.
   */
  duracaoPadrao?: string;
  /**
   * Outras formas com que a prosa das habilidades cita esta condição. Existe
   * porque as três faces do Fluxo Interrompido se citam entre si pelo nome
   * curto, e o reconhecedor precisa achar as duas escritas.
   */
  sinonimos?: string[];
}

/** As 24 do Cap. 4, §2, em ordem alfabética — a mesma ordem em que a tabela sempre saiu impressa. */
export const CONDICOES: Condicao[] = [
  {
    id: "agarrado",
    nome: "Agarrado",
    efeito:
      "Deslocamento reduzido a 0. Desvantagem em ataques contra qualquer criatura que não seja quem te agarrou. Termina se quem te agarrou for incapacitado, ou gastando 1 Ação num teste de Força ou Agilidade (Disputa) contra quem segura.",
    mecanica: { deslocamento: "zero" },
    duracaoPadrao: "Até se soltar",
  },
  {
    id: "amedrontado",
    nome: "Amedrontado",
    efeito:
      "Desvantagem em testes de atributo e em ataques enquanto a fonte do medo estiver visível. Não pode se mover voluntariamente pra mais perto dela.",
    mecanica: { desvantagemEmAtaques: true, desvantagemEmTestes: true },
    duracaoPadrao: "Enquanto a fonte estiver visível",
  },
  {
    id: "apontado",
    nome: "Apontado",
    efeito:
      "A Ordem de Tiro do Tático (Cap. 3). O primeiro ataque que ACERTAR o alvo Apontado — do Tático ou de um aliado — causa +1d6 de dano por patamar que o Tático possua em Navegação e Liderança, e o próprio Tático soma o Bônus de Rank dele no acerto e no dano contra esse alvo. Dura até o próximo turno de quem apontou. Se ninguém acertar nesse intervalo, ele pode apontar o mesmo alvo de novo e o bônus acumula outro 1d6, até o dobro do patamar dele.",
    duracaoPadrao: "Até o próximo turno de quem apontou",
  },
  {
    id: "atolado",
    nome: "Atolado",
    efeito:
      "Deslocamento reduzido à metade nesse terreno; gastar o dobro de Deslocamento pra sair dele. Não afeta ataques nem testes.",
    mecanica: { deslocamento: "metade" },
  },
  {
    id: "atordoado",
    nome: "Atordoado",
    efeito:
      "Perde todas as Ações e a Reação até o fim do próximo turno. Ataques contra você têm Vantagem, e você falha automaticamente em testes de resistência de Força e Agilidade.",
    mecanica: { semAcoes: true, vantagemParaQuemAtaca: true },
    duracaoPadrao: "Até o fim do próximo turno",
  },
  {
    id: "caido",
    nome: "Caído",
    efeito:
      "Desvantagem em qualquer ataque que você faça. Ataques corpo a corpo contra você têm Vantagem; ataques à distância contra você têm Desvantagem. Levantar-se custa metade do seu Deslocamento.",
    mecanica: { desvantagemEmAtaques: true, vantagemCorpoACorpo: true, desvantagemADistancia: true },
    duracaoPadrao: "Até se levantar",
  },
  {
    id: "cego",
    nome: "Cego",
    efeito:
      "Falha automaticamente em qualquer teste que dependa de visão. Seus ataques têm Desvantagem; ataques contra você têm Vantagem.",
    mecanica: { desvantagemEmAtaques: true, vantagemParaQuemAtaca: true },
  },
  {
    id: "congelado",
    nome: "Congelado",
    efeito:
      "Deslocamento reduzido a 0 e Desvantagem em testes de resistência de Agilidade, até quebrar o gelo (1 Ação, teste de Força CD 8 + BC de quem congelou) ou sofrer dano de fogo.",
    mecanica: { deslocamento: "zero" },
    duracaoPadrao: "Até quebrar o gelo",
  },
  {
    id: "desequilibrado",
    nome: "Desequilibrado",
    efeito:
      "Deslocamento reduzido à metade, não pode usar mais de uma Reação por rodada, e sofre Desvantagem em ataques de oportunidade. Dura até o fim do próximo turno do alvo, salvo instrução contrária da habilidade.",
    mecanica: { deslocamento: "metade" },
    duracaoPadrao: "Até o fim do próximo turno",
  },
  {
    id: "em-chamas",
    nome: "Em Chamas",
    efeito:
      "No início de cada um dos seus turnos, sofre 1d6 de dano ígneo (ou o valor que a habilidade que ateou o fogo especificar). Apaga submergindo em água, ficando Molhado, ou gastando 1 Ação inteira rolando no chão (teste de Agilidade CD 10).",
    mecanica: { danoPorTurno: "1d6" },
    duracaoPadrao: "Até apagar",
  },
  {
    id: "envenenado",
    nome: "Envenenado",
    efeito: "Desvantagem em ataques e em testes de atributo enquanto durar.",
    mecanica: { desvantagemEmAtaques: true, desvantagemEmTestes: true },
  },
  {
    id: "estagnacao",
    nome: "Estagnação (Fluxo Interrompido)",
    efeito:
      "Uma das duas faces do Fluxo Interrompido. Dentro da barreira, toda magia custa +1 PM por Bônus de Rank de quem a ergueu, e ninguém recupera PM por meio nenhum — nem descanso, nem item, nem habilidade.",
    sinonimos: ["Estagnação"],
  },
  {
    id: "fonte",
    nome: "Fonte (Fluxo Interrompido)",
    efeito:
      "A outra face do Fluxo Interrompido. Você e seus aliados dentro da barreira recuperam 1 PM no início de cada um dos seus turnos; quem não é seu aliado sofre Estagnação normalmente.",
    // "Fonte" sozinha entra como sinônimo, contra o meu palpite inicial.
    //
    // Eu tinha deixado de fora com medo de "a fonte do medo" virar link. A
    // medição desmentiu: varrendo a prosa das dezenove árvores, "Fonte" com F
    // maiúsculo aparece SETE vezes, e as sete são esta condição ("Você escolhe
    // Estagnação ou Fonte"). O uso comum da palavra é sempre minúsculo, e a
    // regra de maiúscula do reconhecedor já o exclui sozinha.
    sinonimos: ["Fonte"],
  },
  {
    id: "fluxo-interrompido",
    nome: "Fluxo Interrompido",
    efeito:
      "A barreira decide como a mana se move lá dentro. Ao erguer uma barreira você escolhe uma das duas faces — Estagnação ou Fonte — e ela vale pela duração inteira. Nunca as duas.",
  },
  {
    id: "incapacitado",
    nome: "Incapacitado",
    efeito:
      "Não pode tomar Ações nem Reações. Mais severo que Atordoado: não termina sozinho no fim do turno — só quando a fonte específica disser como remover.",
    mecanica: { semAcoes: true },
    duracaoPadrao: "Até a fonte remover",
  },
  {
    id: "marcado",
    nome: "Marcado",
    efeito:
      "Quem te marcou sabe seu PV aproximado, suas resistências e se você veste Touki, e ignora Cobertura parcial ao te atacar. Dura até ser removido pela habilidade que o concedeu, ou até você ficar fora do alcance dela por um Descanso Longo inteiro.",
    duracaoPadrao: "Até ser removido",
  },
  {
    id: "molhado",
    nome: "Molhado",
    efeito:
      "Dano de frio contra você é dobrado. Desvantagem em testes de resistência contra magias de gelo de quem te molhou. Fogo aplicado a um alvo Molhado evapora a água em vez de acender.",
  },
  {
    id: "paralisado",
    nome: "Paralisado",
    efeito:
      "Incapaz de agir e de se mover; falha automaticamente em testes de resistência de Força e Agilidade. Ataques corpo a corpo contra você são críticos automáticos se o atacante estiver adjacente.",
    mecanica: { semAcoes: true, deslocamento: "zero", vantagemCorpoACorpo: true },
  },
  {
    id: "petrificado",
    nome: "Petrificado",
    efeito:
      "Vira pedra (ou material equivalente): Incapacitado, imune a veneno e doença, e Resistência a todo dano enquanto durar. Reverter exige a fonte específica que petrificou, ou magia de rank igual ou superior.",
    mecanica: { semAcoes: true, deslocamento: "zero" },
    duracaoPadrao: "Até a fonte reverter",
  },
  {
    id: "soterrado",
    nome: "Soterrado",
    efeito:
      "A segunda metade da identidade da Terra, e o pagamento de Atolado: só pode ser aplicada a um alvo que já esteja Atolado, Preso ou Caído. Deslocamento 0, Preso, não enxerga nem conjura com gesto, e sofre 2d10 de sufocamento no início de cada turno se precisar respirar. Sai gastando 1 Ação num teste de Força (CD 8 + BC de quem soterrou), ou quando 30 de dano forem causados à terra que o cobre.",
    mecanica: { deslocamento: "zero", danoPorTurno: "2d10" },
    duracaoPadrao: "Até sair",
  },
  {
    id: "selado",
    nome: "Selado",
    efeito:
      "Dentro da barreira, nenhuma criatura conjura magia de rank SUPERIOR ao rank em Barreira de quem a ergueu — um Selado de rank Avançado permite magia até Avançado e barra Santo pra cima. Tentar mesmo assim gasta as Ações e o PM e falha. Não impede técnicas de Touki, ataques com arma nem habilidades de Utilidade: Selado é sobre mana, e só.",
  },
  {
    id: "preso",
    nome: "Preso",
    efeito:
      "Deslocamento reduzido a 0. Ataques contra você têm Vantagem; seus ataques têm Desvantagem. Solta-se gastando 1 Ação num teste (Atributo e CD definidos por quem prendeu).",
    mecanica: { deslocamento: "zero", desvantagemEmAtaques: true, vantagemParaQuemAtaca: true },
    duracaoPadrao: "Até se soltar",
  },
  {
    id: "quebrantado",
    nome: "Quebrantado",
    efeito:
      "Acumulável: cada acúmulo dá −1 na CA e −1 no dano de todos os seus ataques, até o máximo do Bônus de Rank de quem aplicou. Não é ferimento — magia de Cura não remove. Some com um Descanso Curto, ou dura até o fim do combate, o que vier primeiro.",
    mecanica: { acumulavel: true },
    duracaoPadrao: "Até o Descanso Curto",
  },
  {
    id: "surdo",
    nome: "Surdo",
    efeito:
      "Falha automaticamente em testes que dependam de audição. Não consegue usar Conjuração Padrão nem Encurtada (exigem cântico verbal) — só Conjuração Silenciosa continua funcionando pra você.",
  },
];

/**
 * O teto de acúmulos quando a mesa não disse QUEM aplicou a condição — 0.1.73.
 *
 * Quebrantado acumula "até o máximo do Bônus de Rank de quem aplicou", e a
 * ficha só conhece o rank do alvo. Sem a fonte informada, o limite cai no maior
 * Bônus de Rank que o livro concede a uma criatura que entra em combate.
 *
 * `Imperador` (6), e não `Deus` (7): o Rank Deus é narrativo, não se compra com
 * PA, e nenhuma linha do bestiário aplica condição com ele.
 */
export const TETO_DE_ACUMULOS = RANK_BONUS.Imperador;

export function getCondicaoPorId(id: string): Condicao | undefined {
  return CONDICOES.find((c) => c.id === id);
}
