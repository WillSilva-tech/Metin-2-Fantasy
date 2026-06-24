'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Swords, Shield, Coins, AlertTriangle, Key, 
  RefreshCw, Terminal, CheckCircle2, Ticket 
} from 'lucide-react';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import StatsAndQuick from '@/components/StatsAndQuick';
import NewsAndTrailer from '@/components/NewsAndTrailer';
import Classes from '@/components/Classes';
import SystemsAndEvents from '@/components/SystemsAndEvents';
import Rankings from '@/components/Rankings';
import CashStoreAndCheckout from '@/components/CashStoreAndCheckout';
import PlayerDashboard from '@/components/PlayerDashboard';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';

const formatCash = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function Home() {
  // Authentication & Profile States
  const [user, setUser] = useState<any>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Voucher / Coupon system
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  // Server rate configurations
  const [isDoubleDropActive, setIsDoubleDropActive] = useState(false);

  // Financial archives states
  const [transactions, setTransactions] = useState<Array<{ date: string; method: string; amount: number; cash: number; status: 'Pago' | 'Pendente' | 'Cancelado' }>>([
    { date: '2026-05-28', method: 'PIX', amount: 20.0, cash: 20000, status: 'Pago' },
    { date: '2026-03-15', method: 'BOLETO', amount: 10.0, cash: 10000, status: 'Pago' }
  ]);

  // Synchronize state with clients localStorage to keep things persistent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('fantasy2_user_session');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setTimeout(() => setUser(parsed), 0);
        } catch (_) {}
      }

      const cachedTrx = localStorage.getItem('fantasy2_transactions');
      if (cachedTrx) {
        try {
          const parsedTrx = JSON.parse(cachedTrx);
          setTimeout(() => setTransactions(parsedTrx), 0);
        } catch (_) {}
      }
    }
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fantasy2_user_session', JSON.stringify(userData));
      // Smoothly navigate the player directly to their active cabinet dashboard
      setTimeout(() => {
        const el = document.getElementById('dashboard');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250);
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fantasy2_user_session');
    }
  };

  const handleUpdateCash = (addedAmount: number) => {
    setUser((prev: any) => {
      if (!prev) return prev;
      const next = { ...prev, cashBalance: Number(prev.cashBalance || 0) + addedAmount };
      if (typeof window !== 'undefined') {
        localStorage.setItem('fantasy2_user_session', JSON.stringify(next));
      }
      return next;
    });
  };

  const handleRecordTransaction = (newTrx: { date: string; method: string; amount: number; cash: number; status: 'Pago' | 'Pendente' | 'Cancelado' }) => {
    setTransactions((prev) => {
      const next = [newTrx, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('fantasy2_transactions', JSON.stringify(next));
      }
      return next;
    });
  };

  // Redeem code logical checks
  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError(null);
    setVoucherSuccess(null);

    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    const code = voucherInput.toUpperCase().trim();
    if (!code) {
      setVoucherError('Por favor, informe seu cupom.');
      return;
    }

    try {
      const res = await fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (user.sessionToken || ''),
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setVoucherError(data.error || 'Codigo de cupom invalido ou ja utilizado.');
        return;
      }

      const prize = Number(data.addedCash || 0);
      const nextUser = { ...user, cashBalance: Number(data.newCashBalance || user.cashBalance || 0) };
      setUser(nextUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fantasy2_user_session', JSON.stringify(nextUser));
      }

      handleRecordTransaction({
        date: new Date().toISOString().substring(0, 10),
        method: 'CUPOM / PROMO',
        amount: 0.0,
        cash: prize,
        status: 'Pago'
      });

      setVoucherSuccess(data.message || `Cupom [${code}] ativado! Creditamos +${formatCash(prize)} CASH na sua conta.`);
      setVoucherInput('');
    } catch {
      setVoucherError('Erro de conexao com o servidor. Tente novamente.');
    }
  };

  const handleAddVoucherFromConsole = (code: string, amount: number) => {
    console.warn('Cupons sao validados pelo servidor.', code, amount);
  };

  const handleAddNewsFromConsole = (title: string, category: 'update' | 'event' | 'maintenance', excerpt: string) => {
    // We dynamically update local state list by adding logs to the webhook
    fetch('/api/payment/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `evt_news_${Math.floor(Math.random() * 1000000)}`,
        type: 'payment_intent.created',
        data: {
          object: {
            id: `news_${Date.now()}`,
            amount: 0,
            metadata: {
              accountLogin: 'GM_CONSOLE',
              packageId: 'news_publishing',
              cashAmount: 0,
              paymentMethod: `News published: [${title}]`
            }
          }
        }
      })
    });
  };

  // Scroll handler smoothly targeting IDs
  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-[100vh] bg-bg-primary text-white overflow-x-hidden selection:bg-primary selection:text-black">
      
      {/* PERSISTENT HEADER NAVIGATION */}
      <Header 
        user={user} 
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onScrollTo={handleScrollToSection}
      />

      {/* LANDING PAGES HERO */}
      <Hero 
        onRegisterClick={() => setIsRegisterOpen(true)}
        onDownloadClick={() => handleScrollToSection('downloads')}
      />

      {/* STATS & QUICK LINKS PANELS */}
      <StatsAndQuick 
        onRegisterClick={() => setIsRegisterOpen(true)}
        onDownloadClick={() => handleScrollToSection('downloads')}
        onShopClick={() => handleScrollToSection('loja')}
      />

      {/* NEWS CENTER & VIDEO CINEMATIC TRAILER */}
      <NewsAndTrailer 
        onRegisterClick={() => setIsRegisterOpen(true)}
        user={user}
      />

      {/* CLASS SELECTION CHRONICLES COOLDOWNS */}
      <Classes />

      {/* EXCLUSIVE GAME SYSTEMS CARDS & WEEKLY EVENTS TIMELINE */}
      <SystemsAndEvents />

      {/* CHAMPIONS RANKINGS */}
      <Rankings />

      {/* CASH ACCCOUNT STORE WIZARD & Webhook Log Simulator */}
      <CashStoreAndCheckout 
        user={user}
        onOpenLogin={() => setIsLoginOpen(true)}
        onUpdateCash={handleUpdateCash}
        onRecordTransaction={handleRecordTransaction}
      />

      {/* DYNAMIC VOUCHER CODE REDEEMING CONSOLE */}
      <section className="relative z-20 py-12 bg-gradient-to-b from-[#150A04]/90 to-[#080402] max-w-7xl mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto p-6 bg-gradient-to-b from-bg-secondary/80 to-transparent border border-primary/20 rounded-lg shadow-xl">
          <Ticket className="w-8 h-8 text-highlight mx-auto mb-3 animate-bounce" />
          <h4 className="font-serif text-lg font-bold uppercase tracking-wider text-white">Resgatar Cupom de Cash</h4>
          <p className="text-xs text-[#BCAD9E] font-sans mt-2 mb-4 leading-relaxed">
            Inseriu um código promocional do Discord ou canal WhatsApp? Digite o voucher abaixo para resgatar CASH em tempo real!
          </p>

          <form onSubmit={handleRedeemVoucher} className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value)}
              placeholder="Digite o cupom (Ex: MAGMABOSS)..."
              className="flex-1 bg-[#080402] border border-white/10 rounded px-3 py-2 text-xs uppercase text-white focus:outline-none focus:border-primary/50"
              id="voucher-redeem-input"
            />
            <button
              type="submit"
              className="px-6 py-2 rounded text-stone-900 bg-[#FFD700] hover:bg-[#FFD700]/95 font-serif font-black text-xs uppercase cursor-pointer"
            >
              Ativar Cupom
            </button>
          </form>

          {/* Verification feedback states */}
          <AnimatePresence mode="wait">
            {voucherError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 mt-3 font-semibold">{voucherError}</motion.p>
            )}
            {voucherSuccess && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-emerald-400 mt-3 font-semibold">{voucherSuccess}</motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* EXCLUSIVE CABINET USER WORKSPACE PANEL (Locks unless Auth) */}
      {user && (
        <div id="dashboard">
          <PlayerDashboard 
            user={user} 
            onLogout={handleLogout} 
            transactionsList={transactions}
            onUpdateCash={handleUpdateCash}
            onUpdateUser={setUser}
          />
        </div>
      )}

      {/* EXPLICIT DOWNLOAD ZONE */}
      <section id="downloads" className="relative z-20 py-20 bg-[#080402]/80 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#150A04]/60 border border-primary/10 rounded-xl p-8 shadow-2xl backdrop-blur-md">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-primary font-mono text-[10px] tracking-widest uppercase block">Transmissão Segura NGINX</span>
            <h3 className="font-serif text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-widest">
              Downloads do <span className="text-primary">Cliente</span>
            </h3>
            <p className="text-[#BCAD9E] text-xs font-sans leading-relaxed">
              O instalador oficial carrega nosso patcher criptografado anti-trapaça. Suporta atualizações incrementais automáticas sem necessidade de downloads manuais redundantes de arquivos de mapas.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#download-trigger"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Download do Instalador iniciado! (Simulado por Mirror-1 HighSpeed Cloudflare - 12.8 MB/s)');
                }}
                className="px-6 py-3.5 rounded text-center text-black bg-gradient-to-r from-primary to-highlight font-serif font-black uppercase text-xs tracking-widest cursor-pointer"
              >
                BAIXAR INSTALADOR (Mirror 1)
              </a>
              <a
                href="#download-trigger"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Download do Cliente Direct ZIP inciado! (Simulado por Mirror-2 AWS S3)');
                }}
                className="px-6 py-3.5 rounded text-center text-stone-300 hover:text-white bg-transparent border border-white/10 hover:border-primary cursor-pointer transition-colors text-xs font-serif font-black uppercase tracking-widest"
              >
                BAIXAR ZIP DIRETO (Mirror 2)
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#080402]/85 border border-white/5 rounded-lg p-5 space-y-4">
            <span className="text-[10px] tracking-widest uppercase font-mono text-[#FFD700] font-bold block pb-2 border-b border-white/5">
              Requisitos Recomendados PC
            </span>

            <div className="space-y-2.5 text-xs font-sans">
              <div className="flex justify-between py-1 border-b border-white/5 text-stone-400">
                <span>Processador:</span>
                <span className="text-white font-mono font-bold">Dual Core 2.0 GHz+</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-stone-400">
                <span>Memória RAM:</span>
                <span className="text-white font-mono font-bold">4 GB DDR4</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-stone-400">
                <span>Gráficos:</span>
                <span className="text-white font-mono font-bold">DirectX 9.0c / 1GB VRAM</span>
              </div>
              <div className="flex justify-between py-1 text-stone-400">
                <span>Espaço em HD:</span>
                <span className="text-white font-mono font-bold">5 GB Livres</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER WARN DECORATIONS */}
      <footer className="relative z-20 py-16 mt-16 bg-[#080402] border-t border-white/5 text-center text-xs text-stone-500 font-sans tracking-wide leading-relaxed space-y-4 select-none">
        <div className="flex items-center justify-center gap-1.5 font-serif font-extrabold text-base tracking-widest text-[#A29485]">
          <Flame className="w-4 h-4 text-primary animate-pulse" /> FANTASY2 MMORPG
        </div>
        <p className="max-w-2xl mx-auto px-4">
          © 2026 Fantasy2 Studio. Servidor de uso privado de licença demonstrativa com fins educativos. Todos os direitos reservados. 
          Metin2 é marca registrada intelectual da Webzen Inc. Diablo IV é marca Blizzard Entertainment.
        </p>

        <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-stone-700">
          <span>PIX APROVADO</span>
          <span>•</span>
          <span>STRIPE VERIFIED</span>
          <span>•</span>
          <span className="text-stone-700">STATUS SEGURO</span>
        </div>
      </footer>

      {/* LOGIN & REGISTER MODALS BACKWARD COMPATIBILITY ENDS */}
      <AnimatePresence>
        {isLoginOpen && (
          <LoginModal 
            isOpen={isLoginOpen} 
            onClose={() => setIsLoginOpen(false)} 
            onLoginSuccess={handleLoginSuccess}
            onOpenRegister={() => {
              setIsLoginOpen(false);
              setIsRegisterOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRegisterOpen && (
          <RegisterModal 
            isOpen={isRegisterOpen} 
            onClose={() => setIsRegisterOpen(false)} 
            onRegisterSuccess={handleLoginSuccess}
            onOpenLogin={() => {
              setIsRegisterOpen(false);
              setIsLoginOpen(true);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
