import { AttributeKey, ATTRIBUTES, ATTRIBUTE_CREATION_MAX, SubtableId } from "./types";
import { RACES } from "@/data/races";
import { BACKGROUNDS, SUBTABLES } from "@/data/backgrounds";

/**
 * Peso de sorteio por raça — quanto mais forte mecanicamente, mais raro sortear (Via 2/3).
 * Raças míticas (peso 0) nunca saem no sorteio: só dá pra pegá-las na Via 1 (Manual), com
 * aprovação do Mestre, exatamente como o próprio texto da Raça Dragão já exige.
 *
 * Os pesos foram reordenados na auditoria de balanceamento de 2026-08-28 pra bater com o
 * poder MEDIDO no rank Imperador (a régua e a conta de cada raça estão no cabeçalho de
 * `src/data/races.ts`). Antes eles seguiam a intuição de raridade da obra, não a mecânica, e
 * o resultado estava invertido em quatro pontos: o Celestial (voo — o traço mais forte fora
 * da raça mítica, 3,20 pontos de criação) era mais comum que o Superd; a Raça do Oceano era
 * do tier comum sendo o pacote mais fraco do livro em campanha terrestre; e Migurd e Demônio
 * Imortal ocupavam o tier raro com 2,2, abaixo de raças do tier médio. Três faixas limpas:
 *   5 = comum (~13,9%)  · humano 1,50 · hobbit 1,85 · raça fera 1,85
 *   3 = incomum (~8,3%) · anão 1,75 · demônio imortal 2,23 · migurd 2,25 · elfo 2,32 · oceano 2,35
 *   2 = raro (~5,6%)    · superd 2,70 · ogro 2,80 · celestial 3,20
 */
export const RACE_WEIGHT: Record<string, number> = {
  humano: 5,
  hobbit: 5,
  "raca-fera": 5,
  elfo: 3,
  anao: 3,
  oceano: 3,
  migurd: 3,
  "demonio-imortal": 3,
  celestial: 2,
  superd: 2,
  ogro: 2,
  dragao: 0,
};

/**
 * Cap. 1, §5: a Raça Dragão entra no sorteio (2026-08-29) com chance FIXA de 1%,
 * fora da tabela de pesos.
 *
 * É tratada separadamente de propósito. Encaixá-la em RACE_WEIGHT exigiria um
 * peso fracionário (0,36 no total de 36) ou multiplicar todos os outros pesos
 * por 11 pra a conta fechar em 400 — nos dois casos o número "1%" ficaria
 * escondido numa divisão, e a primeira mudança de peso de qualquer outra raça o
 * quebraria em silêncio. Aqui ele é literal e não depende de mais nada.
 */
export const DRAGON_CHANCE = 0.01;
const DRAGON_ID = "dragao";

/** As raças da tabela de pesos — o Dragão fica de fora, ver DRAGON_CHANCE. */
function weightedRacePool() {
  return RACES.filter((r) => r.id !== DRAGON_ID && (RACE_WEIGHT[r.id] ?? 1) > 0);
}

/** Sorteia um resultado de raça pra Via 2/3 — pesado por raridade (ver RACE_WEIGHT), nunca uniforme. */
export function rollRandomRace(): string {
  if (Math.random() < DRAGON_CHANCE) return DRAGON_ID;
  const pool = weightedRacePool();
  const totalWeight = pool.reduce((sum, r) => sum + (RACE_WEIGHT[r.id] ?? 1), 0);
  let roll = Math.random() * totalWeight;
  for (const race of pool) {
    roll -= RACE_WEIGHT[race.id] ?? 1;
    if (roll <= 0) return race.id;
  }
  return pool[pool.length - 1].id;
}

/**
 * Aplica a chance fixa de 1% da Raça Dragão sobre um resultado que já veio de
 * outra via de sorteio. Existe pra Entrevista do Destino (Via 3), que tem
 * loteria própria — enviesada pelas respostas — e por isso não pode simplesmente
 * chamar `rollRandomRace`. Rolar o 1% por fora garante que ele seja exatamente
 * 1% em qualquer combinação de respostas, em vez de variar com o viés.
 */
export function applyDragonChance(raceId: string): string {
  return Math.random() < DRAGON_CHANCE ? DRAGON_ID : raceId;
}

/** IDs das raças que podem realmente sair no sorteio — usado pra desenhar a Roleta do Destino sem duplicar a tabela de pesos. */
export function getRollableRaceIds(): string[] {
  return [...weightedRacePool().map((r) => r.id), DRAGON_ID];
}

/** Chance real (0–1) de cada raça sortável sair na Roleta — mesma tabela usada em rollRandomRace, só que exposta pra UI mostrar a probabilidade em vez de escondê-la. */
export function getRaceProbabilities(): { id: string; probability: number }[] {
  const pool = weightedRacePool();
  const totalWeight = pool.reduce((sum, r) => sum + (RACE_WEIGHT[r.id] ?? 1), 0);
  // O Dragão come 1% fechado; as demais dividem os 99% restantes na proporção
  // dos pesos, então a soma da lista continua sendo exatamente 1.
  return [
    ...pool.map((r) => ({
      id: r.id,
      probability: ((RACE_WEIGHT[r.id] ?? 1) / totalWeight) * (1 - DRAGON_CHANCE),
    })),
    { id: DRAGON_ID, probability: DRAGON_CHANCE },
  ];
}

/** Rola 1d100 na tabela de Antecedentes do Cap. 1 (mesmo rollRange já usado no livro) — respeita o peso canônico de cada resultado. */
export function rollRandomBackground(): string {
  const roll = 1 + Math.floor(Math.random() * 100);
  const match = BACKGROUNDS.find((b) => roll >= b.rollRange[0] && roll <= b.rollRange[1]);
  return (match ?? BACKGROUNDS[0]).id;
}

/**
 * Sorteia uma distribuição de atributos respeitando o Cap. 1: 2 pontos base, com chance de
 * pegar o defeito de -1 (ganha +1 ponto) e, só se já pegou o de -1, chance de pegar o de -2
 * num atributo diferente (ganha +2 pontos). Distribui o orçamento resultante aleatoriamente,
 * respeitando o teto de criação (4) por atributo.
 *
 * 2026-08-30: 4 → 2 pontos pra alinhar com o point-buy manual. Bônus de Raça/Antecedente
 * NÃO entram aqui (são empilhados por fora, em sorteio separado ou escolha manual).
 */
export function rollRandomAttributes(): Record<AttributeKey, number> {
  const keys = ATTRIBUTES.map((a) => a.key);
  const base: Record<AttributeKey, number> = { forca: 0, agilidade: 0, vigor: 0, intelecto: 0, espirito: 0 };

  let budget = 2;
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

/** Rola qualquer sub-tabela de antecedente (Miko 1d8, Olho 1d10, Fator Laplace 1d4) — cada resultado tem o mesmo peso, como o dado físico que ela representa. */
export function rollRandomSubtableEntry(table: SubtableId): string {
  const source = SUBTABLES[table].entries;
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
