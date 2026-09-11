"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, ChevronDown, Search, X } from "lucide-react";
import EntryCard from "@/components/book/EntryCard";
import EmptyState from "@/components/ui/EmptyState";
import {
  buscar,
  contarPorTipo,
  ConteudoDoc,
  DocBusca,
  Resultado,
  termosDe,
  TIPO_LABELS,
  TIPO_ORDEM,
  TipoDoc,
  trechoQueCasa,
} from "@/lib/busca";
import { normalizarAlinhado } from "@/lib/texto";
import { rotuloDeAcoes } from "@/lib/rotuloDeAcoes";

/** Quantos resultados entram em tela de uma vez. Mais que isso, o botão do fim. */
const PAGINA = 40;

/**
 * Pinta o pedaço que casou.
 *
 * Sem isso, um resultado achado pelo CORPO do texto (o caso de "qual magia
 * aplica Envenenado") chega como um parágrafo em que a palavra procurada está
 * escondida em algum lugar — e a pessoa lê o parágrafo inteiro pra descobrir se
 * era esse mesmo.
 */
function Realce({ texto, termos }: { texto: string; termos: string[] }) {
  const partes = useMemo(() => {
    if (termos.length === 0) return [texto];
    const norm = normalizarAlinhado(texto);
    const marcas: [number, number][] = [];
    for (const termo of termos) {
      let de = norm.indexOf(termo);
      while (de !== -1) {
        marcas.push([de, de + termo.length]);
        de = norm.indexOf(termo, de + termo.length);
      }
    }
    if (marcas.length === 0) return [texto];
    marcas.sort((a, b) => a[0] - b[0]);

    // Termos que se sobrepõem ("peco" e "peconha" na mesma consulta) viram uma
    // marca só; duas marcas cruzadas cortariam o texto em pedaços fora de ordem.
    const unidas: [number, number][] = [];
    for (const [de, ate] of marcas) {
      const ultima = unidas[unidas.length - 1];
      if (ultima && de <= ultima[1]) ultima[1] = Math.max(ultima[1], ate);
      else unidas.push([de, ate]);
    }

    const saida: (string | { marca: string })[] = [];
    let cursor = 0;
    for (const [de, ate] of unidas) {
      if (de > cursor) saida.push(texto.slice(cursor, de));
      saida.push({ marca: texto.slice(de, ate) });
      cursor = ate;
    }
    if (cursor < texto.length) saida.push(texto.slice(cursor));
    return saida;
  }, [texto, termos]);

  return (
    <>
      {partes.map((p, i) =>
        typeof p === "string" ? (
          p
        ) : (
          <mark
            key={i}
            className="rounded bg-gold-300/60 px-0.5 text-parchment-900 dark:bg-gold-500/30 dark:text-gold-100"
          >
            {p.marca}
          </mark>
        )
      )}
    </>
  );
}

/** Lista de pares rótulo/valor, o formato de quase todo card que não é habilidade. */
function Campos({ linhas }: { linhas: [string, React.ReactNode][] }) {
  return (
    <dl className="mt-1 space-y-0.5 text-xs text-parchment-600 dark:text-parchment-400">
      {linhas.map(([rotulo, valor]) => (
        <div key={rotulo} className="flex gap-1.5">
          <dt className="shrink-0 font-semibold text-parchment-700 dark:text-parchment-300">{rotulo}</dt>
          <dd className="min-w-0">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

function CartaoSimples({
  titulo,
  children,
}: {
  titulo?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-parchment-300 bg-parchment-50/80 p-3 text-sm dark:border-parchment-800 dark:bg-parchment-950/40">
      {titulo}
      {children}
    </div>
  );
}

/**
 * O conteúdo inteiro do resultado, no formato de cada tipo.
 *
 * As habilidades e talentos reusam o `EntryCard` do livro de propósito (ver o
 * cabeçalho dele): quem busca no meio do turno precisa da mesma coisa que o
 * livro mostra — as três formas de conjurar, o cântico, o dano —, não de um
 * resumo que um dia diverge do original.
 */
function Conteudo({ conteudo, termos }: { conteudo: ConteudoDoc; termos: string[] }) {
  switch (conteudo.tipo) {
    /*
     * A seção do livro — 0.1.60.
     *
     * Ela não tem card porque não tem corpo: o índice guarda o TÍTULO e o
     * caminho, e o texto da regra mora no JSX do livro. O resultado é
     * deliberadamente um convite pra ir ler lá, e não um resumo que envelheceria
     * sozinho ao lado da fonte.
     */
    case "secao":
      return (
        <p className="rounded-lg border border-wine-200 bg-wine-50/60 p-3 text-sm text-wine-950/80 dark:border-wine-900 dark:bg-wine-950/30 dark:text-wine-100/80">
          Uma seção de regras em <b>{conteudo.onde}</b>. Abrir leva direto ao trecho no livro.
        </p>
      );
    case "habilidade":
      return <EntryCard kind="ability" def={conteudo.def} rank={conteudo.rank} />;
    case "talento":
      return <EntryCard kind="talent" def={conteudo.def} rank={conteudo.rank} />;
    case "maestria":
      return (
        <div className="rounded-lg border border-gold-300 bg-gold-50/60 p-3 text-sm dark:border-gold-900 dark:bg-gold-950/30">
          <p className="font-bold text-gold-700 dark:text-gold-400">◈ Maestria: {conteudo.def.name}</p>
          <p className="mt-1 text-gold-900/80 dark:text-gold-200/80">
            <Realce texto={conteudo.def.description} termos={termos} />
          </p>
          <p className="mt-1.5 text-xs text-gold-800/70 dark:text-gold-300/70">
            Grátis ao desbloquear {conteudo.rank} em {conteudo.tree.name} — não custa PA e não conta como
            conhecimento.
          </p>
        </div>
      );
    case "combinada": {
      const m = conteudo.magia;
      return (
        <CartaoSimples
          titulo={
            <p className="font-bold text-parchment-900 dark:text-parchment-50">
              {m.name}
              <span className="ml-1 text-xs font-normal text-parchment-600 dark:text-parchment-400">
                — Magia combinada · {m.paCost} PA | {m.pmCost} PM
              </span>
            </p>
          }
        >
          <p className="mt-1 leading-relaxed text-parchment-700 dark:text-parchment-300">
            <Realce texto={m.effect} termos={termos} />
          </p>
          <Campos
            linhas={[
              ["Portas:", m.requires.map((r) => `${r.treeId} ${r.rank}`).join(" + ")],
              ["Alcance:", m.range],
              ["Ações:", String(m.actions)],
              ["Dano:", m.damage],
            ]}
          />
        </CartaoSimples>
      );
    }
    case "arvore": {
      const t = conteudo.tree;
      return (
        <CartaoSimples
          titulo={
            <p className="font-bold text-parchment-900 dark:text-parchment-50">
              {t.name}
              <span className="ml-1 text-xs font-normal text-parchment-600 dark:text-parchment-400">
                — {t.subgroup}
              </span>
            </p>
          }
        >
          {t.tagline && (
            <p className="mt-1 leading-relaxed text-parchment-700 dark:text-parchment-300">
              <Realce texto={t.tagline} termos={termos} />
            </p>
          )}
          {t.mechanic && (
            <p className="mt-1 text-sm font-semibold text-wine-700 dark:text-wine-300">
              <Realce texto={t.mechanic.hook} termos={termos} />
            </p>
          )}
          <Campos
            linhas={[
              ["Recurso:", t.resourceLabel ?? "—"],
              ["Atributo-chave:", t.keyAttributeLabel ?? "—"],
              ["Patamares escritos:", `${t.ranks.filter((r) => r.abilities.length > 0 || r.talents.length > 0).length}`],
            ]}
          />
          <Link
            href={{ pathname: "/arvores", query: { arvore: t.id } }}
            className="mt-2 inline-block text-xs font-semibold text-wine-700 underline-offset-2 hover:underline dark:text-wine-300"
          >
            Abrir no mapa de árvores →
          </Link>
        </CartaoSimples>
      );
    }
    case "item": {
      const i = conteudo.item;
      return (
        <CartaoSimples
          titulo={
            <p className="font-bold text-parchment-900 dark:text-parchment-50">
              {i.name}
              <span className="ml-1 text-xs font-normal text-parchment-600 dark:text-parchment-400">
                — {i.price} PO · Rank de Guilda {i.guildRankRequired}
              </span>
            </p>
          }
        >
          <p className="mt-1 leading-relaxed text-parchment-700 dark:text-parchment-300">
            <Realce texto={i.description} termos={termos} />
          </p>
          {(i.baseDie || i.acBonus) && (
            <Campos
              linhas={[
                ...(i.baseDie ? ([["Dado:", i.baseDie]] as [string, React.ReactNode][]) : []),
                ...(i.acBonus ? ([["CA:", `+${i.acBonus}`]] as [string, React.ReactNode][]) : []),
              ]}
            />
          )}
        </CartaoSimples>
      );
    }
    case "raca": {
      const r = conteudo.raca;
      return (
        <CartaoSimples
          titulo={<p className="font-bold text-parchment-900 dark:text-parchment-50">{r.name}</p>}
        >
          <p className="mt-1 leading-relaxed text-parchment-700 dark:text-parchment-300">
            <Realce texto={r.description} termos={termos} />
          </p>
          <ul className="mt-1.5 space-y-0.5 text-xs text-parchment-600 dark:text-parchment-400">
            {r.traits.map((t) => (
              <li key={t}>
                • <Realce texto={t} termos={termos} />
              </li>
            ))}
          </ul>
        </CartaoSimples>
      );
    }
    case "antecedente": {
      const a = conteudo.antecedente;
      return (
        <CartaoSimples
          titulo={
            <p className="font-bold text-parchment-900 dark:text-parchment-50">
              {a.name}
              <span className="ml-1 text-xs font-normal text-parchment-600 dark:text-parchment-400">
                — d100 {a.rollRange[0]}–{a.rollRange[1]}
              </span>
            </p>
          }
        >
          <ul className="mt-1 space-y-0.5 text-sm text-parchment-700 dark:text-parchment-300">
            {a.traits.map((t) => (
              <li key={t}>
                • <Realce texto={t} termos={termos} />
              </li>
            ))}
          </ul>
          <Campos linhas={[["Ouro inicial:", a.startingGold]]} />
        </CartaoSimples>
      );
    }
    case "pericia":
      return (
        <CartaoSimples
          titulo={<p className="font-bold text-parchment-900 dark:text-parchment-50">{conteudo.pericia.name}</p>}
        >
          <p className="mt-1 leading-relaxed text-parchment-700 dark:text-parchment-300">
            <Realce texto={conteudo.pericia.description} termos={termos} />
          </p>
        </CartaoSimples>
      );
    case "criatura": {
      const c = conteudo.criatura;
      return (
        <CartaoSimples
          titulo={
            <p className="font-bold text-parchment-900 dark:text-parchment-50">
              {c.nome}
              <span className="ml-1 text-xs font-normal text-parchment-600 dark:text-parchment-400">
                — {c.patamar}º patamar
              </span>
            </p>
          }
        >
          <p className="mt-1 leading-relaxed text-parchment-700 dark:text-parchment-300">
            <Realce texto={c.perigo} termos={termos} />
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-parchment-600 dark:text-parchment-400">
            {c.acoes.map((a) => (
              <li key={a.nome}>
                <b className="text-parchment-700 dark:text-parchment-300">{a.nome}</b> ·
                {rotuloDeAcoes(a.acoes)} · {a.dano} · {a.alcance}
                <br />
                <Realce texto={a.nota} termos={termos} />
              </li>
            ))}
          </ul>
        </CartaoSimples>
      );
    }
  }
}

/** O selo de tipo, na linha do resultado. Um resultado sem ele é um nome sem origem. */
function Selo({ tipo }: { tipo: TipoDoc }) {
  return (
    <span className="shrink-0 rounded-full bg-wine-600/10 px-2 py-0.5 text-2xs font-bold uppercase tracking-wide text-wine-700 ring-1 ring-wine-500/25 dark:bg-wine-500/15 dark:text-wine-300">
      {TIPO_LABELS[tipo]}
    </span>
  );
}

function LinhaResultado({
  resultado,
  termos,
  aberto,
  aoAlternar,
}: {
  resultado: Resultado;
  termos: string[];
  aberto: boolean;
  aoAlternar: () => void;
}) {
  const d: DocBusca = resultado.doc;
  const trecho = resultado.soNoCorpo ? trechoQueCasa(d.corpo, termos) : null;
  const idPainel = `busca-${d.chave.replace(/[^\w-]/g, "_")}`;

  return (
    <li className="overflow-hidden rounded-xl border border-parchment-300 bg-parchment-50/70 dark:border-parchment-800 dark:bg-parchment-950/30">
      <button
        type="button"
        onClick={aoAlternar}
        aria-expanded={aberto}
        aria-controls={idPainel}
        className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-parchment-900/5 dark:hover:bg-white/5"
      >
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-parchment-500 transition-transform ${aberto ? "rotate-180" : ""}`}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-display font-bold text-parchment-900 dark:text-parchment-50">
              <Realce texto={d.nome} termos={termos} />
            </span>
            <Selo tipo={d.tipo} />
          </span>
          <span className="mt-0.5 block text-xs text-parchment-600 dark:text-parchment-400">
            <Realce texto={d.contexto} termos={termos} />
          </span>
          {trecho && (
            <span className="mt-1 block text-xs italic leading-relaxed text-parchment-700 dark:text-parchment-300">
              <Realce texto={trecho} termos={termos} />
            </span>
          )}
        </span>
      </button>

      {aberto && (
        <div id={idPainel} className="border-t border-parchment-300 p-3 dark:border-parchment-800">
          <Conteudo conteudo={d.conteudo} termos={termos} />
          <Link
            href={d.href}
            className="mt-2 inline-flex min-h-[24px] items-center gap-1.5 text-xs font-semibold text-wine-700 underline-offset-2 hover:underline dark:text-wine-300"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            Ver no lugar de origem
          </Link>
        </div>
      )}
    </li>
  );
}

/**
 * A busca global — 0.1.17.
 *
 * Até aqui o site não tinha caminho nenhum pra "qual magia aplica Envenenado"
 * ou "onde está a Peçonha": o filtro do sumário do livro reduz TÍTULOS de
 * seção, o seletor do mapa acha árvore por nome, e o resto era rolar os 190 mil
 * caracteres do `/livro`.
 *
 * Duas decisões que valem ser lidas antes de mexer:
 *
 * 1. **É uma rota, e não um painel por atalho de teclado.** O site já usa `R`
 *    pro rolador, e um segundo atalho seria coerente — em um teclado. A regra
 *    do projeto é mobile-first, e numa mesa de verdade a busca é feita com o
 *    polegar: rota tem link no menu, tem endereço, e o `?q=` deixa mandar uma
 *    busca pronta pro grupo no chat. Atalho não tem nada disso.
 *
 * 2. **O resultado abre AQUI, e não leva pro livro.** Quem busca no meio do
 *    turno quer o texto, não a viagem: o card que abre é o mesmo do livro
 *    (`EntryCard`), com as três formas de conjuração e o cântico. O link pro
 *    lugar de origem continua embaixo, pra quem quer o contexto em volta.
 */
export default function BuscaGlobal() {
  const parametros = useSearchParams();
  const [consulta, setConsulta] = useState(() => parametros.get("q") ?? "");
  const [tipos, setTipos] = useState<Set<TipoDoc>>(new Set());
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [limite, setLimite] = useState(PAGINA);
  const campo = useRef<HTMLInputElement>(null);

  const termos = useMemo(() => termosDe(consulta), [consulta]);
  const contagem = useMemo(() => contarPorTipo(consulta), [consulta]);
  const resultados = useMemo(() => buscar(consulta, tipos), [consulta, tipos]);

  /*
   * Consulta nova (ou filtro novo) volta a lista pro começo — senão quem apertou
   * "mostrar mais" três vezes recebe 160 resultados da busca SEGUINTE de uma vez.
   *
   * Ajustado durante o render, e não num efeito: um setState dentro de efeito
   * pinta a tela uma vez com o limite velho antes de corrigir, e o lint do
   * projeto barra o padrão. Ver https://react.dev/learn/you-might-not-need-an-effect.
   */
  const assinatura = consulta + "|" + [...tipos].sort().join(",");
  const [assinaturaAplicada, setAssinaturaAplicada] = useState(assinatura);
  if (assinatura !== assinaturaAplicada) {
    setAssinaturaAplicada(assinatura);
    setLimite(PAGINA);
  }

  /*
   * O `?q=` acompanha o que está digitado, mas por `replaceState` e não pelo
   * router: cada tecla criaria uma entrada no histórico, e sair da busca
   * exigiria apertar Voltar uma vez por letra digitada. Assim o endereço
   * continua compartilhável e recarregável, e o Voltar volta pra página
   * anterior — que é o que ele promete.
   */
  useEffect(() => {
    const url = new URL(window.location.href);
    if (consulta.trim()) url.searchParams.set("q", consulta);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }, [consulta]);

  function alternarTipo(tipo: TipoDoc) {
    setTipos((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(tipo)) proximo.delete(tipo);
      else proximo.add(tipo);
      return proximo;
    });
  }

  function alternarAberto(chave: string) {
    setAbertos((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(chave)) proximo.delete(chave);
      else proximo.add(chave);
      return proximo;
    });
  }

  const emTela = resultados.slice(0, limite);

  return (
    <>
      {/*
        A barra gruda no topo (abaixo do menu, que também é sticky e tem 80px):
        com a lista de resultados longa, rolar pra ler o quarto resultado
        escondia o campo — e refinar a busca virava uma viagem de volta ao topo.
      */}
      <div className="sticky top-[76px] z-30 -mx-4 mb-4 border-b border-parchment-300/70 bg-parchment-50/90 px-4 py-3 backdrop-blur-md dark:border-parchment-800/70 dark:bg-parchment-950/90 sm:-mx-6 sm:px-6">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-600 dark:text-parchment-400"
            aria-hidden
          />
          <input
            ref={campo}
            type="search"
            value={consulta}
            autoFocus
            onChange={(e) => setConsulta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setConsulta("");
            }}
            placeholder="Envenenado, Peçonha, poção, Superd…"
            aria-label="Buscar no livro inteiro"
            /*
              O X nativo do `type="search"` sai de cena: com o nosso botão de
              limpar ao lado, o campo mostrava DOIS X colados, e o de fora só
              aparece no Chrome de desktop — a mesa de celular nunca o veria.
              O `type` continua sendo "search" pelo teclado virtual, que troca o
              Enter por uma lupa.
            */
            className="w-full rounded-xl border border-parchment-300 bg-parchment-50 py-2.5 pl-9 pr-9 text-base [&::-webkit-search-cancel-button]:appearance-none text-parchment-900 placeholder:text-parchment-500 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50 dark:placeholder:text-parchment-500"
          />
          {consulta && (
            <button
              type="button"
              onClick={() => {
                setConsulta("");
                campo.current?.focus();
              }}
              aria-label="Limpar busca"
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-parchment-600 hover:text-wine-600 dark:text-parchment-400 dark:hover:text-wine-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {termos.length > 0 && (
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {TIPO_ORDEM.filter((t) => contagem[t] > 0).map((tipo) => {
              const ativo = tipos.has(tipo);
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => alternarTipo(tipo)}
                  aria-pressed={ativo}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    ativo
                      ? "border-wine-500 bg-wine-600 text-parchment-50"
                      : "border-parchment-300 bg-parchment-100/70 text-parchment-700 hover:border-wine-400 dark:border-parchment-700 dark:bg-parchment-900/50 dark:text-parchment-300"
                  }`}
                >
                  {TIPO_LABELS[tipo]}
                  <span className={ativo ? "text-parchment-200" : "text-parchment-600 dark:text-parchment-400"}>
                    {contagem[tipo]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {termos.length === 0 ? (
        <EmptyState
          icon={Search}
          hint="Ela procura no nome E no texto: “Envenenado” devolve tudo que aplica a condição, não só o que tem a palavra no título. Duas palavras estreitam — quem digita “fogo cura” só recebe o que é as duas coisas."
        >
          Digite qualquer palavra que o livro use.
        </EmptyState>
      ) : resultados.length === 0 ? (
        <EmptyState icon={Search} hint="Tente uma palavra só, ou o nome da condição em vez do da magia.">
          Nada no livro fala em “{consulta.trim()}”.
        </EmptyState>
      ) : (
        <>
          <p className="mb-2 text-xs text-parchment-600 dark:text-parchment-400" role="status">
            {resultados.length} {resultados.length === 1 ? "resultado" : "resultados"}
            {tipos.size > 0 && " (filtrado)"}
          </p>
          <ul className="space-y-2">
            {emTela.map((r) => (
              <LinhaResultado
                key={r.doc.chave}
                resultado={r}
                termos={termos}
                aberto={abertos.has(r.doc.chave)}
                aoAlternar={() => alternarAberto(r.doc.chave)}
              />
            ))}
          </ul>
          {resultados.length > emTela.length && (
            <button
              type="button"
              onClick={() => setLimite((l) => l + PAGINA)}
              className="mt-3 w-full rounded-xl border border-parchment-300 bg-parchment-100/70 py-2.5 text-sm font-semibold text-parchment-700 hover:border-wine-400 dark:border-parchment-700 dark:bg-parchment-900/50 dark:text-parchment-300"
            >
              Mostrar mais {Math.min(PAGINA, resultados.length - emTela.length)} (de{" "}
              {resultados.length - emTela.length} restantes)
            </button>
          )}
        </>
      )}
    </>
  );
}

