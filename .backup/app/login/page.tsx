/**
 * Página: /login
 * 
 * Login para users já registados
 * Email + Password
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Email inválido", {
        description: "Digite um email válido",
      });
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Password inválida", {
        description: "A password deve ter no mínimo 6 caracteres",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Login com Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });

      if (error) {
        toast.error("Erro ao fazer login", {
          description: error.message === "Invalid login credentials" 
            ? "Email ou password incorretos" 
            : error.message,
        });
        return;
      }

      if (!data.user) {
        toast.error("Erro ao fazer login", {
          description: "Não foi possível autenticar",
        });
        return;
      }

      // Verificar se user tem acesso
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('has_access')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData || !userData.has_access) {
        toast.error("Sem acesso", {
          description: "Sua conta não tem permissão de acesso",
        });
        await supabase.auth.signOut();
        return;
      }

      // Login bem-sucedido!
      toast.success("Bem-vindo de volta! 🎉", {
        description: "Redirecionando...",
        duration: 2000,
      });

      setTimeout(() => {
        router.push("/chat");
      }, 1000);

    } catch (error) {
      // console.error("Erro no login:", error);
      toast.error("Erro de conexão", {
        description: "Não foi possível fazer login",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Background */}
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
            Bem-vindo de volta
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
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

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <Input
                type="password"
                placeholder="Sua password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-12"
                required
                minLength={6}
              />
            </div>

            {/* Botão Login */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {/* Link para registo */}
            <div className="pt-4 border-t border-white/5 text-center">
              <p className="text-sm text-neutral-400">
                Não tem conta?{" "}
                <Link 
                  href="/acesso" 
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Obter acesso
                </Link>
              </p>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-neutral-600 text-xs mt-6">
          © 2025 DUA • Login seguro via Supabase Auth
        </p>
      </motion.div>
    </div>
  );
}
