import { CharacterData } from "./types";
import { comImagensSaneadas } from "./imagemDaFicha";
import { base64UrlParaBytes, bytesParaBase64Url, comprimirTexto, descomprimirBytes } from "./compactacao";

/**
 * A ficha inteira dentro de um link.
 *
 * ## Por que existe
 *
 * Até aqui a única forma de passar uma ficha adiante era `Exportar JSON` → o
 * jogador acha o arquivo → manda no Discord → o Mestre baixa → `Importar JSON`.
 * Cinco passos e um arquivo solto por jogador, cinco vezes, toda vez que alguém
 * muda alguma coisa. O montador de encontros depende de ter as fichas do grupo
 * carregadas, então esse atrito estava exatamente no caminho da funcionalidade
 * mais cara do site.
 *
 * ## Por que no FRAGMENTO (`#`), e não na query (`?`)
 *
 * O fragmento nunca é enviado ao servidor. A ficha do personagem de alguém não
 * aparece em log de acesso, não entra em analytics e não vaza pro `Referer` de
 * um link clicado depois. Numa query string, apareceria nos três. Como o site
 * não tem backend de fichas — elas vivem no `localStorage` —, mandar o dado pro
 * servidor seria dar a ele uma informação que ele não quer ter.
 *
 * ## O tamanho
 *
 * Uma ficha fechada tem alguns KB de JSON, e boa parte é repetição (`treeId`
 * aparece uma vez por magia comprada). Gzip resolve isso muito bem — é o mesmo
 * motivo pelo qual o formato aguenta uma ficha de Imperador sem virar um link
 * de dez mil caracteres. `CompressionStream` é nativo do navegador desde 2023;
 * onde ele não existir, o link ainda é gerado, só mais longo, e a leitura
 * detecta qual dos dois formatos chegou pelo prefixo.
 */

/** Prefixo de 2 caracteres que diz em qual formato o corpo veio. */
const MARCA_GZIP = "g:";
const MARCA_CRU = "j:";

/** A ficha codificada, pronta pra virar o fragmento de uma URL. */
export async function codificarFicha(character: CharacterData): Promise<string> {
  // O `id` fica de fora: quem importa recebe um id novo (`importCharacter`), e
  // mandar o antigo junto só criaria duas fichas disputando a mesma chave se a
  // pessoa importasse a própria ficha de volta.
  //
  // `portrait` e `cover` ficam de fora por um motivo diferente, e mais duro: o
  // link não aguenta. JPEG já é dado comprimido, e o gzip abaixo não tira quase
  // nada dele — uma foto de 60 KB viraria ~80 000 caracteres de URL. Navegador,
  // Discord e WhatsApp cortam links muito antes disso, então mandá-las junto
  // não daria um link grande: daria um link QUEBRADO, que parece pronto ao ser
  // copiado e chega inútil do outro lado. Quem quiser passar a ficha COM as
  // imagens exporta o JSON, que é arquivo e não tem esse teto — e é o que a
  // tela de compartilhar avisa.
  const { id: _id, portrait: _portrait, cover: _cover, ...enxuta } = character;
  const json = JSON.stringify(enxuta);
  const comprimido = await comprimirTexto(json);
  if (!comprimido) return MARCA_CRU + bytesParaBase64Url(new TextEncoder().encode(json));
  return MARCA_GZIP + bytesParaBase64Url(comprimido);
}

/**
 * Devolve a ficha de um fragmento, ou `null` se o texto não for uma.
 *
 * O conteúdo vem de um link que OUTRA PESSOA montou, então nada aqui confia
 * nele: qualquer passo pode lançar, e a validação de forma no fim é a mesma que
 * o `Importar JSON` já faz — `attributeBase` é o campo que toda ficha tem e que
 * nenhum outro JSON teria por acaso.
 */
export async function decodificarFicha(fragmento: string): Promise<Omit<CharacterData, "id"> | null> {
  const texto = fragmento.startsWith("#") ? fragmento.slice(1) : fragmento;
  if (!texto) return null;
  try {
    const marca = texto.slice(0, 2);
    const corpo = texto.slice(2);
    if (marca !== MARCA_GZIP && marca !== MARCA_CRU) return null;
    const bytes = base64UrlParaBytes(corpo);
    const json = marca === MARCA_GZIP ? await descomprimirBytes(bytes) : new TextDecoder().decode(bytes);
    const dados = JSON.parse(json);
    if (!dados || typeof dados !== "object" || !("attributeBase" in dados)) return null;
    // `codificarFicha` nunca põe imagem no fragmento, então um link com uma foto
    // dentro foi montado à mão. Sanear aqui também é barato e fecha o caminho:
    // um `portrait` apontando pra fora entregaria o IP de quem abre a ficha ao
    // servidor de quem mandou o link.
    return comImagensSaneadas(dados as Omit<CharacterData, "id">);
  } catch {
    return null;
  }
}

/** A URL completa de compartilhamento, a partir da origem atual. */
export async function linkDaFicha(character: CharacterData): Promise<string> {
  return `${window.location.origin}/ficha/importar#${await codificarFicha(character)}`;
}
