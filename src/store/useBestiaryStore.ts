"use client";

/**
 * As criaturas que o Mestre montou — NPCs, monstros e chefes.
 *
 * Store própria, separada do roster de personagens, porque as duas coisas têm
 * ciclos de vida opostos: uma ficha de jogador é um documento que o dono edita
 * por meses, e uma criatura é um rascunho de uma sessão. Misturá-las faria o
 * `/personagens` encher de goblins.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AcaoCriatura, CriaturaEncontro, criaturaDoMolde } from "@/lib/encounterSim";
import { PapelCriatura, getMoldePorPatamar } from "@/data/bestiary";

function makeId() {
  return `criatura_${Math.random().toString(36).slice(2, 10)}`;
}

function makeAcaoId() {
  return `acao_${Math.random().toString(36).slice(2, 10)}`;
}

function makePastaId() {
  return `pasta_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Uma gaveta do bestiário.
 *
 * A pasta é do MESTRE, não da criatura: ela existe pra separar "Goblins da
 * estrada" de "Chefes do arco 2", e por isso a lista de pastas é estado da
 * store, e não um campo derivado dos nomes que as criaturas carregam. Uma
 * pasta vazia continua existindo — é justamente onde o Mestre vai montar o
 * próximo encontro.
 */
/**
 * As cores que uma pasta pode vestir.
 *
 * É uma lista fechada, e não um `#rrggbb` livre, porque a cor precisa
 * funcionar nos DOIS temas do site e passar no contraste — cor escolhida a
 * dedo por quem só viu o tema claro fica ilegível no escuro, e o
 * `check:contraste` não teria como cobrir um valor que só existe no
 * `localStorage` de uma pessoa.
 */
export const CORES_DE_PASTA = ["pergaminho", "vinho", "ouro", "esmeralda", "ambar", "rosa"] as const;
export type CorDePasta = (typeof CORES_DE_PASTA)[number];

export interface PastaCriaturas {
  id: string;
  nome: string;
  /**
   * Recolhida na tela.
   *
   * Mora aqui, junto do resto do bestiário salvo, e não num `useState` da
   * página: um Mestre com dez pastas fecha nove delas UMA vez, e recarregar o
   * site no meio da sessão não pode devolver a parede de cartões que ele
   * acabou de arrumar.
   */
  recolhida: boolean;
  /** A cor da gaveta. Ausente = "pergaminho", o padrão discreto. */
  cor?: CorDePasta;
  /**
   * Um emoji no lugar do ícone de pasta.
   *
   * Personalização de verdade custa pouco aqui e paga muito: numa lista de dez
   * gavetas, 🐉 e 🏚️ se acham de relance de um jeito que "Chefes do arco 2" e
   * "Taverna" não — o olho lê a figura antes de ler a palavra.
   */
  emoji?: string;
}

/** O que chega quando o Mestre importa uma pasta inteira de outro bestiário. */
export interface PastaImportada {
  nome: string;
  cor?: CorDePasta;
  emoji?: string;
  criaturas: Omit<CriaturaEncontro, "id">[];
}

/**
 * O que acabou de entrar no bestiário — pra tela mostrar em vez de esconder.
 *
 * Sem isto, importar era um clique que não parecia fazer nada: a criatura
 * entrava lá embaixo, com o cartão fechado (desde que o cartão passou a nascer
 * recolhido) e, se a pasta de destino estivesse recolhida, dentro de uma gaveta
 * fechada. O caminho pelo LINK era pior ainda, porque a confirmação acontece em
 * outra rota e volta pra cá sem nada em comum. Quem grava é a store; a tela
 * reage abrindo, expandindo e rolando até lá.
 */
export interface Chegada {
  tipo: "criatura" | "pasta";
  id: string;
  /** Sorteado a cada chegada: importar a MESMA criatura duas vezes tem que acordar a tela duas vezes. */
  marca: number;
}

/** Uma ação nova, em branco — os campos são do Mestre, não do molde. */
function acaoVazia(nome = "Nova ação"): AcaoCriatura {
  return {
    id: makeAcaoId(),
    nome,
    acoes: 1,
    dano: "",
    alcance: "Corpo a corpo",
    area: false,
    tipo: "ataque",
    nota: "",
    aplicaPreso: false,
    aplicaCaido: false,
    aplicaMolhado: false,
    aplicaVeneno: false,
  };
}

interface BestiaryState {
  criaturas: CriaturaEncontro[];
  /** As gavetas, na ordem em que aparecem na tela. Criatura sem `pastaId` fica fora de todas. */
  pastas: PastaCriaturas[];
  /** Ids das criaturas que entram no encontro sendo testado. */
  selecionadas: string[];
  /** Ids das fichas do roster que formam o grupo no teste. */
  grupo: string[];
  /** O último item que chegou de fora (ou nasceu agora). Não é salvo — ver `partialize`. */
  chegada: Chegada | null;

  criar: (patamar: number, papel: PapelCriatura, nome?: string, pastaId?: string | null) => string;
  /** Traz uma criatura de um arquivo `.mtcriatura` ou de um link — id novo, ids de ação novos. */
  importarCriatura: (dados: Omit<CriaturaEncontro, "id">, pastaId?: string | null) => string;
  /** Devolve o id da cópia — a tela abre o cartão novo em vez de deixar o Mestre procurar. */
  duplicar: (id: string) => string | null;
  remover: (id: string) => void;
  atualizar: (id: string, patch: Partial<Omit<CriaturaEncontro, "id">>) => void;
  /** Devolve a criatura aos números do molde do patamar/papel atual dela. */
  recalibrar: (id: string) => void;

  adicionarAcao: (id: string, acao?: Partial<AcaoCriatura>) => void;
  atualizarAcao: (id: string, acaoId: string, patch: Partial<Omit<AcaoCriatura, "id">>) => void;
  removerAcao: (id: string, acaoId: string) => void;
  alternarSelecao: (id: string) => void;
  /** Marca ou desmarca um lote de uma vez — é o "pasta inteira pro encontro". */
  definirSelecaoDeVarias: (ids: string[], marcada: boolean) => void;
  alternarGrupo: (characterId: string) => void;
  definirGrupo: (ids: string[]) => void;

  criarPasta: (nome?: string) => string;
  /** Nome, cor, emoji ou recolhimento — tudo que é aparência da gaveta. */
  atualizarPasta: (id: string, patch: Partial<Omit<PastaCriaturas, "id">>) => void;
  /** Traz uma pasta inteira de um arquivo `.mtpasta`: gaveta nova, criaturas com ids novos. */
  importarPasta: (dados: PastaImportada) => string;
  /** Apaga a gaveta, NUNCA o que estava dentro: as criaturas voltam pra "Fora das pastas". */
  removerPasta: (id: string) => void;
  moverPasta: (id: string, direcao: -1 | 1) => void;
  alternarPastaRecolhida: (id: string) => void;
  definirPastasRecolhidas: (recolhidas: boolean) => void;
  /** Move uma criatura pra uma pasta (ou pra fora de todas, com `null`). */
  moverCriatura: (id: string, pastaId: string | null) => void;
  /** Sobe ou desce a criatura uma posição DENTRO da pasta em que ela está. */
  reordenarCriatura: (id: string, direcao: -1 | 1) => void;
  /** A tela chama isto depois de mostrar a chegada, pra ela não se repetir. */
  limparChegada: () => void;
}

function chegou(tipo: Chegada["tipo"], id: string): Chegada {
  return { tipo, id, marca: Math.random() };
}

export const useBestiaryStore = create<BestiaryState>()(
  persist(
    (set, get) => ({
      criaturas: [],
      pastas: [],
      selecionadas: [],
      grupo: [],
      chegada: null,

      criar: (patamar, papel, nome, pastaId) => {
        const id = makeId();
        const criatura = criaturaDoMolde(patamar, papel, nome || "Criatura sem nome", id);
        set((s) => ({
          criaturas: [...s.criaturas, { ...criatura, pastaId: pastaId ?? undefined }],
          selecionadas: [...s.selecionadas, id],
          chegada: chegou("criatura", id),
        }));
        return id;
      },

      // `id` da criatura e de cada ação são sorteados de novo — igual
      // `importCharacter` faz com a ficha: um `.mtcriatura` que alguém te
      // mandou pode ser o que VOCÊ mandou pra ele antes, e reimportar não pode
      // colidir com a que já está no seu bestiário.
      importarCriatura: (dados, pastaId) => {
        const id = makeId();
        const criatura: CriaturaEncontro = {
          ...dados,
          id,
          acoes: dados.acoes.map((a) => ({ ...a, id: makeAcaoId() })),
          // A pasta do arquivo é descartada de propósito: `pastaId` é um id
          // sorteado no bestiário de QUEM EXPORTOU, e casá-lo com uma gaveta
          // daqui seria coincidência. A criatura entra onde o Mestre está
          // olhando agora — a pasta escolhida no formulário, ou fora de todas.
          pastaId: pastaId ?? undefined,
        };
        set((s) => ({
          criaturas: [...s.criaturas, criatura],
          selecionadas: [...s.selecionadas, id],
          chegada: chegou("criatura", id),
        }));
        return id;
      },

      // A cópia nasce na MESMA pasta da original (o spread carrega `pastaId`):
      // duplicar é o jeito de montar "Goblin 2" dentro do encontro que já está
      // aberto, e mandá-la pra fora da pasta desfaria a arrumação a cada clique.
      duplicar: (id) => {
        const original = get().criaturas.find((c) => c.id === id);
        if (!original) return null;
        const novoId = makeId();
        const novo = { ...original, id: novoId, nome: `${original.nome} (cópia)` };
        set((s) => ({ criaturas: [...s.criaturas, novo], chegada: chegou("criatura", novoId) }));
        return novoId;
      },

      remover: (id) =>
        set((s) => ({
          criaturas: s.criaturas.filter((c) => c.id !== id),
          selecionadas: s.selecionadas.filter((x) => x !== id),
        })),

      atualizar: (id, patch) =>
        set((s) => ({
          criaturas: s.criaturas.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      // Editar patamar ou papel NÃO reescreve os números sozinho: o Mestre que
      // ajustou o PV à mão perderia o ajuste sem pedir. Recalibrar é um botão.
      recalibrar: (id) =>
        set((s) => ({
          criaturas: s.criaturas.map((c) => {
            if (c.id !== id) return c;
            const base = criaturaDoMolde(c.patamar, c.papel, c.nome, c.id);
            const molde = getMoldePorPatamar(c.patamar);
            return {
              ...base,
              quantidade: c.quantidade,
              perigo: c.perigo,
              // As ações são TEXTO do Mestre, não número de molde: recalibrar
              // devolve PV, CA e dano à tabela, e nunca apaga o que ele escreveu.
              acoes: c.acoes,
              cdResistencia: molde.cdResistencia,
              // Mesma lógica do `perigo`: o retrato é do Mestre, não do molde —
              // `criaturaDoMolde` nem sabe que o campo existe, e sem repassar
              // aqui "Recalibrar" apagaria a foto junto dos números.
              portrait: c.portrait,
            };
          }),
        })),

      adicionarAcao: (id, acao) =>
        set((s) => ({
          criaturas: s.criaturas.map((c) =>
            c.id === id ? { ...c, acoes: [...c.acoes, { ...acaoVazia(), ...acao, id: makeAcaoId() }] } : c
          ),
        })),

      atualizarAcao: (id, acaoId, patch) =>
        set((s) => ({
          criaturas: s.criaturas.map((c) =>
            c.id === id
              ? { ...c, acoes: c.acoes.map((a) => (a.id === acaoId ? { ...a, ...patch } : a)) }
              : c
          ),
        })),

      removerAcao: (id, acaoId) =>
        set((s) => ({
          criaturas: s.criaturas.map((c) =>
            c.id === id ? { ...c, acoes: c.acoes.filter((a) => a.id !== acaoId) } : c
          ),
        })),

      alternarSelecao: (id) =>
        set((s) => ({
          selecionadas: s.selecionadas.includes(id)
            ? s.selecionadas.filter((x) => x !== id)
            : [...s.selecionadas, id],
        })),

      definirSelecaoDeVarias: (ids, marcada) =>
        set((s) => ({
          selecionadas: marcada
            ? [...s.selecionadas, ...ids.filter((id) => !s.selecionadas.includes(id))]
            : s.selecionadas.filter((id) => !ids.includes(id)),
        })),

      alternarGrupo: (characterId) =>
        set((s) => ({
          grupo: s.grupo.includes(characterId)
            ? s.grupo.filter((x) => x !== characterId)
            : [...s.grupo, characterId],
        })),

      definirGrupo: (ids) => set({ grupo: ids }),

      // -----------------------------------------------------------------
      // As pastas
      // -----------------------------------------------------------------
      criarPasta: (nome) => {
        const id = makePastaId();
        set((s) => ({
          pastas: [...s.pastas, { id, nome: nome || "Nova pasta", recolhida: false }],
          chegada: chegou("pasta", id),
        }));
        return id;
      },

      atualizarPasta: (id, patch) =>
        set((s) => ({ pastas: s.pastas.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

      // A pasta importada é uma gaveta NOVA, mesmo que já exista uma com o
      // mesmo nome: fundir duas pastas homônimas de bestiários diferentes
      // misturaria o covil de duas campanhas sem perguntar, e desfazer isso
      // seria mover criatura por criatura à mão.
      importarPasta: (dados) => {
        const pastaId = makePastaId();
        const criaturas: CriaturaEncontro[] = dados.criaturas.map((c) => ({
          ...c,
          id: makeId(),
          acoes: (c.acoes ?? []).map((a) => ({ ...a, id: makeAcaoId() })),
          pastaId,
        }));
        set((s) => ({
          pastas: [...s.pastas, { id: pastaId, nome: dados.nome || "Pasta importada", recolhida: false, cor: dados.cor, emoji: dados.emoji }],
          criaturas: [...s.criaturas, ...criaturas],
          chegada: chegou("pasta", pastaId),
        }));
        return pastaId;
      },

      // Apagar a gaveta não é apagar o conteúdo. Um Mestre que fez trinta
      // criaturas e reorganiza as pastas no meio da sessão não pode perder
      // metade do bestiário por clicar na lixeira errada — as criaturas caem
      // em "Fora das pastas", que é o pior que pode acontecer aqui.
      removerPasta: (id) =>
        set((s) => ({
          pastas: s.pastas.filter((p) => p.id !== id),
          criaturas: s.criaturas.map((c) => (c.pastaId === id ? { ...c, pastaId: undefined } : c)),
        })),

      moverPasta: (id, direcao) =>
        set((s) => {
          const i = s.pastas.findIndex((p) => p.id === id);
          const j = i + direcao;
          if (i < 0 || j < 0 || j >= s.pastas.length) return s;
          const pastas = [...s.pastas];
          [pastas[i], pastas[j]] = [pastas[j], pastas[i]];
          return { ...s, pastas };
        }),

      limparChegada: () => set({ chegada: null }),

      alternarPastaRecolhida: (id) =>
        set((s) => ({
          pastas: s.pastas.map((p) => (p.id === id ? { ...p, recolhida: !p.recolhida } : p)),
        })),

      definirPastasRecolhidas: (recolhidas) =>
        set((s) => ({ pastas: s.pastas.map((p) => ({ ...p, recolhida: recolhidas })) })),

      // A criatura vai pro FIM do array. A ordem dentro de uma pasta é a ordem
      // do array filtrada, então reinserir no fim é o que faz a criatura movida
      // aparecer embaixo da gaveta de destino, e não no meio dela — que é onde
      // ninguém a procuraria depois de arrastar.
      moverCriatura: (id, pastaId) =>
        set((s) => {
          const criatura = s.criaturas.find((c) => c.id === id);
          if (!criatura || (criatura.pastaId ?? null) === pastaId) return s;
          return {
            ...s,
            criaturas: [
              ...s.criaturas.filter((c) => c.id !== id),
              { ...criatura, pastaId: pastaId ?? undefined },
            ],
          };
        }),

      // Sobe/desce trocando com a VIZINHA DA MESMA PASTA, não com a vizinha no
      // array: entre duas criaturas da mesma gaveta pode haver qualquer número
      // de criaturas de outras, e trocar com a do array faria a seta mexer numa
      // pasta que o Mestre nem está olhando.
      reordenarCriatura: (id, direcao) =>
        set((s) => {
          const criatura = s.criaturas.find((c) => c.id === id);
          if (!criatura) return s;
          const irmas = s.criaturas.filter((c) => (c.pastaId ?? null) === (criatura.pastaId ?? null));
          const posicao = irmas.findIndex((c) => c.id === id);
          const vizinha = irmas[posicao + direcao];
          if (!vizinha) return s;
          const i = s.criaturas.findIndex((c) => c.id === id);
          const j = s.criaturas.findIndex((c) => c.id === vizinha.id);
          const criaturas = [...s.criaturas];
          [criaturas[i], criaturas[j]] = [criaturas[j], criaturas[i]];
          return { ...s, criaturas };
        }),
    }),
    {
      name: "mushoku-tensei-bestiario",
      skipHydration: true,
      version: 4,
      /**
       * `chegada` fica de fora do que é salvo: ela é "o que acabou de acontecer
       * nesta aba". Salva, ela reabriria e rolaria até a última criatura
       * importada toda vez que o site abrisse — uma semana depois, sem nada ter
       * chegado.
       */
      partialize: (s) => ({
        criaturas: s.criaturas,
        pastas: s.pastas,
        selecionadas: s.selecionadas,
        grupo: s.grupo,
      }),
      /**
       * v1 → v2: a criatura ganhou `acoes` (2026-09-03).
       *
       * Mesma regra que vale pra ficha de personagem: bestiário salvo nunca é
       * resetado. Um Mestre com dez monstros montados na véspera da sessão não
       * pode perdê-los porque o schema cresceu — e sem `acoes` definido, todo
       * `c.acoes.map` da tela quebraria na primeira renderização.
       *
       * v2 → v3 (2026-09-05, duas mudanças no mesmo patamar de versão): a
       * criatura ganhou `portrait` — opcional, "sem retrato" é a ausência da
       * chave, bestiário salvo já entra correto sem conversão nenhuma — e a
       * ação ganhou Preso/Caído/Molhado/Veneno estruturados. Estes últimos são
       * opcionais no tipo (uma ação antiga sem eles continua batendo o tipo),
       * mas preencher com `false` aqui evita que uma ação salva antes da
       * mudança apareça "indefinida" nos checkboxes novos da tela em vez de
       * "desmarcada".
       *
       * v3 → v4 (2026-09-05): chegaram as PASTAS. Bestiário salvo entra inteiro
       * em "Fora das pastas" — nenhuma criatura tem `pastaId`, e é exatamente
       * assim que ele deve chegar: o Mestre é quem decide o que era "os goblins
       * daquela estrada", e inventar gavetas por ele daria uma arrumação que
       * ninguém pediu. `pastas: []` não dependeria desta conversão (o merge do
       * `persist` já cai no estado inicial), mas escrevê-la aqui é o que impede
       * um `pastas` de virar `undefined` num estado antigo salvo pela metade,
       * e todo `pastas.map` da tela quebrar na primeira renderização.
       */
      migrate: (estado, versao) => {
        const s = estado as { criaturas?: CriaturaEncontro[]; pastas?: PastaCriaturas[] } | undefined;
        if (!s?.criaturas) return s as never;
        let criaturas = s.criaturas;
        if (versao < 2) {
          criaturas = criaturas.map((c) => ({ ...c, acoes: c.acoes ?? [] }));
        }
        if (versao < 3) {
          criaturas = criaturas.map((c) => ({
            ...c,
            acoes: c.acoes.map((a) => ({
              aplicaPreso: false,
              aplicaCaido: false,
              aplicaMolhado: false,
              aplicaVeneno: false,
              ...a,
            })),
          }));
        }
        return { ...s, criaturas, pastas: s.pastas ?? [] } as never;
      },
    }
  )
);
