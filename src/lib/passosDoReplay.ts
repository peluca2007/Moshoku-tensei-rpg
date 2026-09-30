import type { EventoAtaque } from "./combatTrace";
import type { QuadroDoReplay } from "./encounterSim";

/**
 * Um passo do replay da arena. Quase sempre é um quadro só; um golpe em área
 * que gera vários recibos seguidos (mesmo atacante, mesma ação, alvos
 * diferentes) vira um passo único: uma investida, os efeitos em todos os alvos
 * ao mesmo tempo.
 *
 * Dois golpes seguidos no MESMO alvo continuam dois passos: é o personagem
 * gastando duas Ações, e a mesa precisa ver as duas.
 */
export interface PassoDoReplay {
  de: number;
  ate: number;
  eventos: EventoAtaque[];
}

export function montarPassos(quadros: QuadroDoReplay[], eventos: EventoAtaque[] = []): PassoDoReplay[] {
  const passos: PassoDoReplay[] = [];
  quadros.forEach((q, i) => {
    const evento = q.evento !== undefined ? eventos[q.evento] : undefined;
    const atual = passos.at(-1);
    const primeiro = atual?.eventos[0];
    if (evento && atual && primeiro && atual.ate === i - 1 && primeiro.atacante === evento.atacante
      && primeiro.acao === evento.acao && !atual.eventos.some((e) => e.alvo === evento.alvo)) {
      atual.ate = i;
      atual.eventos.push(evento);
      return;
    }
    passos.push({ de: i, ate: i, eventos: evento ? [evento] : [] });
  });
  return passos;
}

/** "Sapo-Lodo Gigante 2" → base e número, para o número sobreviver ao corte. */
export function partesDoNome(nome: string): { base: string; numero?: string } {
  const m = nome.match(/^(.*\S)\s+(\d+)$/);
  return m ? { base: m[1], numero: m[2] } : { base: nome };
}
