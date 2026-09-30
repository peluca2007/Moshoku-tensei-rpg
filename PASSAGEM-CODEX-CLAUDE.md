# Passagem Codex → Claude

Atualizado em **2026-09-30**. Este arquivo é o ponto de entrada para continuar em conjunto. Não substitui `CLAUDE.md`, `AGENTS.md` nem o texto do livro.

## Escopo e divisão sugerida

- O autor autorizou seguir as recomendações do relatório, continuar as correções e documentar o trabalho para o Claude.
- Codex trabalhou em fidelidade do simulador, verificações automáticas e duas cartas autorizadas. Não alterou o CSS do modo folhear nesta sequência.
- Claude pode continuar a revisão editorial/diagramação. Antes de editar o motor ou as duas cartas abaixo, confira os commits desta passagem e o `git status`: o checkout é compartilhado, sem isolamento entre editores.
- Fluxo: commits pequenos em português na `main`; buscar e fazer merge de `origin/main`, nunca rebase. Servidor Codex: **3020**. Não encerrar servidores de outro agente.
- Preservados, sem edição ou inclusão em commit: `NOVOS_ITENS.md`, `PLANO-LIVRO-PERFEITO.md`, `SISTEMA_DE_LOOT.md`. São arquivos não rastreados do autor, não lixo.

## O que já estava publicado antes desta rodada

| Commit | Entrega |
| --- | --- |
| `7d23e41` | Couraça de Barro e Refrão da Retomada no Principiante; nota 0.1.122. |
| `0261d56` | Integração das cartas no simulador; Reações deixam de ser escolhidas como escudos de Ação normal. |
| `700b2de` | Comparação controlada, validações e limites das medições. |
| `534493f` | Dose Certa calcula a margem da resistência independentemente do recibo. |
| `e755cb7` | Cenário físico experimental no balanceador e resultados documentados. |

Histórico anterior: tarefas 1–7 em `TAREFA-CODEX.md`; relatórios `RELATORIO-CODEX-TERMOS.md`, `RELATORIO-CODEX-FICHA.md`, `RELATORIO-CODEX-ESTETICA.md`, `RELATORIO-CODEX-SIMULADOR.md` e `RELATORIO-CODEX-BALANCO.md`. Não é necessário refazer essas entregas.

### As duas regras novas autorizadas

- **Couraça de Barro**, `src/data/trees/terra.ts`: 1 PA, 2 PM, 1 Reação. Reduz um ataque contundente/cortante/perfurante contra o próprio conjurador em 1d6 + BC, antes de Resistência; desfaz-se no golpe. Não funciona durante cântico. Não concede PV permanentes nem cobertura.
- **Refrão da Retomada**, `src/data/trees/bardo.ts`: 1 PA, 1 PP, 1 Reação depois de outro aliado errar um ataque, após Inspiração/repetições. Até três aliados conscientes que ouçam o Bardo, a até 9 m, recebem um único resultado de 1d6 + patamar em Bardo em PV Temporários. Não empilha; dura até ser consumido ou terminar o combate. Não concede ações nem converte a falha em acerto.
- As cartas têm exemplos. O motor presume audibilidade/ausência de silêncio e surdez, e presume alcance quando o cenário não fornece posições. Isso está exposto em `SIMPLIFICACOES`.
- Não houve bônus universal de PV, PM ou atributo, nem tentativa de igualar dano de área e alvo único.

## Rodada atual: fidelidade às regras existentes

Commits desta rodada: **`2bc481b`** (motor, testes e nota 0.1.123) e **`df5dba9`** (lint). A documentação entra em commit separado, imediatamente depois deles. Ao concluir esta entrega, Codex libera os arquivos desta frente; não há tarefa de edição autônoma ou subagente em execução.

Nenhuma carta foi rebalanceada nesta rodada. A nota **0.1.123**, de 2026-09-30, descreve correções do motor.

| Correção | Regra-fonte | Implementação |
| --- | --- | --- |
| Inverter não pede resistência nem soma BC: só os dados por Dose; consome as Doses. | `src/data/trees/desintoxicacao.ts`, texto compartilhado de Inverter e cartas Purgar/Purga Profunda/Anular. | `resolver` e `danoEsperado`, em `combatSim.ts`. |
| Quebra de Gelo contra Congelado não rola d20, não gera crítico e consome Congelado. | `src/data/trees/agua.ts`, Quebra de Gelo. | Resolução, recibo e previsão da IA. |
| Molhado dobra somente a parcela fria identificada em ataques mistos, incluindo os dados frios adicionais de Quebra. Não dobra a parte física nem seu BC. | Cartas de Água e interação Molhado/frio. | `indicesDeFrio`, resolução e estimativa. Reaproveita resultados rolados, sem sortear a dobra de novo. |
| Resistir ao frio estando Molhado usa Desvantagem; a estimativa também considera Desvantagem por Envenenado. | Interação de Água e condições do livro. | Ramo de resistência. Arredondamento da metade ocorre após compor a dobra. |
| Nova Congelante não recebe outra dobra por Molhado. | `src/data/trees/vento.ts`: “já contando a duplicação”. | Campo `frioJaDobrado`, extraído da carta e preservado nas variantes. |
| Previsão de resistência permite 0%/100%, sem impor o piso/teto de ataque. | Resistência compara total com CD; o resolvedor já fazia isso. | Apenas cálculo de probabilidade na IA. |
| Gastar Reação encerra cântico, inclusive reação extra e Aparar ilimitado. Não devolve mana por interrupção voluntária. Fluxo não ataca enquanto recita. | `Chapter2.tsx`, Conjurando: usar Reação encerra a conjuração; restituição parcial pertence à falha de Concentração por dano. | `consumirReacao` e `combatReactions.ts`. Reação indisponível não cancela nada. |

### Arquivos desta rodada

- `src/lib/combatSim.ts`: cálculo, estados, previsão e explicação de simplificações.
- `src/lib/combatReactions.ts`: cântico versus Aparar/Fluxo.
- `src/lib/combatAudit.test.ts`: 10 casos adicionais de regressão nesta rodada.
- `src/lib/encounterScenario.test.ts`: 2 casos de cântico com Fluxo/Aparar ilimitado.
- `src/lib/suporte.test.ts`: 2 casos de extração das cartas reais.
- `src/data/patchNotes.ts`: nota 0.1.123, sem mudança de regra.
- `eslint.config.mjs`: ignora **somente `.claude/worktrees/**`** além dos ignores anteriores. Esses checkouts paralelos já são ignorados pelo Git; o lint da main não deve analisar cópias de fontes e builds de outro agente. Nenhum arquivo desses diretórios foi apagado ou editado.
- Esta passagem, o índice em `TAREFA-CODEX.md` e a atualização de `RELATORIO-CODEX-BALANCO.md`.

## Testes e verificações

- TypeScript: `npx tsc --noEmit -p .`, aprovado.
- Vitest: **846 testes / 57 arquivos**, aprovados; eram 832 antes desta rodada.
- `npx eslint src scripts` e **`npm run lint` completo**, aprovados após isolar os checkouts paralelos.
- `check:livro`: zero erros, dois avisos existentes (Cura com cinco passos no loop; tralha sem arte própria).
- `check:texto`: 632 habilidades/talentos, zero falhas/avisos.
- `check:termos`: 108 termos, zero falhas/avisos.
- `check:remissoes`: 421 remissões, zero falhas/avisos.
- Revisão visual desta rodada: **284 páginas / 1351 títulos**, zero títulos separados, estouros, arte quebrada/ampliada/cortada demais ou linha solta de tabela; 7 avisos de mancha vazia (páginas 35, 37, 69, 97, 115, 136 e 278). A medição anterior registrava 285 páginas, 9 avisos de mancha e 3 recortes. Não atribuí a diferença a uma correção de CSS: nenhum CSS mudou, e não foi feita comparação controlada de fontes/ambiente entre as duas execuções. A primeira tentativa desta rodada falhou porque o servidor 3020 não estava mais ativo; a porta foi conferida e um novo servidor foi iniciado, sem derrubar processo alheio.
- `check:mobile` não foi repetido nesta rodada de motor. A execução anterior passou em 16 rotas e oito combinações de tamanho/tema do livro; detalhes no relatório de balanço. Nenhum CSS foi alterado aqui.

## Medição atual — não comparar com históricos como se fosse a mesma versão

`npm run balancear -- --md`: 300 batalhas por encontro/patamar, semente 20260927, grupo Norte + Fogo + Cura + candidato, sem `PERFIL_FISICO` e sem excluir as cartas novas. Recorte do motor atual, vitória Difícil/Chefe (%):

| Árvore | 1º | 2º | 3º | 4º | 5º | 6º |
| --- | --- | --- | --- | --- | --- | --- |
| Água | 9/86 | 11/85 | 14/15 | 39/30 | 82/32 | 69/23 |
| Desintoxicação | 28/92 | 25/89 | 17/51 | 19/62 | 74/77 | 64/77 |

Esses resultados não são prova de nerf ou buff nas cartas: **as cartas não mudaram**. Corrigir dano antes inflado, testes indevidos e decisões da IA muda também a ordem dos sorteios. Não compensar automaticamente uma correção de instrumento aumentando os números do livro.

O cenário `PERFIL_FISICO=1` é experimental: golpes cortantes de 1 Ação com dano médio aproximado do molde dividido por três. O ataque especial de Reação do Chefe continua sem tipo. `SEM_NOVAS_DEFESAS=1` permite o controle sem Couraça/Refrão, mantendo o limite de compras. As tabelas físicas anteriores permanecem no relatório com sua versão histórica; não foram repetidas após esta última rodada.

## Pendências e limites para a próxima dupla de trabalho

1. **Não declarar o simulador completo.** Fórmulas livres da Teórica, mapa detalhado, silêncio/surdez, efeitos narrativos e várias cartas de controle sem dano ainda são aproximações ou ficam de fora.
2. **Auditar o BC implícito.** Fora de Inverter, o motor ainda usa BC como bônus padrão para habilidades; cartas de dano puro sem “+ BC” merecem uma revisão separada, com testes por carta. Esta rodada não resolve essa questão inteira.
3. **Auditar variantes e conversões.** Conferir Inverter Concentrada, dados condicionais de Quebra Concentrada e a conversão ficha → criatura. Não presumir que corrigir `resolver` conserta automaticamente cada caminho paralelo.
4. **Dano misto ainda não está integralmente tipado.** A dobra de frio foi corrigida; resistência/imunidade por parcela, dano sustentado e ações legadas sem marcação precisam de auditoria própria. Ação legada sem parcelas frias identificadas mantém o fallback de frio integral, explicitado na interface.
5. **IA de combos ainda é heurística.** Rever chance de conseguir congelar/aplicar Doses e custo total de PM do plano, em vez de tratar o preparo como garantido. Não medir só a carta isolada.
6. **Balanço de produto:** magia inicial e Bardo avançado continuam abaixo de várias referências; a Couraça teve benefício moderado no cenário físico. Não criar escudo universal nem alterar a troca área/alvo único sem nova evidência.
7. **Diagramação:** avisos históricos de mancha vazia e recorte de arte pertencem à revisão editorial/visual; nenhuma regra de folhear foi tocada por Codex nesta sequência.
8. **Aviso de compilação a conferir no folhear:** o servidor emitiu aviso de parser para `::highlight(busca-livro-atual)` em `src/app/livro/folhear/folhear.css:3692`. A página respondeu 200 e passou no verificador. Não troquei por `:highlight`: a sugestão automática do parser não comprova que essa troca seja válida. Claude pode verificar compatibilidade do transformador CSS e o realce da busca no navegador.

## Como continuar sem conflito

1. Ler este arquivo e `git status -sb`; buscar `origin/main` e integrar com merge antes de começar.
2. Claude pode priorizar texto/diagramação e validação das intenções das cartas; Codex pode pegar os itens técnicos acima, um assunto por commit. É divisão sugerida, não um agente já trabalhando em segundo plano.
3. Se houver mudanças locais alheias, preservá-las; não usar reset, checkout destrutivo ou limpeza de diretórios.
4. Rodar TypeScript, Vitest e lint; para qualquer mudança no livro, também os checks e a revisão de páginas em 3020.
5. Atualizar esta passagem com a frente escolhida, alterações, comandos/resultados e limitações. Não marcar como concluído aquilo que só ganhou um teste sintético ou uma hipótese.

Nenhuma mensagem foi enviada automaticamente ao Claude. A coordenação entregue aqui é o documento compartilhado no repositório.

O servidor iniciado para esta validação foi deixado em execução na porta **3020**. Antes de iniciar outro nessa porta, confirme qual processo a ocupa; não assuma que ela está livre.

## Claude — arena 2.5D do `/encontros` (2026-09-30)

Frente escolhida: **visualização das batalhas**, a pedido do autor. Nenhuma regra, carta ou número do livro mudou; a arena só toca o que a simulação já fez.

| Commit | Entrega |
| --- | --- |
| `84e9245` | `replayBatalha` grava um quadro por linha do log (PV, queda e posição de cada ator) em `LogCombate.replay`; nova `ArenaDoReplay` com standees das fotos da ficha, capa de fundo, investida, tremor, número de dano e tombo. Profundidade = linha de combate, sem grid. |
| `a73805e` | Criatura pronta do Apêndice G entra no encontro com `portrait` (a dica da tela já prometia). |
| `5fc083a` | `EventoAtaque.tipoDeDano`, gravado em `aplicarDano` (**uma linha em `combatSim.ts`, sem mudar cálculo**); a arena escolhe o efeito visual por ele. |
| `617e81b` | Botão "Assistir uma batalha nova": uma batalha com semente aleatória, mesmo instantâneo do relatório, direto na tela (sem worker). |

Toques no motor, para quem mexer em `encounterSim.ts`: `CombateLogger.aoRegistrar` é chamado depois de cada `log`; `gravarReplay` lê as listas vivas de heróis e inimigos. Se um caminho novo alterar PV sem passar por uma linha de log, a arena só mostra a mudança na linha seguinte.

Testes: `src/lib/replayDoCombate.test.ts` (4 casos). Suíte: 850 aprovados; `tsc` e `eslint` limpos nos arquivos tocados. Verificação visual em 3010, celular e desktop. Limites conhecidos: ataque em área faz uma investida por alvo; efeito por elemento é heurística de texto (tipo declarado primeiro, nome da ação depois).
