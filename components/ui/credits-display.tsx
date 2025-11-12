"use client";

import { useState, useEffect } from "react";
import { Coins } from "lucide-react";
import { supabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CreditsDisplayProps {
  className?: string;
  showLabel?: boolean;
  onClick?: () => void;
  variant?: "default" | "compact" | "inline";
}

export function CreditsDisplay({ 
  className, 
  showLabel = false,
  onClick,
  variant = "default"
}: CreditsDisplayProps) {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCredits();

    // Listener para atualizações em tempo real da tabela duaia_user_balances (fonte de desconto)
    const channel = supabaseClient
      .channel('credits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'duaia_user_balances'
        },
        (payload) => {
          // Recarregar créditos quando houver mudanças na tabela de balances
          loadCredits();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const loadCredits = async () => {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        setCredits(null);
        setLoading(false);
        return;
      }

      // Primeiro, tentar buscar o saldo real de desconto
      const { data: balanceData, error: balanceError } = await supabaseClient
        .from('duaia_user_balances')
        .select('servicos_creditos')
        .eq('user_id', user.id)
        .single();

      if (!balanceError && balanceData) {
        setCredits(balanceData?.servicos_creditos ?? 0);
        setLoading(false);
        return;
      }

      // Se não existir balance, fallback para users.creditos_servicos
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('creditos_servicos')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error loading credits:', userError);
        setCredits(0);
      } else {
        setCredits(userData?.creditos_servicos || 0);
      }
    } catch (error) {
      console.error('Error loading credits:', error);
      setCredits(0);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/comprar');
    }
  };

  // Não mostrar se não autenticado
  if (credits === null) return null;

  // Variantes de estilo
  const variants = {
    default: "flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group",
    compact: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 cursor-pointer",
    inline: "inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors cursor-pointer"
  };

  return (
    <div 
      className={cn(variants[variant], className)}
      onClick={handleClick}
      title="Clique para comprar mais créditos"
    >
      <Coins className={cn(
        "text-yellow-400/90 group-hover:text-yellow-300 transition-colors",
        variant === "compact" ? "w-4 h-4" : "w-5 h-5"
      )} />
      
      <div className="flex items-center gap-1">
        {loading ? (
          <div className={cn(
            "animate-pulse bg-white/20 rounded",
            variant === "compact" ? "h-4 w-12" : "h-5 w-16"
          )} />
        ) : (
          <>
            <span className={cn(
              "font-semibold text-white tabular-nums",
              variant === "compact" ? "text-sm" : "text-base"
            )}>
              {credits.toLocaleString('pt-PT')}
            </span>
            {showLabel && (
              <span className="text-xs text-white/60 hidden sm:inline">
                créditos
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
