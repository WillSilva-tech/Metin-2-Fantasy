'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Users, Swords, Cpu, Download, Coins, ShieldAlert, Award 
} from 'lucide-react';

interface StatsAndQuickProps {
  onRegisterClick: () => void;
  onDownloadClick: () => void;
  onShopClick: () => void;
}

export default function StatsAndQuick({ 
  onRegisterClick, 
  onDownloadClick, 
  onShopClick 
}: StatsAndQuickProps) {
  const [playersOnline, setPlayersOnline] = useState(0);
  const [serverStatus, setServerStatus] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadServerStatus() {
      try {
        const res = await fetch('/api/server/status', { cache: 'no-store' });
        const data = await res.json();

        if (!cancelled && res.ok && data.success) {
          setPlayersOnline(Number(data.playersOnline || 0));
          setServerStatus(data.status === 'online' ? 'ONLINE' : 'OFFLINE');
        }
      } catch {
        if (!cancelled) {
          setServerStatus('OFFLINE');
          setPlayersOnline(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingStats(false);
        }
      }
    }

    loadServerStatus();
    const interval = window.setInterval(loadServerStatus, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const stats = [
    {
      label: 'Status do Reino',
      value: serverStatus,
      icon: Activity,
      color: serverStatus === 'ONLINE' ? 'text-emerald-400' : 'text-red-400',
      glow: 'shadow-emerald-500/20',
      bgGlow: serverStatus === 'ONLINE' ? 'bg-emerald-500/10' : 'bg-red-500/10'
    },
    {
      label: 'Guerreiros Ativos',
      value: isLoadingStats ? '...' : playersOnline.toLocaleString('pt-BR'),
      icon: Users,
      color: 'text-primary',
      glow: 'shadow-primary/20',
      bgGlow: 'bg-[#FF6A00]/10'
    },
    {
      label: 'Status do Patcher',
      value: 'PROTEGIDO',
      icon: Cpu,
      color: 'text-highlight',
      glow: 'shadow-highlight/20',
      bgGlow: 'bg-highlight/10'
    },
  ];

  return (
    <section className="relative z-20 py-10 max-w-7xl mx-auto px-4">
      {/* Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Realtime Server Stats Terminal (Cols 1-7) */}
        <div id="stats-panel" className="lg:col-span-7 lava-glass rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
          {/* Subtle atmosphere background light */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#FF6A00]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h3 className="font-serif text-sm font-bold tracking-widest uppercase text-stone-200">
                Estados Críticos da Forja
              </h3>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((st, idx) => {
                const Icon = st.icon;
                return (
                  <div key={idx} className="bg-black/40 border border-white/5 rounded-lg p-3.5 flex flex-col items-center justify-center text-center">
                    <div className={`p-2 rounded-full ${st.bgGlow} mb-2`}>
                      <Icon className={`w-4 h-4 ${st.color}`} />
                    </div>
                    <span className="text-[10px] tracking-wide text-stone-400 uppercase font-sans mb-1 block">
                      {st.label}
                    </span>
                    <span className={`font-serif text-sm md:text-base font-black tracking-widest ${st.color} drop-shadow-md`}>
                      {st.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rates banner */}
          <div className="mt-5 p-3.5 bg-gradient-to-r from-[#150A04] to-black border border-[#FF6A00]/10 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-highlight animate-spin-slow" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#FFD700] block font-bold">
                  Melhor servidor PvP da atualidade
                </span>
                <span className="text-[11px] font-sans text-[#BCAD9E]">
                  Servidor 100% PvP: nao precisa upar nivel. Pacote do Sabio, skill P e level 99 direto no NPC!
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-sans font-bold text-xs bg-[#FF6A00]/20 text-primary border border-primary/30 py-0.5 px-2 rounded">
              <span>PvP 100%</span>
              <span className="text-white/20">•</span>
              <span>Level 99 no NPC</span>
            </div>
          </div>
        </div>

        {/* Quick Action Interactive Tiles (Cols 8-12) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          
          {/* Action 1: Download */}
          <div 
            onClick={onDownloadClick}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-[#FF6A00]/10 to-[#C92A00]/5 border border-primary/20 p-5 flex items-center justify-between transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:translate-y-[-2px] lg:h-[72px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-[#FF6A00]/20 text-primary group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <div className="text-align">
                <h4 className="font-serif text-sm font-bold uppercase tracking-wide text-white group-hover:text-primary transition-colors">
                  Baixar Patcher
                </h4>
                <p className="text-[10px] font-sans text-stone-400 hidden lg:block">
                  Acesso rápido e downloads de patchers seguros
                </p>
              </div>
            </div>
            <span className="text-stone-600 group-hover:text-primary/70 transition-colors hidden lg:block">→</span>
          </div>

          {/* Action 2: Register */}
          <div 
            onClick={onRegisterClick}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-highlight/10 to-transparent border border-highlight/20 p-5 flex items-center justify-between transition-all duration-300 hover:border-highlight/50 hover:shadow-lg hover:shadow-highlight/5 hover:translate-y-[-2px] lg:h-[72px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-highlight/25 text-highlight group-hover:scale-110 transition-transform">
                <Swords className="w-5 h-5" />
              </div>
              <div className="text-align">
                <h4 className="font-serif text-sm font-bold uppercase tracking-wide text-white group-hover:text-highlight transition-colors">
                  Criar Conta
                </h4>
                <p className="text-[10px] font-sans text-stone-400 hidden lg:block">
                  Receba kit iniciante exclusivo de graça
                </p>
              </div>
            </div>
            <span className="text-stone-600 group-hover:text-highlight/70 transition-colors hidden lg:block">→</span>
          </div>

          {/* Action 3: Shop */}
          <div 
            onClick={onShopClick}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 p-5 flex items-center justify-between transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 hover:translate-y-[-2px] lg:h-[72px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-500/25 text-emerald-400 group-hover:scale-110 transition-transform">
                <Coins className="w-5 h-5" />
              </div>
              <div className="text-align">
                <h4 className="font-serif text-sm font-bold uppercase tracking-wide text-white group-hover:text-emerald-400 transition-colors">
                  Adquirir Cash
                </h4>
                <p className="text-[10px] font-sans text-stone-400 hidden lg:block">
                  Adestre montarias e ganhe 15% bônus no Pix
                </p>
              </div>
            </div>
            <span className="text-stone-600 group-hover:text-emerald-400/70 transition-colors hidden lg:block">→</span>
          </div>

        </div>

      </div>
    </section>
  );
}
