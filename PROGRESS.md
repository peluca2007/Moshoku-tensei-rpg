# Progresso — Mushoku Tensei RPG

**Última atualização:** 2026-09-03 — **0.1.4**: as 12 raças ganharam retrato, e o passo de raça da
criação deixou de ser um `<select>` de doze linhas de texto. Junto, o medalhão passou a otimizar imagem
(o maior retrato caía de 1,28 MB pro navegador). Ver [`PATCH_NOTES.md`](PATCH_NOTES.md).

> Este arquivo guarda **só o estado atual, o que falta e o porquê das decisões vivas**.
> O histórico sessão a sessão vive no `git log`; o histórico de regras vive em `PATCH_NOTES.md`.
> Ao terminar algo, mova para "Pronto" ou apague — não acumule uma entrada nova por sessão.

---

## Estado atual

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Zustand com persistência em `localStorage`
(ficha em `version: 11`, bestiário em `version: 2`).

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
| `/encontros` | Construtor de criaturas: ações, conselho ao vivo contra o grupo real, e o teste de 300 batalhas |
| `/personagens` | Roster de fichas |

### Conteúdo

- **19 árvores** (17 base + Vendaval e Punho de Fogo, híbridas e ocultas até os pré-requisitos).
- **~400 magias, talentos e técnicas**, todas com encantamento e custo declarados.
- **12 raças e 13 antecedentes** com 3 sub-tabelas (Miko, Olho, Laplace).
- **9 Magias Combinadas** oficiais (`src/data/combinedSpells.ts`).
- **Arte, toda declarada em dado e conferida por `npm run check:livro`:** 19 brasões de árvore
  (`public/arvores/<id do tree>`), 12 retratos de raça (`public/racas/<id da raça>`), 6 ícones de
  categoria da loja (`public/loja/<categoria>` — falta `aventura`), mais o logo, o favicon derivado dele,
  a paisagem da landing e a textura de pergaminho. Toda ela passa por `Crest`, o mesmo medalhão.

---

## Metas atuais

- [x] **Composição do livro auditada (0.1.7)** — o Cap. 2 rodava 1,2,6,7,3,4,5; o Cap. 4 numerava 8 seções
      contra as 9 do sumário, com "Reações e Ações Defensivas" enterrada dentro de Fome/Sede/Clima; e o
      Cap. 3 apresentava três pilares dando seção a dois. Os três corrigidos, as 25 remissões cruzadas do
      Cap. 4 renumeradas junto, e `check:livro` passou a falhar quando o sumário e a página divergem em
      existência OU em ordem.
- [x] **Faxina do repositório (0.1.6)** — um worktree do Claude commitado inteiro (30 arquivos, cópia do
      projeto), os 5 SVGs do template do `create-next-app` e o `tsconfig.tsbuildinfo` saíram. Os markdowns
      do livro que moravam no worktree estão preservados em `../backup-livro-md/`, fora do repositório.
- [ ] **Deixar o site mais bonito** — em andamento, e agora com prints de verdade guiando (Chrome headless:
      `google-chrome --headless=new --screenshot`). Já saíram: brasões e logo (0.1.2), textura de
      pergaminho, paisagem da landing, enquadramento do mapa de árvores e agrupamento da loja (0.1.3).
      **O que falta, em ordem:**
  - [x] **Hierarquia de superfície** — FEITO em 0.1.5. Três níveis (`.surface-raised` / `.surface` /
        `.surface-sunken`), num componente `ui/Surface` mais três classes de CSS que só declaram
        profundidade e textura. Como elas não declaram cor nem borda, compõem com as utilitárias que já
        estavam no JSX — foi isso que permitiu a varredura sem reescrever dezenas de linhas inteiras.
  - [ ] **`/personagens`** — o card já mostra o retrato da RAÇA (0.1.4); falta a foto do personagem
        (frente 2, abaixo) e uma barra de PV/PM visível de fora.
  - [x] **`/livro`** — FEITO em 0.1.5: capitular em cinco capítulos, filigrana sob cada título de
        capítulo (PNG preto-no-branco convertido em ouro por filtro SVG) e filete duplo entre seções.
  - [x] **Cabeçalho com identidade por rota** — FEITO em 0.1.5. `ui/PageHeader` com a faixa de ambiente
        de cada rota. Falta arte pra `/ficha`, `/iniciativa`, `/personagens` e `/criar` — elas caem no
        degradê de reserva, que é o mesmo objeto sem foto.
  - [x] **Imagens que faltavam** — TODAS entraram em 0.1.5: os 6 retratos de criatura
        (`public/criaturas/<id>`, com o Superd Renegado reaproveitando o retrato da raça), a categoria
        `aventura` da loja (a arte já estava no repo, solta na raiz de `public/`), o campo estelar de
        fundo do mapa e a filigrana de capítulo. `check:livro` fecha com **zero avisos** pela primeira vez.
  - [x] **Faixas de todas as rotas** — FEITO em 0.1.6. As sete rotas têm arte própria, mais a faixa de
        convite no fim da landing. O que ainda vale trocar é RESOLUÇÃO: `faixas/loja.jpg` (600px) e
        `faixas/livro.jpg` (525px) amaciam visivelmente em tela larga; as outras seis estão de 960 a 1900.
- [x] **Favicon com a marca nova** — FEITO em 0.1.11. `src/app/icon.png` é gerado da marca por
      `scripts/gerar-favicon.mjs`, que recorta pela caixa real do letreiro (a arte ocupa 15% do quadro),
      reduz por média de área (traço fino some com amostragem simples) e compõe sobre parchment-950.
      Ressalva declarada: em 16px o letreiro inteiro vira mancha. Legibilidade nesse tamanho pediria um
      SÍMBOLO — o olho dourado do "O" de Mushoku é o candidato óbvio —, e isso é decisão de design.
- [ ] **Foto de perfil e capa nas fichas** — documentado e ainda não implementado, a pedido. As decisões
      que precisam ser tomadas antes de escrever código estão no fim deste arquivo.
- [~] **Auditoria linha a linha das magias** — agora com ferramenta: `npm run check:arvores` mede o teto
      do turno contra a régua do Apêndice C e devolve a lista curta (hoje 5 células de Magia e 6 pisos de
      Corpo). A leitura manual continua valendo pro que o relatório acusa, não pras 400 magias.
      Estado da leitura manual: — Água, Fogo, Terra, Vento, Deus da Espada, Desintoxicação e
      Cura conferidas por completo. Barreira, Invocação e Bardo tiveram os **cânticos** auditados e
      reescritos em 0.0.4, mas não os números. Faltam por inteiro: Suishin, Norte, Lutador, Escudos,
      Arquearia, Ladino, Tático, Vendaval, Punho de Fogo.
- [ ] **Validar Distância Roubada na mesa** (Vendaval, novo em 0.0.4) — a mecânica soma alcance a partir do
      movimento, e nenhuma outra árvore faz isso. Vale medir se 9m de bônus de alcance no Principiante não
      transforma a árvore num arqueiro corpo a corpo cedo demais.
- [x] **Entrevista (Via 3), banco de perguntas** — FEITO em 0.1.11: 20 perguntas, 6 respostas cada, 10
      perguntas e 4 respostas sorteadas por Entrevista. `interview.test.ts` cobre o que só aparece rodando
      muitas vezes (todas as perguntas e respostas saem ao longo de 200 entrevistas; a ordem é preservada;
      todo id empurrado existe em BACKGROUNDS).
- [ ] **Confirmar o fix do PDF em produção** — só verificável no próximo deploy da Vercel.
- [ ] PWA / modo offline — mesa física não pode depender de internet.
- [ ] Acessibilidade: contraste, tamanho de fonte ajustável, teste real com leitor de tela.

## Backlog

- Sincronização em tempo real (WebSocket) para jogar online com a ficha atualizando ao vivo.
- Rank Deus / caminho de ascensão do Estilo Vendaval — a única árvore sem esse quadro.
- Bestiário: falta uma criatura de 6º patamar ("Ancião Demônio Esquecido", conceito esboçado). Agora ela
  nasceria já com ações escritas, como as outras seis.
- Criatura montada em `/encontros`: exportar/importar JSON, e um retrato no cartão dela.
- As ações de criatura não aplicam condição (Preso, Caído, Molhado) na simulação — a condição fica como
  texto na `nota`. É a mesma dívida das `SIMPLIFICACOES` do motor.
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

### A criatura tem dois modelos, e os dois continuam certos (2026-09-03)

Criatura **sem ações** entrega `danoPorTurno` como orçamento: uma rolagem de ataque por alvo e o total
repartido entre eles. Criatura **com ações** rola cada uma de verdade. Os dois convivem porque respondem a
perguntas diferentes — o orçamento é o que calibrou o Apêndice G e o playtest publicado, e apagá-lo
invalidaria os dois; a rolagem é o que o Mestre precisa pra saber o que ele lê em voz alta na mesa.

O que amarra os dois é uma igualdade testada: nas seis criaturas prontas, o turno de três Ações entrega o
`danoPorTurno` do molde com 15% de folga. Enquanto isso valer, a mesma criatura vale o mesmo nos dois
modelos, e escrever as ações dela não é uma mudança de balanceamento.

→ `turnoPorAcoes` / `turnoPorOrcamento` em `src/lib/encounterSim.ts` · `encounterSim.test.ts`.

### Conselho é ancorado ou é ruído (2026-09-03)

Todo aviso de `creatureAdvice.ts` cita ou um número do molde ou o nome de alguém do grupo. "Está alto
demais" não ajuda ninguém a decidir nada; "esse ataque tira 62 em média e a Lyn tem 50 PV" ajuda. É por
isso que, sem grupo escolhido, os avisos que dependem do grupo somem em vez de usar um personagem médio:
um número inventado se parece com um número medido, e é assim que uma ferramenta perde a confiança da mesa
de uma vez só.

Pelo mesmo motivo nenhum aviso altera a criatura sozinho. Cada um carrega no máximo uma correção pronta, e
quem aperta o botão é o Mestre.

→ `src/lib/creatureAdvice.ts` · `creatureAdvice.test.ts`.

### O print é o teste que falta (2026-09-03)

O logo saiu quebrado no tema escuro em 0.1.2 e passou por **toda** verificação automática do projeto:
`tsc`, `eslint`, `vitest`, `check:livro`, `next build`, e até uma checagem de que o arquivo era servido
com o content-type certo. Metade do letreiro sumia no fundo, e nada disso podia saber.

Existe uma classe de defeito — cor, contraste, enquadramento, escala — que **só se vê olhando**. Quando a
mudança é visual, o passo final não é rodar a suíte: é

```bash
npx next start -p 3987
google-chrome --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1440,1100 --screenshot=tela.png --virtual-time-budget=8000 \
  http://localhost:3987/arvores
```

e abrir o PNG. Foi assim que apareceram, na mesma sessão, o logo preto no escuro, o mapa de árvores do
tamanho de uma moeda e os doze parágrafos repetidos da loja — três coisas que estavam no ar e que
nenhuma leitura de código tinha pego.

### O arquivo de imagem é campo de dado, não tabela (2026-09-03)

> Atualizado em 0.1.4: a regra vale hoje para **três** coleções — `Tree.icon`, `Race.icon` e
> `SHOP_CATEGORY_ICONS` —, e as três passam pelo mesmo `Crest`. Quatro arquivos já chegaram com a
> extensão mentindo sobre o formato (um PNG chamado `.svg`, um AVIF chamado `.png`, dois WebP chamados
> `.png`): renomear pro formato real na entrada é parte do trabalho, não perfeccionismo.
> `unoptimized` no `Crest` vale só pra SVG — o resto passa pelo otimizador do Next, porque a arte chega
> com megabytes e aparece em medalhões de 44px.

`Tree.icon` guarda o caminho do brasão, e o arquivo se chama como o `id` da árvore. A alternativa — uma
tabela `id → arquivo` em algum componente — seria a vigésima cópia do mesmo mapeamento que este projeto já
gastou meses eliminando de tabela de dano, de bestiário e de régua de rank.

As dezenove imagens chegaram em formatos e fundos diferentes, então a normalização é de APRESENTAÇÃO e mora
num componente só: `TreeCrest` põe todas no mesmo medalhão, com fundo claro fixo nos dois temas — a única
regra que faz o traço preto de um SVG aparecer também no tema escuro. `check:livro` confere que cada
`icon` aponta pra um arquivo que existe, porque um caminho em texto é a coisa mais fácil de quebrar em
silêncio.

→ `src/components/TreeCrest.tsx` · `scripts/gerar-favicon.mjs` · `scripts/check-livro.mts`.

### Fórmula sem teste é fórmula que já divergiu (2026-09-03)

`selectors.ts` calcula todo número da ficha e passou a ter suíte própria (`selectors.test.ts`). Cada
`expect` cita a seção do livro que o justifica, então quando um quebra o autor sabe na hora se quebrou o
código ou mudou a regra. Duas correções desta sessão foram do tipo que teste pega e revisão humana não.

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

## Pedido de 2026-09-03 — duas frentes prontas, uma ainda de pé

Transcrito literalmente na sessão em que foi feito, sem correção de digitação, porque a paráfrase é
exatamente onde um requisito se perde:

> quero que seja bem personalizavel a ficha do monstro, o mestre cria ele dai na hora de por o dano o
> sistema SUGERE mudar algo. então posso por as coisinhas la, alem disso quero pode meio que colocar uma
> foto nas fichas fichas dai nos personagens vai ter meio q uma capa/foto de perfil onde vai te a foto do
> persongem(por hora apenas coloque isso para fazer dps documente essa idea), outra coisa que quero é vc
> usar as imagens que estão no banco de dados. use ela de alguma forma, a logo é para por meio q na aba e
> algum lugar ai que vc quiser

**Frente 1 (ficha de monstro personalizável + sugestão ao vivo): FEITA em 0.1.2.**
**Frente 3 (usar as imagens + logo na aba): FEITA em 0.1.2.**
**Frente 2 (foto/capa nas fichas): continua só documentada, a pedido — ver abaixo.**

### 1. Ficha de monstro personalizável ✅ (0.1.2)

As "coisinhas" viraram `AcaoCriatura` (`src/lib/encounterSim.ts`): nome, custo em Ações, fórmula de dano,
alcance, área, e se resolve contra a CA ou pedindo teste. A decisão de design que estava em aberto foi
tomada do jeito previsto: **criatura com ações declaradas é resolvida por rolagem de verdade**
(`turnoPorAcoes`), e **criatura sem ações continua no orçamento fixo** (`turnoPorOrcamento`) — que é o que
preserva a calibragem do Apêndice G e os números publicados do playtest.

O conselho ao vivo é `src/lib/creatureAdvice.ts`, recalculado a cada tecla e ancorado no molde **e** nas
fichas do grupo selecionado. Ele tem teste próprio (`creatureAdvice.test.ts`), e a regra que os testes
travam é: um aviso só aparece quando a condição existe, cita um número conferível, e a correção que ele
oferece resolve o que ele apontou.

O que **não** foi feito e continua valendo a pena:

- [ ] As ações não modelam a condição que aplicam (Preso, Caído, Molhado, veneno). Elas ficam na `nota`,
      como texto, igual à coluna "o que a torna perigosa". Modelar isso é a mesma dívida das
      `SIMPLIFICACOES` do motor, não uma dívida nova desta tela.
- [ ] Não há Reação nem ação de Chefe (lendária) fora do turno: a rodada extra do chefe continua sendo a
      única economia de ação que o motor conhece.
- [ ] A criatura montada não tem exportação própria (JSON) nem entra no PDF — hoje ela vive só no
      `localStorage` do Mestre.

### 2. Foto/capa nas fichas — DOCUMENTAR AGORA, IMPLEMENTAR DEPOIS

Pedido explícito de só registrar a ideia por enquanto. **Nada disto foi implementado.**

A ficha de personagem ganha uma **foto de perfil** e uma **capa**. O roster em `/personagens` mostraria a
foto no card, e `/ficha` mostraria a capa no topo.

O que precisa ser decidido antes de escrever qualquer código:

- **Onde a imagem vive.** A ficha inteira mora em `localStorage` e é exportada como JSON para o Mestre
  importar. Uma foto em base64 dentro do `CharacterData` viaja junto no JSON (bom: a ficha continua um
  arquivo só) mas incha o `localStorage`, que tem cota de poucos megabytes e hoje guarda o roster inteiro.
  Uma foto de 2 MB por ficha estoura o roster de uma mesa de cinco. A alternativa é guardar só uma URL, e
  aí a ficha exportada deixa de ser autocontida.
- **Redimensionar no cliente antes de guardar** é provavelmente obrigatório em qualquer um dos dois
  caminhos (canvas → JPEG/WebP com lado maior ~512 px para a foto, ~1200 px para a capa).
- **Migração do `persist`.** Ver a regra de "Ficha salva nunca é resetada" acima: entra como migração de
  verdade, com os campos novos opcionais. O bestiário já tem a dele (v1 → v2, das ações) pra copiar a forma.
- **O PDF em Typst** (`src/lib/typstFicha.ts`) tem que decidir se imprime a foto ou ignora.
- A mesma ideia se aplica à ficha de criatura de `/encontros`, que teria o retrato do monstro. O
  `TreeCrest` já resolveu o problema de "imagens de origens diferentes lado a lado" com o medalhão de fundo
  fixo — o retrato de personagem pode reaproveitar a mesma ideia em vez de inventar outra.

### 3. Imagens e logo ✅ (0.1.2)

Feito como planejado: o arquivo virou **campo de dado** (`icon?: string` em `Tree`), e cada arquivo se
chama como o `id` da árvore, em `public/arvores/`. As três coisas que estavam pendentes de decisão foram
resolvidas assim:

- `images.png` era duplicata byte a byte de `vendaval.png` — **apagada**.
- Os nomes com espaço e acento foram renomeados pro id da árvore. **Um bônus achado no caminho:**
  `vento tree.svg` era um **PNG por dentro**; virou `vento.png`.
- O formato misto (svg/png/jpg) e os fundos diferentes (preto, branco, alfa) foram resolvidos por
  apresentação, não por edição de arquivo: o `TreeCrest` põe todos no mesmo medalhão de fundo claro fixo.

Sobrou de propósito: as imagens **não** entram no PDF em Typst nem na exportação JSON da ficha.


## Verificação

```bash
npx tsc --noEmit      # tipos
npm test              # testes das fórmulas (vitest)
npm run lint          # eslint
npm run check:livro   # confere dados × texto do livro, e se toda arte existe em disco (rodar dentro do WSL)
node scripts/gerar-favicon.mjs   # regera logo-dark.svg e o favicon, depois de trocar o logo
```

**Mudou alguma coisa visual? Tire um print** — ver "O print é o teste que falta" acima:

```bash
npx next start -p 3987 &
google-chrome --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1440,1100 --screenshot=tela.png --virtual-time-budget=8000 \
  http://localhost:3987/<rota>
```

**Nota de ambiente:** `next build` e `tsx` dependem de binários nativos instalados para Linux
(`lightningcss`, `esbuild`). Rodá-los a partir do Windows sobre `\wsl.localhost` falha; rode-os de dentro
do WSL. `tsc` e `eslint` funcionam dos dois lados.
