import { Tree } from "@/lib/types";

/**
 * A frase única com que TODA árvore declara o que ensina (Cap. 1, §4 —
 * "Perícias de Árvore").
 *
 * Existe como função, e não como texto escrito 18 vezes nos dados, exatamente
 * porque escrever 18 vezes foi o que deu errado antes: cada árvore acabou com
 * uma redação diferente ("X é a perícia da escola", "X e Y são as perícias do
 * ofício"…) e NENHUMA das dezoito dizia a regra que importa — que essas perícias
 * só entram na ficha se aquela for a sua Árvore Inicial.
 *
 * Gerando a frase de `tree.grantedSkills`, as três superfícies que a mostram
 * (catálogo do livro, mapa de árvores e o PDF em LaTeX) dizem a mesma coisa, com
 * as mesmas palavras, e uma árvore nova entra no padrão sem ninguém lembrar de
 * copiar a frase.
 */
export function describeGrantedSkills(tree: Tree): string | null {
  const g = tree.grantedSkills;
  if (!g) return null;

  const fixas = listar(g.fixed);
  if (!g.choose) return `${fixas}.`;
  return `${fixas} — mais ${g.choose.count} à sua escolha entre ${listar(g.choose.from)}.`;
}

/**
 * A exceção da árvore, quando ela tem uma. Hoje só Furtividade e Armadilhas:
 * a Maestria de 1º patamar ensina as perícias mesmo a quem chegou depois.
 */
export function describeMasteryException(tree: Tree): string | null {
  if (!tree.masterySkillsWhenNotFirst?.length) return null;
  return `Exceção única do livro: se esta NÃO for a sua Árvore Inicial, a Maestria de 1º patamar ainda ensina ${listar(
    tree.masterySkillsWhenNotFirst
  )}.`;
}

/** "A, B e C" — a vírgula serial não existe em português, e "A e B" não leva vírgula. */
function listar(itens: string[]): string {
  if (itens.length <= 1) return itens[0] ?? "";
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}
