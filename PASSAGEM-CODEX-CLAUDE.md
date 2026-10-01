# Passagem Codex → Claude

Atualizado em **2026-09-30**. Este arquivo é o ponto de entrada para continuar em conjunto. Não substitui `CLAUDE.md`, `AGENTS.md` nem o texto do livro.

## Quem está em quê agora (2026-10-01)

O autor mandou "continue suas tarefas" para os dois ao mesmo tempo e deu **prioridade ao Claude** em
caso de choque.

- **Atualização, 17:45:** o Codex entregou a régua (`npm run medir:folhear`, `ee5a6f3`), descartou o
  diário experimental e parou. **O Claude assumiu a Tarefa 11** a partir daqui: `src/components/book/folhear/**`,
  `folhear.css`, `scripts/revisar-livro.mjs` e `scripts/medir-folhear.mjs` são do Claude agora.
  **Codex, se voltar:** pegue as pendências técnicas do simulador (itens 4 e 5 de "Pendências e limites"
  abaixo: dano misto tipado por parcela e a IA de combos), em `src/lib/combat*.ts`/`encounter*.ts`.
- ~~Codex: Tarefa 11~~ (ver acima).
- **Claude:** as "Pendências para o Claude" da Tarefa 10 (`RELATORIO-CODEX-COMPOSICAO.md`): cabeçalho da
  p. 64, partidas curtas, colunas curtas e manchas, **por conteúdo** (`src/components/book/Chapter*.tsx`,
  `Appendices.tsx`, `Diagramas.tsx`, `src/data/**`).
- **Atenção, Codex:** os commits de conteúdo do Claude mudam a assinatura da diagramação. Compare a
  assinatura sempre contra uma base tirada **no mesmo commit de conteúdo**; depois de cada merge de
  `origin/main`, tire a base de novo antes de medir.

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

Commits desta rodada: **`2bc481b`** (gelo, veneno, cântico e testes), **`df5dba9`** (lint), **`5f89bf9`** (BC explícito e variantes Concentradas) e **`57fa021`** (saída legível do balanceador). A documentação entra em commits separados. Ao concluir esta entrega, Codex libera os arquivos desta frente; não há tarefa de edição autônoma ou subagente em execução.

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
| BC não é bônus oculto: entra no dano somente se a fórmula escreve BC ou usa Dados de Arma. Impacto e parcela sustentada são lidos separadamente. | Fórmulas impressas das cartas; a conversão ficha → criatura já obedecia a essa leitura. | `somaBc`/`somaBcPorTurno` em `Acao`, usados por resolução e previsão. |
| Concentrada amplia cada grupo de dados, inclusive Inverter por Dose, bônus da Quebra contra Congelado e dano por turno. | `Chapter2.tsx`, §2: “dados de dano sobem 50% (arredondado pra cima, em cada grupo de dados)”. | A variante agora transforma `dano`, `inverteDose`, `bonusSeCongelado` e `danoPorTurno`. |

### Arquivos desta rodada

- `src/lib/combatSim.ts`: cálculo, estados, previsão e explicação de simplificações.
- `src/lib/combatReactions.ts`: cântico versus Aparar/Fluxo.
- `src/lib/combatAudit.test.ts`: 12 casos adicionais de regressão nesta rodada, incluindo BC explícito e três parcelas de Concentrada.
- `src/lib/encounterScenario.test.ts`: 2 casos de cântico com Fluxo/Aparar ilimitado.
- `src/lib/suporte.test.ts`: 2 casos de extração das cartas reais.
- `src/lib/fichaComoCriatura.ts`: documentação alinhada; a conversão e o motor agora obedecem à mesma fórmula.
- `scripts/balancear.mts`: usa um `localStorage` volátil só durante a medição. O roster real não é lido nem escrito, e milhares de avisos do Zustand deixaram de esconder a tabela.
- `src/data/patchNotes.ts`: nota 0.1.123, sem mudança de regra.
- `eslint.config.mjs`: ignora **somente `.claude/worktrees/**`** além dos ignores anteriores. Esses checkouts paralelos já são ignorados pelo Git; o lint da main não deve analisar cópias de fontes e builds de outro agente. Nenhum arquivo desses diretórios foi apagado ou editado.
- Esta passagem, o índice em `TAREFA-CODEX.md` e a atualização de `RELATORIO-CODEX-BALANCO.md`.

## Testes e verificações

- TypeScript: `npx tsc --noEmit -p .`, aprovado.
- Vitest após integrar a arena 2.5D: **852 testes / 58 arquivos**, aprovados; eram 832 antes desta rodada.
- `npx eslint src scripts` e **`npm run lint` completo**, aprovados após isolar os checkouts paralelos.
- `check:livro`: zero erros, dois avisos existentes (Cura com cinco passos no loop; tralha sem arte própria).
- `check:texto`: 632 habilidades/talentos, zero falhas/avisos.
- `check:termos`: 108 termos, zero falhas/avisos.
- `check:remissoes`: 421 remissões, zero falhas/avisos.
- Revisão visual desta rodada: **284 páginas / 1351 títulos**, zero títulos separados, estouros, arte quebrada/ampliada/cortada demais ou linha solta de tabela; 7 avisos de mancha vazia (páginas 35, 37, 69, 97, 115, 136 e 278). A medição anterior registrava 285 páginas, 9 avisos de mancha e 3 recortes. Não atribuí a diferença a uma correção de CSS: nenhum CSS mudou, e não foi feita comparação controlada de fontes/ambiente entre as duas execuções. A primeira tentativa desta rodada falhou porque o servidor 3020 não estava mais ativo; a porta foi conferida e um novo servidor foi iniciado, sem derrubar processo alheio.
- `check:mobile`: 16 rotas sem transbordo entre 320 e 414 px; `/livro` cabe nas oito combinações de 320/360/375/390 px e tema claro/escuro. Nenhum CSS foi alterado aqui.
- Balanceador: matriz completa com 300 batalhas por encontro/patamar; uma execução mínima adicional confirmou a saída sem avisos de armazenamento. O primeiro disparo dentro do isolamento falhou em `tsx` com `uv_os_get_passwd/ENOMEM`; as execuções fora dele concluíram normalmente.

## Medição atual — não comparar com históricos como se fosse a mesma versão

`npm run balancear -- --md`: 300 batalhas por encontro/patamar, semente 20260927, grupo Norte + Fogo + Cura + candidato, sem `PERFIL_FISICO` e sem excluir as cartas novas. Recorte do motor atual, vitória Difícil/Chefe (%):

| Árvore | 1º | 2º | 3º | 4º | 5º | 6º |
| --- | --- | --- | --- | --- | --- | --- |
| Água | 9/86 | 7/82 | 14/16 | 41/23 | 80/32 | 60/14 |
| Desintoxicação | 15/87 | 15/82 | 8/17 | 7/26 | 63/35 | 17/10 |

Esses resultados não são prova de nerf ou buff nas cartas: **as cartas não mudaram**. Corrigir dano antes inflado, testes indevidos e decisões da IA muda também a ordem dos sorteios. Não compensar automaticamente uma correção de instrumento aumentando os números do livro.

O cenário `PERFIL_FISICO=1` é experimental: golpes cortantes de 1 Ação com dano médio aproximado do molde dividido por três. O ataque especial de Reação do Chefe continua sem tipo. `SEM_NOVAS_DEFESAS=1` permite o controle sem Couraça/Refrão, mantendo o limite de compras. As tabelas físicas anteriores permanecem no relatório com sua versão histórica; não foram repetidas após esta última rodada.

## Pendências e limites para a próxima dupla de trabalho

1. **Não declarar o simulador completo.** Fórmulas livres da Teórica, mapa detalhado, silêncio/surdez, efeitos narrativos e várias cartas de controle sem dano ainda são aproximações ou ficam de fora.
2. **BC e variantes foram auditados.** O motor só soma BC explícito/Dados de Arma; a ficha convertida já seguia essa regra. Inverter, Quebra e dano por turno Concentrados têm testes com cartas reais. Se surgir outro campo de dano fora desses quatro, ele precisa entrar deliberadamente na transformação.
3. **A nova régua invalida comparações antigas.** `RELATORIO-CODEX-BALANCO.md` traz a matriz vigente das 19 árvores × 6 patamares. Não compensar as quedas aumentando cartas automaticamente: o que mudou foi o instrumento.
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

## Codex — Tarefa 10, composição do livro (2026-09-30)

Relatório completo: `RELATORIO-CODEX-COMPOSICAO.md`. Commits do Codex: `80a6a69`, `ecbab2e` e `64f516b`, integrados com o conteúdo do Claude pelo merge `75cc360`.

- `revisar:livro` ganhou `torre`, `partida-curta`, `coluna-curta` e `cabecalho-alto`; mede linhas reais de célula/cabeçalho e ignora o catálogo que já é cartão visual.
- A composição final mantém 285 páginas, zera torres e recortes fortes, reduz partidas curtas de 10 para 6 e colunas curtas de 5 para 2. O Claude reduziu cabeçalhos altos de 5 para 1 no mesmo intervalo.
- Tabelas-torre atravessam a página; tabelas quase cabendo compactam; três páginas de texto ganharam quebra balanceada. Fechos baixos mostram a arte inteira.
- O selo de pé entra apenas em vãos acima de 15%, maior e mais visível. As sete manchas continuam documentadas — uma saiu e outra apareceu depois do merge de conteúdo.
- Pendências editoriais exatas: cabeçalho da p. 64; partidas nas pp. 9, 10, 233, 240, 245 e 246; colunas curtas nas pp. 115 e 282. A tentativa de forçar uma terceira linha foi rejeitada porque criava páginas quase vazias.
- Validação final após o merge `75cc360`: TypeScript, lint e **881 testes / 62 arquivos** aprovados; checks de livro/texto/termos/remissões sem falhas; `check:mobile` aprovou as 16 rotas e as oito combinações específicas de `/livro`; papéis noite e dia repetiram 285 páginas, zero título separado, estouro, arte quebrada/borrada/recortada e torre.

Arquivos desta frente estão liberados depois da entrega. Os três arquivos não rastreados do autor continuam preservados.

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

## Claude — sons da arena (2026-09-30)

O autor trouxe 25 sons; eles moram em `public/sons/arena/` com nome curto (origem de cada um no cabeçalho de `src/lib/sonsDaArena.ts`). Som **desligado por padrão**, botão na arena, preferência em `localStorage` (`arena-som`).

- `src/lib/sonsDaArena.ts` (puro, testado): o que tocar por passo. `src/lib/tocadorDaArena.ts` (só navegador): tocar.
- `ConfiguracaoEncontro.vozes` (opcional): a voz do grito no crítico, escolhida no card de arma do grupo em `/encontros` (`VozDoPersonagem` em `EncounterBuilder.tsx`). A simulação não lê; fica fora da assinatura do relatório.
- `EncounterRewards.tsx`: "Sortear outros itens" toca moedas quando o som está ligado.
- `sonsDaArena.test.ts` trava as frases de buff do motor (`aponta … o primeiro acerto`, `inspira …:`, `antes da troca de golpes.`), como `passosDoReplay.test.ts` trava as de reação.

## Claude — Tarefas 8 e 9 concluídas (2026-09-30)

O Codex parou no meio da Tarefa 8 (commit local `96b2ecd` e um ajuste sem commit no `check-contraste.mjs`); o Claude subiu os dois e terminou as Tarefas 8 e 9. Resultado e inventário em `RELATORIO-CODEX-POLIMENTO.md`; o fechamento da ficha em `RELATORIO-CODEX-FICHA.md`.

- `check:contraste` 0 nas 64 combinações (16 rotas × 4 temas), `check:a11y` 0, `check:mobile` 0 px, `revisar:livro` sem regressão (as 7 manchas vazias seguem como pendência do autor).
- Tokens que mudaram e que outros arquivos leem: tema Livro (`globals.css`: `wine-600…900`, `gold-600…900`, `parchment-400/600`); papel do livro (`folhear.css`: cores de capítulo e de árvore no dia, tinta suave, e o livro sem `data-papel` passa a seguir o tema do site); `corDia` das árvores 56%.
- `data-cores-proprias`: quem pinta a si mesmo dentro do livro (hoje, o Laboratório de Fórmulas) fica fora da regra que faz o texto herdar a tinta do papel.
- `check-contraste.mjs` termina as animações antes de medir e aceita `ROTA=` e `LIMITE=`. No Git Bash, rode com `MSYS_NO_PATHCONV=1`, senão `ROTA=/ficha` vira um caminho do Windows.

## Claude — o contínuo do livro mais leve (2026-09-30)

O /livro no celular levava ~21 s pra responder (CPU 4× mais lenta, 390 px); agora ~2,5 s. Medida em `next build` + `next start`, não no `dev`.

- `folhear.css`, fim do bloco `.folhear-rolagem`: `content-visibility: auto` em `.livro-prosa`, `.livro-arvore-folhas`, `.livro-verbete` e `.livro-tabela` **só no contínuo**. O modo Livro não é tocado (a regra exige `.folhear-rolagem`); `revisar:livro` igual. Se uma regra nova do contínuo pintar fora da caixa dessas classes, a folga é `overflow-clip-margin: 1.5rem`; margem de filho não atravessa mais essas caixas.
- `Folhear.tsx`: saltos no contínuo passam por `rolarAte(el, suave)` (instantâneo quando longe, com vigia de 2,5 s que para ao toque/rolagem/tecla). Não use `scrollTo` direto pra levar o leitor a um elemento do contínuo: o destino escorrega.
- O `<aside>` do Índice não tem mais `stopPropagation`; o clique sobe até o `aoClicar` (no Livro, vira dupla; no contínuo, `rolarAte`) e fecha o painel. O fundo fecha só com clique nele mesmo.
- `scripts/lib/navegador.mjs` desliga a extração de página pra IA do Chrome (`--disable-features=AIPageContentAgent,…`): ela diagramava a página inteira e somava ~6 s falsos às medidas.

## Claude — pendências de conteúdo da Tarefa 10 (2026-10-01)

Commits `e3bfe57`, `e43af7b`, `0f88744` e a nota 0.1.128 (`263ebd8`). Revisão em 3010, papel noite:
285 páginas, zero título separado, estouro, arte quebrada/borrada/recortada, torre e **cabeçalho alto**.

| Pendência | O que foi feito |
| --- | --- |
| Cabeçalho da p. 64 | Na tabela dos títulos por patamar, o "e" anda colado à palavra seguinte (`\u00a0`): "Furtividade / e Armadilhas" em 2 linhas. |
| Buraco da p. 69 (não estava na lista, era o pior que vi) | Caixa indivisível da escada da Preparação + diagrama do Triângulo que não cabia sob a arte. A escada subiu; a Regra da Vantagem de Estilo virou texto corrido acima do diagrama. A sobra foi para o fim da seção (p. 75, antes da abertura do Fogo), onde vão é natural. |
| Partidas curtas (9, 10, 73, 233, 240, 245, 246) | **Não mexi.** Só a da p. 240 atravessa a página; as outras são a mesma tabela passando de uma coluna para a outra **na mesma página**, com o cabeçalho repetido, o que livro impresso faz sem problema. Sugestão pro `revisar-livro.mjs` (arquivo do Codex): só reprovar `partida-curta` quando a quebra muda de página. |
| Colunas curtas (115, 282) e manchas de fim de árvore (115, 136) | Não mexi: são o "Rank Deus + arte de fim" indo inteiros pra página seguinte, e os blocos do bestiário. Resolver por conteúdo seria encher linguiça. |

Incongruências achadas no caminho (corrigidas, nota 0.1.128): o Comece Aqui ainda dizia que o Dragão
não se escolhe (desde a 0.1.110 custa 3 PA); o passo 5 apontava o passo 1 para o custo do Antecedente;
o Cap. 2 dava a entender que nenhum Ritual silencia. Varri as outras mudanças de regra desde a 0.1.100
(PA por sessão, Dragão sem asas e sem forma, chefe 2,5×, Concentrada em alvo único): o livro está igual.

**Para o Codex, sobre a passada das caixas (`diagramacao.ts`):** a caixa "Regra da Vantagem de Estilo"
oscilava. Grande, ela se partia e deixava 2 linhas soltas no alto da página seguinte; 2 linhas menor,
virava indivisível e pulava inteira, deixando 35% da página vazios. Não há meio-termo: uma caixa que já
começou numa coluna poderia continuar na outra coluna **da mesma página** em vez de pular. Não mexi no
motor; tirei a caixa.

**Revisão em paralelo:** `navegador.mjs` usa a porta CDP 9333 por padrão. O Claude roda com
`PORTA_CDP=9343`; se o Codex rodar outra revisão ao mesmo tempo, use uma terceira porta.

## Claude — Tarefa 11, o diário da diagramação (2026-10-01)

Commits `706c52f` (diário), `963a6db` (palco com opacidade), `9e132ce` (`--escala` não herdada),
`a4cf6bf` (contêiner das folhas desde o começo). Números e o que falta: fim da Tarefa 11 em
`TAREFA-CODEX.md`.

- **Quem mexer numa passada da diagramação:** o diário guarda o estado final que as passadas deixam
  (atributos mexidos, lista final de filhos de cada pai mexido, a camada `.folhear-pes`). Passada nova
  que escreva em outra coisa — texto de nó, algo fora do fluxo além dos pés, estado em variável de
  módulo que a página lê depois — precisa entrar no diário, ou ele reabre o livro sem ela. Mexer em
  texto já é detectado (o diário não é gravado).
- **Mudou o livro?** A chave é a impressão do fluxo intocado (estrutura e texto): o diário velho deixa
  de valer sozinho. Pra testar a diagramação do zero no navegador, apague
  `localStorage["livro-folhear-diario:v2:2"]` (ou `:1`, uma página por vez), ou ponha
  `localStorage["livro-folhear-diario-desligado"] = "1"` (desliga todo diário; a revisão usa isso).
- **O diário vai com o livro:** `revisar:livro` regrava `public/livro/diagramacao-1.json` e `-2.json`;
  suba os dois junto com a mudança no livro (está no `AGENTS.md`). A chave tem a impressão do livro
  (texto, tags e classes) e a versão do motor (hash da diagramação e do CSS, `next.config.ts`):
  arquivo velho é ignorado sozinho, só deixa a primeira visita lenta.
- **Pedaço que muda sozinho** (texto que depende da ficha, da hora…) e não pesa na diagramação:
  `data-fora-do-diario` (hoje só a Oficina de Fórmulas embutida, que nem aparece no modo Livro).
- `medir:folhear` mostra no campo `diario` qual peça saiu do lugar quando a conferência reprova.
- **Não é reprovação do diário:** vídeo sem altura declarada muda alguns pixels de uma abertura pra
  outra (o da Maestria da Água); por isso a conferência olha só a coluna, como o `revisar:livro`.
