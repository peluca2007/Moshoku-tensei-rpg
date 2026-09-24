import type { CriaturaEncontro } from "./encounterSim";
import { comImagensSaneadas } from "./imagemDaFicha";

const objeto = (valor: unknown): valor is Record<string, unknown> =>
  valor !== null && typeof valor === "object" && !Array.isArray(valor);

const numero = (valor: unknown): valor is number =>
  typeof valor === "number" && Number.isFinite(valor);

const opcional = (valor: unknown, teste: (valor: unknown) => boolean): boolean =>
  valor === undefined || teste(valor);

const listaDeTexto = (valor: unknown): valor is string[] =>
  Array.isArray(valor) && valor.every((item) => typeof item === "string");

const booleano = (valor: unknown): valor is boolean => typeof valor === "boolean";

function acaoImportavel(acao: unknown): boolean {
  return objeto(acao) && typeof acao.nome === "string" &&
    numero(acao.acoes) && Number.isInteger(acao.acoes) && acao.acoes >= 1 && acao.acoes <= 4 &&
    typeof acao.dano === "string" && typeof acao.alcance === "string" &&
    booleano(acao.area) && ["ataque", "resistencia", "cura", "escudo"].includes(String(acao.tipo)) &&
    (acao.tipo === "cura" || acao.tipo === "escudo" ? typeof acao.formulaSuporte === "string" : true) &&
    typeof acao.nota === "string" &&
    opcional(acao.regra, (v) => v === "primeiro-golpe") &&
    opcional(acao.bonusAtaque, numero) &&
    opcional(acao.pmCost, (v) => numero(v) && v >= 0) &&
    opcional(acao.ptCost, (v) => numero(v) && v >= 0) &&
    opcional(acao.ppCost, (v) => numero(v) && v >= 0) &&
    opcional(acao.cdResistencia, numero) &&
    opcional(acao.formulaSuporte, (v) => typeof v === "string") &&
    opcional(acao.danoPorTurno, (v) => typeof v === "string" && v.length <= 100) &&
    opcional(acao.bonusSuporte, numero) && opcional(acao.sempreFresca, booleano) &&
    opcional(acao.ataquesPorAcao, (v) => numero(v) && Number.isInteger(v) && v >= 1 && v <= 10) &&
    opcional(acao.desvantagemAtaque, booleano) &&
    opcional(acao.escalaDano, (v) => numero(v) && v > 0) &&
    opcional(acao.aplicaPreso, booleano) && opcional(acao.aplicaCaido, booleano) &&
    opcional(acao.aplicaMolhado, booleano) && opcional(acao.aplicaVeneno, booleano) &&
    opcional(acao.frio, booleano) && opcional(acao.fogo, booleano) &&
    opcional(acao.indicesFrio, (v) => Array.isArray(v) && v.every((n) => numero(n) && Number.isInteger(n) && n >= 0 && n < 20)) &&
    opcional(acao.aplicaEmChamas, booleano) &&
    opcional(acao.emChamasSoNaFalha, booleano) &&
    opcional(acao.cdVeneno, numero) &&
    opcional(acao.aplicaQuebrantado, (v) => v === "maximo" || (numero(v) && v >= 0));
}

function pactosImportaveis(valor: unknown, pmDisponivel: number): boolean {
  if (!objeto(valor) || !numero(valor.limite) || !Number.isInteger(valor.limite) ||
    valor.limite < 1 || valor.limite > 6 || !listaDeTexto(valor.preparados) ||
    valor.preparados.length > valor.limite || new Set(valor.preparados).size !== valor.preparados.length ||
    !Array.isArray(valor.opcoes) || valor.opcoes.length > 30 ||
    !opcional(valor.emergencia, (v) => objeto(v) && numero(v.custoBase) && v.custoBase >= 0 &&
      opcional(v.acoes, (n) => numero(n) && Number.isInteger(n) && n >= 1 && n <= 3) &&
      booleano(v.semPenalidade) && booleano(v.duasVidas))) return false;
  const opcoes = valor.opcoes;
  if (!opcoes.every((p) => objeto(p) &&
    typeof p.id === "string" && p.id.length > 0 && p.id.length <= 100 &&
    typeof p.nome === "string" && typeof p.dano === "string" && p.dano.length <= 100 &&
    numero(p.patamar) && Number.isInteger(p.patamar) && p.patamar >= 1 && p.patamar <= 6 &&
    numero(p.custo) && Number.isInteger(p.custo) && p.custo >= 0 &&
    numero(p.quantidade) && Number.isInteger(p.quantidade) && p.quantidade >= 1 && p.quantidade <= 10 &&
    numero(p.golpes) && Number.isInteger(p.golpes) && p.golpes >= 1 && p.golpes <= 10 &&
    numero(p.pv) && p.pv >= 1 && numero(p.ca) && p.ca >= 1 &&
    numero(p.bonusAtaque) && numero(p.deslocamento) && p.deslocamento >= 0 &&
    listaDeTexto(p.resistencias) && opcional(p.cdVeneno, numero))) return false;
  const porId = new Map(opcoes.map((p) => [p.id, p]));
  return porId.size === opcoes.length && valor.preparados.every((id) => porId.has(id)) &&
    valor.preparados.reduce((total, id) => total + (porId.get(id)?.custo ?? 0), 0) <= pmDisponivel;
}

function perfilImportavel(perfil: unknown): boolean {
  if (!objeto(perfil) || !Array.isArray(perfil.arvores) || !objeto(perfil.atributos) ||
    !objeto(perfil.reservas) || !numero(perfil.iniciativa) || !Array.isArray(perfil.habilidades)) return false;
  const atributos = perfil.atributos as Record<string, unknown>;
  const reservas = perfil.reservas as Record<string, unknown>;
  if (!["forca", "agilidade", "vigor", "intelecto", "espirito"].every((chave) => numero(atributos[chave]))) return false;
  if (!["pm", "pt", "pp"].every((chave) => numero(reservas[chave]) && (reservas[chave] as number) >= 0)) return false;
  return opcional(perfil.raca, (v) => typeof v === "string") &&
    opcional(perfil.antecedente, (v) => typeof v === "string") &&
    opcional(perfil.fluxo, (v) => objeto(v) && numero(v.usosPorRodada) && v.usosPorRodada >= 0 && booleano(v.devolver)) &&
    opcional(perfil.aparar, (v) => objeto(v) && numero(v.bonusCA) && v.bonusCA >= 1 && numero(v.alcance) && v.alcance > 0) &&
    opcional(perfil.pactos, (v) => pactosImportaveis(v, reservas.pm as number)) &&
    perfil.arvores.every((a) => objeto(a) && typeof a.nome === "string" && typeof a.rank === "string") &&
    perfil.habilidades.every((h) => objeto(h) && ["nome", "origem", "tipo", "custo", "efeito"].every((chave) => typeof h[chave] === "string"));
}

/**
 * Links e arquivos vêm de fora do bestiário. Conferir só a presença de `papel`
 * deixa passar uma criatura sem `acoes`, que quebra a prévia e a importação.
 * Campos opcionais de versões antigas continuam opcionais.
 */
export function ehCriaturaImportavel(valor: unknown): valor is Omit<CriaturaEncontro, "id"> {
  if (!objeto(valor)) return false;
  if (typeof valor.nome !== "string" || !numero(valor.patamar) ||
    !Number.isInteger(valor.patamar) || valor.patamar < 1 || valor.patamar > 6 ||
    !["lacaio", "padrao", "chefe"].includes(String(valor.papel)) ||
    !numero(valor.pv) || valor.pv < 1 || !numero(valor.ca) ||
    !numero(valor.bonusAtaque) || !numero(valor.danoPorTurno) || valor.danoPorTurno < 0 ||
    !numero(valor.cdResistencia) || !numero(valor.quantidade) ||
    !Number.isInteger(valor.quantidade) || valor.quantidade < 1 ||
    typeof valor.perigo !== "string" || !Array.isArray(valor.acoes) ||
    !opcional(valor.dadosFurtivos, numero) ||
    !opcional(valor.temPassoVazio, booleano) ||
    !opcional(valor.perfilDeFicha, perfilImportavel) ||
    !opcional(valor.bonusResistencia, numero) ||
    !opcional(valor.bonusIniciativa, numero) ||
    !opcional(valor.acoesPorTurno, (v) => numero(v) && Number.isInteger(v) && v >= 1 && v <= 3) ||
    !opcional(valor.tatica, (v) => ["ordem", "aleatorio", "fragil", "estrategico"].includes(String(v))) ||
    !opcional(valor.pastaId, (v) => typeof v === "string") ||
    !opcional(valor.arquetipo, (v) => typeof v === "string") ||
    !opcional(valor.subArquetipo, (v) => typeof v === "string") ||
    !opcional(valor.deslocamento, numero) ||
    !opcional(valor.movimentoEspecial, (v) => typeof v === "string") ||
    !opcional(valor.tamanho, (v) => typeof v === "string") ||
    !opcional(valor.pericias, listaDeTexto) ||
    !opcional(valor.resistencias, listaDeTexto) ||
    !opcional(valor.imunidades, listaDeTexto) ||
    !opcional(valor.sentido, (v) => typeof v === "string")) return false;

  return valor.acoes.every(acaoImportavel);
}

/** Retrato de um arquivo externo nunca pode apontar para outro servidor. */
export function sanearRetratoDaCriatura<T extends { portrait?: string }>(criatura: T): T {
  return {
    ...criatura,
    portrait: comImagensSaneadas(criatura).portrait,
  };
}
