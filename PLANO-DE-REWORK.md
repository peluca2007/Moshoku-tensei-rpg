# Plano de rework — Teórica, Cura, Desintoxicação e as três Utilidades (2026-09-26)

Pedido do autor: "dá uma geral na Teórica de novo, ela é a mais complexa, deixa ela mais simples pro
Mestre e pro player; olha a Cura; a Desintoxicação é muito chatinha; dá uma geral nas três Utilidades.
O foco é o conteúdo do livro, depois a gente vai pro estilo."

**Decisões do autor (2026-09-26):** as quatro recomendadas (★) — Teórica em três palavras e uma conta;
Cura sem contabilidade; Desintoxicação com Dose e Inversão; Utilidades com menu de Preparações e canções.
Andamento: Cura ✅ · Desintoxicação ⏳ · Teórica ⏳ · Utilidades ⏳.

**Ordem:** fase 1 é conteúdo (as seis árvores), fase 2 é estilo (temas e animações). Toda mudança de
regra vai junto no livro folheado (`/livro/folhear`), nos dados das árvores (`src/data/trees/*`), na
ficha automática (seletores, `CharacterSheet`, PDF da ficha) e nos testes — nada existe fora do livro.

Cada decisão abaixo traz quatro caminhos e o que eu faria (★). O autor escolhe; eu executo árvore por
árvore, uma de cada vez, com a revisão do livro rodando a cada uma.

---

## Fase 1 — Conteúdo

### 1. Magia Teórica: de gramática a "três palavras e uma conta"

**O que está pesado hoje**

- Sete dimensões ao mesmo tempo: essência (7), ações (6), forma (6), meio (5), construção **e** potência
  (dois ranks diferentes), gatilho, e circuitos de células com ligações e Espiral empenhada.
- A conta de PM tem seis parcelas (essência + ações + forma + sobreposição + potência + gatilho).
- O motor tem **33 regras que recusam uma fórmula**; metade são regras de ordem e compatibilidade que ninguém guarda
  de cabeça (Projetar antes de Conter, Expandir depois, Repetir por último, Triângulo só com projeção,
  Quadrado só com Conter, Expressar não combina…). O Mestre não consegue arbitrar sem o site.
- "Construção" e "potência" são dois ranks pra mesma pessoa: quase ninguém quer potência abaixo do
  próprio rank, e a distinção só complica.
- 7 dos 8 talentos do Principiante são "aprenda um símbolo": PA gasto em vocabulário, não em diversão.
- As cartas repetem a fórmula por extenso (Anteparo = Mana + Conter + Quadrado…): o catálogo é o
  mesmo texto duas vezes.

**Opções**

1. ★ **Três palavras e uma conta.** Toda fórmula é *Essência + Verbo + Forma* — uma de cada (dois
   verbos só a partir do Avançado). **PM = o custo da potência (tabela de uma linha) + 1 por palavra
   fora do básico** (essência que não é Mana, forma que não é Círculo, verbo extra). Potência é o seu
   rank, sem o segundo número. Os verbos viram quatro com nome de ação (Lançar, Erguer, Selar,
   Sinalizar); Expandir e Repetir viram **formas** (Onda, Eco), e a ordem deixa de ser regra. Circuitos
   ficam no Santo em diante como uma coisa só: "armar" (gatilho + ligação num passo). Os símbolos de
   outras escolas vêm de graça com a escola; os talentos passam a fazer algo na mesa. O Laboratório
   segue funcionando, mais simples. *Por quê: mantém o que a Teórica tem de único — escrever a própria
   magia — e cabe numa tabela de meia página.*
2. **Cardápio + gramática no apêndice.** A árvore entrega doze receitas prontas por patamar (cartas);
   a gramática inteira vai pra um apêndice, só pra quem quiser compor.
3. **Poda.** Mantém tudo e corta circuitos, Espiral e gatilho (Santo em diante), e a construção vs.
   potência.
4. **Receita + uma troca.** Você conhece receitas (as cartas) e, a cada conjuração, pode trocar UMA
   palavra de uma receita conhecida por +1 PM. Improviso sem gramática: o mais rápido de jogar.

### 2. Magia de Cura: a Ferida Fresca sem contabilidade

**O que está pesado ou morto hoje**

- A janela da Ferida Fresca é "desde o início do último turno **do alvo**": o curandeiro precisa lembrar
  quando cada aliado agiu. É a ideia mais legal da escola, com a regra mais difícil de acompanhar.
- Opções mortas ou quase: Mãos Firmes (Vantagem em concentração), Curandeiro de Guerra (texto sem
  mecânica), Transferência (move só BC de dano), Anestesia (o Mestre esconde os PV do jogador — tira a
  informação que o jogo inteiro usa).
- Cura custa 3 PM por 1d8 + BC; a Bola de Fogo, 1 PM pelo mesmo dado: curar é três vezes mais caro por
  PM, e isso só se justifica metade das vezes (com Ferida Fresca).
- Selar a Ferida cobra 2 PM por Bônus de Rank (12 PM no Imperador) por uma janela de uma hora.

**Opções**

1. ★ **A mesma escola, sem contabilidade.** Ferida Fresca passa a ser "o alvo sofreu dano **desde o
   seu último turno**" — o curandeiro só olha a própria vez. Cura cai pra 2 PM. Talentos mortos saem e
   cada patamar oferece três caminhos de verdade: **Cirurgião** (cura mais), **Guardião** (PV
   temporários e Salvações), **Juiz** (a Luz de Dois Gumes). Anestesia vira "ignora penalidades e não
   cai abaixo de 1 PV até o fim do turno", sem esconder PV.
2. **Reserva de Cura.** Cada curandeiro tem um estoque de d8 por descanso (2 × Bônus de Rank); as magias
   gastam dados da reserva em vez de PM, e a Ferida Fresca dobra. Menos conta de PM, mais escolha.
3. **Só números e texto.** Mantém a estrutura e corrige custo, janela e as opções mortas.
4. **Triagem.** No início da rodada o curandeiro marca até Bônus de Rank aliados "em risco"; cura em
   marcado conta como Ferida Fresca. A escola joga no começo da rodada, não depois do golpe.

### 3. Magia de Desintoxicação: de "espera o Mestre" a escola de dois tempos

**O que está chato hoje**

- Quase tudo responde a problema que o Mestre precisa criar: sem veneno ou maldição na mesa, a escola
  não joga. "Rank contra rank" é simples, mas é uma regra só — não tem decisão.
- Os ataques (Peçonha, Sangue de Serpente, Corrosão) são fracos e sem ciclo, e a parte divertida
  (Extração, Duas Faces, Veneno) só chega no Intermediário, no Rei e no Rei.

**Opções**

1. ★ **Dose e Inversão.** A escola ganha um ciclo de dois tempos, como a Água: os venenos dela aplicam
   **Dose** (acumula: Envenenado → Intoxicado → Colapso), e a purificação vira arma — **Inverter** a
   Dose de um inimigo a transforma em dano de uma vez. O lado de purificar fica (rank contra rank), e
   ganha versões proativas (imunizar o grupo antes da luta). É a mesma escola, agora com jogada.
2. **Fundir com a Cura.** Uma escola só, "Cura e Purificação"; o livro passa a ter dezoito árvores.
3. **Só reforço.** Mantém tudo; venenos mais fortes e a Extração mais cedo.
4. **Alquimista de campo.** A cada Descanso Longo você prepara frascos (antídotos, venenos, tônicos)
   que qualquer um do grupo usa. A escola vira o laboratório do grupo e conversa com o Crafting (Cap. 5).

### 4. As três Utilidades (Ladino, Bardo, Tático): de "fato livre" a menu

**O que está pesado hoje**

- O fato por PP é a melhor ideia do pilar e a maior fonte de briga: é livre demais, e o livro já precisa
  de quatro travas pra segurar. A mesa não sabe o que um fato pode e não pode fazer até brigar.
- Muitos talentos são só texto, sem número (Mapa Vivo, Contrabandista, Colecionador de Histórias,
  Herdeiro de Todas as Bocas, Logística de Guerra…): ninguém consegue comparar com um talento que dá
  +2 na CA.
- Bardo: a Dissonância causa dano toda vez que você usa qualquer habilidade da árvore (estranho de
  explicar), Canção de Guerra dá +2 em acerto sustentado de graça (forte), e o resto da árvore é
  social declarativo.
- Tático: Avante e Comando dão Ações ao grupo inteiro — o pico de poder mais alto do pilar, e fácil de
  quebrar em combinação.

**Opções**

1. ★ **Menu de Preparações + canções.** Cada árvore ganha uma lista de 6 a 8 **Preparações** com
   custo e efeito escritos (o fato livre continua, mas como "outra coisa, com o Mestre"). Talentos só
   de texto viram Preparações da lista ou saem. O Bardo troca a Dissonância automática por **canções**
   (uma ativa de cada vez, trocar custa 1 Ação: Marcha, Guerra, Réquiem, Dissonância). O Tático
   continua sendo o único que dá Ações, com teto por rodada.
2. **Poda.** Mantém o sistema; corta ~30% dos talentos de texto, junta os parecidos e revê os números.
3. **Só explicar.** Mantém tudo e acrescenta exemplos jogados e a tabela de "o que um fato pode".
4. **Cena de Preparação.** Antes do combate, uma mini-rodada em que cada Utilidade gasta PP num
   quadro comum (terreno, rota, pessoas); a luta começa com aquilo em jogo. Faz a Utilidade brilhar na
   mesa, mas é mais uma regra pra aprender.

---

## Fase 2 — Estilo (depois do conteúdo)

### 5. Temas: quatro é loucura?

Não é loucura técnica: as paletas já são variáveis, e dois eixos (estilo **Livro/Pergaminho** ×
**Claro/Escuro**) dão os quatro com um CSS pequeno. O custo é outro: cada tela precisa ser conferida
nos quatro (contraste, cores de árvore, PDF), e o botão de tema vira dois botões.

1. ★ **Dois temas, os do livro** (noite e dia). O pergaminho sai. Menos coisa pra manter, uma
   identidade só.
2. **Quatro temas em dois botões** (Estilo e Claridade).
3. **O pergaminho como "clássico"** escondido nas preferências, sem garantia de acabamento.
4. **Tema por seção:** o site escolhe o papel pela página (livro sempre noite, ficha sempre dia…).

### 6. Animações leves

Regras pra não pesar: só CSS; só `transform` e `opacity`; só na dupla aberta; desligadas com
"reduzir movimento"; no máximo uma camada animada por página; medido com o script de peso antes de
subir.

- Títulos que surgem ao virar a página (fade curto), como os que o autor gostou.
- Um detalhe por árvore na marca d'água: brasas subindo no Fogo, um fio de vento no Vento, ondulação na
  Água, poeira caindo na Terra, uma luz que pulsa na Cura, bolhas na Desintoxicação, glifos girando
  devagar na Teórica, notas no Bardo.
