/**
 * AS FASES DAS NOTAS DE VERSÃO — 2026-10-01.
 *
 * O autor viu o patch notes em documento (fases, áreas, "Na mesa") e pediu o
 * mesmo no site. Uma fase é um trecho do histórico com um assunto só; o
 * "Na mesa" dela diz, em poucas linhas, o que mudou pra quem joga e pra quem
 * mestra — quem ficou um mês sem jogar lê só as fases que perdeu.
 *
 * As fases são contíguas e cobrem o histórico inteiro, da `primeira` à
 * `ultima` versão (inclusive), em ordem de data. Versão nova entra na última
 * fase (troque o `ultima` dela) ou abre uma fase nova. Quando uma regra de uma
 * fase antiga mudou depois, a linha diz onde. `fasesDasNotas.test.ts` confere
 * que toda versão cai em exatamente uma fase e que toda versão citada existe.
 */

export interface LinhaDaMesa {
  /** O nome da mudança, em negrito. */
  titulo: string;
  texto: string;
  /** As versões onde está o detalhe (viram links). */
  versoes: string[];
}

export interface FaseDasNotas {
  id: string;
  nome: string;
  primeira: string;
  ultima: string;
  datas: string;
  resumo: string;
  mesa: { jogador: LinhaDaMesa[]; mestre: LinhaDaMesa[] };
}

/** Em ordem de data: a primeira fase primeiro. */
export const FASES_DAS_NOTAS: FaseDasNotas[] = [
  {
    id: "o-sistema-toma-forma",
    nome: "O sistema toma forma",
    primeira: "0.0.2",
    ultima: "0.1.0",
    datas: "31 de agosto a 3 de setembro",
    resumo:
      "As primeiras regras refeitas: o Defender, o Punho de Fogo, a Desintoxicação sem Profundidade, o Comece Aqui e as Magias Combinadas.",
    mesa: {
      jogador: [
        { titulo: "Defender/Absorver", texto: "uma Ação nova: em vez de desviar, você aguenta o golpe e reduz o dano.", versoes: ["0.0.2"] },
        { titulo: "Criação mais enxuta", texto: "2 pontos livres de atributo na criação, e a compra de atributo com PA fica progressiva: 1, 1, 2, 2, 3, 3… PA.", versoes: ["0.0.2", "0.0.3"] },
        { titulo: "Punho de Fogo", texto: "nova sub-árvore híbrida do Corpo (Fogo + Lutador). Foi refeita na 0.1.78.", versoes: ["0.0.2", "0.1.78"] },
        { titulo: "Desintoxicação e Terra", texto: "a Profundidade das aflições foi apagada, e a Terra ganhou a condição Soterrado.", versoes: ["0.0.3"] },
        { titulo: "Mecânica Central", texto: "toda árvore declara, no topo do catálogo, o que faz de diferente; o Cap. 2 ganhou a regra de interromper uma conjuração.", versoes: ["0.0.4"] },
        { titulo: "Comece Aqui", texto: "o capítulo de abertura do livro, antes do Cap. 1.", versoes: ["0.0.5"] },
        { titulo: "Touki por patamar", texto: "os PT escalam como PV e PM.", versoes: ["0.0.9"] },
        { titulo: "Magias Combinadas", texto: "viraram tabela oficial e passaram a ser compráveis.", versoes: ["0.0.2", "0.1.0"] },
      ],
      mestre: [
        { titulo: "Chefe solo", texto: "a primeira regra pra um chefe aguentar o grupo inteiro. A conta do chefe mudou várias vezes depois; a de hoje está na 0.1.119.", versoes: ["0.0.9", "0.1.119"] },
        { titulo: "A régua de dano", texto: "o Apêndice C (dano por turno de cada árvore em cada patamar) passou a sair dos dados das árvores.", versoes: ["0.0.8"] },
      ],
    },
  },
  {
    id: "o-site-vira-ferramenta-de-mesa",
    nome: "O site vira ferramenta de mesa",
    primeira: "0.1.1",
    ultima: "0.1.36",
    datas: "3 a 10 de setembro",
    resumo:
      "Nasce o /encontros, a ficha passa a viajar por link, arquivo e QR, e o site ganha busca, rolador, condições e descanso na própria ficha, funcionando sem internet.",
    mesa: {
      jogador: [
        { titulo: "Ficha por link, arquivo e QR", texto: "passar a ficha adiante virou um link, um arquivo .mtficha (com foto e capa) ou um QR pra apontar a câmera.", versoes: ["0.1.11", "0.1.12", "0.1.33"] },
        { titulo: "Sem internet", texto: "o site funciona offline e instala como app na tela inicial.", versoes: ["0.1.15"] },
        { titulo: "Busca", texto: "em todos os verbetes do livro, com o card abrindo ali mesmo.", versoes: ["0.1.17"] },
        { titulo: "Rolador e macros", texto: "o rolador vai a qualquer página, e o macro guarda teste, não só dano.", versoes: ["0.1.21", "0.1.22"] },
        { titulo: "Condições, descanso e tempo livre na ficha", texto: "marque Envenenado e a ficha aplica; Descanso Curto e Longo viram botão; as seis atividades de uma semana livre também.", versoes: ["0.1.24", "0.1.25"] },
        { titulo: "Rolar perícia", texto: "direto da ficha, com o Bônus de Rank das árvores que somam.", versoes: ["0.1.32"] },
        { titulo: "Eu aguento isso?", texto: "o jogador também simula a própria ficha contra uma criatura.", versoes: ["0.1.26"] },
        { titulo: "Modo Mesa", texto: "ficha, iniciativa, encontros e rolador numa tela só.", versoes: ["0.1.27"] },
        { titulo: "Tático e Punho do Fogo", texto: "o Tático passa a apontar o alvo e bater nele; o Calor do Punho do Fogo cabe em quatro regras.", versoes: ["0.1.14"] },
      ],
      mestre: [
        { titulo: "Encontros", texto: "monte a criatura e teste contra as fichas do grupo antes da sessão, com centenas de batalhas simuladas.", versoes: ["0.1.1", "0.1.2"] },
        { titulo: "Covil com pastas", texto: "gavetas, busca, arquivo e link de criatura, e o rival montado a partir de uma ficha do roster.", versoes: ["0.1.13"] },
        { titulo: "Painel do Mestre", texto: "as fichas do grupo lado a lado, o comparador de builds, e Iniciativa e Encontros morando lá.", versoes: ["0.1.28", "0.1.30", "0.1.36"] },
      ],
    },
  },
  {
    id: "o-simulador-aprende-a-medir",
    nome: "O simulador aprende a medir",
    primeira: "0.1.37",
    ultima: "0.1.59",
    datas: "10 e 11 de setembro",
    resumo:
      "O simulador passa a curar, a errar contra a CA, a respeitar o Fio da Vida e as magias longas, e as primeiras correções de balanço saem dessas medidas.",
    mesa: {
      jogador: [
        { titulo: "Conjurar custa menos Ações", texto: "a escada parou de triplicar e caiu de 6 Ações pra 4. As magias de 5 e 6 voltaram como categoria própria, a Grande Obra, na 0.1.80.", versoes: ["0.1.47", "0.1.80"] },
        { titulo: "Proficiência por grupo de arma", texto: "espada sim, adaga não: o que conta é o grupo, não a faixa de dano.", versoes: ["0.1.52"] },
        { titulo: "Tiro Perfeito", texto: "a única técnica que compra potência com tempo: quatro Ações num turno de três.", versoes: ["0.1.53"] },
        { titulo: "Dojos e Mestres", texto: "certos nós da árvore se abrem com um mestre, não só com PA.", versoes: ["0.1.54"] },
        { titulo: "Topo que vale a pena", texto: "nenhuma técnica de topo rende menos que a do patamar abaixo.", versoes: ["0.1.50", "0.1.58"] },
      ],
      mestre: [
        { titulo: "Simulador mais honesto", texto: "cura e PV Temporários entram, as técnicas passam a errar contra a CA, o Fio da Vida vale a 0 PV, e as magias longas finalmente são simuladas.", versoes: ["0.1.35", "0.1.37", "0.1.38", "0.1.40"] },
        { titulo: "O chefe pode dizimar", texto: "a regra de chefe virou por patamar, mirando 25% de grupos dizimados.", versoes: ["0.1.49", "0.1.59"] },
        { titulo: "Por turno", texto: "as magias sustentadas passam a contar a cada turno.", versoes: ["0.1.57"] },
      ],
    },
  },
  {
    id: "a-arte-e-a-revisao",
    nome: "A arte e a revisão linha a linha",
    primeira: "0.1.69",
    ultima: "0.1.93",
    datas: "11 a 18 de setembro",
    resumo:
      "Sessenta habilidades ganham arte, o livro inteiro passa por 230 achados de revisão, e o Mestre ganha o Bloco do Monstro.",
    mesa: {
      jogador: [
        { titulo: "PA por sessão", texto: "o livro passa a dizer quanto: 1 PA por sessão e +1 por marco. Dobrou na 0.1.117.", versoes: ["0.1.79", "0.1.117"] },
        { titulo: "Descanso e condições", texto: "o Descanso Longo devolve todas as reservas, toda condição tem duração, e entra a condição Surpreso.", versoes: ["0.1.79"] },
        { titulo: "BC da escola", texto: "o BC usa o atributo-chave da escola, não sempre o Intelecto; a Árvore Inicial é de graça.", versoes: ["0.1.80"] },
        { titulo: "Combate", texto: "Cobertura tem número, a Falha Crítica vira um menu de três, duas armas valem pra qualquer um, e a área não poupa aliado.", versoes: ["0.1.74", "0.1.81", "0.1.87"] },
        { titulo: "Cura e Touki", texto: "toda cura caiu pela metade e a Cura passa a ferir; todo guerreiro tem Touki desde o 1º patamar.", versoes: ["0.1.77"] },
        { titulo: "Magos mais frágeis", texto: "os PV das oito escolas de magia caíram.", versoes: ["0.1.75"] },
        { titulo: "Árvores", texto: "o Punho do Fogo refeito, o Deus da Água em Agilidade, o 'Força ou Agilidade' valendo de verdade, a Postura do Espadachim e o Tiro Perfeito de graça na Arquearia.", versoes: ["0.1.78", "0.1.83", "0.1.84", "0.1.93"] },
        { titulo: "Teto de Ações", texto: "4 próprias + 2 concedidas por aliados.", versoes: ["0.1.93"] },
        { titulo: "Nenhuma compra morta", texto: "a ficha cobra pré-requisito de outra árvore, e duas Maestrias deixaram de apagar PA já gasto.", versoes: ["0.1.91"] },
      ],
      mestre: [
        { titulo: "Orçamento de Encontro", texto: "uma criatura do patamar do grupo por jogador é Equilibrado, e o patamar da criatura é o Bônus de Rank dela.", versoes: ["0.1.89"] },
        { titulo: "Bloco do Monstro", texto: "patamar e arquétipo dão o monstro inteiro (atributos, Percepção passiva, sentidos), há um botão de sugerir ações, e o motor aplica Resistência e Imunidade.", versoes: ["0.1.90"] },
      ],
    },
  },
  {
    id: "o-mestre-ganha-ferramentas",
    nome: "O Mestre ganha ferramentas",
    primeira: "0.1.94",
    ultima: "0.1.95",
    datas: "18 a 22 de setembro",
    resumo:
      "O construtor de encontros, o simulador com recibo de cada dado, o bestiário com cenas e recompensas, e o comparador de builds.",
    mesa: {
      jogador: [
        { titulo: "Comparador de builds", texto: "duas fichas do grupo contra o mesmo alvo, em 400 batalhas.", versoes: ["0.1.95"] },
        { titulo: "Busca e offline", texto: "a busca abre a explicação na hora, e o site inteiro roda sem internet.", versoes: ["0.1.94"] },
      ],
      mestre: [
        { titulo: "Construtor de encontros", texto: "criaturas com orçamento real, medidor de letalidade contra o seu grupo e o rastreador de Iniciativa.", versoes: ["0.1.94"] },
        { titulo: "Simulador com cenário", texto: "Escondido, Surpreso e distância entram na conta, e cada golpe deixa o recibo dos dados.", versoes: ["0.1.95"] },
        { titulo: "Bestiário", texto: "pastas e cenas salvas, catálogo de criaturas prontas e recompensas calculadas.", versoes: ["0.1.95"] },
      ],
    },
  },
  {
    id: "o-livro-vira-livro",
    nome: "O livro vira livro",
    primeira: "0.1.95.1",
    ultima: "0.1.96.2",
    datas: "23 a 25 de setembro",
    resumo:
      "O /livro ganha capa e índice, nasce o livro folheado com a identidade noturna, a Magia Teórica entra no lugar da Barreira, e os chefes passam a lutar como a própria ficha.",
    mesa: {
      jogador: [
        { titulo: "O livro folheado", texto: "o livro aberto em duas páginas de tamanho fixo, com papel noite e dia, busca e as 19 árvores com identidade própria.", versoes: ["0.1.96.1"] },
        { titulo: "Magia Teórica no lugar da Barreira", texto: "a ficha com Barreira vira Teórica nos patamares e recebe de volta os PA das compras.", versoes: ["0.1.96.2"] },
        { titulo: "Compêndio de Itens", texto: "65 itens novos no livro, cada um com a sua disponibilidade; Relíquia não tem preço.", versoes: ["0.1.95.1"] },
        { titulo: "Ficha mais limpa", texto: "abre mostrando o personagem, com o gerenciamento num menu só.", versoes: ["0.1.95.1"] },
      ],
      mestre: [
        { titulo: "Sub-arquétipo de criatura", texto: "Besta, Humanoide, Morto-Vivo e outros: a recompensa sai de quem foi derrotado.", versoes: ["0.1.95.1"] },
        { titulo: "Chefes de ficha", texto: "uma ficha do roster entra em Encontros como Rival ou Chefe, e Pactos, Água e Fogo entram na simulação.", versoes: ["0.1.96"] },
      ],
    },
  },
  {
    id: "a-grande-revisao-do-livro",
    nome: "A grande revisão do livro",
    primeira: "0.1.97",
    ultima: "0.1.101",
    datas: "26 de setembro",
    resumo:
      "O livro lido página a página: Magia Teórica, Cura e Desintoxicação refeitas, raças com tier, e o livro folheado ganhando PDF e diagramação.",
    mesa: {
      jogador: [
        { titulo: "Encurtada e Silenciosa", texto: "o dano total (dados + BC) cai pela metade: a Padrão volta a valer a pena.", versoes: ["0.1.97"] },
        { titulo: "Combate", texto: "Esquivar vale contra todos os ataques de uma criatura, Defender reduz todos os golpes, a Exaustão só derruba o Manto no nível 3, e o Trauma vem só de ver um aliado morrer.", versoes: ["0.1.97"] },
        { titulo: "Raças com tier", texto: "a raridade decide a faixa no d100, e cada raça ganha dois despertares comprados com PA.", versoes: ["0.1.99"] },
        { titulo: "Magia de Cura", texto: "a Cura custa 2 PM, a Ferida Fresca conta desde o fim do seu último turno, e há três caminhos por patamar.", versoes: ["0.1.99"] },
        { titulo: "Desintoxicação", texto: "Dose (até 3; a 3ª é o Colapso) e Inverter, que vira as Doses em dano.", versoes: ["0.1.99"] },
        { titulo: "Magia Teórica reescrita", texto: "essência + verbo + forma, uma conta de PM só, uma carta de dano por patamar. Cartas que saíram foram trocadas pela do mesmo patamar.", versoes: ["0.1.101"] },
        { titulo: "O caminho mínimo", texto: "o Comece Aqui diz o que a primeira sessão precisa e o que pode esperar.", versoes: ["0.1.100"] },
        { titulo: "PDF do livro", texto: "o livro folheado imprime com a mesma página.", versoes: ["0.1.98"] },
      ],
      mestre: [
        { titulo: "Kit de mesa", texto: "quatro fichas de 2º patamar por link, um encontro medido e uma folha de observação.", versoes: ["0.1.100"] },
        { titulo: "Guilda", texto: "todo personagem começa Rank F.", versoes: ["0.1.97"] },
      ],
    },
  },
  {
    id: "revisao-geral-e-balanco",
    nome: "Revisão geral e auditoria de balanço",
    primeira: "0.1.102",
    ultima: "0.1.110",
    datas: "27 de setembro",
    resumo:
      "Bastidor fora do texto, opções mortas consertadas, o truque de escola, as Preparações das Utilidades, o Dragão filhote e os monstros medidos de verdade.",
    mesa: {
      jogador: [
        { titulo: "Truque de escola", texto: "Fogo, Água, Vento e Terra ganham de graça no Principiante uma magia de 1 Ação, 1d6 + BC, sem PM.", versoes: ["0.1.107"] },
        { titulo: "Preparações", texto: "Ladino, Bardo e Tático ganham um menu de sete Preparações cada, com custo e efeito escritos.", versoes: ["0.1.109"] },
        { titulo: "Canções do Bardo", texto: "uma canção ativa por vez (Dissonância, Marcha, Guerra ou Réquiem); trocar custa 1 Ação.", versoes: ["0.1.109"] },
        { titulo: "Raça Dragão e o preço de escolher", texto: "o Dragão vira filhote, e escolher a raça custa pelo tier (1, 2 ou 3 PA), cobrado na ficha.", versoes: ["0.1.110"] },
        { titulo: "Técnicas de topo", texto: "as que rendiam menos que as de baixo subiram, e a Luz Absoluta desceu.", versoes: ["0.1.107"] },
        { titulo: "Ofício não tem Rank Deus", texto: "os sete Ofícios terminam no 6º patamar.", versoes: ["0.1.103"] },
        { titulo: "Uma vez por…", texto: "os 111 limites lidos um a um; 'cena' deixou de ser relógio do livro.", versoes: ["0.1.108"] },
      ],
      mestre: [
        { titulo: "Orçamento que diz a verdade", texto: "moldes de criatura novos e as faixas Fácil, Equilibrado, Difícil e Mortal medidas no simulador. Os moldes foram remedidos de novo na 0.1.118 e na 0.1.119.", versoes: ["0.1.105", "0.1.119"] },
        { titulo: "Catálogo de criaturas no livro", texto: "as 28 criaturas do /encontros estão no Apêndice G.", versoes: ["0.1.106"] },
        { titulo: "Controle com teste", texto: "a Maestria de Imperador da Terra, a Era Glacial e o Rio de Magma passaram a pedir resistência.", versoes: ["0.1.103"] },
      ],
    },
  },
  {
    id: "racas-temas-e-monstros",
    nome: "Raças, temas e monstros de novo",
    primeira: "0.1.111",
    ultima: "0.1.120",
    datas: "27 e 28 de setembro",
    resumo:
      "Quatro temas para o site, o ritmo de PA dobrado, o molde do Apêndice G medido contra quatro jogadores e a Conjuração Concentrada.",
    mesa: {
      jogador: [
        { titulo: "PA dobrou", texto: "2 por sessão e +2 por marco; o 3º patamar chega por volta da 10ª sessão.", versoes: ["0.1.117"] },
        { titulo: "Conjuração Concentrada", texto: "a magia de dano inteira numa criatura só, com +50% nos dados e no PM.", versoes: ["0.1.120"] },
        { titulo: "Raça Dragão", texto: "sem asas, e o despertar de Santo é a Aura do Deus-Dragão.", versoes: ["0.1.111", "0.1.113"] },
        { titulo: "Antecedente escolhido", texto: "escolher só o Antecedente custa 1 PA na ficha.", versoes: ["0.1.112"] },
        { titulo: "Deus da Espada", texto: "a ficha cobra a CA base −2 da doutrina.", versoes: ["0.1.114"] },
        { titulo: "Invocação e Bardo", texto: "Pactos ativos ao mesmo tempo passam a 2/2/3/3/4; a Canção de Guerra soma o Bônus de Rank e a Dissonância dá 1d6 por patamar.", versoes: ["0.1.120"] },
        { titulo: "Quatro temas", texto: "Pergaminho Noite, Pergaminho, Livro Noite e Livro Dia; nos do Livro, a ficha veste a árvore em que você mais investiu.", versoes: ["0.1.116"] },
      ],
      mestre: [
        { titulo: "O molde de criatura", texto: "medido contra quatro jogadores: 4 criaturas do patamar = Equilibrado, 5 = Difícil. PV 53/66/139/176/210/350 e dano 16/21/29/38/48/50, do 1º ao 6º.", versoes: ["0.1.118", "0.1.119"] },
        { titulo: "Chefe", texto: "2,5× o PV e 1,5× o dano do molde; sozinho contra quatro jogadores é Equilibrado (Difícil no 6º).", versoes: ["0.1.119"] },
        { titulo: "Três golpes por turno", texto: "a criatura do molde bate três vezes, com um terço do dano em cada, e o erro perde o golpe.", versoes: ["0.1.119"] },
        { titulo: "Simulador com suporte", texto: "Tático, Bardo e Espíritos e Feras entram de verdade nas simulações.", versoes: ["0.1.118"] },
      ],
    },
  },
  {
    id: "o-simulador-fiel-as-cartas",
    nome: "O simulador fiel às cartas",
    primeira: "0.1.121",
    ultima: "0.1.126.1",
    datas: "29 e 30 de setembro",
    resumo:
      "Gelo, veneno, BC e Reações fazendo no simulador o que a carta diz, duas defesas novas no Principiante, a arena das batalhas e o polimento do site e do livro.",
    mesa: {
      jogador: [
        { titulo: "Couraça de Barro e Refrão da Retomada", texto: "Terra amortece um golpe físico com uma Reação; o Bardo transforma o erro de um aliado em PV Temporários pro grupo.", versoes: ["0.1.122"] },
        { titulo: "Dano de dois tipos", texto: "cada parte do golpe usa a defesa do próprio tipo.", versoes: ["0.1.124"] },
        { titulo: "Concentrada em alvo único", texto: "vale também pra magia que já mira uma criatura só.", versoes: ["0.1.125"] },
        { titulo: "Contraste e o caos da ficha", texto: "texto legível nos quatro temas, e os motivos da sua árvore aparecendo na ficha.", versoes: ["0.1.123.2"] },
      ],
      mestre: [
        { titulo: "Simulador fiel às cartas", texto: "gelo, veneno e Reações como o livro manda, e o BC só onde a carta escreve.", versoes: ["0.1.121", "0.1.123"] },
        { titulo: "A arena", texto: "as batalhas notáveis do simulador podem ser assistidas, com os retratos das fichas, narração e som.", versoes: ["0.1.123.1"] },
        { titulo: "Rival chefe", texto: "2,5× os PV da ficha, igual ao chefe de molde.", versoes: ["0.1.126"] },
      ],
    },
  },
  {
    id: "o-livro-abre-rapido",
    nome: "O livro abre rápido",
    primeira: "0.1.127",
    ultima: "0.1.145",
    datas: "30 de setembro e 1º de outubro",
    resumo:
      "O livro no celular responde em 2,5 s, o modo Livro abre em 2 s, três incongruências do texto caem, e as notas de versão ganham fases e áreas.",
    mesa: {
      jogador: [
        { titulo: "O gesto de cada escola", texto: "no modo Livro, cada árvore conta a mecânica num gesto curto nas margens — a Água congela, a Terra soterra, a Desintoxicação pinga três Doses — e descansa depois.", versoes: ["0.1.140", "0.1.142", "0.1.144"] },
        { titulo: "O livro rápido", texto: "no celular, ~2,5 s em vez de ~21 s; o modo Livro, ~2 s já na primeira visita.", versoes: ["0.1.127", "0.1.129", "0.1.130"] },
        { titulo: "O Dragão se escolhe", texto: "o Comece Aqui parou de dizer o contrário: escolher o Dragão custa 3 PA.", versoes: ["0.1.128"] },
        { titulo: "Grande Obra", texto: "é ela que não silencia; Ritual comum silencia.", versoes: ["0.1.128"] },
        { titulo: "Veneno que transborda", texto: "Desintoxicação: venenos somam BC, os três grandes sobem, e as Doses de quem cai passam pro aliado mais próximo.", versoes: ["0.1.137"] },
        { titulo: "Escudeiro mais contido", texto: "Aguentar uma vez por rodada, Ninguém Passa uma vez por aliado; o Aegis passa a proteger de crítico em vez de reduzir dano, e o Escudo Estendido só dá alcance.", versoes: ["0.1.134", "0.1.135"] },
        { titulo: "Novidades por fase", texto: "esta página: fases, o 'Na mesa' de cada uma e um filtro por área.", versoes: ["0.1.131"] },
        { titulo: "Livro e ficha com vida", texto: "aberturas breves, três diagramas que você controla, recursos em movimento e escolhas da criação assentando no resumo.", versoes: ["0.1.139"] },
        { titulo: "Sua ficha, sua marca", texto: "as escolas e habilidades escolhidas vestem o cabeçalho, o retrato e os painéis da ficha, nos quatro temas.", versoes: ["0.1.141"] },
      ],
      mestre: [
        { titulo: "Filtro por área", texto: "'Encontros e simulador' mostra só o que é do Mestre.", versoes: ["0.1.131"] },
        { titulo: "Técnica que diz 'Ataque' erra", texto: "o simulador rola contra a CA nove cartas corpo a corpo que nunca erravam, e os golpes finais que acertam sozinhos entram inteiros; o Deus da Espada deixa o topo.", versoes: ["0.1.132"] },
        { titulo: "Molde do meio recalibrado", texto: "PV do molde 59, 108 e 141 no 2º, 3º e 4º patamar: 5 criaturas voltam a ser Difícil, não Mortal.", versoes: ["0.1.136"] },
        { titulo: "A arena respira", texto: "brasão da árvore no lugar do ícone da raça, sombra, respiração, anel de quem age e poeira; o golpe do molde sem casas decimais.", versoes: ["0.1.138"] },
        { titulo: "Veredito do encontro", texto: "o resultado chega com uma barra mostrando a chance de vitória do grupo.", versoes: ["0.1.139"] },
        { titulo: "Grupo reconhecível", texto: "Meus Personagens mostra a escola principal de cada ficha, além do retrato e dos recursos.", versoes: ["0.1.141"] },
        { titulo: "O Escudeiro protege", texto: "o simulador joga Sob Minha Guarda, Aguentar e Aegis; o Escudeiro toma o golpe que derrubaria o mago.", versoes: ["0.1.133"] },
      ],
    },
  },
];
