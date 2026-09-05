import { CriaturaEncontro } from "./encounterSim";
import { comprimirTexto, descomprimirBytes } from "./compactacao";

/**
 * A criatura do Mestre num arquivo só — mesma ideia de `fichaArquivo.ts`, sem a
 * parte de imagem: `CriaturaEncontro` não carrega foto nenhuma, então o
 * empacotamento aqui é só "JSON → gzip → marca". A ficha de personagem
 * precisava reencodar imagem porque ela é o que pesa; a criatura não tem esse
 * problema, e inventar um passo que ela não precisa só copiaria complexidade.
 *
 * ## Por que a criatura não exportava até aqui (2026-09-05)
 *
 * Ela vivia só no `localStorage` do Mestre: `useBestiaryStore.ts` é uma store
 * `persist` própria, sem nenhum caminho de saída. Isso combinava com o
 * bestiário ser "rascunho de sessão" (comentário da store) enquanto a criatura
 * era sete números soltos — mas desde que ela ganhou Ações escritas
 * (2026-09-03), ela é conteúdo que vale a pena levar de uma campanha pra outra,
 * ou mandar pro Mestre seguinte de uma mesa. `.mtficha` já resolvia esse
 * problema pro jogador; a criatura merece o mesmo, e reaproveita o mesmo par
 * gzip+marca — só a marca muda, pra a leitura nunca confundir um arquivo de
 * personagem com um de criatura.
 *
 * ## O formato
 *
 * `MTC1` + gzip(JSON). Mesmo motivo do `MTF1` da ficha: o prefixo deixa a
 * importação saber o que chegou sem depender da extensão do arquivo.
 */
const MARCA_ARQUIVO = "MTC1";
const EXTENSAO = "mtcriatura";

/** O que a importação aceita na caixa de diálogo. */
export const ACEITA_NA_IMPORTACAO_CRIATURA = `.${EXTENSAO},application/json,.json`;

interface CriaturaEmpacotada {
  blob: Blob;
  nomeDoArquivo: string;
  bytes: number;
}

function nomeDoArquivo(criatura: CriaturaEncontro): string {
  const base = (criatura.nome || "criatura").trim().replace(/[^\p{L}\p{N}\- ]/gu, "") || "criatura";
  return `${base}.${EXTENSAO}`;
}

/** A criatura pronta pra baixar. */
export async function empacotarCriatura(criatura: CriaturaEncontro): Promise<CriaturaEmpacotada> {
  const json = JSON.stringify(criatura);
  const comprimido = await comprimirTexto(json);
  // Sem `CompressionStream` (navegador antigo) o arquivo sai como JSON puro,
  // com a mesma extensão — mesma escolha de `fichaArquivo.ts`: criatura grande
  // é melhor que criatura que não exporta.
  if (!comprimido) {
    const blob = new Blob([json], { type: "application/json" });
    return { blob, nomeDoArquivo: nomeDoArquivo(criatura), bytes: blob.size };
  }
  const blob = new Blob([new TextEncoder().encode(MARCA_ARQUIVO), comprimido], {
    type: "application/octet-stream",
  });
  return { blob, nomeDoArquivo: nomeDoArquivo(criatura), bytes: blob.size };
}

export class CriaturaIlegivel extends Error {}

/**
 * Lê um arquivo de criatura — o formato novo ou um `.json` cru.
 *
 * `id` e os `id` de cada ação em `acoes` NÃO vêm daqui prontos pra usar: quem
 * chama (`useBestiaryStore.importarCriatura`) sorteia ids novos, pela mesma
 * razão de `importCharacter` — importar a própria criatura de volta não pode
 * criar duas disputando a mesma chave.
 */
export async function lerArquivoDeCriatura(file: File): Promise<Omit<CriaturaEncontro, "id">> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const marca = new TextDecoder().decode(bytes.subarray(0, MARCA_ARQUIVO.length));

  let json: string;
  if (marca === MARCA_ARQUIVO) {
    try {
      json = await descomprimirBytes(bytes.subarray(MARCA_ARQUIVO.length) as Uint8Array<ArrayBuffer>);
    } catch {
      throw new CriaturaIlegivel("O arquivo está corrompido — a parte comprimida não abriu.");
    }
  } else {
    json = new TextDecoder().decode(bytes);
  }

  let dados: unknown;
  try {
    dados = JSON.parse(json);
  } catch {
    throw new CriaturaIlegivel("Esse arquivo não é uma criatura deste site.");
  }
  // `papel` é o campo que toda criatura tem e que nenhum outro JSON teria por
  // acaso — mesmo raciocínio de `attributeBase` em `fichaArquivo.ts`, e o que
  // impede um `.mtficha` de personagem de entrar aqui por engano.
  if (!dados || typeof dados !== "object" || !("papel" in dados) || !("acoes" in dados)) {
    throw new CriaturaIlegivel("Esse arquivo não parece ser uma criatura exportada deste site.");
  }
  return dados as Omit<CriaturaEncontro, "id">;
}
