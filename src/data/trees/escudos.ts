import { Tree } from "@/lib/types";

/**
 * 2026-08-30 — nerf e re-equilíbrio do Escudeiro (pedidos do usuário:
 * "da uma geral no escudeiro, ele parece quebrado", "buffa o ombro de
 * pedra", "de menos intens pra ele, por isso ele ta quebrado no começo,
 * de uma armadura leve pra ele mesmo, e uma espada curta", e "colocar
 * no sistema um escudo robusto").
 *
 * O Escudeiro entrava na campanha com o pacote mais barato do livro em todas
 * as três resistências: maior Dado de PV do Principiante (1d10+4, contra
 * 1d8+3 da maioria), Maestria que já dava proficiência universal de
 * armadura/escudo + +2 na CA com escudo, kit inicial com Armadura Média
 * (+3 CA) grátis e talento "Ombro de Pedra" somando mais +2 PV fixos.
 * Empatava com o Lutador em vida e ganhava em defesa na primeira sessão,
 * sem nenhum tradeoff de rank. Quem pegava Cavalaria e Escudos como
 * Árvore Inicial começava a campanha 8-12 PV à frente de qualquer outro
 * tank e já com CA 16 sem armadura mágica (10 + Agi + escudo racial).
 *
 * Cinco correções, todas no kit inicial e no 1º/2º patamar (onde o
 * efeito é maior):
 *
 *   1. 1d10+4 → 1d8+3 no Principiante (3,5 PV a menos na média) e
 *      1d12+4 → 1d10+4 no Intermediário. O dado de PV agora cresce junto
 *      com o Lutador, não à frente dele.
 *   2. +2 na CA da Maestria → +1. Sem o +2, um Principiante de Agilidade 0
 *      com escudo passa de CA 13 pra CA 12 — uma diferença pequena em
 *      número, grande em percentual de acerto do adversário.
 *   3. Limite de protegidos Sob Minha Guarda no Principiante era o Bônus de
 *      Rank (1) — explícito; mantido em 1. No Intermediário sobe pra 2 e
 *      no Avançado pra 3 (era ilimitado com Maestria, agora escada
 *      progressiva). Continua sendo o motor da árvore, só não vem de graça.
 *   4. Kit inicial: Armadura Média → Armadura Leve (+3 CA → +1 CA). O
 *      "Escudeiro com CA 16 logo na primeira sessão" desaparece: a
 *      armadura pesada virou escolha consciente (compra na loja com o
 *      dinheiro do antecedente), não parte do pacote grátis. Quem quer
 *      subir a CA compra talento (Escudo Robusto no Principiante, Dois
 *      Escudos no Intermediário) ou usa o dinheiro inicial pra armadura
 *      média de verdade.
 *   5. Talento novo "Escudo Robusto" (Principiante): empunhar escudo
 *      grande com as duas mãos dá +3 CA adicional (não +2) e Vantagem
 *      contra empurrão/agarrão/queda. Restrição: não dá pra empunhar
 *      outra arma ao mesmo tempo, mas Golpe de Escudo continua
 *      disponível (a "arma" do escudo). É o caminho de defesa pura pra
 *      quem não quer comprar arma. Coexiste com "Dois Escudos" do
 *      Intermediário: empilhar um segundo escudo num escudo grande
 *      soma +3 CA (não +2) — Escudo Robusto vira a forma base pra
 *      carregar dois, evolui quando você compra Dois Escudos.
 *
 * Buff simétrico: o talento "Ombro de Pedra" passou de +2 PV por
 * patamar pra +4 PV por patamar + +1 PT Máximo fixo. O nerf da
 * fórmula global de PV (×2 → ×1,67) comeu a tank-ness do Escudeiro,
 * então Ombro de Pedra virou a fonte clara do "maior PV do livro"
 * prometido pela tagline. 1 PA no Principiante rende +4 PV × 6
 * patamares + 1 PT até o Imperador — investimento consciente que
 * recompensa quem leva o talento até o fim da árvore.
 *
 * 2026-08-31 — Linha "Puro Escudo" (rework de identidade do Defensor).
 *
 * Os talentos "Escudo Robusto" (P) e "Dois Escudos" (I) foram removidos.
 * No lugar, o talento "Puro Escudo" no Principiante (1 PA) abre uma
 * LINHA INTEIRA que percorre todos os ranks: cada rank ganha uma
 * habilidade com versão "Soberana" (mais cara, mais forte, disponível
 * APENAS pra quem comprou Puro Escudo). Quem NÃO comprou continua
 * usando a versão regular — só não ganha o buff. A restrição:
 * enquanto Puro Escudo estiver ativo, o jogador NÃO pode empunhar
 * arma de dano (só escudo/escudo grande). Cajado/Foco Arcano é
 * exceção (é conjuração, não dano), mas o ataque de Cajado (1d6
 * contundente) fica indisponível enquanto o escudo estiver na outra
 * mão.
 *
 * Soberanas atuais: Golpe de Escudo Soberano (P), Provocar Ódio
 * Soberano (P), Aguentar Soberano (I), Escudo de Corpo Inteiro
 * (I talento), Não Ele Soberano (A), Custe Soberano (S), Muralha
 * Soberana (R), Muro Final Soberano (Imp).
 *
 * O Avançado em diante ficou intacto na mecânica base: aí o Escudeiro
 * já está pagando PT por cada interceptação e o Manto de Touki
 * equilibra a economia (PT caro é o custo de defender todo mundo).
 */
export const ESCUDOS_TREE: Tree = {
  id: "cavalaria-e-escudos",
  name: "Cavalaria e Escudos",
  icon: "/arvores/cavalaria-e-escudos.png",
  category: "corpo",
  subgroup: "Tank / Defensor",
  mechanic: {
    tag: "Sob Minha Guarda",
    hook:
      "A única árvore cujo recurso é gasto no dano dos outros. Você não sobrevive: você faz outra pessoa sobreviver.",
    loop: [
      "Designe. Escolha 1 aliado como protegido (2 no Intermediário, 3 do Avançado em diante).",
      "Intercepte. A até 3m dele, gaste 1 Reação e TODO o dano de um ataque contra ele vem pra você — não reduzível por Resistência, mas sim pelo seu PT.",
      "Recarregue. Se o protegido sofrer dano que você NÃO interceptou, você recupera 1 PT. Falhar em proteger é o que te dá recurso pra proteger da próxima vez.",
    ],
    cost:
      "Sozinho você é um alvo com CA alta e pouco dano. Toda a árvore pressupõe alguém ao seu lado que valha mais que você — sem grupo, metade das suas compras não faz nada.",
  },
  keyAttributeLabel: "Vigor",
  resourceLabel: "PT",
  tagline:
    "Aparar e não devolver nada — diferente do Suishin-ryū, o Defensor não tem Fluxo nem contragolpe. A pergunta única é quem está atrás de mim. Maior PV do livro; gasta PT mais rápido que qualquer outra árvore.",
  rankLabels: {
    Principiante: "Escudeiro",
    Intermediário: "Guarda",
    Avançado: "Protetor",
    Santo: "Guardião",
    Rei: "Muralha",
    Imperador: "Bastião",
  },
  proficiencies: {
    armas: "Toda arma de uma mão, TODO escudo, e armadura leve, média e pesada — o pacote de proficiência mais completo do livro em defesa.",
    pericias: "O Bônus de Rank desta árvore NÃO soma em perícia nenhuma — somar em perícia é exclusivo das três árvores de Utilidade (Cap. 3).",
    nota: "Ofício do Corpo (sem patamar Deus).",
  },
  grantedSkills: {
    fixed: ["Atletismo", "Percepção"],
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d8+3",
      weaponDieSteps: 1,
      mastery: {
        name: "Interpor",
        description:
          "[Sob Minha Guarda] Você desbloqueia 'Sob Minha Guarda': designe 1 aliado como protegido; a até 3m, gaste 1 Reação para que todo o dano de um ataque contra ele venha para você (não reduzível por Resistência, mas sim por PT). Se ele sofrer dano que você não interceptou, recupere 1 PT. Você é proficiente com toda armadura e escudo. Usar escudo concede +1 na CA (não empilha com magias de barreira).",
      },
      talents: [
        // 2026-08-30: buff — era +2 PV por patamar, virou +4 PV por patamar e
        // também +1 PT Máximo. O Escudeiro nerfado (×1,67 no PV, sem a armadura
        // média grátis, +1 CA na Maestria em vez de +2) precisava de uma fonte
        // clara de tank-ness pra não virar só "guerreiro com escudo". Ombro de
        // Pedra é o talento-tank por contrato: investir 1 PA no Principiante e
        // escalar até o Imperador dá 4 × 6 = 24 PV, mais +1 PT que sustenta
        // uma interceptação a mais por combate. Coerente com "maior PV do livro"
        // da tagline.
        { id: "ombro-de-pedra", name: "Ombro de Pedra", paCost: 1, description: "+4 PV por patamar seu nesta árvore (cresce sozinho até o Imperador) e +1 PT Máximo fixo. Aplicado na ficha, escala a cada patamar novo que você abrir nela." , grants: { hpPerRank: 4, pt: 1 } },
        // 2026-08-31: substitui o antigo "Escudo Robusto" — em vez de ser um
        // talento de empunhadura, virou uma LINHA INTEIRA do Cavalaria e
        // Escudos que percorre todos os ranks. Quem tem Puro Escudo (1 PA no
        // Principiante) desbloqueia a versão buffada de Golpe de Escudo
        // (Golpe de Escudo Soberano), recebe Aguentar Fortificado no
        // Intermediário, Muralha Viva no Avançado, e assim por diante. Quem
        // NÃO compra Puro Escudo continua podendo usar o escudo de forma
        // normal (com a versão regular dessas habilidades), só não ganha
        // os buffs. A restrição é o preço da identidade: Puro Escudo proíbe
        // empunhar arma de dano — só escudo na mão. Cajado/Foco Arcano é
        // exceção (é conjuração, não dano), mas o jogador perde o ataque do
        // Cajado (1d6 contundente) enquanto segurar escudo.
        { id: "puro-escudo", name: "Puro Escudo", paCost: 1, description: "Você escolhe a defesa total: enquanto tiver este talento, NÃO pode empunhar arma de dano (só escudo ou escudo grande). Em troca, todas as habilidades de Cavalaria e Escudos com versão 'Soberana' ficam disponíveis e seus efeitos defensivos passam a se aplicar também aos aliados adjacentes a você (não só os Sob Sua Guarda). É a identidade do Defensor: ele não devolve nada, ele absorve tudo." },
        { id: "montaria", name: "Montaria", paCost: 1, description: "Você monta, treina e acalma qualquer besta de carga. Sobre ela, você não cai por efeito que permita teste, e sua montaria também está Sob Sua Guarda." },
        { id: "sono-de-ferro", name: "Sono de Ferro", paCost: 1, description: "Você dorme de armadura completa sem penalidade e acorda pronto. Vantagem contra Exaustão por marcha ou vigília." },
      ],
      abilities: [
        {
          id: "muralha-de-um",
          name: "Muralha de Um",
          signature: true,
          paCost: 2,
          ptCost: 1,
          range: "3 metros",
          actions: { normal: 1 },
          effect: "Até o início do próximo turno, você não pode se mover, e aliados a até 3m recebem Cobertura Superior (+5 CA) e Resistência a dano de área. Você não recebe nenhum benefício.",
        },
        {
          id: "golpe-de-escudo",
          name: "Golpe de Escudo",
          paCost: 1,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "1d8 + Força + Bônus de Rank (contundente)" },
          effect: "Teste de Força do alvo (CD 8 + Vigor + Rank) ou é empurrado 3m e fica Caído.",
        },
        {
          // 2026-08-31: linha Puro Escudo no Principiante. Versão Soberana
          // do Golpe de Escudo: dano dobrado e Empurra 6m em vez de 3m, mas
          // perde o ganho de manter o alvo Caído (a Soberana é mais sobre
          // controle de posição do que sobre isolamento). Disponível só
          // pra quem comprou Puro Escudo no Principiante.
          id: "golpe-de-escudo-soberano",
          requires: ["puro-escudo"],
          name: "Golpe de Escudo Soberano",
          paCost: 2,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "2d8 + Força + Bônus de Rank (contundente)" },
          effect: "Requer o talento Puro Escudo. Teste de Força do alvo (CD 8 + Vigor + Rank + 2) ou é empurrado 6m e fica Caído. Você fica com marca de 'última posição' até o início do próximo turno — qualquer aliado que passar por essa posição recebe Cobertura contra o próximo ataque.",
        },
        {
          id: "puxar",
          name: "Puxar",
          paCost: 1,
          range: "9 metros",
          actions: { normal: 1 },
          effect: "Um aliado a até 9m é puxado para adjacente a você e fica Sob Sua Guarda imediatamente, mesmo excedendo seu limite.",
        },
        {
          id: "provocar-odio",
          name: "Provocar Ódio",
          paCost: 1,
          range: "Visão",
          actions: { normal: 1 },
          effect: "Teste de Espírito (CD 8 + Vigor + Rank). Falha: no próximo turno da criatura, ataques contra qualquer um que não seja você têm Desvantagem. (Não é a Provocação do Suishin-ryū, que força o ataque pra alimentar contragolpe — aqui você só torna caro ignorar você.)",
        },
        {
          // 2026-08-31: linha Puro Escudo — Provocar Soberano é a versão
          // definitiva da identidade Defensora: a CD da provocação aumenta
          // em +2, dura 2 turnos em vez de 1, e aplica a Desvantagem em
          // AMBOS os turnos (a provocação normal só vale o turno seguinte).
          id: "provocar-odio-soberano",
          requires: ["puro-escudo"],
          name: "Provocar Ódio Soberano",
          paCost: 2,
          range: "Visão",
          actions: { normal: 1 },
          effect: "Requer o talento Puro Escudo. Teste de Espírito do alvo (CD 8 + Vigor + Rank + 2). Falha: nos DOIS turnos seguintes da criatura, ataques contra qualquer um que não seja você têm Desvantagem. Quem tem Puro Escudo não empunha arma de dano, então essa é a forma como ele puxa a atenção do combate.",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d10+4",
      weaponDieSteps: 0,
      mastery: {
        name: "Peso do Aço",
        description:
          "O alcance de Sob Minha Guarda sobe para 4,5 metros, e você pode proteger até 2 aliados (em vez de 1). Você não pode ser empurrado, derrubado, agarrado nem movido contra a vontade com os pés no chão e escudo na mão. Com armadura pesada, Resistência a dano de área.",
      },
      talents: [
        { id: "folego-de-sentinela", name: "Fôlego de Sentinela", paCost: 1, description: "+1 PT por patamar seu em Cavalaria e Escudos. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela.", grants: { ptPerRank: 1 } },
        { id: "a-porta-sou-eu", name: "A Porta Sou Eu", paCost: 1, description: "Enquanto bloquear uma passagem de até 3m, criaturas Médias ou menores não atravessam sem antes te derrubar." },
        { id: "escudo-de-corpo-inteiro",
          requires: ["puro-escudo"], name: "Escudo de Corpo Inteiro", paCost: 1, description: "Requer Puro Escudo. Você recebe +2 adicional na CA enquanto empunhar apenas escudo(s). Aliados adjacentes a você recebem Meia-Cobertura (+2 CA) passivamente." },
      ],
      abilities: [
        {
          id: "aguentar",
          name: "Aguentar o Baque",
          signature: true,
          reaction: true,
          paCost: 2,
          ptCost: 1,
          range: "Pessoal",
          actions: { normal: 1 },
          damage: { normal: "Reduz 1d10 + Vigor + Bônus de Rank" },
          effect: "1 Reação, ao interceptar dano por Sob Minha Guarda: reduza aquele dano antes de aplicá-lo em você. Empilha com quantas Reações tiver.",
        },
        {
          id: "aguentar-soberano",
          requires: ["puro-escudo"],
          name: "Aguentar Soberano",
          signature: true,
          reaction: true,
          paCost: 3,
          ptCost: 1,
          range: "Pessoal",
          actions: { normal: 1 },
          damage: { normal: "Reduz 2d10 + Vigor + Bônus de Rank" },
          effect: "Requer Puro Escudo. 1 Reação ao interceptar dano: reduz o dano com 2d10 e se a redução zerar o dano, você recupera 1 PT imediatamente.",
        },
        {
          id: "escudo-erguido",
          name: "Escudo Erguido",
          paCost: 1,
          ptCost: 1,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "1 minuto: ataques à distância mundanos contra você e aliados a 3m erram automaticamente. Você não pode correr enquanto sustentar.",
        },
        {
          id: "formacao",
          name: "Formação",
          paCost: 1,
          range: "Passivo",
          actions: { normal: 0 },
          effect: "Aliados adjacentes a você somam seu Bônus de Rank aos testes de resistência contra efeitos de área e contra ser movido. Com Puro Escudo, somam também +1 na CA.",
        },
        {
          id: "cavalgada",
          name: "Cavalgada",
          paCost: 1,
          range: "Deslocamento da montaria",
          actions: { normal: 1 },
          effect: "Requer montaria. Avance até o dobro do deslocamento dela atravessando linhas inimigas — no caminho, teste de Força ou Caídas. Sem ataques de oportunidade.",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d12+5",
      weaponDieSteps: 1,
      ptGained: 2,
      mastery: {
        name: "Escudo Estendido",
        description:
          "Você recebe o Manto de Touki completo e a reserva de PT — recebe 2 PT por patamar em vez de 1. O Touki é projetado para fora do corpo: Sob Minha Guarda alcança 9 metros e exige apenas linha de visão. Interceptar dano deixa de custar Reação uma vez por rodada. O limite de protegidos sobe para 3.",
      },
      talents: [
        { id: "casco-escudos", name: "Casco", paCost: 2, description: "Você tem Resistência a dano físico de armas mundanas enquanto empunhar escudo." },
        { id: "guarda-ampla", name: "Guarda Ampla", paCost: 2, description: "O número de aliados Sob Sua Guarda passa a ser o dobro do seu Bônus de Rank." },
        { id: "aco-paciente", name: "Aço Paciente", paCost: 2, description: "Uma vez por combate, sem gastar Ação, recupere PT iguais ao seu Bônus de Rank em Cavalaria e Escudos. Você gasta PT mais rápido que qualquer outra árvore do livro — este talento existe pra que a segunda metade da luta ainda tenha um Escudeiro nela." },
      ],
      abilities: [
        {
          id: "nao-ele",
          name: "Não Ele",
          signature: true,
          reaction: true,
          paCost: 3,
          ptCost: 2,
          range: "9 metros",
          actions: { normal: 1 },
          effect: "1 Reação: intercepte um ataque, magia ou efeito de área inteiro dirigido a um aliado Sob Sua Guarda, mesmo de alvo único e mesmo sem alcance físico. Você sofre o efeito completo no lugar dele, inclusive condições.",
        },
        {
          id: "nao-ele-soberano",
          requires: ["puro-escudo"],
          name: "Não Ele Soberano",
          signature: true,
          reaction: true,
          paCost: 4,
          ptCost: 2,
          range: "12 metros",
          actions: { normal: 1 },
          effect: "Requer Puro Escudo. 1 Reação: intercepte um efeito dirigido a QUALQUER aliado visível (não só os Sob Sua Guarda). O dano transferido é reduzido em 1d10 + Vigor antes de bater em você.",
        },
        {
          id: "redirecionar-escudos",
          name: "Redirecionar",
          reaction: true,
          paCost: 2,
          ptCost: 1,
          range: "9 metros",
          actions: { normal: 1 },
          effect: "Ao interceptar um ataque à distância ou projétil mágico, desvie-o para uma criatura hostil à sua escolha a até 9m, usando a rolagem original.",
        },
        {
          id: "folego-emprestado",
          name: "Fôlego Emprestado",
          paCost: 2,
          ptCost: 2,
          range: "9 metros",
          actions: { normal: 1 },
          damage: { normal: "PV Temporários = Vigor + Bônus de Rank" },
          effect: "Um aliado Sob Sua Guarda recebe PV Temporários e remove uma condição de Amedrontado, Atordoado ou Caído.",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "2d6+5",
      weaponDieSteps: 0,
      ptGained: 2,
      mastery: {
        name: "Aegis",
        description:
          "Aliados Sob Sua Guarda recebem, passivamente e sem custo: redução de dano igual ao seu Bônus de Rank contra todo dano recebido, imunidade a acertos críticos, e o direito de repetir um teste de resistência falho por turno.",
      },
      talents: [
        {
          id: "aco-vivo",
          name: "Aço Vivo",
          paCost: 3,
          description:
            "Sua armadura e escudo se reparam sozinhos após cada Descanso Curto e não podem ser destruídos por efeito algum de patamar inferior ao seu.",
        },
        {
          id: "contagem-de-corpos",
          name: "Contagem de Corpos",
          paCost: 3,
          description:
            "Para cada aliado Sob Sua Guarda que não tenha sofrido dano neste combate, você recebe +1 na CA, cumulativo.",
        },
      ],
      abilities: [
        {
          id: "custe-o-que-custar",
          name: "Custe o Que Custar",
          signature: true,
          reaction: true,
          paCost: 4,
          ptCost: 3,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "1 Reação, quando um aliado Sob Sua Guarda chegaria a 0 PV: ele fica com 1 PV e é movido 9m para fora do perigo. Você sofre todo o dano excedente, sem receber Marcas da Morte neste turno.",
        },
        {
          id: "custe-o-que-custar-soberano",
          requires: ["puro-escudo"],
          name: "Custe o Que Custar Soberano",
          signature: true,
          reaction: true,
          paCost: 5,
          ptCost: 2,
          range: "12 metros",
          actions: { normal: 1 },
          effect: "Requer Puro Escudo. 1 Reação, quando um aliado chegaria a 0 PV: ele recupera PV igual ao seu nível e você intercepte o dano com 2d12 de Resistência extra. Você pode gastar 1 PT pra repetir um teste de resistência falho por ele no próximo turno.",
        },
        {
          id: "bastiao-menor",
          name: "Bastião Menor",
          paCost: 3,
          ptCost: 2,
          range: "Esfera de 6m",
          actions: { normal: 1 },
          effect: "1 minuto: criaturas hostis que entrarem gastam o dobro do deslocamento, e nenhum efeito de área de fora atinge quem está dentro sem antes te atingir.",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "2d6+6",
      weaponDieSteps: 1,
      ptGained: 2,
      mastery: {
        name: "Ninguém Passa",
        description:
          "Criaturas hostis não podem se mover para além de você (3m para cada lado da sua linha) sem antes vencer uma disputa de Força ou Vigor. Você intercepta dano por Sob Minha Guarda sem gastar Reação, quantas vezes quiser por rodada. Imune a Paralisia, Petrificação, Preso e efeitos que impeçam agir, com 1+ PT.",
      },
      talents: [],
      abilities: [
        {
          id: "a-linha",
          name: "A Linha",
          signature: true,
          paCost: 5,
          ptCost: 4,
          range: "18 metros",
          actions: { normal: 1 },
          effect: "1 minuto: todo dano dirigido a qualquer aliado a até 18 metros vem para você automaticamente, reduzido pelo seu Bônus de Rank. Você não pode se mover, atacar nem ser curado enquanto sustentar.",
        },
        {
          id: "ordem-de-recuo",
          name: "Ordem de Recuo",
          paCost: 4,
          ptCost: 2,
          range: "18 metros",
          actions: { normal: 1 },
          effect: "Todos os aliados a até 18m movem-se imediatamente até o próprio Deslocamento em direção a um ponto indicado, sem ataques de oportunidade e sem gastar as Ações deles.",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "2d8+6",
      weaponDieSteps: 0,
      ptGained: 2,
      mastery: {
        name: "Enquanto Eu Estiver de Pé",
        description:
          "Nenhum aliado Sob Sua Guarda pode ser reduzido a menos de 1 PV enquanto você estiver consciente e a até 18m dele — o excedente vem para você, sempre, sem custo. Você recebe 1 Ação adicional (mover-se, interpor-se, proteger). Ao chegar a 0 PV, gaste todos os PT e volte a 1 PV, uma vez por combate.",
      },
      talents: [
        { id: "nome-na-porta", name: "Nome na Porta", paCost: 4, description: "Aliados Sob Sua Guarda ficam imunes a Amedrontado, e inimigos que falharem ao tentar atravessar sua linha ficam Abalados (Desvantagem até o fim do próximo turno)." },
      ],
      abilities: [
        {
          id: "o-muro-final",
          name: "O Muro Final",
          signature: true,
          paCost: 6,
          ptCost: 6,
          range: "Todo o campo de batalha",
          actions: { normal: 2 },
          effect:
            "Uma vez por Descanso Longo. Por 1 minuto, nenhum aliado seu pode morrer — todo dano letal é transferido para você, e você não cai abaixo de 1 PV durante a duração. Quando acaba, todo o dano acumulado é aplicado em você de uma vez. Você provavelmente morre.",
        },
        {
          id: "o-muro-final-soberano",
          requires: ["puro-escudo"],
          name: "O Muro Final Soberano",
          signature: true,
          paCost: 7,
          ptCost: 0,
          range: "Todo o campo de batalha",
          actions: { normal: 2 },
          effect: "Requer Puro Escudo. 1x por Descanso Longo. Igual a O Muro Final, mas sem custo de PT e você pode escolher até 3 aliados que ficam imunes a dano (você continua recebendo tudo). Ao terminar a duração, você não morre: cai a 1 PV e gera uma explosão de 4d10 + Vigor de dano de área centrada em você.",
        },
        {
          id: "aco-inquebravel",
          name: "Aço Inquebrável",
          paCost: 5,
          ptCost: 4,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "Por 3 turnos, você é imune a todo dano de patamar Rei ou inferior, e criaturas hostis a até 9m não conseguem se afastar de você.",
        },
      ],
    },
  ],
};
