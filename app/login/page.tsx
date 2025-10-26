"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Sparkles, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import BeamsBackground from "@/components/ui/beams-background"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Login data:", formData)
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
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Bem-vindo de Volta</h2>
              <p className="text-muted-foreground">Entra na tua conta para continuar a criar</p>
            </div>

            <form onSubmit={handleSubmit} className="glass-effect rounded-2xl p-6 sm:p-8 space-y-6">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground">
                    Palavra-passe
                  </Label>
                  <button type="button" className="text-xs text-primary hover:underline">
                    Esqueceste-te?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="A tua palavra-passe"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-background/50 border-border/50 focus:border-primary transition-colors h-11 pr-10"
                    required
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

              <Button
                type="submit"
                className="w-full rounded-full h-11 bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
              >
                Entrar
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou continua com</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-background/50 border-border/50 hover:bg-card/50 hover:border-primary/50 transition-all duration-300"
                >
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-background/50 border-border/50 hover:bg-card/50 hover:border-primary/50 transition-all duration-300"
                >
                  GitHub
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Não tens conta?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/registo")}
                  className="text-primary hover:underline font-medium"
                >
                  Criar conta
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </BeamsBackground>
  )
}
