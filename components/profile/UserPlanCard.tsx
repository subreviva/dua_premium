"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowUpCircle, Sparkles } from "lucide-react";
import { supabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PlanDetails {
  name: string;
  credits: number;
  features: string[];
}

interface UserPlan {
  subscription_tier: string;
  created_at: string;
}

export function UserPlanCard() {
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPlanDetails = (tier: string): PlanDetails => {
    const plans: Record<string, PlanDetails> = {
      free: {
        name: "Free",
        credits: 30,
        features: ["30 créditos/mês", "Suporte básico", "Qualidade padrão"],
      },
      basic: {
        name: "Basic",
        credits: 500,
        features: ["500 créditos/mês", "Suporte prioritário", "Qualidade HD"],
      },
      premium: {
        name: "Premium",
        credits: 2000,
        features: ["2000 créditos/mês", "Suporte 24/7", "Qualidade Ultra HD"],
      },
      pro: {
        name: "Pro",
        credits: 5000,
        features: ["5000 créditos/mês", "Suporte dedicado", "Acesso antecipado"],
      },
    };

    return plans[tier.toLowerCase()] || plans.free;
  };

  const calculateRenewalDate = (createdAt: string): string => {
    const created = new Date(createdAt);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
    const nextRenewal = new Date(created);
    nextRenewal.setMonth(created.getMonth() + monthsDiff + 1);

    return nextRenewal.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabaseClient
          .from("users")
          .select("subscription_tier, created_at")
          .eq("id", user.id)
          .maybeSingle();

        if (fetchError) {
          console.error("[UserPlanCard] Erro ao buscar plano:", fetchError);
          setError(fetchError.message || "Erro ao carregar dados do plano");
          // Fallback para plano free
          setPlan({ subscription_tier: "free", created_at: new Date().toISOString() });
        } else if (data) {
          setPlan(data);
        } else {
          // Usuário não existe na tabela users - criar com plano free
          console.warn("[UserPlanCard] Usuário não encontrado, usando plano free");
          setPlan({ subscription_tier: "free", created_at: new Date().toISOString() });
        }
      } catch (error) {
        console.error("[UserPlanCard] Erro inesperado:", error);
        setError("Erro ao carregar plano");
        setPlan({ subscription_tier: "free", created_at: new Date().toISOString() });
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white"></div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const planDetails = getPlanDetails(plan.subscription_tier || "free");
  const renewalDate = calculateRenewalDate(plan.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-6 hover:border-white/20 transition-all duration-300"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Plano Atual</h3>
          <Shield className="w-4 h-4 text-gray-500" />
        </div>

        <div>
          <p className="text-2xl font-semibold text-white mb-1">
            {planDetails.name}
          </p>
          <p className="text-sm text-gray-400">{planDetails.credits} créditos/mês</p>
        </div>

        <div className="space-y-2">
          {planDetails.features.map((feature, index) => (
            <div key={index} className="flex items-start text-sm text-gray-300">
              <span className="text-gray-500 mr-2">•</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Renovação</span>
            <span className="text-gray-300 font-medium">{renewalDate}</span>
          </div>

          {plan.subscription_tier === "free" && (
            <Link href="/pricing" className="block">
              <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm">
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
