"use client";

import { useEffect } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useInitiativeStore } from "@/store/useInitiativeStore";
import { useMacroStore } from "@/store/useMacroStore";

/**
 * A store usa skipHydration (persist não lê o localStorage sozinho) pra
 * evitar mismatch de SSR: o primeiro render do cliente precisa bater com o
 * HTML vazio do servidor. Isso reidrata explicitamente depois do mount, e só
 * então garante que existe uma ficha ativa (criando uma em branco se for a
 * primeira visita).
 */
export default function StoreHydration() {
  useEffect(() => {
    useCharacterStore.persist.rehydrate()?.then(() => {
      useCharacterStore.getState().ensureActiveCharacter();
    });
    useInitiativeStore.persist.rehydrate();
    useMacroStore.persist.rehydrate();
  }, []);

  return null;
}
