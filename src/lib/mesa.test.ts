import { beforeEach, describe, expect, it } from "vitest";
import { useCharacterStore } from "@/store/useCharacterStore";
import { getMaxHp, getDeslocamento, getFinalAttribute } from "@/store/selectors";
import { mesaDa, getPvNaMesa, hpAtualNaMesa, fioDaVida } from "./mesa";
import { lerLimite, limitesDaFicha } from "./limitesDeUso";
const ficha = () => { const s = useCharacterStore.getState(); return s.characters[s.activeId!]; };
beforeEach(() => { useCharacterStore.setState({ characters: {}, order: [], activeId: null, history: {} }); useCharacterStore.getState().createCharacter("Mesa"); useCharacterStore.getState().setStartingTree("agua"); });
describe("limites da prosa, sem adivinhar", () => {
    it("reconhece a Inspiração real e os fatos livres", () => {
        expect(lerLimite("Número de vezes por Descanso Longo igual ao seu Espírito.", 3, 2)).toMatchObject({ periodo: "longo", quantidade: 3 });
        expect(lerLimite("Fatos livres por sessão = o seu Bônus de Rank naquela árvore.", 3, 2)).toMatchObject({ periodo: "sessao", quantidade: 2 });
    });
  it("rejeita turno, recarga, ambiguidade e quantidade não entendida", () => {
        for (const t of ["Uma vez por turno.", "Recupera 2 PM por Descanso Curto.", "Uma vez por combate, duas vezes por sessão.", "Você ganha usos por sessão."])
            expect(lerLimite(t, 3, 2)).toBeNull();
        expect(lerLimite("Uma vez por combate, você age.", 3, 2)).toMatchObject({ periodo: "combate", quantidade: 1 });
  });
  it("três usos de Improviso substituem o limite anterior, sem duplicar o recurso",()=>{
    expect(lerLimite("O Improviso pode ser usado três vezes por combate.",3,5)).toMatchObject({quantidade:3,periodo:"combate"});
    const c={...ficha(),unlockedRanks:["Principiante","Intermediário","Avançado","Santo","Rei"].map(rank=>({treeId:"deus-do-norte",rank:rank as "Rei"}))};
    const improvisos=limitesDaFicha(c).filter(e=>/O Improviso/.test(e.texto)&&e.limite);
    expect(improvisos).toHaveLength(1);expect(improvisos[0].limite?.quantidade).toBe(3);
  });
    it("reseta só o período certo, longo também recupera curto", () => {
        useCharacterStore.getState().setStartingTree("bardo-e-interacao");
        useCharacterStore.getState().setAttribute("espirito", 3);
        useCharacterStore.getState().purchaseAbility({ treeId: "bardo-e-interacao", rank: "Principiante", kind: "ability", id: "inspiracao" });
        const entradas = limitesDaFicha(ficha()).filter(e => e.limite);
        const insp = entradas.find(e => e.nome === "Inspiração")!;
        const fatos = entradas.find(e => e.nome.startsWith("Fatos livres"))!;
        expect(insp).toBeDefined();
        useCharacterStore.getState().usarCarta(insp.chave, 1);
        useCharacterStore.getState().usarCarta(fatos.chave, 1);
        useCharacterStore.getState().novoPeriodo("combate");
        expect(mesaDa(ficha()).usos[insp.chave]).toBe(1);
        useCharacterStore.getState().descansar("curto", { pv: 0, pm: 0, pt: 0, pp: 0 }, { pv: 20, pm: 20, pt: 0, pp: 10 });
        expect(mesaDa(ficha()).usos[insp.chave]).toBe(1);
        useCharacterStore.getState().descansar("longo", { pv: 0, pm: 0, pt: 0, pp: 0 }, { pv: 20, pm: 20, pt: 0, pp: 10 });
        expect(mesaDa(ficha()).usos[insp.chave]).toBeUndefined();
        expect(mesaDa(ficha()).usos[fatos.chave]).toBe(1);
        useCharacterStore.getState().novoPeriodo("sessao");
        expect(mesaDa(ficha()).usos[fatos.chave]).toBeUndefined();
    });
});
describe("marcadores persistidos", () => {
    it("ficha antiga conserva os números; Exaustão aplica sem mudar a fórmula", () => {
        const max = getMaxHp(ficha());
        expect(getPvNaMesa(ficha())).toBe(max);
        useCharacterStore.getState().setMesa({ exaustao: 2 });
        expect(getDeslocamento(ficha())).toBe(4.5);
        useCharacterStore.getState().setMesa({ exaustao: 4 });
        expect(getPvNaMesa(ficha())).toBe(Math.floor(max / 2));
        expect(getMaxHp(ficha())).toBe(max);
        useCharacterStore.getState().setMesa({ exaustao: 5 });
        expect(getDeslocamento(ficha())).toBe(0);
        useCharacterStore.getState().setMesa({ exaustao: 0 });
        expect(hpAtualNaMesa(ficha())).toBe(Math.floor(max / 2));
    });
    it("cura a zero limpa marcas e soma Exaustão; Ferida Mortal é exceção", () => {
        useCharacterStore.getState().setCurrentHp(0);
        useCharacterStore.getState().setMesa({ marcas: 2, estabilizado: true });
        useCharacterStore.getState().setCurrentHp(4);
        expect(mesaDa(ficha())).toMatchObject({ marcas: 0, exaustao: 1, estabilizado: false });
        useCharacterStore.getState().setCurrentHp(0);
        useCharacterStore.getState().setMesa({ marcas: 2 });
        useCharacterStore.getState().setCurrentHp(4, true);
        expect(mesaDa(ficha()).exaustao).toBe(1);
        useCharacterStore.getState().undo();
        expect(ficha().currentHp).toBe(0);
        expect(mesaDa(ficha()).marcas).toBe(2);
    });
    it("Longo só reduz Exaustão se a causa acabou; combate zera Salvações", () => {
        const zero = { pv: 0, pm: 0, pt: 0, pp: 0 }, max = { pv: 20, pm: 20, pt: 0, pp: 10 };
        useCharacterStore.getState().setMesa({ exaustao: 3, salvacoes: 2, trauma: 3, cicatrizes: [11] });
        useCharacterStore.getState().descansar("longo", zero, max);
        expect(mesaDa(ficha()).exaustao).toBe(3);
        useCharacterStore.getState().descansar("longo", zero, max, true);
        expect(mesaDa(ficha()).exaustao).toBe(2);
        useCharacterStore.getState().novoPeriodo("combate");
        expect(mesaDa(ficha())).toMatchObject({ salvacoes: 0, trauma: 3, cicatrizes: [11] });
    });
    it("Fio da Vida aplica a Escala do Vigor", () => {
        useCharacterStore.getState().setAttribute("vigor", -2);
        useCharacterStore.getState().setMesa({ responsavel: 6 });
        expect(getFinalAttribute(ficha(), "vigor")).toBe(-2);
        expect(fioDaVida(ficha())).toMatchObject({ cd: 14, metade: 0, bonus: -2, desvantagem: true, critico: "1 ou 2" });
    });
    it("não ressuscita por cura após três marcas; marcadores viajam com a ficha", () => {
        useCharacterStore.getState().setCurrentHp(0);
        useCharacterStore.getState().setMesa({ marcas: 3, trauma: 2, cicatrizes: [3, 11] });
        useCharacterStore.getState().setCurrentHp(10);
        expect(ficha().currentHp).toBe(0);
        const exportada = JSON.parse(JSON.stringify(ficha()));
        const id = useCharacterStore.getState().importCharacter(exportada);
        const importada = useCharacterStore.getState().characters[id];
        expect(mesaDa(importada)).toMatchObject({ marcas: 3, trauma: 2, cicatrizes: [3, 11] });
    });
});
