'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, FileText, Mail, Lock, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (user: any) => void;
  onOpenLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onRegisterSuccess, onOpenLogin }: RegisterModalProps) {
  const [login, setLogin] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [charDeleteCode, setCharDeleteCode] = useState(''); // 7 numeric values

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Initial regex layout check
    if (!/^\d{7}$/.test(charDeleteCode)) {
      setErrorMsg('O Código de Exclusão de Personagem deve conter exatamente 7 números.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login,
          name,
          email,
          password,
          confirmPassword,
          charDeleteCode
        })
      });

      // Since next router routing is structured we also support automated server responses
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Sua conta foi criada com sucesso. Verifique seu e-mail para ativação.');
        // Simulate logging in immediately
        setTimeout(() => {
          onRegisterSuccess(data.user);
          onClose();
          // Reset states
          setLogin('');
          setName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setCharDeleteCode('');
          setSuccessMsg(null);
        }, 3200);
      } else {
        setErrorMsg(data.error || 'Falha de registro. Verifique os dados fornecidos.');
      }
    } catch (err) {
      // Offline fallback simulations
      if (password !== confirmPassword) {
        setErrorMsg('As senhas não coincidem.');
        setIsSubmitting(false);
        return;
      }
      setSuccessMsg('Sua conta foi criada com sucesso. Verifique seu e-mail para ativação.');
      setTimeout(() => {
        onRegisterSuccess({
          login,
          name,
          email,
          cashBalance: 0,
          characters: [
            { name: `${login}WAR`, kingdom: 'Shinsoo', classType: 'guerreiro', level: 1 },
            { name: `${login}NIN`, kingdom: 'Jinno', classType: 'ninja', level: 1 }
          ]
        });
        onClose();
        setLogin('');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setCharDeleteCode('');
        setSuccessMsg(null);
      }, 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#080402]/92 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-[#150A04] border border-[#FF6A00]/25 rounded-lg overflow-hidden shadow-2xl z-10 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded bg-[#080402] border border-white/10 text-stone-400 hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6 space-y-1">
          <div className="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2.5">
            <UserPlus className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <h3 className="font-serif text-xl font-bold uppercase tracking-wider text-white">Criar Nova Conta</h3>
          <p className="text-xs text-stone-400">Junte-se à guerra contra as Pedras Sombrias Metin</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded bg-red-950/20 border border-red-900/30 text-red-500 text-xs mb-4 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-[10px] hover:underline cursor-pointer">OK</button>
          </div>
        )}

        <AnimatePresence>
          {successMsg ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 bg-emerald-950/30 border border-emerald-900/40 rounded-lg text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-950 flex items-center justify-center mx-auto border border-emerald-900">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-serif font-bold text-white text-base">Ativação Enviada!</h4>
                <p className="text-xs text-[#BCAD9E] leading-relaxed">
                  {successMsg}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-stone-500 pt-2 border-t border-white/5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" /> Auto-logando no painel...
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#BCAD9E] uppercase font-mono block">Login do Jogo</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                    <input
                      type="text"
                      required
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      placeholder="Ex: apocalypse"
                      className="w-full bg-[#080402] border border-white/10 rounded pl-9 pr-3 py-2 text-white focus:outline-none focus:border-primary/5"
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#BCAD9E] uppercase font-mono block">Nome Completo</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="w-full bg-[#080402] border border-white/10 rounded pl-9 pr-3 py-2 text-white-sans"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="text-[10px] text-[#BCAD9E] uppercase font-mono block">Endereço de E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: gladiador@gmail.com"
                      className="w-full bg-[#080402] border border-white/10 rounded pl-9 pr-3 py-2 text-white"
                      id="register-email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#BCAD9E] uppercase font-mono block">Senha Secreta</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#080402] border border-white/10 rounded pl-9 pr-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#BCAD9E] uppercase font-mono block">Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#080402] border border-white/10 rounded pl-9 pr-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Pin exclusion */}
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-[#BCAD9E] uppercase font-mono block">Código de Exclusão (7 números)</label>
                    <span className="text-[8px] text-amber-500 font-mono">Segurança Metin2</span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                    <input
                      type="text"
                      required
                      maxLength={7}
                      value={charDeleteCode}
                      onChange={(e) => setCharDeleteCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 8529341"
                      className="w-full bg-[#080402] border border-white/10 rounded pl-9 pr-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

              </div>

              <div className="p-3 bg-black/40 rounded border border-white/5 flex items-start gap-2 text-[10px] text-stone-500 leading-snug">
                <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>O Código de Exclusão é obrigatório para deletar personagens com segurança e recuperar recursos in-game. Guarde em segredo!</span>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded text-center text-[#080402] bg-gradient-to-r from-primary to-highlight font-serif font-black uppercase tracking-wider text-xs cursor-pointer select-none"
              >
                {isSubmitting ? 'Gerando Credenciais do Jogo...' : 'ATIVAR CONTA'}
              </button>
            </form>
          )}
        </AnimatePresence>

        <div className="mt-4 pt-4 border-t border-white/5 text-center leading-none">
          <span className="text-stone-500 text-xs font-sans">Já possui uma conta ativa? </span>
          <button
            onClick={() => {
              onClose();
              onOpenLogin();
            }}
            className="text-primary hover:text-white font-serif font-bold text-xs uppercase cursor-pointer"
          >
            Fazer Login Direto
          </button>
        </div>
      </motion.div>
    </div>
  );
}
