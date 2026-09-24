"use client";

import { Info, X } from "lucide-react";
import { useRef } from "react";
import { BATALHAS_ENCONTRO } from "@/lib/encounterReport";

const SUMARIO = [
  { id: "guia-montagem", numero: "01", titulo: "Monte o encontro" },
  { id: "guia-regua", numero: "02", titulo: "Leia a régua" },
  { id: "guia-cenario", numero: "03", titulo: "Defina o cenário" },
  { id: "guia-simulacao", numero: "04", titulo: "Entenda a simulação" },
  { id: "guia-rivais", numero: "05", titulo: "Use fichas como chefes" },
  { id: "guia-resultado", numero: "06", titulo: "Leia o resultado" },
  { id: "guia-decisoes", numero: "07", titulo: "Decisões e limites" },
] as const;

function Titulo({ id, numero, children }: { id: string; numero: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-6 flex items-center gap-3 text-base font-black text-parchment-900 dark:text-parchment-50">
      <span className="font-mono text-xs text-wine-600 dark:text-wine-300">{numero}</span>{children}
    </h3>
  );
}

export default function EncounterExplanation() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function irPara(id: string) {
    dialogRef.current?.querySelector<HTMLElement>(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} aria-haspopup="dialog"
        className="flex items-center gap-2 rounded-lg border border-parchment-300 bg-parchment-100 px-3 py-2 text-sm font-medium text-parchment-700 transition-colors hover:bg-parchment-200 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-300 dark:hover:bg-parchment-800">
        <Info className="h-4 w-4" aria-hidden="true" />Como funciona?
      </button>

      <dialog ref={dialogRef} aria-labelledby="explicacao-encontro-titulo" aria-describedby="explicacao-encontro-resumo"
        className="fixed inset-0 m-auto max-h-[min(92vh,56rem)] w-[min(58rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-parchment-300 bg-parchment-50 p-5 text-parchment-800 shadow-2xl backdrop:bg-black/70 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-200 sm:p-7">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-3xs font-bold uppercase tracking-[0.18em] text-wine-700 dark:text-wine-300">Guia do Mestre</p>
            <h2 id="explicacao-encontro-titulo" className="mt-1 text-2xl font-black text-parchment-900 dark:text-parchment-50 sm:text-3xl">
              Como Encontros funciona
            </h2>
          </div>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar explicação"
            className="shrink-0 rounded-lg p-2 text-parchment-600 hover:bg-parchment-200 dark:text-parchment-300 dark:hover:bg-parchment-800">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <p id="explicacao-encontro-resumo" className="mt-4 max-w-3xl text-sm leading-relaxed text-parchment-700 dark:text-parchment-300">
          Monte uma cena com o seu grupo, confira o orçamento e teste {BATALHAS_ENCONTRO} versões da luta. A ferramenta ajuda a prever a dificuldade e deixa os lances importantes no relatório; o Mestre continua decidindo o que acontece na mesa.
        </p>

        <nav aria-label="Sumário de Como Encontros funciona" className="mt-5 rounded-xl border border-parchment-300 bg-parchment-100/70 p-4 dark:border-parchment-700 dark:bg-parchment-900/60">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-gold-700 dark:text-gold-300">Neste guia</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SUMARIO.map((item) => (
              <button key={item.id} type="button" onClick={() => irPara(item.id)}
                className="rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 text-left text-xs font-semibold text-parchment-800 transition-colors hover:border-wine-400 hover:bg-parchment-200 focus-visible:outline-2 focus-visible:outline-wine-500 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-200 dark:hover:bg-parchment-800">
                <span className="mr-2 font-mono text-wine-600 dark:text-wine-300">{item.numero}</span>{item.titulo}
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-7 space-y-7 text-sm leading-relaxed">
          <section aria-labelledby="guia-montagem">
            <Titulo id="guia-montagem" numero="01">Monte o encontro</Titulo>
            <p className="mt-2">Escolha as fichas do <strong>Grupo</strong> e adicione as <strong>Criaturas</strong> que ele vai enfrentar. Você pode criar um monstro pelo patamar e arquétipo, puxá-lo do bestiário ou transformar uma ficha do roster em rival. Quantidade importa: três cópias são três combatentes, com PV e turnos separados.</p>
            <p className="mt-2">Uma criatura do molde usa os números do Apêndice G. Um rival criado de ficha usa os números da própria ficha. Depois de importar, você pode editar o rival sem modificar o personagem original; mudanças futuras na ficha também não reescrevem o encontro salvo.</p>
          </section>

          <section aria-labelledby="guia-regua">
            <Titulo id="guia-regua" numero="02">Leia a régua de orçamento</Titulo>
            <p className="mt-2">A barra muda enquanto você monta a cena. Ela compara o peso das criaturas com o tamanho e o patamar do grupo: uma criatura do mesmo patamar por jogador é a referência; cada patamar acima dobra o peso, cada patamar abaixo o reduz à metade, e um Chefe vale três criaturas do seu patamar. Imunidade eleva o patamar efetivo nessa conta.</p>
            <p className="mt-2">Pactos preparados contam como lacaios. Se um invocador puder usar Chamado de Emergência, a tela mostra uma segunda estimativa com reforços que cabem nas vagas e nos PM iniciais. Essa régua é uma aproximação rápida: não conhece rolagens, iniciativa, terreno ou a ordem em que os Pactos caem e voltam.</p>
          </section>

          <section aria-labelledby="guia-cenario">
            <Titulo id="guia-cenario" numero="03">Defina o cenário</Titulo>
            <p className="mt-2">Em <strong>Detalhes do cenário</strong>, escolha a distância inicial, terreno difícil e condições já presentes. Com distância definida, o combatente verifica alcance e pode gastar uma Ação para se aproximar; terreno difícil reduz esse deslocamento. Sem distância, o posicionamento fica abstrato. Áreas atingem os alvos elegíveis do lado oposto, sem desenhar formas num mapa.</p>
            <p className="mt-2">Essas escolhas mudam o teste. Um Ladino que começa Escondido, uma linha de frente distante e um alvo já Molhado podem produzir lutas bem diferentes com as mesmas fichas.</p>
          </section>

          <section aria-labelledby="guia-simulacao">
            <Titulo id="guia-simulacao" numero="04">Entenda a simulação</Titulo>
            <p className="mt-2"><strong>Testar o encontro</strong> repete a luta {BATALHAS_ENCONTRO} vezes, com rolagens próprias em cada batalha. O motor rola iniciativa, acertos, dano e resistências; resolve três Ações por turno como regra geral, Surpreso, reações e turnos extras de chefes. Ele paga PM, PT e PP quando a técnica exige e deixa de escolhê-la se a reserva acabar.</p>
            <p className="mt-2">A escolha automática privilegia dano médio por Ação e ações em área quando há vários alvos. Cura procura aliados com até metade dos PV; proteção dá PV temporários a quem ainda não os tem. Magias de quatro Ações atravessam turnos como cântico, e sofrer dano exige Concentração. A luta termina com vitória, queda do grupo ou empate após 20 rodadas.</p>
            <p className="mt-2">Criaturas com ações resolvíveis rolam essas ações. As que não têm ações resolvíveis usam o orçamento fixo de dano por turno do livro. O relatório abre batalhas representativas com os dados e motivos de cada golpe. Repetir o mesmo encontro com a mesma semente reproduz os resultados.</p>
          </section>

          <section aria-labelledby="guia-rivais">
            <Titulo id="guia-rivais" numero="05">Use fichas como chefes</Titulo>
            <p className="mt-2">Na importação, escolha <strong>Rival padrão</strong> para manter os PV da ficha ou <strong>Chefe único</strong> para dobrá-los e receber os turnos extras previstos no Apêndice G. Ataques, magias de dano, cura e PV temporários de até quatro Ações são convertidos com seus custos, alcance e CD. O perfil guarda árvores, atributos, reservas e o texto das habilidades que ainda precisam da mesa.</p>
            <p className="mt-2"><strong>Invocador:</strong> selecione Pactos de combate preparados antes da iniciativa. Eles pagam PM, têm PV e iniciativa próprios e agem com uma Ação por turno. Chamado de Emergência pode invocar outro Pacto durante a luta; Círculo Improvisado, Convocação Aprimorada, Pacto Firmado e Duas Vidas modificam custo, tempo ou força conforme a ficha.</p>
            <p className="mt-2"><strong>Água e Fogo:</strong> uma magia que aplica Molhado apaga Em Chamas; fogo seca o alvo Molhado; a parcela fria dobra contra Molhado. Em Chamas só é aplicado quando a carta manda, inclusive apenas na falha se esse for o gatilho. Aparar e Fluxo do Deus da Água também funcionam nas reações do rival.</p>
          </section>

          <section aria-labelledby="guia-resultado">
            <Titulo id="guia-resultado" numero="06">Leia o resultado</Titulo>
            <p className="mt-2">A <strong>taxa de vitória</strong> é a parcela das {BATALHAS_ENCONTRO} batalhas em que o grupo derrotou todas as criaturas. O relatório também mostra derrotas, empates, rodadas, quedas e PV restantes. A faixa estatística expressa a incerteza dessa amostra de simulações; ela não mede decisões ou regras deixadas fora do modelo.</p>
            <p className="mt-2">Abra os registros para entender <em>por que</em> o grupo venceu ou caiu: custos pagos, condições, reações, testes e dano aparecem no contexto do turno. Se houver sugestão de ajuste, a ferramenta testa uma escala de PV e dano e mostra a faixa projetada. A criatura só muda quando você aplica a sugestão.</p>
          </section>

          <section aria-labelledby="guia-decisoes" className="rounded-xl border border-gold-500/30 bg-gold-50/50 p-4 dark:bg-gold-950/20">
            <Titulo id="guia-decisoes" numero="07">Decisões e limites do modelo</Titulo>
            <p className="mt-2">O orçamento responde depressa enquanto você monta; a simulação responde melhor depois que a cena está pronta. A inteligência de combate segue regras previsíveis de alvo, dano e suporte, em vez de adivinhar a estratégia dos jogadores. Por isso, uma porcentagem é uma medida sob estas escolhas, não uma promessa do que acontecerá na sessão.</p>
            <p className="mt-2">O motor resolve as condições que estão estruturadas nas ações, como Molhado, Em Chamas, Preso, Caído, Envenenado e Quebrantado. Geometria exata, voo, empurrões, Pactos de apoio, escolhas narrativas de talentos e reações específicas além das implementadas pedem condução do Mestre. O perfil do rival deixa esses textos acessíveis; efeitos que só ocorrem ao atravessar um muro, por exemplo, não viram dano imediato na simulação.</p>
          </section>
        </div>

        <footer className="mt-7 flex justify-end border-t border-parchment-300 pt-4 dark:border-parchment-700">
          <button type="button" onClick={() => dialogRef.current?.close()}
            className="rounded-lg bg-wine-600 px-5 py-2 font-semibold text-white hover:bg-wine-500">Entendi</button>
        </footer>
      </dialog>
    </>
  );
}
