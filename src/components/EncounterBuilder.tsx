"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import BlocoDoMonstro from "./BlocoDoMonstro";
import PerfilDoRival from "./PerfilDoRival";
import MedidorDeEncontro from "./MedidorDeEncontro";
import EncounterScenes from "./EncounterScenes";
import EncounterScenario from "./EncounterScenario";
import EncounterCatalog from "./EncounterCatalog";
import EncounterRewards from "./EncounterRewards";
import EncounterCombatLogs from "./EncounterCombatLogs";
import EncounterExplanation from "./EncounterExplanation";
import { BATALHAS_ENCONTRO as BATALHAS, type RelatorioEncontro, type RespostaSimulacao } from "@/lib/encounterReport";
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
  Share2,
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
  UserPlus,
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
import { SIMPLIFICACOES, mediaDados, mediaFormula, patamarDaFicha, rankDaFicha, tiposDeDanoDaFicha } from "@/lib/combatSim";
import { resolverArmaCombate } from "@/lib/combatWeapon";
import {
  AcaoCriatura,
  CriaturaEncontro,
  aplicarPapel,
  danoDasAcoesPorRodada,
  escalaDaAcao,
  planoDoTurno,
  usaAcoes,
} from "@/lib/encounterSim";
import { criaturaDaFicha } from "@/lib/fichaComoCriatura";
import { CriaturaIlegivel, empacotarCriatura } from "@/lib/criaturaArquivo";
import {
  ACEITA_NA_IMPORTACAO_BESTIARIO,
  empacotarPasta,
  lerArquivoDoBestiario,
} from "@/lib/pastaArquivo";
import { linkDaCriatura } from "@/lib/criaturaLink";
import { compartilhar, usePodeCompartilhar } from "@/lib/compartilharNativo";
import { AlvoDoGrupo, Aviso, NivelAviso, avisarSobreCriatura } from "@/lib/creatureAdvice";
import {
  AjusteSugerido,
  Faixa,
  aplicarEscalaAoEncontro,
  formatarPorcentagem,
} from "@/lib/encounterBalance";
import {
  CRIATURAS_PRONTAS,
  MOLDES_CRIATURA,
  NOME_DO_ATRIBUTO,
  PAPEIS,
  acoesSugeridas,
  PapelCriatura,
  bonusResistencia,
  fichaDeAtributos,
  getArquetipo,
  getMoldePorPatamar,
  percepcaoPassiva,
  rodadasDoChefe,
  rotuloPatamar,
  sinal,
} from "@/data/bestiary";

const CORES_FAIXA: Record<Faixa, string> = {
  trivial: "border-parchment-300 bg-parchment-100 text-parchment-700 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-300",
  facil: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  equilibrado: "border-gold-300 bg-gold-50 text-gold-700 dark:border-gold-700 dark:bg-gold-950/40 dark:text-gold-200",
  perigoso: "border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
  letal: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
};

type Relatorio = RelatorioEncontro;

export default function EncounterBuilder() {
  const order = useCharacterStore((s) => s.order);
  const characters = useCharacterStore((s) => s.characters);
  const criaturas = useBestiaryStore((s) => s.criaturas);
  const selecionadas = useBestiaryStore((s) => s.selecionadas);
  const grupo = useBestiaryStore((s) => s.grupo);
  const configuracao = useBestiaryStore((s) => s.configuracao);
  const configurarEncontro = useBestiaryStore((s) => s.configurarEncontro);
  const escolhasDeArma = configuracao.armasPorPersonagem;
  const workerRef = useRef<Worker | null>(null);
  const [progresso, setProgresso] = useState("");
  useEffect(() => () => workerRef.current?.terminate(), []);

  const [rodando, setRodando] = useState(false);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [relatorioAnterior, setRelatorioAnterior] = useState<Relatorio | null>(null);
  const [assinaturaDoRelatorio, setAssinaturaDoRelatorio] = useState<string | null>(null);
  const [erroDaSimulacao, setErroDaSimulacao] = useState<string | null>(null);
  const [mensagemDaIniciativa, setMensagemDaIniciativa] = useState<string | null>(null);
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
  const armasPorPersonagem = useMemo(
    () => Object.fromEntries(
      fichasDoGrupo
        .filter((c) => Object.hasOwn(escolhasDeArma, c.id))
        .map((c) => [c.id, escolhasDeArma[c.id]])
    ),
    [fichasDoGrupo, escolhasDeArma]
  );

  /**
   * O relatório é uma fotografia, não uma previsão que se atualiza sozinha.
   * Guardar a assinatura dos dados que entraram no teste evita o pior tipo de
   * erro de interface: trocar o dano de uma criatura e continuar vendo, sem
   * aviso, a chance de vitória do encontro anterior.
   */
  const assinaturaDaConfiguracao = useMemo(
    () => JSON.stringify({
      grupo: fichasDoGrupo,
      criaturas: criaturasDoEncontro,
      armasPorPersonagem,
      semente: configuracao.semente,
      cenario: configuracao.cenario,
    }),
    [fichasDoGrupo, criaturasDoEncontro, armasPorPersonagem, configuracao.semente, configuracao.cenario]
  );
  const relatorioDesatualizado =
    relatorio !== null && assinaturaDoRelatorio !== assinaturaDaConfiguracao;

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
        // Os tipos que ele sabe causar, tirados das fórmulas das habilidades
        // dele — é o que deixa o aviso de Imunidade saber quem fica sem jogada.
        tiposDeDano: tiposDeDanoDaFicha(c),
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
    const assinaturaDaRodada = assinaturaDaConfiguracao;
    setErroDaSimulacao(null);
    setRodando(true);
    setProgresso("Preparando a simulação…");
    try {
      workerRef.current?.terminate();
      const worker = new Worker(new URL("../workers/encounter.worker.ts", import.meta.url), { type: "module" });
      workerRef.current = worker;
      const terminar = () => { worker.terminate(); workerRef.current = null; setRodando(false); };
      worker.onmessage = ({ data }: MessageEvent<RespostaSimulacao>) => {
        if (workerRef.current !== worker) return;
        if (data.tipo === "progresso") { setProgresso(data.mensagem); return; }
        if (data.tipo === "resultado") {
          if (relatorio) setRelatorioAnterior(relatorio);
          setRelatorio(data.relatorio);
          setAssinaturaDoRelatorio(assinaturaDaRodada);
        } else setErroDaSimulacao(data.mensagem);
        terminar();
      };
      worker.onerror = () => {
        if (workerRef.current !== worker) return;
        setErroDaSimulacao("A simulação foi interrompida. Tente novamente; se o problema continuar, recarregue a página.");
        terminar();
      };
      worker.postMessage({ grupo: fichasDoGrupo, criaturas: criaturasDoEncontro, configuracao: { ...configuracao, armasPorPersonagem } });
    } catch {
      workerRef.current?.terminate(); workerRef.current = null; setRodando(false);
      setErroDaSimulacao("Não foi possível iniciar a simulação neste navegador. Recarregue a página e tente novamente.");
    }
  }

  function mandarParaIniciativa() {
    const store = useInitiativeStore.getState();
    let enviados = 0;
    for (const criatura of criaturasDoEncontro) {
      for (let i = 0; i < criatura.quantidade; i++) {
        const nome = criatura.quantidade > 1 ? `${criatura.nome} ${i + 1}` : criatura.nome;
        // Iniciativa rolada aqui porque o Apêndice G não dá bônus nenhum à
        // criatura — d20 puro, o mesmo que a simulação usa.
        //
        // O Bloco do Monstro vai JUNTO (0.1.90). Sem isto, o Mestre montava a
        // criatura com atributos, perícias e resistências numa tela, e na hora
        // da luta — que é outra tela — não tinha nada disso na frente.
        const arq = getArquetipo(criatura.arquetipo);
        const atributos = fichaDeAtributos(criatura.patamar, criatura.arquetipo);
        const umPv = configuracao.cenario?.criaturasUmPv?.includes(criatura.id);
        const inicio = configuracao.cenario?.participantes?.[criatura.id];
        const condicoes = ([["escondido", "Escondido"], ["surpreso", "Surpreso"], ["molhado", "Molhado"], ["caido", "Caído"], ["preso", "Preso"], ["envenenado", "Envenenado"]] as const).filter(([id]) => inicio?.[id]).map(([, nome]) => nome);
        store.addCombatant(nome, Math.floor(Math.random() * 20) + 1, umPv ? 1 : criatura.pv, {
          notasCombate: [
            ...(umPv ? ["Horda: 1 PV por cópia (variante da mesa)"] : []),
            ...(configuracao.cenario?.distancia !== undefined ? [`Distância inicial entre as linhas: ${configuracao.cenario.distancia} m`] : []),
            ...(configuracao.cenario?.terrenoDificil ? ["Terreno difícil"] : []),
          ],
          bonusAtaque: criatura.bonusAtaque,
          ca: criatura.ca,
          percepcao: percepcaoPassiva(criatura.patamar, criatura.arquetipo),
          atributos: (Object.keys(NOME_DO_ATRIBUTO) as (keyof typeof NOME_DO_ATRIBUTO)[]).map((k) => ({
            rotulo: NOME_DO_ATRIBUTO[k].slice(0, 3),
            valor: sinal(atributos[k]),
          })),
          pericias: [...(criatura.pericias ?? [])],
          resistencias: [...(criatura.resistencias ?? [])],
          imunidades: [...(criatura.imunidades ?? [])],
          deslocamento: criatura.deslocamento ?? arq?.deslocamento ?? 9,
          movimentoEspecial: criatura.movimentoEspecial,
          tamanho: criatura.tamanho,
          sentido: criatura.sentido ?? arq?.sentido,
          cdResistencia: criatura.cdResistencia,
          patamar: criatura.patamar,
          acoes: criatura.acoes.map((acao) => ({ ...acao })),
        }, condicoes);
        enviados++;
      }
    }
    setMensagemDaIniciativa(
      `${enviados} combatente${enviados === 1 ? " foi enviado" : "s foram enviados"} para a Iniciativa.`
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <PageHeader
        icon={Skull}
        title="Encontros"
        faixa="/faixas/encontros.jpg"
        faixaPosition="center 60%"
        actions={<EncounterExplanation />}
      >
        Escolha as fichas, monte as criaturas e simule a luta. Use o relatório para ajustar a dificuldade
        e entender quais regras mudam o resultado.
      </PageHeader>

      <nav aria-label="Etapas do encontro" className="mb-6 grid gap-2 sm:grid-cols-3">
        <a href="#grupo" className="rounded-xl border border-parchment-300 px-3 py-2.5 text-sm transition-colors hover:border-wine-400 hover:bg-parchment-100 dark:border-parchment-700 dark:hover:bg-parchment-900"><span className="mr-2 font-black text-wine-600 dark:text-wine-300">01</span> Grupo <span className="text-parchment-600 dark:text-parchment-400">· {fichasDoGrupo.length} {fichasDoGrupo.length === 1 ? "ficha" : "fichas"}</span></a>
        <a href="#criaturas" className="rounded-xl border border-parchment-300 px-3 py-2.5 text-sm transition-colors hover:border-wine-400 hover:bg-parchment-100 dark:border-parchment-700 dark:hover:bg-parchment-900"><span className="mr-2 font-black text-wine-600 dark:text-wine-300">02</span> Criaturas <span className="text-parchment-600 dark:text-parchment-400">· {criaturasDoEncontro.reduce((s, c) => s + c.quantidade, 0)} em cena</span></a>
        <a href="#simular" className="rounded-xl border border-parchment-300 px-3 py-2.5 text-sm transition-colors hover:border-wine-400 hover:bg-parchment-100 dark:border-parchment-700 dark:hover:bg-parchment-900"><span className="mr-2 font-black text-wine-600 dark:text-wine-300">03</span> Simulação <span className="text-parchment-600 dark:text-parchment-400">· {relatorio ? `${relatorio.resultado.batalhas} testes` : "aguardando"}</span></a>
      </nav>
      <SecaoGrupo
        order={order}
        characters={characters}
        grupo={grupo}
        patamarSugerido={patamarSugerido}
        escolhasDeArma={escolhasDeArma}
        onEscolherArma={(personagemId, armaId) => {
          const proximas = { ...escolhasDeArma };
          if (armaId === undefined) delete proximas[personagemId];
          else proximas[personagemId] = armaId;
          configurarEncontro({ armasPorPersonagem: proximas });
        }}
      />

      <MedidorDeEncontro
        criaturas={criaturasDoEncontro}
        tamanhoDoGrupo={fichasDoGrupo.length}
        patamarDoGrupo={patamarSugerido}
      />

      <SecaoCriaturas
        criaturas={criaturas}
        selecionadas={selecionadas}
        order={order}
        characters={characters}
        novoPatamar={novoPatamar}
        novoPapel={novoPapel}
        setNovoPatamar={setNovoPatamar}
        setNovoPapel={setNovoPapel}
        pastaDestino={pastaDestino}
        setPastaDestino={setPastaDestino}
        tamanhoDoGrupo={fichasDoGrupo.length}
        alvosDoGrupo={alvosDoGrupo}
      />

      <EncounterScenario grupo={fichasDoGrupo} criaturas={criaturasDoEncontro} />
      <section id="simular" className="mt-8 scroll-mt-24">
        <label className="mb-3 block text-xs font-semibold text-parchment-700 dark:text-parchment-300">
          Semente da simulação
          <input type="number" min={0} max={2147483000} step={1} value={configuracao.semente}
            onChange={(e) => configurarEncontro({ semente: Math.min(2147483000, Math.max(0, Math.trunc(Number(e.target.value) || 0))) })}
            className="mt-1 block w-40 rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 text-sm dark:border-parchment-700 dark:bg-parchment-950" />
          <span className="mt-1 block font-normal text-parchment-600 dark:text-parchment-400">Com as mesmas fichas e criaturas, a mesma semente repete os resultados.</span>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={simular}
            disabled={!podeSimular}
            aria-busy={rodando}
            className="flex items-center gap-2 rounded-lg bg-wine-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Dices className="h-4 w-4" />
            {rodando ? "Simulando…" : `Testar o encontro (${BATALHAS} batalhas)`}
          </button>
          {rodando && <button type="button" onClick={() => {
            workerRef.current?.terminate(); workerRef.current = null; setRodando(false);
            setProgresso("Simulação cancelada. Você pode ajustar o encontro e tentar de novo.");
          }} className="rounded-lg border border-parchment-300 px-3 py-2 text-sm dark:border-parchment-700">Cancelar simulação</button>}
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
        {progresso && (
          <p role="status" aria-live="polite" className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">
            {rodando ? progresso : progresso.startsWith("Simulação cancelada") ? progresso : relatorio ? `Relatório concluído · ${relatorio.resultado.batalhas} batalhas · semente ${relatorio.semente}.` : ""}
          </p>
        )}
        {erroDaSimulacao && (
          <p role="alert" className="mt-2 text-xs text-rose-700 dark:text-rose-300">
            {erroDaSimulacao}
          </p>
        )}
        {mensagemDaIniciativa && (
          <p role="status" aria-live="polite" className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
            {mensagemDaIniciativa} <Link href="/iniciativa" className="font-semibold underline">Abrir Iniciativa</Link>
          </p>
        )}
      </section>

      {relatorio && <Relatorio relatorio={relatorio} anterior={relatorioAnterior} desatualizado={relatorioDesatualizado} />}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <EncounterScenes />
        <EncounterRewards tamanhoGrupo={fichasDoGrupo.length} />
      </div>
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
  escolhasDeArma,
  onEscolherArma,
}: {
  order: string[];
  characters: Record<string, CharacterData>;
  grupo: string[];
  patamarSugerido: number | null;
  escolhasDeArma: Record<string, string | null>;
  onEscolherArma: (personagemId: string, armaId: string | null | undefined) => void;
}) {
  const alternarGrupo = useBestiaryStore((s) => s.alternarGrupo);
  const definirGrupo = useBestiaryStore((s) => s.definirGrupo);

  return (
    <section id="grupo" className="scroll-mt-24">
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

      {grupo.some((id) => characters[id]) && (
        <fieldset className="mt-4 rounded-xl border border-parchment-300 p-3 dark:border-parchment-700">
          <legend className="px-1 text-sm font-bold text-parchment-900 dark:text-parchment-50">
            Armas neste encontro
          </legend>
          <p className="mb-3 text-xs text-parchment-600 dark:text-parchment-400">
            Confira a arma e os degraus de cada personagem. O modo automático usa a única arma equipada;
            sem uma escolha única, usa a referência d6. Esta escolha vale para este teste e seu ajuste de dificuldade.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {grupo.map((id) => {
              const personagem = characters[id];
              return personagem ? (
                <ArmaDoEncontro
                  key={id}
                  personagem={personagem}
                  escolha={escolhasDeArma[id]}
                  onEscolher={(armaId) => onEscolherArma(id, armaId)}
                />
              ) : null;
            })}
          </div>
        </fieldset>
      )}
    </section>
  );
}

function ArmaDoEncontro({
  personagem,
  escolha,
  onEscolher,
}: {
  personagem: CharacterData;
  escolha: string | null | undefined;
  onEscolher: (armaId: string | null | undefined) => void;
}) {
  const armas = personagem.inventory.filter((item) => item.type === "arma");
  const arma = resolverArmaCombate(personagem, escolha);
  const estilo = arma.treeId ? getTreeById(arma.treeId) : null;
  const escolhaAusente = typeof escolha === "string" && !armas.some((item) => item.id === escolha);
  const origem = arma.origem === "selecionada"
    ? "escolhida para o encontro"
    : arma.origem === "equipada"
      ? "equipada na ficha"
      : "referência";
  const avisoId = `arma-encontro-aviso-${personagem.id}`;

  return (
    <div className="min-w-0 rounded-lg bg-parchment-100/70 p-3 dark:bg-parchment-900/60">
      <label className="block text-xs font-semibold text-parchment-900 dark:text-parchment-50">
        Arma de {personagem.name || "Sem nome"}
        <select
          value={escolha === undefined ? "" : escolha === null ? "__referencia__" : escolha}
          onChange={(event) => {
            const valor = event.target.value;
            onEscolher(valor === "" ? undefined : valor === "__referencia__" ? null : valor);
          }}
          aria-describedby={arma.aviso ? avisoId : undefined}
          className="mt-1 block w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-2 text-xs font-normal text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
        >
          <option value="">Automático — arma equipada ou referência</option>
          <option value="__referencia__">Referência d6 (sem arma selecionada)</option>
          {escolhaAusente && <option value={escolha}>Arma selecionada indisponível</option>}
          {armas.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name || "Arma sem nome"} · {item.baseDie || "sem dado cadastrado"}{item.equipped ? " · equipada" : ""}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-2 text-xs font-semibold text-parchment-900 dark:text-parchment-50">
        {arma.nome} <span className="font-normal text-parchment-600 dark:text-parchment-400">({origem})</span>
      </p>
      <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">
        Dado base <b>{arma.baseDie}</b> → <b>{arma.escalatedDie}</b> · {arma.steps} degrau{arma.steps === 1 ? "" : "s"}
        {estilo ? ` de ${estilo.name}` : ""}.
      </p>
      <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">
        {NOME_DO_ATRIBUTO[arma.attributeKey]} {sinal(arma.attributeValue)} · Rank {sinal(arma.rankBonus)}
        {arma.penalidadeQuebrantado > 0 ? ` · Quebrantado −${arma.penalidadeQuebrantado}` : ""}
        {" · "}dano <b className="font-mono">{arma.escalatedDie}{arma.damageBonus !== arma.penalidadeQuebrantado ? sinal(arma.damageBonus - arma.penalidadeQuebrantado) : ""}</b>.
      </p>
      {!arma.proficiente && (
        <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
          Sem proficiência: os ataques com esta arma têm Desvantagem.
        </p>
      )}
      {arma.aviso && (
        <p id={avisoId} className="mt-2 text-xs text-amber-800 dark:text-amber-200">
          {arma.aviso}
        </p>
      )}
    </div>
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
  order,
  characters,
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
  /** O roster de `/personagens`, pra trazer uma ficha pro lado errado da iniciativa. */
  order: string[];
  characters: Record<string, CharacterData>;
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
  /** Qual ficha do roster está prestes a virar criatura. */
  const [fichaEscolhida, setFichaEscolhida] = useState("");
  const [papelDaFicha, setPapelDaFicha] = useState<"padrao" | "chefe">("chefe");
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

  /**
   * A ficha do roster entrando no covil.
   *
   * Passa por `importarCriatura` — o mesmo caminho do arquivo e do link — e não
   * por um método próprio: assim ela ganha ids novos (inclusive os das Ações),
   * respeita a pasta escolhida em "Nasce em" e acende o mesmo destaque de
   * chegada. Um caminho a menos pra manter.
   */
  function handleTrazerFicha() {
    const ficha = characters[fichaEscolhida];
    if (!ficha) return;
    let n = 0;
    importarCriatura(
      criaturaDaFicha(ficha, () => `acao_ficha_${n++}`, papelDaFicha),
      pastaDestino
    );
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
    <section id="criaturas" className="mt-8 scroll-mt-24">
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

        {/*
          A ficha de personagem entrando como inimigo — o rival que persegue o
          grupo, o cavaleiro que virou inimigo, o PJ de quem faltou, o duelo
          entre dois jogadores. Fica AQUI, junto de "Nova criatura", porque é a
          terceira forma de encher o covil: do molde, das prontas, ou de uma
          ficha que já existe.
        */}
        {order.length > 0 && (
          <div className="mt-1 flex w-full flex-wrap items-end gap-2 border-t border-parchment-300 pt-2 dark:border-parchment-800">
            <label className="min-w-0 text-xs font-semibold text-parchment-600 dark:text-parchment-400">
              Ou traga uma ficha do roster
              <select
                value={fichaEscolhida}
                onChange={(e) => setFichaEscolhida(e.target.value)}
                className="mt-1 block max-w-52 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm font-normal text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
              >
                <option value="">Escolha um personagem…</option>
                {order.map((id) => {
                  const c = characters[id];
                  if (!c) return null;
                  return (
                    <option key={id} value={id}>
                      {c.name || "Sem nome"}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="text-xs font-semibold text-parchment-600 dark:text-parchment-400">
              Papel no encontro
              <select value={papelDaFicha} onChange={(e) => setPapelDaFicha(e.target.value as "padrao" | "chefe")}
                className="mt-1 block rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm font-normal text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50">
                <option value="chefe">Chefe único · PV dobrados</option>
                <option value="padrao">Rival padrão · PV da ficha</option>
              </select>
            </label>
            <button
              type="button"
              onClick={handleTrazerFicha}
              disabled={!characters[fichaEscolhida]}
              className="flex items-center gap-1.5 rounded-lg border border-parchment-300 px-3 py-2 text-sm font-semibold text-parchment-700 transition-colors hover:border-wine-400 hover:text-wine-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-parchment-700 dark:text-parchment-200"
            >
              <UserPlus className="h-4 w-4" /> Trazer como criatura
            </button>
            <p className="w-full text-xs text-parchment-600 dark:text-parchment-400">
              A criatura guarda atributos, perícias, defesas, reservas, técnicas e outras habilidades da ficha. A simulação desconta os custos das ações ofensivas; habilidades que pedem decisão ficam no cartão para o Mestre. É uma <b>cópia</b>: mexer nela não
              toca na ficha do jogador, e o jogador subir de patamar não muda o inimigo que você já
              ajustou. Ela entra neste encontro e também pode ser escolhida como alvo no{" "}
              <Link href="/comparar" className="font-semibold text-wine-700 underline dark:text-wine-300">comparador de builds</Link>.
            </p>
          </div>
        )}
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
                // O Bloco do Monstro vem junto (0.1.90): sem isto, a criatura
                // pronta do Apêndice G chegava com o arquétipo genérico da
                // `criaturaDoMolde`, e a Wyvern voadora virava um bruto.
                atualizar(id, {
                  perigo: p.perigo,
                  arquetipo: p.arquetipo,
                  tamanho: p.tamanho,
                  pericias: p.pericias,
                  resistencias: p.resistencias,
                  imunidades: p.imunidades,
                  movimentoEspecial: p.movimentoEspecial,
                  sentido: p.sentido,
                });
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

      <EncounterCatalog pastaId={pastaDestino} />

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
  // "compartilhado" é separado de "copiado" porque nada vai pra área de
  // transferência ao mandar pela bandeja do sistema — o visto verde tem que
  // acender no botão que a pessoa apertou, e não no outro.
  const [linkState, setLinkState] = useState<"idle" | "copiado" | "compartilhado" | "erro">("idle");
  const podeCompartilhar = usePodeCompartilhar();

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

  /**
   * A criatura na bandeja do sistema (0.1.20) — mesmo caminho de um toque que a
   * ficha ganhou. Um Mestre passando um chefe pronto pra outro Mestre no meio
   * de uma conversa não deveria precisar da área de transferência.
   */
  async function handleCompartilhar() {
    const r = await compartilhar({
      title: `${criatura.nome} — Mushoku Tensei RPG`,
      text: `Criatura de ${criatura.patamar}º patamar. Abrir o link a importa no seu bestiário (você confirma antes).`,
      url: await linkDaCriatura(criatura),
    });
    if (r === "ok") {
      setLinkState("compartilhado");
      setTimeout(() => setLinkState("idle"), 2200);
    } else if (r === "falhou") {
      setLinkState("erro");
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
  const temPrimeiroGolpe = criatura.acoes.some((acao) => acao.regra === "primeiro-golpe");
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
    `${Math.round(porAcoes ? danoDasAcoes : criatura.danoPorTurno)} ${temPrimeiroGolpe ? "dano na abertura" : criatura.perfilDeFicha ? "dano inicial/turno" : "dano/turno"}`,
    criatura.dadosFurtivos ? `+${criatura.dadosFurtivos}d6 furtivo` : null,
    criatura.temPassoVazio ? "Passo Vazio" : null,
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
              onChange={(e) => {
                const papel = e.target.value as PapelCriatura;
                if (criatura.perfilDeFicha && papel !== criatura.papel) {
                  atualizar(criatura.id, { papel, pv: papel === "chefe" ? criatura.pv * 2 : Math.max(1, Math.round(criatura.pv / 2)) });
                } else atualizar(criatura.id, { papel });
              }}
              aria-label="Papel"
              className="rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-xs text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
            >
              {PAPEIS.filter((p) => !criatura.perfilDeFicha || p.id !== "lacaio").map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            <label className="text-xs text-parchment-600 dark:text-parchment-400">
              Escolha de alvo
              <select value={criatura.tatica ?? "ordem"} onChange={(e) => atualizar(criatura.id, { tatica: e.target.value as CriaturaEncontro["tatica"] })}
                className="ml-2 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-xs text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50">
                <option value="ordem">Ordem do grupo</option>
                <option value="aleatorio">Aleatório</option>
                <option value="fragil">Menos PV e proteção</option>
                <option value="estrategico">Menor CA</option>
              </select>
            </label>
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
            {podeCompartilhar && (
              <button
                type="button"
                onClick={handleCompartilhar}
                aria-label={`Compartilhar ${criatura.nome}`}
                title="Mandar esta criatura por WhatsApp, Discord, AirDrop…"
                className={`rounded-lg border p-1.5 ${
                  linkState === "compartilhado"
                    ? "border-emerald-400 text-emerald-600 dark:border-emerald-600 dark:text-emerald-300"
                    : "border-parchment-300 text-parchment-400 hover:text-parchment-600 dark:border-parchment-700"
                }`}
              >
                {linkState === "compartilhado" ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              </button>
            )}
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

          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
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
            <CampoNumero
              rotulo="Dano Furtivo (d6)"
              valor={criatura.dadosFurtivos ?? 0}
              min={0}
              onChange={(v) => atualizar(criatura.id, { dadosFurtivos: v || undefined })}
              dica="Dados extras no primeiro ataque que acertar um alvo desprevenido ou vulnerável neste turno. Zero desliga a regra."
            />
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-parchment-700 dark:text-parchment-300">
            <input type="checkbox" checked={!!criatura.temPassoVazio}
              onChange={(e) => atualizar(criatura.id, { temPassoVazio: e.target.checked || undefined })}
              className="h-4 w-4 accent-wine-600" />
            Passo Vazio: gasta 1 Ação uma vez por combate e reabre Primeiro Golpe
          </label>

          <BlocoDoMonstro
            criatura={criatura}
            atualizar={(patch) => atualizar(criatura.id, patch)}
          />

          <PerfilDoRival criatura={criatura} atualizar={(patch) => atualizar(criatura.id, patch)} />

          <EditorDeAcoes criatura={criatura} porAcoes={porAcoes} danoDasAcoes={danoDasAcoes} />

          <PainelDeAvisos criatura={criatura} avisos={avisos} temGrupo={alvosDoGrupo.length > 0} />

          <label className="mt-3 block text-xs font-semibold text-parchment-600 dark:text-parchment-400">
            Observações e limites da simulação
            <textarea
              value={criatura.perigo}
              onChange={(e) => atualizar(criatura.id, { perigo: e.target.value })}
              placeholder="Veneno, voo, emboscada ou habilidades que ainda precisam de decisão do Mestre. Este texto não altera a simulação."
              aria-label="O que torna a criatura perigosa"
              rows={2}
              className="mt-1 block w-full resize-y rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-xs font-normal text-parchment-900 placeholder:text-parchment-500 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
            />
          </label>

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
            Resistência da criatura: <b>+{criatura.bonusResistencia ?? bonusResistencia(molde)}</b> {criatura.perfilDeFicha ? "(calculada na ficha)." : "(metade do Bônus de Ataque do molde)."}
            {!criatura.perfilDeFicha && foraDoMolde && (
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
  const temPrimeiroGolpe = criatura.acoes.some((acao) => acao.regra === "primeiro-golpe");

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
        {/*
          SUGERIR AÇÕES (0.1.90) — o segundo buraco do bloco.

          Definir os atributos resolveu "qual a Força dele?". Sobrou o mais
          chato: inventar as fórmulas de dado. "Quanto uma Ameaça bate num
          golpe?" é calibragem, não ficção — e a coluna Dano por turno da
          tabela já sabe a resposta. O botão só aparece com a lista vazia,
          porque ele ACRESCENTA: sugerir por cima do que o Mestre escreveu
          seria apagar o trabalho dele.
        */}
        {criatura.acoes.length === 0 && (
          <button
            type="button"
            onClick={() => {
              for (const acao of acoesSugeridas(criatura.patamar, criatura.papel, criatura.arquetipo))
                adicionarAcao(criatura.id, acao);
            }}
            title="Cria ações calibradas pelo Dano por turno do patamar e pelo arquétipo. Troque os nomes à vontade — o que elas acertam é a conta."
            className="flex items-center gap-1 rounded-lg border border-wine-400/50 px-2 py-1 text-xs font-semibold text-wine-700 hover:bg-wine-100/60 dark:border-wine-500/40 dark:text-wine-300 dark:hover:bg-wine-950/40"
          >
            <Wand2 className="h-3.5 w-3.5" /> Sugerir ações
          </button>
        )}
      </div>

      {criatura.acoes.length === 0 ? (
        <p className="mt-1.5 text-xs text-parchment-600 dark:text-parchment-400">
          Nenhuma ainda. Sem ações, a simulação gasta o Dano/turno ({criatura.danoPorTurno}) como orçamento
          fixo — funciona, mas você não tem o que narrar.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2">
          {criatura.acoes.map((acao) => criatura.perfilDeFicha ? (
            <details key={acao.id} className="rounded-lg border border-parchment-300 bg-parchment-100/70 p-2 dark:border-parchment-800 dark:bg-parchment-900/50">
              <summary className="cursor-pointer text-xs font-semibold text-parchment-800 dark:text-parchment-200">
                {acao.nome} · {acao.acoes} {acao.acoes === 1 ? "Ação" : "Ações"} · {acao.tipo === "cura" ? "Cura" : acao.tipo === "escudo" ? "PV temporários" : acao.dano}
                {acao.formulaSuporte ? ` ${acao.formulaSuporte}` : ""}
                {acao.danoPorTurno ? ` · ${acao.danoPorTurno}/turno` : ""}
                {acao.pmCost ? ` · ${acao.pmCost} PM` : ""}{acao.ptCost ? ` · ${acao.ptCost} PT` : ""}{acao.ppCost ? ` · ${acao.ppCost} PP` : ""}
                {acao.aplicaMolhado ? " · Molhado" : ""}{acao.aplicaEmChamas ? ` · Em Chamas${acao.emChamasSoNaFalha ? " na falha" : ""}` : ""}
                {acao.frio ? " · Frio ×2 contra Molhado" : ""}
              </summary>
              <div className="mt-2"><LinhaDeAcao acao={acao}
                onChange={(patch) => atualizarAcao(criatura.id, acao.id, patch)}
                onRemove={() => removerAcao(criatura.id, acao.id)} /></div>
            </details>
          ) : (
            <LinhaDeAcao key={acao.id} acao={acao}
              onChange={(patch) => atualizarAcao(criatura.id, acao.id, patch)}
              onRemove={() => removerAcao(criatura.id, acao.id)} />
          ))}
        </div>
      )}

      {porAcoes && (
        <p className="mt-2 border-t border-parchment-300 pt-1.5 text-xs text-parchment-600 dark:border-parchment-800 dark:text-parchment-400">
          {temPrimeiroGolpe ? "Abertura teórica de 3 Ações:" : "Turno de 3 Ações:"}{" "}
          <b className="font-mono">{plano.map((a) => a.nome).join(" + ") || "—"}</b> ={" "}
          <b className="font-mono">~{Math.round(danoDasAcoes)}</b> de dano bruto, antes da rolagem de
          acerto{criatura.dadosFurtivos ? ` e sem os ${criatura.dadosFurtivos}d6 de Dano Furtivo` : ""}.
          {temPrimeiroGolpe ? " Primeiro Golpe exige abertura e só pode entrar uma vez por combate." : ""}
          {temPrimeiroGolpe && criatura.temPassoVazio ? " Passo Vazio pode reativá-lo; esse segundo golpe não entra na estimativa acima." : ""}
          {criatura.perfilDeFicha ? " Projeção inicial com reservas cheias; técnicas podem se esgotar ao longo do combate." : ` O molde deste patamar pede ~${doMolde.danoPorTurno} por turno.`}
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
  const escala = escalaDaAcao(acao);
  const suporte = acao.tipo === "cura" || acao.tipo === "escudo";
  const media = suporte ? mediaDados(acao.formulaSuporte ?? "") + (acao.bonusSuporte ?? 0) : mediaFormula(acao.dano) * escala;
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
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Ação" : "Ações"}
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
          <option value="cura">Cura</option>
          <option value="escudo">PV temporários</option>
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
          {suporte ? "Dados de suporte" : "Dano"}
          <input
            value={suporte ? acao.formulaSuporte ?? "" : acao.dano}
            onChange={(e) => onChange(suporte ? { formulaSuporte: e.target.value } : { dano: e.target.value })}
            placeholder={suporte ? "2d8" : "4d8+5"}
            aria-label={suporte ? "Fórmula de suporte" : "Fórmula de dano"}
            className="w-24 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 font-mono text-sm font-normal text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
          />
        </label>
        {media > 0 && (
          <span className="font-mono text-2xs text-parchment-600 dark:text-parchment-400">
            média {media % 1 === 0 ? media : media.toFixed(1)}
          </span>
        )}
        {!suporte && <label className="flex items-center gap-1 text-2xs font-semibold text-parchment-600 dark:text-parchment-400">
          Escala
          <input
            type="number"
            min="0.001"
            step="0.05"
            value={escala}
            onChange={(e) => onChange({ escalaDano: Math.max(0.001, Number(e.target.value) || 1) })}
            aria-label="Multiplicador do dano"
            className="w-16 rounded-lg border border-parchment-300 bg-parchment-50 px-1.5 py-1 font-mono text-sm font-normal text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
          />
          ×
        </label>}
        {!suporte && <label className="flex items-center gap-1 text-2xs font-semibold text-parchment-600 dark:text-parchment-400">
          Por turno
          <input value={acao.danoPorTurno ?? ""} onChange={(e) => onChange({ danoPorTurno: e.target.value })}
            placeholder="2d6" aria-label="Dano sustentado por turno"
            className="w-20 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 font-mono text-sm font-normal text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50" />
        </label>}
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

      {acao.tipo === "ataque" && (
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1 text-2xs font-semibold text-parchment-600 dark:text-parchment-400">
            Bônus de ataque próprio
            <input
              type="number"
              value={acao.bonusAtaque ?? ""}
              onChange={(e) => onChange({ bonusAtaque: e.target.value === "" ? undefined : Number(e.target.value) })}
              placeholder="Herdado"
              className="w-20 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 font-mono text-sm font-normal text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50"
            />
          </label>
          <CondicaoDaAcao
            rotulo="Arma sem proficiência (Desvantagem)"
            checked={!!acao.desvantagemAtaque}
            onChange={(v) => onChange({ desvantagemAtaque: v })}
          />
          <CondicaoDaAcao
            rotulo="Primeiro Golpe (abertura; uma vez por combate)"
            checked={acao.regra === "primeiro-golpe"}
            onChange={(v) => onChange({ regra: v ? "primeiro-golpe" : undefined })}
          />
        </div>
      )}

      {suporte && <div className="mt-1.5 flex flex-wrap items-center gap-3 text-2xs font-semibold text-parchment-600 dark:text-parchment-400">
        <label>Bônus de suporte
          <input type="number" value={acao.bonusSuporte ?? 0}
            onChange={(e) => onChange({ bonusSuporte: Number(e.target.value) || 0 })}
            className="ml-1 w-14 rounded border border-parchment-300 bg-parchment-50 p-1 dark:border-parchment-700 dark:bg-parchment-950" />
        </label>
        {acao.tipo === "cura" && <CondicaoDaAcao rotulo="Sempre Ferida Fresca"
          checked={!!acao.sempreFresca} onChange={(v) => onChange({ sempreFresca: v })} />}
      </div>}

      {(acao.pmCost !== undefined || acao.ptCost !== undefined || acao.ppCost !== undefined || acao.cdResistencia !== undefined) && (
        <div className="mt-1.5 flex flex-wrap gap-2 text-2xs font-semibold text-parchment-600 dark:text-parchment-400">
          {(["pmCost", "ptCost", "ppCost"] as const).map((campo) => (
            <label key={campo}>{campo.slice(0, 2).toUpperCase()}
              <input type="number" min={0} value={acao[campo] ?? 0}
                onChange={(e) => onChange({ [campo]: Math.max(0, Number(e.target.value) || 0) })}
                className="ml-1 w-14 rounded border border-parchment-300 bg-parchment-50 p-1 dark:border-parchment-700 dark:bg-parchment-950" />
            </label>
          ))}
          {acao.tipo === "resistencia" && <label>CD
            <input type="number" value={acao.cdResistencia ?? 0}
              onChange={(e) => onChange({ cdResistencia: Number(e.target.value) || 0 })}
              className="ml-1 w-14 rounded border border-parchment-300 bg-parchment-50 p-1 dark:border-parchment-700 dark:bg-parchment-950" />
          </label>}
        </div>
      )}

      {/*
        As quatro condições que a simulação SABE aplicar (2026-09-05) —
        checkbox, não texto, porque só assim `resolverAcaoCriatura` (em
        `encounterSim.ts`) enxerga o efeito: Vantagem pra quem ataca o alvo
        depois, Desvantagem pra ele. O resto do que uma ação faz continua
        sendo a Anotação de baixo.
      */}
      {!suporte && <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
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
        <>
          <CondicaoDaAcao rotulo="Fogo (seca Molhado)" checked={!!acao.fogo}
            onChange={(v) => onChange({ fogo: v })} />
          <CondicaoDaAcao rotulo="Em Chamas" checked={!!acao.aplicaEmChamas}
            onChange={(v) => onChange({ aplicaEmChamas: v })} />
          {acao.tipo === "resistencia" && acao.aplicaEmChamas && <CondicaoDaAcao
            rotulo="Em Chamas só na falha" checked={!!acao.emChamasSoNaFalha}
            onChange={(v) => onChange({ emChamasSoNaFalha: v })} />}
          <CondicaoDaAcao rotulo="Frio dobra contra Molhado" checked={!!acao.frio}
            onChange={(v) => onChange({ frio: v })} />
        </>
      </div>}

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
        {criatura.perfilDeFicha ? "Nenhum alerta para este rival" : "Dentro do molde do Apêndice G"}
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
                  if (c.alvo === "acao") atualizarAcao(criatura.id, c.acaoId, { escalaDano: c.valor });
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
function Relatorio({ relatorio, anterior, desatualizado }: { relatorio: Relatorio; anterior: Relatorio | null; desatualizado: boolean }) {
  const { resultado, veredito, ajuste, criaturas } = relatorio;
  const z = 1.96;
  const n = resultado.batalhas;
  const p = resultado.vitorias;
  const divisor = 1 + z * z / n;
  const centro = (p + z * z / (2 * n)) / divisor;
  const margem = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / divisor;
  const quedasEmUmGolpe = [...new Set((resultado.logsExtremos ?? []).flatMap((log) =>
    (log.eventos ?? []).filter((evento) => evento.notas.some((nota) => nota.startsWith("Queda em um golpe:"))).map((evento) => evento.alvo)
  ))];
  const chaveDaRecomendacao = ajuste
    ? `${ajuste.escala}:${criaturas
        .map(
          (criatura) =>
            `${criatura.id}:${criatura.pv}:${criatura.danoPorTurno}:${criatura.acoes
              .map((acao) => escalaDaAcao(acao))
              .join(",")}`
        )
        .join("|")}`
    : "";

  return (
    <section className="mt-8" aria-label="Resultado da simulação">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-black text-parchment-900 dark:text-parchment-50">Resultado do encontro</h2>
        <button type="button" onClick={() => {
          const conteudo = JSON.stringify({ formato: "encontro-moshoku", versao: 1, ...relatorio }, null, 2);
          const url = URL.createObjectURL(new Blob([conteudo], { type: "application/json" }));
          const link = document.createElement("a"); link.href = url; link.download = `encontro-${relatorio.semente}.json`; link.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        }} className="rounded-lg border border-parchment-300 px-3 py-2 text-sm dark:border-parchment-700">Baixar relatório completo</button>
      </div>
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
          valor={`${resultado.quedasMedia.toFixed(1)} de ${relatorio.tamanhoDoGrupo}`}
        />
        <Numero rotulo="PV do grupo ao fim" valor={formatarPorcentagem(resultado.pvRestante)} />
      </div>
      <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">{n} batalhas com semente {relatorio.semente}. Faixa estatística aproximada de 95% para a chance de vitória: {formatarPorcentagem(Math.max(0, centro - margem))} a {formatarPorcentagem(Math.min(1, centro + margem))}. Ela mede a variação dos sorteios, não as regras ainda não simuladas.</p>
      {anterior && <div className="mt-3 rounded-xl border border-parchment-300 p-3 text-sm dark:border-parchment-700">
        <h3 className="font-bold">Comparação com o teste anterior</h3>
        <p className="mt-1">Vitórias: {formatarPorcentagem(anterior.resultado.vitorias)} → {formatarPorcentagem(resultado.vitorias)} ({Math.round((resultado.vitorias - anterior.resultado.vitorias) * 100) >= 0 ? "+" : ""}{Math.round((resultado.vitorias - anterior.resultado.vitorias) * 100)} pontos).</p>
        <p>Quedas por combate: {anterior.resultado.quedasMedia.toFixed(1)} → {resultado.quedasMedia.toFixed(1)}.</p>
        <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">{anterior.semente === relatorio.semente ? "As duas simulações usaram a mesma semente, reduzindo variação no confronto." : "As sementes são diferentes; parte da diferença pode vir dos sorteios."} {JSON.stringify(anterior.entrada.grupo) === JSON.stringify(relatorio.entrada.grupo) ? "As fichas são as mesmas." : "As fichas também mudaram entre os testes."}</p>
      </div>}

      {quedasEmUmGolpe.length > 0 && <p className="mt-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
        <b>Risco de queda em um golpe:</b> {quedasEmUmGolpe.join(", ")} {quedasEmUmGolpe.length === 1 ? "foi" : "foram"} de PV completos a zero em pelo menos uma batalha destacada. Confira os ataques nos registros abaixo. Cair não significa morte definitiva.
      </p>}

      {resultado.empates > 0.02 && (
        <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">
          {formatarPorcentagem(resultado.empates)} das batalhas passaram de 20 rodadas sem decisão — um
          combate que não termina normalmente significa que ninguém dos dois lados tem dano pra vencer.
        </p>
      )}

      {desatualizado && (
        <p role="status" className="mt-3 rounded-xl border border-amber-300 bg-amber-50/70 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Fichas, armas, criaturas, cenário ou semente mudaram depois deste teste. Estes números são do encontro anterior; rode de novo antes de tomar uma decisão.
        </p>
      )}

      {ajuste && (
        <Recomendacao
          key={chaveDaRecomendacao}
          ajuste={ajuste}
          criaturas={criaturas}
          desativada={desatualizado}
        />
      )}
      {!ajuste && veredito.faixa !== "equilibrado" && (
        <p className="mt-3 rounded-xl border border-parchment-300 p-3 text-sm text-parchment-600 dark:border-parchment-800 dark:text-parchment-400">
          Os ajustes testados não encontraram uma sugestão para aproximar o encontro da faixa Equilibrado.
          Experimente mudar o número de criaturas ou o patamar delas e rode novamente.
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
              <th className="py-1 pr-3 text-right font-semibold">PV devolvidos</th>
              <th className="py-1 text-right font-semibold">Sobreviveu</th>
            </tr>
          </thead>
          <tbody>
            {/*
              A ordem é por CONTRIBUIÇÃO — dano mais PV devolvidos —, e não por
              dano (0.1.42).

              Ordenar só por dano dava a um curandeiro a última linha da tabela e
              um "0" ao lado do nome, o que lê como ficha ruim em vez de papel
              diferente. Somar os dois não afirma que 1 de cura vale 1 de dano;
              afirma que os dois são maneiras de gastar um turno, que é o que
              esta tabela compara.
            */}
            {[...resultado.porPersonagem]
              .sort((a, b) => b.danoMedio + b.curaMedia - (a.danoMedio + a.curaMedia))
              .map((p) => (
                <tr key={p.id} className="border-t border-parchment-300 dark:border-parchment-800">
                  <td className="py-1.5 pr-3 text-parchment-900 dark:text-parchment-50">{p.nome}</td>
                  <td className="py-1.5 pr-3 text-right font-mono text-parchment-600 dark:text-parchment-400">
                    {Math.round(p.danoMedio)}
                  </td>
                  {/*
                    Um traço, e não um zero, em quem não tem magia de suporte:
                    zero sugere que tentou curar e não conseguiu.
                  */}
                  <td className="py-1.5 pr-3 text-right font-mono text-parchment-600 dark:text-parchment-400">
                    {p.curaMedia > 0 ? Math.round(p.curaMedia) : "—"}
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
          O resultado é uma estimativa para estas fichas e criaturas. Terreno, decisões dos jogadores e
          habilidades ainda não modeladas podem mudar o combate para os dois lados; confira os registros
          antes de ajustar a dificuldade da mesa.
        </p>
      </details>
      {resultado.logsExtremos && resultado.logsExtremos.length > 0 && (
        <EncounterCombatLogs logs={resultado.logsExtremos} />
      )}
    </section>
  );
}

function Recomendacao({
  ajuste,
  criaturas,
  desativada = false,
}: {
  ajuste: AjusteSugerido;
  criaturas: CriaturaEncontro[];
  desativada?: boolean;
}) {
  const atualizar = useBestiaryStore((s) => s.atualizar);
  const [aplicado, setAplicado] = useState(false);

  const ajustadas = aplicarEscalaAoEncontro(criaturas, ajuste.escala);
  const sugestoes = criaturas.map((c, indice) => {
    const porAcoes = usaAcoes(c);
    const { acoes, pv, danoPorTurno: dano } = ajustadas[indice];
    const acoesAlteradas = acoes
      .map((acao, indice) => ({ acao, original: c.acoes[indice] }))
      .filter(({ acao, original }) => escalaDaAcao(acao) !== escalaDaAcao(original));
    return {
      criatura: c,
      pv,
      dano,
      acoes,
      porAcoes,
      acoesAlteradas,
    };
  });
  const mudaAlgo = sugestoes.some(
    (s) =>
      s.pv !== s.criatura.pv ||
      (!s.porAcoes && s.dano !== s.criatura.danoPorTurno) ||
      s.acoesAlteradas.length > 0
  );

  if (!mudaAlgo) return null;

  return (
    <div className="mt-3 rounded-2xl border border-gold-300 bg-gold-50/60 p-4 dark:border-gold-700 dark:bg-gold-950/20">
      <h3 className="font-bold text-parchment-900 dark:text-parchment-50">
        Ajuste sugerido de dificuldade
      </h3>
      <p className="mt-1 text-sm text-parchment-600 dark:text-parchment-400">
        {ajuste.escala > 1
          ? "As criaturas estão fracas demais pra este grupo. Subindo PV e dano na mesma proporção:"
          : "As criaturas estão fortes demais pra este grupo. Baixando PV e dano na mesma proporção:"}
      </p>
      <ul className="mt-2 space-y-1 text-sm">
        {sugestoes.map(({ criatura, pv, dano, porAcoes, acoesAlteradas }) => (
          <li key={criatura.id} className="text-parchment-900 dark:text-parchment-50">
            <b>{criatura.nome}</b>{" "}
            <span className="font-mono text-parchment-600 dark:text-parchment-400">
              PV {criatura.pv} → {pv}
              {porAcoes
                ? acoesAlteradas.length > 0
                  ? ` · ${acoesAlteradas
                      .map(
                        ({ acao, original }) =>
                          `${acao.nome} (${acao.dano}) ${formatarEscalaDaAcao(escalaDaAcao(original))} → ${formatarEscalaDaAcao(escalaDaAcao(acao))}`
                      )
                      .join("; ")}`
                  : " · ações já estão na escala sugerida"
                : ` · dano/turno ${criatura.danoPorTurno} → ${dano}`}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">
        Projeção com o ajuste: grupo vence {formatarPorcentagem(ajuste.vitoriaProjetada)} das vezes,
        com {ajuste.quedasProjetadas.toFixed(1)} personagem(ns) caído(s) ao fim de cada combate.
        {ajuste.faixaProjetada && ` Faixa projetada: ${({ trivial: "Trivial", facil: "Fácil", equilibrado: "Equilibrado", perigoso: "Perigoso", letal: "Letal" })[ajuste.faixaProjetada]}.`}
      </p>
      {sugestoes.some((s) => s.porAcoes && s.acoesAlteradas.length > 0) && (
        <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">
          Nas criaturas com ações, a fórmula continua a mesma e a escala entra na rolagem inteira — inclusive em crítico.
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          for (const { criatura, pv, dano, acoes, porAcoes } of sugestoes) {
            atualizar(criatura.id, {
              pv,
              ...(porAcoes ? { acoes } : { danoPorTurno: dano }),
            });
          }
          setAplicado(true);
        }}
        disabled={aplicado || desativada}
        className="mt-3 rounded-lg bg-wine-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-wine-500 disabled:opacity-40"
      >
        {desativada ? "Rode o teste de novo para aplicar" : aplicado ? "Aplicado — rode o teste de novo" : "Aplicar às criaturas"}
      </button>
    </div>
  );
}

function formatarEscalaDaAcao(escala: number): string {
  return `${escala.toLocaleString("pt-BR", { maximumFractionDigits: 3 })}×`;
}

function Numero({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="surface rounded-xl border border-parchment-300 bg-parchment-100/60 p-2 text-center dark:border-parchment-800 dark:bg-parchment-900/50">
      <p className="text-lg font-black text-parchment-900 dark:text-parchment-50">{valor}</p>
      <p className="text-2xs text-parchment-600 dark:text-parchment-400">{rotulo}</p>
    </div>
  );
}
