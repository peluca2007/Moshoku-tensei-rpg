"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Um número que CONTA até o novo valor em vez de saltar (0.1.6).
 *
 * Gastar PO na loja e PA nas árvores é o único jeito de progredir neste sistema,
 * e até aqui o instante da compra não tinha instante nenhum: o "150 PO" virava
 * "85 PO" entre um quadro e outro, e nada na tela dizia que você acabou de
 * gastar 65. Contando, o gasto vira um evento — e a direção da contagem já diz
 * se você ganhou ou perdeu, sem precisar de um sinal.
 *
 * A animação é de DURAÇÃO FIXA, não de passo fixo: ir de 0 a 6 e de 0 a 3.400
 * leva os mesmos 420 ms. Passo fixo faria o primeiro caso piscar e o segundo
 * demorar meio minuto.
 *
 * O primeiro render nunca anima. Ele é o valor que já estava lá quando a página
 * abriu — contar do zero até ele na chegada seria contar uma compra que não
 * aconteceu.
 */
const DURACAO_MS = 420;

export default function CountingNumber({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const [exibido, setExibido] = useState(value);
  const anteriorRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const de = anteriorRef.current;
    anteriorRef.current = value;
    if (de === value) return;

    // Salto pequeno (um PA, um PV) não ganha rampa: a contagem de 3 a 4 em 420ms
    // lê como travamento, não como animação.
    if (Math.abs(value - de) <= 2) {
      setExibido(value);
      return;
    }

    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / DURACAO_MS);
      // easeOutCubic: começa rápido e assenta no valor — o contrário faria o
      // número parecer estar "carregando".
      const eased = 1 - Math.pow(1 - t, 3);
      setExibido(Math.round(de + (value - de) * eased));
      if (t < 1) frameRef.current = requestAnimationFrame(passo);
    };
    frameRef.current = requestAnimationFrame(passo);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return <span className={`tabular ${className}`}>{exibido}</span>;
}
