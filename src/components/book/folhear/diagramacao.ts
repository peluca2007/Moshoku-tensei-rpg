import type { TocEntry } from "../BookToc";

/**
 * A matemática do livro folheado, separada do componente pra poder ser testada
 * sem navegador (a geometria) e lida sem React (a medição).
 */

/** Os degraus do A−/A+ do leitor. Multiplicam o corpo que a geometria escolhe. */
export const ESCALAS = [0.9, 1, 1.1, 1.2, 1.35];

/** Tudo em px inteiros: as colunas repetem o passo centenas de vezes, e fração vira deriva. */
export interface Geometria {
  /** Largura de UMA página. */
  pagina: number;
  altura: number;
  /** Margem lateral, igual dos dois lados (colunas CSS só têm um `column-gap`). */
  margem: number;
  /** Margem de cima — onde mora o cabeçalho corrente. */
  topo: number;
  /** Margem de baixo — onde mora o fólio. */
  pe: number;
  porDupla: 1 | 2;
  /** Corpo do texto, em px. */
  fonte: number;
}

export interface Rotulo {
  capitulo?: string;
  secao?: string;
  /** Página de abertura (sumário, folha de rosto de capítulo): sem cabeçalho corrente. */
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
 * A página mais estreita que ainda merece ser página de LIVRO: abaixo disso a
 * linha cai pra menos de ~42 caracteres no corpo mínimo, e duas páginas assim
 * leem pior do que uma página só, larga. É o princípio 1 do plano: se faltar
 * espaço, o livro mostra menos páginas — nunca letra menor.
 */
const PAGINA_MINIMA_DA_DUPLA = 390;

/** O corpo nunca desce disso na escala 1 (e acompanha a raiz do navegador). */
const CORPO_MINIMO = 16;
const CORPO_MAXIMO = 18.5;

/**
 * Escolhe a geometria a partir do espaço do palco.
 *
 * @param largura  largura útil do palco, em px
 * @param altura   altura útil do palco, em px
 * @param escala   degrau do A−/A+
 * @param raiz     font-size da <html> em px — quem aumentou a letra do site
 *                 inteiro (ou do navegador) recebe o livro proporcionalmente maior
 */
export function calcularGeometria(largura: number, altura: number, escala: number, raiz = 16): Geometria {
  // Espaço pras setas laterais — e, no desktop, pro botão de dados, que
  // flutua no canto de baixo e não pode cobrir o fólio.
  const lateral = largura >= 1100 ? 88 : largura >= 768 ? 56 : 12;
  const w = Math.max(240, largura - lateral * 2);
  const h = Math.max(320, altura - 24);

  // Proporção de livro, com folga pra ficar mais largo em tela baixa: numa
  // janela de notebook a página alta e estreita desperdiçaria a largura que sobra.
  const paginaDaDupla = Math.floor(Math.min(w / 2, h * 0.8, 640));
  const porDupla: 1 | 2 = paginaDaDupla >= PAGINA_MINIMA_DA_DUPLA ? 2 : 1;
  const pagina = porDupla === 2 ? paginaDaDupla : Math.floor(Math.min(w, h * 0.8, 680));
  // No telefone a tela é alta e estreita: limitar a página a 1,6× a largura
  // deixava um palmo de mesa vazia em cima e embaixo. Página de bolso pode
  // ser mais alta que a de livro de mesa.
  const proporcaoMaxima = porDupla === 1 && pagina < 520 ? 2.1 : 1.6;
  const alturaDaPagina = Math.floor(Math.min(h, pagina * proporcaoMaxima));

  // Margem de bolso no telefone: os 9% de um livro de mesa comiam a linha
  // abaixo de 38 caracteres numa página de 366px.
  const margem = Math.round(Math.min(56, Math.max(20, pagina * (pagina < 520 ? 0.065 : 0.09))));
  const topo = Math.round(Math.min(60, Math.max(36, alturaDaPagina * 0.075)));
  const pe = topo - 4;

  // ~27 px de medida por px de corpo dá linha de 55–60 caracteres na Literata.
  const proporcaoDaRaiz = raiz / 16;
  const texto = pagina - margem * 2;
  const corpo =
    Math.min(CORPO_MAXIMO * proporcaoDaRaiz, Math.max(CORPO_MINIMO * proporcaoDaRaiz, texto / 27)) * escala;

  return {
    pagina,
    altura: alturaDaPagina,
    margem,
    topo,
    pe,
    porDupla,
    fonte: Math.round(corpo * 10) / 10,
  };
}

/**
 * Em que página está um elemento.
 *
 * Um bloco partido entre duas colunas devolve a união dos pedaços, e o `left`
 * da união é a coluna onde ele COMEÇA — que é a página que interessa.
 */
export function paginaDoElemento(el: Element, origem: number, g: Geometria): number {
  return Math.max(0, Math.floor((el.getBoundingClientRect().left - origem) / g.pagina));
}

/**
 * O que está dentro de um <details> fechado não existe pra leitura.
 *
 * O Chrome não esconde mais esse conteúdo com `display: none`: ele usa
 * `content-visibility: hidden` (pra busca da página achar texto lá dentro), e
 * aí os elementos respondem a `getBoundingClientRect` com posições de um
 * layout que ninguém vê. Contá-los quebrava a busca do lugar de leitura e
 * fazia caixa invisível parecer caixa partida.
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
  // Bloco escondido (dentro de um <details> fechado) mede zero e quebraria a
  // monotonia — fica de fora.
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
 * Caixa CURTA não se parte entre páginas; caixa LONGA pode.
 *
 * CSS não sabe dizer "evite partir, se for pequena": `break-inside: avoid` em
 * toda caixa empurraria cada caixa média pra página seguinte e deixaria meia
 * página em branco atrás dela — e o livro tem caixa de regra em quase toda
 * página. Então a primeira diagramação deixa o navegador partir o que quiser,
 * e aqui as caixas que saíram partidas mas cabem folgadas numa página (menos
 * de 40% da altura) ganham `folhear-inteira` e são recompostas inteiras.
 *
 * Roda de novo a cada geometria: o que era curto numa página alta pode não
 * ser numa baixa, então as marcas antigas saem antes.
 */
export function segurarCaixasCurtas(fluxo: Element, g: Geometria): void {
  fluxo.querySelectorAll(".folhear-inteira").forEach((el) => el.classList.remove("folhear-inteira"));
  const limite = (g.altura - g.topo - g.pe) * 0.4;
  const partidas: Element[] = [];
  fluxo.querySelectorAll(".livro-caixa").forEach((el) => {
    if (!visivel(el)) return;
    const pedacos = el.getClientRects();
    if (pedacos.length < 2) return;
    let altura = 0;
    for (const r of pedacos) altura += r.height;
    if (altura < limite) partidas.push(el);
  });
  partidas.forEach((el) => el.classList.add("folhear-inteira"));
}

/**
 * Tabela larga demais pra coluna: aperta, em dois degraus.
 *
 * Numa página de notebook baixo (~370px de texto) a tabela de Vigor, com cinco
 * colunas, não cabe nem com a célula mais justa — e uma tabela que invade a
 * margem, ou pior, a página vizinha, é o defeito que o plano proíbe. O
 * primeiro degrau diminui a letra SÓ daquela tabela (a leitura corrida não
 * muda); o segundo, se ainda faltar espaço, deixa a palavra quebrar na borda
 * da célula. Feio é melhor que cortado — e as duas marcas saem quando a
 * página alarga.
 *
 * A largura é a do PRIMEIRO pedaço: uma tabela partida entre duas páginas
 * devolve a união dos pedaços, que atravessa a lombada.
 */
export function ajustarTabelasLargas(fluxo: Element, g: Geometria): void {
  const degraus = ["folhear-tabela-justa", "folhear-tabela-apertada"];
  fluxo.querySelectorAll("table").forEach((t) => t.classList.remove(...degraus));
  const coluna = g.pagina - g.margem * 2 + 1;
  const larga = (t: Element) => (t.getClientRects()[0]?.width ?? 0) > coluna;
  for (const degrau of degraus) {
    const largas = Array.from(fluxo.querySelectorAll("table")).filter((t) => visivel(t) && larga(t));
    if (largas.length === 0) return;
    largas.forEach((t) => t.classList.add(degrau));
  }
}

const CLASSE_CABECALHO = "folhear-cabecalho-repetido";

/**
 * O cabeçalho da tabela repetido no alto de cada página em que ela continua.
 *
 * Uma tabela de condições que continua na página seguinte sem dizer o que é
 * cada coluna obriga o leitor a voltar a página. O Chrome repete o `<thead>`
 * dentro de colunas desde que ele seja inquebrável (o CSS garante); onde o
 * navegador não repete, o livro repete: uma cópia
 * da linha de cabeçalho (escondida do leitor de tela, que já ouviu o
 * original) entra antes da primeira linha de cada página nova.
 *
 * Em LOTE, e não linha a linha: ler a posição depois de cada inserção faria o
 * navegador rediagramar o livro inteiro a cada cópia. Cada passada lê tudo,
 * depois muda tudo. A cópia empurra a página uma linha pra baixo, o que pode
 * mandar a última linha pra página seguinte — por isso até quatro passadas:
 * cópia que ficou no meio da página sai, página que começou sem cópia ganha.
 */
export function repetirCabecalhos(fluxo: Element, origem: number, g: Geometria): void {
  const pagina = (el: Element) => paginaDoElemento(el, origem, g);
  for (let passada = 0; passada < 4; passada++) {
    const remover: Element[] = [];
    const inserir: { corpo: HTMLTableSectionElement; cabecalho: HTMLTableRowElement; antes: HTMLTableRowElement }[] = [];

    fluxo.querySelectorAll("table").forEach((tabela) => {
      if (!visivel(tabela)) return;
      const cabecalho = tabela.tHead?.rows[0];
      const corpo = tabela.tBodies[0];
      if (!cabecalho || !corpo) return;
      // O navegador que já repete o <thead> sozinho (o Chrome, com o thead
      // inquebrável do CSS) devolve um retângulo por página. Aí a cópia seria
      // um segundo cabeçalho — e as que sobraram de uma passada anterior saem.
      if (tabela.tHead!.getClientRects().length > 1) {
        corpo.querySelectorAll(`.${CLASSE_CABECALHO}`).forEach((el) => remover.push(el));
        return;
      }
      let anterior = pagina(cabecalho);
      let vemDeCopia = false;
      for (const linha of Array.from(corpo.rows)) {
        const p = pagina(linha);
        if (linha.classList.contains(CLASSE_CABECALHO)) {
          // Cópia só vale no ALTO de uma página nova.
          if (p <= anterior) remover.push(linha);
          else {
            vemDeCopia = true;
            anterior = p;
          }
          continue;
        }
        if (p > anterior && !vemDeCopia) inserir.push({ corpo, cabecalho, antes: linha });
        vemDeCopia = false;
        anterior = p;
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
 * no cabeçalho corrente.
 */
export function medirPaginas(
  fluxo: Element,
  faixa: Element,
  fim: Element,
  g: Geometria,
  toc: TocEntry[]
): Paginacao {
  const origem = faixa.getBoundingClientRect().left;
  const pagina = (el: Element) => paginaDoElemento(el, origem, g);
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
      if (!es || !fluxo.contains(es)) continue;
      paginaDe[s.id] = pagina(es);
      // Subseção não sobe pro cabeçalho: ele diz a SEÇÃO, que é o nível que
      // o leitor usa pra se localizar.
      if (!s.label.startsWith("—")) eventos.push({ pagina: paginaDe[s.id], secao: s.label });
    }
  }

  const aberturas = new Set<number>();
  fluxo.querySelectorAll(".folhear-sumario, .livro-abertura").forEach((el) => aberturas.add(pagina(el)));

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
