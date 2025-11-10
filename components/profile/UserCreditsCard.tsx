"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase";
import { Wallet, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UserCreditsData {
  servicos_creditos: number;
  duacoin_balance: number;
}

export function UserCreditsCard() {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<UserCreditsData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      // Buscar usuário autenticado
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !user) {
        console.error('Usuário não autenticado');
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Buscar créditos de duaia_user_balances
      const { data: balanceData, error: balanceError } = await supabaseClient
        .from('duaia_user_balances')
        .select('servicos_creditos, duacoin_balance')
        .eq('user_id', user.id)
        .single();

      if (balanceError) {
        // Se não existe registro, criar com valores padrão
        if (balanceError.code === 'PGRST116') {
          const { data: newBalance, error: insertError } = await supabaseClient
            .from('duaia_user_balances')
            .insert({
              user_id: user.id,
              servicos_creditos: 0,
              duacoin_balance: 0
            })
            .select('servicos_creditos, duacoin_balance')
            .single();

          if (!insertError && newBalance) {
            setCredits(newBalance);
          }
        } else {
          console.error('Erro ao buscar créditos:', balanceError);
        }
      } else if (balanceData) {
        setCredits(balanceData);
      }
    } catch (error) {
      console.error('Erro ao carregar créditos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-yellow-500/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
        </div>
      </motion.div>
    );
  }

  const servicosCreditos = credits?.servicos_creditos || 0;
  const duacoinBalance = credits?.duacoin_balance || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-yellow-500/20 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Créditos Premium</h3>
            <p className="text-xs text-gray-400">Sistema de Serviços DUA</p>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
      </div>

      {/* Créditos de Serviços */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            {servicosCreditos.toLocaleString('pt-PT')}
          </span>
          <span className="text-lg text-gray-400">créditos</span>
        </div>
        <p className="text-sm text-gray-400">
          Use em Música, Design, Logos, Vídeos e mais
        </p>
      </div>

      {/* DuaCoin Balance (se tiver) */}
      {duacoinBalance > 0 && (
        <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">DuaCoin</p>
              <p className="text-2xl font-bold text-white">
                {duacoinBalance.toLocaleString('pt-PT')}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
        </div>
      )}

      {/* Info de Uso */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Músicas</p>
          <p className="text-sm font-bold text-white">{Math.floor(servicosCreditos / 6)}</p>
        </div>
        <div className="text-center p-2 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Designs</p>
          <p className="text-sm font-bold text-white">{Math.floor(servicosCreditos / 4)}</p>
        </div>
        <div className="text-center p-2 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Logos</p>
          <p className="text-sm font-bold text-white">{Math.floor(servicosCreditos / 6)}</p>
        </div>
        <div className="text-center p-2 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Vídeos</p>
          <p className="text-sm font-bold text-white">{Math.floor(servicosCreditos / 20)}</p>
        </div>
      </div>

      {/* CTA - Comprar mais créditos */}
      <div className="flex gap-2">
        <Button
          asChild
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
        >
          <Link href="/pricing">
            Comprar Créditos
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-white/10 hover:bg-white/5 text-white"
        >
          <Link href="/pricing">
            Ver Planos
          </Link>
        </Button>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-500 text-center">
          Créditos válidos conforme plano • Não expiram no Premium
        </p>
      </div>
    </motion.div>
  );
}
