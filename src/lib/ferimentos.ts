import { getBackgroundById } from "@/data/backgrounds";
import { getRaceById } from "@/data/races";
import { getFinalAttribute, getTreeGrantedSkills } from "@/store/selectors";
import { CharacterData, InventoryItem, RANK_BONUS } from "./types";

export function temMedicina(c: CharacterData): boolean {
  return [...c.skills, ...getTreeGrantedSkills(c), ...(getRaceById(c.raceId)?.fixedSkills ?? []),
    ...(getBackgroundById(c.backgroundId)?.fixedSkills ?? [])].includes("Medicina");
}

export function ehKitDeSocorros(item: InventoryItem): boolean {
  return item.name.trim().toLocaleLowerCase("pt-BR") === "kit de primeiros socorros";
}

export function usosDoKit(item: InventoryItem): number {
  return Math.max(0, Math.min(10, Math.floor(Number(item.tratamentosUsados) || 0)));
}

export function pvDoTratamento(c: CharacterData): number {
  const rank = Math.max(1, ...c.unlockedRanks.map(r => RANK_BONUS[r.rank]));
  return Math.max(1, getFinalAttribute(c, "vigor") + 2 * rank);
}
