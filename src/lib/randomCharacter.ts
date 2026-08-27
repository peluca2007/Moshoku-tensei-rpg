import { AttributeKey, ATTRIBUTES, ATTRIBUTE_CREATION_MAX } from "./types";
import { RACES } from "@/data/races";
import { BACKGROUNDS, MIKO_TABLE, OLHO_TABLE } from "@/data/backgrounds";

/**
 * Peso de sorteio por raça — quanto mais forte mecanicamente, mais raro sortear (Via 2/3).
 * Raças míticas (peso 0) nunca saem no sorteio: só dá pra pegá-las na Via 1 (Manual), com
 * aprovação do Mestre, exatamente como o próprio texto da Raça Dragão já exige.
 */
const RACE_WEIGHT: Record<string, number> = {
  humano: 5,
  hobbit: 5,
  oceano: 5,
  elfo: 3,
  anao: 3,
  "raca-fera": 3,
  celestial: 3,
  migurd: 2,
  superd: 2,
  ogro: 2,
  "demonio-imortal": 2,
  dragao: 0,
};

/** Sorteia um resultado de raça pra Via 2/3 — pesado por raridade (ver RACE_WEIGHT), nunca uniforme. */
export function rollRandomRace(): string {
  const pool = RACES.filter((r) => (RACE_WEIGHT[r.id] ?? 1) > 0);
  const totalWeight = pool.reduce((sum, r) => sum + (RACE_WEIGHT[r.id] ?? 1), 0);
  let roll = Math.random() * totalWeight;
  for (const race of pool) {
    roll -= RACE_WEIGHT[race.id] ?? 1;
    if (roll <= 0) return race.id;
  }
  return pool[pool.length - 1].id;
}

/** Rola 1d100 na tabela de Antecedentes do Cap. 1 (mesmo rollRange já usado no livro) — respeita o peso canônico de cada resultado. */
export function rollRandomBackground(): string {
  const roll = 1 + Math.floor(Math.random() * 100);
  const match = BACKGROUNDS.find((b) => roll >= b.rollRange[0] && roll <= b.rollRange[1]);
  return (match ?? BACKGROUNDS[0]).id;
}

/**
 * Sorteia uma distribuição de atributos respeitando o Cap. 1: 4 pontos base, com chance de
 * pegar o defeito de -1 (ganha +1 ponto) e, só se já pegou o de -1, chance de pegar o de -2
 * num atributo diferente (ganha +2 pontos). Distribui o orçamento resultante aleatoriamente,
 * respeitando o teto de criação (4) por atributo.
 */
export function rollRandomAttributes(): Record<AttributeKey, number> {
  const keys = ATTRIBUTES.map((a) => a.key);
  const base: Record<AttributeKey, number> = { forca: 0, agilidade: 0, vigor: 0, intelecto: 0, espirito: 0 };

  let budget = 4;
  const shuffled = [...keys].sort(() => Math.random() - 0.5);
  if (Math.random() < 0.35) {
    base[shuffled[0]] = -1;
    budget += 1;
    if (Math.random() < 0.2) {
      base[shuffled[1]] = -2;
      budget += 2;
    }
  }

  // Mesma trava do wizard manual (Cap. 1): só pode existir UM atributo em -1 e UM em -2 a
  // qualquer momento — recomprar o defeito de -2 até -1 não pode colidir com o -1 já escolhido.
  let safety = 0;
  while (budget > 0 && safety < 2000) {
    safety++;
    const key = keys[Math.floor(Math.random() * keys.length)];
    if (base[key] >= ATTRIBUTE_CREATION_MAX) continue;
    const nextValue = base[key] + 1;
    if (nextValue === -1 && keys.some((k) => k !== key && base[k] === -1)) continue;
    base[key] = nextValue;
    budget -= 1;
  }

  return base;
}

/** Rola a subtabela de Miko (1d8) ou Olho Místico (1d10) — cada resultado tem o mesmo peso, como o dado físico que ela representa. */
export function rollRandomSubtableEntry(table: "miko" | "olho"): string {
  const source = table === "miko" ? MIKO_TABLE : OLHO_TABLE;
  return source[Math.floor(Math.random() * source.length)].id;
}

export interface RandomCharacterResult {
  raceId: string;
  backgroundId: string;
  /** Preenchido só quando o Antecedente sorteado exige subtabela (Miko ou Olho Místico). */
  subtableEntryId: string | null;
  attributeBase: Record<AttributeKey, number>;
}

/** Via 2 (Roleta): gira raça, antecedente, subtabela (se aplicável) e atributos de uma vez. */
export function rollRandomCharacter(): RandomCharacterResult {
  const backgroundId = rollRandomBackground();
  const background = BACKGROUNDS.find((b) => b.id === backgroundId);
  return {
    raceId: rollRandomRace(),
    backgroundId,
    subtableEntryId: background?.requiresSubtable ? rollRandomSubtableEntry(background.requiresSubtable) : null,
    attributeBase: rollRandomAttributes(),
  };
}
