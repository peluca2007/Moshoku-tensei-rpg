# Relatório Codex — o que sobrou do balanço pelo simulador

> Atualização de 2026-09-30: correções posteriores de Inverter, Quebra de Gelo, frio misto e Reações/cântico estão documentadas em `PASSAGEM-CODEX-CLAUDE.md`, junto de um recorte de medição atual. As tabelas abaixo são registros históricos das versões indicadas, não uma medição do motor mais recente.

Data: 2026-09-29. Comparação entre `13d35c5` (antes da Tarefa 7) e o motor final desta tarefa. Cada célula é **Difícil/Chefe, antes → depois**, em 300 batalhas, com a mesma semente `20260927`. O grupo é sempre Norte + Fogo + Cura + a árvore da linha.

## As 19 árvores nos 6 patamares

| Árvore | 1º | 2º | 3º | 4º | 5º | 6º |
| --- | --- | --- | --- | --- | --- | --- |
| Estilo Deus da Água | 77/99 → 77/99 | 74/100 → 74/100 | 81/88 → 81/88 | 68/85 → 68/85 | 94/88 → 94/88 | 90/79 → 90/79 |
| Estilo Deus da Espada | 76/99 → 76/99 | 86/99 → 86/99 | 74/91 → 74/92 | 71/95 → 71/95 | 96/99 → 96/99 | 94/99 → 94/99 |
| Cavalaria e Escudos | 63/98 → 63/98 | 63/99 → 63/99 | 63/72 → 63/74 | 53/61 → 53/61 | 83/73 → 83/73 | 84/52 → 84/52 |
| Arquearia | 63/98 → 63/98 | 61/99 → 61/99 | 54/70 → 54/71 | 47/69 → 47/69 | 87/77 → 87/77 | 94/75 → 94/75 |
| Punho do Fogo | 62/99 → 62/99 | 96/99 → 96/99 | 61/80 → 61/80 | 65/92 → 65/92 | 99/98 → 99/98 | 99/91 → 99/91 |
| Lutador | 53/98 → 53/98 | 71/99 → 71/99 | 93/87 → 93/87 | 83/77 → 83/77 | 89/92 → 89/92 | 83/88 → 83/88 |
| Estilo Deus do Norte | 49/98 → 49/98 | 53/98 → 53/98 | 41/62 → 41/63 | 48/69 → 48/69 | 97/81 → 97/81 | 90/79 → 90/79 |
| Furtividade e Armadilhas | 45/96 → 45/96 | 56/98 → 56/98 | 49/69 → 49/72 | 45/66 → 45/66 | 85/71 → 85/71 | 64/44 → 64/44 |
| Estilo Vendaval | 43/96 → 43/96 | 57/99 → 57/99 | 95/74 → 95/74 | 86/64 → 86/64 | 98/76 → 98/76 | 96/68 → 96/68 |
| Magia de Cura | 40/96 → 40/96 | 17/97 → 17/97 | 52/41 → 52/47 | 36/33 → 36/33 | 83/42 → 83/42 | 83/28 → 83/28 |
| Navegação e Liderança | 38/93 → 38/93 | 41/96 → 41/96 | 37/44 → 37/46 | 39/54 → 38/54 | 97/90 → 97/90 | 95/80 → 95/80 |
| Magia de Desintoxicação | 26/92 → 27/91 | 23/91 → 16/96 | 31/42 → 34/57 | 24/53 → 30/70 | 76/54 → 80/80 | 63/36 → 61/81 |
| Magia de Terra | 23/90 → 10/87 | 22/96 → 15/94 | 80/49 → 78/47 | 79/52 → 79/49 | 94/59 → 94/58 | 88/41 → 88/42 |
| Espíritos e Feras | 19/92 → 19/92 | 21/93 → 21/93 | 69/58 → 69/60 | 80/74 → 80/74 | 98/86 → 98/86 | 99/80 → 99/80 |
| Magia de Vento | 12/87 → 12/87 | 69/94 → 69/94 | 67/47 → 67/48 | 67/43 → 66/43 | 90/45 → 90/45 | 86/40 → 86/40 |
| Magia de Fogo | 12/86 → 12/86 | 15/94 → 15/94 | 73/53 → 73/56 | 72/51 → 71/51 | 93/60 → 93/60 | 96/52 → 96/52 |
| Magia Teórica | 11/86 → 11/86 | 11/93 → 11/93 | 19/38 → 19/41 | 21/47 → 21/47 | 68/44 → 68/44 | 51/32 → 51/32 |
| Magia de Água | 9/86 → 9/86 | 12/92 → 12/92 | 22/45 → 30/28 | 55/42 → 53/41 | 88/41 → 87/41 | 76/29 → 76/31 |
| Bardo e Interação | 7/76 → 10/82 | 15/87 → 18/91 | 29/25 → 33/32 | 26/25 → 26/31 | 80/27 → 77/28 | 67/16 → 67/15 |

Variações de 1–3 pontos são compatíveis com a mudança de decisões da IA e com a ordem dos sorteios; as diferenças grandes são o sinal útil. O classificador de compras também foi corrigido: três expressões de fronteira continham um caractere de controle no lugar de `\b`, então itens de combate podiam receber o peso errado. Isso explica sobretudo a mudança da Terra inicial; não houve nerf na árvore.

## O que o motor passou a enxergar

- **Água:** Molhado, Congelado e a cobrança da Quebra de Gelo agora são estados reais. A IA calcula o ciclo inteiro e só paga o preparo quando o dano esperado por Ação supera a melhor ação imediata. Forçar o ciclo sempre foi testado e piorou o Chefe do 3º patamar de 47% para 28%; por isso a decisão final é econômica, não ritual.
- **Desintoxicação:** cada ação lê separadamente Doses na falha e no sucesso; Sopro Podre aplica 2/1, Dose Certa acrescenta uma na falha por 5, a segunda Dose envenena, a terceira causa Colapso e Inverter cobra todas. O Chefe sobe de 42/53/54/36 para 57/70/80/81 do 3º ao 6º sem mudar uma linha do livro.
- **Bardo:** Inspiração é entregue ao melhor atacante, guardada até uma falha que o dado ainda pode salvar e creditada ao Bardo. O ganho existe no 1º–4º, mas é pequeno demais para resolver a árvore.
- **Teórica:** Parede de Emergência gasta PM e Reação, absorve até 15 de ataque físico e protege o próprio Teórico ou um aliado a até 3 m. Fórmulas livres, selos, preparação em giz e geometria continuam fora por dependerem de uma escolha de cenário que o balanceador não declara.
- **Sem regra fantasma:** todas essas mecânicas já estavam nas cartas. A 0.1.121 altera apenas o simulador e seus recibos.

## Magia inicial: PV ou escudo

Bancada separada com 200 batalhas. `PV` acrescentou, só para medir, +4 PV no 1º e +8 no 2º. `ESCUDO` aproximou uma casca de +10/+11 PV uma vez por combate. Não são propostas já aplicadas.

| Experimento | 1º patamar — Difícil das seis escolas | 2º patamar — Difícil das seis escolas |
| --- | --- | --- |
| Atual (mesmas 200 batalhas) | Fogo 11, Água 8, Terra 9, Vento 11, Teórica 10, Desintox 31 | Fogo 12, Água 11, Terra 12, Vento 68, Teórica 11, Desintox 17 |
| +PV | 14, 10, 14, 13, 12, 33 | 14, 14, 17, 73, 19, 21 |
| Escudo aproximado | 17, 14, 17, 17, 14, 36 | 14, 17, 17, 73, 19, 22 |

O escudo é melhor que o PV bruto, mas nenhum dos dois põe as cinco escolas frágeis perto das medianas de 68% e 76%. Sobrevivência ajuda; não é a causa inteira. Um escudo universal ainda apagaria identidade entre escolas. Não apliquei mudança de regra.

## Magia contra Chefe do 3º em diante

Também em 200 batalhas, medi +4 PV por patamar, +20 PM e +2 no atributo principal. Os sinais não apontam para um conserto universal:

- **+20 PM** ajuda muito Terra e Desintoxicação no 3º (67% e 83%), mas Água continua em 27%, Vento em 46% e Teórica em 52%. No 6º, Fogo vai a 67%, enquanto Água fica em 32% e Teórica em 32%.
- **+2 no atributo principal** é forte para Desintoxicação (74/84/88/93% contra Chefe do 3º ao 6º), moderado para Vento e quase nulo para Teórica e Água. É um buff desigual demais para regra geral.
- **+4 PV por patamar** melhora a sobrevivência e alguns resultados, mas o Chefe do 6º ainda deixa Fogo/Terra/Vento/Água/Teórica em 47/42/38/35/37%.

Diagnóstico: a diferença não é só PM, PV ou dano. Fogo e Terra já dominam o encontro de cinco e perdem eficiência no alvo único; isso é parte da troca área × alvo único. Água e Teórica ainda têm valor preso em cenário/preparo, e Desintoxicação passou a cobrar seu próprio motor. Não apliquei um bônus geral que aumentaria ainda mais o encontro em grupo.

## Bardo

Inspiração melhora os quatro primeiros patamares (Difícil/Chefe: 7/76 → 10/82, 15/87 → 18/91, 29/25 → 33/32, 26/25 → 26/31), mas o Bardo segue no fim. No 5º–6º, a luta acaba rápido demais ou o Bardo cai antes de multiplicar o grupo. Uma nova carta Principiante é mudança grande e precisa do autor.

## As antigas 16 `LISTADO`

O check atual encontra **23** cartas condicionais e **zero PENDENTE**. A lista cresceu porque o detector passou a reconhecer mais redações.

**MODELADO (13):** Vapor Seco (patamar em Vento); Relâmpago (Cumulonimbus ativa); Nova Congelante (patamar em Água); Explosão Silenciosa (patamar em Fogo); Prontidão (Reação/Ferida Fresca); Empunhadura Dupla (1×/turno); Túmulo de Aço (cenário declarado); Cruz Nebulosa (Empunhadura + três armas); Golpe do Desespero (metade dos PV + Exaustão); Esmagar (estado do alvo); Golpe de Escudo Soberano (Puro Escudo); Aguentar Soberano (Puro Escudo); Primeiro Golpe (abertura + 1×/combate).

**APROXIMADO (5):** Tempestade Cortante (três tiques, sem mapa); Investida Devastadora (+1 Ação para correr); Arremesso, Estrangular e Prensa (+1 Ação para agarrar e agarrão presumido).

**REVISADO, caso base deliberado (5):** Quebra de Gelo, Foice de Vácuo, Bala de Pedra, Canhão de Pedra e Golpe Baixo. O check não pede mais decisão técnica para nenhuma delas. A única decisão de produto é se as cinco aproximações são aceitáveis como instrumento; elas estão declaradas no recibo.

A régua do Deus do Norte no 3º patamar está em **41/63** no balanceador final, sem o antigo abuso do Golpe do Desespero. O dano da régua não voltou a ~50 contra ~34: a pendência foi encerrada pelo limiar de PV, Exaustão e pré-requisitos modelados na Tarefa 6.

## Continuação autorizada — 2026-09-29

O autor autorizou seguir as recomendações. Primeira etapa implementada **localmente**, ainda sem publicação:

- **Terra — Couraça de Barro, Principiante:** 1 PA, 2 PM e 1 Reação; reduz um ataque físico contra o próprio conjurador em 1d6 + BC, antes de Resistência. Não persiste, não cria cobertura e não funciona durante cântico. A carta contém exemplo numérico. Começamos por uma escola, conforme a recomendação; não distribuímos escudo universal.
- **Bardo — Refrão da Retomada, Principiante:** 1 PA, 1 PP e 1 Reação após outro aliado errar um ataque; um único d6 + patamar em Bardo concede PV Temporários a até três aliados conscientes que ouçam o Bardo, a até 9 m. Não empilha, não repete o ataque e não concede Ações. A proteção dura até ser consumida ou o combate acabar. A carta contém exemplo.
- O simulador cobra recursos, compra da carta e Reação; o Refrão só dispara depois de Inspiração/repetições. A Couraça não presume que dano sem tipo seja físico. Alcance é cobrado quando há posições; audibilidade e ausência de silêncio/surdez continuam premissas declaradas na lista de simplificações.
- Mantida a diferença entre área e alvo único; nenhum bônus universal de PV, PM ou atributo.

### Verificação e bloqueios da primeira tentativa (histórico)

- 57 arquivos de teste, **826 testes aprovados**, incluindo seis novos casos das cartas. TypeScript e ESLint em `src scripts` sem erros.
- `git diff --check` sem erros de espaço (somente avisos de normalização LF/CRLF).
- **Sem resultado novo de balanceamento.** A execução da bancada solicitou autorização adicional, mas o serviço de aprovação não conseguiu avaliá-la por limite de uso. Não foi executada; os números antigos abaixo não medem estas cartas.
- O balanceador aceita `SEM_NOVAS_DEFESAS=1` para comparar a compra antiga com a nova, mantendo o limite de quatro compras por patamar. A comparação precisa ser rodada com e sem essa variável, com os mesmos patamares, 300 batalhas e semente 20260927.
- **Revisão visual não concluída:** a porta 3020 já estava ocupada e o Chrome de verificação não abriu a porta de depuração. Nenhum servidor de outro agente foi encerrado. Não há contagem nova de páginas nem confirmação de ausência de estouros.
- **Sem commit/push nesta etapa.** Falta medir o efeito real, ajustar se necessário e concluir a revisão do livro antes de publicar. As demais escolas serão avaliadas uma por vez depois desta medição, não alteradas às cegas.

### Validação retomada — 2026-09-29

A autorização voltou a funcionar. A comparação descobriu e corrigiu um erro: a IA tratava defesas de Reação como escudos de Ação normal. Isso afetava também Parede de Emergência, por isso os controles abaixo foram medidos novamente **com a correção em ambos os lados**. Os resultados da tentativa anterior não devem ser usados para julgar as cartas.

300 batalhas por encontro e patamar; semente 20260927; quatro compras por patamar. Valores = vitória Difícil/Chefe, em %. Sem cartas novas → com cartas novas:

| Árvore | 1º | 2º | 3º | 4º | 5º | 6º |
| --- | --- | --- | --- | --- | --- | --- |
| Bardo | 10/82 → 48/94 | 15/83 → 48/91 | 18/17 → 27/33 | 16/20 → 24/25 | 71/20 → 75/28 | 60/8 → 61/11 |
| Terra | 10/87 → 10/87 | 15/89 → 15/89 | 68/31 → 68/31 | 76/44 → 76/44 | 92/47 → 92/47 | 85/31 → 85/31 |

**Leitura:** o Refrão melhora especialmente o começo, sem resolver o Bardo avançado. A bancada genérica não mede o benefício da Couraça: os ataques por orçamento não têm tipo de dano, portanto não ativam a carta. Não inventamos que todo dano seja físico para fabricar melhora. Testes separados usam ataques cortantes explícitos, verificam o acionamento da defesa e a igualdade entre simulação com e sem recibo; efeitos de resistência não a ativam. Próxima medição de Terra precisa de encontros com ações tipadas, não de mais PV artificiais.

Revisão do livro: **285 páginas, 1351 títulos; zero títulos separados, estouros, artes quebradas ou tabelas partidas com linha solta**. Persistem 9 avisos de mancha vazia e 3 de recorte de arte; não são corrigidos mexendo na diagramação de outro agente. `check:livro`: zero erros, dois avisos (loop da Cura e arte de tralha). Termos e remissões: zero falhas e zero avisos.

Não foram criadas outras regras: a prioridade continua sendo medir uma escola por vez e não compensar limitações do simulador com bônus universais. Os arquivos de loot, novos itens e plano do livro deixados pelo autor foram preservados.

**Entrega técnica:** 57 arquivos / **829 testes aprovados**, TypeScript e ESLint (`src scripts`) sem erros. Regras em `7d23e41`; integração, regressões e comparação controlada em `0261d56`. Sete casos novos cobrem custo, disponibilidade da Reação, alcance, falha real e proibição de lançar Reação como Ação; mais dois cobrem ataques físicos versus efeitos de resistência, sempre comparando com e sem log. A sincronização com `origin/main` não exigiu merge de conteúdo. O relato de bloqueio acima fica como histórico, não como situação atual.

Para reproduzir no PowerShell, na raiz do projeto:

```powershell
$env:BATALHAS = '300'
$env:PATAMARES = '1,2,3,4,5,6'
$env:SEM_NOVAS_DEFESAS = '1'
npm run balancear -- --md
Remove-Item Env:SEM_NOVAS_DEFESAS
npm run balancear -- --md
npx tsc --noEmit -p .
npx vitest run
npx eslint src scripts
npm run check:livro
npm run check:texto
npm run check:termos
npm run check:remissoes
$env:BASE = 'http://localhost:3020'
npm run revisar:livro -- --sem-fotos
npm run check:mobile
```

`check:texto` também passou: 632 habilidades/talentos, zero falhas e avisos. `check:sobrevivencia` não encontrou casos abaixo de um turno do molde; é um piso de PV, não prova de equilíbrio destas defesas. Os avisos de armazenamento do Zustand na bancada são do ambiente sem navegador; não representam alterações de ficha persistida.

`check:mobile` concluído com sucesso: 16 rotas em 320/360/414 px; livro em 320×800, 360×800, 375×812 e 390×844, nos dois temas. Zero tabelas com rolagem lateral e zero controles estruturais abaixo de 40 px; o verificador tolera o arredondamento de 1 px observado nas duas menores larguras. Persistem contagens informativas de alvos pequenos em outras telas e no texto corrido, sem reprovação do check. A revisão foi automatizada; não substitui testar com jogadores em aparelhos físicos.

### Segunda rodada — Couraça contra ataques físicos e Dose Certa

Foi acrescentado `PERFIL_FISICO=1` ao balanceador. Em vez do orçamento abstrato, cada criatura recebe um golpe cortante de 1 Ação com `1d6 + máximo(0, arredondar(danoPorTurno / 3 − 3,5))`. Três Ações permitem três golpes. Os demais atributos, papéis, quantidade, compras e semente são preservados. A Reação especial do Chefe continua usando o orçamento genérico sem tipo: não ativa Couraça. **É um cenário experimental explícito, não uma criatura oficial nem equivalência exata com o molde antigo.**

300 batalhas por encontro/patamar, semente 20260927; sem as duas cartas → com elas; vitória Difícil/Chefe em %:

| Árvore | 1º | 2º | 3º | 4º | 5º | 6º |
| --- | --- | --- | --- | --- | --- | --- |
| Terra | 10/89 → 11/95 | 11/94 → 16/96 | 76/60 → 78/59 | 84/70 → 84/64 | 94/78 → 96/78 | 88/47 → 95/56 |
| Bardo | 6/84 → 43/98 | 18/92 → 50/100 | 21/42 → 37/60 | 30/40 → 46/49 | 82/50 → 86/54 | 70/22 → 73/30 |

A bancada imprime se a Couraça foi comprada. Confirmado nos seis patamares, com 4/8/12/16/19/22 compras totais (até quatro por patamar, nunca concedida de graça). A sobrevivência média individual da Terra, agregando os dois encontros, passou de 39/47/53/61/76/56% para 51/53/56/61/81/68%. A carta ajuda a suportar ataques, mas competir por mana pode piorar o Chefe, como no 4º. Não alterei custos nem dados para perseguir uma taxa de vitória. Diferenças pequenas de poucos pontos não demonstram superioridade estatística; uma única semente e uma única família de inimigos não representam a mesa.

Também foi corrigida **Dose Certa**: a margem da resistência vinha do objeto de registro, então chamar o resolvedor sem recibo omitia a Dose adicional na falha por 5. Agora a margem pertence ao cálculo do combate. Três testes com falhas por 4, 5 e 6 verificam o mesmo dano, estados e quantidade de sorteios com e sem registro. Não mudou o texto nem a regra do livro. Os dois lados da bancada física acima usam esta correção.

Reprodução no PowerShell: use os comandos da seção anterior, acrescentando `$env:PERFIL_FISICO = '1'` antes das duas execuções. Depois, `Remove-Item Env:PERFIL_FISICO` volta à bancada abstrata. Não compare diretamente os percentuais de cenários diferentes.

Validação desta rodada: **832 testes em 57 arquivos**, TypeScript e ESLint sem erros; livro com **285 páginas e 1351 títulos**, sem estouro, título separado, arte quebrada ou linha solta de tabela. Permanecem os mesmos 9 avisos de mancha vazia e 3 de recorte. Nenhum capítulo, árvore, regra ou CSS do livro foi alterado nesta rodada.

## Decisões para o autor (histórico, recomendações autorizadas)

**Opções para a sobrevivência da magia no 1º–2º:**

1. **Recomendação — desenhar defesa própria por escola e medir uma escola por vez.** Preserva identidade; começar por uma Reação/casca onde a fantasia já comporta defesa, sem dar a mesma carta a seis árvores.
2. Escudo de mana universal: a melhor das duas hipóteses medidas, mas ainda longe da meta e homogeneíza as escolas.
3. Mais PV no Dado de Vida inicial: é simples, porém foi a hipótese mais fraca.
4. Não mudar regra agora e testar na mesa se o alvo aleatório do simulador superestima a exposição do mago.
5. **Outro:**

**Opções para o Bardo Principiante:**

1. **Recomendação — criar uma carta de Reação que converta uma falha de aliado em impulso coletivo curto.** Multiplica o grupo, dá decisão visível e não transforma o Bardo em atacante; precisa de texto e números aprovados antes de entrar.
2. Fortalecer Inspiração existente (mais usos ou dado maior): simples, mas concentra toda a árvore numa carta já obrigatória.
3. Dar dano direto à Dissonância cedo: melhora a planilha, mas trai a identidade pedida.
4. Não criar carta; aceitar que a árvore troca combate por cena social e retirar o Bardo da comparação de vitória.
5. **Outro:**

**Opções para magia contra Chefe:**

1. **Recomendação — manter a assimetria área/alvo único e corrigir apenas escolas específicas depois das duas decisões acima.** Nenhum recurso isolado resolveu todas, e buffs gerais pioram o encontro de cinco.
2. Dar +20 PM a todas as escolas: ajuda algumas bastante, outras quase nada.
3. Subir o atributo mágico efetivo: poderoso, mas desequilibra CDs e a Desintoxicação dispara.
4. Dar mais PV em todos os patamares: melhora sobrevivência, não resolve a falta de valor no alvo único.
5. **Outro:**

## Ficou de fora

- Fórmulas livres da Teórica, terreno, preparação anterior ao encontro e posicionamento preciso.
- A terceira Dose por ações sem dano, como Torpor, porque o balanceador só transforma cartas ofensivas com fórmula de dano em ações; a regra de Colapso já existe no estado.
- Uma carta nova de Bardo e qualquer alteração de PV/PM/atributo: são decisões do autor, não correções do motor.
