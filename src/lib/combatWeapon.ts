import { grupoDaArma } from "@/data/weaponGroups";
import {
  getFinalAttribute,
  getPenalidadeQuebrantado,
  getTreeAttributeKey,
  getWeaponDamage,
  isProficientWithWeapon,
} from "@/store/selectors";
import { AttributeKey, CharacterData, InventoryItem } from "./types";

/** Contexto único do ataque comum; técnicas de outra árvore têm seu próprio Rank. */
export interface ArmaCombate {
  id: string | null;
  nome: string;
  baseDie: string;
  escalatedDie: string;
  steps: number;
  treeId: string | null;
  attributeKey: AttributeKey;
  attributeValue: number;
  rankBonus: number;
  attackBonus: number;
  /** Só atributo + Rank. Condições são aplicadas pelo motor ao resolver o golpe. */
  damageBonus: number;
  penalidadeQuebrantado: number;
  proficiente: boolean;
  origem: "selecionada" | "equipada" | "referencia";
  aviso?: string;
}

/** A ficha pode conter armas caseiras; só exigimos uma fórmula de dado válida. */
function baseValida(item: InventoryItem): boolean {
  const dado = /^(\d*)d(\d+)(?:[+-]\d+)?$/i.exec(item.baseDie?.replace(/\s/g, "") ?? "");
  return item.type === "arma" && !!dado &&
    Number.isSafeInteger(Number(dado[1] || 1)) && Number(dado[1] || 1) > 0 &&
    Number.isSafeInteger(Number(dado[2])) && Number(dado[2]) > 0;
}

function atributoDaArma(c: CharacterData, item: InventoryItem | undefined, treeId: string | null): AttributeKey {
  // Exceções expressas do Cap. 1 e da maestria do Norte prevalecem sobre
  // o atributo padrão gravado pelo catálogo de armas.
  if (treeId === "deus-da-agua-corpo") return "agilidade";
  if (treeId === "deus-do-norte" || treeId === "cavalaria-e-escudos") return getTreeAttributeKey(c, treeId, "forca");
  if (item?.damageAttribute) return item.damageAttribute;
  if (!item && treeId) return getTreeAttributeKey(c, treeId, "forca");
  // Suishin declara Agilidade como atributo-chave de acerto e contragolpe.
  const grupo = item ? grupoDaArma(item.name) : null;
  const permiteAgilidade = !item || grupo === "laminas-curtas" || grupo === "arcos-e-bestas" || grupo === "arremesso" || grupo === "flexiveis";
  return permiteAgilidade && getFinalAttribute(c, "agilidade") > getFinalAttribute(c, "forca") ? "agilidade" : "forca";
}

/**
 * ID explícito escolhe a arma desse cenário; null escolhe a referência d6.
 * Sem escolha, só uma arma equipada pode ser inferida. Carregar uma arma na
 * mochila nunca autoriza o simulador a empunhá-la por causar mais dano.
 */
export function resolverArmaCombate(c: CharacterData, armaId?: string | null): ArmaCombate {
  const inventario = c.inventory ?? [];
  let item: InventoryItem | undefined;
  let origem: ArmaCombate["origem"] = "referencia";
  let aviso: string | undefined;

  if (typeof armaId === "string") {
    const selecionada = inventario.find((i) => i.id === armaId);
    if (selecionada && baseValida(selecionada)) {
      item = selecionada;
      origem = "selecionada";
    } else {
      aviso = "A arma selecionada não existe ou não tem um dado válido. Usando arma de referência d6.";
    }
  } else if (armaId === null) {
    aviso = "Arma de referência d6 escolhida para este cenário.";
  } else {
    const equipadas = inventario.filter((i) => i.type === "arma" && i.equipped);
    if (equipadas.length === 1 && baseValida(equipadas[0])) {
      item = equipadas[0];
      origem = "equipada";
    } else if (equipadas.length > 1) {
      aviso = "Há mais de uma arma equipada. Escolha a arma do cenário; por enquanto, usando referência d6.";
    } else if (equipadas.length === 1) {
      aviso = "A arma equipada não tem um dado válido. Usando arma de referência d6.";
    } else {
      aviso = "Nenhuma arma equipada. Usando arma de referência d6.";
    }
  }

  // Normalizar 1d6 para d6 permite usar a escada publicada, sem perder NdX.
  const baseDie = (item?.baseDie ?? "d6").replace(/\s/g, "").toLowerCase().replace(/^1d/, "d");
  const referencia = getWeaponDamage(c, baseDie, "forca", item?.name);
  const treeId = referencia?.treeId ?? null;
  const attributeKey = atributoDaArma(c, item, treeId);
  const calculo = getWeaponDamage(c, baseDie, attributeKey, item?.name);
  const attributeValue = getFinalAttribute(c, attributeKey);
  const rankBonus = calculo?.rankBonus ?? 0;

  return {
    id: item?.id ?? null,
    nome: item?.name ?? "Arma de referência (d6)",
    baseDie,
    escalatedDie: calculo?.escalatedDie ?? baseDie,
    steps: calculo?.steps ?? 0,
    treeId,
    attributeKey,
    attributeValue,
    rankBonus,
    attackBonus: attributeValue + rankBonus,
    damageBonus: attributeValue + rankBonus,
    penalidadeQuebrantado: getPenalidadeQuebrantado(c),
    proficiente: item ? isProficientWithWeapon(c, item.name) : true,
    origem,
    aviso,
  };
}
