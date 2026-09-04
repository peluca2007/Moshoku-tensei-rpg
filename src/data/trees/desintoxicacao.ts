import { Tree } from "@/lib/types";
import { MAGIC_ACTIONS, DESINTOX_PA_COST } from "./shared";

/**
 * Rework de 2026-09-03 — a Profundidade morreu.
 *
 * Até esta data, toda aflição do livro carregava um número de 1 a 5 que subia
 * sozinho (1 por hora, ou 1 por dia) e que cada magia da escola movia pra cima
 * ou pra baixo em incrementos diferentes. Na prática a mesa precisava de um
 * segundo relógio por personagem afetado, e o jogador de Desintoxicação passava
 * o turno fazendo aritmética em vez de jogar: "reduzo 2, mas ela subiu 1 desde
 * ontem, então purgo com a Avançada ou espero a Santo?".
 *
 * A regra nova cabe numa linha: TODA AFLIÇÃO TEM UM RANK, E UM FEITIÇO DE RANK
 * X REMOVE UMA AFLIÇÃO DE RANK X OU INFERIOR. Nada sobe, nada desce, não há
 * aritmética. Se a Peçonha de Serpente-do-Pântano é Intermediária, Purga
 * Profunda a tira; Purgar, não. O jogador olha o rank que ele tem e sabe na
 * hora o que consegue curar — que era a única pergunta que a mecânica antiga
 * respondia, e ela cobrava cinco minutos de mesa pra responder.
 *
 * A urgência não veio da Profundidade e nunca precisou dela: veio do efeito da
 * aflição (2d6 por hora, -1 atributo por semana, petrificação em quatro turnos)
 * continuar rodando até alguém tratar. Isso ficou.
 *
 * A árvore também foi NERFADA de propósito (dano, remoção universal de condição
 * e imunidades de área) e, em troca, passou a usar DESINTOX_PA_COST — a tabela
 * mais barata do livro. Ver a nota dela em shared.ts.
 */
export const DESINTOXICACAO_TREE: Tree = {
  id: "desintoxicacao",
  name: "Magia de Desintoxicação",
  icon: "/arvores/desintoxicacao.svg",
  category: "magia",
  subgroup: "Cura e Suporte",
  mechanic: {
    tag: "Rank contra Rank",
    hook:
      "A escola de uma regra só, e a mais barata do livro em PA.",
    loop: [
      "Identifique. Paladar, a Maestria de 1º patamar, diz o nome e o RANK exato da aflição só de tocar, cheirar ou provar.",
      "Compare. Um feitiço de rank X remove uma aflição de rank X ou inferior. Acabou — não existe número pra somar nem relógio pra acompanhar.",
      "Se não alcançar, escolha o preço: Sangria purga um rank acima do seu, ao custo de 3d6 irredutíveis; Selar a Maldição deixa a aflição dormente por um ano sem removê-la.",
    ],
    cost:
      "Não fecha um único ponto de ferimento, não impõe condição de combate e não ganha luta nenhuma. É barata porque o que ela compra não é vitória: é a campanha não parar quando alguém pisa no pântano errado.",
  },
  keyAttributeLabel: "Espírito",
  resourceLabel: "PM",
  tagline:
    "Trata veneno, doença, maldição e petrificação. Uma regra só: um feitiço de rank X remove uma aflição de rank X ou inferior. É a escola mais barata do livro em PA — não te faz vencer uma luta, te impede de perder a campanha.",
  proficiencies: {
    armas: "Nenhuma além do padrão (armas simples, armadura leve).",
    pericias: "O Bônus de Rank desta árvore NÃO soma em perícia nenhuma — somar em perícia é exclusivo das três árvores de Utilidade (Cap. 3).",
    nota: "Escola Formal de Magia. Conjura com Espírito. Usa a tabela barata de PA (Cap. 2, \"A Escola Barata\"), não a tabela comum de magia.",
  },
  grantedSkills: {
    fixed: ["Medicina"],
    choose: { count: 1, from: ["Natureza", "Ofícios", "Investigação"] },
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "Paladar",
        description:
          "[Rank contra Rank] Tocando, cheirando ou provando qualquer substância, você sabe exatamente o que ela é, e identifica o nome e o RANK de qualquer aflição que veja, inclusive em cadáveres. Você é imune a veneno mundano.",
      },
      talents: [
        { id: "reserva-do-purificador", name: "Reserva do Purificador", paCost: DESINTOX_PA_COST.talent.Principiante, description: "+2 PM por patamar seu em Desintoxicação. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela.", grants: { mpPerRank: 2 } },
        { id: "herborista", name: "Herborista", paCost: DESINTOX_PA_COST.talent.Principiante, description: "Fora de combate, com uma hora e material colhido, você purga uma aflição do seu rank ou inferior sem gastar PM nenhum. Uma vez por Descanso Longo." },
        { id: "mao-que-nao-contamina", name: "Mão que Não Contamina", paCost: DESINTOX_PA_COST.talent.Principiante, description: "Você não pode ser envenenado, infectado ou amaldiçoado por contato ao manusear aquilo que está tratando ou extraindo." },
      ],
      abilities: [
        {
          id: "purgar",
          name: "Purgar",
          signature: true,
          paCost: DESINTOX_PA_COST.signature.Principiante,
          pmCost: 2,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Remove do alvo uma aflição de rank Principiante — veneno, doença, maldição ou petrificação incipiente, mágica ou não.",
          incantation: "O que entrou aqui sem ser convidado e se instalou como se a casa fosse sua: sai. Sai como quiseres, mas sai agora. Purgar!",
        },
        {
          id: "antidoto",
          name: "Antídoto",
          paCost: DESINTOX_PA_COST.common.Principiante,
          pmCost: 1,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Por 1 hora, o alvo tem Vantagem em testes de resistência contra veneno e doença. Se falhar mesmo assim, a aflição o pega um rank abaixo do normal (mínimo Principiante).",
          incantation:
            "Que a pureza da minha mana proteja este sangue contra qualquer veneno ou peçonha que tente cruzar a sua pele. Antídoto!",
        },
        {
          id: "agua-limpa",
          name: "Água Limpa",
          paCost: DESINTOX_PA_COST.common.Principiante,
          pmCost: 1,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Purifica até 20 litros de comida, água, ar ou terreno contaminado.",
          incantation:
            "Água turva e corrompida pelo mal, expulsa a imundície e torna-te límpida como a primeira chuva. Água Limpa!",
        },
        {
          id: "sangria",
          name: "Sangria",
          paCost: DESINTOX_PA_COST.common.Principiante,
          pmCost: 2,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "3d6 de dano ao alvo, que não pode ser reduzido nem resistido" },
          effect:
            "A válvula de escape da escola, e a única: você purga uma aflição de UM rank acima do que o seu patamar alcança, arrancando-a junto com o sangue. Uma vez por aflição por Descanso Longo. Não funciona em quem está a 0 PV.",
          incantation:
            "Sangue contaminado que carrega a mácula, escorre para fora do corpo e leva consigo o veneno que te habita. Sangria!",
        },
        {
          id: "estomago-de-ferro",
          name: "Estômago de Ferro",
          paCost: DESINTOX_PA_COST.common.Principiante,
          pmCost: 1,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Por 8 horas, o alvo pode comer e beber qualquer coisa sem consequência.",
          incantation:
            "Que este ventre feche suas portas contra as impurezas e aceite qualquer alimento sem jamais vacilar. Estômago de Ferro!",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "Extração",
        description:
          "Ao purgar qualquer aflição, você pode capturá-la num frasco em vez de dissipá-la (mantém o rank original, dura 1 mês). Aplicada em arma, comida ou superfície, força teste de Vigor (CD 8 + BC) na próxima criatura exposta. Você carrega até Espírito frascos.",
      },
      talents: [
        { id: "frasco-estavel", name: "Frasco Estável", paCost: DESINTOX_PA_COST.talent.Intermediário, description: "Suas extrações duram um ano em vez de um mês, e você carrega o dobro de frascos." },
        { id: "purga-coletiva", name: "Purga Coletiva", paCost: DESINTOX_PA_COST.talent.Intermediário, description: "Purgar passa a atingir até três criaturas adjacentes com uma conjuração." },
        { id: "leitura-de-sintoma", name: "Leitura de Sintoma", paCost: DESINTOX_PA_COST.talent.Intermediário, description: "Você sabe se alguém está afetado por algo antes dos sintomas aparecerem, incluindo maldições dormentes e venenos de efeito retardado." },
      ],
      abilities: [
        {
          id: "purga-profunda",
          name: "Purga Profunda",
          signature: true,
          paCost: DESINTOX_PA_COST.signature.Intermediário,
          pmCost: 4,
          range: "9 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Remove uma aflição de rank Intermediário ou inferior, à distância.",
          incantation:
            "Veneno que corres silencioso pelas veias mais fundas, onde a mão do curandeiro comum nunca chega: eu te ordeno a parar, a retroceder e a abandonar esta carne para sempre. Purga Profunda!",
        },
        {
          id: "muro-esteril",
          name: "Muro Estéril",
          paCost: DESINTOX_PA_COST.common.Intermediário,
          pmCost: 3,
          range: "Esfera de 9m",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Por 1 hora, gás venenoso, esporo, praga, ácido e ar contaminado não entram na área.",
          incantation:
            "Que este ar seja blindado contra pragas, contra névoas venenosas e contra todo vapor pestilento que a maldade dos homens ainda venha a inventar depois de mim. Nada atravessa. Muro Estéril!",
        },
        {
          id: "torpor",
          name: "Torpor",
          paCost: DESINTOX_PA_COST.common.Intermediário,
          pmCost: 3,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Teste de Vigor (CD 8 + BC) ou o alvo fica Envenenado por 1 minuto (Desvantagem em ataques e testes de atributo). Sem dano.",
          incantation:
            "Sombra que adormece os sentidos sem pedir licença a nenhum deles, penetra devagar nas juntas e faz com que cada movimento dele custe o dobro do que custava. Torpor!",
        },
        {
          id: "diagnostico-de-praga",
          name: "Diagnóstico de Praga",
          paCost: DESINTOX_PA_COST.common.Intermediário,
          pmCost: 2,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Identifica todas as criaturas doentes, envenenadas ou amaldiçoadas num raio de 18m, o rank da aflição de cada uma, e quem foi a origem.",
          incantation:
            "Olhos da medicina que tudo enxergam, revelem a mim a origem do mal, o nome do veneno e o tempo que ele ainda tem de vida. Diagnóstico de Praga!",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d6+3",
      mastery: {
        name: "Contra a Maré",
        description:
          "Aflições de rank Avançado ou inferior ficam DORMENTES em criaturas a até 9 metros de você, enquanto você estiver consciente: continuam lá, mas param de causar efeito. Isso não as remove — se você cair ou se afastar, o efeito volta na hora. Desbloqueia Magia Combinada.",
      },
      talents: [
        { id: "purificador-de-guerra", name: "Purificador de Guerra", paCost: DESINTOX_PA_COST.talent.Avançado, description: "Muro Estéril e Quarentena passam a cobrir o dobro da área e a durar o dobro do tempo." },
        { id: "extracao-refinada", name: "Extração Refinada", paCost: DESINTOX_PA_COST.talent.Avançado, description: "Aflições extraídas por você impõem Desvantagem no teste de Vigor da vítima ao serem aplicadas em outra criatura." },
        { id: "corpo-recusado", name: "Corpo Recusado", paCost: DESINTOX_PA_COST.talent.Avançado, description: "Você é imune a veneno e doença NÃO-mágicos. Maldição, petrificação e veneno mágico continuam te pegando normalmente." },
      ],
      abilities: [
        {
          id: "anular",
          name: "Anular",
          signature: true,
          paCost: DESINTOX_PA_COST.signature.Avançado,
          pmCost: 6,
          range: "9 metros",
          actions: MAGIC_ACTIONS.Avançado,
          effect:
            "Remove do alvo uma condição da lista da escola: Envenenado, Paralisado, Petrificado, Cego ou Surdo — e só quando a origem dela for veneno, doença, maldição ou petrificação. Também remove aflições de rank Avançado ou inferior. Condições vindas de golpe, magia elementar ou medo (Atordoado, Amedrontado, Congelado, Em Chamas, Atolado, Soterrado, Desequilibrado, Marcado) NÃO são desta escola: isso é Milagre Menor, na Cura.",
          incantation:
            "Tudo aquilo que paralisa, cega, ensurdece ou petrifica a carne por um caminho que não seja o do aço honesto: desfaz-te agora, diante da minha autoridade, e leva contigo todo o tormento que trouxeste — inclusive aquele que ainda nem tinha começado a doer nele. Anular!",
        },
        {
          id: "quarentena",
          name: "Quarentena",
          paCost: DESINTOX_PA_COST.common.Avançado,
          pmCost: 5,
          range: "Esfera de 12m",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "Por 10 minutos, nada tóxico, infeccioso ou amaldiçoado atravessa a borda da área, nos dois sentidos.",
          incantation:
            "Que esta redoma invisível impeça a travessia de toda infecção, de toda peste e de toda podridão, nos dois sentidos e sem uma única exceção — selando o mal do lado de fora se ele ainda estiver lá fora, e do lado de dentro se a desgraça já estiver aqui conosco. Quarentena!",
        },
        {
          id: "corrosao",
          name: "Corrosão",
          paCost: DESINTOX_PA_COST.common.Avançado,
          pmCost: 5,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "3d6 de dano ácido (dobrado contra construtos e armaduras pesadas)" },
          effect: "Teste de Vigor (CD 8 + BC). Falha: dano e Envenenado por 1 minuto. Metal não-mágico exposto perde 2 de CA até uma hora de conserto com ferramentas.",
          incantation:
            "Ácido voraz que devoras aço, pedra e carne sem te dares ao trabalho de distinguir qual delas é qual, dissolve a carcaça do meu inimigo justamente por onde ela for mais orgulhosa, e não deixes nenhuma armadura inteira o bastante pra contar a história depois. Corrosão!",
        },
        {
          id: "sangue-trocado-desintox",
          name: "Sangue Trocado",
          paCost: DESINTOX_PA_COST.common.Avançado,
          pmCost: 4,
          range: "Toque",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "Você transfere uma aflição de um alvo para você mesmo, com o rank intacto. Você não pode purgá-la de si mesmo antes do seu próximo Descanso Longo — é um sacrifício, não um atalho.",
          incantation:
            "Transfiro para o meu próprio vaso a mácula que te corrói por dentro, e a recebo inteira, do jeito exato que ela é, sem regatear e sem descontar nada dela no caminho. É problema meu agora. Trata de continuar vivo, pra que isto tenha valido. Sangue Trocado!",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "Estado Anulado",
        description:
          "Toda criatura que você purgar fica imune àquela aflição específica por 24 horas. Uma vez por rodada, gastando sua Reação, você anula com um toque qualquer condição da lista de Anular numa criatura adjacente, sem gastar PM.",
      },
      talents: [
        { id: "maos-limpas", name: "Mãos Limpas", paCost: DESINTOX_PA_COST.talent.Santo, description: "Uma vez por Descanso Longo, conjure uma magia de Desintoxicação sem gastar Ação nenhuma." },
      ],
      abilities: [
        {
          id: "purificacao",
          name: "Purificação",
          signature: true,
          ritual: true,
          paCost: DESINTOX_PA_COST.signature.Santo,
          pmCost: 11,
          range: "Esfera de 30m",
          actions: MAGIC_ACTIONS.Santo,
          effect: "Toda criatura, água, solo, alimento e estrutura na área é purgada de aflições de rank Santo ou inferior.",
          incantation: "Que a terra esqueça o que foi despejado nela, no ano em que foi e pelas mãos que já morreram. Que a água esqueça por onde correu. Que a carne esqueça o que entrou nela sem bater na porta. Eu não estou curando ninguém aqui: estou apagando um capítulo inteiro deste lugar, e vou apagá-lo tão fundo que nem os que sobreviverem vão lembrar de contá-lo. Purificação!",
        },
        {
          id: "selar-a-maldicao",
          name: "Selar a Maldição",
          paCost: DESINTOX_PA_COST.common.Santo,
          pmCost: 9,
          range: "Toque",
          actions: MAGIC_ACTIONS.Santo,
          effect: "Uma aflição de rank acima do seu alcance fica dormente por até um ano: continua no corpo, mas não causa efeito nenhum. É como se lida com o que não se consegue curar.",
          incantation:
            "Maldição antiga que a minha mão ainda não consegue quebrar por completo — e eu admito isso em voz alta, na frente dele e na frente de quem mais estiver ouvindo: fica congelada neste corpo, sem avançar um único milímetro sequer, sem cobrar mais um único dia sequer, até que chegue alguém melhor do que eu, ou até o dia do nosso ajuste final. Selar a Maldição!",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "Veneno",
        description:
          "Você conjura aflições diretamente, sem frasco nem contato. Venenos criados por você são de rank Avançado. Você não precisa mais de material colhido para fabricar veneno (Cap. 5, §4).",
      },
      talents: [
        { id: "duas-faces", name: "Duas Faces", paCost: DESINTOX_PA_COST.talent.Rei, description: "Quando purgar uma aflição de uma criatura, gaste 1 Ação para aplicá-la imediatamente em outra criatura visível a até 9m, sem frasco. A vítima ainda faz o teste de Vigor normal." },
      ],
      abilities: [
        {
          id: "sopro-podre",
          name: "Sopro Podre",
          signature: true,
          paCost: DESINTOX_PA_COST.signature.Rei,
          pmCost: 13,
          range: "Cone de 18m",
          actions: MAGIC_ACTIONS.Rei,
          damage: { normal: "6d8 de dano de veneno" },
          effect:
            "Teste de Vigor. Falha: dano, Envenenado por 10 minutos e uma aflição de rank Avançado. Sucesso: metade e nenhuma aflição. Não funciona em construtos, mortos-vivos ou quem não respira.",
          incantation:
            "Vento carregado com o miasma das covas mais antigas e mais esquecidas deste continente, daquelas que ninguém abriu porque ninguém lembrava mais onde ficavam: avança em cone sobre os meus inimigos, entra pela boca que eles não vão conseguir fechar a tempo, queima os pulmões deles por dentro, e faz apodrecer tudo aquilo que a tua brisa imunda encostar pelo caminho, sem exceção nenhuma. Sopro Podre!",
        },
        {
          id: "toque-do-fim",
          name: "Toque do Fim",
          paCost: DESINTOX_PA_COST.common.Rei,
          pmCost: 10,
          range: "Toque",
          actions: MAGIC_ACTIONS.Rei,
          effect:
            "Teste de Vigor (CD 8 + BC). Falha: o alvo recebe uma aflição de rank Rei à sua escolha, que só um mago de patamar Rei ou superior consegue remover. Ela não mata sozinha — faz o que a aflição escolhida faz, e não para.",
          incantation:
            "Apenas um toque da ponta dos meus dedos, e nada além disso, basta pra semear no teu corpo a aflição derradeira — aquela que não corre, não grita, e não te dá sequer o alívio de uma febre alta pra avisar que chegou. Ela vai se instalar devagar, no ritmo dela e não no teu, e vai continuar ali depois que tu esqueceres desta tarde, depois que trocares de reino, e depois que te convenceres de que escapaste. Ninguém abaixo do meu patamar vai conseguir tirá-la de ti. Toque do Fim!",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d8+4",
      mastery: {
        name: "O Corpo Limpo",
        description:
          "Você purga qualquer aflição de rank Imperador ou inferior sem rolagem, ritual ou tempo — inclusive petrificação completa, maldições hereditárias e parasitas mágicos. É permanentemente imune a veneno, doença, maldição e petrificação. Uma vez por turno, conjure magia de Desintoxicação de rank Avançado ou inferior em Silenciosa sem gastar Ação.",
      },
      talents: [
        { id: "nada-entra", name: "Nada Entra", paCost: DESINTOX_PA_COST.talent.Imperador, description: "Aliados a até 9 metros de você têm Vantagem em todo teste de resistência contra veneno, doença e maldição, e nunca pegam uma aflição de rank Avançado ou inferior." },
      ],
      abilities: [
        {
          id: "o-mundo-sem-praga",
          name: "O Mundo Sem Praga",
          signature: true,
          ritual: true,
          paCost: DESINTOX_PA_COST.signature.Imperador,
          pmCost: 22,
          range: "Raio de 3 km",
          actions: MAGIC_ACTIONS.Imperador,
          effect: "Toda aflição de rank Imperador ou inferior deixa de existir dentro do raio: em pessoas, água, solo, ar e paredes. Efeito narrativo permanente.",
          incantation:
            "Que todo o veneno, toda a doença incurável e toda a maldição ancestral que rasteja sobre esta terra desde antes de existir alguém pra lhes dar nome deixem de existir por completo neste instante — não recuadas, não adormecidas, não trancadas num frasco pra voltarem daqui a cem anos na mão de outro tolo: apagadas. Eu varro este solo com a minha vontade inteira, do primeiro palmo ao último, e declaro em voz alta que a impureza não é mais bem-vinda em lugar nenhum que eu consiga enxergar daqui de cima. O Mundo Sem Praga!",
        },
        {
          id: "nome-do-veneno",
          name: "Nome do Veneno",
          paCost: DESINTOX_PA_COST.common.Imperador,
          pmCost: 18,
          range: "45 metros",
          actions: MAGIC_ACTIONS.Imperador,
          effect: "Você transfere uma aflição inteira, com o rank intacto, de uma criatura afetada para outra visível. O destinatário faz um teste de Vigor (CD 8 + BC) para recusar; criaturas de rank Deus recusam com Vantagem.",
          incantation:
            "Toda mácula que existe tem um nome verdadeiro, e é por ele que ela sabe a quem pertence, a quem deve obediência e em qual corpo lhe cabe ficar. Durante anos eu estudei esses nomes, um a um, em livros que ninguém queria emprestar e em gente que já não tinha mais tempo de esperar que eu terminasse de ler. Agora eu pronuncio o teu — o teu de verdade, não o apelido que os médicos de vila te deram por não saberem melhor — e enquanto ele ainda estiver no ar, tu não pertences a este corpo aqui. Pertences àquele ali. Vai. Nome do Veneno!",
        },
      ],
    },
  ],
};
