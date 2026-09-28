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

## O que ficou de fora

- Tático: Ponto de Estrangulamento, Manobra, Doutrina, Emboscada Planejada e A Guerra Antes da Guerra dependem de mapa, preparação ou composição estratégica que o cenário não declara.
- Bardo: Marcha e Réquiem não encontram viagem/medo nos blocos atuais. Inspiração, Insulto que Fica, Diplomata de Guerra, Elegia, Coro e O Fim da Canção dependem de decisão, emoção ou razão narrativa do alvo. Aplicá-los a todo monstro inventaria que todo monstro ouve, sente e raciocina.
- Pactos: os perfis cobrem PV, CA, deslocamento, resistências, quantidade e golpes. Ordens específicas, ajuda e poderes narrativos próprios continuam fora.
- Ataques comuns de Tático e Bardo continuam usando o atributo normal da arma, Força ou Agilidade, como o livro determina; não foi trocado por Intelecto/Espírito. A arma de referência só existe quando o montador não equipa uma arma real.

## Pendências pro Claude

- Fazer o montador de Espíritos e Feras comprar ao menos um Pacto de combate nos patamares 1 e 2; hoje ele compra três talentos preparatórios e nenhuma criatura.
- Remover/atualizar as três mensagens `motor cego` de `scripts/balancear.mts` depois de fechar a recalibração paralela.
- Rever pelo design, não pelo motor: o Tático visível ficou muito forte no 5º–6º patamar (contribuição 175/246), enquanto o Bardo ainda cai contra o Chefe de 6º (9% de vitória). Isso pode ser regra, seleção automática de cartas ou justamente a parcela narrativa do Bardo que o simulador não deve inventar.
