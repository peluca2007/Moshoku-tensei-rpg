import { AbilityDef, RANK_BONUS, TalentDef, Tree } from "@/lib/types";
import { getRankDeusForTree } from "@/data/rankDeus";
import { describeGrantedSkills, describeMasteryException } from "@/lib/treeSkills";
import { CastingBreakdown, IncantationBlock, RitualBadge } from "../AbilityDetail";
import { BookTable, SubTitle } from "./BookUI";

function isAbility(def: AbilityDef | TalentDef): def is AbilityDef {
  return "actions" in def;
}

function costLabel(def: AbilityDef | TalentDef) {
  const parts = [`${def.paCost} PA`];
  if (isAbility(def)) {
    if (def.pmCost) parts.push(`${def.pmCost} PM`);
    if (def.ptCost) parts.push(`${def.ptCost} PT`);
    if (def.ppCost) parts.push(`${def.ppCost} PP`);
  }
  return parts.join(" | ");
}

function EntryCard({ kind, def }: { kind: "ability" | "talent"; def: AbilityDef | TalentDef }) {
  const ability = isAbility(def) ? def : null;
  const description = isAbility(def) ? def.effect : def.description;
  return (
    <div className="print-avoid-break rounded-lg border border-parchment-300 bg-parchment-50/80 p-3 text-sm dark:border-parchment-800 dark:bg-parchment-950/40">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="font-bold text-parchment-900 dark:text-parchment-50">
          {ability?.signature && <span className="text-gold-600 dark:text-gold-400">◆ </span>}
          {def.name}
          <span className="ml-1 text-xs font-normal text-parchment-600 dark:text-parchment-400">
            — {kind === "talent" ? "Talento" : "Técnica/Magia"} · {costLabel(def)}
          </span>
        </p>
        {ability && <RitualBadge ability={ability} />}
      </div>
      {ability?.range && <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">Alcance: {ability.range}</p>}
      <p className="mt-1 leading-relaxed text-parchment-700 dark:text-parchment-300">{description}</p>
      {ability?.damage && (
        <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">
          <b>Dano:</b> {ability.damage.normal}
          {ability.damage.encurtada && <> · Encurtada: {ability.damage.encurtada}</>}
        </p>
      )}
      {ability && <CastingBreakdown ability={ability} />}
      {ability && <IncantationBlock ability={ability} />}
    </div>
  );
}

/** Tabela de progressão por Rank — PV, e (conforme a árvore) PT/Escada de Arma ou PP, direto de TreeRankDef (nunca diverge da ficha). */
function ProgressionTable({ tree }: { tree: Tree }) {
  const isCorpo = tree.category === "corpo";
  const isUtilidade = tree.category === "utilidade";
  const headers = ["Rank", "Bônus", "PV Ganhos", ...(isCorpo ? ["PT Ganhos", "Escada de Arma"] : []), ...(isUtilidade ? ["PP Ganhos"] : [])];
  const rows = tree.ranks.map((rankDef) => {
    const label = tree.rankLabels?.[rankDef.rank] ?? rankDef.rank;
    const base = [label, `+${RANK_BONUS[rankDef.rank]}`, rankDef.hpDiceFormula];
    if (isCorpo) base.push(rankDef.ptGained ? `+${rankDef.ptGained}` : "—", rankDef.weaponDieSteps ? `+${rankDef.weaponDieSteps} degrau(s)` : "—");
    if (isUtilidade) base.push(rankDef.ppGained ? `+${rankDef.ppGained}` : "—");
    return base;
  });
  return <BookTable headers={headers} rows={rows} />;
}

/**
 * O que a árvore concede de proficiência, ANTES de qualquer patamar. Fica no
 * topo de propósito: é a primeira pergunta que a mesa faz ao abrir uma árvore
 * ("posso usar essa arma? posso vestir essa armadura?"), e até 2026-08-29 a
 * resposta estava enterrada no meio do texto de algumas Maestrias de 1º patamar
 * — quando estava em algum lugar.
 */
function ProficiencyCard({ tree }: { tree: Tree }) {
  const p = tree.proficiencies;
  if (!p) return null;
  const ensina = describeGrantedSkills(tree);
  const excecao = describeMasteryException(tree);
  const linhas: [string, React.ReactNode][] = [
    ["Armas e armaduras", p.armas],
    [
      // A linha que faltava: TODA árvore ensina perícias, e o texto é gerado de
      // `grantedSkills` justamente pra as dezoito dizerem a mesma coisa.
      "Ensina (Árvore Inicial)",
      ensina ? (
        <>
          {ensina}{" "}
          <span className="text-parchment-600 dark:text-parchment-400">
            Você só recebe estas perícias se esta for a sua <b>Árvore Inicial</b> — a primeira que você
            abriu. Elas entram na ficha sozinhas, sem gastar PA.
          </span>
          {excecao && <span className="ml-1 font-semibold text-wine-700 dark:text-wine-300">{excecao}</span>}
        </>
      ) : (
        "—"
      ),
    ],
    ["Bônus de Rank", p.pericias],
  ];
  return (
    <div className="print-avoid-break rounded-lg border border-parchment-400 bg-parchment-100 p-3 text-sm dark:border-parchment-700 dark:bg-parchment-900/70">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-wine-700 dark:text-wine-300">
        Proficiências e perícias desta árvore
      </p>
      <dl className="space-y-1.5">
        {linhas.map(([rotulo, texto]) => (
          <div key={rotulo} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
            <dt className="shrink-0 font-semibold text-parchment-800 dark:text-parchment-200 sm:w-44">
              {rotulo}
            </dt>
            <dd className="text-parchment-700 dark:text-parchment-300">{texto}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 border-t border-parchment-300 pt-2 text-xs italic text-parchment-600 dark:border-parchment-800 dark:text-parchment-400">
        {p.nota}
      </p>
    </div>
  );
}

/** Catálogo completo de uma árvore — progressão, todo Rank, toda Maestria, todo Talento/Técnica/Magia e o patamar Divino, direto da mesma fonte que alimenta a ficha (nunca diverge). */
export default function TreeCatalog({ tree }: { tree: Tree }) {
  const nonEmptyRanks = tree.ranks.filter((r) => r.mastery || r.talents.length > 0 || r.abilities.length > 0);
  const rankDeus = getRankDeusForTree(tree.id);
  if (nonEmptyRanks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-parchment-300 p-3 text-sm text-parchment-600 dark:border-parchment-700 dark:text-parchment-400">
        Em breve — conteúdo desta árvore ainda não foi escrito.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tree.prerequisiteNote && (
        <div className="rounded-lg border border-wine-300 bg-wine-50/60 p-3 text-sm text-wine-800 dark:border-wine-900 dark:bg-wine-950/30 dark:text-wine-200">
          <b>Pré-requisito: </b>
          {tree.prerequisiteNote}
        </div>
      )}
      <ProficiencyCard tree={tree} />
      <ProgressionTable tree={tree} />
      {nonEmptyRanks.map((rankDef) => {
        const label = tree.rankLabels?.[rankDef.rank] ?? rankDef.rank;
        return (
          <div key={rankDef.rank} className="space-y-2">
            <SubTitle id={`${tree.id}-${rankDef.rank}`}>
              {label} <span className="font-normal text-parchment-600 dark:text-parchment-400">(Bônus +{RANK_BONUS[rankDef.rank]})</span>
            </SubTitle>
            {rankDef.mastery && (
              <div className="print-avoid-break rounded-lg border border-gold-300 bg-gold-50/60 p-3 text-sm dark:border-gold-900 dark:bg-gold-950/30">
                <p className="font-bold text-gold-700 dark:text-gold-400">◈ Maestria: {rankDef.mastery.name}</p>
                <p className="mt-1 text-gold-900/80 dark:text-gold-200/80">{rankDef.mastery.description}</p>
              </div>
            )}
            {rankDef.talents.map((t) => (
              <EntryCard key={t.id} kind="talent" def={t} />
            ))}
            {rankDef.abilities.map((a) => (
              <EntryCard key={a.id} kind="ability" def={a} />
            ))}
          </div>
        );
      })}
      {rankDeus && (
        <div className="space-y-2">
          <SubTitle id={`${tree.id}-rank-deus`}>◈ Rank Deus</SubTitle>
          <p className="text-xs italic text-parchment-600 dark:text-parchment-400">Narrativo. Não se compra.</p>
          <div className="print-avoid-break rounded-lg border border-gold-300 bg-gold-50/60 p-3 text-sm dark:border-gold-900 dark:bg-gold-950/30">
            <p className="font-bold text-gold-700 dark:text-gold-400">◈ {rankDeus.title}</p>
            {rankDeus.body.map((paragraph, i) => (
              <p key={i} className="mt-2 leading-relaxed text-gold-900/80 dark:text-gold-200/80">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
