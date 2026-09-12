/**
 * Os tipos de `arte.mjs`.
 *
 * O módulo é `.mjs` porque dois dos quatro scripts que o usam rodam no `node`
 * cru (`folha-de-contato`, `comprimir-midia`) e não passam pelo tsx. Os outros
 * dois são `.mts` e, sem este arquivo, recebem `any` de `listarArte()` — que é
 * exatamente o tipo que deixa um `.filter(f => f.nome)` passar no compilador e
 * quebrar em produção.
 */
export declare const PUBLIC: string;
export declare const PASTA_DA_ARTE: string;
export declare const EXTENSOES_DE_ARTE: RegExp;

/** Caminhos relativos a `public/arte/`, com `/` como separador. */
export declare function listarArte(pasta?: string, prefixo?: string): string[];

/** A URL pública de um caminho devolvido por `listarArte`. */
export declare function urlDaArte(relativo: string): string;
