/**
 * Grupo × criaturas: o cenário hipotético que o Mestre testa antes da sessão.
 *
 * Esta camada responde à pergunta da mesa: "eu montei ESTE bicho pra ESTES
 * cinco jogadores — eu acabei de matar todo mundo?". Ela usa o mesmo motor
 * (`combatSim.ts`) do comparador de builds.
 */
import {
  Alvo,
  EstadoPersonagem,
  FichaCombate,
  Rng,
  aoIniciarRodada,
  consumirReacao,
  d20,
  makeRng,
  mediaFormula,
  montarFicha,
  aplicarDano,
  novoAlvo,
  novoEstado,
  temDano,
  tickChamas,
  tickSustentado,
  turnoPersonagem,
} from "@/lib/combatSim";
import { PapelCriatura, aplicarPapel, getMoldePorPatamar, percepcaoPassiva, rodadasDoChefe } from "@/data/bestiary";
import { aplicarEstadoInicial, aproximar, alcanceEmMetros, distanciaEntre, type CenarioCombate } from "./combatScenario";
import { prepararInvocados } from "./combatSummons";
import { caDepoisDeAparar, guardaDoCorpo, reagirComFluxo } from "./combatReactions";
import { CharacterData } from "@/lib/types";
import {
  rolarComRegistro, rolarCriticoComRegistro, rolarD20ComRegistro, formatarEventoAtaque,
  type EventoAtaque, type RegistroCombate,
} from "./combatTrace";

/**
 * O Bônus de Rank de uma criatura, pro que depende de "quem te acertou" — CD
 * do Fio da Vida (8 + Bônus) e da Concentração (10 + Bônus).
 *
 * O patamar do Apêndice G É o rank: 1º patamar = Principiante (+1), 6º =
 * Imperador (+6). Até a revisão do livro toda criatura batia com Bônus 2 fixo,
 * e o goblin de estrada derrubava um mago com a mesma CD de um Rei-Demônio.
 */
export function bonusDeRankDaCriatura(patamar: number): number {
  return Math.min(6, Math.max(1, Math.round(patamar)));
}

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
  /** Técnicas de ficha que só podem abrir contra alvo Desprevenido, uma vez por combate. */
  regra?: "primeiro-golpe";
  /** Bônus próprio quando a arma do rival difere das suas magias. */
  bonusAtaque?: number;
  desvantagemAtaque?: boolean;
  id: string;
  nome: string;
  /** Custo em Ações do turno de três (Cap. 5). */
  acoes: number;
  /** Fórmula como o Mestre escreve numa ficha de monstro: "4d8+5". Vazia = manobra sem dano. */
  dano: string;
  /**
   * Multiplicador aplicado à rolagem inteira da ação. É como o ajuste
   * automático preserva a identidade da fórmula sem descalibrar críticos.
   * Ausente significa 1×, para que fichas salvas antes deste campo continuem
   * idênticas.
   */
  escalaDano?: number;
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
  /** Dados extras da maestria do Ladino, aplicados no primeiro acerto elegível do turno. */
  dadosFurtivos?: number;
  /** Passo Vazio da ficha: uma Ação, uma vez por combate, reabre Primeiro Golpe. */
  temPassoVazio?: boolean;
  /** Escolha de alvo da IA; ausente preserva a ordem de grupo dos encontros antigos. */
  tatica?: "ordem" | "aleatorio" | "fragil" | "estrategico";
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
  /**
   * A gaveta em que ela está, em `useBestiaryStore.pastas`. Ausente = fora de
   * todas as pastas, que é onde todo bestiário montado antes de 2026-09-05
   * começa.
   *
   * É organização de tela, e a simulação nunca lê este campo — mas ele mora
   * aqui, e não num mapa à parte na store, porque o dono da informação é a
   * criatura: com um `Record<criaturaId, pastaId>` paralelo, toda remoção,
   * duplicação e importação precisaria lembrar de mexer nos dois, e a primeira
   * que esquecesse deixaria uma criatura fantasma numa pasta. `empacotarCriatura`
   * leva o campo junto no arquivo; quem importa (`importarCriatura`) descarta,
   * porque um id de pasta só faz sentido no bestiário que o sorteou.
   */
  pastaId?: string;
  /**
   * O BLOCO DO MONSTRO (Apêndice G, 0.1.90) — tudo daqui pra baixo é o que a
   * mesa pergunta no meio da cena e a ficha não sabia responder.
   *
   * `arquetipo` é a segunda das duas escolhas que montam um monstro: o patamar
   * dá os números, o arquétipo diz em qual atributo eles aparecem. Ele é a
   * ÚNICA coisa guardada — atributos, Deslocamento, sentido e Percepção passiva
   * saem dele por função (`fichaDeAtributos`, `percepcaoPassiva`), porque
   * guardar derivado é como a tabela de PV do Cap. 4 envelheceu da última vez.
   */
  arquetipo?: string;
  /** Sobrescreve o Deslocamento do arquétipo, em metros. Ausente = o do arquétipo. */
  deslocamento?: number;
  /** Voo, natação, escalada — o que não é andar. */
  movimentoEspecial?: string;
  /** Tamanho (Cap. 4, §3), que decide quem pode empurrá-la. */
  tamanho?: string;
  /** Os campos em que ela tem Vantagem. O Apêndice G dá metade do patamar, pra cima. */
  pericias?: string[];
  /** Tipos de dano com Resistência (metade). De graça quando a ficção pede. */
  resistencias?: string[];
  /** Tipos de dano com Imunidade. CUSTA: conta como um patamar acima no Orçamento. */
  imunidades?: string[];
  /** Sentido que fura o Escondido, quando não é o do arquétipo. */
  sentido?: string;
}

/** Só as ações que causam dano — as outras são manobras que a simulação não modela. */
export function acoesOfensivas(c: CriaturaEncontro): AcaoCriatura[] {
  return c.acoes.filter((a) => temDano(a.dano));
}

/** true = esta criatura é resolvida por rolagem, não por orçamento. */
export function usaAcoes(c: CriaturaEncontro): boolean {
  return acoesOfensivas(c).length > 0;
}

/** Multiplicador seguro de uma ação; dados legados sem o campo valem 1×. */
export function escalaDaAcao(acao: AcaoCriatura): number {
  const escala = acao.escalaDano ?? 1;
  return Number.isFinite(escala) && escala > 0 ? escala : 1;
}

function danoMedioDaAcao(acao: AcaoCriatura): number {
  return mediaFormula(acao.dano) * escalaDaAcao(acao);
}

/**
 * O turno da criatura montado a partir das ações dela, gulosamente.
 *
 * Gasta as três Ações no melhor dano médio POR AÇÃO que couber no que sobrou.
 * Não é uma tática — é a única escolha que não precisa ser inventada.
 *
 * Aqui o critério é o dano MÉDIO, e não o dano esperado que `escolherAcao`
 * passou a usar na 0.1.35, porque este plano é montado SEM alvo: quem o chama
 * de verdade é `danoDasAcoesPorRodada`, cuja grandeza tem que ser pré-acerto
 * pra ser comparável com a coluna "Dano por Turno" do Apêndice G. Descontar a
 * chance de acertar aqui faria toda criatura montada na tela parecer fraca ao
 * lado das do livro. A assimetria é deliberada; a comparação que ela protege
 * está explicada em `danoDasAcoesPorRodada`, logo abaixo.
 */
function planoPeloValor(
  c: CriaturaEncontro,
  acoesDisponiveis: number,
  valor: (acao: AcaoCriatura) => number,
  elegivel: (acao: AcaoCriatura) => boolean = () => true,
): AcaoCriatura[] {
  const ofensivas = acoesOfensivas(c);
  if (ofensivas.length === 0) return [];
  const plano: AcaoCriatura[] = [];
  let usouPrimeiroGolpe = false;
  let restam = acoesDisponiveis;
  let guarda = 0;
  while (restam > 0 && guarda++ < 12) {
    const cabem = ofensivas.filter((a) => Math.max(1, a.acoes) <= restam && elegivel(a) &&
      !(a.regra === "primeiro-golpe" && usouPrimeiroGolpe));
    if (cabem.length === 0) break;
    const melhor = cabem.reduce((m, a) =>
      valor(a) / Math.max(1, a.acoes) > valor(m) / Math.max(1, m.acoes) ? a : m
    );
    plano.push(melhor);
    if (melhor.regra === "primeiro-golpe") usouPrimeiroGolpe = true;
    restam -= Math.max(1, melhor.acoes);
  }
  return plano;
}

/**
 * O plano usado para comparar a régua do Apêndice G.
 *
 * A área não multiplica dano aqui porque a coluna Dano por Turno descreve uma
 * criatura contra um alvo abstrato; contar o grupo inteiro faria uma ação em
 * área parecer artificialmente acima do molde antes de haver uma mesa.
 */
export function planoDoTurno(c: CriaturaEncontro, acoesDisponiveis = ACOES_POR_TURNO): AcaoCriatura[] {
  return planoPeloValor(c, acoesDisponiveis, danoMedioDaAcao);
}

/**
 * O plano usado dentro do combate, onde área vale contra quem ela realmente
 * alcança. Sem esta separação, Conjurador e Mente escolhiam sempre o dardo de
 * alvo único: a explosão de 2 Ações rende um pouco menos POR Ação contra uma
 * pessoa, mas muito mais contra o grupo.
 */
export function planoDeCombate(
  c: CriaturaEncontro,
  alvosNaArea: number,
  acoesDisponiveis = ACOES_POR_TURNO,
  elegivel?: (acao: AcaoCriatura) => boolean,
): AcaoCriatura[] {
  return planoPeloValor(c, acoesDisponiveis, (acao) =>
    danoMedioDaAcao(acao) * (acao.area ? Math.max(1, alvosNaArea) : 1), elegivel
  );
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
  return planoDoTurno(c).reduce((s, a) => s + danoMedioDaAcao(a), 0);
}

/**
 * Aplica o papel do Apêndice G ao molde do patamar.
 *
 * Mudou de casa em 0.1.90: era daqui, e passou a morar em `bestiary.ts`, junto
 * do resto do Apêndice G. O motivo é a regra do projeto — isto é REGRA DO
 * LIVRO ("Ajustando pra cima ou pra baixo"), e o livro não pode depender da
 * ferramenta. Quem precisou dela lá foi `acoesSugeridas`, que distribui o
 * orçamento de dano do papel em Ações: se a conta ficasse aqui, o dado do livro
 * passaria a importar do simulador.
 *
 * O reexport continua porque meia dúzia de arquivos a chamam por este caminho,
 * e trocar o import de todos não deixaria nada mais claro.
 */
export { aplicarPapel };

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
    // O arquétipo padrão é o Bruto porque ele é o monstro que a mesa mais usa e
    // o mais fácil de reconhecer sem ler nada — e porque um monstro SEM
    // arquétipo sai com os cinco atributos iguais, que é o bloco genérico que
    // esta versão existe pra acabar. Trocar é um clique.
    arquetipo: "bruto",
    tamanho: "Médio",
  };
}

interface EstadoCriatura extends Alvo {
  usouPrimeiroGolpe: boolean;
  usouPassoVazio: boolean;
  usouFurtivo: boolean;
  fonte: CriaturaEncontro;
  bonusAtaque: number;
  danoPorTurno: number;
  cdResistencia: number;
  /** Rodadas inteiras que ela joga por rodada da mesa (chefe age mais de uma vez). */
  rodadas: number;
  /** Multiplicador de PV e dano vindo do ajuste automático. */
  escala: number;
}

function aberturaDoRival(c: EstadoCriatura, alvo: Alvo): boolean {
  return c.escondido || alvo.surpreso || !alvo.jaAgiu;
}

function furtivoDoRival(c: EstadoCriatura, alvo: Alvo): boolean {
  return aberturaDoRival(c, alvo) || alvo.cego || alvo.preso ||
    (alvo.caido && !(c.preso || c.caido || c.envenenado));
}

/**
 * O turno da criatura SEM ações declaradas — o modelo de orçamento.
 *
 * Ela não escolhe nada: entrega `danoPorTurno` do Apêndice G, repartido entre
 * os alvos vivos na ordem do grupo, gastando uma rolagem de ataque por alvo. O
 * excedente de um alvo derrubado transborda pro próximo em vez de se perder —
 * é a abstração que faz "dano por turno" significar o mesmo aqui e na tabela.
 */
export function ordenarAlvosDaCriatura<T extends Alvo>(alvos: T[], tatica: CriaturaEncontro["tatica"], rng: Rng): T[] {
  const vivos = alvos.filter((a) => a.vivo);
  if (tatica === "fragil") return vivos.sort((a, b) => a.pv + a.pvTemp - (b.pv + b.pvTemp));
  if (tatica === "estrategico") return vivos.sort((a, b) => a.ca - a.quebrantado - (b.ca - b.quebrantado) || a.pv - b.pv);
  if (tatica === "aleatorio") {
    for (let i = vivos.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [vivos[i], vivos[j]] = [vivos[j], vivos[i]];
    }
  }
  return vivos;
}

function turnoPorOrcamento(c: EstadoCriatura, alvos: Alvo[], rng: Rng, logger?: RegistroCombate): void {
  let restante = c.danoPorTurno * c.rodadas / (c.surpreso ? 3 : 1);
  for (const alvo of ordenarAlvosDaCriatura(alvos, c.fonte.tatica, rng)) {
    if (restante <= 0) break;
    if (!alvo.vivo) continue;
    const teste = rolarD20ComRegistro(rng);
    const ca = Math.max(1, alvo.ca - alvo.quebrantado);
    const acertou = teste.natural !== 1 && (teste.natural === 20 || teste.natural + c.bonusAtaque >= ca);
    // O teto do golpe é a reserva INTEIRA do alvo, casca incluída (0.1.37):
    // antes era só `alvo.pv`, e com PV Temporários no motor isso deixaria o
    // orçamento transbordar pro próximo alvo enquanto a casca deste ainda
    // estava de pé — o chefe atacaria dois pelo preço de um.
    const golpe = acertou ? Math.min(restante, alvo.pv + alvo.pvTemp) : 0;
    const evento: EventoAtaque | undefined = logger ? {
      atacante: c.nome, alvo: alvo.nome, acao: "Ataque por orçamento",
      teste: { ...teste, tipo: "ataque", bonus: c.bonusAtaque, total: teste.natural + c.bonusAtaque, defesa: ca },
      acertou, critico: false, parcelas: [], bonusDano: golpe, bruto: golpe, aposModificadores: golpe,
      notas: ["Dano fixo do orçamento da criatura; não há dados de dano cadastrados."],
    } : undefined;
    bater(c, alvo, golpe, rng, false, undefined, evento);
    restante -= golpe;
    if (evento) registrarAtaque(logger, evento);
  }
}

/** Aplica dano a um alvo e derruba se zerar. Um lugar só, pra contabilidade não divergir. */
function bater(
  c: EstadoCriatura,
  alvo: Alvo,
  dano: number,
  rng?: Rng,
  critico = false,
  /**
   * O tipo do golpe, pra Resistência e Imunidade do ALVO (Cap. 4, §6).
   *
   * Vem da fórmula de dano da ação ("4d8 (cortante)"), como do outro lado.
   * Hoje quase nenhum personagem tem Resistência — mas o Casco do Escudeiro e
   * as raciais dão, e sem esta linha elas seriam texto de ficha que o motor
   * nunca honra. O orçamento genérico por turno não tem tipo, e é o certo: ele
   * não é um golpe, é uma média.
   */
  tipoDeDano?: string,
  evento?: EventoAtaque
): number {
  // `danoCausado` conta o PV REAL perdido, e não o golpe desferido: o que a
  // casca absorveu não feriu ninguém, e é o mesmo critério que o lado dos
  // personagens usa desde a 0.1.37.
  // Quem já está a 0 PV leva o golpe sem teto: não há PV pra limitar, e o que
  // conta ali é a Marca da Morte que o dano cobra (`aplicarDano`).
  const pvAntes = alvo.pv;
  aplicarDano(
    alvo,
    dano,
    bonusDeRankDaCriatura(c.fonte.patamar),
    rng,
    critico,
    tipoDeDano,
    evento
  );
  // O teto vem DEPOIS de Resistência, Imunidade e PV Temporários. Cortar o
  // golpe antes disso fazia, por exemplo, 10 de dano contra 4 PV com
  // Resistência virar 2, quando a regra manda reduzir a 5 e derrubar o alvo.
  const danoReal = Math.max(0, pvAntes - alvo.pv);
  if (evento && "ficha" in alvo && pvAntes === (alvo as EstadoPersonagem).ficha.pvMax && alvo.pv <= 0) {
    evento.notas.push("Queda em um golpe: o personagem estava com todos os PV antes deste ataque.");
  }
  if (evento?.aplicacao) evento.aplicacao.danoEfetivo = danoReal;
  c.danoCausado += danoReal;
  return danoReal;
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
  rng: Rng,
  logger?: RegistroCombate, aliados: EstadoPersonagem[] = [],
): void {
  if (acao.tipo === "ataque" && !acao.area) alvo = guardaDoCorpo(alvo, c, aliados, logger);
  // Inconsciente é Incapacitado e Caído (Cap. 4, §7): quem ataca o caído tem a
  // Vantagem do Caído.
  const vantagem = c.escondido || alvo.preso || alvo.caido || alvo.inconsciente || alvo.cego;
  const desvantagem = c.preso || c.caido || c.envenenado || !!acao.desvantagemAtaque;
  const bonusAtaque = acao.bonusAtaque ?? c.bonusAtaque;
  const evento: EventoAtaque | undefined = logger ? {
    atacante: c.nome, alvo: alvo.nome, acao: acao.nome, acertou: true, critico: false,
    parcelas: [], bonusDano: 0, bruto: 0, aposModificadores: 0,
    notas: [
      ...(acao.desvantagemAtaque ? ["Desvantagem: sem proficiência com a arma"] : []),
      ...(c.preso || c.caido || c.envenenado ? ["Desvantagem: condição do atacante"] : []),
      ...(vantagem ? ["Vantagem: condição do alvo"] : []),
    ],
  } : undefined;
  let dano: number;
  let alvoFalhou = true;
  let critico = false;
  if (acao.tipo === "ataque") {
    const teste = rolarD20ComRegistro(rng, vantagem, desvantagem);
    const rolagem = teste.natural;
    const corpoACorpo = /corpo a corpo|toque/i.test(acao.alcance);
    const ca = corpoACorpo ? caDepoisDeAparar(alvo, c, rolagem, rolagem + bonusAtaque, logger) : Math.max(1, alvo.ca - alvo.quebrantado);
    if (evento) evento.teste = { ...teste, tipo: "ataque", bonus: bonusAtaque, total: rolagem + bonusAtaque, defesa: ca };
    // Quebrantado abaixa a CA de quem o carrega, venha o golpe de onde vier.
    // Hoje isto é sempre zero deste lado — as treze citações da condição no
    // livro são de Armas Pesadas, e o Apêndice G não dá a condição a criatura
    // nenhuma —, mas escrever a CA de dois jeitos diferentes nos dois arquivos
    // é como um motor começa a divergir de si mesmo.
    if (rolagem === 1 || (rolagem !== 20 && rolagem + bonusAtaque < ca)) {
      if (evento) { evento.acertou = false; registrarAtaque(logger, evento); }
      c.escondido = false;
      if (corpoACorpo) reagirComFluxo(alvo, c, acao.dano, c.escala * escalaDaAcao(acao), rng, logger);
      return;
    }
    const rolagemDano = rolarComRegistro(acao.dano, rng);
    dano = rolagemDano.total;
    evento?.parcelas.push({ origem: "Dano da ação", rolagem: rolagemDano });
    // Crítico: os dados rolam de novo e o fixo ("+5") soma uma vez só (Cap. 4,
    // §6). Rolar a fórmula inteira de novo somaria o +5 duas vezes.
    critico = rolagem === 20;
    if (critico) {
      const adicional = rolarCriticoComRegistro(acao.dano, rng);
      dano += adicional.total;
      evento?.parcelas.push({ origem: "Dados adicionais do crítico", rolagem: adicional });
    }
    if (c.fonte.dadosFurtivos && !c.usouFurtivo && furtivoDoRival(c, alvo)) {
      const formula = `${c.fonte.dadosFurtivos}d6`;
      const furtivo = rolarComRegistro(formula, rng);
      dano += furtivo.total;
      evento?.parcelas.push({ origem: "Dano Furtivo", rolagem: furtivo });
      if (critico) {
        const adicional = rolarCriticoComRegistro(formula, rng);
        dano += adicional.total;
        evento?.parcelas.push({ origem: "Dano Furtivo (dados adicionais do crítico)", rolagem: adicional });
      }
      c.usouFurtivo = true;
      evento?.notas.push("Dano Furtivo da ficha: primeiro acerto elegível deste turno.");
    }
    if (evento) { evento.critico = critico; evento.bruto = dano; }
  } else {
    const rolagemDano = rolarComRegistro(acao.dano, rng);
    dano = rolagemDano.total;
    evento?.parcelas.push({ origem: "Dano da ação", rolagem: rolagemDano });
    // O personagem resiste com 1d20 + atributo + metade do maior Bônus de Rank
    // (`FichaCombate.resistencia`). Antes era metade do BC dele, conta que o
    // livro não tem. Envenenado cobra Desvantagem em "testes de atributo" —
    // resistir entra nisso.
    const teste = rolarD20ComRegistro(rng, false, alvo.envenenado);
    const resistiu = teste.natural + alvo.ficha.resistencia >= c.cdResistencia;
    if (evento) {
      evento.bruto = dano;
      evento.teste = { ...teste, tipo: "resistencia", bonus: alvo.ficha.resistencia, total: teste.natural + alvo.ficha.resistencia, defesa: c.cdResistencia };
      if (resistiu) evento.notas.push("Resistência bem-sucedida: metade do dano, arredondada para baixo");
    }
    if (resistiu) dano = Math.floor(dano / 2);
    alvoFalhou = !resistiu;
  }
  // A escala da simulação é temporária; `escalaDano` é a regulagem que já
  // mora na ação da criatura. Multiplicar as duas aqui mantém a projeção e a
  // ficha salva iguais — inclusive quando o golpe é crítico.
  const fDmg = Math.round(dano * c.escala * escalaDaAcao(acao));
  if (evento) {
    evento.aposModificadores = fDmg;
    const escala = c.escala * escalaDaAcao(acao);
    if (escala !== 1) evento.notas.push(`Escala do encontro/ação: ×${escala}, arredondada`);
  }
  c.escondido = false;
  bater(c, alvo, fDmg, rng, critico, acao.dano, evento);
  if (evento) registrarAtaque(logger, evento);
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
 * em área pega todo mundo no campo, INCLUSIVE quem caiu: "sofrer dano a 0 PV
 * dá 1 Marca da Morte (2 se for crítico)" (Cap. 4, §7), e a Bola de Fogo não
 * desvia do aliado no chão. Ação normal vai no primeiro alvo de pé, que é a
 * mesma abstração de foco que o orçamento já usava: a IA não gasta golpe em
 * quem já não luta.
 */
function turnoPorAcoes(c: EstadoCriatura, alvos: EstadoPersonagem[], rng: Rng, logger?: RegistroCombate): void {
  for (let rodada = 0; rodada < c.rodadas; rodada++) {
    let acoesRestantes = c.surpreso ? 1 : ACOES_POR_TURNO;
    let guarda = 0;
    while (c.vivo && acoesRestantes > 0 && guarda++ < ACOES_POR_TURNO) {
      const vivos = ordenarAlvosDaCriatura(alvos, c.fonte.tatica, rng);
      if (vivos.length === 0) return;
      if (c.fonte.temPassoVazio && c.usouPrimeiroGolpe && !c.usouPassoVazio && acoesRestantes >= 2) {
        c.usouPassoVazio = true;
        c.usouPrimeiroGolpe = false;
        c.escondido = true;
        acoesRestantes--;
        logger?.log(`[${c.nome}] gasta 1 Ação em Passo Vazio e reaparece na ação seguinte, reativando Primeiro Golpe.`);
      }
      // Recalcula depois de cada golpe: uma ação em área pode derrubar alguém
      // e deixar de ser a melhor escolha para as Ações que restam.
      const acao = planoDeCombate(c.fonte, naArea(alvos).length, acoesRestantes, (candidata) =>
        candidata.regra !== "primeiro-golpe" || (!c.usouPrimeiroGolpe && aberturaDoRival(c, vivos[0]))
      )[0];
      if (!acao) break;
      const alcance = alcanceEmMetros(acao.alcance);
      const distancia = distanciaEntre(c, vivos[0]);
      if (distancia !== undefined && distancia > alcance) {
        if (!aproximar(c, vivos[0], alcance, c.fonte.deslocamento ?? 9)) break;
        acoesRestantes--;
        logger?.log(`[${c.nome}] gasta 1 Ação para se aproximar.`);
        continue;
      }
      if (acao.regra === "primeiro-golpe") {
        c.usouPrimeiroGolpe = true;
        logger?.log(`[${c.nome}] usa Primeiro Golpe contra alvo Desprevenido; uso único deste combate consumido.`);
      }
      for (const alvo of acao.area ? naArea(alvos) : [vivos[0]]) {
        resolverAcaoCriatura(c, acao, alvo, rng, logger, alvos);
      }
      acoesRestantes -= Math.max(1, acao.acoes);
    }
  }
}

/** Quem uma ação em área alcança: os de pé e os caídos que ainda não morreram. */
function naArea(alvos: EstadoPersonagem[]): EstadoPersonagem[] {
  return alvos.filter((a) => a.vivo || (a.inconsciente && !a.morto));
}

function turnoCriatura(c: EstadoCriatura, alvos: EstadoPersonagem[], rng: Rng, logger?: RegistroCombate): void {
  if (!c.vivo) return;
  c.jaAgiu = true;
  c.usouFurtivo = false;
  for (const heroi of alvos) heroi.fluxosNesteTurno.clear();
  if (usaAcoes(c.fonte)) turnoPorAcoes(c, alvos, rng, logger);
  else turnoPorOrcamento(c, alvos, rng, logger);
  c.surpreso = false;
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
function reagirComoChefe(
  c: EstadoCriatura,
  alvoGatilho: EstadoPersonagem,
  grupo: EstadoPersonagem[],
  rng: Rng,
  logger?: RegistroCombate
): void {
  if (!alvoGatilho.vivo) return;

  if (usaAcoes(c.fonte)) {
    const candidatas = acoesOfensivas(c.fonte).filter((a) => Math.max(1, a.acoes) <= 1 &&
      (a.regra !== "primeiro-golpe" || (!c.usouPrimeiroGolpe && aberturaDoRival(c, alvoGatilho))));
    if (candidatas.length === 0) return; // nada que caiba numa Reação — ela não dispara
    const acao = planoDeCombate(c.fonte, naArea(grupo).length, 1, (a) =>
      a.regra !== "primeiro-golpe" || (!c.usouPrimeiroGolpe && aberturaDoRival(c, alvoGatilho))
    )[0];
    if (!acao || !candidatas.some((candidata) => candidata.id === acao.id)) return;
    // O herói que acabou de agir é o alvo da Reação de alvo único. Uma ação em
    // área, porém, promete todos os alvos vivos — passar só esse herói tornava
    // "área" uma mentira justamente fora do turno normal do chefe.
    const alvosDaReacao = acao.area ? naArea(grupo) : [alvoGatilho];
    logger?.log(`[${c.nome}] reage com ${acao.nome} (${alvosDaReacao.length} alvo${alvosDaReacao.length === 1 ? "" : "s"})`);
    if (acao.regra === "primeiro-golpe") c.usouPrimeiroGolpe = true;
    c.usouFurtivo = false;
    for (const alvo of alvosDaReacao) resolverAcaoCriatura(c, acao, alvo, rng, logger, grupo);
    return;
  }

  const teste = rolarD20ComRegistro(rng);
  const ca = Math.max(1, alvoGatilho.ca - alvoGatilho.quebrantado);
  const acertou = teste.natural !== 1 && (teste.natural === 20 || teste.natural + c.bonusAtaque >= ca);
  // `danoPorTurno` já nasce com a escala aplicada no estado da criatura.
  // Multiplicar por ela mais uma vez fazia a Reação de chefe crescer em
  // escala², embora o turno normal crescesse em escala.
  const dano = acertou ? Math.max(1, Math.round(c.danoPorTurno / ACOES_POR_TURNO)) : 0;
  const evento: EventoAtaque | undefined = logger ? {
    atacante: c.nome, alvo: alvoGatilho.nome, acao: "Reação de chefe por orçamento",
    teste: { ...teste, tipo: "ataque", bonus: c.bonusAtaque, total: teste.natural + c.bonusAtaque, defesa: ca },
    acertou, critico: false, parcelas: [], bonusDano: dano, bruto: dano, aposModificadores: dano,
    notas: ["Reação de chefe: dano fixo de um terço do orçamento; não há dados de dano cadastrados."],
  } : undefined;
  bater(c, alvoGatilho, dano, rng, false, undefined, evento);
  if (evento) registrarAtaque(logger, evento);
}


export type ResultadoDaBatalha = "vitoria" | "tpk" | "empate";

export interface ResumoBatalha {
  seed: number;
  resultado: ResultadoDaBatalha;
  rodadas: number;
  quedas: number;
  pvRestantePct: number;
  menorPvPct: number;
}

export interface LogCombate {
  /** Recibos das ações, com os dados reais da reexecução. */
  eventos?: EventoAtaque[];
  /** Semente para repetir esta batalha isoladamente, caso a mesa queira. */
  seed: number;
  categoria: string;
  /** Por que esta batalha apareceu entre os destaques do relatório. */
  motivo: string;
  /** Os números da batalha original, antes de ela ser reexecutada com log. */
  resumo: ResumoBatalha;
  linhas: string[];
}

interface BatalhaDestacada {
  resumo: ResumoBatalha;
  motivo: string;
}

export class CombateLogger {
  linhas: string[] = [];
  eventos: EventoAtaque[] = [];
  rodada = 0;
  log(msg: string) { this.linhas.push(msg); }
  ataque(evento: EventoAtaque) {
    evento.rodada = this.rodada;
    this.eventos.push(evento);
    this.log(formatarEventoAtaque(evento));
  }
}

function registrarAtaque(logger: RegistroCombate | undefined, evento: EventoAtaque): void {
  if (logger?.ataque) logger.ataque(evento);
  else logger?.log(formatarEventoAtaque(evento));
}

export interface ResultadoEncontro {
  /** Até dez batalhas significativas, reexecutadas para leitura turno a turno. */
  logsExtremos?: LogCombate[];
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
  porPersonagem: {
    id: string;
    nome: string;
    danoMedio: number;
    /**
     * PV devolvidos a aliados por batalha — 0.1.42.
     *
     * A contrapartida de `danoMedio`, e ela existe pelo mesmo motivo que a
     * coluna do relatório de linha de comando existe: sem ela, a tela do Mestre
     * media um curandeiro pela única coisa que ele não faz. Um grupo com Sera
     * aparecia com uma linha de "0 de dano" e nenhuma explicação.
     */
    curaMedia: number;
    sobreviveu: number;
  }[];
}

export interface OpcoesEncontro {
  cenario?: CenarioCombate;
  /** null usa referência d6; ausente usa a única equipada. */
  armasPorPersonagem?: Record<string, string | null>;
  batalhas?: number;
  semente?: number;
  maxRodadas?: number;
  /** Multiplica PV e dano de todas as criaturas — usado pelo ajuste automático. */
  escala?: number;
  /**
   * Reexecutar batalhas notáveis custa trabalho extra e só faz sentido quando
   * alguém vai ler o relatório. É opt-in para que consumidores numéricos não
   * paguem por até dez combates extras que não vão mostrar.
   */
  gerarLogs?: boolean;
}

/**
 * Roda o encontro N vezes e devolve as médias.
 *
 * As fichas são derivadas UMA vez (`montarFicha`) e só o estado mutável é
 * recriado por batalha: derivar dentro do laço chamava os seletores centenas de
 * vezes por ficha e era o gargalo da tela.
 */

function selecionarExtremos(resumos: ResumoBatalha[]): BatalhaDestacada[] {
  const selecionados: BatalhaDestacada[] = [];
  const uniq = new Set<number>();
  const add = (resumo: ResumoBatalha, motivo: string) => {
    if (uniq.has(resumo.seed)) return;
    selecionados.push({ resumo, motivo });
    uniq.add(resumo.seed);
  };

  const vitorias = resumos
    .filter((r) => r.resultado === "vitoria")
    .sort((a, b) => a.pvRestantePct - b.pvRestantePct);
  const empates = resumos
    .filter((r) => r.resultado === "empate")
    .sort((a, b) => b.quedas - a.quedas || a.pvRestantePct - b.pvRestantePct);
  const tpks = resumos
    .filter((r) => r.resultado === "tpk")
    .sort((a, b) => a.rodadas - b.rodadas || b.quedas - a.quedas);

  for (const tpk of tpks.slice(0, 3)) add(tpk, "TPK mais rápido");
  for (const empate of empates.slice(0, 2)) add(empate, "Empate mais perigoso");

  if (vitorias.length > 0) {
    add(vitorias[0], "Vitória mais apertada");
    add(vitorias[vitorias.length - 1], "Vitória mais folgada");
    add(vitorias[Math.floor(vitorias.length / 2)], "Vitória típica");

    const porQuedas = [...vitorias].sort((a, b) => b.quedas - a.quedas);
    if (porQuedas.length > 0) add(porQuedas[0], "Vitória com mais quedas");

    const porQuaseMorte = [...vitorias].sort((a, b) => a.menorPvPct - b.menorPvPct);
    if (porQuaseMorte.length > 0) add(porQuaseMorte[0], "PV mais baixo durante uma vitória");
  }

  // Uma amostra só de derrotas também merece dez registros, quando há dez batalhas.
  for (const resumo of [...tpks, ...empates, ...vitorias]) {
    if (selecionados.length >= 10) break;
    add(resumo, resumo.resultado === "tpk" ? "Derrota do grupo" : resumo.resultado === "empate" ? "Limite de rodadas atingido" : "Vitória do grupo");
  }

  return selecionados.slice(0, 10);
}

function prepararCenario(heroes: EstadoPersonagem[], inimigos: EstadoCriatura[], rng: Rng, cenario?: CenarioCombate, logger?: RegistroCombate): void {
  for (const heroi of heroes) {
    aplicarEstadoInicial(heroi, heroi.ficha.id, "grupo", cenario);
    heroi.alcanceArma = cenario?.participantes?.[heroi.ficha.id]?.alcanceArma;
    heroi.podeEsconderEmCombate = heroi.ficha.temSombraLonga || !!cenario?.cobertura;
    if (cenario?.participantes?.[heroi.ficha.id]?.postura && heroi.ficha.rankAgua >= 3) {
      heroi.emPostura = true;
      heroi.ca += heroi.ficha.posturaBonusCA;
    }
  }
  for (const inimigo of inimigos) {
    aplicarEstadoInicial(inimigo, inimigo.fonte.id, "criaturas", cenario);
    inimigo.percepcaoPassiva = percepcaoPassiva(inimigo.fonte.patamar, inimigo.fonte.arquetipo);
    if (cenario?.criaturasUmPv?.includes(inimigo.fonte.id)) inimigo.pv = 1;
  }
  // A abertura do Ladino vem da ficha. Um estado inicial explícito continua prevalecendo.
  for (const heroi of heroes) {
    if (!heroi.ficha.rankLadino || heroi.ficha.invocadoDe) continue;
    const rolagem = d20(rng);
    const defesa = Math.max(...inimigos.map((x) => x.percepcaoPassiva ?? 10));
    heroi.escondido = rolagem + heroi.ficha.bonusFurtividade >= defesa;
    logger?.log(`[${heroi.nome}] tenta começar Escondido: ${rolagem} + ${heroi.ficha.bonusFurtividade} contra Percepção ${defesa} — ${heroi.escondido ? "conseguiu" : "falhou"}.`);
  }
}

function replayBatalha(
  fichas: FichaCombate[],
  grupo: CharacterData[],
  criaturas: CriaturaEncontro[],
  destaque: BatalhaDestacada,
  escala: number,
  maxRodadas: number,
  rodadasChefe: number,
  cenario?: CenarioCombate,
): LogCombate {
  const { resumo, motivo } = destaque;
  const rng = makeRng(resumo.seed);
  const logger = new CombateLogger();

  const heroes: EstadoPersonagem[] = fichas.map(novoEstado);
  heroes.push(...prepararInvocados(grupo, heroes, cenario?.invocadosPreparados));
  const inimigos: EstadoCriatura[] = [];
  for (const criatura of criaturas) {
    for (let i = 0; i < criatura.quantidade; i++) {
      inimigos.push({
        ...novoAlvo({
          nome: criatura.quantidade > 1 ? `${criatura.nome} ${i + 1}` : criatura.nome,
          pv: Math.max(1, Math.round(criatura.pv * escala)),
          ca: criatura.ca,
          bonusResistencia: Math.ceil(criatura.bonusAtaque / 2),
          resistencias: criatura.resistencias ?? [],
          imunidades: criatura.imunidades ?? [],
        }),
        fonte: criatura,
        usouPrimeiroGolpe: false,
        usouPassoVazio: false,
        usouFurtivo: false,
        bonusAtaque: criatura.bonusAtaque,
        danoPorTurno: Math.max(1, Math.round(criatura.danoPorTurno * escala)),
        cdResistencia: criatura.cdResistencia,
        escala,
        rodadas: criatura.papel === "chefe" ? rodadasChefe : 1,
      });
    }
  }

  prepararCenario(heroes, inimigos, rng, cenario, logger);
  const ordem = [
    ...heroes.map((h) => ({ tipo: "heroi" as const, h, i: d20(rng) + h.ficha.iniciativa })),
    ...inimigos.map((c) => ({ tipo: "criatura" as const, c, i: d20(rng) })),
  ].sort((x, y) => y.i - x.i);

  let rodada = 0;
  for (; rodada < maxRodadas; rodada++) {
    logger.rodada = rodada + 1;
    logger.log(`\n--- Rodada ${rodada + 1} ---`);
    for (const heroi of heroes) aoIniciarRodada(heroi, true);
    for (const inimigo of inimigos) aoIniciarRodada(inimigo, inimigo.fonte.papel === "chefe");

    for (const p of ordem) {
      for (const h of heroes) { h.usouFurtivo = false; h.fluxosNesteTurno.clear(); h.reacoesNesteTurno.clear(); }
      if (p.tipo === "heroi") {
        if (p.h.morto) continue;
        if (!p.h.inconsciente && !tickChamas(p.h, rng)) {
           logger.log(`[${p.h.nome}] caiu pelas chamas!`);
           continue;
        }
        if (!p.h.inconsciente && !tickSustentado(p.h)) {
           logger.log(`[${p.h.nome}] caiu por dano sustentado!`);
           continue;
        }
        turnoPersonagem(p.h, inimigos, rng, heroes, logger);
        for (const inimigo of inimigos) {
          if (p.h.vivo && inimigo.vivo && consumirReacao(inimigo)) {
            logger.log(`[${inimigo.nome}] reage!`);
            reagirComoChefe(inimigo, p.h, heroes, rng, logger);
          }
        }
      } else {
        if (!p.c.vivo || !tickChamas(p.c, rng)) continue;
        if (!tickSustentado(p.c)) continue;
        turnoCriatura(p.c, heroes, rng, logger);
      }
    }
    if (inimigos.every((c) => !c.vivo)) break;
    if (heroes.filter((h) => !h.ficha.invocadoDe).every((h) => !h.vivo)) break;
  }

  let cat = "Vitória";
  if (resumo.resultado === 'tpk') cat = "TPK";
  if (resumo.resultado === 'empate') cat = "Empate";
  if (resumo.resultado === 'vitoria' && resumo.quedas > 0) cat = `Vitória Apertada (${resumo.quedas} quedas)`;

  logger.log(`Resultado: ${cat} em ${Math.min(rodada + 1, maxRodadas)} rodadas. PV Restante: ${Math.round(resumo.pvRestantePct * 100)}%`);

  return {
    seed: resumo.seed,
    categoria: cat,
    motivo,
    resumo,
    linhas: logger.linhas,
    eventos: logger.eventos,
  };
}

export function simularEncontro(

  grupo: CharacterData[],
  criaturas: CriaturaEncontro[],
  opcoes: OpcoesEncontro = {}
): ResultadoEncontro {
  const batalhas = opcoes.batalhas ?? 400;
  const maxRodadas = opcoes.maxRodadas ?? 20;
  const escala = opcoes.escala ?? 1;
  const sementeBase = opcoes.semente ?? 20260903;
  if (!Number.isInteger(batalhas) || batalhas < 1 || batalhas > 10000) throw new Error("Informe de 1 a 10.000 batalhas.");
  if (!Number.isInteger(maxRodadas) || maxRodadas < 1 || maxRodadas > 100) throw new Error("O limite deve ser de 1 a 100 rodadas.");
  if (!Number.isFinite(escala) || escala <= 0) throw new Error("A escala de dificuldade deve ser positiva.");
  if (!Number.isSafeInteger(sementeBase)) throw new Error("A semente precisa ser um número inteiro válido.");
  if (grupo.length === 0 || criaturas.length === 0) throw new Error("Escolha pelo menos um personagem e uma criatura.");
  if (criaturas.some((c) => !Number.isInteger(c.quantidade) || c.quantidade < 1 || c.quantidade > 100 || !Number.isFinite(c.pv) || c.pv <= 0)) {
    throw new Error("Confira os PV e as quantidades das criaturas (de 1 a 100 cópias por criatura).");
  }

  if (opcoes.cenario?.distancia !== undefined && (!Number.isFinite(opcoes.cenario.distancia) || opcoes.cenario.distancia < 0 || opcoes.cenario.distancia > 1000)) throw new Error("A distância deve ser de 0 a 1.000 metros.");
  for (const inicio of Object.values(opcoes.cenario?.participantes ?? {})) {
    if (inicio.alcanceArma !== undefined && (!Number.isFinite(inicio.alcanceArma) || inicio.alcanceArma <= 0)) throw new Error("O alcance da arma deve ser positivo.");
    if (inicio.posicao !== undefined && !Number.isFinite(inicio.posicao)) throw new Error("Posição inválida.");
  }
  const fichas: FichaCombate[] = grupo.map((c) => montarFicha(c, "", opcoes.armasPorPersonagem?.[c.id]));
  const rodadasChefe = rodadasDoChefe(grupo.length);

  let vitorias = 0;
  let tpks = 0;
  let empates = 0;
  let somaRodadas = 0;
  let somaQuedas = 0;
  let somaPvRestante = 0;
  const pvTotalGrupo = fichas.reduce((s, f) => s + f.pvMax, 0) || 1;
  const dano = new Map<string, number>();
  const cura = new Map<string, number>();
  const viveu = new Map<string, number>();
  const resumos: ResumoBatalha[] = [];

  for (let b = 0; b < batalhas; b++) {
    // Cada batalha recebe uma semente própria. Além de manter o resultado
    // reproduzível, isso permite reexecutar exatamente as batalhas notáveis
    // depois que a simulação agregada termina.
    const sementeDaBatalha = sementeBase + b;
    const rng = makeRng(sementeDaBatalha);
    const heroes: EstadoPersonagem[] = fichas.map(novoEstado);
    heroes.push(...prepararInvocados(grupo, heroes, opcoes.cenario?.invocadosPreparados));
    const inimigos: EstadoCriatura[] = [];
    for (const criatura of criaturas) {
      for (let i = 0; i < criatura.quantidade; i++) {
        inimigos.push({
          ...novoAlvo({
            nome: criatura.quantidade > 1 ? `${criatura.nome} ${i + 1}` : criatura.nome,
            pv: Math.max(1, Math.round(criatura.pv * escala)),
            ca: criatura.ca,
            // Apêndice G: Bônus de Resistência = metade do Bônus de Ataque, pra
            // cima. Sem isto a criatura resistia com metade do BC de quem a
            // atacava, e um mago mais forte deixava o bicho mais resistente.
            bonusResistencia: Math.ceil(criatura.bonusAtaque / 2),
            // O Bloco do Monstro (Apêndice G) chega na simulação por aqui. Sem
            // estas duas linhas, marcar "Resistência a ígneo" na ficha mudava
            // a tela e não mudava número nenhum — que é o pior tipo de campo.
            resistencias: criatura.resistencias ?? [],
            imunidades: criatura.imunidades ?? [],
          }),
          fonte: criatura,
          usouPrimeiroGolpe: false,
          usouPassoVazio: false,
          usouFurtivo: false,
          bonusAtaque: criatura.bonusAtaque,
          danoPorTurno: Math.max(1, Math.round(criatura.danoPorTurno * escala)),
          cdResistencia: criatura.cdResistencia,
          // A escala do ajuste automático multiplica o orçamento de uma vez, e
          // o dano de cada ação na hora de bater — as duas pontas escalam junto.
          escala,
          rodadas: criatura.papel === "chefe" ? rodadasChefe : 1,
        });
      }
    }

    // Iniciativa: o personagem rola d20 + Agilidade. O Apêndice G não dá
    // Iniciativa nenhuma à criatura, então ela rola o d20 puro — inventar um
    // bônus aqui seria criar regra dentro do simulador.
    prepararCenario(heroes, inimigos, rng, opcoes.cenario);
    const ordem = [
      ...heroes.map((h) => ({ tipo: "heroi" as const, h, i: d20(rng) + h.ficha.iniciativa })),
      ...inimigos.map((c) => ({ tipo: "criatura" as const, c, i: d20(rng) })),
    ].sort((x, y) => y.i - x.i);

    let rodada = 0;
    let menorPvPctDaBatalha = 1;
    const registrarMenorPv = () => {
      menorPvPctDaBatalha = Math.min(
        menorPvPctDaBatalha,
        ...heroes.filter((h) => !h.ficha.invocadoDe).map((h) => Math.max(0, h.pv) / Math.max(1, h.ficha.pvMax))
      );
    };
    for (; rodada < maxRodadas; rodada++) {
      // Reação/ação lendária do chefe: rearma no início da rodada da mesa —
      // só o chefe tem essa economia de ação extra fora do turno normal dele
      // (Apêndice G, "Ajustando pra cima"). Um lacaio ou um padrão não ganham
      // este golpe avulso.
      for (const heroi of heroes) aoIniciarRodada(heroi, true);
    for (const inimigo of inimigos) aoIniciarRodada(inimigo, inimigo.fonte.papel === "chefe");

      for (const p of ordem) {
      for (const h of heroes) { h.usouFurtivo = false; h.fluxosNesteTurno.clear(); h.reacoesNesteTurno.clear(); }
        registrarMenorPv();
        if (p.tipo === "heroi") {
          // Quem está no chão ainda tem turno — é nele que rola o Fio da Vida
          // (0.1.38). Só o morto de vez é pulado, e as chamas não queimam quem
          // já está a 0 PV.
          if (p.h.morto) continue;
          if (!p.h.inconsciente && !tickChamas(p.h, rng)) continue;
          if (!p.h.inconsciente && !tickSustentado(p.h)) continue;
          turnoPersonagem(p.h, inimigos, rng, heroes);
          // O chefe reage ao turno que acabou de passar — 1 vez por rodada da
          // mesa, não 1 vez por herói: a Reação já foi gasta depois do primeiro
          // herói que agiu, e os seguintes passam por `consumirReacao` sem
          // disparar nada.
          for (const inimigo of inimigos) {
            if (p.h.vivo && inimigo.vivo && consumirReacao(inimigo)) {
              reagirComoChefe(inimigo, p.h, heroes, rng);
            }
          }
        } else {
          if (!p.c.vivo || !tickChamas(p.c, rng)) continue;
          if (!tickSustentado(p.c)) continue;
          turnoCriatura(p.c, heroes, rng);
        }
      }
      registrarMenorPv();
      if (inimigos.every((c) => !c.vivo)) break;
      if (heroes.filter((h) => !h.ficha.invocadoDe).every((h) => !h.vivo)) break;
    }

    const personagens = heroes.filter((h) => !h.ficha.invocadoDe);
    const grupoVivo = personagens.some((h) => h.vivo);
    const inimigoVivo = inimigos.some((c) => c.vivo);
    const resultado: ResultadoDaBatalha = !inimigoVivo
      ? "vitoria"
      : !grupoVivo
        ? "tpk"
        : "empate";
    if (resultado === "vitoria") vitorias++;
    else if (resultado === "tpk") tpks++;
    else empates++;

    const rodadasDaBatalha = Math.min(rodada + 1, maxRodadas);
    const quedasDaBatalha = personagens.filter((h) => !h.vivo).length;
    const pvRestanteDaBatalha = personagens.reduce((s, h) => s + Math.max(0, h.pv), 0);
    const pvRestantePct = pvRestanteDaBatalha / pvTotalGrupo;
    resumos.push({
      seed: sementeDaBatalha,
      resultado,
      rodadas: rodadasDaBatalha,
      quedas: quedasDaBatalha,
      pvRestantePct,
      menorPvPct: menorPvPctDaBatalha,
    });
    somaRodadas += rodadasDaBatalha;
    somaQuedas += quedasDaBatalha;
    somaPvRestante += pvRestanteDaBatalha;
    for (const h of heroes) {
      const autor = h.ficha.invocadoDe ?? h.ficha.id;
      dano.set(autor, (dano.get(autor) ?? 0) + h.danoCausado);
      cura.set(h.ficha.id, (cura.get(h.ficha.id) ?? 0) + h.pvCurado);
      if (h.vivo) viveu.set(h.ficha.id, (viveu.get(h.ficha.id) ?? 0) + 1);
    }
  }

  const logsExtremos =
    opcoes.gerarLogs === true
      ? selecionarExtremos(resumos).map((resumo) =>
          replayBatalha(fichas, grupo, criaturas, resumo, escala, maxRodadas, rodadasChefe, opcoes.cenario)
        )
      : [];

  return {
    logsExtremos,
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
      curaMedia: (cura.get(f.id) ?? 0) / batalhas,
      sobreviveu: (viveu.get(f.id) ?? 0) / batalhas,
    })),
  };
}
