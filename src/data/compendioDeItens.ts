import type { ShopItem } from "./shopItems";

/**
 * O COMPÊNDIO DE ITENS DE RANOA E ASURA (2026-09-23).
 *
 * Os 65 itens que o `NOVOS_ITENS.md` trouxe, passados pela régua do livro. O
 * rascunho foi escrito como ficção — e é bom como ficção —, mas chegou com
 * números de outra economia e citando condições que não existem. O que mudou,
 * e por quê:
 *
 * ## Preço: a relíquia saiu da economia
 *
 * Doze itens passavam do teto do livro inteiro (1.500 PO), e seis passavam de
 * 10.000 — o maior, 120.000. Pra comparar: "Trabalhar" no Downtime rende 2d6 ×
 * Bônus de Rank (7 a 42 PO por semana) e a taxa de registro de Rank S da
 * Guilda, o último degrau do jogo, é 1.000 PO.
 *
 * O problema não era o número ser grande, era o número EXISTIR: combinado com
 * a regra de revenda do `SISTEMA_DE_LOOT.md` (raro em leilão rende 150% a
 * 200%), um único drop virava 180.000 PO e pagava o catálogo inteiro umas
 * quarenta vezes. A economia de escassez que o documento propõe seria destruída
 * pelo primeiro item raro que o grupo achasse.
 *
 * Por isso relíquia agora é `price: null` — não tem preço, não se compra e não
 * se vende, troca de mão por história. Os outros seis foram comprimidos até
 * caber em ~3.000.
 *
 * ## Poder: o teto continua sendo o teto
 *
 * A Armadura Zariff dava CA +8 (o teto do livro é +6) e multiplicava dano por
 * 3 — num sistema cujo maior dano por Ação é 66, ela faria ~198, o que não é um
 * item forte, é o fim do combate como mecânica. O Olho Demoníaco dava +2 de CA
 * permanente E +1 em todo teste de acerto, quando o encantamento de Rank
 * Avançado (150 PO) dá +1 de CA e ponto.
 *
 * Os dois continuam sendo os melhores itens do livro — dentro da régua.
 *
 * ## Dois itens vendiam o que o sistema já dá de graça
 *
 * A Panaceia (10.000 PO) e a Pílula de Adrenalina (450 PO) anunciavam "remove
 * as Marcas da Morte". O Cap. 4 diz que QUALQUER cura ou poção aplicada por um
 * aliado já remove todas: uma Poção Menor de 15 PO fazia o serviço. A Panaceia
 * ganhou o único buraco que nenhuma cura tapa — agir em quem já morreu.
 *
 * ## Termos: nenhuma condição nova
 *
 * "Medo Absoluto", "Frenesi" e "Sonolento" não existem. O livro tem 30
 * condições e a mesa já decora essas: Medo Absoluto virou Amedrontado, o
 * Frenesi virou regra escrita no próprio item, e o Sonolento virou a
 * Desvantagem que ele já descrevia. Também foram corrigidos "Resistência a
 * Choque" (o tipo se chama elétrico), "dano sombrio/profano" (psíquico) e
 * "dano in-curável" (Exaustão, que é como o livro cobra ferimento que não
 * fecha).
 *
 * A Armadura Zariff merece nota à parte: o `shopItems.ts` já tinha decidido
 * deixá-la fora do catálogo, junto com a Lança do Diabo e o Braço de Zariff,
 * por ser "artefato único ligado a um personagem, gancho de campanha, nunca
 * compra de ficha". Ela volta aqui sem contradizer aquilo — como
 * `inestimavel`, ela está no livro e continua fora da prateleira.
 */
export const COMPENDIO_ITENS: ShopItem[] = [
  // ————————————————————————————————— ARMAS E FOCOS MÁGICOS
  {
    id: "arma_cajado_coracao_dagua",
    name: "Cajado Coração d'Água",
    category: "arma",
    type: "arma",
    description:
      "Esculpido do osso de um Dragão Aquático Ancião, com uma gema do fundo do mar. Magias da árvore de Água custam 25% menos PM (arredonde para baixo). Só um arquimago põe a mão nele.",
    price: null,
    guildRankRequired: "S",
    disponibilidade: "inestimavel",
    baseDie: "d10",
  },
  {
    id: "arma_espada_bastarda_norte",
    name: "Espada Bastarda do Estilo Deus do Norte",
    category: "arma",
    type: "arma",
    description:
      "Lâmina levemente curvada, feita para o combate caótico e para o arremesso. Uma vez por combate pode ser arremessada usando o mesmo bônus do ataque corpo a corpo, com dano cheio.",
    price: 120,
    guildRankRequired: "D",
    baseDie: "d8",
  },
  {
    id: "arma_tridente_superd_replica",
    name: "Tridente de Superd (Réplica)",
    category: "arma",
    type: "arma",
    description:
      "Falsificação de três pontas, muito bem feita. Usar em público atrai pânico: a guarda local trata o portador como a Raça Maldita e age de acordo.",
    price: 300,
    guildRankRequired: "C",
    disponibilidade: "restrito",
    baseDie: "d10",
  },
  {
    id: "arma_lanca_genuina_superd",
    name: "Lança Genuína de Superd",
    category: "arma",
    type: "arma",
    description:
      "Esculpida da própria cauda e alma de um guerreiro Superd. Inquebrável. Quem a vê ser empunhada em combate fica Amedrontado até o fim do próximo turno (NPCs comuns; resistência de Espírito contra CD 8 + seu Bônus de Rank).",
    price: null,
    guildRankRequired: "S",
    disponibilidade: "inestimavel",
    baseDie: "d12",
  },
  {
    id: "arma_faca_escondida_doldia",
    name: "Faca Escondida de Doldia",
    category: "arma",
    type: "arma",
    description:
      "Lâmina de garra de lobo de pedra, usada pelos assassinos do povo fera. Não é metal: passa por revista e por detecção mágica de metal.",
    price: 75,
    guildRankRequired: "E",
    disponibilidade: "restrito",
    baseDie: "d6",
    damageAttribute: "agilidade",
  },
  {
    id: "arma_cajado_madeira_podre",
    name: "Cajado de Madeira Podre",
    category: "arma",
    type: "arma",
    description:
      "Um galho que um charlatão jurou ser amaldiçoado. Numa Falha Crítica (1 natural) canalizando magia com ele, o cajado explode: 1d6 de dano contundente em você e o cajado acaba.",
    price: 2,
    guildRankRequired: "F",
    baseDie: "d4",
  },
  {
    id: "arma_lamina_sedenta_de_sangue",
    name: "Lâmina Sedenta de Sangue",
    category: "arma",
    type: "arma",
    description:
      "Forjada por ferreiros do Continente Demônio. Cura 1d4 PV a cada abate — e cobra: se você passar 24 horas sem matar nada, ela corta a mão que a empunha por 1d6 e impõe 1 nível de Exaustão, que só sai num Descanso Longo.",
    price: 2000,
    guildRankRequired: "B",
    disponibilidade: "restrito",
    baseDie: "d8",
  },
  {
    id: "arma_arco_curto_sharia",
    name: "Arco Curto dos Guardas de Sharia",
    category: "arma",
    type: "arma",
    description: "Arco leve, de manuseio excelente. +1 no teste de acerto enquanto você estiver em Cobertura (Cap. 4).",
    price: 45,
    guildRankRequired: "E",
    baseDie: "d6",
    damageAttribute: "agilidade",
  },
  {
    id: "arma_lamina_deus_da_agua",
    name: "Lâmina do Estilo Deus da Água",
    category: "arma",
    type: "arma",
    description:
      "Forjada com foco absoluto no centro de gravidade, desenhada para Aparar. +1 na CA contra o primeiro ataque corpo a corpo que você sofrer em cada rodada.",
    price: 180,
    guildRankRequired: "D",
    baseDie: "d6",
    damageAttribute: "agilidade",
  },
  {
    id: "arma_martelo_esmagador_dorudia",
    name: "Martelo Esmagador de Dorudia",
    category: "arma",
    type: "arma",
    description:
      "Um bloco brutal de aço bruto. Num acerto crítico, a vítima recebe 1 acúmulo de Quebrantado (Cap. 4): −1 na CA e −1 no dano dela, até o fim do combate.",
    price: 110,
    guildRankRequired: "D",
    baseDie: "d10",
  },
  {
    id: "arma_chicote_escamas_dragao",
    name: "Chicote de Escamas de Dragão Vermelho",
    category: "arma",
    type: "arma",
    description:
      "Alcance de 3 metros além do normal. Dano base baixo, mas ignora o bônus de CA de escudo e soma 1d4 de dano ígneo. Ilegal fora das arenas clandestinas.",
    price: 900,
    guildRankRequired: "B",
    disponibilidade: "restrito",
    baseDie: "d6",
  },
  {
    id: "arma_cajado_iniciante_universidade",
    name: "Cajado Iniciante da Universidade",
    category: "arma",
    type: "arma",
    description: "Carvalho polido e uma pedrinha de mana azul na ponta. O padrão dos alunos de Ranoa — melhor que as mãos nuas.",
    price: 15,
    guildRankRequired: "F",
    baseDie: "d6",
  },
  {
    id: "arma_espada_treino_pesada",
    name: "Espada Curta de Treino Pesada",
    category: "arma",
    type: "arma",
    description:
      "Carvalho entalhado, para praticar os golpes do Deus da Espada sem decepar o colega. O dano é não-letal: a 0 PV o alvo cai Inconsciente em vez de entrar no Fio da Vida.",
    price: 5,
    guildRankRequired: "F",
    baseDie: "d4",
  },

  // ————————————————————————————————— ARMADURAS, ROUPAS E ACESSÓRIOS
  {
    id: "armadura_uniforme_ranoa",
    name: "Uniforme da Universidade de Magia de Ranoa",
    category: "armadura",
    type: "armadura",
    description:
      "Tecido maleável com forro mágico. Vantagem em testes de persuasão em ambiente acadêmico ou nobre, e Resistência a dano elétrico — o forro bebe as faíscas de laboratório.",
    price: 80,
    guildRankRequired: "E",
    acBonus: 1,
  },
  {
    id: "armadura_peitoral_paladino_milis",
    name: "Peitoral do Paladino de Milis",
    category: "armadura",
    type: "armadura",
    description:
      "Placas de aço imaculado incrustadas de orações. Armadura média: limita o bônus de Agilidade a +2 (Cap. 4, §1). Quem conjura Cura vestindo isto soma +1 aos PV curados por conjuração.",
    price: 450,
    guildRankRequired: "C",
    acBonus: 4,
  },
  {
    id: "armadura_zariff_mk1",
    name: "Armadura Mágica Zariff MK-I (peça defeituosa)",
    category: "armadura",
    type: "armadura",
    description:
      "Relíquia banida de eras passadas, e a maior CA que o livro conhece. Dobra o seu Deslocamento. Cobra 10 PM por rodada (ou PT, ou PP — o que você tiver); quando a reserva zera, passa a cobrar 10 PV por rodada, e não para sozinha.",
    price: null,
    guildRankRequired: "S",
    disponibilidade: "inestimavel",
    acBonus: 6,
  },
  {
    id: "armadura_colete_escamas_dragao",
    name: "Colete de Escamas de Dragão Vermelho",
    category: "armadura",
    type: "armadura",
    description: "Escamas de um dragão ancião de verdade. Imunidade a dano ígneo, e terreno de magma não queima quem o veste.",
    price: null,
    guildRankRequired: "S",
    disponibilidade: "inestimavel",
    acBonus: 3,
  },
  {
    id: "armadura_tapa_olho_contrabandista",
    name: "Tapa-Olho do Contrabandista",
    category: "armadura",
    type: "geral",
    description:
      "Um cristal no interior do tapa-olho enxerga através de pano e de madeira fina — arma escondida, fundo falso, cofre atrás da parede. Não atravessa metal nem pedra.",
    price: 120,
    guildRankRequired: "D",
    disponibilidade: "restrito",
  },
  {
    id: "armadura_cueca_de_ferro_anoes",
    name: "Cueca de Ferro dos Anões",
    category: "armadura",
    type: "armadura",
    description:
      "Quinze quilos de rebites enferrujados. O vendedor jura que previne golpes baixos. Na prática: Desvantagem em testes de Agilidade e acrobacia, e assaduras.",
    price: 25,
    guildRankRequired: "F",
  },
  {
    id: "armadura_tunica_fio_aranha_pedra",
    name: "Túnica de Fio de Aranha-Pedra",
    category: "armadura",
    type: "armadura",
    description:
      "Seda endurecida da Tarântula de Pedra: leve de verdade. Armadura leve — soma Agilidade inteira na CA e não atrapalha Furtividade nem acrobacia.",
    price: 150,
    guildRankRequired: "D",
    acBonus: 2,
  },
  {
    id: "armadura_escudo_casco_tartaruga",
    name: "Escudo de Casco de Tartaruga Gigante",
    category: "armadura",
    type: "armadura",
    description: "Uma barricada que se carrega. O tamanho cobra o preço: −1,5 m de Deslocamento enquanto empunhado.",
    price: 95,
    guildRankRequired: "D",
    acBonus: 3,
  },
  {
    id: "aventura_luvas_pugilista_begaritt",
    name: "Luvas do Pugilista de Begaritt",
    category: "aventura",
    type: "arma",
    description: "Placas de latão nos nós dos dedos: seu soco passa a usar o dado de uma arma leve em vez do dano desarmado.",
    price: 120,
    guildRankRequired: "D",
    baseDie: "d6",
    damageAttribute: "agilidade",
  },
  {
    id: "aventura_botas_sola_magica",
    name: "Botas com Sola Mágica",
    category: "aventura",
    type: "geral",
    description: "Anulam o som dos passos: Vantagem fixa em Furtividade para se mover. Não silenciam nada além de você.",
    price: 300,
    guildRankRequired: "C",
    disponibilidade: "restrito",
  },
  {
    id: "aventura_chapeu_pontudo_mago",
    name: "Chapéu Pontudo de Mago Genérico",
    category: "aventura",
    type: "geral",
    description: "Azul, com estrelas douradas bordadas. Nenhum bônus de mana. Serve para esconder a careca e para as crianças apontarem.",
    price: 8,
    guildRankRequired: "F",
  },

  // ————————————————————————————————— POÇÕES, ELIXIRES E CONSUMÍVEIS
  {
    id: "pocao_crescimento_capilar_ruijerd",
    name: "Poção de Crescimento Capilar",
    category: "pocao",
    type: "geral",
    description:
      "Pomada para calvície e para mudar a cor de um cabelo suspeito — verde, por exemplo. Nenhum valor em combate, e essencial em metade dos disfarces.",
    price: 10,
    guildRankRequired: "F",
  },
  {
    id: "pocao_filtro_do_amor_asura",
    name: 'Filtro do Amor "Noite em Asura"',
    category: "pocao",
    type: "geral",
    description:
      "Extrato de flores do Continente Demônio. Resistência de Espírito CD 15; na falha, por 2 horas quem bebeu fica fascinado pela primeira pessoa que vir — não consegue atacá-la e aceita pedidos razoáveis dela. Escândalo político em frasco.",
    price: 800,
    guildRankRequired: "B",
    disponibilidade: "restrito",
  },
  {
    id: "pocao_panaceia_arvore_espiritual",
    name: "Panaceia da Árvore Espiritual",
    category: "pocao",
    type: "geral",
    description:
      "Seiva luminosa da Árvore Espiritual, e a única coisa no livro que alcança quem já foi. Derramada na boca de alguém que acumulou as 3 Marcas da Morte há menos de 1 minuto, traz a pessoa de volta com 1 PV. Em quem ainda está vivo: cura todos os PV, limpa toda condição e reata membro decepado.",
    price: null,
    guildRankRequired: "S",
    disponibilidade: "inestimavel",
  },
  {
    id: "pocao_cha_folha_treant",
    name: "Chá de Folha de Treant Ancião",
    category: "pocao",
    type: "geral",
    description: "Leva 1 minuto para preparar, fora de combate. Quem bebe recupera o dobro de PM no próximo Descanso Curto.",
    price: 60,
    guildRankRequired: "D",
  },
  {
    id: "pocao_sopa_monstro_pantano",
    name: "Sopa de Monstro de Pântano",
    category: "pocao",
    type: "geral",
    description: "Gororoba roxa e fedorenta. Cura 1d4 PV e deixa quem comeu Envenenado por 1d4 horas. É trocar vida por intoxicação alimentar.",
    price: 1,
    guildRankRequired: "F",
  },
  {
    id: "pocao_racao_anoes",
    name: "Ração de Viagem Enlatada dos Anões",
    category: "pocao",
    type: "geral",
    description:
      "Carne dura e biscoito insípido que não apodrecem em clima nenhum. Um lote alimenta uma pessoa por uma semana e impede a Exaustão por fome (Cap. 4, §9). Tem gosto de sola temperada.",
    price: 12,
    guildRankRequired: "F",
  },
  {
    id: "pocao_pilula_adrenalina_asura",
    name: "Pílula de Adrenalina de Asura",
    category: "pocao",
    type: "geral",
    description:
      "Estimulante ilegal. Por 1 turno você ignora toda Desvantagem vinda de Exaustão e de Trauma e não precisa rolar o Fio da Vida. No começo do turno seguinte, você cai Inconsciente por 1d4 rodadas — o coração cobra.",
    price: 450,
    guildRankRequired: "C",
    disponibilidade: "restrito",
  },
  {
    id: "pocao_cha_calmante_milis",
    name: "Chá Calmante de Milis",
    category: "pocao",
    type: "geral",
    description:
      "Infusão divina: restaura metade dos seus PM máximos na hora. Pela hora seguinte, Desvantagem em testes de percepção e de Agilidade — o corpo fica lento enquanto a mana volta.",
    price: 30,
    guildRankRequired: "E",
  },
  {
    id: "pocao_suco_fruta_diabo",
    name: "Suco de Fruta-Diabo",
    category: "pocao",
    type: "geral",
    description:
      "Delícia rara das florestas do Continente Demônio. Resistência a dano psíquico por 24 horas — e Envenenado nas 2 primeiras, enquanto o estômago protesta.",
    price: 55,
    guildRankRequired: "E",
    disponibilidade: "restrito",
  },
  {
    id: "pocao_sangue_goblin_fedorento",
    name: "Frasco de Sangue de Goblin Fedorento",
    category: "pocao",
    type: "geral",
    description:
      "Esfregado no corpo, convence goblins e bichos pequenos de que você é um dos deles, e doente. Predadores grandes não se importam nem um pouco.",
    price: 2,
    guildRankRequired: "F",
  },

  // ————————————————————————————————— VENENOS E TOXINAS
  {
    id: "veneno_tarantula_de_pedra",
    name: "Veneno de Tarântula de Pedra",
    category: "veneno",
    type: "geral",
    description:
      "Toxina cinzenta para revestir a arma. No próximo acerto, a vítima fica Atolada e Desequilibrada até o fim do próximo turno dela.",
    price: 150,
    guildRankRequired: "D",
  },
  {
    id: "veneno_lagrima_de_succubus",
    name: "Lágrima de Succubus",
    category: "veneno",
    type: "geral",
    description:
      "Pó em vidro de perfume. Quebrado no chão, todos numa área de 3 m fazem resistência de Vigor CD 15 ou caem Inconscientes por 1 minuto — o sono ignora imunidade de raça. Extremamente restrito pela guarda de Asura.",
    price: 1200,
    guildRankRequired: "B",
    disponibilidade: "restrito",
  },
  {
    id: "veneno_extrato_treant_corrompido",
    name: "Extrato Ácido de Treant Corrompido",
    category: "veneno",
    type: "geral",
    description:
      "Líquido negro, atirado ou passado na lâmina. Come metal: a armadura da vítima perde 2 de bônus de CA até ser consertada num ferreiro. Não afeta armadura leve de couro nem pano.",
    price: 850,
    guildRankRequired: "B",
    disponibilidade: "restrito",
  },
  {
    id: "veneno_cobra_cega",
    name: "Veneno de Cobra-Cega",
    category: "veneno",
    type: "geral",
    description:
      "Diziam que cegava. Na verdade foi espremido de uma cobra que era cega, o bicho. Sem toxina nenhuma: em combate, não faz absolutamente nada.",
    price: 5,
    guildRankRequired: "F",
  },
  {
    id: "veneno_paralisante_manticora",
    name: "Veneno Paralisante de Manticora",
    category: "veneno",
    type: "geral",
    description:
      "Denso, caro e sério. No próximo acerto da arma revestida, a vítima faz resistência de Vigor CD 20 ou fica Paralisada por 1 rodada.",
    price: 1500,
    guildRankRequired: "A",
    disponibilidade: "restrito",
  },
  {
    id: "veneno_toxina_nevoa_vermelha",
    name: "Toxina da Névoa Vermelha",
    category: "veneno",
    type: "geral",
    description:
      "Granada de gás. Área de 3 m, resistência de Espírito CD 15: na falha, por 2 turnos a criatura ataca a criatura mais próxima dela, seja quem for — inclusive um aliado. Se não houver ninguém ao alcance, ela avança na direção do barulho mais próximo.",
    price: 550,
    guildRankRequired: "C",
    disponibilidade: "restrito",
  },
  {
    id: "veneno_oleo_queimadura_escarlate",
    name: "Óleo de Queimadura Escarlate",
    category: "veneno",
    type: "geral",
    description:
      "Untar a arma gasta 1 Ação. O próximo golpe que acertar deixa o alvo Em Chamas (Cap. 4), sem precisar de magia de Fogo nenhuma.",
    price: 70,
    guildRankRequired: "D",
  },
  {
    id: "veneno_perfume_de_cadaver",
    name: "Perfume de Cadáver",
    category: "veneno",
    type: "geral",
    description:
      "Essência destilada de necrotério. Mortos-vivos irracionais ignoram quem está usando; cidade nenhuma ignora, e abutres também não.",
    price: 15,
    guildRankRequired: "F",
  },
  {
    id: "veneno_po_de_vidro_moido",
    name: "Pó de Vidro Moído",
    category: "veneno",
    type: "geral",
    description:
      "Prática hedionda das ruas de Shirone. Atirado no rosto a até 1,5 m: resistência de Agilidade CD 13 ou a vítima fica Cega até gastar 1 Ação lavando o rosto com água limpa.",
    price: 8,
    guildRankRequired: "F",
    disponibilidade: "restrito",
  },

  // ————————————————————————————————— FERRAMENTAS MÁGICAS, RELÍQUIAS E LIVROS
  {
    id: "ferramenta_olho_demoniaco_previsao",
    name: "Olho Demoníaco da Previsão",
    category: "ferramenta-magica",
    type: "geral",
    description:
      "Arrancado de uma Imperatriz Demônio e transplantado por cirurgia arriscada. Antecipa o movimento inimigo: +1 na CA e ataques inimigos nunca ganham Vantagem por flanquear ou posicionamento. Drena 1 PM por hora enquanto estiver aberto; sem reserva, drena PV.",
    price: null,
    guildRankRequired: "S",
    disponibilidade: "inestimavel",
  },
  {
    id: "ferramenta_anel_absorcao_magica",
    name: "Anel de Absorção Mágica",
    category: "ferramenta-magica",
    type: "geral",
    description:
      "Uma vez por combate, como Reação, absorve por inteiro uma magia mirada em você — dano, efeito e condição. O PM que ela custou vai para a sua reserva, até o seu máximo.",
    price: 3000,
    guildRankRequired: "A",
  },
  {
    id: "ferramenta_placa_comunicacao_orsted",
    name: "Placa de Comunicação de Orsted",
    category: "ferramenta-magica",
    type: "geral",
    description:
      "Monólito de bolso que troca texto mágico instantâneo com quem tiver o par, a qualquer distância. Imune a interferência e a rastreamento. Existem poucos pares no mundo.",
    price: null,
    guildRankRequired: "S",
    disponibilidade: "inestimavel",
  },
  {
    id: "ferramenta_livro_feiticos_rei_agua",
    name: "Livro de Feitiços de Nível Rei (Água)",
    category: "ferramenta-magica",
    type: "geral",
    description:
      "As equações e o cântico longo de Relâmpago. Quem tem Rank Rei em Magia de Água aprende a magia sem gastar PA — mas o estudo toma 1 ano de tempo de jogo.",
    price: 2500,
    guildRankRequired: "A",
  },
  {
    id: "ferramenta_anel_armazenamento_menor",
    name: "Anel de Armazenamento Menor",
    category: "ferramenta-magica",
    type: "geral",
    description: "Magia espacial num anel de prata: guarda até 5 kg de coisa pequena — moeda, joia, papel, frasco. Espada e pedra não entram.",
    price: 400,
    guildRankRequired: "C",
  },
  {
    id: "ferramenta_cristal_de_gravacao",
    name: "Cristal de Gravação",
    category: "ferramenta-magica",
    type: "geral",
    description:
      "Com 1 PM, grava até 5 minutos de áudio limpo do ambiente e reproduz quando pedido. A maior arma já inventada contra politicagem de guilda.",
    price: 250,
    guildRankRequired: "C",
  },
  {
    id: "ferramenta_colar_deteccao_magia",
    name: "Colar de Detecção de Magia (Básico)",
    category: "ferramenta-magica",
    type: "geral",
    description:
      "Vibra perto (até 10 m) de aura mágica concentrada, demônio ou feitiço invisível ativo. Não diz o que é nem onde exatamente — só que tem.",
    price: 150,
    guildRankRequired: "D",
  },
  {
    id: "ferramenta_bracelete_reversao_arcana",
    name: "Bracelete da Reversão Arcana",
    category: "ferramenta-magica",
    type: "geral",
    description:
      "Forjado durante a Guerra de Laplace. Uma vez por dia, ao ser alvo de uma magia, devolve o efeito inteiro — dano, alcance e modificadores — para quem a lançou, sem direito a CA.",
    price: null,
    guildRankRequired: "S",
    disponibilidade: "inestimavel",
  },
  {
    id: "ferramenta_amuleto_sombrio_deus_espada",
    name: "Amuleto Sombrio do Deus da Espada",
    category: "ferramenta-magica",
    type: "geral",
    description:
      "Acelera o saque. O seu primeiro ataque em cada combate não pode ser respondido por Reação de Aparar nem de Guarda. Só um Rank Santo ou acima do Deus da Espada aguenta usá-lo: abaixo disso, o braço quebra no primeiro saque (1d10 e 1 nível de Exaustão).",
    price: 3000,
    guildRankRequired: "A",
    disponibilidade: "restrito",
  },
  {
    id: "ferramenta_mascara_orsted_falsificada",
    name: "Máscara de Ocultação de Orsted (falsificada)",
    category: "ferramenta-magica",
    type: "geral",
    description:
      "Diziam que quem usasse o capuz do Deus Dragão seria respeitado. É madeira mal entalhada vendida por camelô. Nenhuma ocultação, muita confusão.",
    price: 3,
    guildRankRequired: "F",
  },
  {
    id: "ferramenta_boneco_do_mestre",
    name: 'Boneco Esculpido do "Mestre"',
    category: "ferramenta-magica",
    type: "geral",
    description:
      "Action-figure em argila e resina, de fatura impecável, com roupas removíveis esculpidas por magia. Não serve para nada além de provar devoção — e de assustar quem te pegar adorando isso.",
    price: 1000,
    guildRankRequired: "E",
  },
  {
    id: "aventura_bussola_quebrada_demonio",
    name: "Bússola Quebrada do Continente Demônio",
    category: "aventura",
    type: "geral",
    description:
      "Aponta o norte, exceto quando você está no norte. Gira sem parar se houver um demônio a menos de 50 m — e sempre há, então ela passa o dia girando.",
    price: 10,
    guildRankRequired: "F",
  },

  // ————————————————————————————————— TRALHAS E ESPÓLIOS
  {
    id: "tralha_presa_lobo_gigante",
    name: "Presa Lascada de Lobo Gigante",
    category: "tralha",
    type: "geral",
    disponibilidade: "restrito",
    description: "Dente de monstro básico. Alquimista compra como reagente de pó de osso de baixa qualidade.",
    price: 5,
    guildRankRequired: "F",
  },
  {
    id: "tralha_casco_besouro_tartaruga",
    name: "Casco de Besouro-Tartaruga",
    category: "tralha",
    type: "geral",
    disponibilidade: "restrito",
    description: "Pedaço duro de exoesqueleto. Ferreiro de vila remenda panela e armadura barata com isso.",
    price: 12,
    guildRankRequired: "F",
  },
  {
    id: "tralha_gema_magica_opaca",
    name: "Gema Mágica Opaca (esgotada)",
    category: "tralha",
    type: "geral",
    disponibilidade: "restrito",
    description: "Cai de monstro mágico. Não serve mais para encantamento, mas lapidada vira bijuteria para nobre desatento.",
    price: 20,
    guildRankRequired: "F",
  },
  {
    id: "tralha_pano_amaldicoado",
    name: "Pano Amaldiçoado Ensanguentado",
    category: "tralha",
    type: "geral",
    disponibilidade: "restrito",
    description: "Resto de túnica de lich ou de fantasma. Bruxo compra para decoração macabra. O cheiro nunca sai.",
    price: 2,
    guildRankRequired: "F",
  },
  {
    id: "tralha_moeda_antiga_shirone",
    name: "Moeda Antiga do Reino de Shirone",
    category: "tralha",
    type: "geral",
    disponibilidade: "restrito",
    description: "Prata gasta, sem valor de câmbio. Historiador de guilda compra por curiosidade.",
    price: 8,
    guildRankRequired: "F",
  },
  {
    id: "tralha_chifre_besta_terrestre",
    name: "Chifre Quebrado de Besta Terrestre",
    category: "tralha",
    type: "geral",
    disponibilidade: "restrito",
    description: "Metade de um chifre enorme. Pesado e inútil em combate; esculpido, vira caneca de taverna.",
    price: 45,
    guildRankRequired: "F",
  },
  {
    id: "tralha_frasco_acido_gastrico",
    name: "Frasco de Ácido Gástrico Neutro",
    category: "tralha",
    type: "geral",
    disponibilidade: "restrito",
    description: "Extraído de estômago de slime. Não dá dano nenhum. Vendido em Sharia como desentupidor de esgoto.",
    price: 18,
    guildRankRequired: "F",
  },
  {
    id: "tralha_fivela_aventureiro_morto",
    name: "Fivela de Cinto de Aventureiro Morto",
    category: "tralha",
    type: "geral",
    disponibilidade: "restrito",
    description: "Saiu do estômago de um predador. Dá para vender — e o lojista vai te julgar por lucrar em cima de um companheiro caído.",
    price: 3,
    guildRankRequired: "F",
  },
  {
    id: "tralha_estatueta_madeira_engracada",
    name: "Estatueta de Madeira Engraçada",
    category: "tralha",
    type: "geral",
    disponibilidade: "restrito",
    description: "Espólio de tribo goblin ou orc. Arte grotesca que nobre excêntrico compra aos montes para a coleção exótica.",
    price: 30,
    guildRankRequired: "F",
  },
  {
    id: "tralha_po_asa_mariposa_ilusoria",
    name: "Pó de Asa de Mariposa Ilusória",
    category: "tralha",
    type: "geral",
    disponibilidade: "restrito",
    description: "Atirado, faz espirrar sem parar. Loja de pegadinha compra o quanto aparecer.",
    price: 60,
    guildRankRequired: "F",
  },
];
