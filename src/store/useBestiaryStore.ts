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
  /** Ids das criaturas que entram no encontro sendo testado. */
  selecionadas: string[];
  /** Ids das fichas do roster que formam o grupo no teste. */
  grupo: string[];

  criar: (patamar: number, papel: PapelCriatura, nome?: string) => string;
  /** Traz uma criatura de um arquivo `.mtcriatura` ou de um link — id novo, ids de ação novos. */
  importarCriatura: (dados: Omit<CriaturaEncontro, "id">) => string;
  duplicar: (id: string) => void;
  remover: (id: string) => void;
  atualizar: (id: string, patch: Partial<Omit<CriaturaEncontro, "id">>) => void;
  /** Devolve a criatura aos números do molde do patamar/papel atual dela. */
  recalibrar: (id: string) => void;

  adicionarAcao: (id: string, acao?: Partial<AcaoCriatura>) => void;
  atualizarAcao: (id: string, acaoId: string, patch: Partial<Omit<AcaoCriatura, "id">>) => void;
  removerAcao: (id: string, acaoId: string) => void;
  alternarSelecao: (id: string) => void;
  alternarGrupo: (characterId: string) => void;
  definirGrupo: (ids: string[]) => void;
}

export const useBestiaryStore = create<BestiaryState>()(
  persist(
    (set, get) => ({
      criaturas: [],
      selecionadas: [],
      grupo: [],

      criar: (patamar, papel, nome) => {
        const id = makeId();
        const criatura = criaturaDoMolde(patamar, papel, nome || "Criatura sem nome", id);
        set((s) => ({ criaturas: [...s.criaturas, criatura], selecionadas: [...s.selecionadas, id] }));
        return id;
      },

      // `id` da criatura e de cada ação são sorteados de novo — igual
      // `importCharacter` faz com a ficha: um `.mtcriatura` que alguém te
      // mandou pode ser o que VOCÊ mandou pra ele antes, e reimportar não pode
      // colidir com a que já está no seu bestiário.
      importarCriatura: (dados) => {
        const id = makeId();
        const criatura: CriaturaEncontro = {
          ...dados,
          id,
          acoes: dados.acoes.map((a) => ({ ...a, id: makeAcaoId() })),
        };
        set((s) => ({ criaturas: [...s.criaturas, criatura], selecionadas: [...s.selecionadas, id] }));
        return id;
      },

      duplicar: (id) => {
        const original = get().criaturas.find((c) => c.id === id);
        if (!original) return;
        const novo = { ...original, id: makeId(), nome: `${original.nome} (cópia)` };
        set((s) => ({ criaturas: [...s.criaturas, novo] }));
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

      alternarGrupo: (characterId) =>
        set((s) => ({
          grupo: s.grupo.includes(characterId)
            ? s.grupo.filter((x) => x !== characterId)
            : [...s.grupo, characterId],
        })),

      definirGrupo: (ids) => set({ grupo: ids }),
    }),
    {
      name: "mushoku-tensei-bestiario",
      skipHydration: true,
      version: 3,
      /**
       * v1 → v2: a criatura ganhou `acoes` (2026-09-03).
       * v2 → v3: a ação ganhou Preso/Caído/Molhado/Veneno estruturados
       * (2026-09-05) — os campos são opcionais no tipo (uma ação antiga sem
       * eles continua batendo o tipo), mas preencher com `false` aqui evita que
       * uma ação salva antes da mudança aparente "indefinida" nos checkboxes
       * novos da tela em vez de "desmarcada".
       */
      migrate: (estado, versao) => {
        const s = estado as { criaturas?: CriaturaEncontro[] } | undefined;
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
        return { ...s, criaturas } as never;
      },
    }
  )
);
