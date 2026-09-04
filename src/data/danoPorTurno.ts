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
  /*
   * As tres arvores de Utilidade, cada uma com a propria coluna (0.1.12).
   *
   * Ate aqui elas dividiam UMA coluna chamada "Utilidade", e a razao era
   * constrangedora: duas das tres nao tinham dano NENHUM. So o Ladino tinha, e
   * ainda assim escondido — o Dano Furtivo vive na Maestria de 1o patamar, e
   * nao num campo `damage`, entao nenhuma conta do projeto o enxergava.
   *
   * Uma coluna para tres arvores diferentes e uma coluna que nao descreve
   * nenhuma delas. Agora o Bardo tem a Dissonancia e o Tatico tem a Ordem de
   * Tiro (as duas na Maestria de 1o, escalando por patamar, no mesmo molde que
   * o Ladino ja usava), e as tres tem numeros proprios.
   *
   * A ordem entre elas nao e acidente: o Ladino e o maior porque a arvore dele
   * diz, em texto, que e "a unica arvore de Utilidade com dano de verdade"; o
   * Bardo e o menor porque o dano dele e efeito colateral de uma habilidade
   * social, e cobra area em troca; o Tatico fica no meio, e o dano dele nem sai
   * da arma dele — sai do aliado que ele mandou atirar.
   */
  { treeId: "furtividade-e-armadilhas", label: "Ladino" },
  { treeId: "navegacao-e-lideranca", label: "Tático" },
  { treeId: "bardo-e-interacao", label: "Bardo" },
];

export const DANO_POR_TURNO_MAGIA: DanoPorTurnoLinha[] = [
  { patamar: "1º", porArvore: { agua: "~10", fogo: "~12", vento: "~9", terra: "~11", cura: "—", desintoxicacao: "~12", barreira: "—", invocacao: "~13" } },
  { patamar: "2º", porArvore: { agua: "~20", fogo: "~26", vento: "~18", terra: "~24", cura: "—", desintoxicacao: "~13", barreira: "—", invocacao: "~24" } },
  { patamar: "3º", porArvore: { agua: "~28", fogo: "~40", vento: "~32", terra: "~36", cura: "—", desintoxicacao: "~16", barreira: "—", invocacao: "~38" } },
  { patamar: "4º", porArvore: { agua: "~22 + área", fogo: "~62", vento: "~45", terra: "~52", cura: "—", desintoxicacao: "~17", barreira: "—", invocacao: "~55" } },
  { patamar: "5º", porArvore: { agua: "~54", fogo: "~90", vento: "~70", terra: "~76", cura: "~40", desintoxicacao: "~34", barreira: "~30", invocacao: "~80" } },
  { patamar: "6º", porArvore: { agua: "~39 em 45m", fogo: "~130", vento: "~110", terra: "~105", cura: "~55", desintoxicacao: "~36", barreira: "~40", invocacao: "~110" } },
];

export const DANO_POR_TURNO_CORPO: DanoPorTurnoLinha[] = [
  { patamar: "1º", porArvore: { "deus-da-espada": "~25", "deus-do-norte": "~19", "deus-da-agua-corpo": "~11", arquearia: "~22", "armas-pesadas": "~21", "cavalaria-e-escudos": "~10", "furtividade-e-armadilhas": "~22", "navegacao-e-lideranca": "~18", "bardo-e-interacao": "~16" } },
  { patamar: "2º", porArvore: { "deus-da-espada": "~34", "deus-do-norte": "~25", "deus-da-agua-corpo": "~26", arquearia: "~34", "armas-pesadas": "~32", "cavalaria-e-escudos": "~13", "furtividade-e-armadilhas": "~29", "navegacao-e-lideranca": "~24", "bardo-e-interacao": "~21" } },
  { patamar: "3º", porArvore: { "deus-da-espada": "~62", "deus-do-norte": "~34", "deus-da-agua-corpo": "~40", arquearia: "~48", "armas-pesadas": "~44", "cavalaria-e-escudos": "~16", "furtividade-e-armadilhas": "~36", "navegacao-e-lideranca": "~30", "bardo-e-interacao": "~26" } },
  { patamar: "4º", porArvore: { "deus-da-espada": "~78", "deus-do-norte": "~42", "deus-da-agua-corpo": "~60", arquearia: "~62", "armas-pesadas": "~58", "cavalaria-e-escudos": "~19", "furtividade-e-armadilhas": "~43", "navegacao-e-lideranca": "~36", "bardo-e-interacao": "~31" } },
  { patamar: "5º", porArvore: { "deus-da-espada": "~98", "deus-do-norte": "~55", "deus-da-agua-corpo": "~85", arquearia: "~78", "armas-pesadas": "~74", "cavalaria-e-escudos": "~23", "furtividade-e-armadilhas": "~50", "navegacao-e-lideranca": "~42", "bardo-e-interacao": "~36" } },
  { patamar: "6º", porArvore: { "deus-da-espada": "~118", "deus-do-norte": "~87", "deus-da-agua-corpo": "0 a ∞", arquearia: "~91", "armas-pesadas": "~95", "cavalaria-e-escudos": "~27", "furtividade-e-armadilhas": "~55", "navegacao-e-lideranca": "~47", "bardo-e-interacao": "~40" } },
];

/** O número da célula, quando ela tem um. "—" e "0 a ∞" devolvem null de propósito. */
export function valorNumerico(celula: string): number | null {
  const m = celula.match(/~?(\d+)/);
  return m ? Number(m[1]) : null;
}
