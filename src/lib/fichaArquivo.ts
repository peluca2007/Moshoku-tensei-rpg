import { CharacterData } from "./types";
import { comImagensSaneadas, reduzirDataUrl } from "./imagemDaFicha";
import { comprimirTexto, descomprimirBytes } from "./compactacao";

/**
 * A ficha num arquivo só — comprimida, e COM as imagens dentro.
 *
 * ## Por que não continuou sendo JSON
 *
 * O JSON exportado sempre carregou a ficha inteira, e isso deixou de ser barato
 * no dia em que a ficha ganhou foto e capa: uma imagem em base64 é texto, e uma
 * ficha com as duas passa de 350 KB de JSON — quase tudo caracteres de base64.
 * Mandar isso pro Mestre por Discord funciona e é feio.
 *
 * Duas coisas resolvem, e as duas juntas cortam o arquivo em cerca de um quinto:
 *
 * 1. **As imagens são reencodadas PARA COMPARTILHAR.** A capa que a ficha guarda
 *    tem 1200px porque atravessa um cabeçalho na tela de quem a criou; quem
 *    recebe a ficha vê a mesma capa, e 640px continuam sendo mais do que um
 *    cabeçalho de 1024 precisa. A foto cai de 512 para 256 pelo mesmo motivo.
 *    O ORIGINAL não é tocado: quem exporta continua com a imagem grande.
 * 2. **Gzip.** O JSON de uma ficha é repetitivo (`treeId` aparece uma vez por
 *    magia comprada) e comprime muito bem. As imagens já são JPEG e não
 *    comprimem — por isso o passo 1 vem antes, e é ele que faz o trabalho.
 *
 * ## Por que não é o link
 *
 * Porque nenhuma das duas coisas salva o link. Mesmo reduzida, uma capa de 640px
 * tem uns 40 KB, que viram ~55 000 caracteres de URL — e navegador, Discord e
 * WhatsApp cortam muito antes disso. O link continua existindo e continua sendo
 * o caminho rápido, sem imagem; este arquivo é o caminho completo.
 *
 * ## O formato
 *
 * `MTF1` + gzip(JSON). O prefixo existe pra que a importação saiba o que chegou
 * sem adivinhar pela extensão — e pra que um `.json` antigo continue entrando,
 * porque ficha de mesa não se abandona por causa de formato.
 */

/** Assinatura do formato. Quatro bytes ASCII no começo do arquivo. */
const MARCA_ARQUIVO = "MTF1";
const EXTENSAO = "mtficha";

/** O que a importação aceita na caixa de diálogo. */
export const ACEITA_NA_IMPORTACAO = `.${EXTENSAO},application/json,.json`;

/** Lado máximo das imagens DENTRO do arquivo compartilhado. */
const PARA_COMPARTILHAR = {
  cover: { ladoMaior: 640, maxBytes: 90 * 1024 },
  portrait: { ladoMaior: 256, maxBytes: 30 * 1024 },
} as const;

interface FichaEmpacotada {
  blob: Blob;
  nomeDoArquivo: string;
  /** Tamanho final, pra tela poder dizer quanto ficou. */
  bytes: number;
}

/**
 * A ficha pronta pra baixar. Não altera a ficha em memória: as imagens menores
 * existem só dentro do arquivo.
 */
export async function empacotarFicha(character: CharacterData): Promise<FichaEmpacotada> {
  const paraArquivo: CharacterData = {
    ...character,
    portrait: character.portrait
      ? await reduzirDataUrl(character.portrait, PARA_COMPARTILHAR.portrait)
      : undefined,
    cover: character.cover ? await reduzirDataUrl(character.cover, PARA_COMPARTILHAR.cover) : undefined,
  };

  const json = JSON.stringify(paraArquivo);
  // Sem `CompressionStream` (navegador antigo) o arquivo sai como JSON puro,
  // com a mesma extensão: a leitura detecta pelo prefixo, e uma ficha grande é
  // melhor que uma ficha que não exporta.
  const comprimido = await comprimirTexto(json);
  if (!comprimido) {
    const blob = new Blob([json], { type: "application/json" });
    return { blob, nomeDoArquivo: nomeDoArquivo(character), bytes: blob.size };
  }

  const blob = new Blob([new TextEncoder().encode(MARCA_ARQUIVO), comprimido], {
    type: "application/octet-stream",
  });
  return { blob, nomeDoArquivo: nomeDoArquivo(character), bytes: blob.size };
}

function nomeDoArquivo(character: CharacterData): string {
  const base = (character.name || "ficha").trim().replace(/[^\p{L}\p{N}\- ]/gu, "") || "ficha";
  return `${base}.${EXTENSAO}`;
}

export class FichaIlegivel extends Error {}

/**
 * Lê um arquivo de ficha — o formato novo ou um `.json` antigo.
 *
 * Nada aqui confia no conteúdo: ele veio de outra pessoa. A validação de forma é
 * a mesma que o `Importar JSON` sempre fez (`attributeBase` é o campo que toda
 * ficha tem e que nenhum outro JSON teria por acaso), e as imagens passam pelo
 * mesmo saneamento do link — só `data:image/` dentro do teto.
 */
export async function lerArquivoDeFicha(file: File): Promise<Omit<CharacterData, "id">> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const marca = new TextDecoder().decode(bytes.subarray(0, MARCA_ARQUIVO.length));

  let json: string;
  if (marca === MARCA_ARQUIVO) {
    try {
      json = await descomprimirBytes(bytes.subarray(MARCA_ARQUIVO.length) as Uint8Array<ArrayBuffer>);
    } catch {
      throw new FichaIlegivel("O arquivo está corrompido — a parte comprimida não abriu.");
    }
  } else {
    json = new TextDecoder().decode(bytes);
  }

  let dados: unknown;
  try {
    dados = JSON.parse(json);
  } catch {
    throw new FichaIlegivel("Esse arquivo não é uma ficha deste site.");
  }
  if (!dados || typeof dados !== "object" || !("attributeBase" in dados)) {
    throw new FichaIlegivel("Esse arquivo não parece ser uma ficha exportada deste site.");
  }
  return comImagensSaneadas(dados as Omit<CharacterData, "id">);
}
