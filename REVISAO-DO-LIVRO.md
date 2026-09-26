# Revisão do livro — 2026-09-26

Três revisores leram o livro página a página (texto e mecânica) e conferiram os números contra
`src/data` e `src/lib`. Aqui ficam: **(A)** os consertos seguros, que só alinham o texto com os dados ou
corrigem fato, e **(B)** as decisões de mecânica, que esperam o autor. Referências são `arquivo:linha`
na data da revisão (as linhas podem ter andado; procure pelo trecho).

## A. Consertos seguros (texto e fato, sem mudar regra)

### Cap. 0 a 2
- `Chapter1.tsx` (~159): "as quatro escolas de Espírito" → **três** (a quarta era a Barreira).
- `Chapter0.tsx` (~117): o Improviso do exemplo está invertido. Reescrita: "O chute é o Improviso da
  Maestria (1 Ação, uma vez por combate): o lobo testa Agilidade **com Desvantagem** contra CD 8 + Força 3
  + Rank 1 = 12, falha e fica Cego até o fim do próximo turno dele. Borg ataca com Vantagem (alvo Cego):
  1d10 + 3 + 1." (fonte: `norte.ts` ~41).
- `Chapter0.tsx` (~127): o Impacto de Gelo é "1d8 de frio + BC" com o frio dobrando contra Molhado:
  "1d8 + 5 vira **2d8 + 5**, passe ele no teste ou não" (`agua.ts` ~98).
- `Chapter0.tsx` (~89) e `Chapter2.tsx` (~300-318): as Grandes Obras são **seis** (falta O Chamado que Não
  se Recusa, `invocacao.ts` ~240).
- `Chapter2.tsx` (~607): só o **Fogo** exclui criaturas da área na Maestria do Avançado. Reescrita: "A
  exceção se compra: a Maestria de Avançado do Fogo exclui até INTELECTO criaturas de cada área sua."
- `Chapter0.tsx` (~93-98) e `Chapter2.tsx` (~169-204): a "lista fechada" do "não existe ação bônus" não
  bate com as cartas (Mãos Limpas, O Grande Círculo, Sem Peso, Encadeamento; Terra e Desintoxicação também
  têm Maestria de Imperador). Reescrita do aside do Cap. 0: "**Não existe ação bônus.** Existem efeitos
  que a própria carta marca 'sem gastar Ação', sempre com um limite escrito. **Conjurar** sem gastar Ação
  só acontece nas fontes do quadro do Cap. 2, §2." — e acrescentar as fontes que faltam no quadro.
- `Chapter1.tsx` (~686-688): o Gênio não é o único a conjurar em silêncio com o feitiço inteiro. Reescrita:
  "O Gênio não sofre nenhuma das duas, **em escola nenhuma, desde a criação**. Talentos e Maestrias tiram a
  penalidade de uma escola só, e custam PA."
- `Chapter2.tsx` (~164-166): "os dois talentos" — falta a Maestria de Santo da Cura.
- `Chapter2.tsx` (~181-203): Prodígio não é fonte a mais: "a cortesia do Principiante passa a valer até o
  Avançado" (`backgrounds.ts` ~262).
- `Chapter1.tsx` (~269): "(Cap. 2, 'A Escola Barata')" → "(logo abaixo, 'A Escola Barata')".
- `Chapter1.tsx` (~290): acrescentar "(na Desintoxicação, só do Avançado em diante)".
- `Chapter1.tsx` (~757): "Escudos e Fortificação" → **Cavalaria e Escudos**.
- `Chapter2.tsx` (~525): Fio da Vida é Cap. 4, **§6**.
- `Chapter2.tsx` (~510-513, 555): o Teste de Concentração é 1d20 + Espírito + **metade do maior Bônus de
  Rank**; ajustar o exemplo ("um conjurador Avançado com Espírito 2 (+4 no teste), contra CD 13").
- `Chapter2.tsx` (~542): acrescentar "Surdo não derruba Conjuração Silenciosa" (`condicoes.ts`).
- `Chapter2.tsx` (~558): Vácuo Localizado: "Sem teste contra rank igual ou inferior ao seu em Vento;
  contra superior, teste de Vigor. Não para Conjuração Silenciosa."
- `Chapter2.tsx` (~103): tirar "Amarra" (magia da Barreira, que saiu).
- `Chapter2.tsx` (~60-68): "Invocação" → **Espíritos e Feras**; "exatamente as mesmas regras" → "as mesmas
  **regras de conjuração**".
- `Chapter1.tsx` (~667) e `Chapter0.tsx` (~160): "Escolher em vez de rolar custa 1 PA (seção 5)"; passo 5:
  "Gaste os PA iniciais — 3, ou 2 se a mesa escolheu em vez de sortear".
- `Chapter1.tsx` (~845-849): reescrever sem bastidor: "Cumpridos os dois pré-requisitos, a híbrida pode ser
  aberta pelo Custo de Abertura normal; nenhuma pode ser a Árvore Inicial."
- `Chapter2.tsx` (~224-226): Canções de Bardo gastam PP: "Canção com rolagem: Vantagem ou +2 na CD; sem
  rolagem: 1 PP a menos (mínimo 1)."
- `Chapter2.tsx` (~631): sustentação — "salvo carta que diga o contrário (ex.: Maestria de Santo da Cura,
  Vento Constante)".
- `Chapter2.tsx` (~371-378, 477-482): remeter ao **Cap. 3**, não à "página de Árvores" do site.
- `Chapter2.tsx` (~472-474): "Roxy não comprou o Congelado; ela entendeu água fundo o bastante pra que o
  gelo pegasse sozinho em quem já estava molhado."
- `Chapter1.tsx` (~375) e `teorica.ts`: "1 à escolha entre 3" — a Teórica oferece 4; ajustar o texto.
- Polimento: `Chapter1.tsx` ~104-107, ~87 ("antes dos bônus de Raça e Antecedente"), ~236 ("magias,
  técnicas e talentos"), ~326-336 (quebrar em quatro tópicos), ~523/560 (referência da Escada de Dados),
  ~804 ("e +1 PA a cada árvore seguinte"), ~754 ("quase sempre"); `Chapter2.tsx` ~458 (tirar "em Rank
  Avançado"), ~248 (coluna "Teto de estilo"), ~450 (Lâmina em Chamas); `Chapter0.tsx` ~67/87.
- `vendaval.ts` ~87: `grantedSkills` que o livro diz que a híbrida não ensina — remover.

### Cap. 3 (árvores)
- Termos da Barreira que ficaram: "A Casca (Barreira)" em `cura.ts` ~93; "Barreira" na lista da Forma
  Suprema em `invocacao.ts` ~123 (virou Magia Teórica).
- `fogo.ts` ~368 Flashover: "Raio de 90m" → "Esfera de 12m a até 90m".
- `vento.ts` ~261: Tempestade Cortante diz 30m no alcance e 15m no efeito — alinhar.
- `agua.ts` ~475 Zero Absoluto: dizer se a dobra do Molhado já está nos 24d12.
- `escudos.ts` ~159 "Muralha de Um" e `suishin.ts` ~147 "Muralha de Um Homem": renomear uma.
- Termos não definidos: "Atrasado", "Lentificado" (`espada.ts` ~281), "Desarmado" como condição
  (`suishin.ts` ~236) — definir ou trocar por condição existente.
- `norte.ts` ~133 Empunhadura Dupla: o texto diz talento e a carta é habilidade de 1 Ação — alinhar.
- `arquearia.ts` ~107 Etapa Encurtada custa 2 PA no Intermediário (a tabela manda 1): corrigir ou dar
  `costNote`.
- `lutador.ts` ~303: o Golpe que Fecha a Conta conta até 1× o Bônus de Rank, mas o teto é 2×.
- `check:livro`: Rosa-Preta acima do teto de caracteres; Fel Alado e Sombra no Sangue sem `costNote`.
- Rituais com versão Encurtada, que o `Chapter2.tsx` ~584 proíbe: Mar de Chamas, Cumulonimbus, Muro de
  Terra, Sono Reparador, Restauração, Purificação — tirar a Encurtada ou tirar o "Ritual".

### Cap. 4, 5 e Apêndices
- `condicoes.ts` ~161-186, 232-237: Estagnação, Fonte, Fluxo Interrompido e Selado são "regra legada da
  antiga Barreira" — tirar do Glossário (se preciso, um quadro "Fichas anteriores à Magia Teórica").
- `Appendices.tsx` ~158: "a Espada de Luz do seu Principiante" → "o Corte de Braço do seu Principiante".
- `Appendices.tsx` ~41/61: a Roxy tem **143 PV** (e 41 com Vigor −2) — refazer a conta.
- `Chapter4.tsx` ~544: Fio da Vida = "1d20 + Vigor + metade do seu maior Bônus de Rank".
- `Chapter4.tsx` ~807-809: Peçonha é Intermediária — "Poção de Antídoto Forte (Cap. 5, §4)".
- `Chapter4.tsx` ~878 x 763: a Sombra Líquida mata sem dado — "No quarto dia, teste de Vigor CD 16; na
  falha, o coração para."
- `bestiary.ts` (Sapo ~812, Serpente ~847, Aranha ~880, Wyvern ~924): aflição com teste de Vigor contra a
  CD da aflição (Baba 10, Peçonha 12, Toxina 12, Fel 14).
- `Appendices.tsx` ~320-327: exemplo do Cerco — Força final 2, e tirar o "teto narrativo 8".
- `Appendices.tsx` ~597-602: "um grupo com curandeiro aguenta de três a quatro deles por dia de aventura".
- `Appendices.tsx` ~611-613: escrever as 4 faixas de temperatura do site (Fácil até 0,75 / Equilibrado até
  1,25 / Difícil até 1,5 / Mortal acima).
- `Appendices.tsx` ~460: acrescentar a coluna "Ações típicas" (o dado está em `acoesSugeridas`).
- `Appendices.tsx` ~543: "Quando uma criatura aplica condição de CD 8 + BC, use a CD de resistência da
  tabela dela." ~478: "Resistir: 1d20 + Bônus de Resistência, sem somar atributo." ~221: "PP = Intelecto +
  o maior atributo-chave entre elas, +1 por patamar do 3º em diante."
- `Chapter5.tsx` ~469: título "Por que o travado nunca passa do dobro do livre". ~334: "Sombra Líquida" no
  lugar da Praga. ~177: maior preço é **2.000 PO**. ~134-140: acrescentar os itens travados por Rank que
  faltam (Vigor Passageiro D, Régia B, Regeneração A, Imperial e Égide Lendária S).
- `Chapter4.tsx` ~107-121 (teto de PM): tirar o bastidor ("redação canônica", `mpPerRank`) e corrigir "17
  com Migurd" (é 15; 17 só com Nascente de Mana).
- `Chapter4.tsx` ~626/638: "qualquer magia de Cura de rank Avançado ou superior, fora de combate".
- `Chapter4.tsx` ~137-141: "+1 no Principiante e Intermediário, +2 no Avançado e Santo, +3 no Rei e
  Imperador". ~619: "testes de Vigor". ~627: "Encantamento Encurtado". ~230: "Teste de Concentração".
  ~339: mover o empate de Iniciativa pra linha de Iniciativa. ~899: "Ração de Viagem (5 PO por semana)
  resolve a fome; um Cantil cheio, a sede." ~309: regra de Voo. ~40: "arredonde". ~125: "e sobram 4 PM".
- `Chapter5.tsx`: ~18-21, ~27, ~45, ~60, ~128, ~316 ("Elixir do Fôlego"), ~415 — ver a revisão.
- `Chapter5.tsx` ~345: tirar "a herdeira da antiga Barreira"; ~367 "Itens Mágicos Únicos — o Anel de
  Teleporte".
- `Appendices.tsx` ~547-551 repete ~361-365: deixar um.

### Bastidor pra cortar (histórico de desenvolvimento, não interessa à mesa)
Reduzir a um "por quê" de uma frase, sem datas nem "antes era": `Chapter1.tsx` ~692-694, ~812-814;
`Chapter2.tsx` ~255-270, ~294-296, ~379-390, ~442, ~490-491; `Chapter4.tsx` ~150-163, ~243-257, ~746-752,
~317, ~769, ~860; `Chapter5.tsx` ~68, ~143-146, ~286-299; `Appendices.tsx` ~116-121, ~495-511, ~382, ~544,
~594, ~695-697 (documentação do simulador vai pra ajuda da tela de Encontros).

## B. Decisões de mecânica (esperam o autor)

Cada uma com a opção recomendada (★). O detalhe e os números estão na conversa de 2026-09-26.

**Cap. 1–2**
1. Encantamento Encurtado deixa a Conjuração Padrão sem uso (metade dos dados arredondado pra cima).
   ★ o **dano total** (dados + BC) cai pela metade na Encurtada.
2. O teto de PM `4×MB+8` anula o Espírito nos dois primeiros patamares. ★ o teto passa a usar
   `máx(Espírito,4)×MB + 8`, cortando só PA avulso e antecedente.
3. Recitação Perfeita favorece magia de ataque. ★ magia com teste: o alvo resiste com Desvantagem.
4. Vantagem em todas as resistências de um atributo por 2 PA vira compra obrigatória de todo mago. ★ +2.
5. Espírito governa 8 de 20 perícias. ★ Intimidação passa pra Força.

**Cap. 3**
6. Segunda Bala (Terra): dois Canhões pelo custo de um. ★ o segundo tiro custa +1 Ação.
7. Colapso Solar (Punho do Fogo): o Sol Menor pela metade do tempo e sem PM. ★ 10d10+BC em 30 m.
8. Cabeçada (Lutador, Principiante): atordoa chefe metade da luta. ★ o alvo perde 1 Ação, uma vez por
   combate por alvo.
9. Vazio (Vento): 7d10 por turno sem teste por 1 minuto. ★ teste de Vigor por turno pra metade, 3 turnos.
10. Área poupando aliados só existe no Fogo. ★ exclusão na Maestria do Avançado das quatro elementais, e o
    Calor Dirigido vira "excluídos ganham Resistência ígnea".
11. Fogo não é a escola de dano no Rei/Imperador. ★ Flashover e Sol Menor em 3 Ações.
12. Urso das Cavernas faz 4d10 no Intermediário por 1 PA. ★ 2d10.
13. Entrada do Vendaval exige Avançado duplo. ★ Intermediário + Intermediário.
14. Talentos anulados por Maestria posterior sem devolver PA (Mão Silenciosa, Zero Perfurante, Convocação
    Aprimorada, Coração de Brasa). ★ a Maestria melhora o talento em vez de copiá-lo.
15. Arquearia some no meio do jogo contra o Manto de Touki. ★ Flecha de Touki já no Santo.

**Cap. 4–5 e Apêndices**
16. Chefe: o livro multiplica o dano, o site dobra os PV; e o chefe "fácil" dizima o grupo em 1 de 4.
    ★ ficar com PV×2 + rodadas extras (o que o site faz), e o chefe pesa 5 no orçamento.
17. Exaustão 1 já tira o Manto e dá Desvantagem — pune quem foi salvo. ★ reescalonar os 6 níveis.
18. Trauma, Cicatriz e Exaustão punem a mesma queda. ★ Trauma só por ver aliado morrer, só em perícias
    sociais.
19. Esquivar e Defender gastam Ação e valem pro primeiro ataque só. ★ Esquivar: Desvantagem em todos os
    ataques de uma criatura até seu turno; Defender: redução em todos os golpes, pela metade.
20. Bloquear com Escudo (+5 CA e metade do dano, de graça) torna o escudo obrigatório. ★ se acertar,
    reduz 2× o Bônus de Rank.
21. A Loja trava itens por um palpite de Rank de Aventureiro que o livro diz não ser regra. ★ todo
    personagem começa Rank F.
22. A Marca do Mestre (dojos) contradiz o limite de uma provação por árvore. ★ revisita uma vez só, só com
    a porta do PA livre.
