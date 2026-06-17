'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, Play, Check, Youtube, Sparkles, Sliders, ShieldCheck, Gamepad2, Layers, Flame,
  ThumbsUp, Plus, X, Heart, Eye, Video, AlertCircle, Calendar, Trash2, User, Clock, Pencil
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

// Deep, secure YouTube URL parsing helper
function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  // Handle direct embedding IDs of length 11
  if (url.trim().length === 11) return url.trim();

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function NewsAndTrailer({ onRegisterClick, user }: NewsAndTrailerProps) {
  // Default high-quality epic MMORPG style cinematic trailer link
  const [youtubeInput, setYoutubeInput] = useState('https://www.youtube.com/watch?v=8YQubtW_8uA');
  const [activeVideoId, setActiveVideoId] = useState('8YQubtW_8uA');
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  // New Presentation Tabs States
  const [serverVideoId, setServerVideoId] = useState('8YQubtW_8uA');
  const [costumesVideoId, setCostumesVideoId] = useState('xR7bshf6E5M');
  const [tutorialVideoId, setTutorialVideoId] = useState('P_PSTTbyD8w');
  const [activeSession, setActiveSession] = useState<'server' | 'costumes' | 'tutorial'>('server');

  // Input states for administrative video config deck
  const [serverInput, setServerInput] = useState('https://www.youtube.com/watch?v=8YQubtW_8uA');
  const [costumesInput, setCostumesInput] = useState('https://www.youtube.com/watch?v=xR7bshf6E5M');
  const [tutorialInput, setTutorialInput] = useState('https://www.youtube.com/watch?v=P_PSTTbyD8w');

  const [globalSaveStatus, setGlobalSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [globalSaveMessage, setGlobalSaveMessage] = useState('');

  // Player highlights states
  const [playerHighlights, setPlayerHighlights] = useState<PlayerHighlight[]>([]);
  const [activeHighlightVideo, setActiveHighlightVideo] = useState<PlayerHighlight | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newGuildName, setNewGuildName] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Developer Mode States for configuration box restriction
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [showDeveloperLogin, setShowDeveloperLogin] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [devUnlockError, setDevUnlockError] = useState('');

  const loadGlobalVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (data.success && Array.isArray(data.videos)) {
        const allv = data.videos;
        const serverV = allv.find((v: any) => v.category === 'server');
        const costumesV = allv.filter((v: any) => v.category === 'costumes');
        const tutorialsV = allv.filter((v: any) => v.category === 'tutorial');

        if (serverV) {
          setServerVideoId(serverV.id);
          setServerInput(`https://www.youtube.com/watch?v=${serverV.id}`);
          if (activeSession === 'server' || !activeVideoId) {
            setActiveVideoId(serverV.id);
            setYoutubeInput(`https://www.youtube.com/watch?v=${serverV.id}`);
          }
        }

        if (costumesV.length > 0) {
          setCostumesPlaylist(costumesV.map((v: any) => ({
            id: v.id,
            title: v.title,
            rarity: v.rarity || 'Lendário',
            category: v.subtitle || 'Mostruário',
            description: v.description || 'Sem descrição adicional.',
            views: `${v.views || '0'} visualizações`
          })));
          if (activeSession === 'costumes' && costumesV.some((item: any) => item.id === costumesVideoId)) {
            // keep current active
          } else if (activeSession === 'costumes') {
            setCostumesVideoId(costumesV[0].id);
            setActiveVideoId(costumesV[0].id);
          }
        }

        if (tutorialsV.length > 0) {
          setTutorialPlaylist(tutorialsV.map((v: any) => ({
            id: v.id,
            title: v.title,
            duration: v.duration || '5:00 min',
            author: v.author || 'GM_Staff',
            description: v.description || 'Sem descrição adicional.'
          })));
          if (activeSession === 'tutorial' && tutorialsV.some((item: any) => item.id === tutorialVideoId)) {
            // keep current active
          } else if (activeSession === 'tutorial') {
            setTutorialVideoId(tutorialsV[0].id);
            setActiveVideoId(tutorialsV[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching global videos:', err);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('fantasy2_player_highlights');
    if (saved) {
      try {
        setPlayerHighlights(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      const initial: PlayerHighlight[] = [
        {
          id: 'hl-1',
          title: 'Guerra de Guilds Lendária Shinsoo x Jinno (50v50)',
          videoUrl: 'https://www.youtube.com/watch?v=8YQubtW_8uA',
          youtubeId: '8YQubtW_8uA',
          playerName: 'GuerreiroMístico',
          guildName: 'HordaDragao',
          likes: 124,
          views: 1840,
          createdAt: '08 Jun 2026'
        },
        {
          id: 'hl-2',
          title: 'Ninja Adagas - Tutorial de Combo Rápido PvP',
          videoUrl: 'https://www.youtube.com/watch?v=xR7bshf6E5M',
          youtubeId: 'xR7bshf6E5M',
          playerName: 'SombraFurtiva',
          guildName: 'OrdemSombria',
          likes: 89,
          views: 1105,
          createdAt: '07 Jun 2026'
        },
        {
          id: 'hl-3',
          title: 'Drop Solo de Boss: Recorde de Dano no Sura Selado',
          videoUrl: 'https://www.youtube.com/watch?v=P_PSTTbyD8w',
          youtubeId: 'P_PSTTbyD8w',
          playerName: 'SuraBrutal',
          guildName: 'FuriaSombria',
          likes: 156,
          views: 2402,
          createdAt: '06 Jun 2026'
        }
      ];
      setPlayerHighlights(initial);
    }

    // Load custom session videos from localStorage initially
    const savedServer = localStorage.getItem('fantasy2_video_server') || '8YQubtW_8uA';
    const savedCostumes = localStorage.getItem('fantasy2_video_costumes') || 'xR7bshf6E5M';
    const savedTutorial = localStorage.getItem('fantasy2_video_tutorial') || 'P_PSTTbyD8w';
    setServerVideoId(savedServer);
    setCostumesVideoId(savedCostumes);
    setTutorialVideoId(savedTutorial);
    setActiveVideoId(savedServer);
    setYoutubeInput(`https://www.youtube.com/watch?v=${savedServer}`);
    setServerInput(`https://www.youtube.com/watch?v=${savedServer}`);
    setCostumesInput(`https://www.youtube.com/watch?v=${savedCostumes}`);
    setTutorialInput(`https://www.youtube.com/watch?v=${savedTutorial}`);

    loadGlobalVideos();

    // Developer status is disabled: no GM/admin controls are active
    const checkDevStatus = () => {
      setIsDeveloper(false);
      setShowDeveloperLogin(false);
    };
    checkDevStatus();

    return () => {};
  }, [user]);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = playerHighlights.map(hl => {
      if (hl.id === id) {
        return { ...hl, likes: hl.likes + 1 };
      }
      return hl;
    });
    setPlayerHighlights(updated);
    localStorage.setItem('fantasy2_player_highlights', JSON.stringify(updated));
    
    confetti({
      particleCount: 25,
      spread: 50,
      colors: ['#FF6A00', '#FFD700', '#FFFFFF']
    });
  };

  const handleDeleteHighlight = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir o destaque?')) {
      const updated = playerHighlights.filter(hl => hl.id !== id);
      setPlayerHighlights(updated);
      localStorage.setItem('fantasy2_player_highlights', JSON.stringify(updated));
    }
  };

  const handleSubmitHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!newTitle.trim()) {
      setSubmitError('Por favor, informe o título do seu destaque.');
      return;
    }
    if (!newPlayerName.trim()) {
      setSubmitError('Por favor, informe o seu nome de jogador.');
      return;
    }
    if (!newUrl.trim()) {
      setSubmitError('Por favor, insira o link do YouTube.');
      return;
    }

    const parsedId = extractYoutubeId(newUrl);
    if (!parsedId) {
      setSubmitError('Link ou ID do YouTube inválido.');
      return;
    }

    const newHighlight: PlayerHighlight = {
      id: `hl-custom-${Date.now()}`,
      title: newTitle.trim(),
      videoUrl: newUrl.trim(),
      youtubeId: parsedId,
      playerName: newPlayerName.trim(),
      guildName: newGuildName.trim() || undefined,
      likes: 0,
      views: 7,
      createdAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const updated = [newHighlight, ...playerHighlights];
    setPlayerHighlights(updated);
    localStorage.setItem('fantasy2_player_highlights', JSON.stringify(updated));

    // Reset form and close
    setNewTitle('');
    setNewUrl('');
    setNewPlayerName('');
    setNewGuildName('');
    setShowSubmitForm(false);

    confetti({
      particleCount: 80,
      spread: 70,
      colors: ['#FF6A00', '#FFD700', '#FFFFFF']
    });
  };

  // Persistent stateful playlists initialized with defaults
  const [costumesPlaylist, setCostumesPlaylist] = useState<any[]>([
    {
      id: 'xR7bshf6E5M',
      title: 'Armadura Imperial Golden Kaiser',
      rarity: 'Lendário',
      category: 'Guerreiro & Sura',
      description: 'Placas de batalha banhadas à ouro com runas de fogo vivo e aura imperial.',
      views: '12.4K visualizações'
    },
    {
      id: 'P_PSTTbyD8w',
      title: 'Manto do Assassino Sombrio',
      rarity: 'Épico',
      category: 'Classe Ninja Elite',
      description: 'Tecido furtivo de linho sombrio com fumaça roxa emanada das ombreiras.',
      views: '8.1K visualizações'
    }
  ]);

  const [tutorialPlaylist, setTutorialPlaylist] = useState<any[]>([
    {
      id: 'P_PSTTbyD8w',
      title: 'Leveling Rápido (1 ao 125)',
      duration: '4:15 min',
      author: 'GM_Azkiel',
      description: 'Melhores mapas de XP, buffs necessários e locais secretos para upar velozmente.'
    }
  ]);

  // GM administrative form variables for posting / editing
  const [targetPlaylist, setTargetPlaylist] = useState<'costumes' | 'tutorial' | 'server'>('costumes');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemType, setEditingItemType] = useState<'costumes' | 'tutorial' | 'server' | null>(null);

  const [playlistFormError, setPlaylistFormError] = useState('');
  const [playlistFormSuccess, setPlaylistFormSuccess] = useState('');

  // Editing and Deletion routines
  const handleStartEditing = (type: 'costumes' | 'tutorial' | 'server', item: any) => {
    setEditingItemType(type);
    setEditingItemId(item.id);
    setTargetPlaylist(type);
    setFormTitle(item.title);
    setFormSubtitle(type === 'costumes' ? item.rarity : (type === 'tutorial' ? item.duration : ''));
    setFormLink(`https://www.youtube.com/watch?v=${item.id}`);
    setFormDescription(item.description || '');
    setPlaylistFormError('');
    setPlaylistFormSuccess('');

    // Smooth scroll to the Admin control panel header
    const cmdConsole = document.getElementById('admin-playlists-cockpit');
    if (cmdConsole) {
      cmdConsole.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEditing = () => {
    setEditingItemType(null);
    setEditingItemId(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormLink('');
    setFormDescription('');
    setPlaylistFormError('');
    setPlaylistFormSuccess('');
  };

  const handleDeletePlaylistItem = async (type: 'costumes' | 'tutorial' | 'server', itemId: string) => {
    if (confirm('Tem certeza que deseja excluir esse vídeo da playlist imperial perpetuamente?')) {
      try {
        const response = await fetch(`/api/videos/${itemId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          await loadGlobalVideos();
          confetti({
            particleCount: 30,
            spread: 45,
            colors: ['#FF1100', '#FF7700']
          });
        } else {
          alert('Erro ao excluir: ' + data.error);
        }
      } catch (err: any) {
        alert('Erro ao conectar com servidor: ' + err.message);
      }
    }
  };

  const handleAddOrSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlaylistFormError('');
    setPlaylistFormSuccess('');

    if (!formTitle.trim()) {
      setPlaylistFormError('Por favor, informe o título do vídeo.');
      return;
    }
    if (!formLink.trim()) {
      setPlaylistFormError('Por favor, insira o link ou ID do YouTube.');
      return;
    }

    const parsedId = extractYoutubeId(formLink);
    if (!parsedId) {
      setPlaylistFormError('Endereço ou ID do YouTube inválido. Ex: P_PSTTbyD8w ou URL completa.');
      return;
    }

    try {
      if (editingItemId) {
        // Edit video details using PUT
        const response = await fetch(`/api/videos/${editingItemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl: formLink.trim(),
            title: formTitle.trim(),
            subtitle: targetPlaylist === 'costumes' ? 'Mostruário' : formSubtitle.trim() || 'GM_Staff',
            description: formDescription.trim(),
            category: targetPlaylist,
            duration: targetPlaylist === 'tutorial' ? formSubtitle.trim() || '5:00 min' : null,
            rarity: targetPlaylist === 'costumes' ? formSubtitle.trim() || 'Lendário' : null
          })
        });

        const data = await response.json();
        if (data.success) {
          setPlaylistFormSuccess('Vídeo atualizado com sucesso no PostgreSQL!');
          handleCancelEditing();
          await loadGlobalVideos();
        } else {
          setPlaylistFormError(data.error || 'Erro ao atualizar o vídeo.');
        }
      } else {
        // Create new video using POST
        const response = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl: formLink.trim(),
            title: formTitle.trim(),
            subtitle: targetPlaylist === 'costumes' ? 'Mostruário' : formSubtitle.trim() || 'GM_Staff',
            description: formDescription.trim(),
            category: targetPlaylist,
            duration: targetPlaylist === 'tutorial' ? formSubtitle.trim() || '5:00 min' : null,
            rarity: targetPlaylist === 'costumes' ? formSubtitle.trim() || 'Lendário' : null
          })
        });

        const data = await response.json();
        if (data.success) {
          setPlaylistFormSuccess('Novo vídeo imperial publicado com sucesso no PostgreSQL!');
          setFormTitle('');
          setFormSubtitle('');
          setFormLink('');
          setFormDescription('');
          await loadGlobalVideos();
        } else {
          setPlaylistFormError(data.error || 'Erro ao publicar novo vídeo.');
        }
      }
    } catch (err: any) {
      setPlaylistFormError('Erro ao comunicar com o servidor: ' + err.message);
    }

    confetti({
      particleCount: 100,
      spread: 60,
      colors: ['#FF6A00', '#FFD700', '#FFFFFF']
    });
  };

  const handleSwitchSession = (session: 'server' | 'costumes' | 'tutorial') => {
    setActiveSession(session);
    let targetId = '';
    if (session === 'server') {
      targetId = serverVideoId;
    } else if (session === 'costumes') {
      // Load the costumesVideoId or default to the first costume in playlist
      targetId = costumesVideoId || costumesPlaylist[0].id;
    } else {
      targetId = tutorialVideoId || tutorialPlaylist[0].id;
    }
    setActiveVideoId(targetId);
    setYoutubeInput(`https://www.youtube.com/watch?v=${targetId}`);
  };

  const handleSelectCostume = (costumeId: string) => {
    setCostumesVideoId(costumeId);
    localStorage.setItem('fantasy2_video_costumes', costumeId);
    setActiveVideoId(costumeId);
    setYoutubeInput(`https://www.youtube.com/watch?v=${costumeId}`);
    
    // Spark stars confetti effect
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#FF6A00', '#FFD700', '#FFFFFF']
    });
  };

  const handleSelectTutorial = (tutId: string) => {
    setTutorialVideoId(tutId);
    localStorage.setItem('fantasy2_video_tutorial', tutId);
    setActiveVideoId(tutId);
    setYoutubeInput(`https://www.youtube.com/watch?v=${tutId}`);

    // Confetti representation
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.7 },
      colors: ['#FF5500', '#00FFCC']
    });
  };

  // Real-time feedback and validation as user types
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setYoutubeInput(value);
    
    const parsedId = extractYoutubeId(value);
    if (parsedId) {
      setActiveVideoId(parsedId);
      setIsUrlValid(true);

      // Save for the active session slot
      if (activeSession === 'server') {
        setServerVideoId(parsedId);
        localStorage.setItem('fantasy2_video_server', parsedId);
      } else if (activeSession === 'costumes') {
        setCostumesVideoId(parsedId);
        localStorage.setItem('fantasy2_video_costumes', parsedId);
      } else if (activeSession === 'tutorial') {
        setTutorialVideoId(parsedId);
        localStorage.setItem('fantasy2_video_tutorial', parsedId);
      }
    } else {
      setIsUrlValid(false);
    }
  };

  const handleSaveVideosGlobally = async () => {
    setGlobalSaveStatus('saving');
    setGlobalSaveMessage('');
    try {
      const parsedServer = extractYoutubeId(serverInput);
      const parsedCostumes = extractYoutubeId(costumesInput);
      const parsedTutorial = extractYoutubeId(tutorialInput);

      if (!parsedServer || !parsedCostumes || !parsedTutorial) {
        setGlobalSaveStatus('error');
        setGlobalSaveMessage('Por favor, certifique-se de que os três endereços de vídeo do YouTube são válidos!');
        return;
      }

      // Sync local states
      setServerVideoId(parsedServer);
      setCostumesVideoId(parsedCostumes);
      setTutorialVideoId(parsedTutorial);

      localStorage.setItem('fantasy2_video_server', parsedServer);
      localStorage.setItem('fantasy2_video_costumes', parsedCostumes);
      localStorage.setItem('fantasy2_video_tutorial', parsedTutorial);

      const credential = devPassword || (user?.isGM ? 'admin' : '');
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverVideoId: parsedServer,
          costumesVideoId: parsedCostumes,
          tutorialVideoId: parsedTutorial,
          devPassword: credential || 'admin'
        })
      });
      const data = await response.json();
      if (data.success) {
        setGlobalSaveStatus('success');
        setGlobalSaveMessage('Configurações salvas e propagadas com sucesso para todos os jogadores!');
        confetti({
          particleCount: 120,
          spread: 70,
          colors: ['#FF6A00', '#FFD700', '#FFFFFF']
        });
        setTimeout(() => setGlobalSaveStatus('idle'), 5500);
      } else {
        setGlobalSaveStatus('error');
        setGlobalSaveMessage(data.error || 'Erro ao salvar configurações no servidor.');
      }
    } catch (err: any) {
      setGlobalSaveStatus('error');
      setGlobalSaveMessage('Erro de conexão no reino: ' + err.message);
    }
  };

  const handleServerInputChange = (val: string) => {
    setServerInput(val);
    const parsed = extractYoutubeId(val);
    if (parsed) {
      setServerVideoId(parsed);
      if (activeSession === 'server') {
        setActiveVideoId(parsed);
      }
    }
  };

  const handleCostumesInputChange = (val: string) => {
    setCostumesInput(val);
    const parsed = extractYoutubeId(val);
    if (parsed) {
      setCostumesVideoId(parsed);
      if (activeSession === 'costumes') {
        setActiveVideoId(parsed);
      }
    }
  };

  const handleTutorialInputChange = (val: string) => {
    setTutorialInput(val);
    const parsed = extractYoutubeId(val);
    if (parsed) {
      setTutorialVideoId(parsed);
      if (activeSession === 'tutorial') {
        setActiveVideoId(parsed);
      }
    }
  };

  const chapters = [
    { 
      title: 'Cinemática de Abertura', 
      time: '0:00', 
      description: 'Testemunhe a aurora da era de fogo e as cinzas da criação.',
      isActive: activeChapter === 0
    },
    { 
      title: 'Gameplays e Combates', 
      time: '1:12', 
      description: 'Confrontos dinámicos PvP e mecânicas de esquiva avançadas.',
      isActive: activeChapter === 1
    },
    { 
      title: 'Bosses & Raids Cooperativas', 
      time: '2:45', 
      description: 'Explore masmorras perigosas com táticas exclusivas de guilda.',
      isActive: activeChapter === 2
    },
    { 
      title: 'Sistemas do Reino Brasileiro', 
      time: '4:10', 
      description: 'Taxas balanceadas, suporte VIP nacional e latência zero.',
      isActive: activeChapter === 3
    }
  ];

  return (
    <section id="noticias" className="relative z-20 py-24 bg-gradient-to-b from-[#080402] to-[#150A04]/90 max-w-7xl mx-auto px-4 overflow-hidden">
      
      {/* Volcanic ambiance glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#FF6A00]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative">
        <span className="text-primary font-mono text-xs uppercase tracking-widest inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-3">
          <Tv className="w-3.5 h-3.5 animate-pulse" />
          Apresentação Multimídia Oficial
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl font-black uppercase tracking-wider text-white">
          VÍDEO DE <span className="text-primary font-serif">APRESENTAÇÃO</span>
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent mx-auto mt-4" />
        <p className="text-[#BCAD9E] text-sm sm:text-base mt-4 leading-relaxed font-sans">
          Veja em tempo real a jogabilidade, sistemas e gráficos do maior Servidor Privado Brasileiro de MMORPG. Altere o link para explorar qualquer showcase do YouTube!
        </p>
      </div>

      {/* COMPONENT CONTENT BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* PREMIUM CINEMA CONTROLLABLE SCREEN PANEL (Cols 1-8) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          
          {/* THE SCREEN BODY */}
          <div className="relative group rounded-2xl bg-[#080402] border border-[#FF6A00]/25 overflow-hidden shadow-2xl shadow-primary/5 hover:border-primary/55 transition-all duration-300">
            
            {/* Top Bar Decoration simulating real player */}
            <div className="px-5 py-3.5 bg-[#0e0703] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-xs text-stone-500 font-mono ml-2 truncate max-w-xs md:max-w-md">
                  youtube.com/embed/{activeVideoId}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-primary/85 bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-bold uppercase">
                <Flame className="w-3 h-3 text-primary animate-pulse" />
                HD 1080P
              </div>
            </div>

            {/* Widescreen 16:9 aspect iframe viewport */}
            <div className="relative aspect-video w-full">
              {activeVideoId ? (
                <iframe
                  id="server-presentation-player"
                  src={`https://www.youtube.com/embed/${activeVideoId}?rel=0&showinfo=0&controls=1&modestbranding=1&autoplay=0`}
                  title="Vídeo de Apresentação Oficial do Servidor"
                  className="w-full h-full object-cover"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-stone-950/95 text-center">
                  <Play className="w-16 h-16 text-stone-700 animate-pulse mb-3" />
                  <p className="text-stone-400 font-serif text-lg uppercase">Nenhum vídeo carregado</p>
                  <p className="text-stone-600 text-xs font-sans mt-1">Cole um link do YouTube abaixo para carregar a apresentação do servidor.</p>
                </div>
              )}
            </div>

            {/* SECTIONS NAVIGATION BAR (Sessões de vídeo correspondentes) */}
            <div className="px-4 py-4 bg-[#0a0502] border-t border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => handleSwitchSession('server')}
                  className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-serif font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                    activeSession === 'server'
                      ? 'bg-gradient-to-r from-red-600 to-[#FF6A00] text-white border-[#FF6A00]/50 shadow-lg shadow-primary/20 scale-[1.02]'
                      : 'bg-black/40 text-stone-400 hover:text-white border-white/5 hover:bg-white/5'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  Apresentação do Servidor
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchSession('costumes')}
                  className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-serif font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                    activeSession === 'costumes'
                      ? 'bg-gradient-to-r from-red-600 to-[#FF6A00] text-white border-[#FF6A00]/50 shadow-lg shadow-primary/20 scale-[1.02]'
                      : 'bg-black/40 text-stone-400 hover:text-white border-white/5 hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Apresentação dos Trajes
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchSession('tutorial')}
                  className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-serif font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                    activeSession === 'tutorial'
                      ? 'bg-gradient-to-r from-red-600 to-[#FF6A00] text-white border-[#FF6A00]/50 shadow-lg shadow-primary/20 scale-[1.02]'
                      : 'bg-black/40 text-stone-400 hover:text-white border-white/5 hover:bg-white/5'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  Tutorial Gameplay
                </button>
              </div>
            </div>

            {/* Simulated Live Video Control Toggles Footer */}
            <div className="px-6 py-4 bg-[#0e0703] border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
              <span 
                className="flex items-center gap-2 select-none cursor-pointer hover:text-stone-200 transition-colors"
                onDoubleClick={() => setShowDeveloperLogin(prev => !prev)}
                title="Área do Desenvolvedor (Duplo clique para gerenciar)"
              >
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <b className="text-stone-200">Apresentação Ativa:</b> {activeSession === 'server' ? 'Apresentação do Servidor' : activeSession === 'costumes' ? 'Apresentação dos Trajes' : 'Tutorial Gameplay'}
              </span>
              <button
                onClick={onRegisterClick}
                className="font-serif uppercase tracking-widest text-primary text-xs hover:text-white transition-all font-bold group flex items-center gap-1.5 cursor-pointer leading-none"
              >
                Registrar Agora no Reino <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC YOUTUBE CONFIGURATION CONTROLS */}
          {(isDeveloper || showDeveloperLogin) && (
            <div id="admin-playlists-cockpit" className="mt-6 bg-[#0E0602]/85 border border-[#FF6A00]/25 shadow-2 transition-all p-6 rounded-2xl relative overflow-hidden">
              {/* Background glowing orb */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#FF6A00]/10 rounded-full blur-2xl pointer-events-none" />

              {!isDeveloper ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-stone-300 text-xs font-serif uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-[#FF6A00]" />
                    <span>Configuração Restrita ao Game Master</span>
                  </div>
                  <p className="text-[11px] text-[#BCAD9E]">
                    A alteração do vídeo oficial de apresentação e gerenciamento de playlists é restrito aos administradores. Forneça o código console do GM para liberar.
                  </p>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (devPassword.trim() === 'admin' || devPassword.trim() === 'dev123' || devPassword.trim() === 'f2dev') {
                        setIsDeveloper(true);
                        localStorage.setItem('fantasy2_is_developer', 'true');
                        setDevUnlockError('');
                      } else {
                        setDevUnlockError('Código de console incorreto! Tente "admin" ou "f2dev"');
                      }
                    }}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <div className="relative flex-1">
                      <input
                        type="password"
                        placeholder="Código GM / Desenvolvedor..."
                        value={devPassword}
                        onChange={(e) => setDevPassword(e.target.value)}
                        className="w-full bg-[#080402] text-xs text-white placeholder-stone-700 rounded-lg px-3 py-2.5 border border-white/10 focus:border-[#FF5500]/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-[#FF6A00] hover:brightness-110 text-white font-serif font-black text-xs uppercase tracking-wide transition-all shadow-md cursor-pointer"
                    >
                      Liberar
                    </button>
                  </form>
                  {devUnlockError && (
                    <p className="text-[10px] text-red-500 font-bold">{devUnlockError}</p>
                  )}
                  <span className="text-[9px] font-mono text-stone-600 block">Dica para homologação do Reino: use <code className="text-primary font-bold">admin</code></span>
                </div>
              ) : (
                <form onSubmit={handleAddOrSaveVideo} className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-serif text-[#FF6A00] uppercase tracking-widest font-black">
                        {editingItemType ? '🔨 Editando Vídeo do Reino' : '📣 Console de Transmissão Imperial (GM Ativo)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingItemType && (
                        <button 
                          type="button"
                          onClick={handleCancelEditing}
                          className="text-[10px] font-mono uppercase bg-stone-950/45 hover:bg-stone-900 border border-white/10 px-2.5 py-1 rounded text-stone-400 font-bold hover:text-white transition-all cursor-pointer"
                        >
                          Cancelar Edição
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={() => {
                          setIsDeveloper(false);
                          setShowDeveloperLogin(false);
                          localStorage.removeItem('fantasy2_is_developer');
                          setDevPassword('');
                        }}
                        className="text-[10px] font-mono uppercase bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 px-2.5 py-1 rounded text-red-400 font-bold hover:text-white transition-all cursor-pointer"
                      >
                        Bloquear Painel GM
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#BCAD9E] font-sans leading-relaxed">
                    {editingItemType 
                      ? 'Corrija as informações ou link do vídeo selecionado abaixo. Salve para propagar as alterações instantaneamente na playlist ativa.' 
                      : 'Publique novos vídeos preenchendo as informações abaixo. Os novos vídeos serão adicionados no topo das playlists selecionadas e estarão prontos para reprodução.'}
                  </p>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-bold">
                        Título do Vídeo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Ex: Trailer Oficial de Customização"
                        className="w-full bg-[#080402] text-xs text-white placeholder-stone-700 rounded-lg px-3 py-2 text-left border border-white/10 focus:border-[#FF5500]/50 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Subtitle / Rarity / Duration */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-bold">
                        Subtítulo / Duração / Raridade
                      </label>
                      <input
                        type="text"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        placeholder="Ex: Lendário, Épico, ou 4:15 min"
                        className="w-full bg-[#080402] text-xs text-white placeholder-stone-700 rounded-lg px-3 py-2 text-left border border-white/10 focus:border-[#FF5500]/50 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Link */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-bold font-mono">
                        Link de Vídeo do YouTube (ou ID de 11 caracteres) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formLink}
                        onChange={(e) => setFormLink(e.target.value)}
                        placeholder="Ex: https://www.youtube.com/watch?v=8YQubtW_8uA"
                        className="w-full bg-[#080402] text-xs text-white placeholder-stone-700 rounded-lg px-3 py-2 text-left border border-white/10 focus:border-[#FF5500]/50 focus:outline-none transition-all font-mono"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-bold">
                        Descrição Curta do Vídeo
                      </label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Escreva um breve resumo do vídeo para exibir na playlist..."
                        rows={2}
                        className="w-full bg-[#080402] text-xs text-white placeholder-stone-700 rounded-lg px-3 py-2 text-left border border-white/10 focus:border-[#FF5500]/50 focus:outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Playlist Selection Target */}
                    {!editingItemType && (
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-bold mb-1">
                          Playlist de Destino
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() => setTargetPlaylist('costumes')}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-serif font-black uppercase tracking-wider transition-all duration-250 cursor-pointer ${
                              targetPlaylist === 'costumes'
                                ? 'bg-gradient-to-r from-red-600 to-[#FF6A00] text-white border-[#FF6A00]'
                                : 'bg-black/30 text-stone-400 border-white/5 hover:border-white/10 hover:bg-white/5'
                            }`}
                          >
                            🎭 Playlist de Trajes Raros
                          </button>
                          <button
                            type="button"
                            onClick={() => setTargetPlaylist('tutorial')}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-serif font-black uppercase tracking-wider transition-all duration-250 cursor-pointer ${
                              targetPlaylist === 'tutorial'
                                ? 'bg-gradient-to-r from-red-600 to-[#FF6A00] text-white border-[#FF6A00]'
                                : 'bg-black/30 text-stone-400 border-white/5 hover:border-white/10 hover:bg-white/5'
                            }`}
                          >
                            📖 Playlist de Tutoriais
                          </button>
                          <button
                            type="button"
                            onClick={() => setTargetPlaylist('server')}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-serif font-black uppercase tracking-wider transition-all duration-250 cursor-pointer ${
                              targetPlaylist === 'server'
                                ? 'bg-gradient-to-r from-red-600 to-[#FF6A00] text-white border-[#FF6A00]'
                                : 'bg-black/30 text-stone-400 border-white/5 hover:border-white/10 hover:bg-white/5'
                            }`}
                          >
                            🎬 Vídeo Principal do Banner
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feedback Status messages */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 mt-3">
                    <div className="text-left flex-1">
                      {playlistFormSuccess && (
                        <div className="text-xs text-emerald-400 font-sans font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                          {playlistFormSuccess}
                        </div>
                      )}
                      {playlistFormError && (
                        <div className="text-xs text-red-500 font-sans font-bold flex items-center gap-1.5">
                          <span>⚠️</span>
                          {playlistFormError}
                        </div>
                      )}
                      {!playlistFormSuccess && !playlistFormError && (
                        <div className="text-[10px] text-stone-500 font-mono">
                          {editingItemType 
                            ? `Editando item ID: ${editingItemId}` 
                            : `O vídeo será postado no topo de: ${targetPlaylist === 'costumes' ? 'Trajes Raros' : targetPlaylist === 'tutorial' ? 'Tutoriais Gameplay' : 'Banner de Apresentação'}`}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6A00] via-[#FF8800] to-[#FFD700] hover:brightness-110 active:scale-95 text-black font-extrabold text-xs uppercase tracking-widest transition-all shadow-lg select-none whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
                      id="btn-save-videos-server"
                    >
                      <Plus className="w-4 h-4 text-black font-bold stroke-[3px]" />
                      {editingItemType ? 'Salvar Edição' : 'Postar na Playlist'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* SIDEBAR TIMELINE FEATURE CAPITLES (Cols 9-12) */}
        <div id="video-info-sidebar" className="lg:col-span-4 bg-[#0E0602]/85 border border-[#FF6A00]/15 p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-6">
            {activeSession === 'costumes' ? (
              <>
                <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  Playlist de Trajes Raros
                </h3>
                
                <p className="text-xs text-[#BCAD9E] font-sans leading-relaxed">
                  Toque em um dos trajes exclusivos abaixo para testar as texturas e efeitos visuais no player de alta resolução:
                </p>

                <div className="space-y-3">
                  {costumesPlaylist.map((costume) => {
                    const isActive = activeVideoId === costume.id;
                    return (
                      <div 
                        key={costume.id}
                        onClick={() => handleSelectCostume(costume.id)}
                        className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer select-none text-left relative overflow-hidden group ${
                          isActive 
                            ? 'bg-gradient-to-br from-[#2E1505] to-[#150A04]/40 border-primary/60 text-white shadow-lg shadow-primary/10' 
                            : 'bg-black/20 border-white/5 hover:border-[#FF5500]/20 hover:bg-[#150D06]/40 text-stone-400'
                        }`}
                        id={`costume-playlist-item-${costume.id}`}
                      >
                        {isActive && (
                          <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-red-600 to-[#FF6A00]" />
                        )}

                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[12px] font-serif font-black uppercase tracking-wide flex items-center gap-1.5 ${isActive ? 'text-primary' : 'text-stone-200 group-hover:text-primary transition-colors'}`}>
                            {costume.title}
                          </span>
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <span className={`font-mono text-[9px] px-2 py-0.5 rounded border font-semibold ${
                              costume.rarity === 'Lendário' 
                                ? 'text-yellow-400 border-yellow-500/20 bg-yellow-950/20'
                                : costume.rarity === 'Mítico'
                                ? 'text-red-400 border-red-500/20 bg-red-950/20'
                                : costume.rarity === 'Divino'
                                ? 'text-teal-400 border-teal-500/20 bg-teal-950/20'
                                : 'text-purple-400 border-purple-500/20 bg-purple-950/20'
                            }`}>
                              {costume.rarity}
                            </span>
                            {isDeveloper && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEditing('costumes', costume);
                                  }}
                                  className="p-1 rounded bg-stone-900 border border-white/10 hover:border-amber-400 hover:text-amber-400 transition-all text-stone-400 cursor-pointer"
                                  title="Editar informações do vídeo"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePlaylistItem('costumes', costume.id);
                                  }}
                                  className="p-1 rounded bg-stone-900 border border-white/10 hover:border-red-500 hover:text-red-500 transition-all text-stone-400 cursor-pointer"
                                  title="Remover vídeo da playlist"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-stone-500">
                          <span className="text-[#A29485] font-bold">{costume.category}</span>
                          <span>•</span>
                          <span>{costume.views}</span>
                        </div>

                        <p className="text-[11px] font-sans text-[#BCAD9E]/80 leading-relaxed">
                          {costume.description}
                        </p>

                        {isActive && (
                          <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-[#FF6A00] font-mono uppercase tracking-widest font-black animate-pulse">
                            <Play className="w-2.5 h-2.5 fill-[#FF6A00]" />
                            Reproduzindo Demonstração
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : activeSession === 'tutorial' ? (
              <>
                <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                  <Gamepad2 className="w-4 h-4 text-primary animate-pulse" />
                  Playlist de Tutoriais
                </h3>
                
                <p className="text-xs text-[#BCAD9E] font-sans leading-relaxed">
                  Domine as mecânicas, forja e rotas comerciais de Fantasy2 com o guia exclusivo preparado pela nossa Staff:
                </p>

                <div className="space-y-3">
                  {tutorialPlaylist.map((tut) => {
                    const isActive = activeVideoId === tut.id;
                    return (
                      <div 
                        key={tut.id}
                        onClick={() => handleSelectTutorial(tut.id)}
                        className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer select-none text-left relative overflow-hidden group ${
                          isActive 
                            ? 'bg-gradient-to-br from-[#2E1505] to-[#150A04]/40 border-primary/60 text-white shadow-lg shadow-primary/10' 
                            : 'bg-black/20 border-white/5 hover:border-[#FF5500]/20 hover:bg-[#150D06]/40 text-stone-400'
                        }`}
                        id={`tutorial-playlist-item-${tut.id}`}
                      >
                        {isActive && (
                          <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-red-600 to-[#FF6A00]" />
                        )}

                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[12px] font-serif font-black uppercase tracking-wide flex items-center gap-1.5 ${isActive ? 'text-primary' : 'text-stone-200 group-hover:text-primary transition-colors'}`}>
                            {tut.title}
                          </span>
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <span className="font-mono text-[9px] text-white/50 bg-[#150A04] px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-stone-400" />
                              {tut.duration}
                            </span>
                            {isDeveloper && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEditing('tutorial', tut);
                                  }}
                                  className="p-1 rounded bg-stone-900 border border-white/10 hover:border-amber-400 hover:text-amber-400 transition-all text-stone-400 cursor-pointer"
                                  title="Editar informações do vídeo"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePlaylistItem('tutorial', tut.id);
                                  }}
                                  className="p-1 rounded bg-stone-900 border border-white/10 hover:border-red-500 hover:text-red-500 transition-all text-stone-400 cursor-pointer"
                                  title="Remover vídeo da playlist"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 pb-1.5 text-[10px] font-mono text-stone-500">
                          <span className="text-[#FF6A00] font-bold">Autor: {tut.author}</span>
                        </div>

                        <p className="text-[11px] font-sans text-[#BCAD9E]/80 leading-snug">
                          {tut.description}
                        </p>

                        {isActive && (
                          <div className="mt-2 text-[9px] text-[#FF6A00] font-mono uppercase tracking-widest font-black animate-pulse flex items-center gap-1">
                            <Play className="w-2.5 h-2.5 fill-[#FF6A00]" />
                            Reproduzindo Tutorial
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                  <Layers className="w-4 h-4 text-primary" />
                  Destaques do Vídeo
                </h3>
                
                <p className="text-xs text-[#BCAD9E] font-sans leading-relaxed">
                  Explore os principais recursos estruturais do servidor clicando nos momentos essenciais do nosso vídeo de apresentação:
                </p>

                <div className="space-y-3.5">
                  {chapters.map((ch, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setActiveChapter(idx);
                        // Standard action: trigger a dynamic alert/confetti or update active state
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer select-none text-left ${
                        ch.isActive 
                          ? 'bg-primary/10 border-primary/40 text-white shadow-sm' 
                          : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-serif font-bold uppercase tracking-wider ${ch.isActive ? 'text-primary' : 'text-stone-300'}`}>
                          {ch.title}
                        </span>
                        <span className="font-mono text-[10px] text-white/50 bg-[#150A04] px-1.5 py-0.5 rounded border border-white/10">
                          {ch.time}
                        </span>
                      </div>
                      <p className="text-[11px] font-sans text-stone-400 leading-snug">
                        {ch.description}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <div className="bg-[#150D06] rounded-xl p-3.5 border border-primary/15 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-highlight flex-shrink-0" />
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold block">Conexão Segura</span>
                <span className="text-[10px] font-sans text-stone-400">Proteção anti-DDoS robusta integrada ao Patcher Latino.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Decorative volcanic separator leading to user highlights */}
      <div className="my-20 relative flex items-center justify-center" id="players-highlights-divider">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-dashed border-[#FF6A00]/20" />
        </div>
        <div className="relative bg-[#080402] px-6 flex items-center gap-2 border border-[#FF6A00]/30 rounded-full py-2 shadow-xl">
          <Gamepad2 className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF6A00] font-bold">Mural de Highlights</span>
        </div>
      </div>

      {/* PLAYERS' INDEPENDENT HIGHLIGHTS MURAL */}
      <div className="relative" id="community-highlights-area">
        
        {/* Header section for community content */}
        <div className="text-center max-w-3xl mx-auto mb-12 relative">
          <span className="text-secondary font-mono text-xs uppercase tracking-widest inline-flex items-center gap-2 px-3 py-1 bg-[#FF6A00]/10 border border-[#FF6A00]/20 rounded-full mb-3">
            <Video className="w-3.5 h-3.5 animate-pulse" />
            Showroom da Comunidade
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-white">
            DESTAQUES DOS <span className="text-[#FF6A00] font-serif">JOGADORES</span>
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm mt-3 leading-relaxed font-sans">
            Comemore a perícia do nosso reino! Assista aos melhores PvP, conquistas de clãs ou tutoriais enviados voluntariamente. Cadastre o link do seu próprio gameplay do YouTube!
          </p>

          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-[#FF6A00] text-black font-serif font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
            id="btn-trigger-highlight-form"
          >
            {showSubmitForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showSubmitForm ? 'Fechar Formulário' : 'Enviar Meu Destaque'}
          </button>
        </div>

        {/* Submit Highlight Form Panel */}
        <AnimatePresence>
          {showSubmitForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="max-w-xl mx-auto overflow-hidden bg-[#0F0703] border border-[#FF6A00]/30 rounded-xl p-6 mb-12 shadow-xl relative"
              id="submit-highlight-form-box"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setShowSubmitForm(false)}
                  className="text-stone-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-serif text-lg text-white font-bold uppercase tracking-wide mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Cadastrar Nova Gameplay
              </h3>

              <form onSubmit={handleSubmitHighlight} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg flex items-center gap-2.5 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-400 text-[11px] uppercase tracking-wider font-bold mb-1.5 font-mono">
                      Nome do Personagem *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Ex: GuerreiroX"
                      className="w-full bg-[#080402] text-sm text-white placeholder-stone-600 rounded-lg px-3 py-2.5 border border-white/10 focus:border-[#FF6A00]/50 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 text-[11px] uppercase tracking-wider font-bold mb-1.5 font-mono">
                      Guilda / Clã (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newGuildName}
                      onChange={(e) => setNewGuildName(e.target.value)}
                      placeholder="Ex: RedSlayers"
                      className="w-full bg-[#080402] text-sm text-white placeholder-stone-600 rounded-lg px-3 py-2.5 border border-white/10 focus:border-[#FF6A00]/50 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 text-[11px] uppercase tracking-wider font-bold mb-1.5 font-mono">
                    Título do Vídeo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Recorde de Dano no PvP ou Farm Solo"
                    maxLength={70}
                    className="w-full bg-[#080402] text-sm text-white placeholder-stone-600 rounded-lg px-3 py-2.5 border border-white/10 focus:border-[#FF6A00]/50 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 text-[11px] uppercase tracking-wider font-bold mb-1.5 font-mono">
                    Link do Vídeo no YouTube (ou ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Ex: https://www.youtube.com/watch?v=..."
                    className="w-full bg-[#080402] text-sm text-white placeholder-stone-600 rounded-lg px-3 py-2.5 border border-white/10 focus:border-[#FF6A00]/50 focus:outline-none transition-all"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Insira o link direto ou compartilhável do seu vídeo carregado no YouTube.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmitForm(false)}
                    className="px-4 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-stone-300 font-serif text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-primary hover:bg-[#FF6A00] text-black font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    Publicar Vídeo
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Community Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="highlights-mural-deck">
          {playerHighlights.length === 0 ? (
            <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-black/30">
              <Video className="w-12 h-12 text-stone-600 mx-auto mb-3 animate-bounce" />
              <p className="text-stone-400 font-serif text-sm uppercase">Nenhum destaque cadastrado</p>
              <p className="text-stone-600 text-xs mt-1">Seja o primeiro a enviar sua gameplay e apareça na muralha de honra!</p>
            </div>
          ) : (
            playerHighlights.map((hl) => (
              <div
                key={hl.id}
                onClick={() => setActiveHighlightVideo(hl)}
                className="group relative flex flex-col justify-between bg-[#110603]/80 border border-[#FF6A00]/10 hover:border-[#FF6A00]/30 rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
              >
                <div>
                  {/* Aspect 16:9 Thumbnail Header */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black-950">
                    <img
                      src={`https://img.youtube.com/vi/${hl.youtubeId}/mqdefault.jpg`}
                      alt={hl.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Dark Vignette and ambient glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#110603] via-black/15 to-black/35 pointer-events-none" />

                    {/* Styled Video Run Action Tag */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="p-3 w-12 h-12 flex items-center justify-center rounded-full bg-[#FF6A00]/85 border border-[#FFD700]/30 shadow-lg text-white transform group-hover:scale-110 group-hover:bg-[#FF6A00] transition-all">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Relative Badge on Top with Avatar info */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/5 px-2.5 py-1 rounded-md text-[10px] text-stone-300 flex items-center gap-1.5 max-w-[85%] truncate animate-fade-in">
                      <User className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="font-sans font-bold truncate">
                        {hl.playerName}
                        {hl.guildName && (
                          <span className="text-[#FF6A00]/85"> [{hl.guildName}]</span>
                        )}
                      </span>
                    </div>

                    {/* Creation Calendar indicator */}
                    <div className="absolute bottom-3 right-3 bg-[#110603]/90 backdrop-blur-sm border border-white/5 px-2 py-0.5 rounded text-[9px] text-stone-400 font-mono flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-stone-500" />
                      {hl.createdAt}
                    </div>
                  </div>

                  {/* Title and stats description */}
                  <div className="p-4 flex-1">
                    <h4 className="font-serif text-sm font-semibold text-white tracking-wide leading-snug group-hover:text-[#FF6A00] transition-colors line-clamp-2">
                      {hl.title}
                    </h4>
                  </div>
                </div>

                {/* Footer block with interactive stats */}
                <div className="px-4 py-3 bg-[#0c0301] border-t border-white/5 flex items-center justify-between text-xs text-stone-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] font-mono select-none">
                      <Eye className="w-3.5 h-3.5 text-stone-500" />
                      {hl.views}
                    </span>
                    <button
                      onClick={(e) => handleLike(hl.id, e)}
                      className="flex items-center gap-1.5 py-1 px-2.5 rounded bg-white/5 border border-white/5 hover:border-[#FFD700]/25 hover:bg-primary/10 hover:text-[#FFD700] transition-all text-[11px]"
                    >
                      <ThumbsUp className="w-3 h-3 text-primary" />
                      {hl.likes}
                    </button>
                  </div>

                  {/* Delete Option for players/admins */}
                  <button
                    onClick={(e) => handleDeleteHighlight(hl.id, e)}
                    className="p-1 text-stone-600 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors cursor-pointer"
                    title="Excluir destaque"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* LIGHTBOX MODAL WITH COMMUNITY VIDEO EMBEDDED IFRAME */}
      <AnimatePresence>
        {activeHighlightVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-md"
            onClick={() => setActiveHighlightVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="relative max-w-4xl w-full bg-[#080402] border border-[#FF6A00]/30 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Upper Deck Controls */}
              <div className="px-5 py-4 bg-[#0e0703] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-serif text-xs uppercase tracking-wide text-stone-300 font-bold truncate max-w-[200px] sm:max-w-md">
                    Highlight de {activeHighlightVideo.playerName}
                    {activeHighlightVideo.guildName && ` - Guild: [${activeHighlightVideo.guildName}]`}
                  </span>
                </div>
                <button
                  onClick={() => setActiveHighlightVideo(null)}
                  className="p-1 rounded-full bg-white/5 hover:bg-white/10 hover:text-[#FF6A00] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Secure responsive widescreen video viewport */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeHighlightVideo.youtubeId}?autoplay=1&rel=0&showinfo=0`}
                  title={activeHighlightVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Modal Description Details bar */}
              <div className="p-5 bg-[#0e0703] border-t border-white/5">
                <h3 className="font-serif text-base text-white font-bold tracking-wide">
                  {activeHighlightVideo.title}
                </h3>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4 text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-primary" />
                      Jogador: <b className="text-stone-200">{activeHighlightVideo.playerName}</b>
                    </span>
                    {activeHighlightVideo.guildName && (
                      <span className="flex items-center gap-1 font-sans">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FF6A00]" />
                        Guilda: <b className="text-[#FF6A00]">{activeHighlightVideo.guildName}</b>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleLike(activeHighlightVideo.id, e)}
                      className="flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-primary/10 border border-primary/25 hover:bg-primary/20 text-[#FFD700] transition-all text-xs font-bold"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Curtir Vídeo ({activeHighlightVideo.likes})
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
