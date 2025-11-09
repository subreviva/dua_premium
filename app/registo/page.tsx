"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import BeamsBackground from "@/components/ui/beams-background"

export default function RegistoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [position, setPosition] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/early-access/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setPosition(data.subscriber?.position || null)
      } else {
        setError(data.error || 'Erro ao registar. Tenta novamente.')
      }
    } catch (err) {
      setError('Erro de conexão. Verifica a tua internet e tenta novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BeamsBackground intensity="strong" className="min-h-screen">
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="w-full px-4 sm:px-8 py-6 flex items-center justify-between backdrop-blur-sm">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="rounded-full hover:bg-card/50 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-display font-extralight text-foreground tracking-tight">DUA</h1>
          </div>
          <div className="w-[100px]" />
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
          <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            
            {!isSuccess ? (
              <>
                {/* Cabeçalho com informação sobre fase de convite */}
                <div className="text-center space-y-6">
                  <div className="inline-block">
                    <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                      <span className="text-xs font-light tracking-widest text-white/60 uppercase">Acesso Exclusivo</span>
                    </div>
                  </div>
                  
                  <h2 className="text-4xl sm:text-6xl font-display font-extralight text-foreground tracking-tight">
                    Lista de Espera
                  </h2>
                  
                  <p className="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
                    Plataforma em fase exclusiva por convite.<br />
                    Regista-te para acesso antecipado.
                  </p>
                </div>

                {/* Benefícios de ser early adopter */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700" />
                    <div className="relative glass-effect rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500">
                      <h3 className="font-light text-foreground text-sm tracking-wide mb-2">Acesso Prioritário</h3>
                      <p className="text-xs text-muted-foreground/60 font-light leading-relaxed">Primeiros a aceder à plataforma</p>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700" />
                    <div className="relative glass-effect rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500">
                      <h3 className="font-light text-foreground text-sm tracking-wide mb-2">Benefícios Exclusivos</h3>
                      <p className="text-xs text-muted-foreground/60 font-light leading-relaxed">Créditos e funcionalidades premium</p>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700" />
                    <div className="relative glass-effect rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500">
                      <h3 className="font-light text-foreground text-sm tracking-wide mb-2">Comunidade Fundadora</h3>
                      <p className="text-xs text-muted-foreground/60 font-light leading-relaxed">Contacto direto com a equipa</p>
                    </div>
                  </div>
                </div>

                {/* Formulário de registo */}
                <form onSubmit={handleSubmit} className="glass-effect rounded-2xl p-8 sm:p-10 space-y-6 border border-white/10">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground/80 font-light text-sm tracking-wide">
                      Nome Completo
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="O teu nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-white/30 transition-all duration-300 h-12 text-base font-light"
                      required
                      disabled={isLoading}
                      minLength={2}
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/80 font-light text-sm tracking-wide">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="teu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-white/30 transition-all duration-300 h-12 text-base font-light"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-light">
                      {error}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground/50 font-light leading-relaxed">
                    Ao registares-te, concordas em receber notificações sobre o lançamento.{" "}
                    <button 
                      type="button" 
                      onClick={() => router.push("/terms")}
                      className="text-foreground/60 hover:text-foreground transition-colors underline underline-offset-2"
                    >
                      Termos
                    </button>
                    {" · "}
                    <button 
                      type="button" 
                      onClick={() => router.push("/privacy")}
                      className="text-foreground/60 hover:text-foreground transition-colors underline underline-offset-2"
                    >
                      Privacidade
                    </button>
                  </div>

                  <div className="relative group pt-2">
                    <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/10 to-white/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition duration-700" />
                    
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full rounded-full h-12 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white font-light text-sm tracking-wide transition-all duration-500 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-3 justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>A processar</span>
                        </span>
                      ) : (
                        'Registar na Lista de Espera'
                      )}
                    </Button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground/60 font-light">
                    Código de convite?{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/acesso")}
                      className="text-foreground/80 hover:text-foreground transition-colors font-normal"
                    >
                      Aceder aqui
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Mensagem de sucesso */
              <div className="glass-effect rounded-2xl p-10 sm:p-14 space-y-8 text-center border border-white/10 animate-in fade-in zoom-in duration-700">
                <div className="space-y-4">
                  <div className="inline-block">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/20 flex items-center justify-center backdrop-blur-xl">
                      <CheckCircle2 className="w-10 h-10 text-white/80" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl sm:text-4xl font-display font-extralight text-foreground tracking-tight">
                    Registo Confirmado
                  </h3>
                  
                  <p className="text-base text-muted-foreground/70 font-light">
                    Bem-vindo, <span className="text-foreground font-normal">{formData.name}</span>
                  </p>
                </div>

                {position && (
                  <div className="inline-block">
                    <div className="px-8 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-light tracking-widest text-white/50 uppercase">Posição</span>
                        <span className="text-2xl font-light text-white tabular-nums">#{position}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-2 max-w-md mx-auto">
                  <p className="text-sm text-muted-foreground/60 font-light leading-relaxed">
                    Confirmação enviada para<br />
                    <span className="text-foreground/80 font-normal">{formData.email}</span>
                  </p>
                  <p className="text-xs text-muted-foreground/50 font-light leading-relaxed">
                    Notificaremos assim que o acesso estiver disponível
                  </p>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/10 to-white/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition duration-700" />
                    
                    <Button
                      onClick={() => router.push("/")}
                      className="relative w-full sm:w-auto rounded-full px-10 py-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white font-light text-sm tracking-wide transition-all duration-500 hover:scale-[1.01]"
                    >
                      Voltar
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground/50 font-light">
                    Código de convite?{" "}
                    <button
                      onClick={() => router.push("/acesso")}
                      className="text-foreground/70 hover:text-foreground transition-colors font-normal"
                    >
                      Aceder
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </BeamsBackground>
  )
}
