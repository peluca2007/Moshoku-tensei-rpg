import { TREES } from "@/data/trees";
import { COMBINED_SPELLS, CombinedSpell } from "@/data/combinedSpells";
import { SHOP_CATEGORY_LABELS, SHOP_ITEMS, ShopItem } from "@/data/shopItems";
import { RACES } from "@/data/races";
import { BACKGROUNDS } from "@/data/backgrounds";
import { CRIATURAS_PRONTAS, CriaturaPronta, PAPEIS } from "@/data/bestiary";
import { SKILLS, SkillDef } from "@/data/skills";
import { normalizar } from "@/lib/texto";
import { AbilityDef, ATTRIBUTES, Background, MasteryDef, Race, RankName, TalentDef, Tree } from "@/lib/types";

export type TipoDoc =
  | "habilidade"
  | "talento"
  | "maestria"
  | "combinada"
  | "arvore"
  | "item"
  | "raca"
  | "antecedente"
  | "pericia"
  | "criatura";

/** Rótulo curto de cada tipo, usado nos filtros e no selo de cada resultado. */
export const TIPO_LABELS: Record<TipoDoc, string> = {
  habilidade: "Técnicas e magias",
  talento: "Talentos",
  maestria: "Maestrias",
  combinada: "Magias combinadas",
  arvore: "Árvores",
  item: "Itens da loja",
  raca: "Raças",
  antecedente: "Antecedentes",
  pericia: "Perícias",
  criatura: "Criaturas",
};

/** Ordem de exibição dos filtros — e o desempate quando dois resultados pontuam igual. */
export const TIPO_ORDEM: TipoDoc[] = [
  "habilidade",
  "talento",
  "maestria",
  "combinada",
  "arvore",
  "item",
  "raca",
  "antecedente",
  "pericia",
  "criatura",
];

/**
 * O conteúdo do resultado, no formato original do dado.
 *
 * A busca NÃO guarda uma cópia em texto do que achou: ela guarda a referência
 * ao objeto de `src/data/`, e quem desenha o resultado desenha o objeto. É o
 * que permite mostrar a magia inteira — com as três formas de conjuração e o
 * cântico — em vez de um trecho, sem que o índice vire uma segunda fonte de
 * verdade que envelhece sozinha.
 */
export type ConteudoDoc =
  | { tipo: "habilidade"; def: AbilityDef; tree: Tree; rank: RankName }
  | { tipo: "talento"; def: TalentDef; tree: Tree; rank: RankName }
  | { tipo: "maestria"; def: MasteryDef; tree: Tree; rank: RankName }
  | { tipo: "combinada"; magia: CombinedSpell }
  | { tipo: "arvore"; tree: Tree }
  | { tipo: "item"; item: ShopItem }
  | { tipo: "raca"; raca: Race }
  | { tipo: "antecedente"; antecedente: Background }
  | { tipo: "pericia"; pericia: SkillDef }
  | { tipo: "criatura"; criatura: CriaturaPronta };

export interface DocBusca {
  chave: string;
  tipo: TipoDoc;
  nome: string;
  /** A linha de origem — "Fogo · Avançado", "Poções · 40 PO". É o que responde "onde está isto?". */
  contexto: string;
  /** Para onde ir pra ver isto no lugar dele (livro, loja, mapa de árvores). */
  href: string;
  conteudo: ConteudoDoc;
  /**
   * Todo o texto pesquisável do documento, junto e como foi escrito — efeito,
   * cântico, traços, notas. É dele que sai o trecho mostrado quando o termo não
   * está no nome ("qual magia aplica Envenenado"), e é por isso que ele fica
   * guardado além do normalizado: o normalizado perde o acento, e um resultado
   * que devolvesse "pocao de cura" pareceria erro de digitação do livro.
   */
  corpo: string;
  /** Pré-normalizados no build do índice: normalizar 750 documentos a cada tecla digitada trava. */
  nomeNorm: string;
  contextoNorm: string;
  corpoNorm: string;
}

function doc(
  d: Omit<DocBusca, "corpo" | "nomeNorm" | "contextoNorm" | "corpoNorm">,
  partes: (string | undefined)[]
): DocBusca {
  // Cada parte vira uma frase fechada antes de virar um texto só: sem isso o
  // alcance ("Toque") emenda no cântico e o trecho mostrado no resultado sai
  // como "Toque Que a pureza da minha mana...", que parece erro de revisão.
  const corpo = partes
    .filter((p): p is string => Boolean(p))
    .map((p) => p.trim())
    .map((p) => (/[.!?…:]$/.test(p) ? p : p + "."))
    .join(" ");
  return {
    ...d,
    corpo,
    nomeNorm: normalizar(d.nome),
    contextoNorm: normalizar(d.contexto),
    corpoNorm: normalizar(corpo),
  };
}

/**
 * O índice inteiro, montado uma vez na importação do módulo.
 *
 * Ele não é arquivo gerado nem passo de build: sai direto de `src/data/`, que
 * já é fonte única do livro, da ficha e da loja. Uma habilidade nova entra na
 * busca no mesmo commit em que entra no jogo, sem ninguém lembrar de nada — e é
 * por isso que ele se monta em tempo de execução em vez de virar JSON.
 */
function montarIndice(): DocBusca[] {
  const docs: DocBusca[] = [];

  for (const tree of TREES) {
    docs.push(
      doc(
        {
          chave: `arvore:${tree.id}`,
          tipo: "arvore",
          nome: tree.name,
          contexto: `${tree.subgroup} · ${tree.ranks.length} patamares`,
          href: `/livro#arvore-${tree.id}`,
          conteudo: { tipo: "arvore", tree },
        },
        [
          tree.tagline,
          tree.mechanic?.hook,
          tree.mechanic?.tag,
          tree.mechanic?.cost,
          ...(tree.mechanic?.loop ?? []),
          tree.prerequisiteNote,
          tree.proficiencies?.armas,
          tree.proficiencies?.pericias,
        ]
      )
    );

    for (const rankDef of tree.ranks) {
      const label = tree.rankLabels?.[rankDef.rank] ?? rankDef.rank;
      // O rótulo cosmético e o rank real vão AMBOS pro contexto: quem procura
      // "Briguento" e quem procura "Principiante" estão procurando a mesma
      // linha, e só uma das duas palavras aparece na tela.
      const contexto =
        label === rankDef.rank ? `${tree.name} · ${label}` : `${tree.name} · ${label} (${rankDef.rank})`;
      const href = `/livro#${tree.id}-${rankDef.rank}`;

      if (rankDef.mastery) {
        docs.push(
          doc(
            {
              chave: `maestria:${tree.id}:${rankDef.rank}`,
              tipo: "maestria",
              nome: rankDef.mastery.name,
              contexto,
              href,
              conteudo: { tipo: "maestria", def: rankDef.mastery, tree, rank: rankDef.rank },
            },
            [rankDef.mastery.description]
          )
        );
      }

      for (const talento of rankDef.talents) {
        docs.push(
          doc(
            {
              chave: `talento:${tree.id}:${talento.id}`,
              tipo: "talento",
              nome: talento.name,
              contexto,
              href,
              conteudo: { tipo: "talento", def: talento, tree, rank: rankDef.rank },
            },
            [talento.description]
          )
        );
      }

      for (const habilidade of rankDef.abilities) {
        docs.push(
          doc(
            {
              chave: `habilidade:${tree.id}:${habilidade.id}`,
              tipo: "habilidade",
              nome: habilidade.name,
              contexto,
              href,
              conteudo: { tipo: "habilidade", def: habilidade, tree, rank: rankDef.rank },
            },
            [
              habilidade.effect,
              habilidade.range,
              habilidade.costNote,
              // O cântico entra no índice de propósito: é a única parte da magia
              // que a mesa lê em voz alta, e é por ele que alguém se lembra dela.
              habilidade.incantation,
              habilidade.damage?.normal,
              habilidade.damage?.condicional,
              habilidade.damage?.porTurno,
              habilidade.healing?.normal,
              ...(habilidade.grantsSkills ?? []),
            ]
          )
        );
      }
    }
  }

  for (const magia of COMBINED_SPELLS) {
    const portas = magia.requires.map((r) => `${r.treeId} ${r.rank}`).join(" + ");
    docs.push(
      doc(
        {
          chave: `combinada:${magia.id}`,
          tipo: "combinada",
          nome: magia.name,
          contexto: `Magia combinada · ${portas}`,
          href: "/livro#cap2-4",
          conteudo: { tipo: "combinada", magia },
        },
        [magia.effect, magia.range, magia.damage]
      )
    );
  }

  for (const item of SHOP_ITEMS) {
    docs.push(
      doc(
        {
          chave: `item:${item.id}`,
          tipo: "item",
          nome: item.name,
          contexto: `${SHOP_CATEGORY_LABELS[item.category]} · ${item.price} PO · Rank ${item.guildRankRequired}`,
          href: "/loja",
          conteudo: { tipo: "item", item },
        },
        [item.description, item.baseDie]
      )
    );
  }

  for (const raca of RACES) {
    docs.push(
      doc(
        {
          chave: `raca:${raca.id}`,
          tipo: "raca",
          nome: raca.name,
          contexto: "Raça",
          href: "/livro#cap1-5",
          conteudo: { tipo: "raca", raca },
        },
        [raca.description, ...raca.traits, ...(raca.upgrades ?? []).flatMap((u) => [u.name, u.description])]
      )
    );
  }

  for (const antecedente of BACKGROUNDS) {
    docs.push(
      doc(
        {
          chave: `antecedente:${antecedente.id}`,
          tipo: "antecedente",
          nome: antecedente.name,
          contexto: `Antecedente · d100 ${antecedente.rollRange[0]}–${antecedente.rollRange[1]}`,
          href: "/livro#cap1-6",
          conteudo: { tipo: "antecedente", antecedente },
        },
        [...antecedente.traits, antecedente.startingGold, ...(antecedente.fixedSkills ?? [])]
      )
    );
  }

  for (const pericia of SKILLS) {
    const atributo = ATTRIBUTES.find((a) => a.key === pericia.attribute);
    docs.push(
      doc(
        {
          chave: `pericia:${pericia.name}`,
          tipo: "pericia",
          nome: pericia.name,
          contexto: `Perícia · ${atributo?.label ?? pericia.attribute}`,
          href: "/livro#cap1-4-pericias",
          conteudo: { tipo: "pericia", pericia },
        },
        [pericia.description]
      )
    );
  }

  for (const criatura of CRIATURAS_PRONTAS) {
    const papel = PAPEIS.find((p) => p.id === criatura.papel);
    docs.push(
      doc(
        {
          chave: `criatura:${criatura.id}`,
          tipo: "criatura",
          nome: criatura.nome,
          contexto: `Criatura · ${criatura.patamar}º patamar · ${papel?.nome ?? criatura.papel}`,
          href: "/livro#apendice-g",
          conteudo: { tipo: "criatura", criatura },
        },
        [criatura.perigo, ...criatura.acoes.flatMap((a) => [a.nome, a.nota, a.dano, a.alcance])]
      )
    );
  }

  return docs;
}

export const INDICE_BUSCA: DocBusca[] = montarIndice();

export interface Resultado {
  doc: DocBusca;
  pontos: number;
  /** true = o termo apareceu só no corpo do texto, nunca no nome. É o resultado de "quem aplica Envenenado". */
  soNoCorpo: boolean;
}

/**
 * Pontuação de UM termo contra UM documento. Zero = o termo não está lá, e um
 * termo ausente elimina o documento (a busca é E, não OU): "gelo cura" tem que
 * devolver o que é as duas coisas, não a soma de dois assuntos diferentes.
 */
function pontuarTermo(d: DocBusca, termo: string): number {
  if (d.nomeNorm === termo) return 120;
  if (d.nomeNorm.startsWith(termo)) return 90;
  // Começo de palavra dentro do nome ("peçonha" em "Névoa de Peçonha") vale mais
  // que um pedaço no meio de uma palavra qualquer.
  if (d.nomeNorm.includes(` ${termo}`)) return 70;
  if (d.nomeNorm.includes(termo)) return 55;
  if (d.contextoNorm.includes(termo)) return 25;
  if (d.corpoNorm.includes(termo)) return 12;
  return 0;
}

/**
 * Busca no índice inteiro. Devolve tudo que casa, ordenado — o corte de quantos
 * aparecem em tela é decisão de quem desenha, não daqui.
 */
export function buscar(consulta: string, tipos?: ReadonlySet<TipoDoc>): Resultado[] {
  const termos = termosDe(consulta);
  if (termos.length === 0) return [];

  const resultados: Resultado[] = [];
  for (const d of INDICE_BUSCA) {
    if (tipos && tipos.size > 0 && !tipos.has(d.tipo)) continue;
    let pontos = 0;
    let noNome = false;
    for (const termo of termos) {
      const p = pontuarTermo(d, termo);
      if (p === 0) {
        pontos = 0;
        break;
      }
      if (p >= 55) noNome = true;
      pontos += p;
    }
    if (pontos > 0) resultados.push({ doc: d, pontos, soNoCorpo: !noNome });
  }

  resultados.sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    const ta = TIPO_ORDEM.indexOf(a.doc.tipo);
    const tb = TIPO_ORDEM.indexOf(b.doc.tipo);
    if (ta !== tb) return ta - tb;
    return a.doc.nome.localeCompare(b.doc.nome, "pt-BR");
  });
  return resultados;
}

/** Quantos documentos de cada tipo casam com a consulta — alimenta os contadores dos filtros. */
export function contarPorTipo(consulta: string): Record<TipoDoc, number> {
  const contagem = Object.fromEntries(TIPO_ORDEM.map((t) => [t, 0])) as Record<TipoDoc, number>;
  for (const r of buscar(consulta)) contagem[r.doc.tipo] += 1;
  return contagem;
}

/** Os termos da consulta, já normalizados — o mesmo corte que a `buscar()` faz. */
export function termosDe(consulta: string): string[] {
  return normalizar(consulta.trim()).split(/\s+/).filter(Boolean);
}

/**
 * A frase do texto onde o termo aparece — o resultado de "qual magia aplica
 * Envenenado" tem que mostrar a frase que diz isso, não os primeiros 140
 * caracteres do efeito, que quase nunca são a parte que responde.
 *
 * Roda só nos resultados que estão em tela (algumas dezenas), e não nos ~750 do
 * índice: por isso pode normalizar frase a frase na hora, sem tabela nenhuma
 * guardada.
 */
export function trechoQueCasa(corpo: string, termos: string[]): string | null {
  if (termos.length === 0 || !corpo) return null;
  // Abreviação não termina frase: "(Cap. 4, §8)" cortado no primeiro ponto
  // devolveria o trecho "Peçonha de Serpente-do-Pântano (Cap." e sumiria com a
  // referência, que é justamente o que quem procurou queria ler.
  const frases = corpo.split(/(?<!\bCap\.)(?<!\bEx\.)(?<!\bSr\.)(?<!\bSra\.)(?<=[.!?])\s+/);
  for (const frase of frases) {
    const norm = normalizar(frase);
    if (termos.some((t) => norm.includes(t))) {
      return frase.length > 220 ? `${frase.slice(0, 217)}…` : frase;
    }
  }
  return null;
}
