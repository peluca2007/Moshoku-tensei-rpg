/**
 * Simulador de combate — o playtest que o livro não tinha.
 *
 * O Apêndice C promete uma curva de dano e o Apêndice G promete uma curva de
 * criatura. Nada nunca rodou as duas uma contra a outra. Este script pega
 * fichas montadas com o MESMO orçamento de PA, resolve os números delas pelo
 * motor de verdade (`selectors.ts`, os mesmos que a ficha do site usa), e faz
 * elas se baterem com dados rolados.
 *
 * O motor de combate em si vive em `src/lib/combatSim.ts` desde 2026-09-03,
 * compartilhado com a tela /encontros: a tela que diz ao Mestre "este encontro
 * é justo" tem que responder pelos mesmos números que calibram o livro. Este
 * arquivo ficou só com o que é dele — as dez builds, os confrontos e o
 * relatório.
 *
 * O que ele NÃO é: um motor de regras completo. As simplificações estão em
 * SIMPLIFICACOES (importado do motor) e toda leitura do resultado tem que
 * passar por elas.
 */
import { getTreeById } from "../src/data/trees/index";
import { getPaSpent } from "../src/store/selectors";
import { AttributeKey, CharacterData, RankName, RANKS } from "../src/lib/types";
import {
  Alvo,
  EstadoPersonagem,
  FichaCombate,
  SIMPLIFICACOES,
  d20,
  makeRng,
  mediaDados,
  montarFicha,
  novoEstado,
  tickChamas,
  turnoPersonagem,
} from "../src/lib/combatSim";
import { MOLDES_CRIATURA, rodadasDoChefe } from "../src/data/bestiary";

const rng = makeRng(20260903);
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
    currentCalor: null,
    overrides: {},
    ...patch,
  };
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

/** Ficha derivada uma vez por build; cada batalha recria só o estado mutável. */
const FICHAS: FichaCombate[] = BUILDS.map(({ c, descricao }) => montarFicha(c, descricao));

// ---------------------------------------------------------------------------
// Confronto
// ---------------------------------------------------------------------------
function batalha(timeA: EstadoPersonagem[], timeB: EstadoPersonagem[], maxRodadas = 20): "A" | "B" | "empate" {
  const ordem = [
    ...timeA.map((e) => ({ e, time: "A" as const })),
    ...timeB.map((e) => ({ e, time: "B" as const })),
  ]
    .map((x) => ({ ...x, ini: d20(rng) + x.e.ficha.iniciativa }))
    .sort((p, q) => q.ini - p.ini);

  for (let r = 0; r < maxRodadas; r++) {
    for (const { e, time } of ordem) {
      if (!e.vivo || !tickChamas(e, rng)) continue;
      turnoPersonagem(e, time === "A" ? timeB : timeA, rng);
    }
    if (timeB.every((x) => !x.vivo)) return "A";
    if (timeA.every((x) => !x.vivo)) return "B";
  }
  return "empate";
}

// ---------------------------------------------------------------------------
// Relatório
// ---------------------------------------------------------------------------
console.log("═".repeat(78));
console.log("  ORÇAMENTO: 12 PA por ficha — conferido pelo motor (getPaSpent)");
console.log("═".repeat(78));
console.log(
  "FICHA".padEnd(8) + "BUILD".padEnd(46) + "PA".padStart(4) + "PV".padStart(6) + "CA".padStart(4) + "BC".padStart(4)
);

BUILDS.forEach(({ c, descricao }, i) => {
  const pa = getPaSpent(c);
  const f = FICHAS[i];
  const alerta = pa === PA_ALVO ? "" : `  ⚠ ${pa} PA, não ${PA_ALVO}`;
  console.log(
    c.name.padEnd(8) +
      descricao.slice(0, 45).padEnd(46) +
      String(pa).padStart(4) +
      String(f.pvMax).padStart(6) +
      String(f.ca).padStart(4) +
      String(f.bc).padStart(4) +
      alerta
  );
});

console.log("\n" + "─".repeat(78));
console.log("  DANO MÉDIO POR TURNO (3 Ações, melhor ação disponível)");
console.log("─".repeat(78));
for (const f of FICHAS) {
  const melhor = f.acoes.length
    ? f.acoes.reduce((m, a) => (mediaDados(a.dano) / a.acoes > mediaDados(m.dano) / m.acoes ? a : m))
    : f.ataqueBasico;
  const bonus = melhor.nome === "arma simples" ? f.bcSemRank : f.bc;
  const porTurno = (mediaDados(melhor.dano) + bonus) * Math.floor(3 / melhor.acoes);
  console.log(
    f.nome.padEnd(8) +
      melhor.nome.padEnd(24) +
      `${melhor.acoes} Ação/ões`.padEnd(12) +
      `média ${Math.round(porTurno)}/turno`
  );
}

// ---------------------------------------------------------------------------
// 5 × 5 — mesmo orçamento, identidades diferentes
// ---------------------------------------------------------------------------
function novoTime(indices: number[]): EstadoPersonagem[] {
  return indices.map((i) => novoEstado(FICHAS[i]));
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
  for (const e of [...a, ...b]) {
    danoTotal.set(e.nome, (danoTotal.get(e.nome) ?? 0) + e.danoCausado);
    if (e.vivo) sobrevivencia.set(e.nome, (sobrevivencia.get(e.nome) ?? 0) + 1);
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
/** Apêndice G, "Ajustando pra cima": chefe único = dobra o PV da linha, mantém o dano. */
const CHEFES = MOLDES_CRIATURA.filter((m) => m.patamar >= 3 && m.patamar <= 5).map((m) => ({
  nome: `${m.patamar}º — ${m.titulo} (chefe)`,
  pv: m.pv * 2,
  ca: m.ca,
  ataque: m.bonusAtaque,
  danoPorTurno: m.danoPorTurno,
}));

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
    let pvChefe = chefe.pv;
    let rodada = 0;
    for (; rodada < 20; rodada++) {
      for (const e of grupo) {
        if (!e.vivo) continue;
        // Um Alvo NOVO por personagem, de propósito: é o comportamento que este
        // relatório sempre teve, e mexer nele mudaria os números publicados no
        // livro dentro de uma refatoração. O efeito colateral é que Molhado e
        // Em Chamas não persistem de um personagem pro seguinte — ou seja, o
        // combo do mago de Água nunca é contado contra o chefe, e a coluna
        // subestima quem depende dele. Vale corrigir em uma mudança própria,
        // que possa ser lida como recalibragem e não como limpeza.
        const alvoChefe: Alvo = {
          nome: chefe.nome,
          get pv() {
            return pvChefe;
          },
          set pv(v) {
            pvChefe = v;
          },
          ca: chefe.ca,
          vivo: true,
          molhado: false,
          emChamas: 0,
          danoCausado: 0,
        };
        turnoPersonagem(e, [alvoChefe], rng);
      }
      if (pvChefe <= 0) break;
      // Chefe age: uma rodada inteira a cada dois personagens do grupo
      // (Apêndice G, "Ajustando pra cima").
      let restante = chefe.danoPorTurno * rodadasDoChefe(grupo.length);
      for (const alvo of grupo) {
        if (restante <= 0) break;
        if (!alvo.vivo) continue;
        if (d20(rng) + chefe.ataque < alvo.ca) continue;
        const golpe = Math.min(restante, alvo.pv);
        alvo.pv -= golpe;
        restante -= golpe;
        if (alvo.pv <= 0) alvo.vivo = false;
      }
      if (grupo.every((e) => !e.vivo)) break;
    }
    if (pvChefe <= 0) vitorias++;
    somaRodadas += rodada + 1;
    somaMortes += grupo.filter((e) => !e.vivo).length;
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
for (const s of SIMPLIFICACOES) console.log("· " + s);

export {};
