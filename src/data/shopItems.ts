import { AttributeKey, GuildRank, InventoryItem } from "@/lib/types";
import { WEAPON_PRESETS } from "@/lib/weaponDie";
import { COMPENDIO_ITENS } from "./compendioDeItens";

export type ShopCategory =
  | "arma"
  | "armadura"
  | "aventura"
  | "pocao"
  | "veneno"
  | "ferramenta-magica"
  | "encantamento"
  | "tralha";

export const SHOP_CATEGORY_ORDER: ShopCategory[] = [
  "arma",
  "armadura",
  "aventura",
  "pocao",
  "veneno",
  "ferramenta-magica",
  "encantamento",
  "tralha",
];

/**
 * ONDE O ITEM PODE SER OBTIDO (2026-09-23).
 *
 * Até aqui o catálogo só sabia descrever prateleira: tudo que existia estava à
 * venda, e o único filtro era o Rank de Guilda. Metade do Compêndio não cabe
 * nisso — uma lâmina do Continente Demônio não está na vitrine da Guilda por
 * mais PO que você tenha, e uma relíquia da Guerra de Laplace não tem vitrine
 * nenhuma.
 *
 *   loja         Está à venda na Guilda, respeitando o `guildRankRequired`.
 *   restrito     Existe no mundo, não na prateleira: drop, missão, contrabando.
 *                Tem preço porque alguém compra — só não é a Guilda.
 *   inestimavel  Relíquia. Não tem preço: não se compra e não se vende, troca
 *                de mão por história. É o que impede que um único drop pague o
 *                catálogo inteiro várias vezes (ver a regra de revenda no
 *                Cap. 5).
 */
export type Disponibilidade = "loja" | "restrito" | "inestimavel";

/**
 * A imagem de cada categoria, em `public/loja/` (2026-09-03).
 *
 * Mesma regra do `Tree.icon`: o arquivo se chama como a categoria, e o caminho
 * inteiro mora no dado porque só a extensão varia. Desde 0.1.5 as SETE têm arte
 * própria; o `Partial<>` continua porque uma categoria nova pode nascer sem
 * medalhão, e a tela cai no ícone de traço da lucide quando falta.
 */
export const SHOP_CATEGORY_ICONS: Partial<Record<ShopCategory, string>> = {
  arma: "/loja/arma.png",
  armadura: "/loja/armadura.png",
  /*
   * A sétima e última categoria (0.1.5). A arte já estava no repositório desde
   * 0.1.4 — solta na raiz de `public/`, com espaço no nome ("aventura
   * equipamento.png"), fora da pasta e portanto invisível pra esta tabela. O
   * `check:livro` avisava "categoria sem arte própria" o tempo todo e o arquivo
   * estava a um diretório de distância.
   */
  aventura: "/loja/aventura.png",
  pocao: "/loja/pocao.png",
  veneno: "/loja/veneno.jpg",
  "ferramenta-magica": "/loja/ferramenta-magica.png",
  encantamento: "/loja/encantamento.jpg",
};

export const SHOP_CATEGORY_LABELS: Record<ShopCategory, string> = {
  arma: "Armas",
  armadura: "Armaduras",
  aventura: "Equipamento de Aventura",
  pocao: "Poções",
  veneno: "Venenos",
  "ferramenta-magica": "Ferramentas Mágicas",
  encantamento: "Encantamentos",
  tralha: "Tralhas e Espólios",
};

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  type: InventoryItem["type"];
  description: string;
  /**
   * Preço em PO — o mesmo valor mostrado no Livro de Regras (Cap. 5, §4).
   *
   * `null` é a relíquia: um item que NÃO TEM preço, e não um que custa zero.
   * O tipo obriga cada tela a decidir o que fazer com isso, que é justamente o
   * que se quer — um `0` silencioso viraria "de graça" na loja e "sem valor"
   * no gerador de loot.
   */
  price: number | null;
  /** Cap. 5, §2 ("A Loja da Guilda"): Rank mínimo de Aventureiro pra esse item aparecer à venda. */
  guildRankRequired: GuildRank;
  /** Ausente = `loja`, que é o caso dos 85 itens originais do catálogo. */
  disponibilidade?: Disponibilidade;
  baseDie?: string;
  damageAttribute?: AttributeKey;
  acBonus?: number;
}

/**
 * O que a Loja da Guilda tem na prateleira.
 *
 * O type predicate existe pra que a loja não precise perguntar "e se não tiver
 * preço?" em cinco lugares: quem chega lá já chegou com preço, e o TypeScript
 * sabe disso.
 */
export function estaAVenda(item: ShopItem): item is ShopItem & { price: number } {
  return (item.disponibilidade ?? "loja") === "loja" && item.price !== null;
}

/** Converte um item da loja no formato que `useCharacterStore.buyItem` espera — mesmo shape de `addItem`. */
export function toInventoryItem(item: ShopItem): Omit<InventoryItem, "id" | "equipped"> {
  return {
    name: item.name,
    type: item.type,
    description: item.description,
    baseDie: item.baseDie,
    damageAttribute: item.damageAttribute,
    acBonus: item.acBonus,
  };
}

/**
 * Preço em PO escalado pelo dado base — mesma escada de `WEAPON_DIE_LADDER`
 * (Cap. 3), mas só até d10: acima disso as armas viram encomenda/loot de
 * campanha, não item de prateleira comum.
 */
const WEAPON_PRICE_BY_DIE: Record<string, number> = {
  d4: 6,
  d6: 15,
  d8: 35,
  d10: 65,
};

/** Cap. 5, §2, "equipamento mundano comum": reaproveita o mesmo catálogo de armas do formulário de Inventário (`WEAPON_PRESETS`), pra loja e ficha nunca divergirem em nome/dado. */
/**
 * A frase que vale pras DOZE armas mundanas de uma vez.
 *
 * Ela sempre foi uma só no dado — mas a loja imprimia uma cópia dela em cada
 * card, e doze cards lado a lado repetindo o mesmo parágrafo transformavam a
 * página numa parede de texto onde as armas que TÊM algo próprio a dizer
 * (Adaga de Prata, Lâmina Balanceada) afogavam no meio. Agora ela é exportada,
 * e a tela sabe reconhecê-la como nota de grupo em vez de descrição de item.
 */
const NOTA_ARMA_MUNDANA =
  'Arma mundana, sem encantamento — ver Cap. 3, "O Dado de Arma", pra como ela escala com seu Rank, e Cap. 1, §4 pro grupo de proficiência dela.';

const WEAPONS: ShopItem[] = WEAPON_PRESETS.map((preset) => ({
  id: `arma_${preset.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: preset.name,
  category: "arma",
  type: "arma",
  description: NOTA_ARMA_MUNDANA,
  price: WEAPON_PRICE_BY_DIE[preset.die] ?? 15,
  guildRankRequired: "F",
  baseDie: preset.die,
}));

/**
 * Armas com um pingo de identidade além do Dado — bônus sempre pequeno e
 * travado (nunca mexe no Dado de Arma nem empilha com Encantamento, Cap. 5
 * §4), só pra dar um Rank mínimo mais alto uma razão de existir.
 */
const SPECIAL_WEAPONS: ShopItem[] = [
  {
    id: "arma_adaga_de_prata",
    name: "Adaga de Prata",
    category: "arma",
    type: "arma",
    description: "Liga de prata batida em vez de aço comum — eficaz contra certas criaturas amaldiçoadas ou licantrópicas, a critério do Mestre. Sem bônus numérico contra o resto.",
    price: 40,
    guildRankRequired: "E",
    baseDie: "d4",
  },
  {
    id: "arma_lamina_balanceada",
    name: "Lâmina Balanceada",
    category: "arma",
    type: "arma",
    description: "Peso distribuído com perfeição rara — funciona em qualquer arma leve, não só espadas. +1 no teste de acerto (nunca no dano).",
    price: 150,
    guildRankRequired: "C",
    baseDie: "d6",
  },
  {
    id: "arma_machado_sanguessedento",
    name: "Machado Sanguessedento",
    category: "arma",
    type: "arma",
    description: "Ao reduzir um inimigo a 0 PV com este golpe (nunca em dano que não mata), você recupera 1d4 PV.",
    price: 350,
    guildRankRequired: "B",
    baseDie: "d8",
  },
  {
    id: "arma_lanca_persecutora",
    name: "Lança Persecutora",
    category: "arma",
    type: "arma",
    description: "Vantagem no teste de acerto contra um alvo que se afastou de você neste turno — nunca perde o rastro de quem tenta fugir.",
    price: 550,
    guildRankRequired: "A",
    baseDie: "d10",
  },
  {
    id: "arma_espada_fantasma",
    name: "Espada-Fantasma",
    category: "arma",
    type: "arma",
    description: "Uma vez por Descanso Longo, um ataque com ela ignora completamente a CA do alvo (acerto automático) — o dano continua normal, sem bônus.",
    price: 800,
    guildRankRequired: "S",
    baseDie: "d8",
  },
  {
    id: "arma_espada_corta_aco",
    name: "Espada Corta-Aço",
    category: "arma",
    type: "arma",
    description:
      "Propriedade invertida: quanto mais duro o alvo, mais fácil ela acerta. Contra CA 15+, +1 no teste de acerto; CA 20+, +2; CA 25+, +3 (teto). O Dado de Arma não muda — é só acerto, não dano extra (dano extra é Encantamento, Cap. 5 §4). Contra algo mole ou frágil sem resistência estrutural de verdade — pano, corda, uma vela, uma folha de papel — ela simplesmente não corta, não importa a força do golpe: desliza sem efeito.",
    price: 260,
    guildRankRequired: "D",
    baseDie: "d8",
  },
];

const ARMOR: ShopItem[] = [
  {
    id: "armadura_escudo",
    name: "Escudo",
    category: "armadura",
    type: "armadura",
    description: "Empunhado numa mão só — soma com qualquer outra armadura vestida. Exige o grupo de proficiência Escudos (Cap. 1, §4): sem ele, rende +1 de CA em vez de +2.",
    price: 25,
    guildRankRequired: "F",
    acBonus: 2,
  },
  {
    id: "armadura_leve",
    name: "Armadura Leve (couro)",
    category: "armadura",
    type: "armadura",
    description: "Categoria: leve (todo personagem é proficiente, Cap. 1, §4). Peito e braçadeiras de couro batido — não atrapalha a mobilidade.",
    price: 20,
    guildRankRequired: "F",
    acBonus: 1,
  },
  {
    id: "armadura_media",
    name: "Armadura Média",
    category: "armadura",
    type: "armadura",
    description: "Categoria: média (exige proficiência, Cap. 1, §4). Cota de malha com reforços — o padrão de quem pretende segurar a linha de frente.",
    price: 60,
    guildRankRequired: "F",
    acBonus: 3,
  },
  {
    id: "armadura_pesada",
    name: "Armadura Pesada",
    category: "armadura",
    type: "armadura",
    description: "Categoria: pesada (exige proficiência, Cap. 1, §4). Placas completas — pesada o bastante pra sede exigir alguma reputação antes de vender.",
    price: 150,
    guildRankRequired: "E",
    acBonus: 5,
  },
  {
    id: "armadura_cota_elfica",
    name: "Cota Élfica",
    category: "armadura",
    type: "armadura",
    description: "Categoria: leve (todo personagem é proficiente, Cap. 1, §4). Tecelagem que nenhum ferreiro comum reproduz — tão leve quanto couro batido, protege quase como malha reforçada.",
    price: 180,
    guildRankRequired: "D",
    acBonus: 2,
  },
  {
    id: "armadura_runica",
    name: "Armadura Rúnica",
    category: "armadura",
    type: "armadura",
    description: "Categoria: média (exige proficiência, Cap. 1, §4). Runas gravadas na superfície distribuem o impacto de um golpe por toda a peça — ligeiramente mais pesada que a Média, protege mais.",
    price: 260,
    guildRankRequired: "C",
    acBonus: 4,
  },
  {
    id: "armadura_placas_draconicas",
    name: "Placas Dracônicas",
    category: "armadura",
    type: "armadura",
    description: "Categoria: pesada (exige proficiência, Cap. 1, §4). Escamas de dragão menor reforçando o metal — Vantagem em testes de resistência contra Medo causado por criaturas dracônicas. Proteção física igual à Armadura Pesada.",
    price: 450,
    guildRankRequired: "B",
    acBonus: 5,
  },
  {
    id: "armadura_runica_maior",
    name: "Armadura Rúnica Maior",
    category: "armadura",
    type: "armadura",
    description: "Categoria: média (exige proficiência, Cap. 1, §4). A evolução da Armadura Rúnica — mais runas, mais peso, mais proteção.",
    price: 650,
    guildRankRequired: "A",
    acBonus: 6,
  },
  {
    id: "armadura_egide_lendaria",
    name: "Égide Lendária",
    category: "armadura",
    type: "armadura",
    description: "Categoria: pesada (exige proficiência, Cap. 1, §4). Uma vez por Descanso Longo, ignore completamente o dano de um único golpe recebido — decida depois de ver o resultado do ataque. Se isso evitar que o dano leve você a 0 PV, conta como a sua Salvação do combate (Cap. 4, §5): não empilha com Aguentar, Rejeitar a Morte, Sem Baixas ou Custe o Que Custar.",
    price: 1200,
    guildRankRequired: "S",
    acBonus: 6,
  },
];

const ADVENTURE_GEAR: ShopItem[] = [
  { id: "geral_corda", name: "Corda (15m)", category: "aventura", type: "geral", description: "Trançada, aguenta o peso de uma pessoa em queda.", price: 2, guildRankRequired: "F" },
  { id: "geral_tocha", name: "Tocha (feixe de 5)", category: "aventura", type: "geral", description: "Cerca de 1 hora de luz cada.", price: 1, guildRankRequired: "F" },
  { id: "geral_primeiros_socorros", name: "Kit de Primeiros Socorros", category: "aventura", type: "geral", description: "Bandagens, agulha, linha e um torniquete. Qualquer um estabiliza uma criatura a 0 PV com 1 Ação e teste de Medicina CD 10 (Cap. 4); com este kit, o teste tem Vantagem. Não cura PV.", price: 10, guildRankRequired: "F" },
  { id: "geral_racao", name: "Ração de Viagem (1 semana)", category: "aventura", type: "geral", description: "Seca, pesada, dura em qualquer clima.", price: 5, guildRankRequired: "F" },
  { id: "geral_cantil", name: "Cantil", category: "aventura", type: "geral", description: "Couro impermeabilizado, cerca de 1 litro.", price: 2, guildRankRequired: "F" },
  { id: "geral_mochila", name: "Mochila de Couro", category: "aventura", type: "geral", description: "Reforçada, com alças duplas pra carregar mais sem cansar.", price: 8, guildRankRequired: "F" },
  { id: "geral_acampamento", name: "Kit de Acampamento", category: "aventura", type: "geral", description: "Tenda pequena, cobertor e um saco de dormir.", price: 15, guildRankRequired: "F" },
  { id: "geral_isqueiro", name: "Isqueiro de Faísca", category: "aventura", type: "geral", description: "Pederneira e aço — acende fogo mesmo com vento leve.", price: 3, guildRankRequired: "F" },
  { id: "geral_lampiao", name: "Lampião de Óleo", category: "aventura", type: "geral", description: "Luz mais estável que tocha, dura a noite toda com o tanque cheio.", price: 12, guildRankRequired: "F" },
  { id: "geral_kit_arrombamento", name: "Kit de Arrombamento", category: "aventura", type: "geral", description: "Gazuas e alavanca fina — abre fechaduras e engates simples sem estragar a porta.", price: 18, guildRankRequired: "F" },
  { id: "geral_gancho_corda", name: "Gancho e Corda de Escalada", category: "aventura", type: "geral", description: "Corda de 20m com gancho de três pontas — prende em beiradas, galhos ou grades.", price: 10, guildRankRequired: "F" },
  { id: "geral_mapa_em_branco", name: "Mapa em Branco", category: "aventura", type: "geral", description: "Pergaminho de boa gramatura, pena e tinta — pra registrar o terreno que ninguém ainda desenhou.", price: 6, guildRankRequired: "F" },
  { id: "geral_provisoes_longas", name: "Provisões de Longa Duração (30 dias)", category: "aventura", type: "geral", description: "A versão grande da Ração de Viagem — mais pesada, mas rende um mês inteiro sem estragar.", price: 18, guildRankRequired: "F" },
  { id: "geral_luneta", name: "Luneta", category: "aventura", type: "geral", description: "Lentes de vidro comum, sem magia — enxerga detalhes a centenas de metros em dia claro.", price: 30, guildRankRequired: "E" },
  { id: "geral_kit_alpinismo", name: "Kit de Alpinismo Completo", category: "aventura", type: "geral", description: "Pitons, mosquetões e arnês — escalada técnica em rocha viva, não só um gancho e uma corda.", price: 60, guildRankRequired: "D" },
  { id: "geral_barraca_reforcada", name: "Barraca Reforçada contra Clima Extremo", category: "aventura", type: "geral", description: "Aguenta nevasca, areia e vento forte sem rasgar — o Kit de Acampamento comum não sobrevive nesses climas.", price: 90, guildRankRequired: "C" },
  { id: "geral_provisoes_concentradas", name: "Provisões Concentradas de Campanha (90 dias)", category: "aventura", type: "geral", description: "Rações compactadas ao extremo — três meses de comida no peso que a Ração de Viagem normal levaria pra duas semanas.", price: 150, guildRankRequired: "B" },
  { id: "geral_kit_expedicao", name: "Kit de Sobrevivência de Expedição", category: "aventura", type: "geral", description: "Tudo que uma equipe precisa pra sobreviver semanas em terreno hostil desconhecido — do tipo que só quem já liderou expedições sabe montar direito.", price: 300, guildRankRequired: "A" },
  { id: "geral_mapa_continental", name: "Mapa Master de um Continente Inteiro", category: "aventura", type: "geral", description: "Levantamento cartográfico completo e atualizado — a maioria dos mapas assim é segredo de estado. Um dos poucos itens mundanos que vale uma fortuna sozinho.", price: 1000, guildRankRequired: "S" },
];

/**
 * Cap. 5, §4 ("Poções"): mesmo nome, CD, preço e EFEITO do livro.
 *
 * Poção não é magia: efeito fixo, nunca copia feitiço, ritual ou Reação. Antes
 * cada poção de cura "reproduzia uma magia de Cura de rank X" — a Imperial
 * virava Corpo Íntegro em 1 Ação, e a Menor virava Escudo de Carne por 15 PO.
 * A Ferida Fresca não dobra poção, e nenhuma poção apaga Ferimento Crítico.
 */
const NOTA_POCAO = "Poção não é magia: a Ferida Fresca não a dobra, e nenhuma poção apaga Ferimento Crítico.";

const POTIONS: ShopItem[] = [
  {
    id: "pocao_menor_cura",
    name: "Poção Menor de Cura",
    category: "pocao",
    type: "geral",
    description: `Cura 1d8 + 2 PV. Beber ou dar a um aliado adjacente é Usar Item (1 Ação). ${NOTA_POCAO}`,
    price: 15,
    guildRankRequired: "F",
  },
  {
    id: "pocao_antidoto",
    name: "Poção de Antídoto",
    category: "pocao",
    type: "geral",
    description: "Remove um veneno ou uma doença de rank Principiante (Cap. 4, §8). Contra ranks acima disso, não faz nada — é uma dose, não um mago.",
    price: 25,
    guildRankRequired: "E",
  },
  {
    id: "pocao_elixir_foco",
    name: "Elixir de Foco",
    category: "pocao",
    type: "geral",
    description: "Por 1 cena, ignore a Desvantagem que o Trauma impõe (Cap. 4) — o gole antes de uma negociação que não pode dar errado.",
    price: 40,
    guildRankRequired: "E",
  },
  {
    id: "pocao_maior_cura",
    name: "Poção Maior de Cura",
    category: "pocao",
    type: "geral",
    description: `Cura 3d8 + 3 PV. Beber ou dar a um aliado adjacente é Usar Item (1 Ação). ${NOTA_POCAO}`,
    price: 60,
    guildRankRequired: "C",
  },
  {
    id: "pocao_vigor_passageiro",
    name: "Poção de Vigor Passageiro",
    category: "pocao",
    type: "geral",
    description: "Vantagem no próximo teste de resistência de Vigor — contra um veneno, uma doença ou o frio que está chegando.",
    price: 45,
    guildRankRequired: "D",
  },
  {
    id: "pocao_antidoto_forte",
    name: "Poção de Antídoto Forte",
    category: "pocao",
    type: "geral",
    description: "Remove um veneno ou uma doença de rank Intermediário ou inferior (Cap. 4, §8). Contra ranks acima disso, não faz nada.",
    price: 120,
    guildRankRequired: "C",
  },
  {
    id: "pocao_regia_cura",
    name: "Poção Régia de Cura",
    category: "pocao",
    type: "geral",
    description: `Cura 5d8 + 4 PV. Beber ou dar a um aliado adjacente é Usar Item (1 Ação). ${NOTA_POCAO}`,
    price: 120,
    guildRankRequired: "B",
  },
  {
    id: "pocao_elixir_regeneracao",
    name: "Elixir de Regeneração",
    category: "pocao",
    type: "geral",
    description: "Remove 2 níveis de Exaustão de quem bebe (Cap. 4, §9) — não cura PV nem PM, só o cansaço acumulado. Não remove Exaustão cuja causa ainda esteja ativa: quem não comeu continua com fome.",
    price: 200,
    guildRankRequired: "A",
  },
  {
    id: "pocao_imperial_cura",
    name: "Poção Imperial de Cura",
    category: "pocao",
    type: "geral",
    description: `Cura 5d8 + 6 PV e remove toda a Exaustão de origem física (ferimento, trauma, ter acordado do Fio da Vida) — nunca a de fome, sede, frio ou marcha forçada. ${NOTA_POCAO}`,
    price: 400,
    guildRankRequired: "S",
  },
];

/** Cap. 5, §4 ("Venenos"): mesmo rank e preço de venda do livro. Rank Santo ou acima não entra aqui de propósito — o livro é explícito que não está à venda. */
const POISONS: ShopItem[] = [
  {
    id: "veneno_principiante",
    name: "Veneno Fraco (rank Principiante)",
    category: "veneno",
    type: "geral",
    description: "Ex: baba de sapo-lodo. Aplicação em Cap. 4, §8, \"Aplicando um Veneno em Combate ou em Segredo\".",
    price: 5,
    guildRankRequired: "E",
  },
  {
    id: "veneno_intermediario",
    name: "Veneno Comum (rank Intermediário)",
    category: "veneno",
    type: "geral",
    description: "Ex: peçonha de serpente-do-pântano. Venda exige licença registrada na sede.",
    price: 20,
    guildRankRequired: "C",
  },
  {
    id: "veneno_avancado",
    name: "Veneno Potente (rank Avançado)",
    category: "veneno",
    type: "geral",
    description: "Ex: fel de wyvern. Venda sob vigilância da sede — vender sem licença é crime em Millis e no Reino Asura (perde Reputação com a facção local).",
    price: 80,
    guildRankRequired: "A",
  },
  {
    id: "veneno_kit_coleta",
    name: "Kit de Coleta de Veneno",
    category: "veneno",
    type: "geral",
    description: "Frascos, pinça e luvas grossas — permite extrair a glândula ou a baba de uma criatura recém-abatida antes que o veneno perca a potência.",
    price: 15,
    guildRankRequired: "F",
  },
  {
    id: "veneno_kit_aplicacao",
    name: "Kit de Aplicação Segura",
    category: "veneno",
    type: "geral",
    description: "Aplicador de cabo longo e antídoto de emergência incluso — reduz (não elimina) o risco de se envenenar aplicando a própria dose.",
    price: 40,
    guildRankRequired: "D",
  },
  {
    id: "veneno_frasco_estavel",
    name: "Frasco de Armazenamento Estável",
    category: "veneno",
    type: "geral",
    description: "Vidro escuro selado a vácuo — uma dose guardada aqui não perde potência com o tempo, ao contrário de um frasco comum.",
    price: 100,
    guildRankRequired: "B",
  },
  {
    id: "veneno_antidoto_universal",
    name: "Antídoto Universal",
    category: "veneno",
    type: "geral",
    description: "Remove um veneno ou uma doença de rank Santo ou inferior (Cap. 4, §8) — a dose mais forte à venda. Nunca toca maldição nem transformação: essas continuam exigindo alguém que conjure Desintoxicação.",
    price: 800,
    guildRankRequired: "S",
  },
];

/**
 * Novo pra este catálogo: ferramentas mágicas (魔道具, "magic tools") no
 * sentido do próprio mundo de Mushoku Tensei — objetos com um círculo mágico
 * gravado que qualquer um com mana ativa, sem ser mago. Efeito narrativo/de
 * utilidade, não combate: o Cap. 4 já cobre magia de combate à parte.
 */
const MAGIC_TOOLS: ShopItem[] = [
  {
    id: "ferramenta_pedra_aquecimento",
    name: "Pedra de Aquecimento",
    category: "ferramenta-magica",
    type: "geral",
    description: "Esquenta ao segurar com um fio de mana. Comum em acampamento de inverno.",
    price: 25,
    guildRankRequired: "F",
  },
  {
    id: "ferramenta_caixa_resfriadora",
    name: "Caixa Resfriadora",
    category: "ferramenta-magica",
    type: "geral",
    description: "Mantém comida e bebida fria por dias sem gelo — item de conforto, não de combate.",
    price: 60,
    guildRankRequired: "E",
  },
  {
    id: "ferramenta_pedra_deteccao",
    name: "Pedra de Detecção de Mana",
    category: "ferramenta-magica",
    type: "geral",
    description: "Brilha perto de fontes de mana ativa num raio curto — acha magos escondidos ou armadilhas encantadas, mas não distingue amigo de inimigo.",
    price: 150,
    guildRankRequired: "D",
  },
  {
    id: "ferramenta_pedra_comunicacao",
    name: "Pedra de Comunicação (par)",
    category: "ferramenta-magica",
    type: "geral",
    description: "Duas pedras gravadas juntas: o que se escreve na principal aparece na secundária, não importa a distância. Só texto — não substitui magia.",
    price: 220,
    guildRankRequired: "D",
  },
  {
    id: "ferramenta_lancador_pergaminhos",
    name: "Lançador de Pergaminhos",
    category: "ferramenta-magica",
    type: "geral",
    description: "Suporte dorsal com dez encaixes pra pergaminhos de magia pré-preparados — um toque de mana ativa o encaixe certo sem precisar sacar nada com as mãos. Cada pergaminho é preparado à parte (gancho de campanha, não item de prateleira).",
    price: 400,
    guildRankRequired: "B",
  },
  {
    id: "ferramenta_capa_termorreguladora",
    name: "Capa Termorreguladora",
    category: "ferramenta-magica",
    type: "geral",
    description: "Mantém sua temperatura corporal estável em qualquer clima comum — não protege contra frio ou calor de origem mágica.",
    price: 45,
    guildRankRequired: "E",
  },
  {
    id: "ferramenta_luvas_amortecedoras",
    name: "Luvas Amortecedoras",
    category: "ferramenta-magica",
    type: "geral",
    description: "Absorvem metade do impacto que a própria mão receberia ao golpear algo sólido — poupa os nós dos dedos de quem luta desarmado.",
    price: 70,
    guildRankRequired: "D",
  },
  {
    id: "ferramenta_oculos_deteccao",
    name: "Óculos de Detecção",
    category: "ferramenta-magica",
    type: "geral",
    description: "Realçam o contorno de quem se esconde ou se disfarça, num raio curto — não atravessa Invisibilidade mágica de verdade.",
    price: 160,
    guildRankRequired: "D",
  },
  {
    id: "ferramenta_botas_velozes",
    name: "Botas Velozes",
    category: "ferramenta-magica",
    type: "geral",
    description: "Uma vez por Descanso Longo, sem gastar Ação, seu Deslocamento dobra por 1 minuto. Não empilha com outros efeitos de deslocamento.",
    price: 180,
    guildRankRequired: "C",
  },
  {
    id: "ferramenta_cajado_aprendiz",
    name: "Cajado de Aprendiz",
    category: "ferramenta-magica",
    type: "geral",
    description: "Ajuda a canalizar mana com mais estilo que as próprias mãos — efeito puramente estético, sem bônus mecânico.",
    price: 12,
    guildRankRequired: "F",
  },
  {
    id: "ferramenta_brinco_ilusao",
    name: "Brinco de Ilusão Breve",
    category: "ferramenta-magica",
    type: "geral",
    description: "Uma vez por Descanso Longo, cravado na pele com 1 Ação, cria uma distração visual ou muda levemente sua aparência (rosto, cabelo, roupa — nunca altura nem porte) até o fim da cena.",
    price: 350,
    guildRankRequired: "B",
  },
  {
    id: "ferramenta_anel_perturbador",
    name: "Anel Perturbador de Magia",
    category: "ferramenta-magica",
    type: "geral",
    description: "Uma vez por Descanso Longo, com 1 Reação, quando uma criatura a até 9 m termina de conjurar uma magia de rank Santo ou inferior: a magia falha e todo o PM investido nela é gasto. Raríssimo — como o Anel de Teleporte (Cap. 5 §4), cabe ao Mestre decidir se um artefato desse nível existe na sua campanha.",
    price: 900,
    guildRankRequired: "S",
  },
  {
    id: "ferramenta_anel_barreira",
    name: "Anel de Barreira Improvisada",
    category: "ferramenta-magica",
    type: "geral",
    description: "Uma vez por Descanso Longo, com 1 Reação, quando um ataque de dano físico (cortante, perfurante ou contundente) acertaria você: ergue uma barreira invisível e o ataque é anulado. Mesmo aviso do item acima: raro, e o Mestre decide se existe na mesa.",
    price: 900,
    guildRankRequired: "S",
  },
  {
    id: "ferramenta_bussola_encantada",
    name: "Bússola Encantada",
    category: "ferramenta-magica",
    type: "geral",
    description: "O ponteiro sempre aponta pra um lugar gravado nela (a sede da Guilda mais próxima, por padrão) em vez do norte — reduz Desvantagem por estar perdido, mas não substitui um mapa.",
    price: 90,
    guildRankRequired: "E",
  },
  {
    id: "ferramenta_amuleto_respiracao",
    name: "Amuleto de Respiração Aquática",
    category: "ferramenta-magica",
    type: "geral",
    description: "Uma vez por Descanso Longo, ativado com 1 Ação: você respira embaixo d'água normalmente por 10 minutos. Não ajuda contra pressão de profundidade nem frio.",
    price: 140,
    guildRankRequired: "D",
  },
  {
    id: "ferramenta_amuleto_resistencia_fogo",
    name: "Amuleto de Resistência ao Fogo",
    category: "ferramenta-magica",
    type: "geral",
    description: "Enquanto usado, reduz o desconforto de calor extremo (deserto, vulcão, fornalha) a um incômodo administrável. Não é a Resistência a dano de fogo em combate (Cap. 4) — isso continua exigindo magia ou talento de verdade.",
    price: 500,
    guildRankRequired: "A",
  },
  {
    id: "ferramenta_sino_alarme",
    name: "Sino de Alarme Mágico",
    category: "ferramenta-magica",
    type: "geral",
    description: "Fincado no chão, toca sozinho (só audível a quem o ativou) se alguém cruzar um perímetro curto ao redor — clássico de acampamento em território hostil.",
    price: 55,
    guildRankRequired: "E",
  },
];

/**
 * Cap. 5, §4 ("Encantamento de Arma e Armadura"): mesmos 4 níveis, mesmo Rank
 * exigido no encantador e mesmo preço já documentados no livro — reempacotados
 * como item comprável. O que você recebe ao comprar é o SERVIÇO já pago e
 * encomendado, não um objeto novo: depois de comprar, edite a arma/armadura
 * que vai levar o efeito (ícone de lápis no Inventário) pra refletir o bônus
 * descrito. Um item carrega no máximo um encantamento de CADA nível, e todos
 * somam — antes era "um por item", e o Imperador de 1.500 PO apagava o Santo
 * de 300 em troca de um degrau só. Só existem estes 4 níveis de propósito — o
 * livro é explícito que Encantamento exige um encantador vivo daquele Rank de
 * árvore, e a Guilda intermedeia a partir de Rank D (ver "A Loja da Guilda"); não inventamos
 * nível pra Rank F/E/C porque o livro não define um.
 */
const ENCHANTMENTS: ShopItem[] = [
  {
    id: "encantamento_avancado",
    name: "Encantamento Avançado",
    category: "encantamento",
    type: "geral",
    description: "Serviço encomendado: +1 degrau na Escada de Dados (arma, Cap. 3) OU +1 na CA (armadura — o +1 entra no valor da própria armadura: +3 vira +4), num item que você já possui. Encantador precisa de Rank Avançado na árvore compatível. Um item carrega no máximo um encantamento de cada nível, e todos somam. Depois de comprar, edite o item alvo pra refletir o bônus.",
    price: 150,
    guildRankRequired: "D",
  },
  {
    id: "encantamento_santo",
    name: "Encantamento Santo",
    category: "encantamento",
    type: "geral",
    description: "Serviço encomendado: dano elemental extra (+1d6, tipo à escolha) num item que você já possui. Encantador precisa de Rank Santo na árvore compatível. Depois de comprar, edite o item alvo pra refletir o bônus.",
    price: 300,
    guildRankRequired: "B",
  },
  {
    id: "encantamento_rei",
    name: "Encantamento Rei",
    category: "encantamento",
    type: "geral",
    description: "Serviço encomendado: ignora Resistência a um tipo de dano num item que você já possui. Encantador precisa de Rank Rei na árvore compatível. Depois de comprar, edite o item alvo pra refletir o bônus.",
    price: 600,
    guildRankRequired: "A",
  },
  {
    id: "encantamento_imperador",
    name: "Encantamento Imperador",
    category: "encantamento",
    type: "geral",
    description: "Serviço encomendado: +1 degrau na Escada de Dados (arma, Cap. 3), somado ao do Avançado, num item que você já possui; se o item tem o encantamento Santo, o dano elemental dele passa a 2d6. Encantador precisa de Rank Imperador na árvore compatível. Depois de comprar, edite o item alvo pra refletir o bônus.",
    price: 1500,
    guildRankRequired: "S",
  },
];

/**
 * Itens da wiki de Mushoku Tensei que ficaram de fora de propósito — não são
 * "item de prateleira", são artefato único ligado a um personagem ou evento
 * específico da obra: a Lança do Diabo (dada por Laplace só à raça Superd,
 * corrói a mente de quem a usa), as Armaduras Mágicas Mk 0/I/II/III e o Braço
 * de Zariff (criações pessoais do Rudeus canônico), o Metralhador de Pedra e
 * o Canhão de Bala (idem), os Itens Anti-Maldição (curam maldições de NPCs
 * nomeados específicos) e a Torre Mágica (infraestrutura de cidade, não item
 * portátil). Mesmo tratamento que o Anel de Teleporte já recebe no livro:
 * gancho de campanha, nunca compra de ficha.
 */

/**
 * TODO item que o livro conhece — inclusive o que não está à venda.
 *
 * O Compêndio (2026-09-23) trouxe 65 itens que em boa parte não são de
 * prateleira: contrabando, drop de chefe e relíquia. Eles entram aqui, e não
 * num array paralelo, porque tudo que lê o catálogo quer o livro inteiro: a
 * busca do site, a tabela do Cap. 5 e o gerador de loot. Só a Loja pensa em
 * prateleira, e é ela que filtra, com `estaAVenda`.
 */
export const SHOP_ITEMS: ShopItem[] = [
  ...WEAPONS,
  ...SPECIAL_WEAPONS,
  ...ARMOR,
  ...ADVENTURE_GEAR,
  ...POTIONS,
  ...POISONS,
  ...MAGIC_TOOLS,
  ...ENCHANTMENTS,
  ...COMPENDIO_ITENS,
];
