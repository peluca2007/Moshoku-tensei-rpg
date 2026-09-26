import { VIGOR_FACTOR_TABLE } from "@/lib/types";
import Prancha from "./Prancha";
import { Aside, BookTable, ChapterTitle, FimDoCapitulo, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";
import { AnatomiaDoTurno, Cobertura, FioDaVida, OrdemDoDano, QuebrantadoEmpilha } from "./Diagramas";
import ArteDaHabilidade from "./ArteDaHabilidade";
import { ARTE_DO_FIO_DA_VIDA, ARTE_DO_TOUKI } from "@/data/midiaDeHabilidade";
import { CONDICOES, ESTADOS_DE_REGRA } from "@/data/condicoes";

export default function Chapter4() {
  return (
    <div className="space-y-8">
      <ChapterTitle
        id="cap4"
        numero="Capítulo 4"
        resumo="O turno inteiro, das Ações ao dano: condições, críticos, e o que acontece quando os PV acabam."
      >
        O Combate e a Sobrevivência
      </ChapterTitle>
      <P className="dropcap">Quando a diplomacia falha e as espadas são desembainhadas, o sistema adota um combate rápido, letal e tático.</P>

      <Section>
        <SectionTitle id="cap4-1">1. Cálculos Vitais</SectionTitle>
        <P>
          PV e PM não são calculados só na criação — eles crescem toda vez que você desbloqueia um Rank novo
          em qualquer árvore. As fórmulas abaixo são as que valem sempre, do 1º patamar ao Imperador; a ficha
          recalcula os dois números automaticamente a cada Rank novo.
        </P>
        <Aside title="PV Máximos = (14 + 1,67 × soma dos seus Dados de PV) × Fator de Vigor">
          <P>
            Uma linha, dois passos, nenhuma exceção:
          </P>
          <List
            items={[
              <span key="c">
                <b>1. O corpo treinado.</b> Some os Dados de PV de <b>todos</b> os patamares que você
                desbloqueou, em todas as árvores (use a média de cada dado, ou role, se a mesa preferir),
                <b> multiplique por 1,67</b> e some <b>14</b>. Esses 14 são o corpo com que todo
                mundo nasce.
              </span>,
              <span key="v">
              <b>2. O Fator de Vigor.</b> Multiplique tudo aquilo pelo fator da tabela abaixo, e arredonde
                pra baixo. <b>Cada ponto positivo de Vigor soma 20% à sua vida inteira.</b>
              </span>,
            ]}
          />
          <P>
            É só isso. Não existe piso, e nenhum patamar novo muda a forma da conta — desbloquear um Rank só
            acrescenta mais um Dado de PV ao passo 1. Os talentos de reserva (&ldquo;+N PV por
            patamar&rdquo;) entram somados DEPOIS do Fator de Vigor: se multiplicassem, uma compra de 1 PA
            valeria 2,6× mais numa ficha de Vigor 8 — exatamente a armadilha que o Cap. 1 desenha contra ao
            padronizar reservas. Tabela de referência com Vigor 0 (acumulado até o
            patamar): Escudeiro 27/44/64 PV (P→A); Lutador 29/44/62; Espada 27/42/59; Magia de Água
            19/25/34; Terra 22/32/44.
          </P>
        </Aside>

        <SubTitle id="cap4-vigor">A Escala do Vigor</SubTitle>
        <P>
          Vigor não governa nenhuma perícia (Cap. 1, §4): ele é a sua vida e a sua resistência, e nada mais.
          Por isso ele é o atributo mais fácil de largar no Sistema de Defeitos — e por isso a escala abaixo
          é <b>deliberadamente assimétrica</b>. Subir é linear; descer, não.
        </P>
        <BookTable
          headers={["Vigor", "Nome", "Fator de PV", "Testes de Vigor", "O que isso significa"]}
          rows={VIGOR_FACTOR_TABLE.map((v) => [
            v.vigor >= 0 ? `+${v.vigor}` : String(v.vigor),
            v.label,
            `×${v.factor.toFixed(2).replace(".", ",")}`,
            v.vigor === -1
              ? "Desvantagem."
              : v.vigor <= -2
                ? "Desvantagem, sem a metade do Bônus de Rank, e 1 ou 2 contam como 1 natural."
                : "—",
            v.vigor < 0
              ? `${Math.round(v.factor * 100)}% da vida de um corpo comum.`
              : v.vigor === 0
                  ? "A referência. Nenhum bônus, nenhuma penalidade."
                  : `+${v.vigor * 20}% de vida sobre o corpo comum.`,
          ])}
        />
       

        <Aside title="PM Máximos = (o maior entre o seu Espírito e 4) × Maior Bônus de Rank de Magia, + 8">
          <P>
            Uma linha, um &ldquo;o que for maior&rdquo;, e mais nada. <b>Escolas de magia não concedem PM
              nenhum</b> — a reserva inteira sai daqui. Árvores do Corpo e de Utilidade concedem <b>0 PM,
                sempre</b>, mesmo em rank Imperador; em troca, o Corpo recebe PT (Cap. 3). Sem nenhum patamar de
            magia, o Bônus é 0 e você fica com os 8 PM de base.
          </P>
          <P>
            <b>O &ldquo;maior entre Espírito e 4&rdquo;</b> é o que mantém jogável o mago que o Cap. 1
            promete como <b>cirurgião</b> (Intelecto alto, Espírito baixo — poucos tiros, todos letais). O
            custo das magias cresce dez vezes do 1º ao 6º patamar; sem esse mínimo, um Imperador de Espírito
            2 teria 20 PM e a assinatura da própria escola custaria mais que isso — ele nunca conseguiria
            conjurá-la. Se você tem Espírito 4 ou mais, essa metade da regra nunca entra na conta: é só{" "}
            <b>Espírito × Bônus + 8</b>.
          </P>
          <P>
            <b>Teto nos 2 primeiros ranks.</b>{" "}
            Enquanto o Maior Bônus de Rank de magia for 1 ou 2
            (Principiante/Intermediário), a reserva TOTAL não pode passar de{" "}
            <b>4 × MB + 8 + talento + racial</b> — o que dá 12 PM sem nada, 14 com Nascente de Mana, 15
            com Migurd. É o equivalente numérico do &ldquo;no máximo 4 casts&rdquo; da assinatura do
            rank (1 PM no Principiante, 3 PM no Intermediário). Repare no <b>4 fixo</b>: nos dois primeiros
            ranks, <b>Espírito acima de 4 não aumenta PM nenhum</b>. Um mago de Espírito 6 no Intermediário
            calcula 20 e leva 16, igual ao de Espírito 4. É de propósito, e é o preço de a regra ser uma
            linha só — o <b>reator</b> que o Cap. 1 promete (Espírito alto, bombardeia o dia inteiro) só
            começa a aparecer no Avançado, quando o teto some e cada ponto de Espírito passa a valer o Bônus
            de Rank inteiro. Fora o atributo, o teto corta PA avulso da seção 2, antecedente e sub-tabela;
            talentos de árvore e bônus racial escaláveis (Elfo ×2, Migurd ×3) entram normalmente. A partir
            do Avançado, o teto deixa de valer.
          </P>
          <P>
            Exemplo: uma Água Imperador (Bônus +6) com Espírito 6 tem 6×6+8 = <b>44 PM</b> — o suficiente
            pra bancar a assinatura de Imperador de Água (Zero Absoluto, 20 PM) duas vezes, e sobram 4 PM.
          </P>
        </Aside>
        <List
          items={[
            <span key="ca"><b>Classe de Armadura (CA):</b> Base 10 + Agilidade. Cresce com armaduras, talentos e habilidades defensivas.</span>,
            <span key="ini"><b>Iniciativa:</b> 1d20 + Agilidade. Em empate, age antes quem tem maior Agilidade; persistindo, o jogador age antes do Mestre e, entre jogadores, eles combinam.</span>,
            <span key="res"><b>Teste de Resistência:</b> 1d20 + Atributo + <b>metade do seu maior Bônus de Rank</b> (arredondado pra cima), de qualquer árvore.</span>,
            <span key="desl"><b>Deslocamento:</b> 9 metros, exceto onde a raça indicar outro valor.</span>,
          ]}
        />
        <Aside title="O Rank conta no teste de resistência">
          <P>
            Metade do Bônus de Rank, arredondada pra cima: <b>+1</b> no Principiante e Intermediário, <b>+2</b> no Avançado
            e Santo, <b>+3</b> no Rei e Imperador. É o mesmo valor que o Manto de Touki usa, de propósito — não
            existe uma terceira escala pra decorar.
          </P>
          <P>
            Ele entra porque as CDs do mundo crescem mais rápido que os seus atributos: as criaturas do
            Apêndice G sobem <b>+10</b> de CD entre o 1º e o 6º patamar, e um atributo vai de 4 a 8 no mesmo
            período. Sem o Rank na conta, um veterano resistiria pior que um novato — e um personagem que
            tenha largado aquele atributo no Sistema de Defeitos falharia em quase tudo no fim da campanha.
          </P>
        </Aside>
        <Aside title="Por que 1,67, e por que 14">
          <P>
            Somar os dados crus não funciona: um Norte de Vigor 5 chegaria ao Imperador com pouco mais de 70
            PV, contra um Imperador da Espada causando perto de 130 de dano por turno — o combate acabaria
            antes de o segundo personagem agir. O multiplicador existe pra que a luta dure de duas a três
            rodadas em qualquer patamar: tempo pro curandeiro agir e pro Escudos se interpor.
          </P>
          <P>Os 14 pontos de base e o fator 1,67 mantêm o início arriscado e dão tempo de reação nos patamares altos.</P>
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-condicoes">2. Glossário de Condições</SectionTitle>
        <Warning title="Toda condição usada no livro está aqui, com número — nenhuma fica só no nome">
          Dezenas de magias e técnicas aplicam uma condição pelo nome (&ldquo;o alvo fica Amedrontado&rdquo;)
          sem repetir o efeito toda vez — é aqui, e só aqui, que cada uma delas tem sua definição completa.
          Se uma habilidade específica alterar o efeito padrão, a habilidade sempre vence.
          <br />
          <br />
          <b>Duração padrão:</b> se a habilidade não diz quanto a condição dura, ela vai até o{" "}
          <b>fim do próximo turno do alvo</b>. Quando uma condição dura outra coisa, o verbete dela diz.
        </Warning>
        {/*
          A tabela sai de `src/data/condicoes.ts` desde a 0.1.23, e não mais de
          24 linhas escritas à mão aqui.

          O motivo é o mesmo do resto do livro: a ficha marca condição com
          duração e a prosa das habilidades linka pro verbete, então a definição
          passou a ter TRÊS leitores. Escrita em três lugares, ela divergiria no
          primeiro ajuste de regra — e a divergência apareceria como o livro
          dizendo uma coisa e a ficha cobrando outra na mesa.
        */}
        <BookTable
          headers={["Condição", "Efeito"]}
          rows={[...CONDICOES, ...ESTADOS_DE_REGRA]
            .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
            .map((c) => [c.nome, c.efeito])}
        />
        {/* A única condição da tabela que ACUMULA, e por isso a única que uma
            linha de tabela não consegue mostrar: o efeito dela é a pilha. */}
        <QuebrantadoEmpilha />
      </Section>

      <Section>
        <SectionTitle id="cap4-3-acoes">3. A Economia de Ações (As 3 Ações)</SectionTitle>
        <P>
          No seu turno você possui 3 Ações, além de 1 Reação (usada fora do seu turno, em situações
          específicas). Não existe ação bônus neste sistema — tudo é medido em Ações. As exceções são
          nomeadas, e são só estas: a primeira Conjuração Silenciosa de rank Principiante em cada turno
          (Cap. 2, §2) e as manobras de Touki marcadas &ldquo;Sem Ação&rdquo; (Cap. 3).
        </P>
        <List
          items={[
            <span key="andar"><b>Andar (1 Ação):</b> mova-se até o Deslocamento. Gastando as 3 Ações, corra o triplo da distância. Em <b>terreno difícil</b>, cada 1,5 m custa 3 m de Deslocamento.</span>,
            <span key="atacar"><b>Atacar com Arma (1 Ação):</b> um golpe corpo a corpo ou um projétil disparado.</span>,
            <span key="conjurar"><b>Conjurar Magia (custo variável):</b> consulte a Tabela de Tempo de Conjuração (Cap. 2). O rank da magia dita quantas Ações ela custa.</span>,
            <span key="item"><b>Usar Item (1 Ação):</b> beber uma poção, aplicar curativo, sacar uma arma da bainha.</span>,
            <span key="interagir"><b>Interagir / Ajudar / Se Esconder (1 Ação):</b> abrir uma porta, dar cobertura a um aliado, buscar esconderijo. Se Esconder exige Cobertura, escuridão ou estar fora da vista, e pede um teste de Agilidade (Furtividade) contra 10 + Espírito de cada inimigo que possa te procurar; o que ficar Escondido te dá está no Glossário (§2).</span>,
          ]}
        />
        <Aside title="A Regra de Ouro: Conjuração Contínua e Dividida">
          <P>
            Magias poderosas exigem mais Ações do que você tem num turno — o sistema permite dividir o
            cântico. Exemplo: gaste 1 Ação recitando neste turno, 1 Ação andando pra trás de uma árvore
            (metade do Deslocamento), 1 Ação recitando de novo; no próximo turno, gaste mais 2 Ações e
            finalmente solte a magia. Enquanto Conjura, <b>Andar custa 1 Ação normal e move metade do
            Deslocamento</b>.
          </P>
          <P>
            <b>Perda de Foco:</b> pra manter a mana canalizada, você é obrigado a gastar pelo menos 1 Ação
            por turno recitando. Se passar um turno inteiro sem dedicar nenhuma Ação, a magia falha, a mana
            se perde, e você recomeça do zero.
          </P>
          <P>
            <b>Interrupção:</b> se sofrer dano enquanto conjura, faça um teste de Espírito contra{" "}
            <b>CD 10 + o Bônus de Rank de quem te acertou</b> (CD 11 contra um Principiante, CD 16 contra um
            Imperador; use 12 se não houver um responsável claro). O Bônus de Rank de uma criatura é o
            patamar dela, de +1 a +6. Falhar significa perder o cântico, as Ações já gastas e{" "}
            <b>metade do PM investido</b> (arredondado pra baixo). É a mesma lógica do Fio da Vida (seção
            7): quem te acertou decide o quanto é difícil continuar, não o tamanho do número que ele rolou.
          </P>
          <P className="text-sm">
            O <b>Cap. 2, §6</b> expande esta regra: o que o estado &ldquo;Conjurando&rdquo; te impede de
            fazer, quais condições interrompem sem teste nenhum, o que acontece com um Ritual interrompido, e
            as formas deliberadas de derrubar o cântico de outra pessoa.
          </P>
        </Aside>
        <Aside title="Por que a CD usa o Rank de quem acerta">
          Amarrar a CD ao Rank de quem acerta mantém a conjuração sob pressão sem tornar impossíveis os cânticos de várias Ações.
        </Aside>
        <Aside title="Testes Resistidos (Disputas)">
          Nem todo conflito envolve uma CD estática. Empurrar um inimigo de um penhasco, disputar uma queda
          de braço, arrancar um item das mãos de alguém: ambos rolam 1d20 + o atributo do teste, com tudo o
          que cada um somaria num teste normal daquele tipo — Vantagem por perícia (Atletismo numa queda de
          braço), Bônus de Rank de árvore de Utilidade. Numa Disputa de corpo contra corpo — Força ou
          Agilidade, como empurrar, derrubar, desarmar ou se soltar de quem te agarra —, cada lado soma
          também <b>metade do seu maior Bônus de Rank</b> (arredondado pra cima), igual ao teste de
          resistência: um Imperador não empurra como um novato. Quem tirar o maior total vence. Em empate, a
          situação se mantém inalterada. Na Disputa, o 20 e o 1 naturais não têm efeito especial: vale o
          total. Exemplo: quem blefa rola Enganação contra a Intuição de quem escuta, cada um com a
          Vantagem da própria perícia, se a tiver. Ficar Escondido não é Disputa: tem CD fixa (Glossário,
          §2).
        </Aside>

        <SubTitle id="cap4-manobras">Empurrar, Derrubar e Desarmar</SubTitle>
        <P>
          Qualquer personagem pode trocar um ataque por uma manobra. Custa <b>1 Ação</b>, como Atacar com
          Arma, e é uma Disputa (acima): a sua Força contra a Força ou a Agilidade do alvo, à escolha dele.
          Se você vencer, escolha uma:
        </P>
        <List
          items={[
            <span key="empurrar"><b>Empurrar:</b> o alvo vai 1,5 m pra longe de você. Não provoca Ataque de Oportunidade — não foi ele quem decidiu sair.</span>,
            <span key="derrubar"><b>Derrubar:</b> o alvo fica Caído.</span>,
            <span key="desarmar"><b>Desarmar:</b> a arma ou o objeto que ele segura cai a 1,5 m dele, no ponto que você escolher. Pegar de volta é Usar Item (1 Ação). Quem empunha duas armas perde uma só.</span>,
          ]}
        />
        <P>
          <b>Agarrar não é manobra de qualquer um.</b> Prender alguém com o corpo é técnica, e mora nas
          árvores — o Agarrão do Lutador, as magias de Terra. O que esta seção dá a todo mundo é o outro
          lado: a Disputa pra se soltar (Agarrado, no Glossário).
        </P>
        <Aside title="Categorias de Tamanho">
          <P>
            <b>Pequeno</b> (até 1,2 m) · <b>Médio</b> (até 2,5 m) · <b>Grande</b> (até 5 m) ·{" "}
            <b>Enorme</b> (até 10 m) · <b>Colossal</b> (acima disso). Mede-se a maior dimensão do corpo,
            não o peso.
          </P>
          <P>
            Uma manobra desta seção só funciona contra alvo de <b>até 1 categoria acima da sua</b>: um
            humano derruba um urso, não uma wyvern adulta. Técnica que diga outro limite vence — o
            Arremesso do Lutador vai até duas.
          </P>
        </Aside>

        <SubTitle id="cap4-movimento">Alcance, Levantar, Queda, Voo e Montaria</SubTitle>
        <List
          items={[
            <span key="alcance"><b>Alcance corpo a corpo:</b> 1,5 m — o espaço ao lado. Lança e alabarda alcançam 3 m. É desse alcance que o Ataque de Oportunidade (§4) fala.</span>,
            <span key="levantar"><b>Levantar-se:</b> quem está Caído gasta metade do Deslocamento de um Andar pra ficar de pé, e anda a outra metade com a mesma Ação.</span>,
            <span key="queda"><b>Queda:</b> 1d6 de dano de queda por 3 m de altura, até 20d6, e você fica Caído. É esse o &ldquo;dano de queda&rdquo; que as árvores citam.</span>,
            <span key="voo"><b>Voo:</b> voar é Andar pelo ar, pelo mesmo custo. Quem está no chão te alcança corpo a corpo se você estiver até 1,5 m acima do alcance normal dele. Se ficar Atordoado, Paralisado, Incapacitado ou a 0 PV no ar, você cai e sofre a queda acima.</span>,
            <span key="montaria"><b>Montaria:</b> montar ou desmontar gasta metade do Deslocamento de um Andar. Montado, os seus Andares usam o Deslocamento da montaria. Ela não ganha Ações próprias: anda quando você anda.</span>,
            <span key="carga"><b>Limite de carga:</b> 15 kg × (Força + 5) — o máximo que você carrega e ainda anda.</span>,
          ]}
        />

        <SubTitle id="cap4-cobertura">Cobertura e Linha de Visão</SubTitle>
        <P>O que está entre você e quem atira determina sua Cobertura:</P>
        <BookTable
          headers={["Cobertura", "O que é", "O que dá"]}
          rows={[
            ["Parcial", "Metade do corpo protegida: um parapeito, uma mesa virada, um aliado no caminho, um tronco fino.", "+2 de CA e Vantagem em testes de resistência contra efeitos de área."],
            ["Superior", "Três quartos do corpo: uma seteira, a quina de um muro, um escudo de pavês cravado no chão.", "+5 de CA e Vantagem em testes de resistência contra efeitos de área."],
            ["Total", "Nada do corpo aparece: você está atrás da parede inteira.", "Não pode ser alvo direto de ataque nem de magia que exija ver o alvo. Área ainda te pega se o efeito dobrar a esquina."],
          ]}
        />
        <Cobertura />
        <Aside title="As três perguntas que a mesa faz sobre Cobertura">
          <List
            items={[
              <span key="empilha"><b>Cobertura empilha com escudo e armadura?</b> Sim: ela é do terreno, não do equipamento. Mas duas coberturas não somam — vale só a melhor. Atrás de um muro e de um aliado, você tem Superior, não +7.</span>,
              <span key="aliado"><b>Aliado dá Cobertura?</b> Dá Parcial, e só se ele for do seu tamanho ou maior. Ninguém se esconde atrás de um Povo Pequeno.</span>,
              <span key="quem"><b>Quem decide?</b> O Mestre, olhando a cena, com uma regra de bolso: se você consegue descrever o que está na frente, é Parcial; se precisa se espremer pra atirar de volta, é Superior; se não consegue atirar de volta, é Total.</span>,
            ]}
          />
        </Aside>

        <SubTitle id="cap4-duas-armas">Duas armas, uma em cada mão</SubTitle>
        <P>
          Qualquer personagem pode empunhar duas armas de uma mão — não custa PA, não exige talento nenhum e
          não precisa de permissão do Mestre. O que isso te dá é <b>um golpe a mais por turno</b>, e não um
          ataque a mais: as duas saem juntas, dentro da MESMA Ação.
        </P>
        <Aside title="O Golpe Duplo — 1 Ação, uma vez por turno">
          <P>
            Você ataca com as duas armas ao mesmo tempo. São <b>duas rolagens de acerto</b>, cada uma contra
            a CA do alvo (podem ser alvos diferentes, se estiverem os dois ao seu alcance):
          </P>
          <List
            items={[
              <span key="principal">
                <b>A mão principal</b> causa dano normal: Dado de Arma + Força + Bônus de Rank.
              </span>,
              <span key="apoio">
                <b>A mão de apoio</b> causa <b>só o dado</b>, <b>um degrau abaixo</b> na Escada de Dados
                (Cap. 3, §1) — sem somar Força, sem somar Bônus de Rank. É o golpe que você não treinou.
              </span>,
            ]}
          />
          <P className="text-sm">
            Uma vez por turno. As outras 2 Ações continuam valendo ataques normais, com a arma que você
            quiser — o Golpe Duplo é um acréscimo dentro de uma Ação, não uma quarta Ação.
          </P>
        </Aside>
        <P>E o que se paga por ele:</P>
        <List
          items={[
            <span key="permitido">
              <b>As duas têm que ser de uma mão.</b> Arma de duas mãos ocupa as duas, escudo ocupa uma.
              Sacar a segunda segue a regra normal: 1 Ação, ou livre se você tiver Três Bainhas.
            </span>,
            <span key="escudo">
              <b>Você abre mão do escudo</b> — da CA dele e do <i>Bloquear com Escudo</i> (§4) — e da mão
              vaga: beber poção, pegar corda ou agarrar exige guardar ou largar uma das armas antes.
            </span>,
            <span key="ca">
              <b>Duas armas não dão CA</b>, e a de apoio não vale em Reação defensiva (aparar, travar,
              devolver): essas Reações usam a arma principal.
            </span>,
          ]}
        />
        <Aside title="As três mãos do guerreiro, lado a lado">
          <P>
            <b>Duas mãos numa arma só:</b> o maior Dado de Arma, nos três ataques do turno. É o dano
            constante.
          </P>
          <P>
            <b>Arma e escudo:</b> menos dano, mais CA, e a Reação que anula um golpe inteiro. É a
            sobrevivência.
          </P>
          <P>
            <b>Uma arma em cada mão:</b> o dado menor, mas um golpe extra por turno e dois tipos de dano na
            mão — o cortante e o perfurante juntos, sem gastar Ação pra trocar de arma quando o couro
            resiste a um deles. E desarmar você exige tirar as duas.
          </P>
        </Aside>
        <Aside title="O que o treino muda">
          <P>
            <b>Empunhadura Dupla</b> (Deus do Norte, Intermediário — 1 PA) tira a parte fraca do Golpe
            Duplo: a mão de apoio passa a somar <b>Força e Bônus de Rank</b>, como um ataque de verdade.
            Ainda por cima, <b>+1 na CA</b> enquanto as duas estiverem empunhadas, e a arma de apoio passa a
            valer em Reação defensiva.
          </P>
          <P>
            <b>Mão Trocada</b> (Deus do Norte, Avançado — 2 PA) tira o degrau: a mão de apoio rola o{" "}
            <b>Dado de Arma cheio</b>, igual à principal. As duas mãos batem igual.
          </P>
          <P className="text-sm">
            Nenhuma das duas dá Ação extra, e o Golpe Duplo continua sendo <b>uma vez por turno</b> com os
            dois talentos comprados: seis golpes num turno não existem neste livro.
          </P>
        </Aside>
      </Section>
      <Section>
        <SectionTitle id="cap4-reacoes-combate">4. Reações e Ações Defensivas</SectionTitle>
        <P>
          O combate do sistema tem 3 Ações por turno e 1 Reação por rodada. Abaixo estão as opções
          básicas que qualquer personagem tem acesso, mesmo sem habilidades específicas:
        </P>
        <AnatomiaDoTurno />
        <BookTable
          headers={["Ação / Reação", "Custo", "Efeito"]}
          rows={[
            ["Ataque de Oportunidade", "1 Reação", "Disparado quando uma criatura hostil sai do seu alcance corpo a corpo sem usar a ação de Desengajar. Você realiza um ataque corpo a corpo comum."],
            ["Desengajar", "1 Ação", "Seu movimento neste turno não provoca Ataques de Oportunidade."],
            ["Esquivar", "1 Ação", "Até o início do seu próximo turno, você tem Vantagem em testes de resistência e o PRIMEIRO ataque contra você na rodada sofre Desvantagem. Demais ataques ocorrem normalmente."],
            ["Defender / Absorver", "1 Ação", "Você foca em absorver o impacto. Até o início do seu próximo turno, o PRIMEIRO ataque que te acertar tem o dano reduzido em (Vigor × 2) + o maior Bônus de Rank entre as suas árvores do Corpo (0 se não tiver nenhuma; a redução nunca fica negativa). O atacante não ganha nada por isso. Os ataques seguintes causam dano integral. A redução entra antes de Resistência e Vulnerabilidade (§6)."],
            ["Bloquear com Escudo", "1 Reação", "Ao ser atingido por um ataque físico que você veja, gasta sua Reação e ganha +5 de CA adicional (+2 sem proficiência em Escudos) contra aquele único ataque — o escudo já está na sua CA, e a Reação o crava no caminho do golpe. Se isso fizer o ataque errar, o dano é anulado; se ainda assim acertar, o dano daquele ataque cai pela metade. O bloqueio sempre faz alguma coisa."],
            ["Ajudar", "1 Ação", "Concede Vantagem no próximo teste de perícia ou de ataque de um aliado adjacente até o início do seu próximo turno. Se ele JÁ tem Vantagem, a ajuda vira +2 no teste (Vantagem não empilha — Cap. 1, §4). O +2 conta no Teto de Auxílio +6."],
          ]}
        />
      </Section>


      <Section>
        <SectionTitle id="cap4-4">5. Regras de Empilhamento</SectionTitle>
        <P>
          Com dezenove árvores no jogo, um grupo bem construído consegue empilhar bônus até quebrar a
          matemática. Estas regras impedem isso sem tirar a graça da combinação.
        </P>
        <Aside title="Bônus do mesmo tipo não somam">
          Se dois efeitos seus dão bônus ao mesmo número (CA, acerto, dano, deslocamento), use apenas o
          maior. <b>Exceção 1:</b> bônus concedidos por aliados diferentes que gastaram Ações somam
          normalmente — o Bardo cantando e o Tático apontando o alvo estão os dois trabalhando; ambos contam.{" "}
          <b>Exceção 2:</b> um Escudo empunhado soma com a armadura de corpo vestida — são equipamentos em
          slots diferentes, não dois efeitos competindo pelo mesmo bônus (é por isso que o kit inicial de
          Tank do Cap. 1 já vem com os dois juntos). Encantamento de CA (Cap. 5) também não compete com
          nada: o +1 entra no valor da própria armadura ou escudo (+3 vira +4).
        </Aside>
        <Aside title="Teto de Auxílio +6">
          Nenhum personagem recebe mais de +6 somados em bônus numéricos vindos de habilidades de aliados no
          mesmo turno. Acima disso, o excedente é ignorado.
        </Aside>
        <Aside title="Teto de Ações: 4 próprias + 2 concedidas">
          Nenhum personagem realiza mais de 6 Ações num turno: no máximo 4 próprias (as 3 do turno mais
          qualquer Ação extra vinda de Maestria ou passiva, como a Velocidade Encarnada do Deus da Espada) e
          no máximo 2 concedidas por aliados (Avante, Antecipação, Comando). Sem esta regra, um Norte
          Imperador com um Tático Comandante na mesa chega a 7 Ações por turno, e o combate deixa de existir.
        </Aside>
        <Aside title="Duas Salvações por Combate">
          <b>Qualquer efeito que deixe uma criatura com 1 PV ou mais em vez de 0, ou que a impeça de morrer, é uma Salvação</b> —Aguentar (Touki), Rejeitar a Morte (Cura), Sem Baixas (Tático), Custe o Que Custar e a versão Soberana (Escudos), a Égide Lendária (item de Rank S, Cap. 5), o Santuário Menor e o Santuário (Cura, as duas em área), e o que mais vier com essa forma. Nas magias de área, cada criatura que ela salva gasta uma Salvação daquela criatura.
          Cada criatura pode ser salva no máximo duas vezes por combate, e você não pode usar o mesmo método duas vezes no mesmo alvo.
          Três exceções nomeadas, todas do Escudos no Imperador, ficam fora desta conta: a Maestria <i>Enquanto Eu Estiver de Pé</i>, <i>O Muro Final</i> e <i>O Muro Final Soberano</i>. Elas não consomem Salvação nem são barradas pelo limite, porque o preço delas já é o corpo do Escudeiro.
          Qualquer terceira tentativa de salvação, de qualquer fonte, falha automaticamente, mas não consome o recurso de quem a ativou.
        </Aside>
        <Aside title="Vantagem é binária">
          Vantagem não empilha: dez fontes de Vantagem continuam sendo 2d20. Vantagem Absoluta (3d20) só vem
          de efeitos que digam explicitamente &ldquo;Absoluta&rdquo; — não existe 4d20 neste jogo. Vantagem e
          Desvantagem se cancelam uma a uma; Vantagem Absoluta contra Desvantagem simples resulta em
          Vantagem simples.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-5">6. Críticos, Touki e o Fio da Vida</SectionTitle>
        <List
          items={[
            <span key="20"><b>20 Natural (Crítico):</b> num ataque, acerta automaticamente, independente da CA do inimigo. Role os dados de dano duas vezes e some os bônus fixos uma vez só. O crítico <b>não fura Resistência a dano</b> (§6): quem quiser furar precisa de uma habilidade que diga isso, como O Ponto, do Suishin-ryū. Em teste de perícia ou de resistência, o 20 natural é sucesso automático.</span>,
            <span key="1"><b>1 Natural (Falha Crítica):</b> num ataque, você erra, e o Mestre escolhe <b>um de três</b>: você larga a arma (cai a 1,5 m), fica <b>Caído</b>, ou perde a Reação até o seu próximo turno. É um menu curto de propósito — a mesa não para pra inventar, e nenhum dos três causa dano nem mata. Em teste de perícia ou de resistência, o 1 natural é falha com uma complicação narrativa. Quando uma regra dá mais peso ao 1, ela diz (o Fio da Vida, seção 7, diz).</span>,
            <span key="disputa"><b>Na Disputa</b> (§3), o 20 e o 1 naturais não têm efeito especial: vale o total.</span>,
          ]}
        />
        <P>
          O Touki não gasta PM — consome Pontos de Touki (PT). A reserva de PT existe desde o 1º patamar de
          qualquer árvore do Corpo (Vigor + Espírito + 1 por patamar; 2 em Cavalaria e Escudos). No Avançado
          (3º patamar) você veste o Manto de Touki e destrava as manobras de gasto. Exceção: o Deus da Espada
          destrava Touki Concentrado e Lâmina de Touki no 2º patamar; o Manto e as outras manobras vêm no 3º.
          Regras completas no Capítulo 3.
        </P>
        <ArteDaHabilidade midia={ARTE_DO_TOUKI} />
        <Aside title="Por que magos temem espadachins">
          Um espadachim de rank Santo cruza 9 metros e decapita um mago antes que ele termine o segundo
          verso de uma magia Avançada. É por isso que a escola de Água investe tanto em barreiras, terreno
          difícil e empurrões — cada metro de distância é um verso a mais recitado vivo.
        </Aside>

        <SubTitle id="cap4-dano">Tipos de Dano: Resistência, Imunidade e Vulnerabilidade</SubTitle>
        <P>
          Dezenas de técnicas, raças e condições dão, ignoram ou furam Resistência. É aqui que isso vira
          número:
        </P>
        <List
          items={[
            <span key="res"><b>Resistência:</b> você sofre metade do dano daquele tipo (arredondado pra baixo).</span>,
            <span key="imu"><b>Imunidade:</b> você não sofre nenhum dano daquele tipo.</span>,
            <span key="vul"><b>Vulnerável:</b> você sofre o dobro do dano daquele tipo.</span>,
            <span key="empilha"><b>Não empilham.</b> Duas Resistências valem uma; Resistência e Vulnerável se anulam.</span>,
            <span key="ordem"><b>Ordem:</b> reduções fixas (Touki, Defender) entram antes; depois, Resistência, Imunidade ou Vulnerável.</span>,
          ]}
        />
        <Aside title="Os tipos de dano do livro">
          <P>
            <b>Cortante, perfurante e contundente</b> — os três formam o &ldquo;físico&rdquo;. Depois:{" "}
            <b>ígneo, frio, elétrico, radiante, sônico, veneno, ácido, psíquico, plasma, magma, queda e
            sufocamento</b>.
          </P>
          <P>
            <b>&ldquo;Mundano&rdquo;</b> é o dano que não vem de arma mágica, magia nem Touki. É por isso que
            a Lâmina de Touki fura a Resistência do Casco do Escudeiro: aço envolto em aura já não é mundano.
          </P>
          <P className="text-sm">
            Exemplo: um golpe de espada mundana de 17 cortante contra um Escudeiro Avançado que usou Defender
            (Vigor 0 e Bônus de Rank +3: redução de 3) e tem o Casco (Resistência a dano físico de arma mundana).
            Primeiro a redução fixa: 17 − 3 = 14. Depois a Resistência: 7.
          </P>
        </Aside>
        <OrdemDoDano />
      </Section>

      <Section>
        <SectionTitle id="cap4-6">7. Sangrando e Morrendo</SectionTitle>
        <Prancha id="cap4-6" />
        <P>
          Magia de cura pode fechar feridas, mas ressurreição beira o mito divino. Se seus Pontos de Vida
          chegarem a 0, você cai <b>Inconsciente</b> e entra em estado de Morte: Incapacitado e Caído, e
          ataque corpo a corpo de criatura adjacente contra você é crítico.
        </P>
        <SubTitle>O Teste do Fio da Vida</SubTitle>
        <P>
          No início de cada um dos seus turnos a 0 PV, role 1d20 + Vigor + metade do seu maior Bônus de Rank (arredondada pra cima) contra{" "}
          <b>CD 8 + o Bônus de Rank de quem te derrubou</b> (CD 9 contra um Principiante, CD 14 contra
          um Imperador; use 10 se não houver um responsável claro, como uma queda ou um desabamento). É um
          teste de resistência de Vigor como qualquer outro, então <b>A Escala do Vigor</b> (seção 1) vale
          aqui: Constituição Frágil rola com Desvantagem, e Corpo Quebrado rola com Desvantagem, sem a metade do Bônus
          de Rank, e sofre a Falha Crítica em 1 ou 2.
        </P>
        <List
          items={[
            "Sucesso: você fica Estabilizado — para de rolar o Fio da Vida e acorda com 1 PV em 1d4 horas, ou na hora com qualquer cura.",
            "Falha: você recebe 1 Marca da Morte.",
            "Falha Crítica (1 Natural): você recebe 2 Marcas da Morte.",
          ]}
        />
        <Aside title="Apanhar no chão, e segurar quem caiu">
          <P>
            <b>Sofrer dano a 0 PV</b> dá 1 Marca da Morte (2 se for crítico) e tira o Estabilizado — a Bola de
            Fogo que pega o aliado caído conta, e o golpe do inimigo que se ajoelha pra terminar o serviço
            conta em dobro, porque corpo a corpo adjacente contra quem está Inconsciente é crítico.
          </P>
          <P>
            <b>Qualquer um estabiliza</b> alguém a 0 PV com 1 Ação e um teste de Medicina CD 10 (Vantagem com
            Kit de Primeiros Socorros). Não precisa de curandeiro no grupo: precisa de alguém disposto a se
            ajoelhar no meio da luta.
          </P>
        </Aside>
        <Aside title="Quem te derrubou decide o quanto é difícil voltar">
          <P>
            Um goblin de estrada te deixa em CD 9 — você quase sempre estabiliza. Um Rei-Demônio te deixa em
            CD 14, e aí cada turno caído é uma aposta de verdade. É a mesma ferida; o que muda é a força que
            a abriu.
          </P>
        </Aside>
        <ArteDaHabilidade midia={ARTE_DO_FIO_DA_VIDA} />
        <FioDaVida />
        <P>
          Se acumular <b>3 Marcas da Morte</b>, você morre permanentemente. Qualquer magia de cura ou poção
          aplicada por um aliado remove todas as Marcas da Morte instantaneamente e você acorda — mas
          acordar do Fio da Vida cobra um preço: você volta com <b>1 nível de Exaustão</b> (seção 9 deste
          capítulo) até fazer um Descanso Longo.
        </P>

        <Aside title="Ferida Fresca">
          <P>
            Ferida Fresca é o dano sofrido <b>desde o início do último turno do próprio alvo</b> — a janela
            em que a carne ainda não começou a fechar sozinha. Contra ela, a Magia de Cura <b>dobra os DADOS
            da cura</b>; o BC soma uma vez só. Não se mede quanto dano foi: se o alvo sofreu qualquer dano
            nessa janela, mesmo que PV Temporários tenham absorvido tudo, a magia inteira rola os dados em
            dobro.
          </P>
          <P>
            É por isso que o curandeiro age cedo, e não depois: com BC 5, a Cura (1d8 + BC) devolve em média
            14 PV a quem caiu agora (2d8 + 5) e 9,5 a quem caiu há três turnos (1d8 + 5).{" "}
            <i>Selar a Ferida</i> (Cura, 1º patamar) existe exatamente pra esticar essa janela para uma hora
            — e sim, uma Ferida Selada continua contando como Fresca.
          </P>
          <P>
            <b>Poção não é magia</b> e não dobra: ela cura sempre o valor fixo dela (Cap. 5).
          </P>
          <P>
            A luz também fere — é a <i>Luz de Dois Gumes</i>, Maestria de 1º patamar da Magia de Cura —, mas o dobro
            da Ferida Fresca é só da cura. A exceção chega no Rei, com a <i>Culpa Fresca</i>, que usa a mesma
            janela: quem feriu um aliado seu desde o início do último turno desse aliado sofre a luz com o dobro dos dados (o BC soma uma vez só).
          </P>
        </Aside>

        <SubTitle id="cap4-cicatrizes">Cicatrizes de Quase-Morte</SubTitle>
        <Warning title="Quando a Morte Quase Ganha">
          <P>
            Sempre que você acumular <b>2 Marcas da Morte</b> antes de ser estabilizado, o trauma vai além do limite físico, deixando marcas profundas na carne ou na mente. Além de sofrer a Exaustão padrão, role 1d12 na tabela abaixo (ou escolha em conjunto com o Mestre) para adquirir uma Cicatriz. Caso o resultado seja uma sequela que você já possui, ela atinge um novo membro ou sentido.
          </P>

          <BookTable
            headers={["d12", "Cicatriz"]}
            rows={[
              ["1", "Ferimento Reaberto: A ferida arde sob esforço extremo. Desvantagem em testes de Vigor para evitar Exaustão ou fadiga."],
              ["2", "Articulação Rígida: Movimentos bruscos causam fisgadas de dor. Desvantagem em testes de Acrobacia e Furtividade."],
              ["3", "Fôlego Curto: Seus pulmões perderam capacidade. Desvantagem em testes de Atletismo focados em natação, apneia ou corrida prolongada."],
              ["4", "Zumbido Constante: Um tinido persistente atrapalha sua audição. Desvantagem em testes de Percepção que dependam puramente de som."],
              ["5", "Visão Desfocada: Dificuldade em focar os olhos após picos de adrenalina. Você sofre -2 de penalidade em todos os testes de Iniciativa."],
              ["6", "Nervo Pinçado: Suas mãos tremem de forma involuntária. Desvantagem em testes de Ladinagem e Ofícios que exijam coordenação motora fina."],
              ["7", "Trauma Noturno: O corpo recusa o relaxamento profundo. Ao fazer um Descanso Longo, role 1d20; com 5 ou menos, você recupera apenas metade dos seus Pontos de Magia e recursos diários."],
              ["8", "A Sombra Não Sai: Nenhuma penalidade física, mas Desvantagem em testes de resistência de Espírito contra Medo — o corpo lembra da morte, mesmo que a mente negue."],
              ["9", "Voz Quebrada: As cordas vocais foram gravemente danificadas. Você não consegue mais usar Encantamento Encurtado e tem Desvantagem em Atuação e Persuasão."],
              ["10", "Perna Manca: Os ossos não colaram direito e a musculatura atrofiou. Seu Deslocamento base sofre uma penalidade permanente de −3m."],
              ["11", "Olho Perdido: A visão periférica e de profundidade se foram. Desvantagem em Percepção visual e em qualquer ataque à distância além do alcance curto."],
              ["12", "Membro Perdido (Braço/Mão): Desvantagem em testes de Força e Atletismo. Você não consegue usar armas de duas mãos, nem empunhar arma e escudo ao mesmo tempo."],
            ]}
          />

          <P>
            A gravidade da sequela dita o limite do seu tratamento:
          </P>
          <ul>
            <li><b>Cicatrizes Menores (1 a 7):</b> Causam incômodos mecânicos e narrativos, mas o corpo ainda pode se recuperar. Elas são totalmente apagadas por <b>qualquer magia de Cura de rank Avançado ou superior, fora de combate</b>.</li>
            <li><b>Ferimentos Críticos (8 a 12):</b> Deixam marcas irreversíveis na estrutura do aventureiro. A única salvação conhecida é <i>Corpo Íntegro</i> (Cura, Rank Imperador) — capaz de reler o alvo por inteiro, apagando a Cicatriz e recriando membros perdidos. Sem esse milagre, nenhuma poção, descanso ou magia inferior resolverá o problema: poção tem efeito fixo e nunca copia magia, e nenhuma delas apaga Ferimento Crítico. É o preço da sobrevivência, e ele pesará na sua ficha pelo resto da campanha.</li>
          </ul>
        </Warning>

        <BookTable
          headers={["Descanso", "Recupera"]}
          rows={[
            [
              "Curto (1 a 2 horas)",
              "Recupera 25% dos seus PM e PP máximos (arredondado para baixo) e TODOS os seus PT. Não recupera Pontos de Vida (0%)."
            ],
            [
              "Longo (8 horas de sono seguro)",
              "Recupera TODOS os seus PM, PP e PT. Recupera PV iguais ao seu Vigor + 2 × o seu maior Bônus de Rank (mínimo 1) — dormir fecha pouco."
            ],
          ]}
        />
        <Warning title="Dois Curtos por dia, e nem um a mais">
          <P>
            Sem esse teto, o Descanso Curto quebra o livro inteiro, porque a Magia de Cura converte PM em
            PV. Um curandeiro de 1º patamar com <i>Juramento</i> cura cerca de 10 PV por 1 PM contra Ferida
            Fresca: a reserva cheia de 12 PM vale 120 PV, e cada Curto devolve 3 PM — mais 30 PV,
            indefinidamente. Um grupo de quatro personagens de 1º patamar tem cerca de 144 PV somados: sem
            teto, bastava sentar de hora em hora e a mesa voltava inteira todas as vezes.
          </P>
          <P>
            Com dois Curtos por dia, o curandeiro fecha o dia em 180 PV de cura — uma vez e meia a reserva
            cheia dele, e não um poço sem fundo. A noite devolve a reserva inteira, e o dia seguinte começa
            do mesmo lugar. PV volta a ser finito, e o Aviso abaixo — a promessa de que um grupo sem
            curandeiro sangra na segunda luta — continua verdade.
          </P>
          <P>
            <b>PT são a exceção</b>, e voltam inteiros em qualquer Descanso Curto — é por isso que a tabela
            acima os separa dos outros dois. O Touki é fôlego, não mana: recupera-se sentando.
          </P>
        </Warning>
        <Warning title="A Carne Não Fecha Sozinha">
          <P>Um corte não some porque você dormiu: a noite devolve só o seu Vigor + 2 × o Bônus de Rank. Fechar a ferida de verdade tem três caminhos:</P>
          <List
            items={[
              "Magia de Cura — rápida, cara em PM, do rank certo pro tipo de ferimento.",
              "Poções — caras em dinheiro, limitadas em estoque.",
              "Convalescença — uma semana inteira de cama, em lugar seguro, devolve todos os PV (Cap. 5, a atividade Recuperar-se).",
            ]}
          />
          <P>
            A exceção é de sangue, não de regra: a Regeneração Profunda do Demônio Imortal fecha a carne
            sozinha, mas só em combate. Fora dele, cada Descanso Curto devolve a ele PV iguais a 5 × o seu
            Maior Bônus de Rank — e o teto de dois Curtos por dia continua valendo.
          </P>
          <P>
            Um grupo sem curandeiro não perde combates — perde a campanha: vence a primeira luta, sangra na
            segunda, e na terceira decide voltar pra cidade porque o guerreiro está com um terço da vida e
            não existe descanso que resolva.
          </P>
        </Warning>

        <SubTitle id="cap4-trauma">Trauma de Combate</SubTitle>
        <Aside title="Quando o Corpo Sobrevive mas a Mente Cobra a Conta">
          <P>
            Sobreviver não é sair ileso. Sempre que você chegar a <b>0 PV</b>, testemunhar a morte de um
            aliado a até 9 metros, ou matar alguém que implorava por clemência, ganhe <b>1 ponto de Trauma</b>{" "}
            — a critério do Mestre, sem precisar contar cada goblin da estrada.
          </P>
          <P>
            <b>Efeito, pelo total de Trauma acumulado</b> (Vantagem é binária, então a escala tem degraus, e
            não um efeito por ponto):
          </P>
          <List
            items={[
              <span key="t1"><b>1 ou 2 pontos:</b> Desvantagem em testes de Espírito feitos <b>fora de combate</b> (persuasão calma, negociação, criar confiança, dormir sem pesadelo).</span>,
              <span key="t3"><b>3 pontos ou mais:</b> isso, e o sono também cobra: ao fazer um Descanso Longo, role 1d20; com 5 ou menos, você recupera só metade dos seus PM e PP.</span>,
            ]}
          />
          <P>
            Trauma não afeta nada dentro do combate — na hora da luta, o corpo simplesmente age.
          </P>
          <P>
            <b>Removendo Trauma:</b> gaste uma semana de Downtime na atividade Recuperar-se (Cap. 5)
            acompanhado de alguém de confiança — remove <b>1 ponto</b>, ou <b>2</b> se alguém gastar a
            própria semana em Vigiar as Costas por você. Ou resolva a causa de frente na narrativa — voltar
            ao lugar, encarar quem sobrou, fazer as pazes com o que aconteceu: cada cena assim resolvida
            remove <b>1 ponto</b>. Sem isso, o Trauma não passa sozinho: não existe teste de resistência nem
            Descanso Longo que apague o que aconteceu.
          </P>
          <P>
            Isto não é um sistema de sanidade: não há loucura, não há tabela de fobias, e não há perda de
            controle do personagem. É só o lembrete mecânico de que continuar lutando tem custo.
          </P>
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-aflicoes">8. Aflições do Mundo de Seis Faces</SectionTitle>
        <P>
          Além do dano que se vê na hora, o corpo pode ser atacado por caminhos mais lentos — veneno, doença,
          maldição. Toda aflição tem um <b>Rank</b>, na mesma escada de Principiante a Imperador que o resto do
          livro usa, e a regra inteira desta seção cabe numa linha: <b>um feitiço de Desintoxicação de rank X
            remove uma aflição de rank X ou inferior</b>. Nada mais. Se você é Intermediário, Purga Profunda
          resolve tudo até Intermediário e não encosta num Avançado.
        </P>
        <P>
          Cada aflição faz <b>exatamente o que a linha dela diz</b>, e nada além: se a linha tem um relógio
          (dano por hora, uma perda que acumula, um prazo que chega), o relógio corre; se tem um fim (a Baba
          de Sapo-Lodo passa em 1 hora), ela acaba. Fora isso, aflição nenhuma some sozinha, e não existe
          número escondido subindo por trás da tabela. A urgência está escrita na própria linha.
        </P>
        <Aside title="Por que a aflição usa Rank">O Rank da aflição mostra de imediato qual tratamento pode removê-la.</Aside>

        <SubTitle>Venenos</SubTitle>
        <BookTable
          headers={["Aflição", "Rank", "Origem", "Efeito"]}
          rows={[
            ["Baba de Sapo-Lodo", "Principiante", "Pântanos do Continente Central", "Envenenado por 1 hora. A primeira coisa que um aventureiro novato pega."],
            ["Espinho da Rosa-Preta", "Principiante", "Planta cultivada em Asura", "Em 10 minutos, Inconsciente por 8 horas; sofrer dano acorda. Não causa dano."],
            ["Peçonha de Serpente-do-Pântano", "Intermediário", "Serpentes grandes", "2d6 por hora e Desvantagem em Vigor. Mata um camponês em cinco horas."],
            ["Toxina de Aranha Gigante", "Intermediário", "Cavernas, ruínas", "Paralisia progressiva: -3m de Deslocamento por hora, cumulativo até 0."],
            ["Fel de Wyvern", "Avançado", "Feras voadoras do Continente Demônio", "4d8 por dia. Cega em 48 horas."],
            ["Sombra Líquida", "Santo", "Assassinos profissionais", "Sem sintoma por três dias. No quarto dia, teste de Vigor CD 16; na falha, o coração para."],
          ]}
        />

        <SubTitle>Aplicando um Veneno em Combate ou em Segredo</SubTitle>
        <P>
          A tabela acima diz o que um veneno faz depois de estar ativo; esta seção diz como ele entra no corpo.
        </P>
        <BookTable
          headers={["Via de aplicação", "Custo", "Como funciona"]}
          rows={[
            [
              "Untar uma arma",
              "1 Ação",
              "Uma dose cobre uma arma corpo a corpo ou até 3 munições de longe. A dose se gasta no primeiro acerto que causar dano — acertos seguintes já saem limpos, a menos que unte de novo.",
            ],
            [
              "Ingestão",
              "Nenhum custo em Ação — é preparado fora de cena",
              "A dose vai em comida ou bebida. Exige oportunidade e, normalmente, um teste de Enganação ou Furtividade oposto à Percepção do alvo pra passar despercebida.",
            ],
            [
              "Inalação",
              "1 Ação pra romper um frasco ou saquinho em área",
              "Afeta todo mundo sem proteção respiratória num raio de 4,5m. Vento forte ou uma porta fechada dispersa a nuvem em 1 rodada.",
            ],
          ]}
        />
        <P>
          Em qualquer via, a vítima só é afetada se sofrer dano da arma untada, ingerir a dose ou respirar a
          nuvem. Nesse momento ela faz um <b>teste de resistência de Vigor</b> contra <b>CD 8 + (2 × o Bônus
            de Rank da aflição)</b> — o mesmo Bônus de Rank do Cap. 1, §7, lido na coluna Rank da tabela:
          Principiante CD 10, Intermediário CD 12, Avançado CD 14, Santo CD 16, Rei CD 18. Veneno é exposição
          direta e ativa, por isso a CD é mais alta que a de contágio passivo de uma doença (mais adiante, nas
          Regras de Mesa desta seção). Sucesso: a aflição some por completo, sem efeito nenhum. Falha: a
          aflição se instala no rank listado na tabela e faz o que a tabela diz, sem parar, até ser tratada.
        </P>
        <P>
          <b>A CD é sempre a da aflição</b>, venha de onde vier: da arma untada, do frasco que um purificador
          extraiu de outra vítima ou da presa de uma criatura. Quem aplica não muda o veneno.
        </P>
        <Aside title="Exemplo rápido">
          Um Ladino unta a adaga com Peçonha de Serpente-do-Pântano (Intermediária) e acerta um golpe surpresa.
          A vítima faz Vigor contra CD 12 (8 + 2×2). Se falhar, entra Envenenada — 2d6 por hora e Desvantagem
          em Vigor — e isso não para até alguém com <b>Purga Profunda</b> (Intermediário) ou superior tratar,
          ou até uma Poção de Antídoto Forte (Cap. 5, §4) ser bebida.
        </Aside>

        <SubTitle>Doenças</SubTitle>
        <BookTable
          headers={["Aflição", "Rank", "Contágio", "Efeito"]}
          rows={[
            ["Febre de Estrada", "Principiante", "Água parada", "1 nível de Exaustão. A mais comum do mundo."],
            ["Podridão de Ferida", "Intermediário", "Ferimento não tratado", "PV máximos caem 5 por dia."],
            ["Tosse Cinzenta", "Intermediário", "Ar, entre pessoas", "Desvantagem em tudo que exija fôlego."],
            ["Peste dos Portos", "Avançado", "Ratos, carga, navios", "3d6 por dia e contagia 1d4 pessoas próximas por dia."],
            ["Febre de Mana", "Avançado", "Esgotar PM a zero repetidamente", "PM máximos caem 10% por dia."],
            ["Praga do Continente Demônio", "Santo", "Contato com terreno corrompido", "Pele endurece e racha. -1 em todos os atributos por semana, cumulativo."],
          ]}
        />

        <SubTitle>Maldições e Transformações</SubTitle>
        <BookTable
          headers={["Aflição", "Rank", "Origem", "Efeito"]}
          rows={[
            ["Marca do Sepulcro", "Avançado", "Profanar um túmulo", "Não recupera PV por meio nenhum enquanto durar. Nem magia."],
            ["Olhar de Basilisco", "Santo", "A criatura", "Preso agora, sem teste pra se soltar; Petrificado ao fim do 4º turno da vítima, salvo Desintoxicação de rank Santo antes."],
            ["Fome Vermelha", "Santo", "Mordida de certos mortos-vivos", "1 nível de Exaustão por dia que não some. Ao chegar a 6, vira o que o mordeu."],
            ["Nome Roubado", "Rei", "Pactos mal fechados", "Ninguém consegue lembrar quem você é. Só um Rei ou superior desfaz."],
          ]}
        />

        <Warning title="O Teto — Doença da Pedra Mágica (rank Deus)">
          A carne vira minério, devagar, começando pelas extremidades. É a única aflição de <b>rank Deus</b> do
          livro, e nenhum patamar jogável a alcança — um Imperador de Desintoxicação consegue Selar a Maldição
          e deixá-la dormente, e é só isso que o mundo tem a oferecer. O grimório de rank Deus que a curaria
          existe, catalogado no Grande Templo de Millis, e ninguém consegue ler o primeiro verso.
        </Warning>

        <Aside title="Regras de Mesa">
          <List
            items={[
              "Definindo o Rank: se a aflição não estiver nas tabelas, escolha o patamar pelo estrago — Principiante (incômodo), Intermediário (perigoso), Avançado (grave), Santo (fatal), Rei (lendário). É a mesma escada do resto do livro, então não há tabela nova pra decorar.",
              "Diagnóstico (Cura, 1º patamar) diz de que categoria é o problema. Paladar (Desintoxicação, 1º patamar) diz exatamente qual e de que rank — ou seja, quem no grupo consegue tratar.",
              "Cura não trata nada desta seção, em rank nenhum — fecha o ferimento por onde a coisa entrou, e só. Desintoxicação, na direção oposta, também não trata dano físico: ela remove a causa (veneno, doença, maldição, petrificação), mas não fecha o corte — a carne continua aberta até Cura, uma poção ou repouso cuidarem dela.",
              "Itens: antídoto de prateleira trata veneno e doença até o rank escrito nele, e nunca maldição. Maldição sempre exige quem conjure.",
              "Contágio: se uma aflição contagiosa estiver ativa no grupo ao fim de um Descanso Longo, cada personagem que dormiu perto faz teste de Vigor (CD 8 + Bônus de Rank da aflição) — a mesma conta da exposição, sem o ×2, porque contágio passivo é mais fácil de escapar que uma lâmina untada.",
              "Ritmo: a aflição faz o que a linha dela diz, e não passa sozinha. Uma Peste dos Portos pegada no primeiro dia de viagem vai cobrar 3d6 por dia e infectar mais 1d4 pessoas por dia até o grupo achar quem trate — é esse acúmulo, não um número subindo, que cria a urgência de uma campanha longa.",
            ]}
          />
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-8">9. Exaustão, Fome, Sede e Clima Extremo</SectionTitle>
        <P>
          A Exaustão causada por talentos, doenças e maldições segue os efeitos abaixo.
        </P>
        <Warning title="Exaustão Tem 6 Níveis, e Eles Empilham">
          <BookTable
            headers={["Nível", "Penalidade"]}
            rows={[
              ["1", "Desvantagem em testes de atributo e em rolagens de ataque."],
              ["2", "Deslocamento reduzido à metade."],
              ["3", "Desvantagem em testes de resistência."],
              ["4", "PV Máximos reduzidos à metade."],
              ["5", "Deslocamento reduzido a 0."],
              ["6", "Morte — mas nunca sem uma última rolagem: ver abaixo. (A menos que a fonte diga o contrário; Fome Vermelha, seção 8 deste capítulo, transforma em vez de matar.)"],
            ]}
          />
          <P>
            <b>A última rolagem:</b> ao passar do Nível 5 para o Nível 6, faça um teste de Vigor{" "}
            <b>CD 15</b>. Sucesso: você fica no Nível 5 e ganha o Nível 6 só na próxima vez que a causa
            cobrar de novo. Falha: você morre. Nenhuma morte neste sistema acontece sem um dado — o Fio
            da Vida dá três chances, e a Exaustão dá esta.
          </P>
          <P>
            Os efeitos <b>somam</b>: no Nível 3, você já soma a Desvantagem de atributo e de ataque do Nível
            1 com a de resistência deste nível, além de andar na metade da velocidade.
          </P>
          <P>
            <b>Removendo Exaustão:</b> um Descanso Longo remove 1 nível, desde que a causa não esteja mais
            ativa (você comeu, bebeu, saiu do frio). Se a causa continuar, o nível não cai. Magia específica
            de Cura (<i>Mão que Acalma</i>) remove 1 nível de Exaustão de origem <b>física</b> — ferimento,
            trauma, ter acordado do Fio da Vida — a qualquer momento, mas nunca a de fome, sede, frio ou
            marcha forçada: isso não é ferimento, é privação, e só sai resolvendo a causa.
          </P>
        </Warning>

        <SubTitle id="cap4-fome-sede">Fome e Sede</SubTitle>
        <List
          items={[
            "Fome: ficar um dia inteiro sem nenhuma refeição dá 1 nível de Exaustão ao anoitecer. Comer qualquer refeição, por menor que seja, zera essa contagem — mas não remove a Exaustão que já acumulou.",
            "Sede: mais urgente. Ficar sem beber água por mais de algumas horas em clima ameno, ou desde o início em calor extremo, dá 1 nível de Exaustão a cada 4 horas depois da primeira falta.",
            "Ração de Viagem (5 PO por semana) resolve a fome; um Cantil cheio resolve a sede.",
          ]}
        />

        <SubTitle id="cap4-clima">Clima Extremo</SubTitle>
        <P>
          Calor ou frio além do que roupas comuns aguentam — deserto ao meio-dia, nevasca, altitude alta —
          força um teste de Vigor a cada poucas horas de exposição. O Mestre define a CD pela severidade: 8
          para desconfortável, 14 para perigoso, 18 para letal. Falha: 1 nível de Exaustão. Equipamento
          adequado (manto, abrigo, magia de proteção) dá Vantagem no teste ou remove a necessidade dele por
          completo, a critério do Mestre.
        </P>
        <Aside title="Por que isso é leve de propósito">
          Fome, sede e clima não são o ponto da campanha — são o relógio de fundo que torna uma travessia
          longa real sem virar planilha. Numa masmorra de um dia, ignore a seção inteira. Numa travessia de
          duas semanas pela Grande Floresta sem suprimentos, ela decide se o grupo chega ao destino em pé ou
          arrastando um Nível 4.
        </Aside>
      </Section>

      <FimDoCapitulo id="cap4" />
    </div>
  );
}
