# Plano do designer — a próxima fase do livro

**Versão 2 · 2026-09-26.** Escrito depois de uma revisão geral (aparência, sistema, balanceamento) e
refeito com números medidos, não impressões. É a **ordem de trabalho** daqui pra frente: o que fazer, em
que ordem, por quê, o que o autor decide em cada ponto e como se sabe que ficou pronto.

> **A ideia central.** O sistema tem ideias melhores que a maioria dos RPGs caseiros e o livro já tem
> cara de produto. O risco agora não é falta de conteúdo, é **excesso**: texto demais pra mesa, números
> que ninguém mediu depois dos reworks, subsistemas demais pra entrar. Cortar e medir vai fazer mais pelo
> jogo do que acrescentar. Toda etapa mede o sucesso também em "quanto ficou menor, mais claro ou mais
> justo", não só em "o que ganhou".

As três prioridades de sempre decidem os empates: **diversão**, depois **balanceamento**, depois
**simplicidade** — e regra complexa só se a complexidade for a diversão, sempre com exemplo ou diagrama.

---

## 1. Como ler este plano

- **Etapas** em ordem, cada uma com: *por que agora*, *o que entra / o que não entra*, *decisões do autor*
  (opções no formato do projeto, com a que eu escolheria marcada ★ e o porquê), *pronto quando* (com número)
  e *como verificar*.
- **Portões:** pontos em que o trabalho para até o autor validar (ou até a mesa jogar). Nada passa de um
  portão sem ele.
- **Tamanho:** P (uma sessão de trabalho), M (duas a três), G (quatro ou mais).
- **Regras que valem em toda etapa:** o livro é a fonte (nada no site que não esteja no livro); cada
  mudança de regra vai junto nos dados, no livro (contínuo e folheado), na ficha automática, no PDF e nos
  testes; antes de subir, `npm run revisar:livro` (também com `ESCALA=1.25`), `check:livro`,
  `check:texto` e `vitest`; commits pequenos direto na `main`; patch notes registra o antes e o depois.

---

## 2. A linha de base (medida em 2026-09-26)

É contra estes números que cada etapa mostra o que melhorou.

### O livro

| Medida | Hoje | Observação |
| --- | --- | --- |
| Páginas do folheado | **284** | Cap. 3 inteiro = 165 (58% do livro) |
| Páginas por árvore | Magia **≈10** (79 nas 8) · Corpo **≈6,5** (52 nas 8) · Utilidade **≈5,7** (17 nas 3) | A diferença da magia é o cântico |
| Texto das cartas de magia | **cântico 41,7 mil** caracteres × **regra 37,6 mil** | Há mais cântico que regra; no Fogo, 1,6× |
| Justificativa de design (`costNote`) | 36 cartas, 11,2 mil caracteres — **só nos dados, não é impressa** | corrigido em 2026-09-26: a v2 dizia que era impressa |
| Efeitos "uma vez por…" | **108** | Descanso Longo, Curto, combate, rodada |
| Arte de habilidade | 127 peças; **47 abaixo de 300 px** e 35 entre 300 e 400 px | A coluna tem ~335 px: aparecem esticadas |
| Revisão automática (125%) | 0 título solto · 0 estouro · 0 arte borrada/cortada · 6 págs. com ~20% em branco | Só o folheado foi revisado nesta fase |

### O sistema (medido pelos checks que já existem)

| Medida | Hoje | Fonte |
| --- | --- | --- |
| Teto de dano por Ação | Corpo **66,0** × Magia **33,0** → **2,0×** | `check:progressao` |
| …sem o Deus da Espada | Corpo 50,4 × Magia 33,0 → 1,5× | idem |
| Menor teto do livro | **Teórica 6,2/Ação** (Dardo Arcano, Principiante) | idem |
| Capstones que não compensam | **11** (rank alto rende menos por Ação que o de baixo) | idem |
| Dano por turno no 1º patamar | Corpo ~19–25 × Magia ~9–13 | régua do Apêndice C |
| Sobrevivência no 6º patamar | magos a Vigor 0 entre **0,53 e 0,71** turno contra o molde | `check:sobrevivencia` |
| Validações da Teórica | **33** regras que recusam uma fórmula | `magiaTeorica.ts` |

### O aparelho

| Medida | Hoje |
| --- | --- |
| Livro folheado pronto | ~3 s no computador · ~16 s num celular médio (CPU 4× mais lenta) |
| Páginas fora do livro | ~2,3 MB cada (eram 6,7–10 MB) |
| Celular | abre em **leitura contínua** por padrão (o folheado é de 768 px pra cima) — e o contínuo **não foi revisado** nesta fase |

---

## 3. Como este plano conversa com os outros

| Documento | O que é | Relação com este plano |
| --- | --- | --- |
| `PLANO-DE-REWORK.md` | As decisões já tomadas (Teórica, Utilidades, raças, Cura, Desintoxicação) | Continua valendo; as Etapas 2 e 5 executam o que falta dele |
| `O-QUE-FALTA.md` | Perguntas que só a mesa responde e pendências de aparelho | A Etapa 1 (teste de mesa) e a Etapa 4 (balanço) usam essas perguntas como roteiro |
| `PLANO-EXPERIENCIA-LIVRO-FOLHEAR.md` | Proposta (do Codex) de modelos editoriais, movimento e consulta no folheado | Vira a Etapa 7; **só começa depois da Etapa 3**, que muda muito texto e diagramação |
| `PLANO-LIVRO-PERFEITO.md` | A visão ampla do livro HTML | Referência; o folheado atual já cumpre boa parte |
| `NOVOS_ITENS.md` · `SISTEMA_DE_LOOT.md` | Itens e loot propostos (não rastreados no git) | Fora deste plano: é conteúdo novo, e a fase agora é cortar. Entram depois, **pelo livro primeiro** (Cap. 5) |

**Pra dois agentes não se atropelarem:** uma frente por vez no folheado; quem mexe na diagramação avisa no
`PROGRESS.md` e os dois rodam `revisar:livro` antes de subir.

---

## 4. As etapas

### Etapa 1 — Teste de mesa de referência · P · ★ portão

**Por que primeiro:** a prioridade número um é diversão, e ela só se mede jogando. Antes de cortar e
rebalancear, uma sessão curta dá a linha de base do que é divertido e do que trava, e responde perguntas
que o simulador não alcança.

**O que entra:** um kit pronto pro Mestre — quatro fichas de 2º patamar (um mago elemental, um do Corpo, um
de Utilidade, um de suporte), um encontro de 3 a 4 rodadas do bestiário, e uma folha de observação com
perguntas de sim/não:

- O mago elemental passou algum turno sem fazer nada útil?
- Alguém leu um cântico em voz alta? Alguém quis?
- Quanto tempo levou a primeira ficha, e em que regra a mesa parou pra perguntar?
- As perguntas do `O-QUE-FALTA.md`: o Vendaval apanha? Escudos lidera dano? O Tiro Perfeito sobrevive a
  quem leva dano? O teto de Ações do Tático segura?

**Kit pronto (2026-09-26): `KIT-DE-MESA.md`** — Ignis (Fogo), Borrasca (Deus do Norte), Capitã Vela
(Tático) e Irmã Sella (Cura), 9 PA cada, com link de importação; o encontro é Aranha das Cavernas +
3 Sapos-Lodo (Equilibrado no simulador). `npm run kit:mesa` refaz tudo depois de uma mudança de regra.

**Pronto quando:** a sessão aconteceu e a folha voltou preenchida. **Portão:** as respostas reordenam as
etapas seguintes se for preciso (por exemplo: se o mago do 2º patamar se divertiu, a Etapa 4 cai de
prioridade no começo de jogo).

### Etapa 2 — Magia Teórica: "três palavras e uma conta" · G

**Por que agora:** é a regra mais difícil do livro e tem o **menor teto de dano (6,2/Ação)**. Já está
decidida (★ do `PLANO-DE-REWORK.md`, §1).

**O que entra**
- Toda fórmula é **Essência + Verbo + Forma**, uma de cada (dois verbos só a partir do Avançado).
- **PM = custo da potência (tabela de uma linha) + 1 por palavra fora do básico.** Potência = o seu rank;
  some o segundo número (construção × potência).
- Verbos com nome de ação — **Lançar, Erguer, Selar, Sinalizar**; Expandir e Repetir viram formas
  (**Onda, Eco**); a ordem deixa de ser regra.
- Circuitos do Santo em diante como um passo só: **"armar"** (gatilho + ligação).
- Símbolos de outras escolas vêm de graça com a escola; os talentos de "aprenda um símbolo" viram talentos
  que fazem algo na mesa.

**O que não entra:** conteúdo novo de Teórica; mudança nas outras escolas.

**Pronto quando**
- validações que recusam fórmula: **33 → no máximo 8**;
- a regra cabe numa tabela de meia página; a Aula da Roxy vai de **5 → 3 lições**;
- a árvore cai de **12 → ~8 páginas**;
- teto de dano da Teórica no `check:progressao` **dentro da faixa da Magia** (~17–33/Ação);
- o Mestre arbitra uma fórmula sem abrir o site (testado com o autor).

**Onde mexe:** `magiaTeorica.ts` (+ testes), `trees/teorica.ts`, `RegrasDaTeorica.tsx`,
`AulaDaTeorica.tsx` e Cap. 2 §8, `FormulaWorkshop` (o Laboratório), `simbolosTeoricos.ts`, `FormulaGlyph`.

### Etapa 3 — Enxugar o texto de mesa · M · ★ portão

> **Medido em 2026-09-26, e muda esta etapa.** Testei a opção ★ dos cânticos (primeira linha + grito na
> carta, cântico inteiro num Apêndice H): o Cap. 3 caiu **1 página** e o apêndice ocupou **5** — o livro
> ficou **4 páginas maior**. Desfeito. A composição das 148 páginas das 19 árvores explica:
>
> | Parte | Páginas | Fatia |
> | --- | --- | --- |
> | Cartas (regra + cântico + arte) | 85 | 57% |
> | Espaço vazio (carta inteira na página + arredondamento de cada árvore) | 24 | 16% |
> | Maestrias | 17 | 12% |
> | Aberturas (mecânica, proficiências, progressão) | 12 | 8% |
> | Artes de fim de árvore | 8 | 5% |
>
> O cântico é ~1 página por escola de magia. Como cada árvore começa em página nova e fecha com arte, uma
> economia menor que uma página por árvore **some no arredondamento**. Conclusão: **a meta de ~250 páginas
> sai do plano** — o livro é comprido porque tem muita regra e porque a diagramação escolhe carta inteira e
> fecho com arte, e as duas coisas são pedidos do autor. A Etapa 3 fica com o que mexe no JOGO (3c, 3d,
> 3e); 3a não existe (o `costNote` não é impresso) e 3b fica como está, com o cântico inteiro na carta.

**Por que:** resolve três problemas de uma vez — aparência (páginas densas), peso (menos páginas, livro
mais rápido) e entrada no jogo (menos texto antes de jogar). Pode andar junto com a Etapa 2.

**3a. Justificativa de design fora das cartas.** As 36 cartas com `costNote` perdem o texto impresso; o
porquê continua no código e num **apêndice de design** ("Por que os números são estes").

**3b. Os cânticos.** Hoje há mais cântico que regra nas oito escolas.

**Opções para os cânticos**
1. ★ **O grito na carta, o cântico inteiro no apêndice.** A carta mostra a primeira linha e o grito final
   ("…Zero Absoluto!"); o texto completo mora num apêndice por escola e no Grimório da ficha, que já tem o
   botão de recitar. A Recitação Perfeita continua valendo com o cântico inteiro. *Por quê: mantém o
   sabor, a regra e a ficha, e devolve ~25 páginas.*
2. **Teto de três linhas:** todo cântico é reescrito pra caber em três linhas.
3. **Só no folheado:** o contínuo mostra tudo; o folheado mostra só o grito final.
4. **Página de cânticos por escola**, diagramada como pergaminho, no fim de cada árvore.
5. **Outro.**

**3c. Nomes de patamar.** Hoje três árvores têm escadas próprias ("Atirador, Caçador…", "Iniciante,
Aspirante…"), além de Rank, patamar e tier.

**Opções para os nomes**
1. ★ **Um nome só no livro inteiro** (Principiante → Imperador); o nome temático vira subtítulo pequeno
   ("Principiante · Atirador"). *Por quê: ninguém precisa decorar três escadas a mais, e o sabor fica.*
2. Manter os temáticos, com tabela de equivalência na abertura de cada árvore.
3. Tirar os temáticos.
4. **Outro.**

**3d. A contabilidade.** Revisar os **108** efeitos "uma vez por…": cortar ou trocar por custo (PM, PT, Ação)
os que não mudam decisão nenhuma, e padronizar o resto em três relógios só (combate, Descanso Curto,
Descanso Longo).

**3e. O caminho mínimo.** Uma página no Cap. 0: **o que ignorar até o 3º patamar** (Recitação Perfeita,
Interrupção, empilhamento, Conjuração Dividida…) e o que a primeira sessão precisa.

**Pronto quando:** efeitos "uma vez por…" **108 → ~75**; um nome de patamar só no livro; a página do
caminho mínimo existe e foi lida pelo autor. (A meta de páginas saiu: ver o quadro no começo desta etapa.)
**Portão:** o autor lê três árvores enxutas antes de o corte se espalhar pelas outras.

### Etapa 4 — Auditoria de balanço · M/G · ★ portão

**Por que depois das Etapas 2 e 3:** a Teórica nova e o texto enxuto mudam o que o simulador mede. Os
checks já existem (`check:progressao`, `check:sobrevivencia`, `check:arvores`, `combatSim`,
`encounterSim`); a etapa é usá-los de propósito, com hipótese, número antes e número depois.

| Frente | Pergunta | Meta ou decisão |
| --- | --- | --- |
| **Espada de Luz Verdadeira** | O 66/Ação do Deus da Espada é o pico declarado ou um número que escapou? Sozinho ele faz o 2,0×. | O autor decide: pico declarado (o livro diz que a árvore é vidro — ~8% de sobrevivência no playtest) ou corte pra perto de 50. |
| **Magia no começo** | O mago do 1º–2º patamar contribui? (1º: Corpo ~19–25 × Magia ~9–13) | Magia a no máximo ~30% abaixo do Corpo no dano por turno do 1º patamar, contando área. |
| **11 capstones** | Rank alto rendendo menos que o de baixo | Separar os de ÁREA (ficam: o check mede alvo único) dos que escaparam — os suspeitos são Corrosão (−56%), Sopro do Forja (−31%), Arremesso (−29%) e Golpe do Desespero (passa o Rei e o Imperador do Norte). |
| **Cura** | Curar + ferir + Culpa Fresca virou a melhor escola? | Luz de Dois Gumes abaixo da Água no mesmo patamar. |
| **Desintoxicação** | Com Dose e Inversão, ainda merece a tabela de PA barata? | Ensinar a Dose ao simulador (hoje ele não conta a Inversão) e decidir: tabela comum ou Inversão mais fraca. |
| **Despertares das raças** | Algum desequilibra? | Tridente Ancestral, Colosso e Forma do Dragão abaixo de um talento de Santo da árvore média. |
| **Sobrevivência no fim do jogo** | Mago de Vigor 0 cai em menos de 1 turno no 6º patamar (0,53–0,71) | O autor decide se é intenção ("o mago depende do grupo") e o livro diz isso — ou o molde de Terror/Lenda cresce menos. |
| **Orçamento de Encontro** | O Apêndice G diz que "uma criatura do patamar por jogador" é Equilibrado. O simulador, com as fichas do kit, dá **Letal** pra 4 de 2º patamar (44% de vitória, 2,5 quedas); 3 já é Perigoso (82%). | Medir nos seis patamares e decidir com o autor: a regra do livro muda (ex.: "três pra quatro jogadores") ou os moldes ficam mais fracos. A mesa da Etapa 1 desempata. |
| **Perguntas de mesa** | Vendaval, Escudos, Tático, Tiro Perfeito (do `O-QUE-FALTA.md`) | Respondidas pela Etapa 1; aqui viram número. |

**Opções para o começo do mago**
1. ★ **Truque de escola:** toda escola de magia ganha no Principiante uma magia de 0 PM, 1 Ação, dano
   pequeno. *Por quê: o mago nunca passa o turno sem fazer nada, e nenhum número acima muda.*
2. Subir os dados das magias do 1º e 2º patamar.
3. Baratear o PM do 1º patamar.
4. Aceitar e escrever no livro que o mago "acorda" no 3º patamar.
5. **Outro.**

**Pronto quando:** cada frente tem número antes e depois no patch notes; a régua do Apêndice C passa a
ser **gerada pelo simulador**, não escrita à mão; `check:progressao` com **no máximo os capstones de área**
na lista. **Portão:** uma segunda sessão de mesa, com o mesmo kit da Etapa 1, confirma que ficou melhor.

**Limite conhecido do motor** (não esconder): ele não vê Invocação, Bardo, Tático, Barreira nem o valor
das condições. Essas cinco se julgam na mesa.

### Etapa 5 — As três Utilidades: menu de Preparações + canções · G

**Já decidida** (★ do `PLANO-DE-REWORK.md`, §4). Hoje: 17 páginas, fato livre com quatro travas.

- Cada árvore (Ladino, Bardo, Tático) ganha **6 a 8 Preparações** com custo e efeito escritos; o fato livre
  continua como "outra coisa, com o Mestre".
- Talentos só de texto (Mapa Vivo, Contrabandista, Colecionador de Histórias…) viram Preparações ou saem.
- **Bardo:** a Dissonância automática vira **canções** — uma ativa por vez, trocar custa 1 Ação (Marcha,
  Guerra, Réquiem, Dissonância).
- **Tático:** o teto do Cap. 4, §5 ("4 Ações próprias + 2 concedidas") **já existe**; a etapa confere na
  mesa se ele segura, em vez de inventar outro.
- A regra compartilhada de PP no Cap. 3 é reescrita junto, com exemplo jogado.

**Pronto quando:** todo talento de Utilidade se compara pelo número com um talento de combate; a mesa joga
sem precisar das quatro travas do fato livre; Bardo e Tático passam a existir pro simulador (ou o livro
diz, na árvore, que eles se medem na mesa).

### Etapa 6 — Celular e leitura contínua · M

**Por que:** a mesa joga no celular (iPhone e Android), o celular abre o livro em **leitura contínua**, e
esta fase só revisou o folheado. Depois dos cortes das Etapas 2, 3 e 5 o contínuo muda muito.

**O que entra:** `check:mobile` e `check:a11y` no livro inteiro; revisão visual do contínuo em 375 px
(iPhone) e 412 px (Android) nos três pilares; a ficha e a loja no celular; o PDF da ficha saindo do
celular; as pendências de aparelho do `O-QUE-FALTA.md` (iOS antigo, ícone, splash, entalhe).

**Pronto quando:** zero alvo de toque pequeno e zero estouro horizontal no contínuo; uma árvore, uma
condição e uma ficha consultadas no celular em menos de 30 s cada.

### Etapa 7 — Experiência do folheado · M

Executa o `PLANO-EXPERIENCIA-LIVRO-FOLHEAR.md` (modelos de abertura, explicação e consulta; movimento curto
nas aberturas; diagramas que demonstram a regra; ficha de consulta de condição sem sair da página) e fecha a
**Fase 2 do `PLANO-DE-REWORK.md`**.

**Opções para os temas** (pendente desde a Fase 2)
1. ★ **Dois temas, os do livro** (noite e dia); o pergaminho sai. *Por quê: uma identidade só e metade
   das telas pra conferir.*
2. Quatro temas em dois botões (estilo × claridade).
3. O pergaminho como "clássico" escondido nas preferências.
4. Tema por seção (livro sempre noite, ficha sempre dia…).
5. **Outro.**

**Pronto quando:** os critérios de aceite do plano de experiência, e nenhuma animação custando mais que
~50 ms numa virada de página (medido).

### Etapa 8 — Congelar a diagramação · M

**Por que por último:** as etapas anteriores mudam muito texto; congelar antes seria refazer.

**Opções**
1. ★ **Guardar a diagramação no aparelho:** na primeira visita o livro se monta e salva as decisões; nas
   seguintes, aplica direto. *Por quê: nada muda no fluxo de trabalho, e quem volta ao livro espera a
   metade (celular ~16 s → ~8 s; computador ~3 s → ~1,5 s).*
2. **Diagramar no build:** um script monta o livro uma vez e grava as decisões com o site — abre igual em
   toda tela, mas toda mudança de texto pede rodar o script.
3. **PDF oficial** gerado a cada versão como a referência, e o folheado continua vivo.
4. Deixar como está.
5. **Outro.**

### Etapa 9 — Arte · P/M (contínua)

- **Aberturas de árvore de página inteira** com o acervo (Nami em Navegação, Brook no Bardo, o lutador em
  chamas no Punho do Fogo…), como a página do Dragão.
- **As 47 artes de habilidade abaixo de 300 px.** Parte foi reduzida de propósito, por peso.

**Opções para a arte pequena**
1. ★ **Mostrar no tamanho dela:** abaixo de 300 px, a arte entra do tamanho nativo, centrada na carta, sem
   ampliar. *Por quê: acaba o "parece erro" sem pedir arte nova nem pesar o livro.*
2. Trocar por arte melhor, uma a uma (pede arte do autor).
3. Tirar as abaixo de 220 px.
4. Recomprimir a partir dos originais em 400 px (mais peso).
5. **Outro.**

- Regra de sempre: toda imagem nova é olhada antes de ganhar nome, organizada no mesmo dia, e ganha cópia
  de impressão (`npm run gerar:impressao`).

---

## 5. Ordem, paralelos e portões

```
Etapa 1  Teste de mesa ──► portão (reordena se preciso)
Etapa 2  Teórica ─────────┐
Etapa 3  Texto de mesa ───┴─► portão (autor lê 3 árvores enxutas)
Etapa 4  Balanço ──────────► portão (2ª sessão de mesa)
Etapa 5  Utilidades
Etapa 6  Celular
Etapa 7  Experiência do folheado (+ temas)
Etapa 8  Congelar a diagramação
Etapa 9  Arte ─────────────── em paralelo, quando chegar imagem
```

Itens e loot (`NOVOS_ITENS.md`, `SISTEMA_DE_LOOT.md`) entram **depois da Etapa 5**, como fase própria, e
pelo Cap. 5 do livro antes da loja e do `/encontros`.

---

## 6. Todas as decisões do autor num lugar só

| Etapa | Decisão | ★ Minha escolha |
| --- | --- | --- |
| 1 | Quando e com quem jogar a sessão de referência | O quanto antes, com a mesa de sempre |
| 3b | Cânticos | ~~O grito na carta~~ — medido: aumenta o livro. **Ficam inteiros na carta** |
| 3c | Nomes de patamar | Um nome só; o temático como subtítulo |
| 4 | Espada de Luz Verdadeira | Decidir com o autor depois da sessão |
| 4 | Começo do mago | Truque de escola de 0 PM |
| 4 | Desintoxicação: tabela barata ou Inversão mais fraca | Decidir com o número na mão |
| 4 | Mago de patamar alto que depende do grupo | Assumir e escrever no livro, se a mesa confirmar |
| 7 | Temas | Dois, os do livro |
| 8 | Congelar a diagramação | Guardar no aparelho |
| 9 | Arte pequena de habilidade | Mostrar no tamanho nativo |

---

## 7. Riscos e como se protege

| Risco | Proteção |
| --- | --- |
| Um corte de texto apaga uma regra junto | `check:texto` compara prosa e campos; a Etapa 3 corta só `costNote` e cântico, que não são regra |
| Um rebalanceamento quebra fichas salvas | migração no store (como a da v9) + teste de migração pra cada id mudado |
| Mudar a diagramação estraga páginas já boas | `revisar:livro` em 100% e 125% antes de todo commit; as pendências da seção 8 são conhecidas, não surpresa |
| Dois agentes no folheado ao mesmo tempo | uma frente por vez; aviso no `PROGRESS.md` |
| O plano envelhecer | esta tabela de base (seção 2) é refeita no fim de cada etapa, e o plano ganha "versão 3" |

---

## 8. Incongruências achadas ao escrever este plano — ✅ resolvidas (2026-09-26)

- A ficha mostrava o Teto de Ações antigo ("máximo 5 Ações por turno, 2 externas") e o Teto de Auxílio
  errado (+5); agora diz o que o livro diz (Cap. 4, §5): **4 próprias + 2 concedidas** e **+6**.
- O `O-QUE-FALTA.md` (item 5) e o comentário de `vantagem.test.ts` citavam o mesmo teto antigo; corrigidos.

### Achadas ao montar o kit de mesa (2026-09-26) — abertas

- **O bestiário do `/encontros` não está no livro.** As 26 criaturas de `preMadeMonsters.ts` (Urso de
  Presas Vermelhas, Guerreiro Superd, Troll de Caverna…) só existem no site; o livro tem as 6 fichas
  prontas do Apêndice G. Quebra "nada fora do livro". Opções: levar as 26 pro Apêndice G como tabela
  (nome, patamar, papel, arquétipo, traços), ou tirá-las do site. O kit já usa só as do livro.
- **Criaturas do mesmo patamar e papel são iguais no simulador.** Urso, Troll e Superd dão o mesmo
  resultado número por número: sem ações próprias, a diferença é só o nome e as resistências. Entra na
  Etapa 4 junto com o orçamento.
- **O orçamento de encontro do Apêndice G contradiz o simulador** (ver a tabela da Etapa 4).

## 9. Pendências de diagramação conhecidas

Entram quando uma etapa tocar a página — a Etapa 3 deve resolver parte delas sozinha, ao encurtar o texto.

- Pág. ~69: meia página vazia embaixo do diagrama do Tiro Perfeito (limitação do navegador com a peça larga).
- Rótulos ("O que ela não faz", "Proficiências") que às vezes ficam no pé da coluna.
- Maestria maior que 60% da coluna ainda parte (a de Atirador).
- Tabela dos Olhos Místicos (Cap. 1) deixa duas linhas na página seguinte.
- Só no PDF: carimbo de caixa solto no pé da página e sem selo no vão.
