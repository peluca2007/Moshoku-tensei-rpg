"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Dices,
  Download,
  Folder,
  FolderOpen,
  FolderPlus,
  Info,
  Link2,
  ListPlus,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Skull,
  Square,
  SquareCheckBig,
  Swords,
  Trash2,
  TriangleAlert,
  Upload,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import {
  CORES_DE_PASTA,
  CorDePasta,
  PastaCriaturas,
  useBestiaryStore,
} from "@/store/useBestiaryStore";
import { useInitiativeStore } from "@/store/useInitiativeStore";
import { getArmorClass, getMaxHp, getPaSpent } from "@/store/selectors";
import { getTreeById } from "@/data/trees/index";
import TreeCrest from "@/components/TreeCrest";
import Crest from "@/components/Crest";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import ImagemDaFicha from "@/components/ui/ImagemDaFicha";
import { CharacterData } from "@/lib/types";
import { SIMPLIFICACOES, mediaFormula, patamarDaFicha, rankDaFicha } from "@/lib/combatSim";
import {
  AcaoCriatura,
  CriaturaEncontro,
  ResultadoEncontro,
  aplicarPapel,
  danoDasAcoesPorRodada,
  planoDoTurno,
  simularEncontro,
  usaAcoes,
} from "@/lib/encounterSim";
import { CriaturaIlegivel, empacotarCriatura } from "@/lib/criaturaArquivo";
import {
  ACEITA_NA_IMPORTACAO_BESTIARIO,
  empacotarPasta,
  lerArquivoDoBestiario,
} from "@/lib/pastaArquivo";
import { linkDaCriatura } from "@/lib/criaturaLink";
import { AlvoDoGrupo, Aviso, NivelAviso, avisarSobreCriatura } from "@/lib/creatureAdvice";
import {
  AjusteSugerido,
  Faixa,
  Veredito,
  ajustarParaEquilibrio,
  arredondarPv,
  avaliar,
  formatarPorcentagem,
} from "@/lib/encounterBalance";
import {
  CRIATURAS_PRONTAS,
  MOLDES_CRIATURA,
  PAPEIS,
  PapelCriatura,
  bonusResistencia,
  getMoldePorPatamar,
  rodadasDoChefe,
  rotuloPatamar,
} from "@/data/bestiary";

/** Quantas batalhas o veredito roda. Alto o bastante pra estabilizar a % de vitória, baixo o bastante pra caber num clique. */
const BATALHAS = 300;
/** O ajuste automático roda 11 simulações; elas usam menos batalhas pra tela não travar. */
const BATALHAS_AJUSTE = 120;

const CORES_FAIXA: Record<Faixa, string> = {
  trivial: "border-parchment-300 bg-parchment-100 text-parchment-700 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-300",
  facil: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  equilibrado: "border-gold-300 bg-gold-50 text-gold-700 dark:border-gold-700 dark:bg-gold-950/40 dark:text-gold-200",
  perigoso: "border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
  letal: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
};

interface Relatorio {
  resultado: ResultadoEncontro;
  veredito: Veredito;
  ajuste: AjusteSugerido | null;
  criaturas: CriaturaEncontro[];
}

export default function EncounterBuilder() {
  const order = useCharacterStore((s) => s.order);
  const characters = useCharacterStore((s) => s.characters);
  const criaturas = useBestiaryStore((s) => s.criaturas);
  const selecionadas = useBestiaryStore((s) => s.selecionadas);
  const grupo = useBestiaryStore((s) => s.grupo);

  const [rodando, setRodando] = useState(false);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [novoPatamar, setNovoPatamar] = useState(3);
  const [novoPapel, setNovoPapel] = useState<PapelCriatura>("padrao");
  /**
   * A pasta em que a próxima criatura nasce.
   *
   * Vive na tela, e não na store, porque é uma escolha do momento — "agora
   * estou montando a emboscada da estrada" — e não parte do bestiário. O que é
   * do bestiário (as pastas e onde cada criatura está) é o que fica salvo.
   */
  const [pastaDestino, setPastaDestino] = useState<string | null>(null);

  const fichasDoGrupo = useMemo(
    () => grupo.map((id) => characters[id]).filter((c) => c !== undefined),
    [grupo, characters]
  );
  const criaturasDoEncontro = useMemo(
    () => criaturas.filter((c) => selecionadas.includes(c.id)),
    [criaturas, selecionadas]
  );

  /**
   * O grupo reduzido ao que os avisos citam: nome, PV e CA.
   *
   * Passar a `CharacterData` inteira faria cada tecla digitada no dano de uma
   * criatura recalcular os seletores das cinco fichas. Aqui os números saem uma
   * vez e o conselheiro fica sendo aritmética pura.
   */
  const alvosDoGrupo: AlvoDoGrupo[] = useMemo(
    () =>
      fichasDoGrupo.map((c) => ({
        id: c.id,
        nome: c.name || "Sem nome",
        pv: getMaxHp(c),
        ca: getArmorClass(c),
      })),
    [fichasDoGrupo]
  );

  /**
   * O patamar que o Apêndice G sugere pra este grupo.
   *
   * É a média dos patamares alcançados, arredondada — não o do personagem mais
   * forte. A tabela é calibrada contra um grupo, e um Avançado carregando
   * quatro Principiantes não faz do encontro um encontro de 3º patamar.
   */
  const patamarSugerido = useMemo(() => {
    if (fichasDoGrupo.length === 0) return null;
    const soma = fichasDoGrupo.reduce((s, c) => s + patamarDaFicha(c), 0);
    return Math.min(6, Math.max(1, Math.round(soma / fichasDoGrupo.length)));
  }, [fichasDoGrupo]);

  const podeSimular = fichasDoGrupo.length > 0 && criaturasDoEncontro.length > 0 && !rodando;

  function simular() {
    if (!podeSimular) return;
    setRodando(true);
    // Um respiro antes de travar o thread: sem isto o "Simulando…" nunca chega
    // a pintar e o botão parece congelado durante o segundo de cálculo.
    setTimeout(() => {
      const resultado = simularEncontro(fichasDoGrupo, criaturasDoEncontro, {
        batalhas: BATALHAS,
      });
      const veredito = avaliar(resultado);
      const ajuste =
        veredito.faixa === "equilibrado"
          ? null
          : ajustarParaEquilibrio((escala) =>
              simularEncontro(fichasDoGrupo, criaturasDoEncontro, {
                batalhas: BATALHAS_AJUSTE,
                escala,
              })
            );
      setRelatorio({ resultado, veredito, ajuste, criaturas: criaturasDoEncontro });
      setRodando(false);
    }, 30);
  }

  function mandarParaIniciativa() {
    const store = useInitiativeStore.getState();
    for (const criatura of criaturasDoEncontro) {
      for (let i = 0; i < criatura.quantidade; i++) {
        const nome = criatura.quantidade > 1 ? `${criatura.nome} ${i + 1}` : criatura.nome;
        // Iniciativa rolada aqui porque o Apêndice G não dá bônus nenhum à
        // criatura — d20 puro, o mesmo que a simulação usa.
        store.addCombatant(nome, Math.floor(Math.random() * 20) + 1, criatura.pv);
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <PageHeader icon={Skull} title="Encontros" faixa="/faixas/encontros.jpg" faixaPosition="center 60%">
        Monte NPCs, monstros e chefes a partir do molde do Apêndice G, escolha quais fichas do grupo
        entram, e rode o combate {BATALHAS} vezes antes da sessão. O site diz se você acabou de matar a
        mesa inteira.
      </PageHeader>

      <SecaoGrupo
        order={order}
        characters={characters}
        grupo={grupo}
        patamarSugerido={patamarSugerido}
      />

      <SecaoCriaturas
        criaturas={criaturas}
        selecionadas={selecionadas}
        novoPatamar={novoPatamar}
        novoPapel={novoPapel}
        setNovoPatamar={setNovoPatamar}
        setNovoPapel={setNovoPapel}
        pastaDestino={pastaDestino}
        setPastaDestino={setPastaDestino}
        tamanhoDoGrupo={fichasDoGrupo.length}
        alvosDoGrupo={alvosDoGrupo}
      />

      <section className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={simular}
            disabled={!podeSimular}
            className="flex items-center gap-2 rounded-lg bg-wine-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Dices className="h-4 w-4" />
            {rodando ? "Simulando…" : `Testar o encontro (${BATALHAS} batalhas)`}
          </button>
          <button
            type="button"
            onClick={mandarParaIniciativa}
            disabled={criaturasDoEncontro.length === 0}
            className="flex items-center gap-2 rounded-lg border border-parchment-300 px-3 py-2 text-sm font-medium text-parchment-600 transition-colors hover:bg-parchment-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
          >
            <ListPlus className="h-4 w-4" /> Mandar criaturas pra Iniciativa
          </button>
        </div>

        {!podeSimular && !rodando && (
          <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">
            {fichasDoGrupo.length === 0
              ? "Escolha pelo menos uma ficha do grupo acima."
              : criaturasDoEncontro.length === 0
                ? "Marque pelo menos uma criatura pra entrar no encontro."
                : null}
          </p>
        )}
      </section>

      {relatorio && <Relatorio relatorio={relatorio} tamanhoDoGrupo={fichasDoGrupo.length} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// O grupo
// ---------------------------------------------------------------------------
function SecaoGrupo({
  order,
  characters,
  grupo,
  patamarSugerido,
}: {
  order: string[];
  characters: Record<string, CharacterData>;
  grupo: string[];
  patamarSugerido: number | null;
}) {
  const alternarGrupo = useBestiaryStore((s) => s.alternarGrupo);
  const definirGrupo = useBestiaryStore((s) => s.definirGrupo);

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-bold text-parchment-900 dark:text-parchment-50">
          <Users className="h-5 w-5 text-wine-500" /> O grupo
        </h2>
        {order.length > 0 && (
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => definirGrupo(order)}
              className="rounded-lg border border-parchment-300 px-2 py-1 font-medium text-parchment-600 hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => definirGrupo([])}
              className="rounded-lg border border-parchment-300 px-2 py-1 font-medium text-parchment-600 hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
            >
              Nenhum
            </button>
          </div>
        )}
      </div>

      {order.length === 0 ? (
        <p className="rounded-xl border border-dashed border-parchment-300 p-6 text-center text-sm text-parchment-600 dark:border-parchment-700 dark:text-parchment-400">
          Nenhuma ficha salva ainda. Importe os JSONs dos jogadores em{" "}
          <Link href="/personagens" className="font-semibold text-wine-600 underline dark:text-wine-300">
            Personagens
          </Link>{" "}
          — elas aparecem aqui automaticamente.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {order.map((id) => {
            const c = characters[id];
            if (!c) return null;
            const marcado = grupo.includes(id);
            const rank = rankDaFicha(c);
            const tree = getTreeById(c.startingTreeId);
            return (
              <button
                key={id}
                type="button"
                onClick={() => alternarGrupo(id)}
                aria-pressed={marcado}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  marcado
                    ? "border-wine-400 bg-wine-50/60 dark:border-wine-500 dark:bg-wine-950/30"
                    : "border-parchment-300 bg-parchment-100/60 hover:bg-parchment-100 dark:border-parchment-800 dark:bg-parchment-900/50 dark:hover:bg-parchment-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  {/*
                    A FOTO do personagem quando existe (0.1.12), com o brasão da
                    árvore como alternativa. O Mestre monta o encontro olhando
                    pros jogadores dele — e o card mostrava o mesmo emblema de
                    Magia de Água pros dois magos da mesa, o que é exatamente o
                    contrário do que essa tela precisa.
                  */}
                  {c.portrait ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.portrait}
                      alt={`Retrato de ${c.name || "personagem sem nome"}`}
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-lg border border-parchment-300/80 object-cover dark:border-parchment-700/80"
                    />
                  ) : (
                    tree && <TreeCrest tree={tree} size={36} />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-parchment-900 dark:text-parchment-50">
                      {c.name || "Sem nome"}
                    </p>
                    <p className="text-xs text-parchment-600 dark:text-parchment-400">
                      {tree?.name ?? "Sem árvore inicial"} · {rank ?? "sem patamar"} · {getPaSpent(c)} PA
                    </p>
                  </div>
                </div>
                <p className="mt-1 text-xs font-mono text-parchment-600 dark:text-parchment-400">
                  {getMaxHp(c)} PV · CA {getArmorClass(c)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {patamarSugerido !== null && (
        <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">
          Patamar médio do grupo escolhido: <b>{patamarSugerido}º</b> — o Apêndice G calibra{" "}
          <b>{rotuloPatamar(patamarSugerido)}</b> contra ele.
        </p>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// As criaturas
// ---------------------------------------------------------------------------
/** A gaveta pintada: as classes de cada cor, estáticas porque o Tailwind não lê nome montado em runtime. */
const CAIXA_DA_COR: Record<CorDePasta, string> = {
  pergaminho: "border-parchment-300 bg-parchment-100/40 dark:border-parchment-800 dark:bg-parchment-900/30",
  vinho: "border-wine-300 bg-wine-50/40 dark:border-wine-800 dark:bg-wine-950/20",
  ouro: "border-gold-300 bg-gold-50/40 dark:border-gold-700 dark:bg-gold-950/20",
  esmeralda: "border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20",
  ambar: "border-amber-300 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/20",
  rosa: "border-rose-300 bg-rose-50/40 dark:border-rose-800 dark:bg-rose-950/20",
};

const ICONE_DA_COR: Record<CorDePasta, string> = {
  pergaminho: "text-parchment-500 dark:text-parchment-400",
  vinho: "text-wine-500",
  ouro: "text-gold-600 dark:text-gold-400",
  esmeralda: "text-emerald-600 dark:text-emerald-400",
  ambar: "text-amber-600 dark:text-amber-400",
  rosa: "text-rose-500",
};

const BOLINHA_DA_COR: Record<CorDePasta, string> = {
  pergaminho: "bg-parchment-400",
  vinho: "bg-wine-500",
  ouro: "bg-gold-500",
  esmeralda: "bg-emerald-500",
  ambar: "bg-amber-500",
  rosa: "bg-rose-500",
};

const NOME_DA_COR: Record<CorDePasta, string> = {
  pergaminho: "Pergaminho",
  vinho: "Vinho",
  ouro: "Ouro",
  esmeralda: "Esmeralda",
  ambar: "Âmbar",
  rosa: "Rosa",
};

/**
 * O covil, em gavetas.
 *
 * A tela nasceu como uma lista de cartões sempre abertos, e isso funciona até a
 * terceira criatura. Um Mestre que montou trinta — que é o uso real depois de
 * algumas sessões — recebia uma parede de formulário em que "onde está o Chefe
 * do arco 2?" só se responde rolando a página inteira. As quatro coisas que
 * resolvem isso são as quatro que estão aqui:
 *
 * 1. **Pastas** (`useBestiaryStore.pastas`), que separam por encontro, por arco
 *    ou por região — o critério é do Mestre, e ele pinta e etiqueta a gaveta.
 * 2. **Cartão recolhido por padrão**: fechado ele é uma linha com retrato,
 *    nome e os números que importam; a ficha inteira abre com um toque.
 * 3. **Busca**, que ignora as gavetas — quando você já sabe o nome, navegar por
 *    pasta é o caminho longo.
 * 4. **A chegada em destaque**: o que acaba de entrar (criado, duplicado,
 *    importado de arquivo ou de link) é aberto, tem a gaveta expandida e é
 *    rolado até a vista. Sem isso, importar virou um clique que não parece
 *    fazer nada — a criatura entrava fechada, no fim de uma lista longa, às
 *    vezes dentro de uma pasta recolhida.
 */
function SecaoCriaturas({
  criaturas,
  selecionadas,
  novoPatamar,
  novoPapel,
  setNovoPatamar,
  setNovoPapel,
  pastaDestino,
  setPastaDestino,
  tamanhoDoGrupo,
  alvosDoGrupo,
}: {
  criaturas: CriaturaEncontro[];
  selecionadas: string[];
  novoPatamar: number;
  novoPapel: PapelCriatura;
  setNovoPatamar: (n: number) => void;
  setNovoPapel: (p: PapelCriatura) => void;
  /** Onde a próxima criatura nasce — a pasta escolhida no formulário, ou `null` pra fora de todas. */
  pastaDestino: string | null;
  setPastaDestino: (id: string | null) => void;
  tamanhoDoGrupo: number;
  alvosDoGrupo: AlvoDoGrupo[];
}) {
  const pastas = useBestiaryStore((s) => s.pastas);
  const criar = useBestiaryStore((s) => s.criar);
  const atualizar = useBestiaryStore((s) => s.atualizar);
  const adicionarAcao = useBestiaryStore((s) => s.adicionarAcao);
  const importarCriatura = useBestiaryStore((s) => s.importarCriatura);
  const importarPasta = useBestiaryStore((s) => s.importarPasta);
  const criarPasta = useBestiaryStore((s) => s.criarPasta);
  const atualizarPasta = useBestiaryStore((s) => s.atualizarPasta);
  const definirPastasRecolhidas = useBestiaryStore((s) => s.definirPastasRecolhidas);
  const chegada = useBestiaryStore((s) => s.chegada);
  const limparChegada = useBestiaryStore((s) => s.limparChegada);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  /**
   * Quais cartões estão abertos.
   *
   * Diferente de `pasta.recolhida`, isto NÃO é salvo: a pasta é a arrumação
   * (dura semanas), e o cartão aberto é o que você está editando agora. Salvar
   * os abertos devolveria, na sessão seguinte, exatamente a parede de
   * formulário que este recolhimento existe pra evitar.
   */
  const [abertas, setAbertas] = useState<string[]>([]);
  /** A pasta cujo painel de aparência está aberto — recém-criada, ela já abre com o cursor no nome. */
  const [pastaEditando, setPastaEditando] = useState<string | null>(null);
  /** O que acabou de chegar, piscando por alguns segundos. */
  const [destaque, setDestaque] = useState<string | null>(null);

  function alternarCartao(id: string) {
    setAbertas((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  }

  /**
   * Mostra o que acabou de entrar, venha de onde vier.
   *
   * Os quatro caminhos (criar, duplicar, importar arquivo, importar link)
   * terminam na mesma marca da store, então a tela tem UM lugar que abre o
   * cartão, expande a gaveta, limpa a busca que estaria escondendo o recém-
   * chegado e rola até ele.
   */
  const [chegadaVista, setChegadaVista] = useState<number | null>(null);
  if (chegada && chegada.marca !== chegadaVista) {
    // Ajuste de estado DURANTE a renderização — o padrão que o React documenta
    // pra estado local que deriva de uma mudança externa. O cartão recém-chegado
    // nasce aberto, destacado e sem a busca que o esconderia no mesmo quadro,
    // em vez de aparecer fechado e piscar um frame depois.
    setChegadaVista(chegada.marca);
    setBusca("");
    setDestaque(chegada.id);
    if (chegada.tipo === "criatura") {
      const id = chegada.id;
      setAbertas((a) => (a.includes(id) ? a : [...a, id]));
    }
  }

  // E aqui o que é efeito de verdade: mexer na store (expandir a gaveta que
  // estava recolhida), no DOM (rolar até lá) e no relógio (apagar o destaque).
  useEffect(() => {
    if (!chegada) return;
    const { tipo, id } = chegada;
    if (tipo === "criatura") {
      const criatura = useBestiaryStore.getState().criaturas.find((c) => c.id === id);
      if (criatura?.pastaId) atualizarPasta(criatura.pastaId, { recolhida: false });
    } else {
      atualizarPasta(id, { recolhida: false });
    }
    limparChegada();
    // Um respiro antes de rolar: o elemento com este id só existe depois que o
    // React pintar a gaveta expandida.
    const rolagem = setTimeout(() => {
      document.getElementById(`${tipo}-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    const fim = setTimeout(() => setDestaque(null), 3000);
    return () => {
      clearTimeout(rolagem);
      clearTimeout(fim);
    };
  }, [chegada, limparChegada, atualizarPasta]);

  /**
   * Aceita pasta (`.mtpasta`), criatura (`.mtcriatura`) e o `.json` cru de
   * qualquer um dos dois — a detecção é por CONTEÚDO, como a da ficha de
   * personagem (`lerArquivoDeFicha`). Um botão só: qual dos dois formatos o
   * arquivo é, o próprio arquivo responde.
   */
  async function handleImportarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImportError(null);
    try {
      const lido = await lerArquivoDoBestiario(file);
      if (lido.tipo === "pasta") importarPasta(lido.pasta);
      else importarCriatura(lido.criatura, pastaDestino);
    } catch (err) {
      setImportError(err instanceof CriaturaIlegivel ? err.message : "Não foi possível ler esse arquivo.");
    }
  }

  function handleNovaPasta() {
    const id = criarPasta();
    setPastaEditando(id);
    // A pasta recém-criada vira o destino: quem acabou de criar "Chefes do arco
    // 2" quer que a próxima criatura caia lá dentro, não na raiz.
    setPastaDestino(id);
  }

  const termo = busca.trim().toLowerCase();
  /**
   * A busca varre o que o Mestre lembraria: o nome, a anotação de perigo, o
   * papel, e o texto das Ações — "quem era o que tinha a mordida venenosa?" é
   * uma pergunta tão comum quanto o nome próprio da criatura.
   */
  const filtradas = useMemo(() => {
    if (!termo) return criaturas;
    return criaturas.filter((c) =>
      [
        c.nome,
        c.perigo,
        PAPEIS.find((p) => p.id === c.papel)?.nome ?? "",
        rotuloPatamar(c.patamar),
        ...c.acoes.map((a) => `${a.nome} ${a.dano} ${a.nota}`),
      ]
        .join(" ")
        .toLowerCase()
        .includes(termo)
    );
  }, [criaturas, termo]);

  const grupos = useMemo(() => {
    const conhecidas = new Set(pastas.map((p) => p.id));
    return [
      ...pastas.map((p) => ({ pasta: p, itens: filtradas.filter((c) => c.pastaId === p.id) })),
      // A gaveta de fora vem por último e inclui quem aponta pra uma pasta que
      // não existe mais — `removerPasta` já limpa o campo, mas um bestiário que
      // veio de um backup antigo não passou por ela.
      {
        pasta: null,
        itens: filtradas.filter((c) => !c.pastaId || !conhecidas.has(c.pastaId)),
      },
    ];
  }, [pastas, filtradas]);

  return (
    <section className="mt-8">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-bold text-parchment-900 dark:text-parchment-50">
          <Swords className="h-5 w-5 text-wine-500" /> As criaturas
        </h2>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACEITA_NA_IMPORTACAO_BESTIARIO}
            onChange={handleImportarArquivo}
            className="hidden"
            aria-hidden
            tabIndex={-1}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Aceita .mtcriatura (uma criatura) e .mtpasta (uma pasta inteira)"
            className="flex items-center gap-1 rounded-lg border border-parchment-300 px-3 py-1.5 text-xs font-medium text-parchment-600 transition-colors hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
          >
            <Upload className="h-3.5 w-3.5" /> Importar criatura ou pasta
          </button>
        </div>
      </div>
      {importError && (
        <p className="mb-2 text-xs text-wine-500 dark:text-wine-300">{importError}</p>
      )}

      <div className="mb-3 flex flex-wrap items-end gap-2 rounded-xl border border-parchment-300 bg-parchment-100/60 p-3 dark:border-parchment-800 dark:bg-parchment-900/50">
        <label className="text-xs font-semibold text-parchment-600 dark:text-parchment-400">
          Patamar
          <select
            value={novoPatamar}
            onChange={(e) => setNovoPatamar(Number(e.target.value))}
            className="mt-1 block rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm font-normal text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
          >
            {MOLDES_CRIATURA.map((m) => (
              <option key={m.patamar} value={m.patamar}>
                {m.patamar}º — {m.titulo}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-parchment-600 dark:text-parchment-400">
          Papel
          <select
            value={novoPapel}
            onChange={(e) => setNovoPapel(e.target.value as PapelCriatura)}
            className="mt-1 block rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm font-normal text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
          >
            {PAPEIS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        {pastas.length > 0 && (
          <label className="min-w-0 text-xs font-semibold text-parchment-600 dark:text-parchment-400">
            Nasce em
            <select
              value={pastas.some((p) => p.id === pastaDestino) ? (pastaDestino as string) : ""}
              onChange={(e) => setPastaDestino(e.target.value || null)}
              className="mt-1 block max-w-44 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm font-normal text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
            >
              <option value="">Fora das pastas</option>
              {pastas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.emoji ? `${p.emoji} ` : ""}
                  {p.nome || "Pasta sem nome"}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          type="button"
          onClick={() => criar(novoPatamar, novoPapel, undefined, pastaDestino)}
          className="rounded-lg bg-parchment-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-parchment-700 dark:bg-white dark:text-parchment-900"
        >
          Nova criatura
        </button>
        <p className="w-full text-xs text-parchment-600 dark:text-parchment-400">
          {PAPEIS.find((p) => p.id === novoPapel)?.descricao}
          {novoPapel === "chefe" && tamanhoDoGrupo > 0 && (
            <>
              {" "}
              Com {tamanhoDoGrupo} personagem{tamanhoDoGrupo > 1 ? "s" : ""} no grupo, este chefe joga{" "}
              <b>{rodadasDoChefe(tamanhoDoGrupo)}</b> rodada
              {rodadasDoChefe(tamanhoDoGrupo) > 1 ? "s" : ""} por rodada da mesa.
            </>
          )}
        </p>
      </div>

      <details className="mb-3 rounded-xl border border-parchment-300 bg-parchment-100/60 p-3 dark:border-parchment-800 dark:bg-parchment-900/50">
        <summary className="cursor-pointer text-sm font-semibold text-parchment-900 dark:text-parchment-50">
          Criaturas prontas do Apêndice G
        </summary>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CRIATURAS_PRONTAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                const id = criar(p.patamar, p.papel, p.nome, pastaDestino);
                atualizar(id, { perigo: p.perigo });
                // As ações vêm do Apêndice G sem id — quem sorteia é a store.
                for (const acao of p.acoes) adicionarAcao(id, acao);
              }}
              className="lift flex gap-2.5 rounded-lg border border-parchment-300 p-2 text-left text-xs hover:border-wine-400 hover:bg-parchment-100 dark:border-parchment-700 dark:hover:border-wine-600 dark:hover:bg-parchment-900"
            >
              {/* O retrato passa pelo mesmo medalhão de brasão e raça (`Crest`):
                  seis criaturas que chegaram em enquadramentos e fundos
                  diferentes saem daqui com o mesmo recorte. */}
              {p.icon && <Crest src={p.icon} size={56} rounded="rounded-lg" className="mt-0.5" />}
              <span className="min-w-0 flex-1">
              <span className="font-semibold text-parchment-900 dark:text-parchment-50">{p.nome}</span>{" "}
              <span className="text-parchment-600 dark:text-parchment-400">— {rotuloPatamar(p.patamar)}</span>
              <p className="mt-0.5 text-parchment-600 dark:text-parchment-400">{p.perigo}</p>
              <p className="mt-1 font-mono text-2xs text-parchment-600 dark:text-parchment-400">
                {p.acoes.map((a) => `${a.nome}${a.dano ? ` ${a.dano}` : ""}`).join(" · ")}
              </p>
              </span>
            </button>
          ))}
        </div>
      </details>

      {/*
        A barra de organização aparece SEMPRE, e não só depois da primeira
        criatura. Criar as gavetas antes de ter o que pôr nelas — "a emboscada
        da estrada", "os chefes do arco 2" — é justamente como se planeja uma
        sessão; a versão anterior escondia o botão "Nova pasta" dentro do galho
        que só existia com o covil cheio, e a organização começava impossível.
      */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {criaturas.length > 0 && (
          <div className="relative min-w-40 flex-1">
            <Search
              className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-parchment-400"
              aria-hidden
            />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar criatura pelo nome, papel, perigo ou ação"
              placeholder="Buscar no covil…"
              className="w-full rounded-lg border border-parchment-300 bg-parchment-50 py-1.5 pl-7 pr-7 text-sm text-parchment-900 placeholder:text-parchment-500 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                aria-label="Limpar a busca"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-parchment-400 hover:text-parchment-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={handleNovaPasta}
          className="flex items-center gap-1 rounded-lg border border-parchment-300 px-2.5 py-1.5 text-xs font-medium text-parchment-600 transition-colors hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
        >
          <FolderPlus className="h-3.5 w-3.5" /> Nova pasta
        </button>
        {pastas.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setAbertas([]);
              definirPastasRecolhidas(true);
            }}
            className="flex items-center gap-1 rounded-lg border border-parchment-300 px-2.5 py-1.5 text-xs font-medium text-parchment-600 transition-colors hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
          >
            <ChevronUp className="h-3.5 w-3.5" /> Recolher tudo
          </button>
        )}
      </div>

      {termo && (
        <p className="mb-2 text-xs text-parchment-600 dark:text-parchment-400">
          {filtradas.length === 0
            ? `Nenhuma criatura com “${busca.trim()}”.`
            : `${filtradas.length} de ${criaturas.length} criaturas — a busca atravessa as pastas.`}
        </p>
      )}

      {criaturas.length === 0 && pastas.length === 0 ? (
        <EmptyState
          icon={Skull}
          hint="Escolha um patamar acima e clique em “Nova criatura” — os números do Apêndice G já vêm preenchidos. Ou puxe uma das seis prontas, com retrato e tudo. As pastas você pode criar antes, e montar cada encontro dentro da sua."
        >
          O covil está vazio.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {grupos.map(({ pasta, itens }) => {
            // A gaveta de fora some quando está vazia; uma pasta vazia NÃO
            // some, porque ela é onde o Mestre vai montar o próximo encontro.
            if (pasta === null && itens.length === 0) return null;
            return (
              <GrupoDePasta
                key={pasta?.id ?? "sem-pasta"}
                pasta={pasta}
                itens={itens}
                pastas={pastas}
                selecionadas={selecionadas}
                abertas={abertas}
                onAlternarCartao={alternarCartao}
                alvosDoGrupo={alvosDoGrupo}
                // Com busca ativa toda gaveta abre: procurar por nome e
                // receber "nada aqui" porque a pasta certa estava fechada
                // seria a busca mentindo.
                forcarAberta={termo.length > 0}
                semCabecalho={pasta === null && pastas.length === 0}
                editando={pastaEditando !== null && pastaEditando === pasta?.id}
                onEditar={setPastaEditando}
                destaque={destaque}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

/**
 * Uma gaveta na tela — ou a lista solta, quando `pasta` é `null`.
 *
 * O mesmo componente desenha as duas porque tudo que vale pra pasta vale pra
 * quem está fora dela: contar quantas entraram no encontro, marcar o lote
 * inteiro de uma vez, recolher. A diferença é o que a gaveta de fora não tem —
 * nome, cor, emoji, ordem, lixeira e arquivo próprio.
 */
function GrupoDePasta({
  pasta,
  itens,
  pastas,
  selecionadas,
  abertas,
  onAlternarCartao,
  alvosDoGrupo,
  forcarAberta,
  semCabecalho,
  editando,
  onEditar,
  destaque,
}: {
  pasta: PastaCriaturas | null;
  itens: CriaturaEncontro[];
  pastas: PastaCriaturas[];
  selecionadas: string[];
  abertas: string[];
  onAlternarCartao: (id: string) => void;
  alvosDoGrupo: AlvoDoGrupo[];
  forcarAberta: boolean;
  semCabecalho: boolean;
  editando: boolean;
  onEditar: (id: string | null) => void;
  destaque: string | null;
}) {
  const atualizarPasta = useBestiaryStore((s) => s.atualizarPasta);
  const removerPasta = useBestiaryStore((s) => s.removerPasta);
  const moverPasta = useBestiaryStore((s) => s.moverPasta);
  const definirSelecaoDeVarias = useBestiaryStore((s) => s.definirSelecaoDeVarias);
  const [confirmando, setConfirmando] = useState(false);
  const [arquivoState, setArquivoState] = useState<"idle" | "loading" | "erro">("idle");
  /** Estado próprio da gaveta de fora, que não tem `recolhida` salvo em lugar nenhum. */
  const [foraRecolhida, setForaRecolhida] = useState(false);

  const recolhida = forcarAberta ? false : pasta ? pasta.recolhida : foraRecolhida;
  const noEncontro = itens.filter((c) => selecionadas.includes(c.id)).length;
  const indice = pasta ? pastas.findIndex((p) => p.id === pasta.id) : -1;
  const cor: CorDePasta = pasta?.cor ?? "pergaminho";

  /**
   * Baixa a gaveta inteira num `.mtpasta`.
   *
   * As criaturas vêm da store, e não de `itens`: `itens` está filtrado pela
   * busca, e exportar "a pasta" enquanto se procura por "goblin" tem que levar
   * a pasta, não os três resultados na tela.
   */
  async function handleBaixarPasta() {
    if (!pasta) return;
    setArquivoState("loading");
    try {
      const dentro = useBestiaryStore.getState().criaturas.filter((c) => c.pastaId === pasta.id);
      const { blob, nomeDoArquivo } = await empacotarPasta(pasta, dentro);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeDoArquivo;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setArquivoState("idle");
    } catch {
      setArquivoState("erro");
    }
  }

  const lista =
    itens.length === 0 ? (
      <p className="rounded-xl border border-dashed border-parchment-300 px-3 py-3 text-center text-xs text-parchment-600 dark:border-parchment-800 dark:text-parchment-400">
        Pasta vazia. Escolha-a em “Nasce em”, ou mande uma criatura pra cá pelo seletor de pasta do
        cartão dela.
      </p>
    ) : (
      <div className="flex flex-col gap-2">
        {itens.map((c) => (
          <CartaoCriatura
            key={c.id}
            criatura={c}
            marcada={selecionadas.includes(c.id)}
            aberta={abertas.includes(c.id)}
            onAlternar={() => onAlternarCartao(c.id)}
            pastas={pastas}
            alvosDoGrupo={alvosDoGrupo}
            destacada={destaque === c.id}
          />
        ))}
      </div>
    );

  if (semCabecalho) return lista;

  return (
    <div
      id={pasta ? `pasta-${pasta.id}` : undefined}
      className={
        pasta
          ? `rounded-2xl border p-2 transition-shadow ${CAIXA_DA_COR[cor]} ${
              destaque === pasta.id ? "ring-2 ring-gold-400 dark:ring-gold-500" : ""
            }`
          : ""
      }
    >
      {editando && pasta && (
        <div className="mb-2 rounded-xl border border-parchment-300 bg-parchment-50 p-2 dark:border-parchment-700 dark:bg-parchment-950">
          <div className="flex flex-wrap items-center gap-2">
            {/*
              O emoji é um campo de texto de propósito: um seletor de emoji
              próprio seria uma lista fechada de figuras que alguém escolheu, e
              o teclado do celular já tem o seletor inteiro do sistema.
            */}
            <input
              value={pasta.emoji ?? ""}
              onChange={(e) => atualizarPasta(pasta.id, { emoji: e.target.value.slice(0, 4) || undefined })}
              aria-label="Emoji da pasta"
              placeholder="🐉"
              className="w-14 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-center text-base dark:border-parchment-700 dark:bg-parchment-950"
            />
            <input
              autoFocus
              value={pasta.nome}
              onChange={(e) => atualizarPasta(pasta.id, { nome: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") onEditar(null);
              }}
              aria-label="Nome da pasta"
              placeholder="Emboscada da estrada"
              className="min-w-40 flex-1 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm font-bold text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
            />
            <button
              type="button"
              onClick={() => onEditar(null)}
              aria-label="Pronto"
              className="rounded-lg border border-parchment-300 p-1.5 text-emerald-600 hover:bg-parchment-100 dark:border-parchment-700 dark:text-emerald-400 dark:hover:bg-parchment-900"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {CORES_DE_PASTA.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => atualizarPasta(pasta.id, { cor: c })}
                aria-label={`Cor ${NOME_DA_COR[c]}`}
                aria-pressed={cor === c}
                className={`h-6 w-6 rounded-full ${BOLINHA_DA_COR[c]} ${
                  cor === c
                    ? "ring-2 ring-parchment-900 ring-offset-2 ring-offset-parchment-50 dark:ring-white dark:ring-offset-parchment-950"
                    : ""
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1">
        {/*
          `min-w-48` é o que quebra a linha no celular: com o nome exigindo
          12rem, os botões de gestão não cabem ao lado em 360px e caem pra linha
          de baixo, em vez de espremerem "Emboscada da estrada" até sobrar
          reticências. Em tela larga tudo volta pra mesma linha.
        */}
        <button
          type="button"
          onClick={() => (pasta ? atualizarPasta(pasta.id, { recolhida: !pasta.recolhida }) : setForaRecolhida((v) => !v))}
          aria-expanded={!recolhida}
          className="flex min-w-48 flex-1 items-center gap-1.5 rounded-lg px-1 py-1.5 text-left hover:bg-parchment-100 dark:hover:bg-parchment-900"
        >
          {recolhida ? (
            <ChevronRight className="h-4 w-4 shrink-0 text-parchment-400" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-parchment-400" aria-hidden />
          )}
          {pasta ? (
            pasta.emoji ? (
              <span className="w-4 shrink-0 text-center text-sm leading-none" aria-hidden>
                {pasta.emoji}
              </span>
            ) : recolhida ? (
              <Folder className={`h-4 w-4 shrink-0 ${ICONE_DA_COR[cor]}`} aria-hidden />
            ) : (
              <FolderOpen className={`h-4 w-4 shrink-0 ${ICONE_DA_COR[cor]}`} aria-hidden />
            )
          ) : (
            <Skull className="h-4 w-4 shrink-0 text-parchment-400" aria-hidden />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-parchment-900 dark:text-parchment-50">
              {pasta ? pasta.nome || "Pasta sem nome" : "Fora das pastas"}
            </span>
            {/* A contagem vai EMBAIXO do nome, e não ao lado: ao lado ela é um
                bloco de largura fixa que empurra o nome pra fora — a pasta
                aparecia como "Chefes d…" enquanto "3 · 1 no encontro" ficava
                inteiro. O nome é o que identifica a gaveta. */}
            <span className="block truncate font-mono text-2xs text-parchment-600 dark:text-parchment-400">
              {itens.length} criatura{itens.length === 1 ? "" : "s"}
              {noEncontro > 0 && (
                <span className="text-wine-600 dark:text-wine-300"> · {noEncontro} no encontro</span>
              )}
            </span>
          </span>
        </button>

        {/*
          Os botões de gestão andam JUNTOS num bloco que não encolhe: soltos no
          `flex-wrap`, eles quebravam três numa linha e dois na outra assim que
          a tela apertava. Como bloco, ou cabem todos ao lado do nome, ou descem
          todos pra linha de baixo — que é o que acontece no celular.
        */}
        <div className="ml-auto flex shrink-0 items-center gap-1">
        {itens.length > 0 && (
          <button
            type="button"
            onClick={() =>
              definirSelecaoDeVarias(
                itens.map((c) => c.id),
                noEncontro < itens.length
              )
            }
            aria-label={
              noEncontro < itens.length
                ? `Pôr as ${itens.length} criaturas no encontro`
                : "Tirar todas do encontro"
            }
            title={noEncontro < itens.length ? "Marcar todas pro encontro" : "Desmarcar todas"}
            className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 hover:text-wine-600 dark:border-parchment-700 dark:hover:text-wine-300"
          >
            {noEncontro === itens.length ? (
              <Square className="h-4 w-4" />
            ) : (
              <SquareCheckBig className="h-4 w-4" />
            )}
          </button>
        )}

        {pasta && (
          <>
            <button
              type="button"
              onClick={() => onEditar(editando ? null : pasta.id)}
              aria-label={`Nome, emoji e cor da pasta ${pasta.nome}`}
              title="Nome, emoji e cor"
              className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 hover:text-parchment-600 dark:border-parchment-700"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleBaixarPasta}
              disabled={arquivoState === "loading"}
              aria-label={`Baixar a pasta ${pasta.nome} com as criaturas dentro`}
              title="Baixar num arquivo .mtpasta — a gaveta inteira, com as criaturas dentro"
              className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 hover:text-parchment-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-parchment-700"
            >
              {arquivoState === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => moverPasta(pasta.id, -1)}
              disabled={indice <= 0}
              aria-label={`Subir a pasta ${pasta.nome}`}
              className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 hover:text-parchment-600 disabled:opacity-30 dark:border-parchment-700"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => moverPasta(pasta.id, 1)}
              disabled={indice < 0 || indice >= pastas.length - 1}
              aria-label={`Descer a pasta ${pasta.nome}`}
              className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 hover:text-parchment-600 disabled:opacity-30 dark:border-parchment-700"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            {confirmando ? (
              <button
                type="button"
                onClick={() => {
                  removerPasta(pasta.id);
                  setConfirmando(false);
                }}
                className="rounded-lg bg-rose-600 px-2 py-1.5 text-2xs font-semibold text-white hover:bg-rose-500"
              >
                Só a pasta?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmando(true)}
                aria-label={`Apagar a pasta ${pasta.nome}`}
                title="Apaga só a pasta — as criaturas voltam pra “Fora das pastas”"
                className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 hover:border-rose-300 hover:text-rose-500 dark:border-parchment-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </>
        )}
        </div>
      </div>

      {arquivoState === "erro" && (
        <p className="mt-1 text-2xs text-wine-500 dark:text-wine-300">
          Não deu pra montar o arquivo da pasta. Tente de novo.
        </p>
      )}

      {!recolhida && <div className="mt-2">{lista}</div>}
    </div>
  );
}

function CartaoCriatura({
  criatura,
  marcada,
  aberta,
  onAlternar,
  pastas,
  alvosDoGrupo,
  destacada,
}: {
  criatura: CriaturaEncontro;
  marcada: boolean;
  /** Fechado, o cartão é uma linha; aberto, é a ficha inteira que ele sempre foi. */
  aberta: boolean;
  onAlternar: () => void;
  pastas: PastaCriaturas[];
  alvosDoGrupo: AlvoDoGrupo[];
  /** Acabou de chegar (criada, duplicada ou importada) — pisca por alguns segundos. */
  destacada: boolean;
}) {
  const atualizar = useBestiaryStore((s) => s.atualizar);
  const remover = useBestiaryStore((s) => s.remover);
  const duplicar = useBestiaryStore((s) => s.duplicar);
  const recalibrar = useBestiaryStore((s) => s.recalibrar);
  const alternarSelecao = useBestiaryStore((s) => s.alternarSelecao);
  const moverCriatura = useBestiaryStore((s) => s.moverCriatura);
  const reordenarCriatura = useBestiaryStore((s) => s.reordenarCriatura);
  const [confirmando, setConfirmando] = useState(false);
  const [arquivoState, setArquivoState] = useState<"idle" | "loading" | "erro">("idle");
  const [linkState, setLinkState] = useState<"idle" | "copiado" | "erro">("idle");

  /**
   * Baixa a criatura inteira num arquivo `.mtcriatura` — mesma ideia do
   * "Baixar ficha" do personagem (`fichaArquivo.ts`), sem imagem pra reduzir:
   * uma criatura não tem foto, só números e Ações.
   */
  async function handleBaixarArquivo() {
    setArquivoState("loading");
    try {
      const { blob, nomeDoArquivo } = await empacotarCriatura(criatura);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeDoArquivo;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setArquivoState("idle");
    } catch {
      setArquivoState("erro");
    }
  }

  /** Mesma ideia do "Copiar link" da ficha (`fichaLink.ts`) — pra passar a criatura sem sair do navegador. */
  async function handleCopiarLink() {
    try {
      await navigator.clipboard.writeText(await linkDaCriatura(criatura));
      setLinkState("copiado");
      setTimeout(() => setLinkState("idle"), 2200);
    } catch {
      setLinkState("erro");
    }
  }

  const molde = getMoldePorPatamar(criatura.patamar);
  const doMolde = aplicarPapel(criatura.patamar, criatura.papel);
  // Recalculado a cada tecla: é isso que faz o conselho aparecer ENQUANTO o
  // Mestre digita o dano, em vez de depois de trezentas batalhas. Só no cartão
  // ABERTO — num covil de trinta criaturas, aconselhar as vinte e nove que
  // ninguém está olhando é trabalho jogado fora a cada tecla digitada na trigésima.
  const avisos = useMemo(
    () => (aberta ? avisarSobreCriatura(criatura, alvosDoGrupo) : []),
    [aberta, criatura, alvosDoGrupo]
  );
  const porAcoes = usaAcoes(criatura);
  const danoDasAcoes = porAcoes ? danoDasAcoesPorRodada(criatura) : 0;
  // "Fora do molde" não é um erro — é informação. O Mestre tem todo o direito
  // de dar 300 PV a um monstro de 2º patamar; ele só precisa saber que fez isso.
  const foraDoMolde =
    criatura.pv !== doMolde.pv ||
    criatura.danoPorTurno !== doMolde.danoPorTurno ||
    criatura.ca !== molde.ca ||
    criatura.bonusAtaque !== molde.bonusAtaque;

  /**
   * A linha que o cartão fechado mostra.
   *
   * São os números com que se decide "é esta que eu quero?" sem abrir nada:
   * quantas vêm, de que patamar, quanto aguentam e quanto batem. O resto do
   * formulário é edição, e edição só interessa depois de escolher.
   */
  const resumo = [
    criatura.quantidade > 1 ? `×${criatura.quantidade}` : null,
    rotuloPatamar(criatura.patamar),
    PAPEIS.find((p) => p.id === criatura.papel)?.nome,
    `${criatura.pv} PV`,
    `CA ${criatura.ca}`,
    `${Math.round(porAcoes ? danoDasAcoes : criatura.danoPorTurno)} dano/turno`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      id={`criatura-${criatura.id}`}
      className={`rounded-2xl border p-3 transition-colors ${
        marcada
          ? "border-wine-400 bg-wine-50/40 dark:border-wine-500 dark:bg-wine-950/20"
          : "border-parchment-300 bg-parchment-100/60 dark:border-parchment-800 dark:bg-parchment-900/50"
      } ${destacada ? "ring-2 ring-gold-400 dark:ring-gold-500" : ""}`}
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={marcada}
          onChange={() => alternarSelecao(criatura.id)}
          aria-label={`Incluir ${criatura.nome} no encontro`}
          className="h-5 w-5 shrink-0 accent-wine-600"
        />
        {/*
          O cartão inteiro é o botão de abrir. Com trinta criaturas na tela, o
          alvo de toque precisa ser a linha toda — um chevron de 16px no canto
          direito é o botão que ninguém acerta no celular.
        */}
        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={aberta}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-0.5 text-left"
        >
          {/*
            O retrato da criatura (0.1.13), mesma infra da foto de personagem —
            reduzida no navegador, nunca sai dele. Sem foto própria cai no ícone
            de caveira: o cartão de uma criatura recém-criada não tem raça nem
            árvore pra emprestar um fallback, diferente do card de personagem.
          */}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-parchment-300/80 bg-parchment-50 dark:border-parchment-700/80 dark:bg-parchment-950">
            {criatura.portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={criatura.portrait}
                alt={`Retrato de ${criatura.nome || "criatura sem nome"}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <Skull className="h-4 w-4 text-parchment-400 dark:text-parchment-600" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold text-parchment-900 dark:text-parchment-50">
              {criatura.nome || "Criatura sem nome"}
            </span>
            <span className="block truncate font-mono text-2xs text-parchment-600 dark:text-parchment-400">
              {resumo}
            </span>
          </span>
          {aberta ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-parchment-400" aria-hidden />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-parchment-400" aria-hidden />
          )}
        </button>
      </div>

      {aberta && (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={criatura.nome}
              onChange={(e) => atualizar(criatura.id, { nome: e.target.value })}
              aria-label="Nome da criatura"
              className="min-w-40 flex-1 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 font-bold text-parchment-900 focus:border-parchment-400 focus:outline-none dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
            />
            <select
              value={criatura.patamar}
              onChange={(e) => atualizar(criatura.id, { patamar: Number(e.target.value) })}
              aria-label="Patamar"
              className="rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-xs text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
            >
              {MOLDES_CRIATURA.map((m) => (
                <option key={m.patamar} value={m.patamar}>
                  {m.patamar}º — {m.titulo}
                </option>
              ))}
            </select>
            <select
              value={criatura.papel}
              onChange={(e) => atualizar(criatura.id, { papel: e.target.value as PapelCriatura })}
              aria-label="Papel"
              className="rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-xs text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
            >
              {PAPEIS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            {/*
              Mover de pasta é um `<select>`, e não arrastar-e-soltar, porque
              esta tela é mobile-first: arrastar um cartão de 300px de altura
              com o dedo, numa lista que rola, é a interação que mais falha em
              celular — e é a única que não tem alternativa por teclado.
            */}
            {pastas.length > 0 && (
              <select
                value={criatura.pastaId ?? ""}
                onChange={(e) => moverCriatura(criatura.id, e.target.value || null)}
                aria-label={`Pasta de ${criatura.nome}`}
                title="Mover pra outra pasta"
                className="max-w-40 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-xs text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
              >
                <option value="">Fora das pastas</option>
                {pastas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome || "Pasta sem nome"}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => reordenarCriatura(criatura.id, -1)}
              aria-label={`Subir ${criatura.nome} na pasta`}
              className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 hover:text-parchment-600 dark:border-parchment-700"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => reordenarCriatura(criatura.id, 1)}
              aria-label={`Descer ${criatura.nome} na pasta`}
              className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 hover:text-parchment-600 dark:border-parchment-700"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => duplicar(criatura.id)}
              aria-label={`Duplicar ${criatura.nome}`}
              className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 hover:text-parchment-600 dark:border-parchment-700"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleBaixarArquivo}
              disabled={arquivoState === "loading"}
              aria-label={`Baixar ${criatura.nome} num arquivo`}
              title="Baixar num arquivo .mtcriatura — leva pra outra campanha ou pro Mestre seguinte"
              className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 hover:text-parchment-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-parchment-700"
            >
              {arquivoState === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={handleCopiarLink}
              aria-label={`Copiar link de ${criatura.nome}`}
              title="Copiar um link com esta criatura dentro"
              className={`rounded-lg border p-1.5 ${
                linkState === "copiado"
                  ? "border-emerald-400 text-emerald-600 dark:border-emerald-600 dark:text-emerald-300"
                  : "border-parchment-300 text-parchment-400 hover:text-parchment-600 dark:border-parchment-700"
              }`}
            >
              {linkState === "copiado" ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            </button>
            {confirmando ? (
              <button
                type="button"
                onClick={() => remover(criatura.id)}
                className="rounded-lg bg-rose-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
              >
                Confirmar?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmando(true)}
                aria-label={`Apagar ${criatura.nome}`}
                className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 hover:border-rose-300 hover:text-rose-500 dark:border-parchment-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          {arquivoState === "erro" && (
            <p className="mt-1 text-2xs text-wine-500 dark:text-wine-300">Não deu pra montar o arquivo. Tente de novo.</p>
          )}
          {linkState === "erro" && (
            <p className="mt-1 text-2xs text-wine-500 dark:text-wine-300">
              O navegador não deixou copiar. Isso costuma acontecer fora de HTTPS — baixe o arquivo por enquanto.
            </p>
          )}

          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-6">
            <CampoNumero
              rotulo="Quantidade"
              valor={criatura.quantidade}
              min={1}
              onChange={(v) => atualizar(criatura.id, { quantidade: v })}
            />
            <CampoNumero
              rotulo="PV"
              valor={criatura.pv}
              min={1}
              onChange={(v) => atualizar(criatura.id, { pv: v })}
            />
            <CampoNumero
              rotulo="CA"
              valor={criatura.ca}
              min={1}
              onChange={(v) => atualizar(criatura.id, { ca: v })}
            />
            <CampoNumero
              rotulo="Ataque"
              valor={criatura.bonusAtaque}
              min={0}
              onChange={(v) => atualizar(criatura.id, { bonusAtaque: v })}
            />
            <CampoNumero
              rotulo="Dano/turno"
              valor={criatura.danoPorTurno}
              min={0}
              onChange={(v) => atualizar(criatura.id, { danoPorTurno: v })}
              desativado={porAcoes}
              dica={
                porAcoes
                  ? "Ignorado: esta criatura tem ações declaradas, e a simulação rola cada uma delas."
                  : undefined
              }
            />
            <CampoNumero
              rotulo="CD"
              valor={criatura.cdResistencia}
              min={0}
              onChange={(v) => atualizar(criatura.id, { cdResistencia: v })}
            />
          </div>

          <EditorDeAcoes criatura={criatura} porAcoes={porAcoes} danoDasAcoes={danoDasAcoes} />

          <PainelDeAvisos criatura={criatura} avisos={avisos} temGrupo={alvosDoGrupo.length > 0} />

          <input
            value={criatura.perigo}
            onChange={(e) => atualizar(criatura.id, { perigo: e.target.value })}
            placeholder="O que a torna perigosa — veneno, voo, emboscada. (Anotação sua: a simulação não modela isso.)"
            aria-label="O que torna a criatura perigosa"
            className="mt-2 w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-xs text-parchment-900 placeholder:text-parchment-500 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
          />

          {/*
            O upload em si. `tipo="portrait"` reaproveita o mesmo teto de bytes e o
            mesmo orçamento de `localStorage` da foto de personagem — as duas
            competem pela mesma cota de 4 MB, e é por isso que este botão não
            inventa um `TipoDeImagem` próprio maior.
          */}
          <ImagemDaFicha
            tipo="portrait"
            valorAtual={criatura.portrait}
            rotulo="Adicionar retrato"
            onChange={(dataUrl) => atualizar(criatura.id, { portrait: dataUrl ?? undefined })}
            className="mt-2"
          />

          <p className="mt-1.5 text-xs text-parchment-600 dark:text-parchment-400">
            Resistência da criatura: <b>+{bonusResistencia(molde)}</b> (metade do Bônus de Ataque do molde).
            {foraDoMolde && (
              <>
                {" · "}
                <span className="text-amber-700 dark:text-amber-300">
                  Fora do molde do Apêndice G (o padrão seria {doMolde.pv} PV, CA {molde.ca}, +
                  {molde.bonusAtaque}, {doMolde.danoPorTurno} de dano/turno).
                </span>{" "}
                <button
                  type="button"
                  onClick={() => recalibrar(criatura.id)}
                  className="inline-flex items-center gap-1 font-semibold text-wine-600 underline dark:text-wine-300"
                >
                  <RotateCcw className="h-3 w-3" /> Recalibrar
                </button>
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}

function CampoNumero({
  rotulo,
  valor,
  min,
  onChange,
  desativado = false,
  dica,
}: {
  rotulo: string;
  valor: number;
  min: number;
  onChange: (v: number) => void;
  /** Cinza e sem foco — o número continua visível porque ele volta a valer se as ações saírem. */
  desativado?: boolean;
  dica?: string;
}) {
  return (
    <label
      title={dica}
      className={`text-2xs font-semibold ${desativado ? "text-parchment-400 dark:text-parchment-600" : "text-parchment-600 dark:text-parchment-400"}`}
    >
      {rotulo}
      <input
        type="number"
        min={min}
        value={valor}
        disabled={desativado}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))}
        className="mt-0.5 block w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 text-sm font-normal text-parchment-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
      />
    </label>
  );
}

// ---------------------------------------------------------------------------
// As "coisinhas": o que a criatura FAZ
// ---------------------------------------------------------------------------
/**
 * O editor de ações.
 *
 * Uma criatura sem nada aqui continua válida — ela cai no orçamento fixo do
 * Apêndice G, que é o modelo que calibrou a tabela e os números do playtest. O
 * que o editor muda é o que o Mestre leva pra mesa: sete números soltos não se
 * lê em voz alta, "Maça de Duas Mãos, 1 Ação, 4d8, corpo a corpo" se lê.
 */
function EditorDeAcoes({
  criatura,
  porAcoes,
  danoDasAcoes,
}: {
  criatura: CriaturaEncontro;
  porAcoes: boolean;
  danoDasAcoes: number;
}) {
  const adicionarAcao = useBestiaryStore((s) => s.adicionarAcao);
  const atualizarAcao = useBestiaryStore((s) => s.atualizarAcao);
  const removerAcao = useBestiaryStore((s) => s.removerAcao);
  const doMolde = aplicarPapel(criatura.patamar, criatura.papel);
  const plano = planoDoTurno(criatura);

  return (
    <div className="mt-3 rounded-xl border border-parchment-300 bg-parchment-50/60 p-2.5 dark:border-parchment-800 dark:bg-parchment-950/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
          <Wand2 className="h-3.5 w-3.5 text-wine-500" /> Ações
        </h4>
        <button
          type="button"
          onClick={() => adicionarAcao(criatura.id)}
          className="flex items-center gap-1 rounded-lg border border-parchment-300 px-2 py-1 text-xs font-semibold text-parchment-600 hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
        >
          <Plus className="h-3.5 w-3.5" /> Nova ação
        </button>
      </div>

      {criatura.acoes.length === 0 ? (
        <p className="mt-1.5 text-xs text-parchment-600 dark:text-parchment-400">
          Nenhuma ainda. Sem ações, a simulação gasta o Dano/turno ({criatura.danoPorTurno}) como orçamento
          fixo — funciona, mas você não tem o que narrar.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2">
          {criatura.acoes.map((acao) => (
            <LinhaDeAcao
              key={acao.id}
              acao={acao}
              onChange={(patch) => atualizarAcao(criatura.id, acao.id, patch)}
              onRemove={() => removerAcao(criatura.id, acao.id)}
            />
          ))}
        </div>
      )}

      {porAcoes && (
        <p className="mt-2 border-t border-parchment-300 pt-1.5 text-xs text-parchment-600 dark:border-parchment-800 dark:text-parchment-400">
          Turno de 3 Ações:{" "}
          <b className="font-mono">{plano.map((a) => a.nome).join(" + ") || "—"}</b> ={" "}
          <b className="font-mono">~{Math.round(danoDasAcoes)}</b> de dano por rodada, antes da rolagem de
          acerto. O molde deste patamar pede ~{doMolde.danoPorTurno}.
        </p>
      )}
    </div>
  );
}

function LinhaDeAcao({
  acao,
  onChange,
  onRemove,
}: {
  acao: AcaoCriatura;
  onChange: (patch: Partial<Omit<AcaoCriatura, "id">>) => void;
  onRemove: () => void;
}) {
  const media = mediaFormula(acao.dano);
  return (
    <div className="rounded-lg border border-parchment-300 bg-parchment-100/70 p-2 dark:border-parchment-800 dark:bg-parchment-900/50">
      <div className="flex flex-wrap items-center gap-1.5">
        <input
          value={acao.nome}
          onChange={(e) => onChange({ nome: e.target.value })}
          aria-label="Nome da ação"
          placeholder="Mordida"
          className="min-w-32 flex-1 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 text-sm font-semibold text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
        />
        <select
          value={acao.acoes}
          onChange={(e) => onChange({ acoes: Number(e.target.value) })}
          aria-label="Custo em Ações"
          className="rounded-lg border border-parchment-300 bg-parchment-50 px-1.5 py-1 text-xs text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
        >
          {[1, 2, 3].map((n) => (
            <option key={n} value={n}>
              {n} Ação{n > 1 ? "es" : ""}
            </option>
          ))}
        </select>
        <select
          value={acao.tipo}
          onChange={(e) => onChange({ tipo: e.target.value as AcaoCriatura["tipo"] })}
          aria-label="Como resolve"
          className="rounded-lg border border-parchment-300 bg-parchment-50 px-1.5 py-1 text-xs text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
        >
          <option value="ataque">Ataque (contra a CA)</option>
          <option value="resistencia">Resistência (metade se passar)</option>
        </select>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Apagar ${acao.nome}`}
          className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 hover:border-rose-300 hover:text-rose-500 dark:border-parchment-700"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <label className="flex items-center gap-1 text-2xs font-semibold text-parchment-600 dark:text-parchment-400">
          Dano
          <input
            value={acao.dano}
            onChange={(e) => onChange({ dano: e.target.value })}
            placeholder="4d8+5"
            aria-label="Fórmula de dano"
            className="w-24 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 font-mono text-sm font-normal text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
          />
        </label>
        {media > 0 && (
          <span className="font-mono text-2xs text-parchment-600 dark:text-parchment-400">
            média {media % 1 === 0 ? media : media.toFixed(1)}
          </span>
        )}
        <input
          value={acao.alcance}
          onChange={(e) => onChange({ alcance: e.target.value })}
          placeholder="Alcance"
          aria-label="Alcance"
          className="min-w-28 flex-1 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 text-xs text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
        />
        <label className="flex items-center gap-1 text-2xs font-semibold text-parchment-600 dark:text-parchment-400">
          <input
            type="checkbox"
            checked={acao.area}
            onChange={(e) => onChange({ area: e.target.checked })}
            className="h-3.5 w-3.5 accent-wine-600"
          />
          Em área
        </label>
      </div>

      {/*
        As quatro condições que a simulação SABE aplicar (2026-09-05) —
        checkbox, não texto, porque só assim `resolverAcaoCriatura` (em
        `encounterSim.ts`) enxerga o efeito: Vantagem pra quem ataca o alvo
        depois, Desvantagem pra ele. O resto do que uma ação faz continua
        sendo a Anotação de baixo.
      */}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <CondicaoDaAcao
          rotulo="Preso"
          checked={!!acao.aplicaPreso}
          onChange={(v) => onChange({ aplicaPreso: v })}
        />
        <CondicaoDaAcao
          rotulo="Caído"
          checked={!!acao.aplicaCaido}
          onChange={(v) => onChange({ aplicaCaido: v })}
        />
        <CondicaoDaAcao
          rotulo="Molhado"
          checked={!!acao.aplicaMolhado}
          onChange={(v) => onChange({ aplicaMolhado: v })}
        />
        <CondicaoDaAcao
          rotulo="Veneno"
          checked={!!acao.aplicaVeneno}
          onChange={(v) => onChange({ aplicaVeneno: v })}
        />
      </div>

      <input
        value={acao.nota}
        onChange={(e) => onChange({ nota: e.target.value })}
        placeholder="Gatilho, escape, o que mais você lê em voz alta — além das quatro condições acima."
        aria-label="Anotação da ação"
        className="mt-1.5 w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 text-2xs text-parchment-900 placeholder:text-parchment-500 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
      />
    </div>
  );
}

function CondicaoDaAcao({
  rotulo,
  checked,
  onChange,
}: {
  rotulo: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-1 text-2xs font-semibold text-parchment-600 dark:text-parchment-400">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-wine-600"
      />
      {rotulo}
    </label>
  );
}

// ---------------------------------------------------------------------------
// O conselho ao vivo
// ---------------------------------------------------------------------------
const CORES_AVISO: Record<NivelAviso, string> = {
  grave: "border-rose-300 bg-rose-50/70 text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200",
  alerta: "border-amber-300 bg-amber-50/70 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200",
  nota: "border-parchment-300 bg-parchment-100/70 text-parchment-700 dark:border-parchment-800 dark:bg-parchment-900/40 dark:text-parchment-300",
};

const ICONE_AVISO: Record<NivelAviso, typeof Info> = {
  grave: Skull,
  alerta: TriangleAlert,
  nota: Info,
};

function PainelDeAvisos({
  criatura,
  avisos,
  temGrupo,
}: {
  criatura: CriaturaEncontro;
  avisos: Aviso[];
  temGrupo: boolean;
}) {
  const atualizar = useBestiaryStore((s) => s.atualizar);
  const atualizarAcao = useBestiaryStore((s) => s.atualizarAcao);

  if (avisos.length === 0) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300">
        <Info className="h-3.5 w-3.5" />
        Dentro do molde do Apêndice G
        {temGrupo ? " e sem golpe que mate alguém do grupo de uma vez." : ". Escolha as fichas do grupo acima pra o site conferir contra o PV e a CA reais deles."}
      </p>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {avisos.map((aviso) => {
        const Icone = ICONE_AVISO[aviso.nivel];
        return (
          <div key={aviso.id} className={`rounded-xl border p-2.5 text-xs ${CORES_AVISO[aviso.nivel]}`}>
            <p className="flex items-center gap-1.5 font-bold">
              <Icone className="h-3.5 w-3.5 shrink-0" /> {aviso.titulo}
            </p>
            <p className="mt-1 leading-relaxed">{aviso.texto}</p>
            {aviso.correcao && (
              <button
                type="button"
                onClick={() => {
                  const c = aviso.correcao!;
                  if (c.alvo === "acao") atualizarAcao(criatura.id, c.acaoId, { dano: c.valor });
                  else atualizar(criatura.id, { [c.campo]: c.valor });
                }}
                className="mt-1.5 rounded-lg border border-current/30 bg-white/50 px-2 py-1 font-semibold hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40"
              >
                Aplicar — {aviso.correcao.rotulo}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// O veredito
// ---------------------------------------------------------------------------
function Relatorio({ relatorio, tamanhoDoGrupo }: { relatorio: Relatorio; tamanhoDoGrupo: number }) {
  const { resultado, veredito, ajuste, criaturas } = relatorio;

  return (
    <section className="mt-8">
      <div className={`rounded-2xl border p-4 ${CORES_FAIXA[veredito.faixa]}`}>
        <h2 className="text-lg font-black">{veredito.titulo}</h2>
        <p className="mt-1 text-sm">{veredito.resumo}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Numero rotulo="Grupo vence" valor={formatarPorcentagem(resultado.vitorias)} />
        <Numero rotulo="Grupo inteiro cai" valor={formatarPorcentagem(resultado.tpk)} />
        <Numero rotulo="Rodadas" valor={resultado.rodadasMedia.toFixed(1)} />
        <Numero
          rotulo="Caem por combate"
          valor={`${resultado.quedasMedia.toFixed(1)} de ${tamanhoDoGrupo}`}
        />
        <Numero rotulo="PV do grupo ao fim" valor={formatarPorcentagem(resultado.pvRestante)} />
      </div>

      {resultado.empates > 0.02 && (
        <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">
          {formatarPorcentagem(resultado.empates)} das batalhas passaram de 20 rodadas sem decisão — um
          combate que não termina normalmente significa que ninguém dos dois lados tem dano pra vencer.
        </p>
      )}

      {ajuste && <Recomendacao ajuste={ajuste} criaturas={criaturas} />}
      {!ajuste && veredito.faixa !== "equilibrado" && (
        <p className="mt-3 rounded-xl border border-parchment-300 p-3 text-sm text-parchment-600 dark:border-parchment-800 dark:text-parchment-400">
          Nenhum ajuste de PV e dano põe este encontro na faixa Equilibrado — nem encolher, nem inflar. O
          problema está na composição: mude o número de criaturas ou o patamar delas, não os números de
          cada uma.
        </p>
      )}

      <h3 className="mt-6 mb-2 font-bold text-parchment-900 dark:text-parchment-50">
        Quem fez o quê
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-96 text-left text-sm">
          <thead className="text-xs uppercase text-parchment-600 dark:text-parchment-400">
            <tr>
              <th className="py-1 pr-3 font-semibold">Personagem</th>
              <th className="py-1 pr-3 text-right font-semibold">Dano por combate</th>
              <th className="py-1 text-right font-semibold">Sobreviveu</th>
            </tr>
          </thead>
          <tbody>
            {[...resultado.porPersonagem]
              .sort((a, b) => b.danoMedio - a.danoMedio)
              .map((p) => (
                <tr key={p.id} className="border-t border-parchment-300 dark:border-parchment-800">
                  <td className="py-1.5 pr-3 text-parchment-900 dark:text-parchment-50">{p.nome}</td>
                  <td className="py-1.5 pr-3 text-right font-mono text-parchment-600 dark:text-parchment-400">
                    {Math.round(p.danoMedio)}
                  </td>
                  <td className="py-1.5 text-right font-mono text-parchment-600 dark:text-parchment-400">
                    {formatarPorcentagem(p.sobreviveu)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <details className="mt-6 rounded-xl border border-amber-300 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/20">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
          <TriangleAlert className="h-4 w-4" /> O que esta simulação NÃO sabe
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-900 dark:text-amber-200/90">
          {SIMPLIFICACOES.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-amber-900 dark:text-amber-200/90">
          Na prática o motor mede o piso: um grupo real, com cura, condições e táticas, se sai melhor do
          que isto. Um encontro que aparece como <b>Equilibrado</b> aqui tende a ser confortável na mesa;
          um que aparece como <b>Letal</b> é letal mesmo.
        </p>
      </details>
    </section>
  );
}

function Recomendacao({ ajuste, criaturas }: { ajuste: AjusteSugerido; criaturas: CriaturaEncontro[] }) {
  const atualizar = useBestiaryStore((s) => s.atualizar);
  const [aplicado, setAplicado] = useState(false);

  const sugestoes = criaturas.map((c) => ({
    criatura: c,
    pv: arredondarPv(c.pv * ajuste.escala),
    dano: Math.max(1, Math.round(c.danoPorTurno * ajuste.escala)),
  }));
  const mudaAlgo = sugestoes.some((s) => s.pv !== s.criatura.pv || s.dano !== s.criatura.danoPorTurno);

  if (!mudaAlgo) return null;

  return (
    <div className="mt-3 rounded-2xl border border-gold-300 bg-gold-50/60 p-4 dark:border-gold-700 dark:bg-gold-950/20">
      <h3 className="font-bold text-parchment-900 dark:text-parchment-50">
        Pra cair na faixa Equilibrado
      </h3>
      <p className="mt-1 text-sm text-parchment-600 dark:text-parchment-400">
        {ajuste.escala > 1
          ? "As criaturas estão fracas demais pra este grupo. Subindo PV e dano na mesma proporção:"
          : "As criaturas estão fortes demais pra este grupo. Baixando PV e dano na mesma proporção:"}
      </p>
      <ul className="mt-2 space-y-1 text-sm">
        {sugestoes.map(({ criatura, pv, dano }) => (
          <li key={criatura.id} className="text-parchment-900 dark:text-parchment-50">
            <b>{criatura.nome}</b>{" "}
            <span className="font-mono text-parchment-600 dark:text-parchment-400">
              PV {criatura.pv} → {pv} · dano/turno {criatura.danoPorTurno} → {dano}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">
        Projeção com o ajuste: grupo vence {formatarPorcentagem(ajuste.vitoriaProjetada)} das vezes,
        perdendo {ajuste.quedasProjetadas.toFixed(1)} personagem por combate.
      </p>
      <button
        type="button"
        onClick={() => {
          for (const { criatura, pv, dano } of sugestoes) {
            atualizar(criatura.id, { pv, danoPorTurno: dano });
          }
          setAplicado(true);
        }}
        disabled={aplicado}
        className="mt-3 rounded-lg bg-wine-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-wine-500 disabled:opacity-40"
      >
        {aplicado ? "Aplicado — rode o teste de novo" : "Aplicar às criaturas"}
      </button>
    </div>
  );
}

function Numero({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="surface rounded-xl border border-parchment-300 bg-parchment-100/60 p-2 text-center dark:border-parchment-800 dark:bg-parchment-900/50">
      <p className="text-lg font-black text-parchment-900 dark:text-parchment-50">{valor}</p>
      <p className="text-2xs text-parchment-600 dark:text-parchment-400">{rotulo}</p>
    </div>
  );
}
