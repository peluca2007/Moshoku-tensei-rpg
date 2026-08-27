import { AttributeKey, ATTRIBUTES, ATTRIBUTE_CREATION_MAX } from "./types";
import { RACES } from "@/data/races";
import { BACKGROUNDS } from "@/data/backgrounds";

/** Sorteia um resultado de raça pra Via 2/3 de criação — todas as raças têm o mesmo peso, como um dado justo. */
export function rollRandomRace(): string {
  return RACES[Math.floor(Math.random() * RACES.length)].id;
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

export interface RandomCharacterResult {
  raceId: string;
  backgroundId: string;
  attributeBase: Record<AttributeKey, number>;
}

/** Via 2 (Roleta): gira raça, antecedente e atributos de uma vez — o jogador só escolheu Árvore Inicial e Perícias antes disso. */
export function rollRandomCharacter(): RandomCharacterResult {
  return {
    raceId: rollRandomRace(),
    backgroundId: rollRandomBackground(),
    attributeBase: rollRandomAttributes(),
  };
}
