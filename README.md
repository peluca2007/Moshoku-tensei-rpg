<div align="center">

# Mushoku Tensei RPG

**Sistema de RPG de mesa homebrew ambientado no mundo de _Mushoku Tensei_.**
Livro de regras completo e ficha de personagem digital, vivendo no mesmo lugar.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/State-Zustand-8B5CF6)](https://github.com/pmndrs/zustand)
[![Fan project](https://img.shields.io/badge/status-fan%20project-6b4c12)](#)

</div>

<br>

> Homenagem de fã, sem fins comerciais. Não afiliado à Media Factory, Studio Bind ou aos autores da obra original.

## O que é isto

Um único site que é ao mesmo tempo o **livro de regras** e a **mesa de jogo** — o livro nunca é um PDF à parte que perde sincronia com a ficha; os dois lêem os mesmos dados.

| | |
|---|---|
| 📖 **`/livro`** | O livro de regras inteiro (5 capítulos + 7 apêndices), navegável, com sumário fixo e exportação em PDF num clique. |
| 📝 **`/ficha`** | Cálculo automático de PV/PM/PT/PP/CA/dano, inventário com Dado de Arma escalável, grimório com busca, campo de lore/anotações, exportação em PDF e JSON. |
| 🎲 **Três vias de criação** | Manual, Roleta do Destino (raça/antecedente/atributos sorteados) e A Entrevista (perguntas que inclinam o sorteio sem nunca garantir o resultado, e ainda geram um rascunho de lore pro personagem). |
| 🕸️ **`/arvores`** | Mapa radial navegável das 18 árvores de progressão do jogo, incluindo árvores híbridas que só se revelam a quem já domina outras duas. |
| 🛒 **`/loja`** | Loja da Guilda: compra item, debita PO e manda direto pro inventário da ficha ativa — catálogo com o mesmo dado que o livro lista em preço, filtro por Tipo e por Rank de Guilda. |
| ⚔️ **`/iniciativa`** | Tracker de combate por rodada, com condições e PV por combatente. |
| 🎯 **Rolador de dados** | Testes, dano e macros salváveis, com atalho de teclado (`R`) e animação opcional de dado girando. |

Tudo mobile-first: a leitura do livro, a ficha e o rolador de dados funcionam sem zoom e sem quebra de layout num celular.

## Arquitetura

Três decisões que valem entender antes de mexer no código:

1. **O livro mora no código, não num arquivo à parte.** `src/components/book/*.tsx` contém o texto narrativo de cada capítulo e apêndice; `src/data/*.ts` (árvores, raças, antecedentes) contém os números. Os dois são a única fonte de verdade — não existe um documento externo que precise ser mantido em sincronia manualmente.
2. **A ficha nunca duplica uma fórmula.** Todo cálculo (PV, PM, dano, CD) vive em `src/store/selectors.ts` e é consumido tanto pela ficha quanto pelas tabelas do livro em `/livro` — mudar uma regra num lugar não pode deixar o outro desatualizado.
3. **`livro.typ` é histórico, não fonte de verdade.** Era o formato original, em [Typst](https://typst.app), de antes da migração pro site — permanece no repositório congelado, só como referência do texto original.

`PROGRESS.md` guarda o changelog sessão a sessão — o que foi feito, por quê, e onde. Vale consultar antes de propor uma mudança grande.

## Rodando localmente

Requer Node.js 20+.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Tudo fica salvo no `localStorage` do navegador — nada é enviado a um servidor.

```bash
npm run build          # build de produção
npm run lint            # eslint
npx tsc --noEmit -p .   # typecheck
```

## Principais rotas

| Rota | O que é |
|---|---|
| `/` | Landing page — apresentação do projeto, botões pra criar personagem ou abrir uma ficha |
| `/ficha` | Ficha do personagem ativo |
| `/personagens` | Lista de fichas (criar, abrir, renomear, excluir, importar/exportar JSON) |
| `/criar` | As três vias de criação de personagem |
| `/arvores` | Mapa radial das árvores de progressão |
| `/livro` | Livro de regras completo, navegável e exportável em PDF |
| `/loja` | Loja da Guilda — comprar item manda direto pro inventário da ficha ativa |
| `/iniciativa` | Tracker de combate |

## Stack

**Next.js 16** (App Router) · **TypeScript** · **Tailwind CSS v4** · **Zustand** (persistência em `localStorage`).

Exportação de ficha em PDF via o pacote [`typst`](https://www.npmjs.com/package/typst) (binário nativo, sem precisar de Rust instalado); exportação do livro em PDF via a impressão nativa do navegador, com CSS dedicado em `globals.css`.

## Contribuindo

Toda regra, magia, talento ou número de balanceamento nasce em `src/data/*.ts` e no texto correspondente em `src/components/book/*.tsx` — nunca só num lugar. Se uma mudança na ficha expõe uma lacuna de regra, a correção sai primeiro no livro (`/livro`) e a ficha só reflete o que já está escrito lá.

<div align="center">

<sub>Mushoku Tensei © Rifujin na Magonote. Este projeto é um trabalho de fã não-comercial.</sub>

</div>
