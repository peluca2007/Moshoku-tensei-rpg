# Plano: o livro como livro, e o Mestre com menos trabalho

Combinado com o autor em 2026-09-23. A ordem é sempre a mesma: **o livro primeiro** — nada que o
site aplica pode faltar no livro.

---

## Já está na `main` (2026-09-23)

O `/livro` deixou de abrir como uma rota do site: ganhou **capa** com a edição, **folha de rosto
por capítulo** (numeral em versalete, filigrana e uma linha dizendo o que o capítulo cobre),
**fólio de fim** com link pro próximo, e a página virou **folha** em vez de cartão. No celular, o
**cabeçalho corrente** gruda abaixo do nav, diz onde a leitura está e abre o índice inteiro em
qualquer ponto — antes o sumário era um `<details>` no topo de 87 mil pixels, e quem lia na mesa
não navegava o livro, só rolava.

O **sumário virou índice**: o número saiu do texto e foi pra uma coluna própria (romano no
capítulo, arábico na seção, recuo na subseção), o painel-cartão virou margem com filete, e a busca
virou uma linha em vez de caixa de formulário.

No resto do site: os **41 `<select>`** entraram na paleta, nasceram **`Button` e `Chip`**, e o topo
da **ficha** parou de abrir com nove botões de exportação antes do primeiro número do personagem.

Em itens: os **65 do Compêndio** entraram revisados, com `disponibilidade` (Guilda / Fora da Guilda
/ Relíquia) e preço nullable, mais as regras de **"O que a Guilda não vende"** e **"Vender o que
caiu"** no Cap. 5.

---

## 1. Sub-arquétipos de criatura — a recompensa sai pronta

**O problema:** montar um encontro dá trabalho de sobra pro Mestre, e a recompensa é a parte que
ele resolve por último e no chute. Hoje a tela pede um orçamento em PO e sorteia itens sem nenhuma
relação com o que foi derrotado — um lobo pode largar uma poção de mana.

**O desenho:** os 5 arquétipos de hoje (Bruto, Ágil, Fortaleza, Conjurador, Mente) dizem o que a
criatura FAZ. O sub-arquétipo diz o que ela É — Besta, Monstruosidade, Humanoide, Morto-Vivo,
Construto, Demônio. Os dois se combinam: um Bruto/Besta é um urso, um Bruto/Morto-Vivo é um
zumbi grande, um Conjurador/Humanoide é um necromante. São 6 conceitos novos que, cruzados com os
5 que já existem, dão 30 criaturas reconhecíveis.

O sub-arquétipo carrega o que o arquétipo não tem como saber:

- **O espólio.** Besta larga presa, couro e chifre; Morto-Vivo larga pano amaldiçoado e osso;
  Construto larga gema. É o que faz a recompensa sair do próprio corpo em vez de um sorteio.
- **Moeda.** Humanoide carrega bolsa. Lobo não carrega nada, e essa diferença é metade da
  economia de escassez do Cap. 5.
- **Resistência e imunidade sugeridas.** Morto-Vivo resiste a veneno, Construto é imune a ele.
- **Ações sugeridas**, pra montar um monstro sem inventar do zero.

**Onde entra:** `ARQUETIPOS_CRIATURA` em `src/data/bestiary.ts` ganha um irmão; o Bloco do Monstro
ganha o segundo seletor; o `lootGenerator` passa a receber as criaturas derrotadas em vez de só um
orçamento; e o Apêndice G documenta os dois eixos.

## 2. Diagramas que demonstram a regra

O livro tem `Diagramas.tsx` em SVG, e eles são estáticos. A coisa que o papel não faz é **mostrar a
regra acontecendo**: as 3 Ações sendo gastas no turno, o d20 subindo a Escada de Dados, o
Quebrantado empilhando acúmulo por acúmulo, as etapas do Tiro Perfeito falhando no meio.

Regras: animação que entra ao aparecer na tela (não em loop eterno, que cansa na leitura), sempre
com o estado final legível parado, e `prefers-reduced-motion` desliga tudo. É explicação, não
enfeite — se a animação não ensina, ela não entra.

## 3. Talentos de especialização dentro da árvore

**O que o autor quer:** não dividir o tronco em duas árvores — dentro da mesma árvore, ter
talentos que aprimoram o que você já tem, pra você se especializar. O Lutador é o caso claro: ele
já é punho E machado/marreta/haste numa árvore só, e hoje você recebe as duas coisas sem escolher
nenhuma.

O sistema já tem `TalentDef`, então a peça existe — o que falta é a **decisão**: um talento que
aprofunda o punho e outro que aprofunda o peso, no mesmo patamar, competindo pelo mesmo PA. Quem
escolhe, renuncia; quem renuncia, tem identidade.

Risco a vigiar (é o item que o `O-QUE-FALTA.md` já cobra): se um lado render mais, vira escolha
obrigatória e o outro vira opção morta. Cada par entra medido pelo `check:progressao`.

## 4. A loja no livro

O catálogo no Cap. 5 é uma tabela de quatro colunas, e a loja do site tem card, ícone de categoria
e preço em destaque. O livro não precisa virar a loja — mas precisa ser lido com o mesmo prazer, e
hoje uma tabela de 34 armas é uma parede.

---

## Como o autor vê o resultado

O trabalho acontece num worktree, em branch própria, e chega na `main` por fast-forward quando um
bloco fecha — é o que aconteceu com os 6 commits de hoje. Enquanto um bloco está aberto, dá pra
ver na porta que o worktree sobe, sem mexer no `localhost:3000`.
