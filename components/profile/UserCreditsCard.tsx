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
        className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-6"
      >
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-white/50" />
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
      className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm hover:border-white/20 transition-all duration-300 overflow-hidden"
    >
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Créditos Premium</h3>
          <Wallet className="w-4 h-4 text-gray-500" />
        </div>

        {/* Créditos de Serviços */}
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-semibold text-white">
              {servicosCreditos.toLocaleString('pt-PT')}
            </span>
            <span className="text-sm text-gray-500">créditos</span>
          </div>
          <p className="text-xs text-gray-500">
            Use em Música, Design, Logos, Vídeos e mais
          </p>
        </div>

        {/* DuaCoin Balance (se tiver) */}
        {duacoinBalance > 0 && (
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">DuaCoin</p>
                <p className="text-xl font-semibold text-white">
                  {duacoinBalance.toLocaleString('pt-PT')}
                </p>
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        )}

        {/* Info de Uso */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-white/5 rounded border border-white/10">
            <p className="text-[10px] text-gray-500 mb-1">Músicas</p>
            <p className="text-sm font-medium text-white">{Math.floor(servicosCreditos / 6)}</p>
          </div>
          <div className="text-center p-2 bg-white/5 rounded border border-white/10">
            <p className="text-[10px] text-gray-500 mb-1">Designs</p>
            <p className="text-sm font-medium text-white">{Math.floor(servicosCreditos / 4)}</p>
          </div>
          <div className="text-center p-2 bg-white/5 rounded border border-white/10">
            <p className="text-[10px] text-gray-500 mb-1">Logos</p>
            <p className="text-sm font-medium text-white">{Math.floor(servicosCreditos / 6)}</p>
          </div>
          <div className="text-center p-2 bg-white/5 rounded border border-white/10">
            <p className="text-[10px] text-gray-500 mb-1">Vídeos</p>
            <p className="text-sm font-medium text-white">{Math.floor(servicosCreditos / 20)}</p>
          </div>
        </div>

        {/* CTA - Comprar mais créditos */}
        <div className="flex gap-2 w-full">
          <Button
            asChild
            className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm h-9"
          >
            <Link href="/pricing">
              Comprar Créditos
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 border-white/10 hover:bg-white/5 text-white text-sm h-9"
          >
            <Link href="/pricing">
              Ver Planos
            </Link>
          </Button>
        </div>

        {/* Footer Info */}
        <div className="pt-3 border-t border-white/10">
          <p className="text-xs text-gray-500 text-center">
            Créditos válidos conforme plano • Não expiram no Premium
          </p>
        </div>
      </div>
    </motion.div>
  );
}
