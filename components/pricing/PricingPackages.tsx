"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, Crown, TrendingUp, Award, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabaseClient } from "@/lib/supabase";

interface PackageFeatures {
  credits: number;
  music: number;
  designs: number;
  logos: number;
  videos: number;
  savings: number;
}

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  stripePriceId: string; // Stripe Price ID
  icon: any;
  features: PackageFeatures;
  gradient: string;
  popular?: boolean;
  iconColor: string;
  borderGlow: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Ideal para experimentar a plataforma",
    price: 5,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "price_starter",
    icon: Sparkles,
    features: {
      credits: 170,
      music: 8,
      designs: 6,
      logos: 1,
      videos: 1,
      savings: 0,
    },
    gradient: "from-slate-500/20 via-gray-500/10 to-slate-600/20",
    iconColor: "text-slate-400",
    borderGlow: "hover:shadow-slate-500/20",
  },
  {
    id: "basic",
    name: "Basic",
    description: "Ideal para criadores iniciantes",
    price: 10,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || "price_basic",
    icon: Zap,
    features: {
      credits: 350,
      music: 58,
      designs: 23,
      logos: 17,
      videos: 17,
      savings: 0,
    },
    gradient: "from-blue-500/20 via-cyan-500/10 to-blue-600/20",
    iconColor: "text-blue-400",
    borderGlow: "hover:shadow-blue-500/20",
  },
  {
    id: "standard",
    name: "Standard",
    description: "Ideal para uso regular",
    price: 15,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD || "price_standard",
    icon: TrendingUp,
    features: {
      credits: 550,
      music: 91,
      designs: 36,
      logos: 27,
      videos: 27,
      savings: 10,
    },
    gradient: "from-purple-500/20 via-violet-500/10 to-purple-600/20",
    iconColor: "text-purple-400",
    borderGlow: "hover:shadow-purple-500/20",
  },
  {
    id: "plus",
    name: "Plus",
    description: "Ideal para profissionais e equipas",
    price: 30,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS || "price_plus",
    icon: Award,
    features: {
      credits: 1150,
      music: 50,
      designs: 30,
      logos: 3,
      videos: 3,
      savings: 15,
    },
    gradient: "from-orange-500/20 via-amber-500/10 to-orange-600/20",
    iconColor: "text-orange-400",
    borderGlow: "hover:shadow-orange-500/20",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Ideal para agências e produtores",
    price: 60,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_pro",
    icon: Star,
    features: {
      credits: 2400,
      music: 400,
      designs: 96,
      logos: 120,
      videos: 120,
      savings: 17,
    },
    gradient: "from-emerald-500/20 via-teal-500/10 to-emerald-600/20",
    iconColor: "text-emerald-400",
    borderGlow: "hover:shadow-emerald-500/20",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Ideal para empresas e uso intensivo",
    price: 150,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || "price_premium",
    icon: Crown,
    features: {
      credits: 6250,
      music: 200,
      designs: 150,
      logos: 50,
      videos: 50,
      savings: 20,
    },
    gradient: "from-yellow-500/20 via-amber-500/10 to-yellow-600/20",
    iconColor: "text-yellow-400",
    borderGlow: "hover:shadow-yellow-500/20",
  },
];

export default function PricingPackages() {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (tier: PricingTier) => {
    try {
      setLoadingTier(tier.id);

      // Verificar autenticação
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !user) {
        toast.error('Faça login para comprar créditos');
        router.push('/login?redirect=/pricing');
        return;
      }

      // Criar checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: tier.stripePriceId,
          credits: tier.features.credits,
          tierName: tier.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar sessão de checkout');
      }

      const { url } = await response.json();

      if (url) {
        // Redirecionar para Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('URL de checkout não encontrada');
      }

    } catch (error: any) {
      console.error('Erro ao processar compra:', error);
      toast.error(error.message || 'Erro ao processar compra');
    } finally {
      setLoadingTier(null);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("pt-PT").format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-6">
            <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-300">Planos Premium</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Escolha o plano perfeito
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Desbloqueie todo o potencial criativo com nossos pacotes de créditos premium
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                billingCycle === "monthly"
                  ? "bg-white text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                billingCycle === "yearly"
                  ? "bg-white text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Anual
              <span className="ml-2 text-xs text-green-500">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            const isHovered = hoveredTier === tier.id;
            const finalPrice = billingCycle === "yearly" ? tier.price * 12 * 0.8 : tier.price;

            return (
              <div
                key={tier.id}
                onMouseEnter={() => setHoveredTier(tier.id)}
                onMouseLeave={() => setHoveredTier(null)}
                className={`relative group ${tier.popular ? 'md:scale-105 z-10' : ''}`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="px-4 py-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-xs font-semibold text-white shadow-lg">
                      Mais Popular
                    </div>
                  </div>
                )}

                {/* Card */}
                <div
                  className={`relative h-full bg-gradient-to-br ${tier.gradient} backdrop-blur-xl border border-white/10 rounded-2xl p-8 transition-all duration-500 ${tier.borderGlow} ${
                    isHovered ? "shadow-2xl border-white/20 translate-y-[-4px]" : "shadow-lg"
                  } ${tier.popular ? 'border-orange-500/30' : ''}`}
                >
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10`} />

                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`inline-flex p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl ${tier.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Name & Description */}
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-sm text-gray-400 mb-6 min-h-[40px]">{tier.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">
                        €{billingCycle === "yearly" ? Math.round(finalPrice) : tier.price}
                      </span>
                      {billingCycle === "yearly" && (
                        <span className="text-sm text-gray-400">/ano</span>
                      )}
                      {billingCycle === "monthly" && (
                        <span className="text-sm text-gray-400">/mês</span>
                      )}
                    </div>
                    {tier.features.savings > 0 && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-medium text-green-400">
                          Economia de {tier.features.savings}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                      <span className="text-sm text-gray-400">Créditos Totais</span>
                      <span className="text-lg font-bold text-white">
                        {formatNumber(tier.features.credits)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Músicas</span>
                        <span className="text-lg font-bold text-white">
                          {formatNumber(tier.features.music)}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Designs</span>
                        <span className="text-lg font-bold text-white">
                          {formatNumber(tier.features.designs)}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Logos</span>
                        <span className="text-lg font-bold text-white">
                          {formatNumber(tier.features.logos)}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Vídeos</span>
                        <span className="text-lg font-bold text-white">
                          {formatNumber(tier.features.videos)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handlePurchase(tier)}
                    disabled={loadingTier === tier.id}
                    className={`w-full py-6 text-base font-semibold rounded-xl transition-all duration-300 ${
                      tier.popular
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20"
                    }`}
                  >
                    {loadingTier === tier.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      tier.popular ? "Começar Agora" : "Selecionar Plano"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="text-center">
          <div className="inline-flex flex-col md:flex-row items-center gap-8 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-gray-300">Garantia de 14 dias</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Check className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm text-gray-300">Suporte prioritário</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Check className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-gray-300">Atualizações ilimitadas</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Check className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-sm text-gray-300">Cancelamento fácil</span>
            </div>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            Tem dúvidas? Entre em contato com nosso{" "}
            <a href="/support" className="text-blue-400 hover:text-blue-300 transition-colors underline">
              suporte premium
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
