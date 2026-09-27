/**
 * TERMOS APLICADOS NO LIVRO × TERMOS QUE O LIVRO DEFINE.
 *
 * ## Por que existe
 *
 * Uma condição inventada no meio de uma carta parece perfeitamente plausível
 * durante a revisão: começa com maiúscula, soa como regra e o leitor presume
 * que o glossário a explica. Só na mesa alguém descobre que "fica X" não diz
 * o que X faz. O programa é melhor que um leitor cansado em conferir as duas
 * pontas: todo estado aplicado precisa existir no Glossário de Condições ou
 * numa seção que defina o vocabulário básico do sistema.
 *
 * FALHA é reservada ao enunciado inequívoco que aplica um estado não definido
 * ("fica X", "aplica a condição X"). Maiúscula perto de "alvo" ou "enquanto"
 * é só AVISO: pode ser nome próprio ou começo de frase. O caminho inverso —
 * condição no glossário que nenhuma carta de árvore usa — também é AVISO.
 *
 *   npm run check:termos
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONDICOES, ESTADOS_DE_REGRA } from "../src/data/condicoes";

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
const chave = (texto: string) => semAcentos(texto).toLocaleLowerCase("pt-BR").replace(/\s+/g, " ").trim();

/** Remove comentários sem remover quebras de linha: arquivo:linha continua verdadeiro. */
function somenteTextoImpresso(fonte: string): string {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, (comentario) => comentario.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function fraseDaLinha(linha: string): string {
  return linha.trim().replace(/\s+/g, " ").slice(0, 240);
}

const arquivosDeCapitulo = [0, 1, 2, 3, 4, 5].map((n) => path.join(RAIZ, `src/components/book/Chapter${n}.tsx`));
const arquivosDeDados = [
  ...readdirSync(path.join(RAIZ, "src/data/trees"))
    .filter((nome) => nome.endsWith(".ts") && nome !== "index.ts")
    .map((nome) => path.join(RAIZ, "src/data/trees", nome)),
  "src/data/races.ts",
  "src/data/backgrounds.ts",
  "src/data/shopItems.ts",
  "src/data/bestiary.ts",
  "src/data/preMadeMonsters.ts",
  "src/components/book/Appendices.tsx",
].map((arquivo) => path.isAbsolute(arquivo) ? arquivo : path.join(RAIZ, arquivo));
const FONTES = [...arquivosDeCapitulo, ...arquivosDeDados];

const termosDefinidos = new Set<string>();
for (const condicao of [...CONDICOES, ...ESTADOS_DE_REGRA]) {
  termosDefinidos.add(chave(condicao.nome));
  for (const sinonimo of condicao.sinonimos ?? []) termosDefinidos.add(chave(sinonimo));
}

/*
 * Vocabulário definido fora do glossário. Cada grupo aponta para a seção que
 * lhe dá significado; manter a lista explícita torna uma exceção revisável, em
 * vez de ensinar o check a aceitar qualquer sigla ou palavra com maiúscula.
 */
const TERMOS_FIXOS: [string, string][] = [
  // Cap. 1, §2 — moedas de progressão e Pontos de Criação.
  ...["PA", "PC", "Pontos de Aprimoramento", "Ponto de Criação"].map((t) => [t, "Cap. 1, §2"] as [string, string]),
  // Cap. 1, §4 — resolução dos testes.
  ...["Perícia", "Proficiência", "Vantagem", "Desvantagem", "Vantagem Absoluta", "Teste Resistido", "Disputa"].map((t) => [t, "Cap. 1, §4"] as [string, string]),
  // Cap. 1, §7 — grandezas de rank.
  ...["BC", "Bônus de Conjuração", "Bônus de Rank", "Maior Bônus de Rank", "Rank", "Principiante", "Intermediário", "Avançado", "Santo", "Rei", "Imperador", "Deus"].map((t) => [t, "Cap. 1, §§3 e 7"] as [string, string]),
  // Cap. 2, §§2–3 — recursos e modos de conjuração.
  ...["PM", "Pontos de Mana", "Concentração", "Conjuração Padrão", "Conjuração Encurtada", "Conjuração Silenciosa", "Recitação Perfeita"].map((t) => [t, "Cap. 2, §§2–3"] as [string, string]),
  // Cap. 3 — recursos das árvores e unidades das cartas.
  ...["PT", "Pontos de Touki", "PP", "Pontos de Preparação", "Touki", "Dado de Arma", "Dado Base", "Maestria"].map((t) => [t, "Cap. 3"] as [string, string]),
  // Cap. 4, §§1–9 — combate, reservas, tempo e estados graduados.
  ...["PV", "Pontos de Vida", "CA", "Classe de Armadura", "CD", "Classe de Dificuldade", "Ação", "Ações", "Reação", "Deslocamento", "Cobertura", "Resistência", "Imunidade", "Vulnerabilidade", "Vulnerável", "Imune", "Resistente", "Crítico", "Ferida Fresca", "Fio da Vida", "Marca da Morte", "Sangrando", "Morrendo", "Trauma", "Exaustão", "Descanso Curto", "Descanso Longo", "Rodada", "Turno", "Cena"].map((t) => [t, "Cap. 4"] as [string, string]),
  ...["Morte", "Exausto", "Grande"].map((t) => [t, "Cap. 4, §§3, 7 e 9"] as [string, string]),
  // Cap. 5, §§1–4 — tempo e moedas entre aventuras.
  ...["Downtime", "Tempo Livre", "PO", "Peças de Ouro", "Rank de Aventureiro", "Reputação"].map((t) => [t, "Cap. 5"] as [string, string]),
  // Termos locais definidos na abertura da própria árvore que os usa.
  ["Sob Sua Guarda", "Cavalaria e Escudos, Intermediário — Puro Escudo"],
  ["Selado", "Barreira, Principiante — Fundamento"],
  ["Dormente", "Desintoxicação, Rei — Santuário da Panaceia"],
  ["Conjurando", "Cap. 2, §6 — Quando você está Conjurando"],
];
for (const [termo] of TERMOS_FIXOS) termosDefinidos.add(chave(termo));

const ignorados = new Set([
  "acao bonus", "agua", "area", "ataque", "ataques", "alvo", "arvore", "bonus", "combate", "dano", "deus",
  "espirito", "forca", "agilidade", "vigor", "intelecto", "mestre", "rank avancado", "rank deus", "rank imperador",
  "rank intermediario", "rank principiante", "rank rei", "rank santo", "uma acao", "duas acoes", "tres acoes",
  "agarrando", "ja", "nao", "sente",
]);

const PALAVRA = "[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\\p{L}À-ÿ-]*";
const TERMO = `(${PALAVRA}(?:\\s+(?:d[aeo]s?|e|${PALAVRA})){0,3})`;
const aplicacoesClaras = [
  new RegExp(`\\b(?:fica|ficam|fique|ficou|ficará|ficariam|torna-se|tornam-se)\\s+(?:imediatamente\\s+|automaticamente\\s+|também\\s+)?${TERMO}`, "gu"),
  new RegExp(`\\b(?:deixa|deixam)\\s+(?:o alvo|a criatura|o inimigo|você)\\s+${TERMO}`, "gu"),
  new RegExp(`\\b(?:aplica|aplicam|aplicar|impõe|impõem|recebe|recebem)\\s+(?:a\\s+)?(?:condição|estado)\\s+(?:de\\s+)?${TERMO}`, "gu"),
  new RegExp(`\\b(?:condição|estado)\\s+(?:de\\s+)?${TERMO}`, "gu"),
];
const usosSuspeitos = [
  new RegExp(`\\b(?:enquanto|alvo|criatura|inimigo)\\s+${TERMO}`, "gu"),
  new RegExp(`\\b(?:está|esteja|estiver|permanece)\\s+${TERMO}`, "gu"),
];

function limpaCandidato(candidato: string): string {
  return candidato
    .replace(/\s+(?:e|de|do|da|dos|das|no|na|num|numa|com|sem|até|pelo|pela|por|que)$/iu, "")
    .trim();
}

function formasPossiveis(termo: string): string[] {
  const base = chave(termo);
  const palavras = base.split(" ");
  const ultima = palavras.at(-1) ?? "";
  const prefixo = palavras.slice(0, -1).join(" ");
  const trocaUltima = (nova: string) => [prefixo, nova].filter(Boolean).join(" ");
  const formas = new Set([base]);
  if (ultima.endsWith("as")) formas.add(trocaUltima(`${ultima.slice(0, -2)}o`));
  if (ultima.endsWith("os")) formas.add(trocaUltima(ultima.slice(0, -1)));
  if (ultima.endsWith("a")) formas.add(trocaUltima(`${ultima.slice(0, -1)}o`));
  if (ultima.endsWith("s")) formas.add(trocaUltima(ultima.slice(0, -1)));
  return [...formas];
}

function partesNaoDefinidas(candidato: string): string[] {
  return candidato
    .split(/\s+e\s+/iu)
    .map(limpaCandidato)
    .filter(Boolean)
    .filter((parte) => {
      const formas = formasPossiveis(parte);
      if (formas.some((forma) => termosDefinidos.has(forma) || ignorados.has(forma))) return false;
      const [primeira, ...resto] = parte.split(" ");
      if (primeira === primeira.toLocaleUpperCase("pt-BR") && resto.length) {
        return !formasPossiveis(resto.join(" ")).some((forma) => termosDefinidos.has(forma));
      }
      return true;
    });
}

const achados: Achado[] = [];
const vistos = new Set<string>();
function anota(gravidade: Achado["gravidade"], regra: string, arquivo: string, linha: number, frase: string, termo?: string) {
  const id = `${gravidade}|${regra}|${arquivo}|${linha}|${termo ?? ""}`;
  if (vistos.has(id)) return;
  vistos.add(id);
  achados.push({ gravidade, regra, onde: `${relativo(arquivo)}:${linha}`, frase });
}

for (const arquivo of FONTES) {
  const linhas = somenteTextoImpresso(ler(arquivo)).split(/\r?\n/);
  linhas.forEach((linha, indice) => {
    for (const [gravidade, regras] of [["FALHA", aplicacoesClaras], ["AVISO", usosSuspeitos]] as const) {
      for (const regex of regras) {
        regex.lastIndex = 0;
        for (const casamento of linha.matchAll(regex)) {
          const candidato = limpaCandidato(casamento[1]);
          const indefinidos = partesNaoDefinidas(candidato);
          if (!indefinidos.length) continue;
          const exibido = indefinidos.join(" e ");
          const normalizado = chave(exibido);
          anota(
            gravidade,
            gravidade === "FALHA" ? `estado aplicado mas não definido: ${exibido}` : `possível termo não definido: ${exibido}`,
            arquivo,
            indice + 1,
            fraseDaLinha(linha),
            normalizado,
          );
        }
      }
    }
  });
}

const fontesDasCartas = arquivosDeDados.filter((arquivo) => arquivo.includes(`${path.sep}trees${path.sep}`));
const textoDasCartas = chave(fontesDasCartas.map((arquivo) => somenteTextoImpresso(ler(arquivo))).join("\n"));
const fonteCondicoes = ler(path.join(RAIZ, "src/data/condicoes.ts"));
for (const condicao of CONDICOES) {
  const formas = [condicao.nome, ...(condicao.sinonimos ?? [])].map(chave);
  if (formas.some((forma) => new RegExp(`(?:^|[^\\p{L}])${forma.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[^\\p{L}])`, "u").test(textoDasCartas))) continue;
  const linha = fonteCondicoes.slice(0, fonteCondicoes.indexOf(`nome: "${condicao.nome}"`)).split(/\r?\n/).length;
  anota(
    "AVISO",
    `condição definida mas nenhuma carta usa: ${condicao.nome}`,
    path.join(RAIZ, "src/data/condicoes.ts"),
    linha,
    `nome: "${condicao.nome}"`,
    condicao.id,
  );
}

const falhas = achados.filter((a) => a.gravidade === "FALHA");
const avisos = achados.filter((a) => a.gravidade === "AVISO");

console.log("========================================");
console.log("TERMOS USADOS × TERMOS DEFINIDOS NO LIVRO");
console.log("========================================");
for (const grupo of [falhas, avisos]) {
  if (!grupo.length) continue;
  console.log(`\n${grupo[0].gravidade === "FALHA" ? "FALHAS (estado aplicado sem definição)" : "AVISOS (heurística ou condição sem uso em carta)"}`);
  for (const achado of grupo) {
    console.log(`\n  ${achado.regra}`);
    console.log(`    ${achado.onde}`);
    console.log(`    ${achado.frase}`);
  }
}
console.log("");
console.log(`Fontes lidas............................ ${FONTES.length}`);
console.log(`Termos definidos....................... ${termosDefinidos.size}`);
console.log(`Falhas................................. ${falhas.length}`);
console.log(`Avisos................................. ${avisos.length}`);
console.log("========================================");

if (falhas.length) {
  console.error(`\n❌ ${falhas.length} estado(s) aplicado(s) sem definição no livro.`);
  process.exit(1);
}
console.log("\n✅ Nenhum estado aplicado inequivocamente ficou sem definição.");
