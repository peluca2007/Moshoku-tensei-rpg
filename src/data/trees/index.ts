import { Tree } from "@/lib/types";
import { AGUA_TREE } from "./agua";
import { PLACEHOLDER_TREES } from "./placeholders";

const byId = new Map(PLACEHOLDER_TREES.map((t) => [t.id, t]));

/** Ordem de exibição = mesma ordem do grafo de árvores (Magia -> Corpo -> Utilidade). */
export const TREES: Tree[] = [
  byId.get("fogo")!,
  AGUA_TREE,
  byId.get("vento")!,
  byId.get("terra")!,
  byId.get("cura")!,
  byId.get("barreira")!,
  byId.get("invocacao")!,
  byId.get("deus-da-espada")!,
  byId.get("deus-da-agua-corpo")!,
  byId.get("deus-do-norte")!,
  byId.get("armas-pesadas")!,
  byId.get("cavalaria-e-escudos")!,
  byId.get("arquearia")!,
  byId.get("furtividade-e-armadilhas")!,
  byId.get("bardo-e-interacao")!,
  byId.get("navegacao-e-lideranca")!,
];

export function getTreeById(id: string | null): Tree | undefined {
  return TREES.find((t) => t.id === id);
}

export function isTreeEmpty(tree: Tree): boolean {
  return tree.ranks.length === 0;
}

export interface TreeGroup {
  category: Tree["category"];
  subgroup: string;
  trees: Tree[];
}

const CATEGORY_ORDER: Tree["category"][] = ["magia", "corpo", "utilidade"];

export const CATEGORY_LABELS: Record<Tree["category"], string> = {
  magia: "Árvore de Magia",
  corpo: "Árvore do Corpo",
  utilidade: "Árvore de Utilidade",
};

/** Agrupa as árvores por categoria -> subgrupo, preservando a ordem de TREES. */
export function getTreeGroups(): TreeGroup[] {
  const groups: TreeGroup[] = [];
  for (const category of CATEGORY_ORDER) {
    const treesInCategory = TREES.filter((t) => t.category === category);
    const subgroupsSeen: string[] = [];
    for (const tree of treesInCategory) {
      if (!subgroupsSeen.includes(tree.subgroup)) subgroupsSeen.push(tree.subgroup);
    }
    for (const subgroup of subgroupsSeen) {
      groups.push({
        category,
        subgroup,
        trees: treesInCategory.filter((t) => t.subgroup === subgroup),
      });
    }
  }
  return groups;
}
