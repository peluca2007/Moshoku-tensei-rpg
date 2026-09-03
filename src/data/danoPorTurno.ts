/**
 * Apêndice C — a régua de dano por turno.
 *
 * Isto era uma tabela escrita à mão dentro de `Appendices.tsx`: 15 colunas × 6
 * linhas de valores "~N" digitados na prosa. O livro a chama de "a régua com que
 * toda árvore futura deve ser medida" — e ela era a única régua do livro que
 * ninguém verificava.
 *
 * Ela ficou errada exatamente como o esperado: o Sopro Podre caiu de 10d8 pra
 * 6d8 no rework de 2026-09-03 e a coluna da Desintoxicação continuou anunciando
 * ~55 no 5º patamar, um número que a escola não alcançava mais. Nenhum leitor
 * tinha como saber.
 *
 * Mover pra cá não torna os números automáticos — eles continuam sendo uma
 * CALIBRAGEM humana, e têm que ser: "dano por turno" embute quantas Ações a
 * árvore gasta, quantos alvos ela pega, e se o alvo veste Touki. Nada disso está
 * nos dados de uma magia isolada.
 *
 * O que muda é que agora existe um piso verificável. `npm run check:livro`
 * compara cada célula com a média do MAIOR golpe único daquela árvore naquele
 * patamar: uma coluna de dano por turno pode ficar acima desse valor (várias
 * Ações, vários alvos), mas nunca abaixo dele. Quando um nerf derruba uma magia
 * abaixo do que a régua promete, o check avisa — em vez de a promessa
 * envelhecer em silêncio por seis meses.
 */

/**
 * Uma coluna da régua.
 *
 * `regua: false` marca as colunas que o próprio livro diz NÃO serem uma
 * medida de dano, e que por isso o check não verifica:
 *
 * - Cura, Desintoxicação e Barreira — "não deveriam estar nesta tabela; estão
 *   só pra deixar claro que, se você escolher uma delas esperando causar dano,
 *   escolheu errado" (Apêndice C).
 * - Escudos — "pressupõe todas as Ações gastas defendendo. Um Defensor
 *   Imperador que ESCOLHA atacar faz perto de 48 por turno, não 18. A coluna
 *   mede o que ele faz no papel dele, não o teto dele."
 *
 * Verificar essas quatro contra o maior golpe delas seria cobrar da tabela uma
 * promessa que ela nunca fez.
 */
export interface ColunaDano {
  treeId: string;
  label: string;
  /** false = a coluna mede outra coisa; o check ignora. Padrão: true. */
  regua?: boolean;
}

export interface DanoPorTurnoLinha {
  /** Patamar, de "1º" a "6º". */
  patamar: string;
  /** Valor por árvore — a chave é o `id` da árvore em src/data/trees. */
  porArvore: Record<string, string>;
}

/** As colunas da primeira tabela (Magia), na ordem em que o livro as imprime. */
export const COLUNAS_MAGIA: ColunaDano[] = [
  { treeId: "agua", label: "Água" },
  { treeId: "fogo", label: "Fogo" },
  { treeId: "vento", label: "Vento" },
  { treeId: "terra", label: "Terra" },
  { treeId: "cura", label: "Cura", regua: false },
  { treeId: "desintoxicacao", label: "Desintox", regua: false },
  { treeId: "barreira", label: "Barreira", regua: false },
  { treeId: "invocacao", label: "Invocação" },
];

/** As colunas da segunda tabela (Corpo e Utilidade). */
export const COLUNAS_CORPO: ColunaDano[] = [
  { treeId: "deus-da-espada", label: "Espada" },
  { treeId: "deus-do-norte", label: "Norte" },
  { treeId: "deus-da-agua-corpo", label: "Suishin" },
  { treeId: "arquearia", label: "Arco" },
  { treeId: "armas-pesadas", label: "Lutador" },
  { treeId: "cavalaria-e-escudos", label: "Escudos", regua: false },
  { treeId: "__utilidade", label: "Utilidade", regua: false },
];

export const DANO_POR_TURNO_MAGIA: DanoPorTurnoLinha[] = [
  { patamar: "1º", porArvore: { agua: "~10", fogo: "~12", vento: "~9", terra: "~11", cura: "—", desintoxicacao: "~9", barreira: "—", invocacao: "~13" } },
  { patamar: "2º", porArvore: { agua: "~20", fogo: "~26", vento: "~18", terra: "~24", cura: "—", desintoxicacao: "~9", barreira: "—", invocacao: "~24" } },
  { patamar: "3º", porArvore: { agua: "~28", fogo: "~40", vento: "~32", terra: "~36", cura: "—", desintoxicacao: "~14", barreira: "—", invocacao: "~38" } },
  { patamar: "4º", porArvore: { agua: "~22 + área", fogo: "~62", vento: "~45", terra: "~52", cura: "—", desintoxicacao: "~14", barreira: "—", invocacao: "~55" } },
  { patamar: "5º", porArvore: { agua: "~54", fogo: "~90", vento: "~70", terra: "~76", cura: "~40", desintoxicacao: "~32", barreira: "~30", invocacao: "~80" } },
  { patamar: "6º", porArvore: { agua: "~39 em 45m", fogo: "~130", vento: "~110", terra: "~105", cura: "~55", desintoxicacao: "~32", barreira: "~40", invocacao: "~110" } },
];

export const DANO_POR_TURNO_CORPO: DanoPorTurnoLinha[] = [
  { patamar: "1º", porArvore: { "deus-da-espada": "~25", "deus-do-norte": "~19", "deus-da-agua-corpo": "~11", arquearia: "~22", "armas-pesadas": "~21", "cavalaria-e-escudos": "~7", __utilidade: "~15 (1º turno)" } },
  { patamar: "2º", porArvore: { "deus-da-espada": "~34", "deus-do-norte": "~25", "deus-da-agua-corpo": "~26", arquearia: "~34", "armas-pesadas": "~32", "cavalaria-e-escudos": "~9", __utilidade: "~18" } },
  { patamar: "3º", porArvore: { "deus-da-espada": "~62", "deus-do-norte": "~34", "deus-da-agua-corpo": "~40", arquearia: "~48", "armas-pesadas": "~44", "cavalaria-e-escudos": "~11", __utilidade: "~22" } },
  { patamar: "4º", porArvore: { "deus-da-espada": "~78", "deus-do-norte": "~42", "deus-da-agua-corpo": "~60", arquearia: "~62", "armas-pesadas": "~58", "cavalaria-e-escudos": "~13", __utilidade: "~26" } },
  { patamar: "5º", porArvore: { "deus-da-espada": "~98", "deus-do-norte": "~55", "deus-da-agua-corpo": "~85", arquearia: "~78", "armas-pesadas": "~74", "cavalaria-e-escudos": "~15", __utilidade: "~30" } },
  { patamar: "6º", porArvore: { "deus-da-espada": "~118", "deus-do-norte": "~87", "deus-da-agua-corpo": "0 a ∞", arquearia: "~91", "armas-pesadas": "~95", "cavalaria-e-escudos": "~18", __utilidade: "~31" } },
];

/** O número da célula, quando ela tem um. "—" e "0 a ∞" devolvem null de propósito. */
export function valorNumerico(celula: string): number | null {
  const m = celula.match(/~?(\d+)/);
  return m ? Number(m[1]) : null;
}
