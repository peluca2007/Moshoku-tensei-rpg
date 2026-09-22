import { CharacterData } from "./types";
import { AcaoCriatura, CriaturaEncontro } from "./encounterSim";
import { Acao, type FichaCombate, mediaFormula, modificadorFixo, montarFicha, patamarDaFicha } from "./combatSim";
import { getSpellDC, getPaSpent, getTreeAttributeKey } from "@/store/selectors";
import { getTreeById } from "@/data/trees/index";
import { rankDaFicha } from "./combatSim";

/**
 * Uma ficha de personagem virando criatura do Mestre.
 *
 * ## Por que isso precisa existir
 *
 * O rival que persegue o grupo há três sessões, o cavaleiro que virou inimigo,
 * o PJ de quem faltou hoje, o duelo entre dois jogadores — todos são a mesma
 * coisa do ponto de vista da mesa: **um personagem construído com as regras
 * inteiras, do lado errado da iniciativa**. Até aqui o Mestre tinha duas
 * saídas ruins: montar uma criatura do zero e chutar os números, ou desistir e
 * narrar. As duas jogam fora uma ficha que já existe, já está balanceada pelo
 * custo em PA e já tem as técnicas escritas.
 *
 * ## O que ela NÃO é
 *
 * Não é um vínculo. A criatura nasce como uma CÓPIA independente: editar o
 * chefe não mexe na ficha do jogador, e subir o jogador de patamar não muda o
 * chefe que já foi pra mesa. Um vínculo vivo seria pior de duas maneiras — o
 * Mestre perderia os ajustes que fez ao chefe toda vez que o dono da ficha
 * comprasse uma habilidade, e a ficha do jogador viraria dependência de um
 * encontro que ele nem deveria ver.
 *
 * ## De onde vem cada número
 *
 * PV, CA, Bônus de Ataque e CD saem de `montarFicha` — o MESMO derivador que a
 * simulação usa pro lado dos heróis. É o que garante que o rival aguente como
 * personagem: se estes números divergissem dos da simulação, o teste de 300
 * batalhas estaria medindo um inimigo que não existe.
 *
 * As FÓRMULAS de dano são o único ponto em que a conversão segue o livro em vez
 * do motor — ver `formulaDaAcao`. O motor soma o Bônus de Combate em toda ação,
 * como simplificação declarada dele; o cartão soma onde a carta da habilidade
 * escreve "+ BC", porque quem lê o cartão na mesa tem a carta ao lado, e as
 * duas precisam fechar.
 *
 * O molde do Apêndice G fica de fora de propósito: uma ficha de personagem é
 * exatamente o caso em que os números NÃO vêm da tabela. O cartão vai acusar
 * "fora do molde", e isso é a informação certa — o Mestre está pondo na mesa
 * algo que a tabela não calibrou.
 */

/**
 * A fórmula rolável de uma ação do livro.
 *
 * `damage.normal` é prosa de regra — "1d8 + BC (cortante) + 1d4 de frio",
 * "+2 Dados de Arma", "12d12 de frio (24d12 contra alvo Molhado)" — e o campo
 * de dano da criatura é uma fórmula que a simulação rola. As três armadilhas
 * da tradução, cada uma encontrada por um teste desta pasta:
 *
 * 1. **O que está entre parênteses é CONDICIONAL**, e nunca soma: "(24d12
 *    contra alvo Molhado)" é o dano de OUTRO caso, não uma segunda parcela.
 *    Somando, o Rei de Água virava 36d12 num cartão.
 * 2. **"+2 Dados de Arma" não é "+2 de dano"** — o `+2` ali é a CONTAGEM de
 *    dados. Lido como modificador fixo, ele entra duas vezes: uma como dados,
 *    outra como bônus.
 * 3. **O "BC" é escrito, não presumido.** O texto soma o Bônus de Combate onde
 *    ele vale ("1d8 + BC"), e cala onde não vale ("2d8 de frio"). Aqui a regra
 *    seguida é a do LIVRO, e não a do motor de simulação, que soma o BC em toda
 *    ação como simplificação declarada: quem lê este cartão na mesa lê a carta
 *    da habilidade ao lado, e as duas têm que fechar.
 */
const TIPOS_DE_DANO = ["cortante", "perfurante", "contundente", "ígneo", "frio", "elétrico", "radiante", "sônico", "veneno", "ácido", "psíquico"];

export function formulaDaAcao(acao: Acao, dadoDaArma: number | string, bc: number): string {
  const semCondicional = acao.dano.replace(/\([^)]*\)/g, " ");
  const semContagem = semCondicional.replace(/[+-]?\s*\d+\s*Dados?\s+de\s+Arma/gi, " ");
  const proprios = semContagem.match(/\d+\s*d\s*\d+/gi)?.map((d) => d.replace(/\s+/g, "")) ?? [];
  const partes = [...proprios];
  const formulaArma = typeof dadoDaArma === "number" ? `1d${dadoDaArma}` : dadoDaArma;
  // Fórmula de criatura não expressa metade de uma parcela: não transformar
  // 0,5 dado em "0.5d8", que o leitor interpretaria como CINCO dados.
  if (!Number.isInteger(acao.dadosDeArma)) return "";
  if (acao.dadosDeArma > 0) {
    for (const dado of formulaArma.matchAll(/(\d*)d(\d+)/gi)) {
      partes.push(`${Number(dado[1] || 1) * acao.dadosDeArma}d${dado[2]}`);
    }
  }
  if (partes.length === 0) return "";
  const usaBC = acao.dadosDeArma > 0 || /\bBC\b|Bônus de Combate/i.test(semCondicional);
  const soma = modificadorFixo(semContagem) + (usaBC ? bc : 0) + acao.dadosDeArma * modificadorFixo(formulaArma);
  let resultado = partes.join("+") + (soma > 0 ? `+${soma}` : soma < 0 ? `${soma}` : "");

  // 0.1.94: Recupera os tipos de dano para que a simulação consiga ver Resistências/Imunidades
  const tiposPresentes = TIPOS_DE_DANO.filter(t => acao.dano.toLowerCase().includes(t));
  if (tiposPresentes.length > 0 && resultado !== "") {
    resultado += ` (${tiposPresentes.join(", ")})`;
  }

  return resultado;
}

function danoConvertido(acao: Acao, ficha: FichaCombate): string {
  if (acao.regra === "primeiro-golpe") {
    const bonus = ficha.arma.damageBonus;
    return `${ficha.ataqueBasico.dano}+${acao.dano}${bonus >= 0 ? "+" : ""}${bonus}`;
  }
  return formulaDaAcao(acao, ficha.ataqueBasico.dano, ficha.bc);
}

function acaoDaFicha(acao: Acao, ficha: FichaCombate, id: string): AcaoCriatura {
  const dano = danoConvertido(acao, ficha);
  return {
    id,
    regra: acao.regra === "primeiro-golpe" ? "primeiro-golpe" : undefined,
    nome: acao.nome,
    acoes: Math.min(3, Math.max(1, acao.acoes)),
    dano,
    alcance: acao.area ? "Área" : "Ver a ficha",
    area: acao.area,
    tipo: acao.ataque ? "ataque" : "resistencia",
    bonusAtaque: acao.regra === "primeiro-golpe" ? ficha.arma.attackBonus : undefined,
    desvantagemAtaque: acao.regra === "primeiro-golpe" && !ficha.arma.proficiente,
    // O texto original do livro vai junto: a tradução acima resolve o dado, e
    // não resolve "empurra 3m", "ignora armadura" nem o custo em PM. Quem lê a
    // carta na mesa é o Mestre, e ele merece a frase inteira.
    nota: acao.regra === "primeiro-golpe"
      ? `Uma vez por combate contra alvo Desprevenido. Parcela especial: ${acao.dano}; Dano Furtivo normal entra no primeiro acerto elegível do turno.`
      : acao.dano === dano ? "" : acao.dano,
    aplicaPreso: false,
    aplicaCaido: false,
    aplicaMolhado: acao.aplicaMolhado,
    aplicaVeneno: false,
  };
}

/**
 * A ficha resolvida nos campos da criatura — sem `id`, que quem guarda sorteia.
 *
 * `novoId` existe porque as Ações precisam de id e este módulo não conhece a
 * store: quem chama passa o mesmo sorteador que o resto do bestiário usa.
 */
export function criaturaDaFicha(
  c: CharacterData,
  novoId: () => string
): Omit<CriaturaEncontro, "id"> {
  const ficha = montarFicha(c);
  const tree = getTreeById(c.startingTreeId);
  const attr = getTreeAttributeKey(c, c.startingTreeId, "forca");

  // O ataque comum vem SEMPRE e vem primeiro: nenhuma árvore o declara como
  // habilidade (é regra do Cap. 4), e uma criatura que só tem as técnicas
  // caras parece não saber bater — o mesmo erro que o `check:arvores` cometeu
  // em 0.1.11 e que a 0.1.12 corrigiu.
  //
  // O bônus dele segue a mesma distinção de `combatSim.resolver`: quem não tem
  // árvore do CORPO dá um "golpe sem estilo" e soma só o atributo, sem Bônus de
  // Rank — a Escada de Dados e o Rank no golpe são exclusivos do Corpo (Cap. 3).
  // Somar `bc` aqui daria ao mago convertido o braço de um espadachim.
  const bonusDoBasico = ficha.arma.damageBonus - ficha.arma.penalidadeQuebrantado;
  const basico: AcaoCriatura = {
    id: novoId(),
    nome: `Ataque com ${ficha.ataqueBasico.nome}`,
    acoes: 1,
    dano: `${ficha.ataqueBasico.dano}${bonusDoBasico >= 0 ? "+" : ""}${bonusDoBasico}`,
    bonusAtaque: ficha.arma.attackBonus,
    desvantagemAtaque: !ficha.arma.proficiente,
    alcance: "Corpo a corpo",
    area: false,
    tipo: "ataque",
    nota: `${ficha.arma.nome}: ${ficha.arma.baseDie} → ${ficha.arma.escalatedDie}; ${ficha.arma.steps} degraus. ${ficha.arma.aviso ?? ""}`.trim(),
    aplicaPreso: false,
    aplicaCaido: false,
    aplicaMolhado: false,
    aplicaVeneno: false,
  };

  // As mais fortes primeiro, mas sem um teto arbitrário: uma técnica situacional
  // pode ser a melhor escolha quando o alvo ou o cenário muda. A ficha importada
  // deve manter todas as ações de dano que conseguimos traduzir.
  const convertiveis = ficha.acoes
    .filter((a) => a.tipo === "dano" && !a.reacao)
    .map((a) => ({ a, media: mediaFormula(danoConvertido(a, ficha)) }))
    .filter(({ media }) => media > 0)
    .sort((x, y) => y.media - x.media);
  const doLivro = convertiveis.map(({ a }) => acaoDaFicha(a, ficha, novoId()));

  const patamar = Math.min(6, Math.max(1, patamarDaFicha(c)));
  const rank = rankDaFicha(c);
  const convertidas = new Set(convertiveis.map(({ a }) => a));
  const naoSimuladas = ficha.acoes.filter((a) => !convertidas.has(a)).map((a) => a.nome);

  return {
    nome: ficha.nome,
    dadosFurtivos: ficha.rankLadino || undefined,
    temPassoVazio: ficha.temPassoVazio || undefined,
    patamar,
    // "Padrão" é o que uma ficha é: um indivíduo que joga UM turno de 3 Ações.
    // "Chefe" daria a ele a rodada extra do Apêndice G, que existe pra
    // compensar um monstro solo contra cinco — e o Mestre pode ligar isso na
    // mão, se for esse o caso.
    papel: "padrao",
    pv: ficha.pvMax,
    ca: ficha.ca,
    bonusAtaque: ficha.bc,
    // Ignorado enquanto houver ação ofensiva declarada (`usaAcoes`), mas
    // preenchido mesmo assim: se o Mestre apagar as Ações pra simplificar, a
    // criatura continua batendo o que a ficha bate, em vez de cair pra zero.
    danoPorTurno: Math.round(mediaFormula(basico.dano) * 3),
    cdResistencia: c.startingTreeId ? getSpellDC(c, c.startingTreeId, attr) : 8,
    quantidade: 1,
    perigo: [
      `Ficha de personagem: ${tree?.name ?? "sem árvore inicial"}${rank ? `, ${rank}` : ""}, ${getPaSpent(c)} PA.`,
      naoSimuladas.length > 0 ? `Ainda não simuladas como ações desta criatura: ${naoSimuladas.join(", ")}.` : "",
      ficha.temPassoVazio ? "Passo Vazio consome 1 Ação, uma vez por combate, e reabre Primeiro Golpe na ação seguinte." : "",
      `Os números vieram da ficha, não do molde (Apêndice G, "Rivais com ficha"). Bônus de Rank: +${patamar}.`,
    ]
      .filter(Boolean)
      .join(" "),
    acoes: [basico, ...doLivro],
    portrait: c.portrait,
  };
}
