import { CriaturaEncontro } from "./encounterSim";
import { base64UrlParaBytes, bytesParaBase64Url, comprimirTexto, descomprimirBytes } from "./compactacao";

/**
 * A criatura do Mestre dentro de um link — mesma ideia de `fichaLink.ts`,
 * adaptada pro que a criatura é: nenhuma imagem, nenhum `id` de personagem, só
 * os números e as Ações. Um Mestre passando um chefe pronto pra outro Mestre
 * (ou salvando um link pra sessão seguinte) ganha o mesmo atalho que o jogador
 * já tinha pra ficha: sem arquivo, sem achar onde ele foi salvo.
 *
 * A marca do fragmento é DIFERENTE da marca de `fichaLink.ts` (`gm`/`jm` contra
 * `g:`/`j:`) de propósito: as duas telas de importação são rotas diferentes
 * (`/ficha/importar` e `/encontros/importar`), e cada uma só deve aceitar o seu
 * — abrir a ficha de alguém como se fosse criatura (ou vice-versa) falharia de
 * um jeito confuso em vez de simplesmente dizer "link errado".
 */
const MARCA_GZIP = "gm";
const MARCA_CRU = "jm";

/** A criatura codificada, pronta pra virar o fragmento de uma URL. */
export async function codificarCriatura(criatura: CriaturaEncontro): Promise<string> {
  // `id` fica de fora pelo mesmo motivo de `codificarFicha`: quem importa
  // recebe um id novo, e mandar o antigo criaria duas disputando a mesma chave
  // se o Mestre importasse a própria criatura de volta.
  const { id: _id, ...enxuta } = criatura;
  const json = JSON.stringify(enxuta);
  const comprimido = await comprimirTexto(json);
  if (!comprimido) return MARCA_CRU + bytesParaBase64Url(new TextEncoder().encode(json));
  return MARCA_GZIP + bytesParaBase64Url(comprimido);
}

/**
 * Devolve a criatura de um fragmento, ou `null` se o texto não for uma.
 *
 * Igual `decodificarFicha`: o conteúdo vem de fora, então nada aqui confia
 * nele — qualquer passo pode lançar, e a validação de forma no fim (`papel` +
 * `acoes`) é a mesma que `lerArquivoDeCriatura` já faz.
 */
export async function decodificarCriatura(fragmento: string): Promise<Omit<CriaturaEncontro, "id"> | null> {
  const texto = fragmento.startsWith("#") ? fragmento.slice(1) : fragmento;
  if (!texto) return null;
  try {
    const marca = texto.slice(0, 2);
    const corpo = texto.slice(2);
    if (marca !== MARCA_GZIP && marca !== MARCA_CRU) return null;
    const bytes = base64UrlParaBytes(corpo);
    const json = marca === MARCA_GZIP ? await descomprimirBytes(bytes) : new TextDecoder().decode(bytes);
    const dados = JSON.parse(json);
    if (!dados || typeof dados !== "object" || !("papel" in dados) || !("acoes" in dados)) return null;
    return dados as Omit<CriaturaEncontro, "id">;
  } catch {
    return null;
  }
}

/** A URL completa de compartilhamento, a partir da origem atual. */
export async function linkDaCriatura(criatura: CriaturaEncontro): Promise<string> {
  return `${window.location.origin}/encontros/importar#${await codificarCriatura(criatura)}`;
}
