import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AttributeKey, CharacterData, InventoryItem, PurchasedAbility, RankName } from "@/lib/types";
import { canPurchaseAbility, canUnlockRank } from "./selectors";

const DEFAULT_ATTRIBUTES: Record<AttributeKey, number> = {
  forca: 0,
  agilidade: 0,
  vigor: 0,
  intelecto: 0,
  espirito: 0,
};

function blankCharacter(id: string, name: string): CharacterData {
  return {
    id,
    name,
    raceId: null,
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: DEFAULT_ATTRIBUTES,
    startingTreeId: null,
    unlockedRanks: [],
    purchasedAbilities: [],
    gold: 0,
    inventory: [],
    skills: [],
    bonusHp: 0,
    bonusMp: 0,
    currentHp: null,
    currentMp: null,
    currentPt: null,
    currentPp: null,
    overrides: {},
  };
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

interface RosterState {
  characters: Record<string, CharacterData>;
  order: string[];
  activeId: string | null;

  createCharacter: (name?: string) => string;
  /** Importa uma ficha exportada em JSON como um personagem NOVO (nunca sobrescreve um existente) — gera um id novo, mantém o resto dos dados. */
  importCharacter: (data: CharacterData) => string;
  deleteCharacter: (id: string) => void;
  renameCharacter: (id: string, name: string) => void;
  setActiveCharacter: (id: string) => void;
  ensureActiveCharacter: () => void;

  setName: (name: string) => void;
  setRace: (raceId: string | null) => void;
  setBackground: (backgroundId: string | null) => void;
  setSubtableEntry: (entryId: string | null) => void;
  setAttribute: (key: AttributeKey, value: number) => void;
  setStartingTree: (treeId: string | null) => void;
  setGold: (value: number) => void;
  setBonusHp: (value: number) => void;
  setBonusMp: (value: number) => void;
  setCurrentHp: (value: number | null) => void;
  setCurrentMp: (value: number | null) => void;
  setCurrentPt: (value: number | null) => void;
  setCurrentPp: (value: number | null) => void;
  /** value === null apaga a sobrescrita e volta a usar o valor calculado. */
  setOverride: (stat: keyof CharacterData["overrides"], value: number | null) => void;
  addSkill: (name: string) => void;
  removeSkill: (name: string) => void;
  addItem: (item: Omit<InventoryItem, "id" | "equipped">) => void;
  removeItem: (itemId: string) => void;
  /** Edição livre de qualquer campo do item (nome, dado, +CA, descrição...), sem precisar apagar e recriar. */
  updateItem: (itemId: string, patch: Partial<Omit<InventoryItem, "id">>) => void;
  toggleEquipped: (itemId: string) => void;
  /** Retorna false (e não muda nada) se a regra de desbloqueio do Cap. 1 não for satisfeita. */
  unlockRank: (treeId: string, rank: RankName) => boolean;
  /** Retorna false (e não muda nada) se o rank não estiver desbloqueado ou já foi comprado. */
  purchaseAbility: (ability: PurchasedAbility) => boolean;
  removeAbility: (treeId: string, id: string) => void;
}

function updateActive(
  get: () => RosterState,
  set: (partial: Partial<RosterState>) => void,
  updater: (c: CharacterData) => CharacterData
) {
  const state = get();
  if (!state.activeId) return;
  const current = state.characters[state.activeId];
  if (!current) return;
  set({ characters: { ...state.characters, [state.activeId]: updater(current) } });
}

export const useCharacterStore = create<RosterState>()(
  persist(
    (set, get) => ({
      characters: {},
      order: [],
      activeId: null,

      createCharacter: (name = "Novo Personagem") => {
        const id = makeId("char");
        const character = blankCharacter(id, name);
        set((state) => ({
          characters: { ...state.characters, [id]: character },
          order: [...state.order, id],
          activeId: id,
        }));
        return id;
      },

      importCharacter: (data) => {
        const id = makeId("char");
        const character: CharacterData = { ...data, id };
        set((state) => ({
          characters: { ...state.characters, [id]: character },
          order: [...state.order, id],
          activeId: id,
        }));
        return id;
      },

      deleteCharacter: (id) =>
        set((state) => {
          const { [id]: _removed, ...rest } = state.characters;
          const order = state.order.filter((c) => c !== id);
          const activeId = state.activeId === id ? (order[0] ?? null) : state.activeId;
          return { characters: rest, order, activeId };
        }),

      renameCharacter: (id, name) =>
        set((state) => {
          const character = state.characters[id];
          if (!character) return state;
          return { characters: { ...state.characters, [id]: { ...character, name } } };
        }),

      setActiveCharacter: (id) => set({ activeId: id }),

      ensureActiveCharacter: () => {
        const state = get();
        if (state.activeId && state.characters[state.activeId]) return;
        if (state.order.length > 0) {
          set({ activeId: state.order[0] });
          return;
        }
        get().createCharacter("Novo Personagem");
      },

      setName: (name) => updateActive(get, set, (c) => ({ ...c, name })),
      setRace: (raceId) => updateActive(get, set, (c) => ({ ...c, raceId })),
      setBackground: (backgroundId) =>
        updateActive(get, set, (c) => ({ ...c, backgroundId, subtableEntryId: null })),
      setSubtableEntry: (subtableEntryId) => updateActive(get, set, (c) => ({ ...c, subtableEntryId })),
      setAttribute: (key, value) =>
        updateActive(get, set, (c) => ({ ...c, attributeBase: { ...c.attributeBase, [key]: value } })),
      setStartingTree: (startingTreeId) => updateActive(get, set, (c) => ({ ...c, startingTreeId })),
      setGold: (gold) => updateActive(get, set, (c) => ({ ...c, gold })),
      setBonusHp: (bonusHp) => updateActive(get, set, (c) => ({ ...c, bonusHp })),
      setBonusMp: (bonusMp) => updateActive(get, set, (c) => ({ ...c, bonusMp })),
      setCurrentHp: (currentHp) => updateActive(get, set, (c) => ({ ...c, currentHp })),
      setCurrentMp: (currentMp) => updateActive(get, set, (c) => ({ ...c, currentMp })),
      setCurrentPt: (currentPt) => updateActive(get, set, (c) => ({ ...c, currentPt })),
      setCurrentPp: (currentPp) => updateActive(get, set, (c) => ({ ...c, currentPp })),
      setOverride: (stat, value) =>
        updateActive(get, set, (c) => {
          const overrides = { ...c.overrides };
          if (value === null) delete overrides[stat];
          else overrides[stat] = value;
          return { ...c, overrides };
        }),

      addSkill: (name) =>
        updateActive(get, set, (c) =>
          c.skills.includes(name) ? c : { ...c, skills: [...c.skills, name] }
        ),
      removeSkill: (name) =>
        updateActive(get, set, (c) => ({ ...c, skills: c.skills.filter((s) => s !== name) })),

      addItem: (item) =>
        updateActive(get, set, (c) => ({
          ...c,
          inventory: [...c.inventory, { ...item, id: makeId("item"), equipped: false }],
        })),
      removeItem: (itemId) =>
        updateActive(get, set, (c) => ({ ...c, inventory: c.inventory.filter((i) => i.id !== itemId) })),
      updateItem: (itemId, patch) =>
        updateActive(get, set, (c) => ({
          ...c,
          inventory: c.inventory.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
        })),
      toggleEquipped: (itemId) =>
        updateActive(get, set, (c) => ({
          ...c,
          inventory: c.inventory.map((i) => (i.id === itemId ? { ...i, equipped: !i.equipped } : i)),
        })),

      unlockRank: (treeId, rank) => {
        const state = get();
        const active = state.activeId ? state.characters[state.activeId] : null;
        if (!active || !canUnlockRank(active, treeId, rank).ok) return false;
        updateActive(get, set, (c) => ({ ...c, unlockedRanks: [...c.unlockedRanks, { treeId, rank }] }));
        return true;
      },

      purchaseAbility: (ability) => {
        const state = get();
        const active = state.activeId ? state.characters[state.activeId] : null;
        if (!active || !canPurchaseAbility(active, ability.treeId, ability.rank, ability.kind, ability.id).ok) {
          return false;
        }
        updateActive(get, set, (c) => ({ ...c, purchasedAbilities: [...c.purchasedAbilities, ability] }));
        return true;
      },

      removeAbility: (treeId, id) =>
        updateActive(get, set, (c) => ({
          ...c,
          purchasedAbilities: c.purchasedAbilities.filter((a) => !(a.treeId === treeId && a.id === id)),
        })),
    }),
    {
      name: "mushoku-tensei-roster",
      skipHydration: true,
      // v4: adicionou currentHp/currentMp/currentPt/currentPp e overrides (CA/máximos editáveis).
      // Sem usuários reais ainda, então uma versão antiga simplesmente reseta o roster.
      version: 4,
      migrate: () => ({ characters: {}, order: [], activeId: null }),
    }
  )
);

/** Ficha atualmente ativa, com fallback seguro pra antes do roster carregar/hidratar. */
export function useActiveCharacter(): CharacterData {
  const activeId = useCharacterStore((s) => s.activeId);
  const character = useCharacterStore((s) => (activeId ? s.characters[activeId] : undefined));
  return character ?? blankCharacter("__none__", "");
}
