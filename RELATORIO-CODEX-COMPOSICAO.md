# Relatório Codex — composição do livro folheado

Data: **2026-09-30**. Escopo: Tarefa 10 de `TAREFA-CODEX.md`, sem alterar regras ou texto do livro.

## Resultado

O livro continua com **285 páginas** nos papéis noite e dia. Permanecem zerados título separado, estouro, arte quebrada, arte borrada e recorte forte. O motor agora mede quatro defeitos que antes passavam despercebidos e corrige automaticamente tabelas-torre, parte das partidas curtas e páginas textuais desequilibradas.

| Detector | Primeira radiografia | Depois da composição e do merge do Claude | Observação |
| --- | ---: | ---: | --- |
| `torre` | 22 | **0** | A primeira leitura incluía colunas ordinais e o catálogo já convertido em cartões; o detector foi refinado para contar as linhas da própria célula estreita. Torres reais atravessam a página, inclusive tabelas de 3 colunas. |
| `partida-curta` | 10 | **6** | Tabelas quase cabendo compactam; tabelas curtas ficam inteiras; um grupo final de três registros recebe `break-inside: avoid`. |
| `coluna-curta` | 5 | **2** | Três páginas só de texto ganharam ponto de quebra medido. Fecho e ilustração grande deixaram de ser falsos positivos porque explicam a assimetria. |
| `cabecalho-alto` | 5 | **1** | O check conta linhas reais do texto, não a altura compartilhada do `tr`. O Claude encurtou quatro cabeçalhos no commit `32d4fa1`. |

O catálogo de itens fica fora de `torre` e `partida-curta`: no folhear ele já não é uma tabela visual, mas uma sequência de cartões. Essa exclusão evita consertar um HTML invisível e piorar uma página que já está legível.

## O que mudou na máquina de diagramação

- `espalharTabelasEspremidas` reconhece uma célula abaixo de 90 px que realmente passou de seis linhas e alarga a tabela — ou a caixa que a contém. A correção não é desfeita pela passada que estreita tabelas para fechar buracos.
- `apertarTabelasPartidas` mede grupos por coluna, faz duas passadas curtas, compacta somente a tabela afetada e mantém inteira a que cabe folgada numa coluna. As três últimas linhas podem formar um `tbody` indivisível; a mutação é desfeita antes da recomposição seguinte.
- Páginas textuais com mais de 30% de diferença recebem uma quebra natural medida. Páginas com fecho, peça larga ou figura que ocupa mais de 25% da mancha são assimétricas de propósito e não são “corrigidas”.
- Fechos de capítulo baixos usam a arte inteira (`contain`); a imagem é lazy e ainda não tem dimensões naturais durante a primeira composição, portanto decidir pelo `naturalWidth` nessa passada produzia recortes de 60%.
- O selo do pé só aparece em vãos acima de 15% da mancha. O lado máximo passou de 72 para 92 px e a opacidade de 0,55 para 0,72, mantendo a cor do capítulo/árvore sem virar conteúdo.

## Fotos antes e depois

As séries completas estão no checkout compartilhado:

- antes: `.telas/revisao-composicao-antes/`;
- depois, papel noite: `.telas/revisao-composicao-depois-noite/`;
- índice navegável da última execução: `.telas/revisao/index.html`.

Comparações úteis:

| Caso | Antes | Depois |
| --- | --- | --- |
| Comece Aqui, tabelas e fecho sem recorte | `dupla-004.jpg` | `dupla-004.jpg` |
| Antecedentes / pé da p. 35 | `dupla-017.jpg` | `dupla-017.jpg` |
| fim de Água / p. 97 | `dupla-048.jpg` | `dupla-048.jpg` |
| fim de Terra / p. 115 | `dupla-057.jpg` | `dupla-057.jpg` |
| Teórica / p. 136 | `dupla-068.jpg` | `dupla-068.jpg` |
| Bestiário / p. 279 | `dupla-139.jpg` | `dupla-139.jpg` |

## As sete manchas

| Página inicial | Situação final | Foto final |
| ---: | --- | --- |
| 35 | ainda 20%; selo mais legível e sem sobrepor conteúdo | `dupla-017.jpg` |
| 37 | saiu da lista depois da recomposição | `dupla-018.jpg` |
| 69 | ainda 25%; peça indivisível | `dupla-034.jpg` |
| 97 | ainda 24%; encerramento ilustrado da árvore, visualmente intencional | `dupla-048.jpg` |
| 115 | ainda 27%; coluna textual sem ponto de quebra seguro | `dupla-057.jpg` |
| 136 | ainda 28%; transição da árvore | `dupla-068.jpg` |
| 279 | ainda 23%; ilustração alta explica a assimetria | `dupla-139.jpg` |

Depois do merge de conteúdo, a p. 272 passou a marcar 18% (`dupla-136.jpg`). O total continuou sete; não escondi o novo caso no relatório.

## Pendências para o Claude

1. Cabeçalho restante: p. 64, **“Furtividade e Armadilhas”**, ainda com três linhas. É texto, portanto ficou fora da edição do Codex.
2. Partidas curtas restantes: pp. **9, 10, 233, 240, 245 e 246**. Todas têm duas linhas de um lado e cabeçalho repetido. Forçar a terceira linha por CSS aumentou o livro para 287 páginas e abriu páginas 75–93% vazias; essa tentativa foi descartada. Resolver por conteúdo/ordem ou aceitar a continuação explícita.
3. Colunas curtas restantes: pp. **115 e 282**. O balanceador não encontrou um limite de bloco seguro sem partir carta/tabela.
4. Manchas automáticas restantes: pp. **35, 69, 97, 115, 136, 272 e 279**. As pp. 97 e 279 são encerramentos com arte; as demais podem receber conteúdo/arte do Claude se o autor quiser eliminar a mancha, sem violar blocos indivisíveis.

## Validação

- Papel noite e papel dia: 285 páginas, mesmos achados, zero regressão estrutural.
- Fotos finais revisadas visualmente em 1440 × 900.
- `npx tsc --noEmit -p .`: aprovado.
- `npx vitest run`: **881 testes / 62 arquivos**, aprovados.
- `npm run lint`: aprovado.
- `check:livro`: zero erros, um aviso editorial existente (`tralha` sem arte própria).
- `check:texto`: 632 habilidades/talentos, zero falhas e zero avisos.
- `check:termos`: 108 termos, zero falhas e zero avisos.
- `check:remissoes`: 421 remissões, zero falhas e zero avisos.
- `check:mobile`: 16 rotas sem transbordo entre 320 e 414 px; `/livro` aprovado nas oito combinações de 320/360/375/390 px e claro/escuro, sem tabela rolável e sem alvo abaixo de 40 px.
