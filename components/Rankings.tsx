'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Swords, Sparkles, Filter, Shield, Clock, Users, Swords as Flame, Compass } from 'lucide-react';
import { 
  TOP_PLAYERS_RANKING, 
  TOP_GUILDS_RANKING, 
  CHAMPIONS_LEAGUE_RANKING, 
  TOP_CLASSE_RANKING,
  TopPlayerRank,
  GuildRank,
  NewChampionsLeagueRank,
  TopClassRank
} from '@/lib/game-data';

interface UnifiedRankItem {
  rank: number;
  title: string;       // Name of character or guild
  subtitle: string;    // Level, guild leader etc.
  highlightField: string; // Dynamic stats based on ranking type
  kingdom: 'Shinsoo' | 'Chunjo' | 'Jinno';
  icon?: string;
  extraLabel?: string; // Secondary detail (like Level or Class name for column)
}

export default function Rankings() {
  const [activeTab, setActiveTab] = useState<'jogadores' | 'guilds' | 'champions' | 'classes'>('jogadores');
  const [selectedClass, setSelectedClass] = useState<'Guerreiro' | 'Ninja' | 'Shura' | 'Shaman'>('Guerreiro');
  const [kingdomFilter, setKingdomFilter] = useState<'Todos' | 'Shinsoo' | 'Chunjo' | 'Jinno'>('Todos');

  // Unified items map based on active tab and filtering
  const currentRankItems = useMemo<UnifiedRankItem[]>(() => {
    switch (activeTab) {
      case 'jogadores': {
        const filtered = kingdomFilter === 'Todos' 
          ? TOP_PLAYERS_RANKING 
          : TOP_PLAYERS_RANKING.filter(p => p.kingdom === kingdomFilter);
        return filtered.map(p => ({
          rank: p.rank,
          title: p.nick,
          subtitle: `Nível ${p.level}`,
          highlightField: p.playedTime,
          kingdom: p.kingdom,
          icon: '👤',
          extraLabel: `Lvl ${p.level}`
        }));
      }
      
      case 'guilds': {
        const filtered = kingdomFilter === 'Todos'
          ? TOP_GUILDS_RANKING
          : TOP_GUILDS_RANKING.filter(g => g.kingdom === kingdomFilter);
        return filtered.map(g => ({
          rank: g.rank,
          title: g.guild,
          subtitle: `Líder: ${g.leader}`,
          highlightField: `Nível ${g.level}`,
          kingdom: g.kingdom,
          icon: '🛡️',
          extraLabel: g.leader
        }));
      }

      case 'champions': {
        const filtered = kingdomFilter === 'Todos'
          ? CHAMPIONS_LEAGUE_RANKING
          : CHAMPIONS_LEAGUE_RANKING.filter(c => c.kingdom === kingdomFilter);
        return filtered.map(c => ({
          rank: c.rank,
          title: c.nick,
          subtitle: `Nível ${c.level}`,
          highlightField: c.league,
          kingdom: c.kingdom,
          icon: c.leagueIcon,
          extraLabel: `Lvl ${c.level}`
        }));
      }

      case 'classes': {
        // Filter by class first
        let baseList = TOP_CLASSE_RANKING.filter(c => c.className === selectedClass);
        // Then filter by kingdom if not Todos
        if (kingdomFilter !== 'Todos') {
          baseList = baseList.filter(c => c.kingdom === kingdomFilter);
        }
        return baseList.map((c, idx) => ({
          // Retain true rank relative to this class list
          rank: idx + 1,
          title: c.nick,
          subtitle: `Nível ${c.level}`,
          highlightField: c.className,
          kingdom: c.kingdom,
          icon: selectedClass === 'Guerreiro' ? '⚔️' : selectedClass === 'Ninja' ? '🗡️' : selectedClass === 'Shura' ? '💀' : '🪭',
          extraLabel: `Lvl ${c.level}`
        }));
      }

      default:
        return [];
    }
  }, [activeTab, kingdomFilter, selectedClass]);

  const topThree = useMemo(() => {
    // Slice first 3 items from the filtered active ranking dataset
    return currentRankItems.slice(0, 3);
  }, [currentRankItems]);

  // Order array so 2nd rank is on left, 1st is in center, 3rd is on right (only for desktop layout visualization)
  const podiumOrder = useMemo(() => {
    if (topThree.length === 0) return [];
    if (topThree.length === 1) return [topThree[0]];
    if (topThree.length === 2) return [topThree[1], topThree[0]];
    return [topThree[1], topThree[0], topThree[2]];
  }, [topThree]);

  const getKingdomBadgeColor = (kingdom: string) => {
    switch (kingdom) {
      case 'Shinsoo': return 'text-red-500 bg-red-950/20 border-red-900/35';
      case 'Chunjo': return 'text-[#FFD700] bg-yellow-950/20 border-yellow-900/35';
      case 'Jinno': return 'text-blue-400 bg-blue-950/20 border-blue-900/35';
      default: return 'text-stone-400 bg-stone-900 border-white/5';
    }
  };

  const getKingdomLabel = (kingdom: string) => {
    switch (kingdom) {
      case 'Shinsoo': return 'Shinsoo (Vermelho)';
      case 'Chunjo': return 'Chunjo (Amarelo)';
      case 'Jinno': return 'Jinno (Azul)';
      default: return kingdom;
    }
  };

  const getPodiumStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          cardBg: 'bg-gradient-to-b from-amber-600/15 via-[#150A04]/95 to-[#080402]/95',
          border: 'border-2 border-primary shadow-[0_0_25px_rgba(255,106,0,0.25)]',
          crown: '👑',
          textColor: 'text-primary drop-shadow-[0_0_8px_rgba(255,106,0,0.5)]',
          award: '1º Lugar',
          scale: 'md:-translate-y-4 md:scale-105 z-15 bg-radial from-[#1E0E06] via-black to-[#080402]',
          positionOrder: 'order-1 md:order-2'
        };
      case 2:
        return {
          cardBg: 'bg-gradient-to-b from-stone-800/15 via-[#110804]/95 to-[#080402]/95',
          border: 'border border-stone-500/50 shadow-[0_0_15px_rgba(200,200,200,0.08)]',
          crown: '🔱',
          textColor: 'text-stone-300',
          award: '2º Lugar',
          scale: 'z-10',
          positionOrder: 'order-2 md:order-1'
        };
      case 3:
        return {
          cardBg: 'bg-gradient-to-b from-amber-900/10 via-[#110804]/95 to-[#080402]/95',
          border: 'border border-[#9C5A3C]/40 shadow-[0_0_12px_rgba(156,90,60,0.06)]',
          crown: '🛡️',
          textColor: 'text-[#C57A54]',
          award: '3º Lugar',
          scale: 'z-10',
          positionOrder: 'order-3 md:order-3'
        };
      default:
        return {
          cardBg: 'bg-black/40',
          border: 'border border-white/5',
          crown: '',
          textColor: 'text-white',
          award: '',
          scale: '',
          positionOrder: ''
        };
    }
  };

  return (
    <section id="rankings" className="relative z-20 py-20 bg-gradient-to-b from-[#150A04]/95 to-[#050201] max-w-7xl mx-auto px-4 sm:px-6">
      {/* SECTION HEADER */}
      <div className="text-center mb-12">
        <span className="text-primary font-mono text-xs uppercase tracking-widest block mb-1">
          REIS DAS ARENAS E VALES
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl font-black uppercase tracking-wider text-white">
          RANKING <span className="text-[#FF6A00]">GERAL</span>
        </h2>
        <p className="max-w-xl mx-auto text-[#BCAD9E] text-xs sm:text-sm mt-3 leading-relaxed">
          Consulte o Hall da Fama oficial do Fantasy2. Os lutadores mais devotos, as alianças mais imponentes e os gladiadores que dominam as ligas mundiais de PvP e PvM.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4" />
      </div>

      {/* TABS SELECTOR (THE 4 MAJESTIC SECTIONS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-4xl mx-auto mb-10">
        {[
          { id: 'jogadores', label: 'Top Jogadores', icon: Clock, desc: 'Tempo de Game' },
          { id: 'guilds', label: 'Top Guilds', icon: Shield, desc: 'Impérios e Líderes' },
          { id: 'champions', label: 'Champions League', icon: Trophy, desc: 'Ligas Competitivas' },
          { id: 'classes', label: 'Top Classes', icon: Swords, desc: 'Filtro por Classe' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setKingdomFilter('Todos'); // Clear kingdom selection on swap to ensure complete data
              }}
              className={`text-left p-3.5 sm:p-4 rounded-lg border transition-all cursor-pointer relative overflow-hidden group ${
                isActive
                  ? 'bg-[#1D0E05]/60 border-[#FF6A00]/50 text-white shadow-[0_0_15px_rgba(255,106,0,0.15)] md:scale-[1.02]'
                  : 'bg-[#0F0804]/60 hover:bg-black/40 border-white/5 text-stone-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div className={`p-1.5 rounded transition-colors ${isActive ? 'bg-[#FF6A00]/20 text-[#FF6A00]' : 'bg-[#0F0804] text-stone-500 group-hover:text-[#FF6A00]/70'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-serif text-sm font-bold tracking-wide transition-colors">{tab.label}</span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block ml-9">{tab.desc}</span>
              {isActive && (
                <div className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-[#FF6A00] rounded-tl-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* FILTER BUTTONS ROW (CLASS / KINGDOM) */}
      <div className="flex flex-col gap-4 max-w-5xl mx-auto mb-8 bg-[#0C0603] p-4 rounded-lg border border-white/5">
        
        {/* Dynamic Class Selector only when TOP CLASSES is active */}
        {activeTab === 'classes' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#BCAD9E] uppercase font-bold">
              <Filter className="w-3.5 h-3.5 text-[#FF6A00] animate-pulse" />
              Selecione a Classe:
            </div>
            <div className="grid grid-cols-4 sm:flex gap-1.5">
              {(['Guerreiro', 'Ninja', 'Shura', 'Shaman'] as const).map((cls) => {
                const isClsActive = selectedClass === cls;
                const getIcon = () => {
                  if (cls === 'Guerreiro') return '⚔️';
                  if (cls === 'Ninja') return '🗡️';
                  if (cls === 'Shura') return '💀';
                  return '🪭';
                };
                return (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-3 py-1.5 rounded text-[11px] uppercase tracking-wider font-serif transition-all cursor-pointer border text-center ${
                      isClsActive
                        ? 'bg-[#FF6A00]/20 border-[#FF6A00] text-white font-bold'
                        : 'bg-black/30 border-white/5 text-stone-400 hover:text-white'
                    }`}
                  >
                    <span className="mr-1">{getIcon()}</span>
                    <span>{cls}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Kingdom Filter for all active tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#BCAD9E] uppercase">
            <Compass className="w-3.5 h-3.5 text-[#FF6A00]" />
            Filtrar por Império:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['Todos', 'Shinsoo', 'Chunjo', 'Jinno'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setKingdomFilter(opt)}
                className={`px-3 py-1 rounded text-[10px] uppercase tracking-widest transition-all cursor-pointer border font-semibold ${
                  kingdomFilter === opt
                    ? 'bg-[#FF6A00]/15 border-[#FF6A00]/40 text-primary font-bold shadow-[0_0_8px_rgba(255,106,0,0.15)]'
                    : 'bg-transparent border-white/5 hover:border-white/10 text-stone-400 hover:text-white'
                }`}
              >
                {opt === 'Todos' ? 'Todos os Reinos' : getKingdomLabel(opt)}
              </button>
            ))}
          </div>
        </div>

      </div>

      {currentRankItems.length === 0 ? (
        <div className="max-w-xl mx-auto rounded-lg bg-black/40 border border-white/5 p-16 text-center text-stone-500 font-mono text-sm">
          ⚠️ Nenhum guerreiro ou guilda encontrado com estes filtros.
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM HERO SHOWCASE (CRITICAL VISUAL HIGHLIGHT) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto mb-14 items-end pt-4">
            {podiumOrder.map((player) => {
              const style = getPodiumStyle(player.rank);
              return (
                <div
                  key={player.rank}
                  className={`relative rounded-lg overflow-hidden p-6 flex flex-col justify-between ${style.cardBg} ${style.border} ${style.scale} ${style.positionOrder} transition-all duration-300 hover:scale-[1.03] animate-fade-in`}
                >
                  {/* Top Crown/Medal representation */}
                  <div className="absolute top-4 right-4 text-[11px] tracking-wider uppercase font-mono bg-black/60 px-3 py-1 rounded border border-white/10 text-stone-300 font-bold flex items-center gap-1.5">
                    <span className="text-sm">{style.crown}</span> {style.award}
                  </div>

                  {/* Character visual presentation details */}
                  <div className="pt-6 text-center flex-1 flex flex-col items-center">
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-amber-500 p-[2.5px] mb-4.5 shadow-2.5xl flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-[#080402] flex items-center justify-center font-serif font-black text-xl text-primary font-serif">
                        {player.rank === 1 ? '1º' : player.rank === 2 ? '2º' : '3º'}
                      </div>
                    </div>

                    <h3 className={`font-serif text-lg sm:text-xl font-bold uppercase tracking-wide truncate max-w-full ${style.textColor}`}>
                      {player.title}
                    </h3>
                    
                    <span className="text-[11px] text-[#BCAD9E] font-medium font-mono uppercase mt-1">
                      {player.subtitle}
                    </span>

                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded border font-semibold ${getKingdomBadgeColor(player.kingdom)}`}>
                        {player.kingdom}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic highlight metric panel based on selected tab */}
                  <div className="mt-6 pt-4 border-t border-white/5 text-center bg-black/30 rounded p-3">
                    <span className="text-[9px] uppercase tracking-widest font-mono text-stone-500 block mb-0.5">
                      {activeTab === 'jogadores' && 'TEMPO ACUMULADO'}
                      {activeTab === 'guilds' && 'STATUS DA GUILDA'}
                      {activeTab === 'champions' && 'COORDENAÇÃO LIGA'}
                      {activeTab === 'classes' && 'CLASSE DO JOGADOR'}
                    </span>
                    <span className="font-serif font-black text-sm text-primary flex items-center justify-center gap-1.5">
                      <span className="text-xs">{player.icon}</span> 
                      <span className="uppercase tracking-wide">{player.highlightField}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* HIGH-FIDELITY LEADERBOARD DATABASE GRID */}
          <div className="max-w-5xl mx-auto bg-gradient-to-b from-bg-secondary/40 to-[#080402]/95 border border-primary/10 rounded-lg overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-[#FF6A00]/20 bg-[#0F0804]/80 text-[10px] sm:text-xs font-mono uppercase tracking-widest font-bold text-[#BCAD9E]">
                    <th className="py-4 px-6 text-center w-24">Posição</th>
                    <th className="py-4 px-6">
                      {activeTab === 'guilds' ? 'Guilda / Aliança' : 'Guerreiro / Jogador'}
                    </th>
                    <th className="py-4 px-6 text-center w-36">
                      {activeTab === 'guilds' ? 'Líder Supremo' : 'Nível Máximo'}
                    </th>
                    <th className="py-4 px-6 text-center w-40">Império/Reino</th>
                    <th className="py-4 px-6 text-right pr-8">
                      {activeTab === 'jogadores' && 'Tempo Jogado'}
                      {activeTab === 'guilds' && 'Nível Guild'}
                      {activeTab === 'champions' && 'Liga Oficial'}
                      {activeTab === 'classes' && 'Especialização'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {currentRankItems.map((item, idx) => {
                    const isTop3 = item.rank <= 3;
                    const rowHighlightStyle = isTop3
                      ? item.rank === 1
                        ? 'bg-[#FF6A00]/5 hover:bg-[#FF6A00]/10 border-l border-primary/40'
                        : item.rank === 2
                        ? 'bg-stone-300/[0.02] hover:bg-stone-300/[0.05] border-l border-stone-500/20'
                        : 'bg-[#C57A54]/[0.02] hover:bg-[#C57A54]/[0.05] border-l border-[#C57A54]/20'
                      : 'hover:bg-white/5';

                    return (
                      <tr
                        key={`${item.title}-${item.rank}`}
                        className={`transition-all duration-150 group ${rowHighlightStyle}`}
                      >
                        {/* POSITION ELEMENT COLUMN WITH VISUAL CROWNS OR NUMBERS */}
                        <td className="py-4 px-6 text-center font-serif font-bold">
                          {isTop3 ? (
                            <div className="flex items-center justify-center gap-1 text-center scale-110">
                              <span className="text-base">
                                {item.rank === 1 ? '👑' : item.rank === 2 ? '🔱' : '🛡️'}
                              </span>
                              <span className={`text-xs uppercase tracking-wide tracking-tighter ${
                                item.rank === 1 ? 'text-[#FFD700]' : item.rank === 2 ? 'text-stone-300' : 'text-[#C57A54]'
                              }`}>
                                {item.rank}º
                              </span>
                            </div>
                          ) : (
                            <span className="text-stone-500 font-mono text-center block">
                              #{item.rank}
                            </span>
                          )}
                        </td>

                        {/* NAME / GUILD TITLE WITH LEADER / SUBTITLE DESCRIPTION UNDERNEATH */}
                        <td className="py-4 px-6 font-serif">
                          <div className="flex items-center gap-3">
                            <span className="text-base filter saturate-100 group-hover:scale-110 transition-transform">
                              {item.icon || '👤'}
                            </span>
                            <div>
                              <span className={`font-bold block transition-colors group-hover:text-primary ${isTop3 ? 'text-white' : 'text-[#D5CDBC]'}`}>
                                {item.title}
                              </span>
                              {activeTab === 'guilds' && (
                                <span className="text-[10px] font-mono text-stone-500 block uppercase tracking-wider">
                                  Líder: {item.extraLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* LEVEL LEVEL OR DYNAMIC ATTRIBUTE HIGHLIGHT */}
                        <td className="py-4 px-6 text-center font-mono font-bold">
                          {activeTab === 'guilds' ? (
                            <span className="text-stone-300 text-xs">
                              {item.extraLabel}
                            </span>
                          ) : (
                            <span className="text-primary text-sm shadow-[#FF6A00]/5 underline-offset-4 decoration-[#FF6A00]/20">
                              Lvl {item.extraLabel?.split(' ')[1] || '120'}
                            </span>
                          )}
                        </td>

                        {/* KINGDOM FLAG/BADGE IN CENTER */}
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block text-[10px] uppercase font-mono px-2.5 py-0.5 rounded border font-semibold ${getKingdomBadgeColor(item.kingdom)}`}>
                            {item.kingdom}
                          </span>
                        </td>

                        {/* PRIMARY STATISTIC VALUE ALIGNED TO THE RIGHT */}
                        <td className="py-4 px-6 text-right pr-8">
                          {activeTab === 'champions' ? (
                            <span className="font-serif font-black text-stone-200 uppercase tracking-wide inline-flex items-center gap-2 group-hover:text-primary transition-colors">
                              <span className="text-sm sm:text-base filter saturate-120">{item.icon}</span>
                              <span className="text-xs sm:text-sm">{item.highlightField}</span>
                            </span>
                          ) : (
                            <span className="font-serif font-black text-primary uppercase text-xs sm:text-sm tracking-wide bg-[#0F0804] px-3 py-1.5 rounded border border-white/5">
                              {item.highlightField}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
