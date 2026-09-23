# Plano: Livro mais Livro, Site Consistente, Itens e Loot

Combinado com o autor em 2026-09-23. Ordem de execução: **Livro → padrões pro site → ajuste
pontual em Árvores → Itens/Loot**. Segue "O Livro é a Fonte": nada entra no site sem antes estar
escrito como regra no livro.

---

## Fase 1 — O Livro mais "livro" (híbrido livro + site) — **FEITA (2026-09-23)**

Decisão do autor: quer sensação de página, mas sem abrir mão do que só um site faz bem (busca,
navegação, responsividade). Nada de efeito de virar página em 3D — custo alto, frágil no mobile,
e mobile é inegociável.

**Mantido como estava** (já funcionava): `Diagramas.tsx`, tema claro/escuro, busca no sumário,
tabelas e medida de linha de 68ch do `BookUI.tsx`.

**O que entrou:**

1. **Capa** (`BookCover.tsx`, nova). O `/livro` abria com o `PageHeader` — o mesmo objeto da loja
   e da ficha. Agora abre com capa emoldurada: "Livro de Regras", título, "O Mundo de Seis Faces"
   e a edição (puxada de `patchNotes.ts`, então nunca desatualiza). A arte entra desfocada, o que
   de quebra resolve o item 19 do `O-QUE-FALTA.md` — `faixas/livro.jpg` tem 680×384 e não precisa
   mais de resolução.
2. **Folha de rosto por capítulo** (`ChapterTitle` no `BookUI.tsx`). Número em versalete entre
   filetes, título, filigrana e uma linha dizendo o que o capítulo cobre — a linha responde "é
   aqui que eu procuro isso?" sem descer até a primeira seção.
3. **Fólio de fim de capítulo** (`FimDoCapitulo`). O capítulo agora acaba, em vez de só parar: o
   fólio fecha e um link leva ao próximo (a ordem sai do `SUMARIO_DO_LIVRO`, sem repetir dado).
4. **A página virou folha** (`.livro-pagina`). Era um cartão `rounded-2xl` com o livro inteiro
   dentro. Agora tem canto quase reto, margem de livro, textura de fibra (reusando `.surface`) e
   sombra de folha apoiada no lugar da borda desenhada.
5. **Cabeçalho corrente no mobile** (`BookShell.tsx`) — o ganho prático maior. O sumário do celular
   era um `<details>` no topo do documento: para alcançá-lo era preciso rolar 87 mil pixels de
   volta, e na prática ninguém navegava o livro no celular, só rolava. Agora ele gruda abaixo do
   nav, diz capítulo e seção em que a leitura está, e abre o índice inteiro ali mesmo.
6. **Dois defeitos corrigidos no caminho:** a capitular invadia o título seguinte quando o
   parágrafo de abertura tinha menos de três linhas (era visível no Cap. 4), e a linha de leitura
   ficava atrás das barras do topo — a barra mentia sobre onde você estava por uma tela inteira
   de rolagem.

A lógica de posição de leitura saiu do `BookToc` para `usePosicaoDeLeitura.ts`, porque sumário e
cabeçalho corrente fazem a mesma pergunta e medir o documento duas vezes por scroll seria pagar
dobrado pela mesma resposta.

**Verificado:** `tsc`, `lint`, 704 testes, `check:livro`, `check:sumario`, e nos dois temas —
`check:contraste` (WCAG AA), `check:a11y` e `check:mobile` (zero transbordo de 320px a 414px).

**Ainda em aberto nesta fase:** o sumário lateral do desktop continua com cara de painel de
documentação. Dá pra dar tipografia de índice impresso a ele, mas hoje ele funciona bem — fica
para depois das fases que valem mais.

## Fase 2 — Propagar padrões pro site

1. **Criar `Button` reutilizável** (`src/components/ui/Button.tsx`), no mesmo espírito do que
   `Surface.tsx` já fez pra cards. Hoje há 181 ocorrências de `<button` cru espalhadas
   (`BlocoDoMonstro.tsx`, `BuscaGlobal.tsx`, `Shop.tsx` etc.), cada uma com sua própria combinação
   de classes Tailwind — sem padronização, sem `@apply` em `globals.css`.
2. Levar pro site só o que fizer sentido dos tokens/tipografia que nascerem na Fase 1 — a
   home e a `/loja` já estão visualmente consistentes hoje, não precisam de retrabalho forçado.

## Fase 3 — Árvores: ajuste pontual, não redesenho

O autor confirmou que o mapa (`DestinyBoard.tsx`) já está bom visualmente — **não mexer na
estética**. Já existe um `DetailPanel` que abre ao clicar num nó (`DestinyBoard.tsx:848`); o
ajuste é:
- Aumentar a profundidade/clareza do que esse painel mostra ao clicar numa bolinha.
- Avaliar legenda (cores/ícones dos Ranks), só se não pesar visualmente.

## Fase 4 — Itens e Sistema de Loot

**Achado:** existe um rascunho pronto, mas ele não está neste worktree — vive sem commit no
checkout principal (`C:\Users\pedro\OneDrive\Área de Trabalho\Moshoku tensei rpg`):

- `NOVOS_ITENS.md` — 65 itens novos com fluff e tags de disponibilidade
  (`compraveis/vendidos`, `criminosos`, `drop`, `tralha`), mas sem os campos que o schema atual
  exige (`guildRankRequired`, `baseDie`) e sem um campo formal de disponibilidade/raridade.
- `SISTEMA_DE_LOOT.md` — desenho de um motor de loot dinâmico: PO sugerido + drops de "tralha" +
  drops de equipamento, pesados pelo Arquétipo/Subarquétipo do grupo, e uma economia de revenda
  em 3 regras (tralha 100%, equipamento padrão 50%, relíquia rara por leilão/negociação).
- Código já mexido, também sem commit: `EncounterBuilder.tsx` ganhou um botão "Explicação"
  (`EncounterExplanation.tsx`, novo, 160 linhas) — só UI de texto explicativo. **O motor de loot
  em si ainda não foi tocado**: `lootGenerator.ts` continua no nível mais simples (sorteia poção/
  aventura dentro de um orçamento, sem pesagem por arquétipo, sem separar tralha de equipamento).

**Antes de implementar — revisão de balanceamento (prioridade #2 do projeto, não é opcional):**
Vários itens do rascunho fogem muito da escala numérica que o livro já usa — ex.: a Armadura
Zariff MK-I triplica dano e deslocamento de uma vez, a Panaceia cura 100% + remove Marcas da
Morte + regenera membros num item só. Preciso passar cada um pela mesma régua que os capstones do
livro já levam (`check:progressao`) antes de qualquer um entrar no catálogo oficial. Isso vira
sessão de Modo Entrevistador pros itens que exigirem decisão de design.

O schema `ShopItem` também não tem campo de disponibilidade (comprável vs. só narrativa/drop/
mercado negro) nem de raridade — precisa existir antes, senão a Loja vende a Lança Genuína de
Superd por engano.

**Ordem de execução (livro primeiro, sempre):**
1. Trazer os dois arquivos de rascunho pra dentro deste branch/worktree (ou confirmar onde essa
   frente está sendo tocada — ver pergunta em aberto abaixo).
2. Revisão de balanceamento item a item, com decisões marcadas em Modo Entrevistador.
3. Escrever a regra de disponibilidade + economia de revenda no livro (Cap. 5), estender
   `ShopItem`/`InventoryItem` com os campos novos.
4. Reescrever `lootGenerator.ts` pra pesar por Arquétipo/Subarquétipo e separar tralha de
   equipamento, alimentando `EncounterRewards.tsx`.
5. Site por último — `ShopCatalog.tsx` e `/loja` continuam puxando do mesmo dado do livro, como
   já é hoje.

---

## Em aberto — decisão do autor

- As WIP files da Fase 4 estão sem commit no checkout principal, fora deste branch. Trago esse
  trabalho pra cá agora, ou isso já está sendo tocado em outra sessão e eu devo esperar o commit
  chegar em `main`?
