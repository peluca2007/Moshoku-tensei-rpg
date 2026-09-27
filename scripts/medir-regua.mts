/**
 * A RÉGUA DO APÊNDICE C, MEDIDA PELO SIMULADOR — `npm run medir:regua`.
 *
 * O Apêndice C ("Dano por Turno — Comparando Árvores") foi escrito à mão, e
 * cada rodada de balanço (truques de escola, capstones, a Luz Absoluta, os
 * moldes de criatura) o deixava pra trás sem ninguém ver. Este script mede cada
 * coluna com o MESMO motor do /encontros: um personagem de cada árvore, subido
 * patamar a patamar, joga três turnos contra um alvo com a CA do molde do
 * patamar (Apêndice G), e a média de dano por turno é o número da régua.
 *
 * O personagem: todos os ranks da árvore até o patamar, todas as técnicas e
 * magias desses ranks, os atributos de ataque na régua do próprio Apêndice C
 * (4 no 1º, 8 no 6º) e Vigor 2. É o teto honesto de quem vive naquela árvore.
 *
 * O que ele NÃO mede, e por isso fica de fora ou com nota escrita à mão: as
 * colunas que o livro marca como não sendo régua (`regua: false`), a Dose da
 * Desintoxicação, os invocados, o Suishin (que só reage), e área — o alvo é um
 * só, então a magia de área aparece pelo que faz num alvo.
 *
 * Imprime a tabela medida ao lado da escrita, e marca onde as duas se afastam
 * mais de 25%. Com `--escrever`, atualiza os números de `danoPorTurno.ts` nas
 * colunas medidas que não têm nota (as que têm, como "~44 com o combo",
 * continuam à mão).
 *
 * ## Por que a régua NÃO é gerada por isto (medido em 2026-09-27)
 *
 * O número depende de hipóteses que a régua escrita escolhe e o motor não: a
 * janela (em 3 turnos a magia de 4 Ações sai uma vez; em 6, o PM acaba e a
 * magia de topo cai pra metade), o alvo único (a área some), e o que o motor
 * não vê (o requisito da técnica — alvo Agarrado, 6 m de corrida —, o Tático e
 * o Bardo, a Dose, os invocados). O script é a CONFERÊNCIA da régua: diz onde a
 * mão e o motor se afastam, e alguém decide. RODADAS=3 ou RODADAS=6 no ambiente
 * mostra as duas janelas.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { COLUNAS_CORPO, COLUNAS_MAGIA, DANO_POR_TURNO_CORPO, DANO_POR_TURNO_MAGIA } from "@/data/danoPorTurno";
import { MOLDES_CRIATURA } from "@/data/bestiary";
import { TREES } from "@/data/trees";
import { makeRng, montarFicha, novoAlvo, novoEstado, tickChamas, tickSustentado, turnoPersonagem } from "@/lib/combatSim";
import { type AttributeKey, type CharacterData, RANKS } from "@/lib/types";

const RODADAS = Number(process.env.RODADAS ?? 6);
const REPETICOES = Number(process.env.REPETICOES ?? 300);
const ATRIBUTO = [4, 4, 5, 6, 7, 8];
/** O que este motor não sabe medir (ver o cabeçalho). */
const FORA = new Set(["desintoxicacao", "invocacao", "deus-da-agua-corpo", "cura"]);

function personagem(treeId: string, patamar: number): CharacterData {
  const tree = TREES.find((t) => t.id === treeId)!;
  const ranks = tree.ranks.filter((r) => RANKS.indexOf(r.rank) < patamar);
  const a = ATRIBUTO[patamar - 1];
  const atributos: Record<AttributeKey, number> = { forca: a, agilidade: a, vigor: 2, intelecto: a, espirito: a };
  return {
    id: "regua",
    name: "Régua",
    lore: "",
    raceId: null,
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: atributos,
    raceAttributeChoices: [],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: treeId,
    unlockedRanks: ranks.map((r) => ({ treeId, rank: r.rank })),
    purchasedAbilities: ranks.flatMap((r) => [
      ...(r.abilities ?? []).map((x) => ({ kind: "ability" as const, treeId, rank: r.rank, id: x.id })),
      ...(r.talents ?? []).map((x) => ({ kind: "talent" as const, treeId, rank: r.rank, id: x.id })),
    ]),
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

function medir(treeId: string, patamar: number): number {
  const c = personagem(treeId, patamar);
  const ca = MOLDES_CRIATURA[patamar - 1].ca;
  let total = 0;
  for (let i = 0; i < REPETICOES; i++) {
    const rng = makeRng(1000 + i);
    const e = novoEstado(montarFicha(c));
    const PV = 1_000_000;
    const alvo = novoAlvo({ nome: "alvo", pv: PV, ca });
    for (let t = 0; t < RODADAS; t++) {
      turnoPersonagem(e, [alvo], rng);
      // O turno do alvo: é nele que o dano sustentado e o Em Chamas cobram.
      tickChamas(alvo, rng);
      tickSustentado(alvo);
    }
    total += (PV - alvo.pv) / RODADAS;
  }
  return total / REPETICOES;
}

const escrever = process.argv.includes("--escrever");
let fonte = readFileSync("src/data/danoPorTurno.ts", "utf-8");
const PATAMARES = ["1º", "2º", "3º", "4º", "5º", "6º"];

for (const [titulo, colunas, linhas] of [
  ["Magia", COLUNAS_MAGIA, DANO_POR_TURNO_MAGIA],
  ["Corpo", COLUNAS_CORPO, DANO_POR_TURNO_CORPO],
] as const) {
  console.log(`\n## ${titulo} — medido / escrito`);
  for (const col of colunas) {
    if (col.regua === false || FORA.has(col.treeId)) continue;
    const celulas: string[] = [];
    PATAMARES.forEach((p, i) => {
      const escrito = linhas.find((l) => l.patamar === p)?.porArvore[col.treeId] ?? "—";
      const medido = Math.round(medir(col.treeId, i + 1));
      const numero = Number(/^~(\d+)$/.exec(escrito)?.[1]);
      const longe = numero && Math.abs(medido - numero) / numero > 0.25 ? "  ⚠" : "";
      celulas.push(`${p} ${medido} / ${escrito}${longe}`);
      if (escrever && numero) {
        // Troca SÓ o número sem nota daquela coluna naquela linha.
        const linha = new RegExp(`(\\{ patamar: "${p}", porArvore: \\{[^}]*?"?${col.treeId}"?: )"~${numero}"`);
        fonte = fonte.replace(linha, `$1"~${medido}"`);
      }
    });
    console.log(`${col.label.padEnd(12)} ${celulas.join(" | ")}`);
  }
}
if (escrever) {
  writeFileSync("src/data/danoPorTurno.ts", fonte);
  console.log("\nsrc/data/danoPorTurno.ts atualizado (só as células sem nota).");
}
