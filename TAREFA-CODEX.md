# Tarefas para o Codex

## ✅ Tarefa 1 — o livro contínuo no celular (2026-09-26)

Feita: commits `59b846d`, `ef55151`, `a9848ec` e `39ec628` (tabelas, rótulos do laboratório, alvos de
toque de 40 px, e o `check:mobile` vigiando tabelas).

---

## Tarefa 2 — dois checks que acham incongruência sozinhos (2026-09-27)

O autor pediu uma revisão geral do livro. O Claude e três revisores estão lendo o texto agora, capítulo
por capítulo, e o Claude está mexendo na diagramação do modo folhear. A leitura humana pega intenção;
a sua fatia é o que um programa pega melhor que um leitor cansado: **referência quebrada.**

Leia antes: `CLAUDE.md` (a regra "O Livro é a Fonte" e o que o designer procura: "termos inventados" e
"incongruências") e `scripts/check-texto.mts` (o estilo dos checks do projeto: cabeçalho explicando por
que existe, achados FALHA/AVISO, sai com código 1 só em FALHA).

### 2a. `npm run check:termos` — termo usado e não definido

Toda condição, estado ou unidade citada no livro tem que estar definida no livro.

- A fonte das definições: `src/data/condicoes.ts` (o Glossário de Condições do Cap. 4) e os termos
  definidos em outros lugares do livro (ex.: PA, PM, PT, PP, BC, CA, CD, Descanso Curto/Longo, Ação,
  Reação, Vantagem, Desvantagem). Monte a lista de termos definidos lendo os dados e os capítulos
  (`src/components/book/Chapter*.tsx`, `Appendices.tsx`); o que não der pra extrair, deixe numa lista
  fixa dentro do script, com um comentário dizendo onde o livro define cada um.
- Onde procurar os usos: o texto impresso das árvores (`src/data/trees/*.ts`: efeitos, descrições,
  talentos, Maestrias), das raças, antecedentes, itens da loja, criaturas do bestiário e os capítulos.
- O difícil é achar o que é "termo": comece pelas palavras que o livro usa como estado de criatura, com
  maiúscula no meio da frase ("fica Atordoado", "o alvo Caído", "enquanto Em Chamas", "Molhado",
  "Sangrando", "Exausto 2"), e pelos padrões "condição X", "estado X", "fica X". Aceite falso positivo
  como AVISO; FALHA só quando for claramente um estado aplicado a uma criatura e não definido.
- Liste também o contrário, como AVISO: condição definida no glossário que nenhuma carta usa (opção
  morta no glossário).

### 2b. `npm run check:remissoes` — "Cap. 4, §6" que não é o §6

O livro remete muito: "(Cap. 2, §3)", "ver o Cap. 4, §7", "Apêndice C", "(§2)" dentro do mesmo capítulo.

- A verdade: `src/data/sumarioDoLivro.ts` (ids `capN-M` e rótulos "M. Título").
- Pra cada remissão no texto impresso (capítulos, árvores, raças, antecedentes, loja, bestiário): o
  capítulo e a seção existem? Quando a frase diz o assunto ("o Fio da Vida (Cap. 4, §6)"), o assunto
  aparece no texto daquela seção? (Procure a palavra-chave no JSX da seção; sem achar, AVISO.)
- `§N` sem capítulo vale pro capítulo do arquivo em que está; numa árvore, `§N` sozinho é suspeito
  (AVISO).
- Apêndice citado por letra tem que existir (A–G hoje) e o assunto tem que bater com o título.

### Regras

- **Você NÃO edita o texto do livro nem os dados** (`src/components/book/*.tsx`, `src/data/**`): os
  revisores estão editando esses arquivos agora. Os achados vão num relatório, e o Claude aplica.
- Pode criar/editar: `scripts/check-termos.mts`, `scripts/check-remissoes.mts`, os scripts no
  `package.json`, e um teste em `scripts/` ou `src/lib/` se quiser.
- Rode os dois checks no fim e cole o resultado em **`RELATORIO-CODEX-TERMOS.md`** (na raiz): a lista
  de FALHAs e AVISOs, cada uma com o arquivo:linha e a frase. Separe o que você acha que é defeito
  de verdade do que é falso positivo que o check ainda pega.
- Commits pequenos direto na `main`, mensagem em português dizendo o que mudou e por quê. Antes do
  push: `npx tsc --noEmit -p .`, `npx vitest run`, `npx eslint scripts`. Subir:
  `git fetch -q; git merge -q --no-edit origin/main; git push -q origin HEAD:main`. Nunca rebase.
- Não precisa de nota em `patchNotes.ts` (é ferramenta, o jogador não vê).

### Entrega

Escreva aqui embaixo, em poucas linhas: os dois comandos, quantas FALHAs e AVISOs cada um achou, e o
que ficou de fora.

### Pendências pro Claude

(vazio)
