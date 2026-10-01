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
  /** O id do capítulo (cap4) — a cor da página sai dele. */
  capituloId?: string;
  /** A árvore do catálogo que ocupa a página (fogo, deus-da-espada…): a cor e o kanji dela. */
  arvoreId?: string;
  arvoreNome?: string;
  /** A família da árvore (magia, corpo, utilidade): o caos de reserva de árvore sem tema próprio. */
  arvoreFamilia?: string;
  /** A raça dona da página (cada raça tem uma página inteira no Cap. 1): a cor e o kanji dela. */
  racaId?: string;
  racaNome?: string;
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
  // 60% desde 2026-09-26: o autor não quer caixa partida; até ~meia coluna
  // ela desce inteira, e o vão que fica é trabalho do preencherPes.
  const limite = (g.altura - g.topo - g.pe) * 0.6;
  const partidas: Element[] = [];
  // A Maestria e o Rank Deus das árvores (`.livro-maestria`) também: o Rank
  // Deus partia e deixava quatro linhas sozinhas na última página da árvore.
  fluxo.querySelectorAll(".livro-caixa, .livro-maestria").forEach((el) => {
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
 * A TABELA QUE QUASE CABE NÃO SE PARTE — 2026-09-26.
 *
 * O autor não quer tabela partida ("a tabela não está inteira na página"). A
 * que é maior que a página parte, e tem que partir; a que passa um pouco — os
 * Olhos Místicos deixavam duas linhas das dez na página seguinte — cabe se a
 * letra e o respiro das linhas encolherem um pouco. Aqui a tabela partida cujo
 * rabo é até ~30% dela ganha `folhear-tabela-compacta`.
 *
 * @returns quantas tabelas compactaram
 */
export function apertarTabelasPartidas(fluxo: Element, g: Geometria, r: Regua): number {
  // Desfaz o agrupamento da composição anterior antes de medir de novo.
  fluxo.querySelectorAll<HTMLTableSectionElement>("tbody.folhear-grupo-final").forEach((grupo) => {
    const origem = grupo.previousElementSibling;
    if (origem?.tagName === "TBODY") while (grupo.firstChild) origem.append(grupo.firstChild);
    grupo.remove();
  });
  fluxo.querySelectorAll(".folhear-tabela-compacta").forEach((el) => el.classList.remove("folhear-tabela-compacta"));
  const pagina = (q: DOMRect) => Math.floor((q.left - r.origem) / r.k / g.pagina);
  const coluna = (q: DOMRect) =>
    Math.floor(((q.left - r.origem) / r.k + Math.min(q.width / r.k / 2, 40)) / (g.pagina / 2));
  const alteradas = new Set<Element>();
  // Compactar uma tabela pode deslocar a seguinte; duas passadas bastam para
  // conferir o novo encaixe sem introduzir quebras forçadas e buracos.
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    const compactar: Element[] = [];
    const inteiras: Element[] = [];
    const agrupar: { corpo: HTMLTableSectionElement; linhas: HTMLTableRowElement[] }[] = [];
    fluxo.querySelectorAll(".livro-tabela").forEach((caixa) => {
      if (!visivel(caixa) || caixa.closest(".livro-catalogo-itens")) return;
      const rs = Array.from(caixa.getClientRects()).filter((a) => a.height > 1);
      if (rs.length < 2) return;
      const total = rs.reduce((s, a) => s + a.height, 0);
      const ultimaPagina = pagina(rs[rs.length - 1]);
      if (ultimaPagina === pagina(rs[0])) return;
      const rabo = rs.filter((a) => pagina(a) === ultimaPagina).reduce((s, a) => s + a.height, 0);
      const linhas = Array.from(caixa.querySelectorAll("tbody tr"));
      const grupos = new Map<number, number>();
      linhas.forEach((tr) => {
        const q = Array.from(tr.getClientRects()).find((a) => a.height > 1);
        if (q) grupos.set(coluna(q), (grupos.get(coluna(q)) ?? 0) + 1);
      });
      const quantidades = [...grupos.values()];
      const partidaCurta = quantidades.length > 1 && (quantidades[0] <= 2 || quantidades[quantidades.length - 1] <= 2);
      const raboCurto = quantidades[quantidades.length - 1];
      const trio = linhas.slice(-3).filter((linha): linha is HTMLTableRowElement => linha instanceof HTMLTableRowElement);
      const corpo = trio[0]?.parentElement;
      if (raboCurto <= 2 && trio.length === 3 && corpo instanceof HTMLTableSectionElement && trio.every((linha) => linha.parentElement === corpo))
        agrupar.push({ corpo, linhas: trio });
      if (partidaCurta && total / r.k < (g.altura - g.topo - g.pe) * 0.72 && !caixa.classList.contains("folhear-inteira"))
        inteiras.push(caixa);
      if (
        (partidaCurta || rabo / total <= 0.3) &&
        total / r.k < (g.altura - g.topo - g.pe) * 1.2 &&
        !caixa.classList.contains("folhear-tabela-compacta")
      )
        compactar.push(caixa);
    });
    compactar.forEach((el) => {
      el.classList.add("folhear-tabela-compacta");
      alteradas.add(el);
    });
    inteiras.forEach((el) => {
      el.classList.add("folhear-inteira");
      alteradas.add(el);
    });
    agrupar.forEach(({ corpo, linhas }) => {
      const grupo = document.createElement("tbody");
      grupo.className = "folhear-grupo-final";
      corpo.after(grupo);
      linhas.forEach((linha) => grupo.append(linha));
      alteradas.add(corpo.closest(".livro-tabela") ?? corpo);
    });
    // O novo <tbody> já pede outra fragmentação; não agrupa outro trio na
    // mesma composição, o que poderia consumir a tabela de trás para frente.
    if (agrupar.length || compactar.length + inteiras.length === 0) break;
  }
  return alteradas.size;
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
  const diagramas = Array.from(fluxo.querySelectorAll<HTMLElement>("figure.diagrama")).filter(visivel);
  diagramas.forEach((fig) => (fig.style.zoom = ""));
  /** Quanto o conteúdo mais largo do diagrama passa da largura que ele tem. */
  const sobra = (fig: HTMLElement) => {
    let pior = 1;
    fig.querySelectorAll<HTMLElement>("*").forEach((el) => {
      if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2) pior = Math.max(pior, el.scrollWidth / el.clientWidth);
    });
    return pior;
  };
  const largas = diagramas.filter((fig) => sobra(fig) > 1);
  largas.forEach((fig) => fig.classList.add("folhear-larga"));
  // Mesmo de margem a margem, alguns diagramas têm largura mínima maior que a
  // página (a Ordem do Dano, o Tiro Perfeito). Esses encolhem por inteiro,
  // proporcionais, em vez de cortar o último quadro fora da página.
  // Mede todas antes de encolher qualquer uma: cada zoom escrito entre duas
  // medidas rediagramava o livro inteiro.
  const sobras = largas.map(sobra);
  largas.forEach((fig, i) => {
    const s = sobras[i];
    if (s > 1) fig.style.zoom = String(Math.max(0.6, Math.floor((1 / s) * 100) / 100));
  });
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
 * Também atravessa a tabela de poucas colunas que ainda saiu com uma célula
 * abaixo de 90 px e alguma linha mais alta que seis linhas de texto. Não mexe em tabela dentro de caixa,
 * verbete ou catálogo de árvore: lá dentro ela não pode sair da caixa.
 */
export function espalharTabelasEspremidas(fluxo: Element, g: Geometria, r: Regua): void {
  fluxo
    .querySelectorAll(".livro-tabela.folhear-larga, .livro-caixa.folhear-larga, .folhear-torre")
    .forEach((el) => el.classList.remove("folhear-larga", "folhear-torre"));
  const espremidas = Array.from(fluxo.querySelectorAll<HTMLElement>(".livro-tabela")).filter((caixa) => {
    if (!visivel(caixa) || caixa.closest(".livro-arvore, .livro-verbete, .livro-maestria, .livro-catalogo-itens"))
      return false;
    // Tabela dentro de uma caixa de regra: se ela for espremida, quem
    // atravessa a página é a caixa inteira (a tabela não pode sair dela).
    const dentroDeCaixa = caixa.closest(".livro-caixa");
    if (dentroDeCaixa && dentroDeCaixa.closest(".livro-caixa .livro-caixa")) return false;
    const tabela = caixa.querySelector("table");
    if (!tabela) return false;
    const colunas = tabela.tHead?.rows[0]?.cells.length ?? tabela.rows[0]?.cells.length ?? 0;
    const celulas = Array.from(tabela.querySelectorAll("tbody td"));
    const torre = celulas.some((celula) => {
      const q = Array.from(celula.getClientRects()).find((a) => a.width > 1);
      if (!q || q.width / r.k >= 90) return false;
      const faixa = document.createRange();
      faixa.selectNodeContents(celula);
      const topos: number[] = [];
      for (const pedaco of Array.from(faixa.getClientRects())) {
        if (pedaco.width < 1 || pedaco.height < 1) continue;
        const topo = Math.round(pedaco.top / r.k);
        if (!topos.some((v) => Math.abs(v - topo) <= 1)) topos.push(topo);
      }
      return topos.length > 6;
    });
    if (torre) (caixa.closest(".livro-caixa") ?? caixa).classList.add("folhear-torre");
    // Preserva a regra anterior: quatro colunas já são largas por natureza,
    // mesmo antes de uma linha chegar ao limite de torre.
    return colunas >= 4 || torre;
  });
  espremidas.forEach((caixa) => (caixa.closest(".livro-caixa") ?? caixa).classList.add("folhear-larga"));
}

/**
 * TÍTULO NUNCA FICA SEPARADO DO TEXTO DELE.
 *
 * O CSS pede `break-after: avoid` em todo título, mas o Chrome só obedece
 * quando acha outro lugar pra quebrar — e desiste calado quando o que vem
 * depois é uma tabela, uma arte ou uma caixa que não cabem no resto da
 * coluna. Aí sobrava "3. Economia de Ações" sozinho no pé da página e o texto
 * na seguinte: o defeito que o autor apontou como obrigatório.
 *
 * Então, depois da diagramação, cada título é conferido: se o começo do que
 * vem depois dele caiu numa coluna mais à direita, o título vai junto
 * (`break-before: column`). Título que abre uma caixa, um verbete, uma tabela
 * ou uma árvore leva o bloco INTEIRO — empurrar só o título partiria a caixa.
 * Um empurrão pode criar outro caso mais adiante, por isso a conferência
 * repete até zerar (ver Folhear.tsx).
 *
 * @returns quantos blocos foram empurrados nesta passada
 */
const SELETOR_TITULOS = [
  "h3",
  "h4",
  ".livro-arvore-cabeca",
  ".livro-verbete > div:first-child",
  ":is(.livro-caixa, .livro-maestria, .livro-proficiencias) > p:first-child",
  ".livro-mecanica > div:first-child",
  ".livro-tabela thead",
].join(", ");

const BLOCOS_COM_TITULO =
  ".livro-caixa, .livro-maestria, .livro-proficiencias, .livro-mecanica, .livro-verbete, .livro-tabela, .livro-arvore";

/* Árvores alteradas na passada anterior; cada árvore começa em página nova. */
let arvoresDeTitulosPendentes: Set<Element> | null = null;
/** Consultas estáticas reaproveitadas durante uma diagramação. */
let titulosDoFluxo: Element[] | null = null;
let tabelasDoFluxo: Element[] | null = null;

/** `t` abre `bloco`? (cada passo do caminho é o primeiro filho) */
function abre(bloco: Element, t: Element): boolean {
  for (let n: Element | null = t; n && n !== bloco; n = n.parentElement) {
    if (n.parentElement?.firstElementChild !== n) return false;
  }
  return true;
}

/** O que vem depois de `t` na ordem de leitura, pulando o que não aparece. */
function seguinte(t: Element, fluxo: Element): Element | null {
  let n: Element | null = t;
  while (n && n !== fluxo) {
    let irmao = n.nextElementSibling;
    while (irmao && !Array.from(irmao.getClientRects()).some((r) => r.height > 1)) irmao = irmao.nextElementSibling;
    if (irmao) return irmao;
    n = n.parentElement;
  }
  return null;
}

export function segurarTitulos(fluxo: Element, g: Geometria, r: Regua): number {
  titulosDoFluxo ??= Array.from(fluxo.querySelectorAll(SELETOR_TITULOS));
  tabelasDoFluxo ??= Array.from(fluxo.querySelectorAll(".livro-tabela"));
  // Em que coluna (contando as duas de cada página) um retângulo está. Não
  // dá pra comparar só o `left`: o carimbo das caixas é torto e deslocado,
  // e sai uns pixels à esquerda do texto da mesma coluna.
  const coluna = (q: DOMRect) => {
    const x = (q.left - r.origem) / r.k + Math.min(q.width / r.k / 2, 40);
    const pagina = Math.floor(x / g.pagina);
    return pagina * 2 + (x - pagina * g.pagina > g.pagina / 2 ? 1 : 0);
  };
  const empurrar = new Set<Element>();
  /*
   * LER TUDO, DEPOIS ESCREVER (0.1.99). Cada classe posta no meio da leitura
   * obrigava o navegador a rediagramar o livro inteiro (~50 ms no desktop,
   * ~200 ms num celular) antes da medida seguinte: a passada dos títulos
   * pagava ~46 rediagramações e levava 2,3 s. As decisões são as mesmas —
   * todas medidas no mesmo estado, que é o que uma passada quer dizer.
   */
  const alargar: Element[] = [];
  const naConferencia = (el: Element) => {
    if (arvoresDeTitulosPendentes === null) return true;
    const arvore = el.closest(".livro-arvore");
    return !arvore || arvoresDeTitulosPendentes.has(arvore);
  };
  titulosDoFluxo.filter(naConferencia).forEach((t) => {
    // A página de raça é uma página inteira de altura fixa: o título dela não
    // tem como ficar longe do texto, e a leitura japonesa à direita do nome
    // enganaria a conferência (ela mora na metade direita da página).
    if (!visivel(t) || t.closest(".livro-abertura, .folhear-sumario, .folhear-rosto, .folhear-colofao, .livro-raca")) return;
    const rt = t.getClientRects();
    if (rt.length === 0) return;
    // A PRIMEIRA linha do título: se ele partiu entre duas colunas, a última
    // linha está junto do texto e esconderia o nome sozinho no pé da anterior.
    const titulo = rt[0];
    const depois = seguinte(t, fluxo);
    if (!depois) return;
    const comeco = Array.from(depois.getClientRects()).find((r) => r.height > 1);
    if (!comeco) return;
    // Título colado numa peça larga NA MESMA PÁGINA também atravessa, logo em
    // cima dela. Na coluna ele ficava sozinho na faixa de cima: do lado de um
    // buraco, ou com o buraco (e depois o selo da vinheta) entre ele e a peça.
    if (
      t.matches("h3, h4") &&
      !t.classList.contains("folhear-larga") &&
      depois.matches(".folhear-larga, .livro-prancha:not(.livro-prancha-coluna, .folhear-prancha-coluna)") &&
      Math.floor(coluna(comeco) / 2) === Math.floor(coluna(titulo) / 2)
    ) {
      alargar.push(t);
      empurrar.add(t);
      return;
    }
    if (coluna(comeco) <= coluna(titulo)) return;
    // Antes de uma tabela ou figura que atravessa a página, empurrar o título
    // pra próxima COLUNA não adianta (a tabela está na próxima PÁGINA): o
    // título passa a atravessar a página também, e anda junto com ela. Se
    // ainda assim ficar pra trás, a próxima passada empurra — e empurrar algo
    // que atravessa a página é mandá-lo pra página seguinte.
    if (t.matches("h3, h4") && depois.matches(".folhear-larga, .livro-prancha:not(.livro-prancha-coluna, .folhear-prancha-coluna)") && !t.classList.contains("folhear-larga")) {
      alargar.push(t);
      empurrar.add(t);
      return;
    }
    const bloco = t.closest(BLOCOS_COM_TITULO);
    empurrar.add(bloco && abre(bloco, t) ? bloco : t);
  });
  // Título que passou a atravessar a página muda a posição de tudo que vem
  // depois dele: o resto desta passada mediria um livro que não existe mais.
  // Escreve só isso e deixa a próxima passada medir de novo.
  if (alargar.length > 0) {
    alargar.forEach((t) => t.classList.add("folhear-larga", "folhear-titulo-largo"));
    arvoresDeTitulosPendentes = new Set(alargar.map((t) => t.closest(".livro-arvore")).filter((a): a is Element => !!a));
    return alargar.length;
  }

  // TABELA QUE ABRE NO PÉ DA COLUNA com o cabeçalho e uma ou duas linhas: é o
  // título órfão das tabelas. Ela desce inteira, pelos mesmos degraus.
  const topoDasTabelas = fluxo.getBoundingClientRect().top;
  tabelasDoFluxo.filter(naConferencia).forEach((caixa) => {
    if (!visivel(caixa)) return;
    const linhas = Array.from(caixa.querySelectorAll("tbody tr:not(.folhear-cabecalho-repetido)"));
    // Com a última linha presa à penúltima (folhear.css), uma tabela de três
    // linhas só parte deixando a primeira sozinha no pé: também desce.
    if (linhas.length < 3) return;
    const primeira = linhas[0].getClientRects()[0];
    if (!primeira) return;
    const c0 = coluna(primeira);
    let juntas = 0;
    for (const l of linhas) {
      const q = l.getClientRects()[0];
      if (!q || coluna(q) !== c0) break;
      juntas++;
    }
    // Só desce a tabela que abre no último terço da coluna: mais acima, descer
    // deixa um buraco maior que o defeito (a das Magias Combinadas abria no
    // meio da página com duas linhas altas, e descer deixava 44% em branco).
    const colunaAlta = g.altura - g.topo - g.pe;
    const sobra = colunaAlta - (primeira.top - topoDasTabelas) / r.k;
    if (juntas < Math.min(3, linhas.length - 1) && sobra < colunaAlta * 0.3) empurrar.add(caixa);
  });

  // Título empurrado leva o bloco seguinte junto: uma quebra própria do bloco
  // (a tabela que "descia inteira" do pé da coluna) separaria os dois de novo
  // — o subtítulo "As peças" da Teórica ficava sozinho por isso.
  // Lê tudo antes de escrever: `seguinte` mede retângulos, e medir depois de
  // tirar uma classe obrigava o navegador a rediagramar o livro inteiro a
  // cada título (a passada foi de ~160 ms pra 1,2 s).
  const junto = [...empurrar].filter((el) => el.matches("h3, h4")).map((el) => seguinte(el, fluxo));

  // Cada caso sobe um degrau por passada, e só conta como mudança se subiu:
  // 1) título antes de algo que atravessa a página passa a atravessar também;
  // 2) o bloco vai pra próxima coluna;
  // 3) se nem assim (a faixa curta abaixo de uma tabela de página inteira,
  //    onde a próxima coluna ainda é a mesma página), o bloco fica inteiro e
  //    anda junto pra próxima página.
  const alturaDaColuna = g.altura - g.topo - g.pe;
  const cabeNumaColuna = (el: Element) => {
    let altura = 0;
    for (const q of el.getClientRects()) altura += q.height / r.k;
    return altura < alturaDaColuna * 0.9;
  };
  /*
   * O último degrau: um CALÇO. Quando o bloco começa numa faixa curta logo
   * abaixo de algo que atravessa a página (a tabela de Vigor, por exemplo),
   * nenhuma quebra forçada funciona — o Chrome ignora quebra no começo de
   * uma faixa. Então entra um bloco vazio que ocupa o resto das duas colunas
   * da faixa, e o bloco começa inteiro na página seguinte. É o que o
   * diagramador faria à mão: deixar o pé da página em branco.
   */
  const topoDoFluxo = fluxo.getBoundingClientRect().top;
  const restoDaFaixa = (el: Element): number | null => {
    const q = el.getClientRects()[0];
    if (!q) return null;
    const margem = parseFloat(getComputedStyle(el).marginTop) || 0;
    const inicioDaFaixa = (q.top - topoDoFluxo) / r.k - margem;
    const resto = alturaDaColuna - inicioDaFaixa;
    return resto <= 0 || resto > alturaDaColuna * 0.5 ? null : resto;
  };
  const calcar = (el: Element, resto: number | null) => {
    if (resto === null) return;
    const calco = document.createElement("div");
    calco.className = "folhear-calco";
    calco.setAttribute("aria-hidden", "true");
    calco.style.height = `${Math.ceil(resto * 2 + 2)}px`;
    el.before(calco);
    // O calço substitui a quebra: com as duas, o bloco pularia duas vezes.
    el.classList.remove("folhear-empurra");
    el.classList.add("folhear-calcado");
  };
  // As medidas que os degraus 3 e 4 pedem, tiradas antes da primeira escrita.
  const cabe = new Map<Element, boolean>();
  const resto = new Map<Element, number | null>();
  const vaiAlargar = new Set(alargar);
  empurrar.forEach((el) => {
    const c = el.classList;
    const larga = c.contains("folhear-larga") || vaiAlargar.has(el);
    if (el.matches("h3, h4") && larga && !c.contains("folhear-titulo-largo")) return;
    if (!c.contains("folhear-empurra")) return;
    if (!c.contains("folhear-inteira")) cabe.set(el, cabeNumaColuna(el));
    if (!c.contains("folhear-calcado") && !c.contains("folhear-tentou-calco")) resto.set(el, restoDaFaixa(el));
  });

  // Daqui pra baixo, só escrita.
  alargar.forEach((t) => t.classList.add("folhear-larga"));
  junto.forEach((prox) => {
    if (!prox) return;
    empurrar.delete(prox);
    prox.classList.remove("folhear-empurra");
  });
  let mudou = 0;
  const mudaram: Element[] = [];
  empurrar.forEach((el) => {
    const c = el.classList;
    if (el.matches("h3, h4") && c.contains("folhear-larga") && !c.contains("folhear-titulo-largo")) c.add("folhear-titulo-largo");
    else if (!c.contains("folhear-empurra")) {
      c.add("folhear-empurra");
      // Um empurrão de uma passada anterior DENTRO do bloco (o quadro da
      // mecânica de uma árvore, por exemplo) ficou velho: o bloco inteiro
      // mudou de lugar, e a quebra antiga separaria o título do resto (o
      // cabeçalho do Bardo ficava sozinho numa coluna vazia). Sai, e a
      // próxima passada confere de novo.
      el.querySelectorAll(".folhear-empurra").forEach((d) => d.classList.remove("folhear-empurra"));
    }
    else if (!c.contains("folhear-inteira") && cabe.get(el)) c.add("folhear-inteira", "folhear-segura");
    else if (!c.contains("folhear-calcado") && !c.contains("folhear-tentou-calco")) {
      c.add("folhear-tentou-calco");
      calcar(el, resto.get(el) ?? null);
    }
    else return;
    mudou++;
    mudaram.push(el);
  });
  arvoresDeTitulosPendentes = new Set(mudaram.map((el) => el.closest(".livro-arvore")).filter((a): a is Element => !!a));
  return mudou;
}

/**
 * A PRANCHA NÃO DEIXA BURACO.
 *
 * A prancha (a arte que atravessa a página) não se parte: se não couber no
 * resto da página, vai inteira pra seguinte — e o que vinha antes dela fica
 * sozinho no alto da página anterior, com um buraco embaixo. Quando isso
 * acontece (buraco maior que um quinto da página), ela volta pra coluna,
 * menor, e o texto preenche o lugar.
 *
 * @returns quantas pranchas voltaram pra coluna
 */
export function acomodarPranchas(fluxo: Element, g: Geometria, r: Regua): number {
  const pranchas = Array.from(fluxo.querySelectorAll<HTMLElement>(".livro-prancha:not(.livro-prancha-coluna)")).filter(visivel);
  if (pranchas.length === 0) return 0;
  pranchas.forEach((el) => {
    el.classList.remove("folhear-prancha-coluna", "folhear-prancha-encaixada");
    el.style.removeProperty("height");
  });
  const alturaDaColuna = g.altura - g.topo - g.pe;
  const topo = fluxo.getBoundingClientRect().top;
  const pagina = (x: number) => Math.floor((x - r.origem) / r.k / g.pagina);
  const voltam: [HTMLElement, number][] = [];
  for (const el of pranchas) {
    const q = el.getBoundingClientRect();
    if ((q.top - topo) / r.k > 24) continue;
    // O que vem antes dela, na ordem de leitura.
    let antes: Element | null = el.previousElementSibling;
    for (let n: Element | null = el; !antes && n && n !== fluxo; n = n.parentElement) antes = n.parentElement?.previousElementSibling ?? null;
    const rs = antes ? Array.from(antes.getClientRects()).filter((x) => x.height > 1) : [];
    const ultimo = rs[rs.length - 1];
    if (!ultimo || pagina(ultimo.left) !== pagina(q.left) - 1) continue;
    const buraco = alturaDaColuna - (ultimo.bottom - topo) / r.k;
    if (buraco > alturaDaColuna * 0.28) voltam.push([el, Math.floor(buraco - 60)]);
  }
  /*
   * A PRANCHA NÃO ENCOLHE PRA COLUNA (2026-09-26). Ela voltava pra coluna,
   * pequena — o Triângulo dos Estilos virava um selo — e o autor não gostou.
   * Agora ela continua de margem a margem e ganha a altura do buraco que
   * deixaria: sobe pra página anterior, recortada em faixa mais baixa. Buraco
   * pequeno (menos de ~28% da coluna) fica: é um pé de página, não um vão.
   */
  voltam.forEach(([el, altura]) => {
    el.classList.add("folhear-prancha-encaixada");
    el.style.height = `${altura}px`;
  });
  return voltam.length;
}

/**
 * A VITRINE ESTICA ATÉ O PÉ DA PÁGINA.
 *
 * Um bloco de página inteira (as páginas de raça) sempre começa numa página
 * nova, e o texto que vem antes dele termina onde terminar: sobrava um buraco
 * de meia página, às vezes mais, antes da primeira raça. A vitrine
 * (`.livro-vitrine`) mora nesse lugar. Ela nasce com altura zero, e aqui ganha
 * a altura exata que falta até o pé da página — o CSS reorganiza o conteúdo
 * pelo tamanho que ela recebeu (consulta de contêiner). Com menos de ~150 px
 * sobrando ela não aparece: um pé de página curto em branco é normal.
 *
 * Roda por último, depois de tudo que mexe em onde as coisas caem: o que vem
 * depois da vitrine começa numa página nova de qualquer jeito, então esticá-la
 * não muda mais nada no livro.
 */
export function esticarVitrines(fluxo: Element, g: Geometria, r: Regua): void {
  const alturaDaColuna = g.altura - g.topo - g.pe;
  const vitrines = Array.from(fluxo.querySelectorAll<HTMLElement>(".livro-vitrine"));
  if (vitrines.length === 0) return;
  vitrines.forEach((el) => {
    el.classList.remove("folhear-vitrine-cheia", "folhear-vitrine-compacta", "folhear-vitrine-some", "folhear-vitrine-faixa", "folhear-fecho-inteiro");
    el.style.removeProperty("--altura-vitrine");
  });
  const topo = fluxo.getBoundingClientRect().top;
  // Lê tudo antes de escrever: cada escrita rediagramaria o livro.
  const medidas = vitrines.map((el) => alturaDaColuna - (el.getBoundingClientRect().top - topo) / r.k);
  vitrines.forEach((el, i) => {
    const resto = Math.floor(medidas[i]) - 2;
    // A vitrine de coluna existe pra encher o buraco AO LADO de alguma coisa.
    // Se ela abre a coluna, não enche nada — cria o buraco: vira uma faixa
    // baixa de margem a margem, e o que vem depois sobe.
    if (el.classList.contains("livro-vitrine-arvores") && resto >= alturaDaColuna - 10) {
      el.classList.add("folhear-vitrine-faixa");
      return;
    }
    // O fecho da árvore tem regra própria (fecharArvores).
    if (el.classList.contains("livro-fecho-arvore")) return;
    // A vitrine de coluna (a das árvores) já nasce visível, com altura mínima: só cresce.
    // O fecho é uma ilustração: faixa baixa demais só mostraria um recorte.
    if (resto < (el.classList.contains("livro-fecho") ? 340 : 150)) {
      // Sem espaço, a vitrine sai de vez: com altura zero ela ficava lá,
      // invisível, com os brasões transbordando pro pé da página.
      if (!el.classList.contains("livro-fecho") && !el.classList.contains("livro-vitrine-arvores")) el.classList.add("folhear-vitrine-some");
      return;
    }
    el.style.setProperty("--altura-vitrine", `${resto}px`);
    el.classList.add("folhear-vitrine-cheia");
  });
  // Fecho de capítulo entra inteiro. Essas imagens são lazy e ainda não têm
  // naturalWidth quando esta passada roda; tentar decidir pelo tamanho natural
  // deixava justamente os fechos baixos em `cover`, cortando 60% da cena.
  vitrines
    .filter((el) => el.classList.contains("livro-fecho") && !el.classList.contains("livro-fecho-arvore") && el.classList.contains("folhear-vitrine-cheia"))
    .forEach((el) => el.classList.add("folhear-fecho-inteiro"));
  // O espaço mudou com o resto do livro (uma prancha nova antes, um texto
  // maior): se o conteúdo não coube, somem os nomes; se nem assim, a vitrine.
  const transborda = (el: HTMLElement) => el.scrollHeight > el.clientHeight + 2;
  const visiveis = vitrines.filter(
    (el) => !el.classList.contains("livro-fecho") && !el.classList.contains("folhear-vitrine-faixa") && (el.classList.contains("folhear-vitrine-cheia") || el.classList.contains("livro-vitrine-arvores")),
  );
  const cheias = visiveis.filter(transborda);
  if (cheias.length === 0) return;
  cheias.forEach((el) => el.classList.add("folhear-vitrine-compacta"));
  cheias.filter(transborda).forEach((el) => el.classList.add("folhear-vitrine-some"));
}

/**
 * O GRAND FINALE DA ÁRVORE — 2026-09-26.
 *
 * Toda árvore começa em página nova, então a última página dela sobra. O fecho
 * (FimDaArvore) ocupa esse resto, e o lugar dele depende do FORMATO da arte —
 * cada opção é medida, e ganha a que mostra mais da arte:
 *
 * - faixa: de margem a margem, no pé da página (arte deitada);
 * - coluna: do fim do texto até o pé, na coluna onde o texto acabou;
 * - ao lado: a coluna da direita inteira, quando o texto acabou na da
 *   esquerda (arte em pé);
 * - página: uma página inteira depois da árvore (quando nada mais serve).
 *
 * NUNCA borrado (o autor: "não gosto desse borrado, acho feio"): a arte sempre
 * enche o quadro (cover) e a escolha do quadro é que evita cortar demais.
 * Arte ampliada mais de 1,6× perde ponto — borraria de outro jeito.
 *
 * A árvore sem prancha fecha com a marca de fim (o símbolo): só faixa ou
 * coluna, e some se não couber.
 */
export function fecharArvores(fluxo: Element, g: Geometria, r: Regua): void {
  const fechos = Array.from(fluxo.querySelectorAll<HTMLElement>(".livro-fecho-arvore"));
  if (fechos.length === 0) return;
  const colunaAlta = g.altura - g.topo - g.pe;
  const FOLGA = 28;
  const CLASSES = ["folhear-vitrine-cheia", "folhear-fecho-coluna", "folhear-fecho-lado", "folhear-fecho-inteiro", "folhear-vitrine-some"];
  const limpar = (el: HTMLElement) => {
    el.classList.remove(...CLASSES);
    el.style.removeProperty("--altura-vitrine");
  };
  fechos.forEach(limpar);
  const topo = fluxo.getBoundingClientRect().top;
  const meiaPagina = g.pagina / 2;
  const pagina = (q: DOMRect) => Math.floor((q.left - r.origem) / r.k / g.pagina);
  const coluna = (q: DOMRect) => Math.floor(((q.left - r.origem) / r.k + Math.min(q.width / r.k / 2, 40)) / meiaPagina);
  /*
   * Mede o fecho E a página onde a árvore acaba, na mesma leitura: um fecho
   * que vira página inteira empurra todas as árvores seguintes uma página, e
   * comparar com a página de antes fazia as seguintes "pularem" em cadeia.
   */
  const medir = (el: HTMLElement) => {
    const q = el.getBoundingClientRect();
    const antes = el.previousElementSibling;
    const rs = antes ? Array.from(antes.getClientRects()).filter((a) => a.height > 1) : [];
    const fim = rs.length ? pagina(rs[rs.length - 1]) : -1;
    // Até onde o texto desce em cada coluna da página do fecho, acima dele.
    const fundos = [0, 0];
    for (const a of rs) {
      if (pagina(a) !== pagina(q) || a.top >= q.top) continue;
      const c = coluna(a) % 2;
      const cols = a.width / r.k > meiaPagina ? [0, 1] : [c];
      for (const k of cols) fundos[k] = Math.max(fundos[k], (a.bottom - topo) / r.k);
    }
    return { resto: colunaAlta - (q.top - topo) / r.k, topo: (q.top - topo) / r.k, largura: q.width / r.k, pagina: pagina(q), coluna: coluna(q), mesma: pagina(q) === fim, fundos };
  };

  // As três medidas, cada uma numa rodada (escreve tudo, lê tudo).
  const faixa = fechos.map(medir);
  fechos.forEach((el) => el.classList.add("folhear-fecho-coluna"));
  const col = fechos.map(medir);
  fechos.forEach((el) => el.classList.add("folhear-fecho-lado"));
  const lado = fechos.map(medir);
  fechos.forEach(limpar);

  type Opcao = { nome: "faixa" | "coluna" | "lado" | "pagina"; w: number; h: number };
  const larguraCheia = g.pagina - g.margem * 2;
  const escolhas = fechos.map((el, i): Opcao | null => {
    const opcoes: Opcao[] = [];
    if (faixa[i].mesma && faixa[i].resto >= 260) opcoes.push({ nome: "faixa", w: faixa[i].largura || larguraCheia, h: faixa[i].resto - FOLGA });
    // Na coluna só se for a da DIREITA: na da esquerda, a arte embaixo do
    // texto deixava a coluna da direita inteira vazia (Desintoxicação).
    if (col[i].mesma && col[i].coluna % 2 === 1 && col[i].resto >= 280) opcoes.push({ nome: "coluna", w: col[i].largura, h: col[i].resto - FOLGA });
    // "Ao lado" só vale se a quebra levou o fecho pro alto da coluna da
    // DIREITA da mesma página (o texto acabou na da esquerda).
    if (lado[i].mesma && lado[i].coluna % 2 === 1 && lado[i].topo < 30) opcoes.push({ nome: "lado", w: lado[i].largura, h: colunaAlta - 4 - FOLGA });
    const marca = el.classList.contains("livro-fecho-marca");
    // A marca prefere a coluna ao lado (a da direita inteira, símbolo no meio)
    // a uma faixa baixa embaixo do texto.
    if (marca) return opcoes.find((o) => o.nome === "lado") ?? opcoes.find((o) => o.nome === "faixa") ?? opcoes.find((o) => o.nome === "coluna") ?? null;
    opcoes.push({ nome: "pagina", w: larguraCheia, h: colunaAlta - 4 });
    const w = Number(el.dataset.largura) || 0;
    const h = Number(el.dataset.altura) || 0;
    if (!w || !h) return opcoes[0];
    /*
     * O branco que cada opção deixa na página onde o texto acaba (2026-09-27).
     * "Ao lado" deixa vazio o que sobrou embaixo do texto na coluna da
     * esquerda (o fim da Teórica ficou com 77% dela em branco); "página" deixa
     * isso E a coluna da direita. A faixa e a coluna enchem o resto.
     */
    // Medido com o fecho na largura da coluna, logo depois do texto: o topo
    // dele é onde o texto acaba (a faixa larga equilibraria as colunas).
    const sobraNoTexto = col[i].mesma ? Math.max(0, col[i].resto) / colunaAlta : 0;
    const textoNaEsquerda = col[i].coluna % 2 === 0;
    // A faixa atravessa a página: o que ficar acima dela sem texto (um bloco
    // que não parte não se equilibra nas duas colunas) também é branco.
    const vazioDaFaixa = faixa[i].fundos.reduce((soma, f) => soma + Math.max(0, faixa[i].topo - f), 0) / (2 * colunaAlta);
    const vazio = (o: Opcao) =>
      o.nome === "lado"
        ? sobraNoTexto
        : o.nome === "pagina"
          ? textoNaEsquerda ? (sobraNoTexto + 1) / 2 : sobraNoTexto / 2
          : o.nome === "faixa"
            ? vazioDaFaixa
            : 0;
    const nota = (o: Opcao) => {
      const escala = Math.max(o.w / w, o.h / h);
      const mostra = (o.w * o.h) / (w * h * escala * escala);
      const area = (o.w * o.h) / (larguraCheia * colunaAlta);
      // Abaixo de 45% visível a arte entra inteira, com tarja escura dos lados
      // (folhear-fecho-inteiro) — pior que um quadro cheio.
      const tarja = mostra < 0.45 ? 0.8 : 1;
      return mostra * tarja * (escala > 1.6 ? 0.6 : 1) * Math.pow(area, 0.15) * (o.nome === "pagina" ? 0.4 : 1) * (1 - 0.8 * vazio(o));
    };
    return opcoes.reduce((a, b) => (nota(b) > nota(a) ? b : a));
  });

  const aplicar = (el: HTMLElement, o: Opcao | null) => {
    limpar(el);
    if (!o) {
      el.classList.add("folhear-vitrine-some");
      return;
    }
    if (o.nome === "coluna") el.classList.add("folhear-fecho-coluna");
    if (o.nome === "lado") el.classList.add("folhear-fecho-coluna", "folhear-fecho-lado");
    el.style.setProperty("--altura-vitrine", `${Math.floor(o.h)}px`);
    el.classList.add("folhear-vitrine-cheia");
  };
  fechos.forEach((el, i) => aplicar(el, escolhas[i]));
  // Quando nem o melhor quadro serve (cortaria mais da metade da arte, ou a
  // ampliaria demais), a arte entra INTEIRA sobre fundo escuro — uma foto na
  // moldura, sem borrão.
  fechos.forEach((el, i) => {
    const o = escolhas[i];
    const w = Number(el.dataset.largura) || 0;
    const h = Number(el.dataset.altura) || 0;
    if (!o || !w || !h) return;
    const escala = Math.max(o.w / w, o.h / h);
    const mostra = (o.w * o.h) / (w * h * escala * escala);
    el.classList.toggle("folhear-fecho-inteiro", mostra < 0.5 || escala > 1.6);
  });

  // A conferência: o fecho ficou na página onde a árvore acaba? Se pulou, vira
  // página inteira (a marca de fim some).
  const pularam = fechos.filter((el, i) => {
    const o = escolhas[i];
    return o && o.nome !== "pagina" && !medir(el).mesma;
  });
  pularam.forEach((el) => {
    const o = el.classList.contains("livro-fecho-marca") ? null : { nome: "pagina" as const, w: larguraCheia, h: colunaAlta - 4 };
    aplicar(el, o);
    // A opção mudou depois da escolha inicial; recalcula também o recorte.
    // Sem isso, um fecho que pulava para página inteira continuava em `cover`
    // com a decisão tomada para a faixa anterior e mostrava só 36–40% da arte.
    const w = Number(el.dataset.largura) || 0;
    const h = Number(el.dataset.altura) || 0;
    if (!o || !w || !h) return;
    const escala = Math.max(o.w / w, o.h / h);
    const mostra = (o.w * o.h) / (w * h * escala * escala);
    el.classList.toggle("folhear-fecho-inteiro", mostra < 0.5 || escala > 1.6);
  });
}

/**
 * Tira os calços que ficaram no lugar errado.
 *
 * O calço é medido pro layout da hora em que entrou; um empurrão posterior
 * (outro título, outra tabela) pode mudar tudo antes dele, e aí ele cai no
 * topo de uma coluna — uma coluna inteira em branco — ou vaza pra coluna
 * seguinte. Esses saem, e o bloco que eles empurravam volta a ser conferido
 * do zero na próxima rodada, com a medida nova.
 *
 * @returns quantos calços saíram
 */
export function limparCalcosInuteis(fluxo: Element, r: Regua, g: Pick<Geometria, "pagina">): number {
  const topo = fluxo.getBoundingClientRect().top;
  const pagina = (q: DOMRect) => Math.floor((q.left - r.origem) / r.k / g.pagina);
  // Tudo lido antes de tirar qualquer calço (tirar um rediagrama o livro).
  const inuteis = Array.from(fluxo.querySelectorAll(".folhear-calco")).filter((calco) => {
    const primeiro = calco.getClientRects()[0];
    if (!primeiro) return false;
    // Vazar uns pixels pra página seguinte é o esperado (é o que empurra o
    // bloco); inútil é o calço que já começa no topo de uma coluna…
    if ((primeiro.top - topo) / r.k < 8) return true;
    // …ou o que não empurrou nada: o bloco dele ficou na MESMA página, ao
    // lado de uma coluna que o calço deixou em branco (a tabela das etapas do
    // Tiro Perfeito, com meia página vazia do lado).
    const depois = calco.nextElementSibling?.getClientRects()[0];
    return !!depois && pagina(depois) === pagina(primeiro);
  });
  inuteis.forEach((calco) => {
    calco.nextElementSibling?.classList.remove("folhear-calcado", "folhear-inteira", "folhear-segura", "folhear-empurra");
    calco.remove();
  });
  if (inuteis.length) arvoresDeTitulosPendentes = null;
  return inuteis.length;
}

/**
 * Tira os empurrões que ficaram velhos.
 *
 * Um empurrão é decidido na passada em que o bloco estava no pé da coluna.
 * Os empurrões seguintes mudam o que vem antes dele, e às vezes o bloco passa
 * a caber com folga onde estava — mas continua mandado pra próxima coluna,
 * deixando a anterior quase vazia (a tabela de ranks do Lutador deixava 79%
 * de uma coluna em branco). Aqui sai todo empurrão que abre uma coluna depois
 * de um vão de mais de 30% na anterior; a conferência de títulos roda de novo
 * e empurra de volta o que ainda precisar.
 *
 * @returns quantos empurrões saíram
 */
export function soltarEmpurroesVelhos(fluxo: Element, g: Geometria, r: Regua): number {
  const topo = fluxo.getBoundingClientRect().top;
  const alturaDaColuna = g.altura - g.topo - g.pe;
  const meiaPagina = g.pagina / 2;
  const coluna = (q: DOMRect) => {
    const x = (q.left - r.origem) / r.k + Math.min(q.width / r.k / 2, 40);
    return Math.floor(x / meiaPagina);
  };
  // Tudo lido antes de mexer em qualquer classe: uma escrita no meio das
  // leituras obrigaria o navegador a diagramar o livro de novo a cada volta.
  const velhos = Array.from(fluxo.querySelectorAll(".folhear-empurra")).filter((el) => {
    const q = el.getClientRects()[0];
    let antes = el.previousElementSibling;
    while (antes && !Array.from(antes.getClientRects()).some((a) => a.height > 1)) antes = antes.previousElementSibling;
    if (!q || !antes) return false;
    const pedacos = antes.getClientRects();
    const fim = pedacos[pedacos.length - 1];
    // Uma coluna inteira (ou uma página) em branco entre o texto e o bloco:
    // o empurrão pulou demais (peça larga empurrada logo depois de uma página
    // que acabou cheia deixava a página seguinte vazia).
    if (coluna(fim) < coluna(q) - 1) return true;
    if (coluna(fim) !== coluna(q) - 1) return false;
    return alturaDaColuna - (fim.bottom - topo) / r.k > alturaDaColuna * 0.3;
  });
  velhos.forEach((el) => el.classList.remove("folhear-empurra"));
  if (velhos.length) arvoresDeTitulosPendentes = null;
  return velhos.length;
}

/**
 * Tabela larga que abriria um buraco volta pra coluna — 2026-09-26.
 *
 * A tabela que atravessa a página (espalharTabelasEspremidas) só começa
 * depois do que as DUAS colunas já têm. Quando isso não cabe, ela desce
 * inteira pra página seguinte e deixa a anterior com meia coluna em branco
 * (as Três Facções deixavam 68% de uma coluna vazia). Apertada numa coluna
 * ela fica mais alta, mas começa onde o texto parou: melhor que o buraco.
 * O título que atravessava junto com ela volta pra coluna também.
 *
 * @returns quantas tabelas voltaram pra coluna
 */
export function estreitarTabelasQueAbremBuraco(fluxo: Element, g: Geometria, r: Regua): number {
  const topo = fluxo.getBoundingClientRect().top;
  const colunaAlta = g.altura - g.topo - g.pe;
  const pagina = (q: DOMRect) => Math.floor((q.left - r.origem) / r.k / g.pagina);
  // Calço é vão de propósito: não conta como conteúdo, e sai junto.
  const visto = (el: Element | null) => !!el && !el.classList.contains("folhear-calco") && Array.from(el.getClientRects()).some((a) => a.height > 1);
  const voltar: Element[] = [];
  const calcos: Element[] = [];
  const calcosAntes = (el: Element) => {
    for (let c = el.previousElementSibling; c && !visto(c); c = c.previousElementSibling) if (c.classList.contains("folhear-calco")) calcos.push(c);
  };
  fluxo.querySelectorAll(".livro-tabela.folhear-larga, .livro-caixa.folhear-larga").forEach((larga) => {
    if (!visivel(larga)) return;
    if (larga.classList.contains("folhear-torre")) return;
    /*
     * O buraco DEPOIS da peça larga (2026-09-26): a tabela das Três Facções
     * fechava a pág. 244 no meio, e o que vinha depois (duas caixas curtas e a
     * seção seguinte) pulava inteiro pra próxima página, deixando metade da
     * mancha em branco. Voltando pra coluna, a tabela divide a página com o
     * texto em vez de encerrá-la.
     */
    const ql = Array.from(larga.getClientRects()).filter((a) => a.height > 1).pop();
    let depois: Element | null = larga.nextElementSibling;
    for (let pai = larga.parentElement; !depois && pai && pai !== fluxo; pai = pai.parentElement) depois = pai.nextElementSibling;
    while (depois && !visto(depois)) depois = depois.nextElementSibling;
    const qd = depois && Array.from(depois.getClientRects()).find((a) => a.height > 1);
    // Só quando o que pulou é coluna comum: se o seguinte também é largo, ou
    // outro capítulo, o salto é dele e não da tabela.
    const comum = !!depois && !depois.matches(".folhear-larga, .folhear-capitulo, [data-capitulo]") && !depois.querySelector(":scope > .folhear-larga:first-child");
    if (comum && ql && qd && pagina(qd) === pagina(ql) + 1 && (qd.top - topo) / r.k < 40 && colunaAlta - (ql.bottom - topo) / r.k > colunaAlta * 0.3) {
      voltar.push(larga);
      calcosAntes(larga);
      let t = larga.previousElementSibling;
      while (t && !visto(t)) t = t.previousElementSibling;
      if (t?.matches("h3.folhear-larga, h4.folhear-larga")) {
        voltar.push(t);
        calcosAntes(t);
      }
      return;
    }
    let antes = larga.previousElementSibling;
    while (antes && !visto(antes)) antes = antes.previousElementSibling;
    // O título que desceu atravessando junto: o buraco fica antes dele, e é
    // ele que abre a página.
    const titulo = antes?.matches("h3.folhear-larga, h4.folhear-larga") ? antes : null;
    const q = Array.from((titulo ?? larga).getClientRects()).find((a) => a.height > 1);
    if (!q || (q.top - topo) / r.k > 30) return; // abre a página (a margem do título conta)
    if (titulo) {
      antes = titulo.previousElementSibling;
      while (antes && !visto(antes)) antes = antes.previousElementSibling;
    }
    if (!antes) return;
    const pedacos = antes.getClientRects();
    const fim = pedacos[pedacos.length - 1];
    if (!fim || pagina(fim) !== pagina(q) - 1) return;
    if (colunaAlta - (fim.bottom - topo) / r.k <= colunaAlta * 0.3) return;
    voltar.push(larga);
    calcosAntes(larga);
    if (titulo) {
      voltar.push(titulo);
      calcosAntes(titulo);
    }
  });
  voltar.forEach((el) => el.classList.remove("folhear-larga", "folhear-titulo-largo", "folhear-empurra", "folhear-segura", "folhear-inteira", "folhear-calcado"));
  calcos.forEach((c) => c.remove());
  if (voltar.length || calcos.length) arvoresDeTitulosPendentes = null;
  return voltar.length;
}

const CLASSE_VINHETA = "folhear-vinheta";

/**
 * O selo no buraco antes de uma peça larga — 2026-09-26.
 *
 * Antes de uma tabela, arte ou fecho que atravessa a página, o navegador
 * equilibra o que vem antes em duas colunas. Quando o que vem antes é um
 * bloco que não parte (uma caixa curta, um diagrama, uma arte), uma coluna
 * fica cheia e a outra fica com um buraco até a peça larga — o Glossário de
 * Condições abria com meia coluna em branco em cima da tabela. O diagramador
 * de livro não deixa buraco: põe uma vinheta. Aqui ela é o selo do capítulo
 * (ou da árvore), carimbado, do tamanho do vão.
 *
 * Só entra onde cabe sem mexer em nada: a peça larga tem que continuar no
 * mesmo lugar depois. Se alguma andou, a vinheta dela sai.
 *
 * @returns quantas vinhetas ficaram
 */
export function preencherBuracos(fluxo: Element, g: Geometria, r: Regua): number {
  const topo = fluxo.getBoundingClientRect().top;
  const meiaPagina = g.pagina / 2;
  const y = (q: DOMRect) => (q.top - topo) / r.k;
  const base = (q: DOMRect) => (q.bottom - topo) / r.k;
  const coluna = (q: DOMRect) => Math.floor(((q.left - r.origem) / r.k + Math.min(q.width / r.k / 2, 40)) / meiaPagina);
  const MINIMO = 90;

  const largas = Array.from(fluxo.querySelectorAll(".folhear-larga, .livro-vitrine:not(.hidden), figure.livro-prancha")).filter(
    (el) => visivel(el) && getComputedStyle(el).columnSpan === "all",
  );
  const planos: { antes: Element; altura: number; topo: number }[] = [];
  largas.forEach((larga) => {
    const q = Array.from(larga.getClientRects()).find((a) => a.height > 1);
    if (!q) return;
    const esquerda = coluna(q) - (coluna(q) % 2);
    const inicio = y(q);
    // O que vem antes da peça, nesta página: até onde cada coluna desce, e
    // onde a faixa começa (no topo, ou embaixo de outra peça larga).
    const fundo = [0, 0];
    let comeco = 0;
    let achou = false;
    let n: Element | null = larga;
    fora: while (n && n !== fluxo) {
      for (let irmao = n.previousElementSibling; irmao; irmao = irmao.previousElementSibling) {
        if (irmao.classList.contains(CLASSE_VINHETA)) continue;
        let paginaAnterior = false;
        for (const a of Array.from(irmao.getClientRects())) {
          if (a.height <= 1) continue;
          const c = coluna(a);
          if (c < esquerda) paginaAnterior = true;
          if (c < esquerda || c > esquerda + 1 || y(a) >= inicio) continue;
          if (a.width / r.k > meiaPagina) {
            comeco = Math.max(comeco, base(a));
            paginaAnterior = true;
            continue;
          }
          fundo[c - esquerda] = Math.max(fundo[c - esquerda], base(a));
          achou = true;
        }
        if (paginaAnterior) break fora;
      }
      n = n.parentElement;
    }
    // Só o buraco na SEGUNDA coluna se preenche sem mexer no resto: a vinheta
    // entra no fim do que vem antes, e o equilíbrio a põe lá.
    const vao = fundo[0] - Math.max(fundo[1], comeco);
    if (!achou || vao < MINIMO) return;
    planos.push({ antes: larga, altura: Math.floor(vao - 28), topo: inicio });
  });
  if (planos.length === 0) return 0;

  const postas = planos.map((p) => {
    const v = document.createElement("div");
    v.className = CLASSE_VINHETA;
    v.setAttribute("aria-hidden", "true");
    v.style.height = `${p.altura}px`;
    v.style.setProperty("--alto", `${p.altura}px`);
    p.antes.before(v);
    return v;
  });
  // A conferência: a peça larga não pode ter saído do lugar.
  const andaram = planos.map((p) => {
    const q = Array.from(p.antes.getClientRects()).find((a) => a.height > 1);
    return !q || Math.abs(y(q) - p.topo) > 2;
  });
  postas.forEach((v, i) => andaram[i] && v.remove());
  return andaram.filter((a) => !a).length;
}

/**
 * O PÉ DA COLUNA NÃO FICA VAZIO — 2026-09-26.
 *
 * Com a regra da carta inteira (nome, texto e regra nunca se separam), a carta
 * que não cabe no pé da coluna pula pra seguinte e deixa um vão. O diagramador
 * de livro não deixa o vão cru: põe ali o SELO do capítulo ou da árvore, do
 * tamanho do vão.
 *
 * O selo NÃO entra no texto. A primeira versão o inseria no fluxo, e medido:
 * qualquer peça a mais no fluxo muda onde o navegador decide quebrar, e o
 * capítulo inteiro dali pra frente andava. Aqui ele mora numa camada por cima
 * das páginas (`.folhear-pes`, dentro da faixa), posicionado no vão — não
 * empurra nada, e não precisa de conferência.
 *
 * Só em coluna de altura cheia: numa faixa equilibrada em cima de uma peça
 * larga, o pé da coluna não é o pé da página, e o selo cobriria a peça.
 *
 * @returns quantos pés ganharam selo
 */
export function preencherPes(fluxo: Element, g: Geometria, r: Regua): number {
  const faixa = fluxo.parentElement;
  if (!faixa) return 0;
  faixa.querySelector(":scope > .folhear-pes")?.remove();
  const topo = fluxo.getBoundingClientRect().top;
  const caixa = faixa.getBoundingClientRect();
  const colunaAlta = g.altura - g.topo - g.pe;
  const meiaPagina = g.pagina / 2;
  const y = (q: DOMRect) => (q.top - topo) / r.k;
  const base = (q: DOMRect) => (q.bottom - topo) / r.k;
  const coluna = (q: DOMRect) => Math.floor(((q.left - r.origem) / r.k + Math.min(q.width / r.k / 2, 40)) / meiaPagina);
  const visto = (el: Element) =>
    !el.classList.contains("folhear-calco") && !el.classList.contains(CLASSE_VINHETA) && Array.from(el.getClientRects()).some((a) => a.height > 1);
  const anterior = (el: Element): Element | null => {
    for (let n: Element | null = el; n && n !== fluxo; n = n.parentElement) {
      for (let a = n.previousElementSibling; a; a = a.previousElementSibling) if (visto(a)) return a;
    }
    return null;
  };
  /** A coluna `x` (a do bloco) desce até o pé da página, sem peça larga no meio? */
  const colunaCheia = (bloco: Element, x: number): boolean => {
    let n: Element | null = bloco;
    for (let i = 0; i < 80 && n; i++) {
      const rs = Array.from(n.getClientRects()).filter((a) => a.height > 1);
      if (rs.some((a) => a.width / r.k > meiaPagina && coluna(a) >= x - 1)) return false;
      if (rs.some((a) => coluna(a) > x)) return true;
      if (rs.some((a) => coluna(a) === x && base(a) > colunaAlta - 60)) return true;
      n = seguinte(n, fluxo);
    }
    return false;
  };

  /*
   * O mapa do que já ocupa cada coluna: o selo só entra onde não há NADA
   * (medido em 2026-09-26: um selo caiu em cima do diagrama dos Sete
   * Patamares, que atravessava a página logo abaixo). Peça larga ocupa as
   * duas colunas da página.
   */
  const ocupado = new Map<number, [number, number][]>();
  fluxo.querySelectorAll("p, li, tr, h2, h3, h4, figure, .livro-caixa, .livro-verbete, .livro-tabela, .diagrama, dl, blockquote, .livro-vitrine:not(.hidden)").forEach((el) => {
    for (const q of Array.from(el.getClientRects())) {
      if (q.height <= 1) continue;
      const c = coluna(q);
      const cols = q.width / r.k > meiaPagina ? [c - (c % 2), c - (c % 2) + 1] : [c];
      for (const k of cols) {
        const lista = ocupado.get(k) ?? [];
        lista.push([y(q), base(q)]);
        ocupado.set(k, lista);
      }
    }
  });
  // Folga de 16 px: a arte torta da carta, com sombra, passa uns pixels do fim dela.
  const livre = (c: number, de: number, ate: number) => !(ocupado.get(c) ?? []).some(([a, b]) => a < ate && b > de + 16);

  const selos: { left: number; top: number; width: number; height: number; selo: string; cor: string }[] = [];
  const vistos = new Set<Element>();
  fluxo.querySelectorAll(".livro-verbete, .livro-caixa, .livro-tabela, h3, h4").forEach((bloco) => {
    const q = Array.from(bloco.getClientRects()).find((a) => a.height > 1);
    if (!q || y(q) > 30 || q.width / r.k > meiaPagina) return;
    const antes = anterior(bloco);
    if (!antes || vistos.has(antes)) return;
    const pedacos = Array.from(antes.getClientRects()).filter((a) => a.height > 1);
    const fim = pedacos[pedacos.length - 1];
    if (!fim || fim.width / r.k > meiaPagina || coluna(fim) !== coluna(q) - 1) return;
    const vao = colunaAlta - base(fim);
    // Só ornamenta um vazio realmente grande: 15% ou mais da mancha. Em uma
    // página menor a proporção continua correta, sem depender de 130 px fixos.
    if (vao < colunaAlta * 0.15 || !colunaCheia(bloco, coluna(q)) || !livre(coluna(fim), base(fim), colunaAlta)) return;
    vistos.add(antes);
    const estilo = getComputedStyle(antes);
    selos.push({
      left: (fim.left - caixa.left) / r.k,
      top: (fim.bottom - caixa.top) / r.k + 18,
      width: fim.width / r.k,
      height: Math.floor(vao - 30),
      selo: estilo.getPropertyValue("--selo"),
      cor: estilo.getPropertyValue("--cor"),
    });
  });
  if (selos.length === 0) return 0;

  const camada = document.createElement("div");
  camada.className = "folhear-pes";
  camada.setAttribute("aria-hidden", "true");
  for (const s of selos) {
    const v = document.createElement("div");
    v.className = `${CLASSE_VINHETA} folhear-selo-pe`;
    v.style.cssText = `left:${s.left}px;top:${s.top}px;width:${s.width}px;height:${s.height}px;--alto:${s.height}px`;
    if (s.selo) v.style.setProperty("--selo", s.selo);
    if (s.cor) v.style.setProperty("--cor", s.cor);
    camada.append(v);
  }
  faixa.append(camada);
  return selos.length;
}

/** O que o encaixe mexeu, pra desfazer antes de uma nova diagramação. */
const desfazerEncaixe: (() => void)[] = [];

const ARTE_MINIMA = 150;
/** A carta que pode se partir entre o efeito e o cântico. */
const CLASSE_PARTIDA = "folhear-carta-partida";
/** Carta que tentou se partir e não coube: não tenta de novo nesta diagramação. */
let cartasQueNaoPartem = new WeakSet<Element>();
/** Arte que já tentou subir e não coube: não tenta de novo nesta diagramação. */
let artesQueNaoCouberam = new WeakSet<Element>();
const ARTE_MAXIMA = 320;
/** O máximo que o vão acrescenta entre duas cartas quando a coluna se espalha. */
const ESPALHAR_MAXIMO = 56;
/** Colunas já espalhadas nesta diagramação (pelo bloco que fecha a coluna). */
let espalhadas = new WeakSet<Element>();
/** Só as árvores cuja ordem, arte ou espaçamento mudou na passada anterior. */
let arvoresParaEncaixar: Element[] | null = null;
/** Ocupantes estáticos de cada árvore, coletados uma vez por diagramação. */
let ocupantesDasArvores = new WeakMap<Element, Element[]>();
/**
 * O VÃO NO PÉ DA COLUNA SE ENCHE COM CARTA OU COM ARTE — 2026-09-26.
 *
 * A carta não se parte (pedido do autor: nome, texto e regra juntos). Quando a
 * próxima não cabe no pé da coluna, ela pula pra seguinte e deixa um vão — o
 * autor chamou isso de "espaço enorme e vazio", e o selo no pé (preencherPes)
 * enfeita o vão mas não o enche. O diagramador de livro enche, nesta ordem:
 *
 * 1. **A carta menor sobe.** Dentro de um patamar a ordem das cartas não é
 *    regra: a maior carta do MESMO patamar que cabe no vão entra nele.
 * 2. **A arte da carta de cima cresce** até o pé (ela é `object-contain` com o
 *    fundo borrado da própria cena, então crescer não corta nada).
 * 3. **A arte da carta de baixo sobe** pro vão, e o texto dela abre a coluna
 *    seguinte inteiro. A arte já podia ir sozinha pra outra coluna (o autor
 *    liberou); aqui ela vai pra antes, no tamanho do vão.
 *
 * Só pra vão de coluna de altura cheia (sem peça larga embaixo). O que muda
 * carta de coluna (1 e 3) é um por árvore a cada passada — cada árvore começa
 * em página nova, então mexer numa não muda a diagramação da outra; o que não
 * muda nada de coluna (2 e 4) entra quantos couberem.
 *
 * @returns quantos vãos foram enchidos nesta passada
 */
export function encaixarCartas(fluxo: Element, g: Geometria, r: Regua): number {
  const topo = fluxo.getBoundingClientRect().top;
  const colunaAlta = g.altura - g.topo - g.pe;
  const meiaPagina = g.pagina / 2;
  const y = (q: DOMRect) => (q.top - topo) / r.k;
  const base = (q: DOMRect) => (q.bottom - topo) / r.k;
  const coluna = (q: DOMRect) => Math.floor(((q.left - r.origem) / r.k + Math.min(q.width / r.k / 2, 40)) / meiaPagina);
  const retangulos = new Map<Element, DOMRect[]>();
  const pedacosAtuais = (el: Element) => Array.from(el.getClientRects()).filter((a) => a.height > 1);
  const pedacos = (el: Element) => {
    let medidos = retangulos.get(el);
    if (!medidos) {
      medidos = pedacosAtuais(el);
      retangulos.set(el, medidos);
    }
    return medidos;
  };
  const ESPACO = 14; // o respiro entre duas cartas, com folga
  const arteDe = (carta: Element | null) =>
    carta?.classList.contains("livro-verbete") ? (carta.querySelector(":scope > .livro-verbete-arte") as HTMLElement | null) : null;

  // Até onde cada coluna já desce: um vão só conta se nada vier embaixo dele
  // (uma peça larga no pé da página equilibra as colunas por cima).
  const fundoDaColuna = new Map<number, number>();
  // A carta que pulou de coluna deixa a CAIXA dela no vão (um pedaço vazio que
  // desce até o pé): conta o que está dentro da carta, não a carta.
  const arvoresAtivas = arvoresParaEncaixar ?? Array.from(fluxo.querySelectorAll(".livro-arvore"));
  if (arvoresAtivas.length === 0) return 0;
  const ocupantes = arvoresAtivas.flatMap((arvore) => {
    let encontrados = ocupantesDasArvores.get(arvore);
    if (!encontrados) {
      encontrados = Array.from(
        arvore.querySelectorAll("p, li, tr, h2, h3, h4, figure, .livro-caixa, .livro-verbete > *, .livro-tabela, .diagrama"),
      );
      ocupantesDasArvores.set(arvore, encontrados);
    }
    return encontrados;
  });
  ocupantes.forEach((el) => {
    for (const q of pedacos(el)) {
      const c = coluna(q);
      const cols = q.width / r.k > meiaPagina ? [c - (c % 2), c - (c % 2) + 1] : [c];
      for (const k of cols) fundoDaColuna.set(k, Math.max(fundoDaColuna.get(k) ?? 0, base(q)));
    }
  });

  const mexidas = new Set<Element>();
  const tocadas = new Set<Element>();
  const consertos: (() => void)[] = [];
  const margensPlanejadas = new Map<HTMLElement, { inline: string; valor: number }>();
  // A arte que sobe tem que ficar no vão: se não coube, ela volta pro fim da carta.
  const conferir: (() => boolean)[] = [];
  const desfazerDaArte: (() => void)[] = [];
  const abridores = arvoresAtivas.flatMap((arvore) => Array.from(arvore.querySelectorAll(".livro-verbete, h4")));
  for (const bloco of abridores) {
    const arvore = bloco.closest(".livro-arvore");
    if (!arvore || mexidas.has(arvore)) continue;
    // Onde a carta começa de verdade: o primeiro pedaço com conteúdo.
    const primeiro = bloco.classList.contains("livro-verbete")
      ? Array.from(bloco.children).find((c) => pedacos(c).length > 0)
      : bloco;
    const q = primeiro ? pedacos(primeiro)[0] : undefined;
    if (!q || y(q) > 30) continue;
    // O que vem antes, e a última carta dele (o patamar anterior acaba numa carta).
    let antes = bloco.previousElementSibling;
    while (antes && pedacos(antes).length === 0) antes = antes.previousElementSibling;
    if (!antes) continue;
    const fim = pedacos(antes).at(-1);
    if (!fim || fim.width / r.k > meiaPagina || coluna(fim) !== coluna(q) - 1) continue;
    // Folga de 12 px: a arte é torta (rotate), e o retângulo dela passa uns
    // pixels do fim da carta.
    if ((fundoDaColuna.get(coluna(fim)) ?? 0) > base(fim) + 12) continue;
    const vao = colunaAlta - base(fim) - ESPACO;
    if (vao < 90) continue;

    // 1. A maior carta do mesmo patamar que cabe no vão.
    if (bloco.classList.contains("livro-verbete")) {
      let melhor: Element | null = null;
      let alturaMelhor = 0;
      for (let n = bloco.nextElementSibling; n; n = n.nextElementSibling) {
        if (!n.classList.contains("livro-verbete")) continue;
        const p = pedacos(n);
        if (p.length !== 1) continue;
        const h = p[0].height / r.k;
        if (h <= vao && h > alturaMelhor) {
          melhor = n;
          alturaMelhor = h;
        }
      }
      if (melhor) {
        const sobe = melhor;
        const pai = bloco.parentElement!;
        const lugar = sobe.nextElementSibling;
        consertos.push(() => bloco.before(sobe));
        tocadas.add(arvore);
        desfazerEncaixe.push(() => sobe.isConnected && pai.insertBefore(sobe, lugar && lugar.parentElement === pai ? lugar : null));
        mexidas.add(arvore);
        continue;
      }
    }

    // 1b. Vão grande (mais de 1/3 da coluna): a carta se parte ENTRE o efeito e
    //     o cântico (decisão do autor, 2026-09-27). Nome, custo, regra, dano e
    //     formas ficam juntos no vão; o cântico abre a coluna seguinte.
    const cantico = bloco.classList.contains("livro-verbete") ? bloco.querySelector(":scope > .livro-cantico") : null;
    if (cantico && vao > colunaAlta / 3 && !cartasQueNaoPartem.has(bloco)) {
      const antesDoCantico = Array.from(bloco.children).slice(0, Array.from(bloco.children).indexOf(cantico));
      const alturaDeCima = antesDoCantico.reduce((soma, el) => soma + pedacos(el).reduce((h, a) => h + a.height / r.k, 0), 0) + 24;
      if (alturaDeCima <= vao) {
        const colunaDoVao = coluna(fim);
        consertos.push(() => bloco.classList.add(CLASSE_PARTIDA));
        tocadas.add(arvore);
        conferir.push(() => {
          const a = pedacosAtuais(antesDoCantico[0])[0];
          return !!a && coluna(a) === colunaDoVao;
        });
        const volta = () => bloco.classList.remove(CLASSE_PARTIDA);
        desfazerEncaixe.push(volta);
        desfazerDaArte.push(() => {
          volta();
          cartasQueNaoPartem.add(bloco);
        });
        mexidas.add(arvore);
        continue;
      }
    }

    // 2. A arte da carta de cima cresce até o pé.
    const ultimaCarta = antes.classList.contains("livro-verbete") ? antes : antes.querySelector(":scope > .livro-verbete:last-child");
    const arteDeCima = arteDe(ultimaCarta);
    const qa = arteDeCima ? pedacos(arteDeCima).at(-1) : undefined;
    if (arteDeCima && qa && Math.abs(base(qa) - base(fim)) < 12) {
      const atual = qa.height / r.k;
      const nova = Math.min(ARTE_MAXIMA, tetoDaArte(arteDeCima), atual + vao);
      if (nova - atual >= 40) {
        consertos.push(() => alturaDaArte(arteDeCima, nova));
        tocadas.add(arvore);
        desfazerEncaixe.push(() => alturaDaArte(arteDeCima, null));
        continue; // local: nada muda de coluna, a árvore segue nesta passada
      }
    }

    // 3. A arte da carta de baixo sobe pro vão.
    const arteDeBaixo = arteDe(bloco);
    if (arteDeBaixo && vao >= ARTE_MINIMA && !artesQueNaoCouberam.has(arteDeBaixo)) {
      const alto = Math.min(ARTE_MAXIMA, tetoDaArte(arteDeBaixo), Math.floor(vao - 12));
      const colunaDoVao = coluna(fim);
      conferir.push(() => {
        const qa = pedacosAtuais(arteDeBaixo)[0];
        return !!qa && coluna(qa) === colunaDoVao;
      });
      consertos.push(() => {
        arteDeBaixo.classList.add("folhear-arte-antes");
        alturaDaArte(arteDeBaixo, alto);
        bloco.prepend(arteDeBaixo);
      });
      tocadas.add(arvore);
      const volta = () => {
        arteDeBaixo.classList.remove("folhear-arte-antes");
        alturaDaArte(arteDeBaixo, null);
        if (arteDeBaixo.parentElement === bloco) bloco.append(arteDeBaixo);
      };
      desfazerEncaixe.push(volta);
      desfazerDaArte.push(() => {
        volta();
        artesQueNaoCouberam.add(arteDeBaixo);
      });
      mexidas.add(arvore);
      continue;
    }

    // 4. Nada cabe: o vão se espalha entre as cartas da coluna (a coluna
    //    justifica, como a de um livro impresso), até ESPALHAR_MAXIMO por
    //    junção. Só o que já está na coluna ganha margem, e a soma não passa do
    //    vão: nada muda de coluna, então não precisa de conferência.
    const colunaDoVao = coluna(fim);
    // Antes de um patamar novo, o que vem antes é o patamar anterior inteiro:
    // quem se espalha são as cartas dele.
    const grupo = antes.querySelector(":scope > .livro-verbete") ? antes : antes.parentElement;
    const juncoes = Array.from(grupo?.children ?? []).filter((el) => {
      const a = pedacos(el)[0];
      return !!a && coluna(a) === colunaDoVao && y(a) > 30 && !(el as HTMLElement).dataset.espalhada;
    }) as HTMLElement[];
    if (juncoes.length > 0 && !espalhadas.has(antes)) {
      const extra = Math.min(ESPALHAR_MAXIMO, Math.floor((vao - 8) / juncoes.length));
      if (extra >= 6) {
        espalhadas.add(antes);
        tocadas.add(arvore);
        // Captura as margens antes do lote de escritas para não forçar layout
        // no meio dos consertos; o mapa preserva acréscimos acumulados.
        const margens = juncoes.map((el) => {
          const planejada = margensPlanejadas.get(el);
          const antiga = planejada?.inline ?? el.style.marginTop;
          const valor = (planejada?.valor ?? parseFloat(getComputedStyle(el).marginTop)) + extra;
          const nova = `${valor}px`;
          margensPlanejadas.set(el, { inline: nova, valor });
          return { el, antiga, nova };
        });
        consertos.push(() =>
          margens.forEach(({ el, antiga, nova }) => {
            el.style.marginTop = nova;
            el.dataset.espalhada = "1";
            desfazerEncaixe.push(() => {
              el.style.marginTop = antiga;
              delete el.dataset.espalhada;
            });
          }),
        );
      }
    }
  }
  // Em lote: ler posição entre uma mudança e outra rediagramaria o livro inteiro.
  consertos.forEach((c) => c());
  const falhas = conferir.map((ok) => !ok());
  desfazerDaArte.forEach((volta, i) => falhas[i] && volta());
  arvoresParaEncaixar = [...tocadas];
  return consertos.length - falhas.filter(Boolean).length;
}

/**
 * Até onde a arte pode crescer sem ampliar o arquivo mais de 1,5× (borra). Sem
 * o arquivo carregado ainda, não se sabe: vale o teto geral.
 */
function tetoDaArte(arte: HTMLElement): number {
  const img = arte.querySelector("img:not(.blur-2xl)") as HTMLImageElement | null;
  return img?.naturalHeight ? img.naturalHeight * 1.5 : ARTE_MAXIMA;
}

/**
 * A arte do livro é 16:9 (altura pela largura): pra mudar a altura sem ela
 * crescer pro lado e estourar a coluna, a proporção fica livre. A imagem é
 * `contain` com o fundo borrado da própria cena, então nada se corta.
 */
function alturaDaArte(arte: HTMLElement, alto: number | null): void {
  if (alto === null) {
    arte.style.removeProperty("height");
    arte.style.removeProperty("aspect-ratio");
    return;
  }
  arte.style.height = `${Math.floor(alto)}px`;
  arte.style.aspectRatio = "auto";
}

/** Devolve cartas e artes ao lugar do livro (antes de uma nova diagramação). */
function desencaixarCartas(): void {
  while (desfazerEncaixe.length) desfazerEncaixe.pop()!();
  artesQueNaoCouberam = new WeakSet();
  espalhadas = new WeakSet();
  cartasQueNaoPartem = new WeakSet();
  arvoresParaEncaixar = null;
  ocupantesDasArvores = new WeakMap();
}

/** Tira os empurrões antes de uma nova diagramação (outra geometria, outro texto). */
export function soltarTitulos(fluxo: Element): void {
  desencaixarCartas();
  arvoresDeTitulosPendentes = null;
  titulosDoFluxo = null;
  tabelasDoFluxo = null;
  // Os selos do pé (preencherPes) são da diagramação passada.
  fluxo.parentElement?.querySelector(":scope > .folhear-pes")?.remove();
  fluxo.querySelectorAll(".folhear-empurra").forEach((el) => el.classList.remove("folhear-empurra"));
  fluxo.querySelectorAll(".folhear-titulo-largo").forEach((el) => el.classList.remove("folhear-titulo-largo", "folhear-larga"));
  fluxo.querySelectorAll(".folhear-segura").forEach((el) => el.classList.remove("folhear-segura", "folhear-inteira"));
  fluxo.querySelectorAll(".folhear-calcado, .folhear-tentou-calco").forEach((el) => el.classList.remove("folhear-calcado", "folhear-tentou-calco"));
  fluxo.querySelectorAll(".folhear-calco").forEach((el) => el.remove());
  fluxo.querySelectorAll(`.${CLASSE_VINHETA}`).forEach((el) => el.remove());
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
      // O catálogo de itens vira verbetes no livro (sem cabeçalho de tabela).
      if (!visivel(tabela) || tabela.closest(".livro-catalogo-itens")) return;
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
  const eventos: {
    pagina: number;
    capitulo?: string;
    capituloId?: string;
    secao?: string;
    arvoreId?: string;
    arvoreNome?: string;
    arvoreFamilia?: string;
  }[] = [];
  for (const cap of toc) {
    const el = document.getElementById(cap.id);
    if (!el || !fluxo.contains(el)) continue;
    paginaDe[cap.id] = pagina(el);
    eventos.push({ pagina: paginaDe[cap.id], capitulo: rotuloDoCapitulo(cap.label, true), capituloId: cap.id });
    for (const s of cap.children ?? []) {
      const es = document.getElementById(s.id);
      if (!es || !fluxo.contains(es) || !visivel(es)) continue;
      paginaDe[s.id] = pagina(es);
      if (!s.label.startsWith("—")) eventos.push({ pagina: paginaDe[s.id], secao: s.label });
    }
  }

  // As árvores do catálogo: cada uma "toma" as páginas dela até a próxima.
  fluxo.querySelectorAll<HTMLElement>(".livro-arvore[data-arvore]").forEach((el) => {
    if (!visivel(el)) return;
    const nome = el.querySelector(".livro-arvore-cabeca > span > span:first-child")?.textContent ?? undefined;
    eventos.push({ pagina: pagina(el), arvoreId: el.dataset.arvore, arvoreNome: nome, arvoreFamilia: el.dataset.categoria });
  });

  // As raças: uma página cada, e a página toma a cor e o kanji da raça.
  const racas = new Map<number, { id?: string; nome?: string }>();
  fluxo.querySelectorAll<HTMLElement>(".livro-raca[data-raca]").forEach((el) => {
    racas.set(pagina(el), { id: el.dataset.raca, nome: el.querySelector(".livro-raca-nome")?.textContent ?? undefined });
  });

  const aberturas = new Set<number>();
  fluxo.querySelectorAll(".folhear-fantasma, .folhear-capa, .folhear-guarda, .folhear-rosto, .folhear-sumario, .livro-abertura, .folhear-colofao").forEach((el) => aberturas.add(pagina(el)));

  // `sort` é estável: capítulo e primeira seção na mesma página mantêm a
  // ordem do sumário, e o capítulo zera a seção antes de ela entrar.
  eventos.sort((a, b) => a.pagina - b.pagina);
  const rotulos: Rotulo[] = [];
  let capitulo: string | undefined;
  let capituloId: string | undefined;
  let secao: string | undefined;
  let arvoreId: string | undefined;
  let arvoreNome: string | undefined;
  let arvoreFamilia: string | undefined;
  let i = 0;
  for (let p = 0; p < total; p++) {
    while (i < eventos.length && eventos[i].pagina <= p) {
      const e = eventos[i++];
      if (e.capitulo) {
        capitulo = e.capitulo;
        capituloId = e.capituloId;
        secao = undefined;
        arvoreId = arvoreNome = arvoreFamilia = undefined;
      } else if (e.arvoreId) {
        arvoreId = e.arvoreId;
        arvoreNome = e.arvoreNome;
        arvoreFamilia = e.arvoreFamilia;
      } else {
        secao = e.secao;
      }
    }
    const raca = racas.get(p);
    rotulos.push({
      capitulo,
      capituloId,
      arvoreId,
      arvoreNome,
      arvoreFamilia,
      racaId: raca?.id,
      racaNome: raca?.nome,
      secao,
      abertura: aberturas.has(p),
    });
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
