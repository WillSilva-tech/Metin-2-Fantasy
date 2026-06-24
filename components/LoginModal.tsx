'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, User, RefreshCw, Key } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  onOpenRegister: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess, onOpenRegister }: LoginModalProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !password) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
        onClose();
        // Reset states
        setLogin('');
        setPassword('');
      } else {
        setErrorMsg(data.error || 'Credenciais inválidas. Verifique os dados.');
      }
    } catch (err) {
      setErrorMsg('Erro de conexão com o servidor. Tente novamente.');
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
        className="absolute inset-0 bg-[#080402]/90 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-[#150A04] border border-[#FF6A00]/25 rounded-lg overflow-hidden shadow-2xl z-10 p-6 sm:p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded bg-[#080402] border border-white/10 text-stone-400 hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6 space-y-1">
          <div className="w-10 h-10 rounded bg-[#FF6A00]/10 border border-primary/30 flex items-center justify-center mx-auto mb-2.5">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-bold uppercase tracking-wider text-white">Login de Acesso</h3>
          <p className="text-xs text-stone-400">Entre na sua conta para jogar e gerenciar cash</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded bg-red-950/20 border border-red-900/30 text-red-500 text-xs mb-4 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-[10px] hover:underline cursor-pointer">OK</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="text-[10px] text-[#BCAD9E] uppercase font-mono block">Nome de Usuário (Login)</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Ex: akira"
                className="w-full bg-[#080402] border border-white/10 rounded pl-9 pr-3 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
                id="login-username-input"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-[#BCAD9E] uppercase font-mono block">Senha Secreta</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#080402] border border-white/10 rounded pl-9 pr-3 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
                id="login-password-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[9px]">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('O sistema enviou um link de verificação para o seu e-mail cadastrado.');
              }}
              className="text-[#BCAD9E] hover:text-white hover:underline cursor-pointer"
            >
              Recuperar minha senha?
            </button>
            <span className="text-stone-600">Conexão Segura SSL</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded text-center text-black bg-gradient-to-r from-primary to-highlight font-serif font-bold uppercase tracking-wider text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                Autenticando...
              </>
            ) : (
              'Entrar no Servidor'
            )}
          </button>
        </form>



        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <span className="text-stone-500 text-xs font-sans">Não tem uma conta ainda? </span>
          <button
            onClick={() => {
              onClose();
              onOpenRegister();
            }}
            className="text-primary hover:text-white font-serif font-bold text-xs uppercase tracking-wide cursor-pointer"
          >
            Criar Uma Conta Grátis
          </button>
        </div>
      </motion.div>
    </div>
  );
}
