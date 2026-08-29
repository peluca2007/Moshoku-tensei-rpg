import { VIGOR_FACTOR_TABLE } from "@/lib/types";
import { Aside, BookTable, ChapterTitle, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";

export default function Chapter4() {
  return (
    <div className="space-y-8">
      <ChapterTitle id="cap4">Capítulo 4 — O Combate e a Sobrevivência</ChapterTitle>
      <P>Quando a diplomacia falha e as espadas são desembainhadas, o sistema adota um combate rápido, letal e tático.</P>

      <Section>
        <SectionTitle id="cap4-1">1. Cálculos Vitais</SectionTitle>
        <P>
          PV e PM não são calculados só na criação — eles crescem toda vez que você desbloqueia um Rank novo
          em qualquer árvore. As fórmulas abaixo são as que valem sempre, do 1º patamar ao Imperador; a ficha
          recalcula os dois números automaticamente a cada Rank novo.
        </P>
        <Aside title="PV Máximos = (20 + o dobro dos seus Dados de PV) × Fator de Vigor">
          <P>
            Uma linha, dois passos, nenhuma exceção:
          </P>
          <List
            items={[
              <span key="c">
                <b>1. O corpo treinado.</b> Some os Dados de PV de <b>todos</b> os patamares que você
                desbloqueou, em todas as árvores (use a média de cada dado, ou role, se a mesa preferir),
                <b> dobre o resultado</b> e some <b>20</b>. Esses 20 são o corpo com que todo mundo nasce.
              </span>,
              <span key="v">
                <b>2. O Fator de Vigor.</b> Multiplique tudo aquilo pelo fator da tabela abaixo, e arredonde
                pra baixo. <b>Cada ponto positivo de Vigor soma 20% à sua vida inteira.</b>
              </span>,
            ]}
          />
          <P>
            É só isso. Não existe piso, não existe um dado que conta em dobro, e nenhum patamar novo muda a
            forma da conta — desbloquear um Rank só acrescenta mais um Dado de PV ao passo 1.
          </P>
        </Aside>

        <SubTitle id="cap4-vigor">A Escala do Vigor</SubTitle>
        <P>
          Vigor não governa nenhuma perícia (Cap. 1, §4): ele é a sua vida e a sua resistência, e nada mais.
          Por isso ele é o atributo mais fácil de largar no Sistema de Defeitos — e por isso a escala abaixo
          é <b>deliberadamente assimétrica</b>. Subir é linear; descer, não.
        </P>
        <BookTable
          headers={["Vigor", "Nome", "Fator de PV", "O que isso significa"]}
          rows={VIGOR_FACTOR_TABLE.map((v) => [
            v.vigor >= 0 ? `+${v.vigor}` : String(v.vigor),
            v.label,
            `×${v.factor.toFixed(2).replace(".", ",")}`,
            v.vigor === -2
              ? "60% da vida de um corpo comum."
              : v.vigor === -1
                ? "75% da vida de um corpo comum."
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
            Exemplo: uma Água Imperador (Bônus +6) com Espírito 6 tem 6×6+8 = <b>44 PM</b> — o suficiente
            pra bancar a assinatura de Imperador de Água (Zero Absoluto, 20 PM) duas vezes, com troco pra
            mais nada.
          </P>
        </Aside>
        <List
          items={[
            <span key="ca"><b>Classe de Armadura (CA):</b> Base 10 + Agilidade. Cresce com armaduras, talentos e habilidades defensivas.</span>,
            <span key="ini"><b>Iniciativa:</b> 1d20 + Agilidade.</span>,
            <span key="res"><b>Teste de Resistência:</b> 1d20 + Atributo + <b>metade do seu maior Bônus de Rank</b> (arredondado pra cima), de qualquer árvore.</span>,
            <span key="desl"><b>Deslocamento:</b> 9 metros, exceto onde a raça indicar outro valor.</span>,
          ]}
        />
        <Aside title="O Rank conta no teste de resistência">
          <P>
            Metade do Bônus de Rank, arredondada pra cima: <b>+1</b> no Principiante, <b>+2</b> do Avançado
            ao Santo, <b>+3</b> no Imperador. É o mesmo valor que o Manto de Touki usa, de propósito — não
            existe uma terceira escala pra decorar.
          </P>
          <P>
            Ele entra porque as CDs do mundo crescem mais rápido que os seus atributos: as criaturas do
            Apêndice G sobem <b>+10</b> de CD entre o 1º e o 6º patamar, e um atributo vai de 4 a 8 no mesmo
            período. Sem o Rank na conta, um veterano resistiria pior que um novato — e um personagem que
            tenha largado aquele atributo no Sistema de Defeitos falharia em quase tudo no fim da campanha.
          </P>
        </Aside>
        <Aside title="Por que o dobro, e por que 20">
          <P>
            Somar os dados crus não funciona: um Norte de Vigor 5 chegaria ao Imperador com pouco mais de 70
            PV, contra um Imperador da Espada causando perto de 130 de dano por turno — o combate acabaria
            antes de o segundo personagem agir. Com o dobro, o mesmo Norte chega ao Imperador perto de 240 PV,
            e a luta dura de duas a três rodadas em qualquer patamar: tempo pro curandeiro agir e pro Escudos
            se interpor. Os 20 de base são o que sustenta um personagem de 1º patamar antes de o treino pesar.
          </P>
       
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-condicoes">2. Glossário de Condições</SectionTitle>
        <Warning title="Toda condição usada no livro está aqui, com número — nenhuma fica só no nome">
          Dezenas de magias e técnicas aplicam uma condição pelo nome (&ldquo;o alvo fica Amedrontado&rdquo;)
          sem repetir o efeito toda vez — é aqui, e só aqui, que cada uma delas tem sua definição completa.
          Se uma habilidade específica alterar o efeito padrão, a habilidade sempre vence.
        </Warning>
        <BookTable
          headers={["Condição", "Efeito"]}
          rows={[
            ["Agarrado", "Deslocamento reduzido a 0. Desvantagem em ataques contra qualquer criatura que não seja quem te agarrou. Termina se quem te agarrou for incapacitado, ou gastando 1 Ação num teste de Força ou Agilidade (Disputa) contra quem segura."],
            ["Amedrontado", "Desvantagem em testes de atributo e em ataques enquanto a fonte do medo estiver visível. Não pode se mover voluntariamente pra mais perto dela."],
            ["Atolado", "Deslocamento reduzido à metade nesse terreno; gastar o dobro de Deslocamento pra sair dele. Não afeta ataques nem testes."],
            ["Atordoado", "Perde todas as Ações e a Reação até o fim do próximo turno. Ataques contra você têm Vantagem, e você falha automaticamente em testes de resistência de Força e Agilidade."],
            ["Caído", "Desvantagem em qualquer ataque que você faça. Ataques corpo a corpo contra você têm Vantagem; ataques à distância contra você têm Desvantagem. Levantar-se custa metade do seu Deslocamento."],
            ["Cego", "Falha automaticamente em qualquer teste que dependa de visão. Seus ataques têm Desvantagem; ataques contra você têm Vantagem."],
            ["Congelado", "Deslocamento reduzido a 0 e Desvantagem em testes de resistência de Agilidade, até quebrar o gelo (1 Ação, teste de Força CD 8 + BC de quem congelou) ou sofrer dano de fogo."],
            ["Desequilibrado", "Deslocamento reduzido à metade, não pode usar mais de uma Reação por rodada, e sofre Desvantagem em ataques de oportunidade. Dura até o fim do próximo turno do alvo, salvo instrução contrária da habilidade."],
            ["Em Chamas", "No início de cada um dos seus turnos, sofre 1d6 de dano ígneo (ou o valor que a habilidade que ateou o fogo especificar). Apaga submergindo em água, ficando Molhado, ou gastando 1 Ação inteira rolando no chão (teste de Agilidade CD 10)."],
            ["Envenenado", "Desvantagem em ataques e em testes de atributo enquanto durar."],
            ["Estagnação (Fluxo Interrompido)", "Uma das duas faces do Fluxo Interrompido. Dentro da barreira, toda magia custa +1 PM por Bônus de Rank de quem a ergueu, e ninguém recupera PM por meio nenhum — nem descanso, nem item, nem habilidade."],
            ["Fonte (Fluxo Interrompido)", "A outra face do Fluxo Interrompido. Você e seus aliados dentro da barreira recuperam 1 PM no início de cada um dos seus turnos; quem não é seu aliado sofre Estagnação normalmente."],
            ["Fluxo Interrompido", "A barreira decide como a mana se move lá dentro. Ao erguer uma barreira você escolhe uma das duas faces — Estagnação ou Fonte — e ela vale pela duração inteira. Nunca as duas."],
            ["Incapacitado", "Não pode tomar Ações nem Reações. Mais severo que Atordoado: não termina sozinho no fim do turno — só quando a fonte específica disser como remover."],
            ["Marcado", "Quem te marcou sabe seu PV aproximado, suas resistências e se você veste Touki, e ignora Cobertura parcial ao te atacar. Dura até ser removido pela habilidade que o concedeu, ou até você ficar fora do alcance dela por um Descanso Longo inteiro."],
            ["Molhado", "Dano de frio contra você é dobrado. Desvantagem em testes de resistência contra magias de gelo de quem te molhou. Fogo aplicado a um alvo Molhado evapora a água em vez de acender."],
            ["Paralisado", "Incapaz de agir e de se mover; falha automaticamente em testes de resistência de Força e Agilidade. Ataques corpo a corpo contra você são críticos automáticos se o atacante estiver adjacente."],
            ["Petrificado", "Vira pedra (ou material equivalente): Incapacitado, imune a veneno e doença, e Resistência a todo dano enquanto durar. Reverter exige a fonte específica que petrificou, ou magia de rank igual ou superior."],
            ["Selado", "Dentro da barreira, nenhuma criatura conjura magia de rank SUPERIOR ao rank em Barreira de quem a ergueu — um Selado de rank Avançado permite magia até Avançado e barra Santo pra cima. Tentar mesmo assim gasta as Ações e o PM e falha. Não impede técnicas de Touki, ataques com arma nem habilidades de Utilidade: Selado é sobre mana, e só."],
            ["Preso", "Deslocamento reduzido a 0. Ataques contra você têm Vantagem; seus ataques têm Desvantagem. Solta-se gastando 1 Ação num teste (Atributo e CD definidos por quem prendeu)."],
            ["Quebrantado", "Acumulável: cada acúmulo dá −1 na CA e −1 no dano de todos os seus ataques, até o máximo do Bônus de Rank de quem aplicou. Não é ferimento — magia de Cura não remove. Some com um Descanso Curto, ou dura até o fim do combate, o que vier primeiro."],
            ["Surdo", "Falha automaticamente em testes que dependam de audição. Não consegue usar Conjuração Padrão nem Encurtada (exigem cântico verbal) — só Conjuração Silenciosa continua funcionando pra você."],
          ]}
        />
      </Section>

      <Section>
        <SectionTitle id="cap4-3-acoes">3. A Economia de Ações (As 3 Ações)</SectionTitle>
        <P>
          No seu turno você possui 3 Ações, além de 1 Reação (usada fora do seu turno, em situações
          específicas). Não existe ação bônus neste sistema — tudo é medido em Ações.
        </P>
        <List
          items={[
            <span key="andar"><b>Andar (1 Ação):</b> mova-se até o Deslocamento. Gastando as 3 Ações, corra o triplo da distância.</span>,
            <span key="atacar"><b>Atacar com Arma (1 Ação):</b> um golpe corpo a corpo ou um projétil disparado.</span>,
            <span key="conjurar"><b>Conjurar Magia (custo variável):</b> consulte a Tabela de Tempo de Conjuração (Cap. 2). O rank da magia dita quantas Ações ela custa.</span>,
            <span key="item"><b>Usar Item (1 Ação):</b> beber uma poção, aplicar curativo, sacar uma arma da bainha.</span>,
            <span key="interagir"><b>Interagir / Ajudar / Se Esconder (1 Ação):</b> abrir uma porta, dar cobertura a um aliado, buscar esconderijo.</span>,
          ]}
        />
        <Aside title="A Regra de Ouro: Conjuração Contínua e Dividida">
          <P>
            Magias poderosas exigem mais Ações do que você tem num turno — o sistema permite dividir o
            cântico. Exemplo: gaste 1 Ação recitando neste turno, 1 Ação andando pra trás de uma árvore, 1
            Ação recitando de novo; no próximo turno, gaste mais 2 Ações e finalmente solte a magia.
          </P>
          <P>
            <b>Perda de Foco:</b> pra manter a mana canalizada, você é obrigado a gastar pelo menos 1 Ação
            por turno recitando. Se passar um turno inteiro sem dedicar nenhuma Ação, a magia falha, a mana
            se perde, e você recomeça do zero.
          </P>
          <P>
            <b>Interrupção:</b> se sofrer dano enquanto conjura, faça um teste de Espírito contra{" "}
            <b>CD 10 + o Bônus de Rank de quem te acertou</b> (CD 11 contra um Principiante, CD 16 contra um
            Imperador; use 12 se não houver um responsável claro). Falhar significa perder o cântico e o PM
            investido. É a mesma lógica do Fio da Vida (seção 6): quem te acertou decide o quanto é difícil
            continuar, não o tamanho do número que ele rolou.
          </P>
        </Aside>
        <Aside title="Por que a CD não é metade do dano">
          <P>
            Até 2026-08-29 a regra acima era &ldquo;CD 10 ou metade do dano sofrido, o que for maior&rdquo;.
            Ela não sobrevive à própria progressão do livro: o dano cresce sem teto (uma criatura de patamar
            Imperador bate perto de 120 por turno, Apêndice G), enquanto o teste cresce até um limite duro —
            Espírito no teto (8) mais metade do Bônus de Rank (3) dá +11, num d20. Qualquer golpe acima de 62
            de dano exigia 20 natural; acima de 82, nada bastava.
          </P>
          <P>
            O resultado era que magia de 4, 5 e 6 Ações — que este capítulo passa uma seção inteira ensinando
            a dividir entre turnos — ficava impossível de conjurar exatamente nos patamares em que ela existe.
            Amarrar a CD ao <i>Rank</i> de quem acertou mantém a tensão (você precisa mesmo de alguém segurando
            a linha) sem transformar o Imperador de magia numa classe que não pode agir.
          </P>
        </Aside>
        <Aside title="Testes Resistidos (Disputas)">
          Nem todo conflito envolve uma CD estática. Empurrar um inimigo de um penhasco, disputar uma queda
          de braço, arrancar um item das mãos de alguém: ambos rolam 1d20 + Atributo puro. Quem tirar o
          maior total vence. Em empate, a situação se mantém inalterada.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-4">4. Regras de Empilhamento</SectionTitle>
        <P>
          Com dezoito árvores no jogo, um grupo bem construído consegue empilhar bônus até quebrar a
          matemática. Estas regras impedem isso sem tirar a graça da combinação.
        </P>
        <Aside title="Bônus do mesmo tipo não somam">
          Se dois efeitos seus dão bônus ao mesmo número (CA, acerto, dano, deslocamento), use apenas o
          maior. <b>Exceção 1:</b> bônus concedidos por aliados diferentes que gastaram Ações somam
          normalmente — o Bardo cantando e o Tático apontando o alvo estão os dois trabalhando; ambos contam.{" "}
          <b>Exceção 2:</b> um Escudo empunhado soma com a armadura de corpo vestida — são equipamentos em
          slots diferentes, não dois efeitos competindo pelo mesmo bônus (é por isso que o kit inicial de
          Tank do Cap. 1 já vem com os dois juntos).
        </Aside>
        <Aside title="Teto de Auxílio +6">
          Nenhum personagem recebe mais de +6 somados em bônus numéricos vindos de habilidades de aliados no
          mesmo turno. Acima disso, o excedente é ignorado.
        </Aside>
        <Aside title="Teto de Ações: 5, no máximo 2 externas">
          Nenhum personagem age mais de 5 vezes num turno, e no máximo 2 dessas Ações podem vir de fontes
          externas (Avante, Antecipação, Comando). Sem esta regra, um Norte Imperador (4 Ações) com um
          Tático Comandante na mesa chega a 7 Ações por turno, e o combate deixa de existir.
        </Aside>
        <Aside title="Duas Salvações por Combate">
          O livro tem quatro formas de impedir que alguém morra — Aguentar (Touki), Rejeitar a Morte (Cura), Sem Baixas (Tático) e Custe o Que Custar (Escudos).
          Cada criatura pode ser salva no máximo duas vezes por combate, e você não pode usar o mesmo método duas vezes no mesmo alvo.
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
        <SectionTitle id="cap4-5">5. Críticos, Touki e o Fio da Vida</SectionTitle>
        <List
          items={[
            <span key="20"><b>20 Natural (Crítico):</b> acerta automaticamente, independente da CA ou resistência do inimigo. Role os dados de dano duas vezes e some os bônus fixos uma vez só.</span>,
            <span key="1"><b>1 Natural (Falha Crítica):</b> você erra pateticamente. O Mestre tem controle total sobre o seu destino.</span>,
          ]}
        />
        <P>
          O Touki não gasta PM — consome Pontos de Touki (PT), e é desbloqueado no terceiro patamar de
          qualquer árvore do Corpo (regras completas no Capítulo 3).
        </P>
        <Aside title="Por que magos temem espadachins">
          Um espadachim de rank Santo cruza 9 metros e decapita um mago antes que ele termine o segundo
          verso de uma magia Avançada. É por isso que a escola de Água investe tanto em barreiras, terreno
          difícil e empurrões — cada metro de distância é um verso a mais recitado vivo.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-6">6. Sangrando e Morrendo</SectionTitle>
        <P>
          Magia de cura pode fechar feridas, mas ressurreição beira o mito divino. Se seus Pontos de Vida
          chegarem a 0, você cai Inconsciente e entra em estado de Morte.
        </P>
        <SubTitle>O Teste do Fio da Vida</SubTitle>
        <P>
          No início de cada um dos seus turnos a 0 PV, role 1d20 + Vigor contra{" "}
          <b>CD 8 + o Bônus de Rank de quem te derrubou</b> (CD 9 contra um Principiante, CD 14 contra
          um Imperador; use 10 se não houver um responsável claro, como uma queda ou um desabamento). É um
          teste de resistência de Vigor como qualquer outro, então <b>A Escala do Vigor</b> (seção 1) vale
          aqui: Constituição Frágil rola com Desvantagem, e Corpo Quebrado rola com Desvantagem, sem o Bônus
          de Rank, e sofre a Falha Crítica em 1 ou 2.
        </P>
        <List
          items={[
            "Sucesso: você estabiliza temporariamente — não está morto, mas continua desacordado.",
            "Falha: você recebe 1 Marca da Morte.",
            "Falha Crítica (1 Natural): você recebe 2 Marcas da Morte.",
          ]}
        />
        <Aside title="Quem te derrubou decide o quanto é difícil voltar">
          <P>
            Um goblin de estrada te deixa em CD 9 — você quase sempre estabiliza. Um Rei-Demônio te deixa em
            CD 14, e aí cada turno caído é uma aposta de verdade. É a mesma ferida; o que muda é a força que
            a abriu.
          </P>
        </Aside>
        <P>
          Se acumular <b>3 Marcas da Morte</b>, você morre permanentemente. Qualquer magia de cura ou poção
          aplicada por um aliado remove todas as Marcas da Morte instantaneamente e você acorda — mas
          acordar do Fio da Vida cobra um preço: você volta com <b>1 nível de Exaustão</b> (seção 8 deste
          capítulo) até fazer um Descanso Longo.
        </P>

        <Aside title="Ferida Fresca">
          <P>
            Toda a Magia de Cura cura <b>em dobro</b> contra uma Ferida Fresca. Ferida Fresca é o dano sofrido <b>no turno atual ou no turno
              imediatamente anterior</b> — a janela em que a carne ainda não começou a fechar sozinha.
          </P>
          <P>
            É por isso que o curandeiro age cedo, e não depois: a mesma magia que devolve 55 PV a quem caiu
            agora devolve 27 a quem caiu há três turnos. <i>Selar a Ferida</i> (Cura, 1º patamar) existe
            exatamente pra esticar essa janela para uma hora — e sim, uma Ferida Selada continua contando
            como Fresca.
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
              ["1", "Ferimento Reaberto: A ferida arde sob esforço extremo. Desvantagem em testes de Constituição (Vigor) para evitar Exaustão ou fadiga."],
              ["2", "Articulação Rígida: Movimentos bruscos causam fisgadas de dor. Desvantagem em testes de Acrobacia e Furtividade."],
              ["3", "Fôlego Curto: Seus pulmões perderam capacidade. Desvantagem em testes de Atletismo focados em natação, apneia ou corrida prolongada."],
              ["4", "Zumbido Constante: Um tinido persistente atrapalha sua audição. Desvantagem em testes de Percepção que dependam puramente de som."],
              ["5", "Visão Desfocada: Dificuldade em focar os olhos após picos de adrenalina. Você sofre -2 de penalidade em todos os testes de Iniciativa."],
              ["6", "Nervo Pinçado: Suas mãos tremem de forma involuntária. Desvantagem em testes de Ladinagem e Ofícios que exijam coordenação motora fina."],
              ["7", "Trauma Noturno: O corpo recusa o relaxamento profundo. Ao fazer um Descanso Longo, role 1d20; com 5 ou menos, você recupera apenas metade dos seus Pontos de Magia e recursos diários."],
              ["8", "A Sombra Não Sai: Nenhuma penalidade física, mas Desvantagem em testes de resistência de Espírito contra Medo — o corpo lembra da morte, mesmo que a mente negue."],
              ["9", "Voz Quebrada: As cordas vocais foram gravemente danificadas. Você não consegue mais usar Conjuração encurtada e tem Desvantagem em Atuação e Persuasão."],
              ["10", "Perna Manca: Os ossos não colaram direito e a musculatura atrofiou. Seu Deslocamento base sofre uma penalidade permanente de −3m."],
              ["11", "Olho Perdido: A visão periférica e de profundidade se foram. Desvantagem em Percepção visual e em qualquer ataque à distância além do alcance curto."],
              ["12", "Membro Perdido (Braço/Mão): Desvantagem em testes de Força e Atletismo. Você não consegue usar armas de duas mãos, nem empunhar arma e escudo ao mesmo tempo."],
            ]}
          />

          <P>
            A gravidade da sequela dita o limite do seu tratamento:
          </P>
          <ul>
            <li><b>Cicatrizes Menores (1 a 7):</b> Causam incômodos mecânicos e narrativos, mas o corpo ainda pode se recuperar. Elas são totalmente apagadas caso o personagem receba uma magia de <b>Cura de Rank Avançado</b>.</li>
            <li><b>Ferimentos Críticos (8 a 12):</b> Deixam marcas irreversíveis na estrutura do aventureiro. A única salvação conhecida é <i>Corpo Íntegro</i> (Cura, Rank Rei/Imperador) — capaz de reler o alvo por inteiro, apagando a Cicatriz e recriando membros perdidos. Sem esse milagre, nenhuma poção, descanso ou magia inferior resolverá o problema. É o preço da sobrevivência, e ele pesará na sua ficha pelo resto da campanha.</li>
          </ul>
        </Warning>

        <BookTable
          headers={["Descanso", "Recupera"]}
          rows={[
            [
              "Curto (1 a 2 horas)",
              "Recupera 25% dos seus PM, PP e PT máximos (arredondado para baixo). Não recupera Pontos de Vida (0%)."
            ],
            [
              "Longo (8 horas de sono seguro)",
              "Recupera 50% dos seus PM, PP e PT máximos (arredondado para baixo). Recupera 25% dos seus PV máximos + ((Vigor)d10%(minimo 5%)),"
            ],
          ]}
        />
        <Warning title="Dois Curtos por dia, e nem um a mais">
          <P>
            Sem esse teto, o Descanso Curto quebra o livro inteiro: ele devolve metade da reserva de PM, e a
            Magia de Cura converte PM em PV. Um curandeiro de 1º patamar com <i>Juramento</i> cura 14 PV por
            1 PM — a reserva de 12 PM vira 168 PV, e cada Curto acrescenta mais 84, indefinidamente. Um grupo
            de quatro personagens de 1º patamar tem cerca de 144 PV somados: bastava descansar duas horas a
            mais e a mesa voltava inteira.
          </P>
          <P>
            Com dois Curtos por dia, a reserva diária do curandeiro fica em duas vezes o máximo dele, PV
            volta a ser finito, e o Aviso abaixo — a promessa de que um grupo sem curandeiro sangra na
            segunda luta — volta a ser verdade. É a premissa de que este capítulo inteiro depende.
          </P>
          <P>
            <b>PT são a exceção</b>, e voltam inteiros em qualquer Descanso Curto: é o que o Capítulo 3 já
            dizia, e a tabela acima contradizia. O Touki é fôlego, não mana — recupera-se sentando.
          </P>
        </Warning>
        <Warning title="A Carne Não Fecha Sozinha">
          <P>Um corte não some porque você dormiu. As três únicas formas de recuperar PV de verdade:</P>
          <List
            items={[
              "Magia de Cura — rápida, cara em PM, do rank certo pro tipo de ferimento.",
              "Poções — caras em dinheiro, limitadas em estoque.",
              "Repouso longo — uma semana inteira em cama, em lugar seguro, devolve todos os PV.",
            ]}
          />
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
            <b>Efeito, por ponto de Trauma acumulado:</b> Desvantagem em testes de Espírito feitos{" "}
            <b>fora de combate</b> (persuasão calma, negociação, criar confiança, dormir sem pesadelo).
            Trauma não afeta nada dentro do combate — na hora da luta, o corpo simplesmente age.
          </P>
          <P>
            <b>Removendo Trauma:</b> gaste uma semana de Downtime na atividade Recuperar-se acompanhado de
            alguém de confiança, ou resolva a causa de frente na narrativa — voltar ao lugar, encarar quem
            sobrou, fazer as pazes com o que aconteceu. Cada semana ou cada cena assim resolvida remove{" "}
            <b>1 ponto</b>. Sem isso, o Trauma não passa sozinho: não existe teste de resistência nem
            Descanso Longo que apague o que aconteceu.
          </P>
          <P>
            Isto não é um sistema de sanidade: não há loucura, não há tabela de fobias, e não há perda de
            controle do personagem. É só o lembrete mecânico de que continuar lutando tem custo.
          </P>
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-aflicoes">7. Aflições do Mundo de Seis Faces</SectionTitle>
        <P>
          Além do dano que se vê na hora, o corpo pode ser atacado por caminhos mais lentos — veneno, doença,
          maldição. Toda aflição tem uma Profundidade de 1 a 5 que sobe sozinha enquanto ninguém trata, e um mago de
          Desintoxicação só purga o que estiver dentro do Bônus de Rank dele. Venenos agudos sobem 1 de
          Profundidade por hora; doenças, maldições e petrificações sobem 1 por dia. Nada disso cai sozinho.
        </P>

        <SubTitle>Venenos</SubTitle>
        <BookTable
          headers={["Aflição", "Prof.", "Origem", "Efeito"]}
          rows={[
            ["Baba de Sapo-Lodo", "1", "Pântanos do Continente Central", "Envenenado por 1 hora. A primeira coisa que um aventureiro novato pega."],
            ["Espinho da Rosa-Preta", "1", "Planta cultivada em Asura", "Sono profundo em 10 minutos. Não causa dano."],
            ["Peçonha de Serpente-do-Pântano", "2", "Serpentes grandes", "2d6 por hora e Desvantagem em Vigor. Mata um camponês em cinco horas."],
            ["Toxina de Aranha Gigante", "2", "Cavernas, ruínas", "Paralisia progressiva: -3m de Deslocamento por hora, cumulativo até 0."],
            ["Fel de Wyvern", "3", "Feras voadoras do Continente Demônio", "4d8 por dia. Cega em 48 horas."],
            ["Sombra Líquida", "4", "Assassinos profissionais", "Sem sintoma por três dias. No quarto, o coração para."],
          ]}
        />

        <SubTitle>Aplicando um Veneno em Combate ou em Segredo</SubTitle>
        <P>
          A tabela acima diz o que um veneno faz depois de estar ativo. Esta seção diz como ele entra no
          corpo de alguém — porque isso é o que a mesa realmente precisa resolver, e o que faltava aqui.
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
          nuvem. Nesse momento ela faz um <b>teste de resistência de Vigor</b> contra <b>CD 8 + (2 × a
            Profundidade do veneno)</b> — veneno é exposição direta e ativa, por isso a CD é mais alta que a de
          contágio passivo de uma doença (mais adiante, nas Regras de Mesa desta seção). Sucesso: a aflição
          some por completo, sem efeito nenhum. Falha: a aflição começa exatamente na Profundidade listada na
          tabela e sobe sozinha a partir daí, 1 ponto por hora.
        </P>
        <Aside title="Exemplo rápido">
          Um Ladino unta a adaga com Peçonha de Serpente-do-Pântano (Profundidade 2) e acerta um golpe surpresa.
          A vítima faz Vigor contra CD 12 (8 + 2×2). Se falhar, já entra Envenenada na Profundidade 2 — 2d6 por
          hora e Desvantagem em Vigor — e esse relógio corre até alguém tratar com Desintoxicação ou um
          Antídoto (Cap. 5, §4).
        </Aside>

        <SubTitle>Doenças</SubTitle>
        <BookTable
          headers={["Aflição", "Prof.", "Contágio", "Efeito"]}
          rows={[
            ["Febre de Estrada", "1", "Água parada", "1 nível de Exaustão. A mais comum do mundo."],
            ["Podridão de Ferida", "2", "Ferimento não tratado", "PV máximos caem 5 por dia."],
            ["Tosse Cinzenta", "2", "Ar, entre pessoas", "Desvantagem em tudo que exija fôlego."],
            ["Peste dos Portos", "3", "Ratos, carga, navios", "3d6 por dia e contagia 1d4 pessoas próximas por dia."],
            ["Febre de Mana", "3", "Esgotar PM a zero repetidamente", "PM máximos caem 10% por dia."],
            ["Praga do Continente Demônio", "4", "Contato com terreno corrompido", "Pele endurece e racha. -1 em todos os atributos por semana, cumulativo."],
          ]}
        />

        <SubTitle>Maldições e Transformações</SubTitle>
        <BookTable
          headers={["Aflição", "Prof.", "Origem", "Efeito"]}
          rows={[
            ["Marca do Sepulcro", "3", "Profanar um túmulo", "Não recupera PV por meio nenhum enquanto durar. Nem magia."],
            ["Olhar de Basilisco", "4", "A criatura", "Petrificação em 4 turnos."],
            ["Fome Vermelha", "4", "Mordida de certos mortos-vivos", "1 nível de Exaustão por dia que não some. Ao chegar a 6, vira o que o mordeu."],
            ["Nome Roubado", "5", "Pactos mal fechados", "Ninguém consegue lembrar quem você é. Só um Imperador desfaz."],
          ]}
        />

        <Warning title="O Teto — Doença da Pedra Mágica (Profundidade 6)">
          A carne vira minério, devagar, começando pelas extremidades. Nenhum patamar deste livro alcança
          Profundidade 6 — um Imperador de Desintoxicação consegue Selar a Maldição e congelar o avanço, e é
          só isso que o mundo tem a oferecer. O grimório de rank Deus que curaria isso existe, catalogado no
          Grande Templo de Millis, e ninguém consegue ler o primeiro verso.
        </Warning>

        <Aside title="Regras de Mesa">
          <List
            items={[
              "Definindo a Profundidade: se a aflição não estiver na tabela, use 1 (incômodo), 2 (perigoso), 3 (grave), 4 (fatal) ou 5 (lendário).",
              "Diagnóstico (Cura, 1º patamar) diz de que categoria é o problema. Paladar (Desintoxicação, 1º patamar) diz exatamente qual e a Profundidade.",
              "Cura não trata nada desta seção, em rank nenhum — fecha o ferimento por onde a coisa entrou, e só. Desintoxicação, na direção oposta, também não trata dano físico: ela remove a causa (veneno, doença, maldição, petrificação), mas não fecha o corte — a carne continua aberta até Cura, uma poção ou repouso cuidarem dela.",
              "Contágio: se uma aflição contagiosa estiver ativa no grupo ao fim de um Descanso Longo, cada personagem que dormiu perto faz teste de Vigor (CD 8 + Profundidade atual).",
              "Ritmo: uma aflição de Profundidade 2 pegada no primeiro dia de viagem chega a 5 em três dias — é esse relógio, não o combate, que cria a urgência de uma campanha longa.",
            ]}
          />
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-8">8. Exaustão, Fome, Sede e Clima Extremo</SectionTitle>
        <P>
          O sistema já usa a condição Exaustão em dezenas de talentos, doenças e maldições sem nunca fechar
          o que ela faz de fato. Esta seção fecha essa conta.
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
              ["6", "Morte — mas nunca sem uma última rolagem: ver abaixo. (A menos que a fonte diga o contrário; Fome Vermelha, seção 7 deste capítulo, transforma em vez de matar.)"],
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
            "Ração de aventureiro (item comum, poucas moedas de cobre por dia) resolve as duas ao mesmo tempo — é por isso que toda caravana carrega mais ração do que ouro.",
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
    </div>
  );
}
