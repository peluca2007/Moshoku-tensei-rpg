import type { MetadataRoute } from "next";

/**
 * O manifesto que faz o site virar app instalável (0.1.15).
 *
 * O caso de uso está escrito no `O-QUE-FALTA.md` desde o começo: **mesa física
 * num porão sem sinal**. Instalado na tela inicial, o site abre sem barra de
 * endereço e sem depender do navegador lembrar a URL — e, com o service worker
 * de `public/sw.js`, abre sem rede nenhuma.
 *
 * ## Por que `display: "standalone"` e não `"fullscreen"`
 *
 * `fullscreen` come a barra de status do sistema, e com ela o relógio e a
 * bateria. Numa sessão de quatro horas, com o celular servindo de ficha, essas
 * duas informações são justamente as que a pessoa quer sem sair do app.
 *
 * ## Os atalhos
 *
 * `shortcuts` é o menu que aparece segurando o ícone na tela inicial (Android e
 * Chrome desktop; o iOS ignora). As três entradas são as três coisas que se faz
 * com o celular na mão NO MEIO da sessão — a ficha aberta, os dados e a
 * iniciativa. `/livro` e `/loja` ficaram de fora de propósito: são consulta, e
 * consulta se faz navegando, não por atalho de tela inicial.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mushoku Tensei RPG",
    short_name: "MT RPG",
    description:
      "Ficha de personagem, árvores de habilidade e o livro de regras do sistema — funciona sem internet.",
    lang: "pt-BR",
    dir: "ltr",
    start_url: "/",
    /*
     * O escopo é a raiz porque o app É o site inteiro: um `scope` menor faria o
     * navegador tratar as rotas de fora como link externo e abri-las numa aba
     * do Chrome por cima do app instalado.
     */
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    /*
     * O fundo da splash é o `parchment-950`, o mesmo que o gerador de ícones
     * compõe atrás do brasão (`scripts/gerar-favicon.mjs`). Com qualquer outra
     * cor, o quadrado do ícone apareceria recortado contra a tela na abertura.
     */
    background_color: "#1a1210",
    /*
     * A barra do sistema segue o tema CLARO, que é o padrão do site. O tema
     * escuro é coberto pelo `<meta name="theme-color" media="...">` do
     * `layout.tsx`: o manifesto só aceita uma cor, o meta aceita duas.
     */
    theme_color: "#fdf6e3",
    categories: ["games", "entertainment", "books"],
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      /*
       * Sem um `maskable`, o Android desenha o ícone `any` dentro de um quadrado
       * branco com cantos arredondados — o brasão dourado sobre pergaminho
       * ganharia uma moldura branca que não existe em lugar nenhum da marca.
       */
      { src: "/icone-mascarado-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Minha ficha", short_name: "Ficha", url: "/ficha" },
      { name: "Rolar dados", short_name: "Dados", url: "/ficha#dados" },
      { name: "Iniciativa", short_name: "Iniciativa", url: "/iniciativa" },
    ],
  };
}
