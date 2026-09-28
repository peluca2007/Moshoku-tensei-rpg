# Relatório Codex — estética do livro

Data: 2026-09-27

## Resultado

- A ficha da Raça Dragão e a ilustração de Orsted passaram a dividir a mesma página. A página duplicada de Orsted desapareceu também no livro contínuo.
- Cinco árvores ganharam abertura de página inteira: Magia de Fogo, Magia de Cura, Estilo Deus do Norte, Bardo e Interação e Navegação e Liderança.
- O Bestiário ganhou Orsted junto da explicação de chefes; a arte final do Punho do Fogo foi trocada por uma composição vertical; a Aura de Comando do Deus do Norte deixou de ampliar uma imagem pequena.
- Os doze ícones de raça deixaram de ser silhuetas genéricas e agora são recortes das próprias artes raciais.
- Resultado da revisão integral depois de mesclar a `main`: 287 páginas, 1.349 títulos, nenhum título separado do conteúdo, nenhum estouro, nenhuma arte quebrada e nenhuma arte ampliada demais. As cinco aberturas respondem por cinco páginas; o restante da variação veio das mudanças de conteúdo recebidas no merge.

## Duplas para comparar

As fotos finais escolhidas foram guardadas em `.telas/revisao-estetica/depois/`. A rodada inicial usava os mesmos nomes em `.telas/revisao/`; a revisão final os sobrescreveu, por isso a coluna “antes” registra o nome observado na rodada inicial e a página correspondente.

| Trecho | Antes | Depois | Mudança visível |
| --- | --- | --- | --- |
| Raça Dragão | `dupla-016.jpg` (p. 34–35) | `depois/dupla-016.jpg` | texto e Orsted separados viram uma única página em duas colunas |
| Magia de Fogo | `dupla-037.jpg` (árvore sem abertura) | `depois/dupla-037.jpg` | mago em chamas abre a escola em página inteira |
| Magia de Cura | `dupla-057.jpg` (árvore sem abertura) | `depois/dupla-057.jpg` | curandeira no campo abre a escola em página inteira |
| Deus do Norte | `dupla-081.jpg` (árvore sem abertura) | `depois/dupla-083.jpg` | espadachim de lâminas vermelhas ocupa a folha inteira antes da árvore |
| Punho do Fogo | `dupla-097.jpg` (fecho horizontal antigo) | `depois/dupla-099.jpg` | nova arte vertical preenche a folha sem faixa vazia |
| Bardo e Interação | `dupla-103.jpg` (árvore sem abertura) | `depois/dupla-105.jpg` | esqueleto músico abre a árvore em página inteira |
| Navegação e Liderança | `dupla-106.jpg` (árvore sem abertura) | `depois/dupla-109.jpg` | navegadora passa a abrir a árvore; regras seguem na página ao lado |
| Bestiário — chefes | `dupla-135.jpg` (bloco só de texto) | `depois/dupla-139.jpg` | Orsted entra na explicação de por que o chefe pesa quatro |

## Artes que entraram

Os arquivos foram movidos do acervo, não copiados:

- `mago-de-fogo-em-pe.webp` → `public/livro/pranchas/fogo-abertura.webp`
- `curandeira-no-campo-de-flores.webp` → `public/livro/pranchas/cura-abertura.webp`
- `espadachim-lamina-vermelha-larga.webp` → `public/livro/pranchas/deus-do-norte-abertura.webp`
- `esqueleto-musico-bardo.webp` → `public/livro/pranchas/bardo-e-interacao-abertura.webp`
- `nami-navegadora.webp` → `public/livro/pranchas/navegacao-e-lideranca-abertura.webp`
- `orsted-de-pe.webp` → `public/livro/pranchas/apendice-g-orsted.webp`
- `punho-de-fogo-ruiva.webp` → `public/livro/pranchas/punho-de-fogo.webp`; a versão final anterior voltou ao acervo como `punho-de-fogo-final-antiga.webp`
- `auber-deus-do-norte.webp` → `public/arte/deus-do-norte/aura-de-comando-norte.webp`; a imagem pequena anterior voltou ao acervo como `aura-de-comando-norte-antiga.webp`

As doze imagens de `public/racas/` foram refeitas como recortes quadrados das pranchas correspondentes em `public/livro/racas/`, sem duplicar novas fontes do acervo.

## Artes vistas e deixadas no acervo

- `arqueira-na-floresta.webp`: arquivo pequeno demais para a ampliação exigida por uma prancha.
- `orsted-e-nanahoshi.webp`: resolução baixa para página ou meia página; Orsted sozinho tinha composição mais legível no Bestiário.
- `povo-do-mar-lanceira.webp` e `povo-do-mar-sentada.webp`: boas imagens, mas genéricas em relação a Mushoku Tensei e redundantes numa página racial que já tem arte forte.
- `migurds-grupo.webp`: o grupo perde impacto no recorte e competiria com a prancha de Roxy já usada na raça.
- `atofe-de-armadura.webp`: desenho bom, reservado para eventual ficha de criatura; a página da raça Demônio já está visualmente cheia.
- `vol05-ilustracao.webp` e `vol11-capa.webp`: composições de grupo aproveitáveis, mas não resolviam uma lacuna específica tão bem quanto as aberturas escolhidas.
- `punho-de-fogo-velho-larga.webp` e `lutador-de-fogo-larga.webp`: vistas e mantidas como alternativas; o formato horizontal deixava pior o fecho vertical do Punho do Fogo.
- `atofe-capa-manga-larga.webp`, `guerreiro-do-mar-larga.webp`, `espadachim-do-vento-larga.webp` e `estrategista-de-capa.webp`: boas, porém as árvores correspondentes já tinham fechos coerentes e ganhariam páginas sem corrigir vazio ou repetição.

## Pendências

Nenhuma pendência causada por esta rodada ficou aberta. A revisão pós-merge marcou 26 páginas com espaço livre; a inspeção mostra respiros, finais de seção e páginas dominadas por arte, não estouros. Ela também avisou que `fechos/cap1.webp` mostra 40% da fonte na página 42. Esse fecho não foi alterado nesta tarefa e o aviso apareceu somente depois de receber as mudanças remotas; ficou registrado para a revisão de diagramação do Cap. 1.
