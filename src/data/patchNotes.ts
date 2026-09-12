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
    version: "0.1.74",
    date: "2026-09-12",
    title: "Duas Armas na Mão, Cento e Vinte Arquivos na Pasta",
    sections: [
      {
        heading: "NOVA REGRA: duas armas, uma em cada mão (Cap. 4, §3)",
        items: [
          "O livro tinha a Empunhadura Dupla do Deus do Norte e nada mais: quem não fosse dessa árvore e quisesse uma arma em cada mão não encontrava resposta em lugar nenhum, e a mesa decidia de novo toda vez que a pergunta aparecia.",
          "O GOLPE DUPLO: uma vez por turno, 1 Ação ataca com as DUAS armas ao mesmo tempo — duas rolagens de acerto, podendo ser em alvos diferentes. A mão principal causa dano normal; a mão de apoio causa só o dado, um degrau abaixo, sem Força e sem Bônus de Rank. É livre, não custa PA e não pede talento nenhum.",
          "É dentro da mesma Ação, e não uma Ação a mais: as outras 2 continuam sendo ataques normais. E o motor de combate já contava assim desde a 0.1.47 — 'arma secundária: um degrau abaixo' sempre somou dois golpes numa Ação só. O que faltava era o livro dizer isso pra quem não é do Deus do Norte.",
          "O preço é o que falta nas mãos: sem escudo (nem a CA dele, nem o Bloquear com Escudo), sem mão vaga pra poção ou corda, e duas armas não dão CA nenhuma. Em troca, o golpe extra por turno e dois tipos de dano na mão — o cortante e o perfurante juntos, sem gastar Ação pra trocar de arma quando o couro resiste a um deles.",
          "É isso que os dois talentos do Norte passam a comprar, e agora dá pra ver o quê: Empunhadura Dupla faz a mão de apoio somar Força e Bônus de Rank (além do +1 de CA e da Reação com a arma de apoio); Mão Trocada tira o degrau a menos. Nem uma nem outra dá Ação extra, e o Golpe Duplo continua uma vez por turno com os dois comprados: seis golpes num turno não existem neste livro.",
        ],
      },
      {
        heading: "Espada Emprestada: o livro não dizia como a espada chega",
        items: [
          "O talento dava 'uma espada de qualidade superior' e parava aí. Na mesa isso vira duas leituras opostas — o Mestre entrega junto com o PA gasto, ou cobra uma missão inteira por ela — e nenhuma das duas estava errada, porque o texto não escolhia.",
          "Agora escolhe, e são só dois caminhos: ou o Mestre entrega na próxima cena (um antigo mestre, um herdeiro sem braço pra usá-la, um senhor que reconheceu o seu nome), ou amarra a entrega a uma provação — duelo, serviço, prova de caráter. Ele diz qual é ANTES de você confirmar a compra.",
          "E se for a provação e você falhar, os 2 PA voltam inteiros pro seu bolso. Nenhum talento deste livro fica pago e sem efeito: falhar custa a espada e a cena, não o ponto.",
        ],
      },
      {
        heading: "CORREÇÃO: cinco artes estavam na habilidade errada",
        items: [
          "Túmulo de Aço enterra alguém sob escombros, com dano contundente e a condição Preso. A arte que estava lá é uma briga de corredor com cabo de vassoura e carteira de escola de escudo — que é a MAESTRIA do Deus do Norte inteira ('se dá pra empunhar, você sabe usar'), e é pra lá que ela foi. Túmulo de Aço ficou sem arte.",
          "O `300.webp` voltou a se mover: ele não é postura de espadachim nenhuma, é uma maga conjurando água que dispara do chão. Saiu de Fluxo Verdadeiro (Deus da Água) e foi pra Flecha de Água, na Magia de Água.",
          "'Nada toca você' era uma barreira que trava o golpe no ar antes de encostar — o talento de Imperador da Magia de Vento tem esse nome e é essa cena. Saiu de Nada Passa (Deus da Água), que defende por leitura de movimento e não por barreira.",
          "O cartaz de batalha com o VERSUS no meio é do Duelo de Canções, e estava ilustrando o Insulto que Fica — que é uma farpa solta no meio da conversa, sem palco e sem convite.",
          "A cara de deboche da provocação de Cavalaria e Escudos agora ilustra também o Provocar do Deus da Água: as duas árvores puxam o ódio do inimigo, e é a mesma cena. Um arquivo, dois destinos, e nenhum download a mais.",
        ],
      },
      {
        heading: "Doze arquivos que estavam na pasta e ninguém via",
        items: [
          "Três Bainhas, Bala de Lágrimas e Desarme (Deus do Norte); Primeiro Golpe, Veneno Refinado, O Dossiê e A Mão Longa (Furtividade); Cantiga de Marcha e Cantiga de Ninar (Bardo); Emboscada Planejada (Navegação); Espada Emprestada (Deus da Espada) e Nome de Reidar (Deus da Água).",
          "Os quatro maiores pesavam 14 MB juntos e desceram pra 2,4 MB em WebP animado. O `comprimir:midia` também aprendeu a desistir: abaixo de 20% de ganho ele não reescreve mais o arquivo — antes descia a escada inteira até 400px pra ganhar 3%, perdendo resolução num arquivo que continuava sem caber no alvo.",
        ],
      },
      {
        heading: "A arte saiu da raiz de public/ e passou a espelhar o livro",
        items: [
          "Os ~120 arquivos ficavam soltos na raiz, com o nome que tinham quando foram baixados — `300.webp`, `desarmar dn=deus do norte.jpg`, `hazy cross dn.webp` — e misturados com o ícone do PWA, o logo e a capa da home.",
          "Agora cada um mora em `public/arte/<árvore>/<habilidade>.<ext>`: a pasta de uma árvore É o catálogo visual dela, e o nome do arquivo é o id da habilidade. A arte que ilustra uma seção do livro (o Dojo, o Touki, o Fio da Vida) ficou em `arte/livro/`.",
          "A raiz de `public/arte/` virou caixa de entrada: arquivo novo cai ali, o `check:midia` cobra, e o `casar:midia` leva pra pasta da árvore quando o nome bate com o da habilidade. Nenhum script precisa mais de lista de exceções pra saber o que é arte e o que é cromo do site.",
        ],
      },
      {
        heading: "🐛 O sumário do livro parava de acompanhar a leitura",
        items: [
          "As posições dos títulos eram medidas uma única vez, e o livro não para de crescer depois disso: são ~120 artes carregando aos poucos, os catálogos de árvore abrindo e fechando, a fonte de display trocando quando termina de baixar. Cada uma empurra os títulos pra baixo, e o marcador ficava dezenas de milhares de pixels atrasado — o leitor no Cap. 4 e o sumário insistindo no Cap. 2.",
          "Agora o sumário remede sempre que o documento muda de altura, e não só quando a janela muda de tamanho — que era o único caso que ele cobria, e o único que nunca acontece lendo.",
          "Duas correções no mesmo lugar: o capítulo-pai acende junto com a seção (antes, ler a §3 do Cap. 4 deixava o Cap. 4 apagado), e o painel do sumário rola sozinho o mínimo pra manter a entrada acesa à vista — num índice de 71 linhas, acender a linha certa não adianta se ela está 400px abaixo do que se vê.",
        ],
      },
    ],
  },
  {
    version: "0.1.73",
    date: "2026-09-12",
    title: "Duas Regras Que o Livro Prometia e o Código Não Cumpria",
    sections: [
      {
        heading: "Quebrantado tinha teto na regra e não tinha no sistema",
        items: [
          "A condição sempre disse 'até o máximo do Bônus de Rank de quem aplicou', e a árvore do Lutador repete isso na Mecânica Central. O código devolvia a contagem crua: nove cliques no + do Painel do Mestre levavam a CA a −9 e o dano de TODO ataque a −9, sem nada no sistema dizendo que aquilo era impossível.",
          "Agora a condição guarda o Bônus de Rank de quem aplicou, e é ele que limita. Quando a mesa não informa a fonte, o teto cai em 6 — o maior Bônus de Rank que o livro concede a uma criatura que entra em combate (Imperador; o Rank Deus é narrativo e não se compra com PA). O sistema não adivinha o número da mesa, só barra o valor impossível.",
          "O botão + para no teto, em vez de aceitar o clique e não mudar número nenhum. Um + que responde sem efeito é pior que um botão desligado: a mesa clica três vezes e conclui que a ficha está quebrada.",
        ],
      },
      {
        heading: "O Descanso Curto dizia três coisas diferentes",
        items: [
          "A tabela do Cap. 4 dava '25% dos seus PM, PP e PT'. O aviso logo abaixo dela dizia que PT voltam INTEIROS — corrigindo a tabela que estava três centímetros acima — e, no meio do argumento, que o Curto 'devolve metade da reserva de PM'. O Cap. 3 repetia a metade. Três números pro mesmo descanso.",
          "O motor sempre aplicou 25% de PM e PP com PT inteiros, e é o que fica. O que mudou foi o TEXTO, nos três lugares: a tabela agora separa PT dos outros dois em vez de ser desmentida por um aviso abaixo, e as duas menções a 'metade' viraram 25%.",
          "A aritmética do exemplo do curandeiro foi refeita com o número certo: cada Curto devolve 3 PM (42 PV via Juramento), e não metade da reserva. Com dois Curtos por dia ele fecha em 252 PV de cura — uma vez e meia a reserva cheia, e não um poço sem fundo. O argumento do teto continua de pé; só os números estavam errados.",
        ],
      },
    ],
  },
  {
    version: "0.1.72",
    date: "2026-09-12",
    title: "Cento e Seis Artes, e Setenta Megabytes a Menos",
    sections: [
      {
        heading: "A arte do livro pesava 115 MB — agora pesa 44",
        items: [
          "Um único GIF tinha 18 MB, e outros dois passavam de 7. Num livro que precisa abrir offline numa mesa e no 4G de quem chegou atrasado, isso não é detalhe de build. Tudo virou WebP animado, descendo uma escada de largura e qualidade até caber: 60% menor no total, e nenhum arquivo abaixo de 400px de largura numa moldura que mostra 256px de altura.",
          "Três ferramentas novas sustentam isso: `check:midia` lista a arte que está na pasta e não está no livro, `casar:midia` liga arquivo a habilidade quando os nomes batem, e `folha-de-contato` monta um mosaico com o quadro do MEIO de cada arquivo animado.",
        ],
      },
      {
        heading: "CORREÇÃO: a falange de escudos era uma lâmina de água",
        items: [
          "O arquivo se chamava `300.webp` e foi mapeado como a parede de escudos do filme, em 'A Linha' — a habilidade de Rei do Escudeiro. É um corte de espada sobre água rasa, e foi parar em Fluxo Verdadeiro, no Deus da Água, que é onde ele sempre pertenceu.",
          "A causa: nome de arquivo é a lembrança de quem baixou, não a descrição da cena. E abrir e olhar o primeiro quadro engana quase tanto, porque em arquivo animado o primeiro quadro costuma ser a transição — fundo branco, borrão, a tela antes do golpe.",
          "Outros quatro destinos saíram errados pelo mesmo motivo e foram corrigidos: a maestria 'O Corpo é a Arma' estava ilustrada com um machado (a tese dela é que você NÃO precisa de arma), a maestria 'Passo sem Peso' do Vendaval estava com um gif de corte, a dança era do Bardo e não do Deus do Norte, e 'curar maldição' estava em Selar a Maldição — que é justamente o que se faz quando NÃO se consegue curar.",
        ],
      },
      {
        heading: "Chama do Êxodo, e o Manto de Touki ilustrado",
        items: [
          "'Tempestade de Fogo' passou a se chamar Chama do Êxodo (獄炎火弾 / Exodus Flame): magia de Fogo Avançado que existe no material original com a mesma forma que a do livro — esfera grande, área que continua queimando. O `id` interno não mudou, porque ele é a chave das fichas já salvas na mesa.",
          "O Manto de Touki (Cap. 4, §6), o Fio da Vida (§7), o Dojo (Cap. 5, §5) e as duas técnicas de Touki que se compram com PT (Cap. 3, §2) ganharam arte de seção — ilustram a regra, e não uma habilidade de árvore.",
        ],
      },
    ],
  },
  {
    version: "0.1.69",
    date: "2026-09-11",
    title: "O Tiro Perfeito Não É de Todo Mundo",
    sections: [
      {
        heading: "O Tiro Perfeito volta a ser exclusivo da Arquearia — na leitura, não só na regra",
        items: [
          "A regra nunca mudou: o Tiro Perfeito é a habilidade de assinatura de Arquearia no patamar Principiante, e sempre exigiu comprar aquele nó da árvore e estar com arco ou besta em mãos. O problema era onde ela está escrita — no Capítulo 3, que é o capítulo das regras que valem pra TODO MUNDO, ao lado de Ações, Reações e Touki. O pré-requisito aparecia no meio do segundo parágrafo, e o lugar dizia mais alto que o texto.",
          "Agora o pré-requisito é a primeira coisa da seção, num aviso destacado, e diz o que não é óbvio: não há versão improvisada, não se compra avulso, nenhuma outra árvore concede, e nem Deus da Espada nem Deus do Norte têm equivalente.",
        ],
      },
      {
        heading: "CORREÇÃO: o diagrama do Tiro Perfeito publicava uma CD que não existe",
        items: [
          "A quarta etapa, A Solta, aparecia no diagrama como 'ataque · CD 12'. A Solta é o ataque NORMAL, rolado contra a CA do alvo — a CD 12 fixa vale só para as três etapas de preparação, e o rótulo estava sendo repetido nas quatro caixas. Quem jogasse pelo diagrama rolaria o disparo final contra 12 e acertaria coisa que devia errar. O diagrama agora diz 'ataque normal', sem CD.",
        ],
      },
      {
        heading: "Sessenta habilidades do livro passam a ter arte",
        items: [
          "As 44 mídias que estavam paradas em public/ entraram no livro: Deus da Espada, Deus da Água, Deus do Norte, Cavalaria e Escudos, Armas Pesadas, Vendaval, Arquearia, Furtividade, Bardo, Navegação, Invocação, Desintoxicação e as magias elementares. Talento também pode ter arte agora, e não só magia e técnica — Marcha Forçada foi o caso que forçou a mudança.",
          "A arte do Dojo (Cap. 5, §5) não ilustra habilidade nenhuma: ela abre a seção inteira.",
        ],
      },
    ],
  },
  {
    version: "0.1.59",
    date: "2026-09-11",
    title: "Vinte e Cinco Por Cento",
    sections: [
      {
        heading: "O chefe agora dizima o grupo em 25% das vezes — antes era 0%",
        items: [
          "O ajuste de Chefe do Apêndice G virou POR PATAMAR, porque um número só não podia servir aos três: o PV somado de um grupo sobe cerca de 28% por patamar e o dano por turno das linhas do bestiário sobe cerca de 50%. O dano corre 1,7 vez mais rápido, então o mesmo multiplicador que deixa o 3º patamar fácil deixa o 5º impossível.",
          "O PV continua dobrando nos três. O dano passa a ser ×2,65 no 3º patamar (Ameaça), ×1,9 no 4º (Elite) e ×1,29 no 5º (Terror). Medido em 2000 batalhas por linha contra um grupo montado no patamar do chefe: 32%, 25% e 25% de chance de dizimar o grupo, contra 0% em todos antes desta versão.",
          "A calibragem encontrou um penhasco, e ele está escrito no Apêndice G: no 5º patamar, ×1,28 dizima 20% das vezes e ×1,29 dizima 25%, mas ×1,31 salta pra 53%. A causa é realimentação positiva — quem cai para de causar dano, a luta se alonga, e quem estava de pé cai também. Na prática: um chefe calibrado em 25% não entrega 25% toda noite. Ele entrega noites tranquilas e noites de desastre, e a média é que fica em 25%.",
        ],
      },
    ],
  },
  {
    version: "0.1.58",
    date: "2026-09-11",
    title: "Zero",
    sections: [
      {
        heading: "Nenhum capstone rende menos que o rank abaixo dele — pela primeira vez",
        items: [
          "O contador nasceu em dezesseis na 0.1.41, caiu pra três na 0.1.50 e fechou em ZERO. A decisão era subir as três técnicas do topo; duas subiram e a terceira saiu sozinha, porque o Sepultamento (Terra, Imperador) já tinha o dano por turno escrito num campo estruturado que o motor não lia. Ler o campo bastou: o teto da Magia subiu de 30,6 pra 33,0 por Ação, e o Corpo deixou de render 1,7 vez mais que a Magia pra render 1,6.",
          "As que precisaram de dados: Colapso Solar (Punho do Fogo, Imperador) foi de 14d12 pra 19d12, e o Vazio (Vento, Rei) de 4d10 pra 7d10 por turno. Consertar o Vazio revelou que a árvore de Vento estagnava do Santo em diante (26,8 → 26,4 → 23,7), então a Explosão Silenciosa foi de 12d12 pra 16d12. Agora o Vento sobe inteiro: 7,2 → 9,8 → 17,2 → 26,8 → 29,7 → 30,7.",
          "O talento de reserva das escolas de magia passa a dar +2 PM E +2 PV por patamar, pelo mesmo 1 PA. O problema medido era que PM destrava dano mas não impede ninguém de morrer: o time com mais árvores do Corpo ganhava 74% das batalhas. Com o PV, o time com três magos foi de 25,6% pra 36,5% de vitória — onze pontos num talento de 1 PA. A Terra ficou de fora porque já tem Pele de Pedra (+4 PV por patamar), que é a identidade dela.",
        ],
      },
    ],
  },
  {
    version: "0.1.57",
    date: "2026-09-11",
    title: "Por Turno",
    sections: [
      {
        heading: "O livro escreve 'por turno' em sete magias, e o motor contava uma vez só",
        items: [
          "Em Chamas sempre teve relógio; magia sustentada não tinha nenhum. São sete e não três, que era quanto o backlog listava: Tomar o Ar, Tempestade Cortante e Vazio (Vento), Rio de Magma (Terra), Estrangular (Armas Pesadas), Prisão de Purgatório e Trono de Chamas (Punho do Fogo). Medida, a Tempestade Cortante era 36 de dano; agora é 36 de impacto mais 34 mais 34.",
          "A duração contada é de TRÊS turnos — o do lançamento mais dois — e esse número é escolha declarada, não do livro. A Tempestade dura 'um minuto', que são dez turnos, e contar dez daria a ela um dano que nenhuma mesa vê: o alvo sai da área e o combate acaba antes, porque as batalhas fecham em duas a quatro rodadas.",
          "Sustentado que exige MANUTENÇÃO não rende turno de graça. O Estrangular diz 'enquanto você mantiver' e exige alvo Agarrado: cada turno de dano custa o turno do lutador, então o dano por Ação já está certo contando um turno só. Manutenção de recurso é outra coisa e continua contando — o Trono de Chamas cobra uma Sobrecarga por turno, e quem paga segue livre pra agir.",
        ],
      },
    ],
  },
  {
    version: "0.1.54",
    date: "2026-09-11",
    title: "A Progressão Que Não Se Compra",
    sections: [
      {
        heading: "Dojos e Mestres: certos nós agora são fechados a chave, e a chave é uma pessoa",
        items: [
          "Até aqui PA era a única porta de toda a progressão, e isso tem um preço que só aparece depois de vinte sessões: o mundo deixa de importar para a ficha. Dá pra jogar a campanha inteira numa taverna e progredir igual a quem atravessou o continente. Um mestre precisa estar dois patamares acima — divindades ignoram a escada, e um salto de patente (Imperador ensinando um Rei) vale por dois.",
          "Concluir a provação abre a árvore DE GRAÇA, e aí vem o Dilema. A proposta original era 3 PA travados na árvore nova ou 1 PA livre; virou 2:1, porque a 3:1 não há dilema — os 3 travados equivalem a um patamar e meio da árvore, e quem pretende usá-la pega sem pensar. A recompensa também passou a escalar com o patamar (2/1, depois 3/2, depois 4/2): fixa, ela valeria 25% do patrimônio de um personagem de 3º e 12% do de um de 5º.",
          "Entrou uma terceira porta que não é PA nenhum — a Marca do Mestre: o sinal daquele mestre, a Maestria pessoal dele, e o direito de voltar ao dojo uma vez por arco de campanha pra uma segunda provação valendo a recompensa cheia. Duas quantidades da mesma moeda fazem uma conta; a terceira porta precisa ser de outra natureza.",
          "Quatro provações prontas, todas construídas pra TIRAR dos jogadores aquilo em que eles são bons: o Deus do Arco (ninguém toca em arma que não seja de disparo), A Que Não Deixa Rastro (nenhum ponto de dano, e todo teste de ser visto usa a MENOR Agilidade do grupo), O Que Recita Devagar (cântico obrigatório em voz alta, e a mana sai de uma reserva comum) e O Que Nunca Ataca (você não tem turno — só Reações).",
          "A regra de bolso que acompanha a trava: nenhum nó fechado sem pelo menos um rumor plantado na mesma sessão. Um nó a chave só é bom enquanto a chave existe — sem o rumor o jogador não está jogando exploração, está esperando.",
        ],
      },
    ],
  },
  {
    version: "0.1.53",
    date: "2026-09-11",
    title: "Quatro Ações Num Turno de Três",
    sections: [
      {
        heading: "O Tiro Perfeito: a única técnica que compra potência com tempo",
        items: [
          "Toda técnica do livro paga em recurso — PT, PM, PP. O Tiro Perfeito paga em TURNOS: quatro Ações num turno de três, então ele sempre atravessa turnos. Quem prepara um passou um turno inteiro sem defender ninguém.",
          "Quatro etapas, 1 Ação cada, teste CD 12 em cada uma. A Corda (Força): +3 degraus no Dado de Arma. Os Dedos (Agilidade): ignora Cobertura e não pode ser aparado nem interceptado. A Leitura (Intelecto ou Espírito): Vantagem no acerto e o alvo não soma Agilidade na CA. A Solta: o ataque normal. Opcionalmente, +1 Ação n'O Ponto — Medicina contra humanoide, Sobrevivência contra fera ou monstro — e o tiro crita em 19-20 e ignora Resistência.",
          "FALHAR NÃO INTERROMPE: errar um teste custa só o bônus daquela etapa, e a Preparação segue. Sem isso, um 7 no d20 jogaria fora dois turnos de jogo. Sofrer dano é outra coisa — aí é teste de Concentração, como em qualquer efeito que atravessa turnos.",
          "A CD é fixa em 12, e não a escada de 8 + atributo + Rank: não há ninguém do outro lado desses testes. A dificuldade é da técnica, não de um alvo resistindo.",
          "A Arquearia inteira ganhou uma escada em torno disso: Respiração Contada (guarda a Preparação pronta), Etapa Encurtada (o tiro cabe num turno), Olho Que Já Viu (a Leitura passa sempre), Ponto Vital Lido (O Ponto de graça) e, no Rei, Preparação Perfeita — com todas as etapas passadas, o tiro fura o Manto de Touki sem gastar PT. A Maestria do Rei prometia que 'não existe segunda forma' de furar o Manto; agora existe, no mesmo patamar, e cobra turnos em vez de recurso.",
        ],
      },
    ],
  },
  {
    version: "0.1.52",
    date: "2026-09-11",
    title: "Espada Sim, Adaga Não",
    sections: [
      {
        heading: "Proficiência de arma virou grupo, e não faixa de dano",
        items: [
          "A régua antiga era 'arma simples é até d6, arma marcial é d8+'. Isso deixava a Rapieira (d6) livre pra todo mundo e a Espada Longa (d8) não; punha o Arco Curto e a Espada Curta na mesma categoria; e tornava impossível o caso mais óbvio de todos — ser proficiente em espada e não em adaga, já que a adaga (d4) estava ABAIXO da faixa livre.",
          "Agora são oito grupos por tipo — Espadas, Lâminas Curtas, Machados e Marretas, Hastes, Arcos e Bestas, Arremesso, Flexíveis, Desarmado e Improvisado — mais Escudos à parte. Você é proficiente num grupo, e vale pra toda arma dele, do d4 ao d12. Arma fora dos seus grupos ataca com Desvantagem; o dano nunca muda.",
          "Todo personagem nasce com Desarmado e Improvisado, escolhe MAIS UM grupo na criação (é aqui que o mago pega a adaga de reserva ou o cajado), e recebe os grupos de cada árvore que abrir. Toda árvore do Corpo dá ainda um grupo livre além dos fixos dela — o Deus do Norte não dá, porque já recebe os nove.",
          "O escudo passou a cobrar o que o livro já mandava: sem o grupo Escudos ele rende +1 de CA em vez de +2. A regra estava escrita no Cap. 1 desde sempre, e o código somava o bônus de qualquer coisa equipada.",
          "Seis armas entraram no catálogo e na loja (Katana, Machadinha, Cajado de Combate, Azagaia, Faca de Arremesso, Corrente de Combate), porque quatro grupos ficariam com uma arma só dentro.",
        ],
      },
    ],
  },
  {
    version: "0.1.51",
    date: "2026-09-11",
    title: "A Ficha Impressa",
    sections: [
      {
        heading: "Cinco defeitos que só a folha em papel mostra",
        items: [
          "Cabeçalho de seção órfão: \"ARMAS E ATAQUES MARCIAIS\" terminava a página 1 e a tabela dele começava a 2 — idem \"EQUIPAMENTO E INVENTÁRIO\". Agora o título vai grudado no conteúdo dele, e quando o par não cabe ele pula inteiro pra folha seguinte.",
          "A seção \"ÁRVORES DE PROGRESSÃO\" imprimia as dezenove árvores do livro, dezoito com um traço. Só as abertas aparecem. E a faixa de conjuração some por completo numa ficha sem magia, em vez de sair com uma tabela vazia.",
          "A tabela de BC/CD foi pro vão ao lado de INT e ESP, que estava morto e empurrava a tabela de armas pra fora da primeira folha.",
          "A última página retrato fechava com três caixinhas e 55% de papel em branco. Agora tem doze linhas pautadas em Lore e Anotações, nove de inventário por coluna (eram seis) e quatro em Vínculos: a folha continua com duas páginas, mas a segunda virou lugar de escrever.",
        ],
      },
    ],
  },
  {
    version: "0.1.50",
    date: "2026-09-11",
    title: "O Santo Que Ninguém Usava",
    sections: [
      {
        heading: "A magistral da árvore rendia menos que a técnica de três patamares atrás",
        items: [
          "Espada de Luz (Deus da Espada) e Golpe do Desespero (Deus do Norte) eram, cada um, a ÚNICA habilidade de 2 Ações num galho inteiro de 1 Ação — e por isso rendiam menos por Ação que o rank abaixo deles. Quem chegava ao Santo destravava a magistral e continuava usando a técnica antiga.",
          "O conserto foi no CUSTO, não nos dados, que é a mesma lição da 0.1.47 com a magia. Espada de Luz virou 1 Ação (19,4 → 38,8 por Ação) e a Espada de Luz Verdadeira subiu de cinco pra sete rolagens do dado de arma pra continuar sendo o topo. No Norte, o Golpe do Desespero foi de três pra quatro rolagens, a Aura Cortante de +3d10 pra +5d10, e o Golpe do Fim da Linha de 3 Ações pra 2.",
          "As duas escadas agora sobem do começo ao fim: Deus da Espada 18,8 → 28,8 → 28,8 → 38,8 → 39,4, e Deus do Norte 13,8 → 18,8 → 22,0 → 24,4 → 30,8 → 34,8. Os dezesseis capstones que não compensavam viraram TRÊS — e os três que restam não são problema do livro: Tempestade Cortante, Rio de Magma e Trono de Chamas descrevem dano por turno sustentado, que o motor conta uma vez só.",
        ],
      },
    ],
  },
  {
    version: "0.1.47",
    date: "2026-09-10",
    title: "A Escada Que Não Subia",
    sections: [
      {
        heading: "O teto de conjuração caiu de 6 Ações pra 4",
        items: [
          "A escada antiga subia 2-2-3-4-5-6: o custo em Ações TRIPLICAVA do Principiante ao Imperador enquanto o dano não triplicava junto, e a magia suprema valia menos por Ação que a de dois ranks abaixo. Agora é 2-2-3-3-4-4, e nenhum dado foi mexido — só o custo. Fogo no Imperador foi de 13,6 pra 20,4 por Ação; Água de 11,9 pra 17,8; Terra de 13,2 pra 19,8.",
          "E a Conjuração Dividida sobrevive, que era o risco: 4 Ações continuam não cabendo num turno de 3, então Rei e Imperador seguem levando dois turnos, com Perda de Foco e teste de Concentração no meio. O que mudou é que a espera passou a pagar. Só o Santo desceu pra dentro de um turno.",
        ],
      },
      {
        heading: "Os dezesseis capstones viraram cinco — e onze não eram desequilíbrio",
        items: [
          "Três eram ERRO DE LEITURA do motor: Aguentar e Aguentar Soberano (Escudos) têm \"Reduz 2d10 + Vigor\" no campo de dano — é redução, e o motor contava como dano causado; e Empunhadura Dupla (Norte) é regra de arma, não ataque. Corrigidos junto com \"Metade do dado\" e \"arma secundária\", que o motor lia como zero.",
          "Uma era árvore que o próprio livro declara NÃO ser medida de dano: o Apêndice C marca Cura, Desintoxicação, Barreira e Escudos, e diz por quê. O check passou a respeitar isso. E três são dano por turno sustentado que o motor conta uma vez só — declarado nas simplificações, porque inflar o livro por causa disso seria consertar o instrumento errado.",
          "Das sete de balanceamento real, cinco foram corrigidas. E duas delas do OUTRO LADO, que é a lição da versão: a regressão não estava no patamar fraco, estava no pico alto demais logo abaixo. Investida Devastadora (Principiante!) caiu de +2 pra +1 Dado de Arma, Esmagar de três pra duas rolagens, e a Prensa — o maior número do livro inteiro, 44 por Ação num Rei de 1 Ação — caiu de 8d10 pra 5d10. Armas Pesadas agora TERMINA no topo, e o teto do Corpo caiu de 44,0 pra 40,8, fechando o fosso com a Magia de 1,6× pra 1,5×.",
        ],
      },
      {
        heading: "A Mara virou o que a descrição dela diz",
        items: [
          "O Golpe de Escudo Soberano era PRINCIPIANTE, 1 Ação, 3d8 + Força + Bônus de Rank — e escalava com o Rank pra sempre. Era ele, sozinho, que fazia a build descrita como \"protege, não mata\" liderar o dano do playtest. Caiu pra 2d8: a versão Soberana continua melhor que o Golpe de Escudo comum, mas pelo CONTROLE (empurra 6m, CD +2, a marca de última posição), não pelo dano.",
          "De 196 de dano por batalha pra 125 de dano e 57 PV devolvidos. Ela protege. O 5×5 inteiro ficou 53,8% × 46,2% — no começo do dia era 8,3% × 91,7% —, a Sera virou a maior contribuição do playtest com 222 PV devolvidos, e o chefe de 4º patamar caiu em 26% de dizimação, que é o alvo de 25% pedido, atingido sem tocar no molde do Apêndice G.",
          "O que esta versão NÃO resolveu: o Vex está em 1% de sobrevivência — baixar a Mara não consertou o Deus da Espada, cujo problema é ficar em pé. Dois capstones seguem abertos (Espada de Luz e Golpe do Desespero, os dois Santo), porque nas duas árvores o Santo é a única habilidade de 2 Ações num galho de 1 Ação. E os chefes de 3º e 5º patamar seguem em 0% e 100%.",
        ],
      },
    ],
  },
  {
    version: "0.1.44",
    date: "2026-09-10",
    title: "O iPhone Era Meio Cidadão",
    sections: [
      {
        heading: "O ícone da tela de início era uma captura da página",
        items: [
          "A mesa usa iPhone E Android, e o caminho padrão de PWA é o do Chromium — três coisas que pareciam prontas cobriam só o Android.",
          "O site tinha icon.png, que gera o favicon. O iOS não lê esse: ele quer apple-touch-icon, que no Next vem de um arquivo separado. Sem ele, \"Adicionar à Tela de Início\" no iPhone não usa o brasão — usa um SCREENSHOT da página como ícone. É o tipo de defeito que só aparece depois de instalar num aparelho.",
          "Corrigido e conferido no HTML servido. O arquivo escolhido foi o de 192px, sem canal alfa — verificado lendo o cabeçalho do PNG, porque no iOS o transparente vira PRETO, e um brasão com fundo preto é pior que nenhum ícone.",
        ],
      },
      {
        heading: "O entalhe e a barra de gestos",
        items: [
          "O layout declarava a barra de status translúcida — que manda o conteúdo passar POR BAIXO dela — mas sem viewport-fit=cover. As duas regras brigam num aparelho com entalhe: uma manda o conteúdo pra baixo do relógio, a outra encaixa a página dentro da área segura.",
          "Agora o par está completo, e quatro regras de área segura devolvem a margem a quem precisa: a barra do topo (e os lados, no modo paisagem), o botão de dados — o controle mais usado do site, que ficava embaixo da barra de gestos, onde o dedo acerta o sistema em vez do botão — e os dois avisos flutuantes das árvores. A inset de baixo vale pro Android também, que tem barra de gestos desde o Android 10.",
          "Medido em Chrome headless com o recorte de um iPhone injetado: sem entalhe nada muda (o botão segue a 20px do fim, como antes); com entalhe, a barra ganha 47px e o botão sobe pra 54px. Cada classe traz o próprio afastamento em vez de reaproveitar o utilitário do Tailwind: duas regras declarando a mesma propriedade dependeriam da ordem da cascata, e a perdedora sumiria em silêncio num recorte que nenhum desktop mostra.",
        ],
      },
    ],
  },
  {
    version: "0.1.43",
    date: "2026-09-10",
    title: "Navegar as Árvores com o Polegar",
    sections: [
      {
        heading: "O mapa era o único jeito, em qualquer tela",
        items: [
          "O mapa radial é a identidade visual do projeto, e era também a ÚNICA forma de navegar as árvores: dezenove delas, seis patamares cada, espremidos em 390px e alcançados por pinça e arrasto. O relato veio do autor, num aparelho de verdade — \"achei bem ruim navegar pelas árvores\" —, e nenhum script tinha como dizer isso: o check:mobile mede transbordo e alvo de toque, e os dois passavam há versões. O que ele não mede é quantos gestos custa chegar numa habilidade.",
          "A tela ganhou dois modos, com alternador visível no topo. LISTA é o padrão no celular: pilar → árvore → patamar, três toques até qualquer habilidade, sem gesto nenhum. MAPA é o padrão acima de 640px e fica a um toque no celular, porque ele mostra o que a lista não mostra — as pontes entre árvores híbridas e o desenho do destino.",
          "O padrão acompanha a largura ao vivo, mas a escolha explícita vence: a largura é um palpite sobre o aparelho, não sobre a pessoa. Um link com ?arvore=... sempre abre o mapa, porque a lista não sabe focar. E as duas telas compram pela MESMA porta — o cartão de habilidade saiu de dentro do mapa e virou componente próprio, porque duas telas que compram a mesma coisa por caminhos diferentes divergem em silêncio.",
        ],
      },
      {
        heading: "“2 Açãoões”",
        items: [
          "A lista nova expôs um erro de texto que já existia: o plural de \"Ação\" era feito grudando o sufixo na palavra inteira em vez de substituí-la, então 2 virava \"2 Açãoões\".",
          "Estava copiado em sete lugares, em cinco arquivos: o detalhe de habilidade, a ficha, a busca global, a lista de árvores e — três vezes — o buildFichaPayload, que é o que vira PDF. Dava pra levar \"2 Açãoões\" impresso pra mesa. Sobreviveu porque sete cópias de uma linha curta não parecem duplicação: cada uma é pequena demais pra incomodar sozinha e nenhuma é grande o bastante pra alguém extrair. Agora é uma função com teste.",
        ],
      },
    ],
  },
  {
    version: "0.1.42",
    date: "2026-09-10",
    title: "O Curandeiro na Tela do Mestre",
    sections: [
      {
        heading: "A tabela “Quem fez o quê” media o curandeiro pelo que ele não faz",
        items: [
          "O /encontros simula 300 batalhas contra as fichas de verdade do grupo e imprime quem fez o quê. A tabela tinha duas colunas — dano por combate e sobreviveu — e um curandeiro aparecia ali com um 0 ao lado do nome, na última linha. Isso lê como ficha ruim, e é papel diferente.",
          "É o mesmo defeito que o relatório de linha de comando tinha e que a 0.1.37 consertou; ele sobreviveu cinco versões a mais na tela. Agora a tabela tem PV DEVOLVIDOS ao lado do dano, e a ordem passou a ser por contribuição (dano mais cura) em vez de só dano. Quem não tem magia de suporte mostra traço, não zero — zero sugere que tentou e não conseguiu.",
          "Travado por um teste que roda 40 batalhas com uma curandeira no grupo e cobra que ela devolva PV, e que só ela devolva.",
        ],
      },
    ],
  },
  {
    version: "0.1.40",
    date: "2026-09-10",
    title: "A Magia que Não Cabe no Turno",
    sections: [
      {
        heading: "Vinte magias nunca tinham sido simuladas. Nenhuma vez.",
        items: [
          "Um turno tem 3 Ações, e o custo de conjuração sobe com o rank: Avançado 3, Santo 4, Rei 5, Imperador 6. Ou seja, magia de Santo pra cima NÃO CABE num turno — e o motor escolhia ações filtrando pelo que cabia. Vinte ações de dano do livro eram inalcançáveis, e não as menores: Sol Menor, Zero Absoluto, Era Glacial, Vazio, Flashover, Maremoto, Sepultamento.",
          "O livro não as proíbe. O Cap. 4, §3 tem a regra inteira — \"A Regra de Ouro: Conjuração Contínua e Dividida\" — e ela entrou completa: o cântico atravessa turnos com o PM investido no começo; Perda de Foco se passar um turno sem recitar; e o teste de Concentração de Espírito contra CD 10 + o Bônus de Rank de quem acertou, porque sofrer dano NÃO interrompe automaticamente. Falhar custa tudo que investiu mais METADE do PM — metade, não o total, que o livro é específico. E quem conjura não ataca.",
          "A IA só COMEÇA um cântico longo com o turno inteiro na mão. Isso não está no livro (ele só permite dividir); é regra de decisão declarada, e existe por medição: sem ela, um mago com 1 Ação sobrando largava o golpe de arma pra começar um cântico de 3 Ações, gastando a sobra e amarrando o turno seguinte — o time dos magos caía de 32,8% para 16,4% de vitória. Com a regra, voltou a 32,0%.",
        ],
      },
      {
        heading: "E o que o destravamento revelou",
        items: [
          "Com as magias longas finalmente na mesa, dá pra comparar o melhor dano esperado POR AÇÃO de cada árvore. Só 2 das 6 árvores de magia têm a magia longa valendo a pena: no Fogo, o Sol Menor (Imperador, 22 PM, 6 Ações) rende MENOS por Ação que a Lança de Plasma (Avançado, 13 PM, 3 Ações). A magia suprema é pior que a de dois ranks abaixo. No Vento é a mesma coisa.",
          "E a magia inteira perde da técnica corporal na economia de Ações: o teto da magia é ~24 por Ação (Vento), o do corpo é 43 (Armas Pesadas), com Punho do Fogo em 40 e Vendaval em 34. O Fogo, a árvore de dano mágico por excelência, faz 13,9.",
          "Isso é medida de dano puro, e a magia compra coisas que este motor não pontua: alcance de 90m, área de verdade e condições. Mas a diferença é grande demais pra ser só isso, e virou pergunta de design no backlog.",
        ],
      },
    ],
  },
  {
    version: "0.1.39",
    date: "2026-09-10",
    title: "A Exceção Cobrada Junto com a Regra",
    sections: [
      {
        heading: "Sete técnicas rolavam a exceção SOMADA ao caso base",
        items: [
          "A rolagem soma todo grupo de dados que encontra na linha, e o livro escreve os dois casos juntos — então a condição era cobrada junto com a regra. O Zero Absoluto (Água) rolava 36d12 onde o livro escreve 12d12: três vezes. O Sol Menor rolava 2,4×, a Explosão do Fogo o dobro, e mais quatro: Lança de Fogo, Guilhotina de Vácuo, Lâmina do Horizonte e Rio de Magma.",
          "O conserto REMOVE o miolo do parêntese em vez de cortar nele, e isso importa: quatro técnicas de Água põem o tipo de dano entre parênteses e continuam somando depois — \"3d8 + BC (cortante) + 1d6 de frio\" são 3d8 E 1d6, os dois de verdade. Cortar no parêntese perderia dano legítimo.",
          "A condição não se perdeu: o motor já sabia dobrar frio contra Molhado. Agora o Zero Absoluto rola os 12d12 escritos e a dobra devolve exatamente os 24d12 que o livro promete, pelo mecanismo que já existia. De quebra, a Cabeçada de Armas Pesadas parou de contar como dano no alvo o 1d4 que a técnica cobra de QUEM BATE.",
        ],
      },
      {
        heading: "Correr em linha reta não é atacar em área",
        items: [
          "A palavra \"linha\" sozinha marcava como ataque EM ÁREA cinco técnicas sem área nenhuma, e as três piores são as que a IA mais escolhe: a Investida (Deus da Espada), a Forma Quadrúpede (Deus do Norte) e a Investida Devastadora (Armas Pesadas) — as três dizem \"avance em LINHA RETA\", que é o caminho de quem corre e não a forma do golpe. A Investida acertava os cinco inimigos do playtest, todo turno.",
          "As outras duas eram o Relâmpago (Água) e o Golpe que Não Tem Origem (Vendaval), que dizem \"alcance ilimitado (LINHA DE VISÃO)\". A rede agora pede uma linha MEDIDA — \"linha de 18m\", \"linha de 3 km\" —, que é como o livro escreve a forma de verdade, e cobre à parte os dois jeitos que ele usa pra dizer \"atravessa e pega quem está atrás\". As 52 técnicas de área legítimas continuam em área.",
        ],
      },
      {
        heading: "O playtest, de novo — e uma pergunta afiada",
        items: [
          "Mara (Escudos) foi de 112 para 196 de dano por batalha e de 56% para 67% de sobrevivência. Gorr (Armas Pesadas) de 101 para 177. Sera devolve 205 PV por batalha. E Vex (Deus da Espada) DESPENCOU de 92 para 29, com a sobrevivência caindo de 28% para 8%.",
          "O Vex caiu porque a Investida dele era um ataque em área por engano: sozinha, ela multiplicava o dano dele por cinco no confronto de times. Ele continua com 35 de dano por TURNO — o terceiro melhor —, mas morre cedo.",
          "Isso deixa uma pergunta de balanceamento muito mais afiada que a da 0.1.35: o livro chama o Deus da Espada de \"o maior dano do livro\", e ele entrega 29 por batalha; a Mara, cuja build está descrita como \"protege, não mata\", entrega 196 e lidera a sobrevivência. As duas descrições estão invertidas em relação ao que o simulador mede.",
        ],
      },
    ],
  },
  {
    version: "0.1.38",
    date: "2026-09-10",
    title: "O Fio da Vida",
    sections: [
      {
        heading: "O pedido: um chefe tem que poder dizimar o grupo",
        items: [
          "O alvo é 25% de dizimação no mínimo. Pra mirar nisso foi preciso primeiro MEDIR: a tabela de chefes mostrava vitória e mortes médias, nunca a taxa de dizimação — e \"2,8 mortes médias\" tanto pode ser \"quase sempre morrem três\" quanto \"metade das vezes ninguém morre e na outra metade morrem todos\". A coluna DIZIMADO existe agora, e mediu 0% / 5% / 100% no 3º, 4º e 5º patamares. Um penhasco, não uma curva.",
        ],
      },
      {
        heading: "Por que não havia meio-termo: o motor matava a 0 PV",
        items: [
          "O Cap. 4 §7 é explícito: a 0 PV o personagem cai INCONSCIENTE, rola o Fio da Vida a cada turno, junta Marcas da Morte, e qualquer magia de cura de um aliado remove todas as Marcas e o acorda. O simulador tratava 0 PV como morte instantânea e permanente.",
          "Isso não era só infidelidade ao livro: era a CAUSA do resultado binário. Quem caía sumia da luta pra sempre, o dano do grupo despencava, a luta se alongava e caía o próximo — realimentação positiva não produz meio-termo, produz cara-ou-coroa. Medido: no 4º patamar um chefe com 49 de dano por turno perdia 97% das vezes e um com 51 ganhava 94%.",
          "O Fio da Vida entrou inteiro: o teste de 1d20 + Vigor contra CD 8 + o Bônus de Rank DE QUEM TE DERRUBOU (o livro: \"um goblin de estrada te deixa em CD 9, um Rei-Demônio em CD 14\"), 1 Marca por falha e 2 no 1 natural, morte permanente na terceira, e a cura de aliado que levanta e zera tudo. O curandeiro passou a levantar quem caiu antes de qualquer outra coisa — é o trabalho mais importante dele no livro, e o motor não o tinha.",
        ],
      },
      {
        heading: "A tabela de chefes lutava contra o único time sem curandeiro",
        items: [
          "Ela usava \"o time que venceu o 5×5\" — estranho por si, já que fazia a régua de chefe do livro depender de um confronto entre jogadores, e um problema de verdade depois que a cura entrou no motor: o vencedor é sempre o Time B, e o Time B não tem curandeiro. A tabela publicava o comportamento de um grupo que não pode levantar ninguém do chão.",
          "Agora existe um grupo de referência nomeado — Mara, Vex, Lyn, Kest e Sera —, uma mesa plausível: linha de frente, corpo a corpo, distância, mago e cura.",
        ],
      },
      {
        heading: "O resultado, e o que ele revelou",
        items: [
          "O 4º patamar ganhou o meio-termo que não existia: de 92%/8% para 55% de vitória contra 45% de dizimação, em 4,8 rodadas médias. Ele já cumpre o alvo de 25%, e deixou de ser cara-ou-coroa porque levantar um companheiro interrompe a espiral.",
          "Os outros dois não se resolvem com calibragem, e isso foi medido e não estimado. No 3º patamar, com PV ×4 e dano ×1,3 — o quádruplo do PV que o livro manda — o grupo ainda vence 98% e é dizimado em 2%; foram 25 combinações testadas. No 5º, ZERO por cento de vitória em todas as 25, inclusive com o dano cortado a 70%. E mexer só nas rodadas extras do chefe não move o 3º e destrói o 4º (55% → 0%).",
          "Os três patamares pedem correções em direções opostas, e é por isso que nenhum ajuste global serve: a tabela põe um grupo de 12 PA (Avançado, 3º) contra chefes de 3º, 4º e 5º — um abaixo do nível dele, um no nível, e um dois acima. O que ela mede hoje não é \"o chefe está calibrado?\", é \"quão longe do nível do grupo está este chefe?\". A decisão que sobra é de design e está no backlog: se um chefe do patamar do próprio grupo deve ser uma luta de 25% de dizimação, então o ajuste de Chefe do Apêndice G (PV dobrado, mesmo dano) está fraco na paridade e precisa mudar no livro, não no script.",
        ],
      },
    ],
  },
  {
    version: "0.1.37",
    date: "2026-09-10",
    title: "A Curandeira Não Bate",
    sections: [
      {
        heading: "O instrumento via 20% do livro, e não era 20% espalhado",
        items: [
          "Contado: o livro tem 601 habilidades e talentos, e a lista de ações do simulador tinha 122. A distribuição é que era o problema — Barreira e Proteção 0 de 21, Espíritos e Feras 0 de 7, Bardo 0 de 6, Navegação e Liderança 0 de 6, Estilo Deus da Água 1 de 19, Cura 2 de 23, Cavalaria e Escudos 4 de 23; do outro lado, Fogo 14 de 19 e Água 17 de 24.",
          "Quando o playtest dizia que o Fogo bate mais que a Barreira, ele comparava uma árvore lida a 74% com uma lida a 0%. Isso não é achado de balanceamento, é artefato do instrumento.",
          "E as árvores sobre as quais ainda não há resposta no backlog — Invocador, Ladino, Bardo, Tático, Barreira, Desintoxicação — são exatamente as que o simulador via entre 0% e 20%. Aquela lista não é um backlog: é a sombra do ponto cego da ferramenta.",
        ],
      },
      {
        heading: "Cura e PV Temporários entraram",
        items: [
          "O motor DESCARTAVA cura e PV Temporários com um filtro de texto. Recusar estava certo — os três moram no mesmo campo do livro e o sinal é oposto, e somar cura como dano já contou a Prontidão como 105 de dano por turno. O erro era parar aí.",
          "Agora a cura entra com a dobra da Ferida Fresca (Cap. 4: \"o dano sofrido no turno atual ou no turno imediatamente anterior\"), que é a mecânica que dá identidade à escola — a que faz o curandeiro agir cedo em vez de depois. A Prontidão, que o livro chama de \"a magia que define a escola\", cura SEMPRE como Ferida Fresca. PV Temporários são gastos antes dos PV reais e não acumulam, como cada magia que os concede diz. Cura em área pega o grupo.",
          "A IA ganhou uma regra de decisão DECLARADA, e não uma tática: cura quem estiver na metade ou abaixo, começando pelo pior, e oferece casca a quem ainda não tem. O limiar de 50% não é neutro e não finge ser — curandeiro que espera demais perde gente, o que cura cedo demais desperdiça.",
        ],
      },
      {
        heading: "Um erro de três vezes o valor, achado no meio do caminho",
        items: [
          "A rolagem soma TODO grupo de dados que encontra na fórmula, e o livro escreve os dois casos na mesma linha: \"2d8 + BC de PV (4d8 + BC se Ferida Fresca)\". A linha crua rola 2d8+4d8, e dobrar isso pela Ferida Fresca devolveria 12d8 onde o livro promete 4d8.",
          "Medido com o erro dentro, o time da curandeira ganhava 20,1% das batalhas; corrigido, 8,3%. É o mesmo erro que o gerador de criaturas já tinha cometido — \"(24d12 contra alvo Molhado)\" somado virava um cartão de 36d12 — e agora existe uma função só pra isso, com teste próprio.",
        ],
      },
      {
        heading: "O playtest ganhou a coluna que faltava",
        items: [
          "O Time A (com a Sera) subiu de 6,7% para 8,3% de vitória. A tabela de contribuição agora tem PV DEVOLVIDOS ao lado do dano: a Sera aparece com 21 de dano e 44 de cura por batalha, e sai do fim da tabela para o quinto lugar. O que mudou não foi a ficha dela, foi a régua.",
          "A ordenação passou a ser por dano MAIS PV devolvidos. Somar os dois não afirma que 1 de cura vale 1 de dano — afirma que os dois são maneiras de gastar um turno, que é o que a tabela compara.",
          "A tela de encontros herdou tudo: as fichas do grupo agora se curam nas 300 batalhas de teste do montador.",
        ],
      },
      {
        heading: "O que foi consertado por baixo",
        items: [
          "Uma porta só pra dano. A subtração de PV estava copiada em cinco lugares — enquanto dano era subtração, cinco cópias eram feias e inofensivas; PV Temporários e Ferida Fresca são consequências de LEVAR dano, e um lugar que não as aplicasse viraria buraco silencioso.",
          "Fábricas em vez de literais: acrescentar dois campos ao alvo acusou DEZ objetos montados à mão, cada um repetindo onze campos que ninguém lê. Agora cada chamador cobra só o que distingue o caso dele, e o próximo campo novo não quebra dez arquivos.",
          "O orçamento de dano do chefe passou a considerar a casca no teto do golpe: sem isso ele transbordaria pro próximo alvo enquanto a casca deste ainda estava de pé, atacando dois pelo preço de um. 25 testes novos, incluindo o de ponta a ponta: um grupo com curandeiro tem que aguentar mais pancada que o mesmo grupo sem ele.",
        ],
      },
    ],
  },
  {
    version: "0.1.36",
    date: "2026-09-10",
    title: "Dez Destinos Viraram Sete",
    sections: [
      {
        heading: "A barra do topo tinha dez links",
        items: [
          "Ela cresceu um link por ferramenta nova, e uma barra com dez respostas deixa de ser uma pergunta. Três saíram — nenhum por ser pouco usado. A barra ficou com Ficha, Árvores, Personagens, Mestre, Loja, Livro e Busca.",
          "O Modo Mesa saiu porque a TELA saiu. Ele era a ficha com botões grandes: as mesmas reservas, as mesmas condições, e a diferença toda em não precisar digitar no meio de um turno. Uma segunda ficha pra ter botões é caro demais pelo que entrega — então os botões foram pra ficha, e a segunda ficha deixou de existir.",
          "A ficha ganhou as duas coisas que só existiam lá: os passos de −5/−1/+1/+5 em PV, PM, PT, PP e Calor, ocupando a largura inteira do cartão (o campo numérico continua ali — botão pro turno, digitação pra correção entre sessões); e a faixa de \"de quem é a vez\" no topo, com o botão de passar o turno, que DESAPARECE quando não há combate montado.",
          "Nada se perdeu na troca. O registro de sessão conta o dano levado a partir do passo negativo de PV, e o Modo Mesa era o único lugar que o produzia; agora quem o produz é a ficha, com a mesma assinatura de quem estava agindo.",
        ],
      },
      {
        heading: "Iniciativa e Encontros agora moram no Painel do Mestre",
        items: [
          "As duas são trabalho de Mestre, e o /mestre passou a ser a porta delas — junto do comparador de builds, que já estava fora da barra pelo mesmo motivo e agora deixou de ser exceção. O painel abre com três cartões, e cada um diz o que a ferramenta RESPONDE, não o que ela é: \"este encontro mata a mesa?\" informa; \"Encontros\" não informa nada a quem nunca abriu.",
          "Cartões, e não abas: as três telas somam mais de duas mil e setecentas linhas de componente, e juntá-las numa rota só cobraria isso do celular de quem só queria consultar os PV do grupo. As rotas /encontros, /iniciativa e /comparar continuam de pé — link salvo, busca global e pré-cache offline seguem funcionando como antes —, e o rodapé, que é a segunda navegação do site, ganhou as três.",
          "Verificado com a rota a menos: nenhuma das 16 rotas transborda entre 320 e 414px, nenhum alvo de toque abaixo de 24px nas telas novas, contraste AA nos dois temas, e as 19 rotas do pré-cache continuam abrindo com o servidor morto.",
        ],
      },
    ],
  },
  {
    version: "0.1.35",
    date: "2026-09-10",
    title: "A CA era Decoração",
    sections: [
      {
        heading: "Nenhuma técnica do livro errava — literalmente nenhuma",
        items: [
          "O simulador decide se uma técnica rola ataque (e portanto pode ERRAR) procurando frases como \"Ataque mágico à distância\" no texto dela. Ele procurava no campo errado: lia a fórmula de dano, e a frase mora na descrição do efeito. Medido: ZERO das 122 ações do livro inteiro rolavam ataque. Todas caíam no ramo de teste de resistência, que não consulta a CA do alvo e garante metade do dano mesmo quando o alvo passa no teste.",
          "Ou seja: a Classe de Armadura era decoração em toda simulação que este projeto já rodou, e toda técnica de dano acertava sempre. Dezessete técnicas voltaram a poder errar — quatro de Fogo, quatro de Água, cinco do Vendaval, duas de Vento, duas de Terra, e uma cada de Deus da Água, Deus do Norte e Armas Pesadas.",
          "A rede não foi alargada além do necessário: incluir \"ataque corpo a corpo\" pegaria mais duas técnicas certas e uma errada — a Devolver, do Deus da Água, cuja frase descreve o ataque DO INIMIGO que dispara a Reação.",
        ],
      },
      {
        heading: "A IA sabia resolver e não sabia escolher",
        items: [
          "O mesmo erro tinha um irmão na outra ponta do arquivo. QUINZE técnicas do livro multiplicam o dado da arma (\"+2 Dados de Arma\", \"Dado de arma rolado cinco vezes\") em vez de trazer dados próprios — entre elas CINCO das seis ações de dano do Deus da Espada, que o livro chama de maior dano do jogo. A RESOLUÇÃO sempre as rolou; a IA que ESCOLHE contava zero nelas e preferia qualquer outra coisa.",
          "A escolha passou a ser por dano ESPERADO contra o alvo da vez: dados próprios, mais Dados de Arma, mais o bônus fixo, tudo multiplicado pela chance real de acertar aquela CA. Nenhuma regra nova — é a mesma aritmética que o motor já executava com os dados na mão, só que agora a decisão a conhece. Um teste roda oito mil resoluções e compara com a previsão: as duas contas não podem mais divergir em silêncio.",
          "A tabela de dano por turno do relatório também tinha a conta dela, e agora chama a mesma função do motor. Ela ganhou uma coluna implícita que faltava: \"contra CA 15\" — porque dano por turno só existe contra alguém.",
        ],
      },
      {
        heading: "O playtest mudou de dono",
        items: [
          "Vex (Deus da Espada) caiu de 94 pra 69 de dano por batalha e de 45% pra 28% de sobrevivência. Ele era o maior beneficiado por nunca errar, e é quem mais perde quando a CA volta a existir — mesmo ganhando os Dados de Arma que a IA agora enxerga (o golpe dele subiu de 21 pra 35 por turno).",
          "Mara (Cavalaria e Escudos) virou a MAIOR causadora de dano do playtest, com 95 por batalha e 93% de sobrevivência. A build está descrita como \"protege, não mata\", e o simulador discorda em toda linha. Isso é balanceamento pra olhar, não um número pra comemorar.",
          "Borg (Deus do Norte) subiu de 54 pra 81 e Gorr (Armas Pesadas) de 67 pra 79. Iri (Vento) desabou de 53 pra 19 — as técnicas dela custam duas Ações, e a conta certa mostra que duas Ações raramente compensam. A vitória do Time B caiu de 97% pra 93%, e a tabela de chefes não se mexeu em nenhuma linha.",
        ],
      },
      {
        heading: "Quebrantado entrou na simulação",
        items: [
          "Das cinco condições que o motor declarava não modelar, Quebrantado era a única puramente numérica: cada acúmulo tira 1 da CA e 1 do dano de quem o carrega, até o teto do Bônus de Rank de quem aplicou. As outras quatro (Atolado, Desequilibrado, Marcado, Soterrado) são sobre movimento e posição, e este motor não tem mapa.",
          "Custo da ausência: as treze citações de Quebrantado no livro inteiro são de UMA árvore, Armas Pesadas, cuja mecânica central é justamente empilhá-los — e o playtest tem uma build chamada \"Lutador — empilha Quebrantado\". A simulação lia esses acúmulos como texto decorativo.",
          "O motor lê os acúmulos da prosa da técnica, exceção deliberada à regra dele de só ler campos estruturados. Isso só é seguro porque a condição é de uma árvore só e nenhuma técnica do livro a REMOVE — e agora existe um teste que quebra no dia em que qualquer uma dessas duas coisas deixar de ser verdade.",
          "Declaração honesta: ligar ou desligar Quebrantado não muda um número do playtest. A IA continua sem dar valor a condição — ela escolhe pelo dano, e as técnicas que empilham acúmulos raramente são as de maior dano. A mecânica está correta e testada; quem vai colhê-la é o jogador na mesa. Uma IA que enxergue o valor de uma condição é a próxima melhoria de verdade do motor, e está anotada no PROGRESS.",
        ],
      },
    ],
  },
  {
    version: "0.1.34",
    date: "2026-09-10",
    title: "Comprar o Quê?",
    sections: [
      {
        heading: "Os botões passaram a dizer o que fazem",
        items: [
          "Numa grade de 85 itens da loja, um leitor de tela anunciava \"Comprar, botão\" oitenta e cinco vezes seguidas. O texto visível basta pra quem enxerga o card em volta; não basta pra quem só ouve o botão. Agora cada um anuncia o nome e o preço — na loja, nas árvores e nas magias combinadas.",
          "Os números que mudam sozinhos passaram a ser anunciados: o PA gasto, que muda por causa de uma compra feita em outra tela, e as reservas do Modo Mesa, que mudam por botão no meio do turno. Antes, quem só ouve recebia silêncio como confirmação da compra.",
          "Isto é a metade previsível do teste com leitor de tela. A outra metade — se a ordem de foco conta a história certa, e se dá pra montar um personagem sem enxergar — continua precisando de meia hora de escuta humana.",
        ],
      },
    ],
  },
  {
    version: "0.1.33",
    date: "2026-09-10",
    title: "Aponte a Câmera",
    sections: [
      {
        heading: "A ficha vira um QR",
        items: [
          "Entre dois celulares na mesma mesa, o caminho mais curto não é link nem arquivo: é apontar a câmera. Não passa por aplicativo de mensagem, não depende de o link sobreviver inteiro, e não precisa de gerenciador de arquivos.",
          "O botão QR fica ao lado de Compartilhar e Copiar link. O código abre logo abaixo, sobre fundo branco fixo — é a única superfície do site que ignora o tema, porque um QR escuro sobre pergaminho escuro é um QR que a câmera não enxerga.",
          "Ele diz quando o código fica denso demais pra ser lido de longe, e diz quando a ficha simplesmente não cabe (acima de 2.953 caracteres, o teto do formato) em vez de desenhar um código impossível.",
          "Funciona sem internet, como o resto do site.",
        ],
      },
      {
        heading: "E a prova de que ele lê de verdade",
        items: [
          "A objeção contra fazer isso era boa: não dá pra VERIFICAR um QR sem uma câmera, e um QR que desenha mas não lê é uma funcionalidade que mente.",
          "A resposta foi decodificar o QR gerado com uma implementação independente, dentro do teste. O código é rasterizado exatamente como aparece na tela e lido de volta; se o texto não voltar idêntico, o teste falha.",
          "Isso pescou dois defeitos de verdade. O primeiro: qualquer texto com acento saía corrompido, porque o modo byte do gerador não usava UTF-8 — o link nunca teria acento, mas o componente é genérico.",
          "O segundo é mais interessante: varrendo as 40 versões de QR, 39 voltam perfeitas e UMA não volta — a versão 23. Ela falha em qualquer tamanho de renderização, o que descarta \"ficou pequeno\". Como esse decodificador é o leitor por trás de boa parte dos scanners que rodam em navegador, o site agora PULA a versão 23 e usa a seguinte. Custa quatro módulos a mais; a alternativa era uma ficha que algumas câmeras nunca abririam.",
        ],
      },
    ],
  },
  {
    version: "0.1.32",
    date: "2026-09-10",
    title: "Rolar a Perícia",
    sections: [
      {
        heading: "Não existia lugar nenhum pra rolar uma perícia",
        items: [
          "Provavelmente a rolagem mais frequente da mesa, e o site não tinha onde fazê-la: a ficha listava as perícias sem botão, e o rolador tinha quatro fontes de Teste — Livre, Atributo, Magia e Marcial — nenhuma delas perícia.",
          "Agora tocar numa perícia da ficha abre o rolador com a conta pronta, e o rolador ganhou a fonte Perícia com a lista das que o personagem tem. O chip mostra o total já somado, que é o número que se fala em voz alta na mesa.",
          "A conta é a do Cap. 1, §4 inteira: atributo da Lista Mestre, mais o Bônus de Rank quando uma árvore de Utilidade cobre aquela perícia — e só quando você realmente a tem, porque sem a perícia não existe teste treinado onde somar o bônus.",
          "Duas árvores cobrindo a mesma perícia (Percepção, no Ladino e no Tático) não somam: vale o maior, como manda o Empilhamento do Cap. 4.",
          "A Vantagem por ter a perícia NÃO é aplicada sozinha. O livro diz que ela vale \"quando a perícia se encaixa perfeitamente na situação\", e esse quando é julgamento do Mestre — a tela avisa que o personagem tem a perícia e deixa a decisão com a mesa.",
        ],
      },
      {
        heading: "O dado que faltava pra isso existir",
        items: [
          "O Bônus de Rank em perícia estava escrito só na PROSA de cada árvore (\"soma em Furtividade, Ladinagem, Percepção…\"), e prosa não é computável: ler aquilo exigiria adivinhar por regex numa frase escrita à mão, que quebra em silêncio no dia em que alguém a reescrever.",
          "As três árvores de Utilidade passaram a declarar a lista das perícias cobertas. A prosa continua sendo o que o livro imprime; a lista é o que a ficha calcula — e um teste garante que as duas nunca divirjam, inclusive que só as de Utilidade cobrem perícia alguma.",
        ],
      },
    ],
  },
  {
    version: "0.1.31",
    date: "2026-09-10",
    title: "O Que a Mesa Mostrou",
    sections: [
      {
        heading: "O site passou a contar sozinho",
        items: [
          "Metade das pendências de balanceamento pede uma contagem que só sai no papel. A do Vendaval é literal: conte os ataques corpo a corpo que ACERTARAM o Vendaval e compare com o outro da linha de frente. Ninguém faz isso com lápis no meio de uma sessão — e é por isso que essas pendências não fecham.",
          "O /sessao conta sozinho, sem pedir nenhuma digitação: cada rolagem do rolador entra assinada por quem está agindo (o tracker de iniciativa já sabe), e cada passo negativo de PV no Modo Mesa É um golpe levado.",
          "No fim aparecem os números que o balanceamento pede: quantas rolagens, quantos críticos, o que mais se repetiu na mesa, quem rolou mais, e — a coluna que responde a pergunta do Vendaval — quanto dano cada personagem levou e em quantos golpes.",
          "Ele começa DESLIGADO, e é uma decisão: gravar por padrão transformaria toda partida numa coleta silenciosa, num site inteiro construído em cima de dado que não sai do aparelho.",
        ],
      },
      {
        heading: "E o que ele não finge saber",
        items: [
          "Se um ataque acertou. O site vê a rolagem, não a CA do alvo — quem decide o acerto é o Mestre, na cabeça dele. Uma taxa de acerto ali seria número inventado.",
          "O que dá pra afirmar é o que ele mostra: quantas vezes cada coisa foi ROLADA, quantos críticos caíram, e quanto dano cada um levou.",
        ],
      },
    ],
  },
  {
    version: "0.1.30",
    date: "2026-09-10",
    title: "Duas Builds, Um Alvo",
    sections: [
      {
        heading: "Comparar deixou de ser opinião",
        items: [
          "Metade das pendências de balanceamento do projeto é \"jogar e ver\" — e parte delas tem um lado que dá pra medir ANTES da mesa. Enquanto não se mede, \"essa build é mais forte\" é palpite com número nenhum atrás.",
          "O /comparar põe duas fichas do roster lado a lado: PA gastos, conhecimentos, PV, CA, iniciativa, reservas, o maior golpe de cada uma — e o resultado de 400 batalhas contra o mesmo alvo.",
          "As duas enfrentam o MESMO alvo com a MESMA semente. Um alvo diferente pra cada uma compararia dois encontros, não duas builds; e sem semente fixa, a diferença entre 62% e 58% pode ser só o dado.",
          "O alvo é o molde do Apêndice G sem truques: assim ele gasta o orçamento de dano do patamar inteiro todo turno, que é a criatura média contra a qual a régua do livro foi calibrada. Uma criatura com habilidades mediria quão bem cada build responde ÀQUELA habilidade.",
          "Ele não diz qual build é melhor, e a tela repete isso: cura, controle e utilidade não aparecem numa luta de um contra um. Uma build que perde nos dois números pode ser exatamente a que a mesa precisa.",
        ],
      },
      {
        heading: "E a barra do topo respirou",
        items: [
          "Com dez destinos, \"Livro de Regras\" era o rótulo que empurrava a Busca pra fora da tela em monitores estreitos. Virou \"Livro\".",
          "O comparador fica FORA do menu de propósito: comparar builds é coisa de preparo, não destino de sessão. Ele é alcançado pelo roster e pelo Painel do Mestre, que são os dois lugares de onde a pergunta nasce.",
        ],
      },
    ],
  },
  {
    version: "0.1.29",
    date: "2026-09-10",
    title: "Ctrl+P",
    sections: [
      {
        heading: "A ficha agora imprime como ficha",
        items: [
          "O PDF do Typst continua sendo o documento bonito de três páginas — e ele precisa do servidor, porque o Typst roda lá. Isto é o outro caminho: Ctrl+P na própria ficha, funcionando OFFLINE, porque é só CSS.",
          "A regra do recorte é a mesma do Modo Mesa: fica o que se consulta dentro de um turno. Saem os botões, as condições, o descanso, o simulador, a lore, o rodapé e o rolador — nenhum deles é conteúdo de ficha, e no papel viravam caixas mortas ocupando o espaço das magias.",
          "Também saem as três formas de conjuração e o cântico de cada magia: numa folha de consulta o que importa é o custo, o alcance e o efeito.",
          "Impressão é sempre em tema claro. Uma ficha impressa no tema escuro é uma folha inteira de tinta preta com letra clara por cima — gasta o cartucho e sai ilegível em impressora a laser comum.",
          "Foto, capa e a arte de fundo do cabeçalho não vão pro papel: numa impressora doméstica a arte de fundo sozinha come mais tinta que a ficha inteira, e ela é ambientação, não informação.",
          "O rodapé impresso diz de onde a folha veio e pede pra conferir a versão viva. Uma ficha desatualizada circulando na mesa é pior que nenhuma.",
        ],
      },
    ],
  },
  {
    version: "0.1.28",
    date: "2026-09-10",
    title: "O Mestre Olha a Mesa",
    sections: [
      {
        heading: "As fichas do grupo lado a lado",
        items: [
          "O montador de encontros já simula contra as fichas de verdade, mas isso responde uma pergunta de preparo: este encontro mata a mesa? Entre um turno e outro o Mestre tem outra, e ela é de consulta — quem está mais machucado, quem ainda tem recurso, quem está com o quê pegando.",
          "O /mestre põe tudo isso numa tela: PV com barra, CA, iniciativa, PM/PT/PP, as condições ativas de cada um, e o maior golpe que cada personagem consegue dar, com o nome do golpe ao lado.",
          "Por padrão ele ordena por quem está PIOR primeiro — é a ordem em que o Mestre olha a mesa quando decide em quem o monstro bate. Quem cai abaixo de metade dos PV ganha moldura própria.",
          "O painel LÊ as fichas e nunca escreve nelas. Mexer nos números de um personagem continua sendo de quem joga com ele.",
        ],
      },
      {
        heading: "E um número que ele deliberadamente não mostra",
        items: [
          "\"Dano por turno do grupo\" contra a régua do Apêndice C parecia o número mais óbvio a exibir aqui — e é justamente o que a própria régua avisa não ser automatizável: ela embute quantas Ações a árvore gasta, quantos alvos ela pega e se o alvo veste Touki, e nada disso está nos dados de uma magia isolada.",
          "Somar médias de golpes daria um número com cara de verdade e sem verdade nenhuma. No lugar dele aparece o que dá pra afirmar: a média do maior golpe único de cada um.",
        ],
      },
    ],
  },
  {
    version: "0.1.27",
    date: "2026-09-10",
    title: "Modo Mesa",
    sections: [
      {
        heading: "Uma tela só, aberta a sessão inteira",
        items: [
          "Ficha, iniciativa, encontros e rolador são quatro rotas, e numa sessão de verdade a pessoa alterna entre elas o tempo todo — num celular, com uma mão, enquanto é a vez dela. Cada troca é um toque e uma perda de contexto, e o contexto que se perde é justamente de quem é o turno.",
          "O /mesa junta o que se usa DENTRO de um turno: de quem é a vez (com o próximo já anunciado e um botão grande de Passar), suas reservas, o que está pegando em você, e os PV de todo mundo no combate. O dado já está em todas as rotas desde a 0.1.22.",
          "As reservas mudam por passos de −5, −1, +1 e +5 em vez de campo numérico: digitar exige as duas mãos e a atenção que o turno está consumindo.",
          "O que NÃO entra é tão importante quanto: nada de editar ficha, comprar habilidade ou montar criatura. Isso acontece entre sessões, e cada uma dessas coisas já tem uma tela que faz melhor — uma tela de mesa que também servisse pra construir personagem voltaria a ser a ficha, e o problema voltaria junto.",
        ],
      },
    ],
  },
  {
    version: "0.1.26",
    date: "2026-09-10",
    title: "Eu Aguento Isso?",
    sections: [
      {
        heading: "O simulador saiu da mão do Mestre e chegou na do jogador",
        items: [
          "O /encontros sempre soube rodar 300 batalhas contra as fichas do grupo, mas isso responde a pergunta do MESTRE: este encontro mata a mesa? A pergunta do jogador é outra e mais simples — quantos turnos eu aguento contra um Sapo-Lodo? e contra três?",
          "A ficha agora responde: escolha uma criatura do Apêndice G (ou uma do seu bestiário), diga quantas, e veja chance de vitória, rodadas médias e quanto PV sobra.",
          "Nenhum número novo foi inventado: é o mesmo motor que já trava a régua do Apêndice C nos testes do projeto.",
          "A simulação é você SOZINHO, e a tela diz isso. A pergunta é sobre a sua build, não sobre o grupo — um resultado que incluísse aliados imaginários responderia outra coisa.",
          "A semente é fixa: repetir a mesma escolha dá o mesmo número. É o que permite comparar duas builds — um resultado que dança a cada clique não serve pra decidir nada.",
        ],
      },
    ],
  },
  {
    version: "0.1.25",
    date: "2026-09-10",
    title: "Dormir Conta",
    sections: [
      {
        heading: "Descanso virou botão, com a conta à vista",
        items: [
          "Descanso Curto e Longo agora acontecem na ficha, pelas regras exatas do Cap. 4, §7. Nada muda sozinho: a tela mostra quanto vai devolver de cada reserva e de onde saiu cada número (\"25% de 40\", \"20% rolado no Vigor\"), e só aplica no segundo toque. Um número que aparece sem a conta ao lado é um número que a mesa não confere.",
          "O Curto não devolve PV. Nenhum. É a regra mais importante do capítulo — \"a carne não fecha sozinha\" — e é dela que depende a promessa de que um grupo sem curandeiro sangra na segunda luta.",
          "O teto de dois Curtos entre dois Longos é cobrado de verdade: o terceiro é recusado, e o botão diz em quantos você está. O Descanso Longo zera a contagem, porque é ele que vira o dia.",
          "Os PT voltam INTEIROS no Curto. A tabela do Cap. 4 lista PT entre os 25%, e o aviso logo abaixo dela diz que isso está errado — o site segue os dois trechos que corrigem, não o que foi corrigido.",
        ],
      },
      {
        heading: "E o Downtime saiu do papel",
        items: [
          "As seis atividades de uma semana livre (Cap. 5, §1) estão na ficha. Trabalhar rola 2d6 × seu maior Bônus de Rank e o ouro entra na hora; Recuperar-se enche os PV. As outras quatro são combinação de mesa — o site mostra o texto em vez de fingir que resolve.",
          "Nenhuma delas concede PA, magia, talento ou Rank, e a tela repete isso: progressão só vem de jogar a campanha.",
        ],
      },
      {
        heading: "Uma contradição do livro que precisa de você",
        items: [
          "Sobre quanto PM o Descanso Curto devolve, o livro diz duas coisas diferentes: a tabela do Cap. 4 diz 25%, e o aviso logo abaixo dela e o Cap. 3 dizem metade. Não é detalhe — o próprio aviso constrói a defesa do teto de dois Curtos em cima da conta de 50%.",
          "O site segue a tabela (25%) por enquanto, porque é o número que a mesa lê na hora de aplicar. Escolher o maior sem o autor mandar seria dobrar por conta própria o recurso do qual a Magia de Cura converte PV.",
        ],
      },
    ],
  },
  {
    version: "0.1.24",
    date: "2026-09-10",
    title: "A Ficha Sabe Que Você Está Envenenado",
    sections: [
      {
        heading: "Condição deixou de ser anotação no papel",
        items: [
          "A ficha tem uma seção de Condições: marque Envenenado, Preso, Quebrantado, e o site passa a saber. Ela fica logo abaixo dos números que ela muda, de propósito — ler as duas coisas juntas é o que faz um número menor parecer explicado em vez de errado.",
          "Quebrantado é a única condição do livro que mexe num NÚMERO, e agora ele mexe de verdade: −1 na CA e −1 no dano por acúmulo, com os acúmulos contados na ficha. As outras mudam como se rola ou o que se pode fazer, e isso a ficha mostra em vez de somar.",
          "O rolador de dados passou a olhar as condições. Se você está Envenenado, ele avisa que aquela rolagem deveria sair com Desvantagem e põe o botão de aplicar a um toque — ele não força, porque a condição pode ter acabado de sair e o Mestre pode ter combinado outra coisa.",
          "Deslocamento zerado, quem te ataca com Vantagem, dano no início do seu turno e perda de Ações aparecem num resumo do que está valendo agora, sempre dizendo QUAL condição causou. A diferença entre \"Desvantagem\" e \"Desvantagem por Envenenado\" é a diferença entre a mesa aceitar o número e entender o número.",
          "Um botão de Fim de combate limpa tudo de uma vez, que é como a mesa realmente limpa a ficha.",
        ],
      },
      {
        heading: "O que ela não tenta fazer: contar rodadas",
        items: [
          "A duração das condições do Cap. 4 é escrita em prosa — \"até quebrar o gelo\", \"enquanto a fonte do medo estiver visível\". Um contador numérico obrigaria a mesa a inventar um número que a regra não pediu e a mantê-lo atualizado a cada turno pra ele não mentir.",
          "No lugar dele, cada condição tem um campo de nota livre, já preenchido com a duração padrão do livro como sugestão. Quem quiser escreve \"CD 12 Força pra sair\" ou \"até o fim do combate\".",
        ],
      },
    ],
  },
  {
    version: "0.1.23",
    date: "2026-09-10",
    title: "A Condição Que Se Explica",
    sections: [
      {
        heading: "\"O alvo fica Envenenado\" agora diz o que isso faz",
        items: [
          "O glossário do Cap. 4 sempre avisou que é \"aqui, e só aqui\" que cada condição tem definição completa — e centenas de habilidades a citam pelo nome sem repetir o efeito. Na mesa isso era: ler a magia, não lembrar o que Quebrantado faz, sair da magia, procurar o capítulo 4, voltar. No meio do turno.",
          "Agora a condição citada na prosa é clicável e o verbete abre ali mesmo, embaixo do parágrafo. São 221 citações reconhecidas no livro inteiro, e vale também na busca e no Grimório da ficha, porque os três desenham o mesmo card.",
          "O reconhecedor respeita a convenção do próprio livro: condição citada vem com inicial maiúscula. Isso não é preciosismo — metade dos nomes é palavra comum do português, e sem a regra \"preso ao chão\" e \"marcado pela guerra\" virariam links. Um glossário que acende em toda frase deixa de ser glossário.",
          "Ele também entende a flexão: \"as criaturas ficam Seladas\", \"cai na fenda e fica Presa\", \"duas ficam Caídas\". Casar só a forma do dicionário deixaria a maioria dessas citações de fora.",
        ],
      },
      {
        heading: "E o glossário virou dado",
        items: [
          "As 24 condições saíram de uma tabela escrita à mão no capítulo e viraram src/data/condicoes.ts. A tabela impressa no livro é gerada de lá, então não existe cópia pra divergir.",
          "Cada uma carrega, além do texto, o que a ficha consegue aplicar sozinha — Desvantagem em ataque, Deslocamento zerado, dano no início do turno. O que depende do Mestre decidir continua sendo prosa: um campo que fingisse saber \"enquanto a fonte do medo estiver visível\" mentiria em metade das mesas.",
        ],
      },
    ],
  },
  {
    version: "0.1.22",
    date: "2026-09-10",
    title: "O Dado Segue Você",
    sections: [
      {
        heading: "O rolador existia só na ficha",
        items: [
          "Ele nasceu dentro da ficha, o que fazia sentido enquanto rolar dado fosse uma coisa que se faz olhando a ficha. Não é: no meio do combate a pessoa está no tracker de iniciativa vendo de quem é o turno, ou em Encontros com a criatura aberta — e era exatamente aí que ela tinha que sair da tela pra rolar um d20.",
          "Agora o botão de dados está em todas as rotas, com o mesmo estado: o histórico da sessão, os macros salvos e o atalho R continuam onde estavam, e mudar de tela não perde nada.",
          "Ele já era global em tudo menos na montagem — o estado sempre morou fora da ficha. O que faltava era o rolador estar montado onde a mesa está.",
        ],
      },
    ],
  },
  {
    version: "0.1.21",
    date: "2026-09-10",
    title: "O Atalho Que Faltava",
    sections: [
      {
        heading: "Macro agora guarda Teste, e não só dano",
        items: [
          "Os macros do rolador só sabiam guardar fórmula de dano — \"Bola de Fogo → 2d10+5\". Metade do que se repete numa sessão é o outro lado: Furtividade com Vantagem, resistir ao veneno, iniciativa. Tudo d20 com um modificador e um modo de vantagem, e nada disso cabia numa fórmula de dados.",
          "Agora existe uma estrela ao lado do Rolar 1d20 que guarda o teste como ele está: o nome que o próprio rolador já dava, o modificador e o modo de vantagem. Um toque pra salvar, um toque pra repetir.",
          "Macro de teste rola d20 de verdade, com crítico: se caísse na rolagem de dano, um 20 natural viraria só mais um número.",
          "Ele guarda o modificador JÁ somado, e não a fonte que o produziu. Macro é atalho de mesa, não pedaço de ficha — guardar \"Ataque Mágico de Fogo\" faria o atalho mentir no dia em que o personagem subisse de rank, ou ao ser usado com outro personagem do roster.",
          "Os macros que já estavam salvos continuam ali, como macros de dano. Macro que some sem explicação é indistinguível de defeito, e um registro sem fórmula é descartado em vez de virar um botão que rola zero.",
        ],
      },
    ],
  },
  {
    version: "0.1.20",
    date: "2026-09-10",
    title: "Um Toque, e Foi",
    sections: [
      {
        heading: "Passar a ficha adiante virou um toque",
        items: [
          "A ficha e a criatura ganharam um botão Compartilhar que abre a bandeja do próprio celular — a mesma que aparece em qualquer app. Escolhe o contato e acabou: sem passar pela área de transferência, sem baixar arquivo, sem gerenciador de arquivos.",
          "Ele manda o LINK, e não o arquivo, de propósito: um link termina com o amigo abrindo o site já na tela de importar, com um toque; um arquivo termina com ele segurando um .mtficha que nenhum aplicativo do telefone sabe abrir. O arquivo continua existindo pro que só ele resolve — levar a foto e a capa junto.",
          "O botão só aparece onde a bandeja existe (celular, e alguns navegadores de desktop). Onde não existe, nada muda e o Copiar link continua sendo o caminho garantido.",
          "Cancelar não acusa erro. Fechar a bandeja é uma decisão, não um defeito — e o navegador sinaliza os dois casos do mesmo jeito, então era fácil errar isso e fazer a ficha piscar erro toda vez que alguém mudasse de ideia.",
        ],
      },
      {
        heading: "E o site diz que dá pra instalar",
        items: [
          "O site é instalável desde a 0.1.15, mas isso só servia pra quem sabia caçar \"Adicionar à tela de início\" no menu do navegador. Agora tem um botão no rodapé.",
          "No Android ele instala de um toque. No iPhone, onde o Safari não tem API de instalação nenhuma e nunca vai ter, o botão ensina o caminho de dois passos, com o ícone real de Compartilhar do iOS.",
          "Ele some sozinho quando o app já está instalado — um botão \"Instalar\" dentro do app instalado é a definição de ruído.",
        ],
      },
    ],
  },
  {
    version: "0.1.19",
    date: "2026-09-10",
    title: "O Link Que Chegou Pela Metade",
    sections: [
      {
        heading: "\"Este link não traz uma ficha\" dizia a mesma coisa para cinco problemas diferentes",
        items: [
          "Um link de ficha que não abre podia ser: o app de mensagem comendo a parte depois do #, um link de criatura aberto na tela de ficha, o link cortado no meio, o navegador antigo demais, ou um conteúdo que não é ficha. A tela dizia a mesma frase para os cinco, e quem recebia não tinha como saber de quem era o problema.",
          "Agora cada caso tem título próprio, explicação e — o que faltava — uma SAÍDA. Quando o link chega cortado, a tela diz quantos caracteres chegaram, que é o número que faz o remetente entender na hora o que aconteceu.",
        ],
      },
      {
        heading: "O link que não abriu no iPhone tem nome",
        items: [
          "A descompressão que o link usa (DecompressionStream) só existe no Safari a partir do iOS 16.4, de março de 2023. Num iPhone mais antigo o link comprimido simplesmente não abre — e o erro era engolido, virando \"link inválido\", que manda a pessoa culpar o link e quem mandou.",
          "A tela agora reconhece esse caso e diz o que é: o navegador é antigo demais, não é problema do link nem da ficha. E oferece as três saídas reais — atualizar o iOS, abrir em outro aparelho, ou pedir o arquivo da ficha.",
          "Falta confirmar com o aparelho na mão que era isso mesmo: pode ter sido também o aplicativo de mensagem cortando o link.",
        ],
      },
      {
        heading: "Colar o link, em vez de baixar arquivo",
        items: [
          "Toda tela de link que falha agora tem um campo de colar. É o caminho principal no celular: baixar um arquivo e achá-lo de novo num gerenciador de arquivos é o passo em que a importação morre num telefone.",
          "Ele aceita o link inteiro ou só o fim dele, e — o detalhe que resolve o caso mais comum — aceita o link QUEBRADO EM VÁRIAS LINHAS. Quando o aplicativo parte um link longo em duas linhas e só a primeira vira clicável, colar as duas aqui faz a ficha voltar a abrir.",
        ],
      },
      {
        heading: "E agora se sabe quanto o link pesa",
        items: [
          "Medido: uma ficha com uma árvore inteira até Imperador dá um link de ~1.086 caracteres; com duas árvores, ~1.594; com três, ~2.058; com cinco, ~2.990.",
          "O teto que morde é o Discord, que corta mensagem em 2.000 caracteres — e ele morde mais cedo do que se imaginaria: duas árvores passam, TRÊS já não passam, e três árvores é um multiclasse comum de campanha longa. Depois de copiar um link grande demais, a ficha agora avisa, com o número, e manda usar o arquivo.",
          "A mesma medição matou uma ideia que parecia boa: \"gerar o link sem compressão, aí o Safari velho lê\". Sem compressão, a ficha de UMA árvore já sai com ~3.500 caracteres e não caberia no Discord de ninguém. A compressão aqui não é otimização — é o que faz o recurso existir.",
        ],
      },
    ],
  },
  {
    version: "0.1.18",
    date: "2026-09-10",
    title: "A Porta Errada",
    sections: [
      {
        heading: "O site respondia 404 em inglês",
        items: [
          "Um endereço errado devolvia literalmente \"404: This page could not be found.\" — em inglês, num site declarado como pt-BR, e com dois <title> no mesmo documento, porque a tela embutida do framework trazia o dela por cima do que o layout já tinha escrito.",
          "Agora existe uma página de verdade: em português, dentro do layout (com o menu, o rodapé, a fonte e o tema escolhido), com um título só, e ainda respondendo 404 de verdade pra quem consulta o status.",
          "Ela diz a coisa que importa antes de qualquer outra: um endereço errado não apaga personagem nenhum. E oferece os caminhos que restam — o roster, a ficha, o livro — mais a busca, pra quem procurava algo cujo endereço não sabia.",
        ],
      },
      {
        heading: "E um erro de execução era indistinguível de falta de sinal",
        items: [
          "Sem tela de erro própria, qualquer defeito de runtime caía na tela padrão do framework. Isso ficou pior depois da 0.1.15: offline, essa tela é idêntica a \"faltou rede\", e quem está numa mesa sem sinal não tinha como saber se acabou de perder a ficha.",
          "A tela nova separa os dois casos: com a rede caída ela diz que o site inteiro funciona offline e que o mais provável é esta tela ter pedido algo que só existe no servidor; com rede, assume o defeito sem rodeio.",
          "Nos dois casos ela afirma o que a pessoa quer saber: as fichas continuam salvas no aparelho, não nesta tela. Tem botão de tentar de novo, e imprime o código do erro pra quem for relatar — em produção a mensagem real é apagada de propósito, e sem esse código um relato chega como \"deu erro\".",
          "O estado da rede passou a ser lido em um lugar só, compartilhado com a tarja de aviso offline: duas leituras diferentes de \"está offline?\" no mesmo site acabariam se contradizendo na frente do usuário.",
        ],
      },
    ],
  },
  {
    version: "0.1.17",
    date: "2026-09-10",
    title: "Onde Está a Peçonha",
    sections: [
      {
        heading: "O livro tinha 879 verbetes e nenhum jeito de procurar um",
        items: [
          "Não existia caminho pra \"qual magia aplica Envenenado\" ou \"onde está a Peçonha\". O filtro do sumário do /livro reduz TÍTULOS de seção, e o seletor do mapa acha árvore por nome — nenhum dos dois entra no texto das regras. Sobrava rolar os 190 mil caracteres do livro, no meio do turno, com o grupo esperando.",
          "A rota /busca procura nos 879 verbetes: as 601 técnicas, magias e talentos, mais as 114 maestrias, as 9 magias combinadas, as 19 árvores, os 85 itens da loja, as 12 raças, os 13 antecedentes, as 20 perícias e as 6 criaturas prontas.",
          "Ela procura no NOME e no TEXTO. \"Envenenado\" devolve as oito coisas que aplicam a condição, e nenhuma delas tem a palavra no título — que é exatamente o caso que o sumário nunca resolveria.",
          "Sem acento e sem caixa nos dois lados: quem digita \"peconha\" acha \"Peçonha\". Duas palavras estreitam em vez de somar — \"fogo cura\" devolve só o que é as duas coisas.",
        ],
      },
      {
        heading: "O resultado abre ali, e não manda você pro livro",
        items: [
          "Quem busca no meio do turno quer o texto, não a viagem. Tocar num resultado abre o card COMPLETO na hora — o mesmo do livro, com as três formas de conjuração, o dano, o cântico e o que a Recitação Perfeita paga. O link pro lugar de origem continua embaixo, pra quem quer o contexto em volta.",
          "É o mesmo componente que o /livro desenha, e não uma cópia: duas telas mostrando a mesma magia de dois jeitos diferentes é a única coisa pior que não ter busca nenhuma.",
          "O trecho mostrado é a FRASE onde a palavra está, com ela pintada — não os primeiros 140 caracteres do efeito, que quase nunca são a parte que responde.",
          "Filtros por tipo com contagem, endereço compartilhável (/busca?q=peçonha), e tudo isso funciona sem internet, porque o índice sai dos mesmos dados que o site já carrega.",
        ],
      },
    ],
  },
  {
    version: "0.1.16",
    date: "2026-09-09",
    title: "O Dedo Alcança",
    sections: [
      {
        heading: "O mapa de árvores era intocável no celular",
        items: [
          "Medido a 414px de largura, o Destiny Board abria com os nós entre 6 e 14 pixels — onze deles empatados em 6×6. O mínimo do WCAG 2.2 (critério 2.5.8) é 24. Era um quarto disso, na tela principal de progressão, num projeto cuja primeira regra é mobile-first.",
          "A causa não era defeito: era o zoom de \"caber tudo\" cumprindo o que promete. Num monitor, caber tudo dá nós grandes; num celular, caber tudo espreme dezenove árvores em 414px, e o resultado aritmético disso é um nó de 6px.",
          "O mapa agora tem um piso: ele nunca abre num zoom em que a árvore não dê pra tocar. No celular isso significa que ele deixa de caber inteiro na tela — perde-se a visão geral e ganha-se um mapa que se usa arrastando, que é como todo mapa funciona num celular. No monitor nada muda: lá o zoom de caber já passa do piso com folga.",
          "Os nós de rank, que são menores de propósito, ganharam área de toque invisível maior que o desenho — o alvo cresce, o mapa continua com a mesma cara.",
        ],
      },
      {
        heading: "E os alvos pequenos do resto do site",
        items: [
          "Os dez links do rodapé tinham 18px de altura, e o rodapé está em TODAS as rotas — eram a maior parte dos alvos pequenos do site inteiro.",
          "Também passaram do mínimo: os campos numéricos da ficha, o seletor de Rank de Guilda, o seletor de árvore do mapa e os dois atalhos do fim da landing.",
          "Nove das dez rotas agora estão em ZERO alvos abaixo de 24px. Os oito que sobram no /livro são links dentro de frase, que o próprio critério isenta — aumentar a caixa deles quebraria a linha do parágrafo pra resolver um problema que não existe.",
          "O check:mobile passou a medir o alvo de verdade: a união do controle com os filhos dele. Medindo só a caixa do botão, os 40 nós do mapa continuariam sendo contados como pequenos DEPOIS de corrigidos — a contagem acusaria justamente o remédio.",
        ],
      },
    ],
  },
  {
    version: "0.1.15",
    date: "2026-09-09",
    title: "O Porão Sem Sinal",
    sections: [
      {
        heading: "O site funciona sem internet",
        items: [
          "O O-QUE-FALTA.md listava isso como \"a maior pendência funcional\", e o caso de uso estava escrito com todas as letras: mesa física num porão sem sinal. As fichas já viviam no localStorage — o que morria sem rede era o SITE. De nada adianta o personagem estar salvo no aparelho se a página que o desenha precisa de um servidor pra chegar.",
          "Um service worker (public/sw.js) guarda as 15 rotas na primeira visita, junto com o JavaScript, o CSS e as imagens que cada uma carrega. Depois disso o site abre com o avião ligado, em F5 ou navegando de link em link.",
          "Não é promessa: npm run check:offline sobe um servidor, espera o worker instalar, MATA o servidor e abre as 15 rotas uma a uma. Modo offline de DevTools não serviria — ele se aplica à aba, e as buscas do service worker saem de outro lugar, então dava pra \"estar offline\" e o worker continuar falando com o servidor. Porta fechada não tem essa ambiguidade.",
          "A exportação em PDF é a única coisa que continua precisando de servidor — o PDF é montado pelo Typst do lado de lá. Ela está explicitamente FORA do cache: guardar essa resposta seria arriscar devolver o PDF de uma ficha pra outra.",
        ],
      },
      {
        heading: "Instalável na tela inicial",
        items: [
          "Com manifesto e ícones próprios, o site instala como app: abre sem barra de endereço, com ícone na gaveta e splash própria. Segurar o ícone abre três atalhos — Ficha, Dados e Iniciativa —, que são as três coisas que se faz com o celular na mão NO MEIO da sessão.",
          "O atalho dos dados abre a rolagem já aberta. Era o único dos três que precisava de código, e sem ele o atalho \"Rolar dados\" pararia na ficha, exigindo mais um toque justamente de quem pediu um atalho pra não dar toques.",
          "Os ícones saem do mesmo brasão do favicon, pelo mesmo script (scripts/gerar-favicon.mjs) — inclusive um mascarado, com margem maior, porque o Android RECORTA o ícone na forma do launcher e as asas do brasão ficavam bem onde passa a faca.",
        ],
      },
      {
        heading: "O que o site diz quando o sinal cai",
        items: [
          "Uma faixa abaixo do menu avisa que a rede caiu e que ficha e site continuam funcionando. Ela fica no fluxo da página, e não flutuando: a primeira versão era uma tarja no rodapé e ela cobria o botão de rolar dados — o canto de baixo já tinha dois donos.",
          "O erro do PDF parou de dar conselho errado. Ele dizia \"tente de novo em instantes\" para qualquer falha, inclusive para quem está sem sinal, onde tentar de novo não resolve nada. Sem rede ele agora explica que o PDF sai quando o sinal voltar, e lembra que Baixar ficha funciona offline.",
          "Rota que não estava em cache cai numa página /offline que diz o que aconteceu — em vez da tela de dinossauro do navegador, que não distingue \"esta rota não foi guardada\" de \"o site saiu do ar\", e não conta que as fichas continuam salvas.",
          "Quando uma versão nova baixa, o site oferece Atualizar em vez de trocar sozinho: um worker que assume no meio da sessão troca os chunks embaixo de uma página aberta, e o próximo clique dá 404.",
        ],
      },
    ],
  },
  {
    version: "0.1.14",
    date: "2026-09-05",
    title: "O Que a Mesa Devolveu",
    sections: [
      {
        heading: "O Tático executa a própria ordem",
        items: [
          "O O-QUE-FALTA.md já avisava que a Ordem de Tiro tinha sido inventada pra que o Tático tivesse o que medir, e que, se não fosse divertida na mesa, o certo era TROCÁ-LA, não ajustá-la. Jogaram de Explorador e o veredito foi esse: ele não dá dano nenhum. E não dava mesmo — o bônus somava no ataque de um ALIADO, três pontos e meio no 1º patamar, e só se outra pessoa escolhesse o alvo que você apontou.",
          "O alvo agora fica APONTADO (a condição entrou no Glossário do Cap. 4), e o bônus de +1d6 por patamar vale para o primeiro ataque que acertar — seu ou de um aliado.",
          "Contra o alvo Apontado, o Tático soma o Bônus de Rank no acerto e no dano dos próprios ataques com arco curto ou lança. É a única vez em que ele bate como quem treinou pra isso, e a razão é a mesma da árvore inteira: ele não bate melhor, ele bate onde ele mesmo mandou bater.",
          "A ordem não se perde: se ninguém acertar até o seu próximo turno, aponte o mesmo alvo de novo e o bônus sobe outro 1d6, até o dobro do seu patamar. O Tático sozinho não fica parado — ele carrega.",
          "Talento novo de 1º patamar, Voz que Corrige: uma Reação, quando um ataque contra o Apontado errar, quem errou repete a rolagem. Uma vez por turno, e vale para os ataques dele também.",
          "\"Não pode fazer nada sozinho\" continua sendo a identidade da árvore, e é uma boa identidade. \"Não pode fazer nada\" não era.",
        ],
      },
      {
        heading: "Barreira e Proteção volta a proteger",
        items: [
          "O nome prometia duas coisas e a escola entregava uma: contra um conjurador ela é o melhor kit do livro, contra um urso era um mago de 1d6 de PV assistindo. E nenhuma barreira do livro dizia quantos PV tinha — Recinto declarava 120, Redoma 60, e o Círculo Menor, o Domo e o Anteparo não declaravam nada, enquanto o talento Trama Densa prometia \"o dobro de PV\" de um número que não existia.",
          "Toda barreira sua tem 20 PV por patamar (20 no 1º, 120 no 6º), e a magia que declarar os próprios PV usa os dela. Trama Densa finalmente dobra alguma coisa.",
          "A sua barreira nunca vale contra VOCÊ. Selado e Estagnação atingiam o próprio conjurador: um Círculo Menor no 1º patamar era uma armadilha para o grupo inteiro, aliados incluídos.",
          "Quem está dentro tem Cobertura contra ataques à distância vindos de fora.",
          "CASCA (Principiante, 2 PM, 1 Ação): PV Temporários de 2d8 + BC num aliado, mais o Bônus de Rank em resistências contra magia enquanto durar. É o que a escola faz num turno em que ninguém conjurou nada — que era metade dos turnos.",
          "MURALHA (Intermediário, 4 PM): 12 metros de parede com os PV das suas barreiras, barrando passagem e projéteis nos dois sentidos. É a resposta ao inimigo que não conjura, e é honesta: dá pra derrubar no braço.",
          "Anteparo passa a parar flecha, virote e pedra, e não só magia.",
          "A fraqueza declarada mudou de \"quase não faz nada contra o Corpo\" para o que ela realmente é: contra o pilar do Corpo você não proíbe, você ATRASA — o Deus da Espada atravessa a sua lei gastando turnos, e turnos é tudo o que você tira dele.",
        ],
      },
      {
        heading: "A escola barata ganhou o que fazer no turno",
        items: [
          "O rework de 2026-09-03 tirou dano e imunidades da Desintoxicação e devolveu o valor em preço. O que ele não resolveu foi o buraco do 1º ao 3º patamar: fora de uma cena de veneno, o purificador não tinha uma única linha pra gastar o turno.",
          "PEÇONHA (Principiante, 2 PM, 1 Ação, 18m): 2d6 de veneno e Envenenado até o fim do próximo turno, com teste de Vigor. Quem entende de veneno sabe fazer veneno — a Maestria de Rei só admite em voz alta o que este feitiço já faz pequeno.",
          "Purgar em 1 Ação, e não 2. A magia que justifica a escola existir gastava dois terços de um turno pra desfazer o que o Mestre fez ontem.",
          "Paladar passa a cobrir o grupo: aliados a 3 metros somam o seu Bônus de Rank em resistências contra veneno, doença e maldição.",
          "Sangria custa 3d6, não 4d6. A Mecânica Central da árvore já dizia 3d6 desde o rework; a magia cobrava 4d6. O check:texto não pega esse tipo de divergência — ele compara a prosa de uma habilidade com os campos DELA, nunca com o texto da árvore que a contém.",
        ],
      },
      {
        heading: "O Calor tem quatro regras, e não vinte",
        items: [
          "O pedido não foi \"está fraco\": foi \"está confuso, e leve em conta que ele tem que pegar outras coisas\". Cada patamar do Punho do Fogo reescrevia o recurso do zero — teto numa escada torta (5, 8, 12, 16, 20, 25), decaimento mudando de regra no 2º patamar, estouro com três nomes e três efeitos (Brasa Viva, Fúria Vulcânica, Erupção Contínua) e cada técnica cobrando um número próprio de Calor: 1, 2, 3, 4, 5, 6, 8, 10 por turno.",
          "GANHAR: 1 de Calor por ataque desarmado que acerta.",
          "TETO: 5 por patamar (5/10/15/20/25/30). Uma conta, não uma tabela.",
          "PERDER: 1 no fim de todo turno em que você não acertou ninguém. Nunca a barra inteira — a regra antiga punia o azar de errar um ataque com o recurso todo.",
          "GASTAR: toda técnica tem uma SOBRECARGA, e toda Sobrecarga custa 3 de Calor, em qualquer patamar. As únicas exceções são as detonações declaradas (Soco de Nova, Erupção do Soberano, Colapso Solar, Manto de Supernova), que gastam a barra inteira porque é isso que elas são.",
          "O estouro virou um nome só: Brasa Viva, desde o 1º patamar, melhorando em cada um deles. E ela para de cobrar o 1d6 em você no Santo, porque o Santo é imune a fogo e cobrar dano ígneo de um imune era a contradição mais visível da árvore.",
          "O custo virou um só: PM ou PT, à sua escolha, nunca os dois. As técnicas cobravam as duas reservas no mesmo golpe (5 PM + 2 PT na Lótus Carmesim) de um personagem que já tinha pagado rank Intermediário em duas árvores pra híbrida sequer existir.",
          "De quebra, a árvore parou de falar outra língua: \"dano halved\", \"CD 20\", \"Força 30\" e \"Petrificação leve\" viraram metade do dano, CD 8 + BC, e uma aflição de rank Santo — que é como o resto do livro escreve essas quatro coisas.",
        ],
      },
    ],
  },
  {
    version: "0.1.13",
    date: "2026-09-05",
    title: "O Covil Ganhou Gavetas",
    sections: [
      {
        heading: "O covil ganhou gavetas",
        items: [
          "/encontros nasceu como uma lista de cartões sempre abertos. Isso funciona até a terceira criatura; com trinta montadas — que é o uso real depois de algumas sessões — a tela vira uma parede de formulário em que \"onde está o chefe do arco 2?\" só se responde rolando a página inteira.",
          "PASTAS: criar, renomear, reordenar, recolher, e marcar a gaveta inteira pro encontro num clique — uma pasta vira um encontro pronto. O recolhido fica SALVO: arrumar dez pastas uma vez e perder a arrumação no F5 seria pior que não ter pasta nenhuma.",
          "CARTÃO RECOLHIDO: fechado, ele é uma linha com o retrato, o nome e os números com que se decide \"é esta?\" — quantas vêm, patamar, papel, PV, CA, dano por turno. O formulário inteiro abre com um toque, e a tela só abre sozinha o que você acabou de criar, importar ou duplicar.",
          "BUSCA, que atravessa as gavetas fechadas — quando você já sabe o nome, navegar por pasta é o caminho longo. Ela varre nome, anotação de perigo, papel e o texto das Ações: \"quem era o que tinha a mordida venenosa?\" é uma pergunta tão comum quanto o nome próprio da criatura.",
          "A gaveta é sua: nome, EMOJI e uma de seis CORES. Numa lista de dez pastas, 🐉 e 🏚️ se acham de relance de um jeito que \"Chefes do arco 2\" e \"Taverna\" não — o olho lê a figura antes de ler a palavra. A cor é uma lista fechada, e não um seletor livre, porque ela precisa funcionar nos dois temas do site.",
          "A pasta pode ser criada com o covil VAZIO. Na primeira versão o botão \"Nova pasta\" morava dentro do galho que só existia depois da primeira criatura — e planejar a sessão começa exatamente pelo contrário: abrir \"a emboscada da estrada\" e \"os chefes do arco 2\" antes de ter o que pôr dentro.",
          "O QUE CHEGA APARECE: criar, duplicar, importar de arquivo ou aceitar um link abre o cartão, expande a gaveta em que ele caiu, limpa a busca que o esconderia e rola até ele, com um realce de alguns segundos. Sem isso, importar tinha virado um clique que não parecia fazer nada — desde que o cartão passou a nascer recolhido, o recém-chegado entrava fechado no fim de uma lista longa, e pelo link era pior ainda, porque a confirmação acontece em outra rota.",
          "A PASTA INTEIRA NUM ARQUIVO: .mtpasta leva a gaveta com nome, cor, emoji e todas as criaturas dentro, no mesmo MTP1+gzip dos outros dois formatos. O .mtcriatura resolvia \"te mando este chefe\"; não resolvia \"a emboscada da estrada são estes cinco bichos, e eu quero levar isso pra outra máquina\" — nem o backup, que é o que realmente falta a um bestiário que mora só no localStorage de um navegador. A importação é um botão só: pasta, criatura ou o .json cru de qualquer um dos dois, detectados pelo conteúdo.",
          "Apagar a pasta NUNCA apaga o que está dentro: as criaturas voltam pra \"Fora das pastas\", e a confirmação diz \"Só a pasta?\" pra deixar isso explícito. Um Mestre que reorganiza trinta criaturas no meio da sessão não pode perder metade do bestiário por clicar na lixeira errada.",
          "Mover é um seletor no cartão, e não arrastar-e-soltar. A tela é mobile-first: arrastar um cartão numa lista que rola é a interação que mais falha no dedo, e é a única que não tem alternativa por teclado.",
          "O bestiário salvo sobe pra version 4 e entra INTEIRO em \"Fora das pastas\". Inventar gavetas por quem já tem trinta criaturas montadas daria uma arrumação que ninguém pediu — o critério do que era \"os goblins daquela estrada\" é do Mestre.",
        ],
      },
      {
        heading: "A ficha do jogador, do lado errado da iniciativa",
        items: [
          "O rival que persegue o grupo há três sessões, o cavaleiro que virou inimigo, o PJ de quem faltou hoje, o duelo entre dois jogadores — todos são a mesma coisa na mesa: um personagem construído com as regras inteiras, jogando CONTRA o grupo. O Mestre tinha duas saídas ruins: montar uma criatura do zero e chutar os números, ou desistir e narrar. As duas jogam fora uma ficha que já existe, já está paga em PA e já tem as técnicas escritas.",
          "/encontros ganhou \"Ou traga uma ficha do roster\", ao lado de \"Nova criatura\". PV, CA, Bônus de Ataque, CD, retrato e as técnicas de dano vêm da ficha, pelo MESMO derivador que a simulação usa do lado dos heróis — é isso que garante que o rival aguente na mesa o que aguentaria como personagem.",
          "É uma CÓPIA, e não um vínculo: mexer no chefe não toca na ficha do jogador, e o jogador subir de patamar não desfaz os ajustes que você fez no chefe. Um vínculo vivo perderia o ajuste do Mestre toda vez que o dono da ficha comprasse uma habilidade.",
          "O ataque comum vem sempre, e vem primeiro: nenhuma árvore declara \"Atacar com Arma\" como habilidade, porque é regra do Cap. 4 — e sem ele o guerreiro convertido parecia não saber bater, o mesmo erro que o check:arvores cometeu em 0.1.11. Quem não tem árvore do Corpo bate com \"arma simples\", sem Bônus de Rank no golpe (Cap. 3): somar o BC cheio daria ao mago convertido o braço de um espadachim.",
          "A fórmula segue a CARTA, não o motor. O que está entre parênteses é condicional e não soma (\"12d12 de frio (24d12 contra alvo Molhado)\" é 12d12, não 36d12); \"+2 Dados de Arma\" é contagem de dados e não \"+2 de dano\"; e o BC entra onde o livro escreve \"+ BC\", e não em toda ação como a simulação simplifica. Quem lê o cartão na mesa tem a carta da habilidade ao lado. O texto original do livro vai junto, na nota de cada Ação.",
          "Ela entra \"fora do molde do Apêndice G\", e isso é a informação certa: uma ficha de personagem é exatamente o caso em que os números NÃO vêm da tabela. Das técnicas de dano vêm as oito mais fortes — a simulação só gasta 3 Ações por turno, e da nona pra baixo nada seria rolado.",
        ],
      },
      {
        heading: "A criatura saiu do navegador",
        items: [
          "Até aqui a criatura vivia só no localStorage de quem a montou. Isso combinava com ela ser \"rascunho de sessão\" enquanto era sete números soltos; desde que ganhou Ações escritas, ela é conteúdo que vale levar de uma campanha pra outra.",
          "Arquivo e link: .mtcriatura (marca MTC1) e um link com a criatura dentro. O par gzip+base64url saiu de fichaArquivo.ts/fichaLink.ts pra compactacao.ts e agora serve aos dois, sem duplicar. O PDF ficou de fora de propósito: o payload do Typst é amarrado a árvore e magia de personagem, e estendê-lo pra criatura seria um Apêndice inteiro de template novo.",
          "Retrato, com a mesma infra de imagem da ficha — reduzida no navegador, nunca sai dele. De quebra, um defeito que ninguém tinha visto: \"Recalibrar\" apagaria a foto junto dos números do molde, do mesmo jeito que já preservava o perigo e as Ações.",
          "Condições estruturadas: Preso, Caído, Molhado e veneno saíram da anotação de texto e viraram estado do motor. Preso e Caído dão Vantagem a quem ataca o alvo, e as três tiram a Vantagem de quem já está com uma (Cap. 4, §7) — dos dois lados da mesa. As criaturas prontas do Apêndice G que já citavam uma dessas condições na prosa ganharam o campo correspondente.",
          "O chefe reage: 1 Reação/ação lendária fora do turno normal — a outra metade da economia de ação, que até aqui só tinha a rodada extra do chefe solo.",
          "Os números do playtest não mudaram com nada disso: as condições novas só entram em jogo quando uma ação as declara, e nenhuma das dez builds de referência faz isso.",
        ],
      },
      {
        heading: "Calor do Punho do Fogo virou número",
        items: [
          "Calor só existia na prosa da árvore (\"Calor máximo sobe para 8/12/16/20/25\") — nenhum campo, nenhum \"atual\" editável, nada que a ficha somasse. Agora ele segue o mesmo padrão de PV/PM/PT/PP: teto por patamar, contador com override na ficha, e o contador só aparece pra quem tem Punho do Fogo desbloqueado.",
          "O teto é FIXO por patamar, não cumulativo: o texto sempre disse \"sobe para\", nunca \"soma\". Superaquecimento, Brasa Viva, Erupção Contínua e Combustão Reativa continuam fora do motor — são gatilhos condicionais de mesa, não deste recurso. O trabalho aqui é fazer o número existir e ser rastreável.",
        ],
      },
      {
        heading: "A foto entra na criação",
        items: [
          "As três vias (Manual, Roleta e Entrevista) terminavam sem nunca oferecer a foto de perfil — a pessoa só descobria que dava pra pôr uma depois, já em /ficha. A tela final de cada via é exatamente o momento em que raça e antecedente já estão fechados e a pessoa está imaginando a cara do personagem, então é ali que a foto entra: sempre opcional, com o mesmo brasão da raça como alternativa.",
        ],
      },
      {
        heading: "Os dez avisos do check:texto, e um bug de cura",
        items: [
          "Nove habilidades tinham dado escrito na prosa e nenhum campo onde guardá-lo. damage.condicional, damage.porTurno e healing.normal são esse lugar — bônus condicional, dano por turno de condição/terreno, e a cura de Julgamento e Luz Absoluta. Barreira e Proteção sobe pra 1d8+4 no Rei, pra quebrar um PV parado por três patamares.",
          "De quebra, um bug real que só um campo apartado revelaria: o filtro de cura do combatSim.ts escaneava damage.normal e effect juntos, e a cura descrita no effect de Julgamento e Luz Absoluta derrubava o dano real das duas na simulação de combate inteira. Agora ele olha só damage.normal.",
        ],
      },
      {
        heading: "Suishin e Escudos: dois ajustes da leitura das quatro árvores restantes",
        items: [
          "\"Nome de Reidar\" era o único talento do livro sem efeito jogável nenhum. Ganha um favor pontual por sessão, no molde de \"Homem Dentro\" do Ladino.",
          "\"O Muro Final\" anunciava o próprio risco (\"você provavelmente morre\") e tinha esse risco anulado de graça pela Maestria do Imperador (\"Enquanto Eu Estiver de Pé\"). A cláusula nova fecha essa segunda vida grátis; a versão Soberana continua com a segurança dela intacta.",
        ],
      },
    ],
  },
  {
    version: "0.1.12",
    date: "2026-09-04",
    title: "O Que a R\u00e9gua N\u00e3o Media",
    sections: [
      {
        heading: "O Corpo virou medi\u00e7\u00e3o, e a Magia estava certa desde sempre",
        items: [
          "O check:arvores de 0.1.11 acusava 11 c\u00e9lulas e dizia, honestamente, que n\u00e3o confiava em seis delas: as do Corpo saíam marcadas como PISO porque o Dado de Arma \u2014 o golpe base de toda \u00e1rvore marcial \u2014 n\u00e3o entrava na conta. As onze ca\u00edram para zero, e nenhuma delas caiu por um nerf.",
          "As seis do Corpo eram o MEDIDOR. Faltava ler as f\u00f3rmulas em portugu\u00eas do cat\u00e1logo (\"arma normal\" invoca dado + atributo + B\u00f4nus de Rank; \"rolado N vezes\" invoca s\u00f3 os dados), faltava declarar qual arma o auditor assume por \u00e1rvore, e faltava o \u00f3bvio: o ATAQUE COMUM. Nenhuma \u00e1rvore declara \"Atacar com Arma (1 A\u00e7\u00e3o)\" como habilidade, porque \u00e9 regra do Cap. 4 \u2014 ent\u00e3o o medidor lia o guerreiro como algu\u00e9m que s\u00f3 sabe usar t\u00e9cnica. Tr\u00eas ataques comuns j\u00e1 passam das seis colunas acusadas.",
          "Entrou tamb\u00e9m a QUARTA A\u00c7\u00c3O de Espada (do Avan\u00e7ado), Norte, Lutador e Arquearia (do Imperador). O Ap\u00eandice C avisa que j\u00e1 conta com ela na coluna da Espada; medir com tr\u00eas era comparar contra uma r\u00e9gua calibrada com quatro.",
          "As cinco da Magia eram o medidor lendo a metade errada da tabela. O pr\u00f3prio Ap\u00eandice C avisa: \"Magia n\u00e3o est\u00e1 amortizada pelas A\u00e7\u00f5es \u2014 o Sol Menor aparece como ~130, mas entrega ~65 por turno.\" A coluna de Magia \u00e9 o dano CHEIO da maior magia, e o script dividia antes de comparar. As cinco c\u00e9lulas acusadas eram exatamente as cinco escolas cuja maior magia custa 4, 5 ou 6 A\u00e7\u00f5es \u2014 e todas caem dentro de 3% a 12% do dano cheio. A r\u00e9gua estava certa, as \u00e1rvores estavam certas, e o medidor estava errado.",
        ],
      },
      {
        heading: "Um script que l\u00ea texto",
        items: [
          "A d\u00edvida da auditoria linha a linha carregava uma ressalva: \"leitura manual ainda \u00e9 o que pega texto de habilidade errado, e o script n\u00e3o l\u00ea texto\". Agora existe check:texto, e ele l\u00ea as 592 habilidades e talentos conferindo a prosa contra os campos. Ele n\u00e3o substitui a leitura \u2014 faz o que a leitura faz PIOR: quem l\u00ea 400 cartas perde a que diz \"2 A\u00e7\u00f5es\" com actions: 1 na terceira hora.",
          "Duas evolu\u00e7\u00f5es do filhote de Esp\u00edritos e Feras eram INVEND\u00c1VEIS: exigiam um id de talento que n\u00e3o existe, ent\u00e3o a compra nunca liberava, em sil\u00eancio, desde que foram escritas.",
          "Passo de Vento abria com \"1 A\u00e7\u00e3o:\" e cobrava 2 pela tabela do Cap. 2. Tr\u00eas Rea\u00e7\u00f5es n\u00e3o diziam na carta que eram Rea\u00e7\u00e3o. Duas t\u00e9cnicas do Norte prometiam per\u00edcia e n\u00e3o havia onde gravar \u2014 virou o campo grantsSkills, com motor e testes junto. E o Punho do Fogo tinha 25 textos com markdown cru: a mesa lia os asteriscos, porque nada no projeto renderiza negrito.",
          "Duas regras do pr\u00f3prio script nasceram erradas e foram corrigidas antes de virar relat\u00f3rio. A de alcance acusou dez falsos positivos de dez (\"avance 6m\", \"empurrado 3m\" \u2014 deslocamento, n\u00e3o alcance), e a de PV acusou 21 patamares em 19 \u00e1rvores por repetir o dado do anterior, quando repetir por dois patamares \u00e9 a cad\u00eancia normal do livro. Vinte e um defeitos na primeira execu\u00e7\u00e3o n\u00e3o \u00e9 um livro quebrado; \u00e9 a r\u00e9gua errada.",
        ],
      },
      {
        heading: "A Dist\u00e2ncia Roubada, medida",
        items: [
          "O teto \u00e9 18 metros, atingido no 5\u00ba patamar, e custa 1 das 3 A\u00e7\u00f5es em todo patamar. A pr\u00f3pria \u00e1rvore j\u00e1 bate mais longe sem a mec\u00e2nica: Arremesso Cortante faz 18m no 1\u00ba patamar e Golpe que N\u00e3o Tem Origem faz 27m no 5\u00ba.",
          "O que a mec\u00e2nica d\u00e1 de \u00fanico \u00e9 o ataque continuar sendo CORPO A CORPO, o que carrega a Vantagem de Estilo junto. Ent\u00e3o a pergunta pra mesa n\u00e3o \u00e9 \"18 metros \u00e9 demais\": \u00e9 \"o Vendaval alguma vez apanha?\". Se o inimigo nunca revida, o custo declarado da \u00e1rvore nunca \u00e9 cobrado. Conte, numa sess\u00e3o, os ataques corpo a corpo que ACERTARAM o Vendaval, e compare com o outro da linha de frente.",
          "Uma ambiguidade que a mesa encontraria no primeiro combate: a Maestria de Intermedi\u00e1rio diz que movimento de Rea\u00e7\u00e3o conta para a Dist\u00e2ncia Roubada, mas Rea\u00e7\u00e3o acontece no turno do inimigo e a regra base zera a dist\u00e2ncia no fim do turno \u2014 do jeito que estava escrito, a Maestria n\u00e3o fazia nada. Essa parcela passa a ser a \u00fanica que sobrevive \u00e0 virada de turno.",
        ],
      },
      {
        heading: "Foto de perfil e capa nas fichas",
        items: [
          "A imagem mora DENTRO da ficha, em base64. Guardar s\u00f3 uma URL faria \"exporte o JSON pra levar pra outra m\u00e1quina\" virar mentira: a ficha chegaria do outro lado apontando pra um arquivo que n\u00e3o existe l\u00e1.",
          "Reduzir no cliente \u00e9 obrigat\u00f3rio e o teto \u00e9 duro: a imagem \u00e9 redesenhada num canvas dentro do lado m\u00e1ximo (512px pra foto, 1200px pra capa) e comprimida em degraus de qualidade AT\u00c9 caber num teto de bytes. Se n\u00e3o couber nem no \u00faltimo degrau, ela \u00e9 recusada com uma frase que diz o que fazer \u2014 em vez de estourar a cota do localStorage depois, levando junto as fichas j\u00e1 salvas.",
          "O LINK de compartilhar n\u00e3o leva as imagens. JPEG j\u00e1 \u00e9 dado comprimido e o gzip do link n\u00e3o tira quase nada dele: uma foto de 60 KB viraria ~80 000 caracteres de URL, e navegador, Discord e WhatsApp cortam muito antes disso. N\u00e3o daria um link grande: daria um link quebrado, que parece pronto ao ser copiado. O arquivo .mtficha leva as duas, e a ficha avisa isso na tela.",
          "Imagem vinda de fora (JSON importado, link de terceiro) s\u00f3 \u00e9 aceita como data:image/ dentro do teto. Um retrato apontando pra https:// faria o navegador de quem abre a ficha entregar o IP dele a um servidor que ele nunca escolheu.",
          "O PDF imprime o retrato \u2014 a decis\u00e3o que estava em aberto. A rota do PDF j\u00e1 recebe a ficha inteira pra compilar o Typst, ent\u00e3o a foto n\u00e3o abre um caminho novo; e o PDF existe pra ser levado impresso pra mesa, que \u00e9 onde um retrato vale mais.",
          "O /personagens ganhou a foto no card (com o bras\u00e3o da ra\u00e7a como alternativa) e barras de PV/PM com o n\u00famero junto. Barra sozinha comunica propor\u00e7\u00e3o e esconde escala \u2014 \"meio cheia\" \u00e9 a mesma imagem com 6 PV e com 60, e a decis\u00e3o de mesa \u00e9 sobre a escala.",
        ],
      },
      {
        heading: "Acessibilidade que d\u00e1 pra medir",
        items: [
          "Tr\u00eas checagens novas, todas num Chrome de verdade. A primeira li\u00e7\u00e3o foi essa: os primeiros prints desta s\u00e9rie sa\u00edram com perfil de cor aplicado, e um bot\u00e3o wine-600 (#4a0e2e) apareceu como #7d505e \u2014 o suficiente pra \"achar\" um defeito de contraste que n\u00e3o existia.",
          "check:contraste mede as 9 rotas nos 2 temas contra o WCAG AA. Achou 6 defeitos reais, todos corrigidos \u2014 e o mais caro foi opacity-70 usado pra apagar item bloqueado na Loja: opacidade puxa TEXTO e fundo juntos na dire\u00e7\u00e3o do pergaminho, e derrubava 128 textos de 5,6:1 pra 3,0:1. O apagamento virou recuo de cor e satura\u00e7\u00e3o: de longe a leitura \u00e9 a mesma, de perto ela existe.",
          "check:mobile imp\u00f5e a largura por dentro do navegador, que \u00e9 o ponto: recortar uma janela de 500px em 360 mostra o que caberia em 360, n\u00e3o o que o CSS FAZ em 360. Achou dois transbordos, os dois pela mesma armadilha de flexbox (item de flex tem min-width: auto e n\u00e3o encolhe abaixo do conte\u00fado) \u2014 e um deles quebrava em 360px, a largura de metade dos Androids.",
          "check:a11y achou o que um leitor de tela encontra: /ficha era a \u00fanica rota sem h1 (o nome do personagem \u00e9 um input, e input n\u00e3o \u00e9 cabe\u00e7alho), /livro tinha oito h1 porque cada cap\u00edtulo abria um, cinco campos sem r\u00f3tulo associado, e o input de arquivo escondido do importador, que o Tab visitava.",
          "O tamanho da letra ficou ajust\u00e1vel \u2014 e o caminho de verdade n\u00e3o foi o bot\u00e3o: foram as 68 legendas escritas em pixel cravado, que n\u00e3o obedecem ao tamanho de fonte do navegador. Quem aumenta a letra nas configura\u00e7\u00f5es do celular via todo o resto crescer e justamente as legendas ficarem do mesmo tamanho. Em rem elas crescem junto.",
        ],
      },
      {
        heading: "O Ap\u00eandice C ganhou tr\u00eas colunas, e duas \u00e1rvores ganharam dano",
        items: [
          "A tabela tinha UMA coluna chamada Utilidade para as tr\u00eas \u00e1rvores da categoria, e a raz\u00e3o era constrangedora: duas delas n\u00e3o tinham dano nenhum pra medir. S\u00f3 o Ladino tinha, e ainda assim escondido — o Dano Furtivo dele vive na Maestria de 1\u00ba patamar e n\u00e3o num campo de dano, ent\u00e3o nenhuma conta do projeto o enxergava. Uma coluna para tr\u00eas \u00e1rvores diferentes \u00e9 uma coluna que n\u00e3o descreve nenhuma delas.",
          "Separar exigia ter o que medir, e o molde ja existia dentro da propria categoria — um numero que escala por patamar, declarado na Maestria de 1\u00ba. DISSON\u00c2NCIA (Bardo): uma vez por turno, ao usar uma habilidade da \u00e1rvore, cada hostil que te OU\u00c7A sofre 1d4 por patamar. ORDEM DE TIRO (T\u00e1tico): uma vez por turno, sem gastar A\u00e7\u00e3o, aponte um alvo e o primeiro ataque de ALIADO que acertar causa +1d6 por patamar — \u00e9 a \u00fanica coluna do livro que n\u00e3o sai da arma de quem a l\u00ea. O Dano Furtivo do Ladino j\u00e1 existia; o que mudou \u00e9 que agora ele \u00e9 medido.",
          "A ordem entre as tr\u00eas colunas n\u00e3o \u00e9 acidente: o Ladino \u00e9 o maior porque a \u00e1rvore dele diz em texto que \u00e9 \"a \u00fanica \u00e1rvore de Utilidade com dano de verdade\"; o Bardo \u00e9 o menor porque o dano dele \u00e9 efeito colateral de uma habilidade social e cobra \u00e1rea em troca; o T\u00e1tico fica no meio. Nenhuma \u00e1rvore de Utilidade recebe degraus de Dado de Arma (Cap. 3), e \u00e9 por isso que elas ficam pra tr\u00e1s sem precisar de nenhuma regra que as puna.",
          "Tamb\u00e9m subiram: a Desintoxica\u00e7\u00e3o pouco (Sangria 3d6→4d6, Corros\u00e3o 3d6→5d6, Sopro Podre 6d8→8d8 — Sangria e Corros\u00e3o estavam empatadas em 11 apesar de tr\u00eas ranks de dist\u00e2ncia), e o Escudos de vez (Golpe de Escudo 1d8→2d8, Soberano 2d8→3d8). A coluna do Escudos vai de ~7–18 para ~10–27 e CONTINUA sendo a menor do livro, que \u00e9 o ponto: o Escudeiro bate, mas bater n\u00e3o \u00e9 o trabalho dele.",
        ],
      },
      {
        heading: "O Invocador estava cobrando PA pra ligar a \u00e1rvore",
        items: [
          "A Maestria de 1\u00ba patamar ensinava a fechar Pactos e a desenhar c\u00edrculos — e n\u00e3o invocava. Invocar era uma habilidade comprada. Na pr\u00e1tica, um invocador que gastasse o PA todo em Pactos ficava com um caderno de acordos e nenhuma forma de chamar ningu\u00e9m. Invocar virou a MAESTRIA: c\u00edrculo preparado (10 minutos, fora de combate) e 3 PM, sem PA nenhum. Piso de escola n\u00e3o se compra.",
          "O antigo Chamado virou o CHAMADO DE EMERG\u00caNCIA: 3 A\u00e7\u00f5es e 6 PM, sem c\u00edrculo, no meio da luta — e o invocado chega com metade dos PV e metade do dano, porque foi chamado \u00e0s pressas. As 3 A\u00e7\u00f5es s\u00e3o o turno inteiro de prop\u00f3sito: se ela custasse o padr\u00e3o do rank, o c\u00edrculo de 10 minutos n\u00e3o teria fun\u00e7\u00e3o e a fraqueza declarada da escola deixaria de existir.",
          "Dois talentos novos destravam as duas metades do pre\u00e7o, separadamente: C\u00edrculo Improvisado baixa para 3 PM, e Pacto Firmado tira a penalidade. Um terceiro, ORDEM PARTILHADA, deixa voc\u00ea ceder uma das suas 3 A\u00e7\u00f5es a um invocado sem custo de PM — \u00e9 a \u00fanica forma de um invocado agir duas vezes no mesmo turno, e o pre\u00e7o \u00e9 voc\u00ea agir uma vez a menos.",
          "A regra que faltava est\u00e1 escrita agora com todas as letras: um invocado age com 1 A\u00c7\u00c3O e 1 REA\u00c7\u00c3O por turno — as dele, n\u00e3o as suas tr\u00eas. Ele n\u00e3o \u00e9 um segundo personagem seu; \u00e9 um aliado que obedece.",
          "O 1\u00ba patamar ganhou tr\u00eas Pactos novos, mais fortes que o Filhote e claramente abaixo dos de Intermedi\u00e1rio: C\u00e3o de Ca\u00e7a (mordida 2d6, faro, pode Derrubar), Corvo Mensageiro (bico 1d6, voo, entrega recado e empresta a linha de vis\u00e3o) e Fogo-F\u00e1tuo (n\u00e3o ataca; marca um alvo e o pr\u00f3ximo ataque de aliado contra ele tem Vantagem). O Filhote continua sendo o mais fraco dos quatro DE PROP\u00d3SITO — \u00e9 o \u00fanico que evolui, e no Avan\u00e7ado ele passa todos os outros.",
        ],
      },
      {
        heading: "Um arquivo de ficha no lugar do JSON",
        items: [
          "Passar a ficha adiante tinha dois caminhos, e o de arquivo envelheceu no dia em que a ficha ganhou foto e capa: base64 \u00e9 texto, e uma ficha com as duas passava de 350 KB de JSON — quase tudo caracteres de base64.",
          "O bot\u00e3o agora baixa um .mtficha: as imagens s\u00e3o reencodadas PARA COMPARTILHAR (capa 640px, foto 256px; quem exporta continua com as grandes na pr\u00f3pria ficha) e o resto vai comprimido em gzip. Medido numa ficha com capa de 1200px e foto de 512px: 464 KB de JSON viraram 40 KB, com as duas imagens dentro.",
          "O formato \u00e9 MTF1 + gzip(JSON), e o prefixo existe pra que a importa\u00e7\u00e3o saiba o que chegou sem adivinhar pela extens\u00e3o — um .json exportado semana passada continua entrando. Ficha de mesa n\u00e3o se abandona por causa de formato.",
          "O LINK continua existindo e continua sem imagem, porque nenhuma das duas otimiza\u00e7\u00f5es o salva: mesmo reduzida, uma capa de 640px vira ~55 000 caracteres de URL. Os dois caminhos passaram a ter pap\u00e9is distintos em vez de competirem — o link \u00e9 o r\u00e1pido, o arquivo \u00e9 o completo.",
          "E a foto do personagem chegou em /encontros: o montador mostrava o bras\u00e3o da \u00e1rvore inicial, ent\u00e3o os dois magos de \u00c1gua da mesa apareciam com o mesmo emblema.",
        ],
      },
      {
        heading: "Est\u00e9tica",
        items: [
          "O favicon virou um bras\u00e3o. A ressalva de 0.1.11 dizia que em 16px o letreiro inteiro vira mancha e que legibilidade ali pediria um s\u00edmbolo; o s\u00edmbolo chegou pronto. Ele veio como JPEG, e JPEG n\u00e3o tem canal alfa: o quadriculado de transpar\u00eancia do editor veio QUEIMADO nos pixels, e publicado como estava o \u00edcone sairia com o xadrez em volta. O script apaga esse fundo antes de recortar, com uma regra dupla — um pixel s\u00f3 \u00e9 fundo se for cinza E cair perto de um dos dois tons do xadrez, e o dourado do bras\u00e3o nunca \u00e9 cinza. Foram 82% dos pixels. A arte-fonte saiu de public/ pra assets-fonte/, pela mesma regra de sempre: mat\u00e9ria-prima de build n\u00e3o \u00e9 asset de site.",
          "A capa da ficha n\u00e3o usa o filtro das faixas de rota. sepia(0.5) saturate(0.6) existe pra puxar arte de terceiros pro \u00e2mbar da paleta; aplic\u00e1-lo \u00e0 foto que o jogador escolheu repinta a escolha dele at\u00e9 ela sumir. O v\u00e9u de contraste continua, porque a li\u00e7\u00e3o de 0.1.10 \u00e9 que filtro depende de qu\u00e3o clara a arte \u00e9 e v\u00e9u n\u00e3o.",
        ],
      },
    ],
  },
  {
    version: "0.1.11",
    date: "2026-09-04",
    title: "O Grupo Inteiro num Link",
    sections: [
      {
        heading: "Ficha por link",
        items: [
          "Passar uma ficha adiante eram cinco passos: exportar JSON, achar o arquivo, mandar, o outro baixar, importar — uma vez por jogador, toda vez que alguém mudava alguma coisa. O montador de encontros depende de ter o grupo carregado, então o atrito estava exatamente no caminho da funcionalidade mais cara do site.",
          "A ficha agora cabe num link, comprimida no FRAGMENTO da URL e não na query: o fragmento nunca é enviado ao servidor, então a ficha de um personagem não aparece em log de acesso, em analytics nem no Referer de um link clicado depois.",
          "/ficha/importar mostra de quem é a ficha e espera o clique. Ela não importa sozinha: o link veio de outra pessoa, e uma página que grava no navegador do visitante só por ele ter clicado é uma página que enche o roster de alguém com fichas que ele não pediu.",
        ],
      },
      {
        heading: "A Entrevista deixou de repetir",
        items: [
          "O banco tinha 14 perguntas de 4 respostas, e o sorteio pegava 10 perguntas — mas as respostas eram sempre as mesmas quatro. Quem fizesse a Via 3 duas vezes reconhecia as opções de cor e escolhia por memória, não por leitura.",
          "Agora são 20 perguntas com 6 respostas cada, e o sorteio pega 10 perguntas e 4 das 6 respostas de cada uma. Nem a pergunta que mais pesaria pra sua build, nem a resposta, têm garantia de aparecer — a mesma promessa que a Roleta já fazia.",
          "O teste novo pegou um bug que nenhum print pegaria: doze das respostas novas empurravam ids de SUBTABELA (odio, telepatia, veias-abertas…) como se fossem antecedentes. A loteria sorteia entre BACKGROUNDS, então essas respostas teriam peso zero em silêncio — pareceriam funcionar e não fariam nada.",
        ],
      },
      {
        heading: "Auditoria automatizada das árvores",
        items: [
          "`npm run check:arvores` mede o TETO DO TURNO de cada árvore em cada patamar — quanto ela causa gastando as 3 Ações da melhor forma que o patamar permite — e compara com a coluna do Apêndice C. O check:livro já verificava o piso; o teto é o lado perigoso, porque uma coluna pode prometer 40 e a árvore entregar 12 sem nada perceber.",
          "O BC usa o atributo que o próprio Apêndice C declara (\"progredindo de 4 até 8\"). Ignorar isso foi o primeiro erro do script e produziu ~50% de desvio em TODA coluna alta — desvio uniforme em tudo denuncia o medidor, não o dado.",
          "Árvores do Corpo saem numa lista separada, marcadas como PISO e nunca como falha: o golpe base delas é o Dado de Arma escalado por Maestria, que o script não modela. Inventar um número plausível ali daria um relatório mais bonito e menos verdadeiro.",
          "Resultado: 5 células de Magia pra conferir (Fogo 4º e 5º, Água 5º, Vento 5º, Terra 6º) e 6 pisos de Corpo pra olhar — lista curta no lugar de 400 magias.",
        ],
      },
      {
        heading: "Faixas, favicon, tema claro e README",
        items: [
          "As duas faixas de baixa resolução foram trocadas: loja.jpg era 600x279 e livro.jpg 525x350, contra 960-1900 das outras seis — elas amaciavam justamente em tela larga, que é onde a faixa é grande. A loja saiu de uma arte de 3840px e agora é a maior das oito (1600x794); o livro subiu pra 680x384 e continua sendo o menor do conjunto, porque a imagem encontrada não tinha mais que isso e ampliar não cria detalhe.",
          "A arte da loja não entrou inteira: o original é uma prancha de concept art com o título e dois créditos do autor impressos nos cantos, além de margem creme nas bordas. A faixa é o recorte que fica só com o salão — texto e margem ficam de fora.",
          "O favicon virou a marca nova: src/app/icon.png é gerado recortando pela caixa real do letreiro (a arte ocupa 15% do quadro), reduzindo por média de área (traço fino some com amostragem simples) e compondo sobre parchment-950. O icon.svg antigo saiu — com os dois presentes, cada navegador escolhe um e a aba mostra marcas diferentes por máquina. Ressalva: em 16px o letreiro inteiro vira mancha; legibilidade nesse tamanho pediria um símbolo.",
          "Os badges do README diziam regras 0.1.0 (estava em 0.1.10) e 35 testes (são 96) — e é a primeira coisa que alguém vê ao abrir o repositório, que é o link que o rodapé do site agora aponta.",
        ],
      },
    ],
  },
  {
    version: "0.1.9",
    date: "2026-09-04",
    title: "Sem Arestas",
    sections: [
      {
        heading: "A faixa de convite estava mascarando a coisa errada",
        items: [
          "0.1.8 mascarou a IMAGEM e depois pôs um véu radial por cima dela. A arte sumia nas pontas como devia — mas o véu era um retângulo opaco, e era ELE que desenhava as duas linhas horizontais duras que faziam a seção parecer um bloco colado na página. Mascarar a arte não adianta enquanto a caixa de cor continuar lá.",
          "Agora arte e véu vivem dentro do mesmo elemento mascarado: os dois desaparecem juntos. No centro a faixa tem imagem e escurecimento suficientes pra segurar o texto; nas quatro bordas ela simplesmente deixa de existir. Os filetes dourados saíram junto — filete marca justamente a aresta que esta seção não quer ter.",
          "Para isso, `.faixa-arte` foi partida em duas: `.arte-ambiente` carrega só o tratamento de cor e `.faixa-arte` acrescenta a máscara de baixo. As duas andavam juntas numa classe só, e isso obrigava toda arte de ambiente a morrer do mesmo jeito — o que serve pro cabeçalho de rota, onde a borda inferior é aresta de card real, e não serve pra faixa que atravessa a página inteira.",
        ],
      },
      {
        heading: "Um bug que só o tema CLARO tinha",
        items: [
          "Todos os prints desta série saíram no tema escuro — o Chrome headless segue o tema do SO. Forçando o claro, o cabeçalho de /arvores apareceu ilegível: título parchment-900 sobre o campo estelar, que é quase preto. O filtro de .faixa-arte dessatura e ESCURECE, o que funciona enquanto a arte é clara; escurecer um preto não faz nada.",
          "O PageHeader ganhou um véu (bg-parchment-50/72 no claro, bg-parchment-950/45 no escuro). Filtro depende de quão clara a arte é; véu não — ele garante o piso de luminância que o texto precisa, qualquer que seja a imagem que entrar ali amanhã.",
        ],
      },
      {
        heading: "A logo, de novo",
        items: [
          "A primeira tentativa de dissolver a faixa usou uma ELIPSE, e as duas linhas duras continuaram. O motivo é aritmético: com raio vertical de 92% da altura, a borda de cima fica a 54% do raio, e a rampa só ia de 28% a 80% — a máscara chegava na borda ainda com METADE da opacidade. Máscara que não chega a zero dentro da caixa não dissolve nada, só desenha uma borda mais clara. Trocada por linear-gradient vertical, onde transparent 0% e transparent 100% SÃO as bordas.",
          "Mais 30% sobre 0.1.8: h-48 sm:h-72 na landing, h-16 na barra, h-20 no rodapé.",
          "A faixa de convite ganhou respiro vertical (py-24 sm:py-32), que é o espaço de que o degradê precisa pra acontecer — máscara suave em caixa baixa vira máscara dura.",
        ],
      },
    ],
  },
  {
    version: "0.1.8",
    date: "2026-09-04",
    title: "Seis Portas",
    sections: [
      {
        heading: "A vitrine da landing dobrou",
        items: [
          "Eram três destinos — árvores, loja, livro — e metade do site continuava invisível pra quem chega: a ficha, o roster e o montador de encontros (que é onde o Mestre passa o tempo dele) só apareciam como texto numa lista de bullets embaixo. Agora são seis, cada um com a arte da própria rota, na ordem de uso: descobrir o sistema → fazer a ficha → equipar → guardar o grupo → o lado do Mestre → a referência.",
          "/criar fica de fora de propósito: ela já é o botão grande do topo, e repetir o CTA principal dentro da vitrine enfraquece os dois.",
          "Os cards de recursos caíram de quatro para três junto: \"Feito pra mesa de verdade\" descrevia o tracker e o montador de encontros, que agora têm card próprio — dizer a mesma coisa duas vezes na mesma página só ensina o leitor a pular a segunda.",
        ],
      },
      {
        heading: "A faixa de convite deixou de ser um recorte colado",
        items: [
          "Ela tinha duas camadas — a arte e um véu chapado — e o resultado era corte reto em cima e embaixo, laterais que simplesmente terminavam, e a tocha do grupo brilhando por trás da linha de texto.",
          "Agora são quatro, e nenhuma é enfeite: a arte tratada, uma máscara radial que faz a imagem morrer no pergaminho em vez de encostar numa borda, um véu em degradê (denso no meio onde o texto está, aberto nas pontas onde a arte pode aparecer) e os dois filetes dourados, a mesma aresta de luz que todo card elevado do site tem.",
        ],
      },
      {
        heading: "A logo cresceu, e a segunda faxina",
        items: [
          "A marca ficou 40% maior na landing, na barra e no rodapé. Ela tinha ficado tímida quando perdeu o cartucho — sem a moldura, o mesmo tamanho lê menor do que lia antes.",
          "public/logo-dark.svg apagado: era a variante de tema escuro do logo antigo, e desde que a marca virou logo-real-alfa.png nenhum componente o importava. O script que o gerava virou scripts/gerar-favicon.mjs e agora produz só o que ainda tem uso.",
          "logo-real.png (1,3 MB) saiu de public/ para assets-fonte/. Ele é matéria-prima de script, não asset de site: em public/ ficava servível em /logo-real.png — baixável por qualquer visitante e concorrendo por engano com a versão boa.",
        ],
      },
      {
        heading: "O favicon ainda é da marca antiga",
        items: [
          "src/app/icon.svg continua derivado de public/logo.svg — o letreiro velho. É o único lugar do site que ainda mostra a marca anterior, e sobrevive por razão técnica: favicon precisa ser vetorial pra ler num quadrado de 16px, e a marca nova é um PNG. Trocar exige rasterizar e recortar. Fica anotado como pendência declarada, não como esquecimento.",
        ],
      },
    ],
  },
  {
    version: "0.1.7",
    date: "2026-09-04",
    title: "A Ordem do Livro",
    sections: [
      {
        heading: "O Capítulo 2 estava na ordem errada",
        items: [
          "O capítulo rodava 1, 2, 6, 7, 3, 4, 5: \"Interromper uma Conjuração\" e \"Regras Gerais\" ficavam entre a §2 e a §3. A §6 abre dizendo \"uma magia de rank Santo custa 4 Ações\" — número que só a §3 estabelece, e que o leitor ainda não tinha visto.",
          "O sumário listava 1→7 corretamente, então clicar em \"3. Tempo de Conjuração\" fazia o leitor SUBIR na página. As duas seções foram para o fim, na ordem que o sumário sempre prometeu.",
        ],
      },
      {
        heading: "O Capítulo 4 numerava 8 seções; o sumário, 9",
        items: [
          "\"Reações e Ações Defensivas\" — a tabela com Ataque de Oportunidade, Esquivar, Defender e Bloquear com Escudo, que é regra central de combate — estava enterrada como subtítulo dentro da seção de Exaustão, Fome, Sede e Clima, entre \"Removendo Exaustão\" e \"Fome e Sede\".",
          "Virou seção própria, logo depois da Economia de Ações. As seções seguintes foram renumeradas de 5 a 9, e as 25 remissões cruzadas do livro inteiro (\"Cap. 4, §7\" e companhia, espalhadas por árvores, raças, loja, bestiário e antecedentes) foram corrigidas junto.",
        ],
      },
      {
        heading: "O Capítulo 3 apresentava três pilares e dava seção a dois",
        items: [
          "A abertura nomeia Magia, Corpo e Utilidade; o capítulo tinha seção de sistemas compartilhados para Corpo e Utilidade, e nada para a Magia. A razão era boa (os sistemas compartilhados da Magia são o Capítulo 2 inteiro), mas não estava escrita em lugar nenhum — quem rolava procurando concluía que faltava uma parte.",
          "Agora existe a seção-ponte, curta de propósito: ela aponta pro Capítulo 2, não repete ele em versão resumida. Este livro não tem duas fontes de nada.",
        ],
      },
      {
        heading: "O sumário virou teste",
        items: [
          "Nada disso quebrava tsc, eslint ou vitest: eram âncoras válidas apontando pro lugar errado. Um livro é uma ORDEM, e ordem precisa de teste.",
          "O `npm run check:livro` agora falha se um item do sumário não tem âncora na página, ou se aparece na página numa ordem diferente da do sumário. Conferido invertendo duas seções de propósito: ele pega os dois casos.",
        ],
      },
      {
        heading: "A logo perdeu o fundo",
        items: [
          "Em 0.1.6 ela ia ao ar dentro de um cartucho escuro com mix-blend-mode: screen — o preto sumia contra o cartucho, mas o cartucho continuava sendo um retângulo em volta da marca, que é justamente o que uma logo não pode ter.",
          "A correção foi no ARQUIVO: scripts/logo-sem-fundo.mjs decodifica o PNG com o zlib do próprio Node (zero dependências), calcula alfa = max(R,G,B) e des-premultiplica a cor. Sem esse segundo passo, cada pixel de borda carrega o preto que o compôs e a logo ganha um halo sujo sobre pergaminho. 15,5% do quadro é letreiro; o resto é transparente de verdade.",
          "No tema claro ela passa por brightness(.3) sepia(.5) saturate(2): o letreiro é creme e ouro, desenhado pra viver em fundo escuro, e sobre pergaminho ele simplesmente sumia.",
        ],
      },
    ],
  },
  {
    version: "0.1.6",
    date: "2026-09-04",
    title: "O Letreiro e a Faxina",
    sections: [
      {
        heading: "A logo nova, e o fim do \"RPG\" avulso",
        items: [
          "A marca virou /logo-real.png, e isso muda estrutura, não só arte: o \"RPG\" agora está DENTRO do letreiro. Até 0.1.5 ele era um texto ao lado da imagem em três lugares (nav, landing, rodapé), porque o logo da franquia não trazia a palavra que este projeto acrescenta ao nome. Trazendo, o texto virou repetição — e saiu dos três.",
          "Ela chegou como PNG sem canal alfa, com fundo preto sólido. Solta sobre o pergaminho seria um retângulo preto. A saída não foi gerar um arquivo por tema (que é o que logo.svg + logo-dark.svg precisavam ser): é `mix-blend-mode: screen` sobre um cartucho escuro. Screen com preto devolve o fundo intacto e com creme clareia — a mesma conta nos dois temas, sem editor de imagem.",
        ],
      },
      {
        heading: "As quatro rotas que faltavam ganharam arte",
        items: [
          "/ficha (a ficha na mesa, com vela, pena e tinteiro), /personagens (o salão da guilda), /iniciativa (uma escaramuça em floresta) e /criar (a mão desenhando um círculo mágico). Com elas, todas as sete rotas têm identidade visual própria.",
          "A landing ganhou uma faixa de convite antes do rodapé: a página terminava numa fileira de links de texto e nunca voltava a pedir a única coisa que quer de quem está lendo.",
          "O Superd Renegado do bestiário ganhou retrato próprio e parou de emprestar o da raça Superd.",
        ],
      },
      {
        heading: "O mapa parou de parecer de outro projeto",
        items: [
          "Os três pilares eram sky-600, rose-600 e emerald-600 — três primárias saturadas de biblioteca num site inteiro de pergaminho, vinho e ouro. O mapa é a página mais bonita do projeto e era a única que parecia ter vindo de outro. Viraram teal fundo, vinho e oliva: água, sangue e mata. A distinção entre os ramos continua igual; o que mudou foi a temperatura.",
          "O galho em que você investiu agora ACENDE: linha em opacidade cheia com brilho da cor do Rank, contra os 25% do que nunca foi tocado. Antes, uma árvore com quatro patamares comprados e uma que você nunca abriu tinham o mesmo peso na tela.",
        ],
      },
      {
        heading: "Gastar passou a ter instante",
        items: [
          "Comprar item e gastar PA eram instantâneos: o \"150 PO\" virava \"85 PO\" entre um quadro e outro, e nada dizia que você acabou de gastar 65. Agora a bolsa e o contador de PA contam até o novo valor — duração fixa de 420 ms, e não passo fixo, porque ir de 0 a 6 e de 0 a 3.400 tem que levar o mesmo tempo.",
          "O card do item comprado pulsa uma vez em dourado. Tudo respeita prefers-reduced-motion.",
        ],
      },
      {
        heading: "Faxina no repositório",
        items: [
          "Um git worktree inteiro do Claude estava commitado em .claude/worktrees/ — cópia completa do projeto, package-lock.json incluído, 30 arquivos rastreados. Saiu do índice e do disco; os markdowns do livro que moravam lá foram preservados fora do repositório.",
          "Os cinco SVGs do template do create-next-app (next, vercel, window, file, globe) nunca foram referenciados por uma linha de código. Removidos.",
          "O rodapé passou a citar o repositório no GitHub e o Discord do autor — o Discord como handle copiável, não como link: um convite discord.gg expira e viraria 404 no rodapé de todas as páginas.",
        ],
      },
      {
        heading: "Dois defeitos que o tsc aprovou e a tela reprovou",
        items: [
          "A página inteira quebrou ao abrir: CopyChip recebia o ícone como `icon: ComponentType`, e React recusa uma FUNÇÃO atravessando de Server pra Client Component. tsc e eslint passaram os dois. Agora o ícone entra como children, já construído.",
          "A logo subiu por cima do selo \"projeto de fã\" na landing: o componente era inline-flex, entrava no fluxo de linha do container centralizado, e mx-auto não centraliza caixa inline nenhuma.",
        ],
      },
    ],
  },
  {
    version: "0.1.5",
    date: "2026-09-04",
    title: "Três Níveis de Papel",
    sections: [
      {
        heading: "O site tinha UM card, repetido 23 vezes",
        items: [
          "A string do card (`rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm…`) estava copiada literalmente 23 vezes no JSX, e o botão vinho outras 23. Em ~11 mil linhas havia 36 `shadow-sm` e exatamente 1 `group-hover`: nada tinha relevo, nada reagia ao mouse, e uma tela cheia lia como uma lista de retângulos igualmente importantes.",
          "Agora existem três níveis de superfície, e o nível é gramática: `.surface-raised` anuncia (cabeçalho de rota, hero, total — ganha o fio dourado na aresta de cima), `.surface` contém (o card comum), `.surface-sunken` espera (campo, poço, estado vazio, com sombra pra dentro).",
          "As três compõem com as utilitárias de cor que já estavam no JSX — elas declaram profundidade e textura, não background-color. Por isso deu pra acrescentar a classe num card existente sem reescrever a linha dele.",
        ],
      },
      {
        heading: "Cada rota tem uma cara",
        items: [
          "/ficha, /loja, /encontros e /iniciativa eram estruturalmente a mesma página: h1 + ícone + grade. O novo PageHeader põe a arte de ambiente da rota atrás do título — a taverna da guilda na Loja, o covil de teia nos Encontros, o grimório à luz de vela no Livro, o céu estrelado nas Árvores.",
          "A arte é dessaturada, puxada pro âmbar da paleta e morre num degradê antes da borda de baixo: as artes chegaram em teal, azul e cinza, e nenhuma delas, crua, convive com texto por cima.",
          "Rota sem arte não fica esperando arte — o cabeçalho cai num degradê vinho→pergaminho e é o mesmo objeto.",
        ],
      },
      {
        heading: "O mapa de progressão ganhou céu",
        items: [
          "O tabuleiro era o objeto mais bonito do site rodando sobre um retângulo bege chapado. Agora tem campo estelar de fundo e vinheta radial fechando as quatro pontas.",
          "A mesma imagem serve aos dois temas com tratamentos opostos: no escuro ela aparece de verdade (passada pelo sépia, senão o azul frio briga com a paleta); no claro entra em `multiply` a 13% e vira mancha de tinta — uma carta celeste desenhada no pergaminho.",
          "O painel lateral era um parágrafo de instrução numa coluna de 340×700 vazia. Virou a legenda das três cores do mapa: a informação que faltava e o conteúdo que faltava, no mesmo lugar.",
        ],
      },
      {
        heading: "O livro virou livro",
        items: [
          "Capitular na abertura de cinco capítulos, e filigrana sob cada título de capítulo.",
          "A filigrana chegou como PNG de traço preto sobre fundo branco. Ela é convertida em ouro por um filtro SVG que joga a luminância no canal alfa: o fundo branco vira transparente e o traço vira ouro, nos dois temas, sem passar por editor de imagem.",
          "Filete duplo com losango entre seções e no rodapé, em CSS puro — filigrana toda seção viraria barulho.",
        ],
      },
      {
        heading: "O bestiário e a loja",
        items: [
          "As 6 criaturas prontas do Apêndice G ganharam retrato (`CriaturaPronta.icon`, em public/criaturas/<id>), com `check:livro` conferindo que cada arquivo existe. O Superd Renegado reaproveita o retrato da raça Superd — a criatura do Apêndice G é um membro renegado dessa mesma raça.",
          "Rank da loja passou a ter cor por letra (F→S, do frio ao quente, na mesma direção da escala de Rank das árvores). Vinte e um cards de arma com a mesma faixa vinho não separavam uma adaga de 6 PO de um artefato de Rank S.",
          "Item bloqueado não ganha mais um botão cinza do tamanho do card: a grade tinha 21 barras cinzas mortas, e elas eram o elemento mais pesado da tela. Bloqueio virou linha de estado; botão é só pra quem pode agir, e quem tem Rank mas não tem PO vê quanto falta.",
          "A sétima categoria (Equipamento de Aventura) finalmente tem ícone. A arte estava no repositório desde 0.1.4, solta na raiz de public/ com espaço no nome, a um diretório de distância da tabela que a procurava.",
        ],
      },
      {
        heading: "Estados vazios, rodapé e barra fixa",
        items: [
          "\"Nenhuma perícia ainda.\", \"Nenhuma magia ou talento comprado ainda.\", \"Nenhum item ainda.\" — três frases cinzas em sequência eram a primeira impressão de quem acabava de criar um personagem. Viraram poços com o ícone da seção grande e apagado, e a frase na voz do livro: o grimório está em branco, a mochila está vazia, o covil está vazio.",
          "Nenhuma rota do site terminava — elas paravam, e depois vinha pergaminho vazio até o fim do scroll. Agora há rodapé com navegação, versão e o disclaimer de fã, em todas as páginas.",
          "O disclaimer saiu da landing, onde ocupava o espaço logo abaixo do CTA. No lugar dele entrou a vitrine: as três coisas que o site tem e que uma lista de bullets não vende (o mapa, a loja, o livro), cada uma com a arte do próprio destino.",
          "A barra de navegação é fixa e translúcida com blur — a textura do body é `fixed`, e uma barra opaca cortaria a folha em duas. A rota atual ganhou filete dourado: antes o ativo era só negrito+vinho, a mesma diferença que o hover dá.",
          "Os números-herói da ficha (PV/PM/PT/PP/CA/Iniciativa) saíram de text-lg na sans de formulário pra display, pretos e tabulares.",
        ],
      },
      {
        heading: "Três defeitos que só o print pegou",
        items: [
          "O ornamento saía com uma moldura dourada: a região padrão de um filtro SVG é 10% maior que o elemento, e lá fora o pixel é preto transparente — que, pela conta do filtro, vira alfa 1, ou seja, ouro chapado na margem inteira.",
          "A linha \"19 sub-árvores\" da vitrine era invisível: elemento posicionado pinta acima de irmão não posicionado mesmo vindo antes no DOM, e a margem negativa enfiava o texto por baixo da imagem.",
          "A textura de fibra estava forte demais — exatamente o sintoma que o comentário dela no CSS descreve como erro. Caiu de 0,22 pra 0,10 no tema escuro.",
          "E um falso positivo que vale anotar: o print de 390px mostrava a página estourando pra fora da tela. O Chrome no Windows trava a largura mínima de janela em ~500px — o print era um recorte de uma janela de 500, e o layout em 500 está correto. `--window-size` abaixo disso mente.",
        ],
      },
    ],
  },
  {
    version: "0.1.4",
    date: "2026-09-03",
    title: "As Doze Raças Ganharam Cara",
    sections: [
      {
        heading: "Escolher raça deixou de ser uma lista suspensa",
        items: [
          "As 12 raças ganharam retrato (`Race.icon`, em public/racas/<id>). O arquivo se chama como o id da raça, então não existe tabela de mapeamento em lugar nenhum — mesma regra dos brasões de árvore e dos ícones da loja.",
          "O passo de raça da Criação Guiada era um <select> de doze linhas de texto: doze nomes que só quem já leu o Cap. 1 sabe diferenciar. Virou uma grade de retratos, com a raça escolhida marcada. Escolher raça é a primeira decisão de identidade da ficha, e agora a diferença entre um Superd e um Migurd chega antes da leitura.",
          "O retrato aparece também no card de Passivas (ficha e criação), no Cap. 1 do livro, no roster de /personagens e no instante em que a Roleta do Destino para — que é o momento em que o personagem nasce, e até aqui ele nascia como um nome.",
          "O card de /personagens era só nome e dois botões. O retrato da raça ocupa exatamente o lugar da foto de perfil que o roster ainda vai ganhar, e é o que dá pra mostrar hoje sem pedir upload nenhum.",
        ],
      },
      {
        heading: "As imagens pararam de ser servidas cruas",
        items: [
          "Os retratos chegaram com até 1,28 MB por arquivo. O componente de medalhão servia tudo sem otimização (uma decisão que fazia sentido quando só existiam SVGs e PNGs pequenos) — mandar um megabyte pro navegador desenhar um selo de 44px, não.",
          "Agora o `unoptimized` vale só pra SVG, que o otimizador do Next não processa mesmo. O resto passa pelo otimizador: o maior retrato caiu de 1,28 MB para 1,7 KB no tamanho em que é exibido.",
          "Terceira vez na mesma semana que um arquivo mentiu sobre o formato: duas raças chegaram como .png sendo WebP por dentro (antes disso, um brasão de árvore era PNG com extensão .svg e a textura de pergaminho era AVIF com extensão .png). Todos renomeados pro que realmente são.",
          "check:livro agora confere retrato de raça junto com brasão de árvore, ícone de loja e a arte fixa da interface, e imprime quantas das 12 raças têm retrato.",
        ],
      },
    ],
  },
  {
    version: "0.1.3",
    date: "2026-09-03",
    title: "O Site Ganhou Cara",
    sections: [
      {
        heading: "O mapa de árvores cabia numa moeda",
        items: [
          "O zoom inicial de /arvores era a constante 0,35 — sem relação nenhuma com o tamanho do visor nem do canvas, que cresce junto com o número de árvores. Num monitor comum o grafo inteiro virava uma bolinha no meio de um retângulo vazio de 800px: os brasões eram pontos de 3px e a primeira impressão da tela mais importante do site era a de uma página que não carregou.",
          "Agora o enquadramento é calculado do CONTEÚDO — diâmetro do grafo mais o raio de um nó da borda — contra o tamanho real do visor. O mapa nasce preenchendo a tela e cada árvore mostra o brasão dela legível.",
        ],
      },
      {
        heading: "A loja repetia a mesma frase doze vezes",
        items: [
          "As doze armas mundanas nascem de um mesmo molde e compartilham uma descrição só. A loja imprimia uma cópia dela em cada card — doze parágrafos idênticos empilhados, e as armas que TÊM algo próprio a dizer (Adaga de Prata, Lâmina Balanceada) afogadas no meio.",
          "A tela agora agrupa por categoria e detecta sozinha o texto que dois ou mais itens do grupo repetem: ele sobe pro cabeçalho, uma vez, e some dos cards. A regra é genérica — pega as doze armas de hoje e pega sozinha o próximo bloco que nascer do mesmo molde.",
          "Cada grupo ganhou a arte da categoria e a contagem de itens. Com o filtro em \"Todos\", os 85 itens deixaram de ser uma lista corrida sem divisão.",
        ],
      },
      {
        heading: "Pergaminho, paisagem e o logo consertado",
        items: [
          "O site inteiro passou a ter fundo de pergaminho de verdade: 60% no tema claro (onde a textura é o assunto) e 20% no escuro (onde ela só precisa quebrar o marrom chapado). As dez páginas pintavam um fundo sólido por cima do corpo, então nenhuma textura teria aparecido — isso saiu junto.",
          "A landing ganhou a paisagem do Mundo de Seis Faces atrás do herói, dissolvendo na textura por máscara em vez de terminar numa cor sólida, que deixava um degrau visível.",
          "O logo parou de dizer o nome duas vezes: ele É o título agora, com o h1 virando texto para leitor de tela e busca, e o \"RPG\" — a parte que este projeto acrescenta ao nome da franquia — ganhando linha própria.",
          "CORREÇÃO DO LOGO NO TEMA ESCURO: o preto do arquivo estava em dois lugares, e só um tinha sido trocado. Os quatro degradês das letras grandes terminam num <stop> sem cor — que é preto por padrão em SVG —, então \"Mus\", \"Te\" e \"u\" sumiam no fundo escuro, que é o tema padrão do site. Passava em toda verificação automática e só aparecia num print. O gerador agora exige os dois padrões e falha explicando se o logo mudar de estrutura.",
          "check:livro passou a conferir que TODA arte referenciada por caminho existe em disco: os 19 brasões, os ícones de categoria da loja, os dois logos, a paisagem e a textura. Caminho é texto, e nenhum tipo protege texto.",
        ],
      },
    ],
  },
  {
    version: "0.1.2",
    date: "2026-09-03",
    title: "O Que a Criatura Faz",
    sections: [
      {
        heading: "A ficha de monstro deixou de ser sete números soltos",
        items: [
          "A criatura de /encontros era PV, CA, ataque, dano por turno, CD, quantidade e uma linha de texto livre. Isso basta pra dizer se um encontro é justo e não basta pra NADA do que acontece na mesa: o Mestre sabia que a Wyvern mergulha, e tinha que inventar na hora quanto a mordida dela tira.",
          "Agora a criatura tem AÇÕES. Cada uma com nome, custo em Ações, fórmula de dano (\"4d8+5\", do jeito que se escreve numa ficha de monstro), alcance, se é em área, e se resolve contra a CA ou pedindo teste de resistência. Mais uma anotação livre pra condição, veneno ou gatilho.",
          "Criatura COM ações é resolvida com rolagem de verdade na simulação: três Ações por rodada, gastas no melhor dano médio por Ação — o mesmo critério que o motor já usava pro personagem —, com 1 natural errando, 20 natural rolando os dados de novo, área pegando todo mundo de pé e resistência cortando o dano pela metade.",
          "Criatura SEM ações continua no orçamento fixo do Apêndice G. Ele não foi aposentado: é ele que preserva a calibragem publicada da tabela e os números do playtest, e uma criatura montada em trinta segundos antes da sessão continua sendo uma criatura válida.",
          "As seis criaturas prontas do Apêndice G ganharam as ações delas, e o livro passou a imprimi-las. As fórmulas foram escritas pra que o turno de três Ações entregue o Dano por Turno do patamar: um teste trava essa igualdade com 15% de folga, então ligar as ações não invalidou nada do que já estava calibrado.",
        ],
      },
      {
        heading: "O site sugere ENQUANTO você digita o dano",
        items: [
          "A simulação responde depois do fato: monte tudo, clique, espere 300 batalhas. Isso fecha um encontro e não ajuda a escrever um monstro. O conselho novo é a outra ponta — sem rolagem nenhuma, ele recalcula a cada tecla.",
          "E ele é CONCRETO, porque é ancorado em duas coisas que o site já tem: o molde do Apêndice G e as fichas de verdade do grupo selecionado. Não \"está alto demais\", e sim \"Mordida tira 62 em média; Lyn (50 PV) cai num acerto só\" ou \"gastando as três Ações no melhor que ela tem, sai ~7,5 por rodada; o molde de 3º pede ~35 — suba pra 5d4\".",
          "Os avisos cobrem: o orçamento do turno contra o molde; quem do grupo morre num golpe (e quem PODE morrer na rolagem alta, que é outra conversa); a chance de acerto dela contra a CA real do grupo, nas duas pontas; o dano de uma ação em área medido contra a reserva de PV do grupo inteiro; e a CD fora do molde, mas só quando alguma ação cobra teste.",
          "Cada aviso traz, quando cabe, uma correção pronta com um botão — a fórmula já escalada, o bônus de ataque já calculado. Nada muda sozinho: o Apêndice G é uma régua, e régua não decide.",
          "Sem grupo escolhido, os avisos que dependem do grupo CALAM em vez de inventar um personagem médio. Um número tirado do nada seria pior que silêncio.",
          "16 testes novos só do conselheiro, travando quando cada aviso aparece, que ele cita um número conferível, e que a correção que ele oferece resolve o que ele apontou. 89 no total.",
        ],
      },
      {
        heading: "As dezenove árvores ganharam brasão, e o jogo ganhou logo",
        items: [
          "Cada árvore agora declara `icon` — e o arquivo se chama como o id dela, então o mapeamento nome→arquivo deixou de existir como tabela. /arvores desenha o brasão no nó do mapa e no painel lateral, /livro no cabeçalho de cada catálogo, a criação no seletor de Árvore Inicial, a ficha na Árvore Inicial e em cada grupo do Grimório, e /encontros no cartão de cada personagem do grupo.",
          "As imagens chegaram tortas e foram endireitadas: uma era cópia byte a byte de outra, quatro tinham espaço ou acento no nome, e uma se chamava .svg sendo PNG por dentro — o navegador engoliria, mas o formato mentia. Todas viraram public/arvores/<id da árvore>.<extensão>.",
          "Elas vêm em formatos e fundos diferentes (traço preto sem fundo, fundo branco, fundo preto, alfa), então todas passam pelo mesmo medalhão, com fundo claro fixo nos dois temas — é a única regra que faz o traço preto aparecer também no escuro, e ela mora num lugar só.",
          "O logo entrou na aba (favicon), na barra de navegação e no topo da landing. Como o letreiro é preto e os ornamentos são dourados, existe uma variante clara pro tema escuro — GERADA do original por script, junto com o favicon quadrado, porque logo copiado à mão é a próxima coisa a divergir.",
          "check:livro passou a conferir que o brasão de cada árvore existe mesmo em disco: `icon` é texto, e nada no TypeScript impede que ele aponte pra um arquivo que não existe.",
        ],
      },
    ],
  },
  {
    version: "0.1.1",
    date: "2026-09-03",
    title: "O Cenário Hipotético",
    sections: [
      {
        heading: "/encontros — montar a criatura e testá-la contra o grupo antes da sessão",
        items: [
          "O Apêndice G sempre teve o molde de criatura por patamar, e ele só existia como tabela impressa: o Mestre lia PV 150, CA 18, ~55 de dano e tinha que adivinhar o que isso faz contra OS CINCO PERSONAGENS dele. A tabela é calibrada contra um grupo genérico; nenhuma mesa tem um grupo genérico.",
          "Tela nova: escolha um patamar e um papel (Lacaio, Padrão, Chefe) e a criatura nasce com os números do Apêndice G preenchidos. Edite PV, CA, ataque, dano por turno, CD e quantidade à vontade — quando os números saem do molde, a tela diz que saíram e oferece recalibrar, em vez de impedir.",
          "As seis criaturas prontas do apêndice (Sapo-Lodo, Serpente-do-Pântano, Aranha, Wyvern, Ogro de Guerra, Superd Renegado) entram com um clique, já com a coluna \"o que a torna perigosa\".",
          "O GRUPO VEM DAS FICHAS DE VERDADE: marque quem entra entre as fichas de /personagens — as mesmas que o Mestre já importa dos JSONs dos jogadores. Nada de reinserir atributo nenhum.",
          "O botão roda o combate 300 vezes e devolve um veredito: Trivial, Fácil, Equilibrado, Perigoso ou Letal, com taxa de vitória, rodadas, quantos personagens caem, PV que sobra no grupo e quanto dano cada ficha causou.",
          "E A RECOMENDAÇÃO: quando o encontro não cai em Equilibrado, o site procura por busca binária a escala de PV e dano que o poria lá, e mostra \"PV 300 → 235, dano 55 → 43\" com a projeção. Um botão aplica. Quando NENHUMA escala resolve, ele diz isso — o problema é a composição do encontro, e uma escala fracionária só esconderia.",
          "A tela imprime, junto do veredito, a lista do que a simulação NÃO sabe (cura, condições, Reações, terreno, táticas). O motor mede o piso: o que aparece como Equilibrado tende a ser confortável na mesa, e o que aparece como Letal é letal mesmo.",
          "Botão pra mandar as criaturas direto pro tracker de /iniciativa, com a iniciativa já rolada.",
        ],
      },
      {
        heading: "O motor de simulação virou código compartilhado",
        items: [
          "O simulador de combate vivia inteiro dentro de scripts/simular-combate.mts. A tela que diz ao Mestre \"este encontro é justo\" precisa responder pelos MESMOS números que calibram o livro — duas cópias da mesma simulação divergem em silêncio, e a que diverge é sempre a que ninguém roda.",
          "O motor foi pra src/lib/combatSim.ts e o script passou a importá-lo. A refatoração é neutra: os 2.000 combates do relatório saem com todos os números idênticos aos de antes.",
          "A aleatoriedade agora é sempre injetada com semente. Um veredito sem semente não se confere: o Mestre que estranha os 82% precisa poder rodar de novo e receber 82%.",
          "O script perdeu uma função morta (construir) que nunca foi chamada por ninguém.",
        ],
      },
      {
        heading: "Apêndice G deixou de ser texto digitado à mão",
        items: [
          "Mesma cirurgia que a régua de dano do Apêndice C tinha recebido: as duas tabelas do Bestiário — o molde por patamar e as seis criaturas prontas — eram valores digitados dentro de Appendices.tsx, e são a régua contra a qual o Mestre monta todo inimigo do jogo.",
          "Agora vivem em src/data/bestiary.ts e o livro as imprime a partir dali. A tela de encontros lê os mesmos dados.",
          "A coluna \"Bônus de Resistência\" parou de ser digitada: o livro a define como metade do Bônus de Ataque arredondado pra cima, então ela é DERIVADA. Um teste trava que a derivação reproduz exatamente os seis valores que a tabela imprimia (+2, +2, +3, +4, +5, +6).",
          "A regra da rodada extra do chefe também virou função: rodadasDoChefe(). Ela estava escrita à mão em dois lugares, incluindo a ressalva de que grupos de três ou menos não a disparam — que o script ignorava.",
          "25 testes novos cobrindo os papéis, a escada do molde, a rodada do chefe, a reprodutibilidade da simulação e as cinco faixas do veredito. 60 no total.",
        ],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-09-03",
    title: "Duas Portas",
    sections: [
      {
        heading: "Magias Combinadas — rework completo",
        items: [
          "Elas eram uma tabela impressa e nada mais: nenhuma era comprável em lugar nenhum, o motor não sabia que existiam, a ficha não as guardava, e o PA que o livro dizia que elas custavam nunca saía de lugar nenhum.",
          "REQUISITO NOVO: cada combinação declara DUAS PORTAS, cada uma com o seu próprio rank. Meteoro exige Fogo no REI e Terra no AVANÇADO. Barreira Incandescente se contenta com Barreira Avançado e Fogo Intermediário. Não existe mais um \"Avançado nas duas\" genérico que abra as nove de uma vez.",
          "Os requisitos são DESIGUAIS de propósito: duas fichas que investiram fundo em escolas diferentes destravam Combinadas diferentes, e nenhuma destrava todas. Isso é o que faz a tabela ser uma lista de escolhas em vez de um bloco.",
          "ELAS CUSTAM PA de verdade agora — de 3 PA nas portas mais baixas a 8 PA no Meteoro — e o custo entra em getPaSpent junto com magia, atributo e perícia.",
          "Painel novo em /arvores: mostra as nove o tempo inteiro. As compradas, as abertas agora, e as trancadas COM AS PORTAS QUE FALTAM e quanto falta em cada uma. Uma Combinada aparece como disponível no instante em que a segunda porta abre.",
          "A Maestria do Avançado continua dando o DIREITO de aprender Magia Combinada. O que ela deixou de ser é a única condição.",
          "NA FICHA: as Combinadas compradas ganham seção própria no Grimório de /ficha, com PM, Ações, alcance, dano e as duas portas que as destravaram. Ficam separadas das árvores de propósito — uma Combinada não pertence a nenhuma das duas escolas que a geraram, e listar o Meteoro dentro de Fogo faria o jogador procurá-lo em Terra na metade das vezes.",
          "NO PDF: elas entram no mesmo bloco de cartas das magias, marcadas com ◇, e a linha de alcance mostra as duas árvores de origem. Na mesa elas se usam como qualquer outra magia; separá-las faria procurar em dois lugares.",
        ],
      },
      {
        heading: "Correções",
        items: [
          "TRÊS das nove magias apontavam para a árvore \"curar\", que nunca existiu — o id é \"cura\". O livro imprimia a coluna da árvore vazia nessas três, e nenhuma verificação pegava porque nada no código lia o campo. Um teste novo trava isso: toda porta de toda Combinada tem que apontar para uma árvore que existe.",
          "Migração v11 do persist: fichas antigas entram com a lista de Combinadas vazia.",
          "33 testes no total (eram 28), cinco deles cobrindo as duas portas, o PA e a compra duplicada.",
        ],
      },
    ],
  },
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
