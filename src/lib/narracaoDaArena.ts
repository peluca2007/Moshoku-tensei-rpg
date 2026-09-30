import type { EventoAtaque } from "./combatTrace";

/**
 * A NARRAÇÃO DA ARENA (2026-09-30).
 *
 * O log do motor é escrito para conferir conta ("[Eris] paga 1 PT por
 * Devolver: 1 + 4, escala 1; metade = 2."). Na arena ele vira frase de mesa
 * ("Eris gasta 1 PT e devolve o golpe: +2 no Fluxo."), e a conta original
 * fica em `conta`, que a tela mostra num "ver a conta" — nada se perde.
 *
 * Só apresentação: não lê regra nem muda número. Linha que nenhuma regra daqui
 * conhece cai na regra geral (tira os colchetes do nome) — uma frase nova no
 * motor aparece crua, nunca some.
 */
export interface Narracao {
  frase: string;
  /** O texto original, com os números, quando a frase o simplificou. */
  conta?: string;
}

type Regra = [RegExp, (n: string, m: RegExpMatchArray) => string];

/** Regras para "[Nome] resto". `n` é o nome; `m` casa com o resto. */
const REGRAS: Regra[] = [
  [/^usa Aparar: CA \d+ \+ Rank \d+ = (\d+)\.$/, (n, m) => `${n} apara o golpe: a CA sobe para ${m[1]}.`],
  [/^usa Fluxo após o erro corpo a corpo de (.+)\.$/, (n, m) => `${n} aproveita o erro de ${m[1]} e contra-ataca com Fluxo.`],
  [/^paga 1 PT por Devolver: .*metade = (\d+)\.$/, (n, m) => `${n} gasta 1 PT e devolve o golpe: +${m[1]} no Fluxo.`],
  [/^paga 1 PT por Devolver: \+(\d+) no Fluxo\.$/, (n, m) => `${n} gasta 1 PT e devolve o golpe: +${m[1]} no Fluxo.`],
  [/^paga 3 PT e 1 Ação por Maré de Retorno: (.+)$/, (n, m) => `${n} ergue a Maré de Retorno: ${m[1]}`],
  [/^usa Guarda do Corpo e intercepta (.+?) no lugar de (.+)\.$/, (n, m) => `${n} se joga na frente de ${m[2]} e recebe o ataque de ${m[1]}.`],
  [/^usa Prever o Golpe: a CA de (.+?) sobe em \+4 contra o ataque\.$/, (n, m) => `${n} lê o golpe e protege ${m[1]}: +4 de CA.`],
  [/^reage com (.+?) \(\d+ alvos?\)$/, (n, m) => `${n} reage com ${m[1]}.`],
  [/^gasta 1 Ação para se aproximar \(([\d.,]+) m do alvo\)\.$/, (n, m) => `${n} avança e fica a ${m[1].replace(".", ",")} m do alvo.`],
  [/^gasta 1 Ação para se aproximar\.$/, (n) => `${n} avança.`],
  [/^se aproxima antes de conjurar (.+)\.$/, (n, m) => `${n} avança para conjurar ${m[1]}.`],
  [/^não consegue alcançar o alvo\.$/, (n) => `${n} não alcança ninguém neste turno.`],
  [/^inicia o cântico de (.+?)(?: \(|: ).*$/, (n, m) => `${n} começa a recitar ${m[1]}.`],
  [/^continua o cântico de (.+?): .*$/, (n, m) => `${n} continua recitando ${m[1]}.`],
  [/^conclui o cântico de (.+)\.$/, (n, m) => `${n} termina o cântico de ${m[1]}!`],
  [/^perde o cântico de (.+?); .*$/, (n, m) => `${n} perde a concentração, e o cântico de ${m[1]} se desfaz.`],
  [/^usa (.+?) em (.+?) \(cura: ([\d.]+)\)\.?$/, (n, m) => `${n} usa ${m[1]} em ${m[2]}: cura ${m[3]} PV.`],
  [/^usa (.+?) em (.+?) \(escudo: ([\d.]+)\)\.?$/, (n, m) => `${n} usa ${m[1]} em ${m[2]}: ${m[3]} PV de proteção.`],
  [/^usa (.+?) em (.+?) \(\w+: [\d.]+\)\.?$/, (n, m) => `${n} usa ${m[1]} em ${m[2]}.`],
  [/^aponta (.+?): o primeiro acerto recebe \+(\d+)d6\.$/, (n, m) => `${n} marca ${m[1]}: o próximo acerto nele leva +${m[2]}d6.`],
  [/^começa (.+?) antes da troca de golpes\.$/, (n, m) => `${n} começa a tocar ${m[1]}.`],
  [/^mantém Dissonância: .*$/, (n) => `${n} mantém a Dissonância.`],
  [/^inspira (.+?): (\d+)d6 para somar depois de ver um teste\.$/, (n, m) => `${n} inspira ${m[1]}: +${m[2]}d6 guardado para um teste.`],
  [/^mantém a Postura de Água e aguarda ataques\.$/, (n) => `${n} fica em Postura de Água, esperando o golpe.`],
  [/^tenta começar Escondido: .* — conseguiu\.$/, (n) => `${n} começa escondido.`],
  [/^tenta começar Escondido: .* — falhou\.$/, (n) => `${n} tenta começar escondido, mas é visto.`],
  [/^gasta 1 Ação para Se Esconder: .* — conseguiu\.$/, (n) => `${n} some de vista.`],
  [/^gasta 1 Ação para Se Esconder: .* — falhou\.$/, (n) => `${n} tenta se esconder, mas é visto.`],
  [/^caiu pelas chamas!$/, (n) => `${n} cai, consumido pelas chamas!`],
  [/^caiu por dano sustentado!$/, (n) => `${n} cai pelo dano que não parava.`],
  [/^preparou (.+?) antes da iniciativa \(\d+ PM\)\.$/, (n, m) => `${n} já chega com ${m[1]} em campo.`],
  [/^usa Chamado de Emergência \(.+?\): (.+)$/, (n, m) => `${n} faz um Chamado de Emergência: ${m[1]}`],
  [/^usa Primeiro Golpe contra alvo Desprevenido; .*$/, (n) => `${n} ataca primeiro e pega o alvo desprevenido!`],
  [/^gasta 1 Ação em Passo Vazio .*$/, (n) => `${n} some num Passo Vazio e reaparece pronto para o Primeiro Golpe.`],
  [/^prepara Antecipação para (.+?): 1 Ação concedida\.$/, (n, m) => `${n} antecipa a jogada de ${m[1]}: +1 Ação.`],
  [/^usa Comando e concede 1 Ação a (.+)\.$/, (n, m) => `${n} dá uma ordem a ${m[1]}: +1 Ação.`],
  [/^usa Avante: .*$/, (n) => `${n} grita "Avante!": cada aliado ganha 1 Ação.`],
  [/^usa Insulto Afiado: o próximo ataque de (.+?) tem Desvantagem\.$/, (n, m) => `${n} provoca ${m[1]}: o próximo ataque vem com Desvantagem.`],
  [/^usa Voz de Sargento: (.+?) remove Caído\.$/, (n, m) => `${n} chama ${m[1]}, que se levanta.`],
  [/^recebe \d+ nível de Exaustão depois de (.+?) \(nível (\d+)\)\.$/, (n, m) => `${n} sente o peso de ${m[1]}: Exaustão ${m[2]}.`],
  [/^perde o turno pelo Colapso da terceira Dose\.$/, (n) => `${n} desaba com a terceira Dose e perde o turno.`],
  [/^gasta (.+?) em (.+)\.$/, (n, m) => `${n} gasta ${m[1]} em ${m[2]}.`],
];

export function narrarLinha(linha: string): Narracao {
  const texto = linha.trim();
  if (!texto) return { frase: "Preparação da cena." };
  const rodada = texto.match(/^--- Rodada (\d+) ---$/);
  if (rodada) return { frase: `Começa a rodada ${rodada[1]}.` };
  const fim = texto.match(/^Resultado: (.+?) em (\d+) rodadas\. PV Restante: (\d+)%$/);
  if (fim) return { frase: `Fim: ${fim[1]} em ${fim[2]} rodada${fim[2] === "1" ? "" : "s"}. O grupo termina com ${fim[3]}% dos PV.` };

  const quem = texto.match(/^\[(.+?)\] ([\s\S]+)$/);
  if (!quem) return { frase: texto };
  const [, nome, resto] = quem;
  for (const [re, montar] of REGRAS) {
    const m = resto.match(re);
    if (m) {
      const frase = montar(nome, m);
      // Só há "conta" para ver quando o original tinha número (o custo "1 Ação" não conta).
      const temConta = /\d/.test(resto.replace(/\b1 Ação\b/g, ""));
      return frase === `${nome} ${resto}` || !temConta ? { frase } : { frase, conta: texto };
    }
  }
  return { frase: `${nome} ${resto}` };
}

/** O recibo de ataque em frase de mesa; o d20 e a defesa vão para a conta. */
export function narrarGolpe(e: EventoAtaque): Narracao {
  const perda = e.aplicacao?.perdaPv ?? 0;
  const conta = e.teste
    ? `${e.teste.tipo === "ataque" ? "Ataque" : "Resistência"}: ${e.teste.total} contra ${e.teste.tipo === "ataque" ? "CA" : "CD"} ${e.teste.defesa}.`
    : undefined;
  if (e.teste?.tipo === "resistencia") {
    const frase = e.acertou
      ? `${e.alvo} não resiste a ${e.acao} de ${e.atacante}: −${perda} PV.`
      : perda > 0 ? `${e.alvo} resiste a ${e.acao} de ${e.atacante}, mas perde ${perda} PV.` : `${e.alvo} resiste a ${e.acao} de ${e.atacante}.`;
    return { frase, conta };
  }
  const frase = !e.acertou
    ? `${e.atacante} erra ${e.alvo} com ${e.acao}.`
    : e.critico
      ? `${e.atacante} acerta ${e.alvo} em cheio com ${e.acao} (crítico): −${perda} PV.`
      : `${e.atacante} acerta ${e.alvo} com ${e.acao}: −${perda} PV.`;
  return { frase, conta };
}

/** Um golpe em área: uma frase, com cada alvo e o que perdeu. */
export function narrarArea(eventos: EventoAtaque[]): Narracao {
  const alvos = eventos.map((e) => `${e.alvo} ${e.acertou || (e.aplicacao?.perdaPv ?? 0) > 0 ? `−${e.aplicacao?.perdaPv ?? 0}` : "escapa"}`);
  return {
    frase: `${eventos[0].atacante} usa ${eventos[0].acao} em ${eventos.length} alvos: ${alvos.join(", ")}.`,
    conta: eventos.map((e) => narrarGolpe(e).conta && `${e.alvo}: ${narrarGolpe(e).conta}`).filter(Boolean).join(" "),
  };
}
