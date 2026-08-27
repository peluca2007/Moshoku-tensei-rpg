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

/** Pool de 14 perguntas — o site sorteia 10 a cada Entrevista, então a pergunta que mais importaria pra sua build pode nunca aparecer. */
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "tarde-chuvosa",
    prompt: "O que você fazia quando era criança nas tardes chuvosas?",
    options: [
      { id: "a", text: "Ficava na janela contando quantas vezes o trovão vinha antes do relâmpago.", backgroundIds: ["estudioso-precoce"], raceIds: ["migurd"] },
      { id: "b", text: "Desmontava qualquer coisa que tivesse uma dobradiça, só pra ver como fechava de novo.", backgroundIds: ["aprendiz-mercador"], raceIds: ["anao"] },
      { id: "c", text: "Inventava nomes e histórias pra sombras que ninguém mais via.", backgroundIds: ["miko", "fator-laplace"], raceIds: [] },
      { id: "d", text: "Ia ajudar meus pais mesmo sem ninguém pedir, só pra não ficar parado.", backgroundIds: ["plebeu"], raceIds: ["humano"] },
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
    ],
  },
];

export const INTERVIEW_QUESTION_COUNT = 10;

export interface InterviewResult {
  raceId: string;
  backgroundId: string;
  raceWeights: Record<string, number>;
  backgroundWeights: Record<string, number>;
}

/** Sorteia N perguntas do pool (Fisher-Yates parcial) — a pergunta que mais pesaria pra uma build pode simplesmente não vir. */
export function drawInterviewQuestions(count = INTERVIEW_QUESTION_COUNT): InterviewQuestion[] {
  const pool = [...INTERVIEW_QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

/**
 * Loteria pesada: todo id (raça ou antecedente) começa com 1 "bilhete" só de existir — a
 * loteria do nascimento nunca é zero — e ganha +2 bilhetes por resposta que o empurrou.
 * Isso significa que responder tudo "certo" pra um resultado aumenta muito a chance dele,
 * mas nunca a garante, e um resultado nunca-empurrado ainda pode sair.
 */
function weightedPick(allIds: string[], weights: Record<string, number>): string {
  const tickets = allIds.map((id) => 1 + 2 * (weights[id] ?? 0));
  const total = tickets.reduce((sum, t) => sum + t, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < allIds.length; i++) {
    roll -= tickets[i];
    if (roll <= 0) return allIds[i];
  }
  return allIds[allIds.length - 1];
}

export function resolveInterview(
  answers: InterviewOption[],
  allRaceIds: string[],
  allBackgroundIds: string[]
): InterviewResult {
  const raceWeights: Record<string, number> = {};
  const backgroundWeights: Record<string, number> = {};
  for (const answer of answers) {
    for (const id of answer.raceIds ?? []) raceWeights[id] = (raceWeights[id] ?? 0) + 1;
    for (const id of answer.backgroundIds ?? []) backgroundWeights[id] = (backgroundWeights[id] ?? 0) + 1;
  }
  return {
    raceId: weightedPick(allRaceIds, raceWeights),
    backgroundId: weightedPick(allBackgroundIds, backgroundWeights),
    raceWeights,
    backgroundWeights,
  };
}
