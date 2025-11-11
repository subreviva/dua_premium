"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BeamsBackground } from "@/components/ui/beams-background"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { CheckCircle2, Coins, Loader2, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { supabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

export default function CompraSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState<number>(0)

  useEffect(() => {
    checkPurchase()
  }, [sessionId])

  const checkPurchase = async () => {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser()
      
      if (!user) {
        router.push('/acesso')
        return
      }

      // Buscar saldo atualizado
      const { data: balanceData } = await supabaseClient
        .from('duaia_user_balances')
        .select('servicos_creditos')
        .eq('user_id', user.id)
        .single()

      if (balanceData) {
        setCredits(balanceData.servicos_creditos || 0)
      }

      toast.success('Compra realizada com sucesso!')
    } catch (error) {
      console.error('Error checking purchase:', error)
      toast.error('Erro ao verificar compra')
    } finally {
      setLoading(false)
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
          <p className="text-white/60">A verificar compra...</p>
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
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-8"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Pagamento Concluído!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/70 mb-8"
            >
              Os seus créditos foram adicionados à conta
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-12"
            >
              <Coins className="w-8 h-8 text-yellow-400" />
              <div className="text-left">
                <p className="text-sm text-white/60">Saldo Total</p>
                <p className="text-3xl font-bold text-white">
                  {credits.toLocaleString('pt-PT')} créditos
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => router.push('/dashboard')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
              >
                Começar a criar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={() => router.push('/comprar')}
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/5 px-8"
              >
                Ver outros pacotes
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
