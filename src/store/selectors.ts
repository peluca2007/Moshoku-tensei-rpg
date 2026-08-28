import { getRaceById } from "@/data/races";
import { getBackgroundById, getSubtableEntryById } from "@/data/backgrounds";
import { getTreeById } from "@/data/trees";
import { diceAverage, diceMax } from "@/lib/dice";
import { escalateWeaponDie } from "@/lib/weaponDie";
import {
  ATTRIBUTE_CREATION_MAX,
  ATTRIBUTE_PA_COST_PER_POINT,
  AttributeKey,
  ATTRIBUTES,
  CharacterData,
  GuildRank,
  RANK_BONUS,
  RANK_REQUIREMENTS,
  RANKS,
  RankName,
  Tree,
} from "@/lib/types";

export type { GuildRank };

/** Cap. 3: o Deus da Espada acorda o Touki Pleno no 2º patamar (Intermediário); as demais árvores do Corpo, no 3º (Avançado). */
function ptPlenoThresholdIndex(treeId: string): number {
  return treeId === "deus-da-espada" ? RANKS.indexOf("Intermediário") : RANKS.indexOf("Avançado");
}

/** Cap. 3: atributo-chave de cada árvore de Utilidade, usado no cálculo de PP. */
const UTILITY_KEY_ATTRIBUTE: Record<string, AttributeKey> = {
  "furtividade-e-armadilhas": "agilidade",
  "bardo-e-interacao": "espirito",
  "navegacao-e-lideranca": "intelecto",
};

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

function getFlatBonusSum(state: StoreState, field: "maxHp" | "maxMp" | "armorClass"): number {
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

/** Maior Bônus de Rank (Cap. 1, seção 7) entre os ranks desbloqueados de árvores que passem no filtro — 0 se nenhuma. */
function getHighestRankBonus(state: StoreState, categoryFilter?: Tree["category"]): number {
  return state.unlockedRanks.reduce((max, u) => {
    const tree = getTreeById(u.treeId);
    if (!tree) return max;
    if (categoryFilter && tree.category !== categoryFilter) return max;
    return Math.max(max, RANK_BONUS[u.rank]);
  }, 0);
}

/**
 * PV Máximos (Cap. 4, "Cálculos Vitais"): Constituição Base + Progressão + Vitalidade.
 * - Constituição Base = 10 + Vigor×3, mínimo 13.
 * - Progressão = soma de TODOS os dados de PV concedidos por toda árvore desbloqueada, DOBRADA.
 *   Na criação, o dado do 1º patamar da Árvore Inicial é sempre o valor MÁXIMO; os demais usam a média.
 * - Vitalidade = Vigor × Maior Bônus de Rank (de QUALQUER árvore) × 4.
 */
export function getMaxHp(state: StoreState): number {
  const vigor = getFinalAttribute(state, "vigor");
  const constituicaoBase = Math.max(10 + vigor * 3, 13);

  const startingTree = getTreeById(state.startingTreeId);
  const startingFirstRank = startingTree?.ranks[0];

  const progressaoBruta = state.unlockedRanks.reduce((total, unlocked) => {
    const tree = getTreeById(unlocked.treeId);
    const rankDef = tree?.ranks.find((r) => r.rank === unlocked.rank);
    if (!rankDef) return total;
    const isStartingFirstRank = tree?.id === state.startingTreeId && rankDef === startingFirstRank;
    return total + (isStartingFirstRank ? diceMax(rankDef.hpDiceFormula) : diceAverage(rankDef.hpDiceFormula));
  }, 0);

  const vitalidade = vigor * getHighestRankBonus(state) * 4;

  const computed = constituicaoBase + progressaoBruta * 2 + vitalidade + getFlatBonusSum(state, "maxHp") + state.bonusHp;
  return state.overrides.maxHp ?? computed;
}

/**
 * PM Máximos (Cap. 4): (Espírito × Maior Bônus de Rank DE MAGIA) + 8, com um
 * PISO de (Maior Bônus de magia × 4) + 8.
 *
 * Escolas de magia não concedem PM — a reserva inteira vem só desta fórmula.
 * Sem o ×2 que a fórmula usou até 2026-08-28: com ele, um Espírito alto
 * (até o teto de 8, Cap. 1 §2) rendia PM sobrando pra 4-7 casts da magia mais
 * forte do rank Imperador (custo até 20 PM) — bem acima do "no máximo umas 2
 * vezes" pretendido pro golpe mais forte de um personagem.
 *
 * O piso entrou em 2026-08-28 (auditoria de balanceamento) e conserta o outro
 * extremo, que passou despercebido: sem ele, o mago "cirurgião" que o Cap. 1
 * §1 promete explicitamente (Intelecto alto, Espírito baixo — "poucos tiros,
 * todos letais") ficava matematicamente impossível no rank alto. Com Espírito
 * 2, um Imperador tinha 2×6+8 = 20 PM, e a magia de assinatura da própria
 * escola custava mais que isso (Sol Menor 22, Corpo Íntegro 25) — ele
 * simplesmente não conseguia conjurá-la, nunca. A causa é o descompasso de
 * curva: o custo mediano das magias cresce ×10 do 1º ao 6º patamar (2 → 20
 * PM) e a reserva com Espírito 4 cresce só ×2,7 (12 → 32). O piso põe o
 * Imperador em 32 PM mesmo com Espírito 0, e é INVISÍVEL pra qualquer ficha
 * com Espírito >= 4 — o teto calibrado acima (Espírito 8 = 56 PM, ~2,2 casts
 * da magia mais cara) não muda em nada.
 */
export function getMaxMp(state: StoreState): number {
  const espirito = getFinalAttribute(state, "espirito");
  const maiorBonusMagia = getHighestRankBonus(state, "magia");
  const natural = Math.max(espirito * maiorBonusMagia, maiorBonusMagia * 4) + 8;
  const computed = natural + getFlatBonusSum(state, "maxMp") + state.bonusMp;
  return state.overrides.maxMp ?? computed;
}

/**
 * Pontos de Touki (Cap. 3, "Pontos de Touki (PT) — as duas reservas"): sem
 * nenhum patamar do Corpo, 0. Com pelo menos um patamar mas nenhum "Pleno"
 * ainda, PT Menor = max(Vigor, 1). A partir do Touki Pleno (3º patamar em
 * geral; 2º no Deus da Espada, que também conta pra soma de Crescimento):
 * PT = Vigor + Espírito + Crescimento, onde Crescimento soma +1 por patamar
 * com Pleno já desbloqueado (+2 por patamar em Cavalaria e Escudos, que gasta
 * PT mais rápido que qualquer outra árvore). Corrigido em 2026-08-28: a
 * fórmula antiga daqui (Vigor + Espírito×Maior Bônus, multiplicativa) não
 * batia com o livro e deixava PT bem mais generoso que o pretendido.
 */
export function getPtPool(state: StoreState): number {
  const corpoRanks = state.unlockedRanks.filter((r) => getTreeById(r.treeId)?.category === "corpo");

  function computeNatural(): number {
    if (corpoRanks.length === 0) return 0;

    const vigor = getFinalAttribute(state, "vigor");
    const espirito = getFinalAttribute(state, "espirito");

    const plenoRanks = corpoRanks.filter((u) => RANKS.indexOf(u.rank) >= ptPlenoThresholdIndex(u.treeId));
    if (plenoRanks.length === 0) return Math.max(vigor, 1);

    const crescimento = plenoRanks.reduce((sum, u) => sum + (u.treeId === "cavalaria-e-escudos" ? 2 : 1), 0);

    return vigor + espirito + crescimento;
  }

  return state.overrides.maxPt ?? computeNatural();
}

/**
 * Pontos de Preparação (Cap. 3): sem nenhum patamar de Utilidade, 0. Senão,
 * Intelecto + o maior atributo-chave entre suas árvores de Utilidade
 * (mínimo 1), +1 por patamar de 3º ou superior em qualquer uma delas.
 */
export function getPpPool(state: StoreState): number {
  const utilRanks = state.unlockedRanks.filter((r) => getTreeById(r.treeId)?.category === "utilidade");

  function computeNatural(): number {
    if (utilRanks.length === 0) return 0;

    const intelecto = getFinalAttribute(state, "intelecto");
    let maxKeyAttribute = 0;
    let patamarBonus = 0;
    for (const u of utilRanks) {
      const key = UTILITY_KEY_ATTRIBUTE[u.treeId];
      if (key) maxKeyAttribute = Math.max(maxKeyAttribute, getFinalAttribute(state, key));
      if (RANKS.indexOf(u.rank) >= RANKS.indexOf("Avançado")) patamarBonus += 1;
    }

    return Math.max(intelecto + maxKeyAttribute, 1) + patamarBonus;
  }

  return state.overrides.maxPp ?? computeNatural();
}

/**
 * CA = 10 + Agilidade final + bônus fixo de raça/antecedente/sub-tabela
 * (ex: Miko "Maldição do Ódio") + itens de armadura equipados.
 */
export function getArmorClass(state: StoreState): number {
  const equippedBonus = state.inventory.reduce(
    (sum, item) => sum + (item.equipped && item.type === "armadura" ? (item.acBonus ?? 0) : 0),
    0
  );
  const computed = 10 + getFinalAttribute(state, "agilidade") + getFlatBonusSum(state, "armorClass") + equippedBonus;
  return state.overrides.armorClass ?? computed;
}

/** Iniciativa = 1d20 + Agilidade; Escudeiro/Treino Precoce dá Vantagem. */
export function getInitiative(state: StoreState): { bonus: number; hasAdvantage: boolean } {
  const background = getBackgroundById(state.backgroundId);
  return {
    bonus: state.overrides.initiative ?? getFinalAttribute(state, "agilidade"),
    hasAdvantage: background?.grantsInitiativeAdvantage ?? false,
  };
}

export interface WeaponDamageInfo {
  treeId: string;
  treeName: string;
  rank: RankName;
  rankLabel: string;
  rankBonus: number;
  steps: number;
  baseDie: string;
  escalatedDie: string;
  attribute: AttributeKey;
  attributeValue: number;
  averageDamage: number;
}

/**
 * Fórmula de dano marcial (Cap. 3): Dado de Arma (escalado) + Atributo + Bônus
 * do Rank do Estilo. "Um ataque comum usa os degraus do seu maior patamar
 * entre as árvores do Corpo" (Apêndice D, Ambiguidades Resolvidas) — por isso a escalada usa sempre a
 * árvore do Corpo onde o personagem tem o rank mais alto, não uma em particular.
 */
export function getWeaponDamage(
  state: StoreState,
  baseDie: string,
  attribute: AttributeKey = "forca"
): WeaponDamageInfo | null {
  const corpoRanks = state.unlockedRanks.filter((r) => getTreeById(r.treeId)?.category === "corpo");
  if (corpoRanks.length === 0 || !baseDie) return null;

  let bestTreeId = corpoRanks[0].treeId;
  let bestRankIndex = -1;
  for (const u of corpoRanks) {
    const idx = RANKS.indexOf(u.rank);
    if (idx > bestRankIndex) {
      bestRankIndex = idx;
      bestTreeId = u.treeId;
    }
  }

  const tree = getTreeById(bestTreeId);
  if (!tree) return null;
  const rank = RANKS[bestRankIndex];

  const steps = tree.ranks
    .filter((r) => RANKS.indexOf(r.rank) <= bestRankIndex)
    .reduce((sum, r) => sum + (r.weaponDieSteps ?? 0), 0);

  const escalatedDie = escalateWeaponDie(baseDie, steps);
  const rankBonus = RANK_BONUS[rank];
  const attributeValue = getFinalAttribute(state, attribute);

  return {
    treeId: tree.id,
    treeName: tree.name,
    rank,
    rankLabel: tree.rankLabels?.[rank] ?? rank,
    rankBonus,
    steps,
    baseDie,
    escalatedDie,
    attribute,
    attributeValue,
    averageDamage: diceAverage(escalatedDie) + attributeValue + rankBonus,
  };
}

/** PV/PM/PT/PP atuais: `null` (ainda não tocado) mostra igual ao máximo calculado; senão, o valor salvo. */
export function getCurrentHp(state: StoreState): number {
  return state.currentHp ?? getMaxHp(state);
}
export function getCurrentMp(state: StoreState): number {
  return state.currentMp ?? getMaxMp(state);
}
export function getCurrentPt(state: StoreState): number {
  return state.currentPt ?? getPtPool(state);
}
export function getCurrentPp(state: StoreState): number {
  return state.currentPp ?? getPpPool(state);
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

/** Custo em PA pra desbloquear um rank numa árvore: RANK_REQUIREMENTS, a menos que a árvore declare unlockPaCostOverride (ex: Rei do Norte = 2 PA). */
export function getRankUnlockPaCost(treeId: string, rank: RankName): number {
  const rankDef = getTreeById(treeId)?.ranks.find((r) => r.rank === rank);
  return rankDef?.unlockPaCostOverride ?? RANK_REQUIREMENTS[rank].paCost;
}

/** Cap. 1, seção 2: acima do máximo de criação (4), cada ponto de atributo custa PA (limite 8). */
export function getAttributePaCost(state: StoreState): number {
  return ATTRIBUTES.reduce((sum, { key }) => {
    const value = state.attributeBase[key] ?? 0;
    const pointsAbove = Math.max(0, value - ATTRIBUTE_CREATION_MAX);
    return sum + pointsAbove * ATTRIBUTE_PA_COST_PER_POINT;
  }, 0);
}

/**
 * Cap. 1, seção 2: 2 PA = +PV iguais a QUATRO VEZES o Maior Bônus de Rank
 * (qualquer árvore), ou +PM iguais ao DOBRO do Maior Bônus de Rank de magia —
 * escala com o Rank de propósito (o Aside do livro explica: um Imperador rende
 * 6× mais por PA que um Principiante). `bonusHp`/`bonusMp` continuam sendo o
 * valor de PV/PM que o jogador digita direto na ficha (Cap. 1: "PA é
 * informativo, não travado") — só o cálculo do custo em PA mostrado usa a taxa.
 *
 * Duas correções, ambas achadas comparando esta compra com o que as árvores
 * já ofereciam:
 * - 2026-08-28 (revisão com agentes): a taxa era fixa em 12 pra qualquer Rank
 *   — exatamente `2 × 6`, o Bônus só de um Imperador; Rank mais baixo pagava
 *   PA de menos pelo mesmo bônus. Passou a escalar com o Rank.
 * - 2026-08-28 (auditoria de balanceamento): mesmo já escalando, esta compra
 *   era 4× pior que o talento de reserva recomprável que 12 árvores têm
 *   (Braço de Ferro, Osso Duro, Pele de Pedra...). Um Imperador com 6
 *   patamares comprava o talento por 1 PA e levava +4×6 = 24 PV; a tabela do
 *   Cap. 1 pedia 2 PA por 2×6 = 12 PV. A linha de PV/PM da tabela era, na
 *   prática, uma armadilha: sempre a pior compra disponível pra quem tem
 *   qualquer árvore aberta. Dobrar as duas taxas empata o VALOR por compra
 *   (24 PV / 12 PM no Imperador); o talento continua melhor por PA, e isso é
 *   proposital — ele é travado no número de patamares de UMA árvore, enquanto
 *   esta compra é incondicional e não tem teto.
 */
export function getHpMpPaCost(state: StoreState): number {
  const hpRate = Math.max(1, getHighestRankBonus(state) * 4);
  const mpRate = Math.max(1, getHighestRankBonus(state, "magia") * 2);
  const hpCost = Math.ceil(state.bonusHp / hpRate) * 2;
  const mpCost = Math.ceil(state.bonusMp / mpRate) * 2;
  return Math.max(0, hpCost) + Math.max(0, mpCost);
}

/**
 * PA já gastos, só pra informar o jogador (o Mestre controla o quanto ele
 * tem fora do site — o sistema não trava compra por "saldo insuficiente"):
 * desbloqueios de rank + magias/talentos comprados + atributos acima de 4
 * + PV/PM comprados.
 */
export function getPaSpent(state: StoreState): number {
  // Cap. 1, §8, "Custo de Abertura": desbloquear o Principiante de uma árvore
  // nova custa PA igual à posição de abertura (1ª árvore = 1 PA, 2ª = 2 PA, ...),
  // não o custo fixo de RANK_REQUIREMENTS.Principiante — senão a regra que o
  // livro descreve como "corrigida" (impedir abrir 5 árvores por 5 PA de graça)
  // nunca é aplicada de fato. A ordem de state.unlockedRanks já é cronológica
  // (só cresce por append em unlockRank), então dá pra usar direto.
  const openedTrees = new Set<string>();
  const rankCost = state.unlockedRanks.reduce((sum, u) => {
    if (u.rank === "Principiante" && !openedTrees.has(u.treeId)) {
      openedTrees.add(u.treeId);
      return sum + openedTrees.size;
    }
    return sum + getRankUnlockPaCost(u.treeId, u.rank);
  }, 0);
  const abilityCost = state.purchasedAbilities.reduce((sum, a) => {
    const def = findAbilityOrTalentDef(a.treeId, a.rank, a.kind, a.id);
    return sum + (def?.paCost ?? 0);
  }, 0);
  return rankCost + abilityCost + getAttributePaCost(state) + getHpMpPaCost(state);
}

/** Cap. 5, §2 (Guilda de Aventureiros): faixas de PA usadas como referência pro Rank de Aventureiro — não é regra travada, só o chute inicial que o livro dá ao Mestre. */
const GUILD_RANK_THRESHOLDS: { rank: GuildRank; min: number }[] = [
  { rank: "S", min: 110 },
  { rank: "A", min: 75 },
  { rank: "B", min: 50 },
  { rank: "C", min: 30 },
  { rank: "D", min: 15 },
  { rank: "E", min: 6 },
  { rank: "F", min: 0 },
];

/** Retorna o Rank fixado pelo Mestre (overrides.guildRank) se existir; senão, uma estimativa por PA gasto (Cap. 5, §2: só um chute inicial, nunca a regra real). */
export function getGuildRank(state: StoreState): GuildRank {
  if (state.overrides.guildRank) return state.overrides.guildRank;
  const paSpent = getPaSpent(state);
  return GUILD_RANK_THRESHOLDS.find((t) => paSpent >= t.min)?.rank ?? "F";
}

/** true quando o Rank exibido é só a estimativa por PA — não uma decisão do Mestre já registrada. */
export function isGuildRankEstimated(state: StoreState): boolean {
  return !state.overrides.guildRank;
}

/**
 * Pode desbloquear este rank? Exige (Cap. 1, seção 3): rank anterior já
 * desbloqueado na mesma árvore e conhecimentos suficientes. PA não é
 * travado aqui — é só informativo (ver getPaSpent).
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

  return OK;
}

/** Pode comprar esta magia/talento? Exige só o rank já desbloqueado nesta árvore. */
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

  return OK;
}
