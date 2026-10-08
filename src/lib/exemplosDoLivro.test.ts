import { beforeEach, expect, it } from "vitest";
import { useCharacterStore } from "@/store/useCharacterStore";
import { getMaxHp, getMaxMp, getAttackBonus, getSpellDC, getFinalAttribute, getHighestUnlockedRank } from "@/store/selectors";
import { getTreeById } from "@/data/trees";
import { RANKS, RANK_BONUS } from "./types";
import { aplicarDano, novoAlvo, rolarDados, mediaDados } from "./combatSim";
const ficha = () => { const s = useCharacterStore.getState(); return s.characters[s.activeId!]; };
beforeEach(() => { useCharacterStore.setState({ characters: {}, order: [], activeId: null, history: {} }); useCharacterStore.getState().createCharacter("Exemplo"); });
it("Roxy do Apêndice A: 75 PV, 40 PM, BC 10 de Água e 7 de Cura", () => {
    const s = useCharacterStore.getState();
    s.setRace("migurd", false);
    for (const [key, val] of Object.entries({ forca: 0, agilidade: 3, vigor: 2, intelecto: 5, espirito: 5 }))
        s.setAttribute(key as "forca", val);
    useCharacterStore.setState(state => ({ characters: { ...state.characters, [state.activeId!]: { ...ficha(), startingTreeId: "agua", unlockedRanks: [["agua", 4], ["terra", 3], ["vento", 3], ["cura", 2]].flatMap(([id, n]) => RANKS.slice(0, Number(n)).map(rank => ({ treeId: String(id), rank }))) } } }));
    expect(getMaxHp(ficha())).toBe(75);
    expect(getMaxMp(ficha())).toBe(40);
    expect(getAttackBonus(ficha(), "agua", "intelecto")).toBe(10);
    expect(getAttackBonus(ficha(), "cura", "espirito")).toBe(7);
});
it("Borg usa Improviso CD 8 + Força 3 + Rank 1 = 12", () => {
    const s = useCharacterStore.getState();
    s.setStartingTree("deus-do-norte");
    s.setAttribute("forca", 3);
    expect(getTreeById("deus-do-norte")!.ranks[0].mastery!.description).toContain("CD 8 + Força + Rank");
    expect(getSpellDC(ficha(), "deus-do-norte", "forca")).toBe(12);
});
it("Concentração: CD 13, Espírito 2 e metade do Rank 3 dão 40% e 78,4% em três", () => {
    const s = useCharacterStore.getState();
    s.setStartingTree("agua");
    s.setAttribute("espirito", 2);
    const bonus = getFinalAttribute(ficha(), "espirito") + Math.ceil(RANK_BONUS["Avançado"] / 2);
    const falhas = Array.from({ length: 20 }, (_, i) => i + 1).filter(d => d + bonus < 10 + RANK_BONUS["Avançado"]).length / 20;
    expect(falhas).toBe(0.4);
    expect(1 - (1 - falhas) ** 3).toBeCloseTo(0.784);
});
it("Bola de Fogo do Cap. 2: médias 7,5 e 3,5 por 1 PM", () => {
    const a = getTreeById("fogo")!.ranks[0].abilities.find(a => a.id === "bola-de-fogo")!;
    expect(a.pmCost).toBe(1);
    expect(a.actions.normal).toBe(2);
    expect(a.actions.encurtada).toBe(1);
    expect(mediaDados(a.damage!.normal) + 3).toBe(7.5);
    const valores = Array.from({ length: 8 }, (_, i) => Math.floor((rolarDados(a.damage!.normal, () => i / 8 + 0.001) + 3) / 2));
    expect(valores.reduce((s, v) => s + v, 0) / 8).toBe(3.5);
});
it("Defender e Casco: 17 → 15 → 7", () => {
    const reducao = Math.max(0, 0 + Math.ceil(RANK_BONUS["Avançado"] / 2));
    expect(17 - reducao).toBe(15);
    const alvo = novoAlvo({ nome: "Escudeiro", pv: 30, ca: 15, resistencias: ["cortante"] });
    expect(aplicarDano(alvo, 17 - reducao, 3, undefined, false, "cortante")).toBe(7);
});
it("Água Imperador de Espírito 6 tem 44 PM; Zero Absoluto custa 20", () => {
    const s = useCharacterStore.getState();
    s.setStartingTree("agua");
    s.setAttribute("espirito", 6);
    useCharacterStore.setState(state => ({ characters: { ...state.characters, [state.activeId!]: { ...ficha(), unlockedRanks: RANKS.slice(0, 6).map(rank => ({ treeId: "agua", rank })) } } }));
    expect(getHighestUnlockedRank(ficha(), "agua")).toBe("Imperador");
    expect(getMaxMp(ficha())).toBe(44);
    expect(getTreeById("agua")!.ranks[5].abilities.find(a => a.name === "Zero Absoluto")!.pmCost).toBe(20);
});
