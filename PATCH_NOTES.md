# Patch Notes

Histórico de mudanças de regra, balanceamento e sistema do RPG de Mushoku Tensei.
As mesmas notas aparecem dentro do site, em `/livro`, geradas de `src/data/patchNotes.ts`.

---

## 0.0.6 — "A Mão Não Envelhece" · 2026-09-03

### ⚔️ Balanceamento

**Magia de Cura — o Rei deixou de ser um patamar morto.** A escada de cura direta parava no Santo:

| Rank | Melhor cura direta | PM | Cura (Ferida Fresca) |
| --- | --- | --- | --- |
| Avançado | Cura Suprema | 6 | 12d8+BC ≈ 61 |
| Santo | Cura Radiante | 10 | 20d8+BC ≈ 98 |
| **Rei** | *(nenhuma nova)* | — | **98 — o mesmo do Santo** |
| Imperador | Maestria: dados máximos | — | 160 |

O Rei ganhava Restauração e Milagre Menor — utilidade alta — mas curava exatamente o mesmo que o patamar
anterior, num livro em que toda escola ofensiva ganha um número maior a cada rank.

> **A Mão Não Envelhece** (Maestria do Rei): toda magia de Cura sua rola **+1d8 por rank de diferença**
> entre o seu patamar em Cura e o rank da magia. No Rei, a Cura de 1º patamar rola +4d8; a Cura Radiante,
> +1d8.

**Corpo de Ferro (Santo)** dava **+50 PV máximos fixos** — o único número solto da árvore. Dois problemas
num número só: não escalava (valia o mesmo no Santo e no Imperador) e usava a categoria errada, porque PV
máximos não são gastos antes dos reais e não expiram — a magia funcionava como cura permanente disfarçada
de escudo. Agora são **PV Temporários iguais a 8 × Bônus de Rank** (32 no Santo, 48 no Imperador), e não
acumulam com Vigor Emprestado.

---

### 📖 Novas Regras e Simplificações

**Rank Deus do Estilo Vendaval** — era a única árvore sem quadro do patamar Divino, e a ausência pesava
mais nela porque uma árvore híbrida já é um teto por definição.

> **O Passo Que Não Termina.** Todo patamar do Vendaval apenas alarga o número da Distância Roubada — 9m,
> 12m, um piso de 6. O Divino apaga o número: o espadachim não percorre a distância até o alvo, ele já a
> percorreu antes de decidir atacar. Nenhuma das duas escolas de origem reivindica o título — o Norte diz
> que é vento, o Vento diz que é esgrima.

**Uma regra, uma redação.** O teto de PM dos dois primeiros patamares estava escrito quase palavra por
palavra em Cap. 1, §1 **e** Cap. 4, §1. Duas cópias da mesma regra é exatamente como nasceram as sete
contradições corrigidas na 0.0.5. A redação canônica agora vive no Cap. 4, §1, junto da fórmula; o Cap. 1
aponta pra lá.

**Cinco magias divergiam da tabela de Ações sem a nota que o Cap. 2 exige** — Chamado, Retorno, Troca de
Lugares e Corpo Emprestado (Invocação) e Santuário (Cura). Todas ganharam a justificativa. Na Invocação, o
custo em Ações não escala com o rank *de propósito*: o preparo acontece fora de combate, no círculo de 10
minutos, e um gesto não fica mais lento porque o invocado ficou mais forte.

---

### 💻 Sincronia de Sistema

**`npm run check:livro`** substitui o `check:magias`. As sete contradições da 0.0.5 nasceram todas do
mesmo jeito: um número escrito à mão numa frase, e depois o dado mudou. Ler o livro inteiro à mão acha isso
uma vez; o script acha toda vez, em dois segundos.

Ele confere:

- a contagem de árvores citada na prosa contra `TREES.length`;
- que toda árvore declara Mecânica Central e tem quadro de Rank Deus (ou patamar Deus próprio);
- que a tag da mecânica aparece na Maestria de 1º patamar (aceitando tags de dois tempos);
- que toda magia tem cântico, e que ele respeita a faixa do rank;
- que todo desvio da tabela de Ações carrega `costNote`.

Na primeira execução ele achou **21 técnicas do Punho de Fogo** sendo tratadas como magia sem cântico — o
check antigo não as via porque olhava uma lista fixa de árvores. A regra ficou explícita: só as **oito
escolas de magia** recitam; técnica marcial que gasta PM é executada, não conjurada.

---
## 0.0.5 — "Comece Aqui" · 2026-09-03

### 📖 Novas Regras e Simplificações

**Novo capítulo de abertura.** O livro abria em *"o sistema utiliza 5 atributos principais"* — quem nunca
jogou via uma decisão de ficha antes de saber o que é um turno. O capítulo **Comece Aqui** resolve isso em
cinco minutos de leitura: o que é o jogo, a ficha em seis números, um turno de combate, **uma rodada
jogada de ponta a ponta**, criação em seis passos, e um índice de onde encontrar cada coisa.

A rodada de exemplo ensina a regra dos dois tempos com um caso concreto: a maga de Água prepara no 1º
turno (aplica Molhado, causa pouco dano) e cobra em dobro no 2º.

### 🐛 Correções de Bugs

Uma leitura completa do livro achou sete contradições. A primeira é grave e foi introduzida na 0.0.4:

| Onde | O problema |
| --- | --- |
| **Interrupção de conjuração** | Existiam **duas regras conflitantes**. Cap. 2, §6 usava `CD 8 + metade do dano`; Cap. 4, §3 usava `CD 10 + Bônus de Rank de quem acertou`. |
| **Salvações** | Cap. 4, §4 diz "Duas Salvações"; Santuário Menor citava "Uma Salvação". |
| **Formas de evitar morte** | Listava quatro; são cinco — a Égide Lendária estava fora da contagem apesar de se declarar parte dela. |
| **Contagem de árvores** | O livro dizia 17 ou 18 em seis lugares. São **19** desde que o Punho de Fogo entrou, na 0.0.2. |
| **Tabela de patamares (Cap. 3)** | Renderizava uma **linha 7 duplicada com bônus +8** — valor que não existe (o rank Deus é +7). |
| **Escolas Formais × Ofícios** | Dizia seis Ofícios; são sete, e o Estilo Vendaval é Escola Formal. |
| **Aside "Por que o dobro, e por que 20"** | Explicava uma fórmula que não existe mais: a constante é **14** e o multiplicador é **1,67** desde 2026-08-30. |

**Sobre a interrupção:** vale a regra do Cap. 4. O próprio livro já documentava, desde 2026-08-29, por que
a versão baseada em dano não funciona — o dano cresce sem teto (uma criatura Imperador bate perto de 120
por turno) enquanto o teste trava em +11 num d20, então magia de 4 a 6 Ações ficaria impossível de
conjurar exatamente nos patamares em que ela existe. A regra correta amarra a CD ao **Rank de quem
acertou**, não ao tamanho do golpe. Todo o resto da seção nova do Cap. 2 (o estado "Conjurando", as
condições que interrompem sem teste, o Ritual que se perde inteiro, a tabela de interrupção deliberada)
continua valendo — só a CD estava errada.

### 💻 Sincronia de Sistema

- **"Criar" saiu da barra de navegação.** Criar personagem não é um destino que se visita: é uma coisa que
  se faz a partir do roster, e `/personagens` já abre com o botão de criação ao lado das fichas
  existentes. A rota continua existindo e linkada da landing e do roster.
- Cap. 2, §6 e Cap. 4, §3 agora se referenciam mutuamente, em vez de repetir a regra.

---

## 0.0.4 — "O Cântico Tem Preço" · 2026-09-03

### ⚔️ Balanceamento

**O Bônus de Recitação Perfeita deixa de ser automático.** Ele é a recompensa mais forte que o livro
entrega de graça (Vantagem no acerto, ou +2 na CD, ou PM de volta) e estava saindo por qualquer cântico
escrito. Uma auditoria das 149 magias encontrou **55 com cântico abaixo do piso do próprio rank**:

| Árvore | Magias fora da escada (antes) |
| --- | --- |
| Cura | 16 de 21 |
| Desintoxicação | 14 de 17 |
| Barreira | 12 |
| Invocação | 5 |
| Bardo | 4 |

> *"Não caias. Ainda não. Prontidão!"* — 35 caracteres — pagava exatamente o mesmo que um cântico de 380
> caracteres do rank Rei.

O efeito colateral era pior que o desequilíbrio: o sistema **premiava quem escrevesse cânticos curtos**,
o oposto do que o Cap. 2 promete. Agora o piso da faixa do rank é a porta do bônus.

| Rank | Piso (concede bônus a partir daqui) | Teto de estilo |
| --- | --- | --- |
| Principiante | 90 | 140 |
| Intermediário | 140 | 200 |
| Avançado | 200 | 280 |
| Santo | 280 | 380 |
| Rei | 380 | 500 |
| Imperador | 500 | 650 |

- **50 cânticos reescritos** para alcançar a faixa do próprio rank. Hoje **144 das 149** magias estão
  dentro da faixa; antes eram 91.
- **5 magias continuam curtas de propósito** e agora imprimem **"Sem bônus"** na carta: Prontidão,
  Rejeitar a Morte, Luz Absoluta, Lança de Plasma e Explosão Silenciosa. Todas de emergência, todas com
  `costNote` explicando a pressa — nelas a velocidade já *é* o benefício.
- A regra se mede sozinha a partir de `INCANTATION_LENGTH`: escrever um cântico curto novo desliga o bônus
  dele automaticamente, sem ninguém marcar campo nenhum.

**Estilo Vendaval — mecânica nova.** Era a única árvore sem identidade: mobilidade solta, alcance estendido
em três patamares diferentes, e nenhuma regra ligando as duas coisas.

> **[Distância Roubada]** A distância que você percorreu na sua vez (até 9m) é somada ao **alcance** do seu
> próximo ataque corpo a corpo neste turno. Se ele acertar um alvo a mais de 3m, o alvo fica Desequilibrado.

Ela escala pelos patamares em vez de aparecer do nada: no Intermediário o movimento feito com Reação
também conta; no Avançado o teto sobe para 12m; no Rei ela soma em cima do alcance mínimo de 6m. Os cinco
"ataques corpo a corpo à distância" espalhados pela árvore viraram variações de uma regra só.

---

### 📖 Novas Regras e Simplificações

**Interromper uma Conjuração (Cap. 2, §6)** — a regra que faltava. Uma magia de Imperador custa 6 Ações e
o cântico pode ser dividido entre turnos: o conjurador passa rodadas inteiras vulnerável, e o livro não
dizia o que acontece nesse intervalo.

> Ao **sofrer dano** enquanto está Conjurando: teste de resistência de **Espírito** contra
> **CD 10 + o Bônus de Rank de quem te acertou** *(corrigido na 0.0.5 — ver abaixo)*.
> **Sucesso:** o cântico segue. **Falha:** perde todas as Ações gastas e **metade do PM** da magia.

- Enquanto Conjurando você é **visível e audível** (o Mestre informa o rank aparente pelo tamanho do
  cântico), move-se metade do Deslocamento, e não pode atacar, usar item nem usar Reação — usar Reação
  encerra a conjuração. Conjuração Silenciosa é a exceção: ninguém percebe.
- **Atordoado, Paralisado, Incapacitado, Surdo e Soterrado** interrompem **sem teste**.
  **Congelado e Atolado não interrompem** — você continua falando.
- **Ritual não se interrompe pela metade: se perde inteiro.** PM cheio e todo o tempo investido. Em troca,
  um ritual conduzido em paz nunca exige teste.
- Tabela de formas deliberadas de interromper: bater forte (concentrar o dano num golpe só vale mais que
  espalhá-lo), Vácuo Localizado (Vento), Selado e Anulação (Barreira), Corte de Braço (Deus da Espada).

**Regras Gerais de Conjuração (Cap. 2, §7)** — as perguntas de primeira sessão, respondidas de uma vez:
linha de visão, conjurar em corpo a corpo (permitido, **sem** penalidade), mãos livres, segurar magia
pronta, quantas magias sustentar, ficar sem PM no meio, falha crítica e empilhamento de magias iguais.

**Mecânica Central — as 19 árvores (Cap. 3).** Toda árvore sempre teve uma ideia própria, e nenhuma dizia
qual era: a `tagline` existia nos dados e o livro nunca a imprimia. A mesa abria o catálogo de Terra e via
24 magias sem nenhuma linha explicando que a escola gira em torno de prender primeiro e enterrar depois.

Cada catálogo agora começa com um quadro de quatro blocos fixos — **a tag**, **o que ela faz que nenhuma
outra faz**, **o ciclo de jogo numerado** e **a fraqueza declarada** — e o capítulo ganhou a seção
**"Como Ler uma Árvore"** com as 19 lado a lado, para ser lida *antes* de escolher a Árvore Inicial.

A tag aparece entre colchetes na Maestria de 1º patamar de cada árvore:

| | |
| --- | --- |
| Água | `[Molhado → Congelado]` |
| Fogo | `[Em Chamas]` |
| Vento | `[Desequilibrado]` |
| Terra | `[Atolado → Soterrado]` |
| Cura | `[Ferida Fresca]` |
| Desintoxicação | `[Rank contra Rank]` |
| Barreira | `[Selado / Fluxo Interrompido]` |
| Invocação | `[Pacto]` |
| Deus da Espada | `[Letalidade]` |
| Deus da Água | `[Contra-ataque]` |
| Deus do Norte | `[Improviso]` |
| Armas Pesadas | `[Quebrantado]` |
| Cavalaria e Escudos | `[Sob Minha Guarda]` |
| Arquearia | `[Marcado]` |
| Vendaval | `[Distância Roubada]` |
| Punho de Fogo | `[Calor]` |
| Ladino / Bardo / Tático | `[Escopo: coisas e lugares / pessoas e reputação / tempo e logística]` |

**A regra dos dois tempos**, agora escrita: árvores que **preparam** (Água, Terra, Vento, Lutador) contra
árvores que **cobram na hora** (Fogo, Deus da Espada, Arquearia). Nenhuma é melhor — a pergunta é quantos
turnos a sua mesa costuma jogar antes de a luta acabar.

---

### 💻 Sincronia de Sistema

- `src/lib/types.ts`: nova `qualifiesForRecitationBonus(incantation, rank)` — o gate único, medido a partir
  de `INCANTATION_LENGTH`; e a interface `TreeMechanic` (tag / hook / loop / cost).
- Todas as 19 árvores declaram `mechanic`. `TreeCatalog` renderiza o quadro `MechanicCard` no topo.
- `AbilityDetail.IncantationBlock` passou a receber `rank` e imprime o selo dourado *ou* o selo cinza
  "Sem bônus". As três superfícies que o usam (livro, ficha, mapa de árvores) passam o rank.
- `scripts/check-magias.mts` reescrito: separa **falha** (magia sem cântico, quebra o build) de **aviso**
  (fora da faixa), e lista quais magias não concedem bônus e quais delas não têm `costNote` justificando.
- Quebras de linha normalizadas nos arquivos de árvore (mistura de LF e CRLF introduzida pelas edições).

---

### 🐛 Correções de Bugs

- **`perfectRecitationBonus` lia um campo que não existe.** Ela fazia `(ability as { rank?: RankName }).rank`
  para calcular quanto PM devolver, mas `AbilityDef` nunca teve `rank` — o valor era sempre `undefined`, e
  toda magia de suporte do livro exibia o texto genérico *"Recupera PM (Bônus de Rank)"* em vez do número.
  Agora o rank vem por prop e a carta mostra o valor real.
- **Cânticos fora da escada de tamanho** (58 magias no total, contando os longos demais): um Principiante
  recitava mais que um Santo em três árvores, invertendo a leitura de rank pelo tamanho do cântico.

---

## 0.0.3 — "A Profundidade Morreu" · 2026-09-03

### ⚔️ Balanceamento

**Magia de Desintoxicação — nerf de poder, corte de preço.**

| O que | Antes | Agora |
| --- | --- | --- |
| Sopro Podre (Rei) | 10d8 + aflição que escalava | 6d8 + aflição de rank Avançado |
| Corrosão (Avançado) | 4d8 ácido, −2 CA **permanente** | 3d6 ácido, −2 CA até 1h de conserto |
| Toque do Fim (Rei) | Aflição que subia 1/dia e **matava** em 6 | Aflição de rank Rei, não mata sozinha |
| Anular (Avançado) | Removia **qualquer** condição do jogo | Só as 5 da escola, e só de origem tóxica |
| Estado Anulado (Santo) | 1×/turno, sem custo | 1×/rodada, **gasta a Reação** |
| Corpo Recusado (Avançado) | Imune a veneno e doença + relógio lento | Imune só a veneno/doença **não-mágicos** |
| Nada Entra (Imperador) | Imunidade compartilhada em 18m | Vantagem em 9m |
| Sangue Trocado (Avançado) | Reduzia a aflição em 2 ao transferir | Transfere com o rank intacto |

**Tabela de PA própria (Cap. 1, "A Escola Barata").** A Desintoxicação é a única escola cujo trabalho
principal acontece fora do combate e cujo alvo é sempre um problema que o Mestre criou. Cobrar dela o
preço de uma escola de dano era fazer o jogador pagar Fogo por um seguro contra o roteiro.

| Rank | Comum (era → é) | Assinatura ◆ | Talento |
| --- | --- | --- | --- |
| Principiante | 1 → 1 | 2 → 1 | 1 → 1 |
| Intermediário | 1 → 1 | 2 → 1 | 1 → 1 |
| Avançado | 2 → 1 | 3 → 2 | 2 → 1 |
| Santo | 3 → 2 | 4 → 2 | 3 → 2 |
| Rei | 4 → 2 | 5 → 3 | 4 → 2 |
| Imperador | 5 → 3 | 6 → 4 | 4 → 3 |

**Custos de PA de personagem, agora progressivos no livro também.** O motor já cobrava assim desde a
auditoria anterior; a tabela do Cap. 1 e o painel da ficha ainda anunciavam o custo fixo antigo.

- Atributo: **1 / 1 / 2 / 2 / 3 / 3… PA** (era "2 PA fixos por ponto").
- Vantagem em Testes de Resistência: **2 / 3 / 4 / 4 / 4 PA**, 17 PA pelas cinco (era "2 PA por atributo").

---

### 📖 Novas Regras e Simplificações

**A Profundidade foi apagada.** Toda aflição carregava um número de 1 a 5 que subia sozinho (1 por hora,
ou 1 por dia) e que cada magia da escola empurrava em incrementos diferentes. A mesa precisava manter um
segundo relógio por personagem afetado, e o jogador de Desintoxicação passava o turno fazendo aritmética.

A regra nova cabe numa linha:

> **Toda aflição tem um Rank. Um feitiço de rank X remove uma aflição de rank X ou inferior.**

Nada sobe, nada desce. Aflição não piora sozinha e não passa sozinha — ela **continua cobrando o efeito
dela** (2d6 por hora, −1 atributo por semana, petrificação em quatro turnos) até alguém tratar. A urgência
sempre foi o efeito, nunca o contador.

- CD de exposição a veneno: `8 + (2 × Bônus de Rank da aflição)` — os mesmos números de antes (Principiante
  CD 10 … Rei CD 18), lidos de uma escada que o livro inteiro já usa.
- CD de contágio passivo: `8 + Bônus de Rank da aflição`.
- **Sangria** virou a única válvula de escape da escola: purga uma aflição de **um rank acima** do seu
  alcance, ao custo de 3d6 irredutíveis. Substitui o talento *A Mão que Não Erra*, removido.
- **Contra a Maré** (Avançado) deixa aflições **dormentes** num raio de 9m em vez de "parar o relógio":
  continuam no corpo, mas não cobram efeito enquanto você estiver de pé.
- A **Doença da Pedra Mágica** virou a única aflição de **rank Deus** do livro.

**Nova condição: Soterrado** (Cap. 4, §5) — a metade que faltava da identidade da Terra.

> Deslocamento 0, Preso, não enxerga nem conjura com gesto, 2d10 de sufocamento por turno.
> Só pode ser aplicada a quem já esteja **Atolado, Preso ou Caído**.
> Sai com 1 Ação e teste de Força (CD 8 + BC), ou com 30 de dano à terra que o cobre.

**As sete essências, agora respeitadas nas sete árvores.** Cada Maestria de 1º patamar marca a sua com um
rótulo entre colchetes, e cada escola ganhou o *pagamento* que faltava:

| Árvore | Prepara | Cobra |
| --- | --- | --- |
| Água | Molhado | Congelado — **toda** magia de frio congela quem já estava Molhado e falhou (antes só Campo de Gelo) |
| Fogo | — | Em Chamas — dano **cheio** contra alvo Em Chamas, sem metade no sucesso |
| Vento | Desequilibrado | **+1 dado de dano** contra alvo Desequilibrado; Grito do Mundo e Lâmina do Horizonte voltam a aplicar a condição |
| Terra | Atolado | Soterrado — Cárcere, Prisão de Pedra e Sepultamento; a Maestria de Santo converte automaticamente |
| Deus da Espada | — | `[Letalidade]` — sem condição própria, de propósito: dano puro, rápido e letal |
| Deus do Norte | — | `[Improviso]` |
| Deus da Água | — | `[Contra-ataque]` |

---

### 💻 Sincronia de Sistema

- `src/data/trees/shared.ts`: nova tabela `DESINTOX_PA_COST`, no mesmo padrão declarado que
  `UTILITY_PA_COST` já usava — não é um desvio por magia, é uma tabela alternativa da escola inteira.
- `src/lib/types.ts`: `ATTRIBUTE_PA_COST_PER_POINT` e `SAVE_ADVANTAGE_PA_COST` (constantes fixas, mortas)
  saíram; entraram `attributePaCostForPurchase/Total` e `saveAdvantagePaCostForPurchase/Total`. Motor, livro
  e ficha passam a ler a mesma origem.
- `src/store/selectors.ts`: `getAttributePaCost` e `getSaveAdvantagePaCost` passam a delegar para essas
  funções, em vez de repetir a escada num laço local.
- `src/store/useCharacterStore.ts`: **migração v9** do persist. Uma ficha salva com o talento removido
  `a-mao-que-nao-erra` recebe `maos-limpas` no lugar, e os venenos do inventário são renomeados
  (`veneno_prof1/2/3` → `veneno_principiante/intermediario/avancado`).
- `npx tsc --noEmit` e `eslint src` passam sem erros.

---

### 🐛 Correções de Bugs

- **A ficha mostrava um custo de PA que o motor não cobrava.** O painel de Atributos exibia
  `(soma − 2) × 2 PA` e o de Vantagem em Resistência exibia `nº de compras × 2 PA`, enquanto `getPaSpent`
  já cobrava as escadas progressivas. Uma ficha com as cinco Vantagens mostrava **10 PA** na linha e
  **17 PA** no total, sem nada explicando a diferença. As duas superfícies agora leem a mesma função.
- **PA sumiria em silêncio de fichas salvas.** Com o talento `a-mao-que-nao-erra` removido,
  `findAbilityOrTalentDef` retornaria `undefined` e o PA pago por ele desapareceria do total sem deixar
  rastro na ficha. A migração v9 fecha isso.
- **Itens órfãos no inventário.** Os três venenos trocaram de id; sem migração, um veneno comprado antes
  viraria uma linha sem nome nem preço.
- **Importações mortas em `selectors.ts`** (`ATTRIBUTE_PA_COST_PER_POINT`, `SAVE_ADVANTAGE_PA_COST`),
  resquício da auditoria anterior, removidas.

---

## 0.0.2 — "Guarda Erguida" · 2026-08-31

### ⚔️ Balanceamento

- **Ação Defender/Absorver:** o atacante ganha Vantagem, mas o dano é reduzido por
  `(Vigor × 2) + Bônus de Rank do seu maior Estilo de Corpo`.
- **Bloquear com Escudo (Reação):** soma a CA do escudo contra aquele ataque; se o golpe passar a errar,
  o dano é anulado.
- Esquivar e Defender/Absorver protegem só o **primeiro** ataque da rodada.
- PV Máximos escalam de forma mais contida nos primeiros patamares.
- PM Máximos ganham teto nos dois primeiros patamares de magia; some a partir do Avançado.
- **Escudos:** Sob Minha Guarda escala com o rank (1 → 2 → 3 aliados); Interpor passa a somar +1 na CA;
  Ombro de Pedra sobe de +2 para +4 PV por patamar e ganha +1 PT.
- **Criação:** orçamento livre de atributos cai de 4 para 2 pontos; os dois Defeitos liberam 5 em vez de 7;
  bônus de Raça e Antecedente saem do orçamento; kit de Tank troca Armadura Média (+3 CA) por Leve (+1 CA).

### 📖 Novas Regras e Simplificações

- **Magia Combinada** deixa de ser "o que o Mestre aprovar" e vira tabela oficial com 9 magias fixas, cada
  uma comprada com PA e destravada pela Maestria do Avançado.
- **Puro Escudo:** abrir mão de arma de dano desbloqueia versões *Soberanas* das habilidades em todos os ranks.
- **Pacto (Invocação):** Filhote Evolutivo → Forma Média → Forma Suprema, ganhando dano, PV e resistências.
- **Vínculo Concentrado:** concentrar todo o PM de invocação num familiar só concede dados extras e Resistência.
- Invocar em combate sem círculo pronto exige *Convocar sob Pressão* (6 Ações, invocado com metade dos PV).
- **Nova sub-árvore: Punho de Fogo** (Fogo + Lutador), revelada ao alcançar Intermediário nas duas bases.

### 💻 Sincronia de Sistema

- Árvores híbridas (Vendaval, Punho de Fogo) ficam ocultas no Mapa de Árvores até os pré-requisitos serem
  cumpridos, com conector próprio ligando-as às origens.
