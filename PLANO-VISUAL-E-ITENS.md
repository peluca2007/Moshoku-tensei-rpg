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

## Fase 2 — Propagar padrões pro site — **FEITA (2026-09-23)**

1. **`Button` e `Chip`** (`src/components/ui/`). Eram 181 `<button>` com classes soltas. Viraram
   dois componentes porque são duas gramáticas: o Button dispara uma ação e volta ao repouso; o
   Chip fica ligado ou desligado e é sempre um de uma fileira. O seletor Mapa/Lista das árvores
   ficou de fora de propósito — é um seletor de um-entre-dois dentro de uma moldura, e dar fundo
   ao apagado viraria caixa dentro de caixa. Convertidos: barra de ações da ficha, filtros da loja
   e perícias de árvore; o resto migra quando alguém encostar no arquivo.
2. **Os 41 `<select>` do site entraram na paleta** (regra em `@layer base`, não em componente —
   trocar 41 tags mexeria em 12 arquivos pra chegar no mesmo lugar). Eram caixas cinzas do sistema
   operacional no meio do pergaminho, e o controle mais tocado depois dos botões.
3. **O topo da ficha** deixou de ser um painel de exportação. Eram nove botões e um parágrafo
   antes do primeiro número do personagem; ficaram Desfazer e Baixar PDF, que é o que se usa no
   meio da sessão, e os outros sete foram pra trás de um "Exportar, compartilhar e imagens". Os
   atributos agora aparecem na primeira tela do celular.

De quebra: os 16 filtros da loja passaram a anunciar `aria-pressed` — antes um leitor de tela dava
sete "Todos, botão" idênticos, sem dizer qual estava aceso.

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

**O que já foi feito (2026-09-23):**

1. ✅ Os 65 itens entraram em `src/data/compendioDeItens.ts`, revisados. As quatro decisões de
   design que o autor tomou estão registradas no cabeçalho do arquivo, com os números que as
   motivaram.
2. ✅ `ShopItem` ganhou `disponibilidade` (Guilda / Fora da Guilda / Relíquia) e `price` virou
   nullable — relíquia não tem preço, e não custa zero. A categoria `tralha` nasceu junto.
3. ✅ O livro (Cap. 5) ganhou "O que a Guilda não vende" e "Vender o que caiu" — a economia de
   revenda em três linhas: espólio a 100%, equipamento a 50%, relíquia não se vende.
4. ✅ `lootGenerator.ts` separa espólio de equipamento e nunca sorteia relíquia. `EncounterRewards`
   mostra os dois grupos separados, porque eles vendem por regras diferentes.

**Ainda falta:**

5. A **pesagem do loot pela composição do grupo**, que o `SISTEMA_DE_LOOT.md` descreve — ver a
   pergunta em aberto abaixo.

---

## Em aberto — decisão do autor

**A pesagem de loot depende de uma mecânica que não existe.** O `SISTEMA_DE_LOOT.md` pesa os drops
por "Arquétipo e Subarquétipo Narrativo" (Erudito Arcana, Guerreiro Intuitivo, Vampiro de Loot) —
e nada disso existe no livro nem na ficha. Implementar como está escrito significa criar um
sistema de classificação novo, que o jogador teria que declarar, num sistema cujo argumento de
venda é justamente não ter classe.

A alternativa que usa o que já existe: pesar pelas **árvores que o grupo comprou**. Um grupo com
Magia de Água aberta puxa foco mágico e grimório; um com Ladino puxa veneno e lâmina oculta. Sai
de graça da ficha, não exige o jogador declarar nada, e não contradiz o "ninguém tem classe".

**Nota sobre os rascunhos:** `NOVOS_ITENS.md` e `SISTEMA_DE_LOOT.md` foram copiados para este
worktree mas **não foram commitados** de propósito — eles existem sem commit no checkout principal,
e versioná-los aqui faria o merge falhar lá ("untracked working tree file would be overwritten").
O conteúdo dos dois já está aplicado no código e no livro; quando esta fase fechar, eles podem ser
apagados dos dois lugares.
