import { Tree } from "@/lib/types";
import { AGUA_TREE } from "./agua";
import { FOGO_TREE } from "./fogo";
import { VENTO_TREE } from "./vento";
import { TERRA_TREE } from "./terra";
import { CURA_TREE } from "./cura";
import { DESINTOXICACAO_TREE } from "./desintoxicacao";
import { BARREIRA_TREE } from "./barreira";
import { INVOCACAO_TREE } from "./invocacao";
import { ESPADA_TREE } from "./espada";
import { SUISHIN_TREE } from "./suishin";
import { NORTE_TREE } from "./norte";
import { LUTADOR_TREE } from "./lutador";
import { ESCUDOS_TREE } from "./escudos";
import { ARQUEARIA_TREE } from "./arquearia";
import { LADINO_TREE } from "./ladino";
import { BARDO_TREE } from "./bardo";
import { TATICO_TREE } from "./tatico";
import { VENDAVAL_TREE } from "./vendaval";

/** Ordem de exibição = mesma ordem do grafo de árvores (Magia -> Corpo -> Utilidade), igual ao "Mapa Completo das Árvores" do livro. */
export const TREES: Tree[] = [
  FOGO_TREE,
  AGUA_TREE,
  VENTO_TREE,
  TERRA_TREE,
  CURA_TREE,
  DESINTOXICACAO_TREE,
  BARREIRA_TREE,
  INVOCACAO_TREE,
  ESPADA_TREE,
  SUISHIN_TREE,
  NORTE_TREE,
  LUTADOR_TREE,
  ESCUDOS_TREE,
  VENDAVAL_TREE,
  ARQUEARIA_TREE,
  LADINO_TREE,
  BARDO_TREE,
  TATICO_TREE,
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
