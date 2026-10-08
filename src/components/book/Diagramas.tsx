import { WEAPON_DIE_LADDER } from "@/lib/weaponDie";
import { RANK_BONUS, RANKS } from "@/lib/types";
import DiagramaInterativo, { type Demonstracao, type EtapaDeTiro } from "./DiagramaInterativo";
import Carimbo from "../Carimbo";
import { manobraDeTouki } from "@/data/manobrasDeTouki";
const ACOES_DO_TURNO = [1, 2, 3];

/**
 * Os diagramas do livro, em CSS e SVG puros — 0.1.63, refeitos em 0.1.64.
 *
 * ## Por que não são imagens
 *
 * Três razões, e a terceira é a que decide:
 *
 * 1. **Eles leem dos DADOS.** A Escada de Dados desenha `WEAPON_DIE_LADDER`, a
 *    dos patamares desenha `RANKS` e `RANK_BONUS`. Uma imagem seria uma segunda
 *    fonte de verdade que envelhece calada — no dia em que a escada ganhar um
 *    degrau (já ganhou três, em 2026-08-28), o PNG continuaria mostrando a
 *    antiga e ninguém notaria.
 * 2. **Eles herdam o tema.** Claro e escuro saem certos sem dois arquivos, e o
 *    contraste é conferido pelo `check:contraste` como qualquer outro texto.
 * 3. **Eles são TEXTO.** Um leitor de tela lê "d4, d6, d8"; numa imagem, lê o
 *    `alt` ou nada. O mesmo vale pra busca e pra impressão.
 *
 * ## A regra da animação
 *
 * **Ela tem que ensinar alguma coisa.** A escada cresce porque é uma escalada;
 * as etapas do Tiro Perfeito acendem em sequência porque SÃO uma sequência que
 * atravessa turnos; o Fio da Vida pulsa porque é um coração que ainda bate.
 * Animação que não ensina é distração num documento de 87 mil pixels — e a
 * primeira versão destes diagramas errou pro outro lado, ficando correta e sem
 * vida nenhuma.
 *
 * Tudo respeita `prefers-reduced-motion`, e quem pede menos movimento recebe o
 * diagrama **pronto** — não o primeiro quadro congelado, que seria um gráfico
 * errado.
 *
 * O que NÃO cabe aqui é ilustração — o golpe do Deus da Espada, a aura do
 * Touki, o círculo de invocação. Isso é arte, e arte é arquivo.
 */

/** A moldura comum: título, corpo e a nota que explica o desenho. */
function Quadro({
  titulo,
  nota,
  children,
  rolavel = false,
  demonstracao,
  etapas,
  caInicial,
}: {
  titulo: string;
  nota?: React.ReactNode;
  children: React.ReactNode;
  rolavel?: boolean;
  demonstracao?: Demonstracao;
  etapas?: EtapaDeTiro[];
  caInicial?: number;
}) {
  return (
    <figure className="diagrama my-5 rounded-2xl border border-gold-500/25 bg-gradient-to-br from-parchment-100/80 to-parchment-200/40 p-4 shadow-sm dark:border-gold-600/20 dark:from-parchment-900/70 dark:to-parchment-950/60">
      <figcaption className="mb-3 flex items-center gap-2">
        <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-500/40" />
        <span className="font-display text-xs font-black uppercase tracking-[0.18em] text-gold-700 dark:text-gold-300">
          {titulo}
        </span>
        <span aria-hidden className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-500/40" />
      </figcaption>
      {demonstracao ? <DiagramaInterativo tipo={demonstracao} etapas={etapas} caInicial={caInicial} acoes={ACOES_DO_TURNO.length} className={rolavel ? "overflow-x-auto pb-1 cursor-pointer" : "cursor-pointer"}>{children}</DiagramaInterativo> : <div className={rolavel ? "overflow-x-auto pb-1" : ""}>{children}</div>}
      {nota && (
        <p className="surge mt-3 text-xs leading-relaxed text-parchment-600 dark:text-parchment-400">
          {nota}
        </p>
      )}
    </figure>
  );
}

/**
 * COBERTURA — Cap. 4, §3.
 *
 * Visão de cima, que é como a mesa realmente discute cobertura: alguém aponta
 * pro mapa e pergunta "eu vejo ele?". As três linhas de tiro saem do MESMO
 * arqueiro, então o que muda de uma linha pra outra é só o que está no meio —
 * que é exatamente a regra. A linha Total para no muro em vez de chegar ao
 * alvo: o desenho diz "não pode ser alvo" sem precisar da legenda.
 */
export function Cobertura() {
  const linhas = [
    { y: 34, nome: "Parcial", bonus: "+2 CA", obsX: 120, obsW: 9, obsH: 16, alvoX: 176, ate: 176 },
    { y: 84, nome: "Superior", bonus: "+5 CA", obsX: 120, obsW: 9, obsH: 30, alvoX: 176, ate: 176 },
    { y: 134, nome: "Total", bonus: "não pode ser alvo", obsX: 120, obsW: 9, obsH: 44, alvoX: 176, ate: 118 },
  ];
  return (
    <Quadro
      titulo="Cobertura, vista de cima"
      nota="O mesmo arqueiro, o mesmo alvo, a mesma distância: o que muda é só o que está no meio. Duas coberturas não somam — vale a melhor. A Total não é um bônus grande, é uma resposta diferente: o tiro não acontece."
    >
      <svg
        viewBox="0 0 250 172"
        className="mx-auto h-52 w-full max-w-md"
        role="img"
        aria-label="Vista de cima: atrás de um parapeito a cobertura é Parcial e dá mais 2 de CA; atrás da quina de um muro é Superior e dá mais 5; atrás do muro inteiro é Total e o alvo não pode ser atacado"
      >
        {linhas.map((l) => (
          <g key={l.nome}>
            {/* O arqueiro, repetido em cada linha: é sempre o mesmo tiro. */}
            <circle cx="22" cy={l.y} r="7" className="fill-wine-600 dark:fill-wine-400" />
            <path
              d={`M 32 ${l.y} L ${l.ate} ${l.y}`}
              className={
                l.nome === "Total"
                  ? "fill-none stroke-parchment-400 [stroke-dasharray:4_4] dark:stroke-parchment-600"
                  : "fill-none stroke-gold-500/70 [stroke-dasharray:4_4] dark:stroke-gold-400/60"
              }
              strokeWidth="2"
            />
            {/* O obstáculo cresce de linha em linha: é a única variável. */}
            <rect
              x={l.obsX}
              y={l.y - l.obsH / 2}
              width={l.obsW}
              height={l.obsH}
              rx="2"
              className="fill-parchment-500 dark:fill-parchment-500"
            />
            <circle
              cx={l.alvoX}
              cy={l.y}
              r="7"
              className={
                l.nome === "Total"
                  ? "fill-parchment-400 dark:fill-parchment-700"
                  : "fill-parchment-600 dark:fill-parchment-300"
              }
            />
            <text
              x="196"
              y={l.y - 2}
              className="fill-parchment-800 font-display text-[9px] font-black uppercase tracking-wider dark:fill-parchment-100"
            >
              {l.nome}
            </text>
            <text x="196" y={l.y + 9} className="fill-gold-700 text-[8px] font-semibold dark:fill-gold-300">
              {l.bonus}
            </text>
          </g>
        ))}
      </svg>
    </Quadro>
  );
}
/**
 * A ESCADA DE DADOS — Cap. 3, §1.
 *
 * As barras crescem quando o leitor chega nelas, uma depois da outra: a escada
 * é uma escalada, e ver a escalada acontecer é metade do que o diagrama tem pra
 * dizer. Os quatro primeiros degraus são dourados porque é onde toda arma do
 * catálogo começa — nenhuma arma mundana nasce acima do d10.
 */
export function EscadaDeDados() {
  return (
    <Quadro
      titulo="A Escada de Dados"
      nota={
        <>
          Cada patamar de uma árvore do Corpo sobe um ou mais degraus. Os quatro primeiros{" "}
          <b className="text-gold-700 dark:text-gold-300">em dourado</b> são onde as armas do livro
          começam — o resto só se alcança subindo de Rank. O <b>5d12</b> é o último: degrau além dele vira
          +2 de dano fixo.
        </>
      }
      rolavel
    >
      <ol className="flex min-w-max items-end gap-1.5 pt-2">
        {WEAPON_DIE_LADDER.map((die, i) => {
          const inicial = i < 4;
          const altura = 30 + i * 6;
          return (
            <li key={die} className="group flex flex-col items-center gap-1">
              <span
                aria-hidden
                style={{ height: `${altura}px`, animationDelay: `${i * 45}ms` }}
                className={`barra-cresce w-10 rounded-t-md ring-1 transition-transform duration-200 group-hover:-translate-y-0.5 ${
                  inicial
                    ? "bg-gradient-to-t from-gold-600/50 to-gold-400 ring-gold-400/50"
                    : "bg-gradient-to-t from-wine-700/40 to-wine-500/80 ring-wine-400/30"
                }`}
              />
              <span
                className={`w-10 rounded-md py-1 text-center text-[10px] font-black tabular ring-1 ${
                  inicial
                    ? "bg-gold-500/15 text-gold-800 ring-gold-500/30 dark:text-gold-200"
                    : "bg-wine-500/10 text-wine-700 ring-wine-500/20 dark:text-wine-300"
                }`}
              >
                {die}
              </span>
            </li>
          );
        })}
      </ol>
    </Quadro>
  );
}

/**
 * O TRIÂNGULO DOS ESTILOS — Cap. 3, §4.
 *
 * Um triângulo **de verdade**, em SVG, e não três caixas em fila. A forma é a
 * informação: quem vence quem só é legível de relance quando o ciclo fecha
 * visualmente, e uma lista obriga o leitor a montar o círculo na cabeça.
 *
 * ## O que a animação ensina — refeita na 0.1.69
 *
 * Antes, um anel tracejado girava atrás de três bolinhas sem nome. Era
 * movimento sem conteúdo: o anel não dizia nada, e quem os vértices ERAM só
 * existia na lista ao lado.
 *
 * Agora um **golpe percorre o ciclo**, um lado de cada vez, na ordem em que
 * cada estilo vence o próximo — e o vértice atingido **encolhe e fica vinho**
 * no instante em que o golpe chega. Três coisas passam a ser lidas sem texto:
 * a ordem (Espada → Norte → Água), o fato de que a volta FECHA (o terceiro
 * golpe cai em quem deu o primeiro), e o de que ninguém está fora — todos os
 * três apanham, um por volta.
 *
 * O ciclo inteiro leva 7,2 s, 2,4 s por lado. Devagar o suficiente pra o olho
 * acompanhar de relance no meio da leitura, e não uma luz piscando.
 *
 * `pathLength={100}` normaliza os três lados: o dash do golpe é descrito em
 * porcentagem do lado, e não em unidades do `viewBox`, então os três levam
 * exatamente o mesmo tempo mesmo tendo comprimentos diferentes.
 */
export function TrianguloDosEstilos() {
  const vertices = [
    { arvore: "deus-da-espada", nome: "Deus da Espada", curto: "Espada", lema: "Velocidade e agressão", x: 100, y: 26, rx: 100, ry: 12 },
    { arvore: "deus-do-norte", nome: "Deus do Norte", curto: "Norte", lema: "Sobreviver por qualquer meio", x: 172, y: 148, rx: 172, ry: 168 },
    { arvore: "deus-da-agua-corpo", nome: "Deus da Água", curto: "Água", lema: "Defesa e contragolpe", x: 28, y: 148, rx: 28, ry: 168 },
  ];
  /* O lado `i` sai de `vertices[i]` e cai em `vertices[(i + 1) % 3]`. */
  const lados = ["M 108 46 L 166 132", "M 156 146 L 48 146", "M 36 132 L 92 46"];
  const CICLO = 7.2;
  return (
    <Quadro
      titulo="O Triângulo dos Estilos"
      nota="O ciclo fecha: cada estilo vence um e perde para o outro. Nenhum é melhor — o que existe é a mesa em que você caiu. Quem estudou uma das três é chamado de Espadachim; todos os outros, mesmo empunhando espada, são apenas Guerreiros."
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <svg
          viewBox="0 0 200 180"
          className="h-48 w-56 shrink-0 sm:h-56 sm:w-64"
          role="img"
          aria-label="Deus da Espada vence Deus do Norte, que vence Deus da Água, que vence Deus da Espada"
        >
          <defs>
            <marker id="ponta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-wine-500 dark:fill-wine-400" />
            </marker>
          </defs>

          {/* O anel: o ciclo não tem começo. Ele gira devagar e fica atrás de tudo. */}
          <circle
            className="triangulo-gira fill-none stroke-gold-500/20 [stroke-dasharray:3_9]"
            cx="100"
            cy="108"
            r="74"
            strokeWidth="1.5"
          />

          {/* Os três lados em repouso: a seta de quem vence quem. */}
          {lados.map((d) => (
            <path
              key={d}
              d={d}
              markerEnd="url(#ponta)"
              className="fill-none stroke-wine-500/45 dark:stroke-wine-400/35"
              strokeWidth="2"
            />
          ))}

          {/*
            O golpe. Um segundo traço por cima do mesmo lado, curto e brilhante,
            que corre do atacante até o alvo. `pathLength={100}` deixa o dash em
            porcentagem — ver o comentário do componente.
          */}
          {lados.map((d, i) => (
            <path
              key={`golpe-${d}`}
              d={d}
              pathLength={100}
              style={{ animationDelay: `${i * (CICLO / 3)}s`, animationDuration: `${CICLO}s` }}
              className="triangulo-golpe fill-none stroke-gold-400 [stroke-dasharray:13_87] dark:stroke-gold-300"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ))}

          {vertices.map((v, i) => (
            <g key={v.nome}>
              {/*
                O vértice `i` é atingido pelo lado `(i + 2) % 3` — o que sai de
                quem o vence. O delay é o fim daquele lado: quando o golpe chega.
              */}
              <circle
                cx={v.x}
                cy={v.y}
                r="15"
                style={{ animationDelay: `${(((i + 2) % 3) + 1) * (CICLO / 3)}s`, animationDuration: `${CICLO}s` }}
                className="triangulo-apanha fill-gold-400/40 stroke-gold-600/40"
                strokeWidth="1"
              />
              {/* O carimbo do estilo no vértice (2026-10-07): a mesma marca do catálogo da árvore. */}
              <g transform={`translate(${v.x - 14} ${v.y - 14}) rotate(${(i - 1) * 8} 14 14)`}>
                <Carimbo treeId={v.arvore} tamanho={28} />
              </g>
              <text
                x={v.rx}
                y={v.ry}
                textAnchor="middle"
                className="fill-parchment-800 text-[11px] font-bold dark:fill-parchment-100"
                style={{ fontFamily: "inherit" }}
              >
                {v.curto}
              </text>
            </g>
          ))}
        </svg>

        <ol className="w-full space-y-2">
          {vertices.map((v, i) => (
            <li
              key={v.nome}
              style={{ animationDelay: `${i * 90}ms` }}
              className="surge rounded-lg border-l-[3px] border-gold-500/70 bg-parchment-50/60 px-3 py-2 dark:bg-parchment-950/40"
            >
              <p className="font-display text-sm font-bold text-parchment-900 dark:text-parchment-50">
                {v.nome}
              </p>
              <p className="text-xs italic text-parchment-600 dark:text-parchment-400">{v.lema}</p>
              <p className="mt-1 text-xs font-semibold text-wine-700 dark:text-wine-300">
                <span aria-hidden>▸ </span>
                vence {vertices[(i + 1) % 3].nome}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Quadro>
  );
}

/**
 * AS ETAPAS DO TIRO PERFEITO — Cap. 3, §3.
 *
 * Elas acendem em sequência, em loop: a técnica É uma sequência, e o corte do
 * turno no meio dela é a coisa mais importante da regra. Ver a luz passar pela
 * quarta etapa DEPOIS do corte diz, sem uma palavra, que ela acontece no turno
 * seguinte.
 */
export function EtapasDoTiroPerfeito() {
  /*
   * `cd: false` na Solta — 0.1.69.
   *
   * A CD 12 valia pras QUATRO caixas quando o rótulo era fixo, e a quarta
   * estampava "ataque · CD 12", que é uma regra que não existe: a Solta é o
   * ataque normal, contra a CA do alvo. Um jogador que lesse só o diagrama
   * rolaria contra 12 e acertaria coisa que devia errar.
   */
  /*
   * A ordem mudou em 0.1.82: a Leitura passou pra frente dos Dedos. Você puxa,
   * lê pra onde o alvo vai, e só então coloca os dedos no vão que a leitura
   * revelou — a etapa que fura Cobertura é a correção final, não a primeira.
   */
  const etapas = [
    { n: "1", nome: "A Corda", teste: "Força", cd: true, da: "+2 degraus de Dado" },
    { n: "2", nome: "A Leitura", teste: "Intuição", cd: true, da: "alvo sem Agilidade na CA · +1 degrau" },
    { n: "3", nome: "Os Dedos", teste: "Agilidade", cd: true, da: "+1 Dado · ignora Cobertura" },
    { n: "4", nome: "A Solta", teste: "ataque normal", cd: false, da: "o disparo — também é uma jogada" },
  ];
  return (
    <Quadro
      titulo="O Tiro Perfeito, Ação por Ação — só quem tem Arquearia"
      demonstracao="tiro"
      etapas={etapas}
      nota="Quatro Ações num turno de três: ele sempre atravessa turnos. Cada etapa compra uma coisa diferente — potência, acerto contra quem se mexe, ângulo — e a quarta é o disparo, que pode errar como qualquer outro. A linha tracejada é onde o seu turno acaba, e é por isso que levar dano no meio cobra o teste de Espírito da Interrupção (CD 10 + o Bônus de Rank de quem te acertou). O talento Etapa Encurtada junta as duas primeiras e faz o tiro caber num turno."
      rolavel
    >
      <ol className="flex min-w-max items-stretch gap-2 pt-1">
        {etapas.map((e, i) => (
          <li key={e.n} style={{ animationDelay: `${i * 340}ms` }} className="flex items-stretch gap-2">
            <div className="etapa-acende flex w-32 flex-col rounded-xl border border-gold-500/40 bg-gradient-to-b from-gold-50/80 to-gold-100/30 p-2.5 dark:border-gold-700/50 dark:from-gold-950/40 dark:to-gold-950/10">
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-gold-700 dark:text-gold-300">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold-500/25 text-[9px]">
                  {e.n}
                </span>
                Ação
              </span>
              <span className="mt-1 font-display text-sm font-bold text-parchment-900 dark:text-parchment-50">
                {e.nome}
              </span>
              <span className="mt-0.5 text-[10px] text-parchment-600 dark:text-parchment-400">
                {e.teste}
                {e.cd && " · CD 12"}
              </span>
              <span className="mt-auto pt-1.5 text-[10px] font-semibold text-wine-700 dark:text-wine-300">
                {e.da}
              </span>
            </div>
            {i === 2 && (
              <span
                className="flex flex-col items-center justify-center gap-1 border-l-2 border-dashed border-wine-500/60 pl-2 text-[9px] font-black uppercase leading-tight tracking-wider text-wine-600 dark:text-wine-300"
                aria-label="fim do turno"
              >
                <span aria-hidden className="text-base leading-none">⟲</span>
                fim
                <br />
                do
                <br />
                turno
              </span>
            )}
          </li>
        ))}
      </ol>
    </Quadro>
  );
}

/**
 * O FIO DA VIDA — Cap. 4, §7.
 *
 * O coração pulsa enquanto as marcas não fecham. O diagrama existe porque a
 * regra tem um caminho de volta que a prosa esconde no meio do parágrafo —
 * **qualquer cura de aliado apaga todas as marcas** — e desenhado isso vira a
 * coisa mais visível da regra, que é o que ela deveria ser numa mesa com
 * alguém no chão.
 */
export function FioDaVida() {
  return (
    <Quadro
      titulo="O Fio da Vida"
      nota="A 0 PV você cai, não morre. Cada turno rola 1d20 + Vigor + metade do seu maior Bônus de Rank contra CD 8 + o Bônus de Rank de quem te derrubou. Falha crítica (1 natural) conta DUAS marcas. Chegar a duas marcas deixa uma Cicatriz."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          <span aria-hidden className="pulso-vida text-2xl text-rose-600 dark:text-rose-400">
            ♥
          </span>
          <ol className="flex flex-1 items-end gap-2" aria-label="marcas da morte">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex flex-1 flex-col items-center gap-1.5">
                <span
                  aria-hidden
                  style={{ animationDelay: `${n * 120}ms` }}
                  className={`surge h-3 w-full rounded-full ring-1 ${
                    n === 3
                      ? "bg-gradient-to-r from-rose-600 to-rose-700 ring-rose-500/50"
                      : "bg-rose-500/30 ring-rose-500/25"
                  }`}
                />
                <span
                  className={`text-[10px] font-bold ${
                    n === 3
                      ? "text-rose-700 dark:text-rose-400"
                      : "text-parchment-600 dark:text-parchment-400"
                  }`}
                >
                  {n === 3 ? "3 — morte" : `${n}ª marca`}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p className="surge rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 sm:w-64">
          <span aria-hidden className="mr-1 text-base">↺</span>
          Qualquer cura de aliado apaga <b>todas</b> as marcas e te levanta.
        </p>
      </div>
    </Quadro>
  );
}

/**
 * A ESCADA DE PATAMARES — Cap. 1, §3.
 *
 * Lê `RANKS` e `RANK_BONUS`, então nunca diverge do que a ficha calcula. O que
 * ela acrescenta à tabela é a **proporção**: o Bônus de Rank sobe de um em um,
 * mas os conhecimentos exigidos sobem de três em três. A distância entre os
 * patamares altos não é a mesma dos baixos, e essa é a coisa mais importante de
 * entender antes de escolher entre largura e profundidade.
 */
export function EscadaDePatamares() {
  return (
    <Quadro
      titulo="Os Sete Patamares"
      nota="O Bônus de Rank sobe de um em um; os conhecimentos exigidos sobem de três em três. É por isso que profundidade custa muito mais que largura — e entrega muito mais também."
      rolavel
    >
      <ol className="flex min-w-max items-end gap-2 pt-2">
        {RANKS.map((rank, i) => (
          <li key={rank} className="group flex w-[4.8rem] flex-col items-center gap-1.5">
            <span className="rounded-full bg-wine-500/12 px-1.5 py-0.5 text-[10px] font-black tabular text-wine-700 ring-1 ring-wine-500/25 dark:text-wine-300">
              +{RANK_BONUS[rank]}
            </span>
            <span
              aria-hidden
              style={{ height: `${22 + i * 13}px`, animationDelay: `${i * 70}ms` }}
              className="barra-cresce w-full rounded-t-md bg-gradient-to-t from-wine-700/30 via-wine-500/60 to-gold-400/80 ring-1 ring-gold-500/20 transition-transform duration-200 group-hover:-translate-y-0.5"
            />
            <span className="w-full text-center text-[10px] font-semibold leading-tight text-parchment-700 dark:text-parchment-300">
              {rank}
            </span>
          </li>
        ))}
      </ol>
    </Quadro>
  );
}

/**
 * A ORDEM DO DANO — Cap. 4, §6.
 *
 * O primeiro diagrama que DEMONSTRA em vez de descrever (2026-09-23): ele roda
 * o exemplo do livro golpe a golpe, em vez de desenhar a estrutura da regra.
 *
 * A regra diz "reduções fixas entram antes; depois Resistência". Dita assim,
 * ela parece detalhe de ordem — e não é: invertida, o mesmo golpe de 17 vira 5
 * em vez de 7, e a diferença cresce com o patamar. O que faz a ordem ficar na
 * cabeça é ver o número sendo cortado duas vezes, e nesta sequência.
 *
 * Os números são os mesmos do exemplo escrito na seção, de propósito: quem
 * leu o parágrafo reconhece a conta, e quem pulou direto pro desenho já chega
 * ao texto sabendo o resultado.
 */
export function OrdemDoDano() {
  const passos = [
    { valor: "17", rotulo: "O golpe", detalhe: "espada mundana, dano cheio" },
    { valor: "−2", rotulo: "Redução fixa", detalhe: "Defender: Vigor 0 + metade do Bônus de Rank +3" },
    { valor: "15", rotulo: "Sobrou", detalhe: "é sobre ISTO que a Resistência age" },
    { valor: "÷2", rotulo: "Resistência", detalhe: "Casco do Escudeiro: dano físico mundano" },
    { valor: "7", rotulo: "Chega", detalhe: "o que sai dos PV dele", destaque: true },
  ];

  return (
    <Quadro
      titulo="A ordem do dano"
      nota={
        <>
          A ordem não é detalhe: invertida — Resistência primeiro, redução depois — o mesmo golpe de 17
          chegaria como <b>6</b>, e a diferença só cresce com o patamar. Reduções fixas (Touki, Defender)
          sempre <b>antes</b>; Resistência, Imunidade e Vulnerável <b>depois</b>.
        </>
      }
      rolavel
    >
      <ol className="flex min-w-[420px] items-stretch gap-1.5">
        {passos.map((p, i) => (
          <li
            key={p.rotulo}
            style={{ animationDelay: `${i * 260}ms` }}
            className="surge flex flex-1 flex-col items-center"
          >
            <div
              className={`flex w-full flex-1 flex-col items-center justify-center rounded-xl border p-2 text-center ${
                p.destaque
                  ? "border-gold-500/60 bg-gradient-to-b from-gold-100/80 to-gold-100/20 dark:border-gold-500/50 dark:from-gold-950/50 dark:to-gold-950/10"
                  : "border-parchment-300 bg-parchment-50/70 dark:border-parchment-700 dark:bg-parchment-900/50"
              }`}
            >
              <span
                className={`font-display text-xl font-black tabular-nums ${
                  p.destaque ? "text-gold-700 dark:text-gold-300" : "text-parchment-800 dark:text-parchment-200"
                }`}
              >
                {p.valor}
              </span>
              <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-wine-700 dark:text-wine-300">
                {p.rotulo}
              </span>
              <span className="mt-0.5 text-[10px] leading-tight text-parchment-600 dark:text-parchment-400">
                {p.detalhe}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Quadro>
  );
}

/**
 * O QUEBRANTADO EMPILHANDO — Cap. 4 (glossário) e Cap. 3 (Lutador).
 *
 * A mecânica de uma árvore inteira, e a mais difícil de enxergar de cabeça:
 * cada acúmulo tira 1 da CA E 1 do dano de TODOS os ataques do alvo, até o
 * teto do Bônus de Rank de quem aplicou. Em prosa isso é uma frase com três
 * números que se multiplicam; aqui é uma coluna que desce.
 *
 * O desenho mostra o teto de propósito: o Lutador não empilha para sempre, e
 * saber onde a conta para é o que impede a mesa de achar que a árvore desmonta
 * qualquer coisa dado tempo suficiente.
 */
export function QuebrantadoEmpilha() {
  const CA_INICIAL = 15;
  const acumulos = Array.from({ length: RANK_BONUS.Avançado + 1 }, (_, n) => n);

  return (
    <Quadro
      titulo="Quebrantado, acúmulo a acúmulo"
      demonstracao="quebrantado"
      caInicial={CA_INICIAL}
      nota={
        <>
          O teto é o <b>Bônus de Rank de quem aplicou</b> — aqui, um Veterano (+3). Não é ferimento: magia
          de Cura não remove, e ele só sai num Descanso Curto ou quando o combate acaba. Cada acúmulo cobra
          duas vezes: a CA que ele perde e o dano que ele deixa de causar.
        </>
      }
      rolavel
    >
      <div className="flex min-w-[380px] items-end gap-2">
        {acumulos.map((n, i) => (
          <div key={n} className="group flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
              {n === 0 ? "Intacto" : `${n}º acúmulo`}
            </span>
            <div
              style={{ height: `${(CA_INICIAL - n) * 7}px`, animationDelay: `${i * 140}ms` }}
              className={`barra-cresce w-full rounded-t-md ring-1 transition-transform duration-200 group-hover:-translate-y-0.5 ${
                n === 0
                  ? "bg-gradient-to-t from-parchment-400/40 to-parchment-300/70 ring-parchment-400/30"
                  : "bg-gradient-to-t from-wine-800/50 via-wine-600/60 to-wine-400/70 ring-wine-500/30"
              }`}
            />
            <span className="font-display text-sm font-black tabular-nums text-parchment-800 dark:text-parchment-100">
              CA {CA_INICIAL - n}
            </span>
            <span className="text-[10px] tabular-nums text-wine-700 dark:text-wine-300">
              {n === 0 ? "dano cheio" : `dano −${n}`}
            </span>
          </div>
        ))}
        <div className="flex flex-1 flex-col items-center justify-end gap-1.5 self-stretch">
          <span className="text-[10px] font-bold uppercase tracking-wide text-gold-700 dark:text-gold-400">
            4º acúmulo
          </span>
          <div className="surge flex w-full flex-1 items-center justify-center rounded-xl border-2 border-dashed border-gold-500/50 p-1 text-center">
            <span className="text-[10px] leading-tight text-parchment-600 dark:text-parchment-400">
              não entra: o teto é o Bônus de Rank
            </span>
          </div>
        </div>
      </div>
    </Quadro>
  );
}

/**
 * O TURNO — Cap. 4.
 *
 * As três Ações acendem em sequência, e a Reação fica de fora do ritmo — ela é
 * tracejada e não entra na fila. É a parte que a mesa esquece: a Reação não sai
 * das três Ações, é uma quarta coisa, e acontece no turno DOS OUTROS.
 */
export function AnatomiaDoTurno() {
  return (
    <Quadro
      titulo="Um Turno"
      demonstracao="turno"
      nota="A Reação NÃO sai das suas três Ações — ela é uma quarta coisa, e acontece no turno dos outros. Ela volta no começo de cada rodada."
    >
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <ol className="flex flex-1 gap-2">
          {ACOES_DO_TURNO.map((n) => (
            <li
              key={n}
              style={{ animationDelay: `${(n - 1) * 380}ms` }}
              className="etapa-acende flex-1 rounded-xl border border-wine-400/40 bg-gradient-to-b from-wine-50/70 to-wine-100/20 p-2.5 text-center dark:border-wine-700/50 dark:from-wine-950/40 dark:to-wine-950/10"
            >
              <span className="block text-[10px] font-black uppercase tracking-wide text-wine-700 dark:text-wine-300">
                Ação {n}
              </span>
              <span className="mt-1 block text-[10px] text-parchment-600 dark:text-parchment-400">
                atacar, conjurar, mover
              </span>
            </li>
          ))}
        </ol>
        <div className="surge rounded-xl border-2 border-dashed border-gold-500/50 bg-gold-50/40 p-2.5 text-center dark:bg-gold-950/20 sm:w-48">
          <span className="block text-[10px] font-black uppercase tracking-wide text-gold-700 dark:text-gold-300">
            1 Reação
          </span>
          <span className="mt-1 block text-[10px] text-parchment-600 dark:text-parchment-400">
            no turno dos outros
          </span>
        </div>
      </div>
    </Quadro>
  );
}

/**
 * UM TURNO DE TOUKI — Cap. 3, pilar do Corpo, §2 (2026-10-08).
 *
 * A seção do Touki era só prosa e tabela, e a mesa erra sempre as mesmas três
 * coisas: de onde vem a reserva, que o Manto não custa nada, e que o Descanso
 * Curto devolve TUDO (o único recurso que volta inteiro). O desenho é uma
 * reserva de bolinhas que se apagam, uma por PT, com o Manto de fora delas.
 */
export function UmTurnoDeTouki() {
  // Um guerreiro Avançado: Vigor 2, Espírito 1 e três patamares no Corpo.
  const VIGOR = 2;
  const ESPIRITO = 1;
  const PATAMARES = 3;
  const reserva = VIGOR + ESPIRITO + PATAMARES;
  const gastos = [
    { quando: "no seu turno", m: manobraDeTouki("Touki Concentrado"), cor: "border-2 border-wine-500 bg-wine-500/15 text-wine-700 dark:text-wine-300" },
    { quando: "no seu turno", m: manobraDeTouki("Golpe Estendido"), cor: "border-2 border-wine-700 bg-wine-700/15 text-wine-700 dark:text-wine-300" },
    { quando: "no turno do inimigo", m: manobraDeTouki("Touki Endurecido"), cor: "border-2 border-gold-600 bg-gold-500/15 text-gold-700 dark:text-gold-300" },
  ];
  const dono: (number | null)[] = [];
  gastos.forEach((g, i) => dono.push(...Array<number>(g.m.pt).fill(i)));
  while (dono.length < reserva) dono.push(null);
  const sobra = dono.filter((d) => d === null).length;

  return (
    <Quadro
      titulo="Um turno de Touki"
      nota={
        <>
          O PT é o único recurso que volta <b>inteiro</b> num Descanso Curto (PV, PM e PP voltam 25%). Guardar
          Touki pro fim do dia é jogar fora: gaste nas lutas de antes do descanso. E o Manto não sai das
          bolinhas, nem quando elas acabam.
        </>
      }
    >
      <p className="text-[11px] text-parchment-700 dark:text-parchment-300">
        Reserva de um Avançado: Vigor {VIGOR} + Espírito {ESPIRITO} + {PATAMARES} patamares no Corpo ={" "}
        <b className="text-parchment-900 dark:text-parchment-50">{reserva} PT</b>
      </p>
      <ol className="mt-2 flex flex-wrap gap-1.5" aria-label={`${reserva} PT, ${reserva - sobra} gastos`}>
        {dono.map((d, i) => (
          <li
            key={i}
            style={{ animationDelay: `${i * 160}ms` }}
            className={`etapa-acende flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
              d === null ? "bg-gold-400/80 text-parchment-900 ring-2 ring-gold-500/40" : gastos[d].cor
            }`}
          >
            {d === null ? "" : d + 1}
          </li>
        ))}
      </ol>
      <ul className="mt-3 space-y-1">
        {gastos.map((g, i) => (
          <li key={g.m.nome} className="flex items-baseline gap-2 text-[11px] text-parchment-700 dark:text-parchment-300">
            <span className={`flex h-4 w-4 flex-none items-center justify-center rounded-full text-[9px] font-black ${g.cor}`}>
              {i + 1}
            </span>
            <span>
              <b className="text-parchment-900 dark:text-parchment-50">{g.m.nome}</b> · {g.m.pt} PT · {g.m.acao}, {g.quando}
            </span>
          </li>
        ))}
        <li className="flex items-baseline gap-2 text-[11px] text-parchment-700 dark:text-parchment-300">
          <span className="h-4 w-4 flex-none rounded-full bg-gold-400/80" />
          <span>
            Sobram <b className="text-parchment-900 dark:text-parchment-50">{sobra} PT</b> pra próxima rodada.
          </span>
        </li>
      </ul>
      <div className="@container mt-3">
        <div className="grid gap-2 @md:grid-cols-2">
          <div className="surge rounded-xl border-2 border-dashed border-gold-500/50 p-2.5">
            <span className="block text-[10px] font-black uppercase tracking-wide text-gold-700 dark:text-gold-300">
              Manto de Touki · 0 PT
            </span>
            <span className="mt-1 block text-[11px] leading-snug text-parchment-700 dark:text-parchment-300">
              Vestido pelo Rank, desde o Avançado: +CA e Redução contra projéteis, mesmo com a reserva em 0.
            </span>
          </div>
          <div className="surge rounded-xl border border-wine-400/40 bg-wine-50/40 p-2.5 dark:bg-wine-950/20">
            <span className="block text-[10px] font-black uppercase tracking-wide text-wine-700 dark:text-wine-300">
              ⟲ Descanso Curto
            </span>
            <span className="mt-1 block text-[11px] leading-snug text-parchment-700 dark:text-parchment-300">
              As {reserva} bolinhas voltam todas. Dois Descansos Curtos entre dois Longos (Cap. 4, §7).
            </span>
          </div>
        </div>
      </div>
    </Quadro>
  );
}

/**
 * PARA ONDE VAI UM PP — Cap. 3, pilar da Utilidade, §2 (2026-10-08).
 *
 * O PP tem duas saídas, e a segunda (o fato livre) é a que a mesa mais briga.
 * As travas estão em três lugares do texto (as cinco condições, as quatro
 * travas, o limite por sessão); aqui elas viram portas em fila, na ordem em
 * que a mesa pergunta.
 */
export function ParaOndeVaiUmPP() {
  const portas = [
    { nome: "Domínio", diz: "o fato toca o que a sua árvore toca: coisas e lugares, pessoas e reputação, ou tempo e logística." },
    { nome: "Escopo", diz: "e alcança até onde a sua Maestria mais alta naquela árvore alcança." },
    { nome: "Pretérito", diz: "“já tinha acontecido”, fora de cena: nunca contradiz o que a mesa viu." },
    { nome: "O preço", diz: "1 PP; 2 PP se resolve o obstáculo central da cena — e o Mestre diz isso antes, com você podendo desistir." },
  ];
  return (
    <Quadro
      titulo="Para onde vai um PP"
      nota={
        <>
          Passou pelas quatro portas, o fato <b>vale</b>: o Mestre não pode negar. Ele pode anexar uma
          complicação, <i>ao lado</i> do fato e nunca o desfazendo. Fatos livres por sessão = o seu Bônus de Rank
          naquela árvore; as Preparações do menu não contam nesse limite.
        </>
      }
    >
      <div className="@container">
        <div className="grid gap-2 @md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="etapa-acende rounded-xl border border-gold-500/40 bg-gradient-to-b from-gold-50/80 to-gold-100/30 p-2.5 dark:border-gold-700/50 dark:from-gold-950/40 dark:to-gold-950/10">
            <span className="block text-[10px] font-black uppercase tracking-wide text-gold-700 dark:text-gold-300">
              Saída 1 · o menu
            </span>
            <span className="mt-1 block font-display text-sm font-bold text-parchment-900 dark:text-parchment-50">
              Uma Preparação
            </span>
            <span className="mt-1 block text-[11px] leading-snug text-parchment-700 dark:text-parchment-300">
              Custo e efeito escritos na tabela da árvore. Sem negociar e sem porta nenhuma: é a forma de todo dia.
            </span>
          </div>
          <div className="rounded-xl border border-wine-400/40 p-2.5 dark:border-wine-700/50">
            <span className="block text-[10px] font-black uppercase tracking-wide text-wine-700 dark:text-wine-300">
              Saída 2 · o fato livre
            </span>
            <ol className="mt-1.5 space-y-1.5">
              {portas.map((p, i) => (
                <li
                  key={p.nome}
                  style={{ animationDelay: `${200 + i * 260}ms` }}
                  className="etapa-acende flex gap-2 text-[11px] leading-snug text-parchment-700 dark:text-parchment-300"
                >
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-md border border-wine-500/50 text-[9px] font-black text-wine-700 dark:text-wine-300">
                    {i + 1}
                  </span>
                  <span>
                    <b className="text-parchment-900 dark:text-parchment-50">{p.nome}:</b> {p.diz}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Quadro>
  );
}

/**
 * AS TRÊS FAIXAS — Cap. 3, pilar da Utilidade, §4 (2026-10-08).
 *
 * Era uma tabela de cinco linhas; virou três raias com uma parede entre elas,
 * porque a regra É a parede: nenhuma habilidade de uma raia entra na outra.
 * O texto inteiro da tabela continua aqui (o diagrama a substitui, não repete).
 */
export function AsTresFaixas() {
  const raias = [
    { arvore: "furtividade-e-armadilhas", nome: "Ladino", atributo: "Agilidade", dominio: "Coisas e lugares.", fato: "“Essa fechadura eu já limei.”", faixa: "Dano Furtivo", pergunta: "Como eu entro?" },
    { arvore: "bardo-e-interacao", nome: "Bardo", atributo: "Espírito", dominio: "Pessoas e reputação.", fato: "“O capitão da guarda me deve um favor.”", faixa: "Estado emocional", pergunta: "Quem eu convenço?" },
    { arvore: "navegacao-e-lideranca", nome: "Tático", atributo: "Intelecto", dominio: "Tempo e logística.", fato: "“O suprimento deles acabou anteontem.”", faixa: "Economia de ação", pergunta: "Onde e quando isso acontece?" },
  ];
  return (
    <Quadro
      titulo="As Três Faixas"
      nota="A parede vale só entre Ladino, Bardo e Tático: nenhum talento dá Dano Furtivo a um Bardo, nem deixa um Ladino conceder uma Ação. Árvores do Corpo e da Magia cruzam essas linhas livremente."
    >
      <div className="@container">
        <ol className="grid @md:grid-cols-3">
          {raias.map((r, i) => (
            <li
              key={r.nome}
              style={{ animationDelay: `${i * 260}ms` }}
              className={`etapa-acende flex flex-col gap-1 p-2.5 ${
                i > 0 ? "border-t-4 border-double border-wine-500/60 @md:border-t-0 @md:border-l-4" : ""
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Carimbo treeId={r.arvore} tamanho={26} className="-rotate-6" />
                <span className="font-display text-sm font-bold text-parchment-900 dark:text-parchment-50">{r.nome}</span>
                <span className="text-[10px] text-parchment-600 dark:text-parchment-400">· {r.atributo}</span>
              </span>
              <span className="font-display text-[13px] italic text-wine-700 dark:text-wine-300">{r.pergunta}</span>
              <span className="text-[11px] leading-snug text-parchment-700 dark:text-parchment-300">
                <b className="text-parchment-900 dark:text-parchment-50">Domínio:</b> {r.dominio}
              </span>
              <span className="text-[11px] italic leading-snug text-parchment-600 dark:text-parchment-400">{r.fato}</span>
              <span className="mt-auto rounded-md bg-gold-500/20 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-gold-800 dark:text-gold-200">
                Faixa: {r.faixa}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Quadro>
  );
}
