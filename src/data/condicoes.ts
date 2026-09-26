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
  /** A condição empilha, e cada acúmulo conta (Quebrantado e Dose). */
  acumulavel?: boolean;
  /**
   * Teto fixo de acúmulos, quando ele não depende de quem aplicou. A Dose para
   * em 3 seja quem for o envenenador; o Quebrantado não tem este campo porque o
   * teto dele é o Bônus de Rank da fonte.
   */
  tetoFixo?: number;
  /**
   * O que a condição vira ao chegar no teto. A 3ª Dose não fica na ficha: ela
   * sai inteira e deixa o alvo Atordoado (o Colapso). Guardar isso aqui é o que
   * deixa a ficha fazer a troca sozinha, em vez de mostrar "3×" e esperar a mesa
   * lembrar.
   */
  noTetoVira?: string;
  /**
   * Efeitos que só valem a partir de certo número de acúmulos. Com 2 Doses o
   * alvo está Envenenado; com 1, ainda não.
   */
  aPartirDe?: { acumulos: number; rotulo: string; mecanica: Omit<MecanicaDeCondicao, "aPartirDe"> }[];
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
  /** Outras formas com que a prosa das habilidades cita esta condição. */
  sinonimos?: string[];
}

/** As 26 do Cap. 4, §2, em ordem alfabética — a mesma ordem em que a tabela sempre saiu impressa. */
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
      "Desvantagem em testes de atributo e em ataques enquanto a fonte do medo estiver visível. Não pode se mover voluntariamente pra mais perto dela. No fim de cada turno seu, repita o teste de resistência: um sucesso encerra a condição.",
    mecanica: { desvantagemEmAtaques: true, desvantagemEmTestes: true },
    duracaoPadrao: "Novo teste no fim de cada turno",
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
      "Deslocamento reduzido à metade. Dura até o fim do seu próximo turno, ou antes, se você gastar 1 Ação e passar num teste de Força (CD 8 + BC de quem te atolou). Não afeta ataques nem testes.",
    mecanica: { deslocamento: "metade" },
    duracaoPadrao: "Até o fim do próximo turno",
  },
  {
    /*
     * Rework da Desintoxicação, 2026-09-26 ("Dose e Inversão"). É a condição
     * que dá à escola uma jogada em combate: os venenos dela empilham Dose, e os
     * feitiços de purgar cobram a Dose de uma vez (Inverter, Cap. 2).
     */
    id: "dose",
    nome: "Dose",
    efeito:
      "Acumulável até 3, e só os venenos da Magia de Desintoxicação a aplicam. Com 1 Dose, nada ainda: o veneno está se instalando. Com 2 Doses, o alvo está Envenenado. A 3ª Dose é o Colapso: as Doses saem todas e o alvo fica Atordoado até o fim do próximo turno dele. Dura até o fim do combate (1 minuto fora dele), ou até ser purgada ou Invertida (Cap. 2, Desintoxicação). Construtos, mortos-vivos e quem não respira não recebem Dose.",
    mecanica: {
      acumulavel: true,
      tetoFixo: 3,
      noTetoVira: "atordoado",
      aPartirDe: [{ acumulos: 2, rotulo: "Dose ×2 (Envenenado)", mecanica: { desvantagemEmAtaques: true, desvantagemEmTestes: true } }],
    },
    duracaoPadrao: "Até o fim do combate",
    sinonimos: ["Doses"],
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
      "Desvantagem em qualquer ataque que você faça. Ataques corpo a corpo contra você têm Vantagem; ataques à distância contra você têm Desvantagem. Levantar-se gasta metade do Deslocamento de um Andar; com a outra metade, a mesma Ação ainda te move.",
    mecanica: { desvantagemEmAtaques: true, vantagemCorpoACorpo: true, desvantagemADistancia: true },
    duracaoPadrao: "Até se levantar",
  },
  {
    id: "cego",
    nome: "Cego",
    efeito:
      "Falha automaticamente em qualquer teste que dependa de visão. Seus ataques têm Desvantagem; ataques contra você têm Vantagem.",
    mecanica: { desvantagemEmAtaques: true, vantagemParaQuemAtaca: true },
    duracaoPadrao: "Até o fim do próximo turno",
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
      "Deslocamento reduzido à metade, e não pode usar Reação nenhuma — nem ataque de oportunidade, nem bloqueio. Dura até o fim do próximo turno do alvo, salvo instrução contrária da habilidade.",
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
    duracaoPadrao: "Até o fim do próximo turno",
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
      "Quem te marcou sabe seu PV aproximado, suas resistências e se você veste Touki, e ignora Cobertura parcial ao te atacar. Dura até o fim do combate, salvo instrução contrária da habilidade que marcou.",
    duracaoPadrao: "Até o fim do combate",
  },
  {
    id: "molhado",
    nome: "Molhado",
    efeito:
      "Vulnerável a frio: dano de frio contra você é dobrado (Cap. 4, §6). Desvantagem em testes de resistência contra magias que causem dano de frio, se forem de quem te molhou. Dura 1 minuto, ou até você sofrer dano ígneo: o dano entra normalmente, não acende Em Chamas, e seca a água.",
    duracaoPadrao: "1 minuto, ou até sofrer dano ígneo",
  },
  {
    id: "paralisado",
    nome: "Paralisado",
    efeito:
      "Incapaz de agir e de se mover; falha automaticamente em testes de resistência de Força e Agilidade. Ataques contra você têm Vantagem, e os corpo a corpo são críticos automáticos se o atacante estiver adjacente.",
    mecanica: { semAcoes: true, deslocamento: "zero", vantagemParaQuemAtaca: true },
  },
  {
    id: "petrificado",
    nome: "Petrificado",
    efeito:
      "Vira pedra (ou material equivalente): Incapacitado, imune a veneno e doença, e Resistência a todo dano enquanto durar. Reverter exige a fonte específica que petrificou, ou Desintoxicação de rank igual ou superior ao da aflição que petrificou (Cap. 4, §8). Magia de Cura não reverte petrificação em rank nenhum.",
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
      "Acumulável: cada acúmulo dá −1 na CA e −1 no dano de todos os seus ataques, até o máximo do Bônus de Rank de quem aplicou — o DOBRO disso se quem aplicou tiver a Maestria Nada Segura (Lutador, Avançado). Não é ferimento — magia de Cura não remove. Dura até o fim do combate (ou até um Descanso Curto, se foi aplicado fora de combate).",
    mecanica: { acumulavel: true },
    duracaoPadrao: "Até o fim do combate",
  },
  {
    id: "surpreso",
    nome: "Surpreso",
    efeito:
      "Na primeira rodada do combate você tem só 1 Ação e nenhuma Reação. Acaba no fim do seu primeiro turno. Fica Surpreso quem não percebeu a ameaça antes de a luta começar — na dúvida, a Furtividade de quem embosca contra a Percepção de cada alvo.",
    duracaoPadrao: "Até o fim do seu primeiro turno",
  },
  {
    id: "surdo",
    nome: "Surdo",
    efeito:
      "Falha automaticamente em testes que dependam de audição. Não consegue usar Conjuração Padrão nem Encurtada (exigem cântico verbal) — só Conjuração Silenciosa continua funcionando pra você.",
    duracaoPadrao: "Até o fim do próximo turno",
  },
];

/**
 * Estados que nascem de REGRA de capítulo, e não do efeito de uma habilidade.
 *
 * Moram fora de `CONDICOES` de propósito. O teste do glossário exige que toda
 * condição de `CONDICOES` seja aplicada por alguma habilidade das árvores, e
 * estes quatro vêm de outro lugar: cair a 0 PV (Cap. 4, §7), estabilizar,
 * ficar Escondido com a Ação de Se Esconder (Cap. 4, §3) e estar Desprevenido. Mesmo assim o livro
 * promete que "toda condição usada no livro está aqui, com número", e por isso
 * a tabela do Cap. 4, §2 imprime as duas listas juntas, em ordem alfabética.
 *
 * Não entram no reconhecedor de prosa nem no seletor da ficha: ninguém marca
 * "Desprevenido" com duração, e "inconsciente" aparece em minúscula na prosa
 * como palavra comum.
 */
export const ESTADOS_DE_REGRA: Condicao[] = [
  {
    id: "desprevenido",
    nome: "Desprevenido",
    efeito:
      "O alvo ainda não agiu neste combate, está Surpreso, ou não sabe onde você está. É o gatilho de técnicas como o Dano Furtivo e o Primeiro Golpe, que dizem o que ganham com ele.",
  },
  {
    id: "escondido",
    nome: "Escondido",
    efeito:
      "Se Esconder custa 1 Ação e exige Cobertura, escuridão ou estar fora da vista; teste de Agilidade (Furtividade) contra 10 + Espírito de cada inimigo que possa te procurar. Enquanto Escondido, seus ataques têm Vantagem e o alvo conta como Desprevenido. Atacar, falar alto ou sair do esconderijo revela você no fim daquela Ação.",
    duracaoPadrao: "Até atacar, falar alto ou sair do esconderijo",
  },
  {
    id: "estabilizado",
    nome: "Estabilizado",
    efeito:
      "A 0 PV, mas fora de perigo imediato: para de rolar o Fio da Vida e acorda com 1 PV em 1d4 horas, ou na hora com qualquer cura. Sofrer dano tira o Estabilizado e dá 1 Marca da Morte (2 se for crítico). Qualquer um estabiliza alguém com 1 Ação e teste de Medicina CD 10 (Vantagem com Kit de Primeiros Socorros).",
    duracaoPadrao: "Até acordar ou sofrer dano",
  },
  {
    id: "inconsciente",
    nome: "Inconsciente",
    efeito:
      "Incapacitado e Caído. Ataque corpo a corpo de criatura adjacente contra você é crítico. É onde você fica a 0 PV (Cap. 4, §7): nesse caso, sofrer dano dá 1 Marca da Morte (2 se for crítico) e tira o Estabilizado. Inconsciente com PV acima de 0 (sono de veneno, por exemplo) não ganha Marca: dura o que a fonte disser.",
    duracaoPadrao: "Até recuperar PV, ou o que a fonte disser",
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
/**
 * O teto ABSOLUTO que o livro permite, usado só como fallback quando o
 * rastreador não sabe o Bônus de Rank de quem aplicou.
 *
 * É o dobro do Bônus de Imperador porque a Maestria Nada Segura (Lutador,
 * Avançado) dobra o limite de acúmulos. Até 2026-09-17 isto era 6, e a ficha
 * travava em metade do que o livro permite — o Imperador do Lutador não
 * conseguia representar na tela os 12 acúmulos que a própria árvore descreve.
 */
export const TETO_DE_ACUMULOS = RANK_BONUS.Imperador * 2;

export function getCondicaoPorId(id: string): Condicao | undefined {
  return CONDICOES.find((c) => c.id === id);
}
