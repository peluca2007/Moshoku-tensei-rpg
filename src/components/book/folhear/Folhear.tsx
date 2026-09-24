"use client";

import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  House,
  Maximize2,
  Minimize2,
  Moon,
  ScrollText,
  Search,
  Sun,
  TableOfContents,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { TocEntry } from "../BookToc";
import { FONTES_DO_LIVRO } from "./fontes";
import {
  type Geometria,
  type Paginacao,
  CAPA,
  ZOOMS,
  ajustarFigurasLargas,
  ajustarTabelasLargas,
  calcularGeometria,
  limparCabecalhosRepetidos,
  medirPaginas,
  numeralDoCapitulo,
  paginaDoElemento,
  primeiroBloco,
  regua,
  repetirCabecalhos,
  rotuloDoCapitulo,
  segurarCaixasCurtas,
} from "./diagramacao";

/**
 * O LIVRO FOLHEADO — o /livro aberto como livro impresso (2026-09-24).
 *
 * ## O que ele é
 *
 * Páginas de tamanho FIXO, em duas colunas, com o papel, a tipografia e as
 * caixas de um livro de RPG impresso — o Livro do Jogador de D&D foi a régua.
 * O livro inteiro é escalado pra caber na tela; quem precisa de letra maior
 * usa o zoom (botões, ou duplo clique na página). A diagramação é a mesma em
 * toda tela, então o número da página também é.
 *
 * ## Quem pagina é o navegador
 *
 * O texto vira colunas CSS aninhadas: as de FORA são as páginas (uma coluna
 * por página, com a altura da mancha), as de DENTRO são as duas colunas de
 * texto de cada página. O navegador parte parágrafo por linha, respeita
 * viúvas, órfãs e `break-*`, e tudo continua HTML vivo: seleção, Ctrl+F,
 * links, teclado, vídeo. O modo contínuo é o mesmo DOM com outra classe.
 *
 * ## O que o JavaScript faz
 *
 * 1. Mede o palco: uma página ou duas, e a escala que cabe.
 * 2. Depois que o navegador diagramou, descobre em que página caiu cada título
 *    — é daí que saem o rodapé e o sumário com número de página.
 * 3. Vira a folha (botão, teclado, roda, deslize, régua) e dá zoom.
 * 4. Guarda o bloco que você lia antes de qualquer recomposição e volta pra ele.
 */

type Modo = "livro" | "continuo";

/*
 * O modo mora no localStorage, que é um sistema externo ao React — por isso
 * `useSyncExternalStore`, igual ao `FontSizeToggle`. A `memoria` é a fonte
 * primária: numa aba anônima o localStorage pode recusar a escrita, e sem ela
 * o botão pararia de funcionar em vez de só deixar de lembrar.
 */
const CHAVE_MODO = "livro-folhear-modo";
const memoria: { modo?: Modo } = {};
const ouvintes = new Set<() => void>();

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function lerModo(): Modo {
  if (memoria.modo) return memoria.modo;
  try {
    const salvo = localStorage.getItem(CHAVE_MODO);
    if (salvo === "livro" || salvo === "continuo") return salvo;
  } catch {
    /* sem armazenamento: vale o padrão da tela */
  }
  // No celular o padrão é o contínuo: uma página de livro inteira numa tela de
  // bolso fica pequena demais, e na mesa o que se faz no telefone é CONSULTAR.
  return window.matchMedia("(min-width: 768px)").matches ? "livro" : "continuo";
}

function gravarModo(m: Modo) {
  memoria.modo = m;
  try {
    localStorage.setItem(CHAVE_MODO, m);
  } catch {
    /* fica só na memória desta aba */
  }
  ouvintes.forEach((o) => o());
}

const DURACAO_VIRADA_MS = 460;

export default function Folhear({ toc, children }: { toc: TocEntry[]; children: ReactNode }) {
  const raiz = useRef<HTMLDivElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const janela = useRef<HTMLDivElement>(null);
  const faixa = useRef<HTMLDivElement>(null);
  const fluxo = useRef<HTMLDivElement>(null);
  const fim = useRef<HTMLSpanElement>(null);
  const botaoIndice = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const modo = useSyncExternalStore<Modo | null>(assinar, lerModo, () => null);

  const [tamanho, setTamanho] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(0);
  const [versao, setVersao] = useState(0);
  const [paginacao, setPaginacao] = useState<Paginacao | null>(null);
  const [dupla, setDupla] = useState(0);
  const [virada, setVirada] = useState<{ dir: "prox" | "ant"; chave: number } | null>(null);
  const [indiceAberto, setIndiceAberto] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);

  const geo = useMemo<Geometria | null>(
    () => (modo === "livro" && tamanho ? calcularGeometria(tamanho.w, tamanho.h) : null),
    [modo, tamanho]
  );
  const porDupla = geo?.porDupla;
  const escalaVisual = geo ? geo.escala * ZOOMS[zoom] : 1;

  /*
   * Refs espelhando o estado, pros ouvintes de janela (teclado, roda) lerem o
   * valor atual sem serem reinstalados a cada página virada.
   */
  const alvo = useRef(0); // a dupla pra onde a leitura está indo: cliques rápidos somam
  const ancora = useRef<Element | null>(null); // o bloco que tem que continuar à vista
  const primeiraVez = useRef(true);
  const focoDoZoom = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const estado = useRef({ geo, paginacao, modo, zoom });
  useLayoutEffect(() => {
    estado.current = { geo, paginacao, modo, zoom };
  });

  const duplas = geo && paginacao ? Math.ceil(paginacao.total / geo.porDupla) : 1;

  /** Guarda o primeiro bloco da leitura atual, antes de qualquer recomposição. */
  const guardarAncora = useCallback(() => {
    const f = fluxo.current;
    const { geo: g, modo: m, paginacao: pg } = estado.current;
    if (!f) return;
    if (m === "livro") {
      // Antes da primeira diagramação não há lugar nenhum pra guardar — e uma
      // âncora "do topo" guardada aqui venceria o link que abriu a página.
      if (!g || !faixa.current || !pg) return;
      const pagina = alvo.current * g.porDupla;
      const r = regua(faixa.current);
      ancora.current = primeiroBloco(f, (el) => paginaDoElemento(el, r, g) >= pagina);
    } else {
      const topo = alturaDoTopo();
      ancora.current = primeiroBloco(f, (el) => el.getBoundingClientRect().bottom > topo);
    }
  }, []);

  // ── Tamanho do palco ────────────────────────────────────────────────────
  useEffect(() => {
    const el = palco.current;
    if (modo !== "livro" || !el) return;
    let ultimo = "";
    const ro = new ResizeObserver(() => {
      const chave = `${el.clientWidth}x${el.clientHeight}`;
      if (chave === ultimo) return;
      ultimo = chave;
      setTamanho({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [modo]);

  // ── Fontes e <details> mudam a diagramação sem mudar o tamanho ─────────
  useEffect(() => {
    if (modo !== "livro") return;
    let vivo = true;
    document.fonts?.ready.then(() => {
      if (!vivo) return;
      guardarAncora();
      setVersao((v) => v + 1);
    });
    const f = fluxo.current;
    const aoAlternar = () => {
      guardarAncora();
      setVersao((v) => v + 1);
    };
    f?.addEventListener("toggle", aoAlternar, true);
    return () => {
      vivo = false;
      f?.removeEventListener("toggle", aoAlternar, true);
    };
  }, [modo, guardarAncora]);

  // Uma ou duas páginas: a PÁGINA é a mesma, a dupla que a contém é que muda.
  // Vem antes da diagramação, que lê o alvo já convertido.
  const porDuplaAnterior = useRef(porDupla);
  useLayoutEffect(() => {
    if (porDuplaAnterior.current && porDupla && porDuplaAnterior.current !== porDupla) {
      alvo.current = Math.floor((alvo.current * porDuplaAnterior.current) / porDupla);
    }
    porDuplaAnterior.current = porDupla;
  }, [porDupla]);

  // ── Diagramar: medir onde cada coisa caiu e voltar ao bloco guardado ───
  // Só a troca de UMA pra DUAS páginas mexe na diagramação; mudar a escala
  // (janela, zoom) não muda nada dentro da página.
  useLayoutEffect(() => {
    const f = fluxo.current;
    const fx = faixa.current;
    const j = janela.current;
    const g = estado.current.geo;
    if (!porDupla || !g || !f || !fx || !j || !fim.current) return;

    ajustarFigurasLargas(f);
    segurarCaixasCurtas(f, g, regua(fx));
    ajustarTabelasLargas(f, g, regua(fx));
    repetirCabecalhos(f);
    const r = regua(fx);
    const p = medirPaginas(f, fim.current, r, g, toc);
    const total = Math.ceil(p.total / porDupla);
    // A faixa cresce aqui mesmo, antes do React pintar: o scroll logo abaixo
    // precisa de largura pra chegar na dupla certa.
    fx.style.width = `${total * porDupla * g.pagina}px`;

    let destino = Math.min(alvo.current, total - 1);
    const guardada = ancora.current;
    ancora.current = null;
    // Na primeira diagramação manda o link (#cap4-6); depois, o bloco guardado.
    const alvoDoLink =
      primeiraVez.current && location.hash
        ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
        : null;
    if (alvoDoLink && f.contains(alvoDoLink)) {
      destino = Math.floor(paginaDoElemento(alvoDoLink, r, g) / porDupla);
      destacar(alvoDoLink);
      // O navegador também "rola até o #": no modo Livro isso desceria a
      // janela do site. Quem mostra a seção aqui é a dupla.
      const aoTopo = () => window.scrollTo({ top: 0, behavior: "instant" });
      aoTopo();
      if (document.readyState !== "complete") window.addEventListener("load", aoTopo, { once: true });
    } else if (guardada && f.contains(guardada)) {
      destino = Math.floor(paginaDoElemento(guardada, r, g) / porDupla);
    }
    primeiraVez.current = false;
    alvo.current = destino;
    j.scrollTo({ left: destino * porDupla * g.pagina, behavior: "instant" });

    // Medir o layout e só então pintar a moldura é exatamente o caso de uso
    // do useLayoutEffect: sem isso o rodapé piscaria errado por um quadro.
    setPaginacao(p);
    setDupla(destino);
  }, [porDupla, versao, toc]);

  // ── Voltar ao contínuo sem perder o lugar ───────────────────────────────
  useLayoutEffect(() => {
    if (modo !== "continuo") return;
    if (fluxo.current) limparCabecalhosRepetidos(fluxo.current);
    const guardada = ancora.current;
    ancora.current = null;
    if (!guardada) return;
    const topo = alturaDoTopo();
    window.scrollTo({ top: window.scrollY + guardada.getBoundingClientRect().top - topo - 16, behavior: "instant" });
  }, [modo]);

  // ── Zoom: o ponto clicado continua embaixo do cursor ───────────────────
  useLayoutEffect(() => {
    const p = palco.current;
    const foco = focoDoZoom.current;
    focoDoZoom.current = null;
    if (!p || !foco) return;
    const livro = p.querySelector<HTMLElement>(".folhear-dimensao");
    if (!livro) return;
    p.scrollLeft = foco.x * livro.offsetWidth - foco.px;
    p.scrollTop = foco.y * livro.offsetHeight - foco.py;
  }, [zoom]);

  const mudarZoom = useCallback((novo: number, ponto?: { clientX: number; clientY: number }) => {
    const n = Math.max(0, Math.min(ZOOMS.length - 1, novo));
    const p = palco.current;
    const livro = p?.querySelector<HTMLElement>(".folhear-dimensao");
    if (p && livro) {
      const pr = p.getBoundingClientRect();
      const lr = livro.getBoundingClientRect();
      const cx = ponto?.clientX ?? pr.left + pr.width / 2;
      const cy = ponto?.clientY ?? pr.top + pr.height / 2;
      focoDoZoom.current = {
        x: (cx - lr.left) / lr.width,
        y: (cy - lr.top) / lr.height,
        px: cx - pr.left,
        py: cy - pr.top,
      };
    }
    setZoom(n);
  }, []);

  // ── Virar ───────────────────────────────────────────────────────────────
  const irPara = useCallback((d: number, animar: boolean) => {
    const { geo: g, paginacao: pg } = estado.current;
    const j = janela.current;
    if (!g || !j) return;
    const ultimo = pg ? Math.ceil(pg.total / g.porDupla) - 1 : 0;
    const destino = Math.max(0, Math.min(ultimo, d));
    const de = alvo.current;
    if (destino === de) return;
    alvo.current = destino;
    const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const folheia = animar && !calmo && Math.abs(destino - de) === 1;
    if (folheia) setVirada({ dir: destino > de ? "prox" : "ant", chave: performance.now() });
    j.scrollTo({ left: destino * g.porDupla * g.pagina, behavior: "instant" });
    setDupla(destino);
  }, []);

  const irParaElemento = useCallback(
    (el: Element) => {
      const { geo: g, modo: m } = estado.current;
      if (m === "livro" && g && faixa.current) {
        irPara(Math.floor(paginaDoElemento(el, regua(faixa.current), g) / g.porDupla), false);
      } else {
        const topo = alturaDoTopo();
        window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - topo - 16, behavior: "smooth" });
      }
      destacar(el);
    },
    [irPara]
  );

  // A janela não rola pela mão (quem vira é o livro), mas o Ctrl+F do
  // navegador rola ela até o trecho achado — aí a dupla se realinha.
  useEffect(() => {
    const j = janela.current;
    if (modo !== "livro" || !j) return;
    let assentar = 0;
    const aoRolar = () => {
      clearTimeout(assentar);
      assentar = window.setTimeout(() => {
        const g = estado.current.geo;
        if (!g) return;
        const largura = g.pagina * g.porDupla;
        const d = Math.round(j.scrollLeft / largura);
        if (j.scrollLeft !== d * largura) j.scrollTo({ left: d * largura, behavior: "instant" });
        alvo.current = d;
        setDupla(d);
      }, 140);
    };
    j.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      j.removeEventListener("scroll", aoRolar);
      clearTimeout(assentar);
    };
  }, [modo]);

  // Ctrl+K no modo Livro: o modal da busca rápida mora dentro do menu do site,
  // que está escondido — abriria invisível e ainda engoliria as setas. Aqui o
  // atalho leva à página de busca, que é o mesmo índice.
  useEffect(() => {
    if (modo !== "livro") return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      e.stopPropagation();
      router.push("/busca");
    };
    window.addEventListener("keydown", aoTeclar, true);
    return () => window.removeEventListener("keydown", aoTeclar, true);
  }, [modo, router]);

  // Teclado: setas e PageUp/PageDown viram; Home/End vão às pontas; +/- dão zoom.
  useEffect(() => {
    if (modo !== "livro") return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable='true']")) return;
      const acao: Record<string, () => void> = {
        ArrowRight: () => irPara(alvo.current + 1, true),
        PageDown: () => irPara(alvo.current + 1, true),
        ArrowLeft: () => irPara(alvo.current - 1, true),
        PageUp: () => irPara(alvo.current - 1, true),
        Home: () => irPara(0, false),
        End: () => irPara(Number.MAX_SAFE_INTEGER, false),
        "+": () => mudarZoom(estado.current.zoom + 1),
        "=": () => mudarZoom(estado.current.zoom + 1),
        "-": () => mudarZoom(estado.current.zoom - 1),
      };
      const fazer = acao[e.key];
      if (!fazer) return;
      e.preventDefault();
      fazer();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [modo, irPara, mudarZoom]);

  // Roda do mouse: sem zoom, um GESTO vira uma folha (a inércia do trackpad
  // manda dezenas de eventos por gesto). Com zoom, a roda passeia pela página.
  useEffect(() => {
    const p = palco.current;
    if (modo !== "livro" || !p) return;
    let gesto = false;
    let fimDoGesto = 0;
    const aoRodar = (e: WheelEvent) => {
      if (e.ctrlKey || estado.current.zoom > 0) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      e.preventDefault();
      if (!gesto && Math.abs(delta) >= 4) {
        gesto = true;
        irPara(alvo.current + (delta > 0 ? 1 : -1), true);
      }
      clearTimeout(fimDoGesto);
      fimDoGesto = window.setTimeout(() => (gesto = false), 220);
    };
    p.addEventListener("wheel", aoRodar, { passive: false });
    return () => {
      p.removeEventListener("wheel", aoRodar);
      clearTimeout(fimDoGesto);
    };
  }, [modo, irPara]);

  // Deslize com o dedo vira a folha (sem zoom; com zoom o dedo passeia).
  const toque = useRef<{ x: number; y: number } | null>(null);
  const aoTocar = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" || zoom > 0) return;
    toque.current = { x: e.clientX, y: e.clientY };
  };
  const aoSoltar = (e: PointerEvent<HTMLDivElement>) => {
    const t = toque.current;
    toque.current = null;
    if (!t) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) irPara(alvo.current + (dx < 0 ? 1 : -1), true);
  };

  // Tela cheia
  useEffect(() => {
    const aoMudar = () => setTelaCheia(document.fullscreenElement === raiz.current);
    document.addEventListener("fullscreenchange", aoMudar);
    return () => document.removeEventListener("fullscreenchange", aoMudar);
  }, []);

  // O índice fecha no Esc e devolve o foco a quem o abriu.
  useEffect(() => {
    if (!indiceAberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setIndiceAberto(false);
      botaoIndice.current?.focus();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [indiceAberto]);

  /** Todo link interno do livro passa por aqui: no modo Livro, âncora vira dupla. */
  const aoClicar = (e: MouseEvent<HTMLDivElement>) => {
    const a = (e.target as Element).closest?.("a[href^='#']");
    if (!a) return;
    const id = decodeURIComponent(a.getAttribute("href")!.slice(1));
    if (!id) return;
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el || !fluxo.current?.contains(el)) {
      // O link aponta pra um capítulo que não está neste volume.
      router.push(`/livro#${id}`);
      return;
    }
    history.replaceState(null, "", `#${id}`);
    setIndiceAberto(false);
    irParaElemento(el);
  };

  const trocarModo = (m: Modo) => {
    if (m === modo) return;
    guardarAncora();
    setPaginacao(null);
    setZoom(0);
    gravarModo(m);
  };

  const alternarTelaCheia = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void raiz.current?.requestFullscreen?.();
  };

  const livro = modo === "livro";
  const pronto = modo === "continuo" || (livro && paginacao !== null);
  const paginaInicial = geo ? dupla * geo.porDupla : 0;
  const rotuloAtual = paginacao?.rotulos[Math.min(paginaInicial + (geo?.porDupla ?? 1) - 1, paginacao.total - 1)];

  const variaveis = geo
    ? ({
        "--pagina": `${geo.pagina}px`,
        "--altura": `${geo.altura}px`,
        "--margem": `${geo.margem}px`,
        "--topo": `${geo.topo}px`,
        "--pe": `${geo.pe}px`,
        "--calha": `${geo.calha}px`,
        "--fonte": `${geo.fonte}px`,
        "--por-dupla": geo.porDupla,
        "--capa": `${CAPA}px`,
      } as CSSProperties)
    : undefined;

  return (
    <div
      ref={raiz}
      className={`folhear livro-shell ${FONTES_DO_LIVRO}`}
      data-modo={modo ?? undefined}
      data-pronto={pronto ? "" : undefined}
      data-zoom={zoom > 0 ? "" : undefined}
      style={variaveis}
      onClick={aoClicar}
    >
      {/*
        A BARRA DO LIVRO. No modo Livro ela substitui o menu do site (que some:
        ver "leitor imersivo" no CSS), então carrega a volta pro site e o tema.
        Lados com a mesma largura, pra posição ficar no centro óptico da mesa.
      */}
      <div className="folhear-barra print-hide">
        <div className="folhear-barra-lado">
          {livro && (
            <>
              <Link href="/" className="folhear-botao inline-flex" aria-label="Voltar ao site" title="Voltar ao site">
                <House className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/busca" className="folhear-botao inline-flex" aria-label="Buscar (Ctrl+K)" title="Buscar — Ctrl+K">
                <Search className="h-4 w-4" aria-hidden />
              </Link>
            </>
          )}
          <button
            ref={botaoIndice}
            type="button"
            className="folhear-botao inline-flex"
            aria-expanded={indiceAberto}
            aria-controls="folhear-indice"
            onClick={() => setIndiceAberto((v) => !v)}
          >
            <TableOfContents className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Índice</span>
          </button>
        </div>

        <div className="folhear-posicao" aria-live="polite">
          {livro && paginacao && geo ? (
            <>
              <span className="folhear-posicao-titulo">
                {rotuloAtual?.secao ?? rotuloAtual?.capitulo ?? "Sumário"}
              </span>
              <span className="folhear-posicao-paginas">
                {geo.porDupla === 2 && paginaInicial + 1 < paginacao.total
                  ? `páginas ${paginaInicial + 1}–${paginaInicial + 2}`
                  : `página ${paginaInicial + 1}`}{" "}
                de {paginacao.total}
              </span>
            </>
          ) : (
            <span className="folhear-posicao-titulo">Leitura contínua</span>
          )}
        </div>

        <div className="folhear-barra-lado justify-end">
          {livro && (
            <>
              <button
                type="button"
                className="folhear-botao inline-flex"
                onClick={() => mudarZoom(zoom - 1)}
                disabled={zoom === 0}
                aria-label="Afastar"
                title="Afastar (−)"
              >
                <ZoomOut className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                className="folhear-botao inline-flex"
                onClick={() => mudarZoom(zoom + 1)}
                disabled={zoom === ZOOMS.length - 1}
                aria-label="Aproximar"
                title="Aproximar (+) — ou duplo clique na página"
              >
                <ZoomIn className="h-4 w-4" aria-hidden />
              </button>
              <BotaoTema />
            </>
          )}
          <div className="folhear-alternador" role="group" aria-label="Modo de leitura">
            <button type="button" aria-pressed={livro} onClick={() => trocarModo("livro")} title="Livro aberto">
              <BookOpenText className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">Livro</span>
            </button>
            <button type="button" aria-pressed={modo === "continuo"} onClick={() => trocarModo("continuo")} title="Leitura contínua">
              <ScrollText className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">Contínuo</span>
            </button>
          </div>
          {livro && (
            <button
              type="button"
              className="folhear-botao hidden sm:inline-flex"
              onClick={alternarTelaCheia}
              aria-label={telaCheia ? "Sair da tela cheia" : "Tela cheia"}
              title={telaCheia ? "Sair da tela cheia" : "Tela cheia"}
            >
              {telaCheia ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
            </button>
          )}
        </div>
      </div>

      {/* ── O índice, com a página de cada seção ──────────────────────── */}
      {indiceAberto && (
        <div className="folhear-indice-fundo print-hide" onClick={() => setIndiceAberto(false)}>
          <aside id="folhear-indice" className="folhear-indice" aria-label="Índice" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-2xs font-bold uppercase tracking-[0.3em] text-gold-700 dark:text-gold-400">Índice</p>
              <button
                type="button"
                className="folhear-botao inline-flex"
                aria-label="Fechar o índice"
                onClick={() => {
                  setIndiceAberto(false);
                  botaoIndice.current?.focus();
                }}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <Sumario toc={toc} paginaDe={livro ? paginacao?.paginaDe : undefined} autoFoco />
          </aside>
        </div>
      )}

      {/* ── A mesa: o livro aberto em cima, as setas dos lados ────────── */}
      <div className="folhear-mesa">
        {livro && (
          <button
            type="button"
            className="folhear-seta print-hide"
            data-lado="ant"
            onClick={() => irPara(alvo.current - 1, true)}
            disabled={dupla === 0}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-8 w-8" aria-hidden />
          </button>
        )}

        <div ref={palco} className="folhear-palco">
          <div
            className="folhear-dimensao"
            style={geo ? { width: geo.larguraDoLivro * escalaVisual, height: geo.alturaDoLivro * escalaVisual } : undefined}
          >
            <div
              className="folhear-livro"
              data-por-dupla={geo?.porDupla}
              style={geo ? { transform: `scale(${escalaVisual})` } : undefined}
              onDoubleClick={(e) => {
                if (!livro || (e.target as Element).closest("a, button, summary, input")) return;
                mudarZoom(zoom > 0 ? 0 : 2, e);
              }}
            >
              <div
                ref={janela}
                className="folhear-janela"
                onPointerDown={aoTocar}
                onPointerUp={aoSoltar}
                onPointerCancel={() => (toque.current = null)}
              >
                <div ref={faixa} className="folhear-faixa">
                  {livro && geo && paginacao && <Folhas geo={geo} paginacao={paginacao} duplas={duplas} />}

                  <div
                    ref={fluxo}
                    className={livro ? "folhear-fluxo sem-escuro" : "folhear-continuo livro-pagina surface"}
                  >
                    <Sumario toc={toc} paginaDe={paginacao?.paginaDe} abertura />
                    {children}
                    <span ref={fim} aria-hidden className="folhear-fim" />
                  </div>
                </div>
              </div>

              {livro && virada && geo && (
                <div
                  key={virada.chave}
                  aria-hidden
                  className="folhear-virada"
                  data-dir={virada.dir}
                  data-unica={geo.porDupla === 1 ? "" : undefined}
                  style={{ "--virada-ms": `${DURACAO_VIRADA_MS}ms` } as CSSProperties}
                  onAnimationEnd={(e) => {
                    if (e.target === e.currentTarget) setVirada(null);
                  }}
                >
                  <div className="folhear-virada-face">
                    <div className="folhear-virada-texto" />
                  </div>
                  <div className="folhear-virada-face" data-verso="">
                    <div className="folhear-virada-texto" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {livro && (
          <button
            type="button"
            className="folhear-seta print-hide"
            data-lado="prox"
            onClick={() => irPara(alvo.current + 1, true)}
            disabled={dupla >= duplas - 1}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-8 w-8" aria-hidden />
          </button>
        )}
      </div>

      {/* ── A régua: folhear rápido até qualquer ponto ─────────────────── */}
      {livro && paginacao && geo && duplas > 1 && (
        <div className="folhear-regua print-hide">
          <input
            type="range"
            min={0}
            max={duplas - 1}
            value={dupla}
            onChange={(e) => irPara(Number(e.target.value), false)}
            aria-label="Folhear até a página"
            aria-valuetext={`Página ${paginaInicial + 1} de ${paginacao.total}`}
          />
        </div>
      )}
    </div>
  );
}

/**
 * As folhas: o papel de cada página e o rodapé — número e o nome da parte,
 * como no livro impresso.
 *
 * Elas moram na mesma faixa do texto e rolam junto: o número da página 12
 * está sempre embaixo do texto da página 12.
 */
function Folhas({ geo, paginacao, duplas }: { geo: Geometria; paginacao: Paginacao; duplas: number }) {
  const total = duplas * geo.porDupla;
  return (
    <div aria-hidden className="folhear-folhas">
      {Array.from({ length: total }, (_, k) => {
        const r = paginacao.rotulos[k];
        const lado = geo.porDupla === 1 ? (k % 2 === 0 ? "dir" : "esq") : k % 2 === 0 ? "esq" : "dir";
        const parte = !r || r.abertura ? "" : (r.capitulo ?? "").replace(" · ", " | ");
        return (
          <div
            key={k}
            className="folhear-folha"
            data-lado={lado}
            data-variante={k % 4}
            style={{ left: k * geo.pagina }}
          >
            {k < paginacao.total && (
              <span className="folhear-rodape">
                <span className="folhear-rodape-numero">{k + 1}</span>
                {parte && <span className="folhear-rodape-parte">{parte}</span>}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * O sumário com número de página — a primeira página do volume, e o índice.
 *
 * No modo contínuo ele some da abertura (página não existe lá) e, no índice,
 * aparece sem números.
 */
function Sumario({
  toc,
  paginaDe,
  abertura = false,
  autoFoco = false,
}: {
  toc: TocEntry[];
  paginaDe?: Record<string, number>;
  abertura?: boolean;
  autoFoco?: boolean;
}) {
  const primeiro = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (autoFoco) primeiro.current?.focus();
  }, [autoFoco]);

  const pagina = (id: string) => (paginaDe && paginaDe[id] !== undefined ? paginaDe[id] + 1 : null);
  return (
    <nav aria-label={abertura ? "Sumário deste volume" : "Índice"} className={abertura ? "folhear-sumario" : "folhear-sumario-lista"}>
      {abertura && (
        <header className="folhear-sumario-topo">
          <p className="folhear-sumario-selo">Sumário</p>
        </header>
      )}
      <ol className="folhear-sumario-capitulos">
        {toc.map((cap, i) => (
          <li key={cap.id}>
            <a ref={i === 0 ? primeiro : undefined} href={`#${cap.id}`} className="folhear-entrada" data-nivel="capitulo">
              <span className="folhear-entrada-numero">{numeralDoCapitulo(cap.label)}</span>
              <span className="folhear-entrada-titulo">{rotuloDoCapitulo(cap.label, false)}</span>
              <span aria-hidden className="folhear-entrada-pontos" />
              <span className="folhear-entrada-pagina">{pagina(cap.id)}</span>
            </a>
            {cap.children && (
              <ol>
                {cap.children.map((s) => {
                  const sub = s.label.startsWith("—");
                  return (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="folhear-entrada" data-nivel={sub ? "sub" : "secao"}>
                        <span className="folhear-entrada-titulo">{sub ? s.label.replace(/^—\s*/, "") : s.label}</span>
                        <span aria-hidden className="folhear-entrada-pontos" />
                        <span className="folhear-entrada-pagina">{pagina(s.id)}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            )}
          </li>
        ))}
      </ol>
      {abertura && (
        <figure aria-hidden className="folhear-sumario-arte">
          {/* eslint-disable-next-line @next/next/no-img-element -- arte impressa no papel, sem otimização de tamanho. */}
          <img src="/faixas/livro.jpg" alt="" width={680} height={384} />
        </figure>
      )}
    </nav>
  );
}

/**
 * O tema, dentro da barra do livro — no modo Livro o menu do site some, e com
 * ele o botão de tema. O papel do livro é sempre papel; o tema muda a mesa.
 */
function BotaoTema() {
  const { resolvedTheme, setTheme } = useTheme();
  const montado = useSyncExternalStore(assinarNada, () => true, () => false);
  if (!montado) return <span className="inline-block h-9 w-9" />;
  const escuro = resolvedTheme === "dark";
  return (
    <button
      type="button"
      className="folhear-botao hidden sm:inline-flex"
      onClick={() => setTheme(escuro ? "light" : "dark")}
      aria-label={escuro ? "Mesa clara" : "Mesa escura"}
      title={escuro ? "Mesa clara" : "Mesa escura"}
    >
      {escuro ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  );
}

function assinarNada() {
  return () => {};
}

/** A altura do que cobre o topo da janela no modo contínuo: o nav e a barra. */
function alturaDoTopo() {
  const barra = document.querySelector(".folhear-barra")?.getBoundingClientRect().bottom ?? 0;
  return Math.max(0, barra);
}

/** O título que você pediu acende por um instante: "é aqui". */
function destacar(el: Element) {
  el.classList.remove("folhear-destaque");
  // Força o reinício da animação quando o mesmo título é pedido duas vezes.
  void (el as HTMLElement).offsetWidth;
  el.classList.add("folhear-destaque");
  window.setTimeout(() => el.classList.remove("folhear-destaque"), 1600);
}
