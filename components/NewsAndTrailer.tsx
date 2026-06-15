'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, Play, Check, Youtube, Sparkles, Sliders, ShieldCheck, Gamepad2, Layers, Flame,
  ThumbsUp, Plus, X, Heart, Eye, Video, AlertCircle, Calendar, Trash2, User, Clock, Pencil, Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewsAndTrailerProps {
  onRegisterClick: () => void;
  user?: any;
}

interface PlayerHighlight {
  id: string;
  title: string;
  videoUrl: string;
  youtubeId: string;
  playerName: string;
  guildName?: string;
  likes: number;
  views: number;
  createdAt: string;
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  if (url.trim().length === 11) return url.trim();

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function NewsAndTrailer({ onRegisterClick, user }: NewsAndTrailerProps) {
  const [youtubeInput, setYoutubeInput] = useState('https://www.youtube.com/watch?v=VV9GCBMwbV4');
  const [activeVideoId, setActiveVideoId] = useState('VV9GCBMwbV4');
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);

  // Categorias de Trajes (Novas Abas)
  const [activeCostumeTab, setActiveCostumeTab] = useState<'todos' | 'lendarios' | 'misticos' | 'sazonais'>('todos');

  // Estados das Sessões Principais
  const [serverVideoId, setServerVideoId] = useState('8YQubtW_8uA');
  const [costumesVideoId, setCostumesVideoId] = useState('VV9GCBMwbV4');
  const [tutorialVideoId, setTutorialVideoId] = useState('P_PSTTbyD8w');
  const [activeSession, setActiveSession] = useState<'costumes' | 'server' | 'tutorial'>('costumes');

  const [serverInput, setServerInput] = useState('https://www.youtube.com/watch?v=8YQubtW_8uA');
  const [costumesInput, setCostumesInput] = useState('https://www.youtube.com/watch?v=VV9GCBMwbV4');
  const [tutorialInput, setTutorialInput] = useState('https://www.youtube.com/watch?v=P_PSTTbyD8w');

  const [globalSaveStatus, setGlobalSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [globalSaveMessage, setGlobalSaveMessage] = useState('');

  const [playerHighlights, setPlayerHighlights] = useState<PlayerHighlight[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newGuildName, setNewGuildName] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Controle de Permissão do Administrador
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [showDeveloperLogin, setShowDeveloperLogin] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [devUnlockError, setDevUnlockError] = useState('');

  // Lista OFICIAL com os seus 11 Conjuntos mapeados com IDs limpos do YouTube
  const [costumesPlaylist, setCostumesPlaylist] = useState<any[]>([
    { id: 'VV9GCBMwbV4', title: 'Conjunto Trovão', rarity: 'Épico', category: 'lendarios', description: 'Armadura imbuída com o poder dos raios e tempestades ancestrais.', views: '1.2K' },
    { id: '7dG7ucCaVZs', title: 'Conjunto Samurai', rarity: 'Lendário', category: 'lendarios', description: 'Traje tradicional de honra com detalhes em aço forjado e aura de batalha.', views: '2.5K' },
    { id: 'zX_9M2ggPwk', title: 'Conjunto Joker', rarity: 'Raro', category: 'todos', description: 'Estilo caótico e imprevisível com cores vibrantes e efeito de fumaça.', views: '920' },
    { id: 'VnIgNVPuQ-U', title: 'Conjunto Alma Divina', rarity: 'Imortal', category: 'misticos', description: 'Placas sagradas que emanam luz celestial e runas de proteção divina.', views: '3.1K' },
    { id: 'Wg7QjeL0g0E', title: 'Conjunto Halloween', rarity: 'Sazonal', category: 'sazonais', description: 'Visual aterrorizante com efeitos de abóboras místicas e sombras da noite.', views: '1.8K' },
    { id: 'j1Ds34AKj0E', title: 'Conjunto Talismã', rarity: 'Místico', category: 'misticos', description: 'Proteção oriental coberta por selos espirituais e pergaminhos flutuantes.', views: '1.4K' },
    { id: 'EGzbgicX3ik', title: 'Conjunto Sombrio Hwang', rarity: 'Lendário', category: 'lendarios', description: 'A lendária armadura Hwang banhada pelas trevas profundas do submundo.', views: '4.2K' },
    { id: 'Trfwn1l1zr8', title: 'Conjunto Naga Mage', rarity: 'Épico', category: 'todos', description: 'Vestes costuradas com escamas de criaturas abissais e brilho aquático.', views: '2.0K' },
    { id: '-gR4mSGAmDA', title: 'Conjunto Yin Yang Phantom', rarity: 'Místico', category: 'misticos', description: 'O equilíbrio perfeito entre a luz e a escuridão em constante movimento.', views: '2.9K' },
    { id: 'UA9dPxjuiEE', title: 'Conjunto Doctor Death', rarity: 'Raro', category: 'sazonais', description: 'Visual sombrio inspirado nos médicos da peste, exalando névoa tóxica.', views: '1.1K' },
    { id: '1YskS6D8gz8', title: 'Conjunto Angelical', rarity: 'Lendário', category: 'lendarios', description: 'Asas majestosas e tecidos puros que trazem a paz dos deuses ao portador.', views: '5.0K' }
  ]);

  const [tutorialPlaylist, setTutorialPlaylist] = useState<any[]>([
    { id: 'P_PSTTbyD8w', title: 'Leveling Rápido (1 ao 125)', duration: '4:15 min', author: 'GM_Azkiel', description: 'Melhores mapas de XP, buffs necessários e locais secretos para upar velozmente.' }
  ]);

  const [targetPlaylist, setTargetPlaylist] = useState<'costumes' | 'tutorial' | 'server'>('costumes');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [playlistFormError, setPlaylistFormError] = useState('');
  const [playlistFormSuccess, setPlaylistFormSuccess] = useState('');

  const loadGlobalVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
        const allv = data.videos;
        const serverV = allv.find((v: any) => v.category === 'server');
        const costumesV = allv.filter((v: any) => v.category === 'costumes');
        const tutorialsV = allv.filter((v: any) => v.category === 'tutorial');

        if (serverV) {
          setServerVideoId(serverV.id);
          setServerInput(`https://www.youtube.com/watch?v=${serverV.id}`);
          if (activeSession === 'server') setActiveVideoId(serverV.id);
        }
        if (costumesV.length > 0) {
          setCostumesPlaylist(costumesV.map((v: any) => ({
            id: v.id,
            title: v.title,
            rarity: v.rarity || 'Lendário',
            category: v.subcategory || 'todos',
            description: v.description || 'Sem descrição.',
            views: v.views ? `${v.views} visualizações` : 'Nova customização'
          })));
        }
        if (tutorialsV.length > 0) {
          setTutorialPlaylist(tutorialsV.map((v: any) => ({
            id: v.id,
            title: v.title,
            duration: v.duration || '5:00 min',
            author: v.author || 'GM_Staff',
            description: v.description || 'Sem descrição.'
          })));
        }
      }
    } catch (err) {
      console.error('Error fetching global videos:', err);
    }
  };

  useEffect(() => {
    loadGlobalVideos();
    setIsDeveloper(true); 
  }, [user]);

  const handleSwitchSession = (session: 'server' | 'costumes' | 'tutorial') => {
    setActiveSession(session);
    let targetId = session === 'server' ? serverVideoId : (session === 'costumes' ? costumesVideoId : tutorialVideoId);
    setActiveVideoId(targetId);
  };

  const handleSelectCostume = (costumeId: string) => {
    setCostumesVideoId(costumeId);
    setActiveVideoId(costumeId);
    confetti({ particleCount: 30, spread: 50, colors: ['#FF6A00', '#FFD700'] });
  };

  const handleAddOrSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlaylistFormError('');
    setPlaylistFormSuccess('');

    if (!formTitle.trim() || !formLink.trim()) {
      setPlaylistFormError('Preencha o título e o link do YouTube.');
      return;
    }

    const parsedId = extractYoutubeId(formLink);
    if (!parsedId) {
      setPlaylistFormError('Link inválido do YouTube.');
      return;
    }

    try {
      const subcategoryValue = targetPlaylist === 'costumes' ? activeCostumeTab : undefined;

      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: formLink.trim(),
          title: formTitle.trim(),
          subtitle: formSubtitle.trim() || 'Mostruário',
          description: formDescription.trim(),
          category: targetPlaylist,
          subcategory: subcategoryValue
        })
      });

      const data = await response.json();
      if (data.success) {
        setPlaylistFormSuccess('Vídeo enviado e registrado no PostgreSQL!');
        setFormTitle('');
        setFormLink('');
        setFormDescription('');
        setFormSubtitle('');
        await loadGlobalVideos();
      } else {
        setPlaylistFormError(data.error || 'Erro ao processar requisição.');
      }
    } catch (err: any) {
      setPlaylistFormError('Erro de conexão: ' + err.message);
    }
  };

  const filteredCostumes = costumesPlaylist.filter(c => 
    activeCostumeTab === 'todos' ? true : c.category === activeCostumeTab
  );

  return (
    <section id="noticias" className="relative z-20 py-24 bg-gradient-to-b from-[#080402] to-[#150A04]/90 max-w-7xl mx-auto px-4 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#FF6A00]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER DA SEÇÃO */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative">
        <span className="text-primary font-mono text-xs uppercase tracking-widest inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-3">
          <Tv className="w-3.5 h-3.5 animate-pulse" />
          Apresentação Multimídia Oficial
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl font-black uppercase tracking-wider text-white">
          MOSTRUÁRIO DE <span className="text-primary font-serif">TRAJES IMPERIAIS</span>
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* VIEWPORT PRINCIPAL DO VÍDEO (Esquerda) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="relative group rounded-2xl bg-[#080402] border border-[#FF6A00]/25 overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 bg-[#0e0703] border-b border-white/5 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-mono truncate">youtube.com/embed/{activeVideoId}</span>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-primary/85 bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-bold uppercase">
                <Flame className="w-3 h-3 text-primary animate-pulse" /> HD 1080P
              </div>
            </div>

            <div className="relative group aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?rel=0&showinfo=0&controls=1&modestbranding=1`}
                title="Apresentação"
                className="w-full h-full object-cover"
                allowFullScreen
              />
            </div>

            {/* ABAS DE NAVEGAÇÃO PRINCIPAL */}
            <div className="px-4 py-4 bg-[#0a0502] border-t border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
                <button onClick={() => handleSwitchSession('costumes')} className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-serif font-black text-xs uppercase tracking-wider border ${activeSession === 'costumes' ? 'bg-gradient-to-r from-red-600 to-[#FF6A00] text-white border-[#FF6A00]/50' : 'bg-black/40 text-stone-400 border-white/5'}`}>
                  <Sparkles className="w-4 h-4" /> Apresentação dos Trajes
                </button>
                <button onClick={() => handleSwitchSession('server')} className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-serif font-black text-xs uppercase tracking-wider border ${activeSession === 'server' ? 'bg-gradient-to-r from-red-600 to-[#FF6A00] text-white border-[#FF6A00]/50' : 'bg-black/40 text-stone-400 border-white/5'}`}>
                  <Tv className="w-4 h-4" /> Trailer do Servidor
                </button>
                <button onClick={() => handleSwitchSession('tutorial')} className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-serif font-black text-xs uppercase tracking-wider border ${activeSession === 'tutorial' ? 'bg-gradient-to-r from-red-600 to-[#FF6A00] text-white border-[#FF6A00]/50' : 'bg-black/40 text-stone-400 border-white/5'}`}>
                  <Gamepad2 className="w-4 h-4" /> Tutorial Gameplay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* REPRODUTOR DA PLAYLIST LATERAL COM SUB-ABAS (Direita) */}
        <div className="lg:col-span-4 bg-[#0A0502]/70 border border-white/5 rounded-2xl p-4 flex flex-col justify-between max-h-[500px] overflow-y-auto">
          {activeSession === 'costumes' ? (
            <>
              {/* SUB-ABAS EXTRAS DA SEÇÃO DE TRAJES */}
              <div className="flex flex-wrap gap-1 border-b border-white/5 pb-3 mb-3">
                {(['todos', 'lendarios', 'misticos', 'sazonais'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCostumeTab(tab)}
                    className={`text-[10px] uppercase font-mono px-2 py-1 rounded transition-all ${activeCostumeTab === tab ? 'bg-primary text-black font-bold' : 'bg-white/5 text-stone-400 hover:text-white'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto">
                {filteredCostumes.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCostume(item.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${costumesVideoId === item.id ? 'bg-[#FF6A00]/10 border-[#FF6A00]/40' : 'bg-black/30 border-white/5 hover:border-white/10'}`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-serif font-bold text-white uppercase">{item.title}</h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">{item.rarity}</span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                ))}
              </div>
            </>
          ) : activeSession === 'tutorial' ? (
            <div className="space-y-2 flex-1 overflow-y-auto">
              {tutorialPlaylist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setTutorialVideoId(item.id);
                    setActiveVideoId(item.id);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${tutorialVideoId === item.id ? 'bg-[#FF6A00]/10 border-[#FF6A00]/40' : 'bg-black/30 border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-serif font-bold text-white uppercase">{item.title}</h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">{item.duration}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">{item.description}</p>
                  <span className="text-[10px] text-stone-500 font-mono block mt-1">Autor: {item.author}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-stone-500 text-xs font-mono">
              Exibindo Trailer Único Principal do Servidor.
            </div>
          )}
        </div>
      </div>

      {/* PAINEL ADMINISTRATIVO DO GM DO FANTASY2 AUTOLIBERADO */}
      {isDeveloper && (
        <div id="admin-playlists-cockpit" className="mt-8 bg-[#0E0602]/95 border border-[#FF6A00]/40 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 text-primary text-sm font-serif uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
            <Shield className="w-4 h-4 text-primary animate-pulse" />
            <span>Painel Imperial de Controle do GM — Conectado como {user?.username || 'AdmFantasy'}</span>
          </div>

          <form onSubmit={handleAddOrSaveVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-stone-300 font-mono">Título do Vídeo</label>
              <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs text-white" placeholder="Ex: Conjunto Divino Kaiser" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-stone-300 font-mono">Link Completo do YouTube</label>
              <input type="text" value={formLink} onChange={(e) => setFormLink(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs text-white" placeholder="https://youtu.be/..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs text-stone-300 font-mono">Descrição do Atributo/Efeito visual</label>
              <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs text-white h-20" placeholder="Insira os detalhes do traje que os jogadores verão na lateral..." />
            </div>

            <div className="md:col-span-2 flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <button type="button" onClick={() => setTargetPlaylist('costumes')} className={`px-3 py-1.5 rounded text-xs font-mono border ${targetPlaylist === 'costumes' ? 'bg-primary text-black font-bold border-primary' : 'bg-white/5 text-stone-400 border-transparent'}`}>Trajes</button>
                <button type="button" onClick={() => setTargetPlaylist('tutorial')} className={`px-3 py-1.5 rounded text-xs font-mono border ${targetPlaylist === 'tutorial' ? 'bg-primary text-black font-bold border-primary' : 'bg-white/5 text-stone-400 border-transparent'}`}>Tutoriais</button>
                <button type="button" onClick={() => setTargetPlaylist('server')} className={`px-3 py-1.5 rounded text-xs font-mono border ${targetPlaylist === 'server' ? 'bg-primary text-black font-bold border-primary' : 'bg-white/5 text-stone-400 border-transparent'}`}>Trailer Principal</button>
              </div>
              <button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-serif uppercase text-xs font-bold px-6 py-2.5 rounded-lg hover:brightness-110 transition-all">Salvar no Banco PostgreSQL</button>
            </div>
          </form>

          {playlistFormError && <p className="text-red-500 text-xs mt-3 font-mono">❌ {playlistFormError}</p>}
          {playlistFormSuccess && <p className="text-green-400 text-xs mt-3 font-mono">✨ {playlistFormSuccess}</p>}
        </div>
      )}
    </section>
  );
}