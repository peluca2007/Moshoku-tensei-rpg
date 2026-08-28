"use client";

import { useState } from "react";
import { Backpack, Plus, Trash2, ShieldCheck, Pencil, Swords, Check, X, Dices } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { useDiceRollerStore } from "@/store/useDiceRollerStore";
import { getWeaponDamage } from "@/store/selectors";
import { AttributeKey, InventoryItem } from "@/lib/types";
import { WEAPON_PRESETS } from "@/lib/weaponDie";

const TYPE_LABELS: Record<InventoryItem["type"], string> = {
  arma: "Arma",
  armadura: "Armadura",
  geral: "Geral",
};

const DAMAGE_ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  forca: "Força",
  agilidade: "Agilidade",
  vigor: "Vigor",
  intelecto: "Intelecto",
  espirito: "Espírito",
};

/** Formulário de edição livre de um item — reaproveitado tanto pra criar quanto pra editar in-place. */
function ItemFields({
  name,
  setName,
  type,
  setType,
  acBonus,
  setAcBonus,
  baseDie,
  setBaseDie,
  damageAttribute,
  setDamageAttribute,
  description,
  setDescription,
}: {
  name: string;
  setName: (v: string) => void;
  type: InventoryItem["type"];
  setType: (v: InventoryItem["type"]) => void;
  acBonus: string;
  setAcBonus: (v: string) => void;
  baseDie: string;
  setBaseDie: (v: string) => void;
  damageAttribute: AttributeKey;
  setDamageAttribute: (v: AttributeKey) => void;
  description: string;
  setDescription: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex-1 min-w-[140px]">
        <label className="mb-1 block text-[11px] font-semibold uppercase text-parchment-500 dark:text-parchment-400">
          Nome
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Armadura de Couro"
          className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
        />
      </div>
      <div className="flex-1 min-w-[160px]">
        <label className="mb-1 block text-[11px] font-semibold uppercase text-parchment-500 dark:text-parchment-400">
          Descrição (opcional)
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: dada pelo mestre da guilda"
          className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase text-parchment-500 dark:text-parchment-400">
          Tipo
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as InventoryItem["type"])}
          className="rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
        >
          <option value="geral">Geral</option>
          <option value="arma">Arma</option>
          <option value="armadura">Armadura</option>
        </select>
      </div>
      {type === "armadura" && (
        <div className="w-20">
          <label className="mb-1 block text-[11px] font-semibold uppercase text-parchment-500 dark:text-parchment-400">
            +CA
          </label>
          <input
            type="number"
            value={acBonus}
            onChange={(e) => setAcBonus(e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
          />
        </div>
      )}
      {type === "arma" && (
        <>
          <div className="w-36">
            <label className="mb-1 block text-[11px] font-semibold uppercase text-parchment-500 dark:text-parchment-400">
              Dado Base
            </label>
            <input
              list="weapon-die-presets"
              value={baseDie}
              onChange={(e) => setBaseDie(e.target.value)}
              placeholder="Ex: d6 ou 2d8"
              title="Escolha um preset do Cap. 3 ou digite qualquer dado — homebrew do Mestre é livre."
              className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            />
            <datalist id="weapon-die-presets">
              {WEAPON_PRESETS.map((w) => (
                <option key={w.name} value={w.die}>
                  {w.name}
                </option>
              ))}
            </datalist>
          </div>
          <div className="w-28">
            <label className="mb-1 block text-[11px] font-semibold uppercase text-parchment-500 dark:text-parchment-400">
              Atributo
            </label>
            <select
              value={damageAttribute}
              onChange={(e) => setDamageAttribute(e.target.value as AttributeKey)}
              className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            >
              {Object.entries(DAMAGE_ATTRIBUTE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}

function useItemForm(initial?: Partial<InventoryItem>) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<InventoryItem["type"]>(initial?.type ?? "geral");
  const [acBonus, setAcBonus] = useState(initial?.acBonus !== undefined ? String(initial.acBonus) : "");
  const [baseDie, setBaseDie] = useState(initial?.baseDie ?? "");
  const [damageAttribute, setDamageAttribute] = useState<AttributeKey>("forca");
  const [description, setDescription] = useState(initial?.description ?? "");

  function changeType(next: InventoryItem["type"]) {
    setType(next);
    // Campos só fazem sentido pro tipo certo — troca de tipo limpa pra não colar valor de outro item.
    if (next !== "armadura") setAcBonus("");
    if (next !== "arma") setBaseDie("");
  }

  return {
    name, setName,
    type, setType: changeType,
    acBonus, setAcBonus,
    baseDie, setBaseDie,
    damageAttribute, setDamageAttribute,
    description, setDescription,
    reset: () => {
      setName(""); setType("geral"); setAcBonus(""); setBaseDie(""); setDescription("");
    },
    toPatch: (): Omit<InventoryItem, "id" | "equipped"> => ({
      name: name.trim(),
      type,
      acBonus: type === "armadura" && acBonus ? Number(acBonus) : undefined,
      baseDie: type === "arma" && baseDie ? baseDie : undefined,
      damageAttribute: type === "arma" && baseDie ? damageAttribute : undefined,
      description: description.trim() || undefined,
    }),
  };
}

function WeaponDamageBadge({ item }: { item: InventoryItem }) {
  const character = useActiveCharacter();
  const requestDamageRoll = useDiceRollerStore((s) => s.requestDamageRoll);
  if (item.type !== "arma" || !item.baseDie) return null;

  const info = getWeaponDamage(character, item.baseDie, item.damageAttribute ?? "forca");
  if (!info) {
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-parchment-500 dark:text-parchment-400">
        <Swords className="h-3 w-3" /> {item.baseDie} — desbloqueie um Rank do Corpo pra calcular o dano.
      </p>
    );
  }

  return (
    <p className="mt-1 flex flex-wrap items-center gap-1 text-xs font-medium text-wine-700 dark:text-wine-300">
      <Swords className="h-3 w-3" />
      {info.escalatedDie} + {DAMAGE_ATTRIBUTE_LABELS[info.attribute]} + Rank ({info.treeName} {info.rankLabel}, +
      {info.rankBonus}) · média {info.averageDamage}
      <button
        type="button"
        onClick={() =>
          requestDamageRoll({
            formula: info.escalatedDie,
            modifier: info.attributeValue + info.rankBonus,
            label: item.name,
          })
        }
        title="Abrir o Rolador de Dados já com esse dano pronto pra rolar (dá pra editar antes)"
        className="ml-1 flex items-center gap-1 rounded-full bg-wine-600 px-2 py-0.5 text-[11px] font-semibold text-white transition-colors hover:bg-wine-500"
      >
        <Dices className="h-3 w-3" /> Rolar
      </button>
    </p>
  );
}

export default function InventorySection() {
  const character = useActiveCharacter();
  const inventory = character.inventory;
  const [editingId, setEditingId] = useState<string | null>(null);
  const addForm = useItemForm();
  const editForm = useItemForm();

  function addItem() {
    if (!addForm.name.trim()) return;
    useCharacterStore.getState().addItem(addForm.toPatch());
    addForm.reset();
  }

  function startEdit(item: InventoryItem) {
    editForm.setName(item.name);
    editForm.setType(item.type);
    editForm.setAcBonus(item.acBonus !== undefined ? String(item.acBonus) : "");
    editForm.setBaseDie(item.baseDie ?? "");
    editForm.setDamageAttribute(item.damageAttribute ?? "forca");
    editForm.setDescription(item.description ?? "");
    setEditingId(item.id);
  }

  function saveEdit(itemId: string) {
    if (!editForm.name.trim()) return;
    useCharacterStore.getState().updateItem(itemId, editForm.toPatch());
    setEditingId(null);
  }

  return (
    <section className="rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-parchment-900 dark:text-parchment-50">
        <Backpack className="h-5 w-5 text-wine-500" /> Inventário
      </h2>

      {inventory.length === 0 && (
        <p className="mb-3 rounded-xl border border-dashed border-parchment-300 p-4 text-center text-sm text-parchment-500 dark:border-parchment-700 dark:text-parchment-400">
          Nenhum item ainda.
        </p>
      )}

      <div className="mb-3 space-y-2">
        {inventory.map((item) =>
          editingId === item.id ? (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-wine-400 bg-parchment-100/80 p-2.5 dark:border-wine-600 dark:bg-parchment-950/50"
            >
              <ItemFields
                name={editForm.name} setName={editForm.setName}
                type={editForm.type} setType={editForm.setType}
                acBonus={editForm.acBonus} setAcBonus={editForm.setAcBonus}
                baseDie={editForm.baseDie} setBaseDie={editForm.setBaseDie}
                damageAttribute={editForm.damageAttribute} setDamageAttribute={editForm.setDamageAttribute}
                description={editForm.description} setDescription={editForm.setDescription}
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="flex items-center gap-1 rounded-lg border border-parchment-300 px-2.5 py-1 text-xs font-semibold text-parchment-600 hover:border-parchment-400 dark:border-parchment-700 dark:text-parchment-300"
                >
                  <X className="h-3.5 w-3.5" /> Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => saveEdit(item.id)}
                  className="flex items-center gap-1 rounded-lg bg-wine-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-wine-500"
                >
                  <Check className="h-3.5 w-3.5" /> Salvar
                </button>
              </div>
            </div>
          ) : (
            <div
              key={item.id}
              className="flex items-start justify-between gap-2 rounded-xl border border-parchment-300 bg-parchment-100/80 p-2.5 dark:border-parchment-800 dark:bg-parchment-950/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-parchment-900 dark:text-parchment-50">{item.name}</p>
                <p className="text-xs text-parchment-500 dark:text-parchment-400">
                  {TYPE_LABELS[item.type]}
                  {item.type === "armadura" && item.acBonus ? ` · +${item.acBonus} CA` : ""}
                  {item.type === "arma" && item.baseDie ? ` · Dado Base ${item.baseDie}` : ""}
                </p>
                {item.description && (
                  <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-300">{item.description}</p>
                )}
                <WeaponDamageBadge item={item} />
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {item.type === "armadura" && item.acBonus !== undefined && (
                  <button
                    type="button"
                    onClick={() => useCharacterStore.getState().toggleEquipped(item.id)}
                    title={item.equipped ? "Desequipar" : "Equipar"}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                      item.equipped
                        ? "bg-emerald-500 text-white hover:bg-emerald-400"
                        : "bg-parchment-200 text-parchment-600 hover:bg-parchment-300 dark:bg-parchment-800 dark:text-parchment-300 dark:hover:bg-parchment-700"
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> {item.equipped ? "Equipado" : "Equipar"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  title="Editar item"
                  aria-label={`Editar ${item.name}`}
                  className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 transition-colors hover:border-wine-300 hover:text-wine-500 dark:border-parchment-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => useCharacterStore.getState().removeItem(item.id)}
                  title="Remover item"
                  aria-label={`Remover ${item.name}`}
                  className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 transition-colors hover:border-rose-300 hover:text-rose-500 dark:border-parchment-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <div className="flex flex-wrap items-end gap-2 border-t border-parchment-300 pt-3 dark:border-parchment-800">
        <ItemFields
          name={addForm.name} setName={addForm.setName}
          type={addForm.type} setType={addForm.setType}
          acBonus={addForm.acBonus} setAcBonus={addForm.setAcBonus}
          baseDie={addForm.baseDie} setBaseDie={addForm.setBaseDie}
          damageAttribute={addForm.damageAttribute} setDamageAttribute={addForm.setDamageAttribute}
          description={addForm.description} setDescription={addForm.setDescription}
        />
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 rounded-lg bg-wine-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-wine-500"
        >
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>
    </section>
  );
}
