import { CharacterData, attributeKeyFromLabel } from "./types";
import { AcaoCriatura, CriaturaEncontro } from "./encounterSim";
import { Acao, mediaFormula, modificadorFixo, montarFicha, patamarDaFicha } from "./combatSim";
import { getSpellDC, getPaSpent } from "@/store/selectors";
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

/** Quantas ações ofensivas a criatura herda. Além disso, o cartão vira um catálogo ilegível. */
const MAX_ACOES = 8;

function faceDoDado(formula: string): number {
  const m = formula.match(/d\s*(\d+)/i);
  return m ? Number(m[1]) : 6;
}

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
export function formulaDaAcao(acao: Acao, facesDaArma: number, bc: number): string {
  const semCondicional = acao.dano.replace(/\([^)]*\)/g, " ");
  const semContagem = semCondicional.replace(/[+-]?\s*\d+\s*Dados?\s+de\s+Arma/gi, " ");
  const proprios = semContagem.match(/\d+\s*d\s*\d+/gi)?.map((d) => d.replace(/\s+/g, "")) ?? [];
  const partes = [...proprios];
  if (acao.dadosDeArma > 0) partes.push(`${acao.dadosDeArma}d${facesDaArma}`);
  if (partes.length === 0) return "";
  const usaBC = acao.dadosDeArma > 0 || /\bBC\b|Bônus de Combate/i.test(semCondicional);
  const soma = modificadorFixo(semContagem) + (usaBC ? bc : 0);
  return partes.join("+") + (soma > 0 ? `+${soma}` : soma < 0 ? `${soma}` : "");
}

function acaoDaFicha(acao: Acao, facesDaArma: number, bc: number, id: string): AcaoCriatura {
  const dano = formulaDaAcao(acao, facesDaArma, bc);
  return {
    id,
    nome: acao.nome,
    acoes: Math.min(3, Math.max(1, acao.acoes)),
    dano,
    alcance: acao.area ? "Área" : "Ver a ficha",
    area: acao.area,
    tipo: acao.ataque ? "ataque" : "resistencia",
    // O texto original do livro vai junto: a tradução acima resolve o dado, e
    // não resolve "empurra 3m", "ignora armadura" nem o custo em PM. Quem lê a
    // carta na mesa é o Mestre, e ele merece a frase inteira.
    nota: acao.dano === dano ? "" : acao.dano,
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
  const attr = attributeKeyFromLabel(tree?.keyAttributeLabel) ?? "forca";
  const facesDaArma = faceDoDado(ficha.ataqueBasico.dano);

  // O ataque comum vem SEMPRE e vem primeiro: nenhuma árvore o declara como
  // habilidade (é regra do Cap. 4), e uma criatura que só tem as técnicas
  // caras parece não saber bater — o mesmo erro que o `check:arvores` cometeu
  // em 0.1.11 e que a 0.1.12 corrigiu.
  //
  // O bônus dele segue a mesma distinção de `combatSim.resolver`: quem não tem
  // árvore do CORPO empunha "arma simples" e soma só o atributo, sem Bônus de
  // Rank — a Escada de Dados e o Rank no golpe são exclusivos do Corpo (Cap. 3).
  // Somar `bc` aqui daria ao mago convertido o braço de um espadachim.
  const bonusDoBasico = ficha.ataqueBasico.nome === "arma simples" ? ficha.bcSemRank : ficha.bc;
  const basico: AcaoCriatura = {
    id: novoId(),
    nome: `Ataque com ${ficha.ataqueBasico.nome}`,
    acoes: 1,
    dano: `${ficha.ataqueBasico.dano}+${bonusDoBasico}`,
    alcance: "Corpo a corpo",
    area: false,
    tipo: "ataque",
    nota: "",
    aplicaPreso: false,
    aplicaCaido: false,
    aplicaMolhado: false,
    aplicaVeneno: false,
  };

  // As mais fortes primeiro, e um teto: um Imperador com vinte magias compradas
  // viraria um cartão de duas telas, e a simulação só gasta 3 Ações por turno —
  // da nona ação pra baixo, nada disso chega a ser rolado.
  const doLivro = ficha.acoes
    .map((a) => ({ a, media: mediaFormula(formulaDaAcao(a, facesDaArma, ficha.bc)) }))
    .filter(({ media }) => media > 0)
    .sort((x, y) => y.media - x.media)
    .slice(0, MAX_ACOES)
    .map(({ a }) => acaoDaFicha(a, facesDaArma, ficha.bc, novoId()));

  const patamar = Math.min(6, Math.max(1, patamarDaFicha(c)));
  const rank = rankDaFicha(c);
  const sobraram = ficha.acoes.length - doLivro.length;

  return {
    nome: ficha.nome,
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
      sobraram > 0 ? `${sobraram} habilidade${sobraram > 1 ? "s" : ""} de dano ficaram de fora (as mais fracas).` : "",
      "Os números vieram da ficha, não do molde do Apêndice G.",
    ]
      .filter(Boolean)
      .join(" "),
    acoes: [basico, ...doLivro],
    portrait: c.portrait,
  };
}
