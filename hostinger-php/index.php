<?php
/**
 * Metin2 Fantasy - Secure Portal Landing Page & Web Systems
 * Designed by DevSecOps, CyberSecurity Sênior & Infraestrutura Sênior
 * 
 * Visually Matches the Dark Fantasy Lava Theme with high structural and operational security.
 */

define('SECURE_ACCESS', true);
require_once 'config.php';

// Get CSRF Token safe instance
$csrfToken = getCSRFToken();

// Check if user session is active and check fingerprints against session hijacking
$user = null;
if (isset($_SESSION['user_login'])) {
    if ($_SESSION['user_agent'] === $_SERVER['HTTP_USER_AGENT']) {
        $user = [
            'login' => sanitize($_SESSION['user_login']),
            'email' => sanitize($_SESSION['user_email']),
            'cashBalance' => intval($_SESSION['coins_balance'] ?? 0)
        ];
    } else {
        // Force destruction of compromised sessions
        session_destroy();
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Metin2 Fantasy — Website Oficial MMORPG AAA Premium</title>
    <meta name="description" content="Explore um mundo de fantasia sombria, enfrente dragões ancestrais e conquiste os três reinos. O melhor servidor de Metin2 privado internacional.">
    
    <!-- CSS and Font Pairings matching original Next.js configuration -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        serif: ['Cormorant Garamond', 'serif'],
                        sans: ['Poppins', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    },
                    colors: {
                        primary: '#FF6A00',
                        secondary: '#E87A00',
                        highlight: '#FFD700',
                        lava: '#C92A00',
                        'bg-primary': '#080402',
                        'bg-secondary': '#150A04',
                    }
                }
            }
        }
    </script>
    <style>
        html {
            scroll-behavior: smooth;
        }
        /* Custom lava glass and atmospheric glows */
        .lava-glass {
            background: rgba(21, 10, 4, 0.65);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 106, 0, 0.2);
        }
        .lava-glass-hover:hover {
            border-color: rgba(255, 106, 0, 0.45);
            box-shadow: 0 0 20px rgba(199, 42, 0, 0.25);
        }
        .gold-glow {
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
        }
        .lava-text-glow {
            text-shadow: 0 0 8px rgba(255, 106, 0, 0.6), 0 0 15px rgba(199, 42, 0, 0.4);
        }
        .gold-text-glow {
            text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
        }
        /* Scrollbar styling */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #080402;
        }
        ::-webkit-scrollbar-thumb {
            background: #C92A00;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #FF6A00;
        }
    </style>
</head>
<body class="bg-bg-primary text-white font-sans antialiased selection:bg-primary selection:text-bg-primary">

    <!-- Header Navigation -->
    <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-bg-primary/90 border-b border-primary/20 backdrop-blur-md py-4">
        <div class="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <a href="#inicio" class="flex items-center gap-2 group">
                <!-- Fallback to text + inline SVG block if image path remains local -->
                <div class="flex items-center gap-2">
                    <svg class="w-8 h-8 text-primary drop-shadow-[0_0_10px_#C92A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span class="font-serif text-2xl font-bold tracking-widest text-[#FFD700] uppercase lava-text-glow">METIN2 FANTASY</span>
                </div>
            </a>

            <!-- Nav Links -->
            <nav class="hidden lg:flex items-center gap-6">
                <a href="#inicio" class="font-serif text-sm uppercase tracking-wider text-[#D5CDBC] hover:text-[#FF6A00] transition-colors">Início</a>
                <a href="#noticias" class="font-serif text-sm uppercase tracking-wider text-[#D5CDBC] hover:text-[#FF6A00] transition-colors">Apresentação</a>
                <a href="#classes" class="font-serif text-sm uppercase tracking-wider text-[#D5CDBC] hover:text-[#FF6A00] transition-colors">Classes</a>
                <a href="#rankings" class="font-serif text-sm uppercase tracking-wider text-[#D5CDBC] hover:text-[#FF6A00] transition-colors">Rankings</a>
                <a href="#loja" class="font-serif text-sm uppercase tracking-wider text-[#D5CDBC] hover:text-[#FF6A00] transition-colors">Loja Cash</a>
                <a href="#downloads" class="font-serif text-sm uppercase tracking-wider text-[#D5CDBC] hover:text-[#FF6A00] transition-colors">Downloads</a>
            </nav>

            <!-- User Auth Options -->
            <div class="flex items-center gap-3">
                <?php if ($user): ?>
                    <div class="flex items-center gap-3 bg-bg-secondary border border-primary/20 rounded px-3 py-1.5 text-sm">
                        <span class="text-gray-400">Olá, <strong class="text-highlight"><?php echo $user['login']; ?></strong></span>
                        <div class="h-4 w-px bg-white/10"></div>
                        <span class="text-primary flex items-center gap-1 font-mono font-bold">
                            🏆 <?php echo number_format($user['cashBalance'], 0, ',', '.'); ?> CASH
                        </span>
                        <a href="logout.php" id="logout-btn" class="hover:text-red-500 font-serif uppercase text-xs tracking-wider border-l border-white/10 pl-3">Sair</a>
                    </div>
                <?php else: ?>
                    <button onclick="openModal('login-modal')" class="font-serif text-xs uppercase tracking-widest px-4 py-2 border border-primary/40 hover:border-primary rounded bg-primary/15 transition-all">Entrar</button>
                    <button onclick="openModal('register-modal')" class="font-serif text-xs uppercase tracking-widest px-4 py-2 bg-gradient-to-r from-primary to-lava hover:from-primary hover:to-secondary text-bg-primary font-bold rounded transition-all">Cadastrar</button>
                <?php endif; ?>
            </div>
        </div>
    </header>

    <!-- Hero Showcase Section -->
    <section id="inicio" class="relative py-28 md:py-48 flex flex-col justify-center items-center text-center overflow-hidden min-h-screen bg-cover bg-center" style="background-image: linear-gradient(to bottom, rgba(8,4,2,0.4), #080402), url('https://picsum.photos/seed/fantasy_wallpaper/1920/1080');">
        <!-- Floating Lava Overlay Particle Glow -->
        <div class="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-bg-primary/20 pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg-primary to-transparent"></div>
        
        <div class="relative z-10 max-w-4xl px-4 flex flex-col items-center">
            <!-- Animated Title Badge -->
            <div class="inline-flex items-center gap-2 border border-primary/30 rounded-full px-4 py-1.5 bg-bg-secondary/80 text-primary text-xs uppercase tracking-widest font-mono mb-6 shadow-md shadow-primary/10">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Servidor Oficial Aberto — Versão AAA Premium
            </div>

            <!-- Display Logo text -->
            <h1 class="font-serif text-5xl md:text-8xl font-black tracking-tight leading-none uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF0] via-[#FFD700] to-[#E87A00] drop-shadow-[0_4px_15px_rgba(255,106,0,0.45)]">
                FANTASY2
            </h1>
            <h2 class="font-serif text-xl md:text-3xl text-[#FFF6E5] uppercase tracking-widest mt-2 tracking-[0.25em] font-medium lava-text-glow">
                O Império do Dragão Ancestral
            </h2>
            <p class="text-[#D3C7B3] text-sm md:text-lg max-w-2xl mt-6 font-light leading-relaxed">
                Pegue a sua espada de guerreiro, domine magias lendárias e dispute territórios em épicas batalhas de reinos contra Shinsoo, Chunjo e Jinno. O verdadeiro MMORPG clássico reinventado.
            </p>

            <!-- CTA Actions -->
            <div class="flex flex-col sm:flex-row gap-4 mt-10 w-full justify-center">
                <a href="#downloads" class="px-8 py-4 bg-gradient-to-r from-primary to-lava hover:opacity-95 text-bg-primary font-bold font-serif uppercase tracking-widest text-sm rounded shadow-lg shadow-lava/40 transition-all transform hover:-translate-y-0.5 text-center">
                    Baixar Game Client
                </a>
                <button onclick="openModal('register-modal')" class="px-8 py-4 border border-primary text-white bg-bg-secondary/60 hover:bg-bg-secondary font-bold font-serif uppercase tracking-widest text-sm rounded transition-all transform hover:-translate-y-0.5">
                    Quero Criar Conta
                </button>
            </div>
            
            <!-- Quick Features -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full text-center">
                <div class="p-4 lava-glass rounded border border-white/5">
                    <span class="text-xs text-primary font-mono uppercase tracking-wider block">XP Rate</span>
                    <strong class="font-serif text-2xl text-highlight block mt-1">400x (Custom)</strong>
                </div>
                <div class="p-4 lava-glass rounded border border-white/5">
                    <span class="text-xs text-primary font-mono uppercase tracking-wider block">Drop de Gold</span>
                    <strong class="font-serif text-2xl text-highlight block mt-1">250x (Balanceado)</strong>
                </div>
                <div class="p-4 lava-glass rounded border border-white/5">
                    <span class="text-xs text-primary font-mono uppercase tracking-wider block">Nível Máximo</span>
                    <strong class="font-serif text-2xl text-highlight block mt-1">120 (Sombrio)</strong>
                </div>
                <div class="p-4 lava-glass rounded border border-white/5">
                    <span class="text-xs text-primary font-mono uppercase tracking-wider block">Status do Servidor</span>
                    <strong class="font-serif text-2xl text-emerald-400 block mt-1 animate-pulse">Online ●</strong>
                </div>
            </div>
        </div>
    </section>

    <!-- News and Video Showcase -->
    <section id="noticias" class="py-16 max-w-7xl mx-auto px-4">
        <h2 class="font-serif text-3xl md:text-5xl border-l-4 border-primary pl-4 uppercase tracking-widest text-highlight mb-10">Apresentação & Notícias</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- News Column -->
            <div class="lg:col-span-2 space-y-6">
                <!-- News item 1 -->
                <div class="p-6 lava-glass rounded-lg border border-primary/10 hover:border-primary/30 transition-all flex flex-col md:flex-row gap-6">
                    <div class="w-full md:w-32 h-32 rounded bg-cover bg-center shrink-0" style="background-image: url('https://picsum.photos/seed/news1/300/300');"></div>
                    <div class="flex-1 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <span class="px-2 py-0.5 bg-primary/25 border border-primary/40 text-[10px] text-primary uppercase font-mono rounded">Atualização</span>
                                <span class="text-xs text-[#8E8373] font-mono">13 Junho, 2026</span>
                            </div>
                            <h3 class="font-serif text-xl font-bold text-[#F3EFE9] hover:text-primary transition-colors">Patch Note 1.2.4: O Despertar da Fortaleza de Lava</h3>
                            <p class="text-[#A29787] text-sm mt-2 line-clamp-2">Novas armas de nível 110 estendidas, novos monstros ancestrais e masморras de lava com taxa de drop 2x ativas durante o final de semana.</p>
                        </div>
                        <a href="#" class="text-xs text-primary font-semibold hover:underline mt-4 tracking-wider uppercase font-serif">Ler matéria completa →</a>
                    </div>
                </div>

                <!-- News item 2 -->
                <div class="p-6 lava-glass rounded-lg border border-primary/10 hover:border-primary/30 transition-all flex flex-col md:flex-row gap-6">
                    <div class="w-full md:w-32 h-32 rounded bg-cover bg-center shrink-0" style="background-image: url('https://picsum.photos/seed/news2/300/300');"></div>
                    <div class="flex-1 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <span class="px-2 py-0.5 bg-red-950/45 border border-red-500/40 text-[10px] text-red-400 uppercase font-mono rounded">Manutenção</span>
                                <span class="text-xs text-[#8E8373] font-mono">11 Junho, 2026</span>
                            </div>
                            <h3 class="font-serif text-xl font-bold text-[#F3EFE9] hover:text-primary transition-colors">Manutenção Geral de Estabilização e Anti-DDoS</h3>
                            <p class="text-[#A29787] text-sm mt-2 line-clamp-2">Otimizamos o link de rede de nossa infraestrutura na Hostinger para mitigar ataques cibernéticos e diminuir a latência média de jogo na América Latina.</p>
                        </div>
                        <a href="#" class="text-xs text-primary font-semibold hover:underline mt-4 tracking-wider uppercase font-serif">Ler matéria completa →</a>
                    </div>
                </div>
            </div>

            <!-- Video Side Widget -->
            <div class="p-6 bg-bg-secondary border border-white/5 rounded-lg flex flex-col justify-between">
                <div>
                    <h3 class="font-serif text-lg text-[#FFD700] uppercase tracking-wide border-b border-white/5 pb-3">Trailer Oficial</h3>
                    <div class="relative aspect-video rounded overflow-hidden mt-4 bg-black border border-primary/20 bg-cover bg-center" style="background-image: url('https://picsum.photos/seed/video-banner/640/360');">
                        <!-- Play Button Icon Overlay -->
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/20 transition-all">
                            <span class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-bg-primary pl-1 font-bold">▶</span>
                        </div>
                    </div>
                    <p class="text-xs text-[#8E8373] leading-relaxed mt-4">
                        Assista à demonstração cinematográfica do Metin2 Fantasy. Veja as animações de habilidades especiais refinadas e a fúria das guerras de reinos.
                    </p>
                </div>
                
                <div class="border-t border-white/5 pt-4 mt-6">
                    <span class="text-xs text-primary font-mono block">Quer apoiar o servidor?</span>
                    <p class="text-xs text-[#A29787] mt-1">Crie canais com gameplays do Fantasy2 no YouTube ou TikTok, cadastre o link no painel e solicite recompensas exclusivas em CASH!</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Character Classes Showcase -->
    <section id="classes" class="py-16 bg-bg-secondary/45 border-y border-white/5">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="font-serif text-3xl md:text-5xl text-center uppercase tracking-widest text-highlight mb-4">Escolha Seu Destino</h2>
            <p class="text-stone-400 text-center text-sm max-w-lg mx-auto mb-12">Cada guerreiro de Metin2 possui habilidades marciais únicas. Domine seu guerreiro favorito e lidere seu reino até a vitória.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <!-- Guerreiro -->
                <div class="p-6 lava-glass rounded-lg border border-[#FF6A00]/15 hover:border-[#FF6A00]/30 transition-all flex flex-col items-center text-center group">
                    <div class="w-20 h-20 rounded-full bg-cover bg-center mb-4 border border-primary/30" style="background-image: url('https://picsum.photos/seed/warrior/150/150');"></div>
                    <h3 class="font-serif text-2xl text-highlight font-bold group-hover:lava-text-glow transition-all">Guerreiro</h3>
                    <p class="text-xs font-mono text-primary uppercase tracking-widest mt-1">Armaduras e Espadas</p>
                    <p class="text-stone-400 text-xs mt-3 leading-relaxed">Excelente defesa corporal ou ataque devastador na especialidade do tipo mental/corporal. Ideais para lutas brutais de curto alcance.</p>
                </div>

                <!-- Ninja -->
                <div class="p-6 lava-glass rounded-lg border border-[#FF6A00]/15 hover:border-[#FF6A00]/30 transition-all flex flex-col items-center text-center group">
                    <div class="w-20 h-20 rounded-full bg-cover bg-center mb-4 border border-primary/30" style="background-image: url('https://picsum.photos/seed/ninja/150/150');"></div>
                    <h3 class="font-serif text-2xl text-highlight font-bold group-hover:lava-text-glow transition-all">Ninja</h3>
                    <p class="text-xs font-mono text-primary uppercase tracking-widest mt-1">Adagas e Arcos</p>
                    <p class="text-stone-400 text-xs mt-3 leading-relaxed">Mestres assassinos furtivos ou arqueiros letais à distância. Capazes de envenenar inimigos e aplicar golpes ágeis inesperados.</p>
                </div>

                <!-- Sura -->
                <div class="p-6 lava-glass rounded-lg border border-[#FF6A00]/15 hover:border-[#FF6A00]/30 transition-all flex flex-col items-center text-center group">
                    <div class="w-20 h-20 rounded-full bg-cover bg-center mb-4 border border-primary/30" style="background-image: url('https://picsum.photos/seed/sura/150/150');"></div>
                    <h3 class="font-serif text-2xl text-highlight font-bold group-hover:lava-text-glow transition-all">Sura</h3>
                    <p class="text-xs font-mono text-primary uppercase tracking-widest mt-1">Magia Negra e Lâminas</p>
                    <p class="text-stone-400 text-xs mt-3 leading-relaxed">Guerreiros amaldiçoados que usam forças ancestrais. Podem se basear em magias destrutivas ou em fortalecimento de suas espadas.</p>
                </div>

                <!-- Xama -->
                <div class="p-6 lava-glass rounded-lg border border-[#FF6A00]/15 hover:border-[#FF6A00]/30 transition-all flex flex-col items-center text-center group">
                    <div class="w-20 h-20 rounded-full bg-cover bg-center mb-4 border border-primary/30" style="background-image: url('https://picsum.photos/seed/shaman/150/150');"></div>
                    <h3 class="font-serif text-2xl text-highlight font-bold group-hover:lava-text-glow transition-all">Xamã</h3>
                    <p class="text-xs font-mono text-primary uppercase tracking-widest mt-1">Sinos, Leques e Cura</p>
                    <p class="text-stone-400 text-xs mt-3 leading-relaxed">Sábios budistas que canalizam poderes da natureza para abençoar aliados, curar ferimentos graves ou atacar com chuvas de relâmpagos.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Rankings System Section -->
    <section id="rankings" class="py-16 max-w-7xl mx-auto px-4">
        <h2 class="font-serif text-3xl md:text-5xl text-center uppercase tracking-widest text-[#FFD700] mb-3">Hall da Fama</h2>
        <p class="text-[#A29787] text-center text-sm max-w-lg mx-auto mb-12">Os maiores campeões que esculpiram seus nomes no sangue de Metin2 Fantasy.</p>

        <!-- Dynamic Tabs -->
        <div class="flex justify-center border-b border-white/5 max-w-md mx-auto mb-8">
            <button onclick="loadRankingsTab('players')" id="tab-btn-players" class="w-1/2 pb-3 font-serif uppercase tracking-wider text-sm border-b-2 border-primary text-primary transition-all">Guerreiros</button>
            <button onclick="loadRankingsTab('guilds')" id="tab-btn-guilds" class="w-1/2 pb-3 font-serif uppercase tracking-wider text-sm border-b-2 border-transparent text-[#8E8373] hover:text-white transition-all">Guildas</button>
        </div>

        <div class="max-w-4xl mx-auto p-4 lava-glass rounded-lg border border-[#FF6A00]/15 overflow-hidden">
            <table class="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                    <tr class="border-b border-white/5 uppercase text-[#8E8373] tracking-wider font-mono">
                        <th class="py-3 px-4 w-16 text-center">Posição</th>
                        <th class="py-3 px-4" id="table-head-name">Nome do Guerreiro</th>
                        <th class="py-3 px-4" id="table-head-detail">Classe / Especialidade</th>
                        <th class="py-3 px-4 text-center">Nível</th>
                        <th class="py-3 px-4 text-center" id="table-head-stat">Play Time (h)</th>
                    </tr>
                </thead>
                <tbody id="rankings-table-body" class="divide-y divide-white/5 font-mono">
                    <!-- Loaded dynamically via AJAX -->
                    <tr class="animate-pulse">
                        <td colspan="5" class="py-8 text-center text-gray-500">Buscando Hall da Fama no servidor de jogos...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <!-- Dashboard Portal (Logged-in Active cabinet) -->
    <?php if ($user): ?>
    <section id="dashboard" class="py-16 bg-[#120602] border-y border-primary/20">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex items-center gap-2 mb-8">
                <span class="text-primary text-xl">🛡️</span>
                <h2 class="font-serif text-3xl text-highlight uppercase tracking-wider font-bold">Painel de Controle de Conta</h2>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- User Profile & Stats -->
                <div class="p-6 bg-bg-primary border border-white/5 rounded-lg flex flex-col justify-between">
                    <div>
                        <h3 class="font-serif text-xl border-b border-white/5 pb-3 font-bold uppercase text-white tracking-wider">Selecione Seu Guerreiro</h3>
                        
                        <div class="space-y-3 mt-4">
                            <div class="flex items-center justify-between p-3 bg-bg-secondary rounded border border-white/5 hover:border-primary/20 cursor-pointer">
                                <div class="flex items-center gap-3">
                                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                                    <span class="text-sm font-semibold">MagmaSlayer</span>
                                </div>
                                <span class="text-xs text-primary font-bold">Lvl 120 (Guerreiro)</span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-bg-secondary rounded border border-white/5 hover:border-primary/20 cursor-pointer">
                                <div class="flex items-center gap-3">
                                    <span class="w-2.5 h-2.5 rounded-full bg-gray-500"></span>
                                    <span class="text-sm font-semibold">ShinobiShadow</span>
                                </div>
                                <span class="text-xs text-primary font-bold">Lvl 119 (Ninja)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-t border-white/5 pt-4 mt-6 space-y-2">
                        <div class="flex justify-between text-xs text-[#A29787]">
                            <span>ID da Conta:</span>
                            <span class="font-mono text-[#F3EFE9]"><?php echo $user['login']; ?></span>
                        </div>
                        <div class="flex justify-between text-xs text-[#A29787]">
                            <span>E-mail Vinculado:</span>
                            <span class="font-mono text-[#F3EFE9]"><?php echo $user['email']; ?></span>
                        </div>
                        <div class="flex justify-between text-xs text-[#A29787]">
                            <span>Status da Conta:</span>
                            <span class="font-mono text-emerald-400">Ativa ●</span>
                        </div>
                    </div>
                </div>

                <!-- Voucher Redeem Module -->
                <div class="p-6 bg-bg-primary border border-white/5 rounded-lg flex flex-col justify-between">
                    <div>
                        <h3 class="font-serif text-xl border-b border-white/5 pb-3 font-bold uppercase text-white tracking-wider">Resgatar Cupom</h3>
                        <p class="text-stone-400 text-xs mt-3 leading-relaxed">Informe os cupons promocionais divulgados nas redes oficiais do Metin2 Fantasy para adquirir moedas de CASH gratuitas!</p>
                        
                        <form id="voucher-form" onsubmit="submitForm(event, 'voucher')" class="mt-4">
                            <input type="hidden" name="csrf_token" value="<?php echo $csrfToken; ?>">
                            <div class="flex gap-2">
                                <input type="text" name="code" placeholder="EX: FANTASYNEW (Pegue 5k)" class="bg-[#080402] border border-white/10 rounded px-3 py-2 w-full text-xs font-mono uppercase text-[#F3EFE9] focus:outline-none focus:border-primary/45" required>
                                <button type="submit" class="px-4 py-2 bg-primary font-serif uppercase tracking-wider text-xs text-bg-primary font-bold rounded hover:opacity-95 shrink-0">Ativar</button>
                            </div>
                        </form>
                        
                        <div id="voucher-result" class="text-xs p-3 rounded mt-4 hidden"></div>
                    </div>
                    
                    <div class="border-t border-white/5 pt-4 mt-6 text-xs text-stone-500 italic">
                        * Códigos válidos: FANTASYNEW, MAGMABOSS, SORTE50, GMGIFT.
                    </div>
                </div>

                <!-- Cash Store Simulator Widget -->
                <div class="p-6 bg-bg-primary border border-white/5 rounded-lg flex flex-col justify-between">
                    <div>
                        <h3 class="font-serif text-xl border-b border-white/5 pb-3 font-bold uppercase text-white tracking-wider">Apoiar Servidor (Pix)</h3>
                        <p class="text-stone-400 text-xs mt-3 leading-relaxed">Adquira moedas de CASH para gastar no Item Show do jogo e melhore o visual do seu guerreiro de forma instantânea.</p>
                        
                        <div class="grid grid-cols-2 gap-2 mt-4">
                            <button onclick="simulateDonate(5000, 5.00)" class="p-2 bg-bg-secondary border border-primary/20 rounded hover:border-primary text-left font-mono">
                                <span class="text-xs block text-gray-400">5.000 CASH</span>
                                <strong class="text-sm text-highlight">R$ 5,00</strong>
                            </button>
                            <button onclick="simulateDonate(20000, 20.00)" class="p-2 bg-bg-secondary border border-primary/20 rounded hover:border-primary text-left font-mono">
                                <span class="text-xs block text-gray-400">20.000 CASH</span>
                                <strong class="text-sm text-highlight">R$ 20,00</strong>
                            </button>
                        </div>
                    </div>
                    
                    <div id="payment-notification" class="hidden p-3 mt-4 rounded text-xs"></div>
                </div>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <!-- Cash Package Store Section -->
    <section id="loja" class="py-16 max-w-7xl mx-auto px-4">
        <h2 class="font-serif text-3xl md:text-5xl text-center uppercase tracking-widest text-highlight mb-3">Item Shop & Cash Store</h2>
        <p class="text-[#A29787] text-center text-sm max-w-lg mx-auto mb-12">Adquira pacotes de CASH para expandir seus itens virtuais. Processamento com segurança SSL garantido.</p>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <!-- Pkg 1 -->
            <div class="p-6 lava-glass rounded-lg border border-primary/10 flex flex-col justify-between items-center text-center">
                <span class="text-lg">🪙</span>
                <h3 class="font-serif text-xl font-bold mt-2">Pacote Escudeiro</h3>
                <span class="font-mono text-xl text-primary font-semibold mt-1">5.000 CASH</span>
                <div class="text-highlight font-mono font-bold mt-4">R$ 5,00</div>
                <button onclick="openDonateCheckout(5000, 5.00)" class="w-full mt-6 py-2 bg-bg-secondary border border-primary/25 hover:border-primary/50 text-xs font-serif uppercase tracking-wider font-bold rounded">Adquirir</button>
            </div>
            <!-- Pkg 2 -->
            <div class="p-6 lava-glass rounded-lg border border-primary/10 flex flex-col justify-between items-center text-center">
                <span class="text-lg">⚔️</span>
                <h3 class="font-serif text-xl font-bold mt-2">Pacote Guerreiro</h3>
                <span class="font-mono text-xl text-primary font-semibold mt-1">10.000 CASH</span>
                <div class="text-highlight font-mono font-bold mt-4">R$ 10,00</div>
                <button onclick="openDonateCheckout(10000, 10.00)" class="w-full mt-6 py-2 bg-bg-secondary border border-primary/25 hover:border-primary/50 text-xs font-serif uppercase tracking-wider font-bold rounded">Adquirir</button>
            </div>
            <!-- Pkg 3 -->
            <div class="p-6 lava-glass rounded-lg border border-primary/10 flex flex-col justify-between items-center text-center">
                <span class="text-lg">🔥</span>
                <h3 class="font-serif text-xl font-bold mt-2">Pacote Cavaleiro</h3>
                <span class="font-mono text-xl text-primary font-semibold mt-1">20.000 CASH</span>
                <div class="text-highlight font-mono font-bold mt-4">R$ 20,00</div>
                <button onclick="openDonateCheckout(20000, 20.00)" class="w-full mt-6 py-2 bg-bg-secondary border border-primary/25 hover:border-primary/50 text-xs font-serif uppercase tracking-wider font-bold rounded">Adquirir</button>
            </div>
            <!-- Pkg 4 -->
            <div class="p-6 bg-gradient-to-b from-primary/10 to-lava/10 rounded-lg border border-primary/40 flex flex-col justify-between items-center text-center relative">
                <div class="absolute -top-3 px-3 py-0.5 bg-primary text-bg-primary text-[9px] font-mono font-black uppercase tracking-widest rounded-full">Melhor Oferta</div>
                <span class="text-lg mt-2">👑</span>
                <h3 class="font-serif text-xl font-bold mt-2 text-highlight">Pacote Lendário</h3>
                <span class="font-mono text-xl text-primary font-semibold mt-1">50.000 CASH</span>
                <div class="text-highlight font-mono font-bold mt-4">R$ 50,00</div>
                <button onclick="openDonateCheckout(50000, 50.00)" class="w-full mt-6 py-2 bg-gradient-to-r from-primary to-lava text-bg-primary text-xs font-serif uppercase tracking-wider font-bold rounded">Adquirir</button>
            </div>
            <!-- Pkg 5 -->
            <div class="p-6 lava-glass rounded-lg border border-primary/10 flex flex-col justify-between items-center text-center">
                <span class="text-lg">🐉</span>
                <h3 class="font-serif text-xl font-bold mt-2">Dádiva do Dragão</h3>
                <span class="font-mono text-xl text-primary font-semibold mt-1">100.000 CASH</span>
                <div class="text-highlight font-mono font-bold mt-4">R$ 100,00</div>
                <button onclick="openDonateCheckout(100000, 100.00)" class="w-full mt-6 py-2 bg-bg-secondary border border-primary/25 hover:border-primary/50 text-xs font-serif uppercase tracking-wider font-bold rounded">Adquirir</button>
            </div>
        </div>
    </section>

    <!-- Downloads Area Area -->
    <section id="downloads" class="py-16 bg-bg-secondary/30 border-t border-white/5">
        <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-12 items-center">
            <div class="flex-1">
                <span class="text-primary font-mono text-xs uppercase tracking-wider block">Área de Downloads</span>
                <h2 class="font-serif text-3xl md:text-5xl text-highlight uppercase tracking-wider mt-1 mb-6">Instalar Metin2 Fantasy</h2>
                <p class="text-stone-400 text-sm leading-relaxed mb-6">Oferecemos mirrors rápidos e atualizados diariamente com o patcher do jogo. Faça o download, extraia em uma nova pasta e execute o patcher oficial para começar sua jornada.</p>
                
                <div class="flex flex-col sm:flex-row gap-4">
                    <a href="#" class="px-6 py-3 bg-red-600 hover:bg-red-700 font-serif uppercase tracking-widest text-xs font-bold text-white rounded text-center">MEGA Mirror</a>
                    <a href="#" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 font-serif uppercase tracking-widest text-xs font-bold text-white rounded text-center">Google Drive</a>
                    <a href="#" class="px-6 py-3 bg-[#E87A00] hover:bg-primary font-serif uppercase tracking-widest text-xs font-bold text-white rounded text-center">MediaFire Mirror</a>
                </div>
            </div>
            
            <div class="w-full md:w-96 p-6 lava-glass rounded-lg border border-white/5 text-xs font-mono">
                <h3 class="font-serif text-sm text-[#FFD700] uppercase tracking-wide border-b border-white/5 pb-3 font-bold mb-4">Requisitos Mínimos do Sistema</h3>
                <ul class="space-y-2 text-[#A29787]">
                    <li><strong class="text-white">SO:</strong> Windows 10/11</li>
                    <li><strong class="text-white">Processador:</strong> Intel i3 ou Ryzen 3</li>
                    <li><strong class="text-white">Memória:</strong> 4 GB RAM</li>
                    <li><strong class="text-white">Placa de Vídeo:</strong> Intel HD Graphics ou superior</li>
                    <li><strong class="text-white">DirectX:</strong> Versão 9.0c</li>
                    <li><strong class="text-white">Armazenamento:</strong> 6 GB de espaço livre</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Footer Security Information -->
    <footer class="py-12 bg-bg-primary border-t border-primary/20 text-center text-xs text-stone-500">
        <div class="max-w-7xl mx-auto px-4 flex flex-col gap-4">
            <p><strong>Metin2 Fantasy MMORPG</strong> © 2026. Todos os direitos reservados. Servidor privado internacional.</p>
            <div class="flex justify-center gap-6">
                <a href="#inicio" class="hover:text-primary">Termos de Uso</a>
                <span class="text-white/10">|</span>
                <a href="#inicio" class="hover:text-primary">Diretrizes de Privacidade</a>
                <span class="text-white/10">|</span>
                <a href="#inicio" class="hover:text-primary">Status de Serviço</a>
            </div>
            <div class="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-stone-600">
                <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                DevSecOps Approved Infrastructure. Protegido com Criptografia de Ponta a Ponta.
            </div>
        </div>
    </footer>

    <!-- MODAL POPUPS FOR LOGIN / REGISTER -->
    
    <!-- Login Modal -->
    <div id="login-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center hidden p-4">
        <div class="w-full max-w-sm lava-glass border border-primary/30 p-8 rounded-lg relative">
            <button onclick="closeModal('login-modal')" class="absolute top-4 right-4 text-gray-400 hover:text-white font-mono text-xl">X</button>
            <h2 class="font-serif text-2xl text-[#FFD700] uppercase tracking-widest mb-1 text-center font-bold">Portal de Acesso</h2>
            <p class="text-[11px] text-gray-400 text-center mb-6">Autentique sua conta para entrar no Reino Fantasy</p>
            
            <form id="login-form" onsubmit="submitForm(event, 'login')">
                <input type="hidden" name="csrf_token" value="<?php echo $csrfToken; ?>">
                <div class="space-y-4">
                    <div>
                        <label class="block text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Nome de Usuário</label>
                        <input type="text" name="username" class="w-full bg-[#080402] border border-white/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-primary" placeholder="Insira o seu login" required>
                    </div>
                    <div>
                        <label class="block text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Senha Secreta</label>
                        <input type="password" name="password" class="w-full bg-[#080402] border border-white/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-primary" placeholder="******" required>
                    </div>
                    <button type="submit" class="w-full py-3 bg-gradient-to-r from-primary to-lava text-bg-primary font-bold font-serif uppercase tracking-widest text-xs rounded hover:opacity-95 transition-opacity mt-4">Iniciar Login</button>
                </div>
            </form>
            <div id="login-feedback" class="mt-4 text-xs text-center hidden p-2 rounded"></div>
        </div>
    </div>

    <!-- Register Modal -->
    <div id="register-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center hidden p-4">
        <div class="w-full max-w-md lava-glass border border-primary/30 p-8 rounded-lg relative">
            <button onclick="closeModal('register-modal')" class="absolute top-4 right-4 text-gray-400 hover:text-white font-mono text-xl">X</button>
            <h2 class="font-serif text-2xl text-[#FFD700] uppercase tracking-widest mb-1 text-center font-bold">Criar Nova Conta</h2>
            <p class="text-[11px] text-gray-400 text-center mb-6">Registre seu guerreiro com integridade e segurança criptográfica</p>
            
            <form id="register-form" onsubmit="submitForm(event, 'register')">
                <input type="hidden" name="csrf_token" value="<?php echo $csrfToken; ?>">
                <div class="space-y-4">
                    <div>
                        <label class="block text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Usuário de Jogo (Login)</label>
                        <input type="text" name="username" class="w-full bg-[#080402] border border-white/10 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary" placeholder="Apenas letras e números (4-20 chars)" required>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Nova Senha</label>
                            <input type="password" name="password" class="w-full bg-[#080402] border border-white/10 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary" placeholder="Min. 6 caracteres" required>
                        </div>
                        <div>
                            <label class="block text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Confirmar Senha</label>
                            <input type="password" name="password_confirm" class="w-full bg-[#080402] border border-white/10 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary" placeholder="Repita a senha" required>
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Endereço de E-mail</label>
                        <input type="email" name="email" class="w-full bg-[#080402] border border-white/10 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary" placeholder="Ex: guerreiro@fantasy2.com" required>
                    </div>
                    <div>
                        <label class="block text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Código de Exclusão de Personagem (7 dígitos)</label>
                        <input type="text" name="social_id" maxlength="7" pattern="\d{7}" class="w-full bg-[#080402] border border-white/10 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-primary" placeholder="Ex: 5782910" required>
                        <span class="text-[9px] text-[#A29787] mt-1 block">Necessário para apagar personagens criados no jogo. Memorize-o!</span>
                    </div>
                    
                    <button type="submit" class="w-full py-2.5 bg-gradient-to-r from-primary to-lava text-bg-primary font-bold font-serif uppercase tracking-widest text-xs rounded hover:opacity-95 transition-opacity mt-4">Criar Minha Conta</button>
                </div>
            </form>
            <div id="register-feedback" class="mt-4 text-xs text-center hidden p-2 rounded"></div>
        </div>
    </div>

    <!-- Scripts and Interactions Engine -->
    <script>
        // Modal functions
        function openModal(modalId) {
            document.getElementById(modalId).classList.remove('hidden');
        }
        function closeModal(modalId) {
            document.getElementById(modalId).classList.add('hidden');
        }
        
        // Tab switching rankings
        function loadRankingsTab(tabName) {
            const playersBtn = document.getElementById('tab-btn-players');
            const guildsBtn = document.getElementById('tab-btn-guilds');
            
            if (tabName === 'guilds') {
                guildsBtn.className = "w-1/2 pb-3 font-serif uppercase tracking-wider text-sm border-b-2 border-primary text-primary transition-all";
                playersBtn.className = "w-1/2 pb-3 font-serif uppercase tracking-wider text-sm border-b-2 border-transparent text-[#8E8373] hover:text-white transition-all";
            } else {
                playersBtn.className = "w-1/2 pb-3 font-serif uppercase tracking-wider text-sm border-b-2 border-primary text-primary transition-all";
                guildsBtn.className = "w-1/2 pb-3 font-serif uppercase tracking-wider text-sm border-b-2 border-transparent text-[#8E8373] hover:text-white transition-all";
            }
            
            fetchRankings(tabName);
        }

        // Fetch Rankings AJAX
        function fetchRankings(type = 'players') {
            const tableBody = document.getElementById('rankings-table-body');
            const detailHead = document.getElementById('table-head-detail');
            const statHead = document.getElementById('table-head-stat');
            const nameHead = document.getElementById('table-head-name');
            
            if (type === 'guilds') {
                nameHead.innerText = "Nome da Guilda";
                detailHead.innerText = "Nível da Guilda";
                statHead.innerText = "Vitórias / Derrotas";
            } else {
                nameHead.innerText = "Guerreiro";
                detailHead.innerText = "Classe / Especialidade";
                statHead.innerText = "Play Time (h)";
            }

            fetch('rankings.php?type=' + type)
                .then(response => response.json())
                .then(res => {
                    if (res.success && res.data.length > 0) {
                        let html = '';
                        res.data.forEach(item => {
                            if (type === 'guilds') {
                                html += `<tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td class="py-3 px-4 text-center font-bold text-primary">${item.rank}</td>
                                    <td class="py-3 px-4 text-white font-serif">${item.name}</td>
                                    <td class="py-3 px-4 text-emerald-400">Nível ${item.level}</td>
                                    <td class="py-3 px-4 text-center text-highlight font-bold">${item.points} PTS</td>
                                    <td class="py-3 px-4 text-center text-gray-400">${item.wins}V / ${item.losses}D</td>
                                </tr>`;
                            } else {
                                html += `<tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td class="py-3 px-4 text-center font-bold text-primary">${item.rank}</td>
                                    <td class="py-3 px-4 text-white font-serif">${item.name}</td>
                                    <td class="py-3 px-4 text-stone-400">${item.class} ${item.guild !== 'Nenhuma' ? `<strong class="text-xs text-primary">[${item.guild}]</strong>` : ''}</td>
                                    <td class="py-3 px-4 text-center text-highlight font-bold">${item.level}</td>
                                    <td class="py-3 px-4 text-center text-gray-400">${item.playtime}h</td>
                                </tr>`;
                            }
                        });
                        tableBody.innerHTML = html;
                    } else {
                        tableBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-gray-500">Nenhum registro encontrado no ranking.</td></tr>`;
                    }
                })
                .catch(() => {
                    tableBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-red-500">Erro ao carregar dados dos servidores.</td></tr>`;
                });
        }

        // Action Form Submit
        function submitForm(event, actionType) {
            event.preventDefault();
            
            let form, url, feedbackId;
            if (actionType === 'login') {
                form = document.getElementById('login-form');
                url = 'login.php';
                feedbackId = 'login-feedback';
            } else if (actionType === 'register') {
                form = document.getElementById('register-form');
                url = 'register.php';
                feedbackId = 'register-feedback';
            } else if (actionType === 'voucher') {
                form = document.getElementById('voucher-form');
                url = 'redeem.php';
                feedbackId = 'voucher-result';
            }

            const feedback = document.getElementById(feedbackId);
            feedback.classList.remove('hidden', 'bg-red-950/50', 'text-red-400', 'bg-emerald-950/50', 'text-emerald-400');
            feedback.classList.add('block', 'bg-gray-850/50', 'text-gray-400');
            feedback.innerText = 'Processando transação com segurança...';

            const formData = new FormData(form);
            
            fetch(url, {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                feedback.classList.remove('bg-gray-850/50', 'text-gray-400');
                if (data.success) {
                    feedback.classList.add('bg-emerald-950/50', 'text-emerald-400');
                    feedback.innerText = data.message;
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    feedback.classList.add('bg-red-950/50', 'text-red-400');
                    feedback.innerText = data.message;
                }
            })
            .catch(() => {
                feedback.className = "mt-4 text-xs text-center p-2 rounded bg-red-950/50 text-red-400";
                feedback.innerText = 'Ocorreu um erro ao comunicar com os servidores de jogo.';
            });
        }

        // Simulated actions triggers
        function openDonateCheckout(cashAmount, price) {
            <?php if (!$user): ?>
                openModal('login-modal');
            <?php else: ?>
                alert(`Para efetuar compras reais de CASH, envie um Pix de R$ ${price.toFixed(2)} para chave pix@metin2fantasy2.com informando seu login [<?php echo $user['login']; ?>] na descrição. Os créditos caem de forma instantânea em sua conta.`);
            <?php endif; ?>
        }

        function simulateDonate(cashAmount, price) {
            const notif = document.getElementById('payment-notification');
            notif.classList.remove('hidden', 'bg-red-950/50', 'text-red-400', 'bg-emerald-950/50', 'text-emerald-450');
            notif.className = "p-3 mt-4 rounded text-xs bg-orange-950/50 text-orange-400 block animate-pulse";
            notif.innerText = `Processando pagamento Pix de R$ ${price.toFixed(2)}...`;
            
            setTimeout(() => {
                const formData = new FormData();
                formData.append('csrf_token', '<?php echo $csrfToken; ?>');
                formData.append('code', 'FANTASYNEW'); // Just triggering a secure update balance simulation directly
                
                fetch('redeem.php', {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .then(data => {
                    notif.className = "p-3 mt-4 rounded text-xs bg-emerald-950/50 text-emerald-400 block";
                    notif.innerHTML = `<strong>Apoio Confirmado!</strong> Foram adicionados +${cashAmount.toLocaleString()} CASH ao seu guerreiro. Obrigado por nos apoiar!`;
                    setTimeout(() => {
                        window.location.reload();
                    }, 2500);
                })
                .catch(() => {
                    notif.className = "p-3 mt-4 rounded text-xs bg-red-950/50 text-red-400 block";
                    notif.innerText = 'Erro na transação de pagamento fictícia.';
                });
            }, 1800);
        }

        // On document load, fetch players rank
        document.addEventListener('DOMContentLoaded', () => {
            fetchRankings('players');
        });
    </script>
</body>
</html>
