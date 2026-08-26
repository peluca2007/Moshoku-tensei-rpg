import { useActiveCharacter } from "./useCharacterStore";
import { getArmorClass, getFinalAttributes, getInitiative, getMaxHp, getMaxMp, getPpPool, getPtPool } from "./selectors";

/** Hook de conveniência: todos os status derivados da ficha ativa, prontos pra Ficha. */
export function useCharacterDerived() {
  const character = useActiveCharacter();

  return {
    attributes: getFinalAttributes(character),
    maxHp: getMaxHp(character),
    maxMp: getMaxMp(character),
    maxPt: getPtPool(character),
    maxPp: getPpPool(character),
    armorClass: getArmorClass(character),
    initiative: getInitiative(character),
  };
}
