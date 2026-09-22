import { TIPOS_DE_DANO_CONHECIDOS } from "@/lib/combatSim";
import { CriaturaEncontro, criaturaDoMolde } from "@/lib/encounterSim";
import { acoesSugeridas, PapelCriatura } from "@/data/bestiary";

/**
 * Catálogo de adaptações opcionais para a mesa; não substitui as seis fichas do Apêndice G.
 *
 * Cada entrada e um monstro pronto para uso, com nome, patamar, papel,
 * arquetipo e acoes pre-montadas. O Mestre seleciona um, o bloco se
 * preenche sozinho, e ele so edita o que quiser.
 *
 * A regra do projeto: tudo aqui tem que ser possivel montar pela tela.
 * Isto e um ATALHO, nao uma fonte de regra que so exista no codigo.
 */
export interface MonstroDoLivro {
  nome: string;
  patamar: number;
  papel: PapelCriatura;
  arquetipo: string;
  tamanho?: string;
  resistencias?: string[];
  imunidades?: string[];
  pericias?: string[];
  sentido?: string;
  movimentoEspecial?: string;
  deslocamento?: number;
  perigo?: string;
  /** Categoria para filtrar na UI */
  categoria: 'besta' | 'humanoide' | 'monstro' | 'morto-vivo' | 'construto' | 'demonio';
  /** Uma frase descrevendo a criatura para o Mestre */
  descricao: string;
}

export const BESTIARIO: MonstroDoLivro[] = [
  // Patamar 1 (Principiante)
  {
    nome: 'Lobo Cinzento',
    patamar: 1,
    papel: 'padrao',
    arquetipo: 'bruto',
    tamanho: 'Médio',
    pericias: ['Furtividade', 'Sobrevivência'],
    sentido: 'Faro apurado',
    deslocamento: 12,
    perigo: 'Táticas de matilha e velocidade.',
    categoria: 'besta',
    descricao: 'Um lobo comum das florestas, costuma caçar em grupo.'
  },
  {
    nome: 'Goblin Batedor',
    patamar: 1,
    papel: 'lacaio',
    arquetipo: 'agil',
    tamanho: 'Pequeno',
    pericias: ['Furtividade', 'Atletismo'],
    sentido: 'Visão no escuro',
    deslocamento: 9,
    perigo: 'Ataques furtivos em grande número.',
    categoria: 'humanoide',
    descricao: 'O nível mais baixo de goblins, fracos mas traiçoeiros.'
  },
  {
    nome: 'Bandido de Estrada',
    patamar: 1,
    papel: 'padrao',
    arquetipo: 'bruto',
    tamanho: 'Médio',
    pericias: ['Luta', 'Intimidação'],
    deslocamento: 9,
    perigo: 'Atacam viajantes despreparados em superioridade numérica.',
    categoria: 'humanoide',
    descricao: 'Criminosos comuns que vivem de emboscadas nas estradas.'
  },
  {
    nome: 'Rato Gigante',
    patamar: 1,
    papel: 'lacaio',
    arquetipo: 'agil',
    tamanho: 'Pequeno',
    pericias: ['Acrobacia'],
    sentido: 'Visão no escuro, faro',
    deslocamento: 9,
    perigo: 'Doenças em suas mordidas e movimento errático.',
    categoria: 'besta',
    descricao: 'Um roedor anormalmente grande dos esgotos e cavernas.'
  },
  {
    nome: 'Esqueleto Andarilho',
    patamar: 1,
    papel: 'padrao',
    arquetipo: 'bruto',
    tamanho: 'Médio',
    resistencias: ['perfurante'],
    imunidades: ['veneno'],
    pericias: [],
    deslocamento: 6,
    perigo: 'Não sentem dor ou medo, avançando sem parar.',
    categoria: 'morto-vivo',
    descricao: 'Restos animados por magia necromântica residual.'
  },

  // Patamar 2 (Intermediario)
  {
    nome: 'Urso de Presas Vermelhas',
    patamar: 2,
    papel: 'padrao',
    arquetipo: 'bruto',
    tamanho: 'Grande',
    pericias: ['Atletismo', 'Luta'],
    sentido: 'Faro',
    deslocamento: 12,
    perigo: 'Força bruta esmagadora e frenesi de sangue.',
    categoria: 'besta',
    descricao: 'Urso brutal e agressivo, marcado pelas presas sujas de sangue.'
  },
  {
    nome: 'Guerreiro Superd',
    patamar: 2,
    papel: 'padrao',
    arquetipo: 'agil',
    tamanho: 'Médio',
    pericias: ['Luta', 'Furtividade'],
    sentido: 'Terceiro Olho (detecta criaturas invisíveis ou escondidas a 30m)',
    deslocamento: 12,
    perigo: 'Manejo impecável de lança e sentidos aguçados.',
    categoria: 'humanoide',
    descricao: 'Um jovem guerreiro da temida tribo demoníaca Superd.'
  },
  {
    nome: 'Aranha da Floresta',
    patamar: 2,
    papel: 'padrao',
    arquetipo: 'agil',
    tamanho: 'Grande',
    resistencias: ['veneno'],
    pericias: ['Furtividade'],
    sentido: 'Visão no escuro, percepção de vibrações',
    movimentoEspecial: 'Escalada em teto 9m',
    perigo: 'Teias grudentas e presas venenosas.',
    categoria: 'besta',
    descricao: 'Aranha gigante espreitadora que tece armadilhas nas copas.'
  },
  {
    nome: 'Golem de Pedra Menor',
    patamar: 2,
    papel: 'padrao',
    arquetipo: 'fortaleza',
    tamanho: 'Grande',
    resistencias: ['cortante', 'perfurante'],
    imunidades: ['veneno', 'psíquico'],
    pericias: ['Atletismo'],
    deslocamento: 6,
    perigo: 'Defesa quase impenetrável e golpes de esmagamento.',
    categoria: 'construto',
    descricao: 'Autômato de pedra protetor, animado por feitiçarias antigas.'
  },
  {
    nome: 'Troll de Caverna',
    patamar: 2,
    papel: 'padrao',
    arquetipo: 'bruto',
    tamanho: 'Grande',
    resistencias: ['concussão'],
    pericias: ['Luta'],
    sentido: 'Visão no escuro',
    deslocamento: 9,
    perigo: 'Regeneração rápida e força monstruosa.',
    categoria: 'monstro',
    descricao: 'Um gigante grotesco e faminto dos subterrâneos.'
  },

  // Patamar 3 (Avancado)
  {
    nome: 'Treant Ancião',
    patamar: 3,
    papel: 'chefe',
    arquetipo: 'fortaleza',
    tamanho: 'Enorme',
    resistencias: ['concussão', 'perfurante'],
    imunidades: ['veneno'],
    pericias: ['Natureza', 'Luta'],
    deslocamento: 6,
    perigo: 'Resistência colossal e animação de plantas.',
    categoria: 'monstro',
    descricao: 'Espírito milenar da floresta com casca tão dura quanto aço.'
  },
  {
    nome: 'Cavaleiro Real',
    patamar: 3,
    papel: 'padrao',
    arquetipo: 'fortaleza',
    tamanho: 'Médio',
    resistencias: ['cortante'],
    pericias: ['Luta', 'Atletismo', 'Liderança'],
    deslocamento: 9,
    perigo: 'Treinamento de elite e armadura pesada irretocável.',
    categoria: 'humanoide',
    descricao: 'A elite militar protetora da família real.'
  },
  {
    nome: 'Serpente de Fogo',
    patamar: 3,
    papel: 'padrao',
    arquetipo: 'conjurador',
    tamanho: 'Grande',
    resistencias: ['fogo'],
    imunidades: ['fogo'],
    pericias: ['Acrobacia'],
    sentido: 'Visão no escuro',
    deslocamento: 12,
    perigo: 'Corpo ardente e sopro vulcânico.',
    categoria: 'monstro',
    descricao: 'Uma víbora elemental que incinera seus arredores.'
  },
  {
    nome: 'Lanceiro Demoníaco',
    patamar: 3,
    papel: 'padrao',
    arquetipo: 'agil',
    tamanho: 'Médio',
    resistencias: ['fogo'],
    pericias: ['Luta', 'Acrobacia', 'Furtividade'],
    deslocamento: 12,
    perigo: 'Velocidade sobrenatural e golpes letais.',
    categoria: 'demonio',
    descricao: 'Soldado raso de elite do exército demoníaco.'
  },
  {
    nome: 'Hidra Jovem',
    patamar: 3,
    papel: 'chefe',
    arquetipo: 'bruto',
    tamanho: 'Enorme',
    resistencias: ['fogo', 'frio'],
    pericias: ['Luta', 'Atletismo'],
    sentido: 'Visão no escuro, percepção geral',
    deslocamento: 9,
    perigo: 'Múltiplos ataques e regeneração de cabeças.',
    categoria: 'monstro',
    descricao: 'Uma abominação de várias cabeças e fúria indomável.'
  },

  // Patamar 4 (Santo)
  {
    nome: 'Wyrm Vermelho',
    patamar: 4,
    papel: 'chefe',
    arquetipo: 'bruto',
    tamanho: 'Enorme',
    resistencias: ['fogo'],
    imunidades: ['fogo'],
    pericias: ['Intimidação', 'Luta', 'Atletismo'],
    sentido: 'Visão no escuro, faro aguçado',
    movimentoEspecial: 'Voo 18m',
    perigo: 'Força avassaladora e hálito de fogo.',
    categoria: 'monstro',
    descricao: 'Um dragão menor sem magia avançada, mas força estrondosa.'
  },
  {
    nome: 'Mago Renegado',
    patamar: 4,
    papel: 'padrao',
    arquetipo: 'conjurador',
    tamanho: 'Médio',
    resistencias: ['magia'],
    pericias: ['Misticismo', 'Investigação', 'Liderança'],
    sentido: 'Visão mágica',
    deslocamento: 9,
    perigo: 'Feitiços ofensivos mortais de nível Santo.',
    categoria: 'humanoide',
    descricao: 'Gênio mágico exilado que deturpou seus conhecimentos.'
  },
  {
    nome: 'Guardião Sagrado',
    patamar: 4,
    papel: 'padrao',
    arquetipo: 'fortaleza',
    tamanho: 'Grande',
    resistencias: ['radiante', 'magia'],
    imunidades: ['veneno', 'necrótico'],
    pericias: ['Luta', 'Religião'],
    sentido: 'Visão verdadeira',
    deslocamento: 9,
    perigo: 'Defesa absoluta contra feitiços e ataques físicos.',
    categoria: 'construto',
    descricao: 'Colosso divino construído para defender artefatos.'
  },
  {
    nome: 'Assassino das Sombras',
    patamar: 4,
    papel: 'padrao',
    arquetipo: 'agil',
    tamanho: 'Médio',
    resistencias: ['veneno'],
    pericias: ['Furtividade', 'Acrobacia', 'Enganação'],
    sentido: 'Visão no escuro mágica',
    deslocamento: 15,
    perigo: 'Sempre ataca primeiro, nunca é visto antes do golpe fatal.',
    categoria: 'humanoide',
    descricao: 'Lenda do submundo criminoso, diz-se ser uma sombra viva.'
  },
  {
    nome: 'Cavaleiro da Morte',
    patamar: 4,
    papel: 'chefe',
    arquetipo: 'fortaleza',
    tamanho: 'Médio',
    resistencias: ['cortante', 'frio'],
    imunidades: ['veneno', 'necrótico'],
    pericias: ['Luta', 'Intimidação'],
    sentido: 'Visão no escuro',
    deslocamento: 9,
    perigo: 'Aura necromântica que drena a vida ao redor e força inabalável.',
    categoria: 'morto-vivo',
    descricao: 'General revivido amaldiçoado a brandir sua espada para sempre.'
  },

  // Patamar 5 (Rei)
  {
    nome: 'Rei Demônio Menor',
    patamar: 5,
    papel: 'chefe',
    arquetipo: 'mente',
    tamanho: 'Médio',
    resistencias: ['fogo', 'magia'],
    imunidades: ['veneno'],
    pericias: ['Intimidação', 'Magia', 'Liderança', 'Enganação'],
    sentido: 'Telepatia e visão verdadeira',
    movimentoEspecial: 'Voo 12m',
    perigo: 'Feitiçaria letal de nível Rei e aura de comando supremo.',
    categoria: 'demonio',
    descricao: 'Um dos lorde demônios do Continente Demoníaco.'
  },
  {
    nome: 'Dragão Azul',
    patamar: 5,
    papel: 'chefe',
    arquetipo: 'conjurador',
    tamanho: 'Colossal',
    resistencias: ['eletricidade'],
    imunidades: ['eletricidade', 'frio'],
    pericias: ['Luta', 'Intimidação', 'Misticismo'],
    sentido: 'Percepção arcana, faro, visão verdadeira',
    movimentoEspecial: 'Voo 24m',
    perigo: 'Sopro elétrico capaz de desintegrar montanhas e magia antiga.',
    categoria: 'monstro',
    descricao: 'Lorde dos céus e das tempestades.'
  },
  {
    nome: 'General Laplace',
    patamar: 5,
    papel: 'chefe',
    arquetipo: 'bruto',
    tamanho: 'Médio',
    resistencias: ['magia', 'físico'],
    pericias: ['Luta', 'Atletismo', 'Liderança'],
    sentido: 'Visão de fluxo de mana',
    deslocamento: 15,
    perigo: 'Força bruta capaz de romper o espaço e maestria em combate corpo a corpo.',
    categoria: 'demonio',
    descricao: 'Uma das lendas de guerra da raça demoníaca, focado em puro combate físico.'
  },
  {
    nome: 'Lich Ancestral',
    patamar: 5,
    papel: 'chefe',
    arquetipo: 'conjurador',
    tamanho: 'Médio',
    resistencias: ['frio', 'magia'],
    imunidades: ['veneno', 'necrótico'],
    pericias: ['Misticismo', 'Religião', 'História'],
    sentido: 'Visão no escuro arcana',
    deslocamento: 9,
    perigo: 'Domínio absoluto da magia da morte e encantamentos mortais.',
    categoria: 'morto-vivo',
    descricao: 'Mago supremo que desafiou as regras do mundo em busca de imortalidade.'
  },
  {
    nome: 'Behemoth',
    patamar: 5,
    papel: 'chefe',
    arquetipo: 'bruto',
    tamanho: 'Colossal',
    resistencias: ['físico', 'magia'],
    pericias: ['Luta', 'Atletismo'],
    sentido: 'Sensibilidade sísmica',
    deslocamento: 15,
    perigo: 'Terremotos e esmagamento em massa.',
    categoria: 'monstro',
    descricao: 'Uma besta divina que carrega o peso da própria terra.'
  },

  // Patamar 6 (Imperador)
  {
    nome: 'Orsted',
    patamar: 6,
    papel: 'chefe',
    arquetipo: 'mente',
    tamanho: 'Médio',
    resistencias: ['todas'],
    imunidades: ['magia', 'doenças', 'veneno'],
    pericias: ['Luta', 'Magia', 'Atletismo', 'Sobrevivência', 'Misticismo', 'História'],
    sentido: 'Conhecimento absoluto e visão além do tempo',
    deslocamento: 18,
    perigo: 'Invencível. Possui as técnicas supremas de todas as artes marciais e feitiços.',
    categoria: 'humanoide',
    descricao: 'O Dragão Divino. O ser mais forte do mundo.'
  },
  {
    nome: 'Hitogami',
    patamar: 6,
    papel: 'chefe',
    arquetipo: 'mente',
    tamanho: 'Médio',
    resistencias: ['magia', 'ilusão'],
    imunidades: ['danos mortais no mundo físico'],
    pericias: ['Enganação', 'Persuasão', 'Investigação', 'Misticismo'],
    sentido: 'Visão do futuro e das linhas do destino',
    deslocamento: 12,
    perigo: 'Controle das mentes, feitiçaria impossível e ilusões perfeitas.',
    categoria: 'demonio',
    descricao: 'O Deus Humano. Manipulador supremo dos destinos.'
  },
  {
    nome: 'Laplace',
    patamar: 6,
    papel: 'chefe',
    arquetipo: 'mente',
    tamanho: 'Médio',
    resistencias: ['todas as elementais', 'físico'],
    imunidades: ['veneno', 'maldições'],
    pericias: ['Magia', 'Luta', 'Intimidação', 'Misticismo'],
    sentido: 'Visão absoluta da mana e do espaço',
    deslocamento: 15,
    perigo: 'Vasto poder mágico capaz de explodir continentes.',
    categoria: 'demonio',
    descricao: 'O Deus Demônio. Dividido entre dragão e demônio.'
  }
];

/**
 * Cria uma CriaturaEncontro completa a partir de um MonstroDoLivro.
 * Gera um ID unico e preenche acoes sugeridas pelo Apendice G.
 */
export function instanciarMonstro(m: MonstroDoLivro): CriaturaEncontro {
  const id = `pronto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const criatura = criaturaDoMolde(m.patamar, m.papel, m.nome, id);
  criatura.arquetipo = m.arquetipo;
  if (m.tamanho) criatura.tamanho = m.tamanho;
  const normalizar = (tipo: string) => ({ fogo: "ígneo", eletricidade: "elétrico", concussão: "contundente" }[tipo] ?? tipo);
  const conhecido = (tipo: string) => (TIPOS_DE_DANO_CONHECIDOS as readonly string[]).includes(tipo);
  criatura.resistencias = (m.resistencias ?? []).map(normalizar).filter(conhecido);
  criatura.imunidades = (m.imunidades ?? []).map(normalizar).filter(conhecido);
  criatura.resistencias = criatura.resistencias.filter((tipo) => !criatura.imunidades!.includes(tipo));
  if (m.pericias) criatura.pericias = [...m.pericias];
  if (m.sentido) criatura.sentido = m.sentido;
  if (m.movimentoEspecial) criatura.movimentoEspecial = m.movimentoEspecial;
  if (m.deslocamento) criatura.deslocamento = m.deslocamento;
  const pendentes = [...(m.resistencias ?? []), ...(m.imunidades ?? [])].map(normalizar).filter((tipo) => !conhecido(tipo));
  criatura.perigo = [m.perigo, pendentes.length ? `Traços narrativos a arbitrar (não entram como resistência ou imunidade): ${[...new Set(pendentes)].join(", ")}.` : ""].filter(Boolean).join(" ");
  // Preenche acoes sugeridas pelo Apendice G
  const acoesBase = acoesSugeridas(m.patamar, m.papel, m.arquetipo);
  criatura.acoes = acoesBase.map(a => ({
    ...a,
    id: `acao_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }));
  return criatura;
}
