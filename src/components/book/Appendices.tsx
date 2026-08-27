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
