"use client";

import { useState } from "react";
import { randomSpinVariance, SpinVariance } from "@/components/RouletteWheel";

/** Regra da Roleta do Destino: só 3 giros por roleta — depois disso o resultado atual fica valendo. */
export const WHEEL_MAX_ATTEMPTS = 3;

/** Estado de uma roleta (raça OU antecedente) — extraído pra hook pra não duplicar entre as duas. */
export function useWheelSpin(roll: () => string) {
  const [attempts, setAttempts] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spinToken, setSpinToken] = useState(0);
  const [pending, setPending] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [spinVariance, setSpinVariance] = useState<SpinVariance>({ jitterUnit: 0, extraSpins: 5 });

  const canSpin = attempts < WHEEL_MAX_ATTEMPTS && !spinning;

  function spin() {
    if (!canSpin) return;
    setPending(roll());
    setSpinVariance(randomSpinVariance());
    setSpinning(true);
    setSpinToken((t) => t + 1);
    setAttempts((a) => a + 1);
  }

  function handleSettle() {
    setResult(pending);
    setSpinning(false);
  }

  return { attempts, canSpin, spinning, spinToken, targetId: pending, spinVariance, result, spin, handleSettle };
}
