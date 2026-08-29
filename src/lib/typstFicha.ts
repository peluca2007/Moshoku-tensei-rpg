/**
 * Gera o código-fonte .typ da ficha em PDF a partir dos dados já calculados
 * da ficha (mesma lógica de src/store/selectors.ts). O layout segue o molde
 * enviado pelo usuário: pág. 1 identidade/atributos, pág. 2 combate/inventário,
 * pág. 3+ grimório em paisagem (9 cards por página, repete quantas vezes for
 * preciso pra caber todas as magias/talentos comprados).
 */

export interface FichaAttributeRow {
  short: string;
  label: string;
  value: number;
  /**
   * Cap. 1, §2: Vantagem permanente em todos os Testes de Resistência deste
   * atributo (2 PA). Marcada no PDF com um losango ao lado da sigla — é
   * informação de mesa, e quem joga com a folha impressa precisa vê-la.
   */
  saveAdvantage: boolean;
}

export interface FichaTreeRow {
  label: string;
  rank: string;
}

export interface FichaTreePillar {
  title: string;
  rows: FichaTreeRow[];
}

/**
 * Uma linha da tabela "ARMAS E ATAQUES MARCIAIS" do PDF.
 *
 * Até 2026-08-29 esta interface tinha SÓ `name`, e `weaponsTable` emitia
 * `[], [], [], []` nas outras quatro colunas — ou seja, o Dado Base, os degraus,
 * o acerto e o dano saíam permanentemente em branco no documento gerado, e a
 * descrição da arma não aparecia em lugar nenhum do PDF. Os campos abaixo são
 * exatamente os que o cabeçalho da tabela sempre prometeu.
 */
export interface FichaWeaponRow {
  name: string;
  /** Dado Base da arma, como está no inventário ("d8", "2d6"). */
  baseDie: string;
  /** Degraus acumulados na Escada de Dados e o dado já escalado ("+4 Santo → 2d10"). */
  steps: string;
  /** Bônus de acerto pronto pra rolar ("1d20+7"). */
  attack: string;
  /** Dano total já somado ("2d10+7 · méd. 18"). */
  damage: string;
  /** Texto livre do item, quando houver. */
  description: string;
}

export interface FichaInventoryRow {
  text: string;
}

export interface FichaAbilityCard {
  name: string;
  signature: boolean;
  cost: string;
  time: string;
  range: string;
  effect: string;
}

export interface FichaSpellcastingRow {
  treeName: string;
  bc: string;
  cd: string;
}

export interface FichaPdfPayload {
  name: string;
  raceName: string;
  backgroundName: string;
  gold: string;
  attributes: FichaAttributeRow[];
  maxHp: string;
  maxMp: string;
  maxPt: string;
  maxPp: string;
  armorClass: string;
  initiative: string;
  deslocamento: string;
  paSpent: string;
  /** BC e CD por escola de magia desbloqueada (Cap. 1, seção 7) — cada árvore usa o próprio Rank. */
  spellcasting: FichaSpellcastingRow[];
  trees: FichaTreePillar[];
  traits: string[];
  /** Parágrafos de lore/anotações (já quebrados por parágrafo — ver buildFichaPayload). */
  lore: string[];
  weapons: FichaWeaponRow[];
  inventory: FichaInventoryRow[];
  abilityCards: FichaAbilityCard[];
}

/** Escapa `\` e `"` pra virar um literal de string Typst seguro — o resto do texto passa por dentro sem ser reinterpretado como marcação, porque a interpolação `#valor` insere strings como texto puro. */
function tstr(input: string): string {
  return `"${input.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

const PREAMBLE = `
#set document(title: "Ficha de Personagem - Mushoku Tensei RPG")
#set text(font: "Libertinus Serif", size: 10pt, lang: "pt")
#set page(paper: "a4", margin: 1cm)

#let cor-principal = rgb("4A0E2E")
#let cor-fundo = rgb("FDF6E3")

#let section-title(title) = block(
  width: 100%, fill: cor-principal, inset: 6pt, radius: 2pt,
  text(weight: "bold", size: 11pt, fill: white)[#title]
)

#let field(label, value: "", width: 100%) = block(
  stroke: (bottom: 0.5pt + black), width: width, inset: (bottom: 4pt, top: 4pt),
  [#text(weight: "bold", size: 9pt)[#label] #text(size: 10pt, style: "italic")[#value]]
)

#let stat-box-filled(label, value, height: 35pt) = block(
  stroke: 1.5pt + black, radius: 4pt, width: 100%, height: height, inset: 4pt, fill: rgb("F5F5F5"),
  align(top + center)[
    #text(size: 8pt, weight: "bold")[#label]
    #v(3pt)
    #text(size: 13pt, weight: "bold", fill: cor-principal)[#value]
  ]
)

#let resource-box-filled(label, max) = block(
  stroke: 2pt + cor-principal, radius: 6pt, width: 100%, height: 42pt, inset: 4pt, fill: cor-fundo,
  align(top + center)[
    #text(size: 9pt, weight: "bold", fill: cor-principal)[#label]
    #v(2pt)
    #text(size: 13pt, weight: "bold")[#max]
  ]
)

#let blank-lines(count, spacing: 18pt) = grid(
  columns: 1fr, row-gutter: spacing,
  ..range(count).map(i => line(length: 100%, stroke: 0.5pt + silver))
)

#let rank-field-filled(label, value) = block(
  stroke: (bottom: 0.5pt + silver), width: 100%, inset: (bottom: 2pt, top: 2pt),
  [#text(weight: "bold", size: 8pt)[#label] #text(size: 8pt)[#value]]
)

#let filled-line(value) = block(
  stroke: (bottom: 0.5pt + silver), width: 100%, inset: (bottom: 3pt, top: 3pt),
  text(size: 8.5pt)[#value]
)

#let lore-paragraph(value) = block(
  width: 100%, inset: (bottom: 6pt),
  text(size: 9pt)[#value]
)

#let ability-card(name, cost, time, range, effect) = block(
  stroke: 1.5pt + black, radius: 6pt, width: 100%, height: auto, inset: 8pt, breakable: false,
  [
    #text(weight: "bold", size: 10pt, fill: cor-principal)[#name] #h(1fr) #text(size: 7.5pt)[#cost]
    #v(3pt)
    #line(length: 100%, stroke: 0.5pt + silver)
    #v(4pt)
    #text(size: 7.5pt, style: "italic")[#time · #range]
    #v(5pt)
    #text(size: 7.5pt)[#effect]
  ]
)
`;

function attributesBlock(rows: FichaAttributeRow[]): string {
  // O losango entra na própria sigla ("VIG" -> "VIG ◆") pra não precisar mexer
  // na geometria da caixa nem abrir uma coluna nova numa ficha que já é apertada.
  const boxes = rows
    .map(
      (r) =>
        `stat-box-filled(${tstr(r.saveAdvantage ? `${r.short} ◆` : r.short)}, ${tstr(
          String(r.value)
        )}, height: 38pt)`
    )
    .join(",\n      ");
  const comVantagem = rows.filter((r) => r.saveAdvantage);
  const legenda = comVantagem.length
    ? `
    #v(3pt)
    #text(size: 7pt)[◆ Vantagem permanente em Testes de Resistência: ${comVantagem
        .map((r) => r.label)
        .join(", ")}]`
    : "";
  return `
  [
    #section-title("ATRIBUTOS")
    #v(4pt)
    #grid(
      columns: (1fr), gutter: 10pt,
      ${boxes}
    )${legenda}
  ]`;
}

function resourcesBlock(p: FichaPdfPayload): string {
  return `
  [
    #section-title("RESERVAS VITAIS E COMBATE")
    #v(4pt)
    #grid(
      columns: (1fr, 1fr), gutter: 8pt,
      resource-box-filled("PONTOS DE VIDA (PV)", ${tstr(p.maxHp)}),
      resource-box-filled("PONTOS DE MANA (PM)", ${tstr(p.maxMp)}),
      resource-box-filled("PONTOS DE TOUKI (PT)", ${tstr(p.maxPt)}),
      resource-box-filled("PONTOS DE PREP. (PP)", ${tstr(p.maxPp)})
    )
    #v(8pt)
    #grid(
      columns: (1fr, 1fr, 1fr, 1fr), gutter: 8pt,
      stat-box-filled("ARMADURA (CA)", ${tstr(p.armorClass)}, height: 36pt),
      stat-box-filled("INICIATIVA", ${tstr(p.initiative)}, height: 36pt),
      stat-box-filled("DESLOCAMENTO", ${tstr(p.deslocamento)}, height: 36pt),
      stat-box-filled("PA GASTOS", ${tstr(p.paSpent)}, height: 36pt)
    )
  ]`;
}

function spellcastingBlock(rows: FichaSpellcastingRow[]): string {
  if (rows.length === 0) {
    return `
#section-title("BÔNUS DE CONJURAÇÃO (BC) E CD")
#v(4pt)
#block(stroke: 1pt + gray, radius: 4pt, inset: 10pt, width: 100%)[
  #text(size: 8pt, fill: gray)[Nenhuma escola de magia desbloqueada ainda — BC = Intelecto (ou Espírito) + Bônus do Rank; CD = 8 + BC (Cap. 1, seção 7).]
]`;
  }
  const dataRows = rows
    .map((r) => `${tstr(r.treeName)}, ${tstr(r.bc)}, ${tstr(r.cd)}`)
    .join(",\n  ");
  return `
#section-title("BÔNUS DE CONJURAÇÃO (BC) E CD")
#v(4pt)
#table(
  columns: (2fr, 1fr, 1fr),
  stroke: 0.5pt + gray,
  align: (left, center, center),
  [*Escola*], [*BC*], [*CD*],
  ${dataRows}
)`;
}

function treesBlock(pillars: FichaTreePillar[]): string {
  const columns = pillars
    .map((pillar) => {
      const rows = pillar.rows
        .map((r) => `rank-field-filled(${tstr(`${r.label}:`)}, ${tstr(r.rank || "—")})`)
        .join(", ");
      return `grid(columns: 1fr, row-gutter: 4pt,
      text(weight: "bold", fill: cor-principal, size: 9pt)[${pillar.title}],
      ${rows}
    )`;
    })
    .join(",\n    ");

  return `
#section-title("ÁRVORES DE PROGRESSÃO")
#v(4pt)
#block(stroke: 1pt + gray, radius: 4pt, inset: 8pt, width: 100%)[
  #grid(
    columns: (1fr, 1fr, 1fr), gutter: 15pt,
    ${columns}
  )
]`;
}

function traitsBlock(traits: string[]): string {
  if (traits.length === 0) {
    return `
#section-title("PERÍCIAS & TRAÇOS (RAÇA E ANTECEDENTE)")
#v(4pt)
#block(stroke: 1pt + gray, radius: 4pt, inset: 8pt, width: 100%)[
  #text(size: 8pt, fill: gray)[Nenhuma raça/antecedente definido ainda.]
]`;
  }
  const lines = traits.map((t) => `filled-line(${tstr(t)})`).join(",\n  ");
  return `
#section-title("PERÍCIAS & TRAÇOS (RAÇA E ANTECEDENTE)")
#v(4pt)
#block(stroke: 1pt + gray, radius: 4pt, inset: 8pt, width: 100%)[
  #grid(columns: 1fr, row-gutter: 5pt,
  ${lines}
  )
]`;
}

function loreBlock(paragraphs: string[]): string {
  if (paragraphs.length === 0) {
    return `
#section-title("LORE E ANOTAÇÕES")
#v(4pt)
#block(stroke: 1pt + gray, radius: 4pt, inset: 8pt, width: 100%)[
  #text(size: 8pt, fill: gray)[Nada escrito ainda — edite em /ficha.]
]`;
  }
  // Sem breakable: false de propósito — ao contrário do ability-card, um texto de lore pode ser
  // longo o bastante pra precisar quebrar entre páginas, e isso é permitido por padrão em Typst.
  const paras = paragraphs.map((para) => `lore-paragraph(${tstr(para)})`).join(",\n  ");
  return `
#section-title("LORE E ANOTAÇÕES")
#v(4pt)
#block(stroke: 1pt + gray, radius: 4pt, inset: 10pt, width: 100%)[
  #grid(columns: 1fr, row-gutter: 2pt,
  ${paras}
  )
]`;
}

function weaponsTable(weapons: FichaWeaponRow[]): string {
  // Sempre pelo menos 5 linhas: as que sobram saem em branco de propósito, pra
  // escrever à mão numa ficha impressa.
  const dataRowCount = Math.max(5, weapons.length + 1);
  const rows: string[] = [];
  for (let i = 0; i < dataRowCount; i++) {
    const w = weapons[i];
    rows.push(
      [w?.name ?? "", w?.baseDie ?? "", w?.steps ?? "", w?.attack ?? "", w?.damage ?? ""]
        .map(tstr)
        .join(", ")
    );
  }

  // A descrição não cabe numa célula de 28pt sem espremer as outras colunas, e
  // era justamente ela que sumia por completo do PDF. Vai como notas de rodapé
  // da tabela, uma linha por arma que tenha texto.
  const notas = weapons.filter((w) => w.description.trim().length > 0);
  const notasBloco = notas.length
    ? `
#v(3pt)
#block(width: 100%, inset: (x: 2pt))[
  #set text(size: 7.5pt)
  ${notas.map((w) => `#strong(${tstr(w.name)}) + ${tstr(` — ${w.description}`)}`).join("\n  #linebreak()\n  ")}
]`
    : "";

  return `
#section-title("ARMAS E ATAQUES MARCIAIS")
#v(4pt)
#table(
  columns: (2fr, 1fr, 1.2fr, 1fr, 2fr),
  rows: (auto, ..range(${dataRowCount}).map(i => 28pt)),
  stroke: 0.5pt + gray,
  align: center + horizon,
  [*Arma / Manobra*], [*Dado Base*], [*Degraus (Rank)*], [*Acerto*], [*Dano Total (Dados + Bônus)*],
  ${rows.join(",\n  ")}
)${notasBloco}`;
}

function inventoryBlock(items: FichaInventoryRow[]): string {
  const half = Math.ceil(items.length / 2);
  const left = items.slice(0, half);
  const right = items.slice(half);
  const rowsPerCol = Math.max(6, half, items.length - half);

  function column(list: FichaInventoryRow[]): string {
    const lines = list.map((i) => `filled-line(${tstr(i.text)})`);
    const padCount = Math.max(0, rowsPerCol - list.length);
    const padded = padCount > 0
      ? [...lines, `..range(${padCount}).map(i => block(stroke: (bottom: 0.5pt + silver), width: 100%, inset: (bottom: 3pt, top: 3pt))[#v(10pt)])`]
      : lines;
    return `grid(columns: 1fr, row-gutter: 6pt, ${padded.join(", ")})`;
  }

  return `
#section-title("EQUIPAMENTO E INVENTÁRIO")
#v(4pt)
#block(stroke: 1pt + gray, radius: 4pt, inset: 12pt, width: 100%)[
  #grid(
    columns: (1fr, 1fr), gutter: 20pt,
    ${column(left)},
    ${column(right)}
  )
]`;
}

function abilityCardsPages(cards: FichaAbilityCard[]): string {
  if (cards.length === 0) {
    return `
#align(center)[#text(size: 10pt, fill: gray)[Nenhuma magia, técnica ou talento comprado ainda.]]`;
  }

  const CARDS_PER_PAGE = 9;
  const pages: string[] = [];
  for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
    const chunk = cards.slice(i, i + CARDS_PER_PAGE);
    const cells = chunk
      .map(
        (c) =>
          `ability-card(${tstr(`${c.signature ? "◆ " : ""}${c.name}`)}, ${tstr(c.cost)}, ${tstr(c.time)}, ${tstr(c.range)}, ${tstr(c.effect)})`
      )
      .join(",\n  ");
    pages.push(`#grid(\n  columns: (1fr, 1fr, 1fr),\n  gutter: 12pt,\n  ${cells}\n)`);
  }

  return pages.join("\n\n#pagebreak()\n\n");
}

export function buildFichaTypstSource(p: FichaPdfPayload): string {
  return `${PREAMBLE}

// ==========================================
// FICHA: IDENTIDADE, PROGRESSÃO, COMBATE E INVENTÁRIO
// Flui livremente por quantas páginas retrato forem necessárias — sem
// quebra de página forçada entre seções, pra nunca sobrar uma página quase
// vazia só porque uma caixa não coube por pouco no fim da anterior.
// ==========================================

#align(center)[
  #text(size: 20pt, weight: "bold", fill: cor-principal)[MUSHOKU TENSEI RPG] \\
  #text(size: 10pt, style: "italic")[Ficha de Personagem]
]
#v(6pt)

#grid(
  columns: (2fr, 1fr, 1.5fr, 1fr),
  gutter: 10pt,
  field("Personagem:", value: ${tstr(p.name)}),
  field("Raça:", value: ${tstr(p.raceName)}),
  field("Antecedente:", value: ${tstr(p.backgroundName)}),
  field("Ouro (PO):", value: ${tstr(p.gold)})
)
#v(10pt)

#grid(
  columns: (1fr, 2.5fr),
  gutter: 15pt,
  ${attributesBlock(p.attributes)},
  ${resourcesBlock(p)}
)
#v(8pt)

${spellcastingBlock(p.spellcasting)}
#v(8pt)

${treesBlock(p.trees)}
#v(8pt)

${traitsBlock(p.traits)}
#v(8pt)

${weaponsTable(p.weapons)}
#v(10pt)

${inventoryBlock(p.inventory)}
#v(10pt)

#block(breakable: false)[
  #section-title("VÍNCULOS, PACTOS E PROTEGIDOS")
  #v(4pt)
  #block(stroke: 1pt + gray, radius: 4pt, inset: 8pt, width: 100%)[
    #text(size: 8pt, fill: gray)[Anote aqui: criaturas com Pacto (Invocação), aliados "Sob Minha Guarda" (Escudos), ou contatos/tropas (Bardo/Tático).]
    #v(6pt)
    #blank-lines(2, spacing: 16pt)
  ]
]
#v(10pt)

${loreBlock(p.lore)}

// ==========================================
// MAGIAS E HABILIDADES (DEITADA) — sempre começa em página nova por causa
// da mudança de orientação; pagina sozinha em quantas páginas precisar.
// ==========================================
#pagebreak()
#set page(flipped: true, margin: 1cm)

#align(center)[
  #text(size: 16pt, weight: "bold", fill: cor-principal)[GRIMÓRIO E ARSENAL DE TÉCNICAS] \\
  #text(size: 9pt, style: "italic", fill: gray)[${tstr(p.name)} — magias, técnicas marciais, talentos e preparações]
]
#v(10pt)

${abilityCardsPages(p.abilityCards)}
`;
}
