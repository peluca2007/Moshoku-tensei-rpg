# Mushoku Tensei RPG — Progresso do Site

Última atualização: 2026-08-28 — Roleta (Via 2) com visual v2: maior, fatias só com número,
legenda ao lado com nome completo + chance real de cada raça/antecedente, ordenada da mais comum
pra mais rara. Auditoria nova do livro encontrou e corrigiu 3 sub-árvores com talentos de Rank
Santo faltando (ver "O que já está pronto").

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
- [ ] Botão de rolar direto no Grimório — bloqueado até `AbilityDef.damage` ganhar um campo de
      dado estruturado separado do texto livre descritivo (ver Decisões de design).
- [ ] Auditoria linha a linha das ~400 magias/talentos/técnicas — Água, Fogo e Deus da Espada
      conferidas por completo; Escudos, Arquearia e Lutador tiveram só o Rank Santo reconferido
      (achou os 3 bugs corrigidos em 2026-08-28, ver changelog); as demais 11 árvores seguem sem
      auditoria linha a linha.

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

**Ficha de personagem** (`/`) — atributos, PV/PM/PT/PP/CA calculados automaticamente, inventário,
Grimório completo, edição livre de qualquer campo, Desfazer, exportar em PDF (Typst) e JSON.

**Árvore de progressão** (`/arvores`) — mapa radial estilo Destiny Board, pan/zoom, compra de
magia/talento reflete na ficha na hora.

**Ferramentas de mesa:** Rolador de dados com macros e atalho de teclado (`R`), Tracker de
iniciativa (`/iniciativa`), Modo Apresentação (`/apresentacao`), Painel do Mestre (`/mestre`).

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
- **`typstFicha.ts` nunca interpola dado dinâmico direto em marcação Typst** — todo valor passa
  por `tstr()` e é impresso via `#valor`, então efeitos com `*`/`_`/`#`/`[` não quebram a
  compilação.
- **A roleta da Via 2 é só decorativa.** O sorteio real (`rollRandomRace`/`rollRandomBackground`)
  já aconteceu antes de girar — a animação SVG só aponta pro resultado com suspense, nunca
  influencia a probabilidade. A regra de **3 tentativas por roleta** (`useWheelSpin.ts`) existe
  pra que raça/antecedente raros continuem raros de verdade: sem ela, girar até sair o resultado
  desejado anularia o peso/raridade que já existe em `RACE_WEIGHT` e nos `rollRange` d100.
