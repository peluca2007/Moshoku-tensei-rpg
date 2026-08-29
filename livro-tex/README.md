# O livro em LaTeX

Duas formas de chegar no PDF. Escolha pela sua situação, não pela ordem.

## 1. Um arquivo só (o caminho do botão)

No site, `/livro` → **Exportar Livro (LaTeX)**. Baixa `moshoku-tensei-livro.tex`:
um arquivo autossuficiente, com a classe e todos os capítulos embutidos em
blocos `filecontents`.

1. Overleaf → **New Project → Blank Project**.
2. Apague o conteúdo do `main.tex` e cole o arquivo baixado inteiro.
3. **Menu → Compiler → LuaLaTeX**.
4. Compile duas vezes (a primeira grava os arquivos embutidos; a segunda fecha
   o sumário).

As tabelas desse download são geradas **na hora**, direto de `src/data`. Se
alguém mudou o dano de uma magia hoje de manhã, o `.tex` baixado à tarde já sai
com o valor novo — não existe passo de sincronização pra esquecer.

## 2. A pasta versionada (pra editar a prosa)

Suba esta pasta inteira no Overleaf (arraste o `.zip`, ou `Upload`), defina
`main.tex` como documento principal e o compilador como LuaLaTeX.

```
livro-tex/
  main.tex            capa, sumário, ordem dos capítulos
  moshoku.cls         a classe: paleta, títulos, caixas, blocos de estatística
  capitulos/*.tex     PROSA — escrita à mão, edite à vontade
  gen/*.tex           GERADO — não edite, será sobrescrito
```

Pra atualizar `gen/` depois de mexer nas regras:

```bash
npm run book:tex
```

## Onde mexer em quê

| Quero mudar | Mexo em |
|---|---|
| O texto de uma regra | `capitulos/capN.tex` |
| Um número de magia, técnica ou talento | `src/data/trees/*.ts`, depois `npm run book:tex` |
| Uma tabela de rank, custo de PA, Escala do Vigor | `src/lib/types.ts` ou `src/data/trees/shared.ts` |
| Fonte, cor, espaçamento, formato dos blocos | `moshoku.cls` |
| Como um dado vira LaTeX | `src/lib/livroTex.ts` |

**Nunca** edite um arquivo em `gen/` pra corrigir um número: a próxima geração
apaga a correção, e o site continua com o valor velho. A fonte de verdade dos
números é `src/data`, sempre.

## Por que o site não gera o PDF direto

LaTeX precisa de uma distribuição TeX instalada no servidor. O PDF da *ficha*
funciona (`/api/ficha-pdf`) porque o Typst compila em processo, via pacote npm
— não existe equivalente pro LaTeX. Então o site entrega a **fonte**, e o
Overleaf faz a compilação. O botão **Imprimir**, ao lado, continua sendo o
caminho rápido pra um PDF de consulta direto do navegador.

## Requisitos da classe

Tudo do TeX Live completo, que é o que o Overleaf usa: `geometry`, `microtype`,
`xcolor`, `booktabs`, `longtable`, `enumitem`, `titlesec`, `fancyhdr`,
`tcolorbox`, `needspace`, `hyperref`, `babel`, `csquotes`. As fontes são
Libertinus e Inconsolata.

Em **pdfLaTeX** a classe cai sozinha no pacote `libertinus` e compila também —
o resultado é praticamente idêntico. LuaLaTeX é a recomendação porque carrega
as fontes por nome e lida melhor com o UTF-8 do texto em português.
