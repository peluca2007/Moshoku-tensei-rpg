/**
 * O que o site diz ao Mestre ENQUANTO ele monta a criatura.
 *
 * A simulação de `encounterSim.ts` responde depois do fato: monte tudo, clique,
 * espere trezentas batalhas, leia uma porcentagem. Isso serve pra fechar um
 * encontro, e não serve pra escrever um monstro — porque no momento em que o
 * Mestre digita "4d8+5" ele não tem nem a criatura pronta nem paciência pra um
 * relatório.
 *
 * Estes avisos são a outra ponta: baratos (nenhuma rolagem, nenhum laço de
 * batalha), imediatos, e ancorados nas duas únicas coisas que o site pode
 * afirmar com segurança nessa hora —
 *
 *   1. o molde do Apêndice G (`src/data/bestiary.ts`), que diz quanto uma
 *      criatura daquele patamar e papel deveria entregar por rodada;
 *   2. as FICHAS DE VERDADE do grupo selecionado, com o PV e a CA que aqueles
 *      cinco personagens realmente têm hoje.
 *
 * A segunda é o que separa um aviso útil de um linter: "está alto demais" não
 * ajuda ninguém, "esse ataque tira 62 em média e a Lyn tem 50 PV" ajuda. Por
 * isso todo aviso desta lista cita ou um número do molde ou o nome de alguém.
 *
 * Nada aqui altera a criatura sozinho. Cada aviso carrega no máximo uma
 * `correcao` pronta, e quem aperta o botão é o Mestre — o Apêndice G é uma
 * régua, e uma régua não decide.
 */
import {
  AcaoCriatura,
  CriaturaEncontro,
  acoesOfensivas,
  aplicarPapel,
  danoDasAcoesPorRodada,
  planoDoTurno,
  usaAcoes,
} from "@/lib/encounterSim";
import { maxFormula, mediaFormula } from "@/lib/combatSim";
import { getMoldePorPatamar, rotuloPatamar } from "@/data/bestiary";

/** O que a tela sabe de cada personagem do grupo — só o que o aviso precisa citar. */
export interface AlvoDoGrupo {
  id: string;
  nome: string;
  pv: number;
  ca: number;
}

export type NivelAviso = "grave" | "alerta" | "nota";

/** Uma troca pronta pra aplicar, se o Mestre quiser. */
export type Correcao =
  | { alvo: "acao"; acaoId: string; valor: string; rotulo: string }
  | { alvo: "criatura"; campo: "bonusAtaque" | "cdResistencia"; valor: number; rotulo: string };

export interface Aviso {
  /** Chave estável — o React remonta a lista a cada tecla digitada. */
  id: string;
  nivel: NivelAviso;
  titulo: string;
  texto: string;
  correcao?: Correcao;
}

const ORDEM: Record<NivelAviso, number> = { grave: 0, alerta: 1, nota: 2 };

/**
 * Multiplica uma fórmula por um fator, mantendo o tamanho do dado.
 *
 * Muda a QUANTIDADE de dados e o fixo, nunca as faces: "3d8+5" × 1,6 vira
 * "5d8+8". Trocar d8 por d12 mexeria na variância — e variância é o que decide
 * se um golpe às vezes mata alguém de uma vez, que é exatamente a coisa que os
 * avisos abaixo estão tentando controlar.
 */
export function escalarFormula(formula: string, fator: number): string {
  const escalado = formula.replace(/(\d+)\s*d\s*(\d+)/gi, (_, n: string, faces: string) => {
    return `${Math.max(1, Math.round(Number(n) * fator))}d${faces}`;
  });
  return escalado.replace(/([+-])\s*(\d+)(?![\dd])/g, (_todo, sinal: string, v: string) => {
    const novo = Math.round(Number(v) * fator);
    return novo === 0 ? "" : `${sinal}${novo}`;
  });
}

/** Chance de um d20 + bônus alcançar a CA. 1 sempre erra, 20 sempre acerta. */
export function chanceDeAcerto(bonus: number, ca: number): number {
  const precisa = ca - bonus;
  return Math.min(0.95, Math.max(0.05, (21 - precisa) / 20));
}

function porcentagem(f: number): string {
  return `${Math.round(f * 100)}%`;
}

function numero(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function listarNomes(nomes: string[]): string {
  if (nomes.length === 1) return nomes[0];
  if (nomes.length === 2) return `${nomes[0]} e ${nomes[1]}`;
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

/** A ação de maior dano por uso — a que decide se alguém cai de um golpe só. */
function acaoMaisPesada(c: CriaturaEncontro): AcaoCriatura | null {
  const ofensivas = acoesOfensivas(c);
  if (ofensivas.length === 0) return null;
  return ofensivas.reduce((m, a) => (mediaFormula(a.dano) > mediaFormula(m.dano) ? a : m));
}

/**
 * Os avisos, em ordem de gravidade.
 *
 * `grupo` vazio é o caso normal de quem abriu a tela sem escolher fichas: o
 * que sobra são os avisos contra o molde, e nenhum deles inventa um grupo
 * médio pra ter o que dizer — um número tirado do nada seria pior que silêncio.
 */
export function avisarSobreCriatura(c: CriaturaEncontro, grupo: AlvoDoGrupo[]): Aviso[] {
  const avisos: Aviso[] = [];
  const molde = getMoldePorPatamar(c.patamar);
  const orcamento = aplicarPapel(c.patamar, c.papel).danoPorTurno;
  const ofensivas = acoesOfensivas(c);

  // -------------------------------------------------------------------------
  // Sem ações: a criatura ainda funciona, mas o Mestre precisa saber com o quê.
  // -------------------------------------------------------------------------
  if (!usaAcoes(c)) {
    avisos.push({
      id: "sem-acoes",
      nivel: "nota",
      titulo: "Sem ações declaradas",
      texto:
        `A simulação vai gastar o Dano/turno (${c.danoPorTurno}) como orçamento fixo: uma rolagem de ` +
        "ataque por alvo e o total repartido entre eles. Escreva as ações dela pra o teste rolar acerto, " +
        "área e resistência de verdade — e pra você ter o que ler em voz alta na mesa.",
    });
  }

  // -------------------------------------------------------------------------
  // O orçamento do turno contra o molde do Apêndice G.
  // -------------------------------------------------------------------------
  if (ofensivas.length > 0) {
    const porRodada = danoDasAcoesPorRodada(c);
    const plano = planoDoTurno(c);
    const razao = porRodada / Math.max(1, orcamento);
    const melhor = plano[0];
    const usos = plano.filter((a) => a.id === melhor.id).length;

    if (razao < 0.75 || razao > 1.3) {
      const fraca = razao < 1;
      const fator = orcamento / Math.max(1, porRodada);
      const sugerida = escalarFormula(melhor.dano, fator);
      const acoesSobrando = 3 - plano.reduce((s, a) => s + Math.max(1, a.acoes), 0);
      avisos.push({
        id: "orcamento",
        nivel: "alerta",
        titulo: fraca ? "Entrega menos do que o patamar pede" : "Entrega mais do que o patamar pede",
        texto:
          `Gastando as três Ações no melhor que ela tem (${usos}× ${melhor.nome}), sai ~${numero(porRodada)} ` +
          `de dano por rodada. O molde de ${rotuloPatamar(c.patamar)} no papel ${c.papel} pede ~${orcamento}. ` +
          (fraca
            ? `Suba ${melhor.nome} pra ${sugerida}` +
              (acoesSobrando > 0 ? ", ou dê a ela uma ação de 1 Ação a mais pra encher o turno." : ".")
            : `Baixe ${melhor.nome} pra ${sugerida}, ou tire uma Ação do turno dela.`),
        correcao: {
          alvo: "acao",
          acaoId: melhor.id,
          valor: sugerida,
          rotulo: `${melhor.nome}: ${melhor.dano} → ${sugerida}`,
        },
      });
    }
  }

  // -------------------------------------------------------------------------
  // O golpe único — a pergunta que o Mestre realmente faz na mesa.
  // -------------------------------------------------------------------------
  const pesada = acaoMaisPesada(c);
  if (pesada && grupo.length > 0) {
    const media = mediaFormula(pesada.dano);
    const teto = maxFormula(pesada.dano);
    const morrem = grupo.filter((p) => media >= p.pv);
    const podemMorrer = grupo.filter((p) => media < p.pv && teto >= p.pv);

    if (morrem.length > 0) {
      const menorPv = Math.min(...morrem.map((p) => p.pv));
      // Alvo: a média do golpe em três quartos do PV de quem está pior. Sobra
      // margem pra ele ainda ser assustador sem decidir a luta numa rolagem.
      const sugerida = escalarFormula(pesada.dano, (menorPv * 0.75) / media);
      avisos.push({
        id: "golpe-unico",
        nivel: "grave",
        titulo: "Mata alguém num golpe",
        texto:
          `${pesada.nome} tira ${numero(media)} em média. ` +
          `${listarNomes(morrem.map((p) => `${p.nome} (${p.pv} PV)`))} ` +
          `${morrem.length > 1 ? "caem" : "cai"} num acerto só — sem chance de reagir, sem cura no meio. ` +
          `Se a ideia era ameaçar e não executar, ${pesada.nome} vira ${sugerida}.`,
        correcao: {
          alvo: "acao",
          acaoId: pesada.id,
          valor: sugerida,
          rotulo: `${pesada.nome}: ${pesada.dano} → ${sugerida}`,
        },
      });
    } else if (podemMorrer.length > 0) {
      avisos.push({
        id: "golpe-unico-teto",
        nivel: "alerta",
        titulo: "Pode matar num golpe na rolagem alta",
        texto:
          `${pesada.nome} tira ${numero(media)} em média, mas chega a ${teto} no teto — e ` +
          `${listarNomes(podemMorrer.map((p) => `${p.nome} (${p.pv} PV)`))} ` +
          `${podemMorrer.length > 1 ? "cabem" : "cabe"} dentro disso. É risco real, não certeza: mantenha se for essa a intenção.`,
      });
    }
  }

  // -------------------------------------------------------------------------
  // Ela consegue acertar este grupo?
  // -------------------------------------------------------------------------
  const temAtaque = ofensivas.some((a) => a.tipo === "ataque");
  if (temAtaque && grupo.length > 0) {
    const chances = grupo.map((p) => chanceDeAcerto(c.bonusAtaque, p.ca));
    const media = chances.reduce((s, x) => s + x, 0) / chances.length;
    const caMedia = grupo.reduce((s, p) => s + p.ca, 0) / grupo.length;

    if (media < 0.4) {
      // Bônus que põe a chance média perto de 60% contra a CA média do grupo.
      const alvo = Math.round(caMedia - 8);
      avisos.push({
        id: "acerto-baixo",
        nivel: "alerta",
        titulo: "Erra demais pra ameaçar",
        texto:
          `Com +${c.bonusAtaque} contra a CA média ${numero(caMedia)} deste grupo, ela acerta ${porcentagem(media)} ` +
          "das vezes. O turno dela vira nada na maioria das rodadas, e o combate arrasta sem perigo nenhum — " +
          `o molde de ${rotuloPatamar(c.patamar)} prevê +${molde.bonusAtaque}.`,
        correcao:
          alvo !== c.bonusAtaque
            ? { alvo: "criatura", campo: "bonusAtaque", valor: alvo, rotulo: `Bônus de Ataque: +${c.bonusAtaque} → +${alvo}` }
            : undefined,
      });
    } else if (media > 0.9) {
      avisos.push({
        id: "acerto-alto",
        nivel: "nota",
        titulo: "A CA do grupo não conta",
        texto:
          `Com +${c.bonusAtaque} ela acerta ${porcentagem(media)} das vezes contra este grupo. Quem investiu em ` +
          "armadura não recebe nada por isso neste encontro — o que não é errado, mas é bom ser de propósito.",
        correcao:
          c.bonusAtaque !== molde.bonusAtaque
            ? {
                alvo: "criatura",
                campo: "bonusAtaque",
                valor: molde.bonusAtaque,
                rotulo: `Bônus de Ataque: +${c.bonusAtaque} → +${molde.bonusAtaque} (o do molde)`,
              }
            : undefined,
      });
    }
  }

  // -------------------------------------------------------------------------
  // Área: o dano que ela tira do grupo INTEIRO de uma vez.
  // -------------------------------------------------------------------------
  const areas = ofensivas.filter((a) => a.area);
  if (areas.length > 0 && grupo.length > 1) {
    const maior = areas.reduce((m, a) => (mediaFormula(a.dano) > mediaFormula(m.dano) ? a : m));
    const media = mediaFormula(maior.dano);
    const pvTotal = grupo.reduce((s, p) => s + p.pv, 0);
    const fatia = (media * grupo.length) / pvTotal;
    avisos.push({
      id: "area",
      nivel: fatia > 0.4 ? "alerta" : "nota",
      titulo: "Área contra o grupo todo",
      texto:
        `${maior.nome} pega os ${grupo.length} de uma vez: ~${numero(media * grupo.length)} de dano somado, ` +
        `${porcentagem(fatia)} da reserva de PV do grupo, numa ação de ${Math.max(1, maior.acoes)} Ação(ões). ` +
        (maior.tipo === "resistencia"
          ? `Quem passa no teste (CD ${c.cdResistencia}) ainda leva metade.`
          : "Como é ataque, cada alvo tem a própria rolagem contra a CA."),
    });
  }

  // -------------------------------------------------------------------------
  // A CD contra o molde.
  // -------------------------------------------------------------------------
  const pedeResistencia = ofensivas.some((a) => a.tipo === "resistencia");
  if (pedeResistencia && c.cdResistencia !== molde.cdResistencia) {
    avisos.push({
      id: "cd-fora-do-molde",
      nivel: "nota",
      titulo: "CD fora do molde",
      texto:
        `Ela cobra CD ${c.cdResistencia}; o molde de ${rotuloPatamar(c.patamar)} cobra ${molde.cdResistencia}. ` +
        "Nenhuma das duas está errada — mas a CD é a única defesa contra os efeitos dela, e mover essa régua " +
        "muda mais o combate do que mover o dano.",
      correcao: {
        alvo: "criatura",
        campo: "cdResistencia",
        valor: molde.cdResistencia,
        rotulo: `CD: ${c.cdResistencia} → ${molde.cdResistencia} (a do molde)`,
      },
    });
  }

  return avisos.sort((a, b) => ORDEM[a.nivel] - ORDEM[b.nivel]);
}
