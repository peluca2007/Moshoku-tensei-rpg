/**
 * Simulador de combate — o playtest que o livro não tinha.
 *
 * O Apêndice C promete uma curva de dano e o Apêndice G promete uma curva de
 * criatura. Nada nunca rodou as duas uma contra a outra. Este script pega
 * fichas montadas com o MESMO orçamento de PA, resolve os números delas pelo
 * motor de verdade (`selectors.ts`, os mesmos que a ficha do site usa), e faz
 * elas se baterem com dados rolados.
 *
 * O que ele NÃO é: um motor de regras completo. As simplificações estão
 * declaradas em SIMPLIFICACOES, no fim do arquivo, e toda leitura do resultado
 * tem que passar por elas.
 */
import { TREES, getTreeById } from "../src/data/trees/index";
import {
  getArmorClass,
  getAttackBonus,
  getMaxHp,
  getMaxMp,
  getPaSpent,
  getPtPool,
} from "../src/store/selectors";
import {
  AbilityDef,
  attributeKeyFromLabel,
  AttributeKey,
  CharacterData,
  RANK_BONUS,
  RankName,
  RANKS,
} from "../src/lib/types";

// ---------------------------------------------------------------------------
// Dados
// ---------------------------------------------------------------------------
let seed = 20260903;
function rng(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}
const d = (faces: number) => Math.floor(rng() * faces) + 1;
const d20 = () => d(20);

/** Rola "NdM" repetidamente; ignora modificadores textuais. */
function rolarDados(formula: string): number {
  let total = 0;
  for (const m of formula.matchAll(/(\d+)d(\d+)/g)) {
    const n = Number(m[1]);
    const faces = Number(m[2]);
    for (let i = 0; i < n; i++) total += d(faces);
  }
  return total;
}
function mediaDados(formula: string): number {
  let total = 0;
  for (const m of formula.matchAll(/(\d+)d(\d+)/g)) {
    total += (Number(m[1]) * (Number(m[2]) + 1)) / 2;
  }
  return total;
}

const PA_ALVO = 12;

// ---------------------------------------------------------------------------
// Fichas
// ---------------------------------------------------------------------------
const ATTRS_ZERO: Record<AttributeKey, number> = {
  forca: 0,
  agilidade: 0,
  vigor: 0,
  intelecto: 0,
  espirito: 0,
};

function ficha(
  nome: string,
  attrs: Partial<Record<AttributeKey, number>>,
  patch: Partial<CharacterData>
): CharacterData {
  return {
    id: nome,
    name: nome,
    lore: "",
    raceId: null,
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: { ...ATTRS_ZERO, ...attrs },
    raceAttributeChoices: [],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: patch.unlockedRanks?.[0]?.treeId ?? null,
    unlockedRanks: [],
    purchasedAbilities: [],
    purchasedCombinedSpells: [],
    gold: 0,
    inventory: [],
    skills: [],
    treeSkillChoices: [],
    proficiencies: [],
    bonusHp: 0,
    bonusMp: 0,
    currentHp: null,
    currentMp: null,
    currentPt: null,
    currentPp: null,
    overrides: {},
    ...patch,
  };
}

/** Abre uma árvore até `ateRank` e compra as N primeiras magias/talentos de cada patamar. */
function construir(
  treeId: string,
  ateRank: RankName,
  comprasPorRank: number[]
): Pick<CharacterData, "unlockedRanks" | "purchasedAbilities" | "startingTreeId"> {
  const tree = getTreeById(treeId)!;
  const limite = RANKS.indexOf(ateRank);
  const unlockedRanks: CharacterData["unlockedRanks"] = [];
  const purchasedAbilities: CharacterData["purchasedAbilities"] = [];

  RANKS.slice(0, limite + 1).forEach((rank, i) => {
    const rd = tree.ranks.find((r) => r.rank === rank);
    if (!rd) return;
    unlockedRanks.push({ treeId, rank });
    const quantas = comprasPorRank[i] ?? 0;
    // magias primeiro (é o que a simulação usa), depois talentos
    const pool = [
      ...rd.abilities.map((a) => ({ kind: "ability" as const, id: a.id })),
      ...rd.talents.map((t) => ({ kind: "talent" as const, id: t.id })),
    ];
    for (const p of pool.slice(0, quantas)) {
      purchasedAbilities.push({ treeId, rank, kind: p.kind, id: p.id });
    }
  });

  return { unlockedRanks, purchasedAbilities, startingTreeId: treeId };
}

// ---------------------------------------------------------------------------
// Combatente
// ---------------------------------------------------------------------------
interface Acao {
  nome: string;
  acoes: number;
  pm: number;
  pt: number;
  dano: string;
  dadosDeArma: number;
  area: boolean;
  ataque: boolean; // true = rola contra CA; false = teste de resistência
  frio: boolean;
  fogo: boolean;
  aplicaMolhado: boolean;
}

interface Combatente {
  nome: string;
  build: string;
  pvMax: number;
  pv: number;
  ca: number;
  pmMax: number;
  pm: number;
  ptMax: number;
  pt: number;
  bc: number;
  bcSemRank: number;
  iniciativa: number;
  acoes: Acao[];
  ataqueBasico: Acao;
  molhado: boolean;
  emChamas: number; // dano por turno enquanto arder
  vivo: boolean;
  danoCausado: number;
}

function acoesDe(c: CharacterData): Acao[] {
  const out: Acao[] = [];
  for (const compra of c.purchasedAbilities) {
    if (compra.kind !== "ability") continue;
    const tree = getTreeById(compra.treeId);
    const rd = tree?.ranks.find((r) => r.rank === compra.rank);
    const a = rd?.abilities.find((x) => x.id === compra.id) as AbilityDef | undefined;
    if (!a?.damage?.normal) continue;
    const txt = (a.damage.normal + " " + a.effect).toLowerCase();
    // `damage.normal` também guarda PV CURADOS (Cura) e PV Temporários
    // (Escudos). Sem este filtro a simulação contava a Prontidão como 105 de
    // dano por turno — o campo é o mesmo, o sinal é oposto.
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

function montar(c: CharacterData, build: string): Combatente {
  // BC da árvore inicial
  const tree = getTreeById(c.startingTreeId);
  const attr = attributeKeyFromLabel(tree?.keyAttributeLabel) ?? "forca";
  const bc = getAttackBonus(c, c.startingTreeId!, attr);
  const maiorRank = c.unlockedRanks
    .filter((u) => u.treeId === c.startingTreeId)
    .reduce<RankName>((m, u) => (RANKS.indexOf(u.rank) > RANKS.indexOf(m) ? u.rank : m), "Principiante");

  // Degraus de Dado de Arma: soma só dos patamares de árvores do CORPO.
  const degraus = c.unlockedRanks.reduce((n, u) => {
    const t = getTreeById(u.treeId);
    if (t?.category !== "corpo") return n;
    return n + (t.ranks.find((r) => r.rank === u.rank)?.weaponDieSteps ?? 0);
  }, 0);
  const LADDER = [4, 6, 8, 10, 12, 16, 20, 24];

  const pv = getMaxHp(c);
  return {
    nome: c.name,
    build,
    pvMax: pv,
    pv,
    ca: getArmorClass(c),
    pmMax: getMaxMp(c),
    pm: getMaxMp(c),
    ptMax: getPtPool(c),
    pt: getPtPool(c),
    bc,
    bcSemRank: Math.max(...Object.values(c.attributeBase)),
    iniciativa: c.attributeBase.agilidade,
    acoes: acoesDe(c),
    // Golpe comum. A Escada de Dados é EXCLUSIVA da Árvore do Corpo (Cap. 3):
    // um mago de Água Avançado não escala dado nenhum — ele empunha uma arma
    // simples (d6) e soma o atributo, sem Bônus de Rank, porque a técnica não
    // veio de árvore nenhuma. A primeira versão deste script dava a escada a
    // todo mundo e fazia a curandeira bater 35 por turno de espada.
    ataqueBasico: {
      nome: degraus > 0 ? "golpe comum" : "arma simples",
      acoes: 1,
      pm: 0,
      pt: 0,
      dano: `1d${LADDER[Math.min(LADDER.length - 1, 1 + degraus)]}`,
      dadosDeArma: 0,
      area: false,
      ataque: true,
      frio: false,
      fogo: false,
      aplicaMolhado: false,
    },
    molhado: false,
    emChamas: 0,
    vivo: true,
    danoCausado: 0,
  };
}

// ---------------------------------------------------------------------------
// Combate
// ---------------------------------------------------------------------------
interface Alvo {
  pv: number;
  ca: number;
  vivo: boolean;
  molhado: boolean;
  emChamas: number;
  nome: string;
}

/** Melhor ação que cabe nas Ações e recursos restantes, por dano médio. */
function escolherAcao(c: Combatente, acoesRestantes: number): Acao {
  const viaveis = c.acoes.filter(
    (a) => a.acoes <= acoesRestantes && a.pm <= c.pm && a.pt <= c.pt
  );
  if (viaveis.length === 0) return c.ataqueBasico;
  return viaveis.reduce((melhor, a) =>
    mediaDados(a.dano) / a.acoes > mediaDados(melhor.dano) / melhor.acoes ? a : melhor
  );
}

function resolver(c: Combatente, a: Acao, alvo: Alvo): number {
  // Quem não tem árvore do Corpo não soma Bônus de Rank num golpe de arma.
  const bonus = a.nome === "arma simples" ? c.bcSemRank : c.bc;
  let dano = 0;
  if (a.ataque) {
    const rolagem = d20();
    if (rolagem === 1) return 0;
    if (rolagem !== 20 && rolagem + bonus < alvo.ca) return 0;
    dano = rolarDados(a.dano) + bonus + a.dadosDeArma * rolarDados(c.ataqueBasico.dano);
    if (rolagem === 20) dano += rolarDados(a.dano);
  } else {
    // teste de resistência do alvo: metade se passar
    const resistencia = d20() + Math.ceil(c.bc / 2);
    dano = rolarDados(a.dano) + bonus + a.dadosDeArma * rolarDados(c.ataqueBasico.dano);
    if (resistencia >= 8 + c.bc) dano = Math.floor(dano / 2);
  }
  // Água: frio dobra contra Molhado (Cap. 4, §5)
  if (a.frio && alvo.molhado) dano *= 2;
  if (a.aplicaMolhado) alvo.molhado = true;
  // Fogo: Em Chamas cobra 1d6 no início de cada turno do alvo
  if (a.fogo && !alvo.molhado) alvo.emChamas = 6;
  if (a.fogo && alvo.molhado) alvo.molhado = false; // fogo evapora a água
  return dano;
}

function turno(c: Combatente, inimigos: Alvo[]): void {
  if (!c.vivo) return;
  let acoes = 3;
  let guard = 0;
  while (acoes > 0 && guard++ < 10) {
    const vivos = inimigos.filter((x) => x.vivo);
    if (vivos.length === 0) return;
    const a = escolherAcao(c, acoes);
    if (a.acoes > acoes) break;
    acoes -= a.acoes;
    c.pm -= a.pm;
    c.pt -= a.pt;
    const alvos = a.area ? vivos : [vivos[0]];
    for (const alvo of alvos) {
      const dano = resolver(c, a, alvo);
      alvo.pv -= dano;
      c.danoCausado += dano;
      if (alvo.pv <= 0) alvo.vivo = false;
    }
  }
}

function tickCondicoes(alvos: Alvo[]): void {
  for (const a of alvos) {
    if (!a.vivo || a.emChamas === 0) continue;
    a.pv -= d(a.emChamas);
    if (a.pv <= 0) a.vivo = false;
  }
}

function comoAlvo(c: Combatente): Alvo {
  return {
    get pv() {
      return c.pv;
    },
    set pv(v) {
      c.pv = v;
    },
    ca: c.ca,
    get vivo() {
      return c.vivo;
    },
    set vivo(v) {
      c.vivo = v;
    },
    get molhado() {
      return c.molhado;
    },
    set molhado(v) {
      c.molhado = v;
    },
    get emChamas() {
      return c.emChamas;
    },
    set emChamas(v) {
      c.emChamas = v;
    },
    nome: c.nome,
  };
}

function batalha(timeA: Combatente[], timeB: Combatente[], maxRodadas = 20): "A" | "B" | "empate" {
  const alvosA = timeA.map(comoAlvo);
  const alvosB = timeB.map(comoAlvo);
  const ordem = [...timeA.map((c) => ({ c, time: "A" as const })), ...timeB.map((c) => ({ c, time: "B" as const }))]
    .map((x) => ({ ...x, ini: d20() + x.c.iniciativa }))
    .sort((p, q) => q.ini - p.ini);

  for (let r = 0; r < maxRodadas; r++) {
    for (const { c, time } of ordem) {
      if (!c.vivo) continue;
      if (c.emChamas > 0) {
        c.pv -= d(c.emChamas);
        if (c.pv <= 0) {
          c.vivo = false;
          continue;
        }
      }
      turno(c, time === "A" ? alvosB : alvosA);
    }
    tickCondicoes([]);
    if (timeB.every((x) => !x.vivo)) return "A";
    if (timeA.every((x) => !x.vivo)) return "B";
  }
  return "empate";
}

// ---------------------------------------------------------------------------
// As dez builds — 12 PA cada
// ---------------------------------------------------------------------------
/**
 * Monta a ficha e COMPRA até bater exatamente o orçamento.
 *
 * A primeira versão deste script chutava "3 compras por patamar" e produzia
 * fichas de 24 a 30 PA — porque atributo custa PA (escada progressiva do Cap. 1,
 * §2) e eu tinha dado 7 pontos de atributo a cada uma, o que sozinho já comia
 * 9 PA. Comparar fichas de orçamentos diferentes não mede balanceamento nenhum;
 * mede quem gastou mais.
 */
function build(
  nome: string,
  descricao: string,
  attrs: Partial<Record<AttributeKey, number>>,
  treeId: string,
  ateRank: RankName
): { c: CharacterData; descricao: string } {
  const tree = getTreeById(treeId)!;
  const limite = RANKS.indexOf(ateRank);
  const base = ficha(nome, attrs, { startingTreeId: treeId });

  // Todas as compras possíveis até o rank alvo, na ordem em que o livro as lista.
  const candidatas: CharacterData["purchasedAbilities"] = [];
  for (const rank of RANKS.slice(0, limite + 1)) {
    const rd = tree.ranks.find((r) => r.rank === rank);
    if (!rd) continue;
    for (const a of rd.abilities) candidatas.push({ treeId, rank, kind: "ability", id: a.id });
    for (const t of rd.talents) candidatas.push({ treeId, rank, kind: "talent", id: t.id });
  }

  const unlockedRanks = RANKS.slice(0, limite + 1)
    .filter((rank) => tree.ranks.some((r) => r.rank === rank))
    .map((rank) => ({ treeId, rank }));

  // Compra em PROFUNDIDADE: o mínimo de conhecimentos por patamar pra destravar
  // o próximo, e só depois de chegar no topo é que o troco vira magia extra.
  //
  // A primeira versão comprava em ORDEM DE ARQUIVO e gastava os 12 PA inteiros
  // nas seis magias de 1º patamar — a "Elina Avançado" era, na verdade, uma
  // Principiante larga, e ela apareceu no relatório com 8 de dano por batalha.
  // Comparar isso com um Deus da Espada Avançado não mede balanceamento nenhum.
  const c: CharacterData = { ...base, unlockedRanks, purchasedAbilities: [] };
  const MINIMO_POR_PATAMAR = 3; // RANK_REQUIREMENTS: 3 conhecimentos destravam o rank seguinte
  for (const rank of RANKS.slice(0, limite + 1)) {
    const doRank = candidatas.filter((x) => x.rank === rank);
    for (const compra of doRank.slice(0, MINIMO_POR_PATAMAR)) {
      const tentativa = { ...c, purchasedAbilities: [...c.purchasedAbilities, compra] };
      if (getPaSpent(tentativa) > PA_ALVO) continue;
      c.purchasedAbilities = tentativa.purchasedAbilities;
    }
  }
  // Troco: qualquer conhecimento que ainda caiba, do patamar mais alto pro mais baixo.
  for (const compra of [...candidatas].reverse()) {
    if (c.purchasedAbilities.some((x) => x.id === compra.id)) continue;
    const tentativa = { ...c, purchasedAbilities: [...c.purchasedAbilities, compra] };
    if (getPaSpent(tentativa) > PA_ALVO) continue;
    c.purchasedAbilities = tentativa.purchasedAbilities;
  }
  return { c, descricao };
}

export const BUILDS = [
  // TIME A — profundidade
  build("Elina", "Água — molha e congela", { intelecto: 3, vigor: 1 }, "agua", "Avançado"),
  build("Borg", "Deus do Norte — improviso e aço", { forca: 3, vigor: 1 }, "deus-do-norte", "Avançado"),
  build("Kest", "Fogo — dano bruto, sem defesa", { intelecto: 4 }, "fogo", "Avançado"),
  build("Dorn", "Terra — o mago com mais PV", { intelecto: 2, vigor: 2 }, "terra", "Avançado"),
  build("Sera", "Cura — decide quem sobrevive", { espirito: 3, vigor: 1 }, "cura", "Avançado"),

  // TIME B — outras identidades
  build("Vex", "Deus da Espada — o maior dano do livro", { forca: 4 }, "deus-da-espada", "Avançado"),
  build("Iri", "Vento — desequilibra e cobra", { intelecto: 3, agilidade: 1 }, "vento", "Avançado"),
  build("Gorr", "Lutador — empilha Quebrantado", { forca: 3, vigor: 1 }, "armas-pesadas", "Avançado"),
  build("Lyn", "Arquearia — dano sustentado a 90m", { agilidade: 4 }, "arquearia", "Avançado"),
  build("Mara", "Escudos — protege, não mata", { vigor: 3, forca: 1 }, "cavalaria-e-escudos", "Avançado"),
];

// ---------------------------------------------------------------------------
// Relatório
// ---------------------------------------------------------------------------
console.log("═".repeat(78));
console.log("  ORÇAMENTO: 12 PA por ficha — conferido pelo motor (getPaSpent)");
console.log("═".repeat(78));
console.log(
  "FICHA".padEnd(8) + "BUILD".padEnd(46) + "PA".padStart(4) + "PV".padStart(6) + "CA".padStart(4) + "BC".padStart(4)
);

const combatentes: Combatente[] = [];
for (const { c, descricao } of BUILDS) {
  const pa = getPaSpent(c);
  const comb = montar(c, descricao);
  combatentes.push(comb);
  const alerta = pa === PA_ALVO ? "" : `  ⚠ ${pa} PA, não ${PA_ALVO}`;
  console.log(
    c.name.padEnd(8) +
      descricao.slice(0, 45).padEnd(46) +
      String(pa).padStart(4) +
      String(comb.pvMax).padStart(6) +
      String(comb.ca).padStart(4) +
      String(comb.bc).padStart(4) +
      alerta
  );
}

console.log("\n" + "─".repeat(78));
console.log("  DANO MÉDIO POR TURNO (3 Ações, melhor ação disponível)");
console.log("─".repeat(78));
for (const c of combatentes) {
  const melhor = c.acoes.length
    ? c.acoes.reduce((m, a) => (mediaDados(a.dano) / a.acoes > mediaDados(m.dano) / m.acoes ? a : m))
    : c.ataqueBasico;
  const bonus = melhor.nome === "arma simples" ? c.bcSemRank : c.bc;
  const porTurno = (mediaDados(melhor.dano) + bonus) * Math.floor(3 / melhor.acoes);
  console.log(
    c.nome.padEnd(8) +
      melhor.nome.padEnd(24) +
      `${melhor.acoes} Ação/ões`.padEnd(12) +
      `média ${Math.round(porTurno)}/turno`
  );
}


// ---------------------------------------------------------------------------
// 5 × 5 — mesmo orçamento, identidades diferentes
// ---------------------------------------------------------------------------
function novoTime(indices: number[]): Combatente[] {
  return indices.map((i) => montar(BUILDS[i].c, BUILDS[i].descricao));
}

const TIME_A = [0, 1, 2, 3, 4]; // Elina, Borg, Kest, Dorn, Sera
const TIME_B = [5, 6, 7, 8, 9]; // Vex, Iri, Gorr, Lyn, Mara

const TENTATIVAS = 2000;
let vitoriasA = 0;
let vitoriasB = 0;
let empates = 0;
const danoTotal = new Map<string, number>();
const sobrevivencia = new Map<string, number>();

for (let i = 0; i < TENTATIVAS; i++) {
  const a = novoTime(TIME_A);
  const b = novoTime(TIME_B);
  const r = batalha(a, b);
  if (r === "A") vitoriasA++;
  else if (r === "B") vitoriasB++;
  else empates++;
  for (const c of [...a, ...b]) {
    danoTotal.set(c.nome, (danoTotal.get(c.nome) ?? 0) + c.danoCausado);
    if (c.vivo) sobrevivencia.set(c.nome, (sobrevivencia.get(c.nome) ?? 0) + 1);
  }
}

console.log("\n" + "═".repeat(78));
console.log(`  5 × 5 — ${TENTATIVAS} batalhas`);
console.log("═".repeat(78));
console.log(`Time A (Elina, Borg, Kest, Dorn, Sera)....... ${((vitoriasA / TENTATIVAS) * 100).toFixed(1)}%`);
console.log(`Time B (Vex, Iri, Gorr, Lyn, Mara).......... ${((vitoriasB / TENTATIVAS) * 100).toFixed(1)}%`);
console.log(`Empates (20 rodadas sem decisão)............ ${((empates / TENTATIVAS) * 100).toFixed(1)}%`);

console.log("\n" + "─".repeat(78));
console.log("  CONTRIBUIÇÃO INDIVIDUAL (média por batalha)");
console.log("─".repeat(78));
const linhas = [...danoTotal.entries()]
  .map(([nome, total]) => ({
    nome,
    dano: total / TENTATIVAS,
    viveu: ((sobrevivencia.get(nome) ?? 0) / TENTATIVAS) * 100,
  }))
  .sort((x, y) => y.dano - x.dano);
console.log("FICHA".padEnd(8) + "DANO/BATALHA".padStart(14) + "SOBREVIVEU".padStart(13));
for (const l of linhas) {
  console.log(l.nome.padEnd(8) + l.dano.toFixed(0).padStart(14) + (l.viveu.toFixed(0) + "%").padStart(13));
}

// ---------------------------------------------------------------------------
// Os cinco vencedores contra um chefe (Apêndice G)
// ---------------------------------------------------------------------------
interface Chefe {
  nome: string;
  pv: number;
  ca: number;
  ataque: number;
  danoPorTurno: number;
}

/** Apêndice G, "Ajustando pra cima": chefe único = dobra o PV da linha, mantém o dano. */
const CHEFES: Chefe[] = [
  { nome: "3º — Ameaça (chefe)", pv: 90 * 2, ca: 16, ataque: 6, danoPorTurno: 35 },
  { nome: "4º — Elite (chefe)", pv: 150 * 2, ca: 18, ataque: 8, danoPorTurno: 55 },
  { nome: "5º — Terror (chefe)", pv: 220 * 2, ca: 20, ataque: 10, danoPorTurno: 80 },
];

const vencedor = vitoriasA >= vitoriasB ? TIME_A : TIME_B;
const nomeVencedor = vitoriasA >= vitoriasB ? "Time A" : "Time B";

console.log("\n" + "═".repeat(78));
console.log(`  ${nomeVencedor} × CHEFE — ${TENTATIVAS} batalhas por patamar`);
console.log("═".repeat(78));
console.log("CHEFE".padEnd(24) + "PV".padStart(6) + "VITÓRIA".padStart(10) + "RODADAS".padStart(10) + "MORTES".padStart(9));

for (const chefe of CHEFES) {
  let vitorias = 0;
  let somaRodadas = 0;
  let somaMortes = 0;
  for (let i = 0; i < TENTATIVAS; i++) {
    const grupo = novoTime(vencedor);
    const alvos = grupo.map(comoAlvo);
    let pvChefe = chefe.pv;
    let rodada = 0;
    for (; rodada < 20; rodada++) {
      // grupo age
      for (const c of grupo) {
        if (!c.vivo) continue;
        const alvoChefe: Alvo = {
          get pv() { return pvChefe; },
          set pv(v) { pvChefe = v; },
          ca: chefe.ca,
          vivo: true,
          molhado: false,
          emChamas: 0,
          nome: chefe.nome,
        };
        turno(c, [alvoChefe]);
      }
      if (pvChefe <= 0) break;
      // Chefe age: uma rodada inteira a cada dois personagens do grupo
      // (Apêndice G, "Ajustando pra cima"). Cinco personagens = duas rodadas.
      const rodadasDoChefe = Math.max(1, Math.floor(grupo.length / 2));
      let restante = chefe.danoPorTurno * rodadasDoChefe;
      for (const alvo of alvos) {
        if (restante <= 0) break;
        if (!alvo.vivo) continue;
        if (d20() + chefe.ataque < alvo.ca) continue;
        const golpe = Math.min(restante, alvo.pv);
        alvo.pv -= golpe;
        restante -= golpe;
        if (alvo.pv <= 0) alvo.vivo = false;
      }
      if (grupo.every((c) => !c.vivo)) break;
    }
    if (pvChefe <= 0) vitorias++;
    somaRodadas += rodada + 1;
    somaMortes += grupo.filter((c) => !c.vivo).length;
  }
  console.log(
    chefe.nome.padEnd(24) +
      String(chefe.pv).padStart(6) +
      ((vitorias / TENTATIVAS) * 100).toFixed(0).padStart(9) + "%" +
      (somaRodadas / TENTATIVAS).toFixed(1).padStart(10) +
      (somaMortes / TENTATIVAS).toFixed(1).padStart(9)
  );
}

console.log("\n" + "─".repeat(78));
console.log("  SIMPLIFICAÇÕES — leia antes de concluir qualquer coisa");
console.log("─".repeat(78));
for (const s of [
  "Condições modeladas: Molhado (frio dobra), Em Chamas (dano por turno). Todas",
  "  as outras — Atolado, Desequilibrado, Quebrantado, Marcado, Soterrado — NÃO",
  "  entram, e elas são a mecânica central de cinco árvores.",
  "Cura, barreira, Reações e Salvações não são simuladas: a Sera e a Mara",
  "  aparecem aqui só pelo dano que causam, que é o que elas menos fazem.",
  "A IA escolhe a ação de maior dano médio por Ação, e nunca recua, foca fogo",
  "  nem economiza recurso pro turno seguinte.",
  "O chefe é o molde do Apêndice G com o PV dobrado, e bate igual todo turno.",
]) console.log("· " + s);

export {};
