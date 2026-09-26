/*
 * RECALIBRAGEM 2026-09-26 (decisão do autor, a partir da revisão de design):
 * a gramática custava ~3× o PM de uma escola elemental pelo mesmo efeito — o
 * Dardo fazia 1d6 por 3 PM contra 1d8+BC por 1 PM da Bola de Fogo, e a
 * potência alta era opção morta. Agora: Mana 0 PM, as ações centrais 1 PM, a
 * potência sobe +0/+1/+2/+4/+6/+8, o dado é d8 e o BC entra no dano. A meta é
 * ~75% da escola especialista por PM; o que a Teórica tem de único é montar o
 * efeito que quiser. E uma projeção ofensiva por turno (§8).
 */
export const RANKS_TEORICOS = [
  "Principiante",
  "Intermediário",
  "Avançado",
  "Santo",
  "Rei",
  "Imperador",
] as const;

export type RankTeorico = (typeof RANKS_TEORICOS)[number];

export const ESSENCIAS = {
  mana: { nome: "Mana", custo: 0, origem: "Magia Teórica", tipo: "arcano", cor: "#78d5d0", glifo: "◇" },
  fogo: { nome: "Fogo", custo: 1, origem: "Fogo Principiante ou 1 PA", tipo: "ígneo", cor: "#f9a56c", glifo: "△" },
  agua: { nome: "Água", custo: 1, origem: "Água Principiante ou 1 PA", tipo: "contundente", cor: "#80bdea", glifo: "≋" },
  vento: { nome: "Vento", custo: 1, origem: "Vento Principiante ou 1 PA", tipo: "cortante", cor: "#a7d9c2", glifo: "⌁" },
  terra: { nome: "Terra", custo: 1, origem: "Terra Principiante ou 1 PA", tipo: "contundente", cor: "#d8b986", glifo: "▱" },
  som: { nome: "Som", custo: 1, origem: "Bardo Principiante ou 1 PA", tipo: "trovejante", cor: "#d3acf5", glifo: "♫" },
  vida: { nome: "Vida", custo: 1, origem: "Cura Principiante ou 1 PA", tipo: "cura", cor: "#c6df98", glifo: "✧" },
} as const;

export type EssenciaId = keyof typeof ESSENCIAS;

export const OPERADORES = {
  projetar: { nome: "Projetar", custo: 1, papel: "Envia o efeito a um alvo ou ponto.", glifo: "➶" },
  expressar: { nome: "Expressar", custo: 1, papel: "Emite um sinal sensorial sem dano ou condição.", glifo: ")))" },
  conter: { nome: "Conter", custo: 1, papel: "Forma uma fronteira física com PV.", glifo: "⊏⊐" },
  rejeitar: { nome: "Rejeitar", custo: 1, papel: "Barra magia que cruza a fronteira.", glifo: "⟩⟨" },
  expandir: { nome: "Expandir", custo: 2, papel: "Abre a saída em uma área maior.", glifo: "✣" },
  repetir: { nome: "Repetir", custo: 2, papel: "Produz uma segunda saída enfraquecida.", glifo: "↻" },
} as const;

export type OperadorId = keyof typeof OPERADORES;

export const FORMAS = {
  circulo: { nome: "Círculo", custo: 0, efeito: "Forma neutra; duração × 1,5 se sustentada.", glifo: "◯" },
  triangulo: { nome: "Triângulo", custo: 2, efeito: "+1 dado; área cai um passo.", glifo: "△" },
  quadrado: { nome: "Quadrado", custo: 1, efeito: "+50% PV da estrutura.", glifo: "□" },
  linha: { nome: "Linha", custo: 1, efeito: "+50% alcance; largura de 1,5 m.", glifo: "⟷" },
  espiral: { nome: "Espiral", custo: 2, efeito: "Reserva 2 PM por rank.", glifo: "◉" },
  estrela: { nome: "Estrela", custo: 2, efeito: "Divide a saída entre até 3 alvos.", glifo: "✦" },
} as const;

export type FormaId = keyof typeof FORMAS;

export const GATILHOS = {
  entrada: "uma criatura entrar na área",
  toque: "alguém tocar o desenho",
  quebra: "a barreira chegar a 0 PV",
} as const;

export type GatilhoId = keyof typeof GATILHOS;

export const MEIOS = {
  gesto: { nome: "Gestos", preparo: "1 Ação", maxSimbolos: 2, duracaoMaxima: "instantânea ou 1 turno" },
  ar: { nome: "Mana no ar", preparo: "2 Ações", maxSimbolos: 4, duracaoMaxima: "3 minutos" },
  giz: { nome: "Giz", preparo: "1 minuto", maxSimbolos: 18, duracaoMaxima: "10 minutos" },
  pergaminho: { nome: "Pergaminho", preparo: "10 minutos antes", maxSimbolos: 18, duracaoMaxima: "uso único" },
  pedra: { nome: "Pedra gravada", preparo: "1 hora", maxSimbolos: 18, duracaoMaxima: "1 dia" },
} as const;

export type MeioId = keyof typeof MEIOS;

const PERFIL = {
  Principiante: { simbolos: 2, pm: 6, area: 3, alcance: 9, dados: 1, pv: 20, potencia: 0 },
  Intermediário: { simbolos: 4, pm: 10, area: 6, alcance: 18, dados: 2, pv: 40, potencia: 1 },
  Avançado: { simbolos: 6, pm: 16, area: 12, alcance: 27, dados: 3, pv: 60, potencia: 2 },
  Santo: { simbolos: 9, pm: 24, area: 30, alcance: 45, dados: 4, pv: 80, potencia: 4 },
  Rei: { simbolos: 13, pm: 40, area: 150, alcance: 90, dados: 5, pv: 100, potencia: 6 },
  Imperador: { simbolos: 18, pm: 60, area: 750, alcance: 150, dados: 6, pv: 120, potencia: 8 },
} as const;

export const LIMITES_TEORICOS = PERFIL;

export interface FormulaEscolha {
  rank: RankTeorico;
  potencia?: RankTeorico;
  essencia: EssenciaId;
  operadores: OperadorId[];
  forma: FormaId;
  meio: MeioId;
  gatilho: boolean;
  condicao: GatilhoId;
}

export interface FormulaResultado {
  nome: string;
  valida: boolean;
  erros: string[];
  pm: number;
  limitePm: number;
  simbolos: number;
  limiteSimbolos: number;
  potencia: RankTeorico;
  preparo: string;
  ativacao: string;
  resolucao: string | null;
  duracao: string;
  alcance: string;
  area: string;
  dano: string | null;
  tipo: string | null;
  pv: number | null;
  bloqueio: string | null;
  efeitoDaEssencia: string | null;
  reservaPm: number | null;
  resumo: string;
  leitura: string;
  conta: string[];
}

const acoesCentrais = new Set<OperadorId>(["projetar", "expressar", "conter", "rejeitar"]);

const AREAS_DIRETAS = [3, 3, 6, 9, 12, 18] as const;
const DURACOES_MATERIAL: Record<MeioId, number> = {
  gesto: 1, ar: 30, giz: 100, pergaminho: 100, pedra: 14400,
};
const medir = (valor: number) => Math.max(1.5, Math.floor(valor / 1.5) * 1.5);

export function criarFormula(escolha: FormulaEscolha): FormulaResultado {
  const essencia = ESSENCIAS[escolha.essencia];
  const forma = FORMAS[escolha.forma];
  const meio = MEIOS[escolha.meio];
  const perfil = PERFIL[escolha.rank];
  const potencia = escolha.potencia ?? escolha.rank;
  const perfilPotencia = PERFIL[potencia];
  const indiceRank = RANKS_TEORICOS.indexOf(escolha.rank);
  const indicePotencia = RANKS_TEORICOS.indexOf(potencia);
  const operadores = escolha.operadores;
  const centrais = operadores.filter((id) => acoesCentrais.has(id));
  const temProjetar = operadores.includes("projetar");
  const temExpressar = operadores.includes("expressar");
  const temConter = operadores.includes("conter");
  const temRejeitar = operadores.includes("rejeitar");
  const temExpandir = operadores.includes("expandir");
  const temRepetir = operadores.includes("repetir");
  const estrutura = temConter || temRejeitar;
  const expandirAntesDeProjetar = temExpandir && temProjetar && !estrutura
    && operadores.indexOf("expandir") < operadores.indexOf("projetar");
  const simbolos = 1 + operadores.length + Number(escolha.gatilho);
  const conexoesExtras = Math.max(0, simbolos - 2);
  const custoOperadores = operadores.reduce((total, id) => total + OPERADORES[id].custo, 0);
  const custoGatilho = escolha.gatilho ? 2 : 0;
  const pm = essencia.custo + custoOperadores + forma.custo + conexoesExtras + perfilPotencia.potencia + custoGatilho;
  const conta = [
    `${essencia.nome} ${essencia.custo}`,
    ...operadores.map((id) => `${OPERADORES[id].nome} ${OPERADORES[id].custo}`),
    `${forma.nome} ${forma.custo}`,
    ...(conexoesExtras ? [`Sobreposições extras ${conexoesExtras}`] : []),
    ...(perfilPotencia.potencia ? [`Potência ${potencia} ${perfilPotencia.potencia}`] : []),
    ...(escolha.gatilho ? ["Gatilho 2"] : []),
  ];

  const erros: string[] = [];
  if (!centrais.length) erros.push("Adicione Projetar, Expressar, Conter ou Rejeitar para dar uma saída ao circuito.");
  if (indicePotencia > indiceRank) erros.push("A potência não pode superar o rank de construção da Magia Teórica.");
  if (temExpressar && centrais.length > 1) erros.push("Expressar é uma saída sensorial própria: use outra célula para combiná-la com uma barreira ou projétil.");
  if (temExpressar && (temExpandir || temRepetir)) erros.push("Esta versão de Expressar ainda não admite Expandir ou Repetir.");
  if (temRepetir && temProjetar && escolha.essencia === "vida" && !estrutura) erros.push("Repetir não renova nem repete cura; use outra fórmula para uma segunda restauração.");
  if (centrais.length > 2) erros.push("Use no máximo duas ações centrais no mesmo circuito.");
  if (new Set(operadores).size !== operadores.length) erros.push("Cada operador aparece uma vez; Repetir é o símbolo para duplicar uma saída.");
  if (simbolos > perfil.simbolos) erros.push(`${escolha.rank} aceita até ${perfil.simbolos} símbolos; este desenho usa ${simbolos}.`);
  if (simbolos > meio.maxSimbolos) erros.push(`${meio.nome} aceita até ${meio.maxSimbolos} símbolos; escolha outro material.`);
  if (pm > perfil.pm) erros.push(`O circuito custa ${pm} PM, acima do teto de ${perfil.pm} PM de ${escolha.rank}.`);
  if (centrais.length > 1 && indiceRank === 0) erros.push("Duas ações centrais exigem Magia Teórica Intermediária.");
  if ((temExpandir || temRepetir) && indiceRank === 0) erros.push("Expandir e Repetir exigem Magia Teórica Intermediária.");
  if (escolha.forma === "triangulo" && indiceRank < 1) erros.push("Triângulo exige Teórica Intermediária.");
  if (escolha.forma === "estrela" && indiceRank < 2) erros.push("Estrela exige Teórica Avançada.");
  if (escolha.forma === "espiral" && indiceRank < 3) erros.push("Espiral exige Teórica Santa.");
  if (escolha.meio === "pedra" && indiceRank < 3) erros.push("Pedra gravada exige Teórica Santa.");
  if (escolha.gatilho && indiceRank < 2) erros.push("Gatilhos exigem Magia Teórica Avançada.");
  if (escolha.gatilho && (escolha.meio === "gesto" || escolha.meio === "ar")) erros.push("Um gatilho precisa de giz, pergaminho ou pedra gravada.");
  if (escolha.gatilho && escolha.condicao === "quebra") erros.push("O alarme de quebra precisa de outra célula que sobreviva à parede. Esta oficina ainda aceita uma célula por desenho.");
  if (escolha.forma === "triangulo" && !temProjetar) erros.push("Triângulo aumenta dados de uma projeção; esta fórmula não rola dados.");
  if (escolha.forma === "triangulo" && estrutura) erros.push("Triângulo concentra uma projeção; use outra forma para uma barreira.");
  if (escolha.forma === "quadrado" && !temConter) erros.push("Quadrado fortalece estruturas; esta fórmula não tem PV.");
  if (escolha.forma === "linha" && !temProjetar && !estrutura) erros.push("Linha exige uma projeção ou fronteira com dimensão ou alcance.");
  if (escolha.forma === "espiral" && escolha.meio === "gesto") erros.push("Espiral precisa de um traço que permaneça para armazenar PM.");
  if (escolha.forma === "estrela" && !temProjetar) erros.push("Estrela distribui uma projeção entre alvos; esta fórmula não projeta.");
  if (escolha.forma === "estrela" && estrutura) erros.push("Estrela distribui uma projeção; use outra forma para uma barreira.");
  if (temExpressar && escolha.forma !== "circulo" && escolha.forma !== "espiral") erros.push("O sinal simples de Expressar usa Círculo; Espiral só é possível em suporte que permaneça.");
  if (temProjetar && estrutura && operadores.indexOf("projetar") > operadores.findIndex((id) => id === "conter" || id === "rejeitar")) {
    erros.push("Para criar uma barreira distante, escreva Projetar antes de Conter ou Rejeitar.");
  }
  if (temExpandir && estrutura && operadores.indexOf("expandir") < Math.max(operadores.indexOf("conter"), operadores.indexOf("rejeitar"))) {
    erros.push("Para ampliar uma barreira, escreva Expandir depois da ação que a forma.");
  }
  if (temExpandir && estrutura && (escolha.meio === "gesto" || escolha.meio === "ar") && perfilPotencia.area >= 12) {
    erros.push("Expandir não aumenta esta fronteira no ar: o limite é 12 m. Use um suporte físico preparado.");
  }
  if (temRepetir && operadores.at(-1) !== "repetir") erros.push("Repetir precisa ser a última palavra: ele duplica a saída pronta.");

  const cobertura = Math.min(perfilPotencia.area, escolha.meio === "gesto" || escolha.meio === "ar" ? 12 : Number.POSITIVE_INFINITY);
  const raioDireto = AREAS_DIRETAS[indicePotencia];
  const raioAnterior = ([...new Set(AREAS_DIRETAS)].filter((valor) => valor < raioDireto)).at(-1) ?? 0;
  const raioEfetivo = escolha.forma === "triangulo" ? raioAnterior : raioDireto;
  const ofensiva = temProjetar && !estrutura;
  const projecaoEmArea = ofensiva && temExpandir;
  const alcanceNumero = medir(perfilPotencia.alcance * (escolha.forma === "linha" ? 1.5 : 1) * (expandirAntesDeProjetar ? 0.5 : 1));
  const alcance = temProjetar ? `${alcanceNumero} m` : temExpressar ? "no ponto do desenho" : "toque";
  const coberturaFinal = Math.min(cobertura * (temExpandir ? 2 : 1), escolha.meio === "gesto" || escolha.meio === "ar" ? 12 : Number.POSITIVE_INFINITY);
  const area = estrutura
    ? escolha.forma === "linha"
      ? `parede de até ${medir(Math.min(coberturaFinal * 1.5, escolha.meio === "gesto" || escolha.meio === "ar" ? 12 : Number.POSITIVE_INFINITY))} m por 1,5 m`
      : `fronteira de até ${coberturaFinal} m na maior dimensão`
    : temExpressar
      ? "sinal no ponto do desenho"
      : !projecaoEmArea || raioEfetivo === 0
        ? "alvo único"
        : expandirAntesDeProjetar
          ? `cone de ${alcanceNumero} m e ${escolha.forma === "triangulo" ? 45 : 90}° desde a origem`
          : `raio de ${raioEfetivo} m no destino`;
  const pv = temConter ? Math.ceil(perfilPotencia.pv * (1 + (escolha.essencia === "terra" ? .5 : 0) + (escolha.forma === "quadrado" ? .5 : 0))) : null;
  const dadosDirigidos = perfilPotencia.dados + (escolha.forma === "triangulo" && ofensiva ? 1 : 0);
  const dadosPrimeiraSaida = projecaoEmArea && raioEfetivo > 0 ? Math.ceil(dadosDirigidos / 2) : dadosDirigidos;
  const dadosEco = temRepetir && ofensiva && escolha.essencia !== "vida" ? Math.min(Math.ceil(dadosPrimeiraSaida / 2), Math.max(0, 2 * perfilPotencia.dados - dadosPrimeiraSaida)) : 0;
  if (temRepetir && ofensiva && escolha.essencia !== "vida" && dadosEco === 0) erros.push("A repetição ultrapassaria o orçamento de dados desta potência.");
  const dadoPrincipal = `${dadosPrimeiraSaida}d8`;
  const cura = escolha.essencia === "vida";
  const dano = ofensiva ? `${dadoPrincipal}${cura ? "" : " + BC"}${dadosEco ? ` + ${dadosEco}d8 no turno seguinte` : ""}${escolha.forma === "estrela" ? " total, dividido entre até 3 alvos" : ""}` : null;
  const tipo = ofensiva ? essencia.tipo : null;
  const turnos = estrutura ? Math.ceil(10 * (temRepetir ? 2 : 1) * (escolha.forma === "circulo" ? 1.5 : 1)) : temExpressar ? 1 : 0;
  const turnosAtivos = Math.min(turnos, DURACOES_MATERIAL[escolha.meio]);
  const duracao = turnos ? `${turnosAtivos} turno${turnosAtivos === 1 ? "" : "s"}` : "instantânea";
  const reservaPm = escolha.forma === "espiral" ? 2 * (indicePotencia + 1) : null;
  const pisoAtivacao = indicePotencia < 2 ? 1 : indicePotencia < 4 ? 2 : 3;
  const acoesAtivacao = escolha.meio === "ar" ? Math.max(2, pisoAtivacao) : escolha.meio === "gesto" ? Math.max(1, pisoAtivacao) : pisoAtivacao;
  const ativacao = `${acoesAtivacao} ${acoesAtivacao === 1 ? "Ação" : "Ações"}${escolha.meio === "ar" || escolha.meio === "gesto" ? " (traçado incluso)" : " após preparar o suporte"}`;
  const resolucao = ofensiva ? escolha.essencia === "vida"
    ? `Cura ${dadoPrincipal} de PV em alvo voluntário${projecaoEmArea ? "; em área, divida os dados entre os beneficiários" : ""}.`
    : projecaoEmArea && raioEfetivo > 0
      ? `Área: Agilidade contra CD 8 + BC; metade do dano no sucesso. Dados dirigidos: ${dadosDirigidos}d6; orçamento de área: ${dadoPrincipal}.`
      : `Alvo único: 1d20 + BC contra CA${escolha.forma === "estrela" ? "; distribua os dados inteiros entre até três alvos antes de rolar" : ""}.`
    : null;
  const umaPorTurno = ofensiva && !cura ? " Uma projeção ofensiva por turno (§8)." : "";
  if (projecaoEmArea && escolha.forma === "triangulo" && raioEfetivo === 0) erros.push("Triângulo reduziria esta área a um alvo; remova Expandir ou aumente a potência.");
  const magiaBarrada = escolha.essencia === "mana" ? "magia" : `magia de ${essencia.nome}`;
  const regraDoSelo = `${magiaBarrada} de rank ${potencia} ou inferior; um rank acima atravessa com dados, área e duração pela metade; dois ou mais ranks acima atravessam integralmente`;
  const bloqueio = temConter && temRejeitar
    ? `criaturas e projéteis até perder os PV; ${regraDoSelo}`
    : temConter
      ? "criaturas e projéteis até perder os PV; magia atravessa"
      : temRejeitar
        ? `${regraDoSelo}; ataques físicos atravessam`
        : null;
  const efeitoDaEssencia = temConter ? {
    mana: null,
    fogo: `Contato corporal: ${Math.ceil(perfilPotencia.dados / 2)}d6 de dano ígneo, Agilidade contra CD 8 + BC para metade, uma vez por criatura por rodada; golpear com arma não transmite o efeito. Não aplica Em Chamas.`,
    agua: "Contato corporal impõe Molhado até o fim do próximo turno; se for imposto, Agilidade contra CD 8 + BC evita a condição.",
    vento: "Contato corporal: Força contra CD 8 + BC; falha empurra 1,5 m para o exterior declarado, uma vez por criatura por rodada.",
    terra: "Terra acrescenta 50% aos PV base; soma com Quadrado, sem multiplicar os bônus entre si.",
    som: "Contato corporal emite um sinal audível até 18 m. Não aplica Surdo.",
    vida: `Na ativação, um beneficiário voluntário ao toque recebe ${perfilPotencia.dados} PV temporários por até ${Math.min(turnosAtivos, 10)} turnos; não acumula nem se renova por contato.`,
  }[escolha.essencia] : null;

  const nome = temExpressar ? `Sinal de ${essencia.nome}`
    : temConter && temRejeitar ? `Égide de ${essencia.nome}`
    : temConter ? `Muralha de ${essencia.nome}`
      : temRejeitar ? `Selo de ${essencia.nome}`
        : escolha.essencia === "vida" ? "Pulso de Vida"
          : temExpandir ? `Onda de ${essencia.nome}` : `Rajada de ${essencia.nome}`;
  let resumo: string;
  if (estrutura) {
    const palavra = temConter && temRejeitar ? "barreira dupla" : temConter ? "barreira física" : "selo de rejeição";
    resumo = `Cria ${palavra} de ${essencia.nome.toLowerCase()}${pv === null ? "" : ` com ${pv} PV`} em ${area}.`;
    if (temConter && temRejeitar) {
      resumo += ` A camada externa é ${operadores.indexOf("conter") < operadores.indexOf("rejeitar") ? "física" : "mágica"}; efeitos que atinjam as duas encontram essa camada primeiro.`;
    }
    if (temProjetar) resumo += ` Ela nasce em um ponto a até ${alcance}.`;
    if (temRepetir) resumo += " Repetir dobra a duração, sem recuperar PV perdidos.";
  } else if (temExpressar) {
    resumo = escolha.essencia === "som"
      ? "Emite um som perceptível até 18 m do desenho durante 1 turno. Não imita voz nem impõe condição."
      : `Manifesta um sinal sensorial de ${essencia.nome.toLowerCase()} no ponto do desenho durante 1 turno, sem dano, cura, condição ou iluminação útil.`;
  } else if (temProjetar && escolha.essencia === "vida") {
    resumo = `Projeta energia vital para restaurar ${dano?.split(" + ")[0]} PV a ${escolha.forma === "estrela" ? "até três alvos, dividindo a cura total" : projecaoEmArea ? "beneficiários na área, dividindo os dados" : "um alvo voluntário"} a até ${alcance}.`;
  } else if (temProjetar) {
    resumo = `Projeta ${essencia.nome.toLowerCase()} a até ${alcance}, causando ${dano} de dano ${essencia.tipo}${temExpandir ? ` em ${area}` : escolha.forma === "estrela" ? " no conjunto dos alvos" : " em um alvo"}.`;
  } else {
    resumo = "O desenho ainda não tem uma saída: ligue um operador central à essência.";
  }

  const ordem = temExpandir && temProjetar && !estrutura
    ? expandirAntesDeProjetar ? "Expandir vem antes de Projetar: abre um cone na origem e reduz o alcance à metade." : "Projetar vem antes de Expandir: conserva o alcance e abre a área no destino."
    : operadores.length > 1 ? `A ordem escrita é ${operadores.map((id) => OPERADORES[id].nome).join(" → ")}.` : "A essência alimenta diretamente a ação.";
  const leitura = `${essencia.nome} → ${operadores.map((id) => OPERADORES[id].nome).join(" → ") || "?"} → ${forma.nome}. ${ordem}${escolha.gatilho ? " O gatilho adia a ativação até a condição declarada." : ""}`;
  if (reservaPm !== null) resumo += ` A espiral guarda até ${reservaPm} PM para completar o custo depois.`;
  if (escolha.gatilho) resumo += ` Ativa quando ${GATILHOS[escolha.condicao]}.`;

  return {
    nome,
    valida: erros.length === 0,
    erros,
    pm,
    limitePm: perfil.pm,
    simbolos,
    limiteSimbolos: perfil.simbolos,
    potencia,
    preparo: meio.preparo,
    ativacao,
    resolucao: resolucao ? resolucao + umaPorTurno : null,
    duracao,
    alcance,
    area,
    dano,
    tipo,
    pv,
    bloqueio,
    efeitoDaEssencia,
    reservaPm,
    resumo,
    leitura,
    conta,
  };
}
