import { INCANTATION_LENGTH, RANKS } from "@/lib/types";
import { MAGIC_ACTIONS } from "@/data/trees/shared";
import { COMBINED_SPELLS } from "@/data/combinedSpells";
import { getTreeById } from "@/data/trees";
import { Aside, BookTable, ChapterTitle, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";

function tex(s: string): string {
  return s
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

function actionsCell(rank: (typeof RANKS)[number]) {
  const a = MAGIC_ACTIONS[rank];
  return `${a.normal} Ações`;
}

export default function Chapter2() {
  return (
    <div className="space-y-8">
      <ChapterTitle id="cap2">Capítulo 2 — As Leis da Magia</ChapterTitle>

      <Section>
        <SectionTitle id="cap2-1">1. As Categorias da Magia</SectionTitle>
        <P>
          O pilar da Magia tem <b>oito escolas</b>, divididas em dois grupos:
        </P>
        <List
          items={[
            <span key="of">
              <b>Magia Ofensiva (4 escolas):</b> os quatro elementos clássicos — Água, Fogo, Terra e Vento. É
              onde mora a maior quantidade de feitiços do livro.
            </span>,
            <span key="su">
              <b>Magia de Suporte (4 escolas):</b> Cura, Desintoxicação, Barreira e Invocação. Invocação é a
              menor lista de feitiços do livro, e a única cujo efeito principal age sozinho depois de
              conjurado.
            </span>,
          ]}
        />
        <P className="text-sm">
          Os dois grupos usam exatamente as mesmas regras: a mesma tabela de PM, o mesmo tempo de conjuração,
          o mesmo Bônus de Rank. A divisão é de assunto, não de mecânica.
        </P>
        <Aside title="Quão raro é um mago">
          Apenas 1 em cada 20 pessoas nasce com capacidade de manipular mana. Dessas, apenas 1 em cada 20
          consegue treinar o suficiente pra virar mago de verdade — cerca de 1 pessoa em 400. De cada cem
          magos formados, só um completa os estudos até o rank Avançado: um mago Avançado é aproximadamente
          1 em 40.000 pessoas.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap2-2">2. A Regra de Encantamentos</SectionTitle>
        <P>
          A regra de ouro: o poder da magia depende do encantamento e do tempo gasto para conjurá-la. O
          tamanho do encantamento é proporcional ao rank — quanto maior, mais longo o cântico.
        </P>
        <List
          items={[
            <span key="p"><b>Conjuração Padrão:</b> recita o cântico inteiro. 100% do efeito.</span>,
            <span key="e"><b>Encantamento Encurtado:</b> pula versos intencionalmente. Mais rápido, mas instável.</span>,
            <span key="s"><b>Conjuração Silenciosa:</b> manipula a mana diretamente, sem palavra alguma. O método mais raro e mais flexível.</span>,
          ]}
        />
        <Warning title="Penalidade do Encantamento Encurtado">
          Ao encurtar, role metade dos dados de dano (arredondado pra baixo) e a área de efeito é reduzida
          em um terço. O BC continua sendo somado integralmente — a maestria não some, só a estrutura do
          feitiço fica instável.
        </Warning>
        <Aside title="Conjuração Silenciosa — regra completa, sem exceção escondida">
          <P>
            Conjurar em silêncio sempre faz exatamente estas quatro coisas ao mesmo tempo, nesta ordem de
            leitura:
          </P>
          <List
            items={[
              <span key="1">
                <b>Custo de Ação:</b> sempre usa a coluna &quot;Silenciosa&quot; da tabela da seção 3 —
                sempre mais rápida que a Padrão, e <b>nunca mais lenta</b> que a Encurtada. Nos dois
                primeiros patamares as duas empatam em 1 Ação (e no Principiante a Silenciosa ainda ganha a
                primeira do turno de graça); do Avançado em diante a Silenciosa abre vantagem de verdade.
              </span>,
              <span key="2">
                <b>Dano:</b> metade dos dados, arredondado pra baixo — o mesmo valor do Encantamento
                Encurtado, nunca mais que isso por padrão.
              </span>,
              <span key="3">
                <b>Área:</b> reduzida em um terço — de novo, o mesmo valor do Encantamento Encurtado.
              </span>,
              <span key="4">
                <b>Bônus de Forma (sempre incluso, nunca opcional de pagar):</b> escolha um, de graça, toda
                vez que conjurar em silêncio — dobrar o alcance, mudar o formato da área (linha ↔ cone ↔
                esfera), ou segurar o disparo por até 1 turno.
              </span>,
            ]}
          />
          <P>
            <b>Quando um talento ou Antecedente diz &quot;sem sofrer a penalidade de dano/área&quot;</b>, ele
            remove só o item 2 e/ou o item 3 — exatamente os que ele nomear. Os itens 1 e 4 nunca são
            removidos por nada, porque eles não são a penalidade: são a definição estrutural do próprio
            método. Um personagem com &quot;Conjuração Silenciosa sem penalidade de dano nem de área&quot;
            (ex: Antecedente Gênio) continua com o custo de Ação reduzido do item 1 <i>e</i> ainda escolhe o
            bônus de forma do item 4 — ele não perde nada, só ganha a remoção explícita do que foi citado.
          </P>
          <P>
            A Conjuração Silenciosa não é comprável com PA — vem de um Antecedente, de uma raça, ou de uma
            Maestria de Rank alto.
          </P>
        </Aside>
        <Warning title="A única exceção à regra de &ldquo;não existe ação bônus&rdquo;">
          <P>
            O Capítulo 4 §3 diz que tudo neste sistema é medido em Ações e que <b>não existe ação bônus</b>.
            A Conjuração Silenciosa de rank Principiante é a única exceção nomeada do livro: a primeira
            delas em cada turno é <b>gratuita</b>.
          </P>
          <P>
            Ela existe porque, sem ela, conjurar em silêncio num rank baixo custaria uma Ação inteira pra
            entregar metade dos dados e dois terços da área — ninguém usaria nunca, e o método mais
            característico do mundo de Mushoku Tensei morreria na ficha. Vale só pro rank Principiante,
            só pra primeira do turno, e o livro não abre nenhuma outra: se você encontrar qualquer outra
            coisa que se comporte como ação bônus, é erro de texto, não regra.
          </P>
          <P>
            <b>E ela não conta no Teto de Ações</b> (Cap. 4, §4: 5 por turno, no máximo 2 externas). Ela não
            gasta Ação nenhuma, então não há Ação pra contar — mas ela também não é uma das 2 externas, e um
            Imperador de magia continua limitado a uma por turno, do rank mais fraco que ele conhece.
          </P>
        </Warning>

        <SubTitle id="cap2-2-recitacao">O Bônus de Recitação Perfeita</SubTitle>
        <P>
          Toda e qualquer magia do jogo possui um encantamento escrito que deve ser verbalizado durante a conjuração.
          Se o jogador recitar o encantamento completo em voz alta na mesa de forma <b>fluida, sem gaguejar e sem ler da ficha</b> (critério do Mestre),
          ele recebe uma recompensa mecânica direta e proporcional ao tipo da magia:
        </P>
        <List
          items={[
            <span key="atk"><b>Ataque Mágico (com rolagem de acerto):</b> ganha <b>Vantagem</b> no teste de acerto contra a CA do alvo.</span>,
            <span key="save"><b>Feitiço que impõe Teste de Resistência:</b> concede <b>+2 na CD</b> para os alvos resistirem.</span>,
            <span key="rit"><b>Ritual ou Feitiço sem rolagem (suporte, barreira, cura):</b> <b>recupera PM igual ao seu Bônus de Rank</b> na respectiva escola.</span>,
            <span key="enc"><b>Em Conjuração Encurtada ou Silenciosa:</b> se recitar perfeitamente o cântico original, ignora a penalidade de dados e área daquele lançamento.</span>,
          ]}
        />
        <P className="text-xs text-parchment-600 dark:text-parchment-400 italic">
          Esta mesma regra se aplica às <b>Canções de Bardo</b> (Árvore de Utilidade): cantar os versos da canção com maestria concede o mesmo benefício correspondente.
        </P>

        <SubTitle id="cap2-2-cantico-curto">Cântico Curto — a magia que não paga bônus</SubTitle>
        <P>
          O bônus acima é a recompensa mais forte que este livro entrega de graça, e ele tem um preço:{" "}
          <b>tempo real de mesa</b>. Recitar trinta segundos de verso na frente do grupo, sem gaguejar e sem
          ler, é difícil — e é justamente por ser difícil que vale Vantagem. Por isso existe um piso:
        </P>
        <Warning title="A regra">
          <P>
            Uma magia cujo cântico for <b>mais curto que o piso do rank dela</b> (tabela abaixo){" "}
            <b>não concede o Bônus de Recitação Perfeita</b>, por melhor que você recite. A carta dela diz,
            com todas as letras, <b>&ldquo;Sem bônus&rdquo;</b>.
          </P>
          <P>
            Isso não é punição, e não é erro de escrita: são as <b>magias rápidas de propósito</b>. Prontidão
            é uma Reação — um cântico de 140 caracteres a tornaria impossível de usar. Rejeitar a Morte
            dispara no instante em que o aliado cairia. Luz Absoluta sai em 3 Ações onde o rank Imperador
            pede 6. Nessas magias <b>a velocidade já É o benefício</b>, e o livro não paga as duas coisas.
          </P>
        </Warning>
        <BookTable
          headers={["Rank da Magia", "Piso do cântico (concede bônus a partir daqui)", "Teto de estilo"]}
          rows={RANKS.map((rank) => [
            rank,
            `${INCANTATION_LENGTH[rank].min} caracteres`,
            `${INCANTATION_LENGTH[rank].max} caracteres`,
          ])}
        />
        <Aside title="Por que este piso existe">
          <P>
            Até a versão 0.0.3 o bônus era automático: bastava a magia ter um cântico escrito. Uma auditoria
            das 149 magias do livro encontrou <b>55 com cântico abaixo do piso do próprio rank</b> —
            Barreira, Cura, Desintoxicação, Invocação e Bardo estavam quase inteiras fora da escada.{" "}
            <i>&ldquo;Não caias. Ainda não. Prontidão!&rdquo;</i> tem 35 caracteres e pagava exatamente o
            mesmo que um cântico de 380 do rank Rei.
          </P>
          <P>
            O efeito colateral era pior que o desequilíbrio: o sistema estava <b>premiando quem escrevesse
              cânticos curtos</b>, que é o oposto exato do que este capítulo promete quando diz que o tamanho
            é proporcional ao poder. Com o piso, a escada volta a significar alguma coisa — e escrever um
            cântico curto passou a ser uma <i>escolha de design</i> declarada, com uma consequência visível
            na carta, em vez de um atalho invisível.
          </P>
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap2-6">6. Interromper uma Conjuração</SectionTitle>
        <P>
          Uma magia de rank Santo custa 4 Ações; uma de Imperador, 6. Como o Capítulo 4 permite dividir o
          cântico entre turnos, o conjurador passa rodadas inteiras <b>vulnerável e visível</b> antes de o
          feitiço sair. Esta seção diz o que acontece nesse intervalo — e até esta versão o livro não dizia,
          o que deixava a mesa inventando uma regra diferente por combate.
        </P>

        <SubTitle>Quando você está Conjurando</SubTitle>
        <P>
          Do instante em que você gasta a primeira Ação de uma magia até o instante em que ela sai, você está{" "}
          <b>Conjurando</b>. Enquanto estiver:
        </P>
        <List
          items={[
            <span key="v"><b>Você é visível e audível.</b> Qualquer criatura que te veja ou te ouça sabe que uma magia está sendo preparada, e o Mestre deve dizer o rank aparente dela (pelo tamanho do cântico). Conjuração Silenciosa é a exceção: ninguém percebe.</span>,
            <span key="a"><b>Você não pode fazer mais nada.</b> Mover-se metade do Deslocamento é permitido; atacar, usar item, conjurar outra magia ou usar Reação, não. Usar uma Reação encerra a conjuração na hora.</span>,
            <span key="c"><b>Você não perde o progresso ao ser atacado</b> — perde ao <i>falhar no teste abaixo</i>. Sofrer dano não interrompe automaticamente.</span>,
          ]}
        />

        <SubTitle>O Teste de Concentração</SubTitle>
        <Warning title="A regra">
          <P>
            Sempre que você <b>sofrer dano</b> enquanto estiver Conjurando, faça um{" "}
            <b>teste de resistência de Espírito</b> contra <b>CD 8 + metade do dano sofrido</b> (arredondado
            pra baixo).
          </P>
          <List
            items={[
              <span key="s"><b>Sucesso:</b> o cântico segue. As Ações já gastas continuam valendo.</span>,
              <span key="f"><b>Falha:</b> a conjuração é interrompida. Você perde <b>todas as Ações já gastas</b> e <b>metade do PM</b> da magia, arredondado pra cima. A magia não acontece.</span>,
            ]}
          />
        </Warning>
        <P>
          <b>Meia dúzia de flechas não derruba um Imperador.</b> Um tiro de 6 de dano pede CD 11, que um
          conjurador de rank alto passa quase sempre. Um Deus da Espada entregando 60 de dano num turno pede
          CD 38, que ninguém passa. É exatamente esse o desenho: <b>o preço de conjurar devagar é ter alguém
            segurando a linha de frente</b>, e a única coisa que realmente interrompe um apocalipse é outro
          apocalipse.
        </P>
        <Aside title="Quatro coisas que a CD já resolve, pra não virarem regra nova">
          <List
            items={[
              "Dano em área que atinge o conjurador conta uma vez, pelo total, não uma vez por fonte.",
              "Dano contínuo (Em Chamas, veneno, magma) força o teste no início do turno, quando cobra.",
              "Ficar Atordoado, Paralisado, Incapacitado, Surdo ou Soterrado interrompe SEM teste — o cântico exige voz e postura. Congelado e Atolado não interrompem: você continua falando.",
              "Ser empurrado, derrubado ou movido contra a vontade interrompe sem teste se você sair do alcance ou perder a linha de visão do alvo declarado.",
            ]}
          />
        </Aside>

        <SubTitle>Interromper de Propósito</SubTitle>
        <BookTable
          headers={["Como", "Quem consegue", "O que acontece"]}
          rows={[
            [
              "Bater forte",
              "Qualquer um",
              "Não existe manobra especial: cause dano e deixe a CD trabalhar. Contra um conjurador, concentrar o dano num golpe só vale mais que espalhá-lo em três.",
            ],
            [
              "Vácuo Localizado (Vento, Principiante)",
              "Magia de Vento",
              "Remove o ar em volta da cabeça: o alvo não recita nada por 1 turno. Interrompe sem teste, e é a forma mais barata do livro.",
            ],
            [
              "Selado (Barreira)",
              "Magia de Barreira",
              "Não interrompe — impede. Magia acima do rank da barreira gasta as Ações e o PM e falha sozinha, sem chegar a existir.",
            ],
            [
              "Anulação (Barreira, Imperador)",
              "Magia de Barreira",
              "1 Reação e 4 PM anulam qualquer magia de rank Imperador ou inferior no instante em que é conjurada, sem teste. O conjurador perde PM e Ações.",
            ],
            [
              "Corte de Braço (Deus da Espada, Principiante)",
              "Estilo Deus da Espada",
              "Não impede o cântico, mas derruba o foco: o dano do golpe entra normalmente no Teste de Concentração, e conjuradores têm PV baixo.",
            ],
          ]}
        />
        <Warning title="Ritual não se interrompe pela metade — se perde inteiro">
          Uma magia marcada como <b>Ritual</b> não pode ser encurtada nem retomada. Se a conjuração for
          interrompida em qualquer ponto, o ritual <b>falha por completo</b>: perde-se o PM inteiro (não a
          metade) e todo o tempo investido. Em compensação, um ritual conduzido fora de combate, sem ninguém
          por perto, nunca exige teste nenhum.
        </Warning>
      </Section>

      <Section>
        <SectionTitle id="cap2-7">7. Regras Gerais de Conjuração</SectionTitle>
        <P>
          As perguntas que toda mesa faz na primeira sessão, respondidas de uma vez. Nada aqui é novo em
          espírito — é o que o livro já pressupunha, escrito onde dá pra achar.
        </P>
        <BookTable
          headers={["Pergunta", "Resposta"]}
          rows={[
            [
              "Preciso ver o alvo?",
              "Sim, salvo quando a magia disser o contrário. Sem linha de visão você pode mirar um PONTO que enxergue (o centro de uma área), nunca uma criatura específica. Cobertura Total bloqueia; Cobertura parcial, não.",
            ],
            [
              "Posso conjurar em corpo a corpo?",
              "Pode, e sem penalidade — este livro não copia a regra de ataque de oportunidade por conjurar. O risco já está no Teste de Concentração: quem está adjacente é quem mais facilmente te faz falhar nele.",
            ],
            [
              "Preciso das mãos livres?",
              "Não. O cântico é a voz, e a Conjuração Silenciosa é a mana. Mãos importam só onde a magia disser (Toque, ou um Ritual que exija desenho).",
            ],
            [
              "Posso segurar a magia pronta?",
              "Só com Conjuração Silenciosa, e por no máximo 1 turno — é um dos três Bônus de Forma dela (§2). Fora isso, magia conjurada sai na hora.",
            ],
            [
              "Quantas magias posso sustentar?",
              "Uma. Erguer uma segunda derruba a primeira, salvo Maestria que diga o contrário (Barreira do Intermediário sustenta duas; Cura do Santo, duas). Sustentar não gasta Ação, mas cai se você for Incapacitado ou cair a 0 PV.",
            ],
            [
              "E se eu ficar sem PM no meio?",
              "Você não pode começar uma magia que não consegue pagar. O PM é debitado quando a conjuração COMEÇA, não quando termina — é por isso que ser interrompido devolve só metade.",
            ],
            [
              "Falha crítica (1 natural) em magia?",
              "A magia falha e o PM se perde. Não existe tabela de acidente mágico neste livro — a Maestria de Intermediário da Água é a única exceção, e ela existe justamente pra dizer que falhar em silêncio é um privilégio que se compra.",
            ],
            [
              "Duas magias iguais no mesmo alvo?",
              "O efeito não empilha: vale o maior, e a duração é reiniciada. Isso vale para condições, PV temporários e barreiras.",
            ],
          ]}
        />
      </Section>

      <Section>
        <SectionTitle id="cap2-3">3. Tempo de Conjuração por Rank</SectionTitle>
        <P>
          A tabela abaixo governa o tempo padrão de Ações por rank da magia. No entanto, <b>nem toda magia segue rigidamente esta tabela</b>:
          magias rituais de rank baixo podem exigir mais Ações, e magias imperiais concentradas podem custar menos Ações pagando um custo de PM substancialmente maior.
        </P>
        <BookTable
          headers={["Rank da Magia", "Padrão", "Encurtada", "Silenciosa"]}
          rows={RANKS.map((rank) => [
            rank,
            actionsCell(rank),
            MAGIC_ACTIONS[rank].encurtada !== undefined ? `${MAGIC_ACTIONS[rank].encurtada} Ação(ões)` : "Impossível",
            typeof MAGIC_ACTIONS[rank].silenciosa === "number"
              ? `${MAGIC_ACTIONS[rank].silenciosa} Ação(ões)${rank === "Principiante" ? " (a 1ª do turno é gratuita)" : ""}`
              : "1 Reação",
          ])}
        />
        <P>
          Como o Capítulo 4 permite dividir o cântico entre turnos, magias de 4, 5 ou 6 Ações são
          perfeitamente jogáveis — elas só exigem que alguém segure a linha de frente enquanto o apocalipse é
          preparado.
        </P>
      </Section>

      <Section>
        <SectionTitle id="cap2-4">4. Combinações entre Árvores</SectionTitle>
        <P>
          Duas árvores em Rank Avançado ou superior não competem pelo mesmo personagem — elas se somam. Esta
          seção cobre a versão mais canônica disso (Magia Combinada) e depois abre a mesma lógica pro resto
          do livro: Corpo, Utilidade, e as combinações entre pilares diferentes.
        </P>

        <SubTitle>Magia Combinada</SubTitle>
        <P>
          Magias Combinadas são feitiços compostos por duas ou mais magias de ataque conjuradas em
          sequência, cujo resultado é maior que a soma das partes. O sistema detalhado e os efeitos
          fixos destas magias estão documentados na tabela abaixo — a fusão oficial de cada pilar.
        </P>
        <P>
          <b>Requisito:</b> rank Avançado ou superior em <b>ambas</b> as escolas envolvidas.
          Nenhuma destas magias é aprendida por PA; elas são destravadas pela Maestria do rank
          Avançado e cada uma custa PA igual ao custo da assinatura na árvore-primária + 1.
        </P>
        <BookTable
          headers={["Combinação", "Primária", "Efeito"]}
          rows={COMBINED_SPELLS.map((s) => [tex(s.name), tex(getTreeById(s.primaryTreeId)?.name ?? ""), tex(s.effect)])}
        />
        <P>
          Para combinações ad-hoc (não documentadas na tabela), a regra de ouro do Mestre vale:
        </P>
        <Aside title="Regra de Ouro para o Mestre">
          Se o jogador descrever uma combinação que faz sentido físico, deixe funcionar e invente o efeito na
          hora. Este sistema recompensa quem pensa como cientista — foi assim que Rudeus criou metade do
          arsenal dele. A mesma regra vale pra toda a seção abaixo (Combinações Além da Magia), não só pra
          Magia Combinada.
        </Aside>

        <SubTitle>Combinações Além da Magia</SubTitle>
        <P>
          A mesma lógica funciona entre <i>qualquer</i> duas árvores em Rank Avançado ou superior, mesmo
          cruzando pilares diferentes (Magia + Corpo, Magia + Utilidade, Corpo + Utilidade) — o livro só não
          documentava isso antes. O requisito e o custo são os mesmos: Avançado ou superior nas duas árvores
          envolvidas, e você paga o custo de cada lado inteiro (Ação, PM, PT ou PP, o que for de cada árvore).
          O efeito nunca é permanente, a menos que a tabela diga o contrário.
        </P>
        <BookTable
          headers={["Combinação", "Resultado", "Efeito"]}
          rows={[
            ["Deus da Espada + Magia de Fogo", "Lâmina em Chamas", "Gaste a Ação e o PM de uma magia de Fogo de rank Avançado ou inferior, mais 1 PT: por 1 minuto, seu Dado de Arma causa +1d8 de dano ígneo extra."],
            ["Tático (Navegação e Liderança) + Magia de Terra", "Terreno Escolhido", "Antes de um combate previsto, gaste 1 PP pra declarar que já preparou o chão. Se a luta acontecer lá, sua próxima magia de Terra no combate tem +50% de área."],
            ["Ladino (Furtividade e Armadilhas) + Magia de Invocação", "Familiar Furtivo", "Sua próxima invocação nasce com o seu Bônus de Rank de Ladino em Furtividade, e reporta o que viu sem gastar sua Ação pra perguntar."],
            ["Bardo e Interação + Magia de Cura", "Canção que Cura", "Enquanto sustentar uma Canção, cada magia de Cura que você conjurar recupera +1d8 extra em todos os alvos afetados."],
            ["Cavalaria e Escudos + Magia de Barreira", "Escudo Vivo", "Uma vez por combate, gaste 1 PM: seu escudo físico ganha uma barreira extra de PV temporários igual ao seu Bônus de Rank, que absorve dano antes da CA importar."],
          ]}
        />
        <Aside title="Quando a combinação vira uma árvore própria">
          Às vezes duas árvores em Rank Avançado se encaixam bem demais pra caber numa única habilidade — o
          Estilo Deus do Norte com a Magia de Vento, por exemplo, virou o <b>Estilo Vendaval</b>, uma
          décima oitava sub-árvore inteira que só se revela pra quem cumpriu os dois pré-requisitos (Cap. 1,
          §8, pergunta 7; catálogo completo no Cap. 3). Isso não é a regra — é o teto dela.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap2-5">5. Maestrias</SectionTitle>
        <P>
          Ao desbloquear um Rank em qualquer árvore, você recebe imediatamente e de graça a Maestria
          correspondente. Ela não custa PA, não conta como conhecimento, e não pode ser recusada.
        </P>
        <P>
          A lógica é simples: subir de rank não é decorar mais um feitiço — é compreender o elemento de um
          jeito novo. Roxy não comprou a habilidade de encurtar cânticos; ela entendeu água fundo o
          suficiente pra que encurtar virasse natural.
        </P>
        <P>
          As Maestrias são listadas dentro de cada árvore, em cada Rank, marcadas com o símbolo ◈ — confira
          na{" "}
          <a href="/arvores" className="text-wine-600 underline decoration-dotted hover:text-wine-500 dark:text-wine-300">
            página de Árvores
          </a>
          .
        </P>
      </Section>
    </div>
  );
}
