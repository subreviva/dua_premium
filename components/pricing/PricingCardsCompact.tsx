"use client";

import { Sparkles, Zap, TrendingUp, Award, Star, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PricingCardProps {
  id: string;
  name: string;
  price: number;
  credits: number;
  savings: number;
  icon: any;
  iconColor: string;
  gradient: string;
  popular?: boolean;
  features: {
    music: number;
    designs: number;
    logos: number;
    videos: number;
  };
}

const tiers: PricingCardProps[] = [
  {
    id: "starter",
    name: "Starter",
    price: 5,
    credits: 170,
    savings: 2,
    icon: Sparkles,
    iconColor: "text-slate-400",
    gradient: "from-slate-500/20 to-slate-600/20",
    features: { music: 28, designs: 42, logos: 28, videos: 8 },
  },
  {
    id: "basic",
    name: "Basic",
    price: 10,
    credits: 340,
    savings: 2,
    icon: Zap,
    iconColor: "text-blue-400",
    gradient: "from-blue-500/20 to-blue-600/20",
    features: { music: 56, designs: 85, logos: 56, videos: 17 },
  },
  {
    id: "standard",
    name: "Standard",
    price: 15,
    credits: 550,
    savings: 9,
    icon: TrendingUp,
    iconColor: "text-purple-400",
    gradient: "from-purple-500/20 to-purple-600/20",
    features: { music: 91, designs: 137, logos: 91, videos: 27 },
  },
  {
    id: "plus",
    name: "Plus",
    price: 30,
    credits: 1150,
    savings: 13,
    icon: Award,
    iconColor: "text-orange-400",
    gradient: "from-orange-500/20 to-orange-600/20",
    popular: true,
    features: { music: 191, designs: 287, logos: 191, videos: 57 },
  },
  {
    id: "pro",
    name: "Pro",
    price: 60,
    credits: 2400,
    savings: 17,
    icon: Star,
    iconColor: "text-emerald-400",
    gradient: "from-emerald-500/20 to-emerald-600/20",
    features: { music: 400, designs: 600, logos: 400, videos: 120 },
  },
  {
    id: "premium",
    name: "Premium",
    price: 150,
    credits: 6250,
    savings: 20,
    icon: Crown,
    iconColor: "text-yellow-400",
    gradient: "from-yellow-500/20 to-yellow-600/20",
    features: { music: 1041, designs: 1562, logos: 1041, videos: 312 },
  },
];

interface PricingCardsCompactProps {
  showTitle?: boolean;
  maxDisplay?: number;
  layout?: "grid" | "horizontal";
}

export default function PricingCardsCompact({
  showTitle = true,
  maxDisplay = 6,
  layout = "grid",
}: PricingCardsCompactProps) {
  const displayTiers = tiers.slice(0, maxDisplay);
  const formatNumber = (num: number) => new Intl.NumberFormat("pt-PT").format(num);

  return (
    <div className="w-full">
      {showTitle && (
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Pacotes Premium
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Créditos para música, designs, logos e vídeos
          </p>
        </div>
      )}

      <div
        className={
          layout === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory"
        }
      >
        {displayTiers.map((tier) => {
          const Icon = tier.icon;

          return (
            <div
              key={tier.id}
              className={`relative flex-shrink-0 ${
                layout === "horizontal" ? "w-[300px] snap-center" : ""
              } ${tier.popular ? "md:scale-105" : ""}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-xs font-semibold text-white">
                    Popular
                  </div>
                </div>
              )}

              <div
                className={`h-full bg-gradient-to-br ${tier.gradient} backdrop-blur-xl border border-white/10 rounded-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl group ${
                  tier.popular ? "border-orange-500/30" : ""
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 bg-white/5 rounded-lg ${tier.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {tier.savings > 0 && (
                    <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                      <span className="text-xs font-medium text-green-400">-{tier.savings}%</span>
                    </div>
                  )}
                </div>

                {/* Name & Price */}
                <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-white">€{tier.price}</span>
                  <span className="text-sm text-gray-400">/mês</span>
                </div>

                {/* Credits */}
                <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Créditos Totais
                  </div>
                  <div className="text-2xl font-bold text-white">{formatNumber(tier.credits)}</div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-500">Músicas</div>
                    <div className="text-sm font-bold text-white">{formatNumber(tier.features.music)}</div>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-500">Designs</div>
                    <div className="text-sm font-bold text-white">{formatNumber(tier.features.designs)}</div>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-500">Logos</div>
                    <div className="text-sm font-bold text-white">{formatNumber(tier.features.logos)}</div>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-500">Vídeos</div>
                    <div className="text-sm font-bold text-white">{formatNumber(tier.features.videos)}</div>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  asChild
                  className={`w-full rounded-lg transition-all duration-300 ${
                    tier.popular
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                  }`}
                >
                  <Link href={`/pricing?plan=${tier.id}`}>
                    Selecionar
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="text-center mt-8">
        <Button asChild variant="outline" className="border-white/10 hover:bg-white/5">
          <Link href="/pricing">
            Ver todos os planos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
