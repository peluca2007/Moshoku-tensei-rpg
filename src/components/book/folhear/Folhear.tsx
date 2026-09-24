"use client";

import {
  type CSSProperties,
  type MouseEvent,
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
  AArrowDown,
  AArrowUp,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  House,
  Minimize2,
  Moon,
  ScrollText,
  Search,
  Sun,
  TableOfContents,
  X,
} from "lucide-react";
import type { TocEntry } from "../BookToc";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  type Geometria,
  type Paginacao,
  ESCALAS,
  calcularGeometria,
  medirPaginas,
  paginaDoElemento,
  primeiroBloco,
  rotuloDoCapitulo,
  numeralDoCapitulo,
  segurarCaixasCurtas,
  repetirCabecalhos,
  limparCabecalhosRepetidos,
  ajustarTabelasLargas,
} from "./diagramacao";

/**
 * O LIVRO FOLHEADO — o /livro aberto em duas páginas (2026-09-24).
 *
 * ## A decisão que sustenta tudo: quem pagina é o navegador
 *
 * O livro inteiro vira UMA caixa de colunas CSS com a altura de uma página, e
 * as colunas que não cabem transbordam pra direita. Cada coluna é uma página;
 * a janela mostra duas por vez e rola na horizontal, encaixando de dupla em
 * dupla. É o truque de todo leitor de ebook na web, e ele dá de graça tudo que
 * um paginador escrito à mão teria que reinventar: parágrafo partido por linha,
 * viúvas e órfãs, título que não fica sozinho no pé, Ctrl+F, seleção de texto,
 * foco por teclado e link que funciona.
 *
 * O texto continua sendo o mesmo DOM do modo contínuo — os capítulos chegam
 * como `children`, renderizados no servidor. Trocar de modo troca só classe e
 * CSS; nada é desmontado, e é por isso que dá pra alternar no meio da leitura
 * sem perder o lugar.
 *
 * ## O que o JavaScript faz, e só isso
 *
 * 1. Mede o palco e escolhe a geometria (uma ou duas páginas, largura, corpo).
 * 2. Depois que o navegador diagramou, descobre em que página caiu cada título
 *    — é daí que saem cabeçalho corrente, fólio e o sumário com página.
 * 3. Vira a folha: botão, seta do teclado, roda do mouse, canto da página.
 * 4. Guarda o bloco que você estava lendo antes de qualquer recomposição
 *    (janela, letra, modo) e volta pra ele depois. A página não é endereço:
 *    muda com a tela. O endereço é o bloco.
 */

type Modo = "livro" | "continuo";

/*
 * As preferências (modo e tamanho da letra) moram no localStorage, que é um
 * sistema externo ao React — por isso `useSyncExternalStore`, igual ao
 * `FontSizeToggle`. A `memoria` é a fonte primária: numa aba anônima o
 * localStorage pode recusar a escrita, e sem ela o botão pararia de funcionar
 * em vez de só deixar de lembrar.
 */
const CHAVE_MODO = "livro-folhear-modo";
const CHAVE_ESCALA = "livro-folhear-escala";
const memoria: { modo?: Modo; escala?: number } = {};
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
  // No celular o padrão é o contínuo: uma página de livro num telefone é uma
  // tira estreita, e na mesa o que se faz no telefone é CONSULTAR.
  return window.matchMedia("(min-width: 768px)").matches ? "livro" : "continuo";
}

function lerEscala(): number {
  if (memoria.escala) return memoria.escala;
  try {
    const salvo = Number(localStorage.getItem(CHAVE_ESCALA));
    if (ESCALAS.includes(salvo)) return salvo;
  } catch {
    /* idem */
  }
  return 1;
}

function gravar(chave: string, valor: string) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    /* fica só na memória desta aba */
  }
  ouvintes.forEach((o) => o());
}

const DURACAO_VIRADA_MS = 420;

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
  const escala = useSyncExternalStore(assinar, lerEscala, () => 1);

  const [tamanho, setTamanho] = useState<{ w: number; h: number; raiz: number } | null>(null);
  const [versao, setVersao] = useState(0);
  const [paginacao, setPaginacao] = useState<Paginacao | null>(null);
  const [dupla, setDupla] = useState(0);
  const [virada, setVirada] = useState<{ dir: "prox" | "ant"; chave: number } | null>(null);
  const [indiceAberto, setIndiceAberto] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);

  const geo = useMemo<Geometria | null>(
    () => (modo === "livro" && tamanho ? calcularGeometria(tamanho.w, tamanho.h, escala, tamanho.raiz) : null),
    [modo, tamanho, escala]
  );

  /*
   * Refs espelhando o estado, pros ouvintes de janela (teclado, roda) lerem o
   * valor atual sem serem reinstalados a cada página virada.
   */
  const alvo = useRef(0); // a dupla pra onde a leitura está indo: cliques rápidos somam
  const ancora = useRef<Element | null>(null); // o bloco que tem que continuar à vista
  const primeiraVez = useRef(true);
  const estado = useRef({ geo, paginacao, modo });
  useLayoutEffect(() => {
    estado.current = { geo, paginacao, modo };
  });

  const duplas = geo && paginacao ? Math.ceil(paginacao.total / geo.porDupla) : 1;

  /** Guarda o primeiro bloco da leitura atual, antes de qualquer recomposição. */
  const guardarAncora = useCallback(() => {
    const f = fluxo.current;
    const { geo: g, modo: m } = estado.current;
    if (!f) return;
    if (m === "livro") {
      // Antes da primeira diagramação não há lugar nenhum pra guardar — e uma
      // âncora "do topo" guardada aqui venceria o link que abriu a página.
      if (!g || !faixa.current || !estado.current.paginacao) return;
      const pagina = alvo.current * g.porDupla;
      const origem = faixa.current.getBoundingClientRect().left;
      ancora.current = primeiroBloco(f, (el) => paginaDoElemento(el, origem, g) >= pagina);
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
      const raizPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const chave = `${el.clientWidth}x${el.clientHeight}@${raizPx}`;
      if (chave === ultimo) return;
      if (ultimo) guardarAncora();
      ultimo = chave;
      setTamanho({ w: el.clientWidth, h: el.clientHeight, raiz: raizPx });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [modo, guardarAncora]);

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

  // ── Diagramar: medir onde cada coisa caiu e voltar ao bloco guardado ───
  useLayoutEffect(() => {
    const f = fluxo.current;
    const fx = faixa.current;
    const j = janela.current;
    if (!geo || !f || !fx || !j || !fim.current) return;

    segurarCaixasCurtas(f, geo);
    ajustarTabelasLargas(f, geo);
    repetirCabecalhos(f, fx.getBoundingClientRect().left, geo);
    const p = medirPaginas(f, fx, fim.current, geo, toc);
    const porDupla = geo.porDupla;
    const total = Math.ceil(p.total / porDupla);
    // A faixa cresce aqui mesmo, antes do React pintar: o scroll logo abaixo
    // precisa de largura pra chegar na dupla certa.
    fx.style.width = `${total * porDupla * geo.pagina}px`;

    let destino = Math.min(alvo.current, total - 1);
    const origem = fx.getBoundingClientRect().left;
    const guardada = ancora.current;
    ancora.current = null;
    // Na primeira diagramação manda o link (#cap4-6); depois, o bloco guardado.
    const alvoDoLink =
      primeiraVez.current && location.hash
        ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
        : null;
    if (alvoDoLink && f.contains(alvoDoLink)) {
      destino = Math.floor(paginaDoElemento(alvoDoLink, origem, geo) / porDupla);
      destacar(alvoDoLink);
      // O navegador também "rola até o #": no modo Livro isso desce a janela
      // do site e esconde o livro atrás do nav. Quem mostra a seção aqui é a
      // dupla, então a janela volta pro topo — agora e quando a página
      // terminar de carregar, que é quando o navegador tenta de novo.
      const aoTopo = () => window.scrollTo({ top: 0, behavior: "instant" });
      aoTopo();
      if (document.readyState !== "complete") window.addEventListener("load", aoTopo, { once: true });
    } else if (guardada && f.contains(guardada)) {
      destino = Math.floor(paginaDoElemento(guardada, origem, geo) / porDupla);
    }
    primeiraVez.current = false;
    alvo.current = destino;
    j.scrollTo({ left: destino * porDupla * geo.pagina, behavior: "instant" });

    // Medir o layout e só então pintar a moldura é exatamente o caso de uso
    // do useLayoutEffect: sem isso o fólio piscaria errado por um quadro.
    setPaginacao(p);
    setDupla(destino);
  }, [geo, versao, toc]);

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
    const folheia = animar && !calmo && g.porDupla === 2 && Math.abs(destino - de) === 1;
    if (folheia) setVirada({ dir: destino > de ? "prox" : "ant", chave: performance.now() });
    j.scrollTo({
      left: destino * g.porDupla * g.pagina,
      behavior: animar && !calmo && !folheia ? "smooth" : "instant",
    });
    setDupla(destino);
  }, []);

  const irParaElemento = useCallback(
    (el: Element) => {
      const { geo: g, modo: m } = estado.current;
      if (m === "livro" && g && faixa.current) {
        const origem = faixa.current.getBoundingClientRect().left;
        irPara(Math.floor(paginaDoElemento(el, origem, g) / g.porDupla), false);
      } else {
        const topo = alturaDoTopo();
        window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - topo - 16, behavior: "smooth" });
      }
      destacar(el);
    },
    [irPara]
  );

  // O dedo e o trackpad rolam a janela direto; aqui só se acompanha onde ela
  // parou. O alvo espera a rolagem assentar, senão um clique no meio de um
  // deslize contaria a partir de uma dupla que ainda está passando.
  useEffect(() => {
    const j = janela.current;
    if (modo !== "livro" || !j) return;
    let quadro = 0;
    let assentar = 0;
    const aoRolar = () => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const g = estado.current.geo;
        if (!g) return;
        setDupla(Math.round(j.scrollLeft / (g.pagina * g.porDupla)));
      });
      clearTimeout(assentar);
      assentar = window.setTimeout(() => {
        const g = estado.current.geo;
        if (g) alvo.current = Math.round(j.scrollLeft / (g.pagina * g.porDupla));
      }, 160);
    };
    j.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      j.removeEventListener("scroll", aoRolar);
      cancelAnimationFrame(quadro);
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

  // Teclado: setas e PageUp/PageDown viram; Home/End vão às pontas.
  useEffect(() => {
    if (modo !== "livro") return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable='true']")) return;
      const ultimo = Number.MAX_SAFE_INTEGER;
      const acao: Record<string, () => void> = {
        ArrowRight: () => irPara(alvo.current + 1, true),
        PageDown: () => irPara(alvo.current + 1, true),
        ArrowLeft: () => irPara(alvo.current - 1, true),
        PageUp: () => irPara(alvo.current - 1, true),
        Home: () => irPara(0, false),
        End: () => irPara(ultimo, false),
      };
      const fazer = acao[e.key];
      if (!fazer) return;
      e.preventDefault();
      fazer();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [modo, irPara]);

  // Roda do mouse: um GESTO vira uma folha. A inércia do trackpad manda
  // dezenas de eventos por gesto; contar cada um viraria o capítulo inteiro.
  useEffect(() => {
    const p = palco.current;
    if (modo !== "livro" || !p) return;
    let gesto = false;
    let fimDoGesto = 0;
    const aoRodar = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // deslize lateral: a rolagem nativa resolve
      if ((e.target as HTMLElement).closest(".folhear-indice")) return;
      e.preventDefault();
      if (!gesto && Math.abs(e.deltaY) >= 4) {
        gesto = true;
        irPara(alvo.current + (e.deltaY > 0 ? 1 : -1), true);
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
    memoria.modo = m;
    gravar(CHAVE_MODO, m);
  };

  const trocarEscala = (passo: 1 | -1) => {
    const i = ESCALAS.indexOf(escala) + passo;
    if (i < 0 || i >= ESCALAS.length) return;
    guardarAncora();
    memoria.escala = ESCALAS[i];
    gravar(CHAVE_ESCALA, String(ESCALAS[i]));
  };

  const alternarTelaCheia = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void raiz.current?.requestFullscreen?.();
  };

  const livro = modo === "livro";
  const pronto = modo === "continuo" || (livro && paginacao !== null);
  const paginaInicial = geo ? dupla * geo.porDupla : 0;
  const rotuloAtual = paginacao?.rotulos[Math.min(paginaInicial + (geo?.porDupla ?? 1) - 1, paginacao.total - 1)];
  const progresso = duplas > 1 ? dupla / (duplas - 1) : 0;

  const variaveis = geo
    ? ({
        "--pagina": `${geo.pagina}px`,
        "--altura": `${geo.altura}px`,
        "--margem": `${geo.margem}px`,
        "--topo": `${geo.topo}px`,
        "--pe": `${geo.pe}px`,
        "--por-dupla": geo.porDupla,
        "--fonte": `${geo.fonte}px`,
        "--lido": `${Math.round(progresso * 7) + 1}px`,
        "--resta": `${Math.round((1 - progresso) * 7) + 1}px`,
      } as CSSProperties)
    : undefined;

  return (
    <div
      ref={raiz}
      className="folhear livro-shell"
      data-modo={modo ?? undefined}
      data-pronto={pronto ? "" : undefined}
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
                className="folhear-botao hidden sm:inline-flex"
                onClick={() => trocarEscala(-1)}
                disabled={escala === ESCALAS[0]}
                aria-label="Diminuir a letra"
                title="Diminuir a letra"
              >
                <AArrowDown className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                className="folhear-botao hidden sm:inline-flex"
                onClick={() => trocarEscala(1)}
                disabled={escala === ESCALAS[ESCALAS.length - 1]}
                aria-label="Aumentar a letra"
                title="Aumentar a letra"
              >
                <AArrowUp className="h-4 w-4" aria-hidden />
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
          <aside
            id="folhear-indice"
            className="folhear-indice"
            aria-label="Índice"
            onClick={(e) => e.stopPropagation()}
          >
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

      {/* ── O palco: a mesa com o livro aberto em cima ────────────────── */}
      <div ref={palco} className="folhear-palco">
        {livro && (
          <button
            type="button"
            className="folhear-seta print-hide"
            data-lado="ant"
            onClick={() => irPara(alvo.current - 1, true)}
            disabled={dupla === 0}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-7 w-7" aria-hidden />
          </button>
        )}

        <div className="folhear-livro" data-por-dupla={geo?.porDupla}>
          {livro && <span aria-hidden className="folhear-borda" data-lado="esq" />}
          {livro && <span aria-hidden className="folhear-borda" data-lado="dir" />}

          <div ref={janela} className="folhear-janela">
            <div ref={faixa} className="folhear-faixa">
              {livro && geo && paginacao && (
                <Folhas geo={geo} paginacao={paginacao} duplas={duplas} />
              )}

              <div ref={fluxo} className={livro ? "folhear-fluxo" : "folhear-continuo livro-pagina surface"}>
                <Sumario toc={toc} paginaDe={paginacao?.paginaDe} abertura />
                {children}
                <span ref={fim} aria-hidden className="folhear-fim" />
              </div>
            </div>
          </div>

          {livro && virada && (
            <div
              key={virada.chave}
              aria-hidden
              className="folhear-virada"
              data-dir={virada.dir}
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

        {livro && (
          <button
            type="button"
            className="folhear-seta print-hide"
            data-lado="prox"
            onClick={() => irPara(alvo.current + 1, true)}
            disabled={dupla >= duplas - 1}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-7 w-7" aria-hidden />
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
 * As folhas: cabeçalho corrente, fólio e o ponto de encaixe de cada dupla.
 *
 * Elas rolam JUNTO com o texto (moram na mesma faixa), então o fólio da
 * página 12 está sempre embaixo do texto da página 12 — inclusive no meio de
 * um deslize com o dedo.
 */
function Folhas({ geo, paginacao, duplas }: { geo: Geometria; paginacao: Paginacao; duplas: number }) {
  const total = duplas * geo.porDupla;
  return (
    <div aria-hidden className="folhear-folhas">
      {Array.from({ length: duplas }, (_, d) => (
        <span key={`m${d}`} className="folhear-marco" style={{ left: d * geo.porDupla * geo.pagina }} />
      ))}
      {Array.from({ length: total }, (_, k) => {
        const r = paginacao.rotulos[k];
        const lado = geo.porDupla === 1 ? "unica" : k % 2 === 0 ? "esq" : "dir";
        const cabeca = !r || r.abertura ? "" : lado === "esq" ? r.capitulo : lado === "dir" ? (r.secao ?? r.capitulo) : (r.secao ?? r.capitulo);
        return (
          <div key={k} className="folhear-folha" data-lado={lado} style={{ left: k * geo.pagina }}>
            {cabeca && <span className="folhear-cabeca">{cabeca}</span>}
            {k < paginacao.total && <span className="folhear-folio">{k + 1}</span>}
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
          <p className="folhear-sumario-selo">
            <span aria-hidden>◆</span> Sumário <span aria-hidden>◆</span>
          </p>
        </header>
      )}
      <ol className="space-y-4">
        {toc.map((cap, i) => (
          <li key={cap.id}>
            <a ref={i === 0 ? primeiro : undefined} href={`#${cap.id}`} className="folhear-entrada" data-nivel="capitulo">
              <span className="folhear-entrada-numero">{numeralDoCapitulo(cap.label)}</span>
              <span className="folhear-entrada-titulo">{rotuloDoCapitulo(cap.label, false)}</span>
              <span aria-hidden className="folhear-entrada-pontos" />
              <span className="folhear-entrada-pagina">{pagina(cap.id)}</span>
            </a>
            {cap.children && (
              <ol className="mt-1.5 space-y-1">
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
    </nav>
  );
}

/**
 * O tema, dentro da barra do livro — no modo Livro o menu do site some, e com
 * ele o botão de tema. Mesmo cuidado de hidratação do `ThemeToggle`.
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
      aria-label={escuro ? "Papel claro" : "Papel escuro"}
      title={escuro ? "Papel claro" : "Papel escuro"}
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
