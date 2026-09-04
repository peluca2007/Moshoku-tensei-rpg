# O que falta

Estado em 2026-09-04, depois da série 0.1.5 → 0.1.11. O `PROGRESS.md` continua sendo o registro completo;
este arquivo é a lista curta do que ficou em aberto, na ordem em que eu faria.

## Precisa de você (não dá pra fazer sozinho)

1. **Duas faixas em baixa resolução.** `public/faixas/loja.jpg` (600px) e `faixas/livro.jpg` (525px)
   amaciam visivelmente em tela larga — as outras seis estão entre 960 e 1900. Reprocurar com os mesmos
   termos, pedindo tamanho maior: `medieval adventurer guild shop interior concept art` e
   `open grimoire spellbook candlelight`.
2. **Testar em celular de verdade.** Nunca vi o site abaixo de 500px: o Chrome do Windows trava a largura
   mínima da janela aí, e todo print "mobile" que eu tirei era um recorte de uma janela de 500. É onde
   metade da mesa vai abrir o site.
3. **Confirmar o PDF em produção.** Existe um fix de `outputFileTracingIncludes` (binário do Typst na
   Vercel) que só é verificável no próximo deploy. Enquanto não confirmar, "exportável em PDF pra levar
   pra mesa" é uma promessa não testada — e ela está escrita na landing.

## Sistema de RPG

4. **As 11 células que a auditoria acusou.** `npm run check:arvores` devolve a lista curta:
   - **Magia (medição fiel):** Fogo 4º e 5º, Água 5º, Vento 5º, Terra 6º — a régua promete de 36% a 52%
     mais do que o teto do turno entrega.
   - **Corpo (piso, não medição):** Norte 1º/2º/6º, Lutador 1º, Arco 4º/5º. Aqui o número é piso porque o
     Dado de Arma escalado por Maestria não entra na conta — o desvio pode ser inteiramente isso.
5. **Modelar o Dado de Arma no `check:arvores`.** É o que transformaria a lista do Corpo de "piso" em
   medição. Exige ler as Maestrias de cada árvore e decidir a arma de referência.
6. **Validar a Distância Roubada** (Vendaval) na mesa. A mecânica soma alcance a partir do movimento e
   nenhuma outra árvore faz isso; o simulador não pega, porque não modela posicionamento.

## Site

7. **PWA / offline.** Mesa física num porão sem sinal é o caso de uso, e hoje o site morre sem internet.
   As fichas já vivem no `localStorage` — falta service worker e manifest. É a maior pendência funcional.
8. **`/personagens`:** falta a foto do personagem e uma barra de PV/PM visível de fora do card.
9. **Acessibilidade:** contraste conferido, mas falta teste real com leitor de tela e tamanho de fonte
   ajustável.

## Estética

10. **Favicon em 16px.** `src/app/icon.png` já é a marca nova, mas nesse tamanho o letreiro inteiro vira
    mancha. Legibilidade ali pediria um **símbolo** — o olho dourado do "O" de Mushoku é o candidato
    óbvio. É decisão de design, não trabalho técnico: o script já sabe recortar e reduzir.
11. **Varredura completa do tema claro.** Achei um cabeçalho ilegível em cinco minutos de teste (corrigido
    em 0.1.10, com véu no `PageHeader`). Não é seguro assumir que era o único: vale uma passada nas sete
    rotas com o tema forçado.

## Dívida documentada que continua de pé

12. **Auditoria linha a linha das magias.** Sete árvores conferidas por completo; nove nunca — Suishin,
    Norte, Lutador, Escudos, Arquearia, Ladino, Tático, Vendaval, Punho de Fogo. O `check:arvores` reduz
    isso à lista do item 4, mas leitura manual ainda é o que pega texto de habilidade errado, e o script
    não lê texto.
13. **Foto de perfil e capa nas fichas.** Documentado, decisões pendentes no fim do `PROGRESS.md`.
