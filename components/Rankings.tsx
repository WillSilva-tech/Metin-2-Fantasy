'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, Shield, Clock, Swords, Compass, RefreshCw } from 'lucide-react';

type Kingdom = 'Shinsoo' | 'Chunjo' | 'Jinno';
type RankingTab = 'jogadores' | 'guilds' | 'classes';

interface ApiPlayerRank {
  rank: number;
  nick: string;
  level: number;
  kingdom: Kingdom;
  className: 'Guerreiro' | 'Ninja' | 'Shura' | 'Shaman' | string;
  playedTime: string;
}

interface ApiGuildRank {
  rank: number;
  name: string;
  leaderNick: string;
  level: number;
  kingdom: Kingdom;
}

interface UnifiedRankItem {
  rank: number;
  title: string;
  subtitle: string;
  metric: string;
  kingdom: Kingdom;
  className?: string;
}

const kingdomLabel = {
  Shinsoo: 'Shinsoo',
  Chunjo: 'Chunjo',
  Jinno: 'Jinno',
};

function kingdomBadge(kingdom: Kingdom) {
  if (kingdom === 'Chunjo') return 'text-yellow-300 bg-yellow-950/30 border-yellow-700/35';
  if (kingdom === 'Jinno') return 'text-blue-300 bg-blue-950/30 border-blue-700/35';
  return 'text-red-300 bg-red-950/30 border-red-700/35';
}

export default function Rankings() {
  const [activeTab, setActiveTab] = useState<RankingTab>('jogadores');
  const [selectedClass, setSelectedClass] = useState<'Todos' | 'Guerreiro' | 'Ninja' | 'Shura' | 'Shaman'>('Todos');
  const [kingdomFilter, setKingdomFilter] = useState<'Todos' | Kingdom>('Todos');
  const [players, setPlayers] = useState<ApiPlayerRank[]>([]);
  const [guilds, setGuilds] = useState<ApiGuildRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRankings() {
      setIsLoading(true);
      setError(null);

      try {
        const [playersRes, guildsRes] = await Promise.all([
          fetch('/api/rankings?type=players', { cache: 'no-store' }),
          fetch('/api/rankings?type=guilds', { cache: 'no-store' }),
        ]);

        const playersData = await playersRes.json();
        const guildsData = await guildsRes.json();

        if (!playersRes.ok || !playersData.success) {
          throw new Error(playersData.error || 'Falha ao carregar o Hall da Fama.');
        }

        if (!cancelled) {
          setPlayers(Array.isArray(playersData.players) ? playersData.players : []);
          setGuilds(Array.isArray(guildsData.guilds) ? guildsData.guilds : []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError('Erro ao carregar o Hall da Fama.');
          setPlayers([]);
          setGuilds([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadRankings();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo<UnifiedRankItem[]>(() => {
    if (activeTab === 'guilds') {
      return guilds
        .filter((guild) => kingdomFilter === 'Todos' || guild.kingdom === kingdomFilter)
        .map((guild) => ({
          rank: guild.rank,
          title: guild.name,
          subtitle: `Lider: ${guild.leaderNick}`,
          metric: `Nivel ${guild.level}`,
          kingdom: guild.kingdom,
        }));
    }

    return players
      .filter((player) => kingdomFilter === 'Todos' || player.kingdom === kingdomFilter)
      .filter((player) => activeTab !== 'classes' || selectedClass === 'Todos' || player.className === selectedClass)
      .map((player, index) => ({
        rank: activeTab === 'classes' ? index + 1 : player.rank,
        title: player.nick,
        subtitle: `Nivel ${player.level} - ${player.className}`,
        metric: player.playedTime,
        kingdom: player.kingdom,
        className: player.className,
      }));
  }, [activeTab, guilds, kingdomFilter, players, selectedClass]);

  const podium = items.slice(0, 3);

  return (
    <section id="rankings" className="relative z-20 py-20 bg-gradient-to-b from-[#150A04]/95 to-[#050201] max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <span className="text-primary font-mono text-xs uppercase tracking-widest block mb-1">
          Hall da Fama oficial
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl font-black uppercase tracking-wider text-white">
          Hall da <span className="text-[#FF6A00]">Fama</span>
        </h2>
        <p className="max-w-xl mx-auto text-[#BCAD9E] text-xs sm:text-sm mt-3 leading-relaxed">
          Consulte o Hall da Fama oficial do Fantasy2. Os lutadores mais devotos, as alianças mais imponentes e os gladiadores que dominam as ligas mundiais de PvP.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-3xl mx-auto mb-6">
        {[
          { id: 'jogadores', label: 'Jogadores', icon: Clock },
          { id: 'guilds', label: 'Guilds', icon: Shield },
          { id: 'classes', label: 'Classes', icon: Swords },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as RankingTab)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                active
                  ? 'border-[#FF6A00]/60 bg-[#FF6A00]/10 text-white'
                  : 'border-white/5 bg-black/30 text-stone-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2 font-serif text-sm font-bold uppercase">
                <Icon className="w-4 h-4 text-primary" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="max-w-5xl mx-auto mb-8 rounded-lg border border-white/5 bg-[#0C0603] p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-[#BCAD9E] uppercase">
          <Compass className="w-3.5 h-3.5 text-[#FF6A00]" />
          Filtros
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['Todos', 'Shinsoo', 'Chunjo', 'Jinno'] as const).map((kingdom) => (
            <button
              key={kingdom}
              onClick={() => setKingdomFilter(kingdom)}
              className={`px-3 py-1 rounded border text-[10px] uppercase tracking-widest ${
                kingdomFilter === kingdom
                  ? 'border-[#FF6A00]/50 bg-[#FF6A00]/15 text-primary'
                  : 'border-white/5 text-stone-400 hover:text-white'
              }`}
            >
              {kingdom === 'Todos' ? 'Todos os Reinos' : kingdomLabel[kingdom]}
            </button>
          ))}
        </div>

        {activeTab === 'classes' && (
          <div className="flex flex-wrap gap-1.5">
            {(['Todos', 'Guerreiro', 'Ninja', 'Shura', 'Shaman'] as const).map((className) => (
              <button
                key={className}
                onClick={() => setSelectedClass(className)}
                className={`px-3 py-1 rounded border text-[10px] uppercase tracking-widest ${
                  selectedClass === className
                    ? 'border-[#FF6A00]/50 bg-[#FF6A00]/15 text-primary'
                    : 'border-white/5 text-stone-400 hover:text-white'
                }`}
              >
                {className}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="max-w-xl mx-auto rounded-lg bg-black/40 border border-white/5 p-12 text-center text-stone-400 font-mono text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
          Carregando Hall da Fama...
        </div>
      )}

      {!isLoading && error && (
        <div className="max-w-xl mx-auto rounded-lg bg-red-950/20 border border-red-900/30 p-8 text-center text-red-300 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="max-w-xl mx-auto rounded-lg bg-black/40 border border-white/5 p-12 text-center text-stone-500 font-mono text-sm">
          Nenhum jogador encontrado para este filtro.
        </div>
      )}

      {!isLoading && !error && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {podium.map((item) => (
              <div
                key={`${item.rank}-${item.title}`}
                className={`rounded-lg border p-6 text-center bg-gradient-to-b from-[#150A04]/90 to-black/80 ${
                  item.rank === 1 ? 'border-primary shadow-[0_0_25px_rgba(255,106,0,0.2)]' : 'border-white/10'
                }`}
              >
                <div className="mx-auto mb-4 w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center text-primary font-serif font-black">
                  {item.rank}o
                </div>
                <Trophy className="w-5 h-5 text-primary mx-auto mb-2" />
                <h3 className="font-serif text-xl font-bold uppercase tracking-wide text-white">{item.title}</h3>
                <p className="text-xs text-[#BCAD9E] mt-1">{item.subtitle}</p>
                <span className={`inline-block mt-3 text-[10px] uppercase font-mono px-2.5 py-0.5 rounded border ${kingdomBadge(item.kingdom)}`}>
                  {item.kingdom}
                </span>
                <div className="mt-5 border-t border-white/5 pt-4 text-primary font-serif font-bold uppercase text-sm">
                  {item.metric}
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-5xl mx-auto bg-gradient-to-b from-bg-secondary/40 to-[#080402]/95 border border-primary/10 rounded-lg overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#FF6A00]/20 bg-[#0F0804]/80 text-[10px] font-mono uppercase tracking-widest text-[#BCAD9E]">
                    <th className="py-4 px-6 text-center w-24">Posicao</th>
                    <th className="py-4 px-6">{activeTab === 'guilds' ? 'Guilda' : 'Personagem'}</th>
                    <th className="py-4 px-6 text-center">Detalhes</th>
                    <th className="py-4 px-6 text-center">Reino</th>
                    <th className="py-4 px-6 text-right">Tempo / Nivel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {items.map((item) => (
                    <tr key={`${item.rank}-${item.title}`} className="hover:bg-white/5">
                      <td className="py-4 px-6 text-center font-mono text-primary">#{item.rank}</td>
                      <td className="py-4 px-6 font-serif font-bold text-white">{item.title}</td>
                      <td className="py-4 px-6 text-center text-xs text-[#BCAD9E]">{item.subtitle}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block text-[10px] uppercase font-mono px-2.5 py-0.5 rounded border ${kingdomBadge(item.kingdom)}`}>
                          {item.kingdom}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-primary font-serif font-black uppercase">{item.metric}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
