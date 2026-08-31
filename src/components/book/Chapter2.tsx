import { RANKS } from "@/lib/types";
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
      </Section>

      <Section>
        <SectionTitle id="cap2-3">3. Tempo de Conjuração por Rank</SectionTitle>
        <P>
          Esta tabela governa quantas Ações uma magia custa. O cântico cresce com o rank — magias grandes
          exigem que o grupo proteja o mago enquanto ele canta.
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
