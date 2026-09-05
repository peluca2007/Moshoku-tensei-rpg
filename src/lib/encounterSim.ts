/**
 * Grupo × criaturas: o cenário hipotético que o Mestre testa antes da sessão.
 *
 * O playtest de `scripts/simular-combate.mts` responde "estas dez builds são
 * equilibradas entre si?". Esta camada responde a outra pergunta, que é a da
 * mesa: "eu montei ESTE bicho pra ESTES cinco jogadores — eu acabei de matar
 * todo mundo?". As duas rodam no mesmo motor (`combatSim.ts`) de propósito.
 */
import {
  Alvo,
  EstadoPersonagem,
  FichaCombate,
  Rng,
  aoIniciarRodada,
  consumirReacao,
  d20,
  d20Ajustado,
  makeRng,
  mediaFormula,
  montarFicha,
  novoEstado,
  rolarFormula,
  temDano,
  tickChamas,
  turnoPersonagem,
} from "@/lib/combatSim";
import { PapelCriatura, getMoldePorPatamar, rodadasDoChefe } from "@/data/bestiary";
import { CharacterData } from "@/lib/types";

/** Quantas Ações um turno tem, pra criatura e pra personagem igual (Cap. 5). */
export const ACOES_POR_TURNO = 3;

/**
 * Uma "coisinha" da criatura: um ataque, um sopro, uma investida.
 *
 * Até 2026-09-03 a criatura era sete números soltos, e o mais importante deles
 * — `danoPorTurno` — era um ORÇAMENTO: a simulação entregava aquele total se
 * acertasse, sem nunca perguntar com o quê. Isso basta pra dizer se um encontro
 * é justo, e não basta pra nada do que acontece na mesa: o Mestre precisa saber
 * o que ele lê em voz alta, quantas Ações custa e quanto rola.
 *
 * A criatura com ações declaradas passa a ser resolvida com rolagem de verdade.
 * A sem ações continua no orçamento fixo — é ele que preserva a calibragem
 * publicada do Apêndice G, e apagá-lo invalidaria os números do playtest.
 */
export interface AcaoCriatura {
  id: string;
  nome: string;
  /** Custo em Ações do turno de três (Cap. 5). */
  acoes: number;
  /** Fórmula como o Mestre escreve numa ficha de monstro: "4d8+5". Vazia = manobra sem dano. */
  dano: string;
  alcance: string;
  /** true = atinge todos os alvos vivos de uma vez. */
  area: boolean;
  /** "ataque" rola contra a CA; "resistencia" pede teste ao alvo (metade do dano se ele passar). */
  tipo: "ataque" | "resistencia";
  /**
   * As quatro condições que a simulação SABE aplicar, estruturadas em vez de
   * texto (2026-09-05) — o mesmo tratamento que `combatSim.ts` já dava a
   * Molhado do lado do personagem (`Acao.aplicaMolhado`), agora do lado da
   * criatura. Opcionais porque uma ação escrita antes desta mudança (ou uma
   * criatura pronta do Apêndice G que ainda não foi revisada) não tem por que
   * quebrar o tipo — `undefined` se lê como "não aplica", igual `false`.
   *
   * Só estas quatro: o resto do que uma ação pode fazer (Atolado, voar,
   * recuar sem provocar oportunidade...) continua sendo o `nota` de baixo,
   * que a simulação não lê.
   */
  aplicaPreso?: boolean;
  aplicaCaido?: boolean;
  aplicaMolhado?: boolean;
  aplicaVeneno?: boolean;
  /** Condição, veneno, gatilho — a anotação do Mestre. O que os quatro campos acima NÃO cobrem. */
  nota: string;
}

/** Uma criatura montada pelo Mestre, pronta pra entrar no encontro. */
export interface CriaturaEncontro {
  id: string;
  nome: string;
  patamar: number;
  papel: PapelCriatura;
  pv: number;
  ca: number;
  bonusAtaque: number;
  danoPorTurno: number;
  cdResistencia: number;
  /** Quantas cópias idênticas desta criatura entram no encontro. */
  quantidade: number;
  /** O que a torna perigosa além dos números — a coluna do Apêndice G. Não é simulado. */
  perigo: string;
  /**
   * As ações dela. Vazio = a simulação usa `danoPorTurno` como orçamento fixo;
   * com ao menos uma ação de dano, ela rola cada uma de verdade.
   */
  acoes: AcaoCriatura[];
  /**
   * A cara da criatura, mesmo formato de `CharacterData.portrait` (data URL,
   * já reduzido por `prepararImagem`) — reaproveita a infra de imagem da
   * ficha em vez de inventar outra. Opcional: o Mestre monta muito monstro
   * sem arte própria, e "sem retrato" é a ausência da chave, não um erro.
   */
  portrait?: string;
}

/** Só as ações que causam dano — as outras são manobras que a simulação não modela. */
export function acoesOfensivas(c: CriaturaEncontro): AcaoCriatura[] {
  return c.acoes.filter((a) => temDano(a.dano));
}

/** true = esta criatura é resolvida por rolagem, não por orçamento. */
export function usaAcoes(c: CriaturaEncontro): boolean {
  return acoesOfensivas(c).length > 0;
}

/**
 * O turno da criatura montado a partir das ações dela, gulosamente.
 *
 * Mesma regra que o motor já aplica ao personagem (`escolherAcao`): gasta as
 * três Ações no melhor dano médio POR AÇÃO que couber no que sobrou. Não é uma
 * tática — é a única escolha que não precisa ser inventada, e é a mesma dos
 * dois lados da mesa, o que mantém a comparação honesta.
 */
export function planoDoTurno(c: CriaturaEncontro, acoesDisponiveis = ACOES_POR_TURNO): AcaoCriatura[] {
  const ofensivas = acoesOfensivas(c);
  if (ofensivas.length === 0) return [];
  const plano: AcaoCriatura[] = [];
  let restam = acoesDisponiveis;
  let guarda = 0;
  while (restam > 0 && guarda++ < 12) {
    const cabem = ofensivas.filter((a) => Math.max(1, a.acoes) <= restam);
    if (cabem.length === 0) break;
    const melhor = cabem.reduce((m, a) =>
      mediaFormula(a.dano) / Math.max(1, a.acoes) > mediaFormula(m.dano) / Math.max(1, m.acoes) ? a : m
    );
    plano.push(melhor);
    restam -= Math.max(1, melhor.acoes);
  }
  return plano;
}

/**
 * O dano médio que as ações entregam numa rodada, ANTES da rolagem de acerto.
 *
 * É a grandeza comparável com a coluna "Dano por Turno" do Apêndice G — que
 * também é pré-acerto. Comparar o dano das ações já descontado da chance de
 * acertar com um número de tabela que não desconta nada faria toda criatura
 * montada parecer fraca.
 */
export function danoDasAcoesPorRodada(c: CriaturaEncontro): number {
  return planoDoTurno(c).reduce((s, a) => s + mediaFormula(a.dano), 0);
}

/**
 * Aplica o papel do Apêndice G ao molde do patamar.
 *
 * Os três papéis não são sabor: "Ajustando pra cima ou pra baixo" define cada
 * um como uma transformação numérica. Passar por aqui garante que uma criatura
 * criada na tela e uma citada no livro respondam pela mesma conta.
 */
export function aplicarPapel(patamar: number, papel: PapelCriatura) {
  const molde = getMoldePorPatamar(patamar);
  if (papel === "lacaio") {
    return { pv: Math.round(molde.pv / 2), danoPorTurno: Math.round(molde.danoPorTurno / 2) };
  }
  if (papel === "chefe") {
    return { pv: molde.pv * 2, danoPorTurno: molde.danoPorTurno };
  }
  return { pv: molde.pv, danoPorTurno: molde.danoPorTurno };
}

/** Uma criatura nova já com os números do molde preenchidos. */
export function criaturaDoMolde(
  patamar: number,
  papel: PapelCriatura,
  nome: string,
  id: string
): CriaturaEncontro {
  const molde = getMoldePorPatamar(patamar);
  const { pv, danoPorTurno } = aplicarPapel(patamar, papel);
  return {
    id,
    nome,
    patamar,
    papel,
    pv,
    ca: molde.ca,
    bonusAtaque: molde.bonusAtaque,
    danoPorTurno,
    cdResistencia: molde.cdResistencia,
    quantidade: papel === "chefe" ? 1 : papel === "lacaio" ? 4 : 2,
    perigo: "",
    acoes: [],
  };
}

interface EstadoCriatura extends Alvo {
  fonte: CriaturaEncontro;
  bonusAtaque: number;
  danoPorTurno: number;
  cdResistencia: number;
  /** Rodadas inteiras que ela joga por rodada da mesa (chefe age mais de uma vez). */
  rodadas: number;
  /** Multiplicador de PV e dano vindo do ajuste automático. */
  escala: number;
}

/**
 * O turno da criatura SEM ações declaradas — o modelo de orçamento.
 *
 * Ela não escolhe nada: entrega `danoPorTurno` do Apêndice G, repartido entre
 * os alvos vivos na ordem do grupo, gastando uma rolagem de ataque por alvo. O
 * excedente de um alvo derrubado transborda pro próximo em vez de se perder —
 * é a abstração que faz "dano por turno" significar o mesmo aqui e na tabela.
 */
function turnoPorOrcamento(c: EstadoCriatura, alvos: Alvo[], rng: Rng): void {
  let restante = c.danoPorTurno * c.rodadas;
  for (const alvo of alvos) {
    if (restante <= 0) break;
    if (!alvo.vivo) continue;
    if (d20(rng) + c.bonusAtaque < alvo.ca) continue;
    const golpe = Math.min(restante, alvo.pv);
    alvo.pv -= golpe;
    c.danoCausado += golpe;
    restante -= golpe;
    if (alvo.pv <= 0) alvo.vivo = false;
  }
}

/** Aplica dano a um alvo e derruba se zerar. Um lugar só, pra contabilidade não divergir. */
function bater(c: EstadoCriatura, alvo: Alvo, dano: number): void {
  if (dano <= 0) return;
  const golpe = Math.min(dano, alvo.pv);
  alvo.pv -= golpe;
  c.danoCausado += golpe;
  if (alvo.pv <= 0) alvo.vivo = false;
}

/**
 * Uma ação da criatura contra um alvo.
 *
 * Segue as MESMAS regras que `resolver` aplica ao personagem, de propósito: 1
 * natural erra, 20 natural rola os dados de novo, e o teste de resistência
 * bem-sucedido corta o dano pela metade em vez de anulá-lo. Um monstro que
 * jogasse por regras próprias tornaria o veredito incomparável com o playtest.
 *
 * As quatro condições (`aplicaPreso`/`aplicaCaido`/`aplicaMolhado`/
 * `aplicaVeneno`) entram na MESMA rolagem: Preso e Caído dão Vantagem a quem
 * ataca o alvo depois, e Preso/Caído/Envenenado tiram a Vantagem de quem já
 * está com uma delas — a leitura de `combatSim.ts#resolver`, espelhada.
 * Molhado aplica sempre que o golpe acerta ou o alvo é atingido em área
 * (mesmo comportamento que o lado do personagem já tinha); Preso, Caído e
 * Veneno só pegam quando o alvo FALHA no teste de resistência — Molhado é "a
 * água te alcançou", as outras três são "você não escapou a tempo", e são
 * coisas diferentes.
 */
function resolverAcaoCriatura(
  c: EstadoCriatura,
  acao: AcaoCriatura,
  alvo: EstadoPersonagem,
  rng: Rng
): void {
  const vantagem = alvo.preso || alvo.caido;
  const desvantagem = c.preso || c.caido || c.envenenado;
  let dano: number;
  let alvoFalhou = true;
  if (acao.tipo === "ataque") {
    const rolagem = d20Ajustado(rng, vantagem, desvantagem);
    if (rolagem === 1) return;
    if (rolagem !== 20 && rolagem + c.bonusAtaque < alvo.ca) return;
    dano = rolarFormula(acao.dano, rng);
    if (rolagem === 20) dano += rolarFormula(acao.dano, rng);
  } else {
    dano = rolarFormula(acao.dano, rng);
    // O bônus de resistência do personagem é metade do Bônus de Combate dele,
    // a mesma conta que o motor já usa quando quem resiste é a criatura.
    // Envenenado cobra Desvantagem em "testes de atributo" — resistir entra
    // nisso.
    const resistiu = d20Ajustado(rng, false, alvo.envenenado) + Math.ceil(alvo.ficha.bc / 2) >= c.cdResistencia;
    if (resistiu) dano = Math.floor(dano / 2);
    alvoFalhou = !resistiu;
  }
  bater(c, alvo, Math.round(dano * c.escala));
  if (acao.aplicaMolhado) alvo.molhado = true;
  if (alvoFalhou) {
    if (acao.aplicaPreso) alvo.preso = true;
    if (acao.aplicaCaido) alvo.caido = true;
    if (acao.aplicaVeneno) alvo.envenenado = true;
  }
}

/**
 * O turno da criatura COM ações declaradas.
 *
 * Três Ações por rodada, gastas pelo mesmo critério guloso do personagem. Ação
 * em área pega todo mundo que está de pé; ação normal vai no primeiro alvo
 * vivo, que é a mesma abstração de foco que o orçamento já usava.
 */
function turnoPorAcoes(c: EstadoCriatura, alvos: EstadoPersonagem[], rng: Rng): void {
  for (let rodada = 0; rodada < c.rodadas; rodada++) {
    for (const acao of planoDoTurno(c.fonte)) {
      const vivos = alvos.filter((a) => a.vivo);
      if (vivos.length === 0) return;
      for (const alvo of acao.area ? vivos : [vivos[0]]) {
        resolverAcaoCriatura(c, acao, alvo, rng);
      }
    }
  }
}

function turnoCriatura(c: EstadoCriatura, alvos: EstadoPersonagem[], rng: Rng): void {
  if (!c.vivo) return;
  if (usaAcoes(c.fonte)) turnoPorAcoes(c, alvos, rng);
  else turnoPorOrcamento(c, alvos, rng);
}

/**
 * A Reação (ou ação lendária) do chefe: 1 golpe avulso, fora do turno normal
 * dele, gasto pelo gancho de `combatSim.ts` (`aoIniciarRodada`/`consumirReacao`)
 * logo depois do turno de um herói.
 *
 * Uma Reação de verdade não para pra escolher a MELHOR opção entre todas —
 * ela dispara com o que está pronto pra usar na hora. Por isso o critério aqui
 * é só "a melhor de 1 Ação", nunca um combo de 2 ou 3 como o turno normal
 * (`planoDoTurno`) monta.
 *
 * Criatura sem ações declaradas (orçamento fixo) não tem "a melhor de 1 Ação"
 * pra escolher — ela belisca um terço do próprio Dano/turno, a mesma fração
 * que 1 das 3 Ações do turno normal representaria.
 */
function reagirComoChefe(c: EstadoCriatura, alvos: EstadoPersonagem[], rng: Rng): void {
  const vivos = alvos.filter((a) => a.vivo);
  if (vivos.length === 0) return;

  if (usaAcoes(c.fonte)) {
    const candidatas = acoesOfensivas(c.fonte).filter((a) => Math.max(1, a.acoes) <= 1);
    if (candidatas.length === 0) return; // nada que caiba numa Reação — ela não dispara
    const acao = candidatas.reduce((m, a) => (mediaFormula(a.dano) > mediaFormula(m.dano) ? a : m));
    for (const alvo of acao.area ? vivos : [vivos[0]]) resolverAcaoCriatura(c, acao, alvo, rng);
    return;
  }

  const alvo = vivos[0];
  if (d20(rng) + c.bonusAtaque < alvo.ca) return;
  bater(c, alvo, Math.max(1, Math.round((c.danoPorTurno * c.escala) / ACOES_POR_TURNO)));
}

export interface ResultadoEncontro {
  batalhas: number;
  /** Fração de batalhas em que o grupo derrubou tudo. 0 a 1. */
  vitorias: number;
  /** Fração em que o grupo inteiro caiu. */
  tpk: number;
  /** Fração que estourou o limite de rodadas sem decisão. */
  empates: number;
  rodadasMedia: number;
  /** Média de personagens a 0 PV ao fim da batalha. */
  quedasMedia: number;
  /** PV do grupo sobrando ao fim, em fração da reserva total. */
  pvRestante: number;
  porPersonagem: { id: string; nome: string; danoMedio: number; sobreviveu: number }[];
}

export interface OpcoesEncontro {
  batalhas?: number;
  semente?: number;
  maxRodadas?: number;
  /** Multiplica PV e dano de todas as criaturas — usado pelo ajuste automático. */
  escala?: number;
}

/**
 * Roda o encontro N vezes e devolve as médias.
 *
 * As fichas são derivadas UMA vez (`montarFicha`) e só o estado mutável é
 * recriado por batalha: derivar dentro do laço chamava os seletores centenas de
 * vezes por ficha e era o gargalo da tela.
 */
export function simularEncontro(
  grupo: CharacterData[],
  criaturas: CriaturaEncontro[],
  opcoes: OpcoesEncontro = {}
): ResultadoEncontro {
  const batalhas = opcoes.batalhas ?? 400;
  const maxRodadas = opcoes.maxRodadas ?? 20;
  const escala = opcoes.escala ?? 1;
  const rng = makeRng(opcoes.semente ?? 20260903);

  const fichas: FichaCombate[] = grupo.map((c) => montarFicha(c));
  const rodadasChefe = rodadasDoChefe(grupo.length);

  let vitorias = 0;
  let tpks = 0;
  let empates = 0;
  let somaRodadas = 0;
  let somaQuedas = 0;
  let somaPvRestante = 0;
  const pvTotalGrupo = fichas.reduce((s, f) => s + f.pvMax, 0) || 1;
  const dano = new Map<string, number>();
  const viveu = new Map<string, number>();

  for (let b = 0; b < batalhas; b++) {
    const heroes: EstadoPersonagem[] = fichas.map(novoEstado);
    const inimigos: EstadoCriatura[] = [];
    for (const criatura of criaturas) {
      for (let i = 0; i < criatura.quantidade; i++) {
        inimigos.push({
          fonte: criatura,
          nome: criatura.quantidade > 1 ? `${criatura.nome} ${i + 1}` : criatura.nome,
          pv: Math.max(1, Math.round(criatura.pv * escala)),
          ca: criatura.ca,
          bonusAtaque: criatura.bonusAtaque,
          danoPorTurno: Math.max(1, Math.round(criatura.danoPorTurno * escala)),
          cdResistencia: criatura.cdResistencia,
          // A escala do ajuste automático multiplica o orçamento de uma vez, e
          // o dano de cada ação na hora de bater — as duas pontas escalam junto.
          escala,
          rodadas: criatura.papel === "chefe" ? rodadasChefe : 1,
          vivo: true,
          molhado: false,
          emChamas: 0,
          preso: false,
          caido: false,
          envenenado: false,
          reacaoDisponivel: false,
          danoCausado: 0,
        });
      }
    }

    // Iniciativa: o personagem rola d20 + Agilidade. O Apêndice G não dá
    // Iniciativa nenhuma à criatura, então ela rola o d20 puro — inventar um
    // bônus aqui seria criar regra dentro do simulador.
    const ordem = [
      ...heroes.map((h) => ({ tipo: "heroi" as const, h, i: d20(rng) + h.ficha.iniciativa })),
      ...inimigos.map((c) => ({ tipo: "criatura" as const, c, i: d20(rng) })),
    ].sort((x, y) => y.i - x.i);

    let rodada = 0;
    for (; rodada < maxRodadas; rodada++) {
      // Reação/ação lendária do chefe: rearma no início da rodada da mesa —
      // só o chefe tem essa economia de ação extra fora do turno normal dele
      // (Apêndice G, "Ajustando pra cima"). Um lacaio ou um padrão não ganham
      // este golpe avulso.
      for (const inimigo of inimigos) aoIniciarRodada(inimigo, inimigo.fonte.papel === "chefe");

      for (const p of ordem) {
        if (p.tipo === "heroi") {
          if (!p.h.vivo || !tickChamas(p.h, rng)) continue;
          turnoPersonagem(p.h, inimigos, rng);
          // O chefe reage ao turno que acabou de passar — 1 vez por rodada da
          // mesa, não 1 vez por herói: a Reação já foi gasta depois do primeiro
          // herói que agiu, e os seguintes passam por `consumirReacao` sem
          // disparar nada.
          for (const inimigo of inimigos) {
            if (inimigo.vivo && consumirReacao(inimigo)) reagirComoChefe(inimigo, [p.h], rng);
          }
        } else {
          if (!p.c.vivo || !tickChamas(p.c, rng)) continue;
          turnoCriatura(p.c, heroes, rng);
        }
      }
      if (inimigos.every((c) => !c.vivo)) break;
      if (heroes.every((h) => !h.vivo)) break;
    }

    const grupoVivo = heroes.some((h) => h.vivo);
    const inimigoVivo = inimigos.some((c) => c.vivo);
    if (!inimigoVivo) vitorias++;
    else if (!grupoVivo) tpks++;
    else empates++;

    somaRodadas += Math.min(rodada + 1, maxRodadas);
    somaQuedas += heroes.filter((h) => !h.vivo).length;
    somaPvRestante += heroes.reduce((s, h) => s + Math.max(0, h.pv), 0);
    for (const h of heroes) {
      dano.set(h.ficha.id, (dano.get(h.ficha.id) ?? 0) + h.danoCausado);
      if (h.vivo) viveu.set(h.ficha.id, (viveu.get(h.ficha.id) ?? 0) + 1);
    }
  }

  return {
    batalhas,
    vitorias: vitorias / batalhas,
    tpk: tpks / batalhas,
    empates: empates / batalhas,
    rodadasMedia: somaRodadas / batalhas,
    quedasMedia: somaQuedas / batalhas,
    pvRestante: somaPvRestante / batalhas / pvTotalGrupo,
    porPersonagem: fichas.map((f) => ({
      id: f.id,
      nome: f.nome,
      danoMedio: (dano.get(f.id) ?? 0) / batalhas,
      sobreviveu: (viveu.get(f.id) ?? 0) / batalhas,
    })),
  };
}
