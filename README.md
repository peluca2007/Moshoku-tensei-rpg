# Mushoku Tensei RPG

Sistema de RPG de mesa homebrew ambientado no mundo de _Mushoku Tensei_ — livro de regras completo e ficha de personagem digital, vivendo no mesmo lugar.

> Homenagem de fã, sem fins comerciais. Não afiliado à Media Factory, Studio Bind ou aos autores da obra original.

## O que é isto

Um único site que é ao mesmo tempo o **livro de regras** e a **mesa de jogo**:

- **[`/livro`](http://localhost:3000/livro)** — o livro de regras inteiro, navegável, com sumário fixo e exportação em PDF num clique. É a fonte de verdade narrativa do sistema.
- **Ficha de personagem** — cálculo automático de PV/PM/PT/PP/CA/dano, três formas de criar personagem (Manual, Roleta do Destino e A Entrevista), inventário com Dado de Arma escalável, grimório com busca, exportação em PDF e JSON.
- **[`/arvores`](http://localhost:3000/arvores)** — mapa radial navegável das 17 árvores de progressão do jogo.
- **[`/iniciativa`](http://localhost:3000/iniciativa)** e **[`/mestre`](http://localhost:3000/mestre)** — tracker de combate e painel de acompanhamento pro Mestre.
- Rolador de dados integrado, com macros salváveis e atalho de teclado.

Tudo mobile-first: a leitura do livro, a ficha e o rolador de dados funcionam sem zoom e sem quebra de layout num celular.

## Arquitetura

- **O livro mora no código, não num arquivo à parte.** `src/components/book/*.tsx` contém o texto narrativo de cada capítulo e apêndice; `src/data/*.ts` (árvores, raças, antecedentes) contém os números. Os dois são a única fonte de verdade — não existe um documento externo que precise ser mantido em sincronia manualmente.
- **A ficha nunca duplica uma fórmula.** Todo cálculo (PV, PM, dano, CD) vive em `src/store/selectors.ts` e é consumido tanto pela ficha quanto pelas tabelas do livro em `/livro` — mudar uma regra num lugar não pode deixar o outro desatualizado.
- `livro.typ` existe no repositório só como referência histórica (era o formato antigo, em [Typst](https://typst.app), antes da migração pro site) — **está congelado e não é mais editado.**
- **`PROGRESS.md`** — changelog sessão a sessão: o que foi feito, por quê, e onde. Consulte antes de propor uma mudança grande.

## Rodando localmente

Requer Node.js 20+.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Tudo fica salvo no `localStorage` do navegador — nada é enviado a um servidor.

```bash
npm run build           # build de produção
npm run lint             # eslint
npx tsc --noEmit -p .    # typecheck
```

## Principais rotas

| Rota | O que é |
|---|---|
| `/` | Ficha do personagem ativo |
| `/personagens` | Lista de fichas (criar, abrir, renomear, excluir, importar/exportar JSON) |
| `/criar` | As três vias de criação de personagem |
| `/arvores` | Mapa radial das árvores de progressão |
| `/livro` | Livro de regras completo, navegável e exportável em PDF |
| `/iniciativa` | Tracker de combate |
| `/mestre` | Painel de acompanhamento pro Mestre |

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Zustand (persistência em `localStorage`). Exportação de ficha em PDF via o pacote [`typst`](https://www.npmjs.com/package/typst) (binário nativo); exportação do livro em PDF via a impressão nativa do navegador, com CSS dedicado em `globals.css`.

## Contribuindo

Toda regra, magia, talento ou número de balanceamento nasce em `src/data/*.ts` e no texto correspondente em `src/components/book/*.tsx` — nunca só num lugar. Se uma mudança na ficha expõe uma lacuna de regra, a correção sai primeiro no livro (`/livro`) e a ficha só reflete o que já está escrito lá.
