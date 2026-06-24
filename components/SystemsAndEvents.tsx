'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Calendar, Clock, Swords, Shield, Coins, 
  ChevronRight, X, Compass, Globe, Skull, Users, Trophy, Flame
} from 'lucide-react';
import { GAME_SYSTEMS, GAME_EVENTS, GameSystem, GameEvent } from '@/lib/game-data';

export default function SystemsAndEvents() {
  const [selectedSystem, setSelectedSystem] = useState<GameSystem | null>(null);
  const [activeDay, setActiveDay] = useState<string>('Segunda-Feira');
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);

  const SCHEDULE_BY_DAY: Record<string, { time: string; eventId: string; highlight?: boolean }[]> = {
    'Segunda-Feira': [
      { time: '19:00', eventId: 'event-ox' },
      { time: '20:00', eventId: 'event-tanakas' },
      { time: '21:00', eventId: 'event-metins', highlight: true }
    ],
    'Terça-Feira': [
      { time: '19:00', eventId: 'event-caca-gm' },
      { time: '20:00', eventId: 'event-boss' },
      { time: '21:00', eventId: 'event-encruzilhada', highlight: true }
    ],
    'Quarta-Feira': [
      { time: '19:00', eventId: 'event-ox' },
      { time: '20:00', eventId: 'event-tanakas' }
    ],
    'Quinta-Feira': [
      { time: '19:00', eventId: 'event-caca-gm' },
      { time: '20:00', eventId: 'event-boss' }
    ],
    'Sexta-Feira': [
      { time: '19:00', eventId: 'event-ox' },
      { time: '20:00', eventId: 'event-tanakas' }
    ],
    'Sábado': [
      { time: '19:00', eventId: 'event-boss' },
      { time: '20:00', eventId: 'event-pvp', highlight: true }
    ],
    'Domingo': [
      { time: '20:00', eventId: 'event-gvg', highlight: true }
    ],
    'Especiais': [
      { time: 'Todos os dias', eventId: 'event-champions-league', highlight: true },
      { time: 'Dias aleatórios', eventId: 'event-insignias' }
    ]
  };

  const getEventIcon = (id: string, sizeClass = "w-5 h-5") => {
    switch (id) {
      case 'event-ox':
        return <Sparkles className={`${sizeClass} text-yellow-400`} />;
      case 'event-caca-gm':
        return <Compass className={`${sizeClass} text-purple-400`} />;
      case 'event-tanakas':
        return <Coins className={`${sizeClass} text-emerald-400`} />;
      case 'event-boss':
        return <Skull className={`${sizeClass} text-red-500`} />;
      case 'event-metins':
        return <Flame className={`${sizeClass} text-[#FF6A00] animate-pulse`} />;
      case 'event-encruzilhada':
        return <Swords className={`${sizeClass} text-blue-400`} />;
      case 'event-insignias':
        return <Trophy className={`${sizeClass} text-amber-400`} />;
      case 'event-champions-league':
        return <Trophy className={`${sizeClass} text-yellow-500 animate-pulse`} />;
      case 'event-pvp':
        return <Swords className={`${sizeClass} text-rose-500`} />;
      case 'event-gvg':
        return <Shield className={`${sizeClass} text-indigo-400`} />;
      default:
        return <Calendar className={`${sizeClass} text-primary`} />;
    }
  };

  const activeDayEvents = SCHEDULE_BY_DAY[activeDay] || [];

  const getSystemIcon = (id: string, sizeClass = "w-14 h-14") => {
    switch (id) {
      case 'system-trajes':
        return <Sparkles className={`${sizeClass} text-[#FFD700] drop-shadow-[0_0_12px_rgba(255,215,0,0.65)] animate-pulse`} />;
      case 'system-bosses':
        return <Skull className={`${sizeClass} text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.65)]`} />;
      case 'system-wars':
        return <Swords className={`${sizeClass} text-[#FF6A00] drop-shadow-[0_0_12px_rgba(255,106,0,0.65)]`} />;
      case 'system-champions':
        return <Trophy className={`${sizeClass} text-yellow-500 drop-shadow-[0_0_12px_rgba(234,179,8,0.65)] animate-pulse`} />;
      case 'system-metins':
        return <Flame className={`${sizeClass} text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.65)] animate-pulse`} />;
      case 'system-rankings':
        return <Trophy className={`${sizeClass} text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.65)]`} />;
      case 'system-torneios':
        return <Swords className={`${sizeClass} text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.65)]`} />;
      default:
        return <Sparkles className={`${sizeClass} text-[#FF6A00]`} />;
    }
  };

  return (
    <section id="sistemas" className="relative z-20 py-20 bg-gradient-to-b from-[#150A04]/90 to-[#080402] max-w-7xl mx-auto px-4">
      {/* SECTION HEADER - SYSTEMS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/10 pb-8 mb-12">
        <div>
          <span className="text-primary font-mono text-xs uppercase tracking-widest block mb-1">
            Diferenciais de Elite
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-extrabold uppercase tracking-wider text-white">
            Sistemas <span className="text-primary">Exclusivos</span>
          </h2>
          <p className="text-[#A29485] text-sm mt-3 max-w-lg leading-relaxed">
            Mecânicas premium inovadoras desenvolvidas pelo nosso time técnico especial para elevar a competitividade.
          </p>
        </div>
      </div>

      {/* SYSTEMS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {GAME_SYSTEMS.map((sys) => (
          <div
            key={sys.id}
            className="group bg-[#150A04]/50 border border-[#FF6A00]/10 hover:border-[#FF6A00]/30 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-2xl flex flex-col justify-between"
          >
            <div>
              {/* Premium Icon Header Box */}
              <div className="relative h-48 flex items-center justify-center bg-radial from-[#1A0A04] via-[#0E0602] to-[#080402] border-b border-white/5 overflow-hidden">
                {/* Background ambient particle overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute w-36 h-36 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                
                {/* Magical runic frame surrounding the system icon */}
                <div className="relative p-7 rounded-2xl border border-white/5 bg-[#150D06]/40 shadow-inner group-hover:border-[#FF6A00]/30 group-hover:scale-110 transition-all duration-300">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {getSystemIcon(sys.id)}
                </div>
              </div>

              {/* Content text */}
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {sys.title}
                </h3>
                <p className="text-xs text-[#BCAD9E] font-sans mt-3 leading-relaxed">
                  {sys.description}
                </p>
              </div>
            </div>

            {/* CTA action trigger */}
            <div className="p-6 pt-0">
              <button
                onClick={() => setSelectedSystem(sys)}
                className="w-full text-center py-2.5 rounded bg-bg-primary text-xs font-serif font-bold tracking-wider text-white border border-[#FF6A00]/25 hover:border-primary hover:bg-primary/10 transition-all cursor-pointer font-semibold shadow-inner"
              >
                Saiba Mais
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION HEADER - EVENTS CALENDAR */}
      <div id="eventos" className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/10 pb-8 mb-12">
        <div>
          <span className="text-primary font-mono text-xs uppercase tracking-widest block mb-1">
            Programação do Império
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-extrabold uppercase tracking-wider text-white">
            Agenda de <span className="text-primary">Eventos</span>
          </h2>
          <p className="text-[#A29485] text-sm mt-3 max-w-lg leading-relaxed">
            Cronograma automático semanal de invasões de world boss, double rates territoriais, e torneios pvp oficiais.
          </p>
        </div>
      </div>

      {/* EVENTS TIMELINE SCHEDULE GRID */}
      <div className="bg-[#150A04]/40 border border-primary/10 rounded-lg overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
          {/* Weekday Selector sidebar */}
          <div className="lg:col-span-4 p-6 sm:p-8 bg-black/30 flex flex-col justify-between">
            <div>
              <span className="text-[#FF6A00] font-mono text-[10px] tracking-widest uppercase block mb-2">Cronograma Semanal</span>
              <h4 className="font-serif text-2xl font-bold text-white mb-6">Agenda de Eventos</h4>
              
              <div className="space-y-1.5">
                {Object.keys(SCHEDULE_BY_DAY).map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`w-full text-left px-4 py-3 rounded-md border text-xs font-serif tracking-wide transition-all uppercase flex items-center justify-between cursor-pointer ${
                      activeDay === day
                        ? 'bg-gradient-to-r from-primary/15 to-highlight/5 border-primary/40 text-primary font-bold shadow-[0_0_12px_rgba(255,106,0,0.15)]'
                        : 'bg-black/20 hover:bg-black/40 border-white/5 text-[#BCAD9E] hover:text-white'
                    }`}
                  >
                    <span>{day}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeDay === day ? 'translate-x-1 text-primary' : 'text-[#6D5E50]'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse inline-block" />
                <span className="text-white font-semibold">🟢 Eventos 100% Automáticos</span>
              </div>
              <p className="text-[11px] text-[#BCAD9E] leading-relaxed">
                Selecione o dia da semana ao lado para visualizar os horários e abrir o guia operacional de cada evento.
              </p>
            </div>
          </div>

          {/* EVENTS SLOTS CARD SCROLLER */}
          <div className="lg:col-span-8 p-6 sm:p-8 space-y-4 max-h-[420px] overflow-y-auto">
            {activeDayEvents.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xs text-stone-500 font-mono">Nenhum evento agendado para este dia.</p>
              </div>
            ) : (
              activeDayEvents.map((slot) => {
                const evt = GAME_EVENTS.find((e) => e.id === slot.eventId);
                if (!evt) return null;
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-black/40 border transition-all cursor-pointer group ${
                      slot.highlight 
                        ? 'border-[#FF6A00]/25 hover:border-[#FF6A00]/50 bg-radial from-[#1E0E06]/40 via-black/40 to-black/40' 
                        : 'border-white/5 hover:border-[#FF6A00]/20'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded bg-[#0F0804] flex items-center justify-center border border-white/10 group-hover:border-[#FF6A00]/40 transition-colors shadow-inner shrink-0">
                        {getEventIcon(evt.id, "w-5.5 h-5.5")}
                      </div>
                      <div>
                        <h5 className="font-serif text-[#FFFFFF] font-extrabold text-sm sm:text-base group-hover:text-primary transition-colors flex items-center gap-1.5">
                          <span>{evt.title}</span>
                          {slot.highlight && (
                            <span className="text-[9px] uppercase font-mono bg-[#FF6A00]/20 border border-[#FF6A00]/40 text-[#FF6A00] px-1.5 py-0.2 rounded font-bold">
                              Destaque
                            </span>
                          )}
                        </h5>
                        <p className="text-xs text-[#BCAD9E] mt-1 leading-relaxed max-w-md line-clamp-1">
                          {evt.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-mono tracking-wider text-stone-500 block">Horário</span>
                        <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" /> {slot.time}
                        </span>
                      </div>

                      <div className="w-px h-6 bg-white/10 hidden sm:block" />

                      <span className="px-3.5 py-1.5 rounded text-[10px] font-serif font-bold tracking-wider text-black bg-primary uppercase group-hover:scale-[1.03] transition-transform shadow-md">
                        Ver Guia
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* SYSTEM LORE EXPLAIN-DRAWER MODAL */}
      <AnimatePresence>
        {selectedSystem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSystem(null)}
              className="absolute inset-0 bg-[#080402]/95 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#150A04] border border-[#FF6A00]/25 rounded-lg shadow-2xl overflow-hidden z-10"
            >
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-mono text-primary font-semibold">FANTASY2 SISTEMAS</span>
                <button
                  onClick={() => setSelectedSystem(null)}
                  className="p-1 rounded bg-[#080402] border border-white/10 text-stone-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Large Premium Glowing Icon Header */}
                <div className="relative h-48 w-full flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#1A0A04]/80 via-[#0B0402]/95 to-[#1c0e06]/85 border border-white/5 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#FF6A00]/5 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute w-44 h-44 rounded-full bg-primary/5 blur-3xl" />
                  <div className="relative p-8 rounded-full border border-[#FF6A00]/10 bg-[#150D06]/50 shadow-inner">
                    {getSystemIcon(selectedSystem.id)}
                  </div>
                </div>

                <h3 className="font-serif text-2xl font-black uppercase text-white tracking-widest">
                  {selectedSystem.title}
                </h3>

                <p className="text-[#BCAD9E] text-xs font-sans leading-relaxed">
                  {selectedSystem.description}
                </p>

                <div className="w-full h-px bg-white/10" />

                <div className="bg-[#080402] rounded p-4 border border-white/5 space-y-2">
                  <span className="text-[10px] tracking-widest text-[#FF6A00] font-mono block uppercase">Como funciona em detalhes</span>
                  <p className="text-xs text-stone-300 leading-relaxed font-sans font-medium">
                    {selectedSystem.fullDetails}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-white/5 bg-[#080402]/60 text-right">
                <button
                  onClick={() => setSelectedSystem(null)}
                  className="px-6 py-2 rounded text-xs font-bold text-black bg-primary uppercase tracking-wider cursor-pointer"
                >
                  Fechar Manual
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EVENT LORE EXPLAIN MODAL */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-[#080402]/95 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#150A04]/95 border border-[#FF6A00]/25 rounded-lg shadow-2xl overflow-hidden z-10"
            >
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs">{selectedEvent.emoji || '👉'}</span>
                  <span className="text-[10px] uppercase tracking-widest font-mono text-primary font-semibold">Guia de Eventos</span>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded bg-[#080402] border border-white/10 text-stone-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-xl border border-[#FF6A00]/15 bg-black/40 shrink-0">
                    {getEventIcon(selectedEvent.id, "w-10 h-10")}
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-black uppercase text-white tracking-wider">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-primary font-mono text-xs mt-1">
                      Horário: {selectedEvent.time}
                    </p>
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                  <p className="text-[#BCAD9E] text-xs sm:text-sm leading-relaxed font-sans">
                    {selectedEvent.description}
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  {selectedEvent.howItWorks && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-mono text-[#FF6A00] font-bold block">Como funciona:</span>
                      <p className="text-xs text-stone-300 leading-relaxed bg-[#080402] border border-white/5 rounded p-3 font-sans">
                        {selectedEvent.howItWorks}
                      </p>
                    </div>
                  )}

                  {selectedEvent.dynamics && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-mono text-[#FF6A00] font-bold block">Dinâmica:</span>
                      <p className="text-xs text-stone-300 leading-relaxed bg-[#080402] border border-white/5 rounded p-3 font-sans">
                        {selectedEvent.dynamics}
                      </p>
                    </div>
                  )}

                  {selectedEvent.elimination && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-mono text-[#FF6A00] font-bold block">Eliminação:</span>
                      <p className="text-xs text-stone-300 leading-relaxed bg-[#080402] border border-white/5 rounded p-3 font-sans">
                        {selectedEvent.elimination}
                      </p>
                    </div>
                  )}

                  {selectedEvent.victory && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-mono text-[#FF6A00] font-bold block">Vitória:</span>
                      <p className="text-xs text-stone-300 leading-relaxed bg-[#080402] border border-white/5 rounded p-3 font-sans">
                        {selectedEvent.victory}
                      </p>
                    </div>
                  )}

                  {selectedEvent.rewards && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-mono text-[#FF6A00] font-bold block">Recompensas / Prêmios:</span>
                      <p className="text-xs text-stone-300 leading-relaxed bg-[#080402] border border-white/5 rounded p-3 font-sans">
                        {selectedEvent.rewards}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-white/5 bg-[#080402]/60 text-right">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-2 rounded text-xs font-bold text-black bg-primary uppercase tracking-wider cursor-pointer"
                >
                  Fechar Guia
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
