export type AttributeKey = "forca" | "agilidade" | "vigor" | "intelecto" | "espirito";

export const ATTRIBUTES: { key: AttributeKey; label: string; short: string }[] = [
  { key: "forca", label: "Força", short: "FOR" },
  { key: "agilidade", label: "Agilidade", short: "AGI" },
  { key: "vigor", label: "Vigor", short: "VIG" },
  { key: "intelecto", label: "Intelecto", short: "INT" },
  { key: "espirito", label: "Espírito", short: "ESP" },
];

const ATTRIBUTE_KEY_BY_LABEL: Record<string, AttributeKey> = {
  Força: "forca",
  Agilidade: "agilidade",
  Vigor: "vigor",
  Intelecto: "intelecto",
  Espírito: "espirito",
};

/** Cap. 1, seção 7: o rótulo do atributo-chave de uma árvore ("Força ou Agilidade") pode citar mais de um — usa sempre o primeiro. */
export function attributeKeyFromLabel(label: string | undefined): AttributeKey | null {
  if (!label) return null;
  const first = label.split(/\s+ou\s+/i)[0].trim();
  return ATTRIBUTE_KEY_BY_LABEL[first] ?? null;
}

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
  Avançado: { knowledgeRequired: 4, paCost: 2 },
  Santo: { knowledgeRequired: 6, paCost: 2 },
  Rei: { knowledgeRequired: 8, paCost: 3 },
  Imperador: { knowledgeRequired: 10, paCost: 3 },
};

/** Cap. 1, seção 2: no point-buy da criação o máximo por atributo é 4. Acima disso, cada ponto custa PA. */
export const ATTRIBUTE_CREATION_MAX = 4;
export const ATTRIBUTE_PA_COST_PER_POINT = 2;
export const ATTRIBUTE_HARD_CAP = 8;

export interface FlatBonuses {
  attributes?: Partial<Record<AttributeKey, number>>;
  maxHp?: number;
  maxMp?: number;
  /** Ex: Miko "Maldição do Ódio" concede +2 CA (aura primordial). */
  armorClass?: number;
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

/** Maestria: passiva automática e gratuita concedida ao desbloquear o rank (Cap. 2, seção 5). Não conta como conhecimento. */
export interface MasteryDef {
  name: string;
  description: string;
}

/**
 * Cobre magias (com PM), técnicas de Touki (com PT, Árvore do Corpo) e
 * técnicas de Utilidade (com PP). Nenhum custo de recurso presente = efeito
 * puramente passivo/gratuito além do PA.
 */
export interface AbilityDef {
  id: string;
  name: string;
  paCost: number;
  pmCost?: number;
  /** Custo em Pontos de Touki (Árvore do Corpo, Cap. 3). */
  ptCost?: number;
  /** Custo em Pontos de Preparação (Árvore de Utilidade, Cap. 3). */
  ppCost?: number;
  /** Magia ou Técnica Assinatura (◆) do rank — já reflete o +1 PA extra no paCost. */
  signature?: boolean;
  /** Ritual: não pode ser encurtado, geralmente custa mais Ações. */
  ritual?: boolean;
  range: string;
  actions: {
    normal: number;
    encurtada?: number;
    silenciosa?: number | "reação";
  };
  /** true = o "normal" custo é 1 Reação em vez de X Ações. */
  reaction?: boolean;
  damage?: { normal: string; encurtada?: string };
  effect: string;
  incantation?: string;
}

export interface TreeRankDef {
  rank: RankName;
  hpDiceFormula: string;
  /** Árvore do Corpo: PT ganhos ao alcançar este rank (Cap. 3, "PT Pleno"). */
  ptGained?: number;
  /** Árvore de Utilidade: PP ganhos ao alcançar este rank (+1 a partir do 3º patamar). */
  ppGained?: number;
  /** Árvore do Corpo: degraus ganhos na Escada de Dados de Arma neste rank. */
  weaponDieSteps?: number;
  /** Exceção pontual ao custo de RANK_REQUIREMENTS (ex: Cap. 3 — Rei do Norte custa 2 PA em vez de 3, por ter quase 50 titulares vivos). */
  unlockPaCostOverride?: number;
  /** Maestria gratuita concedida ao desbloquear o rank. */
  mastery?: MasteryDef;
  talents: TalentDef[];
  abilities: AbilityDef[];
}

export interface Tree {
  id: string;
  name: string;
  category: "magia" | "corpo" | "utilidade";
  subgroup: string;
  /** Nome cosmético do rank nesta árvore (ex: Armas Pesadas usa "Briguento" em vez de "Principiante"). Mecânica (RANK_BONUS/RANK_REQUIREMENTS) é sempre a do RankName real. */
  rankLabels?: Partial<Record<RankName, string>>;
  /** Atributo(s) que alimentam o BC/CD desta árvore (texto livre — ex: "Força ou Agilidade"). */
  keyAttributeLabel?: string;
  /** Recurso gasto pela árvore, pra exibição (PM, PT, PP, ou "—" pra Utilidade fora de PP). */
  resourceLabel?: string;
  /** Curta descrição de identidade da árvore, usada no painel de detalhes. */
  tagline?: string;
  /** true = não aparece no seletor de Árvore Inicial (criação); só some acessível depois, desbloqueando na tela de Árvores como qualquer multiclasse (ex: árvores híbridas com pré-requisito de outras duas). */
  hiddenFromCreation?: boolean;
  /** Nota exibida no topo do catálogo (TreeCatalog) explicando um pré-requisito narrativo — não é uma trava de código, o Mestre que decide. */
  prerequisiteNote?: string;
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

export interface InventoryItem {
  id: string;
  name: string;
  type: "arma" | "armadura" | "geral";
  description?: string;
  /** Bônus de CA se for vestido/empunhado — só se aplica a armadura. */
  acBonus?: number;
  /** Dado Base da arma (Cap. 3: "O Dado de Arma"), ex: "d6", "2d8" — só se aplica a arma. */
  baseDie?: string;
  /** Atributo usado no dano (Força, ou Agilidade pra armas leves — Cap. 3, "As Fórmulas Marciais"). Padrão: Força. */
  damageAttribute?: AttributeKey;
  equipped: boolean;
}

/** Cap. 1, seção 2 (Tabela de Custos Gerais): 2 PA = +12 PV ou +12 PM Máximos permanentes, além do PA de árvore. */
export const HP_MP_BONUS_PER_TWO_PA = 12;

/**
 * Dados de uma ficha de personagem — o site suporta várias, uma por vez ativa.
 * Não guarda um "saldo de PA": o Mestre controla quanto cada ficha tem fora do
 * site, então o sistema só soma e mostra quanto já foi gasto (ver getPaSpent).
 */
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
  gold: number;
  inventory: InventoryItem[];
  /** Perícias além das automáticas de raça/antecedente (Cap. 1, seção 4). */
  skills: string[];
  /** PV/PM Máximos comprados com PA (Cap. 1, seção 2: 2 PA = +12), fora da árvore. */
  bonusHp: number;
  bonusMp: number;
  /**
   * PV/PM/PT/PP atuais (o que sobrou depois de gastar/sofrer dano em jogo).
   * `null` = ainda não tocado nesta ficha, mostra igual ao máximo calculado.
   * Uma vez definido, fica independente do máximo — subir de nível não cura
   * retroativamente, igual numa mesa de verdade.
   */
  currentHp: number | null;
  currentMp: number | null;
  currentPt: number | null;
  currentPp: number | null;
  /**
   * Sobrescreve o valor calculado quando não-nulo/indefinido — válvula de
   * escape pra itens, maldições ou exceções de mesa que o site não modela.
   * Sempre opcional: por padrão tudo continua 100% calculado a partir da
   * ficha (raça/antecedente/árvores/atributos).
   */
  overrides: {
    maxHp?: number;
    maxMp?: number;
    maxPt?: number;
    maxPp?: number;
    armorClass?: number;
    initiative?: number;
    /** Cap. 5, §2: Rank de Guilda é decisão do Mestre, nunca uma fórmula — isto é o valor que ele fixou. Sem isso, o site mostra uma estimativa por PA gasto, só como chute inicial. */
    guildRank?: "F" | "E" | "D" | "C" | "B" | "A" | "S";
  };
}
