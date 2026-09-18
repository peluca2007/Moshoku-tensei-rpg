# O que falta

Só o que **ainda não foi feito**. O que já foi feito sai daqui e fica registrado no patch notes do site
(`src/data/patchNotes.ts`). Ordem: livro primeiro, depois mesa, depois aparelho, depois site.

## Livro (prioridade)

0. **O LIVRO NÃO TEM MAIS PENDÊNCIA** (0.1.91). As duas opções mortas que a revisão tinha separado
   foram resolvidas — a Maestria da Invocação parou de apagar 6 PA de compras e a fraqueza declarada da
   escola, e o Muro de Terra e a Fortaleza Rápida passaram a ter empregos diferentes em vez de uma ser a
   outra com números maiores. A ficha também passou a cobrar os pré-requisitos de outra árvore, e o
   `check:livro` impede que a frase volte a existir sem o campo.

   O que sobra abaixo é **mesa, aparelho e site** — nada que se resolva lendo o livro.

0. **A mecânica de encontros foi refeita** (0.1.90): o Bloco do Monstro (Apêndice G) com arquétipos e
   atributos derivados, o Orçamento de Encontro com medidor na tela, Resistência e Imunidade aplicadas
   pelo motor, a ficha do monstro viajando para a Iniciativa, e o contador de dano. As decisões de
   desenho estão em `ENCONTROS.md`; o resumo, no patch notes.

0. **A Revisão do Livro acabou** (0.1.80 a 0.1.89): os 230 achados foram aplicados, e o
   `REVISAO-DO-LIVRO.md` foi apagado, como ele mesmo mandava. O histórico está no patch notes do site.

## Balanceamento que só a mesa responde

3. **O Vendaval alguma vez apanha?** Ele desengaja de graça uma vez por turno e bate de 10,5 a 18m com
   ataque corpo a corpo. Numa sessão, conte os ataques corpo a corpo que acertaram o Vendaval e compare
   com o outro da linha de frente. A conta está no cabeçalho de `src/data/trees/vendaval.ts`.

4. **Jogar o Invocador, o Ladino e o Bardo.** Os números vieram de pedido, não de medição:
   - **Ordem Partilhada:** se o invocado bate mais forte que você, a troca é sempre boa e o talento vira
     obrigatório.
   - **Dissonância** do Bardo: resolveu o turno vazio?

5. **Jogar Suishin, Escudos, Ladino e Tático.** As quatro são coerentes e invisíveis pro simulador:
   - **Tático:** o teto de Ações do Cap. 4 ("5 por turno, no máximo 2 externas") segura na mesa? E o
     acúmulo da Ordem de Tiro virou a jogada óbvia (apontar, esperar, apontar de novo)?
   - **Suishin:** o jogador sente a árvore funcionando, ou vira "eu espero apanhar"?

6. **Barreira e Desintoxicação.** Barreira: 20 PV por patamar é o número certo? Se o guerreiro derruba
   uma Muralha em um turno, a magia não existe; se leva quatro, o combate para. Desintoxicação: a
   Peçonha virou a única coisa que o purificador faz?

7. **O Deus da Espada é vidro de propósito?** Mesmo com o Braço de Ferro, o Vex fica em ~8% de
   sobrevivência e com o menor dano por batalha. Ou a árvore precisa de mais sustentação, ou o livro
   deve dizer que ela é frágil em vez de chamá-la de "o maior dano do livro".

8. **A Mara (Escudos) lidera dano e sobrevivência no playtest.** A árvore diz "protege, não mata". Ou a
   descrição está errada, ou o Golpe de Escudo Soberano está.

9. **Técnicas de 2 Ações compensam?** *(Deliberadamente deixado de lado por ora).* Duas Ações quase nunca rendem mais que dois golpes de uma. Ou
    elas estão fracas, ou a economia de 3 Ações por turno precisa de outra coisa.

10. **O Corpo rende 2,0× mais por Ação que a Magia** *(remedido em 2026-09-18; a tabela anterior era
    da 0.1.78 e comparava outra coisa)*. `npm run check:progressao` mede o TETO de cada pilar — a melhor
    técnica de cada árvore, em dano esperado por Ação contra CA 15:

    | Corpo | | Magia | |
    | --- | --- | --- | --- |
    | Deus da Espada | **66,0** | Terra | **33,0** |
    | Punho do Fogo | 40,8 | Vento | 30,7 |
    | Deus do Norte | 35,6 | Cura | 26,9 |
    | Armas Pesadas | 35,2 | Fogo | 20,4 |
    | Vendaval | 35,2 | Água | 17,8 |
    | Arquearia | 30,8 | Desintoxicação | 14,4 |

    **A coluna da Magia não mudou nada** desde a 0.1.78 — os cinco números são idênticos. O que subiu foi
    o Deus da Espada, e ele sozinho é o 2,0×: sem ele, o teto do Corpo seria 40,8 contra 33,0, ou 1,2×,
    que é onde a conta estava. A pergunta, então, não é "o Corpo rende demais": é **se a Espada de Luz
    Verdadeira (7× o Dado de Arma em 2 Ações) é o pico declarado da árvore ou um número que escapou**. A
    árvore se vende como "o maior dano do livro", e o custo dela está em outro lugar (item 7: ~8% de
    sobrevivência no playtest).

    O que o motor NÃO pontua continua valendo como ressalva: a magia compra alcance, área e condição, e
    metade da coluna dela é de magias que afetam vários alvos.

11. **Cinco capstones que não compensam** *(medido em 2026-09-18)*. Uma técnica de rank alto que rende
    MENOS por Ação que a de um rank abaixo, na mesma árvore — quem chega lá destrava e não usa:

    | Árvore | Capstone | Rende | O rank abaixo fazia |
    | --- | --- | --- | --- |
    | Deus da Espada | Corte do Horizonte (Rei) | 35,2 | 61,6 (−43%) |
    | Deus do Norte | Aura Cortante (Rei) | 30,8 | 50,4 (−39%) |
    | Punho do Fogo | Punho da Condenação (Santo) | 30,4 | 48,4 (−37%) |
    | Armas Pesadas | Arremesso (Intermediário) | 23,2 | 32,8 (−29%) |
    | Magia de Fogo | Flashover (Rei) | 15,4 | 17,3 (−11%) |

    **Não mexi em nenhuma**, e de propósito: as três primeiras são de ÁREA ou linha, e o `check:progressao`
    mede dano num alvo só — o próprio script avisa que não reprova. Corrigir pelo número cegamente
    nivelaria por baixo justamente as técnicas que existem pra pegar vários. O que decide é a mesa: numa
    sessão, o Rei do Espada usou o Corte do Horizonte alguma vez, ou só a Espada de Luz?

    A exceção que talvez não seja de área: o **Golpe do Desespero** do Norte (Santo, 50,4/Ação) passa o
    Rei e o Imperador da própria árvore. Ele exige metade dos PV ou menos e cobra Exaustão — condições que
    o motor não pontua —, mas é a que mais parece número que escapou.

12. **A curva de dano das criaturas passou a de PV** *(reconferido em 2026-09-18: os números abaixo
    continuam exatos).* Dividindo os PV pelo dano do molde do mesmo
    patamar (`npm run check:sobrevivencia`), a sobrevivência cai do 1º ao 6º em todo pilar:

    | Vigor 0 | 1º | 2º | 3º | 4º | 5º | 6º |
    | --- | --- | --- | --- | --- | --- | --- |
    | Magia | 2,08 | 1,44 | 1,10 | 0,90 | 0,77 | **0,62** |
    | Utilidade | 2,27 | 1,65 | 1,27 | 1,05 | 0,91 | **0,75** |
    | Corpo | 2,67 | 2,06 | 1,66 | 1,37 | 1,19 | **0,97** |

    O molde cresce ×12 e o PV ×5,4. Se o combate de patamar alto acaba em dois turnos, o problema é o
    molde (Terror e Lenda); se o que mata é o foco num alvo só, é o PV do fim do livro.

13. **O Tiro Perfeito vale quatro Ações?** Remedido na 0.1.82: rende entre 48% e 67% do que os mesmos
    disparos comuns renderiam, estável em todos os patamares (antes decaía de 75% para 41%). O que falta é
    de mesa: a Preparação sobrevive a quem leva dano? Falhar uma etapa dói o bastante? A Etapa Encurtada
    virou obrigatória?

14. **O grupo de arma livre da criação é decisão ou imposto?** Numa sessão de criação: alguém hesitou?
    Alguém escolheu e nunca usou?

15. **O limiar de cura do simulador é chute.** A IA cura quem está na metade da vida ou abaixo; 50% não
    foi medido na mesa.

## Precisa de aparelho ou de pessoa *(Deliberadamente deixados de lado por ora)*

16. **Três caminhos no celular:** o link de ficha abre num iPhone antigo (iOS abaixo de 16.4)? O botão
    de compartilhar pela bandeja aparece? O PDF sai certo do celular? E, com o app instalado: o ícone e
    a splash saem certos, e a barra do topo foge do entalhe?

17. **Confirmar o PDF em produção** (binário do Typst na Vercel e retrato do personagem).

18. **Meia hora com leitor de tela (NVDA).** A ordem de foco conta a história certa? "Comprar" anuncia
    o que está comprando? Dá pra montar um personagem sem enxergar?

19. **A faixa do livro está em baixa resolução.** `public/faixas/livro.jpg` tem 680×384; as outras têm
    de 960 a 1900. Procurar outra imagem com 1600px ou mais.

## Site (depois do livro)

20. **Arte offline — metade resolvida** (0.1.92). *(Deliberadamente mantido como está)*. O buraco real era outro: `webm` e `mp4` não estavam na
    lista de extensões do service worker, então as SETE peças de arte em vídeo do livro (a Maestria da
    Água, a do Deus da Espada, o Canhão de Água, a Tempestade, o Pilar de Gelo, o Passo Vazio e a Leitura
    de Cena) não entravam no cache NEM DEPOIS DE VISTAS. Corrigido.

    O que sobra é a escolha antiga, e continua em aberto de propósito: imagens só entram no cache depois
    de vistas uma vez. Pré-carregar as 15 artes de maestria na instalação custaria ~6,7 MB de dados de
    celular por arte que talvez ninguém abra. Se alguém reparar na mesa, aí vale.

## Ideias para depois *(Priorização sugerida: não fazer, documentado como deixado de lado)*

- Sincronização em tempo real, pra jogar online.
- A criatura de 6º patamar do bestiário ("Ancião Demônio Esquecido").
- Reação e ação lendária de chefe fora do turno.
- Universidade de Ranoa como 4ª facção de Reputação.
- Magias inatas de raça (como o Howling da Raça Fera) como habilidade de verdade, não só texto.
- Simulador: Atolado, Desequilibrado, Marcado e Soterrado precisam de noção de distância; Invocação,
  Bardo, Tático e Barreira são invisíveis pra ele; e a IA não dá valor a condição.
- Tradução pra inglês.
