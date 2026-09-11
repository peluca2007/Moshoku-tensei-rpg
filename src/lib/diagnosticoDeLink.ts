/**
 * Por que um link de ficha (ou de criatura) não abriu.
 *
 * ## O problema que isto resolve
 *
 * `decodificarFicha` e `decodificarCriatura` devolviam `null` para cinco causas
 * completamente diferentes, e as duas telas de importação tratavam as cinco como
 * a mesma frase: "este link não traz uma ficha". Quem recebe não tinha como
 * saber se pediu ajuda pra pessoa errada, se o app cortou o link no meio, ou se
 * o problema era o navegador do próprio aparelho.
 *
 * Esse último caso não é hipotético — foi um relato de mesa (2026-09-10): um
 * link gerado no desktop não abriu no iPhone de um jogador. O suspeito está
 * escrito no caso `sem-gzip` de `descreverFalha`, no fim deste arquivo.
 *
 * ## Por que aqui, e não dentro de cada `*Link.ts`
 *
 * Ficha e criatura fazem exatamente os mesmos cinco passos, com marcas
 * diferentes (`g:`/`j:` contra `gm`/`jm`). O `compactacao.ts` já existe pela
 * mesma razão — foi extraído quando a terceira cópia do mesmo gzip apareceu.
 * Este arquivo é o irmão dele: `compactacao` sabe transformar bytes, e este sabe
 * dizer o que deu errado no caminho.
 */

import { base64UrlParaBytes, descomprimirBytes } from "./compactacao";

/**
 * As cinco causas, na ordem em que aparecem ao ler um fragmento.
 *
 * `cortado` junta base64 inválido, gzip que não descomprime e JSON que não
 * parseia de propósito: os três são o MESMO acidente visto de três alturas — o
 * texto não chegou inteiro —, e distingui-los na tela só diria à pessoa em qual
 * camada o link morreu, que não é uma informação que ela possa usar.
 */
export type MotivoDeFalha = "vazio" | "marca-desconhecida" | "sem-gzip" | "cortado" | "nao-e-isso";

export interface FalhaDeLink {
  ok: false;
  motivo: MotivoDeFalha;
  /** Tamanho do fragmento recebido. É o número que faz o remetente entender que o link foi cortado. */
  caracteres: number;
}

export type LeituraDeLink<T> = { ok: true; conteudo: T } | FalhaDeLink;

/**
 * O teto que morde de verdade: **2.000 caracteres**, que é o tamanho máximo de
 * uma mensagem do Discord.
 *
 * Medido em 2026-09-10 com fichas montadas pelo próprio `codificarFicha` — e a
 * primeira medição desta sessão saiu ERRADA, com um `purchasedAbilities` mais
 * enxuto que o real; foi o teste ao lado que pegou. Estes são os números com a
 * forma de verdade:
 *
 * | Personagem                     | Conhecimentos | URL    |
 * | ------------------------------ | ------------- | ------ |
 * | 1 árvore inteira até Imperador | 31            | ~1.086 |
 * | 2 árvores                      | 67            | ~1.594 |
 * | 3 árvores                      | 98            | ~2.058 |
 * | 4 árvores                      | 129           | ~2.490 |
 * | 5 árvores                      | 164           | ~2.990 |
 *
 * Ou seja, o teto morde mais cedo do que se imaginaria: **duas árvores passam
 * no Discord, três já não passam**. E três árvores não é exagero de
 * laboratório — é um multiclasse comum de campanha longa.
 *
 * A mesma tabela mata uma ideia que parece boa: "gera o link sem gzip, aí o
 * Safari velho lê". Sem gzip, a ficha de UMA árvore sai com ~4.650 caracteres —
 * mais que o dobro do teto. O gzip aqui não é otimização, é o que torna o
 * recurso possível.
 *
 * Os outros tetos (WhatsApp, iMessage, barra de endereço do Safari do iPhone)
 * são folgados o bastante para não decidirem nada, mas ainda **não foram
 * medidos em aparelho** — ver `O-QUE-FALTA.md`, item 2.
 */
export const LIMITE_DISCORD = 2000;

/** Um link deste tamanho não cabe numa mensagem do Discord — avise quem copiou. */
export function passaDoDiscord(caracteres: number): boolean {
  return caracteres > LIMITE_DISCORD;
}

/**
 * O navegador consegue LER um link comprimido?
 *
 * `DecompressionStream` chegou ao Safari no iOS 16.4 (março de 2023). Antes
 * disso, `CompressionStream` também não existia — então um iPhone velho não
 * gera nem lê link comprimido, e quem manda de um desktop com Chrome manda
 * sempre comprimido, porque lá ele existe.
 */
function navegadorLeComprimido(): boolean {
  return typeof DecompressionStream !== "undefined";
}

/**
 * Lê o fragmento até o JSON, atribuindo a falha a quem a causou.
 *
 * Não sabe o que está lendo — quem chama valida a forma e devolve `nao-e-isso`
 * quando o JSON é válido mas não é o que aquela tela esperava. É a mesma
 * divisão de `compactacao.ts`: bytes aqui, significado lá.
 */
export async function lerFragmento(
  fragmento: string,
  marcas: { gzip: string; cru: string }
): Promise<{ ok: true; json: string } | FalhaDeLink> {
  const texto = (fragmento.startsWith("#") ? fragmento.slice(1) : fragmento).trim();
  const caracteres = texto.length;
  if (!texto) return { ok: false, motivo: "vazio", caracteres };

  const marca = texto.slice(0, 2);
  const corpo = texto.slice(2);
  if (marca !== marcas.gzip && marca !== marcas.cru) {
    return { ok: false, motivo: "marca-desconhecida", caracteres };
  }
  if (marca === marcas.gzip && !navegadorLeComprimido()) {
    return { ok: false, motivo: "sem-gzip", caracteres };
  }

  try {
    const bytes = base64UrlParaBytes(corpo);
    const json = marca === marcas.gzip ? await descomprimirBytes(bytes) : new TextDecoder().decode(bytes);
    // O `parse` acontece aqui, e não em quem chama, pra que um JSON truncado
    // conte como `cortado` — que é o que ele é — em vez de virar `nao-e-isso`,
    // que mandaria a pessoa procurar o erro no lugar errado.
    JSON.parse(json);
    return { ok: true, json };
  } catch {
    return { ok: false, motivo: "cortado", caracteres };
  }
}

/**
 * Recolhe um link colado à mão até o pedaço que interessa.
 *
 * Faz três coisas, e a segunda é a que salva o caso mais comum de mesa:
 *
 * 1. **Fica com o que vem depois do último `#`** — assim funciona colando a URL
 *    inteira, e não só o fragmento cru.
 * 2. **Tira TODO espaço em branco, quebras de linha inclusive.** É legítimo
 *    porque o alfabeto base64url não tem espaço nenhum, e é exatamente o que
 *    conserta o acidente que a falha `cortado` descreve: aplicativo de mensagem
 *    que parte um link longo em duas linhas e só transforma a primeira em link
 *    clicável. Colando as duas linhas, a ficha volta a abrir.
 * 3. Aceita o fragmento sozinho, sem `#` e sem domínio, pra quem copiou só o fim.
 */
export function recolherLinkColado(texto: string): string {
  const depoisDaCerquilha = texto.includes("#") ? texto.slice(texto.lastIndexOf("#") + 1) : texto;
  return depoisDaCerquilha.replace(/\s+/g, "");
}

export interface TextoDaFalha {
  titulo: string;
  explicacao: string;
  /** O que fazer agora. Sempre existe: uma tela de erro sem saída é um beco. */
  saida: string;
}

/**
 * A frase que a tela mostra. Escrita para quem RECEBEU o link e não tem culpa
 * nenhuma — então nada de "formato inválido" ou "falha ao decodificar": cada
 * texto diz o que aconteceu, de quem é o problema, e o que fazer.
 */
export function descreverFalha(motivo: MotivoDeFalha, caracteres: number, oQue: "ficha" | "criatura"): TextoDaFalha {
  const isso = oQue === "ficha" ? "a ficha" : "a criatura";
  const arquivo = oQue === "ficha" ? "arquivo da ficha (.mtficha)" : "arquivo da criatura (.mtcriatura)";

  switch (motivo) {
    case "vazio":
      return {
        titulo: "O link chegou sem a parte que importa.",
        explicacao:
          `${isso[0].toUpperCase()}${isso.slice(1)} viaja depois do “#”, e alguns aplicativos cortam ` +
          "exatamente essa parte ao encurtar ou pré-visualizar um link.",
        saida: "Peça pra reenviar como texto simples — de preferência dentro de um bloco de código.",
      };

    case "marca-desconhecida":
      return {
        titulo: "Este link não é desta porta.",
        explicacao:
          "O conteúdo não começa como um link de " +
          (oQue === "ficha" ? "ficha" : "criatura") +
          " — pode ser um link de criatura aberto na tela de ficha (ou o contrário), ou um endereço colado pela metade.",
        saida:
          oQue === "ficha"
            ? "Se for uma criatura, abra em Encontros → Importar. Se não, peça o link de novo."
            : "Se for uma ficha de personagem, abra em Ficha → Importar. Se não, peça o link de novo.",
      };

    case "sem-gzip":
      return {
        titulo: "Este navegador é antigo demais para abrir o link.",
        explicacao:
          "O link vem comprimido, e a descompressão no navegador só existe no Safari a partir do iOS 16.4 " +
          "(março de 2023) — em iPhones mais antigos ela simplesmente não está lá. Não é problema do link " +
          "nem da ficha de quem te mandou.",
        saida: `Atualize o iOS, abra o mesmo link em outro navegador ou aparelho, ou peça o ${arquivo} e importe por ele.`,
      };

    case "cortado":
      return {
        titulo: "O link chegou pela metade.",
        explicacao:
          `Recebi ${caracteres.toLocaleString("pt-BR")} caracteres, e eles não formam ${isso} inteira. ` +
          "É o que acontece quando o aplicativo de mensagem quebra um link longo em duas linhas e só a " +
          "primeira vira link clicável.",
        saida: "Peça pra reenviar dentro de um bloco de código, ou cole o link inteiro no campo abaixo.",
      };

    case "nao-e-isso":
      return {
        titulo: `O link abriu, mas não tem ${isso} dentro.`,
        explicacao:
          "O conteúdo foi lido até o fim e é válido — só não tem o formato de " +
          (oQue === "ficha" ? "uma ficha de personagem" : "uma criatura") +
          ". Provavelmente foi montado à mão ou por uma versão bem antiga do site.",
        saida: `Peça o link de novo, ou o ${arquivo}.`,
      };
  }
}
