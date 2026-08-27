import { Check } from "lucide-react";
import { getTreeGroups, getTreeById, CATEGORY_LABELS } from "@/data/trees";

/** Grade de botões pra escolher a Árvore Inicial (Cap. 1, seção 4) — usada no wizard manual, na Roleta e na Entrevista. */
export default function TreePicker({
  selectedTreeId,
  onSelect,
}: {
  selectedTreeId: string | null;
  onSelect: (treeId: string) => void;
}) {
  const treeGroups = getTreeGroups()
    .map((group) => ({ ...group, trees: group.trees.filter((t) => !t.hiddenFromCreation) }))
    .filter((group) => group.trees.length > 0);
  const selectedTree = getTreeById(selectedTreeId);

  return (
    <div>
      <div className="space-y-3">
        {treeGroups.map((group) => (
          <div key={`${group.category}-${group.subgroup}`}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-parchment-500 dark:text-parchment-400">
              {CATEGORY_LABELS[group.category]} — {group.subgroup}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.trees.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelect(t.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedTreeId === t.id
                      ? "bg-wine-600 text-white"
                      : "bg-parchment-50 text-parchment-600 ring-1 ring-parchment-300 hover:bg-parchment-200 dark:bg-parchment-900 dark:text-parchment-300 dark:ring-parchment-700"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selectedTree && (
        <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-wine-600 dark:text-wine-400">
          <Check className="h-4 w-4" /> Árvore Inicial: {selectedTree.name}
        </p>
      )}
    </div>
  );
}
