/**
 * O motor de simulação de combate — compartilhado pelo playtest de linha de
 * comando (`scripts/simular-combate.mts`) e pela tela /encontros.
 *
 * Ele nasceu dentro do script, e ficar lá era um problema em potencial: a tela
 * que diz ao Mestre "este encontro é justo" tem que responder pelos MESMOS
 * números que o playtest usa pra calibrar o livro. Duas cópias da mesma
 * simulação divergem em silêncio, e a que diverge é sempre a que ninguém roda.
 *
 * O que ele NÃO é: um motor de regras completo. As simplificações estão
 * declaradas em SIMPLIFICACOES, no fim do arquivo, e toda leitura de um
 * resultado tem que passar por elas — inclusive na interface do site, que as
 * imprime na tela em vez de escondê-las.
 */
import { getTreeById } from "@/data/trees/index";
import {
  getArmorClass,
  getAttackBonus,
  getHighestUnlockedRank,
  getMaxHp,
  getMaxMp,
  getPtPool,
} from "@/store/selectors";
import {
  AbilityDef,
  attributeKeyFromLabel,
  CharacterData,
  RANK_BONUS,
  RankName,
  RANKS,
} from "@/lib/types";

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
export type TipoDeAcao = "dano" | "cura" | "escudo";

/** Uma coisa que um combatente pode fazer no turno dele. */
export interface Acao {
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
  /** true = rola contra a CA; false = o alvo faz um teste de resistência. */
  ataque: boolean;
  frio: boolean;
  fogo: boolean;
  aplicaMolhado: boolean;
  /**
   * Acúmulos de Quebrantado que a ação aplica (0.1.35). Zero = não aplica.
   *
   * `"maximo"` é o teto do Cap. 4 — "até o máximo do Bônus de Rank de quem
   * aplicou" — e existe porque três técnicas de Armas Pesadas dizem exatamente
   * isso em vez de dar um número: "acúmulos iguais ao seu Bônus de Rank" e
   * "fica Quebrantado ao máximo".
   */
  aplicaQuebrantado: number | "maximo";
}

/**
 * O que uma ficha traz pro combate. Derivado UMA vez por ficha e reutilizado em
 * todas as batalhas — `montarFicha` chama meia dúzia de seletores e faz regex em
 * cada magia comprada, e refazer isso a cada uma das centenas de batalhas era o
 * custo dominante da simulação.
 */
export interface FichaCombate {
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
  /**
   * O Bônus de Rank SOZINHO, sem o atributo em cima (0.1.35).
   *
   * `bc` já traz os dois somados, e pra quase tudo isso basta. Quebrantado é a
   * exceção: o teto do Cap. 4 é "até o máximo do Bônus de Rank de quem aplicou",
   * e de um `bc` somado não dá pra separar de volta a parcela que interessa.
   */
  bonusDeRank: number;
  iniciativa: number;
  /** Vigor — o atributo do teste do Fio da Vida (Cap. 4, §7). */
  vigor: number;
  /** Espírito — o atributo do teste de Concentração da conjuração (Cap. 2, §6). */
  espirito: number;
  acoes: Acao[];
  ataqueBasico: Acao;
}

/** Qualquer coisa que pode levar dano. Personagens e criaturas cabem aqui. */
export interface Alvo {
  nome: string;
  pv: number;
  ca: number;
  vivo: boolean;
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
   * Ferida Fresca (Cap. 4) — a mecânica que dá identidade à Magia de Cura:
   * *"toda a Magia de Cura cura em dobro contra uma Ferida Fresca. Ferida Fresca
   * é o dano sofrido no turno atual ou no turno imediatamente anterior"*.
   *
   * É por isso que o curandeiro age cedo e não depois, e sem ela a escola vira
   * um dado de cura genérico. Aqui o contador vale 2 quando o alvo leva dano e
   * cai de 1 no início de cada turno DELE (`turnoPersonagem`) — a janela de dois
   * turnos próprios que a regra descreve, na granularidade que este motor tem.
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
  /** Passou no teste: para de rolar, mas segue desacordado até alguém curar. */
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
    nome: p.nome,
    pv: p.pv,
    ca: p.ca,
    vivo: p.vivo ?? true,
    molhado: p.molhado ?? false,
    emChamas: p.emChamas ?? 0,
    quebrantado: p.quebrantado ?? 0,
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
  };
}

/** Uma `Acao` completa a partir do que a distingue. Mesmo motivo do `novoAlvo`. */
export function novaAcao(p: Partial<Acao> & { nome: string }): Acao {
  return {
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
    ataque: p.ataque ?? false,
    frio: p.frio ?? false,
    fogo: p.fogo ?? false,
    aplicaMolhado: p.aplicaMolhado ?? false,
    aplicaQuebrantado: p.aplicaQuebrantado ?? 0,
  };
}

/** O que muda numa batalha, do lado do personagem. */
export interface EstadoPersonagem extends Alvo {
  ficha: FichaCombate;
  pm: number;
  pt: number;
  /**
   * O cântico em andamento — Cap. 2, §6 e Cap. 4, §3, na 0.1.40.
   *
   * *"Magias poderosas exigem mais Ações do que você tem num turno — o sistema
   * permite dividir o cântico."* Sem isto, as VINTE ações de dano que custam 4,
   * 5 ou 6 Ações eram inalcançáveis pelo motor: `escolherAcao` filtrava por
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

const ESCADA_DADOS = [4, 6, 8, 10, 12, 16, 20, 24];

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
    if (!a?.damage?.normal) continue;
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
    const ehSuporte = /de pv|pv temporários|recupera|cura /.test(txt);
    const tipo: TipoDeAcao = !ehSuporte ? "dano" : /pv temporários/.test(txt) ? "escudo" : "cura";
    out.push({
      nome: a.name,
      acoes: a.reaction ? 1 : Math.max(1, a.actions.normal),
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
      dano: ehSuporte ? "" : casoBase(a.damage.normal),
      formulaSuporte: ehSuporte ? casoBase(a.damage.normal) : "",
      sempreFresca: /sempre como ferida fresca/i.test(txt),
      // "+1 Dado de Arma", "+2 Dados de Arma", "Dado de arma rolado quatro vezes":
      // QUINZE técnicas do livro multiplicam o dado da arma em vez de trazer
      // dados próprios — medido em 2026-09-10, espalhadas por cinco árvores.
      // Sem isto o Deus da Espada — que o livro chama de maior dano do jogo —
      // aparecia em quarto lugar, porque CINCO das seis ações de dano dele
      // somam zero na conta.
      dadosDeArma: (() => {
        const m = a.damage.normal.match(/\+\s*(\d+)\s+Dados? de Arma/i);
        if (m) return Number(m[1]);
        const v = a.damage.normal.match(/rolado (duas|três|quatro|cinco) vezes/i);
        if (v) return { duas: 2, três: 3, quatro: 4, cinco: 5 }[v[1].toLowerCase()] ?? 0;
        return 0;
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
      ataque: /ataque mágico|ataque à distância|se acertar/i.test(`${a.damage.normal} ${a.effect} ${a.range}`),
      frio: /frio|gelo/.test(txt),
      fogo: /ígneo|chamas|fogo/.test(txt),
      aplicaMolhado: /molhad/.test(txt),
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
  }
  return out;
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
export function montarFicha(c: CharacterData, rotulo = ""): FichaCombate {
  const tree = getTreeById(c.startingTreeId);
  const attr = attributeKeyFromLabel(tree?.keyAttributeLabel) ?? "forca";
  const bc = c.startingTreeId ? getAttackBonus(c, c.startingTreeId, attr) : 0;

  // Degraus de Dado de Arma: soma só dos patamares de árvores do CORPO.
  const degraus = c.unlockedRanks.reduce((n, u) => {
    const t = getTreeById(u.treeId);
    if (t?.category !== "corpo") return n;
    return n + (t.ranks.find((r) => r.rank === u.rank)?.weaponDieSteps ?? 0);
  }, 0);

  return {
    id: c.id,
    nome: c.name || "Sem nome",
    rotulo,
    pvMax: getMaxHp(c),
    ca: getArmorClass(c),
    pmMax: getMaxMp(c),
    ptMax: getPtPool(c),
    bc,
    bcSemRank: Math.max(0, ...Object.values(c.attributeBase)),
    // O Bônus de Rank da árvore inicial — a mesma de onde `bc` sai, pra que as
    // duas contas falem do mesmo personagem.
    bonusDeRank: (() => {
      const rank = c.startingTreeId ? getHighestUnlockedRank(c, c.startingTreeId) : undefined;
      return rank ? RANK_BONUS[rank] : 0;
    })(),
    iniciativa: c.attributeBase.agilidade,
    vigor: c.attributeBase.vigor,
    espirito: c.attributeBase.espirito,
    acoes: acoesDe(c),
    // Golpe comum. A Escada de Dados é EXCLUSIVA da Árvore do Corpo (Cap. 3):
    // um mago de Água Avançado não escala dado nenhum — ele empunha uma arma
    // simples (d6) e soma o atributo, sem Bônus de Rank, porque a técnica não
    // veio de árvore nenhuma. A primeira versão deste motor dava a escada a
    // todo mundo e fazia a curandeira bater 35 por turno de espada.
    ataqueBasico: novaAcao({
      nome: degraus > 0 ? "golpe comum" : "arma simples",
      dano: `1d${ESCADA_DADOS[Math.min(ESCADA_DADOS.length - 1, 1 + degraus)]}`,
      ataque: true,
    }),
  };
}

/** Estado zerado pra uma batalha nova, a partir da ficha já derivada. */
export function novoEstado(ficha: FichaCombate): EstadoPersonagem {
  return {
    ...novoAlvo({ nome: ficha.nome, pv: ficha.pvMax, ca: ficha.ca, fioDaVida: true }),
    ficha,
    pm: ficha.pmMax,
    pt: ficha.ptMax,
    pvCurado: 0,
    conjurando: null,
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
export function danoEsperado(e: EstadoPersonagem, a: Acao, alvo: Alvo | null): number {
  const bonus = a.nome === "arma simples" ? e.ficha.bcSemRank : e.ficha.bc;

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
  const bruto =
    mediaDados(a.dano) + a.dadosDeArma * mediaDados(e.ficha.ataqueBasico.dano) + bonus;

  if (!alvo) return bruto;

  if (a.ataque) {
    // O d20 acerta quando `rolagem + bonus >= ca`; o 20 sempre acerta e dobra
    // os dados, o 1 sempre erra. Daí o piso e o teto de 5%.
    const ca = Math.max(1, alvo.ca - alvo.quebrantado);
    const precisa = ca - bonus;
    const chance = Math.min(0.95, Math.max(0.05, (21 - precisa) / 20));
    // O crítico (5% do d20) soma UMA rolagem a mais dos dados PRÓPRIOS da ação
    // — não do bônus fixo nem dos Dados de Arma. É o que `resolver` faz, e a
    // diferença aparece justamente nas técnicas de Dado de Arma, onde o bruto é
    // várias vezes maior que os dados próprios.
    return chance * bruto + 0.05 * mediaDados(a.dano);
  }

  // Ramo de resistência: metade quando o alvo passa. A CD e o bônus de quem
  // resiste saem os dois do BC do atacante, como em `resolver` — o motor não
  // guarda atributo de alvo.
  const cd = 8 + e.ficha.bc;
  const bonusDoAlvo = Math.ceil(e.ficha.bc / 2);
  const passa = Math.min(0.95, Math.max(0.05, (21 - (cd - bonusDoAlvo)) / 20));
  return bruto * (1 - passa / 2);
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
  permitirCantico = false
): Acao {
  /*
   * O filtro de Ações caiu na 0.1.40 — a Conjuração Dividida (Cap. 4, §3).
   *
   * `a.acoes <= acoesRestantes` excluía toda magia de 4, 5 ou 6 Ações, porque um
   * turno tem 3. Eram VINTE ações de dano invisíveis, e não as menores: Sol
   * Menor, Zero Absoluto, Era Glacial, Vazio. O livro não proíbe conjurá-las —
   * ele manda dividir o cântico entre turnos.
   *
   * `tipo === "dano"` fica: a lista contém cura e escudo desde a 0.1.37, e uma
   * delas escolhida aqui rolaria fórmula de dano vazia e queimaria o turno.
   */
  const viaveis = e.ficha.acoes.filter(
    (a) =>
      a.tipo === "dano" &&
      a.pm <= e.pm &&
      a.pt <= e.pt &&
      (permitirCantico || a.acoes <= acoesRestantes)
  );
  if (viaveis.length === 0) return e.ficha.ataqueBasico;
  return viaveis.reduce((melhor, a) =>
    danoEsperado(e, a, alvo) / a.acoes > danoEsperado(e, melhor, alvo) / melhor.acoes ? a : melhor
  );
}

/** Resolve UMA ação contra UM alvo e devolve o dano causado. */
export function resolver(e: EstadoPersonagem, a: Acao, alvo: Alvo, rng: Rng): number {
  // Quem não tem árvore do Corpo não soma Bônus de Rank num golpe de arma.
  const bonus = a.nome === "arma simples" ? e.ficha.bcSemRank : e.ficha.bc;
  // Preso, Caído e Envenenado (Cap. 4, §7-8): "seus ataques têm Desvantagem" é
  // igual pras três, então o personagem afetado por qualquer uma rola pior — e
  // "ataques contra você têm Vantagem" (só Preso e Caído) faz o ALVO comprado
  // por essas duas facilitar a vida de quem o ataca.
  const desvantagemPropria = e.preso || e.caido || e.envenenado;
  const vantagemContraAlvo = alvo.preso || alvo.caido;
  /*
   * Quebrantado (Cap. 4, §2): cada acúmulo tira 1 da CA do alvo e 1 do dano de
   * QUEM o carrega. Aqui aparecem os dois lados da mesma condição — a CA menor
   * do alvo facilita o acerto, e os acúmulos do próprio atacante cobram dele.
   */
  const caDoAlvo = Math.max(1, alvo.ca - alvo.quebrantado);
  let dano = 0;
  if (a.ataque) {
    const rolagem = d20Ajustado(rng, vantagemContraAlvo, desvantagemPropria);
    if (rolagem === 1) return 0;
    if (rolagem !== 20 && rolagem + bonus < caDoAlvo) return 0;
    dano = rolarDados(a.dano, rng) + bonus + a.dadosDeArma * rolarDados(e.ficha.ataqueBasico.dano, rng);
    if (rolagem === 20) dano += rolarDados(a.dano, rng);
  } else {
    // teste de resistência do alvo: metade se passar. Envenenado também cobra
    // Desvantagem em "testes de atributo" (Cap. 4, §7) — e resistir a uma
    // magia é isso.
    const resistencia = d20Ajustado(rng, false, alvo.envenenado) + Math.ceil(e.ficha.bc / 2);
    dano = rolarDados(a.dano, rng) + bonus + a.dadosDeArma * rolarDados(e.ficha.ataqueBasico.dano, rng);
    if (resistencia >= 8 + e.ficha.bc) dano = Math.floor(dano / 2);
  }
  // Água: frio dobra contra Molhado (Cap. 4, §5)
  if (a.frio && alvo.molhado) dano *= 2;
  // O próprio atacante Quebrantado bate mais fraco — 1 por acúmulo, e nunca
  // abaixo de zero: a condição enfraquece o golpe, não cura o alvo.
  dano = Math.max(0, dano - e.quebrantado);
  if (a.aplicaMolhado) alvo.molhado = true;
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
  rng?: Rng
): number {
  if (dano <= 0) return 0;
  // "Gastos antes dos PV reais": a casca come o golpe primeiro, e só o que
  // sobrar chega na carne.
  const absorvido = Math.min(alvo.pvTemp, dano);
  alvo.pvTemp -= absorvido;
  const real = dano - absorvido;
  alvo.pv -= real;
  // A ferida marca mesmo quando a casca comeu tudo: quem levou o golpe levou o
  // golpe, e a janela de cura em dobro é sobre o momento, não sobre o número.
  alvo.feridaFresca = 2;
  /*
   * Cap. 2, §6: *"sofrer dano NÃO interrompe automaticamente"* — quem conjura
   * faz um teste de Espírito contra CD 10 + o Bônus de Rank de quem acertou.
   * Sucesso e o cântico segue com as Ações gastas valendo; falha e perde tudo
   * que investiu mais metade do PM.
   */
  if (rng && "conjurando" in alvo) testeDeConcentracao(alvo as EstadoPersonagem, bonusDeRankDeQuemBate, rng);
  if (alvo.pv <= 0) {
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
    }
  }
  return real;
}

/**
 * O teste de Concentração — Cap. 2, §6 e Cap. 4, §3 (0.1.40).
 *
 * *"Sempre que você sofrer dano enquanto estiver Conjurando, faça um teste de
 * resistência de Espírito contra CD 10 + o Bônus de Rank de quem te acertou.
 * Sucesso: o cântico segue, as Ações já gastas continuam valendo. Falha: a
 * conjuração é interrompida, você perde todas as Ações já gastas e metade do PM
 * da magia, arredondado pra cima."*
 *
 * A meia devolução de PM é a parte fácil de errar: o livro cobra METADE, não o
 * total — quem foi interrompido perdeu tempo e mana, mas não a magia inteira.
 */
export function testeDeConcentracao(e: EstadoPersonagem, bonusDeRankDeQuemBate: number, rng: Rng): void {
  if (!e.conjurando) return;
  const cd = 10 + bonusDeRankDeQuemBate;
  if (d20(rng) + e.ficha.espirito >= cd) return;
  // Falhou: metade do PM volta (o livro cobra a outra metade), e o cântico morre.
  e.pm += Math.floor(e.conjurando.acao.pm / 2);
  e.conjurando = null;
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
 * Sucesso: você estabiliza temporariamente. Falha: 1 Marca da Morte. Falha
 * Crítica (1 Natural): 2 Marcas. Três Marcas e você morre permanentemente."*
 *
 * **Estabilizar aqui PARA de rolar.** O livro diz "temporariamente" e não diz
 * quando recomeça; um motor tem que escolher, e esta é a escolha declarada — a
 * generosa. Quem estabilizou segue desacordado e fora da luta até um aliado
 * curá-lo, que é o que muda o resultado da batalha de qualquer jeito.
 */
export function testeDoFioDaVida(e: EstadoPersonagem, rng: Rng): void {
  if (!e.inconsciente || e.estabilizado || e.morto) return;
  const rolagem = d20(rng);
  if (rolagem === 1) {
    e.marcasDaMorte += 2;
  } else if (rolagem + e.ficha.vigor < e.cdFioDaVida) {
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
 */
export function curar(alvo: Alvo, rolado: number, pvMax: number, sempreFresca = false): number {
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
  // Cap. 4: "toda a Magia de Cura cura em dobro contra uma Ferida Fresca".
  const total = alvo.feridaFresca > 0 || sempreFresca ? rolado * 2 : rolado;
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
    // 2d8 escritos que valem 4d8 na mesa, e sem este fator ela era comparada
    // pela metade do que entrega.
    (mediaDados(a.formulaSuporte) * (a.area ? alcance : 1) * (a.sempreFresca ? 2 : 1)) / a.acoes;
  return candidatas.reduce((m, a) => (valor(a) > valor(m) ? a : m));
}

/** Um turno inteiro de um personagem: 3 Ações gastas na melhor coisa disponível. */
export function turnoPersonagem(
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
  aliados: EstadoPersonagem[] = []
): void {
  /*
   * O turno de quem está no chão é o teste do Fio da Vida, e nada mais.
   *
   * Vem antes do `return`: um personagem inconsciente não age, mas o turno DELE
   * continua acontecendo — é nele que ele rola contra a morte.
   */
  if (e.inconsciente) {
    testeDoFioDaVida(e, rng);
    return;
  }
  if (!e.vivo) return;
  // A janela da Ferida Fresca fecha de um turno próprio por vez: "o dano
  // sofrido no turno atual ou no imediatamente anterior".
  if (e.feridaFresca > 0) e.feridaFresca--;

  let acoes = 3;
  let guarda = 0;
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
      if (c.acoesGastas < c.acao.acoes) break; // segue no próximo turno
      // O cântico completou: a magia sai agora.
      e.conjurando = null;
      const alvos = c.acao.area ? vivos : [vivos[0]];
      for (const alvo of alvos) {
        e.danoCausado += aplicarDano(alvo, resolver(e, c.acao, alvo, rng), e.ficha.bonusDeRank, rng);
      }
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
      const rolado = rolarDados(suporte.acao.formulaSuporte, rng) + e.ficha.bc;
      const alvos = suporte.acao.area ? aliados.filter((x) => x.vivo) : [suporte.alvo];
      for (const alvo of alvos) {
        e.pvCurado +=
          suporte.acao.tipo === "cura"
            ? curar(alvo, rolado, alvo.ficha.pvMax, suporte.acao.sempreFresca)
            : darPvTemp(alvo, rolado);
      }
      continue;
    }

    // O alvo da vez entra na escolha: sem ele a IA não sabe se a técnica de
    // ataque que ela prefere tem chance de acertar este inimigo.
    // O cântico dividido só começa com o turno inteiro na mão — ver `escolherAcao`.
    const a = escolherAcao(e, acoes, vivos[0], acoes === 3);
    e.pm -= a.pm;
    e.pt -= a.pt;

    /*
     * A magia que não cabe no turno vira cântico: o PM é investido AGORA (é o
     * que o livro chama de "o PM investido", e é o que se perde pela metade
     * quando alguém interrompe), e as Ações começam a ser gastas.
     */
    if (a.acoes > acoes) {
      e.conjurando = { acao: a, acoesGastas: acoes, acoesNesteTurno: acoes };
      acoes = 0;
      break;
    }

    acoes -= a.acoes;
    const alvos = a.area ? vivos : [vivos[0]];
    for (const alvo of alvos) {
      e.danoCausado += aplicarDano(alvo, resolver(e, a, alvo, rng), e.ficha.bonusDeRank, rng);
    }
  }

  // Fim do turno: quem não dedicou nenhuma Ação ao cântico o perde (Perda de Foco).
  perdaDeFoco(e);
}

/** Queima no início do turno de quem está Em Chamas. Devolve true se sobreviveu. */
export function tickChamas(alvo: Alvo, rng: Rng): boolean {
  if (!alvo.vivo || alvo.emChamas === 0) return alvo.vivo;
  aplicarDano(alvo, dado(rng, alvo.emChamas));
  return alvo.vivo;
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
  if (elegivel) alvo.reacaoDisponivel = true;
}

/**
 * Gasta a Reação/ação lendária, se houver uma disponível. Devolve true quando
 * consumiu — o que ela FAZ é responsabilidade de quem chamou.
 */
export function consumirReacao(alvo: Alvo): boolean {
  if (!alvo.vivo || !alvo.reacaoDisponivel) return false;
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
  "Condições modeladas: Molhado (frio dobra), Em Chamas, Quebrantado (−1 de CA e −1 de dano por acúmulo, até o Bônus de Rank de quem aplicou) e — quando a ação de uma criatura os declara — Preso, Caído e Envenenado (Vantagem pra quem ataca o alvo, Desvantagem pra ele). Atolado, Desequilibrado, Marcado e Soterrado ficam de fora: as quatro são sobre movimento, alcance e posição, e este motor não tem mapa.",
  "Cura e PV Temporários ENTRAM desde a 0.1.37, com a dobra da Ferida Fresca: quem cura devolve PV de verdade, e a coluna \"PV devolvidos\" mostra quanto. A IA cura quem estiver na metade ou abaixo, começando pelo pior, e oferece casca a quem ainda não tem — um limiar declarado, não uma tática: curandeiro que espera demais perde gente e o que cura cedo demais desperdiça.",
  "O que de suporte segue de fora: Salvações, e a maior parte da Barreira e Proteção — muralha, domo, selo e anulação de magia são posição e regra de alcance, e este motor não tem mapa. Das 21 habilidades daquela árvore, só a Casca tem número que ele saiba usar. Julgamento e Luz Absoluta entram como as magias de DANO que são; a cura secundária que as duas descrevem na prosa não é contada.",
  "A IA escolhe sempre a ação de maior dano ESPERADO por Ação contra o alvo da vez — com Dados de Arma, bônus fixo e chance de errar na conta (0.1.35). O que ela continua não fazendo: recuar, focar fogo, guardar recurso pro turno seguinte, e dar qualquer valor a condição. É por isso que Quebrantado, embora modelado, quase não aparece nestes números: as técnicas que empilham acúmulos raramente são as de maior dano, e a IA nunca as escolhe por causa do acúmulo. Na mesa, um jogador escolhe.",
  "O Fio da Vida (Cap. 4, §7) entra desde a 0.1.38: a 0 PV o personagem CAI inconsciente, rola 1d20+Vigor contra CD 8 + o Bônus de Rank de quem o derrubou, junta Marcas da Morte e morre de vez na terceira — e qualquer cura de aliado o levanta com todas as Marcas removidas. Quem estabiliza para de rolar (o livro diz \"temporariamente\" e não diz quando recomeça; esta é a leitura declarada). A Exaustão que o livro cobra de quem acorda fica de fora, porque Exaustão não é modelada. Criatura não tem Fio da Vida: a 0 PV ela morre.",
  "Antes disso o motor matava a 0 PV, e isso não era só infidelidade: era a razão de TODO combate contra chefe dar 0% ou 100%. Quem caía sumia da luta pra sempre, o dano do grupo despencava, a luta se alongava e caía o próximo — realimentação positiva não produz meio-termo. Com o Fio da Vida e um curandeiro, o 4º patamar virou 55% de vitória contra 45% de dizimação.",
  "Conjuração Contínua e Dividida (Cap. 4, §3) entra na 0.1.40: magia que custa mais Ações do que o turno tem é recitada ao longo de turnos, com Perda de Foco (1 Ação por turno, no mínimo) e teste de Concentração de Espírito contra CD 10 + o Bônus de Rank de quem acertou, perdendo metade do PM na falha. Sem ela, VINTE ações de dano do livro eram inalcançáveis — Sol Menor, Zero Absoluto, Era Glacial, Vazio, as maiores magias do jogo.",
  "A IA só COMEÇA um cântico longo com o turno inteiro na mão: é regra de decisão declarada, não do livro. Sem ela, um mago com 1 Ação sobrando largava o golpe de arma pra começar um cântico de 3 Ações e amarrava o turno seguinte — o time dos magos perdia 16 pontos de vitória por isso. E a IA não desconta o risco de interrupção ao escolher: ela é otimista, e o relatório mede o preço mesmo assim. Cura e escudo seguem sem cântico dividido — um curandeiro que passa dois turnos recitando enquanto o grupo cai é jogada ruim, não simplificação.",
  "A criatura bate igual todo turno, sem táticas próprias, e o que a torna perigosa no Apêndice G além das condições acima (teia que não causa dano, voo, emboscada) não é simulado.",
  "Reação de chefe: 1 ação avulsa por rodada da mesa, fora do turno normal dele — não a Reação nomeada de nenhuma árvore específica, só a economia de ação extra que os livros de chefe costumam dar.",
  "Terreno, distância, posicionamento e surpresa não existem: todo mundo alcança todo mundo desde a primeira rodada.",
];
