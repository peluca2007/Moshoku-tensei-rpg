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
            "Atributos: Força 0 · Agilidade 3 · Vigor 2 · Intelecto 6 · Espírito 5",
            "PV: (Vigor 2 × 2 = 4) + progressão de 4 ranks de Água + Terra/Vento ≈ 38 PV",
            "PM: Água (4+7+11+16=38) + Terra (22) + Vento (22) + Cura (11) + Reserva Inata (4 patamares × Espírito 5 = 20) + traço Migurd (+6) ≈ 119 PM",
            "BC de Água: 6 + 4 = 10 → acerta com 1d20+10, CD 18, dano +10",
            "CA: 13",
            "Maestrias de Água: Afinidade Aquática, Cântico Fluido, Termodinâmica Aplicada, Domínio Climático",
            "BC de Cura: Espírito 5 + 2 = 7 — ela fecha ferimento, mas o Intermediário dela não salva ninguém de uma ferida mortal",
            "PP e PT: nenhum. Ela não tem patamar em árvore do Corpo nem de Utilidade",
          ]}
        />
        <P>
          Leitura da ficha: ela acerta praticamente qualquer coisa, tem uma reserva de mana que sustenta um
          combate longo inteiro, e cai em três golpes de qualquer espadachim decente. É exatamente isso que
          ela é na história — uma professora genial dentro de um corpo frágil, que sobrevive porque nunca
          deixa ninguém chegar perto. Se a sua ficha de mago não estiver produzindo esse perfil (acerto
          altíssimo, mana enorme, vida ridícula), algum número precisa de ajuste.
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
          headers={["Patamar", "Água", "Fogo", "Vento", "Terra", "Cura", "Desintox", "Barreira", "Invocação"]}
          rows={[
            ["1º", "~10", "~12", "~9", "~11", "—", "—", "—", "~13"],
            ["2º", "~20", "~26", "~18", "~24", "—", "~8", "—", "~24"],
            ["3º", "~28", "~40", "~30", "~36", "—", "~20", "—", "~38"],
            ["4º", "~22 + área", "~62", "~45", "~52", "—", "~28", "—", "~55"],
            ["5º", "~54", "~90", "~70", "~76", "~40", "~55", "~30", "~80"],
            ["6º", "~39 em 45m", "~130", "~110", "~105", "~55", "~70", "~40", "~110"],
          ]}
        />
        <BookTable
          headers={["Patamar", "Espada", "Norte", "Suishin", "Arco", "Lutador", "Escudos", "Utilidade"]}
          rows={[
            ["1º", "~24", "~19", "~11", "~22", "~21", "~7", "~15 (1º turno)"],
            ["2º", "~34", "~25", "~26", "~34", "~32", "~9", "~18"],
            ["3º", "~46", "~34", "~40", "~48", "~44", "~11", "~22"],
            ["4º", "~58", "~42", "~60", "~62", "~58", "~13", "~26"],
            ["5º", "~76", "~55", "~85", "~78", "~74", "~15", "~30"],
            ["6º", "~120", "~81", "0 a ∞", "~91", "~95", "~18", "~31"],
          ]}
        />
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
        <SectionTitle id="apendice-d">D. Aflições do Mundo de Seis Faces</SectionTitle>
        <P>
          Toda aflição tem uma Profundidade de 1 a 5 que sobe sozinha enquanto ninguém trata, e um mago de
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
              "Cura não trata nada desta página, em rank nenhum — fecha o ferimento por onde a coisa entrou, e só. Desintoxicação, na direção oposta, também não trata dano físico: ela remove a causa (veneno, doença, maldição, petrificação), mas não fecha o corte — a carne continua aberta até Cura, uma poção ou repouso cuidarem dela.",
              "Contágio: se uma aflição contagiosa estiver ativa no grupo ao fim de um Descanso Longo, cada personagem que dormiu perto faz teste de Vigor (CD 8 + Profundidade atual).",
              "Ritmo: uma aflição de Profundidade 2 pegada no primeiro dia de viagem chega a 5 em três dias — é esse relógio, não o combate, que cria a urgência de uma campanha longa.",
            ]}
          />
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="apendice-e">E. Ambiguidades Resolvidas</SectionTitle>
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
          a="Não. Reação é independente do custo em Ações — mas se sofrer dano, faça o teste de Interrupção do Capítulo 4 ou perde o cântico."
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
      </Section>

      <Section>
        <SectionTitle id="apendice-f">F. Tempo Livre e Downtime</SectionTitle>
        <P>
          Toda campanha tem trechos sem masmorra: a viagem de volta, a estação chuvosa, o mês esperando uma
          audiência com o rei. Esta seção existe pra que esse tempo produza algo na ficha, sem virar
          burocracia.
        </P>
        <SubTitle>O Bloco de Tempo</SubTitle>
        <P>
          Downtime é contado em <b>blocos de 1 semana</b> — a mesma unidade que o Descanso Longo (Cap. 4) já
          usa pra curar todos os PV. No fim de cada semana livre, cada personagem escolhe <b>uma</b> atividade
          da lista abaixo.
        </P>
        <BookTable
          headers={["Atividade", "Efeito"]}
          rows={[
            ["Treinar", "Ganhe Vantagem no próximo teste de uma Perícia à escolha, ligada à sua Árvore Inicial ou a uma Perícia que você já tenha — dura até ser usado ou até 1 mês passar. Não concede PA."],
            ["Recuperar-se", "Como o Descanso Longo de uma semana (Cap. 4): todos os PV são restaurados, e mais 1 nível de Exaustão é removido além do normal."],
            ["Trabalhar", "Ganhe PO igual a 2d6 × seu maior Bônus de Rank (mínimo 2d6), pelo seu Ofício, sua fama ou um trabalho comum da cidade."],
            ["Cultivar um Contato", "Anote um NPC nomeado e uma cidade ou facção. Da próxima vez que precisar de uma informação ou um favor pequeno, o Mestre pode deixar esse contato resolver — sem PP, sem teste."],
            ["Estudar um Ofício ou Ritual", "Com a Perícia de Ofícios ligada ao que quer fazer, produza um item mundano ou prepare os materiais de um ritual que já pode conjurar. O Mestre define o custo em PO — normalmente metade do preço de mercado."],
            ["Vigiar as Costas do Grupo", "Sem efeito próprio, mas concede a outro personagem Vantagem na atividade dele nesta semana."],
          ]}
        />
        <Warning title="Downtime Não Compra Progressão">
          Nenhuma atividade acima concede PA, magia, talento ou Rank — isso só vem de jogar a campanha (Cap.
          1, seção 2). Downtime existe pra que o tempo entre aventuras pareça vivido, não pra virar uma
          segunda forma de subir de patamar sem risco.
        </Warning>
        <SubTitle>Downtime Interrompido</SubTitle>
        <P>
          Se uma aflição (Apêndice D) estiver ativa em alguém do grupo, a Profundidade dela continua subindo
          normalmente durante o downtime — um bloco de &ldquo;Recuperar-se&rdquo; não pausa o relógio de um
          veneno ou de uma doença.
        </P>
      </Section>

      <Section>
        <SectionTitle id="apendice-g">G. A Guilda de Aventureiros</SectionTitle>
        <P>
          Toda cidade com mais de um poço tem uma sede da Guilda, e é lá que a maioria dos personagens deste
          livro começa. Este apêndice formaliza o que até aqui era só referência narrativa: como funciona o
          Rank de Aventureiro, e o que ele realmente muda na mesa.
        </P>
        <SubTitle>O Rank Não É o Patamar</SubTitle>
        <P>
          <b>O Rank de Aventureiro (F a S) mede reputação, não poder de combate.</b> Ele não aparece em
          nenhuma fórmula deste livro, não dá bônus de ataque, e não é igual ao Rank das suas Árvores de
          Progressão. Um Deus da Espada desconhecido que nunca aceitou um contrato formal pode ser Rank F. Um
          grupo de Rank A pode ter só um patamar Avançado cada — a diferença é que eles já resolveram cem
          contratos e a Guilda sabe o nome deles.
        </P>
        <BookTable
          headers={["Rank", "PA total já ganho (referência, não trava)", "O que muda"]}
          rows={[
            ["F", "0 – 5", "Recém-registrado. Só pega contrato de mural público, sem escolta nem garantia."],
            ["E", "6 – 14", "Sobrevive ao trabalho de rotina: escolta de caravana, extermínio de pragas, entrega em estrada segura."],
            ["D", "15 – 29", "Aceita contratos fora da cidade-sede. Pagamento sobe; a Guilda passa a cobrar 10% de taxa de intermediação."],
            ["C", "30 – 49", "Pode liderar um grupo de Ranks inferiores num contrato — e responde por eles se algo sair errado. Acesso ao arquivo de bestas da sede local."],
            ["B", "50 – 74", "Contratos de nobreza e de guerra pequena passam pela sua mesa. Seu nome começa a aparecer em relatórios que sobem pra capital."],
            ["A", "75 – 109", "Reconhecido em qualquer continente que tenha Guilda. Recusar um contrato de escala regional exige justificativa formal."],
            ["S", "110+", "Menos de dez vivos por continente, normalmente. Contratado direto por reinos e Guildas de outras nações. Vira assunto de história, não de mural."],
          ]}
        />
        <Aside title={'Por que "referência, não trava"'}>
          O número de PA na tabela acima é um palpite calibrado, não uma regra de desbloqueio — ao contrário
          do Rank das Árvores, não existe teste nem compra pra subir de Rank na Guilda. Quem decide é o
          Mestre, olhando pro que o grupo <i>fez</i> publicamente: um personagem com 40 PA gastos todos em
          Perícias discretas de Ladino pode continuar Rank F de propósito — ele é forte, só não é famoso. A
          tabela existe pra dar um chute inicial ao Mestre, não pra tirar a decisão dele.
        </Aside>
        <SubTitle>Subindo de Rank e Obrigações</SubTitle>
        <P>
          Sobe-se de Rank completando contratos marcados pela Guilda como do Rank seguinte ou superior, sendo
          indicado por alguém de Rank mais alto, ou por um feito público grande o bastante pra virar história
          contada em taverna. A promoção nunca é automática: exige voltar à sede, ser avaliado, e — a partir
          de Rank C — pagar uma taxa de registro em PO.
        </P>
        <P>
          A partir de <b>Rank C</b>, recusar um contrato marcado como emergência sem justificativa perde
          Rank. A partir de <b>Rank A</b>, a morte do aventureiro em contrato é investigada formalmente pela
          sede.
        </P>
        <Aside title="Gancho pro Mestre">
          O Rank de Aventureiro é a ferramenta mais simples deste livro pra calibrar dificuldade sem inventar
          números: se o grupo é Rank D, o mural tem contratos de Rank D pra cima. Nenhuma tabela de
          dificuldade de monstro é necessária além disso.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="apendice-h">H. Viagem entre Continentes</SectionTitle>
        <P>
          O Mundo de Seis Faces tem seis continentes, e cruzar de um pro outro nunca é rápido nem barato —
          cada um desenvolveu magia, política e bestas diferentes. Este apêndice dá ao Mestre uma régua
          rápida pra travessias longas, reaproveitando os blocos de 1 semana do Downtime (Apêndice F).
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
        <SectionTitle id="apendice-i">I. Reputação com Facções</SectionTitle>
        <P>
          Nem toda consequência de uma campanha cabe em PA ou em Rank de Aventureiro (Apêndice G) — às vezes
          o que muda é quem abre a porta pra você. Reputação é uma escala narrativa de cinco degraus, uma por
          facção, movida pelo Mestre conforme os atos públicos do grupo.
        </P>
        <BookTable
          headers={["Nível", "O que significa, em qualquer facção"]}
          rows={[
            ["Inimigo (-2)", "A facção age ativamente contra o grupo, sempre que puder fazer isso sem custo alto pra ela."],
            ["Desconfiado (-1)", "Portas se fecham por precaução. Nenhum ataque direto, mas nenhuma ajuda também."],
            ["Neutro (0)", "Ponto de partida padrão — a facção nem sabe quem vocês são, ou sabe e não se importa."],
            ["Respeitado (+1)", "Contratos, favores e informação ficam mais fáceis de conseguir dentro do território da facção."],
            ["Aliado (+2)", "A facção arrisca recursos reais pelo grupo — tropas, magos, dinheiro."],
          ]}
        />
        <SubTitle>As Três Facções deste Livro</SubTitle>
        <BookTable
          headers={["Nível", "Reino Asura", "Igreja de Millis", "Deuses Demônios"]}
          rows={[
            ["Inimigo", "Mandado de captura ativo — a guarda ataca de vista.", "Excomungado. Templos recusam cura, abrigo e água.", "Marcado como inimigo pela Imperatriz Kishirika."],
            ["Desconfiado", "Vigiados: espiões da coroa relatam cada movimento em Ars.", "Sacerdotes recusam bênção e informação, mas não interferem.", "Tolerados, desde que fiquem fora do território de um clã específico."],
            ["Neutro", "Só mais um grupo de aventureiros no registro da capital.", "Nenhum templo conhece o grupo pelo nome.", "O grupo é estrangeiro — cuidado padrão, nada pessoal."],
            ["Respeitado", "Acesso à corte menor; contratos diretos, sem passar pela Guilda.", "Curas gratuitas em templos menores; acesso à biblioteca de um mosteiro.", "Um clã garante passagem segura pelo seu território."],
            ["Aliado", "Audiência com a coroa por pedido; tropas reais em campanhas regionais.", "O Grande Templo de Millis abre arquivos restritos.", "A Imperatriz Kishirika reconhece o grupo."],
          ]}
        />
        <Aside title="Como o Mestre move o marcador">
          Não existe fórmula. Reputação sobe ou desce por atos públicos, não por PA gasto ou sessões jogadas.
          Mude só um degrau por vez, e só quando o ato for grande o bastante pra virar boato ou registro
          oficial.
        </Aside>
        <Aside title="Facções não são unânimes">
          &ldquo;Reino Asura&rdquo; e &ldquo;Igreja de Millis&rdquo; têm política interna — nada impede um
          personagem de ser Aliado de uma ala e Inimigo de outra dentro da mesma facção nominal.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="apendice-j">J. Cerco e Batalha em Escala de Exército</SectionTitle>
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
        <Warning title="Isto não substitui o Capítulo 4">
          Se um personagem entra em combate individual contra um alvo específico, resolva com as regras
          normais de combate. O sistema de exército só existe pra tudo em volta que não vale a pena virar
          Iniciativa.
        </Warning>
      </Section>

      <Section>
        <SectionTitle id="apendice-k">K. Bestiário — Criaturas por Patamar</SectionTitle>
        <P>
          Em vez de um manual de monstros exaustivo, um molde por patamar calibrado com a curva que já existe
          no livro, mais seis criaturas prontas pra reskinar.
        </P>
        <BookTable
          headers={["Patamar", "PV", "CA", "Bônus de Ataque", "Dano por turno", "CD de resistência"]}
          rows={[
            ["1º — Comum", "20", "12", "+3", "~10", "11"],
            ["2º — Perigosa", "45", "13", "+4", "~20", "13"],
            ["3º — Ameaça", "90", "14", "+6", "~35", "15"],
            ["4º — Elite", "150", "15", "+8", "~55", "17"],
            ["5º — Terror", "220", "16", "+10", "~80", "19"],
            ["6º — Lenda", "320", "17", "+12", "~120", "21"],
          ]}
        />
        <Aside title="Ajustando pra cima ou pra baixo">
          <List
            items={[
              "Grupo de criaturas fracas: use metade do PV e do dano do patamar, mas multiplique o número de criaturas.",
              "Chefe único: dobre o PV da linha do patamar dele e mantenha o dano.",
              "Fera sem inteligência: role só o Atributo puro em testes sociais (sem Perícia).",
            ]}
          />
        </Aside>
        <BookTable
          headers={["Criatura", "Patamar", "O que a torna perigosa"]}
          rows={[
            ["Sapo-Lodo Gigante", "1º — Comum", "Língua pegajosa (Preso, CD 11) e a Baba de Sapo-Lodo (Apêndice D) em cada mordida."],
            ["Serpente-do-Pântano", "2º — Perigosa", "Peçonha de Serpente-do-Pântano (Apêndice D) em cada picada bem-sucedida."],
            ["Aranha Gigante das Cavernas", "2º — Perigosa", "Teia que aplica Preso em área antes do combate começar; ataca de emboscada com Vantagem."],
            ["Wyvern", "3º — Ameaça", "Voa, mergulha pra morder e volta a 18m de altura no mesmo turno."],
            ["Ogro de Guerra (Onizoku)", "4º — Elite", "Um golpe de maça rola o Dado de Arma duas vezes; contra alvo Caído, dano triplicado."],
            ["Superd Renegado", "5º — Terror", "Usa o Terceiro Olho pra nunca ser flanqueado e conjura Magia de Água até o patamar Rei."],
          ]}
        />
      </Section>

      <Section>
        <SectionTitle id="apendice-l">L. Crafting e Alquimia</SectionTitle>
        <P>
          Quem tem a Perícia de Ofícios ligada ao que quer fazer já pode produzir coisas fora de combate,
          usando a atividade Estudar um Ofício ou Ritual do Downtime (Apêndice F).
        </P>
        <SubTitle>Poções</SubTitle>
        <P>Uma poção reproduz o efeito de uma magia de Cura ou Desintoxicação já existente no livro, engarrafado.</P>
        <BookTable
          headers={["Poção", "Custo em PO", "Efeito"]}
          rows={[
            ["Poção Menor de Cura", "15 PO", "Reproduz uma magia de Cura de rank Principiante ou Intermediário, sem precisar de mago presente."],
            ["Poção de Antídoto", "25 PO", "Remove 1 ponto de Profundidade de uma única aflição (Apêndice D)."],
            ["Poção Maior de Cura", "60 PO", "Reproduz uma magia de Cura de rank Avançado ou Santo."],
            ["Elixir de Foco", "40 PO", "Vantagem no próximo teste de resistência de Espírito — ajuda a resistir Trauma num momento específico."],
          ]}
        />
        <SubTitle>Venenos</SubTitle>
        <P>Fabricar veneno é conseguir uma dose de uma aflição já catalogada no Apêndice D.</P>
        <BookTable
          headers={["Profundidade", "Exemplo", "Custo típico"]}
          rows={[
            ["1", "Baba de Sapo-Lodo", "5 PO"],
            ["2", "Peçonha de Serpente-do-Pântano", "20 PO"],
            ["3", "Fel de Wyvern", "80 PO"],
            ["4+", "Praga do Continente Demônio", "Não está à venda — só se rouba, caça ou herda."],
          ]}
        />
        <Warning title="A lei e o veneno">
          Vender veneno de Profundidade 3 ou superior sem licença é crime em Millis e no Reino Asura — perde
          Reputação (Apêndice I) com a facção local automaticamente.
        </Warning>
        <SubTitle>Encantamento de Arma e Armadura</SubTitle>
        <BookTable
          headers={["Efeito", "Rank exigido no encantador", "Custo em PO"]}
          rows={[
            ["+1 no Dado de Arma ou +1 na CA", "Avançado", "150 PO"],
            ["Dano elemental extra (+1d6, tipo à escolha)", "Santo", "300 PO"],
            ["Ignora Resistência a um tipo de dano", "Rei", "600 PO"],
            ["+1 no Bônus de Rank pra fins de Dado de Arma", "Imperador", "1500 PO"],
          ]}
        />
        <SubTitle>Itens Mágicos Únicos — O Anel de Teleporte como Prova de Conceito</SubTitle>
        <P>
          Nem todo item mágico cabe numa tabela de preço. Alguns são artefatos: peças únicas cuja fabricação
          é evento de campanha, não compra de ficha — exatamente como o Rank Deus.
        </P>
        <Aside title="O Anel de Teleporte">
          <P>
            <b>O que faz:</b> teleporta o portador — e quem ele tocar — pra um de até três destinos gravados,
            sem custo de PM, sem teste. Depois de usado, precisa de 1 semana pra recarregar.
          </P>
          <P>
            <b>Por que não está na tabela acima:</b> exige um encantador de Invocação de rank Deus, materiais
            que só existem em circunstâncias específicas da campanha, e é irrepetível — gravar um novo
            destino exige voltar ao mesmo encantador. Trate a fabricação como o final de um arco inteiro.
          </P>
        </Aside>
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
