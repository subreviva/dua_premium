"use client";

import { Check, Minus } from "lucide-react";

interface ComparisonFeature {
  name: string;
  category: string;
  starter: boolean | string | number;
  basic: boolean | string | number;
  standard: boolean | string | number;
  plus: boolean | string | number;
  pro: boolean | string | number;
  premium: boolean | string | number;
}

const features: ComparisonFeature[] = [
  // Créditos
  {
    name: "Créditos Totais",
    category: "Créditos",
    starter: "170",
    basic: "340",
    standard: "550",
    plus: "1.150",
    pro: "2.400",
    premium: "6.250",
  },
  {
    name: "Economia vs. Avulso",
    category: "Créditos",
    starter: "2%",
    basic: "2%",
    standard: "9%",
    plus: "13%",
    pro: "17%",
    premium: "20%",
  },
  {
    name: "Validade dos Créditos",
    category: "Créditos",
    starter: "30 dias",
    basic: "60 dias",
    standard: "90 dias",
    plus: "6 meses",
    pro: "1 ano",
    premium: "Sem expiração",
  },

  // Música
  {
    name: "Gerações de Música",
    category: "Música AI",
    starter: "28",
    basic: "56",
    standard: "91",
    plus: "191",
    pro: "400",
    premium: "1.041",
  },
  {
    name: "Qualidade de Áudio",
    category: "Música AI",
    starter: "Standard",
    basic: "High",
    standard: "High",
    plus: "Ultra",
    pro: "Ultra",
    premium: "Studio Master",
  },
  {
    name: "Download WAV",
    category: "Música AI",
    starter: false,
    basic: false,
    standard: true,
    plus: true,
    pro: true,
    premium: true,
  },
  {
    name: "Stems Separados",
    category: "Música AI",
    starter: false,
    basic: false,
    standard: false,
    plus: true,
    pro: true,
    premium: true,
  },

  // Design
  {
    name: "Gerações de Design",
    category: "Design Studio",
    starter: "42",
    basic: "85",
    standard: "137",
    plus: "287",
    pro: "600",
    premium: "1.562",
  },
  {
    name: "Logos Profissionais",
    category: "Design Studio",
    starter: "28",
    basic: "56",
    standard: "91",
    plus: "191",
    pro: "400",
    premium: "1.041",
  },
  {
    name: "Resolução Máxima",
    category: "Design Studio",
    starter: "1080p",
    basic: "2K",
    standard: "2K",
    plus: "4K",
    pro: "4K",
    premium: "8K",
  },
  {
    name: "Formatos de Export",
    category: "Design Studio",
    starter: "PNG, JPG",
    basic: "PNG, JPG, SVG",
    standard: "PNG, JPG, SVG",
    plus: "PNG, JPG, SVG, PDF",
    pro: "Todos + PSD",
    premium: "Todos + Fontes",
  },

  // Vídeo
  {
    name: "Gerações de Vídeo",
    category: "Vídeo AI",
    starter: "8",
    basic: "17",
    standard: "27",
    plus: "57",
    pro: "120",
    premium: "312",
  },
  {
    name: "Duração Máxima",
    category: "Vídeo AI",
    starter: "5s",
    basic: "10s",
    standard: "15s",
    plus: "30s",
    pro: "60s",
    premium: "120s",
  },
  {
    name: "Resolução de Vídeo",
    category: "Vídeo AI",
    starter: "720p",
    basic: "1080p",
    standard: "1080p",
    plus: "2K",
    pro: "4K",
    premium: "4K HDR",
  },

  // Suporte & Extras
  {
    name: "Suporte Técnico",
    category: "Suporte",
    starter: "Email",
    basic: "Email",
    standard: "Prioritário",
    plus: "24/7 Chat",
    pro: "24/7 + Telefone",
    premium: "Dedicado",
  },
  {
    name: "Templates Premium",
    category: "Extras",
    starter: "Básico",
    basic: "50+",
    standard: "100+",
    plus: "200+",
    pro: "500+",
    premium: "Ilimitado",
  },
  {
    name: "Uso Comercial",
    category: "Extras",
    starter: true,
    basic: true,
    standard: true,
    plus: true,
    pro: true,
    premium: true,
  },
  {
    name: "API Access",
    category: "Extras",
    starter: false,
    basic: false,
    standard: false,
    plus: false,
    pro: true,
    premium: true,
  },
];

const categories = Array.from(new Set(features.map((f) => f.category)));

const plans = [
  { id: "starter", name: "Starter", price: 5 },
  { id: "basic", name: "Basic", price: 10 },
  { id: "standard", name: "Standard", price: 15 },
  { id: "plus", name: "Plus", price: 30, popular: true },
  { id: "pro", name: "Pro", price: 60 },
  { id: "premium", name: "Premium", price: 150 },
];

export default function PricingComparison() {
  const renderCell = (value: boolean | string | number) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-400 mx-auto" />
      ) : (
        <Minus className="w-5 h-5 text-gray-600 mx-auto" />
      );
    }
    return <span className="text-sm font-medium text-gray-300">{value}</span>;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[1200px]">
        {/* Header */}
        <div className="grid grid-cols-7 gap-4 mb-6">
          <div className="col-span-1" />
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative text-center p-4 rounded-t-xl ${
                plan.popular
                  ? "bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-2 border-orange-500/30"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-xs font-semibold text-white">
                    Mais Popular
                  </div>
                </div>
              )}
              <div className="text-lg font-bold text-white">{plan.name}</div>
              <div className="text-2xl font-bold text-white mt-2">€{plan.price}</div>
              <div className="text-xs text-gray-400">/mês</div>
            </div>
          ))}
        </div>

        {/* Features by Category */}
        {categories.map((category, categoryIndex) => (
          <div key={category} className="mb-8">
            {/* Category Header */}
            <div className="bg-gradient-to-r from-white/10 to-transparent backdrop-blur-xl border-l-4 border-blue-500 px-4 py-3 mb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{category}</h3>
            </div>

            {/* Features */}
            {features
              .filter((f) => f.category === category)
              .map((feature, featureIndex) => (
                <div
                  key={feature.name}
                  className={`grid grid-cols-7 gap-4 items-center py-4 ${
                    featureIndex % 2 === 0 ? "bg-white/5" : "bg-transparent"
                  } hover:bg-white/10 transition-colors`}
                >
                  <div className="col-span-1 px-4">
                    <span className="text-sm font-medium text-gray-300">{feature.name}</span>
                  </div>
                  <div className="text-center">{renderCell(feature.starter)}</div>
                  <div className="text-center">{renderCell(feature.basic)}</div>
                  <div className="text-center">{renderCell(feature.standard)}</div>
                  <div className="text-center">{renderCell(feature.plus)}</div>
                  <div className="text-center">{renderCell(feature.pro)}</div>
                  <div className="text-center">{renderCell(feature.premium)}</div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
