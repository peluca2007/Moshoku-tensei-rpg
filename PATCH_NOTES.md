# Patch Notes

Histórico de mudanças de regra, balanceamento e sistema do RPG de Mushoku Tensei.
As mesmas notas aparecem dentro do site, em `/livro`, geradas de `src/data/patchNotes.ts`.

---

## 0.1.43 — "Navegar as Árvores com o Polegar" · 2026-09-10

### 🌳 O mapa era o único jeito, em qualquer tela

O `DestinyBoard` é um mapa radial com pan e zoom, e é a identidade visual do projeto. Ele também era a
**única** forma de navegar as árvores — dezenove delas, seis patamares cada, espremidos em 390px e
alcançados por pinça e arrasto.

O relato veio do autor, num aparelho de verdade: *"achei bem ruim navegar pelas árvores"*. **Nenhum
script tinha como dizer isso.** O `check:mobile` mede transbordo e alvo de toque, e os dois passavam há
versões. O que ele não mede é quantos gestos custa chegar numa habilidade.

Agora a tela tem **dois modos**, com um alternador visível no topo:

- **Lista** — o padrão no celular. **Pilar → árvore → patamar**: três toques até qualquer habilidade
  do livro, sem gesto nenhum. Um acordeão, que é o idioma que um polegar já conhece.
- **Mapa** — o padrão acima de 640px, e alcançável no celular a um toque. Ele mostra o que a lista não
  mostra: as pontes entre árvores híbridas e o desenho do destino.

O padrão acompanha a largura ao vivo, mas **a escolha explícita vence** — a largura é um palpite sobre
o aparelho, não sobre a pessoa. E um link com `?arvore=…` sempre abre o mapa, porque a lista não sabe
focar e mandar pro modo errado desperdiçaria o link.

As duas telas compram pela **mesma porta**: o cartão de habilidade saiu de dentro do mapa e virou
componente próprio. Duas telas que compram a mesma coisa por caminhos diferentes divergem em silêncio,
e o que divergiria aqui é o custo em PA e o motivo de o botão estar desligado.

### 🔤 "2 Açãoões"

A lista nova expôs um erro de texto que já existia: o plural de "Ação" estava sendo feito grudando o
sufixo na palavra inteira em vez de substituí-la.

```
`${n} Ação${n > 1 ? "ões" : ""}`   // 2 → "2 Açãoões"
```

Estava copiado em **sete lugares, em cinco arquivos**: o detalhe de habilidade, a ficha, a busca
global, a lista de árvores e — três vezes — o `buildFichaPayload`, que é **o que vira PDF**. Dava pra
levar *"2 Açãoões"* impresso pra mesa.

Sobreviveu porque sete cópias de uma linha curta não parecem duplicação: cada uma é pequena demais pra
incomodar sozinha e nenhuma é grande o bastante pra alguém extrair. O plural irregular é justamente o
caso em que isso cobra o preço. Agora é uma função com teste.

---

## 0.1.42 — "O Curandeiro na Tela do Mestre" · 2026-09-10

O `/encontros` simula 300 batalhas contra as fichas de verdade do grupo e imprime **"Quem fez o quê"**.
A tabela tinha duas colunas: dano por combate e sobreviveu.

Um curandeiro aparecia ali com um **`0`** ao lado do nome, na última linha. Isso lê como ficha ruim, e
é papel diferente — o mesmo defeito que o relatório de linha de comando tinha e que a 0.1.37
consertou. Ele sobreviveu cinco versões a mais na tela.

- A tabela ganhou **PV devolvidos**, ao lado do dano.
- A ordem passou a ser por **contribuição** (dano + cura) em vez de só dano. Somar os dois não afirma
  que 1 de cura vale 1 de dano; afirma que os dois são maneiras de gastar um turno, que é o que a
  tabela compara.
- Quem não tem magia de suporte mostra **traço**, não zero: zero sugere que tentou e não conseguiu.

Travado por um teste que roda 40 batalhas com uma curandeira no grupo e cobra que ela devolva PV — e
que **só ela** devolva.

---

## 0.1.41 — "Subir de Rank Vale a Pena?" · 2026-09-10

Um check novo, e nenhuma regra mexida: `npm run check:progressao`.

Ele responde duas perguntas na única moeda que o combate gasta — a **Ação**:

1. **A capstone compensa?** A melhor técnica de um rank tem que render mais por Ação que a melhor do
   rank abaixo, na mesma árvore.
2. **Corpo e Magia estão no mesmo campeonato?**

**Achou dezesseis capstones que não compensam.** As piores: Punho do Fogo no **Rei** rende 17,6 contra
**37,6** do Santo (−53%); Desintoxicação no Avançado, −47%; Armas Pesadas no Santo, −37%; Deus da
Espada no Santo, −33%.

Nem toda uma é erro — um rank pode entregar utilidade em vez de dano, e o personagem continua com as
técnicas antigas. Mas quatro quedas acima de 30% na mesma lista é padrão, não coincidência.

Teto do Corpo **44,0/Ação** (Prensa) contra **26,9** da Magia (Luz Absoluta): **1,6×**.

O check **não reprova o build**, de propósito: a magia compra alcance de 90m, área de verdade e
condição, e nada disso pontua ali. O que o instrumento garante é que a decisão de design seja tomada
olhando o número, em vez de descoberta seis meses depois numa mesa. As dezesseis estão no
`O-QUE-FALTA`.

*No caminho, dois becos sem saída ficaram registrados pra ninguém repetir: a **Conjuração Encurtada**
não resolve a capstone (corta metade dos dados pra cortar um terço das Ações — é sempre pior por Ação,
existe pra urgência), e a régua do **Apêndice C** não está sendo violada, porque ela mede o maior
golpe único e não o dano por turno.*

---

## 0.1.40 — "A Magia que Não Cabe no Turno" · 2026-09-10

### 🕯️ Vinte magias nunca tinham sido simuladas. Nenhuma vez.

Um turno tem **3 Ações**, e o custo de conjuração sobe com o rank: Avançado 3, Santo 4, Rei 5,
Imperador 6. Ou seja, **magia de Santo pra cima não cabe num turno** — e o motor escolhia ações
filtrando por `acoes <= acoesRestantes`.

Resultado: **20 ações de dano do livro eram inalcançáveis**, e não as menores. Sol Menor, Zero
Absoluto, Era Glacial, Vazio, Flashover, Maremoto, Sepultamento — as maiores magias do jogo, invisíveis
para todo relatório que este projeto já produziu.

O livro não as proíbe. O Cap. 4, §3 tem a regra inteira, chamada **"A Regra de Ouro: Conjuração
Contínua e Dividida"**: *"Magias poderosas exigem mais Ações do que você tem num turno — o sistema
permite dividir o cântico."*

**Ela entrou completa:**

- O cântico atravessa turnos, e o **PM é investido quando começa** (é o que o livro chama de "o PM
  investido").
- **Perda de Foco:** *"você é obrigado a gastar pelo menos 1 Ação por turno recitando"*. Um turno
  inteiro sem recitar e a magia falha, a mana se perde.
- **Teste de Concentração:** *"sofrer dano NÃO interrompe automaticamente"* — é um teste de Espírito
  contra **CD 10 + o Bônus de Rank de quem te acertou**. Sucesso e as Ações já gastas continuam
  valendo; falha e perde tudo que investiu mais **metade** do PM (metade, não o total — o livro é
  específico).
- Quem conjura **não ataca**: *"atacar, usar item, conjurar outra magia ou usar Reação, não."*

### 🧠 Uma regra de decisão que é minha, e por que ela existe

A IA só **começa** um cântico longo com o turno inteiro na mão. Isso não está no livro — o livro só
*permite* dividir.

Ela existe por uma medição: sem ela, um mago com 1 Ação sobrando largava o golpe de arma pra começar
um cântico de 3 Ações, gastando a sobra **e** amarrando o turno seguinte. O time dos magos caiu de
32,8% para **16,4%** de vitória por causa disso. Com a regra, voltou a 32,0% — praticamente idêntico
ao de antes, que é o correto: os builds do playtest vão até Avançado e não têm magia de 4+ Ações. O
destravamento é para quem TEM.

### ⚖️ E o que o destravamento revelou

Com as magias longas finalmente na mesa, dá pra comparar. O melhor **dano esperado por Ação** de cada
árvore:

| Árvore | Melhor por Ação | A melhor de 4+ Ações vence? |
| ------ | --------------- | --------------------------- |
| **Armas Pesadas** (corpo) | **43,2** | não tem magia longa |
| **Punho do Fogo** (corpo) | 40,4 | — |
| **Vendaval** (corpo) | 34,4 | — |
| **Deus da Espada** (corpo) | 29,0 | — |
| Fogo (magia) | 13,9 (Lança de Plasma, 3A) | **não** — Sol Menor faz 13,6 |
| Água (magia) | 11,9 (Zero Absoluto, 6A) | **sim** |
| Terra (magia) | 13,2 (Falha Geológica, 4A) | **sim** |
| Vento (magia) | 23,7 (Explosão Silenciosa, 3A) | **não** — a de 6A faz 13,2 |

Duas coisas saltam:

1. **Só 2 das 6 árvores de magia** têm a magia longa valendo a pena. No Fogo, o **Sol Menor**
   (Imperador, 22 PM, 6 Ações) rende **menos por Ação** que a Lança de Plasma (Avançado, 13 PM, 3
   Ações). A magia suprema é pior que a de dois ranks abaixo.
2. **A magia inteira perde da técnica corporal na economia de Ações.** O teto da magia é ~24 por
   Ação; o do corpo, **43**. Armas Pesadas entrega três vezes o que o Fogo entrega por Ação.

Isso é medida de dano puro, e a magia compra outras coisas que este motor não pontua: alcance de 90m,
área de verdade e condições. Mas a diferença é grande demais pra ser só isso, e virou pergunta no
`O-QUE-FALTA`.

**13 testes novos** (423 no total), incluindo o d20 forjado que separa "passou no teste" de "falhou" e
o que prova que o PM volta pela metade.

---

## 0.1.39 — "A Exceção Cobrada Junto com a Regra" · 2026-09-10

Auditoria da leitura de texto do motor. Dois erros, os dois na mesma família: o simulador lendo a
prosa do livro com uma rede larga demais.

### 🎲 Sete técnicas rolavam a exceção SOMADA ao caso base

`rolarDados` soma **todo** `NdM` que encontra na linha, e o livro escreve os dois casos juntos. O
resultado é que a condição era cobrada junto com a regra:

| Técnica | O livro escreve | O motor rolava |
| ------- | --------------- | -------------- |
| **Zero Absoluto** (Água) | `12d12 de frio (24d12 contra Molhado)` | **36d12** — 3× |
| **Sol Menor** (Fogo) | `14d12 (20d12 contra Em Chamas)` | 34d12 — 2,4× |
| **Explosão** (Fogo) | `3d6 + BC (+3d6 contra Em Chamas)` | 6d6 — 2× |
| **Lança de Fogo** (Fogo) | `3d8 + BC; +2d8 contra Em Chamas` | 5d8 |
| **Guilhotina de Vácuo** (Vento) | `5d8 + BC (+2d8 contra Desequilibrado)` | 7d8 |
| **Lâmina do Horizonte** (Vento) | `16d10 (+6d10 contra Desequilibrado)` | 22d10 |
| **Rio de Magma** (Terra) | `12d8 no impacto, depois 6d10 por turno` | 12d8+6d10 no mesmo golpe |

O conserto **remove o miolo do parêntese** em vez de cortar nele, e isso importa: quatro técnicas de
Água põem o TIPO de dano entre parênteses e continuam somando depois — `3d8 + BC (cortante) + 1d6 de
frio` são 3d8 **e** 1d6, os dois de verdade. Cortar no parêntese perderia dano legítimo; remover só o
miolo acerta os onze casos.

E a condição não se perdeu: o motor já sabia dobrar frio contra Molhado. Agora o Zero Absoluto rola
os 12d12 escritos e a dobra devolve exatamente os **24d12** que o livro promete — pelo mecanismo que
já existia. De quebra, a Cabeçada de Armas Pesadas (`Metade do dado (você sofre 1d4)`) parou de
contar como dano no alvo o `1d4` que a técnica cobra de **quem bate**.

### 🎯 Correr em linha reta não é atacar em área

A palavra `linha` sozinha marcava como **ataque em área** cinco técnicas que não têm área nenhuma — e
as três piores são as que a IA mais escolhe:

- **Investida** (Deus da Espada): *"avance até o dobro do deslocamento **em linha reta** e ataque ao
  final"*. A linha é o caminho de quem corre, não a forma do golpe. **Ela acertava os cinco inimigos
  do playtest, todo turno.**
- **Forma Quadrúpede** (Deus do Norte) e **Investida Devastadora** (Armas Pesadas): mesma frase.
- **Relâmpago** (Água) e **Golpe que Não Tem Origem** (Vendaval): *"alcance ilimitado (**linha de
  visão**)"*.

A rede agora pede uma linha **medida** — `linha de 18m`, `linha de 3 km` —, que é como o livro
escreve a forma de verdade, e cobre à parte os dois jeitos que ele usa pra dizer "atravessa e pega
quem está atrás". As 52 técnicas de área legítimas continuam em área.

### 📉 O playtest, de novo

| Ficha | Dano/batalha | Sobreviveu |
| ----- | ------------ | ---------- |
| **Mara** (Escudos) | 112 → **196** | 56% → **67%** |
| **Gorr** (Armas Pesadas) | 101 → **177** | 53% → 50% |
| **Vex** (Deus da Espada) | 92 → **29** | 28% → **8%** |
| **Borg** (Deus do Norte) | 116 → **56** | 39% → 24% |
| Sera (Cura) | 116 → **205** PV devolvidos | 44% → 33% |

**O Vex despencou porque a Investida dele era um ataque em área por engano.** Sozinha, ela
multiplicava o dano dele por cinco no confronto de times. Ele continua com 35 de dano por turno — o
terceiro melhor —, mas morre cedo: 8% de sobrevivência.

E isso deixa uma pergunta de balanceamento muito mais afiada que a da 0.1.35, agora no
`O-QUE-FALTA`: o livro chama o **Deus da Espada** de *"o maior dano do livro"*, e ele entrega **29
por batalha**. A **Mara**, cuja build está descrita como *"protege, não mata"*, entrega **196** e
lidera a sobrevivência. As duas descrições estão invertidas em relação ao que o simulador mede.

---

## 0.1.38 — "O Fio da Vida" · 2026-09-10

### 🎯 O pedido: um chefe tem que poder dizimar o grupo em pelo menos 25% das vezes

Para mirar nisso, primeiro foi preciso **medir**: a tabela de chefes mostrava vitória e mortes médias,
nunca a taxa de dizimação. "2,8 mortes médias" tanto pode ser *"quase sempre morrem três"* quanto
*"metade das vezes ninguém morre e na outra metade morrem todos"* — e são mesas completamente
diferentes. A coluna **DIZIMADO** existe agora.

Medido: **0% / 5% / 100%** no 3º, 4º e 5º patamares. Um penhasco, não uma curva.

### 🧨 Por que não havia meio-termo: o motor matava a 0 PV

O Cap. 4 §7 é explícito — *"Se seus Pontos de Vida chegarem a 0, você cai **Inconsciente**"*, rola o
**Fio da Vida** a cada turno, junta **Marcas da Morte**, e *"qualquer magia de cura aplicada por um
aliado remove todas as Marcas instantaneamente e você acorda"*.

O simulador tratava 0 PV como **morte instantânea e permanente**. Isso não era só infidelidade ao
livro: era a **causa** do resultado binário. Quem caía sumia da luta para sempre → o dano do grupo
despencava → a luta se alongava → caía o próximo. Realimentação positiva não produz resultado
intermediário; produz cara-ou-coroa.

Medido, no 4º patamar: um chefe com **49** de dano por turno perdia **97%** das vezes; com **51**,
ganhava **94%**. Dois pontos de dano decidiam tudo.

**O Fio da Vida entrou inteiro:** cair inconsciente, o teste de 1d20 + Vigor contra CD 8 + o Bônus de
Rank **de quem te derrubou** (o livro: *"um goblin de estrada te deixa em CD 9, um Rei-Demônio em CD
14"*), 1 Marca por falha e 2 no 1 natural, morte permanente na terceira, e a cura de aliado que
levanta e zera tudo. O curandeiro passou a **levantar quem caiu antes de qualquer outra coisa** — é o
trabalho mais importante dele no livro, e o motor não o tinha.

### 🩺 A tabela de chefes lutava contra o único time sem curandeiro

Ela usava *"o time que venceu o 5×5"*, o que já é estranho (a régua de chefe do livro dependendo de um
confronto entre jogadores) e virou um problema quando a cura entrou: o vencedor é sempre o Time B, e o
Time B não tem curandeiro. A tabela publicava o comportamento de um grupo **que não pode levantar
ninguém do chão**, e um Mestre lia aquilo como "o que acontece com um grupo".

Agora existe um **grupo de referência** nomeado — Mara, Vex, Lyn, Kest e **Sera** —, uma mesa
plausível: linha de frente, corpo a corpo, distância, mago e cura.

### 📉 O resultado, e o que ele revelou

| Chefe | Antes | Agora |
| ----- | ----- | ----- |
| 3º — Ameaça | 100% vitória · 0% dizimado | 100% · **0%** |
| 4º — Elite | 92% · 8% | **55% · 45%** |
| 5º — Terror | 0% · 100% | 0% · **100%** |

**O 4º patamar ganhou o meio-termo que não existia** — e já cumpre o alvo de 25%. Ele passou de
cara-ou-coroa para uma luta de verdade, com 4,8 rodadas em média, porque levantar um companheiro
interrompe a espiral.

**Os outros dois não se resolvem com calibragem, e isso foi medido, não estimado:**

- **3º patamar:** com **PV ×4 e dano ×1,3** — o quádruplo do PV que o livro manda — o grupo ainda
  vence 98% e é dizimado em 2%. Vinte e cinco combinações testadas.
- **5º patamar:** **0% de vitória em todas as 25 combinações**, inclusive com o dano cortado a 70%.
- Mexer só nas rodadas extras do chefe (`floor(n/2)` → `ceil(n/2)`) não move o 3º e **destrói** o 4º:
  55% → 0%.

Os três patamares pedem correções em **direções opostas**, e é por isso que nenhum ajuste global
serve: a tabela põe **um grupo de 12 PA (Avançado, 3º)** contra chefes de 3º, 4º e 5º. Um está abaixo
do nível dele, um está no nível, e um está dois acima. O que a tabela mede hoje não é "o chefe está
calibrado?", é "quão longe do nível do grupo está este chefe?".

**A decisão que sobra é sua**, e está no `O-QUE-FALTA`: um chefe do patamar do próprio grupo deve ser
uma luta de 25% de dizimação — e, se deve, o ajuste de Chefe do Apêndice G (*PV dobrado, mesmo dano*)
está fraco na paridade e precisa mudar no livro, não no script.

### 🧱 Por baixo

- `aplicarDano` passou a receber o Bônus de Rank de quem bate, pra gravar a CD do Fio da Vida na hora
  da queda — *"quem te derrubou decide o quanto é difícil voltar"*.
- `vivo: false` continua querendo dizer "fora da luta", que é o que as trinta e quatro checagens
  espalhadas pelo motor já entendiam; `inconsciente`, `marcasDaMorte`, `estabilizado` e `morto` dizem
  **se ainda dá pra voltar**.
- **13 testes novos** (402 no total), incluindo o d20 forjado que testa a regra em vez da sorte.

---

## 0.1.37 — "A Curandeira Não Bate" · 2026-09-10

### 📏 O instrumento via 20% do livro, e não era 20% espalhado

Contado: o livro tem **601** habilidades e talentos, e a lista de ações do simulador tinha **122**.
A distribuição é que era o problema:

| Árvore | O simulador via |
| --- | --- |
| Barreira e Proteção | **0 de 21** |
| Espíritos e Feras | **0 de 7** |
| Bardo e Interação | **0 de 6** |
| Navegação e Liderança | **0 de 6** |
| Estilo Deus da Água | 1 de 19 |
| Cura | 2 de 23 |
| Cavalaria e Escudos | 4 de 23 |
| … | … |
| Fogo | 14 de 19 |
| Água | 17 de 24 |

Quando o playtest dizia que o Fogo bate mais que a Barreira, comparava uma árvore lida a 74% com uma
lida a 0%. Isso não é achado de balanceamento — é artefato do instrumento.

E as árvores sobre as quais o `O-QUE-FALTA` ainda não tem resposta — **Invocador, Ladino, Bardo,
Tático, Barreira, Desintoxicação** — são exatamente as que o simulador via entre 0% e 20%. Aquela
lista não é um backlog: é a **sombra do ponto cego da ferramenta**.

### 💚 Cura e PV Temporários entraram

`acoesDe` **descartava** cura e PV Temporários com um filtro de texto. Recusar estava certo: os três
moram no mesmo campo do livro e o sinal é oposto — somar cura como dano já contou a *Prontidão* como
105 de dano por turno. O erro era **parar aí**.

Agora eles entram como o que são:

- **Cura**, com a dobra da **Ferida Fresca** (Cap. 4: *"o dano sofrido no turno atual ou no turno
  imediatamente anterior"*). É a mecânica que dá identidade à escola — a que faz o curandeiro agir
  cedo em vez de depois — e a *Prontidão*, que o livro chama de *"a magia que define a escola"*, cura
  **sempre** como Ferida Fresca.
- **PV Temporários**, gastos antes dos PV reais e sem acumular, como cada magia que os concede diz.
- **Cura em área** pega o grupo, do mesmo jeito que dano em área pega todos os inimigos de pé.

A IA ganhou uma regra de decisão **declarada**, não uma tática: cura quem estiver **na metade ou
abaixo**, começando pelo pior, e oferece casca a quem ainda não tem. O limiar de 50% não é neutro e
não finge ser — curandeiro que espera demais perde gente, o que cura cedo demais desperdiça.

### 🐛 Um erro de três vezes o valor, achado no meio do caminho

`rolarDados` soma **todo** grupo de dados que encontra, e o livro escreve os dois casos na mesma
linha: *"2d8 + BC de PV (4d8 + BC se Ferida Fresca)"*. A linha crua rola 2d8+4d8, e dobrar isso pela
Ferida Fresca devolveria **12d8 onde o livro promete 4d8**.

Medido com o erro dentro: o time da curandeira ganhava **20,1%** das batalhas. Corrigido: **8,3%**.
É o mesmo erro que o gerador de criaturas já tinha cometido — *"(24d12 contra alvo Molhado)"* somado
virava um cartão de 36d12 — e agora existe uma função só pra isso (`casoBase`) com teste próprio.

### 📊 O que mudou no playtest

O Time A (com a Sera) subiu de **6,7% para 8,3%** de vitória. E a tabela ganhou a coluna que
faltava:

| Ficha | Dano/batalha | PV devolvidos | Sobreviveu |
| ----- | ------------ | ------------- | ---------- |
| Vex | 93 | — | 35% |
| Gorr | 92 | — | 82% |
| Mara | 91 | — | 92% |
| **Sera** | **21** | **44** | 8% |
| Lyn | 32 | — | 87% |

A Sera saiu do fim da tabela para o quinto lugar em contribuição — e o que mudou não foi a ficha
dela, foi a régua. A ordenação agora é por dano **mais** PV devolvidos: somar os dois não afirma que
1 de cura vale 1 de dano, afirma que os dois são maneiras de gastar um turno.

### 🧱 O que foi consertado por baixo

- **Uma porta só pra dano.** `alvo.pv -= dano` estava copiado em cinco lugares. Enquanto dano era
  subtração, cinco cópias eram feias e inofensivas; PV Temporários e Ferida Fresca são consequências
  de LEVAR dano, e um lugar que não as aplicasse viraria buraco silencioso. Agora tudo passa por
  `aplicarDano`.
- **Fábricas em vez de literais.** Acrescentar dois campos ao `Alvo` acusou **dez** literais montados
  à mão, cada um repetindo onze campos que ninguém lê. `novoAlvo` e `novaAcao` cobram só o que
  distingue cada caso — o próximo campo novo não quebra dez arquivos.
- **O orçamento do chefe** passou a considerar a casca no teto do golpe. Sem isso ele transbordaria
  pro próximo alvo enquanto a casca deste ainda estava de pé: dois pelo preço de um.
- A tela `/encontros` herdou tudo: as fichas do grupo agora se curam nas 300 batalhas de teste.

**25 testes novos**, incluindo o de ponta a ponta que é a razão de todo o resto existir: um grupo com
curandeiro tem que aguentar mais pancada que o mesmo grupo sem ele.

---

## 0.1.36 — "Dez Destinos Viraram Sete" · 2026-09-10

### 🧭 A barra do topo tinha dez links

Ela cresceu um por ferramenta nova, e uma barra com dez respostas deixa de ser uma pergunta. Três
saíram — e nenhum por ser pouco usado.

**O Modo Mesa saiu porque a tela saiu.** Ele era a ficha com botões grandes: as mesmas reservas, as
mesmas condições, e a diferença toda em não precisar digitar no meio de um turno. Uma segunda ficha
pra ter botões é caro demais pelo que entrega — então os botões foram pra ficha, e a segunda ficha
deixou de existir.

O que a ficha ganhou:

- **Passos de −5/−1/+1/+5** em PV, PM, PT, PP e Calor, ocupando a largura inteira do cartão. O campo
  numérico continua ali: botão pro turno, digitação pra correção entre sessões.
- **A faixa de "de quem é a vez"**, no topo, com o botão de passar o turno. Ela **desaparece** quando
  não há combate montado — numa ficha, uma faixa permanente anunciando ausência de combate seria
  ruído em cima de tudo que se lê pra montar personagem.

Nada se perdeu na troca. O **registro de sessão** conta o dano levado a partir do passo negativo de
PV, e o Modo Mesa era o único lugar que o produzia; agora quem o produz é a ficha, com a mesma
assinatura de quem estava agindo. Era a única função que a tela tinha sozinha, e ela mudou de
endereço, não de existência.

### 🎲 Iniciativa e Encontros agora moram no Painel do Mestre

As duas são trabalho de Mestre, e o `/mestre` passou a ser a porta delas — junto do **comparador de
builds**, que já estava fora da barra pelo mesmo motivo e agora deixou de ser exceção. O painel abre
com três cartões, e cada um diz o que a ferramenta **responde**, não o que ela é: *"este encontro
mata a mesa?"* informa; *"Encontros"* não informa nada a quem nunca abriu.

**Cartões, e não abas.** As três telas somam mais de duas mil e setecentas linhas de componente, e
juntá-las numa rota só cobraria isso do celular de quem só queria consultar os PV do grupo. As rotas
`/encontros`, `/iniciativa` e `/comparar` continuam de pé: link salvo, busca global e pré-cache
offline seguem funcionando como antes. O rodapé — a segunda navegação do site — ganhou as três.

A barra ficou com **Ficha, Árvores, Personagens, Mestre, Loja, Livro, Busca**.

### ✅ O que foi verificado

As quatro checagens headless passam com a rota a menos: nenhuma das 16 rotas transborda entre 320 e
414px, nenhum alvo de toque abaixo de 24px nas telas novas, contraste AA nos dois temas, e as 19
rotas do pré-cache continuam abrindo com o servidor morto. Duas contagens escritas à mão nos
checadores ("dezessete rotas") passaram a sair do tamanho da própria lista — um número desses
envelhece calado a cada rota que entra ou sai.

---

## 0.1.35 — "A CA era Decoração" · 2026-09-10

### 🎯 Nenhuma técnica do livro errava — literalmente nenhuma

O simulador decide se uma técnica **rola ataque** (e portanto pode ERRAR) procurando frases como
*"Ataque mágico à distância"* no texto dela. Ele procurava no **campo errado**: lia a fórmula de
dano, e a frase mora na descrição do efeito.

Medido: **zero das 122 ações do livro inteiro rolavam ataque.** Todas caíam no ramo de teste de
resistência, que não consulta a CA do alvo e garante **metade do dano** mesmo quando o alvo passa no
teste.

Ou seja: a **Classe de Armadura era decoração** em toda simulação que este projeto já rodou, e toda
técnica de dano acertava sempre. Dezessete técnicas voltaram a poder errar — quatro de Fogo, quatro
de Água, cinco do Vendaval, duas de Vento, duas de Terra, e uma cada de Deus da Água, Deus do Norte e
Armas Pesadas.

A rede não foi alargada além do necessário: incluir *"ataque corpo a corpo"* pegaria mais duas
técnicas certas e uma errada — a **Devolver**, do Deus da Água, cuja frase descreve o ataque DO
INIMIGO que dispara a Reação.

### 🧠 A IA sabia resolver e não sabia escolher

O mesmo erro tinha um irmão na outra ponta do arquivo. **Quinze técnicas do livro** multiplicam o
dado da arma (*"+2 Dados de Arma"*, *"Dado de arma rolado cinco vezes"*) em vez de trazer dados
próprios — entre elas **cinco das seis ações de dano do Deus da Espada**, que o livro chama de maior
dano do jogo. A **resolução** sempre as rolou; a IA que **escolhe** contava zero nelas e preferia
qualquer outra coisa.

A escolha passou a ser por **dano esperado contra o alvo da vez**: dados próprios, mais Dados de
Arma, mais o bônus fixo, tudo multiplicado pela chance real de acertar aquela CA. Nenhuma regra nova
— é a mesma aritmética que o motor já executava com os dados na mão, só que agora a decisão a
conhece. Um teste roda **oito mil resoluções** e compara com a previsão: as duas contas não podem
mais divergir em silêncio.

A tabela de dano por turno do relatório também tinha a conta dela, e agora chama a mesma função do
motor. Ela ganhou a coluna que faltava: **"contra CA 15"** — porque dano por turno só existe contra
alguém.

### 📉 O playtest mudou de dono

| Ficha | Dano/batalha | Sobreviveu |
| ----- | ------------ | ---------- |
| **Mara** (Escudos) | 67 → **95** | 97% → 93% |
| **Borg** (Deus do Norte) | 54 → **81** | 0% → 2% |
| **Gorr** (Armas Pesadas) | 67 → **79** | 90% → 72% |
| **Vex** (Deus da Espada) | 94 → **69** | 45% → **28%** |
| Kest (Fogo) | 23 → 33 | 0% → 2% |
| Dorn (Terra) | 19 → 31 | 1% → 7% |
| Sera (Cura) | 17 → 31 | 3% → 7% |
| Lyn (Arquearia) | 22 → 29 | 93% → 80% |
| **Iri** (Vento) | 53 → **19** | 72% → 47% |
| Elina (Água) | 5 → 8 | 0% → 0% |

**Vex era o maior beneficiado por nunca errar**, e é quem mais perde quando a CA volta a existir —
mesmo ganhando os Dados de Arma que a IA agora enxerga (o golpe dele subiu de 21 pra 35 por turno).

**Mara virou a maior causadora de dano do playtest.** A build está descrita como *"protege, não
mata"*, e o simulador discorda em toda linha. Isso é balanceamento pra olhar, não número pra
comemorar.

**Iri desabou.** As técnicas dela custam duas Ações, e a conta certa mostra que duas Ações raramente
compensam contra três golpes de uma.

A vitória do Time B caiu de 97% pra 93%, e a **tabela de chefes não se mexeu em nenhuma linha**.

### 🔨 Quebrantado entrou na simulação

Das cinco condições que o motor declarava não modelar, **Quebrantado era a única puramente
numérica**: cada acúmulo tira 1 da CA e 1 do dano de quem o carrega, até o teto do Bônus de Rank de
quem aplicou (Cap. 4, §2). As outras quatro (Atolado, Desequilibrado, Marcado, Soterrado) são sobre
movimento e posição, e este motor não tem mapa.

Custo da ausência: as **treze citações** de Quebrantado no livro inteiro são de UMA árvore, Armas
Pesadas, cuja mecânica central é justamente empilhá-los — e o playtest tem uma build literalmente
chamada *"Lutador — empilha Quebrantado"*. A simulação lia esses acúmulos como texto decorativo.

O motor lê os acúmulos **da prosa** da técnica, exceção deliberada à regra dele de só ler campos
estruturados. Isso só é seguro porque a condição é de uma árvore só e **nenhuma técnica do livro a
REMOVE** — e agora existe um teste que quebra no dia em que qualquer uma dessas duas coisas deixar de
ser verdade.

**Declaração honesta:** ligar ou desligar Quebrantado **não muda um número** do playtest. A IA
continua sem dar valor a condição — ela escolhe pelo dano, e as técnicas que empilham acúmulos
raramente são as de maior dano. A mecânica está correta e testada; quem vai colhê-la é o jogador na
mesa. Uma IA que enxergue o valor de uma condição é a próxima melhoria de verdade do motor, e está
anotada no `PROGRESS.md`.

---

## 0.1.34 — "Comprar o Quê?" · 2026-09-10

### 🔊 Os botões passaram a dizer o que fazem

Numa grade de 85 itens da loja, um leitor de tela anunciava **"Comprar, botão"** oitenta e cinco
vezes seguidas. O texto visível basta pra quem enxerga o card em volta; não basta pra quem só ouve o
botão.

Agora cada um anuncia **o nome e o preço** — na loja, nas árvores e nas magias combinadas.

Os **números que mudam sozinhos** também passaram a ser anunciados: o PA gasto, que muda por causa de
uma compra feita em outra tela, e as reservas do Modo Mesa, que mudam por botão no meio do turno.
Antes, quem só ouve recebia **silêncio** como confirmação da compra.

Isto é a metade previsível do teste com leitor de tela. A outra metade — se a ordem de foco conta a
história certa, e se dá pra montar um personagem sem enxergar — continua precisando de meia hora de
escuta humana.

---

## 0.1.33 — "Aponte a Câmera" · 2026-09-10

### 📷 A ficha vira um QR

Entre dois celulares na mesma mesa, o caminho mais curto não é link nem arquivo: é **apontar a
câmera**. Não passa por aplicativo de mensagem, não depende de o link sobreviver inteiro, e não
precisa de gerenciador de arquivos.

O botão **QR** fica ao lado de Compartilhar e Copiar link. O código abre logo abaixo, sobre **fundo
branco fixo** — a única superfície do site que ignora o tema, porque um QR escuro sobre pergaminho
escuro é um QR que a câmera não enxerga.

Ele avisa quando o código fica **denso demais** pra ser lido de longe, e diz quando a ficha
simplesmente **não cabe** (acima de 2.953 caracteres, o teto do formato) em vez de desenhar um código
impossível. Funciona sem internet, como o resto do site.

### 🔬 E a prova de que ele lê de verdade

A objeção contra fazer isso era boa: *não dá pra verificar um QR sem uma câmera, e um QR que desenha
mas não lê é uma funcionalidade que mente.*

A resposta foi **decodificar o QR gerado com uma implementação independente**, dentro do teste. O
código é rasterizado exatamente como aparece na tela e lido de volta; se o texto não voltar idêntico,
o teste falha.

Isso pescou dois defeitos de verdade:

1. **Texto com acento saía corrompido** — o modo byte do gerador não usava UTF-8. O link nunca teria
   acento, mas o componente é genérico.
2. **A versão 23 do formato não é lida.** Varrendo as 40 versões, 39 voltam perfeitas e uma não
   volta, em qualquer tamanho de renderização — o que descarta "ficou pequeno". Como esse
   decodificador é o leitor por trás de boa parte dos scanners que rodam em navegador, o site agora
   **pula a versão 23** e usa a seguinte. Custa quatro módulos a mais; a alternativa era uma ficha
   que algumas câmeras nunca abririam.

---

## 0.1.32 — "Rolar a Perícia" · 2026-09-10

### 🎲 Não existia lugar nenhum pra rolar uma perícia

Provavelmente **a rolagem mais frequente da mesa**, e o site não tinha onde fazê-la: a ficha listava
as perícias sem botão, e o rolador tinha quatro fontes de Teste — Livre, Atributo, Magia e Marcial —
nenhuma delas perícia.

Agora **tocar numa perícia da ficha** abre o rolador com a conta pronta, e o rolador ganhou a fonte
**Perícia** com a lista das que o personagem tem. O chip mostra o total já somado, que é o número que
se fala em voz alta na mesa.

- **A conta é a do Cap. 1, §4 inteira:** atributo da Lista Mestre, mais o Bônus de Rank quando uma
  árvore de Utilidade cobre aquela perícia — e **só quando você realmente a tem**, porque sem a
  perícia não existe teste treinado onde somar o bônus.
- **Duas árvores cobrindo a mesma perícia** (Percepção, no Ladino e no Tático) não somam: vale o
  maior, como manda o Empilhamento do Cap. 4.
- **A Vantagem por ter a perícia não é aplicada sozinha.** O livro diz que ela vale *"quando a
  perícia se encaixa perfeitamente na situação"*, e esse **quando** é julgamento do Mestre — a tela
  avisa que o personagem tem a perícia e deixa a decisão com a mesa.

### 🧱 O dado que faltava pra isso existir

O Bônus de Rank em perícia estava escrito só na **prosa** de cada árvore ("soma em Furtividade,
Ladinagem, Percepção…"), e prosa não é computável: ler aquilo exigiria adivinhar por regex numa frase
escrita à mão, que quebra em silêncio no dia em que alguém a reescrever.

As três árvores de Utilidade passaram a **declarar a lista** das perícias cobertas. A prosa continua
sendo o que o livro imprime; a lista é o que a ficha calcula — e um teste garante que as duas nunca
divirjam, inclusive que só as de Utilidade cobrem perícia alguma.

---

## 0.1.31 — "O Que a Mesa Mostrou" · 2026-09-10

### 📓 O site passou a contar sozinho

Metade das pendências de balanceamento pede uma contagem que só sai no papel. A do Vendaval é
literal: *"conte os ataques corpo a corpo que **acertaram** o Vendaval e compare com o outro da linha
de frente"*. Ninguém faz isso com lápis no meio de uma sessão — e é por isso que essas pendências não
fecham.

O **`/sessao`** conta sozinho, **sem pedir nenhuma digitação**. Ele pega carona no que já acontece:

- cada rolagem do rolador entra **assinada por quem está agindo** (o tracker de iniciativa já sabe);
- cada passo negativo de PV no Modo Mesa **é** um golpe levado.

No fim aparecem os números que o balanceamento pede: quantas rolagens, quantos críticos, o que mais
se repetiu, quem rolou mais — e, a coluna que responde a pergunta do Vendaval, **quanto dano cada
personagem levou e em quantos golpes**.

**Ele começa desligado**, e é uma decisão: gravar por padrão transformaria toda partida numa coleta
silenciosa, num site inteiro construído em cima de dado que não sai do aparelho.

### 🚫 E o que ele não finge saber

**Se um ataque acertou.** O site vê a rolagem, não a CA do alvo — quem decide o acerto é o Mestre, na
cabeça dele. Uma taxa de acerto ali seria número inventado.

---

## 0.1.30 — "Duas Builds, Um Alvo" · 2026-09-10

### ⚖️ Comparar deixou de ser opinião

Metade das pendências de balanceamento do projeto é *"jogar e ver"* — e parte delas tem um lado que
dá pra **medir antes da mesa**. Enquanto não se mede, "essa build é mais forte" é palpite com número
nenhum atrás.

O **`/comparar`** põe duas fichas do roster lado a lado: PA gastos, conhecimentos, PV, CA,
iniciativa, reservas, o maior golpe de cada uma — e o resultado de **400 batalhas contra o mesmo
alvo**.

- **Mesmo alvo, mesma semente.** Um alvo diferente pra cada uma compararia dois encontros, não duas
  builds; e sem semente fixa, a diferença entre 62% e 58% pode ser só o dado.
- **O alvo é o molde do Apêndice G, sem truques.** Assim ele gasta o orçamento de dano do patamar
  inteiro todo turno — a criatura média contra a qual a régua do livro foi calibrada. Uma criatura
  com habilidades mediria quão bem cada build responde *àquela* habilidade.
- **Ele não diz qual build é melhor**, e a tela repete isso: cura, controle e utilidade não aparecem
  numa luta de um contra um. Uma build que perde nos dois números pode ser exatamente a que a mesa
  precisa.

### 🧭 E a barra do topo respirou

Com dez destinos, "Livro de Regras" era o rótulo que empurrava a **Busca** pra fora da tela em
monitores estreitos. Virou **"Livro"**.

O comparador fica **fora do menu** de propósito: comparar builds é coisa de preparo, não destino de
sessão. Ele é alcançado pelo roster e pelo Painel do Mestre — os dois lugares de onde a pergunta
nasce.

---

## 0.1.29 — "Ctrl+P" · 2026-09-10

### 🖨️ A ficha agora imprime como ficha

O PDF do Typst continua sendo o documento bonito de três páginas — e ele **precisa do servidor**,
porque é lá que o Typst roda. Isto é o outro caminho: **Ctrl+P na própria ficha**, funcionando
**offline**, porque é só CSS.

A regra do recorte é a mesma do Modo Mesa: **fica o que se consulta dentro de um turno**.

- **Saem** os botões, as condições, o descanso, o simulador, a lore, o rodapé e o rolador. Nenhum
  deles é conteúdo de ficha, e no papel viravam caixas mortas ocupando o espaço das magias.
- **Saem** as três formas de conjuração e o cântico de cada magia: numa folha de consulta o que
  importa é custo, alcance e efeito.
- **Impressão é sempre em tema claro.** Uma ficha impressa no escuro é uma folha inteira de tinta
  preta com letra clara por cima — gasta o cartucho e sai ilegível em laser comum.
- **Foto, capa e arte de fundo não vão pro papel.** Numa impressora doméstica a arte do cabeçalho
  sozinha come mais tinta que a ficha inteira, e ela é ambientação, não informação.
- **O rodapé impresso diz de onde a folha veio** e pede pra conferir a versão viva: uma ficha
  desatualizada circulando na mesa é pior que nenhuma.

---

## 0.1.28 — "O Mestre Olha a Mesa" · 2026-09-10

### 👁️ As fichas do grupo lado a lado

O montador de encontros já simula contra as fichas de verdade — mas isso responde uma pergunta de
**preparo**: *este encontro mata a mesa?* Entre um turno e outro o Mestre tem outra, e ela é de
**consulta**: quem está mais machucado, quem ainda tem recurso, quem está com o quê pegando.

O **`/mestre`** põe isso numa tela: PV com barra, CA, iniciativa, PM/PT/PP, as condições ativas de
cada um, e **o maior golpe** que cada personagem consegue dar, com o nome do golpe ao lado.

- Ordena por **quem está pior primeiro** — a ordem em que o Mestre olha a mesa quando decide em quem
  o monstro bate. Abaixo de metade dos PV, o card ganha moldura própria.
- O painel **lê** as fichas e nunca escreve nelas: mexer nos números de um personagem continua sendo
  de quem joga com ele.

### 🚫 E um número que ele deliberadamente não mostra

*"Dano por turno do grupo"* contra a régua do Apêndice C parecia o número mais óbvio a exibir aqui —
e é exatamente o que a própria régua avisa **não ser automatizável**: ela embute quantas Ações a
árvore gasta, quantos alvos ela pega e se o alvo veste Touki, e nada disso está nos dados de uma
magia isolada.

Somar médias de golpes daria um número com cara de verdade e sem verdade nenhuma. No lugar dele
aparece o que dá pra afirmar: a média do **maior golpe único** de cada um.

---

## 0.1.27 — "Modo Mesa" · 2026-09-10

### 🎯 Uma tela só, aberta a sessão inteira

Ficha, iniciativa, encontros e rolador são quatro rotas — e numa sessão de verdade a pessoa alterna
entre elas o tempo todo, num celular, com uma mão, enquanto é a vez dela. Cada troca é um toque e uma
perda de contexto, e o contexto que se perde é justamente **de quem é o turno**.

O **`/mesa`** junta o que se usa *dentro* de um turno:

- **De quem é a vez**, com o próximo já anunciado e um botão grande de Passar.
- **Suas reservas**, mudando por passos de −5, −1, +1 e +5 em vez de campo numérico: digitar exige as
  duas mãos e a atenção que o turno está consumindo.
- **O que está pegando em você**, com o resumo do que isso muda e um toque pra tirar.
- **Os PV de todo mundo** no combate, com −1/+1 do lado.

O dado já está em todas as rotas desde a 0.1.22, então não precisa ser desenhado aqui.

**O que não entra é tão importante quanto.** Nada de editar ficha, comprar habilidade ou montar
criatura: isso acontece entre sessões, e cada uma dessas coisas já tem uma tela que faz melhor. Uma
tela de mesa que também servisse pra construir personagem voltaria a ser a ficha — e o problema
voltaria junto.

---

## 0.1.26 — "Eu Aguento Isso?" · 2026-09-10

### ⚔️ O simulador saiu da mão do Mestre e chegou na do jogador

O `/encontros` sempre soube rodar 300 batalhas contra as fichas do grupo — mas isso responde a
pergunta do **Mestre**: *este encontro mata a mesa?* A pergunta do jogador é outra, e mais simples:
*quantos turnos eu aguento contra um Sapo-Lodo? e contra três?*

A ficha agora responde. Escolha uma criatura do Apêndice G (ou uma do seu bestiário), diga quantas, e
veja **chance de vitória, rodadas médias e quanto PV sobra**.

- **Nenhum número novo foi inventado:** é o mesmo motor que já trava a régua do Apêndice C nos testes.
- **É você sozinho**, e a tela diz isso. A pergunta é sobre a sua build, não sobre o grupo — um
  resultado que incluísse aliados imaginários responderia outra coisa. A conta do grupo continua em
  `/encontros`, contra as fichas de verdade.
- **A semente é fixa:** repetir a mesma escolha dá o mesmo número. É o que permite comparar duas
  builds; um resultado que dança a cada clique não serve pra decidir nada.

---

## 0.1.25 — "Dormir Conta" · 2026-09-10

### 🛏️ Descanso virou botão, com a conta à vista

Descanso Curto e Longo acontecem na ficha, pelas regras exatas do Cap. 4, §7. **Nada muda sozinho:**
a tela mostra quanto vai devolver de cada reserva e de onde saiu cada número ("25% de 40", "20%
rolado no Vigor"), e só aplica no segundo toque. Um número que aparece sem a conta ao lado é um
número que a mesa não confere — e o que a mesa não confere, ela não confia.

- **O Curto não devolve PV. Nenhum.** É a regra mais importante do capítulo — *"a carne não fecha
  sozinha"* — e é dela que depende a promessa de que um grupo sem curandeiro sangra na segunda luta.
- **O teto de dois Curtos** entre dois Longos é cobrado de verdade: o terceiro é recusado, e o botão
  diz em quantos você está. O Longo zera a contagem, porque é ele que vira o dia.
- **Os PT voltam inteiros no Curto.** A tabela do Cap. 4 lista PT entre os 25%, e o aviso logo abaixo
  dela diz que isso está errado; o site segue os dois trechos que corrigem, não o que foi corrigido.

### 🗓️ E o Downtime saiu do papel

As seis atividades de uma semana livre (Cap. 5, §1) estão na ficha. **Trabalhar** rola 2d6 × seu
maior Bônus de Rank e o ouro entra na hora; **Recuperar-se** enche os PV. As outras quatro são
combinação de mesa — o site mostra o texto em vez de fingir que resolve.

Nenhuma concede PA, magia, talento ou Rank, e a tela repete isso: progressão só vem de jogar a
campanha.

### ⚠️ Uma contradição do livro que precisa de você

Sobre quanto **PM** o Descanso Curto devolve, o livro diz duas coisas: a **tabela** do Cap. 4 diz
**25%**, e o **aviso logo abaixo dela** e o **Cap. 3** dizem **metade**. Não é detalhe — o próprio
aviso constrói a defesa do teto de dois Curtos em cima da conta de 50%.

O site segue a tabela (25%) por enquanto, porque é o número que a mesa lê na hora de aplicar.
Escolher o maior sem o autor mandar seria dobrar, por conta própria, o recurso do qual a Magia de
Cura converte PV.

---

## 0.1.24 — "A Ficha Sabe Que Você Está Envenenado" · 2026-09-10

### ⚡ Condição deixou de ser anotação no papel

A ficha ganhou uma seção de **Condições**: marque Envenenado, Preso, Quebrantado, e o site passa a
saber. Ela fica logo abaixo dos números que ela muda — ler as duas coisas juntas é o que faz um
número menor parecer **explicado** em vez de errado.

- **Quebrantado** é a única condição do livro que mexe num número, e agora mexe de verdade: **−1 na
  CA e −1 no dano por acúmulo**, com os acúmulos contados na ficha.
- **O rolador olha as condições.** Envenenado? ele avisa que aquela rolagem deveria sair com
  Desvantagem e deixa o botão de aplicar a um toque. Ele **não força**: a condição pode ter acabado
  de sair, a habilidade pode ter exceção, e o Mestre pode ter combinado outra coisa.
- Deslocamento zerado, quem te ataca com Vantagem, dano no início do turno e perda de Ações aparecem
  num resumo do que está valendo — sempre dizendo **qual** condição causou. A diferença entre
  "Desvantagem" e "Desvantagem por Envenenado" é a diferença entre a mesa aceitar o número e
  entender o número.
- **Fim de combate** limpa tudo de uma vez, que é como a mesa realmente limpa a ficha.

### ⏱️ O que ela não tenta fazer: contar rodadas

A duração das condições do Cap. 4 é escrita em prosa — *"até quebrar o gelo"*, *"enquanto a fonte do
medo estiver visível"*. Um contador numérico obrigaria a mesa a **inventar** um número que a regra
não pediu, e a mantê-lo atualizado a cada turno pra ele não mentir.

No lugar dele, cada condição tem um campo de nota livre, com a duração padrão do livro já como
sugestão. Quem quiser escreve "CD 12 Força pra sair" ou "até o fim do combate".

---

## 0.1.23 — "A Condição Que Se Explica" · 2026-09-10

### 🔗 "O alvo fica Envenenado" agora diz o que isso faz

O glossário do Cap. 4 sempre avisou que é *"aqui, e só aqui"* que cada condição tem definição
completa — e centenas de habilidades a citam pelo nome sem repetir o efeito. Na mesa isso era: ler a
magia, não lembrar o que **Quebrantado** faz, sair da magia, procurar o capítulo 4, voltar. No meio
do turno.

Agora a condição citada na prosa é **clicável** e o verbete abre ali mesmo, embaixo do parágrafo.
São **221 citações reconhecidas** no livro inteiro, e vale também na busca e no Grimório da ficha —
os três desenham o mesmo card.

Duas regras que fazem o reconhecedor funcionar:

- **Maiúscula obrigatória**, seguindo a convenção do próprio livro. Não é preciosismo: metade dos
  nomes é palavra comum do português, e sem ela *"preso ao chão"* e *"marcado pela guerra"* virariam
  links. Um glossário que acende em toda frase deixa de ser glossário.
- **Flexão de gênero e número**: "as criaturas ficam **Seladas**", "cai na fenda e fica **Presa**",
  "duas ficam **Caídas**". Casar só a forma do dicionário deixaria a maioria das citações de fora.

### 📚 E o glossário virou dado

As 24 condições saíram de uma tabela escrita à mão no capítulo e viraram `src/data/condicoes.ts`. A
tabela impressa no livro é **gerada** de lá, então não existe cópia pra divergir.

Cada uma carrega, além do texto, o que a ficha consegue aplicar sozinha — Desvantagem em ataque,
Deslocamento zerado, dano no início do turno. O que depende do Mestre decidir continua sendo prosa:
um campo que fingisse saber *"enquanto a fonte do medo estiver visível"* mentiria em metade das
mesas.

---

## 0.1.22 — "O Dado Segue Você" · 2026-09-10

### 🎲 O rolador existia só na ficha

Ele nasceu dentro do `CharacterSheet`, o que fazia sentido enquanto rolar dado fosse uma coisa que se
faz **olhando a ficha**. Não é: no meio do combate a pessoa está no tracker de iniciativa vendo de
quem é o turno, ou em `/encontros` com a criatura aberta — e era exatamente aí que ela tinha que sair
da tela pra rolar um d20.

Agora o botão está em **todas as rotas**, com o mesmo estado: o histórico da sessão, os macros
salvos e o atalho `R` continuam onde estavam, e trocar de tela não perde nada.

Ele já era global em tudo menos na montagem — o estado sempre morou fora da ficha
(`useDiceRollerStore`, `useMacroStore`), e o personagem vem do `useActiveCharacter`, que devolve uma
ficha em branco quando não há nenhuma ativa. O que faltava era o rolador estar montado onde a mesa
está.

---

## 0.1.21 — "O Atalho Que Faltava" · 2026-09-10

### ⭐ Macro agora guarda Teste, e não só dano

Os macros do rolador só sabiam guardar **fórmula de dano** — "Bola de Fogo → 2d10+5". Metade do que se
repete numa sessão é o outro lado: *Furtividade com Vantagem*, *resistir ao veneno*, *iniciativa*.
Tudo d20 com um modificador e um modo de vantagem, e nada disso cabia numa fórmula de dados.

Agora há uma **estrela ao lado do "Rolar 1d20"** que guarda o teste como ele está: o nome que o
próprio rolador já dava, o modificador e o modo de vantagem. Um toque pra salvar, um toque pra
repetir a sessão inteira.

- **Macro de teste rola d20 de verdade, com crítico.** Se caísse na rolagem de dano, um 20 natural
  viraria só mais um número.
- **Guarda o modificador já somado**, e não a fonte que o produziu. Macro é atalho de mesa, não
  pedaço de ficha: guardar "Ataque Mágico de Fogo" faria o atalho mentir no dia em que o personagem
  subisse de rank — ou ao ser usado com outro personagem do roster.
- **O que já estava salvo continua ali**, como macro de dano. Macro que some sem explicação é
  indistinguível de defeito; e um registro sem fórmula é descartado em vez de virar um botão que rola
  zero.

---

## 0.1.20 — "Um Toque, e Foi" · 2026-09-10

### 📲 Passar a ficha adiante virou um toque

A ficha e a criatura ganharam um botão **Compartilhar** que abre a bandeja do próprio celular — a
mesma de qualquer app. Escolhe o contato e acabou: sem área de transferência, sem baixar arquivo, sem
gerenciador de arquivos.

Ele manda o **link**, e não o arquivo, de propósito: um link termina com o amigo abrindo o site já na
tela de importar, com um toque; um arquivo termina com ele segurando um `.mtficha` que nenhum
aplicativo do telefone sabe abrir. O arquivo continua existindo para o que só ele resolve — levar a
**foto e a capa** junto, que não cabem no link.

- O botão **só aparece onde a bandeja existe**. Onde não existe, nada muda: o "Copiar link" continua
  sendo o caminho garantido.
- **Cancelar não acusa erro.** Fechar a bandeja é uma decisão, não um defeito — e o navegador
  sinaliza os dois casos do mesmo jeito, então era fácil errar isso e fazer a ficha piscar erro toda
  vez que alguém mudasse de ideia.

### 🏠 E o site diz que dá pra instalar

O site é instalável desde a 0.1.15 — manifesto, ícones, splash e três atalhos de tela inicial. Só que
isso servia apenas a quem sabia caçar "Adicionar à tela de início" no menu do navegador. Agora tem um
botão no rodapé.

- **Android:** instala de um toque.
- **iPhone:** o Safari não tem API de instalação e nunca vai ter, então o botão **ensina** o caminho
  de dois passos, com o ícone real de Compartilhar do iOS.
- **Já instalado:** o botão some sozinho. Um "Instalar" dentro do app instalado é a definição de
  ruído.

---

## 0.1.19 — "O Link Que Chegou Pela Metade" · 2026-09-10

### 🔗 Uma frase só para cinco problemas diferentes

Um link de ficha que não abre podia ser cinco coisas: o aplicativo de mensagem comendo a parte depois
do `#`, um link de **criatura** aberto na tela de **ficha**, o link cortado no meio, o navegador
antigo demais, ou um conteúdo que não é ficha. A tela dizia *"este link não traz uma ficha"* para os
cinco — e quem recebia não tinha como saber de quem era o problema.

Agora cada caso tem título próprio, explicação e, o que mais faltava, uma **saída**. Quando o link
chega cortado, a tela diz **quantos caracteres chegaram**: é o número que faz o remetente entender na
hora o que aconteceu.

### 🍎 O link que não abriu no iPhone tem nome

A descompressão que o link usa (`DecompressionStream`) só existe no Safari **a partir do iOS 16.4**,
de março de 2023. Num iPhone mais antigo o link comprimido não abre — e o erro era engolido por um
`try/catch`, virando "link inválido", que manda a pessoa culpar o link e quem mandou.

A tela agora reconhece o caso e diz o que é: **o navegador é antigo demais, não é problema do link
nem da ficha**. E oferece as três saídas reais — atualizar o iOS, abrir em outro aparelho, ou pedir o
arquivo `.mtficha`.

> Falta confirmar com o aparelho na mão que era isso mesmo. O outro suspeito do mesmo relato é o
> aplicativo de mensagem cortando o link, e os dois agora têm tela própria.

### 📋 Colar o link, em vez de baixar arquivo

Toda tela de link que falha ganhou um **campo de colar**. É o caminho principal no celular: baixar um
arquivo e achá-lo de novo num gerenciador de arquivos é o passo em que a importação morre num
telefone.

Ele aceita o link inteiro ou só o fim dele — e, o detalhe que resolve o caso mais comum, aceita o
link **quebrado em várias linhas**. Quando o aplicativo parte um link longo e só a primeira linha
vira clicável, colar as duas aqui faz a ficha voltar a abrir.

### 📏 E agora se sabe quanto o link pesa

| Personagem | Conhecimentos | Link |
| --- | --- | --- |
| 1 árvore inteira até Imperador | 31 | ~1.086 |
| 2 árvores | 67 | ~1.594 |
| 3 árvores | 98 | ~2.058 |
| 4 árvores | 129 | ~2.490 |
| 5 árvores | 164 | ~2.990 |

O teto que morde é o **Discord: 2.000 caracteres por mensagem** — e ele morde mais cedo do que se
imaginaria: **duas árvores passam, três já não passam**, e três árvores é um multiclasse comum de
campanha longa. Depois de copiar um link grande demais, a ficha avisa (com o número) e manda usar o
arquivo.

A mesma medição matou uma ideia que parecia boa: *"gera o link sem compressão, aí o Safari velho
lê"*. Sem compressão, a ficha de **uma** árvore sai com ~4.650 caracteres, mais que o dobro do teto.
A compressão aqui não é otimização: é o que faz o recurso existir.

---

## 0.1.18 — "A Porta Errada" · 2026-09-10

### 🚪 O site respondia 404 em inglês

Um endereço errado devolvia literalmente *"404: This page could not be found."* — **em inglês**, num
site declarado `lang="pt-BR"`, e com **dois `<title>`** no mesmo documento, porque a tela embutida do
framework trazia o dela por cima do que o layout já tinha escrito.

Agora existe uma página de verdade: em português, **dentro do layout** (menu, rodapé, fonte e o tema
escolhido), com um título só, e ainda respondendo `404` pra quem consulta o status.

Ela diz a coisa que importa antes de qualquer outra: **um endereço errado não apaga personagem
nenhum**. E oferece os caminhos que restam — roster, ficha, livro — mais a busca, pra quem procurava
algo cujo endereço não sabia.

### 🩹 E um erro de execução era indistinguível de falta de sinal

Sem tela de erro própria, qualquer defeito de runtime caía na tela padrão do framework. Isso ficou
pior depois da 0.1.15: **offline, essa tela é idêntica a "faltou rede"**, e quem está numa mesa sem
sinal não tinha como saber se acabou de perder a ficha.

A tela nova separa os dois casos:

- **Sem rede:** diz que o site inteiro funciona offline, e que o mais provável é esta tela ter pedido
  algo que só existe no servidor.
- **Com rede:** assume o defeito, sem rodeio.

Nos dois casos ela afirma o que a pessoa quer saber — as fichas continuam salvas no aparelho, não
nesta tela. Tem botão de tentar de novo, e imprime o **código do erro**: em produção a mensagem real
é apagada de propósito, e sem esse código um relato de bug chega como "deu erro".

O estado da rede passou a ser lido em **um lugar só**, compartilhado com a tarja de aviso offline:
duas leituras diferentes de "está offline?" no mesmo site acabariam se contradizendo na frente do
usuário.

---

## 0.1.17 — "Onde Está a Peçonha" · 2026-09-10

### 🔍 O livro tinha 879 verbetes e nenhum jeito de procurar um

Não existia caminho para *"qual magia aplica Envenenado"* ou *"onde está a Peçonha"*. O filtro do
sumário do `/livro` reduz **títulos de seção**; o seletor do mapa acha **árvore por nome**. Nenhum dos
dois entra no texto das regras — sobrava rolar os 190 mil caracteres do livro, no meio do turno, com
o grupo esperando.

A rota **`/busca`** procura nos **879 verbetes**: as 601 técnicas, magias e talentos, mais as 114
maestrias, as 9 Magias Combinadas, as 19 árvores, os 85 itens da loja, as 12 raças, os 13
antecedentes, as 20 perícias e as 6 criaturas prontas.

- Procura no **nome e no texto**. "Envenenado" devolve as oito coisas que aplicam a condição, e
  **nenhuma delas tem a palavra no título** — o caso que o sumário nunca resolveria.
- **Sem acento e sem caixa** nos dois lados: quem digita "peconha" acha "Peçonha".
- **Duas palavras estreitam** em vez de somar: "fogo cura" devolve só o que é as duas coisas.

### 📖 O resultado abre ali, e não manda você pro livro

Quem busca no meio do turno quer o texto, não a viagem. Tocar num resultado abre o **card completo**
na hora — o mesmo do livro, com as três formas de conjuração, o dano, o cântico e o que a Recitação
Perfeita paga. O link pro lugar de origem continua embaixo, pra quem quer o contexto em volta.

É o **mesmo componente** que o `/livro` desenha, e não uma cópia: duas telas mostrando a mesma magia
de dois jeitos diferentes é a única coisa pior que não ter busca nenhuma.

- O trecho mostrado é a **frase onde a palavra está**, com ela pintada — não os primeiros 140
  caracteres do efeito, que quase nunca são a parte que responde.
- Filtros por tipo com contagem, endereço compartilhável (`/busca?q=peçonha`), e tudo isso **sem
  internet**: o índice sai dos mesmos dados que o site já carrega.

---

## 0.1.16 — "O Dedo Alcança" · 2026-09-09

### 👆 O mapa de árvores era intocável no celular

Medido a 414px de largura, o Destiny Board abria com os nós entre **6 e 14 pixels** — onze deles
empatados em 6×6. O mínimo do WCAG 2.2 (critério 2.5.8, nível AA) é 24. Era um quarto disso, na tela
principal de progressão do site, num projeto cuja primeira regra é mobile-first.

A causa não era defeito: era o zoom de "caber tudo" cumprindo o que promete. Num monitor, caber tudo
dá nós grandes; num celular, caber tudo espreme dezenove árvores em 414px, e o resultado aritmético
disso é um nó de 6px.

O mapa agora tem um **piso**: nunca abre num zoom em que a árvore não dê pra tocar. No celular isso
significa que ele deixa de caber inteiro na tela — perde-se a visão geral e ganha-se um mapa que se
usa arrastando, que é como todo mapa funciona num celular. No monitor nada muda, porque lá o zoom de
caber já passa do piso com folga.

Os nós de **rank**, menores de propósito, ganharam área de toque invisível maior que o desenho: o
alvo cresce, o mapa continua com a mesma cara.

### 📐 E os alvos pequenos do resto do site

- Os **dez links do rodapé** tinham 18px de altura — e o rodapé está em todas as rotas, então eram a
  maior parte dos alvos pequenos do site inteiro.
- Também passaram do mínimo: os campos numéricos da ficha, o seletor de Rank de Guilda, o seletor de
  árvore do mapa e os dois atalhos do fim da landing.
- **Nove das dez rotas agora estão em zero.** Os oito que sobram no `/livro` são links dentro de
  frase, que o próprio critério isenta: aumentar a caixa deles quebraria a linha do parágrafo pra
  resolver um problema que não existe.
- O `check:mobile` passou a medir o alvo de verdade — a **união** do controle com os filhos dele.
  Medindo só a caixa do botão, os 40 nós do mapa continuariam contados como pequenos *depois* de
  corrigidos, e a contagem acusaria justamente o remédio.

---

## 0.1.15 — "O Porão Sem Sinal" · 2026-09-09

O `O-QUE-FALTA.md` listava isso como **a maior pendência funcional**, e o caso de uso estava escrito
com todas as letras: *mesa física num porão sem sinal*. As fichas já viviam no `localStorage` — o que
morria sem rede era o **site**. De nada adianta o personagem estar salvo no aparelho se a página que
o desenha precisa de um servidor pra chegar.

### 📴 O site funciona sem internet

Um service worker (`public/sw.js`) guarda as **15 rotas** na primeira visita, junto com o JavaScript,
o CSS e as imagens que cada uma carrega. Guardar só o HTML não bastaria: o HTML do App Router é uma
casca, e quem desenha a loja é o JavaScript que ela manda buscar. Por isso o worker lê cada página
como texto e varre as referências que ela cita.

Depois disso o site abre com o avião ligado — em F5 ou navegando de link em link.

E não é promessa. `npm run check:offline` sobe um servidor, espera o worker instalar, **mata o
servidor** e abre as 15 rotas uma a uma. O modo offline do DevTools não serviria: ele se aplica à
aba, e as buscas do *service worker* saem de outro alvo — dava pra "estar offline" e o worker
continuar conversando com o servidor, que é exatamente o caso que a checagem existe pra pegar. Porta
fechada não tem essa ambiguidade.

A **exportação em PDF** é a única coisa que continua precisando de servidor, porque o PDF é montado
pelo Typst do lado de lá. Ela está explicitamente **fora** do cache: guardar essa resposta seria
arriscar devolver o PDF de uma ficha para outra.

### 📱 Instalável na tela inicial

Com manifesto e ícones próprios, o site instala como app: abre sem barra de endereço, com ícone na
gaveta e splash própria. Segurar o ícone abre três atalhos — **Ficha**, **Dados** e **Iniciativa** —,
que são as três coisas que se faz com o celular na mão *no meio* da sessão.

O atalho dos dados abre a rolagem **já aberta**. Era o único dos três que precisava de código: os
outros dois são rotas, e uma rota se abre sozinha. Sem isso, "Rolar dados" pararia na ficha e exigiria
mais um toque justamente de quem pediu um atalho pra não dar toques.

Os ícones saem do mesmo brasão do favicon, pelo mesmo script (`scripts/gerar-favicon.mjs`) — inclusive
um **mascarado**, com margem maior, porque o Android *recorta* o ícone na forma do launcher e as asas
do brasão ficavam bem onde passa a faca.

### 🔌 O que o site diz quando o sinal cai

- Uma **faixa abaixo do menu** avisa que a rede caiu e que ficha e site continuam funcionando. Ela
  fica no fluxo da página, e não flutuando: a primeira versão era uma tarja no rodapé, e num print da
  `/ficha` ela apareceu por cima do botão de rolar dados. O canto de baixo já tinha dois donos.
- **O erro do PDF parou de dar conselho errado.** Ele dizia *"tente de novo em instantes"* para
  qualquer falha, inclusive para quem está sem sinal — onde tentar de novo não resolve nada. Sem rede
  ele agora explica que o PDF sai quando o sinal voltar, e lembra que **Baixar ficha** funciona
  offline.
- Rota que não estava em cache cai numa página **`/offline`** que diz o que aconteceu, em vez da tela
  de dinossauro do navegador — que não distingue "esta rota não foi guardada" de "o site saiu do ar",
  e não conta o que mais importa ali: as fichas continuam salvas.
- Quando uma versão nova baixa, o site **oferece** Atualizar em vez de trocar sozinho. Um worker que
  assume no meio da sessão troca os chunks embaixo de uma página já aberta, e o próximo clique dá 404.

---

## 0.1.14 — "O Que a Mesa Devolveu" · 2026-09-05

Quatro árvores voltaram da mesa com o mesmo bilhete: *não dá pra jogar assim*. Nenhuma das quatro
mudanças abaixo saiu de planilha — saíram de uma sessão jogada, que é a única auditoria que este
livro ainda não sabia fazer sozinho.

### 🎯 O Tático executa a própria ordem

O `O-QUE-FALTA.md` já avisava: *"Dissonância e Ordem de Tiro foram inventadas pra que Bardo e Tático
tivessem o que medir. Se não forem divertidas na mesa, o certo é trocá-las, não ajustá-las."* Jogaram
de Explorador, e o veredito foi exatamente esse — **ele não dá dano nenhum**.

E não dava mesmo. A Ordem de Tiro somava +1d6 por patamar no ataque de um **aliado**: no 1º patamar,
três pontos e meio de dano que só aconteciam se outra pessoa escolhesse o alvo que você apontou. A
árvore inteira não tinha uma única linha que o próprio Tático pudesse rolar.

A ordem continua sendo a mecânica — o que muda é quem pode executá-la:

- O alvo fica **Apontado** (agora no Glossário de Condições, Cap. 4), e o bônus vale para o primeiro
  ataque que acertar, **seu ou de um aliado**.
- Contra o alvo Apontado, o Tático soma o **Bônus de Rank no acerto e no dano** dos próprios ataques
  com arco curto ou lança. É a única vez em que ele bate como quem treinou pra isso, e a justificativa
  é a mesma da árvore: ele não bate melhor, ele bate onde ele mesmo mandou bater.
- **A ordem não se perde.** Se ninguém acertar até o seu próximo turno, aponte o mesmo alvo de novo e
  o bônus sobe outro 1d6, até o dobro do seu patamar. O Tático sozinho não fica parado: ele carrega.
- Talento novo de 1º patamar, **Voz que Corrige**: uma Reação, quando um ataque contra o Apontado
  errar, quem errou repete a rolagem — uma vez por turno, e vale para os ataques dele também.

"Não pode fazer nada sozinho" continua sendo a identidade da árvore, e é uma boa identidade. "Não
pode fazer nada" não era.

### 🛡️ Barreira e Proteção volta a proteger

A escola tinha um nome que prometia duas coisas e entregava uma. Contra um conjurador, ela é o
melhor kit do livro; contra um urso, era um mago com 1d6 de PV assistindo. Pior: **nenhuma barreira
do livro dizia quantos PV tinha** — Recinto declarava 120, Redoma 60, e o Círculo Menor, o Domo e o
Anteparo não declaravam nada, enquanto o talento Trama Densa prometia "o dobro de PV" de um número
que não existia.

- **Toda barreira sua tem 20 PV por patamar** (20 no 1º, 120 no 6º), e a magia que declarar os
  próprios PV usa os dela. Trama Densa finalmente dobra alguma coisa.
- **A sua barreira nunca vale contra você.** Selado e Estagnação atingiam o próprio conjurador: quem
  escreve a lei obedecia a ela, e um Círculo Menor no 1º patamar era uma armadilha para o grupo
  inteiro, aliados incluídos.
- **Quem está dentro tem Cobertura** contra ataques à distância vindos de fora.
- **Casca** (Principiante, 2 PM, 1 Ação): PV Temporários iguais a 2d8 + BC num aliado, e o Bônus de
  Rank em resistências contra magia enquanto durar. É o que a escola faz num turno em que ninguém
  conjurou nada — que era metade dos turnos.
- **Muralha** (Intermediário, 4 PM): 12m de parede com os PV das suas barreiras, barrando passagem e
  projéteis nos dois sentidos. É a resposta ao inimigo que não conjura, e ela é honesta: dá pra
  derrubar no braço.
- **Anteparo** passa a parar flecha, virote e pedra, e não só magia.

A fraqueza declarada mudou de "quase não faz nada contra o Corpo" para o que ela realmente é agora:
**contra o pilar do Corpo você não proíbe, você atrasa** — o Deus da Espada atravessa a sua lei
gastando turnos, e turnos é tudo o que você tira dele.

### 🧪 A escola barata ganhou o que fazer no turno

O rework de 2026-09-03 tirou dano e imunidades da Desintoxicação e devolveu o valor em preço. O que
ele não resolveu foi o buraco do 1º ao 3º patamar: fora de uma cena de veneno, o purificador não
tinha **uma única linha** para gastar o turno.

- **Peçonha** (Principiante, 2 PM, 1 Ação, 18m): 2d6 de veneno e Envenenado até o fim do próximo
  turno, com teste de Vigor. Quem entende de veneno sabe fazer veneno — a Maestria de Rei só admite
  em voz alta o que este feitiço já faz pequeno.
- **Purgar em 1 Ação**, e não 2. A magia que justifica a escola existir gastava dois terços de um
  turno para desfazer o que o Mestre fez ontem.
- **Paladar** passa a cobrir o grupo: aliados a 3 metros somam o seu Bônus de Rank em resistências
  contra veneno, doença e maldição. Perto do purificador, o que devia pegar todo mundo pega um.
- **Sangria custa 3d6, não 4d6.** A Mecânica Central da árvore já dizia 3d6 desde 2026-09-03; a magia
  cobrava 4d6. Duas páginas do mesmo livro, dois números — e o `check:texto` não pega esse tipo de
  divergência, porque ele compara a prosa de uma habilidade com os campos dela, nunca com o texto da
  árvore que a contém.

### 🔥 O Calor tem quatro regras, e não vinte

O pedido aqui não foi "está fraco": foi **"está confuso, e leve em conta que ele tem que pegar outras
coisas"**. Estava mesmo. Cada patamar do Punho do Fogo reescrevia o recurso do zero: o teto subia numa
escada torta (5 → 8 → 12 → 16 → 20 → 25), o decaimento mudava de regra no 2º patamar, o estouro tinha
três nomes com três efeitos (Brasa Viva, Fúria Vulcânica, Erupção Contínua) e cada técnica cobrava um
número próprio de Calor — 1, 2, 3, 4, 5, 6, 8, 10 por turno.

Agora são quatro regras, todas na Maestria de 1º patamar:

1. **Ganhar** — 1 de Calor por ataque desarmado que acerta.
2. **Teto** — 5 por patamar (5/10/15/20/25/30). Uma conta, não uma tabela.
3. **Perder** — 1 no fim de todo turno em que você não acertou ninguém. Nunca a barra inteira: a
   regra antiga punia o azar de errar um ataque com o recurso todo.
4. **Gastar** — toda técnica tem uma **Sobrecarga**, e toda Sobrecarga custa **3 de Calor**, em
   qualquer patamar. As únicas exceções são as detonações declaradas (Soco de Nova, Erupção do
   Soberano, Colapso Solar, Manto de Supernova), que gastam a barra inteira porque é isso que elas são.

O estouro virou um nome só — **Brasa Viva**, desde o 1º patamar, melhorando em cada um deles — e ela
**para de cobrar o 1d6 em você no Santo**, porque o Santo é imune a fogo e cobrar dano ígneo de um
imune era a contradição mais visível da árvore.

E o custo: **PM ou PT, à sua escolha, nunca os dois.** As técnicas cobravam as duas reservas no mesmo
golpe (5 PM + 2 PT na Lótus Carmesim) de um personagem que já tinha pagado rank Intermediário em duas
árvores para a híbrida sequer existir. Corpo e mana queimam o mesmo fogo.

De quebra, a árvore parou de falar outra língua: *"dano halved"*, *"CD 20"*, *"Força 30"* e
*"Petrificação leve"* viraram metade do dano, CD 8 + BC, e uma aflição de rank Santo — que é como o
resto do livro escreve essas quatro coisas.

---

## 0.1.13 — "O Covil Ganhou Gavetas" · 2026-09-05

### 🗂️ O covil ganhou gavetas

`/encontros` nasceu como uma lista de cartões sempre abertos. Isso funciona até a terceira criatura;
com trinta montadas — que é o uso real depois de algumas sessões — a tela vira uma parede de
formulário em que *"onde está o chefe do arco 2?"* só se responde rolando a página inteira.

Três coisas resolvem isso, e as três estão nesta versão:

- **Pastas.** Criar, renomear, reordenar, recolher, e **marcar a gaveta inteira pro encontro num
  clique** — uma pasta vira um encontro pronto. O recolhido fica **salvo**: arrumar dez pastas uma
  vez e perder a arrumação no F5 seria pior que não ter pasta nenhuma.
- **Cartão recolhido.** Fechado, ele é uma linha com o retrato, o nome e os números com que se decide
  *"é esta?"* — quantas vêm, patamar, papel, PV, CA, dano por turno. O formulário inteiro abre com um
  toque, e a tela só abre sozinha o que você acabou de criar, importar ou duplicar.
- **Busca**, que atravessa as gavetas fechadas — quando você já sabe o nome, navegar por pasta é o
  caminho longo. Ela varre nome, anotação de perigo, papel e o texto das Ações: *"quem era o que
  tinha a mordida venenosa?"* é uma pergunta tão comum quanto o nome próprio da criatura.
- **A gaveta é sua**: nome, **emoji** e uma de seis **cores**. Numa lista de dez pastas, 🐉 e 🏚️ se
  acham de relance de um jeito que "Chefes do arco 2" e "Taverna" não — o olho lê a figura antes de
  ler a palavra. A cor é uma lista fechada, e não um seletor livre, porque ela precisa funcionar nos
  dois temas do site: cor escolhida a dedo por quem só viu o tema claro fica ilegível no escuro.

**A pasta pode ser criada com o covil vazio.** Na primeira versão o botão "Nova pasta" morava dentro
do galho que só existia depois da primeira criatura — e planejar a sessão começa exatamente pelo
contrário: abrir "a emboscada da estrada" e "os chefes do arco 2" antes de ter o que pôr dentro.

**O que chega aparece.** Criar, duplicar, importar de arquivo ou aceitar um link agora abre o cartão,
expande a gaveta em que ele caiu, limpa a busca que o esconderia e rola até ele, com um realce de
alguns segundos. Sem isso, importar tinha virado um clique que não parecia fazer nada: desde que o
cartão passou a nascer recolhido, o recém-chegado entrava fechado no fim de uma lista longa — e pelo
link era pior, porque a confirmação acontece em outra rota e voltava pra cá sem nada em comum.

**A pasta inteira num arquivo.** `.mtpasta` leva a gaveta com nome, cor, emoji e todas as criaturas
dentro — o mesmo `MTP1`+gzip dos outros dois formatos. `.mtcriatura` resolvia "te mando este chefe";
não resolvia "a emboscada da estrada são estes cinco bichos, e eu quero levar isso pra outra
máquina" — nem o backup, que é o que realmente falta a um bestiário que mora só no `localStorage` de
um navegador. A importação é **um botão só**: pasta, criatura ou o `.json` cru de qualquer um dos
dois, detectados pelo conteúdo. Dois botões transferem pra quem usa uma pergunta que o arquivo já
responde sozinho.

**Apagar a pasta nunca apaga o que está dentro**: as criaturas voltam pra "Fora das pastas", e a
confirmação diz "Só a pasta?" pra deixar isso explícito. Um Mestre que reorganiza trinta criaturas no
meio da sessão não pode perder metade do bestiário por clicar na lixeira errada.

**Mover é um `<select>` no cartão, e não arrastar-e-soltar.** A tela é mobile-first: arrastar um
cartão numa lista que rola é a interação que mais falha no dedo, e é a única que não tem alternativa
por teclado.

O bestiário salvo sobe pra `version: 4` e entra **inteiro** em "Fora das pastas". Inventar gavetas
por quem já tem trinta criaturas montadas daria uma arrumação que ninguém pediu — o critério do que
era "os goblins daquela estrada" é do Mestre.

### 🗡️ A ficha do jogador, do lado errado da iniciativa

O rival que persegue o grupo há três sessões, o cavaleiro que virou inimigo, o PJ de quem faltou hoje,
o duelo entre dois jogadores — todos são a mesma coisa na mesa: **um personagem construído com as
regras inteiras, jogando contra o grupo**. O Mestre tinha duas saídas ruins: montar uma criatura do
zero e chutar os números, ou desistir e narrar. As duas jogam fora uma ficha que já existe, já está
paga em PA e já tem as técnicas escritas.

Agora `/encontros` tem **"Ou traga uma ficha do roster"**, ao lado de "Nova criatura". PV, CA, Bônus
de Ataque, CD, retrato e as técnicas de dano vêm da ficha, pelo **mesmo derivador que a simulação usa
do lado dos heróis** — é isso que garante que o rival aguente na mesa o que aguentaria como
personagem.

É uma **cópia**, e não um vínculo: mexer no chefe não toca na ficha do jogador, e o jogador subir de
patamar não desfaz os ajustes que você fez no chefe. Um vínculo vivo perderia o ajuste do Mestre toda
vez que o dono da ficha comprasse uma habilidade.

Três detalhes que a conversão respeita, e que o teste pegou um a um:

- **O ataque comum vem sempre, e vem primeiro.** Nenhuma árvore declara "Atacar com Arma" como
  habilidade, porque é regra do Cap. 4 — e sem ele o guerreiro convertido parecia não saber bater. É o
  mesmo erro que o `check:arvores` cometeu em 0.1.11.
- **Quem não tem árvore do Corpo bate com "arma simples"**, sem Bônus de Rank no golpe (Cap. 3). Somar
  o BC cheio daria ao mago convertido o braço de um espadachim.
- **A fórmula segue a carta, não o motor.** O que está entre parênteses é condicional e não soma
  ("12d12 de frio (24d12 contra alvo Molhado)" é 12d12, não 36d12); "+2 Dados de Arma" é contagem de
  dados e não "+2 de dano"; e o BC entra onde o livro escreve "+ BC", e não em toda ação como a
  simulação simplifica. Quem lê o cartão na mesa tem a carta da habilidade ao lado, e as duas
  precisam fechar. O texto original do livro vai junto, na nota de cada Ação.

Ela entra "fora do molde do Apêndice G", e isso é a informação certa: uma ficha de personagem é
exatamente o caso em que os números **não** vêm da tabela. Das técnicas de dano vêm as oito mais
fortes — a simulação só gasta 3 Ações por turno, e da nona pra baixo nada seria rolado.

### 🐉 A criatura saiu do navegador

Até aqui a criatura vivia só no `localStorage` de quem a montou. Isso combinava com ela ser "rascunho
de sessão" enquanto era sete números soltos; desde que ganhou Ações escritas, ela é conteúdo que vale
levar de uma campanha pra outra.

- **Arquivo e link.** `.mtcriatura` (marca `MTC1`) e um link com a criatura dentro. O par
  gzip+base64url saiu de `fichaArquivo.ts`/`fichaLink.ts` pra `compactacao.ts` e agora serve aos
  dois, sem duplicar. O PDF ficou de fora de propósito: o payload do Typst é amarrado a árvore e
  magia de personagem, e estendê-lo pra criatura seria um Apêndice inteiro de template novo.
- **Retrato**, com a mesma infra de imagem da ficha — reduzida no navegador, nunca sai dele. De
  quebra, um defeito que ninguém tinha visto: "Recalibrar" apagaria a foto junto dos números do
  molde, do mesmo jeito que já preservava `perigo` e as Ações.
- **Condições estruturadas.** Preso, Caído, Molhado e veneno saíram da anotação de texto e viraram
  estado do motor. Preso e Caído dão Vantagem a quem ataca o alvo, e as três tiram a Vantagem de quem
  já está com uma (Cap. 4, §7) — dos dois lados da mesa. As criaturas prontas do Apêndice G que já
  citavam uma dessas condições na prosa ganharam o campo correspondente.
- **O chefe reage.** 1 Reação/ação lendária fora do turno normal — a outra metade da economia de
  ação, que até aqui só tinha a rodada extra do chefe solo.

Os números do playtest não mudaram com nada disso: as condições novas só entram em jogo quando uma
ação as declara, e nenhuma das dez builds de referência faz isso.

### 🔥 Calor do Punho do Fogo virou número

Calor só existia na prosa da árvore (*"Calor máximo sobe para 8/12/16/20/25"*) — nenhum campo, nenhum
"atual" editável, nada que a ficha somasse. Agora ele segue o mesmo padrão de PV/PM/PT/PP: teto por
patamar, contador com override na ficha, e o contador só aparece pra quem tem Punho do Fogo
desbloqueado.

O teto é **fixo** por patamar, não cumulativo: o texto sempre disse "sobe para", nunca "soma".
Superaquecimento, Brasa Viva, Erupção Contínua e Combustão Reativa continuam fora do motor — são
gatilhos condicionais de mesa, não deste recurso. O trabalho aqui é fazer o número existir e ser
rastreável.

### 📷 A foto entra na criação

As três vias (Manual, Roleta e Entrevista) terminavam sem nunca oferecer a foto de perfil — a pessoa
só descobria que dava pra pôr uma depois, já em `/ficha`. A tela final de cada via é exatamente o
momento em que raça e antecedente já estão fechados e a pessoa está imaginando a cara do personagem,
então é ali que a foto entra: sempre opcional, com o mesmo brasão da raça como alternativa.

### ✍️ Os dez avisos do `check:texto`, e um bug de cura

Nove habilidades tinham dado escrito na prosa e nenhum campo onde guardá-lo. `damage.condicional`,
`damage.porTurno` e `healing.normal` são esse lugar — bônus condicional, dano por turno de
condição/terreno, e a cura de Julgamento e Luz Absoluta. **Barreira e Proteção** sobe pra `1d8+4` no
Rei, pra quebrar um PV parado por três patamares.

De quebra, um bug real que só um campo apartado revelaria: o filtro de cura do `combatSim.ts`
escaneava `damage.normal` e `effect` juntos, e a cura descrita no `effect` de Julgamento e Luz
Absoluta **derrubava o dano real das duas na simulação de combate inteira**. Agora ele olha só
`damage.normal`.

### ⚔️ Suishin e Escudos: dois ajustes da leitura das quatro árvores restantes

- **"Nome de Reidar"** era o único talento do livro sem efeito jogável nenhum. Ganha um favor pontual
  por sessão, no molde de "Homem Dentro" do Ladino.
- **"O Muro Final"** anunciava o próprio risco (*"você provavelmente morre"*) e tinha esse risco
  anulado de graça pela Maestria do Imperador ("Enquanto Eu Estiver de Pé"). A cláusula nova fecha
  essa segunda vida grátis; a versão Soberana continua com a segurança dela intacta.

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
