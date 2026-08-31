<!--
Obrigado por contribuir. Este projeto tem uma regra de ouro (README → Contribuindo):
NENHUMA regra vive em um lugar só. Número em src/data/, texto em src/components/book/.
Se você mudou um sem o outro, o livro e a ficha vão divergir — e essa divergência sempre
aparece na mesa, nunca na revisão.
-->

## O que muda

<!-- Uma frase. O que a mesa vai notar de diferente. -->

## Por quê

<!-- Link pra issue, ou a conta que motivou a mudança. -->

Closes #

## Tipo

- [ ] 🐛 Correção de bug (o site discordava do livro)
- [ ] ⚖️ Balanceamento (número de regra mudou)
- [ ] ✨ Conteúdo novo (magia, item, árvore, criatura)
- [ ] 🎨 UI/UX
- [ ] 🔧 Infra, build, refactor — sem mudança de regra

## Checklist

- [ ] `npm run lint` passa
- [ ] `npx tsc --noEmit -p .` passa
- [ ] `npm run build` passa

**Se mexeu em regra:**

- [ ] O número mudou em `src/data/*.ts` **e** o texto correspondente em `src/components/book/*.tsx`
- [ ] Conferi `/livro` e `/ficha` lado a lado e os dois contam a mesma história
- [ ] Se a mudança afeta dano, comparei com o **Apêndice C**; se afeta PV/CA/CD, com o **Apêndice G**
- [ ] Se a fórmula mudou, `PROGRESS.md` → "Decisões de design" registra **o porquê**, não só o quê

**Se mexeu em ficha salva:**

- [ ] `version` da store subiu e existe uma migração de verdade — já há fichas reais em uso, não dá pra resetar sem avisar

## Como testar

<!-- O caminho exato. "Abrir /ficha, escolher X, conferir que PT mostra 17 e não 42." -->
