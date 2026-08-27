// ============================================================
//  SISTEMA DE RPG: MUSHOKU TENSEI — O Mundo de Seis Faces
//  Formato: Typst  ·  cole em https://typst.app/play/
// ============================================================

#let tinta      = rgb("#1a1512")
#let sepia      = rgb("#7a4a21")
#let vinho      = rgb("#7d2b2b")
#let creme      = rgb("#faf4e8")
#let bloco-bg   = rgb("#f2e6cf")
#let linha      = rgb("#c9a227")

#set page(
  paper: "a4",
  margin: (top: 2.2cm, bottom: 2.2cm, x: 1.9cm),
  columns: 2,
  fill: creme,
  footer: context {
    set text(9pt, fill: sepia)
    align(center)[#counter(page).display()]
  },
)

#set text(
  font: ("Libertinus Serif", "New Computer Modern", "DejaVu Serif"),
  size: 9.6pt,
  fill: tinta,
  lang: "pt",
  hyphenate: true,
)

#set par(justify: true, leading: 0.62em, first-line-indent: 0em)
#set block(spacing: 0.75em)

// sticky: true em todo heading — o título nunca fica sozinho na base de uma
// coluna/página com o corpo dele empurrado pra próxima; os dois viajam juntos.
#show heading: it => block(width: 100%, above: 1.1em, below: 0.55em, sticky: true)[#it]

#show heading.where(level: 1): it => {
  set text(font: ("Libertinus Serif", "DejaVu Serif"), size: 20pt, fill: vinho, weight: "bold")
  block(width: 100%, sticky: true)[
    #it.body
    #v(-0.35em)
    #line(length: 100%, stroke: 1.4pt + linha)
  ]
}
#show heading.where(level: 2): it => {
  set text(size: 15pt, fill: vinho, weight: "bold")
  block(width: 100%, sticky: true)[
    #it.body
    #v(-0.4em)
    #line(length: 100%, stroke: 0.7pt + linha)
  ]
}
#show heading.where(level: 3): it => block(sticky: true)[#text(size: 12.5pt, fill: sepia, weight: "bold")[#it.body]]
#show heading.where(level: 4): it => block(sticky: true)[#text(size: 10.8pt, fill: sepia, weight: "bold", style: "italic")[#it.body]]

#set table(stroke: none)
#show table.cell.where(y: 0): set text(weight: "bold", fill: creme)

// --- quadro de regra (os antigos blockquotes do Homebrewery) ---
// breakable: false por padrão — quase todo quadro tem 3-5 linhas (o maior do livro
// tem 11), então vale mais a pena empurrar o quadro inteiro pra próxima coluna do
// que arriscar a caixa colorida cortada ao meio. Quadro excepcionalmente longo pode
// passar quebravel: true pra permitir quebra.
#let quadro(titulo: none, quebravel: false, corpo) = block(
  width: 100%, fill: bloco-bg, inset: (x: 8pt, y: 7pt), radius: 2pt,
  stroke: (left: 2.5pt + sepia), breakable: quebravel, above: 0.9em, below: 0.9em,
)[
  #if titulo != none {
    text(size: 10.5pt, weight: "bold", fill: vinho)[#titulo]
    v(-0.35em)
  }
  #set text(size: 9.2pt)
  #corpo
]

// --- bloco largo: pagina propria de uma coluna (previsivel, sem sobreposicao) ---
#let largo(corpo) = page(columns: 1)[#corpo]

// --- bloco largo pequeno: apenas flui na coluna, sem quebrar pagina ---
#let largo-inline(corpo) = block(width: 100%, above: 0.9em, below: 0.9em)[#corpo]

// --- tabela do livro ---
// breakable: false por padrão — uma tabela nunca deve cortar uma linha ao
// meio entre colunas/páginas. Se ela não cabe no espaço restante, o Typst
// empurra a tabela inteira pra próxima coluna/página, em vez de partir uma
// célula longa em dois pedaços. Tabela genuinamente enorme (a lista mestre de
// Antecedentes, d100) usa #largo em vez de contar com quebra automática.
#let tbl(cols, alinhas, quebravel: false, ..celulas) = block(width: 100%, above: 0.8em, below: 0.9em, breakable: quebravel)[
  #set text(size: 8.8pt)
  #table(
    columns: cols,
    align: alinhas,
    inset: (x: 5pt, y: 4pt),
    fill: (_, y) => if y == 0 { sepia } else if calc.odd(y) { bloco-bg } else { none },
    ..celulas
  )
]

// ============================ CAPA ============================
#page(columns: 1, margin: 3cm, footer: none)[
  #align(center + horizon)[
    #text(size: 13pt, fill: sepia, tracking: 4pt)[SISTEMA DE RPG]
    #v(0.6em)
    #text(size: 38pt, fill: vinho, weight: "bold")[MUSHOKU TENSEI]
    #v(0.1em)
    #line(length: 60%, stroke: 1.5pt + linha)
    #v(0.4em)
    #text(size: 17pt, fill: sepia, style: "italic")[O Mundo de Seis Faces]
    #v(3em)
    #text(size: 10pt, fill: sepia)[Sistema de progressão por Pontos de Aprimoramento]
  ]
]



#pagebreak(weak: true)

#page(columns: 1)[
  #text(size: 22pt, fill: vinho, weight: "bold")[Sumário]
  #v(0.6em)
  #set text(size: 8.3pt)
  #set par(leading: 0.5em)
  #columns(2)[#outline(title: none, depth: 3)]
]

#pagebreak(weak: true)

= Capítulo 1: O Núcleo do Sistema

Bem-vindo à adaptação para RPG de mesa baseada no universo de espadas e magia de _Mushoku Tensei_. Este sistema abandona a ideia tradicional de "Níveis de Personagem". Aqui, você não sobe de nível automaticamente; o seu crescimento é orgânico, baseado no estudo, no treinamento e no acúmulo de *Pontos de Aprimoramento (PA)*.

== 1. Criação de Personagem e Atributos

Todo personagem é moldado a partir de seus atributos físicos e mentais. Em vez de rolar dados, você distribui pontos fixos.

*Atributos Base*
O sistema utiliza 5 atributos principais que definem o bônus fixo que você soma nas suas rolagens de d20:

- *Força:* Poder físico, carga e ataques com armas pesadas.
- *Agilidade:* Reflexos, esquiva, furtividade e ataques precisos.
- *Vigor:* Saúde, resistência a venenos, clima e cansaço.
- *Intelecto:* Capacidade de memória, conhecimento de magias e lógica.
- *Espírito:* Força de vontade, carisma, liderança e resistência mental.

#quadro(titulo: [Distribuindo seus Pontos Iniciais])[
Ao criar o seu personagem, você recebe *4 Pontos* para distribuir livremente entre os 5 atributos base.
- *O Limite Inicial:* No momento da criação, o valor máximo que você pode colocar em qualquer atributo é *4*.
- *O Sistema de Defeitos:* Você pode, intencionalmente, reduzir o valor de seus atributos para ganhar pontos extras, o que representa fraquezas severas (como um corpo frágil, ingenuidade extrema ou péssima interação social). As regras de redução são estritas: você pode ter *apenas um atributo no valor de -1* (ganhando 1 Ponto Extra) e *apenas um atributo no valor de -2* (ganhando 2 Pontos Extras).
]

#quadro(titulo: [Cada Atributo Governa Uma Reserva])[
Este sistema tem três reservas, e cada uma pertence a um atributo — *multiplicando*, não somando:

#tbl(3, (left, left, left),
  [Reserva], [Atributo], [Fórmula do crescimento],
  [*PV*], [Vigor], [Vigor × Maior Bônus de Rank × 4],
  [*PM*], [Espírito], [(Espírito × Maior Bônus de Rank de magia × 2) + 8],
  [*PT*], [Espírito e Vigor], [Vigor + (Espírito × Maior Bônus de Rank do Corpo)],
  [*PP*], [Intelecto], [Intelecto + atributo-chave + Bônus de Rank de Utilidade],
)

A consequência prática é que *não existe atributo de enfeite*. Um ponto de Vigor a mais no 6º patamar vale *24 PV*; um ponto de Espírito vale *12 PM* — e como a reserva inteira de mana tem 32 pontos com Espírito 2, esse ponto isolado é quase 40% de aumento. Na criação, quando você tem só quatro pontos para distribuir, essa escolha é a coisa mais pesada que você faz na ficha.

Força, Agilidade e Intelecto não governam reservas — eles governam o que você *faz* com elas: acerto, dano, CA e Iniciativa.
]

#quadro(titulo: [Os Dois Atributos do Mago])[
Um mago não é definido por um número só. Ele é definido por dois, e a tensão entre eles é o que cria arquétipos diferentes:

- *Intelecto — a Precisão.* Define o quanto sua magia _acerta_ e o quanto ela _machuca_.
- *Espírito — a Reserva.* Define o quanto de mana o seu corpo consegue armazenar.

Escolas de magia *não concedem PM*. A sua reserva inteira é *(Espírito × Maior Bônus de Rank de magia × 2) + 8*, calculada uma vez e recalculada quando o seu maior patamar de magia sobe.

Abrir oito escolas no 1º patamar não te dá mana nenhuma a mais. Subir *uma* escola até o Imperador multiplica tudo. É por isso que o mago que vai fundo conjura e o que espalha assiste.

Existem, portanto, dois magos legítimos: o _cirurgião_ (Intelecto alto — poucos tiros, todos letais) e o _reator_ (Espírito alto — bombardeia o dia inteiro sem cansar). Roxy Migurdia é o primeiro. Rudeus Greyrat é o segundo.
]

#pagebreak(weak: true)

== 2. Pontos de Aprimoramento (PA)

Não existem "níveis" neste jogo. A progressão ocorre quando o Mestre da mesa recompensa os jogadores com *Pontos de Aprimoramento (PA)* após concluírem sessões, missões importantes ou arcos da história (como subir de Rank na Guilda de Aventureiros).

Ao criar seu personagem (iniciando sua jornada), você recebe *3 PA iniciais* para moldar o que você já aprendeu no passado. Você pode gastar seus PA imediatamente ou guardá-los para comprar coisas mais caras no futuro.

*Tabela de Custos Gerais*
Você usa seus PA para comprar absolutamente tudo no sistema:

#tbl(2, (center, left),
  [Custo], [O que você recebe],
  [*1 PA*], [*2 Perícias* à sua escolha.],
  [*1 PA*], [Desbloqueia 1 Técnica Marcial ou 1 Talento de rank baixo.],
  [*2 PA*], [*+PV iguais ao dobro do seu maior Bônus de Rank* (melhoria física permanente).],
  [*2 PA*], [*+PM iguais ao seu maior Bônus de Rank de magia*.],
  [*2 PA*], [Aumenta *1 ponto* em qualquer Atributo Base permanentemente (limite de 8).],
  [*3 PA*], [Vantagem permanente em todos os Testes de Resistência de *1 Atributo* à sua escolha.],
  [_Variável_], [*Magias e Talentos de Árvore* — o custo escala com o Rank (ver tabela abaixo).],
)

#quadro(titulo: [O Padrão das Reservas])[
Todo talento de árvore que compra reserva vale exatamente o mesmo, custe onde custar: *1 PA = +2 PM por patamar seu naquela árvore*, ou *+4 PV por patamar seu naquela árvore*. Comprável tantas vezes quantos forem os seus patamares.

No 1º patamar isso é +2 PM ou +4 PV, e é pouco. No 6º é +12 PM ou +24 PV, e vale a compra. *O talento cresce junto com a ficha* — do contrário, no topo ele viraria letra morta, e todo talento morto é um item de lista que só confunde a mesa.

Isso existe para que a resposta a _"qual escola dá mais vida de graça?"_ seja *nenhuma*. Escolas se diferenciam pela curva de progressão e pelas Maestrias, nunca por um talento genérico valer mais em uma do que na outra.
]

#quadro(titulo: [Atenção: Magia não tem preço fixo])[
Comprar _Zero Absoluto_ não pode custar o mesmo que comprar _Bola de Água_. Toda aquisição dentro de uma Árvore de Progressão usa a tabela de custos por Rank da seção seguinte.
]

== 3. A Regra de Desbloqueio de Ranks

O mundo é dividido em 7 Ranks de Maestria (_Principiante, Intermediário, Avançado, Santo, Rei, Imperador e Deus_). O Rank atua como uma permissão de acesso aos segredos daquele patamar.

Você só recebe permissão para comprar o desbloqueio de um Rank quando já possuir o número mínimo de *conhecimentos* (magias e talentos comprados) daquela mesma árvore.

#tbl(6, (left, center, center, center, center, center),
  [Rank], [Custo de Desbloqueio], [Conhecimentos Exigidos], [Magia Comum], [Magia Assinatura ◆], [Talento],
  [*Principiante*], [1 PA], [—], [1 PA], [2 PA], [1 PA],
  [*Intermediário*], [1 PA], [2], [1 PA], [2 PA], [1 PA],
  [*Avançado*], [2 PA], [4], [2 PA], [3 PA], [2 PA],
  [*Santo*], [2 PA], [6], [3 PA], [4 PA], [3 PA],
  [*Rei*], [3 PA], [8], [4 PA], [5 PA], [3 PA],
  [*Imperador*], [3 PA], [10], [5 PA], [6 PA], [4 PA],
  [*Deus*], [_Narrativa_], [13], [—], [—], [—],
)

#quadro(titulo: [Magia Assinatura ◆])[
Dentro de cada Rank existe *uma* magia que define aquele patamar — a que os magos daquele nível são reconhecidos por saber, a que aparece escrita na carteira de registro da Guilda. Ela custa *+1 PA* e está marcada com o símbolo *◆* nas listas.
]

#quadro(titulo: [Maestrias não contam])[
*Maestrias* (as passivas automáticas que você ganha de graça ao desbloquear um Rank) *não contam* como conhecimentos. Apenas magias e talentos efetivamente comprados com PA contam para a tabela acima.
]

#quadro(titulo: [E o Rank Deus?])[
O patamar Divino (Deus) é a grande exceção à regra. Ele não possui um custo mecânico de PA listado no livro. Como habilidades divinas beiram a onipotência e reescrevem as leis da realidade, este Rank só pode ser alcançado através de um intenso _Roleplay_ e eventos lendários na narrativa, ditados inteiramente pela história e pelo Mestre.
]

#pagebreak(weak: true)

== 4. O Sistema de Testes e Perícias

Sempre que um jogador tentar uma ação com chance de falha, ele rolará *1d20 + o Atributo correspondente*. Porém, é aqui que o verdadeiro treinamento brilha.

*Adquirindo Perícias*
Para refletir a diferença entre alguém que é apenas "forte" e alguém que realmente estudou e treinou, o sistema utiliza Perícias — uma lista *fechada* (a seguir), não um campo livre.

- *Compra Direta (1 PA = 2 Perícias):* Como perícias representam conhecimentos mundanos e treinamentos práticos que são mais rápidos de aprender do que magias complexas, ao gastar *1 Ponto de Aprimoramento (PA)*, o jogador escolhe e adquire *2 Perícias* simultaneamente.
- *Perícias de Árvore:* Alternativamente, certas árvores de progressão e talentos podem conceder perícias específicas como um bônus por você estar treinando aquele estilo.

#block(breakable: false)[
=== Lista Mestre de Perícias

Vinte perícias, cada uma sob o atributo que a testa. Esta lista é fechada — se uma situação não se encaixa em nenhuma delas, o teste é feito só com o Atributo puro, sem Perícia. *Vigor não governa nenhuma:* ele já é a reserva de PV e a resistência a veneno/clima/cansaço do Capítulo 4, então não duplica papel como perícia.
]

#tbl(3, (left, left, left),
  [Atributo], [Perícias], [Cobre],
  [*Força*], [Atletismo], [Escalar, nadar, arrombar, forçar, saltar.],
  [*Agilidade*], [Acrobacia, Furtividade, Ladinagem], [Equilíbrio e esquiva acrobática · esconder-se e mover-se sem ser notado · agilidade manual (bater carteira, soltar algemas, plantar um item).],
  [*Intelecto*], [Arcanismo, História, Investigação, Medicina, Natureza, Ofícios, Religião], [Teoria mágica e itens encantados · fatos do passado e linhagens · deduzir pistas e ligar evidências · primeiros socorros e diagnóstico físico · fauna, flora e clima · um ofício manual específico, escolhido ao adquirir (Forja, Culinária, Alquimia, Carpintaria...) · doutrina, templos e o Continente Divino.],
  [*Espírito*], [Atuação, Enganação, Intimidação, Intuição, Lábia, Lidar com Animais, Percepção, Persuasão, Sobrevivência], [Performance, música, oratória de palco · mentir e disfarçar intenção · impor medo · perceber mentira e prever intenção · convencer rápido, pechinchar, tagarelar · acalmar e comandar animais · notar detalhes com os sentidos · convencer com argumento sincero · rastrear, orientar-se e sobreviver no ermo.],
)

#quadro(titulo: [Sobre nomes parecidos])[
*Persuasão* é o argumento sincero — o que você diria numa negociação de verdade. *Lábia* é o oposto: rapidez de fala, pechincha de mercado, o papo que convence sem precisar ser verdadeiro. Um Antecedente ou traço que mencione "Diplomacia" está se referindo a Persuasão — o livro usa um nome só a partir desta edição.
]

*Vantagem por Perícia*
Sempre que você for realizar uma ação e possuir uma *Perícia* que se encaixe perfeitamente na situação, você recebe *Vantagem*:

- Você rola *2d20*, escolhe o *maior resultado*, e só então soma o bônus do seu Atributo Base.

#quadro(titulo: [Vantagem Absoluta])[
Alguns efeitos concedem _Vantagem Absoluta_. Nesse caso, você rola *3d20* e escolhe o maior. _Desvantagem Absoluta_ funciona da mesma forma, mas você escolhe o menor.
]

#block(breakable: false)[
=== Proficiências: Armas e Armaduras

Toda árvore do Corpo já concede proficiência com o que ela usa — várias Maestrias de 1º patamar dizem isso explicitamente. O que faltava era o *padrão*, pra quando nenhuma árvore ainda cobriu aquele equipamento.
]

#quadro(titulo: [O Padrão])[
- *Armas simples* (Dado Base até d6 — Cap. 3: adaga, espada curta, funda, arco curto, objeto improvisado): todo personagem é proficiente, sem exceção.
- *Armas marciais* (Dado Base d8 ou mais): exigem proficiência, concedida pelo 1º patamar de uma árvore do Corpo que use aquele tipo de arma, ou por um talento específico.
- *Armadura leve:* todo personagem é proficiente.
- *Armadura média ou pesada, e escudos:* exigem proficiência específica (ex: _Interpor_ do Escudeiro, _Peso Não Atrapalha_ do Suishin-ryū).
]

#quadro(titulo: [Penalidade de Não-Proficiência])[
Usar arma ou armadura sem proficiência não trava a ação — só cobra caro:

- *Arma sem proficiência:* Desvantagem no teste de acerto. O dano continua normal — a Escada de Dados nunca reduz.
- *Armadura sem proficiência:* Desvantagem em Furtividade e Acrobacia, e o Deslocamento cai *3 metros* enquanto vestida.
]

#block(breakable: false)[
=== Equipamento Inicial e a Árvore Inicial

Ninguém começa do zero. Ao criar seu personagem, desbloqueie o 1º patamar de pelo menos uma árvore — sua *Árvore Inicial* — com parte dos seus 3 PA iniciais. Ela decide o kit abaixo, recebido de graça e *além* do dinheiro do seu Antecedente (seção 6): as duas coisas não competem entre si.
]

#tbl(2, (left, left),
  [Árvore Inicial], [Kit Inicial],
  [Deus da Espada, Deus do Norte, Deus da Água], [Uma espada longa ou curta, com bainha. Suishin-ryū soma um escudo e armadura leve; os outros dois, roupas de viagem resistentes.],
  [Lutador], [Uma arma pesada à escolha (machado, martelo ou montante) — ou nenhuma, se preferir lutar com as próprias mãos desde o 1º patamar.],
  [Cavalaria e Escudos], [Um escudo, uma arma de uma mão e armadura média.],
  [Arquearia], [Um arco curto, 20 flechas e uma adaga reserva.],
  [Água, Fogo, Vento, Terra], [Um cajado ou foco arcano (conta como objeto improvisado corpo a corpo), um grimório básico e roupas de viajante.],
  [Cura, Desintoxicação, Barreira], [Um kit de cura (bandagens, ervas, um frasco vazio), um símbolo do templo de origem e um cajado leve.],
  [Invocação], [Giz e tinta ritual pra três círculos e uma adaga.],
  [Furtividade e Armadilhas], [Duas adagas, um kit de arrombamento e roupas escuras.],
  [Bardo e Interação], [Um instrumento musical à escolha e uma adaga.],
  [Navegação e Liderança], [Um kit de sobrevivência (corda, mapa em branco, uma semana de provisões) e uma arma simples à escolha.],
)

#quadro(titulo: [O kit não é a build])[
O kit inicial existe só pra ninguém chegar na primeira cena de mãos vazias. Ele não substitui comprar magias, técnicas ou talentos com PA, e pode ser vendido, trocado ou ignorado como qualquer outro item da mochila.
]

== 5. Raças do Mundo de Seis Faces

O mundo é habitado por diversas raças com fisiologias e culturas vastamente diferentes. Escolha sua linhagem para determinar seus traços genéticos e mecânicos.

#block(breakable: false)[
=== Humanos (Jinzoku)

A raça dominante do mundo, formando a maioria nos continentes Central, Begaritt e Millis.
]

- *Fisiologia e Estatísticas:* Possuem um físico relativamente fraco e expectativa de vida curta (cerca de 70 a 100 anos), porém compensam com altíssima inteligência e a civilização mais desenvolvida.
- *Traço (Adaptabilidade):* Devido à sua versatilidade e intelecto, você ganha *2 Perícias extras* à sua escolha na criação de personagem e recebe *PM extras iguais ao seu Maior Bônus de Rank de magia*.

#block(breakable: false)[
=== Elfos (Erufu)

Habitantes da parte sul da Grande Floresta no Continente Millis. Ancestrais dos Altos Elfos (os criadores da magia orgânica original).
]

- *Fisiologia e Estatísticas:* Corpos esguios e orelhas longas e pontudas. Têm taxas de fertilidade muito baixas, mas expectativas de vida longuíssimas, capazes de viver centenas de anos mantendo a aparência de seu auge físico.
- *Traço (Sentido da Floresta):* Graças à sua audição aguçada e senso de direção perfeito, você tem *Vantagem* em testes de Percepção baseados em som e testes de Sobrevivência para navegação. Você ganha *PM extras iguais ao dobro do seu Maior Bônus de Rank de magia*.

#block(breakable: false)[
=== Anões (Dowaafu)

Moradores do sopé da Cordilheira do Dragão Azul. Uma raça de artesãos e ferreiros inatos. Criam as crianças da mesma geração como irmãos e só recebem um nome oficial aos 7 anos de idade.
]

- *Fisiologia e Estatísticas:* Vivem várias centenas de anos. São baixos em estatura, sendo os machos muito robustos e as fêmeas semelhantes a jovens humanas. Possuem alta resistência ao álcool.
- *Traço (Sangue da Forja):* Você recebe a perícia _Ofícios (Forja)_ gratuitamente. Magias de Terra e Fogo custam *1 PM a menos* para você conjurar (mínimo de 1), mas você *não pode aprender* magias de Água ou Vento.

#block(breakable: false)[
=== Povo Pequeno / Hobbits (Hobitto)

Raça que vive na parte noroeste da Grande Floresta e em cidades como Millishion.
]

- *Fisiologia e Estatísticas:* São muito pequenos em estatura, assemelhando-se fisicamente a crianças humanas por toda a vida.
- *Traço (Aparência Enganosa):* Seu deslocamento base é de apenas 7,5m. No entanto, por usarem sua aparência inofensiva a seu favor, rolam testes de _Enganação_ e _Furtividade_ sempre com *Vantagem*.

#block(breakable: false)[
=== Raça Fera (Juuzoku — Tribo Doldia e afins)

Habitantes da Grande Floresta após a destruição do Mundo das Feras.
]

- *Fisiologia e Estatísticas:* Têm aparência humana misturada a traços de mamíferos (orelhas, caudas felinas ou caninas). Tempo de vida similar ao dos humanos, mas fisicamente superiores.
- *Traço (Sentidos Selvagens):* Você ganha *Vantagem* em testes para rastrear usando o olfato. No entanto, devido à sensibilidade do focinho, você sofre *Desvantagem* em testes de resistência contra fumaça ou odores fortes.
- *Magia Inerente (Exclusiva da Raça):* Você já nasce com a capacidade de conjurar a técnica _Howling_.

#quadro(titulo: [Magia Inerente: Howling (O Uivo)])[
Os membros da Raça Fera conseguem infundir mana diretamente em suas cordas vocais, produzindo efeitos físicos através do som. Não requer encantamento verbal longo, apenas o rugido.
- *Tempo de Conjuração:* 1 Ação.
- *Custo:* 2 PM.
- *Alcance e Área:* Cone de 9 metros (Ataque) ou Esfera de 18 metros (Rastreio).
- *Efeito (Modo Combate):* Você solta um rugido infundido com mana de alta pressão. Todas as criaturas no cone de 9 metros devem fazer um Teste de Resistência de *Vigor*. Se falharem, sofrem *1d6 de dano sônico* e ficam _Atordoadas_ (não podem agir) até o final do próximo turno delas devido à desorientação. Se passarem, sofrem metade do dano e não ficam atordoadas.
- *Efeito (Modo Ecolocalização):* Gastando *1 Ação*, você emite um pulso sonoro de baixa frequência (inaudível para humanos). Pelos próximos 10 minutos, você sabe a localização exata de qualquer criatura invisível ou escondida dentro da esfera de 18 metros, contanto que o som possa alcançá-la.
]

#block(breakable: false)[
=== Raças Celestiais e Oceânicas

- *Raça Celestial (Tenzoku):* Habitantes do Continente Divino. Vivem pelo menos algumas centenas de anos e possuem asas. *Traço:* Ganham deslocamento de Voo igual ao seu deslocamento de caminhada.
- *Raça do Oceano (Kaizoku):* Governantes do Mar de Ringus. *Traço:* Respiram debaixo d'água e ignoram penalidades de terreno difícil aquático.
]

#block(breakable: false)[
=== A Raça Demônio (Mazoku)

Termo guarda-chuva para os habitantes originais do Continente Demônio (apoiadores da Imperatriz Kishirika). Eles variam imensamente em longevidade e poder:
]

- *Migurd:* Humanoides de cabelos e olhos azuis. Vivem cerca de 200 anos, mantendo a aparência de adolescentes de 15 anos até completarem cerca de 150 anos.
  - _Traço:_ Você ganha *PM extras iguais ao triplo do seu Maior Bônus de Rank de magia* e a habilidade inata de se comunicar por telepatia curta com outros Migurds ou seres com telepatia.
- *Superd:* Pele pálida, cabelos verdes e uma cauda bifurcada que cai e se torna sua lança tridente.
  - _Traço (O Terceiro Olho):_ Possuem uma gema vermelha na testa. Gastando *1 Ação*, você pode usá-la para "enxergar" a presença de seres vivos e fluxos de mana através de paredes por 1 minuto. _Atenção:_ Sofrem severo preconceito e rolam interações sociais com humanos com *Desvantagem*.
- *Ogros (Onizoku):* Extremamente altos e musculosos. Os machos chegam a medir *3 metros de altura*. Possuem mandíbulas salientes e chifres.
  - _Traço (Brutamontes):_ Seu tamanho gigante concede *Vantagem* em testes de Força bruta. O limite máximo de peso que você consegue carregar é dobrado.
- *Demônio Imortal:* Descendentes do Primeiro Deus Demônio. Machos têm pele negra azeviche e seis braços; fêmeas têm apenas dois.
  - _Traço (Regeneração Profunda):_ Você não é totalmente imortal mecanicamente, mas é quase impossível de ser mantido morto. Você regenera passivamente *+2 PV* no início de cada um dos seus turnos, desde que esteja com mais de 0 PV.

#block(breakable: false)[
=== Raça Dragão (Ryuzoku)

_(Atenção: Esta é uma Raça Mítica. O Mestre deve aprovar seu uso, pois seu nível de poder inicial é muito superior às raças comuns.)_

Os habitantes originais do destruído Mundo dos Dragões. Após a queda de seu mundo, os poucos que restaram fugiram para o Mundo Humano, onde foram caçados por vingança. Estão quase extintos.
]

- *Fisiologia e Estatísticas:* É a raça fisicamente mais poderosa da existência. Podem viver mais de *100.000 anos*, procriando apenas a cada milênio.
- *Traço (Escamas Dracônicas):* Seu corpo possui micro-escamas invisíveis a olho nu, mas duras como aço. Mesmo sem usar nenhuma armadura, você recebe *+3 na CA* e Resistência a dano cortante de armas não-mágicas.
- *Traço (Aura Primordial e Garras):* A Raça Dragão é a única que já nasce com os poros de mana abertos para o _Touki_ (Aura de Batalha). Seus ataques desarmados são tratados como armas letais mágicas, causando *1d8 + Força* de dano cortante. Você também recebe *+5 PV Máximos* na criação e Resistência a um elemento de sua escolha (Fogo, Gelo ou Eletricidade).
- *O Preço do Sangue (Desvantagem Social):* A mera presença de um Dragão instiga um medo subconsciente e irracional em outras raças. Você tem *Vantagem* em testes de Intimidação, mas rola com *Desvantagem Absoluta* qualquer teste de Persuasão ou Lábia. Pessoas comuns tendem a evitar olhar para você ou atravessam a rua quando você passa.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#largo[
== 6. O Destino e a Infância (Antecedentes)

No universo de _Mushoku Tensei_, o que você fez nos seus primeiros 10 anos de vida define a fundação do seu corpo, sua mana e seu lugar no mundo. O estímulo mágico precoce, os traumas de infância ou o treinamento com espadas de madeira moldam quem o aventureiro é hoje.

Durante a criação da sua ficha, role *1d100* (ou escolha o seu Antecedente em conjunto com o Mestre) na tabela abaixo para descobrir a sua origem e seu dinheiro inicial em *Peças de Ouro (PO)*:

#tbl(3, (center, left, left),
  [d100], [Antecedente de Infância], [Efeito Mecânico, História e Dinheiro],
  [*01-15*], [*Plebeu / Trabalhador Rural*], [Cresceu no campo trabalhando na terra ou ajudando a família em ofícios braçais. *Efeito:* Ganha *2 Perícias* ligadas a trabalhos mundanos (ex: Ofícios, Culinária, Lidar com Animais ou Natureza). #linebreak()  *Dinheiro Inicial:* 2d4 PO.],
  [*16-25*], [*Órfão das Ruas*], [Sem pais para te guiar, as vielas sujas foram sua escola. Você sobreviveu roubando e fugindo. *Efeito:* Ganha *2 Perícias* de sobrevivência urbana (ex: Furtividade, Ladinagem, Enganação ou Acrobacia). #linebreak()  *Dinheiro Inicial:* 1d4 PO.],
  [*26-35*], [*Criança Selvagem*], [Passou a infância correndo pelas montanhas, sobrevivendo a quedas e brigando. *Efeito:* Recebe *+4 PV Máximos* permanentemente e a Perícia _Sobrevivência_. #linebreak()  *Dinheiro Inicial:* 0 PO (mas rola Sobrevivência com Vantagem para achar comida).],
  [*36-45*], [*Aprendiz de Mercador*], [Viajou em caravanas, lidou com moedas estrangeiras e aprendeu a ler as intenções das pessoas. *Efeito:* Ganha as Perícias _Intuição_ e _Lábia_. #linebreak()  *Dinheiro Inicial:* 4d4 + 10 PO.],
  [*46-55*], [*Treino Precoce / Escudeiro*], [Brincou com espadas de madeira e imitou os guardas locais desde que conseguia andar. *Efeito:* Você recebe *Vantagem em todas as rolagens de Iniciativa* e ganha a Perícia _Atletismo_. #linebreak()  *Dinheiro Inicial:* 2d4 + 2 PO.],
  [*56-65*], [*Acólito / Filho do Templo*], [Cresceu cercado pela fé, copiando livros sagrados e aprendendo a ajudar os necessitados. *Efeito:* Ganha as Perícias _Religião_ e _Medicina_. #linebreak()  *Dinheiro Inicial:* 2d4 PO.],
  [*66-72*], [*Sangue Nobre*], [Nascido em berço de ouro, instruído em etiqueta, dança e política. *Efeito:* Ganha as Perícias _Persuasão_ e _História_. Tem *Vantagem* em testes sociais ao lidar com autoridades. #linebreak()  *Dinheiro Inicial:* 6d4 + 20 PO.],
)
]

#largo[
#tbl(3, (center, left, left),
  [d100], [Antecedente de Infância], [Efeito Mecânico, História e Dinheiro],
  [*73-80*], [*Estudioso Precoce (Expansão)*], [Leu grimórios e forçou o limite da sua magia antes do seu corpo estar formado. *Efeito:* Recebe *PM extras iguais a quatro vezes o seu Maior Bônus de Rank de magia* e a Perícia _Arcanismo_. #linebreak()  *Dinheiro Inicial:* 2d4 PO.],
  [*81-86*], [*Sobrevivente / Ex-Escravo*], [Passou por um inferno na infância. Sua mente se blindou contra a dor. *Efeito:* Você tem *Vantagem* em testes de resistência de Espírito (contra Medo) e Vigor (contra Exaustão). #linebreak()  *Dinheiro Inicial:* 0 PO.],
  [*87-92*], [*Fator Laplace / Linhagem Antiga*], [Você carrega um sangue perigoso (revelado, por exemplo, por cabelo verde). *Efeito:* Ganha *PM extras iguais a quatro vezes o seu Maior Bônus de Rank de magia*. Desvantagem em testes de Persuasão devido ao medo que instiga em pessoas comuns. #linebreak()  *Dinheiro Inicial:* 1d4 PO.],
  [*93-96*], [*Miko (Abençoada/Amaldiçoada)*], [Você nasceu com uma mutação mágica raríssima. *Efeito:* Role na Tabela de Mikos (a seguir). #linebreak()  *Dinheiro Inicial:* 2d4 PO (ou capturado pela realeza).],
  [*97-98*], [*Olho Místico Inato*], [Nasceu acidentalmente com um Olho Demoníaco/Místico desperto. *Efeito:* Role na Tabela de Olhos Místicos (a seguir). #linebreak()  *Dinheiro Inicial:* 2d4 PO.],
  [*99-100*], [*Gênio (Conjuração Silenciosa)*], [Você compreende a estrutura do mundo e dispensa cânticos. *Efeito:* Você pode conjurar em *Conjuração Silenciosa* sem sofrer a redução de dano — apenas a limitação de área permanece. #linebreak()  *Dinheiro Inicial:* 2d4 PO.],
)
]

#pagebreak(weak: true)

#largo[
#block(breakable: false)[
=== Tabela de Miko e Amaldiçoados (Crianças Especiais)

Na sociedade humana, as anomalias de mana que causam poderes são chamadas de _Miko_ (Criança Abençoada) se o poder for útil, ou _Noroi-ko_ (Criança Amaldiçoada) se for prejudicial. Estatisticamente, *existem apenas cerca de 10 Mikos em todo o mundo* simultaneamente. Se você tirou esse resultado, role *1d8* para definir sua condição:
]

#tbl(3, (center, left, left),
  [1d8], [Tipo de Anomalia], [Efeito Mecânico (Bênção e Maldição)],
  [*1*], [*Força Sobre-humana* _(Zanoba)_], [*Abençoada:* Sua Força recebe +3 (podendo ultrapassar o limite natural) e seus ataques desarmados causam 1d8 + Força (letal). *Maldição:* Você não possui resistência física; rola testes de Vigor com Desvantagem.],
  [*2*], [*Leitura de Memórias*], [*Abençoada:* Com 1 Ação de toque, você lê memórias superficiais e intenções (Vantagem em Intuição/Interrogatório). *Maldição:* Custa 3 PM por uso.],
  [*3*], [*Rebobinar o Tempo*], [*Abençoada:* 1 vez por semana, você rebobina o estado de um objeto inanimado em até 24 horas. *Maldição:* Drena 50% do seu PM Máximo ao ser usado e não funciona em nenhuma criatura viva.],
  [*4*], [*Telepatia*], [*Abençoada:* Pode ler pensamentos superficiais e falar telepaticamente num raio de 18m. *Maldição:* Sua mente é dessincronizada do corpo. Você é fisicamente mudo e rola testes de Iniciativa com Desvantagem por estar sempre em "modo de sonho".],
  [*5*], [*Miko da Confiança Absoluta*], [*Abençoada:* Sua aura gera extremo conforto. Qualquer humano instintivamente confia nas suas palavras (Vantagem Absoluta em Persuasão e Lábia). *Maldição:* Você sofre de ingenuidade mágica e falha automaticamente em testes de Intuição para perceber se alguém está mentindo para você.],
  [*6*], [*Maldição do Esquecimento*], [*Abençoada:* Presença nula. Vantagem Absoluta em testes de Furtividade. *Maldição:* Ninguém (além de familiares consanguíneos e Superds) consegue se lembrar do seu rosto, nome ou existência 10 minutos após você sair do campo de visão deles.],
  [*7*], [*Maldição do Acúmulo*], [*Abençoada:* Seu corpo funciona como um reator infinito de energia (*PM extras iguais a seis vezes o seu Maior Bônus de Rank de magia*). *Maldição:* Exige "liberação" semanal (por itens mágicos absurdamente caros ou relações íntimas). Falhar nisso aplica 1 nível de Exaustão por dia até a morte por cristalização.],
  [*8*], [*Maldição do Ódio*], [*Abençoada:* Corpo revestido de aura primordial (*+2 na CA* e *+PV iguais a cinco vezes o seu maior Bônus de Rank*). *Maldição:* Todo ser do mundo que sinta mana sofre de ódio instintivo e paranoico ao te ver.],
)

#block(breakable: false)[
=== Tabela de Olhos Demoníacos / Místicos (Magan)

Cada olho possui regras estritas de economia de ação e custo de PM. Se tirou esse antecedente, role *1d10*.
]

#tbl(3, (center, left, left),
  [1d10], [Olho Místico], [Mecânica, Custos e Limitações],
  [*1*], [*Olho da Previsão*], [*Ativação:* 1 Ação (3 PM por turno mantido). *Efeito:* Enxerga 2 segundos no futuro. Você ganha Vantagem nos ataques e oponentes têm Desvantagem para te acertar. *Limitação:* Usar por mais de 3 turnos seguidos no combate causa Tontura (condição _Envenenado_) por 1 hora.],
  [*2*], [*Olho do Poder Mágico*], [*Ativação:* Livre (2 PM por cena). *Efeito:* Vê o fluxo de mana. Enxerga criaturas invisíveis magicamente, identifica se um item é mágico e mede o nível de mana/perigo de um alvo. *Limitação:* Deixá-lo sem tapa-olho em cidades sobrecarrega a visão, causando dores de cabeça.],
  [*3*], [*Olho da Clarividência*], [*Ativação:* 1 Ação (1 PM por quilômetro). *Efeito:* Visão telescópica avançada, mudando o ponto de perspectiva como se fosse um drone mágico. *Limitação:* Sua consciência foca longe. Seu corpo físico fica _Cego_ e indefeso (CA base cai para 10) enquanto o olho estiver em uso.],
  [*4*], [*Olho de Permeação*], [*Ativação:* 1 Ação (2 PM por cena). *Efeito:* Visão de raio-X através de paredes, caixas ou roupas (alcance de 9m). *Limitação:* Não atravessa criaturas vivas, materiais banhados em alta densidade de mana (portões de chefes/barreiras) ou minérios mágicos brutos.],
  [*5*], [*Olho de Identificação*], [*Ativação:* 1 Ação (1 PM por alvo). *Efeito:* Ao focar em itens ou inimigos, revela fraquezas, nome do feitiço sendo conjurado e efeitos. *Limitação:* Restrito ao conhecimento da criadora do olho (Kishirika). Segredos divinos ou de outros continentes aparecem como "Desconhecido".],
  [*6*], [*Olho da Absorção*], [*Ativação:* Reação (gasta PM igual ao PM da magia absorvida). *Efeito:* Anula a magia inimiga. *Limitação Severa:* Se você tentar lançar qualquer magia com este olho descoberto, ele suga seu próprio feitiço: você perde a ação, o PM, e a magia falha. Absorver magias de rank Rei/Imperador exige teste de Vigor (CD 18) ou o olho sofre dano e você fica cego por 1 semana.],
  [*7*], [*Olhos Que Tudo Veem*], [*Ativação:* Ritual de 10 minutos (10 PM). *Efeito:* Pode rastrear uma pessoa pelo globo inteiro ou revelar a planta baixa estrutural de uma masmorra. *Limitação:* Só pode ser usado *1 vez por semana*. O uso frita as retinas e te deixa com Visão Embaçada (-2 em acertos físicos) pelo resto do dia.],
  [*8*], [*Olho do Vazio Absoluto*], [*Ativação:* 1 Ação (5 PM por turno mantido). *Efeito:* Cria uma barreira de repulsão espacial de 9 metros centrada em você. Nenhuma criatura física consegue andar em sua direção. *Limitação:* Requer concentração absoluta. Você não pode atacar ou se mover do lugar enquanto o mantiver aberto.],
  [*9*], [*Olho de Afeição*], [*Ativação:* Passiva se descoberto (1 PM por hora). *Efeito:* Alvos que olharem nos seus olhos fazem teste de Espírito com Desvantagem. Falha resulta em infatuação perigosa. *Limitação:* Difícil de controlar. Alvos afetados podem desenvolver obsessão _yandere_, matando seus aliados por ciúmes de você.],
  [*10*], [*Olho Rastreador*], [*Ativação:* 1 Ação de Busca (2 PM para horas recentes / 10 PM para décadas). *Efeito:* Revela rastros de vida iluminados. Permite seguir pegadas precisas por continentes. *Limitação:* O rastreio de coisas antigas (décadas) tem _cooldown_ de *1 vez por mês*, exigindo esforço extremo para decifrar a mana dissipada.],
)
]

#pagebreak(weak: true)

== 7. O Valor do Rank e o Bônus de Conjuração

No mundo de _Mushoku Tensei_, o quão forte uma magia atinge o inimigo ou a dificuldade de esquivar do seu golpe de espada não dependem apenas da sua força bruta, mas da sua *Maestria* (o seu Rank) naquela escola específica.

#tbl(2, (left, center),
  [Rank na Árvore], [Bônus Numérico],
  [Principiante], [+1],
  [Intermediário], [+2],
  [Avançado], [+3],
  [Santo], [+4],
  [Rei], [+5],
  [Imperador], [+6],
  [Deus], [+8],
)

#quadro(titulo: [O Bônus Depende da Ação!])[
O Bônus Numérico é *específico* para a árvore que você está usando no momento. Se você for realizar um ataque da escola _Magia de Água_, você usa o seu Rank de Água. Se logo depois você usar uma _Magia de Cura_, usará o seu Rank de Cura — que pode ser completamente diferente.
]

#block(breakable: false)[
=== O Bônus de Conjuração (BC)

Este é o número mais importante da ficha de um mago, e ele unifica as três fórmulas do sistema em um único valor. Sempre que uma magia disser "+ BC", use este número.
]

#quadro(titulo: [Bônus de Conjuração])[
*BC = Intelecto + Bônus do Rank naquela escola.*

- *Acerto Mágico:* 1d20 + BC (contra a CA do alvo)
- *CD para resistir:* 8 + BC (o alvo rola 1d20 + atributo de defesa)
- *Dano Mágico:* dados da magia + BC

_Exemplo: um mago com Intelecto 4 e rank Intermediário de Água tem BC 6. Ele acerta com 1d20+6, sua CD é 14, e sua Lança de Gelo causa os dados +6._
]

#block(breakable: false)[
=== As Fórmulas Marciais

Guerreiros usam a mesma lógica, apenas trocando o atributo:
]

- *Acerto Físico =* 1d20 + Força (ou Agilidade, para armas leves) + Bônus do Rank da Técnica.
- *CD de uma Técnica =* 8 + Força (ou Agilidade) + Bônus do Rank da Técnica.
- *Dano Total =* Dados da Arma + Atributo + Bônus do Rank da Técnica.

#pagebreak(weak: true)

== 8. Misturando Árvores (Multiclasse)

Este sistema não tem classes, então nada impede você de ser Trovador de Bardo, Rastreador do Tático, Intermediário de Fogo e Principiante do Norte ao mesmo tempo. Isso é intencional e é o coração do jogo.

Mas isso cria seis perguntas que a mesa vai fazer na primeira sessão. Aqui estão as seis respostas.

#quadro(titulo: [1. Qual Bônus de Rank eu uso?])[
*O da árvore que concedeu a habilidade.* Sempre. Se a _Flecha de Água_ diz "+ BC", esse BC usa o seu Rank de Água, mesmo que você seja Imperador de Fogo.

*Exceção:* quando uma regra genérica do livro pedir "seu Bônus de Rank" sem dizer de qual árvore, use o *maior* Bônus de Rank que você possui em qualquer árvore.
]

#quadro(titulo: [2. Conhecimentos somam entre árvores?])[
*Nunca.* A contagem de conhecimentos para desbloquear um patamar conta apenas magias, técnicas e talentos *daquela mesma árvore*. Ter 20 conhecimentos espalhados por cinco árvores não te aproxima nem um pouco do Rank Santo de nenhuma delas.
]

#quadro(titulo: [3. Como somam PV, PM, PT e PP?])[
- *PV:* a Progressão soma os dados de *todas* as árvores (dobrados). A Constituição Base e a Vitalidade são contadas *uma vez só*, usando o seu maior Bônus de Rank de qualquer árvore.
- *PM:* fórmula única, usando o seu maior Bônus de Rank *de magia*. Ter cinco escolas não soma mana nenhuma — só a mais profunda conta.
- *PT:* reserva *única*. Usa o seu maior Bônus de Rank *do Corpo*.
- *PP:* reserva *única*. Usa o seu maior Bônus de Rank *de Utilidade* e o maior atributo-chave entre as suas árvores de Utilidade.

Todas as quatro fórmulas estão no Capítulo 4, em Cálculos Vitais.

Você nunca tem duas reservas do mesmo tipo. Você tem um PT e um PP, alimentados por tudo que você estudou.
]

#quadro(titulo: [4. Custo de Abertura])[
Abrir uma árvore nova fica mais caro a cada árvore que você já tem. O *1º patamar* custa:

#tbl(6, (left, center, center, center, center, center),
  [Árvore], [1ª], [2ª], [3ª], [4ª], [5ª],
  [*Custo de abertura*], [1 PA], [2 PA], [3 PA], [4 PA], [5 PA],
)

Os demais patamares seguem a tabela normal da seção 3.

*Por que esta regra existe:* cada 1º patamar entrega uma *Maestria gratuita*, e algumas são absurdas por 1 PA — _Sobreviver é Vencer_ dá um degrau de Dado de Arma e proficiência universal; _Olho Treinado_ remove a rolagem de armadilhas do jogo. Sem o Custo de Abertura, a jogada ótima seria abrir cinco árvores por 5 PA e colecionar cinco Maestrias sem nunca subir nenhuma. Agora isso custa 15 PA, e continua sendo uma opção legítima — só não é mais de graça.
]

#quadro(titulo: [5. Largura ou profundidade?])[
Ir fundo em uma árvore custa 12 PA para chegar ao Imperador e entrega o Bônus de Rank +6, as seis Maestrias e as magias de patamar alto. Ir largo entrega muitas Maestrias de 1º patamar, versatilidade e nenhum teto.

]

#quadro(titulo: [6. E o Rank Deus?])[
O patamar Deus é sempre narrativo e sempre de *uma* árvore. Ninguém no Mundo de Seis Faces jamais alcançou o patamar Deus em duas coisas ao mesmo tempo, e o livro trata isso como impossível, não como difícil.
]

#pagebreak(weak: true)

= Capítulo 2: As Leis da Magia

== 1. As Categorias da Magia

As magias são divididas em três categorias principais: *Magia de Ataque*, *Magia de Cura* e *Magia de Invocação*. A Magia de Ataque possui a maior quantidade de feitiços disponíveis, enquanto a de Invocação possui a menor.

A Magia de Ataque se divide nos quatro elementos clássicos — Água, Fogo, Terra e Vento. A Magia de Cura se divide em Cura, Desintoxicação e Barreira. A Magia de Invocação não se subdivide: é a menor e mais direta das três categorias.

#quadro(titulo: [Quão raro é um mago?])[
Apenas *1 em cada 20 pessoas* nasce com capacidade de manipular mana. Dessas, apenas *1 em cada 20* consegue treinar o suficiente para virar um mago de verdade — ou seja, cerca de *1 pessoa em 400*.

E de cada cem magos formados, apenas *um* completa os estudos até o rank Avançado. Isso significa que um mago Avançado é aproximadamente *1 em 40.000 pessoas*. Trate cada rank alto como o evento raríssimo que ele é: no Reino Asura, um tutor particular precisa ser no mínimo Avançado, e famílias nobres brigam por eles.
]

== 2. A Regra de Encantamentos

A regra de ouro da magia é: *o poder da magia depende do seu encantamento e do tempo gasto para conjurá-la.*

O tamanho de um encantamento é proporcional ao seu rank: quanto maior o rank, mais longo é o cântico. Um feitiço de rank Principiante pode ter apenas algumas frases, enquanto uma magia de Desintoxicação de rank Deus pode ser tão longa quanto um dicionário.

Existem três formas de recitar:

- *Conjuração Padrão:* você recita o cântico inteiro. A magia causa 100% do seu efeito.
- *Encantamento Encurtado:* você pula versos intencionalmente. É mais rápido, mas instável.
- *Conjuração Silenciosa:* você manipula a mana diretamente, sem palavra alguma. É o método mais raro e o mais flexível.

#quadro(titulo: [Penalidade do Encantamento Encurtado])[
Ao encurtar, você rola *metade dos dados de dano (arredondado para baixo)* e a área de efeito é reduzida em *um terço*. O BC continua sendo somado integralmente — sua maestria não some, apenas a estrutura do feitiço fica instável.
]

#quadro(titulo: [A Flexibilidade da Conjuração Silenciosa])[
Além de ser mais rápida, ela é *moldável*: você ajusta tamanho, velocidade e formato do feitiço na hora, sem depender de palavras fixas.

Ao conjurar em silêncio, escolha *um* benefício: dobrar o alcance, mudar a forma da área (linha ↔ cone ↔ esfera), ou segurar o disparo por até 1 turno. Em troca, o dano é o da versão Encurtada.

A Conjuração Silenciosa não é comprável com PA. Ela vem de um Antecedente, de uma raça, ou de uma Maestria de Rank alto.
]

== 3. Tempo de Conjuração por Rank

Esta é a tabela que governa quantas Ações uma magia custa. *O cântico cresce com o rank* — magias grandes exigem que o grupo proteja o mago enquanto ele canta, exatamente como na história.

#tbl(4, (left, center, center, center),
  [Rank da Magia], [Padrão], [Encurtada], [Silenciosa],
  [*Principiante*], [2 Ações], [1 Ação], [1 Ação (a primeira do turno é gratuita)],
  [*Intermediário*], [2 Ações], [1 Ação], [1 Ação],
  [*Avançado*], [3 Ações], [2 Ações], [1 Ação],
  [*Santo*], [4 Ações], [3 Ações], [2 Ações],
  [*Rei*], [5 Ações], [4 Ações], [3 Ações],
  [*Imperador*], [6 Ações], [_Impossível_], [4 Ações],
)

Como o Capítulo 4 permite *dividir o cântico entre turnos*, magias de 4, 5 ou 6 Ações são perfeitamente jogáveis. Elas apenas exigem que alguém segure a linha de frente enquanto você prepara o apocalipse.

#quadro(titulo: [Exemplo: dividindo um cântico de 5 Ações])[
Roxy (Rank Rei de Água) quer conjurar *Relâmpago* (5 Ações). No Turno 1, ela gasta suas 3 Ações recitando e se abaixa atrás do Escudos do grupo. No Turno 2, ela gasta as 2 Ações restantes e solta a magia — desde que tenha dedicado *pelo menos 1 Ação* à conjuração em cada turno intermediário, o cântico nunca se perde.

Se um golpe a atingir no meio do processo, ela rola *Espírito (CD 10 ou metade do dano, o que for maior)*. Falhar custa o cântico inteiro e o PM investido — é por isso que ninguém conjura uma magia de Rank Rei sem alguém para segurar a linha na frente dela.
]

== 4. Magia Combinada

*Magias Combinadas* são feitiços compostos por duas ou mais magias de ataque conjuradas em sequência, cujo resultado é maior que a soma das partes. _Nova Congelante_ é literalmente Vento + Água/Gelo; _Vapor Seco_ é Vento + Fogo.

*Requisito:* você precisa ser *rank Avançado* em pelo menos uma escola de Magia de Ataque. Esse é o portão canônico — nenhum mago abaixo de Avançado consegue combinar escolas.

*Como funciona na mesa:*

+ Você conjura as duas magias no mesmo turno ou em turnos consecutivos.
+ Você paga o PM e as Ações de *ambas*.
+ O resultado é uma terceira magia, com efeito próprio.

#tbl(3, (left, left, left),
  [Combinação], [Resultado], [Efeito],
  [Respingos de Água + Campo de Gelo], [*Nova Congelante*], [Todos na área ficam _Molhados_ e imediatamente _Congelados_, sem teste. Dano: 4d8 de frio.],
  [Tempestade + qualquer magia de Fogo], [*Névoa Escaldante*], [Esfera de 18m de vapor. Escuridão total + 1d6 de dano ígneo por turno a quem estiver dentro.],
  [Canhão de Água + Lâmina de Gelo], [*Serra d'Água*], [A linha do Canhão passa a causar dano cortante e ignora metade da CA de armaduras não-mágicas.],
  [Cumulonimbus + Nevasca], [*Inverno Rasgado*], [A tempestade vira granizo. Toda criatura na área de 1,5 km sofre 2d6 de frio por turno, sem teste.],
)

#quadro(titulo: [Regra de Ouro para o Mestre])[
Se o jogador descrever uma combinação que faz sentido físico, deixe funcionar e invente o efeito na hora. Este sistema recompensa quem pensa como cientista — foi assim que Rudeus criou metade do arsenal dele.
]

== 5. Maestrias

Ao *desbloquear* um Rank em qualquer árvore, você recebe imediatamente e de graça a *Maestria* correspondente. Ela não custa PA, não conta como conhecimento, e não pode ser recusada.

A lógica é simples: no Mundo de Seis Faces, subir de rank não é decorar mais um feitiço — é *compreender o elemento de um jeito novo*. Roxy não comprou a habilidade de encurtar cânticos; ela entendeu água fundo o suficiente para que encurtar virasse natural.

As Maestrias são listadas dentro de cada árvore, em cada Rank, marcadas com o símbolo *◈*.

#pagebreak(weak: true)

= Capítulo 3: As Árvores de Progressão

No mundo de _Mushoku Tensei_, não existem "classes" engessadas ou papéis que limitam suas escolhas. O sistema funciona através de *Árvores de Progressão*. Conforme você treina, você investe seus Pontos de Aprimoramento (PA) para desbloquear habilidades, feitiços e técnicas divididas nestes três grandes pilares:

+ *A Árvore da Magia:* o caminho dos feitiços de ataque (Fogo, Água, Vento, Terra), do suporte (Cura, Barreira) e da Invocação (Espíritos e Feras). Recurso: *PM*.
+ *A Árvore do Corpo:* o caminho de quem resolve as coisas com o corpo. Os três Estilos Divinos de esgrima, mais armas pesadas, escudos e arquearia. Recurso: *PT*.
+ *A Árvore de Utilidade:* o caminho dos especialistas em mundo. Furtividade, música, navegação e liderança. *Sem recurso* — funciona por perícia, posicionamento e usos por descanso.

Você tem total liberdade. Pode focar todos os seus pontos em apenas uma árvore para se tornar um mestre absoluto mais rápido, ou misturar caminhos para ser versátil — como um espadachim que também conhece feitiços básicos de cura.

#pagebreak(weak: true)

#largo[
== O Mapa Completo das Árvores

O sistema comporta *dezessete sub-árvores*. Nenhuma delas é uma classe: você compra Ranks em quantas quiser, na ordem que quiser, e o seu personagem é simplesmente a soma do que ele estudou.

#tbl(5, (left, left, center, center, left),
  [Pilar], [Sub-árvore], [Atributo-chave], [Recurso], [Identidade em uma linha],
  [*Magia*], [Fogo], [Intelecto], [PM], [Dano bruto e incêndio; a escola que não se importa com o que sobra depois.],
  [*Magia*], [Água], [Intelecto], [PM], [Controle de terreno e atrito. Maior reserva de mana, menor dano por golpe.],
  [*Magia*], [Vento], [Intelecto], [PM], [Corte, som e mobilidade. A escola que anula a distância — inclusive a sua.],
  [*Magia*], [Terra], [Intelecto], [PM], [Construção, cerco e projétil pesado. O mago com mais PV do jogo.],
  [*Magia*], [Cura], [Espírito], [PM], [Restaura PV e remove condições. A escola que decide quem sobrevive à campanha.],
  [*Magia*], [Desintoxicação], [Espírito], [PM], [Veneno, doença, maldição e petrificação. A única escola cuja dificuldade cresce sozinha.],
  [*Magia*], [Barreira], [Espírito], [PM], [Anula magia e sela áreas. Contra-magia é a especialidade dela, não dano.],
  [*Magia*], [Invocação], [Espírito], [PM], [Aliados temporários por círculo mágico. A menor lista de feitiços do mundo.],
  [*Corpo*], [Deus da Espada], [Força], [PT], [O maior dano por golpe do jogo. Nenhuma defesa, nenhum contragolpe.],
  [*Corpo*], [Deus da Água], [Vigor], [PT], [Reações e contragolpes empilhados. Menor dano, maior sobrevivência.],
  [*Corpo*], [Deus do Norte], [Força ou Agilidade], [PT], [Truques, improviso e terreno. O meio-termo exato do sistema.],
  [*Corpo*], [Lutador], [Força], [PT], [Arma pesada e punho. Degrada o inimigo a cada acerto em vez de matá-lo rápido.],
  [*Corpo*], [Cavalaria e Escudos], [Vigor], [PT], [Absorve o dano que iria para os outros e não devolve nada.],
  [*Corpo*], [Arquearia], [Agilidade], [PT], [Dano alto a longuíssima distância, sem gastar recurso nenhum.],
  [*Utilidade*], [Furtividade e Armadilhas], [Agilidade], [—], [Emboscada, exploração de masmorra e o que ninguém vê chegando.],
  [*Utilidade*], [Bardo e Interação], [Espírito], [—], [Bônus para o grupo, controle social e informação comprada em taverna.],
  [*Utilidade*], [Navegação e Liderança], [Intelecto], [—], [Viagem, comando e o direito de escolher onde a batalha acontece.],
)
]

#largo[
#quadro(titulo: [Escolas Formais e Ofícios])[
As oito escolas de magia e os três Estilos Divinos são *Escolas Formais*: têm mestres vivos, sedes, hierarquia e títulos reconhecidos no mundo inteiro. Elas usam os nomes canônicos de rank e conferem status social — ser um Rei da Espada abre portas de castelo.

As demais seis são *Ofícios*: aprendidos na estrada, sem diploma e sem escola. *Mecanicamente são idênticos* — mesmo Bônus de Rank, mesmos custos de PA, mesma contagem de conhecimentos — mas os nomes dos patamares mudam, e ninguém vai te chamar de "Imperador" por atirar bem de arco.
]

#tbl(9, (center, center, left, left, left, left, left, left, left),
  [Patamar], [Bônus], [Escolas Formais], [Lutador], [Escudos], [Arquearia], [Furtividade], [Bardo], [Liderança],
  [*1*], [+1], [Principiante], [Briguento], [Escudeiro], [Atirador], [Gatuno], [Aprendiz], [Explorador],
  [*2*], [+2], [Intermediário], [Combatente], [Guarda], [Caçador], [Sombra], [Artista], [Rastreador],
  [*3*], [+3], [Avançado], [Veterano], [Protetor], [Franco-Atirador], [Especialista], [Trovador], [Guia],
  [*4*], [+4], [Santo], [Campeão], [Guardião], [Olho de Águia], [Mestre Espião], [Virtuoso], [Estrategista],
  [*5*], [+5], [Rei], [Mestre de Guerra], [Muralha], [Predador], [Fantasma], [Maestro], [Comandante],
  [*6*], [+6], [Imperador], [Lenda Viva], [Bastião], [Lenda da Flecha], [Lenda Oculta], [Voz do Mundo], [Senhor da Guerra],
  [*7*], [+8], [Deus], [—], [—], [—], [—], [—], [—],
)

#quadro(titulo: [Ofícios não têm patamar Deus])[
O sétimo degrau existe apenas nas Escolas Formais, e mesmo lá é narrativo. Um Ofício termina no sexto patamar — o que é justo: _Lenda Viva_ e _Fantasma_ já são o teto do que o mundo consegue nomear.
]

#quadro(titulo: [Quem veste Touki?])[
*Toda* sub-árvore da Árvore do Corpo desbloqueia o Touki no terceiro patamar — inclusive Arquearia, inclusive Escudos. Do quarto patamar em diante, no mundo inteiro, não existe lutador que não vista aura, e muitos a usam sem sequer perceber.

*A única exceção:* o *Estilo Deus da Espada* desperta a aura no *segundo* patamar. A doutrina inteira dele é velocidade, e velocidade sem aura tem teto. Ele recebe PT e as manobras de gasto no Intermediário, mas o _Manto de Touki_ completo continua chegando apenas no Avançado.

As árvores de *Magia* e de *Utilidade* nunca recebem Touki nem Pontos de Touki, por mais alto que seja o rank.
]
]

#pagebreak(weak: true)

== A Árvore da Magia

Os magos do Mundo de Seis Faces moldam a mana ao seu redor para conjurar milagres ou causar destruição. Das oito escolas, quatro atacam — Água, Fogo, Vento e Terra, cada uma com uma identidade elemental própria e um combo que a distingue das outras três — e quatro sustentam a mesa: Cura, Desintoxicação, Barreira e Invocação, que raramente causam dano e raramente deixam de ser necessárias numa campanha longa.

#quadro(titulo: [Um Pote Só de Mana])[
Todas as oito escolas bebem da mesma reserva de PM, calculada uma única vez pela fórmula do Capítulo 4: *(Espírito × Maior Bônus de Rank de magia × 2) + 8*. Abrir oito escolas no 1º patamar não soma reserva nenhuma — só a escola mais funda que você tiver conta.

É por isso que o mago que vale a pena jogar nesta árvore é o que escolheu *fundo*, não o que escolheu largo. Ver Capítulo 1, seção 2, "Os Dois Atributos do Mago".
]

#block(breakable: false)[
=== Magia de Água

A Magia de Água é a escola da *atrição e do controle de terreno*. Ela não vence trocando golpes; ela vence decidindo onde a luta acontece, quem consegue andar, e quem já está molhado quando o gelo chega.
]

Em um mundo onde um espadachim decapita um mago em dois segundos, os magos de água sobrevivem porque o inimigo nunca chega perto.

#block(breakable: false)[
==== As Condições da Escola

#quadro(titulo: [Molhado])[
Toda magia composta puramente de água aplica esta condição. Dura *1 minuto*, ou até o alvo sofrer dano ígneo — a água evapora e a condição some, mas o alvo sofre *+2 de dano* naquele golpe pelo choque térmico do vapor.

*Efeitos:* Desvantagem em testes de Furtividade (o alvo pinga, range e deixa rastro) e *Vulnerabilidade a dano elétrico*.
]
]

#quadro(titulo: [Congelado])[
Aplicada quando uma magia de gelo atinge um alvo _Molhado_. O alvo faz um Teste de Resistência de *Vigor (CD 8 + seu BC)*. Se falhar:

- Deslocamento reduzido a *0*.
- *Desvantagem* em testes de resistência de Agilidade.
- Ataques corpo a corpo contra ele têm *Vantagem*.

O alvo, ou um aliado adjacente, gasta *1 Ação* para quebrar o gelo. Dano ígneo de qualquer fonte encerra a condição imediatamente.
]

#quadro(titulo: [O Combo Elemental])[
A verdadeira letalidade da escola está em encadear estados físicos.

- *Gelo contra Molhado:* os *dados de dano de frio são dobrados*. Apenas os dados de frio — não o dano físico, não o BC.
- *Eletricidade contra Molhado:* Vulnerabilidade, ou seja, *dano total dobrado*. É o pagamento mais alto do combo, e por isso a eletricidade está trancada no rank Rei.
]

#block(breakable: false)[
==== Progressão de PV e PM da Água

Ao evoluir o seu Rank nesta escola, você recebe melhorias passivas de corpo e reserva. *O ganho escala*, porque os custos escalam.
]

#largo-inline[
#tbl(2, (left, center),
  [Rank alcançado], [PV ganho],
  [Principiante], [1d4 + 1],
  [Intermediário], [1d4 + 2],
  [Avançado], [1d6 + 2],
  [Santo], [1d6 + 3],
  [Rei], [1d8 + 3],
  [Imperador], [1d8 + 4],
)

#linebreak() 

_† O acumulado assume Espírito 3. Um mago de Espírito 1 chega ao Imperador com 96 PM; um de Espírito 6 chega com 126._
]

A Água é a escola que mais expande reservas de mana no jogo, e a que menos dá vida. Com essa curva, um Imperador de Água consegue lançar _Zero Absoluto_ (20 PM) cinco vezes por dia — ou uma vez e ainda sustentar um combate inteiro. É esse número que faz o rank *parecer* Imperador na mesa.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Principiante (Água)

_"Qualquer um com mana consegue molhar um inimigo. A questão é o que você faz depois."_

#quadro(titulo: [◈ Maestria: Afinidade Aquática])[
A água deixou de ser um elemento estranho e virou uma extensão da sua mão. Você pode criar, mover, aquecer levemente ou evaporar até *20 litros* de água limpa por minuto, sem gastar PM e sem gastar Ação.

Não serve para causar dano, mas serve para todo o resto: encher cantis no deserto, tomar banho, apagar uma fogueira, limpar um ferimento, dar de beber a um cavalo moribundo. *É por isso que magos de água nunca passam sede numa caravana* — e é por isso que eles são bem-vindos em qualquer expedição, mesmo os fracos.
]
]

#block(sticky: true)[*Feitiços Principiantes*]

#block(breakable: false)[
*_Bola de Água_* — _1 PA | 1 PM | Alcance 18m_
Uma esfera de água comprimida do tamanho de um punho fechado se condensa na palma da sua mão, girando e chiando de pressão, e dispara como uma pedrada. É a primeira magia que qualquer criança de Seis Faces aprende, e a que muito aventureiro veterano ainda usa — porque é barata, é rápida e derruba gente de escada.
- *Efeito:* Ataque mágico à distância. O alvo é empurrado 1,5m e fica _Molhado_.
- *Dano:* *1d6 + BC* (contundente).
- _Encantamento:_ _"Que a grande proteção da água esteja no lugar que buscas. Eu clamo por um riacho refrescante e borbulhante aqui e agora. Bola de Água!"_
]

#block(breakable: false)[
*_◆ Flecha de Água_* — _2 PA | 1 PM | Alcance 27m_
A água se alonga e enrijece numa haste fina e afiada, girando sobre o próprio eixo como um dardo, e corta o ar com um assobio agudo. É o feitiço que aparece nos registros da Guilda quando escrevem "mago de água" na sua carteira. Barata o bastante para ser lançada o dia inteiro, precisa o bastante para matar.
- *Efeito:* Ataque mágico à distância. Se acertar, o alvo fica _Molhado_.
- *Dano:* *1d8 + BC* (perfurante).
- _Encantamento:_ _"Água que flui, tome a forma perfurante da caçada e atinja meu inimigo. Flecha de Água!"_
]

#block(breakable: false)[
*_Impacto de Gelo_* — _1 PA | 2 PM | Alcance 18m_
Um bloco irregular de gelo bruto se forma no ar e despenca sobre o alvo, estilhaçando-se no impacto e cobrindo o chão de cacos cortantes. Sozinha é medíocre. Contra alguém que você acabou de encharcar, é o que transforma um combate numa execução.
- *Efeito:* Teste de Resistência de *Agilidade* (CD 8 + BC). Falha: deslocamento reduzido em 3m até o fim do próximo turno.
- *Dano:* *1d4* contundente + *1d6* de frio. _(O frio dobra contra alvo Molhado.)_
- _Encantamento:_ _"Coloco diante de ti um berço de gelo como desejas, agora libere tuas correntes glaciais. Impacto de Gelo!"_
]

#block(breakable: false)[
*_Lâmina de Gelo_* — _1 PA | 1 PM | Toque_
O ar úmido ao redor do seu antebraço congela em camadas sobrepostas até formar uma lâmina translúcida e irregular, colada à sua mão. Ela lasca a cada golpe e derrete devagar. Não é uma espada de verdade — mas é uma espada, e é de graça.
- *Efeito:* Cria uma arma de gelo por 1 minuto. Ataques com ela usam *Força ou Intelecto*, sua escolha.
- *Dano:* *1d8 + BC* (cortante) + *1d4* de frio.
- _Encantamento:_ _"Frio cortante do inverno, esculpa a arma que ceifará os meus inimigos. Lâmina de Gelo!"_
]

#block(breakable: false)[
*_Escudo de Água_* — _1 PA | 2 PM | Alcance 6m_
Uma cortina vertical de água em movimento constante se ergue do chão, opaca e pesada, distorcendo tudo o que está do outro lado. Flechas perdem força ao atravessá-la. Fogo morre nela.
- *Efeito:* Barreira de 3m de largura por 2 turnos. Aliados atrás recebem *Cobertura Superior (+5 CA)* contra ataques físicos e projéteis. Dano ígneo que a atravessa é reduzido à metade.
- _Encantamento:_ _"Espírito das correntes, erga-se da terra e forme a muralha que me protege do calor. Escudo de Água!"_
]

#block(breakable: false)[
*_Névoa Densa_* — _1 PA | 1 PM | Esfera de 6m_
Você derruba a temperatura de um ponto do ar e a umidade condensa instantaneamente numa parede branca e sufocante. Magos de água são péssimos em combate corpo a corpo — esta magia existe para que eles não precisem estar lá.
- *Efeito:* Área fortemente obscurecida por 5 minutos. Criaturas dentro ficam efetivamente cegas. Vento forte dissipa em 1 turno.
- _Encantamento:_ _"Respiração fria da manhã, roube deles a visão do mundo. Névoa Densa!"_
]

#block(sticky: true)[*Talentos Principiantes* — _1 PA cada_]

- *Condutor de Gelo:* magias de gelo contra alvos _Molhados_ impõem *Desvantagem* no teste de resistência.
- *Nascente de Mana:* *+2 PM por patamar seu em Água*. Comprável várias vezes, até o número de patamares.
- *Mão Firme:* você não sofre Desvantagem ao conjurar com um inimigo adjacente a você.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Intermediário (Água)

_O ponto onde o mago deixa de atirar em uma pessoa e passa a atirar em uma formação._

#quadro(titulo: [◈ Maestria: Cântico Fluido])[
Você recitou os versos básicos tantas mil vezes que sua boca os conhece melhor que sua cabeça. Suas magias de *Rank Principiante* não sofrem mais penalidade alguma na versão Encurtada — dano cheio, área cheia.

Você também deixa de tropeçar: falhas críticas em magias de Principiante não explodem na sua mão, apenas falham em silêncio.
]
]

#block(sticky: true)[*Feitiços Intermediários*]

#block(breakable: false)[
*_Canhão de Água_* — _1 PA | 3 PM | Linha de 18m × 1,5m_
Um jato contínuo de água em altíssima pressão explode do seu cajado com força suficiente para arrancar cavaleiros da sela e arrastá-los pela lama. O som é o de uma cachoeira comprimida dentro de um cano.
- *Efeito:* Teste de Resistência de *Força* (CD 8 + BC). Falha: empurradas 4,5m e ficam _Molhadas_. Sucesso: metade do dano, mas ficam _Molhadas_ mesmo assim.
- *Dano:* *3d6 + BC* (contundente).
- _Encantamento:_ _"Flexível espírito da água... varra todas as coisas com seu poder oculto. Canhão de Água!"_
]

#block(breakable: false)[
*_◆ Lança de Gelo_* — _2 PA | 3 PM | Alcance 27m_
Não é um bloco atirado: é uma lança de verdade, com dois metros, ponta cônica polida e um eixo em espiral que a faz girar como uma bala rifleada. Este é o feitiço que consagra um mago Intermediário — a primeira magia da escola capaz de matar um homem de armadura em um único acerto.
- *Efeito:* Ataque mágico à distância. Se acertar, o alvo fica _Molhado_ pelo degelo do impacto.
- *Dano:* *2d8 + BC* (perfurante) + *1d8* de frio. _(O frio dobra contra alvo Molhado.)_
- _Encantamento:_ _"Águas eternas, condensem-se na haste que perfura a armadura e o osso. Lança de Gelo!"_
]

#block(breakable: false)[
*_Pilar de Gelo_* — _1 PA | 3 PM | Alcance 18m_
A umidade do subsolo é arrancada para cima de uma vez só, erguendo uma coluna de gelo turvo com veios de terra congelada por dentro. Serve para ferir, para bloquear um corredor, ou para tirar alguém de cima de você.
- *Efeito:* Coluna de 1,5m de raio e 3m de altura. Criatura no ponto faz Teste de *Agilidade* (CD 8 + BC): falha = sofre o dano e é arremessada ao topo (queda de 3m se descer). O pilar dura 10 minutos e concede *Cobertura Superior*.
- *Dano:* *2d6 + BC* (contundente).
- _Encantamento:_ _"Águas adormecidas sob a terra, congelem e ergam-se subitamente para os céus. Pilar de Gelo!"_
]

#block(breakable: false)[
*_Respingos de Água_* — _1 PA | 2 PM | Esfera de 9m de raio_
Uma chuva curta, densa e sem trovão cai sobre uma área precisa, como se alguém tivesse virado um balde do céu. Não machuca ninguém. *É a magia mais importante da escola.*
- *Efeito:* Sem dano. Toda criatura na área fica _Molhada_, *sem teste de resistência*. O chão vira terreno difícil por 1 minuto.
- _Encantamento:_ _"Espalhe as gotas que caem, cubra o mundo em água. Respingos de Água!"_
]

#block(breakable: false)[
*_Enxurrada_* — _1 PA | 3 PM | Cone de 9m_
Uma parede de água suja e revolta varre o terreno à sua frente, levando pedras, poeira e pessoas junto. É a magia dos magos que lutam em desfiladeiros e portões.
- *Efeito:* Teste de Resistência de *Força* (CD 8 + BC). Falha: empurrão de 4,5m, ficam _Caídas_ e _Molhadas_. Sucesso: metade do dano, ficam _Molhadas_.
- *Dano:* *2d6 + BC* (contundente).
- _Encantamento:_ _"Correnteza que arranca a montanha, desça sobre eles e leve tudo consigo. Enxurrada!"_
]

#block(sticky: true)[*Talentos Intermediários* — _1 PA cada_]

- *Fluidez Defensiva:* gastando *1 Ação* e 2 PM, você conjura água sob os pés e desliza 4,5m em qualquer direção sem provocar ataques de oportunidade.
- *Pressão Profunda:* magias que empurram agora empurram o dobro da distância. Colisão com parede ou obstáculo causa *+1d6* contundente.
- *Cristalização Rápida:* uma vez por combate, você aplica _Congelado_ a um alvo já _Molhado_ sem conjurar magia alguma — apenas *1 Ação* e 2 PM.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Avançado (Água)

_Menos de 1 em 40.000. A partir daqui, você não é um aventureiro com magia. Você é um ativo estratégico, e reis sabem o seu nome._

#quadro(titulo: [◈ Maestria: Termodinâmica Aplicada])[
Você compreendeu que água, gelo e vapor são a mesma coisa em temperaturas diferentes. Duas consequências:

- *Troca de Estado:* ao conjurar qualquer magia da escola, você pode trocar livremente o dano de _frio_ por _contundente_ (água pressurizada) ou por _ígneo_ (vapor superaquecido), sem alterar os dados. Um alvo imune a frio deixa de ser um muro para você.
- *Magia Combinada:* você desbloqueia o direito de aprender e executar Magias Combinadas (Capítulo 2). Este é o portão canônico.
]
]

#block(sticky: true)[*Feitiços Avançados*]

#block(breakable: false)[
*_Quebra de Gelo_* — _2 PA | 4 PM | Alcance 27m_
Uma estaca de gelo do tamanho de um tronco de árvore se materializa acima do seu ombro e é disparada como um aríete de cerco. Ela não perfura o alvo — ela o *atravessa* e continua, cravando-se na parede atrás. É a magia que se usa contra portões, ogros e cavalaria pesada.
- *Efeito:* Ataque mágico à distância. Contra objetos e estruturas, o dano é *dobrado*.
- *Dano:* *3d8 + BC* (perfurante) + *2d6* de frio. _(Frio dobra contra Molhado.)_
- _Encantamento:_ _"Magníficos espíritos da água, atinjam o insolente com sua majestosa espada de gelo e estilhacem sua alma! Quebra de Gelo!"_
]

#block(breakable: false)[
*_Corte de Gelo_* — _2 PA | 4 PM | Linha de 18m_
Um crescente de gelo comprimido, fino como uma folha de papel e afiado como uma navalha cirúrgica, desliza pelo chão a uma velocidade absurda e corta na altura da cintura tudo o que estiver na trajetória.
- *Efeito:* Teste de Resistência de *Agilidade* (CD 8 + BC) para *cada* criatura na linha. Falha: dano cheio. Sucesso: metade.
- *Dano:* *3d8 + BC* (cortante) + *1d6* de frio.
- _Encantamento:_ _"Frio implacável, tome a forma da execução perfeita! Eu a convoco para abater e fatiar o meu inimigo! Corte de Gelo!"_
]

#block(breakable: false)[
*_Campo de Gelo_* — _2 PA | 4 PM | Esfera de 9m de raio_
Uma geada branca e violenta se alastra pelo chão a partir do ponto escolhido, subindo pelas botas, pelas pernas, pelas armas. O ar dentro da área fica seco e doloroso de respirar.
- *Efeito:* Teste de Resistência de *Vigor* (CD 8 + BC). Falha: deslocamento reduzido a 0 até o fim do próximo turno. _(Alvos Molhados que falharem ficam Congelados.)_
- *Dano:* *2d8* de frio. _(Dobra contra Molhado — este é o núcleo do combo da escola.)_
- _Encantamento:_ _"Deusa Azul que desce dos céus, empunhe seu cajado e cubra este mundo maldito em geada! Campo de Gelo!"_
]

#block(breakable: false)[
*_◆ Nevasca_* — _3 PA | 5 PM | Explosão de 9m centrada em você_
Você deixa de mirar. Estilhaços de gelo do tamanho de facas irrompem do seu corpo em todas as direções, numa esfera crescente de vento branco e ruído. É a magia de um mago que foi cercado e decidiu que a distância deixou de ser uma opção — e é o feitiço que os magos Avançados são chamados para lançar quando uma horda cerca uma caravana.
- *Efeito:* Teste de Resistência de *Agilidade* (CD 8 + BC). Falha: dano cheio e arremessadas 3m para trás. Sucesso: metade e não são empurradas. *Você não é afetado.*
- *Dano:* *2d6* perfurante + *3d6* de frio *+ BC*. _(Frio dobra contra Molhado.)_
- _Encantamento:_ _"Soberano envolto em branco absoluto, cujo frio glacial rouba todo o calor. Congele aqueles que ousam se aproximar! Nevasca!"_
]

#block(breakable: false)[
*_Tempestade_* — _2 PA | 5 PM | Raio de 1 km_
O céu escurece em minutos. Não é uma nuvem: é uma frente inteira sendo puxada para cima da região. Chove por uma hora sem parar. Esta magia não mata ninguém — ela *prepara o campo de batalha inteiro* para tudo o que você vai lançar depois.
- *Efeito:* Chuva pesada por 1 hora. Todos os expostos, aliados e inimigos, mantêm _Molhado_ permanentemente enquanto estiverem sob ela. Visibilidade reduzida à metade. Fogueiras e magias de fogo de rank Intermediário ou inferior não funcionam ao ar livre.
- _Encantamento:_ _"Nuvens carregadas que viajam pelos ventos uivantes, derramem suas lágrimas sobre esta terra árida e lavem o mundo! Tempestade!"_
]

#block(breakable: false)[
*_Fortaleza de Gelo_* — _2 PA | 5 PM | Alcance 9m_
Um domo de gelo translúcido de meio metro de espessura se ergue do chão com um estalo seco, azulado e opaco na base, quase transparente no topo. É a defesa suprema da escola e a razão pela qual magos de água acompanham exércitos.
- *Efeito:* Muralha ou domo com *80 PV* (Cobertura Total). Se conjurada como Reação em Conjuração Silenciosa, surge às pressas com apenas *30 PV*. Dura 10 minutos ou até ser destruída.
- _Encantamento:_ _"Guardião das geleiras eternas, erga-se das profundezas e torne-se o escudo intransponível que protegerá minha vida. Fortaleza de Gelo!"_
]

#block(sticky: true)[*Talentos Avançados* — _2 PA cada_]

- *Zero Perfurante:* seu gelo ignora _Resistência_ a dano de frio.
- *Mestre da Adaptação:* suas magias Encurtadas de Água não perdem mais dados de dano, apenas a redução de área.
- *Núcleo Gélido:* você é imune a dano de frio não-mágico e não sofre penalidades de clima gelado. Você dorme na neve sem cobertor.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Santo (Água)

_Feitiços que aparecem em relatórios militares e mudam a geografia de uma região por um dia._

#quadro(titulo: [◈ Maestria: Domínio Climático])[
O céu passou a te obedecer. Você se torna *imune* aos danos e efeitos colaterais das suas próprias magias de área e de clima, e pode poupar dos efeitos um número de aliados igual ao seu *Espírito*.

Além disso, você enxerga perfeitamente através de chuva torrencial, névoa e nevasca — sua ou de outros — e pode manter *uma* magia de clima ativa sem gastar concentração nem ações.
]
]

#block(sticky: true)[*Feitiços Santos*]

#block(breakable: false)[
*_◆ Cumulonimbus_* — _4 PA | 10 PM | Raio de 1,5 km | Ritual (não pode ser encurtada)_
Você não conjura uma nuvem. Você *força a atmosfe ra* a formar uma, empilhando massas de ar úmido até que uma torre negra de dez quilômetros de altura se erga sobre o campo de batalha, com o interior piscando em laranja. Rudeus atingiu o rank Santo aos cinco anos ao invocar isto por acidente, e Roxy quase teve um colapso ao ver.
- *Efeito:* A nuvem paira por 1 minuto (10 turnos). Todos na área ficam _Molhados_ incondicionalmente enquanto ela existir. Enquanto ativa, você pode gastar *1 Ação e 2 PM* para castigar um alvo visível com um relâmpago: Teste de *Agilidade* (CD 8 + BC) ou sofre *4d10* de dano elétrico — metade se passar.
- _Encantamento:_ _"Grande espírito da água e príncipe imperial do relâmpago que ascende aos céus! Conceda meu desejo e traga uma bênção selvagem. Provoque pavor com um golpe de seu martelo divino na bigorna, e cubra a terra com desespero! Varra todo o resto e expulse tudo! Cumulonimbus!"_
]

#block(breakable: false)[
*_Prisão de Gelo Eterno_* — _3 PA | 8 PM | Alcance 18m_
O gelo não cresce em direção ao alvo. Ele cresce *de dentro dele*, cristalizando a umidade dos pulmões e do sangue para fora, até que a criatura esteja selada dentro de um bloco azul-escuro com a expressão intacta.
- *Efeito:* Alvo único faz Teste de Resistência de *Vigor* (CD 8 + BC), com *Desvantagem* se estiver _Molhado_. Falha: fica *Paralisado em animação suspensa* por até 1 hora, imune a dano durante o período. Cada dano ígneo aplicado ao bloco concede um novo teste.
- *Dano:* *4d8* de frio ao falhar. _(Dobra contra Molhado.)_
- _Uso comum:_ capturar criminosos vivos, ou preservar um aliado moribundo até chegar um mago de Cura.
- _Encantamento:_ _"Coração parado do inverno profundo, tome esta alma e guarde-a onde o tempo não alcança. Prisão de Gelo Eterno!"_
]

#block(breakable: false)[
*_Maremoto_* — _3 PA | 9 PM | Linha de 45m × 9m_
Você reúne toda a água disponível num raio absurdo — chuva, rio, poços, umidade do ar — e a lança como uma parede de seis metros de altura que arrasta cavalaria inteira.
- *Efeito:* Teste de Resistência de *Força* (CD 8 + BC). Falha: dano cheio, arrastadas 9m, ficam _Caídas_ e _Molhadas_. Sucesso: metade, não são arrastadas. Estruturas de madeira na área sofrem dano dobrado.
- *Dano:* *6d6 + BC* (contundente).
- _Encantamento:_ _"Mar que engoliu continentes antes que houvesse nomes, lembre-se do que você é e venha reivindicar esta terra! Maremoto!"_
]

#block(sticky: true)[*Talento Santo* — _3 PA_]

- *Olho da Tempestade:* você pode manter *duas* magias de clima simultaneamente, e o custo em PM de qualquer magia de clima da escola é reduzido à metade.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Rei (Água)

_Existem menos de vinte pessoas vivas neste patamar somando todas as escolas. Você é uma peça de política internacional._

#quadro(titulo: [◈ Maestria: Condutividade])[
Você entendeu a verdade que separa mestres de lendas: *água não é uma arma, é um cabo*. A escola de Água passa a incluir o elemento *Eletricidade*.

Todo dano elétrico que você causar a um alvo _Molhado_ impõe *Desvantagem* no teste de resistência dele. Se ele tirar 5 ou menos no dado, a corrente atravessa o sistema nervoso e ele fica *Atordoado* por 1 turno.
]
]

#block(sticky: true)[*Feitiços Reais*]

#block(breakable: false)[
*_◆ Relâmpago_* — _5 PA | 12 PM | Alcance ilimitado (linha de visão)_
Você não invoca o raio. Você *drena* a carga acumulada da tempestade acima, canaliza pelo próprio corpo — o que mataria qualquer um abaixo do rank Rei — e a expele pela ponta do cajado num feixe branco e perfeitamente reto que não faz curva. O trovão chega depois.
- *Pré-requisito:* _Cumulonimbus_ ativa no céu acima de você.
- *Efeito:* Ignora qualquer bônus de CA concedido por *Aura de Batalha (Touki)*. Contra alvo em armadura metálica, o acerto é *Crítico automático*. Contra alvo _Molhado_, o dano é dobrado (Vulnerabilidade).
- *Dano:* *8d10 + BC* (elétrico).
- _Encantamento:_ _"Oh espíritos das águas magníficas, eu imploro ao Príncipe do Trovão! Que o medo atinja o coração dos homens. Deixe seu poder radiante ensinar a este inimigo insolente que o Imperador ainda reina supremo! Relâmpago!"_
]

#block(breakable: false)[
*_Era Glacial_* — _4 PA | 14 PM | Esfera de 30m_
A temperatura da região despenca abaixo de qualquer inverno natural. Rios param no meio do movimento. O solo racha com o som de ossos quebrando. É a magia que se usa para negar um território inteiro ao inimigo por um dia.
- *Efeito:* A área vira terreno congelado por 24 horas. Toda criatura hostil que começar o turno dentro sofre *3d10* de frio (sem teste) e tem o deslocamento reduzido à metade. Corpos d'água na área congelam sólidos e viram terreno transitável.
- _Encantamento:_ _"Estação que não pede permissão, desça sobre esta terra e cubra o que os homens construíram. Que o verde lembre do branco. Era Glacial!"_
]

#block(sticky: true)[*Talento Rei* — _3 PA_]

- *Soberania Elétrica:* o Atordoamento causado pela sua Maestria _Condutividade_ passa a durar *2 turnos* e se estende a todas as criaturas adjacentes ao alvo original.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Imperador (Água)

_Sete pessoas. O mundo tem sete pessoas neste nível, somando todas as escolas e todos os estilos de espada._

#quadro(titulo: [◈ Maestria: O Silêncio Primordial])[
Seu frio não é mais temperatura baixa. É a *ausência* de calor — e a ausência não pode ser resistida.

- Seu dano de frio ignora completamente *Resistência e Imunidade* a frio.
- Criaturas reduzidas a 0 PV pelas suas magias de gelo cristalizam em pó de diamante. Não podem ser ressuscitadas por nada abaixo de magia de rank Deus.
- Uma vez por turno, você pode conjurar uma magia de Água de rank *Avançado ou inferior* em Conjuração Silenciosa *sem gastar Ação alguma*. Você respira gelo.
]
]

#block(sticky: true)[*Feitiços Imperiais*]

#block(breakable: false)[
*_◆ Zero Absoluto_* — _6 PA | 20 PM | Esfera de 45m | Ritual (6 Ações, não pode ser encurtada)_
Você não esfria o ar. Você *remove o calor da existência* dentro de um volume definido, parando o movimento das próprias moléculas. O som morre antes do frio chegar, porque não há mais ar suficiente vibrando para carregá-lo. Rudeus criou esta magia por acidente, tentando conjurar Nova Congelante com desespero demais.
- *Efeito:* Teste de Resistência de *Vigor* com *Desvantagem Absoluta*. Seus aliados são isolados magicamente e não sofrem efeito algum. Criaturas reduzidas a 0 PV são *eternamente petrificadas* numa estátua de gelo negro indestrutível — não há ressurreição, não há cura, não há corpo.
- *Dano:* *12d12* de frio. *Contra alvo _Molhado_: 24d12.*
- _Encantamento:_ _"Silêncio primordial, onde até o próprio tempo congela e toda a chama cessa. Que o mundo retorne de imediato ao abraço frio da eternidade implacável e o conceito de calor deixe de existir. Zero Absoluto!"_
]

#block(breakable: false)[
*_Dilúvio_* — _5 PA | 18 PM | Raio de 3 km | Ritual (6 Ações)_
Chuva por três dias sem intervalo. Rios saem do leito. Estradas viram lama intransponível. Cercos são levantados porque o acampamento sitiante deixou de existir. Esta magia não tem dano listado porque o dano dela não se mede em dados — se mede em *logística destruída*.
- *Efeito:* Efeito narrativo de escala regional, ditado pelo Mestre. Mecanicamente: todos na área permanecem _Molhados_ por 3 dias, todo terreno vira difícil, magia de fogo de rank Santo ou inferior falha automaticamente ao ar livre, e qualquer exército em campo aberto perde suprimentos.
- _Encantamento:_ _"Céus que testemunharam a queda de três mundos, lembrem-se de como se limpa uma face. Abram-se, e não parem. Dilúvio!"_
]

#block(sticky: true)[*Talento Imperador* — _4 PA_]

- *Essência do Inverno:* seu dano de frio passa a ignorar também *Invulnerabilidade* e efeitos de proteção mágica de rank inferior ao seu. Além disso, uma vez por Descanso Longo, você pode conjurar _Zero Absoluto_ pagando metade do PM.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Água)

_Narrativo. Não se compra._

#quadro(titulo: [◈ O Mar Que Obedece])[
O patamar Divino da Magia de Água não lança uma magia maior. Ele remove a pergunta "onde a água está" da equação — porque a resposta passa a ser *"onde eu quiser."*

Um mago neste patamar já foi registrado secando um porto inteiro numa única noite, sem deixar um peixe vivo, e enchendo-o de volta na manhã seguinte só para provar que podia. Rios mudam de curso a um gesto. Um cerco naval termina antes de começar, porque o mar debaixo da frota simplesmente deixa de existir por tempo suficiente.

Não é uma magia de dano. É a autoridade final sobre um elemento inteiro, e nenhum exército planeja uma campanha perto da costa sem primeiro descobrir se esse mago está vivo.

Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o tipo de evento que reescreve mapas, e o mundo deve mudar por causa disso.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Magia de Fogo

A escola de Água pergunta onde a luta acontece. A de Fogo não pergunta nada.
]

É a escola do *dano bruto e da consequência*, e a única do livro que destrói o que estava em volta. Fogo não desliga quando você para de conjurar: ele fica, se espalha, come a floresta, come o celeiro, come o cadáver com o item que vocês queriam. Magos de Fogo são contratados para vencer batalhas e são expulsos de cidades depois.

Se a Água é a escola que os exércitos amam, o Fogo é a que os exércitos usam quando já perderam o resto.

#quadro(titulo: [O Preço do Elemento])[
Toda magia de Fogo de rank *Intermediário ou superior* conjurada em ambiente fechado, floresta, navio, celeiro ou qualquer lugar com material inflamável *incendeia o cenário*. O Mestre é encorajado a nunca deixar isso barato: metade das coisas que o grupo ia saquear já não existe mais.

Isso não é uma punição. É a identidade da escola. Você escolheu o elemento que resolve o problema apagando o lugar onde ele estava.
]

#block(breakable: false)[
==== As Condições da Escola

#quadro(titulo: [Em Chamas])[
Toda magia de Fogo que causar dano ígneo aplica esta condição. O alvo sofre *1d6 de dano ígneo no início de cada turno dele* e ilumina tudo num raio de 3m.

Encerra quando: alguém gasta *1 Ação* para abafar; o alvo sofre dano de frio ou fica _Molhado_; ou o alvo se joga na água.

*Propagação:* se um alvo _Em Chamas_ terminar o turno adjacente a outra criatura ou a material inflamável, aquilo também pega fogo.
]
]

#quadro(titulo: [O Combo Elemental])[
- *Explosão contra Em Chamas:* os *dados de dano de explosão são dobrados*. Fogo aceso é combustível já pronto — é só comprimir.
- *Fogo contra Molhado:* a água evapora, a condição _Molhado_ some, e o alvo sofre *+2 de dano* pelo choque térmico. Você desliga o combo inteiro do mago de Água em um golpe, e é exatamente por isso que Fogo e Água nunca se dão bem na mesma mesa.
]

==== Progressão de PV e PM do Fogo

#largo-inline[
#tbl(2, (left, center),
  [Rank alcançado], [PV ganho],
  [Principiante], [1d4 + 1],
  [Intermediário], [1d4 + 1],
  [Avançado], [1d6 + 2],
  [Santo], [1d6 + 2],
  [Rei], [1d8 + 3],
  [Imperador], [1d8 + 3],
)

#linebreak()
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Principiante (Fogo)

#quadro(titulo: [◈ Maestria: Chama Viva])[
Você acende, apaga, aquece e controla qualquer chama já existente a até 9 metros, sem gastar PM e sem gastar Ação. Acender uma fogueira na chuva, apagar uma tocha na mão de um guarda, manter um forno na temperatura exata, cauterizar um corte, derreter uma fechadura barata.

Você também é *imune a dano ígneo não-mágico* e não sofre penalidade de calor extremo. O deserto de Begaritt é passeio para você.
]
]

#block(sticky: true)[*Feitiços Principiantes*]

#block(breakable: false)[
*_◆ Bola de Fogo_* — _2 PA | 1 PM | Alcance 18m_
A magia mais comum do mundo. Toda vila que tem um mago tem alguém que sabe fazer isto, e é por isso que ninguém se impressiona — até ver o que ela faz com um celeiro.
- *Efeito:* ataque mágico à distância. Se acertar, o alvo fica _Em Chamas_.
- *Dano:* *1d8 + BC* (ígneo).
- _Encantamento:_ _"Chama que dorme na pedra e na madeira, acorde na minha mão e vá até ele. Bola de Fogo!"_
]

#block(breakable: false)[
*_Fagulha_* — _1 PA | 1 PM | Alcance 9m_
- *Efeito:* sem dano direto. Um ponto de calor concentrado acende qualquer coisa inflamável que você consiga ver — óleo derramado, palha, roupa seca, uma trilha de pólvora, o chão que o Ladino encharcou de óleo cinco minutos atrás.
]

#block(breakable: false)[
*_Toque Escaldante_* — _1 PA | 2 PM | Toque_
- *Efeito:* ataque corpo a corpo mágico. *2d6 + BC* de dano ígneo, e o alvo fica _Em Chamas_. Se você estiver com metade ou menos dos PV, causa +1d6.
]

#block(breakable: false)[
*_Muro de Chamas_* — _1 PA | 3 PM | Linha de 9m_
- *Efeito:* uma parede de fogo de 3m de altura por 1 minuto. Atravessá-la custa *3d6* de dano ígneo e aplica _Em Chamas_. Bloqueia visão e faz criaturas animais recusarem passagem.
]

#block(breakable: false)[
*_Clarão_* — _1 PA | 1 PM | Esfera de 6m_
- *Efeito:* teste de Resistência de *Vigor* (CD 8 + BC) ou o alvo fica *Cego* até o fim do próximo turno dele. Não causa dano e não incendeia nada — é a única magia da escola que não deixa cicatriz.
]

#block(sticky: true)[*Talentos Principiantes* — _1 PA cada_]

- *Pavio Curto:* magias de Fogo suas que aplicam _Em Chamas_ causam *+2 de dano* contra alvos que já estejam _Em Chamas_.
- *Fôlego de Forja:* *+2 PM por patamar seu nesta árvore*. Comprável várias vezes, até o número de patamares.
- *Mãos de Ferreiro:* você trabalha metal, vidro e cerâmica sem forja, usando as próprias mãos. Um mago de Fogo nunca passa fome numa cidade grande.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Intermediário (Fogo)

#quadro(titulo: [◈ Maestria: Propagação])[
O seu fogo tem vontade própria.

- A condição _Em Chamas_ aplicada por você causa *1d8* em vez de 1d6.
- Uma vez por turno, sem gastar Ação, você pode fazer o fogo de um alvo _Em Chamas_ *saltar* para outra criatura a até 3 metros dele. A nova criatura faz teste de Agilidade (CD 8 + BC) ou também fica _Em Chamas_.
]
]

#block(sticky: true)[*Feitiços Intermediários*]

#block(breakable: false)[
*_◆ Lança de Fogo_* — _2 PA | 3 PM | Alcance 27m_
Fogo comprimido até parar de ser fogo e virar uma haste branca que assobia. Não incendeia: *perfura*, e sela a ferida no caminho.
- *Efeito:* ataque mágico à distância. Ignora Resistência a dano ígneo.
- *Dano:* *3d8 + BC* (ígneo). Contra alvo _Em Chamas_, +2d8.
- _Encantamento:_ _"Calor branco que não conhece fumaça, tome a forma da lança e atravesse. Lança de Fogo!"_
]

#block(breakable: false)[
*_Explosão_* — _1 PA | 4 PM | Esfera de 6m_
- *Efeito:* teste de Resistência de *Agilidade* (CD 8 + BC), metade se passar. Criaturas que falharem são arremessadas 3m.
- *Dano:* *3d6 + BC* de dano de *explosão*. _(Dobra os dados contra alvos Em Chamas — este é o núcleo do combo da escola.)_
]

#block(breakable: false)[
*_Chuva de Brasas_* — _1 PA | 3 PM | Esfera de 9m de raio_
- *Efeito:* sem dano imediato. Toda criatura na área faz teste de Agilidade (CD 8 + BC) ou fica _Em Chamas_. Todo material inflamável na área acende. O chão vira terreno difícil por brasa acesa durante 1 minuto.
]

#block(breakable: false)[
*_Sopro_* — _1 PA | 3 PM | Cone de 9m_
- *Efeito:* *2d10 + BC* de dano ígneo, teste de Agilidade para metade. Aplica _Em Chamas_ a quem falhar.
]

#block(sticky: true)[*Talentos Intermediários* — _1 PA cada_]

- *Calor Dirigido:* você escolhe até *Intelecto* criaturas na área das suas magias de Fogo. Elas não são afetadas. _(Sim, isto salva o grupo. Compre no primeiro dia.)_
- *Combustão Lenta:* _Em Chamas_ aplicada por você não pode ser apagada gastando Ação — só com água, frio ou submersão.
- *Nada Sobra:* suas magias causam *dano dobrado contra objetos, estruturas, cordas, portas e barreiras não-mágicas*.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Avançado (Fogo)

#quadro(titulo: [◈ Maestria: Termodinâmica Inversa])[
- Você passa a *controlar a temperatura* dentro das suas áreas: pode escolher que o fogo não queime aliados, não danifique objetos específicos, ou queime *apenas* um material escolhido — a corda, e não a mão que a segura.
- *Magia Combinada:* você desbloqueia o direito de combinar escolas (Capítulo 2). Fogo + Vento é a mais perigosa do mundo — e a mais fácil de errar.
]
]

#block(sticky: true)[*Feitiços Avançados*]

#block(breakable: false)[
*_◆ Tempestade de Fogo_* — _3 PA | 6 PM | Esfera de 12m de raio_
O ar dentro da área deixa de ser ar. Vira uma coluna girando sobre si mesma que puxa oxigênio de fora para dentro e sobe.
- *Efeito:* teste de *Agilidade* (CD 8 + BC), metade se passar. Todos que falharem ficam _Em Chamas_. A área continua queimando por 1 minuto: quem começar o turno dentro sofre *2d6* adicionais.
- *Dano:* *6d6 + BC* (ígneo).
- _Encantamento:_ _"Vento que alimenta e chama que devora, girem juntos até que não reste ar nem nome neste lugar. Tempestade de Fogo!"_
]

#block(breakable: false)[
*_Coluna Solar_* — _2 PA | 5 PM | Alcance 45m_
- *Efeito:* um pilar de fogo de 3m de raio desce do céu sobre um ponto visível. *5d8 + BC* de dano ígneo, teste de Agilidade para metade, _Em Chamas_ automático em quem falhar. Ignora Cobertura que não seja um teto sólido.
]

#block(breakable: false)[
*_Vapor Seco_* — _2 PA | 4 PM | Esfera de 9m_
_(Requer 1 patamar em Vento, ou um aliado mago de Vento conjurando junto.)_ Ar superaquecido sem chama visível. Não queima a pele: *queima o pulmão*.
- *Efeito:* teste de *Vigor* (CD 8 + BC). Quem falhar sofre *4d8* de dano ígneo, não consegue falar nem recitar cânticos por 2 turnos, e fica _Em Chamas_ por dentro — a condição não pode ser abafada com 1 Ação.
]

#block(breakable: false)[
*_Escudo de Cinzas_* — _2 PA | 4 PM | Pessoal_
- *Efeito:* por 1 minuto, qualquer criatura que te atingir corpo a corpo sofre *2d6* de dano ígneo e fica _Em Chamas_. Você recebe *Resistência a dano físico de armas mundanas* enquanto durar.
]

#block(sticky: true)[*Talentos Avançados* — _2 PA cada_]

- *Coração de Brasa:* você é imune a todo dano ígneo, mágico ou não, e a _Em Chamas_.
- *Detonação:* uma vez por turno, sem gastar Ação, você pode apagar a condição _Em Chamas_ de um alvo para causar imediatamente *3d8* de dano de explosão nele.
- *Cântico de Cinzas:* magias de Fogo de rank Intermediário ou inferior custam *1 PM a menos* (mínimo 1).

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Santo (Fogo)

#quadro(titulo: [◈ Maestria: Domínio da Combustão])[
- Suas magias de Fogo ignoram *Resistência* a dano ígneo e de explosão.
- Você pode conjurar qualquer magia de Fogo de rank *Avançado ou inferior* com *metade da área e o dobro do dano concentrado*, ou o inverso — o dobro da área pela metade do dano. Você escolhe no momento do disparo.
- Fogo aceso por você não se apaga sozinho enquanto você estiver consciente e quiser que ele continue.
]
]

#block(sticky: true)[*Feitiços Santos*]

#block(breakable: false)[
*_◆ Mar de Chamas_* — _4 PA | 12 PM | Raio de 60m | Ritual (não pode ser encurtada)_
Não é um feitiço apontado para alguém. Você acende *a região*. Tudo o que estava ali dentro deixa de existir na forma em que estava, e a quantidade de mana despejada decide o tamanho do estrago.
- *Efeito:* toda criatura na área faz teste de *Agilidade* com *Desvantagem* (CD 8 + BC). Falha: dano cheio e _Em Chamas_. Sucesso: metade. Aliados podem ser poupados pelo talento _Calor Dirigido_, e de nenhuma outra forma.
- *Dano:* *10d8 + BC* (ígneo). A área continua em chamas por 10 minutos.
- _Encantamento:_ _"Que o chão lembre do dia em que foi lava. Que o vento carregue o cheiro por três dias. Que nada aqui volte a ter nome. Mar de Chamas!"_
]

#block(breakable: false)[
*_Corpo de Fogo_* — _3 PA | 8 PM | Pessoal_
- *Efeito:* por 1 minuto, seu corpo vira chama. Você tem *Resistência a todo dano físico*, atravessa frestas e grades, ignora terreno difícil, e causa *3d6* de dano ígneo a quem te tocar. Você *não pode* usar itens, empunhar armas nem ser curado durante o efeito.
]

#block(sticky: true)[*Talento Santo* — _3 PA_]

- *Segunda Ignição:* uma vez por combate, quando você conjurar uma magia de Fogo de rank Avançado ou inferior, você a conjura *duas vezes*, pagando o PM uma vez só. O segundo disparo pode ter alvo diferente.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Rei (Fogo)

#quadro(titulo: [◈ Maestria: Plasma])[
A escola de Fogo destranca o seu elemento secundário, e ele não é fogo: é *o que existe depois do fogo*.

- Você passa a conjurar dano de *plasma*, que ignora *Resistência e Imunidade* a dano ígneo e derrete metal, pedra e Touki com igual indiferença.
- Dano de plasma seu *reduz permanentemente em 2 a CA* concedida por armadura não-mágica de qualquer criatura atingida, cumulativamente, até a armadura ser refeita por um ferreiro.
]
]

#block(sticky: true)[*Feitiços Reais*]

#block(breakable: false)[
*_◆ Flashover_* — _5 PA | 14 PM | Raio de 90m_
O ar sobre a região atinge a temperatura de ignição *ao mesmo tempo*, e tudo o que pode queimar queima de uma vez, sem chama viajando de um lugar a outro. Não há onda de fogo se aproximando. Simplesmente já é fogo.
- *Efeito:* toda criatura na área que *não* esteja submersa, dentro de barreira mágica ou sob magia de clima chuvoso faz teste de *Vigor* com *Desvantagem* (CD 8 + BC). Falha: dano cheio e _Em Chamas_ incombatível. Sucesso: metade.
- *Dano:* *12d10 + BC* (ígneo). Contra alvos já _Em Chamas_, os dados são de *d12*.
- _Encantamento:_ _"Não peço chama. Peço o instante em que tudo o que respira descobre que já estava queimando. Flashover!"_
]

#block(breakable: false)[
*_Lança de Plasma_* — _4 PA | 10 PM | Alcance 45m_
- *Efeito:* ataque mágico à distância. *8d8 + BC* de dano de plasma. Atravessa o alvo em linha reta e atinge tudo atrás dele por mais 15m com metade do dano. Estruturas de pedra e portões são perfurados de lado a lado.
]

#block(sticky: true)[*Talento Rei* — _3 PA_]

- *Ponto de Fusão:* seu dano de plasma passa a ignorar também barreiras mágicas com PV — ele fura, em vez de gastar. Uma _Fortaleza de Gelo_ de 80 PV não bloqueia nada, apenas evapora no ponto atingido.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Imperador (Fogo)

#quadro(titulo: [◈ Maestria: A Segunda Estrela])[
- Suas magias de Fogo e plasma *não podem ser aparadas, refletidas, absorvidas nem redirecionadas* por efeito algum de rank inferior ao seu.
- Criaturas reduzidas a 0 PV pelas suas magias são reduzidas a cinza. Não há corpo, não há equipamento, não há ressurreição abaixo de rank Deus.
- Uma vez por turno, você conjura uma magia de Fogo de rank *Avançado ou inferior* em Conjuração Silenciosa *sem gastar Ação*.
]
]

#block(sticky: true)[*Feitiços Imperiais*]

#block(breakable: false)[
*_◆ Sol Menor_* — _6 PA | 22 PM | Esfera de 30m | Ritual (6 Ações)_
Você comprime ar, calor e mana num ponto do tamanho de uma maçã e solta. O que acontece depois foi descrito por quem sobreviveu como _"o dia chegando de baixo para cima"_.
- *Efeito:* teste de *Vigor* com *Desvantagem Absoluta*. Aliados *não* são poupados automaticamente — apenas _Calor Dirigido_ e barreiras de rank Santo ou superior protegem alguém.
- *Dano:* *14d12* de dano de plasma. Contra alvos _Em Chamas_: *20d12*.
- Tudo na área — construções, terreno, cadáveres, água — deixa de existir. A cratera é permanente e ninguém planta nada ali por uma geração.
- _Encantamento:_ _"Eu não invoco o fogo. Eu junto tudo o que ele seria em mil anos e devolvo em um segundo. Que o céu abaixe até o chão. Sol Menor!"_
]

#block(breakable: false)[
*_Nunca Apaga_* — _5 PA | 16 PM | Raio de 1 km_
- *Efeito:* a região inteira pega fogo e *continua pegando fogo por três dias*, sem combustível, sem se importar com chuva de rank Santo ou inferior. Efeito narrativo de escala regional: rotas fecham, cercos são abandonados, cidades evacuam.
]

#block(sticky: true)[*Talento Imperador* — _4 PA_]

- *A Chama Que Escolhe:* você poupa automaticamente um número de criaturas igual ao seu *Espírito* em qualquer magia sua, incluindo o _Sol Menor_. É a diferença entre um desastre natural e uma arma.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Fogo)

_Narrativo. Não se compra._

#quadro(titulo: [◈ A Chama Sem Fim])[
Toda magia de Fogo deste livro, até o _Sol Menor_, ainda apaga — com tempo, com água suficiente, com rank Santo ou superior. O patamar Divino acende uma chama que não aceita nenhuma das duas coisas: uma vez ateada, ela queima *para sempre*, e ninguém — nem o próprio conjurador — sabe apagá-la de volta.

Existem, no Mundo de Seis Faces, três lugares assim: uma floresta que ardeu por uma geração inteira, uma cratera que ainda emite calor décadas depois, e uma cidade que ninguém reconstruiu, porque o chão continua incandescente.

É por isso que nenhuma escola trata este patamar como uma recompensa. Um mago de Fogo que alcança o Divino é, na prática, uma arma que a própria escola reza para nunca precisar usar.

Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É uma decisão que o Mestre e a mesa tomam juntos sabendo que ela pode custar uma região inteira do mapa.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Magia de Vento

Vento não manipula ar. *Vento manipula gases* — e isso é uma frase muito mais assustadora quando você percebe o que está dentro dos pulmões de alguém.
]

É a escola da *mobilidade e do corte*, e a única que resolve o problema estrutural de todo mago do livro: a distância. O mago de Água constrói muros para o espadachim não chegar. O mago de Vento simplesmente *não está mais ali*.

Em compensação, é a escola de menor dano bruto entre as quatro de ataque. Ela ganha lutas movendo pessoas — as suas e as dos outros.

#block(breakable: false)[
==== As Condições da Escola

#quadro(titulo: [Desequilibrado])[
Toda magia de Vento que empurre, puxe, derrube ou corte com pressão aplica esta condição até o fim do próximo turno do alvo.

*Efeitos:* Deslocamento reduzido à metade, *não pode usar mais de uma Reação por rodada*, e sofre Desvantagem em ataques de oportunidade.

A segunda linha é a mais importante do livro para quem enfrenta um Suishin-ryū: a torre de Reações dele desaba para uma só. Ela *não* o zera — uma versão anterior desta regra tirava todas as Reações, e isso significava que um mago de Vento Principiante desligava o estilo defensivo mais completo do livro com uma magia de 1 PM. Cortar de cinco para uma já resolve o problema sem apagar o personagem.
]
]

#quadro(titulo: [O Combo Elemental])[
- *Vácuo contra Desequilibrado:* dano cortante de Vento contra um alvo _Desequilibrado_ *crita em 19-20* e ignora metade da CA concedida por armadura. Quem perdeu o eixo do corpo não consegue apresentar o aço no ângulo certo.
- *Vento carrega tudo:* magias de área de *outras escolas* conjuradas dentro do alcance de uma magia de Vento sua ativa têm a *área aumentada em metade*. Fumaça, brasa, gelo, veneno — o vento não distingue e não devolve.
]

==== Progressão de PV e PM do Vento

#largo-inline[
#tbl(2, (left, center),
  [Rank alcançado], [PV ganho],
  [Principiante], [1d4 + 2],
  [Intermediário], [1d6 + 2],
  [Avançado], [1d6 + 2],
  [Santo], [1d6 + 3],
  [Rei], [1d8 + 3],
  [Imperador], [1d8 + 4],
)

#linebreak()
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Principiante (Vento)

#quadro(titulo: [◈ Maestria: Brisa])[
Controle constante e gratuito de ar num raio de 18 metros, sem PM e sem Ação: dispersar fumaça e névoa, carregar sua voz até alguém específico sem ninguém mais ouvir, secar roupa, encher uma vela de barco, apagar velas, virar páginas, segurar uma flecha de queda.

Você também *nunca sofre dano de queda* de até 15 metros, e desce devagar de qualquer altura.
]
]

#block(sticky: true)[*Feitiços Principiantes*]

#block(breakable: false)[
*_◆ Lâmina de Vento_* — _2 PA | 1 PM | Alcance 27m_
Uma faixa de ar comprimido, fina e invisível, que corta antes de qualquer um entender que houve um ataque. É a magia que aparece no registro da Guilda quando escrevem "mago de vento".
- *Efeito:* ataque mágico à distância. Se acertar, o alvo fica _Desequilibrado_.
- *Dano:* *1d10 + BC* (cortante).
- _Encantamento:_ _"Ar que passa por tudo sem pedir licença, tome fio e vá. Lâmina de Vento!"_
]

#block(breakable: false)[
*_Empurrão_* — _1 PA | 1 PM | Alcance 18m_
- *Efeito:* teste de *Força* (CD 8 + BC) ou o alvo é empurrado 6m na direção que você escolher e fica _Desequilibrado_. Sem dano — mas penhascos, fogueiras e o _Muro de Chamas_ do aliado existem.
]

#block(breakable: false)[
*_Passo de Vento_* — _1 PA | 2 PM | Pessoal_
- *Efeito:* 1 Ação. Você se desloca *18 metros* em qualquer direção, incluindo para cima, sem provocar ataques de oportunidade e ignorando terreno difícil. Se terminar no ar, você desce suavemente no fim do turno.
]

#block(breakable: false)[
*_Sopro de Poeira_* — _1 PA | 1 PM | Cone de 6m_
- *Efeito:* teste de *Vigor* (CD 8 + BC) ou o alvo fica *Cego* e _Desequilibrado_ até o fim do próximo turno dele. Sem dano.
]

#block(breakable: false)[
*_Vácuo Localizado_* — _1 PA | 2 PM | Alcance 9m_
- *Efeito:* você remove o ar ao redor da cabeça de um alvo. Ele *não consegue recitar cânticos, falar nem gritar* por 1 turno, e sofre *1d6* de dano. Contra criaturas que não respiram, não funciona.
]

#block(sticky: true)[*Talentos Principiantes* — _1 PA cada_]

- *Pés Leves:* +3 metros de Deslocamento, e você não deixa pegadas nem faz ruído ao andar.
- *Ouvido do Vento:* você escuta qualquer conversa a até 60 metros, desde que exista ar entre vocês. Vantagem em Percepção auditiva.
- *Reserva de Ar:* *+2 PM por patamar seu nesta árvore*. Comprável várias vezes, até o número de patamares.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Intermediário (Vento)

#quadro(titulo: [◈ Maestria: Sem Peso])[
- _Passo de Vento_ passa a custar *1 PM* e pode ser usado *uma vez por turno sem gastar Ação*.
- Você ignora completamente terreno difícil e não pode ser _Caído_ nem _Atolado_ enquanto estiver consciente.
- Ataques à distância mundanos contra você sofrem *Desvantagem* — o ar em volta do seu corpo desvia projéteis leves.
]
]

#block(sticky: true)[*Feitiços Intermediários*]

#block(breakable: false)[
*_◆ Estrondo Sônico_* — _2 PA | 3 PM | Linha de 27m_
_Sonic Boom._ Uma rajada comprimida disparada em linha reta, com pressão suficiente para arrancar um cavaleiro da sela e jogá-lo contra o próprio companheiro.
- *Efeito:* todas as criaturas na linha fazem teste de *Força* (CD 8 + BC). Falha: dano cheio, empurradas 9m e ficam _Desequilibradas_. Sucesso: metade.
- *Dano:* *3d8 + BC* (contundente).
- _Encantamento:_ _"Ar que se dobra até doer, endireite de uma vez e leve tudo o que estiver na frente. Estrondo Sônico!"_
]

#block(breakable: false)[
*_Foice de Vácuo_* — _1 PA | 3 PM | Alcance 36m_
- *Efeito:* ataque mágico à distância que *ignora Cobertura* (o corte faz a curva). *2d10 + BC* de dano cortante. _(Contra alvo Desequilibrado: crita em 19-20 e ignora metade da CA de armadura.)_
]

#block(breakable: false)[
*_Ciclone_* — _1 PA | 4 PM | Esfera de 9m de raio_
- *Efeito:* teste de *Força* (CD 8 + BC). Falha: *2d8 + BC* contundente, arremessadas 6m para longe do centro, _Desequilibradas_ e _Caídas_. A área fica com vento forte por 1 minuto: projéteis mundanos que a atravessarem erram automaticamente.
]

#block(breakable: false)[
*_Asas Emprestadas_* — _1 PA | 3 PM | Toque_
- *Efeito:* por 10 minutos, o alvo recebe *Deslocamento de Voo* igual ao dobro do deslocamento dele. Se o efeito acabar no ar, ele desce suavemente. Você pode manter isto em um aliado por vez.
]

#block(sticky: true)[*Talentos Intermediários* — _1 PA cada_]

- *Corrente de Apoio:* quando um aliado a até 18m conjurar uma magia de área, você pode gastar *1 PM* como Reação para aumentar a área dela em metade.
- *Corte Fino:* suas magias cortantes de Vento causam *+1d6* contra criaturas sem armadura.
- *Fuga Perfeita:* ao ser reduzido a 0 PV, você é automaticamente arremessado 9m para longe da fonte do dano antes de cair.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Avançado (Vento)

#quadro(titulo: [◈ Maestria: Voo])[
Você recebe *Deslocamento de Voo permanente* igual ao seu Deslocamento normal, sem custo de PM, enquanto estiver consciente e não estiver _Exausto_.

Isto é maior do que parece. Metade dos monstros do Mundo de Seis Faces não alcança nada a seis metros do chão, e a esmagadora maioria dos espadachins do mundo — inclusive Imperadores — não tem resposta nenhuma para um inimigo no ar.

*Magia Combinada* também é desbloqueada aqui. Vento é o parceiro mais requisitado do livro: ele leva fogo, gelo, veneno e som para onde não deveriam chegar.
]
]

#block(sticky: true)[*Feitiços Avançados*]

#block(breakable: false)[
*_◆ Nova Congelante_* — _3 PA | 6 PM | Esfera de 12m_
_(Requer 1 patamar em Água, ou um aliado mago de Água conjurando junto.)_ A magia combinada mais famosa do mundo: vento úmido acelerado até o ponto em que a umidade congela no meio do voo.
- *Efeito:* todos na área ficam _Molhados_ e imediatamente _Congelados_, *sem teste de resistência*.
- *Dano:* *6d8* de frio (já contando a duplicação por _Molhado_).
- _Encantamento:_ _"Umidade que viaja comigo, pare no meio do caminho e escolha ser vidro. Nova Congelante!"_
]

#block(breakable: false)[
*_Prisão de Ar_* — _2 PA | 5 PM | Alcance 27m_
- *Efeito:* teste de *Força* (CD 8 + BC). Falha: o alvo é erguido 6m do chão e fica *Preso e Desequilibrado*, incapaz de se mover ou usar Reações, por 1 minuto. Ele pode repetir o teste no fim de cada turno dele. Se você soltá-lo de propósito, ele cai e sofre dano de queda.
]

#block(breakable: false)[
*_Guilhotina de Vácuo_* — _2 PA | 5 PM | Linha de 45m_
- *Efeito:* ataque contra todas as criaturas na linha. *6d8 + BC* de dano cortante. Contra alvos _Desequilibrados_, o dano é *dobrado*. Corta madeira, corda, tecido e carne com igual facilidade; não corta pedra.
]

#block(breakable: false)[
*_Tomar o Ar_* — _2 PA | 4 PM | Esfera de 6m_
- *Efeito:* você remove o ar da área por 3 turnos. Criaturas que respiram fazem teste de *Vigor* (CD 8 + BC) por turno: quem falhar sofre *3d6* e não pode recitar cântico algum. Fogo na área se apaga instantaneamente, incluindo _Em Chamas_.
]

#block(sticky: true)[*Talentos Avançados* — _2 PA cada_]

- *Vento Constante:* você pode manter *duas* magias de Vento sustentadas simultaneamente sem concentração.
- *Redirecionar:* 1 Reação e 2 PM: um ataque à distância mundano ou um projétil mágico direcionado a você é desviado para outra criatura à sua escolha a até 9m.
- *Corpo de Corrente:* _(estende a sua Maestria de Intermediário.)_ Além de _Caído_ e _Atolado_, você passa a ser imune a _Preso_ e _Agarrado_, e pode atravessar qualquer fresta por onde caiba ar.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Santo (Vento)

#quadro(titulo: [◈ Maestria: Senhor do Céu])[
- O seu Voo passa ao *dobro* do Deslocamento, e você pode pairar imóvel indefinidamente.
- Você controla o vento num raio de *1 km*: pode negar voo a criaturas hostis, encalhar navios, derrubar flechas, dispersar qualquer névoa ou gás.
- Nenhum ataque à distância mundano acerta você. Nenhum.
]
]

#block(sticky: true)[*Feitiços Santos*]

#block(breakable: false)[
*_◆ Tempestade Cortante_* — _4 PA | 11 PM | Esfera de 30m de raio_
Milhares de lâminas de vácuo do tamanho de folhas, girando dentro de uma coluna de vento, sem tocar o chão nem o céu.
- *Efeito:* toda criatura na área sofre o dano no início de cada turno dela enquanto permanecer dentro. O efeito dura *1 minuto* e se move 9m por turno para onde você quiser.
- *Dano:* *5d8 + BC* de dano cortante por turno. _Desequilibrado_ automático em quem falhar num teste de Força.
- _Encantamento:_ _"Que o ar se lembre de que já foi lâmina. Que ele lembre mil vezes por segundo. Tempestade Cortante!"_
]

#block(breakable: false)[
*_Céu Negado_* — _3 PA | 9 PM | Raio de 300m_
- *Efeito:* por 10 minutos, nenhuma criatura hostil consegue voar, saltar acima de 3m nem disparar projéteis para dentro da área. Aliados voam livremente. É a magia que se usa contra Raça Celestial, dragões e arqueiros de elite.
]

#block(sticky: true)[*Talento Santo* — _3 PA_]

- *Sem Cântico:* suas magias de Vento de rank *Avançado ou inferior* podem ser conjuradas em Conjuração Silenciosa sem penalidade alguma. Vento é a escola mais fácil de calar, porque ela já é feita de ar.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Rei (Vento)

#quadro(titulo: [◈ Maestria: Som e Vácuo])[
A escola destranca o elemento secundário. Se o Vento manipula gases, então ele manipula *o que atravessa os gases* — e o que não atravessa lugar nenhum.

- Você conjura dano *sônico*, que ignora Cobertura, armadura e o _Manto de Touki_ (som atravessa aço), mas não funciona no vácuo nem debaixo d'água.
- Você pode criar *silêncio absoluto* ou *ruído insuportável* em qualquer área de até 30m, à vontade, sem PM. Magos dentro do silêncio não conjuram nada que não seja Silencioso.
]
]

#block(sticky: true)[*Feitiços Reais*]

#block(breakable: false)[
*_◆ Grito do Mundo_* — _5 PA | 13 PM | Esfera de 45m_
- *Efeito:* teste de *Vigor* (CD 8 + BC). Falha: dano cheio, *Atordoado* por 1 turno e *Surdo* por 10 minutos. Sucesso: metade e nada mais.
- *Dano:* *10d10 + BC* de dano sônico. Ignora armadura, Cobertura e Manto de Touki. Estruturas de pedra rachaam; vidro e cristal se despedaçam.
]

#block(breakable: false)[
*_Vazio_* — _4 PA | 12 PM | Esfera de 18m_
- *Efeito:* você remove *todo* o ar da área por 1 minuto. Criaturas que respiram começam a sufocar imediatamente: *4d10* por turno, sem teste, e não podem recitar, gritar nem usar habilidades que exijam voz. Fogo é impossível ali dentro. Som não existe — nem o seu.
]

#block(sticky: true)[*Talento Rei* — _3 PA_]

- *Ouvido Absoluto:* você "vê" por som num raio de 60m, atravessando paredes, escuridão e invisibilidade. Criaturas que não fazem ruído algum ainda escapam de você.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Imperador (Vento)

#quadro(titulo: [◈ Maestria: A Atmosfera é Sua])[
- Você controla a pressão do ar num raio de *5 km*. Pode criar ou dissolver tempestades, negar voo a um continente inteiro, sustentar uma fortaleza no ar.
- Criaturas hostis a até 18m de você estão *permanentemente Desequilibradas*, sem teste e sem duração.
- Uma vez por turno, você conjura uma magia de Vento de rank *Avançado ou inferior* em Conjuração Silenciosa *sem gastar Ação*.
]
]

#block(sticky: true)[*Feitiços Imperiais*]

#block(breakable: false)[
*_◆ Lâmina do Horizonte_* — _6 PA | 20 PM | Linha de 3 km | Ritual (6 Ações)_
Um único corte de vácuo, com dois metros de altura e a espessura de um fio de cabelo, atravessando tudo o que existe entre você e o horizonte.
- *Efeito:* toda criatura na linha faz teste de *Agilidade* com *Desvantagem Absoluta*. Falha: dano cheio. Sucesso: metade — e mesmo assim fica _Desequilibrada_.
- *Dano:* *16d10 + BC* de dano cortante. Contra alvos _Desequilibrados_: *dobrado*.
- Muralhas, torres, florestas e colinas na trajetória são *cortadas ao meio*. A linha continua visível na paisagem por décadas.
- _Encantamento:_ _"Um traço. Um só. E que tudo o que estiver do lado errado dele aprenda que estava do lado errado. Lâmina do Horizonte!"_
]

#block(breakable: false)[
*_Explosão Silenciosa_* — _5 PA | 18 PM | Esfera de 60m_
_(Requer 1 patamar em Fogo.)_ A magia combinada mais perigosa já registrada: ar comprimido além do possível, aquecido além do possível, solto de uma vez. Foi assim que Rudeus fez o que fez contra Orsted.
- *Efeito:* *18d12* de dano dividido igualmente entre ígneo, sônico e contundente. Teste de *Vigor* com Desvantagem Absoluta para metade. Ignora Resistência a qualquer um dos três tipos, porque nenhum deles é o dano principal.
- Não faz som *no momento*. O som chega depois, e chega a quilômetros de distância.
]

#block(sticky: true)[*Talento Imperador* — _4 PA_]

- *Nada Toca Você:* enquanto você estiver voando e não estiver _Exausto_, criaturas de rank Santo ou inferior *não conseguem te atingir* com ataque corpo a corpo algum. Você simplesmente não está onde a mão delas chega.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Vento)

_Narrativo. Não se compra._

#quadro(titulo: [◈ O Golpe Sem Distância])[
_Nada Toca Você_, a marca do Imperador, já torna a distância irrelevante para quem tenta atacar o mago. O patamar Divino inverte a mão: o mago deixa de precisar de distância nenhuma para atacar qualquer coisa.

Um golpe de Vento em rank Deus chega ao alvo antes do som de tê-lo desferido — porque, para todos os efeitos práticos, ele não viajou: o espaço entre o mago e o alvo simplesmente deixou de contar. Não existe cobertura, muralha ou continente que sirva de defesa contra alguém que já resolveu essa equação.

Não há registro de ninguém vivo hoje que domine este patamar — e a escola prefere assim. Um duelo entre dois magos de Vento Divino, dizem os mestres, aconteceria e terminaria sem que ninguém no mundo visse o meio dele.

Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o clímax de uma campanha, e o mundo deve mudar por causa disso.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Magia de Terra

Terra gera e manipula rocha, solo e *minerais* — e é a escola menos glamourosa e mais vencedora do livro.
]

Ela tem a menor reserva de mana e a maior resistência física. Ela não incendeia o cenário como Fogo nem anula distância como Vento: ela *reescreve o chão*, e depois atira o chão em você a velocidade absurda.

E ela é a única escola de ataque que constrói. Um mago de Terra levanta uma ponte, veda uma masmorra, ergue um acampamento fortificado em dez minutos e desmorona uma parede de castelo. Metade do valor dele nunca aparece numa rolagem de dano.

#block(breakable: false)[
==== As Condições da Escola

#quadro(titulo: [Atolado])[
Toda magia de Terra que altere o solo aplica esta condição. O alvo tem o *Deslocamento reduzido a 0*, rola testes de Agilidade com *Desvantagem* e não pode fazer Investidas nem saltos.

Escapar custa *1 Ação e um teste de Força* (CD 8 + seu BC). Criaturas voadoras são imunes — e é por isso que todo mago de Terra odeia arqueiros e Raça Celestial.
]
]

#quadro(titulo: [O Combo Elemental])[
- *Projétil contra Atolado:* magias de Terra que exigem rolagem de ataque *acertam automaticamente* um alvo _Atolado_. Ele não tem para onde tirar o corpo.
- *A Assinatura da Escola:* prender primeiro, atirar depois. É literalmente a tática que deu apelido a Rudeus Greyrat — o mundo o chamava de *Quagmire* muito antes de saber o nome dele.
]

==== Progressão de PV e PM da Terra

#largo-inline[
#tbl(2, (left, center),
  [Rank alcançado], [PV ganho],
  [Principiante], [1d8 + 2],
  [Intermediário], [1d8 + 3],
  [Avançado], [1d10 + 3],
  [Santo], [1d10 + 4],
  [Rei], [1d12 + 4],
  [Imperador], [1d12 + 5],
)

#linebreak()
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Principiante (Terra)

#quadro(titulo: [◈ Maestria: Moldar])[
Sem PM e sem Ação, você molda terra, areia, argila e pedra macia num raio de 9 metros: abrir um buraco, fechar um buraco, erguer um degrau, endurecer lama, fazer uma tigela, uma parede baixa, uma tumba, uma trava improvisada numa porta.

Em dez minutos você ergue um *abrigo fortificado* para o grupo inteiro dormir: paredes, teto, porta que só abre por dentro. Nenhum grupo com um mago de Terra volta a acampar exposto, e isso muda a campanha inteira mais do que qualquer feitiço desta lista.
]
]

#block(sticky: true)[*Feitiços Principiantes*]

#block(breakable: false)[
*_◆ Bala de Pedra_* — _2 PA | 1 PM | Alcance 27m_
_Rock Bullet._ Você comprime terra solta numa esfera densa e a dispara. Simples, barata, e a base do feitiço mais famoso do mundo.
- *Efeito:* ataque mágico à distância. Contra alvo _Atolado_, *acerta automaticamente*.
- *Dano:* *1d10 + BC* (contundente).
- _Encantamento:_ _"Pó que já foi montanha, lembre do peso e vá. Bala de Pedra!"_
]

#block(breakable: false)[
*_Atoleiro_* — _1 PA | 2 PM | Esfera de 6m de raio_
_Quagmire._ O solo dentro da área deixa de ser sólido e passa a ser algo entre lama e areia movediça.
- *Efeito:* sem dano. Criaturas na área fazem teste de *Agilidade* (CD 8 + BC) ou ficam *Atoladas*. A área permanece terreno difícil por 10 minutos.
- _Encantamento:_ _"Terra firme, seja honesta uma vez: você nunca foi firme. Atoleiro!"_
]

#block(breakable: false)[
*_Muro de Terra_* — _1 PA | 2 PM | Alcance 9m_
- *Efeito:* uma parede de 6m de largura por 3m de altura e meio metro de espessura, com *40 PV*, que dura 10 minutos. Cobertura Total para quem estiver atrás.
]

#block(breakable: false)[
*_Lança de Pedra_* — _1 PA | 2 PM | Alcance 9m_
- *Efeito:* estacas irrompem do chão sob até três criaturas à sua escolha. Teste de *Agilidade* (CD 8 + BC): falha = *2d6 + BC* perfurante e fica _Atolado_.
]

#block(breakable: false)[
*_Mão de Terra_* — _1 PA | 2 PM | Alcance 18m_
- *Efeito:* uma mão de pedra agarra o alvo. Disputa de *Força* contra o seu BC: se você vencer, ele fica *Agarrado e Atolado* e pode ser arrastado 3m por turno para onde você quiser.
]

#block(sticky: true)[*Talentos Principiantes* — _1 PA cada_]

- *Pele de Pedra:* *+4 PV por patamar seu nesta árvore*. Comprável várias vezes, até o número de patamares.
- *Sentido Sísmico:* você percebe pelo chão qualquer criatura em contato com o solo num raio de 18m, mesmo invisível, escondida ou no escuro.
- *Mineralogista:* você identifica minérios, avalia pedras preciosas e sabe, ao tocar uma parede, o que existe atrás dela e quão grosso é.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Intermediário (Terra)

#quadro(titulo: [◈ Maestria: Compressão])[
Você para de atirar terra e passa a atirar *pedra comprimida além do que a natureza permite*.

- Todas as suas magias de projétil de Terra sobem um degrau de dado (d10 vira d12, 2d6 vira 2d8) e passam a ignorar *Resistência a dano contundente*.
- Você pode *endurecer qualquer estrutura sua* gastando 1 PM: o _Muro de Terra_ passa a ter 80 PV.
]
]

#block(sticky: true)[*Feitiços Intermediários*]

#block(breakable: false)[
*_◆ Canhão de Pedra_* — _2 PA | 3 PM | Alcance 90m_
_Stone Cannon._ A versão adulta da Bala de Pedra: a mesma esfera, comprimida até a densidade de aço e disparada rápido demais para o olho acompanhar. Nas mãos certas, dizem que ela alcança poder de rank Imperador — e as mãos certas eram de um garoto que nunca dominou espada nenhuma.
- *Efeito:* ataque mágico à distância. Ignora metade da CA de armadura não-mágica. Contra alvo _Atolado_, acerta automaticamente *e crita em 19-20*.
- *Dano:* *4d8 + BC* (contundente/perfurante).
- _Encantamento:_ _"Pedra, esqueça que é pedra. Seja a bala. Canhão de Pedra!"_
]

#block(breakable: false)[
*_Terremoto Menor_* — _1 PA | 4 PM | Esfera de 12m de raio_
- *Efeito:* teste de *Agilidade* (CD 8 + BC). Falha: *3d6 + BC* contundente, fica _Caído_ e _Atolado_. Estruturas de pedra na área sofrem dano dobrado; pontes e escadas podem ruir a critério do Mestre.
]

#block(breakable: false)[
*_Cárcere_* — _1 PA | 3 PM | Alcance 18m_
- *Efeito:* o chão se fecha em torno de um alvo _Atolado_, prendendo-o até o pescoço. Ele fica *Preso e Imóvel*, com ataques contra ele em *Vantagem*, até quebrar a pedra (teste de Força, CD 8 + BC) ou até alguém causar 30 de dano ao cárcere.
]

#block(breakable: false)[
*_Fortaleza Rápida_* — _1 PA | 4 PM | Raio de 9m_
- *Efeito:* em 1 Ação, você ergue um círculo de muralhas de 3m em volta do grupo, com uma abertura à sua escolha. 60 PV por seção. Dura 1 hora.
]

#block(sticky: true)[*Talentos Intermediários* — _1 PA cada_]

- *Munição Infinita:* suas magias de projétil de Terra funcionam mesmo sobre madeira, metal, água ou vazio — você carrega o próprio material. _(Sem este talento, o Mestre pode negar magia de Terra em cima de um navio.)_
- *Chão Meu:* você ignora a condição _Atolado_ e terreno difícil de qualquer origem, inclusive de magias inimigas.
- *Escultor:* você reproduz em pedra qualquer coisa que já tenha visto, com precisão perfeita. É como se treina controle fino — e figuras de pedra bem-feitas valem muito dinheiro.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Avançado (Terra)

#quadro(titulo: [◈ Maestria: Domínio Mineral])[
- Você manipula *metal* além de pedra: travar uma armadura, entortar uma lâmina, arrancar uma arma da mão de alguém a 9 metros (disputa contra Força).
- As suas estruturas passam a ter *o dobro dos PV* listados e não podem ser derrubadas por dano de área.
- *Magia Combinada* desbloqueada. Terra + Fogo gera magma; Terra + Água gera concreto que endurece em segundos.
]
]

#block(sticky: true)[*Feitiços Avançados*]

#block(breakable: false)[
*_◆ Chuva de Meteoros_* — _3 PA | 7 PM | Esfera de 18m de raio_
Você arranca a rocha do subsolo, joga para cima e devolve.
- *Efeito:* teste de *Agilidade* (CD 8 + BC), metade se passar. A área vira terreno difícil permanente e todos que falharem ficam _Atolados_ nos escombros.
- *Dano:* *8d8 + BC* (contundente).
- _Encantamento:_ _"O que está embaixo já esteve em cima. Devolvo o que era seu. Chuva de Meteoros!"_
]

#block(breakable: false)[
*_Prisão de Pedra_* — _2 PA | 6 PM | Alcance 27m_
- *Efeito:* um bloco maciço se fecha sobre um alvo. Ele fica *totalmente encapsulado*: não vê, não ouve, não conjura, não respira (sofre 2d10 por turno se precisar de ar). O bloco tem 100 PV. É a forma mais confiável do livro de capturar alguém vivo.
]

#block(breakable: false)[
*_Lâmina de Aço_* — _2 PA | 5 PM | Alcance 27m_
- *Efeito:* você extrai o metal do próprio solo e o dispara em linha. *6d8 + BC* de dano perfurante contra todos na linha, ignorando *toda* CA de armadura metálica — o metal dela ajuda a puxar o projétil.
]

#block(breakable: false)[
*_Colapso_* — _2 PA | 6 PM | Alcance 45m_
- *Efeito:* uma estrutura de pedra, madeira ou terra à sua escolha (parede, torre, ponte, teto de caverna) *desmorona*. Criaturas embaixo fazem teste de Agilidade (CD 8 + BC) ou sofrem *8d6* e ficam _Presas_.
]

#block(sticky: true)[*Talentos Avançados* — _2 PA cada_]

- *Segunda Bala:* uma vez por turno, ao conjurar _Canhão de Pedra_, você dispara *duas* pelo custo de uma. Alvos podem ser diferentes.
- *Núcleo de Ferro:* você recebe *Resistência a dano contundente, cortante e perfurante* de armas não-mágicas enquanto estiver com os pés no chão.
- *Arquiteto de Guerra:* suas construções ficam permanentes se você gastar uma hora consolidando. Um mago de Terra Avançado ergue uma fortaleza de fronteira em um mês.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Santo (Terra)

#quadro(titulo: [◈ Maestria: O Chão Obedece])[
- Você molda terra, pedra e metal num raio de *1 km* livremente, sem PM, fora de combate.
- Dentro de combate, você pode gastar *1 Ação* para reformular o campo de batalha inteiro: erguer colinas, abrir fossos, mudar a altura do terreno. Aliados escolhem se são afetados; inimigos não.
- Você não pode ser derrubado, empurrado, agarrado nem teleportado contra a vontade enquanto tocar o solo.
]
]

#block(sticky: true)[*Feitiços Santos*]

#block(breakable: false)[
*_◆ Falha Geológica_* — _4 PA | 11 PM | Linha de 90m × 6m_
O chão se abre. Não uma rachadura: uma *falha*, com fundo que ninguém vê daqui.
- *Efeito:* teste de *Agilidade* com Desvantagem (CD 8 + BC). Falha: a criatura cai na fenda, sofre *8d10* de dano de queda e fica _Presa_ no fundo. Sucesso: fica na borda, _Atolada_ e _Caída_.
- Estruturas atravessadas pela linha desabam por completo. A fenda é permanente.
- _Encantamento:_ _"Placa que dorme há dez mil anos, acorde por dois segundos. Só dois. Falha Geológica!"_
]

#block(breakable: false)[
*_Golem_* — _3 PA | 9 PM | Alcance 18m_
- *Efeito:* você anima um corpo de pedra de 3m por 10 minutos. Ele tem *80 PV*, CA 16, ataca com o seu BC causando *3d10 + BC*, e obedece ordens simples sem gastar as suas Ações. Um por vez.
]

#block(sticky: true)[*Talento Santo* — _3 PA_]

- *Peso Absoluto:* uma vez por combate, sem gastar Ação, você triplica o peso de um alvo visível. Ele faz teste de Força (CD 8 + BC) ou fica _Atolado e Caído_, e criaturas voadoras *caem do céu*.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Rei (Terra)

#quadro(titulo: [◈ Maestria: Metal e Magma])[
A escola destranca o elemento secundário — os dois estados extremos do mineral.

- *Metal:* você conjura, molda e endurece aço puro. Suas armas de pedra passam a contar como *mágicas* e a ignorar Resistência.
- *Magma:* você liquefaz rocha. Dano de magma ignora *Resistência a ígneo e a contundente* ao mesmo tempo, porque não é bem nenhum dos dois, e aplica _Em Chamas_ mesmo em criaturas normalmente imunes a fogo.
]
]

#block(sticky: true)[*Feitiços Reais*]

#block(breakable: false)[
*_◆ Rio de Magma_* — _5 PA | 14 PM | Linha de 45m × 9m_
- *Efeito:* o solo derrete e escorre. A área permanece coberta de magma por *10 minutos*, causando *6d10* por turno a quem estiver dentro e destruindo qualquer estrutura que toque.
- *Dano inicial:* *12d8 + BC* de dano de magma, teste de Agilidade para metade. Criaturas _Atoladas_ *não podem* fazer o teste.
]

#block(breakable: false)[
*_Muralha do Fim_* — _4 PA | 12 PM | Raio de 90m_
- *Efeito:* você ergue uma muralha de pedra e aço de *9 metros de altura* cercando ou dividindo o campo de batalha, com *400 PV* por seção. Ela é permanente até ser destruída. É a magia com que se vence um cerco — dos dois lados.
]

#block(sticky: true)[*Talento Rei* — _3 PA_]

- *Bala Imperial:* o seu _Canhão de Pedra_ passa a rolar *8d8* e a ignorar *toda* CA de armadura, Cobertura e o _Manto de Touki_. Em troca, ele passa a custar *6 PM* e *não pode* ser combinado com _Segunda Bala_. Este é o talento que transforma o feitiço mais barato da escola na arma mais eficiente do livro — e é literalmente o que Badigadi quis dizer ao chamar a Bala de Pedra de Rudeus de poder classe-Imperador.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Imperador (Terra)

#quadro(titulo: [◈ Maestria: O Continente é Seu])[
- Você molda terra, pedra, metal e magma num raio de *10 km*, e a alteração é permanente.
- Criaturas hostis em contato com o solo dentro de 30m de você estão *permanentemente Atoladas*, sem teste.
- Uma vez por turno, você conjura uma magia de Terra de rank *Avançado ou inferior* em Conjuração Silenciosa *sem gastar Ação*.
]
]

#block(sticky: true)[*Feitiços Imperiais*]

#block(breakable: false)[
*_◆ Sepultamento_* — _6 PA | 20 PM | Esfera de 45m | Ritual (6 Ações)_
Você não derruba nada em cima deles. Você abaixa o mundo em volta e sobe o mundo por baixo, e fecha.
- *Efeito:* teste de *Força* com *Desvantagem Absoluta*. Falha: a criatura é *soterrada* — sofre o dano, fica _Presa_ sob toneladas de rocha, e começa a sufocar (4d10 por turno) até ser escavada por alguém de fora. Sucesso: metade do dano e fica _Atolada_.
- *Dano:* *16d10* de dano contundente. Aliados são poupados automaticamente.
- Estruturas na área simplesmente deixam de existir na superfície. A paisagem muda de forma permanente.
- _Encantamento:_ _"A terra recebe tudo de volta. Eu só estou antecipando a data. Sepultamento!"_
]

#block(breakable: false)[
*_Cordilheira_* — _5 PA | 18 PM | Raio de 3 km | Ritual (6 Ações)_
- *Efeito:* você levanta ou derruba *a geografia da região*. Uma montanha onde havia planície, um vale onde havia colina, um desfiladeiro atravessando uma estrada imperial. Efeito narrativo permanente: rotas comerciais mudam, exércitos são forçados a rodear, mapas ficam errados.
]

#block(sticky: true)[*Talento Imperador* — _4 PA_]

- *Aquele que Move Montanhas:* uma vez por Descanso Longo, você conjura qualquer magia de Terra pagando *metade do PM*, arredondado para baixo. Com a menor reserva de mana do jogo, este talento é o que torna o Imperador de Terra jogável.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Terra)

_Narrativo. Não se compra._

#quadro(titulo: [◈ Onde Havia Mar])[
_Cordilheira_, a marca do Imperador, já ergue montanhas e abre vales numa região. O patamar Divino trabalha em outra escala: continentes.

A lenda mais repetida sobre este patamar é a de um mago de Terra que ergueu uma ponte de rocha viva atravessando um estreito que separava dois continentes — e de outro, séculos depois, que a afundou de volta ao fundo do oceano numa única noite, porque um exército a estava atravessando. Nenhuma das duas histórias tem confirmação de testemunha viva. Nenhuma das duas foi desmentida.

Isto não é dano. É geografia, e geografia não se desfaz.

Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É a fundação de um mito que dura mais que qualquer reinado, e o mundo deve mudar por causa disso.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Magia de Cura

A Magia de Cura é a única escola do livro cujos patamares *não são medidos em números*. Fogo mede em dano, Água mede em área, esgrima mede em dados de arma. Cura mede em uma pergunta só: *que tipo de estrago você consegue desfazer?*
]

Um Principiante fecha um corte. Um Avançado salva alguém de uma queimadura que teria matado. Um Santo recoloca um braço que acabou de ser decepado. Um Rei faz nascer um braço que já não existe, desde que os ossos estejam ali. Um Imperador faz nascer um braço perdido há vinte anos. E um Deus faz um morto recente voltar a respirar.

É a escola que decide quem sobrevive à campanha — e é a única que os outros jogadores vão implorar para que alguém pegue.

#quadro(titulo: [O que a Cura NÃO faz — leia antes de tudo])[
Metade da identidade desta escola são as coisas que ela *não* consegue resolver, e o livro trata isso como lei, não como sugestão:

- *Não cura veneno.* *Não cura doença.* *Não remove maldição.* Isso é trabalho da escola de *Desintoxicação*, que é uma escola separada com grimórios separados. Um Imperador de Cura assiste alguém morrer de veneno sem poder fazer absolutamente nada — e é assim que deve ser.
- *Não cura fome, sede nem Exaustão por privação.* Ferimento não é cansaço.
- *Não ressuscita*, exceto no patamar *Deus*, e mesmo lá só quem morreu há poucos minutos.
- *Não funciona à distância* abaixo do Intermediário. Você precisa *encostar*.

A consequência de mesa é que o grupo precisa de duas pessoas diferentes, ou de uma pessoa com duas escolas. É intencional: no cânone, essa separação é exatamente o motivo de a Doença da Pedra Mágica ser incurável e de o grimório de Desintoxicação de rank Deus estar trancado no Grande Templo de Millis, sem que ninguém no mundo consiga lê-lo.
]

#block(breakable: false)[
==== A Condição da Escola

#quadro(titulo: [Ferida Fresca])[
Todo dano sofrido por uma criatura *desde o fim do último turno dela própria* — não do seu — é uma _Ferida Fresca_. A carne ainda está aberta, o sangue ainda corre, o corpo ainda lembra do formato que tinha.

_Na prática: o dano que o guerreiro tomou enquanto você esperava a sua vez é fresco. O que ele tomou na rodada passada, depois de já ter agido, não é mais._

- Magias de Cura conjuradas sobre uma *Ferida Fresca* curam o *dobro dos dados*.
- Magias de Cura conjuradas sobre dano antigo curam normalmente, mas *custam o dobro de PM*.

Isso inverte a lógica do curandeiro tradicional. Você não espera o guerreiro cair para gastar a magia grande — você fecha o corte *no instante em que ele acontece*, e é por isso que a Reação vale mais que a Ação nesta escola.
]
]

#quadro(titulo: [Selar a Ferida])[
A contrapartida tática. Gastando *1 PM e 1 Ação*, você sela um ferimento: aquele dano continua contando como *Ferida Fresca* por até *1 hora*, mesmo depois de o turno passar.

Fora de combate, é assim que um curandeiro de campo mantém um moribundo curável até chegar alguém melhor que ele. Dentro de combate, é assim que um Santo de Cura guarda o dano de três aliados para desfazer tudo de uma vez.
]

==== Progressão de PV e PM da Cura

#largo-inline[
#tbl(2, (left, center),
  [Rank alcançado], [PV ganho],
  [Principiante], [1d4 + 2],
  [Intermediário], [1d6 + 2],
  [Avançado], [1d6 + 2],
  [Santo], [1d6 + 3],
  [Rei], [1d8 + 3],
  [Imperador], [1d8 + 4],
)

#linebreak()
]

#quadro(titulo: [Atenção: o atributo de conjuração da Cura é *Espírito*])[
Diferente das quatro escolas elementais, a Cura não usa Intelecto. O *BC de Cura = Espírito + Bônus de Rank*.

A lógica é do cânone e é boa: magia de ataque é cálculo, magia de cura é vontade. Você não resolve uma hemorragia entendendo hemorragias — você a resolve querendo, com muita força, que ela pare.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Principiante (Cura)

_Todo exército tem um. Toda caravana quer um. Quase nenhum deles sabe fazer mais do que fechar um corte, e mesmo assim ninguém viaja sem._

#quadro(titulo: [◈ Maestria: Diagnóstico])[
Encostando em uma criatura, ou observando-a por dez segundos, você sabe *exatamente* o que há de errado com ela: PV atual e máximo, todas as condições ativas, e — o mais importante — *de que categoria é o problema*: ferimento, veneno, doença, maldição, exaustão ou fome.

Ou seja: você sempre sabe, antes de gastar um único PM, *se o problema é seu ou não é*.

*Além disso:* encostando em um aliado a 0 PV, você o *estabiliza automaticamente*, sem gastar PM, sem gastar Ação e sem rolagem. Ele continua desacordado, mas para de rolar o _Fio da Vida_.

Esta última linha sozinha muda o tom da mesa inteira. Um grupo com um Principiante de Cura não perde mais personagens por azar em três dados — perde por decisões.
]
]

#block(sticky: true)[*Feitiços Principiantes*]

#block(breakable: false)[
*_◆ Cura_* — _2 PA | 2 PM | Toque_
A magia mais ensinada do Mundo de Seis Faces. Sua mão esquenta, a carne se puxa de volta para o lugar de onde saiu, e a dor recua como maré. Não é agradável: curar dói quase tanto quanto ferir, porque o corpo faz em três segundos o que faria em três semanas.
- *Efeito:* o alvo recupera *2d8 + BC* de PV. Se o dano for _Ferida Fresca_, os dados dobram para *4d8 + BC*.
- Remove todas as _Marcas da Morte_ do alvo e o acorda, se estiver a 0 PV.
- _Encantamento:_ _"Que este poder divino seja alimento farto, e que dê a quem perdeu as forças a força de se erguer de novo. Cura!"_
]

#block(breakable: false)[
*_Estancar_* — _1 PA | 1 PM | Toque_
- *Efeito:* encerra imediatamente qualquer efeito de dano contínuo por sangramento, corte aberto ou queimadura ativa. Não funciona contra veneno nem contra fogo mágico ainda ardendo.
]

#block(breakable: false)[
*_Selar a Ferida_* — _1 PA | 1 PM | Toque_
- *Efeito:* aplica a regra _Selar a Ferida_ descrita acima. O dano escolhido permanece _Fresco_ por 1 hora.
- *O uso que ninguém pensa na primeira sessão:* selar as próprias feridas antes de dormir, e curar tudo de manhã pela metade do preço.
]

#block(breakable: false)[
*_Vigor Emprestado_* — _1 PA | 2 PM | Toque_
Você não fecha nada. Você empresta ao corpo dele a certeza de que ele ainda aguenta.
- *Efeito:* o alvo recebe *1d8 + BC* de *PV Temporários*, que duram 10 minutos. PV Temporários são gastos antes dos PV reais e não se acumulam com outra fonte.
]

#block(breakable: false)[
*_Mão que Acalma_* — _1 PA | 2 PM | Toque_
- *Efeito:* remove *um* nível de _Exaustão_ causado por ferimento, trauma ou por ter acordado do _Fio da Vida_. Não remove Exaustão por fome, sede, frio ou marcha forçada — isso não é ferimento, é privação.
]

#block(sticky: true)[*Talentos Principiantes* — _1 PA cada_]

- *Mãos Firmes:* você conjura magias de Cura sem sofrer Desvantagem por estar em combate corpo a corpo, sob chuva, no escuro ou com um inimigo adjacente.
- *Reserva do Curandeiro:* *+2 PM por patamar seu nesta árvore*. Comprável várias vezes, até o número de patamares.
- *Juramento:* você jura nunca usar magia para ferir. Enquanto o juramento durar, todas as suas magias de Cura custam *1 PM a menos* (mínimo 1). Quebrá-lo — atacando qualquer criatura viva com magia — desliga o talento por uma semana. _(Muitos templos de Millis exigem este juramento para formar um acólito.)_

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Intermediário (Cura)

_O patamar em que você para de precisar chegar perto do sangue._

#quadro(titulo: [◈ Maestria: Alcance da Compaixão])[
- Suas magias de Cura passam a alcançar *9 metros*. Você não precisa mais atravessar a linha de frente para fechar um corte.
- Magias de Cura de rank *Principiante* custam *1 PM a menos* (mínimo 1).
- Você consegue curar *duas criaturas ao mesmo tempo* com uma única conjuração de rank Principiante, dividindo os dados rolados entre elas como preferir.
]
]

#block(sticky: true)[*Feitiços Intermediários*]

#block(breakable: false)[
*_◆ Prontidão_* — _2 PA | 3 PM | Alcance 9m_
Você não espera o golpe terminar. Você já está fechando enquanto ele ainda está abrindo.
- *Custo:* *1 Reação*, quando um aliado visível sofrer dano.
- *Efeito:* ele recupera *2d8 + BC* de PV. Como o dano acabou de acontecer, é sempre *Ferida Fresca* — ou seja, *4d8 + BC*, sempre.
- *Esta é a magia que define a escola.* É a única do livro que transforma a Reação do curandeiro no recurso mais valioso da mesa, e é a razão pela qual um curandeiro esperto quase nunca gasta a Ação dele curando.
]

#block(breakable: false)[
*_Bênção Coletiva_* — _1 PA | 4 PM | Esfera de 6m_
- *Efeito:* todos os aliados na área recuperam *1d8 + BC* de PV, dobrado individualmente para quem tiver _Ferida Fresca_.
]

#block(breakable: false)[
*_Escudo de Carne_* — _1 PA | 3 PM | Toque_
Você adianta o trabalho: espessa a pele, endurece o tecido, prepara o corpo para o dano que ainda vai chegar.
- *Efeito:* por 1 minuto, o alvo recebe *Resistência a dano físico* de armas mundanas. Encerra se ele cair a 0 PV.
]

#block(breakable: false)[
*_Transferência_* — _1 PA | 2 PM | Toque_
- *Efeito:* você assume um ferimento alheio. Escolha um aliado adjacente: até *BC* pontos do dano que ele sofreu passam para você, ignorando qualquer Resistência sua. O dano transferido conta como _Ferida Fresca_ *em você* — o que significa que alguém pode curá-lo pela metade do preço.
]

#block(breakable: false)[
*_Sono Reparador_* — _1 PA | 3 PM | Toque_
- *Efeito:* o alvo dorme profundamente por 1 hora e acorda como se tivesse feito um Descanso Curto completo. Não funciona duas vezes na mesma pessoa entre Descansos Longos.
]

#block(sticky: true)[*Talentos Intermediários* — _1 PA cada_]

- *Diagnóstico Profundo:* sua Maestria de Diagnóstico passa a revelar também *a causa* do problema — quem envenenou, que criatura infectou, há quanto tempo, e se o efeito é mágico ou natural.
- *Toque Duplo:* ao usar _Prontidão_, você pode curar dois aliados que tenham sofrido dano do mesmo efeito, dividindo os dados.
- *Curandeiro de Guerra:* você trata quatro pessoas por hora fora de combate em vez de uma, e nunca erra um diagnóstico sob pressão.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Avançado (Cura)

_Aqui você passa a desfazer coisas que teriam matado. Não "quase" — teriam._

#quadro(titulo: [◈ Maestria: A Ferida Mortal])[
- Você consegue curar *ferimentos potencialmente fatais*: queimaduras severas, órgãos perfurados, esmagamentos, hemorragias internas. Mecanicamente, você pode curar um aliado de *0 PV diretamente para PV positivos* com uma única conjuração, e ele *não recebe a condição _Exaustão_* ao acordar.
- Você *não* consegue reimplantar membros decepados. O braço está ali no chão, ainda quente, e não há nada que você possa fazer com ele neste patamar. _(Foi exatamente aqui que o Rudeus travou.)_
- *Magia Combinada:* você desbloqueia o direito de combinar escolas (Capítulo 2). Cura + Água gera névoa anestésica; Cura + Terra gera talas de pedra que seguram um osso partido no lugar.
]
]

#block(sticky: true)[*Feitiços Avançados*]

#block(breakable: false)[
*_◆ Cura Suprema_* — _3 PA | 6 PM | Alcance 9m_
- *Efeito:* o alvo recupera *6d8 + BC* de PV — *12d8 + BC* se for _Ferida Fresca_. Remove _Estancar_-áveis, sangramentos, ossos quebrados e a condição _Caído_.
- Se o alvo estiver a 0 PV, ele se levanta com metade dos PV máximos, sem _Exaustão_.
]

#block(breakable: false)[
*_Círculo de Recuperação_* — _2 PA | 5 PM | Esfera de 9m_
- *Efeito:* por 1 minuto, todo aliado que *começar* o turno dentro da área recupera *2d6 + BC* de PV. Você pode manter isto sem concentração, mas apenas um círculo por vez.
]

#block(breakable: false)[
*_Rejeitar a Morte_* — _2 PA | 5 PM | Alcance 9m_
- *Custo:* 1 Reação, quando um aliado visível chegaria a 0 PV.
- *Efeito:* ele fica com *1 PV* em vez disso e pode se mover 4,5m imediatamente. Uma vez por criatura por combate.
]

#block(breakable: false)[
*_Anestesia_* — _2 PA | 3 PM | Toque_
- *Efeito:* o alvo deixa de sentir dor por 10 minutos. Ele ignora todas as penalidades por ferimento e por _Exaustão_, mas *não sabe quando está morrendo* — o Mestre para de informar os PV dele ao jogador durante a duração. Usado por cirurgiões, e por mercenários desesperados.
]

#block(sticky: true)[*Talentos Avançados* — _2 PA cada_]

- *Mão Silenciosa:* você conjura magias de Cura de rank Principiante e Intermediário em *Conjuração Silenciosa*, sem penalidade alguma. _(É assim que Sylphiette cura no meio de uma conversa sem ninguém perceber.)_
- *Sangue Trocado:* _Transferência_ passa a mover o dobro do dano e alcança 9 metros.
- *Mãos Repartidas:* ao conjurar _Cura Suprema_, você pode dividir os dados rolados entre até duas criaturas ao seu alcance, em vez de concentrar tudo em uma só. Cada uma ainda dobra individualmente se estiver com _Ferida Fresca_.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Santo (Cura)

_O patamar de Zenith Greyrat. Um Santo de Cura vale mais para um reino do que uma companhia de cavaleiros, e reis sabem disso._

#quadro(titulo: [◈ Maestria: A Luz que Reconecta])[
- Você *reimplanta membros recém-decepados*, desde que o membro esteja disponível e a separação tenha ocorrido há menos de *uma hora* — ou a qualquer momento, se a ferida estiver _Selada_.
- Você *não* consegue criar o que não existe mais. Se o braço foi engolido, queimado ou perdido há dias, ele continua perdido.
- Suas magias de Cura de rank *Avançado ou inferior* podem ser conjuradas em *Conjuração Silenciosa* sem penalidade.
- Você pode manter *duas* magias de Cura sustentadas ao mesmo tempo.
]
]

#block(sticky: true)[*Feitiços Santos*]

#block(breakable: false)[
*_◆ Cura Radiante_* — _4 PA | 10 PM | Alcance 18m_
_Shine-Healing._ Não é mais o calor de uma mão. É uma coluna de luz branca que desce sobre o corpo e o obriga a lembrar da forma correta. Grandes ferimentos abertos se fecham do fundo para a superfície, e um membro decepado se reencaixa como se nunca tivesse saído.
- *Efeito:* o alvo recupera *10d8 + BC* de PV — *20d8 + BC* se for _Ferida Fresca_. Reimplanta um membro recém-decepado. Remove todas as _Marcas da Morte_, toda _Exaustão_ de origem física, e a condição _Caído_, _Atordoado_ ou _Cego_ de origem traumática.
- _Encantamento:_ _"Anjo dos milagres, conceda teu sopro sagrado ao coração que pulsa diante de ti. Ó céus abençoados pela luz do sol, servos que desprezam o carmesim, mergulhem no oceano de luz, com o branco puro de vossas asas abertas por inteiro. Cura Radiante!"_
]

#block(breakable: false)[
*_Santuário Menor_* — _3 PA | 8 PM | Esfera de 9m_
- *Efeito:* por 1 minuto, nenhum aliado dentro da área pode receber _Marcas da Morte_, e todo aliado que chegaria a 0 PV fica com 1 PV em vez disso — *uma vez cada*. A área não impede dano nem morte instantânea por efeitos de rank Imperador.
]

#block(breakable: false)[
*_Corpo de Ferro_* — _3 PA | 7 PM | Toque_
- *Efeito:* por 10 minutos, o alvo tem os *PV máximos aumentados em 20* e é imune a acertos críticos. É a magia que se coloca no espadachim antes de abrir a porta do chefe.
]

#block(sticky: true)[*Talento Santo* — _3 PA_]

- *Vigília:* uma vez por combate, a sua _Prontidão_ não gasta Reação. Um Santo de Cura reage duas vezes na mesma rodada, e é isso que faz um grupo sobreviver a uma emboscada.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Rei (Cura)

_Existem poucos no mundo, e todos têm nome. Um Rei de Cura devolve braços — e por isso ele é a pessoa que nobres, generais e Deuses da Espada procuram quando algo insubstituível se perde._

#quadro(titulo: [◈ Maestria: Golpe Divino])[
Este é o patamar em que a escola destranca o seu elemento secundário, e ele é perturbador: *a mesma força que remonta um corpo vivo despedaça um corpo que não deveria estar de pé.*

- Você pode canalizar magia de Cura *ofensivamente* contra mortos-vivos, construtos animados e criaturas de mana corrompida. Elas sofrem o valor que seria curado como *dano radiante*, sem teste de resistência.
- Contra criaturas *vivas* normais, isso não funciona de forma alguma. Curar alguém saudável não fere ninguém.
- Você também passa a *regenerar membros perdidos*, desde que os *ossos daquele membro estejam disponíveis* — não importa há quanto tempo a perda aconteceu.
]
]

#block(sticky: true)[*Feitiços Reais*]

#block(breakable: false)[
*_◆ Restauração_* — _5 PA | 15 PM | Toque | Ritual de 10 minutos_
Você coloca os ossos sobre a mesa e a carne cresce em cima deles em silêncio, camada por camada, tendão por tendão. Leva dez minutos e é profundamente desagradável de assistir.
- *Efeito:* regenera completamente um membro perdido, um olho, uma orelha ou um órgão interno, desde que você tenha *os ossos* correspondentes. Remove cicatrizes, cegueira traumática e surdez traumática.
- Não funciona em quem perdeu o membro para magia de rank Imperador ou superior (como o pó de diamante do _Silêncio Primordial_).
]

#block(breakable: false)[
*_Julgamento_* — _4 PA | 12 PM | Esfera de 12m_
- *Efeito:* magia de Golpe Divino. Todos os mortos-vivos, construtos e criaturas de mana corrompida na área sofrem *10d8 + BC* de dano radiante, sem teste. Aliados vivos na área *recuperam 3d8 + BC* de PV pelo mesmo efeito, na mesma conjuração.
- É a única magia do livro que cura e mata ao mesmo tempo, com a mesma luz.
]

#block(breakable: false)[
*_Milagre Menor_* — _4 PA | 12 PM | Toque_
- *Efeito:* remova *uma* condição de qualquer origem do alvo — inclusive _Paralisia_, _Petrificação_, _Congelado_ e cegueira mágica. *Exceção absoluta:* veneno, doença e maldição continuam fora do seu alcance para sempre. Isso é Desintoxicação, e não importa o seu patamar.
]

#block(sticky: true)[*Talento Rei* — _3 PA_]

- *Sopro do Julgamento:* seu _Golpe Divino_ passa a funcionar também contra *demônios de linhagem antiga e criaturas de rank Deus corrompidas*, causando metade do dano contra elas. Contra o resto do mundo vivo, continua não fazendo nada.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Imperador (Cura)

_A esta altura, "permanente" deixou de ser uma palavra que se aplica a você._

#quadro(titulo: [◈ Maestria: Nada é Irreversível])[
- Você regenera membros perdidos *independentemente de quanto tempo faz e sem precisar dos ossos*. Vinte anos, quarenta, uma vida inteira — o corpo lembra, e você faz o corpo obedecer à lembrança.
- Suas magias de Cura curam o valor *máximo* dos dados contra _Feridas Frescas_, em vez de rolar.
- Uma vez por turno, você conjura uma magia de Cura de rank *Avançado ou inferior* em Conjuração Silenciosa *sem gastar Ação alguma*.
]
]

#block(sticky: true)[*Feitiços Imperiais*]

#block(breakable: false)[
*_◆ Corpo Íntegro_* — _6 PA | 25 PM | Toque | Ritual de 1 hora_
Você não repara. Você *relê* o corpo, do jeito que ele foi escrito antes de o mundo mexer nele, e apaga tudo o que foi acrescentado depois.
- *Efeito:* o alvo é restaurado à integridade física completa. Todos os membros, órgãos, sentidos e cicatrizes voltam ao estado original, não importa quando ou como foram perdidos. Todos os PV são restaurados, toda _Exaustão_ removida, todas as condições físicas encerradas.
- *Não* remove veneno, doença nem maldição. Você pode dar a um homem um corpo perfeito e assisti-lo morrer da mesma febre que tinha antes.
- *Não* funciona em quem foi pulverizado, petrificado permanentemente ou consumido por magia de rank Imperador ou superior.
]

#block(breakable: false)[
*_Santuário_* — _5 PA | 20 PM | Esfera de 30m | Ritual (4 Ações)_
- *Efeito:* por 1 minuto, *nenhuma criatura viva dentro da área pode morrer*. Elas ainda sofrem dano e caem inconscientes a 0 PV, mas não recebem _Marcas da Morte_ e não podem ser mortas por efeito nenhum abaixo de rank Deus. Quando o Santuário acaba, todo dano continua exatamente onde estava — você comprou tempo, não vidas.
- Enquanto ativo, você não pode conjurar nenhuma outra magia.
]

#block(breakable: false)[
*_Luz Absoluta_* — _5 PA | 22 PM | Esfera de 30m_
- *Efeito:* Golpe Divino em escala de campo. Mortos-vivos e construtos na área são *destruídos automaticamente* se tiverem menos da metade dos PV máximos; os demais sofrem *20d8* de dano radiante. Todo aliado vivo na área recupera *10d8 + BC* de PV.
]

#block(sticky: true)[*Talento Imperador* — _4 PA_]

- *A Mão que Não Cansa:* uma vez por Descanso Longo, você conjura qualquer magia de Cura pagando *zero PM*. Curandeiros de rank Imperador são chamados quando já não há tempo de descansar.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Cura)

_Narrativo. Não tem custo em PA, não tem lista, e não se compra._

#quadro(titulo: [◈ Ressurreição])[
O patamar Divino da Magia de Cura faz uma coisa só, e é a coisa que o mundo inteiro considera impossível: *traz de volta os recém-mortos.*

- A morte precisa ter ocorrido há *poucos minutos*.
- O corpo precisa existir e estar substancialmente inteiro.
- A alma precisa não ter sido destruída, aprisionada nem cristalizada — o que exclui, entre outras coisas, todas as vítimas do _Zero Absoluto_ e do _Silêncio Primordial_.

Não existe ninguém vivo no Mundo de Seis Faces com este patamar. Se o seu jogador chegar aqui, isso não é uma compra de ficha: é o clímax de uma campanha, e o mundo deveria mudar por causa disso.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Magia de Desintoxicação

Se a Cura mede os patamares por *que tipo de estrago você desfaz*, a Desintoxicação mede por outra coisa: *há quanto tempo o estrago está lá.*
]

Esta é a escola que trata tudo o que a Cura declara fora do alcance dela — veneno, doença, maldição, petrificação. E ela é a única escola do livro cuja dificuldade *cresce sozinha enquanto ninguém faz nada*. Um corte espera. Um veneno não.

#quadro(titulo: [Profundidade da Aflição])[
Toda aflição — veneno, doença, maldição, petrificação, parasita — tem uma *Profundidade de 1 a 5*. Ela representa o quanto aquilo já se enraizou no corpo.

- *Venenos agudos* sobem 1 de Profundidade *por hora* não tratada.
- *Doenças, maldições e petrificações* sobem 1 *por dia*.
- A Profundidade *nunca cai sozinha*. Só um mago de Desintoxicação a reduz.

*Você só consegue purgar aflições de Profundidade igual ou menor ao seu Bônus de Rank.* Um Principiante (+1) resolve o que acabou de acontecer. Um Santo (+4) resolve o que já está ali há uma semana. Acima de 5, você está diante de algo que o mundo chama de incurável — e o mundo está quase sempre certo.
]

#quadro(titulo: [O Combo da Escola — Extração])[
Purgar não destrói a aflição. Ela sai do corpo e vai para algum lugar, e a partir do Intermediário esse lugar é *um frasco na sua mão*.

Aflições extraídas viram material: você pode aplicá-las em lâminas, em comida, em fechaduras, em outra pessoa. O curandeiro mais requisitado do continente é também, tecnicamente, o envenenador mais bem equipado dele.

É por isso que a Religião de Millis exige juramento e supervisão para formar um mago desta escola, e é por isso que existe um grimório trancado lá dentro que ninguém tem permissão de ler.
]

==== Progressão de PV e PM da Desintoxicação

#largo-inline[
#tbl(2, (left, center),
  [Rank alcançado], [PV ganho],
  [Principiante], [1d6 + 2],
  [Intermediário], [1d6 + 2],
  [Avançado], [1d6 + 3],
  [Santo], [1d8 + 3],
  [Rei], [1d8 + 3],
  [Imperador], [1d8 + 4],
)

#linebreak()
]

#quadro(titulo: [O atributo de conjuração é *Espírito*])[
*BC de Desintoxicação = Espírito + Bônus de Rank*, como Cura, Barreira e Invocação. Purgar não é entender o veneno — é recusá-lo.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Principiante (Desintoxicação)

#quadro(titulo: [◈ Maestria: Paladar])[
Tocando, cheirando ou provando qualquer substância, você sabe *exatamente* o que ela é: comida estragada, veneno de contato, sonífero, doença transmissível, ar contaminado, água podre. Você identifica a Profundidade de qualquer aflição que veja, inclusive em cadáveres.

E você é *imune a veneno mundano*. Um mago de Desintoxicação bebe primeiro na mesa do nobre, e é por isso que ele almoça em castelos.
]
]

#block(sticky: true)[*Feitiços Principiantes*]

#block(breakable: false)[
*_◆ Purgar_* — _2 PA | 2 PM | Toque_
Você não neutraliza. Você *expulsa* — e o corpo do alvo passa alguns segundos muito desagradáveis colocando para fora aquilo que não deveria estar lá.
- *Efeito:* remove uma aflição de *Profundidade 1* do alvo, seja ela veneno, doença, maldição ou petrificação incipiente. Não importa a origem, mágica ou natural.
- _Encantamento:_ _"O que entrou sem ser convidado, saia do jeito que quiser, mas saia. Purgar!"_
]

#block(breakable: false)[
*_Antídoto_* — _1 PA | 1 PM | Toque_
- *Efeito:* o alvo recebe *Vantagem* em testes de resistência contra veneno e doença por 1 hora, e se já estiver afetado, a Profundidade *para de subir* durante esse período. Não cura nada — compra tempo, que é a moeda desta escola.
]

#block(breakable: false)[
*_Água Limpa_* — _1 PA | 1 PM | Toque_
- *Efeito:* purifica até 20 litros de comida, água, ar ou terreno contaminado. Numa masmorra, num cerco ou num navio à deriva, este é o feitiço que mantém o grupo vivo — e ele custa 1 PM.
]

#block(breakable: false)[
*_Sangria_* — _1 PA | 2 PM | Toque_
- *Efeito:* você reduz em *1 a Profundidade* de uma aflição sem removê-la, ao custo de *2d6 de dano* ao alvo. É brutal, é arriscado, e é a única coisa que um Principiante pode fazer por alguém que já passou do ponto.
]

#block(breakable: false)[
*_Estômago de Ferro_* — _1 PA | 1 PM | Toque_
- *Efeito:* por 8 horas, o alvo pode comer e beber qualquer coisa sem consequência — carne estragada, água de poça, cogumelo desconhecido, o que estiver na despensa do inimigo.
]

#block(sticky: true)[*Talentos Principiantes* — _1 PA cada_]

- *Reserva do Purificador:* +2 PM por patamar seu nesta árvore. Comprável várias vezes, até o número de patamares.
- *Herborista:* você identifica, colhe e prepara ervas medicinais. Fora de combate, com uma hora e material, você reduz a Profundidade de uma aflição em 1 sem gastar PM. _(Isto *não* substitui o Boticário do Ladino: ele fabrica veneno, você fabrica remédio. Um mesmo personagem com os dois talentos vira um problema para o Mestre, e é assim que deve ser.)_
- *Mão que Não Contamina:* você não pode ser envenenado, infectado ou amaldiçoado por contato ao manusear aquilo que está tratando ou extraindo.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Intermediário (Desintoxicação)

#quadro(titulo: [◈ Maestria: Extração])[
Ao purgar qualquer aflição, você pode capturá-la em um frasco em vez de dissipá-la.

- Uma aflição extraída conserva a *Profundidade original* e permanece utilizável por um mês.
- Aplicada a uma arma, comida ou superfície, ela força um teste de resistência de *Vigor (CD 8 + seu BC)* na próxima criatura exposta. Falha: a criatura recebe a aflição, na Profundidade guardada.
- Você carrega até *Espírito* frascos por vez.

Esta Maestria é a razão pela qual a escola tem uma reputação incômoda. Purgar a praga de um vilarejo significa sair de lá com a praga na mochila.
]
]

#block(sticky: true)[*Feitiços Intermediários*]

#block(breakable: false)[
*_◆ Purga Profunda_* — _2 PA | 4 PM | Alcance 9m_
- *Efeito:* remove uma aflição de *Profundidade 2 ou menor*, ou reduz em 2 a Profundidade de qualquer aflição.
- Se você tiver a Maestria _Extração_, pode fazer isso à distância e ainda assim capturar o que saiu.
]

#block(breakable: false)[
*_Muro Estéril_* — _1 PA | 3 PM | Esfera de 9m_
- *Efeito:* por 1 hora, gás venenoso, esporo, praga, nuvem ácida e ar contaminado *não entram* na área. Aliados dentro respiram limpo. É a magia que se leva para dentro de uma masmorra de mortos-vivos e para dentro de uma cidade em quarentena.
]

#block(breakable: false)[
*_Torpor_* — _1 PA | 3 PM | Alcance 18m_
- *Efeito:* teste de *Vigor* (CD 8 + BC) ou o alvo fica *Envenenado* por 1 minuto — Desvantagem em ataques e testes de atributo. Sem dano. É a primeira agressão que a escola oferece, e ela é humilde de propósito.
]

#block(breakable: false)[
*_Diagnóstico de Praga_* — _1 PA | 2 PM | Alcance 18m_
- *Efeito:* você identifica todas as criaturas doentes, envenenadas ou amaldiçoadas num raio de 18m, a Profundidade de cada uma, e *quem foi a origem*. Resolve investigações inteiras num turno.
]

#block(sticky: true)[*Talentos Intermediários* — _1 PA cada_]

- *Frasco Estável:* suas extrações duram *um ano* em vez de um mês, e você carrega o dobro de frascos.
- *Purga Coletiva:* o _Purgar_ de rank Principiante passa a atingir até três criaturas adjacentes com uma conjuração.
- *Leitura de Sintoma:* olhando para alguém, você sabe se ele está afetado por algo *antes de os sintomas aparecerem*, incluindo maldições dormentes e venenos de efeito retardado.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Avançado (Desintoxicação)

#quadro(titulo: [◈ Maestria: Contra a Maré])[
- Você purga aflições de *Profundidade 3 ou menor*.
- A Profundidade de qualquer aflição *para de subir* em qualquer criatura a até 9 metros de você, enquanto você estiver consciente. O relógio para de correr só porque você chegou.
- *Magia Combinada* desbloqueada. Desintoxicação + Água gera uma névoa que purifica um vale inteiro; Desintoxicação + Vento espalha a purga por onde o ar chegar.
]
]

#block(sticky: true)[*Feitiços Avançados*]

#block(breakable: false)[
*_◆ Anular_* — _3 PA | 6 PM | Alcance 9m_
- *Efeito:* remove *uma condição de qualquer origem* do alvo: _Envenenado_, _Paralisado_, _Petrificado_, _Cego_, _Surdo_, _Amedrontado_, _Atordoado_, _Congelado_, _Em Chamas_, _Atolado_, _Desequilibrado_, _Marcado_. Também remove aflições de Profundidade 3 ou menor.
- *Este feitiço é a resposta do livro para metade das condições que as outras escolas aplicam* — e é por isso que ele está trancado atrás de um patamar que menos de 1 em 40.000 alcança.
]

#block(breakable: false)[
*_Quarentena_* — _2 PA | 5 PM | Esfera de 12m_
- *Efeito:* por 10 minutos, nada de natureza tóxica, infecciosa ou amaldiçoada *atravessa a borda da área*, nos dois sentidos. Você pode selar uma praga do lado de dentro ou do lado de fora — e a escolha entre as duas coisas costuma ser a cena mais difícil da campanha.
]

#block(breakable: false)[
*_Corrosão_* — _2 PA | 5 PM | Alcance 18m_
- *Efeito:* teste de *Vigor* (CD 8 + BC). Falha: *4d8* de dano ácido e o alvo fica _Envenenado_ por 1 minuto. Metal não-mágico exposto perde *2 de CA* permanentemente. Contra construtos e armaduras pesadas, o dano é dobrado.
]

#block(breakable: false)[
*_Sangue Trocado_* — _2 PA | 4 PM | Toque_
- *Efeito:* você transfere uma aflição de um alvo para *você mesmo*, reduzindo a Profundidade dela em 2 no processo. É a forma mais confiável de salvar alguém que já passou do seu alcance — e ela custa exatamente o que parece custar.
]

#block(sticky: true)[*Talentos Avançados* — _2 PA cada_]

- *Purificador de Guerra:* _Muro Estéril_ e _Quarentena_ passam a cobrir o dobro da área e a durar o dobro do tempo.
- *Extração Refinada:* aflições extraídas por você sobem *1 de Profundidade* ao serem aplicadas em outra criatura. Você melhora o que rouba.
- *Corpo Recusado:* você é imune a veneno e doença de qualquer origem, mágica ou não, e nunca sobe de Profundidade em nada.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Santo (Desintoxicação)

#quadro(titulo: [◈ Maestria: Estado Anulado])[
- Você purga aflições de *Profundidade 4 ou menor*.
- Toda criatura que você purgar fica *imune àquela aflição específica por 24 horas*. Curar a mesma praga duas vezes na mesma pessoa deixa de ser problema seu.
- Você anula *qualquer condição* com um toque, sem gastar PM, uma vez por turno. Não a sua — a dos outros.
]
]

#block(sticky: true)[*Feitiços Santos*]

#block(breakable: false)[
*_◆ Purificação_* — _4 PA | 11 PM | Esfera de 30m | Ritual_
Você não trata pessoas. Você trata *o lugar*.
- *Efeito:* toda criatura, água, solo, alimento e estrutura na área é purgada de aflições de *Profundidade 4 ou menor*. Terreno amaldiçoado deixa de ser amaldiçoado. Um poço envenenado volta a ser um poço.
- Um Santo de Desintoxicação salva um vilarejo inteiro numa manhã, e é por isso que templos brigam por eles.
- _Encantamento:_ _"Que a terra esqueça o que foi despejado nela. Que a água esqueça o que passou por ela. Que a carne esqueça o que entrou nela. Purificação!"_
]

#block(breakable: false)[
*_Selar a Maldição_* — _3 PA | 9 PM | Toque_
- *Efeito:* uma aflição que você *não consegue* purgar — Profundidade acima do seu alcance — fica *congelada* em Profundidade e sintomas por até um ano. O alvo não melhora, mas para de piorar.
- Isto é o que se faz por alguém que precisa sobreviver até você subir de patamar, ou até encontrarem quem consiga.
]

#block(sticky: true)[*Talento Santo* — _3 PA_]

- *A Mão que Não Erra:* uma vez por Descanso Longo, você purga uma aflição de Profundidade *um ponto acima* do seu limite. Você não deveria conseguir. Você conseguiu daquela vez.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Rei (Desintoxicação)

#quadro(titulo: [◈ Maestria: Veneno])[
A escola destranca o elemento secundário, e ele é o óbvio e o desconfortável: quem sabe tirar sabe *pôr*.

- Você conjura aflições diretamente, sem precisar de frasco nem de contato. Venenos criados por você começam na Profundidade igual a *metade do seu Bônus de Rank*, arredondado para cima.
- Seus efeitos de veneno ignoram *Resistência a veneno*, e o _Manto de Touki_ não protege contra nada que aja por dentro.
- Você purga aflições de *Profundidade 5 ou menor* — o teto do que o mundo considera tratável.
]
]

#block(sticky: true)[*Feitiços Reais*]

#block(breakable: false)[
*_◆ Sopro Podre_* — _5 PA | 13 PM | Cone de 18m_
- *Efeito:* teste de *Vigor* com *Desvantagem* (CD 8 + BC). Falha: *10d8* de dano de veneno, condição _Envenenado_ por 10 minutos, e uma aflição de Profundidade 3 que continua subindo. Sucesso: metade e nada mais.
- Não funciona em construtos, mortos-vivos e criaturas que não respiram nem metabolizam.
]

#block(breakable: false)[
*_Toque do Fim_* — _4 PA | 10 PM | Toque_
- *Efeito:* teste de *Vigor* (CD 8 + BC). Falha: o alvo recebe uma aflição de *Profundidade 4* à sua escolha — cegueira progressiva, paralisia ascendente, febre, apodrecimento. Ela sobe 1 por dia e mata quando chega a 6.
- *Só um mago de Desintoxicação de patamar igual ou superior ao seu consegue removê-la.* É a magia com que se assassina um rei sem estar no reino.
]

#block(sticky: true)[*Talento Rei* — _3 PA_]

- *Duas Faces:* quando você purgar uma aflição de uma criatura, pode gastar 1 Ação para aplicá-la imediatamente em outra criatura visível a até 9m, sem frasco e sem teste seu. O que sai de um entra no outro no mesmo movimento.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Imperador (Desintoxicação)

#quadro(titulo: [◈ Maestria: O Corpo Limpo])[
- Você purga *qualquer* aflição de Profundidade 5 ou menor sem rolagem, sem ritual e sem tempo — inclusive petrificação completa, maldições hereditárias e parasitas mágicos.
- Você é permanentemente imune a veneno, doença, maldição, petrificação e a qualquer efeito que altere seu corpo contra a sua vontade.
- Uma vez por turno, você conjura uma magia de Desintoxicação de rank *Avançado ou inferior* em Conjuração Silenciosa *sem gastar Ação*.
]
]

#block(sticky: true)[*Feitiços Imperiais*]

#block(breakable: false)[
*_◆ O Mundo Sem Praga_* — _6 PA | 22 PM | Raio de 3 km | Ritual (6 Ações)_
- *Efeito:* toda aflição de Profundidade 5 ou menor *deixa de existir* dentro do raio: em pessoas, em animais, na água, no solo, no ar e nas paredes. Uma cidade em peste acorda saudável. Um campo salgado volta a dar colheita.
- Efeito narrativo permanente. Reinos mandam emissários atrás de quem faz isso, e alguns mandam assassinos.
]

#block(breakable: false)[
*_Nome do Veneno_* — _5 PA | 18 PM | Alcance 45m_
- *Efeito:* você declara em voz alta o nome verdadeiro de uma aflição — e ela obedece. Escolha uma criatura afetada por qualquer coisa: você *transfere a aflição inteira*, com Profundidade intacta, para outra criatura visível de sua escolha, sem teste de resistência nenhum.
- Contra criaturas de rank Deus, exige teste de Vigor com Desvantagem.
]

#block(sticky: true)[*Talento Imperador* — _4 PA_]

- *Nada Entra:* todos os aliados a até 18 metros de você compartilham a sua imunidade a veneno, doença e maldição enquanto permanecerem ao seu alcance. Um grupo com um Imperador de Desintoxicação atravessa o Continente Demônio como quem atravessa um jardim.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Desintoxicação)

_Narrativo. Não se compra._

#quadro(titulo: [◈ A Doença da Pedra Mágica])[
O grimório de Desintoxicação de rank Deus *existe*. Está no Grande Templo de Millis, catalogado, guardado e vigiado.

Ninguém no mundo consegue lê-lo.

Ele é o único registro conhecido de uma magia capaz de curar a *Doença da Pedra Mágica* — a aflição de Profundidade 6, aquela que transforma carne viva em minério lentamente e que nenhum patamar deste livro alcança. Todo mago de Desintoxicação do mundo sabe que o livro está lá. Nenhum deles conseguiu passar do primeiro verso.

Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o fim de uma campanha inteira, e o mundo deve mudar por causa disso.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Magia de Barreira

Todas as outras escolas de magia fazem alguma coisa acontecer. A Barreira faz alguma coisa *parar de poder acontecer*.
]

Ela não ergue paredes — isso é Terra, e Terra faz melhor. O que a Barreira faz é *distorcer a mana dentro de um espaço finito* até que as regras ali dentro sejam diferentes das do resto do mundo. Magia não ativa. Mana não regenera. Coisas não entram. Coisas não saem.

É a anti-magia do livro, e ela é medida em *regras*, não em dano nem em PV.

#quadro(titulo: [A Fraqueza Estrutural])[
Barreiras distorcem mana. *Aço não é mana.*

Nenhuma barreira desta escola detém um espadachim. Um Deus da Espada atravessa o seu círculo caminhando, e a única coisa que você conseguiu foi impedir que ele fosse curado enquanto o fazia.

Isso é a identidade da escola, não um defeito a corrigir: *a Barreira é a resposta absoluta ao pilar da Magia e quase nada contra o pilar do Corpo.* Ela existe porque, num mundo onde um Imperador de Fogo apaga uma região, alguém precisou aprender a desligar isso.
]

#block(breakable: false)[
==== As Regras da Escola

#quadro(titulo: [Selado])[
Toda criatura dentro de uma barreira sua fica *Selada*.

*Efeito base:* ela não consegue conjurar magias de rank *superior ao seu Bônus de Rank* — nem por Conjuração Silenciosa, nem por Encantamento Encurtado, nem com Maestria nenhuma. O cântico simplesmente não pega.

Um Santo de Barreira (+4) desliga tudo acima do rank Santo. Um Imperador (+6) desliga tudo, ponto.
]
]

#quadro(titulo: [Fluxo Interrompido])[
Dentro de uma barreira sua, você declara ao erguê-la *uma* das duas condições, e ela vale para todos lá dentro:

- *Estagnação* — ninguém recupera PM por meio nenhum, e Descansos não funcionam.
- *Fonte* — os seus aliados recuperam *1 PM por turno* e os inimigos não recuperam nada.

Esta é a única mecânica do livro que ataca a *reserva* em vez do corpo — e contra um mago, a reserva _é_ o corpo.
]

==== Progressão de PV e PM da Barreira

#largo-inline[
#tbl(2, (left, center),
  [Rank alcançado], [PV ganho],
  [Principiante], [1d6 + 2],
  [Intermediário], [1d6 + 3],
  [Avançado], [1d8 + 3],
  [Santo], [1d8 + 3],
  [Rei], [1d10 + 4],
  [Imperador], [1d10 + 4],
)

#linebreak()
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Principiante (Barreira)

#quadro(titulo: [◈ Maestria: O Primeiro Círculo])[
Você desenha barreiras. Erguer uma custa *1 Ação e o PM da magia*, e ela é *uma esfera* centrada num ponto à sua escolha.

- Você sustenta *uma* barreira por vez, e ela dura enquanto você estiver consciente e a até 30 metros dela.
- Toda barreira sua aplica *Selado* e a condição de *Fluxo Interrompido* que você escolher.
- Você *vê mana*. Barreiras alheias, encantamentos, itens mágicos e criaturas invisíveis por magia aparecem para você como contorno luminoso, sem custo e sem Ação.
]
]

#block(sticky: true)[*Feitiços Principiantes*]

#block(breakable: false)[
*_◆ Círculo Menor_* — _2 PA | 3 PM | Esfera de 6m_
Um anel de luz pálida se assenta no chão e sobe como uma cúpula translúcida. Não é sólida. Você passa a mão através dela e não sente nada — e é exatamente isso que assusta o mago que está do lado de fora.
- *Efeito:* barreira de 6m de raio por 1 minuto. Criaturas dentro ficam _Seladas_. Você escolhe _Estagnação_ ou _Fonte_.
- _Encantamento:_ _"Aqui dentro a regra é outra. Eu escrevi a regra. Círculo Menor!"_
]

#block(breakable: false)[
*_Recusa_* — _1 PA | 2 PM | Alcance 18m_
- *Efeito:* 1 Reação, quando uma criatura conjurar uma magia de rank *Principiante*. A magia falha e o PM dela se perde. Contra rank Intermediário, ela ainda acontece, mas com metade dos dados.
]

#block(breakable: false)[
*_Selo de Objeto_* — _1 PA | 1 PM | Toque_
- *Efeito:* um objeto mágico, arma encantada ou item amaldiçoado fica *inerte* por 1 hora. Não funciona, não brilha, não responde. Isso resolve mais problemas de masmorra do que qualquer feitiço de dano.
]

#block(breakable: false)[
*_Anteparo_* — _1 PA | 2 PM | Alcance 9m_
- *Efeito:* uma placa de mana de 3m × 3m surge no ar por 3 turnos. Ela *não* para objetos físicos — para *magia*: qualquer feitiço de rank Principiante que a atravesse é anulado, e de rank Intermediário tem os dados reduzidos à metade.
]

#block(breakable: false)[
*_Leitura de Trama_* — _1 PA | 1 PM | Alcance 18m_
- *Efeito:* você identifica exatamente qual magia está ativa numa criatura, objeto ou local, de qual escola, de qual rank, e *quanto tempo falta*. Também revela armadilhas mágicas e barreiras alheias.
]

#block(sticky: true)[*Talentos Principiantes* — _1 PA cada_]

- *Reserva do Selador:* +2 PM por patamar seu nesta árvore. Comprável várias vezes, até o número de patamares.
- *Círculo Portátil:* a sua barreira passa a se *mover com você*, centrada no seu corpo, em vez de ficar fixa num ponto.
- *Mão de Giz:* você desenha círculos permanentes em superfícies. Leva 1 hora e o dobro do PM, mas a barreira fica lá depois que você for embora — até alguém apagar o desenho.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Intermediário (Barreira)

#quadro(titulo: [◈ Maestria: Interdição])[
- Magias conjuradas *dentro* de uma barreira sua custam *+2 PM* para quem não for seu aliado. Um mago cercado por você fica seco antes de ficar ferido.
- Você sustenta *duas* barreiras simultaneamente.
- Você pode escolher até *Espírito* criaturas para quem a sua barreira simplesmente *não se aplica* — nem o Selado, nem a Estagnação, nem nada.
]
]

#block(sticky: true)[*Feitiços Intermediários*]

#block(breakable: false)[
*_◆ Domo_* — _2 PA | 5 PM | Esfera de 12m_
- *Efeito:* barreira de 12m por 10 minutos. Além do _Selado_ e do _Fluxo Interrompido_, ela impede a *passagem de efeitos mágicos* através da superfície nos dois sentidos: magia de fora não entra e magia de dentro não sai. Criaturas e flechas atravessam normalmente.
]

#block(breakable: false)[
*_Amarra_* — _1 PA | 4 PM | Alcance 18m_
- *Efeito:* teste de *Espírito* (CD 8 + BC). Falha: por 1 minuto, o alvo *não pode conjurar magia alguma*, de rank nenhum. Ele pode andar, correr e bater — só não pode conjurar. É a coleira, e é a magia mais odiada do mundo pelos magos.
]

#block(breakable: false)[
*_Espelho de Mana_* — _1 PA | 4 PM | Pessoal_
- *Efeito:* 1 Reação. A próxima magia de alvo único de rank *Intermediário ou inferior* dirigida a você é *devolvida ao conjurador*, com a CD original dele.
]

#block(breakable: false)[
*_Silêncio de Mana_* — _1 PA | 3 PM | Esfera de 9m_
- *Efeito:* por 1 minuto, criaturas na área não conseguem *iniciar* conjuração — quem já estava recitando pode terminar. Novos cânticos não pegam.
]

#block(sticky: true)[*Talentos Intermediários* — _1 PA cada_]

- *Trama Fina:* _Recusa_ passa a anular magias de rank Intermediário por completo.
- *Barreira Persistente:* as suas barreiras continuam de pé por 1 minuto depois de você ficar inconsciente ou sair do alcance.
- *Peneira:* você declara *uma* escola de magia à qual a sua barreira não se aplica. Útil quando o grupo tem um mago e você não quer selá-lo junto.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Avançado (Barreira)

#quadro(titulo: [◈ Maestria: Selo de Conjuração])[
- O _Selado_ das suas barreiras passa a impor *Desvantagem* em todos os testes de resistência contra as suas magias, para quem estiver dentro.
- Criaturas dentro que *tentarem* conjurar acima do limite sofrem *2d10 de dano psíquico* e perdem a Ação. A mana volta contra elas.
- *Magia Combinada* desbloqueada. Barreira + Terra gera uma prisão que é física e mágica ao mesmo tempo; Barreira + Cura gera um leito onde ninguém piora.
]
]

#block(sticky: true)[*Feitiços Avançados*]

#block(breakable: false)[
*_◆ Recinto_* — _3 PA | 7 PM | Esfera de 18m | Sustentada_
- *Efeito:* barreira de 18m por 1 hora. Além de tudo o que uma barreira faz, ela *impede entrada e saída física* de criaturas: a superfície vira sólida para carne, mas continua atravessável por objetos inanimados.
- A barreira tem *120 PV* contra ataques físicos. Um Deus da Espada leva dois turnos para sair. Dois turnos é muito tempo.
]

#block(breakable: false)[
*_Dissipar_* — _2 PA | 6 PM | Alcance 27m_
- *Efeito:* encerre *um* efeito mágico ativo de rank *Avançado ou inferior*: uma magia sustentada, uma barreira alheia, um encantamento, uma invocação, uma condição de origem mágica. Sem teste, sem disputa.
]

#block(breakable: false)[
*_Campo Nulo_* — _2 PA | 6 PM | Esfera de 12m_
- *Efeito:* por 3 turnos, *nenhuma magia funciona dentro da área*, incluindo as suas. Magias sustentadas de fora são suspensas enquanto durar; invocações desaparecem; itens mágicos ficam inertes.
- É a coisa mais próxima de um botão de desligar que este livro tem, e por isso ela dura três turnos e não mais.
]

#block(breakable: false)[
*_Redoma_* — _2 PA | 5 PM | Alcance 9m_
- *Efeito:* uma esfera de 1,5m encapsula *uma* criatura. Ela fica totalmente isolada: não afeta nada de fora, nada de fora a afeta, e ela não pode conjurar. A redoma tem 60 PV. Serve para prender um inimigo perigoso ou para *guardar um aliado moribundo* até o curandeiro chegar.
]

#block(sticky: true)[*Talentos Avançados* — _2 PA cada_]

- *Trama Densa:* todas as suas barreiras ganham o dobro de PV.
- *Selo Cirúrgico:* _Amarra_ deixa de permitir teste de resistência contra criaturas de rank inferior ao seu.
- *Duas Mãos, Três Círculos:* você sustenta *três* barreiras simultaneamente.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Santo (Barreira)

#quadro(titulo: [◈ Maestria: Espaço Recusado])[
- Suas barreiras impedem *teleporte, invocação, passagem dimensional e qualquer forma de aparecer ou desaparecer* dentro da área. Nada entra que não tenha caminhado até lá.
- Você sustenta barreiras sem limite de distância, desde que esteja no mesmo continente.
- Você *vê e lê* qualquer barreira, encantamento ou selo do mundo apenas olhando, incluindo quem o fez e como desfazê-lo.
]
]

#block(sticky: true)[*Feitiços Santos*]

#block(breakable: false)[
*_◆ Interdito_* — _4 PA | 12 PM | Esfera de 45m | Ritual_
- *Efeito:* por 24 horas, dentro da área: ninguém conjura acima do rank Santo, ninguém recupera PM, ninguém teleporta, nenhuma invocação existe, e todo item mágico de rank Rei ou inferior fica inerte.
- Aliados que você designar ficam isentos de tudo.
- É o feitiço com que se prende um Imperador de magia numa sala, e é o motivo pelo qual Reis contratam magos desta escola para as próprias masmorras.
]

#block(breakable: false)[
*_Recusar o Mundo_* — _3 PA | 10 PM | Pessoal_
- *Custo:* 1 Reação.
- *Efeito:* você anula completamente *uma magia dirigida a você ou a um aliado a 18m*, de rank *Rei ou inferior*, sem teste e sem disputa. Uma vez por combate.
- Contra rank Imperador, o dano é reduzido à metade e as condições não se aplicam.
]

#block(sticky: true)[*Talento Santo* — _3 PA_]

- *O Selo Não Cede:* suas barreiras não podem ser destruídas por _Dissipar_, _Anulação_ ou equivalente de patamar inferior ao seu, e criaturas presas dentro não podem sair por meios mágicos de nenhum patamar.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Rei (Barreira)

#quadro(titulo: [◈ Maestria: Anulação])[
A escola destranca o elemento secundário, e ele é a negação pura.

- Gastando *1 Reação e 4 PM*, você *anula qualquer magia* de rank *Imperador ou inferior* no instante em que ela é conjurada, em qualquer lugar dentro de 45 metros. Sem teste, sem disputa, sem exceção.
- Você pode fazer isso um número de vezes por combate igual ao seu *Espírito*.
- O conjurador perde o PM e as Ações gastas.
]
]

#block(sticky: true)[*Feitiços Reais*]

#block(breakable: false)[
*_◆ O Círculo do Rei_* — _5 PA | 16 PM | Esfera de 300m | Ritual_
- *Efeito:* por uma semana, a região inteira obedece a *três regras* que você declara ao erguer, escolhidas desta lista:
  - Nenhuma magia acima de um rank que você escolher funciona aqui.
  - Ninguém recupera PM aqui.
  - Nada teleporta, invoca ou atravessa para cá.
  - Criaturas de um tipo que você nomear não conseguem entrar.
  - Nada morre aqui — criaturas a 0 PV ficam inconscientes indefinidamente.
- Cidades pagam fortunas por isso. Cercos são vencidos e perdidos por causa disso.
]

#block(breakable: false)[
*_Prisão Absoluta_* — _4 PA | 14 PM | Alcance 45m_
- *Efeito:* teste de *Espírito* com *Desvantagem* (CD 8 + BC). Falha: a criatura é selada numa redoma de 3m por *1 hora*. Ela não age, não conjura, não é afetada por nada e não afeta nada. Não pode ser libertada por dano — apenas por você, ou por _Dissipar_ de rank Imperador.
]

#block(sticky: true)[*Talento Rei* — _3 PA_]

- *Retorno:* quando você anular uma magia com a Maestria _Anulação_, o conjurador sofre *dano psíquico igual ao PM que ele gastou*, e não pode conjurar aquela mesma magia novamente até o fim do combate.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Imperador (Barreira)

#quadro(titulo: [◈ Maestria: Lei Local])[
- O _Selado_ das suas barreiras passa a valer contra *todo rank*, incluindo Deus.
- Você declara, ao erguer qualquer barreira, *uma regra arbitrária* que passa a valer dentro dela. Ela precisa ser uma proibição, não uma criação — _"ninguém aqui pode voar"_, _"nada aqui pode ser curado"_, _"nenhuma arma aqui pode cortar"_, _"ninguém aqui pode mentir"_.
- Uma vez por turno, você ergue ou desfaz uma barreira *sem gastar Ação*.
]
]

#block(sticky: true)[*Feitiços Imperiais*]

#block(breakable: false)[
*_◆ Mundo Fechado_* — _6 PA | 24 PM | Esfera de 1,5 km | Ritual (6 Ações)_
- *Efeito:* por 1 hora, dentro da esfera, *nenhuma magia de nenhum rank funciona para ninguém além de você e de quem você designar*. Invocações se desfazem. Itens mágicos morrem. Barreiras alheias caem. Voo mágico cessa e quem estava no ar cai.
- Magos de rank Imperador dentro desta área são pessoas comuns com muito PM e nada para fazer com ele.
- _Encantamento:_ _"Eu não apago a magia do mundo. Eu recorto um pedaço do mundo onde ela nunca foi convidada. Mundo Fechado!"_
]

#block(breakable: false)[
*_Selo do Nome_* — _5 PA | 20 PM | Toque_
- *Efeito:* você sela *permanentemente* uma única magia, técnica ou habilidade de uma criatura tocada — escolhida por você. Ela nunca mais consegue usar aquilo, até que um mago de Barreira de patamar igual ou superior desfaça.
- Isto não é uma magia de combate. É uma sentença, e mesas inteiras já se organizaram em torno de quem foi selado por quem.
]

#block(sticky: true)[*Talento Imperador* — _4 PA_]

- *Barreira Viva:* as suas barreiras persistem *mesmo depois da sua morte*, até serem dissipadas por um Imperador ou por rank Deus. Há barreiras de pé no Mundo de Seis Faces cujos autores ninguém lembra.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Barreira)

_Narrativo. Não se compra._

#quadro(titulo: [◈ O Silêncio Permanente])[
_Mundo Fechado_, a marca do Imperador, cancela toda magia numa esfera por uma hora. O patamar Divino remove o limite de tempo — e o de espaço.

Existem regiões no Mundo de Seis Faces, do tamanho de um vale ou de um pequeno reino, onde magia simplesmente não funciona, para ninguém, há gerações. Nenhum mago vivo hoje sabe desfazer essas zonas; a única coisa que se sabe é que alguém, um dia, as fez — e escolheu não voltar para desfazê-las.

*Barreira Viva*, o talento do Imperador, já avisa que as barreiras deste mago sobrevivem à própria morte dele. No patamar Divino, elas sobrevivem à própria escola: selar magia deixa de ser um efeito e passa a ser uma *regra do lugar*.

Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É uma cicatriz permanente no mapa, e o mundo deve mudar por causa disso.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Magia de Invocação

A menor lista de feitiços do mundo, e a mais difícil de aprender.
]

Invocação não conjura efeitos: ela *negocia com coisas que já existem*. Você desenha um círculo, paga o preço, e algo atravessa. Feras invocadas têm intelecto próprio e vontade própria. Espíritos são consciências alojadas em corpos artificiais, e a fronteira entre invocar um e construir um é fina o bastante para gerar guerras teológicas em Millis.

Por isso esta árvore tem *poucas magias e muitos Pactos*. O que você compra aqui não são feitiços — são *relações*.

#quadro(titulo: [O Subsistema: Círculo e Pacto])[
*1. O Círculo.* Invocar exige um círculo mágico desenhado, não apenas um cântico. Desenhá-lo custa *10 minutos* fora de combate, ou *1 Ação e o dobro do PM* no meio da luta (traçado às pressas, com o pé, no sangue, no que tiver). Um círculo desenhado com calma pode ser reutilizado.

*2. O Pacto.* Cada criatura que você pode invocar é um *Pacto* comprado com PA, como se fosse uma magia. Você começa com *1* e ganha mais com os patamares.

*3. A Vontade.* O invocado *age no próprio turno*, com Iniciativa própria, e obedece ordens gerais sem que você gaste nada. Ordens *específicas* — "ataque aquele ali", "pegue isso", "aguente três turnos" — custam *1 Ação sua*.

*4. O Preço.* Se você ficar inconsciente, o Pacto se desfaz e o invocado vai embora. Se você *maltratar* um invocado, o Mestre tem o direito de recusá-lo na próxima vez. Eles se lembram.
]

==== Progressão de PV e PM da Invocação

#largo-inline[
#tbl(3, (left, center, center),
  [Rank alcançado], [PV ganho], [Pactos],
  [Principiante], [1d6 + 2], [1],
  [Intermediário], [1d6 + 2], [2],
  [Avançado], [1d6 + 3], [3],
  [Santo], [1d8 + 3], [4],
  [Rei], [1d8 + 4], [5],
  [Imperador], [1d10 + 4], [6],
)

#linebreak()
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Principiante (Invocação)

#quadro(titulo: [◈ Maestria: O Primeiro Círculo])[
Você desenha círculos e mantém *1 Pacto* ativo por vez.

- Um invocado permanece por *1 hora* ou até ser reduzido a 0 PV, quando volta para onde veio e não pode ser chamado de novo até o próximo Descanso Longo.
- Invocados têm *PV = 10 × o seu Bônus de Rank* e usam o seu *BC* para acertar e para CD.
- Você entende e é entendido por qualquer criatura com quem tenha Pacto, sem idioma comum.
]
]

#block(sticky: true)[*Feitiço Principiante*]

#block(breakable: false)[
*_◆ Chamado_* — _2 PA | 3 PM | Círculo_
- *Efeito:* invoca uma criatura com quem você tenha Pacto. Ela surge no círculo e age a partir do próximo turno.
- _Encantamento:_ _"Eu desenhei o caminho e paguei a passagem. Venha, e o que for combinado será cumprido. Chamado!"_
]

*Pactos Principiantes* — _1 PA cada_

- *Lobo Cinzento* — 3d8 mordida, deslocamento 12m, rastreia por cheiro com Vantagem. Ataca em conjunto: se outro aliado estiver adjacente ao alvo, ele derruba.
- *Corvo Mensageiro* — frágil (metade dos PV), voa 18m, e você *vê e ouve pelo que ele vê e ouve* a qualquer distância. Ele não luta. Ele resolve metade dos problemas de uma campanha.
- *Salamandra* — 2d8 mordida + 2d6 ígneo, imune a fogo, aplica _Em Chamas_. Acende fogueiras, derrete fechaduras e é do tamanho de um gato.
- *Espírito de Pedra* — 3d6 soco, *Resistência a dano físico*, Deslocamento 6m. Não recua nunca e não sente dor. Serve para segurar uma porta.

#block(sticky: true)[*Talentos Principiantes* — _1 PA cada_]

- *Reserva do Invocador:* +2 PM por patamar seu nesta árvore. Comprável várias vezes, até o número de patamares.
- *Traço Rápido:* desenhar um círculo em combate passa a custar o PM normal, sem o dobro.
- *Círculo Guardado:* você carrega um círculo pré-desenhado em pergaminho, couro ou na palma da mão. Usá-lo dispensa o tempo de desenho, e ele aguenta três invocações antes de se apagar.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Intermediário (Invocação)

#quadro(titulo: [◈ Maestria: Vínculo])[
- *2 Pactos* ativos ao mesmo tempo.
- Você *vê pelos olhos* de qualquer invocado seu, gastando 1 Ação, a qualquer distância. Enquanto faz isso, seu corpo fica _Cego_.
- Ordens específicas passam a custar *1 Ação para todos os seus invocados de uma vez*, e não uma Ação por criatura.
]
]

*Pactos Intermediários* — _1 PA cada_

- *Urso das Cavernas* — 4d10 garra, Grande, empurra 3m a cada acerto. Absorve dano por você e não pergunta por quê.
- *Serpente de Névoa* — ataque com veneno (Vigor ou _Envenenado_), move-se por qualquer fresta, e é invisível em terreno enevoado.
- *Espírito do Vento* — não ataca. Concede *Voo* a um aliado que ele toque, 18m, enquanto durar a invocação. Um invocador Intermediário faz o grupo inteiro voar em três turnos.
- *Grifo* — voa 24m, 3d10 garra, e *carrega uma pessoa*. É a única forma de transporte rápido disponível neste livro fora do rank Santo de Vento.

#block(sticky: true)[*Feitiço Intermediário*]

#block(breakable: false)[
*_◆ Retorno_* — _2 PA | 2 PM | Alcance 90m_
- *Efeito:* um invocado seu volta imediatamente para o círculo, ou é dispensado. Se dispensado antes de chegar a 0 PV, ele pode ser chamado de novo neste mesmo dia.
]

#block(sticky: true)[*Talentos Intermediários* — _1 PA cada_]

- *Sangue no Círculo:* você pode pagar o PM de uma invocação com *PV, na razão de 2 PV por 1 PM*. Invocadores desesperados são reconhecíveis pelas mãos.
- *Vontade Firme:* invocados seus são imunes a _Amedrontado_ e não podem ser dominados, expulsos ou dissipados por efeito de patamar inferior ao seu.
- *Companhia:* um invocado à sua escolha permanece *8 horas* em vez de 1. Ele vira, na prática, um membro do grupo.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Avançado (Invocação)

#quadro(titulo: [◈ Maestria: Círculo Rápido])[
- *3 Pactos* ativos.
- Invocar deixa de exigir círculo desenhado: você traça no ar com a mão, gastando *1 Ação*.
- Invocados seus passam a ter *PV = 15 × o seu Bônus de Rank* e recebem o seu *Bônus de Rank no dano*.
- *Magia Combinada* desbloqueada. Invocação + Barreira prende o invocado num recinto onde só ele pode agir; Invocação + Terra dá a ele um corpo de pedra que se refaz.
]
]

*Pactos Avançados* — _2 PA cada_

- *Quimera* — três cabeças, três ataques por turno de 4d8 cada, um deles com sopro elemental à sua escolha ao invocar.
- *Espírito Antigo* — não luta. Responde *uma pergunta por invocação* sobre qualquer coisa que tenha acontecido antes de você nascer, e a resposta é verdadeira, ainda que enviesada.
- *Golem de Guerra* — Enorme, 6d8 por golpe, *Resistência a todo dano físico*, Deslocamento 6m. Não pode ser movido nem derrubado. É uma parede que anda.
- *Alcateia* — invoca *cinco* lobos de uma vez, cada um com um quarto dos PV normais, agindo na mesma Iniciativa. Some se você precisar cobrir terreno.

#block(sticky: true)[*Feitiço Avançado*]

#block(breakable: false)[
*_◆ Substituição_* — _3 PA | 6 PM | Alcance 18m_
- *Custo:* 1 Reação, quando você ou um aliado for alvo de um ataque.
- *Efeito:* um invocado seu *troca de lugar* com o alvo instantaneamente e recebe o ataque no lugar dele. É a razão mecânica de o invocador sobreviver a emboscadas.
]

#block(sticky: true)[*Talentos Avançados* — _2 PA cada_]

- *Duas Vidas:* um invocado reduzido a 0 PV pode ser chamado de novo após um *Descanso Curto*, em vez de Longo.
- *Empatia Absoluta:* você compartilha os sentidos de todos os seus invocados ao mesmo tempo, sem gastar Ação e sem ficar cego.
- *Pacto Emprestado:* um aliado pode comandar um dos seus invocados com as próprias Ações, sem que você gaste nada.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Santo (Invocação)

#quadro(titulo: [◈ Maestria: Corpos Artificiais])[
Você compreendeu o que um Espírito realmente é: uma consciência alojada num corpo que alguém fabricou. E se alguém fabricou, você pode fabricar.

- *4 Pactos* ativos.
- Você *constrói o corpo* de um invocado à sua escolha entre sessões: escolha duas melhorias permanentes — +50% de PV, +1 ataque por turno, um sentido especial, resistência a um tipo de dano, ou voo.
- Invocados seus não desaparecem ao chegar a 0 PV. O *corpo* quebra; a consciência volta e pode receber um corpo novo depois de um Descanso Longo.
]
]

*Pactos Santos* — _3 PA cada_

- *Espírito da Chama Antiga* — 8d8 de dano ígneo em área de 6m por turno, sem gastar as suas Ações. Não obedece bem: role Espírito (CD 15) a cada turno, ou ele escolhe o próprio alvo.
- *Sentinela de Aço* — Enorme, 100 PV além do normal, intercepta ataques contra aliados adjacentes automaticamente. Não ataca.
- *Mensageiro do Alto* — atravessa continentes numa hora, entrega qualquer coisa a qualquer pessoa que você já tenha visto, e volta.

#block(sticky: true)[*Feitiço Santo*]

#block(breakable: false)[
*_◆ Círculo de Convocação_* — _4 PA | 12 PM | Ritual (4 Ações)_
- *Efeito:* invoca *todos* os seus Pactos de uma vez, no mesmo turno, num círculo de 12m. Uma vez por Descanso Longo.
]

#block(sticky: true)[*Talento Santo* — _3 PA_]

- *O Nome Verdadeiro:* você aprende o nome verdadeiro de um invocado. Ele passa a obedecer *qualquer* ordem sem teste, inclusive ordens suicidas — e passa a te odiar em silêncio, o que o Mestre é encorajado a usar.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Rei (Invocação)

#quadro(titulo: [◈ Maestria: Círculo Permanente])[
- *5 Pactos* ativos.
- Um invocado à sua escolha fica *permanentemente* ao seu lado, sem custo de PM e sem limite de tempo. Ele come, dorme, conversa e tem opinião.
- Círculos que você desenhar em pedra ou metal duram *para sempre* e podem ser usados por outras pessoas, se souberem o nome certo.
]
]

*Pactos Reais* — _4 PA cada_

- *Fera Ancestral* — Gigantesca. 12d10 por golpe, três golpes por turno, voa, e respira um elemento à sua escolha em cone de 18m. Ela concorda em vir. Ela não concorda em ficar.
- *Espírito do Contrato* — não luta e não pode ser ferido. Enquanto existir, *qualquer acordo verbal feito na presença dele é vinculante*: quem quebrar sofre 10d10 de dano psíquico, onde quer que esteja no mundo.

#block(sticky: true)[*Feitiço Real*]

#block(breakable: false)[
*_◆ Troca de Lugares_* — _5 PA | 12 PM | Alcance ilimitado_
- *Efeito:* você e um invocado seu *trocam de posição instantaneamente*, em qualquer lugar do mundo. Se ele estiver do outro lado do continente, você está agora.
]

#block(sticky: true)[*Talento Rei* — _3 PA_]

- *Legião:* ao invocar, você pode chamar *três cópias* de um mesmo Pacto de patamar Avançado ou inferior, pagando o PM uma vez.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Imperador (Invocação)

#quadro(titulo: [◈ Maestria: O Grande Círculo])[
- *6 Pactos* ativos, e todos podem estar em campo ao mesmo tempo.
- Invocar deixa de custar Ação: você chama *um* invocado por turno de graça.
- Seus invocados usam *os seus PV* como reserva de emergência: quando um deles chegaria a 0, você pode transferir dano para si mesmo e mantê-lo de pé.
]
]

#block(sticky: true)[*Feitiços Imperiais*]

#block(breakable: false)[
*_◆ O Chamado que Não se Recusa_* — _6 PA | 22 PM | Ritual (6 Ações)_
- *Efeito:* você invoca uma criatura *com quem não tem Pacto* — qualquer criatura de rank Rei ou inferior que você já tenha visto, viva ou morta, em qualquer lugar do mundo. Ela é arrancada de onde estava.
- Ela faz teste de *Espírito* com Desvantagem (CD 8 + BC). Se falhar, obedece por 1 minuto. Se passar, *ela vem mesmo assim, furiosa, e o Mestre decide o que ela faz.*
- Este é o feitiço mais perigoso deste livro para quem o conjura, e é assim que ele deve ser jogado.
]

#block(breakable: false)[
*_Corpo Emprestado_* — _5 PA | 18 PM | Pessoal_
- *Efeito:* por 10 minutos, você *transfere a sua consciência* para o corpo de um invocado. Você usa os PV, os ataques e os sentidos dele; o seu corpo fica inconsciente e protegido pelo círculo. Se o corpo emprestado morrer, você volta com 1 PV e um nível de _Exaustão_.
]

#block(sticky: true)[*Talento Imperador* — _4 PA_]

- *Ninguém Chega Sozinho:* todos os seus invocados em campo recebem *+2 na CA, +2 no acerto e imunidade a efeitos de dissipação* de patamar Rei ou inferior. Um Imperador de Invocação não entra em lugar nenhum sozinho — ele entra com um exército pequeno e muito bem tratado.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Invocação)

_Narrativo. Não se compra._

#quadro(titulo: [◈ O Pacto Que Não Deveria Existir])[
A Magia de Invocação nunca foi sobre feitiços — é sobre relações. O patamar Divino é a relação definitiva: um Pacto firmado com algo que, por definição, não deveria conseguir ser vinculado por ninguém. Um Superd ancião. Um espírito elementar velho o bastante para ter nome próprio em três idiomas mortos. Ou, segundo um único registro que o Grande Templo de Millis se recusa a confirmar ou negar, algo maior que isso.

*Ninguém Chega Sozinho*, a marca do Imperador, já entra em qualquer lugar com um pequeno exército de invocados fiéis. Quem chega ao Divino nunca mais precisa perguntar se alguém vai atender ao chamado — porque o que foi pactuado *não pode recusar*, e a dívida corre nos dois sentidos.

Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o tipo de aliança que campanhas inteiras giram em torno de honrar ou de trair, e o mundo deve mudar por causa disso.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

== A Árvore do Corpo

Antes de qualquer estilo específico, três sistemas governam *todos* os guerreiros do Mundo de Seis Faces: o Dado de Arma, o Touki e o Triângulo dos Estilos.

#quadro(titulo: [Espadachim ou Guerreiro?])[
Apenas quem estudou uma das *Três Grandes Escolas* — Deus da Espada, Deus da Água e Deus do Norte — é chamado de *Espadachim*. Todos os outros, mesmo que empunhem uma espada, são apenas *Guerreiros*.

Lanças são consideradas armas do demônio por causa dos Superd. E o arco carrega má fama entre guerreiros por um motivo bem específico: contra alguém que veste Touki, uma flecha comum quase não arranha. Foi por isso que a esgrima dominou o mundo humano.

*Mas essa fama é injusta.* Monstros, feras e a esmagadora maioria dos inimigos do mundo *não vestem aura nenhuma* — e contra eles, o arco continua sendo a arma mais mortal e mais segura que existe. O arqueiro é o rei absoluto da caçada e o pior duelista possível.
]

#quadro(titulo: [Cuidado com o nome])[
*Magia de Água* e *Estilo Deus da Água* não têm relação nenhuma entre si. Um é uma escola de conjuração; o outro é esgrima defensiva fundada por um vagabundo que decepou um dragão. Nas referências cruzadas, o estilo de esgrima é chamado de *Suishin-ryū* sempre que houver risco de confusão.
]

#block(breakable: false)[
=== 1. O Dado de Arma e a Escalada de Maestria

O dano de um guerreiro vem da arma, não do corpo. Cada arma tem um *Dado Base*:
]

#tbl(4, (left, center, left, center),
  [Arma], [Dado Base], [Arma], [Dado Base],
  [Adaga / Punhal], [d4], [Machado de Batalha], [d8],
  [Espada Curta], [d6], [Espadão / Montante], [d10],
  [Objeto Improvisado], [d6], [Martelo de Guerra], [d10],
  [Espada Longa], [d8], [Alabarda / Lança], [d10],
)

#tbl(4, (left, center, center, left),
  [Arma de Disparo], [Dado Base], [Alcance], [Observação],
  [Funda / Dardo], [d4], [18m], [Munição improvisada em qualquer lugar.],
  [Arco Curto], [d6], [45m], [Uma Ação por disparo.],
  [Arco Longo], [d8], [90m], [Uma Ação por disparo. Exige Força 2+.],
  [Besta], [d10], [60m], [Disparar custa 1 Ação; *recarregar custa outra*.],
)

Conforme você sobe de Rank em um estilo, você não aprende a bater mais forte — você aprende *onde* e *como* cortar. Mecanicamente, o Dado Base sobe degraus nesta escada:

*Escada de Dados:* d4 → d6 → d8 → d10 → d12 → 2d8 → 2d10 → 2d12 → 3d10 → 3d12 → 4d10

#tbl(4, (left, center, center, center),
  [Rank no Estilo], [Degraus Ganhos], [Espada Curta (d6) vira], [Espada Longa (d8) vira],
  [Principiante], [+1], [d8], [d10],
  [Intermediário], [+2], [d10], [d12],
  [Avançado], [+3], [d12], [2d8],
  [Santo], [+4], [2d8], [2d10],
  [Rei], [+5], [2d10], [2d12],
  [Imperador], [+6], [2d12], [3d10],
)

#quadro(titulo: [A Escada é do Estilo, não da Arma])[
Os degraus vêm do seu Rank *naquele estilo específico*. Um Norte Santo que larga a espada e pega uma cadeira ainda aplica os 4 degraus da cadeira (objeto improvisado, d6 base → 2d8). Um Norte Santo usando uma técnica do Deus da Espada em que ele é apenas Principiante aplicaria só 1 degrau.
]

*Fórmula de dano marcial:* \`Dado de Arma (escalado) + Força + Bônus do Rank do Estilo\`

_Exemplo: Paul Greyrat, Avançado do Norte, Força 5, com espada longa. Dado escalado: 2d8. Dano por golpe: 2d8 + 5 + 3 = *17 em média*._

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== 2. Touki (Aura de Batalha)

O Touki é uma camada de mana que o guerreiro veste sobre o próprio corpo. Ela endurece a pele como aço, reforça o fio da lâmina e amplifica força, velocidade e reflexos. Guerreiros com Touki plenamente desenvolvido partem rochedos em um golpe e disparam um clarão da lâmina para atingir um inimigo distante.
]

#quadro(titulo: [O Teto de Quem Não Tem Touki])[
*Rank Avançado é o mais alto que alguém consegue alcançar sem Touki.* Do Santo em diante, absolutamente todo guerreiro veste aura — alguns conscientemente, outros de forma inconsciente, sem saber explicar os próprios surtos de força no meio da luta.
]

#block(breakable: false)[
==== Pontos de Touki (PT)

O Capítulo 4 diz que árvores marciais recebem *0 PM*, e isso continua verdade: guerreiros não conjuram. Mas a capacidade de vestir aura *está atrelada à reserva de mana do corpo*, e por isso eles têm um recurso próprio.
]

#quadro(titulo: [Pontos de Touki — as duas reservas])[
Havia um buraco aqui: dezenas de técnicas de 1º e 2º patamar custam PT, e o Touki só acordava no 3º. O personagem comprava a técnica e não conseguia usá-la. A correção divide a reserva em duas fases.

*PT Menor — do 1º patamar em diante.* Assim que você abre qualquer árvore do Corpo, você tem *PT iguais ao seu Vigor* (mínimo 1). Isso não é aura: é fôlego, é o corpo forçando um pouco além. Ela paga *técnicas*, e nada mais.

*PT Pleno — a partir do 3º patamar* (2º, no Deus da Espada). A reserva passa a ser *Vigor + (Espírito × Maior Bônus de Rank do Corpo)*, e você desbloqueia o _Manto de Touki_ e as manobras de gasto da tabela abaixo.

*Crescimento:* a reserva é recalculada sempre que o seu maior patamar do Corpo sobe — ela *multiplica*, não acumula. *Cavalaria e Escudos* soma o Bônus de Rank dele mais uma vez, porque gasta mais rápido que qualquer outra árvore.

Você nunca tem duas reservas: um personagem com Norte Avançado e Espada Principiante usa a reserva Plena, e ponto.

- PT são recuperados *integralmente em um Descanso Curto*.
- PT não podem ser convertidos em PM, nem PM em PT.
- Um personagem com Ranks em mais de um estilo marcial usa uma reserva única de PT.

Essa é a diferença estrutural entre as duas metades do jogo: *magos racionam, guerreiros sustentam.* Um mago gasta 20 PM em um golpe apocalíptico e fica seco. Um guerreiro bate no mesmo ritmo do primeiro ao último turno, e usa PT apenas para os picos.
]

#block(breakable: false)[
==== O Manto de Touki (passivo, gratuito)

A partir do *Rank Avançado*, você veste aura conscientemente. Enquanto estiver consciente e não estiver _Exausto_, você recebe de graça:
]

- *+CA* igual à metade do seu Bônus de Rank (arredondado para cima).
- *Redução contra projéteis mundanos* — flechas, virotes, dardos e pedras arremessadas têm o dano reduzido pelo *dobro do seu Bônus de Rank* e nunca causam acerto crítico contra você. Um Imperador ignora 12 de dano por flecha, o que na prática significa que arqueiros comuns não conseguem feri-lo. Projéteis mágicos, armas mágicas e flechas disparadas por alguém que também vista Touki atravessam normalmente.
- Seus ataques desarmados e com objetos improvisados contam como *mágicos*.

#block(breakable: false)[
==== Gastando PT

#tbl(3, (center, left, left),
  [Custo], [Manobra], [Efeito],
  [*1 PT*], [*Touki Concentrado*], [_Sem gastar Ação._ Até o fim do turno, some seu Bônus de Rank ao dano *de novo* e reduza todo dano físico recebido pelo mesmo valor.],
  [*1 PT*], [*Lâmina de Touki*], [_Sem gastar Ação._ Por 1 minuto, sua arma corta pedra e aço, é considerada mágica e ignora Resistência a dano cortante e perfurante.],
  [*2 PT*], [*Golpe Estendido*], [_1 Ação._ Você desfere um clarão da lâmina que atinge um alvo a até *9 metros*. Dano de arma normal.],
  [*2 PT*], [*Aguentar*], [_1 Reação._ Ao sofrer dano que te levaria a 0 PV, você fica com *1 PV* em vez disso. Uma vez por combate.],
  [*3 PT*], [*Explosão de Aura*], [_1 Ação._ Todas as criaturas a 3m fazem teste de Força (CD 8 + Força + Rank) ou são arremessadas 4,5m e ficam _Caídas_.],
)
]

#quadro(titulo: [Nota de Design: o Arqueiro e a Aura])[
A regra de redução acima define sozinha a identidade inteira da futura Árvore de Arquearia, então vale deixar o desenho explícito antes de escrevê-la:

- Contra *monstros, feras, bandidos, soldados e magos* — ou seja, contra quase tudo o que uma mesa enfrenta — o arqueiro é devastador. Dano alto, alcance absurdo, *custo zero de recurso* e nenhuma necessidade de fechar distância.
- Contra *lutadores de rank Santo ou superior*, a aura engole as flechas dele e ele vira o membro mais frustrado do grupo.

Isso é intencional, e é bom desenho. Cria um personagem que domina noventa por cento das sessões e que, nos chefes humanos, precisa *mudar de função*: atirar em cordas, apagar tochas, derrubar estruturas, aplicar condições em vez de dano. A árvore deve conceder a ele *uma* forma cara de furar aura no rank alto — uma _Flecha de Touki_ — e nunca duas.
]

#quadro(titulo: [Errata: o Fator Laplace])[
O Antecedente *Fator Laplace / Linhagem Antiga* (Capítulo 1) ganha uma restrição nova: quem carrega esse sangue *jamais consegue vestir Touki*, não importa quanto treine. Os PM extras vêm com esse preço.

É o motivo exato pelo qual Rudeus, com uma reserva de mana que rivaliza com a de um Deus Demônio, é fisicamente incapaz de fazer o que qualquer espadachim Santo faz sem pensar.
]

#block(breakable: false)[
=== 3. O Triângulo dos Estilos

As três grandes escolas se contra-atacam em ciclo, e isso é regra mecânica, não só sabor:
]

#tbl(4, (left, left, left, left),
  [Estilo], [Filosofia], [Vence contra], [Perde para],
  [*Deus da Espada*], [_"A vitória é de quem se move primeiro."_ Velocidade e agressão; matar em um golpe. Sem defesa, sem contra-ataque.], [Deus do Norte], [Deus da Água],
  [*Deus da Água*], [Defesa e contragolpe. Deixa o inimigo atacar e devolve.], [Deus da Espada], [Deus do Norte],
  [*Deus do Norte*], [Sobreviver e vencer por qualquer meio. Truques, terreno, improviso.], [Deus da Água], [Deus da Espada],
)

#quadro(titulo: [Regra da Vantagem de Estilo])[
Quando você luta contra um praticante do estilo que o seu contra-ataca, e ambos possuem Rank naqueles estilos:

- Você rola com *Vantagem* em todas as Disputas contra ele.
- As *Reações defensivas* dele (aparar, contragolpe, esquiva treinada) falham automaticamente contra a sua primeira Ação de cada turno.

Se o Rank dele no estilo for *dois ou mais acima do seu*, a vantagem se anula — treino bruto supera a tabela de tipos.
]

#quadro(titulo: [Exemplo: o triângulo em mesa])[
Um Santo do Norte encontra um Santo da Espada num beco estreito. O Norte vence o confronto de tipo — mas o Deus da Espada age primeiro no primeiro turno (empates de Iniciativa são sempre dele), e num beco estreito não sobra cenário para um truque de *\[Improviso\]*. A vantagem de estilo não salva quem nunca chegou a rolar o dado.

Troque o beco por um mercado lotado de barracas, tochas e cordas, e a mesma dupla produz o resultado oposto: o Norte tem munição de sobra e o triângulo finalmente aparece na mesa como a tabela descreve.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Estilo Deus do Norte (Hokushin-ryū)

#quadro[
_"O Deus do Norte Kalman I usava uma espada, mas não há necessidade de se prender à espada."_
— Deus do Norte Kalman II
]
]

O Estilo Deus do Norte não é uma escola de esgrima. É um *método para continuar vivo* e entrar em qualquer luta com a maior chance possível de vencer. Ele não se preocupa com técnicas refinadas nem com especialização; ele se apoia na adaptabilidade do praticante e no uso implacável do que estiver ao redor.

Por consequência, o estilo é feito de truques em vez de golpes elegantes. Ele ensina primeiros socorros, rastreamento, e como lutar de braço quebrado, no escuro, caído no chão ou com a arma errada na mão. Praticantes empunham duas espadas, machados, cajados, ou o que estiver por perto — e cada facção do Norte luta de um jeito diferente da outra.

É por isso que a maioria dos aventureiros e mercenários do mundo aprende Deus do Norte: em um campo de batalha imprevisível, versatilidade vale mais que perfeição.

#quadro(titulo: [O Estilo mais Barato de Ser Rei])[
Por causa das inúmeras facções internas, o Norte é muito mais generoso ao conceder títulos: existem *quase 50 Reis do Norte* vivos no mundo, contra um punhado de Reis da Espada.

*Mecanicamente:* desbloquear o Rank *Rei do Norte* custa apenas *2 PA* em vez de 3. E o Rank *Deus do Norte* pode ser detido por *mais de uma pessoa ao mesmo tempo* — basta que a maioria dos praticantes da sua facção reconheça sua força, o que o torna o único rank Deus alcançável sem matar o titular anterior.
]

#quadro(titulo: [A Fraqueza do Improviso])[
O Norte depende do cenário. Em uma *arena vazia, lisa e sem objetos* — sem terreno, sem escombros, sem escuridão, sem nada para jogar — você perde acesso a todas as técnicas marcadas com *\[Improviso\]* e à Maestria _Sobreviver é Vencer_.

É exatamente por isso que o Deus da Espada esmaga o Norte: um espadachim da Espada não te dá tempo de olhar em volta.
]

#block(breakable: false)[
==== Progressão de PV e PT do Norte

O Norte fica deliberadamente no meio do mapa: mais resistente que qualquer mago, menos que um praticante do Deus da Espada.
]

#tbl(4, (left, center, center, center),
  [Rank alcançado], [PV ganho], [PT ganho], [PV acumulado†],
  [Principiante], [1d8 + 2], [—], [7],
  [Intermediário], [1d8 + 3], [—], [14],
  [Avançado], [1d10 + 3], [+1], [23],
  [Santo], [1d10 + 4], [+1], [32],
  [Rei], [1d12 + 4], [+1], [43],
  [Imperador], [1d12 + 5], [+1], [54],
)

#linebreak()

_† Acumulado em médias, sem contar o Vigor × 2 da criação. Compare: um *Mago de Água* acumula *36 PV* na mesma jornada, e um *Deus da Espada* acumulará cerca de *72 PV*. O Norte é o ponto médio exato._

*PT no Imperador:* Espírito + Vigor + 4. Um Norte Imperador com Espírito 3 e Vigor 6 tem *13 PT* por Descanso Curto.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Principiante do Norte

_Aqui não se aprende a atacar. Aprende-se a não morrer._

#quadro(titulo: [◈ Maestria: Sobreviver é Vencer])[
Três coisas, todas de graça:

- *+1 degrau* no Dado de Arma.
- *Proficiência universal:* você usa qualquer arma, de qualquer cultura, sem penalidade — e também qualquer objeto improvisado. Uma cadeira, uma tocha, um remo, uma panela de ferro. Objetos improvisados usam *d6 base* e recebem seus degraus normalmente.
- *\[Improviso\] O Improviso:* uma vez por combate, descreva uma manobra usando o cenário (jogar areia, empurrar uma prateleira, apagar a tocha, chutar brasas). Role o atributo que o Mestre julgar apropriado com *Vantagem*. Se passar, funciona — o Mestre define o efeito na hora.
]
]

#block(sticky: true)[*Técnicas Principiantes*]

#block(breakable: false)[
*_◆ Forma Quadrúpede_* — _2 PA | Sem custo de PT_
_四足の型 — Yotsuashi no Kata._ Você abaixa o corpo e avança apoiado em mãos e pés, como um membro da Raça Fera, sacando a arma só no último instante. Vira um alvo pequeno e rápido demais para acompanhar. Foi assim que Paul Greyrat desviou de uma saraivada de Balas de Pedra de Rudeus.
- *Custo:* 1 Ação.
- *Efeito:* você avança até o *dobro do seu Deslocamento* em linha reta. Durante o avanço, ataques à distância contra você têm *Desvantagem*. Ao final do movimento, você pode gastar sua próxima Ação para atacar com *+1d6* de dano.
]

#block(breakable: false)[
*_Arremesso de Espada_* — _1 PA | Sem custo de PT_
Quando um praticante do Norte é encurralado ou imobilizado, ele joga a espada. A lâmina gira violentamente no ar com ímpeto suficiente para cortar uma Bola de Fogo no meio.
- *Custo:* 1 Ação.
- *Efeito:* ataque à distância (Agilidade + Rank) em até *18 metros*. Dano de arma normal. Alternativamente, use como *Reação* para interceptar um projétil ou uma magia de rank Principiante vindo na sua direção — teste de Agilidade (CD 12) para anular.
- *Custo real:* você fica desarmado. É por isso que praticantes do Norte carregam três espadas.
]

#block(breakable: false)[
*_Bala de Lágrimas_* — _1 PA | Sem custo de PT_
_落涙弾 — Rakurui-dan._ Consiste em atirar um saco de temperos em pó na cara do inimigo. É ridículo. É indigno. Auber Corvette, o Espada-Pavão, Imperador do Norte, usava isso e matava com isso.
- *Custo:* 1 Ação.
- *Efeito:* cone de 3m. Teste de Resistência de *Vigor* (CD 8 + Agilidade + Rank) ou o alvo fica *Cego* até o fim do próximo turno dele. Requer que você tenha o saco preparado (2 PO na cidade, ou 1 hora colhendo ervas).
]

#block(breakable: false)[
*_Primeiros Socorros de Campo_* — _1 PA | Sem custo de PT_
O Norte ensina medicina de campo porque um mercenário morto não recebe pagamento. Torniquete, tala, cauterização com a lâmina aquecida.
- *Custo:* 1 Ação.
- *Efeito:* um aliado adjacente (ou você mesmo) recupera *Vigor + Bônus de Rank* em PV, e todas as _Marcas da Morte_ dele são removidas. Cada criatura só pode se beneficiar disso *uma vez por Descanso Curto*.
- Você também ganha a perícia _Medicina_ gratuitamente.
]

#block(breakable: false)[
*_Leitura de Rastro_* — _1 PA_
Você ganha as perícias _Sobrevivência_ e _Percepção_, e rola com *Vantagem* para rastrear alvos por terreno pisado, sangue ou hábitos. O Norte caça antes de lutar.
]

#block(breakable: false)[
*_Golpe Baixo_* — _1 PA | Sem custo de PT_
Nem todo golpe precisa cortar. Uma rasteira, um cabeçada, um chute no joelho.
- *Custo:* 1 Ação.
- *Efeito:* ataque normal que causa *metade do dado de arma*, mas o alvo faz teste de *Força ou Agilidade* (CD 8 + Força + Rank) ou fica *Caído*. Contra alvos _Caídos_, seus ataques corpo a corpo têm Vantagem.
]

#block(sticky: true)[*Talentos Principiantes* — _1 PA cada_]

- *Três Bainhas:* você carrega armas escondidas. Sacar uma arma nova é *livre*, e você nunca fica realmente desarmado.
- *Osso Duro:* *+4 PV por patamar seu nesta árvore*. Comprável várias vezes, até o número de patamares.
- *Pés no Chão:* você não sofre penalidade de deslocamento em terreno difícil, escombros ou gelo.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Intermediário do Norte

_O rank em que você já compete de igual para igual com um cavaleiro comum. E o rank em que você aprende que estar ferido é uma situação, não uma derrota._

#quadro(titulo: [◈ Maestria: O Corpo Ferido])[
Você treinou machucado a vida inteira, então lutar em desvantagem não é desvantagem.

- Você *não sofre Desvantagem* por lutar _Caído_, com uma mão só, em terreno difícil, na escuridão total, ou sob 1 nível de _Exaustão_.
- Enquanto estiver com *metade ou menos* dos seus PV Máximos, você recebe *+2 de dano* em todos os ataques corpo a corpo.
- Você rola testes do _Fio da Vida_ (Capítulo 4) com *Vantagem*.
]
]

#block(sticky: true)[*Técnicas Intermediárias*]

#block(breakable: false)[
*_◆ Finta do Norte_* — _2 PA | Sem custo de PT_
Você olha para a esquerda. Grita o nome de alguém atrás dele. Finge tropeçar. O Norte não considera isso trapaça — considera isso a luta.
- *Custo:* 1 Ação.
- *Efeito:* teste de *Enganação* (Espírito) contra o teste de *Intuição* do alvo. Se você vencer, o seu próximo ataque neste turno ou no próximo *acerta automaticamente* e é tratado como acerto crítico se o alvo estiver desprevenido.
]

#block(breakable: false)[
*_Empunhadura Dupla_* — _1 PA | Sem custo de PT_
Duas lâminas. Não para dobrar o dano — para dobrar as opções.
- *Efeito:* você pode empunhar duas armas de uma mão. Gastando *1 Ação*, ataca com a arma secundária usando o Dado de Arma *um degrau abaixo* do normal. Enquanto estiver com duas armas empunhadas, você recebe *+1 na CA*.
]

#block(breakable: false)[
*_Desarme_* — _1 PA | Sem custo de PT_
- *Custo:* 1 Ação.
- *Efeito:* Disputa de *Força ou Agilidade* contra o alvo. Se vencer, a arma dele voa 3m em uma direção à sua escolha. Se você vencer por *10 ou mais*, você pega a arma no ar — e passa a usá-la com todos os seus degraus de Dado de Arma.
]

#block(breakable: false)[
*_\[Improviso\] Passo do Terreno_* — _1 PA | Sem custo de PT_
Você não luta no chão. Você luta em cima de uma mesa, pendurado num lustre, com o sol nas costas do inimigo.
- *Custo:* 1 Ação.
- *Efeito:* você se move até o seu Deslocamento ignorando terreno difícil, escalando paredes e móveis livremente. Ao terminar em uma posição elevada ou de vantagem tática, você recebe *+2 na CA* e *Vantagem* no seu próximo ataque, até sair de lá.
]

#block(breakable: false)[
*_Ferro Frio_* — _1 PA | Sem custo de PT_
- *Efeito:* enquanto estiver com *um quarto ou menos* dos seus PV Máximos, você tem *Resistência a todo dano físico* e é imune às condições _Amedrontado_ e _Atordoado_. Praticantes do Norte ficam mais perigosos quando estão morrendo, e todo mundo no ramo sabe disso.
]

#block(sticky: true)[*Talentos Intermediários* — _1 PA cada_]

- *Segunda Chance \[Improviso\] :* uma vez por combate, ao errar um ataque, você pode reposicionar usando o cenário e repetir a rolagem.
- *Facção Errante:* escolha uma arma exótica (machado duplo, chicote, corrente, cajado bipartido). Ela ganha um dado base de *d8* e você adiciona um efeito de condição à sua escolha (empurrar, prender ou derrubar) uma vez por combate.
- *Estômago de Mercenário:* você ignora os efeitos de fome, sede, clima extremo e uma noite sem dormir. Vantagem contra veneno.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Avançado do Norte

_Menos de 1 em 40.000 chega aqui, e este é o teto absoluto de quem não veste aura._

#quadro(titulo: [◈ Maestria: O Despertar do Touki])[
Você passa a vestir *Touki conscientemente*. Recebe o *Manto de Touki* e a reserva de *Pontos de Touki* descritos nas regras gerais da Árvore do Corpo, no início deste capítulo.

Adicionalmente, e exclusivo do Norte: você pode aplicar Touki a *objetos improvisados*. Uma cadeira revestida de aura parte um escudo de aço. Isso não é figura de linguagem — é a razão pela qual praticantes do Norte são temidos em espaços fechados.
]
]

#block(sticky: true)[*Técnicas Avançadas*]

#block(breakable: false)[
*_◆ Corte Reverso_* — _3 PA | 1 PT_
Você golpeia, o inimigo apara — e você deixa a lâmina escorregar, gira o punho e corta na volta, do lado que ele não está protegendo. É a resposta direta do Norte contra estilos defensivos.
- *Custo:* 1 Ação e 1 PT.
- *Efeito:* faça um ataque. Se ele for *aparado, bloqueado ou anulado por uma Reação defensiva*, o ataque acontece mesmo assim, ignorando a Reação, com *+1d10* de dano. Contra praticantes do *Deus da Água*, essa técnica não gasta PT.
]

#block(breakable: false)[
*_Túmulo de Aço \[Improviso\] _* — _2 PA | 1 PT_
Você derruba o cenário em cima do inimigo. Uma viga, uma estante, uma parede de gelo alheia, um cavalo morto.
- *Custo:* 1 Ação e 1 PT. Requer cenário utilizável.
- *Efeito:* teste de *Agilidade* do alvo (CD 8 + Força + Rank). Falha: *3d10* de dano contundente e fica *Preso* até gastar 1 Ação para se soltar. Sucesso: metade e não fica preso.
]

#block(breakable: false)[
*_Quebra-Guarda_* — _2 PA | 1 PT_
- *Custo:* 1 Ação e 1 PT.
- *Efeito:* um ataque que ignora *Cobertura*, *bônus de escudo* e metade da CA concedida por armaduras não-mágicas. Contra barreiras mágicas com PV (como a _Fortaleza de Gelo_), o dano é *dobrado*.
]

#block(breakable: false)[
*_Pele de Ferro_* — _2 PA_
- *Efeito:* o bônus de CA do seu Manto de Touki passa a ser o *Bônus de Rank completo*, não a metade.
]

#block(sticky: true)[*Talentos Avançados* — _2 PA cada_]

- *Fôlego Longo:* +3 PT Máximos.
- *Mão Trocada:* você pode usar _Empunhadura Dupla_ sem redução de degrau na arma secundária.
- *Instinto de Presa:* você não pode ser surpreendido enquanto estiver consciente, e rola Iniciativa com Vantagem.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Santo do Norte

_A partir daqui, o mundo te chama de gênio._

#quadro(titulo: [◈ Maestria: Estilo Pessoal])[
As técnicas do Deus do Norte são *únicas de cada praticante*. Você chegou ao ponto em que para de copiar e começa a inventar.

Junto com o Mestre, crie *uma técnica assinatura própria*, com nome próprio, usando este molde:

- *Custo:* 1 Ação e 1 PT.
- *Orçamento:* escolha *duas* opções — dano extra de 2d10; aplica uma condição (Caído, Cego, Preso, Atordoado) com teste de resistência; atinge dois alvos; alcance de 9m; ou concede +4 de CA até o próximo turno.
- *Amarra:* escreva uma condição que a técnica exige para funcionar (estar ferido, estar com duas armas, o inimigo ter atacado primeiro, haver escuridão). Ela é o preço.

Praticantes do Norte quase sempre ganham o apelido pela sua técnica. É assim que o mundo sabe quem você é antes de você chegar.
]
]

#block(sticky: true)[*Técnicas Santas*]

#block(breakable: false)[
*_◆ Cruz Nebulosa_* — _4 PA | 2 PT_
_朧十文字 — Oboro Jūmonji._ A técnica de Auber Corvette. Você ataca por cima com as duas espadas, num lugar onde o inimigo tem que bloquear. No instante em que ele bloqueia as duas, você solta uma delas, saca uma terceira da bainha e corta o torso indefeso na horizontal. O golpe desenha uma cruz no ar antes de desenhá-la no corpo.
- *Custo:* 2 Ações e 2 PT. Requer _Empunhadura Dupla_ e uma terceira arma embainhada.
- *Efeito:* faça um ataque com Vantagem. *Se o alvo bloquear, aparar ou se defender de qualquer forma*, o segundo corte acerta automaticamente sem rolagem, causando dano de arma *+4d8* e ignorando o Manto de Touki dele.
]

#block(breakable: false)[
*_Contra-Água_* — _3 PA | 1 PT_
- *Custo:* 1 Reação e 1 PT, quando um inimigo errar um ataque contra você.
- *Efeito:* você ataca imediatamente com Vantagem. Se o inimigo praticar o *Deus da Água*, esta Reação não gasta PT.
]

#block(breakable: false)[
*_Golpe do Desespero_* — _3 PA | 2 PT_
- *Custo:* 2 Ações e 2 PT. Só pode ser usada com metade ou menos dos PV.
- *Efeito:* um único ataque com o Dado de Arma *rolado três vezes*, somando tudo. Depois de usar, você ganha 1 nível de _Exaustão_ até o próximo Descanso Longo.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Rei do Norte

_Custo de desbloqueio: *2 PA* (em vez de 3). São quase cinquenta no mundo — muitos, para um título de rei. Ainda assim, cada um deles é considerado entre os mais talentosos vivos._

#quadro(titulo: [◈ Maestria: Leitura de Batalha])[
Você já lutou contra todo tipo de gente e já apanhou de todas as maneiras possíveis. Agora, você lê a luta antes dela acontecer.

- Ao final do primeiro turno de um combate, escolha um inimigo. Você identifica automaticamente o *estilo, o rank aproximado e a maior fraqueza* dele. Contra esse alvo, você recebe *+2 em acertos e testes de resistência* pelo resto do combate.
- A *Vantagem de Estilo* contra o Deus da Água deixa de ser anulada por diferença de rank.
- Você pode usar a Maestria _ \[Improviso\] O Improviso_ *três vezes* por combate em vez de uma.
]
]

#block(sticky: true)[*Técnicas Reais*]

#block(breakable: false)[
*_◆ Mil Facções_* — _5 PA | 2 PT_
Você estudou todas as escolas do Norte, mesmo as que a sua facção despreza.
- *Custo:* 1 Ação e 2 PT.
- *Efeito:* você replica, naquele turno, *qualquer técnica de rank Avançado ou inferior* de qualquer estilo marcial do mundo que você já tenha visto ser usada, mesmo sem tê-la comprado. O Mestre define os detalhes. Uma vez por combate.
]

#block(breakable: false)[
*_Dança de Aço_* — _4 PA | 2 PT_
- *Custo:* 1 Ação e 2 PT.
- *Efeito:* ataque cada criatura à sua escolha dentro de 3m, com uma rolagem separada para cada. Nenhum ataque tem Desvantagem, mesmo com aliados na área.
]

#block(breakable: false)[
*_Aura Cortante_* — _4 PA | 3 PT_
- *Custo:* 1 Ação e 3 PT.
- *Efeito:* você libera o Touki como uma lâmina em linha de *27 metros*. Dano de arma *+5d10*, teste de Agilidade (CD 8 + Força + Rank) para metade. Corta estruturas de pedra e madeira no caminho.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Imperador do Norte

_Auber Corvette, o Espada-Pavão. Doga. Sieghart Saladin Greyrat. Nomes que exércitos reconhecem._

#quadro(titulo: [◈ Maestria: Nada é Regra])[
A doutrina do Norte levada às últimas consequências: não existe forma errada de vencer.

- Você recebe *uma Ação adicional* em cada um dos seus turnos (total de 4).
- Suas técnicas com a marca *\[Improviso\]* funcionam mesmo em ambientes vazios — a esta altura, você improvisa com o próprio corpo, com a poeira, com a luz.
- Você pode gastar *1 PT* para transformar qualquer falha crítica sua (1 natural) em uma rolagem normal, alegando que era intencional. Ninguém consegue provar o contrário.
]
]

#block(sticky: true)[*Técnicas Imperiais*]

#block(breakable: false)[
*_◆ Golpe do Fim da Linha_* — _6 PA | 4 PT_
Não existe uma descrição fixa desta técnica, porque cada Imperador do Norte a executa de um jeito diferente. O que elas têm em comum é o momento: é o golpe que você dá quando decidiu que a luta acaba agora, com um dos dois no chão.
- *Custo:* 3 Ações e 4 PT.
- *Efeito:* um único ataque que *acerta automaticamente*, ignora Touki, ignora Cobertura e ignora bônus de armadura. Role o Dado de Arma *quatro vezes* e some Força + Bônus de Rank + 4d12. Se o alvo estiver com metade ou menos dos PV, o dano é *dobrado*.
]

#block(breakable: false)[
*_Aura de Comando_* — _5 PA | 3 PT_
- *Custo:* 1 Ação e 3 PT.
- *Efeito:* todos os aliados em 18m recebem, por 1 minuto, *+2 em acertos*, imunidade a _Amedrontado_, e podem repetir um teste de resistência falho por turno. O Norte é o estilo dos mercenários, e mercenários lutam em bando.
]

#block(breakable: false)[
*_Corpo Impossível_* — _5 PA_
- *Efeito:* enquanto tiver ao menos 1 PT, você é imune a _Paralisia_, _Petrificação_, _Preso_ e _Atordoado_. Membros quebrados não reduzem seus atributos. Você luta com um braço só, com uma perna só, no chão, cego. O corpo é só uma ferramenta, e ferramenta quebrada ainda corta.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Estilo Deus da Espada (Kenshin-ryū)

#quadro[
_"A vitória é de quem se move primeiro."_
— Lema do Estilo Deus da Espada
]
]

O Deus da Espada não tem defesa. Não é um descuido do estilo: é a *doutrina*. Se você derruba o inimigo no primeiro golpe, defesa é tempo desperdiçado — e todo instante gasto aprendendo a aparar é um instante que você não gastou aprendendo a cortar mais rápido.

Praticantes são desencorajados a usar armadura pesada e treinados a vestir roupa leve, porque peso é atraso. Como consequência cultural, quase todos eles se tornam *impacientes e briguentos*: um estilo que ensina a resolver tudo com o primeiro movimento produz gente que não sabe esperar.

É o estilo mais forte dos três. E é o único que perde de propósito.

#quadro(titulo: [O Preço da Doutrina — leia antes de comprar])[
Enquanto você tiver qualquer patamar no Deus da Espada:

- *Você não pode usar armadura média ou pesada.* Se vestir uma, perde *todas* as Maestrias e técnicas deste estilo até tirá-la.
- *Sua CA base é reduzida em 2.* Você luta de roupa de pano, e todo mundo sabe disso.
- *Nenhuma técnica deste estilo concede Reações defensivas.* Aparar, bloquear e contragolpear não existem aqui. A única Reação da árvore inteira é a _Reversão de Luz_, no patamar Rei — e ela só serve contra outro Deus da Espada.

Você é o maior número deste livro e o alvo mais fácil de acertar.
]

#block(breakable: false)[
==== Progressão de PV e PT do Deus da Espada

#tbl(5, (left, center, center, center, center),
  [Rank alcançado], [PV ganho], [PT ganho], [Degraus no Dado de Arma], [PV acumulado],
  [Principiante], [1d10 + 4], [—], [+1], [10],
  [Intermediário], [1d12 + 4], [+1], [+2], [20],
  [Avançado], [1d12 + 5], [+1], [*+4*], [32],
  [Santo], [2d6 + 5], [+1], [+5], [44],
  [Rei], [2d6 + 6], [+1], [*+7*], [57],
  [Imperador], [2d8 + 6], [+1], [*+9*], [72],
)
]

#linebreak() 

_Repare nos degraus: além do +1 normal por patamar, o Deus da Espada ganha *degraus extras* no Avançado, no Rei e no Imperador. Nenhum outro estilo faz isso. Uma espada longa (d8) na mão de um Imperador da Espada é *4d12* — antes de somar Força e Rank._

*Referência rápida de dano por golpe* _(espada longa, Força progredindo de 4 a 8)_

#tbl(3, (left, center, center),
  [Patamar], [Dado], [Dano médio por golpe],
  [Principiante], [d10], [~11],
  [Intermediário], [d12], [~13],
  [Avançado], [2d10], [~20],
  [Santo], [2d12], [~24],
  [Rei], [3d12], [~32],
  [Imperador], [4d12], [~40],
)

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Principiante da Espada

_O treino é uma coisa só: o mesmo corte, centenas de milhares de vezes, até o braço aprender antes da cabeça._

#quadro(titulo: [◈ Maestria: Quem Se Move Primeiro])[
- *Empates de Iniciativa sempre são seus.* Contra qualquer criatura, se vocês empatarem, você age antes.
- No *primeiro turno de qualquer combate*, seu primeiro ataque é feito com *Vantagem* e rola o Dado de Arma *uma vez a mais*.
- Você nunca fica _Surpreso_ enquanto empunhar uma espada e estiver consciente.

Isto não é reflexo sobrenatural. É que você passou a infância inteira treinando o instante da abertura, e o resto do mundo não.
]
]

#block(sticky: true)[*Técnicas Principiantes*]

#block(breakable: false)[
*_◆ Corte de Braço_* — _2 PA | Sem custo de PT_
_腕落とし — Ude Otoshi._ Golpe Inicial do Estilo Deus da Espada. Você não mira no corpo: mira no antebraço, no ponto entre o cotovelo e o punho. Contra carne, decepa. Contra armadura, quebra o osso por dentro do aço. Nos dois casos, aquele braço para de segurar coisas.
- *Custo:* 1 Ação.
- *Efeito:* faça um ataque. Se acertar, além do dano normal, o alvo faz Teste de Resistência de *Vigor* (CD 8 + Força + Rank). Se falhar, *larga o que estiver na mão* e não pode usar aquele braço até o fim do próximo turno dele. Contra criaturas de rank Santo ou superior, apenas larga a arma.
- É o primeiro golpe que todo aprendiz treina, e é o golpe que veterano ainda usa — porque um inimigo desarmado não precisa ser morto.
]

#block(breakable: false)[
*_Investida_* — _1 PA | Sem custo de PT_
- *Custo:* 1 Ação.
- *Efeito:* você avança até o dobro do seu Deslocamento em linha reta e ataca ao final. Se percorreu ao menos 9 metros, o ataque causa *+1 Dado de Arma* de dano. Você não pode usar Reações até o seu próximo turno.
]

#block(breakable: false)[
*_Golpe Contínuo_* — _1 PA | 1 PT_
- *Custo:* 1 Ação e 1 PT.
- *Efeito:* se o seu ataque anterior neste turno acertou, este ataque não pode errar por menos de 5 — role o d20 e, se o resultado ficar até 4 abaixo da CA do alvo, ele acerta mesmo assim.
]

#block(breakable: false)[
*_Roupa Leve_* — _1 PA_
- *Efeito:* sem armadura nenhuma, você recebe *+3 metros de Deslocamento* e *+2 na CA apenas nos turnos em que você se moveu ao menos 3 metros*. Parado, a penalidade doutrinária de -2 continua valendo integralmente. Vestir qualquer armadura desliga isto e todo o resto.
- O Deus da Espada não é difícil de acertar porque é resistente. É difícil de acertar porque *não para de andar* — e no turno em que ele para para desferir a Espada de Luz, ele é o alvo mais fácil do campo.
]

#block(breakable: false)[
*_Sem Recuo_* — _1 PA_
- *Efeito:* você é imune a _Amedrontado_ e a qualquer efeito que force recuo ou fuga. Você não sabe recuar. Isso já matou muitos praticantes deste estilo, e o estilo considera isso um preço justo.
]

#block(sticky: true)[*Talentos Principiantes* — _1 PA cada_]

- *Braço de Ferro:* *+4 PV por patamar seu nesta árvore*. Comprável várias vezes, até o número de patamares.
- *Fio Perfeito:* sua arma nunca lasca, entorta ou quebra por meios mundanos, e ataques seus contra objetos e estruturas causam dano dobrado.
- *Pavio Curto:* você tem *Vantagem* em Intimidação, e *Desvantagem* em qualquer teste social que exija paciência. _(Sim, isto é metade defeito. O estilo produz essas pessoas.)_

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Intermediário da Espada

_Três anos de fundamentos, no mínimo. Ao final deles, você bate de igual para igual com um cavaleiro treinado — e já sente a aura antes de todo mundo._

#quadro(titulo: [◈ Maestria: Aura Precoce])[
*Este estilo é a única exceção à regra do Touki.* Onde todos os outros só despertam a aura no terceiro patamar, o Deus da Espada a alcança no segundo — porque a doutrina inteira é velocidade, e velocidade sem aura tem teto.

- Você recebe *Pontos de Touki* um patamar antes de todo mundo.
- Você pode usar *Touki Concentrado* e *Lâmina de Touki* normalmente.
- Você *ainda não* recebe o _Manto de Touki_ — sua aura cobre o corpo em rajadas curtas e afiadas, não em camada contínua. O bônus de CA e a redução contra projéteis só chegam no Avançado.
]
]

#block(sticky: true)[*Técnicas Intermediárias*]

#block(breakable: false)[
*_◆ Passo Encurtado_* — _2 PA | 1 PT_
Você não corre até o inimigo. Você aparece na frente dele.
- *Custo:* 1 Ação e 1 PT.
- *Efeito:* desloque-se até 9 metros em linha reta, atravessando o espaço de criaturas, *sem provocar ataques de oportunidade*, e ataque imediatamente. Contra um alvo que ainda não agiu neste combate, este ataque tem Vantagem.
]

#block(breakable: false)[
*_Dois Cortes_* — _1 PA | 1 PT_
- *Custo:* 1 Ação e 1 PT.
- *Efeito:* dois ataques contra o mesmo alvo. O segundo usa o Dado de Arma *um degrau abaixo*. Se ambos acertarem, o alvo fica _Caído_.
]

#block(breakable: false)[
*_Quebra-Armadura_* — _1 PA | 1 PT_
- *Custo:* 1 Ação e 1 PT.
- *Efeito:* um ataque que ignora *metade da CA* concedida por armadura não-mágica e por escudos. Contra alvos em armadura completa, causa *+2 Dados de Arma*.
]

#block(breakable: false)[
*_Leitura de Abertura_* — _1 PA_
- *Efeito:* ao observar uma criatura por um turno inteiro sem atacá-la, você identifica o momento exato em que ela baixa a guarda. No seu próximo turno, o seu primeiro ataque contra ela tem *Vantagem* e crítico em *19-20*.
]

#block(sticky: true)[*Talentos Intermediários* — _1 PA cada_]

- *Punho Duplo:* você empunha uma espada de duas mãos com uma só, sem penalidade, e ganha +1 grau de Dado quando usa as duas mãos numa arma leve.
- *Aço Rápido:* +2 PT Máximos.
- *Cavaleiro Vencido:* contra soldados, guardas e cavaleiros comuns (qualquer criatura sem patamar em escola formal), seus ataques acertam automaticamente com resultado 10 ou mais no dado.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Avançado da Espada

_Menos de 1 em 40.000. Você veste a aura como camada contínua e passa a cortar coisas que não deveriam ser cortáveis._

#quadro(titulo: [◈ Maestria: Velocidade Encarnada])[
- Você recebe o *Manto de Touki* completo, com todos os benefícios do Capítulo 3.
- *Dois degraus* de Dado de Arma neste patamar em vez de um.
- Se você *não se mover* no seu turno, você recebe *1 Ação adicional* que só pode ser usada para atacar.

A última linha é a doutrina virando mecânica: ficar parado e cortar é literalmente mais eficiente do que qualquer outra coisa que você poderia fazer.
]
]

#block(sticky: true)[*Técnicas Avançadas*]

#block(breakable: false)[
*_◆ Espada do Silêncio_* — _3 PA | 2 PT_
_無音の太刀 — Muon no Tachi._ A lâmina atravessa a barreira do som. O corte chega antes do ruído do corte, e o inimigo descobre que foi atingido pela ferida, não pelo barulho.
- *Custo:* 1 Ação e 2 PT.
- *Efeito:* um ataque que *não pode ser alvo de nenhuma Reação* — nem aparar, nem bloquear, nem contragolpear, nem esquiva treinada, nem _Fluxo_. Causa *+2 Dados de Arma* e não faz som algum: quem não estiver olhando não percebe que houve um ataque.
- *Uso fora de combate:* você corta uma corda, uma tranca ou uma garganta sem que ninguém no cômodo ao lado escute.
]

#block(breakable: false)[
*_Corte Ascendente_* — _2 PA | 1 PT_
- *Custo:* 1 Ação e 1 PT.
- *Efeito:* ataque que lança o alvo 4,5m para cima. Ele cai no fim do turno dele, sofrendo dano de queda e ficando _Caído_, a menos que consiga voar. Enquanto no ar, ataques contra ele têm Vantagem.
]

#block(breakable: false)[
*_Sede_* — _2 PA_
- *Efeito:* sempre que você reduzir uma criatura a 0 PV, você imediatamente recupera *1 PT* e pode gastar *1 Ação* ainda neste turno, mesmo que já tenha usado todas.
]

#block(sticky: true)[*Talentos Avançados* — _2 PA cada_]

- *Fôlego de Aço:* +3 PT Máximos.
- *Mira no Osso:* seus acertos críticos rolam o Dado de Arma *três* vezes em vez de duas.
- *Espada Emprestada:* você é reconhecido pela escola. Recebe uma espada de qualidade superior — *+1 degrau* de Dado de Arma permanente, e ela conta como mágica.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Santo da Espada

_Você controla o Touki por completo e domina a Espada de Luz. Essas são as duas exigências, e não há exceção — é literalmente o que a escola confere o título por. Recebe também o casaco escuro de gola de pele branca, que qualquer pessoa do mundo reconhece à distância._

#quadro(titulo: [◈ Maestria: Controle Absoluto])[
- Seus acertos críticos ocorrem em *19-20*.
- Você pode aplicar Touki à lâmina e ao corpo simultaneamente sem gastar PT: o _Touki Concentrado_ passa a ser *gratuito uma vez por turno*.
- Você corta magia de área ao meio: quando for alvo de um efeito que permita teste de Agilidade para metade do dano, um sucesso resulta em *nenhum* dano.
]
]

#block(sticky: true)[*Técnica Santa*]

#block(breakable: false)[
*_◆ Espada de Luz_* — _4 PA | 3 PT_
_光の太刀 — Hikari no Tachi._ A técnica suprema do estilo, e a única razão pela qual o Deus da Espada é chamado de o mais forte dos três. A espada é segurada firme com as duas mãos e *toda* a força do corpo é depositada num único movimento. Não existe finta, não existe segunda intenção, não existe plano B. Corta um homem de armadura pesada em duas metades.
- *Custo:* 2 Ações e 3 PT.
- *Efeito:* um ataque com *Vantagem*. Role o Dado de Arma *três vezes*. Ignora todo bônus de CA concedido por armadura, escudo e Cobertura.
- *Não pode ser alvo de Reação alguma*, com uma única exceção em todo o mundo: a _Reversão de Luz_. Nem o _Fluxo_ do Deus da Água consegue devolvê-la.
- *Se o alvo estiver em armadura pesada ou for uma estrutura*, o dano é *dobrado*.
- *O preço:* até o início do seu próximo turno, sua CA é reduzida em *5*. Você colocou tudo naquele golpe e não sobrou nada para o corpo.
]

#quadro(titulo: [Pré-requisito de Patamar])[
Para desbloquear o patamar *Rei da Espada*, você precisa possuir a _Espada de Luz_. Não é uma sugestão da escola — é a definição do título. Um Santo que não corta a luz não é um Santo.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rei da Espada

_Reis não são promovidos por tempo de serviço. O Deus da Espada te concede um título e uma lâmina da coleção pessoal dele, e essa lâmina é a prova._

#quadro(titulo: [◈ Maestria: A Lâmina do Deus])[
- *Dois degraus* de Dado de Arma neste patamar.
- Você recebe uma *espada da coleção do Deus da Espada*: arma mágica, indestrutível, que ignora Resistência a dano cortante. Perdê-la é uma questão de honra que a escola resolve com sangue.
- Sua _Espada de Luz_ passa a custar *2 PT* em vez de 3, e a penalidade de CA cai de -5 para -3.
]
]

#block(sticky: true)[*Técnicas Reais*]

#block(breakable: false)[
*_◆ Reversão de Luz_* — _5 PA | 3 PT_
_光返し — Hikari-gaeshi._ A única defesa que este estilo já produziu em toda a sua história, e ela existe por um motivo só: contra-atacar a própria Espada de Luz. Você não bloqueia — você corta o *punho* do inimigo antes que a lâmina dele atinja a velocidade máxima. Exige tempo de reação além do humano.
- *Custo:* 1 Reação e 3 PT, quando alguém usa _Espada de Luz_ contra você ou contra um aliado a até 3 metros.
- *Efeito:* a Espada de Luz inimiga é *anulada por completo*. Faça imediatamente um ataque contra o conjurador: se acertar, ele sofre dano normal e *perde permanentemente o uso da mão que empunhava* até receber magia de Cura de rank Santo ou superior.
- *É a única Reação da árvore inteira.* Se você não vai enfrentar outro Deus da Espada, ela é 5 PA jogados fora — e mesmo assim, todo Rei compra, porque a sucessão do estilo é decidida em duelo.
]

#block(breakable: false)[
*_Corte do Horizonte_* — _4 PA | 3 PT_
- *Custo:* 1 Ação e 3 PT.
- *Efeito:* você corta em linha reta de *27 metros* por 1,5m de largura. Cada criatura na linha sofre o dano de arma completo, com teste de Agilidade (CD 8 + Força + Rank) para metade. Paredes de madeira, portões e barreiras mágicas com PV são cortados ao meio.
]

#block(breakable: false)[
*_Um Só Movimento_* — _4 PA | 2 PT_
- *Custo:* 1 Ação e 2 PT. Uma vez por combate.
- *Efeito:* ataque *todas* as criaturas hostis dentro de 4,5 metros com uma única rolagem de ataque, comparada contra a CA de cada uma separadamente. Dano completo em todas.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Imperador da Espada

_O posto é conquistado de um jeito só: dois Reis da Espada duelam com o Deus da Espada como testemunha, e o vencedor sobe. Não existe outro caminho. Se você quer ser Imperador, você vai ter que ferir alguém que treinou ao seu lado._

#quadro(titulo: [◈ Maestria: A Vitória de Quem Se Move Primeiro])[
- *Três degraus* de Dado de Arma neste patamar.
- Seus críticos ocorrem em *18-20*.
- A primeira vez, em cada combate, que você acertar uma criatura que ainda esteja com os *PV cheios*, você rola o Dado de Arma *duas vezes o normal*. O lema deixou de ser lema e virou dano.
- Você não pode ser _Atrasado_, _Lentificado_ nem ter a Iniciativa reduzida por efeito algum.
]
]

#block(sticky: true)[*Técnicas Imperiais*]

#block(breakable: false)[
*_◆ Espada de Luz Verdadeira_* — _6 PA | 5 PT_
Você deixou de acelerar a lâmina. Você *remove o intervalo* entre a decisão e o corte. Quando plenamente dominada, dizem que a velocidade do golpe se aproxima da velocidade da luz — e a essa altura o inimigo não está esquivando de uma espada, está esquivando de uma coisa que já aconteceu.
- *Custo:* 2 Ações e 5 PT. Uma vez por combate.
- *Efeito:* o ataque *acerta automaticamente*, sem rolagem. Role o Dado de Arma *cinco vezes*. Ignora CA, Cobertura, Manto de Touki, armadura mágica e qualquer barreira física.
- Só pode ser respondida por _Reversão de Luz_ usada por alguém de patamar *Rei ou superior*, e mesmo assim o defensor faz o teste de reação com Desvantagem.
- *O preço:* sua CA cai para *10* até o início do seu próximo turno, e você não pode usar Reações nesse intervalo. Se sobrou alguém em pé depois disso, você provavelmente morre.
]

#block(breakable: false)[
*_Sem Segunda Vez_* — _5 PA | 3 PT_
- *Custo:* 1 Reação e 3 PT, quando uma criatura a até 9m tentar fugir, se teleportar, se curar acima de metade dos PV, ou conjurar magia de rank Santo ou superior.
- *Efeito:* você a atinge antes que a ação se complete. O ataque acerta automaticamente, e se causar dano igual ou superior a metade dos PV atuais dela, *a ação é cancelada* e o recurso gasto se perde.
]

#block(breakable: false)[
*_Herança de Gal_* — _5 PA_
- *Efeito:* escolha uma técnica de rank Santo ou inferior de *qualquer* estilo marcial. Você a possui, com o seu próprio Bônus de Rank do Deus da Espada. O Imperador da Espada já viu tudo o que existe e já cortou a maior parte disso.
]

#quadro(titulo: [E o Deus da Espada?])[
Existe *um só* no mundo, e o cargo é ocupado do único jeito possível: *matando o anterior*. Se ele morre por qualquer outro motivo, o mais forte da escola herda o título — o que significa que toda troca de geração no Estilo Deus da Espada é, na prática, uma guerra civil interna.

Este patamar não tem custo em PA, não tem lista de técnicas e não pode ser comprado. Ele é uma decisão da mesa, e ela envolve sangue de alguém que te ensinou.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Estilo Deus da Água (Suishin-ryū)

#quadro[
_"Mesmo com frio, eles não podem vestir nada pesado no corpo. São o oposto de nós, que usamos roupas grossas mesmo com calor. É interessante, não é?"_
— Deusa da Água Reida Reia, sobre o Estilo Deus da Espada
]
]

Há muito tempo, num reino à beira-mar, o Rei Dragão da Água destruía os portos e devorava os pescadores que invadiam seu território. A ordem de cavaleiros do reino falhou. O rei ofereceu a coroa e a mão da filha a quem matasse o dragão, e todos os heróis que tentaram foram despedaçados.

Um vagabundo maltrapilho chamado *Reidar* se apresentou. Congelou a superfície do oceano para prender o dragão, e quando a criatura rompeu o gelo e desferiu um golpe impossível de bloquear, Reidar *devolveu o próprio golpe* e decepou a cabeça dela com um único corte.

O rei lhe deu ouro, mas negou a coroa e a filha a um homem sujo. Reidar não se enfureceu — apenas afundou numa tristeza profunda, porque amava a princesa de longe. Poderia ter tomado o reino pela força em uma tarde. Preferiu ir embora. Foi a princesa quem esbofeteou o pai, abandonou o castelo, correu atrás dele e se agarrou às pernas dele dizendo que já não tinha reino, nem sobrenome, nem nada a oferecer além de si mesma.

Décadas depois, em algum lugar do mundo, nasceu o Estilo Deus da Água. E com ele um costume que dura até hoje: *quem se casa com um praticante do Deus da Água abandona a própria casa.*

#block(breakable: false)[
==== A Doutrina

Este estilo é feito de *aparar e devolver*. Existem pouquíssimas formas de atacar por iniciativa própria — e por isso a escola ensina, como disciplina formal, a *arte da provocação*: fazer o inimigo golpear primeiro.
]

Um praticante habilidoso lê o fluxo da mana e devolve qualquer coisa que venha na direção dele. Qualquer coisa mesmo: espada, flecha, magia.

Praticantes usam *armadura completa e equipamento pesado*, porque não precisam se mover. É o estilo dos cavaleiros de palácio e dos nobres cuja função é proteger outra pessoa — a sede da escola fica em Ars, capital do Reino Asura.

#quadro(titulo: [O estilo considerado o mais fraco dos três])[
O mundo classifica o Deus da Água em *último lugar* entre as Três Grandes Escolas, atrás inclusive do Norte, por causa da natureza passiva dele. O livro não corrige essa fama, porque ela é justa: *um Deus da Água que enfrenta alguém que não ataca não faz absolutamente nada.*

Em troca, ele é o único estilo do jogo que mantém outras pessoas vivas, e é a resposta direta ao maior número da tabela de dano. Um Imperador da Espada é a coisa mais perigosa deste livro — e ele perde para um Santo da Água que simplesmente fica parado.
]

#block(breakable: false)[
==== Progressão de PV e PT do Deus da Água

#tbl(5, (left, center, center, center, center),
  [Rank alcançado], [PV ganho], [PT ganho], [Degraus no Dado de Arma], [PV acumulado],
  [Principiante], [1d8 + 3], [—], [+1], [7],
  [Intermediário], [1d8 + 3], [—], [+2], [15],
  [Avançado], [1d10 + 4], [+1], [+3], [24],
  [Santo], [1d10 + 4], [+1], [+4], [34],
  [Rei], [1d12 + 5], [+1], [+5], [45],
  [Imperador], [1d12 + 5], [+1], [+6], [57],
)
]

#linebreak()

_57 PV parece pouco ao lado dos 72 do Deus da Espada — até você lembrar que este é o único estilo do livro que usa *armadura completa*, soma o Bônus de Rank à CA em Postura, e devolve todo golpe que erra. Na prática, ele é o personagem mais difícil de matar do sistema._

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Principiante da Água

_A primeira coisa que se aprende não é um golpe. É esperar._

#quadro(titulo: [◈ Maestria: Fluxo])[
_流 — Nagare._ A técnica base de contra-ataque, aplicável a *todas* as outras técnicas do estilo. A escola a considera a espinha dorsal do Deus da Água e a trata como Segredo, mesmo não sendo um dos Cinco.

*Reação:* quando uma criatura adjacente erra um ataque corpo a corpo contra você, você contra-ataca imediatamente. Dano de arma normal, *sem custo de PT*.

No Principiante, uma vez por rodada. A quantidade cresce com o patamar, e no Avançado ela deixa de depender de erro do inimigo.
]
]

#block(sticky: true)[*Técnicas Principiantes*]

#block(breakable: false)[
*_◆ Aparar_* — _2 PA | Sem custo de PT_
Você não desvia. Você encontra a lâmina dela com a sua, no ângulo em que ela não tem força, e a manda para o lado.
- *Custo:* 1 Reação, quando você for alvo de um ataque corpo a corpo.
- *Efeito:* some o seu *Bônus de Rank* à sua CA contra aquele ataque, resolvido depois de ver a rolagem. Se com isso o ataque passar a errar, o _Fluxo_ dispara imediatamente e *não consome a sua Reação daquele turno*.
- Esta é a técnica que faz o motor do estilo girar: aparar gera erro, erro gera Fluxo, Fluxo gera dano.
]

#block(breakable: false)[
*_Guarda do Corpo_* — _1 PA | Sem custo de PT_
Você existe para que outra pessoa não seja atingida. É literalmente o emprego.
- *Custo:* 1 Reação.
- *Efeito:* quando um aliado a até 1,5m for alvo de um ataque, você se torna o alvo. Aplique a sua CA. Se o ataque errar, o _Fluxo_ dispara.
]

#block(breakable: false)[
*_Peso Não Atrapalha_* — _1 PA_
- *Efeito:* você usa armadura pesada sem penalidade de Furtividade, deslocamento ou fadiga, e dorme com ela vestida sem consequência.
]

#block(breakable: false)[
*_Provocar_* — _1 PA | Sem custo de PT_
A escola ensina isto como matéria formal, e não como truque. Um estilo que não pode atacar primeiro precisa de gente disposta a atacar.
- *Custo:* 1 Ação.
- *Efeito:* teste de *Espírito* contra o Espírito de uma criatura que possa ver e ouvir você (CD 8 + Espírito + Rank). Se falhar, no próximo turno dela ela *tem que atacar você* se conseguir alcançá-lo. Uma vez por criatura por combate.
]

#block(breakable: false)[
*_Base Firme_* — _1 PA_
- *Efeito:* você não pode ser movido contra a vontade, derrubado ou empurrado por nada que permita um teste de Força ou Agilidade. Você tem raiz.
]

#block(sticky: true)[*Talentos Principiantes* — _1 PA cada_]

- *Casco de Tartaruga:* *+4 PV por patamar seu nesta árvore*. Comprável várias vezes, até o número de patamares.
- *Olho na Mão:* você tem *Vantagem* em Intuição para prever o que uma criatura vai fazer no próximo turno, e o Mestre é obrigado a te dar uma dica honesta.
- *Paciência de Pedra:* você é imune a _Amedrontado_ e a efeitos que forcem você a agir contra a vontade. Provocação não funciona em quem ensina provocação.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Intermediário da Água

#quadro(titulo: [◈ Maestria: A Armadura Não Pesa])[
- Você recebe proficiência com *toda* armadura e escudo, e ignora integralmente as penalidades deles.
- Usando armadura pesada, você recebe *+1 na CA* além do valor normal dela.
- O seu _Fluxo_ passa a disparar *duas vezes por rodada*.
]
]

#block(sticky: true)[*Técnicas Intermediárias*]

#block(breakable: false)[
*_◆ Devolver_* — _2 PA | 1 PT_
Você não apara e depois ataca. É o mesmo movimento — o golpe dele vira o seu.
- *Custo:* 1 Reação e 1 PT, quando um ataque corpo a corpo contra você errar.
- *Efeito:* em vez do contra-ataque normal do _Fluxo_, você devolve o golpe com a força dele somada à sua: dano de arma *+ metade do dano que o ataque teria causado* se tivesse acertado.
]

#block(breakable: false)[
*_Trava de Lâmina_* — _1 PA | 1 PT_
- *Custo:* 1 Reação e 1 PT.
- *Efeito:* ao aparar um ataque, você prende a arma do inimigo com a sua. Disputa de *Força*: se vencer, ele não pode atacar no próximo turno dele e você pode escolher desarmá-lo.
]

#block(breakable: false)[
*_Muralha de Um Homem_* — _1 PA_
- *Efeito:* enquanto você não se mover no seu turno, aliados adjacentes a você recebem *Cobertura Superior (+5 CA)* contra ataques à distância que venham da sua direção.
]

#block(breakable: false)[
*_Contra-Investida_* — _1 PA | 1 PT_
- *Custo:* 1 Reação e 1 PT, quando um inimigo se mover para dentro do seu alcance corpo a corpo.
- *Efeito:* você ataca antes que ele chegue. Se acertar, o movimento dele para imediatamente, e ele não consegue completar a Ação que pretendia.
]

#block(sticky: true)[*Talentos Intermediários* — _1 PA cada_]

- *Guarda Longa:* seu alcance de Reação corpo a corpo aumenta para 3 metros. Você apara por cima do ombro dos aliados.
- *Aço Calmo:* +2 PT Máximos.
- *Nome de Reidar:* se você for casado, seu cônjuge abandonou a casa dele para estar com você — costume que a escola herdou da princesa. Você tem uma pessoa no mundo cuja lealdade é absoluta e que o Mestre é obrigado a tratar como aliada permanente. _(É um talento de história, e vale cada PA.)_

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Avançado da Água

_A partir daqui, você deixa de reagir a golpes e passa a reagir a *intenções*._

#quadro(titulo: [◈ Maestria: A Postura])[
Você recebe o *Manto de Touki* completo e a reserva de PT. E ganha o modo de combate que define o estilo:

*Postura de Água (Kamae).* Gastando *1 Ação*, você entra em postura. Enquanto estiver nela:

- Seu Deslocamento é *0* e você *não pode usar Ações para atacar*. Você fica parado. Este é o preço inteiro.
- Você recebe *Reações adicionais* por turno iguais ao seu *Bônus de Rank dividido por 2, arredondado para cima* (+2 no Avançado, +2 no Santo, +3 no Rei, +3 no Imperador).
- Você soma o seu *Bônus de Rank à CA*.
- O _Fluxo_ passa a disparar *também quando você aparar com sucesso*, e não apenas quando o inimigo errar sozinho.

Sair da postura é livre e acontece no instante em que você se mover.

*Leia com atenção:* em postura, você não causa dano nenhum por conta própria. Todo o seu dano vem do que o inimigo decidir fazer. Contra três inimigos agressivos, você é uma trituradora. Contra um arqueiro paciente a trinta metros, você é uma estátua.
]
]

#block(sticky: true)[*Técnicas Avançadas*]

#block(breakable: false)[
*_◆ Fluxo Verdadeiro_* — _3 PA | 2 PT_
Você lê o fluxo da mana e descobre que uma bola de fogo tem um ângulo fraco, igual a uma espada.
- *Custo:* 1 Reação e 2 PT.
- *Efeito:* você apara *qualquer coisa* — flecha, virote, projétil mágico, ou uma magia de ataque de alvo único de rank *Avançado ou inferior*. O efeito é anulado por completo. Se for um projétil físico, ele cai aos seus pés; se for magia de alvo único, você pode *redirecioná-la* para outra criatura à sua escolha a até 9 metros, usando a CD original.
- Não funciona contra magias de área, contra a _Espada de Luz_, nem contra efeitos que não viajem pelo espaço.
]

#block(breakable: false)[
*_Correnteza_* — _2 PA | 1 PT_
- *Custo:* nenhum. Passivo, mediante compra.
- *Efeito:* cada contra-ataque de _Fluxo_ que você acertar *na mesma rodada* causa *+1 Dado de Arma* cumulativo. O terceiro do turno causa dois dados extras, o quarto causa três. Quanto mais te atacam, pior fica para eles.
]

#block(breakable: false)[
*_Peso da Água_* — _2 PA | 1 PT_
- *Custo:* 1 Reação e 1 PT.
- *Efeito:* ao aparar, você redireciona o momento do golpe para o chão. O atacante faz teste de Força (CD 8 + Força + Rank) ou fica _Caído_ e perde o restante das Ações dele naquele turno.
]

#block(sticky: true)[*Talentos Avançados* — _2 PA cada_]

- *Postura Móvel:* em Postura, você pode se mover até 3 metros por turno sem sair dela.
- *Segunda Guarda:* +1 Reação por turno, mesmo fora da Postura.
- *Escudo Vivo:* _Guarda do Corpo_ passa a alcançar 3 metros e pode ser usada uma vez por turno *sem gastar Reação*.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Santo da Água

#quadro(titulo: [◈ Maestria: Ler o Fluxo])[
Você não vê mais o golpe. Você vê a *decisão* de golpear.

- O Mestre é obrigado a te informar o que um inimigo pretende fazer *antes* de resolver a ação, e você pode escolher gastar uma Reação com base nessa informação.
- _Fluxo Verdadeiro_ passa a funcionar contra magias de qualquer rank, *exceto* magias de área e magias de rank Imperador.
- Você é imune a acertos críticos enquanto estiver em Postura.
]
]

#block(sticky: true)[*Técnicas Santas*]

#block(breakable: false)[
*_◆ O Primeiro Segredo_* — _4 PA | 3 PT_
Os *Cinco Segredos* (_五つの奥義_) são as cinco técnicas supremas jamais reveladas do Deus da Água. Cada uma leva uma vida para ser dominada, e ninguém desde o fundador dominou as cinco.
]

*Como funciona na mesa:* o livro *não lista* os Cinco Segredos, porque o cânone também não. Você e o Mestre *inventam o seu*, com nome próprio, usando este molde:

#quadro[
- *Custo:* 1 Reação e 3 PT.
- *Gatilho:* escolha um — um inimigo ataca você; um inimigo ataca um aliado próximo; um inimigo conjura magia; um inimigo se move; um inimigo tenta fugir.
- *Orçamento:* escolha *duas* — anula o efeito por completo; devolve o dano ao atacante; aplica uma condição (Caído, Preso, Desarmado, Atordoado); atinge todos os inimigos a 3m; concede a você e a um aliado +5 de CA até o próximo turno.
- *Amarra:* escreva uma condição de uso (estar em Postura, estar com armadura completa, o inimigo ter mais PV que você, ser a primeira Reação do combate).
]

Um Segredo é uma técnica *sua*. Ela recebe o seu nome, e outros praticantes do estilo vão querer estudá-la.

#block(breakable: false)[
*_Espelho_* — _3 PA | 2 PT_
- *Custo:* 1 Reação e 2 PT.
- *Efeito:* quando um inimigo usar contra você qualquer técnica marcial de rank Santo ou inferior, você a executa de volta imediatamente, mesmo sem possuí-la, usando seus próprios atributos.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rei da Água

#quadro(titulo: [◈ Maestria: A Arte da Provocação])[
Você aperfeiçoou a única forma de ataque que o seu estilo tem: *fazer com que ataquem você*.

- _Provocar_ deixa de custar Ação — vira *livre*, uma vez por turno.
- Criaturas que falharem na provocação atacam você com *Desvantagem*, porque você as puxou para um terreno onde elas não deveriam estar.
- Enquanto você estiver em Postura, inimigos que *escolherem não atacar você* e estiverem ao seu alcance sofrem *Desvantagem* em tudo o que fizerem naquele turno. Ignorar um Rei da Água é uma decisão cara.
]
]

#block(sticky: true)[*Técnicas Reais*]

#block(breakable: false)[
*_◆ O Segundo Segredo_* — _5 PA | 3 PT_
Invente o seu segundo Segredo, com o mesmo molde do patamar Santo — mas escolha *três* opções do orçamento em vez de duas.
]

#block(breakable: false)[
*_Maré de Retorno_* — _4 PA | 3 PT_
- *Custo:* 1 Ação e 3 PT. Requer Postura.
- *Efeito:* até o início do seu próximo turno, *todo* ataque corpo a corpo que errar você dispara _Fluxo_ automaticamente, sem limite de Reações. Um grupo inteiro que decida atacar de uma vez pode ser aniquilado num turno só.
]

#block(breakable: false)[
*_Nada Passa_* — _4 PA | 2 PT_
- *Custo:* 1 Reação e 2 PT.
- *Efeito:* você apara um efeito de *área* — a magia acontece, mas não atinge nem você nem aliados adjacentes a você. Você abriu um corredor no meio da explosão com a lâmina.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Imperador da Água

#quadro(titulo: [◈ Maestria: Domínio Absoluto])[
- Suas Reações em Postura deixam de ter limite numérico: você reage a *tudo o que acontecer ao seu alcance*, uma vez por criatura por turno.
- O seu alcance de Reação corpo a corpo aumenta para *4,5 metros*.
- Você pode entrar em Postura *como Reação*, no instante em que o combate começar.
]
]

#block(sticky: true)[*Técnicas Imperiais*]

#block(breakable: false)[
*_◆ Reino da Espada da Privação_* — _6 PA | 5 PT_
_剥奪剣界 — Hakudatsu Ken-kai._ O Sexto Segredo fantasma, criado pela Deusa da Água Reida Reia ao fundir os dois Segredos mais difíceis dos Cinco. Ao entrar em postura, você estabelece um *domínio tridimensional de ataque* com o tamanho aproximado de um salão de baile, cobrindo as seis direções — frente, trás, esquerda, direita, cima e baixo. Se qualquer inimigo dentro do domínio se mover, *inclusive movimentar mana*, a técnica responde sozinha e o corta.
- *Custo:* 2 Ações e 5 PT para estabelecer. Requer Postura, e você não pode sair dela.
- *Efeito:* domínio esférico de *12 metros* de raio centrado em você. Enquanto durar, qualquer criatura hostil dentro dele que *se mova, ataque, conjure ou canalize mana* é atingida automaticamente por um ataque seu, sem rolagem, uma vez por turno dela. Isso inclui a simples tentativa de conjurar: o cântico é interrompido no primeiro verso.
- *Duração:* enquanto você mantiver a Postura e tiver ao menos 1 PT. Cada turno mantido consome 1 PT.
- *As duas limitações, que são canônicas e absolutas:*
  - É contra-ataque puro. *Um alvo completamente imóvel não é atingido* — quem entender a técnica pode simplesmente parar e caminhar para fora dela devagar.
  - Ela não corta mais rápido que o seu tempo de reação. Contra a _Espada de Luz Verdadeira_, ela chega tarde.
]

#block(breakable: false)[
*_O Terceiro Segredo_* — _5 PA | 4 PT_
Invente o seu terceiro Segredo, com *quatro* opções do orçamento.
]

#quadro(titulo: [O Caminho para Deusa da Água])[
Existe *uma só* Deusa da Água no mundo por vez, e o título não se conquista matando ninguém — como no Deus da Espada — nem por aclamação de facção — como no Norte. Conquista-se *dominando ao menos três dos Cinco Segredos*.

Se você comprou os três Segredos deste livro, você já cumpriu o requisito mecânico. O que falta é a narrativa: o mundo precisa ver, e a titular precisa reconhecer. Reidar, o primeiro, foi o único da história a dominar os cinco.

Homens que assumem o posto herdam o nome *Reidar*. Mulheres, *Reida*. O seu nome anterior deixa de importar.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#largo-inline[
== O Triângulo Fechado — Regras Cruzadas

Agora que os três estilos existem, as regras de matchup deixam de ser abstratas.

#tbl(2, (left, left),
  [Confronto], [O que acontece mecanicamente],
  [*Espada vence Norte*], [O Norte perde as técnicas \[Improviso\] se o Deus da Espada não der tempo. Regra: se um Deus da Espada agir antes do praticante do Norte no primeiro turno, o Norte *não pode usar O Improviso* naquele combate. Ele não teve tempo de olhar em volta.],
  [*Água vence Espada*], [O Deus da Espada precisa atacar, e atacar é exatamente o que alimenta o _Fluxo_. Além da Vantagem de Estilo normal, o Deus da Água dispara _Fluxo_ mesmo contra ataques que *acertem*, se o atacante for do Estilo Deus da Espada.],
  [*Norte vence Água*], [O Norte não ataca de frente — ele derruba o teto, joga areia, ataca de um ângulo impossível. Regra: técnicas do Norte marcadas com *\[Improviso\] * e a técnica _Corte Reverso_ *ignoram completamente a Postura de Água* e todas as Reações defensivas dela.],
  [*A exceção que fura tudo*], [Nem o _Fluxo_, nem _Fluxo Verdadeiro_, nem _Nada Passa_ conseguem aparar a *Espada de Luz*. A única resposta no mundo inteiro é a _Reversão de Luz_, e ela pertence ao próprio Estilo Deus da Espada.],
)

#linebreak() 

*Por que essa última linha importa mais que as outras três:* ela significa que o Deus da Água vence o Deus da Espada em noventa por cento dos turnos e ainda assim pode perder o combate inteiro em um único movimento. O estilo defensivo mais completo do mundo tem exatamente *um* buraco, e o estilo que ele contra-ataca é dono dele.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Arquearia

_O Arqueiro — Atirador → Lenda da Flecha_

Guerreiros desprezam o arco, e o livro já explicou por quê: contra alguém que veste Touki, uma flecha comum quase não arranha.
]

*A fama é injusta e a matemática prova.* Monstros não vestem aura. Feras não vestem aura. Bandidos, soldados, cavaleiros, magos e a esmagadora maioria de tudo o que uma mesa enfrenta *não vestem aura nenhuma* — e contra todos eles, o arqueiro causa mais dano por turno que qualquer outra coisa deste livro, a noventa metros de distância, sem gastar recurso, sem precisar chegar perto e sem correr risco nenhum.

Depois, no dia em que o chefe humano aparece, ele descobre que passou noventa por cento da campanha sendo o melhor do grupo e vai passar esta luta sendo o pior.

#quadro(titulo: [O Desenho, dito em voz alta])[
Esta árvore é deliberadamente *desequilibrada por situação*, e não por número:

- Contra alvos *sem Touki*: o maior dano sustentado do jogo.
- Contra alvos de *rank Santo ou superior*: o _Manto de Touki_ reduz o dano de cada flecha pelo *dobro do Bônus de Rank* do alvo, e um Imperador ignora 12 por tiro.

A árvore concede *uma* forma de furar aura, no patamar *Predador*, e ela é cara de propósito. Se algum dia você acrescentar uma segunda, a fantasia inteira desaba.
]

#block(breakable: false)[
==== A Condição da Escola

#quadro(titulo: [Marcado])[
Sempre que você acertar uma criatura com um disparo, ela fica *Marcada* até o fim do próximo turno dela. Você viu como ela se move, onde ela protege e onde ela não protege.

*Efeitos:* seus disparos contra um alvo Marcado *ignoram Cobertura Leve*, somam o seu *Bônus de Rank ao dano*, e não sofrem penalidade por distância longa.

Só você enxerga a Marca. Só você se beneficia dela. Ela é o motivo pelo qual o arqueiro nunca troca de alvo sem razão.
]
]

#block(breakable: false)[
==== Progressão de PV e PT do Arqueiro

#tbl(5, (left, center, center, center, center),
  [Patamar], [PV ganho], [PT ganho], [Degraus no Dado de Arma], [PV acumulado],
  [Atirador], [1d8 + 2], [—], [+1], [7],
  [Caçador], [1d8 + 2], [—], [+2], [13],
  [Franco-Atirador], [1d8 + 3], [+1], [+3], [21],
  [Olho de Águia], [1d10 + 3], [+1], [+4], [30],
  [Predador], [1d10 + 4], [+1], [+5], [39],
  [Lenda da Flecha], [1d12 + 4], [+1], [+6], [49],
)
]

#linebreak()

_49 PV — entre o Tático (46) e o Deus do Norte (54). Ele não é frágil como um mago, mas também não é ninguém que você queira ver na linha de frente. *Dano por disparo no topo:* arco longo (d8) com 6 degraus = 3d10, mais Agilidade e Bônus de Rank. Três disparos por turno._

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Atirador (1º Patamar)

#quadro(titulo: [◈ Maestria: Olho do Caçador])[
- Você *não sofre Desvantagem por distância longa*, nunca. O alcance máximo da sua arma é o alcance útil.
- Você ignora *Cobertura Leve* e não sofre penalidade por atirar em meio a aliados engajados em corpo a corpo.
- Você identifica, olhando, a *distância exata* até qualquer coisa visível — o que o torna o melhor observador de artilharia e de cerco que um exército pode contratar.
]
]

#block(sticky: true)[*Técnicas Atirador*]

#block(breakable: false)[
*_◆ Disparo Duplo_* — _2 PA | Sem custo de PT_
- *Custo:* 1 Ação.
- *Efeito:* dois disparos contra o mesmo alvo ou alvos diferentes. O segundo usa o Dado de Arma *um degrau abaixo*. Se ambos acertarem o mesmo alvo, ele fica _Marcado_ e _Caído_.
]

#block(breakable: false)[
*_Tiro de Contenção_* — _1 PA | Sem custo de PT_
- *Custo:* 1 Ação.
- *Efeito:* disparo que causa metade do dado de arma, mas o alvo faz teste de *Vigor* (CD 8 + Agilidade + Rank) ou tem o *Deslocamento reduzido a metade* por 2 turnos. Você acertou a perna.
]

#block(breakable: false)[
*_Tiro de Objeto_* — _1 PA | Sem custo de PT_
- *Custo:* 1 Ação.
- *Efeito:* você acerta um objeto específico e pequeno a qualquer distância visível, sem rolagem: a corda que segura o lustre, o cadeado, o odre de óleo, o cantil, a tocha, o frasco na mão do inimigo. _(É a técnica que faz o arqueiro continuar relevante contra quem veste aura.)_
]

#block(breakable: false)[
*_Flecha de Sinal_* — _1 PA_
- *Efeito:* você carrega flechas de assobio, de fumaça colorida e incendiárias. Comunicação a quilômetros, incêndio à distância, e um sinal de emboscada que o grupo inteiro reconhece.
]

#block(sticky: true)[*Talentos Atirador* — _1 PA cada_]

- *Aljava Cheia:* você nunca fica sem flechas em terreno com madeira, e fabrica munição durante um Descanso Curto.
- *Passo e Tiro:* disparar não provoca ataques de oportunidade.
- *Braço Firme:* *+4 PV por patamar seu nesta árvore*. Comprável várias vezes, até o número de patamares.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Caçador (2º Patamar)

#quadro(titulo: [◈ Maestria: A Marca Fica])[
- A condição _Marcado_ passa a durar *o combate inteiro*, e não apenas um turno.
- Você pode Marcar uma criatura *sem atacá-la*, gastando 1 Ação para observá-la a qualquer distância.
- Contra criaturas Marcadas, você sabe automaticamente PV aproximado, resistências e se ela veste Touki. *Você descobre no primeiro turno se esta luta é sua ou não é.*
]
]

#block(sticky: true)[*Técnicas Caçador*]

#block(breakable: false)[
*_◆ Tiro Certeiro_* — _2 PA | 1 PT_
- *Custo:* 1 Ação e 1 PT.
- *Efeito:* um disparo contra alvo _Marcado_ que *acerta automaticamente* e crita em *19-20*.
]

#block(breakable: false)[
*_Chuva de Flechas_* — _1 PA | 1 PT_
- *Custo:* 1 Ação e 1 PT.
- *Efeito:* você dispara em arco sobre uma área de 6m de raio a até o alcance máximo. Todos na área fazem teste de Agilidade (CD 8 + Agilidade + Rank) ou sofrem o dano de arma completo. Ignora Cobertura que não seja teto.
]

#block(breakable: false)[
*_Armadilha de Caça_* — _1 PA_
- *Efeito:* você monta armadilhas de caçador em 10 minutos. Uma criatura que entrar sofre *3d6* e fica _Presa_ até passar num teste de Força. Você pode ter até *Agilidade* armadilhas ativas.
]

#block(breakable: false)[
*_Tiro Perfurante_* — _1 PA | 1 PT_
- *Custo:* 1 Ação e 1 PT.
- *Efeito:* o disparo atravessa o alvo e continua, atingindo a próxima criatura em linha reta atrás dele com o mesmo dano. Contra alvo _Atolado_, _Preso_ ou _Congelado_, atravessa até três.
]

#block(sticky: true)[*Talentos Caçador* — _1 PA cada_]

- *Leitura de Presa:* Vantagem em Sobrevivência e Percepção para rastrear e emboscar. _(Se você já tem isto pelo Tático ou pelo Norte, escolha outro talento — o sistema não empilha o mesmo bônus.)_
- *Corda Rápida:* recarregar besta deixa de custar Ação.
- *Distância É Segurança:* contra criaturas a mais de 18 metros, você recebe *+2 na CA*.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Franco-Atirador (3º Patamar)

#quadro(titulo: [◈ Maestria: Aura na Corda])[
Você recebe o *Manto de Touki* completo e a reserva de *Pontos de Touki*, como toda árvore do Corpo no terceiro patamar.

E ganha o que o resto do mundo não esperava de um arqueiro: *você reveste a flecha de aura*. Seus disparos contam como *mágicos* e ignoram *Resistência* a dano perfurante — mas ainda *não* furam o _Manto de Touki_ de ninguém. Isso continua trancado.

Além disso, o alcance de todas as suas armas de disparo *dobra*.
]
]

#block(sticky: true)[*Técnicas Franco-Atirador*]

#block(breakable: false)[
*_◆ Tiro do Céu_* — _3 PA | 2 PT_
- *Custo:* 2 Ações e 2 PT.
- *Efeito:* um único disparo a até *o dobro do alcance máximo*, contra um alvo que você consiga ver de alguma forma. Role o Dado de Arma *três vezes*. Se o alvo estiver _Marcado_ e não souber que você existe, o acerto é *crítico automático*.
]

#block(breakable: false)[
*_Tiro Interrompido_* — _2 PA | 1 PT_
- *Custo:* 1 Reação e 1 PT, quando uma criatura visível começar a conjurar magia, beber uma poção ou usar um item.
- *Efeito:* disparo automático. Se causar dano, o alvo faz teste de *Espírito* (CD 8 + Agilidade + Rank) ou *perde a ação e o recurso gasto*. Contra magos sem Touki, isto ganha combates sozinho.
]

#block(breakable: false)[
*_Ninho_* — _2 PA_
- *Efeito:* gastando 10 minutos preparando uma posição elevada ou oculta, você recebe, enquanto permanecer nela: *Vantagem* em todos os disparos, *+2 no dano*, e ninguém consegue determinar a sua posição sem um teste de Percepção contra a sua Furtividade com Desvantagem.
]

#block(sticky: true)[*Talentos Franco-Atirador* — _2 PA cada_]

- *Fôlego Estável:* +3 PT Máximos.
- *Três na Corda:* _Disparo Duplo_ passa a ser triplo, com o terceiro disparo dois degraus abaixo.
- *Nunca Aqui:* depois de atirar, você pode gastar 1 PT para se mover 9m sem provocar ataques de oportunidade e refazer Furtividade imediatamente.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Olho de Águia (4º Patamar)

#quadro(titulo: [◈ Maestria: A Distância Não Existe])[
- Você acerta qualquer alvo que consiga *ver*, sem limite de alcance. Uma torre a um quilômetro, um cavaleiro no fim do vale, uma figura no alto da muralha.
- Você enxerga com precisão perfeita a até *1 km*, atravessa neblina, escuridão e chuva, e identifica rostos a distâncias que ninguém acreditaria.
- Seus disparos contra alvos _Marcados_ *ignoram Cobertura Total*, desde que exista qualquer trajetória física — uma fresta, uma seteira, um vão de porta entreaberta.
]
]

#block(sticky: true)[*Técnicas Olho de Águia*]

#block(breakable: false)[
*_◆ Um Alvo, Um Tiro_* — _4 PA | 3 PT_
- *Custo:* 2 Ações e 3 PT. Uma vez por combate.
- *Efeito:* contra um alvo _Marcado_ que esteja com *metade ou menos* dos PV, o disparo *reduz o alvo a 0 PV automaticamente*, sem rolagem de ataque nem de dano.
- *Não funciona* contra criaturas que vistam Touki, contra criaturas de rank Rei ou superior, nem contra nada com mais de 200 PV máximos. Contra todo o resto do mundo, é uma execução.
]

#block(breakable: false)[
*_Tempestade de Setas_* — _3 PA | 2 PT_
- *Custo:* 1 Ação e 2 PT.
- *Efeito:* você dispara contra *todas* as criaturas hostis que consiga ver dentro de 30m, com uma rolagem de ataque separada para cada. Dano completo em todas.
]

#block(breakable: false)[
*_Flecha Amarrada_* — _2 PA | 1 PT_
- *Custo:* 1 Ação e 1 PT.
- *Efeito:* o disparo prende o alvo a uma superfície ou a outra criatura. Teste de *Força* (CD 8 + Agilidade + Rank) ou ele fica *Preso*, com Deslocamento 0, até gastar 1 Ação e passar no teste.
]

#block(sticky: true)[*Talentos Olho de Águia* — _2 PA cada_]

- *Marca Perene:* a condição _Marcado_ passa a durar *até o próximo Descanso Longo*, mesmo se a criatura fugir, se esconder ou atravessar o continente. Você a encontra de novo.
- *Contra-Bateria:* quando um inimigo te atacar à distância, você sabe exatamente onde ele está e o Marca automaticamente.
- *Peso da Aljava:* suas flechas causam *+1d8* contra criaturas Grandes ou maiores.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Predador (5º Patamar)

#quadro(titulo: [◈ Maestria: A Flecha que Fura])[
*Este é o patamar pelo qual o arqueiro esperou a campanha inteira.*

Você aprendeu a comprimir Touki na ponta da flecha em vez de espalhá-lo pela haste — e uma agulha de aura atravessa um manto de aura, do mesmo jeito que uma agulha atravessa um lençol esticado.

*Flecha de Touki:* gastando *3 PT*, um único disparo *ignora completamente o Manto de Touki* do alvo e toda redução de dano contra projéteis.

*É caro de propósito, e não existe segunda forma.* Um Predador com 12 PT fura aura três ou quatro vezes por combate e passa o resto dos turnos fazendo outra coisa — exatamente como o Ladino depois do _Primeiro Golpe_.
]
]

#block(sticky: true)[*Técnicas Predador*]

#block(breakable: false)[
*_◆ Caçada_* — _4 PA | 2 PT_
- *Custo:* 1 Ação e 2 PT.
- *Efeito:* escolha um alvo _Marcado_. Até o fim do combate, *todos* os seus disparos contra ele são feitos com Vantagem, critam em 18-20, e cada disparo consecutivo que acertar causa *+1d10* cumulativo. Trocar de alvo encerra o efeito.
]

#block(breakable: false)[
*_Flecha do Fim da Estrada_* — _4 PA | 4 PT_
- *Custo:* 1 Reação e 4 PT, quando uma criatura visível tentar fugir, se teleportar, voar para fora de alcance ou entrar por uma porta.
- *Efeito:* disparo automático com _Flecha de Touki_ embutida. Além do dano, o alvo faz teste de *Vigor* (CD 8 + Agilidade + Rank) ou a fuga *falha* — ele não sai do lugar.
]

#block(sticky: true)[*Talento Predador* — _3 PA_]

- *Aljava Divina:* a _Flecha de Touki_ passa a custar *2 PT* em vez de 3. Este é o único desconto que a árvore oferece, e ele é intencionalmente pequeno.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Lenda da Flecha (6º Patamar)

#quadro(titulo: [◈ Maestria: O Tiro Que Já Aconteceu])[
- Você recebe *1 Ação adicional por turno*, que só pode ser usada para disparar.
- Seus disparos *não podem ser aparados, bloqueados nem interceptados* por efeito algum de rank Rei ou inferior, incluindo o _Fluxo Verdadeiro_ do Deus da Água.
- Criaturas _Marcadas_ por você não conseguem se esconder de você, em circunstância nenhuma, nem por magia.
]
]

#block(sticky: true)[*Técnicas Lenda da Flecha*]

#block(breakable: false)[
*_◆ A Flecha que Não Erra_* — _6 PA | 5 PT_
Você não mira nela. Você mira no ponto do futuro em que ela vai estar, e a flecha espera.
- *Custo:* 2 Ações e 5 PT. Uma vez por combate.
- *Efeito:* o disparo *acerta automaticamente*, ignora CA, Cobertura, Manto de Touki, armadura mágica e barreiras físicas de qualquer tipo. Role o Dado de Arma *cinco vezes* e some Agilidade + Bônus de Rank.
- Alcance: *qualquer lugar que você já tenha visto*. Se o alvo estiver _Marcado_, você não precisa vê-lo agora — só precisa saber que ele existe.
]

#block(breakable: false)[
*_Céu Cheio_* — _5 PA | 4 PT_
- *Custo:* 2 Ações e 4 PT.
- *Efeito:* você dispara sessenta flechas em três segundos sobre uma área de 30m de raio a qualquer distância. *12d10* de dano perfurante, teste de Agilidade (CD 8 + Agilidade + Rank) para metade, e a área vira terreno difícil eriçado de hastes. Criaturas _Marcadas_ na área não têm direito ao teste.
]

#block(sticky: true)[*Talento Lenda da Flecha* — _4 PA_]

- *Nenhum Deles Chegou Perto:* enquanto você tiver ao menos 1 PT e uma linha de visão desimpedida, criaturas hostis não conseguem se aproximar a menos de 9 metros de você sem primeiro passar num teste de Espírito (CD 8 + Agilidade + Rank). Elas sabem o que acontece quando alguém tenta.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Arquearia)

_Narrativo. Não se compra._

#quadro(titulo: [◈ A Flecha do Destino])[
_A Flecha que Não Erra_, a técnica Lenda da Flecha, já acerta qualquer lugar que o arqueiro tenha visto. O patamar Divino dispensa até isso: a flecha encontra um alvo que o arqueiro *descreveu*, mesmo sem nunca tê-lo visto, mesmo que o alvo ainda não exista no momento em que a corda é solta.

A lenda mais citada — e mais discutida nas guildas de caçadores — é a de uma flecha disparada contra "quem quer que erga a espada contra a cidade", solta antes de qualquer cerco começar, que só encontrou seu alvo *anos depois*, atravessando uma armadura que na época do disparo ainda nem tinha sido forjada.

Ninguém sabe reproduzir isso de propósito. É por isso que continua sendo lenda, e não uma técnica.

Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o tipo de tiro que uma campanha inteira é construída para explicar, e o mundo deve mudar por causa disso.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Lutador

_Armas Pesadas e Luta Corpo a Corpo — Briguento → Lenda Viva_

Os três Estilos Divinos são escolas: têm sede, mestre, hierarquia e um nome que abre portas. O Lutador não tem nada disso. Ele tem um martelo, ou não tem nem isso, e aprendeu na porta de taverna, no fosso de mina, na fila de recrutamento.
]

É o Ofício de quem resolve com *peso e impacto* — e é a única árvore do livro em que *as mãos vazias são uma opção legítima até o fim*, e não um plano de emergência.

#quadro(titulo: [As Duas Metades])[
Esta árvore cobre duas coisas que parecem diferentes e são a mesma filosofia: força bruta sem finesse.

- *Peso* — martelo, machado, montante. Momento, área, derrubar formação, quebrar arma e escudo.
- *Impacto* — punho, cotovelo, joelho, agarrão. Luta colada, onde a espada longa não tem espaço para trabalhar.

As Maestrias servem as duas. As técnicas são marcadas com *\[Peso\]* ou *\[Impacto\]* quando exigem uma delas.
]

#block(breakable: false)[
==== A Condição da Escola

#quadro(titulo: [Quebrantado])[
Você não fere. Você *gasta* a pessoa.

Sempre que você acertar uma criatura com um ataque desta árvore, ela ganha *1 acúmulo de Quebrantado*, até o máximo do seu *Bônus de Rank*.

*Cada acúmulo:* −1 na CA e −1 no dano de todos os ataques dela.

Os acúmulos duram até o fim do combate e *não podem ser curados* por magia de Cura — não é ferimento, é o corpo parando de funcionar direito. Só um Descanso Curto limpa.

No sexto acúmulo, um cavaleiro de armadura completa perde 6 de CA e 6 de dano. Ele ainda está de pé, ainda está inteiro, e já não é mais um problema.
]
]

#quadro(titulo: [O Combo — Momento])[
Se você se mover *6 metros ou mais em linha reta* antes de atacar, o ataque causa *+1 Dado de Arma*.

E contra um alvo com *3 ou mais acúmulos de Quebrantado*, qualquer ataque seu que o derrube o arremessa *4,5m* na direção que você escolher, atingindo quem estiver no caminho com metade do dano.
]

#block(breakable: false)[
==== Progressão de PV e PT do Lutador

#tbl(5, (left, center, center, center, center),
  [Patamar], [PV ganho], [PT ganho], [Degraus no Dado de Arma], [PV acumulado],
  [Briguento], [1d10 + 3], [—], [+1], [9],
  [Combatente], [1d10 + 3], [—], [+2], [18],
  [Veterano], [1d12 + 4], [+1], [+3], [28],
  [Campeão], [1d12 + 4], [+1], [+4], [39],
  [Mestre de Guerra], [2d6 + 5], [+1], [+5], [51],
  [Lenda Viva], [2d6 + 5], [+1], [+6], [63],
)
]

#linebreak()

_63 PV. Mais que o Deus do Norte (54), menos que o Deus da Espada (72). Ele bate menos que a Espada por golpe e degrada o inimigo a cada acerto — no quarto turno de uma luta longa, ele está ganhando._

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Briguento (1º Patamar)

#quadro(titulo: [◈ Maestria: O Corpo é a Arma])[
- *Seus ataques desarmados usam Dado Base d6* — o mesmo de um objeto improvisado — e recebem todos os seus degraus normalmente. No sexto patamar, o seu punho é *2d12*.
- Você é proficiente com toda arma pesada, de duas mãos e improvisada, e pode empunhar armas de duas mãos com uma só sofrendo apenas um degrau a menos.
- Você aplica *Quebrantado* e usa *Momento*, descritos acima.
]
]

#block(sticky: true)[*Técnicas Briguente* — _1 PA cada (◆ 2 PA)_]

*_◆ Investida Devastadora_*\[Peso\] — _2 PA_
- *Custo:* 1 Ação. Requer 6m de corrida em linha reta.
- *Efeito:* ataque com *+2 Dados de Arma* (em vez de +1 do Momento). Se acertar, o alvo faz teste de *Força* (CD 8 + Força + Rank) ou fica _Caído_ e ganha *2 acúmulos* de Quebrantado em vez de 1.

*_Agarrão_*\[Impacto\]
- *Custo:* 1 Ação.
- *Efeito:* disputa de *Força*. Vencendo, o alvo fica *Agarrado*: Deslocamento 0, Desvantagem em ataques contra qualquer um que não seja você, e você o arrasta 3m por turno. Enquanto agarrado, seus ataques desarmados contra ele acertam automaticamente.

*_Golpe Circular_*\[Peso\]
- *Custo:* 1 Ação.
- *Efeito:* ataque contra *todas* as criaturas adjacentes a você, com uma rolagem separada para cada. Dado de Arma um degrau abaixo.

*_Cabeçada_*\[Impacto\]
- *Custo:* 1 Ação.
- *Efeito:* ataque desarmado que causa metade do dado, mas o alvo faz teste de *Vigor* (CD 8 + Força + Rank) ou fica *Atordoado* até o fim do próximo turno dele. Você também sofre *1d4* — foi a sua testa.

*_Quebrar Equipamento_*\[Peso\]
- *Custo:* 1 Ação.
- *Efeito:* em vez de ferir, você mira no que ele está segurando. Teste de *Força* (CD 8 + Força + Rank): falha significa que o *escudo ou a arma dele quebra* se for mundana, ou fica inutilizável por 3 turnos se for mágica.

#block(sticky: true)[*Talentos Briguente* — _1 PA cada_]

- *Couro Grosso:* +4 PV por patamar seu nesta árvore. Comprável várias vezes, até o número de patamares.
- *Punho de Mineiro:* seus ataques desarmados causam dano *letal* e contam como arma pesada para qualquer efeito.
- *Sem Vergonha:* você pega qualquer objeto do cenário e o usa como arma pesada — banco, remo, cadáver, porta arrancada. Dado d6, todos os seus degraus, e ele quebra depois de três acertos.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Combatente (2º Patamar)

#quadro(titulo: [◈ Maestria: Não Para de Vir])[
- O bônus de *Momento* sobe para *+2 Dados de Arma*.
- Você não sofre penalidade por lutar agarrado, em espaço apertado, no chão ou preso a alguém — na verdade, seus ataques desarmados causam *+2* nessas situações.
- Criaturas *Agarradas* por você ganham *1 acúmulo de Quebrantado* no início de cada turno delas, sem que você faça nada. Você só está apertando.
]
]

#block(sticky: true)[*Técnicas Combatente* — _1 PA cada (◆ 2 PA)_]

*_◆ Arremesso_*\[Impacto\] — _2 PA_
- *Custo:* 1 Ação. Requer alvo _Agarrado_.
- *Efeito:* você arremessa a criatura até *9 metros*. Ela sofre *4d8 + Força* de dano contundente, fica _Caída_, e qualquer criatura no ponto de queda faz teste de Agilidade (CD 8 + Força + Rank) ou sofre metade e também cai.
- Funciona em criaturas de até duas categorias de tamanho acima da sua. Sim, você pode arremessar um cavalo.

*_Golpe Ascendente_*\[Peso\]
- *Custo:* 1 Ação e 1 PT.
- *Efeito:* ataque que lança o alvo 4,5m para cima. Ele cai no fim do turno dele, sofrendo dano de queda e ficando _Caído_.

*_Trava_*\[Impacto\]
- *Custo:* 1 Ação e 1 PT. Requer alvo _Agarrado_.
- *Efeito:* teste de *Vigor* do alvo (CD 8 + Força + Rank). Falha: ele fica *Preso e Incapacitado* enquanto você mantiver — não age, não conjura, não reage. Você também não pode fazer mais nada além de manter.

*_Peso Contra Peso_*\[Peso\]
- *Custo:* 1 Reação e 1 PT, quando uma criatura tentar te empurrar, derrubar ou atravessar seu espaço.
- *Efeito:* ela falha automaticamente e ganha *2 acúmulos* de Quebrantado.

#block(sticky: true)[*Talentos Combatente* — _1 PA cada_]

- *Mãos Grandes:* você agarra criaturas de qualquer tamanho e carrega o dobro de peso.
- *Fôlego de Fosso:* +2 PT Máximos.
- *Cicatriz Velha:* enquanto estiver com metade ou menos dos PV, seus ataques ganham *+1 Dado de Arma*.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Veterano (3º Patamar)

#quadro(titulo: [◈ Maestria: Nada Segura])[
Você recebe o *Manto de Touki* completo e a reserva de *PT*, como toda árvore do Corpo no terceiro patamar.

E ganha o que separa um brigão de um veterano:

- Seus ataques *atravessam*. Ao reduzir uma criatura a 0 PV, ou ao acertar um alvo com 4+ acúmulos de Quebrantado, o ataque continua e atinge outra criatura adjacente com o dano completo.
- O limite de acúmulos de Quebrantado deixa de ser o seu Bônus de Rank e passa a ser o *dobro* dele.
]
]

#block(sticky: true)[*Técnicas Veterano* — _2 PA cada (◆ 3 PA)_]

*_◆ Esmagar_*\[Peso\] — _3 PA | 2 PT_
- *Custo:* 1 Ação e 2 PT.
- *Efeito:* um ataque com o Dado de Arma rolado *três vezes*. Contra alvo _Caído_, _Agarrado_, _Preso_ ou _Atolado_, *acerta automaticamente* e aplica *3 acúmulos* de Quebrantado.

*_Onda de Choque_*\[Peso\] — _2 PT_
- *Custo:* 1 Ação e 2 PT.
- *Efeito:* você golpeia o chão. Todas as criaturas em 6m fazem teste de *Agilidade* (CD 8 + Força + Rank): falha resulta em *5d8* contundente, _Caído_ e 1 acúmulo de Quebrantado. Estruturas e barreiras com PV na área sofrem o dano dobrado.

*_Estrangular_*\[Impacto\] — _1 PT_
- *Custo:* 1 Ação e 1 PT. Requer alvo _Agarrado_.
- *Efeito:* o alvo não consegue falar, gritar nem *recitar cântico algum*, e sofre *3d6* por turno enquanto você mantiver. Contra magos, isto encerra combates.

#block(sticky: true)[*Talentos Veterano* — _2 PA cada_]

- *Braço de Bigorna:* seus ataques desarmados sobem *um degrau adicional* de Dado de Arma, permanentemente.
- *Duas Mãos, Uma Arma:* empunhar arma de duas mãos com uma só deixa de custar degrau, e você pode segurar um escudo na outra.
- *Cai Quem Toca:* criaturas que te acertarem corpo a corpo ganham *1 acúmulo de Quebrantado*.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Campeão (4º Patamar)

#quadro(titulo: [◈ Maestria: Ainda Estou Aqui])[
- Você *não pode* ser derrubado, empurrado, agarrado, arremessado nem movido contra a vontade por nada de patamar igual ou inferior ao seu.
- Quando você for reduzido a 0 PV, você *termina o turno atual antes de cair* — com todas as Ações restantes. Uma vez por combate.
- Você é imune a _Amedrontado_ e a _Atordoado_.
]
]

#block(sticky: true)[*Técnicas Campeão* — _3 PA cada (◆ 4 PA)_]

*_◆ Ruína_*\[Peso\] — _4 PA | 3 PT_
- *Custo:* 2 Ações e 3 PT.
- *Efeito:* um único golpe descendente com o Dado de Arma rolado *quatro vezes*. Ignora *todo* bônus de CA de escudo e Cobertura, e aplica *acúmulos de Quebrantado iguais ao seu Bônus de Rank de uma vez só*.
- Contra estruturas, portões e barreiras mágicas com PV, o dano é *triplicado*.

*_Mão na Garganta_*\[Impacto\] — _2 PT_
- *Custo:* 1 Ação e 2 PT.
- *Efeito:* você atravessa o campo até 9 metros, ignorando ataques de oportunidade, e agarra automaticamente uma criatura visível — sem disputa, sem teste. Ela fica _Agarrada_ e ganha 2 acúmulos de Quebrantado.

#block(sticky: true)[*Talentos Campeão* — _3 PA cada_]

- *Colheita:* cada criatura reduzida a 0 PV por você devolve *1 PT* e permite mover-se 3m sem gastar Ação.
- *Peso Absoluto:* o _Arremesso_ alcança 18m e o dano dobra.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Mestre de Guerra (5º Patamar)

#quadro(titulo: [◈ Maestria: Arma Viva])[
O Touki deixa de revestir a arma e passa a *estendê-la*.

- Seu alcance corpo a corpo aumenta para *3 metros*, com qualquer arma e com as mãos vazias.
- Seus ataques contam como *armas de cerco* contra estruturas: você derruba portão, muralha e ponte sem precisar de magia.
- Cada acúmulo de Quebrantado no alvo agora concede a *você* +1 no acerto contra ele. Quanto mais gasto ele fica, menos ele consegue evitar você.
]
]

#block(sticky: true)[*Técnicas Mestre de Guerra* — _3 PA cada (◆ 5 PA)_]

*_◆ Não Sobra Formação_*\[Peso\] — _5 PA | 3 PT_
- *Custo:* 1 Ação e 3 PT.
- *Efeito:* ataque contra *todas* as criaturas numa linha de 18m por 3m de largura. Dano completo, com uma rolagem comparada à CA de cada. Quem for atingido é arremessado 4,5m para trás e fica _Caído_.

*_Prensa_*\[Impacto\] — _3 PT_
- *Custo:* 1 Ação e 3 PT. Requer alvo _Agarrado_.
- *Efeito:* *8d10 + Força* de dano contundente automático, e o alvo fica *Quebrantado ao máximo* instantaneamente. Se isso o reduzir a 0 PV, ele não pode ser estabilizado por meios mundanos.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Lenda Viva (6º Patamar)

#quadro(titulo: [◈ Maestria: Nada Fica de Pé])[
- Você recebe *1 Ação adicional* por turno, usável apenas para atacar ou agarrar.
- Toda criatura que começar o turno adjacente a você ganha *1 acúmulo de Quebrantado*. Sua presença é o efeito.
- Criaturas com acúmulos de Quebrantado iguais ao dobro do seu Bônus de Rank ficam *Incapacitadas* — o corpo simplesmente para. Elas não estão mortas. Elas só acabaram.
]
]

#block(sticky: true)[*Técnicas Lenda Viva* — _4 PA cada (◆ 6 PA)_]

*_◆ O Golpe que Fecha a Conta_*\[Peso\] — _6 PA | 5 PT_
- *Custo:* 2 Ações e 5 PT. Uma vez por combate.
- *Efeito:* ataque que *acerta automaticamente* e ignora CA, Cobertura, escudo e _Manto de Touki_. Role o Dado de Arma *cinco vezes* e some *+1d12 por acúmulo de Quebrantado* que o alvo tiver.
- Contra um alvo no máximo de acúmulos, isto passa de duzentos de dano. É a maior soma isolada deste livro, e ela exige quatro turnos de trabalho antes de existir.

*_Terremoto Pessoal_*\[Peso\] — _4 PT_
- *Custo:* 2 Ações e 4 PT.
- *Efeito:* esfera de 18m. *14d10* contundente, teste de Agilidade para metade. Toda estrutura na área *desaba*. O terreno vira difícil permanentemente. Criaturas voando a menos de 9m do chão caem.

#block(sticky: true)[*Talento Lenda Viva* — _4 PA_]

- *Sem Arma Nenhuma:* seus ataques desarmados sobem para o mesmo Dado de Arma de um montante (d10 base) e contam como mágicos, de cerco e adamantinos. Você entra desarmado em qualquer lugar do mundo e continua sendo a coisa mais perigosa da sala.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Lutador)

_Narrativo. Não se compra._

#quadro(titulo: [◈ O Punho Que Não Precisa Bater])[
O Lutador nunca foi sobre matar rápido — é sobre degradar o oponente até que continuar seja impossível. O patamar Divino leva essa lógica ao extremo: a *ameaça* do golpe já basta.

Existe um único combatente na história registrada que encerrou uma disputa inteira levantando o punho fechado e esperando. O oponente — um veterano de dezenas de guerras — largou a arma sozinho. Perguntado depois por que, ele só respondeu que "o corpo entendeu antes da cabeça".

Não é intimidação comum, e nenhum talento deste livro reproduz o efeito. É o corpo de outra pessoa reconhecendo, num nível que a mente não controla, que a luta já acabou.

Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o fim de uma lenda pessoal contada por décadas, e o mundo deve mudar por causa disso.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Cavalaria e Escudos

_O Defensor — Escudeiro → Bastião_

O Suishin-ryū também defende, e é fácil confundir os dois. Não são a mesma coisa, e a diferença é a árvore inteira:
]

*O Deus da Água apara para devolver. O Defensor apara e não devolve nada.*

Ele não tem _Fluxo_, não tem contragolpe, não tem Segredo. Ele tem uma pergunta só, e a pergunta é *quem está atrás de mim*. É o Ofício dos cavaleiros de fronteira, das escoltas de caravana e da guarda que morre na porta enquanto a família foge pelos fundos.

#quadro(titulo: [A Faixa do Defensor])[
Nenhuma técnica desta árvore causa dano como efeito principal, e nenhuma concede contra-ataque. Se você escrever uma que conceda, ela está invadindo o Suishin-ryū — reescreva.

Em troca, esta é a *única* árvore do livro que move dano de uma pessoa para outra, e a única que impede terceiros de morrerem.
]

#block(breakable: false)[
==== A Mecânica da Escola

#quadro(titulo: [Sob Minha Guarda])[
No início de cada combate, e sempre que quiser gastando 1 Ação, você designa um número de aliados igual ao seu *Bônus de Rank* como estando *Sob Sua Guarda*.

Enquanto um aliado estiver Sob Sua Guarda e a até *3 metros* de você:

- Você pode gastar *1 Reação* para que *todo o dano* de um ataque contra ele venha para você. Você não pode reduzir esse dano com Resistência, mas pode reduzi-lo com PT.
- Se ele sofrer dano que você *não* interceptou, você recupera *1 PT*. A culpa também é um recurso.
]
]

#block(breakable: false)[
==== Progressão de PV e PT do Defensor

#tbl(5, (left, center, center, center, center),
  [Patamar], [PV ganho], [PT ganho], [Degraus no Dado de Arma], [PV acumulado],
  [Escudeiro], [1d10 + 4], [—], [+1], [10],
  [Guarda], [1d12 + 4], [—], [+1], [21],
  [Protetor], [1d12 + 5], [+2], [+2], [33],
  [Guardião], [2d6 + 5], [+2], [+2], [45],
  [Muralha], [2d6 + 6], [+2], [+3], [58],
  [Bastião], [2d8 + 6], [+2], [+3], [73],
)
]

#linebreak()

_73 PV — *o maior do livro*, acima até do Deus da Espada. E repare na quarta coluna: ele ganha só *três degraus* de Dado de Arma na vida inteira, contra os nove da Espada. Ele quase não machuca. Ele também quase não morre, e ninguém atrás dele morre._

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Escudeiro (1º Patamar)

#quadro(titulo: [◈ Maestria: Interpor])[
Você desbloqueia *Sob Minha Guarda*, descrito acima.

Além disso: você é proficiente com toda armadura e escudo e ignora as penalidades deles, e enquanto empunhar um escudo você recebe *+2 na CA* além do valor normal dele.
]
]

#block(sticky: true)[*Técnicas Escudeiro* — _1 PA cada (◆ 2 PA)_]

#block(breakable: false)[
*_◆ Muralha de Um_* — _2 PA_
- *Custo:* 1 Ação.
- *Efeito:* até o início do seu próximo turno, você não pode se mover, e *todos* os aliados a até 3 metros recebem *Cobertura Superior (+5 CA)* e Resistência a dano de área. Você não recebe nenhum benefício disso.
]

*_Golpe de Escudo_*
- *Custo:* 1 Ação.
- *Efeito:* *1d8 + Força* de dano contundente, e teste de *Força* do alvo (CD 8 + Vigor + Rank) ou ele é empurrado 3m e fica _Caído_. É o único ataque que esta árvore te ensina, e ele existe para tirar alguém de cima de outra pessoa.

*_Puxar_*
- *Custo:* 1 Ação.
- *Efeito:* um aliado a até 9m é puxado para adjacente a você e fica _Sob Sua Guarda_ imediatamente, mesmo que exceda o seu limite.

*_Provocar Ódio_*
- *Custo:* 1 Ação.
- *Efeito:* teste de *Espírito* (CD 8 + Vigor + Rank) contra uma criatura que possa te ver. Falha: no próximo turno dela, ataques contra qualquer um que não seja você têm *Desvantagem*.
- _(Isto não é a Provocação do Suishin-ryū, que força o ataque para alimentar contragolpes. Aqui você só está tornando caro ignorar você.)_

#block(sticky: true)[*Talentos Escudeiro* — _1 PA cada_]

- *Ombro de Pedra:* +4 PV por patamar seu nesta árvore. Comprável várias vezes, até o número de patamares.
- *Montaria:* você monta, treina e acalma qualquer besta de carga. Sobre uma montaria, você não cai por nenhum efeito que permita teste, e sua montaria também está Sob Sua Guarda.
- *Sono de Ferro:* você dorme de armadura completa sem penalidade e acorda pronto. Vantagem contra Exaustão por marcha ou vigília.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Guarda (2º Patamar)

#quadro(titulo: [◈ Maestria: Peso do Aço])[
- O alcance de *Sob Minha Guarda* sobe para *4,5 metros*.
- Você não pode ser empurrado, derrubado, agarrado nem movido contra a vontade enquanto tiver os pés no chão e um escudo na mão.
- Enquanto estiver com armadura pesada, você tem *Resistência a dano de área* de qualquer origem.
]
]

#block(sticky: true)[*Técnicas Guarda* — _1 PA cada (◆ 2 PA)_]

#block(breakable: false)[
*_◆ Aguentar_* — _2 PA | 1 PT_
- *Custo:* 1 Reação e 1 PT, ao interceptar dano por _Sob Minha Guarda_.
- *Efeito:* reduza aquele dano em *1d10 + Vigor + Bônus de Rank* antes de aplicá-lo em você. Empilha com quantas Reações você tiver.
]

*_Escudo Erguido_*
- *Custo:* 1 Ação e 1 PT.
- *Efeito:* por 1 minuto, ataques à distância contra você e contra qualquer um a 3m de você *erram automaticamente* se forem mundanos. Você não pode correr enquanto sustentar.

*_Formação_*
- *Efeito:* passivo. Aliados adjacentes a você somam o seu *Bônus de Rank* aos testes de resistência contra efeitos de área e contra ser movido.

*_Cavalgada_*
- *Custo:* 1 Ação. Requer montaria.
- *Efeito:* você avança até o dobro do deslocamento da montaria atravessando linhas inimigas. Criaturas no caminho fazem teste de Força (CD 8 + Vigor + Rank) ou ficam _Caídas_. Você não provoca ataques de oportunidade.

#block(sticky: true)[*Talentos Guarda* — _1 PA cada_]

- *Dois Escudos:* você empunha um escudo em cada mão. *+2 na CA* adicional, e você não pode atacar.
- *Fôlego de Sentinela:* +2 PT Máximos.
- *A Porta Sou Eu:* enquanto você bloquear uma passagem de até 3m, criaturas de tamanho Médio ou menor *não conseguem atravessar* sem antes te derrubar.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Protetor (3º Patamar)

#quadro(titulo: [◈ Maestria: Escudo Estendido])[
Você recebe o *Manto de Touki* completo e a reserva de *PT* — e recebe *2 PT por patamar* em vez de 1, porque esta árvore gasta PT mais rápido que qualquer outra.

- Você projeta o Touki para fora do corpo. *Sob Minha Guarda* alcança *9 metros* e não exige mais linha de toque, apenas linha de visão.
- Interceptar dano deixa de custar Reação *uma vez por rodada*.
]
]

#block(sticky: true)[*Técnicas Protetor* — _2 PA cada (◆ 3 PA)_]

#block(breakable: false)[
*_◆ Não Ele_* — _3 PA | 2 PT_
- *Custo:* 1 Reação e 2 PT.
- *Efeito:* você intercepta um ataque, magia ou efeito de área *inteiro* direcionado a um aliado Sob Sua Guarda, mesmo que ele seja de alvo único e mesmo que você não conseguisse alcançá-lo fisicamente. Você sofre o efeito completo no lugar dele — inclusive condições.
- Um Protetor come uma _Lança de Gelo_ para que o mago do grupo não coma. É literalmente para isso que ele existe.
]

#block(breakable: false)[
*_Redirecionar_* — _1 PT_
- *Custo:* 1 Reação e 1 PT.
- *Efeito:* ao interceptar um ataque à distância ou projétil mágico, você o desvia para uma criatura hostil à sua escolha a até 9m, usando a rolagem original.
]

#block(breakable: false)[
*_Fôlego Emprestado_* — _2 PT_
- *Custo:* 1 Ação e 2 PT.
- *Efeito:* um aliado Sob Sua Guarda recebe *PV Temporários iguais ao seu Vigor + Bônus de Rank* e remove uma condição de _Amedrontado_, _Atordoado_ ou _Caído_.
]

#block(sticky: true)[*Talentos Protetor* — _2 PA cada_]

- *Casco:* você tem Resistência a dano físico de armas mundanas enquanto empunhar escudo.
- *Guarda Ampla:* o número de aliados Sob Sua Guarda passa a ser o *dobro* do seu Bônus de Rank.
- *Aço Paciente:* +4 PT Máximos.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Guardião (4º Patamar)

#quadro(titulo: [◈ Maestria: Aegis])[
Aliados Sob Sua Guarda recebem, passivamente e sem custo:

- *Redução de dano igual ao seu Bônus de Rank* contra todo dano recebido.
- Imunidade a acertos críticos.
- O direito de repetir, uma vez por turno, um teste de resistência falho.

Isso vale mesmo quando você não faz nada. É o patamar em que a sua presença sozinha vira estatística.
]
]

#block(sticky: true)[*Técnicas Guardião* — _3 PA cada (◆ 4 PA)_]

#block(breakable: false)[
*_◆ Custe o Que Custar_* — _4 PA | 3 PT_
- *Custo:* 1 Reação e 3 PT, quando um aliado Sob Sua Guarda chegaria a 0 PV.
- *Efeito:* ele fica com *1 PV* e é movido 9m para fora do perigo. Você sofre *todo* o dano excedente. Se isso te levar a 0 PV, você não recebe _Marcas da Morte_ neste turno.
]

#block(breakable: false)[
*_Bastião Menor_* — _2 PT_
- *Custo:* 1 Ação e 2 PT.
- *Efeito:* por 1 minuto, você cria uma zona de 6m de raio centrada em você. Criaturas hostis que entrarem gastam *o dobro do deslocamento*, e nenhum efeito de área conjurado de fora atinge quem está dentro sem antes te atingir.
]

#block(sticky: true)[*Talentos Guardião* — _3 PA cada_]

- *Aço Vivo:* sua armadura e escudo se reparam sozinhos após cada Descanso Curto e não podem ser destruídos por efeito algum de patamar inferior ao seu.
- *Contagem de Corpos:* para cada aliado Sob Sua Guarda que *não* tenha sofrido dano neste combate, você recebe *+1 na CA*, cumulativo.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Muralha (5º Patamar)

#quadro(titulo: [◈ Maestria: Ninguém Passa])[
- Criaturas hostis *não podem se mover para além de você*. Qualquer criatura que tente atravessar a linha que você ocupa — 3 metros para cada lado — precisa antes vencer uma disputa de *Força ou Vigor* contra você.
- Você intercepta dano por _Sob Minha Guarda_ *sem gastar Reação*, quantas vezes quiser por rodada.
- Você é imune a _Paralisia_, _Petrificação_, _Preso_ e a qualquer efeito que te impeça de agir enquanto tiver ao menos 1 PT.
]
]

#block(sticky: true)[*Técnicas Muralha* — _3 PA cada (◆ 5 PA)_]

#block(breakable: false)[
*_◆ A Linha_* — _5 PA | 4 PT_
- *Custo:* 1 Ação e 4 PT.
- *Efeito:* por 1 minuto, *todo* dano dirigido a qualquer aliado a até 18 metros vem para você automaticamente, reduzido pelo seu Bônus de Rank. Você não pode se mover, atacar nem ser curado enquanto sustentar.
- É a técnica que se usa quando o grupo precisa de trinta segundos e não tem trinta segundos.
]

#block(breakable: false)[
*_Ordem de Recuo_* — _2 PT_
- *Custo:* 1 Ação e 2 PT.
- *Efeito:* todos os aliados a até 18m movem-se imediatamente até o próprio Deslocamento em direção a um ponto que você indicar, sem provocar ataques de oportunidade e sem gastar as Ações deles.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Bastião (6º Patamar)

#quadro(titulo: [◈ Maestria: Enquanto Eu Estiver de Pé])[
- Nenhum aliado Sob Sua Guarda pode ser reduzido a *menos de 1 PV* enquanto você estiver consciente e a até 18 metros dele. O dano excedente vem para você, sempre, sem custo e sem Reação.
- Você recebe *1 Ação adicional* por turno, usável apenas para mover-se, interpor-se ou proteger.
- Você não pode ser morto por dano enquanto tiver PT restante: ao chegar a 0 PV, você gasta *todos* os PT e volta a 1 PV. Uma vez por combate.
]
]

#block(sticky: true)[*Técnicas Bastião* — _4 PA cada (◆ 6 PA)_]

#block(breakable: false)[
*_◆ O Muro Final_* — _6 PA | 6 PT_
- *Custo:* 2 Ações e 6 PT. Uma vez por Descanso Longo.
- *Efeito:* por 1 minuto, *nenhum aliado seu, em nenhum lugar do campo de batalha, pode morrer*. Todo dano letal que qualquer um deles sofreria é transferido para você, e você não pode ser reduzido abaixo de 1 PV durante a duração.
- Quando o minuto acaba, todo o dano acumulado é aplicado em você de uma vez. Você provavelmente morre. Esse é o ponto, e o livro não vai fingir que não é.
]

#block(breakable: false)[
*_Aço Inquebrável_* — _4 PT_
- *Custo:* 1 Ação e 4 PT.
- *Efeito:* por 3 turnos, você é *imune a todo dano* de patamar Rei ou inferior, e criaturas hostis a até 9m não conseguem se afastar de você.
]

#block(sticky: true)[*Talento Bastião* — _4 PA_]

- *Nome na Porta:* aliados Sob Sua Guarda ficam imunes a _Amedrontado_, e inimigos que tentarem atravessar a sua linha e falharem ficam *Abalados* — Desvantagem em tudo até o fim do próximo turno deles. Exércitos já recuaram por causa de uma pessoa parada numa ponte, e você é essa pessoa.

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Cavalaria e Escudos)

_Narrativo. Não se compra._

#quadro(titulo: [◈ A Muralha Que Nunca Caiu])[
_Aço Inquebrável_ e o sacrifício de "nenhum aliado seu pode morrer" já mostram do que um Imperador de Escudos é capaz por um minuto, ao custo da própria vida. O patamar Divino estica esse minuto até cobrir uma batalha inteira — e uma cidade inteira atrás de si.

Toda muralha física cai, cedo ou tarde. As poucas que "nunca caíram" na história do Mundo de Seis Faces não eram de pedra: eram uma pessoa, parada num único ponto, que decidiu que nada passaria por ali enquanto estivesse de pé. Nenhuma delas está viva hoje. Todas cumpriram a promessa até o fim.

Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É provavelmente o último capítulo da história desse personagem, e o mundo deve mudar por causa disso.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

== A Árvore de Utilidade

O terceiro pilar não compete em dano, e o livro precisa dizer isso em voz alta antes de qualquer regra: *um Lenda Oculta não bate mais forte que um Norte Principiante.* Ele nunca vai bater. Não é isso que ele faz.

O que a Utilidade faz é *decidir as condições* em que a luta, a negociação ou o roubo acontecem — e nisso ela é insuperável, inclusive por um mago Imperador.

#block(breakable: false)[
=== As Três Regras da Utilidade

#quadro(titulo: [1. Sem Escada de Dados])[
As árvores de Utilidade *não recebem degraus no Dado de Arma*. Uma adaga na mão de um Fantasma é d4, igual à adaga de um camponês. Se um personagem de Utilidade quiser bater, ele compra Ranks na Árvore do Corpo como todo mundo.
]
]

#quadro(titulo: [2. Sem Touki, nunca])[
Nenhum patamar de Utilidade concede Manto de Touki nem Pontos de Touki. Isso significa que, do quarto patamar em diante, *flechas ferem você normalmente*, sua pele não é aço e sua CA não cresce sozinha.

Vocês três são as únicas pessoas de rank alto no mundo que continuam sendo feitas de carne. Ajam como tal.
]

#quadro(titulo: [3. O Rank soma nas Perícias])[
Aqui está a compensação. O seu *Bônus de Rank* é somado a todo teste de perícia coberto pela sua árvore, exatamente como o BC é somado ao dano de um mago.

Uma Lenda Oculta rola Furtividade com *1d20 + Agilidade + 6*, e com Vantagem pela perícia. Ela não falha. Não é que ela seja boa em se esconder — é que se esconder deixou de ser uma rolagem para ela.
]

#quadro(titulo: [Nota de Custo: Utilidade é mais barata])[
As tabelas de PA do Capítulo 1 foram feitas para magia e combate, onde cada compra é poder de fogo. Aqui, quase nada causa dano — então a Utilidade usa uma tabela própria, mais generosa, para incentivar que o jogador compre *muitos* talentos em vez de poucos caros:

#tbl(3, (left, center, center),
  [Patamar], [Talento], [Técnica Assinatura ◆],
  [1º e 2º], [1 PA], [2 PA],
  [3º e 4º], [2 PA], [3 PA],
  [5º e 6º], [3 PA], [4 PA],
)

Os custos de *desbloqueio de patamar* e a contagem de *conhecimentos* seguem a tabela normal do Capítulo 1.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

== Pontos de Preparação (PP)

Magos gastam PM para fazer algo acontecer agora. Guerreiros gastam PT para aguentar o que está acontecendo agora. A Utilidade gasta um recurso que nenhum dos dois tem: *PP serve para declarar que algo já aconteceu antes.*

#quadro(titulo: [Pontos de Preparação])[
*PP Máximos = Intelecto + o atributo-chave da sua árvore + o seu Bônus de Rank nela* (mínimo 1).

- *Ladino:* Intelecto + Agilidade · *Bardo:* Intelecto + Espírito · *Tático:* Intelecto + Intelecto
- Com mais de uma árvore de Utilidade, a reserva é *única*: use o maior atributo-chave que você possui e some +1 por patamar de 3º ou superior em qualquer delas.
- Você recupera *todos* os PP em um Descanso Longo.
- PP não se converte em PM nem em PT, e vice-versa.
]

#block(breakable: false)[
=== A Regra da Preparação

Gastando *1 PP*, você declara em voz alta um fato sobre o passado que passa a ser verdade no jogo. Não é magia, não é sorte: é você revelando que já tinha pensado nisso.
]

*As cinco condições:*

+ *Tem que caber no seu Escopo.* Cada patamar define o tamanho do fato que você consegue declarar. Fora do escopo, não funciona.
+ *Tem que caber no seu Domínio.* Esta é a regra que separa as três árvores, e está explicada a seguir.
+ *É sempre pretérito.* Você não prepara algo que acontece agora. Você revela algo que já estava feito.
+ *Custa 2 PP se resolver o obstáculo central da cena.* Abrir uma porta trancada: 1 PP. Ter a chave do cofre que é o objetivo da sessão inteira: 2 PP, e o Mestre é encorajado a cobrar caro na complicação.
+ *O Mestre não pode negar. O Mestre pode complicar.* Se couber no escopo e no domínio, o fato é verdade — mas o Mestre tem o direito de anexar *uma* consequência: o guarda subornado quer mais dinheiro, o informante foi visto falando com você, o favor agora está sendo cobrado de volta.

#quadro(titulo: [Por que a regra 5 existe])[
Sem ela, PP vira "o Mestre deixa ou não deixa", e o jogador para de usar. Com ela, PP vira uma negociação: *você compra o fato, o Mestre compra o gancho.* Toda preparação que gera uma complicação está gerando a próxima sessão de graça.
]

#pagebreak(weak: true)

#largo[
== As Três Faixas

Esta é a seção mais importante do pilar. Sem ela, as três árvores viram a mesma pessoa com roupa diferente — porque todas as três declaram fatos, e "declarar fatos" é uma mecânica larga demais para três personagens dividirem.

A solução é dividir o passado em *três domínios que não se tocam*, e travar cada árvore em *uma faixa exclusiva de combate*.

#tbl(4, (left, left, left, left),
  [], [*Ladino*], [*Bardo*], [*Tático*],
  [*Atributo-chave*], [Agilidade], [Espírito], [Intelecto],
  [*Domínio da Preparação*], [*Coisas e lugares.* Objetos, fechaduras, rotas físicas, sabotagens, esconderijos, venenos.], [*Pessoas e reputação.* Favores, dívidas, rumores, o que as pessoas creem, quem te deve o quê.], [*Tempo e logística.* Quando algo acontece, por onde vem, quanto dura, o que acabou, quem chega atrasado.],
  [*Exemplo de fato*], [_"Essa fechadura eu já limei."_], [_"O capitão da guarda me deve um favor."_], [_"O suprimento deles acabou anteontem."_],
  [*Faixa exclusiva*], [*Dano Furtivo.* Só o Ladino causa dano acima do trivial nesta árvore.], [*Estado emocional.* Só o Bardo altera o que um inimigo _sente_ — medo, hesitação, fúria, confiança.], [*Economia de ação.* Só o Tático concede Ações, mexe na Iniciativa e reposiciona aliados.],
  [*Onde ele opera*], [Sozinho, no escuro, antes de todo mundo acordar.], [No meio da sala, com todos olhando.], [Do lado de fora, no mapa, uma semana antes.],
  [*A pergunta dele*], [_"Como eu entro?"_], [_"Quem eu convenço?"_], [_"Onde e quando isso acontece?"_],
)

#linebreak() 

#quadro(titulo: [A Regra da Faixa])[
*Nenhuma habilidade pode invadir a faixa de outra árvore.* Se você (ou o Mestre) inventar um talento novo e ele der Dano Furtivo a um Bardo, ou permitir que um Ladino conceda uma Ação a um aliado, o talento está errado — reescreva.

Esta é a regra que garante que os três possam estar na mesma mesa sem que ninguém fique redundante. Um grupo com os três tem o acesso, a influência e o tempo. Um grupo com dois tem uma perna faltando, e vai sentir.

*Escopo da regra:* a Faixa vale *apenas entre as três árvores de Utilidade*. Árvores do Corpo e de Magia cruzam essas linhas livremente — a _Aura de Comando_ do Norte Imperador dá imunidade a medo, e isso é legítimo, porque custou 5 PA numa árvore que pagou o preço em outro lugar. A Faixa existe para que os três colegas de Utilidade não virem a mesma pessoa, não como lei da física do mundo.
]

#linebreak() 

#block(breakable: false)[
=== Progressão de PV e PP das três árvores

#tbl(5, (left, center, center, center, center),
  [Patamar], [Ladino PV], [Bardo PV], [Tático PV], [PP ganho],
  [1º], [1d6 + 1], [1d6 + 1], [1d8 + 1], [—],
  [2º], [1d6 + 2], [1d6 + 2], [1d8 + 2], [—],
  [3º], [1d8 + 2], [1d6 + 2], [1d8 + 2], [+1],
  [4º], [1d8 + 3], [1d8 + 3], [1d10 + 3], [+1],
  [5º], [1d10 + 3], [1d8 + 3], [1d10 + 3], [+1],
  [6º], [1d10 + 4], [1d10 + 4], [1d12 + 4], [+1],
  [*Total*], [*~42*], [*~40*], [*~46*], [],
)
]

#linebreak() 

_Compare: *Mago de Água* 36 · *Bardo* 40 · *Ladino* 42 · *Tático* 46 · *Deus do Norte* 54 · *Deus da Espada* ~72. O Tático tem mais vida porque marcha com tropa e usa armadura; o Bardo tem menos porque a arma dele é a boca._
]

#pagebreak(weak: true)

#block(breakable: false)[
=== Furtividade e Armadilhas

_O Ladino — Gatuno → Lenda Oculta_

Esta árvore não tem tema. Isso é de propósito.
]

Fogo tem física, então a escola de Fogo tem uma espinha: calor gera fogo, fogo gera explosão. O Ladino não tem física. O que une o assassino, o batedor de carteiras, o falsificador e o mestre de espiões não é uma mecânica compartilhada — é uma *postura diante do mundo*: resolver o problema antes que ele vire uma luta.

Por isso a árvore é um *catálogo*, não um caminho. Cada talento abaixo é, em outros sistemas, uma subclasse inteira. Aqui é 1 PA.

#quadro(titulo: [A Mágica do Sistema])[
Uma subclasse tradicional é uma *promessa parcelada*: você escolhe Assassino no nível 3 e o jogo te paga em quatro prestações ao longo de dezessete níveis. Ela precisa ser um pacote fechado, porque você está preso a ela.

Aqui não existe nível, não existe promessa e não existe prisão. Existe uma prateleira e o seu PA. *A subclasse inteira cabe em um talento* — e o seu personagem é qualquer combinação que você conseguir pagar.
]

#block(breakable: false)[
=== Escopo da Preparação — Coisas e Lugares

#tbl(2, (left, left),
  [Patamar], [Escopo],
  [*Gatuno*], [Um objeto, um cômodo, uma pessoa comum.],
  [*Sombra*], [Um edifício inteiro, uma rotina de trabalho, um pequeno grupo.],
  [*Especialista*], [Um quarteirão, uma guilda local, um cofre de banco.],
  [*Mestre Espião*], [Uma cidade inteira, uma casa nobre menor, uma rota comercial.],
  [*Fantasma*], [Uma capital, um palácio, uma organização continental.],
  [*Lenda Oculta*], [Um reino, um continente, o registro histórico.],
)
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Gatuno (1º Patamar)

_Você aprendeu a coisa mais importante da profissão: quase nada precisa virar briga._

#quadro(titulo: [◈ Maestria: Olho Treinado e Dano Furtivo])[
*Olho Treinado.* Armadilhas, alçapões, gatilhos, tijolos soltos e fundos falsos *não pedem teste* para serem percebidos. Você simplesmente os vê, do mesmo jeito que uma pessoa comum vê uma cadeira. O Mestre é obrigado a te avisar antes que você pise em algo.

_(Isto não é um bônus em Percepção. É a remoção da rolagem — que é como este sistema recompensa maestria: quando você é bom o bastante, o dado sai da mesa.)_

*Dano Furtivo.* Uma vez por turno, quando você acertar um alvo que esteja *desprevenido, cego, imobilizado, ou contra o qual você tenha Vantagem*, adicione *+1d6 de dano por patamar* que você possua nesta árvore.

Não é magia e não é Touki. É saber exatamente onde ficam os rins.

Você também nunca parece suspeito fazendo coisas comuns: andar por um corredor, mexer numa gaveta, entrar numa sala. As pessoas presumem que você tem motivo, porque você age como quem tem.
]
]

#block(sticky: true)[*Talentos Gatuno* — _1 PA cada_]

- *Mãos Rápidas.* Você tira e coloca objetos em bolsos e mochilas alheias com um teste de Agilidade contra a Percepção do alvo. Em combate, 1 Ação para roubar um item que não esteja empunhado.
- *Engenhoca.* Você desarma e *constrói* armadilhas. Montar uma leva 10 minutos e materiais baratos; o dano é modesto (2d6), mas a CD para percebê-la é 8 + Agilidade + Bônus de Rank.
- *Duelista de Rua.* Com arma leve (d4 ou d6), você recebe *+2 na CA* contra um oponente por turno e não provoca ataques de oportunidade ao se afastar dele.
- *Nunca Preso.* Algemas, cordas, celas, nós. Você escapa de qualquer contenção não-mágica com 1 Ação e *Vantagem Absoluta*. Você sempre tem uma gazua que ninguém acha na revista.
- *Boticário.* Venenos e sedativos de campo. O alvo faz teste de Vigor (CD 8 + Intelecto + Bônus de Rank) ou fica _Envenenado_ por 1 minuto.
- *Falsário.* Selos, brasões, cartas de crédito, registros de nascimento. Detectar a falsificação exige CD 8 + Intelecto + Bônus de Rank. _Num reino como Asura, onde tudo depende de linhagem e papel assinado, isto não é uma habilidade: é uma campanha._

#block(sticky: true)[*Técnica Gatuno*]

#block(breakable: false)[
*_◆ Primeiro Golpe_* — _2 PA_
Não é um estilo de luta. É a decisão de resolver o combate antes que ele comece.
- *Custo:* 1 Ação. Uma vez por combate.
- *Requisito:* o alvo ainda não agiu neste combate, *ou* não sabe onde você está.
- *Efeito:* faça um ataque. Se acertar, os dados do seu *Dano Furtivo são triplicados*.
- *A verdade sobre esta técnica:* depois de usá-la, você é uma pessoa com uma faca. É por isso que ela é boa — você tem um turno devastador e mais nenhum, o que te obriga a passar o resto da luta fazendo outra coisa.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Sombra (2º Patamar)

_Você deixou de ser alguém que se esconde e virou alguém que escolhe quando ser visto._

#quadro(titulo: [◈ Maestria: Duas Saídas])[
Você não consegue ser encurralado. Ao entrar em qualquer ambiente, você identifica automaticamente todas as saídas, incluindo as improvisadas — um alçapão, uma janela alta, um duto, uma parede fina.

Uma vez por cena, gastando *1 PP*, você pode *declarar que existe uma saída* onde o Mestre não tinha planejado nenhuma. Ela é estreita, perigosa ou custosa, mas existe.
]
]

#block(sticky: true)[*Talentos Sombra* — _1 PA cada_]

- *Mapa dos Ratos.* Em qualquer cidade onde você já passou ao menos um dia, você conhece a geografia oculta dela: esgotos, becos sem saída, telhados conectados, armazéns de contrabando, portas dos fundos e a casa segura mais próxima de onde você estiver. Você nunca precisa de teste para atravessar uma cidade sem ser visto. _(Informantes são pessoas, e pessoas são domínio do Bardo — por isso este talento é sobre lugares.)_
- *Leitura de Cena.* Você reconstrói *o que aconteceu dentro de um ambiente fechado* olhando para ele: móveis arrastados, o que foi levado, o que ficou, quantas pessoas estiveram na sala, onde alguém esteve escondido. É um interrogatório feito no ambiente. _(Rastros ao ar livre e para onde alguém foi são domínio do Tático.)_
- *Contrabandista.* Você consegue vender qualquer item, por mais incriminador que seja, e comprar itens que não estão à venda — por preço alto e favores.
- *Dedos de Mana.* _(Requisito: 1 patamar em qualquer escola de magia.)_ Você conjura magias de rank Principiante *sem cântico audível e sem gesto visível*, ao custo da versão Encurtada. Ninguém percebe que foi você. É assim que se envenena um copo do outro lado do salão.
- *Sombra Longa.* Você se esconde mesmo sendo observado, desde que exista qualquer distração, penumbra ou obstáculo parcial. Escuridão total concede *Vantagem Absoluta* em Furtividade.
- *Passo de Gato.* Você se move em velocidade normal sem fazer ruído algum, e escalar superfícies verticais custa deslocamento normal em vez de metade.

#block(sticky: true)[*Técnica Sombra*]

#block(breakable: false)[
*_◆ Passo Vazio_* — _2 PA_
Você não sai da sala. Você simplesmente para de estar onde os olhos das pessoas estão.
- *Custo:* 1 Ação. Uma vez por combate.
- *Efeito:* você sai do combate. Não é alvo válido, não é atingido por magia de área, e ninguém determina sua posição. Dura até você agir, tocar em alguém, ou o combate acabar.
- *Ao reaparecer*, sua primeira ação tem *Vantagem* e conta como se o alvo não soubesse onde você estava — o que reativa o _Primeiro Golpe_.
- Um inimigo com o _Olho do Poder Mágico_ ou sentidos sobrenaturais ainda te localiza: você não ficou invisível, você ficou irrelevante.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Especialista (3º Patamar)

_O patamar em que você para de trabalhar sozinho e começa a trabalhar através de outras pessoas._

#quadro(titulo: [◈ Maestria: O Nome Certo])[
Você não sabe tudo. Você sabe *quem sabe*.

Para qualquer informação que exista dentro do seu Escopo, você não investiga: você nomeia a pessoa que a possui, e o Mestre confirma que ela existe. Chegar até ela e convencê-la ainda é problema seu — mas você nunca mais perde uma sessão procurando por onde começar.

Isso corta pela raiz a cena mais chata de todo RPG: o grupo parado numa taverna sem saber o que fazer.
]
]

#block(sticky: true)[*Talentos Especialista* — _2 PA cada_]

- *Quem Puxa as Cordas.* Um teste de Enganação estendido, ao longo de dias, que planta uma decisão na cabeça do alvo. Ele vai jurar que pensou nisso sozinho — e vai ser sincero.
- *Mestre-Chave.* Fechaduras, cofres e mecanismos mundanos deixam de ser teste e viram questão de tempo. Barreiras *mágicas* ainda te barram: é a fronteira que o Ladino não atravessa sozinho.
- *Veneno Refinado.* _(Requisito: Boticário.)_ Seus venenos impõem *Desvantagem* no teste e podem ser calibrados: sono, paralisia parcial, mudez, febre que só aparece em três dias.
- *Marca da Casa.* Estude uma organização por uma semana. Você passa a conhecer hierarquia, senhas, uniformes e rixas dela. Contra membros dela, *Vantagem* em todos os testes sociais e de Furtividade.

#block(sticky: true)[*Técnica Especialista*]

#block(breakable: false)[
*_◆ Ponto Cego_* — _3 PA | 1 PP_
Você olha em volta no meio da luta e revela que já esteve neste lugar antes.
- *Custo:* 1 Ação e 1 PP.
- *Efeito:* declare *uma* sabotagem feita neste ambiente antes do combate, da lista ou equivalente:
  - O lustre, a viga ou a pilha cai — teste de Agilidade ou 4d6 e _Caído_, em área de 3m.
  - A porta dos reforços está pregada por dentro. Eles perdem 3 turnos.
  - Aquele trecho de chão está encharcado de óleo: terreno difícil, e pega fogo com qualquer chama.
  - A arma de um inimigo foi limada. Quebra no primeiro crítico ou falha crítica dele.
]

#block(breakable: false)[
==== ◈ Mestre Espião (4º Patamar)

_O mundo te chamaria de gênio, se soubesse que você existe._

#quadro(titulo: [◈ Maestria: Segunda Face])[
Você mantém uma *identidade falsa completa e documentada*: nome, história, profissão, moradia, testemunhas que juram te conhecer há anos, e papelada que resiste a verificação oficial.

Enquanto estiver nessa identidade, magia de detecção de mentiras e leitura de intenções *não te denuncia*, porque você não está mentindo — no momento em que fala, você é aquela pessoa. Você mantém um número de identidades igual ao seu *Intelecto*.
]
]

#block(sticky: true)[*Talentos Mestre Espião* — _2 PA cada_]

- *Homem Dentro.* Escolha uma organização de escopo urbano. Você tem um agente permanente lá dentro. Uma vez por sessão, ele age em seu favor sem que você esteja presente.
- *A Faca do Amigo.* Uma vez por combate, 1 Ação e 1 PP para revelar que um inimigo secundário na cena trabalha para você. Ele age uma vez, e depois foge ou morre — o Mestre escolhe.
- *Nada Escrito.* Você memoriza documentos inteiros com uma leitura e escreve em cifras que exigem Intelecto igual ou superior ao seu para serem quebradas. Você nunca carrega prova de nada.
- *Faca no Escuro.* Seu _Dano Furtivo_ passa a funcionar também contra alvos adjacentes a um aliado seu — *desde que esse aliado tenha atacado o alvo desde o seu último turno*. Você não é sorrateiro nessa hora; você só aprendeu a esperar o cotovelo do outro sair do caminho.

#block(sticky: true)[*Técnica Mestre Espião*]

#block(breakable: false)[
*_◆ A Faca Certa_* — _3 PA | 1 PP_
- *Custo:* 1 Ação e 1 PP.
- *Efeito:* você declara que já sabotou o *equipamento* de um inimigo visível: a armadura tem uma fivela cortada, a espada tem o punho solto, a bolsa de componentes está molhada, o arco tem a corda gasta.
- Escolha um: o alvo perde todo bônus de armadura por 1 minuto; a arma dele quebra no próximo ataque; ele não consegue usar itens ou componentes por 3 turnos.
- *Limitação:* só funciona em alvos que você viu antes desta cena. É preparação, não mágica.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Fantasma (5º Patamar)

_Existem quase cinquenta Reis do Norte no mundo. Ninguém sabe quantos Fantasmas existem, e esse é exatamente o ponto._

#quadro(titulo: [◈ Maestria: Não Estive Aqui])[
Você não deixa rastro, e isso passou a valer contra magia.

- Nenhuma evidência física da sua presença persiste mais de uma hora: pegadas, cheiro, fios de cabelo, calor residual.
- Magia de rastreamento, adivinhação e visão do passado — incluindo o _Olho Rastreador_ e os _Olhos Que Tudo Veem_ — *não te encontra*. Você aparece como uma lacuna, e a lacuna não chama atenção.
- Testemunhas descrevem você de forma contraditória. Retratos falados seus nunca se parecem com você.
]
]

#block(sticky: true)[*Talentos Fantasma* — _3 PA cada_]

- *Mão na Coroa.* Seu Escopo passa a incluir *uma* corte real ou organização continental, escolhida agora e permanente. Dentro dela, seus fatos custam *1 PP a menos* (mínimo 1).
- *O Dossiê.* Sobre qualquer indivíduo nomeado que você tenha encontrado, você possui um segredo utilizável. Gastando 2 PP, você revela qual é. O Mestre define o segredo, mas é obrigado a torná-lo *realmente comprometedor*.
- *Saída Limpa.* Uma vez por Descanso Longo, você e todos os aliados a 9m simplesmente *não estão mais lá*. Sem rolagem, sem perseguição. Vocês reaparecem num lugar seguro que você já conhecia.

#block(sticky: true)[*Técnica Fantasma*]

#block(breakable: false)[
*_◆ Você Não Vai Chegar Lá_* — _4 PA | 2 PP_
- *Custo:* 1 Reação e 2 PP, quando um inimigo declara que vai alcançar um objetivo — uma porta, um refém, um ritual, a saída.
- *Efeito:* ele não chega. Declare o motivo, dentro do seu Escopo: a ponte já estava serrada, a chave já não está lá, o corredor foi murado ontem, o cavalo dele já tinha sido comprado por você. O Mestre não pode negar, apenas anexar uma complicação.
- *Isto não causa dano nenhum e frequentemente ganha o combate.* É a tese inteira do pilar de Utilidade em uma técnica.
]

#block(breakable: false)[
==== ◈ Lenda Oculta (6º Patamar)

_O patamar mais estranho do livro. Um Imperador de Água é conhecido em todos os continentes. Uma Lenda Oculta é conhecida em nenhum — e mudou mais coisas._

#quadro(titulo: [◈ Maestria: O Fato Consumado])[
A sua preparação deixou de precisar de você.

- Seus fatos podem ter sido executados por *outra pessoa, anos atrás, a seu mando* — o que dissolve a exigência de plausibilidade pessoal. Você não precisa ter estado lá. Nunca precisou.
- Uma vez por Descanso Longo, gastando *4 PP*, você declara que a situação em que o grupo se encontra agora *foi arranjada por você*: a emboscada é sua, o traidor é seu homem, a reunião aconteceu porque você quis. O Mestre não pode negar, mas escolhe *um* detalhe que saiu do controle.
- Você recupera *2 PP* em Descanso Curto.
]
]

#block(sticky: true)[*Talentos Lenda Oculta* — _3 PA cada_]

- *Nome que Não Existe.* Você apaga uma pessoa dos registros do mundo — ou insere uma. Certidões, linhagens, títulos de propriedade, listas de nobreza. Leva meses e é irreversível.
- *A Mão Longa.* Seu Escopo passa a cobrir *um continente inteiro*. Você tem gente em todo lugar que importa, e eles não sabem uns dos outros.
- *Herança.* Escolha *um* talento de qualquer patamar desta árvore que você não possui — você o tem, porque alguém que trabalha para você sabe fazer aquilo e está por perto. Você pode *trocar qual é* a cada Descanso Longo, conforme quem está no seu séquito naquele dia. Nunca mais de um por vez.

#block(sticky: true)[*Técnica Lenda Oculta*]

#block(breakable: false)[
*_◆ O Homem Que Nunca Esteve Lá_* — _4 PA | 4 PP_
- *Custo:* 3 Ações e 4 PP. Uma vez por Descanso Longo.
- *Efeito:* você declara que *o inimigo à sua frente já perdeu*, e explica por quê. Escolha um:
  - *Os aliados dele nunca foram dele.* Todos os subordinados na cena depõem armas ou mudam de lado.
  - *O que ele veio buscar não está aqui há semanas.* Você removeu, e ele acabou de descobrir.
  - *A autoridade dele acabou de ser revogada.* Um mensageiro chega. Ele deixa de ter o direito de estar ali, e todos na sala sabem.
  - *Ele está sozinho e a saída está fechada.* Reforços não virão, a fuga não existe, e ele entende — olhando para você — que isso foi decidido muito antes de hoje.
- *Limitação absoluta:* não funciona contra criaturas sem sociedade, hierarquia ou interesse — feras, mortos-vivos, elementais, e qualquer coisa de rank Deus. *Contra um monstro, esta técnica é inútil.* Contra pessoas, é a coisa mais poderosa deste livro.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Furtividade e Armadilhas)

_Narrativo. Não se compra._

#quadro(titulo: [◈ O Roubo Impossível])[
_O Homem Que Nunca Esteve Lá_, a técnica Lenda Oculta, já decide que um inimigo perdeu antes de a cena acabar. O patamar Divino rouba coisas que a técnica nem alcança: não objetos, não pessoas — *fatos*.

Existe um só roubo registrado neste patamar, e nenhuma guilda de ladrões consegue confirmar os detalhes: alguém entrou em um lugar que ninguém deveria conseguir entrar e saiu levando uma coisa que ninguém deveria conseguir levar — uma dívida que todo um reino devia a outro, uma lembrança que uma cidade inteira guardava sobre uma batalha, o próprio nome de um deus menor. Quem perdeu nunca percebeu que faltava alguma coisa, porque a ausência também foi levada.

Não existe cofre, ritual ou guarda contra isso, porque a defesa pressupõe saber o que está sendo protegido — e este ladrão já decidiu, antes de entrar, que aquilo nunca existiu.

Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o tipo de golpe que muda o que o mundo inteiro acredita ter acontecido, e a mesa deve mudar por causa disso.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Bardo e Interação

_Aprendiz → Voz do Mundo_

O Ladino resolve o problema entrando pela janela. O Bardo resolve o mesmo problema fazendo com que alguém *abra a porta e o convide para entrar* — e depois esqueça que fez isso.
]

Se o Ladino opera no escuro e sozinho, o Bardo opera *no meio da sala, com todos olhando*. Ele é o único personagem de Utilidade que funciona em tempo real, na frente de todo mundo, e o único cuja presença o grupo sente *durante* o combate em vez de antes dele.

E ele é o único do pilar que age sobre o *estado emocional* dos outros. Isso não é magia — é a diferença entre uma tropa que carrega e uma tropa que corre.

#block(breakable: false)[
=== Escopo da Preparação — Pessoas e Reputação

#tbl(2, (left, left),
  [Patamar], [Escopo],
  [*Aprendiz*], [Uma pessoa que já te ouviu tocar ou falar.],
  [*Artista*], [Uma taverna, uma tropa, um público, uma família.],
  [*Trovador*], [Um vilarejo, uma companhia mercenária, uma corte pequena.],
  [*Virtuoso*], [Uma cidade inteira. Sua reputação chega antes de você.],
  [*Maestro*], [Um reino. Canções suas são cantadas por gente que nunca te viu.],
  [*Voz do Mundo*], [Um continente. Você não é uma pessoa famosa; você é *um fato cultural*.],
)
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Aprendiz (1º Patamar)

#quadro(titulo: [◈ Maestria: A Plateia])[
Enquanto você estiver tocando, cantando ou falando — e isso não custa Ação nenhuma fora de combate — todos os aliados que conseguem te ouvir somam o seu *Bônus de Rank* em *um* teste de perícia por cena, à escolha deles.

Além disso: *você nunca dorme na rua.* Em qualquer assentamento com mais de vinte pessoas, uma apresentação garante cama, comida e um lugar para o grupo inteiro. Bardos não passam fome; passam vergonha.
]
]

#block(sticky: true)[*Talentos Aprendiz* — _1 PA cada_]

- *Ouvido Absoluto.* Você imita qualquer voz que já tenha ouvido e reproduz qualquer sotaque. Você também aprende idiomas em dias em vez de meses.
- *Cantiga de Marcha.* O grupo viaja mais rápido e ignora o primeiro nível de _Exaustão_ por marcha forçada, contanto que você esteja acordado e tocando.
- *Insulto Afiado.* 1 Ação. Teste de Espírito contra a Intuição do alvo. Se vencer, ele rola o próximo ataque com *Desvantagem*, porque está com raiva de você e não do problema real.
- *Colecionador de Histórias.* Sobre qualquer *pessoa, família, cidade, artefato ou evento* razoavelmente conhecido, você já ouviu uma canção. Você sabe *uma* coisa verdadeira e *uma* coisa exagerada, e sabe distinguir qual é qual. Sobre criaturas e monstros você só sabe o que o povo diz — o que normalmente está errado.
- *Contrato de Bardo.* Você negocia patrocínio. Uma vez por mês de jogo, um nobre, guilda ou templo cobre as despesas do grupo em troca de que você registre os feitos deles. _(Este talento resolve a economia da mesa inteira e custa 1 PA. Use.)_

#block(sticky: true)[*Técnica Aprendiz*]

#block(breakable: false)[
*_◆ Inspiração_* — _2 PA_
- *Custo:* 1 Ação. Um número de vezes por Descanso Longo igual ao seu *Espírito*.
- *Efeito:* escolha um aliado que possa te ouvir. Ele recebe um *Dado de Inspiração* e pode gastá-lo a qualquer momento, mesmo depois de ver o resultado do dado, somando ao teste. Dura até o fim da cena.
- *Tamanho do dado:* 1d6 no 1º e 2º patamares, *2d6* no 3º e 4º, *3d6* no 5º e 6º. _(Máximo de 3d6. Um dado de bônus que chega a somar 21 num teste de d20 deixa de ser inspiração e vira outra coisa.)_
- Um aliado só pode carregar um Dado de Inspiração por vez.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Artista (2º Patamar)

#quadro(titulo: [◈ Maestria: Ler a Sala])[
Ao entrar em qualquer cena com pessoas, o Mestre é obrigado a te dizer, sobre cada indivíduo relevante: *o que ele quer*, *do que ele tem medo*, e *que existe uma coisa que ele está escondendo*.

Você não descobre _qual_ é o segredo — apenas que ele está lá, e onde ele dói. O resto é conversa.
]
]

#block(sticky: true)[*Talentos Artista* — _1 PA cada_]

- *Cantiga de Ninar.* Criaturas não-hostis que te ouvirem por 10 minutos adormecem, salvo teste de Vigor. Não funciona em combate. Funciona muito bem em guardas entediados.
- *Mestre de Cerimônias.* Você controla uma multidão: acalmar um tumulto, iniciar um, direcionar a atenção de todos para o outro lado da praça. Teste de Espírito contra CD definida pelo tamanho e humor do grupo.
- *A Máscara.* Você atua. Enquanto sustentar uma persona, testes para detectar que você está mentindo têm *Desvantagem* — mas, diferente da _Segunda Face_ do Ladino, você não tem documentos. Sua mentira dura uma noite, não uma vida.
- *Nome nas Bocas.* Gastando 1 PP, você planta um rumor numa comunidade. Em três dias, todo mundo acredita nele. Ele não precisa ser verdade, mas precisa ser *crível*, e você não controla como ele muda ao ser repetido.
- *Duelo de Canções.* Você desafia alguém para uma disputa de habilidade artística ou verbal. Em muitas culturas do Mundo de Seis Faces — especialmente entre demônios e Raça Fera —, recusar é desonra pública, e vencer vale mais que uma espada no pescoço.

#block(sticky: true)[*Técnica Artista*]

#block(breakable: false)[
*_◆ Insulto que Fica_* — _2 PA_
- *Custo:* 1 Ação.
- *Efeito:* teste de Espírito contra Espírito do alvo. Se você vencer, por 3 turnos ele *só consegue pensar em você*: rola com Desvantagem qualquer ataque que não seja contra você, e não pode usar habilidades que exijam concentração ou cálculo.
- *O risco:* ele vai atacar você. Você tem 40 pontos de vida e nenhum Touki. Este é o talento que mata Bardos imprudentes, e é assim que deve ser.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Trovador (3º Patamar)

#quadro(titulo: [◈ Maestria: A Canção Não Para])[
Você toca e faz outra coisa ao mesmo tempo. Correr, escalar, negociar, lutar, sangrar.

Mecanicamente: você pode *sustentar um efeito de Bardo indefinidamente sem gastar Ação nem concentração*. Segurar dois ao mesmo tempo ainda exige 1 Ação por turno.
]
]

#block(sticky: true)[*Talentos Trovador* — _2 PA cada_]

- *Réquiem.* Aliados que te ouvem ficam imunes a _Amedrontado_ e recebem *Vantagem* contra efeitos que manipulem emoção ou mente.
- *Diplomata de Guerra.* Você consegue negociar uma trégua no meio de um combate. Todos os participantes fazem teste de Espírito (CD 8 + Espírito + Bônus de Rank); quem falhar, para de lutar por 1 minuto e escuta. O que você faz com esse minuto é problema seu.
- *Voz que Alcança.* Sua voz é ouvida claramente a até 300 metros, atravessa tempestade e ruído de batalha, e não denuncia sua posição.
- *A Balada Instrutiva.* Você transforma informação complexa em canção, e canção em memória permanente. Em dez minutos, o grupo inteiro memoriza sem erro um mapa, uma senha longa, uma sequência ritual, uma genealogia ou um discurso — e ninguém precisa carregar isso escrito. Nenhum deles esquece, nunca.

#block(sticky: true)[*Técnica Trovador*]

#block(breakable: false)[
*_◆ Canção de Guerra_* — _3 PA_
- *Custo:* 1 Ação para iniciar; sustentada de graça pela sua Maestria.
- *Efeito:* enquanto durar, todos os aliados que te ouvem recebem *+2 em rolagens de acerto*, imunidade a _Amedrontado_, e ignoram a penalidade do primeiro nível de _Exaustão_.
- Se você for silenciado, nocauteado ou morto, o efeito acaba imediatamente — e todos sentem o silêncio.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Virtuoso (4º Patamar)

#quadro(titulo: [◈ Maestria: Precede Você])[
Sua reputação chega antes de você. Ao entrar em qualquer cidade dentro do seu Escopo pela primeira vez, *escolha como você é conhecido lá*: herói de guerra, artista genial, excêntrico inofensivo, agente de uma potência estrangeira.

A escolha é verdade. As pessoas já ouviram falar, já formaram opinião, e agem de acordo. Você pode mudar essa escolha uma vez por cidade, mas mudar leva semanas e gera fofoca — que também é uma ferramenta.
]
]

#block(sticky: true)[*Talentos Virtuoso* — _2 PA cada_]

- *O Favor Antigo.* Gastando 2 PP, você declara que uma pessoa importante na cena te deve algo — e ela lembra. Ela não vai trair o próprio lado, mas vai te dar *uma* coisa: uma informação, uma passagem, cinco minutos, o benefício da dúvida.
- *Elegia.* Uma vez por combate, 1 Ação: você canta para um inimigo que perdeu aliados nesta luta. Teste de Espírito com *Desvantagem* ou ele deixa o combate — não morto, não dominado, apenas *acabado*. Ele vai embora e não volta.
- *A Corte na Palma.* Em ambientes formais — bailes, audiências, julgamentos, banquetes — você não rola testes sociais. Você declara o resultado social que quer e o Mestre narra como aconteceu, desde que não contrarie interesses vitais de alguém presente.

#block(sticky: true)[*Técnica Virtuoso*]

#block(breakable: false)[
*_◆ A Verdade que Dói_* — _3 PA | 1 PP_
- *Custo:* 1 Ação e 1 PP.
- *Efeito:* você diz, na frente de todos, algo verdadeiro sobre um inimigo — declarado por você dentro do seu Domínio e Escopo. Uma dívida, uma covardia, uma traição, um nome que ele não usa mais.
- Todos os aliados *dele* presentes fazem teste de Espírito (CD 8 + Espírito + Bônus de Rank). Quem falhar passa a agir com *Desvantagem* enquanto o alvo estiver na cena, e a fidelidade deles vira questão de roleplay pelo resto da sessão.
- *Contra o alvo em si:* nenhum efeito mecânico. O dano é social, e às vezes é pior.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Maestro (5º Patamar)

#quadro(titulo: [◈ Maestria: Voz que Comanda])[
Você deixou de convencer pessoas e passou a mover *multidões*.

- Qualquer criatura capaz de ouvir e de sentir emoção é afetada pelas suas habilidades de Bardo, mesmo que não entenda o seu idioma.
- Seus efeitos de área social — tréguas, pânico, coragem, silêncio — passam a atingir *todos que te ouvem*, sem limite de número. Uma praça inteira. Um regimento. Uma cidade em revolta.
- Você é imune a qualquer efeito que manipule sua própria emoção, mundano ou mágico.
]
]

#block(sticky: true)[*Talentos Maestro* — _3 PA cada_]

- *A Canção que Todos Sabem.* Uma composição sua se espalhou. Gastando 2 PP, você declara que a canção contém uma instrução, um sinal ou um código — e que a pessoa certa, em algum lugar, vai reconhecê-la quando você cantar.
- *Silêncio Absoluto.* 1 Ação: ninguém em 18m consegue falar, cantar ou recitar — *incluindo você e seus aliados*. Magos na área só conjuram em Conjuração Silenciosa. Enquanto sustentar, você não pode usar nenhuma outra habilidade de Bardo, porque todas elas exigem a sua voz. Dura 1 minuto ou até você parar.
- *Herdeiro de Todas as Bocas.* Você fala todos os idiomas do Mundo de Seis Faces, incluindo o Divino e os dialetos demoníacos antigos, e é compreendido mesmo por criaturas sem linguagem.

#block(sticky: true)[*Técnica Maestro*]

#block(breakable: false)[
*_◆ Coro_* — _4 PA | 2 PP_
- *Custo:* 1 Ação e 2 PP. Uma vez por combate.
- *Efeito:* escolha uma emoção — *pavor*, *fúria* ou *devoção*. Todas as criaturas hostis num raio de 18m que possam te ouvir fazem teste de Espírito (CD 8 + Espírito + Bônus de Rank):
  - *Pavor* — quem falhar foge do combate por 2 turnos.
  - *Fúria* — quem falhar deve atacar a criatura mais próxima, aliada ou não, no próximo turno.
  - *Devoção* — quem falhar não pode atacar você nem seus aliados no próximo turno.
- Não funciona em criaturas sem emoção: mortos-vivos, construtos, elementais.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Voz do Mundo (6º Patamar)

_Reis contratam Imperadores de magia para vencer batalhas. Contratam você para decidir o que a batalha significou._

#quadro(titulo: [◈ Maestria: A História Oficial])[
Você não registra o que aconteceu. Você *decide qual versão o mundo acredita*.

- Uma vez por Descanso Longo, gastando *4 PP*, escolha um evento do qual você participou ou que testemunhou. Sua versão dele passa a ser a verdade aceita — em canções, em crônicas, na boca das pessoas, nos arquivos das cortes.
- Desmentir você exige provas materiais *e* uma testemunha de reputação equivalente à sua. Não existem muitas.
- Isso não altera o passado. Altera algo mais útil: o que as pessoas fazem por causa dele.
]
]

#block(sticky: true)[*Talentos Voz do Mundo* — _3 PA cada_]

- *Nome Imortal.* Escolha uma pessoa, viva ou morta. Ela entra para a história como herói ou como monstro, permanentemente. Isso muda como os descendentes dela são tratados por gerações.
- *A Marcha.* Uma canção sua se torna hino de um movimento — uma revolta, uma ordem religiosa, um exército. Gastando 3 PP, você declara que esse movimento age agora, em algum lugar, a seu favor.
- *Público Universal.* Suas Preparações sociais passam a alcançar *qualquer continente*, mesmo os que você nunca visitou. Alguém lá já ouviu falar de você. Alguém sempre ouviu.

#block(sticky: true)[*Técnica Voz do Mundo*]

#block(breakable: false)[
*_◆ O Fim da Canção_* — _4 PA | 4 PP_
- *Custo:* 3 Ações e 4 PP. Uma vez por Descanso Longo.
- *Efeito:* você encerra a batalha declarando publicamente *por que ela não faz mais sentido*. A causa acabou, o rei já capitulou, o irmão que eles vieram vingar está vivo, o pagamento nunca vai chegar.
- Todas as criaturas hostis capazes de ouvir e de raciocinar fazem teste de Espírito com *Desvantagem*. Quem falhar *encerra as hostilidades* e não pode ser convencido a retomá-las nesta cena por nada.
- *Limitação:* exige que exista uma razão real, e você precisa ter tido acesso a ela — via Preparação, via Escopo, ou via história. Não funciona em quem luta por prazer, por fome ou por ordem divina.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Bardo e Interação)

_Narrativo. Não se compra._

#quadro(titulo: [◈ A Palavra que Vira Verdade])[
_O Fim da Canção_, a técnica Voz do Mundo, encerra uma batalha convencendo quem luta de que ela não faz mais sentido. O patamar Divino não convence ninguém de uma verdade — ele decide qual é a verdade, e o mundo se ajusta para que sempre tenha sido assim.

A lenda mais antiga do ofício fala de uma canção cantada uma única vez, sobre um covarde que nunca existiu, e que hoje aparece em três línguas diferentes, em três continentes diferentes, como fato histórico incontestável — com nome, data e testemunhas que juram ter estado lá. Ninguém sabe mais dizer se a canção descreveu algo real ou se o mundo simplesmente decidiu que sim, porque a Bardo pediu.

Nenhum talento deste livro chega perto disso. É a diferença entre contar uma história bem contada e ser a razão de ela ser verdade.

Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É reescrever a história que todo mundo lembra, e o mundo deve mudar por causa disso.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
=== Navegação e Liderança

_O Tático — Explorador → Senhor da Guerra_

O Ladino pergunta _"como eu entro?"_. O Bardo pergunta _"quem eu convenço?"_. O Tático pergunta a pergunta que ganha guerras: *_"onde e quando isso acontece?"_*
]

Ele é o membro do grupo que resolve a metade do jogo que nem magia nem espada tocam: a viagem, o suprimento, o mapa, o relógio. E, em combate, ele é o único do pilar — e um dos poucos do livro inteiro — que mexe na coisa mais valiosa que existe neste sistema: *Ações*.

#quadro(titulo: [Por que isso é uma habilidade de combate])[
Num sistema onde o mago precisa de distância para terminar o cântico e o Deus do Norte precisa de cenário para improvisar, *escolher o campo de batalha é causar dano por procuração*. O Tático não bate em ninguém. Ele faz com que o Norte lute num depósito cheio de vigas e com que o mago tenha trinta metros livres pela frente.
]

#block(breakable: false)[
=== Escopo da Preparação — Tempo e Logística

#tbl(2, (left, left),
  [Patamar], [Escopo],
  [*Explorador*], [A próxima hora. O trecho de estrada à frente.],
  [*Rastreador*], [O dia de hoje. Uma região de um dia de viagem.],
  [*Guia*], [A semana. Uma província, uma rota comercial, o abastecimento de uma vila.],
  [*Estrategista*], [O mês. Um campo de batalha inteiro, o suprimento de uma tropa.],
  [*Comandante*], [A estação. Uma campanha militar, a movimentação de um exército.],
  [*Senhor da Guerra*], [O ano. Uma guerra inteira, a economia de um reino em conflito.],
)
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Explorador (1º Patamar)

#quadro(titulo: [◈ Maestria: Onde Pisar])[
Enquanto você estiver acordado e liderando a marcha:

- O grupo *nunca se perde* e ignora terreno difícil natural durante a viagem.
- O grupo *nunca é surpreendido*. Emboscadas ainda acontecem, mas vocês agem no primeiro turno.
- Vocês sempre encontram água, abrigo e um lugar defensável para acampar.

No Continente Demônio, no deserto de Begaritt ou na Grande Floresta, esta Maestria sozinha é a diferença entre uma expedição e uma lápide.
]
]

#block(sticky: true)[*Talentos Explorador* — _1 PA cada_]

- *Mapa Vivo.* Você desenha e lê mapas. Qualquer região que você atravessou uma vez fica registrada; você pode vendê-la, e cartógrafos pagam bem.
- *Suprimento.* Você calcula ração, água e forragem. O grupo consome metade do que consumiria, e você sempre sabe quantos dias faltam para o problema começar.
- *Sinais.* Você combina um código de gestos, assobios e marcas com o grupo. Vocês se comunicam a até 200 metros sem falar, e ninguém que não conheça o código entende.
- *Conhecimento de Bestas.* Sobre qualquer monstro que você veja, você identifica espécie, comportamento de caça, e *uma* fraqueza real. Aventureiros morrem por não ter isso.
- *Olho de Cerco.* Olhando para uma fortificação, um acampamento ou uma formação, você estima *número de defensores, estado do suprimento, tempo de resistência e o ponto estrutural mais fraco*. O que essas pessoas estão _sentindo_ não é problema seu — é do Bardo.

#block(sticky: true)[*Técnica Explorador*]

#block(breakable: false)[
*_◆ Primeiro a Ver_* — _2 PA_
- *Custo:* nenhum. Passivo, uma vez por combate.
- *Efeito:* se o grupo entrar em combate vindo de uma marcha ou aproximação que você conduziu, *todos os aliados* somam o seu *Bônus de Rank* na Iniciativa, e você escolhe qual aliado age primeiro, independente do resultado dos dados.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rastreador (2º Patamar)

#quadro(titulo: [◈ Maestria: Quem Passou Por Aqui])[
Rastros deixam de ser um teste. Você olha para o chão e sabe: *quantos eram, o que carregavam, há quanto tempo passaram, e se estavam com pressa ou com medo.*

Mais importante: você prevê *para onde eles vão*. O Mestre é obrigado a te dizer o destino provável de qualquer trilha que você siga por uma hora.
]
]

#block(sticky: true)[*Talentos Rastreador* — _1 PA cada_]

- *Marcha Forçada.* O grupo viaja o dobro da distância por dia. Todos fazem teste de Vigor ao final; você faz o seu com Vantagem e pode isentar um aliado por dia.
- *Terreno Conhecido.* Escolha um tipo de terreno (floresta, deserto, montanha, urbano, subterrâneo, gelo). Nele, você e o grupo movem-se em velocidade total, e você tem *Vantagem* em tudo relacionado a navegação e ocultação.
- *Cavalaria.* Você treina, acalma e monta qualquer besta de carga ou montaria. Em cima de uma montaria, você não cai por nenhum efeito que permita um teste de Agilidade.
- *Retirada Ordenada.* Gastando 1 Ação, você organiza uma fuga: até o fim do próximo turno, aliados que se afastarem de inimigos *não provocam ataques de oportunidade*.

#block(sticky: true)[*Técnica Rastreador*]

#block(breakable: false)[
*_◆ Antecipação_* — _2 PA | 1 PP_
- *Custo:* 1 Reação e 1 PP, quando um inimigo declara uma ação.
- *Efeito:* você declara que já esperava exatamente isso. Um aliado à sua escolha, que possa te ouvir, *usa imediatamente 1 Ação* para reagir — mover-se, atacar, interpor-se, agarrar o objeto.
- *Limite:* uma vez por combate. É a primeira mordida da faixa que pertence só ao Tático: mexer em Ações.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Guia (3º Patamar)

#quadro(titulo: [◈ Maestria: O Terreno Escolhido])[
Se o grupo tiver *dez minutos* antes de um combate previsto, você escolhe *uma característica definidora* do campo de batalha, e ela é verdade:

- _Há uma elevação de onde se vê tudo._
- _Só existe um caminho de aproximação, e é estreito._
- _O chão é instável — quem correr, cai._
- _A luz vem de trás de nós e bate nos olhos deles._
- _Há cobertura pesada espalhada por todo o campo._

Você não está criando o terreno. Você está revelando que *escolheu este lugar de propósito*, e o Mestre não pode discordar.
]
]

#block(sticky: true)[*Talentos Guia* — _2 PA cada_]

- *Engenharia de Campo.* Com uma hora e o grupo ajudando, você ergue uma paliçada, uma ponte improvisada, um fosso ou uma trincheira. Estruturas suas têm 40 PV e concedem Cobertura Superior.
- *Voz de Sargento.* 1 Ação: um aliado à sua escolha remove imediatamente a condição _Atordoado_ ou _Caído_ e repete um teste de resistência falho. _(Medo é a moeda do Bardo. O Tático dá disciplina, não coragem.)_
- *Logística de Guerra.* Você abastece um grupo de até cinquenta pessoas indefinidamente em território hostil. Isso não parece uma habilidade de aventureiro até a sessão em que vocês precisam evacuar um vilarejo.
- *Emboscada Planejada.* _(Requisito: 1 PP ao usar.)_ Se o grupo tiver uma hora para se preparar, você posiciona todo mundo: no primeiro turno do combate, *todos os aliados agem antes de qualquer inimigo*, e os inimigos ficam _Surpresos_.

#block(sticky: true)[*Técnica Guia*]

#block(breakable: false)[
*_◆ Ponto de Estrangulamento_* — _3 PA | 1 PP_
- *Custo:* 1 Ação e 1 PP.
- *Efeito:* você declara que existe — e sempre existiu — um gargalo neste campo de batalha, e o aponta. Escolha um ponto de 3m de largura. Enquanto o combate durar:
  - Inimigos só conseguem atravessar essa linha passando por ali.
  - Aliados posicionados no gargalo recebem *+3 na CA* e *Vantagem* em ataques de oportunidade.
  - Efeitos de área inimigos que atingiriam o grupo inteiro atingem no máximo dois personagens.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Estrategista (4º Patamar)

#quadro(titulo: [◈ Maestria: A Ordem de Batalha])[
Você deixou de reagir à luta e passou a *organizá-la*.

- No início de qualquer combate, todos os aliados podem optar por usar *a sua rolagem de Iniciativa* em vez da própria.
- Uma vez por turno, gastando *nenhuma Ação*, você troca a posição de dois aliados na ordem de Iniciativa.
- Você sempre sabe quantos inimigos ainda não agiram e o que cada um deles fez no turno anterior. Nada de "espera, quem já jogou?" na sua mesa.
]
]

#block(sticky: true)[*Talentos Estrategista* — _2 PA cada_]

- *Foco de Fogo.* 1 Ação: aponte um inimigo. Até o fim do turno, todos os aliados que atacarem esse alvo somam o seu *Bônus de Rank* ao dano.
- *Prever o Golpe.* 1 Reação: quando um aliado a até 18m for atingido, você grita a tempo. Ele recebe *+4 na CA* contra aquele ataque, resolvido retroativamente.
- *A Guerra Antes da Guerra.* Gastando 2 PP, você declara que a força inimiga chegou aqui *em pior estado do que deveria*: sem dormir, sem comer, com metade dos reforços atrasados. Reduza o número de inimigos da cena em um terço, ou dê a todos eles 1 nível de _Exaustão_.
- *Doutrina.* Escolha uma escola de magia ou um estilo de esgrima. Você conhece a doutrina de combate dela: contra praticantes desse estilo, todos os aliados que ouvirem suas instruções recebem *+2 na CA*.

#block(sticky: true)[*Técnica Estrategista*]

#block(breakable: false)[
*_◆ Manobra_* — _3 PA | 1 PP_
- *Custo:* 1 Ação e 1 PP.
- *Efeito:* até *três aliados* à sua escolha, que possam te ouvir, movem-se imediatamente até o próprio Deslocamento, sem provocar ataques de oportunidade. Esse movimento não gasta as Ações deles.
- Reposicionar o grupo inteiro de graça, no meio da luta, é frequentemente mais forte que qualquer magia de dano — e é exatamente por isso que só o Tático pode fazer.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Comandante (5º Patamar)

#quadro(titulo: [◈ Maestria: Comando])[
Aliados param de perguntar o que fazer, porque você já disse.

- Uma vez por turno, gastando *1 Ação sua*, você concede *1 Ação adicional* a um aliado que possa te ouvir. Ele a usa imediatamente.
- Aliados sob seu comando *não podem ser movidos contra a vontade* (empurrões, puxões, deslocamentos forçados) e nunca ficam _Surpresos_ enquanto você estiver consciente.
- Fora de combate, você lidera uma força de até quinhentas pessoas sem precisar de testes. Elas obedecem, e elas confiam.
]
]

#block(sticky: true)[*Talentos Comandante* — _3 PA cada_]

- *Segundo Escalão.* Gastando 2 PP, você declara que uma força aliada estava a caminho e chega *agora*: uma patrulha, uma companhia mercenária que você contratou, a guarda da cidade. O Mestre define o tamanho, mas ela é real e é útil.
- *Sem Baixas.* Uma vez por Descanso Longo, quando um aliado chegaria a 0 PV, você declara que já havia previsto isso. Ele fica com *1 PV* e move-se imediatamente 9m para fora do perigo.
- *Ordem de Marcha.* Todos os aliados que te ouvem ganham *+3 metros de Deslocamento* e podem se mover através de espaços ocupados por aliados livremente.

#block(sticky: true)[*Técnica Comandante*]

#block(breakable: false)[
*_◆ Avante_* — _4 PA | 3 PP_
- *Custo:* 1 Ação e 3 PP. Uma vez por combate.
- *Efeito:* *todos os aliados* que possam te ouvir recebem imediatamente *1 Ação adicional* neste turno, e ela não pode ser usada para conjurar magia de rank Santo ou superior.
- Num grupo de quatro, isso são quatro Ações extras de uma vez só. É o pico absoluto do Tático — e ele não causou um único ponto de dano ao fazer isso.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Senhor da Guerra (6º Patamar)

_O Imperador de magia decide um combate. O Senhor da Guerra decide quantos combates vão existir._

#quadro(titulo: [◈ Maestria: A Guerra Já Acabou])[
Você opera em escala de campanha, e o jogo reconhece isso.

- Uma vez por Descanso Longo, gastando *4 PP*, você declara uma *condição estratégica* que já estava em vigor: a estrada foi cortada há uma semana, o porto está bloqueado, o exército inimigo está sem pagamento há dois meses, o cerco foi levantado ontem.
- Se o Mestre planejou um confronto para esta sessão, você pode declarar que ele *não vai acontecer* — porque um dos lados não conseguiu chegar. Ele acontece depois, em condições que você escolheu.
- Você recupera *2 PP* em Descanso Curto.
]
]

#block(sticky: true)[*Talentos Senhor da Guerra* — _3 PA cada_]

- *O Mapa É Meu.* Seu Escopo passa a cobrir *um continente inteiro*. Movimentação de tropas, rotas comerciais, colheitas, estações — você sabe o estado de tudo, o tempo todo.
- *Reputação de Aço.* Exércitos inimigos que saibam que você comanda o outro lado sofrem penalidade de moral. Comandantes menores recusam engajamento. Alguns simplesmente não aparecem.
- *Herança de Comando.* Escolha *um* talento de qualquer patamar desta árvore que você não possui — alguém no seu estado-maior sabe fazer aquilo. Você pode *trocar qual é* a cada Descanso Longo. Nunca mais de um por vez.

#block(sticky: true)[*Técnica Senhor da Guerra*]

#block(breakable: false)[
*_◆ A Batalha Que Você Escolheu_* — _4 PA | 4 PP_
- *Custo:* 3 Ações e 4 PP. Uma vez por Descanso Longo.
- *Efeito:* você declara que este confronto inteiro foi montado por você, e escolhe *duas*:
  - *Todos os aliados* recebem 1 Ação adicional em cada um dos próximos 3 turnos.
  - Os reforços inimigos não vêm. Nenhum. Você já cuidou disso.
  - O terreno muda a seu favor: a ponte cede, a maré sobe, a neblina desce, o fogo começa onde você quer.
  - O comandante inimigo já não confia no próprio segundo em comando. Um deles age contra o outro no próximo turno.
- *Limitação:* exige inimigos com organização, cadeia de comando e objetivo. *Contra um monstro solitário, esta técnica não faz absolutamente nada.*
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#block(breakable: false)[
==== ◈ Rank Deus (Navegação e Liderança)

_Narrativo. Não se compra._

#quadro(titulo: [◈ A Guerra no Dia Certo])[
_A Batalha Que Você Escolheu_, a técnica Senhor da Guerra, já decide o formato de um único confronto. O patamar Divino decide algo maior: *quando*, dentre todas as guerras que ainda vão acontecer, a próxima realmente começa.

Não existe magia nem técnica marcial que faça isso — porque não é sobre poder de combate, é sobre logística, alianças, colheitas, tratados e o clima de uma estação inteira, todos puxados na direção certa até que só reste um dia possível para o primeiro golpe ser dado. Historiadores discordam sobre se algum Tático já alcançou isto de propósito ou se, olhando para trás, decidiram que sim.

Um general assim nunca precisa vencer a batalha mais difícil. Ele só precisa garantir que ela nunca aconteça no dia em que perderia.

Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o tipo de decisão que define o resultado de uma campanha inteira antes da primeira espada ser desembainhada, e o mundo deve mudar por causa disso.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

#largo[
== As Três Árvores em Combate

A pergunta que todo jogador de Utilidade faz na terceira sessão é "e eu, faço o quê?". Aqui está a resposta, lado a lado.

#tbl(4, (left, left, left, left),
  [Turno], [Ladino], [Bardo], [Tático],
  [*Antes*], [Já sabotou o ambiente.], [Já sabe o que cada um quer.], [Já escolheu o terreno.],
  [*1º*], [_Primeiro Golpe_ — seu pico de dano do combate inteiro.], [_Canção de Guerra_ — e ela dura o resto da luta de graça.], [_Primeiro a Ver_ — o grupo age antes e na ordem que você quis.],
  [*2º*], [_Ponto Cego_ — derruba a viga, tranca os reforços.], [_Insulto que Fica_ — puxa o inimigo mais perigoso para longe do mago.], [_Manobra_ — reposiciona três aliados sem gastar as Ações deles.],
  [*3º*], [Veneno, roubo do item-chave, Dano Furtivo.], [_Coro_ — pavor, fúria ou devoção em 18 metros.], [_Avante_ — Ação extra para o grupo inteiro.],
  [*4º*], [_Passo Vazio_ e reposicionamento.], [Sustenta, inspira, mantém todos de pé.], [_Foco de Fogo_ e leitura da ordem de Iniciativa.],
  [*Nunca*], [Trocar golpes na linha de frente.], [Ficar ao alcance de quem ele provocou.], [Achar que precisa causar dano.],
)

#linebreak() 

*A régua honesta:* contra um Norte Imperador batendo 81 por turno, os três juntos talvez somem 30 de dano direto na luta inteira. E ainda assim eles são a razão de o combate ter começado com o grupo em cima do telhado, os reforços trancados do lado de fora, metade dos inimigos apavorados, e o chefe já sabendo que perdeu.

*O teste do Apêndice B, aplicado às três:* cada árvore precisa ter, no patamar alto, ao menos uma habilidade que um mago Imperador não replica com magia nenhuma.

_Não Estive Aqui_ derrota adivinhação divina. _A História Oficial_ decide o que o mundo acredita. _A Guerra Já Acabou_ cancela um confronto antes de ele existir.

*Zero Absoluto não te consegue um informante, não te dá reputação, e não impede que o exército chegue.*

#quadro(titulo: [Para o Mestre: como recompensar os três])[
Dano é fácil de medir — está na ficha, em números. O valor da Utilidade não está, e por isso é fácil um Mestre esquecer de recompensá-lo. Três hábitos resolvem isso:

+ *Narre a ausência do problema.* Se o Ladino sabotou os reforços, diga em voz alta que eles não vieram — não deixe o efeito passar em silêncio.
+ *Dê PA por Preparação bem usada*, do mesmo jeito que se dá por dano bem causado. A régua é a mesma: fez a mesa avançar, mereceu.
+ *Cobre a complicação que você mesmo anexou.* Se o Mestre disse que o informante viu o Ladino, esse informante precisa aparecer de novo — e virar problema, mais cedo ou mais tarde.
]
]

#pagebreak(weak: true)

= Capítulo 4: O Combate e a Sobrevivência

Quando a diplomacia falha e as espadas são desembainhadas, o sistema adota um combate rápido, letal e tático.

#largo[
== 1. Cálculos Vitais

As três reservas do sistema — vida, mana e aura — são *multiplicativas*. Cada uma pertence a um atributo, e cada uma cresce com o seu patamar. Isso é intencional: um atributo que só soma um número fixo vira decoração, e o sistema tinha três atributos assim.

#block(breakable: false)[
=== Pontos de Vida

#quadro(titulo: [PV Máximos = Constituição Base + Progressão + Vitalidade])[
- *Constituição Base = 10 + (Vigor × 3)*, mínimo 13. É o corpo com que você nasceu.
- *Progressão =* a soma de *todos* os dados de PV que as suas árvores concederam, *dobrada*. Role o dado da tabela da árvore e multiplique por dois. Na criação, o dado do 1º patamar é sempre o *valor máximo*.
- *Vitalidade = Vigor × Maior Bônus de Rank × 4.* É o corpo endurecido pelo treino: um Imperador com Vigor 6 carrega 144 PV só disto.
]
]

*Por que a Progressão é dobrada:* era mais honesto multiplicar por dois na regra do que reescrever dezessete tabelas com números maiores. As tabelas de cada árvore continuam valendo — você só dobra o resultado.

#quadro(titulo: [O Que Estava Quebrado])[
Com a regra antiga, um Norte de Vigor 5 chegava ao Imperador com *77 PV*, e o Imperador da Espada causa cerca de *130 por turno*. A conta dava *0,4 turno de sobrevivência* — e piorava conforme o grupo subia de patamar, porque o dano escalava mais rápido que a vida.

Não era letalidade, era o combate não acontecer. Com a regra nova, o mesmo personagem chega ao Imperador com *223 PV* e o combate dura de duas a três rodadas em todos os patamares.

Se você quiser uma mesa *mais* brutal, reduza a Vitalidade de ×4 para ×3. Se quiser mais heroica, suba para ×5. Este é o botão, e ele é um só.
]

#block(breakable: false)[
=== Pontos de Mana

#quadro(titulo: [PM Máximos = (Espírito × Maior Bônus de Rank de magia × 2) + 8])[
*Uma fórmula, uma linha, e mais nada.* As escolas de magia *não concedem PM*. Nem uma gota. Todo o seu poder de conjuração vem do seu Espírito e do quão fundo você foi em uma escola.

]
]

#quadro(titulo: [O que essa fórmula produz])[
#tbl(5, (center, center, center, center, left),
  [Espírito], [1º patamar], [3º patamar], [6º patamar], [_Zero Absoluto_ (20 PM)],
  [*2*], [12], [20], [*32*], [uma vez, e você acabou],
  [*4*], [16], [32], [*56*], [duas vezes],
  [*6*], [20], [44], [*80*], [quatro vezes],
)

Um Imperador que não se importou com Espírito conjura a magia definitiva dele *uma única vez* e fica seco. É exatamente isso que o rank Imperador deveria ser: raro, caro e decisivo.

Árvores do Corpo e de Utilidade concedem *0 PM*, sempre.
]

#block(breakable: false)[
=== Pontos de Touki

#quadro(titulo: [PT Máximos = Vigor + (Espírito × Maior Bônus de Rank do Corpo)])[
- Você tem PT desde o *1º patamar* de qualquer árvore do Corpo. Até o 3º patamar (2º, no Deus da Espada) essa reserva só paga *técnicas* — não é aura ainda, é fôlego.
- A partir do 3º patamar você desbloqueia o *Manto de Touki* e as manobras de gasto.
- *Cavalaria e Escudos* soma o Bônus de Rank dele mais uma vez, porque gasta mais rápido que qualquer outra árvore.
- Reserva *única*, mesmo com vários estilos. Metade em Descanso Curto, integral em Descanso Longo.

Repare que o Touki é a única reserva que depende de *dois* atributos: Vigor para existir, Espírito para crescer. É a tradução mecânica do que o cânone diz — a capacidade de vestir aura está atrelada à reserva de mana da pessoa.
]
]

#block(breakable: false)[
=== Pontos de Preparação

#quadro(titulo: [PP Máximos = Intelecto + Atributo-chave + Maior Bônus de Rank de Utilidade])[
PP é a única reserva *não* multiplicativa, e de propósito: ele compra fatos narrativos, não potência. Um Lenda Oculta com Intelecto 5 e Agilidade 6 tem 17 PP para uma aventura inteira, e isso é muito. Reserva única entre as três árvores de Utilidade; recuperada apenas em Descanso Longo.
]
]

#block(breakable: false)[
=== Os Outros Números

- *Classe de Armadura (CA) Base:* *10 + Agilidade*, mais armadura, escudo e efeitos.
- *Iniciativa:* *1d20 + Agilidade*.
- *Deslocamento:* *9 metros*, exceto onde a raça indicar outro valor.
]

#block(breakable: false)[
=== Tabela de Referência: uma ficha em cada patamar

#tbl(8, (left, center, center, center, center, center, center, center),
  [Patamar], [Mago Vigor 2], [Mago Vigor 4], [Norte Vigor 5], [Espada Vigor 4], [Escudos Vigor 6], [Dano do maior atacante], [Rodadas de combate],
  [*1º*], [31], [45], [58], [57], [72], [~24], [2,6],
  [*2º*], [48], [70], [93], [94], [118], [~34], [3,0],
  [*3º*], [67], [97], [130], [133], [165], [~46], [3,2],
  [*4º*], [88], [126], [169], [173], [213], [~62], [3,0],
  [*5º*], [111], [157], [210], [215], [263], [~90], [2,6],
  [*6º*], [136], [190], [253], [261], [318], [~130], [2,1],
)
]

#linebreak() 

*Como ler:* a última coluna é quantas rodadas um marcial médio aguenta sob fogo concentrado do personagem mais ofensivo daquele patamar. Entre *duas e três rodadas* é o alvo — tempo para o curandeiro agir, para o Escudos se interpor e para o mago terminar um cântico longo, sem que o combate vire uma novela.

*Repare que a curva fecha para baixo no 6º patamar.* Isso é proposital: no topo, o Imperador de Fogo e o Imperador da Espada realmente matam gente em duas rodadas, e a resposta a eles não é ter mais vida — é a Barreira, o Escudos, a Postura de Água e não deixá-los agir.

#quadro(titulo: [Exemplo: uma batalha hipotética no 3º patamar])[
Quatro personagens Avançado enfrentam um Norte Veterano (o mesmo patamar, jogado pelo Mestre). O Norte bate primeiro no Mago Vigor 2 (67 PV) e causa 34 — quase metade, mas ninguém cai. No turno seguinte, o Escudos (165 PV) se interpõe com *Sob Minha Guarda*, e os próximos golpes vêm para ele. O grupo tem o turno 2 e 3 inteiros para revidar antes que o mago sequer entre em risco de verdade.

*É essa margem — nunca um golpe, sempre uma sequência de decisões — que a tabela acima existe para garantir.* Um Mestre que joga um inimigo dois patamares acima do grupo quebra essa conta de propósito; isso é uma escolha narrativa rara, não o dia a dia da mesa.
]
]

== 2. A Economia de Ações (As 3 Ações)

No seu turno, você possui *3 Ações*, além de *1 Reação* (usada fora do seu turno, em situações específicas). Você distribui essas 3 Ações da forma que achar mais tática. *Não existe "ação bônus" neste sistema* — tudo é medido em Ações.

- *Andar (1 Ação):* você se move até o seu Deslocamento. _Você pode gastar as 3 Ações para correr o triplo da distância._
- *Atacar com Arma (1 Ação):* um golpe corpo a corpo ou um projétil disparado.
- *Conjurar Magia (custo variável):* consulte a *Tabela de Tempo de Conjuração* no Capítulo 2. O rank da magia dita quantas Ações ela custa.
- *Usar Item (1 Ação):* beber uma poção, aplicar um curativo, sacar uma arma da bainha.
- *Interagir / Ajudar / Se Esconder (1 Ação):* abrir uma porta, dar cobertura a um aliado, buscar esconderijo.

#quadro(titulo: [A Regra de Ouro: Conjuração Contínua e Dividida])[
Magias poderosas exigem mais Ações do que você tem em um turno. Isso é intencional — e o sistema permite *dividir o cântico*.

Exemplo: você gasta 1 Ação recitando neste turno, 1 Ação andando para trás de uma árvore, 1 Ação recitando de novo; no próximo turno, gasta mais 2 Ações e finalmente solta a magia.

*Perda de Foco:* para manter a mana canalizada, você é obrigado a gastar *pelo menos 1 Ação por turno* recitando a magia iniciada. Se passar um turno inteiro sem dedicar nenhuma Ação à conjuração, a magia falha, a mana é perdida, e você recomeça do zero.

*Interrupção:* se você sofrer dano enquanto conjura, faça um teste de *Espírito (CD 10 ou metade do dano sofrido, o que for maior)*. Falhar significa perder o cântico e o PM investido.
]

#quadro(titulo: [Testes Resistidos (Disputas)])[
Nem todo conflito envolve uma CD estática. Se você tentar empurrar um inimigo de um penhasco, disputar uma queda de braço ou arrancar um item das mãos de alguém, ocorre uma *Disputa*.

Ambos rolam *1d20 + Atributo puro* (ex: Força vs Força). Quem tirar o maior total vence. Em caso de empate, a situação se mantém inalterada — ninguém cede terreno.
]

#pagebreak(weak: true)

== 3. Regras de Empilhamento

Com dezessete árvores no jogo, um grupo bem construído consegue empilhar bônus até quebrar a matemática. Estas quatro regras impedem isso sem tirar a graça da combinação.

#quadro(titulo: [Bônus do mesmo tipo não somam])[
Se dois efeitos *seus* dão bônus ao mesmo número (CA, acerto, dano, deslocamento), você usa apenas o *maior*. _Duelista de Rua_ (+2 CA), _Empunhadura Dupla_ (+1 CA) e _Passo do Terreno_ (+2 CA) juntos resultam em *+2 CA*, não +5.

*Exceção importante:* bônus concedidos por *aliados diferentes que gastaram Ações* somam normalmente. O Bardo cantando e o Tático apontando o alvo estão os dois trabalhando; ambos contam.
]

#quadro(titulo: [Teto de Auxílio: +5])[
Nenhum personagem recebe mais de *+5* somados em bônus numéricos vindos de habilidades de aliados no mesmo turno. Acima disso, o excedente é ignorado.
]

#quadro(titulo: [Teto de Ações: 5, no máximo 2 externas])[
Nenhum personagem age mais de *5 vezes* em um turno, e no máximo *2* dessas Ações podem vir de fontes externas (_Avante_, _Antecipação_, _Comando_).

Sem esta regra, um Norte Imperador (4 Ações) com um Tático Comandante na mesa chega a 7 Ações por turno, e o combate deixa de existir.
]

#quadro(titulo: [Uma Salvação por Combate])[
O livro tem quatro formas diferentes de impedir que alguém morra: _Aguentar_ (Touki), _Rejeitar a Morte_ (Cura), _Sem Baixas_ (Tático) e _Custe o Que Custar_ (Escudos). Elas não são bônus, então a regra acima não as cobre.

*Cada criatura só pode ser salva por um desses efeitos por combate.* A segunda tentativa no mesmo alvo, de qualquer fonte, falha e não consome o recurso de quem tentou.

Sem isto, um grupo com Escudos, Tático e curandeiro tem um personagem literalmente imortal, e o Mestre perde a única alavanca de tensão que sobrou.
]

#quadro(titulo: [Vantagem é binária])[
Vantagem não empilha: dez fontes de Vantagem continuam sendo 2d20. *Vantagem Absoluta* (3d20) só vem de efeitos que digam explicitamente "Absoluta", e ela também é um teto — não existe 4d20 neste jogo.

Vantagem e Desvantagem se cancelam uma a uma. Vantagem Absoluta contra Desvantagem simples resulta em Vantagem simples.
]

#pagebreak(weak: true)

== 4. Críticos, Touki e o Fio da Vida

#block(breakable: false)[
=== Sucessos e Falhas Críticas

- *20 Natural (Crítico):* você acerta automaticamente, independentemente da CA ou resistência do inimigo. Role os dados de dano *duas vezes* e some os bônus fixos uma vez só.
- *1 Natural (Falha Crítica):* você erra pateticamente. O Mestre tem controle total sobre o seu destino: sua espada trava no escudo do inimigo, sua magia estoura na sua mão, ou você escorrega e fica _Caído_.
]

#block(breakable: false)[
=== O Despertar do Touki (Aura de Batalha)

O _Touki_ é a técnica na qual um guerreiro reveste o próprio corpo com mana densa, sem precisar de cânticos. Ele endurece a pele como aço, reforça o fio da lâmina e permite que guerreiros partam rochedos com as mãos nuas.
]

Mecanicamente, o Touki *não gasta PM* — ele consome *Pontos de Touki (PT)*, e é desbloqueado no terceiro patamar de qualquer árvore do Corpo. *As regras completas estão no Capítulo 3*, na abertura da Árvore do Corpo.

#quadro(titulo: [Por que magos temem espadachins])[
Um espadachim de rank Santo cruza 9 metros e decapita um mago antes que ele termine o segundo verso de uma magia Avançada. É por isso que a escola de Água investe tanto em barreiras, terreno difícil e empurrões: *cada metro de distância é um verso a mais que você consegue recitar vivo*.
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

== 5. Sangrando e Morrendo

O mundo de _Mushoku Tensei_ não perdoa erros. Magia de cura pode fechar feridas, mas ressurreição beira o mito divino. Se seus Pontos de Vida chegarem a *0*, você cai _Inconsciente_ e entra em estado de Morte.

*O Teste do Fio da Vida*

No início de cada um dos seus turnos em que estiver a 0 PV, role *1d20 + Vigor* contra *CD 10*:

- *Sucesso:* você estabiliza temporariamente — não está morto, mas continua desacordado.
- *Falha:* você recebe *1 Marca da Morte*.
- *Falha Crítica (1 Natural):* você recebe *2 Marcas da Morte*.

Se acumular *3 Marcas da Morte*, você morre permanentemente.

Qualquer magia de cura ou poção aplicada por um aliado remove todas as Marcas da Morte instantaneamente e você acorda. Porém, acordar do trauma cobra um preço: você volta com *1 nível de Exaustão* (regras completas na seção 6 deste capítulo) até fazer um Descanso Longo.

#block(breakable: false)[
=== Cicatrizes de Quase-Morte

#quadro(titulo: [Quando a Morte Quase Ganha])[
Toda vez que você acumular *2 Marcas da Morte* antes de ser resgatado, o corpo guarda a lembrança mesmo depois de curado. Além da Exaustão de sempre, role *1d6* na tabela abaixo (ou escolha, com o Mestre) e ganhe a Cicatriz *permanentemente*. Se tirar uma que já tem, ela atinge outro membro ou sentido, à escolha do Mestre.

#tbl(2, (left, left),
  [d6], [Cicatriz],
  [1], [*Braço Perdido:* Desvantagem em testes de Força e em Atletismo. Não consegue usar armas de duas mãos, nem empunhar arma e escudo ao mesmo tempo.],
  [2], [*Perna Manca:* Deslocamento *-3m*, permanente.],
  [3], [*Olho Perdido:* Desvantagem em Percepção e em qualquer ataque à distância além do alcance curto.],
  [4], [*Voz Quebrada:* não consegue mais usar Conjuração Silenciosa (Cap. 2). Desvantagem em Atuação e Persuasão.],
  [5], [*Mão Trêmula:* Desvantagem em Ladinagem, em Ofícios manuais e em Iniciativa.],
  [6], [*A Sombra Não Sai:* nenhuma penalidade de combate, mas Desvantagem em testes de resistência de Espírito contra Medo — o corpo lembra de ter morrido, mesmo que a mente negue.],
)

*A única cura conhecida é* _Corpo Íntegro_ (Cura, Rank Imperador, Cap. 3) — ela relê o corpo por inteiro e apaga a Cicatriz junto com qualquer outra sequela física. Fora disso, ela é permanente: nenhum Descanso, magia de rank inferior ou poção a remove. É o preço de ter quase morrido, e ele pesa na ficha pelo resto da campanha — não só naquela sessão.
]
]

#block(breakable: false)[
=== Descanso Curto e Longo

- *Descanso Curto (1 a 2 horas):* comer, sentar, refazer o curativo. Recupera *metade dos seus PM e PT máximos*, arredondado para baixo. *Não recupera PV nem PP.*
- *Descanso Longo (8 horas de sono seguro):* recupera *todos* os PM, PT e PP, remove um nível de _Exaustão_, e recupera *PV iguais ao seu Vigor + 1d8* (mínimo 2).
]

#quadro(titulo: [A Carne Não Fecha Sozinha])[
Esta é a regra mais importante do capítulo, e ela existe para uma razão só: *neste sistema, um corte não some porque você dormiu.*

Uma noite inteira de sono devolve ao seu guerreiro talvez dez pontos de vida. Ele tem setenta. Se ele saiu de uma masmorra com quinze, ele vai entrar na próxima com vinte e cinco — a menos que alguém feche aquilo.

*As três únicas formas de recuperar PV de verdade:*

+ *Magia de Cura.* Rápida, cara em PM, e do rank certo para o tipo de ferimento.
+ *Poções.* Caras em dinheiro, limitadas em estoque, e ninguém vende doze de uma vez.
+ *Repouso longo.* Uma semana inteira em cama, em lugar seguro, sem viajar e sem lutar, devolve todos os PV. Campanhas raramente têm uma semana sobrando.

A consequência é direta e proposital: *um grupo sem curandeiro não perde combates — perde a campanha.* Ele vence a primeira luta, sangra na segunda, e na terceira decide voltar para a cidade porque o guerreiro está com um terço da vida e não existe descanso que resolva.

É por isso que toda caravana do Mundo de Seis Faces paga caro por um mago de Cura, mesmo um Principiante que só sabe fechar corte. E é por isso que a escola de Cura não é uma opção de suporte: é infraestrutura.
]

#block(breakable: false)[
=== Trauma de Combate

#quadro(titulo: [Quando o Corpo Sobrevive mas a Mente Cobra a Conta])[
Sobreviver não é sair ileso. Sempre que você chegar a *0 PV*, testemunhar a morte de um aliado a até 9 metros, ou matar alguém que implorava por clemência, ganhe *1 ponto de Trauma* — a critério do Mestre, sem precisar contar cada goblin da estrada.

*Efeito, por ponto de Trauma acumulado:* Desvantagem em testes de Espírito feitos *fora de combate* (persuasão calma, negociação, criar confiança, dormir sem pesadelo). Trauma não afeta nada dentro do combate — na hora da luta, o corpo simplesmente age.

*Removendo Trauma:* gaste uma semana de Downtime (Apêndice F) na atividade *Recuperar-se* acompanhado de alguém de confiança, ou resolva a causa de frente na narrativa — voltar ao lugar, encarar quem sobrou, fazer as pazes com o que aconteceu. Cada semana ou cada cena assim resolvida remove *1 ponto*. Sem isso, o Trauma não passa sozinho: não existe teste de resistência nem Descanso Longo que apague o que aconteceu.

Isto não é um sistema de sanidade: não há loucura, não há tabela de fobias, e não há perda de controle do personagem. É só o lembrete mecânico de que continuar lutando tem custo — e mais um motivo pro pilar de Utilidade importar entre uma masmorra e outra.
]
]

#v(0.4em) #line(length: 100%, stroke: 0.5pt + linha) #v(0.3em)

== 6. Exaustão, Fome, Sede e Clima Extremo

O sistema já usa a condição _Exaustão_ em dezenas de talentos, doenças e maldições sem nunca fechar o que ela faz de fato. Esta seção fecha essa conta.

#quadro(titulo: [Exaustão Tem 6 Níveis, e Eles Empilham])[
#tbl(2, (center, left),
  [Nível], [Penalidade],
  [1], [Desvantagem em testes de atributo e em rolagens de ataque.],
  [2], [Deslocamento reduzido à metade.],
  [3], [Desvantagem em testes de resistência.],
  [4], [PV Máximos reduzidos à metade.],
  [5], [Deslocamento reduzido a 0.],
  [6], [Morte — a menos que a fonte diga o contrário (_Fome Vermelha_, Apêndice D, transforma em vez de matar).],
)

Os efeitos *somam*: no Nível 3, você já soma a Desvantagem de atributo e de ataque do Nível 1 com a de resistência deste nível, além de andar na metade da velocidade.

*Removendo Exaustão:* um Descanso Longo remove *1 nível*, desde que a causa não esteja mais ativa (você comeu, bebeu, saiu do frio). Se a causa continuar, o nível não cai. Magia específica de Cura (_Mão que Acalma_, Cap. 3) remove 1 nível de Exaustão *de origem física* — ferimento, trauma, ter acordado do Fio da Vida — a qualquer momento, mas nunca a de fome, sede, frio ou marcha forçada: isso não é ferimento, é privação, e só sai resolvendo a causa.
]

#block(breakable: false)[
=== Fome e Sede

- *Fome:* ficar um dia inteiro sem nenhuma refeição dá *1 nível de Exaustão* ao anoitecer. Comer qualquer refeição, por menor que seja, zera essa contagem — mas não remove a Exaustão que já acumulou.
- *Sede:* mais urgente. Ficar sem beber água por mais de algumas horas em clima ameno, ou desde o início em calor extremo, dá *1 nível de Exaustão a cada 4 horas* depois da primeira falta.
- *Ração de aventureiro* (item comum, poucas moedas de cobre por dia) resolve as duas ao mesmo tempo — é por isso que toda caravana carrega mais ração do que ouro.
]

#block(breakable: false)[
=== Clima Extremo

Calor ou frio além do que roupas comuns aguentam — deserto ao meio-dia, nevasca, altitude alta — força um teste de *Vigor* a cada poucas horas de exposição. O Mestre define a CD pela severidade: *8* para desconfortável, *14* para perigoso, *18* para letal. Falha: *1 nível de Exaustão*. Equipamento adequado (manto, abrigo, magia de proteção) dá Vantagem no teste ou remove a necessidade dele por completo, a critério do Mestre.
]

#quadro(titulo: [Por que isso é leve de propósito])[
Fome, sede e clima não são o ponto da campanha — são o relógio de fundo que torna uma travessia longa real sem virar planilha. Numa masmorra de um dia, ignore a seção inteira. Numa travessia de duas semanas pela Grande Floresta sem suprimentos, ela decide se o grupo chega ao destino em pé ou arrastando um Nível 4.
]

#pagebreak(weak: true)

= Apêndice A: Ficha de Exemplo — Roxy Migurdia

Use esta ficha para calibrar se os seus números "parecem certos" na mesa.

*Roxy Migurdia* — Migurd | Santo de Água, Avançado de Terra e Vento, Intermediário de Cura

- *Atributos:* Força 0 | Agilidade 3 | Vigor 2 | Intelecto 6 | Espírito 5
- *Maior Bônus de Rank:* +4 (Santo de Água)

*Pontos de Vida*
- Constituição Base: 10 + (2 × 3) = *16*
- Progressão (dobrada): Água 4 patamares (20) + Terra 3 (22) + Vento 3 (16) + Cura 2 (10) = 68 → *136*
- Vitalidade: 2 × 4 × 4 = *32*
- *Total: 184 PV*

*Pontos de Mana*
- (Espírito 5 × Bônus de Rank de magia 4 × 2) + 8 = *48*
- Traço Migurd (triplo do Bônus de Rank de magia): *+12*
- *Total: 60 PM*

_Cumulonimbus custa 10 PM. Ela conjura a magia que a consagrou Santa *cinco vezes por dia*, e mais nada depois disso._

- *BC de Água:* 6 + 4 = *10* — acerta com 1d20+10, CD 18, dano +10
- *BC de Cura:* 5 + 2 = *7* — Espírito, não Intelecto
- *CA:* 13 · *PT e PP:* nenhum
- *Maestrias de Água:* Afinidade Aquática, Cântico Fluido, Termodinâmica Aplicada, Domínio Climático

*Leitura da ficha:* ela acerta praticamente qualquer coisa, sustenta um combate longo inteiro, e ainda assim é a segunda pessoa mais frágil de qualquer grupo em que entrar — 184 PV com um Vigor de 2, contra os 318 de um Escudos de patamar equivalente.

É exatamente o que ela é na história: uma professora genial dentro de um corpo comum, que sobrevive porque nunca deixa ninguém chegar perto. *Se a sua ficha de mago não estiver produzindo esse perfil — acerto altíssimo, mana enorme, vida abaixo da média do grupo — algum número precisa de ajuste.*

= Apêndice B: Molde para Novas Escolas

Este é o valor real de ter fechado a Água primeiro. Cada escola nova precisa exatamente destes sete itens:

+ *Uma condição-assinatura* que a escola aplica de graça. _(Água: Molhado.)_
+ *Um combo interno* que paga por aplicar a condição. _(Água: gelo dobra frio contra Molhado; eletricidade dobra tudo.)_
+ *Uma curva de PV/PM própria* que diferencie a escola. _(Água: PM alto, PV médio. Terra: PV altíssimo, PM baixo. Fogo: dano alto, defesa nenhuma. Vento: meio-termo com bônus de deslocamento.)_
+ *Seis Maestrias automáticas*, uma por rank — sendo que a do *Avançado sempre destranca Magia Combinada* e a do *Rei sempre destranca um elemento secundário*. _(Água → Eletricidade. Fogo → Explosão/Plasma. Vento → Som/Vácuo. Terra → Metal/Magma.)_
+ *Uma Magia Assinatura ◆ por rank*, custando +1 PA.
+ *Uma magia de utilidade pura* que não causa dano nenhum, mas define a identidade da escola fora de combate. _(Água: Afinidade Aquática e Névoa Densa. Terra: erguer abrigo. Vento: comunicação a distância. Fogo: forjar e iluminar.)_
+ *De 6 a 8 conhecimentos por rank baixo, 3 a 4 por rank alto* — o suficiente para a tabela de desbloqueio fechar sem obrigar o jogador a comprar magia velha só para bater a contagem.
+ *Declare qual atributo alimenta o BC da escola.* Fogo, Água, Vento e Terra usam *Intelecto*. Cura, Barreira, Desintoxicação e Invocação usam *Espírito*. Isso divide a Árvore da Magia em duas metades que não competem pelos mesmos pontos de atributo — e é o que impede que todo mago do mundo seja a mesma ficha com feitiços diferentes.

#pagebreak(weak: true)

#largo[
= Apêndice C: Tabela Comparativa de Dano por Turno

A régua com que toda árvore futura deve ser medida. Valores médios, alvo de CA razoável, atributo principal progredindo de 4 até 8.

#tbl(9, (left, left, left, left, left, left, left, left, left),
  [Patamar], [Água], [Fogo], [Vento], [Terra], [Cura], [Desintox], [Barreira], [Invocação],
  [*1º*], [~10], [~12], [~9], [~11], [—], [—], [—], [~13],
  [*2º*], [~20], [~26], [~18], [~24], [—], [~8], [—], [~24],
  [*3º*], [~28], [~40], [~30], [~36], [—], [~20], [—], [~38],
  [*4º*], [~22 + área], [~62], [~45], [~52], [—], [~28], [—], [~55],
  [*5º*], [~54], [~90], [~70], [~76], [~40†], [~55], [~30†], [~80],
  [*6º*], [~39 em 45m], [~130], [~110], [~105], [~55†], [~70], [~40†], [~110],
)

#tbl(8, (left, left, left, left, left, left, left, left),
  [Patamar], [Espada], [Norte], [Suishin], [Arco], [Lutador], [Escudos], [Utilidade],
  [*1º*], [~24], [~19], [~11], [~22], [~21], [~7], [~15 (1º turno)],
  [*2º*], [~34], [~25], [~26], [~34], [~32], [~9], [~18],
  [*3º*], [~46], [~34], [~40], [~48], [~44], [~11], [~22],
  [*4º*], [~58], [~42], [~60], [~62], [~58], [~13], [~26],
  [*5º*], [~76], [~55], [~85], [~78], [~74], [~15], [~30],
  [*6º*], [~120], [~81], [*0 a ∞*], [~91], [~95], [~18], [~31],
)

#linebreak() 

_† Cura e Barreira só causam dano contra alvos específicos: Golpe Divino atinge mortos-vivos e construtos; a Barreira causa dano psíquico a quem tenta conjurar dentro dela. Contra o resto do mundo, as duas colunas são zero._

#block(breakable: false)[
=== Como ler esta tabela

*Número alto não significa personagem melhor. Significa personagem mais estreito.*
]

- *O Fogo tem o maior número e o menor corpo.* 33 PV no Imperador. Ele mata tudo, morre de qualquer coisa, e queima o saque no processo.
- *A Água tem o menor número entre as ofensivas e vence campanhas.* O valor dela é em área, a 45 metros, com aliados poupados e sem chance de errar.
- *A Terra é a única que constrói.* Metade do valor dela nunca aparece aqui: pontes, fortalezas, masmorras vedadas, um grupo que nunca mais dorme exposto.
- *O Arco só é real contra quem não veste aura.* Contra um Santo ou superior, subtraia o dobro do Bônus de Rank do alvo *de cada disparo*. Contra um Imperador da Espada, aqueles ~91 viram ~55.
- *O Suishin-ryū não tem número.* Contra quatro inimigos agressivos ele bate mais que qualquer coisa deste livro. Contra um inimigo que decide ficar parado, ele causa *zero*, para sempre.
- *O Lutador tem o número errado na tabela.* Aqueles ~95 são o dano por turno; o que ele realmente faz é acumular *Quebrantado*. No quarto turno, o inimigo dele perdeu 6 de CA e 6 de dano e a luta já acabou sem que a tabela registrasse.
- *Escudos é a menor coluna do livro e o personagem mais difícil de substituir.* Ele não causa dano. Ele decide quem sobrevive.
- *Cura, Desintoxicação e Barreira não deveriam estar nesta tabela.* Estão aqui só para deixar claro que, se você escolher uma delas esperando causar dano, você escolheu errado — e que o grupo que não tem nenhuma das três não termina a campanha.
]

#pagebreak(weak: true)

#largo[
= Apêndice D: Aflições do Mundo de Seis Faces

Toda aflição tem uma *Profundidade de 1 a 5* que sobe sozinha enquanto ninguém trata, e um mago de Desintoxicação só purga o que estiver dentro do Bônus de Rank dele. Esta é a tabela de referência do Mestre.

*Venenos agudos sobem 1 de Profundidade por hora. Doenças, maldições e petrificações sobem 1 por dia.* Nada disso cai sozinho.

== Venenos

#tbl(4, (left, center, left, left),
  [Aflição], [Prof. inicial], [Origem], [Efeito],
  [*Baba de Sapo-Lodo*], [1], [Pântanos do Continente Central], [_Envenenado_ por 1 hora. Comum, humilhante, e a primeira coisa que um aventureiro novato pega.],
  [*Espinho da Rosa-Preta*], [1], [Planta cultivada em Asura], [Sono profundo em 10 minutos. Não causa dano. Usada por ladrões e por babás.],
  [*Peçonha de Serpente-do-Pântano*], [2], [Serpentes grandes], [2d6 por hora e Desvantagem em Vigor. Mata um camponês em cinco horas.],
  [*Toxina de Aranha Gigante*], [2], [Cavernas, ruínas], [Paralisia progressiva: −3m de Deslocamento por hora, cumulativo até 0.],
  [*Fel de Wyvern*], [3], [Feras voadoras do Continente Demônio], [4d8 por dia. Cega em 48 horas. Vale uma fortuna no mercado negro.],
  [*Sombra Líquida*], [4], [Assassinos profissionais], [Sem sintoma por três dias. No quarto, o coração para. Feita para matar nobres.],
)

== Doenças

#tbl(4, (left, center, left, left),
  [Aflição], [Prof. inicial], [Contágio], [Efeito],
  [*Febre de Estrada*], [1], [Água parada], [1 nível de _Exaustão_. A doença mais comum do mundo e a razão de metade das caravanas atrasarem.],
  [*Podridão de Ferida*], [2], [Ferimento não tratado], [Os PV máximos caem 5 por dia. *Um personagem que termina a sessão ferido e sem curandeiro deve rolar contra isto.*],
  [*Tosse Cinzenta*], [2], [Ar, entre pessoas], [Desvantagem em tudo que exija fôlego. Espalha para quem dorme no mesmo cômodo.],
  [*Peste dos Portos*], [3], [Ratos, carga, navios], [3d6 por dia e contagia 1d4 pessoas próximas por dia. Cidades fecham portões por causa dela.],
  [*Febre de Mana*], [3], [Esgotar PM a zero repetidamente], [Seus PM máximos caem 10% por dia. Magos jovens que treinam demais morrem disto, e ninguém avisa.],
  [*Praga do Continente Demônio*], [4], [Contato com terreno corrompido], [Pele endurece e racha. −1 em todos os atributos por semana, cumulativo.],
)

== Maldições e Transformações

#tbl(4, (left, center, left, left),
  [Aflição], [Prof. inicial], [Origem], [Efeito],
  [*Marca do Sepulcro*], [3], [Profanar um túmulo], [Você não recupera PV por meio nenhum enquanto durar. Nem magia.],
  [*Olhar de Basilisco*], [4], [A criatura], [Petrificação em 4 turnos. Quem chegar em Profundidade 5 é estátua e continua consciente.],
  [*Fome Vermelha*], [4], [Mordida de certos mortos-vivos], [1 nível de _Exaustão_ por dia que não some. Ao chegar a 6, o personagem vira o que o mordeu.],
  [*Nome Roubado*], [5], [Pactos mal fechados], [Ninguém consegue lembrar quem você é. Some dos registros. Só um Imperador desfaz.],
)

== O Teto: Doença da Pedra Mágica

#quadro(titulo: [Profundidade 6])[
A carne vira minério, devagar, começando pelas extremidades. Não dói. Não tem febre. A pessoa simplesmente descobre um dia que dois dedos endureceram e não voltam.

*Nenhum patamar deste livro alcança Profundidade 6.* Um Imperador de Desintoxicação consegue _Selar a Maldição_ e congelar o avanço — e é só isso que o mundo inteiro tem a oferecer.

O grimório de rank Deus que curaria isso existe, está catalogado no Grande Templo de Millis, e ninguém consegue ler o primeiro verso. Toda família que perde alguém para a Pedra Mágica sabe que a cura está escrita, guardada, e a poucos dias de viagem.
]

== Regras de Mesa

- *Definindo a Profundidade:* o Mestre usa a tabela. Se a aflição não estiver aqui, use 1 para incômodo, 2 para perigoso, 3 para grave, 4 para fatal, 5 para lendário.
- *Diagnóstico* (Maestria de Cura, 1º patamar) diz de que *categoria* é o problema e, portanto, se é você ou o outro mago que resolve. *Paladar* (Desintoxicação, 1º patamar) diz *exatamente o quê* e *qual a Profundidade*.
- *Cura não trata nada desta página.* Nem um item. Ela fecha o ferimento por onde a coisa entrou, e só.
- *Contágio:* se uma aflição contagiosa estiver ativa no grupo ao final de um Descanso Longo, cada personagem que dormiu perto faz um teste de Vigor (CD 8 + Profundidade atual).
- *Ritmo:* uma aflição de Profundidade 2 pegada no primeiro dia de viagem chega a 5 em três dias. *É esse relógio, e não o combate, que cria a urgência de uma campanha longa.*
- *Múltiplas aflições:* elas sobem de Profundidade *independentemente*. Um personagem envenenado e doente ao mesmo tempo rola dois relógios separados, e cada um precisa da escola certa para parar.
- *Extração como oportunidade de aventura:* toda aflição extraída (Maestria de Desintoxicação, Intermediário) é um item físico. O Mestre é encorajado a fazer NPCs quererem comprá-lo, roubá-lo ou proibi-lo — é assim que um antídoto vira o motivo da próxima sessão.
- *Duas camadas, quase sempre juntas:* uma aflição de Profundidade (o relógio desta página) é diferente de uma *condição* de combate curta como _Envenenado_ (Desvantagem em ataques e testes de atributo, Cap. 4) — mas a maioria dos venenos e maldições de verdade no jogo aplica as duas ao mesmo tempo: a condição incomoda agora, a Profundidade mata depois. Quando uma magia só cita uma das duas, é proposital.
- *Maldição não é uma escola separada — é um rótulo narrativo* para qualquer aflição que se comporte como as desta página (resiste à Cura comum, não cai sozinha, exige um especialista pra tratar). Mecanicamente, quem "amaldiçoa" alguém é magia de Desintoxicação de Rank Rei ou Imperador (_Toque do Fim_, Cap. 3) — não existe uma árvore de "magia negra" à parte, e é assim de propósito: quem sabe curar maldição é a única escola que sabe infligir uma de verdade.
- *Como tirar proveito de uma aflição que você aplicou:* Profundidade sobe sozinha mesmo fora de combate — um veneno de Profundidade 2 aplicado no início de uma perseguição já pode estar em Profundidade 4 quando a luta de verdade começar. É a ferramenta certa contra um alvo que você não derruba em dano direto (Rank alto demais, chefe com regeneração): plante a aflição, ganhe distância, e deixe o relógio desta página fazer o trabalho por você.
]

#pagebreak(weak: true)

#largo-inline[
= Apêndice E: Ambiguidades Resolvidas

Perguntas que a mesa vai fazer, respondidas antes de virarem discussão.

== Sobre Ranks e Múltiplas Árvores

*Tenho Norte Santo e Espada Principiante. Faço um ataque comum com a espada. Quantos degraus de Dado de Arma?*
Um ataque *comum* usa os degraus do seu *maior patamar entre as árvores do Corpo* — ou seja, os quatro do Norte. Uma *técnica* usa sempre os degraus da árvore que a concedeu: a _Espada de Luz_ do seu Principiante rola com um degrau só, e é por isso que ela é ruim na sua mão.

*Um talento diz "seu Bônus de Rank" e eu tenho cinco árvores. Qual uso?*
O da árvore que concedeu o talento. Se a regra for genérica do livro e não citar árvore, use o *maior* que você tiver.

*Perícia: em qual árvore de Utilidade meu Bônus de Rank soma?*
Apenas nas perícias que *aquela* árvore cobre. Ladino: Furtividade, Ladinagem, Percepção, Acrobacia, Enganação para disfarce. Bardo: Atuação, Persuasão, Intuição, História. Tático: Sobrevivência, Natureza, Investigação, Percepção para rastreio. Se duas árvores cobrem a mesma perícia, use o maior — não some.

== Sobre Touki e PT

*Eu abri o Deus da Espada no 2º patamar. Ele conta para o "+1 por patamar de 3º ou superior"?*
Sim, e é a única exceção do livro: o Deus da Espada conta o *2º* patamar dele nessa soma, porque foi lá que a aura acordou.

*Sou mago de Terra Imperador. Tenho PT?*
Não. Nenhum PT, em patamar nenhum. Magia e Utilidade nunca recebem Touki.

*O Manto de Touki funciona enquanto estou em Postura de Água?*
Funciona. São coisas diferentes: o Manto é passivo do 3º patamar, a Postura é um modo de combate. Os bônus de CA das duas *não somam* (regra de empilhamento) — use o maior.

*Perdi todos os PT. Perco o Manto de Touki?*
Não. O Manto é gratuito e passivo. PT pagam manobras, não a aura.

== Sobre Mana

*Minha escola de Água dá quanto de PM?*
Zero. Nenhuma escola dá PM. A sua reserva inteira é *(Espírito × Maior Bônus de Rank de magia × 2) + 8*.

*Tenho Água Imperador e Fogo Principiante. Somam?*
Não. Use o *maior* Bônus de Rank de magia — o 6 da Água. O Fogo não acrescenta nada à reserva.

*Sou Imperador de Água com Espírito 2. Quantos Zero Absoluto por dia?*
*Um.* Você tem 32 PM e ele custa 20. Foi para isso que a fórmula foi escrita. Se quiser dois, invista em Espírito; se quiser quatro, invista muito.

*Um mago sem magia sobra sem fazer nada no combate?*
Sobra, e isso é o desenho. Magias de 1 e 2 PM existem em todas as escolas exatamente para o mago ter o que fazer depois de gastar o arsenal. Um Imperador de Água seco ainda dispara _Flecha de Água_ o dia inteiro.

*PT e PP também são escassos?*
São. PT recupera metade em Descanso Curto e tudo em Longo. *PP só recupera em Descanso Longo*, nunca em Curto — ele compra fatos narrativos, e um fato que você pode recomprar a cada duas horas não vale nada.

== Sobre Cura, Aflições e Descanso

*Magia de Cura cura veneno?*
Não. Nunca, em patamar nenhum. Isso é Desintoxicação, e a separação é absoluta.

*Desintoxicação cura PV?*
Não. Ela remove a causa; a carne continua aberta. _Sangria_ até *causa* dano de propósito.

*Meu personagem terminou a sessão com 12 de 60 PV e ninguém tem Cura. E agora?*
Dormir devolve Vigor + 1d8. As opções reais são poção, contratar um curandeiro na cidade, ou uma semana de cama. *Este é o aperto que o sistema quer criar*, e ele é a razão de a escola de Cura existir.

*Ferida Selada conta como Ferida Fresca para a cura em dobro?*
Conta. É exatamente para isso que _Selar a Ferida_ existe.

== Sobre Condições

*Posso estar Molhado e Em Chamas ao mesmo tempo?*
Não. Fogo em alvo Molhado evapora a água: a condição _Molhado_ some, o alvo sofre +2 pelo choque térmico, e não pega fogo naquele golpe. Água em alvo Em Chamas apaga o fogo e aplica Molhado.

*Quebrantado some com magia de Cura?*
Não. Não é ferimento — é o corpo parando de responder. Só um Descanso Curto limpa.

*Desequilibrado tira todas as minhas Reações?*
Não. Limita a *uma por rodada*. Um Suishin-ryū Desequilibrado ainda apara uma vez.

*Congelado e Atolado ao mesmo tempo: o Deslocamento fica negativo?*
Deslocamento não fica abaixo de 0. As condições não se somam em efeito, mas escapar exige resolver *as duas* separadamente.

== Sobre Ações e Reações

*Quantas Reações eu tenho?*
Uma por rodada, sempre — a menos que um efeito diga o contrário (Postura de Água, _Segunda Guarda_, Maestria de Muralha).

*Posso usar a Reação no meu próprio turno?*
Pode, desde que o gatilho aconteça.

*Conjurar uma magia de 4 Ações me deixa sem Reação?*
Não. Reação é independente do custo em Ações — mas se você sofrer dano, faça o teste de Interrupção do Capítulo 4 ou perde o cântico.

*O invocado gasta minhas Ações?*
Ordens gerais, não. Ordens específicas, 1 Ação sua. Ele tem Iniciativa própria e age sozinho no turno dele.

== Sobre Preparação (PP)

*O Mestre pode dizer "não" a uma Preparação?*
Só se ela sair do seu *Escopo* ou do seu *Domínio*. Dentro dos dois, ele não nega — ele anexa uma complicação. Essa é a troca inteira.

*Duas árvores de Utilidade me dão duas reservas de PP?*
Uma reserva só. Use o maior atributo-chave entre elas e some +1 por patamar de 3º ou superior em qualquer uma.

*Posso preparar algo no meio de um combate?*
Pode. O fato é sempre passado — você está revelando, não fazendo. Mas ele tem que caber no que você teve tempo e motivo de fazer *antes* da cena começar.

*Posso gastar PP para negar dano ou evitar um golpe?*
Não. PP declara fatos sobre o mundo, o passado e as pessoas — nunca reescreve uma rolagem que já aconteceu nem substitui um teste de resistência. Se o efeito que você quer é "esse ataque erra" ou "esse dano não conta", isso é Touki, Reação ou magia, não Preparação.

*Dois jogadores de Utilidade podem preparar o mesmo fato?*
Não faz sentido narrativo, e o Mestre deve recusar por Domínio: se o Ladino já revelou que a fechadura estava limada, o Tático não pode gastar PP para revelar a mesma coisa de novo. Cada árvore cobre o que as outras duas não cobrem — é para isso que a Regra da Faixa existe.]

#pagebreak(weak: true)

#largo-inline[
= Apêndice F: Tempo Livre e Downtime

Toda campanha tem trechos sem masmorra: a viagem de volta, a estação chuvosa, o mês esperando uma audiência com o rei. Esta seção existe para que esse tempo produza algo na ficha, sem virar burocracia.

== O Bloco de Tempo

Downtime é contado em *blocos de 1 semana* — a mesma unidade que o Repouso Longo (Cap. 4) já usa para curar todos os PV. No fim de cada semana livre, cada personagem escolhe *uma* atividade da lista abaixo. Uma campanha pode se resolver em zero blocos (aventura non-stop) ou em vinte (uma reconstrução de reino) — quanto tempo "passa" entre cenas é decisão do Mestre.

== Atividades

#tbl(2, (left, left),
  [Atividade], [Efeito],
  [*Treinar*], [Ganhe Vantagem no próximo teste de uma Perícia à escolha, ligada à sua Árvore Inicial ou a uma Perícia que você já tenha — dura até ser usado ou até 1 mês passar. Não concede PA: é ensaio, não estudo formal.],
  [*Recuperar-se*], [Como o Repouso Longo de uma semana do Cap. 4: todos os PV são restaurados, e mais 1 nível de Exaustão é removido além do normal — desde que a semana seja de descanso de verdade, sem viagem e sem combate.],
  [*Trabalhar*], [Ganhe PO igual a *2d6 × seu maior Bônus de Rank* (mínimo 2d6), pelo seu Ofício, sua fama ou um trabalho comum da cidade. Um Principiante sem árvore nenhuma ainda ganha o mínimo — todo mundo sabe fazer alguma coisa.],
  [*Cultivar um Contato*], [Anote um NPC nomeado e uma cidade ou facção. Da próxima vez que você precisar de uma informação, um favor pequeno ou uma porta fechada, o Mestre pode deixar esse contato resolver — sem PP, sem teste — porque a relação já foi construída fora de cena.],
  [*Estudar um Ofício ou Ritual*], [Se você tem a Perícia de Ofícios (Cap. 1) ligada ao que quer fazer (forjar, alquimizar, encantar), gaste o bloco pra produzir um item mundano ou preparar os materiais de um ritual que você já pode conjurar. O Mestre define o custo em PO dos materiais — normalmente metade do preço de mercado.],
  [*Vigiar as Costas do Grupo*], [Sem efeito mecânico próprio, mas concede a *outro* personagem Vantagem na atividade dele nesta semana, cobrindo os riscos enquanto ele treina ou trabalha desprotegido.],
)

#quadro(titulo: [Downtime Não Compra Progressão])[
Nenhuma atividade acima concede PA, magia, talento ou Rank — isso continua vindo só de jogar a campanha (Cap. 1, seção 2). Downtime existe para que o tempo entre aventuras *pareça* vivido, não para virar uma segunda forma de subir de patamar sem risco.
]

== Downtime Interrompido

Se uma aflição (Apêndice D) estiver ativa em alguém do grupo, a Profundidade dela continua subindo normalmente durante o downtime — um bloco de "Recuperar-se" não pausa o relógio de um veneno ou de uma doença. É assim que uma semana de descanso mal planejada vira a razão de a próxima cena começar com alguém pior do que quando a sessão anterior terminou.
]

#pagebreak(weak: true)

#largo[
= Apêndice G: A Guilda de Aventureiros

Toda cidade com mais de um poço tem uma sede da Guilda, e é lá que a maioria dos personagens deste livro começa. Este apêndice formaliza o que até aqui era só referência narrativa (Cap. 1, seção 2): como funciona o Rank de Aventureiro, e o que ele realmente muda na mesa.

== O Rank Não É o Patamar

*O Rank de Aventureiro (F a S) mede reputação, não poder de combate.* Ele não aparece em nenhuma fórmula deste livro, não dá bônus de ataque, e não é igual ao Rank das suas Árvores de Progressão (Cap. 1). Um Deus da Espada desconhecido que nunca aceitou um contrato formal pode ser Rank F. Um grupo de Rank A pode ter só um patamar Avançado cada — a diferença é que eles já resolveram cem contratos e a Guilda sabe o nome deles.

#tbl(3, (center, center, left),
  [Rank], [PA total já ganho _(referência, não trava)_], [O que muda],
  [*F*], [0 – 5], [Recém-registrado. Só pega contrato de mural público, sem escolta nem garantia — a Guilda não te conhece o bastante pra arriscar o nome dela.],
  [*E*], [6 – 14], [Sobrevive ao trabalho de rotina: escolta de caravana, extermínio de pragas, entrega em estrada segura.],
  [*D*], [15 – 29], [Aceita contratos fora da cidade-sede. Pagamento sobe; a Guilda passa a cobrar 10% de taxa de intermediação.],
  [*C*], [30 – 49], [Pode liderar um grupo de Ranks inferiores num contrato — e responde por eles se algo sair errado. Acesso ao arquivo de bestas da sede local.],
  [*B*], [50 – 74], [Contratos de nobreza e de guerra pequena passam pela sua mesa. Seu nome começa a aparecer em relatórios que sobem pra capital.],
  [*A*], [75 – 109], [Reconhecido em qualquer continente que tenha Guilda. Recusar um contrato de escala regional exige justificativa formal — a Guilda cobra satisfação.],
  [*S*], [110+], [Menos de dez vivos por continente, normalmente. Contratado direto por reinos e Guildas de outras nações, não por clientes. Vira assunto de história, não de mural.],
)

#quadro(titulo: [Por que "referência, não trava"])[
O número de PA na tabela acima é um *palpite calibrado*, não uma regra de desbloqueio — ao contrário do Rank das Árvores (Cap. 1, seção 3), não existe teste nem compra pra subir de Rank na Guilda. Quem decide é o Mestre, olhando pro que o grupo *fez* publicamente: um personagem com 40 PA gastos todos em Perícias e talentos discretos de Ladino pode continuar Rank F de propósito — ele é forte, só não é famoso. E um personagem com 20 PA que matou um Superd em praça pública pode virar Rank C da noite pro dia. A tabela existe pra dar um chute inicial ao Mestre, não pra tirar a decisão dele.
]

== Subindo de Rank

Sobe-se de Rank completando contratos marcados pela Guilda como *do Rank seguinte ou superior*, sendo indicado por alguém de Rank mais alto, ou por um feito público grande o bastante pra virar história contada em taverna — matar algo que a Guilda já tinha desistido de resolver, salvar uma cidade inteira. A promoção nunca é automática: exige voltar à sede, ser avaliado, e — a partir de Rank C — pagar uma taxa de registro em PO.

== Obrigações do Rank

Rank alto não é só privilégio. A partir de *Rank C*, recusar um contrato marcado como *emergência* sem justificativa perde Rank — a Guilda entende recusa como o aventureiro decidindo, sozinho, que a vida de quem pediu ajuda vale menos que a dele. A partir de *Rank A*, a morte do aventureiro em contrato é investigada formalmente pela sede, e o grupo que estava com ele presta depoimento.

#quadro(titulo: [Gancho pro Mestre])[
O Rank de Aventureiro é a ferramenta mais simples deste livro pra calibrar dificuldade sem inventar números: se o grupo é Rank D, o mural tem contratos de Rank D pra cima — o próprio nome do contrato já avisa o jogador que ele está escolhendo desafiar algo acima do normal. Nenhuma tabela de dificuldade de monstro é necessária além disso.
]
]

#pagebreak(weak: true)

#largo[
= Apêndice H: Viagem entre Continentes

O Mundo de Seis Faces tem seis continentes, e cruzar de um pro outro nunca é rápido nem barato — é exatamente por isso que cada um desenvolveu magia, política e bestas diferentes. Este apêndice dá ao Mestre uma régua rápida pra travessias longas, reaproveitando os *blocos de 1 semana* do Downtime (Apêndice F) como unidade de tempo.

== Rotas e Tempo de Travessia

#tbl(4, (left, left, center, left),
  [Rota], [Meio], [Tempo], [Risco],
  [Central ↔ Millis], [Navio de linha, porto grande], [1 bloco], [Baixo — a rota comercial mais movimentada do mundo.],
  [Central ↔ Begaritt], [Caravana pelo deserto, ou navio contornando a costa], [2 blocos por terra · 1 por mar], [Médio — quem vai por terra enfrenta Clima Extremo (Cap. 4) o trajeto inteiro.],
  [Millis ↔ Continente Demônio], [Travessia do Estreito — poucos portos autorizam a rota], [2 blocos], [Alto — águas raramente patrulhadas, e não existe tratado de livre passagem entre os dois.],
  [Central/Millis ↔ Continente Divino], [Só por convite ou peregrinação religiosa registrada], [3 blocos], [Baixo em trânsito, altíssimo em *acesso* — a maioria dos pedidos é recusada antes de sair do porto.],
  [Qualquer rota ↔ Continente Demônio por terra], [Não existe.], [—], [O Continente Demônio é isolado por água em todas as direções conhecidas — chegar lá é sempre por mar.],
)

== Perigo por Região

Uma região perigosa não precisa de um encontro roteirizado pra cobrar seu preço — muitas vezes a região em si já é o desafio (Cap. 4, seção 6: Exaustão, Fome, Sede e Clima Extremo). Use esta tabela pra decidir a frequência de testes de Clima e a chance de encontro por bloco de viagem, sem precisar inventar na hora.

#tbl(4, (left, center, center, left),
  [Região], [Teste de Clima], [Chance de encontro / semana], [Nota],
  [Grande Floresta (Millis)], [Nenhum — clima ameno], [Alta (1d6: 1-2 = encontro)], [Território de feras territoriais e comunidades élficas fechadas. Perder-se é o perigo real, não o combate.],
  [Deserto de Begaritt], [CD 14 (perigoso) ao meio-dia], [Média (1d6: 1 = encontro)], [Sem ração de sobra, a Sede sozinha mata uma caravana despreparada antes de qualquer monstro.],
  [Continente Demônio], [CD 8 a 18, conforme a sub-região], [Alta (1d6: 1-3 = encontro)], [Nenhuma lei unificada protege viajantes — o risco não é o clima, é não ter a quem recorrer se algo der errado.],
  [Mar aberto (qualquer rota)], [Nenhum, exceto tempestade (CD do Mestre)], [Baixa (1d10: 1 = encontro)], [O maior risco é o navio, não o grupo — poucos personagens têm como agir se o casco furar em alto-mar.],
)

#quadro(titulo: [Não é sobre rolar toda semana])[
Estas tabelas existem pra resolver uma travessia em trinta segundos quando ela não é o foco da sessão: "vocês levam 2 blocos, testem Clima uma vez no meio do caminho, aqui está o resultado" — não pra virar uma sequência obrigatória de rolagens. Se a travessia *é* o foco da sessão, ignore a tabela e narre cena a cena.
]
]

#pagebreak(weak: true)

#largo[
= Apêndice I: Reputação com Facções

Nem toda consequência de uma campanha cabe em PA ou em Rank de Aventureiro (Apêndice G) — às vezes o que muda é *quem abre a porta pra você*. Este apêndice trata reputação como uma escala narrativa de cinco degraus, uma por facção, movida pelo Mestre conforme os atos públicos do grupo.

== A Escala

Cada facção relevante da campanha tem sua própria reputação, independente das outras — ajudar o Reino Asura não melhora automaticamente sua posição com a Igreja de Millis, e às vezes piora.

#tbl(2, (left, left),
  [Nível], [O que significa, em qualquer facção],
  [*Inimigo (-2)*], [A facção age ativamente contra o grupo, sempre que puder fazer isso sem custo alto pra ela.],
  [*Desconfiado (-1)*], [Portas se fecham por precaução. Nenhum ataque direto, mas nenhuma ajuda também.],
  [*Neutro (0)*], [Ponto de partida padrão — a facção nem sabe quem vocês são, ou sabe e não se importa.],
  [*Respeitado (+1)*], [Contratos, favores e informação ficam mais fáceis de conseguir dentro do território da facção.],
  [*Aliado (+2)*], [A facção arrisca recursos reais pelo grupo — tropas, magos, dinheiro — porque considera a causa dela também.],
)

== As Três Facções deste Livro

#tbl(4, (left, left, left, left),
  [Nível], [Reino Asura], [Igreja de Millis], [Deuses Demônios (Continente Demônio)],
  [*Inimigo*], [Mandado de captura ativo — a guarda ataca de vista em qualquer cidade do reino.], [Excomungado. Templos recusam cura, abrigo e até água.], [Marcado como inimigo pela Imperatriz Kishirika — Superd caçam o grupo por conta própria.],
  [*Desconfiado*], [Vigiados: espiões da coroa relatam cada movimento em Ars.], [Sacerdotes recusam bênção e informação, mas não interferem.], [Tolerados, desde que fiquem fora do território de um clã específico.],
  [*Neutro*], [Só mais um grupo de aventureiros no registro da capital.], [Nenhum templo conhece o grupo pelo nome.], [O grupo é estrangeiro — cuidado padrão, nada pessoal.],
  [*Respeitado*], [Acesso à corte menor; nobres oferecem contratos diretos, sem passar pela Guilda.], [Curas gratuitas em templos menores; acesso à biblioteca de um mosteiro.], [Um clã específico garante passagem segura pelo seu território.],
  [*Aliado*], [Audiência com a coroa por pedido. Tropas reais em campanhas de escala regional.], [O Grande Templo de Millis abre arquivos que nem todo sacerdote tem permissão de ler.], [A Imperatriz Kishirika reconhece o grupo — abre portas que nenhum humano jamais teve.],
)

#quadro(titulo: [Como o Mestre move o marcador])[
Não existe fórmula. Reputação sobe ou desce por *atos públicos*, não por PA gasto ou sessões jogadas — matar um general renegado do Reino Asura em praça pública sobe reputação com a coroa, mesmo que o grupo nunca tenha "farmado" isso de propósito. Sugestão prática: mude só *um* degrau por vez, e só quando o ato for grande o bastante pra virar boato ou registro oficial. Gentileza pequena não sobe Rank — só o que a facção realmente perceberia.
]

#quadro(titulo: [Facções não são unânimes])[
"Reino Asura" e "Igreja de Millis" têm política interna — nobres de facções rivais na corte, ou sacerdotes conservadores contra reformistas. Nada impede um personagem de ser Aliado de uma ala e Inimigo de outra dentro da mesma facção nominal; isso é ferramenta de enredo, não exceção à regra. O mesmo vale pro Continente Demônio: "Deuses Demônios" cobre dezenas de clãs de Superd que raramente concordam entre si (Cap. 1, Raça Demônio).
]
]

#pagebreak(weak: true)

#largo[
= Apêndice J: Cerco e Batalha em Escala de Exército

O patamar *Senhor da Guerra* (Tático, Cap. 3) já aponta pra isso: guerra em escala de reino não se resolve rolando Iniciativa pra cada soldado. Este apêndice dá ao Mestre uma forma rápida de rodar um cerco ou uma batalha de exércitos usando três números por lado, não uma ficha por soldado.

== Os Três Números de um Exército

#tbl(2, (left, left),
  [Recurso], [O que mede],
  [*Força*], [Poder de combate efetivo. Chega a 0: o exército está destruído ou capturado — não existe recuo organizado depois disso.],
  [*Moral*], [Vontade de continuar lutando. Chega a 0: o exército foge ou se rende, mesmo com Força de sobra.],
  [*Suprimento*], [Comida, munição, reforços em trânsito. Chega a 0: o exército perde *1 de Força* automaticamente a cada fase, até algo mudar.],
)

Um exército comum (uma guarnição de cidade média, uma horda de saqueadores) começa com *Força 6, Moral 6, Suprimento 3*. Ajuste pra cima ou pra baixo conforme tamanho e preparação — uma tropa de elite ou muito maior pode começar com Força e Moral 10; uma milícia mal treinada pode começar com Moral 3.

== As Três Fases

Toda batalha ou cerco corre em três fases — *Abertura*, *Embate* e *Desfecho*. Em cada fase, o Mestre decide um punhado de eventos (2 a 4) que mudam Força, Moral ou Suprimento de um ou de ambos os lados. É aí que o grupo entra.

#quadro(titulo: [Onde os personagens entram])[
Cada ação notável de um personagem na batalha vira um evento de fase, não uma rolagem individual contra cem soldados:

- *Magia de área em escala Imperador ou Deus* (Fogo, Terra, Água) pode valer sozinha *-2 a -4 de Força* inimiga numa fase — é por isso que reinos recrutam magos antes de soldados.
- *Um Senhor da Guerra* usando _A Batalha Que Você Escolheu_ ou uma Preparação prévia pode negar reforços, mudar o terreno a favor do próprio lado, ou dar *+1 de Moral* ao próprio exército por fase.
- *Um Bardo* usando _O Fim da Canção_ ou uma Preparação de discurso pode custar *-2 de Moral* inimiga ou *+2 de Moral* própria numa fase.
- *Um Ladino* sabotando suprimentos antes do cerco começar pode zerar o *Suprimento* inimigo já na Abertura.
- *Combate pessoal contra o comandante inimigo*, resolvido com as regras normais do Cap. 4, pode causar *-3 de Moral* inimiga se o grupo vencer em público — ou *-3 de Moral* própria se perder.
]

== Resolvendo o Desfecho

Ao fim da fase de Desfecho, compare Força e Moral dos dois lados:

+ O lado com *Moral 0* foge ou se rende, mesmo vencendo em Força.
+ O lado com *Força 0* está destruído.
+ Se nenhum dos dois chegar a 0, vence o embate quem tiver a maior soma de *Força + Moral* — o outro recua com o que sobrou, pronto pra outra rodada de fases numa sessão futura, se a guerra continuar.

#quadro(titulo: [Isto não substitui o Capítulo 4])[
Se um personagem entra em combate individual contra um alvo específico — um campeão inimigo, o comandante, uma torre de cerco — resolva aquilo com as regras normais de combate. O sistema de exército só existe pra tudo em volta que não vale a pena virar Iniciativa: os outros milhares de pessoas no campo.
]
]

#pagebreak(weak: true)

#largo[
= Apêndice K: Bestiário — Criaturas por Patamar

O Mestre não precisa de uma ficha completa pra cada monstro — precisa de números que já batem com a régua do Cap. 4 e do Apêndice C sem trabalho extra. Este apêndice dá o molde por patamar e um punhado de criaturas prontas pra reskinar.

== O Molde por Patamar

#tbl((1.2fr, 0.8fr, 0.8fr, 1.2fr, 1.2fr, 1.3fr), (left, center, center, center, center, center),
  [Patamar], [PV], [CA], [Bônus de Ataque], [Dano por turno], [CD de resistência],
  [*1º — Comum*], [20], [12], [+3], [~10], [11],
  [*2º — Perigosa*], [45], [13], [+4], [~20], [13],
  [*3º — Ameaça*], [90], [14], [+6], [~35], [15],
  [*4º — Elite*], [150], [15], [+8], [~55], [17],
  [*5º — Terror*], [220], [16], [+10], [~80], [19],
  [*6º — Lenda*], [320], [17], [+12], [~120], [21],
)

#quadro(titulo: [De onde vêm esses números])[
PV e Dano seguem a mesma curva da Tabela de Referência do Cap. 4 (uma ficha em cada patamar) e da Tabela Comparativa de Dano por Turno (Apêndice C) — uma criatura deste patamar aguenta e causa aproximadamente o que um personagem daquele patamar aguenta e causa, um pouco abaixo pra sustentar encontros com mais de uma criatura. CA e CD sobem devagar de propósito: neste sistema, a diferença entre patamares é *quantas rodadas o combate dura*, não "acerta sempre" contra "erra sempre".
]

#quadro(titulo: [Ajustando pra cima ou pra baixo])[
- *Grupo de criaturas fracas* (uma horda): use metade do PV e do dano do patamar, mas multiplique o número de criaturas — três "1º — Comum" já é uma cena inteira.
- *Chefe único*: dobre o PV da linha do patamar dele e mantenha o dano — ele precisa durar mais rodadas que os capangas, não bater mais forte que um personagem do mesmo patamar.
- *Fera sem inteligência* (a maioria do Bestiário): sem Perícias sociais, sem resistência a Persuasão/Enganação — role só o Atributo puro nesses casos, como o Cap. 1 já define pra qualquer teste fora da lista fechada de Perícias.
]

== Seis Criaturas Prontas

#tbl(3, (left, center, left),
  [Criatura], [Patamar], [O que a torna perigosa],
  [*Sapo-Lodo Gigante*], [1º — Comum], [Língua pegajosa (_Preso_, CD 11) e a _Baba de Sapo-Lodo_ (Apêndice D) em cada mordida. Comum nos pântanos do Continente Central.],
  [*Serpente-do-Pântano*], [2º — Perigosa], [_Peçonha de Serpente-do-Pântano_ (Apêndice D) em cada picada bem-sucedida — o veneno mata mais gente do que as presas.],
  [*Aranha Gigante das Cavernas*], [2º — Perigosa], [Teia que aplica _Preso_ em área antes do combate começar; ataca de emboscada com Vantagem no primeiro turno.],
  [*Wyvern*], [3º — Ameaça], [Voa, mergulha pra morder e volta a 18 metros de altura no mesmo turno — só um Arqueiro ou um mago à distância acompanha o ritmo dela.],
  [*Ogro de Guerra (Onizoku)*], [4º — Elite], [Um único golpe de maça rola o Dado de Arma duas vezes; se acertar um alvo _Caído_, o dano é *triplicado*.],
  [*Superd Renegado*], [5º — Terror], [Usa o Terceiro Olho (Cap. 1) pra nunca ser flanqueado e conjura Magia de Água até o patamar Rei — trate como um NPC completo se ele reaparecer mais de uma vez na campanha.],
)

#quadro(titulo: [Quando vale a pena fazer uma ficha completa])[
As seis criaturas acima bastam pra maioria dos encontros. Reserve uma ficha completa (como o Apêndice A) pra qualquer criatura que vá reaparecer — um vilão recorrente, um dragão nomeado, o líder de uma facção (Apêndice I). Tudo que aparece uma vez só, morre na mesma cena.
]
]


