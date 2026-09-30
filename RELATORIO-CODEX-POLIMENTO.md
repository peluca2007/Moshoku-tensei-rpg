# Relatório — Tarefa 8, polir tudo (2026-09-30)

O Codex começou a tarefa (conserto do `::highlight` e um ajuste no `check:contraste`) e parou; o Claude
terminou a rodada. Tudo abaixo está na `main`. O item 4 (a arena 2.5D) foi do Claude desde o início.

## Checks — antes e depois

| Check | Antes | Depois |
| --- | --- | --- |
| `check:contraste` (16 rotas × 4 temas) | `/ficha` 11, `/loja` 2, `/livro` 7 / 94 / 7 / 94 (Pergaminho Noite / Pergaminho / Livro Noite / Livro Dia) | **0 em todas as 64 combinações** |
| `check:a11y` (16 rotas) | — | 0 |
| `check:mobile` (16 rotas × 320/360/414) | `/arvores` transbordava 24 px em 320 (relatório da ficha) | 0 px de transbordo em todas |
| `check:livro` | 0 erros, 2 avisos | 0 erros, 1 aviso (tralha sem arte — ver pendências) |
| `check:texto`, `check:termos`, `check:remissoes` | 0 / 0 / 0 | 0 / 0 / 0 |
| `revisar:livro` | 284 páginas, 7 manchas vazias | 284 páginas, 0 título separado, 0 estouro, 0 arte com problema, as mesmas 7 manchas |
| `next build` | 2 avisos do parser em `::highlight` | sem aviso |
| Vitest | 850 | 874 |

## Inventário — o que foi achado e consertado

| Rota / lugar | Tema / largura | Defeito | Gravidade | Commit |
| --- | --- | --- | --- | --- |
| `/livro` (folhear) | todos | aviso do compilador em `::highlight(...)` | acabamento | `96b2ecd` (Codex) |
| `/livro`, Laboratório de Fórmulas | papel dia | texto escuro sobre as cartas escuras do grimório (1,0:1) | **quebra** | `75a9307` |
| `/livro`, antes de hidratar | tema claro | caixas no papel noite com texto escuro por alguns segundos | **atrapalha** | `75a9307` |
| `/livro`, papel dia | Pergaminho, Livro Dia | cor do capítulo como texto: Cap. 0 2,8:1, Cap. 5 3,3:1, árvores 3,7:1 | atrapalha | `75a9307` |
| `/livro`, fichas de criatura | temas escuros | linha de tipo em 4,5:1 | acabamento | `75a9307` |
| tema Livro, site inteiro | Livro Noite / Dia | vinho e dourado com texto branco a 2,6:1 (Loja amarela) | atrapalha | `41241ce` |
| tema Livro Dia | 1440 | cinza secundário a 4,3:1 | acabamento | `41241ce` |
| `/loja` | Livro Noite | rótulos Tipo/Rank a 4,4:1 | acabamento | `41241ce` |
| `/ficha` (caos) | temas do Livro | acento da árvore com texto branco a 2,5:1 (árvore amarelo-lima) | atrapalha | `bc64454` |
| `/ficha` (caos) | Pergaminho | caos não aparecia no tema padrão | atrapalha | `bc64454` (Tarefa 9) |
| `/encontros`, "Quem fez o quê" | 375 | tabela rolava de lado e cortava "Sobreviveu" | acabamento | `653e615` |
| 9 rotas | todas | aba do navegador só com "Mushoku Tensei RPG"; livro com o nome do site repetido | acabamento | `b904935` |
| Cura (loop) | livro | cinco passos, dois com a mesma ideia | acabamento | `066624f` |
| `check:contraste` | — | media texto no meio da animação de surgir (falso positivo) | ferramenta | `853b1b8` |

Varredura visual no desktop (1440 px, Pergaminho Noite): `/`, `/arvores`, `/mestre`, `/comparar`,
`/sessao`, `/iniciativa`, `/loja`, `/personagens`, `/criar`, `/busca`, `/encontros`, `/ficha` —
sem defeito visível além dos acima.

## Pendências para o autor

1. **Arte da categoria "tralha" na loja** (`check:livro`): nenhuma arte do acervo é claramente
   tralha, e escolher por nome de arquivo já deu errado antes. Precisa de uma imagem sua.
2. **As 7 manchas vazias do livro** (pp. 35, 37, 69, 97, 115, 136, 278, 20–28% em branco). São
   cartões indivisíveis (antecedentes, cartas) que não cabem no fim da página. Opções:
   1. **Arte de vinheta para esses vãos** — a passada `vinhetas` já preenche buracos quando há arte do
      tamanho certo; 3–4 artes horizontais estreitas resolveriam a maioria. *(recomendada: não mexe
      no texto nem na ordem)*
   2. Reordenar os cartões dentro de cada seção para encaixar (muda a ordem das tabelas d100).
   3. Aceitar: 20–28% vazio em 7 de 284 páginas.
3. Nada mudou de regra nesta rodada; `patchNotes.ts` não ganhou versão (polimento visual puro).
