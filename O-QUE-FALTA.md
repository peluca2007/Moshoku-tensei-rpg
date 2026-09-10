# O que falta

Estado em 2026-09-10, depois da 0.1.37. O `PROGRESS.md` é o registro completo e o `PATCH_NOTES.md` é
o histórico; aqui fica **só o que ainda não foi feito**, na ordem em que eu faria.

## Precisa de você (não dá pra fazer sozinho)

1. **A faixa do livro está em baixa resolução.** `public/faixas/livro.jpg` tem 680×384 e é a menor das
   oito — as outras estão entre 960 e 1900. Reprocurar `open grimoire spellbook candlelight` filtrando
   por 1600px+; ampliar os 680 não cria detalhe, só borra.

2. **Testar em celular de verdade.** `npm run check:mobile` garante que nada transborda entre 320 e
   414px, e é só isso que ele sabe. Falta dedo em tela: rolagem com inércia, teclado virtual cobrindo
   campo, e a pergunta que nenhum script responde — dá pra usar a ficha com uma mão só numa mesa
   cheia?

3. **Confirmar o PDF em produção.** O fix de `outputFileTracingIncludes` (binário do Typst na Vercel)
   só é verificável no próximo deploy, e "exportável em PDF pra levar pra mesa" está escrito na
   landing. O PDF agora também imprime o retrato do personagem — mais uma coisa pra conferir lá.

4. **Validar a Distância Roubada na mesa** (Vendaval). A pergunta não é "18 metros é demais": é **o
   Vendaval alguma vez apanha?** Ele desengaja de graça uma vez por turno e bate de 10,5 a 18m
   mantendo o ataque como corpo a corpo. Se o inimigo nunca revida, o custo declarado da árvore nunca
   é cobrado. Mede-se numa sessão: conte os ataques corpo a corpo que ACERTARAM o Vendaval e compare
   com o outro da linha de frente. A conta está no cabeçalho de `src/data/trees/vendaval.ts`.

5. **Teste com leitor de tela.** O `check:a11y` cobre a camada estrutural. Falta saber se a ficha é
   *usável* de ouvido: se a ordem de foco conta a história certa, se "Comprar" anuncia o que está
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

7. **Jogar as quatro árvores mexidas na 0.1.14** — Tático, Barreira, Desintoxicação e Punho do Fogo.
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

8. **Duas perguntas de balanceamento que a 0.1.35 abriu** *(os números abaixo são os da 0.1.35; com a
   cura no motor, na 0.1.37, a Mara marcou 91 e 92% e a Iri 27 e 57% — as duas perguntas continuam
   valendo, e a da Mara ficou mais forte: ela lidera a sobrevivência do playtest inteiro)*. O simulador foi consertado em dois pontos
   (a CA não era consultada por técnica nenhuma; a IA não contava os Dados de Arma ao escolher), e o
   playtest mudou de dono. Duas linhas agora precisam do seu julgamento — o script mede, ele não
   decide:
   - **A Mara é a maior causadora de dano do jogo.** Cavalaria e Escudos está descrita como *"protege,
     não mata"* e terminou o playtest com 95 de dano por batalha e 93% de sobrevivência — à frente do
     Deus da Espada em dano E em sobrevivência. Ou a descrição está errada, ou o Golpe de Escudo
     Soberano está.
   - **O Vento desabou de 53 pra 19.** As técnicas da Iri custam **duas Ações**, e a conta certa
     mostra que duas Ações quase nunca compensam contra três golpes de uma. Isso não é um problema da
     Iri: é uma pergunta sobre o custo de 2 Ações no sistema inteiro. Se nenhuma técnica de 2 Ações
     compensa, ou elas estão fracas ou a economia de 3 Ações por turno precisa de outra coisa.

9. **O penhasco entre o 4º e o 5º patamar de chefe.** O playtest bate no molde de chefe do Apêndice G
   e devolve **95% de vitória contra o 4º (Elite) e 0% contra o 5º (Terror)** — o mesmo grupo, um
   degrau de diferença. Ou o salto é intencional (o 5º patamar é pra quem já é de 5º patamar) ou há um
   buraco na régua do Apêndice G. O script mede; quem decide qual das duas é você. Enquanto isso, um
   Mestre que ler a tabela vai concluir que o Terror é imbatível.

10. **A cura tem limiar, e o limiar é meu.** A IA cura quem estiver na metade ou abaixo — 50% é um
    número declarado no motor, não medido na mesa. Se numa sessão o curandeiro age mais cedo (ou mais
    tarde) que isso, o número certo é outro e todos os relatórios se movem junto. É a única regra de
    decisão do simulador que veio de mim e não do livro.

## Site

11. **Instalar o app num celular de verdade.** A 0.1.15 fez o site funcionar sem internet, e o
    `check:offline` prova a parte que dá pra provar: as 19 rotas abrem com o servidor morto, em F5 e
    em navegação suave, num Chrome headless. O que nenhum script responde é o resto do caminho —
    "Adicionar à tela de início" aparece? o ícone sai certo recortado pelo launcher? a splash é a
    nossa? e, no iPhone, o Safari respeita alguma coisa disso? São dez minutos com um aparelho na mão,
    um Android e um iPhone.

12. **O que o pré-cache NÃO cobre, e se isso incomoda.** O worker guarda o HTML de cada rota mais
    tudo que esse HTML cita. Imagem que só o JavaScript pede depois — retrato de raça na criação, arte
    de criatura no `/encontros` — entra no cache na primeira vez que é VISTA, e não antes. Quem
    preparou o personagem em casa não perde nada; quem abre a roleta pela primeira vez já no porão vê
    moldura vazia no lugar dos retratos.

    Fechar isso exigiria uma lista de todos os arquivos de `public/`, mantida à mão ou gerada por mais
    um passo de build — uma lista que envelhece calada, e cujo sintoma é exatamente o que ela deveria
    evitar. Antes de pagar esse preço, vale medir se alguém repara.

## Acertado com o autor, ainda não feito

Acabaram. Os quatro daquele levantamento de 2026-09-09 saíram: alvos de toque na 0.1.16, busca
global na 0.1.17, telas de 404 e de erro na 0.1.18, e os testes do `rollEngine` mais o macro de Teste
nas 0.1.20/0.1.21. O mapa maior — vinte frentes levantadas em 2026-09-10 — vive em
[`TAREFAS.md`](TAREFAS.md).

*Nada — o último item combinado (testes do `rollEngine` e macro de Teste) saiu nas 0.1.20/0.1.21.*
O mapa das frentes abertas agora é o [`TAREFAS.md`](TAREFAS.md).

## Correções de registro — fechadas em 2026-09-10

- O `PROGRESS.md` listava no backlog *"Rank Deus / caminho de ascensão do Estilo Vendaval — a única
  árvore sem esse quadro"*. **Estava errado**, e a correção que escrevi aqui em 2026-09-09 também
  estava incompleta: ela dizia que Espada, Água e Norte não têm o quadro "de propósito", o que fez
  parecer que o critério delas não estava escrito em lugar nenhum.

  **Está escrito.** As três têm entradas inteiras em `GODHOOD_PATH` (`src/data/rankDeus.ts`), com as
  chaves batendo com os ids das árvores, e o livro as imprime desde sempre — "E o Deus da Espada?",
  "O Caminho para Deusa da Água", "O Estilo mais Barato de Ser Rei". O que elas não têm é o *quadro*
  do que o patamar FAZ, porque nelas o Deus é um cargo com titular vivo, e não um nível de poder.

  Duas afirmações erradas sobre a mesma coisa em dois dias têm a mesma causa: a informação mora em
  dois mapas e só o acessor os une, então dava pra abrir o arquivo e não ver. Agora
  `src/data/rankDeus.test.ts` responde a pergunta por execução — nenhuma das dezenove árvores pode
  ficar sem patamar Divino escrito sem reprovar o teste.
