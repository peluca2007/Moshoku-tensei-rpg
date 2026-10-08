import { beforeEach, describe, expect, it } from "vitest";
import { useCharacterStore } from "@/store/useCharacterStore";
import { getArmorClass, getCurrentMp, getDeslocamento, getFinalAttribute, getInitiative, getMaxMp } from "@/store/selectors";
import { getPvNaMesa, hpAtualNaMesa } from "./mesa";
import { codigoDeMesa } from "./codigoDeMesa";

const ficha = () => {
  const s = useCharacterStore.getState();
  return s.characters[s.activeId!];
};

beforeEach(() => {
  useCharacterStore.setState({ characters: {}, order: [], activeId: null, history: {} });
  useCharacterStore.getState().createCharacter("Aria");
  useCharacterStore.getState().setStartingTree("agua");
});

describe("código da ficha para a mesa no Roblox", () => {
  it("usa os mesmos números que a ficha mostra", () => {
    const c = ficha();
    const { codigo, avisos } = codigoDeMesa(c);
    expect(codigo.mesa).toBe(1);
    expect(codigo.nome).toBe("Aria");
    expect(codigo.pvMax).toBe(getPvNaMesa(c));
    expect(codigo.manaMax).toBe(getMaxMp(c));
    expect(codigo.ca).toBe(getArmorClass(c));
    expect(codigo.iniciativa).toBe(getInitiative(c).bonus);
    expect(codigo.atributos.agilidade).toBe(getFinalAttribute(c, "agilidade"));
    expect(avisos).toEqual([]);
  });

  it("todos os campos batem com os seletores da ficha", () => {
    const c = ficha();
    const { codigo } = codigoDeMesa(c);
    for (const chave of ["forca", "agilidade", "vigor", "intelecto", "espirito"] as const)
      expect(codigo.atributos[chave]).toBe(getFinalAttribute(c, chave));
    expect(codigo.pv).toBe(Math.min(hpAtualNaMesa(c), getPvNaMesa(c)));
    expect(codigo.mana).toBe(Math.min(getCurrentMp(c), getMaxMp(c)));
    expect(codigo.deslocamento).toBe(getDeslocamento(c));
    expect(codigo.vantagemIniciativa).toBe(getInitiative(c).hasAdvantage);
  });

  it("recusa com motivo o que a mesa rejeitaria, em vez de copiar", () => {
    expect(() => codigoDeMesa({ ...ficha(), currentMp: Number.NaN })).toThrow(/Mana atual/);
    expect(() => codigoDeMesa({ ...ficha(), currentHp: -3 })).toThrow(/PV atual/);
  });

  it("o texto é o JSON de uma linha que a mesa espera", () => {
    const { texto, codigo } = codigoDeMesa(ficha());
    expect(texto).not.toContain("\n");
    expect(JSON.parse(texto)).toEqual(codigo);
    expect(texto.length).toBeLessThanOrEqual(1000);
  });

  it("corta nomes acima de 32 caracteres contando letras, não bytes", () => {
    const nome = "Ação Ébria Ígnea Óssea Úmida ãõ e mais";
    const { codigo, avisos } = codigoDeMesa({ ...ficha(), name: nome });
    expect([...codigo.nome].length).toBeLessThanOrEqual(32);
    expect(avisos.some((a) => a.startsWith("Nome cortado"))).toBe(true);
  });

  it("mana atual acima do máximo vai como o máximo, com aviso", () => {
    const c = ficha();
    const { codigo, avisos } = codigoDeMesa({ ...c, currentMp: getMaxMp(c) + 5 });
    expect(codigo.mana).toBe(codigo.manaMax);
    expect(avisos.some((a) => a.startsWith("Mana atual"))).toBe(true);
  });
});
