# Mushoku Tensei RPG — Progresso do Site

Última atualização: 2026-08-31 — **Rework do Escudeiro (linha Puro Escudo) + Espíritos e Feras (Filhote Evolutivo + preparo estrito) + 9 Magias Combinadas oficiais**. O Escudeiro perdeu Escudo Robusto/Dois Escudos e ganhou o talento "Puro Escudo" (1 PA) que abre uma linha inteira de habilidades "Soberanas" em todos os ranks — quem compra Puro Escudo não empunha arma de dano (só escudo) e ganha versões mais fortes de Golpe de Escudo, Provocar Ódio, Aguentar, Não Ele, Custe o Que Custar e Muro Final. Os Pactos ganharam o "Filhote Evolutivo" (mais fraco que os outros Pactos no Principiante, evolui com PA nos ranks seguintes: Forma Média + Sentidos no Intermediário, Forma Suprema no Avançado). Invocação agora é estritamente por círculo desenhado (10 min de preparo) — o talento "Convocar sob Pressão" no Principiante (1 PA) libera invocação em combate a custo de 6 Ações e criatura com metade dos PV e um degrau a menos no dado; o talento "Convocação Aprimorada" no Avançado reduz pra 4 Ações sem penalidade. Por fim, 9 Magias Combinadas formais foram adicionadas ao livro (Magma, Gelo Tempestuoso, Relâmpago Santo, Barreira Incandescente, Tempestade de Cura, Pânico, Muralha de Espinhos, Nevasca Curativa, Meteoro) — antes a regra era 100% "Mestre inventa"; agora as fusões canônicas têm custo, dano e efeito definidos em `src/data/combinedSpells.ts`.
com as fórmulas recalculadas a partir de `src/data/` em vez das tabelas escritas à mão do livro. Sete
correções de regra e seis de UI, todas aplicadas; `.github/` criado do zero. Detalhes de cada uma em
"Decisões de design". Os dois achados que mais importam: **um mago de Espírito baixo no rank
Imperador não conseguia conjurar a magia de assinatura da própria escola** (20 PM de reserva contra
22-25 PM de custo — a build "cirurgião" que o Cap. 1 promete era matematicamente impossível), e **a
Escada de Dados saturava no 4d10 antes do fim da progressão** (o Espadão de um Deus da Espada batia
no teto já no Rei, a Maestria de Imperador não entregava nada, e adaga/espada curta/espadão
convergiam todos pro mesmo dado). Relatório completo da auditoria:
[artifact "Auditoria do Mundo de Seis Faces"](https://claude.ai/code/artifact/f1da5918-b786-4ae5-a2d9-ba187a53970d).

Contexto da sessão anterior — Landing page em `/`, ficha movida pra `/ficha`, rolagem inline
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
- [ ] **Reformular a Entrevista (Via 3)** (pedido do usuário, 2026-08-28) — **os 2 modos já
      foram implementados** (2ª sessão do dia); o que falta é só o banco de perguntas:
  - [ ] Banco de perguntas cresce de 14 pra ~20 (`src/data/interview.ts`).
  - [ ] Cada pergunta ganha **6 respostas possíveis** em vez de 4 fixas; só **4 aparecem** por vez,
        sorteadas entre as 6 com alguma chance — nunca sempre as mesmas 4 pra mesma pergunta.
  - [x] ~~Escolha de 2 modos antes da 1ª pergunta~~ — feito. A pergunta que estava em aberto
        ("como a Raça é escolhida no modo Só Antecedente?") foi resolvida como **escolha manual**:
        uma fase `raca` nova mostra um grid das raças sorteáveis antes da 1ª pergunta. Raças de
        peso 0 (Dragão) ficam de fora dela, igual no sorteio — quem quiser continua indo pela Via 1
        com aval do Mestre.
  - [x] ~~Lógica de loteria pesada continua a mesma~~ — o `+2 por resposta que empurra` continua,
        mas o **peso base deixou de ser 1 fixo** (ver "Loteria da Entrevista" em Decisões de design):
        era um bug que fazia a Via 3 ignorar raridade e conseguir sortear Dragão.
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

**Decisões de design que pediam escolha do usuário — todas resolvidas em 2026-08-28 (2ª sessão),
ver "Auditoria de balanceamento" em Decisões de design:**

- [x] ~~Cap. 2 §3 vs Cap. 4 §3: Conjuração Silenciosa Principiante contradiz "não existe ação
  bônus"~~ — documentada como exceção nomeada no Cap. 2.
- [x] ~~Cap. 4 §6: CD 10 fixa do Fio da Vida~~ — virou `8 + Bônus de Rank de quem te derrubou`.
- [x] ~~Cap. 4 §8: Exaustão Nível 6 sem teste~~ — entrou teste de Vigor CD 15 na transição 5→6.
- [x] ~~Cap. 1 §2: platô de PA de Talento em Rei=Santo=3~~ — Rei subiu pra 4.

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

### Rework Puro Escudo, Feras e Magias Combinadas (2026-08-31)

- **Linha "Puro Escudo" no Escudeiro.** "Dois Escudos" e "Escudo Robusto" saíram. No lugar, o talento "Puro Escudo" (1 PA no Principiante) abre uma linha inteira de versões Soberanas em todos os ranks: Golpe de Escudo Soberano (P, 2d8 + empurra 6m + marca de cobertura), Provocar Ódio Soberano (P, CD+2 e dura 2 turnos), Aguentar Soberano (I, 2d10 e recupera PT se zerar), Escudo de Corpo Inteiro (I talento, +2 CA e Meia-Cobertura pra aliados adjacentes), Não Ele Soberano (A, alcança qualquer aliado e reduz 1d10+Vig), Custe Soberano (S, cura o aliado e dá 2d12 de absorção), Muro Final Soberano (Imp, 0 PT, 3 aliados imunes e você não morre: cai a 1 PV e explode em 4d10+Vig). Restrição: quem tem Puro Escudo NÃO pode empunhar arma de dano (só escudo/escudo grande).
- **Filhote Evolutivo & Vínculo Concentrado (Espíritos e Feras).**
  Adicionado no Principiante como Pacto mais fraco (1d4 garras, PV = 10×MB,
  ajuda 1x/turno). Ranks seguintes trazem os talentos de evolução: "Evolução:
  Forma Média" no Intermediário (garras 2d8+BC, 15×MB de PV, truque de
  Derrubar/Desarmar), "Evolução: Sentidos Aguçados" no Intermediário (visão no
  escuro 18m, faro com Vantagem, alerta telepático) e "Evolução: Forma Suprema"
  no Avançado (4d8 elemental, 25×MB de PV, Resistência física e conjura magia
  menor). No Intermediário, o talento **"Vínculo Concentrado"** permite gastar
  o PM do limite máximo de invocados em um único bicho para torná-lo um mini-boss:
  +2d de dano, +10 PV por Rank e Resistência Mágica.
- **Invocação: regra estrita de círculo + talento de emergência.** Invocação
  padrão agora exige círculo desenhado com antecedência (10 min fora de
  combate). O talento "Convocar sob Pressão" no Principiante (1 PA) libera
  invocar no meio da luta: custa 6 Ações (distribuíveis em turnos), o
  invocado vem com metade dos PV e dado de dano reduzido em 1 degrau. "Traço
  Rápido" permite desenhar círculo em 1 Ação pagando o dobro do PM. No Avançado,
  o talento "Convocação Aprimorada" (2 PA) reduz o custo da emergência pra 4
  Ações e remove as penalidades de PV e dano.
- **9 Magias Combinadas oficiais.** Antes o livro só dizia "Mestre inventa". Agora `src/data/combinedSpells.ts` define nove fusões clássicas: Magma (Fogo+Terra Santo), Gelo Tempestuoso (Água+Vento Santo), Relâmpago Santo (Água+Cura Santo), Barreira Incandescente (Barreira+Fogo Santo), Tempestade de Cura (Cura+Água Santo), Pânico (Fogo+Vento Santo), Muralha de Espinhos (Terra+Fogo Santo), Nevasca Curativa (Água+Cura Rei) e Meteoro (Fogo+Terra Imperador). Cada uma com custo de PA, PM, Ações, dano e efeito fixos. Cap. 2 do livro agora puxa dessa tabela.

### Auditoria de balanceamento (2026-08-28, 2ª sessão)

Todas achadas recalculando as fórmulas a partir de `src/data/`, não lendo as tabelas do livro — é
exatamente nesse espaço, entre o número escrito à mão e o número computado, que todas elas moravam.

- **PM Máximo ganhou um piso: `max(Espírito × MB, MB × 4) + 8`.** O ajuste de `× 2` feito mais cedo
  hoje resolveu o teto (magia de Imperador saindo 4-7 vezes) mas expôs o fundo. Sem piso, um Fogo
  Imperador com Espírito 2 tinha 20 PM e *Sol Menor*, a assinatura da própria escola, custa 22 —
  ele nunca conseguiria conjurá-la, em descanso nenhum. *Corpo Íntegro* (Cura) custa 25. Ou seja: a
  build "cirurgião" (Intelecto alto/Espírito baixo) que o Cap. 1 §1 endossa por escrito — "Roxy
  Migurdia é o primeiro" — era impossível, não fraca. A causa é descompasso de curva: custo mediano
  de magia cresce ×10 do 1º ao 6º patamar (2 → 20 PM), reserva com Espírito 4 cresce ×2,7 (12 → 32).
  O piso põe o Imperador em 32 PM mesmo com Espírito 0 e **é invisível pra Espírito ≥ 4** — o teto
  calibrado (Espírito 8 = 56 PM) não mudou em nada.
- **Escada de Dados estendida com `4d12 → 5d10 → 5d12`, e excedente vira +2 de dano fixo.** Terminava
  no 4d10 e saturava antes do fim da progressão: o Deus da Espada acumula 9 degraus, então um Espadão
  (d10, 4º degrau) batia no teto **já no Rei** e a Maestria de Imperador ("Três degraus") entregava
  zero. Pior: adaga (d4), espada curta (d6) e espadão (d10) convergiam todos pro mesmo 4d10 — a
  escolha de arma deixava de existir no rank alto. Agora d4→3d12, d8→4d12, d10→5d10 no Imperador. O
  excedente em dano fixo (`escalateWeaponDie` devolve `"5d12+2"`, notação que `diceAverage`/
  `diceMax`/`rollFormula` já entendem) existe pros talentos de degrau avulso (Espada Emprestada,
  Punho Duplo) nunca virarem PA jogado fora.
- **Teste de resistência agora soma metade do maior Bônus de Rank (arred. pra cima).** Era a única
  fórmula do livro em que o treino do personagem não contava. A CD do bestiário sobe +10 do 1º ao 6º
  patamar e o teste subia +4 (só o crescimento do atributo): a chance de resistir caía de 70% pra
  40%, e com o atributo largado no Sistema de Defeitos chegava a 5%. Com a correção fica 75% → 55%.
  Usa a mesma fração que o Manto de Touki já usava, pra não inventar uma terceira escala.
- **Bestiário (Apêndice G): CA passou a subir +2 por patamar (12→22) e ganhou coluna de Bônus de
  Resistência.** A CA subia +1 enquanto o ataque do jogador subia +1 de Rank *mais* atributo — a
  chance de acerto ficava congelada (70% com atributo 4, 90% com 8, igual no 1º e no 6º patamar) e a
  CA da criatura não importava. E o molde não tinha **nenhum** número pra quando a criatura *resiste*:
  metade das ~400 habilidades pede teste do alvo e o Mestre improvisava, então o efeito comprado pelo
  jogador virava aposta. Bônus de Resistência = metade do Bônus de Ataque (+2/+2/+3/+4/+5/+6).
- **A compra de PV/PM da tabela do Cap. 1 dobrou (2 PA = 4× MB de PV, 2× MB de PM).** Era 4× pior que
  o talento de reserva recomprável que 12 árvores têm: no Imperador o talento dava +24 PV por 1 PA e
  a tabela pedia 2 PA por +12 PV. A linha era, na prática, uma armadilha — sempre a pior compra
  disponível pra quem tivesse qualquer árvore aberta. Agora empatam em **valor por compra**; o
  talento continua melhor por PA de propósito, porque é travado no número de patamares de *uma*
  árvore enquanto a compra genérica é incondicional e sem teto.
- **Fio da Vida: CD 10 fixa → `8 + Bônus de Rank de quem te derrubou`** (10 quando não há responsável
  claro, tipo queda). CD 10 no rank alto não era teste: Vigor 6 passava em 80%, e morrer virava quase
  impossível justamente quando os inimigos ficavam letais. Agora goblin = CD 9, Imperador = CD 14.
- **Exaustão nível 5→6 pede teste de Vigor CD 15.** Era a única morte do livro sem nenhuma rolagem —
  o Fio da Vida dá três chances e a Exaustão não dava nenhuma.
- **Suishin "Maré de Retorno" teve teto de Reações.** Dizia "sem limite de Reações"; contra oito
  inimigos eram oito contragolpes num turno que não é seu. O Apêndice C já registrava o dano dele
  como "0 a ∞", mas admitir não é limitar. Agora é o Bônus de Rank por rodada (6 no Imperador —
  continua sendo a maior contagem do livro).
- **`RANK_PA_COST.talent.Rei` 3 → 4.** Era o único ponto não-monotônico das três colunas (Santo e Rei
  custavam igual, então o 5º patamar saía de graça em relação ao 4º).
- **Conjuração Silenciosa Principiante documentada como exceção nomeada** (Cap. 2), em vez de
  contradizer em silêncio o "não existe ação bônus" do Cap. 4 §3. Sem a Ação grátis, conjurar em
  silêncio num rank baixo custaria uma Ação inteira pra entregar metade dos dados e dois terços da
  área — ninguém usaria, e o método mais característico da obra morreria na ficha.
- **PV não foi tocado.** Reconferido duas vezes (a segunda já com a escada estendida, por auditoria
  dedicada): a razão PV / dano-sustentado fica entre **1,94 e 3,10 turnos** nos seis patamares e não
  degrada com o rank. Simular Vitalidade ×5 ou ×6 só empurra o 2º patamar pra fora da faixa pelo
  outro lado. É o número mais bem calibrado do livro — o problema, quando aparece, é sempre
  multiplicador de habilidade, nunca a fórmula de PV.
- **A Maestria de Imperador do Deus da Espada deixou de empilhar com técnicas multi-rolagem** — e
  isto foi consertar uma regressão que a própria extensão da escada (item acima) criou. A Maestria
  manda "role o Dado de Arma duas vezes o normal", e a Espada de Luz Verdadeira já rola **cinco
  vezes**: o produto é 10× o dado. Como cada degrau novo da escada entra multiplicado por dez, o
  golpe passou de 238-274 (escada antiga, contra 272 PV — ficava no fio) pra **289**, e virou um
  **one-shot com acerto automático que ignora CA, Cobertura, Manto de Touki, armadura mágica e
  barreira**, sem defesa possível a não ser a Reversão de Luz de rank Rei+ com Desvantagem. Matava
  qualquer Imperador do livro com Vigor 4. Com a Maestria travada em técnicas de até 2 rolagens o
  golpe volta pra **152** (56% do PV de um par: dramático, não decisivo), e nem a build mais
  otimizada — Espada Emprestada + Punho Duplo, 5d12+2 — chega a matar (187). **Lição:** ao mexer numa
  escada de dados, procurar antes tudo que multiplica aquele dado; o efeito não é linear.
- **Apêndice C: a coluna da Espada estava subestimada em ~25% do 3º ao 5º patamar** (~46/~58/~76 →
  ~62/~78/~98). O autor original esqueceu a 4ª Ação da Maestria do Avançado ("Velocidade
  Encarnada"). Importa mais do que parece: era contra esses números baixos que a calibragem de PV
  vinha sendo conferida, então a margem de sobrevivência parecia mais folgada do que era de fato.
  Norte 6º também subiu (~81 → ~87). Ficou documentado no próprio apêndice, junto de duas leituras
  que a tabela não deixava óbvias: a linha de Escudos pressupõe todas as Ações gastas defendendo, e
  a metade mágica não amortiza pelas Ações (Sol Menor custa 6 Ações = 2 turnos, logo ~65/turno, não
  ~130 — comparar magia com marcial direto na tabela engana).

### Balanceamento de raças e antecedentes (2026-08-28, 2ª sessão)

Auditados numa moeda comum — **ponto de criação (PC)**, onde 1 PC = +1 atributo = 2 PA pela tabela do
Cap. 1 §2 — e medidos em **dois ranks**, porque é aí que estava o problema estrutural.

- **A descoberta que organiza todo o resto: bônus fixo de PV/PM decai, bônus de atributo não.** PV e
  PM entram na fórmula multiplicados pelo Bônus de Rank (`Vigor × MB × 4`, `Espírito × MB`), então
  +1 de atributo mantém a mesma fração do total do Principiante ao Imperador, enquanto um `maxHp: 6`
  fixo vale +18% no 1º patamar e **+3,1%** no 6º. Era por isso que quase todo outlier do livro era um
  bônus de PM, e quase todo pacote fraco era um bônus fixo de PV.
- **Outliers fortes cortados:** Fator Laplace `maxMp 20 → 8` (os 20 PM sozinhos valiam 10 PC — duas
  vezes e meia o orçamento de criação inteiro — e triplicavam a reserva de um mago recém-criado, de
  12 pra 32); Estudioso Precoce `14 → 8`; Miko "Acúmulo" `15 → 10`; Migurd `10 → 6`; Elfo `8 → 5`;
  Miko "Força Sobre-humana" `forca 3 → 2` (era 75% do orçamento de criação num único traço, pondo o
  personagem em Força 7 na 1ª sessão — +7 no acerto **e** no dano — e a "maldição" não pagava, porque
  o Cap. 1 §4 diz que Vigor não governa perícia nenhuma).
- **Outliers fracos levantados, sempre trocando número fixo por atributo:** Plebeu (o resultado
  **mais comum** da tabela, 15%, era o mais fraco no Imperador com 0,73 PC) `maxHp 3` → `+1 Vigor`;
  Raça do Oceano idem (era peso comum valendo ~0,30 PC em campanha terrestre — respirar sob água,
  terreno aquático e correnteza são todos condicionais); Anão ganhou `+1 Vigor` (saía de 1,40 na
  criação pra **0,15** no Imperador — o único pacote que podia zerar, já que a proibição de Água e
  Vento fecha 2 das 8 escolas pra sempre e o desconto de PM só paga quem já for mago); Acólito
  `maxMp 6` → `+1 Espírito, maxMp 4` (mesmo valor de criação, mas Espírito alimenta a reserva **e** o
  BC das quatro escolas de templo, e ainda serve pro acólito que virou guerreiro); Sobrevivente e
  Gênio ganharam `+1 Espírito`.
- **Duas tabelas inteiras não mexiam em número nenhum.** As 8 entradas de Miko tinham 5 com
  `bonuses: {}` e as 10 de Olho Místico tinham **todas as 10** — o segundo resultado mais raro do
  d100 (2%) não alterava um único valor da ficha, e ainda era autocontraditório: todo Magan roda a PM
  (até 10 PM por uso) num personagem que tem 12 PM no total. Piso aplicado no antecedente, não entrada
  por entrada: Miko ganha `+1 Espírito`, Olho Místico ganha `+1 Intelecto, maxMp 6`. Levanta as
  dezoito entradas de uma vez sem achatar a variância que é o ponto delas.
- **`RACE_WEIGHT` reordenado por poder medido, não por intuição.** Havia quatro inversões: o Celestial
  (voo irrestrito, o traço mais forte fora da raça mítica, 3,20 PC) era mais comum que o Superd; a
  Raça do Oceano era tier comum sendo o pacote mais fraco; Migurd e Demônio Imortal ocupavam o tier
  raro com ~2,2, **abaixo** de raças do tier médio. Três faixas limpas agora: 5 comum (humano,
  hobbit, raça fera) · 3 incomum (anão, elfo, oceano, migurd, demônio imortal) · 2 raro (celestial,
  superd, ogro) · 0 mítica (dragão). O voo do Celestial também passou a ser travado por armadura
  média/pesada e carga — ele escolhe entre voar e ser tanque.
- **Três bugs de regra, não de balanceamento:** o **Dragão prometia "Defesa Base altíssima" sem número
  nenhum** — `bonuses` não concedia CA, então a ficha de um Dragão saía com exatamente a mesma CA de
  um Hobbit (agora `armorClass: 2`, o valor da Armadura Média do Cap. 5 §2); **"Ação Bônus"/"Ação
  Livre" apareciam em 5 traços** (Howling, Terceiro Olho e três Olhos Místicos) contra o Cap. 4 §3, e
  eram os últimos do repositório inteiro; e a regeneração do **Demônio Imortal era fixa em 3 PV**, ou
  seja +8,8% da vida de um Principiante e **+1,5%** da de um Imperador — a habilidade de assinatura
  sumia justo no rank em que "imortal" deveria significar alguma coisa (agora escala com o Bônus de
  Rank).
- **Apêndice A (ficha da Roxy) era o único texto do livro com número de raça escrito à mão** —
  "+10 PM fixos da raça Migurd = 38 PM" virou "+6 … = 34 PM". Cap. 1 §5/§6 e as duas sub-tabelas
  renderizam 100% a partir dos dados, então o resto acompanhou sozinho.
- **Ficaram intocados de propósito:** Hobbit e Ogro (já na faixa da própria raridade) e o grupo de
  referência dos antecedentes (Órfão, Criança Selvagem, Mercador, Treino Precoce, Sangue Nobre) —
  2,00 a 2,65 PC no Imperador, banda apertada e estável. É contra eles que o resto foi medido.

### Entrevista v2 — modos e loteria (2026-08-28, 2ª sessão)

- **Dois modos, escolhidos antes da 1ª pergunta** (`InterviewMode` em `interview.ts`): "Raça e
  Antecedente" (comportamento antigo) e "Só o Antecedente". No segundo, `resolveInterview` devolve
  `raceId: null` e o jogador escolhe a Raça na mão numa fase `raca` nova, antes das perguntas. O
  fecho da lore muda de voz junto (`buildInterviewLore` recebe o modo): no modo manual ela diz que a
  raça "nunca esteve em jogo" e que a infância decidiu só o resto.
- **Loteria da Entrevista passou a respeitar raridade — era um bug.** O peso base de todo candidato
  era **1 fixo**, então a Via 3 ignorava raridade por completo: um Migurd saía tanto quanto um
  Humano, e um Antecedente de faixa d100 95-96 (2% na tabela do Cap. 1 §6) empatava com um de faixa
  01-20 (20%). Pior: **dava pra nascer Dragão numa Entrevista**, coisa que a Via 2 nunca permitiu —
  `RACE_WEIGHT.dragao` é 0 justamente pra isso, e `resolveInterview` recebia `RACES.map(r => r.id)`
  cru, dando 1 bilhete pro Dragão como pra qualquer outro. Agora as duas vias usam a mesma noção de
  raridade: `RACE_WEIGHT` pras raças (com peso 0 = fora do sorteio) e a **largura do `rollRange`
  d100** pros antecedentes, que já É a raridade deles no livro. O `+2 bilhetes por resposta que
  empurra` continua igual.
- **Animação de sorteio** (`DestinyDraw`): antes de revelar, os nomes candidatos passam por ~1,9s
  enquanto o dado gira — mesmo princípio do Rolador, o resultado já está decidido e a animação é só
  suspense (`resolveInterview` só roda quando ela termina). No modo "Só o Antecedente" cicla um nome
  só. Respeita `prefers-reduced-motion` pulando direto pro resultado.
- **Cuidado de performance que custou caro descobrir:** a primeira versão animava
  `transform: scale()` num elemento com `blur-2xl`, e isso **travou o renderizador do Chrome** —
  duas capturas de tela seguidas deram timeout de 30s durante a animação. Desfoque grande + transform
  obriga o navegador a redesenhar o blur inteiro a cada frame. A versão final anima **só `opacity`**
  (composta na GPU, não repinta), reduziu o blur pra `blur-xl` e tirou o `animate-dice-spin` que
  estava empilhado no texto — a troca de conteúdo a cada 110ms já é o efeito. Numa mesa de celular
  isso teria sido bem pior que um timeout de screenshot.

### Auditoria de UI e acessibilidade (2026-08-28, 2ª sessão)

- **O site inteiro renderizava em Arial.** `layout.tsx` carregava Geist + Geist Mono e `globals.css`
  declarava `--font-sans: var(--font-geist-sans)` — e então a regra de `body` sobrescrevia tudo com
  `font-family: Arial`. As duas fontes eram baixadas em toda visita e **nenhuma chegava à tela**.
  Agora: Geist na UI (ficha, loja, controles), **Fraunces** nos títulos (`h1/h2/h3`) e **Literata** no
  corpo do livro (escopado em `.livro-shell`, pra não serifar ficha e rolador junto). Atenção ao
  nomear: as variáveis do `next/font` são `--font-fraunces`/`--font-literata` de propósito — usar o
  mesmo nome do token do tema (`--font-display: var(--font-display)`) é referência circular e a fonte
  nunca aplica.
- **`--color-parchment-600` escurecido de `#85704c` pra `#726040`.** Como texto secundário sobre
  pergaminho dava 4,41:1, abaixo do mínimo AA de 4,5:1 — e é o tom de praticamente todo texto de apoio
  do site. Agora 5,62:1 sobre o 50, 5,26 sobre o 100, 4,65 sobre o 200. **Não quebra a paridade com o
  PDF**: `typstFicha.ts` só usa `4A0E2E` e `FDF6E3` da paleta, nada mais.
- **`text-parchment-500` (93 usos) → `600` e `dark:text-wine-400` (17) → `wine-300`.** O 500 sobre
  pergaminho dava 2,90:1; o wine-400 no dark dava 4,37:1. A troca foi feita com lookbehind negativo
  (`(?<!dark:)`) pra não escurecer as variantes de dark mode, onde texto claro sobre fundo escuro já
  passava.
- **Foco de teclado global em `globals.css`.** Só 5 dos ~30 componentes tinham estilo de foco — nav,
  rolador de dados, loja, tracker e o livro inteiro eram navegáveis por Tab sem indicação visual
  nenhuma.
- **`Warning` do livro saiu de `amber-*` pra `gold-*`**, e os "pills" de ouro (PO, PA gastos, Rank de
  Guilda) em `Shop`/`AbilityDetail`/`InitiativeTracker`/`SkillsSection` também. Eram Tailwind padrão
  tentando parecer o dourado da paleta. **`rankColors.ts` continua fora do rebranding** (decisão
  antiga: é código funcional pra diferenciar rank/pilar), e as cores semânticas de estado
  (emerald/rose na barra de PV do tracker, no crítico/falha do rolador, no botão de excluir) também
  ficaram — verde/vermelho ali comunicam estado, não marca.
- **Ícones de recurso da ficha realinhados à paleta.** PV era `rose-500`, PT `orange-500`, PP
  `emerald-500`, Iniciativa `amber-500` — quatro paletas do Tailwind na tela mais importante do site,
  bem visível no light mode. Agora vinho/dourado/pergaminho, mantendo os seis recursos distinguíveis
  entre si.
- **Escala tipográfica do livro aberta** de `2xl / lg / base` pra `3xl-4xl / xl-2xl / lg`. Três
  degraus quase colados num documento de 5 capítulos + 7 apêndices faziam capítulo, seção e subseção
  parecerem o mesmo nível.

### Nerf de criação (2026-08-30, 4 pedidos do usuário)

Quatro ajustes cirúrgicos, todos no caminho entre criação e 2º patamar (onde a curva tava mais inflada):

- **`PV_BASE` 20 → 14 + multiplicador `×2` → `×1.67`.** A fórmula original
  (`PV_BASE + 2×dados`) inflava o Escudeiro em Vigor alto: com Vigor 4
  (fator 1,8), `14 + 2×18 = 50`, `50×1,8 = 90 PV` com 5 PA — exatamente o
  caso que o usuário mostrou. O `×1,67` é o meio-termo entre o `×2`
  original e o `×1,5` testado (Escudeiro 73 PV no mesmo caso, queda de
  19% sobre o original, ainda apertado pelo usuário). Mantém a
  proporcionalidade entre classes (árvore com dado maior continua dando
  mais PV) e tira o "andar pra cima e dobrar" que inflava a reserva
  inteira. Tabela com Vigor 0, acumulado até o patamar: Escudeiro
  27/44/64 PV (P→A); Lutador 28/43/61; Espada 27/41/57; Magia de Água
  21/29/39; Terra 24/35/48.
- **PM com cap nos 2 primeiros ranks.** A fórmula original
  (`max(Espírito, 4) × MB + 8 + talentos + bônus`) virava 12-16 PM no
  Principiante/Intermediário, e um mago que comprou talentos Nascente de
  Mana/Reserva do Curandeiro + bônus PA chegava a 22-30 PM — bem acima
  do "no máximo 4 casts" pedido. Agora, quando `MB ≤ 2`, o cap é
  `4 × MB + 8 + talento + racial` (12-13 PM sem nada, 14-17 com talento,
  até 17 com Migurd). O cap só corta o que vem "por fora": `bonusMp`
  (PA avulso do Cap. 1 §2) e `maxMp` fixo de antecedente/sub-tabela.
  Talentos de árvore (`mpPerRank`) e bônus racial ESCALAR (Elfo ×2,
  Migurd ×3) entram normalmente — são investimento consciente da raça e
  do rank, não compra avulsa. Acima do 2º patamar (`MB ≥ 3`), a fórmula
  antiga entra inteira — o teto calibrado do Imperador (32 PM com
  Espírito 4) não muda.
- **Escudeiro (Cavalaria e Escudos) nerf + re-equilíbrio.** Quatro mudanças
  no 1º/2º patamar, mais um talento novo e um buff simétrico:
  - `1d10+4 → 1d8+3` no Principiante e `1d12+4 → 1d10+4` no Intermediário
    (média 3,5 PV a menos no primeiro, 4 PV no segundo). Empatou com o
    Lutador, não passou à frente.
  - Maestria "Interpor" do Principiante: `+2 na CA com escudo` → `+1`, e
    `proteger até Bônus de Rank aliados` → `1 aliado`. Sem o +2, um
    Principiante de Agilidade 0 com escudo vai de CA 13 pra CA 12.
  - Kit inicial: Armadura Média → Armadura Leve (+3 CA → +1 CA). O
    "Escudeiro com CA 16 na primeira sessão" desapareceu — virou escolha
    consciente (compra na loja com o dinheiro do antecedente), não
    pacote grátis. Quem quer subir a CA compra talento ou compra a
    armadura média de verdade.
  - Limite de protegidos: 1 (P) / 2 (I) / 3 (A). Avançado+ mantém
    como estava.
  - **Buff "Ombro de Pedra":** `+2 PV por patamar` → `+4 PV por patamar +
    +1 PT Máximo fixo`. É o talento-tank por contrato: 1 PA no P rende
    +4 × 6 patamares + 1 PT até o Imperador. Compensa o nerf global de
    PV sem inflar o piso.
  - **Talento novo "Escudo Robusto" (Principiante, 1 PA):** empunhar
    escudo grande com as duas mãos dá +3 CA adicional (não +2) e
    Vantagem contra empurrão/agarrão/queda. Restrição: não dá pra
    empunhar outra arma ao mesmo tempo, mas Golpe de Escudo continua
    disponível. Coexiste com "Dois Escudos" do Intermediário, que
    passou a empilhar +3 CA (não +2) em cima de Escudo Robusto — o
    talento do P virou a forma base pra carregar dois.
- **Point-buy de criação 4 → 2 pontos, sem desconto de Raça/Antecedente.** Antes, um Ogro (+2 For) com o Wizard podia abrir o jogo em Força 4 sem pagar nada pelo +2 que a raça dava — e ainda tinha 4 pontos livres pra distribuir em outros atributos. Resultado: a Raça mais forte saía do cap de criação sem tradeoff. Agora o jogador distribui 2 pontos e os bônus de Raça/Antecedente/sub-tabela são empilhados POR FORA (não consomem orçamento). O Ogro continua começando com Força alta, mas tem menos onde botar o resto. O Sistema de Defeitos continua devolvendo +1/+2 pelos -1/-2, então a soma dos cinco atributos base fecha em 2 de qualquer jeito — o cap do livro continua valendo, só que apertado.

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
