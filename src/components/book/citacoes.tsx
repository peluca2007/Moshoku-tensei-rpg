import { cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import { TREES } from "@/data/trees";

/**
 * AS ÁRVORES CITADAS NO TEXTO — 2026-09-26.
 *
 * Pedido do autor: "sempre que uma árvore ou habilidade daquela árvore for
 * citada, mude a cor da fonte". No livro, cada citação ganha a cor da árvore,
 * o selo dela antes do nome e vira link pro catálogo da árvore — na mesa, a
 * citação é um atalho ("o Punho do Fogo combina com isso": um clique e você
 * está lá).
 *
 * ## Por que aqui, no servidor, e não no navegador
 *
 * Varrer o DOM do livro depois de montado e embrulhar o texto quebraria os
 * pedaços interativos: o React perde os nós de texto que ele mesmo criou. Aqui
 * a troca acontece na renderização, nos componentes do texto corrido (P, List,
 * BookTable, Aside, Warning, em BookUI.tsx). Títulos, links e o que já é
 * componente próprio ficam como estão.
 *
 * ## O que conta como citação
 *
 * - O nome inteiro da árvore ("Magia de Fogo", "Estilo Deus da Espada") e os
 *   apelidos com que o livro a chama ("Fogo", "Deus da Espada", "o Ladino").
 *   Sempre com maiúscula: "dano de fogo" e "a terra treme" não são a árvore.
 * - O nome de uma habilidade ou talento de duas palavras ou mais ("Bola de
 *   Fogo", "Zero Absoluto"). Nenhum nome se repete entre árvores, então não
 *   há dúvida de qual é a cor.
 * - Nome de uma palavra só é arriscado demais ("Explosão", "Investida",
 *   "Vazio" e "Casco" são palavras de regra também): só entram os
 *   inconfundíveis, listados em UMA_PALAVRA.
 */

const APELIDOS: Record<string, string[]> = {
  fogo: ["Fogo"],
  agua: ["Água"],
  vento: ["Vento"],
  terra: ["Terra"],
  cura: ["Cura"],
  desintoxicacao: ["Desintoxicação"],
  teorica: ["Teórica"],
  invocacao: ["Invocação"],
  "deus-da-espada": ["Deus da Espada"],
  "deus-da-agua-corpo": ["Deus da Água"],
  "deus-do-norte": ["Deus do Norte"],
  vendaval: ["Vendaval"],
  "bardo-e-interacao": ["Bardo"],
  "navegacao-e-lideranca": ["Tático"],
  "furtividade-e-armadilhas": ["Ladino"],
};

const UMA_PALAVRA = new Set([
  "Fagulha",
  "Flashover",
  "Detonação",
  "Cumulonimbus",
  "Maremoto",
  "Nevasca",
  "Enxurrada",
  "Dilúvio",
  "Atoleiro",
  "Cordilheira",
  "Sepultamento",
  "Prontidão",
  "Rosa-Preta",
  "Peçonha",
  "Quebra-Armadura",
  "Quebra-Guarda",
  "Contra-Investida",
  "Contra-Água",
  "Contra-Bateria",
  "Mestre-Chave",
  "Réquiem",
  "Elegia",
  "Cabeçada",
  "Agarrão",
]);

interface Citavel {
  arvore: string;
  tipo: "arvore" | "habilidade";
}

const CITAVEIS = new Map<string, Citavel>();
for (const t of TREES) {
  CITAVEIS.set(t.name, { arvore: t.id, tipo: "arvore" });
  for (const a of APELIDOS[t.id] ?? []) CITAVEIS.set(a, { arvore: t.id, tipo: "arvore" });
}
for (const t of TREES) {
  for (const r of t.ranks) {
    for (const h of [...r.abilities, ...r.talents]) {
      // "Investida Devastadora [Peso]": o texto cita sem a etiqueta.
      const nome = h.name.replace(/\s*\[[^\]]*\]/g, "").trim();
      if (CITAVEIS.has(nome)) continue;
      if (nome.split(/\s+/).length < 2 && !UMA_PALAVRA.has(nome)) continue;
      CITAVEIS.set(nome, { arvore: t.id, tipo: "habilidade" });
    }
  }
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// O mais longo primeiro: "Punho do Fogo" antes de "Fogo", "Deus da Água" antes
// de "Água". Nas bordas, nada de letra colada ("Fogos", "Aterrado").
const PADRAO = new RegExp(
  `(?<![\\p{L}\\p{N}-])(${[...CITAVEIS.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapar)
    .join("|")})(?![\\p{L}\\p{N}-])`,
  "gu",
);

/** Onde não se cita: dentro de link (link dentro de link), código e títulos. */
const PULAR = new Set(["a", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "svg", "summary"]);

function citarTexto(texto: string): ReactNode {
  PADRAO.lastIndex = 0;
  if (!PADRAO.test(texto)) return texto;
  PADRAO.lastIndex = 0;
  const partes: ReactNode[] = [];
  let desde = 0;
  for (const m of texto.matchAll(PADRAO)) {
    const i = m.index ?? 0;
    if (i > desde) partes.push(texto.slice(desde, i));
    const c = CITAVEIS.get(m[0])!;
    partes.push(
      <a key={i} href={`#arvore-${c.arvore}`} className="livro-citacao" data-arvore={c.arvore} data-tipo={c.tipo}>
        {m[0]}
      </a>,
    );
    desde = i + m[0].length;
  }
  if (desde < texto.length) partes.push(texto.slice(desde));
  return partes;
}

/**
 * Troca as citações de árvore e habilidade do texto por links coloridos.
 * Desce pelos elementos de texto (b, i, span…) e para em componente, link e
 * título: o que é componente cuida do próprio texto.
 */
export function citar(no: ReactNode): ReactNode {
  if (typeof no === "string") return citarTexto(no);
  if (Array.isArray(no)) return no.map((filho, i) => <Fragment key={i}>{citar(filho)}</Fragment>);
  if (isValidElement(no) && typeof no.type === "string" && !PULAR.has(no.type)) {
    const el = no as ReactElement<{ children?: ReactNode }>;
    if (el.props.children === undefined) return el;
    return cloneElement(el, undefined, citar(el.props.children));
  }
  return no;
}
