# Patch Notes

Histórico de mudanças de regra, balanceamento e sistema do RPG de Mushoku Tensei.
As mesmas notas aparecem dentro do site, em `/livro`, geradas de `src/data/patchNotes.ts`.

---

## 0.1.12 — "O Que a Régua Não Media" · 2026-09-04

### 📐 O Corpo virou medição, e a Magia estava certa desde sempre

O `check:arvores` de 0.1.11 acusava **11 células** e dizia, honestamente, que não confiava em seis
delas: as do Corpo saíam marcadas como PISO porque o **Dado de Arma** — que é o golpe base de toda
árvore marcial — não entrava na conta. As onze caíram para zero, e nenhuma delas caiu por um nerf.

**As seis do Corpo eram o medidor.** Faltavam três coisas, e a terceira é a que dói:

- `weaponFormula.ts` lê as fórmulas em português do catálogo do Corpo, com a distinção que o livro
  faz e que um parser de `NdM` não vê: **"arma normal"** invoca a fórmula inteira (dado + atributo +
  Bônus de Rank), **"rolado N vezes"** invoca só os dados. Duas técnicas escrevem "+ Força + Bônus de
  Rank" com todas as letras, e é isso que prova que a omissão nas outras é deliberada. Tem 18 testes.
- `ARMA_DE_REFERENCIA` declara qual arma o auditor assume por árvore — a premissa que faltava, agora
  escrita e discutível. O critério é o maior Dado Base que a proficiência daquela árvore permite,
  porque generoso é o lado seguro num teste que só dispara pra baixo.
- **O ataque comum.** Nenhuma árvore declara "Atacar com Arma (1 Ação)" como habilidade, porque é
  regra do Cap. 4 e não técnica de árvore. O medidor lia o guerreiro como alguém que só sabe usar
  técnica. Três ataques comuns já passam das seis colunas acusadas — era ele, não as técnicas.

E a **quarta Ação**: Espada (do Avançado), Norte, Lutador e Arquearia (do Imperador) ganham uma Ação
extra por Maestria. O Apêndice C avisa que já conta com isso na coluna da Espada; medir com três era
comparar contra uma régua calibrada com quatro.

**As cinco da Magia eram o medidor lendo a metade errada da tabela.** O Apêndice C diz, no próprio
aviso dele: *"Magia não está amortizada pelas Ações. O Sol Menor aparece como ~130, mas entrega ~65
por turno."* A coluna de Magia é o dano CHEIO da maior magia, e o leitor é quem divide — o script
dividia antes de comparar. As cinco células acusadas eram exatamente as cinco escolas cuja maior
magia custa 4, 5 ou 6 Ações:

| Célula | A régua promete | Dano cheio | Amortizado (o que o script comparava) |
| --- | --- | --- | --- |
| Fogo 4º | ~62 | Mar de Chamas 56 | 28 |
| Água 5º | ~54 | Relâmpago 57 | 28 |
| Fogo 5º | ~90 | Flashover 79 | 39 |
| Vento 5º | ~70 | Grito do Mundo 68 | 34 |
| Terra 6º | ~105 | Rio de Magma 101 | 50 |

Cinco colunas caindo dentro de 3% a 12% do dano cheio e nenhuma dentro de 40% do amortizado não é
coincidência: é a régua declarando como foi calibrada. **A régua estava certa, as árvores estavam
certas, e o medidor estava errado.** No Corpo a amortização continua valendo, porque ali a coluna é
dano por turno de verdade.

Um defeito de acabamento junto: `NUNCA_AUDITADAS` guardava os NOMES das árvores e não os `id` de
`src/data/trees`, então o marcador "[nunca auditada]" só acendia em duas das nove — e justamente as
sete que mais precisavam do aviso saíam sem ele. Agora o script recusa subir se um id não existir.

### 🔍 Um script que lê texto

A dívida da "auditoria linha a linha" carregava uma ressalva: *"leitura manual ainda é o que pega
texto de habilidade errado, e o script não lê texto."* Agora existe `npm run check:texto`, e ele lê
as **592 habilidades e talentos** conferindo a prosa contra os campos. Ele não substitui a leitura —
nenhum programa julga se uma técnica é divertida. Ele faz o que a leitura faz PIOR: quem lê 400
cartas perde a que diz "2 Ações" com `actions: 1` na terceira hora.

O que ele achou na primeira execução, tudo corrigido:

- **Duas evoluções do filhote eram invendáveis.** `Evolução: Forma Média` e `Evolução: Sentidos
  Aguçados` exigiam `pacto-filhote-evolutivo`, um id que não existe — o talento se chama
  `pacto-filhote`. Com o pré-requisito apontando pra lugar nenhum, a compra nunca liberava, em
  silêncio, desde que foram escritas.
- **Passo de Vento** abria com "1 Ação:" e cobrava 2 pela tabela do Cap. 2. Sem `costNote`, o campo é
  a regra; quem estava errado era a frase, escrita antes da tabela.
- **Três Reações que a carta não anunciava.** `O Primeiro Segredo`, `O Segundo Segredo` e
  `Redirecionar` são Reações no campo e não diziam isso no texto — quem lê a ficha na mesa não vê o
  campo.
- **Duas perícias prometidas sem lugar pra existir.** `Primeiros Socorros de Campo` diz "concede a
  perícia Medicina" e `Leitura de Rastro` diz "você ganha Sobrevivência e Percepção" — e não havia
  onde gravar: `grantedSkills` é da ÁRVORE, e só vale se ela for a Inicial. O jogador comprava a
  técnica e a perícia não aparecia em tela nenhuma. Virou o campo `grantsSkills`, com o motor e os
  testes junto.
- **25 textos com markdown cru.** O Punho do Fogo era a única das dezenove que escrevia
  `**Ganha 2 de Calor**`, e nada no projeto renderiza negrito — a mesa lia os asteriscos.

Duas regras do script nasceram erradas e foram corrigidas ANTES de virar relatório, o que é o teste
que uma régua nova precisa passar: a de alcance acusou dez falsos positivos de dez ("avance 6m",
"empurrado 3m" — deslocamento, não alcance), e a de PV acusou 21 patamares em 19 árvores por repetir
o dado do anterior, quando repetir por dois patamares é a cadência normal do livro. Vinte e um
defeitos na primeira execução não é um livro quebrado; é a régua errada.

### 🌪 A Distância Roubada, medida

O Vendaval pedia validação de mesa, e o simulador continua sem modelar posicionamento. O que dava
pra fazer sem mesa era fechar a conta — e ela **muda a pergunta**. O teto é 18 metros, atingido no 5º
patamar, e custa 1 das 3 Ações em todo patamar. A própria árvore já bate mais longe sem a mecânica:
`Arremesso Cortante` faz 18m no 1º patamar e `Golpe que Não Tem Origem` faz 27m no 5º.

O que a Distância Roubada dá de único é o ataque continuar sendo **corpo a corpo**, o que carrega
junto a Vantagem de Estilo. Então a pergunta pra mesa não é "18 metros é demais". É: **o Vendaval
alguma vez apanha?** Se o inimigo nunca revida, o custo declarado da árvore — "não tem parede, não
tem contra-ataque, não tem PV pra trocar golpe" — nunca é cobrado. Isso se mede numa sessão:
conte os ataques corpo a corpo que ACERTARAM o Vendaval e compare com o outro da linha de frente.

De quebra, uma ambiguidade que a mesa encontraria no primeiro combate: a Maestria de Intermediário
diz que movimento de REAÇÃO conta para a Distância Roubada, mas Reação acontece no turno do inimigo e
a regra base zera a distância no fim do turno — do jeito que estava escrito, a Maestria não fazia
nada. O texto agora diz que essa parcela é a única que sobrevive à virada de turno.

### 📸 Foto de perfil e capa nas fichas

A frente que estava documentada e não implementada desde 2026-09-03, com as decisões que o
`PROGRESS.md` deixou em aberto agora tomadas:

- **A imagem mora dentro da ficha, em base64.** Guardar só uma URL faria "exporte o JSON pra levar
  pra outra máquina" virar mentira: a ficha chegaria do outro lado apontando pra um arquivo que não
  existe lá.
- **Reduzir no cliente é obrigatório, e o teto é duro.** A imagem é redesenhada num canvas dentro do
  lado máximo (512px pra foto, 1200px pra capa) e comprimida em degraus de qualidade ATÉ caber num
  teto de bytes. Se não couber nem no último degrau, a função recusa com uma frase que diz o que
  fazer — em vez de gravar e estourar a cota do `localStorage` depois, no meio de um `setItem` que
  levaria junto as fichas que já estavam salvas.
- **O link de compartilhar NÃO leva as imagens.** JPEG já é dado comprimido e o gzip do link não tira
  quase nada dele: uma foto de 60 KB viraria ~80 000 caracteres de URL. Navegador, Discord e WhatsApp
  cortam links muito antes disso — mandá-las junto não daria um link grande, daria um link QUEBRADO,
  que parece pronto ao ser copiado e chega inútil. O JSON exportado continua levando tudo, e a ficha
  avisa isso na tela.
- **Imagem que vem de fora é saneada.** JSON importado e link de terceiro passam por uma checagem que
  só aceita `data:image/` dentro do teto. Um `portrait` apontando pra `https://…` faria o navegador
  de quem abre a ficha entregar o IP dele a um servidor que ele nunca escolheu.
- **O PDF imprime o retrato.** A decisão que estava em aberto ficou em imprimir: a rota do PDF já
  recebe a ficha inteira pra compilar o Typst, então a foto não abre um caminho novo — e o PDF existe
  pra ser levado impresso pra mesa, que é onde um retrato vale mais.

O `/personagens` ganhou a foto no card (com o brasão da raça como alternativa, não como degrau menor)
e **barras de PV/PM com o número junto**. Barra sozinha comunica proporção e esconde escala — "meio
cheia" é a mesma imagem com 6 PV e com 60, e a decisão de mesa é sobre a escala.

### ♿ Acessibilidade que dá pra medir

Três checagens novas, todas rodando num Chrome de verdade porque as três coisas que elas medem não
dá pra ver em print. A primeira lição foi essa: os primeiros prints desta série saíram com perfil de
cor aplicado, e um botão `wine-600` (#4a0e2e) apareceu como #7d505e — o suficiente pra eu "achar" um
defeito de contraste que não existia, e quase corrigi-lo.

- **`check:contraste`** mede as 9 rotas nos 2 temas contra o WCAG AA. Achou 6 defeitos reais, todos
  corrigidos: `text-parchment-400` como texto de apoio no tema claro (1,99:1), `text-teal-500` no
  acento da Magia (2,21:1), as etiquetas de Rank da Loja (3,80:1), e — o mais caro — `opacity-70`
  usado pra apagar item bloqueado, que puxa TEXTO e fundo juntos na direção do pergaminho e derrubava
  128 textos da Loja de 5,6:1 pra 3,0:1. O apagamento virou recuo de cor e saturação, não de
  opacidade: de longe a leitura é a mesma, de perto ela existe.
- **`check:mobile`** impõe a largura por dentro do navegador, o que é o ponto: recortar uma janela de
  500px em 360 mostra o que caberia em 360, não o que o CSS FAZ em 360 — media query não dispara,
  flex não recalcula, `<select>` não encolhe. Achou dois transbordos, e os dois eram a mesma
  armadilha de flexbox (item de flex tem `min-width: auto` e não encolhe abaixo do conteúdo, então
  `flex-1` sem `min-w-0` não encolhe nada): a linha de "nova perícia" da ficha empurrava 39px em
  320px, e o importador da iniciativa empurrava 41px em **360px** — a largura de metade dos Androids.
- **`check:a11y`** achou o que um leitor de tela encontra: `/ficha` era a única rota sem `h1` (o nome
  do personagem é um `<input>`, e input não é cabeçalho), `/livro` tinha oito `h1` porque cada
  capítulo abria um, cinco campos sem rótulo associado, e o `<input type="file">` escondido do
  importador, que o Tab visitava e o leitor anunciava como campo sem nome.

E o **tamanho da letra ficou ajustável**, que era metade do item. O caminho de verdade não foi o
botão: foram as **68 legendas escritas em pixel cravado** (`text-[11px]`, `text-[10px]`), que não
obedecem ao tamanho de fonte do navegador. Quem aumenta a letra nas configurações do celular — que é
como uma pessoa com baixa visão usa QUALQUER site — via todo o resto crescer e justamente as legendas
ficarem do mesmo tamanho. Em `rem` elas crescem junto. O botão de três degraus na barra existe por
cima disso, pelo mesmo motivo do botão de tema: ninguém abre as configurações do Chrome no meio de um
combate pra passar o celular pro vizinho ler.

### ⚖️ O Apêndice C ganhou três colunas, e duas árvores ganharam dano

A tabela tinha UMA coluna chamada "Utilidade" para as três árvores da categoria, e a razão era
constrangedora: **duas delas não tinham dano nenhum pra medir.** Só o Ladino tinha — e ainda assim
escondido, porque o Dano Furtivo dele vive na Maestria de 1º patamar e não num campo `damage`, então
nenhuma conta do projeto o enxergava. Uma coluna para três árvores diferentes é uma coluna que não
descreve nenhuma delas.

Separar exigia ter o que medir, e o molde já existia dentro da própria categoria — um número que
escala por patamar, declarado na Maestria de 1º, sem uma habilidade nova por rank:

- **Dissonância** (Bardo): uma vez por turno, ao usar uma habilidade da árvore, cada hostil que te
  OUÇA sofre 1d4 por patamar. A fraqueza declarada da árvore cobrada no dano — quem não ouve não
  sofre, e criatura sem emoção também não.
- **Ordem de Tiro** (Tático): uma vez por turno, sem gastar Ação, aponte um alvo; o primeiro ataque
  de **aliado** que acertar causa +1d6 por patamar. É a única coluna do livro que não sai da arma de
  quem a lê.
- **Dano Furtivo** (Ladino): já existia. O que mudou é que agora ele é medido.

As três agora aparecem no `check:arvores` com arma de referência própria, e o relatório imprime
`d6 → d6 no 6º` para elas — a forma mais curta de dizer que árvore de Utilidade não recebe degraus
de Dado de Arma (Cap. 3), e que é por isso que elas ficam pra trás sem precisar de nenhuma regra que
as puna.

A ordem entre as três colunas não é acidente: o **Ladino** é o maior, porque a árvore dele diz em
texto que é "a única árvore de Utilidade com dano de verdade"; o **Bardo** é o menor, porque o dano
dele é efeito colateral de uma habilidade social e cobra área em troca; o **Tático** fica no meio.
Todas as três ficam entre 49% e 73% do teto medido — folga proposital, porque a coluna é média
contra CA razoável e o teto ignora chance de acerto.

Também subiram, como pedido:

- **Desintoxicação**, pouco: Sangria 3d6→4d6, Corrosão 3d6→5d6, Sopro Podre 6d8→8d8. Sangria e
  Corrosão estavam empatadas em 11 apesar de três ranks de distância.
- **Escudos**: Golpe de Escudo 1d8→2d8, a versão Soberana 2d8→3d8. A coluna sobe de ~7–18 para
  ~10–27 e **continua sendo a menor do livro**, que é o ponto: o Escudeiro bate, mas bater não é o
  trabalho dele.

### 🐺 O Invocador estava cobrando PA pra ligar a árvore

A Maestria de 1º patamar ensinava a fechar Pactos e a desenhar círculos — e não invocava. Invocar
era uma habilidade comprada (`Chamado`, 2 PA). Na prática isso significava que um invocador que
gastasse o PA todo em Pactos ficava com um caderno de acordos e nenhuma forma de chamar ninguém.

**Invocar virou a Maestria:** círculo preparado (10 minutos, fora de combate) e 3 PM, sem PA nenhum.
Piso de escola não se compra.

O que era o `Chamado` virou o **Chamado de Emergência** (mesmo id, pra não órfãozar ficha salva):
**3 Ações e 6 PM**, sem círculo, no meio da luta — e o invocado chega com **metade dos PV e metade do
dano**, porque foi chamado às pressas. As 3 Ações são o turno inteiro de propósito: se essa
habilidade custasse o padrão do rank, o círculo de 10 minutos não teria função e a fraqueza declarada
da escola deixaria de existir.

Dois talentos novos no 1º patamar destravam as duas metades do preço, separadamente:

- **Círculo Improvisado** (o antigo "Invocação de Emergência", id preservado): baixa para 3 PM.
- **Pacto Firmado**: tira a penalidade — o invocado chega inteiro.

E um terceiro resolve a pergunta que toda mesa faz: **Ordem Partilhada** deixa você ceder uma das
suas 3 Ações a um invocado, sem custo de PM. É a única forma de um invocado agir duas vezes no mesmo
turno, e o preço é você agir uma vez a menos.

Porque a regra que faltava estava escrita agora com todas as letras: **um invocado age com 1 Ação e
1 Reação por turno** — as dele, não as suas três. Ele não é um segundo personagem seu; é um aliado
que obedece.

O 1º patamar também ganhou **três Pactos novos**, mais fortes que o Filhote e claramente abaixo dos
de Intermediário: **Cão de Caça** (mordida 2d6, faro, pode Derrubar), **Corvo Mensageiro** (bico 1d6,
voo, entrega recado e empresta a linha de visão) e **Fogo-Fátuo** (não ataca; marca um alvo e o
próximo ataque de aliado contra ele tem Vantagem). O Filhote continua sendo o mais fraco dos quatro
**de propósito** — é o único que evolui, e no Avançado ele passa todos os outros.

De quebra, um pré-requisito quebrado: o talento `Convocação Aprimorada` do Avançado dizia "Requer
Convocar sob Pressão", um talento que nunca existiu em lugar nenhum do livro.

### 📦 Um arquivo de ficha no lugar do JSON

Passar a ficha adiante tinha dois caminhos, e o de arquivo envelheceu no dia em que a ficha ganhou
foto e capa: base64 é texto, e uma ficha com as duas passava de **350 KB de JSON** — quase tudo
caracteres de base64. Mandar isso pro Mestre funciona e é feio.

O botão agora baixa um **`.mtficha`**: as imagens são reencodadas *para compartilhar* (capa 640px,
foto 256px — quem exporta continua com as grandes na própria ficha) e o resto vai comprimido em gzip.
Medido numa ficha com capa de 1200px e foto de 512px: **464 KB de JSON viraram 40 KB**, com as duas
imagens dentro.

O formato é `MTF1` + gzip(JSON), e o prefixo existe pra que a importação saiba o que chegou **sem
adivinhar pela extensão** — um `.json` exportado semana passada continua entrando normalmente. Ficha
de mesa não se abandona por causa de formato.

O **link** continua existindo e continua sem imagem, porque nenhuma das duas otimizações o salva:
mesmo reduzida, uma capa de 640px vira ~55 000 caracteres de URL, e navegador, Discord e WhatsApp
cortam muito antes disso. Os dois caminhos passaram a ter papéis distintos em vez de competirem: o
link é o rápido, o arquivo é o completo.

### 🖼 A foto do personagem chegou em `/encontros`

O montador de encontros mostrava o brasão da ÁRVORE INICIAL no card de cada ficha do grupo — o que
significa que os dois magos de Água da mesa apareciam com o mesmo emblema. O Mestre monta o encontro
olhando pros jogadores dele; agora o card mostra a foto quando existe, e cai no brasão quando não.

### 🎨 Estética

- **O favicon virou um brasão.** A ressalva de 0.1.11 dizia que em 16px o letreiro inteiro vira
  mancha e que legibilidade ali pediria um símbolo. O símbolo chegou pronto — o brasão dourado de
  asas e olho — e o `gerar-favicon.mjs` passou a rasterizá-lo.

  Ele chegou como **JPEG**, e JPEG não tem canal alfa: o quadriculado de transparência do editor de
  imagem veio *queimado nos pixels*, como duas cores cinza de verdade (#EBEBEB e #BFBFBF). Publicado
  como estava, o ícone sairia com o xadrez em volta. O script agora apaga esse fundo antes de medir
  o recorte, e a regra é dupla de propósito — um pixel só é fundo se for CINZA (os três canais quase
  iguais) **e** cair perto de um dos dois tons. O dourado do brasão é saturado e nunca é cinza,
  então nenhuma parte do desenho satisfaz a primeira condição. Foram 82% dos pixels.

  A arte-fonte saiu de `public/` e foi pra `assets-fonte/`, seguindo a regra que o
  `logo-sem-fundo.mjs` já tinha escrita: matéria-prima de build não é asset de site. Deixada lá, ela
  ficaria servível por URL — 1,9 MB baixáveis por qualquer visitante, concorrendo por engano com o
  ícone bom.
- **A capa da ficha não usa o filtro das faixas.** `sepia(0.5) saturate(0.6)` existe pra puxar arte
  de terceiros pro âmbar da paleta; aplicá-lo à foto que o jogador escolheu repinta a escolha dele
  até ela sumir. O véu de contraste continua, porque a lição de 0.1.10 é que filtro depende de quão
  clara a arte é e véu não.

---

## 0.1.11 — "O Grupo Inteiro num Link" · 2026-09-04

### 🔗 Ficha por link

Passar uma ficha adiante eram cinco passos: exportar JSON, achar o arquivo, mandar, o outro baixar,
importar — uma vez por jogador, toda vez que alguém mudava alguma coisa. O montador de encontros depende
de ter o grupo carregado, então o atrito estava exatamente no caminho da funcionalidade mais cara do site.

A ficha agora cabe num link. Ela vai comprimida (gzip + base64url) no **fragmento** da URL, não na query:
o fragmento nunca é enviado ao servidor, então a ficha de um personagem não aparece em log de acesso, em
analytics nem no `Referer` de um link clicado depois. Como o site não tem backend de fichas — elas vivem
no `localStorage` —, mandar o dado pro servidor seria dar a ele uma informação que ele não quer ter.

`/ficha/importar` mostra de quem é a ficha e **espera o clique**. Ela não importa sozinha: o link veio de
outra pessoa, e uma página que grava no navegador do visitante só por ele ter clicado é uma página que
enche o roster de alguém com fichas que ele não pediu.

### 🎭 A Entrevista deixou de repetir

O banco tinha 14 perguntas de 4 respostas, e o sorteio pegava 10 perguntas — mas as respostas eram sempre
as mesmas quatro. Quem fizesse a Via 3 duas vezes reconhecia as opções de cor e escolhia por memória, não
por leitura.

Agora são **20 perguntas com 6 respostas cada**, e o sorteio pega 10 perguntas e 4 das 6 respostas de cada
uma. Nem a pergunta que mais pesaria pra sua build, nem a resposta, têm garantia de aparecer — a mesma
promessa que a Roleta já fazia.

O teste novo pegou um bug que nenhum print pegaria: doze das respostas que escrevi empurravam ids de
**subtabela** (`odio`, `telepatia`, `veias-abertas`…) como se fossem antecedentes. A loteria sorteia entre
`BACKGROUNDS`, então essas respostas teriam peso **zero em silêncio** — pareceriam funcionar e não fariam
nada. Cada dom virou o antecedente-pai que abre a subtabela dele.

### 📐 Auditoria automatizada das árvores

`npm run check:arvores` mede o **teto do turno** de cada árvore em cada patamar — quanto ela causa gastando
as 3 Ações da melhor forma que o patamar permite, com os golpes acumulados dos ranks anteriores e os de 4+
Ações amortizados — e compara com a coluna do Apêndice C. O `check:livro` já verificava o piso; o teto é o
lado perigoso, porque uma coluna pode prometer 40 e a árvore entregar 12 sem nada perceber.

Duas decisões de honestidade do medidor:

- O BC usa o atributo que o próprio Apêndice C declara ("progredindo de 4 até 8"). Ignorar isso foi o
  primeiro erro do script e produziu ~50% de desvio em **toda** coluna alta — desvio uniforme em tudo
  denuncia o medidor, não o dado.
- Árvores do **Corpo** saem numa lista separada, marcadas como PISO e nunca como falha: o golpe base delas
  é o Dado de Arma escalado por Maestria, que o script não modela. Inventar um número plausível ali daria
  um relatório mais bonito e menos verdadeiro.

Resultado: **5 células de Magia** pra conferir (Fogo 4º e 5º, Água 5º, Vento 5º, Terra 6º) e 6 pisos de
Corpo pra olhar — lista curta no lugar de 400 magias.

### 🎨 Estética

- **As duas faixas de baixa resolução foram trocadas** (mesmo dia). `loja.jpg` era 600×279 e `livro.jpg`
  525×350, contra 960–1900 das outras seis — elas amaciavam em tela larga, que é onde a faixa é grande.
  A loja saiu de uma arte de 3840px e agora é a **maior das oito: 1600×794**. O livro subiu pra **680×384**
  e continua sendo o menor do conjunto — a imagem encontrada não tinha mais que isso, e ampliar não cria
  detalhe.
  *A arte da loja não entrou inteira: o original é uma prancha de concept art com o título e dois créditos
  do autor impressos nos cantos, além de margem creme nas quatro bordas. A faixa é o recorte
  `3294×1635 @ (191, 796)` do original, que fica só com o salão — texto e margem ficam de fora. O original
  está em `assets-fonte/originais/` (ignorado pelo git, como o `.recusadas/`) pra permitir outro recorte
  sem procurar a imagem de novo.*
- **O favicon virou a marca nova.** `src/app/icon.png` é gerado por `gerar-favicon.mjs`, que recorta pela
  caixa real do letreiro (a arte ocupa 15% do quadro), reduz por média de área (traço fino some com
  amostragem simples) e compõe sobre `parchment-950`. O `icon.svg` antigo foi removido: com os dois
  presentes, cada navegador escolhe um e a aba mostra marcas diferentes por máquina.
  *Ressalva declarada: em 16px o letreiro inteiro vira mancha. Legibilidade nesse tamanho pediria um
  símbolo — o olho dourado do "O" de Mushoku é o candidato —, e isso é decisão de design.*
- **Cabeçalho de rota legível no tema claro** — ver 0.1.10; o bug só apareceu quando forcei o tema claro
  num print, porque o Chrome headless segue o tema do SO e todos os anteriores saíram no escuro.
- **`public/logo.svg` saiu** de `public/` (foi pra `assets-fonte/`): com o favicon novo, ele não era mais
  fonte de nada servido. `check:livro` passou a conferir a marca atual e a textura de fibra no lugar dele.

### 📄 README

Os badges diziam **regras 0.1.0** (estava em 0.1.10) e **35 testes** (são 96) — e é a primeira coisa que
alguém vê ao abrir o repositório, que é justamente o link que o rodapé do site agora aponta. A tabela de
scripts não citava metade dos comandos, e a de rotas não tinha `/ficha/importar`.

---

## 0.1.9 — "Sem Arestas" · 2026-09-04

### 🌫 A faixa de convite estava mascarando a coisa errada

0.1.8 mascarou a IMAGEM e depois pôs um véu radial por cima dela. A arte sumia nas pontas como devia — mas
o véu era um retângulo opaco, e era **ele** que desenhava as duas linhas horizontais duras que faziam a
seção parecer um bloco colado na página. Mascarar a arte não adianta enquanto a caixa de cor continuar lá.

Agora arte e véu vivem dentro do **mesmo `<div>` mascarado**: os dois desaparecem juntos. No centro a faixa
tem imagem e escurecimento suficientes pra segurar o texto; nas quatro bordas ela simplesmente deixa de
existir, porque não há nada ali além do pergaminho da página. Os filetes dourados saíram junto — filete
marca justamente a aresta que esta seção não quer ter.

Para isso, `.faixa-arte` foi partida em duas: **`.arte-ambiente`** carrega só o tratamento de cor (sépia,
dessaturação, brilho) e **`.faixa-arte`** acrescenta a máscara de baixo. As duas andavam juntas numa classe
só, e isso obrigava toda arte de ambiente a morrer do mesmo jeito — o que serve para o cabeçalho de rota,
onde a borda inferior é aresta de card real, e não serve para uma faixa que atravessa a página inteira.

### 🌫 Correção do degradê da faixa (0.1.10, mesmo dia)

A primeira tentativa usou uma ELIPSE, e as duas linhas duras continuaram lá. O motivo é aritmético: com
raio vertical de 92% da altura, a borda de cima fica a 54% do raio, e a rampa da máscara só ia de 28% a
80% — ou seja, ela chegava na borda ainda com METADE da opacidade. Uma máscara que não chega a zero dentro
da caixa não dissolve nada; ela só desenha uma borda mais clara, que foi exatamente o que o print mostrou.

Agora é `linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)`. Linear
resolve porque `transparent 0%` e `transparent 100%` são, literalmente, as bordas — não há como sobrar
opacidade nelas. E é a forma certa pra uma FAIXA: ela atravessa a página de lado a lado e desaparece só na
vertical, em vez de virar uma mancha oval no meio da tela. O véu acompanha a mesma curva.

### 🔦 Um bug que só o tema CLARO tinha

Todos os prints desta série saíram no tema escuro — o Chrome headless segue o tema do SO, e o do meu lado
está escuro. Forçando o claro, o cabeçalho de `/arvores` apareceu **ilegível**: título `parchment-900`
sobre o campo estelar, que é quase preto. O filtro de `.faixa-arte` dessatura e ESCURECE, o que funciona
enquanto a arte é clara; escurecer um preto não faz nada.

O `PageHeader` ganhou um véu (`bg-parchment-50/72` no claro, `bg-parchment-950/45` no escuro). Filtro
depende de quão clara a arte é; véu não — ele garante o piso de luminância que o texto precisa, qualquer
que seja a imagem que entrar ali amanhã.

### 🪧 A logo, de novo

`h-48 sm:h-72` na landing, `h-14` na barra, `h-20` no rodapé — mais 30% sobre 0.1.8. E a faixa de convite
ganhou respiro vertical (`py-24 sm:py-32`), que é o espaço de que o degradê precisa pra acontecer: máscara
suave em caixa baixa vira máscara dura.

---

## 0.1.8 — "Seis Portas" · 2026-09-04

### 🚪 A vitrine da landing dobrou

Eram três destinos — árvores, loja, livro — e metade do site continuava invisível pra quem chega: a ficha,
o roster e o montador de encontros (que é onde o Mestre passa o tempo dele) só apareciam como texto numa
lista de bullets embaixo. Agora são **seis**, cada um com a arte da própria rota, na ordem de uso:
descobrir o sistema → fazer a ficha → equipar → guardar o grupo → o lado do Mestre → a referência.

`/criar` fica de fora de propósito: ela já é o botão grande do topo, e repetir o CTA principal dentro da
vitrine enfraquece os dois.

Os cards de "recursos" caíram de quatro para três junto: "Feito pra mesa de verdade" descrevia o tracker e
o montador de encontros, que agora têm card próprio — dizer a mesma coisa duas vezes na mesma página só
ensina o leitor a pular a segunda. Os três que sobraram são as afirmações que **nenhuma rota faz sozinha**.

### 🔥 A faixa de convite deixou de ser um recorte colado

Ela tinha duas camadas — a arte e um véu chapado — e o resultado era corte reto em cima e embaixo,
laterais que simplesmente terminavam, e a tocha do grupo brilhando por trás da linha de texto. Agora são
quatro, e nenhuma é enfeite: a arte tratada, uma **máscara radial** que faz a imagem morrer no pergaminho
em vez de encostar numa borda, um **véu em degradê** (denso no meio onde o texto está, aberto nas pontas
onde a arte pode aparecer) e os dois **filetes dourados**, a mesma aresta de luz que todo `.surface-raised`
do site tem.

### 🪧 A logo cresceu

40% maior na landing (`h-40 sm:h-56`), na barra e no rodapé. Ela tinha ficado tímida quando perdeu o
cartucho — sem a moldura, o mesmo `h-*` lê menor do que lia antes.

### 🧹 Segunda faxina

- **`public/logo-dark.svg` apagado.** Ele era a variante de tema escuro do logo antigo; desde que a marca
  virou `logo-real-alfa.png`, nenhum componente o importava. O script que o gerava virou
  `scripts/gerar-favicon.mjs` e agora produz só o que ainda tem uso: o favicon.
- **`logo-real.png` (1,3 MB) saiu de `public/`** para `assets-fonte/`. Ele é matéria-prima do
  `logo-sem-fundo.mjs`, não asset de site: em `public/` ele ficava servível em `/logo-real.png` — baixável
  por qualquer visitante e concorrendo por engano com a versão boa.
- O `check:livro` passou a conferir a marca NOVA (`/logo-real-alfa.png`) na lista de arte avulsa, em vez do
  arquivo que não existe mais.

> Nota de honestidade: a renomeação `gerar-logo-dark.mjs` → `gerar-favicon.mjs` foi aplicada também às
> menções em notas de versão antigas. Reescrever registro histórico é um preço; a alternativa era deixar
> notas antigas apontando pra um arquivo inexistente, o que é pior pra quem vai lê-las.

### ⚠️ O favicon ainda é da marca antiga

`src/app/icon.svg` continua sendo derivado de `public/logo.svg` — o letreiro velho. É o único lugar do site
que ainda mostra a marca anterior, e ele sobrevive por uma razão técnica: favicon precisa ser vetorial pra
ler num quadrado de 16px, e a marca nova é um PNG. Trocar exige rasterizar e recortar. Anotado no
`PROGRESS.md` como pendência declarada, e não como esquecimento.

---

## 0.1.7 — "A Ordem do Livro" · 2026-09-04

### 📖 O Capítulo 2 estava na ordem errada

O capítulo rodava **1, 2, 6, 7, 3, 4, 5**: "Interromper uma Conjuração" e "Regras Gerais" ficavam entre a
§2 e a §3. A §6 abre dizendo *"uma magia de rank Santo custa 4 Ações"* — número que só a §3 estabelece, e
que o leitor ainda não tinha visto. O sumário listava 1→7 corretamente, então clicar em "3. Tempo de
Conjuração" fazia o leitor **subir** na página. As duas seções foram para o fim, na ordem que o sumário
sempre prometeu.

### ⚔️ O Capítulo 4 numerava 8 seções; o sumário, 9

"Reações e Ações Defensivas" — a tabela com Ataque de Oportunidade, Esquivar, Defender e Bloquear com
Escudo, que é regra central de combate — estava enterrada como **subtítulo dentro da seção de Exaustão,
Fome, Sede e Clima**, entre "Removendo Exaustão" e "Fome e Sede". Virou seção própria, logo depois da
Economia de Ações, que é onde ela pertence. As seções seguintes foram renumeradas de 5 a 9, e **as 25
remissões cruzadas do livro inteiro** ("Cap. 4, §7" e companhia, espalhadas por árvores, raças, loja,
bestiário e antecedentes) foram corrigidas junto.

### 🌳 O Capítulo 3 apresentava três pilares e dava seção a dois

A abertura nomeia Magia, Corpo e Utilidade; o capítulo tinha "A Árvore do Corpo — Sistemas Compartilhados"
e "A Árvore de Utilidade — Sistemas Compartilhados", e nada para a Magia. A razão era boa (os sistemas
compartilhados da Magia são o Capítulo 2 inteiro), mas não estava escrita em lugar nenhum — quem rolava
procurando concluía que faltava uma parte. Agora existe a seção-ponte, curta de propósito: ela aponta, não
repete.

### 🔒 O sumário virou teste

Nada disso quebrava `tsc`, `eslint` ou `vitest`: eram âncoras válidas apontando para o lugar errado. Um
livro é uma **ordem**, e ordem precisa de teste. O `npm run check:livro` agora falha se um item do sumário
não tem âncora na página, ou se aparece na página numa ordem diferente da do sumário. Conferido invertendo
duas seções de propósito: ele pega os dois casos.

### 🪧 A logo perdeu o fundo

Em 0.1.6 ela ia ao ar dentro de um cartucho escuro com `mix-blend-mode: screen` — o preto sumia contra o
cartucho, mas o cartucho continuava sendo um retângulo em volta da marca, que é justamente o que uma logo
não pode ter. A correção foi no **arquivo**: `scripts/logo-sem-fundo.mjs` decodifica o PNG com o `zlib` do
Node (zero dependências), calcula `alfa = max(R,G,B)` e **des-premultiplica** a cor — sem esse segundo
passo, cada pixel de borda carrega o preto que o compôs e a logo ganha um halo sujo sobre pergaminho.
Resultado: 15,5% do quadro é letreiro, o resto é transparente de verdade.

No tema claro ela passa por `brightness(.3) sepia(.5) saturate(2)`: o letreiro é creme e ouro, desenhado
pra viver em fundo escuro, e sobre pergaminho ele simplesmente sumia — conferido em print, lado a lado.

---

## 0.1.6 — "O Letreiro e a Faxina" · 2026-09-04

### 🪧 A logo nova, e o fim do "RPG" avulso

A marca virou `/logo-real.png`, e isso muda estrutura, não só arte: **o "RPG" agora está dentro do
letreiro**. Até 0.1.5 ele era um `<span>` de texto ao lado da imagem em três lugares (nav, landing,
rodapé), porque o logo da franquia não trazia a palavra que este projeto acrescenta ao nome. Trazendo, o
texto virou repetição — e saiu dos três.

Ela chegou como PNG **sem canal alfa**, com fundo preto sólido (colortype 2, conferido no cabeçalho do
arquivo). Solta sobre o pergaminho seria um retângulo preto. A saída não foi gerar um segundo arquivo por
tema (que é o que `logo.svg` + `logo-dark.svg` precisavam ser): é `mix-blend-mode: screen` sobre um
cartucho escuro. Screen com preto devolve o fundo intacto e com creme clareia, então o retângulo some e o
letreiro fica — a mesma conta nos dois temas, sem editor de imagem.

### 🖼 As quatro rotas que faltavam ganharam arte

`/ficha` (a ficha na mesa, com vela, pena e tinteiro), `/personagens` (o salão da guilda), `/iniciativa`
(uma escaramuça em floresta) e `/criar` (a mão desenhando um círculo mágico). Com elas, **todas as sete
rotas** têm identidade visual própria, e a landing ganhou uma faixa de convite antes do rodapé — a página
terminava numa fileira de links de texto e voltava a pedir a única coisa que quer de quem está lendo.

O Superd Renegado do bestiário ganhou retrato próprio e parou de emprestar o da raça Superd.

### 🎨 O mapa parou de parecer de outro projeto

Os três pilares eram `sky-600`, `rose-600` e `emerald-600` — três primárias saturadas de biblioteca num
site inteiro de pergaminho, vinho e ouro. O mapa é a página mais bonita do projeto e era a única que
parecia ter vindo de outro. Viraram **teal fundo, vinho e oliva**: água, sangue e mata, o vocabulário do
mundo em vez do do Tailwind. A distinção entre os ramos continua igual — o que mudou foi a temperatura.

E o galho em que você investiu agora **acende**: linha em opacidade cheia com brilho da cor do Rank,
contra os 25% do que nunca foi tocado. Antes, uma árvore com quatro patamares comprados e uma que você
nunca abriu tinham o mesmo peso na tela.

### ✨ Gastar passou a ter instante

Comprar item e gastar PA eram instantâneos: o "150 PO" virava "85 PO" entre um quadro e outro, e nada
dizia que você acabou de gastar 65. Agora a bolsa e o contador de PA **contam** até o novo valor (duração
fixa de 420 ms, não passo fixo — ir de 0 a 6 e de 0 a 3.400 tem que levar o mesmo tempo), e o card
comprado pulsa uma vez em dourado.

### 🧹 Faxina no repositório

- Um **git worktree inteiro do Claude foi commitado** em `.claude/worktrees/pdf-content-import/` — cópia
  completa do projeto, `package-lock.json` incluído, 30 arquivos rastreados. Saiu do índice e do disco. Os
  markdowns do livro que moravam lá (700 KB, a importação original do PDF) foram preservados **fora do
  repositório**, em `../backup-livro-md/`.
- Os **cinco SVGs do template do `create-next-app`** (`next`, `vercel`, `window`, `file`, `globe`) nunca
  foram referenciados por uma linha de código. Removidos.
- `tsconfig.tsbuildinfo` (artefato de build regenerável) saiu do disco; já estava no `.gitignore`.
- O rodapé passou a citar o **repositório no GitHub** e o **Discord do autor** — o Discord como handle
  copiável, não como link: um convite `discord.gg` expira e viraria 404 no rodapé de todas as páginas.

### 🧪 Dois defeitos que o `tsc` aprovou e a tela reprovou

1. **A página inteira quebrou ao abrir**, com erro em runtime: `CopyChip` recebia o ícone como
   `icon: ComponentType`, e React recusa uma FUNÇÃO atravessando de Server pra Client Component ("Only
   plain objects can be passed to Client Components"). `tsc` e `eslint` passaram os dois. Agora o ícone
   entra como `children`, já construído.
2. **A logo subiu por cima do selo "projeto de fã"** na landing: o componente era `inline-flex`, entrava
   no fluxo de linha do container centralizado, e `mx-auto` não centraliza caixa inline nenhuma.

---

## 0.1.5 — "Três Níveis de Papel" · 2026-09-04

### 🗂 O site tinha UM card, repetido 23 vezes

A string `rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:…` estava copiada
literalmente **23 vezes** no JSX, e o botão vinho outras 23. O site inteiro tinha **36 `shadow-sm` e
exatamente 1 `group-hover`** em ~11 mil linhas: nada tinha relevo, nada reagia ao mouse, e uma tela cheia
lia como uma lista de retângulos igualmente importantes.

Agora existem **três níveis de superfície**, e o nível é gramática, não decoração:

- `.surface-raised` **anuncia** — cabeçalho de rota, hero, o total de uma conta. Ganha o fio dourado na
  aresta de cima (a luz da página vem de cima; é o fio, não a sombra, que faz um objeto parecer levantado).
- `.surface` **contém** — o card comum.
- `.surface-sunken` **espera** — campo, poço, estado vazio. Sombra pra dentro.

As três compõem com as utilitárias de cor que já estavam no JSX: elas declaram profundidade e textura, não
`background-color`. Por isso deu pra acrescentar a classe num card existente sem reescrever a linha dele.

### 🧾 Cada rota tem uma cara

`/ficha`, `/loja`, `/encontros` e `/iniciativa` eram estruturalmente a mesma página — h1 + ícone lilás +
grade de cards. `PageHeader` resolve isso num componente só, com a arte de ambiente da rota atrás do
título: a taverna da guilda na Loja, o covil de teia nos Encontros, o grimório à luz de vela no Livro, o
céu estrelado nas Árvores. A arte é dessaturada, puxada pro âmbar da paleta e morre num degradê antes da
borda de baixo — as artes chegaram em teal, azul e cinza, e nenhuma delas, crua, convive com texto por cima.

Rota sem arte não fica esperando arte: o cabeçalho cai num degradê vinho→pergaminho e é o mesmo objeto.

### 🌌 O mapa de progressão ganhou céu

O tabuleiro era o objeto mais bonito do site rodando sobre um retângulo bege chapado. Agora ele tem fundo
de campo estelar e vinheta radial fechando as quatro pontas. A mesma imagem serve aos dois temas com
tratamentos opostos: no escuro ela aparece de verdade (passada pelo sépia, senão o azul frio briga com a
paleta); no claro ela entra em `multiply` a 13% e deixa de ser foto pra virar mancha de tinta — uma carta
celeste desenhada no pergaminho.

O painel lateral, que era um parágrafo de instrução dentro de uma coluna de 340×700 vazia, virou a
**legenda das três cores** do mapa — informação que faltava e conteúdo que faltava, no mesmo lugar.

### 📖 O livro virou livro

- **Capitular** na abertura de cinco capítulos (`initial-letter`, com `float` de reserva).
- **Filigrana** sob cada título de capítulo. Ela chegou como PNG de traço preto sobre fundo branco, e é
  convertida em ouro por um filtro SVG que joga a luminância no canal alfa — o fundo branco vira
  transparente e o traço vira ouro, nos dois temas, sem editor de imagem.
- **Filete duplo com losango** entre seções e no rodapé, em CSS puro.

### 🦴 O bestiário tem cara

As **6 criaturas prontas do Apêndice G** ganharam retrato (`CriaturaPronta.icon`, em `public/criaturas/<id>`),
seguindo a mesma regra de árvore e raça — e `npm run check:livro` agora confere que cada uma existe em
disco. O Superd Renegado é a exceção que confirma a regra: ele reaproveita o retrato da raça Superd,
porque a criatura do Apêndice G é um membro renegado dessa mesma raça.

### 🛒 A loja parou de parecer quebrada

- **Rank colorido** por etiqueta (F→S, do frio ao quente, na mesma direção da escala de Rank das árvores).
  Vinte e um cards de arma com a mesma faixa vinho não separavam uma adaga de 6 PO de um artefato de Rank S.
- **Item bloqueado não ganha mais um botão cinza do tamanho do card.** A grade tinha 21 barras cinzas
  mortas, e elas eram o elemento mais pesado da tela — a página lia como "nada aqui funciona". Bloqueio
  virou uma linha de estado; botão é só pra quem pode agir. Quem tem Rank mas não tem PO vê quanto falta.
- A sétima categoria (`aventura`) finalmente tem ícone: a arte estava no repositório desde 0.1.4, solta na
  raiz de `public/` com espaço no nome, a um diretório de distância da tabela que a procurava.

### 🕳 Estados vazios com voz

"Nenhuma perícia ainda.", "Nenhuma magia ou talento comprado ainda.", "Nenhum item ainda." — três frases
cinzas em sequência eram a primeira impressão de quem acabava de criar um personagem. Viraram poços
(`.surface-sunken`, que já diz "aqui vai entrar coisa") com o ícone da seção grande e apagado, e a frase na
voz do livro: *O grimório está em branco. A mochila está vazia. O covil está vazio.*

### 🧭 Rodapé, barra fixa e o fim da página

- **Nenhuma rota do site terminava** — elas paravam, e depois vinha pergaminho vazio até o fim do scroll.
  Agora há rodapé com navegação, versão e o disclaimer de fã.
- O disclaimer saiu da landing. Ele ocupava o espaço logo abaixo do CTA — o ponto mais valioso da página —
  com um parágrafo jurídico em corpo 12. No lugar dele entrou a **vitrine**: as três coisas que o site tem
  e que uma lista de bullets não vende (o mapa, a loja, o livro), cada uma com a arte do próprio destino.
- A **barra de navegação é fixa**, translúcida com blur (a textura do body é `fixed`; uma barra opaca
  cortaria a folha em duas). A rota atual ganhou filete dourado — antes o ativo era só negrito+vinho, a
  mesma diferença que o hover dá, e os dois estados se confundiam.
- Os números-herói da ficha (PV/PM/PT/PP/CA/Iniciativa) saíram de `text-lg` na sans de formulário pra
  display, pretos e tabulares.

### 🧪 Três coisas que só o print pegou

Seguindo a regra de 0.1.4 ("o print é o teste que falta"), estas passaram por `tsc`, `eslint`, `vitest` e
`check:livro` sem um arroto:

1. **O ornamento saía com uma moldura dourada.** A região padrão de um filtro SVG é 10% maior que o
   elemento, e lá fora o pixel é preto transparente — que, pela conta do filtro, vira alfa 1, ou seja, ouro
   chapado na margem inteira.
2. **A linha "19 sub-árvores" da vitrine era invisível.** Elemento posicionado pinta acima de irmão não
   posicionado mesmo vindo antes no DOM, e a margem negativa enfiava o texto por baixo da imagem.
3. **A textura de fibra estava forte demais**, exatamente o sintoma que o comentário dela no CSS descreve
   como erro. Caiu de 0.22 pra 0.10 no escuro.

E uma quarta que era **falso positivo**: o print de 390px mostrava a página estourando pra fora da tela. O
Chrome no Windows trava a largura mínima de janela em ~500px — o print era um recorte de uma janela de 500,
e o layout em 500 está correto. Vale anotar: `--window-size` abaixo disso mente.

---

## 0.1.4 — "As Doze Raças Ganharam Cara" · 2026-09-03

### 🧝 Escolher raça deixou de ser uma lista suspensa

As **12 raças** ganharam retrato (`Race.icon`, em `public/racas/<id>`). O arquivo se chama como o `id` da
raça — mesma regra dos brasões de árvore e dos ícones da loja, e pelo mesmo motivo: assim não existe uma
tabela de mapeamento nome→arquivo em lugar nenhum.

O passo de raça da Criação Guiada era um `<select>` de doze linhas de texto — doze nomes que só quem já
leu o Cap. 1 sabe diferenciar. Virou uma **grade de retratos**. Escolher raça é a primeira decisão de
identidade da ficha, e agora a diferença entre um Superd e um Migurd chega antes da leitura, que é como
escolha de raça funciona em qualquer livro de RPG impresso.

O retrato aparece em mais quatro lugares, todos lendo do mesmo campo:

| Onde | O que muda |
| --- | --- |
| Card de Passivas (ficha e criação) | Retrato ao lado do nome da raça |
| Cap. 1 do livro | Os 12 cards de raça ganharam retrato |
| Roster `/personagens` | O card era só nome e dois botões |
| Roleta do Destino | O retrato aparece no instante em que a roleta para |

O card do roster é o caso mais claro: o retrato ocupa **exatamente o lugar da foto de perfil** que ele
ainda vai ganhar, e é o que dá pra mostrar hoje sem pedir upload nenhum.

### 📦 As imagens pararam de ser servidas cruas

Os retratos chegaram com até **1,28 MB** por arquivo. O medalhão servia tudo com `unoptimized` — decisão
que fazia sentido quando só existiam SVGs e PNGs de 10 KB, e que agora mandava um megabyte pro navegador
desenhar um selo de 44px.

Agora `unoptimized` vale **só pra SVG**, que o otimizador do Next não processa mesmo. O resto passa pelo
otimizador:

```
migurd.jpg cru:        1 286 264 bytes
migurd.jpg otimizado:      1 694 bytes   (no tamanho em que aparece)
```

**Terceira vez na mesma semana que um arquivo mentiu sobre o formato:** duas raças chegaram como `.png`
sendo **WebP** por dentro. Antes delas, um brasão de árvore era PNG com extensão `.svg`, e a textura de
pergaminho era AVIF com extensão `.png`. Todos renomeados pro que realmente são.

`check:livro` agora confere retrato de raça junto com brasão de árvore, ícone de loja e arte fixa da
interface — e imprime quantas das 12 raças têm retrato.

---

## 0.1.3 — "O Site Ganhou Cara" · 2026-09-03

### 🗺️ O mapa de árvores cabia numa moeda

O zoom inicial de `/arvores` era a constante **0,35** — sem relação nenhuma com o tamanho do visor nem do
canvas, que cresce junto com o número de árvores. Num monitor comum o grafo inteiro virava uma bolinha no
meio de um retângulo vazio de 800px: os brasões eram pontos de 3px, e a primeira impressão da tela mais
importante do site era a de **uma página que não carregou**.

Agora o enquadramento é calculado do **conteúdo** — diâmetro do grafo mais o raio de um nó da borda —
contra o tamanho real do visor. O mapa nasce preenchendo a tela, e cada árvore mostra o brasão dela
legível.

### 🏪 A loja repetia a mesma frase doze vezes

As doze armas mundanas nascem de um mesmo `.map()` e compartilham **uma** descrição. A loja imprimia uma
cópia dela em cada card — doze parágrafos idênticos empilhados, e as armas que *têm* algo próprio a dizer
(Adaga de Prata, Lâmina Balanceada) afogadas no meio.

A tela agora **agrupa por categoria** e detecta sozinha o texto que dois ou mais itens do grupo repetem:
ele sobe pro cabeçalho, uma vez, e some dos cards. A definição é operacional, não uma lista fixa — *se
dois itens dizem a mesma coisa, aquilo não descreve nenhum dos dois* —, então a regra pega as doze armas
de hoje e pega sozinha o próximo bloco que nascer do mesmo molde.

Cada grupo ganhou a arte da categoria e a contagem de itens. Com o filtro em "Todos", os 85 itens deixaram
de ser uma lista corrida sem divisão nenhuma.

### 🎨 Pergaminho, paisagem, e o logo consertado

O site inteiro passou a ter **fundo de pergaminho de verdade**: 60% no tema claro (onde a textura é o
assunto) e 20% no escuro (onde ela só precisa quebrar o marrom chapado). Os dois números saíram de
comparar as telas lado a lado — acima de 20% no escuro a textura começa a lavar o fundo e comer contraste
do texto.

> As dez páginas pintavam um `bg-parchment-100 dark:bg-parchment-950` sólido por cima do corpo. Nenhuma
> textura teria aparecido em lugar nenhum; isso saiu junto.

A **landing** ganhou a paisagem do Mundo de Seis Faces atrás do herói. Ela dissolve na textura por
`mask-image`, e não terminando numa cor sólida — a primeira tentativa deixava um degrau horizontal
visível onde a imagem acabava e o fundo texturizado começava.

O **logo parou de dizer o nome duas vezes**: ele *é* o título agora. O `h1` continua existindo (é ele que
nomeia a página pra busca e pra leitor de tela) mas é lido, não visto; e o "RPG" — a parte que este
projeto acrescenta ao nome da franquia — ganhou linha própria.

**🔴 Correção: o logo estava quebrado no tema escuro desde 0.1.2.** O preto do arquivo está em **dois**
lugares e só um tinha sido trocado:

1. `fill="#000"` — a linha "jobless reincarnation". Essa estava certa.
2. **O fim dos quatro degradês das letras grandes.** Um `<stop>` sem `stop-color` é **preto por padrão**
   em SVG — então "Mus", "Te" e "u" iam de dourado a preto e sumiam no fundo escuro, que é o tema padrão
   do site.

Passou em tudo que é automático — arquivo válido, `200`, content-type certo, as duas variantes no HTML.
**Só apareceu num print.** O gerador agora exige os dois padrões e falha explicando se o logo mudar de
estrutura.

`check:livro` passou a conferir que **toda arte referenciada por caminho existe em disco**: os 19 brasões,
os ícones de categoria da loja, os dois logos, a paisagem e a textura. Caminho é texto, e nenhum tipo
protege texto.

---

## 0.1.2 — "O Que a Criatura Faz" · 2026-09-03

### 🐉 A ficha de monstro deixou de ser sete números soltos

A criatura de `/encontros` era PV, CA, ataque, dano por turno, CD, quantidade e uma linha de texto livre.
Isso basta pra dizer se um encontro é justo, e não basta pra **nada do que acontece na mesa**: o Mestre
sabia que a Wyvern mergulha, e tinha que inventar na hora quanto a mordida dela tira.

Agora a criatura tem **ações**. Cada uma com nome, custo em Ações, fórmula de dano (`4d8+5`, do jeito que
se escreve numa ficha de monstro), alcance, se é em área, e se resolve **contra a CA** ou **pedindo teste
de resistência** — mais uma anotação livre pra condição, veneno ou gatilho.

**Criatura com ações é resolvida por rolagem de verdade.** Três Ações por rodada, gastas no melhor dano
médio *por Ação* — o mesmo critério que o motor já usava pro personagem —, com 1 natural errando, 20
natural rolando os dados de novo, área pegando todo mundo de pé, e resistência cortando o dano pela metade.

**Criatura sem ações continua no orçamento fixo do Apêndice G.** Ele não foi aposentado: é ele que
preserva a calibragem publicada da tabela e os números do playtest, e um bicho montado em trinta segundos
antes da sessão continua sendo um bicho válido.

As **seis criaturas prontas do Apêndice G** ganharam as ações delas, e o livro passou a imprimi-las:

| Criatura | Turno de 3 Ações | Molde do patamar |
| --- | --- | --- |
| Sapo-Lodo Gigante | 3× Mordida Babosa (1d6) = ~10,5 | 10 |
| Serpente-do-Pântano | 3× Picada Peçonhenta (1d8+2) = ~19,5 | 20 |
| Aranha das Cavernas | 3× Presas (2d6) = ~21 | 20 |
| Wyvern | 3× Mordida em Mergulho (2d8+3) = ~36 | 35 |
| Ogro de Guerra | 3× Maça de Duas Mãos (4d8) = ~54 | 55 |
| Superd Renegado | 3× Lança Demoníaca (5d8+4) = ~79,5 | 80 |

As fórmulas foram escritas pra que o turno de três Ações entregue o Dano por Turno do patamar. **Um teste
trava essa igualdade com 15% de folga** — então ligar as ações não invalidou nada do que já estava
calibrado, e mexer numa fórmula acima avisa qual saiu da faixa.

### 💡 O site sugere enquanto você digita o dano

A simulação responde *depois do fato*: monte tudo, clique, espere 300 batalhas. Isso fecha um encontro e
não ajuda a **escrever** um monstro. O conselho novo é a outra ponta — sem rolagem nenhuma, recalculado a
cada tecla.

E ele é concreto, porque é ancorado em duas coisas que o site já tem: o molde do Apêndice G e **as fichas
de verdade do grupo selecionado**. Não *"está alto demais"*, e sim:

> **Mata alguém num golpe** — Mordida tira 62 em média. Lyn (50 PV) cai num acerto só, sem chance de
> reagir, sem cura no meio. Se a ideia era ameaçar e não executar, Mordida vira 7d10+3.

Os avisos cobrem:

- o **orçamento do turno** contra o molde do patamar e do papel;
- **quem do grupo morre num golpe** — e, separado, quem *pode* morrer na rolagem alta, que é outra conversa;
- a **chance de acerto** dela contra a CA real do grupo, nas duas pontas (erra demais / a CA não conta);
- o dano de uma ação **em área** medido contra a reserva de PV do grupo inteiro;
- a **CD fora do molde**, mas só quando alguma ação cobra teste.

Cada aviso traz, quando cabe, uma **correção pronta com um botão** — a fórmula já escalada, o bônus de
ataque já calculado. Nada muda sozinho: o Apêndice G é uma régua, e régua não decide.

Sem grupo escolhido, os avisos que dependem do grupo **calam** em vez de inventar um personagem médio. Um
número tirado do nada seria pior que silêncio.

**16 testes novos** só do conselheiro, travando *quando* cada aviso aparece, que ele cita um número
conferível, e que a correção que ele oferece resolve o que ele apontou. 89 no total.

### 🎨 As dezenove árvores ganharam brasão, e o jogo ganhou logo

Cada árvore declara `icon`, e **o arquivo se chama como o `id` dela** — então o mapeamento nome→arquivo
deixou de existir como tabela. Quem desenha lê do mesmo campo: `/arvores` (no nó do mapa e no painel
lateral), `/livro` (no cabeçalho de cada catálogo), a criação (no seletor de Árvore Inicial), a ficha (na
Árvore Inicial e em cada grupo do Grimório) e `/encontros` (no cartão de cada personagem do grupo).

As imagens chegaram tortas e foram endireitadas: uma era **cópia byte a byte** de outra, quatro tinham
espaço ou acento no nome, e uma se chamava `.svg` **sendo PNG por dentro**. Todas viraram
`public/arvores/<id da árvore>.<extensão>`.

Elas vêm em fundos diferentes — traço preto sem fundo, fundo branco, fundo preto, alfa —, então todas
passam pelo mesmo **medalhão**, com fundo claro fixo nos dois temas. É a única regra que faz o traço preto
aparecer também no escuro, e ela mora num lugar só.

O **logo** entrou na aba (favicon), na barra de navegação e no topo da landing. Como o letreiro é preto e
os ornamentos são dourados, existe uma variante clara pro tema escuro — **gerada** do original por
`scripts/gerar-favicon.mjs`, junto com o favicon quadrado, porque logo copiado à mão é a próxima coisa a
divergir.

`check:livro` passou a conferir que **o brasão de cada árvore existe mesmo em disco**: `icon` é texto, e
nada no TypeScript impede que ele aponte pra um arquivo que não existe.

---

## 0.1.1 — "O Cenário Hipotético" · 2026-09-03

### 🎲 `/encontros` — montar a criatura e testá-la contra o grupo antes da sessão

O Apêndice G sempre teve o molde de criatura por patamar, e ele só existia como tabela impressa: o Mestre
lia PV 150, CA 18, ~55 de dano e tinha que adivinhar o que isso faz contra **os cinco personagens dele**.
A tabela é calibrada contra um grupo genérico; nenhuma mesa tem um grupo genérico.

- Escolha um patamar e um papel (Lacaio, Padrão, Chefe) e a criatura nasce com os números do Apêndice G
  preenchidos. Quando os números saem do molde, a tela diz que saíram e oferece recalibrar, em vez de impedir.
- **O grupo vem das fichas de verdade**, as mesmas que o Mestre já importa dos JSONs dos jogadores.
- O botão roda o combate 300 vezes e devolve um veredito: Trivial, Fácil, Equilibrado, Perigoso ou Letal.
- **E a recomendação:** quando o encontro não cai em Equilibrado, o site procura por busca binária a escala
  de PV e dano que o poria lá. Quando *nenhuma* escala resolve, ele diz isso — o problema é a composição.
- A tela imprime, junto do veredito, a lista do que a simulação **não** sabe. O motor mede o piso.

### 🔧 O motor de simulação virou código compartilhado

Ele vivia inteiro dentro de `scripts/simular-combate.mts`. A tela que diz ao Mestre "este encontro é justo"
tem que responder pelos **mesmos** números que calibram o livro. Foi pra `src/lib/combatSim.ts`, e a
aleatoriedade passou a ser sempre injetada com semente: um veredito sem semente não se confere.

### 📐 Apêndice G deixou de ser texto digitado à mão

As duas tabelas do Bestiário viraram `src/data/bestiary.ts`, e o livro as imprime dali. A coluna "Bônus de
Resistência" parou de ser digitada — o livro a define como metade do Bônus de Ataque, então ela é derivada,
e um teste trava que a derivação reproduz os seis valores publicados.

---

## 0.1.0 — "Duas Portas" · 2026-09-03

### ⚔️ Balanceamento

**Magias Combinadas — rework completo.** Elas eram uma tabela impressa e nada mais: nenhuma era comprável
em lugar nenhum, o motor não sabia que existiam, a ficha não as guardava, e o PA que o livro dizia que elas
custavam **nunca saía de lugar nenhum**.

O requisito era "rank Avançado nas duas escolas" — o que significava que chegar ao Avançado em duas
escolas quaisquer abria **as nove de uma vez**, de graça. Agora cada uma declara **duas portas, cada uma
com o seu próprio rank**:

| Magia Combinada | As duas portas | PA |
| --- | --- | --- |
| Barreira Incandescente | Barreira **Avançado** + Fogo **Intermediário** | 3 |
| Muralha de Espinhos | Terra **Avançado** + Fogo **Intermediário** | 3 |
| Magma | Fogo **Avançado** + Terra **Avançado** | 4 |
| Gelo Tempestuoso | Água **Avançado** + Vento **Avançado** | 4 |
| Pânico | Fogo **Santo** + Vento **Avançado** | 5 |
| Relâmpago Santo | Água **Santo** + Cura **Avançado** | 5 |
| Tempestade de Cura | Cura **Santo** + Água **Avançado** | 5 |
| Nevasca Curativa | Água **Rei** + Cura **Santo** | 7 |
| Meteoro | Fogo **Rei** + Terra **Avançado** | 8 |

Os requisitos são **desiguais de propósito**: duas fichas que investiram fundo em escolas diferentes
destravam Combinadas diferentes, e nenhuma destrava todas. É o que faz a tabela ser uma *lista de escolhas*
em vez de um bloco que abre junto.

**Elas custam PA de verdade agora**, e o custo entra em `getPaSpent` junto com magia, atributo e perícia.

A Maestria do Avançado continua dando o **direito** de aprender Magia Combinada. O que ela deixou de ser é
a única condição.

**Onde elas aparecem depois de compradas:**

- **`/ficha`** — seção própria no Grimório, com PM, Ações, alcance, dano e as duas portas que a
  destravaram. Separada das árvores de propósito: uma Combinada não pertence a nenhuma das duas escolas que
  a geraram, e listar o Meteoro dentro de Fogo faria procurá-lo em Terra na metade das vezes.
- **PDF exportado** — no mesmo bloco de cartas das magias, marcadas com ◇, com as duas árvores de origem na
  linha de alcance. Na mesa elas se usam como qualquer outra magia.

---

### 📖 Novas Regras e Simplificações

**Painel novo em `/arvores`.** Mostra as nove o tempo inteiro, em três estados:

- **Comprada** — já está na ficha.
- **Disponível** — as duas portas abriram; dá para comprar agora.
- **Trancada** — mostra **quais portas faltam e quanto falta em cada uma**.

É a parte que faz o painel valer: ele não esconde o que você ainda não alcançou, ele diz o caminho. E fica
em `/arvores`, não na ficha, porque uma Combinada não pertence a *uma* árvore — ela nasce do encontro de
duas, e é olhando o mapa que se entende por que ela apareceu.

---

### 🐛 Correções de Bugs

- **Três das nove magias apontavam para a árvore `"curar"`, que nunca existiu** — o id é `"cura"`. O livro
  imprimia a coluna da árvore-primária **vazia** nessas três, e nenhuma verificação pegava porque nada no
  código lia o campo. Um teste novo trava isso: toda porta de toda Combinada precisa apontar para uma
  árvore que existe.
- **Migração v11** do persist: fichas antigas entram com a lista de Combinadas vazia.
- **33 testes** no total (eram 28) — cinco cobrindo as duas portas, o PA e a compra duplicada.

---
## 0.0.9 — "Ganhar Duas Vezes a Mesma Coisa" · 2026-09-03

### ⚔️ Balanceamento

**Pontos de Touki entram no Padrão das Reservas.** PT era a única das três reservas fora do padrão do
Cap. 1: PV e PM escalavam por patamar, PT vinha como número fixo. A consequência não era só
inconsistência — era **redundância**:

| Árvore | Talento A | Talento B |
| --- | --- | --- |
| Deus da Espada | Aço Rápido (Intermediário) `+2 PT` | Fôlego de Aço (Avançado) `+3 PT` |
| Cavalaria e Escudos | Fôlego de Sentinela (Interm.) `+2 PT` | Aço Paciente (Avançado) `+4 PT` |
| Estilo Vendaval | Fôlego do Vendaval (Princip.) `+2 PT` | Segunda Rajada (Avançado) `+3 PT` |

Comprar o segundo não mudava nada na mesa além do total. Agora os **sete talentos de reserva de PT**
rendem `+1 PT por patamar` naquela árvore, como os de PV e PM sempre renderam — um talento só cobre a
árvore inteira.

Os **três que sobravam viraram recarga**, não tanque maior:

> Uma vez por combate, sem gastar Ação, recupere PT iguais ao seu Bônus de Rank.

No Escudeiro — que gasta PT mais rápido que qualquer árvore — é o que faz a segunda metade da luta ainda
ter um Escudeiro nela. No Deus da Espada, compra um segundo primeiro turno. No Vendaval, vem com 9 metros
de deslocamento que contam para a Distância Roubada.

**Estilo Vendaval — duas habilidades que só repetiam um patamar anterior.**

- **Mil Cortes no Vendaval** (Rei) era o **Redemoinho de Aço** (Intermediário) com raio 3× e dado 2×,
  quatro patamares depois — o mesmo botão, mais caro. Agora o raio **vem da Distância Roubada** do turno
  (3m a 12m): você não gira no lugar, atravessa o grupo e corta no caminho. Cada alvo que cair devolve 1 PT.
- **Corte que o Vento Termina** (Santo) era o **Corte do Horizonte Curto** (Avançado) com mais dado e mais
  Ação. Agora a segunda lâmina segue por toda a sua Distância Roubada — e **se você não se moveu neste
  turno, ela não sai**.

---

### 📖 Novas Regras e Simplificações

**O chefe solo não sobrevivia a um grupo de cinco.** A regra do Apêndice G era *"chefe único: dobre o PV e
mantenha o dano"*. Ela resolve a vida do chefe e ignora o problema real: **economia de ação**. Cinco
personagens agem quinze vezes por rodada; um chefe age três.

Numa simulação de 2.000 combates, um grupo de 3º patamar derrubava o chefe de *Elite* — **um patamar acima
deles** — em 2,4 rodadas perdendo 0,7 personagem. E ainda vencia 59% contra um chefe **dois** patamares
acima.

> **Regra nova:** o chefe ganha uma rodada inteira a cada dois personagens do grupo (mínimo 1). Um grupo de
> cinco enfrenta um chefe que age **duas vezes por rodada**.

| Chefe | Antes | Depois |
| --- | --- | --- |
| Mesmo patamar | 100%, **0,0** mortes | 100%, 0,9 mortes |
| Um acima | 100%, 0,7 mortes | **70%**, 3,6 mortes |
| Dois acima | **59%** | 0% |

O chefe não ficou mais difícil de matar — ficou **perigoso enquanto está vivo**, que é a única coisa que
faz um combate contra um inimigo só valer a mesa.

---

### 💻 Sincronia de Sistema

**`npm run check:redundancia`** — detector novo. Compara toda habilidade, talento e Maestria com as outras
da **mesma árvore, entre patamares diferentes**, por sobreposição de vocabulário. Ele procura a progressão
que não progride — *"ganho isso no 1º e ganho quase igual no 3º"* — que nenhum check de consistência pega,
porque não há contradição nenhuma, só repetição.

Achou **10 pares** acima de 40%: cinco eram escadas legítimas (Bala de Pedra → Canhão de Pedra), três eram
os talentos de PT, dois eram o Vendaval. Ele ignora de propósito os talentos de reserva entre si — o Padrão
das Reservas existe justamente para que eles digam a mesma frase.

### 🐛 Correções de Bugs

- **`getPtPool` ignorava o campo escalar novo** e lia só o de PT fixo: os sete talentos convertidos estavam
  concedendo **zero**. Pego por um teste escrito junto com a mudança, antes de qualquer ficha ver.
- 28 testes no total (eram 26).

---
## 0.0.8 — "A Régua Agora Se Mede" · 2026-09-03

### ⚔️ Balanceamento

**O Apêndice C estava errado, e ninguém tinha como saber.** A Tabela Comparativa de Dano por Turno — que o
livro chama de *"a régua com que toda árvore futura deve ser medida"* — eram 15 colunas × 6 linhas de
valores `~N` digitados à mão dentro da prosa. Era a única régua do livro que nada verificava.

> O Sopro Podre caiu de **10d8 → 6d8** no rework da 0.0.3, e a coluna da Desintoxicação continuou
> anunciando **~55** no 5º patamar — um número que a escola não alcança mais.

A tabela virou dado (`src/data/danoPorTurno.ts`) e o Apêndice C a renderiza de lá. Os números continuam
sendo **calibragem humana** e têm que ser: "dano por turno" embute Ações, número de alvos e o Touki do
inimigo, e nada disso está nos dados de uma magia isolada.

O que mudou é que agora existe um **piso verificável**. O `check:livro` compara cada célula com a média do
maior golpe único daquele patamar, **já amortizada pelas Ações que ele custa** — uma magia de 6 Ações
entrega metade por turno, exatamente como o próprio Apêndice C explica. Uma coluna pode ficar *acima* do
piso (várias Ações, vários alvos); nunca abaixo.

As quatro colunas que o próprio livro diz **não medirem dano** — Cura, Desintoxicação, Barreira e Escudos
— ficam marcadas como fora da régua. Cobrar delas uma promessa que nunca fizeram seria inventar regra.

- Vento no 3º patamar corrigido de **~30 → ~32**, que é o que os dados entregam.

---

### 💻 Sincronia de Sistema

**35 fórmulas, zero testes.** `selectors.ts` calcula todo número da ficha — PV, PM, PT, PP, CA, BC e o PA
gasto — em 35 funções puras, e não tinha um único teste. Duas das correções desta sessão foram exatamente
do tipo que um teste pega e uma revisão humana não:

- a ficha imprimia `count × 2 PA` enquanto o motor cobrava a escada progressiva;
- `perfectRecitationBonus` lia `ability.rank`, campo que `AbilityDef` nunca teve.

**23 testes** cobrindo PV Máximos e o Fator de Vigor, PM e o cap dos dois primeiros patamares, Pontos de
Touki, os custos progressivos de PA, o Custo de Abertura de árvore, BC/CD por árvore e a Classe de
Armadura. Cada `expect` cita a seção do livro que o justifica — quando um quebra, dá para saber na hora se
quebrou o código ou se a regra mudou.

```bash
npm test
```

### 🐛 Correções de Bugs

**Lint limpo pela primeira vez.** Os quatro avisos que arrastavam há sessões foram resolvidos — e nenhum
deles era um bug de verdade:

- Os **três hooks do Destiny Board estavam certos como estavam**. Adicionar as dependências que o linter
  pedia causaria loop: o mapa saltaria de volta ao centro sem parar, e a câmera ficaria presa numa árvore.
  Cada um ganhou o `eslint-disable` com o motivo escrito.
- O quarto era o idioma de descartar uma chave por destructuring. O eslint passou a aceitar o prefixo `_`
  para variável, argumento e erro capturado — a convenção que já diz isso.

---
## 0.0.7 — "O Divino Não Se Compra" · 2026-09-03

### 📖 Novas Regras e Simplificações

**O Punho de Fogo era a única das 19 árvores com um patamar Deus comprável** — uma Maestria, um talento e
três habilidades, custando PA como qualquer outro rank. Isso contradizia o Cap. 1, §3:

> O patamar Divino não possui custo mecânico de PA. […] este Rank só pode ser alcançado através de intenso
> Roleplay e eventos lendários na narrativa, ditados inteiramente pela história e pelo Mestre.

O conteúdo **não foi jogado fora**. A Aura do Alfa e Ômega, o Big Bang Marcial, a Ignição da Alma e o
Julgamento de Prometeu viraram o corpo do quadro narrativo **A Aura do Alfa e do Ômega**. O que se perdeu
foi o preço em PA e a rolagem — que é exatamente o que o livro diz que o Divino não tem.

Com o **Passo Que Não Termina** (Vendaval, 0.0.6), as **19 árvores** agora tratam o patamar Divino do
mesmo jeito, sem exceção.

---

### 🐛 Correções de Bugs

- **A tabela de custos do Cap. 1, §3 imprimia duas linhas "Deus"**: uma cobrando **4 PA** (vinda de
  `RANK_REQUIREMENTS`) e outra, escrita à mão logo abaixo, dizendo **"Narrativa"**. As duas se
  contradiziam no meio da seção que existe justamente para explicar quanto cada rank custa — o mesmo bug
  de linha duplicada que a tabela de patamares do Cap. 3 tinha.
- **Migração v10 do persist:** uma ficha que já tivesse comprado no patamar Deus do Punho de Fogo perde
  essas compras e o desbloqueio do rank, e o PA volta a ficar disponível — em vez de sumir do total sem
  nada na ficha explicando por quê.

### 💻 Sincronia de Sistema

- `check:livro` passou a tratar **patamar Deus comprável como erro**, não aviso. A decisão fica trancada:
  a próxima árvore que tentar abrir exceção quebra o build.

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
