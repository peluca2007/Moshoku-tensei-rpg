import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * O registro de sessão — o site contando o que a mesa mostrou (0.1.31).
 *
 * ## Por que ele existe
 *
 * Metade das pendências de balanceamento do projeto pede uma contagem que só
 * sai no papel. A do Vendaval é literal: *"conte os ataques corpo a corpo que
 * ACERTARAM o Vendaval e compare com o outro da linha de frente"*. Ninguém faz
 * isso com lápis no meio de uma sessão — e é por isso que essas pendências não
 * fecham.
 *
 * ## A regra que o mantém barato: ele não pede digitação
 *
 * Nada aqui é preenchido à mão. Ele pega carona no que JÁ acontece:
 *
 * - toda rolagem passa pelo rolador de dados, que já sabe o rótulo e o total;
 * - o tracker de iniciativa já sabe de quem é a vez, então a rolagem sai
 *   assinada sem ninguém dizer quem rolou;
 * - o Modo Mesa já mexe nos PV com botões, e um passo negativo É o dano levado.
 *
 * Um registro que exigisse um formulário depois de cada golpe seria abandonado
 * na primeira sessão, e um registro abandonado é pior que nenhum: ele parece
 * dado.
 *
 * ## Ele começa DESLIGADO
 *
 * Gravar por padrão transformaria toda partida numa coleta silenciosa, e o site
 * inteiro é construído em cima de dado que não sai do aparelho. Quem quer medir
 * liga; enquanto está desligado, nada é gravado.
 */

export type TipoDeEvento = "rolagem" | "dano" | "cura";

export interface EventoDeSessao {
  id: string;
  quando: number;
  tipo: TipoDeEvento;
  /** O que aconteceu: o rótulo da rolagem, ou o nome de quem levou o dano. */
  rotulo: string;
  /** Total da rolagem, ou o tamanho do golpe (sempre positivo). */
  valor: number;
  critico?: "sucesso" | "falha" | null;
  /**
   * De quem era a vez quando isto aconteceu, segundo o tracker de iniciativa.
   * Ausente quando não há combate rolando — o registro continua útil, só não
   * consegue assinar a linha.
   */
  ator?: string;
}

interface SessionLogState {
  /** Gravando ou não. Começa em `false`, e a decisão é sempre da mesa. */
  gravando: boolean;
  eventos: EventoDeSessao[];
  alternarGravacao: () => void;
  registrar: (evento: Omit<EventoDeSessao, "id" | "quando">) => void;
  limpar: () => void;
}

/**
 * Teto de eventos guardados.
 *
 * Uma sessão de quatro horas com cinco jogadores passa longe disto; o teto
 * existe pro caso de o registro ficar ligado por semanas sem ninguém limpar,
 * porque o `localStorage` tem uns 5 MB e uma ficha salva vale mais que um
 * histórico antigo. O corte é pelo FIM da lista: o mais velho sai primeiro.
 */
const TETO = 2000;

function novoId() {
  return `ev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useSessionLog = create<SessionLogState>()(
  persist(
    (set, get) => ({
      gravando: false,
      eventos: [],
      alternarGravacao: () => set({ gravando: !get().gravando }),
      registrar: (evento) => {
        if (!get().gravando) return;
        set((state) => ({
          eventos: [...state.eventos, { ...evento, id: novoId(), quando: Date.now() }].slice(-TETO),
        }));
      },
      limpar: () => set({ eventos: [] }),
    }),
    {
      name: "mushoku-tensei-sessao",
      skipHydration: true,
      version: 1,
    }
  )
);

/* ------------------------------------------------------------------------- */
/* As contas — puras, pra que o que a tela afirma seja testável               */
/* ------------------------------------------------------------------------- */

export interface ResumoDaSessao {
  rolagens: number;
  criticos: number;
  falhasCriticas: number;
  /** Dano levado por personagem, do maior pro menor. É o que responde a pergunta do Vendaval. */
  danoPorPersonagem: { nome: string; total: number; golpes: number }[];
  /** O que mais se repetiu na mesa, do mais usado pro menos. */
  usoPorRotulo: { rotulo: string; vezes: number }[];
  /** Quem mais rolou dado, segundo o tracker de iniciativa. */
  rolagensPorAtor: { ator: string; vezes: number }[];
}

function contar<T extends string>(pares: T[]): { chave: T; vezes: number }[] {
  const mapa = new Map<T, number>();
  for (const p of pares) mapa.set(p, (mapa.get(p) ?? 0) + 1);
  return [...mapa.entries()]
    .map(([chave, vezes]) => ({ chave, vezes }))
    .sort((a, b) => b.vezes - a.vezes || a.chave.localeCompare(b.chave, "pt-BR"));
}

export function resumirSessao(eventos: EventoDeSessao[]): ResumoDaSessao {
  const rolagens = eventos.filter((e) => e.tipo === "rolagem");
  const danos = eventos.filter((e) => e.tipo === "dano");

  const porPersonagem = new Map<string, { total: number; golpes: number }>();
  for (const d of danos) {
    const atual = porPersonagem.get(d.rotulo) ?? { total: 0, golpes: 0 };
    porPersonagem.set(d.rotulo, { total: atual.total + d.valor, golpes: atual.golpes + 1 });
  }

  return {
    rolagens: rolagens.length,
    criticos: rolagens.filter((e) => e.critico === "sucesso").length,
    falhasCriticas: rolagens.filter((e) => e.critico === "falha").length,
    danoPorPersonagem: [...porPersonagem.entries()]
      .map(([nome, v]) => ({ nome, ...v }))
      .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, "pt-BR")),
    usoPorRotulo: contar(rolagens.map((e) => e.rotulo)).map(({ chave, vezes }) => ({ rotulo: chave, vezes })),
    rolagensPorAtor: contar(
      rolagens.map((e) => e.ator).filter((a): a is string => !!a)
    ).map(({ chave, vezes }) => ({ ator: chave, vezes })),
  };
}
