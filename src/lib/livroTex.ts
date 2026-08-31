/**
 * Gera as partes do livro em LaTeX que saem de dados — as 18 árvores com seus
 * 560 nós, as tabelas do núcleo, raças, antecedentes, perícias, kits e a loja.
 *
 * A prosa dos capítulos NÃO passa por aqui: ela é escrita à mão em
 * `livro-tex/capitulos/*.tex`. A divisão é proposital — prosa é texto de autor
 * e merece ser editada como texto; número é dado e não pode ser copiado à mão,
 * porque cópia diverge. Toda tabela deste arquivo lê a mesma fonte que a ficha
 * do site lê, então o PDF e o site nunca discordam de um valor.
 */
import { RACES } from "@/data/races";
import { BACKGROUNDS, LAPLACE_TABLE, MIKO_TABLE, OLHO_TABLE } from "@/data/backgrounds";
import { SKILLS } from "@/data/skills";
import { SHOP_ITEMS, SHOP_CATEGORY_LABELS, SHOP_CATEGORY_ORDER } from "@/data/shopItems";
import { STARTING_KITS } from "@/data/startingKits";
import { TREES, CATEGORY_LABELS, getTreeGroups } from "@/data/trees";
import { MAGIC_ACTIONS } from "@/data/trees/shared";
import { WEAPON_DIE_LADDER, WEAPON_PRESETS } from "@/lib/weaponDie";
import { describeGrantedSkills, describeMasteryException } from "@/lib/treeSkills";
import {
  AbilityDef,
  RANK_BONUS,
  RANK_REQUIREMENTS,
  RANKS,
  RankName,
  TalentDef,
  Tree,
  TreeRankDef,
  VIGOR_FACTOR_TABLE,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*  Escape                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Escapa texto do livro pra LaTeX. A ordem importa: a contrabarra tem de sair
 * primeiro, senão as substituições seguintes reintroduzem sequências que
 * seriam escapadas de novo.
 */
export function tex(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return "";
  return String(input)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    // As aspas curvas e travessões do livro já são UTF-8 válido em LuaLaTeX,
    // mas em pdfLaTeX o inputenc só resolve os que têm comando equivalente.
    .replace(/—/g, "---")
    .replace(/–/g, "--")
    .replace(/…/g, "\\ldots{}")
    .replace(/◆/g, "\\assinatura{}")
    .replace(/◈/g, "\\simbmaestria{}");
}

/** Um argumento de macro que pode ficar vazio — `\relax` é o que a classe testa. */
function opt(value: string | number | undefined | null): string {
  const s = tex(value);
  return s === "" ? "\\relax" : s;
}

const NL = "\n";
/**
 * Junta linhas descartando só o que foi condicionalmente omitido. String vazia
 * NÃO é descartada: ela é a linha em branco que separa parágrafos em LaTeX, e
 * um `filter(Boolean)` aqui grudaria parágrafos que deveriam ficar separados.
 */
const lines = (...xs: (string | false | undefined | null)[]) =>
  xs.filter((x): x is string => typeof x === "string").join(NL);

/**
 * Como `lines`, mas descarta também a string vazia. Usado DENTRO de argumento
 * de macro, onde uma linha em branco vira um `\par` acidental no meio do bloco
 * de estatísticas.
 */
const compact = (...xs: (string | false | undefined | null)[]) =>
  xs.filter((x): x is string => typeof x === "string" && x !== "").join(NL);

/* -------------------------------------------------------------------------- */
/*  Tabelas do núcleo                                                         */
/* -------------------------------------------------------------------------- */

function table(cols: string, caption: string, header: string[], rows: string[][]): string {
  return lines(
    `\\begin{tabelalivro}{${cols}}{${tex(caption)}}`,
    `\\cabtabela{${header.map((h) => `\\textbf{${tex(h)}}`).join(" & ")}}`,
    ...rows.map((r) => `${r.join(" & ")} \\\\`),
    `\\end{tabelalivro}`
  );
}

export function buildTabelasNucleo(): string {
  const paCost = (r: RankName) => RANK_REQUIREMENTS[r].paCost;
  const know = (r: RankName) => RANK_REQUIREMENTS[r].knowledgeRequired || "—";

  return lines(
    "% GERADO por src/lib/livroTex.ts — não edite à mão; edite src/lib/types.ts.",
    "",
    table(
      "L{2.6cm} C{2.2cm} C{2.6cm} C{2.2cm}",
      "Ranks de Maestria — desbloqueio e exigência",
      ["Rank", "Bônus", "Custo", "Conhecimentos"],
      [
        ...RANKS.map((r) => [tex(r), `+${RANK_BONUS[r]}`, `${paCost(r)} PA`, tex(know(r))]),
        ["Deus", "—", "Narrativa", "—"],
      ]
    ),
    "",
    table(
      "L{2.6cm} C{2.4cm} C{2.4cm} C{2.4cm}",
      "Custo em PA dentro de uma árvore",
      ["Rank", "Comum", "Assinatura ◆", "Talento"],
      RANKS.map((r) => [
        tex(r),
        `${RANK_PA.common[r]} PA`,
        `${RANK_PA.signature[r]} PA`,
        `${RANK_PA.talent[r]} PA`,
      ])
    ),
    "",
    table(
      "L{2.6cm} C{2.8cm} C{2.8cm}",
      "Custo em PA nas árvores de Utilidade (tabela própria, mais barata)",
      ["Rank", "Talento", "Assinatura ◆"],
      RANKS.map((r) => [tex(r), `${UTIL_PA.talent[r]} PA`, `${UTIL_PA.signature[r]} PA`])
    ),
    "",
    table(
      "L{2.6cm} C{2.2cm} C{2.4cm} C{3.2cm}",
      "Tempo de conjuração por rank",
      ["Rank da magia", "Padrão", "Encurtada", "Silenciosa"],
      RANKS.map((r) => {
        const a = MAGIC_ACTIONS[r];
        const enc = a.encurtada === undefined ? "Impossível" : `${a.encurtada} Ação(ões)`;
        const sil =
          typeof a.silenciosa === "number"
            ? `${a.silenciosa} Ação(ões)${r === "Principiante" ? " (1ª grátis)" : ""}`
            : "1 Reação";
        return [tex(r), `${a.normal} Ações`, tex(enc), tex(sil)];
      })
    ),
    "",
    table(
      "C{1.6cm} L{3.4cm} C{2.2cm} L{5.4cm}",
      "A Escala do Vigor",
      ["Vigor", "Nome", "Fator de PV", "O que significa"],
      VIGOR_FACTOR_TABLE.map((v) => [
        v.vigor >= 0 ? `+${v.vigor}` : String(v.vigor),
        tex(v.label),
        `$\\times$${v.factor.toFixed(2).replace(".", ",")}`,
        v.vigor === -2
          ? "60\\% da vida de um corpo comum."
          : v.vigor === -1
            ? "75\\% da vida de um corpo comum."
            : v.vigor === 0
              ? "A referência."
              : `+${v.vigor * 20}\\% sobre o corpo comum.`,
      ])
    ),
    "",
    table(
      "C{1.4cm} L{11cm}",
      "A Escada de Dados de Arma (Cap. 3)",
      ["Degrau", "Dado"],
      WEAPON_DIE_LADDER.map((d, i) => [String(i), `\\dado{${tex(d)}}`])
    ),
    "",
    table(
      "L{6cm} C{2cm}",
      "Dados Base de arma",
      ["Arma", "Dado"],
      WEAPON_PRESETS.map((w) => [tex(w.name), `\\dado{${tex(w.die)}}`])
    ),
    "",
    // As dezoito numa tabela só. É o jeito mais direto de a regra ficar
    // inegável: nenhuma árvore fica de fora, e dá pra conferir de relance que
    // TODAS ensinam alguma coisa.
    table(
      "C{1.8cm} L{4.2cm} L{7.6cm}",
      "Perícias de Árvore — o que cada uma das 18 ensina (Cap. 1, §4)",
      ["Pilar", "Árvore", "Ensina, se for a sua Árvore Inicial"],
      TREES.map((t) => [
        t.category === "magia" ? "Magia" : t.category === "corpo" ? "Corpo" : "Utilidade",
        tex(t.name),
        tex([describeGrantedSkills(t) ?? "—", describeMasteryException(t)].filter(Boolean).join(" ")),
      ])
    )
  );
}

// Importados aqui embaixo pra manter o topo do arquivo legível.
import { RANK_PA_COST as RANK_PA, UTILITY_PA_COST as UTIL_PA } from "@/data/trees/shared";

/* -------------------------------------------------------------------------- */
/*  Raças, antecedentes, perícias, kits, loja                                 */
/* -------------------------------------------------------------------------- */

export function buildRacas(): string {
  return lines(
    "% GERADO — fonte: src/data/races.ts",
    ...RACES.flatMap((r) => [
      `\\subsection{${tex(r.name)}}`,
      tex(r.description),
      "",
      "\\begin{itemize}",
      ...r.traits.map((t) => `  \\item ${tex(t)}`),
      "\\end{itemize}",
      "",
    ])
  );
}

export function buildAntecedentes(): string {
  const efeito = (bg: (typeof BACKGROUNDS)[number]) =>
    [
      ...(bg.fixedSkills ?? []).map((s) => `Perícia: ${s}`),
      ...(bg.bonusSkillChoices ? [`${bg.bonusSkillChoices} Perícias à escolha`] : []),
      ...bg.traits,
    ].join(" · ") || "—";

  return lines(
    "% GERADO — fonte: src/data/backgrounds.ts",
    table(
      "C{1.3cm} L{3.1cm} L{7.6cm} C{1.7cm}",
      "O Destino e a Infância (1d100)",
      ["d100", "Antecedente", "Efeito", "Dinheiro"],
      BACKGROUNDS.map((bg) => [
        `${String(bg.rollRange[0]).padStart(2, "0")}--${String(bg.rollRange[1]).padStart(2, "0")}`,
        tex(bg.name),
        tex(efeito(bg)),
        `${tex(bg.startingGold)} PO`,
      ])
    ),
    "",
    table(
      "C{1.1cm} L{3.6cm} L{9cm}",
      "Miko e Amaldiçoados (1d8)",
      ["1d8", "Tipo", "Efeito"],
      MIKO_TABLE.map((e) => [String(e.roll), tex(e.name), tex(e.traits.join(" "))])
    ),
    "",
    table(
      "C{1.1cm} L{3.6cm} L{9cm}",
      "Olhos Demoníacos / Místicos (1d10)",
      ["1d10", "Olho", "Mecânica"],
      OLHO_TABLE.map((e) => [String(e.roll), tex(e.name), tex(e.traits.join(" "))])
    ),
    "",
    table(
      "C{1.1cm} L{3.6cm} L{9cm}",
      "Fator Laplace / Linhagem Antiga (1d4)",
      ["1d4", "Mutação", "Efeito"],
      LAPLACE_TABLE.map((e) => [String(e.roll), tex(e.name), tex(e.traits.join(" "))])
    )
  );
}

const SKILL_ATTR: Record<string, string> = {
  forca: "Força",
  agilidade: "Agilidade",
  vigor: "Vigor",
  intelecto: "Intelecto",
  espirito: "Espírito",
};

export function buildPericias(): string {
  return lines(
    "% GERADO — fonte: src/data/skills.ts",
    table(
      "L{2.2cm} L{3.2cm} L{8.4cm}",
      "Lista Mestre de Perícias",
      ["Atributo", "Perícia", "Cobre"],
      SKILLS.map((s) => [tex(SKILL_ATTR[s.attribute]), tex(s.name), tex(s.description)])
    )
  );
}

export function buildKits(): string {
  return lines(
    "% GERADO — fonte: src/data/startingKits.ts",
    table(
      "L{4.2cm} L{9.6cm}",
      "Equipamento Inicial por Árvore Inicial",
      ["Árvore Inicial", "Kit"],
      STARTING_KITS.map((kit) => [
        tex(TREES.filter((t) => t.subgroup === kit.subgroup).map((t) => t.name).join(", ")),
        tex(kit.items.map((i) => i.name + (i.description ? ` (${i.description})` : "")).join(" · ")),
      ])
    )
  );
}

export function buildLoja(): string {
  return lines(
    "% GERADO — fonte: src/data/shopItems.ts",
    ...SHOP_CATEGORY_ORDER.flatMap((cat) => {
      const items = SHOP_ITEMS.filter((i) => i.category === cat);
      if (items.length === 0) return [];
      return [
        table(
          "L{4.8cm} C{1.6cm} C{1.4cm} L{5.6cm}",
          `${SHOP_CATEGORY_LABELS[cat]} — Rank de Guilda é o mínimo pra o item aparecer à venda`,
          ["Item", "Preço", "Rank", "Notas"],
          items.map((i) => [
            tex(i.name),
            `${i.price} PO`,
            tex(i.guildRankRequired),
            tex(i.description),
          ])
        ),
        "",
      ];
    })
  );
}

/* -------------------------------------------------------------------------- */
/*  Árvores — o grosso do livro                                               */
/* -------------------------------------------------------------------------- */

function actionsLabel(a: AbilityDef["actions"], reaction?: boolean): string {
  if (reaction) return "1 Reação";
  if (a.normal === 0) return "Passivo";
  const parts = [`${a.normal} Ações`];
  if (a.encurtada !== undefined) parts.push(`encurtada ${a.encurtada}`);
  if (a.silenciosa !== undefined)
    parts.push(`silenciosa ${typeof a.silenciosa === "number" ? a.silenciosa : "reação"}`);
  return parts.join(" / ");
}

function abilityTex(tree: Tree, a: AbilityDef): string {
  const custo =
    a.pmCost !== undefined
      ? `${a.pmCost} PM`
      : a.ptCost !== undefined
        ? `${a.ptCost} PT`
        : a.ppCost !== undefined
          ? `${a.ppCost} PP`
          : undefined;

  const corpo = compact(
    a.damage?.normal ? `\\textbf{Dano:} ${tex(a.damage.normal)}\\par` : "",
    a.damage?.encurtada ? `\\textbf{Encurtada:} ${tex(a.damage.encurtada)}\\par` : "",
    a.ritual ? "\\textbf{Ritual:} não pode ser encurtado.\\par" : "",
    tex(a.effect)
  );

  const macro = tree.category === "magia" ? "\\magia" : "\\tecnica";
  const args =
    tree.category === "magia"
      ? [
          tex(a.name),
          a.signature ? "s" : "\\relax",
          String(a.paCost),
          opt(custo?.replace(" PM", "")),
          tex(actionsLabel(a.actions, a.reaction)),
          tex(a.range),
          corpo,
          opt(a.incantation),
        ]
      : [
          tex(a.name),
          a.signature ? "s" : "\\relax",
          String(a.paCost),
          opt(custo?.replace(/ P[TP]/, "")),
          tex(actionsLabel(a.actions, a.reaction)),
          tex(a.range),
          corpo,
        ];
  return `${macro}${args.map((x) => `{${x}}`).join("")}`;
}

function talentTex(t: TalentDef): string {
  return `\\talento{${tex(t.name)}}{${t.paCost}}{${tex(t.description)}}`;
}

function rankTex(tree: Tree, r: TreeRankDef): string {
  const label = tree.rankLabels?.[r.rank] ?? r.rank;
  const meta = [
    `Dado de PV \\dado{${tex(r.hpDiceFormula)}}`,
    r.weaponDieSteps ? `+${r.weaponDieSteps} degrau(s) de Dado de Arma` : "",
    r.ptGained ? `+${r.ptGained} PT` : "",
    r.ppGained ? `+${r.ppGained} PP` : "",
    r.unlockPaCostOverride !== undefined ? `desbloqueio ${r.unlockPaCostOverride} PA (exceção)` : "",
  ]
    .filter(Boolean)
    .join(" \\textbullet\\ ");

  return compact(
    `\\patamar{${tex(label)}}{${meta}}`,
    r.mastery ? `\\maestria{${tex(r.mastery.name)}}{${tex(r.mastery.description)}}` : "",
    ...r.talents.map(talentTex),
    ...r.abilities.map((a) => abilityTex(tree, a))
  );
}

export function buildArvores(): string {
  const groups = getTreeGroups();
  const out: string[] = ["% GERADO — fonte: src/data/trees/*.ts"];
  let lastCategory = "";

  for (const g of groups) {
    if (g.category !== lastCategory) {
      out.push("", `\\section{${tex(CATEGORY_LABELS[g.category])}}`);
      lastCategory = g.category;
    }
    for (const tree of g.trees) {
      out.push(
        "",
        `\\subsection{${tex(tree.name)}}`,
        compact(
          `\\begin{arvorecard}{${tex(tree.name)}}{${tex(g.subgroup)}}{${tex(
            tree.keyAttributeLabel ?? "—"
          )} \\textbullet\\ Recurso: ${tex(tree.resourceLabel ?? "—")}}`,
          tex(tree.tagline ?? ""),
          tree.prerequisiteNote
            ? `\\par\\medskip\\textbf{Pré-requisito:} ${tex(tree.prerequisiteNote)}`
            : "",
          // As proficiências vêm ANTES do 1º patamar, igual ao catálogo do site:
          // "posso usar essa arma? posso vestir essa armadura?" é a primeira
          // pergunta da mesa ao abrir uma árvore, e até 2026-08-29 a resposta
          // estava enterrada no meio do texto de algumas Maestrias.
          tree.proficiencies
            ? [
                `\\par\\medskip\\textbf{Armas e armaduras:} ${tex(tree.proficiencies.armas)}`,
                `\\par\\textbf{Perícias:} ${tex(tree.proficiencies.pericias)}`,
                `\\par\\smallskip{\\itshape ${tex(tree.proficiencies.nota)}}`,
              ].join("")
            : "",
          // Cap. 1, §4: perícias que a árvore ENSINA — e só se ela for a Inicial.
          // Mesma frase do catálogo do site e do mapa de árvores
          // (src/lib/treeSkills.ts), pra as três superfícies nunca divergirem
          // numa palavra. Não confundir com a linha de Bônus de Rank acima: onde
          // o bônus soma e o que você sabe fazer são coisas independentes.
          describeGrantedSkills(tree)
            ? `\\par\\smallskip\\textbf{Ensina:} ${tex(describeGrantedSkills(tree))} ${tex(
                "Você só recebe estas perícias se esta for a sua Árvore Inicial — a primeira que você abriu; elas entram na ficha sozinhas, sem gastar PA."
              )}${
                describeMasteryException(tree)
                  ? ` \\textbf{${tex(describeMasteryException(tree))}}`
                  : ""
              }`
            : "",
          `\\end{arvorecard}`
        ),
        ...tree.ranks.map((r) => rankTex(tree, r))
      );
    }
  }
  return out.join(NL);
}

/* -------------------------------------------------------------------------- */
/*  Índice das partes geradas                                                 */
/* -------------------------------------------------------------------------- */

export const GENERATED_PARTS: { file: string; build: () => string }[] = [
  { file: "tabelas-nucleo.tex", build: buildTabelasNucleo },
  { file: "racas.tex", build: buildRacas },
  { file: "antecedentes.tex", build: buildAntecedentes },
  { file: "pericias.tex", build: buildPericias },
  { file: "kits.tex", build: buildKits },
  { file: "loja.tex", build: buildLoja },
  { file: "arvores.tex", build: buildArvores },
];
