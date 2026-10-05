import { identidadeVisualDaArvore } from "@/data/identidadeDasArvores";

/** Só começa depois da diagramação. WAAPI não escreve atributos nem altera o diário. */
export function observarAberturas(fluxo: HTMLElement, raiz: HTMLElement | null, vistas: WeakSet<Element>) {
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
  const ativos = new Map<Element, Animation[]>();
  const motivos = new Set<HTMLElement>();
  const cancelar = () => {
    ativos.forEach((animacoes) => animacoes.forEach((a) => a.cancel()));
    ativos.clear();
    motivos.forEach((el) => el.remove());
    motivos.clear();
  };
  const io = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      const el = entrada.target as HTMLElement;
      if (!entrada.isIntersecting) {
        ativos.get(el)?.forEach((a) => a.cancel());
        ativos.delete(el);
        continue;
      }
      if (vistas.has(el)) continue;
      vistas.add(el);
      if (reduzido.matches || typeof el.animate !== "function") continue;
      const livro = document.documentElement.classList.contains("tema-livro");
      const deslocamento = livro ? 8 : 5;
      const animacoes: Animation[] = [];
      if (el.matches(".livro-abertura")) {
        const partes = [".livro-abertura-arte", ":scope > p:first-of-type", "h2", ".rule-ornate"];
        partes.forEach((seletor, i) => {
          const parte = el.querySelector<HTMLElement>(seletor);
          if (parte) animacoes.push(parte.animate([
            { opacity: .6, transform: `translateY(${deslocamento}px)` },
            { opacity: 1, transform: "translateY(0)" },
          ], { duration: 360, delay: i * 90, easing: "cubic-bezier(.2,.7,.2,1)" }));
        });
      } else {
        const arvore = el.closest<HTMLElement>("[data-arvore]");
        const identidade = identidadeVisualDaArvore(arvore?.dataset.arvore ?? "");
        // O selo e o motivo da borda já pertencem ao livro; só revelamos essa tinta.
        if (identidade) {
          const tipo = arvore?.dataset.arvore;
          const transform = tipo === "agua" ? "translateX(-8px)" : tipo === "teorica" ? "rotate(-12deg) scale(.9)" : arvore?.dataset.categoria === "corpo" ? "scaleX(.8)" : "translateY(5px)";
          if (typeof KeyframeEffect !== "undefined" && "pseudoElement" in KeyframeEffect.prototype) {
            animacoes.push(el.animate([
              { opacity: .25, transform }, { opacity: 1, transform: "none" },
            ], { pseudoElement: "::before", duration: 440, easing: "ease-out" }));
          }
          const r = el.getBoundingClientRect();
          const motivo = document.createElement("div");
          motivo.setAttribute("aria-hidden", "true");
          Object.assign(motivo.style, { position: "fixed", pointerEvents: "none", zIndex: "40", left: `${r.left}px`, top: `${r.top}px`, width: `${Math.min(r.width, 150)}px`, height: `${Math.min(r.height, 90)}px`, color: document.documentElement.classList.contains("dark") ? identidade.corNoite : identidade.corDia, opacity: "0" });
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("viewBox", "0 0 150 90");
          svg.setAttribute("width", "100%");
          svg.setAttribute("height", "100%");
          const desenho = document.createElementNS(svg.namespaceURI, "path");
          desenho.setAttribute("d", tipo === "agua" ? "M4 52 Q20 26 36 52 T68 52 T100 52 M4 65 Q20 39 36 65 T68 65 T100 65" : tipo === "fogo" ? "M10 78 Q0 58 24 34 Q20 56 38 48 Q42 20 55 8 Q52 42 68 54 Q80 74 58 84" : tipo === "teorica" ? "M80 45 A34 34 0 1 1 12 45 A34 34 0 1 1 80 45 M70 45 A24 24 0 1 0 22 45 A24 24 0 1 0 70 45" : arvore?.dataset.categoria === "corpo" ? "M8 78 L95 12 M25 82 L108 16" : "M8 65 Q45 8 90 65");
          desenho.setAttribute("fill", "none");
          desenho.setAttribute("stroke", "currentColor");
          desenho.setAttribute("stroke-width", "2");
          svg.append(desenho);
          motivo.append(svg);
          document.body.append(motivo);
          motivos.add(motivo);
          animacoes.push(motivo.animate([{ opacity: 0, transform: "translateX(-6px) scale(.94)" }, { opacity: livro ? .8 : .48, transform: "translateX(0) scale(1)", offset: .45 }, { opacity: 0, transform: "translateX(0) scale(1)" }], { duration: 440, easing: "ease-out" }));
          void Promise.allSettled(animacoes.map((a) => a.finished)).then(() => { motivo.remove(); motivos.delete(motivo); });
        }
      }
      ativos.set(el, animacoes);
      Promise.allSettled(animacoes.map((a) => a.finished)).then(() => ativos.delete(el));
    }
  }, { root: raiz, threshold: .12 });
  fluxo.querySelectorAll(".livro-abertura, .livro-arvore-cabeca").forEach((el) => io.observe(el));
  const aoReduzir = () => { if (reduzido.matches) cancelar(); };
  const aoImprimir = () => cancelar();
  reduzido.addEventListener("change", aoReduzir);
  window.addEventListener("beforeprint", aoImprimir);
  return () => {
    io.disconnect();
    cancelar();
    reduzido.removeEventListener("change", aoReduzir);
    window.removeEventListener("beforeprint", aoImprimir);
  };
}
