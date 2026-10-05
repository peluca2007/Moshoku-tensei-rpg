"use client";
import { useEffect, useRef } from "react";

/** O leitor de tela recebe o valor final; os quadros intermediários são só visuais. */
export default function NumeroAnimado({ valor, sufixo = "" }: { valor: number; sufixo?: string }) {
  const numero = useRef<HTMLSpanElement>(null);
  const anterior = useRef(valor);
  useEffect(() => {
    const el = numero.current;
    const de = anterior.current;
    anterior.current = valor;
    if (!el || de === valor) return;
    const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
    let quadro = 0;
    const r = el.getBoundingClientRect();
    const animacao = !reduzido.matches && r.bottom >= 0 && r.top <= innerHeight
      ? el.animate([{ opacity: .7, transform: `translateY(${valor < de ? -4 : 4}px)` }, { opacity: 1, transform: "translateY(0)" }], { duration: 180, easing: "ease-out" }) : undefined;
    const finalizar = () => { cancelAnimationFrame(quadro); animacao?.cancel(); el.textContent = `${valor}${sufixo}`; };
    if (!animacao) { finalizar(); return; }
    const io = new IntersectionObserver((entradas) => { if (!entradas[0].isIntersecting) finalizar(); });
    io.observe(el);
    const inicio = performance.now();
    const pintar = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / 320);
      el.textContent = `${Math.round(de + (valor - de) * (1 - (1 - t) ** 3))}${sufixo}`;
      if (t < 1) quadro = requestAnimationFrame(pintar);
    };
    quadro = requestAnimationFrame(pintar);
    reduzido.addEventListener("change", finalizar);
    window.addEventListener("beforeprint", finalizar);
    return () => { io.disconnect(); finalizar(); reduzido.removeEventListener("change", finalizar); window.removeEventListener("beforeprint", finalizar); };
  }, [valor, sufixo]);
  return <><span ref={numero} aria-hidden="true" className="inline-block tabular-nums">{valor}{sufixo}</span><span className="sr-only">{valor}{sufixo}</span></>;
}
