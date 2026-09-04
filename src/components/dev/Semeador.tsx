"use client";

/**
 * Semeia o `localStorage` com duas fichas e manda pra rota pedida em `?ir=`.
 *
 * ## Por que uma rota existe só pra isso
 *
 * Toda ferramenta de verificação automática deste projeto — o print headless do
 * `PROGRESS.md` e o `check:contraste` — abre a página do lado de fora, e
 * nenhuma delas clica. Sem semente, `/ficha` e `/personagens` abrem VAZIAS: o
 * print sai de um estado que ninguém vê na mesa, e a varredura de contraste
 * mede um terço dos componentes.
 *
 * As duas fichas são diferentes de propósito: uma com foto e capa, outra sem —
 * é o par que faz o roster mostrar os dois caminhos do card ao mesmo tempo.
 *
 * `?tema=light|dark` grava a escolha do `next-themes` antes de sair, porque o
 * Chrome headless segue o tema do SO e todo print saía escuro (foi assim que o
 * cabeçalho ilegível de 0.1.10 sobreviveu tanto tempo).
 *
 * Não existe em produção: a rota que carrega este componente devolve 404
 * quando `NODE_ENV === "production"`.
 */
import { useEffect } from "react";

const RETRATO =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7b2d3b"/><stop offset="1" stop-color="#c99a3f"/></linearGradient></defs><rect width="256" height="256" fill="url(#g)"/><circle cx="128" cy="96" r="46" fill="#f7ecd6"/><path d="M40 256c0-52 40-84 88-84s88 32 88 84z" fill="#f7ecd6"/></svg>`
  );
const CAPA =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d3a5f"/><stop offset="0.55" stop-color="#5b7fa6"/><stop offset="1" stop-color="#e6c98a"/></linearGradient></defs><rect width="1200" height="400" fill="url(#c)"/><circle cx="980" cy="120" r="70" fill="#fff6df" opacity="0.85"/></svg>`
  );

function ficha(id: string, name: string, comImagem: boolean) {
  return {
    id,
    name,
    lore: "Semente de teste.",
    ...(comImagem ? { portrait: RETRATO, cover: CAPA } : {}),
    raceId: "humano",
    backgroundId: "plebeu",
    subtableEntryId: null,
    attributeBase: { forca: 1, agilidade: 2, vigor: 1, intelecto: 3, espirito: 2 },
    raceAttributeChoices: ["intelecto"],
    racialUpgrades: [],
    saveAdvantages: ["agilidade"],
    startingTreeId: "agua",
    unlockedRanks: [
      { treeId: "agua", rank: "Principiante" },
      { treeId: "agua", rank: "Intermediário" },
    ],
    purchasedAbilities: [],
    purchasedCombinedSpells: [],
    gold: 120,
    inventory: [],
    skills: [],
    treeSkillChoices: [],
    proficiencies: [],
    bonusHp: 0,
    bonusMp: 0,
    currentHp: 19,
    currentMp: 11,
    currentPt: null,
    currentPp: null,
    overrides: {},
  };
}

export default function Semeador() {
  useEffect(() => {
    const a = ficha("char_a", "Rudeus Greyrat", true);
    const b = ficha("char_b", "Eris Boreas", false);
    localStorage.setItem(
      "mushoku-tensei-roster",
      JSON.stringify({
        state: { characters: { char_a: a, char_b: b }, order: ["char_a", "char_b"], activeId: "char_a" },
        version: 12,
      })
    );
    const q = new URLSearchParams(window.location.search);
    const tema = q.get("tema");
    if (tema) localStorage.setItem("theme", tema);
    window.location.replace(q.get("ir") ?? "/personagens");
  }, []);
  return <p style={{ padding: 24 }}>Semeando...</p>;
}
