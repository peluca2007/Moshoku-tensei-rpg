/**
 * A RÉGUA DO APÊNDICE C, GERADA PELO SIMULADOR — `npm run gerar:regua`
 * (2026-10-08, decisão do autor A-1: "a régua sai do simulador, com o método
 * escrito no livro").
 *
 * Até aqui a régua era escrita à mão (danoPorTurno.ts) e conferida por
 * `medir:regua` e `check:numeros`. A conferência mostrava a mão e o motor
 * longe demais — magia de 1º patamar prometendo ~16 e entregando ~5 —, e boa
 * parte da distância era do instrumento (o truque da escola não entrava). Agora
 * o número impresso É a medição, e o método está escrito uma vez só, aqui e no
 * campo `metodo` do JSON, que o livro imprime.
 *
 * Grava `src/data/reguaMedida.json`. Determinístico: a mesma semente e o mesmo
 * código dão o mesmo arquivo. O `hash` é o dos arquivos que decidem o número
 * (árvores, moldes, motor, montador): quando um deles muda, `check:regua`
 * reprova até alguém rodar isto de novo.
 *
 *   npm run gerar:regua
 *   BATALHAS=400 npm run gerar:regua     (mais preciso, mais lento)
 */
import { writeFileSync } from "node:fs";
import { montar } from "./lib/montar-medicao.mjs";
import { hashDaRegua } from "./lib/hash-da-regua.mjs";
import { COLUNAS_CORPO, COLUNAS_MAGIA } from "@/data/danoPorTurno";
import { criaturaDoMolde, simularEncontro } from "@/lib/encounterSim";

const BATALHAS = Number(process.env.BATALHAS ?? 200);
const SEMENTE = 20261008;
const REFERENCIA = ["deus-do-norte", "fogo", "cura"];

export const METODO =
  "Cada número é o dano médio por turno de um personagem que vive naquela árvore, medido pelo mesmo simulador do /encontros. " +
  "O personagem abre todos os ranks da árvore até o patamar, faz até quatro compras por rank (as de combate primeiro) e tem o truque da escola; " +
  "o atributo principal sobe de 4 (1º) a 8 (6º), com o kit inicial da árvore. " +
  "Ele luta num grupo de quatro, ao lado de um Deus do Norte, um mago de Fogo e um curandeiro do mesmo patamar, " +
  "contra cinco criaturas do molde do patamar (Apêndice G), que escolhem o alvo ao acaso. " +
  "O primeiro número é essa luta: conta o acerto rolado, o recurso que acaba, a área que pega mais de um e o turno perdido de quem cai. " +
  "O segundo é a mesma luta contra uma criatura só, com o PV das cinco somado: mostra o dano de quem não cai e não tem com quem dividir a área. " +
  "Média de várias centenas de lutas, com semente fixa; o turno é a rodada inteira da luta, do começo até o fim.";

interface Linha {
  treeId: string;
  patamar: number;
  /** Contra as cinco criaturas do molde. */
  grupo: number;
  /** Contra uma criatura com o PV das cinco. */
  alvo: number;
  /** PV curados por turno (a coluna da Cura mede isto, não dano). */
  cura: number;
  /** Fração de lutas em que o personagem terminou de pé, contra as cinco. */
  sobrevive: number;
}

function medir(treeId: string, patamar: number, umAlvo: boolean) {
  const ref = REFERENCIA.map((id) => montar(id, patamar, `ref-${id}`));
  const heroi = montar(treeId, patamar, `regua-${treeId}`);
  const molde = criaturaDoMolde(patamar, "padrao", "Molde", "molde");
  const criatura = umAlvo
    ? { ...molde, pv: molde.pv * 5, tatica: "aleatorio" as const, quantidade: 1 }
    : { ...molde, tatica: "aleatorio" as const, quantidade: 5 };
  const r = simularEncontro([...ref, heroi], [criatura], { batalhas: BATALHAS, semente: SEMENTE });
  const eu = r.porPersonagem.find((p) => p.id === heroi.id)!;
  return { dano: eu.danoMedio / r.rodadasMedia, cura: eu.curaMedia / r.rodadasMedia, sobrevive: eu.sobreviveu };
}

const um = (n: number) => Math.round(n * 10) / 10;
const linhas: Linha[] = [];
for (const coluna of [...COLUNAS_MAGIA, ...COLUNAS_CORPO]) {
  for (let patamar = 1; patamar <= 6; patamar++) {
    const g = medir(coluna.treeId, patamar, false);
    const a = medir(coluna.treeId, patamar, true);
    linhas.push({ treeId: coluna.treeId, patamar, grupo: um(g.dano), alvo: um(a.dano), cura: um(g.cura), sobrevive: um(g.sobrevive * 100) / 100 });
    process.stdout.write(`  ${coluna.label} ${patamar}º: ${um(g.dano)} · ${um(a.dano)}\n`);
  }
}

const saida = { metodo: METODO, batalhas: BATALHAS, semente: SEMENTE, hash: hashDaRegua(), linhas };
writeFileSync("src/data/reguaMedida.json", JSON.stringify(saida, null, 1) + "\n");
console.log(`\nsrc/data/reguaMedida.json — ${linhas.length} células, ${BATALHAS} batalhas cada.`);
