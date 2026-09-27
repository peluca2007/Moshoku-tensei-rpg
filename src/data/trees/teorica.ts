import { AbilityDef, RankName, TalentDef, Tree } from "@/lib/types";
import { criarFormula, ESSENCIAS, FORMAS, VERBOS, type EssenciaId, type FormaId, type FormulaEscolha, type GatilhoId, type MeioId, type RankTeorico, type VerboId } from "@/lib/magiaTeorica";
import { MAGIC_ACTIONS, RANK_PA_COST } from "./shared";

// A escola recita a própria gramática: cada patamar acrescenta um verso à
// frase do patamar anterior, e o nome da magia fecha o cântico.
const VERSO_BASE = "Fixo a essência, digo o verbo e fecho a forma. Três palavras, e a mana não anda um passo fora delas. ";
const VERSO_INTERMEDIARIO = VERSO_BASE + "Peso a potência pelo que sei, nem um traço acima. ";
const VERSO_AVANCADO = VERSO_INTERMEDIARIO + "Um segundo verbo cruza o primeiro, e os dois respondem à mesma forma, na mesma conta. ";
const VERSO_SANTO = VERSO_AVANCADO + "Gravo na pedra o que o ar esquece; e o que eu armar espera sozinho a hora certa de acordar. ";
const VERSO_REI = VERSO_SANTO + "Uma fórmula arma a outra: quando a primeira cair, a segunda se levanta, e nenhuma pede licença ao inimigo. ";
const VERSOS: Partial<Record<RankName, string>> = {
  Principiante: VERSO_BASE,
  Intermediário: VERSO_INTERMEDIARIO,
  Avançado: VERSO_AVANCADO,
  Santo: VERSO_SANTO,
  Rei: VERSO_REI,
  Imperador: VERSO_REI + "Escrevo a cidade inteira como quem escreve uma frase longa, e quem quiser rompê-la terá de ler cada palavra. ",
};

/** Uma fórmula, pronta pro motor (src/lib/magiaTeorica.ts). */
function frase(
  rank: RankTeorico,
  essencia: EssenciaId,
  verbos: VerboId[],
  forma: FormaId,
  meio: MeioId = "ar",
  extra: { potencia?: RankTeorico; armada?: boolean; gatilho?: GatilhoId } = {},
): FormulaEscolha {
  return { rank, essencia, verbos, forma, meio, armada: false, gatilho: "entrada", ...extra };
}

const receita = (f: FormulaEscolha) =>
  [ESSENCIAS[f.essencia].nome, ...f.verbos.map((v) => VERBOS[v].nome), FORMAS[f.forma].nome].join(" + ") +
  (f.potencia && f.potencia !== f.rank ? `, potência ${f.potencia}` : "") +
  (f.armada ? ", armada" : "");

// A carta de giz ou de pedra NÃO pede o preparo do meio: ela conjura como magia
// comum, com cântico, e o que herda do meio é só a duração (e poder armar).
const semPreparo = (f: FormulaEscolha) =>
  f.meio === "ar"
    ? ""
    : `Sem preparo: a carta sai com o cântico, nas Ações do rank, e dura como a fórmula ${f.meio === "giz" ? "de giz" : "gravada em pedra"}.`;

/**
 * A CARTA É A FÓRMULA DECORADA.
 *
 * O PM, o alcance, o dano e o texto saem do MESMO motor que o Laboratório usa
 * (`criarFormula`). O que a carta vende é o que o desenho não tem: ela conjura
 * pela forma normal de magia, com cântico — Recitação Perfeita, Encantamento
 * Encurtado e Conjuração Silenciosa — e conta como qualquer magia, fora da regra
 * de "uma fórmula que fere por turno" (Cap. 2, §8). Algumas ensinam uma EXCEÇÃO
 * escrita na própria carta.
 *
 * Uma fórmula inválida quebra o carregamento de propósito: a carta nunca promete
 * o que a gramática não permite.
 */
function modelo(
  rank: RankName,
  id: string,
  name: string,
  f: FormulaEscolha,
  excecao: string,
  options: Partial<AbilityDef> & { pmExtra?: number } = {},
): AbilityDef {
  const { pmExtra = 0, ...resto } = options;
  const r = criarFormula(f);
  if (!r.valida) throw new Error(`Magia Teórica: a carta ${id} não é uma fórmula válida — ${r.erros.join(" ")}`);
  const range = r.alcance === "toque" ? "Toque" : r.alcance.replace(/ m$/, " metros");
  const partes = [
    `${receita(f)}.`,
    r.resumo,
    r.bloqueio ?? "",
    r.efeitoDaEssencia ?? "",
    semPreparo(f),
    r.duracao === "instantânea" ? "" : r.duracao === "dispara uma vez" ? "" : `Dura ${r.duracao}.`,
    excecao,
  ];
  return {
    id,
    name,
    pmCost: r.pm + pmExtra,
    range,
    effect: partes.filter(Boolean).join(" "),
    paCost: resto.signature ? RANK_PA_COST.signature[rank] : RANK_PA_COST.common[rank],
    actions: MAGIC_ACTIONS[rank],
    incantation: `${VERSOS[rank] ?? VERSO_BASE}${name}!`,
    ...(r.dano ? { damage: { normal: `${r.dano} (${r.tipo})` } } : {}),
    ...resto,
  };
}

/** Carta que não é fórmula (a leitura): PM e texto escritos à mão. */
function carta(rank: RankName, id: string, name: string, pmCost: number, range: string, effect: string): AbilityDef {
  return {
    id, name, pmCost, range, effect,
    paCost: RANK_PA_COST.common[rank],
    actions: MAGIC_ACTIONS[rank],
    incantation: `${VERSOS[rank] ?? VERSO_BASE}${name}!`,
  };
}

function talento(rank: RankName, id: string, name: string, description: string): TalentDef {
  return { id, name, description, paCost: RANK_PA_COST.talent[rank] };
}

/** Os seis talentos de essência: a palavra, e o que ela faz na mesa. */
function essencia(id: Exclude<EssenciaId, "mana">, escola: string, faz: string): TalentDef {
  return talento(
    "Principiante",
    `simbolo-${id}`,
    `Essência: ${ESSENCIAS[id].nome}`,
    `Suas fórmulas podem usar ${ESSENCIAS[id].nome} (+1 PM): ${faz} Quem abre ${escola} Principiante já ganha esta essência de graça — e, se tiver comprado este talento antes, o PA volta.`,
  );
}

const P = "Principiante", I = "Intermediário", A = "Avançado", S = "Santo", R = "Rei", IMP = "Imperador";

/*
 * Ids mantidos de propósito (fichas salvas): "simbolo-rejeitar" virou Fórmula
 * de Bolso, "simbolo-repetir" virou Assinatura, "reserva-metodica" virou Carga
 * Dupla, "sutura-do-circuito" virou Rearmar — mesmo patamar, mesmo PA. As quatro
 * cartas que saíram (Modelo Incandescente, Lacrar Passagem, Vigia de Espiral,
 * Atlas Vivo) migram pra carta de dano do mesmo patamar e do mesmo preço
 * (`useCharacterStore.ts`, v18).
 */
export const TEORICA_TREE: Tree = {
  id: "teorica",
  name: "Magia Teórica",
  icon: "/arvores/teorica.svg",
  category: "magia",
  subgroup: "Cura e Suporte",
  mechanic: {
    tag: "Três palavras",
    hook: "Escreva uma essência, um verbo e uma forma; pague a potência; a magia acontece.",
    loop: [
      "Escolha a essência (Mana, ou a de uma escola que você conhece), o verbo (Lançar, Erguer, Selar, Sinalizar) e a forma (Círculo, Linha, Quadrado…).",
      "PM = o custo da potência + 1 por palavra fora do básico. A potência é o seu rank na Teórica, ou menos. Uma conta só.",
      "Desenhe no ar (as Ações de uma magia do rank da potência) ou prepare em giz antes e ative com 1 Ação.",
      "Erguer segura corpo; Selar segura magia. A defesa é a mesma gramática do ataque.",
    ],
    cost: "Só uma fórmula desenhada fere por turno (as cartas são magia comum e ficam fora desse limite). A fórmula não herda Maestria nem condição da escola da essência.",
  },
  keyAttributeLabel: "Intelecto",
  resourceLabel: "PM",
  tagline: "A escola que escreve a própria magia: três palavras e uma conta, pra atacar, erguer paredes, selar magia ou armar armadilhas.",
  proficiencies: {
    armas: "Não concede grupo de arma. Armadura leve apenas.",
    gruposDeArma: [],
    pericias: "O Bônus de Rank não se soma em perícias; isso pertence às árvores de Utilidade.",
    nota: "Escola Formal de Magia. Conjura com Intelecto. As palavras e a conta estão no Cap. 2, §8; as cartas são fórmulas decoradas da mesma gramática.",
  },
  grantedSkills: { fixed: ["Arcanismo"], choose: { count: 1, from: ["Ofícios", "Percepção", "Intuição", "Religião"] } },
  ranks: [
    {
      rank: "Principiante", hpDiceFormula: "1d6+1",
      mastery: {
        name: "Alfabeto Arcano",
        description:
          "[Três palavras] Você conhece a essência Mana, os quatro verbos — Lançar, Erguer, Selar e Sinalizar — e as formas Círculo, Linha e Quadrado. Toda fórmula é uma essência + um verbo + uma forma, e custa o PM da potência + 1 por palavra fora do básico (Mana, o primeiro verbo e o Círculo são o básico). A potência é o seu rank na Teórica, ou menos. No ar, desenhar custa as Ações de uma magia do rank da potência; em giz ou pergaminho, você prepara em 1 minuto e ativa com 1 Ação — só Lançar sozinho (o que fere ou cura) não se prepara. Qualquer pessoa que pague o PM alimenta uma fórmula sua já pronta. Tabelas e exemplos no Cap. 2, §8.",
      },
      talents: [
        talento("Principiante", "simbolo-rejeitar", "Fórmula de Bolso", "Você carrega uma fórmula de Erguer, Selar ou Sinalizar preparada em pergaminho, dobrada no bolso. Ela não se apaga no Descanso Longo: dura até ser ativada (1 Ação). Refazer o pergaminho leva 1 minuto."),
        essencia("fogo", "Fogo", "Lançar causa dano ígneo, e a parede queima quem encosta."),
        essencia("agua", "Água", "Lançar causa dano contundente, e a parede deixa quem encosta Molhado."),
        essencia("vento", "Vento", "Lançar causa dano cortante, e a parede empurra quem encosta."),
        essencia("terra", "Terra", "Lançar causa dano contundente, e a parede tem +50% de PV."),
        essencia("som", "o Bardo", "Lançar causa dano sônico, e a parede soa quando alguém encosta."),
        essencia("vida", "Cura", "Lançar cura em vez de ferir, e a parede dá PV temporários a um aliado."),
        talento("Principiante", "traco-firme", "Traço Firme", "Uma vez por combate, refaça um Teste de Concentração que tenha perdido enquanto desenhava uma fórmula (Cap. 2, §6)."),
      ],
      abilities: [
        modelo(P, "dardo-arcano", "Dardo Arcano", frase(P, "mana", ["lancar"], "circulo"), "", { signature: true }),
        modelo(P, "anteparo-teorico", "Anteparo", frase(P, "mana", ["erguer"], "quadrado"), ""),
        modelo(P, "sinal-arcano", "Sinal Arcano", frase(P, "mana", ["sinalizar"], "circulo"), ""),
        modelo(P, "parede-de-emergencia", "Parede de Emergência", frase(P, "mana", ["erguer"], "quadrado"), "", {
          pmExtra: 2,
          reaction: true,
          actions: { normal: 1 },
          range: "3 metros",
          effect: "1 Reação, quando você ou uma criatura visível a até 3 m for alvo de um ataque físico: o Anteparo nasce entre o atacante e o alvo com metade dos PV (15) e dura até o começo do seu próximo turno. O ataque atinge a parede primeiro. Não barra magia. É a exceção que a carta ensina: a fórmula desenhada nunca sai como Reação, e os 2 PM a mais pagam a pressa.",
          costNote: "1 Reação em vez das 2 Ações do rank: é a única forma de a Magia Teórica agir no turno do inimigo, e custa 2 PM acima da fórmula que ela decora.",
        }),
      ],
    },
    {
      rank: "Intermediário", hpDiceFormula: "1d6+2",
      mastery: { name: "Sintaxe", description: "Aprende as formas Triângulo, Onda e Eco. Você pode copiar fielmente uma fórmula alheia que estiver vendo, dentro do seu rank, mesmo sem conhecer a essência dela; mudar qualquer palavra exige conhecê-la." },
      talents: [
        talento("Intermediário", "filtro-de-trama", "Filtro de Trama", "Ao desenhar um Selo, nomeie até duas criaturas: a magia delas atravessa o seu selo como se ele não existisse. Não custa PM a mais."),
        talento("Intermediário", "simbolo-repetir", "Assinatura", "Escolha uma fórmula que você já desenhou (essência, verbos e forma): ela é a sua assinatura e custa 1 PM a menos (mínimo 1). Trocar a assinatura leva um Descanso Longo."),
        talento("Intermediário", "circulo-portatil-teorico", "Círculo Portátil", "Você pode preparar em giz, sobre o próprio corpo, uma fórmula de Erguer ou Selar que anda com você. Quem destruir o desenho (a sua roupa, o seu braço) apaga a fórmula."),
      ],
      abilities: [
        modelo(I, "selo-de-rejeicao", "Selo de Rejeição", frase(I, "mana", ["selar"], "circulo"), "", { signature: true }),
        modelo(I, "muralha-de-mana", "Muralha de Mana", frase(I, "mana", ["erguer"], "linha"), "A exceção da carta: nasce a até 18 m de você, sem precisar de Lançar."),
        modelo(I, "rajada-arcana", "Rajada Arcana", frase(I, "mana", ["lancar"], "triangulo"), ""),
        carta(I, "leitura-de-trama-teorica", "Leitura de Trama", 2, "18 metros", "Lê a essência, os verbos, a forma, a potência e a duração que sobra de uma fórmula que você vê. Uma fórmula armada escondida ainda pede um teste de Intelecto contra 8 + o BC de quem a fez."),
      ],
    },
    {
      rank: "Avançado", hpDiceFormula: "1d8+2",
      mastery: { name: "Frase Composta", description: "Pode pôr dois verbos na mesma fórmula (+1 PM), em qualquer ordem: uma parede que também barra magia (Erguer + Selar), uma parede que avisa quando cai (Erguer + Sinalizar), um selo a distância (Lançar + Selar — Lançar que anda com outro verbo só leva o efeito longe, não fere). Aprende a forma Estrela. Desbloqueia Magia Combinada quando você também cumprir a outra árvore exigida." },
      talents: [
        talento("Avançado", "mao-de-giz-teorica", "Mão de Giz", "No mesmo minuto de preparo, você traça duas fórmulas em giz em vez de uma."),
        talento("Avançado", "selo-cirurgico-teorico", "Selo Cirúrgico", "Um Selo seu pode poupar uma criatura a mais, além das do Filtro de Trama."),
        talento("Avançado", "trama-densa-teorica", "Trama Densa", "Toda parede de Erguer sua ganha +20 PV. Não reforça o Selo."),
      ],
      abilities: [
        modelo(A, "lanca-arcana", "Lança Arcana", frase(A, "mana", ["lancar"], "triangulo"), "A exceção da carta: se o dano derrubar o alvo, o que sobrar segue em linha reta e atinge a próxima criatura atrás dele (novo ataque, com o dano que sobrou).", { signature: true }),
        modelo(A, "recinto-teorico", "Recinto", frase(A, "mana", ["erguer"], "onda", "giz"), "A exceção da carta: a parede se fecha em cúpula em volta de quem estiver dentro, sem aberturas."),
        modelo(A, "alarme-de-quebra", "Alarme de Quebra", frase(A, "mana", ["erguer", "sinalizar"], "quadrado", "giz"), ""),
      ],
    },
    {
      rank: "Santo", hpDiceFormula: "1d8+2",
      mastery: { name: "Inscrição Durável", description: "Você grava em pedra (1 hora de preparo; dura 1 dia) e ARMA fórmulas: preparada em giz ou pedra, a fórmula armada (+2 PM) dispara sozinha, uma vez, quando alguém entrar na área, alguém tocar o desenho ou outra fórmula sua cair. Lançar armado é a mina arcana. Uma fórmula armada por vez." },
      talents: [
        talento("Santo", "ancora-de-trama", "Âncora de Trama", "Uma fórmula sua gravada em pedra não ocupa a sua sustentação: ela segura sozinha até acabar a duração ou alguém romper o desenho."),
        talento("Santo", "olho-do-diagrama", "Olho do Diagrama", "Com 1 Ação, você lê uma fórmula armada que vê, sem teste, e a desarma: ela se apaga sem disparar. Contra uma fórmula de rank acima do seu, teste de Intelecto contra 8 + o BC de quem a fez."),
        talento("Santo", "reserva-metodica", "Carga Dupla", "Uma fórmula armada sua dispara duas vezes antes de se apagar. O segundo disparo precisa de uma nova ocorrência do gatilho."),
      ],
      abilities: [
        modelo(S, "fortaleza-inscrita", "Fortaleza Inscrita", frase(S, "mana", ["erguer", "selar"], "quadrado", "pedra"), "A exceção da carta: levanta quatro lados e um teto — uma casa-forte, com os mesmos PV em cada lado.", { signature: true }),
        modelo(S, "eco-condicional", "Sinal Armado", frase(S, "mana", ["sinalizar"], "circulo", "giz", { potencia: P, armada: true }), ""),
        modelo(S, "traco-perfurante", "Traço Perfurante", frase(S, "mana", ["lancar"], "triangulo"), ""),
      ],
    },
    {
      rank: "Rei", hpDiceFormula: "1d8+3",
      mastery: { name: "Rede de Selos", description: "Até duas fórmulas armadas ao mesmo tempo. Uma delas pode usar a queda da outra como gatilho: quando a primeira cair, a segunda acorda." },
      talents: [
        talento("Rei", "dupla-inscricao", "Dupla Inscrição", "Uma fórmula sua gravada em pedra pode ser dividida em duas superfícies a até 90 m uma da outra: ela age nos dois lugares, e romper uma metade apaga só aquela metade."),
        talento("Rei", "memoria-de-runa", "Memória de Runa", "Escolha quatro fórmulas: você as prepara em giz com 1 Ação, em vez de 1 minuto — no meio da luta."),
        talento("Rei", "fronteira-seletiva", "Fronteira Seletiva", "Uma parede de Erguer sua abre passagem pra até Bônus de Rank criaturas que você nomear ao desenhá-la. Não muda o Selo."),
      ],
      abilities: [
        modelo(R, "rede-de-rejeicao", "Rede de Rejeição", frase(R, "mana", ["selar"], "onda", "pedra"), "Selos sobrepostos não reduzem o mesmo efeito duas vezes: cada magia é comparada com o selo mais forte uma vez só.", { signature: true }),
        modelo(R, "labirinto-inscrito", "Labirinto Inscrito", frase(R, "mana", ["erguer"], "quadrado", "pedra", { potencia: S }), "A exceção da carta: levanta quatro paredes de uma vez, cada uma com os seus PV (a conta da fórmula, quatro vezes). Derrubar uma não derruba as outras.", { pmExtra: 21 }),
        modelo(R, "palavra-que-fere", "Palavra que Fere", frase(R, "mana", ["lancar"], "triangulo"), ""),
      ],
    },
    {
      rank: "Imperador", hpDiceFormula: "1d8+3",
      mastery: { name: "Arquitetura Arcana", description: "Até três fórmulas armadas ao mesmo tempo. Você pode ensinar um molde a outro teórico; quem copia ainda obedece ao próprio rank." },
      talents: [
        talento("Imperador", "arquivista-do-invisivel", "Arquivista do Invisível", "Ao ler uma fórmula, você a guarda de memória e pode desenhá-la depois, mesmo sem ter a essência dela — só aquela fórmula."),
        talento("Imperador", "sutura-do-circuito", "Rearmar", "Com 1 minuto e 1 PM, uma fórmula armada sua que já disparou volta a ficar armada, sem renovar a duração."),
        talento("Imperador", "mestre-das-excecoes", "Mestre das Exceções", "Um Selo seu pode poupar até três criaturas a mais, nomeadas ao desenhá-lo."),
      ],
      abilities: [
        modelo(IMP, "cidade-de-glifos", "Cidade de Glifos", frase(IMP, "mana", ["erguer", "selar"], "onda", "pedra"), "A exceção da carta é o tamanho: cobre uma vila inteira, até 750 m.", { signature: true }),
        modelo(IMP, "fronteira-soberana", "Fronteira Soberana", frase(IMP, "mana", ["erguer", "selar"], "quadrado"), "A exceção da carta: no ar, dura 10 minutos em vez de 1."),
        modelo(IMP, "frase-final", "Frase Final", frase(IMP, "mana", ["lancar"], "triangulo"), ""),
      ],
    },
  ],
};
