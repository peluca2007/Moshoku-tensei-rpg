import { describe, expect, it } from "vitest";
import { FASES_DAS_NOTAS } from "./fasesDasNotas";
import { PATCH_NOTES } from "./patchNotes";

/*
 * A página Novidades mostra o histórico por fase e filtra por área. Estes
 * testes travam o que a página supõe: toda versão cai em exatamente uma fase,
 * as fases seguem a ordem do histórico sem buraco, todo link do "Na mesa"
 * aponta pra uma versão que existe, e toda nota escrita depois se identifica.
 */

const AREAS = ["regras", "livro", "encontros", "site", "desempenho", "bastidores"];
const emOrdemDeData = [...PATCH_NOTES].reverse().map((n) => n.version);
const posicao = (v: string) => emOrdemDeData.indexOf(v);

describe("notas de versão", () => {
  it("não repetem número de versão", () => {
    expect(new Set(emOrdemDeData).size).toBe(emOrdemDeData.length);
  });

  it("dizem a área de todo bloco", () => {
    for (const nota of PATCH_NOTES) for (const s of nota.sections) expect(AREAS, `${nota.version} · ${s.heading}`).toContain(s.area);
  });

  it("marcam a nota escrita depois, e só ela leva o ponto a mais no número", () => {
    for (const nota of PATCH_NOTES) expect(nota.version.split(".").length === 4, nota.version).toBe(!!nota.escritaDepois);
  });

  it("vêm da mais nova pra mais velha", () => {
    for (let i = 1; i < PATCH_NOTES.length; i++) {
      expect(PATCH_NOTES[i - 1].date >= PATCH_NOTES[i].date, `${PATCH_NOTES[i - 1].version} antes de ${PATCH_NOTES[i].version}`).toBe(true);
    }
  });
});

describe("fases das notas", () => {
  it("cobrem o histórico inteiro, em ordem e sem buraco", () => {
    expect(FASES_DAS_NOTAS[0].primeira).toBe(emOrdemDeData[0]);
    expect(FASES_DAS_NOTAS.at(-1)!.ultima).toBe(emOrdemDeData.at(-1));
    FASES_DAS_NOTAS.forEach((fase, i) => {
      expect(posicao(fase.primeira), `${fase.id}: primeira`).toBeGreaterThanOrEqual(0);
      expect(posicao(fase.ultima), `${fase.id}: última`).toBeGreaterThanOrEqual(posicao(fase.primeira));
      if (i > 0) expect(posicao(fase.primeira), `${fase.id} começa logo depois da anterior`).toBe(posicao(FASES_DAS_NOTAS[i - 1].ultima) + 1);
    });
  });

  it("têm id único e um 'Na mesa' com as duas metades", () => {
    expect(new Set(FASES_DAS_NOTAS.map((f) => f.id)).size).toBe(FASES_DAS_NOTAS.length);
    for (const fase of FASES_DAS_NOTAS) {
      expect(fase.mesa.jogador.length, fase.id).toBeGreaterThan(0);
      expect(fase.mesa.mestre.length, fase.id).toBeGreaterThan(0);
    }
  });

  it("só citam versões que existem", () => {
    for (const fase of FASES_DAS_NOTAS) {
      for (const linha of [...fase.mesa.jogador, ...fase.mesa.mestre]) {
        expect(linha.versoes.length, `${fase.id} · ${linha.titulo}`).toBeGreaterThan(0);
        for (const v of linha.versoes) expect(emOrdemDeData, `${fase.id} · ${linha.titulo}`).toContain(v);
      }
    }
  });
});
