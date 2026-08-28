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
            "PV (Cap. 4, §1): Constituição Base (10 + Vigor 2×3 = 16) + Progressão (soma dos dados de PV dos 12 ranks dela, em todas as 4 árvores, dobrada = 150) + Vitalidade (Vigor 2 × Bônus do Santo 4 × 4 = 32) = 198 PV",
            "PM (Cap. 4, §1): só a melhor escola de magia conta, nunca a soma de todas — Espírito 5 × Bônus do Santo de Água (4) + 8 = 28, mais os +10 PM fixos da raça Migurd = 38 PM",
            "BC de Água: 6 + 4 = 10 → acerta com 1d20+10, CD 18, dano +10",
            "CA: 13",
            "Maestrias de Água: Afinidade Aquática, Cântico Fluido, Termodinâmica Aplicada, Domínio Climático",
            "BC de Cura: Espírito 5 + 2 = 7 — ela fecha ferimento, mas o Intermediário dela não salva ninguém de uma ferida mortal",
            "PP e PT: nenhum. Ela não tem patamar em árvore do Corpo nem de Utilidade",
          ]}
        />
        <P>
          Leitura da ficha: ela acerta praticamente qualquer coisa, tem uma reserva de mana que sustenta um
          combate longo inteiro, e cai em poucos golpes de qualquer espadachim decente — 198 PV é bastante
          numa conta isolada, mas fica baixo perto de um personagem do Corpo com a mesma quantidade de Ranks
          investidos, cujos dados de PV por patamar são bem maiores. É exatamente isso que ela é na história —
          uma professora genial dentro de um corpo frágil, que sobrevive porque nunca deixa ninguém chegar
          perto. Se a sua ficha de mago não estiver produzindo esse perfil (acerto altíssimo, mana generosa,
          vida baixa pro nível dela), algum número precisa de ajuste.
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
            ["Sapo-Lodo Gigante", "1º — Comum", "Língua pegajosa (Preso, CD 11) e a Baba de Sapo-Lodo (Cap. 4, §7) em cada mordida."],
            ["Serpente-do-Pântano", "2º — Perigosa", "Peçonha de Serpente-do-Pântano (Cap. 4, §7) em cada picada bem-sucedida."],
            ["Aranha Gigante das Cavernas", "2º — Perigosa", "Teia que aplica Preso em área antes do combate começar; ataca de emboscada com Vantagem."],
            ["Wyvern", "3º — Ameaça", "Voa, mergulha pra morder e volta a 18m de altura no mesmo turno."],
            ["Ogro de Guerra (Onizoku)", "4º — Elite", "Um golpe de maça rola o Dado de Arma duas vezes; contra alvo Caído, dano triplicado."],
            ["Superd Renegado", "5º — Terror", "Usa o Terceiro Olho pra nunca ser flanqueado e conjura Magia de Água até o patamar Rei."],
          ]}
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
