/**
 * Cap. 3: o patamar Divino (Rank Deus) é narrativo em toda árvore — sem custo em PA, sem
 * lista, decisão de mesa entre jogador e Mestre (Cap. 1, seção 3). A maioria das árvores usa
 * um quadro fixo descrevendo o que esse patamar significa nela; as Três Grandes Escolas do
 * Corpo (Norte, Espada, Suishin) têm cada uma seu próprio critério de ascensão no lugar disso.
 */
export interface RankDeusEntry {
  title: string;
  body: string[];
}

export const RANK_DEUS: Record<string, RankDeusEntry> = {
  agua: {
    title: "O Mar Que Obedece",
    body: [
      'O patamar Divino da Magia de Água não lança uma magia maior. Ele remove a pergunta "onde a água está" da equação — porque a resposta passa a ser "onde eu quiser."',
      "Um mago neste patamar já foi registrado secando um porto inteiro numa única noite, sem deixar um peixe vivo, e enchendo-o de volta na manhã seguinte só para provar que podia. Rios mudam de curso a um gesto. Um cerco naval termina antes de começar, porque o mar debaixo da frota simplesmente deixa de existir por tempo suficiente.",
      "Não é uma magia de dano. É a autoridade final sobre um elemento inteiro, e nenhum exército planeja uma campanha perto da costa sem primeiro descobrir se esse mago está vivo.",
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o tipo de evento que reescreve mapas, e o mundo deve mudar por causa disso.",
    ],
  },
  fogo: {
    title: "A Chama Sem Fim",
    body: [
      "Toda magia de Fogo deste livro, até o Sol Menor, ainda apaga — com tempo, com água suficiente, com rank Santo ou superior. O patamar Divino acende uma chama que não aceita nenhuma das duas coisas: uma vez ateada, ela queima para sempre, e ninguém — nem o próprio conjurador — sabe apagá-la de volta.",
      "Existem, no Mundo de Seis Faces, três lugares assim: uma floresta que ardeu por uma geração inteira, uma cratera que ainda emite calor décadas depois, e uma cidade que ninguém reconstruiu, porque o chão continua incandescente.",
      "É por isso que nenhuma escola trata este patamar como uma recompensa. Um mago de Fogo que alcança o Divino é, na prática, uma arma que a própria escola reza para nunca precisar usar.",
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É uma decisão que o Mestre e a mesa tomam juntos sabendo que ela pode custar uma região inteira do mapa.",
    ],
  },
  vento: {
    title: "O Golpe Sem Distância",
    body: [
      "Nada Toca Você, a marca do Imperador, já torna a distância irrelevante para quem tenta atacar o mago. O patamar Divino inverte a mão: o mago deixa de precisar de distância nenhuma para atacar qualquer coisa.",
      "Um golpe de Vento em rank Deus chega ao alvo antes do som de tê-lo desferido — porque, para todos os efeitos práticos, ele não viajou: o espaço entre o mago e o alvo simplesmente deixou de contar. Não existe cobertura, muralha ou continente que sirva de defesa contra alguém que já resolveu essa equação.",
      "Não há registro de ninguém vivo hoje que domine este patamar — e a escola prefere assim. Um duelo entre dois magos de Vento Divino, dizem os mestres, aconteceria e terminaria sem que ninguém no mundo visse o meio dele.",
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o clímax de uma campanha, e o mundo deve mudar por causa disso.",
    ],
  },
  terra: {
    title: "Onde Havia Mar",
    body: [
      "Cordilheira, a marca do Imperador, já ergue montanhas e abre vales numa região. O patamar Divino trabalha em outra escala: continentes.",
      "A lenda mais repetida sobre este patamar é a de um mago de Terra que ergueu uma ponte de rocha viva atravessando um estreito que separava dois continentes — e de outro, séculos depois, que a afundou de volta ao fundo do oceano numa única noite, porque um exército a estava atravessando. Nenhuma das duas histórias tem confirmação de testemunha viva. Nenhuma das duas foi desmentida.",
      "Isto não é dano. É geografia, e geografia não se desfaz.",
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É a fundação de um mito que dura mais que qualquer reinado, e o mundo deve mudar por causa disso.",
    ],
  },
  cura: {
    title: "Ressurreição",
    body: [
      "O patamar Divino da Magia de Cura faz uma coisa só, e é a coisa que o mundo inteiro considera impossível: traz de volta os recém-mortos.",
      "A morte precisa ter ocorrido há poucos minutos. O corpo precisa existir e estar substancialmente inteiro. A alma precisa não ter sido destruída, aprisionada nem cristalizada — o que exclui, entre outras coisas, todas as vítimas do Zero Absoluto e do Silêncio Primordial.",
      "Não existe ninguém vivo no Mundo de Seis Faces com este patamar. Se o seu jogador chegar aqui, isso não é uma compra de ficha: é o clímax de uma campanha, e o mundo deveria mudar por causa disso.",
    ],
  },
  desintoxicacao: {
    title: "A Doença da Pedra Mágica",
    body: [
      "O grimório de Desintoxicação de rank Deus existe. Está no Grande Templo de Millis, catalogado, guardado e vigiado.",
      "Ninguém no mundo consegue lê-lo.",
      "Ele é o único registro conhecido de uma magia capaz de curar a Doença da Pedra Mágica — a única aflição de rank Deus do livro, aquela que transforma carne viva em minério lentamente e que nenhum patamar jogável alcança. Todo mago de Desintoxicação do mundo sabe que o livro está lá. Nenhum deles conseguiu passar do primeiro verso.",
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o fim de uma campanha inteira, e o mundo deve mudar por causa disso.",
    ],
  },
  barreira: {
    title: "O Silêncio Permanente",
    body: [
      "Mundo Fechado, a marca do Imperador, cancela toda magia numa esfera por uma hora. O patamar Divino remove o limite de tempo — e o de espaço.",
      "Existem regiões no Mundo de Seis Faces, do tamanho de um vale ou de um pequeno reino, onde magia simplesmente não funciona, para ninguém, há gerações. Nenhum mago vivo hoje sabe desfazer essas zonas; a única coisa que se sabe é que alguém, um dia, as fez — e escolheu não voltar para desfazê-las.",
      "Barreira Viva, o talento do Imperador, já avisa que as barreiras deste mago sobrevivem à própria morte dele. No patamar Divino, elas sobrevivem à própria escola: selar magia deixa de ser um efeito e passa a ser uma regra do lugar.",
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É uma cicatriz permanente no mapa, e o mundo deve mudar por causa disso.",
    ],
  },
  invocacao: {
    title: "O Pacto Que Não Deveria Existir",
    body: [
      "A Magia de Invocação nunca foi sobre feitiços — é sobre relações. O patamar Divino é a relação definitiva: um Pacto firmado com algo que, por definição, não deveria conseguir ser vinculado por ninguém. Um Superd ancião. Um espírito elementar velho o bastante para ter nome próprio em três idiomas mortos. Ou, segundo um único registro que o Grande Templo de Millis se recusa a confirmar ou negar, algo maior que isso.",
      "Ninguém Chega Sozinho, a marca do Imperador, já entra em qualquer lugar com um pequeno exército de invocados fiéis. Quem chega ao Divino nunca mais precisa perguntar se alguém vai atender ao chamado — porque o que foi pactuado não pode recusar, e a dívida corre nos dois sentidos.",
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o tipo de aliança que campanhas inteiras giram em torno de honrar ou de trair, e o mundo deve mudar por causa disso.",
    ],
  },
  arquearia: {
    title: "A Flecha do Destino",
    body: [
      "A Flecha que Não Erra, a técnica Lenda da Flecha, já acerta qualquer lugar que o arqueiro tenha visto. O patamar Divino dispensa até isso: a flecha encontra um alvo que o arqueiro descreveu, mesmo sem nunca tê-lo visto, mesmo que o alvo ainda não exista no momento em que a corda é solta.",
      'A lenda mais citada — e mais discutida nas guildas de caçadores — é a de uma flecha disparada contra "quem quer que erga a espada contra a cidade", solta antes de qualquer cerco começar, que só encontrou seu alvo anos depois, atravessando uma armadura que na época do disparo ainda nem tinha sido forjada.',
      "Ninguém sabe reproduzir isso de propósito. É por isso que continua sendo lenda, e não uma técnica.",
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o tipo de tiro que uma campanha inteira é construída para explicar, e o mundo deve mudar por causa disso.",
    ],
  },
  "armas-pesadas": {
    title: "O Punho Que Não Precisa Bater",
    body: [
      "O Lutador nunca foi sobre matar rápido — é sobre degradar o oponente até que continuar seja impossível. O patamar Divino leva essa lógica ao extremo: a ameaça do golpe já basta.",
      'Existe um único combatente na história registrada que encerrou uma disputa inteira levantando o punho fechado e esperando. O oponente — um veterano de dezenas de guerras — largou a arma sozinho. Perguntado depois por que, ele só respondeu que "o corpo entendeu antes da cabeça".',
      "Não é intimidação comum, e nenhum talento deste livro reproduz o efeito. É o corpo de outra pessoa reconhecendo, num nível que a mente não controla, que a luta já acabou.",
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o fim de uma lenda pessoal contada por décadas, e o mundo deve mudar por causa disso.",
    ],
  },
  "cavalaria-e-escudos": {
    title: "A Muralha Que Nunca Caiu",
    body: [
      'Aço Inquebrável e o sacrifício de "nenhum aliado seu pode morrer" já mostram do que um Imperador de Escudos é capaz por um minuto, ao custo da própria vida. O patamar Divino estica esse minuto até cobrir uma batalha inteira — e uma cidade inteira atrás de si.',
      'Toda muralha física cai, cedo ou tarde. As poucas que "nunca caíram" na história do Mundo de Seis Faces não eram de pedra: eram uma pessoa, parada num único ponto, que decidiu que nada passaria por ali enquanto estivesse de pé. Nenhuma delas está viva hoje. Todas cumpriram a promessa até o fim.',
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É provavelmente o último capítulo da história desse personagem, e o mundo deve mudar por causa disso.",
    ],
  },
  "furtividade-e-armadilhas": {
    title: "O Roubo Impossível",
    body: [
      "O Homem Que Nunca Esteve Lá, a técnica Lenda Oculta, já decide que um inimigo perdeu antes de a cena acabar. O patamar Divino rouba coisas que a técnica nem alcança: não objetos, não pessoas — fatos.",
      "Existe um só roubo registrado neste patamar, e nenhuma guilda de ladrões consegue confirmar os detalhes: alguém entrou em um lugar que ninguém deveria conseguir entrar e saiu levando uma coisa que ninguém deveria conseguir levar — uma dívida que todo um reino devia a outro, uma lembrança que uma cidade inteira guardava sobre uma batalha, o próprio nome de um deus menor. Quem perdeu nunca percebeu que faltava alguma coisa, porque a ausência também foi levada.",
      "Não existe cofre, ritual ou guarda contra isso, porque a defesa pressupõe saber o que está sendo protegido — e este ladrão já decidiu, antes de entrar, que aquilo nunca existiu.",
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o tipo de golpe que muda o que o mundo inteiro acredita ter acontecido, e a mesa deve mudar por causa disso.",
    ],
  },
  "bardo-e-interacao": {
    title: "A Palavra que Vira Verdade",
    body: [
      "O Fim da Canção, a técnica Voz do Mundo, encerra uma batalha convencendo quem luta de que ela não faz mais sentido. O patamar Divino não convence ninguém de uma verdade — ele decide qual é a verdade, e o mundo se ajusta para que sempre tenha sido assim.",
      "A lenda mais antiga do ofício fala de uma canção cantada uma única vez, sobre um covarde que nunca existiu, e que hoje aparece em três línguas diferentes, em três continentes diferentes, como fato histórico incontestável — com nome, data e testemunhas que juram ter estado lá. Ninguém sabe mais dizer se a canção descreveu algo real ou se o mundo simplesmente decidiu que sim, porque a Bardo pediu.",
      "Nenhum talento deste livro chega perto disso. É a diferença entre contar uma história bem contada e ser a razão de ela ser verdade.",
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É reescrever a história que todo mundo lembra, e o mundo deve mudar por causa disso.",
    ],
  },
  "navegacao-e-lideranca": {
    title: "A Guerra no Dia Certo",
    body: [
      "A Batalha Que Você Escolheu, a técnica Senhor da Guerra, já decide o formato de um único confronto. O patamar Divino decide algo maior: quando, dentre todas as guerras que ainda vão acontecer, a próxima realmente começa.",
      "Não existe magia nem técnica marcial que faça isso — porque não é sobre poder de combate, é sobre logística, alianças, colheitas, tratados e o clima de uma estação inteira, todos puxados na direção certa até que só reste um dia possível para o primeiro golpe ser dado. Historiadores discordam sobre se algum Tático já alcançou isto de propósito ou se, olhando para trás, decidiram que sim.",
      "Um general assim nunca precisa vencer a batalha mais difícil. Ele só precisa garantir que ela nunca aconteça no dia em que perderia.",
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o tipo de decisão que define o resultado de uma campanha inteira antes da primeira espada ser desembainhada, e o mundo deve mudar por causa disso.",
    ],
  },

  /**
   * As duas híbridas (2026-09-03). Eram as únicas árvores do livro sem quadro de
   * Rank Deus — e a ausência era mais visível nelas do que em qualquer outra,
   * porque uma árvore híbrida já é, por definição, um teto: você só chega nela
   * depois de ir fundo em duas outras.
   *
   * O critério de ascensão delas é diferente do das demais de propósito. Nas
   * escolas normais o patamar Divino é uma escalada dentro de uma coisa só. Aqui
   * ele é o oposto: é o instante em que as duas origens param de ser duas.
   */
  vendaval: {
    title: "O Passo Que Não Termina",
    body: [
      "A Distância Roubada é a mecânica inteira desta árvore: você anda, e o que você andou vira alcance da lâmina. Todo patamar dela apenas alarga esse número — 9 metros, 12, um piso de 6 que soma em cima. O patamar Divino não alarga mais nada. Ele apaga o número.",
      "Um Vendaval neste patamar não percorre a distância até o alvo: ele já a percorreu antes de decidir atacar. Não existe recuo, terreno, corredor nem muralha que crie separação, porque separação é a única coisa que esta árvore aprendeu a converter em dano — e, no Divino, a conversão deixou de ter teto.",
      "É o patamar mais discreto do livro, e o mais difícil de testemunhar. Quem viu descreve sempre a mesma coisa: o espadachim estava longe, e depois o golpe já tinha acontecido. Ninguém relata o meio, porque não há meio para relatar.",
      "Nenhuma das duas escolas de origem reivindica este título. O Deus do Norte diz que é vento; a Magia de Vento diz que é esgrima. É por isso que ele não tem sede, não tem titular reconhecido e não aparece em registro nenhum — só em histórias que ninguém conseguiu confirmar.",
      "Se um personagem seu chegar a este patamar, isso não é uma compra de ficha. É o fim de uma campanha construída sobre movimento, e o mundo deve mudar por causa disso.",
    ],
  },
};

/**
 * As Três Grandes Escolas (Norte, Espada, Suishin) não usam o quadro padrão de Rank Deus —
 * cada uma já define seu próprio critério de ascensão ao título mais alto, com titular vivo.
 */
export const GODHOOD_PATH: Record<string, RankDeusEntry> = {
  "deus-do-norte": {
    title: "O Estilo mais Barato de Ser Rei",
    body: [
      "Por causa das inúmeras facções internas, o Norte é muito mais generoso ao conceder títulos: existem quase 50 Reis do Norte vivos no mundo, contra um punhado de Reis da Espada.",
      "Mecanicamente: desbloquear o Rank Rei do Norte custa apenas 2 PA em vez de 3. E o Rank Deus do Norte pode ser detido por mais de uma pessoa ao mesmo tempo — basta que a maioria dos praticantes da sua facção reconheça sua força, o que o torna o único rank Deus alcançável sem matar o titular anterior.",
    ],
  },
  "deus-da-espada": {
    title: "E o Deus da Espada?",
    body: [
      "Existe um só no mundo, e o cargo é ocupado do único jeito possível: matando o anterior. Se ele morre por qualquer outro motivo, o mais forte da escola herda o título — o que significa que toda troca de geração no Estilo Deus da Espada é, na prática, uma guerra civil interna.",
      "Este patamar não tem custo em PA, não tem lista de técnicas e não pode ser comprado. Ele é uma decisão da mesa, e ela envolve sangue de alguém que te ensinou.",
    ],
  },
  "deus-da-agua-corpo": {
    title: "O Caminho para Deusa da Água",
    body: [
      "Existe uma só Deusa da Água no mundo por vez, e o título não se conquista matando ninguém — como no Deus da Espada — nem por aclamação de facção — como no Norte. Conquista-se dominando ao menos três dos Cinco Segredos.",
      "Se você comprou os três Segredos deste livro, você já cumpriu o requisito mecânico. O que falta é a narrativa: o mundo precisa ver, e a titular precisa reconhecer. Reidar, o primeiro, foi o único da história a dominar os cinco.",
      "Homens que assumem o posto herdam o nome Reidar. Mulheres, Reida. O seu nome anterior deixa de importar.",
    ],
  },
};

export function getRankDeusForTree(treeId: string): RankDeusEntry | undefined {
  return RANK_DEUS[treeId] ?? GODHOOD_PATH[treeId];
}
