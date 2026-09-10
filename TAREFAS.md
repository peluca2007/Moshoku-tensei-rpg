# Tarefas — 20 frentes abertas

Levantamento de **2026-09-10**, pedido pelo autor ("crie 20 tasks para melhorar/corrigir/revisar/
adicionar algo no site"). O `O-QUE-FALTA.md` continua sendo a lista curta do que já estava combinado;
este arquivo é o mapa maior, e nasce de três coisas: o relato de mesa do autor (compartilhar ficha no
celular é chato, e o link não abriu no iPhone de um amigo), o que o código mostra quando lido de
ponta a ponta, e o que o sistema de RPG ainda não faz.

**Legenda:** ✅ feito · 🔨 em andamento · ⬜ aberto · 🔒 precisa do autor (decisão, aparelho ou mesa)

---

## Estado em 2026-09-10, fim do dia

**As 22 estão endereçadas.** Dezenove entregues, em dezoito versões — da 0.1.17 à 0.1.34. As três que
restam não são trabalho parado: são trabalho que **precisa de você**, e cada uma diz por quê.

| Precisa de | Task | O que exatamente |
| --- | --- | --- |
| Um iPhone | 1 | Confirmar com seu amigo qual dos dois suspeitos era: navegador antigo demais, ou o app cortando o link. A causa provável já foi tratada e tem tela própria. |
| Meia hora de NVDA | 20 | A ordem de foco conta a história certa? dá pra montar um personagem sem enxergar? A parte previsível (rótulos e números anunciados) saiu na 0.1.34. |
| Sua decisão de regra | 22 | O Descanso Curto devolve 25% ou 50% de PM? A tabela do Cap. 4 diz um, o aviso logo abaixo e o Cap. 3 dizem outro — e o argumento do teto de dois Curtos é construído em cima do maior. |

Duas tasks acabaram sendo **corrigidas em vez de executadas**, e vale ler o porquê nelas: a 19 pedia
conteúdo que já existia (e o teste novo impede a terceira afirmação errada sobre o mesmo assunto), e
a 14 partia da premissa de que o PDF era longo demais, quando ele já é A4 desenhado.

--- | --- |
| 1 | Precisa do iPhone do amigo pra confirmar qual dos dois suspeitos era |
| 4 (QR) | Não dá pra **verificar** um QR sem uma câmera. Um QR que desenha mas não lê é exatamente a "funcionalidade que mente" que a própria task manda evitar — e ainda pede uma dependência nova no `package.json` |
| 14 | O PDF do Typst **já é A4 e desenhado**; o que falta é decidir o que CORTAR pra virar uma folha, e isso é escolha de autor |
| 19 | Escrever regra nova no livro é sua voz, não minha |
| 20 | Precisa de meia hora de NVDA com ouvido humano |
| 21 | Esbarra num modelo de dado que só você decide (ver a task) |
| 10–13, 15–18 | São as de **maior impacto**, e você pediu pra deixar pra validar |

Nada foi implementado pela metade pra parecer progresso. Onde parei, está escrito por quê.


---

## Compartilhar ficha — o que o autor relatou

### 1. 🔒 Corrigir o link de ficha que não abre no iPhone — *causa provável tratada na 0.1.19*

Hipótese principal, achada lendo o código: `codificarFicha` sempre marca o corpo como `g:` (gzip), e
`decodificarFicha` chama `descomprimirBytes` → `DecompressionStream`, que **só existe no Safari do
iOS 16.4+** (março/2023). Num iPhone mais velho isso lança `ReferenceError`, o `try/catch` de
`src/lib/fichaLink.ts:85` engole tudo, e a tela devolve "link inválido" — sem dizer que o problema é
o navegador, e sem oferecer saída.

O comentário do arquivo já previu metade disso: "onde o `CompressionStream` não existir, o link ainda
é gerado, só mais longo". Isso cobre o **remetente** sem gzip. O caso real aqui é o oposto:
remetente **com** gzip, destinatário **sem**.

**Feito na 0.1.19:** a ausência é detectada antes de tentar, a tela diz que o problema é o navegador
(e não o link nem a ficha de quem mandou), e oferece as três saídas — atualizar o iOS, abrir em outro
aparelho, ou pedir o arquivo. Vale para ficha e criatura. Há teste simulando o Safari velho.

🔒 **Confirmar com o amigo antes de fechar:** versão do iOS, por qual app o link chegou, e se o link
colado direto na barra de endereço funciona — isso separa "navegador velho" de "app cortou o link".

### 2. ✅ Dizer por que o link falhou, em vez de "inválido" — *0.1.19*

`decodificarFicha` devolve `null` para cinco causas diferentes e a tela trata as cinco igual.
**Feito na 0.1.19** em `lib/diagnosticoDeLink.ts`: cinco motivos, cada um com título, explicação e
saída, e o tamanho do fragmento impresso quando o link chega cortado. 22 testes travam o
comportamento, inclusive o de cada motivo ter título distinto — senão não valeu separar.

### 3. 🔨 Compartilhar pela bandeja nativa do celular — *feito na 0.1.20, falta um celular pra confirmar*

**Feito na 0.1.20** (`lib/compartilharNativo.ts`), na ficha e na criatura: o botão só aparece onde a
API existe, manda o LINK (um link termina com o amigo na tela de importar; um arquivo termina com ele
segurando um `.mtficha` que o telefone não abre), e trata `AbortError` como cancelamento e não como
erro. Quatro testes cobrem ok / cancelado / falhou / navegador sem a API.

🔒 **Falta confirmar num celular de verdade.** O Chrome headless não implementa Web Share, então
nenhuma checagem automática consegue ver esse botão — o que dá pra afirmar é que ele não aparece no
HTML do servidor (conferido) e que a lógica está testada. Se o compartilhamento sair errado no
aparelho, é aqui que se olha.

Ainda em aberto: compartilhar o ARQUIVO por `navigator.canShare({ files })`, que é o único caminho
que leva a foto e a capa junto sem gerenciador de arquivos.

### 4. ⬜ QR Code da ficha, para passar de celular pra celular na mesa

Entre dois celulares na mesma mesa, o caminho mais curto é a câmera. Restrição que precisa ser
respeitada ou o recurso mente: um QR legível em tela de celular aguenta bem menos que os ~2.9 KB
teóricos, e uma ficha de Imperador provavelmente não cabe — medir e, acima do limite, dizer "não
cabe num QR, use o link" em vez de desenhar um QR ilegível. Gerador local: o site funciona offline.

### 5. ✅ Importar colando o link — *0.1.19*

**Feito na 0.1.19:** toda tela de link que falha tem campo de colar, que aceita a URL inteira, o
fragmento sozinho, e — o caso que mais acontece — o link **quebrado em várias linhas**, juntando as
partes (legítimo: base64url não tem espaço nenhum).

O que NÃO dá pra colar é o conteúdo do arquivo `.mtficha`: ele é binário (gzip), não texto. Passar
ficha com foto sem gerenciador de arquivos depende da task 3 (bandeja nativa) ou da 4 (QR).

### 6. 🔨 Medir e declarar o teto de tamanho do link — *medido e declarado na 0.1.19*

**Feito na 0.1.19**, com uma surpresa: o teto do Discord (2.000 caracteres) morde em **três
árvores**, não em cinco — 1 árvore dá ~1.086, 2 dão ~1.594, 3 dão ~2.058. A primeira medição desta
sessão saiu errada por usar uma forma simplificada de `purchasedAbilities`; foi o teste que pegou. A
ficha agora avisa depois de copiar um link grande demais, e um teste falha se o número mudar.

**Ainda falta (🔒):** medir WhatsApp, iMessage e a barra de endereço do Safari do iPhone em aparelho
de verdade. Eles parecem folgados, mas "parecem" não é medida.

---

## Site

### 7. ✅ Rolador de dados em todas as rotas — *0.1.22*

**Feito na 0.1.22:** subiu pro layout raiz. O atalho `R`, o `#dados` do app instalado, os macros e os
pedidos de rolagem do Inventário e do Grimório continuam funcionando — tudo isso já morava fora da
ficha, o que faltava era a montagem.

Colisão conferida: o único outro elemento flutuante do site é o aviso do `DestinyBoard`, que é
centralizado (`left-1/2`) e não disputa o canto; a tarja de `SuporteOffline` é de fluxo, não
flutuante. Print de `/iniciativa` e `/encontros` com o botão no lugar, e as treze rotas seguem em
zero no mobile/a11y/contraste.

### 8. ✅ Testar o `rollEngine` e ensinar o macro a guardar Testes — *0.1.20 e 0.1.21*

**Os 31 testes do motor** entraram sem tocar numa linha do `rollEngine`: viciar o `Math.random` no
teste, em vez de abrir uma costura no código de produção. A fila de dados estoura quando acaba, o que
transforma "o motor rolou mais dados do que devia" em falha com nome. Conferido por mutação: com o
crítico olhando qualquer dado rolado, 3 falham; com o modificador embutido ignorado, 4 falham.

**O macro** virou união de dois tipos (`dano` e `teste`), com migração v1→v2 e uma estrela ao lado do
"Rolar 1d20" que guarda o teste montado. Guarda o modificador já somado, e não a fonte — macro é
atalho de mesa, não pedaço de ficha.

O que sobrou desta frente virou a **task 21**: não dá pra rolar perícia em lugar nenhum do site.

### 9. 🔨 Botão "Instalar app" visível — *feito na 0.1.20, falta instalar num aparelho*

O site **já era instalável** desde a 0.1.15 — manifesto, três ícones, `appleWebApp` pro iOS e três
atalhos de tela inicial. O que faltava era descoberta: só instalava quem caçava "Adicionar à tela de
início" no menu do navegador.

**Feito na 0.1.20** (`components/BotaoInstalar.tsx`), no rodapé — que alcança quem já USA o site, e
não quem chegou agora. Dois caminhos porque são duas plataformas: Chromium guarda o
`beforeinstallprompt` e instala de um toque; o iOS, que nunca dispara esse evento e não tem API de
instalação, recebe a instrução ilustrada com o ícone real de Compartilhar. Some sozinho quando já
está instalado (`display-mode: standalone` ou `navigator.standalone`).

🔒 **Falta o aparelho** — é o item 8 do `O-QUE-FALTA`, e continua valendo: instalar num Android e num
iPhone e conferir o botão, o recorte do ícone pelo launcher, a splash e os três atalhos.

### 14. ⬜ Ficha em uma folha, para quem joga no papel

O PDF do Typst é completo e por isso longo. Falta o oposto: uma folha A4 com o que se consulta dentro
de um turno. Provavelmente um `@media print` da própria ficha, e não um segundo gerador — menos
código, e nunca diverge da tela.

### 20. 🔒 Passar o leitor de tela na ficha inteira — *a parte previsível foi feita; a escuta é sua*

Item 5 do `O-QUE-FALTA`. As dezessete rotas estão em zero no `check:a11y`, o que **não** responde se
a ficha é usável de ouvido.

**Feito na 0.1.34**, que é exatamente o que a própria task previu que sairia ("aria-label com
contexto, aria-live nos números que mudam sozinhos"):

- **"Comprar" agora diz o que está comprando.** Numa grade de 85 itens da loja, um leitor de tela
  anunciava *"Comprar, botão"* oitenta e cinco vezes seguidas — o texto visível basta pra quem
  enxerga o card em volta e não basta pra quem só ouve o botão. Vale também nas árvores e nas magias
  combinadas.
- **Os números que mudam sozinhos passaram a ser anunciados.** O PA gasto muda como consequência de
  uma compra feita em outra tela, e as reservas mudam por botão no meio do turno (então no Modo Mesa;
  desde a 0.1.36, na própria ficha) — nos dois casos, quem só ouve recebia silêncio como confirmação.

**O que continua sendo seu, e não dá pra terceirizar:** meia hora de NVDA respondendo as três
perguntas que nenhum script responde — a ordem de foco conta a história certa (atributos antes dos
derivados)? dá pra montar um personagem do zero sem enxergar? o que soa confuso quando lido em voz
alta em vez de olhado?

---

## Sistema de RPG

### 10. ⬜ Condições clicáveis: ligar a prosa ao glossário

"Envenenado", "Preso", "Caído", "Em Chamas" aparecem na prosa de centenas de habilidades, e o que
cada uma faz mora no glossário do Cap. 4. Quem lê a magia no turno tem que sair dela pra descobrir o
efeito. Virar verbete de verdade em `src/data/` (fonte única), com a prosa reconhecendo o termo — e
um check que acuse condição citada e inexistente, no espírito do `check:texto`.

### 11. ⬜ Condições e aflições como estado vivo da ficha

Depois do glossário virar dado: marcar "Envenenado até o fim do próximo turno" na ficha, ver a
Desvantagem refletida nos números, o `InitiativeTracker` decrementando a duração, e o dano por turno
de Em Chamas entrando sozinho. É a diferença entre um site que **mostra** a ficha e um que joga
junto. Muda schema → migração no `persist` (`useCharacterStore`, hoje `version: 12`).

### 12. ✅ Modo Mesa: a tela única que fica aberta a sessão inteira — *feita na 0.1.27, absorvida pela ficha na 0.1.36*

Ficha, iniciativa, rolador e encontros são quatro rotas, e a mesa alterna entre elas o tempo todo num
celular. Uma tela com só o que se usa **dentro** de um turno: ordem, PV/PM/PT com os botões de gastar,
condições ativas e o rolador. Nada de edição, nada de compra. Tem que funcionar em 320px, de pé, com
uma mão.

**Feita, e depois desfeita — de propósito.** A `/mesa` saiu no ar na 0.1.27 e cumpriu o que esta task
pedia. O que a sessão mostrou é que ela era a **ficha com botões grandes**: as mesmas reservas, as
mesmas condições, e a diferença toda em não precisar digitar no meio de um turno. Manter uma segunda
ficha pra ter botões é caro pelo que entrega, e duas telas do mesmo dado divergem.

Na 0.1.36 a rota foi apagada e o que era só dela foi pra `/ficha`: os passos de −5/−1/+1/+5 em toda
reserva (com o registro de dano do log de sessão pendurado no passo negativo de PV) e a faixa de "de
quem é a vez", que desaparece fora de combate. O pedido desta task continua atendido; o que mudou é
que ele não custa mais uma rota. **Não reconstrua a tela** — se algo dela faltar, o lugar é a ficha.

### 13. ⬜ Painel do Mestre: as fichas do grupo lado a lado

O `/encontros` já simula contra as fichas reais, mas não existe tela que simplesmente mostre o grupo —
PV, CA, resistências, recursos restantes — que é o que o Mestre olha entre dois turnos. Oportunidade
de responder de quebra uma pergunta que hoje ninguém responde: qual dano por turno o grupo inteiro
entrega, contra a régua do Apêndice C.

### 15. ⬜ Descanso e Downtime jogáveis, em vez de escritos

O Cap. 5 tem Downtime, Guilda, Reputação e Crafting com todas as regras, e nada disso é jogável: a
mesa lê e faz a conta no papel. Botão de Descanso Curto/Longo mostrando a conta antes de aplicar, e
Downtime rolável com o resultado entrando na ficha. Isso transforma Reputação e Rank de Guilda de
número parado em sistema.

### 16. ⬜ "Eu aguento isso?" — o simulador na mão do jogador

`combatSim.ts` e `encounterSim.ts` já rodam batalhas de verdade a serviço do Mestre. A pergunta do
jogador é mais simples: "quantos turnos eu aguento contra um Sapo-Lodo? e contra três?". É a
ferramenta que faz alguém **entender** a própria build, usando o mesmo motor que já trava o
Apêndice C — nenhum número novo inventado.

### 17. ⬜ Comparador de builds

Metade do `O-QUE-FALTA` é "jogar e ver", e parte disso dá pra medir antes da mesa. Duas fichas com o
mesmo orçamento de PA lado a lado: dano por turno, PV, CA, alcance, quantas Ações cada uma precisa
pro próprio pico. É o `scripts/simular-combate.mts` com cara de tela, para quem não abre terminal.

### 18. ⬜ Registro de sessão: o site contando o que a mesa mostrou

O `O-QUE-FALTA` pede contas que só saem no papel — a do Vendaval é literal: "conte os ataques corpo a
corpo que **acertaram** o Vendaval". Ninguém faz isso com lápis no meio da sessão, e é por isso que
essas pendências não fecham. O barato é aproveitar o que já acontece: toda rolagem passa pelo
`rollEngine`, e o `InitiativeTracker` já sabe de quem é o turno.

### 19. ✅ Rank Deus das Três Grandes Escolas — *a task estava errada; corrigido em 2026-09-10*

**A premissa desta task não se sustentou.** Ela dizia que o critério de ascensão das três escolas do
Corpo existia "só como comentário em `rankDeus.ts`" e precisava ser escrito no livro.

Ele já estava escrito, e o livro já o imprimia. As três têm entradas inteiras em `GODHOOD_PATH`, com
as chaves batendo com os ids das árvores: *"E o Deus da Espada?"*, *"O Caminho para Deusa da Água"*,
*"O Estilo mais Barato de Ser Rei"*. O que elas não têm é o **quadro** do que o patamar FAZ — porque
nelas o Deus é um cargo com titular vivo, não um nível de poder pessoal.

Ou seja: eu escrevi uma task pedindo conteúdo que já existia, dois dias depois de o `PROGRESS.md` ter
registrado outra afirmação errada sobre o mesmo assunto (que o Vendaval não teria o quadro — tem). As
duas têm a mesma causa: a informação mora em **dois mapas** (`RANK_DEUS` e `GODHOOD_PATH`) e só o
acessor os une, então dá pra abrir o arquivo e não ver.

**O que foi feito, então:** nada de conteúdo novo — inventar lore aqui seria pôr palavra minha na sua
canon. Em vez disso, `src/data/rankDeus.test.ts` passa a responder a pergunta por execução (nenhuma
das dezenove pode ficar sem patamar Divino escrito), o cabeçalho do dado passa a dizer onde cada
coisa mora, e as três afirmações erradas foram corrigidas no `PROGRESS.md` e no `O-QUE-FALTA.md`.

**Se você quiser mesmo mais texto** — o que um Deus da Espada precisa fazer, em detalhe — isso é
escrita sua, e continua em aberto por escolha, não por esquecimento.
