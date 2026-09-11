import { describe, expect, it } from "vitest";
import { TREES } from "@/data/trees";
import { CharacterData, RANKS } from "@/lib/types";
import { codificarFicha, decodificarFicha } from "./fichaLink";
import {
  descreverFalha,
  LIMITE_DISCORD,
  MotivoDeFalha,
  passaDoDiscord,
  recolherLinkColado,
} from "./diagnosticoDeLink";

/** Uma ficha de verdade, com N árvores compradas até o fim — é o que faz o link crescer. */
function fichaCom(qtdArvores: number): CharacterData {
  const arvores = TREES.slice(0, qtdArvores);
  return {
    id: "descartado",
    name: "Rudeus Greyrat",
    lore: "L".repeat(300),
    raceId: "humano",
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: { forca: 3, agilidade: 4, vigor: 3, intelecto: 6, espirito: 5 },
    raceAttributeChoices: ["intelecto"],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: arvores[0]?.id ?? null,
    unlockedRanks: arvores.flatMap((t) => RANKS.map((rank) => ({ treeId: t.id, rank }))),
    purchasedAbilities: arvores.flatMap((t) =>
      t.ranks.flatMap((rk) => [
        ...rk.abilities.map((a) => ({ treeId: t.id, rank: rk.rank, kind: "ability" as const, id: a.id })),
        ...rk.talents.map((a) => ({ treeId: t.id, rank: rk.rank, kind: "talent" as const, id: a.id })),
      ])
    ),
    purchasedCombinedSpells: [],
    gold: 999,
    inventory: [],
    skills: ["Arcanismo", "Percepção"],
    treeSkillChoices: [],
    proficiencies: [],
    weaponGroupChoices: [],
    bonusHp: 0,
    bonusMp: 0,
    currentHp: 50,
    currentMp: 40,
    currentPt: null,
    currentPp: null,
    currentCalor: null,
    overrides: {},
  };
}

describe("ida e volta", () => {
  it("a ficha volta inteira do próprio link", async () => {
    const original = fichaCom(2);
    const r = await decodificarFicha(await codificarFicha(original));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.conteudo.name).toBe(original.name);
    expect(r.conteudo.purchasedAbilities).toEqual(original.purchasedAbilities);
    expect(r.conteudo.unlockedRanks).toEqual(original.unlockedRanks);
    expect(r.conteudo.attributeBase).toEqual(original.attributeBase);
  });

  it("o id NÃO viaja — quem importa recebe um novo", async () => {
    const r = await decodificarFicha(await codificarFicha(fichaCom(1)));
    expect(r.ok && "id" in r.conteudo).toBe(false);
  });

  it("foto e capa ficam fora do link, por maiores que sejam", async () => {
    const comFoto = { ...fichaCom(1), portrait: `data:image/png;base64,${"A".repeat(5000)}` };
    const fragmento = await codificarFicha(comFoto);
    const r = await decodificarFicha(fragmento);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.conteudo.portrait).toBeUndefined();
    // Se a foto tivesse entrado, o fragmento teria milhares de caracteres a mais.
    expect(fragmento.length).toBeLessThan(2000);
  });

  it("aceita o fragmento com ou sem a cerquilha na frente", async () => {
    const fragmento = await codificarFicha(fichaCom(1));
    expect((await decodificarFicha(fragmento)).ok).toBe(true);
    expect((await decodificarFicha(`#${fragmento}`)).ok).toBe(true);
  });
});

/*
 * O teto declarado em `LIMITE_DISCORD`.
 *
 * Este teste é a razão de o número estar no código em vez de num comentário: se
 * o formato do link inchar (um campo novo na ficha, uma compressão pior), a
 * ficha de três árvores passa dos 2.000 e o Discord começa a cortar links no
 * meio — e o sintoma disso, do lado de quem recebe, é indistinguível de um link
 * que a pessoa colou errado. Melhor descobrir aqui.
 */
describe("tamanho do link", () => {
  const PREFIXO = "https://mushoku-tensei-rpg.vercel.app/ficha/importar#".length;

  it("uma ficha de duas árvores cabe numa mensagem do Discord", async () => {
    const url = (await codificarFicha(fichaCom(2))).length + PREFIXO;
    expect(url).toBeLessThan(LIMITE_DISCORD);
  });

  /*
   * Este teste trava um fato DESCONFORTÁVEL, e é de propósito.
   *
   * Um personagem de três árvores — multiclasse comum de campanha longa — já
   * não cabe numa mensagem do Discord. Enquanto isso for verdade, a ficha tem
   * que avisar depois de copiar (é o que `passaDoDiscord` alimenta na tela). Se
   * um dia alguém apertar o formato e três árvores passarem a caber, este teste
   * falha — e falhar aqui é a única forma de o aviso ser revisto em vez de
   * continuar mentindo pra sempre.
   */
  it("três árvores NÃO cabem — é por isso que existe o aviso", async () => {
    const url = (await codificarFicha(fichaCom(3))).length + PREFIXO;
    expect(url).toBeGreaterThan(LIMITE_DISCORD);
  });

  it("passaDoDiscord marca o que não cabe", () => {
    expect(passaDoDiscord(LIMITE_DISCORD - 1)).toBe(false);
    expect(passaDoDiscord(LIMITE_DISCORD)).toBe(false);
    expect(passaDoDiscord(LIMITE_DISCORD + 1)).toBe(true);
  });

  it("comprimir não é enfeite: sem gzip a ficha de UMA árvore estouraria o dobro do teto", () => {
    // O `j:` cru é base64 do JSON, ou seja ~4/3 do tamanho dele.
    const cru = Math.ceil((JSON.stringify(fichaCom(1)).length * 4) / 3);
    expect(cru).toBeGreaterThan(LIMITE_DISCORD * 2);
  });
});

describe("por que o link falhou", () => {
  it("fragmento vazio", async () => {
    for (const vazio of ["", "#", "   ", "#  "]) {
      const r = await decodificarFicha(vazio);
      expect(r.ok, vazio).toBe(false);
      if (!r.ok) expect(r.motivo, vazio).toBe("vazio");
    }
  });

  it("marca de outro tipo de link", async () => {
    // `gm` é a marca de CRIATURA — abrir isso na tela de ficha tem que dizer
    // "esta não é a porta", e não "link inválido".
    const r = await decodificarFicha("gmH4sIAAAAAAAA");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toBe("marca-desconhecida");
  });

  it("link cortado no meio — o caso do aplicativo de mensagem", async () => {
    const inteiro = await codificarFicha(fichaCom(2));
    const r = await decodificarFicha(inteiro.slice(0, Math.floor(inteiro.length * 0.6)));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.motivo).toBe("cortado");
      // O número existe pra que o remetente entenda: mandei 1.400, chegaram 840.
      expect(r.caracteres).toBeGreaterThan(0);
    }
  });

  it("JSON válido que não é uma ficha", async () => {
    const bytes = new TextEncoder().encode(JSON.stringify({ oi: "sou outra coisa" }));
    const base64url = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const r = await decodificarFicha(`j:${base64url}`);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toBe("nao-e-isso");
  });

  /*
   * O caso do relato de mesa (2026-09-10): link gerado no desktop, aberto num
   * iPhone antigo. `DecompressionStream` só existe no Safari a partir do iOS
   * 16.4, e sem esta detecção o `ReferenceError` era engolido e a tela dizia
   * "link inválido" — mandando a pessoa culpar o link, que estava perfeito.
   */
  it("navegador sem descompressão diz que o problema é o navegador", async () => {
    const fragmento = await codificarFicha(fichaCom(1));
    const original = globalThis.DecompressionStream;
    // @ts-expect-error — simulando um Safari anterior ao iOS 16.4.
    delete globalThis.DecompressionStream;
    try {
      const r = await decodificarFicha(fragmento);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.motivo).toBe("sem-gzip");
    } finally {
      globalThis.DecompressionStream = original;
    }
  });

  it("o link CRU continua abrindo num navegador sem descompressão", async () => {
    // É a promessa que o formato `j:` faz: quem não tem gzip ainda consegue ler
    // um link que não foi comprimido.
    const bytes = new TextEncoder().encode(JSON.stringify({ attributeBase: { forca: 1 } }));
    const base64url = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const original = globalThis.DecompressionStream;
    // @ts-expect-error — simulando um Safari anterior ao iOS 16.4.
    delete globalThis.DecompressionStream;
    try {
      expect((await decodificarFicha(`j:${base64url}`)).ok).toBe(true);
    } finally {
      globalThis.DecompressionStream = original;
    }
  });
});

describe("descreverFalha", () => {
  const motivos: MotivoDeFalha[] = ["vazio", "marca-desconhecida", "sem-gzip", "cortado", "nao-e-isso"];

  it("todo motivo tem título, explicação e SAÍDA, nos dois tipos", () => {
    for (const oQue of ["ficha", "criatura"] as const) {
      for (const motivo of motivos) {
        const t = descreverFalha(motivo, 1234, oQue);
        expect(t.titulo.length, `${oQue}/${motivo}`).toBeGreaterThan(0);
        expect(t.explicacao.length, `${oQue}/${motivo}`).toBeGreaterThan(0);
        // Uma tela de erro sem saída é um beco: esta é a regra do arquivo.
        expect(t.saida.length, `${oQue}/${motivo}`).toBeGreaterThan(0);
      }
    }
  });

  it("o texto de link cortado conta quantos caracteres chegaram", () => {
    expect(descreverFalha("cortado", 1234, "ficha").explicacao).toContain("1.234");
  });

  it("cada motivo dá um título diferente — senão não valeu separar", () => {
    const titulos = motivos.map((m) => descreverFalha(m, 0, "ficha").titulo);
    expect(new Set(titulos).size).toBe(motivos.length);
  });
});

describe("recolherLinkColado", () => {
  it("tira o domínio e fica com o fragmento", () => {
    expect(recolherLinkColado("https://sitio.exemplo/ficha/importar#g:ABC123")).toBe("g:ABC123");
  });

  it("aceita o fragmento colado sozinho", () => {
    expect(recolherLinkColado("g:ABC123")).toBe("g:ABC123");
  });

  /*
   * O caso que motivou a função: o aplicativo de mensagem parte o link longo em
   * duas linhas e só a primeira vira clicável. Colando as duas, ele volta.
   */
  it("junta um link partido em várias linhas", () => {
    expect(recolherLinkColado("https://sitio.exemplo/ficha/importar#g:ABC\n123\n  456  ")).toBe("g:ABC123456");
  });

  it("usa a ÚLTIMA cerquilha, pra citação de link dentro de link", () => {
    expect(recolherLinkColado("veja isto: https://a.b/x#lixo https://a.b/ficha/importar#g:BOM")).toBe("g:BOM");
  });

  it("texto sem nada dentro devolve vazio", () => {
    expect(recolherLinkColado("   \n  ")).toBe("");
  });
});
