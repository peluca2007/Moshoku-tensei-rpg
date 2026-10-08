/**
 * O DIA DE AVENTURA — `npm run medir:dia-de-aventura` (Tarefa 14d, 2026-10-08).
 *
 * A pergunta do autor: o mago chega na 3ª e na 4ª luta do dia com PM pra
 * alguma coisa? Uma luta isolada não responde, porque todo encontro começava
 * com o grupo descansado. Aqui cada trajetória é um dia: quatro lutas de 4
 * criaturas do molde (Equilibrado, Apêndice G), uma depois da outra, e cada
 * luta começa de onde a anterior parou (`reservasIniciais` do motor). Morto não
 * volta; caído estabilizado acorda no Descanso Curto se o 1d4 de horas couber.
 *
 * O Descanso Curto é o do Cap. 4, §7: PT inteiro, PV, PM e PP +25% do máximo, e
 * mais PV por Cuidar dos Ferimentos (Vigor + 2 × o maior Bônus de Rank, um por
 * criatura, 10 usos de kit). No grupo com Cura, a curandeira cura depois de
 * toda luta (a Cura do Principiante, 2 PM, 1d8 + BC): levanta quem caiu e
 * trata quem está abaixo da metade, guardando 25% do PM pra próxima luta.
 *
 * Três rotinas: sem descanso, um Curto depois da 2ª luta, e dois Curtos
 * (depois da 1ª e da 3ª), o teto do livro. Dois grupos: o de calibragem do
 * molde (Fogo, Norte, Arco, Cura) e o mesmo com um Lutador no lugar da Cura,
 * que leva Medicina e o kit.
 *
 * Grava `_local/docs/RELATORIO-DIA.md` e imprime a tabela.
 *   npm run medir:dia-de-aventura
 *   DIAS=200 PATAMARES=1,3,5 npm run medir:dia-de-aventura
 */
const armazenamento = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    get length() { return armazenamento.size; },
    clear: () => armazenamento.clear(),
    getItem: (k: string) => armazenamento.get(k) ?? null,
    key: (i: number) => [...armazenamento.keys()][i] ?? null,
    removeItem: (k: string) => { armazenamento.delete(k); },
    setItem: (k: string, v: string) => { armazenamento.set(k, v); },
  } satisfies Storage,
});
Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: globalThis.localStorage } });

const { writeFileSync, mkdirSync } = await import("node:fs");
const { GRUPO, montar } = await import("./lib/grupoDoKit");
const { criaturaDoMolde, simularEncontro } = await import("@/lib/encounterSim");
const { montarFicha, makeRng } = await import("@/lib/combatSim");
const { getFinalAttribute } = await import("@/store/selectors");
const { RANK_BONUS, RANKS } = await import("@/lib/types");
type CharacterData = import("@/lib/types").CharacterData;
type ReservasIniciais = import("@/lib/combatScenario").ReservasIniciais;
type EstadoFinal = import("@/lib/combatScenario").EstadoFinalDoPersonagem;

const DIAS = Number(process.env.DIAS ?? 120);
const PATAMARES = (process.env.PATAMARES ?? "1,2,3,4,5,6").split(",").map(Number);
const LUTAS = 4;
const ROTINAS: Record<string, number[]> = { "sem descanso": [], "Curto após a 2ª": [2], "Curtos após a 1ª e a 3ª": [1, 3] };

const maiorBonus = (c: CharacterData) => c.unlockedRanks.reduce((m, u) => Math.max(m, RANK_BONUS[u.rank]), 0);

function grupoDe(patamar: number, comCura: boolean): CharacterData[] {
  const membros = comCura ? GRUPO : [...GRUPO.slice(0, 3), { nome: "Brom", arvore: "armas-pesadas", principal: "forca" as const, corpo: true }];
  return membros.map((g) => montar(g, patamar));
}

interface Somas { pmChegada: number[]; ptChegada: number[]; dano: number[]; vitoria: number[]; quedas: number[]; mortes: number; magoPm: number[] }

function umDia(grupo: CharacterData[], descansos: number[], semente: number, comCura: boolean, s: Somas) {
  const fichas = new Map(grupo.map((c) => [c.id, montarFicha(c, "")]));
  const rng = makeRng(semente);
  let estado: Record<string, ReservasIniciais> = {};
  let kit = 10;
  let curtos = 0;
  const mago = grupo.find((c) => c.startingTreeId === "fogo")!;
  for (let luta = 0; luta < LUTAS; luta++) {
    const vivos = grupo.filter((c) => !estado[c.id]?.morto);
    if (vivos.every((c) => (estado[c.id]?.pv ?? 1) <= 0)) break;
    const chegada = (c: CharacterData, campo: "pm" | "pt", max: number) => (estado[c.id]?.[campo] ?? max) / Math.max(1, max);
    s.pmChegada[luta] += grupo.filter((c) => fichas.get(c.id)!.pmMax > 0).reduce((t, c, _, arr) => t + chegada(c, "pm", fichas.get(c.id)!.pmMax) / arr.length, 0);
    s.ptChegada[luta] += grupo.filter((c) => fichas.get(c.id)!.ptMax > 0).reduce((t, c, _, arr) => t + chegada(c, "pt", fichas.get(c.id)!.ptMax) / arr.length, 0);
    s.magoPm[luta] += chegada(mago, "pm", fichas.get(mago.id)!.pmMax);
    const patamar = RANKS.indexOf(grupo[0].unlockedRanks.at(-1)!.rank) + 1;
    const r = simularEncontro(grupo, [{ ...criaturaDoMolde(patamar, "padrao", "Criatura", "c"), tatica: "aleatorio", quantidade: 4 }], {
      batalhas: 1, semente: semente * 10 + luta, registrarEstados: true, reservasIniciais: estado,
    });
    const fim = r.estadosPorBatalha![0];
    s.vitoria[luta] += fim.resultado === "vitoria" ? 1 : 0;
    s.quedas[luta] += fim.personagens.filter((p) => p.caiu).length;
    s.dano[luta] += r.porPersonagem.find((p) => p.id === mago.id)!.danoMedio / Math.max(1, fim.rodadas);
    estado = Object.fromEntries(fim.personagens.map((p: EstadoFinal) => [p.id, { ...p }]));
    if (fim.resultado !== "vitoria") break;

    if (descansos.includes(luta + 1) && curtos < 2) {
      curtos++;
      for (const c of grupo) {
        const e = estado[c.id]; const f = fichas.get(c.id)!;
        if (!e || e.morto) continue;
        e.pt = f.ptMax;
        e.pm = Math.min(f.pmMax, (e.pm ?? 0) + Math.floor(f.pmMax / 4));
        e.pp = Math.min(f.ppMax ?? 0, (e.pp ?? 0) + Math.floor((f.ppMax ?? 0) / 4));
        // Estabilizado acorda com 1 PV em 1d4 horas; o Curto dura 1 a 2.
        if ((e.pv ?? 0) <= 0 && e.estabilizado && Math.floor(rng() * 4) + 1 <= 2) { e.pv = 1; e.marcasDaMorte = 0; }
        // O Curto devolve 25% dos PV máximos a quem está de pé (Cap. 4, §7, desde 0.1.155).
        if ((e.pv ?? 0) > 0) e.pv = Math.min(f.pvMax, (e.pv ?? 0) + Math.floor(f.pvMax / 4));
      }
      if (!comCura) {
        const acordados = grupo.filter((c) => !estado[c.id]?.morto && (estado[c.id]?.pv ?? 0) > 0);
        for (const c of acordados) {
          if (kit <= 0) break;
          const e = estado[c.id]; const f = fichas.get(c.id)!;
          if ((e.pv ?? f.pvMax) >= f.pvMax) continue;
          kit--;
          e.pv = Math.min(f.pvMax, (e.pv ?? 0) + Math.max(1, getFinalAttribute(c, "vigor") + 2 * maiorBonus(c)));
        }
      }
    }

    // A curandeira cura depois de TODA luta, não só no descanso: é o que a mesa
    // faz. Primeiro levanta quem caiu (qualquer cura acorda e apaga as Marcas,
    // Cap. 4, §7), depois quem está abaixo da metade. Guarda 25% do PM pra
    // próxima luta. Fora de combate não há Ferida Fresca: 1d8 + BC.
    if (comCura) {
      const cura = grupo.find((c) => c.startingTreeId === "cura")!;
      const ec = estado[cura.id]; const fc = fichas.get(cura.id)!;
      if (ec && !ec.morto && (ec.pv ?? 0) > 0) {
        const bc = getFinalAttribute(cura, "espirito") + maiorBonus(cura);
        const reserva = Math.ceil(fc.pmMax / 4);
        for (let guarda = 0; guarda < 40 && (ec.pm ?? 0) - 2 >= reserva; guarda++) {
          const candidatos = grupo
            .map((c) => ({ c, e: estado[c.id], f: fichas.get(c.id)! }))
            .filter((x) => x.e && !x.e.morto && (x.e.pv ?? 0) < x.f.pvMax / 2)
            .sort((a, b) => (a.e.pv ?? 0) / a.f.pvMax - (b.e.pv ?? 0) / b.f.pvMax);
          const alvo = candidatos[0];
          if (!alvo) break;
          ec.pm = (ec.pm ?? 0) - 2;
          if ((alvo.e.pv ?? 0) <= 0) { alvo.e.marcasDaMorte = 0; alvo.e.estabilizado = false; alvo.e.pv = 0; }
          alvo.e.pv = Math.min(alvo.f.pvMax, (alvo.e.pv ?? 0) + Math.floor(rng() * 8) + 1 + bc);
        }
      }
    }
  }
  const mortos = Object.values(estado).filter((e) => e.morto).length;
  s.mortes += mortos;
}

const pct = (n: number) => `${Math.round(n * 100)}%`;
const linhas: string[] = [];
const cabecalho = "| Patamar | Grupo | Rotina | PM do mago na chegada (1ª→4ª) | PT na chegada | Vitória por luta | Dano/turno do mago | Mortes por dia |";
linhas.push(cabecalho, "| --- | --- | --- | --- | --- | --- | --- | --- |");
for (const patamar of PATAMARES) {
  for (const comCura of [true, false]) {
    const grupo = grupoDe(patamar, comCura);
    for (const [nome, descansos] of Object.entries(ROTINAS)) {
      const s: Somas = { pmChegada: [0, 0, 0, 0], ptChegada: [0, 0, 0, 0], dano: [0, 0, 0, 0], vitoria: [0, 0, 0, 0], quedas: [0, 0, 0, 0], mortes: 0, magoPm: [0, 0, 0, 0] };
      for (let d = 0; d < DIAS; d++) umDia(grupo, descansos, 20261008 + patamar * 1000 + d, comCura, s);
      // Média sobre os DIAS: luta que não aconteceu (o grupo caiu antes) conta zero de vitória.
      const linha = `| ${patamar}º | ${comCura ? "com Cura" : "sem Cura (kit)"} | ${nome} | ${s.magoPm.map((x) => pct(x / DIAS)).join(" → ")} | ${s.ptChegada.map((x) => pct(x / DIAS)).join(" → ")} | ${s.vitoria.map((x) => pct(x / DIAS)).join(" → ")} | ${s.dano.map((x) => (x / DIAS).toFixed(1)).join(" → ")} | ${(s.mortes / DIAS).toFixed(2)} |`;
      linhas.push(linha);
      console.log(linha);
    }
  }
}

const relatorio = [
  "# O dia de aventura (Tarefa 14d, Claude, 2026-10-08)",
  "",
  `Quatro lutas de 4 criaturas do molde (Equilibrado) por dia, ${DIAS} dias por linha, motor com reservas encadeadas. Método no cabeçalho de scripts/medir-dia-de-aventura.mts.`,
  "Percentuais de PM/PT são da reserva máxima, em média sobre todos os dias (o dia que acabou antes conta a reserva de quem chegou). Vitória por luta é a fração dos dias em que aquela luta foi vencida.",
  "",
  ...linhas,
  "",
].join("\n");
mkdirSync("_local/docs", { recursive: true });
writeFileSync("_local/docs/RELATORIO-DIA.md", relatorio);
console.log("\n_local/docs/RELATORIO-DIA.md");
