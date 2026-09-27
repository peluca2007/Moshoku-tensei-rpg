# Tarefas para o Codex

## ✅ Tarefa 1 — o livro contínuo no celular (2026-09-26)

Feita: commits `59b846d`, `ef55151`, `a9848ec` e `39ec628` (tabelas, rótulos do laboratório, alvos de
toque de 40 px, e o `check:mobile` vigiando tabelas).

---

## ✅ Tarefa 2 — dois checks que acham incongruência sozinhos (2026-09-27)

Feita: `npm run check:termos` (108 termos, 0 FALHA, 0 AVISO) e `npm run check:remissoes` (415
remissões, 0 FALHA, 0 AVISO). Relatório em `RELATORIO-CODEX-TERMOS.md`.

<details><summary>O pedido original</summary>


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

</details>

---

## Tarefa 3 — o folhear abre mais rápido, com o MESMO livro (2026-09-27)

O modo folhear (`/livro/folhear`) diagrama o livro inteiro no navegador depois de montar: uma série de
passadas mede onde cada bloco caiu e corrige (título separado do texto, tabela partida, vão no pé da
coluna, fecho de árvore…). Cada passada mede o próprio tempo com `performance.measure("folhear:<nome>")`.
Medido hoje num desktop, com 1600×1000: `figuras` ~1,1–1,4 s, `cartas` ~1,9–2,3 s (a passada nova,
`encaixarCartas`, que enche o vão no pé da coluna), `titulos` ~1,2–1,8 s, `fechos` ~0,4 s. No celular é
bem pior, e a mesa joga no celular.

**Objetivo: cortar o tempo total da diagramação pela metade, sem mudar UMA página do livro.**

### Passo 1 — a régua antes de mexer

Ensine o `scripts/revisar-livro.mjs` a gravar uma **assinatura** da diagramação (ex.:
`--assinatura saida.json`): pra cada título (`h2, h3, h4`), cada carta (`.livro-verbete`), cada tabela e
cada figura, a página e a coluna onde o primeiro pedaço dele caiu, mais o total de páginas. Grave a
assinatura da `main` de hoje ANTES de qualquer otimização. Toda mudança depois tem que produzir a mesma
assinatura, byte a byte. Se uma otimização muda a assinatura, ela está errada — mesmo que "pareça
igual".

Grave também o tempo de cada passada (os `performance.measure`) no mesmo relatório, pra comparar.

### Passo 2 — otimizar

Onde procurar (leia os comentários: cada passada explica por que existe):
- **Leitura e escrita intercaladas** forçam o navegador a rediagramar o livro inteiro a cada
  `getClientRects`. O padrão do arquivo já é "escreve tudo, lê tudo" em várias passadas; procure as que
  não seguem.
- **`encaixarCartas`** (em `diagramacao.ts`) roda até 8 passadas, cada uma medindo TODAS as cartas.
  Cada árvore começa em página nova: uma troca numa árvore não muda a diagramação das outras. Dá pra
  medir só as árvores que mudaram na passada anterior.
- **`segurarTitulos`** e as rodadas de conferência em `Folhear.tsx` (até 8 × 3 repetições).
- `querySelectorAll` repetido do livro inteiro em cada passada: dá pra coletar uma vez e reaproveitar.

### Regras

- Arquivos que você pode mexer: `src/components/book/folhear/diagramacao.ts`,
  `src/components/book/folhear/Folhear.tsx`, `src/components/book/folhear/diagramacao.test.ts`,
  `scripts/revisar-livro.mjs` e o que criar em `scripts/`. O Claude não vai mexer nesses arquivos
  enquanto esta tarefa estiver aberta.
- NÃO mexa em CSS (`folhear.css`), no texto do livro nem em `src/data/`: qualquer um deles muda a
  diagramação e invalida a assinatura.
- Nada de trocar o comportamento: se uma passada parece inútil, meça (a assinatura sem ela muda?) e
  anote aqui em vez de remover por conta própria.
- Antes de cada push: assinatura idêntica à da `main` de hoje; `BASE=http://localhost:3020 npm run
  revisar:livro` sem estouro nem título separado; `npx tsc --noEmit -p .`, `npx vitest run`,
  `npx eslint src scripts`.
- Commits pequenos direto na `main`, em português, dizendo quanto cada um economizou. Subir:
  `git fetch -q; git merge -q --no-edit origin/main; git push -q origin HEAD:main`. Nunca rebase.
- **Se a `main` mudar o livro enquanto você trabalha** (texto, dados ou CSS), a assinatura muda por
  outro motivo: grave uma assinatura nova a partir da `main` atualizada, SEM as suas otimizações, e
  compare com ela.

### Entrega

Aqui embaixo: o tempo de cada passada antes e depois (desktop; e em 390×844 se conseguir), e o que
ficou de fora.

### Pendências pro Claude

(vazio)

---

## Tarefa 4 — a estética do livro: a arte no lugar certo, e a arte parada entrando (2026-09-27)

**Comece quando fechar a Tarefa 3** (os arquivos de diagramação continuam seus; o Claude segue fora
deles).

O autor, com as palavras dele: *"a coisa que eu mais prezo no momento é a estética do livro, porque tem
muita coisa que podia ser melhor — tipo a imagem do Orsted está em outra página, ele poderia estar na
página junto com a raça. Temos várias imagens que podiam ser usadas, mas não estão."*

Leia antes: `CLAUDE.md`, `PLANO-LIVRO-DIGITAL.md`, `ARTE-PARA-O-LIVRO.md` e `acervo-de-arte/LEIAME.md`
(o catálogo das ~60 imagens paradas, com o que cada uma mostra e onde pode entrar).

### O que fazer

1. **A Raça Dragão numa página só.** Hoje a raça mítica tem a página de texto (p. 34, com ~30% em
   branco no pé, porque o texto encurtou no nerf) e uma página inteira só com a arte do Orsted
   (`public/livro/racas/dragao.webp`, em pé, 640×1137). Ponha o Orsted **na mesma página** do texto —
   por exemplo, a arte ocupando uma coluna inteira em altura e o texto na outra — e a página extra
   some. O código: `FichaDeRaca.tsx` (o bloco `race.tier === "mitica"`) e o `folhear.css`. Vale pro
   contínuo também.
2. **A arte parada entra.** Percorra o `acervo-de-arte/` e ponha no livro o que melhora a página, em
   ordem de impacto:
   - **as árvores de página inteira**: o LEIAME tem uma lista de artes separadas pra abrir árvores
     (Navegação e Liderança, Bardo, Cura, Fogo, Punho do Fogo, Deus do Norte, Arquearia…);
   - **segunda arte / vinheta das raças** (Superd, Migurd, Oceano, Anã, Élfica, Demônio Imortal…);
   - **bestiário** (Apêndice G) e pranchas de capítulo que ainda não têm arte;
   - **os vãos**: página com muito branco no pé (o `revisar:livro` lista) é lugar de arte, não de selo.
3. **Olhe o livro inteiro como leitor**, dupla por dupla (`npm run revisar:livro` gera as fotos e as
   folhas de contato em `.telas/revisao/`), e conserte o que estiver feio: arte cortada no rosto,
   arte borrada, duas artes brigando na mesma dupla, página sem nenhuma arte num trecho longo, legenda
   que não bate com a cena (`LEGENDAS` em `Prancha.tsx`).
4. Os **ícones das raças** (`public/racas/*`, o brasão da `RaceCrest`) são silhuetas de banco de
   imagem, num estilo diferente do resto do livro. Proponha (e, se ficar melhor, aplique) um brasão
   tirado da própria arte de cada raça — a vitrine das raças já recorta o rosto de cada uma.

### Regras de arte da casa

- **Nunca deduza o que uma imagem mostra pelo nome do arquivo.** Abra e olhe (o `300.webp` era uma
  lâmina de água, não a falange). `node scripts/folha-de-contato.mjs` faz folhas de contato.
- Meme no livro é de propósito (o autor pediu "põe tudo"); fanart e arte oficial também. O que não
  entra: arte com marca d'água de banco de imagem, e arte que borra (ampliada mais de 1,6×).
- Arte que sai do acervo e entra no livro: mova (não copie) pra pasta certa de `public/livro/`, tire a
  linha do `acervo-de-arte/LEIAME.md`, anote em `ARTE-PARA-O-LIVRO.md`, e rode `npm run
  gerar:impressao` (e `touch` no arquivo se ele manteve a data antiga) e `npm run check:midia`.

### Arquivos

Pode mexer: `public/livro/**`, `public/racas/**`, `acervo-de-arte/**`, os `.md` de arte,
`src/components/book/{Prancha,FichaDeRaca,ImagemDoLivro,RetratoDaArvore,VitrineDasArvores,
ArteDaHabilidade}.tsx`, `src/components/book/arteDas*.ts`, `src/components/RaceCrest.tsx`,
`src/data/midiaDeHabilidade.ts`, `src/app/livro/folhear/folhear.css`, `src/components/book/folhear/**`,
e o CSS do livro em `src/app/globals.css`. Nos `Chapter*.tsx` e em `Appendices.tsx`, **só pode inserir
componentes de arte** (`<Prancha id="…" />` e parecidos) — nada de mudar texto de regra. Não mexa em
`src/data/` fora da `midiaDeHabilidade.ts`.

### Como conferir e subir

- `BASE=http://localhost:3020 npm run revisar:livro`: zero estouro, zero título separado, e o número de
  páginas **não pode subir** sem motivo (arte nova enche vão; página nova só se valer a pena, e diga
  qual no commit).
- `npx tsc --noEmit -p .`, `npx vitest run`, `npx eslint src scripts`, `npm run check:midia`.
- Commits pequenos, um assunto por commit, direto na `main`, em português, dizendo o que mudou na
  página. Subir: `git fetch -q; git merge -q --no-edit origin/main; git push -q origin HEAD:main`.
- Nota curta em `src/data/patchNotes.ts` (a versão mais nova, ou uma nova se ninguém abriu).

### Entrega

Escreva `RELATORIO-CODEX-ESTETICA.md`: cada mudança com a dupla antes e depois (os nomes das fotos de
`.telas/revisao/`), as artes do acervo que entraram e onde, e as que você olhou e deixou de fora (e por
quê). O autor decide pelo olho, então mostre.

### Pendências pro Claude

(vazio)
