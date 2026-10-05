import { Fragment } from "react";
import { FASES_DAS_NOTAS, type FaseDasNotas, type LinhaDaMesa } from "@/data/fasesDasNotas";
import { AREAS_DAS_NOTAS, PATCH_NOTES, idDaVersao, type AreaDaNota, type PatchNote } from "@/data/patchNotes";
import FiltroDasNotas from "./FiltroDasNotas";
import s from "./notas.module.css";
import IconeDaArea from "./IconeDaArea";

/**
 * A página Novidades (2026-10-01): o histórico inteiro por fase, cada bloco
 * com a sua área, o "Na mesa" de cada fase e um filtro por área.
 *
 * A fase atual vem aberta. Nas antigas, o "Na mesa" e as versões ficam
 * recolhidos: são mais de mil linhas que só importam pra quem está
 * reconstituindo por que uma regra mudou. O filtro abre o que sobra.
 */

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const dataCurta = (d: string) => {
  const [, m, dia] = d.split("-").map(Number);
  return `${dia} ${MESES[m - 1]}`;
};

/** `trecho` vira código; o resto é texto. */
export function Texto({ children }: { children: string }) {
  const partes = children.split(/`([^`]+)`/);
  return (
    <>
      {partes.map((p, i) => (i % 2 === 1 ? <code key={i}>{p}</code> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

/** "0.1.95.1" → 0.1. + 95.1 (o número grande é o que muda). */
export function Numero({ versao }: { versao: string }) {
  const [a, b, ...resto] = versao.split(".");
  return (
    <p className={s.numero}>
      <span>
        {a}.{b}.
      </span>
      {resto.join(".")}
    </p>
  );
}

const nomeDaArea = (a: AreaDaNota) => AREAS_DAS_NOTAS.find((x) => x.id === a)!.nome;
const itens = (n: PatchNote) => n.sections.reduce((t, x) => t + x.items.length, 0);

export function Blocos({ nota }: { nota: PatchNote }) {
  return (
    <>
      {nota.sections.map((sec, i) => (
        <section key={i} className={s.bloco} data-area={sec.area}>
          <h4>
            <span className={s.etiqueta}><IconeDaArea area={sec.area} />{nomeDaArea(sec.area)}</span> {sec.heading}
          </h4>
          <ul>
            {sec.items.map((item, j) => (
              <li key={j}>
                <Texto>{item}</Texto>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function CabecaDaVersao({ nota }: { nota: PatchNote }) {
  const areas = AREAS_DAS_NOTAS.filter((a) => nota.sections.some((x) => x.area === a.id));
  return (
    <>
      <Numero versao={nota.version} />
      <div className={s.versaoTitulo}>
        <p className={s.quando}>
          <span>{dataCurta(nota.date)}</span>
          <span className={s.pontos} aria-label={`Áreas: ${areas.map((a) => a.nome).join(", ")}`}>
            {areas.map((a) => (
              <span key={a.id} data-area={a.id} title={a.nome} />
            ))}
          </span>
          {nota.escritaDepois && <span className={s.depois}>Nota escrita depois</span>}
        </p>
        <h3>{nota.title}</h3>
      </div>
    </>
  );
}

function Versao({ nota, aberta }: { nota: PatchNote; aberta: boolean }) {
  const id = idDaVersao(nota.version);
  if (aberta) {
    return (
      <article className={s.versao} id={id}>
        <header className={s.versaoCabeca}>
          <CabecaDaVersao nota={nota} />
        </header>
        <Blocos nota={nota} />
      </article>
    );
  }
  return (
    <details className={s.versao} id={id} data-recolhida="">
      <summary className={s.versaoCabeca}>
        <CabecaDaVersao nota={nota} />
      </summary>
      <Blocos nota={nota} />
    </details>
  );
}

function Linhas({ linhas }: { linhas: LinhaDaMesa[] }) {
  return (
    <ul>
      {linhas.map((l) => (
        <li key={l.titulo}>
          <b>{l.titulo}:</b> {l.texto}
          {l.versoes.map((v) => (
            <a key={v} className={s.ref} href={`#${idDaVersao(v)}`}>
              {v}
            </a>
          ))}
        </li>
      ))}
    </ul>
  );
}

function NaMesa({ fase, aberta }: { fase: FaseDasNotas; aberta: boolean }) {
  return (
    <details className={s.mesa} open={aberta}>
      <summary className={s.mesaResumo}>
        Na mesa <small>o que mudou nesta fase</small>
      </summary>
      <div className={s.colunas}>
        <div>
          <h4>Para quem joga</h4>
          <Linhas linhas={fase.mesa.jogador} />
        </div>
        <div className={s.mestre}>
          <h4>Para quem mestra</h4>
          <Linhas linhas={fase.mesa.mestre} />
        </div>
      </div>
    </details>
  );
}

/** As notas de uma fase, da mais nova pra mais velha. */
function notasDa(fase: FaseDasNotas): PatchNote[] {
  const i = PATCH_NOTES.findIndex((n) => n.version === fase.ultima);
  const j = PATCH_NOTES.findIndex((n) => n.version === fase.primeira);
  return PATCH_NOTES.slice(i, j + 1);
}

export default function NotasDeVersao() {
  const fases = [...FASES_DAS_NOTAS].reverse();
  const atual = PATCH_NOTES[0];
  const primeira = PATCH_NOTES.at(-1)!;
  const total = PATCH_NOTES.reduce((t, n) => t + itens(n), 0);
  const porArea = AREAS_DAS_NOTAS.map((a) => ({
    ...a,
    n: PATCH_NOTES.reduce((t, n) => t + n.sections.filter((x) => x.area === a.id).reduce((u, x) => u + x.items.length, 0), 0),
  }));

  const conteudo = fases.map((fase, k) => {
    const notas = notasDa(fase);
    const ehAtual = k === 0;
    return (
      <section key={fase.id} id={fase.id} className={s.fase}>
        <header className={s.faseCabeca}>
          <p className={s.faseIntervalo}>
            {fase.primeira} → {fase.ultima} · {fase.datas}
          </p>
          <h2 className={s.faseNome}>
            {fase.nome}
            {ehAtual && <span className={s.atual}>Fase atual</span>}
          </h2>
          <p className={s.faseResumo}>{fase.resumo}</p>
        </header>
        <NaMesa fase={fase} aberta={ehAtual} />
        {notas.map((n) => (
          <Versao key={n.version} nota={n} aberta={ehAtual} />
        ))}
      </section>
    );
  });

  return (
    <div className={s.raiz} id="notas" data-notas="">
      <div className={s.folha}>
        <header className={s.abertura}>
          <p className={s.sobretitulo}>Mushoku Tensei RPG · Notas de versão</p>
          <h1 className={s.titulo}>
            <span className={s.marca}>{primeira.version}</span> <span className={s.seta}>→</span> {atual.version}
          </h1>
          <p className={s.resumo}>
            Tudo o que mudou no livro, nas regras, no simulador e no site, por fase. Em cada fase, o &ldquo;Na
            mesa&rdquo; diz o que muda pra quem joga e pra quem mestra.
          </p>
          <span className={s.kanji} aria-hidden>
            更新記録
          </span>
          <ul className={s.contagem}>
            <li>
              <b>{PATCH_NOTES.length}</b>versões
            </li>
            <li>
              <b>{total}</b>mudanças
            </li>
            <li>
              <b>{fases.length}</b>fases
            </li>
          </ul>
          <div className={s.barra} role="img" aria-label={`Mudanças por área: ${porArea.map((a) => `${a.nome} ${a.n}`).join(", ")}`}>
            {porArea.map((a) => (
              <span key={a.id} data-area={a.id} style={{ flex: a.n }} />
            ))}
          </div>
          <ul className={s.legenda}>
            {porArea.map((a) => (
              <li key={a.id} data-area={a.id}>
                <i />
                <IconeDaArea area={a.id} />{a.nome} <b>{a.n}</b>
              </li>
            ))}
          </ul>
        </header>

        <nav className={s.sumario} aria-labelledby="fases-titulo">
          <h2 className={s.rotulo} id="fases-titulo">
            As fases
          </h2>
          <ol>
            {fases.map((f) => (
              <li key={f.id}>
                <a href={`#${f.id}`}>
                  <span className={s.sumNum}>
                    {f.primeira} → {f.ultima}
                  </span>
                  <span className={s.sumNome}>{f.nome}</span>
                  <span className={s.sumData}>{f.datas}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <FiltroDasNotas />

        <div>{conteudo}</div>
      </div>
    </div>
  );
}
