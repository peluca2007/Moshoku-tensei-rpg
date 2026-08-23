export type AttributeKey = "forca" | "agilidade" | "vigor" | "intelecto" | "espirito";

export const ATTRIBUTES: { key: AttributeKey; label: string; short: string }[] = [
  { key: "forca", label: "Força", short: "FOR" },
  { key: "agilidade", label: "Agilidade", short: "AGI" },
  { key: "vigor", label: "Vigor", short: "VIG" },
  { key: "intelecto", label: "Intelecto", short: "INT" },
  { key: "espirito", label: "Espírito", short: "ESP" },
];

export type RankName =
  | "Principiante"
  | "Intermediário"
  | "Avançado"
  | "Santo"
  | "Rei"
  | "Imperador";

export const RANKS: RankName[] = [
  "Principiante",
  "Intermediário",
  "Avançado",
  "Santo",
  "Rei",
  "Imperador",
];

// Capítulo 1, seção 7: bônus numérico fixo por rank, usado em ataque/CD/dano de QUALQUER árvore.
export const RANK_BONUS: Record<RankName, number> = {
  Principiante: 1,
  Intermediário: 2,
  Avançado: 3,
  Santo: 4,
  Rei: 5,
  Imperador: 6,
};

// Capítulo 1, seção 3: quantos "conhecimentos" (magias/talentos) a árvore precisa ter
// para liberar a COMPRA do próximo rank, e quanto custa em PA desbloquear esse rank.
export const RANK_REQUIREMENTS: Record<RankName, { knowledgeRequired: number; paCost: number }> = {
  Principiante: { knowledgeRequired: 0, paCost: 1 },
  Intermediário: { knowledgeRequired: 2, paCost: 1 },
  Avançado: { knowledgeRequired: 3, paCost: 2 },
  Santo: { knowledgeRequired: 4, paCost: 2 },
  Rei: { knowledgeRequired: 5, paCost: 2 },
  Imperador: { knowledgeRequired: 6, paCost: 3 },
};

export interface FlatBonuses {
  attributes?: Partial<Record<AttributeKey, number>>;
  maxHp?: number;
  maxMp?: number;
}

export interface Race {
  id: string;
  name: string;
  description: string;
  bonuses: FlatBonuses;
  fixedSkills?: string[];
  bonusSkillChoices?: number;
  traits: string[];
}

export interface Background {
  id: string;
  name: string;
  rollRange: [number, number];
  bonuses: FlatBonuses;
  fixedSkills?: string[];
  bonusSkillChoices?: number;
  startingGold: string;
  grantsInitiativeAdvantage?: boolean;
  requiresSubtable?: "miko" | "olho";
  traits: string[];
}

export interface SubtableEntry {
  id: string;
  roll: number;
  name: string;
  bonuses: FlatBonuses;
  traits: string[];
}

export interface TalentDef {
  id: string;
  name: string;
  paCost: number;
  description: string;
}

/**
 * Cobre magias (com PM) e técnicas de Touki (sem PM — classes de Touki
 * recebem 0 PM em suas progressões, Cap. 4). pmCost ausente = técnica física.
 */
export interface AbilityDef {
  id: string;
  name: string;
  paCost: number;
  pmCost?: number;
  range: string;
  actions: {
    normal: number;
    encurtada?: number;
    silenciosa?: number | "bônus" | "reação";
  };
  damage?: { normal: string; encurtada?: string };
  effect: string;
  incantation?: string;
}

export interface TreeRankDef {
  rank: RankName;
  hpDiceFormula: string;
  mpPerRank: number;
  talents: TalentDef[];
  abilities: AbilityDef[];
}

export interface Tree {
  id: string;
  name: string;
  category: "magia" | "corpo" | "utilidade";
  subgroup: string;
  hpDieMax: number;
  /** Nome cosmético do rank nesta árvore (ex: Armas Pesadas usa "Briguento" em vez de "Principiante"). Mecânica (RANK_BONUS/RANK_REQUIREMENTS) é sempre a do RankName real. */
  rankLabels?: Partial<Record<RankName, string>>;
  ranks: TreeRankDef[];
}

export interface PurchasedAbility {
  treeId: string;
  rank: RankName;
  kind: "ability" | "talent";
  id: string;
}

export interface UnlockedRank {
  treeId: string;
  rank: RankName;
}

/** Dados de uma ficha de personagem — o site suporta várias, uma por vez ativa. */
export interface CharacterData {
  id: string;
  name: string;
  raceId: string | null;
  backgroundId: string | null;
  subtableEntryId: string | null;
  attributeBase: Record<AttributeKey, number>;
  startingTreeId: string | null;
  unlockedRanks: UnlockedRank[];
  purchasedAbilities: PurchasedAbility[];
  startingGold: number;
  /** PA concedidos pelo Mestre (3 iniciais na criação, Cap. 1 seção 2 + recompensas depois). */
  paEarned: number;
}
