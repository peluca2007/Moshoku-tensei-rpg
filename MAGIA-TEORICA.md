# Magia Teórica — proposta de árvore e sistema de fórmulas, v5

> **RASCUNHO DE DESIGN — SUJEITO A MUDANÇAS.** Revisão de 25/09/2026, na branch
> `codex/rework-barreira`. Os custos, limites, talentos, nomes e interações abaixo
> são hipóteses para teste de mesa. A árvore `Magia Teórica` já substitui
> `Barreira e Proteção` no catálogo e nas fichas; os circuitos avançados deste
> documento ainda não são todos executados pela oficina.

O objetivo desta revisão é fechar as decisões necessárias para testar a árvore:
quem cria, o que cada compra concede, como uma fórmula resolve seus efeitos e
quais regras impedem combinações sem custo ou sem resposta. A oficina do site é
um **protótipo parcial desta revisão**; a comparação ao fim deste documento
identifica as diferenças. Uma regra proposta aqui não deve ser presumida como
já calculada pelo site.
Para aprender sem abrir todas as tabelas, comece pelo
[guia do primeiro grimório](MAGIA-TEORICA-GUIA.md): quatro receitas pequenas,
trocas de uma peça e desafios com resposta. Este arquivo é a referência de
construção para quem quiser ir além das primeiras fórmulas.

## A mudança central

**Barreira deixa de ser uma árvore.** Ela passa a ser uma aplicação da árvore
**Magia Teórica**: um ramo de fórmulas com os operadores Conter e Rejeitar,
que podem produzir contenção, rejeição ou isolamento.
O mesmo sistema também produz projéteis, armadilhas, selos, encantamentos e
circuitos de invocação. Não há uma lista fechada de "magias da Teórica" capaz de
prever todas as combinações.

Magia Teórica ensina a **gramática**: ler, desenhar, conectar e estabilizar uma
fórmula. As outras árvores ensinam parte do **vocabulário**. O jogador pode
aprender símbolos avulsos por PA sem abrir a árvore correspondente. Isso compra
uma palavra, não as maestrias, magias prontas ou potência daquela escola.

**Criar fórmulas exige possuir a árvore Magia Teórica.** Conhecer uma essência
por outra árvore, ou comprar seu símbolo por PA, não libera a construção.
O rank em Magia Teórica limita o circuito, mesmo quando a essência veio de
uma escola de rank superior. Alimentar uma fórmula pronta continua acessível
a qualquer criatura capaz de fornecer PM. Barreira se torna um ramo dessa
mesma árvore, sem um segundo desbloqueio. A Teórica deve funcionar como árvore
inicial: Mana, seus operadores e a primeira geometria já permitem jogar.

### Identidade da árvore proposta

| Campo | Proposta para teste |
| --- | --- |
| Pilar e recurso | Magia; usa PM. Abertura e progressão seguem as demais árvores mágicas. |
| Atributo | Intelecto. O BC de uma célula é Intelecto do construtor + bônus de sua potência operacional. A mudança de Espírito da antiga Barreira precisa de tratamento na migração. |
| Mecânica central | **Glifo composto:** inscrever operadores sobre uma essência, fechar a geometria e alimentar a saída. |
| Ciclo de jogo | Ler a situação; escolher componentes conhecidos; preparar o suporte; pagar PM; resolver a fórmula. |
| Especialidade | Preparação, interação entre escolas, barreiras, dispositivos e efeitos condicionais. |
| Limite de identidade | Comprar Fogo oferece uma essência. Maestrias, magias assinaturas e talentos de Fogo continuam sendo compras e capacidades dessa árvore. |
| PV por patamar | Candidato inicial: manter a curva da antiga Barreira — 1d6+1, 1d6+2, 1d8+2, 1d8+2, 1d8+3, 1d8+3. Revisar no teste de sobrevivência; nenhum dado acima de d8. |
| Proficiências | Armadura leve; nenhum grupo de armas. Arcanismo e uma entre Ofícios, Percepção, Intuição e Religião (preservada para fichas antigas). O bônus de rank não soma em perícias. |

O benefício deve aparecer na capacidade de preparar soluções e combinar
funções. Uma fórmula ofensiva genérica precisa ser comparada com uma magia
pronta pelo **PM, PA investido, Ações, alcance e efeito completo**; dados de dano
isolados não demonstram equilíbrio.

Uma fórmula é um objeto de jogo concreto. O jogador traça seus símbolos e
ligações no papel ou no editor do site. A mesa julga **quais símbolos e ligações
existem**, não a beleza da caligrafia. O desenho não é decoração: centro,
sequência, ramificações, contorno e meio têm efeitos diferentes.

O [laboratório interativo no fim do Capítulo 2](http://localhost:3020/livro#cap2-8)
mostra um **glifo composto** no centro e a forma como contorno. Cada operador
é inscrito **sobre o símbolo do núcleo**: a flecha de Projetar atravessa a
essência, os traços de Conter a encerram e os de Rejeitar a interceptam.
Pequenos numerais junto aos traços sobrepostos indicam a ordem. A legenda
decompõe o desenho em peças para ensinar a leitura; os operadores da fórmula
não ficam como símbolos satélites ligados por setas.

## A primeira sessão: uma receita de três decisões

O livro começa com **um desenho que funciona**, antes de mostrar o catálogo
completo. O jogador escolhe: **o que existe** (núcleo), **o que acontece**
(operador) e **onde acontece** (forma). Mana no ar é o meio padrão nessa lição.

```text
1. Trace a forma externa:       □  Quadrado
2. Inscreva o núcleo:           Mana
3. Sobreponha a ação:           traços de Conter sobre Mana
4. Pague a conta:               1 + 2 + 1 = 4 PM
5. Leia o resultado:            parede de até 3 m, 30 PV, 1 minuto
```

Uma carta de símbolo mostra sempre as mesmas cinco informações: **glifo para
copiar, função, custo em PM, limite de rank e um exemplo de ligação**. A carta
da forma mostra o modificador numérico. A folha da fórmula soma os componentes
numa linha visível; o jogador não precisa decorar a tabela inteira para usar
sua primeira barreira.

**Desenhar de verdade:** cada glifo terá uma versão oficial curta, de dois a
cinco traços, reproduzível à mão. O núcleo ocupa o centro; os operadores são
traçados sobre ele, formando um único glifo composto. Pequenos numerais junto
aos traços marcam a sequência; modificadores qualificam esses traços e a forma
fecha o circuito. Se o desenho for torto, continua válido. Se faltar um traço
essencial ou a ordem mudar, a fórmula muda ou falha. No site, a legenda mostra
o núcleo e cada operador separadamente apenas para ensinar como compor o
desenho. O jogador desenha livremente e confirma quais glifos e ligações
pretendia traçar; reconhecimento automático nunca decide sozinho uma perda de PM.

| Momento de aprendizagem | O jogador vê | A profundidade que fica disponível |
| --- | --- | --- |
| Primeira fórmula | 1 núcleo + 1 operador + 1 forma; conta pronta na carta. | Pode produzir uma barreira, projétil ou efeito simples. |
| Depois de entender o básico | Ordem dos traços numerados e escolha do meio. | A mesma dupla de símbolos produz resultados diferentes. |
| Intermediário | Modificadores e um terceiro ou quarto símbolo. | Alvo, duração e direção. |
| Avançado | Ramificação e círculo dentro de círculo. | Armadilha e proteção que combina duas escolas. |
| Santo em diante | Circuitos ligados, reserva e condições. | Sistemas preparados por vários personagens. |

O atalho de leitura de qualquer fórmula é sempre **"o que → faz o quê → em
quem/onde → quando"**. As setas nesta frase indicam a leitura em texto, não
operadores separados no desenho. No nível alto a frase cresce; a gramática não muda.

## Três capacidades independentes

| Capacidade | O que permite | Precisa entender os símbolos? |
| --- | --- | --- |
| Ler | Identificar componentes, fluxo, custo e gatilho de uma fórmula. | Sim, para explicar cada componente; uma leitura parcial pode revelar só a saída. |
| Construir | Possuir Magia Teórica e desenhar uma fórmula nova dentro dos limites de seu rank nela. | Sim: precisa conhecer todos os símbolos usados. |
| Alimentar | Injetar PM em um circuito pronto e íntegro. | **Não.** Qualquer criatura capaz de fornecer PM pode fazê-lo. |

O construtor determina a fórmula e registra sua potência e seu BC. Cada
teste de resistência usa `CD = 8 + BC` da célula responsável pelo efeito.
O alimentador fornece PM; não muda a fórmula nem herda seu
conhecimento. Se o desenho pede 12 PM, alguém com enorme reserva pode pagar os
12 PM mesmo sem saber o que o circuito fará. PM excedente não melhora o efeito:
o núcleo só aceita a capacidade que foi desenhada. Injetar menos que o custo
deixa a fórmula inativa; pagamentos parciais só são aceitos por uma reserva
inscrita. O limite do material sozinho não cria essa reserva. BC, potência e
talentos incorporados são registrados na preparação, sem bônus temporários
do construtor. O rank ou o atributo do alimentador não substituem esses valores.

**Copiar ≠ compreender:** a partir de Magia Teórica Intermediária, o personagem
pode construir uma cópia exata de um molde que possua, dentro dos limites de
seu rank, mesmo sem conhecer cada símbolo. Alterar o desenho exige conhecer
os símbolos e ligações alterados. Copiar traços no papel sem essa capacidade
não prepara um circuito funcional. Ativar um circuito já preparado exige
apenas PM. Assim um pesquisador com pouca mana e um alimentador com muita
mana podem trabalhar juntos.

Uma cópia passa a ter o copista como construtor e usa os seus valores permanentes,
sem aumentar a potência inscrita. Copiar não dispensa pré-requisitos explícitos
de talentos, procedimentos exclusivos ou magias encapsuladas. Um símbolo cujo
modo ainda não tenha contrato não se torna utilizável só por existir num desenho.

## As quatro camadas obrigatórias

1. **Símbolos:** pelo menos uma essência (o que existe) e um operador (o que
   acontece). Modificadores acrescentam alvo, condição, alcance, duração etc.
2. **Estrutura:** operadores sobrepostos ao núcleo formam o glifo; pequenos
   numerais junto aos traços indicam a ordem de execução. Ramificações, vínculos e
   subfórmulas consomem capacidade. Na leitura textual, `Fogo → Projetar → Expandir` cria uma saída
   crescente; `Fogo → Expandir → Projetar` começa largo e lança o conjunto.
3. **Forma:** o contorno externo determina distribuição espacial e troca números.
   Círculo, quadrado, triângulo, linha, espiral, hexágono e estrela têm regras
   próprias; não são apenas nomes de magias.
4. **Material:** define tempo de traço, resistência do desenho, duração e se o
   circuito pode ser preparado ou transportado. Não concede símbolos nem rank.

Para ser válida, a fórmula tem **uma entrada de PM**, um caminho contínuo entre
os símbolos e **uma saída ou armazenamento**. Conexão rompida desliga o trecho
seguinte; uma ramificação sem saída consome PM sem produzir efeito. O jogador
marca a ordem dos operadores no desenho. As conexões contadas nas regras
representam passagens de uma operação à seguinte, mesmo quando os glifos
ocupam o mesmo centro. Dois núcleos de essência exigem uma
subfórmula (Avançado ou superior).

## Vocabulário inicial e compra de símbolos

Cada símbolo avulso comum custa **1 PA**. Comprar `Som` não exige Bardo nem
mesmo abrir Magia Teórica, mas não concede nenhuma magia ou maestria de Bardo.
Sem Magia Teórica, o personagem conhece o símbolo e pode reconhecê-lo; ainda
não constrói fórmulas novas. Se abrir depois uma árvore que lhe conceda um
símbolo já comprado, troca a compra por outro símbolo comum de 1 PA. Mantém
assim o conhecimento pago e não perde PA. Símbolos raros podem custar 2 PA,
mas devem aparecer com esse preço e seu pré-requisito escritos no livro. O
catálogo abaixo é a base proposta, não uma licença para inventar símbolos
durante o combate.

Cada símbolo **comprado avulso** pode ocupar uma entrada de conhecimento da
Magia Teórica depois que a árvore estiver aberta, respeitando seu pré-requisito.
Ele conta uma vez, independentemente de custar 1, 2 ou 3 PA. Símbolos gratuitos
não contam. Um talento de outra árvore que concede dois símbolos continua
contando como uma compra naquela árvore; não produz dois conhecimentos grátis
na Teórica. A troca de uma compra duplicada por outro símbolo preserva uma
entrada paga, sem gerar PA ou uma segunda contagem.

| Categoria | Símbolos iniciais | Aprendizado gratuito ao abrir árvore |
| --- | --- | --- |
| Essências | Mana, Fogo, Água, Vento, Terra, Vida, Som, Luz, Espaço, Veneno | Mana: Magia Teórica Principiante; Fogo/Água/Vento/Terra: Principiante correspondente; Vida: Cura Principiante; Som: Bardo Principiante; Espaço: Invocação Intermediário; Veneno: Desintoxicação Intermediário. Luz fica disponível por 1 PA. |
| Operadores com contrato nesta revisão | Projetar, Expressar, Conter, Rejeitar, Expandir, Repetir, Filtrar, Encapsular, Dissipar | Projetar, Expressar e Conter: Teórica Principiante; Rejeitar custa 1 PA; Expandir: Intermediário. Os demais são compras que respeitam seus requisitos; ver os contratos. |
| Modificadores com contrato | Gatilho, Condição adicional, Autonomia | Gatilho: maestria Avançada; Condição adicional: símbolo de 1 PA; Autonomia: somente pelo talento Vigília Autônoma. A reserva inicial é dada pela forma Espiral. |
| Vocabulário em pesquisa | Criar, Mover, Comprimir, Atrair, Refletir, Dividir, Alvo, Alcance, Área, Duração, Direção e modos avançados de essências | Nomes de futuras compras. Precisam de entrada, saída, custos e limites próprios antes de serem usados; não são palavras abertas a qualquer efeito. |

Árvores futuras podem conceder símbolos novos. A ficha guarda o símbolo
**uma vez**, independentemente de quantas fontes o concederam. Perder uma fonte
não apaga um símbolo comprado; as concessões automáticas são calculadas a
partir dos ranks atuais da ficha.

## Formas: efeito numérico, não ornamento

Aplica-se **uma forma por célula**: o contorno externo governa a célula principal,
e cada subfórmula pode ter seu próprio contorno interno. Paga-se cada forma uma
vez; seus bônus não se propagam para outras células. As alterações abaixo são
parte do custo e respeitam os limites do rank.

| Forma | Mudança | Custo adicional |
| --- | --- | --- |
| Círculo | Forma neutra: fecha uma projeção instantânea; em efeitos sustentados, duração × 1,5 (arredondada para cima), respeitando o limite do material. | 0 PM |
| Triângulo | +1 dado de efeito; área cai um passo. | +2 PM |
| Quadrado | +50% dos PV de uma estrutura com Conter; uma fórmula sem PV não usa esta forma. | +1 PM |
| Linha | Alcance × 1,5; largura máxima de 1,5 m. | +1 PM |
| Espiral | Armazena até 2 PM por BR da potência da célula para liberação posterior. | +2 PM |
| Hexágono | Uma conexão adicional, desde que todos os ramos caibam no limite de símbolos. | +2 PM |
| Estrela | Divide a mesma saída entre até três alvos; dados e PM **não** são triplicados. | +2 PM |

"Um passo de área" usa a medida distinta imediatamente menor: 18 → 12 → 9 →
6 → 3 m → alvo único. Num cone, a abertura cai de 90° para 45°. O dado adicional
do triângulo não pode ultrapassar o teto de dados da potência. Um efeito sem
dados não ganha poder do triângulo.

## Material: desenhar é uma escolha de tempo

Os tempos abaixo são o **traçado base**; a seção de tempo de combate aplica
o piso de ativação por potência e as exceções para magias encapsuladas.
Preparar um desenho não o ativa: alguém ainda precisa pagar o PM e, se houver
gatilho, cumpri-lo. A duração do efeito começa na ativação. Uso único descreve
o consumo do suporte; não elimina a duração de uma saída sustentada.

| Meio | Traçado | Limite | Consequência |
| --- | --- | --- | --- |
| Gesto | 1 Ação | Até 2 símbolos em uma sobreposição; sem Gatilho nem Reserva. | Saída instantânea ou sustentada por até 1 turno; exige mãos livres. |
| Mana no ar | 2 Ações | Até 4 símbolos. | Dura no máximo 3 minutos; pode ser rompida por efeito que dissipe mana. |
| Giz | 1 minuto | Até o limite do rank. | Até 10 minutos; riscar uma linha rompe o circuito. |
| Tinta | 10 minutos | Até o limite do rank. | Até 1 hora; pode ser apagada ou coberta. |
| Pergaminho | 10 minutos antes da cena | Até o limite do rank. | Portátil e de uso único; efeito de até 10 minutos, ativação conforme o piso da potência. |
| Pedra gravada | 1 hora | Até o limite do rank. | Até 1 dia; suporte tem 20 PV × BR da maior potência inscrita. |
| Metal gravado | 1 dia | Até o limite do rank. | Até 30 dias; suporte tem 40 PV × BR da maior potência inscrita. |

Gesto **é** desenho: o jogador representa a sequência com movimentos de mãos.
Mana no ar é traçada visivelmente no espaço. Em giz, tinta, pergaminho, pedra
ou metal, o jogador pode desenhar o circuito no papel ou no editor e indicar o
material escolhido. O tempo de traço em cena pertence ao personagem; não exige
que o jogador desenhe por dez minutos reais.

O material estabelece um **teto de duração**, não uma duração automática.
Uma fórmula de 1 minuto continua durando 1 minuto quando traçada em giz;
o teto de 10 minutos apenas permite construir efeitos mais duradouros.
O bônus do Círculo também respeita esse teto: um efeito feito por gesto
continua limitado a 1 turno.

## Conta de PM e limites por rank — versão para teste

**Custo = essência + operadores + modificadores + camadas extras + forma +
potência.** Mana custa 1 PM; demais essências comuns, 2 PM. Projetar, Expressar,
Conter e Rejeitar custam 2 PM; Expandir e Repetir custam 3 PM. Filtrar e
Condição adicional custam 1 PM cada; Gatilho custa 2 PM e inclui uma condição
simples. Outros custos estão nos contratos. Sobrepor o primeiro operador ao núcleo não cobra
camada extra; cada símbolo seguinte acrescenta **1 PM pela sobreposição**.
Assim, um núcleo e um operador têm zero camadas extras; um núcleo e dois
operadores têm uma. Em fórmulas compostas, as ligações entre circuitos entram
nessa mesma contagem, sem cobrar duas vezes a mesma passagem. O nome muda
para representar o glifo sobreposto; a quantidade e o custo são os mesmos
das conexões extras da proposta anterior. Não há aumento genérico ilimitado de
área, alcance ou duração por +1 PM: é preciso usar uma forma ou um modificador
com contrato publicado. O custo da forma está na tabela acima.
**Material não reduz PM.**

Há dois valores explícitos na ficha da fórmula:

- **Construção (C):** rank necessário para comportar os componentes, a estrutura
  e o custo total. Não pode exceder o rank do construtor em Magia Teórica.
- **Potência (P):** intensidade de cada célula. Não pode exceder C e define seus
  dados, PV, alcance, BC e resistência a anulação. Um símbolo raro pode declarar
  potência mínima própria, além de exigir um rank de construção.

Uma fórmula complexa pode ter potência baixa: um teórico Avançado consegue
montar uma armadilha fraca com várias condições. O selo dessa armadilha
continua fraco. Cada célula paga o acréscimo de sua própria potência uma vez;
dois efeitos com núcleos diferentes pagam suas duas potências. O teto total
de PM e componentes é o de C. A oficina atual separa os dois valores para uma
célula; fórmulas com várias células ainda dependem da evolução do editor.

| Potência P | Acréscimo de PM | PV base de estrutura | Dados base da projeção | Alcance base |
| --- | ---: | ---: | --- | ---: |
| Principiante | +0 | 20 | 1d6 | 9 m |
| Intermediário | +2 | 40 | 2d6 | 18 m |
| Avançado | +4 | 60 | 3d6 | 27 m |
| Santo | +7 | 80 | 4d6 | 45 m |
| Rei | +11 | 100 | 5d6 | 90 m |
| Imperador | +16 | 120 | 6d6 | 150 m |

| Construção C | Símbolos máx. | Conexões máx. | Subfórmulas | PM máx. por circuito | Cobertura instalada com P = C | Dados máx. de uma saída com P = C |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Principiante | 2 | 1 | 0 | 6 | Alvo único ou 3 m | 2 |
| Intermediário | 4 | 3 | 0 | 10 | 6 m | 4 |
| Avançado | 6 | 5 | 1 | 16 | 12 m | 6 |
| Santo | 9 | 8 | 2 | 24 | 30 m | 8 |
| Rei | 13 | 12 | 3 | 40 | 150 m | 10 |
| Imperador | 18 | 17 | 5 | 60 | 750 m | 12 |

Esses tetos limitam o **desenho**, não a reserva pessoal de PM. PM de vários
alimentadores pode completar o mesmo circuito, um pagamento por vez, se o
circuito tiver uma reserva apropriada. O efeito só dispara quando atingir o custo.
Os valores grandes de cobertura nos ranks Rei e Imperador se destinam a
**instalações preparadas**, como redes de proteção, e não a uma rajada que
atinge uma cidade inteira. Para saídas diretas de dano, cura ou condição, a
proposta de raio máximo é 3 / 3 / 6 / 9 / 12 / 18 m por potência. Área maior
exige vários setores, cada qual com sua saída e seu pagamento; um disparo
não se replica entre setores. Estes limites ainda precisam de teste.

Gestos e mana no ar comportam no máximo **12 m de fronteira**, mesmo em potência
superior. Expandir não atravessa esse teto. Cobertura maior exige giz, tinta,
pergaminho ancorado, pedra ou metal preparado; o suporte precisa estar no lugar
da instalação. Isso preserva o valor da preparação e impede uma muralha de 750 m
de nascer de um gesto em combate.

Cobertura e teto de dados consultam a linha da **potência da célula**, mesmo
quando a construção é superior. Para uma fronteira simples, a cobertura é a
maior dimensão de uma parede plana ou o diâmetro de um contorno fechado; a
orientação e os lados são registrados. Sem Projetar, a origem fica ao toque;
com Projetar, pode ser posicionada no alcance da célula. Uma fronteira nasce
em espaço livre: não corta, esmaga ou desloca criaturas ao aparecer. Se o local
escolhido estiver ocupado, a criação ali é inválida. Cobertura de uma rede é
sua extensão instalada; cada célula continua pagando pela própria fronteira.

Um personagem com Magia Teórica Principiante não cria um efeito Imperador
escrevendo `Fogo`; sua área, dados, conexões e PM permanecem os de Principiante.

O valor dos dados depende do efeito descrito no operador e no rank; o teto da
tabela não concede dados sozinho. A primeira versão jogável terá uma tabela de
saídas para cada par essência + operador, evitando que uma palavra vaga produza
qualquer resultado. Novos pares podem ser publicados sem alterar a gramática.

## Contrato dos componentes e criação da fórmula

Cada componente precisa declarar: **categoria, traço, fonte de aprendizado,
PA, PM, construção mínima, potência mínima, entrada aceita, saída produzida,
teste, duração, tags e incompatibilidades**. Uma combinação sem contrato de
saída não está pronta para uso em combate. O editor deve explicar a peça que
falta; uma palavra inventada durante a sessão não completa o catálogo.

| Operador proposto | PM / construção mínima | Contrato de uso |
| --- | --- | --- |
| Projetar | 2 / Principiante | Converte a essência em uma saída instantânea dirigida. Dano, cura ou sinal dependem de um modo publicado; o jogador não troca entre eles depois do disparo. |
| Expressar | 2 / Principiante | Produz uma manifestação sensorial sem dano, cura ou condição. Som pode soar como alarme audível até 18 m da célula; paredes e ruído continuam importando. Não imita voz, encantamento de Bardo ou comando mental. |
| Conter | 2 / Principiante | Produz uma fronteira física com PV. Exige declarar ponto fixo, orientação e lados cobertos. Não concede Selado nem Fluxo Interrompido. |
| Rejeitar | 2 / Principiante | Produz uma fronteira que compara a potência da magia que a atravessa. Mana abrange magia em geral; outra essência filtra somente efeitos com aquela essência declarada. Não cria PV físicos. |
| Expandir | 3 / Intermediário | Modifica uma saída válida. Antes de Projetar, abre um cone de 90° na origem, com comprimento igual à metade do alcance; depois de Projetar, abre uma esfera no destino, limitada ao raio de efeito direto da potência. Depois de Conter/Rejeitar, permite até o dobro da cobertura de referência, sem aumentar PV, potência ou duração. |
| Repetir | 3 / Intermediário | Última inscrição. Uma saída instantânea produz uma única repetição no início do próximo turno do mantenedor, com metade dos dados arredondada para cima. Sustentação ganha o dobro da duração, respeitando o material, sem recuperar PV. Nunca repete Repetir, gatilho, reembolso, transferência de PM ou outra repetição. |
| Filtrar | 1 / Intermediário | Isenta da fronteira até BR da potência identidades marcadas no preparo. A lista é explícita; "meus inimigos" e "quem mentir" não são sensores. Uma identidade omitida continua sujeita ao efeito. |
| Gatilho | 2 / Avançado | Uma ocorrência local e objetiva: toque no desenho, entrada na área ou quebra de uma estrutura indicada. A condição simples já está incluída nos 2 PM e em um componente. Exige suporte físico e carga pronta. |
| Condição adicional | 1 / Avançado | Acrescenta uma comparação objetiva à condição do gatilho, ligada por E; custa outro componente e sua camada extra. No máximo uma adicional no Avançado, duas do Santo em diante. Não lê intenções, identidade secreta nem lugares fora dos sensores. |
| Encapsular | 2 / Avançado | Instala uma magia pronta conhecida numa célula própria. Exige a compra e os ranks originais dessa magia, além de construção suficiente. As regras específicas estão na seção de interações. |
| Dissipar | 3 / Avançado | Uma saída instantânea contra uma célula ou efeito mágico visível a até 9 m. Potência igual ou inferior encerra o efeito; potência superior não é encerrada. Não reverte dano, cura, matéria mundana ou eventos já resolvidos. |

Os custos em PA dos operadores comuns seguem o vocabulário avulso de 1 PA;
Encapsular e Dissipar são candidatos a símbolos especializados de **2 PA**.
O preço não remove os requisitos de construção. Criar, Mover, Comprimir,
Atrair, Refletir, Dividir e símbolos de teleporte permanecem no catálogo de
pesquisa: seus nomes já aparecem na proposta, mas **não têm autorização de
efeito** até receberem contratos tão completos quanto os da tabela.

**Compatibilidade das essências.** Projetar com Mana/Fogo/Água/Vento/Terra/Som
tem, respectivamente, tipo arcano/ígneo/contundente/cortante/contundente/trovejante.
Vida usa um modo de restauração de PV de criatura viva e voluntária. Não remove
doença, veneno, maldição, mutilação ou morte. Espaço, Veneno e Luz precisam de
seus próprios modos; conhecer esses símbolos não concede teleporte, qualquer
veneno existente ou cegueira irrestrita.

Filtrar reconhece a marca consentida de uma criatura presente no preparo. A
isenção inclui essa criatura e o equipamento que carrega; não libera projéteis
destacados ou magias lançadas por ela. Abrir uma janela para uma saída ofensiva
exige contrato próprio. Aparência, disfarce ou amizade não substituem a marca.

**Estrutura simples.** Cada glifo tem um núcleo. Projetar com Conter ou
Rejeitar significa posicionar a fronteira à distância; Projetar vem primeiro.
Conter com Rejeitar forma duas camadas; a primeira inscrição é a camada externa.
Expandir sobre uma estrutura vem depois do operador que a cria. Repetir vem
por último. Outros pares de operadores centrais precisam de um contrato próprio.

**Estrutura composta.** Um segundo núcleo ocupa uma subfórmula, com seus
operadores sobrepostos a ele. As ligações entre células transportam apenas o
tipo declarado — energia, comando ou saída. O diagrama inicial é uma sequência
sem retorno: proíbem-se laços que recarreguem a própria entrada ou disparem a
si mesmos. O Hexágono autoriza uma ligação de comando adicional, dentro dos
tetos de componentes, subfórmulas e PM; não duplica energia nem resultados.

**Contagem.** Núcleos, operadores, gatilhos e condições são componentes. O
contorno e o material têm regras próprias, mas não gastam vagas de componente.
N componentes conectados sem ligações redundantes custam `máximo(0, N − 2)` PM
de camadas extras. Uma ligação adicional autorizada pelo Hexágono acrescenta
1 PM. Não se cobra a mesma conexão novamente por ela cruzar duas células.

Para acompanhar reservas, cada custo pertence a uma célula: essência, operadores,
forma e potência pertencem à própria saída; a camada de uma ligação pertence à
célula que recebe essa ligação. A primeira passagem núcleo → operador do circuito
é a única gratuita. Custos comuns de comando ficam na entrada principal. A soma
desse registro deve ser idêntica ao PM total, sem cobrar uma camada novamente.

### Procedimento de criação e ficha resultante

1. Escolher a finalidade e os símbolos efetivamente conhecidos. Uma receita
   autoral com símbolos já comprados não exige PA a cada combinação.
2. Montar o núcleo e suas inscrições, na ordem numerada. Se houver outro
   núcleo, abrir uma célula e declarar sua ligação com a primeira.
3. Escolher forma, suporte e potência de cada célula. Determinar a construção
   mínima pela maior exigência de componentes, subfórmulas, símbolos e PM total.
4. Somar componentes, camadas, formas e potências. Verificar todos os tetos
   antes de iniciar a preparação. Uma fórmula inválida não vira uma magia
   aleatória; o editor aponta o motivo.
5. Registrar alvos, orientação, filtros, condições e responsáveis. Parâmetros
   que poderão ser escolhidos na ativação precisam estar marcados desde agora.
6. Preparar o suporte, alimentar e resolver a ativação. Cada alteração futura
   exige revalidar o desenho, mesmo quando não aumenta o custo.

A ficha deve mostrar nome e desenho; versão da regra; construtor; C e P por
célula; componentes e fontes; PM detalhado; preparo e ativação; BC/CD;
alcance e área; dano/cura/PV; duração; condições; o que bloqueia e o que passa;
gatilhos e cargas; reserva empenhada; mantenedor; formas de interromper.
Uma fórmula salva continua vinculada à versão de regras usada em sua criação.

### Resolução, área e orçamento de efeito

Como referência inicial, uma projeção usa **BR da potência em d6**: 1d6 a 6d6.
Ataque dirigido usa `1d20 + BC` contra CA; área ofensiva usa resistência de
Agilidade contra `8 + BC`, metade do dano no sucesso. Uma condição só é aplicada
se a carta do componente a declarar, com seu teste próprio. Cura de alvo
voluntário não faz ataque. BC não é somado ao dano genérico nesta proposta.

Triângulo acrescenta um dado. Numa esfera, reduz o raio à medida distinta
imediatamente menor, conforme a seção de formas; num cone, reduz a abertura de 90° para 45°; num
alvo único, mantém um alvo. Estrela divide os dados inteiros entre até três
alvos escolhidos antes da rolagem; quem receber zero dados não recebe a saída.
Repetir usa metade dos dados efetivamente distribuídos, sem redistribuir a
parcela no segundo disparo. Dados adicionais e repetição contra o mesmo alvo
não podem ultrapassar o teto de `2 × BR` por ativação da célula.

A repetição verifica novamente alcance, trajeto e defesas no segundo momento;
se o alvo deixou de ser válido, aquela parcela se perde, sem novo alvo ou
reembolso. Distâncias modificadas são arredondadas para baixo até o múltiplo
de 1,5 m mais próximo; áreas válidas têm pelo menos 1,5 m. Metade de duração
é arredondada para baixo, com mínimo de 1 turno para um efeito sustentado.
Metade de dados é arredondada para cima, respeitando o teto de saída.

Uma área de cura divide uma reserva de dados entre seus beneficiários, como a
Estrela; não multiplica a cura pelo número de pessoas presentes. Para testar
área de dano, usar metade dos dados da saída dirigida, arredondada para cima,
antes de dividir ou repetir. Isso precisa de comparação com Fogo e Cura.

Modificadores de PV da mesma categoria são somados antes da aplicação:
Terra +50% e Quadrado +50% resultam em +100%, sem multiplicação sucessiva.
Esse é o teto proposto de reforço genérico. A oficina já soma os dois fatores
na célula simples; fórmulas com várias estruturas ainda precisam desse cálculo.

Duas saídas ofensivas independentes exigem células próprias, pagam seus custos
e respeitam o teto total. Escrever dois nomes para o mesmo efeito não dobra dano, cura,
condição ou reserva. A soma de células que atinjam o mesmo alvo na mesma
ativação também respeita `2 × maior BR de potência` em dados de saída.
Efeitos de contato sustentados têm orçamento por rodada e precisam aparecer
separadamente na ficha; não recebem repetição instantânea por cima.

Esse teto em d6 se aplica **somente às saídas autorais da Teórica**. Uma magia
pronta encapsulada preserva integralmente os dados e o tipo da própria carta.
Para não juntar várias cartas num disparo acelerado, cada ativação pode resolver
no máximo **uma magia encapsulada**; ela não divide essa ativação com outra saída
autoral de dano ou cura. Sensores, suportes e defesas podem acompanhá-la, com
seus custos e limites normais. Magias combinadas continuam sendo uma única carta
quando assim publicadas.

## Preparação, alimentação e tempo de combate

O tempo de traço e o tempo de ativação são campos diferentes. Para desenho
feito em combate, a injeção final já integra a conjuração: não se cobra uma
Ação extra além do tempo indicado. Um suporte preparado antes da cena paga
seu tempo de ativação quando for usado.

| Maior potência do circuito | Piso de ativação proposto |
| --- | ---: |
| Principiante / Intermediário | 1 Ação |
| Avançado / Santo | 2 Ações |
| Rei / Imperador | 3 Ações |

Gestos levam o maior entre 1 Ação e esse piso; mana no ar, o maior entre 2
Ações e esse piso. Em pergaminho ou instalação pronta, paga-se o piso.
Um talento que acelere o traçado não reduz o piso. Uma magia encapsulada
também respeita seu tempo normal original e eventuais requisitos de ritual.
Reações só existem em cartas que declarem explicitamente essa exceção.

Os símbolos ocupam o lugar do cântico nessa forma de conjuração: Recitação
Perfeita e reduções de Conjuração Silenciosa não se acumulam automaticamente
com gestos ou desenhos preparados. Quando o personagem lança uma magia pela
forma normal de sua escola, usa as regras daquela magia. As escolhas de
forma de conjuração não podem conceder dois descontos à mesma ação.

### Estados, duração e responsabilidade

Projetar e Dissipar resolvem instantaneamente. Expressar produz um sinal de
até 1 turno. Conter/Rejeitar têm duração base de **1 minuto (10 turnos)**;
Repetir e Círculo modificam esse tempo antes do teto do material. Uma magia
encapsulada conserva sua duração original. Duração de condição e PV temporários
precisa estar na carta; não é herdada automaticamente da vida útil do suporte.

| Estado | O que acontece |
| --- | --- |
| Rascunho | Desenho incompleto, sem PM. Pode ser corrigido; não produz efeito. |
| Preparada | Fórmula válida e íntegra, ainda sem pagamento. Um molde legível identifica sua versão e seus parâmetros. |
| Carregada | PM completo reservado, ou pagamento parcial aceito pela Espiral. Ainda não há dano, cura ou barreira. |
| Armada | Carga completa e gatilho aguardando seu evento. O sensor só observa a região e os eventos declarados. |
| Ativa | O efeito resolveu ou está sustentado. A duração começa agora, não quando o desenho foi feito. |
| Encerrada | Efeito terminou, foi dissipado ou perdeu suporte. Uma nova utilização exige nova carga; pergaminho de uso único foi consumido. |

O estado Carregada/Armada também tem prazo: no máximo o teto do material,
contado desde o primeiro depósito. Trocar o mantenedor ou completar a carga não
reinicia esse prazo. Ao expirar antes do uso, o circuito se encerra e os PM
guardados se perdem; uma retirada anterior segue a regra de reserva intacta.
O disparo inicia o relógio próprio do efeito. Um desenho descarregado pode
permanecer preparado enquanto continuar íntegro e legível.

O construtor escreve; o alimentador paga; o **mantenedor** assume a
sustentação na ativação, podendo ser uma pessoa sem Magia Teórica. Sem talento,
cada personagem mantém uma fórmula ou magia sustentada no total, contando
suas outras escolas. Duas fronteiras no mesmo circuito compartilham duração
e suporte, mas continuam custando seus componentes e saídas. Incapacitação
do mantenedor encerra seus efeitos sustentados pelas regras gerais.

Um gatilho armado ocupa uma manutenção, salvo Vigília Autônoma. O mantenedor
deve ficar dentro do alcance de manutenção registrado — o alcance base da
maior potência do circuito, sem o bônus de Linha. Trocar de mantenedor exige
encerrar e rearmar, salvo capacidade específica. O proprietário pode cancelar
um circuito sob sua manutenção com 1 Ação; cancelamento não aciona seu
gatilho de quebra, a menos que isso esteja escrito na condição.

### Reserva de PM e prevenção de ciclos

Uma Espiral guarda inicialmente **2 PM por BR de sua potência**. Ela pode
completar o pagamento posteriormente, mas não reduz o custo da fórmula.
O reservatório pode ser menor que o custo total: conserva a parcela permitida,
e o alimentador fornece a diferença de uma vez na ativação. Não precisa guardar
todo o custo antes desse momento; nunca acumula mais que sua capacidade.
Gatilhos exigem uma carga completa: o símbolo Gatilho mantém aquela única
carga até disparar, sem conceder a capacidade de recarga parcial da Espiral.

**PM guardado permanece empenhado ao doador.** Enquanto estiver no circuito,
reduz em igual quantidade o teto recuperável de PM desse doador. Descansar
não permite acumular depósitos ilimitados em novos desenhos. Ao consumir ou
perder a reserva, esse teto volta ao normal, mas os PM não voltam cheios.
Retirar uma reserva intacta antes do disparo custa 1 Ação e devolve somente
o saldo original aos seus doadores, sem ultrapassar o máximo de cada um.

Cada carga registra seus doadores e sua divisão. Um doador não precisa entender
o efeito, mas precisa decidir quantos PM fornece. PM excedente é recusado;
sem Espiral, pagamento incompleto não é retirado. Uma fórmula nunca recupera
mais PM do que tinha reservado, e nenhum talento multiplica energia transferida.
Fonte, Estagnação e outras regras da antiga Barreira não são propriedades
gratuitas de Conter ou Rejeitar.

Gatilhos têm **uma descarga por carga** e não retroagem: entrada ocorrida antes
de armar o circuito não conta. Para um mesmo construtor, no máximo uma descarga
automática ofensiva ou que imponha condição ocorre por rodada; os outros
circuitos aguardam um novo evento. Repetir consome a parcela de efeito já
reservada e não cria outra carga ou um novo gatilho. Redes não ganham turnos.
Instalações autônomas de personagem ainda registram um responsável e seus
limites. Se ele morrer, encerram-se ao fim da rodada; permanência após a morte
é uma futura capacidade específica ou propriedade de relíquia, sem concessão
automática pelo material Pedra/Metal ou pelo rank Imperador.

### Interromper, danificar e dissipar

- Desenhar sob ameaça usa a regra geral de Concentração. O pagamento em combate
  é comprometido ao iniciar; interrupção devolve a parcela prevista na regra
  geral, sem somar reembolso de reserva ao mesmo PM.
- Um risco que corta um traço essencial rompe o suporte. Em giz/tinta expostos,
  alguém adjacente gasta 1 Ação para apagá-lo; um oponente protegendo a superfície
  exige primeiro acesso físico. Água suficiente apaga giz e tinta não protegida.
- Pedra e metal precisam ter o trecho gravado danificado; sua integridade é a
  de um objeto separado. Os valores iniciais de 20/40 PV por potência são
  candidatos para esse objeto, nunca PV extras da barreira que ele projeta.
- Romper uma célula encerra sua saída e as células que dependam dela. Romper a
  entrada principal encerra o circuito inteiro. Um alarme ligado à quebra de
  uma barreira requer que sua própria célula e sua carga sobrevivam à quebra.
- Dissipar compara a potência do efeito atingido, não o rank de construção
  nem o rank atual do alimentador. Apagar o desenho também pode funcionar
  contra uma potência alta, se for possível alcançar seu suporte.
- Uma rejeição ou dissipação não desfaz dano já causado, cura já recebida ou
  um objeto mundano. Uma criação mágica que declare duração ainda é efeito
  mágico até essa duração terminar.

## Barreira agora é uma fórmula

Conter e Rejeitar formam o **ramo defensivo da árvore Magia Teórica**.
As antigas barreiras viram modelos que ensinam composições desse ramo; o
jogador avança na mesma árvore para criar projéteis, selos, gatilhos e
barreiras. Não há uma segunda árvore de Barreira a abrir ou evoluir.

`Mana → Conter` dentro de um quadrado cria uma superfície física. Por 4 PM
(Mana 1 + Conter 2 + Quadrado 1), uma versão Principiante tem **20 PV** de base,
cobre até 3 m e dura até 1 minuto em mana no ar. O quadrado aumenta seus PV
para **30**. Criaturas podem quebrá-la atacando a superfície. Ela não cancela
magia.

`Mana → Rejeitar` dentro de um círculo cria uma proteção contra magia por
**3 PM**, até 3 m por até 15 turnos (1 minuto × 1,5).
Efeitos de rank igual ou inferior ao da fórmula que cruzem o contorno são
barrados; um rank acima passa com metade dos dados, área e duração; dois ou
mais acima passam inteiros. Um efeito sem dados, área ou duração reduzível
passa inteiro quando estiver um rank acima; não existe "metade de teleporte".
Técnicas de Touki e ataques físicos atravessam.

No Intermediário, `Mana → Conter → Rejeitar` em círculo custa **8 PM** (Mana 1 +
Conter 2 + Rejeitar 2 + camada extra 1 + potência Intermediário 2). Ela segura corpo e magia, mas consome dois operadores
e não cabe em gesto. `+ Filtrar` custa mais símbolo, camada e PM: o construtor
nomeia quem atravessa. Isso substitui a antiga proteção que fazia tudo de uma
vez desde Principiante.

Uma única essência pode formar sua defesa nos ranks iniciais. Combinar
**dois núcleos diferentes** numa defesa exige a estrutura do Avançado:
`Mana → Conter` pode abrigar uma subfórmula `Fogo → Projetar`, criando uma
barreira incandescente com custo, saída e teto próprios para cada trecho.
`Som → Expressar` com gatilho pode tocar um alarme. `Vida → Conter` protege
uma criatura e concede PV temporários, sem restaurar PV reais. Conhecer o símbolo não concede uma
magia pronta da árvore de origem.

### A segunda lição visual: a mesma barreira ganha uma subfórmula

Um teórico **Avançado** prepara em giz um quadrado `Mana → Conter` e desenha
dentro dele um círculo `Som → Expressar → Gatilho`. O gatilho está ligado à
quebra do quadrado. Quando a parede cai, o círculo toca um alarme na área.

**Decomposição para aprender a desenhar:**

| Parte | Como aparece no desenho | Leitura |
| --- | --- | --- |
| Quadrado externo | Mana com os traços de Conter sobrepostos no centro. | Estrutura de 60 PV, até 6 m. |
| Círculo interno | Som com Expressar inscrito sobre ele; marca de Gatilho junto ao glifo. | Toca o alarme quando a estrutura chega a 0 PV. |
| Ligação entre circuitos | Um traço liga a saída da parede ao gatilho da subfórmula. | A queda da estrutura projetada aciona o alarme; o desenho e a entrada de PM precisam permanecer íntegros. |

Essa ligação entre duas subfórmulas não substitui a sobreposição dos
operadores em cada núcleo. A legenda decompõe as peças; o desenho conserva
os glifos compostos.

São **5 símbolos, 4 conexões e 1 subfórmula**, dentro do limite Avançado.
Escolhendo potência Intermediária para a parede e Principiante para o alarme,
o custo é **15 PM**: essências 3, operadores 4, Gatilho 2, Quadrado 1,
camadas extras 3 e potências 2 + 0. A construção Avançada aceita 6 componentes
e 16 PM; o exemplo usa 5 componentes. O giz leva 1 minuto
para traçar. A barreira deste exemplo dura 1 minuto após a ativação, dentro
do teto de 10 minutos permitido pelo giz. Alguém
que não compreende Som pode injetar os 15 PM no circuito pronto. A fórmula
simples da primeira lição continua sendo o núcleo desta construção.
Se preparada antes, a ativação custa 1 Ação, pelo piso da maior potência.
Os 15 PM são pagos uma única vez: 6 PM resolvem a parede e 9 PM ficam empenhados
na célula do alarme, incluindo Gatilho e as três camadas extras. Seu sensor fica
armado enquanto a parede durar. Perder os PV da
parede não apaga o giz; apagar a entrada de giz encerra as duas células.

## Progressão da árvore Magia Teórica

### Entrada, compras e maestrias

A abertura obedece ao custo por ordem de árvores do Capítulo 1. Depois dela,
usa-se a tabela normal de Magia. **BR** é o bônus numérico do patamar, de 1 no
Principiante a 6 no Imperador; quando associado a uma saída, usa a potência
daquela célula. Uma referência ao BR do personagem usa seu rank real na Teórica.

| Rank | Conhecimentos pagos exigidos | Abrir rank | Magia comum | Assinatura ◆ | Talento |
| --- | ---: | ---: | ---: | ---: | ---: |
| Principiante | 0 | Pela ordem de abertura | 1 PA | 2 PA | 1 PA |
| Intermediário | 3 | 1 PA | 1 PA | 2 PA | 1 PA |
| Avançado | 6 | 2 PA | 2 PA | 3 PA | 2 PA |
| Santo | 9 | 2 PA | 3 PA | 4 PA | 3 PA |
| Rei | 12 | 3 PA | 4 PA | 5 PA | 4 PA |
| Imperador | 15 | 3 PA | 5 PA | 6 PA | 4 PA |
| Deus | Narrativa | Narrativa | — | — | — |

As maestrias abaixo são gratuitas ao abrir o rank. Elas ensinam a estrutura
e aumentam capacidade, mas não entregam todos os talentos daquele patamar.
Símbolos concedidos por elas não contam entre os conhecimentos pagos.

| Rank | Maestria da árvore atual | O que recebe |
| --- | --- | --- |
| Principiante | **Alfabeto Arcano** | Mana, Projetar, Expressar e Conter; Círculo, Quadrado e Linha. Pode ler e criar glifos simples de 2 componentes. Rejeitar pode ser comprado por 1 PA. |
| Intermediário | **Sintaxe e Cópia** | Expandir e Triângulo; até 4 componentes por célula e cópia fiel de um molde. Repetir e Filtrar são compras. |
| Avançado | **Circuito Composto** | Estrela, Ramificar e Gatilho; até 6 componentes por célula, duas células ligadas e acesso às Magias Combinadas com os demais requisitos. |
| Santo | **Inscrição Durável** | Espiral e gravação em pedra; até 9 componentes por célula e três células ligadas. A reserva de PM permanece empenhada. |
| Rei | **Rede de Selos** | Até 13 componentes por célula e quatro células ligadas. Cada disparo automático consome carga registrada. |
| Imperador | **Arquitetura Arcana** | Até 18 componentes por célula e seis células ligadas. Cada trecho conserva custo, duração e potência próprios. |
| Deus | **Nova Lei** | Efeito de campanha e narrativa, sem compra normal de PA. Não entra no calculador comum. |

Formas compradas contam como um conhecimento pago da Teórica. Um personagem
pode subir sem comprar magias modelo, usando símbolos, geometrias e talentos.
Isso precisa ser comparado no playtest com a progressão das outras escolas:
um catálogo enorme de símbolos de 1 PA não deve tornar a subida automática.

### Talentos candidatos para futuras revisões — cada compra deve mudar uma regra concreta

A lista abaixo é uma bancada de ideias; **as compras disponíveis na ficha são
as cartas da árvore atual**, não necessariamente estes nomes e valores.

Todos exigem o rank indicado em Magia Teórica, salvo requisito adicional escrito.
Benefícios de construção são registrados no diagrama. Benefícios pessoais
dependem do personagem estar presente. Nenhuma maestria posterior deve tornar
uma dessas compras inútil; se isso acontecer na revisão, a compra será refeita.

| Rank / PA | Talento | Regra candidata e limite |
| --- | --- | --- |
| Principiante / 1 | **Reserva do Analista** | +2 PM máximos por rank real na Teórica. Sem PV adicional. Segue a aplicação de reservas da ficha. |
| Principiante / 1 | **Mão de Giz** | Preparo em giz cai de 1 minuto para 30 segundos. Não reduz o piso de ativação nem a vulnerabilidade do traço. |
| Principiante / 1 | **Leitura de Margem** | Em 1 Ação, a até 9 m e vendo o traço, identifica essência, forma e potência de uma célula cujos símbolos conheça. Sem o talento, essa análise exige 1 minuto. Não revela símbolo desconhecido, senha ou intenção. |
| Intermediário / 1 | **Traço Fluente** | Um glifo de até 2 componentes em mana no ar pode ser traçado em 1 Ação por +1 PM, respeitando o piso da potência. Não acelera suporte físico nem a magia encapsulada. |
| Intermediário / 1 | **Catálogo Memorizado** | Guarda até BR do personagem moldes exatos e pode copiá-los sem consultar um suporte. Trocar um molde exige 1 hora de estudo. Não concede seus símbolos. |
| Intermediário / 1 | **Margem de Correção** | Uma vez por preparação fora de combate, trocar um componente antes de carregar custa metade do tempo normal do material. Recalcula todos os requisitos e custos; não preserva carga nem permite editar um efeito ativo. |
| Avançado / 2 | **Afinidade Aplicada** | Permite inscrever em uma fórmula um único talento compatível de outra árvore que o construtor realmente possua. Custa +1 PM na fórmula e exige a compatibilidade expressa descrita adiante. Não importa maestria completa. |
| Avançado / 2 | **Reserva Separada** | A Espiral guarda 3 PM por BR de sua potência, em vez de 2. O acréscimo continua empenhado aos doadores e não aumenta os PM que a saída pode gastar. |
| Avançado / 2 | **Chaves Compartilhadas** | Filtrar pode registrar duas identidades a mais. Não faz leitura mental e não troca a lista gratuitamente durante o efeito. |
| Santo / 3 | **Sustentação Dupla** | Pode manter dois efeitos sustentados no total, somando todas as suas escolas. Um teste de Concentração vale para os dois; se falhar, ambos terminam. Não soma com outro talento que já permita manter dois. |
| Santo / 3 | **Vigília Autônoma** | Acrescenta uma inscrição de Autonomia e +3 PM a um suporte físico, permitindo manutenção sem pessoa presente. No máximo BR do construtor circuitos autônomos armados/ativos, incluindo os de outros suportes; cada conjunto conectado conta pelo circuito principal. Segue a duração, as cargas e o limite de descargas por rodada. |
| Santo / 3 | **Isolamento de Falhas** | Por +1 PM, designa uma subfórmula com carga própria. Se a entrada principal romper, ela sobrevive até o fim do próximo turno para executar sua única saída prevista. Não recarrega nem preserva as demais células. |
| Rei / 4 | **Nó de Comando** | O mantenedor pode transferir um circuito ativo a outra criatura voluntária: ambos tocam seu ponto de comando e gastam 1 Ação. O novo mantenedor precisa de uma vaga livre; BC, carga, duração e PV não mudam. |
| Rei / 4 | **Geometria Seletiva** | Por +2 PM, uma saída em área pode excluir até BR da potência quadrados de 1,5 m declarados antes da rolagem. Não aumenta a área nem acompanha criaturas que saiam desses quadrados. |
| Imperador / 4 | **Revisão de Campo** | Em 3 Ações e por 3 PM, altera um parâmetro previamente editável de uma fórmula própria ativa ao tocar seu ponto de comando. Não troca núcleo, operadores, potência ou proprietário; não reinicia duração/PV nem cria nova ativação. |
| Imperador / 4 | **Coautoria** | Até três teóricos podem assinar um projeto, cada qual conhecendo integralmente as células que desenha. Cada célula usa BC e limites de seu autor; o coordenador precisa comportar o conjunto em seu C. Os talentos dos autores não são somados numa mesma célula e a rede tem um único limite de descargas. |

Benefícios que mexem em PM, tempo ou quantidade de saídas são prioridades de
teste. Reduções de custo nunca baixam uma ativação efetiva para 0 PM. A reserva
do personagem, o PM guardado no objeto e o PM consumido pela magia são campos
distintos; um bônus em um deles não se aplica aos três.

### Magias da árvore e fórmulas modelo

Receitas de ensino, como Mana + Conter + Quadrado, podem ser públicas e gratuitas.
Criar variações com símbolos conhecidos não custa PA por desenho. Uma carta
comprável precisa ensinar um **procedimento especial** além da receita: uma
reação, uma forma de revisão ou uma exceção controlada. Sua compra autoriza
executar aquele modelo exato no rank apropriado, sem conceder todos os seus
símbolos para outras fórmulas. Copiar moldes desconhecidos em geral continua
sendo a capacidade do Intermediário.

| Rank / PA | Assinatura candidata | Procedimento especial proposto |
| --- | --- | --- |
| Principiante / 2 | **Parede de Emergência ◆** | Modelo de Mana + Conter + Quadrado, potência Principiante. Por 6 PM e uma Reação, interpõe uma parede de 15 PV diante de um ataque físico contra você ou um alvo visível a até 3 m. Dura até o início do seu próximo turno. Os 2 PM adicionais e metade dos PV pagam a reação; não bloqueia magia. |
| Intermediário / 2 | **Porta Seletiva ◆** | Modelo Mana + Conter + Filtrar + Círculo, potência Intermediária: 7 PM, 3 componentes e 40 PV. Criaturas marcadas atravessam a parede sem danificá-la; equipamento carregado acompanha, projéteis destacados não. Uma vez durante a duração, troca uma identidade do filtro por 1 Ação e +1 PM. Continua limitada a duas identidades, salvo talento que aumente Filtrar. |
| Avançado / 3 | **Reescrita Segura ◆** | Em 2 Ações e por 2 PM, troca uma inscrição ou forma de um circuito próprio preparado, descarregado e acessível ao toque. Deve conhecer a peça nova e revalidar todo o conjunto. Não funciona em um diagrama desconhecido nem evita pagar a nova ativação. |
| Santo / 4 | **Desvio de Contingência ◆** | Ao preparar, paga +2 PM para escrever duas saídas alternativas subordinadas ao mesmo gatilho. Componentes e cargas das duas contam integralmente; um evento objetivo declarado escolhe exatamente uma. Não escolhe depois de ver o dano ou a falha de um teste. A saída não usada não dispara. |
| Rei / 5 | **Comando de Rede ◆** | Por 2 PM e 1 Ação, ao tocar o ponto de comando, suspende ou retoma as células escolhidas de uma instalação própria dentro de sua cobertura. O relógio de duração continua e não há restituição de cargas, PV ou disparos. |
| Imperador / 6 | **Substituição Estrutural ◆** | Por 4 PM e 3 Ações, transfere um circuito próprio para uma cópia idêntica já preparada, visível e a até 30 m. O original se apaga. Conserva cargas, alvos já definidos, PV restantes e duração restante; a cópia não é uma segunda ativação. O novo local precisa aceitar a fórmula sem sobrepor criaturas ou atravessar outra defesa. |

As cartas acima ainda precisam de texto final e testes. A árvore também deve
ter magias comuns de análise e reparo, vendidas pela tabela do rank, sem cobrar
novamente por uma capacidade já fornecida por sua maestria. Uma assinatura
não remove pré-requisitos de magias de outras escolas encapsuladas nela.

## Interações com outras árvores e magias

Toda saída deve carregar **origem, essência, tipo de dano, potência, autor e
modo de resolução**. Tipo de dano e escola são campos diferentes: dano ígneo
de uma fórmula não a torna automaticamente uma magia comprada da árvore Fogo.
Isso permite aplicar resistência ígnea normalmente sem importar toda a maestria
de Fogo por acidente.

### Três formas de colaboração entre escolas

1. **Vocabulário:** a escola concede a essência. A Teórica constrói com seus
   próprios números e custos; não precisa do rank da escola elemental para
   aumentar sua própria potência, mas não recebe os efeitos exclusivos dela.
2. **Afinidade Aplicada:** exige o talento da Teórica e a compra real do talento
   externo. A fórmula registra uma única interação aprovada do catálogo de
   compatibilidade; texto genérico como "suas magias" não autoriza importar
   qualquer passiva. O alimentador não acrescenta seus próprios talentos.
3. **Magia encapsulada:** preserva uma magia realmente conhecida, seus ranks
   de acesso, seu custo de PM, testes, condições e tempo mínimo de execução.
   A Teórica acrescenta suporte, filtro ou gatilho, pagando a estrutura externa.

Na encapsulação, a magia ocupa uma célula, mas sua complexidade reservada é de
`1 + BR de seu rank` componentes, além de Encapsular e dos demais modificadores.
Seu custo de PM substitui essência, operadores e potência internos já contidos
na carta. A embalagem paga seus próprios componentes, camadas e potência, se
produzir um efeito próprio. Assim não se duplica a taxa de potência da magia,
nem se esconde uma magia Imperador dentro de uma célula de dois componentes.

Uma magia encapsulada usa **Círculo neutro, sem bônus de duração** para o seu
conteúdo: dados, alvos, alcance, área e duração continuam os da carta original.
Expandir, Triângulo, Estrela e Repetir não alteram essa carta por padrão. Filtro,
gatilho e transporte do suporte modificam sua entrega, sem conceder uma segunda
magia, ignorar linha de efeito ou retirar um custo contínuo. Uma exceção futura
precisa nomear a magia e a transformação permitida.

O autor precisa possuir a magia e os ranks originais; sem Coautoria, o mesmo
construtor satisfaz todos esses requisitos. O efeito encapsulado conserva o
BC da escola de origem, registrado no preparo, enquanto a embalagem usa o
BC da Teórica. Uma saída nunca soma os dois. A ficha declara o rank próprio
do efeito; para o playtest de uma Magia Combinada sem rank explícito, usa-se
o maior rank entre seus requisitos até a carta receber esse campo.

Nesta versão, Encapsular aceita somente magias que utilizem PM. Técnicas de
Touki e habilidades que gastem PP não podem ser convertidas em PM por desenho.
Uma árvore de Utilidade ainda pode conceder um símbolo como Som; suas
habilidades próprias continuam obedecendo ao recurso e à forma de uso originais.
Invocações encapsuladas respeitam o número de criaturas, o pacto e a manutenção
da escola de origem; Repetir não duplica pactos ou criaturas.

**Primeira compatibilidade jogável candidata:** Corte Fino, de Vento
Intermediário, pode ser inscrito por Afinidade Aplicada numa saída autoral
`Vento + Projetar` do construtor que comprou o talento. Contra criatura sem
armadura, acrescenta **1d6 cortante** àquela saída e conta esse dado nos tetos
da Teórica. Exemplo de construção Avançada e potência Intermediária: Vento 2 +
Projetar 2 + potência 2 + Afinidade 1 = **7 PM**, 2d6 normalmente ou 3d6 contra
o alvo sem armadura. O personagem precisa conhecer Vento, Corte Fino, Teórica
Avançada e Afinidade Aplicada. O BC da escola de Vento não é somado ao da célula.

**Compatibilidade futura:** Pavio Curto, de Fogo, pode ser inscrito
por Afinidade Aplicada em uma saída ígnea que já aplique Em Chamas por um
componente autorizado. Acrescenta os +2 previstos no talento contra alvo já
Em Chamas, uma vez por saída; não concede Em Chamas, não soma BC e não recebe
uma aplicação adicional só porque há duas essências. O catálogo atual ainda
não contém um componente autoral que aplique Em Chamas, então esta combinação
não pode ser usada como saída autoral por enquanto. Outras compatibilidades
precisam de entrada explícita antes de valerem em mesa.

| Encontro de regras | Resolução proposta |
| --- | --- |
| Fogo conhecido por 1 PA | Pode alimentar fórmulas da Teórica com essa essência. Não concede Chama Viva, Pavio Curto, Bola de Fogo nem imunidade ígnea. |
| Personagem com resistência/imunidade pessoal | Sua defesa pessoal continua funcionando. Ela não é copiada para a barreira, o pergaminho, o alimentador ou os alvos. |
| Dano ígneo em alvo Molhado | Aplica a condição publicada: dano normal, consome Molhado e não aplica Em Chamas nesse impacto. A fórmula não ignora a regra por ser desenhada. |
| Frio em alvo Molhado | Segue a vulnerabilidade publicada. A desvantagem no teste contra o mesmo conjurador que molhou compara o autor da célula, registrado na fórmula; o doador de PM não assume a autoria. |
| Água e Fogo no mesmo circuito | Resolvem na ordem numerada. Molhar e depois queimar pode consumir Molhado; inverter pode apagar Em Chamas. Ter duas essências não gera vapor, explosão ou dano extra sem um modo publicado. |
| Fogo e Vento / Água e Terra | Convivem como células com resultados próprios. Não produzem automaticamente furacão, lama incapacitante ou multiplicador de dano. Uma fusão precisa de contrato ou magia combinada conhecida. |
| Som e Bardo | Sinal sonoro não concede charme, medo, comando, bônus de desempenho ou maestria social. Surdo só pode ser imposto por componente que o declare e cobre seu efeito de controle. |
| Vida e Cura | Restauração básica e PV temporários usam seus contratos separados. Retorno da morte, remover maldição e regenerar membro exigem capacidades específicas de Cura. PV temporários não se acumulam. |
| Veneno e Desintoxicação | Reconhecer ou filtrar uma toxina não equivale a criar todas as toxinas nem a purgar qualquer condição. Rank e tipo de toxina precisam estar declarados. |
| Espaço e Invocação | Um símbolo de Espaço reconhece relações espaciais previstas em seus modos. Teleporte, pactos e criaturas invocadas continuam exigindo suas capacidades originais, custos e limites. Um portal sem destino válido não dispara. |
| Magia Combinada comprada | Continua exigindo as duas portas e sua compra. A fórmula pode acomodá-la, mas não reproduzir gratuitamente sua carta só por conhecer duas essências. Barreira Incandescente precisará ter seu requisito antigo convertido para Teórica. |
| Touki ou ataque mundano cruzando Rejeitar | Atravessa. Rejeitar trata magia; defesa física exige Conter e recebe dano nos PV. Um ataque que tenha parcelas física e mágica registra as duas e resolve cada proteção somente sobre sua parcela. |
| Arma encantada cruzando Rejeitar | A arma física não desaparece. Um efeito mágico transmitido pelo impacto só é barrado se efetivamente cruzar a fronteira e estiver dentro da regra de potência. O selo não dissolve o item nem seus bônus pessoais à distância. |
| Duas barreiras de Rejeitar sobrepostas | Usa a rejeição mais forte aplicável uma vez por efeito. Não corta uma magia sucessivamente pela metade atravessando círculos iguais. Fronteiras de Conter continuam sendo obstáculos físicos com PV distintos. |
| Magia lançada dentro de Rejeitar | Conjura normalmente se não cruzar a fronteira. Impedir conjuração dentro de uma área é um futuro operador Selar, de no mínimo Santo, com custo e contrato próprios. |
| Magia nascendo além da barreira | Rejeitar não barra um trajeto que não existe. A magia precisa respeitar linha de visão/efeito e alcance próprios; teleporte usa suas restrições específicas de destino. |
| Dissipação em fórmula composta | Atingir uma célula compara sua potência. Atingir a entrada que sustenta o todo compara a maior potência das células dependentes; sucesso encerra a cadeia, salvo Isolamento de Falhas. |
| Concentração, Surdo, silêncio e mãos presas | Fórmula gestual exige mãos; desenho exige acesso e traço. Fórmula sem voz não é interrompida apenas por silêncio. Se Surdo no livro proíbe certas formas verbais, isso não concede nem retira capacidade gestual além do que a própria fórmula exige. |

Na Régua do Selo, um rank acima atravessa com metade dos dados, área e duração,
com o arredondamento definido na carta. Efeitos indivisíveis, como mudança de
local ou uma condição binária sem duração fracionável, atravessam inteiros
quando a regra não tem número que possa reduzir. Um efeito barrado perde o PM
e o tempo já pagos; Rejeitar não reembolsa quem o lançou.

Conter cobre apenas os lados e a superfície desenhados. Um ataque físico que
acerte a fronteira resolve seu dano nos PV dela; se a destruir, aquele ataque
foi consumido, e ataques seguintes podem passar. Uma área não causa o mesmo
dano integral à barreira e à criatura que estava protegida atrás dela pelo
mesmo trajeto. Ela ainda atinge pontos que tenha caminho legítimo para alcançar.

Para o teste de mesa, uma estrutura de Conter tem **CA 10 + BR da potência**,
não recebe condições de criatura e não é curada por Vida. Ataques usam as regras
normais de acerto; áreas com trajeto físico válido causam seu dano à estrutura,
sem teste de resistência dela. Dissipação e magia que atravesse Conter seguem
suas próprias regras. Não há resistência ou imunidade gratuita por ela parecer
feita de fogo, terra ou mana; uma carta precisa concedê-la expressamente.

### Modos de contato candidatos

Estes efeitos são parte de Conter com a essência indicada, além dos PV da
fronteira. Uma criatura conta no máximo uma vez por rodada, mesmo tocando várias
partes da mesma saída. O alvo precisa tocar a superfície ou atingi-la com o
próprio corpo; acertar com arma não transmite o efeito ao portador.

| Essência + Conter | Efeito proposto e limite |
| --- | --- |
| Mana | Apenas a fronteira física. |
| Terra | +50% dos PV base, somado ao bônus de Quadrado; sem condição adicional. |
| Fogo | Metade dos dados base da potência, arredondada para cima, como dano ígneo; Agilidade contra 8 + BC para metade. Não aplica Em Chamas. |
| Água | Aplica Molhado até o fim do próximo turno da criatura. Contato voluntário dispensa teste; contato imposto permite Agilidade contra 8 + BC para evitar a condição. |
| Vento | Força contra 8 + BC; falha empurra 1,5 m para o lado exterior declarado. Não atravessa outro obstáculo nem acrescenta dano de colisão. |
| Som | Emite o sinal de Expressar, perceptível até 18 m; não aplica Surdo. Um alarme que só aconteça sob uma condição diferente ainda exige Gatilho. |
| Vida | Na ativação, um beneficiário voluntário ao toque recebe BR da potência em PV temporários por 1 minuto, limitado à duração da fronteira. Não acumula, não restaura PV reais e não se repete por contato. |

Projetar + Conter posiciona essa mesma fronteira e não acrescenta uma segunda
rajada de dano. Repetir prolonga a estrutura, sem dobrar os efeitos de contato.
Para uma saída ofensiva adicional, é preciso outra célula e seu custo próprio.

**Diferença para a versão anterior do protótipo.** A oficina já apresenta os
limites, testes e durações de contato da célula simples; Som foi ajustado para
produzir um sinal sem Surdo gratuito. Os contratos precisam permanecer visíveis
nas cartas de essência para o jogador saber o que está comprando.

## Sugestão para a futura árvore: Rudimento Arcano

**Proposta ainda não aplicada ao protótipo nem concedida às fichas.** Uma
árvore mágica pode ensinar uma primeira frase fixa: **Círculo + Projetar
sobre uma essência que essa própria árvore concedeu**. Isso permite ao mago
experimentar a escrita arcana antes de abrir Magia Teórica.

O Rudimento custa **1 PM e 1 Ação**, alcança **1,5 m** e produz uma manifestação
**instantânea e sensorial**: uma centelha visível de Fogo, um respingo de Água,
um sopro de Vento ou uma nota de Som. Não causa dano, cura, condição,
deslocamento, bloqueio ou cobertura, nem deixa uma estrutura ou gatilho. Seu
efeito não cresce com o rank e não aceita outros operadores ou formas.

O **Círculo já é uma forma neutra no protótipo**: em uma projeção instantânea
fecha o desenho sem acrescentar duração; em efeitos sustentados aplica
duração × 1,5 respeitando o material. Isso permite, por exemplo, que um
teórico Principiante faça **Fogo + Projetar + Círculo por 4 PM, causando 1d6
de dano ígneo**. Essa projeção de combate pertence à Magia Teórica e segue
o custo completo de seus componentes. O Rudimento de 1 PM continua apenas
uma sugestão de manifestação sensorial para outros magos, ainda não aplicada.

Comprar um símbolo avulso por 1 PA não concede um novo Rudimento: a essência
precisa vir de uma árvore que o personagem abriu. Para combinar símbolos
comprados, criar uma fórmula de combate ou alterar essa frase fixa, ele
precisa da árvore Magia Teórica. A exceção ensina o primeiro gesto e preserva
a construção de fórmulas como a especialidade da Teórica.

## Casos de mesa e critérios de validação

Os exemplos abaixo são **da proposta v5**, não uma afirmação de que o editor
atual já execute todos eles. Valores de efeito e custo precisam ser revisados
em conjunto quando um componente mudar.

| Fórmula | C / P | Conta e resultado esperado |
| --- | --- | --- |
| Mana + Conter + Quadrado | Principiante / Principiante | 1 + 2 + 1 = **4 PM**, 2 componentes, 30 PV. Só proteção física; não recebe Selado gratuitamente. |
| Fogo + Projetar + Círculo | Principiante / Principiante | 2 + 2 = **4 PM**, 2 componentes, 1d6 ígneo, alcance base 9 m. Não recebe Em Chamas nem a maestria de Fogo. |
| Mana + Conter + Rejeitar + Círculo | Intermediário / Intermediário | 1 + 2 + 2 + 1 camada + 2 potência = **8 PM**, 3 componentes, 40 PV. O bloqueio mágico compara potência Intermediária. |
| A anterior + Filtrar | Intermediário / Intermediário | 1 + 2 + 2 + 1 filtro + 2 camadas + 2 potência = **10 PM**, 4 componentes. Cabe exatamente; registra até duas identidades. |
| Fogo + Projetar + Repetir + Círculo | Intermediário / Principiante | 2 + 2 + 3 + 1 camada = **8 PM**, 3 componentes. 1d6 agora e 1d6 no turno seguinte; a repetição não cria outra repetição. |
| Fogo + Projetar + Expandir + Círculo | Intermediário / Intermediário | 2 + 2 + 3 + 1 camada + 2 potência = **10 PM**, 3 componentes. A área proposta chega a 3 m de raio; 2d6 dirigidos viram 1d6 em área antes do teste de resistência. Inverter Expandir/Projetar produz cone de 9 m na origem. |
| Parede com alarme de quebra | Avançado / Intermediário e Principiante | O exemplo de duas células soma **15 PM**, 5 componentes e 1 subfórmula. A parede tem 60 PV; o alarme é sensorial e precisa sobreviver à queda da estrutura. |
| Duas células Fogo + Projetar ligadas | Avançado / Principiante em ambas | 4 + 4 + 2 camadas = **10 PM**, 4 componentes e 1 subfórmula. Duas saídas de 1d6 somam 2d6, atingindo o teto comum desse disparo contra um alvo. |

### Situações que precisam de resposta antes de publicar

1. **Músico sem Bardo:** compra `Som` por 1 PA, combina com Expressar na Magia
   Teórica, e constrói uma saída sonora simples. Não recebe maestria de Bardo.
2. **Bardo:** abrir Bardo Principiante concede `Som` automaticamente. Se já
   havia comprado o símbolo, transfere a compra para outro símbolo comum.
3. **Pesquisador e reservatório:** o pesquisador desenha uma fórmula de 12 PM
   que sua própria reserva não paga. Outra pessoa injeta os 12 PM, sem entender
   o desenho, e o efeito acontece conforme a fórmula.
4. **Molde desconhecido:** alguém ativa um circuito de teleporte pronto sem
   entender Espaço. Um teórico com a capacidade de copiar, rank suficiente e
   os demais pré-requisitos do contrato pode reproduzi-lo a partir do molde;
   não pode alterar o destino sem aprender o símbolo e a estrutura. Este caso
   só entra em jogo quando houver um contrato publicado de teleporte; uma magia
   encapsulada continua exigindo a compra e os ranks da escola de origem.
5. **Barreira física vs. magia:** Conter para uma espada até perder PV;
   Rejeitar impede magia dentro do teto; cada uma deixa a outra ameaça passar.
6. **Rank baixo com símbolo raro:** comprar Espaço não permite teleporte de
   nível Rei em uma fórmula Principiante.
7. **Desenho rompido:** apagar uma conexão antes da ativação impede a saída;
   romper durante um efeito sustentado termina o trecho ligado a ela.
8. **Doador mais forte:** trocar o alimentador por alguém de rank superior muda
   o PM disponível, mas mantém a potência, o BC e os talentos registrados.
9. **Depósito antes de dormir:** guardar PM e descansar mantém a reserva
   empenhada no teto recuperável. Não surge uma nova reserva a cada descanso.
10. **Três gatilhos no mesmo corredor:** a primeira descarga ofensiva do mesmo
    construtor ocorre; as outras aguardam um novo evento em outra rodada.
11. **Rejeição em sequência:** atravessar dois selos iguais não corta duas
    vezes os dados de uma magia de rank superior.
12. **Conter e Rejeitar:** um ataque com corpo físico e parcela mágica resolve
    cada parcela na camada correspondente, sem contar o dano duas vezes.
13. **Fogo + Água:** a ordem respeita Molhado/Em Chamas; não cria automaticamente
    uma terceira magia de vapor. O custo de duas essências permanece visível.
14. **Cópia de modelo raro:** copiar não permite alterar uma parte desconhecida;
    uma magia encapsulada continua exigindo os conhecimentos de sua carta.
15. **Reparo e transferência:** mudar o suporte ou o mantenedor não renova PV,
    duração, cargas nem o limite de disparos daquele circuito.
16. **Potência baixa em diagrama avançado:** um selo Principiante dentro de
    uma construção Avançada continua sendo dissipável como Principiante.
17. **Pesquisa de um símbolo:** o Mestre e o grupo registram entrada, saída,
    custo, pré-requisitos e respostas adversárias antes de autorizar seu uso;
    a compra não é decidida depois de ver o resultado de combate.

### O que medir no playtest

| Questão | Comparação e informação a registrar |
| --- | --- |
| A árvore funciona sozinha? | Personagem começando somente com Teórica: consegue atacar, proteger e contribuir fora de combate usando o pacote inicial? Quais compras parecem obrigatórias? |
| O especialista continua desejável? | Fogo puro versus Fogo + Teórica com mesmo PA: dano por Ação, dano por PM, alcance, condições e tempo de preparo. A Bola de Fogo atual já inclui seus próprios números e condições; comparar a carta inteira. |
| Cura genérica substitui Cura? | Mesmo PA e PM, cura por ação, quantidade de alvos, prevenção, condições removidas e frequência de PV temporários. |
| Rejeitar encerra o confronto sozinho? | Enfrentar magia de mesma potência, uma acima e duas acima; medir rotas alternativas, dissipação, combate físico e acesso ao suporte. |
| Preparação domina a sessão? | Quantos minutos reais para criar a primeira fórmula e uma composta; quantas consultas e correções exigidas. Se o jogador não prevê a saída, revisar o ensino e o contrato dos símbolos. |
| Redes eliminam a economia de Ações? | Número de saídas automáticas, PM empenhado, tempo de montagem e ações inimigas para perceber/romper a instalação. |
| Os talentos têm escolha real? | Frequência de uso e valor por PA; detectar talentos sempre obrigatórios ou tornados inúteis por uma maestria posterior. |

Metas iniciais de usabilidade: montar o primeiro glifo em até 2 minutos com
um exemplo aberto; depois de familiaridade, ler seu custo e resultado sem
decisão improvisada do Mestre. São metas de teste, não resultados já medidos.
Nenhum equilíbrio numérico desta proposta foi validado por partidas completas.

## Implantação da árvore e próximos passos

**Já aplicado:** a árvore no catálogo e na ficha; modelos e talentos compráveis;
símbolos de Fogo, Água, Vento, Terra, Som e Vida concedidos pelas respectivas
árvores ou compráveis por 1 PA na Teórica; conversão dos ranks da antiga Barreira;
recibo das compras antigas e devolução de seus PA. A Magia Combinada Barreira
Incandescente exige agora Teórica Avançada. O atributo da Teórica é Intelecto;
a conversão não redistribui atributos automaticamente, e a ficha mostra o
histórico para o grupo revisar escolhas.

**Ainda em desenvolvimento:** salvar fórmulas e traços na ficha, resolver
circuitos com várias células na oficina, empenhar PM e executar gatilhos por
turno. Talentos e modelos avançados servem como regras de mesa enquanto essas
funções digitais são construídas.

### Lista de decisões de implementação

1. Criar catálogo de símbolos, fórmulas e regras de validação/custo em dados
   únicos. A ficha deve mostrar símbolos comprados e concedidos por rank.
2. Criar a árvore `Magia Teórica`, substituir `Barreira e Proteção` no mapa e
   converter as magias antigas em **fórmulas modelo** quando ainda fizerem
   sentido. Barreira continua como categoria de resultado, não como árvore.
3. Migrar fichas com `treeId: "barreira"` para a nova árvore, preservando PA
   investidos ou devolvendo o custo de cartas sem equivalente. Não apagar
   silenciosamente conhecimentos comprados.
4. Atualizar Magia Combinada, condições `Selado`/`Fluxo Interrompido`, capítulo
   de magia, referências de rank Deus e testes. A Régua do Selo só pertence a
   fórmulas que tenham o operador Rejeitar.
5. Criar editor de desenho com glifos compostos, ordem numerada e contorno visíveis. Ele deve
   aceitar traço livre e oferecer uma leitura estrutural confirmável para que
   desenho imperfeito não vire punição arbitrária. Guardar fórmula e desenho
   juntos; validar pelo grafo de componentes, custo e rank.
6. Tratar o atributo da antiga Barreira: a proposta usa Intelecto, enquanto a
   árvore atual usa Espírito. A migração deve oferecer reconstrução assistida
   dos investimentos afetados e preservar um registro da ficha anterior; não
   converter automaticamente sem informar a mudança.
7. Mapear cada compra antiga para uma compra de valor equivalente ou crédito
   do PA realmente gasto. Efeitos gratuitos de Selado/Fluxo Interrompido não
   sobrevivem escondidos em todas as novas barreiras. Talentos antigos de
   permanência exigem revisão individual contra os novos limites de autonomia.
8. Entregar uma prévia de conversão com PA antes/depois, símbolos, modelos,
   rank, atributo e condições afetadas. Só então aplicar a migração dos dados.

**Critério de chegada:** o jogador consegue desenhar uma fórmula com símbolos
conhecidos, ver por que ela é válida ou inválida, calcular PM/Ações/rank,
salvá-la, e outra pessoa consegue ativá-la apenas pagando PM. Uma barreira é
montada por esse mesmo fluxo, sem árvore própria ou exceção escondida.

## Oficina interativa já disponível para testar

O fim do Capítulo 2 agora tem uma [oficina de fórmulas](http://localhost:3020/livro#cap2-8).
Ela oferece sete essências, seis operadores, seis formas, cinco meios e três
eventos de gatilho utilizáveis numa célula. O jogador pode começar com um exemplo, trocar uma peça, ver o círculo
mudar, traçar por cima e clicar em **Criar esta magia**. A ficha resultante
explica PM, preparo, duração, dano ou cura, PV, bloqueio e efeito da essência.
Combinações que excedem o rank ou escolhem uma forma sem efeito são recusadas
com o motivo visível.

Esta oficina usa regras determinísticas do catálogo; a compra de símbolos
acontece na árvore da ficha. A oficina ainda não salva desenhos ou fórmulas.
O editor é uma ferramenta de estudo: seu catálogo aberto não concede
conhecimentos ao personagem. Para construir a fórmula em jogo, ele precisa
possuir Magia Teórica, ter rank suficiente e conhecer os símbolos empregados.
O traço livre registra a aparência que o jogador desenhou, enquanto os
componentes confirmados determinam a regra. Isso deixa o desenho expressivo
sem fazer o reconhecimento de caligrafia arbitrar o combate.

### Distância entre a oficina e esta proposta

| Tema | Oficina atual | Proposta v5, ainda sujeita a mudança |
| --- | --- | --- |
| Desenho | Núcleo e operadores sobrepostos, com destaque das camadas. | Preservar essa leitura; suportar várias células e seus vínculos. |
| Acesso | Texto informa que criação exige Teórica; catálogo aberto para experimentar. | Validar rank e fontes de conhecimento ao usar com uma ficha. |
| Rank | Construção e potência são escolhidas separadamente para uma célula. | Estender C/P a cada célula da fórmula composta. |
| Talentos e maestrias | Não calculados na oficina. | Catálogo desta revisão, com escopo explícito e compatibilidade entre árvores. |
| Formas e efeito | Círculo neutro; área direta, orçamento de dados, reforço aditivo de PV e divisão de cura descritos para uma célula. | Calcular soma de várias saídas, filtros e setores ligados. |
| Tempo | Preparo e piso de ativação por potência aparecem separadamente. | Registrar cargas, manutenção e tempo restante dos circuitos compostos. |
| Gatilhos e reserva | Escolhas de regra sem registro de cargas ou doadores. | Estados, manutenção, autonomia, PM empenhado e limite de descarga. |
| Vocabulário | Sete essências, seis operadores incluindo Expressar; três eventos de gatilho utilizáveis numa célula. | Novos contratos de Filtrar, Encapsular, Dissipar e alarme ligado a outra célula. |
| Interações | Resultados previstos para combinações básicas. | Comparar potência, autoria, condições existentes e escopo de talentos. |
| Persistência e migração | Árvore e compras de símbolos na ficha; ranks convertidos, compras antigas arquivadas com PA devolvido; fórmulas ainda não são salvas. | Fórmulas versionadas, reservas e conversão assistida de atributos. |

## Decisões abertas e fontes locais

**Tudo continua sujeito a mudanças.** Prioridades de revisão: atributo
Intelecto; curva de PV; custo de símbolos versus progressão; proporção de dano
e cura; área das instalações; piso de Ações; quantidade de circuitos autônomos;
valores das assinaturas e a existência do Rudimento Arcano. Uma mudança deve
registrar motivo, exemplos afetados e necessidade de conversão de fichas.

Esta revisão foi confrontada com as regras locais de
[ranks e bônus](src/lib/types.ts),
[custos de PA e conjuração](src/data/trees/shared.ts),
[Magia Teórica atual](src/data/trees/teorica.ts),
[Fogo](src/data/trees/fogo.ts),
[condições](src/data/condicoes.ts),
[magias combinadas](src/data/combinedSpells.ts) e o
[motor do protótipo](src/lib/magiaTeorica.ts).
Essas referências descrevem o jogo existente; as exceções e substituições
deste documento ainda são propostas. Na mesa atual prevalece a regra publicada,
salvo quando o grupo estiver testando explicitamente esta versão.
