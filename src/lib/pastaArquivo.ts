import { CriaturaEncontro } from "./encounterSim";
import { PastaCriaturas, PastaImportada } from "@/store/useBestiaryStore";
import { comprimirTexto, descomprimirBytes } from "./compactacao";
import { CriaturaIlegivel, lerArquivoDeCriatura } from "./criaturaArquivo";

/**
 * Uma GAVETA inteira do bestiário num arquivo só.
 *
 * ## Por que a pasta exporta, e não só a criatura
 *
 * `.mtcriatura` resolve "te mando este chefe". Não resolve o que o Mestre faz
 * de verdade quando arruma o covil: "a emboscada da estrada são estes cinco
 * bichos, nesta ordem, e eu quero levar isso pra outra máquina" — ou
 * simplesmente guardar uma cópia antes de mexer, porque o bestiário inteiro
 * mora no `localStorage` de um navegador e ninguém faz backup de
 * `localStorage`. Exportar cinco criaturas uma a uma e reimportá-las uma a uma,
 * do outro lado, perde exatamente o que se estava tentando levar: a pasta.
 *
 * ## O formato
 *
 * `MTP1` + gzip(JSON), o mesmo par de `.mtficha` e `.mtcriatura` — só a marca
 * muda, pra leitura nunca confundir os três. O JSON é a pasta (nome, cor,
 * emoji) mais as criaturas dela, cada uma como `lerArquivoDeCriatura` já as
 * entende.
 *
 * Ids não viajam: nem o da pasta, nem o das criaturas, nem o das Ações. Quem
 * importa sorteia todos de novo (`importarPasta`), pela mesma razão de sempre —
 * o arquivo que te mandaram pode ser o que VOCÊ mandou antes, e reimportar não
 * pode colidir com o que já está no bestiário.
 */
const MARCA_ARQUIVO = "MTP1";
const EXTENSAO = "mtpasta";

/** O que a caixa de diálogo de importação aceita: pasta, criatura ou JSON cru. */
export const ACEITA_NA_IMPORTACAO_BESTIARIO = `.${EXTENSAO},.mtcriatura,application/json,.json`;

interface PastaEmpacotada {
  blob: Blob;
  nomeDoArquivo: string;
  bytes: number;
}

function nomeDoArquivo(pasta: PastaCriaturas): string {
  const base = (pasta.nome || "pasta").trim().replace(/[^\p{L}\p{N}\- ]/gu, "") || "pasta";
  return `${base}.${EXTENSAO}`;
}

/** A pasta e o que está dentro dela, prontas pra baixar. */
export async function empacotarPasta(
  pasta: PastaCriaturas,
  criaturas: CriaturaEncontro[]
): Promise<PastaEmpacotada> {
  const conteudo: PastaImportada = {
    nome: pasta.nome,
    cor: pasta.cor,
    emoji: pasta.emoji,
    // `id` e `pastaId` saem: os dois só significam alguma coisa no bestiário
    // que os sorteou, e mandá-los adiante convida quem lê a confiar neles.
    criaturas: criaturas.map(({ id: _id, pastaId: _pastaId, ...resto }) => resto),
  };
  const json = JSON.stringify(conteudo);
  const comprimido = await comprimirTexto(json);
  // Sem `CompressionStream` (navegador antigo) sai JSON puro com a mesma
  // extensão — mesma escolha dos outros dois: pasta grande é melhor que pasta
  // que não exporta.
  if (!comprimido) {
    const blob = new Blob([json], { type: "application/json" });
    return { blob, nomeDoArquivo: nomeDoArquivo(pasta), bytes: blob.size };
  }
  const blob = new Blob([new TextEncoder().encode(MARCA_ARQUIVO), comprimido], {
    type: "application/octet-stream",
  });
  return { blob, nomeDoArquivo: nomeDoArquivo(pasta), bytes: blob.size };
}

/** O que uma leitura de arquivo do bestiário pode devolver. */
export type ChegadaDeArquivo =
  | { tipo: "criatura"; criatura: Omit<CriaturaEncontro, "id"> }
  | { tipo: "pasta"; pasta: PastaImportada };

function ehPastaPlausivel(dados: unknown): dados is PastaImportada {
  // `criaturas` é o campo que uma pasta tem e uma criatura solta nunca teria —
  // mesmo raciocínio de `papel` em `lerArquivoDeCriatura`.
  return (
    !!dados &&
    typeof dados === "object" &&
    "criaturas" in dados &&
    Array.isArray((dados as PastaImportada).criaturas)
  );
}

/**
 * Lê qualquer arquivo do bestiário — pasta, criatura, ou um `.json` cru de
 * qualquer um dos dois — e diz o que chegou.
 *
 * Existe pra tela ter UM botão de importar em vez de dois. Dois botões
 * ("importar criatura" / "importar pasta") transferem pra quem usa uma
 * pergunta que o arquivo já responde sozinho, e punem quem erra a resposta com
 * um erro que parece defeito.
 */
export async function lerArquivoDoBestiario(file: File): Promise<ChegadaDeArquivo> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const marca = new TextDecoder().decode(bytes.subarray(0, MARCA_ARQUIVO.length));

  if (marca === MARCA_ARQUIVO) {
    let json: string;
    try {
      json = await descomprimirBytes(bytes.subarray(MARCA_ARQUIVO.length) as Uint8Array<ArrayBuffer>);
    } catch {
      throw new CriaturaIlegivel("O arquivo está corrompido — a parte comprimida não abriu.");
    }
    let dados: unknown;
    try {
      dados = JSON.parse(json);
    } catch {
      throw new CriaturaIlegivel("Essa pasta não é deste site.");
    }
    if (!ehPastaPlausivel(dados)) {
      throw new CriaturaIlegivel("Esse arquivo não parece ser uma pasta exportada deste site.");
    }
    return { tipo: "pasta", pasta: dados };
  }

  // Um `.json` cru pode ser das duas coisas: se tiver `criaturas`, é pasta.
  if (marca !== "MTC1") {
    try {
      const dados = JSON.parse(new TextDecoder().decode(bytes));
      if (ehPastaPlausivel(dados)) return { tipo: "pasta", pasta: dados };
    } catch {
      /* não era JSON legível — o leitor de criatura dá a mensagem certa abaixo */
    }
  }

  return { tipo: "criatura", criatura: await lerArquivoDeCriatura(file) };
}
