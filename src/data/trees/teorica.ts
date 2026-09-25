import { AbilityDef, RankName, TalentDef, Tree } from "@/lib/types";
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

/** Modelos prontos são atalhos compráveis; a gramática livre mora em magiaTeorica.ts. */
function modelo(
  rank: RankName,
  id: string,
  name: string,
  pmCost: number,
  range: string,
  effect: string,
  options: Partial<AbilityDef> = {},
): AbilityDef {
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
      "Confira o rank de construção, a potência e a conta de PM. Um desenho novo com símbolos conhecidos não custa PA a cada uso.",
      "Prepare no meio escolhido, pague o PM e resolva. Outra criatura pode alimentar um circuito pronto sem entender seus símbolos.",
      "Use Conter para deter corpos e Rejeitar para deter magia. Defesa é um ramo da mesma gramática, sem outra árvore.",
    ],
    cost: "Cada componente e ligação acrescenta PM e preparo. O rank da Teórica limita a fórmula mesmo se a essência vier de uma escola superior. A fórmula não herda maestrias, condições nem magias prontas da escola de origem.",
  },
  keyAttributeLabel: "Intelecto",
  resourceLabel: "PM",
  tagline: "Uma árvore de criação: fórmulas, selos, dispositivos e barreiras escritos com os mesmos símbolos.",
  proficiencies: {
    armas: "Não concede grupo de arma. Armadura leve apenas.",
    gruposDeArma: [],
    pericias: "O Bônus de Rank não se soma em perícias; isso pertence às árvores de Utilidade.",
    nota: "Escola Formal de Magia. Conjura com Intelecto. A composição livre usa as regras e os limites da Oficina de Fórmulas, no Cap. 2 §8.",
  },
  grantedSkills: { fixed: ["Arcanismo"], choose: { count: 1, from: ["Ofícios", "Percepção", "Intuição", "Religião"] } },
  ranks: [
    {
      rank: "Principiante", hpDiceFormula: "1d6+1",
      mastery: { name: "Alfabeto Arcano", description: "[Glifo composto] Você aprende Mana, Projetar, Expressar, Conter, Círculo, Quadrado e Linha. Pode construir uma célula com até 2 símbolos centrais e até 6 PM, com potência Principiante. Desenhe no ar (2 Ações) ou por gestos (1 Ação, efeito instantâneo ou de 1 turno). A forma fecha o circuito e não conta como símbolo central. Qualquer pessoa capaz de pagar o PM pode alimentar seu circuito pronto; você fixa o BC e a potência ao construí-lo. A Oficina do Cap. 2 §8 traz a conta e os glifos." },
      talents: [
        talento("Principiante", "simbolo-rejeitar", "Símbolo: Rejeitar", "Aprende Rejeitar: fronteira que barra magia pela potência da célula. Conter já foi concedido pela Maestria; Rejeitar é a outra metade da defesa."),
        talento("Principiante", "simbolo-fogo", "Símbolo: Fogo", "Aprende a essência Fogo para fórmulas. Fogo Principiante também a concede de graça; não compra nem copia as magias ou a maestria de Fogo."),
        talento("Principiante", "simbolo-agua", "Símbolo: Água", "Aprende a essência Água para fórmulas. Água Principiante também a concede de graça; não copia magias ou maestrias."),
        talento("Principiante", "simbolo-vento", "Símbolo: Vento", "Aprende a essência Vento para fórmulas. Vento Principiante também a concede de graça; não copia magias ou maestrias."),
        talento("Principiante", "simbolo-terra", "Símbolo: Terra", "Aprende a essência Terra para fórmulas. Terra Principiante também a concede de graça; não copia magias ou maestrias."),
        talento("Principiante", "simbolo-som", "Símbolo: Som", "Aprende a essência Som para fórmulas. Bardo Principiante também a concede de graça; não copia canções ou maestrias."),
        talento("Principiante", "simbolo-vida", "Símbolo: Vida", "Aprende a essência Vida para fórmulas. Cura Principiante também a concede de graça; não copia curas ou maestrias."),
        talento("Principiante", "traco-firme", "Traço Firme", "Uma vez por cena, você pode refazer um teste de Intelecto para ler uma fórmula incompleta. Não altera o PM ou a potência do circuito."),
      ],
      abilities: [
        modelo("Principiante", "dardo-arcano", "Dardo Arcano", 3, "9 metros", "Modelo de Mana + Projetar + Círculo: ataque mágico, 1d6 arcano. Não recebe condição de outra escola.", { signature: true, damage: { normal: "1d6 arcano" } }),
        modelo("Principiante", "anteparo-teorico", "Anteparo", 4, "Até 9 metros", "Modelo de Mana + Conter + Quadrado: parede física de até 3 m, 30 PV, 1 minuto. Não barra magia por si só."),
        modelo("Principiante", "sinal-arcano", "Sinal Arcano", 3, "9 metros", "Modelo de Mana + Expressar + Círculo: um sinal visível ou audível por 1 turno, sem dano nem condição."),
      ],
    },
    {
      rank: "Intermediário", hpDiceFormula: "1d6+2",
      mastery: { name: "Sintaxe e Cópia", description: "Até 4 símbolos e 10 PM por célula, potência até Intermediária. Aprende Expandir e Triângulo. Pode copiar fielmente um molde que possua dentro de seus limites, mesmo sem conhecer cada símbolo; alterar qualquer traço ainda exige conhecê-lo. A cópia usa seus valores permanentes, mas não ignora pré-requisitos de magias encapsuladas." },
      talents: [
        talento("Intermediário", "filtro-de-trama", "Filtro de Trama", "Aprende Filtrar: marque até duas identidades que uma fronteira de Rejeitar poupa. Custo e espaço do componente entram na fórmula."),
        talento("Intermediário", "simbolo-repetir", "Símbolo: Repetir", "Aprende Repetir: uma segunda saída enfraquecida no turno seguinte. Ela não se repete de novo e paga seu próprio custo."),
        talento("Intermediário", "circulo-portatil-teorico", "Círculo Portátil", "Pode preparar sobre o corpo um circuito sustentado que se move com você; o suporte ainda pode ser atingido ou rompido."),
      ],
      abilities: [
        modelo("Intermediário", "selo-de-rejeicao", "Selo de Rejeição", 8, "9 metros", "Modelo de Mana + Conter + Rejeitar + Círculo: fronteira de 40 PV; magia que a cruza segue a Régua de Rejeição da potência Intermediária. Dura 1 minuto. Requer conhecer Rejeitar.", { signature: true, requires: ["simbolo-rejeitar"] }),
        modelo("Intermediário", "leitura-de-trama-teorica", "Leitura de Trama", 4, "18 metros", "Lê núcleo, operadores, forma, meio, potência e carga restante de um circuito visível. Uma ligação oculta ainda exige teste de Intelecto contra a CD do construtor."),
        modelo("Intermediário", "muralha-de-mana", "Muralha de Mana", 7, "18 metros", "Fronteira de Mana + Conter, até 6 m de comprimento e 3 m de altura, 40 PV por 1 minuto. Bloqueia passagem física enquanto conserva PV; não anula magia automaticamente."),
      ],
    },
    {
      rank: "Avançado", hpDiceFormula: "1d8+2",
      mastery: { name: "Circuito Composto", description: "Até 6 símbolos e 16 PM por célula, potência até Avançada. Aprende Estrela, Ramificar e Gatilho. Pode ligar duas células pagando as ligações e o PM de ambas. Cada célula conserva seu próprio rank, BC, custo e saída. Desbloqueia Magia Combinada quando também cumprir a outra árvore exigida." },
      talents: [
        talento("Avançado", "mao-de-giz-teorica", "Mão de Giz", "Ao preparar em giz, você pode traçar duas células ligadas em superfícies adjacentes. O preparo leva pelo menos 1 minuto; romper o traço rompe a ligação."),
        talento("Avançado", "selo-cirurgico-teorico", "Selo Cirúrgico", "Uma fórmula de Rejeitar preparada por você pode marcar uma criatura adicional como exceção, além das identidades de Filtrar que você conhecer."),
        talento("Avançado", "trama-densa-teorica", "Trama Densa", "Uma fronteira de Conter ganha +10 PV por potência Avançada ou maior. Não reforça a proteção mágica de Rejeitar."),
      ],
      abilities: [
        modelo("Avançado", "barreira-incandescente-modelo", "Modelo Incandescente", 12, "18 metros", "Modelo de duas células: Conter ergue uma parede; Fogo aplica contato ígneo uma vez por criatura por rodada. Exige símbolo Fogo e Conter; não concede a Magia Combinada Barreira Incandescente nem seus números próprios.", { signature: true, requires: ["simbolo-fogo"] }),
        modelo("Avançado", "recinto-teorico", "Recinto", 12, "Esfera de 12 m", "Circuito de Conter por 10 minutos: 60 PV, impede passagem física nos dois sentidos. Objetos e efeitos de magia seguem as regras normais de trajetória."),
        modelo("Avançado", "alarme-de-quebra", "Alarme de Quebra", 10, "Até 18 metros", "Duas células ligadas: a primeira mantém uma fronteira de 60 PV; ao chegar a 0 PV, a segunda emite um sinal sensorial perceptível até 18 m. O sinal só ocorre se sua ligação sobreviver."),
      ],
    },
    {
      rank: "Santo", hpDiceFormula: "1d8+2",
      mastery: { name: "Inscrição Durável", description: "Até 9 símbolos e 24 PM por célula, potência até Santo. Aprende Espiral e gravação em pedra. Pode preparar até 3 células ligadas. A reserva de PM é registrada e empenhada; descansar não duplica nem recarrega energia depositada." },
      talents: [
        talento("Santo", "ancora-de-trama", "Âncora de Trama", "Um circuito gravado em pedra continua ativo após você se afastar, até acabar sua duração, carga ou suporte. Não ganha novo PM sozinho."),
        talento("Santo", "olho-do-diagrama", "Olho do Diagrama", "Ao estudar um circuito por 1 minuto, identifica uma condição de gatilho oculta e qual célula ela ativa; não desarma o circuito."),
        talento("Santo", "reserva-metodica", "Reserva Metódica", "Uma Espiral sua armazena +2 PM por rank da potência, respeitando o teto de PM e as regras de empenho de reserva."),
      ],
      abilities: [
        modelo("Santo", "fortaleza-inscrita", "Fortaleza Inscrita", 18, "Esfera de 30 m", "Fronteira de Conter com 80 PV por 10 minutos. Rejeitar exige o símbolo e seu custo próprio; esta carta sozinha não barra magia.", { signature: true }),
        modelo("Santo", "lacrar-passagem", "Lacrar Passagem", 16, "45 metros", "Inscreve Conter numa abertura de até 6 m. A estrutura tem 80 PV e dura 1 hora em suporte de pedra; dissipação usa a potência Santo inscrita."),
        modelo("Santo", "eco-condicional", "Eco Condicional", 14, "30 metros", "Um gatilho de entrada dispara uma única saída sensorial de Expressar; declare a condição ao preparar. O gatilho não produz dano ou selo sem outra célula paga."),
      ],
    },
    {
      rank: "Rei", hpDiceFormula: "1d8+3",
      mastery: { name: "Rede de Selos", description: "Até 13 símbolos e 40 PM por célula, potência até Rei. Pode manter até 4 células ligadas, cada qual com carga e potência próprias. Um gatilho não cria saídas infinitas; cada disparo consome a carga escrita." },
      talents: [
        talento("Rei", "dupla-inscricao", "Dupla Inscrição", "Ao preparar em pedra, divida um circuito em duas superfícies ligadas. Se uma ligação for rompida, a parte isolada deixa de receber PM."),
        talento("Rei", "memoria-de-runa", "Memória de Runa", "Registra um molde de até 4 células para reproduzi-lo depois. Cada nova construção paga preparo, material e PM de novo."),
        talento("Rei", "fronteira-seletiva", "Fronteira Seletiva", "Uma estrutura sua pode abrir uma passagem física para uma identidade declarada. Não altera Rejeitar nem concede Filtrar."),
      ],
      abilities: [
        modelo("Rei", "rede-de-rejeicao", "Rede de Rejeição", 32, "Esfera de 150 m", "Dois selos de Rejeitar ligados por 10 minutos. Cada travessia compara a magia com a maior potência aplicável uma só vez; selos sobrepostos não reduzem o mesmo efeito duas vezes. Requer Rejeitar.", { signature: true, requires: ["simbolo-rejeitar"] }),
        modelo("Rei", "labirinto-inscrito", "Labirinto Inscrito", 28, "Esfera de 30 m", "Até 4 fronteiras de Conter com 100 PV cada, registradas como células separadas. Derrubar uma não repara as demais; passagem sempre pode ser aberta destruindo PV."),
        modelo("Rei", "vigia-de-espiral", "Vigia de Espiral", 24, "90 metros", "Circuito gravado que consome sua reserva ao detectar uma entrada e emitir um sinal. Não causa dano nem impede passagem sem células adicionais."),
      ],
    },
    {
      rank: "Imperador", hpDiceFormula: "1d8+3",
      mastery: { name: "Arquitetura Arcana", description: "Até 18 símbolos e 60 PM por célula, potência até Imperador. Pode articular até 6 células; cada trecho mantém seu custo, duração, suporte e teto. Pode ensinar um molde a outro teórico, mas quem copia ainda obedece ao próprio rank e aos pré-requisitos exclusivos." },
      talents: [
        talento("Imperador", "arquivista-do-invisivel", "Arquivista do Invisível", "Ao ler uma fórmula completa, registre um mapa de suas células, ligações e condições. O registro não concede símbolos desconhecidos para alterações."),
        talento("Imperador", "sutura-do-circuito", "Sutura do Circuito", "Repare uma ligação rompida com 1 minuto e o PM original dela; não renova a duração, os PV, as cargas ou os disparos já gastos."),
        talento("Imperador", "mestre-das-excecoes", "Mestre das Exceções", "Uma fórmula de Filtrar sua pode declarar até três identidades adicionais, registradas na preparação; trocar a lista exige reconstruir."),
      ],
      abilities: [
        modelo("Imperador", "cidade-de-glifos", "Cidade de Glifos", 48, "Esfera de 750 m", "Ritual de pedra: rede de até 6 células com saídas declaradas na preparação. Cada fronteira física tem até 120 PV e cada selo mágico usa sua própria potência. Dura 1 dia ou até esgotar a carga registrada.", { signature: true }),
        modelo("Imperador", "fronteira-soberana", "Fronteira Soberana", 42, "Esfera de 45 m", "Conter e Rejeitar em células distintas: fronteira física de 120 PV e selo mágico de potência Imperador por 10 minutos. Quebrar a célula de Conter não transforma Rejeitar em parede física."),
        modelo("Imperador", "atlas-vivo", "Atlas Vivo", 38, "150 metros", "Mostra ao grupo um mapa sensorial das células, cargas e suportes ativos numa área, durante 1 minuto. Não revela fórmulas além da área nem concede seus símbolos."),
      ],
    },
  ],
};
