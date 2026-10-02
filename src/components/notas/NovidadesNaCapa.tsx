import Link from "next/link";
import { FASES_DAS_NOTAS } from "@/data/fasesDasNotas";
import { PATCH_NOTES, idDaVersao } from "@/data/patchNotes";
import { Blocos, Numero, dataCurta } from "./NotasDeVersao";
import s from "./notas.module.css";

/**
 * As novidades na capa: a versão atual inteira e uma lista curta das
 * anteriores. O histórico (mais de mil linhas) mora em /novidades — na capa
 * ele ia duas vezes na página (HTML e dados do React), e ela era a segunda
 * página mais pesada do site (0.1.99).
 */
export default function NovidadesNaCapa({ anteriores = 5 }: { anteriores?: number }) {
  const [atual, ...resto] = PATCH_NOTES;
  if (!atual) return null;
  const fase = FASES_DAS_NOTAS.at(-1)!;

  return (
    <section className={`${s.raiz} ${s.capa}`} aria-labelledby="novidades-titulo">
      <div className={s.folha}>
        <p className={s.sobretitulo}>Notas de versão · {fase.nome}</p>
        <div className={s.capaCabeca}>
          <h2 className={s.rotulo} id="novidades-titulo">
            Novidades
          </h2>
          <Link href="/novidades" prefetch={false} className={s.ref}>
            todas as {PATCH_NOTES.length} versões, por fase
          </Link>
        </div>

        <article className={s.versao}>
          <header className={s.versaoCabeca}>
            <Numero versao={atual.version} />
            <div className={s.versaoTitulo}>
              <p className={s.quando}>{dataCurta(atual.date)}</p>
              <h3>{atual.title}</h3>
            </div>
          </header>
          <Blocos nota={atual} />
        </article>

        <ol className={s.anteriores}>
          {resto.slice(0, anteriores).map((n) => (
            <li key={n.version}>
              <Link href={`/novidades#${idDaVersao(n.version)}`} prefetch={false}>
                <span className={s.sumNum}>{n.version}</span>
                <span className={s.sumNome}>{n.title}</span>
                <span className={s.sumData}>{dataCurta(n.date)}</span>
              </Link>
            </li>
          ))}
        </ol>
        <Link href={`/novidades#${fase.id}`} prefetch={false} className={s.todas}>
          Na mesa: o que mudou nesta fase →
        </Link>
      </div>
    </section>
  );
}
