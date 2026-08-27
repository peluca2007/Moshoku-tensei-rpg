import { RANKS } from "@/lib/types";
import { MAGIC_ACTIONS } from "@/data/trees/shared";
import { Aside, BookTable, ChapterTitle, List, P, Section, SectionTitle, Warning } from "./BookUI";

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
          As magias se dividem em três categorias principais: Magia de Ataque, Magia de Cura e Magia de
          Invocação. A de Ataque possui a maior quantidade de feitiços disponíveis; a de Invocação, a menor.
        </P>
        <P>
          A Magia de Ataque se divide nos quatro elementos clássicos — Água, Fogo, Terra e Vento. A Magia de
          Cura se divide em Cura, Desintoxicação, Barreira e Golpe Divino.
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
                sempre mais rápida que Padrão e Encurtada, sem exceção.
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
        <SectionTitle id="cap2-4">4. Magia Combinada</SectionTitle>
        <P>
          Magias Combinadas são feitiços compostos por duas ou mais magias de ataque conjuradas em
          sequência, cujo resultado é maior que a soma das partes. Nova Congelante é literalmente Vento +
          Água/Gelo; Vapor Seco é Vento + Fogo.
        </P>
        <P>
          <b>Requisito:</b> ser rank Avançado em pelo menos uma escola de Magia de Ataque — o portão canônico.
          Nenhum mago abaixo de Avançado consegue combinar escolas.
        </P>
        <List
          items={[
            "Conjure as duas magias no mesmo turno ou em turnos consecutivos.",
            "Pague o PM e as Ações de ambas.",
            "O resultado é uma terceira magia, com efeito próprio.",
          ]}
        />
        <BookTable
          headers={["Combinação", "Resultado", "Efeito"]}
          rows={[
            ["Respingos de Água + Campo de Gelo", "Nova Congelante", "Todos na área ficam Molhados e imediatamente Congelados, sem teste. Dano 4d8 de frio."],
            ["Tempestade + qualquer magia de Fogo", "Névoa Escaldante", "Esfera de 18m de vapor. Escuridão total + 1d6 de dano ígneo por turno a quem estiver dentro."],
            ["Canhão de Água + Lâmina de Gelo", "Serra d'Água", "A linha do Canhão passa a causar dano cortante e ignora metade da CA de armaduras não-mágicas."],
            ["Cumulonimbus + Nevasca", "Inverno Rasgado", "A tempestade vira granizo. Toda criatura na área de 1,5 km sofre 2d6 de frio por turno, sem teste."],
          ]}
        />
        <Aside title="Regra de Ouro para o Mestre">
          Se o jogador descrever uma combinação que faz sentido físico, deixe funcionar e invente o efeito na
          hora. Este sistema recompensa quem pensa como cientista — foi assim que Rudeus criou metade do
          arsenal dele.
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
          <a href="/arvores" className="text-wine-600 underline decoration-dotted hover:text-wine-500 dark:text-wine-400">
            página de Árvores
          </a>
          .
        </P>
      </Section>
    </div>
  );
}
