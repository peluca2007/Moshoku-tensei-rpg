# Mecânica de Encontros — o trabalho de 2026-09-18

**Está feito** (0.1.90). Este arquivo deixou de ser plano e virou registro: o autor pediu que tudo
ficasse documentado porque o chat seria limpo, e a razão de cada decisão não cabe num patch note.

O que a mesa lê está no livro (Apêndice G) e no patch notes. O que está aqui é **por que** cada número
é aquele — o tipo de coisa que, sem registro, alguém "conserta" daqui a três meses sem saber o que
estava consertando.

## O pedido

> "Melhore ao máximo a mecânica de encontros do Mestre. Não consigo colocar status e perícia para o
> monstro, ele não simula tanta coisa assim."

Já estava previsto no `O-QUE-FALTA.md`, itens 2 (Livro) e 19 (Site), e a ordem é a de sempre: **o livro
primeiro**. Nada que o site faça pode existir fora do livro.

## A ordem do trabalho

1. **LIVRO — o Bloco do Monstro** (Apêndice G). Definir que campos um monstro tem e como cada um se
   calcula: atributos, acerto, CD, Deslocamento, perícias, sentidos, resistências, tamanho, proficiências.
2. **DADOS** — estender `MoldeCriatura` e `CriaturaPronta` com esses campos, derivando do patamar em vez
   de guardar número solto.
3. **SITE** — a ficha de monstro de verdade na tela de encontros, alimentada pelos mesmos derivadores.
4. **SIMULADOR** — usar os campos novos (perícias, sentidos, resistências) em vez de ignorá-los.

## O princípio de desenho

**Duas escolhas geram o monstro inteiro: PATAMAR e ARQUÉTIPO.** O patamar dá todos os números (já dava:
PV, CA, acerto, CD, dano por turno); o arquétipo diz em qual atributo aquele número aparece. O Mestre
não preenche uma ficha — ele faz duas escolhas e ajusta o que quiser depois.

Isso vem direto das três prioridades do `CLAUDE.md`: um Mestre que precisa parar a sessão para montar
uma ficha de monstro não vai montar. O bloco tem que caber numa linha de conversa.

## Estado — tudo feito

- [x] 1. Livro — Bloco do Monstro no Apêndice G (arquétipos, atributos, sentidos, perícias, tamanho)
- [x] 2. Livro — Como escrever as Ações de uma criatura, e o Orçamento de Encontro
- [x] 3. Dados — derivadores em `bestiary.ts`, nada guardado que possa ser calculado
- [x] 4. Site — o painel do bloco na tela de encontros, com arquétipo e resistências
- [x] 5. Site — medidor de Orçamento, que anda enquanto o Mestre monta
- [x] 6. Site — botão "Sugerir ações", calibrado pela régua do livro
- [x] 7. Iniciativa — a ficha viaja junto, e o dano se digita em vez de se calcular
- [x] 8. Motor — Resistência e Imunidade aplicadas nos dois sentidos
- [x] 9. Aviso — a Imunidade que apaga a jogada de alguém da mesa
- [x] 10. Ficha do jogador e PDF — Deslocamento

### O que deliberadamente NÃO foi feito

- **Proficiência de armadura na ficha.** O Deslocamento do personagem não aplica o −3 m de vestir
  armadura pesada sem proficiência (Cap. 1, §4) porque a ficha não guarda em quais categorias ele é
  proficiente — isso vive na prosa de cada árvore. O dia em que virar dado, `getDeslocamento` é a
  função que muda.
- **Gerador de monstro por IA.** O autor levantou a ideia ("uma IA bem baratinha pra gerar os
  monstros"). Não foi feito: exige chave de API e rede, e o site inteiro funciona offline hoje. O
  botão "Sugerir ações" cobre o caso de uso principal — a conta — sem nada disso.
- **Posição e distância no simulador.** Atolado, Desequilibrado e Marcado continuam invisíveis pro
  motor pelo mesmo motivo de sempre: ele não tem mapa. Está no `O-QUE-FALTA.md`.

## Decisões tomadas (e o porquê)

### 1. Duas escolhas, nunca uma ficha em branco

O Mestre escolhe **patamar** e **arquétipo**, e o bloco inteiro sai daí. Não existe campo de atributo
pra preencher, porque um Mestre no meio da sessão não preenche cinco campos — ele desiste e improvisa,
que é exatamente o que a ficha devia evitar.

### 2. Atributo Principal = Bônus de Ataque − patamar

Esta é a linha que segura o resto. A coluna de Bônus de Ataque da tabela do Apêndice G passa a ser uma
CONSEQUÊNCIA do atributo, e não um segundo número que alguém precisa lembrar de manter alinhado. É a
mesma técnica que a coluna de Bônus de Resistência já usava (`metade do Bônus de Ataque`), e é o que
impede o Apêndice de envelhecer calado — como a tabela de PV do Cap. 4 e a régua do Apêndice C já
envelheceram antes. Um teste trava isso (`blocoDoMonstro.test.ts`).

Degraus: Principal = BA − patamar; **Bom** = metade do Principal pra cima; **Comum** = Bom − 1;
**Fraco** = −1 SEMPRE, em todo patamar. O Fraco não escalar é a decisão de design mais importante da
tabela: é o que faz um ogro de 6º patamar continuar sendo burro e enganável, e um íncubo de 1º não ser.

### 3. Percepção passiva = 10 + Espírito, sem exceção pra monstro

É a MESMA fórmula da regra de ficar Escondido (Cap. 4, §3). Se monstro tivesse uma fórmula própria,
existiriam duas regras de furtividade no livro e a mesa aplicaria a errada. O efeito colateral é bonito
e foi mantido de propósito: esconder-se de um Bruto é CD 9 do 1º ao 6º patamar, e de uma Mente de 6º é
CD 16.

O Ágil (lobo, assassino) tem Espírito Fraco e seria o monstro mais fácil de enganar do livro — por isso
ele tem **sentido**: faro que fura o Escondido a 9 m. O campo `sentido` do arquétipo é o que dá oposição
à metade furtiva do livro (Ladino, Arquearia, Surpreso).

### 4. Perícia de criatura é Vantagem, nunca um número

Igual à do personagem (Cap. 1, §4). Quantidade: metade do patamar arredondado pra cima (1/1/2/2/3/3).
Nenhuma regra nova.

### 5. Imunidade custa; Resistência não

Resistência é de graça quando a ficção pede (o esqueleto resiste a perfurante). **Imunidade faz a
criatura contar como um patamar acima no Orçamento de Encontro**, porque ela apaga a jogada de alguém da
mesa. O painel avisa o preço na hora de marcar.

### 6. O motor passou a aplicar as três palavras

O Cap. 4, §6 definiu Resistência/Imunidade/Vulnerável na revisão, e o motor ignorava as três: um
elemental de fogo levava dano ígneo cheio em 2.000 combates simulados. Agora `aplicarDano` recebe o
tipo (que já vivia dentro da string de dano, tipo `"6d10 + BC (ígneo)"`) e aplica. Em Chamas passa
`"ígneo"` à mão — o elemental de fogo não queima.

Ordem, como o livro manda: reduções fixas primeiro (já saíram do número que chega), depois
Resistência/Imunidade, e só então os PV Temporários. Imunidade zera ANTES de gastar a casca: não se
gasta escudo contra o que não machuca.

### 7. Recalibrar não apaga a identidade

`recalibrar` devolve PV, CA, acerto e CD à tabela — e mais nada. Arquétipo, tamanho, perícias e
resistências sobrevivem. Um Mestre que apertasse o botão pra consertar o PV e descobrisse que o
necromante virou bruto genérico não apertaria o botão de novo.

### 8. A ficha viaja com a criatura para a iniciativa

O bloco se monta na tela de Encontros, mas a mesa acontece no rastreador de Iniciativa. A ficha vai
junto, como CÓPIA: o combate é um instantâneo, e recalibrar a criatura no meio da luta não muda o bicho
que já está na mesa.

### 9. Digitar o dano, não a vida que sobrou

O rastreador tinha PV editável, o que obrigava a conta de cabeça ("tinha 47, levou 13, então… 34").
Com seis criaturas são seis subtrações por rodada. Agora: digita 13, Enter, a vida cai. Enter é dano
porque dano é o que se aperta noventa por cento das vezes; curar tem o botão +. Nunca desce de 0,
porque vida negativa não é estado nenhum deste livro.

### 10. O botão que escreve as Ações

Definir atributos resolveu "qual a Força dele?". Sobrou o mais chato: **inventar fórmula de dado**. A
régua já estava na coluna `danoPorTurno` da tabela de moldes — o botão só a distribui em três Ações, no
formato que o arquétipo pede.

Os nomes são genéricos de propósito ("Golpe Pesado", e não "Machadada do Ogro Sangrento"): o Mestre
troca o nome em dois segundos e nunca vai querer o nome que uma função escolheu. O que ele não quer
fazer é a conta. O botão só aparece com a lista vazia — sugerir por cima do que ele escreveu seria
apagar o trabalho dele.

**O piso do dado.** Um lacaio de 1º patamar tem 5 de orçamento no turno inteiro, e o menor dado do livro
(d4) rende 2,5: três ataques do menor dado que existe já dariam 7,5, e a criatura mais fraca sairia 50%
acima da própria régua. Não há fórmula que resolva — é granularidade, não conta. A saída é de ficção, e é
a certa: **lacaio não tem economia de ação**. Ele avança e dá UM golpe de 2 Ações, e a terceira é pra
chegar perto. Errar pra baixo na criatura mais fraca do livro não tira nada de ninguém; errar pra cima
mataria um personagem.

Em 90 combinações (5 arquétipos × 3 papéis × 6 patamares), nenhuma passa de 110% da régua e nenhuma fica
abaixo de 65%. `acoesSugeridas.test.ts` trava os dois limites.

### 11. `aplicarPapel` mudou de casa

Era de `encounterSim.ts` e passou pra `bestiary.ts`. Motivo: é REGRA DO LIVRO ("Ajustando pra cima ou
pra baixo"), e `acoesSugeridas` precisa dela — se a conta ficasse no simulador, o dado do livro passaria
a importar da ferramenta, que é a dependência ao contrário. O reexport ficou, porque meia dúzia de
arquivos a chamam pelo caminho antigo e trocar todos não deixaria nada mais claro.

### 12. O `check:sumario` pegou seis seções órfãs

As cinco novas do Apêndice G e a **Cobertura** do Cap. 4, que tinha entrado na revisão do livro (0.1.81)
e nunca foi pro índice — existia e ninguém achava. Vale como lembrete: `check:sumario` não estava no
ciclo de verificação daquelas sessões, e devia estar.

### 13. Resistência do personagem, lida da prosa — e os cinco falsos positivos

Depois que o Apêndice G deu Resistência às criaturas, deixar o lado dos personagens de fora seria a
mesma regra valendo num sentido só. Só que **nenhuma habilidade do livro declara resistência num campo
estruturado** — está tudo na prosa. Criar o campo exigiria revisar as ~400 habilidades e torcer pra
ninguém esquecer de preencher na próxima.

Então `resistenciasDe` lê o texto, como o motor já faz em três outros lugares (detecção de fogo, de
Quebrantado, de cura). Ler prosa erra, e **cada erro abaixo aconteceu de verdade** antes de virar teste:

| O que a frase dizia | O que a primeira versão entendeu |
| --- | --- |
| "ignor**am** Resistência a perfurante" (Arquearia) | que o arqueiro resiste a perfurante — o oposto exato |
| "ignora Resistência **e Imunidade** a dano ígneo" (plasma) | que o mago de Fogo é imune ao próprio elemento |
| "testes de resistência **contra** veneno" (Desintoxicação) | resistência a dano de veneno — outra palavra inteira |
| "Resistência a dano físico **mundano**" (Fogo, Terra) | resistência a todo dano físico |
| "o **filhote** ganha… Resistência a dano físico" | que o invocador resiste, e não o bicho |

As quatro guardas que saíram disso: a negação vale **até o fim da frase** (`[^.]*$`), não até a palavra
anterior; exige-se a preposição **"a"** (quem dá resistência a dano escreve "a"; quem fala de rolagem
escreve "de" ou "contra"); rejeita-se **condicional e mundano**, porque o motor não sabe se o golpe veio
de arma mágica; e rejeita-se o texto inteiro quando ele fala de **invocado/filhote/pacto**.

Sobraram duas resistências verdadeiras no livro inteiro: Deus do Norte imune a veneno, Punho do Fogo
resistente a frio. `resistenciasDe.test.ts` trava os cinco falsos positivos e põe um teto de três
árvores — se uma habilidade nova fizer a leitura disparar em meia dúzia, é quase certo que a regex
passou a pegar a palavra errada.

### 14. O aviso que só existe porque o bloco existe

O Orçamento de Encontro cobra um patamar pela Imunidade, mas ele mede **dificuldade** — e uma criatura
imune a ígneo contra três magos de Fogo não é um encontro difícil, é **um jogador sem jogada**. A mesa
leva vinte minutos rolando dados que não fazem nada antes de desconfiar.

O aviso dispara **grave** quando o grupo inteiro fica cego e **alerta** quando sobra alguém que alcança.
Ele se cala em três casos, e os três importam: sem grupo escolhido, sem saber o que o grupo causa
(palpite aqui manda refazer um encontro que estava certo), e quando é **Resistência** em vez de
Imunidade — metade do dano ainda é dano, e a jogada continua existindo.

### 15. Um susto: `$` + crase numa string de substituição

No meio do trabalho, `combatSim.ts` **duplicou sozinho**: 43.726 caracteres injetados no meio de um
comentário. Causa: um `String.replace` cuja string de substituição continha `$` seguido de crase, que o
JavaScript trata como "tudo o que vem antes do match".

Consertado por recorte, e a lição virou hábito: **substituição com texto que contém `$` usa função**
(`s.replace(velho, () => novo)`), nunca string. O `tsc` pegou na hora — sem ele, o arquivo teria ido
pro commit parecendo maior e não muito diferente.
