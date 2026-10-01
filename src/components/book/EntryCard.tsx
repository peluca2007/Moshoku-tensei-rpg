import { AbilityDef, RankName, TalentDef } from "@/lib/types";
import ArteDaHabilidade from "./ArteDaHabilidade";
import { CastingBreakdown, IncantationBlock, RitualBadge } from "../AbilityDetail";
import ProsaComCondicoes from "../ProsaComCondicoes";
import { condicoesCitadas } from "@/lib/condicoesNaProsa";
import { rotuloDeAcoes } from "@/lib/rotuloDeAcoes";

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
 * As Ações de uma técnica que não tem as três formas de conjurar — 2026-09-27.
 *
 * A magia mostra as Ações no quadro Padrão/Encurtada/Silenciosa. A técnica de
 * 2 ou 3 Ações (Espada de Luz Verdadeira, Tiro do Céu, O Muro Final…) não tinha
 * onde dizer isso, e a carta lida parecia custar 1. Vai na linha do custo, sem
 * linha nova; a de 1 Ação continua calada, que é o padrão do livro.
 */
export function acoesDaTecnica(def: AbilityDef | TalentDef): string | null {
  if (!isAbility(def)) return null;
  if (def.reaction) return "Reação";
  if (def.ritual) return null; // o selo "Ritual" já diz o tempo
  const temFormas = def.actions.encurtada !== undefined || def.actions.silenciosa !== undefined;
  return !temFormas && def.actions.normal >= 2 ? rotuloDeAcoes(def.actions.normal) : null;
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
    <div className="livro-verbete print-avoid-break lv-card text-sm">
      <div className="lv-topo">
        <p className="livro-verbete-nome lv-nome">
          {ability?.signature && <span className="text-gold-600 dark:text-gold-400">◆ </span>}
          {def.name}
          <span className="livro-verbete-meta lv-meta text-xs">
            — {kind === "talent" ? "Talento" : "Técnica/Magia"} · {costLabel(def)}
            {acoesDaTecnica(def) && <> · {acoesDaTecnica(def)}</>}
          </span>
        </p>
        {ability && <RitualBadge ability={ability} />}
      </div>
      {ability?.range && <p className="livro-verbete-alcance lv-fino text-xs">Alcance: {ability.range}</p>}
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
          className="livro-verbete-efeito lv-efeito block"
        />
      ) : (
        <p className="livro-verbete-efeito lv-efeito">{description}</p>
      )}
      {ability?.damage && (
        <p className="lv-fino text-xs">
          <b>Dano:</b> {ability.damage.normal}
          {ability.damage.encurtada && <> · Encurtada: {ability.damage.encurtada}</>}
        </p>
      )}
      {ability && <CastingBreakdown ability={ability} compacta />}
      {ability && <IncantationBlock ability={ability} rank={rank} />}
      {/* Talento também pode ter arte desde a 0.1.69 — a chave é `treeId/id`,
          e um teste garante que talento e habilidade nunca disputam um id. */}
      {treeId && <ArteDaHabilidade treeId={treeId} abilityId={def.id} />}
    </div>
  );
}
