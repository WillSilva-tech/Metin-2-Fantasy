'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Shield, Key, History, HelpCircle, 
  RefreshCw, CheckCircle, Crown, Gift, Sparkles, 
  Coins, Swords, AlertCircle, Info, Star
} from 'lucide-react';

interface PlayerDashboardProps {
  user: any;
  onLogout: () => void;
  transactionsList: Array<{ date: string; method: string; amount: number; cash: number; status: 'Pago' | 'Pendente' | 'Cancelado' }>;
  onUpdateCash?: (amount: number) => void;
  onUpdateUser?: (updatedUser: any) => void;
}

export default function PlayerDashboard({ 
  user, 
  onLogout, 
  transactionsList,
  onUpdateCash,
  onUpdateUser
}: PlayerDashboardProps) {
  const [editingField, setEditingField] = useState<'password' | 'email' | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Character Desbugger State
  const [unstickingChar, setUnstickingChar] = useState<string | null>(null);
  const [isUnsticking, setIsUnsticking] = useState(false);

  // Daily Reward Claim States
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // VIP Activation State
  const [isActivatingVip, setIsActivatingVip] = useState(false);

  // Check if claimed already on mount/render
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.login) {
      const lastClaimed = localStorage.getItem(`f2_last_reward_claim_${user.login}`);
      const today = new Date().toDateString();
      if (lastClaimed === today) {
        setDailyClaimed(true);
      } else {
        setDailyClaimed(false);
      }
    }
  }, [user?.login]);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setFeedbackMsg({ type: 'error', text: 'Preencha todos os campos para alterar a senha.' });
      return;
    }
    setFeedbackMsg({ type: 'success', text: 'Senha alterada com sucesso! Use a nova senha no próximo login.' });
    setEditingField(null);
    setOldPassword('');
    setNewPassword('');
  };

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      setFeedbackMsg({ type: 'error', text: 'Preencha o novo endereço de e-mail.' });
      return;
    }
    setFeedbackMsg({ type: 'success', text: 'E-mail de cadastro atualizado com sucesso!' });
    setEditingField(null);
    setNewEmail('');
  };

  const handleUnstickChar = (charName: string) => {
    setUnstickingChar(charName);
    setIsUnsticking(true);

    setTimeout(() => {
      setIsUnsticking(false);
      setFeedbackMsg({ 
        type: 'success', 
        text: `O personagem [${charName}] foi teletransportado com sucesso para a Praça Principal (Zona Segura) do seu Reino!` 
      });
      setUnstickingChar(null);
    }, 2000);
  };

  const handleClaimDailyReward = () => {
    if (dailyClaimed || !user?.login) return;
    setIsClaiming(true);

    setTimeout(() => {
      // Randomized reward between 100 and 500 CASH
      const cashReward = Math.floor(Math.random() * 401) + 100; // 100 to 500
      
      if (onUpdateCash) {
        onUpdateCash(cashReward);
      }

      const today = new Date().toDateString();
      if (typeof window !== 'undefined') {
        localStorage.setItem(`f2_last_reward_claim_${user.login}`, today);
      }
      
      setDailyClaimed(true);
      setIsClaiming(false);
      setFeedbackMsg({
        type: 'success',
        text: `🎁 Recompensa Diária Coletada com sucesso! Você obteve +${cashReward} CASH grátis para gastar na Loja Imperial de Itens!`
      });
    }, 1500);
  };

  const handleActivateVIP = () => {
    if (user?.isVip) return;
    const currentCash = Number(user?.cashBalance || 0);
    if (currentCash < 2500) {
      setFeedbackMsg({
        type: 'error',
        text: 'CASH Insuficiente! Você precisa de pelo menos 2.500 CASH para desbloquear o status VIP Imperial.'
      });
      return;
    }

    setIsActivatingVip(true);
    setTimeout(() => {
      if (onUpdateCash) {
        onUpdateCash(-2500);
      }
      
      const updatedUser = {
        ...user,
        isVip: true,
        cashBalance: currentCash - 2500
      };

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('fantasy2_user_session', JSON.stringify(updatedUser));
      }

      setIsActivatingVip(false);
      setFeedbackMsg({
        type: 'success',
        text: '👑 Parabéns! Você ativou o Estatuto de VIP Imperial com sucesso! Aproveite +50% EXP permanente no reino, taxas de drop aprimoradas e brilho exclusivo no seu herói.'
      });
    }, 1500);
  };

  const fakeCharactersDefault = [
    { name: 'Apocalypse⚔️', kingdom: 'Shinsoo', classType: 'Guerreiro', level: 95 },
    { name: 'Arthas💀', kingdom: 'Jinno', classType: 'Shura', level: 82 },
    { name: 'Athena🔮', kingdom: 'Chunjo', classType: 'Shaman', level: 60 }
  ];

  const characters = user?.characters || fakeCharactersDefault;

  const kingdomLabel = (k: string) => {
    switch (k) {
      case 'Shinsoo': return 'reino vermelho';
      case 'Chunjo': return 'reino amarelo';
      case 'Jinno': return 'reino azul';
      default: return k;
    }
  };

  return (
    <section id="dashboard" className="relative z-20 py-20 bg-gradient-to-b from-[#150A04]/90 to-[#080402] max-w-7xl mx-auto px-4">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-primary/15 pb-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="text-stone-500 font-mono text-[10px] uppercase font-semibold">Gabinete Imperial do Herói</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-wider">
              Área do <span className="text-primary">Jogador</span>
            </h2>
          </div>
        </div>

        {/* Dynamic status pill */}
        <div className="flex items-center gap-2 bg-[#FF6A00]/5 border border-primary/10 p-2.5 rounded-lg text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#BCAD9E]">Sessão Ativa: <b className="text-white font-mono">{user?.login}</b></span>
          {user?.isVip && (
            <span className="ml-1 bg-amber-500 text-black px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest font-serif flex items-center gap-1 uppercase">
              <Crown className="w-2.5 h-2.5" /> VIP
            </span>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded border text-xs leading-normal mb-6 flex items-center justify-between ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
            : 'bg-red-950/20 border-red-900/30 text-red-500'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs hover:underline cursor-pointer font-bold">Descartar</button>
        </div>
      )}

      {/* DASHBOARD GRID CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1: SIDE PANELS & PROFILE CONTROLS */}
        <div className="space-y-6">
          
          {/* Main profile brief details card */}
          <div className="bg-gradient-to-b from-bg-secondary to-black/40 border border-[#FF6A00]/20 rounded-xl p-5 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6A00]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-highlight flex items-center justify-center p-[2px]">
                <div className="w-full h-full rounded-full bg-[#080402] flex items-center justify-center font-bold text-primary font-serif">
                  {user?.login?.substring(0, 2).toUpperCase()}
                </div>
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
                  {user?.name || 'Guerreiro da Forja'}
                </h3>
                <span className="block text-[10px] text-[#A29485] font-mono uppercase mt-0.5">Conta: <span className="text-stone-300 font-bold">{user?.login}</span></span>
              </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            <div className="space-y-2 text-xs leading-none">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-stone-500">E-mail Cadastrado:</span>
                <span className="text-stone-300 font-mono">{user?.email || 'test@fantasy2.com.br'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-stone-500">Membro Desde:</span>
                <span className="text-stone-300 font-mono">05 Jun 2026</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-stone-500">Nível do Reino:</span>
                <span className="text-primary font-semibold font-mono">Membro Honorável</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-stone-500">Balanço de CASH:</span>
                <span className="text-highlight font-black font-mono flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> 
                  {user?.cashBalance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || '0'} CASH
                </span>
              </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            <div className="grid grid-cols-2 gap-2 text-xs font-serif font-bold uppercase tracking-wider">
              <button
                onClick={() => {
                  setEditingField('password');
                  setEditingField(editingField === 'password' ? null : 'password');
                }}
                className={`py-2 rounded border transition-colors cursor-pointer text-center ${
                  editingField === 'password'
                    ? 'border-primary text-white bg-primary/10'
                    : 'border-[#FF6A00]/25 hover:border-primary text-stone-300 bg-bg-primary/50'
                }`}
              >
                Mudar Senha
              </button>
              <button
                onClick={() => {
                  setEditingField('email');
                  setEditingField(editingField === 'email' ? null : 'email');
                }}
                className={`py-2 rounded border transition-colors cursor-pointer text-center ${
                  editingField === 'email'
                    ? 'border-primary text-white bg-primary/10'
                    : 'border-[#FF6A00]/25 hover:border-primary text-stone-300 bg-bg-primary/50'
                }`}
              >
                Mudar E-mail
              </button>
            </div>
          </div>

          {/* EDITING FORM PORTALS */}
          {editingField && (
            <div className="bg-[#080402] border border-primary/20 p-5 rounded-lg space-y-4 shadow-xl">
              {editingField === 'password' ? (
                <form onSubmit={handleUpdatePassword} className="space-y-3">
                  <span className="text-[10px] tracking-widest text-[#FF6A00] font-mono block uppercase">Mudar Senha Secreta</span>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 uppercase font-mono block">Senha Atual</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-[#150A04] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 uppercase font-mono block">Nova Senha</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#150A04] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full text-center py-2 rounded bg-primary text-black font-serif font-bold text-xs uppercase cursor-pointer hover:bg-highlight transition-colors"
                  >
                    Confirmar Senha
                  </button>
                </form>
              ) : (
                <form onSubmit={handleUpdateEmail} className="space-y-3">
                  <span className="text-[10px] tracking-widest text-[#FF6A00] font-mono block uppercase">Atualizar Endereço E-mail</span>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 uppercase font-mono block">Novo E-mail</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="seuemail@gmail.com"
                      className="w-full bg-[#150A04] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full text-center py-2 rounded bg-primary text-black font-serif font-bold text-xs uppercase cursor-pointer hover:bg-highlight transition-colors"
                  >
                    Confirmar E-mail
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ITEM DAILY REWARD CHEST */}
          <div className="bg-gradient-to-r from-amber-600/10 to-[#FF6A00]/5 border border-amber-500/25 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Gift className="w-5 h-5 text-[#FFD700] animate-bounce" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-black uppercase text-white tracking-wider">Baú Imperial Diário</h4>
                <span className="text-[9px] font-mono text-[#D5CDBC] block uppercase">Disponível uma vez ao dia</span>
              </div>
            </div>
            
            <p className="text-[11px] leading-relaxed text-[#BCAD9E] font-sans">
              Acesse sua conta todos os dias e reivindique seu Baú Imperial. Você receberá um prêmio em moedas de <b>100 a 500 CASH grátis</b> para melhorar seus heróis!
            </p>

            <button
              onClick={handleClaimDailyReward}
              disabled={dailyClaimed || isClaiming}
              className={`w-full py-2.5 rounded text-center text-xs font-serif font-black uppercase tracking-wider transition-all cursor-pointer ${
                dailyClaimed 
                  ? 'bg-stone-900 border border-white/5 text-stone-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-[#FFD700] text-black hover:brightness-110 active:scale-95 text-stone-900 shadow-md shadow-amber-500/5'
              } flex items-center justify-center gap-1.5`}
            >
              {isClaiming ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#080402]" />
                  Conectando Baú...
                </>
              ) : dailyClaimed ? (
                '✓ Recompensa Já Coletada Hoje'
              ) : (
                'Resgatar Prêmio Diário'
              )}
            </button>
          </div>

          {/* VIP IMPERIAL MEMBERSHIP BLOCK */}
          <div className="bg-gradient-to-b from-[#1E110A] to-transparent border border-[#FF6A00]/20 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded bg-[#FF6A00]/10 flex items-center justify-center border border-[#FF6A00]/20">
                  <Crown className={`w-5 h-5 ${user?.isVip ? 'text-[#FFD700] animate-pulse' : 'text-stone-500'}`} />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-black uppercase text-white tracking-wider">VIP Imperial</h4>
                  <span className="text-[9px] font-mono text-[#BCAD9E] block uppercase">Benefícios Perpétuos</span>
                </div>
              </div>
              {user?.isVip && (
                <span className="bg-amber-500/20 text-[#FFD700] text-[8px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30 uppercase font-mono animate-pulse">
                  ATIVADO
                </span>
              )}
            </div>

            <p className="text-[11px] leading-relaxed text-[#BCAD9E] font-sans">
              {user?.isVip 
                ? 'Sua conta possui assinatura VIP permanente no servidor! Você recebe bônus de +50% EXP de montarias, taxa de drop de itens raros duplicado e uma aura dourada nos reinos.'
                : 'Ative o status de VIP Imperial usando seu balanceamento CASH. Desbloqueia +50% EXP, bônus de ouro duplo permanente em monstros e títulos de nobreza.'
              }
            </p>

            {!user?.isVip ? (
              <button
                onClick={handleActivateVIP}
                disabled={isActivatingVip}
                className="w-full py-2.5 rounded bg-transparent hover:bg-[#FF6A00]/10 border border-[#FF6A00]/30 hover:border-[#FF6A00] text-primary hover:text-white text-xs font-serif font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isActivatingVip ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                    Ativando VIP...
                  </>
                ) : (
                  'Ativar VIP Imperial (2.500 CASH)'
                )}
              </button>
            ) : (
              <div className="bg-emerald-950/20 border border-emerald-950/35 rounded-lg p-2.5 text-[9px] text-[#A2E2C5] font-sans font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>Estatuto Ativo! Seus benefícios estão vinculados à todos os heróis.</span>
              </div>
            )}
          </div>

        </div>

        {/* COLUMN 2 & 3: CHARACTERS LISTING + ACTION TILES + TRANSACTION LOGS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SEUS PERSONAGENS & DESBUGGER CONTAINER */}
          <div className="bg-gradient-to-b from-bg-secondary to-black/40 border border-primary/10 rounded-xl p-5 sm:p-6 shadow-xl space-y-6">
            <h4 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/5 pb-3">
              <span>Seus Personagens Guardados</span>
              <span className="text-[10px] text-[#A29485] font-mono uppercase bg-white/5 px-2 py-0.5 rounded">
                Gabinete Real
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {characters.map((char: any, charIdx: number) => {
                const kingdomColorClass = 
                  char.kingdom === 'Shinsoo' 
                    ? 'text-red-500' 
                    : char.kingdom === 'Chunjo' 
                      ? 'text-[#FFD700]' 
                      : 'text-blue-500';

                return (
                  <div
                    key={charIdx}
                    className="p-4 bg-[#080402]/40 rounded-lg border border-white/5 flex items-center justify-between group hover:border-[#FF6A00]/20 transition-all duration-350"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#150A04] border border-white/5 flex items-center justify-center text-xl select-none font-bold shadow-inner group-hover:border-[#FF6A00]/20">
                        {char.classType === 'Shaman' ? '🔮' : char.classType === 'Shura' ? '💀' : '⚔️'}
                      </div>
                      <div>
                        <span className="block font-serif text-sm font-bold text-white group-hover:text-primary transition-colors">
                          {char.name}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-mono text-stone-400 bg-white/5 px-1.5 py-0.5 rounded leading-none">
                            Nv. {char.level}
                          </span>
                          <span className="text-[10px] font-mono text-stone-500 bg-white/5 px-1.5 py-0.5 rounded leading-none capitalize font-semibold">
                            {char.classType}
                          </span>
                          <span className={`text-[10px] font-mono leading-none font-bold ${kingdomColorClass} capitalize`}>
                            {kingdomLabel(char.kingdom)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnstickChar(char.name)}
                      disabled={isUnsticking && unstickingChar === char.name}
                      className="px-3 py-1.5 rounded bg-amber-950/20 text-[#FFD700] border border-amber-900/30 hover:border-primary hover:text-white hover:bg-primary/10 text-xs font-serif font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
                    >
                      {isUnsticking && unstickingChar === char.name ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-primary" />
                          Salvando
                        </>
                      ) : (
                        'Desbugar'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QUICK ALERTS & UTILITY SUMMARY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-[#FF6A00]/5 to-black/30 border border-[#FF6A00]/10 p-5 rounded-lg flex gap-3.5">
              <div className="p-2 bg-primary/10 rounded border border-primary/20 h-fit text-primary">
                <Swords className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h5 className="font-serif text-xs font-black uppercase text-white tracking-widest">Guerra de Guildas</h5>
                <p className="text-[11px] text-[#BCAD9E] font-sans leading-relaxed">
                  As inscrições abrem automaticamente no painel de batalhas todos os sábados das 18h às 21h. Prepare sua espada e garanta o trono!
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500/5 to-black/30 border border-emerald-500/10 p-5 rounded-lg flex gap-3.5">
              <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/20 h-fit text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h5 className="font-serif text-xs font-black uppercase text-white tracking-widest">Segurança de Conta</h5>
                <p className="text-[11px] text-[#BCAD9E] font-sans leading-relaxed">
                  Lembre-se de nunca compartilhar sua senha com terceiros. Nossos Game Masters nunca solicitarão sua senha no Discord ou Ingame.
                </p>
              </div>
            </div>
          </div>

          {/* HISTORIC ORDERS ARCHIVE TABLE */}
          <div className="bg-gradient-to-b from-bg-secondary to-black/40 border border-primary/10 rounded-xl p-5 sm:p-6 shadow-xl space-y-4">
            <h4 className="font-serif text-lg font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
              Histórico Imperial de Compras & Recompensas
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/5 font-mono uppercase text-[#A29485] font-semibold text-[10px]">
                    <th className="py-2.5">Data Lançamento</th>
                    <th className="py-2.5">Método / Origem</th>
                    <th className="py-2.5">Valor Cobrado</th>
                    <th className="py-2.5">CASH Recebido</th>
                    <th className="py-2.5 text-right">Status do Pedido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {transactionsList.map((trx, tIdx) => (
                    <tr key={tIdx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono text-[#D5CDBC]">{trx.date}</td>
                      <td className="py-3 font-semibold uppercase text-stone-200">{trx.method}</td>
                      <td className="py-3 text-stone-400 font-mono">
                        {trx.amount > 0 ? `R$ ${trx.amount.toFixed(2).replace('.', ',')}` : 'CORTESIA'}
                      </td>
                      <td className="py-3 text-highlight font-mono font-bold">
                        +{trx.cash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded uppercase text-[9px] font-bold font-mono ${
                          trx.status === 'Pago'
                            ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30'
                            : trx.status === 'Pendente'
                              ? 'bg-amber-950/20 text-amber-400 border border-amber-900/30'
                              : 'bg-red-950/20 text-red-500 border border-red-900/30'
                        }`}>
                          {trx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactionsList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-stone-500 italic">
                        Nenhuma transação anterior registrada nesta conta.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
