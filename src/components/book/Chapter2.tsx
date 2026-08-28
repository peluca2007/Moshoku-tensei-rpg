import { RANKS } from "@/lib/types";
import { MAGIC_ACTIONS } from "@/data/trees/shared";
import { Aside, BookTable, ChapterTitle, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";

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
          Cura se divide em Cura, Desintoxicação, Barreira e Invocação.
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
            ["Muralha de Pedra + qualquer magia de Fogo", "Vidro Cortante", "A muralha derrete e resolidifica em lâminas de vidro. Quem tocar ou atravessar sofre 3d8 cortante; a muralha perde metade dos PV Máximos."],
            ["Lama Viva (Terra) + Respingos de Água", "Areia Movediça Instantânea", "Esfera de 9m vira lodo: Deslocamento reduzido à metade e teste de Força (CD 8 + BC) ou fica Atolado até a cintura, sem teste de dano."],
            ["Cordilheira (Terra) + Ciclone (Vento)", "Tempestade de Poeira", "Esfera de 18m: Cego pra quem estiver dentro, e projéteis mundanos erram automaticamente até a poeira baixar (1 minuto)."],
          ]}
        />
        <Aside title="Regra de Ouro para o Mestre">
          Se o jogador descrever uma combinação que faz sentido físico, deixe funcionar e invente o efeito na
          hora. Este sistema recompensa quem pensa como cientista — foi assim que Rudeus criou metade do
          arsenal dele. A mesma regra vale pra toda a seção abaixo, não só pra Magia Combinada.
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
