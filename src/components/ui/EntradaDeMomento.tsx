"use client";
import { MOVIMENTO } from "./temposDeMovimento";
import { useEffect, useRef, type ReactNode } from "react";

export default function EntradaDeMomento({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    let animacao: Animation | undefined;
    const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
    const cancelar = () => animacao?.cancel();
    const io = new IntersectionObserver((entradas) => {
      if (!entradas[0].isIntersecting) { cancelar(); return; }
      io.disconnect();
      if (!reduzido.matches) animacao = ref.current?.animate([{ opacity: .55, transform: "scale(.985) translateY(5px)" }, { opacity: 1, transform: "scale(1) translateY(0)" }], { duration: MOVIMENTO.entrada, easing: MOVIMENTO.curva });
    }, { threshold: .15 });
    io.observe(ref.current);
    reduzido.addEventListener("change", cancelar);
    window.addEventListener("beforeprint", cancelar);
    return () => { io.disconnect(); cancelar(); reduzido.removeEventListener("change", cancelar); window.removeEventListener("beforeprint", cancelar); };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
