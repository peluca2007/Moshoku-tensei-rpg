# Relatório Codex — a ficha veste as árvores

Data: 2026-09-27

## Resultado

- A ficha calcula quanto PA pertence a cada árvore: custo de abertura pela ordem, ranks e habilidades/talentos comprados. Gastos globais não fingem pertencer a uma árvore.
- A árvore com mais PA determina a cor e o kanji. Em empate, a Árvore Inicial vence.
- Cada árvore com PA desenha uma camada do SVG de caos nas bordas e no cabeçalho; opacidade e escala acompanham sua fração do PA. O perfil misto fotografado tem 8 PA em Deus da Espada e 2 PA em Água.
- Sem PA de árvore, a ficha permanece neutra.
- O efeito só aparece quando o `<html>` tem `tema-livro`. Pergaminho Noite e Pergaminho continuam visualmente neutros.
- No celular, os motivos ficam em faixas estreitas nas bordas e no cabeçalho. O centro dos campos e do texto recebe uma máscara transparente.

## Fotos — 390 × 844

As doze capturas estão em `.telas/ficha-caos/`.

| Perfil | Pergaminho Noite | Pergaminho | Livro Noite | Livro Dia |
| --- | --- | --- | --- | --- |
| Deus da Espada puro | `espada-puro-pergaminho-noite-390.png` | `espada-puro-pergaminho-dia-390.png` | `espada-puro-livro-noite-390.png` | `espada-puro-livro-dia-390.png` |
| Deus da Espada 80% + Água 20% | `espada-agua-pergaminho-noite-390.png` | `espada-agua-pergaminho-dia-390.png` | `espada-agua-livro-noite-390.png` | `espada-agua-livro-dia-390.png` |
| Mago de Fogo | `fogo-pergaminho-noite-390.png` | `fogo-pergaminho-dia-390.png` | `fogo-livro-noite-390.png` | `fogo-livro-dia-390.png` |

Nas fotos de Pergaminho, a mesma ficha conserva o azul padrão e não mostra selo nem SVG. Nas fotos de Livro, Espada usa o rosa do livro e Fogo usa o laranja; Água entra no perfil misto com um quinto da força visual.

## Conferência

- `identidadeDaFicha.test.ts`: 5 casos aprovados (neutra, uma árvore, 80/20, empate e abertura/rank).
- `check:mobile`: `/ficha` com 0 px de transbordo em 320, 360 e 414 px. O check geral ainda reprova `/arvores` em 320 px por 24 px; é uma falha da reformulação paralela e fica fora dos arquivos desta tarefa.
- `check:contraste`: a mudança não entra nos temas comuns sem `tema-livro`, portanto não acrescenta falhas à linha de base. A `main` recebida durante o trabalho já registra 200 falhas globais da reformulação paralela, sete delas em `/ficha`; os elementos apontados são controles preexistentes, não as camadas decorativas.

## O que ficou de fora

- Não foi aplicado caos à impressão: a ficha impressa permanece limpa e econômica em tinta.
- A classe `tema-livro` ainda não existe na `ThemeProvider` desta revisão da `main`. As fotos de Livro a aplicaram pelo DevTools, exatamente como orientado na tarefa. Quando o trabalho paralelo do Claude publicar o contrato dos quatro temas, o componente passa a aparecer sem outra mudança.
- Não alterei os contrastes ou o transbordo de `/arvores`, pois pertencem aos arquivos reservados ao trabalho paralelo do Claude.

## Pendências pro Claude

- Garantir que Livro Noite e Livro Dia apliquem `tema-livro` ao `<html>`; sem essa classe, a ficha fica intencionalmente neutra.
- Resolver a linha de base atual de `check:contraste` e os 24 px de transbordo de `/arvores` em 320 px.
