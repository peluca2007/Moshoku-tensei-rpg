/**
 * Quais rotas o Next NÃO deve pré-baixar — 0.1.99.
 *
 * O `<Link>` pré-baixa toda rota estática cujo link aparece na tela. Para uma
 * página comum isso é o que faz a navegação ser instantânea; para o livro é um
 * desastre: `/livro` e `/livro/folhear` são ~3 MB de dados cada, e bastava o
 * rodapé (que linka os dois) aparecer numa página curta pra ela baixar 6 MB que
 * ninguém pediu. Medido: a página das Árvores descia 9 MB, 6 deles de livro.
 *
 * A capa (`/`) entra pelo mesmo motivo em escala menor: o logo da barra linka
 * pra ela em toda página.
 *
 * Uso: `<Link href={h} prefetch={prefetchDe(h)}>`. Devolve `false` pras
 * pesadas e `undefined` (o padrão do Next) pro resto.
 */
const PESADAS = [/^\/$/, /^\/livro(?:[/?#]|$)/, /^\/novidades(?:[?#]|$)/];

export function prefetchDe(href: string): false | undefined {
  return PESADAS.some((re) => re.test(href)) ? false : undefined;
}
