import { WeaponGroupId } from "@/data/weaponGroups";

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
const EXCESS_STEP_DAMAGE = 2;

/**
 * Dados base do Cap. 3, seção "O Dado de Arma", pra preencher o seletor de armas.
 *
 * Cada preset declara o **grupo de proficiência** ao qual pertence (Cap. 1, §4 —
 * ver `src/data/weaponGroups.ts`). Até 0.1.51 não declarava: proficiência de
 * arma era uma faixa de dano ("até d6 é livre"), e por isso a Rapieira (d6) era
 * livre pra todo mundo enquanto a Espada Longa (d8) não — o mesmo ofício, dois
 * tratamentos, decididos pelo tamanho do dado.
 *
 * As seis armas acrescentadas em 0.1.52 (Katana, Machadinha, Cajado de Combate,
 * Azagaia, Faca de Arremesso, Corrente de Combate) existem porque quatro dos
 * oito grupos ficariam com uma única arma dentro. Grupo com uma arma só não é
 * grupo: é a arma com um nome comprido. Elas entram na loja automaticamente,
 * com o preço que o dado delas define.
 */
export const WEAPON_PRESETS: { name: string; die: string; group: WeaponGroupId }[] = [
  // --- Lâminas Curtas
  { name: "Adaga / Punhal", die: "d4", group: "laminas-curtas" },
  { name: "Faca de Arremesso", die: "d4", group: "laminas-curtas" },

  // --- Espadas
  { name: "Espada Curta", die: "d6", group: "espadas" },
  { name: "Rapieira", die: "d6", group: "espadas" },
  { name: "Espada Longa", die: "d8", group: "espadas" },
  { name: "Katana", die: "d8", group: "espadas" },
  { name: "Espadão / Montante", die: "d10", group: "espadas" },

  // --- Machados e Marretas
  { name: "Machadinha", die: "d6", group: "machados-e-marretas" },
  { name: "Machado de Batalha", die: "d8", group: "machados-e-marretas" },
  { name: "Foice de Guerra", die: "d8", group: "machados-e-marretas" },
  { name: "Martelo de Guerra", die: "d10", group: "machados-e-marretas" },

  // --- Hastes
  { name: "Cajado de Combate", die: "d6", group: "hastes" },
  { name: "Alabarda / Lança", die: "d10", group: "hastes" },

  // --- Arcos e Bestas
  { name: "Arco Curto", die: "d6", group: "arcos-e-bestas" },
  { name: "Arco Longo", die: "d8", group: "arcos-e-bestas" },
  { name: "Besta", die: "d10", group: "arcos-e-bestas" },

  // --- Arremesso
  { name: "Funda / Dardo", die: "d4", group: "arremesso" },
  { name: "Azagaia", die: "d6", group: "arremesso" },

  // --- Flexíveis
  { name: "Chicote", die: "d4", group: "flexiveis" },
  { name: "Corrente de Combate", die: "d6", group: "flexiveis" },

  // --- Desarmado e Improvisado
  { name: "Objeto Improvisado", die: "d6", group: "desarmado-e-improvisado" },
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
