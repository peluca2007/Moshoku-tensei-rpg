import { WEAPON_DIE_LADDER } from "@/lib/weaponDie";
import { RANK_BONUS, RANKS } from "@/lib/types";

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
}: {
  titulo: string;
  nota?: React.ReactNode;
  children: React.ReactNode;
  rolavel?: boolean;
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
      <div className={rolavel ? "overflow-x-auto pb-1" : ""}>{children}</div>
      {nota && (
        <p className="surge mt-3 text-xs leading-relaxed text-parchment-600 dark:text-parchment-400">
          {nota}
        </p>
      )}
    </figure>
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
    { nome: "Deus da Espada", curto: "Espada", lema: "Velocidade e agressão", x: 100, y: 26, rx: 100, ry: 12 },
    { nome: "Deus do Norte", curto: "Norte", lema: "Sobreviver por qualquer meio", x: 172, y: 148, rx: 172, ry: 168 },
    { nome: "Deus da Água", curto: "Água", lema: "Defesa e contragolpe", x: 28, y: 148, rx: 28, ry: 168 },
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
                r="7.5"
                style={{ animationDelay: `${(((i + 2) % 3) + 1) * (CICLO / 3)}s`, animationDuration: `${CICLO}s` }}
                className="triangulo-apanha fill-gold-400 stroke-gold-600/60"
                strokeWidth="1.5"
              />
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
  const etapas = [
    { n: "1", nome: "A Corda", teste: "Força", cd: true, da: "+2 degraus no dado" },
    { n: "2", nome: "Os Dedos", teste: "Agilidade", cd: true, da: "+1 degrau, ignora Cobertura" },
    { n: "3", nome: "A Leitura", teste: "Intuição", cd: true, da: "alvo sem Agilidade na CA" },
    { n: "4", nome: "A Solta", teste: "ataque normal", cd: false, da: "o disparo" },
  ];
  return (
    <Quadro
      titulo="O Tiro Perfeito, Ação por Ação — só quem tem Arquearia"
      nota="Quatro Ações num turno de três: ele sempre atravessa turnos. A linha tracejada é onde o seu turno acaba — e é por isso que levar dano no meio cobra teste de Concentração. O talento Etapa Encurtada junta as duas primeiras e faz o tiro caber num turno."
      rolavel
    >
      <ol className="acende-em-sequencia flex min-w-max items-stretch gap-2 pt-1">
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
      nota="A 0 PV você cai, não morre. Cada turno rola 1d20 + Vigor contra CD 8 + o Bônus de Rank de quem te derrubou. Falha crítica (1 natural) conta DUAS marcas. Duas marcas deixam Cicatriz permanente."
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
      nota="A Reação NÃO sai das suas três Ações — ela é uma quarta coisa, e acontece no turno dos outros. Ela volta no começo de cada rodada."
    >
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <ol className="acende-em-sequencia flex flex-1 gap-2">
          {[1, 2, 3].map((n) => (
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
