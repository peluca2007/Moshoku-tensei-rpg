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
 *
 * Rework de 2026-09-26 — Dose e Inversão (decisão do autor: "a Desintoxicação é
 * muito chatinha"). O Rank contra Rank ficou, mas a escola deixou de esperar o
 * Mestre criar um problema: os venenos dela empilham DOSE no inimigo (condição do
 * Cap. 4, até 3; 2 = Envenenado; a 3ª é o Colapso), e os feitiços de purgar
 * podem INVERTER as Doses em dano de uma vez. A decisão de mesa é a de 2 Doses:
 * cobrar agora ou arriscar a 3ª e derrubar o turno do alvo.
 */

/** Inverter (Cap. 2): o mesmo texto nas três cartas que cobram a Dose. */
const inverter = (dados: string) =>
  ` Inverter: numa criatura com Dose, em vez de purgar, você tira todas as Doses dela e cada uma vira ${dados} de dano de veneno, sem teste — o veneno já está dentro.`;
const INV_PURGAR = inverter("2d6");
const INV_PROFUNDA = inverter("4d6");
const INV_ANULAR = inverter("5d8");

export const DESINTOXICACAO_TREE: Tree = {
  id: "desintoxicacao",
  name: "Magia de Desintoxicação",
  icon: "/arvores/desintoxicacao.svg",
  category: "magia",
  subgroup: "Cura e Suporte",
  mechanic: {
    tag: "Dose e Inversão",
    hook:
      "Envenena aos poucos e cobra tudo de uma vez — e continua sendo a única que cura o que ninguém mais cura.",
    loop: [
      "Dose. Todo veneno da escola, na falha do Vigor, deixa 1 Dose no alvo (até 3, dura o combate). Com 2 Doses ele está Envenenado. A 3ª é o Colapso: as Doses saem e ele fica Atordoado até o fim do próximo turno dele.",
      "Inverter. Purgar, Purga Profunda e Anular, lançados numa criatura com Dose, tiram todas as Doses e as viram dano de veneno de uma vez, sem teste: 2d6, 4d6 e 5d8 por Dose. Com 2 Doses no alvo, a escolha é sua — cobrar agora, ou arriscar a 3ª e tirar o turno dele.",
      "Purificar. Num aliado, os mesmos feitiços fazem o que sempre fizeram: rank contra rank — um feitiço de rank X remove uma aflição de rank X ou inferior. Paladar diz o rank; Sangria e Selar a Maldição são o preço quando o seu não alcança.",
    ],
    cost:
      "Não fecha um único ponto de ferimento, e a Dose pede paciência: são dois venenos que pegam antes da primeira cobrança. Construtos, mortos-vivos e quem não respira não recebem Dose — contra eles, a escola volta a ser só purificação.",
  },
  keyAttributeLabel: "Espírito",
  resourceLabel: "PM",
  tagline:
    "Trata veneno, doença, maldição e petrificação — um feitiço de rank X remove uma aflição de rank X ou inferior. Na luta, empilha Dose no inimigo e a cobra de uma vez. É a escola mais barata do livro em PA.",
  proficiencies: {
    armas: "Não concede grupo de arma nenhum: quem abre esta escola fica só com o piso que todo personagem tem, e quem quiser mais paga 2 PA por família. Armadura leve apenas.",
    gruposDeArma: [],
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
      hpDiceFormula: "1d6+1",
      mastery: {
        name: "Paladar",
        description:
          "[Rank contra Rank] Tocando, cheirando ou provando qualquer substância, você sabe exatamente o que ela é, e identifica o nome e o RANK de qualquer aflição que veja, inclusive em cadáveres. Você é imune a veneno mundano, e todo aliado a até 3 metros de você soma o seu Bônus de Rank em testes de resistência contra veneno, doença e maldição: perto de você, o que devia pegar o grupo inteiro pega um.",
      },
      talents: [
        { id: "reserva-do-purificador", name: "Reserva do Purificador", paCost: DESINTOX_PA_COST.talent.Principiante, description: "+2 PM e +2 PV por patamar seu em Desintoxicação. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela.", grants: { mpPerRank: 2, hpPerRank: 2 } },
        { id: "herborista", name: "Herborista", paCost: DESINTOX_PA_COST.talent.Principiante, description: "Fora de combate, com uma hora e material colhido, você purga uma aflição do seu rank ou inferior sem gastar PM nenhum. Uma vez por Descanso Longo." },
        { id: "mao-que-nao-contamina", name: "Dose Certa", paCost: DESINTOX_PA_COST.talent.Principiante, description: "Quando uma criatura falhar por 5 ou mais no teste de Vigor contra um veneno seu, recebe 1 Dose a mais." },
      ],
      abilities: [
        {
          id: "purgar",
          name: "Purgar",
          signature: true,
          paCost: DESINTOX_PA_COST.signature.Principiante,
          pmCost: 3,
          range: "9 metros",
          actions: { normal: 1 },
          costNote:
            "1 Ação onde o rank pede 2. Purgar é a magia que justifica a escola inteira existir, e ela cobrava dois terços de um turno pra desfazer o que o Mestre fez ontem: o purificador chegava, tratava um aliado, e o turno dele tinha acabado. O desconto é o que torna a escola jogável no meio de uma luta — e, desde a Dose, é também o golpe que cobra o veneno.",
          damage: { normal: "2d6 de dano de veneno por Dose invertida" },
          effect: "Remove do alvo uma aflição de rank Principiante — veneno, doença, maldição ou petrificação incipiente, mágica ou não." + INV_PURGAR,
          incantation: "O que entrou aqui sem ser convidado e se instalou como se a casa fosse sua: sai. Sai como quiseres, mas sai agora. Purgar!",
        },
        {
          id: "antidoto",
          name: "Antídoto",
          paCost: DESINTOX_PA_COST.common.Principiante,
          pmCost: 2,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Até três criaturas que você tocar: por 1 hora, cada uma tem Vantagem em testes de resistência contra veneno e doença, e não recebe Dose. Se falhar mesmo assim, a aflição a pega um rank abaixo do normal (mínimo Principiante). É o feitiço de antes da luta: imunizar o grupo inteiro antes de entrar no pântano.",
          incantation:
            "Que a pureza da minha mana proteja este sangue contra qualquer veneno ou peçonha que tente cruzar a sua pele. Antídoto!",
        },
        {
          id: "agua-limpa",
          name: "Água Limpa",
          paCost: DESINTOX_PA_COST.common.Principiante,
          pmCost: 2,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Purifica até 20 litros de comida, água, ar ou terreno contaminado.",
          incantation:
            "Água turva e corrompida pelo mal, expulsa a imundície e torna-te límpida como a primeira chuva. Água Limpa!",
        },
        {
          id: "peconha",
          name: "Peçonha",
          paCost: DESINTOX_PA_COST.common.Principiante,
          pmCost: 3,
          range: "18 metros",
          actions: { normal: 1 },
          costNote:
            "1 Ação onde o rank pede 2. É o veneno que abre a Dose no 1º patamar, e a 2 Ações ninguém o usaria: o purificador voltaria a passar a luta inteira esperando que alguém fosse envenenado pra ter o que fazer. Quem entende de veneno sabe fazer veneno — a Maestria de Rei só admite em voz alta o que este feitiço já faz pequeno.",
          damage: { normal: "2d6 de dano de veneno" },
          effect:
            "Teste de Vigor (CD 8 + BC). Falha: dano e 1 Dose. Sucesso: metade do dano e nenhuma Dose. Não afeta construtos, mortos-vivos nem quem não respira.",
          incantation:
            "Peçonha que dorme em toda raiz amarga deste mundo e só espera uma mão que saiba pedir: sobe por este braço e acha o sangue dele. Peçonha!",
        },
        {
          id: "rosa-preta",
          name: "Rosa-Preta",
          paCost: DESINTOX_PA_COST.common.Principiante,
          pmCost: 3,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Teste de Vigor (CD 8 + BC). Falha: o alvo cai Inconsciente por 1 minuto (10 rodadas); sofrer dano o acorda. Fora de combate, o sono dura 8 horas. Sucesso: nenhum efeito — o veneno é sutil, não violento. Não afeta construtos, mortos-vivos nem quem não respira.",
          incantation: "Rosa dos jardins de Asura, entra neste sangue sem aviso e apaga-lhe a consciência como uma vela entre os dedos. Rosa-Preta!",
        },
        {
          id: "sangria",
          name: "Sangria",
          paCost: DESINTOX_PA_COST.common.Principiante,
          pmCost: 3,
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
          pmCost: 2,
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
      hpDiceFormula: "1d6+1",
      mastery: {
        name: "Extração",
        description:
          "Ao purgar qualquer aflição, você pode capturá-la num frasco em vez de dissipá-la (mantém o rank original, dura 1 mês). Aplicada em arma, comida ou superfície, a aflição força o teste dela na próxima criatura exposta, com a CD da própria aflição (Cap. 4: 8 + 2 × o Bônus de Rank da aflição). Você carrega até Espírito frascos.",
      },
      talents: [
        { id: "frasco-estavel", name: "Frasco Estável", paCost: DESINTOX_PA_COST.talent.Intermediário, description: "Suas extrações duram um ano em vez de um mês, e você carrega o dobro de frascos." },
        { id: "purga-coletiva", name: "Purga Coletiva", paCost: DESINTOX_PA_COST.talent.Intermediário, description: "Purgar passa a atingir até três criaturas a até 3 metros umas das outras com uma conjuração — purgando os aliados e Invertendo os inimigos, na mesma Ação." },
        { id: "leitura-de-sintoma", name: "Leitura de Sintoma", paCost: DESINTOX_PA_COST.talent.Intermediário, description: "Você sabe se alguém está afetado por algo antes dos sintomas aparecerem, incluindo maldições dormentes e venenos de efeito retardado." },
      ],
      abilities: [
        {
          id: "purga-profunda",
          name: "Purga Profunda",
          signature: true,
          paCost: DESINTOX_PA_COST.signature.Intermediário,
          pmCost: 6,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "4d6 de dano de veneno por Dose invertida" },
          effect: "Remove uma aflição de rank Intermediário ou inferior, à distância." + INV_PROFUNDA,
          incantation:
            "Veneno que corres silencioso pelas veias mais fundas, onde a mão do curandeiro comum nunca chega: eu te ordeno a parar, a retroceder e a abandonar esta carne para sempre. Purga Profunda!",
        },
        {
          id: "muro-esteril",
          name: "Muro Estéril",
          paCost: DESINTOX_PA_COST.common.Intermediário,
          pmCost: 5,
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
          pmCost: 5,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Teste de Vigor (CD 8 + BC). Falha: 2 Doses de uma vez — o alvo já fica Envenenado. Sucesso: 1 Dose. Sem dano.",
          incantation:
            "Sombra que adormece os sentidos sem pedir licença a nenhum deles, penetra devagar nas juntas e faz com que cada movimento dele custe o dobro do que custava. Torpor!",
        },
        {
          id: "diagnostico-de-praga",
          name: "Diagnóstico de Praga",
          paCost: DESINTOX_PA_COST.common.Intermediário,
          pmCost: 4,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Identifica todas as criaturas doentes, envenenadas ou amaldiçoadas num raio de 18m, o rank da aflição de cada uma, e quem foi a origem.",
          incantation:
            "Olhos da medicina que tudo enxergam, revelem a mim a origem do mal, o nome do veneno e o tempo que ele ainda tem de vida. Diagnóstico de Praga!",
        },
        {
          id: "sangue-de-serpente",
          name: "Sangue de Serpente",
          paCost: DESINTOX_PA_COST.common.Intermediário,
          pmCost: 5,
          range: "18 metros",
          actions: { normal: 1 },
          costNote:
            "1 Ação onde o rank pede 2. É a segunda arma ofensiva da escola, e sem ela o purificador passa o 2º patamar inteiro com a Peçonha do 1º como único golpe — duas Ações de conjuração num veneno que é a mesma coisa que ele já fazia, só mais forte, não é jogo: é burocracia.",
          damage: { normal: "3d6 de dano de veneno" },
          effect: "Teste de Vigor (CD 8 + BC). Falha: dano, 1 Dose e Desvantagem em testes de Vigor por 1 minuto — a próxima Dose entra mais fácil. Sucesso: metade do dano e nenhuma Dose. Não afeta construtos, mortos-vivos nem quem não respira.",
          incantation:
            "Sangue de serpente que rasteja no fundo dos pântanos onde ninguém volta a pescar: envenena as entranhas dele e faz com que o corpo inteiro esqueça como resistir ao que vier depois. Sangue de Serpente!",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "Contra a Maré",
        description:
          "Aflições de rank Avançado ou inferior ficam DORMENTES em você e nos seus aliados a até 9 metros, enquanto você estiver consciente: continuam lá, mas param de causar efeito. Isso não as remove — se você cair ou se afastar, o efeito volta na hora. Desbloqueia Magia Combinada.",
      },
      talents: [
        { id: "purificador-de-guerra", name: "Purificador de Guerra", paCost: DESINTOX_PA_COST.talent.Avançado, description: "Muro Estéril e Quarentena passam a cobrir o dobro da área e a durar o dobro do tempo." },
        { id: "extracao-refinada", name: "Extração Refinada", paCost: DESINTOX_PA_COST.talent.Avançado, description: "Aflições extraídas por você impõem Desvantagem no teste de resistência da vítima ao serem aplicadas em outra criatura." },
        { id: "corpo-recusado", name: "Corpo Recusado", paCost: DESINTOX_PA_COST.talent.Avançado, description: "Você é imune a veneno e doença NÃO-mágicos. Maldição, petrificação e veneno mágico continuam te pegando normalmente." },
      ],
      abilities: [
        {
          id: "anular",
          name: "Anular",
          signature: true,
          paCost: DESINTOX_PA_COST.signature.Avançado,
          pmCost: 9,
          range: "9 metros",
          actions: MAGIC_ACTIONS.Avançado,
          effect:
            "Remove do alvo uma condição da lista da escola: Envenenado, Paralisado, Petrificado, Cego ou Surdo — e só quando a origem dela for veneno, doença, maldição ou petrificação, e a aflição que a causou for de rank Avançado ou inferior. Também remove aflições de rank Avançado ou inferior. Condições vindas de golpe, magia elementar ou medo (Atordoado, Amedrontado, Congelado, Em Chamas, Atolado, Soterrado, Desequilibrado, Marcado) NÃO são desta escola: isso é Milagre Menor, na Cura." + INV_ANULAR,
          incantation:
            "Tudo aquilo que paralisa, cega, ensurdece ou petrifica a carne por um caminho que não seja o do aço honesto: desfaz-te agora, diante da minha autoridade, e leva contigo todo o tormento que trouxeste — inclusive aquele que ainda nem tinha começado a doer nele. Anular!",
        },
        {
          id: "quarentena",
          name: "Quarentena",
          paCost: DESINTOX_PA_COST.common.Avançado,
          pmCost: 8,
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
          pmCost: 8,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "5d6 de dano ácido (dobrado contra construtos e armaduras pesadas)" },
          effect: "Teste de Vigor (CD 8 + BC). Falha: dano e 1 Dose (construtos sofrem o ácido, mas não recebem Dose). Metal não-mágico exposto perde 2 de CA até uma hora de conserto com ferramentas.",
          incantation:
            "Ácido voraz que devoras aço, pedra e carne sem te dares ao trabalho de distinguir qual delas é qual, dissolve a carcaça do meu inimigo justamente por onde ela for mais orgulhosa, e não deixes nenhuma armadura inteira o bastante pra contar a história depois. Corrosão!",
        },
        {
          id: "sangue-trocado-desintox",
          name: "Sangue Trocado",
          paCost: DESINTOX_PA_COST.common.Avançado,
          pmCost: 7,
          range: "Toque",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "Você transfere uma aflição de um alvo para você mesmo, com o rank intacto. Você não pode purgá-la de si mesmo antes do seu próximo Descanso Longo — é um sacrifício, não um atalho.",
          incantation:
            "Transfiro para o meu próprio vaso a mácula que te corrói por dentro, e a recebo inteira, do jeito exato que ela é, sem regatear e sem descontar nada dela no caminho. É problema meu agora. Trata de continuar vivo, pra que isto tenha valido. Sangue Trocado!",
        },
        {
          id: "paralisia-de-aranha",
          name: "Paralisia de Aranha",
          paCost: DESINTOX_PA_COST.common.Avançado,
          pmCost: 8,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "Teste de Vigor (CD 8 + BC). Falha: Deslocamento 0 por 1 turno e 1 Dose. Falha por 5 ou mais: Paralisado por 1 turno. Sucesso: Deslocamento reduzido à metade por 1 turno. Não causa dano — o veneno de aranha não mata, ele PRENDE. Não afeta construtos, mortos-vivos nem quem não respira.",
          incantation:
            "Veneno de aranha que não mata e nunca matou — que entra pelas veias e tranca cada junta, cada músculo, cada tendão, até que o corpo inteiro vire uma estátua que ainda respira e ainda sente, mas não se mexe. Paralisia de Aranha!",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d8+2",
      mastery: {
        name: "Estado Anulado",
        description:
          "Toda criatura que você purgar fica imune àquela aflição específica por 24 horas. Uma vez por rodada, gastando sua Reação, você anula com um toque qualquer condição da lista de Anular numa criatura adjacente, sem gastar PM, desde que a aflição que a causou seja de rank Santo ou inferior — ou, com o mesmo toque, Inverte as Doses de um inimigo adjacente (3d8 de dano de veneno por Dose).",
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
          pmCost: 15,
          range: "Esfera de 30m",
          actions: { normal: 3 },
          effect: "Toda criatura, água, solo, alimento e estrutura na área é purgada de aflições de rank Santo ou inferior.",
          incantation: "Que a terra esqueça o que foi despejado nela, no ano em que foi e pelas mãos que já morreram. Que a água esqueça por onde correu. Que a carne esqueça o que entrou nela sem bater na porta. Eu não estou curando ninguém aqui: estou apagando um capítulo inteiro deste lugar, e vou apagá-lo tão fundo que nem os que sobreviverem vão lembrar de contá-lo. Purificação!",
        },
        {
          id: "selar-a-maldicao",
          name: "Selar a Maldição",
          paCost: DESINTOX_PA_COST.common.Santo,
          pmCost: 13,
          range: "Toque",
          actions: MAGIC_ACTIONS.Santo,
          effect: "Uma aflição de rank acima do seu alcance fica dormente por até um ano: continua no corpo, mas não causa efeito nenhum. É como se lida com o que não se consegue curar.",
          incantation:
            "Maldição antiga que a minha mão ainda não consegue quebrar por completo — e eu admito isso em voz alta, na frente dele e na frente de quem mais estiver ouvindo: fica congelada neste corpo, sem avançar um único milímetro sequer, sem cobrar mais um único dia sequer, até que chegue alguém melhor do que eu, ou até o dia do nosso ajuste final. Selar a Maldição!",
        },
        {
          id: "fel-alado",
          name: "Fel Alado",
          paCost: DESINTOX_PA_COST.common.Santo,
          pmCost: 13,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Santo,
          costNote: "O cântico breve condensa o preparo do veneno de Wyvern; as demais regras da conjuração permanecem.",
          damage: { normal: "4d8 de dano de veneno" },
          effect: "Teste de Vigor (CD 8 + BC). Falha: dano, 1 Dose e Cego até o fim do próximo turno. Sucesso: metade do dano e nenhuma condição. O veneno de Wyvern não é o mais forte do catálogo — é o mais cruel: mata devagar, e arranca a visão antes da vida. Não afeta construtos, mortos-vivos nem quem não respira.",
          incantation:
            "Bile de Wyvern destilada no Continente Demoníaco, onde até o ar tem gosto de cinza e os bichos aprenderam a cegar antes de matar: queima os olhos dele primeiro, depois o resto — na ordem que o monstro ensinou. Fel Alado!",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d8+2",
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
          pmCost: 18,
          range: "Cone de 18m",
          actions: MAGIC_ACTIONS.Rei,
          damage: { normal: "8d8 de dano de veneno" },
          effect:
            "Teste de Vigor (CD 8 + BC). Falha: dano, 2 Doses (o alvo fica Envenenado) e uma aflição de rank Avançado à sua escolha. Sucesso: metade do dano e 1 Dose. Não funciona em construtos, mortos-vivos ou quem não respira.",
          incantation:
            "Vento carregado com o miasma das covas mais antigas e mais esquecidas deste continente, daquelas que ninguém abriu porque ninguém lembrava mais onde ficavam: avança em cone sobre os meus inimigos, entra pela boca que eles não vão conseguir fechar a tempo, queima os pulmões deles por dentro, e faz apodrecer tudo aquilo que a tua brisa imunda encostar pelo caminho, sem exceção nenhuma. Sopro Podre!",
        },
        {
          id: "toque-do-fim",
          name: "Toque do Fim",
          paCost: DESINTOX_PA_COST.common.Rei,
          pmCost: 15,
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
      hpDiceFormula: "1d8+3",
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
          pmCost: 28,
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
          pmCost: 24,
          range: "45 metros",
          actions: MAGIC_ACTIONS.Imperador,
          effect: "Você transfere TODAS as aflições de uma criatura afetada, de uma vez e com o rank intacto, para outra visível. O destinatário faz um teste de Vigor (CD 8 + BC) com Desvantagem para recusar; criaturas de rank Deus testam sem a Desvantagem.",
          incantation:
            "Toda mácula que existe tem um nome verdadeiro, e é por ele que ela sabe a quem pertence, a quem deve obediência e em qual corpo lhe cabe ficar. Durante anos eu estudei esses nomes, um a um, em livros que ninguém queria emprestar e em gente que já não tinha mais tempo de esperar que eu terminasse de ler. Agora eu pronuncio o teu — o teu de verdade, não o apelido que os médicos de vila te deram por não saberem melhor — e enquanto ele ainda estiver no ar, tu não pertences a este corpo aqui. Pertences àquele ali. Vai. Nome do Veneno!",
        },
        {
          id: "sombra-no-sangue",
          name: "Sombra no Sangue",
          paCost: DESINTOX_PA_COST.common.Imperador,
          pmCost: 24,
          range: "Toque",
          actions: MAGIC_ACTIONS.Imperador,
          costNote: "O cântico breve acompanha a aplicação discreta do veneno; as demais regras da conjuração permanecem.",
          effect: "Teste de Vigor (CD 8 + BC) com Desvantagem. Falha: sem efeito imediato algum — nenhum sintoma, nenhuma dor, nenhum sinal. Três turnos depois (ou três dias, fora de combate), o veneno detona: 8d10 de dano de veneno irredutível. Só uma Purificação de rank Santo ou superior aplicada ANTES da detonação a impede — e só se o curandeiro souber que está lá. Sucesso: o corpo recusa o veneno, e ele sabe que alguém tentou. Não afeta construtos, mortos-vivos nem quem não respira.",
          incantation:
            "O Líquido Sombrio não anuncia que chegou — essa é a lição que os envenenadores de Asura ensinam primeiro e que os aprendizes entendem por último. Ele entra pelo toque, se instala sem levantar febre, sem alterar o pulso e sem dar ao alvo o direito de sentir que algo mudou. Quando os três dias passarem — ou os três turnos, se a paciência não for o luxo de hoje —, o corpo descobre tudo de uma vez, e descobre tarde demais. Sombra no Sangue!",
        },
      ],
    },
  ],
};
