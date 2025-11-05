/**
 * Página: /acesso
 * 
 * UI simples para validar código de convite tipo Sora/Suno.
 * 
 * Funcionalidades:
 * - Input do código de convite
 * - Input do email
 * - Validação em tempo real
 * - Feedback de sucesso/erro
 * - Envio do magic link
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, KeyRound, Mail, Sparkles } from "lucide-react";

export default function AcessoPage() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /**
   * Valida e submete o código de convite
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!code || code.length < 6) {
      toast.error("Código inválido", {
        description: "O código deve ter no mínimo 6 caracteres",
      });
      return;
    }

    if (!email || !email.includes("@")) {
      toast.error("Email inválido", {
        description: "Digite um email válido",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Chamar API para validar código
      const response = await fetch("/api/validate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
          email: email.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toast.success("Acesso concedido! 🎉", {
          description: data.message,
          duration: 5000,
        });

        // Limpar campos
        setCode("");
        setEmail("");
      } else {
        toast.error("Erro ao validar código", {
          description: data.message || "Código inválido ou já utilizado",
        });
      }
    } catch (error) {
      console.error("Erro ao validar código:", error);
      toast.error("Erro de conexão", {
        description: "Não foi possível validar o código. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Background Image com blur */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40"
          style={{
            backgroundImage: 'url(https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-1290-fundo%20com%20estas%20cores%20-%20para%20hero%20de%20web....jpeg)'
          }}
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-3xl" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">DUA</h1>
          <p className="text-neutral-400 text-sm">
            Acesso exclusivo • Early Access
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          {success ? (
            // Mensagem de sucesso
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Acesso Concedido!
              </h2>
              <p className="text-neutral-300 mb-6">
                Verifique seu email para o link de acesso mágico.
              </p>
              <Button
                onClick={() => setSuccess(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Validar outro código
              </Button>
            </motion.div>
          ) : (
            // Form de validação
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo: Código */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Código de Convite
                </label>
                <Input
                  type="text"
                  placeholder="XXXXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-12 text-center text-lg font-mono tracking-widest"
                  maxLength={20}
                  required
                />
              </div>

              {/* Campo: Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  disabled={isLoading}
                  className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-12"
                  required
                />
              </div>

              {/* Botão Submit */}
              <Button
                type="submit"
                disabled={isLoading || !code || !email}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Footer Info */}
          {!success && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-xs text-neutral-500 text-center">
                Não tem um código? Entre em contato para acesso antecipado.
              </p>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-neutral-600 text-xs mt-6">
          © 2025 DUA • Acesso seguro via Supabase Auth
        </p>
      </motion.div>
    </div>
  );
}
