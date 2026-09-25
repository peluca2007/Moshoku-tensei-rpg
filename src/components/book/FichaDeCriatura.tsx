import Image from "next/image";
import {
  type CriaturaPronta,
  NOME_DO_ATRIBUTO,
  PAPEIS,
  type AtributoDaCriatura,
  aplicarPapel,
  bonusResistencia,
  fichaDeAtributos,
  getArquetipo,
  getMoldePorPatamar,
  percepcaoPassiva,
  rotuloPatamar,
  sinal,
} from "@/data/bestiary";

const ORDEM: AtributoDaCriatura[] = ["forca", "agilidade", "vigor", "intelecto", "espirito"];
const SIGLA: Record<AtributoDaCriatura, string> = {
  forca: "FOR",
  agilidade: "AGI",
  vigor: "VIG",
  intelecto: "INT",
  espirito: "ESP",
};

/**
 * A FICHA COMPLETA de uma criatura pronta do Apêndice G (2026-09-25).
 *
 * Até aqui o livro imprimia cada criatura como uma linha de PV/CA e a lista de
 * ações — e o Mestre tinha que abrir a tabela do molde, a do arquétipo e a da
 * Percepção pra saber a Força do bicho ou se ele enxerga um ladino escondido.
 * Tudo isso já estava nos dados; faltava o livro juntar num lugar só.
 *
 * Nenhum número é digitado aqui: atributos saem de patamar + arquétipo, PV e
 * dano do papel, CA/ataque/CD do molde, Percepção do Espírito. É o mesmo
 * Bloco do Monstro que /encontros monta, visto inteiro.
 */
export default function FichaDeCriatura({ c }: { c: CriaturaPronta }) {
  const molde = getMoldePorPatamar(c.patamar);
  const arq = getArquetipo(c.arquetipo);
  const papel = PAPEIS.find((p) => p.id === c.papel);
  const { pv, danoPorTurno } = aplicarPapel(c.patamar, c.papel);
  const atributos = fichaDeAtributos(c.patamar, c.arquetipo);
  const deslocamento = c.deslocamento ?? arq?.deslocamento ?? 9;
  const sentido = c.sentido ?? arq?.sentido;

  const linhas: [string, string][] = [
    ["Deslocamento", [`${deslocamento} m`, c.movimentoEspecial].filter(Boolean).join(" · ")],
    ...(sentido ? ([["Sentidos", sentido]] as [string, string][]) : []),
    ["Vantagem em", (c.pericias ?? []).join(", ") || "—"],
    ...((c.resistencias ?? []).length
      ? ([["Resistência", (c.resistencias ?? []).join(", ")]] as [string, string][])
      : []),
    ...((c.imunidades ?? []).length ? ([["Imunidade", (c.imunidades ?? []).join(", ")]] as [string, string][]) : []),
    ["Bônus de Rank", `+${molde.patamar} (patamar ${molde.patamar})`],
    [
      "Resistir",
      `${sinal(bonusResistencia(molde))} em todo teste${arq ? `, com Vantagem nos de ${arq.principal}` : ""}`,
    ],
  ];

  return (
    <article
      id={`criatura-${c.id}`}
      className="livro-ficha print-avoid-break overflow-hidden rounded-xl border border-parchment-300 bg-parchment-100/60 text-sm dark:border-parchment-800 dark:bg-parchment-900/40"
    >
      <header className="livro-ficha-cabeca flex items-center gap-3 border-b border-parchment-300 bg-parchment-200/60 p-3 dark:border-parchment-800 dark:bg-parchment-900/70">
        {c.icon && (
          <span className="livro-ficha-retrato relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            <Image src={c.icon} alt="" fill sizes="64px" className="object-cover" />
          </span>
        )}
        <div className="min-w-0">
          <p className="livro-ficha-nome font-display text-lg font-bold text-parchment-900 dark:text-parchment-50">
            {c.nome}
          </p>
          <p className="livro-ficha-tipo text-xs italic text-parchment-600 dark:text-parchment-400">
            {c.tamanho ?? "Médio"} · {arq?.nome ?? "sem arquétipo"} · {rotuloPatamar(c.patamar)} ·{" "}
            {papel?.nome ?? c.papel}
          </p>
        </div>
      </header>

      <div className="space-y-2.5 p-3">
        {/* O trio que a mesa pergunta primeiro. */}
        <dl className="livro-ficha-vitais grid grid-cols-3 gap-2 text-center">
          {[
            ["CA", String(molde.ca)],
            ["PV", String(pv)],
            ["Ataque", `+${molde.bonusAtaque}`],
            ["CD", String(molde.cdResistencia)],
            ["Dano/turno", `~${danoPorTurno}`],
            ["Percepção", String(percepcaoPassiva(c.patamar, c.arquetipo))],
          ].map(([rotulo, valor]) => (
            <div key={rotulo} className="rounded-lg bg-parchment-200/60 px-2 py-1.5 dark:bg-parchment-900/60">
              <dt className="text-3xs font-bold uppercase tracking-wider text-parchment-600 dark:text-parchment-400">
                {rotulo}
              </dt>
              <dd className="font-display text-base font-bold text-parchment-900 dark:text-parchment-50">{valor}</dd>
            </div>
          ))}
        </dl>

        {/* Os cinco atributos, com o degrau do arquétipo marcado. */}
        <dl className="livro-ficha-atributos grid grid-cols-5 gap-1 text-center">
          {ORDEM.map((k) => (
            <div
              key={k}
              data-principal={arq && NOME_DO_ATRIBUTO[k] === arq.principal ? "" : undefined}
              className="rounded-md border border-parchment-300 px-1 py-1 dark:border-parchment-800"
            >
              <dt className="text-3xs font-bold tracking-wider text-parchment-600 dark:text-parchment-400">{SIGLA[k]}</dt>
              <dd className="font-bold text-parchment-900 dark:text-parchment-50">{sinal(atributos[k])}</dd>
            </div>
          ))}
        </dl>

        <dl className="livro-ficha-linhas space-y-0.5">
          {linhas.map(([rotulo, valor]) => (
            <div key={rotulo}>
              <dt className="inline font-bold text-parchment-900 dark:text-parchment-50">{rotulo}. </dt>
              <dd className="inline text-parchment-700 dark:text-parchment-300">{valor}</dd>
            </div>
          ))}
        </dl>

        <p className="livro-ficha-perigo text-parchment-700 dark:text-parchment-300">
          <b className="text-parchment-900 dark:text-parchment-50">O que a torna perigosa. </b>
          {c.perigo}
        </p>

        <div className="livro-ficha-acoes">
          <p className="border-b border-parchment-300 pb-0.5 text-xs font-bold uppercase tracking-wider text-wine-700 dark:border-parchment-800 dark:text-wine-300">
            Ações
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {c.acoes.map((a) => (
              <li key={a.nome} className="text-parchment-700 dark:text-parchment-300">
                <b className="text-parchment-900 dark:text-parchment-50">{a.nome}.</b>{" "}
                <span className="livro-ficha-acao-meta text-xs text-parchment-600 dark:text-parchment-400">
                  {a.acoes} Ação{a.acoes > 1 ? "es" : ""} · {a.alcance} ·{" "}
                  {a.tipo === "ataque" ? `ataque +${molde.bonusAtaque} contra a CA` : `resistência CD ${molde.cdResistencia}`}
                  {a.area && " · em área"}
                  {a.dano && ` · ${a.dano} de dano`}
                </span>{" "}
                {a.nota}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
