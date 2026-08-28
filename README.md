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

| Camada | Tecnologia | Por que esta |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | Rotas como arquivos, Server Components por padrão, e uma rota de API pro PDF sem precisar de um servidor separado |
| Linguagem | **TypeScript 5** | O sistema tem 18 árvores e ~400 habilidades — os tipos em `src/lib/types.ts` são o que impede uma magia mal formada de chegar na ficha |
| Estilo | **Tailwind CSS v4** | Paleta temática declarada como tokens em `@theme` (`globals.css`), sem arquivo de config |
| Estado | **Zustand** + `persist` | Ficha inteira no `localStorage`, com store versionada e migração a cada mudança de formato |
| Ícones | **lucide-react** | — |
| Tema | **next-themes** | Dark mode manual (classe `.dark`), não só `prefers-color-scheme` |
| PDF da ficha | **[`typst`](https://www.npmjs.com/package/typst)** | Binário nativo via `/api/ficha-pdf`; layout de ficha em Typst, sem WASM no navegador |
| PDF do livro | Impressão nativa do navegador | `@media print` dedicado em `globals.css` — abre todos os `<details>`, esconde a nav, força serifa |

### Como o estado flui

```
src/data/*.ts          →  fonte de verdade mecânica (números, magias, itens)
        ↓
src/store/selectors.ts →  TODA fórmula do sistema (PV, PM, PT, PP, CA, dano, CD)
        ↓
   ┌────┴─────────────────────────┐
   ↓                              ↓
/ficha, /arvores, /loja        /livro
(consomem o cálculo)           (renderiza o mesmo dado como tabela)
```

`selectors.ts` é o gargalo de propósito: nenhuma fórmula é reimplementada numa página. É por isso que o livro nunca pode divergir da ficha — os dois leem o mesmo `getMaxHp`, o mesmo `TREES`.

`useCharacterStore` guarda o roster inteiro (várias fichas, uma ativa) e é a única coisa que escreve no `localStorage`. Mudou o formato de `CharacterData`? Sobe a `version` e escreve a migração — já existem fichas reais de mesa salvas.

## Contribuindo

Toda regra, magia, talento ou número de balanceamento nasce em `src/data/*.ts` e no texto correspondente em `src/components/book/*.tsx` — nunca só num lugar. Se uma mudança na ficha expõe uma lacuna de regra, a correção sai primeiro no livro (`/livro`) e a ficha só reflete o que já está escrito lá.

## Issues: como reportar

Este repositório trata **bug de código** e **desequilíbrio de regra** como duas coisas diferentes, com dois formulários diferentes. Confundir os dois é o erro mais comum — e o que mais atrasa a correção.

> **A pergunta que separa os dois:** o site está fazendo o que o livro manda?
>
> - **Não** → o site errou. É **🐛 bug de código**.
> - **Sim, e o resultado ainda é absurdo** → o livro errou. É **⚖️ desequilíbrio de regra**.

| Template | Use quando | Exemplo real |
|---|---|---|
| 🐛 **Bug de código** | O site discorda do livro, quebra, ou calcula errado | *"A ficha mostra 42 PT num Imperador; o Cap. 3 diz que a fórmula é aditiva e dá ~17."* |
| ⚖️ **Desequilíbrio de regra** | A regra funciona como escrita e mesmo assim quebra a mesa | *"Um espadão já satura o 4d10 no Rei — a Maestria de Imperador não entrega nada."* |
| ✨ **Conteúdo novo** | Falta uma magia, item, criatura ou árvore | *"Vento não tem como tirar um aliado do corpo a corpo."* |
| 💬 **Discussions** | Você não entendeu uma regra | *"Manto de Touki soma com Postura de Água?"* |

### O que faz uma issue de balanceamento virar commit

Balanceamento não se decide por opinião — se decide por número. O livro já traz duas réguas prontas, e uma issue que as usa costuma virar mudança no mesmo dia:

- **Apêndice C — Tabela de Dano por Turno:** quanto cada árvore deve causar em cada patamar. Se a sua conta estoura a coluna, você tem um caso.
- **Apêndice G — Bestiário:** PV, CA, bônus de ataque e CD esperados por patamar. É contra isso que se mede se um efeito é forte demais.

Três coisas que transformam um relato em correção:

1. **A conta, escrita.** `4d10 (média 22) × 5 + Força 8 + Rank 6 = 124 em 2 Ações` diz mais que qualquer adjetivo.
2. **O JSON da ficha.** `/ficha` → *Exportar JSON*. Reproduz o seu caso exato em segundos.
3. **O que a sua proposta quebra.** Toda mudança quebra alguma coisa. Dizer o quê é metade da decisão — e é o que separa uma sugestão de um patch.

### Labels

| Label | Significa |
|---|---|
| `bug` | O site discorda do livro |
| `balanceamento` | O livro discorda da mesa |
| `conteúdo` | Falta alguma coisa |
| `precisa-de-numero` | O caso é plausível, mas ninguém fez a conta ainda |
| `precisa-de-mesa` | A conta fecha, mas falta ver acontecer numa sessão real |
| `decisão-de-design` | Não é erro; é uma escolha que o dono do sistema precisa fazer |

<div align="center">

<sub>Mushoku Tensei © Rifujin na Magonote. Este projeto é um trabalho de fã não-comercial.</sub>

</div>
