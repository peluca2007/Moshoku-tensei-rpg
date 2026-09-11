import { RankName } from "@/lib/types";

/**
 * Cap. 5, §5: o SISTEMA DE DOJO — a progressão que não se compra, se procura.
 *
 * ## O que ele resolve
 *
 * Até aqui, PA era a única porta de toda a progressão do livro: tudo que um
 * personagem vira, ele vira gastando pontos. Isso funciona, e tem um custo que
 * só aparece depois de umas vinte sessões — **o mundo deixa de importar para a
 * ficha**. Você pode jogar a campanha inteira numa taverna e progredir igual a
 * quem atravessou o continente.
 *
 * O Dojo inverte isso para uma fatia da árvore: certos nós são **fechados a
 * chave**, e a chave é uma pessoa. Não tem preço em PA, não tem downtime que
 * resolva, não tem loja que venda. Você encontra o mestre, ou não abre.
 *
 * ## A régua que este arquivo estabelece
 *
 * O livro nunca disse quanto PA um personagem ganha por quê — só que começa com
 * 3 e que "PA vem de jogar a campanha" (Cap. 5, §1). O Dojo é a primeira fonte
 * de PA **declarada em número** do sistema inteiro, e por isso os valores daqui
 * viram, na prática, a régua de toda a economia: qualquer concessão futura vai
 * ser comparada a eles. Foi por isso que a recompensa passou a escalar com o
 * patamar em vez de ser fixa — ver `RECOMPENSA_POR_PATAMAR`.
 */

/**
 * O que o mestre exige do aluno ANTES de aceitar ensinar (Cap. 5, §5).
 *
 * A regra de dois patamares não é burocracia: ela existe pra que o Dojo nunca
 * seja uma troca entre iguais. Quem está um patamar acima de você é um colega
 * com mais estrada — pode te dar conselho, não pode te abrir a mente.
 */
export const REQUISITO_DE_PATAMAR = 2;

/**
 * As duas exceções que ignoram o requisito de patamar.
 *
 * Ambas existem pelo mesmo motivo: a distância entre mestre e aluno já é
 * absurda o bastante pra que contar patamares não signifique nada.
 */
export const EXCECOES_DE_HIERARQUIA = [
  {
    nome: "Divindade",
    texto:
      "Entidades divinas ensinam qualquer um, em qualquer patamar. Um Deus não está dois patamares acima de você: ele está fora da escada.",
  },
  {
    nome: "Salto de patente narrativa",
    texto:
      "Um Imperador ensinando um Rei vale, mesmo sendo um só patamar de diferença. O que conta aqui é o título, não a aritmética — e a distância entre um Rei e um Imperador é maior que a distância entre dois patamares quaisquer lá embaixo.",
  },
];

/**
 * Quanto vale concluir uma provação, por patamar do ALUNO.
 *
 * ## Por que não é fixo em 3 PA
 *
 * Um personagem de 3º patamar tem cerca de 12 PA no total; um de 5º, cerca de
 * 24. Uma recompensa fixa de 3 PA é **25% do patrimônio** do primeiro e 12% do
 * segundo — ou seja, a mesma provação vale o dobro pra quem precisa menos dela.
 * Pior: ela deixa de ser notícia exatamente quando a ficção quer que um mestre
 * seja um evento (o Deus, o Imperador, o dojo escondido no fim do mundo).
 *
 * ## Por que a razão é 2:1, e não 3:1
 *
 * A proposta original era 3 PA travados contra 1 PA livre. Isso não é um
 * dilema — é uma escolha óbvia pra qualquer um que pretenda usar a árvore nova,
 * e os 3 PA travados equivalem a um patamar e meio dela (desbloquear
 * Intermediário custa 1, Avançado 2). A 2:1, o PA livre volta a competir:
 * ele vale mais por unidade, e vale onde você já tem Bônus de Rank.
 */
export const RECOMPENSA_POR_PATAMAR: {
  patamares: RankName[];
  travados: number;
  livre: number;
}[] = [
  { patamares: ["Principiante", "Intermediário"], travados: 2, livre: 1 },
  // 3:2, e não 3:1 — o próprio teste desta tabela pegou a incoerência: a faixa
  // do meio tinha nascido na razão que este arquivo critica duas linhas acima.
  // O acidente saiu melhor que o plano: é no meio da campanha que o jogador já
  // sabe o que quer da ficha, e é exatamente onde o dilema deve apertar mais.
  { patamares: ["Avançado", "Santo"], travados: 3, livre: 2 },
  { patamares: ["Rei", "Imperador", "Deus"], travados: 4, livre: 2 },
];

/**
 * A terceira opção do Dilema — a que não é PA nenhum (0.1.54).
 *
 * Duas quantidades da mesma moeda fazem uma conta, não uma escolha: o jogador
 * calcula qual número é maior e pronto. A Marca do Mestre existe pra que a
 * terceira porta seja de outra natureza — ela não acelera a ficha, ela muda o
 * que o personagem É no mundo, e nenhuma das outras duas compra isso de volta.
 */
export const MARCA_DO_MESTRE = {
  nome: "A Marca do Mestre",
  texto:
    "Nenhum PA. Em vez disso você recebe o sinal daquele mestre — uma cicatriz, uma tatuagem, uma corda trançada, um nome — e com ele a Maestria pessoal dele (um passivo pequeno, escrito pelo Mestre da mesa), mais o direito de voltar ao dojo: uma vez por arco de campanha, você pode pedir uma segunda provação, e ela concede a recompensa cheia do seu patamar atual. Quem escolhe a Marca está trocando poder agora por uma porta que continua aberta.",
};

/**
 * As travas do sistema. Sem elas o Dojo vira farm.
 */
export const LIMITES = [
  "Uma provação por árvore, uma vez na vida do personagem. Concluir o dojo do Deus do Arco abre a Arquearia para sempre — e nunca mais dá PA.",
  "Um mestre não ensina o que ele não é. O Deus do Arco não abre Magia de Fogo, por mais que goste de você.",
  "A provação é do GRUPO, mas a escolha do Dilema é de cada jogador, em segredo se a mesa preferir. Dois personagens podem sair do mesmo dojo com recompensas diferentes.",
  "PA travado nunca destrava. Se o personagem abandonar a árvore, aquele PA morre com ela — é o preço de ter escolhido o número maior.",
];

/**
 * Uma provação de mestre, pronta pra mesa.
 *
 * O campo que importa mais é `quebra`: toda provação boa **tira dos jogadores a
 * coisa em que eles são bons**. O Deus do Arco não pediu que o arqueiro
 * atirasse melhor — ele obrigou o espadachim e o mago a atirar, e é dali que a
 * sessão tira o que ela tem de memorável.
 */
export interface Provacao {
  id: string;
  /** O nome pelo qual a mesa vai chamar essa sessão depois. */
  nome: string;
  mestre: string;
  /** O que o título dele é, pra conferir o requisito de patamar. */
  patenteDoMestre: string;
  /** A árvore que a provação abre. */
  abre: string;
  /** O paradigma que a provação PROÍBE — o coração da coisa. */
  quebra: string;
  /** O que acontece na sessão. */
  provacao: string;
  /** A regra caseira que só vale durante a provação. */
  regraDaCasa: string;
  /** Como o mestre decide que você passou — nunca é "matou o monstro". */
  criterio: string;
}

export const PROVACOES: Provacao[] = [
  {
    id: "deus-do-arco",
    nome: "O Deus do Arco",
    mestre: "O Deus do Arco",
    patenteDoMestre: "Divindade — ignora o requisito de patamar",
    abre: "Arquearia",
    quebra:
      "Ninguém pode tocar numa arma que não seja de disparo. O espadachim, o lutador, o mago — todos com arco na mão, todos igualmente ruins.",
    provacao:
      "Caçar uma criatura rápida demais pra ser acertada por reflexo. Ela não pode ser encurralada, não pode ser cercada, e foge de qualquer um que ela veja mirar. A única forma de acertá-la é o Tiro Perfeito (Cap. 3, §3) — o que significa preparar durante turnos enquanto ela se move.",
    regraDaCasa:
      "Durante a provação, a etapa da Leitura pode ser rolada com INTUIÇÃO por qualquer um, mesmo sem a árvore. O Deus do Arco está ensinando exatamente isso: não a mira, a previsão.",
    criterio:
      "Um único acerto, do grupo inteiro, com as quatro etapas concluídas. Não importa quem atirou — importa que alguém tenha parado de tentar acertar e começado a prever.",
  },
  {
    id: "a-que-nao-deixa-rastro",
    nome: "A Que Não Deixa Rastro",
    mestre: "A Que Não Deixa Rastro",
    patenteDoMestre: "Rainha dos Ladrões — dois patamares acima do grupo",
    abre: "Furtividade e Armadilhas",
    quebra:
      "Nenhum ponto de dano. Durante a provação inteira, reduzir os PV de qualquer criatura é falha automática — e isso inclui o dano acidental, o incêndio que se alastrou, o guarda que caiu da muralha.",
    provacao:
      "Roubar um objeto de uma casa habitada e devolvê-lo três dias depois, no mesmo lugar, sem que ninguém tenha notado nenhuma das duas visitas. A mestra não diz qual objeto: diz o nome da casa. Descobrir o que vale a pena levar é metade da prova.",
    regraDaCasa:
      "Todo teste que envolva ser visto usa a MENOR Agilidade do grupo, não a de quem está rolando. Quem passou a campanha inteira de armadura pesada descobre o que ele custa aos outros, e o grupo descobre que furtividade não é uma perícia — é uma decisão de todo mundo.",
    criterio:
      "A casa nunca soube. Se alguém morreu, se alguém acordou, se a guarda foi chamada, ou se o objeto foi devolvido no lugar errado, a mestra simplesmente não aparece no terceiro dia — e a mesa fica sem saber se ela chegou a olhar.",
  },
  {
    id: "o-que-recita-devagar",
    nome: "O Que Recita Devagar",
    mestre: "O Que Recita Devagar",
    patenteDoMestre: "Arquimago Imperador — ensina um Rei pelo salto de patente",
    abre: "Uma escola de magia à escolha do grupo, decidida na primeira hora da sessão",
    quebra:
      "Conjuração sem cântico está proibida. Toda magia tem que ser recitada em voz alta pelo JOGADOR, na mesa, no tempo que o cântico levar — e o mestre conta os turnos enquanto a pessoa fala.",
    provacao:
      "Manter uma coisa funcionando enquanto o mundo tenta interrompê-la: uma barreira sobre uma vila, uma chama num farol, uma corrente de água num aqueduto seco. Não é uma luta — é um plantão de uma noite inteira, em que o combate é o que aparece pra tirar a concentração de quem está conjurando.",
    regraDaCasa:
      "Ninguém gasta o próprio PM. A mana sai de uma reserva comum na mesa, que o grupo inteiro divide e que não regenera até o amanhecer. O guerreiro que nunca olhou pra um número de PM passa a noite vendo o mago decidir se pode ou não gastar.",
    criterio:
      "A coisa ainda estava funcionando quando amanheceu. O mestre não pergunta quantos inimigos caíram: ele pergunta se a chama apagou em algum momento, e espera a resposta olhando pro chão.",
  },
  {
    id: "o-que-nunca-ataca",
    nome: "O Que Nunca Ataca",
    mestre: "O Que Nunca Ataca",
    patenteDoMestre: "Santo do Escudo — dois patamares acima do grupo",
    abre: "Cavalaria e Escudos, ou Suishin-ryū (Deus da Água), à escolha de cada aluno",
    quebra:
      "Você não tem turno. Durante a provação, nenhum personagem age no próprio turno: só em REAÇÃO, e só ao que o inimigo fizer. Quem não tem Reação nenhuma na ficha descobre isso da pior forma possível.",
    provacao:
      "Atravessar um desfiladeiro carregando alguém que não pode ser tocado — um ferido, uma criança, um relicário — enquanto o que mora ali tenta tirá-lo de vocês. O objetivo nunca é vencer a criatura: é chegar do outro lado com a carga intacta.",
    regraDaCasa:
      "Cada personagem recebe 2 Reações por rodada em vez de 1, e pode gastá-las em qualquer coisa que o livro permita como Reação. Em compensação, dano causado não conta pra nada: a criatura não morre, ela se afasta quando é bem respondida e volta quando não é.",
    criterio:
      "A carga chegou inteira. O mestre não conta os ferimentos de ninguém — conta os da coisa que vocês carregaram, e um só já é falha.",
  },
];
