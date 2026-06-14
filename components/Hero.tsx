'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Flame, Swords, UserPlus } from 'lucide-react';

interface HeroProps {
  onRegisterClick: () => void;
  onDownloadClick: () => void;
}

export default function Hero({ onRegisterClick, onDownloadClick }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated Volcanic Embers Canvas Particle Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      fadeSpeed: number;
      color: string;
    }> = [];

    const createParticle = () => {
      const size = Math.random() * 3 + 1;
      const x = Math.random() * width;
      const y = height + Math.random() * 50;
      const speedY = -(Math.random() * 1.5 + 0.5);
      const speedX = Math.random() * 0.8 - 0.4;
      const opacity = Math.random() * 0.8 + 0.2;
      const fadeSpeed = Math.random() * 0.002 + 0.001;
      
      const colors = [
        'rgba(255, 106, 0, ', // Gold orange
        'rgba(201, 42, 0, ',  // Lava red
        'rgba(255, 215, 0, ',  // Highlight gold
        'rgba(140, 20, 0, '   // Charcoal ember
      ];
      const colorPrefix = colors[Math.floor(Math.random() * colors.length)];

      particles.push({
        x,
        y,
        size,
        speedY,
        speedX,
        opacity,
        fadeSpeed,
        color: colorPrefix,
      });
    };

    // Pre-populate particles so screen is not empty at start
    for (let i = 0; i < 60; i++) {
      createParticle();
      particles[i].y = Math.random() * height;
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Randomly spawn new embers
      if (particles.length < 120 && Math.random() < 0.3) {
        createParticle();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity -= p.fadeSpeed;

        // Draw particle with glowing aura
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.shadowBlur = p.size * 2;
        ctx.shadowColor = 'rgba(255, 106, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Recycle dead particles
        if (p.opacity <= 0 || p.y < 0 || p.x < 0 || p.x > width) {
          particles.splice(i, 1);
          i--;
        }
      }
      ctx.shadowBlur = 0; // reset shadow for next draws

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div id="inicio" className="relative w-full h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-[#080402]">
      {/* Background Cinematic Artwork with Dark Gradients */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[6000ms] scale-105 select-none pointer-events-none"
        style={{
          backgroundImage: `url('/images/fantasy2_hero_wallpaper.png')`,
        }}
      />
      
      {/* Heavy Cinematic Atmosphere Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080402] via-transparent to-transparent opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080402] via-[#080402]/40 to-[#080402]" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#080402]/50 to-[#080402] opacity-85" />

      {/* Sparks Canvas Overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none mix-blend-screen z-10" />

      {/* Main Hero Content */}
      <div className="relative z-20 max-w-4xl px-4 text-center mt-12">
        {/* Fantasy Logo Title Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs uppercase tracking-widest font-mono select-none"
        >
          <Flame className="w-3 h-3 text-primary animate-pulse" />
          SERVIDOR PRIVADO BRASILEIRO
        </motion.div>

        {/* Epic Fantasy2 Logo Branding Headliner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mb-4 flex justify-center"
        >
          <img 
            src="/images/fantasy2_logo.png" 
            alt="Fantasy2 - O Início de uma Nova Aventura" 
            referrerPolicy="no-referrer"
            className="w-full max-w-[480px] md:max-w-[620px] h-auto object-contain select-none pointer-events-none drop-shadow-[0_12px_30px_rgba(251,106,0,0.4)]"
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="max-w-xl mx-auto mt-6 text-[#E5D5C5] text-sm sm:text-base leading-relaxed tracking-wide drop-shadow-md"
        >
          Explore um império lendário em guerra, dome o fogo ancestral das montanhas vulcânicas do leste e conquiste a glória eterna liderando um dos três reinos.
        </motion.p>

        {/* CTA Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <button 
            id="btn-play-hero"
            onClick={onDownloadClick}
            className="group relative w-full sm:w-auto px-10 py-4 font-serif font-bold text-lg uppercase tracking-wider text-[#080402] bg-gradient-to-r from-primary to-highlight rounded border border-primary/40 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shine_0.8s_ease-in-out_1]" />
            <span className="relative flex items-center justify-center gap-2">
              <Swords className="w-5 h-5" />
              Jogar Agora
            </span>
          </button>

          <button 
            id="btn-register-hero"
            onClick={onRegisterClick}
            className="group w-full sm:w-auto px-10 py-4 font-serif font-bold text-lg uppercase tracking-wider text-white bg-bg-secondary/80 hover:bg-bg-secondary border border-primary/30 hover:border-primary/80 rounded transition-all duration-300 backdrop-blur-md cursor-pointer flex items-center justify-center gap-2 shadow-inner"
          >
            <UserPlus className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            Criar Conta
          </button>
        </motion.div>
      </div>

      {/* Floating Sparkles Animated CSS Layer */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-xs text-[#8F7D6D] tracking-widest uppercase font-mono animate-bounce select-none">
        <span>Role para descobrir mais</span>
        <div className="w-1 h-8 rounded bg-gradient-to-b from-[#FF6A00] to-transparent" />
      </div>
    </div>
  );
}
