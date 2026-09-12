import { AbilityDef, RankName, TalentDef } from "@/lib/types";
import ArteDaHabilidade from "./ArteDaHabilidade";
import { CastingBreakdown, IncantationBlock, RitualBadge } from "../AbilityDetail";
import ProsaComCondicoes from "../ProsaComCondicoes";
import { condicoesCitadas } from "@/lib/condicoesNaProsa";

function isAbility(def: AbilityDef | TalentDef): def is AbilityDef {
  return "actions" in def;
}

export function costLabel(def: AbilityDef | TalentDef) {
  const parts = [`${def.paCost} PA`];
  if (isAbility(def)) {
    if (def.pmCost) parts.push(`${def.pmCost} PM`);
    if (def.ptCost) parts.push(`${def.ptCost} PT`);
    if (def.ppCost) parts.push(`${def.ppCost} PP`);
  }
  return parts.join(" | ");
}

/**
 * O card de UMA entrada de árvore — talento, técnica ou magia — com tudo que a
 * mesa precisa ler no meio do turno: custo, alcance, efeito, dano, as três
 * formas de conjurar e o cântico.
 *
 * Ele morava dentro do `TreeCatalog` até 0.1.17, quando a busca global passou a
 * precisar do mesmo card fora do livro. Copiar teria criado a única coisa pior
 * que um card feio: dois cards que divergem — um mostrando a Recitação Perfeita
 * e o outro não, pra mesma magia, em duas telas do mesmo site.
 */
export default function EntryCard({
  kind,
  def,
  rank,
  /**
   * A árvore desta entrada, quando quem desenha souber — 0.1.68.
   *
   * Serve a uma coisa só: achar a ARTE da habilidade. É opcional porque o id de
   * habilidade não é único entre árvores (há mais de uma "Investida" no livro),
   * então sem a árvore não dá pra procurar sem risco de mostrar a arte errada —
   * e mostrar a arte errada é pior que não mostrar nenhuma.
   */
  treeId,
}: {
  kind: "ability" | "talent";
  def: AbilityDef | TalentDef;
  rank: RankName;
  treeId?: string;
}) {
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
      {/*
        O efeito passa pelo reconhecedor de condições (0.1.23): "o alvo fica
        Envenenado" vira um verbete que abre ali mesmo, em vez de mandar a mesa
        procurar o Cap. 4 no meio do turno. Vale no livro, na busca e no
        Grimório da ficha, porque os três desenham este mesmo card.

        A verificação acontece AQUI, do lado do servidor, e o componente
        interativo só é montado quando o texto cita alguma condição de verdade.
        Sem isso, o /livro — que desenha as 601 habilidades numa página só —
        embarcaria 601 componentes com estado próprio para que a maioria deles
        nunca tivesse nada a abrir.
      */}
      {condicoesCitadas(description).length > 0 ? (
        <ProsaComCondicoes
          texto={description}
          className="mt-1 block leading-relaxed text-parchment-700 dark:text-parchment-300"
        />
      ) : (
        <p className="mt-1 leading-relaxed text-parchment-700 dark:text-parchment-300">{description}</p>
      )}
      {ability?.damage && (
        <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">
          <b>Dano:</b> {ability.damage.normal}
          {ability.damage.encurtada && <> · Encurtada: {ability.damage.encurtada}</>}
        </p>
      )}
      {ability && <CastingBreakdown ability={ability} />}
      {ability && <IncantationBlock ability={ability} rank={rank} />}
      {treeId && kind === "ability" && <ArteDaHabilidade treeId={treeId} abilityId={def.id} />}
    </div>
  );
}
