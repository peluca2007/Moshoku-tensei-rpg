# O que falta

Estado em 2026-09-10, depois da 0.1.17. O `PROGRESS.md` é o registro completo e o `PATCH_NOTES.md` é
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

## Site

8. **Instalar o app num celular de verdade.** A 0.1.15 fez o site funcionar sem internet, e o
   `check:offline` prova a parte que dá pra provar: as 16 rotas abrem com o servidor morto, em F5 e
   em navegação suave, num Chrome headless. O que nenhum script responde é o resto do caminho —
   "Adicionar à tela de início" aparece? o ícone sai certo recortado pelo launcher? a splash é a
   nossa? e, no iPhone, o Safari respeita alguma coisa disso? São dez minutos com um aparelho na mão,
   um Android e um iPhone.

9. **O que o pré-cache NÃO cobre, e se isso incomoda.** O worker guarda o HTML de cada rota mais
   tudo que esse HTML cita. Imagem que só o JavaScript pede depois — retrato de raça na criação, arte
   de criatura no `/encontros` — entra no cache na primeira vez que é VISTA, e não antes. Quem
   preparou o personagem em casa não perde nada; quem abre a roleta pela primeira vez já no porão vê
   moldura vazia no lugar dos retratos.

   Fechar isso exigiria uma lista de todos os arquivos de `public/`, mantida à mão ou gerada por mais
   um passo de build — uma lista que envelhece calada, e cujo sintoma é exatamente o que ela deveria
   evitar. Antes de pagar esse preço, vale medir se alguém repara.

## Acertado com o autor, ainda não feito

Estes dois saíram de um levantamento de 2026-09-09 e foram **escolhidos por ele**. Dos outros dois
daquele levantamento, os alvos de toque viraram a 0.1.16 e a busca global virou a 0.1.17. Estão aqui
com o contexto todo porque quem retomar não vai ter a conversa, só o arquivo.

10. **`not-found.tsx` e `error.tsx`.** Não existe nenhum dos dois em `src/app/`. Duas consequências,
    e a primeira é literal: `curl /rota-que-nao-existe` devolve hoje
    *"404: This page could not be found."* — **em inglês**, num site `lang="pt-BR"`, e com dois
    `<title>` no mesmo documento.

    A segunda é que um erro de runtime em qualquer componente cai na tela padrão do framework. Isso
    ficou pior depois da 0.1.15: offline, essa tela é indistinguível de "faltou rede", e o usuário não
    tem como saber se perdeu a ficha. O `error.tsx` deveria dizer o que é erro e o que é falta de
    sinal, e afirmar que as fichas continuam no aparelho — é o que a `/offline` já faz, e ela serve de
    modelo de tom e de layout.

11. **Testes do `rollEngine` e macro de Teste.** Duas coisas no mesmo lugar.

    O `src/lib/rollEngine.ts` **não tem teste nenhum** — `rollD20` com os cinco modos de vantagem, e o
    parser de `rollFormula`. É o código que decide toda rolagem da mesa, e o `selectors.ts` ao lado
    tem 570 linhas de teste travando as fórmulas. A régua do projeto não está sendo aplicada nele.
    Testar rolagem exige injetar o aleatório ou fixar semente; hoje `dice.ts` sorteia direto.

    E o macro só sabe dano: `RollMacro` é `{ id, label, formula }` (`store/useMacroStore.ts`), então
    não dá pra salvar "Teste de Furtividade com Vantagem" — metade do que se repete numa sessão. Já
    estava no backlog do `PROGRESS.md`. Mexer no formato salvo pede migração: a store é persistida
    (`version: 1`), e ficha salva nunca é resetada é a terceira regra da base de código.

## Correções pendentes de registro

- O `PROGRESS.md` lista no backlog *"Rank Deus / caminho de ascensão do Estilo Vendaval — a única
  árvore sem esse quadro"*. **Está errado:** o Vendaval tem o quadro ("O Passo Que Não Termina", 5
  parágrafos, em `src/data/rankDeus.ts`). As únicas três sem ele são Espada, Água e Norte, e o próprio
  cabeçalho do arquivo documenta que é de propósito — as Três Grandes Escolas do Corpo têm critério
  próprio de ascensão no lugar do quadro. Se sobrou alguma pendência ali, ela precisa ser reescrita,
  porque a justificativa atual não vale mais.
