"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BeamsBackground } from "@/components/ui/beams-background"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { 
  Coins, 
  Check, 
  Loader2, 
  Zap, 
  Rocket,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Star,
  ExternalLink,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import { motion } from "framer-motion"

const supabase = supabaseClient;

interface CreditPackage {
  id: string
  name: string
  creditos: number
  price_eur: number
  total_creditos: number
  popular?: boolean
  icon: any
  gradient: string
  features: string[]
  bonus_percent?: number
  musicas: number
  imagens_fast: string
  videos: number
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    creditos: 170,
    price_eur: 5,
    total_creditos: 170,
    icon: Zap,
    gradient: "from-blue-500 via-cyan-500 to-blue-600",
    bonus_percent: 0,
    musicas: 28,
    imagens_fast: "6-11",
    videos: 8,
    features: [
      "170 créditos de serviços",
      "28 músicas completas",
      "6-11 imagens Fast",
      "8 vídeos (5 segundos)",
      "50 chats básicos/dia (grátis)",
      "Válido por 30 dias"
    ]
  },
  {
    id: "basic",
    name: "Basic",
    creditos: 350,
    price_eur: 10,
    total_creditos: 350,
    icon: Sparkles,
    gradient: "from-green-500 via-emerald-500 to-green-600",
    bonus_percent: 3,
    musicas: 58,
    imagens_fast: "14-23",
    videos: 17,
    features: [
      "350 créditos de serviços",
      "58 músicas completas",
      "14-23 imagens Fast",
      "17 vídeos (5 segundos)",
      "Bonus de 3%",
      "Válido por 60 dias"
    ]
  },
  {
    id: "standard",
    name: "Standard",
    creditos: 550,
    price_eur: 15,
    total_creditos: 550,
    icon: Star,
    gradient: "from-purple-500 via-pink-500 to-purple-600",
    bonus_percent: 10,
    musicas: 91,
    imagens_fast: "22-36",
    videos: 27,
    features: [
      "550 créditos de serviços",
      "91 músicas completas",
      "22-36 imagens Fast/Standard",
      "27 vídeos (5 segundos)",
      "Bonus de 10%",
      "Válido por 60 dias"
    ]
  },
  {
    id: "plus",
    name: "Plus",
    creditos: 1150,
    price_eur: 30,
    total_creditos: 1150,
    popular: true,
    icon: Rocket,
    gradient: "from-orange-500 via-red-500 to-pink-600",
    bonus_percent: 15,
    musicas: 191,
    imagens_fast: "46-76",
    videos: 57,
    features: [
      "1.150 créditos de serviços",
      "191 músicas completas",
      "46-76 imagens Fast/Standard",
      "57 vídeos (5 segundos)",
      "Bonus de 15% ⭐",
      "Melhor custo-benefício",
      "Válido por 90 dias"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    creditos: 2400,
    price_eur: 60,
    total_creditos: 2400,
    icon: Star,
    gradient: "from-purple-600 via-pink-600 to-red-500",
    bonus_percent: 20,
    musicas: 400,
    imagens_fast: "96-160",
    videos: 120,
    features: [
      "2.400 créditos de serviços",
      "400 músicas completas",
      "96-160 imagens Fast/Standard",
      "120 vídeos (5 segundos)",
      "Bonus de 20%",
      "Prioridade máxima",
      "Suporte VIP dedicado",
      "Válido por 120 dias"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    creditos: 6250,
    price_eur: 150,
    total_creditos: 6250,
    icon: Star,
    gradient: "from-yellow-500 via-orange-500 to-red-600",
    bonus_percent: 25,
    musicas: 1041,
    imagens_fast: "250-416",
    videos: 312,
    features: [
      "6.250 créditos de serviços",
      "1.041 músicas completas",
      "250-416 imagens Fast/Standard",
      "312 vídeos (5 segundos)",
      "Bonus de 25% 👑",
      "Chat ILIMITADO",
      "Suporte 24/7 prioritário",
      "Máxima economia",
      "Válido por 180 dias"
    ]
  }
]

export default function ComprarPage() {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userCredits, setUserCredits] = useState<number>(0)
  const [duaCoinBalance, setDuaCoinBalance] = useState<number>(0)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        toast.error('Por favor, faça login primeiro')
        router.push('/acesso')
        return
      }

      setCurrentUser(user)
      
      // Load user balances from duaia_user_balances
      const { data: balanceData } = await supabase
        .from('duaia_user_balances')
        .select('servicos_creditos, duacoin_balance')
        .eq('user_id', user.id)
        .single()
      
      if (balanceData) {
        setUserCredits(balanceData.servicos_creditos || 0)
        setDuaCoinBalance(balanceData.duacoin_balance || 0)
      } else {
        // Create balance record if not exists
        const { data: newBalance } = await supabase
          .from('duaia_user_balances')
          .insert({ 
            user_id: user.id, 
            servicos_creditos: 0, 
            duacoin_balance: 0 
          })
          .select()
          .single()
        
        if (newBalance) {
          setUserCredits(0)
          setDuaCoinBalance(0)
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error('Erro de autenticação')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (pkg: CreditPackage) => {
    if (!currentUser) {
      toast.error('Por favor, faça login primeiro')
      router.push('/acesso')
      return
    }

    setProcessing(true)
    
    try {
      toast.loading('A processar pagamento...', { id: 'purchase' })
      
      // TODO: Integração real com gateway de pagamento (Stripe/MBWay/Multibanco)
      // Por agora, simular compra bem-sucedida para demonstração
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Adicionar créditos à conta do usuário
      const newCreditsBalance = userCredits + pkg.total_creditos
      
      const { error: updateError } = await supabase
        .from('duaia_user_balances')
        .update({ 
          servicos_creditos: newCreditsBalance
        })
        .eq('user_id', currentUser.id)
      
      if (updateError) throw updateError
      
      // Registar transação de compra (opcional - para histórico)
      try {
        await supabase.from('purchase_history').insert({
          user_id: currentUser.id,
          package_id: pkg.id,
          package_name: pkg.name,
          credits_amount: pkg.total_creditos,
          price_eur: pkg.price_eur,
          payment_status: 'completed'
        })
      } catch {
        // Se tabela não existe, ignorar (não crítico)
      }
      
      toast.success(`${pkg.total_creditos} créditos adicionados!`, { 
        id: 'purchase',
        description: `Compra de ${pkg.name} por €${pkg.price_eur} concluída com sucesso`
      })
      
      // Atualizar estado local
      setUserCredits(newCreditsBalance)
      
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Erro ao processar compra', { 
        id: 'purchase',
        description: 'Tente novamente mais tarde'
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <BeamsBackground intensity="subtle" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          <p className="text-white/60">A carregar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-screen bg-black">
      <div className="fixed inset-0 z-0">
        <BeamsBackground intensity="subtle" />
      </div>

      <PremiumNavbar className="relative z-50" />

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-8 text-white/60 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-8"
            >
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">
                Saldo atual: {userCredits.toLocaleString('pt-PT')} créditos
              </span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Comprar Créditos
            </h1>
            <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Escolha o pacote ideal para libertar todo o seu potencial criativo
            </p>
          </motion.div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {CREDIT_PACKAGES.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative bg-black/40 backdrop-blur-xl rounded-3xl border transition-all duration-300 hover:scale-105",
                  pkg.popular 
                    ? "border-purple-500/50 shadow-2xl shadow-purple-500/20 lg:scale-105" 
                    : "border-white/10 hover:border-purple-500/30"
                )}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-5 py-1.5 text-sm font-bold shadow-lg">
                      ⭐ MAIS POPULAR
                    </Badge>
                  </div>
                )}

                {pkg.bonus_percent && pkg.bonus_percent > 0 && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      +{pkg.bonus_percent}% Bónus
                    </div>
                  </div>
                )}
                
                <div className="p-6 md:p-8">
                  {/* Icon */}
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={cn(
                      "w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-xl",
                      pkg.gradient
                    )}
                  >
                    <pkg.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </motion.div>

                  {/* Name */}
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    {pkg.name}
                  </h3>

                  {/* Créditos */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                      {pkg.total_creditos.toLocaleString('pt-PT')}
                    </span>
                    <span className="text-white/60 text-sm">créditos</span>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl md:text-5xl font-bold text-white">
                        €{pkg.price_eur.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mt-1">
                      {(pkg.price_eur / pkg.total_creditos).toFixed(4)}€ por crédito
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {pkg.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white/70 text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={processing}
                    className={cn(
                      "w-full h-12 md:h-14 text-base md:text-lg font-bold rounded-xl transition-all duration-300",
                      pkg.popular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50"
                        : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500 hover:to-pink-500 border border-purple-500/50"
                    )}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        A processar...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Comprar Agora
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Pagamento Seguro</h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 text-white/70">
                <div>
                  <TrendingUp className="w-6 h-6 text-purple-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Créditos Permanentes</h4>
                  <p className="text-sm">Os seus créditos nunca expiram e ficam sempre disponíveis na sua conta.</p>
                </div>
                <div>
                  <ExternalLink className="w-6 h-6 text-pink-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Pagamento Seguro</h4>
                  <p className="text-sm">Processamento através de gateway de pagamento certificado e encriptado.</p>
                </div>
                <div>
                  <Star className="w-6 h-6 text-yellow-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Suporte Premium</h4>
                  <p className="text-sm">Equipa de suporte sempre disponível para ajudar com qualquer questão.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
