# O que falta

Estado em 2026-09-11, depois da 0.1.56. O `PROGRESS.md` é o registro completo e o `PATCH_NOTES.md` é
o histórico; aqui fica **só o que ainda não foi feito**, na ordem em que eu faria.

## Precisa de você (não dá pra fazer sozinho)

1. **A faixa do livro está em baixa resolução.** `public/faixas/livro.jpg` tem 680×384 e é a menor das
   oito — as outras estão entre 960 e 1900. Reprocurar `open grimoire spellbook candlelight` filtrando
   por 1600px+; ampliar os 680 não cria detalhe, só borra.

2. **Testar em celular de verdade — nos dois, iPhone e Android.** `npm run check:mobile` garante que
   nada transborda entre 320 e 414px, e é só isso que ele sabe. Falta dedo em tela: rolagem com
   inércia, teclado virtual cobrindo campo, e a pergunta que nenhum script responde — dá pra usar a
   ficha com uma mão só numa mesa cheia? Três coisas específicas esperam aparelho:
   - **O link de ficha abre no iPhone do seu amigo?** A causa provável foi tratada na 0.1.19: o link
     vai sempre comprimido, e `DecompressionStream` só existe no Safari do iOS 16.4+. Num iPhone mais
     velho o erro virava "link inválido" sem explicar nada. Hoje a tela de importar diagnostica e
     oferece saída — falta ver acontecer.
   - **Compartilhar pela bandeja nativa.** Feito na 0.1.20, com quatro testes; mas o Chrome headless
     não implementa Web Share, então o botão nunca foi visto aparecer de verdade.
   - **O PDF sai certo do celular?** É o mesmo caminho do item 3, pela tela pequena.

3. **Confirmar o PDF em produção.** O fix de `outputFileTracingIncludes` (binário do Typst na Vercel)
   só é verificável no próximo deploy, e "exportável em PDF pra levar pra mesa" está escrito na
   landing. O PDF agora também imprime o retrato do personagem — mais uma coisa pra conferir lá.

4. **Validar a Distância Roubada na mesa** (Vendaval). A pergunta não é "18 metros é demais": é **o
   Vendaval alguma vez apanha?** Ele desengaja de graça uma vez por turno e bate de 10,5 a 18m
   mantendo o ataque como corpo a corpo. Se o inimigo nunca revida, o custo declarado da árvore nunca
   é cobrado. Mede-se numa sessão: conte os ataques corpo a corpo que ACERTARAM o Vendaval e compare
   com o outro da linha de frente. A conta está no cabeçalho de `src/data/trees/vendaval.ts`.

5. **Teste com leitor de tela.** O `check:a11y` cobre a camada estrutural das 16 rotas e está limpo —
   e ganhou um motivo a mais de urgência na 0.1.56: o livro recebeu filete de seção, barra de progresso
   e uma hierarquia de subtítulo nova, tudo decidido **olhando a tela**. Nada disso foi ouvido. Falta
   saber se a ficha é *usável* de ouvido: se a ordem de foco conta a história certa, se "Comprar" anuncia o que está
   comprando, se dá pra montar um personagem sem enxergar. Meia hora com o NVDA.

> **Por que as pendências 6 e 7 são justamente essas** (descoberto na 0.1.37). O simulador foi medido:
> das 601 habilidades do livro ele enxerga 122, e não espalhadas — Espíritos e Feras 0 de 7, Bardo 0
> de 6, Navegação e Liderança 0 de 6, Barreira 1 de 21, Furtividade 1 de 6, Desintoxicação 4 de 20.
> São **as mesmas seis árvores** que as duas pendências abaixo mandam levar pra mesa. Não é
> coincidência: elas estão aqui porque a única ferramenta de medição do projeto é cega pra elas.
> Cada pedaço de motor que passar a enxergar economia de ação, condição ou posição tira uma linha
> desta lista — a cura saiu da lista assim, na 0.1.37.

6. **Jogar o Invocador, o Ladino e o Bardo.** São as mudanças de 0.1.12 que **não** saíram de medição
   — saíram de um pedido, e os números são meus:
   - A **Ordem Partilhada** é a que mais me preocupa: ela troca uma Ação sua por uma do invocado, e se
     o bicho bater mais forte que você a troca é sempre boa e o talento vira obrigatório.
   - As **3 Ações** do Chamado de Emergência são o turno inteiro. Ou é o preço certo por invocar sem
     preparo, ou ninguém usa nunca.
   - A **Dissonância** do Bardo é a última das duas que foram inventadas só pra ter o que medir. A
     outra era a Ordem de Tiro, e a sessão respondeu por ela: foi **trocada** em 0.1.14, não ajustada,
     que era o plano escrito aqui desde o começo.

7. **Jogar as quatro que foram lidas na 0.1.46** — Suishin, Escudos, Ladino e Tático. A leitura linha
   a linha saiu, e **não achou nada quebrado**: as quatro são coerentes com o que prometem. O que ela
   achou foi outra coisa, e é o que sobra pra mesa decidir:
   - **O Tático não tem uma única habilidade de dano.** As dezenove fabricam **Ação e bônus pros
     outros** — e Ação é a única moeda que este combate gasta. O Cap. 4 já escreveu o teto ("5 por
     turno, no máximo 2 externas") e nomeia o cenário exato: *"um Norte Imperador com um Tático
     Comandante chega a 7 Ações por turno, e o combate deixa de existir"*. O teto está escrito; o que
     ninguém viu ainda é ele **segurando** numa mesa de verdade.
   - **O Suishin é uma árvore inteira de Reações** — contra-ataque, aparar, devolver. Uma única
     habilidade de dano próprio. O Apêndice C é honesto e a marca como *"0 a ∞"*. A pergunta de mesa é
     se um jogador consegue **sentir** essa árvore funcionando, ou se ela vira "eu espero apanhar".
   - **Em Escudos, o dano todo vem de uma habilidade de Principiante.** O `Golpe de Escudo Soberano`
     (1 Ação, 3d8 + Força + Bônus de Rank) escala com o Rank pra sempre, e é o que fez a Mara liderar
     o playtest. Ver o item 9 — é a mesma pergunta por outro ângulo.
   - **O Ladino tem uma habilidade de dano, no Principiante.** Como o Tático, ele compra outra coisa.

   Nenhuma das quatro é bug. Todas as quatro são **invisíveis pro simulador**, e é por isso que elas
   só se respondem jogando.

8. **Jogar as quatro árvores mexidas na 0.1.14** — Tático, Barreira, Desintoxicação e Punho do Fogo.
   Cada uma tem uma pergunta própria, e nenhuma delas se responde por script:
   - **Tático:** com o Bônus de Rank valendo contra o alvo Apontado e a marca acumulando quando
     ninguém a executa, ele deixou de parecer um civil armado? E o acúmulo até o dobro do patamar não
     virou a jogada óbvia (apontar, esperar, apontar de novo) em vez de mandar o grupo atirar?
   - **Barreira:** 20 PV por patamar é o número certo? No 1º patamar são 20 PV — se o guerreiro
     derruba uma Muralha em um turno, a magia não existe; se leva quatro, o combate para.
   - **Desintoxicação:** a Peçonha resolveu o turno vazio, ou virou a única coisa que o purificador faz
     (e aí a escola trocou um problema por outro)?
   - **Punho do Fogo:** com Sobrecarga sempre a 3 de Calor, alguma técnica ficou barata demais? A
     suspeita é a Coroa Solar, que dispara uma vez por turno e antes custava 2.

9. **+4 PV e +1 PM custam o mesmo 1 PA, e não valem o mesmo** *(descoberto na 0.1.48)*. Toda árvore
   tem um talento de 1 PA que escala sozinho a cada patamar: **Corpo dá +4 PV**, **Magia dá +1 PM**.
   Quando o playtest passou a comprá-los — porque nenhum jogador de verdade os deixa na mesa —, o time
   com quatro árvores de Corpo saltou de 46% pra **74%** de vitória contra o time de quatro magias.
   O PM destravou os magos (a Iri foi de 43 pra 117 de dano), mas PM não impede ninguém de morrer.

   A pergunta é sua: os dois talentos deviam custar o mesmo? Ou o de Magia deveria dar outra coisa —
   mais PM **e** algum PV, ou um desconto de conjuração?

10. **O Deus da Espada continua frágil — mas a árvore está certa** *(investigado na 0.1.48)*. Você
    mandou conferir a ficha antes de mexer no livro, e estava certo: a árvore **tem** o talento de
    sustentação (`Braço de Ferro`, 1 PA, +4 PV por patamar), e o algoritmo do playtest nunca o
    comprava. Dar o talento ao Vex moveu o time inteiro dele de **45,1% pra 54,9%** de vitória — dez
    pontos, num talento de 1 PA. O algoritmo foi corrigido; era ele que estava errado, não a árvore.

    **O que sobra da pergunta:** mesmo com o talento, o Vex fica em ~8% de sobrevivência e é o menor
    dano por batalha. Por TURNO ele nunca foi ruim. Ou o Deus da Espada precisa de mais que um talento
    de PV, ou ele é vidro de propósito — e aí o livro deveria dizer isso em vez de chamá-lo de "o maior
    dano do livro".

11. **Duas perguntas de balanceamento que a 0.1.35 abriu** *(os números abaixo são os da 0.1.35; com a
    cura no motor, na 0.1.37, a Mara marcou 91 e 92% e a Iri 27 e 57% — as duas perguntas continuam
    valendo, e a da Mara ficou mais forte: ela lidera a sobrevivência do playtest inteiro)*. O simulador foi consertado em dois pontos
    (a CA não era consultada por técnica nenhuma; a IA não contava os Dados de Arma ao escolher), e o
    playtest mudou de dono. Duas linhas agora precisam do seu julgamento — o script mede, ele não
    decide:
    - **A Mara é a maior causadora de dano do jogo.** Cavalaria e Escudos está descrita como *"protege,
     não mata"* e terminou o playtest com 95 de dano por batalha e 93% de sobrevivência — à frente do
     Deus da Espada em dano E em sobrevivência. Ou a descrição está errada, ou o Golpe de Escudo
     Soberano está.
    - **O Vento desabou de 53 pra 19** *(número da 0.1.35; na 0.1.57 a Iri marca **117** de dano por
     batalha e 42% de sobrevivência — terceiro lugar. A pergunta sobre o custo de 2 Ações continua
     valendo, mas esta evidência específica não sustenta mais nada)*.** As técnicas da Iri custam **duas Ações**, e a conta certa
     mostra que duas Ações quase nunca compensam contra três golpes de uma. Isso não é um problema da
     Iri: é uma pergunta sobre o custo de 2 Ações no sistema inteiro. Se nenhuma técnica de 2 Ações
     compensa, ou elas estão fracas ou a economia de 3 Ações por turno precisa de outra coisa.

12. **A cura tem limiar, e o limiar é meu.** A IA cura quem estiver na metade ou abaixo — 50% é um
    número declarado no motor, não medido na mesa. Se numa sessão o curandeiro age mais cedo (ou mais
    tarde) que isso, o número certo é outro e todos os relatórios se movem junto. É a única regra de
    decisão do simulador que veio de mim e não do livro.

13. **~~O penhasco da dizimação~~ — DECIDIDO em 2026-09-11.** O ajuste de Chefe virou por patamar
    (×2,65 / ×1,9 / ×1,29 de dano) e os três marcam 32%, 25% e 25% de dizimação, contra 0% antes.

    A pergunta que sobrava era se o **penhasco** devia ser suavizado: trinta pontos de dizimação
    separados por dois por cento de multiplicador, porque quem cai para de causar dano e a luta
    desanda. O caminho medido pra suavizar seria dar ao chefe mais ações e menos dano por golpe.

    **Resposta do autor: fica como está.** O combate contra chefe é de noites tranquilas e noites de
    desastre, e é isso que ele quer que a mesa sinta. Não reabrir sem um pedido novo — o comportamento
    está documentado no Apêndice G pra que ninguém o confunda com um defeito.

14. **Três capstones que não compensam — e agora a bola está com você** *(eram dezesseis; treze
    caíram até a 0.1.50, e a 0.1.57 provou que os três restantes NÃO eram do motor)* —
    `npm run check:progressao`.

    | Árvore | Rank | Rende | O rank abaixo faz |
    | --- | --- | --- | --- |
    | Vento | Rei — `Vazio` | 19,8 | 26,8 (Santo) |
    | Terra | Imperador — `Sepultamento` | 19,8 | 30,6 (Rei) |
    | Punho do Fogo | Imperador — `Colapso Solar` | 40,8 | 52,8 (Rei) |

    **O que mudou, e por que isto não é mais um item de motor.** A versão anterior deste item dizia
    que as três de então — `Trono de Chamas`, `Rio de Magma`, `Tempestade Cortante` — apareciam
    quebradas porque o motor contava UMA vez o dano que o livro escreve *"por turno"*, e concluía:
    *"o conserto é no simulador, não no livro"*.

    O simulador foi consertado na 0.1.57 (relógio de sustentado, três turnos declarados), e as três
    saíram da lista. **O número não caiu.** As três de agora são outras: as
    técnicas que vêm LOGO ACIMA das sustentadas — e que, medidas contra elas, rendem menos por Ação.

    Ou seja: o instrumento não escondia um livro certo. Escondia um problema diferente, que agora
    está visível e é de design. A pergunta é sua, e tem duas leituras possíveis:
    - **Os três turnos são generosos demais?** a lista é pouco sensível ao número — mexer nele
      troca quem aparece, não quanto.
    - **Ou magia sustentada é forte mesmo, e o que está errado é o patamar acima dela?** Se for isso,
      `Vazio`, `Sepultamento` e `Colapso Solar` é que precisam de dados.

15. **A magia perde da técnica corporal na economia de Ações** *(medido na 0.1.40, quando as magias
    longas finalmente entraram na simulação)*. O melhor dano esperado **por Ação** de cada árvore:

    | Corpo | | Magia | |
    | --- | --- | --- | --- |
    | Armas Pesadas | **43,2** | Vento | 23,7 |
    | Punho do Fogo | 40,4 | **Fogo** | **13,9** |
    | Vendaval | 34,4 | Terra | 13,2 |
    | Deus da Espada | 29,0 | Água | 11,9 |

    Duas perguntas separadas, e as duas são suas:
    - **O teto do corpo é o triplo do teto da magia.** A magia compra alcance de 90m, área de verdade e
      condição — coisas que este motor não pontua. A diferença é grande demais pra ser só isso?
    - **A magia suprema é pior que a de dois ranks abaixo.** No Fogo, o **Sol Menor** (Imperador, 22 PM,
      6 Ações) rende 13,6 por Ação e a **Lança de Plasma** (Avançado, 13 PM, 3 Ações) rende 13,9. No
      Vento a diferença é maior ainda. Só Água e Terra têm a magia longa compensando. Ou o custo em
      Ações das magias de Santo pra cima está alto demais, ou o dano delas está baixo demais.

16. **A escolha de grupo de arma virou decisão ou virou imposto?** *(aberto pela 0.1.52)* Todo
    personagem agora escolhe **um grupo livre na criação**, além do piso de Desarmado e Improvisado. A
    intenção era dar caracterização a quem não é guerreiro — a adaga de reserva do mago, o cajado de
    combate. O risco é o oposto: a criação de ficha já é longa, e esta é mais uma tela onde a pessoa
    não sabe o que escolher porque ainda não sabe como vai jogar.

    Duas coisas a observar numa sessão de criação: **alguém hesitou?** (hesitar é bom — significa que a
    escolha importa) e **alguém escolheu e nunca usou?** (aí ela é ruído, e o piso deveria ser maior).

17. **O Tiro Perfeito vale quatro Ações?** *(aberto pela 0.1.53)* Ele é o primeiro sistema do livro que
    cobra **tempo** em vez de recurso, e isso só se mede jogando: quatro Ações são dois turnos inteiros
    em que o arqueiro não defendeu ninguém.

    As três perguntas, em ordem de importância:
    - **A Preparação sobrevive à mesa?** Levar dano exige Concentração, e um arqueiro no fundo leva
      menos — mas se ele nunca é atingido, a técnica não tem custo real nenhum; se é atingido sempre,
      ela nunca acontece. Não existe teste que responda: é posicionamento.
    - **Falhar uma etapa dói o bastante?** A regra é que falhar não interrompe, só custa o bônus
      daquele teste. Se a mesa sentir que dá no mesmo, as etapas viram burocracia com d20.
    - **Etapa Encurtada (Intermediário) virou obrigatória?** Ela derruba o tiro de 4 para 3 Ações — ou
      seja, faz a técnica caber num turno. Talento que muda tanto assim costuma deixar de ser escolha.

## Site

18. **Instalar o app num celular de verdade** *(ficou bem menor na 0.1.44)*. Três coisas que só um
    aparelho mostrava foram achadas e corrigidas sem aparelho, lendo o que o navegador recebe: o
    **`apple-touch-icon` não existia** (o iPhone usava uma captura da página como ícone da tela de
    início), faltava o **`viewport-fit=cover`** que o `black-translucent` exige, e não havia **nenhuma
    regra de área segura** — a barra do topo ficava embaixo do relógio e o botão de dados embaixo da
    barra de gestos, que vale pro Android também.

    O `check:offline` prova a parte que dá pra provar: as 19 rotas abrem com o servidor morto, em F5 e
    em navegação suave, num Chrome headless.

    **O que ainda precisa dos dois aparelhos na mão**, e são dez minutos:
    - "Adicionar à tela de início" aparece, nos dois?
    - O ícone sai certo recortado pelo launcher do Android, e no iPhone aparece o brasão em vez de uma
      captura da página? *(era esse o bug da 0.1.44 — vale conferir que sumiu)*
    - A splash é a nossa?
    - A barra do topo e o botão de dados fogem do entalhe e da barra de gestos? *(as regras de área
      segura entraram na 0.1.44 e foram medidas em Chrome com recorte injetado, mas nunca num
      aparelho.)*

19. **O que o pré-cache NÃO cobre, e se isso incomoda.** O worker guarda o HTML de cada rota mais
    tudo que esse HTML cita. Imagem que só o JavaScript pede depois — retrato de raça na criação, arte
    de criatura no `/encontros` — entra no cache na primeira vez que é VISTA, e não antes. Quem
    preparou o personagem em casa não perde nada; quem abre a roleta pela primeira vez já no porão vê
    moldura vazia no lugar dos retratos.

    Fechar isso exigiria uma lista de todos os arquivos de `public/`, mantida à mão ou gerada por mais
    um passo de build — uma lista que envelhece calada, e cujo sintoma é exatamente o que ela deveria
    evitar. Antes de pagar esse preço, vale medir se alguém repara.
