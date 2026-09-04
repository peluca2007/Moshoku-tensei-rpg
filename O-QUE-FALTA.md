# O que falta

Estado em 2026-09-04, depois da 0.1.12. O `PROGRESS.md` é o registro completo e o `PATCH_NOTES.md` é
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

6. **Jogar o Invocador e as três de Utilidade.** São as únicas mudanças de 0.1.12 que **não** saíram
   de medição — saíram de um pedido, e os números são meus:
   - A **Ordem Partilhada** é a que mais me preocupa: ela troca uma Ação sua por uma do invocado, e se
     o bicho bater mais forte que você a troca é sempre boa e o talento vira obrigatório.
   - As **3 Ações** do Chamado de Emergência são o turno inteiro. Ou é o preço certo por invocar sem
     preparo, ou ninguém usa nunca.
   - **Dissonância** e **Ordem de Tiro** foram inventadas pra que Bardo e Tático tivessem o que medir.
     Se não forem divertidas na mesa, o certo é trocá-las, não ajustá-las.

## Sistema de RPG

7. **Os 10 avisos que o `check:texto` deixa de pé.** Nenhum é contradição — são coisas que a prosa
   promete e a ficha não guarda:
   - **9 "dado só na prosa"**: dados que existem no texto e não em `damage.normal`, então nenhuma
     conta do projeto os enxerga. Conferidos um a um e todos legítimos (bônus condicional, dano de
     condição, cura, escalador de recurso) — mas o simulador não os vê.
   - **1 "PV parado por três patamares"**: Barreira e Proteção fica em `1d8+3` do Avançado ao Rei.
     Repetir por dois patamares é a cadência normal do livro; três são seis a oito PA sem o corpo
     crescer nenhuma vez.

8. **O "Calor" do Punho do Fogo não existe no código.** É a mecânica que define a árvore inteira —
   todo patamar sobe o teto (5 → 8 → 12 → 16 → 20 → 25) e quase toda técnica gasta ou ganha Calor —, e
   a ficha só conhece PV, PM, PT e PP. Hoje ele se joga no papel, à parte. É a maior dívida de dados.

9. **A leitura de intenção de quatro árvores.** O `check:texto` cobre CONTRADIÇÃO nas 597 habilidades,
   e Norte, Vendaval, Lutador, Arquearia e Punho do Fogo foram lidos de ponta a ponta. Faltam
   **Suishin, Escudos, Ladino e Tático** — e ali o que falta é o que nenhum script julga: se o efeito
   faz sentido, se a técnica é divertida, se o patamar entrega o que promete.

10. **O teto do Deus da Espada é 3× a coluna dele.** No 6º patamar entrega 336 contra os ~118 da
    régua. O teto ignora chance de acerto e Touki, então ficar acima é esperado — mas 3× é a maior
    folga da tabela, e vale conferir se a coluna ainda descreve a árvore que existe hoje.

## Site

11. **PWA / offline.** Mesa física num porão sem sinal é o caso de uso, e hoje o site morre sem
    internet. As fichas já vivem no `localStorage` — falta service worker e manifest. É a maior
    pendência funcional.

12. **A foto do personagem não entra na criação.** Ela existe na ficha, no roster e em `/encontros`,
    mas as três vias de `/criar` terminam sem perguntar por ela — que é justamente o momento em que a
    pessoa está pensando na cara do personagem.

13. **O retrato da criatura em `/encontros`.** O Mestre monta o monstro e não tem onde pôr a cara
    dele. A infraestrutura já existe inteira (`imagemDaFicha.ts`, o componente, o saneamento, o
    empacotador) — falta o campo no bestiário e a migração dele.

## Dívida documentada que continua de pé

14. **A ficha de criatura não exporta.** Vive só no `localStorage` do Mestre: não sai em arquivo, não
    entra no PDF e não cabe num link. Com o `.mtficha` pronto, o caminho está aberto — é o mesmo
    empacotador.

15. **As ações de criatura não modelam a condição que aplicam.** Preso, Caído, Molhado e veneno ficam
    na `nota`, como texto. Mesma dívida das `SIMPLIFICACOES` do motor.

16. **Não há Reação nem ação lendária de chefe fora do turno.** A rodada extra do chefe continua sendo
    a única economia de ação que o simulador conhece.
