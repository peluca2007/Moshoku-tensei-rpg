<div align="center">

# Mushoku Tensei RPG

**Um sistema de RPG de mesa completo, e o site que o joga.**

O livro de regras, a ficha de personagem, o mapa de progressão e a loja não são quatro produtos —
são quatro leituras do mesmo `src/data/`.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-4B3621)](https://zustand.docs.pmnd.rs)
[![Versão do sistema](https://img.shields.io/badge/regras-0.1.0-8B1E3F)](PATCH_NOTES.md)
[![Testes](https://img.shields.io/badge/testes-33%20passando-3FB950)](src/store/selectors.test.ts)
[![Licença](https://img.shields.io/badge/uso-fã%20não--comercial-6B7280)](#licença-e-créditos)

</div>

> [!NOTE]
> Homenagem de fã, sem fins comerciais. Não afiliado à Media Factory, ao Studio Bind ou aos autores da
> obra original.

---

## A premissa do sistema

**Não existe nível de personagem.** Você não sobe de nível; você estuda. O crescimento inteiro do
personagem passa por uma moeda só — os **Pontos de Aprimoramento (PA)** — que o Mestre entrega por sessão,
missão ou arco, e que você gasta em atributos, perícias, ou nas **árvores**.

Cada árvore é uma escola de verdade do Mundo de Seis Faces, com sete patamares: Principiante,
Intermediário, Avançado, Santo, Rei, Imperador e Deus. Abrir um patamar exige um número mínimo de
**conhecimentos** (magias e talentos comprados) na mesma árvore — não dá para comprar o topo, só escalá-lo.

Três decisões estruturam o resto:

**1. Largura é barata, profundidade é forte.** Abrir a segunda árvore custa mais que a primeira, a terceira
mais que a segunda. E sua reserva de mana escala com o *maior* patamar de magia que você tem, não com
quantas escolas você abriu — quem espalha assiste, quem vai fundo conjura.

**2. Cada escola prepara uma condição e cobra outra.** Água deixa **Molhado** e cobra **Congelado**; Terra
deixa **Atolado** e cobra **Soterrado**; Vento aplica **Desequilibrado** e cobra dano extra em cima; Fogo
não prepara nada e cobra **Em Chamas** na hora. Os três estilos de espada não têm condição de propósito:
Deus da Espada é letalidade pura, Deus do Norte é improviso, Deus da Água é contra-ataque.

**3. O cântico é mecânica, não decoração.** Recitar bem dá Vantagem — e o tamanho do encantamento escala
com o rank. Um Principiante resolve em uma linha; um Imperador sustenta meio minuto de fôlego na frente da
mesa. O preço do bônus é tempo real de jogo.

**Onde ler:** o livro inteiro vive em [`/livro`](src/components/book), navegável, com as tabelas geradas a
partir dos mesmos dados que a ficha usa.

---

## Rodando localmente

**Requisitos:** Node.js 20+ e npm.

```bash
git clone <url-do-repo>
cd "Moshoku tensei rpg"
npm install
npm run dev
```

Abra <http://localhost:3000>. Não há banco de dados, variável de ambiente nem backend: as fichas moram no
`localStorage` do navegador, e é possível exportá-las em JSON ou PDF a qualquer momento.

### Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm start` | Sobe o build de produção |
| `npm test` | Testes das fórmulas (vitest) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Checagem de tipos |
| `npm run check:livro` | Confere a consistência entre os dados e o texto do livro |
| `npm run check:redundancia` | Acha habilidades que repetem um patamar anterior |

> [!IMPORTANT]
> Se o projeto estiver dentro do WSL, rode `build` e `check:livro` **de dentro do WSL**. Eles dependem de
> binários nativos compilados para Linux (`lightningcss`, `esbuild`); chamá-los do Windows por
> um caminho `\\wsl.localhost` falha. `tsc` e `eslint` funcionam dos dois lados.

---

## Rotas

| Rota | O que é |
| --- | --- |
| `/` | Landing page |
| `/criar` | Criação de personagem — três vias: Manual, Roleta e Entrevista |
| `/ficha` | Ficha completa: atributos, PV/PM/PT/PP/CA, inventário, Grimório, Lore, Desfazer, export PDF e JSON |
| `/livro` | Livro de regras navegável, com Patch Notes |
| `/arvores` | Mapa radial de progressão (Destiny Board), pan/zoom |
| `/loja` | Loja da Guilda — 85 itens, filtro por Tipo × Rank de Guilda |
| `/iniciativa` | Tracker de iniciativa |
| `/personagens` | Roster de fichas salvas |

---

## Arquitetura

```
src/
├── data/          FONTE DE VERDADE — regras, números, conteúdo
│   ├── trees/     as 19 árvores (17 base + Vendaval e Punho de Fogo, híbridas)
│   │   └── shared.ts    tabelas de custo: MAGIC_ACTIONS, RANK_PA_COST,
│   │                    UTILITY_PA_COST, DESINTOX_PA_COST
│   ├── races.ts · backgrounds.ts · skills.ts · proficiencies.ts
│   ├── shopItems.ts · startingKits.ts · combinedSpells.ts
│   ├── rankDeus.ts · interview.ts · patchNotes.ts
│   └── danoPorTurno.ts   a régua do Apêndice C, verificada por check:livro
│
├── lib/           tipos e cálculos puros, sem React
│   ├── types.ts   CharacterData, Tree, AbilityDef + as constantes do Cap. 1
│   ├── rollEngine.ts · dice.ts · weaponDie.ts
│   └── typstFicha.ts · buildFichaPayload.ts   ficha em PDF (Typst)
│
├── store/         estado global (Zustand)
│   ├── useCharacterStore.ts   roster + persistência + migrações
│   ├── selectors.ts           TODAS as fórmulas derivadas
│   └── selectors.test.ts      os testes que travam essas fórmulas
│
├── components/
│   ├── book/      o livro de regras, capítulo a capítulo
│   ├── tree/      Destiny Board
│   └── …          ficha, criação, loja, rolador, tracker
│
└── app/           rotas (App Router)
```

### As três regras da base de código

**1. Um número, uma origem.** Nenhuma fórmula é reimplementada numa página. `selectors.ts` é o gargalo de
propósito — é por isso que o livro nunca diverge da ficha: os dois leem o mesmo `getMaxHp`, o mesmo
`TREES`. Todo custo em PA sai de uma função ou tabela exportada, nunca de um literal digitado na UI.

**2. Divergir da tabela exige justificar.** `MAGIC_ACTIONS` e `RANK_PA_COST` são o padrão sugerido, não a
lei — uma magia pode declarar `actions` ou `paCost` próprios. Mas então o campo `costNote` é
**obrigatório** e explica a troca em uma frase. Sem essa nota, um desvio é indistinguível de um erro de
digitação. Tabelas alternativas de escola inteira (`UTILITY_PA_COST`, `DESINTOX_PA_COST`) não são desvios.

**3. Ficha salva nunca é resetada.** `useCharacterStore` é a única coisa que escreve no `localStorage`.
Mudou o formato de `CharacterData`, ou o id de um item ou talento? Sobe a `version` e escreve a migração —
já existem fichas reais de mesa salvas, e um id órfão vira PA que some do total sem nada explicando por quê.

### Como o estado flui

```
src/data/*.ts  ──►  selectors.ts  ──►  componentes
   (regras)         (fórmulas)         (livro, ficha, árvores, loja)
                          ▲
                          │
                useCharacterStore  ──►  localStorage
                   (a sua ficha)
```

---

## Contribuindo

Toda regra, magia, talento ou número de balanceamento nasce em `src/data/*.ts` **e** no texto
correspondente em `src/components/book/*.tsx` — nunca só num lugar. Se uma mudança na ficha expõe uma
lacuna de regra, a correção sai primeiro no livro e a ficha só reflete o que já está escrito lá.

Mudanças de regra entram em [`PATCH_NOTES.md`](PATCH_NOTES.md) e em `src/data/patchNotes.ts`.
O estado do projeto e as decisões vivas ficam em [`PROGRESS.md`](PROGRESS.md).

### Issues: como reportar

Este repositório trata **bug de código** e **desequilíbrio de regra** como duas coisas diferentes, com dois
formulários diferentes. Confundir os dois é o erro mais comum — e o que mais atrasa a correção.

> **A pergunta que separa os dois:** o site está fazendo o que o livro manda?
>
> - **Não** → o site errou. É **🐛 bug de código**.
> - **Sim, e o resultado ainda é absurdo** → o livro errou. É **⚖️ desequilíbrio de regra**.

| Template | Use quando | Exemplo real |
| --- | --- | --- |
| 🐛 **Bug de código** | O site discorda do livro, quebra, ou calcula errado | *"A ficha mostra 10 PA nas Vantagens de Resistência e 17 PA no total."* |
| ⚖️ **Desequilíbrio de regra** | A regra funciona como escrita e mesmo assim quebra a mesa | *"Um espadão já satura o 4d10 no Rei — a Maestria de Imperador não entrega nada."* |
| ✨ **Conteúdo novo** | Falta uma magia, item, criatura ou árvore | *"Vento não tem como tirar um aliado do corpo a corpo."* |
| 💬 **Discussions** | Você não entendeu uma regra | *"Manto de Touki soma com Postura de Água?"* |

### O que faz uma issue de balanceamento virar commit

Balanceamento não se decide por opinião — se decide por número. O livro já traz duas réguas prontas, e uma
issue que as usa costuma virar mudança no mesmo dia:

- **Apêndice C — Tabela de Dano por Turno:** quanto cada árvore deve causar em cada patamar. Se a sua conta
  estoura a coluna, você tem um caso.
- **Apêndice G — Bestiário:** PV, CA, bônus de ataque e CD esperados por patamar. É contra isso que se mede
  se um efeito é forte demais.

Três coisas transformam um relato em correção:

1. **A conta, escrita.** `4d10 (média 22) × 5 + Força 8 + Rank 6 = 124 em 2 Ações` diz mais que qualquer
   adjetivo.
2. **O JSON da ficha.** `/ficha` → *Exportar JSON*. Reproduz o seu caso exato em segundos.
3. **O que a sua proposta quebra.** Toda mudança quebra alguma coisa. Dizer o quê é metade da decisão — e é
   o que separa uma sugestão de um patch.

### Labels

| Label | Significa |
| --- | --- |
| `bug` | O site discorda do livro |
| `balanceamento` | O livro discorda da mesa |
| `conteúdo` | Falta alguma coisa |
| `precisa-de-numero` | O caso é plausível, mas ninguém fez a conta ainda |
| `precisa-de-mesa` | A conta fecha, mas falta ver acontecer numa sessão real |
| `decisão-de-design` | Não é erro; é uma escolha que o dono do sistema precisa fazer |

---

## Licença e créditos

Projeto de fã, **não-comercial**, sem afiliação com os detentores dos direitos da obra.

<div align="center">
<sub>Mushoku Tensei © Rifujin na Magonote · Media Factory · Studio Bind</sub>
</div>
