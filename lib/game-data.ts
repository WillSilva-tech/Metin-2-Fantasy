export interface NewsItem {
  id: string;
  category: 'update' | 'event' | 'maintenance' | 'community';
  title: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl: string;
}

export interface PlayerRank {
  rank: number;
  nick: string;
  level: number;
  kingdom: 'Shinsoo' | 'Chunjo' | 'Jinno';
  league: string;
  leagueIcon: string;
}

export interface TopPlayerRank {
  rank: number;
  nick: string;
  level: number;
  kingdom: 'Shinsoo' | 'Chunjo' | 'Jinno';
  playedTime: string;
}

export interface GuildRank {
  rank: number;
  guild: string;
  leader: string;
  level: number;
  kingdom: 'Shinsoo' | 'Chunjo' | 'Jinno';
}

export interface NewChampionsLeagueRank {
  rank: number;
  nick: string;
  level: number;
  kingdom: 'Shinsoo' | 'Chunjo' | 'Jinno';
  league: string;
  leagueIcon: string;
}

export interface TopClassRank {
  rank: number;
  nick: string;
  level: number;
  kingdom: 'Shinsoo' | 'Chunjo' | 'Jinno';
  className: 'Guerreiro' | 'Ninja' | 'Shura' | 'Shaman';
}

export interface GameClass {
  id: string;
  name: string;
  icon: string;
  difficulty: number;
  description: string;
  fullHistory: string;
  attributes: {
    str: number;
    int: number;
    dex: number;
    vit: number;
  };
  recommendedBuilds: {
    title: string;
    description: string;
  }[];
  skills: {
    name: string;
    type: 'Ativa' | 'Passiva';
    description: string;
    flair: string;
  }[];
}

export interface GameSystem {
  id: string;
  title: string;
  description: string;
  fullDetails: string;
  imageUrl: string;
}

export interface GameEvent {
  id: string;
  title: string;
  time: string;
  days: string[];
  status: 'active' | 'upcoming' | 'completed';
  description: string;
  howItWorks?: string;
  dynamics?: string;
  elimination?: string;
  victory?: string;
  rewards?: string;
  emoji?: string;
}

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    category: 'update',
    title: 'Atualização 1.2: A Ascensão do Dragão de Magma',
    excerpt: 'Prepare-se para enfrentar o terrível Alastor no topo do Monte Volcanus. Nova Dungeon, novos trajes de lava e balanceamento de classes.',
    content: `O vulcão ancestral de FANTASY2 despertou, abrindo as portas para uma das atualizações mais épicas do servidor!

## Novidades Principais:
1. **Nova Dungeon: Fortaleza de Magma** - Direcione seus maiores campeões ao covil de Alastor, o Dragão de Fogo Ancestral. Recomendado para jogadores de nível 105+.
2. **Equipamentos de Dragão de Lava** - Forje armas e armaduras novíssimas com atributos puros de contra-ataque de fogo.
3. **Novos Trajes Lendários** - Adquira na Loja de Cash trajes com brilho animado de magma.
4. **Balanceamento de Personagens** - Ajuste fino de dano nas habilidades Partizan (Guerreiro) e combos rápidos de Shuras.`,
    date: '05 Jun 2026',
    imageUrl: 'https://picsum.photos/seed/magma/800/450'
  },
  {
    id: 'news-2',
    category: 'event',
    title: 'Guerra dos Três Reinos: Especial de Abertura',
    excerpt: 'Consagre o seu reino em uma batalha titânica com prêmios de até 50.000 Cash para as Guilds vencedoras neste fim de semana.',
    content: `Os tambores de guerra soam nos vales de Shinsoo, Jinno e Chunjo! 

A grande guerra territorial será disputada neste sábado às 21:00h (Horário de Brasília).

### Como participar:
- Vá até o NPC Guarda da Praça na capital do seu reino.
- Confirme a entrada na zona militar.
- Pontos serão acumulados eliminando generais e controlando os altares sagrados.

### Premiação total:
- **Reino Vencedor**: Taxa de Drop aumentada em 50% por 24 horas.
- **Top 1 Guild**: 50.000 Cash repassados para o líder da Guild.`,
    date: '04 Jun 2026',
    imageUrl: 'https://picsum.photos/seed/war3reinos/800/450'
  },
  {
    id: 'news-3',
    category: 'maintenance',
    title: 'Manutenção Preventiva das Quartas-Feiras',
    excerpt: 'Otimização de rotas com a nossa nova infraestrutura NGINX e atualização do sistema contra-trapaças (Anti-Cheat).',
    content: `Realizamos a nossa manutenção técnica semanal com foco absoluto na estabilidade e latência de rede.

### Melhorias Realizadas:
- **Latência Reduzida**: Roteamento otimizado diminuindo o ping médio em até 15ms.
- **Segurança Reforçada**: Atualização na assinatura do executável para combater softwares proibidos/scripts.
- **DB Cache**: Limpeza de dados temporários e reorganização de guilds inativas há mais de 12 meses.`,
    date: '02 Jun 2026',
    imageUrl: 'https://picsum.photos/seed/setup/800/450'
  },
  {
    id: 'news-4',
    category: 'community',
    title: 'Vencedores do Evento de Fanart do Discord',
    excerpt: 'Confira as artes mais impressionantes desenhadas pelos jogadores e os cupons liberados.',
    content: `A comunidade do Discord do Fantasy2 deu um show de criatividade! Tivemos mais de 300 artes enviadas inspiradas nas montarias de lobo de magma do jogo.

Os vencedores foram presenteados com vale-cupons digitais direto nas suas contas na aba cupom do painel do jogador. Agradecemos o engajamento extraordinário de cada guerreiro!`,
    date: '31 Mai 2026',
    imageUrl: 'https://picsum.photos/seed/fanart/800/450'
  }
];

export const CHAMPIONS_RANKINGS: PlayerRank[] = [
  { rank: 1, nick: 'ApocalypseMT2', level: 120, kingdom: 'Shinsoo', league: 'Grand Master I', leagueIcon: '👑' },
  { rank: 2, nick: 'ArthasShura', level: 119, kingdom: 'Jinno', league: 'Grand Master II', leagueIcon: '🔱' },
  { rank: 3, nick: 'RangersFire', level: 118, kingdom: 'Chunjo', league: 'Diamante I', leagueIcon: '💎' },
  { rank: 4, nick: 'AthenaShaman', level: 115, kingdom: 'Jinno', league: 'Diamante II', leagueIcon: '💎' },
  { rank: 5, nick: 'LokiAssassin', level: 114, kingdom: 'Shinsoo', league: 'Diamante III', leagueIcon: '💎' },
  { rank: 6, nick: 'ShakaZen', level: 112, kingdom: 'Chunjo', league: 'Ouro I', leagueIcon: '🥇' },
  { rank: 7, nick: 'ZeusFurious', level: 110, kingdom: 'Shinsoo', league: 'Ouro II', leagueIcon: '🥇' },
  { rank: 8, nick: 'LilithDark', level: 109, kingdom: 'Jinno', league: 'Ouro III', leagueIcon: '🥇' },
];

export const TOP_PLAYERS_RANKING: TopPlayerRank[] = [
  { rank: 1, nick: 'ApocalypseMT2', level: 120, kingdom: 'Shinsoo', playedTime: '1.842h' },
  { rank: 2, nick: 'ArthasShura', level: 120, kingdom: 'Jinno', playedTime: '1.621h' },
  { rank: 3, nick: 'ShakaZen', level: 120, kingdom: 'Chunjo', playedTime: '1.490h' },
  { rank: 4, nick: 'AthenaShaman', level: 118, kingdom: 'Jinno', playedTime: '1.355h' },
  { rank: 5, nick: 'RangersFire', level: 117, kingdom: 'Chunjo', playedTime: '1.250h' },
  { rank: 6, nick: 'LokiAssassin', level: 115, kingdom: 'Shinsoo', playedTime: '1.114h' },
  { rank: 7, nick: 'ZeusFurious', level: 115, kingdom: 'Shinsoo', playedTime: '987h' },
  { rank: 8, nick: 'LilithDark', level: 112, kingdom: 'Jinno', playedTime: '890h' },
  { rank: 9, nick: 'CronosWar', level: 111, kingdom: 'Chunjo', playedTime: '823h' },
  { rank: 10, nick: 'HecateMage', level: 110, kingdom: 'Jinno', playedTime: '754h' },
];

export const TOP_GUILDS_RANKING: GuildRank[] = [
  { rank: 1, guild: 'Templários', leader: 'ApocalypseMT2', level: 20, kingdom: 'Shinsoo' },
  { rank: 2, guild: 'Valhalla', leader: 'ArthasShura', level: 20, kingdom: 'Jinno' },
  { rank: 3, guild: 'Asgard', leader: 'ShakaZen', level: 19, kingdom: 'Chunjo' },
  { rank: 4, guild: 'Renegados', leader: 'LilithDark', level: 19, kingdom: 'Jinno' },
  { rank: 5, guild: 'Imperial', leader: 'ZeusFurious', level: 18, kingdom: 'Shinsoo' },
  { rank: 6, guild: 'Olimpo', leader: 'RangersFire', level: 18, kingdom: 'Chunjo' },
  { rank: 7, guild: 'Dynasty', leader: 'AthenaShaman', level: 17, kingdom: 'Jinno' },
  { rank: 8, guild: 'Phoenix', leader: 'LokiAssassin', level: 17, kingdom: 'Shinsoo' },
  { rank: 9, guild: 'Sindicato', leader: 'CronosWar', level: 16, kingdom: 'Chunjo' },
  { rank: 10, guild: 'Sentinelas', leader: 'KratosRed', level: 15, kingdom: 'Shinsoo' },
];

export const CHAMPIONS_LEAGUE_RANKING: NewChampionsLeagueRank[] = [
  { rank: 1, nick: 'ArthasShura', level: 120, kingdom: 'Jinno', league: 'Grand Master I', leagueIcon: '👑' },
  { rank: 2, nick: 'ApocalypseMT2', level: 120, kingdom: 'Shinsoo', league: 'Grand Master II', leagueIcon: '🔱' },
  { rank: 3, nick: 'RangersFire', level: 119, kingdom: 'Chunjo', league: 'Diamante I', leagueIcon: '💎' },
  { rank: 4, nick: 'AthenaShaman', level: 118, kingdom: 'Jinno', league: 'Diamante II', leagueIcon: '💎' },
  { rank: 5, nick: 'LokiAssassin', level: 117, kingdom: 'Shinsoo', league: 'Diamante III', leagueIcon: '💎' },
  { rank: 6, nick: 'ShakaZen', level: 116, kingdom: 'Chunjo', league: 'Ouro I', leagueIcon: '🥇' },
  { rank: 7, nick: 'ZeusFurious', level: 115, kingdom: 'Shinsoo', league: 'Ouro II', leagueIcon: '🥇' },
  { rank: 8, nick: 'LilithDark', level: 115, kingdom: 'Jinno', league: 'Ouro III', leagueIcon: '🥇' },
  { rank: 9, nick: 'CronosWar', level: 113, kingdom: 'Chunjo', league: 'Prata I', leagueIcon: '🥈' },
  { rank: 10, nick: 'HecateMage', level: 112, kingdom: 'Jinno', league: 'Prata II', leagueIcon: '🥈' },
];

export const TOP_CLASSE_RANKING: TopClassRank[] = [
  // Guerreiros
  { rank: 1, nick: 'ApocalypseMT2', level: 120, kingdom: 'Shinsoo', className: 'Guerreiro' },
  { rank: 2, nick: 'ZeusFurious', level: 118, kingdom: 'Shinsoo', className: 'Guerreiro' },
  { rank: 3, nick: 'CronosWar', level: 116, kingdom: 'Chunjo', className: 'Guerreiro' },
  { rank: 4, nick: 'KratosRed', level: 115, kingdom: 'Shinsoo', className: 'Guerreiro' },
  { rank: 5, nick: 'ThorHammer', level: 114, kingdom: 'Jinno', className: 'Guerreiro' },
  { rank: 6, nick: 'Leonidas300', level: 113, kingdom: 'Chunjo', className: 'Guerreiro' },
  { rank: 7, nick: 'AresBattle', level: 112, kingdom: 'Shinsoo', className: 'Guerreiro' },
  { rank: 8, nick: 'MaximusGladius', level: 111, kingdom: 'Jinno', className: 'Guerreiro' },
  { rank: 9, nick: 'AchillesHeel', level: 110, kingdom: 'Chunjo', className: 'Guerreiro' },
  { rank: 10, nick: 'RagnarLodbrok', level: 109, kingdom: 'Jinno', className: 'Guerreiro' },

  // Ninjas
  { rank: 1, nick: 'LokiAssassin', level: 120, kingdom: 'Shinsoo', className: 'Ninja' },
  { rank: 2, nick: 'ShadowStealth', level: 119, kingdom: 'Jinno', className: 'Ninja' },
  { rank: 3, nick: 'Nightshade', level: 118, kingdom: 'Chunjo', className: 'Ninja' },
  { rank: 4, nick: 'PoisonKiss', level: 116, kingdom: 'Jinno', className: 'Ninja' },
  { rank: 5, nick: 'HanzoHatton', level: 115, kingdom: 'Chunjo', className: 'Ninja' },
  { rank: 6, nick: 'WindRunner', level: 114, kingdom: 'Shinsoo', className: 'Ninja' },
  { rank: 7, nick: 'ViperFang', level: 113, kingdom: 'Jinno', className: 'Ninja' },
  { rank: 8, nick: 'LotusPurity', level: 112, kingdom: 'Chunjo', className: 'Ninja' },
  { rank: 9, nick: 'SwiftStrike', level: 111, kingdom: 'Shinsoo', className: 'Ninja' },
  { rank: 10, nick: 'SilentDeath', level: 110, kingdom: 'Jinno', className: 'Ninja' },

  // Shuras
  { rank: 1, nick: 'ArthasShura', level: 120, kingdom: 'Jinno', className: 'Shura' },
  { rank: 2, nick: 'RangersFire', level: 119, kingdom: 'Chunjo', className: 'Shura' },
  { rank: 3, nick: 'DarkSlayer', level: 118, kingdom: 'Shinsoo', className: 'Shura' },
  { rank: 4, nick: 'MirariVoid', level: 117, kingdom: 'Jinno', className: 'Shura' },
  { rank: 5, nick: 'AbyssLord', level: 116, kingdom: 'Chunjo', className: 'Shura' },
  { rank: 6, nick: 'SoulEater', level: 115, kingdom: 'Shinsoo', className: 'Shura' },
  { rank: 7, nick: 'ShadowFiend', level: 114, kingdom: 'Jinno', className: 'Shura' },
  { rank: 8, nick: 'HellfireShura', level: 113, kingdom: 'Chunjo', className: 'Shura' },
  { rank: 9, nick: 'NecroSilence', level: 112, kingdom: 'Shinsoo', className: 'Shura' },
  { rank: 10, nick: 'RunicBlade', level: 111, kingdom: 'Jinno', className: 'Shura' },

  // Shamans
  { rank: 1, nick: 'AthenaShaman', level: 120, kingdom: 'Jinno', className: 'Shaman' },
  { rank: 2, nick: 'ShakaZen', level: 119, kingdom: 'Chunjo', className: 'Shaman' },
  { rank: 3, nick: 'LilithDark', level: 118, kingdom: 'Jinno', className: 'Shaman' },
  { rank: 4, nick: 'HecateMage', level: 116, kingdom: 'Shinsoo', className: 'Shaman' },
  { rank: 5, nick: 'SerenitySky', level: 115, kingdom: 'Chunjo', className: 'Shaman' },
  { rank: 6, nick: 'DivineGrace', level: 114, kingdom: 'Jinno', className: 'Shaman' },
  { rank: 7, nick: 'PhoenixHeal', level: 113, kingdom: 'Shinsoo', className: 'Shaman' },
  { rank: 8, nick: 'StormBringer', level: 112, kingdom: 'Chunjo', className: 'Shaman' },
  { rank: 9, nick: 'LunarEclipse', level: 111, kingdom: 'Jinno', className: 'Shaman' },
  { rank: 10, nick: 'SpiritGuide', level: 110, kingdom: 'Shinsoo', className: 'Shaman' },
];

export const GAME_CLASSES: GameClass[] = [
  {
    id: 'guerreiro',
    name: 'Guerreiro',
    icon: '⚔️',
    difficulty: 2,
    description: 'Os Guerreiros são combatentes corpo a corpo, reconhecidos por sua imensa força física e mente equilibrada. Utilizam sua força e vitalidade para dominar os inimigos, forçando-os a se render em meio à batalha.\n\nGraças às suas habilidades Partizan e Arahan, os Guerreiros assumem um papel fundamental em qualquer confronto.\n\nSão considerados a classe principal do jogo, destacando-se tanto pela eficiência em combates contra monstros quanto pela resistência em batalhas contra outros jogadores. De acordo com sua especialização, podem causar danos devastadores empunhando armas de duas mãos ou demonstrar maestria com armas de uma mão.',
    fullHistory: 'Graças às suas habilidades Arahan e Partizan, os Guerreiros são a classe principal e mais temida das frentes de combate.',
    attributes: { str: 95, int: 35, dex: 70, vit: 90 },
    recommendedBuilds: [
      { title: 'Força do Reino', description: 'Foco total em Vitalidade (VIT) e Força (STR) para dominar os impérios inimigos.' }
    ],
    skills: [
      { name: 'Arahan', type: 'Ativa', description: 'Sopro de espírito guerreiro que aumenta drasticamente a velocidade de ataque físico e o dano crítico.', flair: 'Foco guerreiro límpido.' },
      { name: 'Partizan', type: 'Ativa', description: 'Giro de espada devastador de 360 graus que projeta adversários próximos para longe.', flair: 'Fúria física translúcida.' }
    ]
  },
  {
    id: 'ninja',
    name: 'Ninja',
    icon: '🗡️',
    difficulty: 4,
    description: 'Ninjas são especialistas em emboscadas, treinados desde cedo em técnicas implacáveis. Apenas os mais fortes sobrevivem ao rigoroso treinamento necessário para alcançar esse título. \n\nGraças às suas habilidades excepcionais, os Ninjas dominam com maestria o uso de adagas e arcos. \n\nSua velocidade e precisão são capazes de mudar o rumo de uma batalha em instantes. Capazes de desaparecer na escuridão, atacam com rapidez e mudam o rumo de qualquer batalha.',
    fullHistory: 'Mestres do sigilo originários das florestas escuras de Jinno. Os Ninjas utilizam as técnicas de Arqueiro e Adagas para dilacerar oponentes de perto ou longe.',
    attributes: { str: 70, int: 45, dex: 95, vit: 65 },
    recommendedBuilds: [
      { title: 'Foco Furtivo', description: 'Ataques vorazes e velozes para aplicar golpes em pontos fracos.' }
    ],
    skills: [
      { name: 'Arqueira', type: 'Ativa', description: 'Atira flechas de fogo flamejantes que impactam múltiplos alvos em linha reta contínua.', flair: 'Explosão de calor celestial.' },
      { name: 'Adagas', type: 'Ativa', description: 'Esfaqueamento veloz e golpes furtivos de alto impacto contínuo.', flair: 'Corte preciso sombrio.' }
    ]
  },
  {
    id: 'shura',
    name: 'Shura',
    icon: '💀',
    difficulty: 5,
    description: 'Os Shuras canalizam o poder sombrio das Pedras Metin, fonte de sua força, inteligência. Desde o toque dessas pedras, eles recebem uma energia mágica que os tornam extremamente perigosos.\n\nOs Shuras dominam duas formas de poder, Miragem que empunham lâminas poderosas, unindo ataques brutais a uma defesa impenetrável. E a Magia Negra, que foca em ataques destrutivos e ofensivos, são capazes de lutar com precisão com feitiços letais à distância.\n\nCapazes de distorcer a realidade e trazer o caos ao campo de batalha.',
    fullHistory: 'Sacrificando o bem-estar físico para acolher o fogo rúnico ancestral, Shuras desferem magias de proteção cósmicas e lâminas imbuídas de Miragem ou magia Negra/Back.',
    attributes: { str: 60, int: 95, dex: 75, vit: 70 },
    recommendedBuilds: [
      { title: 'Lâmina Rúnica', description: 'Mescla de cura espiritual com escudos impenetráveis de energia mística.' }
    ],
    skills: [
      { name: 'Miragem', type: 'Ativa', description: 'Invoca o fogo espiritual em sua lâmina para absorver o dano causado como HP do oponente.', flair: 'Chama de magma sombria.' },
      { name: 'Negra/Back', type: 'Ativa', description: 'Um escudo rotativo de energia escura que reduz todo o dano recebido em até 35% fixos.', flair: 'Aura qualificada cósmica.' }
    ]
  },
  {
    id: 'shaman',
    name: 'Shaman',
    icon: '🪭',
    difficulty: 3,
    description: 'Muito inteligentes, os Shamans vivem da magia, buscando tanto cura quanto poder. Esses personagens são essenciais para fortalecer outros jogadores, oferecendo buffs valiosos que aumentam defesa, ataque e resistência.\n\nDominam duas formas de magia espiritual do Dragão, poderosa e destrutiva e Relâmpago com ataques rápidos e precisos, que também reforça aliados.\n\nVersáteis, podem apoiar grupos ou enfrentar desafios sozinhos, sendo peças-chave em qualquer batalha.\n\nNenhum inimigo resiste ao seu poder e á proteção que oferecem aos aliados.',
    fullHistory: 'Guiados pela sabedoria milenar do Dragão Celestial e as tempestades de Relâmpago para guiar guerreiros e purificar debuffs ou evaporar reinos.',
    attributes: { str: 40, int: 95, dex: 60, vit: 80 },
    recommendedBuilds: [
      { title: 'Misticismo Celestial', description: 'Cura e auxílio cooperativo por meio de bênçãos de fogo e tempestades cósmicas.' }
    ],
    skills: [
      { name: 'Dragão', type: 'Ativa', description: 'Aumenta consideravelmente a chance de dano crítico do alvo por tempo prolongado.', flair: 'Luz dourada cósmica.' },
      { name: 'Relâmpago', type: 'Ativa', description: 'Faz brotar descargas elétricas e clarões misticistas que desintegram oponentes.', flair: 'Clarão de pureza celestial.' }
    ]
  }
];

export const GAME_SYSTEMS: GameSystem[] = [
  {
    id: 'system-trajes',
    title: 'Sistema de Trajes',
    description: 'Personalize o visual do seu herói com sobreposições animadas imponentes de asas e elmos lendários que concedem buffs customizáveis.',
    fullDetails: 'Estilize seu herói totalmente sob demanda com nosso exclusivo guarda-roupas do jogo. Trajes visuais vêm com bônus adicionais de status customizáveis (ex: resistência ao elemento fogo ou taxa de drop), sem estragar sua armadura principal! Escolha asas de cinzas, auréolas douradas ou espadas luminosas nas costas.',
    imageUrl: 'https://picsum.photos/seed/fantasy-costumes/600/400'
  },
  {
    id: 'system-bosses',
    title: 'Boss Mundial',
    description: 'Enfrente criaturas colossais que invadem os mapas neutros. O dano é contabilizado por guilda e as recompensas são divididas por contribuição.',
    fullDetails: 'Duas vezes ao dia, o terrível Soberano das Chamas ressurge em um mapa neutro aberto. Todos os três reinos enviam seus guerreiros para derrubá-lo. O sistema calcula a contribuição exata de dano de cada guild/jogador e distribui baús raros contendo cascas de forjamento e vouchers na Loja de Cash de forma 100% automatizada e limpa.',
    imageUrl: 'https://picsum.photos/seed/fantasy-worldboss/600/400'
  },
  {
    id: 'system-wars',
    title: 'Guilds War',
    description: 'As arenas bélicas mais disputadas do servidor. Controle e coordene seus exércitos em combates 50x50 com rankings ao vivo.',
    fullDetails: 'Organize suas frentes de guerra. Nosso exclusivo gerenciador de guerras de guilds permite abrir instâncias síncronas personalizadas com transmissão ao vivo para moderadores, sistema de veto de itens e estatísticas pós-luta extremamente detalhadas (K/D/A, dano absorvido, e buffs aplicados).',
    imageUrl: 'https://picsum.photos/seed/fantasy-guildwar/600/400'
  },
  {
    id: 'system-champions',
    title: 'Champions League',
    description: 'Combate competitivo rápido de equipes equilibradas com seleção autônoma de classe e patentes de Bronze a Grand Master.',
    fullDetails: 'Encontre partidas equilibradas em formato 5v5 de maneira autônoma com o nosso emulador de matchmaking. Suba na classificação, ganhe prestígio e acumule Pontos de Honra que podem ser trocados por atributos extras perpétuos.',
    imageUrl: 'https://picsum.photos/seed/fantasy-champions/600/400'
  },
  {
    id: 'system-metins',
    title: 'Guerra de Metins',
    description: 'As lendárias pedras de fúria caem do céu. Proteja o monumento do seu império ao mesmo tempo que mobiliza tropas para destruir os rivais.',
    fullDetails: 'Cada império Shinsoo, Chunjo e Jinno deve proteger sua Pedra Metin mística na arena central. Ao final, o reino com a pedra intacta ganha 24h de acesso ao mapa secreto PvM de drop triplicado.',
    imageUrl: 'https://picsum.photos/seed/fantasy-metin/600/400'
  },
  {
    id: 'system-rankings',
    title: 'Sistema de Ranking',
    description: 'A glória eterna compilada em tempo real. Acompanhe os melhores do servidor, maiores por classe, guildas líderes e a liga competitiva.',
    fullDetails: 'O sistema de leaderboard consulta o banco de dados em tempo real para exibir os rankings de jogadores por tempo jogado, nível de guilda, patentes da Champions League e desempenhos individuais por classe com filtros rápidos.',
    imageUrl: 'https://picsum.photos/seed/fantasy-rankings/600/400'
  },
  {
    id: 'system-torneios',
    title: 'Sistema de Torneios',
    description: 'Torneios automatizados semanais por classe com chaves eliminatórias síncronas, moedas de cash premium e coroas cobiçadas.',
    fullDetails: 'Participe do torneio de PvP mais elitizado do servidor. O sistema agrupa guerreiros de mesma classe (ninja vs ninja, guerreiro vs guerreiro) em combates 1v1 limpos, coroando o grande campeão com efeitos reluzentes.',
    imageUrl: 'https://picsum.photos/seed/fantasy-tournaments/600/400'
  }
];

export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'event-ox',
    title: 'Evento OX',
    time: '19:00',
    days: ['Segunda', 'Quarta', 'Sexta'],
    status: 'active',
    emoji: '👉',
    description: 'Um clássico "quiz" de conhecimentos sobre o jogo, onde você responde se as afirmações da equipe são verdadeiras (O) ou falsas (X). Resista até o fim para garantir prêmios excelentes.',
    howItWorks: 'Você entra falando com o NPC Uriel. Geralmente, é necessário um nível mínimo (como nível 1).',
    dynamics: 'São feitas rodadas de perguntas rápidas. Você deve correr para o lado O (Verdadeiro) ou X (Falso) antes do tempo acabar.',
    elimination: 'Quem estiver do lado incorreto é teletransportado para fora da arena e vira apenas espectador.',
    victory: 'Se restarem 5 ou menos jogadores, o evento pode ser encerrado prematuramente e todos recebem a premiação suprema. Caso contrário, segue até a última pergunta!'
  },
  {
    id: 'event-caca-gm',
    title: 'Evento Caça ao GM',
    time: '19:00',
    days: ['Terça', 'Quinta'],
    status: 'active',
    emoji: '👉',
    description: 'Um Game Master esconde-se em um mapa misterioso e dá pistas de sua localização. O primeiro a encontrá-lo e interagir ganha prêmios exclusivos de elite.',
    howItWorks: 'O membro da equipe se esconde em um mapa, geralmente neutro ou acessível a todos, como áreas de praça ou locais com monstros.',
    dynamics: 'São dadas dicas no chat global (Grito/Shout) ou por avisos de sistema em tempo real.',
    rewards: 'O primeiro jogador a encontrar o GM e interagir com ele (iniciando negociação, PM ou comando) garante prêmios incríveis como itens raros e baús.'
  },
  {
    id: 'event-tanakas',
    title: 'Evento Tanakas',
    time: '20:00',
    days: ['Segunda', 'Quarta', 'Sexta'],
    status: 'active',
    emoji: '👉',
    description: 'Monstros especiais e extremamente velozes que correm sem parar! Cace-os para dropar a cobiçada Orelha do Tanaka e troque por riquezas.',
    howItWorks: 'Piratas Tanakas aparecem exclusivamente durante eventos oficiais. Eles não atacam nem recuperam vida, mas correm freneticamente à velocidade máxima pelo mapa.',
    rewards: 'Ao derrotá-los, eles dropam a valiosa Orelha do Tanaka, que pode ser acumulada e trocada com NPCs por cupons raros e recompensas especiais.'
  },
  {
    id: 'event-boss',
    title: 'Invasão dos Boss',
    time: '20:00',
    days: ['Terça', 'Quinta', 'Sábado'],
    status: 'upcoming',
    emoji: '👉',
    description: 'Chefes gigantescos e mortais surgem em mapas específicos ou neutros. Organize sua guilda ou grupo para derrotá-los e coletar espólios valiosos.',
    howItWorks: 'O servidor envia um anúncio global informando a localização (mapa) e o nome do Boss colossal que está por renascer.',
    rewards: 'Ao neutralizar a ameaça do Boss, todos que participaram ganham acesso a espólios de alto valor, como baús premium e itens raros de upgrade.'
  },
  {
    id: 'event-metins',
    title: 'Guerra das Metins',
    time: '21:00',
    days: ['Segunda'],
    status: 'upcoming',
    emoji: '👉',
    description: 'Um evento militar onde cada reino protege sua Pedra Metin enquanto tenta aniquilar a do império rival. O reino sobrevivente garante vantagens exclusivas.',
    howItWorks: 'Cada reino (Shinsoo, Chunjo e Jinno) deve proteger sua própria Pedra Metin original na arena ao mesmo tempo que mobiliza exércitos para quebrar a dos opositores.',
    victory: 'Ao final do evento, o reino que ainda tiver sua Pedra Metin intacta será declarado o grande vencedor.',
    rewards: 'O reino vencedor ganhará acesso exclusivo a uma ilha secreta de monstros (PvM especial) por 24 horas, com multiplicadores de drop raros.'
  },
  {
    id: 'event-encruzilhada',
    title: 'Guerra da Encruzilhada',
    time: '21:00',
    days: ['Terça'],
    status: 'upcoming',
    emoji: '👉',
    description: 'Grande embate de três reinos em pontos de controle militar na Encruzilhada. Ideal para guerreiros provarem sua maestria em PvP massivo.',
    howItWorks: 'Os impérios batalham ferozmente pelo controle e manutenção de pontos de interesse estratégicos por toda a área da Encruzilhada.',
    dynamics: 'Interaja com seu reino, defenda posições-chave, cure seus companheiros e deponha hordas de inimigos na linha de frente.',
    rewards: 'O reino vencedor garante acesso exclusivo a um evento PvM especial, repleto de monstros majestosos e chances fabulosas de drops raros.'
  },
  {
    id: 'event-insignias',
    title: 'Guerra das Insígnias',
    time: 'Dias aleatórios',
    days: [],
    status: 'upcoming',
    emoji: '🏴',
    description: 'Combate generalizado todos-contra-todos (sem divisão de reinos). Colete bônus acumulativos e Insígnias de heróis abatidos.',
    howItWorks: 'Batalha sangrenta individual sem restrições de reinos. A cada adversário derrotado na arena, você fatura bônus de combate e acumula Insígnias.',
    rewards: 'As Insígnias podem ser inteiramente salvas e trocidas no sistema de trocas do jogo por itens raros de refino e visuais exclusivos.'
  },
  {
    id: 'event-champions-league',
    title: 'Champions League',
    time: 'Todos os dias',
    days: [],
    status: 'active',
    emoji: '⚔️',
    description: 'Arena competitiva em formato de equipes equilibradas 4x4 ou 5x5 com seleções automatizadas. Suba na classificação do ranking do servidor!',
    howItWorks: 'O sistema cria times balanceados entre as classes de forma 100% autônoma. Cada vitória concede Pontos de Honra.',
    dynamics: 'Acumule vitórias para subir de patente competitiva na classificação do ranking mundial do servidor.',
    rewards: 'Ao avançar nas patentes da liga, os guerreiros ganham atributos passivos perpétuos extras de bônus e prestígio supremo.'
  },
  {
    id: 'event-pvp',
    title: 'Torneio PvP',
    time: '20:00',
    days: ['Sábado'],
    status: 'upcoming',
    emoji: '👉',
    description: 'Grande torneio síncrono de batalhas equilibradas de Classe vs Classe (Guerreiro vs Guerreiro, etc.) para consagrar o melhor duelista do servidor.',
    howItWorks: 'Batalhas em duelos limpos 1v1 estruturados por Classe correspondente (Guerreiro vs Guerreiro, Ninja vs Ninja, Shura vs Shura, Shaman vs Shaman) ou torneio livre misto.',
    rewards: 'Os campeões faturam taças, títulos honoríficos reluzentes ao lado do nick e moedas de cash exclusivas.'
  },
  {
    id: 'event-gvg',
    title: 'Torneio GvG',
    time: '20:00',
    days: ['Domingo'],
    status: 'upcoming',
    emoji: '👉',
    description: 'Batalhas lendárias de Guild vs Guild todos os domingos às 20:00h. Lute pela honra absoluta da sua bandeira e mostre quem manda no servidor.',
    howItWorks: 'Todas as guildas de elite se reúnem semanalmente numa chave de torneio fechada de combates coordenados.',
    rewards: 'A guilda vencedora garante bônus gerais robustos e privilégios de castelo, além do grandioso status de Guilda Soberana da Semana.'
  }
];
