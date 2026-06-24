"use client";

import React, { useState, useEffect } from 'react';

// 1. Definição dos pacotes de Cash (Valores redondos para BRL e EUR)
const pacotesDeCash = [
  { id: 1, quantidade: '5.000', precoBRL: 5.00, precoEUR: 1.00, descricao: 'Entrega imediata em sua conta' },
  { id: 2, quantidade: '10.000', precoBRL: 10.00, precoEUR: 3.00, descricao: 'Entrega imediata em sua conta' },
  { id: 3, quantidade: '20.000', precoBRL: 20.00, precoEUR: 5.00, descricao: 'Entrega imediata em sua conta' },
  { id: 4, quantidade: '50.000', precoBRL: 50.00, precoEUR: 10.00, descricao: 'Entrega imediata em sua conta' },
  { id: 5, quantidade: '100.000', precoBRL: 100.00, precoEUR: 20.00, descricao: 'Entrega imediata em sua conta' },
];

export default function LojaCash() {
  // Controle de Moeda automático por IP (Padrão inicial 'BRL')
  const [moeda, setMoeda] = useState<'BRL' | 'EUR'>('BRL');
  
  // O primeiro pacote (5.000 CASH) já vem selecionado por padrão como na imagem_208f4b.png
  const [pacoteSelecionado, setPacoteSelecionado] = useState<typeof pacotesDeCash[0]>(pacotesDeCash[0]);
  
  // Controle do Método de Pagamento Selecionado
  const [metodoPagamento, setMetodoPagamento] = useState<string>('');

  // 2. SISTEMA AUTOMÁTICO DE DETECÇÃO DE IP (Vercel Geolocation)
  useEffect(() => {
    async function detectarPais() {
      try {
        // Faz uma chamada simulada ou lê os headers da Vercel se estiver em produção
        const response = await fetch('/api/get-country-code'); 
        // Caso sua API da Vercel retorne o código do país:
        if (response.ok) {
          const data = await response.json();
          if (data.country === 'PT') {
            setMoeda('EUR');
          } else {
            setMoeda('BRL');
          }
        }
      } catch (error) {
        console.log("Erro ao detectar IP, mantendo padrão BRL:", error);
      }
    }
    detectarPais();
  }, []);

  // Função auxiliar para formatar o preço na tela de forma bonita
  const formatarPreco = (preco: number) => {
    if (moeda === 'BRL') {
      return `R$ ${preco.toFixed(2).replace('.', ',')}`;
    }
    return `€ ${preco.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0604] text-zinc-300 font-sans p-4 md:p-8 selection:bg-amber-500 selection:text-black">
      <div className="max-w-5xl mx-auto">
        
        {/* ================= HEADER DA LOJA ================= */}
        <div className="text-center mb-6 mt-4">
          <span className="text-xs uppercase tracking-[0.3em] text-amber-600 font-bold">
            Tesouro do Dragão
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-wide uppercase mt-1">
            Loja Oficial <span className="text-[#ff6a00] drop-shadow-[0_0_10px_rgba(255,106,0,0.3)]">Cash</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl mx-auto mt-3 leading-relaxed">
            Adquira as moedas mais raras do império com aprovação imediata e automatizada para destravar trajes, elmos e anéis de buffs.
          </p>
          <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-4"></div>
        </div>

        {/* ================= SELETOR MANUAL ALTERNATIVO (Para testes locais) ================= */}
        <div className="flex justify-center items-center gap-3 mb-8">
          <button 
            onClick={() => setMoeda('BRL')}
            className={`px-4 py-2 rounded-md font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border ${
              moeda === 'BRL' 
                ? 'bg-amber-600/10 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>🇧🇷</span> Brasil (BRL)
          </button>
          
          <button 
            onClick={() => setMoeda('EUR')}
            className={`px-4 py-2 rounded-md font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border ${
              moeda === 'EUR' 
                ? 'bg-amber-600/10 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>🇵🇹</span> Portugal (EUR)
          </button>
        </div>

        {/* ================= CONTAINER DA LISTA DE PACOTES (imagem_208f86.png) ================= */}
        <div className="bg-[#120a06] border border-amber-900/20 rounded-xl p-6 md:p-8 shadow-2xl mb-8 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <h2 className="font-serif text-lg text-white flex items-center gap-2">
              <span className="text-[#ff6a00]">🪙</span> Pacotes de Moedas
            </h2>
            <span className="text-[10px] uppercase text-zinc-500 tracking-wider">Clique para selecionar</span>
          </div>

          <div className="space-y-3">
            {pacotesDeCash.map((pacote) => {
              const precoFinal = moeda === 'BRL' ? pacote.precoBRL : pacote.precoEUR;
              const estaSelecionado = pacoteSelecionado?.id === pacote.id;
              return (
                <div 
                  key={pacote.id}
                  onClick={() => setPacoteSelecionado(pacote)}
                  className={`group flex items-center justify-between bg-zinc-950/40 border rounded-lg p-4 cursor-pointer transition-all ${
                    estaSelecionado 
                      ? 'border-amber-500 bg-amber-950/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                      : 'border-zinc-900 hover:border-amber-500/40 hover:bg-zinc-900/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-zinc-900 border rounded-lg flex items-center justify-center transition-colors ${
                      estaSelecionado ? 'border-amber-500' : 'border-zinc-800 group-hover:border-amber-500/30'
                    }`}>
                      <span className="text-xl">🪙</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-[#ff6a00] tracking-wide">
                        {pacote.quantidade} CASH
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{pacote.descricao}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-lg font-serif font-bold text-amber-500 group-hover:text-amber-400 transition-colors">
                      {formatarPreco(precoFinal)}
                    </span>
                    <input 
                      type="radio" 
                      checked={estaSelecionado} 
                      onChange={() => setPacoteSelecionado(pacote)}
                      className="accent-amber-500 h-4 w-4 cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= FORMULÁRIO DE PAGAMENTO INTEGRADO (EXATAMENTE ABAIXO) ================= */}
        <div className="bg-[#120a06] border border-amber-900/20 rounded-xl p-6 md:p-8 shadow-2xl relative overflow-hidden animate-fadeIn">
          
          {/* Resumo Dinâmico do Pacote Ativo no Topo do Checkout (imagem_208f4b.png) */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-lg p-4 flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] uppercase text-zinc-500 tracking-wider block">Pacote Selecionado</span>
              <span className="text-xl font-serif font-bold text-white uppercase tracking-wide">
                {pacoteSelecionado.quantidade} CASH
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-zinc-500 tracking-wider block">Valor Total</span>
              <span className="text-2xl font-serif font-bold text-[#ff6a00]">
                {formatarPreco(moeda === 'BRL' ? pacoteSelecionado.precoBRL : pacoteSelecionado.precoEUR)}
              </span>
            </div>
          </div>

          {/* Seleção de Métodos */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-white font-semibold font-serif mb-4">
              Selecione o Método de Pagamento
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Métodos visíveis apenas para o IP/Moeda do Brasil */}
              {moeda === 'BRL' && (
                <>
                  <button 
                    onClick={() => setMetodoPagamento('pix')}
                    className={`p-4 rounded-lg border bg-zinc-950/30 flex flex-col items-center justify-center gap-2 transition-all ${
                      metodoPagamento === 'pix' ? 'border-orange-500 bg-orange-500/5 text-white' : 'border-zinc-900 text-zinc-400 hover:border-zinc-800'
                    }`}
                  >
                    <span className="text-2xl">🔸</span>
                    <span className="text-[11px] uppercase tracking-wider font-bold">Pix Integrado</span>
                  </button>

                  <button 
                    onClick={() => setMetodoPagamento('boleto')}
                    className={`p-4 rounded-lg border bg-zinc-950/30 flex flex-col items-center justify-center gap-2 transition-all ${
                      metodoPagamento === 'boleto' ? 'border-purple-500 bg-purple-500/5 text-white' : 'border-zinc-900 text-zinc-400 hover:border-zinc-800'
                    }`}
                  >
                    <span className="text-2xl">🎫</span>
                    <span className="text-[11px] uppercase tracking-wider font-bold">Boleto Simples</span>
                  </button>
                </>
              )}

              {/* Métodos visíveis apenas para o IP/Moeda de Portugal */}
              {moeda === 'EUR' && (
                <>
                  <button 
                    onClick={() => setMetodoPagamento('mbway')}
                    className={`p-4 rounded-lg border bg-zinc-950/30 flex flex-col items-center justify-center gap-2 transition-all ${
                      metodoPagamento === 'mbway' ? 'border-blue-500 bg-blue-500/5 text-white' : 'border-zinc-900 text-zinc-400 hover:border-zinc-800'
                    }`}
                  >
                    <span className="text-2xl">📱</span>
                    <span className="text-[11px] uppercase tracking-wider font-bold">MB WAY</span>
                  </button>

                  <button 
                    onClick={() => setMetodoPagamento('paypal')}
                    className={`p-4 rounded-lg border bg-zinc-950/30 flex flex-col items-center justify-center gap-2 transition-all ${
                      metodoPagamento === 'paypal' ? 'border-indigo-500 bg-indigo-500/5 text-white' : 'border-zinc-900 text-zinc-400 hover:border-zinc-800'
                    }`}
                  >
                    <span className="text-2xl">🅿️</span>
                    <span className="text-[11px] uppercase tracking-wider font-bold">PayPal</span>
                  </button>
                </>
              )}

              {/* Métodos Globais processados pelo Stripe */}
              <button 
                onClick={() => setMetodoPagamento('credito')}
                className={`p-4 rounded-lg border bg-zinc-950/30 flex flex-col items-center justify-center gap-2 transition-all ${
                  metodoPagamento === 'credito' ? 'border-yellow-500 bg-yellow-500/5 text-white' : 'border-zinc-900 text-zinc-400 hover:border-zinc-800'
                }`}
              >
                <span className="text-2xl">💳</span>
                <span className="text-[11px] uppercase tracking-wider font-bold">Cartão Crédito</span>
              </button>

              <button 
                onClick={() => setMetodoPagamento('debito')}
                className={`p-4 rounded-lg border bg-zinc-950/30 flex flex-col items-center justify-center gap-2 transition-all ${
                  metodoPagamento === 'debito' ? 'border-teal-500 bg-teal-500/5 text-white' : 'border-zinc-900 text-zinc-400 hover:border-zinc-800'
                }`}
              >
                <span className="text-2xl">💳</span>
                <span className="text-[11px] uppercase tracking-wider font-bold">Cartão Débito</span>
              </button>

            </div>
          </div>

          {/* Botão de Finalização Único da Interface (Muda de preço com base na seleção da lista) */}
          <div className="flex justify-end pt-4 border-t border-zinc-900 mt-6">
            <button 
              disabled={!metodoPagamento}
              className={`px-8 py-3 rounded font-serif font-bold text-xs uppercase tracking-widest text-black transition-all ${
                metodoPagamento 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              Finalizar Compra {formatarPreco(moeda === 'BRL' ? pacoteSelecionado.precoBRL : pacoteSelecionado.precoEUR)}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}