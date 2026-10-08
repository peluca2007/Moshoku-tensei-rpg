import type { CharacterData } from "./types";
import { getArmorClass, getCurrentMp, getDeslocamento, getFinalAttributes, getInitiative, getMaxMp } from "@/store/selectors";
import { getPvNaMesa, hpAtualNaMesa } from "./mesa";

/**
 * O código da ficha para a Mesa Moshoku no Roblox (projeto Moshokurpgroblox,
 * docs/MESA.md › "Código de mesa").
 *
 * ## Por que o site calcula, e não o Roblox
 *
 * A mesa no Roblox não recalcula regra nenhuma: PV, mana, CA e iniciativa saem
 * daqui, dos MESMOS seletores que a ficha mostra na tela. Se o livro mudar uma
 * fórmula, o código acompanha sem uma segunda cópia das regras para divergir.
 * O jogador clica em "Copiar para a mesa Roblox" e o mestre cola no painel.
 *
 * ## O formato é contrato
 *
 * `mesa: 1` é a versão. A mesa recusa qualquer outra e valida cada campo
 * (nome até 32 caracteres, atual ≤ máximo, deslocamento com até uma casa
 * decimal). Mudou um campo? Suba a versão e avise o projeto da mesa.
 */

const NOME_MAX = 32;

export interface CodigoDeMesa {
  mesa: 1;
  nome: string;
  pv: number;
  pvMax: number;
  mana: number;
  manaMax: number;
  atributos: { forca: number; agilidade: number; vigor: number; intelecto: number; espirito: number };
  ca: number;
  deslocamento: number;
  iniciativa: number;
  vantagemIniciativa: boolean;
}

/** Lança erro com o motivo quando a ficha não cabe no formato da mesa. */
export function codigoDeMesa(ficha: CharacterData): { codigo: CodigoDeMesa; texto: string; avisos: string[] } {
  const avisos: string[] = [];

  let nome = String(ficha.name ?? "").trim() || "Sem nome";
  if ([...nome].length > NOME_MAX) {
    nome = [...nome].slice(0, NOME_MAX).join("").trim();
    avisos.push(`Nome cortado para ${NOME_MAX} caracteres: "${nome}".`);
  }

  const pvMax = getPvNaMesa(ficha);
  const manaMax = getMaxMp(ficha);
  // A ficha pode guardar um atual acima do máximo (o máximo caiu depois).
  const pvAtual = hpAtualNaMesa(ficha);
  const manaAtual = getCurrentMp(ficha);
  if (pvAtual > pvMax) avisos.push(`PV atual ${pvAtual} acima do máximo; vai como ${pvMax}.`);
  if (manaAtual > manaMax) avisos.push(`Mana atual ${manaAtual} acima do máximo; vai como ${manaMax}.`);

  // Hoje o Deslocamento é 9, 4,5 ou 0 m; o arredondamento só protege o formato.
  const deslocamentoBruto = getDeslocamento(ficha);
  const deslocamento = Math.round(deslocamentoBruto * 10) / 10;
  if (deslocamento !== deslocamentoBruto) avisos.push(`Deslocamento ${deslocamentoBruto} m arredondado para ${deslocamento} m.`);

  const atributos = getFinalAttributes(ficha);
  const iniciativa = getInitiative(ficha);
  const codigo: CodigoDeMesa = {
    mesa: 1,
    nome,
    pv: Math.min(pvAtual, pvMax),
    pvMax,
    mana: Math.min(manaAtual, manaMax),
    manaMax,
    atributos: {
      forca: atributos.forca,
      agilidade: atributos.agilidade,
      vigor: atributos.vigor,
      intelecto: atributos.intelecto,
      espirito: atributos.espirito,
    },
    ca: getArmorClass(ficha),
    deslocamento,
    iniciativa: iniciativa.bonus,
    vantagemIniciativa: iniciativa.hasAdvantage,
  };
  validar(codigo);
  const texto = JSON.stringify(codigo);
  if ([...texto].length > TEXTO_MAX) throw new Error(`O código passou de ${TEXTO_MAX} caracteres.`);
  return { codigo, texto, avisos };
}

const TEXTO_MAX = 1000;

/**
 * Os mesmos limites que a mesa aplica ao receber o código. Melhor recusar aqui,
 * com o motivo, do que copiar algo que o Roblox vai rejeitar (ou um `NaN` que o
 * JSON transforma em `null`).
 */
function validar(c: CodigoDeMesa): void {
  const inteiro = (campo: string, v: number, min: number, max: number) => {
    if (!Number.isInteger(v) || v < min || v > max) throw new Error(`${campo} fora do formato da mesa (${v}).`);
  };
  inteiro("PV máximo", c.pvMax, 0, 9999);
  inteiro("PV atual", c.pv, 0, c.pvMax);
  inteiro("Mana máxima", c.manaMax, 0, 9999);
  inteiro("Mana atual", c.mana, 0, c.manaMax);
  for (const [nome, v] of Object.entries(c.atributos)) inteiro(nome, v, -20, 50);
  inteiro("CA", c.ca, 0, 99);
  inteiro("Iniciativa", c.iniciativa, -50, 50);
  if (!Number.isFinite(c.deslocamento) || c.deslocamento < 0 || c.deslocamento > 999 || Math.round(c.deslocamento * 10) / 10 !== c.deslocamento)
    throw new Error(`Deslocamento fora do formato da mesa (${c.deslocamento}).`);
}
