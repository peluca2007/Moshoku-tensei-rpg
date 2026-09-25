import type { TocEntry } from "../BookToc";

/**
 * A matemática do livro folheado, separada do componente pra poder ser testada
 * sem navegador (a geometria) e lida sem React (a medição).
 *
 * ## Página de tamanho FIXO (2026-09-24, segunda versão)
 *
 * A primeira versão recalculava a página pro tamanho da tela e subia a letra
 * pra 16–18px — legível, mas lia como site. O autor pôs o Livro do Jogador de
 * D&D no AnyFlip do lado e a diferença era essa: livro de verdade tem página
 * de tamanho fixo, duas colunas, letra densa, e quem se adapta à tela é o
 * ZOOM, não a diagramação.
 *
 * Então a página agora é uma folha Carta (8,5 × 11 pol. a 96 dpi), diagramada
 * uma vez só, e o livro inteiro é escalado pra caber no palco. De brinde, o
 * número da página passa a ser o mesmo em qualquer aparelho: "página 42" volta
 * a ser um endereço que a mesa pode falar em voz alta.
 */

export const PAGINA = {
  largura: 816,
  altura: 1056,
  /** Margem lateral (a mesma dos dois lados: ver as colunas externas em globals.css). */
  margem: 60,
  topo: 62,
  /** Margem de baixo, onde moram o número e o rótulo da parte. */
  pe: 84,
  /** O vão entre as duas colunas de texto de uma página. */
  calha: 26,
  /** Corpo do texto — ~10pt, a densidade do livro impresso. */
  fonte: 13.6,
} as const;

/** A capa de couro que aparece em volta das folhas. */
export const CAPA = 12;

/** Degraus do zoom, multiplicando o "caber na tela". */
export const ZOOMS = [1, 1.35, 1.75, 2.25];

export interface Geometria {
  pagina: number;
  altura: number;
  margem: number;
  topo: number;
  pe: number;
  calha: number;
  fonte: number;
  porDupla: 1 | 2;
  /** A escala que faz o livro inteiro caber no palco. */
  escala: number;
  /** Largura e altura do livro sem escala (folhas + capa). */
  larguraDoLivro: number;
  alturaDoLivro: number;
}

/**
 * Uma ou duas páginas, e a escala que faz o livro caber no palco.
 * Nada aqui mexe no tamanho da
 * letra dentro da página: isso é o que mantém a diagramação idêntica em toda
 * tela.
 */
export function calcularGeometria(largura: number, altura: number): Geometria {
  // Espaço pras setas laterais (no desktop, também pro botão de dados).
  const lateral = largura >= 1100 ? 72 : largura >= 768 ? 48 : 8;
  const w = Math.max(200, largura - lateral * 2);
  const h = Math.max(200, altura - 16);

  const escalaDe = (paginas: number) =>
    Math.min(w / (paginas * PAGINA.largura + CAPA * 2), h / (PAGINA.altura + CAPA * 2));
  // Dupla sempre que ela custar pouco: se mostrar duas páginas encolhe o
  // livro menos de 20%, é livro aberto. Em tela baixa quem limita é a altura,
  // e aí uma página sairia do MESMO tamanho que duas, só com mesa vazia do
  // lado. Em pé (tablet, celular) a dupla encolheria pela metade: uma página.
  const porDupla: 1 | 2 = escalaDe(2) >= escalaDe(1) * 0.8 ? 2 : 1;
  const escala = Math.floor(escalaDe(porDupla) * 1000) / 1000;

  return {
    pagina: PAGINA.largura,
    altura: PAGINA.altura,
    margem: PAGINA.margem,
    topo: PAGINA.topo,
    pe: PAGINA.pe,
    calha: PAGINA.calha,
    fonte: PAGINA.fonte,
    porDupla,
    escala,
    larguraDoLivro: porDupla * PAGINA.largura + CAPA * 2,
    alturaDoLivro: PAGINA.altura + CAPA * 2,
  };
}

/** Largura de UMA coluna de texto, dentro da página. */
export function larguraDaColuna(g: Pick<Geometria, "pagina" | "margem" | "calha">): number {
  return (g.pagina - g.margem * 2 - g.calha) / 2;
}

export interface Rotulo {
  capitulo?: string;
  secao?: string;
  /** Página de abertura (sumário, folha de rosto de capítulo): sem rótulo no rodapé. */
  abertura: boolean;
}

export interface Paginacao {
  /** Páginas com conteúdo. */
  total: number;
  /** Um por página. */
  rotulos: Rotulo[];
  /** id da âncora → página (base 0). */
  paginaDe: Record<string, number>;
}

/**
 * Onde a faixa de páginas começa na tela, e quanto a tela encolheu o livro.
 *
 * O livro é escalado com `transform`, então `getBoundingClientRect` devolve
 * pixels de TELA; a diagramação vive em pixels de PÁGINA. Toda medida passa
 * por aqui pra voltar pro sistema da página.
 */
export interface Regua {
  origem: number;
  k: number;
}

export function regua(faixa: HTMLElement): Regua {
  const r = faixa.getBoundingClientRect();
  return { origem: r.left, k: faixa.offsetWidth > 0 ? r.width / faixa.offsetWidth : 1 };
}

/**
 * Em que página está um elemento.
 *
 * Um bloco partido entre duas páginas devolve a união dos pedaços, e o `left`
 * da união é a página onde ele COMEÇA — que é a que interessa.
 */
export function paginaDoElemento(el: Element, r: Regua, g: Pick<Geometria, "pagina">): number {
  return Math.max(0, Math.floor((el.getBoundingClientRect().left - r.origem) / r.k / g.pagina));
}

/**
 * O que está dentro de um <details> fechado não existe pra leitura.
 *
 * O Chrome não esconde mais esse conteúdo com `display: none`: ele usa
 * `content-visibility: hidden` (pra busca da página achar texto lá dentro), e
 * aí os elementos respondem a `getBoundingClientRect` com posições de um
 * layout que ninguém vê. Contá-los quebrava a busca do lugar de leitura.
 */
export function visivel(el: Element): boolean {
  return !el.closest("details:not([open])");
}

/** Os blocos em que a leitura pode "estar": é por eles que o lugar é guardado. */
const SELETOR_BLOCOS = "h2, h3, h4, p, li, tr:not(.folhear-cabecalho-repetido), figure, .livro-caixa";

/**
 * O primeiro bloco (em ordem de leitura) que satisfaz `passou`.
 *
 * Busca binária: a ordem do DOM é a ordem das páginas, então `passou` é
 * monotônico e bastam ~12 medições num livro de milhares de blocos.
 */
export function primeiroBloco(fluxo: Element, passou: (el: Element) => boolean): Element | null {
  const lista = Array.from(fluxo.querySelectorAll<HTMLElement>(SELETOR_BLOCOS)).filter(
    (el) => el.offsetParent !== null && visivel(el)
  );
  let baixo = 0;
  let alto = lista.length - 1;
  let achado: Element | null = null;
  while (baixo <= alto) {
    const meio = (baixo + alto) >> 1;
    if (passou(lista[meio])) {
      achado = lista[meio];
      alto = meio - 1;
    } else {
      baixo = meio + 1;
    }
  }
  return achado;
}

/**
 * Caixa CURTA não se parte entre colunas; caixa LONGA pode.
 *
 * CSS não sabe dizer "evite partir, se for pequena": `break-inside: avoid` em
 * toda caixa empurraria cada caixa média pra coluna seguinte e deixaria meia
 * coluna em branco atrás dela. Então a primeira diagramação deixa o navegador
 * partir o que quiser, e aqui as caixas que saíram partidas mas cabem folgadas
 * numa coluna (menos de 40% da altura) ganham `folhear-inteira` e são
 * recompostas inteiras.
 */
export function segurarCaixasCurtas(fluxo: Element, g: Geometria, r: Regua): void {
  fluxo.querySelectorAll(".folhear-inteira").forEach((el) => el.classList.remove("folhear-inteira"));
  const limite = (g.altura - g.topo - g.pe) * 0.4;
  const partidas: Element[] = [];
  fluxo.querySelectorAll(".livro-caixa").forEach((el) => {
    if (!visivel(el)) return;
    const pedacos = el.getClientRects();
    if (pedacos.length < 2) return;
    let altura = 0;
    for (const p of pedacos) altura += p.height / r.k;
    if (altura < limite) partidas.push(el);
  });
  partidas.forEach((el) => el.classList.add("folhear-inteira"));
}

/**
 * Tabela larga demais pra coluna: aperta, em dois degraus.
 *
 * A coluna do livro tem ~340px, e tabela de cinco colunas (a do Vigor) não
 * cabe nem com a célula mais justa. O primeiro degrau diminui a letra SÓ
 * daquela tabela; o segundo deixa a palavra quebrar na borda da célula. Feio
 * é melhor que cortado — uma tabela invadindo a coluna vizinha é o defeito
 * que o plano proíbe.
 *
 * A largura é a do PRIMEIRO pedaço: uma tabela partida entre duas colunas
 * devolve a união dos pedaços.
 */
export function ajustarTabelasLargas(fluxo: Element, g: Geometria, r: Regua): void {
  const degraus = ["folhear-tabela-justa", "folhear-tabela-apertada"];
  fluxo.querySelectorAll("table").forEach((t) => t.classList.remove(...degraus));
  // Tabela que atravessa a página (ver espalharTabelasEspremidas) tem a
  // largura da página inteira; as outras, a de uma coluna.
  const limite = (t: Element) =>
    (t.closest(".folhear-larga") ? g.pagina - g.margem * 2 : larguraDaColuna(g)) + 1;
  const larga = (t: Element) => (t.getClientRects()[0]?.width ?? 0) / r.k > limite(t);
  for (const degrau of degraus) {
    const largas = Array.from(fluxo.querySelectorAll("table")).filter((t) => visivel(t) && larga(t));
    if (largas.length === 0) return;
    largas.forEach((t) => t.classList.add(degrau));
  }
}

/**
 * Diagrama que não cabe numa coluna atravessa a página inteira.
 *
 * Os diagramas nasceram pro contínuo, com ~700px de largura; alguns (a Ordem
 * do Dano, com cinco cartões lado a lado) rolam de lado numa coluna de livro.
 * O impresso resolve isso pondo a figura larga no alto ou no pé da página, de
 * margem a margem — é o `column-span: all` da classe `folhear-larga`.
 */
export function ajustarFigurasLargas(fluxo: Element): void {
  fluxo.querySelectorAll(".folhear-larga").forEach((el) => el.classList.remove("folhear-larga"));
  const largas = Array.from(fluxo.querySelectorAll<HTMLElement>("figure.diagrama")).filter((fig) => {
    if (!visivel(fig)) return false;
    return Array.from(fig.querySelectorAll<HTMLElement>("*")).some((el) => el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0);
  });
  largas.forEach((fig) => fig.classList.add("folhear-larga"));
}

/**
 * Tabela espremida numa coluna atravessa a página inteira.
 *
 * Uma coluna de livro tem ~335px. Tabela de quatro colunas ou mais — a dos
 * Antecedentes, a do Vigor — cabia ali só virando torre: a coluna "Efeito"
 * com 90px e cada linha com vinte linhas de texto. O impresso resolve do
 * jeito de sempre: a tabela larga vai de margem a margem (`column-span: all`),
 * e o texto em volta continua em duas colunas acima e abaixo dela.
 *
 * Também atravessa a tabela de poucas colunas que ainda saiu com alguma linha
 * mais alta que sete linhas de texto. Não mexe em tabela dentro de caixa,
 * verbete ou catálogo de árvore: lá dentro ela não pode sair da caixa.
 */
export function espalharTabelasEspremidas(fluxo: Element, g: Geometria, r: Regua): void {
  fluxo.querySelectorAll(".livro-tabela.folhear-larga").forEach((el) => el.classList.remove("folhear-larga"));
  const alturaMaxima = g.fonte * 1.3 * 7;
  const espremidas = Array.from(fluxo.querySelectorAll<HTMLElement>(".livro-tabela")).filter((caixa) => {
    if (!visivel(caixa) || caixa.closest(".livro-caixa, .livro-arvore, .livro-verbete, .livro-maestria")) return false;
    const tabela = caixa.querySelector("table");
    if (!tabela) return false;
    const colunas = tabela.tHead?.rows[0]?.cells.length ?? tabela.rows[0]?.cells.length ?? 0;
    if (colunas >= 4) return true;
    return Array.from(tabela.tBodies[0]?.rows ?? []).some((tr) => tr.getBoundingClientRect().height / r.k > alturaMaxima);
  });
  espremidas.forEach((caixa) => caixa.classList.add("folhear-larga"));
}

const CLASSE_CABECALHO = "folhear-cabecalho-repetido";

/**
 * O cabeçalho da tabela repetido no alto de cada coluna em que ela continua.
 *
 * Uma tabela de condições que continua na coluna seguinte sem dizer o que é
 * cada coluna obriga o leitor a voltar. O Chrome repete o `<thead>` dentro de
 * colunas desde que ele seja inquebrável (o CSS garante); onde o navegador não
 * repete, o livro repete: uma cópia da linha de cabeçalho (escondida do leitor
 * de tela, que já ouviu o original) entra antes da primeira linha de cada
 * coluna nova.
 *
 * Em LOTE, e não linha a linha: ler a posição depois de cada inserção faria o
 * navegador rediagramar o livro inteiro a cada cópia.
 */
export function repetirCabecalhos(fluxo: Element): void {
  // A coluna de uma linha é o `left` do retângulo dela: duas linhas na mesma
  // coluna têm o mesmo `left`, e a coluna seguinte começa mais à direita.
  const coluna = (el: Element) => Math.round(el.getBoundingClientRect().left);
  for (let passada = 0; passada < 4; passada++) {
    const remover: Element[] = [];
    const inserir: { corpo: HTMLTableSectionElement; cabecalho: HTMLTableRowElement; antes: HTMLTableRowElement }[] = [];

    fluxo.querySelectorAll("table").forEach((tabela) => {
      if (!visivel(tabela)) return;
      const cabecalho = tabela.tHead?.rows[0];
      const corpo = tabela.tBodies[0];
      if (!cabecalho || !corpo) return;
      if (tabela.tHead!.getClientRects().length > 1) {
        corpo.querySelectorAll(`.${CLASSE_CABECALHO}`).forEach((el) => remover.push(el));
        return;
      }
      let anterior = coluna(cabecalho);
      let vemDeCopia = false;
      for (const linha of Array.from(corpo.rows)) {
        const c = coluna(linha);
        if (linha.classList.contains(CLASSE_CABECALHO)) {
          if (c <= anterior) remover.push(linha);
          else {
            vemDeCopia = true;
            anterior = c;
          }
          continue;
        }
        if (c > anterior + 2 && !vemDeCopia) inserir.push({ corpo, cabecalho, antes: linha });
        vemDeCopia = false;
        anterior = c;
      }
    });

    if (remover.length === 0 && inserir.length === 0) return;
    remover.forEach((el) => el.remove());
    for (const { corpo, cabecalho, antes } of inserir) {
      const copia = cabecalho.cloneNode(true) as HTMLTableRowElement;
      copia.className = CLASSE_CABECALHO;
      copia.setAttribute("aria-hidden", "true");
      corpo.insertBefore(copia, antes);
    }
  }
}

/** Tira as cópias de cabeçalho — no modo contínuo a tabela é uma só. */
export function limparCabecalhosRepetidos(fluxo: Element): void {
  fluxo.querySelectorAll(`.${CLASSE_CABECALHO}`).forEach((el) => el.remove());
}

/**
 * Depois que o navegador diagramou: quantas páginas deu, e o que cada uma diz
 * no rodapé.
 */
export function medirPaginas(fluxo: Element, fim: Element, r: Regua, g: Geometria, toc: TocEntry[]): Paginacao {
  const pagina = (el: Element) => paginaDoElemento(el, r, g);
  const total = pagina(fim) + 1;

  const paginaDe: Record<string, number> = {};
  const eventos: { pagina: number; capitulo?: string; secao?: string }[] = [];
  for (const cap of toc) {
    const el = document.getElementById(cap.id);
    if (!el || !fluxo.contains(el)) continue;
    paginaDe[cap.id] = pagina(el);
    eventos.push({ pagina: paginaDe[cap.id], capitulo: rotuloDoCapitulo(cap.label, true) });
    for (const s of cap.children ?? []) {
      const es = document.getElementById(s.id);
      if (!es || !fluxo.contains(es) || !visivel(es)) continue;
      paginaDe[s.id] = pagina(es);
      if (!s.label.startsWith("—")) eventos.push({ pagina: paginaDe[s.id], secao: s.label });
    }
  }

  const aberturas = new Set<number>();
  fluxo.querySelectorAll(".folhear-guarda, .folhear-rosto, .folhear-sumario, .livro-abertura, .folhear-colofao").forEach((el) => aberturas.add(pagina(el)));

  // `sort` é estável: capítulo e primeira seção na mesma página mantêm a
  // ordem do sumário, e o capítulo zera a seção antes de ela entrar.
  eventos.sort((a, b) => a.pagina - b.pagina);
  const rotulos: Rotulo[] = [];
  let capitulo: string | undefined;
  let secao: string | undefined;
  let i = 0;
  for (let p = 0; p < total; p++) {
    while (i < eventos.length && eventos[i].pagina <= p) {
      const e = eventos[i++];
      if (e.capitulo) {
        capitulo = e.capitulo;
        secao = undefined;
      } else {
        secao = e.secao;
      }
    }
    rotulos.push({ capitulo, secao, abertura: aberturas.has(p) });
  }

  return { total, rotulos, paginaDe };
}

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/** "Cap. 4 — Combate e Sobrevivência" → "Capítulo 4 · Combate e Sobrevivência" (ou só o título). */
export function rotuloDoCapitulo(label: string, comNumero: boolean): string {
  const m = label.match(/^Cap\.\s*(\d+)\s*—\s*(.+)$/);
  if (!m) return label;
  return comNumero ? `Capítulo ${m[1]} · ${m[2]}` : m[2];
}

/** "Cap. 4 — …" → "IV". Abertura e Apêndices ficam com o losango, como no índice lateral. */
export function numeralDoCapitulo(label: string): string {
  const m = label.match(/^Cap\.\s*(\d+)/);
  return m ? (ROMANOS[Number(m[1]) - 1] ?? m[1]) : "◆";
}
