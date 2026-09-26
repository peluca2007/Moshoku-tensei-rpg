import { AbilityDef, qualifiesForRecitationBonus, RankName } from "@/lib/types";
import { rotuloDeAcoes } from "@/lib/rotuloDeAcoes";

// Um alias local: o nome curto já era usado em vários pontos deste arquivo.
const actionText = rotuloDeAcoes;

/**
 * Cap. 2, §2: o que a Recitação Perfeita paga nesta magia — ou por que ela não
 * paga nada.
 *
 * O gate de tamanho (2026-09-03) é a mudança que importa. Antes bastava a magia
 * ter um cântico escrito pra conceder Vantagem no acerto ou Desvantagem na resistência, e uma
 * auditoria das 149 magias do livro achou **55 com cântico abaixo do piso do
 * próprio rank**: "Não caias. Ainda não. Prontidão!" tem 35 caracteres e pagava
 * exatamente o mesmo que um cântico de 380 caracteres do rank Rei. O sistema
 * estava premiando quem escrevesse cânticos CURTOS — o oposto exato do que o
 * capítulo promete quando diz que o tamanho é proporcional ao poder.
 *
 * Agora o piso de INCANTATION_LENGTH é a porta, e quem não alcança recebe um
 * selo explícito de "Sem bônus" em vez de silêncio. Não é uma punição: são as
 * magias rápidas de propósito (Prontidão, Rejeitar a Morte, Luz Absoluta, Lança
 * de Plasma, Explosão Silenciosa — todas de emergência, todas com `costNote`
 * justificando a pressa), e pra elas a velocidade já É o benefício. O livro
 * deixou de dar as duas coisas de graça.
 */
function perfectRecitationBonus(
  ability: AbilityDef,
  rank?: RankName
): { ok: boolean; text: string } | null {
  if (!ability.incantation) return null;

  if (rank && !qualifiesForRecitationBonus(ability.incantation, rank)) {
    return { ok: false, text: `Sem bônus — cântico curto demais para o rank ${rank}` };
  }

  switch (tipoDeRecitacao(ability)) {
    case "ataque":
      return { ok: true, text: "Vantagem no teste de acerto" };
    case "resistencia":
      return { ok: true, text: "o alvo resiste com Desvantagem" };
    default:
      // O desconto é o Bônus de Rank do CONJURADOR na escola, não o rank da
      // magia: `rank` aqui é o da carta, e um Rei conjurando Cura (Principiante)
      // desconta 5, não 1. A carta não sabe quem conjura, então diz a regra.
      return { ok: true, text: "Custa PM a menos igual ao seu Bônus de Rank na escola (mínimo 1)" };
  }
}

/**
 * Qual das três recompensas do Cap. 2, §2 esta magia paga.
 *
 * Até a revisão do Cap. 2 isto era "tem `damage.normal`? então é ataque" e
 * "o efeito contém 'teste'? então é resistência". As duas leituras erravam:
 * Cura e Vigor Emprestado guardam a CURA em `damage.normal` (types.ts,
 * `healing`) e ganhavam "Vantagem no acerto" numa magia sem acerto; e "Sem
 * dano, sem teste" contava como teste de resistência. Magias de dano com teste
 * (Explosão, Nevasca) também caíam em "ataque" só por terem dano.
 *
 * A ordem agora: acerto declarado > teste de resistência de atributo > dano que
 * não é PV > suporte (cura, barreira, utilidade).
 */
function tipoDeRecitacao(ability: AbilityDef): "ataque" | "resistencia" | "suporte" {
  const efeito = ability.effect;
  const dano = ability.damage?.normal;
  const curaNoDano = dano !== undefined && /\bPV\b/.test(dano);

  if (/\b(se acertar|ataque mágico|teste de acerto)\b/i.test(efeito)) return "ataque";
  if (/\bteste de (resistência de )?(Força|Agilidade|Vigor|Intelecto|Espírito)\b/i.test(efeito)) return "resistencia";
  if (dano !== undefined && !curaNoDano) return "ataque";
  return "suporte";
}

/**
 * Cap. 2, seção 2-3: toda magia pode ser conjurada de três formas (Padrão,
 * Encurtada, Silenciosa), cada uma com seu próprio custo de Ações. Isso só
 * se aplica a magias (actions.encurtada/silenciosa vêm de MAGIC_ACTIONS) —
 * técnicas marciais e de Utilidade só têm a coluna "Padrão".
 */
export function CastingBreakdown({ ability, compacta = false }: { ability: AbilityDef; compacta?: boolean }) {
  const { actions } = ability;
  const hasCasting = actions.encurtada !== undefined || actions.silenciosa !== undefined;
  if (ability.reaction || !hasCasting) return null;

  // No livro, a regra das três formas está escrita UMA vez (Cap. 2, §2) e a
  // carta ensina a se ler (Cap. 3, "A carta de uma habilidade"). Repetir
  // "dano da Encurtada + 1 benefício (...)" nas 149 magias era a linha mais
  // longa de cada carta, em letra de rodapé. Aqui só vai o que muda de uma
  // magia pra outra: quantas Ações cada forma custa.
  if (compacta) {
    const formas: [string, string, string][] = [
      ["Padrão", actionText(actions.normal), "dano cheio"],
      [
        "Encurtada",
        ability.ritual || actions.encurtada === undefined ? "—" : actionText(actions.encurtada),
        ability.ritual ? "Ritual: não se encurta" : actions.encurtada === undefined ? "não existe no rank Imperador" : "metade do dano, área −1/3",
      ],
    ];
    if (actions.silenciosa !== undefined) {
      formas.push([
        "Silenciosa",
        typeof actions.silenciosa === "number" ? actionText(actions.silenciosa) : "1 Reação",
        "dano da Encurtada + 1 benefício de forma",
      ]);
    }
    return (
      <dl
        className={`livro-formas mt-2 grid ${formas.length === 3 ? "grid-cols-3" : "grid-cols-2"} divide-x divide-parchment-300 border-y border-parchment-300 text-center dark:divide-parchment-800 dark:border-parchment-800`}
      >
        {formas.map(([nome, valor, nota]) => (
          <div key={nome} title={nota} className="px-1 py-1">
            <dt className="text-3xs font-semibold uppercase tracking-wider text-parchment-500 dark:text-parchment-400">{nome}</dt>
            <dd className="text-xs font-bold text-parchment-800 dark:text-parchment-100">{valor}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className="print-hide mt-1.5 grid grid-cols-1 gap-x-3 gap-y-0.5 border-t border-dashed border-parchment-300 pt-1.5 text-2xs text-parchment-600 dark:border-parchment-800 dark:text-parchment-400 sm:grid-cols-3">
      <div>
        <dt className="inline font-semibold text-parchment-600 dark:text-parchment-300">Padrão </dt>
        <dd className="inline">{actionText(actions.normal)} · dano cheio</dd>
      </div>
      <div>
        <dt className="inline font-semibold text-parchment-600 dark:text-parchment-300">Encurtada </dt>
        <dd className="inline">
          {ability.ritual
            ? "Ritual — impossível"
            : actions.encurtada !== undefined
              ? `${actionText(actions.encurtada)} · metade do dano, área -1/3`
              : "Impossível (rank Imperador)"}
        </dd>
      </div>
      {actions.silenciosa !== undefined && (
        <div>
          <dt className="inline font-semibold text-parchment-600 dark:text-parchment-300">Silenciosa </dt>
          <dd className="inline">
            {typeof actions.silenciosa === "number" ? actionText(actions.silenciosa) : "1 Reação"} · dano da
            Encurtada + 1 benefício (dobrar alcance, mudar forma, ou segurar até 1 turno)
          </dd>
        </div>
      )}
    </dl>
  );
}

/**
 * Cap. 2, §2: o cântico, e o que recitá-lo bem paga.
 *
 * `rank` é opcional só por compatibilidade de assinatura — sem ele o gate de
 * tamanho não roda e a carta volta a prometer bônus pra qualquer cântico. As
 * três superfícies que renderizam isto (livro, ficha e mapa de árvores) têm o
 * rank em mãos e devem passá-lo sempre.
 */
export function IncantationBlock({ ability, rank }: { ability: AbilityDef; rank?: RankName }) {
  if (!ability.incantation) return null;

  const bonus = perfectRecitationBonus(ability, rank);
  const verses = ability.incantation.split("\\n").filter((v) => v.trim().length > 0);

  return (
    <div className="livro-cantico relative mt-2">
      <div className="absolute -top-3 left-2 -z-10 h-10 w-10 rounded-full bg-gold-500/20 ring-2 ring-gold-400/50 dark:bg-gold-500/10" />
      <blockquote className="relative rounded-lg border border-wine-300/30 bg-parchment-50/50 p-3 pl-6 ring-1 ring-inset ring-wine-300/10 dark:border-wine-800/30 dark:bg-parchment-900/50 dark:ring-wine-800/10">
        <div className="flex items-start gap-1.5">
          {/*
            A aspa é ORNAMENTO: ela abre visualmente o cântico e não diz nada
            que o `<blockquote>` já não diga. Fica `aria-hidden` porque um
            leitor de tela anunciando "aspas esquerdas" antes de cada um dos 149
            cânticos do livro é ruído puro — e o contraste dela (2,7:1) é baixo
            de propósito, o que só é aceitável justamente por ela não carregar
            informação.
          */}
          <span
            aria-hidden
            className="select-none font-serif text-2xl leading-none text-wine-500/70 dark:text-wine-400/70"
          >
            &ldquo;
          </span>
          <div className="whitespace-pre-line font-serif text-2xs italic leading-relaxed text-parchment-700 dark:text-parchment-300">
            {verses.map((v, i) => (
              <span key={i}>{v}</span>
            ))}
          </div>
        </div>
      </blockquote>
      {bonus?.ok === true && (
        <div className="livro-recitacao mt-2 inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-2.5 py-1 text-3xs font-semibold text-gold-700 ring-1 ring-gold-500/30 dark:text-gold-300 dark:ring-gold-500/20">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-gold-500" />
          </span>
          <span>Recitação Perfeita: {bonus.text}</span>
        </div>
      )}
      {bonus?.ok === false && (
        <div className="livro-recitacao livro-recitacao-sem mt-2 inline-flex items-center gap-1.5 rounded-full bg-parchment-500/10 px-2.5 py-1 text-3xs font-semibold text-parchment-600 ring-1 ring-parchment-500/30 dark:text-parchment-400">
          {/*
            O travessão é o "ícone" deste selo — quem carrega a informação é a
            frase ao lado. Vai `aria-hidden` pelo mesmo motivo da aspa do
            cântico, e ganhou fundo sólido (era `parchment-400/60`, que deixava
            o traço em 3,83:1 dentro de um círculo de 12px).
          */}
          <span
            aria-hidden
            className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-parchment-300 text-3xs leading-none text-parchment-900"
          >
            —
          </span>
          <span>{bonus.text}</span>
        </div>
      )}
    </div>
  );
}

/** Selo curto pra Ritual, quando a magia não puder ser encurtada nem interrompida pela metade sem consequência. */
export function RitualBadge({ ability }: { ability: AbilityDef }) {
  if (!ability.ritual) return null;
  return (
    <span className="shrink-0 rounded-full bg-gold-500/10 px-2 py-0.5 text-3xs font-semibold text-gold-700 ring-1 ring-gold-500/30 dark:text-gold-300">
      Ritual
    </span>
  );
}
