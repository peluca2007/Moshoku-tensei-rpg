# Relatório Codex — termos e remissões

Data: 2026-09-27

## Resultado dos checks

### `npm run check:termos`

- Fontes lidas: 33
- Termos definidos reconhecidos: 108
- FALHAs: 0
- AVISOs: 0

O check cruzou as condições e estados de `src/data/condicoes.ts` com os termos definidos nos capítulos e com uma lista fixa comentada dos conceitos definidos fora do glossário. Também conferiu o caminho inverso: nenhuma condição do glossário ficou sem uso nas cartas das árvores.

### `npm run check:remissoes`

- Fontes lidas: 33
- Remissões lidas: 418
- FALHAs: 0
- AVISOs: 2

## Prováveis defeitos reais

Os dois avisos abaixo apontam **Soterrado** para o Cap. 4, §6, cujo título real no sumário é “Críticos e Touki”. A definição de Soterrado está no Glossário de Condições, Cap. 4, §2. O Codex não alterou o dado porque `src/data/**` está reservado aos revisores.

1. `src/data/trees/terra.ts:160`

   > O primeiro degrau de Soterrado da escola: o chão se fecha em torno de um alvo que já esteja Atolado, Preso ou Caído e o engole até o pescoço. O alvo fica Soterrado (Cap. 4, §6). Contra um alvo que não esteja em nenhuma dessas condições, a magia só o deixa Atolado.

2. `src/data/trees/terra.ts:211`

   > Teste de Força (CD 8 + BC), com Desvantagem se o alvo já estiver Atolado, Preso ou Caído quando a magia sair. Falha: um bloco maciço encapsula o alvo, que fica Soterrado (Cap. 4, §6) e, além disso, Surdo e incapaz de conjurar por qualquer via enquanto estiver dentro. O bloco tem 60 PV. A saída normal do Soterrado (1 Ação e teste de Força, ou 30 de dano na terra) não vale aqui: o alvo repete o teste de Força no fim de cada turno dele, sem a Desvantagem, e sai se passar ou quando o bloco cair. Sucesso: fica só Atolado. É a exceção do Avançado: não exige que o alvo já esteja Atolado, mas quem já estava quase nunca escapa.

## Falsos positivos restantes

Nenhum na execução final.

## O que ficou fora

- O check de termos não tenta decidir se uma palavra comum em minúscula deveria virar condição formal; ele exige os gatilhos de aplicação ou o uso como termo com maiúscula.
- A conferência de assunto das remissões é lexical. Paráfrases, sinônimos e conteúdo montado em tempo de execução podem gerar AVISO, nunca FALHA.
- Remissões escritas sem “Cap.”, “Capítulo”, “§”, “seção” ou “Apêndice” não são inferidas.
- A lista fixa de conceitos definidos fora do glossário precisa ser ampliada quando o livro criar uma nova unidade ou um novo estado local.

## Pendências pro Claude

- Conferir e, se confirmado, trocar `Cap. 4, §6` por `Cap. 4, §2` nas duas ocorrências de Soterrado em `src/data/trees/terra.ts:160` e `src/data/trees/terra.ts:211`.
