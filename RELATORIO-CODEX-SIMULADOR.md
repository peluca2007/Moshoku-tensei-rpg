# Relatório Codex — Tático, Bardo e invocados no simulador

Data: 2026-09-27. Linha de base: `b2d1262`. Depois: Tarefa 6.

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
| 1º | 54/97% · 14 → **77/100% · 38** | 53/97% · 14 → **54/98% · 15** | 53/97% · 14 → **53/97% · 14** |
| 2º | 29/94% · 14 → **83/100% · 72** | 28/94% · 14 → **54/98% · 33** | 28/94% · 14 → **28/94% · 14** |
| 3º | 88/92% · 6 → **98/100% · 69** | 88/92% · 6 → **97/97% · 28** | 88/91% · 6 → **98/100% · 38** |
| 4º | 86/92% · 4 → **98/100% · 80** | 86/91% · 4 → **96/99% · 37** | 86/91% · 4 → **92/100% · 38** |
| 5º | 83/82% · 2 → **100/100% · 151** | 83/81% · 2 → **97/92% · 49** | 83/81% · 2 → **98/100% · 89** |
| 6º | 82/78% · 2 → **100/100% · 176** | 82/78% · 2 → **97/91% · 52** | 82/78% · 2 → **98/100% · 89** |

Invocação permanece igual no 1º e 2º patamares porque o montador atual compra a Assinatura e os três primeiros talentos, nenhum deles um Pacto. No 3º ele finalmente compra a Quimera e o novo caminho automático aparece. O motor foi testado separadamente com uma ficha que possui Cão de Caça; o invocado entra, cobra 3 PM e age. O Claude está alterando esse montador em paralelo, por isso ele não foi modificado aqui.

Os avisos `motor cego` impressos por `scripts/balancear.mts` também são metadados antigos desse arquivo reservado ao Claude; os números acima já vêm do motor novo.

## `npm run kit:mesa` — Capitã Vela

| Encontro | Antes | Depois |
| --- | --- | --- |
| 2 Serpentes | 2,3 rodadas; Vela 11 | **1,9 rodadas; Vela 47** |
| Serpente + Aranha | 2,4 rodadas; Vela 11 | **2,0 rodadas; Vela 47** |
| Serpente + Aranha + 2 Sapos | 91% vitória; 4,2 rodadas; Vela 20 | **100%; 3,0; Vela 72** |
| Aranha + 3 Sapos | 96%; 3,8; Vela 20 | **100%; 2,7; Vela 66** |
| 2 Serpentes + Aranha | 98%; 3,5; Vela 17 | **100%; 2,6; Vela 64** |
| 2 Serpentes + 2 Aranhas | 76%; 4,9; 1,28 quedas; Vela 22 | **99%; 3,6; 0,26 quedas; Vela 84** |

“Dano da Vela” agora inclui o dano assistido que só ocorreu por Ordem de Tiro ou Ação concedida; não afirma que a lança dela causou tudo.

## O que ficou de fora

- Tático: Ponto de Estrangulamento, Manobra, Doutrina, Emboscada Planejada e A Guerra Antes da Guerra dependem de mapa, preparação ou composição estratégica que o cenário não declara.
- Bardo: Marcha e Réquiem não encontram viagem/medo nos blocos atuais. Inspiração, Insulto que Fica, Diplomata de Guerra, Elegia, Coro e O Fim da Canção dependem de decisão, emoção ou razão narrativa do alvo. Aplicá-los a todo monstro inventaria que todo monstro ouve, sente e raciocina.
- Pactos: os perfis cobrem PV, CA, deslocamento, resistências, quantidade e golpes. Ordens específicas, ajuda e poderes narrativos próprios continuam fora.
- Ataques comuns de Tático e Bardo continuam usando o atributo normal da arma, Força ou Agilidade, como o livro determina; não foi trocado por Intelecto/Espírito. A arma de referência só existe quando o montador não equipa uma arma real.

## Pendências pro Claude

- Fazer o montador de Espíritos e Feras comprar ao menos um Pacto de combate nos patamares 1 e 2; hoje ele compra três talentos preparatórios e nenhuma criatura.
- Remover/atualizar as três mensagens `motor cego` de `scripts/balancear.mts` depois de fechar a recalibração paralela.
