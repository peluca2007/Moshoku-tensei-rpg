# Mushoku Tensei RPG — Progresso do Site

Última atualização: 2026-08-28 — Landing page em `/`, ficha movida pra `/ficha`, rolagem inline
de dano (arma e magias), animação de dado girando no Rolador (com toggle de modo rápido),
tentativa de correção do PDF na Vercel, um bug real corrigido (trocar a Árvore Inicial durante a
criação deixava a árvore antiga com o Principiante desbloqueado pra sempre — `setStartingTree`
agora limpa a escolha anterior sozinho), e a Loja da Guilda nova em `/loja` (compra item, debita PO
e manda pro inventário da ficha ativa; catálogo gerado a partir do mesmo dado que o Livro de Regras
lista em preço, agora 85 itens cobrindo as 49 combinações de Tipo × Rank de Guilda — exceto
Encantamento em F/E/C, que o livro não define — com filtro duplo de Tipo + Rank). `/mestre` e
`/apresentacao` foram removidos a pedido do usuário. PM Máximo perdeu o ×2 da fórmula (era
Espírito × Maior Bônus de Magia × 2 + 8) — o dobro deixava a magia mais forte do rank Imperador
sobrar PM pra 4-7 usos com Espírito alto, bem acima do "no máximo umas 2 vezes" que o usuário quer
pro golpe mais forte de um personagem. PV foi auditado à parte (não precisou de ajuste — já
converge sozinho perto de 2-3 turnos de sobrevivência em todo rank, ver "Decisões de design"). E um
campo de **Lore & Anotações** novo: a Entrevista (Via 3) pré-preenche um rascunho de história a
partir das respostas escolhidas, `/ficha` ganhou uma seção de texto livre pra editar isso à
vontade, e o PDF exportado agora tem uma seção "LORE E ANOTAÇÕES" com o mesmo texto. Por fim, uma
**revisão com 4 agentes em paralelo** (2 lendo o livro inteiro, 1 auditando livro×código, 1
code-review no diff) achou e corrigiu: **PT calculava errado** (fórmula multiplicativa no código
contra a aditiva do livro — corrigido pra bater com o livro), **PV/PM comprado com PA não escalava
com o Rank** (taxa fixa de 12, agora escala como o livro sempre prometeu), **a Loja não verificava
Rank de Guilda de verdade** (só a UI bloqueava — `buyItem` agora recusa também), README
desatualizado (`/mestre`/`/apresentacao` removidos, `/` virou landing e não ficha, faltavam
`/ficha`/`/loja`), e vários furos de consistência no livro que a própria sessão introduziu
(Égide Lendária colidindo com "Uma Salvação por Combate", Escudo empilhando sem exceção
documentada, 4 poções sem CD de fabricação, nome "Poção Santa" não batendo com o rank que ela
reproduz) — ver "Decisões de design" e "O que já está pronto" pros detalhes de cada um.

> Histórico detalhado sessão a sessão vive no `git log` (cada commit já conta o que mudou e
> onde). Este arquivo guarda só o **estado atual**, o **que falta** e o **porquê** das decisões
> — não é mais um changelog linha a linha. Ao terminar algo relevante, atualize a seção "O que
> já está pronto" e risque o item em "Metas atuais" — não acumule uma entrada nova por sessão.

## Metas atuais (o que estamos perseguindo agora)

- [ ] **"Deixar o site mais bonito no geral"** (pedido do usuário, 2026-08-27) — escopo alinhado
      com o usuário: Ficha (`/`), `/criar`, `/livro` e `/arvores`, nessa ordem. Ficha e a Roleta
      de `/criar` já receberam o primeiro passe (2026-08-27/28); `/livro` e `/arvores` seguem
      pendentes.
- [ ] PWA / modo offline — mesa física não pode depender de internet.
- [ ] Sincronização em tempo real (WebSocket) pra jogar online com a ficha atualizando ao vivo
      pra todo mundo.
- [ ] Acessibilidade: contraste, tamanho de fonte ajustável, teste real com leitor de tela (nome
      acessível em botões só-com-ícone já foi feito).
- [ ] Auditoria linha a linha das ~400 magias/talentos/técnicas — Água, Fogo e Deus da Espada
      conferidas por completo; Escudos, Arquearia e Lutador tiveram só o Rank Santo reconferido
      (achou os 3 bugs corrigidos em 2026-08-28, ver changelog); as demais 11 árvores seguem sem
      auditoria linha a linha.
- [ ] **Confirmar se o fix do PDF em produção resolveu de verdade** (2026-08-28) — só dá pra saber
      depois do próximo deploy na Vercel; ver Decisões de design pro diagnóstico.
- [ ] **Reformular a Entrevista (Via 3)** (pedido do usuário, 2026-08-28) — escopo definido,
      **ainda não implementado de propósito** (pedido explícito de só documentar por ora):
  - Banco de perguntas cresce de 14 pra ~20 (`src/data/interview.ts`).
  - Cada pergunta ganha **6 respostas possíveis** em vez de 4 fixas; só **4 aparecem** por vez,
    sorteadas entre as 6 com alguma chance — nunca sempre as mesmas 4 pra mesma pergunta.
  - Ao abrir a Entrevista, o jogador escolhe entre **2 modos** antes da 1ª pergunta: "Raça e
    Antecedente juntos" (comportamento atual, `resolveInterview` decide os dois) ou "Só
    Antecedente" (as respostas passam a pesar só a loteria de Antecedente — como a Raça seria
    escolhida nesse modo ainda não foi decidido: manual? roleta separada? perguntar ao usuário
    quando for implementar).
  - A lógica de pontos/loteria pesada por resposta (todo id começa com 1 bilhete, resposta que
    empurra ganha +2) continua a mesma — só muda a cardinalidade de respostas e a existência dos
    2 modos.
- [x] ~~Animação no Rolador de Dados~~ — implementado 2026-08-28, ver "O que já está pronto".

## O que já está pronto

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + Zustand com persistência em
`localStorage`.

**O livro mora no site** (`src/components/book/*.tsx`) — `livro.typ` é um artefato congelado, só
histórico. Fonte de verdade mecânica continua em `src/data/` (raças, antecedentes, as 17
sub-árvores + Estilo Vendaval, a 18ª, híbrida). Auditoria de 2026-08-28 achou e corrigiu 3 ranks
Santo com `talents: []` vazio quando o livro listava talento de verdade: Cavalaria e Escudos
(Aço Vivo, Contagem de Corpos), Arquearia (Marca Perene, Contra-Bateria, Peso da Aljava) e
Lutador (Colheita, Peso Absoluto).

**3 vias de criação de personagem** (`/criar`):

- **Manual** — wizard de 8 passos, edição direta de tudo.
- **Roleta** (`/criar/roleta`) — Raça e Antecedente sorteados em duas roletas visuais separadas
  (SVG animado, giro real com suspense, fatia numerada + legenda ao lado com nome completo e a
  chance real de cada resultado, ordenada da mais comum pra mais rara), cada uma com só 3
  tentativas; Atributos sorteados à parte, sem limite de tentativas.
- **Entrevista** (`/criar/entrevista`) — 10 de 14 perguntas abstratas sobre a infância, resolução
  por loteria pesada; transições com fade e um flash no momento em que o Destino é revelado.

**Landing page** (`/`) — apresentação do projeto (disclaimer de fã, sem vínculo com a obra
original), destaque das features, botões pra criar personagem ou abrir uma ficha existente.

**Ficha de personagem** (`/ficha`) — atributos, PV/PM/PT/PP/CA calculados automaticamente,
inventário, Grimório completo, edição livre de qualquer campo, Desfazer, exportar em PDF (Typst)
e JSON. Trocar a Árvore Inicial (na ficha ou durante qualquer uma das 3 vias) agora limpa o
Principiante da árvore anterior sozinho — antes cada árvore que você clicava ficava desbloqueada
pra sempre, mesmo trocando de ideia (bug real, corrigido em 2026-08-28, `setStartingTree` em
`useCharacterStore.ts`). Arma do Inventário e magia do Grimório ganharam um botão/campo de
rolagem inline que abre o Rolador de Dados já pronto pra rolar (editável antes). Campo
**`lore: string`** novo em `CharacterData` (texto livre, história de fundo + anotações — pedido do
usuário, 2026-08-28): a Entrevista (`CreationInterview.tsx`) pré-preenche um rascunho com
`buildInterviewLore` (`src/lib/interviewLore.ts`) — agrupa as 10 respostas escolhidas em 3
parágrafos e fecha com a Raça/Antecedente sorteados, já que o texto de cada resposta da Entrevista
já é uma frase pronta de infância; `LoreSection.tsx` (textarea, seção nova em `/ficha` depois do
Inventário) deixa editar à vontade depois. Sai também no PDF: `buildFichaPayload.ts` quebra por
parágrafo (`\n{2,}`) e `typstFicha.ts` renderiza numa seção "LORE E ANOTAÇÕES" sem `breakable:
false` (pode quebrar de página se for longo, ao contrário dos ability-cards) — testado com aspas,
barra invertida, `*`/`_`/`#`/`[` na lore e confirmado que passa por `tstr()` sem virar marcação
Typst nem quebrar a compilação. Store subiu de `version: 4` pra `5` com uma migração de verdade
(preserva o roster e só completa `lore: ""`) em vez do reset total que a versão anterior fazia —
já existem fichas reais testadas em sessão, não dava mais pra resetar sem avisar.

**Árvore de progressão** (`/arvores`) — mapa radial estilo Destiny Board, pan/zoom, compra de
magia/talento reflete na ficha na hora.

**Ferramentas de mesa:** Rolador de dados com macros e atalho de teclado (`R`); ao rolar (Teste
1d20, Dano, Macro) o resultado — já calculado na hora, síncrono — aparece com um breve efeito de
números girando antes de assentar (`animate-dice-spin` em `globals.css`), com um toggle
persistido (raio ligado/desligado no cabeçalho do painel, `useDiceRollerStore`) pra um modo rápido
sem animação durante combate. Tracker de iniciativa (`/iniciativa`). Painel do Mestre
(`/mestre`) e Modo Apresentação (`/apresentacao`) foram removidos (pedido do usuário, 2026-08-28).

**Loja da Guilda** (`/loja`, novo em 2026-08-28) — catálogo de compra com 7 categorias (Armas,
Armaduras, Equipamento de Aventura, Poções, Venenos, Ferramentas Mágicas, Encantamentos) × 7 Ranks
de Guilda (F-S), **85 itens cobrindo todas as 49 combinações** exceto Encantamento em F/E/C (o
livro só define Encantamento a partir de Rank D — não inventamos tier pra isso, ver comentário em
`shopItems.ts`). Armas reaproveitam `WEAPON_PRESETS` de `weaponDie.ts` (ganhou Rapieira/Foice de
Guerra/Chicote); acima de Rank F viram armas com identidade (Adaga de Prata, Lâmina Balanceada,
Machado Sanguessedento, Lança Persecutora, Espada-Fantasma, Espada Corta-Aço) — sempre bônus
pequeno e travado (nunca mexe no Dado de Arma, no máximo +1 a +3 de acerto ou um efeito 1x por
Descanso Longo, pro item nunca competir com Encantamento de verdade). Armadura segue o mesmo
padrão pra Rank D+ (acBonus sobe no máximo +1 sobre a Pesada mundana; só a Égide Lendária, Rank S,
tem efeito extra: ignorar o dano de 1 golpe 1x por Descanso Longo — se isso evitar uma morte, conta
como a Salvação do combate do Cap. 4 §4, não empilha com as outras 4 formas listadas lá). Poções
estendem a escada de Cura até Rank Rei/Imperador (Poção Régia/Imperial de Cura — "Régia" pra bater
com o rank Rei que ela reproduz; "Santa" já tinha sido usado pela Poção Maior). Venenos ganharam itens acessórios
(Kit de Coleta, Kit de Aplicação Segura, Frasco Estável, Antídoto Universal) pros Ranks que as 3
Profundidades vendáveis não preenchiam sozinhas — Profundidade 4+ continua fora, como o livro
manda. Encantamentos agora tem categoria própria com os 4 níveis exatos do Cap. 5 §4 (Avançado/
Santo/Rei/Imperador, Rank D/B/A/S, mesmo preço 150/300/600/1500 PO) — comprar representa contratar
o serviço já pago; o jogador edita manualmente o item que vai receber o efeito, porque Encantamento
modifica um item existente, não cria um novo (ver descrição de cada item). Filtro duplo de Tipo +
Rank de Guilda, independentes (`categoryFilter`/`rankFilter` em `Shop.tsx`), com mensagem quando a
combinação não dá nenhum item. Cada card sempre mostra o Rank mínimo, não só quando bloqueado.
Espada Corta-Aço é o único item com mecânica de combate baseada em CA do alvo: +1/+2/+3 no teste
de acerto contra CA 15/20/25+ (nunca dano), e explicitamente não corta material mole/frágil (pano,
corda, papel) — não importa a força do golpe. Cada item tem preço em PO e Rank de Guilda mínimo
(`meetsGuildRank` em `types.ts`); comprar chama `buyItem` (`useCharacterStore.ts`) — debita o ouro
e adiciona ao inventário da ficha ativa numa operação atômica, sem PO suficiente ou Rank não
recusa (o code-review da revisão de 2026-08-28 achou que `buyItem` só checava PO — o bloqueio de
Rank existia só na UI, dava pra burlar direto na store; `buyItem` agora recebe e valida
`requiredGuildRank` também). O array `SHOP_ITEMS` (`src/data/shopItems.ts`) é a fonte única — `ShopCatalog.tsx` gera a
tabela equivalente dentro do Cap. 5 §2 do livro (`/livro`), então loja e livro nunca divergem em
nome/preço/Rank (mesmo princípio do `TreeCatalog` com `/arvores`). Ficaram de fora de propósito
(comentário em `shopItems.ts` explica cada um): o Anel de Teleporte (Cap. 5 §4, já documentado
como evento de campanha) e artefatos únicos ligados a personagens/eventos específicos da obra
(Lança do Diabo, Armaduras Mágicas Mk, Braço de Zariff, etc).

**Identidade visual:** paleta pergaminho/vinho/dourado, dark mode manual, mobile-first (nav com
hamburger abaixo de `sm`, sem overflow horizontal).

## Pendências detalhadas (Revisão dos Quatro Especialistas, 2026-08-27)

Relatório completo com o texto pronto pra cada item:
[artifact "Revisão dos Quatro Especialistas"](https://claude.ai/code/artifact/2f066569-aba4-4900-b445-6dd89763bba3).

**Decisões de design que pedem escolha do usuário:**

- Cap. 2 §3 vs Cap. 4 §3: Conjuração Silenciosa Principiante ("1ª Ação grátis") contradiz "não
  existe ação bônus neste sistema". Recomendação: documentar como exceção.
- Cap. 4 §6: CD 10 fixa do Fio da Vida fica trivial em rank alto. Sugestão:
  `8 + Bônus de Rank de quem derrubou você`.
- Cap. 4 §8: Exaustão Nível 6 (Morte) é letal sem teste de resistência nenhum. Decidir se entra
  um teste de Vigor na transição 5→6.
- Cap. 1 §2: curva de PA de Talento tem um platô em Rei=Santo=3.

**Conteúdo novo que vale escrever:**

- Rank Deus/caminho de ascensão do Estilo Vendaval (única árvore sem esse quadro).
- Bestiário: falta uma criatura de 6º patamar (Lenda) — conceito já esboçado ("Ancião Demônio
  Esquecido").
- Universidade de Ranoa como 4ª facção de Reputação.
- Macros de Teste (1d20 com Vantagem/Desvantagem) no `DiceRoller` — hoje macro só suporta Dano.

**Polimento de texto/didático, baixo risco, texto já pronto no relatório:** vários asides e
exemplos espalhados pelos Caps. 1-4 e Apêndice C — ver o artifact acima pro texto pronto de cada
um.

## Outras pendências

- Visualizador do PDF original (hoje `/livro` só cobre o texto navegável).
- Vantagem de Resistência comprável (Cap. 1, 3 PA) não representada na ficha.
- Magias inatas de raça (ex: Howling da Raça Fera) só existem como texto no card de passivas, não
  como habilidade de verdade no Grimório.
- Tradução PT-BR/EN — ideia levantada, ainda não iniciada.
- PDF via Typst — estrutura e paginação funcionam, falta uma rodada de revisão visual fina
  (densidade de texto nos cards, Deslocamento refletindo raça, BC quando multiclasse).

## Decisões de design (pra não esquecer o porquê)

- **PA é informativo, não um orçamento travado.** Quem decide quanto PA cada ficha tem é o
  Mestre, fora do site. `canUnlockRank`/`canPurchaseAbility` só checam pré-requisito, nunca saldo.
- **PM Máximo = (Espírito × Maior Bônus de Rank de magia) + 8, sem multiplicador** (mudou em
  2026-08-28, pedido do usuário — antes tinha um `× 2` extra). Análise com os custos reais das
  árvores: com o `× 2`, a magia de assinatura do rank Imperador (a mais cara de cada escola, até 20
  PM) sobrava PM pra 2,8 casts com Espírito 4 (o teto de criação) e pulava pra ~5,2 com Espírito 8
  (o teto comprável, Cap. 1 §2) — e o talento "Nascente de Mana" (Água, +2 PM por patamar,
  recomprável) empurrava ainda mais pra cima. Sem o `× 2`, o mesmo cálculo fica em ~1,6 e ~2,8
  respectivamente — perto do "no máximo umas 2 vezes" que o usuário quer pro golpe mais forte de um
  personagem. PP (Utilidade) já convergia perto de ~3 usos com atributos de criação, sem ajuste.
  Pelo menos uma técnica Imperador (Escudos, "O Muro Final") já usa uma trava dura de "1x por
  Descanso Longo" independente do PT gasto — um padrão que vale considerar espalhar pras
  assinaturas de Imperador de outras árvores, se os ajustes de fórmula sozinhos não bastarem depois
  de testar na mesa. **Correção:** a estimativa de PT acima ("já era mais apertado por natureza")
  estava errada — só descobrimos isso depois, na revisão com agentes (ver item de PT abaixo).
- **PT Pleno = Espírito + Vigor + Crescimento (+1 por patamar Pleno, +2 no Cavalaria e Escudos),
  fórmula aditiva** (corrigido em 2026-08-28, achado pela revisão com 4 agentes em paralelo). O
  código calculava `Vigor + Espírito × Maior Bônus do Corpo` — multiplicativo — desde antes desta
  sessão, e nunca batia com o texto do Cap. 1 §8 e do Cap. 3 (que sempre foi aditivo). No exemplo de
  um Imperador Vigor 6/Espírito 6: fórmula antiga do código dava 42 PT; a fórmula certa (a do livro)
  dá ~17. Ou seja, PT estava tão inflado quanto o PM estava antes do ajuste do `× 2` acima — só que
  ninguém tinha percebido até a auditoria livro×código, porque o código nunca foi comparado
  formalmente contra o texto do livro nessa fórmula específica.
- **PV Máximo não precisou de ajuste** (auditado 2026-08-28, junto do PM) — cruzando o PV de um
  Deus da Espada Vigor 4 (sem dump stat) em cada rank com a própria Tabela de Dano por Turno do
  Apêndice C, a razão PV/dano-de-um-personagem-do-mesmo-rank fica estável entre 2,25 e 3,1 "turnos
  aguentados" em TODOS os 6 ranks, do Principiante ao Imperador — sem disparar nem apertar em
  nenhum ponto. Casters (ex: Água Vigor 4) ficam mais frágeis nos ranks altos (~4 turnos no
  Principiante caindo pra ~1,5 no Imperador, medido contra o dano de Fogo) mas isso já é intencional
  — o próprio Apêndice C descreve Fogo como "mata tudo, morre de qualquer coisa". O exemplo de "33
  PV no Imperador" que o Apêndice C usa só bate com Vigor -2 (o dump stat máximo do Sistema de
  Defeitos, Cap. 1 §2) — também um extremo proposital do livro, não um valor típico.
- **+PV/+PM comprado com PA (Cap. 1 §2) escala com o Maior Bônus de Rank do personagem, não é
  fixo** (corrigido em 2026-08-28, achado pela revisão com 4 agentes). O livro sempre disse que 2 PA
  rendem `2 × Maior Bônus` de PV ou `Maior Bônus de magia` de PM — com um Aside inteiro explicando o
  porquê ("Imperador ganha 6× mais que Principiante pelos mesmos 2 PA"). O código usava uma taxa
  fixa (`HP_MP_BONUS_PER_TWO_PA = 12`, removida — não sobrou nenhum lugar que ainda precisasse dela)
  pra qualquer Rank; 12 não era um número aleatório, era exatamente `2 × 6`, o valor que só valia
  pra um Imperador — um Principiante pagava 6× menos PA do que devia pelo mesmo bônus. `bonusHp`/
  `bonusMp` continuam sendo o valor de PV/PM que o jogador digita direto na ficha (isso não mudou —
  PA continua só informativo, nunca travado); só `getHpMpPaCost` (o número de "PA gastos" mostrado)
  passou a usar a taxa certa pro Rank atual.
- **Atributo acima de 4 custa PA** (2 por ponto, até 8) — Cap. 1 §2, sem trava dura no input.
- **`AbilityDef.pmCost` é opcional** de propósito — cobre magia (com PM) e técnica de Touki (sem
  PM) com o mesmo tipo, sem duplicar estrutura.
- **Layout radial das árvores**: cada rank só tem o próximo rank como filho, nunca os nós de
  magia/talento — é isso que garante a linha reta em `/arvores`.
- **`/livro` não duplica o catálogo de magias/técnicas** por fora — o Cap. 3 do livro-web
  (`TreeCatalog.tsx`) renderiza o catálogo completo puxando do mesmo `TREES` que `/arvores` e a
  ficha usam, então os três nunca podem divergir entre si.
- **`unlockPaCostOverride`** existe só pra exceções pontuais de custo de desbloqueio (hoje, só o
  Rei do Norte = 2 PA em vez de 3).
- **Paleta pergaminho/vinho/dourado veio da ficha em Typst original do usuário** — mesmos hex no
  site e no PDF exportado, de propósito. `RANK_COLORS`/`CATEGORY_ACCENT` ficam fora do
  rebranding (são código funcional pra diferenciar rank/pilar, não decoração).
- **PDF gerado no servidor com o pacote `typst`** (binário nativo via `/api/ficha-pdf`), não WASM
  no navegador — mais simples e robusto, sem precisar embutir fontes num bundle grande.
- **Exportar PDF funcionava local mas falhava na Vercel** (relatado pelo usuário, 2026-08-28) —
  diagnóstico: o pacote `typst` resolve o binário certo por SO via
  `import.meta.resolve("@typst-community/typst-<os>-<arch>")`
  (`node_modules/typst/dist/lib/getTypstPath.js`), que não é um `import` estático — o rastreador
  de arquivos do Next (`@vercel/nft`) não via essa dependência sozinho, então a função serverless
  de `/api/ficha-pdf` subia na Vercel sem o binário. Fix: `outputFileTracingIncludes` em
  `next.config.ts` forçando `node_modules/@typst-community/typst-*/**/*` pra dentro do bundle da
  rota — confirmado localmente que o binário passou a entrar no `.nft.json` gerado, mas **só um
  deploy real confirma se resolveu de verdade** (não dá pra testar Vercel a partir daqui).
- **`typstFicha.ts` nunca interpola dado dinâmico direto em marcação Typst** — todo valor passa
  por `tstr()` e é impresso via `#valor`, então efeitos com `*`/`_`/`#`/`[` não quebram a
  compilação.
- **A roleta da Via 2 é só decorativa.** O sorteio real (`rollRandomRace`/`rollRandomBackground`)
  já aconteceu antes de girar — a animação SVG só aponta pro resultado com suspense, nunca
  influencia a probabilidade. A regra de **3 tentativas por roleta** (`useWheelSpin.ts`) existe
  pra que raça/antecedente raros continuem raros de verdade: sem ela, girar até sair o resultado
  desejado anularia o peso/raridade que já existe em `RACE_WEIGHT` e nos `rollRange` d100.
