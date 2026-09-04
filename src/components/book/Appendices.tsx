import {
  COLUNAS_CORPO,
  COLUNAS_MAGIA,
  DANO_POR_TURNO_CORPO,
  DANO_POR_TURNO_MAGIA,
} from "@/data/danoPorTurno";
import {
  CRIATURAS_PRONTAS,
  MOLDES_CRIATURA,
  bonusResistencia,
  getMoldePorPatamar,
  rotuloPatamar,
} from "@/data/bestiary";
import { Aside, BookTable, ChapterTitle, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";

export default function Appendices() {
  return (
    <div className="space-y-8">
      <ChapterTitle id="apendices">Apêndices</ChapterTitle>

      <Section>
        <SectionTitle id="apendice-a">A. Ficha de Exemplo — Roxy Migurdia</SectionTitle>
        <P>Use esta ficha pra calibrar se os seus números parecem certos na mesa.</P>
        <P className="font-semibold">
          Roxy Migurdia — Migurd, Santo de Água, Avançado de Terra e Vento, Intermediário de Cura
        </P>
        <List
          items={[
            "Atributos: Força 0 · Agilidade 3 · Vigor 2 · Intelecto 6 (já com +1 de Migurd) · Espírito 5",
            "PV (Cap. 4, §1): corpo treinado (14 + 1,67 × soma dos dados de PV dos 12 ranks dela, nas 4 árvores ≈ 14 + 93 = 107) × Fator de Vigor 2 (×1,40) = 150 PV",
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
          combate longo inteiro, e cai em poucos golpes de qualquer espadachim decente — 150 PV é bastante
          numa conta isolada, mas fica baixo perto de um personagem do Corpo com a mesma quantidade de Ranks
          investidos, cujos dados de PV por patamar são bem maiores. É exatamente isso que ela é na história —
          uma professora genial dentro de um corpo frágil, que sobrevive porque nunca deixa ninguém chegar
          perto. Se a sua ficha de mago não estiver produzindo esse perfil (acerto altíssimo, mana generosa,
          vida baixa pro nível dela), algum número precisa de ajuste.
        </P>
        <P>
          Repare no que o Fator de Vigor faz aqui: com Vigor 2 ela multiplica por 1,40. Se tivesse largado
          Vigor em -2 pra comprar mais um ponto de Intelecto, o mesmo corpo treinado de 107 viraria 42 PV —
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
            "Uma curva de PV/PM própria que diferencie a escola (Água: PM alto, PV médio. Terra: PV altíssimo, PM baixo. Fogo: dano alto, defesa nenhuma. Vento: meio-termo com bônus de deslocamento).",
            "Seis Maestrias automáticas, uma por rank — a do Avançado sempre destranca Magia Combinada, a do Rei sempre destranca um elemento secundário (Água → Eletricidade, Fogo → Explosão/Plasma, Vento → Som/Vácuo, Terra → Metal/Magma).",
            "Uma Magia Assinatura ◆ por rank, custando +1 PA.",
            "Uma magia de utilidade pura que não causa dano nenhum, mas define a identidade da escola fora de combate (Água: Afinidade Aquática e Névoa Densa. Terra: erguer abrigo. Vento: comunicação a distância. Fogo: forjar e iluminar).",
            "De 6 a 8 conhecimentos por rank baixo, 3 a 4 por rank alto — o suficiente pra tabela de desbloqueio fechar sem obrigar o jogador a comprar magia velha só pra bater a contagem.",
            "Declare qual atributo alimenta o BC da escola — Fogo, Água, Vento e Terra usam Intelecto; Cura, Barreira, Desintoxicação e Invocação usam Espírito. Isso divide a Árvore da Magia em duas metades que não competem pelos mesmos pontos de atributo.",
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
        <Warning title="Três coisas que a tabela não diz sozinha">
          <P>
            <b>A Espada conta 4 Ações do Avançado em diante.</b> A Maestria &ldquo;Velocidade
            Encarnada&rdquo; dá uma Ação extra a quem não se move no turno, e os números dela já assumem
            isso. Ela é a única coluna com uma 4ª Ação antes do Imperador.
          </P>
          <P>
            <b>Escudos pressupõe todas as Ações gastas defendendo.</b> Um Defensor Imperador que{" "}
            <i>escolha</i> atacar faz perto de 48 por turno, não 18. A coluna mede o que ele faz no papel
            dele, não o teto dele.
          </P>
          <P>
            <b>Magia não está amortizada pelas Ações.</b> Uma magia de Imperador custa 6 Ações — dois
            turnos inteiros. O Sol Menor aparece como ~130, mas entrega ~65 por turno. Compare marcial com
            marcial e magia com magia; cruzar as duas metades desta tabela engana.
          </P>
        </Warning>
        <Aside title="Como ler esta tabela">
          <P>Número alto não significa personagem melhor. Significa personagem mais estreito.</P>
          <List
            items={[
              "O Fogo tem o maior número e o menor corpo. 33 PV no Imperador. Mata tudo, morre de qualquer coisa, e queima o saque no processo.",
              "A Água tem o menor número entre as ofensivas e vence campanhas — o valor dela é em área, a 45 metros, com aliados poupados e sem chance de errar.",
              "A Terra é a única que constrói. Metade do valor dela nunca aparece aqui: pontes, fortalezas, masmorras vedadas, um grupo que nunca mais dorme exposto.",
              "O Arco só é real contra quem não veste aura. Contra um Santo ou superior, subtraia o dobro do Bônus de Rank do alvo de cada disparo.",
              "O Suishin-ryū não tem número. Contra quatro inimigos agressivos ele bate mais que qualquer coisa deste livro. Contra um inimigo parado, causa zero, pra sempre.",
              "O Lutador tem o número errado na tabela — o que ele realmente faz é acumular Quebrantado. No quarto turno, o inimigo já perdeu 6 de CA e 6 de dano e a luta já acabou sem a tabela registrar.",
              "Escudos é a menor coluna do livro e o personagem mais difícil de substituir. Não causa dano. Decide quem sobrevive.",
              "Cura, Desintoxicação e Barreira não deveriam estar nesta tabela — estão só pra deixar claro que, se você escolher uma delas esperando causar dano, escolheu errado.",
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
          a="Um ataque comum usa os degraus do seu maior patamar entre as árvores do Corpo — os quatro do Norte. Uma técnica usa sempre os degraus da árvore que a concedeu: a Espada de Luz do seu Principiante rola com um degrau só, e é por isso que ela é ruim na sua mão."
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
          q="Eu abri o Deus da Espada no 2º patamar. Ele conta para o +1 por patamar de 3º ou superior?"
          a="Sim — única exceção do livro. O Deus da Espada conta o 2º patamar dele nessa soma, porque foi lá que a aura acordou."
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
        <QA q="Ferida Selada conta como Ferida Fresca para a cura em dobro?" a="Conta. É exatamente pra isso que Selar a Ferida existe." />

        <SubTitle>Sobre Condições</SubTitle>
        <QA
          q="Posso estar Molhado e Em Chamas ao mesmo tempo?"
          a="Não. Fogo em alvo Molhado evapora a água (a condição some, o alvo sofre +2 pelo choque térmico, e não pega fogo naquele golpe). Água em alvo Em Chamas apaga o fogo e aplica Molhado."
        />
        <QA q="Quebrantado some com magia de Cura?" a="Não. Não é ferimento — é o corpo parando de responder. Só um Descanso Curto limpa." />
        <QA q="Desequilibrado tira todas as minhas Reações?" a="Não. Limita a uma por rodada. Um Suishin-ryū Desequilibrado ainda apara uma vez." />
        <QA
          q="Congelado e Atolado ao mesmo tempo o Deslocamento fica negativo?"
          a="Deslocamento não fica abaixo de 0. As condições não se somam em efeito, mas escapar exige resolver as duas separadamente."
        />

        <SubTitle>Sobre Ações e Reações</SubTitle>
        <QA q="Quantas Reações eu tenho?" a="Uma por rodada, sempre — a menos que um efeito diga o contrário (Postura de Água, Segunda Guarda, Maestria de Muralha)." />
        <QA q="Posso usar a Reação no meu próprio turno?" a="Pode, desde que o gatilho aconteça." />
        <QA
          q="Conjurar uma magia de 4 Ações me deixa sem Reação?"
          a="Não. Reação é independente do custo em Ações — mas USAR a Reação encerra a conjuração (Cap. 2, §6), e sofrer dano exige o teste de Concentração (CD 10 + Bônus de Rank de quem te acertou) ou você perde o cântico."
        />
        <QA q="O invocado gasta minhas Ações?" a="Ordens gerais, não. Ordens específicas, 1 Ação sua. Ele tem Iniciativa própria e age sozinho no turno dele." />

        <SubTitle>Sobre Preparação (PP)</SubTitle>
        <QA
          q="O Mestre pode dizer não a uma Preparação?"
          a="Só se ela sair do Escopo ou do Domínio. Dentro dos dois, ele não nega — anexa uma complicação. Essa é a troca inteira."
        />
        <QA
          q="Duas árvores de Utilidade me dão duas reservas de PP?"
          a="Uma reserva só. Use o maior atributo-chave entre elas e some +1 por patamar de 3º ou superior em qualquer uma."
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
            "Embate — o Bardo do grupo canta pros defensores na muralha: +2 de Moral própria. Defensores: Moral 8 (o Mestre trava o teto narrativo em 8, já que a escala nasceu de 6).",
            "Embate, resposta do Mestre — o comandante invasor manda um grupo de elite escalar a muralha à noite pra forçar um combate pessoal contra o grupo, tentando virar o jogo antes do Desfecho.",
            "Esse combate de elite é resolvido com as regras normais do Capítulo 4, não com os três números do exército — é exatamente o caso que o aviso abaixo cobre. O grupo vence o duelo.",
            "Desfecho — vencer o duelo em público custa -3 de Moral ao invasor: Moral 2. Suprimento continua 0, então o invasor perde mais 1 de Força: Força 3.",
            "Resultado final — Defensores: Força 6, Moral 8, Suprimento 3. Invasores: Força 3, Moral 2, Suprimento 0. Nenhum lado chegou a 0, mas a diferença (14 contra 5) é grande o bastante pro Mestre narrar a retirada invasora sem precisar de mais uma fase.",
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
        <P>
          Em vez de um manual de monstros exaustivo, um molde por patamar calibrado com a curva que já existe
          no livro, mais seis criaturas prontas pra reskinar.
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
        <Aside title="As duas colunas que mudaram, e por quê">
          <P>
            <b>CA</b> subia +1 por patamar, e o bônus de ataque de um personagem sobe +1 de Rank <i>mais</i>{" "}
            o crescimento do atributo. O resultado era uma chance de acerto congelada: 70% com atributo 4,
            90% com atributo 8 — a mesma coisa no 1º e no 6º patamar. A CA da criatura simplesmente não
            importava. Agora ela sobe +2 por patamar, e o personagem maximizado sai de 90% pra 70% ao longo
            da campanha: o teto de atributo continua valendo o PA que custou, sem apagar a defesa do monstro.
          </P>
          <P>
            <b>Bônus de Resistência</b> não existia. A tabela dizia tudo de que a criatura precisava pra{" "}
            <i>atacar</i>, e nada pra quando ela <i>resiste</i> — mas metade das habilidades deste livro
            pede um teste do alvo, e o Mestre não tinha número nenhum pra rolar. Ele improvisava, e o efeito
            comprado pelo jogador virava aposta. O valor é metade do Bônus de Ataque, arredondado pra cima;
            contra a CD de um personagem do mesmo patamar isso põe a criatura resistindo perto de 40% das
            vezes.
          </P>
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
              "Chefe único: dobre o PV da linha do patamar dele, mantenha o dano — e dê a ele UMA RODADA INTEIRA A CADA DOIS PERSONAGENS do grupo, arredondado pra baixo, mínimo 1. Um grupo de cinco enfrenta um chefe que age duas vezes por rodada.",
              "Fera sem inteligência: role só o Atributo puro em testes sociais (sem Perícia).",
            ]}
          />
        </Aside>
        <BookTable
          headers={["Criatura", "Patamar", "O que a torna perigosa"]}
          rows={CRIATURAS_PRONTAS.map((c) => [c.nome, rotuloPatamar(c.patamar), c.perigo])}
        />
        {/*
          As ações de cada uma, impressas dos MESMOS dados que a tela de
          Encontros usa pra montar a criatura (2026-09-03). Antes desta data a
          criatura pronta era três colunas de prosa: o Mestre sabia que a Wyvern
          mergulha, e tinha que inventar na hora quanto a mordida dela tira.
        */}
        <div className="mt-4 space-y-3">
          {CRIATURAS_PRONTAS.map((c) => (
            <div
              key={c.id}
              className="print-avoid-break rounded-lg border border-parchment-300 bg-parchment-100/60 p-3 text-sm dark:border-parchment-800 dark:bg-parchment-900/40"
            >
              <p className="font-bold text-parchment-900 dark:text-parchment-50">
                {c.nome}{" "}
                <span className="text-xs font-normal text-parchment-600 dark:text-parchment-400">
                  — {rotuloPatamar(c.patamar)} · {getMoldePorPatamar(c.patamar).pv} PV · CA{" "}
                  {getMoldePorPatamar(c.patamar).ca} · ataque +{getMoldePorPatamar(c.patamar).bonusAtaque} ·
                  CD {getMoldePorPatamar(c.patamar).cdResistencia}
                </span>
              </p>
              <ul className="mt-1.5 space-y-1">
                {c.acoes.map((a) => (
                  <li key={a.nome} className="text-parchment-700 dark:text-parchment-300">
                    <b>{a.nome}</b>{" "}
                    <span className="text-xs text-parchment-600 dark:text-parchment-400">
                      — {a.acoes} Ação{a.acoes > 1 ? "es" : ""} ·{" "}
                      {a.dano ? `${a.dano} de dano` : "sem dano"} · {a.alcance} ·{" "}
                      {a.tipo === "ataque" ? "ataque contra a CA" : "teste de resistência"}
                      {a.area && " · em área"}
                    </span>
                    <span className="block text-xs text-parchment-600 dark:text-parchment-400">{a.nota}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function QA({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-lg border border-parchment-300 bg-parchment-100/60 p-3 text-sm dark:border-parchment-800 dark:bg-parchment-900/40">
      <p className="font-semibold text-parchment-900 dark:text-parchment-50">{q}</p>
      <p className="mt-1 text-parchment-600 dark:text-parchment-400">{a}</p>
    </div>
  );
}
