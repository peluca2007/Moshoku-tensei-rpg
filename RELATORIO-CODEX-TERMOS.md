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
- Remissões lidas: 415
- FALHAs: 0
- AVISOs: 0

## Prováveis defeitos reais

Nenhum na execução final.

Durante a implementação, o check chegou a encontrar duas ocorrências de **Soterrado (Cap. 4, §6)** em `src/data/trees/terra.ts:160` e `src/data/trees/terra.ts:211`. A revisão paralela integrada da `main` corrigiu ambas para o Glossário de Condições, **Cap. 4, §2**, antes da execução final. O check passou depois da integração.

## Falsos positivos restantes

Nenhum na execução final.

## O que ficou fora

- O check de termos não tenta decidir se uma palavra comum em minúscula deveria virar condição formal; ele exige os gatilhos de aplicação ou o uso como termo com maiúscula.
- A conferência de assunto das remissões é lexical. Paráfrases, sinônimos e conteúdo montado em tempo de execução podem gerar AVISO, nunca FALHA.
- Remissões escritas sem “Cap.”, “Capítulo”, “§”, “seção” ou “Apêndice” não são inferidas.
- A lista fixa de conceitos definidos fora do glossário precisa ser ampliada quando o livro criar uma nova unidade ou um novo estado local.

## Pendências pro Claude

(vazio)
