"use client"

import { useState, useEffect } from "react"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import { motion } from "framer-motion"
import NumberFlow from "@number-flow/react"

const supabase = supabaseClient

interface CreditPackage {
  id: string
  name: string
  description: string
  creditos: number
  price_eur: number
  yearlyPrice: number
  savings: number
  yearlyCredits: number
  popular?: boolean
  features: string[]
  usage: {
    music: number
    images: number
    videos: number
  }
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Experimentar e validar",
    creditos: 340,
    price_eur: 10,
    yearlyPrice: 100,
    savings: 20,
    yearlyCredits: 4080,
    features: [
      "340 créditos",
      "Todos os estúdios",
      "Funcionalidades premium",
      "56 músicas OU 13 imagens OU 17 vídeos"
    ],
    usage: {
      music: 56,
      images: 13,
      videos: 17
    }
  },
  {
    id: "pro",
    name: "Pro",
    description: "Criadores e profissionais",
    creditos: 1560,
    price_eur: 40,
    yearlyPrice: 400,
    savings: 80,
    yearlyCredits: 18720,
    popular: true,
    features: [
      "1.560 créditos (+20% bonus)",
      "Todos os estúdios",
      "Funcionalidades premium",
      "Prioridade processamento",
      "260 músicas OU 62 imagens OU 78 vídeos",
      "50% dos clientes escolhem este"
    ],
    usage: {
      music: 260,
      images: 62,
      videos: 78
    }
  },
  {
    id: "premium",
    name: "Premium",
    description: "Agências e empresas",
    creditos: 5200,
    price_eur: 120,
    yearlyPrice: 1200,
    savings: 240,
    yearlyCredits: 62400,
    features: [
      "5.200 créditos (+30% bonus)",
      "Chat ILIMITADO",
      "Suporte 24/7 prioritário",
      "API access",
      "Avatar Studio incluído",
      "866 músicas OU 208 imagens OU 260 vídeos"
    ],
    usage: {
      music: 866,
      images: 208,
      videos: 260
    }
  }
]

export default function ComprarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handlePurchase = async (packageId: string, isYearly: boolean) => {
    setSelectedPlan(packageId)
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error("Autenticação necessária", {
          description: "Por favor, faça login para continuar"
        })
        router.push('/login')
        return
      }

      const pkg = CREDIT_PACKAGES.find(p => p.id === packageId)
      if (!pkg) {
        toast.error("Pacote inválido")
        return
      }

      const amount = isYearly ? pkg.yearlyPrice : pkg.price_eur
      const credits = isYearly ? pkg.yearlyCredits : pkg.creditos

      toast.success("Processando pagamento", {
        description: `${pkg.name} - €${amount}${isYearly ? '/ano' : '/mês'}`
      })

      // Aqui você integraria com Stripe/PayPal
      console.log('Purchase:', { packageId, isYearly, amount, credits })

    } catch (error: any) {
      console.error('Erro ao processar compra:', error)
      toast.error("Erro ao processar pagamento", {
        description: error.message || "Tente novamente"
      })
    } finally {
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <PremiumNavbar />
      
      <div className="pt-20 pb-24 px-4">
        {/* Header */}
        <motion.div 
          className="max-w-7xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-6">
            Escolha o seu plano
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Planos flexíveis para criadores, profissionais e empresas
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div 
          className="max-w-md mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-4 p-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all duration-300",
                billingCycle === 'monthly'
                  ? "bg-white text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all duration-300",
                billingCycle === 'yearly'
                  ? "bg-white text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Anual <span className="text-emerald-400 ml-1">(2 meses grátis)</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {CREDIT_PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="relative group"
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    MAIS POPULAR
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={cn(
                "relative h-full p-8 rounded-3xl backdrop-blur-xl transition-all duration-500",
                "bg-white/5 border border-white/10",
                "hover:bg-white/10 hover:border-white/20 hover:scale-105",
                pkg.popular && "border-amber-500/30 bg-amber-500/5"
              )}>
                {/* Plan Name */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {pkg.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">
                      <NumberFlow 
                        value={billingCycle === 'yearly' ? pkg.yearlyPrice : pkg.price_eur}
                        format={{ style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }}
                      />
                    </span>
                    <span className="text-gray-400">
                      /{billingCycle === 'yearly' ? 'ano' : 'mês'}
                    </span>
                  </div>
                  
                  {billingCycle === 'yearly' && (
                    <div className="mt-2 text-sm text-emerald-400">
                      Economize €{pkg.savings} por ano
                    </div>
                  )}

                  <div className="mt-4 text-sm text-gray-400">
                    <NumberFlow 
                      value={billingCycle === 'yearly' ? pkg.yearlyCredits : pkg.creditos}
                      format={{ notation: 'compact' }}
                    /> créditos
                    {billingCycle === 'monthly' && '/mês'}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <span className="text-sm text-gray-300 leading-tight">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePurchase(pkg.id, billingCycle === 'yearly')}
                  disabled={loading && selectedPlan === pkg.id}
                  className={cn(
                    "w-full py-4 rounded-xl font-semibold transition-all duration-300",
                    "bg-white text-black hover:bg-gray-100",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    pkg.popular && "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  )}
                >
                  {loading && selectedPlan === pkg.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando...
                    </div>
                  ) : (
                    'Começar agora'
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-5xl mx-auto mt-24"
        >
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Comparação de planos
          </h2>

          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-6 text-sm font-semibold text-gray-400">
                    Plano
                  </th>
                  <th className="text-center p-6 text-sm font-semibold text-gray-400">
                    Mensal
                  </th>
                  <th className="text-center p-6 text-sm font-semibold text-gray-400">
                    Anual (2 meses grátis)
                  </th>
                  <th className="text-center p-6 text-sm font-semibold text-gray-400">
                    Economia
                  </th>
                  <th className="text-right p-6 text-sm font-semibold text-gray-400">
                    Total Créditos/Ano
                  </th>
                </tr>
              </thead>
              <tbody>
                {CREDIT_PACKAGES.map((pkg, index) => (
                  <tr 
                    key={pkg.id}
                    className={cn(
                      "border-b border-white/5",
                      index === CREDIT_PACKAGES.length - 1 && "border-b-0"
                    )}
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-semibold">{pkg.name}</span>
                        {pkg.popular && (
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                            POPULAR
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-center text-white">
                      €{pkg.price_eur}/mês
                    </td>
                    <td className="p-6 text-center text-white">
                      €{pkg.yearlyPrice}/ano
                    </td>
                    <td className="p-6 text-center text-emerald-400">
                      €{pkg.savings}
                    </td>
                    <td className="p-6 text-right text-white font-semibold">
                      {pkg.yearlyCredits.toLocaleString()} créditos
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ/Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-3xl mx-auto mt-24 text-center"
        >
          <p className="text-gray-400 text-sm leading-relaxed">
            Todos os planos incluem acesso completo aos estúdios de criação.
            <br />
            Cancele a qualquer momento. Suporte disponível 24/7 para planos Premium.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
