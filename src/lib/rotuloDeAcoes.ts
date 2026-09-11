/**
 * "1 Ação", "2 Ações", "Passivo" — o rótulo do custo em Ações (0.1.43).
 *
 * ## Por que uma função pra isto
 *
 * Porque a conta estava copiada em **cinco** lugares e as cinco estavam erradas
 * da mesma forma:
 *
 * ```ts
 * `${n} Ação${n > 1 ? "ões" : ""}`   // 2 → "2 Açãoões"
 * ```
 *
 * O sufixo era grudado na palavra inteira em vez de substituí-la. O erro
 * aparecia na ficha, na busca global, no detalhe de habilidade, na lista de
 * árvores — e no `buildFichaPayload`, que é o que vira **PDF**. Uma pessoa podia
 * levar "2 Açãoões" impresso pra mesa.
 *
 * Ele sobreviveu porque cinco cópias de uma linha curta não parecem duplicação:
 * cada uma é pequena demais pra incomodar sozinha, e nenhuma é grande o
 * bastante pra alguém extrair. O plural irregular é justamente o caso em que
 * isso cobra o preço.
 */
export function rotuloDeAcoes(n: number): string {
  if (n === 0) return "Passivo";
  return n > 1 ? `${n} Ações` : `${n} Ação`;
}
