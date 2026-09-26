import { AbilityDef, RankName, TalentDef, Tree } from "@/lib/types";
import { criarFormula, ESSENCIAS, FORMAS, OPERADORES, type EssenciaId, type FormaId, type FormulaEscolha, type MeioId, type OperadorId, type RankTeorico } from "@/lib/magiaTeorica";
import { MAGIC_ACTIONS, RANK_PA_COST } from "./shared";

// A escola recita a mesma sintaxe estrutural em todas as cartas: cada verso
// acrescenta uma cláusula de segurança ao patamar anterior. O nome fecha a saída.
const VERSO_BASE = "Fixo o núcleo, inscrevo a ação e fecho o contorno. Minha mana seguirá apenas estes traços, na ordem em que os desenhei. ";
const VERSO_INTERMEDIARIO = VERSO_BASE + "Origem e saída recebem suas próprias cargas. ";
const VERSO_AVANCADO = VERSO_INTERMEDIARIO + "Nomeio cada ligação e seu gatilho; nenhum ramo recebe força além da carga inscrita. ";
const VERSO_SANTO = VERSO_AVANCADO + "O suporte conserva a forma sem criar mana; a reserva fica empenhada após o descanso. ";
const VERSO_REI = VERSO_SANTO + "Leio a rede como uma frase, mas resolvo cada célula por si; romper uma ligação encerra apenas as saídas que dela dependem. ";
const VERSOS: Partial<Record<RankName, string>> = {
  Principiante: VERSO_BASE,
  Intermediário: VERSO_INTERMEDIARIO,
  Avançado: VERSO_AVANCADO,
  Santo: VERSO_SANTO,
  Rei: VERSO_REI,
  Imperador: VERSO_REI + "Gravo a potência e a origem de cada traço. Quem alimenta a obra não altera a frase; quem a rompe encontra a consequência escrita. ",
};

/** Uma célula de fórmula, pronta pro motor (src/lib/magiaTeorica.ts). */
function celula(
  rank: RankTeorico,
  potencia: RankTeorico,
  essencia: EssenciaId,
  operadores: OperadorId[],
  forma: FormaId,
  meio: MeioId = "ar",
  gatilho = false,
): FormulaEscolha {
  return { rank, potencia, essencia, operadores, forma, meio, gatilho, condicao: "entrada" };
}

const receita = (c: FormulaEscolha) =>
  [ESSENCIAS[c.essencia].nome, ...c.operadores.map((o) => OPERADORES[o].nome), FORMAS[c.forma].nome].join(" + ") +
  (c.potencia && c.potencia !== c.rank ? `, potência ${c.potencia}` : "") +
  (c.meio !== "ar" ? `, em ${c.meio === "pedra" ? "pedra" : c.meio}` : "") +
  (c.gatilho ? ", com gatilho" : "");

/**
 * A CARTA É A FÓRMULA DECORADA (2026-09-26, decisão do autor).
 *
 * A revisão de design achou 12 das 18 cartas perdendo para a fórmula grátis
 * (o Recinto custava 12 PM; a mesma fórmula, 7) e quatro contradizendo o
 * motor. Agora o PM, o alcance, o dano e o texto saem do MESMO motor que a
 * Oficina usa (`criarFormula`), célula por célula, somando 1 PM por ligação
 * entre células (Cap. 2 §8). O que a carta vende é o que a fórmula desenhada
 * não tem: ela conjura pela forma normal de magia, com cântico — portanto com
 * Recitação Perfeita, Encantamento Encurtado e Conjuração Silenciosa —, e,
 * quando escrito, uma EXCEÇÃO nomeada (durar mais, nascer como Reação).
 *
 * Uma célula inválida quebra o carregamento de propósito: é o jeito de a carta
 * nunca mais prometer o que a gramática não permite.
 */
function modelo(
  rank: RankName,
  id: string,
  name: string,
  celulas: FormulaEscolha[],
  excecao: string,
  options: Partial<AbilityDef> & { pmExtra?: number } = {},
): AbilityDef {
  const { pmExtra = 0, ...resto } = options;
  const resultados = celulas.map((c) => {
    const r = criarFormula(c);
    if (!r.valida) throw new Error(`Magia Teórica: a carta ${id} não é uma fórmula válida — ${r.erros.join(" ")}`);
    return r;
  });
  const principal = resultados[0];
  const pmCost = resultados.reduce((t, r) => t + r.pm, 0) + (celulas.length - 1) + pmExtra;
  const range =
    principal.alcance === "toque" ? "Toque" : principal.alcance === "no ponto do desenho" ? "Toque (no ponto do desenho)" : principal.alcance.replace(/ m$/, " metros");
  const texto = (r: (typeof resultados)[number]) =>
    [r.resumo, r.bloqueio ? `Barra ${r.bloqueio}.` : "", r.efeitoDaEssencia ?? "", r.duracao === "instantânea" ? "Instantânea." : `Dura ${r.duracao}.`].filter(Boolean).join(" ");
  const efeito =
    celulas.length === 1
      ? `Fórmula decorada: ${receita(celulas[0])}. ${texto(principal)}`
      : `Fórmula decorada, ${celulas.length} células ligadas (+${celulas.length - 1} PM de ligação): ` +
        resultados.map((r, i) => `(${i + 1}) ${receita(celulas[i])} — ${texto(r)}`).join(" ");
  return {
    id,
    name,
    pmCost,
    range,
    effect: `${efeito}${excecao ? ` ${excecao}` : ""}`,
    paCost: resto.signature ? RANK_PA_COST.signature[rank] : RANK_PA_COST.common[rank],
    actions: MAGIC_ACTIONS[rank],
    incantation: `${VERSOS[rank] ?? VERSO_BASE}${name}!`,
    ...(principal.dano ? { damage: { normal: `${principal.dano} (${principal.tipo})` } } : {}),
    ...resto,
  };
}

/** Carta que não é fórmula (análise, mapa): PM e texto escritos à mão. */
function carta(rank: RankName, id: string, name: string, pmCost: number, range: string, effect: string, options: Partial<AbilityDef> = {}): AbilityDef {
  return {
    id, name, pmCost, range, effect,
    paCost: options.signature ? RANK_PA_COST.signature[rank] : RANK_PA_COST.common[rank],
    actions: MAGIC_ACTIONS[rank],
    incantation: `${VERSOS[rank] ?? VERSO_BASE}${name}!`,
    ...options,
  };
}

function talento(rank: RankName, id: string, name: string, description: string): TalentDef {
  return { id, name, description, paCost: RANK_PA_COST.talent[rank] };
}

const P = "Principiante", I = "Intermediário", A = "Avançado", S = "Santo", R = "Rei", IMP = "Imperador";

export const TEORICA_TREE: Tree = {
  id: "teorica",
  name: "Magia Teórica",
  icon: "/arvores/teorica.svg",
  category: "magia",
  subgroup: "Cura e Suporte",
  mechanic: {
    tag: "Glifo composto",
    hook: "Desenhe uma frase de símbolos, sobreponha as ações ao núcleo e injete PM para executar o resultado.",
    loop: [
      "Escolha uma essência conhecida, inscreva operadores sobre seu glifo e feche a forma externa. A ordem dos traços muda a frase.",
      "Confira o rank de construção, a potência e a conta de PM nas tabelas do Cap. 2 §8. Um desenho novo com símbolos conhecidos não custa PA a cada uso.",
      "Prepare no meio escolhido, pague o PM e resolva. Outra criatura pode alimentar um circuito pronto sem entender seus símbolos.",
      "Use Conter para deter corpos e Rejeitar para deter magia. Defesa é um ramo da mesma gramática, sem outra árvore.",
    ],
    cost: "Cada componente e ligação acrescenta PM e preparo. O rank da Teórica limita a fórmula mesmo se a essência vier de uma escola superior. A fórmula não herda maestrias, condições nem magias prontas da escola de origem. Uma projeção ofensiva por turno.",
  },
  keyAttributeLabel: "Intelecto",
  resourceLabel: "PM",
  tagline: "Uma árvore de criação: fórmulas, selos, dispositivos e barreiras escritos com os mesmos símbolos.",
  proficiencies: {
    armas: "Não concede grupo de arma. Armadura leve apenas.",
    gruposDeArma: [],
    pericias: "O Bônus de Rank não se soma em perícias; isso pertence às árvores de Utilidade.",
    nota: "Escola Formal de Magia. Conjura com Intelecto. A composição livre usa as regras e as tabelas do Cap. 2 §8; as cartas são fórmulas decoradas dessa mesma gramática.",
  },
  grantedSkills: { fixed: ["Arcanismo"], choose: { count: 1, from: ["Ofícios", "Percepção", "Intuição", "Religião"] } },
  ranks: [
    {
      rank: "Principiante", hpDiceFormula: "1d6+1",
      mastery: { name: "Alfabeto Arcano", description: "[Glifo composto] Você aprende Mana, Projetar, Expressar, Conter, Círculo, Quadrado e Linha. Pode construir uma célula com 2 símbolos — o núcleo e uma ação — e até 6 PM, com potência Principiante. Desenhe no ar (2 Ações) ou por gestos (1 Ação, efeito instantâneo ou de 1 turno). A forma fecha o circuito e não conta como símbolo. Qualquer pessoa capaz de pagar o PM pode alimentar seu circuito pronto; você fixa o BC e a potência ao construí-lo. As tabelas e a conta estão no Cap. 2 §8." },
      talents: [
        talento("Principiante", "simbolo-rejeitar", "Símbolo: Rejeitar", "Aprende Rejeitar: fronteira que barra magia pela Régua do Selo da potência da célula (Cap. 2 §8). Conter já foi concedido pela Maestria; Rejeitar é a outra metade da defesa."),
        talento("Principiante", "simbolo-fogo", "Símbolo: Fogo", "Aprende a essência Fogo para fórmulas. Fogo Principiante também a concede de graça; não compra nem copia as magias ou a maestria de Fogo."),
        talento("Principiante", "simbolo-agua", "Símbolo: Água", "Aprende a essência Água para fórmulas. Água Principiante também a concede de graça; não copia magias ou maestrias."),
        talento("Principiante", "simbolo-vento", "Símbolo: Vento", "Aprende a essência Vento para fórmulas. Vento Principiante também a concede de graça; não copia magias ou maestrias."),
        talento("Principiante", "simbolo-terra", "Símbolo: Terra", "Aprende a essência Terra para fórmulas. Terra Principiante também a concede de graça; não copia magias ou maestrias."),
        talento("Principiante", "simbolo-som", "Símbolo: Som", "Aprende a essência Som para fórmulas. Bardo Principiante também a concede de graça; não copia canções ou maestrias."),
        talento("Principiante", "simbolo-vida", "Símbolo: Vida", "Aprende a essência Vida para fórmulas. Cura Principiante também a concede de graça; não copia curas ou maestrias."),
        talento("Principiante", "traco-firme", "Traço Firme", "Uma vez por cena, refaça um Teste de Concentração que tenha perdido enquanto desenhava uma fórmula (Cap. 2 §6). Não altera o PM nem a potência do circuito."),
      ],
      abilities: [
        modelo(P, "dardo-arcano", "Dardo Arcano", [celula(P, P, "mana", ["projetar"], "circulo")], "Não recebe condição de outra escola.", { signature: true }),
        modelo(P, "anteparo-teorico", "Anteparo", [celula(P, P, "mana", ["conter"], "quadrado")], "Não barra magia por si só."),
        modelo(P, "sinal-arcano", "Sinal Arcano", [celula(P, P, "mana", ["expressar"], "circulo")], ""),
        modelo(P, "parede-de-emergencia", "Parede de Emergência", [celula(P, P, "mana", ["conter"], "quadrado")], "", {
          pmExtra: 2,
          reaction: true,
          actions: { normal: 1 },
          range: "3 metros",
          effect: "1 Reação, quando você ou uma criatura visível a até 3 m for alvo de um ataque físico: o Anteparo nasce entre o atacante e o alvo com metade dos PV (15) e dura até o início do seu próximo turno. O ataque atinge a parede primeiro. Não bloqueia magia. É a exceção que a carta ensina: a fórmula desenhada nunca sai como Reação, e os 2 PM a mais pagam a pressa.",
          costNote: "1 Reação em vez das 2 Ações do rank: é a única forma de a Magia Teórica agir no turno do inimigo, e custa 2 PM acima da fórmula que ela decora.",
        }),
      ],
    },
    {
      rank: "Intermediário", hpDiceFormula: "1d6+2",
      mastery: { name: "Sintaxe e Cópia", description: "Até 4 símbolos e 10 PM por célula, potência até Intermediária. Aprende Expandir e Triângulo. Pode copiar fielmente um molde que possua dentro de seus limites, mesmo sem conhecer cada símbolo; alterar qualquer traço ainda exige conhecê-lo." },
      talents: [
        talento("Intermediário", "filtro-de-trama", "Filtro de Trama", "Aprende Filtrar: ao preparar uma fronteira de Rejeitar, marque até duas identidades (criaturas que você nomeia) que ela poupa. Não custa símbolo nem PM a mais."),
        talento("Intermediário", "simbolo-repetir", "Símbolo: Repetir", "Aprende Repetir: uma segunda saída enfraquecida no turno seguinte (Cap. 2 §8). Ela não se repete de novo e paga seu próprio custo."),
        talento("Intermediário", "circulo-portatil-teorico", "Círculo Portátil", "Pode preparar sobre o corpo um circuito sustentado que se move com você; o suporte ainda pode ser atingido ou rompido."),
      ],
      abilities: [
        modelo(I, "selo-de-rejeicao", "Selo de Rejeição", [celula(I, I, "mana", ["conter", "rejeitar"], "circulo")], "", { signature: true, requires: ["simbolo-rejeitar"] }),
        carta(I, "leitura-de-trama-teorica", "Leitura de Trama", 2, "18 metros", "Lê núcleo, operadores, forma, meio, potência e carga restante de um circuito visível. Uma ligação oculta ainda exige teste de Intelecto contra a CD do construtor (8 + o BC dele)."),
        modelo(I, "muralha-de-mana", "Muralha de Mana", [celula(I, I, "mana", ["projetar", "conter"], "linha")], "Bloqueia passagem física enquanto tiver PV; não anula magia."),
      ],
    },
    {
      rank: "Avançado", hpDiceFormula: "1d8+2",
      mastery: { name: "Circuito Composto", description: "Até 6 símbolos e 16 PM por célula, potência até Avançada. Aprende Estrela e Gatilho. Pode ligar duas células num circuito (Cap. 2 §8): cada célula paga seu PM e conserva seu rank, BC, custo e saída, e a ligação custa +1 PM. Desbloqueia Magia Combinada quando também cumprir a outra árvore exigida." },
      talents: [
        talento("Avançado", "mao-de-giz-teorica", "Mão de Giz", "Ao preparar em giz, você pode traçar duas células ligadas em superfícies adjacentes. O preparo leva pelo menos 1 minuto; romper o traço rompe a ligação."),
        talento("Avançado", "selo-cirurgico-teorico", "Selo Cirúrgico", "Uma fórmula de Rejeitar preparada por você pode marcar uma criatura adicional como exceção, além das identidades de Filtrar que você conhecer."),
        talento("Avançado", "trama-densa-teorica", "Trama Densa", "Toda fronteira de Conter sua ganha +20 PV. Não reforça a proteção mágica de Rejeitar."),
      ],
      abilities: [
        modelo(A, "barreira-incandescente-modelo", "Modelo Incandescente", [celula(A, A, "fogo", ["conter"], "circulo")], "Não é a Magia Combinada Barreira Incandescente (Cap. 2 §4) nem recebe os números dela.", { signature: true, requires: ["simbolo-fogo"] }),
        modelo(A, "recinto-teorico", "Recinto", [celula(A, A, "mana", ["conter", "expandir"], "circulo", "giz")], "A exceção da carta: em giz, dura 10 minutos em vez do tempo da fórmula."),
        modelo(A, "alarme-de-quebra", "Alarme de Quebra", [celula(A, I, "mana", ["conter"], "quadrado", "giz"), celula(A, P, "mana", ["expressar"], "circulo", "giz", true)], "O gatilho da segunda célula é a queda da primeira: quando a fronteira chega a 0 PV, o sinal soa até 18 m. Se a ligação for rompida antes, o alarme não soa."),
      ],
    },
    {
      rank: "Santo", hpDiceFormula: "1d8+2",
      mastery: { name: "Inscrição Durável", description: "Até 9 símbolos e 24 PM por célula, potência até Santo. Aprende Espiral e gravação em pedra. Pode preparar até 3 células ligadas. A reserva de PM guardada numa Espiral fica empenhada (Cap. 2 §8): descansar não duplica nem recarrega energia depositada." },
      talents: [
        talento("Santo", "ancora-de-trama", "Âncora de Trama", "Um circuito gravado em pedra continua ativo depois que você se afasta além do alcance de manutenção, até acabar sua duração, carga ou suporte. Não ganha novo PM sozinho."),
        talento("Santo", "olho-do-diagrama", "Olho do Diagrama", "Ao estudar um circuito por 1 minuto, identifica a condição de um gatilho oculto e qual célula ela ativa; não desarma o circuito."),
        talento("Santo", "reserva-metodica", "Reserva Metódica", "Uma Espiral sua armazena +2 PM por rank da potência, respeitando o teto de PM e o empenho de reserva."),
      ],
      abilities: [
        modelo(S, "fortaleza-inscrita", "Fortaleza Inscrita", [celula(S, S, "mana", ["conter", "expandir"], "quadrado", "pedra")], "A exceção da carta: gravada em pedra, dura 1 hora. Barrar magia exige outra célula, com Rejeitar.", { signature: true }),
        modelo(S, "lacrar-passagem", "Lacrar Passagem", [celula(S, S, "mana", ["conter"], "quadrado", "pedra")], "A exceção da carta: fecha uma abertura de até 6 m e, em pedra, dura 1 hora."),
        modelo(S, "eco-condicional", "Eco Condicional", [celula(S, P, "mana", ["expressar"], "circulo", "giz", true)], "Declare a condição ao preparar; o sinal dispara uma única vez. Armado, espera até o fim do prazo do material (10 minutos em giz)."),
      ],
    },
    {
      rank: "Rei", hpDiceFormula: "1d8+3",
      mastery: { name: "Rede de Selos", description: "Até 13 símbolos e 40 PM por célula, potência até Rei. Pode manter até 4 células ligadas, cada qual com carga e potência próprias. Um gatilho não cria saídas infinitas; cada disparo consome a carga escrita." },
      talents: [
        talento("Rei", "dupla-inscricao", "Dupla Inscrição", "Ao preparar em pedra, divida um circuito em duas superfícies ligadas a qualquer distância dentro do alcance de manutenção. Se a ligação for rompida, a parte isolada deixa de receber PM."),
        talento("Rei", "memoria-de-runa", "Memória de Runa", "Registra um molde de até 4 células para reproduzi-lo depois sem tê-lo à vista. Cada nova construção paga preparo, material e PM de novo."),
        talento("Rei", "fronteira-seletiva", "Fronteira Seletiva", "Uma estrutura sua de Conter pode abrir uma passagem física para uma identidade declarada. Não altera Rejeitar nem concede Filtrar."),
      ],
      abilities: [
        modelo(R, "rede-de-rejeicao", "Rede de Rejeição", [celula(R, R, "mana", ["rejeitar", "expandir"], "circulo", "pedra"), celula(R, R, "mana", ["rejeitar", "expandir"], "circulo", "pedra")], "A exceção da carta: em pedra, dura 10 minutos. Cada travessia compara a magia com a maior potência aplicável uma vez só; selos sobrepostos não reduzem o mesmo efeito duas vezes.", { signature: true, requires: ["simbolo-rejeitar"] }),
        modelo(R, "labirinto-inscrito", "Labirinto Inscrito", [1, 2, 3, 4].map(() => celula(R, S, "mana", ["conter"], "quadrado", "pedra")), "Quatro paredes, cada uma uma célula: derrubar uma não repara nem derruba as outras. A exceção da carta: em pedra, dura 1 hora."),
        modelo(R, "vigia-de-espiral", "Vigia de Espiral", [celula(R, P, "mana", ["expressar"], "espiral", "pedra", true)], "A Espiral guarda a carga do sinal; ele dispara quando uma criatura entra na área. A exceção da carta: armado em pedra, vigia por 1 dia."),
      ],
    },
    {
      rank: "Imperador", hpDiceFormula: "1d8+3",
      mastery: { name: "Arquitetura Arcana", description: "Até 18 símbolos e 60 PM por célula, potência até Imperador. Pode articular até 6 células; cada trecho mantém seu custo, duração, suporte e teto. Pode ensinar um molde a outro teórico, mas quem copia ainda obedece ao próprio rank e aos pré-requisitos." },
      talents: [
        talento("Imperador", "arquivista-do-invisivel", "Arquivista do Invisível", "Ao ler uma fórmula completa, registre um mapa de suas células, ligações e condições. O registro não concede símbolos desconhecidos para alterações."),
        talento("Imperador", "sutura-do-circuito", "Sutura do Circuito", "Repare uma ligação rompida com 1 minuto e 1 PM; não renova a duração, os PV, as cargas ou os disparos já gastos."),
        talento("Imperador", "mestre-das-excecoes", "Mestre das Exceções", "Uma fórmula de Filtrar sua pode declarar até três identidades adicionais, registradas na preparação; trocar a lista exige reconstruir."),
      ],
      abilities: [
        modelo(IMP, "cidade-de-glifos", "Cidade de Glifos", [celula(IMP, IMP, "mana", ["conter"], "quadrado", "pedra"), celula(IMP, IMP, "mana", ["rejeitar", "expandir"], "circulo", "pedra"), celula(IMP, P, "mana", ["expressar"], "circulo", "pedra", true)], "Ritual de pedra. A exceção da carta: dura 1 dia.", { signature: true, requires: ["simbolo-rejeitar"] }),
        modelo(IMP, "fronteira-soberana", "Fronteira Soberana", [celula(IMP, IMP, "mana", ["conter"], "quadrado"), celula(IMP, IMP, "mana", ["rejeitar"], "circulo")], "A exceção da carta: dura 10 minutos. Quebrar a célula de Conter não transforma Rejeitar em parede física.", { requires: ["simbolo-rejeitar"] }),
        carta(IMP, "atlas-vivo", "Atlas Vivo", 10, "150 metros", "Mostra ao grupo um mapa sensorial das células, cargas e suportes ativos numa área, durante 1 minuto. Não revela fórmulas além da área nem concede seus símbolos."),
      ],
    },
  ],
};
