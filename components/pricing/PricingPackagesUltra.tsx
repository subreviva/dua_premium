"use client";

import { useState } from "react";
import { Check, Loader2, ArrowRight, Zap, Shield, Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabaseClient } from "@/lib/supabase";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  credits: number;
  stripePriceId: string;
  popular?: boolean;
  badge?: string;
  useCases: string[];
  examples: {
    label: string;
    value: string;
  }[];
  remaining?: string;
  features?: string[];
}

const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: 5,
    credits: 170,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "price_starter",
    badge: "Para experimentar",
    useCases: ["Experimentar a plataforma"],
    examples: [
      { label: "8 músicas completas", value: "8" },
      { label: "6 imagens Fast", value: "6" },
      { label: "1 vídeo 5s", value: "1" },
      { label: "50 chats básicos/dia", value: "grátis" },
    ],
    remaining: "Sobram: 12 créditos",
  },
  {
    id: "basic",
    name: "Basic",
    price: 10,
    credits: 350,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || "price_basic",
    badge: "Para iniciantes",
    useCases: ["Criadores iniciantes"],
    examples: [
      { label: "58 músicas", value: "58" },
      { label: "23 imagens Fast", value: "23" },
      { label: "17 vídeos 5s", value: "17" },
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 15,
    credits: 550,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD || "price_standard",
    badge: "Para uso regular",
    useCases: ["Uso regular"],
    examples: [
      { label: "91 músicas", value: "91" },
      { label: "36 imagens Fast", value: "36" },
      { label: "22 imagens Standard", value: "22" },
      { label: "27 vídeos 5s", value: "27" },
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: 30,
    credits: 1150,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS || "price_plus",
    popular: true,
    badge: "Melhor custo-benefício",
    useCases: ["Profissionais e equipas"],
    examples: [
      { label: "50 músicas", value: "50" },
      { label: "30 imagens Standard", value: "30" },
      { label: "3 vídeos 5s", value: "3" },
      { label: "5 Live Audio 1min", value: "5" },
      { label: "20 chats avançados", value: "20" },
    ],
    remaining: "Total usado: 1.145/1.150 créditos",
  },
  {
    id: "pro",
    name: "Pro",
    price: 60,
    credits: 2400,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_pro",
    badge: "Para agências",
    useCases: ["Agências e produtores"],
    examples: [
      { label: "400 músicas", value: "400" },
      { label: "96 imagens Standard", value: "96" },
      { label: "120 vídeos 5s", value: "120" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 150,
    credits: 6250,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || "price_premium",
    badge: "Para empresas",
    useCases: ["Empresas e uso intensivo"],
    examples: [
      { label: "200 músicas", value: "200" },
      { label: "150 imagens Standard", value: "150" },
      { label: "50 vídeos 5s", value: "50" },
      { label: "20 Act-Two (personagens animados)", value: "20" },
      { label: "30 Live Audio 5min", value: "30" },
    ],
    features: [
      "Chat ILIMITADO",
      "Suporte 24/7 prioritário",
    ],
    remaining: "Total usado: 6.240/6.250 créditos",
  },
];

const recommendations = [
  {
    tier: "starter",
    text: "Testa todos os studios",
    subtext: "Limitado mas suficiente para avaliar",
  },
  {
    tier: "basic",
    text: "Dobro do Starter",
    subtext: "Bom para começar",
  },
  {
    tier: "standard",
    text: "Bonus de 10% começa a valer",
    subtext: "Uso mensal confortável",
  },
  {
    tier: "plus",
    text: "Melhor custo-benefício",
    subtext: "Ideal para profissionais • Bonus de 15%",
  },
  {
    tier: "pro",
    text: "Volume alto",
    subtext: "Melhor valor por crédito",
  },
  {
    tier: "premium",
    text: "Chat ilimitado • Suporte prioritário",
    subtext: "Máxima economia (20%)",
  },
];

import { safeParse } from '@/lib/fetch-utils';

export function PricingPackagesUltra() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (tier: PricingTier) => {
    try {
      setLoadingTier(tier.id);

      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !user) {
        toast.error('Faça login para comprar créditos');
        router.push('/login?redirect=/pricing');
        return;
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: tier.stripePriceId,
          credits: tier.credits,
          tierName: tier.name,
        }),
      });

      if (!response.ok) throw new Error('Erro ao criar sessão de checkout');

      const data = await safeParse<{ url?: string }>(response);
      if (!data) {
        throw new Error('Invalid response from checkout API');
      }
      const { url } = data;
      if (url) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-6">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-gray-300">Planos de Créditos</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Escolha o plano ideal
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Potência criativa sem limites. Preços transparentes.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pricingTiers.map((tier) => {
            const recommendation = recommendations.find(r => r.tier === tier.id);
            
            return (
              <div
                key={tier.id}
                className={`relative ${tier.popular ? 'md:scale-105 z-10' : ''}`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-xs font-bold text-white shadow-lg uppercase tracking-wider">
                      Recomendado
                    </div>
                  </div>
                )}

                {/* Card */}
                <div
                  className={`relative h-full bg-white/5 backdrop-blur-xl border ${
                    tier.popular ? 'border-orange-500/40' : 'border-white/10'
                  } rounded-2xl p-8 transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:translate-y-[-2px]`}
                >
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                      {tier.popular && (
                        <div className="p-1.5 bg-orange-500/20 rounded-lg">
                          <Zap className="w-4 h-4 text-orange-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{tier.badge}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">€{tier.price}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      {tier.credits.toLocaleString()} créditos
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Ideal para
                    </div>
                    {tier.useCases.map((useCase, idx) => (
                      <div key={idx} className="flex items-start gap-2 mb-2">
                        <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{useCase}</span>
                      </div>
                    ))}
                  </div>

                  {/* Examples */}
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      O que podes fazer
                    </div>
                    <div className="space-y-2">
                      {tier.examples.map((example, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                        >
                          <span className="text-sm text-gray-300">{example.label}</span>
                          <span className="text-sm font-bold text-white">{example.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features (Premium only) */}
                  {tier.features && tier.features.length > 0 && (
                    <div className="mb-6">
                      <div className="space-y-2">
                        {tier.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-sm text-gray-300 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remaining */}
                  {tier.remaining && (
                    <div className="mb-6">
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-xs text-gray-400 text-center">{tier.remaining}</p>
                      </div>
                    </div>
                  )}

                  {/* Recommendation */}
                  {recommendation && (
                    <div className="mb-6 p-4 bg-gradient-to-br from-white/5 to-white/0 rounded-xl border border-white/10">
                      <div className="flex items-start gap-3">
                        <Gift className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-white mb-1">
                            {recommendation.text}
                          </p>
                          <p className="text-xs text-gray-400">
                            {recommendation.subtext}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
                      <>
                        Selecionar Plano
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Guarantees */}
        <div className="mt-16">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
              <div className="p-3 bg-green-500/20 rounded-lg mb-4">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-2">Garantia de 14 dias</h4>
              <p className="text-xs text-gray-400">Devolução do dinheiro sem perguntas</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
              <div className="p-3 bg-blue-500/20 rounded-lg mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-2">Ativação instantânea</h4>
              <p className="text-xs text-gray-400">Créditos disponíveis imediatamente</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
              <div className="p-3 bg-purple-500/20 rounded-lg mb-4">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-2">Sem expiração</h4>
              <p className="text-xs text-gray-400">Créditos nunca expiram</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
              <div className="p-3 bg-orange-500/20 rounded-lg mb-4">
                <Gift className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-2">Bónus incluídos</h4>
              <p className="text-xs text-gray-400">Até 20% de créditos extra</p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Dúvidas? Contacte o{" "}
            <a href="/support" className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
              suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
