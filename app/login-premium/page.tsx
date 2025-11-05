"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { audit } from "@/lib/audit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Componente de Loading Premium
const LoadingSpinner = ({ size = "default" }) => (
  <div className={`relative ${size === "small" ? "w-4 h-4" : "w-5 h-5"}`}>
    <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
    <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
  </div>
);

// Componente de Input Premium
const PremiumInput = ({ label, type = "text", placeholder, value, onChange, disabled, required, className = "" }) => (
  <div className="space-y-3">
    <label className="block text-sm font-medium text-neutral-300 tracking-wide">
      {label}
    </label>
    <div className="relative group">
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          bg-neutral-900/50 border-neutral-700/50 text-white placeholder:text-neutral-500
          h-14 px-6 rounded-xl transition-all duration-300
          focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:bg-neutral-900/70
          group-hover:border-neutral-600/50
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/0 via-violet-600/5 to-violet-600/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  </div>
);

// Componente de Button Premium
const PremiumButton = ({ children, onClick, disabled, variant = "primary", type = "button", className = "" }) => {
  const baseClasses = "h-14 px-8 rounded-xl font-medium tracking-wide transition-all duration-300 relative overflow-hidden group";
  
  const variants = {
    primary: `
      bg-gradient-to-r from-violet-600 to-purple-600 text-white
      hover:from-violet-500 hover:to-purple-500 hover:shadow-lg hover:shadow-violet-500/25
      active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
    `,
    secondary: `
      bg-neutral-800/50 border border-neutral-700/50 text-neutral-300
      hover:bg-neutral-800/70 hover:border-neutral-600/50 hover:text-white
      active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
    `,
    outline: `
      border border-neutral-700/50 text-neutral-300 bg-transparent
      hover:bg-neutral-800/30 hover:border-neutral-600/50 hover:text-white
      active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
    `
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
    </Button>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    audit.pageAccess('/login');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@") || !email.includes(".")) {
      toast.error("Email inválido", {
        description: "Digite um endereço de email válido",
      });
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Senha inválida", {
        description: "A senha deve ter no mínimo 6 caracteres",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });

      if (error) {
        toast.error("Falha no login", {
          description: error.message === "Invalid login credentials" 
            ? "Email ou senha incorretos" 
            : error.message,
        });
        audit.login(false, 'email');
        return;
      }

      if (!data.user) {
        toast.error("Erro de autenticação", {
          description: "Não foi possível fazer login",
        });
        audit.login(false, 'email');
        return;
      }

      // Verificar se user tem acesso
      const { data: userData } = await supabase
        .from('users')
        .select('has_access')
        .eq('id', data.user.id)
        .single();

      if (!userData?.has_access) {
        toast.error("Acesso negado", {
          description: "Sua conta não tem permissão de acesso",
        });
        await supabase.auth.signOut();
        audit.login(false, 'email');
        return;
      }

      toast.success("Login realizado com sucesso", {
        description: "Redirecionando para o sistema...",
        duration: 2000,
      });

      audit.login(true, 'email');

      // Redirecionar
      setTimeout(() => {
        router.push("/chat");
      }, 1000);

    } catch (error) {
      // console.error("Erro no login:", error);
      toast.error("Erro de conexão", {
        description: "Não foi possível fazer login. Tente novamente.",
      });
      audit.error(error, 'login_process');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Background Premium */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-violet-950/20"></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-3xl"></div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-8 shadow-lg shadow-violet-500/25"
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm"></div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-3 tracking-tight"
          >
            Bem-vindo de volta
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-neutral-400 text-lg"
          >
            Acesse sua conta no Music Studio
          </motion.p>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-neutral-900/30 backdrop-blur-xl border border-neutral-700/30 rounded-3xl p-10 shadow-2xl shadow-black/20"
        >
          <form onSubmit={handleLogin} className="space-y-8">
            <PremiumInput
              label="Endereço de Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />

            <PremiumInput
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                    rememberMe 
                      ? 'bg-violet-600 border-violet-600' 
                      : 'border-neutral-600 group-hover:border-neutral-500'
                  }`}>
                    {rememberMe && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="white" className="absolute inset-0.5">
                        <path d="M9.765 2.735a.5.5 0 0 1 0 .707L5.618 7.589a.5.5 0 0 1-.707 0L2.235 4.913a.5.5 0 1 1 .707-.707L5.265 6.528 9.058 2.735a.5.5 0 0 1 .707 0Z"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                  Manter-me conectado
                </span>
              </label>

              <Link 
                href="/recuperar-senha" 
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <PremiumButton
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar na conta
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8.22 2.97a.75.75 0 0 1 1.06 0L14.53 8.22a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-1.06-1.06L12.44 9H1.75a.75.75 0 0 1 0-1.5h10.69L8.22 4.03a.75.75 0 0 1 0-1.06Z"/>
                  </svg>
                </>
              )}
            </PremiumButton>

            <div className="pt-6 border-t border-neutral-700/30 text-center space-y-4">
              <p className="text-sm text-neutral-500">
                Ainda não possui uma conta?
              </p>
              <Link 
                href="/acesso-premium" 
                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium transition-colors text-sm"
              >
                Solicitar acesso por convite
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M7.22 2.97a.75.75 0 0 1 1.06 0L13.53 8.22a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-1.06-1.06L11.44 9H0.75a.75.75 0 0 1 0-1.5h10.69L7.22 4.03a.75.75 0 0 1 0-1.06Z"/>
                </svg>
              </Link>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-neutral-600 text-sm mt-8"
        >
          Conexão segura com criptografia de ponta a ponta
        </motion.p>
      </motion.div>
    </div>
  );
}