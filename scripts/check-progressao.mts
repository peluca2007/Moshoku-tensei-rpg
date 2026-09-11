/**
 * A progressão entrega o que promete? — `npm run check:progressao`
 *
 * ## A pergunta
 *
 * Um sistema de progressão faz uma promessa implícita: **subir de rank tem que
 * valer a pena**. Este check mede isso com a única moeda que o combate deste
 * livro gasta — a **Ação** — e responde duas coisas que nenhum outro check do
 * projeto responde:
 *
 * 1. **A capstone compensa?** A melhor técnica de um rank alto tem que render
 *    mais por Ação que a melhor de um rank baixo da MESMA árvore. Quando não
 *    rende, o jogador que chegou lá destrava uma habilidade que nunca vai usar.
 * 2. **As classes estão no mesmo campeonato?** O teto de dano por Ação de uma
 *    árvore de Corpo contra o de uma de Magia.
 *
 * ## Por que "por Ação" e não "por turno"
 *
 * O Apêndice C mede o MAIOR GOLPE de cada árvore, e o `check:livro` já verifica
 * aquilo. Mas o maior golpe não diz o que o turno rende: uma magia de 14d12 que
 * custa 6 Ações leva dois turnos pra sair, e o turno tem 3. Só dividindo pelo
 * custo em Ações é que "Sol Menor" e "Prensa" passam a ser comparáveis.
 *
 * ## Isto NÃO reprova o build
 *
 * Ele imprime e sai com 0 mesmo achando coisa. As duas perguntas acima são de
 * DESIGN, e a resposta certa pode muito bem ser "sim, a magia rende menos por
 * Ação de propósito, porque compra alcance de 90m, área e condição — nada disso
 * pontua aqui". O que o check garante é que a decisão seja tomada olhando o
 * número, e não descoberta seis meses depois numa mesa.
 */
import { COLUNAS_CORPO, COLUNAS_MAGIA } from "@/data/danoPorTurno";
import { TREES } from "@/data/trees";
import { acoesDe, danoEsperado, montarFicha, novoAlvo, novoEstado } from "@/lib/combatSim";
import { AttributeKey, CharacterData, RANKS } from "@/lib/types";

const ZERO: Record<AttributeKey, number> = {
  forca: 0,
  agilidade: 0,
  vigor: 0,
  intelecto: 0,
  espirito: 0,
};

/**
 * O boneco de referência: CA 15, o molde de 3º patamar do Apêndice G.
 *
 * "Dano por Ação" só existe CONTRA alguém — a chance de errar depende da CA —, e
 * o meio da tabela é o alvo que menos distorce a comparação entre uma árvore que
 * rola ataque e uma que cobra teste de resistência.
 */
const BONECO = () => novoAlvo({ nome: "referência (CA 15)", pv: 1_000_000, ca: 15 });

/** Um personagem com a árvore inteira comprada, pra varrer o teto de cada rank. */
function comArvoreInteira(treeId: string): CharacterData {
  const tree = TREES.find((t) => t.id === treeId)!;
  return {
    id: "t",
    name: "Varredura",
    lore: "",
    raceId: null,
    backgroundId: null,
    subtableEntryId: null,
    // Atributos iguais pra todas as árvores: o que se compara aqui é a ÁRVORE,
    // e um Intelecto maior que a Força inclinaria a mesa antes da primeira conta.
    attributeBase: { ...ZERO, forca: 5, agilidade: 5, vigor: 4, intelecto: 5, espirito: 5 },
    raceAttributeChoices: [],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: treeId,
    unlockedRanks: tree.ranks.map((r) => ({ treeId, rank: r.rank })),
    purchasedAbilities: tree.ranks.flatMap((r) =>
      (r.abilities ?? []).map((a) => ({ kind: "ability" as const, treeId, rank: r.rank, id: a.id }))
    ),
    purchasedCombinedSpells: [],
    gold: 0,
    inventory: [],
    skills: [],
    treeSkillChoices: [],
    proficiencies: [],
    weaponGroupChoices: [],
    bonusHp: 0,
    bonusMp: 0,
    currentHp: null,
    currentMp: null,
    currentPt: null,
    currentPp: null,
    currentCalor: null,
    condicoes: [],
    descansosCurtos: 0,
    overrides: {},
  } as unknown as CharacterData;
}

/** Em que rank cada habilidade mora. */
const rankDaHabilidade = new Map<string, string>();
for (const t of TREES) {
  for (const r of t.ranks) {
    for (const a of r.abilities ?? []) rankDaHabilidade.set(`${t.id}/${a.name}`, r.rank);
  }
}

interface Medida {
  arvore: string;
  pilar: "Magia" | "Corpo" | "Utilidade";
  porRank: Map<string, { nome: string; acoes: number; valor: number }>;
  teto: { nome: string; rank: string; acoes: number; valor: number } | null;
}

const PILAR: Record<string, Medida["pilar"]> = {
  fogo: "Magia",
  agua: "Magia",
  vento: "Magia",
  terra: "Magia",
  cura: "Magia",
  desintoxicacao: "Magia",
  barreira: "Magia",
  invocacao: "Magia",
  "bardo-e-interacao": "Utilidade",
  "navegacao-e-lideranca": "Utilidade",
  "furtividade-e-armadilhas": "Utilidade",
};

function medir(treeId: string): Medida {
  const c = comArvoreInteira(treeId);
  const e = novoEstado(montarFicha(c));
  const alvo = BONECO();
  const porRank = new Map<string, { nome: string; acoes: number; valor: number }>();
  let teto: Medida["teto"] = null;

  for (const a of acoesDe(c)) {
    if (a.tipo !== "dano") continue;
    const rank = rankDaHabilidade.get(`${treeId}/${a.nome}`);
    if (!rank) continue;
    const valor = danoEsperado(e, a, alvo) / a.acoes;
    const atual = porRank.get(rank);
    if (!atual || valor > atual.valor) porRank.set(rank, { nome: a.nome, acoes: a.acoes, valor });
    if (!teto || valor > teto.valor) teto = { nome: a.nome, rank, acoes: a.acoes, valor };
  }
  return { arvore: treeId, pilar: PILAR[treeId] ?? "Corpo", porRank, teto };
}

/*
 * As árvores que o próprio livro diz NÃO serem medida de dano — 0.1.47.
 *
 * O Apêndice C marca quatro colunas com `regua: false`, e diz por quê: Cura,
 * Desintoxicação e Barreira *"não deveriam estar nesta tabela; estão só pra
 * deixar claro que, se você escolher uma delas esperando causar dano, escolheu
 * errado"*; e Escudos *"pressupõe todas as Ações gastas defendendo"*.
 *
 * Cobrar progressão de dano dessas quatro é cobrar uma promessa que elas nunca
 * fizeram — foi o que este check fez na primeira versão, e a Desintoxicação
 * apareceu com uma "queda de 47%" que é, na verdade, a escola sendo o que ela é.
 * A régua do livro já tinha a resposta; faltava o check perguntar.
 */
const NAO_SAO_REGUA_DE_DANO = new Set(
  [...COLUNAS_MAGIA, ...COLUNAS_CORPO].filter((c) => c.regua === false).map((c) => c.treeId)
);

const medidas = TREES.map((t) => medir(t.id)).filter((m) => m.teto !== null);

// ---------------------------------------------------------------------------
console.log("=".repeat(78));
console.log("  DANO ESPERADO POR AÇÃO — o teto de cada rank, contra CA 15");
console.log("=".repeat(78));
console.log("ÁRVORE".padEnd(26) + RANKS.map((r) => r.slice(0, 5).padStart(8)).join(""));
for (const m of medidas) {
  const linha = RANKS.map((r) => {
    const v = m.porRank.get(r);
    return (v ? v.valor.toFixed(1) : "—").padStart(8);
  }).join("");
  console.log(`${m.pilar[0]} ${m.arvore.slice(0, 24).padEnd(24)}${linha}`);
}

// ---------------------------------------------------------------------------
console.log("\n" + "-".repeat(78));
console.log("  1. CAPSTONES QUE NÃO COMPENSAM");
console.log("-".repeat(78));
console.log("  A melhor técnica de um rank alto que rende MENOS por Ação que a de");
console.log("  um rank abaixo, na mesma árvore. Quem chega lá destrava e não usa.");
console.log(
  `  (Fora da conta: ${[...NAO_SAO_REGUA_DE_DANO].join(", ")} — o Apêndice C as marca como\n` +
    "   não sendo medida de dano, e cobrar progressão de dano delas é cobrar\n" +
    "   uma promessa que elas nunca fizeram.)\n"
);

let capstones = 0;
for (const m of medidas) {
  if (NAO_SAO_REGUA_DE_DANO.has(m.arvore)) continue;
  const presentes = RANKS.filter((r) => m.porRank.has(r));
  for (let i = 1; i < presentes.length; i++) {
    const atual = m.porRank.get(presentes[i])!;
    const anterior = m.porRank.get(presentes[i - 1])!;
    if (atual.valor >= anterior.valor) continue;
    capstones++;
    const queda = ((1 - atual.valor / anterior.valor) * 100).toFixed(0);
    console.log(
      `  ${m.arvore.padEnd(24)} ${presentes[i].padEnd(13)} ${atual.nome.slice(0, 26).padEnd(28)}` +
        `${atual.valor.toFixed(1).padStart(6)}/Ação  (${presentes[i - 1]} fazia ${anterior.valor.toFixed(1)}, −${queda}%)`
    );
  }
}
if (capstones === 0) console.log("  Nenhuma. Toda subida de rank melhora o dano por Ação.");

// ---------------------------------------------------------------------------
console.log("\n" + "-".repeat(78));
console.log("  2. O TETO DE CADA PILAR");
console.log("-".repeat(78));
const porPilar = new Map<string, Medida[]>();
for (const m of medidas) porPilar.set(m.pilar, [...(porPilar.get(m.pilar) ?? []), m]);
for (const [pilar, lista] of porPilar) {
  const ordenado = [...lista].sort((a, b) => b.teto!.valor - a.teto!.valor);
  console.log(`\n  ${pilar}:`);
  for (const m of ordenado) {
    const t = m.teto!;
    console.log(
      `    ${t.valor.toFixed(1).padStart(6)}/Ação  ${m.arvore.padEnd(26)} ${t.nome.slice(0, 28).padEnd(30)} ${t.rank.slice(0, 5)} ${t.acoes}A`
    );
  }
}

const tetoDe = (p: string) => Math.max(...(porPilar.get(p) ?? []).map((m) => m.teto!.valor));
const corpo = tetoDe("Corpo");
const magia = tetoDe("Magia");
console.log("\n" + "=".repeat(78));
console.log(
  `  Teto do Corpo: ${corpo.toFixed(1)}/Ação · Teto da Magia: ${magia.toFixed(1)}/Ação · ` +
    `o Corpo rende ${(corpo / magia).toFixed(1)}× por Ação`
);
console.log(`  Capstones que não compensam: ${capstones}`);
console.log("=".repeat(78));
console.log(
  "\nEste check NÃO reprova: as duas perguntas acima são de design. A magia compra\n" +
    "alcance, área e condição que este motor não pontua. O que ele garante é que a\n" +
    "decisão seja tomada olhando o número."
);
