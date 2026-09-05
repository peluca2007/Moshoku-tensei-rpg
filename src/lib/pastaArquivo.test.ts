import { describe, expect, it } from "vitest";
import { empacotarPasta, lerArquivoDoBestiario } from "./pastaArquivo";
import { empacotarCriatura } from "./criaturaArquivo";
import type { CriaturaEncontro } from "./encounterSim";
import type { PastaCriaturas } from "@/store/useBestiaryStore";

/**
 * O arquivo da pasta, de ida e de volta.
 *
 * O que este teste protege é o backup: o bestiário inteiro mora no
 * `localStorage` de um navegador, e o `.mtpasta` é a única cópia que sobrevive
 * a limpar dados do site. Um empacotamento que perde uma criatura no caminho
 * seria descoberto no dia em que ela fizesse falta.
 */
const PASTA: PastaCriaturas = {
  id: "pasta_original",
  nome: "Emboscada da estrada",
  recolhida: true,
  cor: "vinho",
  emoji: "🏹",
};

function criatura(nome: string, pv: number): CriaturaEncontro {
  return {
    id: `criatura_${nome}`,
    nome,
    patamar: 2,
    papel: "padrao",
    pv,
    ca: 14,
    bonusAtaque: 5,
    danoPorTurno: 12,
    cdResistencia: 14,
    quantidade: 1,
    perigo: "Emboscada",
    acoes: [
      {
        id: "acao_1",
        nome: "Espada",
        acoes: 1,
        dano: "2d6+3",
        alcance: "Corpo a corpo",
        area: false,
        tipo: "ataque",
        nota: "",
      },
    ],
    pastaId: "pasta_original",
  };
}

async function comoArquivo(blob: Blob, nome: string): Promise<File> {
  return new File([await blob.arrayBuffer()], nome);
}

describe("arquivo de pasta", () => {
  it("leva a pasta e as criaturas de ida e volta", async () => {
    const { blob, nomeDoArquivo } = await empacotarPasta(PASTA, [criatura("Goblin", 12), criatura("Bandido", 30)]);
    expect(nomeDoArquivo).toBe("Emboscada da estrada.mtpasta");

    const lido = await lerArquivoDoBestiario(await comoArquivo(blob, nomeDoArquivo));

    expect(lido.tipo).toBe("pasta");
    if (lido.tipo !== "pasta") return;
    expect(lido.pasta.nome).toBe("Emboscada da estrada");
    expect(lido.pasta.cor).toBe("vinho");
    expect(lido.pasta.emoji).toBe("🏹");
    expect(lido.pasta.criaturas.map((c) => c.nome)).toEqual(["Goblin", "Bandido"]);
    expect(lido.pasta.criaturas[0].acoes[0].dano).toBe("2d6+3");
  });

  // Ids são do bestiário que os sorteou. Se viajassem, reimportar o próprio
  // backup criaria duas criaturas disputando a mesma chave.
  it("não leva id de criatura nem id de pasta dentro do arquivo", async () => {
    const { blob } = await empacotarPasta(PASTA, [criatura("Goblin", 12)]);
    const lido = await lerArquivoDoBestiario(await comoArquivo(blob, "p.mtpasta"));

    if (lido.tipo !== "pasta") throw new Error("devia ter lido uma pasta");
    const bruto = lido.pasta.criaturas[0] as Record<string, unknown>;
    expect(bruto.id).toBeUndefined();
    expect(bruto.pastaId).toBeUndefined();
  });

  // Um botão de importar só, e o arquivo é quem diz o que é.
  it("reconhece um .mtcriatura pelo mesmo caminho", async () => {
    const { blob, nomeDoArquivo } = await empacotarCriatura(criatura("Lobo", 35));
    const lido = await lerArquivoDoBestiario(await comoArquivo(blob, nomeDoArquivo));

    expect(lido.tipo).toBe("criatura");
    if (lido.tipo !== "criatura") return;
    expect(lido.criatura.nome).toBe("Lobo");
  });

  it("aceita o JSON cru de uma pasta, sem a marca comprimida", async () => {
    const json = JSON.stringify({ nome: "À mão", criaturas: [criatura("Ogro", 120)] });
    const lido = await lerArquivoDoBestiario(new File([json], "pasta.json"));

    expect(lido.tipo).toBe("pasta");
    if (lido.tipo !== "pasta") return;
    expect(lido.pasta.criaturas).toHaveLength(1);
  });

  it("recusa um arquivo que não é do bestiário, com uma frase e não um stack", async () => {
    await expect(lerArquivoDoBestiario(new File(["{\"foo\":1}"], "qualquer.json"))).rejects.toThrow(
      /não parece ser uma criatura/i
    );
  });
});
