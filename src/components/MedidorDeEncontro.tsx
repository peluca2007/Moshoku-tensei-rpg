"use client";

import { useMemo } from "react";
import { TEMPERATURAS, orcamentoDeEncontro, pesoNoOrcamento, rotuloPatamar } from "@/data/bestiary";
import type { CriaturaEncontro } from "@/lib/encounterSim";

/**
 * O ORÇAMENTO DE ENCONTRO na tela — Apêndice G (0.1.90).
 *
 * ## Por que ele existe ao lado do simulador
 *
 * O simulador já responde "esse encontro mata a mesa?", e responde bem — só que
 * ele custa {BATALHAS} combates e alguns segundos, e por isso o Mestre só o roda
 * quando já terminou de montar. Este medidor responde a mesma pergunta em
 * aritmética pura, ENQUANTO ele monta: adicionou um lobo, a barra andou.
 *
 * Os dois não competem. O medidor é o orçamento do livro (uma conta que a mesa
 * pode fazer na mão, num guardanapo); o simulador é a medição. Quando os dois
 * discordam, quem manda é o simulador — e é por isso que o texto do medidor diz
 * "orçamento", e nunca "resultado".
 *
 * ## A barra
 *
 * Ela vai até 2× o orçamento, e não até o peso do encontro: uma barra que se
 * reescala sozinha esconde exatamente a informação que ela existe pra dar, que
 * é o quanto você passou do ponto. Acima de 2×, ela satura — e a essa altura o
 * número já disse tudo.
 */
export default function MedidorDeEncontro({
  criaturas,
  tamanhoDoGrupo,
  patamarDoGrupo,
}: {
  criaturas: CriaturaEncontro[];
  tamanhoDoGrupo: number;
  patamarDoGrupo: number | null;
}) {
  const { resultado, comReforcos } = useMemo(() => {
    if (patamarDoGrupo === null) return { resultado: null, comReforcos: null };
    const iniciais = criaturas.flatMap((c) => [
        { patamar: c.patamar, papel: c.papel, quantidade: c.quantidade, temImunidade: (c.imunidades ?? []).length > 0 },
        ...(c.perfilDeFicha?.pactos?.opcoes ?? [])
          .filter((p) => c.perfilDeFicha?.pactos?.preparados.includes(p.id))
          .map((p) => ({ patamar: p.patamar, papel: "lacaio" as const, quantidade: p.quantidade * c.quantidade, temImunidade: false })),
      ]);
    const reforcos = criaturas.flatMap((c) => {
      const perfil = c.perfilDeFicha;
      const pactos = perfil?.pactos;
      if (!perfil || !pactos?.emergencia) return [];
      let pm = perfil.reservas.pm - pactos.opcoes.filter((p) => pactos.preparados.includes(p.id))
        .reduce((s, p) => s + p.custo, 0);
      let vagas = Math.max(0, pactos.limite - pactos.preparados.length);
      const candidatos = pactos.opcoes.filter((p) => !pactos.preparados.includes(p.id))
        .sort((a, b) => pesoNoOrcamento(b.patamar, "lacaio", patamarDoGrupo) * b.quantidade -
          pesoNoOrcamento(a.patamar, "lacaio", patamarDoGrupo) * a.quantidade);
      const escolhidos = [];
      for (const p of candidatos) {
        const custo = pactos.emergencia.custoBase + Math.max(0, p.custo - 3);
        if (vagas && custo <= pm) {
          escolhidos.push({ patamar: p.patamar, papel: "lacaio" as const, quantidade: p.quantidade * c.quantidade, temImunidade: false });
          pm -= custo;
          vagas--;
        }
      }
      return escolhidos;
    });
    return {
      resultado: orcamentoDeEncontro(iniciais, tamanhoDoGrupo, patamarDoGrupo),
      comReforcos: reforcos.length ? orcamentoDeEncontro([...iniciais, ...reforcos], tamanhoDoGrupo, patamarDoGrupo) : null,
    };
  }, [criaturas, tamanhoDoGrupo, patamarDoGrupo]);

  if (!resultado || patamarDoGrupo === null) return null;

  const pct = Math.min(100, (resultado.razao / 2) * 100);
  const cor =
    resultado.temperatura === "facil"
      ? "bg-sky-500"
      : resultado.temperatura === "equilibrado"
        ? "bg-emerald-500"
        : resultado.temperatura === "dificil"
          ? "bg-amber-500"
          : "bg-rose-500";
  const texto =
    resultado.temperatura === "facil"
      ? "text-sky-700 dark:text-sky-300"
      : resultado.temperatura === "equilibrado"
        ? "text-emerald-700 dark:text-emerald-300"
        : resultado.temperatura === "dificil"
          ? "text-amber-700 dark:text-amber-300"
          : "text-rose-700 dark:text-rose-300";

  return (
    <div className="mt-3 rounded-xl border border-parchment-300 bg-parchment-50/70 p-3 dark:border-parchment-700 dark:bg-parchment-900/40">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-2xs font-black uppercase tracking-[0.14em] text-gold-700 dark:text-gold-300">
          Orçamento de Encontro
        </span>
        <span className={`font-display text-sm font-black ${texto}`}>
          {resultado.nome}
          <span className="ml-1.5 font-mono text-2xs font-normal opacity-70">
            {resultado.razao.toFixed(2).replace(".", ",")}×
          </span>
        </span>
      </div>

      {/* A régua: as três marcas são os limites das temperaturas, em 2× de escala. */}
      <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-parchment-900/10 dark:bg-white/10">
        <div className={`h-full rounded-full transition-all ${cor}`} style={{ width: `${pct}%` }} />
        {TEMPERATURAS.filter((t) => Number.isFinite(t.ate)).map((t) => (
          <span
            key={t.id}
            aria-hidden
            title={`${t.nome}: até ${t.ate.toFixed(2).replace(".", ",")}×`}
            className="absolute top-0 h-full w-px bg-parchment-900/25 dark:bg-white/25"
            style={{ left: `${(t.ate / 2) * 100}%` }}
          />
        ))}
      </div>

      <p className="mt-1.5 text-2xs leading-relaxed text-parchment-600 dark:text-parchment-400">
        {resultado.descricao}
      </p>
      {comReforcos && <p className="mt-1 text-2xs leading-relaxed font-semibold text-amber-800 dark:text-amber-300">
        Com Chamados de Emergência possíveis: {comReforcos.nome} ({comReforcos.razao.toFixed(2).replace(".", ",")}×).
        Estimativa de reforços com as vagas e PM iniciais; a simulação acompanha as invocações durante a luta.
      </p>}
      <p className="mt-1 text-3xs leading-relaxed text-parchment-500 dark:text-parchment-400">
        Este encontro pesa <b>{resultado.peso.toFixed(2).replace(".", ",")}</b> contra um orçamento de{" "}
        <b>{resultado.orcamento}</b> — uma criatura de {rotuloPatamar(patamarDoGrupo)} por jogador
        (Apêndice G). Uma acima vale duas; uma abaixo, meia; um Chefe vale cinco; Imunidade conta como um
        patamar acima. Pactos preparados entram como lacaios nesta régua aproximada; a simulação usa os PV, ataques e PM reais deles. A conta não enxerga terreno nem quem age primeiro — pra isso, rode a simulação.
      </p>
    </div>
  );
}
