# Mushoku Tensei RPG

Sistema de RPG de mesa homebrew ambientado no mundo de _Mushoku Tensei_, com uma ficha digital feita pra apoiar a mesa (não substituir o livro).

## Estrutura do projeto

- **`livro.typ`** — o livro de regras completo, em [Typst](https://typst.app). É a **única fonte de verdade** do sistema: toda regra, magia, talento, raça e ponto de balanceamento nasce aqui. Compile em [typst.app](https://typst.app) ou localmente (`npx typst compile livro.typ`) pra gerar o PDF.
- **Site** (Next.js) — ficha de personagem digital com foco em qualidade de vida pra Mestre e jogadores: edição livre de qualquer valor, cálculo automático de PV/PM/PT/CA/dano, mapa de árvores de progressão navegável, grimório com busca, exportação de ficha em PDF, e um livro de regras navegável (`/livro`) que espelha o `livro.typ` sem duplicar o conteúdo.
- **`PROGRESS.md`** — changelog e roadmap do projeto: o que já foi feito, o que está pendente e as decisões de design tomadas ao longo do caminho. Consulte antes de propor uma mudança grande — é provável que a motivação de uma regra já esteja documentada ali.

## Rodando o site localmente

Requer Node.js 20+.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A ficha ativa fica salva no navegador (`localStorage`) — nada é enviado a um servidor.

Outros comandos úteis:

```bash
npm run build   # build de produção
npm run lint    # eslint
npx tsc --noEmit -p .   # typecheck
```

## Principais rotas

| Rota | O que é |
|---|---|
| `/` | Ficha do personagem ativo |
| `/personagens` | Lista de fichas (criar, abrir, renomear, excluir) |
| `/arvores` | Mapa radial das árvores de progressão |
| `/livro` | Livro de regras navegável (Cap. 1, 2, 4, Apêndices) |

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4 + Zustand (com persistência em `localStorage`). Exportação de PDF via o pacote [`typst`](https://www.npmjs.com/package/typst) (binário nativo, sem precisar de Rust instalado).

## Contribuindo

Qualquer regra, magia, talento ou número de balanceamento nasce em `livro.typ` — nunca hardcoded só no código do site. Se uma mudança no site expõe uma lacuna de regra (ex: falta uma proficiência, uma perícia não existe na lista oficial), a correção é feita **no livro primeiro**, e o site só reflete o que já está escrito lá.
