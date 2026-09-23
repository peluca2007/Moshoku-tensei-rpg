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
  },
  {
    id: "monstruosidade",
    nome: "Monstruosidade",
    espolios: ["tralha_frasco_acido_gastrico", "tralha_po_asa_mariposa_ilusoria", "tralha_casco_besouro_tartaruga"],
    moeda: "nenhuma",
    acoesSugeridas: ["Ácido ou cuspe em área", "Agarrar e engolir", "Regenerar no início do turno"],
    exemplo: "Sapo-lodo, mariposa ilusória, treant corrompido.",
  },
  {
    id: "humanoide",
    nome: "Humanoide",
    espolios: ["tralha_moeda_antiga_shirone", "tralha_fivela_aventureiro_morto", "tralha_estatueta_madeira_engracada"],
    moeda: "bolsa",
    acoesSugeridas: ["Ataque com arma de verdade", "Pedir rendição ou fugir a 1/4 dos PV", "Flanquear em dupla"],
    exemplo: "Bandido, guarda, cultista, mercenário.",
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
  },
  {
    id: "construto",
    nome: "Construto",
    espolios: ["tralha_gema_magica_opaca", "tralha_casco_besouro_tartaruga"],
    moeda: "nenhuma",
    imunidades: ["veneno", "psíquico"],
    acoesSugeridas: ["Golpe de peso que aplica Quebrantado", "Ignorar a primeira condição da cena", "Parar de funcionar a 0 PV, sem Fio da Vida"],
    exemplo: "Golem de pedra, armadura animada, autômato de Ranoa.",
  },
  {
    id: "demonio",
    nome: "Demônio",
    espolios: ["tralha_gema_magica_opaca", "tralha_pano_amaldicoado", "tralha_po_asa_mariposa_ilusoria"],
    moeda: "pouca",
    resistencias: ["psíquico"],
    acoesSugeridas: ["Palavra que impõe Amedrontado", "Olho demoníaco (uma vez por cena)", "Trocar de lugar com um aliado"],
    exemplo: "Íncubo, imperatriz demônio menor, espírito do Continente Demônio.",
  },
];

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
  if (papel === "chefe") {
    return { pv: molde.pv * 2, danoPorTurno: molde.danoPorTurno };
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
    ate: 1.25,
    descricao: "Custa recursos e não mata. É o encontro padrão: três ou quatro por Descanso Longo.",
  },
  {
    id: "dificil",
    nome: "Difícil",
    ate: 1.5,
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
 * lacaio tem metade do PV e do dano (logo, meia criatura), e o chefe tem PV
 * dobrado MAIS uma rodada inteira a cada dois personagens — o que na prática
 * vale três, e não duas.
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
  const porPapel = papel === "chefe" ? 3 : papel === "lacaio" ? 0.5 : 1;
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
  const fixo = Math.round(alvo - n * mediaDoDado);
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
   * O menor dado do livro é o d4, que rende 2,5. Um lacaio de 1º tem 5 de
   * orçamento por turno inteiro: três ataques do menor dado que existe já dão
   * 7,5, e a criatura mais fraca do livro sairia 50% acima da régua. Não há
   * fórmula de dado que resolva — o problema é granularidade, não conta.
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
        dano: formulaPara(danoPorTurno * 0.7, 6),
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
    arquetipo: "agil",
    tamanho: "Médio",
    pericias: ["Furtividade"],
    resistencias: ["veneno"],
    movimentoEspecial: "Nada 12 m; escala 6 m.",
    perigo: "A picada deixa o alvo Envenenado pelo resto da luta, e a Peçonha de Serpente-do-Pântano (Cap. 4, §8) continua trabalhando depois dela.",
    acoes: [
      {
        nome: "Picada Peçonhenta",
        acoes: 1,
        dano: "1d8+2",
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        aplicaVeneno: true,
        nota: "Se acertar, o alvo fica Envenenado até o fim do combate e contrai Peçonha de Serpente-do-Pântano (Cap. 4, §8 — aflição de Rank 2), que continua cobrando depois da luta. Nada disso acumula: a segunda picada não piora o que a primeira já fez.",
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
        dano: "2d6",
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        nota: "Na primeira rodada, se veio de emboscada, rola com Vantagem. Se acertar, o alvo faz teste de Vigor (CD 13) ou perde 3 m de Deslocamento até o fim do combate (cumulativo, até 0), e contrai Toxina de Aranha Gigante (Cap. 4, §8).",
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
        dano: "2d8+3",
        alcance: "Corpo a corpo, em voo",
        area: false,
        tipo: "ataque",
        nota: "Uma vez por turno. Ela desce, morde e fica a 3 m do chão até o início do próximo turno dela. Nesse intervalo pode ser atingida corpo a corpo com arma de haste, com golpe de alcance estendido ou saltando até ela (teste de Atletismo CD 15, parte do movimento), e quem a deixar Agarrada a derruba: ela cai e fica Caída. Fora desse intervalo ela voa alto, e só arco, arremesso e magia a alcançam.",
      },
      {
        nome: "Ferrão da Cauda",
        acoes: 1,
        dano: "1d10+2",
        alcance: "3 m",
        area: false,
        tipo: "ataque",
        aplicaVeneno: true,
        nota: "Alvo atingido faz teste de Vigor (CD 15) ou fica Envenenado até o fim do próximo turno dele e contrai Fel de Wyvern (Cap. 4, §8 — aflição de Rank 3).",
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
        dano: "4d8",
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        nota: "Contra alvo Caído, +2d8 de dano, e o golpe é crítico com 19 ou 20 no dado.",
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
    arquetipo: "conjurador",
    tamanho: "Médio",
    pericias: ["Intuição","Percepção","Arcanismo"],
    perigo: "Lê o personagem mais perigoso com a Previsão de Movimento e faz a lança cuspir uma maré que varre uma linha inteira.",
    acoes: [
      {
        nome: "Lança Demoníaca",
        acoes: 1,
        dano: "5d8+4",
        alcance: "3 m",
        area: false,
        tipo: "ataque",
        nota: "Previsão de Movimento: no início do combate ela lê o personagem mais perigoso. Os ataques dele contra ela têm Desvantagem, e ela tem Vantagem nos testes de resistência contra as habilidades dele. Trocar de alvo custa 1 Ação dela.",
      },
      {
        nome: "Maré Demoníaca",
        acoes: 2,
        dano: "8d8+6",
        alcance: "Linha de 18 m",
        area: true,
        tipo: "resistencia",
        aplicaMolhado: true,
        nota: "Não é magia: é a lança canalizando água. Não tem cântico nem Conjuração, então não pode ser interrompida. Teste de Agilidade (CD 19); metade do dano se passar. Aplica Molhado em todo mundo que ela pegar.",
      },
    ],
  },
];
