'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Zap, TrendingUp, ShoppingBag, History } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface UserBalance {
  saldo_dua: number;
  creditos_servicos: number;
}

interface Transaction {
  id: string;
  source_type: string;
  amount_dua: number;
  amount_creditos: number;
  description: string;
  created_at: string;
  status: string;
}

export default function DashboardCreditos() {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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
      if (!user) return;

      // Buscar saldos
      const { data: userData } = await supabase
        .from('users')
        .select('saldo_dua, creditos_servicos')
        .eq('id', user.id)
        .single();

      if (userData) {
        setBalance({
          saldo_dua: parseFloat(userData.saldo_dua) || 0,
          creditos_servicos: userData.creditos_servicos || 0,
        });
      }

      // Buscar últimas transações
      const { data: transData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transData) {
        setTransactions(transData);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Coins className="w-7 h-7 text-purple-600" />
          Seus Créditos
        </h2>
        <p className="text-gray-600 mt-1">Gerencie seus créditos de serviço e saldo DUA</p>
      </div>

      {/* Cards de Saldo */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Saldo DUA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-6 border-2 border-purple-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-sm font-medium text-purple-700 mb-1">Saldo DUA</h3>
          <p className="text-3xl font-bold text-purple-900">
            {balance?.saldo_dua.toFixed(4) || '0.0000'}
          </p>
          <p className="text-xs text-purple-600 mt-2">Carteira DUA Coin</p>
        </motion.div>

        {/* Créditos de Serviço */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-6 border-2 border-green-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <Zap className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-green-700 mb-1">Créditos de Serviço</h3>
          <p className="text-3xl font-bold text-green-900">
            {balance?.creditos_servicos.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-green-600 mt-2">Disponíveis para uso</p>
        </motion.div>

        {/* Ação: Comprar Créditos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-6 border-2 border-blue-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">Precisa de mais créditos?</h3>
            <p className="text-xs text-blue-600">Compre com seu saldo DUA</p>
          </div>
          
          <Link
            href="/comprar"
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Comprar Créditos
          </Link>
        </motion.div>
      </div>

      {/* Alerta de Saldo Baixo */}
      {balance && balance.creditos_servicos < 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Créditos baixos</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Você tem apenas {balance.creditos_servicos} créditos restantes. Recarregue para continuar usando os serviços.
              </p>
              <Link
                href="/comprar"
                className="text-sm text-yellow-800 underline font-medium mt-2 inline-block"
              >
                → Comprar créditos agora
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Histórico de Transações */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600" />
              Últimas Transações
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.source_type === 'purchase'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}>
                      {transaction.source_type === 'purchase' ? (
                        <ShoppingBag className={`w-5 h-5 ${
                          transaction.source_type === 'purchase'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`} />
                      ) : (
                        <Zap className="w-5 h-5 text-red-600" />
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {transaction.amount_creditos !== 0 && (
                      <p className={`font-bold ${
                        transaction.amount_creditos > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount_creditos > 0 ? '+' : ''}{transaction.amount_creditos} créditos
                      </p>
                    )}
                    {transaction.amount_dua !== 0 && (
                      <p className="text-sm text-gray-600">
                        {transaction.amount_dua.toFixed(4)} DUA
                      </p>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 text-center">
            <Link
              href="/historico-transacoes"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Ver histórico completo →
            </Link>
          </div>
        </div>
      )}

      {/* Info sobre Créditos */}
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
        <h3 className="font-bold text-gray-900 mb-3">Como funcionam os créditos?</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• <strong>Saldo DUA:</strong> Sua carteira compartilhada com DUA Coin</p>
          <p>• <strong>Créditos de Serviço:</strong> Usados para gerar música, imagens, etc</p>
          <p>• <strong>Conversão:</strong> Compre créditos usando seu saldo DUA</p>
          <p>• <strong>Consumo:</strong> Cada serviço tem um custo em créditos</p>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-xs text-blue-700">
            💡 <strong>Dica:</strong> Se seu saldo DUA estiver baixo, você pode comprar DUA em{' '}
            <a
              href="https://duacoin.2lados.pt/comprar"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              duacoin.2lados.pt
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
