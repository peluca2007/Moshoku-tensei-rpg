# Plano do livro digital — o `/livro` como livro de verdade

> **Visão:** abrir o `/livro` e ver um livro aberto — páginas de tamanho fixo, duas colunas, folha
> virando — com a cara de um **artbook de light novel**, e **sem deixar de ser HTML**: texto
> selecionável, busca, links, tabelas de verdade, vídeo e interação.

Dono da aparência do livro: o Claude (decisão do autor, 2026-09-24). Conteúdo e regras continuam nascendo
em `src/data/` e `src/components/book/`; esta frente mexe em **como** o livro é lido. Pedidos de arte em
[`ARTE-PARA-O-LIVRO.md`](ARTE-PARA-O-LIVRO.md).

## A virada de rumo (2026-09-24)

A primeira versão do protótipo seguia "legibilidade antes de efeito": página do tamanho da tela, letra de
16–18 px, uma coluna. Ficou legível e **parecia o site**. O autor comparou com o Livro do Jogador e pediu
livro de verdade — letra densa, duas colunas —, com o zoom resolvendo a letra pequena. A segunda versão faz
isso, e ganhou de brinde páginas iguais em toda tela.

## A identidade: artbook de light novel (2026-09-24, escolha do autor)

A segunda versão seguiu o Livro do Jogador de D&D ao pé da letra (pergaminho manchado, versalete
vermelho, caixas verdes, couro) e o autor achou feia: "D&D demais", sem identidade. O diagnóstico: a arte
do jogo é de anime, limpa e colorida, e estava impressa sobre pergaminho sujo — a arte e o papel
brigavam. A terceira assume a origem de Mushoku Tensei:

- **Papel claro e limpo** (marfim), fibra quase invisível, muito respiro; arte nítida, sem mistura.
- **Tipografia de volume japonês:** títulos em **Shippori Mincho**, rótulos/tabelas/números em
  **Zen Kaku Gothic**, corpo em **Literata**.
- **Cada capítulo tem a sua cor** — a da aba na borda do livro — e tudo dentro dele usa essa cor:
  traço sobre o título de seção, subtítulos, caixas tingidas, cabeçalho das tabelas, número da página.
  No catálogo, cada árvore veste a cor da categoria (Magia violeta, Corpo vermelho, Utilidade verde).
- **Aberturas de volume:** arte grande sangrando até a borda, número grande ("04") e o capítulo em kanji
  na vertical ("第四章").
- **Abas de capítulo** clicáveis saindo da borda do livro, com a marca impressa na borda de cada página.
- **Guarda** com prancha colorida de página inteira; **folha de rosto** no branco; capa de tecido grafite.

O CSS do livro mora em `src/app/livro/folhear/folhear.css`, importado só pela rota.

## Princípios

1. **Parece livro impresso.** Página de tamanho fixo, duas colunas, tipografia de livro. A tela se adapta
   pela escala e pelo zoom, nunca refazendo a diagramação.
2. **Uma regra, uma origem.** O modo Livro lê os mesmos capítulos do modo contínuo; nada é copiado.
3. **Página de livro, comportamento de web.** Seleção, Ctrl+F, links, teclado e mídia continuam vivos.
4. **Página é endereço.** A diagramação é a mesma em qualquer tela, então "página 42" vale pra mesa toda.
   Links do site continuam apontando pra seção (`#cap4-6`), que sobrevive a mudança de texto.
5. **Celular continua em leitura contínua por padrão.** Uma página inteira num telefone só se lê com zoom.

## Decisões

| Decisão | Escolha | Por quê |
| --- | --- | --- |
| Página | **Carta (816 × 1056 px), corpo de ~10pt, duas colunas** | É a densidade do Livro do Jogador. A escala faz caber na tela; o zoom (botões, `+`/`-`, duplo clique) amplia. |
| Motor | **Colunas CSS aninhadas**: as de fora são páginas, as de dentro são as duas colunas de cada página | O navegador parte o texto por linha e respeita viúvas/órfãs. O título do capítulo e as figuras largas atravessam a página com `column-span: all`. |
| Pele | **CSS fora de camada sobre os componentes do livro** | Vence as utilitárias do Tailwind (cartões arredondados, sombras) sem mexer nos componentes: o contínuo continua igual. |
| Papel | **Sempre papel**, nos dois temas | O tema escuro muda a mesa em volta. A variante `dark:` não vale dentro de `.sem-escuro`. |
| Tipografia | **Shippori Mincho** (títulos), **Zen Kaku Gothic** (rótulos e tabelas), **Literata** (corpo) | A voz dos volumes japoneses. Carregadas só no livro folheado. |
| Virada | **Folha de pergaminho com duas colunas de "texto" girando por 460 ms**; o texto real troca na hora | Curvar HTML vivo exigiria clonar a dupla. Com movimento reduzido, a troca é instantânea. |
| Onde roda | **Rota `/livro/folhear`**, com botão Livro/Contínuo; `/livro` intacto até aprovação | Comparar antes de trocar o livro de todo mundo. |
| Tela | **Leitor imersivo**: no modo Livro somem o menu e o rodapé do site | A barra do site sobre a mesa brigava com o livro. |

## O livro inteiro (2026-09-24, terceira volta)

`/livro/folhear` agora é o livro todo, do começo ao fim:

- **Guarda** (papel vinho com treliça dourada e ex-líbris), **folha de rosto** (título, arte, edição),
  **sumário** com número de página e frontispício, os sete capítulos e o **colofão** — que carrega o
  aviso de projeto de fã, já que no modo Livro o rodapé do site some.
- **Aberturas de capítulo com arte** que sangra até a borda da página (provisórias, de artes que o projeto
  já tinha; as definitivas estão pedidas).
- **O catálogo das 19 árvores impresso por inteiro**: no modo Livro todo `<details>` abre (e volta a
  fechar no contínuo). Cada árvore vira uma "classe" — nome em versalete com o brasão, Mecânica Central e
  Proficiências em nota verde, Maestrias em caixa vinho — e cada habilidade vira um verbete no estilo das
  magias do Livro do Jogador: nome, linha de custo em itálico, texto, encantamento à margem.
- **Tabela espremida atravessa a página** (4+ colunas, ou alguma linha com mais de 7 linhas de texto) —
  a dos Antecedentes, as comparativas do Cap. 3.
- **Voltar de onde parei**: o livro guarda a página e reabre nela (o link `#secao` sempre ganha).

## O que foi medido

- **Livro inteiro:** **241 páginas** com o catálogo aberto (versão artbook; a entrelinha maior custou
  páginas e comprou leitura). Uma só página com mais de 18% de mancha vazia. Diagramar e medir tudo leva ~0,9 s no
  servidor de desenvolvimento (uma vez, ao abrir).
- **Capítulo 4:** 18 páginas. As tabelas continuam na coluna seguinte com o cabeçalho repetido, e os
  diagramas largos atravessam a página.
- **Telas:** dupla no desktop, no notebook baixo e no tablet deitado; uma página no tablet em pé (86% do
  tamanho real) e no celular.

## Casos tratados (em `src/components/book/folhear/diagramacao.ts`)

- **Cabeçalho de tabela repetido.** O Chrome repete o `<thead>` inquebrável; onde não repete, o livro
  insere uma cópia.
- **Tabela larga** perde letra e, se preciso, quebra palavra — nunca invade a coluna vizinha.
- **Figura larga** (diagrama que rola de lado numa coluna) atravessa a página.
- **Caixa curta não parte, caixa longa parte**, com fundo nos dois pedaços; o título da caixa nunca fica
  sozinho no pé da coluna.
- **`<details>` fechado não conta** na medição (o Chrome diagrama o conteúdo escondido).

## Próximas etapas

- **Arte** (depende do autor, ver `ARTE-PARA-O-LIVRO.md`): papel em alta resolução, couro, aberturas de
  capítulo, capa, pranchas e mapa.
- **B — Trocar o `/livro`:** o leitor novo no lugar do atual (modo Livro no desktop, contínuo no celular,
  que hoje ainda perde o índice lateral e o cabeçalho corrente do `/livro`).
- **C — Editorial:** revisão página a página das 225 (caixas verdes em sequência, páginas quase vazias
  antes de tabela alta) e página de créditos das artes quando as definitivas chegarem.
- **D — Mídia:** vídeo que pausa ao virar a página, laços nas aberturas de capítulo.
- **E — Acabamento:** Safari/iPad e Firefox (colunas aninhadas são o ponto de risco), leitor de tela,
  impressão, offline.

## Limites conhecidos

- Verificado no Chrome e no Firefox (headless). **Safari (iPhone/iPad) não.**
- O texto é justificado sem garantia de hifenização (o dicionário de português não existe em todo
  navegador); algumas linhas abrem espaço entre palavras, como em muito livro impresso.
- No modo Livro, a busca (lupa ou Ctrl+K) leva à página `/busca`; o painel rápido mora no menu escondido.
