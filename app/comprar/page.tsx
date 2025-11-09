"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BeamsBackground } from "@/components/ui/beams-background"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { 
  CreditCard, 
  Check, 
  Loader2, 
  Zap, 
  Rocket,
  ArrowLeft,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

const supabase = supabaseClient;

interface TokenPackage {
  id: string
  name: string
  tokens_amount: number
  price: number
  popular?: boolean
  icon: any
  color: string
}

const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: "starter",
    name: "Iniciante",
    tokens_amount: 100,
    price: 4.99,
    icon: Zap,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "popular",
    name: "Popular",
    tokens_amount: 500,
    price: 19.99,
    popular: true,
    icon: Zap,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "premium",
    name: "Premium",
    tokens_amount: 1000,
    price: 34.99,
    icon: Rocket,
    color: "from-purple-600 to-pink-600"
  },
  {
    id: "ultimate",
    name: "Ultimate",
    tokens_amount: 5000,
    price: 149.99,
    icon: Rocket,
    color: "from-red-500 to-pink-500"
  }
]

export default function ComprarPage() {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userTokens, setUserTokens] = useState<number>(0)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        toast.error('Por favor, faça login primeiro')
        router.push('/login')
        return
      }

      setCurrentUser(user)
      
      // Load user tokens
      const { data: userData } = await supabase
        .from('users')
        .select('total_tokens, tokens_used')
        .eq('id', user.id)
        .single()
      
      if (userData) {
        setUserTokens(userData.total_tokens - userData.tokens_used)
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error('Erro de autenticação')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (pkg: TokenPackage) => {
    if (!currentUser) {
      toast.error('Por favor, faça login primeiro')
      router.push('/login')
      return
    }

    setProcessing(true)
    
    try {
      // In production, this would integrate with a payment gateway (Stripe, PayPal, etc.)
      // For now, we'll simulate a successful purchase
      
      toast.loading('Processando pagamento...', { id: 'payment' })
      
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add tokens to user account
      const { data: currentData } = await supabase
        .from('users')
        .select('total_tokens')
        .eq('id', currentUser.id)
        .single()
      
      if (currentData) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            total_tokens: currentData.total_tokens + pkg.tokens_amount 
          })
          .eq('id', currentUser.id)
        
        if (updateError) throw updateError
        
        // Record transaction
        await supabase.from('generation_history').insert({
          user_id: currentUser.id,
          type: 'purchase',
          prompt: `Compra de ${pkg.tokens_amount} tokens (${pkg.name})`,
          tokens_used: -pkg.tokens_amount, // Negative because it's addition
          content_generated: `Purchase: ${pkg.name} package`,
        })
        
        toast.success(`${pkg.tokens_amount} tokens adicionados`, { 
          id: 'payment',
          description: 'Sua compra foi concluída com sucesso'
        })
        
        // Refresh token count
        setUserTokens(prev => prev + pkg.tokens_amount)
        
        // Redirect to chat after 2 seconds
        setTimeout(() => {
          router.push('/chat')
        }, 2000)
      }
      
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Erro ao processar compra', { 
        id: 'payment',
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
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-screen">
      <div className="fixed inset-0 z-0">
        <BeamsBackground intensity="subtle" />
      </div>

      <PremiumNavbar className="relative z-50" credits={userTokens} />

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-8 text-white/60 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white/80 text-sm font-medium">Saldo atual: {userTokens} tokens</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Comprar Tokens
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Escolha o pacote ideal para suas necessidades criativas
            </p>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOKEN_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  "relative bg-black/40 backdrop-blur-xl rounded-2xl border transition-all duration-300",
                  pkg.popular 
                    ? "border-purple-500/50 shadow-lg shadow-purple-500/20 scale-105" 
                    : "border-white/10 hover:border-white/20"
                )}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <div className="p-6">
                  {/* Icon */}
                  <div className={cn(
                    "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6",
                    pkg.color
                  )}>
                    <pkg.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Name */}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {pkg.name}
                  </h3>

                  {/* Tokens */}
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-bold text-white">
                      {pkg.tokens_amount.toLocaleString()}
                    </span>
                    <span className="text-white/60">tokens</span>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-white">
                      €{pkg.price.toFixed(2)}
                    </span>
                    <div className="text-sm text-white/40 mt-1">
                      €{(pkg.price / pkg.tokens_amount * 100).toFixed(2)} por 100 tokens
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>Uso ilimitado</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>Todas as ferramentas</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>Suporte prioritário</span>
                    </div>
                  </div>

                  {/* Button */}
                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={processing}
                    className={cn(
                      "w-full h-12 font-semibold transition-all",
                      pkg.popular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    )}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 mr-2" />
                        Comprar Agora
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Informações de Pagamento
              </h3>
              <div className="space-y-3 text-white/80">
                <p>• <strong>Pagamento seguro:</strong> Todas as transações são processadas de forma segura</p>
                <p>• <strong>Tokens ilimitados:</strong> Seus tokens nunca expiram</p>
                <p>• <strong>Uso flexível:</strong> Use em qualquer ferramenta da plataforma</p>
                <p>• <strong>Suporte 24/7:</strong> Nossa equipe está sempre disponível para ajudar</p>
                <p className="text-yellow-400/90 mt-4">
                  🚧 <strong>Modo Demo:</strong> Sistema de pagamento em desenvolvimento. Compras são simuladas para fins de teste.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
