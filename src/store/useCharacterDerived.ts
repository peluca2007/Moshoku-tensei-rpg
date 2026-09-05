import { useActiveCharacter } from "./useCharacterStore";
import {
  getArmorClass,
  getCurrentCalor,
  getCurrentHp,
  getCurrentMp,
  getCurrentPp,
  getCurrentPt,
  getFinalAttributes,
  getInitiative,
  getMaxCalor,
  getMaxHp,
  getMaxMp,
  getPpPool,
  getPtPool,
} from "./selectors";

/** Hook de conveniência: todos os status derivados da ficha ativa, prontos pra Ficha. */
export function useCharacterDerived() {
  const character = useActiveCharacter();

  return {
    attributes: getFinalAttributes(character),
    maxHp: getMaxHp(character),
    maxMp: getMaxMp(character),
    maxPt: getPtPool(character),
    maxPp: getPpPool(character),
    maxCalor: getMaxCalor(character),
    currentHp: getCurrentHp(character),
    currentMp: getCurrentMp(character),
    currentPt: getCurrentPt(character),
    currentPp: getCurrentPp(character),
    currentCalor: getCurrentCalor(character),
    armorClass: getArmorClass(character),
    initiative: getInitiative(character),
  };
}
