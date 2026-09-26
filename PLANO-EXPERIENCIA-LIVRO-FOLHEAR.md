# Plano de experiência para o livro folheado

> Estado: execução por etapas autorizada pelo autor em 2026-09-26. Cada entrega concluída é registrada no diário abaixo para o Cláudio acompanhar.

## Objetivo

O `/livro/folhear` já parece um livro: tem papel noite e dia, páginas fixas, duas colunas por página, cores e símbolos próprios para capítulos e árvores, arte, busca, índice, zoom, abas e virada. O próximo ganho é fazer a leitura e a consulta ficarem tão boas quanto a aparência. A pessoa deve conseguir admirar uma abertura, entender uma regra e voltar à mesa com a mesma facilidade.

O resultado desejado tem três ritmos:

1. **Leitura calma:** página parada, texto nítido e hierarquia previsível.
2. **Entrada marcante:** capítulos e escolas ganham alguns instantes de movimento quando abertos.
3. **Consulta imediata:** termos, condições e exemplos podem ser examinados sem perder o lugar.

Movimento só entra quando apresenta uma cena, indica uma mudança ou explica uma regra. A informação permanece disponível quando a animação termina ou está desativada.

## O que observei e o que deve ser conferido novamente

Inspeção visual da versão em execução em 2026-09-26, antes do fechamento das mudanças atuais:

| Amostra | O que já funciona | Oportunidade observada |
| --- | --- | --- |
| pp. 7–8, **Comece Aqui** | Abertura forte, arte com presença, cor e capitular. | Na dupla aberta, a arte ocupa quase toda a página esquerda e a prosa começa pequena na parte inferior. A passagem da cena para a explicação pode ganhar mais respiro. |
| pp. 59–60, início do capítulo das árvores | Cor, kanji e número dão identidade ao capítulo. | A página de abertura e a primeira página de explicação pedem ritmos visuais diferentes, para o leitor identificar quando deve admirar e quando deve estudar. |
| pp. 85–86, **Magia de Água** | Azul, ondas, selos e artes fazem a escola ser reconhecível; a mídia já se move quando visível. | Criar uma entrada de escola mais memorável e tornar as fichas de habilidade mais fáceis de localizar e consultar. |
| pp. 223–226, combate e condições | Cor vermelha organiza o capítulo; tabelas e caixas cabem na página. | O glossário é uma página de consulta muito densa. Precisa de leitura rápida por nome, efeito e exceção. |
| pp. 241–242, passagem para Entre Aventuras | A abertura de capítulo oferece uma pausa editorial. | Na inspeção apareceu um grande quadro preto na página anterior. Conferir se é arte/vídeo ainda carregando, falha de arquivo ou composição intencional antes de decidir o tratamento. |

Essas observações são hipóteses de revisão, não bugs confirmados. O livro e a documentação mudam enquanto o Cláudio trabalha. A primeira tarefa após a entrega dele será refazer as capturas e comparar com este ponto de partida.

## Regras de projeto

- Preservar o **livro noturno** e a identidade das 19 árvores. A proposta aprofunda a linguagem atual.
- Manter uma única fonte para o texto e para as regras. O modo paginado e o contínuo continuam lendo os mesmos capítulos e dados.
- Conservar texto selecionável, links, busca, teclado, índice e exportação. Uma interação acrescenta uma forma de ver a regra; não substitui a regra escrita.
- Respeitar as páginas de tamanho fixo e a paginação existente. Mudanças de mancha, fonte ou altura de bloco exigem revisar o livro inteiro.
- Não animar elementos fora da dupla aberta. Vídeo, diagrama e efeito decorativo não devem redesenhar centenas de páginas invisíveis.
- Tratar **papel dia**, tela pequena, zoom, impressão e movimento reduzido como versões da mesma experiência editorial.
- Não introduzir som automático, animação permanente sobre texto corrido nem efeitos que atrasem a busca de uma regra.

## Frente 1 — Acertar a leitura antes dos efeitos

### 1.1 Três modelos editoriais

Criar regras visuais para três situações, aproveitando os componentes existentes:

| Modelo | Composição desejada | Primeira amostra |
| --- | --- | --- |
| **Abertura** | Arte e título como foco, resumo curto, início da prosa com espaço suficiente para ser lido. O recorte preserva rosto e ação da imagem. | Comece Aqui, p. 7; Combate, p. 223. |
| **Explicação** | Título, regra, exemplo e arte em ordem clara. Caixas chamam atenção sem competir com a frase principal. | Como Ler uma Árvore, pp. 59–60. |
| **Consulta** | Nome e consequência aparecem primeiro; exceções e referências ficam fáceis de encontrar. Linhas e rótulos ajudam a seguir tabelas grandes. | Condições, pp. 225–226; catálogo de Água, pp. 85–86. |

O ajuste começa nas páginas piloto. Se um tipo de página pedir espaço que a folha não tem, distribuir o conteúdo pelas páginas seguintes. Não reduzir a letra como solução automática. No visualizador, oferecer um acesso claro a **ler esta página de perto**, usando o zoom já existente e preservando o ponto da leitura. A escala padrão de duas páginas deve ser avaliada em notebook: se as duas folhas ficarem pequenas demais, a apresentação de uma página precisa ser fácil de alcançar.

### 1.2 Arte e mídia confiáveis

Auditar cada quadro vazio, preto, cortado ou excessivamente ampliado apontado pela revisão visual. Reservar a proporção antes da mídia carregar. Para vídeo de habilidade, mostrar uma imagem de capa útil e controles explícitos quando o movimento tiver valor próprio; manter texto e imagem suficientes para compreender a habilidade sem reprodução. Verificar se o PDF/impresso mostra uma imagem e legenda adequadas em vez de um quadro vazio.

### Aceite da frente 1

- As cinco amostras da tabela acima têm leitura clara em papel noite e dia.
- O quadro preto observado na p. 241 tem causa identificada e tratamento editorial definido.
- Nenhuma página piloto corta arte ou regra, nem exige procurar texto escondido sob ilustração.
- A pessoa encontra rapidamente título, regra principal, exemplo e exceção nas páginas de consulta.
- Zoom e troca para uma página preservam o trecho que estava sendo lido.

## Frente 2 — Fazer o livro reagir com propósito

### 2.1 Linguagem de movimento

| Momento | Movimento proposto | Estado final |
| --- | --- | --- |
| Virada comum | Manter a folha curta já existente; ajustar sombra e resposta apenas se a inspeção mostrar ganho claro. | Página nova estável, pronta para ler. |
| Abertura de capítulo | Arte, número e um motivo do capítulo entram em sequência breve, uma vez ao chegar à abertura. | Título e arte completamente legíveis. |
| Entrada de árvore | Um motivo próprio surge na borda: onda em Água, brasa em Fogo, traço de lâmina no Corpo, círculo na Teórica. | Motivo para; texto e controles ficam quietos. |
| Diagrama de regra | A sequência revela a causa e o resultado, com controles **Rever** e, onde couber, **Próximo passo**. | Regra completa visível. |

A intenção é um gesto curto, em geral abaixo de meio segundo para decoração; uma demonstração pode durar mais porque o leitor a controla. A execução deve ser cancelável por nova navegação. `prefers-reduced-motion` mostra diretamente o quadro final. Não usar parallax contínuo na rolagem nem partículas por cima de texto.

### 2.2 Primeiros exemplos interativos

Começar pelos diagramas que já existem, sem criar uma segunda versão das regras:

1. **Anatomia do Turno:** três Ações visíveis; tocar em Andar, Atacar ou Conjurar mostra o gasto e o que sobra. Um exemplo deve cobrir conjuração que atravessa turnos.
2. **Quebrantado Empilha:** avançar um acúmulo de cada vez e ver claramente o limite e o efeito final.
3. **Etapas do Tiro Perfeito:** caminhar pelas etapas, inclusive uma falha intermediária, com volta e reinício.

Cada demonstração tem explicação textual completa, controles de teclado, estado inicial e botão de reinício. Os números vêm da fonte de regras já usada pelo livro. A apresentação impressa mostra um estado final legível com legenda.

### Aceite da frente 2

- As aberturas ganham personalidade sem atrasar a virada ou disparar efeitos repetidos a cada retorno.
- Os três exemplos ensinam a regra a alguém que não leu o código e funcionam sem depender da animação.
- Com movimento reduzido, nenhuma informação fica presa no primeiro quadro.
- Nada continua animando ou reproduzindo fora da página visível.

## Frente 3 — Usar a vantagem de ser um site durante a sessão

### 3.1 Ficha de consulta no próprio livro

Quando um termo recorrente aparecer como link, permitir abrir uma ficha curta **sobre a mesa**, sem mudar a dupla. Começar por um conjunto pequeno e muito consultado: Molhado, Quebrantado, Preso, Caído, ações, reação, Rank e Bônus de Rank. A ficha mostra definição, efeito prático e link **Ver regra completa**, apontando para a âncora canônica.

O leitor pode abrir pelo clique, toque ou teclado; fechar por botão ou Escape; e voltar ao mesmo ponto e foco. No telefone, a ficha usa um painel de tamanho confortável. Na impressão, permanece apenas o link para a seção. Não gerar definições independentes copiadas à mão: o texto curto precisa ter origem editorial identificada e ser revisto junto com a regra original.

### 3.2 Atalhos de navegação com cara de livro

As abas coloridas já levam a capítulos. Acrescentar o nome ao passar o mouse ou receber foco, sem esconder o rótulo de tecnologia assistiva. Na régua inferior, avaliar uma prévia pequena da seção de destino antes de saltar. Um resultado de busca deve levar ao trecho, realçá-lo brevemente e oferecer um caminho claro para voltar à dupla anterior.

Esses atalhos precisam conservar o índice e a busca atuais. Primeiro testar com uma dúvida real de mesa: abrir uma condição, conferir o efeito e retornar à habilidade que a mencionou.

### Aceite da frente 3

- Consultar uma condição e voltar ao parágrafo inicial exige poucos gestos e não perde o lugar.
- Ficha, abas, busca e régua são operáveis por teclado e legíveis em voz alta.
- Links compartilhados continuam levando à seção certa.
- A consulta não altera a paginação nem duplica valores de regras.

## Ordem de execução

| Etapa | Entrega revisável | Portão para avançar |
| --- | --- | --- |
| **0. Fotografar a versão recebida** | Estado do código, número de páginas, capturas noite/dia e revisão das cinco amostras. Listar o que o Cláudio já resolveu. | Plano ajustado ao livro efetivamente entregue, sem sobrescrever mudanças recentes. |
| **1. Leitura e mídia** | Modelos de abertura, explicação e consulta nas páginas piloto; tratamento do quadro preto; zoom fácil de descobrir. | Leitura confortável, arte estável e revisão do livro inteiro sem corte ou estouro. |
| **2. Movimento editorial** | Uma abertura de capítulo e uma escola com linguagem de movimento. | Efeito curto, sem distração ou custo perceptível na virada. |
| **3. Regra em ação** | Anatomia do Turno, Quebrantado e Tiro Perfeito com controle manual. | Texto e estado final bastam mesmo sem animação. |
| **4. Consulta contextual** | Primeira ficha de condição, depois o conjunto inicial de termos; melhorias pontuais nas abas e na régua. | Encontrar e conferir a regra sem perder a dupla de origem. |
| **5. Expansão e acabamento** | Aplicar apenas os padrões aprovados aos demais capítulos e escolas; revisar impressão e celular. | Cada família mantém sua identidade e o livro segue íntegro. |

Cada etapa pode ser avaliada no navegador antes da próxima. Se um efeito funcionar no piloto, mas prejudicar a leitura ou o desempenho em outro capítulo, ele é revisto antes de ser espalhado pelo livro.

## Verificação de qualidade

Antes de qualquer implementação, registrar o desempenho da versão recebida em ambiente comparável: tempo até o livro ficar pronto, custo de uma virada, memória e carregamento de mídia. A documentação atual traz medições de 2026-09-25 para um livro menor; elas não substituem a nova referência. Repetir as medições depois de cada frente. Movimento novo não deve causar tarefa longa perceptível na virada nem trabalho contínuo com a página parada.

Revisar no mínimo: computador grande, notebook de tela baixa, tablet, celular; papel noite e dia; uma e duas páginas; zoom; teclado; leitor de tela; movimento reduzido; impressão/PDF; carregamento lento de mídia; leitura offline. Safari/iPad consta como pendência no plano atual e deve entrar na validação quando houver aparelho disponível.

Qualquer mudança de composição ou mídia passa por `npm run revisar:livro` antes de subir, conforme `AGENTS.md` e `PLANO-LIVRO-DIGITAL.md`. Conferir especialmente títulos órfãos, blocos fora da folha, páginas excessivamente vazias, arte quebrada e a posição de âncoras. Executar as verificações de livro, sumário, mídia, acessibilidade, mobile e offline pertinentes à etapa. Mudanças pequenas e fechadas seguem o fluxo atual de commits na `main`; um experimento de grande alcance só usa branch separada se o autor pedir ou se ainda não estiver pronto para a `main`.

## Definição de pronto

O trabalho fecha quando as aberturas têm presença, o miolo sustenta uma leitura longa, tabelas e condições se consultam depressa, imagens e vídeos têm enquadramento e fallback bons, e as interações demonstram regras que antes pediam explicação oral. O livro continua selecionável, pesquisável, compartilhável, utilizável sem movimento, acessível pelo teclado e íntegro no modo contínuo, na impressão e sem rede. A prova final é uma sessão de uso: localizar uma regra, entendê-la e retornar à página de origem sem atrapalhar o jogo.

## Relação com os planos existentes

Este é o plano da **próxima camada de experiência**. `PLANO-LIVRO-DIGITAL.md` registra a identidade e a implementação atuais; `PLANO-LIVRO-PERFEITO.md` descreve a visão ampla de livro HTML. A execução deve partir do estado real após a entrega do Cláudio e atualizar este plano quando uma decisão visual ou técnica mudar.

## Diário de execução

### 2026-09-26 — Etapa 0: diagnóstico inicial concluído

- **Base observada:** `main` em `a6808cd`, livro paginado com **265 páginas** no servidor existente da porta 3020. A numeração deste plano, tomada de outra versão em andamento, não serve mais como endereço fixo; as amostras devem ser localizadas pelas âncoras e pelos títulos.
- **Passagem para o capítulo 5:** a abertura “Entre Aventuras” e a dupla seguinte aparecem com arte e texto. O quadro preto visto na versão anterior não se reproduziu nesta versão; nenhuma correção de arte foi feita sem confirmar a causa.
- **Revisão automática:** `npm run revisar:livro -- --sem-fotos` foi tentado. O Chrome headless encerra no Windows antes de abrir a página (`GPU process isn't usable`, código `2147483651`). Tentativas locais de configuração não produziram um relatório confiável; a ferramenta ficou sem alterações. Até resolver isso, verificar as páginas tocadas no navegador e **não subir mudanças de composição**, pois `AGENTS.md` exige a revisão completa antes de subir.
- **Próximo incremento escolhido:** nomes visíveis nas abas de capítulo, ao passar o mouse ou focar pelo teclado. É um ganho de orientação que não altera a mancha de texto nem a paginação.

### 2026-09-26 — Primeiro incremento concluído: identificar as abas

- **Feito:** cada aba colorida mostra o nome completo do capítulo junto à borda do livro ao receber foco de teclado ou ponteiro. O rótulo usa as cores do papel noite/dia; o botão conserva seu nome acessível e deixou de depender do tooltip nativo.
- **Onde:** `src/components/book/folhear/Folhear.tsx` e `src/app/livro/folhear/folhear.css`. Não houve mudança em texto de regras, dados ou diagramação das folhas.
- **Conferido:** no navegador, foco por Tab mostrou “Cap. 5 — Entre Aventuras” nos papéis noite e dia. No modo livro a 390 px de largura, o rótulo da aba longa “Cap. 4 — Combate e Sobrevivência” permaneceu dentro da tela. O contador permaneceu em **265 páginas**; `npx tsc --noEmit`, ESLint do componente e `git diff --check` passaram.
- **Limite:** a revisão `npm run revisar:livro` ainda falha antes de abrir o livro por causa do Chrome headless local. Este incremento não será enviado enquanto o portão exigido em `AGENTS.md` não puder ser cumprido. A próxima frente deve restaurar a revisão ou usar um ambiente em que ela rode; só depois alterar tamanho, quebra ou posição de conteúdo nas páginas.
