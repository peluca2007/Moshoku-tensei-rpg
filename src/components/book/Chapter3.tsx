import Link from "next/link";
import { TREES, CATEGORY_LABELS } from "@/data/trees";
import { RANK_BONUS, RANKS } from "@/lib/types";
import { Aside, BookTable, ChapterTitle, List, P, Quote, Section, SectionTitle, SubTitle, Warning } from "./BookUI";
import { EscadaDeDados, EtapasDoTiroPerfeito, TrianguloDosEstilos } from "./Diagramas";
import TreeCatalog from "./TreeCatalog";
import ArteDaHabilidade from "./ArteDaHabilidade";
import { ARTE_EXPLOSAO_DE_AURA, ARTE_LAMINA_DE_TOUKI } from "@/data/midiaDeHabilidade";
import TreeCrest from "../TreeCrest";

export default function Chapter3() {
  const rankLabelTrees = TREES.filter((t) => t.rankLabels);

  return (
    <div className="space-y-8">
      <ChapterTitle id="cap3">Capítulo 3 — As Árvores de Progressão</ChapterTitle>
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
        <Aside title="Quem veste Touki">
          Toda sub-árvore da Árvore do Corpo desbloqueia o Touki no terceiro patamar — inclusive Arquearia,
          inclusive Escudos. A única exceção é o Estilo Deus da Espada, que desperta a aura no segundo
          patamar (a doutrina inteira dele é velocidade). As árvores de Magia e de Utilidade nunca recebem
          Touki nem Pontos de Touki, por mais alto que seja o rank.
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
          &ldquo;Todas as Sub-árvores&rdquo;). O Deus da Espada sobe mais rápido (nove degraus no total, de
          propósito — é a identidade da árvore: &ldquo;o maior dano do livro&rdquo;); Cavalaria e
          Escudos sobe mais devagar, porque o valor dela está em proteger o grupo, não em dano. Confira o
          catálogo da árvore específica antes de calcular o dado final de alguém.
        </Warning>
        <P>
          Fórmula de dano marcial: <b>Dado de Arma (escalado) + Força + Bônus do Rank</b>. Qual Rank conta
          depende do tipo de ataque, e a regra tem exatamente dois casos — nunca um terceiro:
        </P>
        <List
          items={[
            <span key="comum">
              <b>Ataque comum (golpe simples, sem nome, sem técnica):</b> use o <b>maior</b> Rank que você
              tiver entre todas as suas árvores do Corpo. Um personagem com Norte Santo e Espada Principiante
              rola os degraus do Norte Santo (o maior dos dois) em qualquer golpe comum, não importa com qual
              arma.
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
          aço, reforça o fio da lâmina e amplifica força, velocidade e reflexos. Rank Intermediário é o mais
          alto que alguém alcança sem Touki: do Avançado em diante (2º patamar no Deus da Espada), todo
          guerreiro veste aura.
        </P>
        <Aside title="Pontos de Touki (PT) — as duas reservas">
          <P>
            <b>PT Menor</b> — do 1º patamar em diante: PT iguais ao seu Vigor (mínimo 1). Não é aura, é
            fôlego — paga técnicas, e nada mais.
          </P>
          <P>
            <b>PT Pleno</b> — a partir do 3º patamar (2º no Deus da Espada): a reserva passa a ser Espírito +
            Vigor, e você desbloqueia o Manto de Touki e as manobras de gasto abaixo. <b>Crescimento:</b> +1
            PT por patamar que já tenha PT Pleno em qualquer árvore do Corpo — o 2º patamar do Deus da Espada
            já conta pra essa soma (é o único caso do livro em que o PT Pleno começa antes do 3º patamar, e a
            exceção vale exatamente pra essa conta também, não só pro desbloqueio do Manto). Cavalaria e
            Escudos concede +2 por patamar em vez de +1, por gastar PT mais rápido que qualquer outra árvore.
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
          contra projéteis mundanos igual ao dobro do Bônus de Rank (e nunca sofre crítico deles); ataques
          desarmados e com objetos improvisados contam como mágicos. <b>O Manto não consome PT e continua
          ativo mesmo com a reserva de PT em 0</b> — ele é vestido pelo Rank, não comprado com o recurso; só
          PT paga as manobras de gasto da tabela abaixo, nunca a existência do Manto em si.
        </P>
        <BookTable
          headers={["Custo", "Manobra", "Efeito"]}
          rows={[
            ["1 PT", "Touki Concentrado", "Sem Ação. Até o fim do turno, some seu Bônus de Rank ao dano de novo e reduza todo dano físico recebido pelo mesmo valor."],
            ["1 PT", "Lâmina de Touki", "Sem Ação. Por 1 minuto, sua arma corta pedra e aço, conta como mágica e ignora Resistência a cortante/perfurante."],
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
        </Warning>
        <P>
          Toda técnica do livro compra potência com <b>recurso</b>: PT, PM, PP. O Tiro Perfeito, da
          Arquearia, é a única que compra com <b>tempo</b> — e é por isso que ele é um sistema, e não uma
          habilidade. Quatro Ações num turno de três: ele <b>sempre</b> atravessa turnos.
        </P>
        <P>
          Cada etapa custa 1 Ação e pede um teste de <b>CD 12</b>, na ordem. A CD é fixa, e não a escada
          habitual de 8 + atributo + Rank, porque não há ninguém do outro lado resistindo: a dificuldade é da
          técnica, não de um alvo.
        </P>
        <EtapasDoTiroPerfeito />
        <BookTable
          headers={["Etapa", "Teste", "O que ela concede"]}
          rows={[
            ["1. A Corda", "Força", "+3 degraus no Dado de Arma deste disparo. Você puxa até o fim."],
            ["2. Os Dedos", "Agilidade", "Ignora Cobertura, e o disparo não pode ser aparado, desviado nem interceptado."],
            ["3. A Leitura", "Intuição — ou Intelecto/Espírito puro, o maior, se você não tem a perícia", "Vantagem no acerto, e o alvo não soma Agilidade na CA — você atirou onde ele ia estar."],
            ["(opcional) O Ponto", "Medicina (humanoide) ou Sobrevivência (fera, monstro)", "+1 Ação. Crita em 19-20 e ignora Resistência a dano."],
            ["4. A Solta", "o ataque normal", "O disparo, com tudo que as etapas acima concederam."],
          ]}
        />
        <Aside title="Falhar não interrompe">
          <P>
            Errar um teste não cancela a Preparação nem devolve as Ações: você apenas <b>não recebe o bônus
            daquela etapa</b> e segue para a próxima. Sem esta regra, um 7 no d20 jogaria fora dois turnos de
            jogo — e ninguém aposta dois turnos num tiro que uma rolagem ruim anula.
          </P>
          <P>
            Sofrer dano no meio é outra coisa: aí é <b>teste de Concentração</b> (Cap. 4, §3), como em
            qualquer efeito que atravessa turnos. Falhou, a Preparação inteira se perde.
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
                <b>Intermediário — Etapa Encurtada:</b> A Corda e Os Dedos passam a caber numa Ação só. O
                tiro inteiro cai de 4 para 3 Ações, e passa a caber num turno.
              </span>,
              <span key="3">
                <b>Avançado — Olho Que Já Viu:</b> a Leitura não pede mais teste. Ela passa sempre.
              </span>,
              <span key="4">
                <b>Santo — Ponto Vital Lido:</b> a etapa d&rsquo;O Ponto passa a custar 0 Ações.
              </span>,
              <span key="5">
                <b>Rei — Preparação Perfeita:</b> um Tiro Perfeito em que <b>todas</b> as etapas passaram
                fura o Manto de Touki, sem gastar PT. É a segunda forma de furar o Manto, e cobra em turnos
                o que a Flecha de Touki cobra em recurso.
              </span>,
            ]}
          />
        </Aside>

        <SubTitle id="cap3-triangulo">4. O Triângulo dos Estilos</SubTitle>
        <TrianguloDosEstilos />
        <Quote attribution="Lema do Estilo Deus da Espada">A vitória é de quem se move primeiro.</Quote>
        <Aside title="Regra da Vantagem de Estilo">
          Quando você luta contra um praticante do estilo que o seu contra-ataca, e ambos possuem Rank
          naqueles estilos: você rola com Vantagem em todas as Disputas contra ele, e as Reações defensivas
          dele falham automaticamente contra sua primeira Ação de cada turno. Se o Rank dele for dois ou
          mais acima do seu, a vantagem se anula — treino bruto supera a tabela de tipos.
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
          Duas árvores de Utilidade cobrem <b>Percepção</b> (Ladino, num sentido; Tático, noutro). Se você
          tiver Rank em ambas, use o <b>maior</b> Bônus de Rank entre as duas — nunca some os dois juntos, e
          nunca use os dois pra dobrar a vantagem no mesmo teste.
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
            Utilidade, a reserva é única — use o maior atributo-chave. Recupera-se tudo em Descanso Longo.
          </P>
          <P>
            <b>Navegação e Liderança é a exceção</b>, porque o atributo-chave dela <i>é</i> Intelecto: nesse
            caso ele não conta duas vezes — some, no lugar, o seu <b>Bônus de Rank</b> naquela árvore. Sem
            essa cláusula o Tático tinha a maior reserva de PP do livro (20 no Imperador, contra 15 do Bardo)
            investindo <i>um</i> atributo onde as outras duas árvores de Utilidade investem dois.
          </P>
        </Aside>
        <P>
          Gastando 1 PP, você declara em voz alta um fato sobre o passado que passa a ser verdade no jogo.
          Cinco condições: (1) precisa caber no seu Escopo; (2) precisa caber no seu Domínio; (3) é sempre
          pretérito; (4) custa 2 PP se resolver o obstáculo central da cena; (5) o Mestre não pode negar, mas
          pode anexar uma complicação.
        </P>

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
          Nenhuma habilidade pode invadir a faixa de outra árvore de Utilidade — um talento que dê Dano
          Furtivo a um Bardo, ou que deixe um Ladino conceder uma Ação, está errado. A Faixa vale só entre
          Ladino, Bardo e Tático; árvores do Corpo e de Magia cruzam essas linhas livremente.
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
          <b>A régua honesta:</b> contra um Norte Imperador batendo 81 por turno, os três juntos talvez somem
          30 de dano direto na luta inteira. E ainda assim eles são a razão de o combate ter começado com o
          grupo em cima do telhado, os reforços trancados do lado de fora, metade dos inimigos apavorados, e o
          chefe já sabendo que perdeu.
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
              <details key={tree.id} className="surface rounded-xl border border-parchment-300 bg-parchment-100/60 dark:border-parchment-800 dark:bg-parchment-900/40" id={`arvore-${tree.id}`}>
                <summary className="flex scroll-mt-24 cursor-pointer list-none items-center gap-3 rounded-xl p-3 hover:bg-parchment-200/50 dark:hover:bg-parchment-800/50">
                  <TreeCrest tree={tree} size={44} />
                  <span className="min-w-0">
                    <span className="font-bold text-parchment-900 dark:text-parchment-50">{tree.name}</span>
                    <span className="ml-2 text-xs text-parchment-600 dark:text-parchment-400">{tree.subgroup}</span>
                    {tree.tagline && (
                      <span className="mt-0.5 block text-xs italic text-parchment-600 dark:text-parchment-400">{tree.tagline}</span>
                    )}
                  </span>
                </summary>
                <div className="border-t border-parchment-300 p-3 dark:border-parchment-800">
                  <TreeCatalog tree={tree} />
                </div>
              </details>
            ))}
          </div>
        ))}
      </Section>
    </div>
  );
}
