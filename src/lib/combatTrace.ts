/** Dados que realmente foram rolados; o relatório nunca sorteia valores novamente. */
export interface RolagemDados {
  formula: string;
  grupos: { faces: number; resultados: number[] }[];
  fixo: number;
  total: number;
  /** Fração do resultado rolado, usada por técnicas como metade do dado. */
  fracao?: number;
}

export interface RolagemD20 {
  dados: number[];
  natural: number;
  ajuste: "normal" | "vantagem" | "desvantagem";
}

/** Um ataque ou efeito contra um alvo. Efeitos em área geram um evento por alvo. */
export interface EventoAtaque {
  rodada?: number;
  atacante: string;
  alvo: string;
  acao: string;
  teste?: RolagemD20 & {
    tipo: "ataque" | "resistencia";
    bonus: number;
    total: number;
    defesa: number;
  };
  acertou: boolean;
  critico: boolean;
  parcelas: { origem: string; rolagem: RolagemDados }[];
  bonusDano: number;
  bruto: number;
  aposModificadores: number;
  aplicacao?: {
    aposResistencia: number;
    absorvidoTemporario: number;
    perdaPv: number;
    danoEfetivo: number;
  };
  arma?: { nome: string; baseDie: string; escalatedDie: string; steps: number };
  notas: string[];
}

export interface RegistroCombate {
  log(msg: string): void;
  ataque?(evento: EventoAtaque): void;
}

const DADOS = /\b(\d*)\s*d\s*(\d+)\b/gi;

function lerFormula(formula: string) {
  const grupos = [...formula.matchAll(DADOS)].map((m) => ({
    quantidade: Number(m[1] || 1),
    faces: Number(m[2]),
  }));
  // Quantidades de armas, ações e medidas na prosa não são bônus numéricos.
  const semDados = formula.replace(DADOS, " ").replace(
    /[+-]\s*\d+\s*(?:dados?\s+de\s+arma|aç(?:ão|ões)|turnos?|rodadas?|metros?|m\b|PT\b|PM\b)/gi,
    " ",
  );
  const fixo = /^\s*[+-]?\s*\d+\s*$/.test(semDados)
    ? Number(semDados.replace(/\s/g, ""))
    : [...semDados.matchAll(/([+-])\s*(\d+)\b/g)].reduce(
      (total, m) => total + (m[1] === "-" ? -1 : 1) * Number(m[2]), 0,
    );
  return { grupos, fixo };
}

function rolar(
  formula: string,
  rng: () => number,
  multiplicador: number,
  incluirFixo: boolean,
): RolagemDados {
  if ((!Number.isSafeInteger(multiplicador) && multiplicador !== 0.5) || multiplicador < 0) {
    throw new RangeError("O multiplicador deve ser inteiro não negativo ou metade do dado.");
  }
  const repeticoes = multiplicador === 0.5 ? 1 : multiplicador;
  const fracao = multiplicador === 0.5 ? 0.5 : 1;
  const leitura = lerFormula(formula);
  const grupos = leitura.grupos.map(({ quantidade, faces }) => {
    if (!Number.isSafeInteger(quantidade * repeticoes) || !Number.isSafeInteger(faces) || faces < 1) {
      throw new RangeError("A fórmula deve usar quantidades e faces válidas.");
    }
    return {
      faces,
      resultados: Array.from({ length: quantidade * repeticoes }, () => Math.floor(rng() * faces) + 1),
    };
  });
  const fixo = incluirFixo ? leitura.fixo * repeticoes : 0;
  const formulaEfetiva = incluirFixo
    ? formula
    : leitura.grupos.map(({ quantidade, faces }) => `${quantidade}d${faces}`).join(" + ") || "0";
  return {
    formula: multiplicador === 1 ? formulaEfetiva : `${multiplicador} × (${formulaEfetiva})`,
    grupos,
    fixo,
    total: fracao * grupos.reduce((total, grupo) => total + grupo.resultados.reduce((soma, dado) => soma + dado, 0), fixo),
    ...(fracao !== 1 ? { fracao } : {}),
  };
}

/**
 * O chamador fornece a fórmula já resolvida para as condições do ataque.
 * Repetir uma arma rola dados independentes; não multiplica uma única amostra.
 * A prosa não decide quais bônus condicionais ou Dados de Arma se aplicam.
 */
export function rolarComRegistro(formula: string, rng: () => number, multiplicador = 1): RolagemDados {
  return rolar(formula, rng, multiplicador, true);
}

/** Parcela adicional do crítico: repete somente dados, nunca o bônus fixo. */
export function rolarCriticoComRegistro(formula: string, rng: () => number, multiplicador = 1): RolagemDados {
  return rolar(formula, rng, multiplicador, false);
}

export function rolarD20ComRegistro(
  rng: () => number,
  vantagem = false,
  desvantagem = false,
): RolagemD20 {
  const dados = [Math.floor(rng() * 20) + 1];
  if (vantagem === desvantagem) return { dados, natural: dados[0], ajuste: "normal" };
  dados.push(Math.floor(rng() * 20) + 1);
  return {
    dados,
    natural: vantagem ? Math.max(...dados) : Math.min(...dados),
    ajuste: vantagem ? "vantagem" : "desvantagem",
  };
}

const comSinal = (valor: number) => valor < 0 ? `− ${Math.abs(valor)}` : `+ ${valor}`;

export function formatarRolagemDados(rolagem: RolagemDados): string {
  const dados = rolagem.grupos.map(({ faces, resultados }) => `${resultados.length}d${faces} [${resultados.join(", ")}]`).join(" + ");
  const conta = dados ? `${dados}${rolagem.fixo ? ` ${comSinal(rolagem.fixo)}` : ""}` : `${rolagem.fixo}`;
  return `${rolagem.fracao ? `${rolagem.fracao} × (${conta})` : conta} = ${rolagem.total}`;
}

/** Projeção legível do evento, sem aleatoriedade e sem recalcular as regras. */
export function formatarEventoAtaque(evento: EventoAtaque): string {
  const partes = [`[${evento.atacante}] ${evento.acao} → ${evento.alvo}.`];
  if (evento.teste) {
    const teste = evento.teste;
    const ajuste = teste.ajuste === "normal" ? "" : ` (${teste.ajuste}; escolhido ${teste.natural})`;
    const resultado = teste.tipo === "ataque"
      ? evento.acertou ? evento.critico ? "acerto crítico" : "acertou" : "errou"
      : teste.total >= teste.defesa ? "alvo passou" : "alvo falhou";
    partes.push(`${teste.tipo === "ataque" ? "Ataque" : "Resistência do alvo"}: d20 [${teste.dados.join(", ")}]${ajuste} ${comSinal(teste.bonus)} = ${teste.total} contra ${teste.tipo === "ataque" ? "CA" : "CD"} ${teste.defesa}: ${resultado}.`);
  }
  if (evento.arma) {
    const arma = evento.arma;
    partes.push(`Arma: ${arma.nome}, ${arma.baseDie} → ${arma.escalatedDie} (${arma.steps} degrau${arma.steps === 1 ? "" : "s"}).`);
  }
  for (const parcela of evento.parcelas) {
    partes.push(`${parcela.origem}: ${formatarRolagemDados(parcela.rolagem)}.`);
  }
  if (!evento.acertou) {
    partes.push("Dano bruto: 0 (ataque errou; dados de dano não rolados).");
  } else if (evento.parcelas.length > 0 || evento.bonusDano !== 0) {
    const soma = evento.parcelas.map(({ rolagem }) => rolagem.total).join(" + ") || "0";
    partes.push(`Dano bruto: ${soma} ${comSinal(evento.bonusDano)} de bônus = ${evento.bruto}.`);
  } else {
    partes.push(`Dano bruto: ${evento.bruto}.`);
  }
  if (evento.aposModificadores !== evento.bruto) {
    partes.push(`Após modificadores: ${evento.aposModificadores}.`);
  }
  if (evento.aplicacao) {
    const aplicacao = evento.aplicacao;
    partes.push(`Após resistência a dano: ${aplicacao.aposResistencia}; PV temporários absorveram ${aplicacao.absorvidoTemporario}; perda de PV: ${aplicacao.perdaPv}; dano efetivo: ${aplicacao.danoEfetivo}.`);
  }
  partes.push(...evento.notas);
  return partes.join(" ");
}
