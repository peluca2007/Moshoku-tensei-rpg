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
  /**
   * 1 a 6 — o patamar, igual à escada de Ranks dos personagens. É também o
   * Bônus de Rank da criatura (Apêndice G): o número que entra onde uma regra
   * pede "o Bônus de Rank de quem acertou, derrubou ou aplicou". Não existe
   * coluna própria de propósito — RANK_BONUS já é +1 no 1º até +6 no 6º.
   */
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
/*
 * 2026-09-27 — o molde remedido (duas passadas no mesmo dia).
 *
 * A calibragem de 0.1.108 tinha dois vícios de instrumento, achados pelo
 * `npm run balancear`: (1) um dos quatro jogadores era a Tática, invisível
 * pro simulador — o molde foi medido contra um grupo de três; (2) a
 * criatura-molde soltava o dano do turno inteiro num golpe só, e o erro
 * rolava de novo contra o próximo da fila até acertar. Com os dois
 * consertados (quatro jogadores que o motor vê; três golpes por turno, e o
 * erro perde o golpe), o molde foi medido de novo com alvo aleatório:
 *
 * - o DANO sobe só até onde o mago de Vigor 0 ainda aguenta um turno de uma
 *   criatura do patamar (check:sobrevivencia ≥ ~1,2) — ~1,3× o antigo, e no
 *   6º quase o mesmo;
 * - o PV fecha o resto: 5 criaturas = Difícil (~65–74%), 4 = Equilibrado
 *   (95–99%), Chefe = Equilibrado (87–98%) do 1º ao 5º.
 *
 * O PV salta no 3º e no 6º porque o personagem salta ali (Avançado e
 * Imperador trazem as técnicas e magias de área que acabam com um grupo em
 * duas rodadas). No 6º nenhum ponto põe grupo e chefe na faixa ao mesmo
 * tempo: com 350/50, 5 criaturas ainda são Equilibrado (~95%) e o Chefe é
 * Difícil (~72%) — no auge, apertar um grupo pede uma criatura a mais.
 *
 * 2026-10-05 — o PV do 2º, 3º e 4º recalibrado (66 → 59, 139 → 108,
 * 176 → 141). Três correções do motor de 28 a 30/09 (preparo e
 * pré-requisitos cobrados, a IA sem gastar Reação como Ação, o BC só onde a
 * carta manda) tiraram dos heróis o que eles ganhavam de graça, e o 3º
 * patamar com 5 criaturas caiu de 67% pra 31% de vitória sem ninguém ver. O
 * `npm run check:molde` existe pra que isso não volte a acontecer calado.
 * O 5º e o 6º ficam: PV nenhum põe as 5 criaturas e o chefe na faixa juntos.
 *
 * 2026-10-08 — recalibrado de novo (53/59/108/141/350 → 64/68/121/152/332;
 * o 5º ficou em 210). Os heróis ficaram mais fortes de propósito: o truque da
 * escola passou a contar no motor, o mago de Fogo/Água/Vento/Cura subiu o Dado
 * de PV do 1º e 2º pra 1d6+1, e o invocador ganhou o Comando e invocados com
 * 10 × (Bônus + 1) PV. Sem recalibrar, 5 criaturas viravam luta Fácil.
 * No mesmo dia o motor parou de ler o comprimento de uma linha como raio, e
 * o 5º e o 6º entraram na faixa do livro pela primeira vez (5 criaturas ~72%).
 *
 * O molde supõe o personagem que VIVE no patamar (PA_TIPICO_POR_PATAMAR, em
 * ritmoDePa.ts). Grupo recém-chegado — a primeira sessão, com 3 PA — pede
 * lacaios ou uma criatura a menos.
 */
export const MOLDES_CRIATURA: MoldeCriatura[] = [
  { patamar: 1, titulo: "Comum", pv: 64, ca: 12, bonusAtaque: 3, danoPorTurno: 16, cdResistencia: 11 },
  { patamar: 2, titulo: "Perigosa", pv: 68, ca: 14, bonusAtaque: 4, danoPorTurno: 21, cdResistencia: 13 },
  { patamar: 3, titulo: "Ameaça", pv: 121, ca: 16, bonusAtaque: 6, danoPorTurno: 29, cdResistencia: 15 },
  { patamar: 4, titulo: "Elite", pv: 152, ca: 18, bonusAtaque: 8, danoPorTurno: 38, cdResistencia: 17 },
  { patamar: 5, titulo: "Terror", pv: 210, ca: 20, bonusAtaque: 10, danoPorTurno: 48, cdResistencia: 19 },
  { patamar: 6, titulo: "Lenda", pv: 332, ca: 22, bonusAtaque: 12, danoPorTurno: 50, cdResistencia: 21 },
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
 * O BLOCO DO MONSTRO — Apêndice G, "duas escolhas, a ficha inteira" (0.1.90).
 *
 * O Mestre não preenche ficha de monstro: ele escolhe PATAMAR e ARQUÉTIPO, e o
 * resto sai daqui. O patamar dá todos os números (a tabela MOLDES_CRIATURA), e
 * o arquétipo diz em qual atributo cada número aparece.
 *
 * Tudo abaixo DERIVA. Nenhum número é digitado duas vezes: se a coluna de Bônus
 * de Ataque mudar na tabela, os atributos mudam junto, porque o Principal é
 * literalmente `bonusAtaque - patamar`. Foi assim que a coluna de Bônus de
 * Resistência já era feita, e é o que impede o Apêndice G de envelhecer em
 * silêncio.
 */
export interface AtributosDaCriatura {
  principal: number;
  bom: number;
  comum: number;
  fraco: number;
}

/**
 * Os quatro degraus de atributo de um patamar.
 *
 * `principal = bonusAtaque - patamar` não é escolha estética: é o que faz a
 * coluna de acerto da tabela ser CONSEQUÊNCIA do atributo, e não um segundo
 * número que alguém precisa lembrar de manter alinhado.
 */
export function atributosDaCriatura(patamar: number): AtributosDaCriatura {
  const molde = getMoldePorPatamar(patamar);
  const principal = molde.bonusAtaque - molde.patamar;
  const bom = Math.ceil(principal / 2);
  return { principal, bom, comum: Math.max(0, bom - 1), fraco: -1 };
}

export type AtributoDaCriatura = "forca" | "agilidade" | "vigor" | "intelecto" | "espirito";

export const NOME_DO_ATRIBUTO: Record<AtributoDaCriatura, string> = {
  forca: "Força",
  agilidade: "Agilidade",
  vigor: "Vigor",
  intelecto: "Intelecto",
  espirito: "Espírito",
};

export interface ArquetipoCriatura {
  id: string;
  nome: string;
  /** Qual atributo recebe cada degrau. O que não está listado fica Comum. */
  principal: string;
  bom: string;
  comum: string[];
  fraco: string[];
  /** Metros por Ação de Andar. O padrão do livro é 9 (Cap. 4, §3). */
  deslocamento: number;
  /** Movimento que não é andar: voo, natação, escalada. */
  movimentoEspecial?: string;
  /**
   * O sentido que fura o Escondido, e até onde.
   *
   * É o campo mais importante do arquétipo depois dos atributos: sem ele, TODO
   * monstro é igualmente cego contra um ladino, e a metade furtiva do livro
   * (Ladino, Arquearia, Surpreso) deixa de ter oposição.
   */
  sentido?: string;
  exemplo: string;
  /**
   * O prêmio de risco na recompensa (Apêndice G, "A recompensa") — 2026-10-07.
   * Os números do patamar são os mesmos pra todo arquétipo; o que muda é o que
   * vencê-lo cobra do grupo além dos números: o Ágil escolhe a luta e foge, o
   * Conjurador e a Mente acertam o grupo em área e furam o esconderijo.
   */
  perigoNaRecompensa: number;
}

/**
 * Os cinco arquétipos do Apêndice G.
 *
 * São cinco, e não quinze, porque o arquétipo existe pra ser escolhido em voz
 * alta no meio de uma frase ("um bruto de 3º patamar"). Uma lista que não cabe
 * na cabeça do Mestre vira uma tabela que ele não abre.
 */
export const ARQUETIPOS_CRIATURA: ArquetipoCriatura[] = [
  {
    id: "bruto",
    nome: "Bruto",
    principal: "Força",
    bom: "Vigor",
    comum: ["Agilidade"],
    fraco: ["Intelecto", "Espírito"],
    deslocamento: 6,
    exemplo: "Ogro de Guerra, urso das cavernas, golem de pedra.",
    perigoNaRecompensa: 1,
  },
  {
    id: "agil",
    nome: "Ágil",
    principal: "Agilidade",
    bom: "Vigor",
    comum: ["Força"],
    fraco: ["Intelecto", "Espírito"],
    deslocamento: 12,
    sentido: "Faro e audição: fura o Escondido a até 9 m.",
    exemplo: "Lobo de gelo, assassino, Wyvern.",
    perigoNaRecompensa: 1.25,
  },
  {
    id: "fortaleza",
    nome: "Fortaleza",
    principal: "Vigor",
    bom: "Força",
    comum: ["Espírito"],
    fraco: ["Agilidade", "Intelecto"],
    deslocamento: 6,
    exemplo: "Tartaruga de casco, cavaleiro em placas, tronco animado.",
    perigoNaRecompensa: 1,
  },
  {
    id: "conjurador",
    nome: "Conjurador",
    principal: "Intelecto",
    bom: "Espírito",
    comum: ["Agilidade", "Vigor"],
    fraco: ["Força"],
    deslocamento: 9,
    sentido: "Vê mana: fura invisibilidade mágica e enxerga barreiras a até 18 m.",
    exemplo: "Necromante, xamã goblin, Superd Renegado.",
    perigoNaRecompensa: 1.5,
  },
  {
    id: "mente",
    nome: "Mente",
    principal: "Espírito",
    bom: "Intelecto",
    comum: ["Agilidade", "Vigor"],
    fraco: ["Força"],
    deslocamento: 9,
    sentido: "Sente intenção: fura o Escondido de quem pretende atacá-la, a até 18 m.",
    exemplo: "Íncubo, ilusionista, dragão antigo.",
    perigoNaRecompensa: 1.5,
  },
];

export function getArquetipo(id: string | undefined): ArquetipoCriatura | undefined {
  return ARQUETIPOS_CRIATURA.find((a) => a.id === id);
}

export interface SubArquetipoCriatura {
  id: string;
  nome: string;
  /**
   * O que o corpo dela deixa — ids da categoria `tralha` do catálogo.
   *
   * É por aqui que a recompensa deixa de ser sorteio e passa a sair do que foi
   * derrotado: um lobo larga presa, e nunca mais uma poção de mana.
   */
  espolios: string[];
  /**
   * Quanto dela vem em moeda.
   *
   * `nenhuma` não é detalhe de sabor: é metade da economia de escassez do
   * Cap. 5. Um lobo não carrega bolsa, então caçar rende espólio pra vender —
   * e é por isso que vale mais que saquear bandido, cujo equipamento revende
   * pela metade.
   */
  moeda: "nenhuma" | "pouca" | "bolsa";
  /** Sugestão, não trava: o Mestre continua editando o bloco à mão. */
  resistencias?: string[];
  imunidades?: string[];
  /** Duas ou três Ações típicas, pra montar um monstro sem inventar do zero. */
  acoesSugeridas: string[];
  exemplo: string;
  /**
   * Quanto o corpo dela vale na recompensa (Apêndice G, "A recompensa") — 2026-10-07.
   * Morto-vivo carrega trapo; construto e demônio carregam gema; dragão é o
   * corpo mais caro do mundo.
   */
  riqueza: number;
  /**
   * O espólio que sobra quando os itens da lista não cobrem o valor da
   * criatura: o couro inteiro, o núcleo, o sangue. Vende pelo preço cheio,
   * como toda tralha (Cap. 5, "Vender o que caiu").
   */
  partesValiosas: { nome: string; descricao: string };
}

/**
 * Os seis sub-arquétipos do Apêndice G (2026-09-23).
 *
 * O arquétipo diz o que a criatura FAZ; o sub-arquétipo diz o que ela É. Os
 * dois se cruzam: um Bruto/Besta é um urso, um Bruto/Morto-Vivo é um zumbi
 * grande, um Conjurador/Humanoide é um necromante — 5 × 6 dá trinta criaturas
 * reconhecíveis a partir de onze palavras.
 *
 * São seis pelo mesmo motivo que os arquétipos são cinco: a lista existe pra
 * ser escolhida em voz alta no meio de uma frase. O que ela carrega é
 * justamente o que o arquétipo não tem como saber — de onde vem o espólio, se
 * o bicho carrega bolsa, e o que costuma não machucá-lo.
 */
export const SUBARQUETIPOS_CRIATURA: SubArquetipoCriatura[] = [
  {
    id: "besta",
    nome: "Besta",
    espolios: ["tralha_presa_lobo_gigante", "tralha_chifre_besta_terrestre", "tralha_casco_besouro_tartaruga"],
    moeda: "nenhuma",
    acoesSugeridas: ["Mordida", "Investida (corre e derruba)", "Uivo que chama o bando"],
    exemplo: "Lobo de gelo, urso das cavernas, javali gigante.",
    riqueza: 1,
    partesValiosas: { nome: "Couro e ossos aproveitáveis", descricao: "O couro inteiro, os tendões e os ossos grandes. Curtidor e alquimista dividem o bicho entre si." },
  },
  {
    id: "monstruosidade",
    nome: "Monstruosidade",
    espolios: ["tralha_frasco_acido_gastrico", "tralha_po_asa_mariposa_ilusoria", "tralha_casco_besouro_tartaruga"],
    moeda: "nenhuma",
    acoesSugeridas: ["Ácido ou cuspe em área", "Agarrar e engolir", "Regenerar no início do turno"],
    exemplo: "Sapo-lodo, mariposa ilusória, treant corrompido.",
    riqueza: 1.25,
    partesValiosas: { nome: "Glândulas e órgãos raros", descricao: "O que faz o monstro ser monstro: a bolsa de ácido, o olho que hipnotiza. Alquimista paga caro e não pergunta." },
  },
  {
    id: "humanoide",
    nome: "Humanoide",
    espolios: ["tralha_moeda_antiga_shirone", "tralha_fivela_aventureiro_morto", "tralha_estatueta_madeira_engracada"],
    moeda: "bolsa",
    acoesSugeridas: ["Ataque com arma de verdade", "Pedir rendição ou fugir a 1/4 dos PV", "Flanquear em dupla"],
    exemplo: "Bandido, guarda, cultista, mercenário.",
    riqueza: 1,
    partesValiosas: { nome: "Pertences de valor", descricao: "Anel, botas boas, um selo de família. Tem dono em algum lugar, e o lojista sabe disso." },
  },
  {
    id: "morto-vivo",
    nome: "Morto-Vivo",
    espolios: ["tralha_pano_amaldicoado", "tralha_fivela_aventureiro_morto", "tralha_moeda_antiga_shirone"],
    moeda: "pouca",
    resistencias: ["veneno"],
    imunidades: ["psíquico"],
    acoesSugeridas: ["Garra que impede cura por 1 rodada", "Toque gélido", "Levantar-se uma vez com 1 PV"],
    exemplo: "Zumbi, esqueleto, lich, fantasma de aventureiro.",
    riqueza: 0.75,
    partesValiosas: { nome: "Relíquias de túmulo", descricao: "O que foi enterrado com ele: medalha, broche, fivela de prata. O templo compra pra devolver à família." },
  },
  {
    id: "construto",
    nome: "Construto",
    espolios: ["tralha_gema_magica_opaca", "tralha_casco_besouro_tartaruga"],
    moeda: "nenhuma",
    imunidades: ["veneno", "psíquico"],
    acoesSugeridas: ["Golpe de peso que aplica Quebrantado", "Ignorar a primeira condição da cena", "Parar de funcionar a 0 PV, sem Fio da Vida"],
    exemplo: "Golem de pedra, armadura animada, autômato de Ranoa.",
    riqueza: 1.5,
    partesValiosas: { nome: "Núcleo e circuito de mana", descricao: "A peça que fazia o corpo andar. A Universidade de Ranoa e todo encantador querem uma." },
  },
  {
    id: "demonio",
    nome: "Demônio",
    espolios: ["tralha_gema_magica_opaca", "tralha_pano_amaldicoado", "tralha_po_asa_mariposa_ilusoria"],
    moeda: "pouca",
    resistencias: ["psíquico"],
    acoesSugeridas: ["Palavra que impõe Amedrontado", "Olho demoníaco (uma vez por combate)", "Trocar de lugar com um aliado"],
    exemplo: "Íncubo, imperatriz demônio menor, espírito do Continente Demônio.",
    riqueza: 1.5,
    partesValiosas: { nome: "Cristal de mana demoníaco", descricao: "A mana do Continente Demônio, solidificada onde o coração estaria. Vende bem e fora de vista." },
  },
  // Os três de 2026-10-07: o autor pediu mais variação no que a mesa monta e
  // no que ela ganha. Cinco por nove dão 45 criaturas reconhecíveis.
  {
    id: "elemental",
    nome: "Elemental",
    espolios: ["tralha_frasco_elemento_vivo", "tralha_nucleo_elemental_apagado", "tralha_gema_magica_opaca"],
    moeda: "nenhuma",
    imunidades: ["o próprio elemento"],
    acoesSugeridas: ["Explodir em área do próprio elemento", "Virar o terreno (fogo, lama, gelo)", "Absorver o próprio elemento e curar"],
    exemplo: "Salamandra, serpente de fogo, espírito da tempestade.",
    riqueza: 1.5,
    partesValiosas: { nome: "Essência elemental", descricao: "O elemento que sobrou quando a criatura se desfez, preso num frasco que ainda esquenta ou gela. Encantador paga pelo dano elemental que ela vira." },
  },
  {
    id: "dragonico",
    nome: "Dragônico",
    espolios: ["tralha_escama_wyvern", "tralha_dente_dragao_menor", "tralha_sangue_draconico"],
    moeda: "pouca",
    resistencias: ["o elemento do sopro"],
    acoesSugeridas: ["Sopro em cone do próprio elemento", "Asa que derruba quem está perto", "Voar pra fora do alcance e voltar"],
    exemplo: "Wyvern, hidra, dragão vermelho.",
    riqueza: 2,
    partesValiosas: { nome: "Escamas, garras e coração de dragão", descricao: "O corpo mais caro do mundo, peça por peça. Ferreiro, alquimista e nobre disputam cada uma." },
  },
  {
    id: "planta",
    nome: "Planta",
    espolios: ["tralha_semente_que_nao_germina", "tralha_seiva_de_treant", "tralha_madeira_viva"],
    moeda: "nenhuma",
    resistencias: ["contundente", "perfurante"],
    acoesSugeridas: ["Raízes que deixam Atolado", "Esporos que deixam Envenenado", "Regenerar no início do turno, menos se pegou fogo"],
    exemplo: "Treant ancião, flor carnívora, musgo que anda.",
    riqueza: 0.75,
    partesValiosas: { nome: "Madeira e resina boas", descricao: "Tora de cerne e resina que não apodrece. Carpinteiro de navio e fabricante de arco pagam o preço cheio." },
  },
];

/**
 * A RECOMPENSA (Apêndice G, "A recompensa") — decisão do autor, 2026-10-07.
 *
 * Antes o livro tinha preço pra tudo e renda pra nada: o orçamento do
 * /encontros começava em 0 e o Mestre chutava. Agora cada criatura derrotada
 * vale uma conta de quatro números, e o encontro vale a soma:
 *
 *   PO = base do patamar × papel × arquétipo × sub-arquétipo
 *
 * A base dobra a cada patamar, como os preços da loja (a poção de cura vai de
 * 15 PO no 1º a 400 no 6º; o encantamento, de 150 a 1.500). A imunidade conta um
 * patamar acima, igual ao Orçamento de Encontro: o bicho que apaga a jogada de
 * alguém custa mais pra vencer e vale mais.
 */
export const PO_DO_PATAMAR = [10, 20, 40, 80, 160, 320] as const;

/** O papel pesa na recompensa o mesmo que pesa no Orçamento de Encontro. */
export const PAPEL_NA_RECOMPENSA: Record<PapelCriatura, number> = { lacaio: 0.5, padrao: 1, chefe: 4 };

/** Quanto do valor da criatura vem em moeda; o resto vem em espólio (e, de quem carrega bolsa, em equipamento). */
export const FRACAO_EM_MOEDA: Record<SubArquetipoCriatura["moeda"], number> = { nenhuma: 0, pouca: 0.3, bolsa: 0.6 };

export function poDoPatamar(patamar: number): number {
  const p = Math.max(1, Math.round(patamar));
  // Um imune no 6º patamar conta como 7º: a base continua dobrando.
  return p <= PO_DO_PATAMAR.length ? PO_DO_PATAMAR[p - 1] : PO_DO_PATAMAR[PO_DO_PATAMAR.length - 1] * 2 ** (p - PO_DO_PATAMAR.length);
}

/** O valor de uma criatura derrotada, em PO, arredondado pro inteiro mais perto. */
export function recompensaDaCriatura(c: {
  patamar: number;
  papel: PapelCriatura;
  arquetipo?: string;
  subArquetipo?: string;
  temImunidade?: boolean;
}): number {
  const base = poDoPatamar(c.patamar + (c.temImunidade ? 1 : 0));
  const arquetipo = getArquetipo(c.arquetipo)?.perigoNaRecompensa ?? 1;
  const sub = getSubArquetipo(c.subArquetipo)?.riqueza ?? 1;
  return Math.round(base * PAPEL_NA_RECOMPENSA[c.papel] * arquetipo * sub);
}

export function getSubArquetipo(id: string | undefined): SubArquetipoCriatura | undefined {
  return SUBARQUETIPOS_CRIATURA.find((s) => s.id === id);
}

/**
 * Os cinco atributos prontos de uma criatura, já distribuídos pelo arquétipo.
 *
 * Sem arquétipo, tudo Comum: é o monstro genérico, e ele funciona — só não tem
 * identidade nenhuma, que é exatamente o que o arquétipo vende.
 */
export function fichaDeAtributos(
  patamar: number,
  arquetipoId?: string
): Record<AtributoDaCriatura, number> {
  const d = atributosDaCriatura(patamar);
  const arq = getArquetipo(arquetipoId);
  const base: Record<AtributoDaCriatura, number> = {
    forca: d.comum,
    agilidade: d.comum,
    vigor: d.comum,
    intelecto: d.comum,
    espirito: d.comum,
  };
  if (!arq) return base;
  const chave = (nome: string): AtributoDaCriatura | undefined =>
    (Object.keys(NOME_DO_ATRIBUTO) as AtributoDaCriatura[]).find(
      (k) => NOME_DO_ATRIBUTO[k] === nome
    );
  const p = chave(arq.principal);
  const b = chave(arq.bom);
  if (p) base[p] = d.principal;
  if (b) base[b] = d.bom;
  for (const nome of arq.fraco) {
    const k = chave(nome);
    if (k) base[k] = d.fraco;
  }
  return base;
}

/**
 * Quantas perícias a criatura tem Vantagem — Apêndice G: metade do patamar,
 * arredondado pra cima.
 */
export function periciasDaCriatura(patamar: number): number {
  return Math.ceil(Math.min(6, Math.max(1, patamar)) / 2);
}

/**
 * Percepção passiva = 10 + Espírito, a MESMA fórmula da regra de ficar Escondido
 * (Cap. 4, §3). Nenhuma exceção pra monstro: é o que faz esconder-se de um bruto
 * ser fácil e de um íncubo ser quase impossível, sem tabela nova.
 */
export function percepcaoPassiva(patamar: number, arquetipoId?: string): number {
  return 10 + fichaDeAtributos(patamar, arquetipoId).espirito;
}

/** "+3" / "0" / "−1" — o sinal que o livro imprime. */
export function sinal(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return "0";
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
 * Aplica o papel do Apêndice G ao molde do patamar.
 *
 * Os três papéis não são sabor: "Ajustando pra cima ou pra baixo" define cada
 * um como uma transformação numérica. Passar por aqui garante que uma criatura
 * criada na tela e uma citada no livro respondam pela mesma conta.
 *
 * Mora aqui, e não no simulador, porque é REGRA DO LIVRO: o Apêndice G não pode
 * depender do formato que a ferramenta usa. `encounterSim.ts` reexporta.
 */
export function aplicarPapel(patamar: number, papel: PapelCriatura): {
  pv: number;
  danoPorTurno: number;
} {
  const molde = getMoldePorPatamar(patamar);
  if (papel === "lacaio") {
    return { pv: Math.round(molde.pv / 2), danoPorTurno: Math.round(molde.danoPorTurno / 2) };
  }
  // O chefe: duas vezes e meia o PV e uma vez e meia o dano do molde.
  // Era o triplo do PV (2026-09-27, manhã) medido com o golpe antigo da
  // criatura-molde, que nunca perdia dano. Com os três golpes (errar perde o
  // golpe) e o molde remedido, o triplo dava Difícil do 3º em diante (67–73%);
  // com 2,5× fica Equilibrado do 1º ao 5º (87–98%) e Difícil no 6º (78%) — o
  // peso de quatro criaturas.
  if (papel === "chefe") {
    return { pv: Math.round(molde.pv * 2.5), danoPorTurno: Math.round(molde.danoPorTurno * 1.5) };
  }
  return { pv: molde.pv, danoPorTurno: molde.danoPorTurno };
}

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
 * O ORÇAMENTO DE ENCONTRO — Apêndice G (0.1.90).
 *
 * A primeira pergunta de todo Mestre montando a primeira sessão é "quantas
 * criaturas, e de qual patamar", e o livro não respondia. A regra é uma só:
 * um encontro equilibrado é UMA CRIATURA DO PATAMAR DO GRUPO POR JOGADOR.
 *
 * O resto é câmbio, e ele é geométrico de propósito — dobrar a cada patamar é
 * a única curva que casa com uma tabela de PV que multiplica por 16 do 1º ao 6º
 * e com um dano que multiplica por 12. Uma escada aritmética diria que dois
 * lacaios de 1º equivalem a uma Lenda, e a mesa descobriria o contrário na pior
 * hora possível.
 */
export const TEMPERATURAS = [
  { id: "facil", nome: "Fácil", ate: 0.75, descricao: "Gasta munição e mostra o bicho. Ninguém cai." },
  {
    id: "equilibrado",
    nome: "Equilibrado",
    ate: 1,
    descricao: "Custa recursos e não mata. É o encontro padrão: três ou quatro por Descanso Longo.",
  },
  {
    id: "dificil",
    nome: "Difícil",
    ate: 1.25,
    descricao: "Alguém vai acabar com pouca vida. Bom pra fechar um dia de aventura.",
  },
  {
    id: "mortal",
    nome: "Mortal",
    ate: Infinity,
    descricao: "Alguém vai ao Fio da Vida. Guarde pro fim do arco — e avise a mesa.",
  },
] as const;

export type Temperatura = (typeof TEMPERATURAS)[number]["id"];

/**
 * Quanto UMA criatura pesa no orçamento, em "criaturas do patamar do grupo".
 *
 * O papel entra porque o Apêndice G já transforma os números por papel: o
 * lacaio tem metade do PV e do dano (logo, meia criatura), e o chefe tem 2,5×
 * o PV e dano uma vez e meia MAIS uma rodada inteira a cada dois
 * personagens — o que, medido em batalha, vale quatro criaturas.
 *
 * A imunidade é o preço declarado dela: apagar a jogada de alguém da mesa faz
 * a criatura contar como um patamar acima.
 */
export function pesoNoOrcamento(
  patamarDaCriatura: number,
  papel: PapelCriatura,
  patamarDoGrupo: number,
  temImunidade = false
): number {
  const efetivo = patamarDaCriatura + (temImunidade ? 1 : 0);
  const diferenca = efetivo - patamarDoGrupo;
  // Dobra a cada patamar acima, cai pela metade a cada patamar abaixo, e nunca
  // chega a zero: mil ratos ainda são um problema, só que um problema pequeno.
  const porPatamar = Math.pow(2, diferenca);
  // O chefe pesa 4 desde 2026-09-27 (era 5, e 3 antes disso): medido no
  // simulador, um chefe sozinho contra quatro jogadores é tão Equilibrado
  // quanto quatro criaturas do patamar.
  const porPapel = papel === "chefe" ? 4 : papel === "lacaio" ? 0.5 : 1;
  return porPatamar * porPapel;
}

export interface ResultadoDoOrcamento {
  /** Quanto o encontro pesa, em criaturas do patamar do grupo. */
  peso: number;
  /** Quanto caberia num encontro equilibrado: um por jogador. */
  orcamento: number;
  /** peso ÷ orçamento. 1,0 é exatamente equilibrado. */
  razao: number;
  temperatura: Temperatura;
  nome: string;
  descricao: string;
}

/**
 * O peso de um encontro inteiro, contra um grupo.
 *
 * Recebe uma lista simples (patamar, papel, quantidade, imunidade) em vez de
 * CriaturaEncontro porque isto é REGRA DO LIVRO, e o Apêndice G não pode
 * depender do formato que a ferramenta usa pra guardar criatura — a dependência
 * anda só no outro sentido.
 */
export function orcamentoDeEncontro(
  criaturas: { patamar: number; papel: PapelCriatura; quantidade: number; temImunidade?: boolean }[],
  tamanhoDoGrupo: number,
  patamarDoGrupo: number
): ResultadoDoOrcamento | null {
  if (tamanhoDoGrupo <= 0 || criaturas.length === 0) return null;
  const peso = criaturas.reduce(
    (soma, c) =>
      soma +
      pesoNoOrcamento(c.patamar, c.papel, patamarDoGrupo, c.temImunidade) *
        Math.max(0, c.quantidade),
    0
  );
  const orcamento = tamanhoDoGrupo;
  const razao = peso / orcamento;
  const faixa = TEMPERATURAS.find((t) => razao <= t.ate) ?? TEMPERATURAS[TEMPERATURAS.length - 1];
  return {
    peso,
    orcamento,
    razao,
    temperatura: faixa.id,
    nome: faixa.nome,
    descricao: faixa.descricao,
  };
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
  /** A CD do teste de Vigor contra o Envenenado; sem ela, o veneno pega sem teste. */
  cdVeneno?: number;
  nota: string;
}


/**
 * AÇÕES SUGERIDAS — o segundo buraco do Bloco do Monstro (0.1.90).
 *
 * Definir os atributos de um monstro resolveu "qual a Força dele?". Sobrou o
 * problema mais chato: o Mestre ainda precisava inventar as fórmulas de dado.
 * "Quanto uma Ameaça bate num golpe?" é uma pergunta de calibragem, não de
 * ficção — e o livro já sabe a resposta, porque a coluna "Dano por turno" da
 * tabela é exatamente isso.
 *
 * O que esta função faz é distribuir esse orçamento em três Ações, no formato
 * que o arquétipo pede: o Bruto dá um golpe grande e uma investida lenta; o
 * Ágil dá dois golpes rápidos; o Conjurador troca precisão por área.
 *
 * ## O que ela NÃO faz
 *
 * Não inventa ficção. Os nomes são genéricos de propósito ("Golpe Pesado", e
 * não "Machadada do Ogro Sangrento") — o Mestre troca o nome em dois segundos e
 * nunca vai querer o nome que uma função escolheu. O que ele não quer fazer é a
 * conta.
 *
 * ## A régua
 *
 * As três Ações de um turno somam o `danoPorTurno` do patamar. É a mesma
 * régua que as seis criaturas prontas obedecem, e que o `encounterSim.test.ts`
 * confere — uma criatura gerada aqui vale o mesmo que uma escrita à mão.
 */

/**
 * Um dado que rende perto de `alvo` de média, no formato NdX+F.
 *
 * O `faces` pedido é uma PREFERÊNCIA, não uma ordem: quando o orçamento é menor
 * que a média do dado (o 1º patamar inteiro cabe em 3,3 por Ação), insistir num
 * d8 obriga a arredondar 1d8 pra cima e o monstro sai 35% acima da régua. Nesse
 * caso a função desce a escada até um dado que caiba — é o mesmo motivo de a
 * adaga existir no livro.
 */
function formulaPara(alvo: number, faces: number): string {
  const escada = [4, 6, 8, 10, 12];
  let usadas = faces;
  while (usadas > 4 && (usadas + 1) / 2 > alvo) {
    usadas = escada[escada.indexOf(usadas) - 1] ?? 4;
  }
  const mediaDoDado = (usadas + 1) / 2;
  const n = Math.max(1, Math.round(alvo / mediaDoDado));
  // Pra baixo, nunca pra cima: errar pra cima mata personagem (ver o teste
  // dos 110% em acoesSugeridas.test.ts).
  const fixo = Math.floor(alvo - n * mediaDoDado);
  if (fixo > 0) return n + "d" + usadas + "+" + fixo;
  if (fixo < 0 && n > 1) return n + "d" + usadas + fixo;
  return n + "d" + usadas;
}

export function acoesSugeridas(
  patamar: number,
  papel: PapelCriatura,
  arquetipoId?: string
): AcaoPronta[] {
  const { danoPorTurno } = aplicarPapel(patamar, papel);
  const arq = getArquetipo(arquetipoId)?.id ?? "bruto";
  // Um terço do orçamento é o que UMA Ação vale. Tudo abaixo é múltiplo disso.
  const porAcao = danoPorTurno / 3;

  /*
   * O PISO DO DADO — o lacaio de 1º patamar.
   *
   * O menor dado do livro é o d4, que rende 2,5. Quando o orçamento do turno
   * inteiro fica abaixo de 7,5, três ataques do menor dado que existe já
   * passam da régua, e não há fórmula de dado que resolva — o problema é
   * granularidade, não conta. (Era o lacaio de 1º até o molde de 2026-09-27;
   * com o molde novo ele cabe, e esta saída só volta se o molde descer.)
   *
   * A saída é de ficção, e é a certa pra um lacaio: ele não ataca três vezes
   * por turno. Ele avança e dá UM golpe, que é exatamente o que um bicho que
   * "existe pra vir em bando" faz. Um ataque de 2 Ações deixa a terceira pra
   * andar, e o turno dele fica abaixo do orçamento em vez de acima — errar pra
   * baixo na criatura mais fraca do livro não tira nada de ninguém.
   */
  if (porAcao < 2.5) {
    return [
      {
        nome: "Avançar e Golpear",
        acoes: 2,
        dano: formulaPara(danoPorTurno * 0.8, 6),
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        nota: "Um golpe por turno, e a Ação que sobra é pra chegar perto. Lacaio não tem economia de ação: o perigo dele é o número de corpos, não o que cada um faz.",
      },
    ];
  }

  if (arq === "agil") {
    return [
      {
        nome: "Golpe Rápido",
        acoes: 1,
        dano: formulaPara(porAcao, 6),
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        nota: "O ataque comum dela. Cabe três vezes num turno.",
      },
      {
        nome: "Bote",
        acoes: 2,
        dano: formulaPara(porAcao * 2.2, 8),
        alcance: "Corpo a corpo, depois de correr 6 m",
        area: false,
        tipo: "ataque",
        aplicaCaido: true,
        nota: "Requer 6 m de corrida. Se acertar, o alvo também fica Caído.",
      },
    ];
  }

  if (arq === "conjurador" || arq === "mente") {
    return [
      {
        nome: arq === "mente" ? "Toque da Mente" : "Dardo de Mana",
        acoes: 1,
        dano: formulaPara(porAcao, 6),
        alcance: "18 metros",
        area: false,
        tipo: "ataque",
        nota: "O ataque de sobra dela, pra quando não vale gastar o grande.",
      },
      {
        nome: arq === "mente" ? "Onda de Pavor" : "Explosão de Mana",
        acoes: 2,
        dano: formulaPara(porAcao * 1.8, 8),
        alcance: "Esfera de 6 m de raio, a até 18 m",
        area: true,
        tipo: "resistencia",
        nota: "Teste de resistência contra a CD dela: metade do dano se passar (Cap. 2, §7).",
      },
    ];
  }

  if (arq === "fortaleza") {
    return [
      {
        nome: "Investida de Escudo",
        acoes: 1,
        dano: formulaPara(porAcao, 8),
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        nota: "Empurra 1,5 m se acertar (Cap. 4, §3).",
      },
      {
        nome: "Firmar Posição",
        acoes: 1,
        dano: "",
        alcance: "Pessoal",
        area: false,
        tipo: "ataque",
        nota: "Até o próximo turno dela, o dano que ela sofre cai pela metade e ela não pode ser movida à força. É o que faz a Fortaleza demorar a cair sem precisar de mais PV.",
      },
    ];
  }

  // Bruto — e o padrão de quem não escolheu arquétipo.
  return [
    {
      nome: "Golpe Pesado",
      acoes: 1,
      dano: formulaPara(porAcao, 8),
      alcance: "Corpo a corpo",
      area: false,
      tipo: "ataque",
      nota: "O ataque comum dela.",
    },
    {
      nome: "Pisão",
      acoes: 2,
      dano: formulaPara(porAcao * 2, 10),
      alcance: "Corpo a corpo",
      area: false,
      tipo: "ataque",
      aplicaCaido: true,
      nota: "Se acertar, o alvo também fica Caído.",
    },
  ];
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
  /**
   * O BLOCO DO MONSTRO das criaturas prontas — Apêndice G (0.1.90).
   *
   * Espelha os campos de `CriaturaEncontro` porque as seis são o EXEMPLO que o
   * livro imprime: um bloco que nenhuma criatura do bestiário demonstra é uma
   * regra que a mesa nunca vê funcionando. Atributos, Percepção e Deslocamento
   * não estão aqui de propósito — eles derivam de `patamar` + `arquetipo`.
   */
  arquetipo?: string;
  tamanho?: string;
  /** Sobrescreve o Deslocamento do arquétipo, em metros. */
  deslocamento?: number;
  pericias?: string[];
  resistencias?: string[];
  imunidades?: string[];
  movimentoEspecial?: string;
  sentido?: string;
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
    arquetipo: "bruto",
    tamanho: "Grande",
    pericias: ["Furtividade"],
    resistencias: ["veneno"],
    movimentoEspecial: "Nada 9 m; anfíbio.",
    sentido: "Sente vibração na água e na lama: fura o Escondido a até 9 m em terreno molhado.",
    perigo: "Língua pegajosa (Preso, CD 11) e a Baba de Sapo-Lodo (Cap. 4, §8) em cada mordida.",
    acoes: [
      {
        nome: "Mordida Babosa",
        acoes: 1,
        dano: "1d6+2",
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        nota: "Quem for mordido faz teste de Vigor CD 10; na falha, pega Baba de Sapo-Lodo (Cap. 4, §8 — aflição de rank Principiante).",
      },
      {
        nome: "Língua Pegajosa",
        acoes: 1,
        dano: "1d4+1",
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
    arquetipo: "agil",
    tamanho: "Médio",
    pericias: ["Furtividade"],
    resistencias: ["veneno"],
    movimentoEspecial: "Nada 12 m; escala 6 m.",
    perigo: "A picada envenena quem falha no Vigor, e a Veneno de Serpente-do-Pântano (Cap. 4, §8) continua trabalhando depois da luta.",
    acoes: [
      {
        nome: "Picada Peçonhenta",
        acoes: 1,
        dano: "1d6+4",
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        aplicaVeneno: true,
        cdVeneno: 12,
        nota: "Se acertar, o alvo faz um teste de Vigor CD 12. Na falha, fica Envenenado até o fim do próximo turno dele e contrai Veneno de Serpente-do-Pântano (Cap. 4, §8 — aflição de rank Intermediário), que continua cobrando depois da luta. A aflição não acumula: a segunda picada não piora o que a primeira já fez.",
      },
      {
        nome: "Bote e Recuo",
        acoes: 2,
        dano: "2d6+6",
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
    arquetipo: "agil",
    tamanho: "Médio",
    pericias: ["Furtividade"],
    resistencias: ["veneno"],
    movimentoEspecial: "Escala 12 m, inclusive em teto liso.",
    perigo: "Teia que aplica Preso em área antes do combate começar; ataca de emboscada com Vantagem, e cada mordida deixa a presa mais lenta.",
    acoes: [
      {
        nome: "Presas",
        acoes: 1,
        dano: "1d8+3",
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        nota: "Na primeira rodada, se veio de emboscada, rola com Vantagem. Se acertar, o alvo faz um teste de Vigor CD 13. Na falha, perde 3 m de Deslocamento até o fim do combate (cumulativo, até 0); se falhar por 5 ou mais, também contrai Toxina de Aranha Gigante (Cap. 4, §8).",
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
    arquetipo: "agil",
    tamanho: "Grande",
    pericias: ["Percepção","Sobrevivência"],
    resistencias: ["veneno"],
    movimentoEspecial: "Voa 18 m — e é por isso que ela abre a luta a 18 m de altura.",
    perigo: "Voa e mergulha pra morder; depois do mergulho fica baixa até o turno seguinte, e é aí que o grupo inteiro pode puni-la.",
    acoes: [
      {
        nome: "Mordida em Mergulho",
        acoes: 1,
        dano: "1d8+5",
        alcance: "Corpo a corpo, em voo",
        area: false,
        tipo: "ataque",
        nota: "Uma vez por turno. Ela desce, morde e fica a 3 m do chão até o início do próximo turno dela. Nesse intervalo pode ser atingida corpo a corpo com arma de haste, com golpe de alcance estendido ou saltando até ela (teste de Atletismo CD 15, parte do movimento), e quem a deixar Agarrada a derruba: ela cai e fica Caída. Fora desse intervalo ela voa alto, e só arco, arremesso e magia a alcançam.",
      },
      {
        nome: "Ferrão da Cauda",
        acoes: 1,
        dano: "1d6+4",
        alcance: "3 m",
        area: false,
        tipo: "ataque",
        aplicaVeneno: true,
        cdVeneno: 15,
        nota: "Ao acertar: Vigor CD 15 ou Envenenado até o fim do próximo turno; falhando por 5 ou mais, também contrai Fel de Wyvern (Cap. 4, §8).",
      },
    ],
  },
  {
    id: "ogro-de-guerra",
    nome: "Ogro de Guerra (Onizoku)",
    icon: "/criaturas/ogro-de-guerra.jpg",
    patamar: 4,
    papel: "padrao",
    arquetipo: "bruto",
    tamanho: "Grande",
    pericias: ["Atletismo","Intimidação"],
    perigo: "Pisão derruba; a maça pune quem fica no chão.",
    acoes: [
      {
        nome: "Maça de Duas Mãos",
        acoes: 1,
        dano: "2d8+4",
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        nota: "Contra alvo Caído, +1d8 de dano, e o golpe é crítico com 19 ou 20 no dado.",
      },
      {
        nome: "Pisão",
        acoes: 2,
        dano: "2d8+6",
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
    arquetipo: "conjurador",
    tamanho: "Médio",
    pericias: ["Intuição","Percepção","Arcanismo"],
    perigo: "Lê o personagem mais perigoso com a Previsão de Movimento e faz a lança cuspir uma maré que varre uma linha inteira.",
    acoes: [
      {
        nome: "Lança Demoníaca",
        acoes: 1,
        dano: "2d8+7",
        alcance: "3 m",
        area: false,
        tipo: "ataque",
        nota: "Previsão de Movimento: no início do combate ela lê o personagem mais perigoso. Os ataques dele contra ela têm Desvantagem, e ela tem Vantagem nos testes de resistência contra as habilidades dele. Trocar de alvo custa 1 Ação dela.",
      },
      {
        nome: "Maré Demoníaca",
        acoes: 2,
        dano: "4d8+10",
        alcance: "Linha de 18 m",
        area: true,
        tipo: "resistencia",
        aplicaMolhado: true,
        nota: "Não é magia: é a lança canalizando água. Não tem cântico nem Conjuração, então não pode ser interrompida. Teste de Agilidade (CD 19); metade do dano se passar. Aplica Molhado em todo mundo que ela pegar.",
      },
    ],
  },
];
