import { CharacterData, RANK_BONUS } from "./types";
import { AcaoCriatura, CriaturaEncontro, PerfilDeFicha } from "./encounterSim";
import { Acao, type FichaCombate, mediaDados, mediaFormula, modificadorFixo, montarFicha, patamarDaFicha } from "./combatSim";
import { getAttackBonus, getFinalAttribute, getFinalAttributes, getHighestUnlockedRank, getPpPool, getSpellDC, getPaSpent, getTreeAttributeKey, getTreeGrantedSkills } from "@/store/selectors";
import { getTreeById } from "@/data/trees/index";
import { getRaceById } from "@/data/races";
import { getBackgroundById, getSubtableEntryById } from "@/data/backgrounds";
import { getCombinedSpellById } from "@/data/combinedSpells";
import { rankDaFicha } from "./combatSim";
import { pactosDeCombate } from "./combatSummons";

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
 * O molde do Apêndice G fica de fora: uma ficha de personagem tem seus
 * próprios números. O cartão identifica sua origem e não sugere recalibrá-los
 * para um monstro comum.
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

function danoConvertido(acao: Acao, ficha: FichaCombate, bc = ficha.bc): string {
  if (acao.regra === "primeiro-golpe") {
    const bonus = ficha.arma.damageBonus;
    return `${ficha.ataqueBasico.dano}+${acao.dano}${bonus >= 0 ? "+" : ""}${bonus}`;
  }
  return formulaDaAcao(acao, ficha.ataqueBasico.dano, bc);
}

function acaoDaFicha(acao: Acao, ficha: FichaCombate, id: string, bc: number, cd: number, efeito: string, ppCost = 0, danoDoLivro = ""): AcaoCriatura {
  const dano = danoConvertido(acao, ficha, bc);
  const base = (danoDoLivro || acao.dano).split(";")[0];
  const indicesFrio = [...base.matchAll(/\d+\s*d\s*\d+/gi)]
    .flatMap((dado, indice) => /^\s+de frio\b/i.test(base.slice((dado.index ?? 0) + dado[0].length)) ? [indice] : []);
  const frio = indicesFrio.length > 0 && !/já contando a duplicação/i.test(base);
  const fogo = /ígneo|plasma/i.test((danoDoLivro || acao.dano).split(";")[0]) || /\b(?:brasas|chamas)\b/i.test(acao.nome);
  const textoDeAplicacao = efeito.split(/\bSucesso\s*:/i)[0];
  const aplicaEmChamas = /(?:fica|ficam|aplica|aplicam)\s+Em Chamas|\b(?:ou|e)\s+Em Chamas\b|\bEm Chamas\s+(?:a quem falhar|automático em falha)|\bFalha\s*:[^.;]{0,100}\bEm Chamas\b/i.test(textoDeAplicacao);
  const emChamasSoNaFalha = aplicaEmChamas && !acao.ataque &&
    /\bFalha\s*:|\ba quem falhar\b|\bem falha\b|\bou Em Chamas\b|\bfalha\b[^.;]{0,100}\bEm Chamas\b/i.test(textoDeAplicacao);
  // Só o ramo de resistência tem o gatilho "falha: fica ..." resolvido pelo
  // simulador. Ataques com teste secundário ou múltiplos acertos permanecem na
  // carta: aplicar a condição no primeiro acerto mudaria a regra.
  const condicaoNaFalha = (nome: string) => {
    if (acao.ataque) return false;
    const fica = new RegExp(`\\bfic(?:a|am)\\s+${nome}\\b`, "i");
    const antesDoSucesso = efeito.split(/\bSucesso\s*:/i)[0];
    const falha = antesDoSucesso.match(/\bFalha\s*:\s*([^.;]+)/i)?.[1] ?? "";
    return (!/\bnão\s+fic(?:a|am)\b/i.test(antesDoSucesso) && fica.test(antesDoSucesso)) ||
      !!falha && new RegExp(`\\b${nome}\\b`, "i").test(falha);
  };
  return {
    id,
    regra: acao.regra === "primeiro-golpe" ? "primeiro-golpe" : undefined,
    nome: acao.nome,
    acoes: acao.acoes,
    pmCost: acao.pm || undefined,
    ptCost: acao.pt || undefined,
    ppCost: ppCost || undefined,
    cdResistencia: !acao.ataque ? cd : undefined,
    dano,
    danoPorTurno: acao.danoPorTurno || undefined,
    alcance: acao.alcance || "Corpo a corpo",
    area: acao.area,
    tipo: acao.ataque ? "ataque" : "resistencia",
    bonusAtaque: acao.regra === "primeiro-golpe" ? ficha.arma.attackBonus : bc,
    desvantagemAtaque: acao.regra === "primeiro-golpe" && !ficha.arma.proficiente,
    // O texto original do livro vai junto: a tradução acima resolve o dado, e
    // não resolve "empurra 3m" nem "ignora armadura". Quem lê a
    // carta na mesa é o Mestre, e ele merece a frase inteira.
    nota: acao.regra === "primeiro-golpe"
      ? `Uma vez por combate contra alvo Desprevenido. Parcela especial: ${acao.dano}; Dano Furtivo normal entra no primeiro acerto elegível do turno. ${efeito}`.trim()
      : [acao.dano === dano ? "" : `No livro: ${acao.dano}`, efeito].filter(Boolean).join(" · "),
    aplicaPreso: acao.aplicaPreso || condicaoNaFalha("Pres[oa]s?") || undefined,
    aplicaCaido: acao.aplicaCaido || condicaoNaFalha("Ca[ií]d[oa]s?") || undefined,
    aplicaMolhado: acao.aplicaMolhado,
    frio: frio || undefined,
    indicesFrio: frio ? indicesFrio : undefined,
    fogo: fogo || undefined,
    // A mesma regra do lado do jogador: dano ígneo acende Em Chamas, salvo se
    // o alvo estava Molhado (o primeiro golpe apenas seca a água).
    aplicaEmChamas: aplicaEmChamas || undefined,
    emChamasSoNaFalha: emChamasSoNaFalha || undefined,
    aplicaQuebrantado: acao.aplicaQuebrantado || undefined,
    aplicaVeneno: acao.aplicaVeneno || condicaoNaFalha("Envenenad[oa]s?") || undefined,
  };
}

function suporteDaFicha(acao: Acao, id: string, bc: number, efeito: string, ppCost = 0): AcaoCriatura {
  return {
    id, nome: acao.nome, acoes: acao.acoes, dano: "", tipo: acao.tipo === "cura" ? "cura" : "escudo",
    formulaSuporte: acao.formulaSuporte, bonusSuporte: bc, sempreFresca: acao.sempreFresca || undefined,
    alcance: acao.alcance || "Toque", area: acao.area, nota: efeito,
    pmCost: acao.pm || undefined, ptCost: acao.pt || undefined, ppCost: ppCost || undefined,
  };
}

function perfilDaFicha(c: CharacterData, ficha: FichaCombate, simuladas: Set<string>): PerfilDeFicha {
  const raca = getRaceById(c.raceId);
  const antecedente = getBackgroundById(c.backgroundId);
  const subtable = antecedente?.requiresSubtable
    ? getSubtableEntryById(antecedente.requiresSubtable, c.subtableEntryId) : undefined;
  const habilidades: PerfilDeFicha["habilidades"] = [];
  const incluir = (nome: string, origem: string, tipo: string, efeito: string, custo = "") =>
    habilidades.push({ nome, origem, tipo, efeito, custo });
  const incluirTraco = (traco: string, origem: string) =>
    incluir(traco.includes(":") ? traco.slice(0, traco.indexOf(":")) : traco.slice(0, 60), origem, "Traço", traco);
  for (const traco of raca?.traits ?? []) incluirTraco(traco, raca?.name ?? "Raça");
  for (const traco of antecedente?.traits ?? []) incluirTraco(traco, antecedente?.name ?? "Antecedente");
  for (const traco of subtable?.traits ?? []) incluirTraco(traco, subtable?.name ?? "Origem");
  for (const id of c.racialUpgrades ?? []) {
    const upgrade = raca?.upgrades?.find((u) => u.id === id);
    if (upgrade) incluir(upgrade.name, raca?.name ?? "Raça", "Melhoria", upgrade.description);
  }
  for (const desbloqueio of c.unlockedRanks) {
    const rank = getTreeById(desbloqueio.treeId)?.ranks.find((r) => r.rank === desbloqueio.rank);
    if (rank?.mastery) incluir(rank.mastery.name, getTreeById(desbloqueio.treeId)?.name ?? desbloqueio.treeId, "Maestria", rank.mastery.description);
  }
  for (const compra of c.purchasedAbilities) {
    const arvore = getTreeById(compra.treeId);
    const rank = arvore?.ranks.find((r) => r.rank === compra.rank);
    if (compra.kind === "talent") {
      const talento = rank?.talents.find((t) => t.id === compra.id);
      if (talento) incluir(talento.name, arvore?.name ?? compra.treeId, "Talento", talento.description);
    } else {
      const habilidade = rank?.abilities.find((a) => a.id === compra.id);
      if (habilidade && !simuladas.has(habilidade.name)) {
        const custos = [`${habilidade.actions.normal} Ações`, habilidade.pmCost ? `${habilidade.pmCost} PM` : "", habilidade.ptCost ? `${habilidade.ptCost} PT` : "", habilidade.ppCost ? `${habilidade.ppCost} PP` : ""].filter(Boolean);
        incluir(habilidade.name, arvore?.name ?? compra.treeId, habilidade.reaction ? "Reação" : "Habilidade", habilidade.effect, custos.join(" · "));
      }
    }
  }
  for (const id of c.purchasedCombinedSpells ?? []) {
    const magia = getCombinedSpellById(id);
    if (magia) incluir(magia.name, "Magia combinada", "Magia", magia.effect, `${magia.actions} Ações · ${magia.pmCost} PM`);
  }
  for (const acao of ficha.acoes) {
    if (!simuladas.has(acao.nome) && !habilidades.some((h) => h.nome === acao.nome))
      incluir(acao.nome, "Ficha", acao.reacao ? "Reação" : "Ação manual", acao.dano || acao.formulaSuporte || acao.gatilho || "Consulte a habilidade na ficha.", `${acao.acoes} Ações${acao.pm ? ` · ${acao.pm} PM` : ""}${acao.pt ? ` · ${acao.pt} PT` : ""}`);
  }
  const arvores = [...new Set(c.unlockedRanks.map((r) => r.treeId))].map((id) => {
    const ranks = c.unlockedRanks.filter((r) => r.treeId === id);
    return { nome: getTreeById(id)?.name ?? id, rank: ranks.at(-1)?.rank ?? "" };
  });
  const rankInvocacao = getHighestUnlockedRank(c, "invocacao");
  const comprouInvocacao = (id: string) => c.purchasedAbilities.some((a) => a.treeId === "invocacao" && a.id === id);
  const bonusInvocacao = rankInvocacao ? RANK_BONUS[rankInvocacao] : 0;
  const opcoesDePacto = bonusInvocacao ? pactosDeCombate(c).map((pacto) => {
    const pv = Math.max(1, Math.floor((pacto.pvPorRank ?? (bonusInvocacao >= 3 ? 15 : 10)) * bonusInvocacao / (pacto.quantidade > 1 ? 4 : 1)));
    const danoBonus = pacto.id === "pacto-filhote" && pacto.custo === 6
      ? getFinalAttribute(c, "espirito") + bonusInvocacao : bonusInvocacao >= 3 ? bonusInvocacao : 0;
    const dano = danoBonus ? pacto.dano.replace(/(\s*\([^)]*\))?$/, (_, tipo: string | undefined) => `+${danoBonus}${tipo ?? ""}`) : pacto.dano;
    return {
      id: pacto.id, nome: pacto.nome, patamar: Math.min(6, Math.max(1, Math.ceil(pacto.custo / 3))), custo: pacto.custo, quantidade: pacto.quantidade,
      golpes: pacto.golpes, dano, pv, ca: 10 + bonusInvocacao,
      bonusAtaque: getFinalAttribute(c, "espirito") + bonusInvocacao,
      cdVeneno: pacto.id === "pacto-serpente-de-nevoa" ? 8 + getFinalAttribute(c, "espirito") + bonusInvocacao : undefined,
      deslocamento: pacto.deslocamento ?? 9,
      resistencias: pacto.resistencia ? ["cortante", "perfurante", "contundente"] : [],
    };
  }) : [];
  const primeiroPacto = [...opcoesDePacto].filter((p) => p.custo <= ficha.pmMax)
    .sort((a, b) => mediaFormula(b.dano) * b.golpes * b.quantidade - mediaFormula(a.dano) * a.golpes * a.quantidade)[0];
  return {
    raca: raca?.name, antecedente: antecedente?.name,
    arvores, atributos: getFinalAttributes(c),
    reservas: { pm: ficha.pmMax, pt: ficha.ptMax, pp: getPpPool(c) },
    iniciativa: ficha.iniciativa, habilidades,
    fluxo: ficha.fluxoUsosMax ? { usosPorRodada: ficha.fluxoUsosMax, devolver: ficha.temDevolver } : undefined,
    aparar: ficha.temAparar ? { bonusCA: ficha.rankAgua, alcance: ficha.alcanceReacao } : undefined,
    pactos: opcoesDePacto.length ? {
      limite: bonusInvocacao, opcoes: opcoesDePacto, preparados: primeiroPacto ? [primeiroPacto.id] : [],
      emergencia: comprouInvocacao("chamado") ? {
        custoBase: comprouInvocacao("invocacao-de-emergencia") ? 4 : 7,
        acoes: comprouInvocacao("convocacao-aprimorada") ? 1 : 3,
        semPenalidade: comprouInvocacao("pacto-firmado"),
        duasVidas: comprouInvocacao("duas-vidas"),
      } : undefined,
    } : undefined,
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
  novoId: () => string,
  papel: "padrao" | "chefe" = "padrao",
): Omit<CriaturaEncontro, "id"> {
  const ficha = montarFicha(c);
  const tree = getTreeById(c.startingTreeId);
  const raca = getRaceById(c.raceId);
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
  const origemDaAcao = new Map(c.purchasedAbilities.filter((p) => p.kind === "ability").map((p) => {
    const def = getTreeById(p.treeId)?.ranks.find((r) => r.rank === p.rank)?.abilities.find((a) => a.id === p.id);
    return [def?.name, { def, treeId: p.treeId }] as const;
  }).filter(([nome]) => !!nome));
  const convertiveis = ficha.acoes
    .filter((a) => a.tipo === "dano" && !a.reacao && a.acoes >= 1 && a.acoes <= 4)
    .filter((a) => !/a quem atravess|a quem tocar|quem (?:te )?atingir|a quem começar o turno/i
      .test(origemDaAcao.get(a.nome)?.def?.damage?.normal ?? ""))
    .map((a) => {
      const treeId = origemDaAcao.get(a.nome)?.treeId ?? c.startingTreeId;
      const attr = getTreeAttributeKey(c, treeId, "forca");
      const bc = treeId ? getAttackBonus(c, treeId, attr) : ficha.bc;
      return { a, bc, treeId, media: mediaFormula(danoConvertido(a, ficha, bc)) };
    })
    .filter(({ a, media }) => media > 0 || /\bou Em Chamas\b/i.test(origemDaAcao.get(a.nome)?.def?.effect ?? ""))
    .sort((x, y) => y.media - x.media);
  const doLivro = convertiveis.map(({ a, bc, treeId }) => {
    const def = origemDaAcao.get(a.nome)?.def;
    return acaoDaFicha(a, ficha, novoId(), bc, treeId ? getSpellDC(c, treeId, getTreeAttributeKey(c, treeId, "forca")) : 8, def?.effect ?? "", def?.ppCost, def?.damage?.normal);
  });
  // Chuva de Brasas não tem linha de dano e, por isso, o derivador do lado
  // do jogador não a lista entre as ações ofensivas. No encontro, seu teste
  // e Em Chamas ainda precisam acontecer.
  const chuvaComprada = origemDaAcao.get("Chuva de Brasas")?.def;
  const chuvaDeBrasas: AcaoCriatura[] = chuvaComprada ? [{
    id: novoId(), nome: chuvaComprada.name, acoes: chuvaComprada.actions.normal,
    pmCost: chuvaComprada.pmCost, ptCost: chuvaComprada.ptCost, ppCost: chuvaComprada.ppCost,
    dano: "", alcance: chuvaComprada.range, area: true, tipo: "resistencia",
    cdResistencia: getSpellDC(c, "fogo", getTreeAttributeKey(c, "fogo", "forca")),
    fogo: true, aplicaEmChamas: true, emChamasSoNaFalha: true, nota: chuvaComprada.effect,
  }] : [];
  const suportes = ficha.acoes
    .filter((a) => (a.tipo === "cura" || a.tipo === "escudo") && !a.reacao &&
      a.acoes >= 1 && a.acoes <= 4 && mediaDados(a.formulaSuporte) > 0)
    .map((a) => {
      const origem = origemDaAcao.get(a.nome);
      const treeId = origem?.treeId ?? c.startingTreeId;
      const atributo = getTreeAttributeKey(c, treeId, "forca");
      const bc = treeId ? getAttackBonus(c, treeId, atributo) : ficha.bc;
      return suporteDaFicha(a, novoId(), bc, origem?.def?.effect ?? "", origem?.def?.ppCost);
    });

  const patamar = Math.min(6, Math.max(1, patamarDaFicha(c)));
  const rank = rankDaFicha(c);
  const convertidas = new Set([...convertiveis.map(({ a }) => a.nome), ...suportes.map((a) => a.nome), ...chuvaDeBrasas.map((a) => a.nome)]);
  const perfilDeFicha = perfilDaFicha(c, ficha, convertidas);

  return {
    nome: ficha.nome,
    dadosFurtivos: ficha.rankLadino || undefined,
    temPassoVazio: ficha.temPassoVazio || undefined,
    patamar,
    papel,
    pv: ficha.pvMax * (papel === "chefe" ? 2 : 1),
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
      perfilDeFicha.habilidades.length > 0 ? "O Perfil da ficha guarda habilidades que não viram ataques automáticos; aplique seus efeitos narrativos e de suporte na mesa." : "",
      ficha.temPassoVazio ? "Passo Vazio consome 1 Ação, uma vez por combate, e reabre Primeiro Golpe na ação seguinte." : "",
      `Os números vieram da ficha, não do molde (Apêndice G, "Rivais com ficha"). Bônus de Rank: +${patamar}.`,
    ]
      .filter(Boolean)
      .join(" "),
    acoes: [basico, ...doLivro, ...chuvaDeBrasas, ...suportes],
    portrait: c.portrait,
    perfilDeFicha,
    bonusResistencia: ficha.resistencia,
    bonusIniciativa: ficha.iniciativa,
    deslocamento: ficha.deslocamento,
    pericias: [...new Set([...(c.skills ?? []), ...(raca?.fixedSkills ?? []), ...(getBackgroundById(c.backgroundId)?.fixedSkills ?? []), ...getTreeGrantedSkills(c)])],
    resistencias: ficha.resistencias,
    imunidades: ficha.imunidades,
  };
}
