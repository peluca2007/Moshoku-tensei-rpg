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
 * Alvo aleatório (2026-09-27): na ordem do grupo, o primeiro da lista
 * apanhava tudo e o resultado dependia de quem foi escrito primeiro.
 */
import { criaturaDoMolde, simularEncontro } from "@/lib/encounterSim";
import { ajustarParaEquilibrio, aplicarEscalaAoEncontro, avaliar } from "@/lib/encounterBalance";
import { MOLDES_CRIATURA } from "@/data/bestiary";
import { GRUPO, montar } from "./lib/grupoDoKit";

const BATALHAS = Number(process.env.BATALHAS ?? 300);
console.log(`Grupo do kit (4 jogadores) contra N criaturas do molde do mesmo patamar — ${BATALHAS} batalhas cada.\n`);
console.log("| Patamar | " + [1, 2, 3, 4, 5].map((n) => `${n} criatura${n > 1 ? "s" : ""}`).join(" | ") + " | Chefe |");
console.log("| --- | " + [1, 2, 3, 4, 5].map(() => "---").join(" | ") + " | --- |");
for (let patamar = 1; patamar <= 6; patamar++) {
  const grupo = GRUPO.map((g) => montar(g, patamar));
  const celulas: string[] = [];
  const casos = [1, 2, 3, 4, 5].map((n) => ({ ...criaturaDoMolde(patamar, "padrao", "Criatura", `c${patamar}`), tatica: "aleatorio" as const, quantidade: n }));
  for (const c of casos) {
    const r = simularEncontro(grupo, [c], { batalhas: BATALHAS });
    celulas.push(`${avaliar(r).titulo} ${(r.vitorias * 100).toFixed(0)}% · ${r.quedasMedia.toFixed(1)}q`);
  }
  const chefe = { ...criaturaDoMolde(patamar, "chefe", "Chefe", `k${patamar}`), tatica: "aleatorio" as const, quantidade: 1 };
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
    const base = [{ ...criaturaDoMolde(patamar, "padrao", "Criatura", `c${patamar}`), tatica: "aleatorio" as const, quantidade: 4 }];
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
    const base = [{ ...criaturaDoMolde(patamar, "chefe", "Chefe", `k${patamar}`), tatica: "aleatorio" as const, quantidade: 1 }];
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
      const c = { ...criaturaDoMolde(patamar, "chefe", "Chefe", `k${patamar}`), tatica: "aleatorio" as const, quantidade: 1 };
      c.pv = Math.round((c.pv / 2) * mult);
      const r = simularEncontro(grupo, [c], { batalhas: BATALHAS });
      linha.push(`PV×${mult}: ${avaliar(r).titulo} ${(r.vitorias * 100).toFixed(0)}% ${r.quedasMedia.toFixed(1)}q ${r.rodadasMedia.toFixed(1)}r`);
    }
    console.log(`${patamar}º — ${linha.join(" | ")}`);
  }
}
