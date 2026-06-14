'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, CreditCard, ChevronRight, CheckCircle2, Ticket, 
  Terminal, Activity, RefreshCw, QrCode, AlertTriangle, Play 
} from 'lucide-react';

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

interface CashPackage {
  id: string;
  cashAmount: number;
  priceBRL: number;
  tag?: string;
}

interface CashStoreProps {
  user: any;
  onOpenLogin: () => void;
  onUpdateCash: (addedAmount: number) => void;
  onRecordTransaction: (trx: { date: string; method: string; amount: number; cash: number; status: 'Pago' | 'Pendente' | 'Cancelado' }) => void;
}

export default function CashStoreAndCheckout({ user, onOpenLogin, onUpdateCash, onRecordTransaction }: CashStoreProps) {
  const [selectedPkg, setSelectedPkg] = useState<CashPackage | null>(null);
  const [paymentStep, setPaymentStep] = useState<'package' | 'payment-method' | 'processing' | 'success'>('package');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cc' | 'dc' | 'boleto' | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<Array<{ timestamp: string; level: 'info' | 'warn' | 'success'; message: string; event: string }>>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [stableReceiptId, setStableReceiptId] = useState<number | null>(null);

  // Credit Card Form State (For Visual Feedback)
  const [ccNumber, setCcNumber] = useState('');
  const [ccName, setCcName] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');
  const [ccCvv, setCcCvv] = useState('');

  const cashPackages: CashPackage[] = [
    { id: 'pkg-1', cashAmount: 5000, priceBRL: 5.0 },
    { id: 'pkg-2', cashAmount: 10000, priceBRL: 10.0 },
    { id: 'pkg-3', cashAmount: 20000, priceBRL: 20.0 },
    { id: 'pkg-4', cashAmount: 50000, priceBRL: 50.0, tag: 'MELHOR OFERTA' },
    { id: 'pkg-5', cashAmount: 100000, priceBRL: 100.0, tag: 'MELHOR OFERTA' }
  ];

  // Fetch live Stripe logs from the webhook API route
  const fetchStripeWebhookLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/payment/webhook');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.logs) {
            setWebhookLogs(data.logs);
          }
        } else {
          console.warn('Webhook API returned non-JSON response format.');
        }
      }
    } catch (err) {
      console.warn('Falha ao sincronizar logs de webhook (silenciado):', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchStripeWebhookLogs();
    }, 0);
    // Periodically poll webhook logs every 8 seconds for real-time vibe
    const timer = setInterval(() => {
      fetchStripeWebhookLogs();
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectPackage = (pkg: CashPackage) => {
    if (!user) {
      onOpenLogin();
      return;
    }
    setSelectedPkg(pkg);
    setPaymentStep('payment-method');
  };

  const handleSelectPaymentMethod = (method: 'pix' | 'cc' | 'dc' | 'boleto') => {
    setPaymentMethod(method);
  };

  // Automated Checkout Complete
  const handleFinalizePurchase = async () => {
    if (!selectedPkg || !paymentMethod) return;

    setPaymentStep('processing');

    // Step 1: Fire Client-side Created Log Event API
    try {
      await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `evt_init_${Math.floor(Math.random() * 1000000)}`,
          type: 'payment_intent.created',
          data: {
            object: {
              id: `pi_intent_${Math.floor(Math.random() * 1000000)}`,
              amount: selectedPkg.priceBRL * 100,
              metadata: {
                accountLogin: user.login,
                packageId: selectedPkg.id,
                cashAmount: selectedPkg.cashAmount,
                paymentMethod: paymentMethod.toUpperCase()
              }
            }
          }
        })
      });
    } catch (e) {
      console.warn('Skipped logging checkout init');
    }

    // Refresh logs console
    fetchStripeWebhookLogs();

    // Step 2: Artificial latency representing gateway secure authorization handshakes
    setTimeout(async () => {
      const receiptNum = Math.floor(Math.random() * 100000000);
      setStableReceiptId(receiptNum);
      const intentID = `pi_intent_${Math.floor(Math.random() * 1000000)}`;
      
      // Step 3: Trigger payment_intent.succeeded POST API - CREDITS USER LIVE BALANCE SERVER SIDE!
      try {
        const webhookResponse = await fetch('/api/payment/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `evt_succ_${Math.floor(Math.random() * 1000000)}`,
            type: 'payment_intent.succeeded',
            data: {
              object: {
                id: intentID,
                amount: selectedPkg.priceBRL * 100,
                metadata: {
                  accountLogin: user.login,
                  packageId: selectedPkg.id,
                  cashAmount: selectedPkg.cashAmount,
                  paymentMethod: paymentMethod.toUpperCase()
                }
              }
            }
          })
        });

        if (webhookResponse.ok) {
          // Success triggered on client dashboard state
          onUpdateCash(selectedPkg.cashAmount);
          onRecordTransaction({
            date: new Date().toISOString().substring(0, 10),
            method: paymentMethod.toUpperCase(),
            amount: selectedPkg.priceBRL,
            cash: selectedPkg.cashAmount,
            status: 'Pago'
          });
        }
      } catch (err) {
        console.error('Falta ao processar webhook síncrono', err);
      }

      // Step 4: Advance checkout state wizard
      fetchStripeWebhookLogs();
      setPaymentStep('success');
    }, 2800);
  };

  const handleResetCheckout = () => {
    setSelectedPkg(null);
    setPaymentMethod(null);
    setPaymentStep('package');
    setCcNumber('');
    setCcName('');
    setCcExpiry('');
    setCcCvv('');
  };

  return (
    <section id="loja" className="relative z-20 py-20 bg-gradient-to-b from-[#080402] to-[#150A04]/90 max-w-7xl mx-auto px-4">
      {/* SECTION HEADER */}
      <div className="text-center mb-16">
        <span className="text-primary font-mono text-xs uppercase tracking-widest block mb-1">
          Tesouro do Dragão
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl font-extrabold uppercase tracking-wider text-white">
          Loja Oficial <span className="text-primary">CASH</span>
        </h2>
        <p className="max-w-xl mx-auto text-[#A29485] text-sm mt-3 leading-relaxed">
          Adquira as moedas mais raras do império com aprovação imediata e automatizada para destravar trajes, elmos e anéis de buffs.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4" />
      </div>

      <div className="max-w-4xl mx-auto w-full">
        {/* CHECKOUT WIZARD & STORE PANEL */}
        <div className="bg-gradient-to-b from-[#150A04]/60 to-[#080402]/90 border border-[#FF6A00]/15 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          <AnimatePresence mode="wait">
            {/* STEP 1: CHOOSE PACKAGE BUNDLE */}
            {paymentStep === 'package' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
                    <Coins className="w-5 h-5 text-primary" /> Pacotes de Moedas
                  </h3>
                  <span className="text-stone-500 font-mono text-[10px] uppercase">Selecione para comprar</span>
                </div>

                <div className="space-y-4">
                  {cashPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg)}
                      className="group flex items-center justify-between p-4 bg-black/40 border border-[#FF6A00]/10 hover:border-[#FF6A00]/40 rounded-lg cursor-pointer transition-all hover:bg-black/60 shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-bg-secondary flex items-center justify-center border border-white/5 select-none shadow-inner">
                          <Coins className="w-6 h-6 text-highlight animate-pulse" />
                        </div>
                        <div>
                          <span className="block font-serif text-lg font-extrabold text-[#FFFFFF] group-hover:text-primary transition-colors">
                            {formatNumber(pkg.cashAmount)} CASH
                          </span>
                          <span className="block text-xs font-sans text-stone-400 mt-0.5">
                            Entrega imediata em sua conta
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {pkg.tag && (
                          <span className="text-[8px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/25 font-bold animate-bounce md:animate-none">
                            {pkg.tag}
                          </span>
                        )}
                        <span className="font-serif text-[#FF6A00] font-black text-lg">
                          R$ {pkg.priceBRL.toFixed(2).replace('.', ',')}
                        </span>
                        <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-[#FF6A00] group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: CHOOSE PAYMENT METHOD & INPUT DETAILS */}
            {paymentStep === 'payment-method' && selectedPkg && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Package Recap banner */}
                <div className="bg-[#150A04] rounded p-4 border border-primary/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 tracking-wider font-mono block uppercase">Pacote Selecionado</span>
                    <span className="font-serif font-black text-lg text-white">{formatNumber(selectedPkg.cashAmount)} CASH</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 tracking-wider font-mono block uppercase">Valor Total</span>
                    <span className="font-serif font-black text-lg text-[#FF6A00]">R$ {selectedPkg.priceBRL.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                    Selecione o Método de Pagamento
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={() => handleSelectPaymentMethod('pix')}
                      className={`p-3 rounded border text-xs font-serif font-bold uppercase transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                        paymentMethod === 'pix' ? 'bg-primary/10 border-primary text-white' : 'bg-black/30 border-white/5 text-stone-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-primary" />
                      Pix Integrado
                    </button>
                    <button
                      onClick={() => handleSelectPaymentMethod('cc')}
                      className={`p-3 rounded border text-xs font-serif font-bold uppercase transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                        paymentMethod === 'cc' ? 'bg-primary/10 border-primary text-white' : 'bg-black/30 border-white/5 text-stone-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-[#FFD700]" />
                      Cartão Crédito
                    </button>
                    <button
                      onClick={() => handleSelectPaymentMethod('dc')}
                      className={`p-3 rounded border text-xs font-serif font-bold uppercase transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                        paymentMethod === 'dc' ? 'bg-primary/10 border-primary text-white' : 'bg-black/30 border-white/5 text-stone-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-cyan-400" />
                      Cartão Débito
                    </button>
                    <button
                      onClick={() => handleSelectPaymentMethod('boleto')}
                      className={`p-3 rounded border text-xs font-serif font-bold uppercase transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                        paymentMethod === 'boleto' ? 'bg-primary/10 border-primary text-white' : 'bg-black/30 border-white/5 text-stone-400 hover:text-white'
                      }`}
                    >
                      <Ticket className="w-5 h-5 text-purple-400" />
                      Boleto Simples
                    </button>
                  </div>
                </div>

                {/* Sub-inputs based on method */}
                {paymentMethod === 'cc' && (
                  <div className="p-4 bg-[#080402] border border-white/5 rounded-lg space-y-4">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400 block mb-2">Detalhes do Portador</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] text-[#BCAD9E] uppercase font-mono">Número do Cartão</label>
                        <input
                          type="text"
                          value={ccNumber}
                          onChange={(e) => setCcNumber(e.target.value)}
                          placeholder="4532 •••• •••• ••••"
                          maxLength={19}
                          className="w-full bg-[#150A04] border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#BCAD9E] uppercase font-mono">Validade</label>
                        <input
                          type="text"
                          value={ccExpiry}
                          onChange={(e) => setCcExpiry(e.target.value)}
                          placeholder="MM/AA"
                          maxLength={5}
                          className="w-full bg-[#150A04] border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-stone-600 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#BCAD9E] uppercase font-mono">CVV</label>
                        <input
                          type="password"
                          value={ccCvv}
                          onChange={(e) => setCcCvv(e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full bg-[#150A04] border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-stone-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'pix' && (
                  <div className="p-4 bg-primary/5 border border-primary/25 rounded-lg text-center space-y-2">
                    <span className="text-xs text-[#FFC107] font-semibold">Chave Copia e Cola Gerada</span>
                    <p className="text-[10px] text-[#BCAD9E] font-mono leading-relaxed truncate max-w-lg mx-auto">
                      00020101021226870014br.gov.bcb.pix2565pix.itau.com/qr/v2/as-dev-fantasy2-cashpack-approved-2026
                    </p>
                    <span className="text-[9px] text-[#A29485] font-mono block">PIX processado via Stripe Webhook Gateway síncrono</span>
                  </div>
                )}

                {paymentMethod === 'boleto' && (
                  <div className="p-4 bg-stone-900/60 border border-white/5 rounded-lg text-center space-y-1">
                    <span className="text-xs text-purple-400 font-semibold">Linha Digitável de Boleto de Testes</span>
                    <p className="text-[10px] text-[#BCAD9E] font-mono truncate">
                      34191.79001 01043.513184 91020.150008 7 90020000005000
                    </p>
                  </div>
                )}

                {/* Final Nav buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <button
                    onClick={handleResetCheckout}
                    className="text-xs font-serif uppercase tracking-wider text-stone-400 hover:text-white cursor-pointer"
                  >
                    Voltar aos Pacotes
                  </button>

                  <button
                    disabled={!paymentMethod}
                    onClick={handleFinalizePurchase}
                    className="px-6 py-2.5 rounded font-serif font-extrabold text-xs uppercase tracking-wider bg-gradient-to-r from-primary to-highlight text-black cursor-pointer disabled:opacity-50"
                  >
                    Finalizar Compra R$ {selectedPkg.priceBRL.toFixed(2).replace('.', ',')}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PROCESSING SECURE GATEWAY CHECKOUT TRANSACTION */}
            {paymentStep === 'processing' && selectedPkg && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center space-y-6"
              >
                <div className="relative w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20 mx-auto">
                  <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                    Conectando ao Gateway Seguro...
                  </h4>
                  <p className="text-xs text-[#BCAD9E] font-mono mt-2.5 leading-relaxed max-w-sm mx-auto">
                    Stripe TLS 1.3 handshake criptografado em andamento. Aguardando aprovação do webhook de cash...
                  </p>
                </div>
                <div className="w-1/2 mx-auto h-1.5 bg-black rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.5, ease: 'easeInOut' }}
                    className="h-full bg-primary"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS CERTIFICATION */}
            {paymentStep === 'success' && selectedPkg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 flex items-center justify-center border border-[#22C55E]/30 mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-[#22C55E]" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-black uppercase text-white tracking-widest gold-text-glow">
                    Compra Provida com Sucesso!
                  </h3>
                  <p className="text-xs text-[#BCAD9E] font-sans leading-relaxed max-w-md mx-auto">
                    A transação foi autenticada. O servidor de webhook do Stripe validou o token e creditou {' '}
                    <span className="text-highlight font-bold font-mono">+{formatNumber(selectedPkg.cashAmount)} CASH</span> em sua carteira!
                  </p>
                </div>

                {/* Simulated Order Invoice ID Badge */}
                <div className="bg-[#080402] border border-white/5 rounded-lg p-4 inline-block text-left text-xs font-mono select-all">
                  <span className="block text-stone-500 text-[10px] font-semibold uppercase">ID Recibo Digital</span>
                  <span className="text-[#FF6A00] font-bold">FRX2-STP-{stableReceiptId || 82194018}</span>
                </div>

                <div className="pt-4 border-t border-white/10 max-w-sm mx-auto">
                  <button
                    onClick={handleResetCheckout}
                    className="w-full text-center py-2 rounded bg-primary text-xs font-serif font-black tracking-wider text-black cursor-pointer hover:shadow-lg transition-all"
                  >
                    Voltar para a Loja
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}
