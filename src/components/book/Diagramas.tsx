import { WEAPON_DIE_LADDER } from "@/lib/weaponDie";
import { RANK_BONUS, RANKS } from "@/lib/types";

/**
 * Os diagramas do livro, em CSS puro — 0.1.63.
 *
 * ## Por que CSS e não imagem
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
 * O que NÃO cabe aqui é ilustração — o golpe do Deus da Espada, a aura do
 * Touki, o círculo de invocação. Isso é arte, e arte é arquivo.
 *
 * ## Mobile
 *
 * Todos rolam de lado dentro do próprio contêiner quando não cabem, em vez de
 * empurrar a página: a regra do projeto é que o corpo nunca role
 * horizontalmente, e `check:mobile` cobra isso nas 16 rotas.
 */

/** A moldura comum: título, corpo e a nota de rodapé que explica o desenho. */
function Quadro({
  titulo,
  nota,
  children,
  rolavel = false,
}: {
  titulo: string;
  nota?: string;
  children: React.ReactNode;
  rolavel?: boolean;
}) {
  return (
    <figure className="my-4 rounded-xl border border-parchment-300 bg-parchment-100/50 p-4 dark:border-parchment-800 dark:bg-parchment-900/40">
      <figcaption className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-gold-700 dark:text-gold-300">
        {titulo}
      </figcaption>
      <div className={rolavel ? "overflow-x-auto pb-1" : ""}>{children}</div>
      {nota && (
        <p className="mt-3 text-xs leading-relaxed text-parchment-600 dark:text-parchment-400">{nota}</p>
      )}
    </figure>
  );
}

/**
 * A ESCADA DE DADOS — Cap. 3, §1.
 *
 * Desenhada de `WEAPON_DIE_LADDER`, que é a mesma constante que o motor usa pra
 * escalar de verdade. Os quatro primeiros degraus ganham destaque porque são
 * onde toda arma do catálogo começa: nenhuma arma mundana nasce acima do d10.
 */
export function EscadaDeDados() {
  return (
    <Quadro
      titulo="A Escada de Dados"
      nota="Cada patamar de uma árvore do Corpo sobe um ou mais degraus. Os quatro primeiros são onde as armas do livro começam — o resto só se alcança subindo de Rank. O 5d12 é o último: degrau além dele vira +2 de dano fixo."
      rolavel
    >
      <ol className="flex min-w-max items-end gap-1">
        {WEAPON_DIE_LADDER.map((die, i) => {
          const inicial = i < 4;
          // A altura cresce com o degrau: a escada tem que PARECER uma escada,
          // senão ela é só uma fila de caixas com nomes diferentes.
          const altura = 26 + i * 4;
          return (
            <li key={die} className="flex flex-col items-center gap-1">
              <span
                aria-hidden
                style={{ height: `${altura}px` }}
                className={`w-9 rounded-t-sm ${
                  inicial
                    ? "bg-gold-500/70 dark:bg-gold-500/60"
                    : "bg-wine-500/40 dark:bg-wine-400/30"
                }`}
              />
              <span
                className={`w-9 rounded-sm py-0.5 text-center text-[10px] font-bold tabular ${
                  inicial
                    ? "bg-gold-500/20 text-gold-800 dark:text-gold-200"
                    : "bg-wine-500/10 text-wine-700 dark:text-wine-300"
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
 * Três caixas e três setas. A forma importa: quem vence quem só é legível de
 * relance se o ciclo fechar, e uma tabela de três linhas não fecha ciclo
 * nenhum — ela obriga o leitor a montar o círculo na cabeça.
 */
export function TrianguloDosEstilos() {
  const estilos = [
    { nome: "Deus da Espada", lema: "Velocidade e agressão; matar em um golpe", vence: "Deus do Norte", perde: "Deus da Água" },
    { nome: "Deus do Norte", lema: "Sobreviver e vencer por qualquer meio", vence: "Deus da Água", perde: "Deus da Espada" },
    { nome: "Deus da Água", lema: "Defesa e contragolpe", vence: "Deus da Espada", perde: "Deus do Norte" },
  ];
  return (
    <Quadro
      titulo="O Triângulo dos Estilos"
      nota="O ciclo fecha: cada estilo vence um e perde para o outro. Nenhum é melhor — o que existe é a mesa em que você caiu."
    >
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {estilos.map((e) => (
          <li
            key={e.nome}
            className="rounded-lg border border-wine-300/60 bg-wine-50/50 p-3 dark:border-wine-800 dark:bg-wine-950/30"
          >
            <p className="font-display text-sm font-bold text-wine-800 dark:text-wine-200">{e.nome}</p>
            <p className="mt-0.5 text-xs italic text-parchment-600 dark:text-parchment-400">{e.lema}</p>
            <p className="mt-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <span aria-hidden>▲ </span>
              vence {e.vence}
            </p>
            <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">
              <span aria-hidden>▼ </span>
              perde para {e.perde}
            </p>
          </li>
        ))}
      </ul>
    </Quadro>
  );
}

/**
 * AS ETAPAS DO TIRO PERFEITO — Cap. 3, §3.
 *
 * A tabela que já existe diz o que cada etapa concede; o que ela não mostra é
 * que elas são uma SEQUÊNCIA que atravessa turnos. Aqui a fila de Ações é o
 * desenho, e o turno de três Ações aparece como corte.
 */
export function EtapasDoTiroPerfeito() {
  const etapas = [
    { n: "1", nome: "A Corda", teste: "Força" },
    { n: "2", nome: "Os Dedos", teste: "Agilidade" },
    { n: "3", nome: "A Leitura", teste: "Intuição" },
    { n: "4", nome: "A Solta", teste: "ataque" },
  ];
  return (
    <Quadro
      titulo="O Tiro Perfeito, Ação por Ação"
      nota="Quatro Ações num turno de três: ele sempre atravessa turnos. A linha tracejada é onde o seu turno acaba — e é por isso que levar dano no meio cobra teste de Concentração. O talento Etapa Encurtada junta as duas primeiras e faz o tiro caber num turno."
      rolavel
    >
      <ol className="flex min-w-max items-stretch gap-1.5">
        {etapas.map((e, i) => (
          <li key={e.n} className="flex items-stretch gap-1.5">
            <div className="flex w-28 flex-col rounded-lg border border-gold-400/50 bg-gold-50/60 p-2 dark:border-gold-700 dark:bg-gold-950/30">
              <span className="text-[10px] font-bold text-gold-700 dark:text-gold-300">
                Ação {e.n}
              </span>
              <span className="mt-0.5 text-xs font-bold text-parchment-900 dark:text-parchment-50">
                {e.nome}
              </span>
              <span className="mt-auto pt-1 text-[10px] text-parchment-600 dark:text-parchment-400">
                {e.teste} · CD 12
              </span>
            </div>
            {/* O corte do turno cai DEPOIS da terceira Ação. */}
            {i === 2 && (
              <span
                className="flex flex-col items-center justify-center border-l-2 border-dashed border-wine-500/60 pl-1.5 text-[9px] font-bold uppercase leading-tight tracking-wide text-wine-600 dark:text-wine-300"
                aria-label="fim do turno"
              >
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
 * Três marcas e você morre. O diagrama existe porque a regra tem um caminho de
 * volta que a prosa esconde no meio do parágrafo: **qualquer cura de aliado
 * apaga todas as marcas**. Desenhado, isso vira a coisa mais visível da regra,
 * que é o que ela deveria ser numa mesa com alguém no chão.
 */
export function FioDaVida() {
  return (
    <Quadro
      titulo="O Fio da Vida"
      nota="A 0 PV você cai, não morre. Cada turno rola 1d20 + Vigor contra CD 8 + o Bônus de Rank de quem te derrubou. Falha crítica (1 natural) conta DUAS marcas. Duas marcas deixam Cicatriz permanente."
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ol className="flex flex-1 items-center gap-1.5" aria-label="marcas da morte">
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex flex-1 flex-col items-center gap-1">
              <span
                aria-hidden
                className={`h-2.5 w-full rounded-full ${
                  n === 3 ? "bg-rose-600/80" : "bg-rose-500/35 dark:bg-rose-500/30"
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
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 sm:w-64">
          <span aria-hidden>↺ </span>
          Qualquer cura de aliado apaga <b>todas</b> as marcas e te levanta.
        </p>
      </div>
    </Quadro>
  );
}

/**
 * A ESCADA DE PATAMARES — Cap. 1, §3.
 *
 * Lê `RANKS` e `RANK_BONUS`, então ela nunca diverge do que a ficha calcula. O
 * que o diagrama acrescenta à tabela é a proporção: o Bônus de Rank sobe de um
 * em um, mas o número de conhecimentos exigidos sobe de três em três — a
 * distância entre os patamares altos não é a mesma dos baixos, e isso é a coisa
 * mais importante de entender antes de escolher entre largura e profundidade.
 */
export function EscadaDePatamares() {
  return (
    <Quadro
      titulo="Os Sete Patamares"
      nota="O Bônus de Rank sobe de um em um; os conhecimentos exigidos sobem de três em três. É por isso que profundidade custa muito mais que largura — e entrega muito mais também."
      rolavel
    >
      <ol className="flex min-w-max items-end gap-1.5">
        {RANKS.map((rank, i) => (
          <li key={rank} className="flex w-[4.6rem] flex-col items-center gap-1">
            <span className="text-[10px] font-bold tabular text-wine-700 dark:text-wine-300">
              +{RANK_BONUS[rank]}
            </span>
            <span
              aria-hidden
              style={{ height: `${18 + i * 11}px` }}
              className="w-full rounded-t-sm bg-gradient-to-t from-wine-500/25 to-wine-500/60 dark:from-wine-400/20 dark:to-wine-400/50"
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
 * Três Ações e uma Reação. O diagrama existe porque a Reação é a parte que a
 * mesa esquece: ela não sai das três Ações, é uma quarta coisa, e acontece no
 * turno DOS OUTROS.
 */
export function AnatomiaDoTurno() {
  return (
    <Quadro
      titulo="Um Turno"
      nota="A Reação NÃO sai das suas três Ações — ela é uma quarta coisa, e acontece no turno dos outros. Ela volta no começo de cada rodada."
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <ol className="flex flex-1 gap-1.5">
          {[1, 2, 3].map((n) => (
            <li
              key={n}
              className="flex-1 rounded-lg border border-wine-300/60 bg-wine-50/50 p-2 text-center dark:border-wine-800 dark:bg-wine-950/30"
            >
              <span className="block text-[10px] font-bold uppercase tracking-wide text-wine-700 dark:text-wine-300">
                Ação {n}
              </span>
              <span className="mt-0.5 block text-[10px] text-parchment-600 dark:text-parchment-400">
                atacar, conjurar, mover
              </span>
            </li>
          ))}
        </ol>
        <div className="rounded-lg border border-dashed border-gold-500/60 bg-gold-50/50 p-2 text-center dark:bg-gold-950/25 sm:w-44">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-gold-700 dark:text-gold-300">
            1 Reação
          </span>
          <span className="mt-0.5 block text-[10px] text-parchment-600 dark:text-parchment-400">
            no turno dos outros
          </span>
        </div>
      </div>
    </Quadro>
  );
}
