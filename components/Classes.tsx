'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Eye, Gamepad2, Heart, Award, Sparkles, BookOpen } from 'lucide-react';
import { GAME_CLASSES, GameClass } from '@/lib/game-data';

export default function Classes() {
  const [selectedClassId, setSelectedClassId] = useState<string>('guerreiro');
  const [activeSkillIndex, setActiveSkillIndex] = useState<number>(0);

  const selectedClass = GAME_CLASSES.find((c) => c.id === selectedClassId) || GAME_CLASSES[0];

  const attributeLabels: Record<string, string> = {
    str: 'Força (STR)',
    int: 'Inteligência (INT)',
    dex: 'Destreza (DEX)',
    vit: 'Vitalidade (VIT)',
  };

  return (
    <section id="classes" className="relative z-20 py-20 bg-gradient-to-b from-[#080402] to-[#150A04]/90 max-w-7xl mx-auto px-4">
      {/* SECTION HEADER */}
      <div className="text-center mb-16">
        <span className="text-primary font-mono text-xs uppercase tracking-widest block mb-1">
          Caminho das Armas
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl font-extrabold uppercase tracking-wider text-white">
          Habilidades
        </h2>
        <p className="max-w-xl mx-auto text-[#A29485] text-sm mt-3 leading-relaxed">
          Quatro caminhos espirituais lendários. Escolha sua classe e domine suas habilidades supremas de batalha.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CLASS TOGGLERS GRID */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col flex-wrap gap-3">
          {GAME_CLASSES.map((cls) => (
            <button
              key={cls.id}
              onClick={() => {
                setSelectedClassId(cls.id);
                setActiveSkillIndex(0);
              }}
              className={`flex-1 min-w-[120px] lg:w-full text-left p-4 rounded-lg border transition-all duration-300 flex items-center gap-3.5 cursor-pointer backdrop-blur-md ${
                selectedClassId === cls.id
                  ? 'bg-gradient-to-r from-primary/10 to-transparent border-[#FF6A00] text-[#FF6A00] shadow-md shadow-primary/10'
                  : 'bg-[#150A04]/40 border-white/5 text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="w-10 h-10 rounded bg-[#080402] border border-white/5 flex items-center justify-center text-xl shadow-inner select-none">
                {cls.icon}
              </div>
              <div className="hidden sm:block">
                <span className="block font-serif text-base font-bold tracking-wider leading-none">
                  {cls.name}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#BCAD9E] block mt-1">
                  {cls.difficulty === 5 ? 'Hardcore' : cls.difficulty >= 3 ? 'Avançado' : 'Normal'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* ACTIVE CLASS DISPLAY CARD */}
        <div className="lg:col-span-9 bg-gradient-to-b from-[#150A04]/50 to-[#0C0603]/80 border border-primary/15 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedClass.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              
              {/* LORE & DESCRIPTION */}
              <div className="border-b border-white/5 pb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase mb-2">
                  <Award className="w-4 h-4" /> Especialização Primária
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedClass.icon}</span>
                  <h3 className="font-serif text-3xl sm:text-4xl font-black uppercase text-white tracking-widest">
                    {selectedClass.name}
                  </h3>
                </div>
                <p className="text-xs text-stone-500 font-serif mt-1.5 italic">
                  Dificuldade de Combate: {selectedClass.difficulty}/5
                </p>
                <p className="text-sm text-[#BCAD9E] leading-relaxed font-sans mt-4 max-w-3xl whitespace-pre-line">
                  {selectedClass.description}
                </p>
              </div>

              {/* Spellbook Abilities Section */}
              <div>
                <h4 className="font-serif text-sm font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-1.5 mb-5">
                  <BookOpen className="w-4 h-4 text-primary" /> Habilidades da Classe
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedClass.skills.map((skill, sIdx) => {
                    const isActive = activeSkillIndex === sIdx;
                    return (
                      <div
                        key={sIdx}
                        onClick={() => setActiveSkillIndex(sIdx)}
                        className={`group p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                          isActive
                            ? 'bg-primary/5 border-primary text-white shadow-lg'
                            : 'bg-black/30 border-white/5 text-stone-400 hover:text-white hover:border-white/20 hover:bg-black/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-mono select-none font-bold ${
                                isActive ? 'bg-primary text-black border-primary' : 'bg-[#080402] border-white/10 text-stone-300'
                              }`}>
                                {sIdx + 1}
                              </div>
                              <span className="font-serif text-base font-bold tracking-wide">
                                {skill.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                              {skill.type}
                            </span>
                          </div>

                          <p className="text-[#BCAD9E] text-xs leading-relaxed font-sans mb-1 mt-1">
                            {skill.description}
                          </p>
                          <p className="text-[10.5px] text-stone-500 font-mono italic">
                            &ldquo;{skill.flair}&rdquo;
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
