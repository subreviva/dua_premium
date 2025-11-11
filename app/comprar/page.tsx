"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Sparkles as SparklesComp } from "@/components/ui/sparkles"
import { TimelineContent } from "@/components/ui/timeline-animation"
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { 
  Coins, 
  Check, 
  Loader2, 
  Zap, 
  Rocket,
  Sparkles,
  Star,
  Shield
} from "lucide-react"
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
  yearlyPrice?: number
  popular?: boolean
  icon: any
  gradient: string
  features: string[]
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfeito para começar a explorar todo o potencial criativo da plataforma DUA",
    creditos: 170,
    price_eur: 5,
    icon: Zap,
    gradient: "from-blue-500 to-cyan-600",
    features: [
      "Starter includes:",
      "170 créditos de serviços",
      "28 músicas completas",
      "6-11 imagens Fast",
      "8 vídeos (5s)",
      "50 chats/dia gratuitos",
      "Válido por 30 dias"
    ]
  },
  {
    id: "standard",
    name: "Standard",
    description: "Melhor valor para criadores que procuram recursos avançados e mais liberdade criativa",
    creditos: 1250,
    price_eur: 30,
    yearlyPrice: 299,
    popular: true,
    icon: Star,
    gradient: "from-purple-500 to-pink-600",
    features: [
      "Tudo no Starter, mais:",
      "1.250 créditos de serviços",
      "208 músicas completas",
      "50-83 imagens Fast/Standard",
      "62 vídeos (5s)",
      "Bonus de 10%",
      "Melhor custo-benefício",
      "Válido por 60 dias"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    description: "Plano avançado com segurança aprimorada e acesso ilimitado para equipas grandes",
    creditos: 6250,
    price_eur: 150,
    yearlyPrice: 1499,
    icon: Rocket,
    gradient: "from-orange-500 to-red-600",
    features: [
      "Tudo no Standard, mais:",
      "6.250 créditos de serviços",
      "1.041 músicas completas",
      "250-416 imagens Fast/Standard",
      "312 vídeos (5s)",
      "Bonus de 25% 👑",
      "Chat ILIMITADO",
      "Suporte 24/7 VIP",
      "Válido por 180 dias"
    ]
  }
]

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
  const [selected, setSelected] = useState("0")

  const handleSwitch = (value: string) => {
    setSelected(value)
    onSwitch(value)
  }

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-gray-700 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "0" ? "text-white" : "text-gray-200"
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 to-blue-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Mensal</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "1" ? "text-white" : "text-gray-200"
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 to-blue-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">Anual</span>
        </button>
      </div>
    </div>
  )
}

export default function ComprarPage() {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userCredits, setUserCredits] = useState<number>(0)
  const [isYearly, setIsYearly] = useState(false)
  const pricingRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  // Listener em tempo real para atualizar créditos após compra
  useEffect(() => {
    if (!currentUser) return

    const channel = supabase
      .channel('purchase-credits-update')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'duaia_user_balances',
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log('[COMPRAR] Credits updated:', payload)
          if (payload.new && 'servicos_creditos' in payload.new) {
            setUserCredits((payload.new as any).servicos_creditos)
            toast.success('Créditos atualizados!', {
              description: `Novo saldo: ${(payload.new as any).servicos_creditos} créditos`
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        toast.error('Por favor, faça login primeiro')
        router.push('/acesso')
        return
      }

      setCurrentUser(user)
      
      const { data: balanceData } = await supabase
        .from('duaia_user_balances')
        .select('servicos_creditos')
        .eq('user_id', user.id)
        .single()
      
      if (balanceData) {
        setUserCredits(balanceData.servicos_creditos || 0)
      }
    } catch (error) {
      console.error('Auth error:', error)
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
      toast.loading('A redirecionar para pagamento...', { id: 'purchase' })
      
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packId: pkg.id,
          userId: currentUser.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar sessão de pagamento')
      }

      const { url } = await response.json()
      
      if (!url) {
        throw new Error('URL de checkout não recebida')
      }

      toast.success('A redirecionar para Stripe Checkout...', { id: 'purchase' })
      window.location.href = url
      
    } catch (error: any) {
      console.error('Purchase error:', error)
      toast.error('Erro ao processar compra', { 
        id: 'purchase',
        description: error.message || 'Tente novamente mais tarde'
      })
      setProcessing(false)
    }
  }

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1)

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  }

  if (loading) {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen mx-auto relative bg-black overflow-x-hidden"
      ref={pricingRef}
    >
      <PremiumNavbar className="relative z-50" />
      
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute top-0 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]"
      >
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff2c_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a01_1px,transparent_1px)] bg-[size:70px_80px]"></div>
        <SparklesComp
          density={1800}
          direction="bottom"
          speed={1}
          color="#FFFFFF"
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </TimelineContent>
      
      <TimelineContent
        animationNum={5}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute left-0 top-[-114px] w-full h-[113.625vh] flex flex-col items-start justify-start content-start flex-none flex-nowrap gap-2.5 overflow-hidden p-0 z-0"
      >
        <div className="framer-1i5axl2">
          <div
            className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] flex-none rounded-full"
            style={{
              border: "200px solid #3131f5",
              filter: "blur(92px)",
              WebkitFilter: "blur(92px)",
            }}
            data-border="true"
          ></div>
        </div>
      </TimelineContent>

      <article className="text-center mb-6 pt-32 max-w-4xl mx-auto space-y-4 relative z-50 px-4">
        <TimelineContent
          as="div"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-semibold">
              Saldo atual: {userCredits.toLocaleString('pt-PT')} créditos
            </span>
          </div>
        </TimelineContent>

        <h2 className="text-4xl md:text-5xl font-medium text-white">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            Planos que funcionam melhor para si
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-gray-300 text-lg"
        >
          Confiado por milhões, ajudamos equipas em todo o mundo. Explore qual opção é ideal para si.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={togglePricingPeriod} />
        </TimelineContent>
      </article>

      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, #206ce8 0%, transparent 70%)`,
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />

      <div className="grid md:grid-cols-3 max-w-6xl gap-6 py-6 mx-auto px-4 pb-20">
        {CREDIT_PACKAGES.map((plan, index) => (
          <TimelineContent
            key={plan.id}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={`relative text-white border-neutral-800 h-full ${
                plan.popular
                  ? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 shadow-[0px_-13px_300px_0px_#0900ff] z-20 scale-105 md:scale-110"
                  : "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 z-10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  ⭐ MAIS POPULAR
                </div>
              )}

              <CardHeader className="text-left">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", plan.gradient)}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl mb-2 font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg text-white/90">€</span>
                  <NumberFlow
                    value={isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price_eur}
                    className="text-4xl font-semibold text-white"
                  />
                  <span className="text-gray-300 ml-1 text-sm">
                    /{isYearly ? "ano" : "mês"}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-4 min-h-[60px]">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <button
                  onClick={() => handlePurchase(plan)}
                  disabled={processing}
                  className={`w-full mb-6 p-4 text-lg font-semibold rounded-xl transition-all ${
                    plan.popular
                      ? "bg-gradient-to-t from-blue-500 to-blue-600 shadow-lg shadow-blue-800 border border-blue-500 text-white hover:from-blue-600 hover:to-blue-700"
                      : "bg-gradient-to-t from-neutral-950 to-neutral-600 shadow-lg shadow-neutral-900 border border-neutral-800 text-white hover:from-neutral-900 hover:to-neutral-500"
                  } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      A processar...
                    </span>
                  ) : (
                    "Começar Agora"
                  )}
                </button>

                <div className="space-y-3 pt-4 border-t border-neutral-700">
                  <h4 className="font-medium text-base mb-3 text-white/90">
                    {plan.features[0]}
                  </h4>
                  <ul className="space-y-2.5">
                    {plan.features.slice(1).map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-3"
                      >
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300 leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>

      {/* Info Section */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <TimelineContent
          animationNum={6}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Pagamento Seguro & Garantido</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-white/70">
              <div>
                <Coins className="w-6 h-6 text-yellow-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Créditos Permanentes</h4>
                <p className="text-sm">Os seus créditos nunca expiram e ficam sempre disponíveis na sua conta.</p>
              </div>
              <div>
                <Shield className="w-6 h-6 text-green-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Pagamento Seguro</h4>
                <p className="text-sm">Processamento através de Stripe - gateway certificado e encriptado.</p>
              </div>
              <div>
                <Star className="w-6 h-6 text-purple-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Suporte Premium</h4>
                <p className="text-sm">Equipa de suporte sempre disponível para ajudar com qualquer questão.</p>
              </div>
            </div>
          </div>
        </TimelineContent>
      </div>
    </div>
  )
}
