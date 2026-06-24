'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Coins, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import { cashPackages, type CashPackage } from '@/src/lib/cash-packages';

const formatNumber = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const formatBRL = (num: number) => `R$ ${num.toFixed(2).replace('.', ',')}`;

interface CashStoreProps {
  user: any;
  onOpenLogin: () => void;
  onUpdateCash: (addedAmount: number) => void;
  onRecordTransaction: (trx: { date: string; method: string; amount: number; cash: number; status: 'Pago' | 'Pendente' | 'Cancelado' }) => void;
}

export default function CashStoreAndCheckout({ user, onOpenLogin }: CashStoreProps) {
  const [selectedPkg, setSelectedPkg] = useState<CashPackage | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<Array<{ timestamp: string; level: 'info' | 'warn' | 'success'; message: string; event: string }>>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchStripeWebhookLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/payment/webhook', { cache: 'no-store' });
      const data = await res.json();
      setWebhookLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch {
      setWebhookLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchStripeWebhookLogs();
    const timer = window.setInterval(fetchStripeWebhookLogs, 8000);
    return () => window.clearInterval(timer);
  }, []);

  const handleSelectPackage = (pkg: CashPackage) => {
    if (!user) {
      onOpenLogin();
      return;
    }
    setSelectedPkg(pkg);
    setCheckoutError(null);
  };

  const handleOpenStripeCheckout = async () => {
    if (!selectedPkg) return;

    if (!user?.sessionToken) {
      setCheckoutError('Sessao expirada. Saia e entre novamente para comprar CASH.');
      return;
    }

    setCheckoutError(null);
    setIsRedirecting(true);

    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + user.sessionToken,
        },
        body: JSON.stringify({ packageId: selectedPkg.id }),
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || 'Checkout indisponivel.');
      }

      window.location.href = data.url;
    } catch {
      setCheckoutError('Nao foi possivel abrir o checkout do Stripe agora.');
      setIsRedirecting(false);
    }
  };

  return (
    <section id="loja" className="relative z-20 py-20 bg-gradient-to-b from-[#080402] to-[#150A04]/90 max-w-7xl mx-auto px-4">
      <div className="text-center mb-16">
        <span className="text-primary font-mono text-xs uppercase tracking-widest block mb-1">
          Tesouro do Dragao
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl font-extrabold uppercase tracking-wider text-white">
          Loja Oficial <span className="text-primary">CASH</span>
        </h2>
        <p className="max-w-xl mx-auto text-[#A29485] text-sm mt-3 leading-relaxed">
          Escolha seu pacote e finalize o pagamento em uma pagina segura hospedada pelo Stripe.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
        <div className="lg:col-span-7 bg-gradient-to-b from-[#150A04]/60 to-[#080402]/90 border border-[#FF6A00]/15 rounded-xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
              <Coins className="w-5 h-5 text-primary" /> Pacotes de Moedas
            </h3>
            <span className="text-stone-500 font-mono text-[10px] uppercase">Selecione para comprar</span>
          </div>

          <div className="space-y-4">
            {cashPackages.map((pkg) => {
              const active = selectedPkg?.id === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => handleSelectPackage(pkg)}
                  className={`w-full group flex items-center justify-between p-4 bg-black/40 border rounded-lg text-left transition-all shadow-lg ${
                    active
                      ? 'border-[#FF6A00]/70 bg-[#FF6A00]/10'
                      : 'border-[#FF6A00]/10 hover:border-[#FF6A00]/40 hover:bg-black/60'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded bg-bg-secondary flex items-center justify-center border border-white/5 select-none shadow-inner shrink-0">
                      <Coins className="w-6 h-6 text-highlight" />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-serif text-lg font-extrabold text-white group-hover:text-primary transition-colors">
                        {formatNumber(pkg.cashAmount)} CASH
                      </span>
                      <span className="block text-xs font-sans text-stone-400 mt-0.5">
                        Credito entregue automaticamente apos confirmacao do Stripe
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {pkg.tag && (
                      <span className="hidden sm:inline text-[8px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/25 font-bold">
                        {pkg.tag}
                      </span>
                    )}
                    <span className="font-serif text-[#FF6A00] font-black text-lg">
                      {formatBRL(pkg.priceBRL)}
                    </span>
                    <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-[#FF6A00] group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-[#150A04]/70 to-[#080402]/95 border border-[#FF6A00]/15 rounded-xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">Checkout Seguro</h3>
            </div>

            {selectedPkg ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPkg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-5"
                >
                  <div className="bg-[#080402] rounded-lg border border-white/5 p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 tracking-widest font-mono uppercase block">Pacote</span>
                      <span className="font-serif font-black text-xl text-white">{formatNumber(selectedPkg.cashAmount)} CASH</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 tracking-widest font-mono uppercase block">Total</span>
                      <span className="font-serif font-black text-xl text-primary">{formatBRL(selectedPkg.priceBRL)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#BCAD9E] leading-relaxed">
                    Ao clicar no botao abaixo, voce sera redirecionado para a pagina oficial do Stripe. Os dados do cartao, Pix ou metodo aceito ficam no Stripe, nao no site.
                  </p>

                  {checkoutError && (
                    <div className="rounded border border-red-900/30 bg-red-950/20 p-3 text-xs text-red-300">
                      {checkoutError}
                    </div>
                  )}

                  <button
                    onClick={handleOpenStripeCheckout}
                    disabled={isRedirecting}
                    className="w-full rounded bg-gradient-to-r from-primary to-highlight px-6 py-3.5 text-sm font-serif font-black uppercase tracking-wider text-black transition-all hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isRedirecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Redirecionando...
                      </>
                    ) : (
                      <>
                        Pagar no Stripe
                        <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="rounded-lg border border-white/5 bg-[#080402]/70 p-8 text-center text-xs text-[#BCAD9E] font-mono">
                Selecione um pacote para iniciar o checkout.
              </div>
            )}
          </div>

          <div className="bg-[#080402]/80 border border-white/5 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#A29485]">Status de Pagamentos</span>
              {isLoadingLogs && <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />}
            </div>
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {webhookLogs.length === 0 ? (
                <p className="text-[11px] text-stone-500">Nenhum evento recente.</p>
              ) : (
                webhookLogs.slice(0, 5).map((log, index) => (
                  <div key={`${log.timestamp}-${index}`} className="flex items-start gap-2 text-[11px] text-[#BCAD9E]">
                    <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${log.level === 'success' ? 'text-emerald-400' : log.level === 'warn' ? 'text-amber-400' : 'text-primary'}`} />
                    <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
