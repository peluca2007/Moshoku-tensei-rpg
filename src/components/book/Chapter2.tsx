import { INCANTATION_LENGTH, RANKS } from "@/lib/types";
import { MAGIC_ACTIONS } from "@/data/trees/shared";
import { COMBINED_SPELLS } from "@/data/combinedSpells";
import { getTreeById, TREES } from "@/data/trees";
import { LIMITES_TEORICOS, RANKS_TEORICOS } from "@/lib/magiaTeorica";
import { Aside, BookTable, ChapterTitle, FimDoCapitulo, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";
import LaboratorioDeFormulas from "./LaboratorioDeFormulas";

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

/**
 * Cap. 2, §3: o PM que as magias do livro custam em cada rank, contado das
 * cartas das oito escolas (nada digitado à mão, pra não defasar). Devolve null
 * no rank em que nenhuma escola tem magia com PM.
 */
function pmDeReferencia(rank: (typeof RANKS)[number]) {
  const custos = TREES.filter((t) => t.category === "magia")
    .flatMap((t) => t.ranks.filter((r) => r.rank === rank).flatMap((r) => r.abilities))
    .map((a) => a.pmCost)
    .filter((c): c is number => typeof c === "number" && c > 0)
    .sort((a, b) => a - b);
  if (custos.length === 0) return null;
  return { min: custos[0], mediana: custos[Math.floor(custos.length / 2)], max: custos[custos.length - 1] };
}

export default function Chapter2() {
  return (
    <div className="space-y-8">
      <ChapterTitle
        id="cap2"
        numero="Capítulo 2"
        resumo="O que a magia cobra e onde ela para: cântico, tempo de conjuração, combinação entre escolas e Maestrias."
      >
        As Leis da Magia
      </ChapterTitle>

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
              <b>Magia de Suporte (4 escolas):</b> Cura, Desintoxicação, Magia Teórica e Invocação. Invocação é a
              menor lista de feitiços do livro, e a única cujo efeito principal age sozinho depois de
              conjurado.
            </span>,
          ]}
        />
        <P className="text-sm">
          Os dois grupos usam exatamente as mesmas regras: o mesmo PM Máximo (Cap. 4, §1), o mesmo tempo de
          conjuração (§3), o mesmo Bônus de Rank. A divisão é de assunto, não de mecânica.
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
          <P>
            Ao encurtar, role <b>metade dos dados de dano, arredondado pra cima</b>, e a área de efeito é
            reduzida em um terço. O BC continua sendo somado integralmente — a maestria não some, só a
            estrutura do feitiço fica instável.
          </P>
          <P>
            <b>Pra cima, e não pra baixo</b>, por um motivo curto: arredondando pra baixo, toda magia de UM
            dado encurtava para zero dados. A Bola de Fogo (1d8 + BC) virava só BC — o Encurtado apagava a
            magia inteira em vez de enfraquecê-la, e isso valia justamente nas magias que um Principiante tem.
          </P>
          <P>
            <b>E a magia que não tem dados nem área?</b> Amarra, Vácuo Localizado, Prisão de Ar e as outras de
            controle puro saíam pela metade das Ações sem perder absolutamente nada — encurtar era jogada
            grátis. Para elas vale uma regra só: <b>a duração cai pela metade</b>. Se a magia também não tem
            duração, ela simplesmente não pode ser Encurtada.
          </P>
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
                primeira do turno de graça); no Avançado a Silenciosa fica 1 Ação mais barata que a
                Encurtada; no Santo e no Rei as duas voltam a empatar; no Imperador não existe Encurtada, e a
                Silenciosa é o único jeito de encurtar.
              </span>,
              <span key="2">
                <b>Dano:</b> metade dos dados, arredondado <b>pra cima</b> — o mesmo valor do Encantamento
                Encurtado, nunca mais que isso por padrão. Magia sem dados nem área perde metade da duração,
                também como no Encurtado.
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
            <b>Mudar o formato</b> segue uma conta só, feita sobre a área já reduzida: uma{" "}
            <b>linha de X metros</b> vira um <b>cone de X/2 metros</b> ou uma <b>esfera de raio X/4
              metros</b> (e o caminho de volta multiplica). Uma linha de 18m vira cone de 9m ou esfera de
            4,5m de raio.
          </P>
          <P>
            <b>Segurar o disparo:</b> ao terminar a conjuração, declare um gatilho (&ldquo;se alguém
            atravessar a porta&rdquo;). Até o início do seu próximo turno, quando o gatilho acontecer, solte a
            magia gastando a sua <b>Reação</b> (essa é a única Reação que não derruba a conjuração, porque ela
            é o disparo). Enquanto segura, você continua <b>Conjurando</b> (§6): sofrer
            dano pede o Teste de Concentração, e falhar nele perde a magia como qualquer interrupção. Se o
            gatilho não vier até o início do seu turno, a magia se desfaz e o PM fica gasto.
          </P>
          <P>
            <b>Quando um talento ou Antecedente diz &quot;sem sofrer a penalidade de dano/área&quot;</b>, ele
            remove só o item 2 e/ou o item 3 — exatamente os que ele nomear. Os itens 1 e 4 nunca são
            removidos por nada, porque eles não são a penalidade: são a definição estrutural do próprio
            método. Um personagem com &quot;Conjuração Silenciosa sem penalidade de dano nem de área&quot;
            (ex: Antecedente Gênio) continua com o custo de Ação reduzido do item 1 <i>e</i> ainda escolhe o
            bônus de forma do item 4 — ele não perde nada, só ganha a remoção explícita do que foi citado.
          </P>
          <P>
            <b>De onde vem a Silenciosa:</b> de um Antecedente, de uma raça, de uma Maestria ou de um talento
            que diga isso com todas as letras. A <b>Silenciosa sem penalidade</b> segue a mesma régua: só
            existe onde o texto disser explicitamente. Os dois talentos que fazem isso — <b>Sem Cântico</b>{" "}
            (Vento, Santo) e <b>Mão Silenciosa</b> (Cura, Avançado) — ensinam a Silenciosa daquela escola, nos ranks que
            nomeiam, até a quem ainda não a tinha; quem já a tinha passa a conjurar ali sem a penalidade de dano e de área.
          </P>
        </Aside>
        <Warning title="Silenciosa sem gastar Ação — a lista fechada">
          <P>
            O Capítulo 4 §3 diz que tudo neste sistema é medido em Ações e que <b>não existe ação bônus</b>.
            Entre as conjurações, as exceções são estas, e todas têm nome:
          </P>
          <List
            items={[
              <span key="p">
                <b>A primeira Silenciosa de rank Principiante de cada turno</b>, para todo conjurador que
                conjura em silêncio.
              </span>,
              <span key="g">
                <b>Prodígio</b> (Antecedente Gênio): a mesma cortesia vale até o rank Avançado.
              </span>,
              <span key="i">
                <b>As Maestrias de Imperador</b> de Água, Fogo, Terra, Vento, Cura e Desintoxicação: uma vez
                por turno, uma magia daquela escola de rank Avançado ou inferior, em Silenciosa, sem gastar
                Ação.
              </span>,
            ]}
          />
          <P>
            Fora das conjurações, a outra família são as <b>manobras de Touki marcadas &ldquo;Sem
              Ação&rdquo;</b> (Cap. 3). Se você encontrar qualquer outra coisa que se comporte como ação
            bônus e não esteja nesta lista, é erro de texto, não regra.
          </P>
          <P>
            A cortesia do Principiante existe porque, sem ela, conjurar em silêncio num rank baixo custaria
            uma Ação inteira pra entregar metade dos dados e dois terços da área — ninguém usaria nunca, e o
            método mais característico do mundo de Mushoku Tensei morreria na ficha.
          </P>
          <P>
            <b>Nenhuma delas conta no Teto de Ações</b> (Cap. 4, §5: 4 próprias + 2 concedidas).
            Elas não gastam Ação, então não há Ação pra contar — e também não são uma das 2 concedidas. Cada
            fonte dá uma por turno.
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
            <span key="rit"><b>Ritual ou Feitiço sem rolagem (suporte, barreira, cura):</b> a magia <b>custa PM a menos igual ao seu Bônus de Rank</b> na respectiva escola, mas nunca menos de 1 PM.</span>,
          ]}
        />
        <P>
          O bônus só existe na <b>Conjuração Padrão</b>. A Encurtada pula versos e a Silenciosa não tem voz: nas
          duas não há cântico inteiro pra recitar, e por isso elas nunca recebem esta recompensa.
        </P>
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
            pede 4. Nessas magias <b>a velocidade já É o benefício</b>, e o livro não paga as duas coisas.
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
            a antiga Barreira, Cura, Desintoxicação, Invocação e Bardo estavam quase inteiras fora da escada.{" "}
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
        <SectionTitle id="cap2-3">3. Tempo de Conjuração por Rank</SectionTitle>
        <P>
          A tabela abaixo governa o tempo padrão de Ações por rank da magia. No entanto, <b>nem toda magia segue rigidamente esta tabela</b>:
          um ritual de rank baixo pode pedir mais Ações, e uma magia de emergência pode pedir menos. Quem foge da
          tabela diz isso na própria carta, com o motivo.
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
          Como o Capítulo 4 permite dividir o cântico entre turnos, magias de 4 Ações são perfeitamente
          jogáveis — elas só exigem que alguém segure a linha de frente enquanto o apocalipse é preparado.
          O teto da <b>tabela</b> é 4 de propósito: a escada antiga subia até 6 em toda magia de topo, e uma
          magia que custava dois turnos inteiros rendia menos por Ação que uma de dois ranks abaixo. O Rei e o
          Imperador continuam precisando de dois turnos; a diferença é que agora a espera paga.
        </P>
        <Warning title="Grande Obra — as magias de 5 e 6 Ações">
          <P>
            Cinco magias do livro passam do teto de propósito, e elas são uma categoria, não exceções soltas.
            Uma <b>Grande Obra</b> custa <b>5 ou 6 Ações</b> — quase dois turnos, ou dois inteiros — e é sempre
            um <b>Ritual</b>: não encurta, não silencia, não se retoma. Interrompida em qualquer ponto, some
            junto com todo o PM (§6).
          </P>
          <P>
            <b>Ponto de Não Retorno.</b> A partir da segunda Ação gasta, a Grande Obra fica visível pra cena
            inteira: a maré começa a subir, o chão racha, o nome começa a ser dito. <b>Todo mundo sabe o que
            vem</b> — e tem um turno pra decidir o que fazer a respeito: correr até você, sair da área, ou
            aceitar. Esse aviso não é um defeito do desenho, é o desenho: uma Grande Obra transforma a cena de
            todo mundo, então a cena inteira ganha um turno pra reagir a ela.
          </P>
          <P>
            <b>Por que elas valem a espera.</b> Nenhuma Grande Obra é &ldquo;mais dano por Ação&rdquo; — foi
            exatamente isso que fez a escada antiga de 6 Ações não funcionar. Elas fazem o que magia curta
            nenhuma faz: mudam <b>a cena</b>, e não o alvo. As cinco são a Maré que Lembra o Vale (Água, Rei),
            A Noite de Uma Hora (Cura, Rei), O Nome Que Não Se Grita (Espíritos e Feras, Rei), O Vale que Eu
            Desenho (Terra, Santo) e o <b>Meteoro</b> (§4), que é Magia Combinada e a única Grande Obra que
            exige duas escolas abertas.
          </P>
        </Warning>

        <SubTitle id="cap2-3-pm">PM de referência por rank</SubTitle>
        <P>
          Não é uma tabela de preço obrigatória: é o que as magias das oito escolas <i>de fato</i> custam,
          contado direto das cartas. Serve pro Mestre dar preço ao que inventar na mesa — uma combinação livre
          (§4), um feitiço de vilão, uma magia perdida numa ruína. O teto do que você pode gastar é o seu PM
          Máximo (Cap. 4, §1).
        </P>
        <BookTable
          headers={["Rank da Magia", "PM mais comum (mediana)", "Faixa no livro"]}
          rows={RANKS.flatMap((rank) => {
            const ref = pmDeReferencia(rank);
            return ref ? [[rank, `${ref.mediana} PM`, `${ref.min} a ${ref.max} PM`]] : [];
          })}
        />
      </Section>

      <Section>
        <SectionTitle id="cap2-4">4. Combinações entre Árvores</SectionTitle>
        <P>
          Duas árvores, cada uma no rank que a combinação pedir, não competem pelo mesmo personagem — elas se somam. Esta
          seção cobre a versão mais canônica disso (Magia Combinada) e depois abre a mesma lógica pro resto
          do livro: Corpo, Utilidade, e as combinações entre pilares diferentes.
        </P>

        <SubTitle>Magia Combinada</SubTitle>
        <P>
          Magias Combinadas são feitiços que fundem duas escolas num único lançamento, cujo resultado é
          maior que a soma das partes. O sistema detalhado e os efeitos
          fixos destas magias estão documentados na tabela abaixo — a fusão oficial de cada pilar.
        </P>
        <Warning title="Duas portas, cada uma com o próprio rank">
          <P>
            Cada Magia Combinada exige <b>duas árvores em ranks específicos</b> — e os dois ranks são
            diferentes entre si na maioria delas. O Meteoro quer <b>Fogo no Rei</b> e <b>Terra no
              Avançado</b>; a Barreira Incandescente se contenta com <b>Magia Teórica no Avançado</b> e{" "}
            <b>Fogo no Intermediário</b>. Não existe um &ldquo;Avançado nas duas&rdquo; genérico que abra a
            tabela inteira de uma vez.
          </P>
          <P>
            Isso é o que faz a tabela ser uma <i>lista de escolhas</i> e não um bloco: duas fichas que
            investiram fundo em escolas diferentes destravam Combinadas diferentes, e nenhuma delas
            destrava todas.
          </P>
          <P>
            <b>Elas custam PA</b>, como qualquer conhecimento — de 3 PA nas portas mais baixas a 8 PA no
            Meteoro. O PA sai do mesmo bolso que compra magia, atributo e perícia.
          </P>
        </Warning>
        <P>
          <b>Onde comprar:</b> no{" "}
          <a href="/arvores" className="text-wine-600 underline decoration-dotted hover:text-wine-500 dark:text-wine-300">
            mapa de Árvores
          </a>
          . O painel de Magias Combinadas mostra todas o tempo inteiro — as que você já comprou, as que
          estão abertas agora, e as trancadas <i>com as portas que faltam e o quanto falta em cada uma</i>.
          Uma Combinada aparece como disponível no instante em que a segunda porta abre.
        </P>
        <Aside title="Por que a Maestria do Avançado não basta mais">
          <P>
            Até a versão 0.0.9 a regra era &ldquo;rank Avançado nas duas escolas&rdquo;, e a Maestria do
            Avançado dizia que destravava Magia Combinada. Na prática isso significava que chegar ao
            Avançado em duas escolas quaisquer abria as nove de uma vez — e como nada no motor cobrava o
            PA que o texto prometia, elas eram, na prática, gratuitas.
          </P>
          <P>
            A Maestria continua sendo o que te dá o <i>direito</i> de aprender Magia Combinada. O que ela
            deixou de ser é a única condição: cada magia tem a porta dela.
          </P>
        </Aside>
        <BookTable
          headers={["Magia Combinada", "As duas portas", "Custo", "Ações", "Alcance", "Dano", "Efeito"]}
          rows={COMBINED_SPELLS.map((s) => [
            tex(s.name),
            s.requires.map((r) => `${getTreeById(r.treeId)?.name ?? r.treeId} ${r.rank}`).join(" + "),
            `${s.paCost} PA · ${s.pmCost} PM`,
            `${s.actions} Ações`,
            tex(s.range),
            tex(s.damage),
            tex(s.effect),
          ])}
        />
        <Aside title="Como uma Combinada se conjura">
          <List
            items={[
              <span key="bc">
                <b>BC:</b> use o maior BC entre as duas escolas das portas.
              </span>,
              <span key="forma">
                <b>Sempre inteira:</b> a Combinada não pode ser Encurtada nem Silenciosa, não tem cântico
                escrito e por isso não recebe Bônus de Recitação. As Ações dela são as da tabela, não as da
                escada do §3.
              </span>,
              <span key="rank">
                <b>Rank:</b> para Concentração, Rejeitar e tudo que pergunte o rank da magia, ela conta como o
                rank da porta mais alta.
              </span>,
              <span key="cura">
                <b>Combinadas com Cura contam como magia de Cura:</b> a Ferida Fresca dobra os dados da cura
                (o BC soma uma vez só) e o desconto do Juramento vale. O Relâmpago Santo fere, então
                conjurá-lo quebra o Juramento como qualquer magia de dano.
              </span>,
            ]}
          />
        </Aside>
        <P>
          Para combinações ad-hoc (não documentadas na tabela), a regra de ouro do Mestre vale:
        </P>
        <Aside title="Regra de Ouro para o Mestre">
          Se o jogador descrever uma combinação que faz sentido físico, deixe funcionar e invente o efeito na
          hora. Este sistema recompensa quem pensa como cientista — foi assim que Rudeus criou metade do
          arsenal dele. <b>O preço:</b> ele paga as Ações e o PM das duas magias inteiras. Se a mesa repetir a
          mesma combinação sessão após sessão, ela merece virar uma Combinada da campanha, comprada com PA
          como as da tabela (a tabela de PM de referência do §3 ajuda a dar o número). A mesma regra vale pra
          toda a seção abaixo (Combinações Além da Magia), não só pra Magia Combinada.
        </Aside>

        <SubTitle>Combinações Além da Magia</SubTitle>
        <P>
          A mesma lógica funciona entre <i>qualquer</i> duas árvores em Rank Avançado ou superior, mesmo
          cruzando pilares diferentes (Magia + Corpo, Magia + Utilidade, Corpo + Utilidade) — o livro só não
          documentava isso antes. <b>Requisito:</b> Avançado ou superior nas duas árvores envolvidas.{" "}
          <b>Custo:</b> diferente das Magias Combinadas, estas <b>não custam PA</b> e não entram na ficha —
          quem cumpre o requisito já sabe fazer, e paga só o custo de cada lado inteiro (Ação, PM, PT ou PP, o
          que for de cada árvore). O efeito nunca é permanente, a menos que a tabela diga o contrário.
        </P>
        <BookTable
          headers={["Combinação", "Resultado", "Efeito"]}
          rows={[
            ["Estilo Deus da Espada + Magia de Fogo", "Lâmina em Chamas", "Gaste a Ação e o PM de uma magia de Fogo de rank Avançado ou inferior, mais 1 PT: por 1 minuto, seu Dado de Arma causa +1d8 de dano ígneo extra."],
            ["Navegação e Liderança + Magia de Terra", "Chão Preparado", "Antes de um combate previsto, gaste 1 PP pra declarar que já preparou o chão. Se a luta acontecer lá, sua próxima magia de Terra no combate tem +50% de área."],
            ["Furtividade e Armadilhas + Espíritos e Feras", "Familiar Furtivo", "Sua próxima invocação nasce com o seu Bônus de Rank de Furtividade e Armadilhas em Furtividade, e reporta o que viu sem gastar sua Ação pra perguntar."],
            ["Bardo e Interação + Magia de Cura", "Canção que Cura", "Enquanto sustentar uma Canção, cada magia de Cura que você conjurar recupera +1d8 extra em todos os alvos afetados."],
            ["Cavalaria e Escudos + Magia Teórica", "Broquel de Mana", "Uma vez por combate, com um escudo em mãos, gaste 1 PM: você ganha PV temporários iguais a 3 × seu Bônus de Rank de Magia Teórica, gastos antes dos seus PV."],
          ]}
        />
        <Aside title="Quando a combinação vira uma árvore própria">
          Às vezes duas árvores em Rank Avançado se encaixam bem demais pra caber numa única habilidade — o
          Estilo Deus do Norte com a Magia de Vento, por exemplo, virou o <b>Estilo Vendaval</b>, uma
          sub-árvore inteira que só se revela pra quem cumpriu os dois pré-requisitos (Cap. 1,
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
      <Section>
        <SectionTitle id="cap2-6">6. Interromper uma Conjuração</SectionTitle>
        <P>
          Uma magia de rank Rei ou Imperador custa 4 Ações, mais que um turno. Como o Capítulo 4 permite dividir o
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
            <span key="a"><b>Você não pode fazer mais nada.</b> Andar é permitido: custa 1 Ação normal e move metade do Deslocamento; atacar, usar item, conjurar outra magia ou usar Reação, não. Usar uma Reação encerra a conjuração na hora.</span>,
            <span key="c"><b>Você não perde o progresso ao ser atacado</b> — perde ao <i>falhar no teste abaixo</i>. Sofrer dano não interrompe automaticamente.</span>,
          ]}
        />

        <SubTitle>O Teste de Concentração</SubTitle>
        <Warning title="A regra (a mesma do Cap. 4, §3)">
          <P>
            Sempre que você <b>sofrer dano</b> enquanto estiver Conjurando, faça um{" "}
            <b>teste de resistência de Espírito</b> contra{" "}
            <b>CD 10 + o Bônus de Rank de quem te acertou</b> — CD 11 contra um Principiante, CD 16 contra um
            Imperador. Use <b>12</b> quando não houver um responsável claro (uma queda, um desabamento, uma
            armadilha sem dono). Contra uma criatura, o <b>Bônus de Rank dela é o patamar dela</b> (+1 no
            Principiante a +6 no Imperador) — e vale o mesmo em toda regra que peça o Bônus de Rank de quem
            acertou, derrubou ou aplicou.
          </P>
          <List
            items={[
              <span key="s"><b>Sucesso:</b> o cântico segue. As Ações já gastas continuam valendo.</span>,
              <span key="f"><b>Falha:</b> a conjuração é interrompida. Você perde o cântico, <b>todas as Ações já gastas</b> e <b>metade do PM</b> investido, arredondado pra baixo. A magia não acontece.</span>,
            ]}
          />
          <P>
            <b>Quem te acertou decide, não o quanto ele rolou.</b> É a mesma lógica do Fio da Vida (Cap. 4,
            §7). O Cap. 4, §3 explica por que a CD NÃO é metade do dano: o dano cresce sem teto neste livro
            (uma criatura Imperador bate perto de 120 por turno) e o teste cresce até +11 num d20 — amarrada
            ao dano, a regra tornaria magia de 3 e 4 Ações impossível de conjurar exatamente nos patamares em
            que ela existe.
          </P>
        </Warning>
        <P>
          <b>Perda de Foco</b> (Cap. 4, §3) é a outra metade disto: você precisa gastar <b>ao menos 1 Ação
            por turno</b> recitando. Um turno inteiro sem dedicar nenhuma Ação derruba o cântico sozinho,
          sem ninguém precisar te acertar.
        </P>
        <Aside title="Quatro coisas que a CD já resolve, pra não virarem regra nova">
          <List
            items={[
              "Dano em área conta como UM acerto, e a CD vem do Rank de quem conjurou a área — não um teste por criatura atingida junto.",
              "Dano contínuo (Em Chamas, veneno, magma) força o teste no início do turno, quando cobra, com a CD do Rank de quem aplicou a condição.",
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
              "Não existe manobra especial: cause dano e deixe a CD trabalhar. E repare na conta, porque ela é o contrário da intuição: como a CD é fixa pelo RANK e não pelo dano, CADA acerto é um teste novo. Contra um conjurador, três golpes fracos derrubam o cântico muito mais que um forte — um Avançado com Espírito 2 falha 40% num teste, e 78% em três.",
            ],
            [
              "Vácuo Localizado (Vento, Principiante)",
              "Magia de Vento",
              "Remove o ar em volta da cabeça: o alvo não recita nada por 1 turno. Interrompe sem teste, e é a forma mais barata do livro.",
            ],
            [
              "Conter (Magia Teórica)",
              "Magia Teórica",
              "Ergue uma fronteira física com PV. Interrompe um trajeto ou uma linha de efeito enquanto estiver de pé; não anula magia automaticamente.",
            ],
            [
              "Rejeitar (Magia Teórica)",
              "Magia Teórica",
              "Barra magia que cruze a fronteira, comparando o rank da magia com a potência inscrita no selo. Exige aprender Rejeitar e pagar todos os componentes da fórmula.",
            ],
            [
              "Selo de Rejeição (Intermediário)",
              "Magia Teórica",
              "Modelo pronto de Conter + Rejeitar. Pode ser preparado antes do combate; não é uma anulação por Reação de qualquer magia no mapa.",
            ],
            [
              "Corte de Braço (Deus da Espada, Principiante)",
              "Estilo Deus da Espada",
              "Contra quem está Conjurando: se o golpe acertar, o Teste de Concentração daquele golpe tem Desvantagem. É a ferramenta própria do Corpo pra calar um mago.",
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
              "'Esfera de 9 m' é raio ou diâmetro?",
              "RAIO, sempre, em toda área do livro — uma Esfera de 9 m cobre 18 m de ponta a ponta. Cone e linha saem de VOCÊ. E quando a carta não diz onde a área nasce, o centro é um ponto que você enxergue a até 18 m (Principiante e Intermediário), 36 m (Avançado e Santo) ou 90 m (Rei e Imperador).",
            ],
            [
              "Área poupa meus aliados?",
              "NÃO. Toda área atinge todo mundo dentro dela, inclusive você e o grupo — é o preço de jogar magia grande, e é o que faz o posicionamento importar. A exceção se compra: quem tem a Maestria do Avançado de uma escola ofensiva pode excluir até INTELECTO criaturas de cada área daquela escola. Antes do Avançado, mire melhor.",
            ],
            [
              "A magia tem teste e a carta só descreve a falha. E se passar?",
              "Metade do dano e nenhuma condição. Vale para o livro inteiro, então nenhuma carta precisa repetir. E o contrário também tem padrão: magia que causa dano sem dizer 'teste' nem 'ataque' é um Ataque mágico — você rola 1d20 + BC contra a CA.",
            ],
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
              "Só com Conjuração Silenciosa — é um dos três Bônus de Forma dela (§2). Declare um gatilho; até o início do seu próximo turno, solte a magia gastando sua Reação. Enquanto segura, você está Conjurando. Fora isso, magia conjurada sai na hora.",
            ],
            [
              "Quantas magias posso sustentar?",
              "Uma. Erguer uma segunda derruba a primeira, salvo Maestria que diga o contrário (Cura do Santo sustenta duas). Circuitos da Magia Teórica têm limites próprios de células e carga registrados no desenho. Sustentar não gasta Ação, mas cai se você for Incapacitado ou cair a 0 PV.",
            ],
            [
              "E se eu ficar sem PM no meio?",
              "Você não pode começar uma magia que não consegue pagar. O PM é debitado quando a conjuração COMEÇA, não quando termina — é por isso que ser interrompido faz você perder só metade dele (arredondado pra baixo).",
            ],
            [
              "Falha crítica (1 natural) em magia?",
              "A magia falha e o PM se perde, como em qualquer erro. Não existe acidente mágico neste livro.",
            ],
            [
              "Duas magias iguais no mesmo alvo?",
              "O efeito não empilha: vale o maior, e a duração é reiniciada. Isso vale para condições, PV temporários e barreiras.",
            ],
          ]}
        />
      </Section>

      <Section>
        <SectionTitle id="cap2-8">8. Magia Teórica — Oficina de Fórmulas</SectionTitle>
        <Aside title="Proposta em teste, sujeita a mudanças">
          Magia Teórica substitui a antiga árvore de Barreira e Proteção. Defesa agora é o ramo de Conter e Rejeitar.
          Os custos e contratos das fórmulas ainda estão em teste e sujeitos a mudanças de equilíbrio.
        </Aside>
        <Aside title="Criar fórmulas é uma capacidade da árvore Magia Teórica">
          Para construir ou alterar uma fórmula, você precisa ter Magia Teórica no rank usado e conhecer
          todos os símbolos que inscreve. Outra árvore pode ensinar uma essência, como Fogo ou Som;
          aprender essa essência não concede a capacidade de compor fórmulas. Aqui no livro, qualquer
          leitor pode experimentar as combinações para estudar as regras.
        </Aside>
        <SubTitle>Comece com três peças</SubTitle>
        <P>
          Na entrada da árvore, você aprende Mana, Projetar, Expressar, Conter, Círculo,
          Quadrado e Linha. Rejeitar pode ser estudado por 1 PA. O núcleo diz <b>o que</b>{" "}
          existe, a inscrição sobre ele diz <b>o que acontece</b> e o contorno diz{" "}
          <b>como</b> o efeito se organiza.
        </P>
        <BookTable
          headers={["Primeira frase", "Resultado com mana no ar"]}
          rows={[
            ["Mana + Projetar + Círculo", "3 PM, 2 Ações: ataque a 9 m, 1d6 arcano."],
            ["Mana + Expressar + Círculo", "3 PM, 2 Ações: sinal sensorial de 1 turno, sem dano."],
            ["Mana + Conter + Quadrado", "4 PM, 2 Ações: parede física de até 3 m e 30 PV por 1 minuto."],
          ]}
        />
        <P>
          Tente trocar uma peça: Linha no Dardo Arcano aumenta o alcance para 13,5 m
          e o custo para 4 PM. Círculo no lugar de Quadrado deixa a parede com 20 PV,
          por 3 PM, e estende sua duração a 15 turnos. Um desenho novo com símbolos
          conhecidos não custa PA a cada uso.
        </P>
        <P>
          Uma fórmula é uma frase escrita em mana. O <b>núcleo</b> diz o que existe; os <b>operadores</b>{" "}
          são símbolos inscritos sobre esse núcleo. A flecha de <b>Projetar</b> atravessa o símbolo de
          Fogo: os dois traços formam um <b>glifo composto</b>. Pequenos números junto às inscrições
          indicam sua ordem. A <b>forma externa</b> modifica a saída, e o <b>meio</b> determina como o
          desenho é preparado.
        </P>
        <P>
          Nesta árvore, Barreira é o ramo de <b>Conter e Rejeitar</b>. <b>Mana → Conter</b> levanta uma fronteira física, enquanto{" "}
          <b>Mana → Rejeitar</b> barra magia. Quem conhece o símbolo de Fogo, Som ou Vida pode usá-lo em{" "}
          outra fórmula sem ganhar as magias prontas da árvore de origem. Um símbolo pode ser aprendido{" "}
          abrindo essa árvore ou comprado avulso por 1 PA.
        </P>
        <Aside title="Ler, construir e alimentar são coisas diferentes">
          Um teórico entende e desenha o circuito; qualquer criatura capaz de fornecer o PM necessário
          pode alimentar um desenho pronto, mesmo sem saber o que ele fará. PM extra não amplia o efeito:
          a capacidade já foi definida pela fórmula.
        </Aside>
        <SubTitle>O custo da frase</SubTitle>
        <P>
          Some o PM da essência, dos operadores e da forma. A primeira ação sobre o núcleo não cobra
          ligação extra; cada componente acrescentado depois custa +1 PM pela sobreposição, além de seu próprio custo;
          um gatilho custa +2 PM. O rank de <b>construção</b> limita o tamanho e o custo total;
          a <b>potência</b> define os números do efeito e não pode superar a construção.
          O alimentador pode ser outra pessoa, mas não pode ultrapassar o
          circuito que foi desenhado.
        </P>
        <P>
          Um glifo de Fogo com Projetar conta como <b>dois componentes</b>, mesmo formando um único desenho.
          O <b>Círculo</b> é o contorno básico, sem custo adicional: aceita uma projeção instantânea e,
          quando existe um efeito sustentado, multiplica sua duração por 1,5 dentro do limite do material.
        </P>
        <BookTable
          headers={["Construção", "Componentes", "PM máximo", "Cobertura se potência igual ao rank"]}
          rows={RANKS_TEORICOS.map((rank) => [rank, String(LIMITES_TEORICOS[rank].simbolos), String(LIMITES_TEORICOS[rank].pm), `${LIMITES_TEORICOS[rank].area} m`])}
        />
        <P>
          A ordem também é regra: <b>Expandir → Projetar</b> abre um cone na origem e reduz o alcance à metade;{" "}
          <b>Projetar → Expandir</b> conserva o alcance e abre a área no destino. As setas são uma legenda de leitura;
          no desenho, as ações ficam sobrepostas ao núcleo e recebem a numeração correspondente.
        </P>
        <P>
          Experimente abaixo. Comece com um dos três exemplos e mude uma peça por vez. O laboratório{" "}
          mostra o custo e explica por que uma combinação funciona ou ultrapassa o limite do rank.
        </P>
        <LaboratorioDeFormulas />
        <P className="text-sm">
          Esta oficina apresenta as regras em teste da Magia Teórica. O editor
          calcula uma célula por vez; fórmulas com várias células, talentos e armazenamento de PM ainda
          estão no documento de proposta e não são resolvidos aqui.
        </P>
      </Section>

      <FimDoCapitulo id="cap2" />
    </div>
  );
}
