import { consumirReacao, executarAtaquePersonagem, type Alvo, type EstadoPersonagem, type Rng } from "./combatSim";
import { adjacentes, distanciaEntre } from "./combatScenario";
import { rolarComRegistro, type RegistroCombate } from "./combatTrace";

function disponivel(e: EstadoPersonagem, atacante: Alvo): boolean {
  return e.vivo && !e.surpreso && (e.emPostura && e.ficha.rankAgua >= 6 ? !e.reacoesNesteTurno.has(atacante) : e.reacaoDisponivel || e.reacoesExtra > 0);
}
function gastar(e: EstadoPersonagem, atacante: Alvo): boolean {
  if (!disponivel(e, atacante)) return false;
  if (e.emPostura && e.ficha.rankAgua >= 6) { e.reacoesNesteTurno.add(atacante); return true; }
  return consumirReacao(e);
}

export function guardaDoCorpo(alvo: EstadoPersonagem, atacante: Alvo, aliados: EstadoPersonagem[], logger?: RegistroCombate): EstadoPersonagem {
  const guarda = aliados.find((e) => e !== alvo && e.vivo && e.ficha.temGuardaCorpo &&
    adjacentes(e, alvo) && (e.ca > alvo.ca || alvo.pv < alvo.ficha.pvMax / 2) &&
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
  if (!e.vivo || !atacante.vivo || e.surpreso || !adjacentes(e, atacante) || e.fluxoRestante <= 0) return false;
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
