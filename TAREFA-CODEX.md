# Tarefas para o Codex

> **Tarefa atual: Tarefa 8 — polir tudo**, no fim do arquivo.
>
> **Passagem atualizada em 2026-09-30:** leia `PASSAGEM-CODEX-CLAUDE.md` antes de continuar em conjunto. Ela distingue commits publicados, correções recentes, testes e limitações ainda abertas. As tarefas abaixo preservam o histórico dos pedidos.

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

---

## Tarefa 5 — a ficha que veste as árvores do personagem (2026-09-27)

**Pode começar já** (é independente das Tarefas 3 e 4; se ainda estiver numa delas, feche o commit
em andamento e venha). O Claude está fazendo, ao mesmo tempo, os **4 temas do site** e depois a
revisão do sistema com o simulador — fique fora dos arquivos dele (lista no fim).

O autor, com as palavras dele: *"se você tacar Deus da Espada na sua ficha, a sua ficha vai mudando
de cor dependendo do que você tem. Na ficha vai ter o caos do livro, e vai tendo caos quanto mais.
Se tiver um pouquinho de Água, vai ter o Deus da Água ali também, mas menos do que o Deus da
Espada."* É estética pura: nenhum número da ficha muda.

### As decisões (já tomadas pelo autor)

1. **O que mede o "quanto": o PA gasto em cada árvore.** A árvore com mais PA manda; cada árvore
   aparece na proporção do PA dela. Empate: a Árvore Inicial ganha. Ficha sem PA em árvore nenhuma
   fica como está hoje (neutra).
2. **Como aparece:**
   - a **cor de acento** da ficha vira a da árvore dominante (as mesmas cores do livro: `--cor-arvore`
     de cada `[data-arvore]` em `src/app/livro/folhear/folhear.css`, versão noite; no tema claro use a
     versão escurecida que o livro usa no papel dia);
   - os **motivos de caos** de cada árvore (`public/livro/caos/<treeId>.svg`, os mesmos das bordas do
     livro, gerados por `scripts/gerar-caos.mjs`) se espalham pelas **bordas e pelo cabeçalho** da
     ficha, mais densos e mais opacos quanto mais PA — a dominante muito, a de 10% quase nada;
   - o **kanji** da árvore dominante (`--selo` / `--jp` no mesmo CSS) enorme e bem apagado no fundo
     do cabeçalho da ficha, como nas páginas do livro.
   - **Legibilidade manda:** o caos mora nas bordas e no cabeçalho, nunca embaixo de texto corrido,
     número ou campo de formulário. `npm run check:contraste` não pode piorar em `/ficha`.
3. **Só nos temas do livro.** O site vai ter 4 temas: Pergaminho Noite (o padrão), Pergaminho, Livro
   Noite e Livro Dia. O caos da ficha vale **só nos dois do Livro**. O contrato (o Claude implementa
   agora): nos temas do livro o `<html>` recebe a classe **`tema-livro`**, e o escuro continua sendo a
   classe `dark`. Então: `html.tema-livro` = mostra o caos; `html.tema-livro.dark` = Livro Noite.
   Enquanto essa classe não chega na `main`, teste pondo `tema-livro` no `<html>` à mão no DevTools.

### Como eu faria (sugestão, não ordem)

- Uma função pura `src/lib/identidadeDaFicha.ts` — recebe a ficha (`CharacterData`) e devolve
  `[{ treeId, pa, peso }]` ordenado (peso = fração do PA em árvores), com teste em vitest cobrindo:
  ficha vazia, uma árvore só, 80/20, empate decidido pela Árvore Inicial. O PA por árvore sai das
  compras (`purchasedAbilities`) e dos patamares abertos (`unlockedRanks`) com as mesmas regras de
  custo de `getPaSpent` em `src/store/selectors.ts` — reaproveite os helpers de lá, não reescreva
  tabela de custo.
- Um componente `src/components/CaosDaFicha.tsx` que desenha as camadas (posicionado atrás do
  conteúdo, `pointer-events: none`, `aria-hidden`), e o `CharacterSheet.tsx` o usa e põe o
  `--cor` da dominante na raiz da ficha.
- As cores e os kanji das árvores hoje só existem no CSS do livro. Se precisar delas em TS, crie um
  `src/data/identidadeDasArvores.ts` (cor noite, cor dia, kanji) e faça o `folhear.css` continuar
  igual — não precisa migrar o livro.
- Desempenho: a ficha re-renderiza a cada clique; o caos não pode recalcular SVG a cada tecla
  (memorize pelo mapa de pesos) nem usar filtro caro.
- Celular primeiro: em 390 px o caos fica só nas bordas do cabeçalho.

### Arquivos

Pode mexer: `src/lib/identidadeDaFicha.ts` (+ teste), `src/components/CaosDaFicha.tsx`,
`src/data/identidadeDasArvores.ts`, `src/components/CharacterSheet.tsx` (só o necessário pra montar o
caos e o `--cor`), e CSS novo seu (um `.module.css` do componente, de preferência).

**Não mexa** (são do Claude agora): `src/app/globals.css`, `src/components/ThemeProvider.tsx`,
`src/components/ThemeToggle.tsx`, `src/components/Nav.tsx`, a logo, `src/components/ui/PageHeader.tsx`,
`src/lib/combatSim.ts`, `src/lib/encounterSim.ts`, `src/data/bestiary.ts`, `src/data/trees/**`, e os
scripts `medir-*`/`check-*`.

### Como conferir e subir

- `npx tsc --noEmit -p .`, `npx vitest run`, `npx eslint src scripts`,
  `BASE=http://localhost:3020 npm run check:contraste` e `npm run check:mobile`.
- Fotografe a ficha nos 4 temas com 3 perfis (Deus da Espada puro; Deus da Espada + um pouco de
  Água; mago de Fogo) — `node scripts/tela.mjs /ficha --tema claro` fotografa; pra ficha semeada use
  a `/semente-dev`.
- Commits pequenos direto na `main`, em português; nota curta em `src/data/patchNotes.ts`.

### Entrega

`RELATORIO-CODEX-FICHA.md` com as fotos (os 3 perfis × os temas do livro) e o que ficou de fora.

### Pendências pro Claude

(vazio)

---

## Tarefa 6 — o simulador enxerga o Tático, o Bardo e os invocados (2026-09-27)

**Prioridade: depois da Tarefa 5.** É a peça que falta pra balancear o sistema inteiro pelo simulador
(ideia do autor). O Claude está, ao mesmo tempo, mudando o ritmo de PA do livro, o montador de fichas
do `scripts/balancear.mts` e recalibrando os moldes de criatura — fique fora dos arquivos dele (lista
no fim).

### O problema, medido

`npm run balancear` põe cada uma das 19 árvores no 4º lugar de um grupo (Norte, Fogo, Cura) contra os
encontros do Apêndice G. **Navegação e Liderança (o Tático), Bardo e Interação e Espíritos e Feras
saem com números IDÊNTICOS em todos os patamares** (ex.: 1º patamar 54% de vitória, contribuição 14;
6º patamar contribuição 2): o personagem não faz nada além de apanhar. O próprio motor confessa, em
`src/lib/combatSim.ts` (as notas de limitação perto da linha 2310): "o motor não tem NENHUMA
habilidade que DÊ Ação ou bônus a outro personagem", e o Tático "é a árvore mais invisível do livro
aqui". Enquanto for assim, o balanceador não julga essas três árvores e a recalibração dos encontros
fica torta (o kit de mesa, que tem um Tático, foi usado pra calibrar — contra um grupo de três).

### O que fazer

Ensine o motor as habilidades de COMBATE das três árvores, pelo texto do livro (a regra é a do livro;
o motor obedece). Em ordem de impacto:

1. **Tático** (`src/data/trees/` — Navegação e Liderança):
   - a **Ordem de Tiro / Apontado** (condição no glossário, `src/data/condicoes.ts`): apontar, o +1d6
     por patamar no primeiro acerto, o acúmulo até o dobro;
   - **Voz que Corrige** (repete o ataque que errou o Apontado), **Antecipação** (aliado usa 1 Ação
     como reação, 1×/combate), **Foco de Fogo** (+BR no dano de quem ataca o apontado), **Prever o
     Golpe** (+4 CA retroativo), **Avante** (+1 Ação pra todos, 1×/combate), **A Batalha que Você
     Escolheu**, **Voz de Sargento**, **Sem Baixas**;
   - e, junto, os **tetos do Cap. 4, §5** que hoje não são honrados porque nada os alcançava:
     **4 Ações próprias + 2 concedidas por turno** e **+6 de bônus vindos de aliados**.
2. **Bardo**: as canções (Guerra, Réquiem e as outras — só uma por vez, a não ser com A Canção Não Para),
   o Insulto e o que mais o livro der de efeito em combate.
3. **Invocação**: `combatSummons.ts` e `prepararInvocados` existem, mas o personagem de Espíritos e
   Feras montado pelo balanceador sai sem nenhum invocado em campo. Descubra por quê (o
   `invocadosPreparados` do cenário vem vazio? o pacto comprado não entra em `pactosDeCombate`?) e faça
   o invocado entrar quando a ficha tem o pacto, sem precisar de seleção manual.
4. **A arma de quem é de Utilidade**: o Tático e o Bardo montados atacam com a "arma de referência
   (d6)" e Força 0. Confira no livro com que atributo eles atacam e conserte o que for do motor.

A IA precisa USAR isso com bom senso: apontar antes de o grupo atacar, gastar o Avante no turno em
que ele rende mais, cantar antes da primeira troca. Simples serve; nulo não serve.

### Acrescentado pelo Claude (2026-09-27, noite) — três defeitos do motor do PERSONAGEM

O Claude consertou o lado da CRIATURA (`turnoPorOrcamento`: três golpes, o erro perde) e remediu os
moldes (0.1.119). O `npm run balancear` depois disso achou três defeitos no lado do personagem, que é
seu nesta tarefa. Eles distorcem o balanço mais que as três árvores cegas — faça-os primeiro.

5. **Condições de uso ignoradas.** O Golpe do Desespero (Deus do Norte, `norte.ts`) diz *"Só usável
   com metade ou menos dos PV. Depois de usar, 1 nível de Exaustão até o próximo Descanso Curto"* — o
   motor usa três vezes por turno com a vida cheia (8d10 cada, no 5º patamar), e por isso o Norte mede
   56 contra ~34 da régua no 3º (`npm run medir:regua`). A 0.1.112 já consertou dois casos da mesma
   família ("Requer alvo Agarrado", "Requer 6 m de corrida" viram +1 Ação; "Uma vez por turno/combate"
   limita). Faça uma **auditoria**: um script que lista todo `effect`/`description` de técnica e magia
   de dano com condição de uso ("Só usável", "Requer", "Apenas se", "Depois de usar", "enquanto",
   "contra alvo …") e diz como o motor trata cada uma; modele as que mudam a conta (pelo menos PV
   mínimo/máximo, Exaustão depois de usar, e estado exigido do alvo) e liste as outras.
6. **A área do personagem acerta TODO inimigo.** Em `executarTurnoPersonagem`,
   `const alvos = a.area ? vivos : [vivos[0]]`: um cone de 3 m e uma esfera de 18 m pegam os cinco
   monstros do mesmo jeito. Por isso as varreduras corpo a corpo do Lutador e do Vendaval valem mais
   que a Bola de Fogo contra grupo (no 3º patamar: 260 de contribuição contra 155 do Fogo, e o Lutador
   é o MENOR dano de alvo único dos combatentes). O lado da criatura já tem `naArea`; dê ao
   personagem a mesma ideia — quantos alvos cabem pelo tamanho da área (a mesma tabela, pra criatura e
   personagem, com teste), sem mapa.
7. **O mago preso no cântico de 4 Ações.** No 5º patamar entram magias de 4 Ações (Rio de Magma e as
   de Rei/Imperador); `escolherAcao(..., permitirCantico)` escolhe por dano por Ação, o mago começa o
   cântico dividido, apanha, perde a magia e metade do PM, e no turno seguinte tenta de novo. A Terra
   cai de 243 de contribuição no 4º patamar pra 41 no 5º; Vento, Água e Teórica igual. E o início do
   cântico nem aparece no log (`e.conjurando = …` não chama o `logger`). Faça a IA pesar a chance de
   terminar (Concentração, quantos inimigos vivos, PV dela) e desistir do cântico longo quando ele não
   compensa — e registre no log quando começa, continua e perde.


### Regras

- **Nada fora do livro:** se o texto de uma habilidade for ambíguo, modele a leitura mais simples e
  anote a dúvida em "Pendências pro Claude" — não invente regra e não mude texto de regra.
- Cada comportamento novo com teste em vitest (como os de `combatTrace.test.ts` /
  `encounterSim.test.ts`).
- Atualize as notas de limitação do motor (o que agora é modelado sai de lá; o que continua fora,
  fica dito).

### Arquivos

Pode mexer: `src/lib/combatSim.ts`, `src/lib/combatSummons.ts`, `src/lib/combatReactions.ts`,
`src/lib/combatScenario.ts`, `src/lib/encounterSim.ts` (o lado do grupo — o `turnoPorOrcamento` da
criatura é do Claude), os testes deles, e um script novo de auditoria em `scripts/`.

**Não mexa** (do Claude agora): `src/data/bestiary.ts` e os moldes, `src/data/trees/**`,
`scripts/balancear.mts`, `scripts/medir-*.mts`, `src/components/book/**` (texto do livro),
`src/data/patchNotes.ts` só na sua própria entrada.

### Como conferir e subir

- `npm run balancear` antes e depois (cole as linhas das três árvores no relatório). O esperado:
  as três deixam de sair idênticas e de contribuir ~0.
- `npx tsc --noEmit -p .`, `npx vitest run`, `npx eslint src scripts`, `npm run check:progressao`,
  `npm run check:sobrevivencia` (não pode quebrar), `npm run kit:mesa` (a Capitã Vela passa a pesar).
- Commits pequenos direto na `main`, em português; nota curta em `src/data/patchNotes.ts`.

### Entrega

`RELATORIO-CODEX-SIMULADOR.md`: o que o motor passou a fazer (por habilidade), o que ficou de fora e
por quê, e o antes/depois do `balancear` e do `kit:mesa`.

### Pendências pro Claude

(vazio)

---

## Tarefa 7 — o que sobrou do balanço pelo simulador (2026-09-28)

O Claude passou esta frente pra você (acabou o fôlego dele). Leia antes: `CLAUDE.md` (as três
prioridades: Diversão > Balanceamento > Simplicidade; "nada fora do livro"), `RELATORIO-CODEX-SIMULADOR.md`,
e as notas 0.1.117–0.1.120 em `src/data/patchNotes.ts` (ritmo de PA dobrado, moldes remedidos, golpe
honesto do molde, Conjuração Concentrada, Pactos 2/2/3/3/4, Bardo com Bônus de Rank, Guarda do Corpo sem
mapa, kit equipado no balanceador).

**O instrumento:** `npm run balancear` (grupo Norte + Fogo + Cura + a árvore; Difícil = 5 criaturas do
molde, e um Chefe; alvo aleatório; mesma semente). A mediana de vitória no Difícil fica ~65–80% por
patamar; o Deus da Espada é a referência de combatente (76–96% no Difícil, 91–99% contra o Chefe).
`npm run medir:regua` compara o dano de alvo único com a régua do Apêndice C. `npm run
check:sobrevivencia` não pode voltar a ter caso abaixo de um turno.

### O que falta, em ordem de impacto

1. **A magia no 1º e 2º patamar.** Mago como 4º membro vence o Difícil 9–26% (Fogo 12–15%, Água
   9–12%, Teórica 11%) contra 50–96% dos combatentes; ele cai cedo e causa pouco. Meça dois consertos
   pequenos e escolha pelo número (e pela diversão): (a) um escudo de mana barato no Principiante das
   escolas de magia (ex.: Reação, PM → PV Temporários); (b) mais PV pro mago no começo (o Dado de PV
   das árvores de magia no Principiante/Intermediário, ou o talento de reserva mais forte cedo). Meta:
   o mago de 1º–2º perto da mediana, sem passar o combatente. **Não mexa na régua de dano de alvo único**
   — ela é desenho (o mago troca alvo único por área).
2. **Magia contra o Chefe do 3º em diante:** ~40–60% contra 90–99% da espada, mesmo com a Conjuração
   Concentrada. Veja se o que falta é PM (o mago medido já sobe Espírito, ver `scripts/balancear.mts`),
   sobrevivência ou dano, e proponha — sem carta nova se der.
3. **Bardo:** último da lista em todo patamar (7–15% no Difícil do 1º–2º; 16–27% contra o Chefe do
   3º–6º), mesmo depois da 0.1.120. Ideia do Claude: uma carta de combate no Principiante (a
   Dissonância está na Maestria e rende pouco no começo). A identidade é multiplicar o grupo e
   atrapalhar o inimigo — não virar atacante.
4. **Água, Teórica e Desintoxicação no simulador:** a força da Água é o combo molhar → congelar →
   Quebra de Gelo (acerto automático e +3d8 contra Congelado), e a IA não monta o combo; a Teórica usa
   fórmulas fixas; a Dose da Desintoxicação monta em dois turnos. Ensine a IA antes de julgar as
   escolas (é motor, é seu).
5. **As 16 técnicas `LISTADO` do `npm run check:condicoes-combate`** e a régua do Deus do Norte (medida
   ~50 contra ~34 no 3º). Monte uma lista curta, técnica por técnica, com a leitura proposta — elas pedem
   decisão do autor.

### Regras

- **Mudança de regra (número de carta, texto do livro) é decisão do autor.** Pro que for pequeno e
  medido, aplique e explique no commit e na nota de versão. Pro que for grande (carta nova, regra nova,
  número que muda o jogo de várias árvores), deixe PRONTO numa branch ou num relatório com antes/depois
  do `balancear`, e peça a decisão ao autor com opções numeradas (formato do `CLAUDE.md`, com a sua
  recomendação marcada).
- Toda regra que o motor aplica tem de estar escrita no livro; o texto do livro sai dos dados das
  árvores (`src/data/trees/**`) e dos `Chapter*.tsx`.
- Antes de subir mudança no livro: `BASE=http://localhost:3020 npm run revisar:livro` (zero estouro,
  zero título separado) e `npm run check:livro check:texto check:termos check:remissoes`.
- `npx tsc --noEmit -p .`, `npx vitest run`, `npm run lint`. Commits pequenos direto na `main`, em
  português; nota em `src/data/patchNotes.ts` (versão nova, 0.1.121 em diante).

### Arquivos

Agora são todos seus nesta frente: `src/lib/**` (motor), `scripts/balancear.mts` e `medir-*`,
`src/data/trees/**`, `src/data/bestiary.ts`, os `Chapter*.tsx`/`Appendices.tsx` no que for regra.

### Entrega

`RELATORIO-CODEX-BALANCO.md`: a tabela do `balancear` antes e depois (as 19 árvores × 6 patamares,
Difícil/Chefe), cada mudança com o porquê, e as decisões que ficaram pro autor.

### Pendências pro Claude

(vazio)

---

## Tarefa 8 — polir tudo (2026-09-30)

O autor pediu: **o objetivo agora é polir tudo.** Nada de sistema novo, carta nova ou tela nova: é
deixar o que já existe acabado. **O celular importa, mas não é o principal**: o foco é a leitura e o
uso no computador (1440 e 1024 px), e o celular (375 e 360 px) entra como conferência de que nada
quebrou.

Leia antes: `CLAUDE.md` (Diversão > Balanceamento > Simplicidade; "O Livro é a Fonte": o site é a
interface do livro, e o livro é o produto) e `PASSAGEM-CODEX-CLAUDE.md` (inclusive a seção da arena
2.5D do Claude).

### Como trabalhar: primeiro o inventário, depois o conserto

1. **Varredura sem consertar.** Abra cada rota em 3020, em 1440 px e em 1024 px, nos temas claro e
   escuro: `/`, `/livro`, `/livro/folhear`, `/arvores`, `/criar`, `/ficha`, `/personagens`,
   `/comparar`, `/encontros`, `/iniciativa`, `/sessao`, `/mestre`, `/loja`, `/busca`, `/novidades`,
   `/offline`. Use `/semente-dev?ir=<rota>` para a tela não abrir vazia. Anote cada defeito numa linha:
   rota, largura/tema, o que está errado, gravidade (**quebra** / **atrapalha** / **acabamento**).
2. **Ordene e conserte** de cima pra baixo: quebra antes de atrapalha, atrapalha antes de acabamento;
   livro antes do resto.
3. **Celular no fim:** `npm run check:mobile` e uma passada manual em 375 px nas rotas que você tocou.
   Só conserte no celular o que for quebra ou atrapalha.

### O que é "polir", em ordem de prioridade

1. **O livro (`/livro` e `/livro/folhear`).**
   - As 7 manchas vazias do `revisar:livro` (páginas 35, 37, 69, 97, 115, 136 e 278) e os 2 avisos do
     `check:livro` (Cura com cinco passos no loop; tralha sem arte própria).
   - O aviso do parser em `::highlight(busca-livro-atual)` (`folhear.css:3692`): confira no navegador
     se o realce da busca funciona e se a sintaxe é aceita pelo transformador de CSS antes de trocar.
   - Leitura de uma ponta a outra no desktop: título órfão, tabela que corta, exemplo jogado sem
     destaque, diagrama pequeno demais, remissão que leva ao lugar errado, espaço irregular entre
     seções. O que for **texto de regra** você não reescreve (ver Regras).
2. **Consistência entre o livro e o site.** O mesmo termo com o mesmo nome e a mesma grafia em todo
   lugar (ficha, simulador, loja, encontros, busca). Número que o site mostra tem que bater com o
   livro. Onde divergir, o livro manda; se o livro estiver errado, é decisão do autor.
3. **Acabamento das telas no desktop.**
   - Alinhamento, espaçamento e hierarquia: cabeçalhos (`PageHeader`), cartões e botões com o mesmo
     peso em todas as telas; nada esticado de borda a borda em 1440 px quando devia ter largura de
     leitura.
   - Estados: vazio (`EmptyState`), carregando, erro e sucesso em toda ação que demora ou pode falhar.
     Nenhum botão que "não faz nada" sem explicar por quê.
   - Teclado e foco: tudo alcançável com Tab, foco visível, Esc fecha o que abre. `npm run check:a11y`
     e `npm run check:contraste` sem regressão.
   - Textos de interface curtos e no mesmo tom (pt-BR, verbo no começo do botão).
4. **A arena 2.5D do `/encontros`** — **com o Claude desde 2026-09-30; pule este item.** Não edite
   `ArenaDoReplay.tsx`, `ArenaDoReplay.module.css` nem `EncounterCombatLogs.tsx`; se a varredura achar
   defeito ali, anote no inventário que o Claude pega.
   - Ataque em área faz uma investida por alvo: agrupe os recibos consecutivos do mesmo atacante e da
     mesma ação numa investida só, com os efeitos em todos os alvos.
   - Batalha longa cansa: botão "próxima rodada" e atalhos de teclado no desktop (espaço
     toca/pausa, setas passam o quadro).
   - Nomes repetidos ("Sapo-Lodo Gigante 1/2") truncam igual: mostre o número mesmo quando o nome
     corta.
   - Tema escuro: confira o contraste da narração e das etiquetas de elemento.
   - Encontro com 10 ou mais criaturas: os cartões não podem se sobrepor a ponto de esconder o PV.
5. **Desempenho percebido.** Troca de rota, abertura do folhear e o botão "Testar o encontro" sem
   travar a tela. Meça antes de otimizar e anote o antes/depois.

### Regras

- **Polir não é mudar regra.** Número de carta, texto de regra e mecânica são decisão do autor. Se a
  varredura achar uma regra confusa ou uma incongruência, anote no relatório com opções numeradas
  (formato do `CLAUDE.md`, com a sua recomendação marcada) e siga em frente.
- Nada de tela, sistema ou dependência nova. Se um conserto pedir isso, vira pendência no relatório.
- Commits pequenos direto na `main`, um assunto por commit, em português; `git fetch` + merge de
  `origin/main` antes de começar e antes de subir (nunca rebase). Servidor na **3020**; não derrube
  3000 nem 3010.
- Antes de subir mudança no livro: `BASE=http://localhost:3020 npm run revisar:livro` e `npm run
  check:livro check:texto check:termos check:remissoes`. Sempre: `npx tsc --noEmit -p .`,
  `npx vitest run`, `npm run lint`.
- Nota em `src/data/patchNotes.ts` só quando mudar o que o jogador lê ou joga; polimento visual puro
  não precisa de versão nova.

### Entrega

`RELATORIO-CODEX-POLIMENTO.md` com:

- o inventário da varredura (rota, largura/tema, defeito, gravidade, commit que consertou ou
  "pendente");
- o antes/depois dos checks (`revisar:livro`, `check:*`, `check:mobile`, `check:a11y`,
  `check:contraste`) e das medições de desempenho;
- as decisões que ficaram para o autor, com opções numeradas.

Atualize também a `PASSAGEM-CODEX-CLAUDE.md` com a frente e os arquivos tocados.

### Pendências pro Claude

(vazio)
