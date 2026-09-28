# Relatório Codex — Tático, Bardo e invocados no simulador

Data: 2026-09-28. Linha de base comparável: `9d421d6` (já inclui os moldes de criatura 0.1.118, mas não a Tarefa 6). Depois: Tarefa 6 sobre os mesmos moldes.

## O que o motor passou a fazer

### Navegação e Liderança

- **Ordem de Tiro / Apontado:** o Tático aponta antes de o grupo atacar; o primeiro acerto recebe `+1d6` por patamar. Se a ordem não acerta, acumula até o dobro. O próprio Tático soma o Rank no acerto e dano ao executar a ordem.
- **Primeiro a Ver:** soma o Rank à Iniciativa do grupo e põe o Tático antes dos outros aliados para apontar primeiro. **Onde Pisar** remove Surpreso do grupo.
- **Voz que Corrige:** gasta a Reação e repete a rolagem que errou o alvo Apontado.
- **Antecipação, Comando, Avante e A Batalha Que Você Escolheu:** concedem Ações aos aliados; a IA prioriza o aliado com maior golpe médio. A contribuição criada por essas Ações é creditada ao Tático no relatório.
- **Foco de Fogo:** acrescenta o Bônus de Rank ao dano dos aliados contra o Apontado.
- **Prever o Golpe:** gasta a Reação para dar `+4 CA` retroativo quando isso transforma o acerto em erro.
- **Voz de Sargento:** remove Caído de um aliado quando necessário.
- **Sem Baixas:** a primeira queda de um aliado é interceptada e ele fica com 1 PV.
- Os tetos do Cap. 4, §5 agora são cobrados: no máximo 4 Ações próprias + 2 concedidas, e bônus numérico de aliado limitado a `+6`.

### Bardo e Interação

- Começa a canção antes da primeira troca. Sem Guerra, usa **Dissonância**; com **Canção de Guerra**, dá `+2` nos acertos do grupo.
- Com **A Canção Não Para**, mantém Guerra e Dissonância juntas e paga 1 Ação por turno.
- **Insulto Afiado** dá Desvantagem ao próximo ataque do inimigo.
- Dissonância causa o dano sônico por patamar e número de alvos escritos no livro.

### Espíritos e Feras

- Sem seleção manual do cenário, prepara automaticamente os Pactos comprados que caibam no limite do Rank e no PM.
- Uma seleção explícita continua prevalecendo; uma seleção explícita vazia significa não invocar.

### Condições de uso, áreas e cânticos longos

- **Condições de uso:** `Golpe do Desespero` só entra com metade ou menos dos PV e acrescenta 1 nível de Exaustão depois de cada uso; no terceiro nível, os ataques passam a ter Desvantagem. Exigências por estado estruturado do alvo são conferidas. `Requer alvo Agarrado` mantém a aproximação anterior: custa +1 Ação para preparar e presume sucesso.
- **Auditoria automática:** `npm run check:condicoes-combate` encontrou 23 cartas de dano com frases condicionais: 13 modeladas diretamente, 5 aproximadas de forma declarada, 5 medidas deliberadamente só pelo caso base e **0 pendentes**. Uma redação condicional nova sem decisão explícita agora faz o check falhar.
- **Cenário, preparo e equipamento:** técnicas `[Improviso]` exigem que o cenário declare material utilizável; Relâmpago exige `Cumulonimbus` ativa; pontes entre árvores conferem o patamar estruturado; Cruz Nebulosa exige Empunhadura Dupla e três armas no inventário; Empunhadura Dupla respeita o limite de uma vez por turno.
- **Área sem mapa:** personagem e criatura usam a mesma régua: até 3 m alcança 2 alvos; 6 m, 3; 9 m, 4; acima disso, até 5. “Atinge até N” prevalece. Assim, um cone curto não vale o mesmo que uma esfera de 18 m e nenhum deles acerta automaticamente todos os inimigos.
- **Cântico longo:** a IA estima a chance de terminar usando Concentração, inimigos vivos, dano esperado até o próximo turno e PV restante. Abaixo de 35% desiste; acima disso desconta o risco do valor esperado. Início, continuação, conclusão e perda por Concentração aparecem no log.

## `npm run balancear` — antes e depois

Formato das células: `vitória difícil / chefe · contribuição`.

| Patamar | Tático antes → depois | Bardo antes → depois | Invocação antes → depois |
| --- | --- | --- | --- |
| 1º | 3/55% · 13 → **19/80% · 40** | 3/55% · 13 → **6/63% · 13** | 3/55% · 13 → **3/55% · 13** |
| 2º | 3/61% · 13 → **30/96% · 78** | 3/60% · 13 → **8/77% · 31** | 3/60% · 13 → **3/60% · 13** |
| 3º | 49/49% · 8 → **73/95% · 81** | 49/49% · 8 → **59/68% · 36** | 49/49% · 8 → **71/93% · 54** |
| 4º | 52/46% · 5 → **88/99% · 97** | 52/45% · 5 → **64/62% · 50** | 52/45% · 5 → **66/91% · 54** |
| 5º | 46/45% · 3 → **96/100% · 175** | 46/45% · 3 → **66/58% · 62** | 46/45% · 3 → **82/100% · 119** |
| 6º | 15/5% · 2 → **82/91% · 246** | 15/5% · 2 → **31/9% · 74** | 15/5% · 2 → **41/68% · 166** |

Invocação permanece igual no 1º e 2º patamares porque o montador atual compra a Assinatura e os três primeiros talentos, nenhum deles um Pacto. No 3º ele finalmente compra a Quimera e o novo caminho automático aparece. O motor foi testado separadamente com uma ficha que possui Cão de Caça; o invocado entra, cobra 3 PM e age. O Claude está alterando esse montador em paralelo, por isso ele não foi modificado aqui.

Os avisos `motor cego` impressos por `scripts/balancear.mts` também são metadados antigos desse arquivo reservado ao Claude; os números acima já vêm do motor novo.

### Estado final sobre os moldes 0.1.119

O Claude tornou o golpe do molde honesto e remediu os monstros enquanto esta tarefa estava em andamento. Para não misturar essa mudança com o antes/depois histórico acima, esta é uma fotografia separada do motor final. Formato: `Difícil/Chefe · contribuição`.

| Patamar | Tático | Bardo | Invocação |
| --- | --- | --- | --- |
| 1º | 13/84% · 43 | 7/72% · 14 | 3/65% · 14 |
| 2º | 24/94% · 73 | 6/80% · 29 | 1/64% · 11 |
| 3º | 27/44% · 100 | 14/18% · 41 | 35/63% · 66 |
| 4º | 24/43% · 115 | 7/3% · 52 | 15/24% · 65 |
| 5º | 95/85% · 273 | 58/3% · 59 | 95/91% · 144 |
| 6º | 75/43% · 447 | 10/0% · 101 | 65/57% · 254 |

## `npm run kit:mesa` — Capitã Vela

| Encontro | Antes | Depois |
| --- | --- | --- |
| 2 Serpentes | 100%; 2,7 rodadas; Vela 13 | **100%; 2,2; Vela 54** |
| Serpente + Aranha | 100%; 2,8; Vela 12 | **100%; 2,2; Vela 55** |
| Serpente + Aranha + 2 Sapos | 75%; 4,7; 1,27 quedas; Vela 22 | **99%; 3,4; 0,20; Vela 83** |
| Aranha + 3 Sapos | 89%; 4,6; 0,77 quedas; Vela 24 | **100%; 3,2; 0,10; Vela 78** |
| 2 Serpentes + Aranha | 84%; 4,2; 0,91 quedas; Vela 18 | **100%; 3,1; 0,14; Vela 75** |
| 2 Serpentes + 2 Aranhas | 45%; 4,8; 2,42 quedas; Vela 19 | **86%; 4,4; 1,02; Vela 98** |

“Dano da Vela” agora inclui o dano assistido que só ocorreu por Ordem de Tiro ou Ação concedida; não afirma que a lança dela causou tudo.

### Kit atual sobre os moldes 0.1.119

| Encontro | Resultado final |
| --- | --- |
| 2 Serpentes | 100%; 3,0 rodadas; 0,10 quedas; Vela 71 |
| Serpente + Aranha | 100%; 2,9; 0,10; Vela 72 |
| Serpente + Aranha + 2 Sapos | 67%; 5,5; 1,76; Vela 120 |
| Aranha + 3 Sapos | 87%; 5,2; 1,02; Vela 125 |
| 2 Serpentes + Aranha | 89%; 4,5; 0,85; Vela 104 |
| 2 Serpentes + 2 Aranhas | 31%; 5,1; 3,04; Vela 101 |

O quadro anterior continua no relatório porque é o antes/depois isolado do suporte; este segundo quadro é o resultado atual depois da recalibração paralela dos monstros.

## O que ficou de fora

- Tático: Ponto de Estrangulamento, Manobra, Doutrina, Emboscada Planejada e A Guerra Antes da Guerra dependem de mapa, preparação ou composição estratégica que o cenário não declara.
- Bardo: Marcha e Réquiem não encontram viagem/medo nos blocos atuais. Inspiração, Insulto que Fica, Diplomata de Guerra, Elegia, Coro e O Fim da Canção dependem de decisão, emoção ou razão narrativa do alvo. Aplicá-los a todo monstro inventaria que todo monstro ouve, sente e raciocina.
- Pactos: os perfis cobrem PV, CA, deslocamento, resistências, quantidade e golpes. Ordens específicas, ajuda e poderes narrativos próprios continuam fora.
- Ataques comuns de Tático e Bardo continuam usando o atributo normal da arma, Força ou Agilidade, como o livro determina; não foi trocado por Intelecto/Espírito. A arma de referência só existe quando o montador não equipa uma arma real.

## Verificação

- TypeScript, ESLint e `git diff --check`: sem erros.
- Vitest: 57 arquivos, 805 testes aprovados.
- `check:progressao`, `check:sobrevivencia`, `check:condicoes-combate`, `balancear` e `kit:mesa`: concluídos. Os dois primeiros checks de design continuam informativos e não reprovam por contrato.

## Pendências pro Claude

- Rever pelo design, não pelo motor: no estado 0.1.119 o Tático chega a contribuição 273/447 no 5º–6º patamar, enquanto o Bardo cai a 3%/0% contra os Chefes. Isso pode ser regra, seleção automática de cartas ou justamente a parcela narrativa do Bardo que o simulador não deve inventar.

As outras quatro pendências foram fechadas. O montador de Espíritos e Feras e os avisos foram atualizados no trabalho paralelo do Claude. A auditoria não tem mais `LISTADO`. Na régua, o Norte caiu de **50 para 32** no 3º patamar (escrito: ~34) e de **61 para 40** no 4º (escrito: ~42) depois que Túmulo de Aço deixou de pressupor cenário utilizável; o restante da coluna é leitura real das técnicas disponíveis, não essa inflação.
