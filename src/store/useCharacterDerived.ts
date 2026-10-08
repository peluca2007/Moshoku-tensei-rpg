import { useActiveCharacter } from "./useCharacterStore";
import { getPvNaMesa, hpAtualNaMesa } from "@/lib/mesa";
import {
  getArmorClass,
  getDeslocamento,
  getCurrentMp,
  getCurrentPp,
  getCurrentPt,
  getFinalAttributes,
  getInitiative,
  getMaxMp,
  getPpPool,
  getPtPool,
} from "./selectors";

/** Hook de conveniência: todos os status derivados da ficha ativa, prontos pra Ficha. */
export function useCharacterDerived() {
  const character = useActiveCharacter();

  return {
    attributes: getFinalAttributes(character),
    maxHp: getPvNaMesa(character),
    maxMp: getMaxMp(character),
    maxPt: getPtPool(character),
    maxPp: getPpPool(character),
    currentHp: hpAtualNaMesa(character),
    currentMp: getCurrentMp(character),
    currentPt: getCurrentPt(character),
    currentPp: getCurrentPp(character),
    armorClass: getArmorClass(character),
    deslocamento: getDeslocamento(character),
    initiative: getInitiative(character),
  };
}
