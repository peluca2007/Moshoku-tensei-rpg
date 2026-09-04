/**
 * O TEXTO das habilidades contra os DADOS delas.
 *
 * ## Por que existe
 *
 * O `O-QUE-FALTA.md` carrega, desde sempre, a dívida da "auditoria linha a
 * linha das magias": sete árvores conferidas por completo, nove nunca. O
 * `check:arvores` reduziu isso à lista curta de células suspeitas, mas com uma
 * ressalva escrita: *"leitura manual ainda é o que pega texto de habilidade
 * errado, e o script não lê texto."*
 *
 * Este script lê texto. Ele não substitui a leitura — nenhum programa julga se
 * "Finta do Norte" é divertida, ou se o efeito dela faz sentido no mundo. O que
 * ele faz é o trabalho que a leitura manual faz PIOR: conferir, nas ~400
 * habilidades, se a prosa e os campos concordam. Um humano lendo 400 cartas
 * perde a que diz "2 Ações" com `actions: 1` na terceira hora; um `for` não
 * perde nenhuma, e não cansa quando o livro dobrar de tamanho.
 *
 * A divisão é sempre a mesma: o script pega CONTRADIÇÃO (o texto diz uma coisa
 * e o campo diz outra), e a leitura pega INTENÇÃO.
 *
 * ## As regras, e por que cada uma existe
 *
 * Cada uma nasceu de um defeito real achado neste livro — nenhuma é uma boa
 * prática genérica importada de fora.
 *
 *   npm run check:texto
 */
import { TREES } from "../src/data/trees/index";
import { RANKS, type AbilityDef, type TalentDef, type TreeRankDef, type Tree } from "../src/lib/types";

interface Achado {
  gravidade: "FALHA" | "AVISO";
  regra: string;
  onde: string;
  detalhe: string;
}

const achados: Achado[] = [];
const anota = (gravidade: Achado["gravidade"], regra: string, onde: string, detalhe: string) =>
  achados.push({ gravidade, regra, onde, detalhe });

/** Texto do efeito sem os parênteses, onde moram exemplos e ressalvas. */
const semParenteses = (t: string) => t.replace(/\([^)]*\)/g, " ");

/** Verbos que fazem um número em metros ser deslocamento, e não alcance. */
const DESLOCAMENTO =
  /avanc|mova|move|desloc|empurr|arremess|lanç|recu|salt|voa|puxa|corr|gargalo|largura|cai\b|queda|acima|cima|distância de/i;

const NUMERO_ESCRITO: Record<string, number> = {
  uma: 1,
  um: 1,
  duas: 2,
  dois: 2,
  três: 3,
  tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
};

function paraNumero(t: string): number | null {
  const n = Number(t);
  if (Number.isFinite(n)) return n;
  return NUMERO_ESCRITO[t.toLowerCase()] ?? null;
}

for (const tree of TREES) {
  const idsDaArvore = new Set<string>();
  const nomesDaArvore = new Map<string, string>();

  for (const rankDef of tree.ranks as TreeRankDef[]) {
    const ondeRank = `${tree.name} · ${rankDef.rank}`;

    // ------------------------------------------------------------------
    // R6. Assinatura: uma por patamar, nunca duas.
    //
    // A ◆ é "a magia que define o patamar" (Cap. 2) e paga +1 PA por isso.
    // Duas num rank não é um erro de gosto: é o rank cobrando o prêmio duas
    // vezes, e o Apêndice C medindo o patamar pela mais forte das duas.
    // ------------------------------------------------------------------
    const assinaturas = rankDef.abilities.filter((a) => a.signature);
    // Uma ◆ atrás de PRÉ-REQUISITO não é uma segunda assinatura: é a mesma,
    // numa versão melhor. Cavalaria e Escudos faz isso de propósito em cinco
    // patamares — a linha "Puro Escudo" dá a cada rank uma variante Soberana da
    // assinatura dele, disponível só pra quem abriu mão de arma de dano. Quem
    // não comprou o talento usa a versão regular, e ninguém vê as duas.
    const semPorta = assinaturas.filter((a) => !a.requires?.length);
    if (semPorta.length > 1) {
      anota("FALHA", "assinatura duplicada", ondeRank, semPorta.map((a) => a.name).join(", "));
    }
    if (rankDef.abilities.length >= 3 && assinaturas.length === 0) {
      anota("AVISO", "patamar sem assinatura", ondeRank, `${rankDef.abilities.length} habilidades, nenhuma ◆`);
    }

    for (const a of rankDef.abilities as AbilityDef[]) {
      const onde = `${ondeRank} · ${a.name}`;
      const efeito = semParenteses(a.effect);

      // ----------------------------------------------------------------
      // R13. Markdown cru no texto de regra.
      //
      // Nada no projeto renderiza markdown: a ficha, o catálogo do livro, o
      // painel das árvores e o PDF em Typst imprimem o `effect` como está. O
      // Punho do Fogo escrevia `**Ganha 2 de Calor**` em 25 textos — a única
      // das dezenove que fazia isso —, e o que a mesa lia na carta eram os
      // asteriscos. Foram removidos; a regra existe pra que não voltem.
      //
      // Se um dia o livro QUISER negrito, o caminho não é este: é um
      // renderizador compartilhado, e ele teria que existir também no Typst.
      // ----------------------------------------------------------------
      if (/\*\*|__[^_]/.test(a.effect)) {
        anota("FALHA", "markdown cru no texto", onde, "nada no projeto renderiza negrito — sai com os asteriscos");
      }

      // R9/R10. Id e nome repetidos dentro da mesma árvore.
      if (idsDaArvore.has(a.id)) anota("FALHA", "id repetido na árvore", onde, a.id);
      idsDaArvore.add(a.id);
      if (nomesDaArvore.has(a.name)) {
        anota("FALHA", "nome repetido na árvore", onde, `também em ${nomesDaArvore.get(a.name)}`);
      }
      nomesDaArvore.set(a.name, ondeRank);

      // ----------------------------------------------------------------
      // R1. O custo em Ações que o texto anuncia tem que ser o do campo.
      //
      // Várias habilidades abrem com "1 Ação:" ou "2 Ações:" — é a forma que
      // o livro usa pra descrever o passo a passo. Quando esse número diverge
      // de `actions.normal`, a carta impressa e a ficha cobram coisas
      // diferentes pela mesma técnica, e a mesa segue a que leu por último.
      // Só o número NO COMEÇO conta: no meio do texto ele costuma descrever
      // um custo futuro ("gaste a próxima Ação para atacar").
      // ----------------------------------------------------------------
      const abertura = efeito.match(/^\s*(\d+|uma?|duas|dois|três|tres|quatro)\s+Aç(?:ão|ões)\b/i);
      if (abertura && !a.reaction) {
        const dito = paraNumero(abertura[1]);
        if (dito !== null && dito !== a.actions.normal) {
          anota("FALHA", "Ações do texto ≠ do campo", onde, `texto diz ${dito}, campo diz ${a.actions.normal}`);
        }
      }

      // ----------------------------------------------------------------
      // R2. Reação anunciada no texto tem que estar marcada no campo.
      //
      // `reaction: true` é o que tira a técnica do orçamento de 3 Ações do
      // turno no `check:arvores` — uma Reação contada como Ação infla o teto
      // de dano de um turno que não existe. Só a ABERTURA conta: "use também
      // como Reação" é um modo alternativo, e esse não muda o custo normal.
      // ----------------------------------------------------------------
      const abreComReacao = /^\s*(1\s+)?Reação\b/i.test(efeito);
      if (abreComReacao && !a.reaction) {
        anota("FALHA", "Reação no texto sem reaction:true", onde, efeito.slice(0, 70));
      }
      if (a.reaction && !/Reação/i.test(a.effect)) {
        anota("AVISO", "reaction:true sem Reação no texto", onde, "a carta não diz quando ela dispara");
      }

      // ----------------------------------------------------------------
      // R3. Recurso citado na prosa tem que bater com o campo.
      //
      // "gasta 2 PT" escrito no efeito de uma técnica com `ptCost: 1` é o
      // tipo de divergência que só aparece quando alguém rebalanceia o campo
      // e esquece a frase.
      // ----------------------------------------------------------------
      for (const [sigla, campo] of [
        ["PT", a.ptCost],
        ["PM", a.pmCost],
        ["PP", a.ppCost],
      ] as const) {
        const m = efeito.match(new RegExp(`(?:gasta|custa|por)\\s+(\\d+)\\s*${sigla}\\b`, "i"));
        if (m) {
          const dito = Number(m[1]);
          if (dito !== (campo ?? 0)) {
            anota("AVISO", `${sigla} do texto ≠ do campo`, onde, `texto diz ${dito}, campo diz ${campo ?? 0}`);
          }
        }
      }

      // ----------------------------------------------------------------
      // R4. Perícia prometida na prosa não tem onde ser gravada.
      //
      // `grantedSkills` é da ÁRVORE e só vale se ela for a Inicial; não
      // existe campo pra "esta habilidade concede Medicina". A frase existe
      // no livro, a ficha não sabe dela, e o jogador que comprou a técnica
      // fica com uma perícia que nenhuma tela mostra.
      // ----------------------------------------------------------------
      if (
        /\b(concede|ganha|recebe)\b[^.]{0,40}\bperícias?\b/i.test(a.effect) &&
        !(a as { grantsSkills?: string[] }).grantsSkills?.length
      ) {
        const trecho = a.effect.match(/[^.]*\bperícias?\b[^.]*/i)?.[0]?.trim() ?? "";
        anota("AVISO", "perícia concedida sem campo na ficha", onde, trecho.slice(0, 80));
      }

      // ----------------------------------------------------------------
      // R5. Dado citado no efeito e ausente da fórmula de dano.
      //
      // O `damage.normal` é o que o simulador e o `check:arvores` leem. Um
      // "+2d8 contra alvo Em Chamas" que só existe na prosa é dano que
      // nenhuma conta do projeto enxerga.
      // ----------------------------------------------------------------
      if (a.damage?.normal) {
        const naFormula = new Set([...a.damage.normal.matchAll(/\d+d\d+/g)].map((m) => m[0]));
        const noTexto = new Set([...a.effect.matchAll(/\d+d\d+/g)].map((m) => m[0]));
        const soNoTexto = [...noTexto].filter((d) => !naFormula.has(d));
        if (soNoTexto.length) {
          anota("AVISO", "dado só na prosa", onde, `${soNoTexto.join(", ")} não está em damage.normal`);
        }
      }

      // ----------------------------------------------------------------
      // R7. Alcance escrito na prosa e ausente do campo `range`.
      //
      // `range` é o que a ficha e o PDF imprimem. Uma técnica com "até 18
      // metros" no efeito e `range: "Corpo a corpo"` mente na carta.
      // ----------------------------------------------------------------
      // Só distância que é ALCANCE conta. A primeira versão desta regra pegava
      // qualquer número seguido de "m" e devolveu dez falsos positivos de dez:
      // "avance 6m e ataque", "empurrado 3m", "a arma voa 3m", "um gargalo de
      // 3m de largura". Nenhum deles é alcance — são deslocamento, empurrão e
      // cenário. Fica o que o livro escreve como alcance mesmo ("até N
      // metros"), e ainda assim só quando a frase não fala de mover alguém.
      for (const frase of efeito.split(/[.;]/)) {
        const m = frase.match(/(?:até|alcance de)\s+(\d+)\s*(?:m\b|metros?)/i);
        if (!m || DESLOCAMENTO.test(frase)) continue;
        if (/\d|Linha|Cone|Raio|Área|Toque|Pessoal|Visão|Ilimitado|Campo/i.test(a.range)) continue;
        anota("AVISO", "alcance só na prosa", onde, `texto cita ${m[1]}m, range diz "${a.range}"`);
        break;
      }

      // R8. `requires` apontando pra id que não existe na árvore.
      for (const req of a.requires ?? []) {
        const existe = tree.ranks.some(
          (r) => r.abilities.some((x) => x.id === req) || r.talents.some((t) => t.id === req)
        );
        if (!existe) anota("FALHA", "pré-requisito inexistente", onde, req);
      }
    }

    if (rankDef.mastery && /\*\*/.test(rankDef.mastery.description)) {
      anota("FALHA", "markdown cru no texto", `${ondeRank} · Maestria`, "nada no projeto renderiza negrito");
    }

    for (const t of rankDef.talents as TalentDef[]) {
      const onde = `${ondeRank} · ${t.name}`;
      if (/\*\*/.test(t.description)) {
        anota("FALHA", "markdown cru no texto", onde, "nada no projeto renderiza negrito");
      }
      if (idsDaArvore.has(t.id)) anota("FALHA", "id repetido na árvore", onde, t.id);
      idsDaArvore.add(t.id);

      for (const req of t.requires ?? []) {
        const existe = tree.ranks.some(
          (r) => r.abilities.some((x) => x.id === req) || r.talents.some((x) => x.id === req)
        );
        if (!existe) anota("FALHA", "pré-requisito inexistente", onde, req);
      }

      // ----------------------------------------------------------------
      // R11. Reserva prometida na prosa × `grants`.
      //
      // O Cap. 1 promete que "um talento de reserva vale o mesmo em qualquer
      // árvore", e `ReserveGrant` é quem garante isso — o motor aplica o
      // campo, não a frase. Um talento que DIZ "+4 PV por patamar" e não
      // declara `grants` não dá PV nenhum: a promessa fica só impressa.
      // ----------------------------------------------------------------
      const promessa = t.description.match(/\+\s*(\d+)\s*(PV|PM|PT|PP)\b[^.]{0,30}\bpatamar\b/i);
      if (promessa) {
        const valor = Number(promessa[1]);
        const sigla = promessa[2].toUpperCase();
        const chave = { PV: "hpPerRank", PM: "mpPerRank", PT: "ptPerRank", PP: "ppPerRank" }[sigla]!;
        const concedido = (t.grants as Record<string, number> | undefined)?.[chave];
        if (concedido === undefined) {
          anota("FALHA", "reserva prometida sem grants", onde, `texto promete +${valor} ${sigla}/patamar`);
        } else if (concedido !== valor) {
          anota("FALHA", "grants ≠ texto", onde, `texto diz +${valor} ${sigla}, grants diz ${concedido}`);
        }
      }
    }
  }

  // Patamares fora de ordem quebram todo cálculo acumulado (degraus, PT, PV).
  const ordem = tree.ranks.map((r) => RANKS.indexOf(r.rank));
  for (let i = 1; i < ordem.length; i++) {
    if (ordem[i] <= ordem[i - 1]) {
      anota("FALHA", "patamares fora de ordem", tree.name, `${tree.ranks[i - 1].rank} → ${tree.ranks[i].rank}`);
    }
  }

  // --------------------------------------------------------------------
  // R12. Três patamares seguidos com o mesmo dado de PV.
  //
  // A primeira versão desta regra reprovava QUALQUER patamar que repetisse o
  // dado do anterior, e acusou 21 casos em 19 árvores — inclusive na Magia de
  // Fogo e no Deus da Água, que ninguém suspeitava. Vinte e um "defeitos" na
  // primeira execução não é um livro quebrado: é a régua errada. Repetir o dado
  // por DOIS patamares e subir no terceiro é a cadência normal do livro.
  //
  // O que continua sendo defeito é a plataforma: três patamares seguidos no
  // mesmo dado, ou seja, seis a oito PA gastos sem o corpo crescer nenhuma vez.
  // Hoje nenhuma árvore faz isso — a regra existe pra que nenhuma comece.
  // --------------------------------------------------------------------
  let repetidos = 1;
  for (let i = 1; i < tree.ranks.length; i++) {
    const igual = tree.ranks[i].hpDiceFormula === tree.ranks[i - 1].hpDiceFormula;
    repetidos = igual ? repetidos + 1 : 1;
    if (repetidos >= 3) {
      anota(
        "AVISO",
        "PV parado por três patamares",
        `${tree.name} · ${tree.ranks[i].rank}`,
        `${tree.ranks[i].hpDiceFormula} desde ${tree.ranks[i - repetidos + 1].rank}`
      );
    }
  }
}

// ---------------------------------------------------------------------------
const NUNCA_AUDITADAS = new Set([
  "deus-da-agua-corpo",
  "deus-do-norte",
  "armas-pesadas",
  "cavalaria-e-escudos",
  "arquearia",
  "furtividade-e-armadilhas",
  "navegacao-e-lideranca",
  "vendaval",
  "punho-de-fogo",
]);
const nomesNuncaAuditadas = new Set(
  TREES.filter((t: Tree) => NUNCA_AUDITADAS.has(t.id)).map((t) => t.name)
);

console.log("========================================");
console.log("TEXTO × DADOS — as ~400 habilidades do livro");
console.log("========================================");

const falhas = achados.filter((a) => a.gravidade === "FALHA");
const avisos = achados.filter((a) => a.gravidade === "AVISO");

for (const grupo of [falhas, avisos]) {
  if (!grupo.length) continue;
  console.log(`\n${grupo[0].gravidade === "FALHA" ? "FALHAS (o texto e o campo se contradizem)" : "AVISOS (a prosa promete o que a ficha não guarda)"}`);
  const porRegra = new Map<string, Achado[]>();
  for (const a of grupo) porRegra.set(a.regra, [...(porRegra.get(a.regra) ?? []), a]);
  for (const [regra, lista] of porRegra) {
    console.log(`\n  ${regra} (${lista.length})`);
    for (const a of lista) {
      const marca = [...nomesNuncaAuditadas].some((n) => a.onde.startsWith(n)) ? " [nunca auditada]" : "";
      console.log(`    · ${a.onde}${marca}`);
      console.log(`      ${a.detalhe}`);
    }
  }
}

const totalHabilidades = TREES.reduce((n, t) => n + t.ranks.reduce((m, r) => m + r.abilities.length + r.talents.length, 0), 0);
console.log("");
console.log(`Árvores lidas.......................... ${TREES.length}`);
console.log(`Habilidades e talentos lidos........... ${totalHabilidades}`);
console.log(`Falhas................................. ${falhas.length}`);
console.log(`Avisos................................. ${avisos.length}`);
console.log("========================================");

if (falhas.length) {
  console.error(`\n❌ ${falhas.length} contradição(ões) entre o texto impresso e os dados que o site usa.`);
  process.exit(1);
}
console.log("\n✅ Nenhuma contradição entre a prosa das habilidades e os campos delas.");
