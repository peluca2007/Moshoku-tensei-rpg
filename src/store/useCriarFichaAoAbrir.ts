"use client";

import { useEffect, useRef } from "react";
import { useCharacterStore } from "./useCharacterStore";

/**
 * Cria a ficha nova das três vias de criação (guia, roleta, entrevista) — mas
 * só DEPOIS de o roster sair do localStorage.
 *
 * O roster usa `skipHydration` (ver `StoreHydration`), e o efeito da página
 * roda antes do efeito que reidrata. Criando direto, a ficha nova caía numa
 * store ainda vazia, o `persist` gravava esse roster de uma ficha só por cima
 * do salvo, e a reidratação lia de volta só ela: abrir /criar/manual por link,
 * F5 ou atalho do celular APAGAVA todas as fichas do jogador (achado em
 * 2026-09-27, antes de uma sessão). Navegando pelo menu não acontecia, porque
 * a store já estava reidratada — por isso passou tanto tempo sem ninguém ver.
 */
export function useCriarFichaAoAbrir() {
  const criou = useRef(false);
  useEffect(() => {
    const criar = () => {
      if (criou.current) return;
      criou.current = true;
      useCharacterStore.getState().createCharacter();
    };
    if (useCharacterStore.persist.hasHydrated()) {
      criar();
      return;
    }
    return useCharacterStore.persist.onFinishHydration(criar);
  }, []);
}
