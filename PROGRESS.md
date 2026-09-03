# Progresso — Mushoku Tensei RPG

**Última atualização:** 2026-09-03 — quatro passadas (0.0.3 a 0.0.6). A última fecha os buracos que a
leitura completa do livro abriu: Rank Deus do Vendaval, escada de cura do Rei, `Corpo de Ferro` escalando,
a regra de PM com uma redação só — e `npm run check:livro`, que passa a achar sozinho a classe de
contradição que custou uma leitura manual inteira. Ver [`PATCH_NOTES.md`](PATCH_NOTES.md).

> Este arquivo guarda **só o estado atual, o que falta e o porquê das decisões vivas**.
> O histórico sessão a sessão vive no `git log`; o histórico de regras vive em `PATCH_NOTES.md`.
> Ao terminar algo, mova para "Pronto" ou apague — não acumule uma entrada nova por sessão.

---

## Estado atual

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Zustand com persistência em `localStorage`
(schema `version: 10`).

**Fonte de verdade única:** `src/data/`. O livro (`src/components/book/*.tsx`), o mapa de árvores
(`/arvores`), a loja (`/loja`) e o PDF exportado leem todos os mesmos arrays — nenhuma tabela é escrita à
mão duas vezes.

### Rotas

| Rota | O que é |
| --- | --- |
| `/` | Landing page — apresentação e disclaimer de projeto de fã |
| `/ficha` | Ficha de personagem: atributos, PV/PM/PT/PP/CA calculados, inventário, Grimório, Lore, Desfazer, export PDF (Typst) e JSON |
| `/criar` | Três vias de criação: Manual (wizard de 8 passos), Roleta e Entrevista |
| `/livro` | Livro de regras completo, navegável, com Patch Notes embutidos |
| `/arvores` | Mapa radial estilo Destiny Board — pan/zoom, compra refletindo na ficha na hora |
| `/loja` | Loja da Guilda — 85 itens, filtro duplo Tipo × Rank de Guilda, `buyItem` valida PO **e** Rank |
| `/iniciativa` | Tracker de iniciativa |
| `/personagens` | Roster de fichas |

### Conteúdo

- **19 árvores** (17 base + Vendaval e Punho de Fogo, híbridas e ocultas até os pré-requisitos).
- **~400 magias, talentos e técnicas**, todas com encantamento e custo declarados.
- **7 raças + antecedentes** com 3 sub-tabelas (Miko, Olho, Laplace).
- **9 Magias Combinadas** oficiais (`src/data/combinedSpells.ts`).

---

## Metas atuais

- [ ] **Deixar o site mais bonito** — Ficha e Roleta já receberam um passe; **`/livro` e `/arvores`
      seguem pendentes**, nessa ordem.
- [ ] **Auditoria linha a linha das magias** — Água, Fogo, Terra, Vento, Deus da Espada, Desintoxicação e
      Cura conferidas por completo. Barreira, Invocação e Bardo tiveram os **cânticos** auditados e
      reescritos em 0.0.4, mas não os números. Faltam por inteiro: Suishin, Norte, Lutador, Escudos,
      Arquearia, Ladino, Tático, Vendaval, Punho de Fogo.
- [ ] **Validar Distância Roubada na mesa** (Vendaval, novo em 0.0.4) — a mecânica soma alcance a partir do
      movimento, e nenhuma outra árvore faz isso. Vale medir se 9m de bônus de alcance no Principiante não
      transforma a árvore num arqueiro corpo a corpo cedo demais.
- [ ] **Entrevista (Via 3), banco de perguntas** — os 2 modos já existem; falta só o conteúdo:
  - [ ] Crescer de 14 para ~20 perguntas (`src/data/interview.ts`).
  - [ ] 6 respostas possíveis por pergunta, com 4 sorteadas por vez — nunca sempre as mesmas.
- [ ] **Confirmar o fix do PDF em produção** — só verificável no próximo deploy da Vercel.
- [ ] PWA / modo offline — mesa física não pode depender de internet.
- [ ] Acessibilidade: contraste, tamanho de fonte ajustável, teste real com leitor de tela.

## Backlog

- Sincronização em tempo real (WebSocket) para jogar online com a ficha atualizando ao vivo.
- Rank Deus / caminho de ascensão do Estilo Vendaval — a única árvore sem esse quadro.
- Bestiário: falta uma criatura de 6º patamar ("Ancião Demônio Esquecido", conceito esboçado).
- Universidade de Ranoa como 4ª facção de Reputação.
- Macros de Teste (1d20 com Vantagem/Desvantagem) no `DiceRoller` — hoje macro só suporta Dano.
- Magias inatas de raça (ex: Howling da Raça Fera) só existem como texto no card de passivas, não como
  habilidade de verdade no Grimório.
- PDF via Typst: revisão visual fina (densidade dos cards, Deslocamento refletindo raça, BC em multiclasse).
- Tradução PT-BR / EN.

---

## Decisões de design vivas

Só o que ainda governa o sistema hoje. O raciocínio completo de cada mudança de regra mora no comentário
do arquivo que a implementa — os ponteiros abaixo dizem onde procurar.

### Aflições são Rank, não Profundidade (2026-09-03)

Toda aflição tem um Rank; um feitiço de rank X remove uma aflição de rank X ou inferior. Nada sobe, nada
desce. A mecânica antiga exigia um segundo relógio por personagem afetado e transformava o turno do
jogador de Desintoxicação em aritmética. O que a Profundidade media — *"dá pra curar isto?"* — agora se lê
direto no rank. A urgência sempre veio do efeito da aflição, não do contador.

→ `src/data/trees/desintoxicacao.ts` (comentário de topo) · Cap. 4, §7.

### A Escola Barata (2026-09-03)

A Desintoxicação usa `DESINTOX_PA_COST`, não a tabela comum. É a única escola cujo trabalho principal
acontece fora do combate e cujo alvo é sempre um problema que o Mestre criou: ninguém compra Purgar
esperando ganhar uma luta. Cobrar dela o preço de uma escola de dano era fazer o jogador pagar Fogo por um
seguro contra o roteiro. O poder foi cortado junto — o preço baixo é a compensação, não um presente.

→ `src/data/trees/shared.ts`.

### O cântico é mecânica, e mecânica tem piso (2026-09-03)

`INCANTATION_LENGTH` deixou de ser guia de estilo e virou a **porta do Bônus de Recitação Perfeita**:
cântico abaixo do piso do rank não paga bônus, e a carta imprime "Sem bônus". Antes o bônus era automático
e 55 das 149 magias estavam abaixo do próprio piso — o sistema premiava quem escrevesse cântico curto,
exatamente o oposto do que o Cap. 2 promete. As 5 magias que continuam curtas são de emergência e
declaram isso em `costNote`; nelas a velocidade já é o benefício.

→ `qualifiesForRecitationBonus` em `src/lib/types.ts` · `scripts/check-magias.mts`.

### Toda árvore declara a própria mecânica (2026-09-03)

`Tree.mechanic` (tag / hook / loop / cost) é obrigatória na prática: as 19 têm. O `cost` — a fraqueza
declarada — é o campo que mais importa. Uma árvore sem fraqueza escrita é uma árvore que ninguém sabe
quando *não* escolher, e é assim que se escreve um sistema em que todo mundo joga a mesma ficha.

→ `TreeMechanic` em `src/lib/types.ts` · `MechanicCard` em `TreeCatalog.tsx` · Cap. 3, "Como Ler uma Árvore".

### Cada árvore prepara uma condição e cobra outra

Água prepara **Molhado** e cobra **Congelado**; Terra prepara **Atolado** e cobra **Soterrado**; Vento
aplica **Desequilibrado** e cobra +1 dado de dano contra quem está nele; Fogo não prepara nada e cobra
**Em Chamas** na hora. Os três estilos de espada não têm condição de propósito: Deus da Espada é
`[Letalidade]` pura, Deus do Norte é `[Improviso]`, Deus da Água é `[Contra-ataque]`. Cada Maestria de 1º
patamar marca a sua entre colchetes, então a identidade é legível sem ler a árvore inteira.

→ Maestrias em `src/data/trees/*.ts` · condições no Cap. 4, §5.

### Uma fonte por número

Todo custo em PA vem de uma função ou tabela exportada, nunca de um literal repetido na UI. A regressão de
2026-09-03 nasceu exatamente disso: a ficha imprimia `count × 2 PA` enquanto o motor cobrava a escada
progressiva, e ninguém percebeu porque os dois lugares "sabiam" a regra separadamente.

→ `attributePaCostTotal` / `saveAdvantagePaCostTotal` em `src/lib/types.ts`.

### Divergir da tabela exige justificar

`MAGIC_ACTIONS` e `RANK_PA_COST` são o padrão sugerido, não a lei. Uma magia pode declarar `actions` ou
`paCost` próprios — mas então o campo `costNote` é **obrigatório** e explica a troca em uma frase. Sem essa
nota, um desvio é indistinguível de um erro de digitação. Tabelas alternativas de escola inteira
(`UTILITY_PA_COST`, `DESINTOX_PA_COST`) não são desvios e não pedem nota.

→ `src/lib/types.ts` (`AbilityDef.costNote`) · `scripts/check-magias.mts`.

### Reservas são padronizadas

Todo talento "+N PV/PM por patamar" é declarado em `ReserveGrant` e aplicado pelo motor, não digitado à
mão pelo jogador. O Cap. 1 promete que um talento de reserva vale o mesmo em qualquer árvore; o código é
quem garante.

### O tamanho do encantamento escala com o rank

`INCANTATION_LENGTH` define piso e teto por rank. O Bônus de Recitação Perfeita transforma o cântico em
mecânica: se recitar bem dá Vantagem, o preço tem que ser tempo real de mesa. Um Imperador sustenta meio
minuto de fôlego; um Principiante resolve em uma linha.

### Ficha salva nunca é resetada

Já existem fichas reais usadas em sessão. Toda mudança de schema entra como migração de verdade no
`persist` (`useCharacterStore.ts`), incluindo renomear ids de item e de talento — um id órfão vira PA que
some do total sem nada na ficha explicando por quê.

---

## Verificação

```bash
npx tsc --noEmit      # tipos
npm run lint          # eslint
npm run check:livro   # confere dados × texto do livro (rodar dentro do WSL)
```

**Nota de ambiente:** `next build` e `tsx` dependem de binários nativos instalados para Linux
(`lightningcss`, `esbuild`). Rodá-los a partir do Windows sobre `\wsl.localhost` falha; rode-os de dentro
do WSL. `tsc` e `eslint` funcionam dos dois lados.
