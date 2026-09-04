import { describe, it, expect } from "vitest";
import { averageOfWeaponFormula, type WeaponContext } from "./weaponFormula";

/**
 * Um personagem de teste com números redondos, pra que cada expectativa abaixo
 * seja uma conta que dá pra fazer de cabeça: dado 10, um degrau abaixo 8,
 * atributo 5, Bônus de Rank 4 — logo o ATAQUE COMUM vale 19.
 */
const CTX: WeaponContext = {
  dieAverage: 10,
  dieAverageOneStepBelow: 8,
  attribute: 5,
  rankBonus: 4,
};

const media = (f: string) => averageOfWeaponFormula(f, CTX).average;

describe("averageOfWeaponFormula", () => {
  describe("as duas formas que o livro usa, que NÃO valem a mesma coisa", () => {
    it('"rolado N vezes" soma só os dados — sem atributo, sem Bônus de Rank', () => {
      expect(media("Dado de arma rolado três vezes")).toBe(30);
      expect(media("Dado de arma rolado cinco vezes")).toBe(50);
    });

    it('"arma normal" invoca a fórmula inteira: dado + atributo + Bônus de Rank', () => {
      expect(media("Dado de arma normal")).toBe(19);
      expect(media("Dano de arma normal")).toBe(19);
      expect(media("Dado de arma normal (cortante)")).toBe(19);
      expect(media("Dado de arma normal em cada alvo")).toBe(19);
    });

    it("soma atributo num múltiplo só quando o texto pede, porque duas técnicas pedem", () => {
      // Sem pedir: só dados.
      expect(media("Dado de arma rolado duas vezes + Bônus de Rank (cortante)")).toBe(24);
      // Pedindo: dados + atributo + Bônus de Rank.
      expect(media("Dado de arma rolado cinco vezes + Agilidade + Bônus de Rank")).toBe(59);
    });
  });

  describe("dados extras e degraus", () => {
    it('"+N Dados de Arma" é um ataque comum com N dados a mais', () => {
      expect(media("+2 Dados de Arma")).toBe(39);
      expect(media("+1 Dado de Arma se percorreu 9m ou mais")).toBe(29);
    });

    it("um degrau abaixo troca o dado, mantendo atributo e Bônus de Rank", () => {
      expect(media("Dado de arma um degrau abaixo")).toBe(17);
    });

    it("segundo golpe um degrau abaixo é DOIS ataques na mesma Ação", () => {
      expect(media("Segundo ataque: um degrau abaixo")).toBe(36);
      expect(media("Segundo disparo: um degrau abaixo")).toBe(36);
      expect(media("Arma secundária: um degrau abaixo do normal")).toBe(36);
    });

    it('"metade do dado" é meio DADO, não meia fórmula', () => {
      expect(media("Metade do dado de arma")).toBe(5);
    });

    it('"no segundo corte" faz a técnica bater duas vezes', () => {
      // 19 (primeiro corte) + 19 (segundo) + 18 (4d8) = 56.
      expect(media("+4d8 no segundo corte, ignora Manto de Touki")).toBe(56);
    });
  });

  describe("dados avulsos somados ao golpe", () => {
    it("soma os NdM que sobram no texto", () => {
      expect(media("Dado de arma normal + 3d8 (cortante)")).toBe(33);
      expect(media("Dado de arma rolado quatro vezes + 4d12")).toBe(66);
      expect(media("Dado de arma rolado quatro vezes + Força + Bônus de Rank + 4d10 (cortante)")).toBe(71);
      expect(media("+2d10, somados ao dano de arma normal")).toBe(30);
    });

    it("uma técnica sem Dado de Arma continua sendo lida pelos dados dela", () => {
      expect(media("3d10 (contundente)")).toBe(17);
      expect(media("8d10 + Força + Bônus de Rank (contundente, automático)")).toBe(53);
      expect(media("1d8 + BC (ígneo)")).toBe(14);
      expect(media("6d10 + BC/turno (ígneo)")).toBe(42);
    });
  });

  describe("o que NÃO é dano causado", () => {
    it("cura, PV temporários e redução de dano valem zero e se declaram", () => {
      for (const f of [
        "Vigor + Bônus de Rank em PV",
        "PV Temporários = Vigor + Bônus de Rank",
        "Reduz 2d10 + Vigor + Bônus de Rank",
      ]) {
        const r = averageOfWeaponFormula(f, CTX);
        expect(r.average).toBe(0);
        expect(r.notDamage).toBe(true);
      }
    });

    it("dano em si mesmo não entra na conta do dano causado", () => {
      const r = averageOfWeaponFormula("Metade do dado (você sofre 1d4)", CTX);
      expect(r.average).toBe(5);
      expect(r.ignored).toHaveLength(1);
    });
  });

  describe("condições: as do atacante contam, as do alvo não", () => {
    it("descarta bônus que só existe contra um tipo de alvo, mas mantém o ataque", () => {
      const r = averageOfWeaponFormula("+2 Dados de Arma contra armadura completa", CTX);
      expect(r.average).toBe(19);
      expect(r.ignored).toHaveLength(1);
    });

    it("descarta multiplicador contra estrutura", () => {
      const r = averageOfWeaponFormula(
        "Dado de arma rolado três vezes (dobrado contra armadura pesada/estrutura)",
        CTX
      );
      expect(r.average).toBe(30);
      expect(r.ignored).toHaveLength(1);
    });

    it("descarta bônus preso a uma Reação do alvo", () => {
      const r = averageOfWeaponFormula("+1d10 se ignorar uma Reação defensiva", CTX);
      expect(r.average).toBe(19);
      expect(r.ignored).toHaveLength(1);
    });

    it("descarta bônus por acúmulo construído no alvo ao longo de turnos", () => {
      const r = averageOfWeaponFormula(
        "Dado de arma rolado cinco vezes + 1d12 por acúmulo de Quebrantado do alvo, até o seu Bônus de Rank em acúmulos",
        CTX
      );
      expect(r.average).toBe(50);
      expect(r.ignored).toHaveLength(1);
    });

    it("mantém condição que o próprio atacante controla", () => {
      const r = averageOfWeaponFormula("+1 Dado de Arma se percorreu 9m ou mais", CTX);
      expect(r.average).toBe(29);
      expect(r.ignored).toHaveLength(0);
    });
  });

  it("nenhuma parcela é contada duas vezes quando o ataque comum já entrou", () => {
    // "dano de arma normal" já embute atributo e Bônus de Rank; o "Bônus de
    // Rank" escrito na frase não pode somar de novo.
    expect(media("+2d10, somados ao dano de arma normal")).toBe(30);
  });
});
