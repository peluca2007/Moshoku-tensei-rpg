import { Tree } from "@/lib/types";
import Crest from "./Crest";

/**
 * O brasão de uma árvore. Fininho de propósito: tudo que é apresentação mora em
 * `Crest`, que os ícones da loja também usam — as duas coleções chegaram com o
 * mesmo problema de formatos e fundos misturados, e resolver duas vezes seria
 * garantir que as duas divergissem.
 */
export default function TreeCrest({
  tree,
  size = 32,
  className = "",
  rounded = "rounded-lg",
}: {
  tree: Pick<Tree, "icon" | "name">;
  size?: number;
  className?: string;
  rounded?: string;
}) {
  if (!tree.icon) return null;
  return <Crest src={tree.icon} size={size} className={className} rounded={rounded} />;
}
