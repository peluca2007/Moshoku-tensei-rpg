export interface PatchNoteSection {
  heading: string;
  items: string[];
}

export interface PatchNote {
  version: string;
  date: string;
  title: string;
  sections: PatchNoteSection[];
}

/**
 * Histórico de mudanças de game design do sistema, mais recente primeiro.
 * Toda atualização relevante de regras/balanceamento entra aqui.
 */
export const PATCH_NOTES: PatchNote[] = [
  {
    version: "0.0.9",
    date: "2026-09-03",
    title: "Ganhar Duas Vezes a Mesma Coisa",
    sections: [
      {
        heading: "Pontos de Touki entram no Padrão das Reservas",
        items: [
          "PT era a única das três reservas fora do Padrão do Cap. 1: PV e PM escalavam por patamar, PT vinha como número fixo. A consequência não era só inconsistência — era redundância. CINCO árvores tinham DOIS talentos de PT em patamares diferentes fazendo a mesma coisa com um número diferente: \"+2 PT Máximos\" no Intermediário, \"+3 PT Máximos\" no Avançado.",
          "Os sete talentos de reserva de PT agora rendem +1 PT POR PATAMAR seu naquela árvore, como os de PV e PM sempre renderam. Um talento só cobre a árvore inteira.",
          "Os três talentos que sobravam deixaram de ser tanque maior e viraram RECARGA: uma vez por combate, sem gastar Ação, recupere PT iguais ao seu Bônus de Rank. No Escudeiro, que gasta PT mais rápido que qualquer árvore, isso é o que faz a segunda metade da luta ainda ter um Escudeiro nela. No Deus da Espada, compra um segundo primeiro turno. No Vendaval, vem junto com 9 metros de deslocamento que contam para a Distância Roubada.",
        ],
      },
      {
        heading: "Estilo Vendaval — duas habilidades que só repetiam um patamar anterior",
        items: [
          "Mil Cortes no Vendaval (Rei) era o Redemoinho de Aço (Intermediário) com o raio 3× maior e o dado 2× maior, quatro patamares depois — o mesmo botão, mais caro. Agora o raio VEM da Distância Roubada do turno (3m a 12m): você não gira no lugar, atravessa o grupo e corta no caminho. Cada alvo que cair devolve 1 PT.",
          "Corte que o Vento Termina (Santo) era o Corte do Horizonte Curto (Avançado) com mais dado e mais Ação. Agora a segunda lâmina segue por toda a sua Distância Roubada — e se você não se moveu neste turno, ela não sai.",
        ],
      },
      {
        heading: "O chefe solo não sobrevivia a um grupo de cinco",
        items: [
          "A regra do Apêndice G era \"chefe único: dobre o PV e mantenha o dano\". Ela resolve a vida do chefe e ignora o problema real, que é economia de ação: cinco personagens agem quinze vezes por rodada, um chefe age três.",
          "Numa simulação de 2.000 combates, um grupo de 3º patamar derrubava o chefe de Elite (um patamar ACIMA deles) em 2,4 rodadas perdendo 0,7 personagem — e ainda vencia 59% contra um chefe DOIS patamares acima.",
          "Regra nova: o chefe ganha uma rodada inteira a cada dois personagens do grupo (mínimo 1). Um grupo de cinco enfrenta um chefe que age duas vezes por rodada. A curva virou o que devia ser: mesmo patamar 100% com uma baixa, um acima 70% com o grupo quase inteiro no chão, dois acima 0%.",
        ],
      },
      {
        heading: "npm run check:redundancia",
        items: [
          "Detector novo: compara toda habilidade, talento e Maestria com todas as outras da MESMA árvore, entre patamares diferentes, por sobreposição de vocabulário. Ele procura a progressão que não progride — \"ganho isso no 1º e ganho quase igual no 3º\" — que nenhum check de consistência pega, porque não há contradição nenhuma, só repetição.",
          "Achou 10 pares acima de 40%. Cinco eram escadas legítimas (Bala de Pedra → Canhão de Pedra), três eram os talentos de PT e dois eram o Vendaval. Ele ignora de propósito os talentos de reserva entre si: o Padrão das Reservas existe justamente pra que eles digam a mesma frase.",
        ],
      },
      {
        heading: "Correções",
        items: [
          "getPtPool lia só o campo de PT fixo e ignorava o novo campo escalar — os sete talentos convertidos estavam concedendo ZERO. Pego por um teste escrito junto com a mudança, antes de qualquer ficha ver.",
          "28 testes no total (eram 26).",
        ],
      },
    ],
  },
  {
    version: "0.0.8",
    date: "2026-09-03",
    title: "A Régua Agora Se Mede",
    sections: [
      {
        heading: "Apêndice C — a régua de dano saiu da prosa",
        items: [
          "A Tabela Comparativa de Dano por Turno — que o livro chama de \"a régua com que toda árvore futura deve ser medida\" — era 15 colunas × 6 linhas de valores digitados à mão dentro do texto. Era a única régua do livro que ninguém verificava, e ela já estava errada: o Sopro Podre caiu de 10d8 pra 6d8 no rework da 0.0.3 e a coluna da Desintoxicação continuou anunciando ~55 no 5º patamar, um número que a escola não alcança mais.",
          "A tabela virou dado (src/data/danoPorTurno.ts) e o Apêndice C passa a renderizá-la de lá. Os números continuam sendo calibragem humana — \"dano por turno\" embute Ações, número de alvos e o Touki do inimigo, e nada disso está nos dados de uma magia isolada.",
          "O que mudou é que agora existe um piso verificável: o check:livro compara cada célula com a média do maior golpe único daquele patamar, JÁ AMORTIZADA pelas Ações que ele custa (uma magia de 6 Ações entrega metade por turno — o próprio Apêndice C explica isso). Uma coluna pode ficar acima desse piso; nunca abaixo.",
          "As quatro colunas que o próprio livro diz não medirem dano — Cura, Desintoxicação, Barreira e Escudos — ficam marcadas como fora da régua e não são verificadas. Cobrar delas uma promessa que elas nunca fizeram seria inventar regra.",
          "A coluna do Vento no 3º patamar foi corrigida de ~30 para ~32, que é o que os dados entregam.",
        ],
      },
      {
        heading: "Testes — 35 fórmulas, zero cobertura",
        items: [
          "selectors.ts calcula TODO número da ficha (PV, PM, PT, PP, CA, BC e o PA gasto) em 35 funções puras, e não tinha um único teste. Duas das correções desta sessão foram exatamente do tipo que teste pega e revisão humana não: a ficha imprimia count × 2 PA enquanto o motor cobrava a escada progressiva, e perfectRecitationBonus lia um campo que nunca existiu no tipo.",
          "23 testes cobrindo PV Máximos e o Fator de Vigor, PM e o cap dos dois primeiros patamares, Pontos de Touki, os custos progressivos de PA, o Custo de Abertura de árvore, BC/CD por árvore e a Classe de Armadura.",
          "Cada expect cita a seção do livro que o justifica, então quando um quebra dá pra saber na hora se quebrou o código ou se a regra mudou. npm test.",
        ],
      },
      {
        heading: "Lint limpo pela primeira vez",
        items: [
          "Os quatro avisos que arrastavam há sessões foram resolvidos — e nenhum deles era um bug: os três hooks do Destiny Board estavam CERTOS como estavam, e adicionar as dependências que o linter pedia causaria loop (o mapa saltaria de volta ao centro sem parar, a câmera ficaria presa numa árvore). Cada um ganhou o disable com o motivo escrito.",
          "O quarto era o idioma de descartar uma chave por destructuring. O eslint passou a aceitar o prefixo _ para variável, argumento e erro capturado, que é a convenção que já diz isso.",
        ],
      },
    ],
  },
  {
    version: "0.0.7",
    date: "2026-09-03",
    title: "O Divino Não Se Compra",
    sections: [
      {
        heading: "Punho de Fogo — patamar Deus virou narrativo",
        items: [
          "O Punho de Fogo era a única das 19 árvores com um patamar Deus COMPRÁVEL: uma Maestria, um talento e três habilidades, custando PA como qualquer outro rank. Isso contradizia o Cap. 1, §3, que diz que o Divino \"não possui custo mecânico de PA\" e \"só pode ser alcançado através de intenso Roleplay e eventos lendários\".",
          "O conteúdo não foi jogado fora. A Aura do Alfa e Ômega, o Big Bang Marcial, a Ignição da Alma e o Julgamento de Prometeu viraram o corpo do quadro narrativo A AURA DO ALFA E DO ÔMEGA. O que se perdeu foi o preço em PA e a rolagem — que é exatamente o que o livro diz que o patamar Divino não tem.",
          "O Estilo Vendaval já tinha recebido o quadro narrativo dele na 0.0.6 (O Passo Que Não Termina). Agora as 19 árvores tratam o Divino do mesmo jeito, sem exceção.",
          "MIGRAÇÃO v10: uma ficha salva que já tivesse comprado no patamar Deus do Punho de Fogo perde essas compras e o desbloqueio do rank — e o PA volta a ficar disponível, em vez de sumir do total sem nada explicando por quê.",
        ],
      },
      {
        heading: "Correções",
        items: [
          "A tabela de custos do Cap. 1, §3 imprimia DUAS linhas \"Deus\": uma cobrando 4 PA (vinda de RANK_REQUIREMENTS) e outra, escrita à mão logo abaixo, dizendo \"Narrativa\". As duas se contradiziam no meio da seção que existe justamente para explicar quanto cada rank custa. É o mesmo bug de linha duplicada que a tabela de patamares do Cap. 3 tinha.",
          "O check:livro passou a tratar patamar Deus comprável como ERRO, não aviso — a decisão fica trancada, e a próxima árvore que tentar abrir exceção quebra o build.",
        ],
      },
    ],
  },
  {
    version: "0.0.6",
    date: "2026-09-03",
    title: "A Mão Não Envelhece",
    sections: [
      {
        heading: "Magia de Cura — o Rei deixou de ser um patamar morto",
        items: [
          "A escada de cura direta parava no Santo: Cura Radiante (10 PM, 20d8+BC contra Ferida Fresca) era a melhor magia de cura de um Santo, de um Rei E de um Imperador. O Rei ganhava Restauração e Milagre Menor — utilidade alta — mas curava exatamente o mesmo que o patamar anterior, num livro em que toda escola ofensiva ganha um número maior a cada rank.",
          "A Maestria do Rei (Golpe Divino) ganhou A MÃO NÃO ENVELHECE: toda magia de Cura sua rola +1d8 por rank de diferença entre o seu patamar e o rank da magia. No Rei, a Cura de 1º patamar rola +4d8 e a Cura Radiante rola +1d8 — é o que impede a sua magia mais barata de virar lixo de ficha.",
          "CORPO DE FERRO (Santo) dava +50 PV MÁXIMOS fixos: o único número solto da árvore. Não escalava (valia o mesmo no Santo e no Imperador) e usava a categoria errada — PV máximos não são gastos antes dos reais e não expiram, então a magia funcionava como cura permanente disfarçada de escudo. Agora são PV TEMPORÁRIOS iguais a 8 × o seu Bônus de Rank (32 no Santo, 48 no Imperador), e não acumulam com Vigor Emprestado.",
        ],
      },
      {
        heading: "Rank Deus do Estilo Vendaval",
        items: [
          "Era a única árvore do livro sem quadro do patamar Divino — e a ausência pesava mais nela, porque uma árvore híbrida já é um teto por definição.",
          "O PASSO QUE NÃO TERMINA: todo patamar do Vendaval apenas alarga o número da Distância Roubada (9m, 12m, um piso de 6). O Divino apaga o número — o espadachim não percorre a distância até o alvo, ele já a percorreu antes de decidir atacar. Nenhuma das duas escolas de origem reivindica o título: o Norte diz que é vento, o Vento diz que é esgrima.",
        ],
      },
      {
        heading: "Uma regra, uma redação",
        items: [
          "O teto de PM dos dois primeiros patamares estava escrito quase palavra por palavra em Cap. 1, §1 e Cap. 4, §1. Duas cópias da mesma regra é exatamente como nasceram as sete contradições corrigidas na 0.0.5. Agora a redação canônica vive no Cap. 4, §1 (junto da fórmula) e o Cap. 1 aponta pra lá.",
          "Cinco magias divergiam da tabela de Ações do próprio rank sem a nota que o Cap. 2 exige: Chamado, Retorno, Troca de Lugares e Corpo Emprestado (Invocação) e Santuário (Cura). Todas ganharam a justificativa — na Invocação, o custo em Ações não escala com o rank de propósito, porque o preparo acontece fora de combate e um gesto não fica mais lento porque o invocado ficou mais forte.",
        ],
      },
      {
        heading: "npm run check:livro",
        items: [
          "Substitui o check:magias por uma verificação de consistência entre os DADOS e o TEXTO do livro. As sete contradições da 0.0.5 nasceram todas do mesmo jeito: um número escrito à mão numa frase, e depois o dado mudou.",
          "Ele confere: a contagem de árvores citada na prosa contra TREES.length; que toda árvore declara Mecânica Central e tem quadro de Rank Deus (ou patamar Deus próprio); que a tag da mecânica aparece na Maestria de 1º patamar; que toda magia tem cântico; que o cântico respeita a faixa do rank; e que todo desvio da tabela de Ações carrega costNote.",
          "Na primeira execução ele achou 21 técnicas do Punho de Fogo sendo tratadas como magia sem cântico — o check antigo não as via porque olhava uma lista fixa de árvores. A regra correta ficou explícita: só as OITO ESCOLAS DE MAGIA recitam; técnica marcial que gasta PM é executada, não conjurada.",
        ],
      },
    ],
  },
  {
    version: "0.0.5",
    date: "2026-09-03",
    title: "Comece Aqui",
    sections: [
      {
        heading: "Novo capítulo de abertura",
        items: [
          "O livro ganhou um capítulo \"Comece Aqui\", antes do Capítulo 1: o que é o jogo, a ficha em seis números, um turno de combate, uma rodada jogada de ponta a ponta, criação em seis passos, e um índice de onde encontrar cada coisa.",
          "Ele existe porque o livro abria em \"o sistema utiliza 5 atributos principais\" — quem nunca jogou via uma decisão de ficha antes de saber o que é um turno. Cinco minutos de leitura, uma vez só.",
          "A rodada de exemplo mostra a Magia de Água preparando no 1º turno e cobrando em dobro no 2º, para ensinar a regra dos dois tempos com um caso concreto em vez de uma explicação.",
        ],
      },
      {
        heading: "Contradições de regra corrigidas",
        items: [
          "INTERRUPÇÃO DE CONJURAÇÃO: existiam duas regras conflitantes. O Cap. 2, §6 (novo na 0.0.4) usava CD 8 + metade do dano; o Cap. 4, §3 usava CD 10 + Bônus de Rank de quem acertou. Vale a do Cap. 4 — o próprio livro já explicava, desde 2026-08-29, por que a versão baseada em dano não sobrevive à progressão: o dano cresce sem teto e o teste trava em +11, então magia de 4 a 6 Ações ficaria impossível de conjurar nos patamares em que ela existe.",
          "SALVAÇÕES: o Cap. 4, §4 diz \"Duas Salvações por Combate\", mas Santuário Menor (Cura, Santo) citava \"Uma Salvação por Combate\". Corrigido para duas.",
          "A lista de formas de impedir uma morte passou de quatro para cinco — a Égide Lendária (item de Rank S) estava fora da contagem, apesar de o próprio item se declarar parte dela.",
          "CONTAGEM DE ÁRVORES: o livro dizia 17 ou 18 em seis lugares diferentes. São 19 desde que o Punho de Fogo entrou, na 0.0.2.",
          "A tabela de patamares do Cap. 3 renderizava uma linha 7 duplicada, com bônus +8 — valor que não existe em RANK_BONUS (o rank Deus é +7). Ofícios agora mostram \"—\" no 7º patamar, que é o correto: Ofício termina no sexto.",
          "A contagem de Escolas Formais e Ofícios estava errada (dizia seis Ofícios; são sete, e o Estilo Vendaval é Escola Formal).",
          "O Aside \"Por que o dobro, e por que 20\" (Cap. 4, §1) explicava uma fórmula que não existe mais: a constante é 14 e o multiplicador é 1,67 desde 2026-08-30. Reescrito com os valores reais e o motivo da mudança.",
        ],
      },
      {
        heading: "Site",
        items: [
          "\"Criar\" saiu da barra de navegação. Criar personagem não é um destino que se visita: é uma coisa que se faz a partir do roster, e /personagens já abre com o botão de criação ao lado das fichas existentes. A rota continua existindo e linkada da landing e do roster.",
        ],
      },
    ],
  },
  {
    version: "0.0.4",
    date: "2026-09-03",
    title: "O Cântico Tem Preço",
    sections: [
      {
        heading: "Recitação Perfeita — agora existe um piso",
        items: [
          "O Bônus de Recitação Perfeita deixa de ser automático. Uma magia cujo cântico for MAIS CURTO que o piso do rank dela não concede bônus nenhum, por melhor que você recite — a carta dela passa a dizer \"Sem bônus\".",
          "Motivo: uma auditoria das 149 magias do livro encontrou 55 com cântico abaixo do piso do próprio rank. Barreira, Cura, Desintoxicação, Invocação e Bardo estavam quase inteiras fora da escada. \"Não caias. Ainda não. Prontidão!\" tem 35 caracteres e pagava o mesmo que um cântico de 380 do rank Rei.",
          "50 cânticos foram reescritos para alcançar a faixa do próprio rank. Hoje 144 das 149 magias estão dentro da faixa; antes, 91.",
          "As 5 magias que continuam curtas são curtas DE PROPÓSITO e agora dizem isso: Prontidão, Rejeitar a Morte, Luz Absoluta, Lança de Plasma e Explosão Silenciosa. Todas de emergência, todas com nota de custo explicando a pressa — nelas a velocidade já é o benefício, e o livro parou de pagar as duas coisas.",
          "A regra se mede sozinha a partir da tabela de tamanho: escrever um cântico curto novo desliga o bônus dele automaticamente.",
        ],
      },
      {
        heading: "Novas regras de magia (Cap. 2)",
        items: [
          "INTERROMPER UMA CONJURAÇÃO — o Cap. 2 ganhou uma seção inteira sobre isso. (A CD publicada aqui estava errada e foi corrigida na 0.0.5: vale CD 10 + Bônus de Rank de quem te acertou, a mesma do Cap. 4, §3.) Falha: perde todas as Ações gastas e metade do PM da magia.",
          "Enquanto está Conjurando você é visível e audível (o Mestre informa o rank aparente pelo tamanho do cântico), pode se mover metade do Deslocamento, e não pode atacar, usar item nem usar Reação — usar Reação encerra a conjuração.",
          "Atordoado, Paralisado, Incapacitado, Surdo e Soterrado interrompem SEM teste. Congelado e Atolado não interrompem: você continua falando.",
          "Ritual não se interrompe pela metade — se perde inteiro: PM cheio e todo o tempo investido. Em troca, ritual conduzido em paz nunca exige teste.",
          "Tabela de formas deliberadas de interromper: bater forte, Vácuo Localizado (Vento), Selado e Anulação (Barreira), Corte de Braço (Deus da Espada).",
          "Nova seção \"Regras Gerais de Conjuração\": linha de visão, conjurar em corpo a corpo (permitido, sem penalidade), mãos livres, segurar magia pronta, quantas magias sustentar, ficar sem PM no meio, falha crítica e empilhamento de magias iguais.",
        ],
      },
      {
        heading: "Mecânica Central — as 19 árvores",
        items: [
          "Toda árvore passa a declarar a sua Mecânica Central num quadro no topo do catálogo: a tag, o que ela faz que nenhuma outra faz, o ciclo de jogo numerado, e — o que faltava — a fraqueza declarada.",
          "Nova seção do Cap. 3, \"Como Ler uma Árvore\", com as 19 mecânicas lado a lado em tabela, para ser lida ANTES de escolher a Árvore Inicial.",
          "A tag de cada árvore aparece entre colchetes na Maestria de 1º patamar dela, para você reconhecer a mecânica quando ela voltar: [Molhado], [Em Chamas], [Desequilibrado], [Atolado], [Ferida Fresca], [Rank contra Rank], [Selado / Fluxo Interrompido], [Pacto], [Letalidade], [Contra-ataque], [Improviso], [Quebrantado], [Sob Minha Guarda], [Marcado], [Calor], [Distância Roubada] e os três [Escopo] das árvores de Utilidade.",
          "Documentada a regra dos dois tempos: árvores que PREPARAM (Água, Terra, Vento, Lutador) contra árvores que COBRAM na hora (Fogo, Deus da Espada, Arquearia). Nenhuma é melhor — depende de quantos turnos a sua mesa joga.",
        ],
      },
      {
        heading: "Estilo Vendaval — mecânica nova",
        items: [
          "Era a única árvore do livro sem identidade própria: mobilidade solta, alcance estendido em três patamares diferentes e nenhuma regra ligando as duas coisas.",
          "Nova mecânica DISTÂNCIA ROUBADA: a distância que você percorreu na sua vez (até 9m) é somada ao alcance do seu próximo ataque corpo a corpo neste turno. Se ele acertar um alvo a mais de 3m, o alvo fica Desequilibrado.",
          "Ela escala pelos patamares em vez de aparecer do nada: no Intermediário, movimento feito com Reação também conta; no Avançado o teto sobe para 12m; no Rei ela soma em cima do alcance mínimo de 6m.",
          "Isso transforma os cinco \"ataques corpo a corpo à distância\" espalhados pela árvore em variações de uma regra só, e dá ao Vendaval um motivo mecânico para o excesso de reposicionamento que ele já comprava.",
        ],
      },
    ],
  },
  {
    version: "0.0.3",
    date: "2026-09-03",
    title: "A Profundidade Morreu",
    sections: [
      {
        heading: "Rework: Magia de Desintoxicação",
        items: [
          "A mecânica de Profundidade foi APAGADA. Aflições não têm mais um número de 1 a 5 que sobe sozinho com o relógio, e nenhuma magia move esse número pra cima ou pra baixo.",
          "Regra nova, uma linha: toda aflição tem um RANK (Principiante a Imperador), e um feitiço de Desintoxicação de rank X remove uma aflição de rank X ou inferior. Nada mais.",
          "Aflição não piora sozinha e não passa sozinha: ela continua cobrando o efeito dela (2d6 por hora, -1 atributo por semana) até alguém tratar. A urgência é o efeito, não um contador.",
          "A árvore virou a mais barata do livro em PA, com tabela própria (Cap. 1, \"A Escola Barata\"): Imperador custa 3 PA onde a tabela comum cobra 5, e Santo custa 2 onde ela cobra 3.",
          "Em troca do preço, a árvore foi nerfada de propósito. Sopro Podre cai de 10d8 para 6d8; Corrosão cai de 4d8 para 3d6 e não destrói mais CA permanentemente; Toque do Fim deixa de matar sozinho.",
          "Anular deixa de remover QUALQUER condição do jogo e passa a cobrir só as cinco da escola (Envenenado, Paralisado, Petrificado, Cego, Surdo), e só de origem tóxica — condição de golpe, elemento ou medo é Milagre Menor, na Cura.",
          "Estado Anulado (Santo) passa a gastar sua Reação e vale uma vez por rodada. Corpo Recusado perde a imunidade a veneno mágico. Nada Entra cai de 18m para 9m e vira Vantagem em vez de imunidade compartilhada.",
          "Sangria virou a única válvula de escape da escola: purga uma aflição de UM rank acima do seu alcance, ao custo de 3d6 irredutíveis. Substitui o talento A Mão que Não Erra, que foi removido.",
          "Sangue Trocado não reduz mais o rank da aflição ao transferi-la para você — é sacrifício, não atalho.",
          "Contra a Maré (Avançado) deixa de \"parar o relógio\" e passa a deixar aflições DORMENTES num raio de 9m: elas continuam lá, mas não cobram efeito enquanto você estiver de pé.",
        ],
      },
      {
        heading: "Identidade das Árvores",
        items: [
          "Nova condição SOTERRADO (Cap. 4, §5), a metade que faltava da identidade da Terra: Deslocamento 0, Preso, sem visão nem gesto, 2d10 de sufocamento por turno. Só pode ser aplicada a quem já está Atolado, Preso ou Caído.",
          "Terra virou uma escada de duas etapas igual à Água: Atolado prepara, Soterrado cobra. Cárcere, Prisão de Pedra e Sepultamento passam a aplicar Soterrado; a Maestria de Santo converte Atolado em Soterrado automaticamente.",
          "Água ganhou a regra geral que faltava: QUALQUER magia de frio sua deixa Congelado quem já estava Molhado e falhou no teste (Maestria do Avançado). Antes só Campo de Gelo fazia isso.",
          "Vento ganhou o pagamento que não tinha: toda magia de Vento rola um dado de dano a mais contra alvo Desequilibrado. Grito do Mundo e Lâmina do Horizonte passam a aplicar a condição — antes ela sumia nos dois últimos patamares.",
          "Fogo: toda magia da escola causa dano cheio contra alvo Em Chamas, sem metade em caso de sucesso no teste — a escola que não prepara nada e cobra na hora.",
          "As sete essências estão agora marcadas explicitamente nas Maestrias de 1º patamar: [Molhado], [Em Chamas], [Desequilibrado], [Atolado], [Letalidade], [Improviso] e [Contra-ataque].",
        ],
      },
      {
        heading: "Custos de PA",
        items: [
          "A compra de Atributo é oficialmente PROGRESSIVA no livro e na ficha: 1, 1, 2, 2, 3, 3… PA. O motor já cobrava assim; a tabela do Cap. 1 e o painel da ficha ainda anunciavam 2 PA fixos.",
          "A Vantagem em Testes de Resistência também: 2, 3, 4, 4, 4 PA (17 PA pelas cinco), em vez de 2 PA fixos por atributo.",
          "A ficha agora mostra quanto custa a PRÓXIMA compra, e não só o total já gasto.",
        ],
      },
      {
        heading: "Loja e Mundo",
        items: [
          "Os três venenos à venda passam a ser nomeados por rank (Principiante, Intermediário, Avançado) em vez de Profundidade 1/2/3. Preços e Ranks de Guilda exigidos não mudaram.",
          "Poção de Antídoto agora remove uma aflição de rank Principiante ou Intermediário, em vez de \"1 ponto de Profundidade\". O Antídoto Universal cobre qualquer rank até Imperador.",
          "A Doença da Pedra Mágica virou a única aflição de rank DEUS do livro — o teto que nenhum patamar jogável alcança.",
        ],
      },
    ],
  },
  {
    version: "0.0.2",
    date: "2026-08-31",
    title: "Guarda Erguida",
    sections: [
      {
        heading: "Ações e Reações de Combate",
        items: [
          "Nova Ação Padrão — Defender/Absorver: em vez de tentar desviar, você foca em aguentar o golpe. O atacante ganha Vantagem na rolagem de acerto contra você, mas se acertado o dano é reduzido pela sua mitigação: (Vigor × 2) + Bônus de Rank do seu maior Estilo de Corpo.",
          "Bloquear com Escudo (Reação): ao ser atingido por um ataque físico que você veja, some a CA do seu escudo contra aquele ataque — se isso fizer o golpe errar, o dano é anulado por completo.",
          "Esquivar e Defender/Absorver agora protegem só o PRIMEIRO ataque que você sofrer na rodada. Qualquer outro ataque no mesmo turno acontece normalmente, sem os bônus de esquiva ou a redução de dano — concentrar-se em um golpe tem um preço.",
        ],
      },
      {
        heading: "Vida e Mana",
        items: [
          "PV Máximos agora escalam de forma mais contida nos primeiros patamares — o 1º patamar volta a ser uma fase de risco real, não um colchão de vida.",
          "PM Máximos ganham um teto nos dois primeiros patamares de magia (Principiante e Intermediário): bônus vindos de fora da árvore (PA avulso, antecedentes, sub-tabelas) não empurram mais um conjurador iniciante muito além do que a assinatura do próprio rank permite pagar. Talentos de reserva da árvore e bônus raciais escalares (Elfo, Migurd) continuam valendo por cima do teto. A partir do Avançado, o teto desaparece e a fórmula plena passa a valer até o Imperador.",
        ],
      },
      {
        heading: "Classe de Invocação",
        items: [
          "Invocar em combate sem um círculo já desenhado agora exige o talento Convocar sob Pressão: custa 6 Ações, e o invocado chega com metade dos PV e um degrau a menos no dado de dano.",
          "Convocação Aprimorada remove essa penalidade de emergência — invocação de combate por 4 Ações, sem perda de PV ou dano.",
          "Traço Rápido muda de função: agora deixa desenhar o círculo em 1 Ação pagando o dobro de PM, em vez de zerar o custo extra de invocar em combate.",
          "Nova linha de evolução do familiar: Pacto — Filhote Evolutivo (invocação inicial fraca) evolui para Forma Média (Intermediário) e depois Forma Suprema (Avançado), ganhando dano, PV, resistências e até uma magia menor própria.",
          "Vínculo Concentrado: abrir mão de manter vários Pactos e concentrar todo o PM de invocação em um único familiar concede dados de dano extras, mais PV por Bônus de Rank e Resistência a dano mágico.",
          "Chamado (a assinatura da árvore) deixa explícito que a invocação padrão exige círculo com 10 minutos de preparo fora de combate — a invocação de emergência agora é função exclusiva dos talentos acima.",
        ],
      },
      {
        heading: "Classe de Escudos",
        items: [
          "Nova linha de identidade — Puro Escudo: ao abrir mão de empunhar arma de dano (só escudo ou escudo grande), você desbloqueia versões Soberanas, mais fortes, das suas habilidades em todos os ranks, estendendo seus efeitos defensivos também a aliados adjacentes.",
          "Habilidades Soberanas exclusivas: Golpe de Escudo Soberano, Provocar Ódio Soberano, Aguentar Soberano, Escudo de Corpo Inteiro, Não Ele Soberano, Custe o Que Custar Soberano e O Muro Final Soberano.",
          "Sob Minha Guarda agora escala com o rank — protege 1 aliado no Principiante, 2 no Intermediário e 3 a partir do Avançado — em vez de já nascer com um alcance amplo.",
          "Interpor (Principiante) passa a somar +1 na CA com escudo, sem empilhar com magias de barreira.",
          "Ombro de Pedra sobe de +2 para +4 PV por patamar e ganha +1 PT Máximo.",
        ],
      },
      {
        heading: "Magia Combinada",
        items: [
          "Deixa de ser \"qualquer combinação que o Mestre aprove na hora\" e vira uma tabela oficial com 9 magias fixas — Magma, Gelo Tempestuoso, Relâmpago Santo, Barreira Incandescente, Tempestade de Cura, Pânico, Muralha de Espinhos, Nevasca Curativa e Meteoro — cada uma com PM, alcance, Ações e dano definidos.",
          "Cada combinação é comprada com PA e destravada pela Maestria \"Magia Combinada\" do rank Avançado, em vez de vir de graça ao alcançar os dois ranks das árvores-base.",
          "Combinações fora da tabela continuam possíveis pela regra de ouro do Mestre, agora como complemento, não como o caminho principal.",
        ],
      },
      {
        heading: "Nova Sub-árvore: Punho de Fogo",
        items: [
          "Árvore híbrida do Corpo (Fogo + Lutador), revelada só quando você alcança Rank Intermediário nas duas árvores-base.",
          "Golpes desarmados ganham dano ígneo extra e a chance de incendiar o alvo, evoluindo até o Imperador com explosão em área, imunidade a fogo e redução de CA em inimigos no calor do combate.",
        ],
      },
      {
        heading: "Criação de Personagem",
        items: [
          "O orçamento livre de atributos na criação passa de 4 para 2 pontos, e destravar os dois Defeitos (-1 e -2) agora libera 5 pontos para redistribuir, em vez de 7.",
          "Bônus de Raça e de Antecedente saem do orçamento da criação — não competem mais pelos pontos distribuídos, e são somados por fora do resultado final.",
          "A Roleta do Destino usa o mesmo orçamento de 2 pontos do modo manual, encerrando a vantagem extra de quem sorteia o personagem.",
          "O kit inicial de Tank/Defensor troca a Armadura Média (+3 CA) de graça por Armadura Leve (+1 CA) — CA alta agora exige investimento (armadura melhor, talentos de escudo, evolução de rank).",
          "No Mapa de Árvores, árvores híbridas (Vendaval, e agora Punho de Fogo) ficam ocultas até os pré-requisitos serem cumpridos, aparecendo com um conector próprio ligando-as às duas árvores de origem.",
        ],
      },
    ],
  },
];
