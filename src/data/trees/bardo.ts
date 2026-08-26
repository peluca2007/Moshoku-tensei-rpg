import { Tree } from "@/lib/types";
import { UTILITY_PA_COST } from "./shared";

export const BARDO_TREE: Tree = {
  id: "bardo-e-interacao",
  name: "Bardo e Interação",
  category: "utilidade",
  subgroup: "Bardo",
  keyAttributeLabel: "Espírito",
  resourceLabel: "PP",
  tagline:
    "Domínio da Preparação: pessoas e reputação. Faixa exclusiva: estado emocional — só o Bardo altera o que um inimigo sente. A pergunta dele: \"quem eu convenço?\"",
  rankLabels: {
    Principiante: "Aprendiz",
    Intermediário: "Artista",
    Avançado: "Trovador",
    Santo: "Virtuoso",
    Rei: "Maestro",
    Imperador: "Voz do Mundo",
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d6+1",
      mpPerRank: 0,
      mastery: {
        name: "A Plateia",
        description:
          "Escopo: uma pessoa que já te ouviu tocar ou falar. Enquanto estiver tocando/cantando/falando (sem custo de Ação fora de combate), aliados que te ouvem somam seu Bônus de Rank em um teste de perícia por cena, à escolha deles. Você nunca dorme na rua — uma apresentação garante cama e comida.",
      },
      talents: [
        { id: "ouvido-absoluto", name: "Ouvido Absoluto", paCost: UTILITY_PA_COST.talent.Principiante, description: "Você imita qualquer voz já ouvida e reproduz sotaques. Aprende idiomas em dias." },
        { id: "cantiga-de-marcha", name: "Cantiga de Marcha", paCost: UTILITY_PA_COST.talent.Principiante, description: "O grupo viaja mais rápido e ignora o primeiro nível de Exaustão por marcha, enquanto você tocar." },
        { id: "insulto-afiado", name: "Insulto Afiado", paCost: UTILITY_PA_COST.talent.Principiante, description: "1 Ação: teste de Espírito contra Intuição do alvo. Se vencer, o próximo ataque dele tem Desvantagem." },
        { id: "colecionador-de-historias", name: "Colecionador de Histórias", paCost: UTILITY_PA_COST.talent.Principiante, description: "Sobre pessoa/família/cidade/artefato conhecidos, você sabe uma coisa verdadeira e uma exagerada, e distingue qual é qual." },
        { id: "contrato-de-bardo", name: "Contrato de Bardo", paCost: UTILITY_PA_COST.talent.Principiante, description: "Uma vez por mês de jogo, um patrono cobre as despesas do grupo em troca de você registrar os feitos deles." },
      ],
      abilities: [
        {
          id: "inspiracao",
          name: "Inspiração",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Principiante,
          range: "Voz",
          actions: { normal: 1 },
          damage: { normal: "Dado de Inspiração: 1d6 (1º-2º patamar), 2d6 (3º-4º), 3d6 (5º-6º)" },
          effect: "Número de vezes por Descanso Longo igual ao seu Espírito. Um aliado que te ouça recebe um Dado de Inspiração, somável a qualquer teste até o fim da cena, mesmo após ver o resultado.",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d6+2",
      mpPerRank: 0,
      mastery: {
        name: "Ler a Sala",
        description:
          "Escopo: uma taverna, uma tropa, um público, uma família. Ao entrar em qualquer cena com pessoas, o Mestre deve dizer, sobre cada indivíduo relevante: o que ele quer, do que tem medo, e que existe algo que ele esconde (não qual).",
      },
      talents: [
        { id: "cantiga-de-ninar", name: "Cantiga de Ninar", paCost: UTILITY_PA_COST.talent.Intermediário, description: "Criaturas não-hostis que te ouvirem 10 minutos adormecem, salvo teste de Vigor. Não funciona em combate." },
        { id: "mestre-de-cerimonias", name: "Mestre de Cerimônias", paCost: UTILITY_PA_COST.talent.Intermediário, description: "Você controla uma multidão: acalmar/iniciar tumulto, direcionar atenção. Teste de Espírito contra CD do Mestre." },
        { id: "a-mascara", name: "A Máscara", paCost: UTILITY_PA_COST.talent.Intermediário, description: "Enquanto sustentar uma persona, testes pra detectar mentira em você têm Desvantagem. Dura uma noite." },
        { id: "nome-nas-bocas", name: "Nome nas Bocas", paCost: UTILITY_PA_COST.talent.Intermediário, description: "Gastando 1 PP, planta um rumor numa comunidade. Em três dias, todo mundo acredita — não precisa ser verdade." },
        { id: "duelo-de-cancoes", name: "Duelo de Canções", paCost: UTILITY_PA_COST.talent.Intermediário, description: "Você desafia alguém pra disputa artística/verbal. Recusar costuma ser desonra pública em várias culturas." },
      ],
      abilities: [
        {
          id: "insulto-que-fica",
          name: "Insulto que Fica",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Intermediário,
          range: "Voz",
          actions: { normal: 1 },
          effect:
            "Teste de Espírito contra Espírito do alvo. Se vencer, por 3 turnos ele só consegue pensar em você: Desvantagem em ataques que não sejam contra você, e não pode usar habilidades que exijam concentração ou cálculo. O risco: ele vai te atacar.",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d6+2",
      mpPerRank: 0,
      ppGained: 1,
      mastery: {
        name: "A Canção Não Para",
        description:
          "Escopo: um vilarejo, uma companhia mercenária, uma corte pequena. Você sustenta um efeito de Bardo indefinidamente sem gastar Ação nem concentração. Segurar dois ao mesmo tempo exige 1 Ação por turno.",
      },
      talents: [
        { id: "requiem", name: "Réquiem", paCost: UTILITY_PA_COST.talent.Avançado, description: "Aliados que te ouvem ficam imunes a Amedrontado e têm Vantagem contra efeitos que manipulem emoção ou mente." },
        { id: "diplomata-de-guerra", name: "Diplomata de Guerra", paCost: UTILITY_PA_COST.talent.Avançado, description: "Você negocia trégua no meio de um combate: teste de Espírito (CD 8 + Espírito + Bônus de Rank), quem falhar para de lutar por 1 minuto e escuta." },
        { id: "voz-que-alcanca", name: "Voz que Alcança", paCost: UTILITY_PA_COST.talent.Avançado, description: "Sua voz é ouvida claramente a até 300 metros, atravessa tempestade e ruído de batalha." },
        { id: "a-balada-instrutiva", name: "A Balada Instrutiva", paCost: UTILITY_PA_COST.talent.Avançado, description: "Você transforma informação complexa em canção memorizável permanentemente pelo grupo em 10 minutos." },
      ],
      abilities: [
        {
          id: "cancao-de-guerra",
          name: "Canção de Guerra",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Avançado,
          range: "Voz",
          actions: { normal: 1 },
          effect:
            "Sustentada de graça pela sua Maestria. Aliados que te ouvem recebem +2 em acertos, imunidade a Amedrontado, e ignoram a penalidade do primeiro nível de Exaustão. Acaba se você for silenciado, nocauteado ou morto.",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d8+3",
      mpPerRank: 0,
      ppGained: 1,
      mastery: {
        name: "Precede Você",
        description:
          "Escopo: uma cidade inteira. Ao entrar em qualquer cidade dentro do seu Escopo pela primeira vez, escolha como é conhecido lá (herói, artista, excêntrico, agente estrangeiro) — a escolha é verdade. Muda uma vez por cidade, levando semanas.",
      },
      talents: [
        { id: "o-favor-antigo", name: "O Favor Antigo", paCost: UTILITY_PA_COST.talent.Santo, description: "Gastando 2 PP, uma pessoa importante na cena te deve algo — dá uma informação, passagem, ou benefício da dúvida." },
        { id: "elegia", name: "Elegia", paCost: UTILITY_PA_COST.talent.Santo, description: "Uma vez por combate, cante para um inimigo que perdeu aliados nesta luta: teste de Espírito com Desvantagem ou ele deixa o combate, sem morrer." },
        { id: "a-corte-na-palma", name: "A Corte na Palma", paCost: UTILITY_PA_COST.talent.Santo, description: "Em ambientes formais, você não rola testes sociais: declara o resultado desejado, desde que não contrarie interesses vitais de alguém presente." },
      ],
      abilities: [
        {
          id: "a-verdade-que-doi",
          name: "A Verdade que Dói",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Santo,
          ppCost: 1,
          range: "Voz",
          actions: { normal: 1 },
          effect:
            "Diga, na frente de todos, algo verdadeiro sobre um inimigo (dentro do seu Escopo e Domínio). Aliados dele fazem teste de Espírito (CD 8 + Espírito + Bônus de Rank): quem falhar age com Desvantagem enquanto o alvo estiver na cena.",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d8+3",
      mpPerRank: 0,
      ppGained: 1,
      mastery: {
        name: "Voz que Comanda",
        description:
          "Escopo: um reino. Qualquer criatura capaz de ouvir e sentir emoção é afetada pelas suas habilidades, mesmo sem idioma comum. Seus efeitos de área social atingem todos que te ouvem, sem limite de número. Você é imune a manipulação da própria emoção.",
      },
      talents: [
        { id: "a-cancao-que-todos-sabem", name: "A Canção que Todos Sabem", paCost: UTILITY_PA_COST.talent.Rei, description: "Uma composição sua se espalhou. Gastando 2 PP, declare que ela contém um sinal que a pessoa certa reconhece ao ouvir." },
        { id: "silencio-absoluto", name: "Silêncio Absoluto", paCost: UTILITY_PA_COST.talent.Rei, description: "1 Ação: ninguém em 18m fala/canta/recita, incluindo você. Enquanto sustentar, você não pode usar outra habilidade de Bardo." },
        { id: "herdeiro-de-todas-as-bocas", name: "Herdeiro de Todas as Bocas", paCost: UTILITY_PA_COST.talent.Rei, description: "Você fala todos os idiomas do Mundo de Seis Faces, incluindo o Divino e dialetos demoníacos antigos." },
      ],
      abilities: [
        {
          id: "coro",
          name: "Coro",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Rei,
          ppCost: 2,
          range: "Esfera de 18m",
          actions: { normal: 1 },
          effect:
            "Uma vez por combate. Escolha pavor, fúria ou devoção. Hostis na área que te ouçam fazem teste de Espírito: quem falhar foge (pavor), ataca o mais próximo (fúria), ou não ataca você/aliados (devoção) por 2 turnos. Não funciona em criaturas sem emoção.",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d10+4",
      mpPerRank: 0,
      ppGained: 1,
      mastery: {
        name: "A História Oficial",
        description:
          "Escopo: um continente. Uma vez por Descanso Longo, gastando 4 PP, escolha um evento que testemunhou ou do qual participou: sua versão dele vira a verdade aceita. Desmentir exige provas materiais e testemunha de reputação equivalente.",
      },
      talents: [
        { id: "nome-imortal", name: "Nome Imortal", paCost: UTILITY_PA_COST.talent.Imperador, description: "Escolha uma pessoa: ela entra pra história como herói ou monstro, permanentemente." },
        { id: "a-marcha", name: "A Marcha", paCost: UTILITY_PA_COST.talent.Imperador, description: "Uma canção sua vira hino de um movimento. Gastando 3 PP, declare que ele age agora a seu favor." },
        { id: "publico-universal", name: "Público Universal", paCost: UTILITY_PA_COST.talent.Imperador, description: "Suas Preparações sociais alcançam qualquer continente, mesmo os que você nunca visitou." },
      ],
      abilities: [
        {
          id: "o-fim-da-cancao",
          name: "O Fim da Canção",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Imperador,
          ppCost: 4,
          range: "Voz",
          actions: { normal: 3 },
          effect:
            "Uma vez por Descanso Longo. Encerre a batalha declarando publicamente por que ela não faz mais sentido. Hostis capazes de ouvir e raciocinar fazem teste de Espírito com Desvantagem; quem falhar encerra as hostilidades. Exige que a razão seja real e acessível — não funciona em quem luta por prazer, fome ou ordem divina.",
        },
      ],
    },
  ],
};
