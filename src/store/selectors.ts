import { getRaceById } from "@/data/races";
import { getBackgroundById, getSubtableEntryById } from "@/data/backgrounds";
import { getTreeById } from "@/data/trees";
import { AttributeKey, ATTRIBUTES, CharacterData, RANK_BONUS, RANK_REQUIREMENTS, RANKS, RankName } from "@/lib/types";

type StoreState = CharacterData;

type Check = { ok: boolean; reason?: string };
const OK: Check = { ok: true };

/** Soma os bônus fixos de raça, antecedente e sub-tabela (Miko/Olho) para um atributo. */
export function getFinalAttribute(state: StoreState, key: AttributeKey): number {
  const race = getRaceById(state.raceId);
  const background = getBackgroundById(state.backgroundId);
  const subtable = background?.requiresSubtable
    ? getSubtableEntryById(background.requiresSubtable, state.subtableEntryId)
    : undefined;

  const base = state.attributeBase[key] ?? 0;
  const raceBonus = race?.bonuses.attributes?.[key] ?? 0;
  const backgroundBonus = background?.bonuses.attributes?.[key] ?? 0;
  const subtableBonus = subtable?.bonuses.attributes?.[key] ?? 0;

  return base + raceBonus + backgroundBonus + subtableBonus;
}

export function getFinalAttributes(state: StoreState): Record<AttributeKey, number> {
  return Object.fromEntries(
    ATTRIBUTES.map(({ key }) => [key, getFinalAttribute(state, key)])
  ) as Record<AttributeKey, number>;
}

function getFlatBonusSum(state: StoreState, field: "maxHp" | "maxMp"): number {
  const race = getRaceById(state.raceId);
  const background = getBackgroundById(state.backgroundId);
  const subtable = background?.requiresSubtable
    ? getSubtableEntryById(background.requiresSubtable, state.subtableEntryId)
    : undefined;

  return (
    (race?.bonuses[field] ?? 0) +
    (background?.bonuses[field] ?? 0) +
    (subtable?.bonuses[field] ?? 0)
  );
}

const RANKS_DESCENDING = [...RANKS].reverse();

/** Rank mais alto já desbloqueado numa árvore (undefined se nenhum). */
export function getHighestUnlockedRank(state: StoreState, treeId: string): RankName | undefined {
  const unlocked = new Set(
    state.unlockedRanks.filter((r) => r.treeId === treeId).map((r) => r.rank)
  );
  return RANKS_DESCENDING.find((r) => unlocked.has(r));
}

/**
 * PV Máximos (Nível 1): valor máximo do dado da Árvore Inicial + Vigor final
 * + bônus fixos de raça/antecedente/sub-tabela.
 */
export function getMaxHp(state: StoreState): number {
  const startingTree = getTreeById(state.startingTreeId);
  const treeDie = startingTree?.hpDieMax ?? 0;
  const vigor = getFinalAttribute(state, "vigor");
  return treeDie + vigor + getFlatBonusSum(state, "maxHp");
}

/**
 * PM Máximos: soma do PM por rank de CADA rank desbloqueado em CADA árvore
 * + bônus fixos de raça/antecedente/sub-tabela.
 */
export function getMaxMp(state: StoreState): number {
  const treeMp = state.unlockedRanks.reduce((total, unlocked) => {
    const tree = getTreeById(unlocked.treeId);
    const rankDef = tree?.ranks.find((r) => r.rank === unlocked.rank);
    return total + (rankDef?.mpPerRank ?? 0);
  }, 0);
  return treeMp + getFlatBonusSum(state, "maxMp");
}

/** CA = 10 + Agilidade final. */
export function getArmorClass(state: StoreState): number {
  return 10 + getFinalAttribute(state, "agilidade");
}

/** Iniciativa = 1d20 + Agilidade; Escudeiro/Treino Precoce dá Vantagem. */
export function getInitiative(state: StoreState): { bonus: number; hasAdvantage: boolean } {
  const background = getBackgroundById(state.backgroundId);
  return {
    bonus: getFinalAttribute(state, "agilidade"),
    hasAdvantage: background?.grantsInitiativeAdvantage ?? false,
  };
}

/** CD da Habilidade = 8 + Atributo + Bônus do Rank daquela árvore (Cap. 1, seção 7). */
export function getSpellDC(state: StoreState, treeId: string, attribute: AttributeKey = "intelecto"): number {
  const rank = getHighestUnlockedRank(state, treeId);
  const rankBonus = rank ? RANK_BONUS[rank] : 0;
  return 8 + getFinalAttribute(state, attribute) + rankBonus;
}

/** Bônus de Ataque = Atributo + Bônus do Rank daquela árvore (some 1d20 na hora de rolar). */
export function getAttackBonus(state: StoreState, treeId: string, attribute: AttributeKey = "intelecto"): number {
  const rank = getHighestUnlockedRank(state, treeId);
  const rankBonus = rank ? RANK_BONUS[rank] : 0;
  return getFinalAttribute(state, attribute) + rankBonus;
}

/** Quantos "conhecimentos" (magias/talentos) o personagem já tem numa árvore. */
export function getKnowledgeCount(state: StoreState, treeId: string): number {
  return state.purchasedAbilities.filter((a) => a.treeId === treeId).length;
}

function findAbilityOrTalentDef(treeId: string, rank: RankName, kind: "ability" | "talent", id: string) {
  const rankDef = getTreeById(treeId)?.ranks.find((r) => r.rank === rank);
  return kind === "ability"
    ? rankDef?.abilities.find((a) => a.id === id)
    : rankDef?.talents.find((t) => t.id === id);
}

/** PA já gastos: desbloqueios de rank + magias/talentos comprados, em todas as árvores. */
export function getPaSpent(state: StoreState): number {
  const rankCost = state.unlockedRanks.reduce(
    (sum, u) => sum + RANK_REQUIREMENTS[u.rank].paCost,
    0
  );
  const abilityCost = state.purchasedAbilities.reduce((sum, a) => {
    const def = findAbilityOrTalentDef(a.treeId, a.rank, a.kind, a.id);
    return sum + (def?.paCost ?? 0);
  }, 0);
  return rankCost + abilityCost;
}

export function getPaRemaining(state: StoreState): number {
  return state.paEarned - getPaSpent(state);
}

/**
 * Pode desbloquear este rank? Exige (Cap. 1, seção 3): rank anterior já
 * desbloqueado na mesma árvore, conhecimentos suficientes, e PA disponível.
 */
export function canUnlockRank(state: StoreState, treeId: string, rank: RankName): Check {
  if (state.unlockedRanks.some((r) => r.treeId === treeId && r.rank === rank)) {
    return { ok: false, reason: "Rank já desbloqueado." };
  }

  const rankIndex = RANKS.indexOf(rank);
  if (rankIndex > 0) {
    const previousRank = RANKS[rankIndex - 1];
    const hasPrevious = state.unlockedRanks.some(
      (r) => r.treeId === treeId && r.rank === previousRank
    );
    if (!hasPrevious) return { ok: false, reason: `Desbloqueie ${previousRank} antes.` };
  }

  const requirement = RANK_REQUIREMENTS[rank];
  const knowledge = getKnowledgeCount(state, treeId);
  if (knowledge < requirement.knowledgeRequired) {
    return {
      ok: false,
      reason: `Precisa de ${requirement.knowledgeRequired} conhecimento(s) nesta árvore (tem ${knowledge}).`,
    };
  }

  if (getPaRemaining(state) < requirement.paCost) {
    return { ok: false, reason: `PA insuficiente (custa ${requirement.paCost} PA).` };
  }

  return OK;
}

/** Pode comprar esta magia/talento? Exige o rank já desbloqueado e PA disponível. */
export function canPurchaseAbility(
  state: StoreState,
  treeId: string,
  rank: RankName,
  kind: "ability" | "talent",
  id: string
): Check {
  const rankUnlocked = state.unlockedRanks.some((r) => r.treeId === treeId && r.rank === rank);
  if (!rankUnlocked) return { ok: false, reason: "Rank ainda não desbloqueado nesta árvore." };

  if (state.purchasedAbilities.some((a) => a.treeId === treeId && a.id === id)) {
    return { ok: false, reason: "Já adquirido." };
  }

  const def = findAbilityOrTalentDef(treeId, rank, kind, id);
  if (!def) return { ok: false, reason: "Não encontrado." };

  if (getPaRemaining(state) < def.paCost) {
    return { ok: false, reason: `PA insuficiente (custa ${def.paCost} PA).` };
  }

  return OK;
}
