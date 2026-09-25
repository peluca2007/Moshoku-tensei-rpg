# Plano do livro digital — o `/livro` como livro de verdade

> **Visão:** abrir o `/livro` e ver um livro aberto — páginas de tamanho fixo, duas colunas, folha
> virando — com **identidade própria**, e **sem deixar de ser HTML**: texto selecionável, busca, links,
> tabelas de verdade, vídeo e interação.

Dono da aparência do livro: o Claude (decisão do autor, 2026-09-24). Conteúdo e regras continuam nascendo
em `src/data/` e `src/components/book/`; esta frente mexe em **como** o livro é lido. Pedidos de arte em
[`ARTE-PARA-O-LIVRO.md`](ARTE-PARA-O-LIVRO.md).

## Como a identidade chegou aqui

| Volta | O que era | O que o autor disse |
| --- | --- | --- |
| 1 | Página do tamanho da tela, letra 16–18 px, uma coluna | "Parece o site, não parece um livro." |
| 2 | Cópia do Livro do Jogador (pergaminho, versalete vermelho, caixas verdes, couro) | "D&D demais, sem identidade." |
| 3 | Artbook de light novel (papel marfim, mincho, uma cor por capítulo) | "Tá ficando legal, mas claro demais; quero estilo único, olha Vampiro e Mörk Borg." |
| 4 | **Livro noturno com coragem gráfica** (a atual) | "Tá ficando muito legal... mais identidade por árvore, caos bonito." |

## A identidade atual: o livro noturno

- **Papel noite** (padrão) e **papel dia**, escolhidos no botão sol/lua do livro, à parte do tema do site
  (`data-papel` na raiz; a variante `dark:` do Tailwind segue o papel dentro do livro).
- **Duas vozes:** a gritada (Barlow Condensed, caixa alta, pesada) em números, títulos de seção, carimbos e
  tabelas; a elegante (Fraunces) em subtítulos e nomes; o corpo em Literata; rótulos em Barlow; kanji na
  fonte japonesa do sistema.
- **A cor do capítulo é tinta de marca-texto:** sublinha os títulos, carimba as caixas (etiqueta torta),
  pinta o cabeçalho das tabelas, faz a sombra deslocada das artes, o número da página e a aba na borda.
- **Aberturas de capítulo:** arte sangrando até a borda, número gigante vazado ("04"), o capítulo em kanji
  na vertical ("第四章"), título em caixa alta; fecho de capítulo com o kanji e o convite pro próximo.
- **As 19 árvores, cada uma com identidade:** cor própria, nome japonês da escola (火魔術, 水神流, 剣神流…)
  na vertical, selo carimbado, textura própria no cabeçalho (brasas, ondas, rajadas, estratos, grade,
  alvo, pauta…), o selo antes do nome de cada habilidade, e o jeito de falar da família (magia em
  Fraunces com círculo mágico, corpo condensado itálico com corte de golpe, utilidade em etiqueta
  tracejada). As páginas da árvore assumem a cor e o kanji dela.
- **As doze raças, uma página cada:** o nome gritado, a ilustração (ou o quadro reservado pra ela, com o
  brasão e o selo), o carimbo da raridade no sorteio, uma faixa de números sempre no mesmo lugar (Atributo,
  PV, PM, CA, Perícias), a epígrafe e os traços em duas colunas. Cada raça tem cor, nome em japonês e selo,
  e a página assume os três. A ilustração **estica**: fica com o que os traços deixarem, então página
  nenhuma sobra ou transborda. Antes delas, o quadro comparativo das doze e a **vitrine** (os doze
  brasões, que levam à página de cada uma).
- **Nada do livro antigo:** as paletas do site (pergaminho, vinho, dourado) são redefinidas dentro do
  livro — o pergaminho vira a escala neutra do papel, o vinho e o dourado viram a cor do capítulo, da
  árvore ou da raça. Todo componente que vem do site adota a identidade sem ser reescrito.
- **Caos pensado**, sempre fora do texto corrido: carimbos e artes levemente tortos, cabeçalhos das
  árvores pendendo alternados, faixa listrada de alerta nos avisos, kanji gigante e apagado no canto.

O CSS do livro mora em `src/app/livro/folhear/folhear.css`, importado só pela rota.

## Princípios

1. **Parece livro impresso.** Página de tamanho fixo, duas colunas. A tela se adapta pela escala e pelo
   zoom, nunca refazendo a diagramação — e a letra do site (botão Aa) não entra no livro.
2. **Uma regra, uma origem.** O modo Livro lê os mesmos capítulos do modo contínuo; nada é copiado.
3. **Página de livro, comportamento de web.** Seleção, Ctrl+F, links, teclado, mídia e busca.
4. **Página é endereço.** A diagramação é a mesma em qualquer tela; links apontam pra seção.
5. **Celular continua em leitura contínua por padrão.** O modo Livro existe lá, mas é opcional.
6. **Título nunca fica longe do texto dele**, e nada sai da página. Os dois são medidos no livro inteiro.

## Decisões técnicas

| Decisão | Escolha | Por quê |
| --- | --- | --- |
| Página | **Carta (816 × 1056 px), corpo de ~10pt, duas colunas** | Densidade de livro de RPG. A escala faz caber na tela; o zoom amplia. |
| Motor | **Colunas CSS aninhadas** (fora: páginas; dentro: as duas colunas) | O navegador parte o texto por linha e respeita viúvas/órfãs. |
| Pele | **CSS fora de camada sobre os componentes do livro** | Vence as utilitárias do Tailwind sem mexer nos componentes: o contínuo fica igual. |
| Virada | **Folha com "linhas de texto" girando por 460 ms**; o texto real troca na hora | Curvar HTML vivo exigiria clonar a dupla. |
| Só a dupla aberta se mexe | **IntersectionObserver** na janela do livro | Diagramas animados e vídeos fora da vista repintavam o livro inteiro. |
| Onde roda | **Rota `/livro/folhear`**, com botão Livro/Contínuo; `/livro` intacto até aprovação | Comparar antes de trocar o livro de todo mundo. |
| Tela | **Leitor imersivo**: no modo Livro somem o menu e o rodapé do site | A barra do site sobre a mesa brigava com o livro. |
| Paletas do site | **`@theme` sem `inline`** pro pergaminho, vinho e dourado (globals.css) | Com `inline` o Tailwind grava a cor crua em cada utilitária; como variável, o livro redefine a paleta por dentro e o site fica idêntico. |
| Página inteira | **Bloco de altura fixa que atravessa a página** (`column-span: all` + `break-before`) | As páginas de raça. O buraco antes da primeira é ocupado pela vitrine, que estica até o pé da página (`esticarVitrines`) e se arruma por consulta de contêiner. |
| Arte das raças | **Pelo nome do arquivo** (`public/livro/racas/<id>.webp`, lido no servidor) | O autor salva a imagem e ela aparece, sem mexer em código. |
| Busca | **Painel dentro do livro** (lupa ou Ctrl+K), com a página de cada trecho e o termo pintado no texto | O autor quer ver no livro onde está o que procura, não ir pro `/busca`. |

## Casos tratados (em `src/components/book/folhear/diagramacao.ts`)

- **Título órfão:** cada um dos ~1300 títulos (seções, subtítulos, caixas, verbetes, árvores, cabeçalhos de
  tabela) é conferido depois da diagramação e sobe um degrau por passada — atravessa a página junto com
  a tabela larga, muda de coluna, fica inteiro, ou ganha um calço que o leva pra página seguinte.
- **Tabela que abre no pé da coluna** com só uma ou duas linhas desce inteira.
- **Tabela espremida atravessa a página** (4+ colunas, ou linha com mais de 7 linhas de texto) — inclusive
  quando está dentro de uma caixa de regra (aí quem atravessa é a caixa).
- **Tabela larga** perde letra e, se preciso, quebra palavra; **diagrama largo** atravessa a página e, se
  ainda não couber, encolhe por inteiro.
- **Cabeçalho de tabela repetido** onde o navegador não repete sozinho.
- **Caixa curta não parte, caixa longa parte**, com fundo nos dois pedaços.
- **`<details>` fechado não conta** na medição.

## O que foi medido (2026-09-25)

- **Livro inteiro:** 250 páginas (as raças ganharam 12). **0** títulos separados do texto, **0** blocos
  passando da coluna ou da página, 3 páginas com 19–22% de mancha vazia (todas antes de uma tabela de
  página inteira).
- **Desempenho (build de produção, Chrome headless sem GPU):** livro pronto em ~3,1 s (3,8–4,5 s numa
  segunda medição com a máquina mais carregada, igual à versão anterior medida junto); virar a folha, 0 ms
  de tarefa longa; nenhuma animação infinita rodando. Três coisas pesavam e foram resolvidas: o
  `perspective` no livro (4–8 s por repintura), os diagramas/vídeos/pílulas animando fora da vista (~1 s
  por folha virada) e as fontes japonesas (366 arquivos de fonte baixados).
- **Navegadores:** Chrome e Firefox. **Safari (iPhone/iPad) não verificado.**

## Próximas etapas

- **Arte** (depende do autor, ver `ARTE-PARA-O-LIVRO.md`): aberturas de capítulo definitivas, guarda, capa,
  pranchas e mapa. Numa identidade assim, a arte é o que mais pesa.
- **Trocar o `/livro`:** o leitor novo no lugar do atual (Livro no desktop, contínuo no celular — que hoje
  ainda perde o índice lateral e o cabeçalho corrente do `/livro`).
- **Safari/iPad**, leitor de tela, impressão e offline.
