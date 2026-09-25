import Link from "next/link";
import { TREES, CATEGORY_LABELS } from "@/data/trees";
import { RANK_BONUS, RANKS } from "@/lib/types";
import { Aside, BookTable, ChapterTitle, FimDoCapitulo, List, P, Quote, Section, SectionTitle, SubTitle, Warning } from "./BookUI";
import { EscadaDeDados, EtapasDoTiroPerfeito, TrianguloDosEstilos } from "./Diagramas";
import TreeCatalog from "./TreeCatalog";
import RetratoDaArvore from "./RetratoDaArvore";
import ArteDaHabilidade from "./ArteDaHabilidade";
import { ARTE_EXPLOSAO_DE_AURA, ARTE_LAMINA_DE_TOUKI } from "@/data/midiaDeHabilidade";
import TreeCrest from "../TreeCrest";

/**
 * @param arvoresAbertas  o catálogo das árvores já sai aberto do servidor. O
 *   livro folheado imprime o catálogo inteiro; abrir os 19 <details> depois
 *   de montar custava uma diagramação a mais do livro todo (~0,6 s). As
 *   árvores saem marcadas, e o modo contínuo do folhear as fecha de novo.
 */
export default function Chapter3({ arvoresAbertas = false }: { arvoresAbertas?: boolean } = {}) {
  const rankLabelTrees = TREES.filter((t) => t.rankLabels);

  return (
    <div className="space-y-8">
      <ChapterTitle
        id="cap3"
        numero="Capítulo 3"
        resumo="As escolas de Corpo, Magia e Utilidade — como ler uma árvore, o que cada patamar destrava e o que ele custa."
      >
        As Árvores de Progressão
      </ChapterTitle>
      <P className="dropcap">
        Não existem classes engessadas ou papéis que limitam suas escolhas. O sistema funciona através de
        Árvores de Progressão, divididas em três grandes pilares: a <b>Árvore da Magia</b> (feitiços de
        ataque, suporte e invocação — recurso PM), a <b>Árvore do Corpo</b> (os três Estilos Divinos de
        esgrima, mais armas pesadas, escudos e arquearia — recurso PT) e a <b>Árvore de Utilidade</b> (os
        especialistas em mundo — funciona por perícia, posicionamento e usos por descanso).
      </P>
      <Warning title="O catálogo completo está logo abaixo, seção 'Todas as Sub-árvores'">
        Este capítulo primeiro cobre as regras <i>compartilhadas</i> entre árvores do mesmo pilar, e termina
        com o catálogo completo de magias, talentos, técnicas e Maestrias das 19 sub-árvores — o mesmo dado
        que alimenta a ficha, então nunca diverge dela. Prefere navegar visualmente? O{" "}
        <Link href="/arvores" className="text-wine-600 underline decoration-dotted hover:text-wine-500 dark:text-wine-300">
          mapa de Árvores
        </Link>{" "}
        mostra o mesmo conteúdo ligado ao progresso do seu personagem.
      </Warning>

      <Section>
        <SectionTitle id="cap3-como-ler">Como Ler uma Árvore</SectionTitle>
        <P>
          Toda árvore deste livro gira em torno de <b>uma ideia só</b>. Se você entender essa ideia, as vinte
          e poucas magias ou técnicas dela deixam de ser uma lista pra decorar e viram variações de um mesmo
          gesto. Se não entender, você compra habilidades soltas que não conversam entre si — e é assim que
          um personagem fica fraco sem que ninguém saiba explicar por quê.
        </P>
        <P>
          Por isso o catálogo de cada árvore começa com um quadro <b>Mecânica Central</b>, sempre com os
          mesmos quatro blocos:
        </P>
        <List
          items={[
            <span key="t"><b>A tag.</b> Um rótulo curto — <i>Molhado → Congelado</i>, <i>Improviso</i>, <i>Ferida Fresca</i>. Ele aparece também entre colchetes na Maestria de 1º patamar da árvore, pra você reconhecer a mecânica quando ela voltar.</span>,
            <span key="h"><b>A frase.</b> O que esta árvore faz que nenhuma outra faz.</span>,
            <span key="l"><b>Como se joga.</b> Dois a quatro passos, na ordem em que acontecem na mesa. Não são conselhos: é literalmente o ciclo de turno da árvore.</span>,
            <span key="c"><b>O que ela não faz.</b> A fraqueza declarada. Uma árvore sem fraqueza é uma árvore que ninguém sabe quando <i>não</i> escolher — e é assim que se escreve um sistema em que todo mundo joga a mesma ficha.</span>,
          ]}
        />
        <Aside title="A regra dos dois tempos">
          <P>
            Repare, na tabela abaixo, que várias árvores têm um passo de <b>preparo</b> e um passo de{" "}
            <b>cobrança</b>. Água molha pra depois congelar. Terra atola pra depois soterrar. Lutador empilha
            Quebrantado pra depois colher. Vento desequilibra pra depois cobrar um dado a mais.
          </P>
          <P>
            Isso é de propósito, e é a diferença entre as árvores <i>de dois tempos</i> e as{" "}
            <i>de um tempo só</i>. Fogo, Deus da Espada e Arquearia não preparam nada — elas cobram no
            primeiro turno, e por isso entregam menos quando a luta se estende. Quem prepara paga um turno
            adiantado e recebe juros depois. <b>Nenhuma das duas famílias é melhor:</b> a pergunta é quantos
            turnos a sua mesa costuma jogar antes de a luta acabar.
          </P>
        </Aside>

        <SubTitle id="cap3-mecanicas">As Dezenove Mecânicas, lado a lado</SubTitle>
        <P>
          A tabela existe pra ser lida <b>antes</b> de escolher a Árvore Inicial (Cap. 1, §8). Cada linha é o
          resumo de um quadro completo, que você encontra no catálogo da árvore mais abaixo.
        </P>
        {(["magia", "corpo", "utilidade"] as const).map((category) => (
          <div key={category} className="space-y-2">
            <h4 className="mt-3 text-sm font-bold text-wine-700 dark:text-wine-300">
              {CATEGORY_LABELS[category]}
            </h4>
            <BookTable
              headers={["Árvore", "Mecânica", "O que ela faz", "O que ela não faz"]}
              rows={TREES.filter((t) => t.category === category && t.mechanic).map((t) => [
                t.name,
                t.mechanic!.tag,
                t.mechanic!.hook,
                t.mechanic!.cost,
              ])}
            />
          </div>
        ))}
      </Section>

      <Section>
        <SectionTitle id="cap3-mapa">O Mapa Completo das Árvores</SectionTitle>
        <P>
          O sistema comporta 19 sub-árvores: 17 escolhíveis desde o primeiro dia, mais duas híbridas que não
          se escolhem — elas só se revelam pra quem já cumpriu os pré-requisitos das duas árvores de origem
          (ver a nota no catálogo de cada uma, mais abaixo). Nenhuma delas é uma
          classe: você compra Ranks em quantas quiser, na ordem que quiser, e seu personagem é simplesmente
          a soma do que ele estudou. Clique no nome de qualquer sub-árvore na tabela abaixo pra abrir ela
          direto no mapa.
        </P>
        <BookTable
          headers={["Pilar", "Sub-árvore", "Atributo-chave", "Recurso", "Identidade em uma linha"]}
          rows={TREES.map((t) => [
            t.category === "magia" ? "Magia" : t.category === "corpo" ? "Corpo" : "Utilidade",
            <Link
              key={t.id}
              href={`/arvores?arvore=${t.id}`}
              // `inline-block py-1` leva o alvo de 20px para 28px de altura, acima do
              // mínimo de 24 do WCAG 2.5.8. Diferente dos links em prosa — que o
              // critério isenta em letra, porque aumentá-los quebraria a linha do
              // texto — este é alvo de NAVEGAÇÃO numa célula de tabela, e o dedo
              // precisa acertá-lo.
              className="inline-block py-1 text-wine-600 underline decoration-dotted hover:text-wine-500 dark:text-wine-300"
            >
              {t.name}
            </Link>,
            t.keyAttributeLabel ?? "—",
            t.resourceLabel ?? "—",
            t.tagline ?? "",
          ])}
        />
        <Aside title="Escolas Formais e Ofícios">
          <P>
            As oito escolas de magia, os três Estilos Divinos e o Estilo Vendaval (que nasce de um deles) são{" "}
            <b>Escolas Formais</b>: têm mestres vivos, sedes, hierarquia e títulos reconhecidos no mundo
            inteiro — usam os nomes canônicos de rank (Principiante → Imperador) e conferem status social.
            As outras sete são <b>Ofícios</b> aprendidos na estrada, sem diploma: mecanicamente idênticos
            (mesmo Bônus de Rank, mesmos custos de PA, mesma contagem de conhecimentos), mas os nomes dos
            patamares mudam — e a tabela abaixo é a tradução entre eles.
          </P>
        </Aside>
        <BookTable
          headers={["Patamar", "Bônus", ...rankLabelTrees.map((t) => t.name)]}
          rows={RANKS.map((rank, i) => [
            String(i + 1),
            `+${RANK_BONUS[rank]}`,
            // Ofício não tem 7º patamar: onde a árvore não define rótulo pro Deus,
            // a célula sai como "—" em vez de repetir o nome canônico do rank.
            ...rankLabelTrees.map((t) => (rank === "Deus" ? "—" : t.rankLabels?.[rank] ?? rank)),
          ])}
        />
        <Aside title="Ofícios não têm patamar Deus">
          O sétimo degrau existe só nas Escolas Formais, e mesmo lá é narrativo. Um Ofício termina no sexto
          patamar.
        </Aside>
        <Aside title="Quem tem Touki">
          A reserva de PT existe desde o 1º patamar de qualquer árvore do Corpo — inclusive Arquearia,
          inclusive Escudos. No Avançado (3º patamar) você veste o Manto de Touki e destrava as manobras de
          gasto. A única exceção é o Estilo Deus da Espada, que destrava Touki Concentrado e Lâmina de Touki
          já no 2º patamar (a doutrina inteira dele é velocidade); o Manto e as outras manobras vêm no 3º,
          como pra todo mundo. As árvores de Magia e de Utilidade nunca recebem Touki nem Pontos de Touki,
          por mais alto que seja o rank.
        </Aside>
      </Section>

      {/*
        A seção-ponte da Magia (0.1.7).

        O parágrafo de abertura deste capítulo nomeia TRÊS pilares, e o capítulo
        entregava seção de sistemas compartilhados pra dois: Corpo e Utilidade.
        A razão é boa — os sistemas compartilhados da Magia são o Capítulo 2
        inteiro, que é grande demais pra caber aqui —, mas o livro não dizia
        isso em lugar nenhum, e quem rola procurando "Magia" entre os dois
        outros conclui que falta uma parte.

        Ela é curta de propósito: existe pra fechar a simetria e apontar, não
        pra repetir o Capítulo 2 em versão resumida (que seria uma segunda fonte
        da mesma regra, e este livro não tem duas fontes de nada).
      */}
      <Section>
        <SectionTitle id="cap3-magia">A Árvore da Magia — Sistemas Compartilhados</SectionTitle>
        <P>
          Os sistemas que valem para <b>todas</b> as escolas de magia não moram aqui: eles são o{" "}
          <b>Capítulo 2</b> inteiro. Cânticos e a escada de encantamento, tempo de conjuração por rank,
          Conjuração Silenciosa, o que acontece quando alguém te interrompe no meio, Magia Combinada e as
          Maestrias — tudo isso é compartilhado entre Água, Fogo, Terra, Vento, Cura, Barreira,
          Desintoxicação e Invocação, e por isso tem capítulo próprio em vez de uma seção aqui.
        </P>
        <P>
          O que <i>é</i> específico de cada escola — a mecânica central dela, o catálogo de magias por rank e
          as Maestrias que ela concede — está na seção &ldquo;Todas as Sub-árvores&rdquo;, no fim deste
          capítulo, junto com as do Corpo e as de Utilidade.
        </P>
        <Aside title="A regra de ouro das três">
          <P>
            Magia gasta <b>PM</b> e paga em alcance e área. Corpo gasta <b>PT</b> e paga em dano por turno e
            sobrevivência. Utilidade quase não gasta recurso nenhum e paga em <b>não precisar rolar</b> — ela
            resolve antes de o combate começar. Um grupo que só compra uma das três descobre isso da pior
            forma possível.
          </P>
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap3-corpo">A Árvore do Corpo — Sistemas Compartilhados</SectionTitle>
        <P>
          Antes de qualquer estilo específico, quatro sistemas governam todos os guerreiros: o Dado de Arma,
          o Touki, a Preparação em Etapas e o Triângulo dos Estilos.
        </P>
        <Aside title="Espadachim ou Guerreiro">
          Apenas quem estudou uma das Três Grandes Escolas — Deus da Espada, Deus da Água e Deus do Norte —
          é chamado de Espadachim. Todos os outros, mesmo empunhando espada, são apenas Guerreiros.
        </Aside>

        <SubTitle id="cap3-dado-arma">1. O Dado de Arma e a Escalada de Maestria</SubTitle>
        <P>
          O dano de um guerreiro vem da arma, não do corpo. Conforme você sobe de Rank num estilo, o Dado
          Base sobe degraus nesta escada:
        </P>
        <EscadaDeDados />
        <BookTable
          headers={["Rank no Estilo", "Degraus Ganhos", "Espada Curta (d6) vira", "Espada Longa (d8) vira"]}
          rows={[
            ["Principiante", "+1", "d8", "d10"],
            ["Intermediário", "+2", "d10", "d12"],
            ["Avançado", "+3", "d12", "2d8"],
            ["Santo", "+4", "2d8", "2d10"],
            ["Rei", "+5", "2d10", "2d12"],
            ["Imperador", "+6", "2d12", "3d10"],
          ]}
        />
        <Warning title="Arma improvisada não sobe a escada">
          <P>
            A cadeira, a garrafa e a pedra do chão travam em <b>d6</b> e não ganham degrau nenhum. Um
            Imperador quebra a mesma cadeira que um Principiante quebra.
          </P>
          <P>
            O <b>Estilo Deus do Norte</b> é a única árvore que escapa disso — e é o que a frase dele
            significa de verdade: <i>&ldquo;se dá pra empunhar, você é proficiente&rdquo;</i>. Na mão dele,
            um banco de taverna escala como uma espada.
          </P>
        </Warning>
        <Aside title="Acima do topo da escada">
          <P>
            O 5d12 é o último degrau. Se um talento ou Maestria te der um degrau além dele — Espada
            Emprestada e Punho Duplo são os dois casos do livro — cada degrau excedente vira{" "}
            <b>+2 de dano fixo</b> em vez de sumir. Nenhum PA gasto em degrau é jogado fora.
          </P>
        </Aside>
        <Warning title="Esta tabela é a progressão padrão, não universal">
          A maioria das árvores do Corpo sobe exatamente +1 degrau por Rank (total +6 no Imperador), mas não
          é regra fixa — cada árvore define os próprios degraus por patamar no catálogo dela (Cap. 3,
          &ldquo;Todas as Sub-árvores&rdquo;). O Deus da Espada sobe mais rápido (<b>nove</b> degraus no
          total, de propósito — é a identidade da árvore: &ldquo;o maior dano do livro&rdquo;), e é o único
          que chega lá. Logo atrás vem o <b>Punho do Fogo</b>, com <b>sete</b>: ele é a segunda árvore mais
          rápida da escada, mas o resto do dano dele vem de Em Chamas e Quebrantado, não do dado. Cavalaria e
          Escudos sobe mais devagar, porque o valor dela está em proteger o grupo, não em dano. Confira o
          catálogo da árvore específica antes de calcular o dado final de alguém.
        </Warning>
        <P>
          Fórmula de dano marcial: <b>Dado de Arma (escalado) + Atributo + Bônus do Rank</b>. Atributo de
          acerto e dano: <b>Força; ou Agilidade com os grupos Lâminas Curtas, Arcos e Bestas, Arremesso e
          Flexíveis</b>. Qual Rank conta depende do tipo de ataque, e a regra tem exatamente dois casos —
          nunca um terceiro:
        </P>
        <List
          items={[
            <span key="comum">
              <b>Ataque comum (golpe simples, sem nome, sem técnica):</b> use o <b>maior</b> Rank que você
              tiver entre todas as suas árvores do Corpo. Um personagem com Norte Santo e Espada Principiante
              rola os degraus do Norte Santo (o maior dos dois) em qualquer golpe comum, não importa com qual
              arma. Degraus e Bônus vêm da árvore de maior Rank; em empate, você escolhe. Arma improvisada só
              escala se essa árvore for o Deus do Norte.
            </span>,
            <span key="tecnica">
              <b>Técnica nomeada (qualquer habilidade comprada de uma árvore específica):</b> use sempre o
              Rank <b>daquela árvore que concedeu a técnica</b>, mesmo que seja menor que o seu maior Rank
              geral. O mesmo personagem usando a Espada de Luz (técnica do Deus da Espada) rola só os degraus
              do Rank Principiante — é por isso que ela sai fraca na mão dele, apesar do Norte Santo.
            </span>,
          ]}
        />
        <P>
          A mesma lógica dos dois casos vale pra <b>qualquer</b> talento ou regra do livro que mencione
          &ldquo;seu Bônus de Rank&rdquo; sem dizer de qual árvore: se a regra foi concedida por uma árvore
          específica, é o Rank daquela árvore; se for uma regra genérica do sistema (não amarrada a nenhuma
          árvore), use o maior Rank que você tiver em qualquer árvore.
        </P>

        <SubTitle id="cap3-touki">2. Touki (Aura de Batalha)</SubTitle>
        <P>
          O Touki é uma camada de mana que o guerreiro veste sobre o próprio corpo — endurece a pele como
          aço, reforça o fio da lâmina e amplifica força, velocidade e reflexos. A reserva de PT existe desde
          o 1º patamar de qualquer árvore do Corpo. No Avançado (3º patamar), todo guerreiro veste o Manto de
          Touki e destrava as manobras de gasto; o Deus da Espada destrava Touki Concentrado e Lâmina de
          Touki já no 2º.
        </P>
        <Aside title="Pontos de Touki (PT)">
          <P>
            <b>Todo guerreiro tem Touki desde o 1º patamar — só não percebe.</b> O novato paga técnicas por
            instinto, sem saber de onde vem o fôlego a mais. É no Avançado (3º patamar) que ele percebe a
            aura: destrava as manobras de gasto abaixo e passa a vestir o Manto de Touki. O Deus da Espada
            adianta duas delas — Touki Concentrado e Lâmina de Touki já no 2º patamar; o Manto e as outras
            manobras vêm no 3º.
          </P>
          <P>
            <b>Reserva de PT:</b> Vigor + Espírito + 1 PT por patamar que você tenha em qualquer árvore do Corpo,
            desde o 1º (patamares de árvores diferentes somam). Cavalaria e Escudos concede +2 por patamar em
            vez de +1, por gastar PT mais rápido que qualquer outra árvore.
          </P>
          <List
            items={[
              "PT são recuperados integralmente em um Descanso Curto — e são o único recurso que volta inteiro nele (PM e PP voltam a 25% do máximo). O Cap. 4, §7 limita a dois Descansos Curtos entre dois Longos.",
              "PT não podem ser convertidos em PM, nem PM em PT.",
              "Um personagem com Ranks em mais de um estilo marcial usa uma reserva única de PT.",
            ]}
          />
        </Aside>
        <P>
          <b>O Manto de Touki (passivo, gratuito, independente de PT)</b> — a partir do Rank Avançado,
          enquanto consciente e não Exausto: +CA igual à metade do Bônus de Rank (arred. pra cima); Redução
          contra projéteis igual ao dobro do Bônus de Rank (e nunca sofre crítico deles). <b>Projétil é ataque
          de arma à distância, mágico ou não</b> — flecha encantada é projétil; Bola de Fogo não é, magia
          nunca é projétil. Ataques
          desarmados e com objetos improvisados contam como mágicos. <b>O Manto não consome PT e continua
          ativo mesmo com a reserva de PT em 0</b> — ele é vestido pelo Rank, não comprado com o recurso; só
          PT paga as manobras de gasto da tabela abaixo, nunca a existência do Manto em si.
        </P>
        <BookTable
          headers={["Custo", "Manobra", "Efeito"]}
          rows={[
            ["1 PT", "Touki Concentrado", "Sem Ação, uma vez por turno. Até o fim do seu turno, some seu Bônus de Rank ao dano de todos os seus ataques."],
            ["1 PT", "Touki Endurecido", "1 Reação, ao ser atingido. Reduza o dano daquele golpe no dobro do seu Bônus de Rank."],
            ["1 PT", "Lâmina de Touki", "Sem Ação. Por 1 minuto, sua arma corpo a corpo corta pedra e aço, conta como mágica e ignora Resistência a cortante/perfurante."],
            ["2 PT", "Golpe Estendido", "1 Ação. Clarão da lâmina que atinge um alvo a até 9m. Dano de arma normal."],
            ["2 PT", "Aguentar", "1 Reação. Ao sofrer dano que te levaria a 0 PV, fica com 1 PV em vez disso. Uma vez por combate."],
            ["3 PT", "Explosão de Aura", "1 Ação. Criaturas a 3m fazem teste de Força (CD 8 + Força + Rank) ou são arremessadas 4,5m e ficam Caídas."],
          ]}
        />
        {/* As duas técnicas da tabela acima que têm arte. Elas não são de árvore
            nenhuma — qualquer um com PT usa as duas — então vêm direto. */}
        <div className="grid gap-2 sm:grid-cols-2">
          <ArteDaHabilidade midia={ARTE_LAMINA_DE_TOUKI} />
          <ArteDaHabilidade midia={ARTE_EXPLOSAO_DE_AURA} />
        </div>

        <SubTitle id="cap3-preparacao">3. A Preparação em Etapas — o Tiro Perfeito</SubTitle>
        {/*
          O aviso vem ANTES da explicação, e não depois — 0.1.69.

          Esta seção mora no Capítulo 3, que é o capítulo das regras que valem
          pra todo mundo (Ações, Reações, Touki). Ler "o Tiro Perfeito, da
          Arquearia" no meio de um parágrafo não desfaz a impressão que o LUGAR
          já deu: a de que é mais uma manobra universal. O pré-requisito tem que
          ser a primeira coisa na tela, não uma aposta na atenção do leitor.
        */}
        <Warning title="Exclusivo da Arquearia — ninguém mais atira assim">
          <P>
            O Tiro Perfeito <b>não</b> é uma manobra aberta a qualquer personagem. É a habilidade de
            assinatura de <b>Arquearia</b>, no patamar Principiante, e usar exige as duas coisas ao mesmo
            tempo: ter <b>comprado aquele nó da árvore</b> com PA, e estar com <b>arco ou besta</b> em mãos.
          </P>
          <P>
            Não há versão improvisada, não se compra avulso, nenhuma outra árvore concede, e nem Deus da
            Espada nem Deus do Norte têm equivalente. Quem não é arqueiro mira e atira normalmente — a
            escada de etapas abaixo <b>inteira</b> está fechada pra ele.
          </P>
          <P>
            A única exceção é a <b>provação do Deus do Arco</b> (Cap. 5): durante ela, qualquer um executa o
            Tiro Perfeito inteiro, sem o nó da árvore, com o arco que o Deus empresta. É assim que alguém
            sem Arquearia consegue abrir a Arquearia.
          </P>
        </Warning>
        <P>
          Toda técnica do livro compra potência com <b>recurso</b>: PT, PM, PP. O Tiro Perfeito, da
          Arquearia, é a única que compra com <b>tempo</b> — e é por isso que ele é um sistema, e não uma
          habilidade. Quatro Ações num turno de três: ele <b>sempre</b> atravessa turnos.
        </P>
        <P>
          Cada etapa custa 1 Ação e pede um teste de <b>CD 12</b>, na ordem: <b>1d20 + o atributo da etapa</b>.
          Quando a etapa nomeia uma perícia, o atributo é o dela, e ter a perícia dá Vantagem, como em
          qualquer teste (Cap. 1, §4). A CD é fixa, e não a escada habitual de 8 + atributo + Rank,
          porque não há ninguém do outro lado resistindo: a dificuldade é da técnica, não de um alvo.
        </P>
        <P>
          Entre uma etapa e outra, a Preparação segue as regras da <b>Conjuração Contínua e Dividida</b>{" "}
          (Cap. 4, §3): o alvo é declarado na Corda; você pode se mover com as Ações que sobram (atacar,
          não), mas precisa gastar ao menos 1 Ação de etapa por turno, ou a Preparação se perde (a Perda de
          Foco do arqueiro; uma Preparação já concluída e guardada pela Respiração Contada não precisa); e
          usar a sua Reação a encerra.
        </P>
        <EtapasDoTiroPerfeito />
        <BookTable
          headers={["Etapa", "Teste", "O que ela concede"]}
          rows={[
            ["1. A Corda", "Força", "O Dado de Arma deste disparo sobe DOIS degraus na Escada de Dados. Você puxa até o fim."],
            ["2. A Leitura", "Intuição — ou Intelecto/Espírito puro, o maior, se você não tem a perícia", "O alvo não soma Agilidade na CA — você atirou onde ele ia estar — e o Dado de Arma sobe MAIS UM degrau."],
            ["3. Os Dedos", "Agilidade", "+1 Dado de Arma, e o disparo ignora Cobertura — exceto a Total, contra a qual não existe tiro."],
            ["(opcional) O Ponto", "Medicina (humanoide) ou Sobrevivência (fera, monstro)", "+1 Ação. Crita em 19-20 e ignora Resistência a dano."],
            ["4. A Solta", "o ataque normal, contra a CA do alvo", "O disparo. Também é uma jogada: nenhuma etapa garante o acerto."],
          ]}
        />
        <Aside title="Por que a Leitura vem antes dos Dedos">
          <P>
            A ordem não é enfeite, é a própria técnica. Você <b>puxa</b> a corda, <b>lê</b> pra onde o alvo
            vai, e só então <b>coloca os dedos</b> no lugar do tiro — mirando o vão que a leitura acabou de
            revelar. Por isso a etapa que fura Cobertura é a última antes da Solta: ela é a correção final,
            não o começo.
          </P>
          <P>
            Repare no que cada etapa compra, porque são três coisas diferentes e é isso que faz o sistema
            valer o tempo: <b>A Corda compra potência bruta</b> (dois degraus), <b>A Leitura compra o acerto
            contra quem se mexe</b> (a Agilidade sai da CA) <b>e mais um degrau</b>, e <b>Os Dedos compram o
            ângulo</b> (a Cobertura some) <b>e mais um Dado</b>. Falhar numa não estraga as outras.
          </P>
        </Aside>
        <Aside title="Falhar não interrompe">
          <P>
            Errar um teste não cancela a Preparação nem devolve as Ações: você apenas <b>não recebe o bônus
            daquela etapa</b> e segue para a próxima. Sem esta regra, um 7 no d20 jogaria fora dois turnos de
            jogo — e ninguém aposta dois turnos num tiro que uma rolagem ruim anula.
          </P>
          <P>
            Sofrer dano no meio é outra coisa: aí é o mesmo teste da <b>Interrupção</b> de um cântico (Cap.
            4, §3) — Espírito contra <b>CD 10 + o Bônus de Rank de quem te acertou</b>. Falhou, a Preparação
            inteira se perde, e as Ações já gastas nela não voltam.
          </P>
        </Aside>
        <Aside title="A escada da Preparação">
          <List
            items={[
              <span key="1">
                <b>Principiante</b> — o Tiro Perfeito, e <b>Respiração Contada</b>, que deixa guardar uma
                Preparação pronta até o fim do turno seguinte antes de soltar.
              </span>,
              <span key="2">
                <b>Intermediário — Etapa Encurtada:</b> A Corda e A Leitura, as duas primeiras, passam a caber numa Ação só. O
                tiro inteiro cai de 4 para 3 Ações, e passa a caber num turno.
              </span>,
              <span key="3">
                <b>Avançado — Olho Que Já Viu:</b> a Leitura não pede mais teste. Ela passa sempre.
              </span>,
              <span key="4">
                <b>Santo — Ponto Vital Lido:</b> a etapa d&rsquo;O Ponto passa a custar 0 Ações.
              </span>,
              <span key="5">
                <b>Rei — Preparação Perfeita:</b> um Tiro Perfeito em que Corda, Dedos, Leitura e O Ponto
                passaram, e a Solta acertou, fura o Manto de Touki, sem gastar PT. É a segunda forma de
                furar o Manto, e cobra em turnos o que a Flecha de Touki cobra em recurso.
              </span>,
            ]}
          />
        </Aside>

        <SubTitle id="cap3-triangulo">4. O Triângulo dos Estilos</SubTitle>
        <TrianguloDosEstilos />
        <Quote attribution="Lema do Estilo Deus da Espada">A vitória é de quem se move primeiro.</Quote>
        <Aside title="Regra da Vantagem de Estilo">
          <P>
            <b>Espada vence Norte, Norte vence Água, Água vence Espada.</b> Quando você luta contra um
            praticante do estilo que o seu contra-ataca, e ambos possuem Rank naqueles estilos: você rola com
            Vantagem em todas as Disputas contra ele, e as Reações defensivas dele falham automaticamente
            contra sua primeira Ação de cada turno. Se o Rank dele for dois ou mais acima do seu, a vantagem
            se anula — treino bruto supera a tabela de tipos.
          </P>
          <P>
            <b>E cada aresta tem o efeito próprio dela</b>, porque as três doutrinas não se atacam pelo mesmo
            lugar. Sem isto, o triângulo tinha uma aresta só funcionando: o Deus da Espada quase não vende
            Reação defensiva, então &ldquo;as Reações dele falham&rdquo; não custava nada a ele — e desligava
            a Água inteira, que é o estilo feito de Reações.
          </P>
          <BookTable
            headers={["Aresta", "O que você ganha, além do acima"]}
            rows={[
              ["Espada vence Norte", "O Improviso do Norte não funciona contra a sua primeira Ação do turno. Você é rápido demais pra ele improvisar em cima."],
              ["Norte vence Água", "As Reações defensivas dele falham contra a sua primeira Ação de cada turno (a regra acima). O Norte luta sujo: ataca o que a postura não cobre."],
              ["Água vence Espada", "O primeiro ataque dele contra você a cada turno tem Desvantagem. A Água não bloqueia a Espada — ela faz a Espada errar."],
            ]}
          />
          <P>
            Seu estilo é o do seu maior Rank entre os três (em empate, escolha no início do combate); o
            Vendaval conta como Deus da Espada. Os Ranks comparados acima são os desses dois estilos, o seu e
            o dele. A vantagem vale só em ataques corpo a corpo.
          </P>
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap3-utilidade">A Árvore de Utilidade — Sistemas Compartilhados</SectionTitle>
        <P>
          O terceiro pilar não compete em dano — um Lenda Oculta não bate mais forte que um Norte
          Principiante. O que a Utilidade faz é decidir as <b>condições</b> em que a luta, a negociação ou o
          roubo acontecem.
        </P>
        <List
          items={[
            <span key="1"><b>Sem Escada de Dados:</b> árvores de Utilidade não recebem degraus no Dado de Arma.</span>,
            <span key="2"><b>Sem Touki, nunca:</b> nenhum patamar de Utilidade concede Manto de Touki nem PT.</span>,
            <span key="3">
              <b>O Rank soma só nas Perícias que a sua árvore cobre</b> — nunca em todas as Perícias do jogo,
              exatamente como o BC é somado só ao dano do elemento de um mago, não ao de qualquer magia:
            </span>,
          ]}
        />
        <BookTable
          headers={["Árvore", "Perícias cobertas pelo Bônus de Rank"]}
          rows={[
            ["Ladino (Furtividade e Armadilhas)", "Furtividade, Ladinagem, Percepção, Acrobacia, Enganação (disfarce)."],
            ["Bardo e Interação", "Atuação, Persuasão, Intuição, História."],
            ["Tático (Navegação e Liderança)", "Sobrevivência, Natureza, Investigação, Percepção (rastreio)."],
          ]}
        />
        <P>
          Os parênteses limitam a perícia a uma parte dela. <b>Disfarce</b> é passar por outra pessoa ou
          esconder quem você é; <b>rastreio</b> é seguir e ler rastros. Um teste de Enganação que não é
          disfarce, ou de Percepção que não é rastreio, não recebe o Bônus de Rank daquela árvore.
        </P>
        <P>
          Duas árvores de Utilidade cobrem <b>Percepção</b> (Ladino, num sentido; Tático, noutro). Se você
          tiver Rank em ambas, use o <b>maior</b> Bônus de Rank entre as duas — nunca some dois Bônus de Rank
          no mesmo teste.
        </P>
        <Warning title="Onde o Bônus de Rank soma NÃO é o mesmo que quais perícias você tem">
          <P>
            Esta é a confusão mais fácil de cometer no pilar inteiro, e ela custa caro na mesa. A tabela
            acima diz onde o seu Bônus de Rank <b>soma</b>. Ela não diz que você <b>tem</b> essas perícias.
          </P>
          <P>
            Um Ladino cujo Bônus de Rank cobre cinco perícias não é treinado nas cinco — ele soma o bônus
            naquelas que possui. Perícia se ganha de três formas, e só três: pela <b>Árvore Inicial</b> (Cap.
            1, §4), por raça/antecedente, ou comprando com PA. É por isso que cada árvore de Utilidade ensina
            duas perícias fixas <i>mais uma à sua escolha</i> quando é a sua Árvore Inicial: a escolha existe
            justamente porque a lista que o Rank cobre é maior do que o que um personagem consegue aprender.
          </P>
          <P>
            Na prática: se o seu Ladino nunca aprendeu Acrobacia, o Bônus de Rank dele não aparece em teste
            nenhum de Acrobacia — não há teste treinado pra somar. Aprenda a perícia primeiro; o bônus vem
            junto no mesmo instante.
          </P>
        </Warning>

        <SubTitle id="cap3-pp">Pontos de Preparação (PP)</SubTitle>
        <P>
          Magos gastam PM pra fazer algo acontecer agora. Guerreiros gastam PT pra aguentar o que está
          acontecendo agora. A Utilidade gasta um recurso que nenhum dos dois tem: PP serve pra declarar que
          algo <i>já aconteceu antes</i>.
        </P>
        <Aside title="Pontos de Preparação">
          <P>
            <b>PP Máximos = Intelecto + o atributo-chave da sua árvore</b> (mínimo 1), +1 por patamar a
            partir do terceiro. Ladino usa Agilidade, Bardo usa Espírito. Com mais de uma árvore de
            Utilidade, a reserva é única: o segundo termo é o maior entre seus atributos-chave de Utilidade
            (o do Tático entra como o Bônus de Rank dele, veja abaixo), e os +1 por patamar somam em todas as
            árvores do pilar. Recupera-se tudo em Descanso Longo.
          </P>
          <P>
            <b>Navegação e Liderança é a exceção</b>, porque o atributo-chave dela <i>é</i> Intelecto: nesse
            caso ele não conta duas vezes — some, no lugar, o seu <b>Bônus de Rank</b> naquela árvore. Sem
            essa cláusula, o Tático chegava ao teto investindo <i>um</i> atributo só, onde os outros precisam
            de dois.
          </P>
        </Aside>
        <P>
          Gastando 1 PP, você declara em voz alta um fato sobre o passado que passa a ser verdade no jogo.
          Cinco condições: (1) precisa caber no seu Escopo; (2) precisa caber no seu Domínio; (3) é sempre
          pretérito; (4) custa 2 PP se resolver o obstáculo central da cena; (5) o Mestre não pode negar, mas
          pode anexar uma complicação.
        </P>
        <Warning title="As quatro travas do fato — leia antes da primeira vez que alguém gastar PP">
          <P>
            É a mecânica mais divertida do pilar, e é onde a mesa mais briga. Quatro frases resolvem as quatro
            brigas:
          </P>
          <List
            items={[
              <span key="a">
                <b>Um fato nunca contradiz o que já foi mostrado na mesa.</b> Se o grupo viu o guarda entrar,
                ninguém declara que já o tinha subornado. PP reescreve o que estava <i>fora de cena</i>, não o
                que aconteceu na frente de todo mundo — essa é a linha, e ela não se negocia.
              </span>,
              <span key="b">
                <b>A complicação nunca desfaz nem anula o fato.</b> Ela cobra um preço <i>ao lado</i> dele: o
                informante existe, mas está bêbado; a corda está lá, mas alguém vai notar que sumiu. Um Mestre
                que responde com uma complicação do mesmo tamanho transformou &ldquo;não pode negar&rdquo; em
                enfeite.
              </span>,
              <span key="c">
                <b>O preço é dito antes.</b> Se o Mestre julga que o fato resolve o obstáculo central da cena,
                ele diz &ldquo;esse custa 2 PP&rdquo; <i>antes</i> de o fato valer, e o jogador pode desistir
                sem gastar nada. Ninguém paga o dobro por surpresa.
              </span>,
              <span key="d">
                <b>Fatos por sessão = o seu Bônus de Rank</b> naquela árvore. No Principiante é 1; no
                Imperador, 6. Sem isto, um Bardo com 15 PP encadeia quinze reescritas do mundo na mesma cena, e
                a mesa para de jogar a cena pra assistir a ficha dele. O limite é por sessão, não por cena:
                guardar o fato pro momento certo é metade da graça.
              </span>,
            ]}
          />
        </Warning>
        <Aside title="Domínio e Escopo">
          <P>
            <b>Domínio</b> é o que o fato pode tocar: coisas e lugares, pessoas e reputação, ou tempo e
            logística (tabela das Faixas, logo abaixo). <b>Escopo</b> é até onde ele alcança: o da Maestria
            mais alta da árvore cujo Domínio o fato usa. Escopos não se somam entre árvores — um Ladino
            Imperador com Bardo Principiante declara fatos sobre pessoas com o Escopo do Bardo.
          </P>
        </Aside>

        <SubTitle id="cap3-faixas">As Três Faixas</SubTitle>
        <P>
          A solução pra três árvores não virarem &ldquo;a mesma pessoa com roupa diferente&rdquo;: dividir o passado em
          três domínios que não se tocam, cada um travado numa faixa exclusiva de combate.
        </P>
        <BookTable
          headers={["", "Ladino", "Bardo", "Tático"]}
          rows={[
            ["Atributo-chave", "Agilidade", "Espírito", "Intelecto"],
            ["Domínio da Preparação", "Coisas e lugares.", "Pessoas e reputação.", "Tempo e logística."],
            ["Exemplo de fato", "“Essa fechadura eu já limei.”", "“O capitão da guarda me deve um favor.”", "“O suprimento deles acabou anteontem.”"],
            ["Faixa exclusiva", "Dano Furtivo.", "Estado emocional.", "Economia de ação."],
            ["A pergunta dele", "Como eu entro?", "Quem eu convenço?", "Onde e quando isso acontece?"],
          ]}
        />
        <Aside title="A Regra da Faixa">
          <P>
            Nenhuma habilidade pode invadir a faixa de outra árvore de Utilidade — um talento que dê Dano
            Furtivo a um Bardo, ou que deixe um Ladino conceder uma Ação, está errado. A Faixa vale só entre
            Ladino, Bardo e Tático; árvores do Corpo e de Magia cruzam essas linhas livremente.
          </P>
          <P>
            <b>Dano Furtivo, exatamente:</b> dano extra que o <i>próprio</i> personagem acrescenta ao
            <i> próprio</i> ataque, condicionado a surpresa ou posição. É essa definição que a Faixa protege —
            e é por isso que duas coisas que também causam dano ficam legitimamente de fora dela: a{" "}
            <b>Dissonância</b> do Bardo não é extra de um ataque (é área automática, sem ataque nenhum, e
            quem não ouve não sofre), e a <b>Ordem de Tiro</b> do Tático não é dano do próprio personagem (ela
            entra no golpe de um aliado, e sem esse aliado não existe). Cada um continua na sua faixa: o
            Ladino cobra posição, o Bardo cobra que escutem, o Tático cobra um aliado que acerte.
          </P>
        </Aside>
        <Aside title="Nota de Custo — Utilidade é mais barata">
          <BookTable
            headers={["Patamar", "Talento", "Técnica Assinatura ◆"]}
            rows={[
              ["1º e 2º", "1 PA", "2 PA"],
              ["3º e 4º", "2 PA", "3 PA"],
              ["5º e 6º", "3 PA", "4 PA"],
            ]}
          />
        </Aside>

        <SubTitle id="cap3-utilidade-combate">As Três Árvores em Combate</SubTitle>
        <P>
          A pergunta que todo jogador de Utilidade faz na terceira sessão é &ldquo;e eu, faço o quê?&rdquo;.
          Aqui está a resposta, lado a lado.
        </P>
        <BookTable
          headers={["Turno", "Ladino", "Bardo", "Tático"]}
          rows={[
            ["Antes", "Já sabotou o ambiente.", "Já sabe o que cada um quer.", "Já escolheu o terreno."],
            ["1º", "Primeiro Golpe — seu pico de dano do combate inteiro.", "Canção de Guerra — e ela dura o resto da luta de graça.", "Primeiro a Ver — o grupo age antes e na ordem que você quis."],
            ["2º", "Ponto Cego — derruba a viga, tranca os reforços.", "Insulto que Fica — puxa o inimigo mais perigoso para longe do mago.", "Manobra — reposiciona três aliados sem gastar as Ações deles."],
            ["3º", "Veneno, roubo do item-chave, Dano Furtivo.", "Coro — pavor, fúria ou devoção em 18 metros.", "Avante — Ação extra para o grupo inteiro."],
            ["4º", "Passo Vazio e reposicionamento.", "Sustenta, inspira, mantém todos de pé.", "Foco de Fogo e leitura da ordem de Iniciativa."],
            ["Nunca", "Trocar golpes na linha de frente.", "Ficar ao alcance de quem ele provocou.", "Achar que precisa causar dano."],
          ]}
        />
        <P>
          <b>A régua honesta.</b> Este parágrafo já disse que os três juntos somavam &ldquo;uns 30 de dano na
          luta inteira&rdquo;, e isso era mentira — bonita, mas mentira. Contando as cartas: no Imperador, o
          Dano Furtivo do Ladino é <b>+6d6 por turno</b> (uns 21), a Dissonância do Bardo é <b>6d4</b> (uns
          15) em <i>cada</i> hostil que o ouça, e a Ordem de Tiro do Tático entrega <b>6d6</b> de uma vez no
          golpe de um aliado. Um Deus do Norte Imperador bate cerca de 81 por turno.
        </P>
        <P>
          Então a régua verdadeira é esta: <b>uma árvore de Utilidade causa, sozinha, algo entre um terço e
          metade do dano de um guerreiro do mesmo patamar</b> — e o Ladino fica no topo dessa faixa de
          propósito, porque dano é a faixa exclusiva dele. Isso é o desenho, não um vazamento. O que a
          Utilidade <b>não</b> faz é substituir a linha de frente: ela causa esse dano de longe, uma vez por
          turno, e quase sempre depende de uma condição (estar Escondido, o alvo ter te ouvido, um aliado
          acertar). E continua sendo a razão de o combate ter começado com o grupo em cima do telhado, os
          reforços trancados do lado de fora, metade dos inimigos apavorados, e o chefe já sabendo que perdeu.
        </P>
        <P>
          <b>O teste do Apêndice B, aplicado às três:</b> cada árvore precisa ter, no patamar alto, ao menos
          uma habilidade que um mago Imperador não replica com magia nenhuma. Não Estive Aqui derrota
          adivinhação divina. A História Oficial decide o que o mundo acredita. A Guerra Já Acabou cancela um
          confronto antes de ele existir. Zero Absoluto não te consegue um informante, não te dá reputação, e
          não impede que o exército chegue.
        </P>
        <Aside title="Para o Mestre: como recompensar os três">
          <P>
            Dano é fácil de medir — está na ficha, em números. O valor da Utilidade não está, e por isso é
            fácil um Mestre esquecer de recompensá-lo. Três hábitos resolvem isso:
          </P>
          <List
            items={[
              "Narre a ausência do problema. Se o Ladino sabotou os reforços, diga em voz alta que eles não vieram — não deixe o efeito passar em silêncio.",
              "Dê PA por Preparação bem usada, do mesmo jeito que se dá por dano bem causado. A régua é a mesma: fez a mesa avançar, mereceu.",
              "Cobre a complicação que você mesmo anexou. Se o Mestre disse que o informante viu o Ladino, esse informante precisa aparecer de novo — e virar problema, mais cedo ou mais tarde.",
            ]}
          />
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap3-todas">Todas as Sub-árvores — Catálogo Completo</SectionTitle>
        <P>
          Magias, talentos, técnicas e Maestrias de cada uma das 19 sub-árvores, rank por rank. Clique no
          nome de uma árvore pra abrir o catálogo dela.
        </P>
        {(["magia", "corpo", "utilidade"] as const).map((category) => (
          <div key={category} className="space-y-3">
            <h3 className="scroll-mt-24 text-base font-bold text-wine-700 dark:text-wine-300" id={`cap3-todas-${category}`}>
              {CATEGORY_LABELS[category]}
            </h3>
            {TREES.filter((t) => t.category === category).map((tree) => (
              <details key={tree.id} open={arvoresAbertas} data-folhear-aberto={arvoresAbertas ? "" : undefined} data-categoria={category} data-arvore={tree.id} className="livro-arvore surface rounded-xl border border-parchment-300 bg-parchment-100/60 dark:border-parchment-800 dark:bg-parchment-900/40" id={`arvore-${tree.id}`}>
                <summary className="livro-arvore-cabeca flex scroll-mt-24 cursor-pointer list-none items-center gap-3 rounded-xl p-3 hover:bg-parchment-200/50 dark:hover:bg-parchment-800/50">
                  <TreeCrest tree={tree} size={44} />
                  <span className="min-w-0">
                    <span className="font-bold text-parchment-900 dark:text-parchment-50">{tree.name}</span>
                    <span className="ml-2 text-xs text-parchment-600 dark:text-parchment-400">{tree.subgroup}</span>
                    {tree.tagline && (
                      <span className="mt-0.5 block text-xs italic text-parchment-600 dark:text-parchment-400">{tree.tagline}</span>
                    )}
                  </span>
                </summary>
                <div className="livro-arvore-corpo border-t border-parchment-300 p-3 dark:border-parchment-800">
                  <RetratoDaArvore id={tree.id} nome={tree.name} />
                  <TreeCatalog tree={tree} />
                </div>
              </details>
            ))}
          </div>
        ))}
      </Section>

      <FimDoCapitulo id="cap3" />
    </div>
  );
}
