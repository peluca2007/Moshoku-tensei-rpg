import Prancha from "./Prancha";
import {
  COLUNAS_CORPO,
  COLUNAS_MAGIA,
  DANO_POR_TURNO_CORPO,
  DANO_POR_TURNO_MAGIA,
} from "@/data/danoPorTurno";
import {
  ARQUETIPOS_CRIATURA,
  SUBARQUETIPOS_CRIATURA,
  CRIATURAS_PRONTAS,
  MOLDES_CRIATURA,
  atributosDaCriatura,
  bonusResistencia,
  rotuloPatamar,
  sinal,
} from "@/data/bestiary";
import { Aside, BookTable, ChapterTitle, FimDoCapitulo, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";
import FichaDeCriatura from "./FichaDeCriatura";
import { SHOP_ITEMS } from "@/data/shopItems";

export default function Appendices() {
  return (
    <div className="space-y-8">
      <ChapterTitle
        id="apendices"
        numero="Consulta rápida"
        resumo="As tabelas que ficam abertas na mesa: ficha de exemplo, dano por turno, ambiguidades resolvidas e o bestiário."
      >
        Apêndices
      </ChapterTitle>

      <Section>
        <SectionTitle id="apendice-a">A. Ficha de Exemplo — Roxy Migurdia</SectionTitle>
        <P>Use esta ficha pra calibrar se os seus números parecem certos na mesa.</P>
        <P className="font-semibold">
          Roxy Migurdia — Migurd, Santo de Água, Avançado de Terra e Vento, Intermediário de Cura
        </P>
        <List
          items={[
            "Atributos: Força 0 · Agilidade 3 · Vigor 2 · Intelecto 6 (já com +1 de Migurd) · Espírito 5",
            "PV (Cap. 4, §1): corpo treinado (14 + 1,67 × 53 de média dos dados de PV dos 12 ranks dela, nas 4 árvores = 102,51) × Fator de Vigor 2 (×1,40), arredondado pra baixo = 143 PV",
            "PM (Cap. 4, §1): só a melhor escola de magia conta, nunca a soma de todas — Espírito 5 × Bônus do Santo de Água (4) + 8 = 28, mais os PM do Migurd (3 × MB = 12) = 40 PM (acima do cap de Santo, então vale inteiro)",
            "BC de Água: 6 + 4 = 10 → acerta com 1d20+10, CD 18, dano +10",
            "CA: 13",
            "Maestrias de Água: Afinidade Aquática, Cântico Fluido, Termodinâmica Aplicada, Domínio Climático",
            "BC de Cura: Espírito 5 + 2 = 7 — ela fecha ferimento, mas o Intermediário dela não salva ninguém de uma ferida mortal",
            "PP e PT: nenhum. Ela não tem patamar em árvore do Corpo nem de Utilidade",
          ]}
        />
        <P>
          Leitura da ficha: ela acerta praticamente qualquer coisa, tem uma reserva de mana que sustenta um
          combate longo inteiro, e cai em poucos golpes de qualquer espadachim decente — 143 PV é bastante
          numa conta isolada, mas fica baixo perto de um personagem do Corpo com a mesma quantidade de Ranks
          investidos, cujos dados de PV por patamar são bem maiores. É exatamente isso que ela é na história —
          uma professora genial dentro de um corpo frágil, que sobrevive porque nunca deixa ninguém chegar
          perto. Se a sua ficha de mago não estiver produzindo esse perfil (acerto altíssimo, mana generosa,
          vida baixa pro nível dela), algum número precisa de ajuste.
        </P>
        <P>
          Repare no que o Fator de Vigor faz aqui: com Vigor 2 ela multiplica por 1,40. Se tivesse largado
          Vigor em -2 pra comprar mais um ponto de Intelecto, o mesmo corpo treinado de 102,51 viraria 41 PV —
          e um único golpe de espadachim Santo resolveria a luta. É o tipo de troca que a Escala do Vigor
          (Cap. 4, §1) existe pra tornar visível antes de a ficha ser fechada.
        </P>
      </Section>

      <Section>
        <SectionTitle id="apendice-b">B. Molde para Novas Escolas</SectionTitle>
        <P>Cada escola nova precisa exatamente destes oito itens:</P>
        <List
          items={[
            "Uma condição-assinatura que a escola aplica de graça (Água → Molhado).",
            "Um combo interno que paga por aplicar a condição (Água: gelo dobra frio contra Molhado; eletricidade dobra tudo).",
            "Uma curva de Dados de PV própria que diferencie a escola. PM não tem curva de escola: a reserva sai do Cap. 4, §1, e a escola só mexe nela por talento comprado (como as Reservas, +2 PM e +2 PV por patamar) ou pelo custo das próprias magias. Exemplos: Fogo, dano alto e corpo frágil; Terra, o corpo mais duro entre as magias; Vento, meio-termo com bônus de deslocamento.",
            "Seis Maestrias automáticas, uma por rank — a do Avançado sempre destranca Magia Combinada, a do Rei sempre destranca um elemento secundário (Água → Eletricidade, Fogo → Explosão/Plasma, Vento → Som/Vácuo, Terra → Metal/Magma).",
            "Uma Magia Assinatura ◆ por rank, custando +1 PA.",
            "Uma magia de utilidade pura que não causa dano nenhum, mas define a identidade da escola fora de combate (Água: Afinidade Aquática e Névoa Densa. Terra: erguer abrigo. Vento: comunicação a distância. Fogo: forjar e iluminar).",
            "De 6 a 8 conhecimentos por rank baixo, 3 a 4 por rank alto — o suficiente pra tabela de desbloqueio fechar sem obrigar o jogador a comprar magia velha só pra bater a contagem.",
            "Declare qual atributo alimenta o BC da escola — Fogo, Água, Vento, Terra e Magia Teórica usam Intelecto; Cura, Desintoxicação e Invocação usam Espírito. Isso divide a Árvore da Magia em duas metades que não competem pelos mesmos pontos de atributo.",
          ]}
        />
      </Section>

      <Section>
        <SectionTitle id="apendice-c">C. Tabela Comparativa de Dano por Turno</SectionTitle>
        <P>
          A régua com que toda árvore futura deve ser medida. Valores médios, alvo de CA razoável, atributo
          principal progredindo de 4 até 8.
        </P>
        <BookTable
          headers={["Patamar", ...COLUNAS_MAGIA.map((c) => c.label)]}
          rows={DANO_POR_TURNO_MAGIA.map((l) => [
            l.patamar,
            ...COLUNAS_MAGIA.map((c) => l.porArvore[c.treeId] ?? "—"),
          ])}
        />
        <BookTable
          headers={["Patamar", ...COLUNAS_CORPO.map((c) => c.label)]}
          rows={DANO_POR_TURNO_CORPO.map((l) => [
            l.patamar,
            ...COLUNAS_CORPO.map((c) => l.porArvore[c.treeId] ?? "—"),
          ])}
        />
        <Warning title="Quatro coisas que a tabela não diz sozinha">
          <P>
            <b>A Espada conta 4 Ações do Avançado em diante.</b> A Maestria &ldquo;Velocidade
            Encarnada&rdquo; dá uma Ação extra a quem não se move no turno, e os números dela já assumem
            isso. Ela é a única coluna com uma 4ª Ação antes do Imperador.
          </P>
          <P>
            <b>Escudos pressupõe todas as Ações gastas defendendo.</b> Um Defensor Imperador que{" "}
            <i>escolha</i> atacar faz perto de 84 por turno, não 27. A coluna mede o que ele faz no papel
            dele, não o teto dele — e ele continua sendo a menor coluna do livro de propósito.
          </P>
          <P>
            <b>A Utilidade tem três colunas.</b> Cada árvore tem um golpe próprio que
            escala por patamar — Dano Furtivo, Ordem de Tiro, Dissonância —, todos na Maestria de 1º
            patamar e todos uma vez por turno. Nenhuma das três recebe degraus de Dado de Arma (Cap. 3),
            então o dado delas nunca cresce: é essa a razão de ficarem para trás sem precisar de nenhuma
            regra que as puna.
          </P>
          <P>
            <b>Magia não está amortizada pelas Ações.</b> Muitas magias de Imperador custam 4 Ações — mais
            que um turno inteiro. O Sol Menor é uma exceção: entrega ~130 contra alvo Em Chamas em 3 Ações.
            Compare marcial com marcial e magia com magia; cruzar as duas metades desta tabela engana.
          </P>
        </Warning>
        <Aside title="Como ler esta tabela">
          <P>Número alto não significa personagem melhor. Significa personagem mais estreito.</P>
          <List
            items={[
              "O Fogo tem o maior número e o menor corpo: 64 PV no Imperador, com Vigor 0. Mata tudo, morre de qualquer coisa, e queima o saque no processo.",
              "A Água tem o menor número entre as ofensivas e vence campanhas — o valor dela é em área, a 45 metros, com aliados poupados e sem chance de errar.",
              "A Terra é a única que constrói. Metade do valor dela nunca aparece aqui: pontes, fortalezas, masmorras vedadas, um grupo que nunca mais dorme exposto.",
              "O Arco só é real contra quem não veste o Manto de Touki. Contra um guerreiro do Corpo Avançado ou superior, subtraia o dobro do Bônus de Rank do alvo de cada disparo mundano.",
              "O Suishin-ryū não tem número. Contra quatro inimigos agressivos ele bate mais que qualquer coisa deste livro. Contra um inimigo parado, causa zero, pra sempre.",
              "O Lutador tem o número errado na tabela — o que ele realmente faz é acumular Quebrantado. No quarto turno, o inimigo já perdeu 6 de CA e 6 de dano e a luta já acabou sem a tabela registrar.",
              "Escudos é a menor coluna do livro e o personagem mais difícil de substituir. Ele bate, mas bater não é o trabalho dele: é decidir quem sobrevive.",
              "O Ladino é a maior das três colunas de Utilidade, e o número dela é da EMBOSCADA. O Dano Furtivo exige alvo desprevenido, cego, imobilizado ou com Vantagem — em luta aberta, sem preparação, o Ladino é o pior combatente direto das dezenove.",
              "O Tático é a coluna que decide quem executa. A Ordem de Tiro soma no primeiro ataque que acertar o alvo Apontado — de um aliado ou dele mesmo — e é só contra esse alvo que ele soma o Bônus de Rank no próprio golpe. Sem grupo, ele aponta e atira sozinho: perde a escolha de quem bate, não o número.",
              "O Bardo é a menor das três, e a única cujo dano é em área — a Dissonância pega todo hostil que o ouça. Contra construto, morto-vivo e criatura surda, ela é zero.",
              "O Vendaval e o Punho do Fogo são híbridas, e a linha é o patamar dentro delas: quem abre o 1º já chega Intermediário nas duas árvores-mãe, e por isso as duas começam acima das árvores-mãe. O número do Vendaval depende de quantos metros ele andou antes de golpear; o do Punho não conta o Quebrantado que empilha, que faz com ele o mesmo que faz com o Lutador.",
              "A Cura fere, e fere mais fundo quem abriu a ferida. A coluna dela é a Luz de Dois Gumes: o valor que cada magia curaria, virado em dano radiante contra um hostil, sem o dobro da Ferida Fresca. Contra quem carrega Culpa Fresca (Rei), os dados da luz dobram e o BC soma uma vez só. A Desintoxicação continua fora desta régua: se você a escolher esperando causar dano, escolheu errado. A Magia Teórica entra com o dano da fórmula que desenhar (Cap. 2, §8) — 1d6 no Principiante, sem o BC no dano.",
            ]}
          />
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="apendice-d">D. Ambiguidades Resolvidas</SectionTitle>
        <P>Perguntas que a mesa vai fazer, respondidas antes de virarem discussão.</P>

        <SubTitle>Sobre Ranks e Múltiplas Árvores</SubTitle>
        <QA
          q="Tenho Norte Santo e Espada Principiante. Faço um ataque comum com a espada. Quantos degraus de Dado de Arma?"
           a="Um ataque comum usa os degraus do seu maior patamar entre as árvores do Corpo — os quatro do Norte. Uma técnica usa sempre os degraus da árvore que a concedeu: o Corte de Braço do seu Principiante rola com um degrau só, e é por isso que ele é ruim na sua mão."
        />
        <QA
          q="Um talento diz 'seu Bônus de Rank' e eu tenho cinco árvores. Qual uso?"
          a="O da árvore que concedeu o talento. Se a regra for genérica do livro e não citar árvore, use o maior que você tiver."
        />
        <QA
          q="Perícia em qual árvore de Utilidade meu Bônus de Rank soma?"
          a="Apenas nas perícias que aquela árvore cobre. Ladino: Furtividade, Ladinagem, Percepção, Acrobacia, Enganação (disfarce). Bardo: Atuação, Persuasão, Intuição, História. Tático: Sobrevivência, Natureza, Investigação, Percepção (rastreio). Se duas árvores cobrem a mesma perícia, use o maior — não some."
        />

        <SubTitle>Sobre Touki e PT</SubTitle>
        <QA
          q="Tenho PT no Principiante?"
          a="Sim. A reserva de PT existe desde o 1º patamar de qualquer árvore do Corpo: Vigor + Espírito + 1 por patamar (2 em Cavalaria e Escudos). O que você ainda não tem é o Manto de Touki: ele chega no Avançado (3º patamar), junto com as manobras de gasto."
        />
        <QA
          q="Abri o Deus da Espada. Quando percebo o Touki?"
          a="No 2º patamar, e é o único estilo assim: a Espada destrava Touki Concentrado e Lâmina de Touki ali. O Manto de Touki e as outras manobras vêm no 3º, como em todo o Corpo. A reserva de PT, você já tinha desde o 1º."
        />
        <QA q="Sou mago de Terra Imperador. Tenho PT?" a="Não. Nenhum PT, em patamar nenhum. Magia e Utilidade nunca recebem Touki." />
        <QA
          q="O Manto de Touki funciona enquanto estou em Postura de Água?"
          a="Funciona — são coisas diferentes: o Manto é passivo do 3º patamar, a Postura é um modo de combate. Os bônus de CA das duas não somam (regra de empilhamento); use o maior."
        />
        <QA q="Perdi todos os PT. Perco o Manto de Touki?" a="Não. O Manto é gratuito e passivo. PT pagam manobras, não a aura." />

        <SubTitle>Sobre Cura, Aflições e Descanso</SubTitle>
        <QA q="Magia de Cura cura veneno?" a="Não. Nunca, em patamar nenhum. Isso é Desintoxicação, e a separação é absoluta." />
        <QA q="Desintoxicação cura PV?" a="Não. Ela remove a causa; a carne continua aberta. Sangria até causa dano de propósito." />
        <QA q="Ferida Selada conta como Ferida Fresca para dobrar os dados da cura?" a="Conta. É exatamente pra isso que Selar a Ferida existe." />

        <SubTitle>Sobre Condições</SubTitle>
        <QA
          q="Posso estar Molhado e Em Chamas ao mesmo tempo?"
          a="Não. Dano ígneo em alvo Molhado seca a água: o dano entra normalmente, a condição some e o alvo não pega fogo naquele golpe. Água em alvo Em Chamas apaga o fogo e aplica Molhado."
        />
        <QA q="Quebrantado some com magia de Cura?" a="Não. Não é ferimento — é o corpo parando de responder. Some no fim do combate — ou num Descanso Curto, se foi aplicado fora de combate." />
        <QA q="Desequilibrado tira todas as minhas Reações?" a="Tira. Enquanto durar, você não usa Reação nenhuma — nem ataque de oportunidade, nem bloqueio — e anda com metade do Deslocamento. Um Suishin-ryū Desequilibrado não apara, mas o Fluxo continua disparando: ele não gasta Reação." />
        <QA
          q="Congelado e Atolado ao mesmo tempo o Deslocamento fica negativo?"
          a="Deslocamento não fica abaixo de 0. As condições não se somam em efeito, mas escapar exige resolver as duas separadamente."
        />

        <SubTitle>Sobre Ações e Reações</SubTitle>
        <QA q="Quantas Reações eu tenho?" a="Uma por rodada, sempre — a menos que um efeito diga o contrário (Postura de Água, Segunda Guarda, Maestria de Muralha)." />
        <QA q="Posso usar a Reação no meu próprio turno?" a="Pode, desde que o gatilho aconteça." />
        <QA
          q="Conjurar uma magia de 4 Ações me deixa sem Reação?"
          a="Não. Reação é independente do custo em Ações — mas USAR a Reação encerra a conjuração (Cap. 2, §6), e sofrer dano exige o teste de Concentração (CD 10 + Bônus de Rank de quem te acertou). Falhou, você perde o cântico e metade do PM investido (arredondado pra baixo)."
        />
        <QA
          q="O invocado gasta minhas Ações?"
          a="Ordem geral (atacar o mais próximo, proteger alguém, seguir você) é grátis e vale até você mudar. Ordem específica (alvo exato, truque, ajudar alguém) custa 1 Ação sua, e ele a cumpre com a Ação dele; a partir do Vínculo (Intermediário), essa 1 Ação vale para todos os seus invocados de uma vez. Fora isso, ele age sozinho com a própria 1 Ação e 1 Reação por turno."
        />

        <SubTitle>Sobre Preparação (PP)</SubTitle>
        <QA
          q="O Mestre pode dizer não a uma Preparação?"
          a="Só se ela sair do Escopo ou do Domínio. Dentro dos dois, ele não nega — anexa uma complicação. Essa é a troca inteira."
        />
        <QA
          q="Duas árvores de Utilidade me dão duas reservas de PP?"
           a="Uma reserva só: PP = Intelecto + o maior atributo-chave entre elas, +1 por patamar do 3º em diante."
        />
        <QA
          q="Posso preparar algo no meio de um combate?"
          a="Pode. O fato é sempre passado — você está revelando, não fazendo. Mas ele tem que caber no que você teve tempo e motivo de fazer antes da cena começar."
        />

        <SubTitle>Sobre a Guilda e Combinações Novas</SubTitle>
        <QA
          q="Meu Rank de Aventureiro sobe sozinho conforme eu gasto PA?"
          a="Não. Rank de Aventureiro é decisão do Mestre sobre feitos públicos (Cap. 5, §2) — PA gasto não move esse marcador, só o das suas Árvores de Progressão."
        />
        <QA
          q="Posso combinar uma magia com uma técnica de Corpo ou Utilidade, não só magia com magia?"
          a="Pode — desde Rank Avançado nas duas árvores envolvidas, pagando o custo de cada lado (Cap. 2, §4, 'Combinações Além da Magia')."
        />
      </Section>

      <Section>
        <SectionTitle id="apendice-e">E. Viagem entre Continentes</SectionTitle>
        <Prancha id="apendice-e" />
        <P>
          O Mundo de Seis Faces tem seis continentes, e cruzar de um pro outro nunca é rápido nem barato —
          cada um desenvolveu magia, política e bestas diferentes. Este apêndice dá ao Mestre uma régua
          rápida pra travessias longas, reaproveitando os blocos de 1 semana do Downtime (Cap. 5, §1).
        </P>
        <SubTitle>Rotas e Tempo de Travessia</SubTitle>
        <BookTable
          headers={["Rota", "Meio", "Tempo", "Risco"]}
          rows={[
            ["Central ↔ Millis", "Navio de linha, porto grande", "1 bloco", "Baixo — a rota comercial mais movimentada do mundo."],
            ["Central ↔ Begaritt", "Caravana pelo deserto, ou navio contornando a costa", "2 blocos por terra · 1 por mar", "Médio — por terra enfrenta Clima Extremo o trajeto inteiro."],
            ["Millis ↔ Continente Demônio", "Travessia do Estreito — poucos portos autorizam", "2 blocos", "Alto — águas raramente patrulhadas, sem tratado de livre passagem."],
            ["Central/Millis ↔ Continente Divino", "Só por convite ou peregrinação registrada", "3 blocos", "Baixo em trânsito, altíssimo em acesso — maioria dos pedidos é recusada."],
            ["Qualquer rota ↔ Continente Demônio por terra", "Não existe.", "—", "O Continente Demônio é isolado por água em todas as direções conhecidas."],
          ]}
        />
        <SubTitle>Perigo por Região</SubTitle>
        <P>
          Uma região perigosa não precisa de um encontro roteirizado pra cobrar seu preço. Use esta tabela
          pra decidir a frequência de testes de Clima e a chance de encontro por bloco de viagem.
        </P>
        <BookTable
          headers={["Região", "Teste de Clima", "Chance de encontro / semana", "Nota"]}
          rows={[
            ["Grande Floresta (Millis)", "Nenhum — clima ameno", "Alta (1d6: 1-2)", "Perder-se é o perigo real, não o combate."],
            ["Deserto de Begaritt", "CD 14 (perigoso) ao meio-dia", "Média (1d6: 1)", "Sem ração de sobra, a Sede sozinha mata uma caravana despreparada."],
            ["Continente Demônio", "CD 8 a 18, conforme a sub-região", "Alta (1d6: 1-3)", "O risco não é o clima, é não ter a quem recorrer se algo der errado."],
            ["Mar aberto (qualquer rota)", "Nenhum, exceto tempestade (CD do Mestre)", "Baixa (1d10: 1)", "O maior risco é o navio, não o grupo."],
          ]}
        />
        <Aside title="Não é sobre rolar toda semana">
          Estas tabelas existem pra resolver uma travessia em trinta segundos quando ela não é o foco da
          sessão. Se a travessia <i>é</i> o foco da sessão, ignore a tabela e narre cena a cena.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="apendice-f">F. Cerco e Batalha em Escala de Exército</SectionTitle>
        <P>
          O patamar Senhor da Guerra (Tático) já aponta pra isso: guerra em escala de reino não se resolve
          rolando Iniciativa pra cada soldado. Este apêndice dá ao Mestre uma forma rápida de rodar um cerco
          ou uma batalha de exércitos usando três números por lado, não uma ficha por soldado.
        </P>
        <BookTable
          headers={["Recurso", "O que mede"]}
          rows={[
            ["Força", "Poder de combate efetivo. Chega a 0: o exército está destruído ou capturado."],
            ["Moral", "Vontade de continuar lutando. Chega a 0: o exército foge ou se rende, mesmo com Força de sobra."],
            ["Suprimento", "Comida, munição, reforços em trânsito. Chega a 0: o exército perde 1 de Força automaticamente a cada fase."],
          ]}
        />
        <P>
          Um exército comum começa com <b>Força 6, Moral 6, Suprimento 3</b>. Toda batalha corre em três
          fases — Abertura, Embate e Desfecho — e em cada uma o Mestre decide eventos que mudam esses números.
        </P>
        <Aside title="Onde os personagens entram">
          <List
            items={[
              "Magia de área em escala Imperador ou Deus pode valer sozinha -2 a -4 de Força inimiga numa fase.",
              "Um Senhor da Guerra pode negar reforços, mudar o terreno, ou dar +1 de Moral ao próprio exército por fase.",
              "Um Bardo pode custar -2 de Moral inimiga ou +2 de Moral própria numa fase.",
              "Um Ladino sabotando suprimentos antes do cerco pode zerar o Suprimento inimigo já na Abertura.",
              "Combate pessoal contra o comandante inimigo pode causar -3 de Moral inimiga se o grupo vencer em público.",
            ]}
          />
        </Aside>
        <P>
          Ao fim do Desfecho: o lado com Moral 0 foge ou se rende, mesmo vencendo em Força; o lado com Força
          0 está destruído; se nenhum chegar a 0, vence quem tiver a maior soma de Força + Moral.
        </P>

        <SubTitle>Exemplo Resolvido — O Cerco de Roa</SubTitle>
        <P>
          O grupo defende a cidade portuária de Roa contra um exército invasor. <b>Defensores:</b> Força 6,
          Moral 6, Suprimento 3 (a cidade, abastecida). <b>Invasores:</b> Força 8, Moral 5, Suprimento 2 (vieram
          de longe, e a comida já está curta).
        </P>
        <List
          items={[
            "Abertura — Antes do primeiro golpe, o Ladino do grupo já havia sabotado o comboio de suprimentos inimigo durante o Downtime (Cap. 5, §1). O Mestre zera o Suprimento invasor: Suprimento 0.",
            "Abertura, efeito automático de fase — com Suprimento 0, o invasor perde 1 de Força automaticamente. Invasores: Força 7, Moral 5, Suprimento 0.",
            "Embate — o mago de Fogo do grupo conjura uma magia de área Imperador contra a linha de frente inimiga: -3 de Força. Invasores: Força 4.",
            "Embate — o Bardo do grupo canta pros defensores na muralha: +2 de Moral própria. Defensores: Moral 8.",
            "Embate, resposta do Mestre — o comandante invasor manda um grupo de elite escalar a muralha à noite pra forçar um combate pessoal contra o grupo, tentando virar o jogo antes do Desfecho.",
            "Esse combate de elite é resolvido com as regras normais do Capítulo 4, não com os três números do exército — é exatamente o caso que o aviso abaixo cobre. O grupo vence o duelo.",
            "Desfecho — vencer o duelo em público custa -3 de Moral ao invasor: Moral 2. Suprimento continua 0, então o invasor perde mais 1 de Força: Força 2.",
            "Resultado final — Defensores: Força 6, Moral 8, Suprimento 3. Invasores: Força 2, Moral 2, Suprimento 0. Nenhum lado chegou a 0, mas a diferença (14 contra 4) é grande o bastante pro Mestre narrar a retirada invasora sem precisar de mais uma fase.",
          ]}
        />
        <Aside title="O que esse exemplo mostra">
          Nenhum dado de exército foi rolado — cada mudança veio de uma escolha de um personagem específico
          (sabotagem, magia de área, canção, duelo) traduzida num número fixo pelo Mestre. É assim que o
          apêndice deve rodar na mesa: a ficção decide o número, o número nunca decide a ficção.
        </Aside>

        <Warning title="Isto não substitui o Capítulo 4">
          Se um personagem entra em combate individual contra um alvo específico, resolva com as regras
          normais de combate. O sistema de exército só existe pra tudo em volta que não vale a pena virar
          Iniciativa.
        </Warning>
      </Section>

      <Section>
        <SectionTitle id="apendice-g">G. Bestiário — Criaturas por Patamar</SectionTitle>
        <Prancha id="apendice-g" />
        <P>
          Em vez de um manual de monstros exaustivo, um molde por patamar calibrado com a curva que já existe
          no livro, mais seis criaturas prontas pra reskinar e um jeito de pôr na mesa o rival que tem ficha.
        </P>
        <BookTable
          headers={["Patamar", "PV", "CA", "Bônus de Ataque", "Dano por turno", "CD de resistência", "Bônus de Resistência"]}
          rows={MOLDES_CRIATURA.map((m) => [
            rotuloPatamar(m.patamar),
            String(m.pv),
            String(m.ca),
            `+${m.bonusAtaque}`,
            `~${m.danoPorTurno}`,
            String(m.cdResistencia),
            `+${bonusResistencia(m)}`,
          ])}
        />
        <P>
          <b>Bônus de Rank de uma criatura = o patamar dela</b> (+1 no 1º até +6 no 6º). Use esse número em
          toda regra que peça o Bônus de Rank de quem acertou, derrubou ou aplicou: a CD de Concentração de
          quem ela feriu, o Fio da Vida de quem ela derrubou, o teto de acúmulos de Quebrantado que ela aplica.
        </P>
        <SubTitle id="apendice-g-bloco">O Bloco do Monstro — três escolhas, a ficha inteira</SubTitle>
        <P>
          A tabela acima dá os números do combate. Falta tudo o resto que a mesa pergunta no meio da cena:
          <i> qual a Força dele? ele percebe o ladino? corre quanto? é grande?</i> Um Mestre que precisa parar
          a sessão pra montar uma ficha de monstro não monta monstro nenhum — então o bloco inteiro sai de{" "}
          <b>três escolhas curtas</b>: um patamar e dois tipos de criatura.
        </P>
        <BookTable
          headers={["Escolha", "O que ela decide"]}
          rows={[
            ["1. O PATAMAR (1 a 6)", "TODOS os números: PV, CA, acerto, CD, dano por turno, resistência, Bônus de Rank. É a tabela acima, e você não muda nada nela."],
            ["2. O ARQUÉTIPO", "ONDE aqueles números aparecem: qual atributo é o forte, quanto ela anda, e o que ela percebe. É o que separa o ogro do necromante com o mesmo patamar."],
            ["3. O SUB-ARQUÉTIPO", "O QUE ela é: espólio, moeda, resistências e imunidades sugeridas e Ações típicas. Besta e Humanoide podem lutar do mesmo jeito, mas deixam recompensas diferentes."],
          ]}
        />
        <P>
          Escolhidas as três, o bloco básico está pronto; sentido especial ou perícia extra são ajustes que o Mestre decide conscientemente.
        </P>

        <SubTitle id="apendice-g-atributos">Os cinco atributos de uma criatura</SubTitle>
        <P>
          Ela não distribui pontos como um personagem. Os quatro valores saem do patamar, e o arquétipo diz
          quem fica com qual:
        </P>
        <BookTable
          headers={["Patamar", "Principal", "Bom", "Comum", "Fraco"]}
          rows={MOLDES_CRIATURA.map((m) => {
            const p = atributosDaCriatura(m.patamar);
            return [
              rotuloPatamar(m.patamar),
              sinal(p.principal),
              sinal(p.bom),
              sinal(p.comum),
              sinal(p.fraco),
            ];
          })}
        />
        <P className="text-sm">
          A conta, pra quem quiser conferir: <b>Principal = Bônus de Ataque − patamar</b> (é o que faz a
          coluna de acerto da tabela bater com o atributo dela). <b>Bom</b> é metade do Principal, arredondado
          pra cima; <b>Comum</b> é o Bom menos 1; <b>Fraco</b> é sempre −1, em todo patamar. Uma Lenda continua
          sendo burra se o arquétipo dela disser que é.
        </P>
        <BookTable
          headers={["Arquétipo", "Principal", "Bom", "Comum", "Fraco", "Desloc.", "Exemplo"]}
          rows={ARQUETIPOS_CRIATURA.map((a) => [
            a.nome,
            a.principal,
            a.bom,
            a.comum.join(", "),
            a.fraco.join(", "),
            `${a.deslocamento} m`,
            a.exemplo,
          ])}
        />
        <SubTitle id="apendice-g-subarquetipo">O sub-arquétipo — o que ela é</SubTitle>
        <P>
          O arquétipo diz o que a criatura <b>faz</b>: em qual atributo os números dela aparecem. O
          sub-arquétipo diz o que ela <b>é</b> — e é dele que sai o que o corpo dela deixa quando ela cai.
          Os dois se cruzam: um Bruto/Besta é um urso, um Bruto/Morto-Vivo é um zumbi grande, um
          Conjurador/Humanoide é um necromante. Cinco por seis dão trinta criaturas reconhecíveis a partir
          de onze palavras.
        </P>
        <BookTable
          headers={["Sub-arquétipo", "O corpo deixa", "Moeda", "De graça", "Ações típicas", "Exemplo"]}
          rows={SUBARQUETIPOS_CRIATURA.map((s) => [
            s.nome,
            s.espolios.map((id) => SHOP_ITEMS.find((i) => i.id === id)?.name ?? id).join(", "),
            s.moeda === "bolsa" ? "Carrega bolsa" : s.moeda === "pouca" ? "Pouca" : "Nenhuma",
            [
              s.resistencias?.length ? `Resiste a ${s.resistencias.join(", ")}` : "",
              s.imunidades?.length ? `Imune a ${s.imunidades.join(", ")}` : "",
            ]
              .filter(Boolean)
              .join("; ") || "—",
            s.acoesSugeridas.join("; "),
            s.exemplo,
          ])}
        />
        <Aside title="Por que a moeda é do sub-arquétipo, e não do patamar">
          <P>
            Porque é metade da economia de escassez do Cap. 5. Um lobo não carrega bolsa: o que ele rende é
            presa e chifre, que vendem pelo <b>preço cheio</b> por serem matéria-prima. Um bandido carrega
            moeda, mas o equipamento dele revende <b>pela metade</b>.
          </P>
          <P>
            É essa diferença que faz caçar valer mais que saquear — e ela só existe porque a tabela acima
            sabe quem estava do outro lado. Sem sub-arquétipo, o espólio volta a ser um sorteio dentro do
            catálogo inteiro, e um bando de lobos larga poção de mana.
          </P>
        </Aside>
        <P>
          As <b>Ações típicas</b> são sugestões para montar um monstro. Resistência e Imunidade também são
          sugestões — e a Imunidade continua custando um patamar no Orçamento de Encontro.
        </P>
        <P>
          Na recompensa de um encontro, o orçamento em PO é um <b>teto</b>, não uma quantia garantida. Uma
          Besta não deixa moedas nem equipamento aleatório: se as partes do corpo não alcançarem o teto, a
          diferença simplesmente não aparece. Humanoides podem carregar bolsa e equipamento; encontros
          mistos usam a média dos sub-arquétipos presentes. O Mestre escolhe o teto conforme a história,
          porque perigo em combate não determina riqueza.
        </P>

        <Aside title="O que cada atributo da criatura faz, e onde">
          <List
            items={[
              <span key="ataque"><b>Acerto:</b> o Bônus de Ataque da tabela já É o atributo Principal mais o patamar. Um ataque que a ficção manda sair de outro atributo (a cabeçada do bruto ágil) soma esse outro no lugar.</span>,
              <span key="cd"><b>CD do que ela impõe:</b> a da tabela, e ponto. Se a habilidade sai de um atributo que não é o Principal dela, <b>−2 na CD</b> — é a única conta do bloco, e ela existe pra que o arquétipo importe também no que a criatura faz, não só no que ela aguenta.</span>,
              <span key="resist"><b>Resistir:</b> 1d20 + Bônus de Resistência da tabela, sem somar atributo; rola com <b>Vantagem</b> nos testes do atributo Principal dela.</span>,
              <span key="pericia"><b>Perícias:</b> ela tem Vantagem num número de campos igual a <b>metade do patamar, arredondado pra cima</b> (1 no 1º e 2º, 2 no 3º e 4º, 3 no 5º e 6º). Funciona igual à do personagem: perícia é Vantagem, nunca um número (Cap. 1, §4).</span>,
              <span key="percepcao"><b>Percepção passiva = 10 + o Espírito dela</b>, exatamente como a regra de ficar Escondido (Cap. 4, §3). Um bruto de Espírito −1 é fácil de enganar mesmo sendo uma Lenda; um íncubo, não. Se o arquétipo tem sentido especial, ele fura o Escondido dentro do alcance dito — e é isso que faz o cão de caça ser assustador.</span>,
            ]}
          />
        </Aside>
        <Aside title="Proficiência, tamanho e o que a criatura NÃO tem">
          <List
            items={[
              <span key="prof"><b>Criatura não tem proficiência de arma.</b> As armas dela são partes do corpo ou o que a ficção pôs na mão dela, e ela <b>nunca</b> sofre a Penalidade de Não-Proficiência (Cap. 1, §4). Não gaste tempo decidindo se o ogro treinou com o tronco.</span>,
              <span key="tam"><b>Tamanho</b> vem da tabela do Cap. 4, §3 (Pequeno a Colossal), e serve pra uma coisa só: manobra genérica só pega alvo até uma categoria acima da sua. É o que impede empurrar o dragão.</span>,
              <span key="res"><b>Resistência</b> a um tipo de dano é de graça quando a ficção pede — o esqueleto resiste a perfurante, o elemental de fogo a ígneo. <b>Imunidade custa:</b> uma criatura com Imunidade conta como <b>um patamar acima</b> no Orçamento de Encontro, porque ela apaga a jogada de alguém da mesa.</span>,
              <span key="pa"><b>Criatura não tem PA, nem árvore, nem reservas.</b> O que ela sabe fazer está na lista de Ações dela; o custo daquilo é a Ação gasta, e nada mais. PM, PT e PP são economia de personagem — um monstro não guarda troco.</span>,
            ]}
          />
        </Aside>

        <Aside title="Por que CA e resistência crescem">
          A CA acompanha o acerto dos personagens, e o Bônus de Resistência dá às criaturas uma defesa calculável contra efeitos.
        </Aside>
        <Aside title="Por que o chefe age mais de uma vez">
          <P>
            Dobrar o PV resolve a vida do chefe e não resolve o problema real, que é{" "}
            <b>economia de ação</b>. Cinco personagens de 3º patamar agem quinze vezes por rodada; um chefe
            age três. Com o PV dobrado ele continua morrendo antes de agir duas vezes — numa simulação de
            2.000 combates, um grupo de cinco derrubou o chefe de <i>Elite</i> (um patamar acima deles) em
            2,4 rodadas, perdendo 0,7 personagem. Isso não é um chefe: é um saco de pancada com bastante PV.
          </P>
          <P>
            A rodada extra corrige a assimetria do lado certo. O chefe não fica mais difícil de matar — ele
            fica <b>perigoso enquanto está vivo</b>, que é a única coisa que faz um combate contra um inimigo
            só valer a mesa. Se o seu grupo tem três ou menos, a regra não se aplica: a rodada extra existe
            pra compensar números, não pra punir grupos pequenos.
          </P>
        </Aside>
        <Aside title="Ajustando pra cima ou pra baixo">
          <List
            items={[
              "Grupo de criaturas fracas: use metade do PV e do dano do patamar, mas multiplique o número de criaturas.",
              <span key="chefe">
                <b>Chefe único:</b> dobre o PV da linha do patamar dele, mantenha o dano — e dê a ele{" "}
                <b>uma rodada inteira a cada dois personagens</b> do grupo, arredondado pra baixo (grupos de
                três ou menos não ganham rodada extra). Um grupo de cinco enfrenta um chefe que age duas
                vezes por rodada.
              </span>,
              "Fera sem inteligência: role só o Atributo puro em testes sociais (sem Perícia).",
            ]}
          />
        </Aside>
        <SubTitle id="apendice-g-rank">CD dos efeitos da criatura</SubTitle>
        <P>Quando uma criatura aplica condição de CD 8 + BC, use a CD de resistência da tabela dela.</P>

        <SubTitle id="apendice-g-acoes">Como escrever as Ações de uma criatura</SubTitle>
        <P>
          O bloco acima diz o que a criatura <b>é</b>. Falta o que ela <b>faz</b> — e aqui o Mestre trava,
          porque inventar uma fórmula de dado do nada não é decisão de ficção, é calibragem. A régua já
          está na tabela do topo desta seção, na coluna <b>Dano por turno</b>:
        </P>
        <Warning title="As três Ações de um turno somam o Dano por turno do patamar">
          <P>
            Escreva as Ações dela de modo que o <b>melhor turno possível</b> — três golpes do ataque comum,
            ou um golpe grande de 2 Ações mais um comum — chegue perto do número da coluna. Um terço do
            orçamento é o que uma Ação vale; um ataque de 2 Ações vale cerca de dois terços, e pode valer um
            pouco mais, porque ele custa a flexibilidade do turno.
          </P>
          <P>
            <b>Errar pra baixo é aceitável; errar pra cima não é</b>, e não por simetria. Uma criatura fraca
            demais desperdiça uma cena. Uma forte demais mata um personagem, e o jogador não tem como saber
            que foi a conta do Mestre que escorregou.
          </P>
        </Warning>
        <P className="text-sm">
          <b>O arquétipo também diz o formato.</b> O Bruto dá um golpe grande e uma investida lenta; o Ágil,
          dois golpes rápidos; a Fortaleza troca metade do dano dela por não sair do lugar; o Conjurador e a
          Mente trocam precisão por área — e área sempre pede <i>teste de resistência</i> contra a CD dela, e
          nunca rolagem de ataque (Cap. 2, §7).
        </P>
        <Aside title="O piso do dado, e o lacaio de 1º patamar">
          <P>
            Um lacaio de 1º patamar tem <b>5</b> de orçamento no turno inteiro. O menor dado do livro é o d4,
            que rende 2,5 — três ataques do menor dado que existe já dão 7,5, e a criatura mais fraca do livro
            sairia 50% acima da própria régua. Não existe fórmula que resolva isso: o problema é a
            granularidade do dado, não a conta.
          </P>
          <P>
            A saída é de ficção, e é a certa: <b>lacaio não tem economia de ação</b>. Ele avança e dá UM
            golpe, gastando 2 Ações, e a terceira é pra chegar perto. O perigo dele é o número de corpos, não
            o que cada um faz — que é o que a palavra &ldquo;lacaio&rdquo; já prometia.
          </P>
        </Aside>

        <SubTitle id="apendice-g-orcamento">Orçamento de Encontro</SubTitle>
        <P>
          Quantas criaturas, e de qual patamar? Use a conta abaixo para montar o encontro:
        </P>
        <Warning title="Uma criatura do patamar do grupo por jogador">
          <P>
            <b>Encontro equilibrado = um número de criaturas do mesmo patamar do grupo igual ao número de
            jogadores.</b> Quatro jogadores no 3º patamar encaram quatro criaturas de 3º. É o encontro que
            custa recursos e não mata ninguém — e um grupo com curandeiro aguenta de três a quatro deles por dia de aventura.
          </P>
          <P>
            <b>Trocar patamar por número</b>, para montar o resto: uma criatura <b>um patamar acima</b> vale
            duas do patamar do grupo; uma <b>um patamar abaixo</b> vale meia; <b>dois patamares abaixo</b>,
            um quarto. Um <b>Chefe</b> vale <b>cinco</b> criaturas do mesmo patamar dele — um grupo inteiro.
          </P>
          <P>
            <b>Faixas de dificuldade:</b> <i>Fácil</i> até 0,75 do orçamento; <i>Equilibrado</i> acima de 0,75
            até 1,25; <i>Difícil</i> acima de 1,25 até 1,5; <i>Mortal</i> acima de 1,5. Avise a mesa quando
            o Perigo do contrato (Cap. 5, §2) apontar para um encontro mortal.
          </P>
          <P>
            <b>O que a conta não enxerga:</b> terreno, distância e quem age primeiro. Três arqueiros a 90
            metros num telhado valem o dobro dos mesmos três num corredor. A Iniciativa e o mapa mudam mais o
            resultado que o orçamento — ele é o piso da preparação, não a preparação inteira.
          </P>
        </Warning>

        <SubTitle id="apendice-g-chefe">Por que o Chefe pesa cinco</SubTitle>
        <P>
          O chefe não bate mais forte que uma criatura do patamar dele: ele aguenta o dobro e age mais vezes.
          É a economia de ação, e não o dano por golpe, que o torna perigoso — o chefe que age duas vezes por
          rodada espalha o estrago pelo grupo em vez de apagar um personagem por vez. Medido em batalha, isso
          vale <b>um grupo inteiro</b>: cinco criaturas do patamar dele. Um chefe sozinho contra quatro
          jogadores do mesmo patamar já é um encontro difícil; contra cinco, equilibrado.
        </P>
        <P>
          Pra um chefe mais duro, dê a ele companhia (lacaios, meia criatura cada) ou um patamar acima —
          nunca mais dano por golpe. Dano concentrado é o que faz a luta desabar inteira de uma vez.
        </P>
        {/*
          As seis criaturas prontas, com a ficha COMPLETA de cada uma
          (2026-09-25): atributos, CA, PV, ataque, CD, sentidos, resistências e
          as ações, tudo saído dos mesmos dados que /encontros usa pra montar a
          criatura. Antes eram uma tabela-resumo, uma caixa "o que cada uma tem
          além do molde" e uma linha de PV/CA por criatura — o Mestre juntava
          três lugares pra saber a Força do bicho. A ficha já traz tudo aquilo,
          e a tabela e a caixa saíram por repetirem o que ela diz.
        */}
        <SubTitle id="apendice-g-fichas">As fichas das criaturas prontas</SubTitle>
        <P>
          As seis fichas abaixo são o Bloco do Monstro funcionando: nenhum número foi digitado nelas. O
          patamar dá CA, PV, ataque e CD; o arquétipo distribui os atributos (o Principal vem marcado), a
          Percepção sai do Espírito que ele deu, e o Deslocamento é o dele. O que cada criatura declara à mão
          é só o que a ficção exige: o tamanho, o que ela sabe fazer, e o que a torna perigosa.
        </P>
        <div className="mt-2 space-y-4">
          {CRIATURAS_PRONTAS.map((c) => (
            <FichaDeCriatura key={c.id} c={c} />
          ))}
        </div>

        <SubTitle id="apendice-g-rivais">Rivais com ficha</SubTitle>
        <P>
          <i>Mushoku Tensei</i> é uma história de duelos: o espadachim do Norte que persegue o grupo, a discípula
          renegada da Água, o colega de dojo que virou inimigo. Nenhum deles é um molde. Monte o rival como
          um personagem, gastando o PA de um personagem do patamar que você quer. Como rival <b>Padrão</b>,
          ele usa os PV, a CA, o ataque, as reservas e as técnicas da ficha. Como <b>Chefe único</b>,
          começa com o dobro dos PV da ficha e recebe os turnos adicionais da regra de chefe acima;
          o dano de cada técnica permanece o mesmo.
        </P>
        <List
          items={[
            "O patamar dele é o maior patamar da ficha, e o Bônus de Rank também: é esse número que entra na Concentração, no Fio da Vida e no Quebrantado.",
            "O rival usa as mesmas regras e fraquezas do grupo, por isso seus números podem diferir dos moldes de criatura.",
            "O rival conserva atributos, perícias, deslocamento, resistências, imunidades, iniciativa e reservas de PM, PT e PP da ficha. Uma técnica usa o bônus e a CD da sua própria árvore, mesmo se o rival estudou várias árvores.",
            "O invocador pode levar Pactos de combate preparados: respeite o limite de seu Rank e pague o PM antes da iniciativa. Cada invocado entra com seus PV e sua iniciativa, e age com uma Ação própria por turno. Com Chamado de Emergência comprado, pode trazer outro Pacto durante a luta, pagando as Ações e PM da ficha; Círculo Improvisado, Convocação Aprimorada, Pacto Firmado e Duas Vidas também valem.",
            "Pactos de apoio e efeitos especiais pedem a condução do Mestre durante o encontro.",
            "Exemplo: um espadachim com 60 PV e uma técnica de 2 Ações que custa 2 PT entra como chefe com 120 PV. A técnica mantém seu dano e gasta 2 PT por uso; quando não houver PT, o ataque comum continua disponível.",
          ]}
        />
      </Section>

      <FimDoCapitulo id="apendices" />
    </div>
  );
}

function QA({ q, a }: { q: string; a: string }) {
  return (
    <div className="livro-qa rounded-lg border border-parchment-300 bg-parchment-100/60 p-3 text-sm dark:border-parchment-800 dark:bg-parchment-900/40">
      <p className="livro-qa-pergunta font-semibold text-parchment-900 dark:text-parchment-50">{q}</p>
      <p className="mt-1 text-parchment-600 dark:text-parchment-400">{a}</p>
    </div>
  );
}
