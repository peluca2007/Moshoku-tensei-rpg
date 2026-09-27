# Tarefa para o Codex — o livro no celular (2026-09-26)

O autor pediu uma revisão geral do livro. O Claude e três revisores estão cuidando do **conteúdo**
(Cap. 0 a 5, árvores e apêndices) e da **diagramação do modo folhear** (as páginas 816×1056). A sua
fatia é outra, sem sobreposição: **o livro contínuo (`/livro`, rolando) no celular.** A mesa joga com
iPhone e Android (ver `CLAUDE.md` e `AGENTS.md`).

## O que fazer

1. Suba o seu servidor na porta **3020** (`npm run dev:gpt`) e abra `/livro` no modo contínuo.
2. Percorra o livro inteiro em **360×800** (Android), **375×812** e **390×844** (iPhone), nos dois
   temas (escuro e claro). Use `node scripts/tela.mjs /livro --largura 390 --ancora <id>` pra fotografar
   (os ids das seções estão em `src/data/sumarioDoLivro.ts`) e `npm run check:mobile` como ponto de
   partida.
3. Procure e conserte:
   - **tabela saindo da tela** ou que obriga a rolar pro lado pra ler (prefira que a tabela caiba: coluna
     que quebra linha, fonte um pouco menor, ou virar lista empilhada no celular; rolagem lateral só
     quando não houver outro jeito, e aí com sombra/indicação de que rola);
   - **espaço vazio enorme** (margem/padding de desktop que sobra no celular, arte com altura fixa,
     caixa com `min-height`);
   - imagem, carta (`EntryCard`), diagrama (`Diagramas.tsx`) ou o Laboratório de Fórmulas passando da
     largura da tela;
   - texto pequeno demais pra ler na mesa (menos de ~14px no corpo), botão/alvo de toque menor que 40px;
   - o sumário e a busca do livro no celular.
4. Se o `check:mobile` não pega um defeito que você achou, **ensine o check** a pegar (ele deve falhar
   quando um elemento do livro passar da largura da viewport).

## Arquivos que você pode mexer

- `src/app/globals.css` — **só** regras do livro contínuo e `@media` de largura pequena. Não mexa nas
  regras de `@media print`.
- `src/components/book/BookUI.tsx` (o `BookTable` e as caixas), `src/components/book/EntryCard.tsx`
  (só classes/estilo, não o texto), `src/components/book/FormulaWorkshop.module.css`,
  `src/components/book/BookShell.tsx`, `src/components/book/BookToc.tsx`.
- `scripts/check-mobile.mjs`.

## Arquivos que você NÃO pode mexer (outros estão editando agora)

- `src/app/livro/folhear/folhear.css` e tudo em `src/components/book/folhear/` (o modo folhear é do Claude).
- O **texto** de qualquer capítulo (`Chapter*.tsx`, `Appendices.tsx`) e tudo em `src/data/` — os
  revisores estão editando. Se um conserto exigir mudar texto ou dado, **não faça**: anote no fim deste
  arquivo, na seção "Pendências pro Claude".

Toda mudança de CSS precisa continuar funcionando no desktop e **não pode mudar o modo folhear**. Antes
de subir, confira que o folhear não mudou: `BASE=http://localhost:3020 npm run revisar:livro -- --sem-fotos`
tem que dar o mesmo número de páginas (280) e nenhum erro novo.

## Como subir

- Commits pequenos, direto na `main`, um assunto por commit, mensagem em português dizendo o que mudou e
  por quê.
- Antes de cada push: `npx tsc --noEmit -p .`, `npx vitest run`, `npx eslint src scripts`,
  `npm run check:mobile` (com o servidor em `BASE=http://localhost:3020`).
- Subir: `git fetch -q; git merge -q --no-edit origin/main; git push -q origin HEAD:main`. Nunca rebase.
- Adicione uma nota curta em `src/data/patchNotes.ts` na versão mais nova **só se o autor for notar a
  diferença** (ex.: "as tabelas cabem na tela do celular"). Se outra pessoa já abriu a versão, entre
  nela; não crie outra.

## Entrega

No fim, escreva aqui embaixo: o que consertou (com a largura em que o defeito aparecia) e o que ficou
pendente.

## Pendências pro Claude

(vazio)
