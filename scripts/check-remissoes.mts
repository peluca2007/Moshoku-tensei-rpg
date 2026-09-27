/**
 * REMISSÕES IMPRESSAS × SUMÁRIO REAL DO LIVRO.
 *
 * ## Por que existe
 *
 * "Cap. 4, §6" continua parecendo uma referência válida depois que a antiga
 * seção 6 vira a 7: capítulo e número existem, então o olho passa reto. Este
 * check usa os RÓTULOS de `sumarioDoLivro.ts` como verdade — não tenta deduzir
 * número pelo id histórico — e confere Capítulo, seção e Apêndice citados em
 * toda fonte que vira texto impresso.
 *
 * Capítulo/seção inexistente é FALHA. Assunto que não aparece na seção alvo é
 * AVISO, porque JSX dinâmico e paráfrase impedem certeza. `§N` sem capítulo é
 * resolvido pelo arquivo ChapterN; em dado compartilhado ele é suspeito e vira
 * AVISO, pois não há capítulo local inequívoco.
 *
 *   npm run check:remissoes
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SUMARIO_DO_LIVRO } from "../src/data/sumarioDoLivro";

interface Achado {
  gravidade: "FALHA" | "AVISO";
  regra: string;
  onde: string;
  frase: string;
}

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const relativo = (arquivo: string) => path.relative(RAIZ, arquivo).replaceAll("\\", "/");
const ler = (arquivo: string) => readFileSync(arquivo, "utf8");
const semAcentos = (texto: string) => texto.normalize("NFD").replace(/\p{M}/gu, "");
const normaliza = (texto: string) => semAcentos(texto).toLocaleLowerCase("pt-BR").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/** Remove comentários preservando as quebras de linha usadas no relatório. */
function somenteTextoImpresso(fonte: string): string {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, (comentario) => comentario.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const arquivosDeCapitulo = [0, 1, 2, 3, 4, 5].map((n) => path.join(RAIZ, `src/components/book/Chapter${n}.tsx`));
const FONTES = [
  ...arquivosDeCapitulo,
  path.join(RAIZ, "src/components/book/Appendices.tsx"),
  ...readdirSync(path.join(RAIZ, "src/data/trees"))
    .filter((nome) => nome.endsWith(".ts") && nome !== "index.ts")
    .map((nome) => path.join(RAIZ, "src/data/trees", nome)),
  ...[
    "src/data/races.ts",
    "src/data/backgrounds.ts",
    "src/data/shopItems.ts",
    "src/data/bestiary.ts",
    "src/data/preMadeMonsters.ts",
  ].map((arquivo) => path.join(RAIZ, arquivo)),
];

const capitulos = new Map<number, (typeof SUMARIO_DO_LIVRO)[number]>();
for (const entrada of SUMARIO_DO_LIVRO) {
  const numero = entrada.id.match(/^cap(\d+)$/)?.[1];
  if (numero !== undefined) capitulos.set(Number(numero), entrada);
}
const apendices = new Map(
  (SUMARIO_DO_LIVRO.find((entrada) => entrada.id === "apendices")?.children ?? [])
    .filter((entrada) => /^apendice-[a-z]$/.test(entrada.id))
    .map((entrada) => [entrada.id.at(-1)!.toUpperCase(), entrada] as const),
);

function secaoNumerada(capitulo: number, secao: number) {
  return capitulos.get(capitulo)?.children?.find((entrada) => Number(entrada.label.match(/^(?:—\s*)?(\d+)\./)?.[1]) === secao);
}

const corpusPorId = new Map<string, string>();
for (const [numero, capitulo] of capitulos) {
  const arquivo = arquivosDeCapitulo[numero];
  if (!arquivo) continue;
  const fonte = somenteTextoImpresso(ler(arquivo));
  corpusPorId.set(capitulo.id, normaliza(`${capitulo.label}\n${fonte}`));
  const numeradas = (capitulo.children ?? [])
    .filter((entrada) => /^(?:—\s*)?\d+\./.test(entrada.label))
    .map((entrada) => ({ entrada, inicio: fonte.indexOf(`id="${entrada.id}"`) }))
    .filter((item) => item.inicio >= 0)
    .sort((a, b) => a.inicio - b.inicio);
  numeradas.forEach((item, indice) => {
    const fim = numeradas[indice + 1]?.inicio ?? fonte.length;
    corpusPorId.set(item.entrada.id, normaliza(`${item.entrada.label}\n${fonte.slice(item.inicio, fim)}`));
  });
}

const fonteApendices = somenteTextoImpresso(ler(path.join(RAIZ, "src/components/book/Appendices.tsx")));
const apendicesOrdenados = [...apendices.values()]
  .map((entrada) => ({ entrada, inicio: fonteApendices.indexOf(`id="${entrada.id}"`) }))
  .filter((item) => item.inicio >= 0)
  .sort((a, b) => a.inicio - b.inicio);
apendicesOrdenados.forEach((item, indice) => {
  const fim = apendicesOrdenados[indice + 1]?.inicio ?? fonteApendices.length;
  corpusPorId.set(item.entrada.id, normaliza(`${item.entrada.label}\n${fonteApendices.slice(item.inicio, fim)}`));
});

/* Seções cujo texto principal vem de dados importados, não do JSX ao redor. */
const corpusDinamico: Record<string, string[]> = {
  "cap1-5": ["src/data/races.ts"],
  "cap1-6": ["src/data/backgrounds.ts"],
  "cap3-todas": readdirSync(path.join(RAIZ, "src/data/trees")).filter((n) => n.endsWith(".ts")).map((n) => `src/data/trees/${n}`),
  "cap4-condicoes": ["src/data/condicoes.ts"],
  "cap5-4": ["src/data/shopItems.ts"],
  "apendice-g": ["src/data/bestiary.ts", "src/data/preMadeMonsters.ts"],
};
for (const [id, arquivos] of Object.entries(corpusDinamico)) {
  const extra = arquivos.map((arquivo) => somenteTextoImpresso(ler(path.join(RAIZ, arquivo)))).join("\n");
  corpusPorId.set(id, `${corpusPorId.get(id) ?? ""} ${normaliza(extra)}`);
}

const PALAVRAS_VAZIAS = new Set([
  "a", "ao", "aos", "as", "cap", "capitulo", "da", "das", "de", "do", "dos", "e", "em", "na", "nas", "no", "nos",
  "o", "os", "para", "pela", "pelas", "pelo", "pelos", "regra", "regras", "secao", "ver",
]);
const ASSUNTOS_GENERICOS = new Set(["acao", "acoes", "alvo", "arvore", "bonus", "criatura", "dano", "efeito", "magia", "rank", "teste"]);

function assuntoAntes(linha: string, inicio: number): string | null {
  const antes = linha.slice(Math.max(0, inicio - 140), inicio).replace(/[({]+$/g, "").trim();
  const entreAspas = antes.match(/["“]([^"”]{3,90})["”][,;:\s-]*$/u)?.[1];
  if (entreAspas) return entreAspas;
  const titulo = antes.match(/((?:[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\p{L}À-ÿ-]*|d[aeo]s?|e)(?:[ \t]+(?:[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\p{L}À-ÿ-]*|d[aeo]s?|e)){0,5})[,;: \t-]*$/u)?.[1];
  if (titulo && /[ \t]+d[aeo]s?$/iu.test(titulo)) return null;
  return titulo?.replace(/\s+(?:d[aeo]s?|e)$/iu, "") ?? null;
}

function palavrasDoAssunto(assunto: string): string[] {
  return normaliza(assunto)
    .split(" ")
    .filter((palavra) => palavra.length >= 4 && !PALAVRAS_VAZIAS.has(palavra) && !ASSUNTOS_GENERICOS.has(palavra));
}

const achados: Achado[] = [];
const vistos = new Set<string>();
function anota(gravidade: Achado["gravidade"], regra: string, arquivo: string, linha: number, frase: string, coluna = 0) {
  const id = `${gravidade}|${regra}|${arquivo}|${linha}|${coluna}`;
  if (vistos.has(id)) return;
  vistos.add(id);
  achados.push({ gravidade, regra, onde: `${relativo(arquivo)}:${linha}`, frase: frase.trim().replace(/\s+/g, " ").slice(0, 260) });
}

function confereAssunto(assunto: string | null, destinoId: string, destino: string, arquivo: string, linha: number, frase: string, coluna: number) {
  if (!assunto) return;
  const palavras = palavrasDoAssunto(assunto);
  if (!palavras.length) return;
  const corpus = corpusPorId.get(destinoId) ?? "";
  if (palavras.some((palavra) => corpus.includes(palavra))) return;
  anota("AVISO", `assunto “${assunto}” não aparece em ${destino}`, arquivo, linha, frase, coluna);
}

const PADRAO_CAPITULO = /\bCap(?:ítulo)?\.?\s*(\d+)(?:\s*,?\s*(?:§|seção)\s*(\d+))?/giu;
const PADRAO_SECAO = /(?:§|seção)\s*(\d+)/giu;
const PADRAO_APENDICE = /\bApêndice\s+([A-Z])\b/giu;

let remissoesLidas = 0;
for (const arquivo of FONTES) {
  const fonte = somenteTextoImpresso(ler(arquivo));
  const capituloLocal = Number(path.basename(arquivo).match(/^Chapter(\d+)\.tsx$/)?.[1]);
  const localiza = (indice: number) => {
    const linha = fonte.slice(0, indice).split(/\r?\n/).length;
    const inicio = fonte.lastIndexOf("\n", indice - 1) + 1;
    const fimEncontrado = fonte.indexOf("\n", indice);
    const fim = fimEncontrado < 0 ? fonte.length : fimEncontrado;
    return { linha, frase: fonte.slice(inicio, fim), coluna: indice - inicio };
  };
  const ocupados: [number, number][] = [];
  const referenciasDeCapitulo = [...fonte.matchAll(PADRAO_CAPITULO)];

  for (const match of referenciasDeCapitulo) {
    remissoesLidas++;
    ocupados.push([match.index, match.index + match[0].length]);
    const local = localiza(match.index);
    const numeroCapitulo = Number(match[1]);
    const numeroSecao = match[2] === undefined ? null : Number(match[2]);
    const capitulo = capitulos.get(numeroCapitulo);
    if (!capitulo) {
      anota("FALHA", `Cap. ${numeroCapitulo} não existe`, arquivo, local.linha, local.frase, local.coluna);
      continue;
    }
    const assunto = assuntoAntes(fonte, match.index);
    if (numeroSecao === null) {
      confereAssunto(assunto, capitulo.id, `Cap. ${numeroCapitulo}`, arquivo, local.linha, local.frase, local.coluna);
      continue;
    }
    const secao = secaoNumerada(numeroCapitulo, numeroSecao);
    if (!secao) {
      anota("FALHA", `Cap. ${numeroCapitulo}, §${numeroSecao} não existe no sumário`, arquivo, local.linha, local.frase, local.coluna);
      continue;
    }
    confereAssunto(assunto, secao.id, `Cap. ${numeroCapitulo}, §${numeroSecao} (${secao.label})`, arquivo, local.linha, local.frase, local.coluna);
  }

  for (const match of fonte.matchAll(PADRAO_SECAO)) {
    if (ocupados.some(([inicio, fim]) => match.index >= inicio && match.index < fim)) continue;
    remissoesLidas++;
    const local = localiza(match.index);
    const numeroSecao = Number(match[1]);
    const anterior = referenciasDeCapitulo.findLast((ref) => ref.index + ref[0].length < match.index);
    const entre = anterior ? fonte.slice(anterior.index + anterior[0].length, match.index) : "";
    const capituloCompartilhado = anterior && entre.length <= 12 && /^[\s,;eou/<>"'{}-]*$/iu.test(entre)
      ? Number(anterior[1])
      : null;
    const capituloDaSecao = capituloCompartilhado ?? (Number.isFinite(capituloLocal) ? capituloLocal : null);
    if (capituloDaSecao === null) {
      anota("AVISO", `§${numeroSecao} sem capítulo em fonte compartilhada`, arquivo, local.linha, local.frase, local.coluna);
      continue;
    }
    const secao = secaoNumerada(capituloDaSecao, numeroSecao);
    if (!secao) {
      anota("FALHA", `§${numeroSecao} não existe no Cap. ${capituloDaSecao}`, arquivo, local.linha, local.frase, local.coluna);
      continue;
    }
    confereAssunto(assuntoAntes(fonte, match.index), secao.id, `Cap. ${capituloDaSecao}, §${numeroSecao} (${secao.label})`, arquivo, local.linha, local.frase, local.coluna);
  }

  for (const match of fonte.matchAll(PADRAO_APENDICE)) {
    remissoesLidas++;
    const local = localiza(match.index);
    const letra = match[1].toUpperCase();
    const apendice = apendices.get(letra);
    if (!apendice) {
      anota("FALHA", `Apêndice ${letra} não existe`, arquivo, local.linha, local.frase, local.coluna);
      continue;
    }
    confereAssunto(assuntoAntes(fonte, match.index), apendice.id, `Apêndice ${letra} (${apendice.label})`, arquivo, local.linha, local.frase, local.coluna);
  }
}

const falhas = achados.filter((a) => a.gravidade === "FALHA");
const avisos = achados.filter((a) => a.gravidade === "AVISO");

console.log("========================================");
console.log("REMISSÕES DO TEXTO × SUMÁRIO DO LIVRO");
console.log("========================================");
for (const grupo of [falhas, avisos]) {
  if (!grupo.length) continue;
  console.log(`\n${grupo[0].gravidade === "FALHA" ? "FALHAS (destino inexistente)" : "AVISOS (assunto duvidoso ou § sem contexto)"}`);
  for (const achado of grupo) {
    console.log(`\n  ${achado.regra}`);
    console.log(`    ${achado.onde}`);
    console.log(`    ${achado.frase}`);
  }
}
console.log("");
console.log(`Fontes lidas............................ ${FONTES.length}`);
console.log(`Remissões lidas........................ ${remissoesLidas}`);
console.log(`Falhas................................. ${falhas.length}`);
console.log(`Avisos................................. ${avisos.length}`);
console.log("========================================");

if (falhas.length) {
  console.error(`\n❌ ${falhas.length} remissão(ões) apontam para destino inexistente.`);
  process.exit(1);
}
console.log("\n✅ Toda remissão aponta para capítulo, seção ou apêndice existente.");
