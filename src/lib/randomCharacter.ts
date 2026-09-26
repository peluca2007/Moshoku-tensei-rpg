import { AttributeKey, ATTRIBUTES, ATTRIBUTE_CREATION_MAX, SubtableId } from "./types";
import { RACES } from "@/data/races";
import { BACKGROUNDS, SUBTABLES } from "@/data/backgrounds";

/**
 * A TABELA d100 DE RAÇAS (Cap. 1 §5) — 2026-09-26.
 *
 * Antes o site sorteava por pesos (5/3/2 e o Dragão com 1% por fora) e o livro
 * dizia "a raça sai do d100" sem ter tabela nenhuma: quem jogava sem o site não
 * tinha como rolar. Agora a faixa de cada raça mora em `src/data/races.ts`
 * (`rollRange`), o livro imprime a tabela e o site rola 1d100 nela.
 *
 * As faixas seguem as três raridades da auditoria de 2026-08-28 (quanto mais
 * forte, mais rara): comum 13–14 (Humano, Povo Pequeno, Raça Fera), incomum 8
 * (Elfo, Anão, Oceano, Migurd, Demônio Imortal), rara 6 (Superd, Ogro,
 * Celestial) e o 100 da Raça Dragão, mítica.
 *
 * `RACE_WEIGHT` continua existindo pra loteria da Entrevista do Destino: é a
 * largura da faixa (o Dragão fica de fora e tem o 1% rolado por fora).
 */
const DRAGON_ID = "dragao";
const faixa = (id: string) => RACES.find((r) => r.id === id)?.rollRange;
const largura = (r: [number, number] | undefined) => (r ? r[1] - r[0] + 1 : 0);

export const RACE_WEIGHT: Record<string, number> = Object.fromEntries(
  RACES.map((r) => [r.id, r.id === DRAGON_ID ? 0 : largura(r.rollRange)])
);

/** A chance da Raça Dragão: a largura da faixa dela na tabela (o 100). */
export const DRAGON_CHANCE = largura(faixa(DRAGON_ID)) / 100;

/** Rola 1d100 na tabela de raças do Cap. 1 §5. */
export function rollRandomRace(): string {
  const roll = 1 + Math.floor(Math.random() * 100);
  const raca = RACES.find((r) => r.rollRange && roll >= r.rollRange[0] && roll <= r.rollRange[1]);
  return raca?.id ?? RACES[0].id;
}

/**
 * Aplica a chance da Raça Dragão sobre um resultado que já veio de outra via
 * de sorteio (a Entrevista do Destino, Via 3, que tem loteria própria enviesada
 * pelas respostas). Rolar por fora garante a mesma chance da tabela.
 */
export function applyDragonChance(raceId: string): string {
  return Math.random() < DRAGON_CHANCE ? DRAGON_ID : raceId;
}

/** IDs das raças que podem sair no sorteio, na ordem da tabela — pra desenhar a Roleta. */
export function getRollableRaceIds(): string[] {
  return RACES.filter((r) => r.rollRange).sort((a, b) => a.rollRange![0] - b.rollRange![0]).map((r) => r.id);
}

/** Chance real (0–1) de cada raça: a largura da faixa dela na tabela d100. */
export function getRaceProbabilities(): { id: string; probability: number }[] {
  return getRollableRaceIds().map((id) => ({ id, probability: largura(faixa(id)) / 100 }));
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
