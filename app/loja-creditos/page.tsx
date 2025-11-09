'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Zap, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface CreditPackage {
  id: string;
  creditos: number;
  price_eur: number;
  price_dua: string;
  bonus_creditos?: number;
  total_creditos: number;
  popular?: boolean;
}

interface ExchangeRate {
  dua_per_eur: number;
  eur_per_dua: number;
  last_updated: string;
}

export default function LojaCreditosPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [saldoDua, setSaldoDua] = useState<number>(0);
  const [creditosServicos, setCreditosServicos] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Buscar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Buscar saldo do usuário
      const { data: userData } = await supabase
        .from('users')
        .select('saldo_dua, creditos_servicos')
        .eq('id', user.id)
        .single();

      if (userData) {
        setSaldoDua(parseFloat(userData.saldo_dua) || 0);
        setCreditosServicos(userData.creditos_servicos || 0);
      }

      // Buscar pacotes disponíveis
      const response = await fetch('/api/comprar-creditos');
      const result = await response.json();

      if (result.success) {
        setPackages(result.data.packages);
        setExchangeRate(result.data.exchange_rate);
      }

    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar loja de créditos');
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(packageId: string) {
    try {
      setPurchasing(packageId);
      setError(null);
      setSuccess(null);

      // Buscar usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Fazer compra
      const response = await fetch('/api/comprar-creditos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          package_id: packageId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Compra realizada com sucesso! +${result.data.creditos_adicionados} créditos`);
        // Atualizar saldos
        setSaldoDua(parseFloat(result.data.saldo_dua_restante) || 0);
        setCreditosServicos(result.data.creditos_total || 0);
      } else {
        if (result.error === 'Saldo insuficiente' || result.error?.includes('insuficiente')) {
          setError('Saldo DUA insuficiente. Compre DUA em duacoin.2lados.pt');
        } else {
          setError(result.error || 'Erro ao processar compra');
        }
      }

    } catch (err: any) {
      console.error('Erro ao comprar créditos:', err);
      setError('Erro ao processar compra');
    } finally {
      setPurchasing(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando loja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Coins className="w-8 h-8 text-purple-600" />
                Loja de Créditos
              </h1>
              <p className="mt-2 text-gray-600">
                Compre créditos de serviço para usar nos estúdios DUA IA
              </p>
            </div>

            {/* Saldos */}
            <div className="flex gap-4">
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-4 border border-purple-200">
                <p className="text-sm text-purple-700 font-medium">Saldo DUA</p>
                <p className="text-2xl font-bold text-purple-900">{saldoDua.toFixed(4)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-4 border border-green-200">
                <p className="text-sm text-green-700 font-medium">Créditos</p>
                <p className="text-2xl font-bold text-green-900">{creditosServicos.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Taxa de câmbio */}
      {exchangeRate && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Taxa atual:</span> 1 EUR = {exchangeRate.dua_per_eur} DUA
            </p>
          </div>
        </div>
      )}

      {/* Alertas */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              {error.includes('insuficiente') && (
                <a 
                  href="https://duacoin.2lados.pt/comprar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-700 underline mt-2 inline-block hover:text-red-900"
                >
                  → Comprar DUA agora
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Pacotes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {packages.map((pkg, index) => {
            const canAfford = saldoDua >= parseFloat(pkg.price_dua);
            const isPurchasing = purchasing === pkg.id;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl border-2 overflow-hidden ${
                  pkg.popular 
                    ? 'border-purple-500 shadow-xl scale-105' 
                    : 'border-gray-200 hover:border-purple-300'
                } transition-all duration-300`}
              >
                {/* Badge Popular */}
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}

                <div className="p-6">
                  {/* Créditos */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full mb-3">
                      <Zap className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {pkg.total_creditos.toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-500">créditos</p>
                    
                    {pkg.bonus_creditos && (
                      <div className="mt-2 inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                        +{pkg.bonus_creditos.toLocaleString()} bônus
                      </div>
                    )}
                  </div>

                  {/* Preços */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Preço EUR:</span>
                      <span className="font-semibold text-gray-900">€{pkg.price_eur.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Preço DUA:</span>
                      <span className="font-semibold text-purple-900">{pkg.price_dua} DUA</span>
                    </div>
                  </div>

                  {/* Botão */}
                  <button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={!canAfford || isPurchasing}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                      !canAfford
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : pkg.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                        : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg'
                    }`}
                  >
                    {isPurchasing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processando...
                      </span>
                    ) : !canAfford ? (
                      'Saldo insuficiente'
                    ) : (
                      'Comprar'
                    )}
                  </button>

                  {!canAfford && (
                    <a
                      href="https://duacoin.2lados.pt/comprar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center text-xs text-purple-600 hover:text-purple-700 underline mt-2"
                    >
                      Comprar DUA
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Como funciona?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Escolha o pacote</h4>
                <p className="text-sm text-gray-600">
                  Selecione o pacote de créditos ideal para suas necessidades
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Pagamento com DUA</h4>
                <p className="text-sm text-gray-600">
                  O valor será debitado do seu saldo DUA automaticamente
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Use nos estúdios</h4>
                <p className="text-sm text-gray-600">
                  Seus créditos estarão disponíveis para usar em música, imagens e mais
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
