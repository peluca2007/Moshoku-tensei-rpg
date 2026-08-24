# Mushoku Tensei RPG — Progresso do Site

Última atualização: revisão geral após reenvio do livro (Cap. 1–4 + Água completa).

## O que já está pronto

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + Zustand com persistência em `localStorage`.

**Dados do sistema** (`src/lib/types.ts`, `src/data/`)
- Atributos, ranks (Principiante→Imperador), bônus de rank, requisitos de desbloqueio (Cap. 1).
- 12 raças completas, com bônus fixos (atributo/PV/PM/CA) e traços em texto.
- 13 antecedentes (tabela d100) + sub-tabela de Miko (1d8) + sub-tabela de Olho Místico (1d10).
- Árvore de Magia de Água completa (6 ranks, todos os talentos/magias do livro).
- Esqueleto das outras 15 árvores do grafo (Fogo, Vento, Terra, Cura, Barreira, Invocação, Deus da Espada/Água/Norte, Armas Pesadas, Cavalaria e Escudos, Arquearia, Furtividade e Armadilhas, Bardo e Interação, Navegação e Liderança) — aparecem travadas como "Em Breve" até eu receber o conteúdo.

**Várias fichas** (`/personagens`)
- Criar, abrir, renomear (na própria ficha), excluir (confirmação em 2 cliques).
- Tudo persistido no navegador; a ficha ativa é lembrada entre sessões.

**Ficha de personagem** (`/`)
- Nome, raça, antecedente (com sub-tabela Miko/Olho quando aplicável) — tudo editável livremente, a qualquer momento.
- Atributos editáveis diretamente; acima de 4 (o máximo da criação) mostra quanto custa em PA (Cap. 1: 2 PA por ponto, até 8).
- PO editável livremente.
- PV/PM Máximos calculados automaticamente (dado da árvore inicial + Vigor / PM por rank desbloqueado) + campo pra comprar bônus extra com PA (Cap. 1: 1 PA = +5).
- CA = 10 + Agilidade + bônus fixo de raça/antecedente/sub-tabela (ex: Miko "Maldição do Ódio" +2 CA) + item de armadura equipado.
- Card de passivas: mostra todos os traços de raça, antecedente e sub-tabela escolhida, perícias fixas e quantas perícias à escolha cada um concede.
- Perícias: perícias automáticas de raça/antecedente aparecem fixas; lista livre pra adicionar/remover as demais.
- Inventário: nome, tipo (arma/armadura/geral), descrição opcional, bônus de CA (só pra armadura) — equipar soma na CA automaticamente.
- Grimório: magias/talentos comprados, agrupados por árvore, com rank, custo, dano e efeito.
- PA é **só informativo** — soma tudo que foi gasto (ranks + magias/talentos + atributos acima de 4 + PV/PM comprado). Não existe teto nem bloqueio por saldo: quem controla quanto PA cada ficha tem é o Mestre, fora do site.

**Árvore de progressão** (`/arvores`)
- Mapa radial único (estilo Destiny Board do Albion Online): Aventureiro → Magia/Corpo/Utilidade → subgrupo → árvore → ranks, tudo no mesmo grafo, com pan (arrastar) e zoom.
- Dentro de cada árvore, os ranks formam uma linha reta contínua saindo do centro (cada rank só tem o próximo como filho no layout, então não desalinha).
- Clicar num rank abre um painel lateral: se travado, mostra requisito + botão de desbloquear; se destravado, lista tudo que dá pra comprar naquele rank (magia/talento, um por card, com botão individual) — comprar reflete na ficha na hora.

## O que falta / pendente

- **Conteúdo das outras 15 árvores** — só Água está escrita; o resto é esqueleto vazio esperando o texto do livro.
- **Grimório "completo"** — você pediu isso especificamente: cada magia no grimório da ficha deve mostrar tudo (ações normal/encurtada/silenciosa, encantamento, dano de cada variação), não só o resumo atual (dano normal + efeito). Ainda não implementado — combinado que eu esperaria você confirmar antes de mexer nisso.
- **Regra da "toda magia custa no mínimo 3 ações"** — ainda pendente de definição (se mantém Normal/Encurtada/Silenciosa com custos maiores, ou vira um valor fixo único) e não foi aplicada em nenhum dado ainda.
- **Livro/regras navegável no site** (sumário + capítulos em HTML/CSS) e visualizador de PDF — pedido original do projeto, ainda não construído.
- **Fluxo guiado de criação de ficha** — hoje a ficha é só formulário livre (edita tudo direto); não existe um "wizard" passo a passo pra quem prefere ser guiado.
- **Lista mestre de perícias** — hoje é campo de texto livre; não existe um catálogo fechado com as perícias oficiais do livro pra escolher de uma lista.
- **Vantagem de Resistência comprável** (Cap. 1: 2 PA = Vantagem em testes de resistência de 1 atributo à escolha) — ainda não representada na ficha.
- **Magias inatas de raça** (ex: Howling da Raça Fera) — hoje aparecem só como texto no card de passivas, não como uma habilidade de verdade no grimório com botão/detalhe.
- **Dano de arma** — itens do tipo "arma" no inventário ainda não entram em nenhum cálculo de ataque/dano; é só um registro.

## Decisões de design (pra não esquecer o porquê)

- **PA é informativo, não um orçamento travado.** O jogador gerencia a ficha; quem decide quanto PA ele tem é o Mestre, fora do site. `canUnlockRank`/`canPurchaseAbility` só checam pré-requisitos de rank/conhecimento, nunca saldo de PA.
- **Atributo acima de 4 custa PA (2 por ponto, até 8)** — regra literal do Cap. 1, seção 2. Attribute inputs não têm trava dura, só mostram o custo.
- **`AbilityDef.pmCost` é opcional** de propósito: cobre tanto magia (com PM) quanto técnica de Touki (sem PM, Cap. 4) com o mesmo tipo, sem duplicar estrutura.
- **Layout radial das árvores**: cada rank só tem o próximo rank como filho (não os filhos de habilidade) — é isso que garante a linha reta. Se algum dia quisermos voltar a mostrar nós de magia/talento no mapa, isso vai reintroduzir o desalinhamento a menos que o algoritmo de ângulo mude.
