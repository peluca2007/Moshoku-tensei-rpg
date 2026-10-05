import { describe, expect, it } from "vitest";
import { medirPatamar } from "../../scripts/lib/medirMolde";

/**
 * O molde do Apêndice G entrega o que o livro promete — 2026-10-05.
 *
 * De 28 a 30/09, três correções certas do motor tiraram força dos heróis e o
 * 3º patamar com 5 criaturas caiu de 67% pra 31% de vitória: o livro prometia
 * Difícil e entregava Mortal, e ninguém viu por uma semana. Este teste é o
 * mesmo `npm run check:molde`, na suíte, pra que a próxima correção do motor
 * avise no mesmo commit. Reprovou? Leia o cabeçalho de scripts/check-molde.mts.
 */
describe("o molde do Apêndice G", () => {
  for (const patamar of [1, 2, 3, 4, 5, 6]) {
    it(`${patamar}º patamar: 4 criaturas, 5 criaturas e o Chefe na referência`, () => {
      expect(medirPatamar(patamar).falhas).toEqual([]);
    });
  }
});
