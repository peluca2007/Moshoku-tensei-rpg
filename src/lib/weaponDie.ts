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
] as const;

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
 * Sobe `steps` degraus na Escada de Dados a partir de `baseDie`. Além do
 * teto do 4d10 (não existe degrau acima dele), também não desce abaixo do
 * d4 pra graus negativos — a escada é só pra cima.
 */
export function escalateWeaponDie(baseDie: string, steps: number): string {
  const index = WEAPON_DIE_LADDER.indexOf(baseDie as (typeof WEAPON_DIE_LADDER)[number]);
  if (index === -1) return baseDie; // dado fora da escada (homebrew) — devolve como está, sem escalar
  const target = Math.min(WEAPON_DIE_LADDER.length - 1, Math.max(0, index + Math.max(0, steps)));
  return WEAPON_DIE_LADDER[target];
}
