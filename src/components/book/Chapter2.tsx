import { INCANTATION_LENGTH, RANKS } from "@/lib/types";
import { MAGIC_ACTIONS } from "@/data/trees/shared";
import { COMBINED_SPELLS } from "@/data/combinedSpells";
import { getTreeById, TREES } from "@/data/trees";

import { Aside, BookTable, ChapterTitle, FimDoCapitulo, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";
import LaboratorioDeFormulas from "./LaboratorioDeFormulas";
import Prancha from "./Prancha";
import { TabelaDaPotencia, TabelaDasEssencias, TabelaDasPalavras, TabelaDasPrimeirasFrases, TabelaDosMeios } from "./RegrasDaTeorica";
import { DesenhoAnotado, ExerciciosDaTeorica, FalaDaRoxy, LousaDaConta, RespostasDaTeorica } from "./AulaDaTeorica";

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
              <b>Magia de Suporte (4 escolas):</b> Cura, Desintoxicação, Magia Teórica e Espíritos e Feras. Espíritos e Feras é a
              menor lista de feitiços do livro, e a única cujo efeito principal age sozinho depois de
              conjurado.
            </span>,
          ]}
        />
        <P className="text-sm">
          Os dois grupos usam as mesmas regras de conjuração: o mesmo PM Máximo (Cap. 4, §1), o mesmo tempo de
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
            Ao encurtar, role a magia normalmente e <b>o dano total (dados + BC) cai pela metade</b>,
            arredondado pra baixo; a área de efeito é reduzida em um terço.
          </P>
          <P>
            <b>Por quê:</b> a Encurtada custa metade das Ações e entrega metade do dano — por Ação, empata com a
            Padrão. O que ela cobra é <b>mana</b>: o mesmo PM rende metade. Pressa custa caro, e a Conjuração
            Padrão continua sendo a jogada de quem tem tempo (e ainda ganha a Recitação Perfeita).
          </P>
          <BookTable
            headers={["Bola de Fogo (1d8 + BC 3), Principiante", "Ações", "Dano médio", "Dano por PM"]}
            rows={[
              ["Padrão", "2", "7,5", "7,5"],
              ["Encurtada", "1", "3,5", "3,5"],
            ]}
          />
          <P>
            <b>E a magia que não tem dados nem área?</b> Vácuo Localizado, Prisão de Ar e outras magias de
            controle puro têm <b>a duração reduzida à metade</b> ao encurtar. Se a magia também não tem
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
                <b>Dano:</b> o dano total (dados + BC) cai pela metade, arredondado pra baixo — o mesmo
                valor do Encantamento Encurtado, nunca mais que isso por padrão. Magia sem dados nem área perde metade da duração,
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
            existe onde o texto disser explicitamente. <b>Sem Cântico</b> (Vento, Santo),{" "}
            <b>Mão Silenciosa</b> (Cura, Avançado) e a <b>Maestria de Santo da Cura</b> concedem esse benefício
            nas escolas e ranks que nomeiam.
          </P>
        </Aside>
        <Warning title="Conjurar sem gastar Ação">
          <P>
            O Capítulo 4 §3 diz que tudo neste sistema é medido em Ações e que <b>não existe ação bônus</b>.
            Entre as conjurações, as exceções são estas, e todas têm nome:
          </P>
          <List
            items={[
              <span key="p">
                <b>A primeira Silenciosa de rank Principiante de cada turno</b>, para todo conjurador que
                conjura em silêncio. <b>Prodígio</b> (Antecedente Gênio) estende essa cortesia até o Avançado.
              </span>,
              <span key="i">
                <b>As Maestrias de Imperador</b> de Água, Fogo, Terra, Vento, Cura e Desintoxicação: uma vez
                por turno, uma magia daquela escola de rank Avançado ou inferior, em Silenciosa, sem gastar
                Ação.
              </span>,
              <span key="ml"><b>Mãos Limpas</b> (Desintoxicação, Santo): uma magia de Desintoxicação sem gastar Ação, uma vez por Descanso Longo.</span>,
              <span key="gc"><b>O Grande Círculo</b> (Espíritos e Feras, Imperador): um invocado por turno sem gastar Ação — dois, com Convocação Aprimorada.</span>,
            ]}
          />
          <P>
            Fora das conjurações, cartas como <b>Sem Peso</b> e <b>Encadeamento</b> também dizem quando um
            efeito não gasta Ação; siga o limite escrito em cada uma (Cap. 3).
          </P>
          <P>
            <b>Nenhuma delas conta no Teto de Ações</b> (Cap. 4, §5: 4 próprias + 2 concedidas).
            Elas não gastam Ação, então não há Ação pra contar — e também não são uma das 2 concedidas. Cada
            fonte vale o que a carta dela diz, e nada além.
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
            <span key="save"><b>Feitiço que impõe Teste de Resistência:</b> os alvos resistem com <b>Desvantagem</b>.</span>,
            <span key="rit"><b>Ritual ou Feitiço sem rolagem (suporte, barreira, cura):</b> a magia <b>custa PM a menos igual ao seu Bônus de Rank</b> na respectiva escola, mas nunca menos de 1 PM.</span>,
          ]}
        />
        <P>
          O bônus só existe na <b>Conjuração Padrão</b>. A Encurtada pula versos e a Silenciosa não tem voz: nas
          duas não há cântico inteiro pra recitar, e por isso elas nunca recebem esta recompensa.
        </P>
        <P className="text-xs text-parchment-600 dark:text-parchment-400 italic">
          Nas <b>Canções de Bardo</b> (Árvore de Utilidade), a recitação dá Vantagem na rolagem ou +2 na CD;
          se não houver rolagem, a Canção custa 1 PP a menos (mínimo 1).
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
            Isso não é punição: são as <b>magias rápidas de propósito</b>. Prontidão
            é uma Reação — um cântico de 140 caracteres a tornaria impossível de usar. Rejeitar a Morte
            dispara no instante em que o aliado cairia. Luz Absoluta sai em 3 Ações onde o rank Imperador
            pede 4. Nessas magias <b>a velocidade já É o benefício</b>, e o livro não paga as duas coisas.
          </P>
        </Warning>
        <BookTable
          headers={["Rank da Magia", "Piso do cântico (concede bônus a partir daqui)", "Teto de caracteres do cântico"]}
          rows={RANKS.map((rank) => [
            rank,
            `${INCANTATION_LENGTH[rank].min} caracteres`,
            `${INCANTATION_LENGTH[rank].max} caracteres`,
          ])}
        />
      </Section>

      <Section>
        <SectionTitle id="cap2-3">3. Tempo de Conjuração por Rank</SectionTitle>
        <P>
          A tabela abaixo governa o tempo padrão de Ações por rank da magia. No entanto, <b>nem toda magia segue rigidamente esta tabela</b>:
          um ritual de rank baixo pode pedir mais Ações, e uma magia de emergência pode pedir menos. Quem foge da
          tabela diz isso na própria carta.
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
        </P>
        <Warning title="Grande Obra — as magias de 5 e 6 Ações">
          <P>
            Seis magias do livro passam do teto de propósito, e elas são uma categoria, não exceções soltas.
            Uma <b>Grande Obra</b> custa <b>5 ou 6 Ações</b> — quase dois turnos, ou dois inteiros — e é sempre
            um <b>Ritual</b>: não encurta, não silencia, não se retoma. Interrompida em qualquer ponto, some
            junto com todo o PM (§6).
          </P>
          <P>
            <b>Ponto de Não Retorno.</b> A partir da segunda Ação gasta, a Grande Obra fica visível pra cena
            inteira: a maré começa a subir, o chão racha, o nome começa a ser dito. <b>Todo mundo sabe o que
            vem</b> — e tem um turno pra decidir o que fazer a respeito: correr até você, sair da área, ou
            aceitar. Uma Grande Obra transforma a cena de todo mundo, então a cena inteira ganha um turno pra
            reagir a ela.
          </P>
          <P>
            <b>Por que elas valem a espera.</b> Grandes Obras mudam <b>a cena</b>, não apenas um alvo.
            As seis são a Maré que Lembra o Vale (Água, Rei), A Noite de Uma Hora (Cura, Rei),
            O Nome Que Não Se Grita e O Chamado que Não se Recusa (Espíritos e Feras, Rei e Imperador),
            O Vale que Eu Desenho (Terra, Santo) e o <b>Meteoro</b> (§4), a única Grande Obra de Magia Combinada.
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
          <b>Onde consultar:</b> o catálogo do Cap. 3 lista as Magias Combinadas, seus custos e os ranks
          exigidos nas duas árvores.
        </P>
        <Aside title="Maestria e pré-requisitos">
          A Maestria dá o <i>direito</i> de aprender Magia Combinada; cada magia exige ainda as duas árvores
          e os ranks escritos na própria entrada.
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
          cruzando pilares diferentes (Magia + Corpo, Magia + Utilidade, Corpo + Utilidade).{" "}
          <b>Requisito:</b> Avançado ou superior nas duas árvores envolvidas.{" "}
          <b>Custo:</b> diferente das Magias Combinadas, estas <b>não custam PA</b> e não entram na ficha —
          quem cumpre o requisito já sabe fazer, e paga só o custo de cada lado inteiro (Ação, PM, PT ou PP, o
          que for de cada árvore). O efeito nunca é permanente, a menos que a tabela diga o contrário.
        </P>
        <BookTable
          headers={["Combinação", "Resultado", "Efeito"]}
          rows={[
            ["Estilo Deus da Espada + Magia de Fogo", "Lâmina em Chamas", "Gaste as Ações e o PM de uma magia de Fogo de rank Avançado ou inferior, mais 1 PT: por 1 minuto, seu Dado de Arma causa +1d8 de dano ígneo extra."],
            ["Navegação e Liderança + Magia de Terra", "Chão Preparado", "Antes de um combate previsto, gaste 1 PP pra declarar que já preparou o chão. Se a luta acontecer lá, sua próxima magia de Terra no combate tem +50% de área."],
            ["Furtividade e Armadilhas + Espíritos e Feras", "Familiar Furtivo", "Sua próxima invocação nasce com o seu Bônus de Rank de Furtividade e Armadilhas em Furtividade, e reporta o que viu sem gastar sua Ação pra perguntar."],
            ["Bardo e Interação + Magia de Cura", "Canção que Cura", "Enquanto sustentar uma Canção, cada magia de Cura que você conjurar recupera +1d8 extra em todos os alvos afetados."],
            ["Cavalaria e Escudos + Magia Teórica", "Broquel de Mana", "Uma vez por combate, com um escudo em mãos, gaste 1 PM: você ganha PV temporários iguais a 3 × seu Bônus de Rank de Magia Teórica, gastos antes dos seus PV."],
          ]}
        />
        <Aside title="Quando a combinação vira uma árvore própria">
          Às vezes duas árvores se encaixam bem demais pra caber numa única habilidade — o
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
          Subir de rank é compreender o elemento de um jeito novo. Roxy não comprou o Congelado; ela
          entendeu água fundo o bastante pra que o gelo pegasse sozinho em quem já estava molhado.
        </P>
        <P>
          As Maestrias são listadas dentro de cada árvore no catálogo do Cap. 3, marcadas com o símbolo ◈.
        </P>
      </Section>
      <Section>
        <SectionTitle id="cap2-6">6. Interromper uma Conjuração</SectionTitle>
        <P>
          Uma magia de rank Rei ou Imperador custa 4 Ações, mais que um turno. Como o Capítulo 4 permite dividir o
          cântico entre turnos, o conjurador passa rodadas inteiras <b>vulnerável e visível</b> antes de o
          feitiço sair. Por isso, interrupções nesse intervalo seguem as regras abaixo.
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
            Sempre que você <b>sofrer dano</b> enquanto estiver Conjurando, role{" "}
            <b>1d20 + Espírito + metade do seu maior Bônus de Rank (arredondada pra cima)</b> contra{" "}
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
            §7): um golpe enorme de um goblin continua sendo um goblin.
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
              "Ficar Atordoado, Paralisado, Incapacitado, Surdo ou Soterrado interrompe SEM teste — o cântico exige voz e postura. Surdo não derruba Conjuração Silenciosa. Congelado e Atolado não interrompem: você continua falando.",
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
              "Cada acerto pede um teste novo, com CD pelo rank de quem acertou. Um conjurador Avançado com Espírito 2 tem +4 no teste; contra CD 13, falha 40% em um teste e cerca de 78% em três.",
            ],
            [
              "Vácuo Localizado (Vento, Principiante)",
              "Magia de Vento",
              "Remove o ar em volta da cabeça por 1 turno. Sem teste contra rank igual ou inferior ao seu em Vento; contra superior, teste de Vigor. Não para Conjuração Silenciosa.",
            ],
            [
              "Selar (Magia Teórica)",
              "Magia Teórica",
              "Não interrompe: a magia é conjurada e barrada ao cruzar a fronteira do selo (§8). Erguer também não — levanta uma parede física, e magia atravessa.",
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
          As perguntas que toda mesa faz na primeira sessão, respondidas de uma vez.
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
              "NÃO. Toda área atinge todo mundo dentro dela, inclusive você e o grupo — é o preço de jogar magia grande, e é o que faz o posicionamento importar. A exceção se compra: a Maestria de Avançado das quatro escolas elementais (Fogo, Água, Vento e Terra) exclui até INTELECTO criaturas de cada área sua.",
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
              "Pode, e sem penalidade — conjurar não provoca ataque de oportunidade. O risco já está no Teste de Concentração: quem está adjacente é quem mais facilmente te faz falhar nele.",
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
              "Uma. Erguer uma segunda derruba a primeira, salvo carta que diga o contrário (ex.: Maestria de Santo da Cura, Vento Constante). Uma parede ou um selo da Magia Teórica conta como a sua sustentação; fórmulas armadas não (§8). Sustentar não gasta Ação, mas cai se você for Incapacitado ou cair a 0 PV.",
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
        <SectionTitle id="cap2-8">8. Magia Teórica — Três Palavras e uma Conta</SectionTitle>
        <Prancha id="cap2-8" />
        <P>
          A Magia Teórica não tem uma lista de magias: tem uma <b>frase</b>. Você escreve três palavras em mana
          — uma essência, um verbo, uma forma —, paga o PM e ela acontece. Ataque, parede, selo contra magia e
          armadilha saem da mesma frase: a defesa não é outra árvore, é o verbo <b>Erguer</b> (segura corpo) e o
          verbo <b>Selar</b> (segura magia).
        </P>
        <P>
          Esta seção é uma <b>aula em três lições</b>: a frase, a conta, e preparar e armar. No fim há três
          exercícios com resposta, e o Laboratório pra você montar as suas.
        </P>
        <Aside title="Quem pode desenhar">
          Pra desenhar uma fórmula você precisa ter Magia Teórica e conhecer as palavras dela; a essência de
          outra escola vem de graça com o Principiante daquela escola, ou por 1 PA na Teórica. Qualquer
          criatura que pague o PM pode <b>alimentar</b> uma fórmula já pronta, mesmo sem entendê-la.
        </Aside>

        <SubTitle id="cap2-8-frase">Lição 1 — A frase: essência, verbo e forma</SubTitle>
        <P>
          Toda fórmula tem três palavras, uma de cada: a <b>essência</b> diz <i>o que existe</i> (mana, fogo,
          vida…), o <b>verbo</b> diz <i>o que acontece</i> e é traçado por cima dela, e a <b>forma</b> fecha o
          contorno e diz <i>como o efeito se organiza</i>. A ordem em que você as desenha não muda nada.
        </P>
        <DesenhoAnotado titulo="A primeira fórmula: o Dardo Arcano" escolha={{}} />
        <P>
          Na entrada da árvore você já conhece a essência <b>Mana</b>, os quatro verbos e as formas{" "}
          <b>Círculo</b>, <b>Linha</b> e <b>Quadrado</b>. Só com isso já saem cinco magias:
        </P>
        <TabelaDasPrimeirasFrases />
        <TabelaDasPalavras />
        <P>
          Uma forma que não diz nada sobre o seu verbo não muda nada — e custa assim mesmo. Nenhuma combinação
          é proibida: Quadrado num Lançar só é PM jogado fora. Do <b>Avançado</b> em diante cabe um{" "}
          <b>segundo verbo</b> na mesma fórmula: Erguer + Selar é a parede que também barra magia. Quando Lançar
          anda com outro verbo, ele só leva o efeito longe — não fere.
        </P>
        <TabelaDasEssencias />
        <FalaDaRoxy>
          Você não decora feitiços, decora palavras, e escreve o que a situação pedir. Primeiro o que existe,
          depois o que acontece, por último o contorno.
        </FalaDaRoxy>

        <SubTitle id="cap2-8-custo">Lição 2 — A conta: a potência, mais 1 por palavra</SubTitle>
        <Warning title="A conta inteira">
          <b>PM = o custo da potência + 1 por palavra fora do básico.</b> O básico é Mana, o primeiro verbo e o
          Círculo. Outra essência, outra forma e o segundo verbo custam +1 cada; armar custa +2. A{" "}
          <b>potência</b> é o seu rank na Teórica — ou menos, se você quiser uma fórmula mais barata.
        </Warning>
        <TabelaDaPotencia />
        <LousaDaConta
          titulo="Conta na lousa: uma onda de fogo"
          escolha={{ rank: "Intermediário", essencia: "fogo", verbos: ["lancar"], forma: "onda" }}
        />
        <P>
          <b>Ferir e curar.</b> Lançar rola tantos d8 quanto o PM da potência, + BC, com 1d20 + BC contra a CA.
          Na Onda, cada um na área testa Agilidade contra CD 8 + BC, metade no sucesso. Vida cura os dados, sem
          o BC. <b>Uma fórmula desenhada que fere por turno</b>: você pode desenhar outras no mesmo turno, mas
          só uma delas causa dano. (As cartas da árvore são magia comum e não entram nessa conta.)
        </P>
        <P>
          <b>Segurar.</b> Erguer levanta uma parede com os PV da potência (Quadrado +50%, Terra +50%, somados).
          Ela segura corpos e projéteis até perder os PV; magia atravessa. Selar não tem PV e barra magia pela{" "}
          <b>Régua do Selo</b>: magia de rank igual ou abaixo da potência não atravessa; um rank acima atravessa
          com dados, área e duração pela metade; dois ou mais acima atravessam inteiras. Corpos, armas e Touki
          atravessam o selo.
        </P>
        <FalaDaRoxy>
          Erguer segura corpo. Selar segura magia. Troque os dois e o ogro atravessa o seu selo rindo, ou a Bola
          de Fogo atravessa a sua parede.
        </FalaDaRoxy>

        <SubTitle id="cap2-8-armar">Lição 3 — Preparar e armar</SubTitle>
        <TabelaDosMeios />
        <P>
          No ar, a fórmula sai na hora e custa as Ações de uma magia do rank da potência (§3). Em{" "}
          <b>giz ou pergaminho</b> você prepara 1 minuto antes e ativa com 1 Ação — só Lançar sozinho (o que fere ou
          cura) não se prepara: um tiro se desenha na hora. No ar, uma parede ou um selo tem até 12 m. <b>Sustentação:</b>{" "}
          uma parede ou um selo ativo é a sua sustentação (§7).
        </P>
        <P>
          Do <b>Santo</b> em diante você grava em pedra e <b>arma</b>: a fórmula preparada (+2 PM) dispara
          sozinha, uma vez, quando alguém entrar na área, alguém tocar o desenho ou outra fórmula sua cair.
          Lançar armado é a mina arcana. Uma armada por vez no Santo, duas no Rei, três no Imperador — e a
          fórmula armada não é sustentação: o limite dela é esse.
        </P>
        <LousaDaConta
          titulo="Conta na lousa: uma mina de fogo (Santo, em giz)"
          escolha={{ rank: "Santo", essencia: "fogo", verbos: ["lancar"], forma: "onda", meio: "giz", armada: true }}
        />

        <SubTitle id="cap2-8-cartas">As cartas são fórmulas decoradas</SubTitle>
        <P>
          As cartas da árvore (Cap. 3) são fórmulas dessa mesma frase, com os mesmos números. O que a carta vende
          é o que o desenho não tem: ela conjura <b>como magia comum, com cântico</b> — Recitação Perfeita,
          Encantamento Encurtado e Conjuração Silenciosa (§2) — e fica fora da regra de uma fórmula que fere por
          turno. Algumas ensinam uma <b>exceção</b> escrita na própria carta: nascer como Reação, cobrir uma vila
          inteira.
        </P>

        <SubTitle id="cap2-8-exercicios">Três exercícios</SubTitle>
        <P>Resolva com o que as três lições ensinaram. As respostas vêm logo abaixo, de cabeça pra baixo.</P>
        <ExerciciosDaTeorica />
        <RespostasDaTeorica />
        <P>
          Agora é com você. Abra o Laboratório, comece por um dos exemplos e troque uma palavra por vez: ele faz a
          conta, mostra os números e diz por que uma frase não sai do papel.
        </P>
        <LaboratorioDeFormulas />
      </Section>

      <FimDoCapitulo id="cap2" />
    </div>
  );
}
