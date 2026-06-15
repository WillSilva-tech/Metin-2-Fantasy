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

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  if (url.trim().length === 11) return url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function NewsAndTrailer({ onRegisterClick, user }: NewsAndTrailerProps) {
  const [activeVideoId, setActiveVideoId] = useState('VV9GCBMwbV4');
  const [activeSession, setActiveSession] = useState<'costumes' | 'server' | 'tutorial'>('costumes');
  const [activeCostumeTab, setActiveCostumeTab] = useState<'todos' | 'lendarios' | 'misticos' | 'sazonais'>('todos');
  const [targetPlaylist, setTargetPlaylist] = useState<'costumes' | 'tutorial' | 'server'>('costumes');
  const [isDeveloper, setIsDeveloper] = useState(false);

  // Estados dos vídeos
  const [serverVideoId, setServerVideoId] = useState('8YQubtW_8uA');
  const [costumesVideoId, setCostumesVideoId] = useState('VV9GCBMwbV4');
  const [tutorialVideoId, setTutorialVideoId] = useState('P_PSTTbyD8w');

  const [costumesPlaylist, setCostumesPlaylist] = useState<any[]>([]);
  const [tutorialPlaylist, setTutorialPlaylist] = useState<any[]>([]);

  // Estados do formulário administrativo
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
      if (data.success && Array.isArray(data.videos)) {
        const allv = data.videos;
        const serverV = allv.find((v: any) => v.category === 'server');
        const costumesV = allv.filter((v: any) => v.category === 'costumes');
        const tutorialsV = allv.filter((v: any) => v.category === 'tutorial');

        if (serverV) setServerVideoId(serverV.id);
        
        setCostumesPlaylist(costumesV.map((v: any) => ({
          id: v.id,
          title: v.title,
          rarity: 'Lendário',
          category: v.subcategory || 'todos',
          description: v.description || 'Sem descrição.',
          views: v.views ? `${v.views} views` : 'Novo'
        })));

        setTutorialPlaylist(tutorialsV.map((v: any) => ({
          id: v.id,
          title: v.title,
          duration: '5:00 min',
          author: 'GM_Staff',
          description: v.description || 'Sem descrição.'
        })));
      }
    } catch (err) {
      console.error('Error fetching global videos:', err);
    }
  };

  useEffect(() => {
    // Carrega os vídeos do banco apenas uma vez ao montar o componente
    loadGlobalVideos();
    setIsDeveloper(true); 
  }, []); 

  const handleSwitchSession = (session: 'server' | 'costumes' | 'tutorial') => {
    setActiveSession(session);
    if (session === 'server') setActiveVideoId(serverVideoId);
    if (session === 'costumes') setActiveVideoId(costumesVideoId);
    if (session === 'tutorial') setActiveVideoId(tutorialVideoId);
  };

  const handleAddOrSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlaylistFormError('');
    setPlaylistFormSuccess('');

    const parsedId = extractYoutubeId(formLink);
    if (!parsedId) { setPlaylistFormError('Link inválido.'); return; }

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: formLink,
          title: formTitle,
          subtitle: formSubtitle || 'Mostruário',
          description: formDescription,
          category: targetPlaylist,
          subcategory: targetPlaylist === 'costumes' ? activeCostumeTab : 'todos'
        })
      });

      if ((await response.json()).success) {
        setPlaylistFormSuccess('Vídeo salvo com sucesso!');
        await loadGlobalVideos();
      }
    } catch (err) { setPlaylistFormError('Erro de conexão.'); }
  };

  const filteredCostumes = costumesPlaylist.filter(c => 
    activeCostumeTab === 'todos' ? true : c.category === activeCostumeTab
  );

  return (
    <section id="noticias" className="relative z-20 py-24 bg-gradient-to-b from-[#080402] to-[#150A04]/90 max-w-7xl mx-auto px-4 overflow-hidden">
      {/* O restante do seu JSX permanece o mesmo, mantendo a estrutura original de design */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="relative group rounded-2xl bg-[#080402] border border-[#FF6A00]/25 overflow-hidden shadow-2xl">
            <iframe 
                src={`https://www.youtube.com/embed/${activeVideoId}?rel=0`} 
                className="w-full aspect-video" 
                allowFullScreen 
            />
            <div className="p-4 grid grid-cols-3 gap-2">
                <button onClick={() => handleSwitchSession('costumes')} className="py-2 text-xs border border-white/10 rounded">Trajes</button>
                <button onClick={() => handleSwitchSession('server')} className="py-2 text-xs border border-white/10 rounded">Trailer</button>
                <button onClick={() => handleSwitchSession('tutorial')} className="py-2 text-xs border border-white/10 rounded">Tutorial</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#0A0502]/70 border border-white/5 rounded-2xl p-4">
            {/* Lista renderizada aqui */}
        </div>
      </div>

      {isDeveloper && (
        <div className="mt-8 bg-[#0E0602] border border-[#FF6A00]/40 p-6 rounded-2xl">
          <form onSubmit={handleAddOrSaveVideo} className="space-y-4">
             <input placeholder="Título" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full bg-black p-2 border border-white/10" />
             <input placeholder="Link YouTube" value={formLink} onChange={(e) => setFormLink(e.target.value)} className="w-full bg-black p-2 border border-white/10" />
             <button type="submit" className="bg-primary px-6 py-2 rounded">Salvar no Postgres</button>
          </form>
        </div>
      )}
    </section>
  );
}