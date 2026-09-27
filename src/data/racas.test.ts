import { beforeEach, describe, expect, it } from "vitest";
import { RACES } from "./races";
import { CUSTO_DE_ESCOLHA, type RankName } from "@/lib/types";
import { useCharacterStore } from "@/store/useCharacterStore";
import { getMaxMp, hasRacialUpgrade } from "@/store/selectors";

/*
 * Rework das raças (2026-09-26, decisão do autor): tiers com preço de escolha,
 * dois despertares por raça e a tabela d100 recortada pelo poder.
 */
describe("a tabela d100 das raças", () => {
  it("cobre 1 a 100 sem buraco e sem sobreposição", () => {
    const vistos = new Array(101).fill(0);
    for (const r of RACES) {
      if (!r.rollRange) continue;
      for (let n = r.rollRange[0]; n <= r.rollRange[1]; n++) vistos[n]++;
    }
    expect(vistos.slice(1).every((v) => v === 1)).toBe(true);
  });

  it("quanto maior o tier, mais estreita a faixa", () => {
    const largura = (id: string) => {
      const r = RACES.find((x) => x.id === id)!.rollRange!;
      return r[1] - r[0] + 1;
    };
    const ordem = ["comum", "incomum", "rara", "lendaria", "mitica"] as const;
    const menorDoTier = (t: (typeof ordem)[number]) => Math.min(...RACES.filter((r) => r.tier === t).map((r) => largura(r.id)));
    const maiorDoTier = (t: (typeof ordem)[number]) => Math.max(...RACES.filter((r) => r.tier === t).map((r) => largura(r.id)));
    for (let i = 1; i < ordem.length; i++) expect(maiorDoTier(ordem[i])).toBeLessThan(menorDoTier(ordem[i - 1]));
  });

  it("o Demônio Imortal é lendário, e o Dragão se escolhe pelo preço dele (desde o nerf de 2026-09-27)", () => {
    expect(RACES.find((r) => r.id === "demonio-imortal")!.tier).toBe("lendaria");
    expect(CUSTO_DE_ESCOLHA[RACES.find((r) => r.id === "dragao")!.tier]).toBe(3);
  });

  it("o Dragão não passa do pacote de uma lendária: nada de imunidade, voo livre ou CA +3", () => {
    const dragao = RACES.find((r) => r.id === "dragao")!;
    expect(dragao.bonuses.armorClass ?? 0).toBeLessThanOrEqual(1);
    const soma = Object.values(dragao.bonuses.attributes ?? {}).reduce((a, b) => a + (b ?? 0), 0);
    expect(soma).toBeLessThanOrEqual(2);
    expect(dragao.traits.join(" ")).not.toMatch(/IMUNIDADE|dobro do de caminhada/);
  });
});

describe("despertares", () => {
  it("toda raça tem dois: um no Intermediário e um no Santo", () => {
    for (const r of RACES) {
      expect(r.upgrades?.map((u) => u.patamarMinimo), r.id).toEqual(["Intermediário", "Santo"]);
    }
  });

  beforeEach(() => {
    useCharacterStore.setState({ characters: {}, order: [], activeId: null, history: {} });
    useCharacterStore.getState().createCharacter("Teste");
  });
  const ficha = () => useCharacterStore.getState().characters[useCharacterStore.getState().activeId!];
  /** Abre patamares direto na ficha (o custo em PA não é o que se testa aqui). */
  const abrir = (treeId: string, ranks: RankName[]) => {
    const st = useCharacterStore.getState();
    const id = st.activeId!;
    const c = st.characters[id];
    useCharacterStore.setState({
      characters: { ...st.characters, [id]: { ...c, unlockedRanks: [...c.unlockedRanks, ...ranks.map((rank) => ({ treeId, rank }))] } },
    });
  };

  it("não compra abaixo do patamar, e compra quando chega nele", () => {
    const s = useCharacterStore.getState();
    s.setRace("elfo");
    s.toggleRacialUpgrade("elfo-olhos-da-floresta");
    expect(hasRacialUpgrade(ficha(), "elfo-olhos-da-floresta")).toBe(false);
    abrir("fogo", ["Principiante", "Intermediário"]);
    s.toggleRacialUpgrade("elfo-olhos-da-floresta");
    expect(hasRacialUpgrade(ficha(), "elfo-olhos-da-floresta")).toBe(true);
  });

  it("a Mana Ancestral soma no PM escalar do Elfo", () => {
    const s = useCharacterStore.getState();
    s.setRace("elfo");
    abrir("fogo", ["Principiante", "Intermediário", "Avançado", "Santo"]);
    const antes = getMaxMp(ficha());
    s.toggleRacialUpgrade("elfo-mana-ancestral");
    // Santo = Bônus de Rank 4; o escalar sobe de 2× pra 4×: +8 PM.
    expect(getMaxMp(ficha()) - antes).toBe(8);
  });
});
