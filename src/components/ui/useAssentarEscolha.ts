"use client";
import { MOVIMENTO } from "./temposDeMovimento";
import { useCallback, useEffect, useRef } from "react";

/** O cartão entrega a escolha ao resumo antes de dar lugar ao próximo passo. */
export function useAssentarEscolha() {
  const bloco = useRef<HTMLDivElement>(null);
  const ativa = useRef<Animation | null>(null);
  const cancelar = useCallback(() => ativa.current?.cancel(), []);
  useEffect(() => cancelar, [cancelar]);
  const assentar = useCallback(async (continuar: () => void) => {
    if (ativa.current) return;
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)");
    if (bloco.current && !reduzir.matches) {
      const a = bloco.current.animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(.97)", opacity: .7 }], { duration: MOVIMENTO.resposta, easing: MOVIMENTO.curva });
      ativa.current = a;
      const finalizar = () => a.finish();
      reduzir.addEventListener("change", finalizar);
      window.addEventListener("beforeprint", finalizar);
      try { await a.finished; } catch { return; } finally { ativa.current = null; reduzir.removeEventListener("change", finalizar); window.removeEventListener("beforeprint", finalizar); }
    }
    continuar();
  }, []);
  return { bloco, assentar, cancelar };
}
