# Relatório Codex — a ficha veste as árvores

Data: 2026-09-27 · polimento revisto em 2026-09-30

## Atualização — Tarefa 9: o caos aparece e continua legível

O diagnóstico do Claude estava certo: os SVGs de 2448 × 1056 eram máscaras de três páginas, mas a ficha os tratava como imagens pretas repetidas. O resultado antigo quase sumia no Livro Noite, virava borrão no Livro Dia e ainda esticava as três variantes numa faixa estreita pela ficha inteira.

O conserto agora:

- pinta cada máscara com a cor da própria árvore e escolhe uma das três variantes de modo estável;
- limita o desenho ao cabeçalho, em áreas próximas da proporção original de 816 × 1056: a dominante ocupa os dois cantos, a secundária ocupa um canto inferior e as demais viram respingos pequenos;
- mostra o kanji dominante com 17% de opacidade no Livro Noite e 12% no Livro Dia, sem atravessar o nome;
- conserva o efeito somente em `html.tema-livro`; Pergaminho Dia/Noite continua neutro e a decisão futura troca um único seletor;
- guarda por ficha quais compras já foram vistas. Ao voltar do mapa de árvores depois de comprar uma habilidade, a camada daquela árvore pulsa por 0,6 s. O teste de navegador detectou a classe animada; com `prefers-reduced-motion`, ela salta direto ao estado final.

### Fotos novas

As 18 comparações pedidas estão em `.telas/ficha-caos-antes/` e `.telas/ficha-caos-depois/`: três perfis (Deus da Espada puro, Deus da Espada + Água e Mago de Fogo), Livro Noite/Livro Dia, em 1440, 1024 e 390 px. A captura do pulso está em `.telas/ficha-caos-depois/pulso-fogo-1024.png`.

Na inspeção visual, o preto quase invisível do tema noturno desapareceu; o selo passou a identificar a árvore de imediato; Água se lê separada do rosa de Deus da Espada; e nenhum motivo invade os cartões, números ou texto corrido abaixo do cabeçalho.

Validação desta rodada: TypeScript aprovado; 856 testes em 59 arquivos aprovados; lint sem erro; `/ficha` com zero falhas de contraste nos temas claro e escuro. O `check:contraste` geral ainda falha somente em `/livro` (50 ocorrências no claro e 7 no escuro), que pertence à sequência da Tarefa 8.

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
- `check:contraste`: `/ficha` tem 0 falhas nos temas claro e escuro. O check geral ainda reprova nove textos de `/arvores` no tema claro, fora dos arquivos desta tarefa.

## O que ficou de fora

- Não foi aplicado caos à impressão: a ficha impressa permanece limpa e econômica em tinta.
- O contrato oficial dos quatro temas chegou durante a tarefa e foi mesclado. A rodada final de fotos usa os IDs `pergaminho-noite`, `pergaminho`, `livro-noite` e `livro-dia`; `tema-livro` já é aplicado pela `ThemeProvider`.
- Não alterei os contrastes ou o transbordo de `/arvores`, pois pertencem aos arquivos reservados ao trabalho paralelo do Claude.

## Pendências pro Claude

- Resolver os nove contrastes e os 24 px de transbordo de `/arvores` em 320 px.
