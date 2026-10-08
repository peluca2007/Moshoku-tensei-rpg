import type { CharacterData } from "./types";
import { getMaxHp, getCurrentHp, getFinalAttribute, getMaiorBonusDeRank } from "@/store/selectors";
import { limitesDaFicha, type PeriodoDeUso } from "./limitesDeUso";
export type Mesa = NonNullable<CharacterData["mesa"]>;
const inteiro = (n: number, max: number) => Number.isFinite(n) ? Math.max(0, Math.min(max, Math.trunc(n))) : 0;
export function mesaDa(c: CharacterData): Mesa {
    const m = c.mesa;
    return { exaustao: inteiro(m?.exaustao ?? 0, 6), marcas: inteiro(m?.marcas ?? 0, 3), estabilizado: !!m?.estabilizado, responsavel: inteiro(m?.responsavel ?? 0, 6), salvacoes: inteiro(m?.salvacoes ?? 0, 2), trauma: inteiro(m?.trauma ?? 0, 999), cicatrizes: (m?.cicatrizes ?? []).filter(n => Number.isInteger(n) && n >= 1 && n <= 12), usos: Object.fromEntries(Object.entries(m?.usos ?? {}).map(([k, v]) => [k, inteiro(v, 999)])) };
}
/** Condição aplicada depois do máximo calculado, sem mudar a fórmula de PV. */
export function getPvNaMesa(c: CharacterData) { const pv = getMaxHp(c); return mesaDa(c).exaustao >= 4 ? Math.floor(pv / 2) : pv; }
export function hpAtualNaMesa(c: CharacterData) { return Math.min(getCurrentHp(c), getPvNaMesa(c)); }
export function atualizarMesa(c: CharacterData, patch: Partial<Mesa>): CharacterData {
    const novo = { ...c, mesa: { ...mesaDa(c), ...patch } };
    novo.mesa = mesaDa(novo);
    // Ao baixar o máximo, conserva a perda atual; remover a condição não cura.
    if (getPvNaMesa(novo) < hpAtualNaMesa(c))
        novo.currentHp = getPvNaMesa(novo);
    return novo;
}
export function recuperarDeZero(c: CharacterData, pv: number | null, feridaMortal = false): CharacterData {
    if (mesaDa(c).marcas >= 3 && (pv ?? getPvNaMesa(c)) > 0)
        return c;
    const acordou = hpAtualNaMesa(c) === 0 && (pv ?? getPvNaMesa(c)) > 0;
    return { ...c, currentHp: pv, ...(acordou ? { mesa: { ...mesaDa(c), marcas: 0, estabilizado: false, exaustao: Math.min(6, mesaDa(c).exaustao + (feridaMortal ? 0 : 1)) } } : {}) };
}
export function reiniciarUsos(c: CharacterData, periodo: PeriodoDeUso): CharacterData {
    const m = mesaDa(c), usos = { ...m.usos };
    for (const e of limitesDaFicha(c))
        if (e.limite && (e.limite.periodo === periodo || periodo === "longo" && e.limite.periodo === "curto"))
            delete usos[e.chave];
    return { ...c, mesa: { ...m, usos, ...(periodo === "combate" ? { salvacoes: 0 } : {}) } };
}
export function fioDaVida(c: CharacterData) {
    const vigor = getFinalAttribute(c, "vigor"), rank = getMaiorBonusDeRank(c), m = mesaDa(c);
    return { cd: m.responsavel ? 8 + m.responsavel : 10, vigor, metade: vigor <= -2 ? 0 : Math.ceil(rank / 2), bonus: vigor + (vigor <= -2 ? 0 : Math.ceil(rank / 2)), desvantagem: vigor < 0, critico: vigor <= -2 ? "1 ou 2" : "1" };
}
