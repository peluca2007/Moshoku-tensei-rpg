"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { canPurchaseAbility } from "@/store/selectors";
import { AbilityDef, CharacterData, RankName, TalentDef } from "@/lib/types";
import { CastingBreakdown, IncantationBlock } from "@/components/AbilityDetail";
import { rotuloDeAcoes } from "@/lib/rotuloDeAcoes";

/**
 * O cartão de uma habilidade comprável — e a ÚNICA porta de compra da tela de
 * árvores (0.1.43).
 *
 * Ele morava dentro do `DestinyBoard`, e saiu de lá quando a navegação em lista
 * pro celular nasceu. Duas telas que compram a mesma habilidade por dois
 * caminhos diferentes divergem em silêncio — e o que divergiria aqui é
 * justamente o que o jogador não pode ver errado: o custo em PA, o motivo de o
 * botão estar desligado, e o texto que o `check:texto` verifica.
 */
export default function AbilityListItem({
  character,
  treeId,
  rank,
  kind,
  def,
  showToast,
}: {
  character: CharacterData;
  treeId: string;
  rank: RankName;
  kind: "ability" | "talent";
  def: AbilityDef | TalentDef;
  showToast: (msg: string, type?: "info" | "success" | "warning") => void;
}) {
  const owned = character.purchasedAbilities.some((a) => a.treeId === treeId && a.id === def.id);
  const check = canPurchaseAbility(character, treeId, rank, kind, def.id);
  const ability = kind === "ability" ? (def as AbilityDef) : undefined;
  const talent = kind === "talent" ? (def as TalentDef) : undefined;

  const actionLabel = ability
    ? ability.reaction
      ? "1 Reação"
      : ability.actions.normal === 0
        ? "Passivo"
        : rotuloDeAcoes(ability.actions.normal)
    : undefined;

  return (
    <motion.div
      className="rounded-lg border border-parchment-300 bg-parchment-100/80 p-3 dark:border-parchment-800 dark:bg-parchment-950/50"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-parchment-900 dark:text-parchment-50">
          {ability?.signature && "◆ "}{def.name}
        </span>
        {owned && <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
      </div>
      <p className="text-xs text-parchment-600 dark:text-parchment-400 mb-2">
        {kind === "ability" ? "Habilidade" : "Talento"} · {def.paCost} PA
        {ability &&
          ` · ${ability.pmCost !== undefined ? `${ability.pmCost} PM · ` : ""}${
            ability.ptCost !== undefined ? `${ability.ptCost} PT · ` : ""
          }${ability.ppCost !== undefined ? `${ability.ppCost} PP · ` : ""}${ability.range} · ${actionLabel}`}
      </p>
      {ability ? (
        <>
          <p className="text-xs text-parchment-600 dark:text-parchment-300 mb-2">
            {ability.damage?.normal && <span className="font-medium">{ability.damage.normal}. </span>}
            {ability.effect}
          </p>
          <CastingBreakdown ability={ability} />
          <IncantationBlock ability={ability} rank={rank} />
        </>
      ) : (
        <p className="text-xs text-parchment-600 dark:text-parchment-300">{talent?.description}</p>
      )}
      {!owned && (
        <motion.button
          type="button"
          disabled={!check.ok}
          onClick={() => {
            useCharacterStore.getState().purchaseAbility({ treeId, rank, kind, id: def.id });
            showToast(`${def.name} comprado!`, "success");
          }}
          // Ver o mesmo cuidado na Loja: "Comprar (2 PA)" repetido dezenas de
          // vezes não diz a quem só ouve O QUE está sendo comprado.
          aria-label={`Comprar ${def.name} por ${def.paCost} PA`}
          className="mt-2 w-full rounded-lg bg-wine-600 px-2 py-1.5 text-xs font-semibold text-white transition-colors enabled:hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-40"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Comprar ({def.paCost} PA)
        </motion.button>
      )}
      {!check.ok && check.reason && <p className="mt-1 text-2xs text-rose-500">{check.reason}</p>}
    </motion.div>
  );
}
