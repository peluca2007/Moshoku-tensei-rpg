/**
 * Quantos turnos você aguenta? — `npm run check:sobrevivencia`
 *
 * ## A pergunta
 *
 * O projeto mede o lado que bate: `check:arvores` compara o teto do turno com a
 * régua do Apêndice C, e `check:progressao` mede dano por Ação. Nenhum dos dois
 * olha para o outro lado da mesa — **a reserva de PV contra o dano que vem de
 * volta**. E era justamente o lado onde o livro não tinha número nenhum: os PV
 * saem de dezenove escadas de Dado de PV escritas árvore a árvore, sem nada
 * comparando uma com a outra nem com o inimigo do patamar.
 *
 * Este check responde duas coisas:
 *
 * 1. **As três faixas se cruzam?** Magia, Utilidade e Corpo deviam ocupar
 *    faixas de PV que não se tocam — é isso que faz "abrir uma escola de magia"
 *    custar o corpo. Antes de 2026-09-13 elas se cruzavam: Terra fechava o
 *    Imperador com 99 PV contra 100 da Arquearia, a árvore de Corpo mais
 *    frágil do livro.
 * 2. **Quantos turnos cada árvore aguenta?** PV dividido pelo `danoPorTurno` do
 *    molde de criatura do MESMO patamar (Apêndice G). Abaixo de 1,00 significa
 *    que uma criatura do seu patamar, focando em você, derruba antes de você
 *    agir de novo.
 *
 * ## O denominador é o molde, não a régua do Apêndice C
 *
 * A régua do C mede o que um PERSONAGEM entrega no turno, e usá-la aqui seria
 * medir sobrevivência contra um duelo entre jogadores — que não é o que a mesa
 * joga. O molde do Apêndice G (10/20/35/55/80/120) é o inimigo que o Mestre
 * monta, e é o dano que realmente chega na ficha.
 *
 * ## O que ele NÃO mede
 *
 * Foco total num alvo só (o pior caso, e é de propósito), nenhuma cura, nenhuma
 * Barreira, nenhum Touki, nenhuma esquiva. É o PISO da sobrevivência, não a
 * expectativa. Um número abaixo de 1,00 não reprova nada — significa que aquela
 * árvore DEPENDE de uma dessas coisas pra existir no patamar, e isso é uma
 * decisão de design que tem que ser tomada olhando o número.
 *
 * Ele imprime e sai com 0, como o `check:progressao`.
 */
import { MOLDES_CRIATURA } from "@/data/bestiary";
import { TREES } from "@/data/trees";
import { getMaxHp } from "@/store/selectors";
import { AttributeKey, CharacterData } from "@/lib/types";

/**
 * Os SEIS patamares que toda árvore tem.
 *
 * `RANKS` tem sete — o sétimo é o Rank Deus, que não é um patamar comprável:
 * é um quadro à parte, sem Dado de PV e sem molde de criatura correspondente
 * no Apêndice G. Iterar por `RANKS` aqui inventaria uma sétima coluna que
 * repete a sexta e divide por um molde que não existe.
 */
const PATAMARES = [1, 2, 3, 4, 5, 6];

/** Os três Vigores que valem a pena olhar: o dump, o comum e o do tanque. */
const VIGORES = [0, 2, 4];

const ZERO: Record<AttributeKey, number> = {
  forca: 0,
  agilidade: 0,
  vigor: 0,
  intelecto: 0,
  espirito: 0,
};

/**
 * Uma ficha com os N primeiros patamares de UMA árvore abertos e nada mais.
 *
 * Sem raça, sem antecedente e sem talento de propósito: tudo isso soma PV fora
 * do Fator de Vigor (Cap. 4) e entraria igual em qualquer árvore, empurrando as
 * dezenove curvas pra cima sem mudar a comparação entre elas.
 */
function fichaAte(treeId: string, patamares: number, vigor: number): CharacterData {
  const tree = TREES.find((t) => t.id === treeId)!;
  return {
    id: "s",
    name: "Sobrevivência",
    lore: "",
    raceId: null,
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: { ...ZERO, vigor },
    raceAttributeChoices: [],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: treeId,
    unlockedRanks: tree.ranks.slice(0, patamares).map((r) => ({ treeId, rank: r.rank })),
    purchasedAbilities: [],
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
    condicoes: [],
    descansosCurtos: 0,
    overrides: {},
  } as unknown as CharacterData;
}

const PILARES = ["magia", "utilidade", "corpo"] as const;
type Pilar = (typeof PILARES)[number];

const arvores = TREES.filter((t) => (PILARES as readonly string[]).includes(t.category)).sort(
  (a, b) =>
    PILARES.indexOf(a.category as Pilar) - PILARES.indexOf(b.category as Pilar) ||
    a.id.localeCompare(b.id)
);

console.log("=".repeat(78));
console.log("  SOBREVIVÊNCIA — PV contra o molde de criatura do mesmo patamar");
console.log("=".repeat(78));
console.log(
  "\n  Molde do Apêndice G, dano por turno: " +
    MOLDES_CRIATURA.map((m) => `${m.patamar}º=${m.danoPorTurno}`).join("  ")
);

// ---------------------------------------------------------------------------
//  1. As três faixas de PV
// ---------------------------------------------------------------------------
console.log("\n" + "-".repeat(78));
console.log("  1. AS TRÊS FAIXAS DE PV (Vigor 0, acumulado até o patamar)");
console.log("-".repeat(78));

const pvDe = new Map<string, number[]>();
for (const t of arvores) {
  pvDe.set(
    t.id,
    PATAMARES.map((n) => getMaxHp(fichaAte(t.id, n, 0)))
  );
}

console.log("\n  " + "PILAR / ÁRVORE".padEnd(28) + PATAMARES.map((n) => `${n}º`.padStart(6)).join(""));
for (const t of arvores) {
  console.log(
    `  ${t.category.padEnd(10)} ${t.id.slice(0, 16).padEnd(16)}` +
      pvDe
        .get(t.id)!
        .map((v) => String(v).padStart(6))
        .join("")
  );
}

const faixa = (p: Pilar, i: number) => {
  const vs = arvores.filter((t) => t.category === p).map((t) => pvDe.get(t.id)![i]);
  return { min: Math.min(...vs), max: Math.max(...vs) };
};

console.log("\n  Faixa de cada pilar, por patamar:");
let cruzamentos = 0;
for (let i = 0; i < PATAMARES.length; i++) {
  const m = faixa("magia", i);
  const u = faixa("utilidade", i);
  const c = faixa("corpo", i);
  // A ordem que o livro promete: toda árvore de magia abaixo de toda de corpo.
  const cruza = m.max >= c.min;
  if (cruza) cruzamentos++;
  console.log(
    `    ${i + 1}º  Magia ${`${m.min}-${m.max}`.padEnd(9)} Utilidade ${`${u.min}-${u.max}`.padEnd(9)} ` +
      `Corpo ${`${c.min}-${c.max}`.padEnd(9)} ${cruza ? "AVISO: a magia alcanca o corpo" : "ok"}`
  );
}

// ---------------------------------------------------------------------------
//  2. Turnos de vida
// ---------------------------------------------------------------------------
console.log("\n" + "-".repeat(78));
console.log("  2. TURNOS DE VIDA — PV ÷ dano por turno do molde do mesmo patamar");
console.log("-".repeat(78));
console.log("  Abaixo de 1,00 = uma criatura do seu patamar derruba antes de você agir.");

const abaixoDeUm: string[] = [];
for (const vigor of VIGORES) {
  console.log(`\n  Vigor ${vigor}:`);
  console.log("  " + "PILAR".padEnd(28) + PATAMARES.map((n) => `${n}º`.padStart(7)).join(""));
  for (const p of PILARES) {
    const daFaixa = arvores.filter((t) => t.category === p);
    const medias = PATAMARES.map((n) => {
      const i = n - 1;
      const vs = daFaixa.map((t) => {
        const turnos = getMaxHp(fichaAte(t.id, i + 1, vigor)) / MOLDES_CRIATURA[i].danoPorTurno;
        if (turnos < 1) {
          abaixoDeUm.push(`Vigor ${vigor} · ${t.id.padEnd(16)} · ${i + 1}º = ${turnos.toFixed(2)}`);
        }
        return turnos;
      });
      return vs.reduce((s, v) => s + v, 0) / vs.length;
    });
    console.log(
      `  ${p.padEnd(10)} (média de ${String(daFaixa.length).padStart(2)})   ` +
        medias.map((v) => v.toFixed(2).padStart(7)).join("")
    );
  }
}

console.log("\n" + "=".repeat(78));
console.log(`  Patamares em que a Magia alcança o Corpo em PV: ${cruzamentos} de ${PATAMARES.length}`);
console.log(`  Casos que caem dentro de um turno do molde:     ${abaixoDeUm.length}`);
console.log("=".repeat(78));
if (abaixoDeUm.length) {
  console.log("\n  Os casos (Vigor · árvore · patamar · turnos):");
  for (const c of abaixoDeUm) console.log(`    · ${c}`);
}
console.log(
  "\nEste check NÃO reprova. Ele não conta cura, Barreira, Touki nem esquiva, e\n" +
    "pressupõe foco total num alvo só — é o PISO da sobrevivência. Um número abaixo\n" +
    "de 1,00 diz que aquela árvore DEPENDE do grupo pra existir naquele patamar."
);
