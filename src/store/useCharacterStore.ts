import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AttributeKey, CharacterData, GuildRank, InventoryItem, meetsGuildRank, PurchasedAbility, RankName } from "@/lib/types";
import { canPurchaseAbility, canUnlockRank, getGuildRank } from "./selectors";

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
    lore: "",
    raceId: null,
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: DEFAULT_ATTRIBUTES,
    raceAttributeChoices: [],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: null,
    unlockedRanks: [],
    purchasedAbilities: [],
    gold: 0,
    inventory: [],
    skills: [],
    treeSkillChoices: [],
    proficiencies: [],
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

/** Quantas edições passadas guardamos por ficha para o "Desfazer" — não persiste entre recarregamentos. */
const HISTORY_LIMIT = 30;

interface RosterState {
  characters: Record<string, CharacterData>;
  order: string[];
  activeId: string | null;
  /** Pilha de estados anteriores da ficha ativa, por id de personagem (mais recente por último). Não é salva no localStorage. */
  history: Record<string, CharacterData[]>;

  createCharacter: (name?: string) => string;
  /** Importa uma ficha exportada em JSON como um personagem NOVO (nunca sobrescreve um existente) — gera um id novo, mantém o resto dos dados. */
  importCharacter: (data: CharacterData) => string;
  deleteCharacter: (id: string) => void;
  renameCharacter: (id: string, name: string) => void;
  setActiveCharacter: (id: string) => void;
  ensureActiveCharacter: () => void;

  setName: (name: string) => void;
  setLore: (lore: string) => void;
  setRace: (raceId: string | null) => void;
  /** Define o bônus livre de atributo da raça (Humano). Índice = qual dos pontos concedidos. */
  setRaceAttributeChoice: (index: number, key: AttributeKey | null) => void;
  /** Escolha do `grantedSkills.choose` da Árvore Inicial (Cap. 1, §4). */
  setTreeSkillChoice: (index: number, skill: string | null) => void;
  addProficiency: (name: string) => void;
  removeProficiency: (name: string) => void;
  /** Compra/desfaz uma melhoria racial (Cap. 1, §5) — o custo em PA entra em getPaSpent. */
  toggleRacialUpgrade: (upgradeId: string) => void;
  /** Cap. 1, §2: liga/desliga a Vantagem permanente nos saves de um atributo (2 PA). */
  toggleSaveAdvantage: (key: AttributeKey) => void;
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
  setOverride: (stat: keyof Omit<CharacterData["overrides"], "guildRank">, value: number | null) => void;
  /** Rank de Guilda (Cap. 5, §2) é decisão do Mestre, não fórmula — value === null volta a mostrar a estimativa por PA. */
  setGuildRankOverride: (value: CharacterData["overrides"]["guildRank"] | null) => void;
  addSkill: (name: string) => void;
  removeSkill: (name: string) => void;
  addItem: (item: Omit<InventoryItem, "id" | "equipped">) => void;
  /** Loja da Guilda (Cap. 5, §2): debita `price` de `gold` e adiciona o item numa única operação. Retorna false (e não muda nada) se faltar PO ou se `requiredGuildRank` for maior que o Rank de Guilda atual. */
  buyItem: (item: Omit<InventoryItem, "id" | "equipped">, price: number, requiredGuildRank: GuildRank) => boolean;
  removeItem: (itemId: string) => void;
  /** Edição livre de qualquer campo do item (nome, dado, +CA, descrição...), sem precisar apagar e recriar. */
  updateItem: (itemId: string, patch: Partial<Omit<InventoryItem, "id">>) => void;
  toggleEquipped: (itemId: string) => void;
  /** Retorna false (e não muda nada) se a regra de desbloqueio do Cap. 1 não for satisfeita. */
  unlockRank: (treeId: string, rank: RankName) => boolean;
  /** Retorna false (e não muda nada) se o rank não estiver desbloqueado ou já foi comprado. */
  purchaseAbility: (ability: PurchasedAbility) => boolean;
  removeAbility: (treeId: string, id: string) => void;

  /** Desfaz a última edição de campo na ficha ativa (não desfaz criar/apagar/trocar de personagem). */
  undo: () => void;
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
  const previousStack = state.history[state.activeId] ?? [];
  const nextStack = [...previousStack, current].slice(-HISTORY_LIMIT);
  set({
    characters: { ...state.characters, [state.activeId]: updater(current) },
    history: { ...state.history, [state.activeId]: nextStack },
  });
}

export const useCharacterStore = create<RosterState>()(
  persist(
    (set, get) => ({
      characters: {},
      order: [],
      activeId: null,
      history: {},

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
        // JSON exportado antes do campo `lore` existir não traz essa chave — preenche vazio.
        const character: CharacterData = { ...data, id, lore: data.lore ?? "" };
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
      setLore: (lore) => updateActive(get, set, (c) => ({ ...c, lore })),
      // Trocar de raça zera as escolhas dependentes dela: o +1 livre e as compras
      // raciais pertencem à raça anterior e não fazem sentido na nova.
      setRace: (raceId) =>
        updateActive(get, set, (c) => ({ ...c, raceId, raceAttributeChoices: [], racialUpgrades: [] })),
      setRaceAttributeChoice: (index, key) =>
        updateActive(get, set, (c) => {
          const next = [...(c.raceAttributeChoices ?? [])];
          if (key === null) next.splice(index, 1);
          else next[index] = key;
          return { ...c, raceAttributeChoices: next.filter(Boolean) };
        }),
      setTreeSkillChoice: (index, skill) =>
        updateActive(get, set, (c) => {
          const next = [...(c.treeSkillChoices ?? [])];
          if (skill === null) next.splice(index, 1);
          else next[index] = skill;
          return { ...c, treeSkillChoices: next.filter(Boolean) };
        }),
      addProficiency: (name) =>
        updateActive(get, set, (c) => {
          const limpo = name.trim();
          const atuais = c.proficiencies ?? [];
          if (!limpo || atuais.some((p) => p.toLowerCase() === limpo.toLowerCase())) return c;
          return { ...c, proficiencies: [...atuais, limpo] };
        }),
      removeProficiency: (name) =>
        updateActive(get, set, (c) => ({
          ...c,
          proficiencies: (c.proficiencies ?? []).filter((p) => p !== name),
        })),
      toggleSaveAdvantage: (key) =>
        updateActive(get, set, (c) => {
          const atuais = c.saveAdvantages ?? [];
          return {
            ...c,
            saveAdvantages: atuais.includes(key)
              ? atuais.filter((k) => k !== key)
              : [...atuais, key],
          };
        }),
      toggleRacialUpgrade: (upgradeId) =>
        updateActive(get, set, (c) => {
          const atuais = c.racialUpgrades ?? [];
          return {
            ...c,
            racialUpgrades: atuais.includes(upgradeId)
              ? atuais.filter((id) => id !== upgradeId)
              : [...atuais, upgradeId],
          };
        }),
      setBackground: (backgroundId) =>
        updateActive(get, set, (c) => ({ ...c, backgroundId, subtableEntryId: null })),
      setSubtableEntry: (subtableEntryId) => updateActive(get, set, (c) => ({ ...c, subtableEntryId })),
      setAttribute: (key, value) =>
        updateActive(get, set, (c) => ({ ...c, attributeBase: { ...c.attributeBase, [key]: value } })),
      // Trocar a Árvore Inicial (Cap. 1 §4: desbloqueia o 1º patamar dela de graça) não pode
      // deixar a escolha anterior "comprada" pra sempre — se o jogador mudou de ideia antes de
      // mexer em mais nada naquela árvore (nada comprado, nenhum rank além do Principiante),
      // o Principiante antigo sai e o da nova árvore entra. Se ele já tinha progredido de
      // verdade na árvore anterior (fora do fluxo de criação), isso fica intocado.
      // Trocar a Árvore Inicial zera as escolhas de perícia dela: elas pertenciam
      // à árvore anterior, e o Cap. 1 §4 só concede perícias da Árvore INICIAL.
      setStartingTree: (startingTreeId) =>
        updateActive(get, set, (c) => {
          const previous = c.startingTreeId;
          const previousUntouched =
            previous &&
            previous !== startingTreeId &&
            !c.purchasedAbilities.some((a) => a.treeId === previous) &&
            c.unlockedRanks.filter((u) => u.treeId === previous).every((u) => u.rank === "Principiante");
          const unlockedRanks = previousUntouched
            ? c.unlockedRanks.filter((u) => u.treeId !== previous)
            : c.unlockedRanks;
          const alreadyUnlocked =
            !startingTreeId || unlockedRanks.some((u) => u.treeId === startingTreeId && u.rank === "Principiante");
          return {
            ...c,
            startingTreeId,
            // As escolhas de perícia pertenciam à árvore anterior; a nova tem
            // outra lista (ou nenhuma). Manter significaria carregar uma perícia
            // que a Árvore Inicial atual não ensina.
            treeSkillChoices: startingTreeId === previous ? c.treeSkillChoices : [],
            unlockedRanks:
              startingTreeId && !alreadyUnlocked
                ? [...unlockedRanks, { treeId: startingTreeId, rank: "Principiante" as RankName }]
                : unlockedRanks,
          };
        }),
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
      setGuildRankOverride: (value) =>
        updateActive(get, set, (c) => {
          const overrides = { ...c.overrides };
          if (value === null) delete overrides.guildRank;
          else overrides.guildRank = value;
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
      buyItem: (item, price, requiredGuildRank) => {
        const state = get();
        const active = state.activeId ? state.characters[state.activeId] : null;
        if (!active || active.gold < price) return false;
        if (!meetsGuildRank(getGuildRank(active), requiredGuildRank)) return false;
        updateActive(get, set, (c) => ({
          ...c,
          gold: c.gold - price,
          inventory: [...c.inventory, { ...item, id: makeId("item"), equipped: false }],
        }));
        return true;
      },
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

      undo: () => {
        const state = get();
        if (!state.activeId) return;
        const stack = state.history[state.activeId];
        if (!stack || stack.length === 0) return;
        const previous = stack[stack.length - 1];
        set({
          characters: { ...state.characters, [state.activeId]: previous },
          history: { ...state.history, [state.activeId]: stack.slice(0, -1) },
        });
      },
    }),
    {
      name: "mushoku-tensei-roster",
      skipHydration: true,
      // v5: adicionou `lore` (texto livre) em CharacterData — preserva o roster e só completa o
      // campo novo, porque a partir daqui já existem fichas reais salvas (loja, PO, inventário
      // testados em sessão real). Versões anteriores a v4 continuam resetando: o formato de antes
      // (sem currentHp/overrides) é velho o bastante pra não valer a pena migrar de verdade.
      // v6 (2026-08-29): o balanceamento racial trouxe dois campos novos —
      // `raceAttributeChoices` (o +1 livre do Humano) e `racialUpgrades` (a
      // Vantagem Absoluta do Povo Pequeno, 3 PA). Ficha antiga entra com os dois
      // vazios, que é exatamente o estado correto: ninguém escolheu nada ainda.
      // v7 (2026-08-29): Perícias de Árvore. `treeSkillChoices` guarda a escolha
      // do "escolha 1 destas três" da Árvore Inicial, e `proficiencies` a lista
      // de proficiências/línguas (1 PA compra 3). Ficha antiga entra com os dois
      // vazios — as perícias fixas da Árvore Inicial são derivadas, não salvas,
      // então aparecem sozinhas na ficha de quem já tinha uma árvore escolhida.
      // v8 (2026-08-29): `saveAdvantages` — a compra de Vantagem permanente em
      // Testes de Resistência (Cap. 1, §2), que existia no livro desde sempre e
      // nunca existiu na ficha. Baixou de 3 pra 2 PA na mesma passada.
      version: 8,
      migrate: (persistedState, version) => {
        if (version < 4) return { characters: {}, order: [], activeId: null };
        const prev = persistedState as { characters: Record<string, CharacterData>; order: string[]; activeId: string | null };
        return {
          ...prev,
          characters: Object.fromEntries(
            Object.entries(prev.characters).map(([id, c]) => [
              id,
              {
                ...c,
                lore: c.lore ?? "",
                raceAttributeChoices: c.raceAttributeChoices ?? [],
                racialUpgrades: c.racialUpgrades ?? [],
                treeSkillChoices: c.treeSkillChoices ?? [],
                proficiencies: c.proficiencies ?? [],
                saveAdvantages: c.saveAdvantages ?? [],
              },
            ])
          ),
        };
      },
      // history é só uma conveniência de sessão pro botão "Desfazer" — não faz sentido inchar o
      // localStorage guardando fichas inteiras duplicadas, e não precisa sobreviver a um recarregamento.
      partialize: (state) => ({ characters: state.characters, order: state.order, activeId: state.activeId }),
    }
  )
);

/** Ficha atualmente ativa, com fallback seguro pra antes do roster carregar/hidratar. */
export function useActiveCharacter(): CharacterData {
  const activeId = useCharacterStore((s) => s.activeId);
  const character = useCharacterStore((s) => (activeId ? s.characters[activeId] : undefined));
  return character ?? blankCharacter("__none__", "");
}
