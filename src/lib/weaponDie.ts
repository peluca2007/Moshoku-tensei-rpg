/**
 * Cap. 3, "O Dado de Arma e a Escalada de Maestria": a escada de dados que
 * todo Rank do Corpo sobe, na ordem exata do livro.
 */
export const WEAPON_DIE_LADDER = [
  "d4",
  "d6",
  "d8",
  "d10",
  "d12",
  "2d8",
  "2d10",
  "2d12",
  "3d10",
  "3d12",
  "4d10",
  // Três degraus acrescentados em 2026-08-28 (auditoria de balanceamento). Sem
  // eles a escada terminava no 4d10 e saturava antes do fim da progressão: o
  // Deus da Espada acumula 9 degraus, então um Espadão (d10, 4º degrau) batia
  // no teto já no Rei e a Maestria de Imperador ("Três degraus de Dado de
  // Arma") — o degrau mais caro do livro — não entregava nada. Pior: adaga
  // (d4), espada curta (d6) e espadão (d10) convergiam todos pro mesmo 4d10 no
  // Imperador, e a escolha de arma deixava de existir no rank alto.
  "4d12",
  "5d10",
  "5d12",
] as const;

/**
 * Cap. 3: degrau acima do teto da escada não é perdido — vira dano fixo. Com a
 * escada estendida até 5d12 isso quase nunca dispara em progressão normal (o
 * Deus da Espada, que sobe mais rápido, para no 12º de 13 degraus partindo de
 * um d10), mas talentos que dão degrau avulso (Espada Emprestada, Punho Duplo)
 * ainda podem estourar — e sem esta regra eles viravam PA jogado fora.
 */
export const EXCESS_STEP_DAMAGE = 2;

/** Dados base do Cap. 3, seção "O Dado de Arma", pra preencher o seletor de armas. */
export const WEAPON_PRESETS: { name: string; die: string }[] = [
  { name: "Adaga / Punhal", die: "d4" },
  { name: "Funda / Dardo", die: "d4" },
  { name: "Chicote", die: "d4" },
  { name: "Espada Curta", die: "d6" },
  { name: "Objeto Improvisado", die: "d6" },
  { name: "Arco Curto", die: "d6" },
  { name: "Rapieira", die: "d6" },
  { name: "Espada Longa", die: "d8" },
  { name: "Machado de Batalha", die: "d8" },
  { name: "Arco Longo", die: "d8" },
  { name: "Foice de Guerra", die: "d8" },
  { name: "Espadão / Montante", die: "d10" },
  { name: "Martelo de Guerra", die: "d10" },
  { name: "Alabarda / Lança", die: "d10" },
  { name: "Besta", die: "d10" },
];

/**
 * Sobe `steps` degraus na Escada de Dados a partir de `baseDie`. Nunca desce
 * abaixo do d4 pra graus negativos — a escada é só pra cima. Degraus que
 * passariam do topo (5d12) viram `EXCESS_STEP_DAMAGE` de dano fixo cada, e a
 * fórmula devolvida já sai com esse bônus embutido ("5d12+4") — `diceAverage`,
 * `diceMax` e `rollFormula` todos entendem essa notação, então nenhum ponto de
 * uso precisa saber que houve excedente.
 */
export function escalateWeaponDie(baseDie: string, steps: number): string {
  const index = WEAPON_DIE_LADDER.indexOf(baseDie as (typeof WEAPON_DIE_LADDER)[number]);
  if (index === -1) return baseDie; // dado fora da escada (homebrew) — devolve como está, sem escalar
  const top = WEAPON_DIE_LADDER.length - 1;
  const raw = index + Math.max(0, steps);
  const target = Math.min(top, Math.max(0, raw));
  const excess = Math.max(0, raw - top);
  const die = WEAPON_DIE_LADDER[target];
  return excess > 0 ? `${die}+${excess * EXCESS_STEP_DAMAGE}` : die;
}
