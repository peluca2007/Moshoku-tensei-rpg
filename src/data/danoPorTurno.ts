import regua from "./reguaMedida.json";
/**
 * Apêndice C — a régua de dano por turno.
 *
 * Isto era uma tabela escrita à mão dentro de `Appendices.tsx`: 15 colunas × 6
 * linhas de valores "~N" digitados na prosa. O livro a chama de "a régua com que
 * toda árvore futura deve ser medida" — e ela era a única régua do livro que
 * ninguém verificava.
 *
 * Ela ficou errada exatamente como o esperado: o Sopro Podre caiu de 10d8 pra
 * 6d8 no rework de 2026-09-03 e a coluna da Desintoxicação continuou anunciando
 * ~55 no 5º patamar, um número que a escola não alcançava mais. Nenhum leitor
 * tinha como saber.
 *
 * Mover pra cá não torna os números automáticos — eles continuam sendo uma
 * CALIBRAGEM humana, e têm que ser: "dano por turno" embute quantas Ações a
 * árvore gasta, quantos alvos ela pega, e se o alvo veste Touki. Nada disso está
 * nos dados de uma magia isolada.
 *
 * O que muda é que agora existe um piso verificável. `npm run check:livro`
 * compara cada célula com a média do MAIOR golpe único daquela árvore naquele
 * patamar: uma coluna de dano por turno pode ficar acima desse valor (várias
 * Ações, vários alvos), mas nunca abaixo dele. Quando um nerf derruba uma magia
 * abaixo do que a régua promete, o check avisa — em vez de a promessa
 * envelhecer em silêncio por seis meses.
 */

/**
 * Uma coluna da régua.
 *
 * `regua: false` marca as colunas que o próprio livro diz NÃO serem uma
 * medida de dano, e que por isso o check não verifica:
 *
 * - Barreira — continua fora da régua (Apêndice C). A Desintoxicação saiu
 *   desta lista no rework de 2026-09-26: com a Dose e a Inversão ela tem golpe
 *   de verdade, e a coluna passou a ser verificada como as outras.
 * - Cura — desde a Luz de Dois Gumes (Maestria de 1º patamar) a coluna TEM
 *   número: é o dano radiante que cada magia de cura causaria virada contra um
 *   hostil (Cura ~10, Prontidão ~12, Cura Suprema ~22, Cura Radiante ~32,
 *   Julgamento ~56 em área, Luz Absoluta ~90 em área). Ela segue `regua: false`
 *   porque o check lê `damage.normal`, e o campo da Cura descreve PV curados
 *   com o dobro da Ferida Fresca embutido — que a Luz de Dois Gumes NÃO aplica.
 *   Ligar o check aqui compararia a régua contra um número que a luz nunca
 *   entrega.
 * - Escudos — "pressupõe todas as Ações gastas defendendo. Um Defensor
 *   Imperador que ESCOLHA atacar faz perto de 48 por turno, não 18. A coluna
 *   mede o que ele faz no papel dele, não o teto dele."
 *
 * Verificar essas quatro contra o maior golpe delas seria cobrar da tabela uma
 * promessa que ela nunca fez.
 */
export interface ColunaDano {
  treeId: string;
  label: string;
  /** false = a coluna mede outra coisa; o check ignora. Padrão: true. */
  regua?: boolean;
}

export interface DanoPorTurnoLinha {
  /** Patamar, de "1º" a "6º". */
  patamar: string;
  /** Valor por árvore — a chave é o `id` da árvore em src/data/trees. */
  porArvore: Record<string, string>;
}

/** As colunas da primeira tabela (Magia), na ordem em que o livro as imprime. */
export const COLUNAS_MAGIA: ColunaDano[] = [
  { treeId: "agua", label: "Água" },
  { treeId: "fogo", label: "Fogo" },
  { treeId: "vento", label: "Vento" },
  { treeId: "terra", label: "Terra" },
  { treeId: "cura", label: "Cura", regua: false },
  { treeId: "desintoxicacao", label: "Desintox" },
  { treeId: "teorica", label: "Teórica" },
  { treeId: "invocacao", label: "Invocação" },
];

/** As colunas da segunda tabela (Corpo e Utilidade). */
export const COLUNAS_CORPO: ColunaDano[] = [
  { treeId: "deus-da-espada", label: "Espada" },
  { treeId: "deus-do-norte", label: "Norte" },
  { treeId: "deus-da-agua-corpo", label: "Suishin" },
  { treeId: "arquearia", label: "Arco" },
  { treeId: "armas-pesadas", label: "Lutador" },
  { treeId: "cavalaria-e-escudos", label: "Escudos", regua: false },
  /*
   * As tres arvores de Utilidade, cada uma com a propria coluna (0.1.12).
   *
   * Ate aqui elas dividiam UMA coluna chamada "Utilidade", e a razao era
   * constrangedora: duas das tres nao tinham dano NENHUM. So o Ladino tinha, e
   * ainda assim escondido — o Dano Furtivo vive na Maestria de 1o patamar, e
   * nao num campo `damage`, entao nenhuma conta do projeto o enxergava.
   *
   * Uma coluna para tres arvores diferentes e uma coluna que nao descreve
   * nenhuma delas. Agora o Bardo tem a Dissonancia e o Tatico tem a Ordem de
   * Tiro (as duas na Maestria de 1o, escalando por patamar, no mesmo molde que
   * o Ladino ja usava), e as tres tem numeros proprios.
   *
   * A ordem entre elas nao e acidente: o Ladino e o maior porque a arvore dele
   * diz, em texto, que e "a unica arvore de Utilidade com dano de verdade"; o
   * Bardo e o menor porque o dano dele e efeito colateral de uma habilidade
   * social, e cobra area em troca; o Tatico fica no meio, e o dano dele nem sai
   * da arma dele — sai do aliado que ele mandou atirar.
   */
  { treeId: "furtividade-e-armadilhas", label: "Ladino" },
  { treeId: "navegacao-e-lideranca", label: "Tático" },
  { treeId: "bardo-e-interacao", label: "Bardo" },
  /*
   * As duas híbridas. A régua dizia medir "toda árvore" e deixava de
   * fora justamente o Punho do Fogo, a árvore mexida por último. A linha é o
   * patamar NA HÍBRIDA, e não o do personagem: quem abre o 1º de qualquer uma já é
   * Intermediário nas duas árvores-mãe (o Vendaval exigia Avançado até 2026-09-26) — por isso as duas começam acima das árvores-mãe.
   * São estimativas a partir das colunas do Norte e do Lutador, não medições.
   */
  { treeId: "vendaval", label: "Vendaval" },
  { treeId: "punho-de-fogo", label: "Punho" },
];

/*
 * AS TABELAS SAEM DA MEDIÇÃO (2026-10-08, decisão do autor A-1).
 *
 * Até aqui as duas tabelas eram escritas à mão, "~16" a "~130", e a conferência
 * pelo simulador as achava longe do jogo (magia de 1º prometendo ~16 e
 * entregando ~5). Agora cada célula é `reguaMedida.json`, gerado por
 * `npm run gerar:regua` com o método escrito nele (e impresso no Apêndice C):
 * "grupo · alvo único" — a luta contra cinco criaturas do molde e a mesma luta
 * contra uma só, com o PV das cinco. A Cura mede PV curados por turno.
 * `check:regua` reprova quando o JSON fica velho.
 */
export interface CelulaMedida {
  treeId: string;
  patamar: number;
  grupo: number;
  alvo: number;
  cura: number;
  sobrevive: number;
}

export const REGUA_MEDIDA = regua as { metodo: string; batalhas: number; semente: number; hash: string; linhas: CelulaMedida[] };

export function celulaMedida(treeId: string, patamar: number): CelulaMedida | undefined {
  return REGUA_MEDIDA.linhas.find((l) => l.treeId === treeId && l.patamar === patamar);
}

const inteiro = (n: number) => String(Math.round(n));

function linhasDe(colunas: ColunaDano[]): DanoPorTurnoLinha[] {
  return [1, 2, 3, 4, 5, 6].map((patamar) => ({
    patamar: `${patamar}º`,
    porArvore: Object.fromEntries(
      colunas.flatMap((c) => {
        const m = celulaMedida(c.treeId, patamar);
        if (!m) return [];
        return [[c.treeId, c.treeId === "cura" ? `cura ${inteiro(m.cura)}` : `${inteiro(m.grupo)} · ${inteiro(m.alvo)}`]];
      }),
    ),
  }));
}

export const DANO_POR_TURNO_MAGIA: DanoPorTurnoLinha[] = linhasDe(COLUNAS_MAGIA);
export const DANO_POR_TURNO_CORPO: DanoPorTurnoLinha[] = linhasDe(COLUNAS_CORPO);

/** O número da célula, quando ela tem um. "—" e "0 a ∞" devolvem null de propósito. */
export function valorNumerico(celula: string): number | null {
  const m = celula.match(/~?(\d+)/);
  return m ? Number(m[1]) : null;
}
