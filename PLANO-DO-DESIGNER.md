# Plano do designer — a próxima fase do livro (2026-09-26)

Escrito depois de uma revisão geral (aparência, sistema e balanceamento), a pedido do autor. O
`PLANO-DE-REWORK.md` continua valendo para as decisões já tomadas (Teórica, Utilidades, raças); este
documento é a ordem de trabalho daqui pra frente e o porquê de cada etapa.

**A ideia central:** o sistema tem ideias melhores que a maioria dos RPGs caseiros, e o livro já tem cara
de produto. O risco agora não é falta de conteúdo, é **excesso**. Cortar e simplificar vai fazer mais
pelo jogo do que acrescentar. Toda etapa abaixo mede o sucesso também em "quanto ficou menor ou mais
fácil", não só em "o que ganhou".

Regras de sempre, em toda etapa: o livro é a fonte (nada no site que não esteja no livro); cada mudança de
regra vai junto nos dados, no livro folheado, na ficha automática e nos testes; `npm run revisar:livro`
(também com `ESCALA=1.25`) antes de subir; commits pequenos direto na `main`.

---

## O diagnóstico, em uma página

| Área | O que está forte | O que preocupa |
| --- | --- | --- |
| **Aparência** | Identidade própria: cor por capítulo e árvore, selos, carimbos, arte torta com sombra, fecho de árvore com arte. Parece livro, não site. | O Cap. 3 é ~165 das 284 páginas, muito delas cântico em itálico miúdo. Arte desigual (GIF pixelado ampliado ao lado de ilustração boa). Diagramação montada no navegador: frágil, lenta no celular (~16 s), varia com a escala da tela. |
| **Sistema** | Mecânicas de dois tempos que dão decisão na mesa: Molhado→Congelado, Dose→Inversão, Ferida Fresca, Quebrantado, Tiro Perfeito, Triângulo dos Estilos. | Subsistemas demais pra entrar (PA, PM, PT, PP, Touki, Escada de Dados, Bônus de Rank × BC, três formas de conjurar, Recitação, Interrupção…). Carta que fala com o designer ("1 Ação onde o rank pede 2, porque…"). Nomes de patamar diferentes por árvore. Teórica e Utilidades ainda pendentes. |
| **Balanceamento** | Régua de dano verificada pelo `check:livro`; raças com tier e preço de escolha. | Magia fraca no começo (1º patamar: Corpo ~19–25 por turno, Magia ~9–13). Cura possivelmente a melhor escola (cura + fere). Desintoxicação ganhou dano e continua na tabela de PA mais barata. Despertares das raças sem teste numérico. Contabilidade de "1× por descanso". |

---

## Etapa 1 — Magia Teórica: "três palavras e uma conta"

**Por que primeiro:** é a regra mais difícil do livro e o maior débito; já está decidida (★ do
`PLANO-DE-REWORK.md`, §1).

**O que muda**
- Toda fórmula é **Essência + Verbo + Forma**, uma de cada (dois verbos só a partir do Avançado).
- **PM = custo da potência (tabela de uma linha) + 1 por palavra fora do básico.** Potência = o seu rank;
  some o segundo número (construção × potência).
- Verbos com nome de ação: **Lançar, Erguer, Selar, Sinalizar**. Expandir e Repetir viram formas
  (**Onda, Eco**). A ordem deixa de ser regra.
- Circuitos só do Santo em diante, como um passo só: **"armar"** (gatilho + ligação).
- Símbolos de outras escolas vêm de graça com a escola; os talentos de "aprenda um símbolo" viram talentos
  que fazem algo na mesa.

**Onde mexe:** `src/lib/magiaTeorica.ts` (+ testes), `src/data/trees/teorica.ts`, `RegrasDaTeorica.tsx`,
`AulaDaTeorica.tsx` e as lições do Cap. 2 §8, `FormulaWorkshop` (o Laboratório), `simbolosTeoricos.ts`,
`FormulaGlyph` se os verbos mudarem.

**Pronto quando:** a regra inteira cabe numa tabela de meia página; o motor recusa fórmula por **no máximo
um punhado de motivos** (hoje são 33); a Aula da Roxy fica com três lições em vez de cinco; o Mestre
arbitra uma fórmula sem abrir o site.

---

## Etapa 2 — Enxugar o texto de mesa

**Por que:** resolve três problemas de uma vez: aparência (páginas densas), peso (menos páginas, livro
mais rápido) e entrada no jogo (menos texto pra ler antes de jogar).

### 2a. Notas de design fora das cartas
O `costNote` e as justificativas ("sem isso a escola…") saem do texto impresso. Continuam no código e num
**apêndice de design** para quem quiser o porquê. A carta fica só com o que a mesa usa.

### 2b. Os cânticos
Hoje um cântico de Imperador passa de dez linhas e ocupa mais espaço que a regra.

**Opções para os cânticos**
1. ★ **Um verso na carta, o cântico inteiro no Grimório.** A carta mostra só a primeira linha do cântico
   e o grito final ("…Zero Absoluto!"); o texto completo mora num apêndice por escola e na ficha, que já
   tem o botão de recitar. *Por quê: mantém o sabor e a Recitação Perfeita, e devolve ~30% das páginas
   do Cap. 3.*
2. **Teto de três linhas:** todo cântico é reescrito pra caber em três linhas.
3. **Esconder só no folheado:** o contínuo mostra tudo; o livro de folhear mostra só o grito final.
4. **Cântico como arte:** uma página de cânticos por escola, diagramada como pergaminho, no fim da árvore.

### 2c. Nomes de patamar
**Opções**
1. ★ **Um nome só no livro inteiro** (Principiante → Imperador), e o nome temático da árvore vira
   subtítulo pequeno ("Principiante · Atirador"). *Por quê: ninguém precisa decorar seis escadas.*
2. Manter os nomes temáticos, com a tabela de equivalência em toda abertura de árvore.
3. Tirar os nomes temáticos.

### 2d. O caminho mínimo
Uma página no Cap. 0: **"o que ignorar até o 3º patamar"** — as regras que o jogador novo pode deixar pra
depois (Recitação Perfeita, Interrupção, empilhamento, Conjuração Dividida…) e o que ele precisa saber na
primeira sessão.

**Pronto quando:** o livro cai de ~284 pra perto de **200 páginas** sem perder regra nenhuma; nenhuma
carta tem texto dirigido ao designer.

---

## Etapa 3 — Auditoria de balanço (com o simulador)

**Por que:** os reworks mexeram em números e ninguém rodou a conta depois. O `combatSim` e o
`encounterSim` já existem; a etapa é usá-los de propósito, com metas escritas.

| Frente | Pergunta | Meta |
| --- | --- | --- |
| **Magia × Corpo no começo** | O mago do 1º e 2º patamar contribui na luta? | Magia a no máximo ~30% abaixo do Corpo no dano por turno do 1º patamar, compensando com área/controle — hoje é ~50%. |
| **Cura** | Curar + ferir + Culpa Fresca virou a melhor escola? | Dano da Luz de Dois Gumes abaixo da Água no mesmo patamar; se passar, a luz perde o BC ou o dobro. |
| **Desintoxicação** | Com Dose e Inversão, ela ainda merece a tabela de PA barata? | Ou volta à tabela comum, ou a Inversão perde dano. Decidir com o número na mão. |
| **Despertares das raças** | Algum desequilibra? | Tridente Ancestral (Superd), Colosso (Ogro) e Forma do Dragão abaixo do valor de um talento de Santo da árvore média. |
| **Tático** | Dar Ações ao grupo quebra combos? | Teto por rodada (já previsto na Etapa 4). |

**Opções para o começo do mago**
1. ★ **Truque de escola:** toda escola de magia ganha no Principiante uma magia de 0 PM, 1 Ação, dano
   pequeno (como a Bola de Fogo mais fraca). *Por quê: o mago nunca passa o turno sem fazer nada, e não
   mexe em nenhum número acima.*
2. Subir os dados das magias do 1º e 2º patamar.
3. Baratear o PM do 1º patamar.
4. Aceitar a diferença e escrever no livro que o mago "acorda" no 3º patamar.

**Pronto quando:** a régua do Apêndice C é regenerada pelo simulador (não escrita à mão) e cada frente
tem o número antes e depois registrado no patch notes.

---

## Etapa 4 — As três Utilidades: menu de Preparações + canções

**Já decidido** (★ do `PLANO-DE-REWORK.md`, §4).

- Cada árvore (Furtividade e Armadilhas, Bardo e Interação, Navegação e Liderança) ganha **6 a 8
  Preparações** com custo e efeito escritos; o fato livre continua como "outra coisa, com o Mestre".
- Talentos só de texto (Mapa Vivo, Contrabandista, Colecionador de Histórias…) viram Preparações da lista
  ou saem.
- **Bardo:** a Dissonância automática vira **canções** — uma ativa por vez, trocar custa 1 Ação
  (Marcha, Guerra, Réquiem, Dissonância).
- **Tático:** continua o único que dá Ações, com **teto por rodada**.
- A regra compartilhada de PP no Cap. 3 é reescrita junto.

**Pronto quando:** dá pra comparar um talento de Utilidade com um talento de combate pelo número; a mesa
não precisa das quatro travas do fato livre pra jogar.

---

## Etapa 5 — Congelar a diagramação

**Por que por último:** as etapas 1 a 4 mudam muito texto; congelar antes seria refazer.

**Opções**
1. ★ **Guardar a diagramação no aparelho:** na primeira visita o livro se monta e salva as decisões; nas
   seguintes, aplica direto (celular de ~16 s pra ~8 s; computador de ~3 s pra ~1,5 s). *Por quê: não
   muda nada no fluxo de trabalho e resolve a lentidão de quem volta ao livro.*
2. **Diagramar no build:** um script monta o livro uma vez e grava as decisões junto com o site — abre
   igual em toda tela, mas qualquer mudança de texto exige rodar o script.
3. **PDF oficial:** o PDF vira a versão "de referência", gerado a cada versão, e o folheado continua vivo.
4. Deixar como está.

---

## Etapa 6 — Arte

- **Aberturas de árvore de página inteira** com o acervo (a Nami em Navegação, o Brook no Bardo, a arte
  larga do lutador em chamas no Punho do Fogo…), como a página do Dragão.
- **Trocar os GIFs pixelados** (os de menos de ~300 px) por arte melhor ou tirá-los; um GIF ampliado
  parece erro.
- Continuar a regra: toda imagem nova é olhada antes de ganhar nome, organizada no mesmo dia, e tem a
  cópia de impressão gerada (`npm run gerar:impressao`).

---

## Pendências conhecidas da diagramação (entram quando a etapa tocar a página)

- Pág. ~69: meia página vazia embaixo do diagrama do Tiro Perfeito (limitação do navegador com a peça
  larga; some se o diagrama virar coluna ou se a Etapa 2 encurtar a página).
- Rótulos ("O que ela não faz", "Proficiências") que às vezes ficam no pé da coluna.
- Maestria maior que 60% da coluna ainda parte (a de Atirador).
- Só no PDF: carimbo de caixa solto no pé da página e sem selo no vão.
- A tabela dos Olhos Místicos (Cap. 1) deixa duas linhas na página seguinte.

---

## Ordem, e o que o autor decide em cada ponto

| # | Etapa | Decisão do autor |
| --- | --- | --- |
| 1 | Teórica | Já decidida. |
| 2 | Enxugar o texto de mesa | Cânticos (2b), nomes de patamar (2c). |
| 3 | Auditoria de balanço | O começo do mago; o que ceder na Desintoxicação (com o número na mão). |
| 4 | Utilidades | Já decidida; o teto do Tático vem com número pra validar. |
| 5 | Congelar a diagramação | Qual das quatro. |
| 6 | Arte | Quais árvores abrem com página inteira. |

As etapas 1 e 2 podem andar juntas (a 2 é quase toda texto e diagramação). A 3 vem depois delas porque
a Teórica nova e o texto enxuto mudam o que o simulador mede.
