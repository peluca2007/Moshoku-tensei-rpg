import { consumirReacao, executarAtaquePersonagem, type Alvo, type EstadoPersonagem, type Rng } from "./combatSim";
import { adjacentes, distanciaEntre } from "./combatScenario";
import { rolarComRegistro, type RegistroCombate } from "./combatTrace";

function disponivel(e: EstadoPersonagem, atacante: Alvo): boolean {
  return e.vivo && !e.surpreso && (e.emPostura && e.ficha.rankAgua >= 6 ? !e.reacoesNesteTurno.has(atacante) : e.reacaoDisponivel || e.reacoesExtra > 0);
}
function gastar(e: EstadoPersonagem, atacante: Alvo): boolean {
  if (!disponivel(e, atacante)) return false;
  if (e.emPostura && e.ficha.rankAgua >= 6) { e.reacoesNesteTurno.add(atacante); e.conjurando = null; return true; }
  return consumirReacao(e);
}

export function guardaDoCorpo(alvo: EstadoPersonagem, atacante: Alvo, aliados: EstadoPersonagem[], logger?: RegistroCombate): EstadoPersonagem {
  // Sem mapa (distância desconhecida), o guarda está ao lado de quem protege:
  // é a posição dele na mesa, e sem isto o tanque nunca protegia ninguém no
  // balanceador (2026-09-28).
  const guarda = aliados.find((e) => e !== alvo && e.vivo && e.ficha.temGuardaCorpo &&
    (distanciaEntre(e, alvo) === undefined || adjacentes(e, alvo)) && (e.ca > alvo.ca || alvo.pv < alvo.ficha.pvMax / 2) &&
    disponivel(e, atacante));
  if (!guarda || !gastar(guarda, atacante)) return alvo;
  const posicao = guarda.posicao;
  guarda.posicao = alvo.posicao;
  alvo.posicao = posicao;
  logger?.log(`[${guarda.nome}] usa Guarda do Corpo e intercepta ${atacante.nome} no lugar de ${alvo.nome}.`);
  return guarda;
}

export function caDepoisDeAparar(e: EstadoPersonagem, atacante: Alvo, natural: number, total: number, logger?: RegistroCombate): number {
  const ca = Math.max(1, e.ca - e.quebrantado);
  if (!e.ficha.temAparar || (distanciaEntre(e, atacante) ?? Infinity) > e.ficha.alcanceReacao || natural === 1 || natural === 20 || total < ca || total >= ca + e.ficha.rankAgua) return ca;
  if (!gastar(e, atacante)) return ca;
  logger?.log(`[${e.nome}] usa Aparar: CA ${ca} + Rank ${e.ficha.rankAgua} = ${ca + e.ficha.rankAgua}.`);
  return ca + e.ficha.rankAgua;
}

/** Fluxo é um contragolpe gratuito; Devolver modifica este golpe e nunca cria outro. */
export function reagirComFluxo(e: EstadoPersonagem, atacante: Alvo, formula: string, escala: number, rng: Rng, logger?: RegistroCombate): boolean {
  if (!e.vivo || !atacante.vivo || e.surpreso || e.conjurando || !adjacentes(e, atacante) || e.fluxoRestante <= 0) return false;
  if (e.fluxoRestante === Infinity && e.fluxosNesteTurno.has(atacante)) return false;
  e.fluxoRestante--;
  e.fluxosNesteTurno.add(atacante);
  let bonus = 0;
  const devolver = e.ficha.temDevolver && e.pt >= 1;
  if (devolver) {
    e.pt--;
    const potencial = rolarComRegistro(formula, rng);
    bonus = Math.floor(Math.round(potencial.total * escala) / 2);
    logger?.log(`[${e.nome}] paga 1 PT por Devolver: ${potencial.grupos.map((g) => g.resultados.join(" + ")).join(" + ")} + ${potencial.fixo}, escala ${escala}; metade = ${bonus}.`);
  }
  e.danoCausado += executarAtaquePersonagem(e, {
    ...e.ficha.ataqueBasico, regra: "fluxo", nome: devolver ? "Fluxo + Devolver" : "Fluxo",
    acoes: 0, pm: 0, pt: 0, bonusContextual: bonus,
    gatilho: `${atacante.nome} errou um ataque corpo a corpo adjacente`,
  }, atacante, rng, logger);
  return true;
}

/** O que Sob Minha Guarda decidiu sobre um golpe: quem leva, quanto, e quem recupera PT. */
export interface DecisaoDaGuarda {
  alvo: EstadoPersonagem;
  dano: number;
  interceptado: boolean;
  /** O Escudeiro cujo protegido apanhou sem interceptação: recupera 1 PT. */
  recupera?: EstadoPersonagem;
}

/**
 * Sob Minha Guarda — Cavalaria e Escudos (Cap. 3), no motor desde 2026-10-05.
 *
 * Até aqui a árvore inteira era invisível: o `balancear` media o dano dela
 * (pouco, de propósito) e chamava de "contribui pouco" a única árvore cujo
 * recurso é gasto no dano dos OUTROS. O que entra, carta por carta:
 *
 * - **Interpor** (Maestria do Principiante): o ataque rola contra o protegido,
 *   e todo o dano vem pro Escudeiro, por 1 Reação, sem Resistência. Se o
 *   protegido apanha sem interceptação, o Escudeiro recupera 1 PT.
 * - **Peso do Aço / Escudo Estendido**: alcance 4,5 m e 9 m; do Avançado em
 *   diante, uma interceptação por rodada sem Reação. **Ninguém Passa** (Rei):
 *   todas sem Reação.
 * - **Aguentar o Baque** e o **Soberano**: 1 PT reduz o dano interceptado em
 *   1d10 (2d10) + Vigor + Bônus de Rank; o Soberano devolve o PT se zerar.
 * - **Aegis** (Santo): o protegido sofre o Bônus de Rank a menos.
 *
 * Quem protege quem: os aliados de menos PV máximos, até o limite (é o que a
 * mesa faz — o mago e o curandeiro). Quando interceptar: se o golpe derrubaria
 * o protegido, ou se o Escudeiro está proporcionalmente mais inteiro que ele, e
 * nunca um golpe que derrubaria o próprio Escudeiro. Provocar Ódio, Muralha da
 * Companhia, Não Ele e o Imperador continuam fora (ver CEGOS do `balancear`).
 */
export function sobMinhaGuarda(
  alvo: EstadoPersonagem, dano: number, aliados: EstadoPersonagem[], rng: Rng, logger?: RegistroCombate,
): DecisaoDaGuarda {
  const semGuarda: DecisaoDaGuarda = { alvo, dano, interceptado: false };
  if (dano <= 0) return semGuarda;
  let recupera: EstadoPersonagem | undefined;
  for (const g of aliados) {
    const escudo = g.ficha.escudo;
    if (!escudo || g === alvo || !g.vivo || g.surpreso) continue;
    if (!g.protegidos.length) {
      g.protegidos = aliados
        .filter((x) => x !== g)
        .sort((a, b) => a.ficha.pvMax - b.ficha.pvMax)
        .slice(0, g.ficha.protegidosMax)
        .map((x) => x.ficha.id);
    }
    if (!g.protegidos.includes(alvo.ficha.id)) continue;
    if (escudo.rank >= 4) {
      dano = Math.max(0, dano - escudo.rank);
      logger?.log(`[${g.nome}] Aegis: ${alvo.nome} sofre ${escudo.rank} a menos.`);
      if (dano === 0) return { ...semGuarda, dano };
    }
    recupera ??= g;
    const alcance = escudo.rank >= 3 ? 9 : escudo.rank >= 2 ? 4.5 : 3;
    const distancia = distanciaEntre(g, alvo);
    if (distancia !== undefined && distancia > alcance) continue;
    const derrubaria = alvo.pv + alvo.pvTemp <= dano;
    const maisInteiro = g.pv / g.ficha.pvMax >= alvo.pv / alvo.ficha.pvMax;
    if (g.pv + g.pvTemp <= dano || !(derrubaria || maisInteiro)) continue;
    let pagou: string;
    if (escudo.rank >= 5) pagou = "sem Reação (Ninguém Passa)";
    else if (g.interposLivre) { g.interposLivre = false; pagou = "sem Reação (Escudo Estendido)"; }
    else if (consumirReacao(g)) pagou = "1 Reação";
    else continue;
    let reduzido = dano;
    if (escudo.aguentar && g.pt >= 1) {
      g.pt--;
      const reducao = rolarComRegistro(escudo.aguentar, rng).total + g.ficha.vigor + escudo.rank;
      reduzido = Math.max(0, dano - reducao);
      if (reduzido === 0 && escudo.aguentarSoberano) g.pt = Math.min(g.ficha.ptMax, g.pt + 1);
      logger?.log(`[${g.nome}] Aguentar${escudo.aguentarSoberano ? " Soberano" : " o Baque"}: 1 PT, −${reducao} (${dano} → ${reduzido}).`);
    }
    logger?.log(`[${g.nome}] intercepta por Sob Minha Guarda (${pagou}): ${reduzido} de dano no lugar de ${alvo.nome}.`);
    return { alvo: g, dano: reduzido, interceptado: true };
  }
  return { alvo, dano, interceptado: false, recupera };
}
