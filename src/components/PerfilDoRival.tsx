import type { CriaturaEncontro } from "@/lib/encounterSim";

export default function PerfilDoRival({ criatura, atualizar }: { criatura: CriaturaEncontro; atualizar: (patch: Partial<CriaturaEncontro>) => void }) {
  const perfil = criatura.perfilDeFicha;
  if (!perfil) return null;
  const pactos = perfil.pactos;
  const custoPreparado = pactos?.opcoes.filter((p) => pactos.preparados.includes(p.id)).reduce((s, p) => s + p.custo, 0) ?? 0;
  const pactosManuais = perfil.habilidades.filter((h) => h.nome.startsWith("Pacto: ") &&
    !pactos?.opcoes.some((p) => p.nome === h.nome.slice("Pacto: ".length)));
  function alternarPacto(id: string) {
    if (!pactos) return;
    const jaPreparado = pactos.preparados.includes(id);
    const preparados = jaPreparado ? pactos.preparados.filter((p) => p !== id) : [...pactos.preparados, id];
    const custo = pactos.opcoes.filter((p) => preparados.includes(p.id)).reduce((s, p) => s + p.custo, 0);
    if (preparados.length > pactos.limite || custo > perfil!.reservas.pm) return;
    atualizar({ perfilDeFicha: { ...perfil!, pactos: { ...pactos, preparados } } });
  }
  return (
    <section className="mt-3 rounded-xl border border-gold-500/40 bg-gold-50/50 p-3 dark:bg-gold-950/20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gold-800 dark:text-gold-300">Rival criado de ficha</h4>
        <span className="text-xs text-parchment-600 dark:text-parchment-300">
          {criatura.papel === "chefe" ? "Chefe único · PV dobrados · turnos extras conforme o grupo" : "Rival padrão · números da ficha"}
        </span>
      </div>
      <p className="mt-1 text-xs text-parchment-700 dark:text-parchment-300">
        {[perfil.raca, perfil.antecedente, ...perfil.arvores.map((a) => `${a.nome} (${a.rank})`)].filter(Boolean).join(" · ")}
      </p>
      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-parchment-800 dark:text-parchment-200">
        <span>PM {perfil.reservas.pm}</span><span>PT {perfil.reservas.pt}</span><span>PP {perfil.reservas.pp}</span>
        <span>Iniciativa {perfil.iniciativa >= 0 ? "+" : ""}{perfil.iniciativa}</span>
        <span>Resistência {criatura.bonusResistencia !== undefined && criatura.bonusResistencia >= 0 ? "+" : ""}{criatura.bonusResistencia ?? 0}</span>
      </div>
      <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">
        A simulação usa ataques e magias de até 4 Ações, cura, PV temporários, condições explícitas, efeitos elementais, Aparar, Fluxo e Pactos. Técnicas de 4 Ações exigem cântico e teste de Concentração se o rival sofrer dano. Habilidades que exigem escolhas fora do combate continuam descritas abaixo para o Mestre.
      </p>
      {perfil.fluxo && <p className="mt-2 text-xs text-parchment-700 dark:text-parchment-300">
        <b>Fluxo:</b> até {perfil.fluxo.usosPorRodada} contragolpes por rodada após erro corpo a corpo
        {perfil.fluxo.devolver ? "; Devolver gasta 1 PT para somar metade do dano do golpe que errou." : "."}
      </p>}
      {perfil.aparar && <p className="mt-1 text-xs text-parchment-700 dark:text-parchment-300">
        <b>Aparar:</b> uma Reação para somar +{perfil.aparar.bonusCA} à CA após a rolagem de um ataque corpo a corpo a até {perfil.aparar.alcance} m. Se o ataque errar, pode disparar Fluxo.
      </p>}
      {pactos && (
        <div className="mt-3 rounded-lg border border-gold-500/30 p-2">
          <h5 className="text-xs font-bold text-gold-800 dark:text-gold-300">Pactos de combate do invocador</h5>
          <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">
            Escolha até {pactos.limite} Pactos preparados antes da iniciativa. Os selecionados entram no combate, agem com 1 Ação própria por turno e custam {custoPreparado} PM no total. Pactos de apoio e efeitos especiais ficam descritos nas habilidades abaixo.
          </p>
          {pactos.emergencia && <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">
            Chamado de Emergência: {pactos.emergencia.acoes ?? 3} {(pactos.emergencia.acoes ?? 3) === 1 ? "Ação" : "Ações"}, {pactos.emergencia.custoBase} PM mais o adicional do Pacto. O invocado age a partir da próxima rodada{pactos.emergencia.semPenalidade ? " com PV e dano cheios" : " com metade dos PV e do dano"}{pactos.emergencia.duasVidas ? "; Duas Vidas permite chamá-lo de novo uma vez por combate" : ""}.
          </p>}
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {pactos.opcoes.map((p) => {
              const ativo = pactos.preparados.includes(p.id);
              const bloqueado = !ativo && (pactos.preparados.length >= pactos.limite || custoPreparado + p.custo > perfil.reservas.pm);
              return <label key={p.id} className={`flex items-start gap-2 rounded-md border p-2 text-xs ${ativo ? "border-gold-500/60 bg-gold-100/60 dark:bg-gold-950/30" : "border-parchment-300 dark:border-parchment-700"} ${bloqueado ? "opacity-50" : "cursor-pointer"}`}>
                <input type="checkbox" checked={ativo} disabled={bloqueado} onChange={() => alternarPacto(p.id)} className="mt-0.5 accent-wine-600" />
                <span><b>{p.nome}</b>{p.quantidade > 1 ? ` ×${p.quantidade}` : ""}<br />
                  {p.custo} PM · {p.pv} PV · CA {p.ca} · {p.golpes} {p.golpes === 1 ? "golpe" : "golpes"} de {p.dano}
                  {p.cdVeneno !== undefined ? ` · Envenenado se falhar Vigor CD ${p.cdVeneno}` : ""}
                </span>
              </label>;
            })}
          </div>
        </div>
      )}
      {pactosManuais.length > 0 && <div className="mt-2 rounded-lg border border-amber-500/40 bg-amber-50/50 p-2 text-xs dark:bg-amber-950/20">
        <b className="text-amber-900 dark:text-amber-200">Pactos para condução do Mestre</b>
        <p className="mt-1 text-parchment-700 dark:text-parchment-300">
          {pactosManuais.map((h) => h.nome.slice("Pacto: ".length)).join(" · ")}. Estes Pactos de apoio ou efeitos especiais estão na ficha abaixo, mas o relatório não mede o efeito deles; ajuste o encontro considerando sua atuação na mesa.
        </p>
      </div>}
      {perfil.habilidades.length > 0 && (
        <details className="mt-2 rounded-lg border border-parchment-300 p-2 dark:border-parchment-700">
          <summary className="cursor-pointer text-xs font-semibold text-parchment-800 dark:text-parchment-200">
            Outras habilidades da ficha ({perfil.habilidades.length})
          </summary>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {perfil.habilidades.map((h, i) => (
              <div key={`${h.nome}-${i}`} className="rounded-lg bg-parchment-50/70 p-2 text-xs dark:bg-parchment-900/50">
                <b className="text-parchment-900 dark:text-parchment-50">{h.nome}</b>
                <span className="ml-1 text-parchment-500">{h.tipo} · {h.origem}{h.custo ? ` · ${h.custo}` : ""}</span>
                {h.efeito && <p className="mt-1 whitespace-pre-line text-parchment-700 dark:text-parchment-300">{h.efeito}</p>}
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
