# Plano do livro digital — o `/livro` aberto em duas páginas

> **Visão:** o `/livro` lido como um livro aberto no computador, na vibe de um flipbook (capa, páginas
> opostas, papel, virada de folha), **sem deixar de ser HTML**: texto selecionável, busca, links,
> tabelas de verdade, vídeo, animação e interação. Referência de atmosfera: um livro de RPG no AnyFlip.
> A identidade continua sendo a do Mushoku Tensei RPG.

Dono da aparência do livro: o Claude (decisão do autor, 2026-09-24). O conteúdo e as regras continuam
nascendo em `src/data/` e em `src/components/book/`; esta frente mexe em **como** o livro é lido.

## Princípios (não mudam)

1. **Legibilidade antes de efeito.** Faltou espaço, o livro mostra menos páginas — nunca letra menor.
   Corpo mínimo de 16 px na escala padrão (coberto por `diagramacao.test.ts`).
2. **Uma regra, uma origem.** O modo Livro lê os mesmos capítulos do modo contínuo; nada é copiado.
3. **Página de livro, comportamento de web.** Seleção, Ctrl+F, links, teclado e mídia continuam vivos.
4. **A página não é endereço.** Link e "voltar de onde parei" guardam âncora ou bloco; o fólio muda
   com a tela e é só orientação.
5. **Celular continua em leitura contínua por padrão.** O modo Livro existe lá, mas é opcional.

## Decisões tomadas na Etapa A

| Decisão | Escolha | Por quê |
| --- | --- | --- |
| Motor de paginação | **Colunas CSS com a altura da página + rolagem horizontal com encaixe por dupla** | É o motor de todo leitor de ebook na web. O navegador parte parágrafo por linha, respeita viúvas/órfãs e `break-*`; Ctrl+F, seleção e foco vêm de graça. Um paginador próprio por blocos seria reescrever o layout do navegador. |
| Virada de folha | **Folha de papel com "linhas de texto" girando por 420 ms**; o texto de verdade troca na hora | A virada 3D do AnyFlip curva uma *imagem*. Curvar HTML vivo exigiria clonar a dupla a cada virada. Com movimento reduzido, a troca é instantânea. Dedo/trackpad deslizam a página. |
| Onde roda | **Rota nova `/livro/folhear`**, com botão Livro/Contínuo; `/livro` intacto até aprovação | Dá pra comparar os dois modos no mesmo trecho antes de trocar o livro de todo mundo. |
| Tela | **Leitor imersivo**: no modo Livro somem o menu e o rodapé do site | A barra creme do site sobre a mesa escura eram dois mundos brigando. A barra do livro traz a volta ao site e o tema. |

## O que a Etapa A mediu

- **Capítulo 4 inteiro** (o mais denso em tabela, caixa e diagrama): 63–65 páginas em 1440×900, zero
  elemento vazando da página em 1440×900, 1280×680, 820×1180 e 390×844.
- **Livro inteiro** (`/livro/folhear?tudo`): **391 páginas**, recomposição completa em **~90 ms**. As
  colunas aguentam o livro todo; não é preciso paginar por capítulo.
- **Catálogo de árvore aberto** (o maior risco do plano): se parte entre páginas sem vazar (Magia de
  Água = 36 páginas).
- **Geometria:** duas páginas a partir de ~390 px por página; notebook baixo (1280×680) ainda abre em
  dupla com corpo de 16 px; tablet em pé e celular, uma página.

## Casos que precisaram de tratamento (e onde moram)

Tudo em `src/components/book/folhear/diagramacao.ts`, com o porquê no comentário de cada função.

- **Cabeçalho de tabela repetido.** O Chrome repete o `<thead>` dentro de colunas desde que ele seja
  inquebrável (o CSS garante). Onde o navegador não repete, o livro insere uma cópia marcada "(cont.)".
- **Tabela larga.** Tabela que não cabe na coluna perde um pouco de letra; se ainda não couber, a palavra
  pode quebrar na borda da célula. Nunca invade a margem.
- **Tabela no modo Livro é de livro impresso:** filetes em cima, embaixo e entre linhas, sem caixa. A
  caixa do contínuo, partida, deixava moldura vazia pendurada no pé da página.
- **Caixa curta não parte, caixa longa parte** (com borda nos dois pedaços). `break-inside: avoid` em
  toda caixa deixaria meia página em branco atrás de cada caixa média.
- **`<details>` fechado não conta.** O Chrome diagrama o conteúdo escondido (`content-visibility`), e
  contá-lo quebrava a busca do lugar de leitura.
- **Texto alinhado à esquerda, não justificado:** sem dicionário de hifenização garantido (o Chrome do
  Windows baixa sob demanda), justificar abre buracos.

## Próximas etapas

- **B — Leitura completa:** trocar `/livro` pelo leitor novo (modo Livro no desktop, contínuo no
  celular), com capa na primeira página, abertura de capítulo sempre à direita e "voltar de onde parei".
- **C — Tratamento editorial:** modelo próprio para o catálogo de árvore (hoje é o `<details>` do
  contínuo, partido em páginas), página de consulta larga para as tabelas de 5+ colunas, revisão das
  páginas quase vazias atrás de tabelas altas.
- **D — Mídia e movimento:** vídeo sob demanda que pausa ao sair da página, diagramas que animam quando
  a página abre, pré-carregamento das duplas vizinhas.
- **E — Acabamento:** Safari/iPad (fragmentação de colunas é mais fraca no WebKit — testar antes de
  tornar padrão), Firefox, leitor de tela, impressão, offline.

## Limites conhecidos do protótipo

- Verificado só no Chrome (headless, 4 tamanhos de tela, tema claro e escuro). Safari e Firefox não.
- No modo Livro, a busca (lupa ou Ctrl+K) leva à página `/busca` em vez de abrir o painel rápido,
  que mora no menu do site escondido. Uma busca dentro do próprio livro é trabalho da Etapa B. O Ctrl+F
  do navegador funciona.
- A página quase vazia antes de uma linha de tabela alta é aceita por enquanto: linha de tabela não parte.
