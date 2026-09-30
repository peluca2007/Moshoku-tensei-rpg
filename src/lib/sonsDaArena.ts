import type { EventoAtaque } from "./combatTrace";
import type { FormaDoGolpe, ReacaoNaArena } from "./passosDoReplay";

/**
 * OS SONS DA ARENA (2026-09-30).
 *
 * O autor escolheu os arquivos; eles moram em `public/sons/arena/`, com nome
 * curto e sem acento (mesma regra da arte: caminho com `ç` falha calado em
 * servidor estático). A origem de cada um, para crédito e para achar de novo:
 *
 * | arquivo            | original                                                         |
 * | ------------------ | ---------------------------------------------------------------- |
 * | espada-corte       | 54427377-sword-slash-476148 (Pixabay)                             |
 * | espada-metal       | daviddumaisaudio-sword-slash-with-metallic-impact-185435 (Pixabay) |
 * | espada-combo       | freesound_gamestudio-rpg-sword-attack-combo19-388939 (Pixabay)    |
 * | aparar             | deepwoken-parry — do jogo Deepwoken; uso autorizado pelo autor     |
 * | flecha-impacto-1/2 | dennish18-arrow-body-impact-146419; freesound_community-arrow-impact-87260 |
 * | vento-impacto      | dragon-studio-elemental-spell-impact-wind-478376                  |
 * | fogo-impacto       | dragon-studio-fire-spell-impact-393921                            |
 * | soco               | dragon-studio-hard-punch-sfx-515251                               |
 * | moedas             | freesound_community-coins27-36030                                 |
 * | buff               | freesound_community-gooo-83817 ("o gooo": buff do Tático e do Bardo) |
 * | assobio            | freesound_community-silbido-1-101841                              |
 * | grito-*            | phatphrogstudio (fighter/soldier voice attack grunt)              |
 * | brilho             | universfield-magic-twinkle-244951                                 |
 * | fogo, gelo, agua, vento, terra, cura-1/2, lanca | yodguard-*-magic / spear_thrust (Pixabay) |
 *
 * Tudo aqui é decisão de SOM, não de regra: lê o que o replay já sabe (forma
 * do golpe, elemento, reações, linha do log) e devolve o que tocar e quando.
 */

export const SONS = [
  "espada-corte", "espada-metal", "espada-combo", "aparar", "flecha-impacto-1", "flecha-impacto-2",
  "vento-impacto", "fogo-impacto", "soco", "moedas", "buff", "assobio",
  "grito-feminino", "grito-masculino-1", "grito-masculino-2", "grito-masculino-3",
  "brilho", "terra", "fogo", "cura-1", "cura-2", "gelo", "lanca", "agua", "vento",
] as const;
export type Som = (typeof SONS)[number];

export const caminhoDoSom = (som: Som) => `/sons/arena/${som}.mp3`;

/** A voz que o jogador escolheu para o personagem gritar no crítico. Sem escolha, ele não grita. */
export type VozDeCombate = "masculina" | "feminina";

export interface Toque {
  som: Som;
  /** Milissegundos depois do começo do passo — o mesmo relógio das animações. */
  atraso: number;
  /** Corta os arquivos longos (os feitiços têm vários segundos de cauda). */
  duracao?: number;
}

export interface PassoSonoro {
  forma?: FormaDoGolpe;
  /** A chave do elemento da arena (fogo, gelo, agua, raio, veneno, som, luz, arcano, terra, corte, impacto). */
  elemento?: string;
  eventos: EventoAtaque[];
  reacoes: ReacaoNaArena[];
  linha: string;
  /** Alguém ganhou PV neste passo sem ser atingido. */
  curou: boolean;
  vozDoAtacante?: VozDeCombate;
  /** Qualquer número estável do passo, para variar entre os sons parecidos sem sortear. */
  semente: number;
}

/** O golpe a distância só chega aos ~440 ms; o corpo a corpo, aos ~260 ms (ver o CSS da arena). */
const IMPACTO_PERTO = 240;
const IMPACTO_LONGE = 430;
const A_DISTANCIA = new Set<FormaDoGolpe>(["flecha", "arremesso", "magia"]);

const LANCAMENTO_DA_MAGIA: Partial<Record<string, Som>> = {
  fogo: "fogo", gelo: "gelo", agua: "agua", terra: "terra", raio: "vento", veneno: "agua",
  som: "brilho", luz: "brilho", arcano: "brilho",
};

const IMPACTO_DA_MAGIA: Partial<Record<string, Som>> = {
  fogo: "fogo-impacto", raio: "vento-impacto", gelo: "vento-impacto",
};

function escolha<T>(opcoes: readonly T[], semente: number): T {
  return opcoes[Math.abs(semente) % opcoes.length];
}

function somDoImpacto(forma: FormaDoGolpe, elemento: string | undefined, semente: number): Som {
  switch (forma) {
    case "espada": return escolha(["espada-corte", "espada-metal", "espada-combo"] as const, semente);
    case "garra": return "espada-corte";
    case "lanca": return "lanca";
    case "flecha":
    case "arremesso": return escolha(["flecha-impacto-1", "flecha-impacto-2"] as const, semente);
    case "magia": return (elemento ? IMPACTO_DA_MAGIA[elemento] : undefined) ?? "soco";
    default: return "soco";
  }
}

const SOM_DA_REACAO: Record<ReacaoNaArena["tipo"], Som> = {
  aparar: "aparar", fluxo: "agua", devolver: "agua", guarda: "espada-metal", prever: "brilho",
  couraca: "terra", parede: "brilho", refrao: "brilho", chefe: "soco", outra: "brilho",
};

/** Tático aponta, Bardo inspira ou abre a Canção: é o "gooo". */
const LINHA_DE_BUFF = /^\[.+?\] (aponta .+: o primeiro acerto|inspira .+: |começa .+ antes da troca de golpes)/;
/** Suporte que não é cura (escudo, bênção): um brilho. A cura sai pelo PV subindo. */
const LINHA_DE_SUPORTE = /^\[.+?\] usa .+ em .+ \((escudo|outro): /;

export function sonsDoPasso(p: PassoSonoro): Toque[] {
  const toques: Toque[] = [];
  const linha = p.linha.trim();

  for (const r of p.reacoes) toques.push({ som: SOM_DA_REACAO[r.tipo], atraso: 60, duracao: 1400 });
  if (LINHA_DE_BUFF.test(linha)) toques.push({ som: "buff", atraso: 40, duracao: 1600 });
  else if (LINHA_DE_SUPORTE.test(linha)) toques.push({ som: "brilho", atraso: 40, duracao: 1400 });

  const golpe = p.eventos[0];
  if (golpe && p.forma) {
    const longe = A_DISTANCIA.has(p.forma);
    if (golpe.critico && p.vozDoAtacante) {
      const grito: Som = p.vozDoAtacante === "feminina"
        ? "grito-feminino"
        : escolha(["grito-masculino-1", "grito-masculino-2", "grito-masculino-3"] as const, p.semente);
      toques.push({ som: grito, atraso: 0 });
    }
    if (p.forma === "magia") {
      const lancar = p.elemento ? LANCAMENTO_DA_MAGIA[p.elemento] : undefined;
      if (lancar) toques.push({ som: lancar, atraso: 60, duracao: 900 });
    } else if (longe) {
      toques.push({ som: "assobio", atraso: 80, duracao: 500 });
    }
    // Um golpe só soa uma vez, mesmo em área: dez explosões juntas viram ruído.
    if (p.eventos.some((e) => e.acertou)) {
      toques.push({ som: somDoImpacto(p.forma, p.elemento, p.semente), atraso: longe ? IMPACTO_LONGE : IMPACTO_PERTO, duracao: 1200 });
    } else if (!longe) {
      toques.push({ som: "assobio", atraso: IMPACTO_PERTO, duracao: 500 });
    }
  }

  if (p.curou && !golpe) toques.push({ som: escolha(["cura-1", "cura-2"] as const, p.semente), atraso: 60, duracao: 1500 });
  return toques;
}

/** Frases do motor que os sons de buff leem; `sonsDaArena.test.ts` confere que continuam lá. */
export const FRASES_DE_BUFF = [
  "] aponta ${alvo.nome}: o primeiro acerto",
  "] inspira ${inspirado.nome}: ",
  "antes da troca de golpes.",
] as const;
