/**
 * O RITMO DE PA (Cap. 1, §2) — a fonte única do quanto um personagem tem.
 *
 * ## Por que mudou (2026-09-27)
 *
 * O livro dava 1 PA por sessão e +1 por marco, e prometia "cerca de 12 PA no
 * 3º patamar e 24 no 5º". O `npm run balancear` mostrou que isso não fechava
 * com nada:
 * - só ABRIR o 5º patamar comprando o mínimo exigido já custa ~40 PA;
 * - a régua do Apêndice C, os moldes de criatura do Apêndice G e o simulador
 *   foram todos medidos com o personagem honesto do patamar (todos os ranks
 *   da árvore, quatro compras em cada, o atributo principal na régua), e esse
 *   personagem gasta, na mediana das 19 árvores, 17 PA no 2º patamar, 31 no
 *   3º, 47 no 4º, 68 no 5º e 90 no 6º — duas vezes e meia o prometido.
 *
 * O autor escolheu fazer o livro dar o PA que o resto do livro já supõe
 * (2 por sessão, +2 por marco), em vez de refazer custos e medições. Nenhum
 * número de árvore mudou.
 */
export const PA_INICIAIS = 3;
export const PA_POR_SESSAO = 2;
export const PA_POR_MARCO = 2;
/** Um marco (fim de arco, missão importante, subida de Rank na Guilda) a cada tantas sessões. */
export const SESSOES_POR_MARCO = 3;

/**
 * O PA de um personagem que já VIVE no patamar (não o que acabou de chegar):
 * a mediana medida, arredondada. O 1º patamar é o que se tem ao fechar a
 * primeira fase da campanha; na criação são só os 3 iniciais.
 */
export const PA_TIPICO_POR_PATAMAR = [10, 17, 30, 47, 68, 90] as const;

/** PA ganho por sessão, em média, contando os marcos. */
export const PA_MEDIO_POR_SESSAO = PA_POR_SESSAO + PA_POR_MARCO / SESSOES_POR_MARCO;

/** Em que sessão, mais ou menos, o personagem chega ao PA típico do patamar (1 a 6). */
export function sessoesAtePatamar(patamar: number): number {
  const pa = PA_TIPICO_POR_PATAMAR[patamar - 1];
  return Math.max(0, Math.round((pa - PA_INICIAIS) / PA_MEDIO_POR_SESSAO));
}
