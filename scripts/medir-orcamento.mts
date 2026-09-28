/**
 * O ORÇAMENTO DE ENCONTRO CONTRA O SIMULADOR — `npm run medir:orcamento`.
 *
 * O Apêndice G ensina a montar um encontro por conta ("uma criatura do
 * patamar por jogador é Equilibrado"). O /encontros simula a luta e dá um
 * veredito. Em 2026-09-26 os dois discordavam: quatro criaturas de 2º patamar
 * contra o kit de mesa davam Letal. Este script mede a conta nos seis
 * patamares, pra que a regra do livro seja a que o simulador confirma.
 *
 * O grupo é o do kit de mesa (Fogo, Norte, Tático, Cura), subido patamar a
 * patamar: cada ficha abre todos os ranks da própria árvore até o patamar e
 * faz quatro compras em cada rank (a assinatura e as técnicas seguintes,
 * completando com talentos). O atributo principal segue a régua do Apêndice C (4 no 1º, 8 no
 * 6º); o Vigor fica em 2 no Corpo e em 1 nos outros. Não é uma build ótima:
 * é uma build honesta, do tipo que a mesa monta.
 *
 * As criaturas são o molde do patamar (Apêndice G), papel "padrão", sem ações
 * escritas — o encontro que o Mestre monta só com a conta.
 */
import { useCharacterStore } from "@/store/useCharacterStore";
import { getTreeById } from "@/data/trees";
import { criaturaDoMolde, simularEncontro } from "@/lib/encounterSim";
import { ajustarParaEquilibrio, aplicarEscalaAoEncontro, avaliar } from "@/lib/encounterBalance";
import { MOLDES_CRIATURA } from "@/data/bestiary";
import { RANKS, type AttributeKey, type CharacterData } from "@/lib/types";

const BATALHAS = Number(process.env.BATALHAS ?? 300);
const PRINCIPAL = [4, 4, 5, 6, 7, 8];

/*
 * O quarto lugar (2026-09-27). O kit de mesa tem uma Tática (Vela), e o motor
 * não enxerga o Tático: ela entrava na conta como um alvo que não faz nada, e
 * os moldes foram calibrados contra um grupo de TRÊS. Até o motor aprender o
 * Tático (Tarefa 6 do Codex), a calibragem usa uma Arqueira — a mediana do
 * `npm run balancear`. `GRUPO=kit` volta ao kit de mesa.
 */
const QUARTO =
  process.env.GRUPO === "kit"
    ? { nome: "Vela", arvore: "navegacao-e-lideranca", principal: "espirito" as AttributeKey, corpo: false }
    : { nome: "Mira", arvore: "arquearia", principal: "agilidade" as AttributeKey, corpo: true };

const GRUPO: { nome: string; arvore: string; principal: AttributeKey; corpo: boolean }[] = [
  { nome: "Ignis", arvore: "fogo", principal: "intelecto", corpo: false },
  { nome: "Borrasca", arvore: "deus-do-norte", principal: "agilidade", corpo: true },
  QUARTO,
  { nome: "Sella", arvore: "cura", principal: "espirito", corpo: false },
];

function montar(g: (typeof GRUPO)[number], patamar: number): CharacterData {
  const s = useCharacterStore.getState();
  s.createCharacter(`${g.nome} ${patamar}º`);
  s.setRace("humano", false);
  s.setAttribute(g.principal, PRINCIPAL[patamar - 1]);
  s.setAttribute("vigor", g.corpo ? 3 : 2);
  s.setStartingTree(g.arvore);
  const arvore = getTreeById(g.arvore)!;
  for (const rank of RANKS.slice(0, patamar)) {
    useCharacterStore.getState().unlockRank(g.arvore, rank);
    const def = arvore.ranks.find((r) => r.rank === rank);
    if (!def) continue;
    // Quatro compras por patamar: a assinatura, as técnicas seguintes, e
    // talentos pra completar (o Tático tem uma técnica só por patamar, e o
    // patamar seguinte pede 3 conhecimentos na árvore).
    const tecnicas = [...def.abilities.filter((a) => a.signature), ...def.abilities.filter((a) => !a.signature)].slice(0, 3);
    const compras = [
      ...tecnicas.map((a) => ({ kind: "ability" as const, id: a.id })),
      ...def.talents.map((t) => ({ kind: "talent" as const, id: t.id })),
    ].slice(0, 4);
    for (const c of compras) useCharacterStore.getState().purchaseAbility({ treeId: g.arvore, rank, ...c });
  }
  const fim = useCharacterStore.getState();
  return fim.characters[fim.activeId!];
}

console.log(`Grupo do kit (4 jogadores) contra N criaturas do molde do mesmo patamar — ${BATALHAS} batalhas cada.\n`);
console.log("| Patamar | " + [1, 2, 3, 4, 5].map((n) => `${n} criatura${n > 1 ? "s" : ""}`).join(" | ") + " | Chefe |");
console.log("| --- | " + [1, 2, 3, 4, 5].map(() => "---").join(" | ") + " | --- |");
for (let patamar = 1; patamar <= 6; patamar++) {
  const grupo = GRUPO.map((g) => montar(g, patamar));
  const celulas: string[] = [];
  const casos = [1, 2, 3, 4, 5].map((n) => ({ ...criaturaDoMolde(patamar, "padrao", "Criatura", `c${patamar}`), quantidade: n }));
  for (const c of casos) {
    const r = simularEncontro(grupo, [c], { batalhas: BATALHAS });
    celulas.push(`${avaliar(r).titulo} ${(r.vitorias * 100).toFixed(0)}% · ${r.quedasMedia.toFixed(1)}q`);
  }
  const chefe = { ...criaturaDoMolde(patamar, "chefe", "Chefe", `k${patamar}`), quantidade: 1 };
  const rc = simularEncontro(grupo, [chefe], { batalhas: BATALHAS });
  celulas.push(`${avaliar(rc).titulo} ${(rc.vitorias * 100).toFixed(0)}% · ${rc.quedasMedia.toFixed(1)}q`);
  console.log(`| ${patamar}º | ${celulas.join(" | ")} |`);
}

// A escala do molde que põe "uma criatura por jogador" em 92% de vitória.
if (process.argv.includes("--escala")) {
  console.log("\n| Patamar | Escala | PV do molde | Dano do molde | Vitória | Quedas |");
  console.log("| --- | --- | --- | --- | --- | --- |");
  for (let patamar = 1; patamar <= 6; patamar++) {
    const grupo = GRUPO.map((g) => montar(g, patamar));
    const base = [{ ...criaturaDoMolde(patamar, "padrao", "Criatura", `c${patamar}`), quantidade: 4 }];
    const aj = ajustarParaEquilibrio((e) => simularEncontro(grupo, aplicarEscalaAoEncontro(base, e), { batalhas: BATALHAS }));
    const m = MOLDES_CRIATURA[patamar - 1];
    console.log(aj ? `| ${patamar}º | ${aj.escala.toFixed(2)} | ${m.pv} → ${Math.round(m.pv * aj.escala)} | ${m.danoPorTurno} → ${Math.round(m.danoPorTurno * aj.escala)} | ${(aj.vitoriaProjetada * 100).toFixed(0)}% | ${aj.quedasProjetadas.toFixed(1)} |` : `| ${patamar}º | — |`);
  }
}

// O chefe: a escala que põe UM chefe contra os 4 jogadores em 92% de vitória.
if (process.argv.includes("--chefe")) {
  console.log("\n| Patamar | Escala do chefe | Vitória | Quedas |");
  console.log("| --- | --- | --- | --- |");
  for (let patamar = 1; patamar <= 6; patamar++) {
    const grupo = GRUPO.map((g) => montar(g, patamar));
    const base = [{ ...criaturaDoMolde(patamar, "chefe", "Chefe", `k${patamar}`), quantidade: 1 }];
    const aj = ajustarParaEquilibrio((e) => simularEncontro(grupo, aplicarEscalaAoEncontro(base, e), { batalhas: BATALHAS }));
    console.log(aj ? `| ${patamar}º | ${aj.escala.toFixed(2)} | ${(aj.vitoriaProjetada * 100).toFixed(0)}% | ${aj.quedasProjetadas.toFixed(1)} |` : `| ${patamar}º | — |`);
  }
}

// O chefe só com PV a mais (o dano por golpe fica o do molde).
if (process.argv.includes("--chefe-pv")) {
  for (const patamar of [1, 3, 6]) {
    const grupo = GRUPO.map((g) => montar(g, patamar));
    const linha: string[] = [];
    for (const mult of [2, 3, 4, 5, 6]) {
      const c = { ...criaturaDoMolde(patamar, "chefe", "Chefe", `k${patamar}`), quantidade: 1 };
      c.pv = Math.round((c.pv / 2) * mult);
      const r = simularEncontro(grupo, [c], { batalhas: BATALHAS });
      linha.push(`PV×${mult}: ${avaliar(r).titulo} ${(r.vitorias * 100).toFixed(0)}% ${r.quedasMedia.toFixed(1)}q ${r.rodadasMedia.toFixed(1)}r`);
    }
    console.log(`${patamar}º — ${linha.join(" | ")}`);
  }
}
