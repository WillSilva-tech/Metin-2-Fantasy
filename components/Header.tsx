'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, LogOut, Menu, X, Shield, LayoutDashboard, User } from 'lucide-react';

interface HeaderProps {
  user: any;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onScrollTo: (id: string) => void;
}

const formatCash = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function Header({ user, onLogout, onOpenLogin, onOpenRegister, onScrollTo }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdminUnlocked = false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 55);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Início', target: 'inicio' },
    { label: 'Apresentação', target: 'noticias' },
    { label: 'Classes', target: 'classes' },
    { label: 'Sistemas', target: 'sistemas' },
    { label: 'Eventos', target: 'eventos' },
    { label: 'Rankings', target: 'rankings' },
    { label: 'Loja Cash', target: 'loja' },
    { label: 'Downloads', target: 'downloads' },
  ];

  const handleMobileNav = (target: string) => {
    setIsMobileMenuOpen(false);
    onScrollTo(target);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-bg-primary/90 border-b border-primary/25 shadow-lg shadow-black/40 backdrop-blur-md py-3'
            : 'bg-transparent py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo Brand Brand */}
          <div 
            onClick={() => onScrollTo('inicio')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img 
              src="/images/fantasy2_logo.png" 
              alt="Fantasy2 Logo" 
              referrerPolicy="no-referrer"
              className="h-9 md:h-11 w-auto object-contain drop-shadow-[0_2px_10px_rgba(251,106,0,0.3)] select-none pointer-events-none group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Nav Items Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onScrollTo(item.target)}
                className="font-serif text-sm uppercase tracking-wider text-[#D5CDBC] hover:text-[#FF6A00] hover:lava-text-glow transition-all cursor-pointer font-medium"
              >
                {item.label}
              </button>
            ))}
            {/* Direct Link to Discord Simulated */}
            <a
              href="https://discord.gg/p9RqwmhZsp"
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif text-sm uppercase tracking-wider text-[#9B90D8] hover:text-[#A79DFF] transition-all font-medium"
            >
              Discord
            </a>
          </nav>

          {/* User CTA and Access Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 bg-bg-secondary/60 py-1.5 px-3 rounded-md border border-[#FF6A00]/20 max-w-sm">
                <div 
                  onClick={() => onScrollTo('dashboard')}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-90"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-highlight to-primary flex items-center justify-center p-[1px]">
                    <div className="w-full h-full rounded-full bg-bg-primary flex items-center justify-center text-xs text-primary font-bold">
                      {user.login?.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-xs text-[#E5D5C5] font-semibold truncate max-w-[80px]">
                      {user.login}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-highlight font-mono">
                      <Coins className="w-2.5 h-2.5 text-highlight animate-pulse" />
                      {formatCash(Number(user.cashBalance))} CASH
                    </span>
                  </div>
                </div>

                <div className="w-px h-6 bg-white/10" />

                <button
                  onClick={() => onScrollTo('dashboard')}
                  title="Área do Jogador"
                  className="text-white hover:text-primary transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </button>

                <button
                  onClick={onLogout}
                  title="Sair"
                  className="text-stone-400 hover:text-lava transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  id="header-login-btn"
                  onClick={onOpenLogin}
                  className="px-5 py-2 rounded text-sm text-[#FF6A00] bg-transparent hover:bg-[#FF6A00]/5 border border-primary/20 hover:border-primary/50 transition-all font-medium cursor-pointer"
                >
                  Entrar
                </button>
                <button
                  id="header-register-btn"
                  onClick={onOpenRegister}
                  className="px-5 py-2 rounded text-sm font-semibold text-black bg-gradient-to-r from-primary to-highlight hover:shadow-md hover:shadow-primary/20 transition-all cursor-pointer shadow-sm"
                >
                  Criar Conta
                </button>
              </div>
            )}
          </div>

          {/* Toggle Mobile Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded bg-bg-secondary border border-white/10 text-[#C1B2A1] hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[68px] left-0 right-0 z-40 bg-bg-primary/95 border-b border-primary/30 backdrop-blur-lg shadow-2xl py-6 px-4 lg:hidden flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2 font-serif text-center uppercase tracking-wider text-base">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleMobileNav(item.target)}
                  className="py-2.5 text-[#D5CDBC] hover:text-[#FF6A00] transition-colors border-b border-white/5"
                >
                  {item.label}
                </button>
              ))}
              <a
                href="https://discord.gg/p9RqwmhZsp"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 text-[#9185EE] hover:text-white transition-colors border-b border-white/5"
              >
                Discord (Comunidade)
              </a>
            </div>

            {/* Simulated Auth in Mobile Drawer */}
            <div className="mt-4 flex flex-col justify-center gap-2.5">
              {user ? (
                <div className="flex flex-col items-center gap-3 bg-[#150A04] p-4 rounded-md border border-[#FF6A00]/25">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-highlight to-primary flex p-[1px] items-center justify-center">
                      <div className="w-full h-full rounded-full bg-bg-primary flex items-center justify-center text-sm font-bold text-primary">
                        {user.login?.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="block text-sm text-[#E5D5C5] font-semibold">{user.login}</span>
                      <span className="flex items-center gap-0.5 text-xs text-highlight font-mono">
                        <Coins className="w-3.5 h-3.5" />
                        {formatCash(Number(user.cashBalance))} CASH
                      </span>
                    </div>
                  </div>
                  <div className="w-full grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => handleMobileNav('dashboard')}
                      className="flex items-center justify-center gap-1.5 py-2 rounded text-xs bg-[#FF6A00]/10 border border-primary/30 text-[#FF6A00]"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Painel
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 rounded text-xs bg-red-950/20 border border-red-900/30 text-red-500"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sair
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="w-full py-3 rounded text-center text-[#FF6A00] border border-primary/30 bg-bg-secondary font-serif uppercase tracking-wider"
                  >
                    Entrar no Painel
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenRegister();
                    }}
                    className="w-full py-3 rounded text-center text-black bg-gradient-to-r from-primary to-highlight font-serif font-bold uppercase tracking-wider"
                  >
                    Criar Nova Conta
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
