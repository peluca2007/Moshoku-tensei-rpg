import type { Race } from "@/lib/types";
import { ATTRIBUTES } from "@/lib/types";
import { getRaceProbabilities, RACE_WEIGHT } from "@/lib/randomCharacter";
import { RACES } from "@/data/races";
import RaceCrest from "../RaceCrest";
import { BookTable } from "./BookUI";
import { arteDaRaca, enquadrar, PASTA_DA_ARTE_DAS_RACAS } from "./arteDasRacas";
import ImagemDoLivro from "./ImagemDoLivro";

/**
 * A PÁGINA DE UMA RAÇA (2026-09-25).
 *
 * Antes cada raça era um cartãozinho de três linhas com o brasão do lado — a
 * seção mais importante da criação de personagem cabia em duas páginas e
 * meia, e parecia rodapé. O autor pediu que as raças tivessem uma parte
 * maior, com lugar pra ilustração.
 *
 * No livro folheado cada raça ganha uma PÁGINA INTEIRA (folhear.css): a
 * ilustração no alto, o nome gritado, o carimbo da raridade, a faixa de
 * números, a epígrafe e os traços em duas colunas. Todas as páginas de raça
 * têm a mesma faixa de números na mesma posição, então folhear as doze é
 * comparar as doze — que é o que a mesa faz quando escolhe.
 *
 * No modo contínuo é um cartão grande com as mesmas partes.
 *
 * Tudo sai dos dados (`src/data/races.ts` e os pesos do sorteio em
 * `src/lib/randomCharacter.ts`): nada aqui é escrito à mão, então mudar uma
 * raça muda a página dela sozinho.
 */

const ROTULO_DO_ATRIBUTO = Object.fromEntries(ATTRIBUTES.map((a) => [a.key, a.short]));

/** A chance de cada raça no sorteio, a mesma tabela que a roleta usa. */
const CHANCE = new Map(getRaceProbabilities().map((p) => [p.id, p.probability]));

/** Quanto mais forte, mais rara: as faixas de peso do sorteio, em palavra. */
function raridade(id: string): string {
  const peso = RACE_WEIGHT[id] ?? 0;
  if (peso >= 5) return "Comum";
  if (peso >= 3) return "Incomum";
  if (peso >= 2) return "Rara";
  return "Mítica";
}

/** 0,0825 → "8,3" (o épsilon segura o 8,25 que o ponto flutuante guarda como 8,2499…). */
function porcento(p: number): string {
  return (Math.round(p * 1000 + 1e-6) / 10).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

/** "Povo Pequeno / Hobbit (Hobitto)" → nome e leitura japonesa. */
function partirNome(nome: string): { nome: string; leitura?: string } {
  const m = nome.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? { nome: m[1], leitura: m[2] } : { nome };
}

/**
 * "Sangue da Forja: magias de Terra…" → nome do traço + texto. Só quando o
 * que vem antes dos dois-pontos é curto o bastante pra ser um nome (os traços
 * que só repetem o bônus, "+1 em Vigor…", ficam inteiros).
 */
function partirTraco(t: string): { nome?: string; texto: string } {
  const i = t.indexOf(":");
  if (i > 0 && i <= 56 && !/^[+\-\d]/.test(t)) return { nome: t.slice(0, i), texto: t.slice(i + 1).trim() };
  return { texto: t };
}

type Celula = { rotulo: string; valor: string; nota?: string };

/** A faixa de números: as cinco coisas que a raça põe na ficha, sempre na mesma ordem. */
function numeros(race: Race): Celula[] {
  const b = race.bonuses;
  const atributos = Object.entries(b.attributes ?? {}).filter(([, v]) => v);
  const pericias = race.fixedSkills ?? [];
  return [
    atributos.length
      ? {
          rotulo: "Atributo",
          valor: atributos.map(([k, v]) => `+${v} ${ROTULO_DO_ATRIBUTO[k] ?? k}`).join(" "),
        }
      : race.attributeChoices
        ? { rotulo: "Atributo", valor: `+${race.attributeChoices}`, nota: "à sua escolha" }
        : { rotulo: "Atributo", valor: "—" },
    b.maxHp ? { rotulo: "PV", valor: `+${b.maxHp}`, nota: "fixos" } : { rotulo: "PV", valor: "—" },
    b.mpPerMagicRank
      ? { rotulo: "PM", valor: `×${b.mpPerMagicRank}`, nota: "Bônus de Rank de magia" }
      : b.maxMp
        ? { rotulo: "PM", valor: `+${b.maxMp}`, nota: "fixos" }
        : { rotulo: "PM", valor: "—" },
    b.armorClass ? { rotulo: "CA", valor: `+${b.armorClass}` } : { rotulo: "CA", valor: "—" },
    pericias.length
      ? { rotulo: "Perícias", valor: `+${pericias.length}`, nota: pericias.join(", ") }
      : race.bonusSkillChoices
        ? { rotulo: "Perícias", valor: `+${race.bonusSkillChoices}`, nota: "à sua escolha" }
        : { rotulo: "Perícias", valor: "—" },
  ];
}

export default function FichaDeRaca({ race, ordem, total }: { race: Race; ordem: number; total: number }) {
  const { nome, leitura } = partirNome(race.name);
  const arte = arteDaRaca(race.id);
  const chance = CHANCE.get(race.id);
  const tracos = race.traits.filter((t) => !t.startsWith("Línguas:"));
  const linguas = race.traits.find((t) => t.startsWith("Línguas:"))?.slice("Línguas:".length).trim();
  const ordemTexto = `${String(ordem).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  return (
    <article
      id={`raca-${race.id}`}
      data-raca={race.id}
      className="livro-raca print-avoid-break overflow-hidden rounded-xl pb-4 border border-parchment-300 bg-parchment-100/60 text-sm dark:border-parchment-800 dark:bg-parchment-900/40"
    >
      <header className="livro-raca-cabeca flex items-end justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <p className="livro-raca-ordem text-2xs font-bold uppercase tracking-[0.25em] text-gold-700 dark:text-gold-400">
            Raça {ordemTexto}
          </p>
          <h3 className="livro-raca-nome font-display text-2xl font-semibold text-parchment-900 dark:text-parchment-50">{nome}</h3>
        </div>
        {leitura && (
          <p className="livro-raca-leitura shrink-0 pb-1 text-xs italic text-parchment-600 dark:text-parchment-400">{leitura}</p>
        )}
      </header>

      <figure
        className="livro-raca-arte relative mx-4 mt-3 flex aspect-[21/9] items-center justify-center overflow-hidden rounded-lg border border-parchment-300 bg-parchment-200/50 dark:border-parchment-800 dark:bg-parchment-950/50"
        data-vazia={arte ? undefined : ""}
        data-recorte={arte?.recorte ? "" : undefined}
      >
        {arte ? (
          <ImagemDoLivro
            arte={arte}
            alt={`Ilustração: ${nome}.`}
            modo={enquadrar(arte, 2.1, 696)}
            className={`h-full w-full ${arte.recorte ? "object-contain object-bottom" : "object-cover"}`}
          />
        ) : (
          <span
            className="livro-raca-brasao"
            // Em desenvolvimento, o quadro vazio diz o nome do arquivo que o preenche.
            data-arquivo={process.env.NODE_ENV === "development" ? `public${PASTA_DA_ARTE_DAS_RACAS}/${race.id}.webp` : undefined}
          >
            <RaceCrest race={race} size={104} rounded="rounded-full" />
          </span>
        )}
        {chance !== undefined && (
          <span className="livro-raca-carimbo absolute right-2 top-2 rounded bg-parchment-50/90 px-2 py-1 text-right text-2xs font-bold uppercase tracking-wider text-wine-700 dark:bg-parchment-950/80 dark:text-wine-300">
            {raridade(race.id)}
            <small className="block font-medium normal-case tracking-normal">{porcento(chance)}% no sorteio</small>
          </span>
        )}
      </figure>

      <dl className="livro-raca-numeros mx-4 mt-3 grid grid-cols-5 divide-x divide-parchment-300 rounded-lg border border-parchment-300 text-center dark:divide-parchment-800 dark:border-parchment-800">
        {numeros(race).map((c) => (
          <div key={c.rotulo} className="livro-raca-numero px-1 py-1.5" data-vazio={c.valor === "—" ? "" : undefined}>
            <dt className="text-3xs font-bold uppercase tracking-wider text-parchment-600 dark:text-parchment-400">{c.rotulo}</dt>
            <dd className="font-display text-sm font-semibold text-parchment-900 sm:text-base dark:text-parchment-50">{c.valor}</dd>
            {c.nota && <dd className="livro-raca-nota text-3xs leading-tight text-parchment-600 dark:text-parchment-400">{c.nota}</dd>}
          </div>
        ))}
      </dl>

      <p className="livro-raca-descricao mx-4 mt-3 font-display italic text-parchment-700 dark:text-parchment-300">{race.description}</p>

      <ul className="livro-raca-tracos mx-4 mt-2 space-y-1.5 text-parchment-700 dark:text-parchment-300">
        {tracos.map((t, i) => {
          const { nome: nomeDoTraco, texto } = partirTraco(t);
          return (
            <li key={i}>
              {nomeDoTraco && <b className="livro-raca-traco-nome text-parchment-900 dark:text-parchment-50">{nomeDoTraco}. </b>}
              {texto}
            </li>
          );
        })}
      </ul>

      {linguas && (
        <p className="livro-raca-linguas mx-4 mt-3 border-t border-parchment-300 pt-2 text-xs text-parchment-600 dark:border-parchment-800 dark:text-parchment-400">
          <b className="uppercase tracking-wider">Línguas</b> {linguas}
        </p>
      )}
    </article>
  );
}

/** Uma célula da faixa numa linha de tabela: "+2 à escolha", "Ofícios (Forja)", "×2 Bônus de Rank de magia". */
function resumo(c: Celula): string {
  if (!c.nota) return c.valor;
  if (c.rotulo === "Perícias" && !c.nota.startsWith("à")) return c.nota;
  return `${c.valor} ${c.nota.replace("à sua escolha", "à escolha")}`;
}

/**
 * AS DOZE RAÇAS NUM RELANCE: a faixa de números de todas as páginas de raça
 * numa tabela só, com a raridade do sorteio. É o quadro comparativo da seção
 * — quem está escolhendo compara aqui e vai à página da raça pelo nome.
 */
export function QuadroDasRacas() {
  return (
    <BookTable
      headers={["Raça", "Sorteio", "Atributo", "PV", "PM", "CA", "Perícias"]}
      rows={RACES.map((race) => {
        const chance = CHANCE.get(race.id);
        const [atributo, pv, pm, ca, pericias] = numeros(race).map(resumo);
        return [
          <a key="nome" href={`#raca-${race.id}`} className="livro-raca-link hover:underline">
            {partirNome(race.name).nome}
          </a>,
          chance === undefined ? raridade(race.id) : `${raridade(race.id)} · ${porcento(chance)}%`,
          atributo,
          pv,
          pm,
          ca,
          pericias,
        ];
      })}
    />
  );
}

/**
 * A VITRINE DAS DOZE RAÇAS: o brasão (ou a ilustração, quando chegar) de cada
 * uma, com o nome e a raridade, levando à página dela.
 *
 * Mora logo antes das páginas de raça, e no livro folheado é ela que ocupa o
 * resto da última página de texto: a primeira página de raça sempre começa
 * numa página nova, e sem a vitrine sobrava um buraco antes dela. Ela estica
 * até o pé da página (esticarVitrines, em diagramacao.ts) e reorganiza os
 * brasões conforme o espaço; se o espaço for pequeno demais, some.
 */
export function VitrineDasRacas() {
  return (
    <nav aria-label="As doze raças" className="livro-vitrine livro-racas-vitrine mt-4">
      <p className="livro-vitrine-titulo text-2xs font-bold uppercase tracking-[0.25em] text-gold-700 dark:text-gold-400">
        As doze raças — toque numa pra ir à página dela
      </p>
      <ul className="livro-vitrine-lista mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {RACES.map((race) => {
          const arte = arteDaRaca(race.id);
          const chance = CHANCE.get(race.id);
          return (
            <li key={race.id}>
              <a
                href={`#raca-${race.id}`}
                data-raca={race.id}
                className="livro-vitrine-item flex flex-col items-center gap-1 rounded-lg p-2 text-center no-underline hover:bg-parchment-200/50 dark:hover:bg-parchment-800/50"
              >
                <span className="livro-vitrine-retrato">
                  {arte ? (
                    // eslint-disable-next-line @next/next/no-img-element -- miniatura da ilustração da raça, recortada em círculo.
                    <img
                      src={arte.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      data-recorte={arte.recorte ? "" : undefined}
                      className={`h-14 w-14 rounded-full object-cover ${arte.recorte ? "object-[center_8%]" : ""}`}
                    />
                  ) : (
                    <RaceCrest race={race} size={56} rounded="rounded-full" />
                  )}
                </span>
                <span className="livro-vitrine-nome text-xs font-semibold text-parchment-900 dark:text-parchment-100">
                  {partirNome(race.name).nome}
                </span>
                <span className="livro-vitrine-raridade text-3xs uppercase tracking-wider text-parchment-600 dark:text-parchment-400">
                  {raridade(race.id)}
                  {chance !== undefined && ` · ${porcento(chance)}%`}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
