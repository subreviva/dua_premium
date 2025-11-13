"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function WaitlistPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSuccess(true)
    
    setTimeout(() => {
      setIsSuccess(false)
      setName("")
      setEmail("")
    }, 3000)
  }

  const benefits = [
    {
      title: "Acesso Prioritário",
      description: "Seja um dos primeiros a experimentar a plataforma"
    },
    {
      title: "Benefícios Exclusivos",
      description: "Créditos extras e funcionalidades premium"
    },
    {
      title: "Comunidade Fundadora",
      description: "Faça parte do grupo seleto de early adopters"
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background minimalista */}
      <div className="fixed inset-0 bg-black">
        <motion.div 
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-950/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-950/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-2xl space-y-16">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            {/* Badge minimalista */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block"
            >
              <div className="px-6 py-2 rounded-full bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]">
                <span className="text-xs font-extralight tracking-[0.3em] text-white/40 uppercase">
                  Acesso Exclusivo
                </span>
              </div>
            </motion.div>

            {/* Título ultra-fino */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-6xl md:text-8xl font-extralight tracking-[-0.02em] leading-[0.9]"
            >
              <span className="bg-gradient-to-b from-white/90 via-white/60 to-white/30 bg-clip-text text-transparent">
                Lista de Espera
              </span>
            </motion.h1>

            {/* Subtítulo refinado */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base text-white/30 font-extralight tracking-wide max-w-md mx-auto leading-relaxed"
            >
              Junte-se aos pioneiros que terão acesso antecipado à próxima geração de criação com IA
            </motion.p>
          </motion.div>

          {/* Benefícios minimalistas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.15 }}
                className="group relative"
              >
                <div className="space-y-4 p-8 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:border-white/10 transition-all duration-500">
                  <div className="h-px w-8 bg-gradient-to-r from-white/20 to-transparent" />
                  <h3 className="text-sm font-light text-white/80 tracking-wide">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-white/30 font-extralight leading-relaxed tracking-wide">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Formulário ou Success State */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="relative"
          >
            <div className="p-12 rounded-[2rem] bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]">
              {isSuccess ? (
                // Success State minimalista
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 150, damping: 15 }}
                    className="w-20 h-20 mx-auto rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
                  </motion.div>
                  <h3 className="text-2xl font-extralight text-white/90 tracking-wide">
                    Bem-vindo à lista
                  </h3>
                  <p className="text-sm text-white/30 font-extralight tracking-wide">
                    Em breve você receberá informações sobre o acesso antecipado
                  </p>
                </motion.div>
              ) : (
                // Formulário minimalista
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-extralight text-white/40 tracking-widest uppercase">
                        Nome
                      </label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-white/[0.02] border-white/[0.05] text-white placeholder:text-white/20 focus:border-white/10 h-14 rounded-2xl font-light text-base tracking-wide transition-all duration-300"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-xs font-extralight text-white/40 tracking-widest uppercase">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/[0.02] border-white/[0.05] text-white placeholder:text-white/20 focus:border-white/10 h-14 rounded-2xl font-light text-base tracking-wide transition-all duration-300"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-[10px] text-white/20 font-extralight text-center tracking-wider leading-relaxed">
                      Ao registrar-se, você concorda com nossos{" "}
                      <button type="button" className="underline hover:text-white/30 transition-colors">
                        Termos
                      </button>
                      {" "}e{" "}
                      <button type="button" className="underline hover:text-white/30 transition-colors">
                        Política de Privacidade
                      </button>
                    </p>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-extralight text-sm tracking-[0.2em] uppercase transition-all duration-500 disabled:opacity-30"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 border border-white/30 border-t-white/80 rounded-full animate-spin" />
                          <span>Processando</span>
                        </div>
                      ) : (
                        "Entrar na Lista"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>

          {/* Link minimalista para página de código de convite */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="text-center"
          >
            <p className="text-xs text-white/20 font-extralight tracking-wider">
              Já tem um código de convite?{" "}
              <button
                onClick={() => router.push("/acesso")}
                className="text-white/40 hover:text-white/60 underline underline-offset-4 transition-colors duration-300"
              >
                Aceder aqui
              </button>
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
