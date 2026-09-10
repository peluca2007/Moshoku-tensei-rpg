# Progresso — Mushoku Tensei RPG

**Última atualização:** 2026-09-10 — dezoito versões num dia (0.1.17 → 0.1.34), fechando as vinte e
duas frentes do [`TAREFAS.md`](TAREFAS.md). O site ganhou **busca global** nos 879 verbetes, telas de
**404 e de erro** em português, o **link de ficha diagnosticado** (com colagem e QR), **compartilhar
pela bandeja do celular** e **botão de instalar**, o **rolador em todas as rotas** com macro de
Teste, as **condições como estado vivo** da ficha, **descanso e downtime jogáveis**, o **Modo Mesa**,
o **Painel do Mestre**, o **comparador de builds**, o **registro de sessão**, a **rolagem de
perícia** e a **ficha imprimível**. Sobraram três coisas, e as três precisam do autor: o iPhone do
amigo, meia hora de NVDA, e a decisão sobre quanto PM o Descanso Curto devolve.
Ver [`PATCH_NOTES.md`](PATCH_NOTES.md).

> Este arquivo guarda **só o estado atual, o que falta e o porquê das decisões vivas**.
> O histórico sessão a sessão vive no `git log`; o histórico de regras vive em `PATCH_NOTES.md`.
> Ao terminar algo, mova para "Pronto" ou apague — não acumule uma entrada nova por sessão.

---

## Estado atual

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Zustand com persistência em `localStorage`
(ficha em `version: 12`, bestiário em `version: 4`).

**Fonte de verdade única:** `src/data/`. O livro (`src/components/book/*.tsx`), o mapa de árvores
(`/arvores`), a loja (`/loja`) e o PDF exportado leem todos os mesmos arrays — nenhuma tabela é escrita à
mão duas vezes.

### Rotas

| Rota | O que é |
| --- | --- |
| `/` | Landing page — apresentação e disclaimer de projeto de fã |
| `/mesa` | **Modo Mesa** — só o que se usa DENTRO de um turno: ordem, reservas com passos de −5 a +5, condições ativas. Pensada pra 320px e uma mão |
| `/ficha` | Ficha de personagem: atributos, PV/PM/PT/PP/CA calculados, foto e capa, inventário, Grimório, Lore, Desfazer, export PDF (Typst), arquivo `.mtficha` e link |
| `/criar` | Três vias de criação: Manual (wizard de 8 passos), Roleta e Entrevista |
| `/livro` | Livro de regras completo, navegável, com Patch Notes embutidos |
| `/arvores` | Mapa radial estilo Destiny Board — pan/zoom, compra refletindo na ficha na hora |
| `/loja` | Loja da Guilda — 85 itens, filtro duplo Tipo × Rank de Guilda, `buyItem` valida PO **e** Rank |
| `/iniciativa` | Tracker de iniciativa |
| `/mestre` | **Painel do Mestre** — lê as fichas do roster lado a lado (PV, CA, recursos, condições, maior golpe). Nunca escreve nelas |
| `/encontros` | Construtor de criaturas: ações, conselho ao vivo contra o grupo real, o teste de 300 batalhas, e o covil em pastas (com cor, emoji, busca, cartão recolhível e arquivo `.mtpasta`), e a ficha de um personagem do roster entrando como criatura |
| `/personagens` | Roster de fichas |
| `/sessao` | **Registro de sessão** — pega carona no rolador e no Modo Mesa; começa DESLIGADO. Fora do menu |
| `/comparar` | **Comparador de builds** — duas fichas contra o mesmo alvo e a mesma semente. Fora do menu de propósito |
| `/busca` | Busca global nos 879 verbetes — nome **e** texto da regra, com o card completo abrindo na própria linha |
| `/offline` | O que o service worker devolve quando não há nem rede nem cache |

### Conteúdo

- **19 árvores** (17 base + Vendaval e Punho de Fogo, híbridas e ocultas até os pré-requisitos).
- **601 magias, talentos e técnicas**, todas com encantamento e custo declarados e conferidas por
  `npm run check:texto`.
- **12 raças e 13 antecedentes** com 3 sub-tabelas (Miko, Olho, Laplace).
- **9 Magias Combinadas** oficiais (`src/data/combinedSpells.ts`).
- **Arte, toda declarada em dado e conferida por `npm run check:livro`:** 19 brasões de árvore
  (`public/arvores/<id do tree>`), 12 retratos de raça (`public/racas/<id da raça>`), os ícones de
  categoria da loja (`public/loja/<categoria>`), as oito faixas de rota, mais o logo, a paisagem da
  landing e a textura de pergaminho. Toda ela passa por `Crest`, o mesmo medalhão. O favicon sai de
  `assets-fonte/icon-fonte.png` pelo `scripts/gerar-favicon.mjs`, que desde a 0.1.15 gera junto os
  três ícones do app instalável (192, 512 e o mascarado de 512).

---

## Metas atuais

Só o que ainda não foi feito. A lista curta do que já estava combinado com o autor vive em
[`O-QUE-FALTA.md`](O-QUE-FALTA.md), e o mapa maior das vinte frentes abertas em
[`TAREFAS.md`](TAREFAS.md); aqui fica o registro seco.

- [ ] **Instalar o app num celular de verdade.** A 0.1.15 fez o site funcionar sem rede e o
      `check:offline` prova a parte automatizável (16 rotas com o servidor morto). Falta o resto do
      caminho: "Adicionar à tela de início", o recorte do ícone pelo launcher, a splash, e o quanto
      o Safari do iPhone respeita disso.
- [ ] **Confirmar o fix do PDF em produção** — só verificável no próximo deploy da Vercel.
- [ ] **Teste com leitor de tela de verdade.** O `check:a11y` cobre a camada estrutural (controle sem
      nome, campo sem rótulo, hierarquia de cabeçalho); falta saber se a ficha é *usável* de ouvido.
- [ ] **Testar em celular de verdade.** O `check:mobile` garante que nada transborda de 320 a 414px, e é
      só isso que ele sabe.
- [ ] **Validar a Distância Roubada na mesa** (Vendaval). A conta está fechada no cabeçalho de
      `src/data/trees/vendaval.ts`; o que falta é a pergunta que ela levanta — o Vendaval alguma vez
      apanha?
- [~] **Jogar o Invocador, o Ladino e o Bardo.** São as mudanças de 0.1.12 que não saíram de medição,
      e sim de um pedido. O Tático já foi jogado, e a Ordem de Tiro foi TROCADA em 0.1.14 por causa
      disso — que era exatamente o que o plano previa fazer se ela não funcionasse na mesa. Falta a
      Dissonância do Bardo passar pelo mesmo teste.
- [~] **Auditoria linha a linha das magias** — o `check:texto` cobre CONTRADIÇÃO nas 601 habilidades, e
      Norte, Vendaval, Lutador, Arquearia e Punho do Fogo foram lidos de ponta a ponta. Faltam **Suishin,
      Escudos, Ladino e Tático**, e ali o que falta é julgamento: se o efeito faz sentido, se a técnica é
      divertida, se o patamar entrega o que promete.
- [ ] **A faixa de `/livro` está em 680×384** — a menor das oito; as outras vão de 960 a 1900.

## Backlog

**Auditado item a item em 2026-09-10.** Quatro entradas desta lista descreviam coisas que já estavam
feitas — uma delas me custou duas investigações no mesmo dia. O que sobrou abaixo foi conferido
contra o código na data acima; o que saiu está registrado no fim da seção, porque uma lista que só
encolhe sem dizer por quê é tão pouco confiável quanto uma lista errada.

- Sincronização em tempo real (WebSocket) para jogar online com a ficha atualizando ao vivo.
- Bestiário: falta uma criatura de 6º patamar ("Ancião Demônio Esquecido", conceito esboçado). As
  seis prontas vão do 1º ao 5º. Agora ela nasceria já com ações escritas, como as outras.
- Não há Reação nem ação de Chefe (lendária) fora do turno: a rodada extra do chefe continua sendo a
  única economia de ação que o motor conhece — e ela está declarada em `SIMPLIFICACOES`.
- **Cinco condições fora da simulação**: Atolado, Desequilibrado, Quebrantado, Marcado e Soterrado,
  que são a mecânica central de cinco árvores. Três delas (Atolado, Desequilibrado, Soterrado) são
  sobre movimento e posição, que o motor não modela por decisão declarada; **Quebrantado é a única
  puramente numérica**, e desde a 0.1.24 a regra dele já existe em `selectors.ts` — é a candidata
  natural se alguém for mexer aqui.
- Universidade de Ranoa como 4ª facção de Reputação. As três atuais (Reino Asura, Igreja de Millis,
  Deuses Demônios) têm cinco degraus escritos cada; a quarta precisa dos cinco também.
- Magias inatas de raça (ex: Howling da Raça Fera) só existem como texto em `traits`, não como
  habilidade de verdade no Grimório — não dá pra rolar nem pra contar no dano por turno.
- PDF via Typst: revisão visual fina (densidade dos cards, Deslocamento refletindo raça, BC em
  multiclasse).
- Tradução PT-BR / EN.

### Saíram daqui em 2026-09-10, porque já estavam feitas

- ~~"As ações de criatura não aplicam condição na simulação"~~ — **aplicam**. `resolverAcaoCriatura`
  aplica Preso, Caído, Molhado e Envenenado, e os quatro afetam as rolagens dos dois lados. A própria
  lista de `SIMPLIFICACOES` já dizia isso corretamente enquanto o backlog dizia o contrário.
- ~~"Criatura de /encontros: exportar/importar, e um retrato no cartão"~~ — **as duas existem**:
  `criaturaArquivo.ts` e `criaturaLink.ts` desde a 0.1.13, e o campo `portrait` com upload no cartão.
- ~~"A foto do personagem não entra em /criar"~~ — **entra nas três vias**. Manual, Roleta e
  Entrevista todas montam o `ImagemDaFicha`.
- ~~"Macros de Teste no DiceRoller"~~ — feito na 0.1.21, com migração da store.
- ~~"Rank Deus do Vendaval"~~ — ele tem o quadro; ver a seção de correções do `O-QUE-FALTA.md`.

---

## Decisões de design vivas

Só o que ainda governa o sistema hoje. O raciocínio completo de cada mudança de regra mora no comentário
do arquivo que a implementa — os ponteiros abaixo dizem onde procurar.

### A busca é rota, e devolve o texto (2026-09-10)

Duas decisões que estavam em aberto no `O-QUE-FALTA.md` e foram fechadas ao implementar a `/busca`.

**Rota, e não painel por atalho de teclado.** O site já usa `R` pro rolador, e um segundo atalho
seria coerente — em um teclado. A primeira regra do projeto é mobile-first, e numa mesa de verdade a
busca é feita com o polegar: rota tem link no menu, tem endereço e recarrega. O `?q=` ainda deixa
mandar uma busca pronta pro grupo no chat, que atalho nenhum faz.

**O resultado abre na própria linha, e não leva pro `/livro`.** Quem busca no meio do turno quer o
texto, não a viagem. E o card que abre é o **mesmo componente** do livro (`components/book/EntryCard`,
extraído do `TreeCatalog` nesta versão justamente pra isso): duas telas desenhando a mesma magia de
dois jeitos é a única coisa pior que não ter busca.

**O índice se monta em tempo de execução, e não é arquivo gerado.** `lib/busca.ts` percorre
`src/data/` na importação. Uma habilidade nova entra na busca no mesmo commit em que entra no jogo,
sem ninguém lembrar de rodar nada — é a mesma razão pela qual o livro é gerado dos dados, e não
escrito à mão ao lado deles.

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

**O que 0.1.12 acrescentou, e o limite que ela achou no print.** Contraste, transbordo e nome acessível
saíram do olho e viraram `check:contraste`, `check:mobile` e `check:a11y`, que medem dentro do
navegador. A razão é que o print MENTE em duas coisas: ele sai com o perfil de cor do monitor aplicado
(um botão `#4a0e2e` apareceu como `#7d505e`, o bastante pra inventar um defeito que não existia — por
isso todo print de conferência precisa de `--force-color-profile=srgb`), e a janela do Chrome no Windows
trava numa largura mínima de ~500px, então todo print "mobile" era um recorte de 500 e não um layout de
360.

O print continua sendo o teste de tudo que sobrou: enquadramento, escala, se a arte combina com a
página, se a tela parece uma coisa só.

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

## Verificação

```bash
npx tsc --noEmit          # tipos
npm test                  # testes das fórmulas (vitest)
npm run lint              # eslint
npm run check:livro       # dados × texto do livro, e se toda arte existe em disco (rodar dentro do WSL)
npm run check:arvores     # teto do turno de cada árvore × a régua do Apêndice C
npm run check:texto       # a PROSA das 601 habilidades × os campos delas
npm run check:redundancia # habilidades que repetem um patamar anterior
node scripts/gerar-favicon.mjs   # regera o favicon E os três ícones do PWA
```

As checagens de TELA precisam de um Chrome, e precisam rodar **do mesmo lado em que o Chrome está**,
porque elas falam com ele pela porta de depuração. Estas três precisam do site no ar
(`npm run dev` em outro terminal):

```bash
npm run check:contraste   # WCAG AA nas 17 rotas, nos 2 temas
npm run check:mobile      # transbordo horizontal de 320px a 414px
npm run check:a11y        # controle sem nome, campo sem rótulo, hierarquia de cabeçalho
```

A de offline é a exceção: ela precisa de um `npm run build` (em desenvolvimento o service worker nem
é registrado) e **sobe e mata o próprio servidor**, numa porta separada. Não rode com um `next start`
seu já no ar na 3100.

```bash
npm run build
npm run check:offline     # as 20 rotas abrindo com o servidor morto, em F5 e em navegação suave
```

Elas abrem as rotas por `/semente-dev`, que semeia duas fichas e força o tema antes de redirecionar.
Sem isso `/ficha` e `/personagens` abrem vazias, e a medição não vê metade dos componentes. A rota
devolve 404 em produção.

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
