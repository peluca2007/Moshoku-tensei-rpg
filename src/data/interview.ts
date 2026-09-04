/**
 * Via 3 de criação de personagem — "A Entrevista (O Destino)". Perguntas abstratas sobre a
 * infância do personagem; cada resposta empurra o sorteio final de raça/antecedente na direção
 * de alguns arquétipos, sem nunca citar a mecânica de propósito (Cap. 1: infância define potencial).
 */
export interface InterviewOption {
  id: string;
  text: string;
  /** ids de RACES empurrados por esta resposta. */
  raceIds?: string[];
  /** ids de BACKGROUNDS empurrados por esta resposta. */
  backgroundIds?: string[];
}

export interface InterviewQuestion {
  id: string;
  prompt: string;
  options: InterviewOption[];
}

/**
 * Pool de 20 perguntas, com 6 respostas cada. O site sorteia 10 perguntas por
 * Entrevista e, dentro de cada uma, 4 das 6 respostas — então nem a pergunta
 * que mais importaria pra sua build, nem a resposta, têm garantia de aparecer.
 * Duas Entrevistas seguidas não são a mesma tela com outra ordem.
 */
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "tarde-chuvosa",
    prompt: "O que você fazia quando era criança nas tardes chuvosas?",
    options: [
      { id: "a", text: "Ficava na janela contando quantas vezes o trovão vinha antes do relâmpago.", backgroundIds: ["estudioso-precoce"], raceIds: ["migurd"] },
      { id: "b", text: "Desmontava qualquer coisa que tivesse uma dobradiça, só pra ver como fechava de novo.", backgroundIds: ["aprendiz-mercador"], raceIds: ["anao"] },
      { id: "c", text: "Inventava nomes e histórias pra sombras que ninguém mais via.", backgroundIds: ["miko", "fator-laplace"], raceIds: [] },
      { id: "d", text: "Ia ajudar meus pais mesmo sem ninguém pedir, só pra não ficar parado.", backgroundIds: ["plebeu"], raceIds: ["humano"] },
      { id: "e", text: "Ficava ouvindo a chuva bater e conseguia dizer, sem olhar, quando ia parar.", backgroundIds: ["olho-mistico"], raceIds: ["oceano"] },
      { id: "f", text: "Repetia o mesmo movimento com um pedaço de pau até doer o braço.", backgroundIds: ["treino-precoce"], raceIds: ["superd"] },
    ],
  },
  {
    id: "briga-injusta",
    prompt: "Quando alguém maior implicava com você sem motivo, o que você fazia primeiro?",
    options: [
      { id: "a", text: "Congelava e tentava entender o que eu tinha feito de errado.", backgroundIds: ["sobrevivente", "orfao"], raceIds: [] },
      { id: "b", text: "Respondia igual, mesmo sabendo que ia perder.", backgroundIds: ["treino-precoce"], raceIds: ["ogro"] },
      { id: "c", text: "Ria, porque nunca me pareceu tão sério quanto os outros achavam.", backgroundIds: [], raceIds: ["hobbit", "raca-fera"] },
      { id: "d", text: "Prometia a mim mesmo que um dia iam se arrepender.", backgroundIds: ["fator-laplace"], raceIds: ["dragao"] },
      { id: "e", text: "Deixava acontecer, e depois lembrava do nome. Só o nome.", backgroundIds: ["miko"], raceIds: ["demonio-imortal"] },
      { id: "f", text: "Chamava um adulto — sempre houve alguém disposto a me ouvir.", backgroundIds: ["sangue-nobre"], raceIds: ["humano"] },
    ],
  },
  {
    id: "casa-infancia",
    prompt: "O que mais te incomodava na casa em que você cresceu?",
    options: [
      { id: "a", text: "O silêncio — eu preferia qualquer barulho a isso.", backgroundIds: ["orfao"], raceIds: ["celestial"] },
      { id: "b", text: "Ter regras que ninguém explicava o porquê.", backgroundIds: ["sangue-nobre"], raceIds: ["superd"] },
      { id: "c", text: "Não ter livros o suficiente.", backgroundIds: ["estudioso-precoce"], raceIds: ["elfo"] },
      { id: "d", text: "Nada — eu mal ficava em casa.", backgroundIds: ["crianca-selvagem"], raceIds: ["raca-fera"] },
      { id: "e", text: "Que ela fosse cheia demais. Eu queria uma parede minha.", backgroundIds: ["aprendiz-mercador"], raceIds: ["anao"] },
      { id: "f", text: "Que não fosse uma casa. A gente dormia onde dava.", backgroundIds: ["orfao", "crianca-selvagem"], raceIds: ["raca-fera"] },
    ],
  },
  {
    id: "animal-ferido",
    prompt: "Se um animal ferido aparecesse na sua porta, o que você faria?",
    options: [
      { id: "a", text: "Cuidava dele escondido, com medo de que mandassem embora.", backgroundIds: ["acolito", "miko"], raceIds: [] },
      { id: "b", text: "Chamava todo mundo pra ver — eu queria mostrar que sabia cuidar.", backgroundIds: ["aprendiz-mercador", "sangue-nobre"], raceIds: [] },
      { id: "c", text: "Estudava o ferimento antes de tocar, tentando entender a causa.", backgroundIds: ["estudioso-precoce"], raceIds: ["migurd"] },
      { id: "d", text: "Sabia exatamente o que fazer sem pensar, como se já tivesse feito antes.", backgroundIds: [], raceIds: ["oceano", "demonio-imortal"] },
      { id: "e", text: "Punha a mão em cima e ficava assim, sem saber por quê. Às vezes melhorava.", backgroundIds: ["fator-laplace"], raceIds: ["celestial"] },
      { id: "f", text: "Olhava até entender exatamente onde estava quebrado.", backgroundIds: ["estudioso-precoce"], raceIds: ["anao"] },
    ],
  },
  {
    id: "sem-dormir",
    prompt: "O que você fazia quando não conseguia dormir?",
    options: [
      { id: "a", text: "Ficava repassando conversas do dia, imaginando o que deveria ter dito.", backgroundIds: ["sangue-nobre"], raceIds: ["superd"] },
      { id: "b", text: "Saía andando sozinho, mesmo sabendo que não devia.", backgroundIds: ["orfao"], raceIds: ["hobbit"] },
      { id: "c", text: "Contava algo em voz baixa pra mim mesmo até cansar.", backgroundIds: ["miko", "fator-laplace"], raceIds: [] },
      { id: "d", text: "Dormia em segundos — nunca foi problema meu.", backgroundIds: ["treino-precoce"], raceIds: ["ogro"] },
      { id: "e", text: "Repassava a mesma conversa de novo e de novo, mudando o que eu tinha dito.", backgroundIds: ["estudioso-precoce"], raceIds: ["migurd"] },
      { id: "f", text: "Saía. A noite era o único horário em que a rua era minha.", backgroundIds: ["crianca-selvagem"], raceIds: ["raca-fera"] },
    ],
  },
  {
    id: "perder-jogo",
    prompt: "Qual era a sua reação quando perdia em algum jogo com outras crianças?",
    options: [
      { id: "a", text: "Insistia pra jogar de novo até ganhar.", backgroundIds: ["treino-precoce"], raceIds: ["ogro"] },
      { id: "b", text: "Fingia que não me importava, mas lembrava do placar por anos.", backgroundIds: ["sangue-nobre"], raceIds: ["dragao"] },
      { id: "c", text: "Ficava mais interessado em como o vencedor tinha feito do que em ter perdido.", backgroundIds: ["estudioso-precoce", "aprendiz-mercador"], raceIds: [] },
      { id: "d", text: "Nem sempre entendia que era pra competir.", backgroundIds: [], raceIds: ["hobbit", "celestial"] },
      { id: "e", text: "Fingia que não tinha ligado, e treinava escondido até ganhar.", backgroundIds: ["treino-precoce"], raceIds: ["humano"] },
      { id: "f", text: "Perguntava as regras de novo. Elas nunca faziam sentido do mesmo jeito duas vezes.", backgroundIds: ["crianca-selvagem"], raceIds: ["migurd"] },
    ],
  },
  {
    id: "boatos",
    prompt: "O que outras crianças diziam sobre você pelas suas costas — e você sabia que diziam?",
    options: [
      { id: "a", text: "Que eu era estranho, mas ninguém sabia dizer por quê.", backgroundIds: ["fator-laplace"], raceIds: ["superd"] },
      { id: "b", text: "Que eu sempre sabia de tudo antes de todo mundo.", backgroundIds: ["olho-mistico"], raceIds: ["migurd"] },
      { id: "c", text: "Que eu desaparecia sem ninguém perceber, quando eu queria.", backgroundIds: ["orfao"], raceIds: ["hobbit"] },
      { id: "d", text: "Nada — eu não tinha muito contato com outras crianças.", backgroundIds: ["crianca-selvagem"], raceIds: ["dragao"] },
      { id: "e", text: "Que eu tinha nascido errado. Que alguma coisa em mim não fechava.", backgroundIds: ["fator-laplace"], raceIds: ["demonio-imortal"] },
      { id: "f", text: "Que eu era forte demais pro meu tamanho — e isso era verdade.", backgroundIds: ["treino-precoce"], raceIds: ["ogro", "superd"] },
    ],
  },
  {
    id: "historia-adulto",
    prompt: "Quando um adulto contava uma história, o que prendia a sua atenção?",
    options: [
      { id: "a", text: "Os detalhes que não faziam sentido, até eu descobrir a explicação.", backgroundIds: ["estudioso-precoce"], raceIds: ["migurd"] },
      { id: "b", text: "As partes sobre reis, guerras e quem tinha razão.", backgroundIds: ["sangue-nobre", "acolito"], raceIds: [] },
      { id: "c", text: "O jeito como a voz da pessoa mudava quando tinha medo de verdade.", backgroundIds: ["miko", "olho-mistico"], raceIds: [] },
      { id: "d", text: "Nada — eu preferia estar fazendo algo do que ouvindo.", backgroundIds: [], raceIds: ["raca-fera", "ogro"] },
      { id: "e", text: "O nome dos que já tinham morrido. Eu queria saber de quem eu vinha.", backgroundIds: ["sangue-nobre"], raceIds: ["anao", "elfo"] },
      { id: "f", text: "Nada. Eu já sabia o final antes de ele contar, e não sabia explicar como.", backgroundIds: ["fator-laplace", "olho-mistico"], raceIds: [] },
    ],
  },
  {
    id: "pouco-dinheiro",
    prompt: "O que você fazia com o pouco dinheiro que conseguia?",
    options: [
      { id: "a", text: "Guardava tudo, mesmo sem saber pra quê.", backgroundIds: ["aprendiz-mercador"], raceIds: ["anao"] },
      { id: "b", text: "Gastava rápido — nunca confiei que ia durar.", backgroundIds: ["orfao", "plebeu"], raceIds: [] },
      { id: "c", text: "Trocava por informação: sempre alguém sabia de algo que valia mais.", backgroundIds: ["fator-laplace"], raceIds: ["superd"] },
      { id: "d", text: "Nunca tive dinheiro de verdade pra pensar nisso.", backgroundIds: ["crianca-selvagem", "sobrevivente"], raceIds: [] },
      { id: "e", text: "Guardava tudo. Nunca gastei — só olhava aumentar.", backgroundIds: ["aprendiz-mercador"], raceIds: ["anao"] },
      { id: "f", text: "Dava pra quem precisava mais, e depois passava fome achando bonito.", backgroundIds: ["acolito"], raceIds: ["celestial"] },
    ],
  },
  {
    id: "loucura",
    prompt: "Existe algo que você fazia na infância que hoje pareceria loucura contar pra alguém?",
    options: [
      { id: "a", text: "Conversava com algo que eu jurava que me respondia.", backgroundIds: ["miko", "olho-mistico", "fator-laplace"], raceIds: [] },
      { id: "b", text: "Treinava sozinho até doer, escondido, todos os dias.", backgroundIds: ["treino-precoce"], raceIds: ["dragao"] },
      { id: "c", text: "Fugia de casa por dias e voltava como se nada tivesse acontecido.", backgroundIds: ["crianca-selvagem"], raceIds: ["raca-fera"] },
      { id: "d", text: "Nada — minha infância foi absolutamente comum.", backgroundIds: ["plebeu"], raceIds: ["humano"] },
      { id: "e", text: "Eu falava com alguém que ninguém via, e ele respondia coisas que se confirmavam.", backgroundIds: ["miko"], raceIds: ["migurd"] },
      { id: "f", text: "Eu me machucava de propósito, só pra ver quanto tempo levava pra sarar.", backgroundIds: ["fator-laplace"], raceIds: ["demonio-imortal", "superd"] },
    ],
  },
  {
    id: "seguranca",
    prompt: "O que te fazia sentir seguro quando criança?",
    options: [
      { id: "a", text: "Saber exatamente quem estava no comando.", backgroundIds: ["sangue-nobre"], raceIds: ["ogro"] },
      { id: "b", text: "Estar perto de água ou de um lugar bem aberto.", backgroundIds: [], raceIds: ["oceano", "elfo"] },
      { id: "c", text: "Ter certeza de que conseguia fugir se precisasse.", backgroundIds: ["orfao"], raceIds: ["hobbit"] },
      { id: "d", text: "Nada em especial — a sensação nunca durava muito mesmo.", backgroundIds: [], raceIds: ["demonio-imortal", "superd"] },
      { id: "e", text: "Um lugar alto, de onde eu via quem estava chegando.", backgroundIds: ["sobrevivente"], raceIds: ["hobbit"] },
      { id: "f", text: "Nada. Eu nunca me senti seguro, e parei de esperar por isso cedo.", backgroundIds: ["orfao", "sobrevivente"], raceIds: [] },
    ],
  },
  {
    id: "mudar-infancia",
    prompt: "Se pudesse escolher de novo, o que você faria diferente na sua infância?",
    options: [
      { id: "a", text: "Teria feito mais perguntas, mesmo sabendo que ninguém ia responder.", backgroundIds: ["estudioso-precoce"], raceIds: ["celestial"] },
      { id: "b", text: "Teria confiado menos em quem eu confiei.", backgroundIds: ["sobrevivente"], raceIds: ["superd"] },
      { id: "c", text: "Nada — faria tudo exatamente igual.", backgroundIds: ["fator-laplace"], raceIds: ["dragao"] },
      { id: "d", text: "Teria aprendido a lutar mais cedo.", backgroundIds: ["treino-precoce"], raceIds: ["ogro"] },
      { id: "e", text: "Nada. Cada coisa ruim me trouxe até aqui, e eu preciso acreditar nisso.", backgroundIds: ["sobrevivente"], raceIds: ["superd"] },
      { id: "f", text: "Teria aprendido a ler antes. Perdi anos sem saber o que estava escrito.", backgroundIds: ["estudioso-precoce", "genio"], raceIds: ["migurd"] },
    ],
  },
  {
    id: "injustica",
    prompt: "Quando via alguém sendo injustiçado, o que você fazia?",
    options: [
      { id: "a", text: "Intervinha mesmo sem chance de vencer.", backgroundIds: ["treino-precoce"], raceIds: ["dragao"] },
      { id: "b", text: "Anotava mentalmente quem fez o quê, pra usar depois.", backgroundIds: ["fator-laplace"], raceIds: ["superd"] },
      { id: "c", text: "Ficava do lado de quem sofreu, em silêncio, sem dizer nada em voz alta.", backgroundIds: ["acolito", "sobrevivente"], raceIds: [] },
      { id: "d", text: "Ia embora — não era problema meu.", backgroundIds: [], raceIds: ["hobbit", "migurd"] },
      { id: "e", text: "Entrava no meio, mesmo sabendo que ia apanhar junto.", backgroundIds: ["treino-precoce"], raceIds: ["superd", "ogro"] },
      { id: "f", text: "Anotava. Um dia aquilo ia servir pra alguma coisa.", backgroundIds: ["aprendiz-mercador"], raceIds: ["humano"] },
    ],
  },
  {
    id: "sozinho",
    prompt: "O que você fazia sozinho, sem ninguém saber?",
    options: [
      { id: "a", text: "Desenhava mapas de lugares que eu nunca tinha visitado.", backgroundIds: ["aprendiz-mercador", "estudioso-precoce"], raceIds: [] },
      { id: "b", text: "Praticava conversas que eu nunca tive coragem de ter de verdade.", backgroundIds: ["sangue-nobre", "orfao"], raceIds: [] },
      { id: "c", text: "Ficava horas olhando pro nada, sem pensar em nada específico.", backgroundIds: ["olho-mistico"], raceIds: ["celestial"] },
      { id: "d", text: "Testava até onde meu corpo aguentava.", backgroundIds: [], raceIds: ["ogro", "raca-fera"] },
      { id: "e", text: "Encostava a mão em coisas velhas pra sentir quem tinha tocado nelas antes.", backgroundIds: ["olho-mistico"], raceIds: ["migurd"] },
      { id: "f", text: "Cavava. Fundo, sem motivo, só pra ver o que tinha embaixo.", backgroundIds: ["crianca-selvagem"], raceIds: ["anao"] },
    ],
  },
  {
    id: "primeiro-medo",
    prompt: "Qual foi o primeiro medo que você lembra de ter tido?",
    options: [
      { id: "a", text: "O escuro no fim do corredor — e a certeza de que ele tinha fundo.", backgroundIds: ["miko"], raceIds: ["demonio-imortal"] },
      { id: "b", text: "Fome. Não a de um dia; a de não saber quando vinha a próxima.", backgroundIds: ["orfao", "sobrevivente"], raceIds: [] },
      { id: "c", text: "Ficar burro. De acordar um dia sem saber o que eu sabia na véspera.", backgroundIds: ["miko", "estudioso-precoce"], raceIds: ["migurd"] },
      { id: "d", text: "Água funda. Todo mundo achava graça, menos eu.", backgroundIds: ["plebeu"], raceIds: ["oceano"] },
      { id: "e", text: "Decepcionar meu pai. O resto vinha depois disso.", backgroundIds: ["sangue-nobre", "treino-precoce"], raceIds: ["humano"] },
      { id: "f", text: "Nenhum que eu lembre. E isso assustava os adultos mais que qualquer medo.", backgroundIds: ["fator-laplace", "miko"], raceIds: ["superd"] },
    ],
  },
  {
    id: "maos-sujas",
    prompt: "No fim de um dia bom da sua infância, com o que suas mãos estavam sujas?",
    options: [
      { id: "a", text: "Terra até o cotovelo, e alguma coisa viva dentro do bolso.", backgroundIds: ["crianca-selvagem"], raceIds: ["raca-fera", "hobbit"] },
      { id: "b", text: "Tinta. Sempre tinta, e eu nunca conseguia tirar toda.", backgroundIds: ["estudioso-precoce"], raceIds: ["elfo"] },
      { id: "c", text: "Fuligem e limalha — eu passava o dia perto de quem batia metal.", backgroundIds: ["aprendiz-mercador"], raceIds: ["anao"] },
      { id: "d", text: "Nada. Minhas mãos eram limpas, e isso era exigido.", backgroundIds: ["sangue-nobre"], raceIds: ["humano", "celestial"] },
      { id: "e", text: "Sangue que não era meu, e eu não sabia explicar de onde tinha vindo.", backgroundIds: ["fator-laplace", "miko"], raceIds: ["demonio-imortal"] },
      { id: "f", text: "Calos. Já tinha calo antes de ter idade pra isso.", backgroundIds: ["miko", "treino-precoce"], raceIds: ["ogro", "superd"] },
    ],
  },
  {
    id: "adulto-marcante",
    prompt: "Teve um adulto que te marcou. O que ele fez?",
    options: [
      { id: "a", text: "Me ensinou uma coisa difícil sem nunca me chamar de burro.", backgroundIds: ["estudioso-precoce", "genio"], raceIds: ["migurd"] },
      { id: "b", text: "Me bateu uma vez só, e eu nunca mais confiei em ninguém do tamanho dele.", backgroundIds: ["sobrevivente", "miko"], raceIds: [] },
      { id: "c", text: "Foi embora sem explicar. Passei anos montando a explicação sozinho.", backgroundIds: ["orfao"], raceIds: ["humano"] },
      { id: "d", text: "Me levou pra ver uma coisa que eu não devia ter visto.", backgroundIds: ["olho-mistico", "fator-laplace"], raceIds: [] },
      { id: "e", text: "Rezou comigo todo dia, mesmo quando eu já não acreditava.", backgroundIds: ["acolito"], raceIds: ["celestial"] },
      { id: "f", text: "Me colocou pra treinar antes de eu saber o que era treinar.", backgroundIds: ["treino-precoce"], raceIds: ["superd", "raca-fera"] },
    ],
  },
  {
    id: "objeto-guardado",
    prompt: "Você guardava alguma coisa que não valia nada pra mais ninguém. O que era?",
    options: [
      { id: "a", text: "Uma pedra com um desenho dentro, que eu achei sozinho.", backgroundIds: ["aprendiz-mercador"], raceIds: ["anao"] },
      { id: "b", text: "Um pedaço de pano da roupa de alguém que não voltou.", backgroundIds: ["orfao", "miko"], raceIds: [] },
      { id: "c", text: "Uma lista. Eu anotava tudo, e reli aquilo por anos.", backgroundIds: ["estudioso-precoce", "aprendiz-mercador"], raceIds: ["migurd"] },
      { id: "d", text: "Um dente. Não era meu, e eu sabia de quem era.", backgroundIds: ["fator-laplace", "miko"], raceIds: ["demonio-imortal"] },
      { id: "e", text: "Uma pena. Achei que um dia ela ia servir pra alguma coisa.", backgroundIds: ["miko"], raceIds: ["celestial", "elfo"] },
      { id: "f", text: "Nada. Eu aprendi cedo que guardar coisa é dar motivo pra tirarem de você.", backgroundIds: ["sobrevivente", "crianca-selvagem"], raceIds: ["raca-fera"] },
    ],
  },
  {
    id: "silencio",
    prompt: "Teve uma coisa que você nunca contou pra ninguém. Por quê?",
    options: [
      { id: "a", text: "Porque ninguém ia acreditar — e um dia eu ia precisar que acreditassem.", backgroundIds: ["fator-laplace", "olho-mistico"], raceIds: [] },
      { id: "b", text: "Porque a culpa era minha, e falar não desfaria.", backgroundIds: ["miko", "sobrevivente"], raceIds: ["humano"] },
      { id: "c", text: "Porque eu sabia o que os outros estavam pensando, e isso não se diz.", backgroundIds: ["olho-mistico"], raceIds: ["migurd"] },
      { id: "d", text: "Porque contar acabaria com a única coisa que era só minha.", backgroundIds: ["estudioso-precoce"], raceIds: ["elfo"] },
      { id: "e", text: "Porque doeu, e eu descobri que dói menos se você não repete.", backgroundIds: ["fator-laplace"], raceIds: ["demonio-imortal"] },
      { id: "f", text: "Eu contei. Contei pra todo mundo, e ninguém deu importância.", backgroundIds: ["plebeu"], raceIds: ["hobbit"] },
    ],
  },
  {
    id: "quando-crescer",
    prompt: "Quando perguntavam o que você queria ser, o que você respondia?",
    options: [
      { id: "a", text: "Que eu queria saber tudo. Não parte — tudo.", backgroundIds: ["genio", "estudioso-precoce"], raceIds: ["migurd"] },
      { id: "b", text: "Que eu queria ser o mais forte, e falava sério.", backgroundIds: ["miko", "treino-precoce"], raceIds: ["ogro", "superd"] },
      { id: "c", text: "Que eu queria ir embora. O ofício era o de menos.", backgroundIds: ["crianca-selvagem"], raceIds: ["raca-fera", "hobbit"] },
      { id: "d", text: "Que eu queria consertar gente. Vi coisa demais que ninguém consertou.", backgroundIds: ["acolito", "fator-laplace"], raceIds: ["celestial"] },
      { id: "e", text: "Que eu queria ter o que a minha família teve antes de perder.", backgroundIds: ["fator-laplace", "sangue-nobre"], raceIds: ["anao", "elfo"] },
      { id: "f", text: "Eu não respondia. Não me parecia uma pergunta séria.", backgroundIds: ["fator-laplace", "miko"], raceIds: ["superd"] },
    ],
  },
];

export const INTERVIEW_QUESTION_COUNT = 10;

/**
 * Modo da Entrevista, escolhido antes da 1ª pergunta (pedido do usuário, 2026-08-28):
 * - "ambos": comportamento original — as respostas pesam a loteria de Raça E de Antecedente.
 * - "antecedente": o jogador escolhe a Raça na mão antes de começar, e as respostas
 *   pesam só a loteria de Antecedente. Serve pra quem já sabe o que quer ser, mas
 *   quer descobrir de onde veio.
 */
export type InterviewMode = "ambos" | "antecedente";

/** Um candidato da loteria com o peso de raridade dele (ver `weightedPick`). */
export interface LotteryEntry {
  id: string;
  /** Peso base = quão comum o resultado é no mundo. 0 = fora do sorteio (ex: Dragão). */
  weight: number;
}

export interface InterviewResult {
  /** null no modo "antecedente" — a Raça já foi escolhida na mão, não sorteada. */
  raceId: string | null;
  backgroundId: string;
  raceWeights: Record<string, number>;
  backgroundWeights: Record<string, number>;
}

/**
 * Quantas das seis respostas de cada pergunta aparecem numa Entrevista (0.1.11).
 *
 * Sortear a pergunta já era feito; sortear a RESPOSTA é o que faz duas
 * Entrevistas com as mesmas dez perguntas ainda serem entrevistas diferentes.
 * Antes disso, quem fizesse a Via 3 duas vezes reconhecia as quatro opções de
 * cor e escolhia por memória, não por leitura — e a Entrevista existe
 * justamente pra ser lida.
 *
 * Quatro de seis, e não seis de seis: uma tela com seis parágrafos abstratos
 * vira uma tabela pra comparar, em vez de uma pergunta pra responder. O corte
 * também é o que dá à Entrevista a mesma promessa da Roleta — a resposta que
 * mais pesaria pra sua build pode simplesmente não estar ali.
 */
export const INTERVIEW_OPTION_COUNT = 4;

/** Fisher-Yates parcial, usado tanto pras perguntas quanto pras respostas. */
function sortear<T>(itens: readonly T[], quantos: number): T[] {
  const pool = [...itens];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(quantos, pool.length));
}

/**
 * Sorteia N perguntas do pool — e, dentro de cada uma, quais respostas aparecem.
 *
 * As respostas voltam na ORDEM ORIGINAL depois de sorteadas (o `sort` no fim).
 * Sem isso, a opção que empurra o resultado raro cairia em posições diferentes
 * a cada Entrevista, e a lista pareceria embaralhada sem motivo — o sorteio
 * precisa decidir QUAIS aparecem, não em que ordem, senão ele vira ruído
 * visual em vez de variedade.
 */
export function drawInterviewQuestions(
  count = INTERVIEW_QUESTION_COUNT,
  optionCount = INTERVIEW_OPTION_COUNT
): InterviewQuestion[] {
  return sortear(INTERVIEW_QUESTIONS, count).map((pergunta) => {
    const escolhidas = new Set(sortear(pergunta.options, optionCount).map((o) => o.id));
    return { ...pergunta, options: pergunta.options.filter((o) => escolhidas.has(o.id)) };
  });
}

/**
 * Loteria pesada. Cada candidato começa com bilhetes iguais à raridade dele no mundo
 * (`LotteryEntry.weight`) e ganha **+2 bilhetes por resposta que o empurrou**. Responder
 * tudo "certo" pra um resultado aumenta muito a chance dele, mas nunca a garante — e um
 * resultado nunca-empurrado ainda pode sair.
 *
 * Corrigido em 2026-08-28: o peso base era **1 fixo pra todo mundo**, então a Entrevista
 * ignorava a raridade por completo — um Migurd (raro) saía tanto quanto um Humano (comum),
 * e um Antecedente de faixa 95-96 no d100 (2% na tabela do livro) empatava com um de faixa
 * 01-20 (20%). Isso contradizia diretamente a Via 2, onde a regra das 3 tentativas existe
 * justamente "pra que raça/antecedente raros continuem raros de verdade". Agora as duas
 * vias usam a mesma noção de raridade: `RACE_WEIGHT` pras raças, a largura do `rollRange`
 * d100 pros antecedentes.
 */
function weightedPick(pool: LotteryEntry[], pushes: Record<string, number>): string {
  const rollable = pool.filter((e) => e.weight > 0);
  const entries = rollable.length > 0 ? rollable : pool;
  const tickets = entries.map((e) => Math.max(1, e.weight) + 2 * (pushes[e.id] ?? 0));
  const total = tickets.reduce((sum, t) => sum + t, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < entries.length; i++) {
    roll -= tickets[i];
    if (roll <= 0) return entries[i].id;
  }
  return entries[entries.length - 1].id;
}

/**
 * Resolve o Destino. No modo "antecedente" a Raça não é sorteada (o jogador já escolheu
 * na mão) e `raceId` volta null — as respostas pesam só a loteria de Antecedente.
 */
export function resolveInterview(
  answers: InterviewOption[],
  racePool: LotteryEntry[],
  backgroundPool: LotteryEntry[],
  mode: InterviewMode = "ambos"
): InterviewResult {
  const raceWeights: Record<string, number> = {};
  const backgroundWeights: Record<string, number> = {};
  for (const answer of answers) {
    for (const id of answer.raceIds ?? []) raceWeights[id] = (raceWeights[id] ?? 0) + 1;
    for (const id of answer.backgroundIds ?? []) backgroundWeights[id] = (backgroundWeights[id] ?? 0) + 1;
  }
  return {
    raceId: mode === "ambos" ? weightedPick(racePool, raceWeights) : null,
    backgroundId: weightedPick(backgroundPool, backgroundWeights),
    raceWeights,
    backgroundWeights,
  };
}
