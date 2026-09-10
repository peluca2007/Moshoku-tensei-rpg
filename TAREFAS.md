# Tarefas — 20 frentes abertas

Levantamento de **2026-09-10**, pedido pelo autor ("crie 20 tasks para melhorar/corrigir/revisar/
adicionar algo no site"). O `O-QUE-FALTA.md` continua sendo a lista curta do que já estava combinado;
este arquivo é o mapa maior, e nasce de três coisas: o relato de mesa do autor (compartilhar ficha no
celular é chato, e o link não abriu no iPhone de um amigo), o que o código mostra quando lido de
ponta a ponta, e o que o sistema de RPG ainda não faz.

**Legenda:** ✅ feito · 🔨 em andamento · ⬜ aberto · 🔒 precisa do autor (decisão, aparelho ou mesa)

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

### 7. ⬜ Rolador de dados em todas as rotas

`DiceRoller` só é montado dentro de `CharacterSheet`, então só existe em `/ficha` — mas no meio do
combate a pessoa está em `/iniciativa` ou `/encontros`. Subir pro layout mantendo o atalho `R`, o
`#dados` do app instalado e os pedidos de rolagem do Inventário e do Grimório. Cuidar de não cobrir
controle de outra rota (a tarja de `SuporteOffline` já teve esse problema).

### 8. 🔨 Testar o `rollEngine` e ensinar o macro a guardar Testes — *31 testes feitos; falta o macro*

Item 11 do `O-QUE-FALTA`. O motor que decide toda rolagem da mesa não tem um teste, enquanto o
`selectors.ts` ao lado tem 570 linhas travando fórmulas. E `RollMacro` é `{id, label, formula}`, então
não dá pra salvar "Furtividade com Vantagem" — metade do que se repete numa sessão. Testes primeiro
(risco zero, e viram a rede de segurança); o formato do macro depois, com migração de verdade.

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

### 20. 🔒 Passar o leitor de tela na ficha inteira

Item 5 do `O-QUE-FALTA`. As treze rotas estão em zero no `check:a11y`, o que **não** responde se a
ficha é usável de ouvido. Meia hora de NVDA: a ordem de foco conta a história certa? "Comprar"
anuncia o que está comprando? dá pra montar um personagem sem enxergar?

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

### 12. ⬜ Modo Mesa: a tela única que fica aberta a sessão inteira

Ficha, iniciativa, rolador e encontros são quatro rotas, e a mesa alterna entre elas o tempo todo num
celular. Uma tela com só o que se usa **dentro** de um turno: ordem, PV/PM/PT com os botões de gastar,
condições ativas e o rolador. Nada de edição, nada de compra. Tem que funcionar em 320px, de pé, com
uma mão.

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

### 19. 🔒 Escrever no livro por que Espada, Água e Norte não têm Rank Deus

Dezesseis árvores têm o quadro; três não têm, e isso é deliberado — as Três Grandes Escolas do Corpo
têm critério próprio de ascensão. O motivo existe **só** como comentário em `src/data/rankDeus.ts`, e
o `PROGRESS.md` já registrou a ausência como pendência uma vez, justamente porque a justificativa não
estava em lugar visível. Escrever o critério no livro é conteúdo novo de regra: é do autor.
