import { BACKGROUNDS, OLHO_TABLE } from "@/data/backgrounds";
import { arteDoLivro } from "./arteDasRacas";

/**
 * OS ANTECEDENTES, COM RETRATO (2026-09-25).
 *
 * Eram uma tabela de quatro colunas (d100, nome, efeito, ouro) — e a coluna
 * do efeito carregava parágrafos inteiros, espremidos. Viraram fichas: a
 * faixa do d100 grande, o nome, o ouro inicial num selo, o retrato da
 * infância (quando a arte existe em `public/livro/antecedentes/<id>`) e os
 * efeitos em lista. O texto é exatamente o que a tabela imprimia.
 *
 * A ordem continua sendo a do d100, então a mesa rola e desce a lista.
 */

/** Os efeitos de um antecedente, na ordem em que a tabela os imprimia. */
function efeitos(bg: (typeof BACKGROUNDS)[number]): string[] {
  return [
    ...(bg.fixedSkills ?? []).map((s) => `Perícia: ${s}.`),
    // A linha genérica some quando um traço já descreve a escolha (Plebeu,
    // Órfão): impressas as duas, a mesa lia quatro perícias onde há duas.
    ...(bg.bonusSkillChoices && !bg.traits.some((t) => t.includes("Perícias à escolha"))
      ? [`${bg.bonusSkillChoices} Perícias à escolha.`]
      : []),
    ...bg.traits,
  ];
}

const faixa = (r: [number, number]) =>
  r[0] === r[1] ? String(r[0]).padStart(2, "0") : `${String(r[0]).padStart(2, "0")}–${String(r[1]).padStart(2, "0")}`;

export default function AntecedentesIlustrados() {
  return (
    <div className="livro-antecedentes space-y-3">
      {BACKGROUNDS.map((bg, i) => {
        const arte = arteDoLivro("antecedentes", bg.id);
        return (
          <article
            key={bg.id}
            id={`antecedente-${bg.id}`}
            className="livro-antecedente print-avoid-break overflow-hidden rounded-xl border border-parchment-300 bg-parchment-100/60 p-3 text-sm dark:border-parchment-800 dark:bg-parchment-900/40"
            data-lado={i % 2 === 0 ? "dir" : "esq"}
          >
            {arte && (
              <figure
                className="livro-antecedente-retrato float-right mb-1 ml-3 w-28 overflow-hidden rounded-lg"
                data-recorte={arte.recorte ? "" : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- retrato pequeno, impresso no papel. */}
                <img
                  src={arte.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={`aspect-[4/5] w-full ${arte.recorte ? "object-cover object-top" : "object-cover"}`}
                />
              </figure>
            )}
            <header className="livro-antecedente-cabeca flex items-baseline gap-2">
              <span className="livro-antecedente-faixa font-mono text-xs font-bold text-wine-700 dark:text-wine-300">
                {faixa(bg.rollRange)}
              </span>
              <h4 className="livro-antecedente-nome font-display text-base font-semibold text-parchment-900 dark:text-parchment-50">
                {bg.name}
              </h4>
            </header>
            <p className="livro-antecedente-ouro mt-0.5 text-xs text-parchment-600 dark:text-parchment-400">
              Começa com <b>{bg.startingGold} PO</b>
            </p>
            <ul className="livro-antecedente-efeitos mt-1.5 list-disc space-y-0.5 pl-5 text-parchment-700 dark:text-parchment-300">
              {efeitos(bg).map((e, k) => (
                <li key={k}>{e}</li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

/**
 * OS OLHOS EM MOVIMENTO: os olhos da tabela que têm cena animada
 * (`public/livro/olhos/<id do olho>`), lado a lado, com o número do d10 e o
 * nome — e a Kishirika, que é quem distribui olhos demoníacos no mundo.
 */
export function OlhosEmMovimento() {
  const olhos = OLHO_TABLE.map((e) => ({ e, arte: arteDoLivro("olhos", e.id) })).filter((o) => o.arte);
  const kishirika = arteDoLivro("olhos", "kishirika");
  if (olhos.length === 0 && !kishirika) return null;
  return (
    <>
      {olhos.length > 0 && (
        <figure className="livro-olhos my-3 grid grid-cols-3 gap-2" aria-label="Três olhos místicos em uso">
          {olhos.map(({ e, arte }) => (
            <span key={e.id} className="livro-olho">
              {/* eslint-disable-next-line @next/next/no-img-element -- animação curta, impressa no papel. */}
              <img src={arte!.src} alt={e.name} loading="lazy" decoding="async" className="aspect-square w-full rounded-lg object-cover" />
              <span className="livro-olho-legenda mt-1 block text-center text-3xs uppercase tracking-wider text-parchment-600 dark:text-parchment-400">
                {e.roll} · {e.name.replace(/^Olhos? (d[aeo]s? )?/, "")}
              </span>
            </span>
          ))}
        </figure>
      )}
      {kishirika && (
        <figure className="livro-kishirika my-3 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- arte impressa no papel. */}
          <img src={kishirika.src} alt="Kishirika Kishirisu, rindo." loading="lazy" decoding="async" className="aspect-video w-full object-cover" />
          <figcaption className="mt-1 text-xs italic text-parchment-600 dark:text-parchment-400">
            Kishirika Kishirisu, a Grande Imperatriz do Mundo Demoníaco: é ela quem dá olhos demoníacos a quem
            cai nas graças dela.
          </figcaption>
        </figure>
      )}
    </>
  );
}
