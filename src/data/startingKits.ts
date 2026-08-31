import { InventoryItem } from "@/lib/types";

export interface StartingKitItem {
  name: string;
  type: InventoryItem["type"];
  description?: string;
  acBonus?: number;
  baseDie?: string;
}

export interface StartingKit {
  /** Bate com `Tree.subgroup` — um kit por subgrupo, não por árvore individual. */
  subgroup: string;
  items: StartingKitItem[];
}

/**
 * Cap. 1, "Equipamento Inicial e a Árvore Inicial": o kit de graça que vem
 * junto do 1º patamar da Árvore Inicial, além do dinheiro do Antecedente.
 */
export const STARTING_KITS: StartingKit[] = [
  {
    subgroup: "Espadachim",
    items: [
      { name: "Espada Longa", type: "arma", baseDie: "d8" },
      { name: "Roupas de viagem resistentes", type: "geral" },
    ],
  },
  {
    subgroup: "Guerreiro / Parrudice",
    items: [{ name: "Machado de Batalha", type: "arma", baseDie: "d8" }],
  },
  {
    subgroup: "Tank / Defensor",
    // 2026-08-30: nerf — Armadura Média (+3 CA) caiu pra Armadura Leve (+1 CA).
    // O Escudeiro já ganha +1 CA da Maestria "Interpor" no Principiante, então
    // um Principiante de Agilidade 0 com escudo + armadura leve fica em
    // CA 12, não CA 14 — uma diferença pequena em número, grande em chance
    // de ser acertado. O investimento real em CA virou escolha consciente:
    // pra subir, ou compra armadura média, ou compra talento (Dois Escudos
    // no Intermediário, Escudo Robusto no Principiante), ou espera a
    // Maestria de rank superior.
    items: [
      { name: "Escudo", type: "armadura", acBonus: 2 },
      { name: "Espada Curta", type: "arma", baseDie: "d6" },
      { name: "Armadura Leve", type: "armadura", acBonus: 1 },
    ],
  },
  {
    subgroup: "Arqueiro",
    items: [
      { name: "Arco Curto", type: "arma", baseDie: "d6", description: "20 flechas inclusas." },
      { name: "Adaga reserva", type: "arma", baseDie: "d4" },
    ],
  },
  {
    subgroup: "Magia Ofensiva",
    items: [
      { name: "Cajado / Foco Arcano", type: "arma", baseDie: "d6", description: "Conta como objeto improvisado corpo a corpo." },
      { name: "Grimório básico", type: "geral" },
      { name: "Roupas de viajante", type: "geral" },
    ],
  },
  {
    subgroup: "Cura e Suporte",
    items: [
      { name: "Kit de cura", type: "geral", description: "Bandagens, ervas, um frasco vazio." },
      { name: "Símbolo do templo de origem", type: "geral" },
      { name: "Cajado leve", type: "arma", baseDie: "d6" },
    ],
  },
  {
    subgroup: "Invocação",
    items: [
      { name: "Giz e tinta ritual", type: "geral", description: "Material pra três círculos." },
      { name: "Adaga", type: "arma", baseDie: "d4" },
    ],
  },
  {
    subgroup: "Batedor e Ladrão",
    items: [
      { name: "Adaga", type: "arma", baseDie: "d4" },
      { name: "Adaga reserva", type: "arma", baseDie: "d4" },
      { name: "Kit de arrombamento", type: "geral" },
      { name: "Roupas escuras", type: "geral" },
    ],
  },
  {
    subgroup: "Bardo",
    items: [
      { name: "Instrumento musical", type: "geral", description: "Escolha o instrumento." },
      { name: "Adaga", type: "arma", baseDie: "d4" },
    ],
  },
  {
    subgroup: "Sobrevivência e Táticas",
    items: [
      { name: "Kit de sobrevivência", type: "geral", description: "Corda, mapa em branco, uma semana de provisões." },
      { name: "Arma simples", type: "arma", baseDie: "d6", description: "Escolha qual." },
    ],
  },
];

export function getStartingKit(subgroup: string): StartingKit | undefined {
  return STARTING_KITS.find((k) => k.subgroup === subgroup);
}
