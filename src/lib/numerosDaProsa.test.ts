import { expect, it } from "vitest";
import { TREES } from "@/data/trees";
import { numerosDaProsa } from "../../scripts/lib/numeros-da-prosa";
it("detecta o 6d4 da prosa anterior à 0.1.148, mesmo na comparação com outras escolas", () => {
    // Trecho literal do diff de 1642565 (0.1.148), independente de clone raso.
    const antigo = `<P><b>Quanto a Utilidade bate.</b> No Imperador, o Dano Furtivo do Ladino soma <b>+6d6 por turno</b>{" "}
(uns 21); a Dissonância do Bardo cobra <b>6d4</b> (uns 15) de até seis hostis que o ouçam; e a
Ordem de Tiro do Tático põe <b>6d6</b> no golpe de um aliado — até 12d6, se ninguém acertar o
alvo Apontado e você o apontar de novo. Um Deus do Norte Imperador bate cerca de 81 por turno.</P>`;
    expect(numerosDaProsa(antigo, TREES).some(a => a.motivo.includes("Dissonância") && a.frase.includes("6d4"))).toBe(true);
});
it("dado por patamar no Imperador acompanha a carta", () => {
    expect(numerosDaProsa("No Imperador, a Dissonância do Bardo cobra 6d6.", TREES)).toEqual([]);
    expect(numerosDaProsa("Zero Absoluto custa 99 PM.", TREES)[0].motivo).toContain("custo");
});
