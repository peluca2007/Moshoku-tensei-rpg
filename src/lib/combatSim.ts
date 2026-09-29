/**
 * O motor de simulação de combate usado pela tela /encontros e pelo
 * comparador de builds.
 *
 * Ele nasceu em um script de playtest e foi compartilhado para que as telas
 * usem as mesmas regras de combate, sem manter duas simulações divergentes.
 *
 * O que ele NÃO é: um motor de regras completo. As simplificações estão
 * declaradas em SIMPLIFICACOES, no fim do arquivo, e toda leitura de um
 * resultado tem que passar por elas — inclusive na interface do site, que as
 * imprime na tela em vez de escondê-las.
 */
import { getTreeById } from "@/data/trees/index";
import { getRaceById } from "@/data/races";
import { aproximar, alcanceEmMetros, distanciaEntre } from "./combatScenario";
import {
  getArmorClass,
  getDeslocamento,
  getAttackBonus,
  getFinalAttribute,
  getHighestUnlockedRank,
  getInitiative,
  getMaxHp,
  getMaxMp,
  getPpPool,
  getPtPool,
  getTreeAttributeKey,
} from "@/store/selectors";
import {
  AbilityDef,
  CharacterData,
  RANK_BONUS,
  RankName,
  RANKS,
} from "@/lib/types";
import { resolverArmaCombate, type ArmaCombate } from "./combatWeapon";
import {
  rolarComRegistro,
  rolarCriticoComRegistro,
  rolarD20ComRegistro,
  formatarEventoAtaque,
  type EventoAtaque,
  type RegistroCombate,
} from "./combatTrace";

// ---------------------------------------------------------------------------
// Dados
// ---------------------------------------------------------------------------

/** Fonte de aleatoriedade, sempre injetada: um relatório sem semente não se reproduz. */
export type Rng = () => number;

/**
 * Gerador congruente linear com semente.
 *
 * `Math.random` serviria pra rodar, mas não pra CONFERIR: o Mestre que vê
 * "82% de vitória" e reclama do número precisa poder rodar de novo e receber
 * exatamente 82%. Semente fixa é o que torna o veredito uma medida em vez de
 * uma impressão.
 */
export function makeRng(seed: number): Rng {
  let s = seed % 0x7fffffff;
  if (s <= 0) s += 0x7ffffffe;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export const dado = (rng: Rng, faces: number) => Math.floor(rng() * faces) + 1;
export const d20 = (rng: Rng) => dado(rng, 20);

/**
 * d20 com Vantagem/Desvantagem — rola dois e fica com o melhor ou o pior.
 *
 * Cancela quando as duas estão presentes (Preso E Envenenado, por exemplo, não
 * rolam quatro dados): é a mesma regra que o resto do livro usa pra qualquer
 * fonte de Vantagem/Desvantagem, e reaproveitá-la aqui evita inventar uma conta
 * nova só pra combate.
 */
export function d20Ajustado(rng: Rng, vantagem: boolean, desvantagem: boolean): number {
  if (vantagem === desvantagem) return d20(rng);
  const a = d20(rng);
  const b = d20(rng);
  return vantagem ? Math.max(a, b) : Math.min(a, b);
}

/** Rola "NdM" repetidamente; ignora modificadores textuais. */
export function rolarDados(formula: string, rng: Rng): number {
  let total = 0;
  for (const m of formula.matchAll(/(\d+)d(\d+)/g)) {
    const n = Number(m[1]);
    const faces = Number(m[2]);
    for (let i = 0; i < n; i++) total += dado(rng, faces);
  }
  return total;
}

/** Média de "NdM", sem rolar. Usada pela IA pra escolher a ação e pelos relatórios. */
export function mediaDados(formula: string): number {
  let total = 0;
  for (const m of formula.matchAll(/(\d+)d(\d+)/g)) {
    total += (Number(m[1]) * (Number(m[2]) + 1)) / 2;
  }
  return total;
}

// ---------------------------------------------------------------------------
// Fórmulas COM modificador fixo
// ---------------------------------------------------------------------------
/*
 * As três funções acima ignoram o "+5" de "4d8+5" de propósito: o dano das
 * magias do livro vem em dados puros, e o bônus do conjurador é somado pelo
 * motor (`resolver`), não pelo texto.
 *
 * A criatura montada pelo Mestre é o caso oposto — ele digita "4d8+5" porque é
 * assim que uma ficha de monstro é escrita, e o "+5" É o dano dela. Daí este
 * segundo trio: mesma leitura de dados, mais os inteiros soltos. Somar o fixo
 * dentro de `rolarDados` teria inflado toda magia do jogo de tabela.
 */

/** O que sobra de "4d8+5" depois de tirar os dados: aqui, +5. */
export function modificadorFixo(formula: string): number {
  const semDados = formula.replace(/\d+\s*d\s*\d+/gi, " ");
  let total = 0;
  for (const m of semDados.matchAll(/([+-])\s*(\d+)/g)) {
    total += (m[1] === "-" ? -1 : 1) * Number(m[2]);
  }
  return total;
}

export function rolarFormula(formula: string, rng: Rng): number {
  return rolarDados(formula, rng) + modificadorFixo(formula);
}

export function mediaFormula(formula: string): number {
  return mediaDados(formula) + modificadorFixo(formula);
}

/** O teto da fórmula — todo dado no valor máximo. É o "e se ele rolar tudo alto?". */
export function maxFormula(formula: string): number {
  let total = modificadorFixo(formula);
  for (const m of formula.matchAll(/(\d+)d(\d+)/g)) {
    total += Number(m[1]) * Number(m[2]);
  }
  return total;
}

/** true se a fórmula tem ao menos um dado ou um fixo — ou seja, se causa dano. */
export function temDano(formula: string): boolean {
  return mediaFormula(formula) > 0;
}

// ---------------------------------------------------------------------------
// Ficha → combatente
// ---------------------------------------------------------------------------

/**
 * O que uma ação FAZ — 0.1.37.
 *
 * Até aqui o motor só conhecia dano, e `acoesDe` DESCARTAVA cura e PV
 * Temporários com um filtro de texto, porque os três moram no mesmo campo
 * (`damage.normal`) e somar uma cura como dano contava a Prontidão como 105 de
 * dano por turno. O filtro estava certo em recusar; o erro era parar aí.
 */
export type TipoDeAcao = "dano" | "cura" | "escudo" | "outro";

/** Uma coisa que um combatente pode fazer no turno dele. */
export interface Acao {
  regra?: "primeiro-golpe" | "fluxo";
  alcance?: string;
  bonusContextual?: number;
  gatilho?: string;
  nome: string;
  acoes: number;
  pm: number;
  pt: number;
  /**
   * A fórmula de DANO. Vazia em toda ação de suporte, de propósito.
   *
   * O campo do livro é o mesmo pros três tipos e o sinal é oposto — essa é
   * exatamente a armadilha que derrubou a Prontidão antes. Deixando esta vazia
   * e a fórmula de suporte em `formulaSuporte`, uma ação de cura que vaze pro
   * caminho de dano soma ZERO em vez de curar o inimigo: `mediaDados("")` é 0.
   */
  dano: string;
  tipo: TipoDeAcao;
  /**
   * A fórmula do CASO BASE de PV curados ou de PV Temporários. Vazia em dano.
   *
   * "Caso base" e não a linha inteira: o livro escreve os dois casos na mesma
   * frase — *"2d8 + BC de PV (4d8 + BC se Ferida Fresca)"* —, e `rolarDados`
   * soma TODO grupo de dados que encontra. A linha crua rolaria 2d8+4d8, e a
   * dobra da Ferida Fresca em cima disso devolveria 12d8 onde o livro promete
   * 4d8. `casoBase` corta na primeira vírgula ou parêntese.
   */
  formulaSuporte: string;
  /**
   * A Prontidão diz *"sempre como Ferida Fresca"* — ela é a Reação que cura
   * enquanto o golpe ainda acontece, e o livro a chama de "a magia que define a
   * escola". Sem esta linha ela curaria metade do que promete.
   */
  sempreFresca: boolean;
  dadosDeArma: number;
  area: boolean;
  /** Texto que dimensiona a área sem exigir um mapa (alcance + efeito da carta). */
  areaDescricao?: string;
  /** Fração máxima dos PV atuais exigida de quem usa (0,5 = metade ou menos). */
  pvDoUsuarioMaximo?: number;
  /** Fração mínima dos PV atuais exigida de quem usa (0,5 = metade ou mais). */
  pvDoUsuarioMinimo?: number;
  /** Estado que precisa existir no alvo antes da ação. */
  estadoExigidoDoAlvo?: "agarrado" | "atolado" | "caido" | "congelado" | "em-chamas" | "marcado" | "molhado" | "preso";
  /** Níveis de Exaustão recebidos depois de resolver a ação. */
  exaustaoDepois?: number;
  /** Técnicas [Improviso] que dependem de algo utilizável no ambiente. */
  requerCenarioUtilizavel?: boolean;
  /** Efeito sustentado que precisa estar ativo antes desta ação. */
  efeitoAtivoExigido?: string;
  /** Água Avançada: frio congela quem já estava Molhado e falhou. */
  aplicaCongeladoSeMolhado?: boolean;
  /** Quebra de Gelo cobra o preparo e o consome. */
  bonusSeCongelado?: string;
  /** Doses aplicadas em cada resultado do teste de Vigor. */
  dosesNaFalha?: number;
  dosesNoSucesso?: number;
  /** Fórmula por Dose removida por Inverter. */
  inverteDose?: string;
  /**
   * "Uma vez por turno" / "uma vez por combate" no COMEÇO do efeito da carta —
   * 2026-09-27. Sem isto o motor usava a Espada de Luz Verdadeira (uma vez por
   * combate) em todo turno, e o truque de escola três vezes por turno.
   */
  limite?: "turno" | "combate";
  /** true = rola contra a CA; false = o alvo faz um teste de resistência. */
  /** Conjuração Concentrada (Cap. 2, §2): só entra quando resta um inimigo. */
  concentrada?: boolean;
  ataque: boolean;
  frio: boolean;
  fogo: boolean;
  aplicaMolhado: boolean;
  aplicaQuebrantado: number | "maximo";
  aplicaPreso?: boolean;
  aplicaCaido?: boolean;
  aplicaVeneno?: boolean;
  aplicaBuffCA?: number;
  aplicaBuffDano?: number;
  aplicaBuffVantagem?: boolean;
  danoPorTurno: string;
  intercepta?: boolean;
  aparar?: number;
  reducaoDeDano?: string;
  reacao?: boolean;
}

/**
 * Por quantos turnos um efeito sustentado é contado.
 *
 * ## Por que não é a duração escrita
 *
 * A Tempestade Cortante dura "1 minuto" — dez turnos. Contar dez daria a ela um
 * dano que nenhuma mesa vê, por duas razões que o motor não modela: o alvo pode
 * SAIR da área (não há mapa aqui) e o combate costuma acabar antes (as batalhas
 * do playtest fecham em 2 a 4 rodadas).
 *
 * ## Por que três
 *
 * É a duração mediana de um combate deste simulador, medida: o efeito rende o
 * turno em que foi lançado mais dois. É um número DECLARADO, igual ao limiar de
 * cura de 50% — escolhido por mim, não pelo livro, e por isso ele está aqui em
 * cima e não enterrado numa expressão.
 *
 * Errar pra menos é o lado certo de errar: se a mesa disser que a magia rende
 * mais, o conserto é subir este número; se o motor contasse dez, ele estaria
 * prometendo um dano que depende de o inimigo cooperar.
 */
export const TURNOS_SUSTENTADOS = 3;

/**
 * Separa o golpe de impacto do que se repete, numa linha de dano do livro.
 *
 * As três formas que o livro usa, todas presentes hoje:
 *
 * - `"5d8 + BC de dano cortante por turno"` — tudo é por turno, não há impacto.
 * - `"6d10 + BC/turno (ígneo)"` — idem, com a barra no lugar do "por".
 * - `"12d8 + BC de dano de magma no impacto, depois 6d10 por turno"` — os dois,
 *   e a vírgula separa.
 */
/**
 * O efeito sustentado exige que o dono GASTE O TURNO mantendo? — 0.1.57
 *
 * Esta é a diferença entre uma área que fica lá sozinha e um agarrão. O
 * `Estrangular [Impacto]` do Lutador diz *"enquanto você mantiver"* e exige alvo
 * Agarrado: cada turno de dano custa o turno dele. Contar três tiques por uma
 * Ação dava à técnica **51,6 de dano por Ação** — a segunda maior do livro
 * inteiro, num rank Avançado, acima do Imperador do Deus da Espada.
 *
 * Quando a manutenção custa a Ação, o dano POR AÇÃO já está certo contando um
 * turno só: cada tique a mais vem com uma Ação a mais.
 *
 * Manutenção que custa RECURSO é outra coisa e não entra aqui — o Trono de
 * Chamas cobra "uma Sobrecarga por turno", e quem paga continua livre pra agir.
 * Os turnos dele são reais; o que o motor não cobra é a Sobrecarga, e isso está
 * declarado nas simplificações.
 */
export function exigeManutencao(efeito: string): boolean {
  return /enquanto (você |vc )?mantiver|enquanto mantiver|manter custa (1 |uma )?ação/i.test(efeito);
}

/**
 * O dano por turno depende de o alvo ESTAR num lugar? — 0.1.58
 *
 * O campo `damage.porTurno` do livro descreve duas coisas diferentes com a mesma
 * forma. Uma o motor sabe contar; a outra não:
 *
 * - **"4d10 sufocando"** (Sepultamento) — o alvo está Soterrado. Ele não tem
 *   como sair, e o dano acontece. Isto conta.
 * - **"2d6 por turno a quem ENTRAR na cratera"**, **"a quem TOCAR os pilares"**,
 *   **"a quem COMEÇAR O TURNO na área"** — depende de onde o alvo escolhe
 *   pisar, e este motor não tem mapa. Contar seria inventar uma decisão que o
 *   inimigo nunca tomou.
 *
 * Fica de fora, e o relatório declara. É a mesma régua de Atolado, Marcado e
 * Soterrado: o que é posição, o motor não finge saber.
 */
export function dependeDePosicao(linha: string): boolean {
  return /a quem (entrar|tocar|come[çc]ar|passar|pisar|atravessar)|quem estiver (na|no) [áa]rea|se permanecer/i.test(
    linha
  );
}

export function separarSustentado(linha: string): { impacto: string; porTurno: string } {
  const temPorTurno = /(por turno|\/turno)/i.test(linha);
  if (!temPorTurno) return { impacto: linha, porTurno: "" };

  // "…, depois X por turno" — o que vem antes da vírgula é o impacto.
  const m = linha.match(/^(.*?),\s*(?:e\s+)?depois\s+(.*)$/i);
  if (m) return { impacto: m[1], porTurno: m[2] };

  // Sem "depois": a linha inteira é o efeito por turno, e não há impacto extra.
  return { impacto: linha, porTurno: linha };
}

/**
 * O que uma ficha traz pro combate. Derivado UMA vez por ficha e reutilizado em
 * todas as batalhas — `montarFicha` chama meia dúzia de seletores e faz regex em
 * cada magia comprada, e refazer isso a cada uma das centenas de batalhas era o
 * custo dominante da simulação.
 */
export interface FichaCombate {
  invocadoDe?: string;
  acoesPorTurno?: number;
  ataquesPorAcao?: number;
  tatico?: {
    rank: number;
    primeiroAVer: boolean;
    vozQueCorrige: boolean;
    antecipacao: boolean;
    vozDeSargento: boolean;
    focoDeFogo: boolean;
    preverOGolpe: boolean;
    semBaixas: boolean;
    avante: boolean;
    batalhaEscolhida: boolean;
  };
  bardo?: {
    rank: number;
    insultoAfiado: boolean;
    insultoQueFica: boolean;
    cancaoDeGuerra: boolean;
    duasCancoes: boolean;
    temInspiracao: boolean;
    inspiracaoDados: number;
    inspiracoes: number;
  };
  doseExtraEmFalhaGrave: boolean;
  ppMax?: number;
  rankLadino: number;
  bonusFurtividade: number;
  temSombraLonga: boolean;
  rankAgua: number;
  temAparar: boolean;
  temDevolver: boolean;
  temGuardaCorpo: boolean;
  temPassoVazio: boolean;
  reacaoExtraFixa: number;
  temMareRetorno: boolean;
  alcanceReacao: number;
  deslocamento: number;
  /** Arma efetivamente escolhida; preserva a origem dos dados e dos bônus. */
  arma: ArmaCombate;
  id: string;
  nome: string;
  rotulo: string;
  pvMax: number;
  ca: number;
  pmMax: number;
  ptMax: number;
  /** Bônus de Combate da árvore inicial (atributo + Bônus de Rank). */
  bc: number;
  /** Bônus de quem bate com arma sem ter árvore do Corpo: só o atributo, sem Rank. */
  bcSemRank: number;
  /** Tipos de dano que ele resiste (metade) e a que é imune (zero) — Cap. 4, §6. */
  resistencias: string[];
  imunidades: string[];
  /**
   * O Bônus de Rank SOZINHO, sem o atributo em cima (0.1.35).
   *
   * `bc` já traz os dois somados, e pra quase tudo isso basta. Quebrantado é a
   * exceção: o teto do Cap. 4 é "até o máximo do Bônus de Rank de quem aplicou",
   * e de um `bc` somado não dá pra separar de volta a parcela que interessa.
   */
  bonusDeRank: number;
  /**
   * Metade do MAIOR Bônus de Rank da ficha, de qualquer árvore, arredondada
   * pra cima — a parcela que todo teste de resistência soma (Cap. 4, §1).
   *
   * Não é `bonusDeRank / 2`: aquele é o da árvore inicial, e o livro manda
   * usar o maior. Até a revisão do livro o Fio da Vida e a Concentração
   * rolavam sem esta parcela, e um Imperador resistia como um Principiante.
   */
  metadeDoMaiorRank: number;
  /**
   * O bônus do personagem quando uma CRIATURA pede teste de resistência.
   *
   * O livro é "1d20 + Atributo + metade do maior Bônus de Rank", e a ação da
   * criatura não diz qual atributo cobra. Sem essa informação, o motor usa o
   * do MEIO entre Vigor, Agilidade e Espírito: nem o melhor (otimista), nem o
   * pior. Antes era metade do BC do próprio personagem, que não é conta do
   * livro nenhuma. Declarado em SIMPLIFICACOES.
   */
  resistencia: number;
  /** Iniciativa final (Agilidade com raça e antecedente), a mesma da ficha. */
  iniciativa: number;
  /** Vigor FINAL — o atributo do teste do Fio da Vida (Cap. 4, §7). */
  vigor: number;
  /** Espírito FINAL — o atributo do teste de Concentração da conjuração (Cap. 2, §6). */
  espirito: number;
  acoes: Acao[];
  fluxoUsosMax: number;
  fluxoDano: string;
  posturaBonusCA: number;
  posturaReacoesExtra: number;
  protegidosMax: number;
  ataqueBasico: Acao;
}

/** Qualquer coisa que pode levar dano. Personagens e criaturas cabem aqui. */
export interface Alvo {
  /** Reação própria de um rival criado de ficha quando o atacante erra corpo a corpo. */
  aoErrarCorpoACorpo?: (atacante: EstadoPersonagem, formula: string, rng: Rng, logger?: RegistroCombate) => void;
  /** Aparar do rival pode aumentar a CA depois da rolagem, antes de resolver o acerto. */
  caAposAparar?: (atacante: EstadoPersonagem, natural: number, total: number) => number;
  /** Um rival que está em cântico testa Concentração ao sofrer dano. */
  aoSofrerDano?: (bonusDeRankDeQuemBate: number, rng: Rng, evento?: EventoAtaque) => void;
  posicao?: number;
  terrenoDificil: boolean;
  escondido: boolean;
  percepcaoPassiva?: number;
  surpreso: boolean;
  jaAgiu: boolean;
  cego: boolean;
  /** O cenário declarou cobertura, terreno ou outro elemento aproveitável. */
  cenarioUtilizavel: boolean;
  congelado: boolean;
  doses: number;
  atordoadoTurnos: number;
  nome: string;
  pv: number;
  ca: number;
  vivo: boolean;
  /** Ordem de Tiro vigente; mora no alvo para qualquer aliado poder consumi-la. */
  apontado?: { tatico: EstadoPersonagem; dados: number; focoDeFogo: boolean; acertou: boolean };
  /** Insulto Afiado: a próxima rolagem de ataque deste alvo tem Desvantagem. */
  desvantagemNoProximoAtaque: boolean;
  /** Sem Baixas pode interceptar a primeira queda antes do Fio da Vida. */
  evitarQueda?: () => boolean;
  /** Tático com Prever o Golpe protegendo este aliado. */
  preverGolpePor?: EstadoPersonagem;
  /**
   * Tipos de dano com Resistência e Imunidade — Cap. 4, §6 (0.1.90).
   *
   * O livro definiu as três palavras na revisão (Resistência = metade,
   * Imunidade = zero, Vulnerável = dobro) e o motor continuou ignorando as
   * três: um elemental de fogo levava dano ígneo cheio numa simulação de 2.000
   * combates, e o Mestre calibrava o encontro por um número que não existia na
   * mesa. Guardadas em minúscula, como o Apêndice G escreve.
   *
   * Vulnerável não está aqui de propósito: nenhuma CRIATURA do livro tem
   * Vulnerabilidade permanente — ela vem de condição (Molhado é Vulnerável a
   * frio), e condição já é estado, não ficha.
   */
  resistencias: string[];
  imunidades: string[];
  molhado: boolean;
  emChamas: number;
  /**
   * Acúmulos de Quebrantado (Cap. 4, §2) — 0.1.35.
   *
   * É a única das cinco condições que o motor deixava de fora sendo puramente
   * NUMÉRICA: cada acúmulo tira 1 da CA e 1 do dano de quem o carrega. As outras
   * quatro (Atolado, Desequilibrado, Soterrado, Marcado) são sobre movimento,
   * posição e informação, que o motor declara não modelar.
   *
   * Ela ficou de fora por três versões do motor, e o custo disso não era
   * abstrato: as treze citações de Quebrantado do livro inteiro pertencem a UMA
   * árvore (Armas Pesadas), cuja mecânica central é justamente empilhá-los. A
   * simulação lia esses acúmulos como texto decorativo e devolvia a árvore mais
   * fraca do que ela é — inclusive no comparador de builds.
   */
  quebrantado: number;
  /**
   * Efeitos de dano por turno ativos sobre este alvo (0.1.57).
   *
   * O livro tem SETE magias de dano sustentado — a Tempestade Cortante, o Rio
   * de Magma, o Trono de Chamas e mais quatro — e até aqui o motor contava cada
   * uma UMA vez. Em Chamas já tinha relógio (`emChamas`); estas não tinham
   * nenhum, apesar de o livro escrever "por turno" em letra.
   *
   * Cada entrada guarda a média já calculada, e não a fórmula: quem aplicou o
   * efeito conhece o próprio BC e o alvo não, e recalcular a cada tique exigiria
   * que o alvo carregasse uma referência ao conjurador.
   */
  sustentados: { media: number; turnos: number }[];
  /**
   * O bônus deste alvo num teste de resistência, quando ele é conhecido.
   *
   * Criatura: o "Bônus de Resistência" do Apêndice G, metade do Bônus de
   * Ataque arredondado pra cima (`encounterSim.ts` preenche). Personagem: o
   * `resistencia` da ficha. `null` = boneco de treino sem ficha, e aí o motor
   * cai na conta antiga (metade do BC de quem ataca), que só serve pra medir
   * uma técnica contra um alvo neutro.
   */
  bonusResistencia: number | null;
  /**
   * Preso, Caído e Envenenado (Cap. 4, §7-8) — as três condições que uma ação
   * de criatura pode aplicar de forma estruturada (`AcaoCriatura.aplicaPreso` e
   * companhia em `encounterSim.ts`), na mesma casa de Molhado acima.
   *
   * O que elas cobram do combate, aqui, é só a parte que o livro resume em uma
   * frase cada: "seus ataques têm Desvantagem" (Preso, Caído, Envenenado) e
   * "ataques contra você têm Vantagem" (Preso, Caído). O resto de cada uma —
   * Deslocamento 0, teste pra se soltar, a hora certa em que o veneno realmente
   * bate — segue de fora, pelo mesmo motivo que Atolado e Soterrado seguem: é
   * posição e é relógio de mesa, não dado de dano.
   */
  preso: boolean;
  caido: boolean;
  envenenado: boolean;
  /**
   * A Reação (ou ação lendária) de chefe fora do turno normal dele — reabastece
   * uma vez por rodada da mesa (`aoIniciarRodada`) e é gasta por
   * `reagirComoChefe`, em `encounterSim.ts`. Fica na base, e não só em
   * `EstadoCriatura`, porque o gancho em si (`aoIniciarRodada`) é genérico:
   * nada nele exige que quem reage seja uma criatura.
   */
  reacaoDisponivel: boolean;
  danoCausado: number;
  /**
   * PV Temporários — 0.1.37. "Gastos antes dos PV reais", diz o livro em toda
   * magia que os concede, e é exatamente o que `aplicarDano` faz.
   *
   * Não acumulam: o livro repete "não acumulam com outra fonte" na Casca, no
   * Vigor Emprestado e no Corpo de Ferro, então uma segunda concessão
   * SUBSTITUI quando for maior e é desperdiçada quando for menor.
   */
  pvTemp: number;
  /**
   * Ferida Fresca (Cap. 4, §7) — a mecânica que dá identidade à Magia de Cura:
   * é o dano sofrido desde o início do último turno do próprio alvo, e contra
   * ela dobram os DADOS da cura (o BC soma uma vez só).
   *
   * É por isso que o curandeiro age cedo e não depois, e sem ela a escola vira
   * um dado de cura genérico. Aqui o contador vale 1 quando o alvo leva dano e
   * zera no início do turno DELE (`turnoPersonagem`): o golpe que chegou antes
   * de o alvo começar o turno deixa de ser fresco nesse instante.
   *
   * Até a revisão do livro o contador valia 2 e atravessava dois turnos do
   * alvo — a leitura antiga de "turno atual ou imediatamente anterior", que
   * numa luta de seis criaturas podia querer dizer o turno do goblin ao lado.
   *
   * A exceção é o dano que chega NO início do turno (Em Chamas, área
   * sustentada): ele acontece depois de o turno começar, então as funções de
   * tique gravam 2, e o fechamento da janela em `turnoPersonagem` o deixa em 1.
   */
  feridaFresca: number;
  /**
   * O Fio da Vida (Cap. 4, §7) — 0.1.38.
   *
   * *"Se seus Pontos de Vida chegarem a 0, você cai Inconsciente e entra em
   * estado de Morte."* O motor tratava 0 PV como morte instantânea e
   * permanente, e isso não era só infidelidade ao livro: era a causa de o
   * resultado de todo combate contra chefe ser 0% ou 100%, sem meio-termo.
   *
   * Quem cai some do combate pra sempre → o dano do grupo despenca → a luta se
   * alonga → cai o próximo. Uma espiral com realimentação positiva não produz
   * resultado intermediário; produz coin flip. Medido no 4º patamar: com 49 de
   * dano por turno o chefe perdia 97% das vezes, com 51 ganhava 94%.
   *
   * `vivo: false` continua querendo dizer "fora da luta" — é o que as trinta e
   * quatro checagens espalhadas pelo motor já entendem —, e estes campos dizem
   * SE ainda dá pra voltar.
   */
  fioDaVida: boolean;
  inconsciente: boolean;
  marcasDaMorte: number;
  /**
   * Estabilizado (Cap. 4, §7): para de rolar o Fio da Vida e acorda com 1 PV em
   * 1d4 horas, ou na hora com qualquer cura. Nenhum combate deste motor dura
   * horas, então aqui ele segue desacordado até alguém curar. Sofrer dano a 0
   * PV tira o Estabilizado (`aplicarDano`).
   */
  estabilizado: boolean;
  /** Três Marcas: acabou. Nenhuma cura deste motor traz de volta. */
  morto: boolean;
  /** "Quem te derrubou decide o quanto é difícil voltar": CD 8 + o Bônus de Rank dele. */
  cdFioDaVida: number;
}

/**
 * Um `Alvo` completo a partir do pouco que sempre muda — 0.1.37.
 *
 * Existe por um estrago concreto: ao acrescentar `pvTemp` e `feridaFresca` ao
 * `Alvo`, o compilador acusou DEZ literais construídos à mão espalhados por
 * script, motor e testes, cada um repetindo onze campos que ninguém lê. Um tipo
 * que só se constrói assim cobra o preço inteiro a cada campo novo — e cobra na
 * forma de "some um `false` em dez arquivos", que é onde se erra em silêncio.
 *
 * Quem chama diz o que interessa (nome, PV, CA, e o que for exceção); o resto
 * nasce no estado neutro de quem acabou de entrar em combate.
 */
export function novoAlvo(p: Partial<Alvo> & { nome: string; pv: number; ca: number }): Alvo {
  return {
    posicao: p.posicao,
    terrenoDificil: p.terrenoDificil ?? false,
    escondido: p.escondido ?? false,
    percepcaoPassiva: p.percepcaoPassiva,
    surpreso: p.surpreso ?? false,
    jaAgiu: p.jaAgiu ?? false,
    cego: p.cego ?? false,
    cenarioUtilizavel: p.cenarioUtilizavel ?? false,
    congelado: p.congelado ?? false,
    doses: p.doses ?? 0,
    atordoadoTurnos: p.atordoadoTurnos ?? 0,
    nome: p.nome,
    pv: p.pv,
    ca: p.ca,
    vivo: p.vivo ?? true,
    apontado: p.apontado,
    desvantagemNoProximoAtaque: p.desvantagemNoProximoAtaque ?? false,
    evitarQueda: p.evitarQueda,
    preverGolpePor: p.preverGolpePor,
    molhado: p.molhado ?? false,
    emChamas: p.emChamas ?? 0,
    quebrantado: p.quebrantado ?? 0,
    sustentados: p.sustentados ?? [],
    bonusResistencia: p.bonusResistencia ?? null,
    preso: p.preso ?? false,
    caido: p.caido ?? false,
    envenenado: p.envenenado ?? false,
    reacaoDisponivel: p.reacaoDisponivel ?? false,
    danoCausado: p.danoCausado ?? 0,
    pvTemp: p.pvTemp ?? 0,
    feridaFresca: p.feridaFresca ?? 0,
    // Criatura não tem Fio da Vida: o livro dá a regra aos personagens, e um
    // goblin inconsciente é um goblin morto pra qualquer efeito de mesa.
    fioDaVida: p.fioDaVida ?? false,
    inconsciente: p.inconsciente ?? false,
    marcasDaMorte: p.marcasDaMorte ?? 0,
    estabilizado: p.estabilizado ?? false,
    morto: p.morto ?? false,
    // 10 é o que o livro manda usar "se não houver um responsável claro, como
    // uma queda ou um desabamento".
    cdFioDaVida: p.cdFioDaVida ?? 10,
    resistencias: p.resistencias ?? [],
    imunidades: p.imunidades ?? [],
  };
}

/** O limite escrito no começo do efeito: "Uma vez por turno." / "Uma vez por combate:". */
export function limiteDeUso(efeito: string): Acao["limite"] {
  const m = efeito.trim().match(/^(?:uma vez|.*?\bcontinua uma vez) por (turno|combate)[.:,]/i);
  return m ? (m[1].toLowerCase() as "turno" | "combate") : undefined;
}

/** Uma `Acao` completa a partir do que a distingue. Mesmo motivo do `novoAlvo`. */
export function novaAcao(p: Partial<Acao> & { nome: string }): Acao {
  return {
    regra: p.regra,
    alcance: p.alcance,
    bonusContextual: p.bonusContextual,
    gatilho: p.gatilho,
    nome: p.nome,
    acoes: p.acoes ?? 1,
    pm: p.pm ?? 0,
    pt: p.pt ?? 0,
    dano: p.dano ?? "",
    tipo: p.tipo ?? "dano",
    formulaSuporte: p.formulaSuporte ?? "",
    sempreFresca: p.sempreFresca ?? false,
    dadosDeArma: p.dadosDeArma ?? 0,
    area: p.area ?? false,
    areaDescricao: p.areaDescricao,
    pvDoUsuarioMaximo: p.pvDoUsuarioMaximo,
    pvDoUsuarioMinimo: p.pvDoUsuarioMinimo,
    estadoExigidoDoAlvo: p.estadoExigidoDoAlvo,
    exaustaoDepois: p.exaustaoDepois,
    requerCenarioUtilizavel: p.requerCenarioUtilizavel,
    efeitoAtivoExigido: p.efeitoAtivoExigido,
    aplicaCongeladoSeMolhado: p.aplicaCongeladoSeMolhado,
    bonusSeCongelado: p.bonusSeCongelado,
    dosesNaFalha: p.dosesNaFalha,
    dosesNoSucesso: p.dosesNoSucesso,
    inverteDose: p.inverteDose,
    limite: p.limite,
    ataque: p.ataque ?? false,
    frio: p.frio ?? false,
    fogo: p.fogo ?? false,
    aplicaMolhado: p.aplicaMolhado ?? false,
    aplicaQuebrantado: p.aplicaQuebrantado ?? 0,
    danoPorTurno: p.danoPorTurno ?? "",
    reacao: p.reacao ?? false,
  };
}

/** O que muda numa batalha, do lado do personagem. */
export interface EstadoPersonagem extends Alvo {
  usouFurtivo: boolean;
  /** Ações com limite de uso já gastas neste turno e neste combate (ver `Acao.limite`). */
  usadasNoTurno: Set<string>;
  usadasNoCombate: Set<string>;
  usouPassoVazio: boolean;
  podeEsconderEmCombate: boolean;
  alcanceArma?: number;
  reacoesNesteTurno: Set<Alvo>;
  fluxosNesteTurno: Set<Alvo>;
  ficha: FichaCombate;
  pm: number;
  pt: number;
  pp: number;
  /** Exaustão acumulada durante esta batalha; hoje nasce de técnicas de combate. */
  exaustao: number;
  /** Preparações sustentadas declaradas pelo cenário (ex.: Cumulonimbus ativa). */
  efeitosAtivos: Set<string>;
  /** Inspiração recebida e ainda não gasta num teste. */
  inspiracao?: { dados: number; fonte: EstadoPersonagem };
  inspiracoesRestantes: number;
  /** Teto do Cap. 4, §5: no máximo duas Ações vindas de aliados por turno. */
  acoesConcedidas: number;
  concessorDeAcoes?: EstadoPersonagem;
  bonusAcertoDeAliados: number;
  suportePreparado: boolean;
  usouAntecipacao: boolean;
  usouAvante: boolean;
  usouBatalhaEscolhida: boolean;
  batalhaEscolhidaTurnos: number;
  usouSemBaixas: boolean;
  buffs: { CA: number; dano: number; acerto: number; turnosRestantes?: number }[];
  fluxoRestante: number;
  emPostura: boolean;
  protegidos: string[];
  reacoesExtra: number;
  usouPrimeiroGolpe: boolean;
  /**
   * O cântico em andamento — Cap. 2, §6 e Cap. 4, §3, na 0.1.40.
   *
   * *"Magias poderosas exigem mais Ações do que você tem num turno — o sistema
   * permite dividir o cântico."* Sem isto, as ações de dano que custam 4 Ações
   * (Rei e Imperador; o teto é 4) eram inalcançáveis pelo motor: `escolherAcao` filtrava por
   * `acoes <= acoesRestantes` e um turno tem 3. Sol Menor, Zero Absoluto, Era
   * Glacial, Vazio — as maiores magias do livro nunca foram simuladas uma vez.
   *
   * `acoesNesteTurno` existe pra Perda de Foco: *"você é obrigado a gastar pelo
   * menos 1 Ação por turno recitando. Se passar um turno inteiro sem dedicar
   * nenhuma Ação, a magia falha, a mana se perde, e você recomeça do zero."*
   */
  conjurando: { acao: Acao; acoesGastas: number; acoesNesteTurno: number } | null;
  /**
   * PV devolvidos a aliados (e a si) nesta batalha — 0.1.37.
   *
   * É a contrapartida de `danoCausado`, e existe porque sem ela o relatório
   * media um curandeiro pela única coisa que ele não faz. Conta o PV
   * EFETIVAMENTE devolvido, não o rolado: curar 40 em quem está 8 abaixo do
   * máximo vale 8, que é o que a mesa recebeu.
   */
  pvCurado: number;
}

/**
 * Extrai as ações ofensivas das magias/técnicas compradas.
 *
 * Aqui mora a maior parte da imprecisão do motor, e ela é toda de leitura de
 * texto: o livro descreve efeito em prosa, e a simulação precisa de números.
 * Cada regex abaixo existe por um erro concreto que ela corrigiu.
 */
export function acoesDe(c: CharacterData): Acao[] {
  const out: Acao[] = [];
  for (const compra of c.purchasedAbilities) {
    if (compra.kind !== "ability") continue;
    const tree = getTreeById(compra.treeId);
    const rd = tree?.ranks.find((r) => r.rank === compra.rank);
    const a = rd?.abilities.find((x) => x.id === compra.id) as AbilityDef | undefined;
    if (!a) continue;
    // A ficha impede compras inválidas, mas os montadores de referência e
    // saves antigos podem trazer uma combinação que nunca passaria pela UI.
    // O simulador não pode ganhar a habilidade só porque recebeu JSON direto.
    if ((a.requires ?? []).some((id) => !c.purchasedAbilities.some((p) => p.treeId === compra.treeId && p.id === id))) continue;
    if (a.requiresRank) {
      const minimo = RANKS.indexOf(a.requiresRank.rank);
      const atende = c.unlockedRanks.some((u) => RANKS.indexOf(u.rank) >= minimo
        && (a.requiresRank?.treeId ? u.treeId === a.requiresRank.treeId : getTreeById(u.treeId)?.category === a.requiresRank?.categoria));
      if (!atende) continue;
    }
    // Cruz Nebulosa não produz a terceira lâmina que sua própria carta exige.
    // Contar a técnica sem três armas na mochila infla precisamente o perfil
    // de referência que esta régua deveria auditar.
    if (/terceira arma/i.test(a.effect) && c.inventory.filter((item) => item.type === "arma").length < 3) continue;
    // A Parede de Emergência já é uma carta pronta e não depende de inventar
    // fórmula: 15 PV, Reação, ataque físico, até o próximo turno. Ela entra
    // como ação defensiva para o resolvedor de ataques da criatura consumi-la.
    if (a.id === "parede-de-emergencia") {
      out.push(novaAcao({
        nome: a.name, tipo: "escudo", reacao: true, acoes: 1,
        pm: a.pmCost ?? 0, formulaSuporte: "15", alcance: a.range,
      }));
      continue;
    }
    if (!a.damage?.normal) continue;
    const txt = a.damage.normal.toLowerCase();
    /*
     * Cura e PV Temporários — 0.1.37.
     *
     * `damage.normal` guarda os três: dano, PV curados (Cura) e PV Temporários
     * (Escudos, Barreira). O campo é o mesmo e o SINAL é oposto — foi assim que
     * a simulação já contou a Prontidão como 105 de dano por turno.
     *
     * Até aqui a linha abaixo era um `continue`: o motor recusava a cura e
     * seguia. Recusar estava certo; parar aí não. O custo medido disso é a
     * escola de Cura aparecendo no playtest com 2 de 23 habilidades visíveis, e
     * a Barreira com 0 de 21 — e então o relatório declarando a curandeira
     * fraca por não bater, que é a única coisa que ela não faz.
     *
     * A distinção entre os dois ramos é literal: "PV Temporários" está escrito
     * em toda magia que os concede. O que sobra com "de PV" ou "recupera" é
     * cura de verdade.
     *
     * Este ramo NÃO olha o `effect`, pelo mesmo motivo de sempre: Julgamento e
     * Luz Absoluta são magias de DANO que descrevem uma cura secundária ali
     * ("aliados vivos na área recuperam..."), e lê-las como cura derrubaria o
     * dano real das duas. Elas seguem como dano; a cura de brinde delas é uma
     * das simplificações declaradas.
     */
    /*
     * "Reduz 2d10 + Vigor" é REDUÇÃO de dano, não dano — 0.1.47.
     *
     * As duas habilidades de Aguentar, em Escudos, são Reações que diminuem o
     * golpe que o defensor está interceptando. O motor as lia como ataques e
     * dava a Cavalaria e Escudos uma técnica de 16,8 de dano por Ação que ela
     * não tem. Foi a auditoria dos capstones que denunciou: o Intermediário da
     * árvore "rendia menos" que o Principiante, e a comparação inteira era entre
     * um golpe de verdade e um escudo.
     *
     * Elas entram como `escudo` porque é o que mais se parece com o que fazem
     * (tirar dano da conta antes de ele bater), e o que o motor sabe fazer com
     * isso é PV Temporários. Não é a mesma mecânica — o livro dá redução, não
     * casca — e a diferença está declarada nas simplificações.
     */
    const ehReducao = /^reduz/.test(txt);
    const ehSuporte = ehReducao || /de pv|pv temporários|recupera|cura /.test(txt);
    const isZeroAction = !a.reaction && a.actions.normal === 0;
    const tipo: TipoDeAcao = isZeroAction ? "outro" : !ehSuporte
      ? "dano"
      : ehReducao || /pv temporários/.test(txt)
        ? "escudo"
        : "cura";
    out.push({
      regra: a.id === "primeiro-golpe" ? "primeiro-golpe" : undefined,
      limite: a.id === "primeiro-golpe" ? undefined : limiteDeUso(a.effect),
      alcance: a.range,
      reacao: !!a.reaction,
      nome: a.name,
      // "Requer alvo Agarrado" e "Requer 6m de corrida" (2026-09-27): o motor
      // não modela o agarrão nem a corrida, e sem isto o Lutador usava o
      // Arremesso e a Investida três vezes por turno. A Ação do agarrão (ou do
      // Andar, Cap. 4, §3) entra no custo — o motor ainda supõe que o agarrão
      // pega, então fica otimista, e isso está escrito aqui.
      acoes: a.reaction ? 1 : Math.max(1, a.actions.normal) + (/^requer (alvo agarrado|6 ?m de corrida)/i.test(a.effect.trim()) ? 1 : 0),
      pm: a.pmCost ?? 0,
      pt: a.ptCost ?? 0,
      tipo,
      // As duas fórmulas nunca estão preenchidas ao mesmo tempo: a de dano fica
      // vazia no suporte pra que uma cura que vaze pro caminho de dano some
      // zero em vez de curar o inimigo.
      /*
       * O dano também é lido pelo CASO BASE desde a 0.1.39.
       *
       * Onze técnicas do livro descrevem o caso condicional na mesma linha, e o
       * motor somava os dois: a Explosão do Fogo (3d6, +3d6 contra Em Chamas)
       * rolava o dobro, o Zero Absoluto da Água rolava o TRIPLO. A condição
       * existe no livro e o motor sabe aplicá-la (frio dobra contra Molhado);
       * o que ele não pode é cobrar a exceção junto com a regra.
       */
      dano: (() => {
        if (ehSuporte) return "";
        let base = casoBase(separarSustentado(a.damage.normal).impacto);
        if (/dano furtivo/i.test(base)) {
          const ladinoRankStr = getHighestUnlockedRank(c, "furtividade-e-armadilhas");
          if (ladinoRankStr) {
            const idx = ["Principiante", "Intermediário", "Avançado", "Santo", "Rei", "Imperador"].indexOf(ladinoRankStr);
            const diceCount = idx >= 0 ? idx + 1 : 0;
            const multiplied = /triplicado/i.test(base) ? diceCount * 3 : diceCount;
            base = base.replace(/dano furtivo triplicado/i, `${multiplied}d6`);
            base = base.replace(/dano furtivo/i, `${diceCount}d6`);
          }
        }
        return base;
      })(),
      /*
       * O que se repete a cada turno (0.1.57).
       *
       * Nunca em suporte: cura sustentada não existe no livro, e deixar este
       * campo escapar pro lado de suporte reabriria exatamente a armadilha de
       * sinal que `formulaSuporte` foi criada pra fechar.
       */
      /*
       * Zerado quando manter custa a Ação: aí cada tique já vem com a Ação dele,
       * e multiplicar contaria de graça o turno que o personagem gastou. Ver
       * `exigeManutencao`.
       */
      /*
       * Duas fontes, nesta ordem — 0.1.58.
       *
       * 1. `damage.porTurno`, o campo ESTRUTURADO que o livro já tinha e que o
       *    motor ignorava. Quatro habilidades o usam, e a doc dele diz
       *    exatamente o que é: "dano que se repete sozinho a cada turno (...)
       *    sem gastar nova Ação".
       * 2. O regex em `damage.normal`, pras sete que escrevem "por turno" na
       *    própria linha de dano.
       *
       * Zerado quando manter custa a Ação (`exigeManutencao`) ou quando o dano
       * depende de onde o alvo pisa (`dependeDePosicao`) — nos dois casos,
       * multiplicar seria cobrar por um turno que ninguém pagou.
       */
      danoPorTurno: (() => {
        if (ehSuporte || exigeManutencao(a.effect ?? "")) return "";
        const estruturado = a.damage.porTurno ?? "";
        if (estruturado && !dependeDePosicao(estruturado)) return casoBase(estruturado);
        if (estruturado) return "";
        return casoBase(separarSustentado(a.damage.normal).porTurno);
      })(),
      formulaSuporte: ehSuporte ? casoBase(a.damage.normal) : "",
      sempreFresca: /sempre como ferida fresca/i.test(txt),
      // "+1 Dado de Arma", "+2 Dados de Arma", "Dado de arma rolado quatro vezes":
      // QUINZE técnicas do livro multiplicam o dado da arma em vez de trazer
      // dados próprios — medido em 2026-09-10, espalhadas por cinco árvores.
      // Sem isto o Deus da Espada — que o livro chama de maior dano do jogo —
      // aparecia em quarto lugar, porque CINCO das seis ações de dano dele
      // somam zero na conta.
      dadosDeArma: (() => {
        if (ehSuporte) return 0;
        const norm = a.damage.normal.toLowerCase();
        let count = 0;

        if (/dano de arma|dado de arma/.test(norm)) count = 1;

        const v = norm.match(/rolado (duas|três|quatro|cinco|seis|sete) vezes/);
        if (v) count = { duas: 2, três: 3, quatro: 4, cinco: 5, seis: 6, sete: 7 }[v[1]] ?? 0;

        const m = norm.match(/\+\s*(\d+)\s+dados? de arma/);
        if (m) {
           // If it said "+X dados", we just add X to whatever base we had (which is usually 0 if "dado de arma" wasn't written, but if it was, it's 1)
           // Actually, "+2 Dados de Arma" contains "dados de arma", so it triggered count=1 above!
           count += Number(m[1]);
        }

        if (/metade do dado/i.test(norm)) return 0.5;
        if (/arma secund[áa]ria/i.test(norm)) return 1;

        return count;
      })(),
      /*
       * ÁREA — a palavra "linha" sozinha era larga demais (0.1.39).
       *
       * Ela pegava cinco técnicas que não têm área nenhuma, e as três piores
       * eram as que a IA mais escolhe:
       *
       * - **Investida** (Deus da Espada): *"avance até o dobro do deslocamento
       *   EM LINHA RETA e ataque ao final"* — a linha é o caminho de quem corre,
       *   não a forma do golpe. Ela acertava os cinco inimigos do playtest.
       * - **Forma Quadrúpede** (Deus do Norte) e **Investida Devastadora**
       *   (Armas Pesadas): mesma frase, mesmo erro.
       * - **Relâmpago** (Água) e **Golpe que Não Tem Origem** (Vendaval), que
       *   dizem "alcance ilimitado (LINHA DE VISÃO)".
       *
       * A rede agora pede uma linha MEDIDA — "linha de 18m", "linha de 3 km" —,
       * que é como o livro escreve a forma de verdade, e cobre à parte os dois
       * jeitos que ele usa pra dizer "atravessa e pega quem está atrás".
       */
      area: /esfera|cone|área|todos|atinge tudo|atinge até \d|cada criatura|linha de \d/.test(
        (a.range + " " + a.effect).toLowerCase()
      ),
      areaDescricao: `${a.range} ${a.effect}`,
      pvDoUsuarioMaximo: /(?:só usável|apenas se)[^.;]*metade ou menos dos pv/i.test(a.effect) ? 0.5 : undefined,
      pvDoUsuarioMinimo: /(?:só usável|apenas se)[^.;]*metade ou mais dos pv/i.test(a.effect) ? 0.5 : undefined,
      estadoExigidoDoAlvo: (() => {
        const exigido = a.effect.match(/^requer alvo\s+(agarrado|atolado|caído|congelado|em chamas|marcado|molhado|preso)\b/i)?.[1]
          .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "-");
        // Agarrado já é representado pelo custo de +1 Ação logo acima: a IA
        // gasta a preparação e supõe que o teste de agarrar funcionou.
        if (exigido === "agarrado") return undefined;
        return exigido as Acao["estadoExigidoDoAlvo"];
      })(),
      exaustaoDepois: /depois de usar[^.;]*1 nível de exaustão/i.test(a.effect) ? 1 : undefined,
      requerCenarioUtilizavel: /requer cenário utilizável/i.test(a.effect),
      efeitoAtivoExigido: a.effect.match(/pré-requisito:\s*([^.;]+?)\s+ativa\b/i)?.[1].trim(),
      aplicaCongeladoSeMolhado: compra.treeId === "agua" && !!getHighestUnlockedRank(c, "agua") &&
        RANKS.indexOf(getHighestUnlockedRank(c, "agua")!) >= RANKS.indexOf("Avançado") &&
        /frio|gelo/i.test(a.damage.normal) && !/ataque mágico/i.test(a.effect),
      bonusSeCongelado: /contra alvo congelado/i.test(a.effect)
        ? a.effect.match(/causa\s+(\+?\d+d\d+)\s+de frio/i)?.[1]
        : undefined,
      dosesNaFalha: Number(a.effect.match(/falha:[^.;]*?\b(\d+)\s+Doses?\b/i)?.[1]) || undefined,
      dosesNoSucesso: Number(a.effect.match(/sucesso:[^.;]*?\b(\d+)\s+Doses?\b/i)?.[1]) || undefined,
      inverteDose: a.damage.normal.match(/(\d+d\d+)\s+de dano de veneno por Dose invertida/i)?.[1],
      /*
       * A rolagem de ataque, lida do EFEITO — corrigido na 0.1.35.
       *
       * Esta linha procurava as frases em `damage.normal`, e elas nunca estão
       * lá: quem escreve "Ataque mágico à distância" é o `effect`. O resultado
       * medido era ZERO de 122 ações do livro inteiro rolando ataque — todas
       * caíam no ramo de teste de resistência, que não consulta a CA do alvo e
       * garante metade do dano até quando o alvo passa. A CA era decoração, e
       * nenhuma técnica do livro errava.
       *
       * O `area` logo abaixo sempre leu `range + effect`; esta linha ficou pra
       * trás. São 17 técnicas que voltam a poder errar.
       *
       * A rede não é mais larga do que isso de propósito: incluir "ataque corpo
       * a corpo" pegaria mais duas técnicas certas e uma errada — a Devolver
       * (Deus da Água), cuja frase descreve o ataque DO INIMIGO que dispara a
       * Reação, não uma rolagem dela.
       */
      ataque: a.id === "primeiro-golpe" || /ataque mágico|ataque à distância|se acertar/i.test(`${a.damage.normal} ${a.effect} ${a.range}`),
      frio: /frio|gelo/.test(txt),
      fogo: /ígneo|chamas|fogo/.test(txt),
      // Ler apenas a palavra "Molhado" confundia um gatilho ("frio dobra
      // contra Molhado") com a aplicação da condição. A própria carta diz
      // quando alguém FICA Molhado; só esse caso altera o estado do alvo.
      aplicaMolhado: /\b(?:fica|ficam|deixa|deixam|aplica|aplicam|mant[eé]m)\b[^.;]{0,90}\bmolhad[oa]s?\b/i.test(a.effect) ||
        /\b(?:falha|sucesso):[^.;]{0,90}\bmolhad[oa]s?\b/i.test(a.effect),
      /*
       * Quebrantado, lido do EFEITO e não do dano (0.1.35).
       *
       * É a exceção deliberada à regra deste arquivo de só olhar
       * `damage.normal`: os acúmulos nunca aparecem ali, porque não são dano —
       * são uma consequência descrita na prosa ("o alvo ganha 2 acúmulos de
       * Quebrantado"). Sem olhar o efeito, a mecânica central de Armas Pesadas
       * é invisível pra simulação.
       *
       * O risco normal de ler prosa — confundir aplicar com REMOVER — não existe
       * aqui, e isso foi conferido: as treze citações de Quebrantado do livro
       * inteiro são da mesma árvore, e as treze aplicam. O próprio glossário
       * explica por quê: "não é ferimento — magia de Cura não remove".
       */
      aplicaQuebrantado: (() => {
        const efeito = a.effect;
        if (!/quebrantad/i.test(efeito)) return 0;
        if (/ao máximo|iguais ao seu Bônus de Rank/i.test(efeito)) return "maximo" as const;
        const n = efeito.match(/(\d+)\s+ac[úu]mulos?\s+de\s+Quebrantado/i);
        if (n) return Number(n[1]);
        // "ganha 1 acúmulo" sem número escrito por extenso não existe no livro,
        // mas citar a condição sem quantificar vale um acúmulo — é o mínimo que
        // "fica Quebrantado" pode significar.
        return 1;
      })(),
    });
    /*
     * A CONJURAÇÃO CONCENTRADA (Cap. 2, §2 — 2026-09-28): na Conjuração Padrão,
     * a magia de dano vai inteira num alvo só — +50% dos dados (arredondado
     * pra cima) e +50% do PM (pra cima), sem área. Mesmo dano por PM, em menos
     * turnos: é a resposta do mago ao Chefe. A IA só a considera quando resta
     * um inimigo (`escolherAcao`); contra grupo, a área continua ganhando.
     */
    const feita = out[out.length - 1];
    if (tree?.category === "magia" && feita.tipo === "dano" && !feita.reacao && feita.pm > 0 && /\d+d\d+/.test(feita.dano)) {
      out.push({
        ...feita,
        nome: `${feita.nome} (Concentrada)`,
        dano: concentrarDados(feita.dano),
        pm: Math.ceil(feita.pm * 1.5),
        area: false,
        areaDescricao: undefined,
        concentrada: true,
      });
    }
  }
  return out;
}

/** "8d8 + BC" → "12d8 + BC": +50% em cada grupo de dados, arredondado pra cima. */
export function concentrarDados(formula: string): string {
  return formula.replace(/(\d+)d(\d+)/g, (_, n: string, d: string) => `${Math.ceil(Number(n) * 1.5)}d${d}`);
}

/**
 * O caso BASE de uma fórmula que descreve vários — 0.1.37, corrigido na 0.1.39.
 *
 * `rolarDados` soma todo `NdM` que encontra, e o livro escreve a exceção na
 * mesma linha da regra. Sem esta função, a linha inteira vale a SOMA dos dois
 * casos: *"12d12 de frio (24d12 contra alvo Molhado)"* virava 36d12, três vezes
 * o dano escrito.
 *
 * ## Por que remover parênteses em vez de cortar neles
 *
 * A primeira versão cortava no primeiro `(` ou `,`, e isso servia para a cura
 * (onde a exceção vem sempre no fim) mas MUTILA o dano. Quatro técnicas de Água
 * põem o tipo de dano entre parênteses e continuam somando depois:
 * *"3d8 + BC (cortante) + 1d6 de frio"* são 3d8 E 1d6, e cortar no parêntese
 * perderia o 1d6. Remover só o miolo do parêntese acerta os dois casos.
 *
 * ## Os conectores
 *
 * Fora dos parênteses o livro emenda o caso condicional com `;`, `, depois`
 * (dano ao longo do tempo, que não é do mesmo golpe) e `, sempre` (a Prontidão).
 * Cada um está aqui porque existe uma linha do livro que o usa — e a lista é
 * curta de propósito: cortar em vírgula solta perderia dano legítimo.
 */
export function casoBase(formula: string): string {
  return formula
    .replace(/\([^)]*\)/g, " ")
    .split(/;|,\s*depois\b|,\s*sempre\b/i)[0]
    .replace(/\s+/g, " ")
    .trim();
}

/** Resolve uma ficha do site nos números que a simulação usa. */
export function montarFicha(c: CharacterData, rotulo = "", armaId?: string | null): FichaCombate {
  // O MAIOR entre os atributos que o rótulo oferece: o Norte e o Vendaval
  // dizem "Força ou Agilidade", e o Punho do Fogo "Força ou Intelecto".
  const attr = getTreeAttributeKey(c, c.startingTreeId, "forca");
  const bc = c.startingTreeId ? getAttackBonus(c, c.startingTreeId, attr) : 0;

  const arma = resolverArmaCombate(c, armaId);

  const maiorBonus = c.unlockedRanks.reduce((m, u) => Math.max(m, RANK_BONUS[u.rank]), 0);
  const metadeDoMaiorRank = Math.ceil(maiorBonus / 2);
  const vigor = getFinalAttribute(c, "vigor");
  const agilidade = getFinalAttribute(c, "agilidade");
  const espirito = getFinalAttribute(c, "espirito");
  const atributoDoMeio = [vigor, agilidade, espirito].sort((x, y) => x - y)[1];
  const rankDaArvore = (id: string) => { const rank = getHighestUnlockedRank(c, id); return rank ? RANK_BONUS[rank] : 0; };
  const comprou = (id: string, treeId: string) => c.purchasedAbilities.some((a) => a.id === id && a.treeId === treeId);
  const rankAgua = rankDaArvore("deus-da-agua-corpo");
  const rankTatico = rankDaArvore("navegacao-e-lideranca");
  const rankBardo = rankDaArvore("bardo-e-interacao");

  return {
    rankLadino: rankDaArvore("furtividade-e-armadilhas"),
    ppMax: getPpPool(c),
    tatico: rankTatico ? {
      rank: rankTatico,
      primeiroAVer: comprou("primeiro-a-ver", "navegacao-e-lideranca"),
      vozQueCorrige: comprou("voz-que-corrige", "navegacao-e-lideranca"),
      antecipacao: comprou("antecipacao", "navegacao-e-lideranca"),
      vozDeSargento: comprou("voz-de-sargento", "navegacao-e-lideranca"),
      focoDeFogo: comprou("foco-de-fogo", "navegacao-e-lideranca"),
      preverOGolpe: comprou("prever-o-golpe", "navegacao-e-lideranca"),
      semBaixas: comprou("sem-baixas", "navegacao-e-lideranca"),
      avante: comprou("avante", "navegacao-e-lideranca"),
      batalhaEscolhida: comprou("a-batalha-que-voce-escolheu", "navegacao-e-lideranca"),
    } : undefined,
    bardo: rankBardo ? {
      rank: rankBardo,
      insultoAfiado: comprou("insulto-afiado", "bardo-e-interacao"),
      insultoQueFica: comprou("insulto-que-fica", "bardo-e-interacao"),
      cancaoDeGuerra: comprou("cancao-de-guerra", "bardo-e-interacao"),
      duasCancoes: rankBardo >= 3,
      temInspiracao: comprou("inspiracao", "bardo-e-interacao"),
      inspiracaoDados: Math.ceil(rankBardo / 2),
      inspiracoes: Math.max(0, espirito),
    } : undefined,
    doseExtraEmFalhaGrave: comprou("mao-que-nao-contamina", "desintoxicacao"),
    bonusFurtividade: agilidade + rankDaArvore("furtividade-e-armadilhas"),
    temSombraLonga: comprou("sombra-longa", "furtividade-e-armadilhas"),
    rankAgua,
    temAparar: comprou("aparar", "deus-da-agua-corpo"),
    temDevolver: comprou("devolver", "deus-da-agua-corpo"),
    temGuardaCorpo: comprou("guarda-do-corpo", "deus-da-agua-corpo"),
    temPassoVazio: comprou("passo-vazio", "furtividade-e-armadilhas"),
    alcanceReacao: rankAgua >= 6 ? 4.5 : comprou("guarda-longa", "deus-da-agua-corpo") ? 3 : 1.5,
    reacaoExtraFixa: comprou("segunda-guarda", "deus-da-agua-corpo") ? 1 : 0,
    temMareRetorno: comprou("mare-de-retorno", "deus-da-agua-corpo"),
    deslocamento: getDeslocamento(c),
    arma,
    id: c.id,
    nome: c.name || "Sem nome",
    rotulo,
    pvMax: getMaxHp(c),
    ca: getArmorClass(c),
    pmMax: getMaxMp(c),
    ptMax: getPtPool(c),
    bc,
    bcSemRank: Math.max(getFinalAttribute(c, "forca"), agilidade),
    ...resistenciasDe(c),
    bonusDeRank: (() => {
      const rank = c.startingTreeId ? getHighestUnlockedRank(c, c.startingTreeId) : undefined;
      return rank ? RANK_BONUS[rank] : 0;
    })(),
    metadeDoMaiorRank,
    resistencia: atributoDoMeio + metadeDoMaiorRank,
    iniciativa: getInitiative(c).bonus,
    vigor,
    espirito,
    acoes: acoesDe(c),
    fluxoUsosMax: rankAgua === 0 ? 0 : rankAgua === 1 ? 1 : 2,
    fluxoDano: "1d6",
    posturaBonusCA: rankAgua >= 3 ? rankAgua : 0,
    posturaReacoesExtra: rankAgua >= 3 ? Math.ceil(rankAgua / 2) : 0,
    protegidosMax: (() => {
      const s = c.unlockedRanks.find((r) => r.treeId === "cavalaria-e-escudos")?.rank;
      if (!s) return 0;
      const idx = ["Principiante", "Intermediário", "Avançado", "Santo", "Rei", "Imperador"].indexOf(s);
      return idx === 0 ? 1 : idx === 1 ? 2 : idx === 2 ? 3 : 99;
    })(),
    ataqueBasico: novaAcao({
      /*
       * "golpe sem estilo", e não "arma simples" — 0.1.60.
       *
       * O nome é uma SENTINELA: ele decide, três linhas abaixo, se o ataque
       * soma o Bônus de Rank ou só o atributo. A regra que ele marca continua
       * valendo (Cap. 3: quem não abriu árvore do Corpo não soma Rank no
       * golpe); o nome é que morreu na 0.1.52, quando "arma simples" deixou de
       * ser uma categoria do livro.
       *
       * E ele VAZA PRA TELA: o Painel do Mestre imprime "Maior golpe: arma
       * simples", e um Mestre que procurasse esse termo no livro não acharia
       * mais nada.
       */
      nome: arma.treeId ? "golpe comum" : "golpe sem estilo",
      // `escalatedDie` vem sem o "1" na frente ("d8", "2d10"); `rolarDados` só
      // lê "NdM", então o número de dados é escrito aqui.
      dano: (() => {
        const die = arma.escalatedDie;
        return /^d/i.test(die) ? `1${die}` : die;
      })(),
      ataque: true,
    }),
  };
}

/** Estado zerado pra uma batalha nova, a partir da ficha já derivada. */
/**
 * As Resistências e Imunidades que o PERSONAGEM carrega — Cap. 4, §6 (0.1.90).
 *
 * Meia dúzia de Maestrias e traços raciais dão Resistência a um tipo de dano — o
 * Casco do Escudeiro, a Chama Viva do Fogo, a pele do Anão — e o motor ignorava
 * todas, porque nunca existiu um campo pra elas. Depois que o Apêndice G passou
 * a dar Resistência às criaturas, deixar o lado dos personagens de fora seria a
 * mesma regra valendo num sentido só.
 *
 * ## Por que lê a prosa
 *
 * Porque a prosa é onde a informação está. Nenhuma habilidade do livro declara
 * resistência num campo estruturado, e criar um exigiria revisar as ~400 e
 * torcer pra ninguém esquecer de preencher na próxima. Ler o texto tem um custo
 * conhecido — ele erra quando a frase é criativa — e uma vantagem que paga: uma
 * habilidade escrita amanhã já entra sozinha.
 *
 * É a mesma escolha que o motor já faz em três outros lugares (a detecção de
 * fogo, a de Quebrantado, a de cura), e pelo mesmo motivo.
 *
 * ## O que ela NÃO pega
 *
 * "Resistência" condicional ("resiste enquanto estiver na Postura"), porque o
 * motor não modela a condição — e uma resistência que vale sempre é pior que
 * nenhuma. A regex exige o tipo logo depois da palavra, então "ignora
 * Resistência a ígneo" (que é o contrário: FURA a do alvo) não vira resistência
 * de quem tem a habilidade.
 */
export const TIPOS_DE_DANO_CONHECIDOS = [
  "cortante",
  "perfurante",
  "contundente",
  "ígneo",
  "frio",
  "elétrico",
  "radiante",
  "sônico",
  "veneno",
  "ácido",
  "psíquico",
  "arcano",
  "físico",
] as const;

function tiposNaFrase(texto: string, palavra: "resistência" | "imunidade"): string[] {
  const t = texto.toLowerCase();
  const achados = new Set<string>();

  /*
   * DE QUEM É A RESISTÊNCIA — o invocado não é o invocador.
   *
   * Metade do catálogo de Espíritos e Feras descreve o que a CRIATURA INVOCADA
   * ganha, com as mesmas palavras que uma habilidade de personagem usaria. Sem
   * esta linha, o Filhote Evolutivo ("...PV = 25 × Bônus de Rank, Resistência a
   * dano físico...") dava Resistência a dano físico ao INVOCADOR, que seria o
   * talento mais forte do livro por uma larga margem.
   *
   * A checagem é no texto INTEIRO, e não numa janela em volta da palavra: o
   * dono da frase costuma ser nomeado uma vez, lá no começo ("Seu filhote
   * cresce…"), e o resto do parágrafo fala dele por elipse.
   */
  if (/invocad|filhote|pacto/.test(t)) return [];

  // Cada ocorrência da palavra é olhada sozinha: uma Maestria longa pode dizer
  // "ignora Resistência a ígneo" numa frase e "Resistência a frio" na seguinte,
  // e testar o texto inteiro daria a resposta errada para as duas.
  for (let i = t.indexOf(palavra); i >= 0; i = t.indexOf(palavra, i + 1)) {
    const antes = t.slice(Math.max(0, i - 60), i);
    const depois = t.slice(i, i + 90);

    /*
     * O CONTRÁRIO — "ignoram Resistência a perfurante".
     *
     * Metade das aparições da palavra no livro é de habilidades que FURAM a
     * resistência do alvo, e não que dão a sua. A primeira versão desta leitura
     * procurava "ignora" e deixava passar "ignoram": a Arquearia saiu resistindo
     * a perfurante, que é o oposto exato do que a carta dela diz.
     *
     * O `[^.]*$` é o que faz a checagem valer até o fim da FRASE, e não até a
     * palavra anterior: o plasma do Fogo Imperador diz "ignora Resistência e
     * Imunidade a dano ígneo", e com uma janela curta a segunda palavra escapava
     * — o mago de Fogo saía imune ao próprio elemento.
     */
    if (/(ignora|fura|atravessa|nega|anula)\w*[^.]*$/.test(antes)) continue;

    /*
     * O CONDICIONAL e o MUNDANO — o que o motor não sabe distinguir.
     *
     * "Resistência a dano físico MUNDANO" e "...ENQUANTO estiver com os pés no
     * chão" são resistências de verdade, e não entram assim mesmo: a simulação
     * não guarda se o golpe veio de arma mágica nem se o personagem saiu do
     * chão. Contar uma resistência condicional como permanente é pior que não
     * contar nenhuma — o playtest sairia otimista e ninguém saberia por quê.
     */
    if (/mundan|enquanto|salvo|exceto/.test(depois)) continue;


    /*
     * A PREPOSIÇÃO "A" — o que separa as duas "resistências" do livro.
     *
     * "Teste de resistência" é rolagem (Cap. 1, §7); "Resistência A dano ígneo"
     * é metade do dano (Cap. 4, §6). A palavra é a mesma e o significado não
     * tem nada a ver, e foi assim que a Desintoxicação saiu daqui resistindo a
     * dano de veneno: a Maestria dela dá Vantagem em "testes de resistência
     * CONTRA veneno, doença e maldição", que é outra coisa inteira.
     *
     * Exigir "a" (com ou sem "dano"/"de" no meio) separa as duas sem precisar
     * entender a frase: quem dá resistência a dano escreve "a", e quem fala de
     * rolagem escreve "de" ou "contra".
     */
    for (const tipo of TIPOS_DE_DANO_CONHECIDOS) {
      const re = new RegExp(palavra + "\\s+a\\s+(dano\\s+)?(de\\s+)?" + tipo);
      if (re.test(depois)) achados.add(tipo);
    }
  }
  return [...achados];
}

/**
 * Os tipos de dano que um personagem sabe causar — 0.1.90.
 *
 * Sai das fórmulas das habilidades dele ("6d10 + BC (ígneo)"), que é onde o
 * tipo já vivia. Serve pro aviso de Imunidade da tela de encontros: uma
 * criatura imune a ígneo contra um grupo que só causa ígneo não é um encontro
 * difícil, é um jogador sem jogada — e nada na tela dizia isso.
 *
 * Devolve vazio quando não dá pra saber, e o aviso se cala. Um palpite aqui
 * mandaria o Mestre refazer um encontro que estava certo.
 */
export function tiposDeDanoDaFicha(c: CharacterData): string[] {
  const achados = new Set<string>();
  for (const acao of acoesDe(c)) {
    if (acao.tipo !== "dano") continue;
    const f = acao.dano.toLowerCase();
    for (const tipo of TIPOS_DE_DANO_CONHECIDOS) if (f.includes(tipo)) achados.add(tipo);
  }
  return [...achados];
}

export function resistenciasDe(c: CharacterData): { resistencias: string[]; imunidades: string[] } {
  const textos: string[] = [];
  // Maestrias dos patamares desbloqueados: elas são de graça, então valem
  // sempre que o rank está aberto.
  for (const u of c.unlockedRanks) {
    const rd = getTreeById(u.treeId)?.ranks.find((r) => r.rank === u.rank);
    if (rd?.mastery) textos.push(rd.mastery.description);
  }
  // E o que ele comprou com PA.
  for (const compra of c.purchasedAbilities) {
    const rd = getTreeById(compra.treeId)?.ranks.find((r) => r.rank === compra.rank);
    const item =
      rd?.abilities.find((x) => x.id === compra.id) ?? rd?.talents.find((x) => x.id === compra.id);
    if (!item) continue;
    textos.push("effect" in item ? (item.effect ?? "") : (item.description ?? ""));
  }
  // A raça e os despertares comprados (2026-09-26): o Corpo das Profundezas
  // do Oceano, a Martelo e Bigorna do Anão. Despertar de uso limitado ("Uma
  // vez por…", por 1 minuto) não é resistência permanente e fica de fora.
  const raca = getRaceById(c.raceId);
  textos.push(...(raca?.traits ?? []));
  for (const u of raca?.upgrades ?? []) {
    if ((c.racialUpgrades ?? []).includes(u.id) && !/uma vez por/i.test(u.description)) textos.push(u.description);
  }
  const resistencias = new Set<string>();
  const imunidades = new Set<string>();
  for (const texto of textos) {
    for (const t of tiposNaFrase(texto, "resistência")) resistencias.add(t);
    for (const t of tiposNaFrase(texto, "imunidade")) imunidades.add(t);
  }
  // Imunidade engole Resistência: ter as duas ao mesmo tipo é redundância, e
  // deixar as duas listadas faria a ficha parecer errada.
  for (const i of imunidades) resistencias.delete(i);
  return { resistencias: [...resistencias], imunidades: [...imunidades] };
}

export function novoEstado(ficha: FichaCombate): EstadoPersonagem {
  return {
    ...novoAlvo({
      nome: ficha.nome,
      pv: ficha.pvMax,
      // A ficha já desconta Quebrantado da CA; o estado aplica a condição
      // dinamicamente, por isso recebe a CA anterior a esse desconto.
      ca: ficha.ca + ficha.arma.penalidadeQuebrantado,
      quebrantado: ficha.arma.penalidadeQuebrantado,
      fioDaVida: true,
      bonusResistencia: ficha.resistencia,
      resistencias: ficha.resistencias,
      imunidades: ficha.imunidades,
    }),
    ficha,
    pm: ficha.pmMax,
    pt: ficha.ptMax,
    pp: ficha.ppMax ?? 0,
    exaustao: 0,
    efeitosAtivos: new Set(),
    inspiracao: undefined,
    inspiracoesRestantes: ficha.bardo?.inspiracoes ?? 0,
    acoesConcedidas: 0,
    concessorDeAcoes: undefined,
    bonusAcertoDeAliados: 0,
    suportePreparado: false,
    usouAntecipacao: false,
    usouAvante: false,
    usouBatalhaEscolhida: false,
    batalhaEscolhidaTurnos: 0,
    usouSemBaixas: false,
    pvCurado: 0,
    conjurando: null,
    fluxoRestante: 0,
    emPostura: false,
    protegidos: [],
    reacoesExtra: 0,
    usouPrimeiroGolpe: false,
    usouFurtivo: false,
    usadasNoTurno: new Set(),
    usadasNoCombate: new Set(),
    usouPassoVazio: false,
    podeEsconderEmCombate: ficha.temSombraLonga,
    reacoesNesteTurno: new Set(),
    fluxosNesteTurno: new Set(),
    buffs: [],
  };
}

/** O maior patamar que a ficha alcançou em qualquer árvore — 1 (Principiante) a 7 (Deus). */
export function patamarDaFicha(c: CharacterData): number {
  const maior = c.unlockedRanks.reduce((m, u) => Math.max(m, RANKS.indexOf(u.rank)), -1);
  return maior + 1;
}

/** O rank textual correspondente, pra exibição. */
export function rankDaFicha(c: CharacterData): RankName | null {
  const i = patamarDaFicha(c) - 1;
  return i >= 0 ? RANKS[i] : null;
}

// ---------------------------------------------------------------------------
// Resolução
// ---------------------------------------------------------------------------

/**
 * Dano ESPERADO de uma ação contra um alvo — 0.1.35.
 *
 * A IA escolhia pelo dano médio dos dados, que é o dano quando tudo dá certo.
 * Desde que as dezessete técnicas de ataque do livro voltaram a poder ERRAR,
 * esse número passou a mentir na direção delas: uma magia de ataque de 30 de
 * dado vale menos que uma de resistência de 25, porque a primeira pode não
 * causar nada e a segunda causa metade até quando o alvo passa no teste.
 *
 * Não há regra nova inventada aqui. Cada linha abaixo é a probabilidade da
 * mesma conta que `resolver` faz com os dados na mão — se aquela mudar, esta
 * tem que mudar junto.
 */
function ehGolpeBasico(a: Acao): boolean {
  return a.nome === "golpe comum" || a.nome === "golpe sem estilo" || a.regra === "fluxo";
}

export function aberturaFurtiva(e: EstadoPersonagem, alvo: Alvo): string | null {
  if (e.escondido) return "atacante Escondido do alvo";
  if (alvo.surpreso) return "alvo Surpreso";
  if (!alvo.jaAgiu) return "alvo ainda não agiu";
  return null;
}

export function motivoFurtivo(e: EstadoPersonagem, alvo: Alvo, corpoACorpo = true): string | null {
  if (!e.ficha.rankLadino || e.usouFurtivo) return null;
  return aberturaFurtiva(e, alvo) ?? (alvo.cego ? "alvo Cego" : alvo.preso ? "alvo imobilizado" : corpoACorpo && alvo.caido && !(e.preso || e.caido || e.envenenado) ? "Vantagem contra alvo Caído" : null);
}

/**
 * Quantos corpos cabem numa área sem fingir que o combate abstrato tem mapa.
 *
 * A mesma régua é usada nos dois lados do encontro: área curta (até 3 m) pega
 * 2, média (6 m) pega 3, grande (9 m) pega 4 e enorme (acima disso) pega 5.
 * Uma carta que escreve “atinge até N” prevalece. Sem medida, usamos 2 — é o
 * menor grupo que ainda faz a ação ser área, e evita transformar “cone” em
 * “todo o bestiário”.
 */
export function limiteDeAlvosNaArea(descricao = ""): number {
  const explicito = descricao.match(/atinge\s+at[ée]\s+(\d+)\s+(?:alvos?|criaturas?|inimigos?)/i);
  if (explicito) return Math.max(1, Number(explicito[1]));
  const medida = descricao.match(/(\d+(?:[.,]\d+)?)\s*(?:m|metros?)\b/i);
  if (!medida) return 2;
  const metros = Number(medida[1].replace(",", "."));
  if (metros <= 1.5) return 1;
  if (metros <= 3) return 2;
  if (metros <= 6) return 3;
  if (metros <= 9) return 4;
  return 5;
}

export function alvosNaArea<T>(alvos: T[], descricao = ""): T[] {
  return alvos.slice(0, limiteDeAlvosNaArea(descricao));
}

function alvoTemEstado(alvo: Alvo | null, estado: NonNullable<Acao["estadoExigidoDoAlvo"]>): boolean {
  if (!alvo) return false;
  if (estado === "caido") return alvo.caido;
  if (estado === "em-chamas") return alvo.emChamas > 0;
  if (estado === "molhado") return alvo.molhado;
  if (estado === "preso") return alvo.preso;
  // Agarrado, Atolado, Congelado e Marcado ainda não são estados estruturados
  // deste motor. Uma técnica que os EXIGE não pode presumir que aconteceram.
  return false;
}

export function autorizarAcao(e: EstadoPersonagem, a: Acao, alvo: Alvo | null): { legal: boolean; motivo: string } {
  const proporcaoPv = e.pv / Math.max(1, e.ficha.pvMax);
  if (a.pvDoUsuarioMaximo !== undefined && proporcaoPv > a.pvDoUsuarioMaximo) {
    return { legal: false, motivo: `exige ${Math.round(a.pvDoUsuarioMaximo * 100)}% ou menos dos PV` };
  }
  if (a.pvDoUsuarioMinimo !== undefined && proporcaoPv < a.pvDoUsuarioMinimo) {
    return { legal: false, motivo: `exige ${Math.round(a.pvDoUsuarioMinimo * 100)}% ou mais dos PV` };
  }
  if (a.estadoExigidoDoAlvo && !alvoTemEstado(alvo, a.estadoExigidoDoAlvo)) {
    return { legal: false, motivo: `exige alvo ${a.estadoExigidoDoAlvo}` };
  }
  if (a.requerCenarioUtilizavel && !e.cenarioUtilizavel) {
    return { legal: false, motivo: "exige cenário utilizável" };
  }
  if (a.efeitoAtivoExigido && !e.efeitosAtivos.has(a.efeitoAtivoExigido.toLowerCase())) {
    return { legal: false, motivo: `exige ${a.efeitoAtivoExigido} ativa` };
  }
  if (a.inverteDose && (!alvo || alvo.doses === 0)) {
    return { legal: false, motivo: "exige ao menos 1 Dose no alvo" };
  }
  if (a.regra === "primeiro-golpe") {
    if (e.usouPrimeiroGolpe) return { legal: false, motivo: "Primeiro Golpe já foi usado neste combate" };
    const abertura = alvo && aberturaFurtiva(e, alvo);
    return { legal: !!abertura, motivo: abertura ?? "Primeiro Golpe exige alvo Desprevenido" };
  }
  return { legal: true, motivo: a.gatilho ?? "ação disponível" };
}

export function danoEsperado(e: EstadoPersonagem, a: Acao, alvo: Alvo | null): number {
  if (!autorizarAcao(e, a, alvo).legal) return 0;
  const basico = ehGolpeBasico(a);
  const bonus = a.regra === "primeiro-golpe" || basico ? e.ficha.arma.damageBonus : e.ficha.bc;
  const bonusAcerto = basico || a.regra === "primeiro-golpe" ? e.ficha.arma.attackBonus : e.ficha.bc;

  /*
   * O dano bruto é montado exatamente como `resolver` monta o dele: dados
   * próprios, MAIS os Dados de Arma multiplicados, MAIS o bônus fixo.
   *
   * Os Dados de Arma eram o buraco. `mediaDados` só enxerga `NdM`, e QUINZE
   * técnicas do livro multiplicam o dado da arma em vez de trazer dados
   * próprios — inclusive CINCO das seis ações de dano do Deus da Espada, que o
   * livro chama de maior dano do jogo. `resolver` sempre as rolou; a IA que
   * ESCOLHE contava zero nelas e preferia qualquer outra coisa. Foi o mesmo
   * erro da rolagem de ataque, na outra ponta do mesmo arquivo: a resolução
   * certa e a decisão cega.
   */
  const dadosDaAcao = a.inverteDose && alvo
    ? mediaDados(a.inverteDose) * alvo.doses
    : (basico ? mediaFormula(a.dano) : mediaDados(a.dano));
  const bonusCongelado = alvo?.congelado && a.bonusSeCongelado ? mediaDados(a.bonusSeCongelado) : 0;
  const impacto = Math.max(0,
    dadosDaAcao + bonusCongelado +
    (a.dadosDeArma + (a.regra === "primeiro-golpe" ? 1 : 0)) * mediaFormula(e.ficha.ataqueBasico.dano) + bonus - (basico ? e.quebrantado : 0));

  /*
   * O que a magia sustentada rende DEPOIS do turno em que saiu — 0.1.57.
   *
   * `TURNOS_SUSTENTADOS - 1` porque o primeiro turno já está em `impacto`: numa
   * linha como "5d8 + BC por turno" o impacto É o primeiro tique, e o que falta
   * somar são os seguintes.
   *
   * Entra no bruto ANTES da chance de acerto de propósito. As três magias
   * sustentadas do livro cobram teste de resistência, não rolagem de ataque — o
   * ramo de resistência lá embaixo é o que se aplica, e ele reduz o total, não
   * só o impacto. Se algum dia uma delas rolar contra CA, o tique seguinte não
   * deveria depender do mesmo d20; quando isso acontecer, o teste vai acusar.
   */
  const sustentado = a.danoPorTurno
    ? (mediaDados(a.danoPorTurno) + bonus) * (TURNOS_SUSTENTADOS - 1)
    : 0;
  const corpoACorpo = /corpo a corpo|toque/i.test(a.alcance ?? "") || ehGolpeBasico(a);
  const furtivo = a.ataque && alvo && motivoFurtivo(e, alvo, corpoACorpo) ? e.ficha.rankLadino * 3.5 : 0;
  const bruto = impacto + sustentado + furtivo;

  if (!alvo) return bruto;

  if (a.ataque) {
    // O d20 acerta quando `rolagem + bonus >= ca`; o 20 sempre acerta e dobra
    // os dados, o 1 sempre erra. Daí o piso e o teto de 5%.
    const ca = Math.max(1, alvo.ca - alvo.quebrantado);
    const precisa = ca - bonusAcerto;
    const simples = Math.min(0.95, Math.max(0.05, (21 - precisa) / 20));
    const vantagem = e.escondido || alvo.preso || (corpoACorpo && alvo.caido) || alvo.cego;
    const desvantagem = e.preso || e.caido || e.envenenado || (!corpoACorpo && alvo.caido) ||
      ((basico || a.dadosDeArma > 0 || a.regra === "primeiro-golpe") && !e.ficha.arma.proficiente);
    const chance = alvo.congelado && a.bonusSeCongelado
      ? 1
      : vantagem === desvantagem ? simples : vantagem ? 1 - (1 - simples) ** 2 : simples ** 2;
    const chanceCritico = vantagem === desvantagem ? 0.05 : vantagem ? 0.0975 : 0.0025;
    // O crítico (5% do d20) rola TODOS os dados de novo — os próprios da ação
    // e os Dados de Arma — e soma o bônus fixo uma vez só (Cap. 4, §6: "role os
    // dados de dano duas vezes e some os bônus fixos uma vez só"). Até a revisão
    // do livro só os dados próprios dobravam, e as técnicas de Dado de Arma
    // tinham o crítico mais fraco do jogo.
    return (
      chance * bruto +
      chanceCritico * (mediaDados(a.dano) + furtivo + (a.dadosDeArma + (a.regra === "primeiro-golpe" ? 1 : 0)) * mediaDados(e.ficha.ataqueBasico.dano))
    );
  }

  // Ramo de resistência: metade quando o alvo passa. A CD é 8 + BC do atacante;
  // o bônus de quem resiste é o dele (`bonusResistencia`), e só um boneco sem
  // ficha cai na conta antiga de metade do BC do atacante. Igual a `resolver`.
  const cd = 8 + e.ficha.bc;
  const bonusDoAlvo = alvo.bonusResistencia ?? Math.ceil(e.ficha.bc / 2);
  const passa = Math.min(0.95, Math.max(0.05, (21 - (cd - bonusDoAlvo)) / 20));
  return bruto * (1 - passa / 2);
}

/**
 * Estimativa deliberadamente simples da chance de um cântico atravessar até o
 * próximo turno. Ela usa exatamente os três sinais que a decisão conhece:
 * Concentração do conjurador, quantidade de inimigos ativos e PV restante.
 */
export function chanceDeConcluirCantico(e: EstadoPersonagem, a: Acao, inimigos: Alvo[]): number {
  const acoesDoTurno = Math.min(4, e.ficha.acoesPorTurno ?? 3);
  if (a.acoes <= acoesDoTurno) return 1;
  const ativos = inimigos.filter((x) => x.vivo);
  if (ativos.length === 0) return 1;
  const bonusConcentracao = e.ficha.espirito + e.ficha.metadeDoMaiorRank;
  const bonusRankMedio = ativos.reduce((s, x) => {
    const bonusAtaque = (x as Alvo & { bonusAtaque?: number }).bonusAtaque ?? 2;
    return s + Math.min(6, Math.max(1, Math.round(bonusAtaque / 2)));
  }, 0) / ativos.length;
  const cd = 10 + bonusRankMedio;
  const chancePorTeste = Math.min(0.95, Math.max(0.05, (21 - (cd - bonusConcentracao)) / 20));
  const testesEsperados = Math.max(1, ativos.length * 0.75);
  const danoAteVoltar = ativos.reduce((s, x) =>
    s + ((x as Alvo & { danoPorTurno?: number }).danoPorTurno ?? 0), 0);
  const chanceDeFicarDePe = danoAteVoltar > 0 ? Math.min(1, e.pv / danoAteVoltar) : 1;
  return Math.pow(chancePorTeste, testesEsperados) * chanceDeFicarDePe;
}

/**
 * Melhor ação que cabe nas Ações e recursos restantes, por dano ESPERADO por
 * Ação contra o alvo da vez.
 *
 * O alvo é opcional porque nem todo chamador tem um — sem ele a escolha cai no
 * dano bruto, que é o comportamento anterior à 0.1.35.
 */
export function escolherAcao(
  e: EstadoPersonagem,
  acoesRestantes: number,
  alvo: Alvo | null = null,
  /**
   * Deixa a escolha considerar magia que NÃO cabe no que resta, começando um
   * cântico dividido (Cap. 4, §3) — 0.1.40.
   *
   * Só o turno inteiro autoriza. É uma regra de decisão minha, declarada, e ela
   * existe por uma medição: sem ela, um mago com 1 Ação sobrando largava o golpe
   * de arma e começava um cântico de 3 Ações, o que gasta a sobra E amarra o
   * turno seguinte. O time dos magos caiu 16 pontos de vitória por causa disso,
   * e o livro não pede nada parecido — ele só PERMITE dividir. Comprometer-se
   * com uma magia grande é decisão de começo de turno, não de sobra de turno.
   */
  permitirCantico = false,
  inimigos: Alvo[] = alvo ? [alvo] : []
): Acao {
  /*
   * O filtro de Ações caiu na 0.1.40 — a Conjuração Dividida (Cap. 4, §3).
   *
   * `a.acoes <= acoesRestantes` excluía toda magia de 4 Ações (Rei e Imperador —
   * o teto do Cap. 2), porque um turno tem 3. Eram ações de dano invisíveis, e
   * não as menores: Sol
   * Menor, Zero Absoluto, Era Glacial, Vazio. O livro não proíbe conjurá-las —
   * ele manda dividir o cântico entre turnos.
   *
   * `tipo === "dano"` fica: a lista contém cura e escudo desde a 0.1.37, e uma
   * delas escolhida aqui rolaria fórmula de dano vazia e queimaria o turno.
   */
  const viaveis = e.ficha.acoes.filter(
    (a) =>
      a.tipo === "dano" && !a.reacao && a.acoes > 0 &&
      !(a.limite === "turno" && e.usadasNoTurno?.has(a.nome)) &&
      !(a.limite === "combate" && e.usadasNoCombate?.has(a.nome)) &&
      a.pm <= e.pm &&
      a.pt <= e.pt &&
      (permitirCantico || a.acoes <= acoesRestantes) &&
      (a.acoes <= acoesRestantes || chanceDeConcluirCantico(e, a, inimigos) >= 0.35) &&
      !(a.concentrada && inimigos.filter((x) => x.vivo).length > 1) &&
      autorizarAcao(e, a, alvo).legal
  );
  const valor = (a: Acao) => {
    const chance = a.acoes > acoesRestantes ? chanceDeConcluirCantico(e, a, inimigos) : 1;
    return danoEsperado(e, a, alvo) * chance / a.acoes;
  };
  return viaveis.reduce(
    (melhor, a) => valor(a) > valor(melhor) ? a : melhor,
    e.ficha.ataqueBasico
  );
}

/** Resolve UMA ação contra UM alvo e devolve o dano causado. */
export function resolver(
  e: EstadoPersonagem, a: Acao, alvo: Alvo, rng: Rng,
  registrar?: (evento: EventoAtaque) => void
): number {
  const estavaMolhado = alvo.molhado;
  const basico = ehGolpeBasico(a);
  const usaArma = basico || a.dadosDeArma > 0 || a.regra === "primeiro-golpe";
  const ordem = alvo.apontado;
  const executaPropriaOrdem = !!ordem && ordem.tatico === e && usaArma && e.ficha.arma.proficiente;
  const bonusDaOrdem = executaPropriaOrdem ? ordem.tatico.ficha.tatico?.rank ?? 0 : 0;
  // Teto de Auxílio: bônus numérico vindo de aliados nunca passa de +6.
  const bonusAliadoAcerto = Math.min(6, Math.max(0, e.bonusAcertoDeAliados));
  const bonusAliadoDano = ordem?.focoDeFogo && ordem.tatico !== e ? Math.min(6, ordem.tatico.ficha.tatico?.rank ?? 0) : 0;
  const bonus = (a.regra === "primeiro-golpe" || basico ? e.ficha.arma.damageBonus : e.ficha.bc) +
    (a.bonusContextual ?? 0) + bonusDaOrdem + bonusAliadoDano;
  const bonusAcerto = (basico || a.regra === "primeiro-golpe" ? e.ficha.arma.attackBonus : e.ficha.bc) +
    bonusDaOrdem + bonusAliadoAcerto;
  // Preso, Caído e Envenenado (Cap. 4, §7-8): "seus ataques têm Desvantagem" é
  // igual pras três, então o personagem afetado por qualquer uma rola pior — e
  // "ataques contra você têm Vantagem" (só Preso e Caído) faz o ALVO comprado
  // por essas duas facilitar a vida de quem o ataca.
  const semProficiencia = usaArma && !e.ficha.arma.proficiente;
  const corpoACorpo = /corpo a corpo|toque/i.test(a.alcance ?? "") || ehGolpeBasico(a);
  const desvantagemPropria = e.preso || e.caido || e.envenenado || e.exaustao >= 3 || semProficiencia || (!corpoACorpo && alvo.caido);
  const vantagemContraAlvo = e.escondido || alvo.preso || (corpoACorpo && alvo.caido) || alvo.cego;
  /*
   * Quebrantado (Cap. 4, §2): cada acúmulo tira 1 da CA do alvo e 1 do dano de
   * QUEM o carrega. Aqui aparecem os dois lados da mesma condição — a CA menor
   * do alvo facilita o acerto, e os acúmulos do próprio atacante cobram dele.
   */
  const caDoAlvo = Math.max(1, alvo.ca - alvo.quebrantado);
  const evento: EventoAtaque | undefined = registrar ? {
    atacante: e.nome, alvo: alvo.nome, acao: a.nome,
    acertou: true, critico: false, parcelas: [], bonusDano: bonus,
    bruto: 0, aposModificadores: 0,
    arma: usaArma ? e.ficha.arma : undefined,
    notas: [
      ...(semProficiencia ? ["Desvantagem: sem proficiência com a arma"] : []),
      ...(e.preso || e.caido || e.envenenado ? ["Desvantagem: condição do atacante"] : []),
      ...(e.exaustao >= 3 ? [`Desvantagem: Exaustão ${e.exaustao}`] : []),
      ...(alvo.preso || (corpoACorpo && alvo.caido) || alvo.cego ? ["Vantagem: condição do alvo"] : []),
      ...(!corpoACorpo && alvo.caido ? ["Desvantagem: ataque à distância contra alvo Caído"] : []),
      ...(basico ? [`Bônus de dano: atributo ${e.ficha.arma.attributeValue} + Rank ${e.ficha.arma.rankBonus}`] : []),
      ...(bonusDaOrdem ? [`Ordem de Tiro própria: +${bonusDaOrdem} no acerto e no dano`] : []),
      ...(bonusAliadoAcerto ? [`Canção de Guerra: +${bonusAliadoAcerto} no acerto`] : []),
      ...(bonusAliadoDano ? [`Foco de Fogo: +${bonusAliadoDano} no dano`] : []),
    ],
  } : undefined;
  const autorizacao = autorizarAcao(e, a, alvo);
  if (!autorizacao.legal) {
    if (evento) { evento.acertou = false; evento.notas.push(autorizacao.motivo); registrar?.(evento); }
    return 0;
  }
  if (a.regra || a.gatilho) evento?.notas.push(`Gatilho: ${autorizacao.motivo}`);
  if (e.escondido) evento?.notas.push("Vantagem: atacante Escondido");
  if (a.regra === "primeiro-golpe") e.usouPrimeiroGolpe = true;
  const rolarParcela = (origem: string, formula: string, multiplicador = 1, critico = false) => {
    if (!formula || multiplicador === 0) return 0;
    const rolagem = critico
      ? rolarCriticoComRegistro(formula, rng, multiplicador)
      : rolarComRegistro(formula, rng, multiplicador);
    evento?.parcelas.push({ origem: critico ? `${origem} (dados adicionais do crítico)` : origem, rolagem });
    return rolagem.total;
  };
  // Dados próprios continuam separados dos bônus textuais da habilidade.
  const proprios = a.inverteDose ? a.inverteDose : basico ? a.dano : (a.dano.match(/\d+d\d+/gi) ?? []).join("+");
  const multiplicadorDose = a.inverteDose ? alvo.doses : 1;
  const rolarDano = (critico = false) =>
    rolarParcela(a.inverteDose ? "Inversão por Dose" : basico ? "Arma" : "Habilidade", proprios, multiplicadorDose, critico) +
    rolarParcela("Quebra de Gelo", alvo.congelado ? (a.bonusSeCongelado ?? "") : "", 1, critico) +
    rolarParcela("Dados de Arma", e.ficha.ataqueBasico.dano, a.dadosDeArma + (a.regra === "primeiro-golpe" ? 1 : 0), critico);
  let dano = 0;
  let falhouResistencia = true;
  let inspiracaoUsada: EstadoPersonagem | undefined;
  if (a.ataque) {
    let teste = rolarD20ComRegistro(rng, vantagemContraAlvo, desvantagemPropria);
    let rolagem = teste.natural;
    let total = rolagem + bonusAcerto;
    let caEfetiva = corpoACorpo ? (alvo.caAposAparar?.(e, rolagem, total) ?? caDoAlvo) : caDoAlvo;
    const acertoAutomatico = alvo.congelado && !!a.bonusSeCongelado;
    const errou = () => !acertoAutomatico && (rolagem === 1 || (rolagem !== 20 && total < caEfetiva));
    if (errou() && ordem?.tatico.ficha.tatico?.vozQueCorrige && consumirReacao(ordem.tatico)) {
      teste = rolarD20ComRegistro(rng, vantagemContraAlvo, desvantagemPropria);
      rolagem = teste.natural;
      total = rolagem + bonusAcerto;
      caEfetiva = corpoACorpo ? (alvo.caAposAparar?.(e, rolagem, total) ?? caDoAlvo) : caDoAlvo;
      evento?.notas.push(`Voz que Corrige: ataque repetido por ${ordem.tatico.nome}.`);
    }
    if (errou() && rolagem !== 1 && e.inspiracao && total + e.inspiracao.dados * 6 >= caEfetiva) {
      const inspiracao = e.inspiracao;
      const acrescimo = rolarParcela("Inspiração", `${inspiracao.dados}d6`);
      e.inspiracao = undefined;
      total += acrescimo;
      inspiracaoUsada = inspiracao.fonte;
      evento?.notas.push(`Inspiração de ${inspiracao.fonte.nome}: +${acrescimo} depois de ver o resultado.`);
    }
    if (evento) {
      evento.teste = { ...teste, tipo: "ataque", bonus: bonusAcerto, total, defesa: caEfetiva };
      if (caEfetiva > caDoAlvo) evento.notas.push(`Aparar: CA ${caDoAlvo} → ${caEfetiva}.`);
    }
    if (errou()) {
      if (evento) { evento.acertou = false; registrar?.(evento); }
      return 0;
    }
    dano = rolarDano() + bonus;
    if (ordem && !ordem.acertou) {
      const bonusApontado = rolarParcela("Ordem de Tiro", `${ordem.dados}d6`);
      dano += bonusApontado;
      // Contribuição assistida: o golpe segue pertencendo a quem acertou, mas
      // o relatório também precisa enxergar o valor criado pelo Tático.
      ordem.tatico.danoCausado += bonusApontado + bonusAliadoDano;
      ordem.acertou = true;
      evento?.notas.push(`Apontado consumido: +${ordem.dados}d6 no primeiro acerto.`);
    }
    // Crítico: todos os dados de novo, Dados de Arma incluídos; o bônus fixo não.
    if (rolagem === 20) {
      dano += rolarDano(true);
      if (evento) evento.critico = true;
    }
    const furtivo = motivoFurtivo(e, alvo, corpoACorpo);
    if (furtivo) {
      const formula = `${e.ficha.rankLadino}d6`;
      dano += rolarParcela("Dano Furtivo", formula);
      if (rolagem === 20) dano += rolarParcela("Dano Furtivo", formula, 1, true);
      e.usouFurtivo = true;
      evento?.notas.push(`Dano Furtivo autorizado: ${furtivo}; uso deste turno consumido.`);
    } else if (e.ficha.rankLadino) {
      evento?.notas.push(e.usouFurtivo ? "Dano Furtivo já usado neste turno." : "Dano Furtivo não aplicado: sem abertura ou Vantagem.");
    }
    if (evento) evento.bruto = dano;
    if (inspiracaoUsada) inspiracaoUsada.danoCausado += dano;
  } else {
    // teste de resistência do alvo: metade se passar. Envenenado também cobra
    // Desvantagem em "testes de atributo" (Cap. 4, §7) — e resistir a uma
    // magia é isso. O bônus é o do ALVO; só o boneco sem ficha usa metade do
    // BC de quem ataca.
    const teste = rolarD20ComRegistro(rng, false, alvo.envenenado);
    const bonusResistencia = alvo.bonusResistencia ?? Math.ceil(e.ficha.bc / 2);
    const resistencia = teste.natural + bonusResistencia;
    dano = rolarDano() + bonus;
    if (evento) {
      evento.teste = { ...teste, tipo: "resistencia", bonus: bonusResistencia, total: resistencia, defesa: 8 + e.ficha.bc };
      evento.bruto = dano;
    }
    if (resistencia >= 8 + e.ficha.bc) {
      falhouResistencia = false;
      dano = Math.floor(dano / 2);
      evento?.notas.push("Resistência bem-sucedida: metade do dano, arredondada para baixo");
    }
  }
  // Água: frio dobra contra Molhado (Cap. 4, §5)
  if (a.frio && alvo.molhado) {
    dano *= 2;
    evento?.notas.push("Frio contra Molhado: dano ×2");
  }
  // O próprio atacante Quebrantado bate mais fraco — 1 por acúmulo, e nunca
  // abaixo de zero: a condição enfraquece o golpe, não cura o alvo.
  dano = Math.max(0, dano - e.quebrantado);
  if (e.quebrantado) evento?.notas.push(`Quebrantado do atacante: −${e.quebrantado}`);
  if (a.aplicaMolhado) { alvo.molhado = true; alvo.emChamas = 0; }
  if (a.aplicaQuebrantado) {
    // O teto é o Bônus de Rank de quem aplica ("até o máximo do Bônus de Rank
    // de quem aplicou"). O motor não guarda o Bônus de Rank isolado — `bc` é
    // atributo mais rank —, então o teto usa `bonusDeRank` da ficha, que
    // `montarFicha` passou a separar justamente pra isto.
    const teto = e.ficha.bonusDeRank;
    const ganho = a.aplicaQuebrantado === "maximo" ? teto : a.aplicaQuebrantado;
    alvo.quebrantado = Math.min(teto, alvo.quebrantado + ganho);
  }
  // Fogo: Em Chamas cobra 1d6 no início de cada turno do alvo
  if (a.fogo && !alvo.molhado) alvo.emChamas = 6;
  if (a.fogo && alvo.molhado) alvo.molhado = false; // fogo evapora a água
  if (a.aplicaCongeladoSeMolhado && estavaMolhado && falhouResistencia) {
    alvo.congelado = true;
    evento?.notas.push("Termodinâmica Aplicada: alvo Molhado fica Congelado.");
  }
  if (a.bonusSeCongelado && alvo.congelado) {
    alvo.congelado = false;
    evento?.notas.push("Quebra de Gelo: acerto automático, dano extra e Congelado removido.");
  }
  if (a.inverteDose) {
    evento?.notas.push(`Inversão: ${alvo.doses} Dose(s) removida(s).`);
    alvo.doses = 0;
    alvo.envenenado = false;
  } else {
    const dosesDoResultado = falhouResistencia ? a.dosesNaFalha : a.dosesNoSucesso;
    if (dosesDoResultado) {
      const margem = evento?.teste ? evento.teste.defesa - evento.teste.total : 0;
      const ganho = dosesDoResultado + (falhouResistencia && e.ficha.doseExtraEmFalhaGrave && margem >= 5 ? 1 : 0);
      alvo.doses += ganho;
      if (alvo.doses >= 3) {
        alvo.doses = 0;
        alvo.envenenado = false;
        alvo.atordoadoTurnos = 1;
        evento?.notas.push("Terceira Dose: Colapso; as Doses saem e o alvo perde o próximo turno.");
      } else {
        alvo.envenenado = alvo.doses >= 2;
        evento?.notas.push(`Dose: alvo agora tem ${alvo.doses}.`);
      }
    }
  }

  /*
   * Magia sustentada: registra os tiques que ainda vão acontecer — 0.1.57.
   *
   * `TURNOS_SUSTENTADOS - 1` porque o turno do lançamento já foi pago pelo dano
   * que esta função acabou de devolver. Guarda a MÉDIA, e não a fórmula, pelo
   * motivo escrito em `Alvo.sustentados`: o BC é de quem lançou.
   *
   * Não empilha duas cópias da mesma magia sobre o mesmo alvo — o livro
   * descreve estas como áreas e domínios, e duas Tempestades no mesmo lugar são
   * uma Tempestade. Sem esta trava, uma IA que escolhesse a mesma magia dois
   * turnos seguidos dobraria o relógio.
   */
  if (a.danoPorTurno && dano > 0) {
    const media = mediaDados(a.danoPorTurno) + e.ficha.bc;
    const jaTem = alvo.sustentados.some((x) => Math.abs(x.media - media) < 0.01);
    if (!jaTem) alvo.sustentados.push({ media, turnos: TURNOS_SUSTENTADOS - 1 });
  }
  if (evento) {
    evento.aposModificadores = dano;
    registrar?.(evento);
  }
  return dano;
}

/**
 * A ÚNICA porta por onde dano entra num alvo — 0.1.37.
 *
 * Antes disto, `alvo.pv -= dano; if (alvo.pv <= 0) alvo.vivo = false;` estava
 * copiado em cinco lugares (motor, tela de encontros e script, duas vezes cada
 * em alguns). Enquanto dano era só subtração, cinco cópias de duas linhas eram
 * feias e inofensivas. PV Temporários e Ferida Fresca mudam isso: as duas são
 * consequências de LEVAR dano, e um lugar que não as aplicasse viraria um
 * buraco silencioso — a Casca que não absorve num dos caminhos, a cura que não
 * dobra porque ninguém marcou a ferida.
 *
 * Devolve o dano efetivamente sofrido nos PV reais, que é o que o atacante tem
 * direito de contar como feito.
 */
export function aplicarDano(
  alvo: Alvo,
  dano: number,
  bonusDeRankDeQuemBate = 2,
  /**
   * Necessário só pra rolar o teste de Concentração de quem está conjurando
   * (Cap. 2, §6). Sem ele o cântico não é testado — é o que as contas puras
   * (`danoEsperado`, testes de unidade de absorção) querem.
   */
  rng?: Rng,
  /** O golpe foi um 20 natural? Só importa em quem já está a 0 PV: 2 Marcas em vez de 1. */
  critico = false,
  /**
   * O tipo do dano, em minúscula ("ígneo", "cortante"…). Sem ele, Resistência
   * e Imunidade não se aplicam — é o caso das contas puras e do dano genérico
   * do orçamento por turno, que não tem tipo declarado.
   */
  tipoDeDano?: string,
  evento?: EventoAtaque
): number {
  if (evento) evento.aplicacao = { aposResistencia: Math.max(0, dano), absorvidoTemporario: 0, perdaPv: 0, danoEfetivo: 0 };
  if (dano <= 0) return 0;
  /*
   * RESISTÊNCIA E IMUNIDADE — Cap. 4, §6, antes de tudo o mais.
   *
   * A ordem é a do livro: "reduções fixas entram antes; depois, Resistência,
   * Imunidade ou Vulnerável". As reduções fixas (Touki Concentrado, Defender)
   * já saíram do número que chega aqui; PV Temporários NÃO são redução, são
   * uma poça de vida — então eles vêm depois, e a casca absorve o valor já
   * reduzido. Imunidade zera antes de a casca ser gastada, que é o certo: não
   * se gasta escudo contra o que não machuca.
   */
  if (tipoDeDano) {
    const t = tipoDeDano.toLowerCase();
    if (alvo.imunidades.some((i) => t.includes(i))) {
      if (evento?.aplicacao) evento.aplicacao.aposResistencia = 0;
      evento?.notas.push("Imunidade ao tipo de dano");
      return 0;
    }
    if (alvo.resistencias.some((r) => t.includes(r))) {
      dano = Math.floor(dano / 2);
      evento?.notas.push("Resistência ao tipo de dano: metade");
    }
    if (evento?.aplicacao) evento.aplicacao.aposResistencia = dano;
    if (dano <= 0) return 0;
  }
  /*
   * DANO A 0 PV — Cap. 4, §7 (revisão do livro).
   *
   * "Sofrer dano a 0 PV dá 1 Marca da Morte (2 se for crítico) e tira o
   * Estabilizado." Antes o livro não dizia nada, e o motor tratava o golpe no
   * caído como se ele caísse de novo: regravava a CD e zerava o Estabilizado,
   * sem Marca nenhuma. A Bola de Fogo que pega o aliado no chão agora custa.
   */
  if (alvo.inconsciente && !alvo.morto) {
    alvo.pv = 0;
    alvo.feridaFresca = 1;
    alvo.estabilizado = false;
    alvo.marcasDaMorte += critico ? 2 : 1;
    evento?.notas.push(`Alvo a 0 PV: +${critico ? 2 : 1} Marca${critico ? "s" : ""} da Morte`);
    if (alvo.marcasDaMorte >= 3) {
      alvo.morto = true;
      alvo.inconsciente = false;
    }
    return 0;
  }
  // "Gastos antes dos PV reais": a casca come o golpe primeiro, e só o que
  // sobrar chega na carne.
  const absorvido = Math.min(alvo.pvTemp, dano);
  const pvAntes = alvo.pv;
  alvo.pvTemp -= absorvido;
  const real = dano - absorvido;
  alvo.pv -= real;
  // A ferida marca mesmo quando a casca comeu tudo: quem levou o golpe levou o
  // golpe, e a janela de cura em dobro é sobre o momento, não sobre o número.
  // Vale 1 e fecha no início do próximo turno do alvo (`turnoPersonagem`).
  alvo.feridaFresca = 1;
  /*
   * Cap. 2, §6: *"sofrer dano NÃO interrompe automaticamente"* — quem conjura
   * faz um teste de Espírito contra CD 10 + o Bônus de Rank de quem acertou.
   * Sucesso e o cântico segue com as Ações gastas valendo; falha e perde o
   * cântico e metade do PM investido.
   */
  if (rng && "conjurando" in alvo) {
    const resultado = testeDeConcentracao(alvo as EstadoPersonagem, bonusDeRankDeQuemBate, rng);
    if (resultado === "perdeu") evento?.notas.push("Concentração falhou: perdeu o cântico e metade do PM investido.");
    if (resultado === "manteve") evento?.notas.push("Concentração passou: o cântico continua.");
  }
  if (rng) alvo.aoSofrerDano?.(bonusDeRankDeQuemBate, rng, evento);
  if (alvo.pv <= 0) {
    if (alvo.evitarQueda?.()) {
      alvo.pv = 1;
      alvo.vivo = true;
      alvo.inconsciente = false;
      evento?.notas.push("Sem Baixas: a queda foi evitada e o alvo ficou com 1 PV.");
      if (evento?.aplicacao) {
        evento.aplicacao.absorvidoTemporario = absorvido;
        evento.aplicacao.perdaPv = Math.max(0, pvAntes - alvo.pv);
        evento.aplicacao.danoEfetivo = evento.aplicacao.perdaPv;
      }
      return Math.max(0, pvAntes - alvo.pv);
    }
    alvo.pv = 0;
    alvo.vivo = false;
    /*
     * Cap. 4, §7: quem tem Fio da Vida CAI, não morre — e "quem te derrubou
     * decide o quanto é difícil voltar", então a CD do teste é gravada no
     * momento da queda, com o Bônus de Rank de quem desferiu o golpe. Um goblin
     * de estrada deixa em CD 9; um Rei-Demônio, em CD 14. É a mesma ferida.
     */
    if (alvo.fioDaVida && !alvo.morto) {
      alvo.inconsciente = true;
      alvo.estabilizado = false;
      alvo.cdFioDaVida = 8 + bonusDeRankDeQuemBate;
      /*
       * Inconsciente é Incapacitado, e Incapacitado interrompe o cântico SEM
       * teste (Cap. 2, §6). O preço é o mesmo da Concentração que falha: o
       * cântico e metade do PM investido.
       */
      const conjurador = alvo as Partial<EstadoPersonagem>;
      if (conjurador.conjurando && typeof conjurador.pm === "number") {
        conjurador.pm += Math.ceil(conjurador.conjurando.acao.pm / 2);
        conjurador.conjurando = null;
        evento?.notas.push("Ficou Inconsciente: perdeu o cântico e metade do PM investido.");
      }
    }
  }
  if (evento?.aplicacao) {
    evento.aplicacao.absorvidoTemporario = absorvido;
    evento.aplicacao.perdaPv = Math.max(0, pvAntes - alvo.pv);
    evento.aplicacao.danoEfetivo = evento.aplicacao.perdaPv;
  }
  return real;
}

/** Resolve e aplica o mesmo ataque; o recibo observa as rolagens já realizadas. */
export function executarAtaquePersonagem(
  e: EstadoPersonagem, acao: Acao, alvo: Alvo, rng: Rng, logger?: RegistroCombate
): number {
  let evento: EventoAtaque | undefined;
  const dano = resolver(e, acao, alvo, rng, (registro) => { evento = registro; });
  e.escondido = false;
  const pvAntes = alvo.pv;
  aplicarDano(alvo, dano, e.ficha.bonusDeRank, rng, evento?.critico ?? false, acao.dano, evento);
  const causado = Math.max(0, pvAntes - alvo.pv);
  if (evento?.aplicacao) evento.aplicacao.danoEfetivo = causado;
  if (evento && logger) {
    evento.notas.push(`Custo: ${acao.acoes} Ação(ões), ${acao.pm} PM, ${acao.pt} PT`);
    if (logger.ataque) logger.ataque(evento);
    else logger.log(formatarEventoAtaque(evento));
  }
  if (evento?.acertou === false && acao.ataque &&
    (/corpo a corpo|toque/i.test(acao.alcance ?? "") || acao.nome === "golpe comum" || acao.nome === "golpe sem estilo")) {
    alvo.aoErrarCorpoACorpo?.(e, acao.dano, rng, logger);
  }
  return causado;
}

/**
 * O teste de resistência de Vigor com a Escala do Vigor (Cap. 4, §1 e §7).
 *
 * 1d20 + Vigor + metade do maior Bônus de Rank. Constituição Frágil (Vigor −1)
 * rola com Desvantagem; Corpo Quebrado (Vigor −2) rola com Desvantagem, SEM a
 * metade do Rank, e falha criticamente em 1 ou 2. Devolve a rolagem natural
 * (pra quem precisa saber do 1) e o total.
 */
function testeDeVigor(e: EstadoPersonagem, rng: Rng): { natural: number; total: number; falhaCritica: boolean } {
  const vigor = e.ficha.vigor;
  const quebrado = vigor <= -2;
  const natural = d20Ajustado(rng, false, vigor < 0 || e.envenenado);
  const total = natural + vigor + (quebrado ? 0 : e.ficha.metadeDoMaiorRank);
  return { natural, total, falhaCritica: natural === 1 || (quebrado && natural === 2) };
}

/**
 * O teste de Concentração — Cap. 2, §6 e Cap. 4, §3 (0.1.40).
 *
 * *"Sempre que você sofrer dano enquanto estiver Conjurando, faça um teste de
 * resistência de Espírito contra CD 10 + o Bônus de Rank de quem te acertou.
 * Sucesso: o cântico segue, as Ações já gastas continuam valendo. Falha: a
 * conjuração é interrompida, e você perde o cântico e METADE do PM investido,
 * arredondado pra baixo."*
 *
 * A meia devolução de PM é a parte fácil de errar: o livro cobra METADE, não o
 * total — quem foi interrompido perdeu tempo e mana, mas não a magia inteira.
 * Como a perda arredonda pra baixo, o que VOLTA arredonda pra cima: uma magia de
 * 5 PM interrompida custa 2 e devolve 3.
 *
 * É um teste de resistência como qualquer outro, então soma a metade do maior
 * Bônus de Rank (Cap. 4, §1) — até a revisão do livro o motor rolava só
 * d20 + Espírito, e o Imperador se concentrava como um Principiante.
 */
export function testeDeConcentracao(
  e: EstadoPersonagem, bonusDeRankDeQuemBate: number, rng: Rng
): "sem-cantico" | "manteve" | "perdeu" {
  if (!e.conjurando) return "sem-cantico";
  const cd = 10 + bonusDeRankDeQuemBate;
  if (d20Ajustado(rng, false, e.envenenado) + e.ficha.espirito + e.ficha.metadeDoMaiorRank >= cd) return "manteve";
  // Falhou: perde metade do PM (pra baixo), então volta a outra metade (pra cima).
  e.pm += Math.ceil(e.conjurando.acao.pm / 2);
  e.conjurando = null;
  return "perdeu";
}

/**
 * Perda de Foco, no fim do turno de quem conjura — Cap. 4, §3.
 *
 * *"Pra manter a mana canalizada, você é obrigado a gastar pelo menos 1 Ação por
 * turno recitando. Se passar um turno inteiro sem dedicar nenhuma Ação, a magia
 * falha, a mana se perde, e você recomeça do zero."*
 *
 * Aqui a mana se perde INTEIRA, e não pela metade: a metade é a concessão que o
 * livro faz a quem foi interrompido por um golpe, não a quem largou o cântico.
 */
export function perdaDeFoco(e: EstadoPersonagem): void {
  if (!e.conjurando) return;
  if (e.conjurando.acoesNesteTurno === 0) e.conjurando = null;
}

/**
 * O teste do Fio da Vida, no início de cada turno de quem está a 0 PV.
 *
 * *"role 1d20 + Vigor contra CD 8 + o Bônus de Rank de quem te derrubou.
 * Sucesso: você fica Estabilizado. Falha: 1 Marca da Morte. Falha Crítica
 * (1 Natural): 2 Marcas. Três Marcas e você morre permanentemente."*
 *
 * É teste de resistência de Vigor, então soma a metade do maior Bônus de Rank
 * e obedece a Escala do Vigor (`testeDeVigor`).
 *
 * **Estabilizado PARA de rolar** — agora é regra do livro, não escolha do
 * motor: ele acorda com 1 PV em 1d4 horas, ou na hora com qualquer cura, e
 * sofrer dano a 0 PV tira o Estabilizado (`aplicarDano`). Nenhum combate aqui
 * dura horas, então quem estabilizou segue fora da luta até um aliado curá-lo.
 */
export function testeDoFioDaVida(e: EstadoPersonagem, rng: Rng): void {
  if (!e.inconsciente || e.estabilizado || e.morto) return;
  const teste = testeDeVigor(e, rng);
  if (teste.falhaCritica) {
    e.marcasDaMorte += 2;
  } else if (teste.total < e.cdFioDaVida) {
    e.marcasDaMorte += 1;
  } else {
    e.estabilizado = true;
  }
  if (e.marcasDaMorte >= 3) {
    e.morto = true;
    e.inconsciente = false;
  }
}

/**
 * Cura um alvo, respeitando o teto de PV e a Ferida Fresca — 0.1.37.
 *
 * Devolve o PV EFETIVAMENTE devolvido: curar 40 em quem está 8 abaixo do máximo
 * vale 8. Contar o rolado em vez do recebido faria um curandeiro parecer melhor
 * justamente quando ele está desperdiçando magia.
 *
 * `rolado` é só o que saiu dos DADOS; `bc` vem à parte porque a Ferida Fresca
 * dobra os dados e soma o BC uma vez só (Cap. 4, §7). Até a revisão do livro
 * o motor recebia dados + BC juntos e dobrava tudo, curando mais do que a carta
 * promete ("1d8 + BC", "2d8 + BC se Ferida Fresca").
 */
export function curar(alvo: Alvo, rolado: number, pvMax: number, sempreFresca = false, bc = 0): number {
  /*
   * Cap. 4, §7: *"qualquer magia de cura ou poção aplicada por um aliado remove
   * todas as Marcas da Morte instantaneamente e você acorda"*.
   *
   * É o trabalho mais importante de um curandeiro no livro, e o motor não o
   * tinha: até a 0.1.38, quem chegava a 0 PV estava morto e nenhuma cura o
   * alcançava. Levantar um companheiro devolve o dano dele ao grupo, e é o
   * único jeito de a espiral de mortes ser interrompida.
   *
   * A Exaustão que o livro cobra de quem acorda ("1 nível até um Descanso
   * Longo") fica de fora: Exaustão não é modelada por este motor.
   */
  if (alvo.inconsciente && !alvo.morto) {
    alvo.inconsciente = false;
    alvo.estabilizado = false;
    alvo.marcasDaMorte = 0;
    alvo.vivo = true;
    alvo.pv = 0;
  }
  if (!alvo.vivo) return 0;
  // Cap. 4, §7: contra Ferida Fresca dobram os DADOS da cura; o BC soma uma vez.
  const total = (alvo.feridaFresca > 0 || sempreFresca ? rolado * 2 : rolado) + bc;
  const antes = alvo.pv;
  alvo.pv = Math.min(pvMax, alvo.pv + total);
  return alvo.pv - antes;
}

/** Concede PV Temporários. Não acumulam: o maior vence, como diz cada magia. */
export function darPvTemp(alvo: Alvo, valor: number): number {
  if (!alvo.vivo || valor <= alvo.pvTemp) return 0;
  const ganho = valor - alvo.pvTemp;
  alvo.pvTemp = valor;
  return ganho;
}

/**
 * A ação de suporte que vale a pena AGORA, ou `null` — 0.1.37.
 *
 * ## A regra de decisão, declarada
 *
 * Uma IA que curasse por "valor esperado" precisaria de um modelo de quanto
 * vale um PV, e esse modelo seria invenção minha entrando num relatório que o
 * livro usa pra calibrar. A regra aqui é a que um jogador usa e cabe numa
 * frase: **cura quem estiver na metade ou abaixo, começando pelo pior.** Se
 * ninguém está ferido, não há suporte a fazer e o turno volta a ser de dano.
 *
 * O limiar de 50% não é neutro e não finge ser: curandeiro que espera demais
 * perde gente, e curandeiro que cura cedo demais desperdiça — 50% é o meio
 * declarado entre os dois, e mudá-lo muda os números do relatório.
 *
 * PV Temporários entram por outro critério, porque não é cura: eles valem em
 * quem AINDA não tem casca, ferido ou não, e por isso são oferecidos ao alvo
 * mais ferido que esteja sem ela.
 */
export function escolherSuporte(
  e: EstadoPersonagem,
  acoesRestantes: number,
  aliados: EstadoPersonagem[]
): { acao: Acao; alvo: EstadoPersonagem } | null {
  const viaveis = e.ficha.acoes.filter(
    (a) => a.tipo !== "dano" && a.acoes <= acoesRestantes && a.pm <= e.pm && a.pt <= e.pt
  );
  if (viaveis.length === 0) return null;

  const curas = viaveis.filter((a) => a.tipo === "cura");

  /*
   * LEVANTAR vem antes de curar, e antes de qualquer outra coisa — 0.1.38.
   *
   * O livro: *"qualquer magia de cura aplicada por um aliado remove todas as
   * Marcas da Morte instantaneamente e você acorda"*. Um companheiro no chão
   * está perdendo o dano dele E rolando contra a morte a cada turno; a mesma
   * magia que devolveria 15 PV a alguém em pé devolve um personagem inteiro à
   * batalha. Nenhuma conta de PV por Ação chega perto disso.
   *
   * Entre dois caídos, o mais perto de morrer — quem tem mais Marcas.
   */
  const caidos = aliados
    .filter((x) => x.inconsciente && !x.morto)
    .sort((x, y) => y.marcasDaMorte - x.marcasDaMorte);
  if (caidos.length > 0 && curas.length > 0) {
    // A MENOR cura que levanta serve: acordar não depende do tamanho do dado, e
    // guardar a magia grande pra quem ainda está de pé é a única economia que
    // esta IA faz — e faz porque o livro a torna óbvia.
    const barata = curas.reduce((m, a) => (a.pm < m.pm ? a : m));
    return { acao: barata, alvo: caidos[0] };
  }

  const vivos = aliados.filter((x) => x.vivo);
  if (vivos.length === 0) return null;

  const feridos = vivos
    .filter((x) => x.pv <= x.ficha.pvMax / 2)
    .sort((x, y) => x.pv / x.ficha.pvMax - y.pv / y.ficha.pvMax);

  if (feridos.length > 0 && curas.length > 0) {
    return { acao: melhorSuporte(curas, feridos.length), alvo: feridos[0] };
  }

  const escudos = viaveis.filter((a) => a.tipo === "escudo");
  if (escudos.length > 0) {
    const semCasca = vivos
      .filter((x) => x.pvTemp === 0)
      .sort((x, y) => x.pv / x.ficha.pvMax - y.pv / y.ficha.pvMax);
    if (semCasca.length > 0) {
      return { acao: melhorSuporte(escudos, semCasca.length), alvo: semCasca[0] };
    }
  }

  return null;
}

/**
 * A melhor entre ações de suporte do mesmo tipo, por PV devolvidos POR AÇÃO.
 *
 * A conta espelha a do lado ofensivo (`danoEsperado / acoes`), com a diferença
 * que só o suporte tem: uma magia em área multiplica pelo número de aliados que
 * ela alcança. Sem isso a escolha era "a maior cura individual", e a Bênção
 * Coletiva — 1d8 em TODO o grupo, por 4 PM — perdia para sempre pra uma Cura de
 * 2d8 num só, inclusive com quatro companheiros caindo ao lado. Era uma magia
 * que o livro tem e a simulação nunca usava.
 *
 * `alcance` é quantos alvos elegíveis existem AGORA — feridos, no caso da cura.
 * Uma magia de área com um ferido só vale o mesmo que a individual, que é
 * exatamente o que a mesa vê.
 */
function melhorSuporte(candidatas: Acao[], alcance: number): Acao {
  const valor = (a: Acao) =>
    // `sempreFresca` dobra de verdade e a IA precisa saber: a Prontidão cura
    // 1d8 escritos que valem 2d8 na mesa, e sem este fator ela era comparada
    // pela metade do que entrega. Só os dados entram aqui — o BC é igual em
    // todas as curas do mesmo curandeiro e não muda a escolha.
    (mediaDados(a.formulaSuporte) * (a.area ? alcance : 1) * (a.sempreFresca ? 2 : 1)) / a.acoes;
  return candidatas.reduce((m, a) => (valor(a) > valor(m) ? a : m));
}

function concederAcao(alvo: EstadoPersonagem, fonte: EstadoPersonagem, quantidade = 1): void {
  alvo.acoesConcedidas = Math.min(2, alvo.acoesConcedidas + quantidade);
  alvo.concessorDeAcoes = fonte;
}

/**
 * Decisões simples dos dois Ofícios de suporte. Elas acontecem antes do ataque:
 * ordem antes do grupo bater, canção antes da primeira troca e economia de
 * ação respeitando os tetos do Cap. 4, §5.
 */
export function prepararSuporteDoTurno(
  e: EstadoPersonagem, inimigos: Alvo[], aliados: EstadoPersonagem[], rng: Rng,
  logger?: RegistroCombate,
): number {
  let custoAcoes = 0;
  const vivos = inimigos.filter((x) => x.vivo);

  if (e.ficha.bardo && vivos.length) {
    const bardo = e.ficha.bardo;
    const tocaGuerra = bardo.cancaoDeGuerra;
    const tocaDissonancia = !tocaGuerra || bardo.duasCancoes;
    if (!e.suportePreparado) {
      custoAcoes++;
      e.suportePreparado = true;
      logger?.log(`[${e.nome}] começa ${tocaGuerra ? "Canção de Guerra" : "Dissonância"} antes da troca de golpes.`);
    } else if (tocaGuerra && bardo.duasCancoes) {
      // A Canção Não Para mantém duas canções pelo preço escrito: 1 Ação/turno.
      custoAcoes++;
    }
    if (tocaGuerra) {
      // + Bônus de Rank do Bardo (mínimo +2) desde 2026-09-28; o teto de +6 de
      // ajuda de aliado é aplicado na rolagem (`bonusAliadoAcerto`).
      for (const aliado of aliados.filter((a) => a.vivo)) aliado.bonusAcertoDeAliados = Math.max(aliado.bonusAcertoDeAliados, Math.max(2, bardo.rank));
    }
    if (tocaDissonancia) {
      for (const alvo of vivos.slice(0, bardo.rank)) {
        const dano = rolarDados(`${bardo.rank}d6`, rng);
        e.danoCausado += aplicarDano(alvo, dano, bardo.rank, rng, false, "sônico");
      }
      logger?.log(`[${e.nome}] mantém Dissonância: até ${bardo.rank} alvo(s) sofrem ${bardo.rank}d6 sônico.`);
    }
    if (bardo.temInspiracao && e.inspiracoesRestantes > 0 && custoAcoes < 3) {
      const inspirado = aliados
        .filter((a) => a !== e && a.vivo && !a.ficha.invocadoDe && !a.inspiracao)
        .sort((a, b) => danoEsperado(b, b.ficha.ataqueBasico, vivos[0]) - danoEsperado(a, a.ficha.ataqueBasico, vivos[0]))[0];
      if (inspirado) {
        inspirado.inspiracao = { dados: bardo.inspiracaoDados, fonte: e };
        e.inspiracoesRestantes--;
        custoAcoes++;
        logger?.log(`[${e.nome}] inspira ${inspirado.nome}: ${bardo.inspiracaoDados}d6 para somar depois de ver um teste.`);
      }
    }
    if (bardo.insultoAfiado && custoAcoes < 3) {
      vivos[0].desvantagemNoProximoAtaque = true;
      custoAcoes++;
      logger?.log(`[${e.nome}] usa Insulto Afiado: o próximo ataque de ${vivos[0].nome} tem Desvantagem.`);
    }
  }

  if (e.ficha.tatico && vivos.length) {
    const tatico = e.ficha.tatico;
    const alvo = vivos[0];
    const anterior = alvo.apontado?.tatico === e && !alvo.apontado.acertou ? alvo.apontado.dados : 0;
    for (const inimigo of inimigos) if (inimigo !== alvo && inimigo.apontado?.tatico === e) inimigo.apontado = undefined;
    alvo.apontado = {
      tatico: e,
      dados: Math.min(tatico.rank * 2, anterior + tatico.rank),
      focoDeFogo: tatico.focoDeFogo,
      acertou: false,
    };
    logger?.log(`[${e.nome}] aponta ${alvo.nome}: o primeiro acerto recebe +${alvo.apontado.dados}d6.`);

    for (const aliado of aliados.filter((a) => a !== e)) {
      aliado.evitarQueda = tatico.semBaixas ? () => {
        if (e.usouSemBaixas || !e.vivo) return false;
        e.usouSemBaixas = true;
        return true;
      } : undefined;
      aliado.preverGolpePor = tatico.preverOGolpe ? e : undefined;
    }

    const melhoresAliados = aliados.filter((a) => a !== e && a.vivo && !a.ficha.invocadoDe)
      .sort((a, b) =>
        mediaFormula(b.ficha.ataqueBasico.dano) + b.ficha.arma.damageBonus -
        (mediaFormula(a.ficha.ataqueBasico.dano) + a.ficha.arma.damageBonus));
    if (tatico.batalhaEscolhida && !e.usouBatalhaEscolhida && inimigos.length > 1 && e.pp >= 4) {
      e.usouBatalhaEscolhida = true;
      e.batalhaEscolhidaTurnos = 3;
      e.pp -= 4;
      custoAcoes += 3;
      logger?.log(`[${e.nome}] usa A Batalha Que Você Escolheu: +1 Ação aos aliados por 3 turnos.`);
    }
    if (e.batalhaEscolhidaTurnos > 0) {
      for (const aliado of melhoresAliados) concederAcao(aliado, e);
      e.batalhaEscolhidaTurnos--;
    }
    if (tatico.avante && !e.usouAvante && e.pp >= 3 && custoAcoes < 3) {
      e.usouAvante = true;
      e.pp -= 3;
      custoAcoes++;
      for (const aliado of melhoresAliados) concederAcao(aliado, e);
      logger?.log(`[${e.nome}] usa Avante: todos os aliados recebem 1 Ação, respeitando o teto de duas concedidas.`);
    }
    if (tatico.antecipacao && !e.usouAntecipacao && e.pp >= 1 && melhoresAliados[0] && consumirReacao(e)) {
      e.usouAntecipacao = true;
      e.pp--;
      concederAcao(melhoresAliados[0], e);
      logger?.log(`[${e.nome}] prepara Antecipação para ${melhoresAliados[0].nome}: 1 Ação concedida.`);
    }
    // Comando (Rei): troca uma Ação própria por uma do melhor atacante.
    if (tatico.rank >= 5 && melhoresAliados[0] && custoAcoes < 3) {
      custoAcoes++;
      concederAcao(melhoresAliados[0], e);
      logger?.log(`[${e.nome}] usa Comando e concede 1 Ação a ${melhoresAliados[0].nome}.`);
    }
    if (tatico.vozDeSargento && custoAcoes < 3) {
      const caido = aliados.find((a) => a !== e && a.vivo && a.caido);
      if (caido) {
        caido.caido = false;
        custoAcoes++;
        logger?.log(`[${e.nome}] usa Voz de Sargento: ${caido.nome} remove Caído.`);
      }
    }
  }
  return Math.min(3, custoAcoes);
}

/** Um turno inteiro de um personagem: Ações gastas na melhor coisa disponível. */
export function turnoPersonagem(
  e: EstadoPersonagem, inimigos: Alvo[], rng: Rng,
  aliados: EstadoPersonagem[] = [], logger?: RegistroCombate,
): void {
  e.jaAgiu = true;
  e.usouFurtivo = false;
  e.usadasNoTurno.clear();
  try { executarTurnoPersonagem(e, inimigos, rng, aliados, logger); }
  finally { e.surpreso = false; }
}

function cobrarConsequenciaDaAcao(e: EstadoPersonagem, a: Acao, logger?: RegistroCombate): void {
  if (!a.exaustaoDepois) return;
  e.exaustao = Math.min(6, e.exaustao + a.exaustaoDepois);
  logger?.log(`[${e.nome}] recebe ${a.exaustaoDepois} nível de Exaustão depois de ${a.nome} (nível ${e.exaustao}).`);
}

function executarTurnoPersonagem(
  e: EstadoPersonagem,
  inimigos: Alvo[],
  rng: Rng,
  /**
   * O grupo de quem age, pra que ele possa CURAR — 0.1.37.
   *
   * Opcional porque nem todo chamador tem grupo (o comparador de builds põe uma
   * ficha sozinha contra um boneco). Sem ele o turno é o de sempre, só dano — e
   * é o que garante que esta mudança não altere um número de quem não passa
   * aliado. Quem passa, passa o time INTEIRO incluindo `e`: o curandeiro se
   * cura, e o livro não diz o contrário.
   */
  aliados: EstadoPersonagem[] = [], logger?: RegistroCombate
): void {
  /*
   * O turno de quem está no chão é o teste do Fio da Vida, e nada mais.
   *
   * Vem antes do `return`: um personagem inconsciente não age, mas o turno DELE
   * continua acontecendo — é nele que ele rola contra a morte.
   */
  /*
   * A janela da Ferida Fresca fecha no início do turno do próprio alvo: é "o
   * dano sofrido desde o início do último turno do alvo" (Cap. 4, §7). Vem antes
   * do teste do Fio da Vida porque o turno do caído também é turno dele, e a
   * ferida que o derrubou deixa de ser fresca aqui, como a de qualquer um.
   */
  if (e.feridaFresca > 0) e.feridaFresca--;
  if (e.inconsciente) {
    testeDoFioDaVida(e, rng);
    return;
  }
  if (!e.vivo) return;

  const concedidas = Math.min(2, e.acoesConcedidas);
  const concessor = e.concessorDeAcoes;
  e.acoesConcedidas = 0;
  e.concessorDeAcoes = undefined;
  const proprias = e.surpreso ? 1 : Math.min(4, e.ficha.acoesPorTurno ?? 3);
  const danoAntesDoTurno = e.danoCausado;
  let acoes = proprias + concedidas;
  acoes = Math.max(0, acoes - prepararSuporteDoTurno(e, inimigos, aliados, rng, logger));
  let guarda = 0;
  let tentouEsconder = false;
  if (e.conjurando) e.conjurando.acoesNesteTurno = 0;

  while (acoes > 0 && guarda++ < 10) {
    const vivos = inimigos.filter((x) => x.vivo);
    if (vivos.length === 0) break;

    /*
     * CONJURANDO: o cântico consome o turno inteiro e não sobra nada.
     *
     * Cap. 2, §6: *"você não pode fazer mais nada. Mover-se metade do
     * Deslocamento é permitido; atacar, usar item, conjurar outra magia ou usar
     * Reação, não."* Então enquanto há cântico em pé, cada Ação do turno vai
     * pra ele — inclusive as que sobrariam depois de a magia sair, porque
     * lançar uma segunda magia no mesmo turno é o que o livro proíbe.
     */
    if (e.conjurando) {
      const c = e.conjurando;
      const falta = c.acao.acoes - c.acoesGastas;
      const gasta = Math.min(falta, acoes);
      c.acoesGastas += gasta;
      c.acoesNesteTurno += gasta;
      acoes -= gasta;
      logger?.log(`[${e.nome}] continua o cântico de ${c.acao.nome}: ${c.acoesGastas}/${c.acao.acoes} Ações.`);
      if (c.acoesGastas < c.acao.acoes) {
        break; // segue no próximo turno
      }
      // O cântico completou: a magia sai agora.
      e.conjurando = null;
      logger?.log(`[${e.nome}] conclui o cântico de ${c.acao.nome}.`);
      const alvos = c.acao.area ? alvosNaArea(vivos, c.acao.areaDescricao) : [vivos[0]];
      for (const alvo of alvos) {
        // `c.acao.dano` é a fórmula inteira ("6d10 + BC (ígneo)") e serve de
        // tipo: Resistência e Imunidade procuram a palavra dentro dela. É o
        // mesmo lugar de onde a detecção de fogo do motor já lia.
        e.danoCausado += executarAtaquePersonagem(e, c.acao, alvo, rng, logger);
      }
      cobrarConsequenciaDaAcao(e, c.acao, logger);
      break;
    }

    /*
     * Suporte ANTES de dano, quando há suporte a fazer.
     *
     * A ordem é uma decisão, não um detalhe: quem cura depois de bater cura um
     * turno mais tarde, e um turno mais tarde é exatamente o que faz a Ferida
     * Fresca fechar e a magia valer metade. A escola inteira de Cura é sobre
     * essa janela — a Prontidão, que o livro chama de "a magia que define a
     * escola", é uma Reação justamente pra não perdê-la.
     */
    const suporte = escolherSuporte(e, acoes, aliados);
    if (suporte) {
      acoes -= suporte.acao.acoes;
      e.pm -= suporte.acao.pm;
      e.pt -= suporte.acao.pt;
      /*
       * Cura em área pega o grupo, do mesmo jeito que dano em área pega todos
       * os inimigos de pé — a Bênção Coletiva diz "todos os aliados na área
       * recuperam PV", e curar um só dela faria a magia de 4 PM valer menos que
       * a de 2. Sem mapa, "na área" é o grupo.
       *
       * A fórmula é rolada UMA vez e aplicada a cada um: é uma conjuração só.
       * Quem está no máximo recebe 0 e não desperdiça nada além da magia, que é
       * o que aconteceria na mesa.
       */
      // Dados e BC separados: a Ferida Fresca dobra só os dados (ver `curar`).
      const dados = rolarDados(suporte.acao.formulaSuporte, rng);
      const alvos = suporte.acao.area ? aliados.filter((x) => x.vivo) : [suporte.alvo];
      let amount = 0;
      for (const alvo of alvos) {
        if (suporte.acao.tipo === "cura") {
           const c = curar(alvo, dados, alvo.ficha.pvMax, suporte.acao.sempreFresca, e.ficha.bc);
           e.pvCurado += c; amount += c;
        } else {
           const c = darPvTemp(alvo, dados + e.ficha.bc);
           amount += c;
        }
      }
      if (logger) {
        logger.log(`[${e.nome}] usa ${suporte.acao.nome} em ${alvos.length > 1 ? "todos os aliados" : suporte.alvo.nome} (${suporte.acao.tipo}: ${amount})`);
      }
      continue;
    }

    // O alvo da vez entra na escolha: sem ele a IA não sabe se a técnica de
    // ataque que ela prefere tem chance de acertar este inimigo.
    // O cântico dividido só começa com o turno inteiro na mão — ver `escolherAcao`.
    if (e.emPostura) {
      if (e.ficha.temMareRetorno && e.pt >= 3 && e.ficha.rankAgua < 6) {
        e.pt -= 3;
        e.fluxoRestante = e.ficha.rankAgua;
        logger?.log(`[${e.nome}] paga 3 PT e 1 Ação por Maré de Retorno: até ${e.ficha.rankAgua} Fluxos nesta rodada.`);
      }
      logger?.log(`[${e.nome}] mantém a Postura de Água e aguarda ataques.`);
      break;
    }
    if (e.ficha.temPassoVazio && e.usouPrimeiroGolpe && !e.usouPassoVazio && acoes >= 2) {
      acoes--;
      e.usouPassoVazio = true;
      e.usouPrimeiroGolpe = false;
      e.escondido = true;
      logger?.log(`[${e.nome}] gasta 1 Ação em Passo Vazio e reaparece na ação seguinte, reativando Primeiro Golpe.`);
    }
    if (e.ficha.rankLadino && e.podeEsconderEmCombate && !e.escondido &&
        !tentouEsconder && acoes >= 2 && vivos[0].jaAgiu) {
      tentouEsconder = true;
      acoes--;
      const rolagem = d20(rng);
      const defesa = Math.max(...vivos.map((x) => x.percepcaoPassiva ?? 10));
      e.escondido = rolagem + e.ficha.bonusFurtividade >= defesa;
      logger?.log(`[${e.nome}] gasta 1 Ação para Se Esconder: ${rolagem} + ${e.ficha.bonusFurtividade} contra Percepção ${defesa} — ${e.escondido ? "conseguiu" : "falhou"}.`);
      continue;
    }
    const a = escolherAcao(e, acoes, vivos[0], acoes === proprias, vivos);
    const alcance = ehGolpeBasico(a) ? (e.alcanceArma ?? 1.5) : alcanceEmMetros(a.alcance);
    const distancia = distanciaEntre(e, vivos[0]);
    if (distancia !== undefined && distancia > alcance) {
      if (!aproximar(e, vivos[0], alcance, e.ficha.deslocamento)) {
        logger?.log(`[${e.nome}] não consegue alcançar o alvo.`);
        break;
      }
      acoes--;
      logger?.log(`[${e.nome}] gasta 1 Ação para se aproximar (${distanciaEntre(e, vivos[0])} m do alvo).`);
      continue;
    }
    e.pm -= a.pm;
    e.pt -= a.pt;
    if (a.limite === "turno") e.usadasNoTurno.add(a.nome);
    if (a.limite === "combate") e.usadasNoCombate.add(a.nome);

    /*
     * A magia que não cabe no turno vira cântico: o PM é investido AGORA (é o
     * que o livro chama de "o PM investido", e é o que se perde pela metade
     * quando alguém interrompe), e as Ações começam a ser gastas.
     */
    if (a.acoes > acoes) {
      e.conjurando = { acao: a, acoesGastas: acoes, acoesNesteTurno: acoes };
      logger?.log(`[${e.nome}] inicia o cântico de ${a.nome}: ${acoes}/${a.acoes} Ações; chance estimada de concluir ${Math.round(chanceDeConcluirCantico(e, a, vivos) * 100)}%.`);
      acoes = 0;
      break;
    }

    acoes -= a.acoes;
    const alvos = a.area ? alvosNaArea(vivos, a.areaDescricao) : [vivos[0]];
    for (const alvo of alvos) {
      for (let golpe = 0; golpe < (e.ficha.ataquesPorAcao ?? 1) && alvo.vivo; golpe++) {
        const dmg = executarAtaquePersonagem(e, a, alvo, rng, logger);
        e.danoCausado += dmg;
      }
    }
    cobrarConsequenciaDaAcao(e, a, logger);
  }

  // Fim do turno: quem não dedicou nenhuma Ação ao cântico o perde (Perda de Foco).
  perdaDeFoco(e);
  if (concessor && concedidas > 0 && e.danoCausado > danoAntesDoTurno) {
    const assistido = (e.danoCausado - danoAntesDoTurno) * concedidas / Math.max(1, proprias + concedidas);
    concessor.danoCausado += assistido;
  }
}

/**
 * Aplica os efeitos de dano por turno e gasta um turno de cada um — 0.1.57.
 *
 * Roda junto com `tickChamas`, no início do turno de quem sofre, e pelo mesmo
 * motivo: o dano de área sustentada acontece porque o alvo COMEÇOU o turno
 * dentro dela. Devolve true se sobreviveu.
 *
 * Sem isto, a IA escolheria magia sustentada pelo dano esperado que
 * `danoEsperado` promete e o motor pagaria uma fração dele — a decisão certa
 * sobre um combate que não acontece, que é o pior dos dois mundos.
 */
export function tickSustentado(alvo: Alvo): boolean {
  if (!alvo.vivo || alvo.sustentados.length === 0) return alvo.vivo;
  for (const efeito of alvo.sustentados) {
    aplicarDano(alvo, efeito.media);
    efeito.turnos -= 1;
  }
  alvo.sustentados = alvo.sustentados.filter((x) => x.turnos > 0);
  feridaDoInicioDoTurno(alvo);
  return alvo.vivo;
}

/** Queima no início do turno de quem está Em Chamas. Devolve true se sobreviveu. */
export function tickChamas(alvo: Alvo, rng: Rng): boolean {
  if (!alvo.vivo || alvo.emChamas === 0) return alvo.vivo;
  // Em Chamas é dano ÍGNEO: um elemental de fogo imune a ígneo não queima, e
  // era esse o caso mais óbvio que o motor errava em silêncio.
  aplicarDano(alvo, dado(rng, alvo.emChamas), 2, undefined, false, "ígneo");
  feridaDoInicioDoTurno(alvo);
  return alvo.vivo;
}

/**
 * O dano do início do turno chega DEPOIS de o turno começar, então ele ainda é
 * fresco durante o turno inteiro e até o início do próximo. Os tiques rodam
 * antes de `turnoPersonagem`, que fecha a janela de 1 em 1; gravar 2 aqui faz
 * a ferida sobreviver a esse fechamento.
 *
 * Se o tique derrubou o alvo, o laço pula o `turnoPersonagem` desta rodada e
 * ninguém fecha a janela agora: aí grava 1, pra ela fechar no início do
 * próximo turno dele, e não durar um turno a mais.
 */
function feridaDoInicioDoTurno(alvo: Alvo): void {
  if (alvo.feridaFresca > 0) alvo.feridaFresca = alvo.vivo ? 2 : 1;
}

// ---------------------------------------------------------------------------
// Reação de chefe (fora do turno normal)
// ---------------------------------------------------------------------------
/*
 * A ÚNICA economia de ação de chefe que existia até aqui era a rodada extra
 * (`rodadasDoChefe`, Apêndice G) — mais uma vez inteira no MESMO lugar da
 * ordem de iniciativa. O que faltava era o outro tipo, o que a maioria dos
 * livros de chefe também dá: uma Reação ou ação lendária que dispara FORA do
 * turno dele, entre os turnos dos outros.
 *
 * Reescrever a ordem de iniciativa pra caber isso — turnos intercalados,
 * prioridade, o que acontece se dois chefes reagem ao mesmo evento — é o motor
 * de iniciativa inteiro, e não é isso que este gancho promete. O que ele dá é
 * o mínimo que já habilita a regra: um interruptor por combatente
 * (`Alvo.reacaoDisponivel`), religado uma vez por rodada da mesa e gasto no
 * momento que quem monta o loop escolher (em `encounterSim.ts`, logo depois do
 * turno de um herói). Ele não sabe o que é "chefe" nem o que a reação FAZ —
 * isso é decisão de quem chama, exatamente como os outros ganchos deste
 * arquivo (`tickChamas`, `resolver`) não decidem quando são chamados.
 */

/** Rearma a Reação/ação lendária no início de uma rodada da mesa, se elegível. */
export function aoIniciarRodada(alvo: Alvo, elegivel: boolean): void {
  if (elegivel) {
    alvo.reacaoDisponivel = !alvo.surpreso;
    if ("ficha" in alvo) {
      const e = alvo as EstadoPersonagem;
      e.fluxoRestante = e.emPostura && e.ficha.rankAgua >= 6 ? Infinity : e.ficha.fluxoUsosMax;
      e.fluxosNesteTurno.clear();
      if (e.emPostura) {
        e.reacoesExtra = e.ficha.posturaReacoesExtra + e.ficha.reacaoExtraFixa;
      } else {
        e.reacoesExtra = e.ficha.reacaoExtraFixa;
      }
    }
  }
}

/**
 * Gasta a Reação/ação lendária, se houver uma disponível. Devolve true quando
 * consumiu — o que ela FAZ é responsabilidade de quem chamou.
 */
export function consumirReacao(alvo: Alvo): boolean {
  if (!alvo.vivo || alvo.surpreso) return false;
  if (!alvo.reacaoDisponivel) {
    if ("ficha" in alvo && (alvo as EstadoPersonagem).reacoesExtra > 0) {
      (alvo as EstadoPersonagem).reacoesExtra--;
      return true;
    }
    return false;
  }
  alvo.reacaoDisponivel = false;
  return true;
}

/**
 * As simplificações do motor, em uma lista.
 *
 * Elas moram aqui — e não num comentário — porque a tela /encontros as imprime
 * pro Mestre junto do veredito. Um número de balanceamento sem a lista do que
 * ele ignora é pior que nenhum número: parece mais confiável do que é.
 */
export const SIMPLIFICACOES = [
  "Condições modeladas: Molhado (frio dobra), Congelado (Água prepara, cobra com Quebra de Gelo e consome), Dose (até 3, Envenenado na segunda, Colapso na terceira e Inversão por Dose), Em Chamas, Quebrantado (−1 de CA e −1 de dano por acúmulo, até o Bônus de Rank de quem aplicou) e — quando a ação os declara — Preso, Caído e Envenenado. Restrições de carta por faixa de PV e estado estruturado do alvo bloqueiam a ação; 'Requer alvo Agarrado' custa +1 Ação e presume que o agarrão funcionou. Exaustão recebida depois de uma técnica acumula e, no nível 3, impõe Desvantagem aos ataques. Atolado, Desequilibrado, Marcado e Soterrado ficam de fora: são sobre movimento, alcance e posição, e este motor não tem mapa.",
  "Cura e PV Temporários ENTRAM desde a 0.1.37, com a dobra da Ferida Fresca: quem cura devolve PV de verdade, e a coluna \"PV devolvidos\" mostra quanto. A IA cura quem estiver na metade ou abaixo, começando pelo pior, e oferece casca a quem ainda não tem — um limiar declarado, não uma tática: curandeiro que espera demais perde gente e o que cura cedo demais desperdiça.",
  "Dano por turno sustentado ENTRA desde a 0.1.57, por TRÊS turnos — o do lançamento mais dois. Três é escolha declarada, não do livro: a Tempestade Cortante dura \"1 minuto\" (dez turnos), e contar dez daria a ela um dano que nenhuma mesa vê, porque o alvo sai da área (não há mapa aqui) e o combate acaba antes. São sete magias, não três: Tomar o Ar, Tempestade Cortante e Vazio (Vento), Rio de Magma (Terra), Estrangular (Armas Pesadas), Prisão de Purgatório e Trono de Chamas (Punho do Fogo). Errar pra menos é o lado certo de errar.",
  "As duas Reações de Aguentar (Escudos) REDUZEM o dano de um golpe interceptado, e o motor não tem redução — ele as trata como PV Temporários, que é o mais próximo que sabe fazer. A diferença importa: casca some depois de gasta, redução vale em todo golpe que ela alcança. Até a 0.1.47 elas eram lidas como DANO CAUSADO, e davam a Cavalaria e Escudos uma técnica de 16,8 por Ação que ela não tem.",
  "O que de suporte segue de fora: Salvações e as paredes, selos e fórmulas armadas da Magia Teórica — dependem de posição e suporte, e este motor não tem mapa. A exceção modelada é Parede de Emergência: a carta pronta intercepta até 15 de um ataque físico como Reação. Julgamento e Luz Absoluta entram como as magias de DANO que são; a cura secundária que as duas descrevem na prosa não é contada.",
  "A IA escolhe sempre a ação de maior dano ESPERADO por Ação contra o alvo da vez — com Dados de Arma, bônus fixo e chance de errar na conta (0.1.35). O que ela continua não fazendo: recuar, focar fogo, guardar recurso pro turno seguinte, e dar qualquer valor a condição. É por isso que Quebrantado, embora modelado, quase não aparece nestes números: as técnicas que empilham acúmulos raramente são as de maior dano, e a IA nunca as escolhe por causa do acúmulo. Na mesa, um jogador escolhe.",
  "O Fio da Vida (Cap. 4, §7) entra desde a 0.1.38: a 0 PV o personagem CAI Inconsciente, rola 1d20 + Vigor + metade do maior Bônus de Rank (com a Escala do Vigor) contra CD 8 + o Bônus de Rank de quem o derrubou, junta Marcas da Morte e morre de vez na terceira — e qualquer cura de aliado o levanta com todas as Marcas removidas. Estabilizado para de rolar, como o livro manda; acordar sozinho leva 1d4 horas e nenhum combate daqui dura isso. Sofrer dano a 0 PV dá 1 Marca (2 no crítico) e tira o Estabilizado; aqui só a ação em ÁREA de uma criatura alcança quem está no chão, porque a IA não gasta golpe único em quem já não luta. O que fica de fora: a IA não gasta Ação estabilizando ninguém com Medicina (1 Ação, CD 10, Vantagem com Kit de Primeiros Socorros), o golpe corpo a corpo contra o caído não vira crítico automático (sem mapa, não há \"adjacente\"), e a Exaustão de quem acorda não é modelada. Criatura não tem Fio da Vida: a 0 PV ela morre.",
  "A Ferida Fresca é o dano que o alvo sofreu desde o fim do último turno de quem cura; o motor a conta como uma rodada a partir do golpe (a mesma duração, em média), e contra ela dobram os DADOS da cura, com o BC somado uma vez. Qualquer dano nessa janela abre a Ferida, mesmo o que os PV Temporários absorveram inteiro, e aí os dados da cura inteira dobram: o motor não mede quanto do dano foi fresco nem limita a cura a ele. Até a revisão do livro o motor dobrava dados e BC juntos e contava a janela por dois turnos do alvo.",
  "Testes de resistência: 1d20 + atributo + metade do maior Bônus de Rank. A criatura resiste com o Bônus de Resistência do Apêndice G (metade do Bônus de Ataque dela). O personagem resiste à ação de uma criatura com o atributo do MEIO entre Vigor, Agilidade e Espírito, porque a ação montada pelo Mestre não diz qual atributo cobra: nem o melhor, nem o pior. Contra um boneco sem ficha, o bônus de quem resiste continua sendo metade do BC de quem ataca.",
  "A CD que a criatura impõe no Fio da Vida e na Concentração usa o Bônus de Rank do patamar dela (1 no 1º patamar, 6 no 6º). O golpe comum usa a arma escolhida no encontro ou a única equipada, os degraus da ficha e o atributo e Rank do contexto de arma. Sem escolha válida, usa uma referência d6 com aviso. As demais técnicas ainda compartilham o BC da árvore inicial; essa limitação não foi removida nesta etapa.",
  "Antes disso o motor matava a 0 PV, e isso não era só infidelidade: era a razão de TODO combate contra chefe dar 0% ou 100%. Quem caía sumia da luta pra sempre, o dano do grupo despencava, a luta se alongava e caía o próximo — realimentação positiva não produz meio-termo. Com o Fio da Vida e um curandeiro, o 4º patamar virou 55% de vitória contra 45% de dizimação.",
  "Conjuração Contínua e Dividida (Cap. 4, §3) entra na 0.1.40: magia que custa mais Ações do que o turno tem é recitada ao longo de turnos, com Perda de Foco (1 Ação por turno, no mínimo) e teste de Concentração (1d20 + Espírito + metade do maior Bônus de Rank) contra CD 10 + o Bônus de Rank de quem acertou; na falha, o cântico se perde junto com metade do PM investido, arredondado pra baixo. Cair Inconsciente interrompe sem teste, com o mesmo preço. Sem ela, as magias de 4 Ações (Rei e Imperador; o teto é 4) eram inalcançáveis — Sol Menor, Zero Absoluto, Era Glacial, Vazio, as maiores magias do jogo.",
  "A IA só COMEÇA um cântico longo com o turno inteiro na mão e agora pesa a chance de terminá-lo: Espírito + metade do Rank na Concentração, inimigos vivos, dano esperado até o próximo turno e proporção de PV. Abaixo de 35% ela desiste; acima disso o valor esperado é descontado pelo risco. É heurística declarada, não regra do livro. Início, continuação, conclusão e perda aparecem no log. Cura e escudo seguem sem cântico dividido — um curandeiro que passa dois turnos recitando enquanto o grupo cai é jogada ruim, não simplificação.",
  "A criatura bate igual todo turno, sem táticas próprias, e o que a torna perigosa no Apêndice G além das condições acima (teia que não causa dano, voo, emboscada) não é simulado.",
  "Reação de chefe: 1 ação avulsa por rodada da mesa, fora do turno normal dele — não a Reação nomeada de nenhuma árvore específica, só a economia de ação extra que os livros de chefe costumam dar.",
  "Os tetos do Cap. 4, §5 entram no que o motor alcança: Vantagem continua binária; bônus numérico vindo de aliado para em +6; um turno aceita no máximo 4 Ações próprias e 2 concedidas. Duas Salvações por Combate ainda não é uma contagem geral: Sem Baixas e o Fio da Vida entram, mas as demais habilidades de impedir morte ainda não compartilham um contador único.",
  "Navegação e Liderança entra pelo núcleo de combate: Ordem de Tiro/Apontado (inclusive acúmulo), Primeiro a Ver, Voz que Corrige, Antecipação, Voz de Sargento, Foco de Fogo, Prever o Golpe, Comando, Avante, Sem Baixas e A Batalha Que Você Escolheu. Ponto de Estrangulamento, Manobra, Doutrina, Emboscada Planejada e A Guerra Antes da Guerra continuam fora porque dependem de mapa, preparação ou composição estratégica do encontro. A IA concede Ações ao aliado de maior golpe médio e trata o encontro com mais de um inimigo como organizado para A Batalha Que Você Escolheu.",
  "Bardo entra com Dissonância, Inspiração (entregue ao melhor atacante e gasta depois de uma falha que o dado ainda pode salvar), Canção de Guerra, A Canção Não Para e Insulto Afiado. Marcha e Réquiem não alteram os encontros atuais (viagem, medo e emoção ainda não aparecem nos blocos); Insulto que Fica, Diplomata de Guerra, Elegia, Coro e O Fim da Canção dependem de escolhas, emoção ou alvo narrativo que o cenário não declara, por isso seguem fora em vez de presumir que todo monstro sente e raciocina.",
  "Pactos comprados de Espíritos e Feras são preparados automaticamente quando o cenário não faz uma seleção manual, até o limite do Rank e do PM. Uma seleção explícita — inclusive vazia — continua prevalecendo. Efeitos especiais dos Pactos além de PV, CA, deslocamento, resistências, quantidade e golpes continuam resumidos pelos perfis de combate declarados.",
  "Proficiência de arma é conferida no golpe comum e nas técnicas com Dados de Arma: falta de proficiência impõe Desvantagem no acerto, sem reduzir o dano. O recibo mostra os dois d20. A arma de referência não pressupõe um grupo real de arma. O tipo físico de dano da arma ainda não vem do inventário, então resistências específicas a cortante, perfurante ou contundente não são inferidas nesse golpe.",
  "A ficha do Ladino ativa Dano Furtivo em aberturas válidas. Primeiro Golpe soma o ataque de arma, seu dano triplicado e a parcela furtiva normal quando elegível. Antes da iniciativa o Ladino tenta Esconder-se contra a Percepção das criaturas; Passo Vazio reabre o Primeiro Golpe uma vez. Com cobertura, pode gastar 1 Ação para tentar Esconder-se novamente. Segredos personalizados e demais reações não descritas no recibo precisam de arbitragem.",
  "Cenário opcional: distância em uma linha, alcance, terreno difícil, Escondido e Surpreso. Sem distância declarada, mantém o combate abstrato. Sem mapa, áreas usam a mesma régua nos dois lados: até 3 m pega 2 alvos, 6 m pega 3, 9 m pega 4 e acima disso pega até 5; 'atinge até N' prevalece. Cobertura e geometria fina não são calculadas. Criaturas sem ações declaradas usam orçamento abstrato e não acionam Fluxo.",
];
