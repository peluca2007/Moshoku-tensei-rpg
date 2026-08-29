import { Tree } from "@/lib/types";
import { UTILITY_PA_COST } from "./shared";

export const LADINO_TREE: Tree = {
  id: "furtividade-e-armadilhas",
  name: "Furtividade e Armadilhas",
  category: "utilidade",
  subgroup: "Batedor e Ladrão",
  keyAttributeLabel: "Agilidade",
  resourceLabel: "PP",
  tagline:
    "Domínio da Preparação: coisas e lugares. Faixa exclusiva: Dano Furtivo — só o Ladino causa dano acima do trivial nesta árvore. A pergunta dele: \"como eu entro?\"",
  rankLabels: {
    Principiante: "Gatuno",
    Intermediário: "Sombra",
    Avançado: "Especialista",
    Santo: "Mestre Espião",
    Rei: "Fantasma",
    Imperador: "Lenda Oculta",
  },
  proficiencies: {
    armas: "Adaga, punhal, espada curta, funda e besta leve. Armadura leve apenas.",
    pericias: "O Bônus de Rank soma em Furtividade, Ladinagem, Percepção, Acrobacia e Enganação (disfarce) — mas só nas que você realmente possui (Cap. 3).",
    nota: "Ofício de Utilidade — gasta PP, nunca PT, e nunca recebe Touki.",
  },
  grantedSkills: {
    fixed: ["Furtividade", "Percepção"],
    choose: { count: 1, from: ["Ladinagem", "Acrobacia", "Enganação"] },
  },
  masterySkillsWhenNotFirst: ["Furtividade", "Percepção"],
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d6+1",
      ppGained: 0,
      mastery: {
        name: "Olho Treinado e Dano Furtivo",
        // 2026-08-29: a Maestria dava detecção AUTOMÁTICA de armadilhas ("não
        // pedem teste... você simplesmente os vê"), que apagava um pilar inteiro
        // de exploração no 1º patamar, de graça — armadilha deixava de ser uma
        // decisão de mesa e virava um aviso. No lugar entrou o que a árvore
        // deveria sempre ter feito: ENSINAR as perícias.
        //
        // A regra de Perícias de Árvore (Cap. 1, §4) diz que só a Árvore Inicial
        // ensina perícia. Esta Maestria é a única exceção declarada do livro —
        // e por isso ela tem dois lados: pra quem chegou depois, ela ensina; pra
        // quem já começou aqui, essas duas perícias já vieram de graça, então
        // entregar de novo seria entregar nada. As 3 proficiências/línguas valem
        // exatamente 1 PA, o mesmo que as 2 perícias do outro lado — os dois
        // caminhos custam o mesmo, e é isso que faz a escolha ser de sabor.
        description:
          "Escopo: um objeto, um cômodo, uma pessoa comum. Se Furtividade e Armadilhas NÃO for a sua Árvore Inicial, você aprende as perícias Furtividade e Percepção — esta é a única árvore do livro que ensina as próprias perícias a quem chegou depois. Se ELA for a sua Árvore Inicial, você já tem as duas; em vez delas, ganhe 3 proficiências ou línguas à sua escolha (a gíria de ladrão, as ferramentas de arrombamento, o kit de falsificação). Em qualquer um dos casos: uma vez por turno, ao acertar um alvo desprevenido, cego, imobilizado ou contra o qual tenha Vantagem, some +1d6 de Dano Furtivo por patamar que possua nesta árvore.",
      },
      talents: [
        { id: "maos-rapidas", name: "Mãos Rápidas", paCost: UTILITY_PA_COST.talent.Principiante, description: "Você tira e coloca objetos em bolsos alheios com teste de Agilidade contra a Percepção do alvo. Em combate, 1 Ação para roubar item não empunhado." },
        { id: "engenhoca", name: "Engenhoca", paCost: UTILITY_PA_COST.talent.Principiante, description: "Você desarma e constrói armadilhas. Montar leva 10 minutos; dano modesto (2d6), CD pra perceber 8 + Agilidade + Bônus de Rank." },
        { id: "duelista-de-rua", name: "Duelista de Rua", paCost: UTILITY_PA_COST.talent.Principiante, description: "Com arma leve, +2 na CA contra um oponente por turno, e não provoca oportunidade ao se afastar dele." },
        { id: "nunca-preso", name: "Nunca Preso", paCost: UTILITY_PA_COST.talent.Principiante, description: "Você escapa de qualquer contenção não-mágica com 1 Ação e Vantagem Absoluta." },
        { id: "boticario", name: "Boticário", paCost: UTILITY_PA_COST.talent.Principiante, description: "Venenos e sedativos de campo. O alvo faz teste de Vigor (CD 8 + Intelecto + Bônus de Rank) ou fica Envenenado por 1 minuto." },
        { id: "falsario", name: "Falsário", paCost: UTILITY_PA_COST.talent.Principiante, description: "Selos, brasões, cartas de crédito. Detectar a falsificação exige CD 8 + Intelecto + Bônus de Rank." },
      ],
      abilities: [
        {
          id: "primeiro-golpe",
          name: "Primeiro Golpe",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Principiante,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "Dano Furtivo triplicado" },
          effect: "Uma vez por combate. Requer que o alvo ainda não tenha agido, ou não saiba onde você está. Depois de usar, você é só alguém com uma faca.",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d6+2",
      ppGained: 0,
      mastery: {
        name: "Duas Saídas",
        description:
          "Escopo: um edifício inteiro, uma rotina de trabalho, um pequeno grupo. Você identifica automaticamente todas as saídas de qualquer ambiente, incluindo improvisadas. Uma vez por cena, gastando 1 PP, declare que existe uma saída onde o Mestre não tinha planejado.",
      },
      talents: [
        { id: "mapa-dos-ratos", name: "Mapa dos Ratos", paCost: UTILITY_PA_COST.talent.Intermediário, description: "Em cidade onde já passou um dia, conhece a geografia oculta: esgotos, becos, telhados, casas seguras — sem teste." },
        { id: "leitura-de-cena", name: "Leitura de Cena", paCost: UTILITY_PA_COST.talent.Intermediário, description: "Você reconstrói o que aconteceu num ambiente fechado só olhando: móveis arrastados, o que foi levado, quantas pessoas estiveram." },
        { id: "contrabandista", name: "Contrabandista", paCost: UTILITY_PA_COST.talent.Intermediário, description: "Você vende qualquer item incriminador e compra itens que não estão à venda — por preço alto e favores." },
        { id: "dedos-de-mana", name: "Dedos de Mana", paCost: UTILITY_PA_COST.talent.Intermediário, description: "Requer 1 patamar em escola de magia. Conjure magias de rank Principiante sem cântico nem gesto visível, ao custo da versão Encurtada." },
        { id: "sombra-longa", name: "Sombra Longa", paCost: UTILITY_PA_COST.talent.Intermediário, description: "Você se esconde mesmo observado, com qualquer distração ou obstáculo parcial. Escuridão total dá Vantagem Absoluta em Furtividade." },
        { id: "passo-de-gato", name: "Passo de Gato", paCost: UTILITY_PA_COST.talent.Intermediário, description: "Você se move em velocidade normal sem ruído algum, e escalar custa deslocamento normal." },
      ],
      abilities: [
        {
          id: "passo-vazio",
          name: "Passo Vazio",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Intermediário,
          range: "Pessoal",
          actions: { normal: 1 },
          effect:
            "Uma vez por combate: você sai do combate — não é alvo válido, não é atingido por área, ninguém determina sua posição, até você agir, tocar em alguém ou o combate acabar. Ao reaparecer, sua primeira ação tem Vantagem e reativa o Primeiro Golpe.",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d8+2",
      ppGained: 1,
      mastery: {
        name: "O Nome Certo",
        description:
          "Escopo: um quarteirão, uma guilda local, um cofre de banco. Para qualquer informação dentro do seu Escopo, você não investiga: nomeia a pessoa que a possui, e o Mestre confirma que ela existe.",
      },
      talents: [
        { id: "quem-puxa-as-cordas", name: "Quem Puxa as Cordas", paCost: UTILITY_PA_COST.talent.Avançado, description: "Teste de Enganação estendido ao longo de dias que planta uma decisão na cabeça do alvo, que jura tê-la pensado sozinho." },
        { id: "mestre-chave", name: "Mestre-Chave", paCost: UTILITY_PA_COST.talent.Avançado, description: "Fechaduras e cofres mundanos viram questão de tempo, não teste. Barreiras mágicas ainda te barram." },
        { id: "veneno-refinado", name: "Veneno Refinado", paCost: UTILITY_PA_COST.talent.Avançado, description: "Requer Boticário. Seus venenos impõem Desvantagem no teste e podem ser calibrados: sono, paralisia parcial, mudez, febre retardada." },
        { id: "marca-da-casa", name: "Marca da Casa", paCost: UTILITY_PA_COST.talent.Avançado, description: "Estude uma organização por uma semana: hierarquia, senhas, uniformes. Vantagem em testes sociais e de Furtividade contra membros dela." },
      ],
      abilities: [
        {
          id: "ponto-cego",
          name: "Ponto Cego",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Avançado,
          ppCost: 1,
          range: "Ambiente do combate",
          actions: { normal: 1 },
          effect:
            "Declare uma sabotagem feita neste ambiente antes do combate: o lustre cai (4d6, Caído, 3m); a porta dos reforços está pregada (perdem 3 turnos); o chão está encharcado de óleo; a arma de um inimigo foi limada (quebra no crítico ou falha crítica).",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d8+3",
      ppGained: 1,
      mastery: {
        name: "Segunda Face",
        description:
          "Escopo: uma cidade inteira, uma casa nobre menor, uma rota comercial. Você mantém uma identidade falsa completa e documentada; magia de detecção de mentiras não te denuncia, porque no momento em que fala, você é aquela pessoa. Mantém identidades = seu Intelecto.",
      },
      talents: [
        { id: "homem-dentro", name: "Homem Dentro", paCost: UTILITY_PA_COST.talent.Santo, description: "Escolha uma organização urbana: você tem um agente permanente lá dentro, que age a seu favor uma vez por sessão." },
        { id: "a-faca-do-amigo", name: "A Faca do Amigo", paCost: UTILITY_PA_COST.talent.Santo, description: "1 Ação e 1 PP: um inimigo secundário na cena trabalha pra você — age uma vez, depois foge ou morre." },
        { id: "nada-escrito", name: "Nada Escrito", paCost: UTILITY_PA_COST.talent.Santo, description: "Você memoriza documentos com uma leitura e escreve em cifras que exigem Intelecto igual ou superior pra quebrar." },
        { id: "faca-no-escuro", name: "Faca no Escuro", paCost: UTILITY_PA_COST.talent.Santo, description: "Seu Dano Furtivo funciona contra alvos adjacentes a um aliado que tenha atacado o alvo desde o seu último turno." },
      ],
      abilities: [
        {
          id: "a-faca-certa",
          name: "A Faca Certa",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Santo,
          ppCost: 1,
          range: "Visão",
          actions: { normal: 1 },
          effect:
            "Declare que já sabotou o equipamento de um inimigo visível que você já viu antes desta cena. Escolha um: perde todo bônus de armadura por 1 minuto; a arma quebra no próximo ataque; não usa itens por 3 turnos.",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d10+3",
      ppGained: 1,
      mastery: {
        name: "Não Estive Aqui",
        description:
          "Escopo: uma capital, um palácio, uma organização continental. Nenhuma evidência física da sua presença persiste mais de uma hora. Magia de rastreamento, adivinhação e visão do passado não te encontra. Testemunhas descrevem você de forma contraditória.",
      },
      talents: [
        { id: "mao-na-coroa", name: "Mão na Coroa", paCost: UTILITY_PA_COST.talent.Rei, description: "Seu Escopo inclui uma corte real ou organização continental fixa; dentro dela, seus fatos custam 1 PP a menos (mínimo 1)." },
        { id: "o-dossie", name: "O Dossiê", paCost: UTILITY_PA_COST.talent.Rei, description: "Sobre qualquer indivíduo nomeado que já tenha encontrado, você possui um segredo comprometedor. Gaste 2 PP para revelá-lo." },
        { id: "saida-limpa", name: "Saída Limpa", paCost: UTILITY_PA_COST.talent.Rei, description: "Uma vez por Descanso Longo, você e aliados a 9m simplesmente não estão mais lá — reaparecem num lugar seguro já conhecido." },
      ],
      abilities: [
        {
          id: "voce-nao-vai-chegar-la",
          name: "Você Não Vai Chegar Lá",
          signature: true,
          reaction: true,
          paCost: UTILITY_PA_COST.signature.Rei,
          ppCost: 2,
          range: "Visão",
          actions: { normal: 1 },
          effect:
            "1 Reação, quando um inimigo declara que vai alcançar um objetivo. Ele não chega — declare o motivo dentro do seu Escopo (ponte serrada, chave sumida, corredor murado). Não causa dano nenhum e frequentemente ganha o combate.",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d10+4",
      ppGained: 1,
      mastery: {
        name: "O Fato Consumado",
        description:
          "Escopo: um reino, um continente, o registro histórico. Seus fatos podem ter sido executados por outra pessoa, anos atrás, a seu mando. Uma vez por Descanso Longo, gastando 4 PP, declare que a situação atual foi arranjada por você (o Mestre escolhe um detalhe que saiu do controle). Recupere 2 PP em Descanso Curto.",
      },
      talents: [
        { id: "nome-que-nao-existe", name: "Nome que Não Existe", paCost: UTILITY_PA_COST.talent.Imperador, description: "Você apaga uma pessoa dos registros do mundo, ou insere uma. Leva meses e é irreversível." },
        { id: "a-mao-longa", name: "A Mão Longa", paCost: UTILITY_PA_COST.talent.Imperador, description: "Seu Escopo passa a cobrir um continente inteiro." },
        { id: "heranca-ladino", name: "Herança", paCost: UTILITY_PA_COST.talent.Imperador, description: "Escolha um talento de qualquer patamar desta árvore que não possua — alguém do seu séquito sabe fazer aquilo. Troque a cada Descanso Longo; nunca mais de um por vez." },
      ],
      abilities: [
        {
          id: "o-homem-que-nunca-esteve-la",
          name: "O Homem Que Nunca Esteve Lá",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Imperador,
          ppCost: 4,
          range: "Visão",
          actions: { normal: 3 },
          effect:
            "Uma vez por Descanso Longo. Declare que o inimigo à sua frente já perdeu: os aliados dele nunca foram dele; o que veio buscar não está mais aqui; a autoridade dele foi revogada; ou ele está sozinho e a saída está fechada. Não funciona contra feras, mortos-vivos, elementais ou rank Deus.",
        },
      ],
    },
  ],
};
