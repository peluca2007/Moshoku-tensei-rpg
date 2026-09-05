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
import { getArmorClass, getAttackBonus, getMaxHp, getMaxMp, getPtPool } from "@/store/selectors";
import {
  AbilityDef,
  attributeKeyFromLabel,
  CharacterData,
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

/** Uma coisa que um combatente pode fazer no turno dele. */
export interface Acao {
  nome: string;
  acoes: number;
  pm: number;
  pt: number;
  dano: string;
  dadosDeArma: number;
  area: boolean;
  /** true = rola contra a CA; false = o alvo faz um teste de resistência. */
  ataque: boolean;
  frio: boolean;
  fogo: boolean;
  aplicaMolhado: boolean;
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
  iniciativa: number;
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
  danoCausado: number;
}

/** O que muda numa batalha, do lado do personagem. */
export interface EstadoPersonagem extends Alvo {
  ficha: FichaCombate;
  pm: number;
  pt: number;
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
    // `damage.normal` também guarda PV CURADOS (Cura) e PV Temporários
    // (Escudos). Sem este filtro a simulação contava a Prontidão como 105 de
    // dano por turno — o campo é o mesmo, o sinal é oposto. O filtro olha só
    // `damage.normal` (não `effect`): magias de dano duplo como Julgamento e
    // Luz Absoluta descrevem a cura extra no `effect` ("recuperam ... de
    // PV"), e olhar o `effect` aqui derrubava o dano real delas do combate.
    if (/de pv|pv temporários|recupera|cura /.test(txt)) continue;
    out.push({
      nome: a.name,
      acoes: a.reaction ? 1 : Math.max(1, a.actions.normal),
      pm: a.pmCost ?? 0,
      pt: a.ptCost ?? 0,
      dano: a.damage.normal,
      // "+1 Dado de Arma", "+2 Dados de Arma", "Dado de arma rolado quatro vezes":
      // oito técnicas do livro multiplicam o dado da arma em vez de trazer dados
      // próprios. Sem isto o Deus da Espada — que o livro chama de maior dano do
      // jogo — aparecia em quarto lugar, porque metade das técnicas dele soma
      // zero na conta.
      dadosDeArma: (() => {
        const m = a.damage.normal.match(/\+\s*(\d+)\s+Dados? de Arma/i);
        if (m) return Number(m[1]);
        const v = a.damage.normal.match(/rolado (duas|três|quatro|cinco) vezes/i);
        if (v) return { duas: 2, três: 3, quatro: 4, cinco: 5 }[v[1].toLowerCase()] ?? 0;
        return 0;
      })(),
      area: /esfera|cone|linha|área|todos/.test((a.range + " " + a.effect).toLowerCase()),
      ataque: /ataque mágico|ataque à distância|se acertar/.test(txt),
      frio: /frio|gelo/.test(txt),
      fogo: /ígneo|chamas|fogo/.test(txt),
      aplicaMolhado: /molhad/.test(txt),
    });
  }
  return out;
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
    iniciativa: c.attributeBase.agilidade,
    acoes: acoesDe(c),
    // Golpe comum. A Escada de Dados é EXCLUSIVA da Árvore do Corpo (Cap. 3):
    // um mago de Água Avançado não escala dado nenhum — ele empunha uma arma
    // simples (d6) e soma o atributo, sem Bônus de Rank, porque a técnica não
    // veio de árvore nenhuma. A primeira versão deste motor dava a escada a
    // todo mundo e fazia a curandeira bater 35 por turno de espada.
    ataqueBasico: {
      nome: degraus > 0 ? "golpe comum" : "arma simples",
      acoes: 1,
      pm: 0,
      pt: 0,
      dano: `1d${ESCADA_DADOS[Math.min(ESCADA_DADOS.length - 1, 1 + degraus)]}`,
      dadosDeArma: 0,
      area: false,
      ataque: true,
      frio: false,
      fogo: false,
      aplicaMolhado: false,
    },
  };
}

/** Estado zerado pra uma batalha nova, a partir da ficha já derivada. */
export function novoEstado(ficha: FichaCombate): EstadoPersonagem {
  return {
    ficha,
    nome: ficha.nome,
    pv: ficha.pvMax,
    ca: ficha.ca,
    pm: ficha.pmMax,
    pt: ficha.ptMax,
    molhado: false,
    emChamas: 0,
    vivo: true,
    danoCausado: 0,
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

/** Melhor ação que cabe nas Ações e recursos restantes, por dano médio por Ação. */
export function escolherAcao(e: EstadoPersonagem, acoesRestantes: number): Acao {
  const viaveis = e.ficha.acoes.filter((a) => a.acoes <= acoesRestantes && a.pm <= e.pm && a.pt <= e.pt);
  if (viaveis.length === 0) return e.ficha.ataqueBasico;
  return viaveis.reduce((melhor, a) =>
    mediaDados(a.dano) / a.acoes > mediaDados(melhor.dano) / melhor.acoes ? a : melhor
  );
}

/** Resolve UMA ação contra UM alvo e devolve o dano causado. */
export function resolver(e: EstadoPersonagem, a: Acao, alvo: Alvo, rng: Rng): number {
  // Quem não tem árvore do Corpo não soma Bônus de Rank num golpe de arma.
  const bonus = a.nome === "arma simples" ? e.ficha.bcSemRank : e.ficha.bc;
  let dano = 0;
  if (a.ataque) {
    const rolagem = d20(rng);
    if (rolagem === 1) return 0;
    if (rolagem !== 20 && rolagem + bonus < alvo.ca) return 0;
    dano = rolarDados(a.dano, rng) + bonus + a.dadosDeArma * rolarDados(e.ficha.ataqueBasico.dano, rng);
    if (rolagem === 20) dano += rolarDados(a.dano, rng);
  } else {
    // teste de resistência do alvo: metade se passar
    const resistencia = d20(rng) + Math.ceil(e.ficha.bc / 2);
    dano = rolarDados(a.dano, rng) + bonus + a.dadosDeArma * rolarDados(e.ficha.ataqueBasico.dano, rng);
    if (resistencia >= 8 + e.ficha.bc) dano = Math.floor(dano / 2);
  }
  // Água: frio dobra contra Molhado (Cap. 4, §5)
  if (a.frio && alvo.molhado) dano *= 2;
  if (a.aplicaMolhado) alvo.molhado = true;
  // Fogo: Em Chamas cobra 1d6 no início de cada turno do alvo
  if (a.fogo && !alvo.molhado) alvo.emChamas = 6;
  if (a.fogo && alvo.molhado) alvo.molhado = false; // fogo evapora a água
  return dano;
}

/** Um turno inteiro de um personagem: 3 Ações gastas na melhor coisa disponível. */
export function turnoPersonagem(e: EstadoPersonagem, inimigos: Alvo[], rng: Rng): void {
  if (!e.vivo) return;
  let acoes = 3;
  let guarda = 0;
  while (acoes > 0 && guarda++ < 10) {
    const vivos = inimigos.filter((x) => x.vivo);
    if (vivos.length === 0) return;
    const a = escolherAcao(e, acoes);
    if (a.acoes > acoes) break;
    acoes -= a.acoes;
    e.pm -= a.pm;
    e.pt -= a.pt;
    const alvos = a.area ? vivos : [vivos[0]];
    for (const alvo of alvos) {
      const dano = resolver(e, a, alvo, rng);
      alvo.pv -= dano;
      e.danoCausado += dano;
      if (alvo.pv <= 0) alvo.vivo = false;
    }
  }
}

/** Queima no início do turno de quem está Em Chamas. Devolve true se sobreviveu. */
export function tickChamas(alvo: Alvo, rng: Rng): boolean {
  if (!alvo.vivo || alvo.emChamas === 0) return alvo.vivo;
  alvo.pv -= dado(rng, alvo.emChamas);
  if (alvo.pv <= 0) alvo.vivo = false;
  return alvo.vivo;
}

/**
 * As simplificações do motor, em uma lista.
 *
 * Elas moram aqui — e não num comentário — porque a tela /encontros as imprime
 * pro Mestre junto do veredito. Um número de balanceamento sem a lista do que
 * ele ignora é pior que nenhum número: parece mais confiável do que é.
 */
export const SIMPLIFICACOES = [
  "Condições modeladas: Molhado (frio dobra) e Em Chamas. Todas as outras — Atolado, Desequilibrado, Quebrantado, Marcado, Soterrado — ficam de fora, e elas são a mecânica central de cinco árvores.",
  "Cura, barreira, Reações e Salvações não entram. Quem joga de suporte aparece aqui só pelo dano que causa, que é o que ele menos faz — e o grupo parece mais frágil do que é na mesa.",
  "A IA escolhe sempre a ação de maior dano médio por Ação: nunca recua, nunca foca fogo, nunca guarda recurso pro turno seguinte.",
  "A criatura bate igual todo turno, sem táticas próprias, e o que a torna perigosa no Apêndice G (veneno, teia, voo, emboscada) não é simulado.",
  "Terreno, distância, posicionamento e surpresa não existem: todo mundo alcança todo mundo desde a primeira rodada.",
];
