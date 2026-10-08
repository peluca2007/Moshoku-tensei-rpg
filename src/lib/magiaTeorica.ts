/*
 * MAGIA TEÓRICA — "TRÊS PALAVRAS E UMA CONTA" (2026-09-26, decisão do autor:
 * ★ do PLANO-DE-REWORK.md, §1; Etapa 2 do PLANO-DO-DESIGNER.md).
 *
 * A gramática anterior tinha sete dimensões (essência, seis operadores, seis
 * formas, cinco meios, construção E potência, gatilho, células com ligações e
 * Espiral), uma conta de seis parcelas e 33 regras que recusavam uma fórmula —
 * metade delas de ORDEM ("Projetar antes de Conter", "Repetir por último"). O
 * Mestre não arbitrava sem o site.
 *
 * Agora toda fórmula é uma frase de três palavras:
 *
 *   ESSÊNCIA (o que existe) + VERBO (o que acontece) + FORMA (como se organiza)
 *
 * e a conta é uma linha só:
 *
 *   PM = o custo da POTÊNCIA + 1 por palavra fora do básico
 *
 * O básico é Mana, o primeiro verbo e o Círculo. Essência de outra escola,
 * forma que não é o Círculo e o segundo verbo (a partir do Avançado) custam +1
 * cada; armar uma fórmula custa +2. A potência é o seu rank na Teórica, ou
 * menos se você quiser uma fórmula mais barata — um número só, não dois.
 *
 * A ordem das palavras deixou de ser regra: Expandir e Repetir viraram as
 * FORMAS Onda e Eco, e o verbo Lançar, quando anda com outro, só leva o efeito
 * até o alcance. Sobraram 7 regras que recusam uma fórmula (ver `criarFormula`).
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

const indice = (rank: RankTeorico) => RANKS_TEORICOS.indexOf(rank);

/**
 * As essências. Mana é a da própria escola; as outras vêm DE GRAÇA com o
 * Principiante da escola dona (Fogo, Água, Vento, Terra, Bardo, Cura), ou por
 * 1 PA num talento da Teórica. Cada uma muda o tipo do dano e o que a parede
 * faz a quem encosta nela.
 */
export const ESSENCIAS = {
  mana: { nome: "Mana", origem: "Magia Teórica", tipo: "arcano", cor: "#78d5d0", glifo: "◇" },
  fogo: { nome: "Fogo", origem: "Fogo Principiante ou 1 PA", tipo: "ígneo", cor: "#f9a56c", glifo: "△" },
  agua: { nome: "Água", origem: "Água Principiante ou 1 PA", tipo: "contundente", cor: "#80bdea", glifo: "≋" },
  vento: { nome: "Vento", origem: "Vento Principiante ou 1 PA", tipo: "cortante", cor: "#a7d9c2", glifo: "⌁" },
  terra: { nome: "Terra", origem: "Terra Principiante ou 1 PA", tipo: "contundente", cor: "#d8b986", glifo: "▱" },
  som: { nome: "Som", origem: "Bardo Principiante ou 1 PA", tipo: "sônico", cor: "#d3acf5", glifo: "♫" },
  vida: { nome: "Vida", origem: "Cura Principiante ou 1 PA", tipo: "cura", cor: "#c6df98", glifo: "✧" },
} as const;

export type EssenciaId = keyof typeof ESSENCIAS;

/** Os quatro verbos, todos aprendidos no Principiante. */
export const VERBOS = {
  lancar: { nome: "Lançar", papel: "Leva o efeito a um alvo ou ponto ao alcance. Sozinho, fere (ou cura, com Vida).", glifo: "➶" },
  erguer: { nome: "Erguer", papel: "Levanta uma parede com PV: segura corpos e projéteis; magia atravessa.", glifo: "⊏⊐" },
  selar: { nome: "Selar", papel: "Fecha uma fronteira sem PV que barra magia pela Régua do Selo; corpos atravessam.", glifo: "⟩⟨" },
  sinalizar: { nome: "Sinalizar", papel: "Um sinal de luz, som ou cheiro, sem dano nem condição.", glifo: ")))" },
} as const;

export type VerboId = keyof typeof VERBOS;

/**
 * As formas. Cada uma diz o que faz com cada verbo; onde não diz nada, não
 * muda nada (e custa assim mesmo) — não existe forma "proibida".
 */
export const FORMAS = {
  circulo: { nome: "Círculo", desde: "Principiante", efeito: "Forma básica: não muda nada e não custa nada.", glifo: "◯" },
  linha: { nome: "Linha", desde: "Principiante", efeito: "Lançar vai 50% mais longe; a parede vira um muro comprido (tamanho × 1,5).", glifo: "⟷" },
  quadrado: { nome: "Quadrado", desde: "Principiante", efeito: "A parede de Erguer ganha +50% de PV.", glifo: "□" },
  triangulo: { nome: "Triângulo", desde: "Intermediário", efeito: "Lançar concentra: +1 dado.", glifo: "△" },
  onda: { nome: "Onda", desde: "Intermediário", efeito: "Lançar vira área (raio = tamanho), com metade dos dados e Agilidade pra metade; parede, selo e sinal dobram de tamanho.", glifo: "≈" },
  eco: { nome: "Eco", desde: "Intermediário", efeito: "Lançar se repete no começo do seu próximo turno com metade dos dados, sem o BC — e o eco é a fórmula que fere daquele turno; parede, selo e sinal duram o dobro.", glifo: "◎" },
  estrela: { nome: "Estrela", desde: "Avançado", efeito: "Lançar divide os dados entre até 3 alvos, um ataque por alvo; o BC soma uma vez, num alvo só.", glifo: "✦" },
} as const;

export type FormaId = keyof typeof FORMAS;

/** Onde a fórmula é desenhada. Lançar que fere só se desenha no ar (ou armado). */
export const MEIOS = {
  ar: { nome: "No ar", desde: "Principiante", preparo: "na hora", ativacao: "as Ações de uma magia do rank da potência", duracao: "1 minuto" },
  giz: { nome: "Giz ou pergaminho", desde: "Principiante", preparo: "1 minuto antes", ativacao: "1 Ação", duracao: "10 minutos" },
  pedra: { nome: "Gravada em pedra", desde: "Santo", preparo: "1 hora antes", ativacao: "1 Ação", duracao: "1 dia" },
} as const;

export type MeioId = keyof typeof MEIOS;

/** O que dispara uma fórmula armada (Santo em diante). */
export const GATILHOS = {
  entrada: "uma criatura entrar na área",
  toque: "alguém tocar o desenho",
  queda: "outra fórmula sua cair",
} as const;

export type GatilhoId = keyof typeof GATILHOS;

/**
 * A POTÊNCIA — a tabela de uma linha. O custo em PM é também o número de dados
 * d8 que Lançar rola: "a potência custa 1 PM por dado".
 *
 * Os degraus (1, 2, 5, 6, 10, 12) seguem as Ações da tabela do Cap. 2, §3: onde
 * a magia passa a custar uma Ação a mais (Avançado, Rei), a potência dá o salto
 * maior — senão a carta de dano do patamar renderia MENOS por Ação que a de
 * baixo (check:progressao, 2026-09-26).
 */
export const POTENCIA: Record<RankTeorico, { pm: number; dados: number; pv: number; alcance: number; tamanho: number; armadas: number }> = {
  Principiante: { pm: 1, dados: 1, pv: 20, alcance: 9, tamanho: 3, armadas: 0 },
  Intermediário: { pm: 2, dados: 2, pv: 40, alcance: 18, tamanho: 6, armadas: 0 },
  Avançado: { pm: 5, dados: 5, pv: 60, alcance: 27, tamanho: 9, armadas: 0 },
  Santo: { pm: 6, dados: 6, pv: 80, alcance: 45, tamanho: 12, armadas: 1 },
  Rei: { pm: 10, dados: 10, pv: 100, alcance: 90, tamanho: 18, armadas: 2 },
  Imperador: { pm: 12, dados: 12, pv: 120, alcance: 150, tamanho: 30, armadas: 3 },
};

/** As Ações de uma magia desenhada no ar: as mesmas da tabela do Cap. 2, §3. */
const ACOES_NO_AR: Record<RankTeorico, number> = {
  Principiante: 2,
  Intermediário: 2,
  Avançado: 3,
  Santo: 3,
  Rei: 4,
  Imperador: 4,
};

export interface FormulaEscolha {
  /** O seu rank na Teórica. */
  rank: RankTeorico;
  /** A potência, até o seu rank (padrão: o seu rank). */
  potencia?: RankTeorico;
  essencia: EssenciaId;
  /** Um verbo; dois a partir do Avançado. A ordem não importa. */
  verbos: VerboId[];
  forma: FormaId;
  meio: MeioId;
  /** Armada (Santo em diante): dispara sozinha uma vez. */
  armada: boolean;
  gatilho: GatilhoId;
}

export interface FormulaResultado {
  nome: string;
  valida: boolean;
  erros: string[];
  pm: number;
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
  resumo: string;
  /** A frase, lida: "Fogo · Lançar · Linha". */
  leitura: string;
  /** As parcelas do PM, pra lousa: ["Potência Intermediária 2", "Fogo +1", …]. */
  conta: string[];
}

const medir = (m: number) => Math.max(1.5, Math.floor(m / 1.5) * 1.5);
const fmt = (m: number) => String(m).replace(".", ",");

/** O que cada essência faz a quem encosta numa parede de Erguer. */
function contato(essencia: EssenciaId, dados: number, duracaoTurnos: number): string | null {
  switch (essencia) {
    case "mana":
      return null;
    case "fogo":
      return `Quem encosta sofre ${Math.ceil(dados / 2)}d6 de dano ígneo (Agilidade contra CD 8 + BC pra metade), uma vez por rodada. Golpe de arma não transmite o calor.`;
    case "agua":
      return "Quem encosta fica Molhado até o fim do próximo turno dele (Agilidade contra CD 8 + BC evita).";
    case "vento":
      return "Quem encosta testa Força contra CD 8 + BC ou é empurrado 1,5 m pra fora, uma vez por rodada.";
    case "terra":
      return "A parede de Terra tem +50% de PV (soma com o Quadrado).";
    case "som":
      return "Encostar na parede faz um som audível a até 18 m.";
    case "vida":
      return `Ao erguê-la, um aliado ao toque recebe ${dados * 5} PV temporários por até ${Math.min(duracaoTurnos, 10)} turnos.`;
  }
}

/**
 * Monta a fórmula e devolve os números, o texto e — se não sair do papel — o
 * porquê. São SETE as regras que recusam uma fórmula, e todas cabem numa frase:
 *
 * 1. um verbo; dois só a partir do Avançado;
 * 2. a potência não passa do seu rank;
 * 3. a forma tem que estar ao seu alcance (Intermediário, Avançado);
 * 4. Lançar que fere só se desenha no ar, ou armado;
 * 5. pedra a partir do Santo;
 * 6. armar a partir do Santo;
 * 7. armar precisa de giz, pergaminho ou pedra.
 */
export function criarFormula(escolha: FormulaEscolha): FormulaResultado {
  const potencia = escolha.potencia ?? escolha.rank;
  const p = POTENCIA[potencia];
  const essencia = ESSENCIAS[escolha.essencia];
  const forma = FORMAS[escolha.forma];
  const meio = MEIOS[escolha.meio];
  const verbos = [...new Set(escolha.verbos)];
  const tem = (v: VerboId) => verbos.includes(v);
  const lancar = tem("lancar");
  const estrutura = tem("erguer") || tem("selar") || tem("sinalizar");
  /** Lançar sozinho fere (ou cura); com outro verbo, só leva o efeito longe. */
  const fere = lancar && !estrutura;
  const cura = fere && escolha.essencia === "vida";
  const noAr = escolha.meio === "ar";

  // ── A conta ─────────────────────────────────────────────────────────────
  const extras: [string, number][] = [];
  if (escolha.essencia !== "mana") extras.push([essencia.nome, 1]);
  if (escolha.forma !== "circulo") extras.push([forma.nome, 1]);
  if (verbos.length > 1) extras.push([`2º verbo (${VERBOS[verbos[1]].nome})`, 1]);
  if (escolha.armada) extras.push(["Armada", 2]);
  const pm = p.pm + extras.reduce((t, [, v]) => t + v, 0);
  const conta = [`Potência ${potencia} ${p.pm}`, ...extras.map(([n, v]) => `${n} ${v}`)];

  // ── As sete regras ──────────────────────────────────────────────────────
  const erros: string[] = [];
  if (verbos.length === 0) erros.push("Falta o verbo: uma fórmula sem verbo é mana parada.");
  if (verbos.length > 2) erros.push("No máximo dois verbos numa fórmula.");
  if (verbos.length === 2 && indice(escolha.rank) < 2) erros.push("Dois verbos na mesma fórmula só a partir do Avançado.");
  if (indice(potencia) > indice(escolha.rank)) erros.push("A potência não passa do seu rank na Teórica.");
  if (indice(forma.desde as RankTeorico) > indice(escolha.rank)) erros.push(`${forma.nome} se aprende no ${forma.desde}.`);
  if (fere && !noAr && !escolha.armada) erros.push("Lançar que fere se desenha na hora, no ar — ou armado, a partir do Santo.");
  if (escolha.meio === "pedra" && indice(escolha.rank) < 3) erros.push("Gravar em pedra se aprende no Santo.");
  if (escolha.armada && indice(escolha.rank) < 3) erros.push("Armar uma fórmula se aprende no Santo.");
  if (escolha.armada && noAr) erros.push("Uma fórmula armada precisa de giz, pergaminho ou pedra: no ar ela se apaga.");

  // ── Os números ──────────────────────────────────────────────────────────
  const alcanceM = lancar ? medir(p.alcance * (escolha.forma === "linha" ? 1.5 : 1)) : 0;
  const alcance = lancar ? `${fmt(alcanceM)} m` : "toque";
  const tamanho = medir(p.tamanho * (escolha.forma === "onda" ? 2 : escolha.forma === "linha" ? 1.5 : 1));
  const turnosBase = noAr ? 10 : escolha.meio === "giz" ? 100 : 14400;
  const turnos = turnosBase * (escolha.forma === "eco" ? 2 : 1);
  const duracaoEstrutura = noAr
    ? `${escolha.forma === "eco" ? 2 : 1} minuto${escolha.forma === "eco" ? "s" : ""}`
    : escolha.meio === "giz"
      ? `${escolha.forma === "eco" ? 20 : 10} minutos`
      : `${escolha.forma === "eco" ? 2 : 1} dia${escolha.forma === "eco" ? "s" : ""}`;

  const dadosBase = p.dados + (escolha.forma === "triangulo" && fere ? 1 : 0);
  const emArea = fere && escolha.forma === "onda";
  const dadosSaida = emArea ? Math.ceil(dadosBase / 2) : dadosBase;
  const dadosEco = fere && escolha.forma === "eco" ? Math.ceil(dadosBase / 2) : 0;
  const dano = fere
    ? `${dadosSaida}d8${cura ? "" : " + BC"}${dadosEco ? ` e, no começo do seu próximo turno, ${dadosEco}d8` : ""}${escolha.forma === "estrela" ? ", divididos entre até 3 alvos (o BC num alvo só)" : ""}`
    : null;
  const tipo = fere ? essencia.tipo : null;

  const pv = tem("erguer")
    ? Math.ceil(p.pv * (1 + (escolha.essencia === "terra" ? 0.5 : 0) + (escolha.forma === "quadrado" ? 0.5 : 0)))
    : null;

  // O selo com essência de escola só barra magia daquela escola — e, por ser
  // estreito, barra um rank a mais (2026-09-27).
  const tetoDoSelo = escolha.essencia === "mana" ? potencia : (RANKS_TEORICOS[RANKS_TEORICOS.indexOf(potencia) + 1] ?? "Deus");
  const regraDoSelo = `Contra ${escolha.essencia === "mana" ? "magia" : `magia de ${essencia.nome} (a essência barra um rank a mais)`}: rank ${tetoDoSelo} ou abaixo não atravessa; um rank acima atravessa com dados, área e duração pela metade; dois ou mais acima atravessam inteiras.`;
  const bloqueio = tem("erguer") && tem("selar")
    ? `Segura corpos e projéteis até perder os PV. ${regraDoSelo}`
    : tem("erguer")
      ? "Segura corpos e projéteis até perder os PV; magia atravessa."
      : tem("selar")
        ? `${regraDoSelo} Corpos, armas e Touki atravessam.`
        : null;

  const efeitoDaEssencia = tem("erguer") ? contato(escolha.essencia, p.dados, turnos) : null;

  const area = fere
    ? emArea
      ? `raio de ${fmt(p.tamanho)} m no destino`
      : escolha.forma === "estrela"
        ? "até 3 alvos"
        : "um alvo"
    : tem("sinalizar") && !tem("erguer") && !tem("selar")
      ? escolha.forma === "onda"
        ? `percebido num raio de ${fmt(tamanho)} m`
        : "no ponto do desenho"
      : `até ${fmt(noAr ? Math.min(tamanho, 12) : tamanho)} m na maior dimensão${noAr && tamanho > 12 ? " (no ar, 12 m no máximo)" : ""}`;

  const duracao = fere
    ? "instantânea"
    : tem("sinalizar") && !tem("erguer") && !tem("selar")
      ? escolha.armada
        ? "dispara uma vez"
        : escolha.forma === "eco"
          ? "2 turnos"
          : "1 turno"
      : duracaoEstrutura;

  const ativacao = escolha.armada
    ? `dispara sozinha quando ${GATILHOS[escolha.gatilho]}`
    : noAr
      ? `${ACOES_NO_AR[potencia]} Ações (desenhada na hora)`
      : "1 Ação (já preparada)";

  const resolucao = fere
    ? cura
      ? `Cura ${dadosSaida}d8 PV de um alvo voluntário${emArea ? " — em área, cada um na área recebe os dados" : ""}.`
      : emArea
        ? `Área: cada um testa Agilidade contra CD 8 + BC; metade do dano no sucesso.`
        : `1d20 + BC contra a CA${escolha.forma === "estrela" ? " de cada alvo; distribua os dados e diga onde vai o BC antes de rolar" : ""}.`
    : null;

  // ── O nome e o texto ────────────────────────────────────────────────────
  const de = essencia.nome;
  const nome = tem("erguer") && tem("selar") ? `Égide de ${de}`
    : tem("erguer") ? `Parede de ${de}`
      : tem("selar") ? `Selo de ${de}`
        : tem("sinalizar") ? `Sinal de ${de}`
          : cura ? "Pulso de Vida"
            : emArea ? `Onda de ${de}` : `Dardo de ${de}`;

  let resumo: string;
  if (fere) {
    resumo = cura
      ? `Lança vida a até ${alcance}: cura ${dadosSaida}d8 PV${emArea ? ` em cada aliado num raio de ${fmt(p.tamanho)} m` : ""}.`
      // "Num alvo" é ataque mágico (Cap. 2, §8: 1d20 + BC contra a CA). Sem a
      // palavra, a carta não dizia como se rola, e o simulador a lia como
      // teste de resistência com meio dano (2026-10-08).
      : `${emArea || escolha.forma === "estrela" ? "" : "Ataque mágico: "}${emArea || escolha.forma === "estrela" ? "Lança" : "lança"} ${de.toLowerCase()} a até ${alcance}: ${dano} de dano ${essencia.tipo}${emArea ? ` num raio de ${fmt(p.tamanho)} m` : escolha.forma === "estrela" ? "" : " num alvo"}.`;
  } else if (tem("erguer") || tem("selar")) {
    const oque = tem("erguer") && tem("selar") ? "uma parede que segura corpo e magia" : tem("erguer") ? "uma parede" : "um selo contra magia";
    resumo = `Ergue ${oque}${pv === null ? "" : ` com ${pv} PV`}, ${area}${lancar ? `, a até ${alcance} de você` : ", ao seu alcance de toque"}.`;
    if (tem("sinalizar")) resumo += " Quando for atingida ou cair, faz um sinal que se ouve a 18 m.";
  } else if (tem("sinalizar")) {
    resumo = `Um sinal de ${de.toLowerCase()} ${lancar ? `a até ${alcance}` : "no ponto do desenho"}, ${escolha.forma === "onda" ? `percebido num raio de ${fmt(tamanho)} m` : "visto ou ouvido por quem estiver perto"}. Sem dano, cura ou condição.`;
  } else {
    resumo = "A fórmula ainda não tem verbo.";
  }
  if (escolha.armada) resumo += ` Armada: dispara sozinha uma vez quando ${GATILHOS[escolha.gatilho]}.`;

  const leitura = [essencia.nome, ...verbos.map((v) => VERBOS[v].nome), forma.nome].join(" · ");

  return {
    nome,
    valida: erros.length === 0,
    erros,
    pm,
    potencia,
    preparo: meio.preparo,
    ativacao,
    resolucao,
    duracao,
    alcance,
    area,
    dano,
    tipo,
    pv,
    bloqueio,
    efeitoDaEssencia,
    resumo,
    leitura,
    conta,
  };
}
