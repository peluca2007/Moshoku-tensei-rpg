import { TREES } from "@/data/trees";
import { getAttackBonus, getPaSpent, getSpellDC } from "@/store/selectors";
import type { FichaPdfPayload } from "@/lib/typstFicha";
import {
  AbilityDef,
  ATTRIBUTES,
  AttributeKey,
  Background,
  CharacterData,
  PurchasedAbility,
  Race,
  RANKS,
  RankName,
  SubtableEntry,
  TalentDef,
} from "@/lib/types";

const ATTRIBUTE_KEY_BY_LABEL: Record<string, AttributeKey> = {
  Força: "forca",
  Agilidade: "agilidade",
  Vigor: "vigor",
  Intelecto: "intelecto",
  Espírito: "espirito",
};

/** Cap. 1, seção 7: BC só existe pra árvores de Magia — o rótulo do atributo-chave da árvore já diz qual usar. */
function attributeKeyFromLabel(label: string | undefined): AttributeKey | null {
  if (!label) return null;
  const first = label.split(/\s+ou\s+/i)[0].trim();
  return ATTRIBUTE_KEY_BY_LABEL[first] ?? null;
}

function actionLabel(ability: AbilityDef): string {
  if (ability.reaction) return "1 Reação";
  if (ability.actions.normal === 0) return "Passivo";
  return `${ability.actions.normal} Ação${ability.actions.normal > 1 ? "ões" : ""}`;
}

function costLabel(kind: "ability" | "talent", def: AbilityDef | TalentDef): string {
  const parts = [`${def.paCost} PA`];
  if (kind === "ability") {
    const a = def as AbilityDef;
    if (a.pmCost !== undefined) parts.push(`${a.pmCost} PM`);
    if (a.ptCost !== undefined) parts.push(`${a.ptCost} PT`);
    if (a.ppCost !== undefined) parts.push(`${a.ppCost} PP`);
  }
  return parts.join(" · ");
}

export interface FichaPayloadInputs {
  character: CharacterData;
  race?: Race;
  background?: Background;
  subtable?: SubtableEntry;
  attributes: Record<AttributeKey, number>;
  maxHp: number;
  maxMp: number;
  maxPt: number;
  maxPp: number;
  armorClass: number;
  initiativeBonus: number;
}

function signed(value: number): string {
  return `${value >= 0 ? "+" : ""}${value}`;
}

export function buildFichaPayload(input: FichaPayloadInputs): FichaPdfPayload {
  const { character, race, background, subtable, attributes, maxHp, maxMp, maxPt, maxPp, armorClass, initiativeBonus } = input;

  const highestRankByTree = new Map<string, RankName>();
  const unlockedRanksByTree = new Map<string, RankName[]>();
  for (const { treeId, rank } of character.unlockedRanks) {
    const current = highestRankByTree.get(treeId);
    if (!current || RANKS.indexOf(rank) > RANKS.indexOf(current)) {
      highestRankByTree.set(treeId, rank);
    }
    const list = unlockedRanksByTree.get(treeId) ?? [];
    if (!list.includes(rank)) list.push(rank);
    unlockedRanksByTree.set(treeId, list);
  }
  for (const list of unlockedRanksByTree.values()) list.sort((a, b) => RANKS.indexOf(a) - RANKS.indexOf(b));

  /** Cap. 1, seção 7: BC = Atributo-chave + Bônus do Rank daquela árvore, CD = 8 + BC — uma linha por escola de magia desbloqueada (não só a "árvore inicial"). */
  const spellcasting: FichaPdfPayload["spellcasting"] = TREES.filter(
    (t) => t.category === "magia" && highestRankByTree.has(t.id)
  ).map((t) => {
    const attrKey = attributeKeyFromLabel(t.keyAttributeLabel) ?? "intelecto";
    return {
      treeName: t.name,
      bc: signed(getAttackBonus(character, t.id, attrKey)),
      cd: String(getSpellDC(character, t.id, attrKey)),
    };
  });

  const trees: FichaPdfPayload["trees"] = [
    { title: "O Pilar da Magia", pillar: "magia" as const },
    { title: "O Pilar do Corpo", pillar: "corpo" as const },
    { title: "O Pilar de Utilidade", pillar: "utilidade" as const },
  ].map(({ title, pillar }) => ({
    title,
    rows: TREES.filter((t) => t.category === pillar).map((t) => {
      const rank = highestRankByTree.get(t.id);
      return { label: t.name, rank: rank ? (t.rankLabels?.[rank] ?? rank) : "" };
    }),
  }));

  const fixedSkills = Array.from(new Set([...(race?.fixedSkills ?? []), ...(background?.fixedSkills ?? [])]));
  const manualSkills = character.skills.filter((s) => !fixedSkills.includes(s));
  const traits: string[] = [
    ...(race?.traits ?? []),
    ...(background?.traits ?? []),
    ...(subtable?.traits ?? []),
  ];
  if (fixedSkills.length > 0) traits.push(`Perícias fixas: ${fixedSkills.join(", ")}.`);
  if (manualSkills.length > 0) traits.push(`Perícias: ${manualSkills.join(", ")}.`);

  const weapons = character.inventory.filter((i) => i.type === "arma").map((i) => ({ name: i.name }));
  const inventory = character.inventory.map((i) => ({
    text: `${i.name}${i.equipped ? " (equipado)" : ""}${i.type === "armadura" && i.acBonus ? ` +${i.acBonus} CA` : ""}${i.description ? ` — ${i.description}` : ""}`,
  }));

  /** Cap. 2, seção 2-3: mesmo detalhamento de Padrão/Encurtada/Silenciosa que a ficha mostra em `CastingBreakdown` — só existe pra magias (Encurtada/Silenciosa vêm de MAGIC_ACTIONS). */
  function castingBreakdownText(a: AbilityDef): string {
    if (a.reaction || (a.actions.encurtada === undefined && a.actions.silenciosa === undefined)) return "";
    const parts = [`Padrão ${actionLabel(a)} (dano cheio)`];
    parts.push(
      a.ritual
        ? "Encurtada impossível (ritual)"
        : a.actions.encurtada !== undefined
          ? `Encurtada ${a.actions.encurtada} Ação${a.actions.encurtada > 1 ? "ões" : ""} (metade dos dados, área -1/3)`
          : "Encurtada impossível (rank Imperador)"
    );
    if (a.actions.silenciosa !== undefined) {
      const label = typeof a.actions.silenciosa === "number" ? `${a.actions.silenciosa} Ação${a.actions.silenciosa > 1 ? "ões" : ""}` : "1 Reação";
      parts.push(`Silenciosa ${label} (dano da Encurtada + 1 benefício)`);
    }
    return parts.join(" · ");
  }

  const abilityCards: FichaPdfPayload["abilityCards"] = [];
  const purchasesByTree = new Map<string, PurchasedAbility[]>();
  for (const p of character.purchasedAbilities) {
    const list = purchasesByTree.get(p.treeId) ?? [];
    list.push(p);
    purchasesByTree.set(p.treeId, list);
  }
  for (const tree of TREES) {
    const unlockedRanksForTree = unlockedRanksByTree.get(tree.id);
    if (unlockedRanksForTree) {
      for (const rank of unlockedRanksForTree) {
        const rankDef = tree.ranks.find((r) => r.rank === rank);
        if (!rankDef?.mastery) continue;
        abilityCards.push({
          name: `◈ ${rankDef.mastery.name}`,
          signature: false,
          cost: "Grátis",
          time: "Passivo",
          range: `${tree.name} — ${rank}`,
          effect: rankDef.mastery.description,
        });
      }
    }

    const purchases = purchasesByTree.get(tree.id);
    if (!purchases) continue;
    for (const purchase of purchases) {
      const rankDef = tree.ranks.find((r) => r.rank === purchase.rank);
      if (!rankDef) continue;
      const def =
        purchase.kind === "ability"
          ? rankDef.abilities.find((a) => a.id === purchase.id)
          : rankDef.talents.find((t) => t.id === purchase.id);
      if (!def) continue;

      if (purchase.kind === "ability") {
        const a = def as AbilityDef;
        const effect = [
          `${a.damage?.normal ? `${a.damage.normal}. ` : ""}${a.effect}`,
          castingBreakdownText(a),
          a.incantation ? `“${a.incantation}”` : "",
        ]
          .filter(Boolean)
          .join("  —  ");
        abilityCards.push({
          name: a.name,
          signature: !!a.signature,
          cost: costLabel("ability", a),
          time: actionLabel(a),
          range: a.range,
          effect,
        });
      } else {
        const t = def as TalentDef;
        abilityCards.push({
          name: t.name,
          signature: false,
          cost: costLabel("talent", t),
          time: "Passivo",
          range: "—",
          effect: t.description,
        });
      }
    }
  }

  return {
    name: character.name || "Sem nome",
    raceName: race?.name ?? "",
    backgroundName: background?.name ?? "",
    gold: String(character.gold),
    attributes: ATTRIBUTES.map((a) => ({ short: a.short, label: a.label, value: attributes[a.key] })),
    maxHp: String(maxHp),
    maxMp: String(maxMp),
    maxPt: String(maxPt),
    maxPp: String(maxPp),
    armorClass: String(armorClass),
    initiative: signed(initiativeBonus),
    deslocamento: "9m",
    paSpent: String(getPaSpent(character)),
    spellcasting,
    trees,
    traits,
    weapons,
    inventory,
    abilityCards,
  };
}
