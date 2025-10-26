"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Sparkles, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import BeamsBackground from "@/components/ui/beams-background"

export default function RegistoPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle registration logic here
    console.log("Registration data:", formData)
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
            <div className="relative">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/30 -z-10" />
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground tracking-tight">DUA IA</h1>
          </div>
          <div className="w-[100px]" />
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
          <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Criar Conta</h2>
              <p className="text-muted-foreground">Junta-te à comunidade criativa lusófona</p>
            </div>

            <form onSubmit={handleSubmit} className="glass-effect rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="O teu nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background/50 border-border/50 focus:border-primary transition-colors h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-background/50 border-border/50 focus:border-primary transition-colors h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Palavra-passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-background/50 border-border/50 focus:border-primary transition-colors h-11 pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirmar Palavra-passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repete a palavra-passe"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="bg-background/50 border-border/50 focus:border-primary transition-colors h-11 pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Ao criar uma conta, concordas com os nossos{" "}
                <button type="button" className="text-primary hover:underline">
                  Termos de Serviço
                </button>{" "}
                e{" "}
                <button type="button" className="text-primary hover:underline">
                  Política de Privacidade
                </button>
                .
              </div>

              <Button
                type="submit"
                className="w-full rounded-full h-11 bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
              >
                Criar Conta
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Já tens conta?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-primary hover:underline font-medium"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </BeamsBackground>
  )
}
