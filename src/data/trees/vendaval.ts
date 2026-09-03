import { Tree } from "@/lib/types";

/**
 * Árvore híbrida-piloto: emerge de já ter dominado o Estilo Deus do Norte e a Magia de Vento,
 * não se escolhe do zero. Ver `hiddenFromCreation` (não aparece no TreePicker de criação) e
 * `prerequisiteNote` (aviso renderizado no catálogo). Mecanicamente é só mais uma árvore do
 * Corpo — sem recurso novo, sem gate em código: o Mestre decide se o pré-requisito foi cumprido,
 * do mesmo jeito que já decide Rank Deus e a Raça Dragão.
 */
export const VENDAVAL_TREE: Tree = {
  id: "vendaval",
  name: "Estilo Vendaval",
  category: "corpo",
  subgroup: "Estilo Híbrido",
  mechanic: {
    tag: "Distância Roubada",
    hook:
      "Uma árvore corpo a corpo que briga de longe: cada metro que você anda vira alcance da sua lâmina.",
    loop: [
      "Ande. Mover-se é livre e barato aqui — a árvore compra reposicionamento em quase todo patamar, e do Intermediário em diante até como Reação.",
      "Roube a distância. A distância que você percorreu na sua vez (até 9m) é somada ao ALCANCE do seu próximo ataque corpo a corpo neste turno: o vento estica o fio da arma.",
      "Cobre. Se esse ataque acertar um alvo a mais de 3m de você, ele fica Desequilibrado — e as suas magias de Vento cobram um dado a mais de quem está assim.",
    ],
    cost:
      "Você não tem parede, não tem contra-ataque e não tem PV pra trocar golpe. Se te encurralarem num corredor, a árvore inteira vira uma espada comum.",
  },
  keyAttributeLabel: "Força ou Agilidade",
  resourceLabel: "PT",
  tagline: "O que sobra quando a sobrevivência do Norte para de precisar de distância — nascido de quem já domina o aço e o vento ao mesmo tempo.",
  hiddenFromCreation: true,
  prerequisiteNote:
    "Pré-requisito: Rank Avançado em Estilo Deus do Norte e em Magia de Vento. Não se escolhe na criação — surge da fusão das duas.",
  proficiencies: {
    armas: "Toda espada e toda arma de haste. Armadura leve apenas — o estilo inteiro depende de deslocamento.",
    pericias: "O Bônus de Rank desta árvore NÃO soma em perícia nenhuma — somar em perícia é exclusivo das três árvores de Utilidade (Cap. 3).",
    nota: "Árvore híbrida do Corpo — exige Avançado em Deus do Norte E em Magia de Vento.",
  },
  grantedSkills: {
    fixed: ["Acrobacia", "Percepção"],
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d8+2",
      weaponDieSteps: 1,
      mastery: {
        name: "Passo sem Peso",
        description:
          "+3 metros de Deslocamento. Uma vez em cada um dos seus turnos, afastar-se de um inimigo não provoca ataque de oportunidade. Uma vez por combate, ao errar um ataque corpo a corpo, o vento absorve o impacto: reposicione-se até 3m sem gastar Ação. [Distância Roubada] A mecânica que define a árvore: guarde a distância que você percorreu na sua vez, até 9 metros. O seu PRÓXIMO ataque corpo a corpo neste turno tem o alcance da arma aumentado nessa distância — o vento estica o fio do golpe. Se esse ataque acertar um alvo a mais de 3 metros de você, ele fica Desequilibrado. A distância guardada zera no fim do turno, gasta ou não.",
      },
      talents: [
        { id: "folego-do-vendaval", name: "Fôlego do Vendaval", paCost: 1, description: "+1 PT por patamar seu no Estilo Vendaval. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nele.", grants: { ptPerRank: 1 } },
        { id: "ouvido-do-vendaval", name: "Ouvido do Vendaval", paCost: 1, description: "Vantagem em Percepção auditiva, e você percebe magia de Vento sendo conjurada a até 60 metros." },
        { id: "pes-que-o-vento-segura", name: "Pés que o Vento Segura", paCost: 1, description: "Você nunca sofre penalidade de Deslocamento em terreno difícil, gelo ou vento contrário, e nunca escorrega." },
      ],
      abilities: [
        {
          id: "corte-que-chega-antes",
          name: "Corte que Chega Antes",
          signature: true,
          paCost: 2,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "Dado de arma normal" },
          effect: "Seu golpe viaja com o vento: ataque corpo a corpo que também empurra o alvo 3m na direção do golpe (teste de Força CD 8 + Força + Rank pra resistir só ao empurrão — o dano acerta de qualquer forma).",
        },
        {
          id: "arremesso-cortante",
          name: "Arremesso Cortante",
          paCost: 1,
          range: "18 metros",
          actions: { normal: 1 },
          damage: { normal: "Dado de arma normal" },
          effect: "Ataque à distância até 18m arremessando sua arma como um golpe de vento cortante, usando seu Dado de Arma e Bônus de Rank normalmente. A arma retorna à sua mão ao fim do turno, puxada pelo vento.",
        },
        {
          id: "sopro-sob-a-lamina",
          name: "Sopro sob a Lâmina",
          paCost: 1,
          range: "Cone de 4,5 metros",
          actions: { normal: 1 },
          effect: "Teste de Vigor (CD 8 + Força + Rank) ou o alvo fica Desequilibrado e Cego por poeira levantada até o fim do próximo turno dele. Sem dano.",
        },
        {
          id: "passo-vazio-de-combate",
          name: "Passo Vazio de Combate",
          paCost: 1,
          range: "Deslocamento",
          actions: { normal: 1 },
          effect: "Desloque-se até seu Deslocamento sem provocar ataques de oportunidade e ignorando terreno difícil. Se terminar adjacente a um inimigo que não te viu chegar, seu próximo ataque tem Vantagem.",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d8+3",
      weaponDieSteps: 1,
      mastery: {
        name: "Lâmina no Vácuo",
        description:
          "Seus ataques corpo a corpo ignoram metade da Cobertura do alvo — o vento carrega seu golpe ao redor de obstáculos parciais. Uma vez por turno, gaste 1 PT pra repetir um teste de resistência de Agilidade que tenha falhado. [Distância Roubada] O movimento que você faz com REAÇÃO passa a contar para a Distância Roubada — Passo Entre Rajadas deixa de ser só uma fuga e vira o preparo do golpe seguinte.",
      },
      talents: [
        { id: "corrente-de-apoio-marcial", name: "Corrente de Apoio Marcial", paCost: 1, description: "Quando um aliado a até 9m for empurrado, arremessado ou puxado por qualquer efeito, gaste 1 PT como Reação pra dobrar a distância do movimento dele, na direção que ele quiser." },
        { id: "fuga-no-vendaval", name: "Fuga no Vendaval", paCost: 1, description: "Ao ser reduzido a 0 PV, o vento te arremessa 6m para longe da fonte do dano antes de cair." },
        { id: "instinto-de-corrente-de-ar", name: "Instinto de Corrente de Ar", paCost: 1, description: "Você não pode ser surpreendido enquanto consciente, e sente a aproximação de qualquer voo hostil a até 30 metros." },
      ],
      abilities: [
        {
          id: "redemoinho-de-aco",
          name: "Redemoinho de Aço",
          signature: true,
          paCost: 2,
          ptCost: 1,
          range: "3 metros",
          actions: { normal: 1 },
          damage: { normal: "Dado de arma normal em cada alvo" },
          effect: "Gire com sua arma, atacando cada criatura à escolha dentro de 3m, com rolagem separada para cada, sem Desvantagem por aliados na área — o vento abre espaço pra sua lâmina.",
        },
        {
          id: "golpe-que-corta-o-ar",  // alcance 9m -> 18m: era mais curto que o Arremesso Cortante do patamar anterior
          name: "Golpe que Corta o Ar",
          paCost: 1,
          ptCost: 1,
          range: "18 metros",
          actions: { normal: 1 },
          damage: { normal: "Dado de arma normal (cortante)" },
          effect: "Ataque à distância com sua arma corpo a corpo, como se o fio dela se esticasse no vento. Se acertar, o alvo fica Desequilibrado.",
        },
        {
          id: "passo-entre-rajadas",
          name: "Passo Entre Rajadas",
          reaction: true,
          paCost: 1,
          ptCost: 1,
          range: "9 metros",
          actions: { normal: 1 },
          effect: "1 Reação, quando um inimigo errar um ataque contra você: desloque-se até 9m antes que ele perceba. Uma vez por turno.",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d10+3",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "Fio do Vendaval",
        description:
          "Enquanto vestir o Manto de Touki, sua arma ganha +3 metros de alcance em ataques corpo a corpo — o fio do golpe se estende pelo vento — e você ignora metade da CA de armaduras não-mágicas. [Distância Roubada] O teto da Distância Roubada sobe de 9 para 12 metros, e ela soma em cima destes +3.",
      },
      talents: [
        { id: "segunda-rajada", name: "Segunda Rajada", paCost: 2, description: "Uma vez por combate, sem gastar Ação, recupere PT iguais ao seu Bônus de Rank no Estilo Vendaval — e, no mesmo instante, desloque-se até 9 metros sem provocar ataque de oportunidade. A distância percorrida conta para a Distância Roubada." },
        { id: "vortice-pessoal", name: "Vórtice Pessoal", paCost: 2, description: "Ataques à distância mundanos contra você sofrem Desvantagem enquanto estiver se movendo, e você nunca sofre dano de queda." },
        { id: "leitura-do-vento", name: "Leitura do Vento", paCost: 2, description: "Vantagem em Iniciativa, e você identifica de onde veio qualquer ataque à distância que te acertou, mesmo escondido." },
      ],
      abilities: [
        {
          id: "corte-do-horizonte-curto",
          name: "Corte do Horizonte Curto",
          signature: true,
          paCost: 3,
          ptCost: 2,
          range: "Linha de 12 metros",
          actions: { normal: 1 },
          damage: { normal: "Dado de arma normal + 3d8 (cortante)" },
          effect: "Libere seu golpe como uma lâmina de vento em linha. Teste de Agilidade (CD 8 + Força + Rank) pra metade do dano extra — o dano de arma sempre acerta cheio.",
        },
        {
          id: "prisao-de-ar-e-aco",
          name: "Prisão de Ar e Aço",
          paCost: 2,
          ptCost: 1,
          range: "9 metros",
          actions: { normal: 1 },
          effect: "Teste de Força (CD 8 + Força + Rank). Falha: o alvo é erguido do chão, Preso e Desequilibrado por 1 minuto, cortado suavemente pelo vento que o segura no lugar (repete teste no fim de cada turno).",
        },
        {
          id: "golpe-sem-peso",
          name: "Golpe Sem Peso",
          paCost: 2,
          range: "Passivo",
          actions: { normal: 0 },
          effect: "Seus ataques corpo a corpo não sofrem Desvantagem por empunhar arma pesada com uma mão só, e você nunca fica Desequilibrado pelo próprio ataque.",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d10+4",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "Olho da Tempestade",
        description:
          "Em combate, uma bolha de calmaria de 3m ao seu redor nega Cobertura e vento contrário a você e a aliados adjacentes; fora dela, o ar reage aos seus movimentos, e seu Deslocamento aumenta em metade.",
      },
      talents: [],
      abilities: [
        {
          id: "corte-que-o-vento-termina",
          name: "Corte que o Vento Termina",
          signature: true,
          paCost: 4,
          ptCost: 2,
          range: "Corpo a corpo, depois Linha de 18 metros",
          actions: { normal: 2 },
          damage: { normal: "Dado de arma normal + 5d10 (cortante)" },
          effect:
            "Um golpe corpo a corpo que, se acertar, libera uma segunda lâmina que segue em linha reta ATRAVÉS do alvo e continua por toda a sua Distância Roubada deste turno, cortando tudo no caminho. Teste de Agilidade (CD 8 + Força + Rank) pra metade do dano da segunda lâmina. Se você não se moveu neste turno, a segunda lâmina não sai — sobra o golpe de arma.",
        },
        {
          id: "rajada-que-segue-a-lamina",
          name: "Rajada que Segue a Lâmina",
          paCost: 3,
          ptCost: 2,
          range: "Esfera de 6 metros",
          actions: { normal: 1 },
          damage: { normal: "3d10 (contundente)" },
          effect: "Teste de Força (CD 8 + Força + Rank). Falha: dano, arremessadas 6m e Caídas. Vento forte na área por 1 minuto — projéteis mundanos erram.",
        },
        {
          id: "folego-infinito-do-vendaval",
          name: "Fôlego Infinito do Vendaval",
          paCost: 3,
          range: "Passivo",
          actions: { normal: 0 },
          effect: "Você ignora fome, sede, clima extremo e a Exaustão por falta de sono. Enquanto tiver ao menos 1 PT, é imune a Cego e Surdo.",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d12+4",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "Lâmina Sem Fronteira",
        description:
          "Seus ataques corpo a corpo passam a ter alcance MÍNIMO de 6 metros, sempre — o vento carrega o fio da sua arma até o alvo, tenha você corrido ou não. A Vantagem de Estilo (Cap. 3) se aplica mesmo à distância. [Distância Roubada] Continua somando em cima desse piso: correr 12 metros e golpear alcança 18.",
      },
      talents: [],
      abilities: [
        {
          id: "mil-cortes-no-vendaval",
          name: "Mil Cortes no Vendaval",
          signature: true,
          paCost: 5,
          ptCost: 3,
          range: "Esfera de 9 metros",
          actions: { normal: 1 },
          damage: { normal: "Dado de arma rolado duas vezes + Bônus de Rank (cortante)" },
          effect:
            "O raio não é fixo: é a sua Distância Roubada deste turno (mínimo 3m, máximo 12m). Você não gira no lugar como no Redemoinho de Aço — você atravessa o grupo inteiro e corta no caminho. Ataque cada criatura à sua escolha dentro desse raio, com rolagem separada para cada, sem Desvantagem por aliados na área. Cada alvo que cair devolve 1 PT.",
        },
        {
          id: "golpe-que-nao-tem-origem",
          name: "Golpe que Não Tem Origem",
          paCost: 4,
          ptCost: 2,
          range: "27 metros",
          actions: { normal: 1 },
          damage: { normal: "Dado de arma normal + 4d8" },
          effect: "Ataque à distância com sua arma, sem precisar de linha de visão direta — o vento contorna obstáculos parciais. Ignora Cobertura parcial.",
        },
        {
          id: "pele-que-o-vento-protege",
          name: "Pele que o Vento Protege",
          paCost: 4,
          range: "Passivo",
          actions: { normal: 0 },
          effect: "Enquanto vestir o Manto de Touki, você tem Resistência a dano de projétil mundano, e ataques à distância contra você têm Desvantagem.",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d12+5",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "O Golpe que Já Passou",
        description:
          "Uma vez por combate, declare que um golpe seu já aconteceu antes da cena começar: ele acerta automaticamente e ignora Touki, Cobertura e armadura. Enquanto tiver ao menos 1 PT, você não pode ser Agarrado, Preso nem Desequilibrado por vento ou empurrão de qualquer fonte.",
      },
      talents: [],
      abilities: [
        {
          id: "corte-do-horizonte-infinito",
          name: "Corte do Horizonte Infinito",
          signature: true,
          paCost: 6,
          ptCost: 4,
          range: "Linha de 300 metros",
          actions: { normal: 3 },
          damage: { normal: "Dado de arma rolado quatro vezes + Força + Bônus de Rank + 4d10 (cortante)" },
          effect: "Uma vez por combate. Acerta automaticamente; o dano de arma e o bônus sempre acertam cheio. Muralhas, torres e florestas na trajetória são cortadas ao meio. Teste de Agilidade com Desvantagem pra metade do dano extra do vento (4d10).",
        },
        {
          id: "vendaval-de-aco",
          name: "Vendaval de Aço",
          paCost: 5,
          ptCost: 3,
          range: "Esfera de 18 metros",
          actions: { normal: 1 },
          damage: { normal: "6d10 (cortante)" },
          effect: "Teste de Força com Desvantagem (CD 8 + Força + Rank). Falha: dano cheio, arremessadas 9m, Caídas e Desequilibradas. Sucesso: metade do dano, sem os outros efeitos.",
        },
        {
          id: "presenca-que-corta-o-ar",
          name: "Presença que Corta o Ar",
          paCost: 5,
          range: "18 metros",
          actions: { normal: 1 },
          effect: "1 minuto: aliados em 18m recebem +2 em acertos e Deslocamento dobrado. Inimigos em 18m sofrem Desvantagem em ataques à distância contra qualquer um do seu grupo.",
        },
      ],
    },
  ],
};
