/**
 * Página: /login
 * 
 * Login Premium para users já registados
 * - Email + Password com validação
 * - Verificação de acesso
 * - Auditoria de login
 * - Design premium consistente
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { supabaseClient } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
// Auditoria desativada: removidas chamadas para evitar 401 em audit_logs (RLS bloqueado)
// Caso precise reativar no futuro, implementar camada segura em lib/audit-safe.ts
const audit = { pageAccess: () => {} }; // Mantém apenas pageAccess como NO-OP

const supabase = supabaseClient;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
  // Registrar acesso à página (no-op enquanto auditoria está desativada)
  audit.pageAccess();
    
    // Verificar se já está logado
    checkExistingSession();
    
    // Verificar mensagens de erro/info do OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const info = urlParams.get('info');
    
    if (error) {
      const errorMessages: Record<string, string> = {
        'no_code': 'Erro no processo de autenticação',
        'no_user': 'Não foi possível obter dados do utilizador',
        'no_access': 'Sua conta foi criada mas não tem permissão de acesso. Solicite um código de convite.',
        'user_check_failed': 'Erro ao verificar conta',
        'profile_creation_failed': 'Erro ao criar perfil',
        'callback_exception': 'Erro no processo de autenticação',
      };
      
      toast.error("Erro no login", {
        description: errorMessages[error] || error,
        duration: 5000,
      });
      
      // Limpar URL
      window.history.replaceState({}, '', '/login');
    }
    
    if (info) {
      const infoMessages: Record<string, string> = {
        'account_created_no_access': 'Conta criada com sucesso! No entanto, você precisa de um código de convite para ter acesso à plataforma.',
      };
      
      toast.info("Informação", {
        description: infoMessages[info] || info,
        duration: 6000,
      });
      
      // Limpar URL
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        toast.info("Já está autenticado", {
          description: "Redirecionando...",
        });
        router.push("/chat");
      }
    } catch (error) {
      // Usuário não está logado, continua na página
    }
  };

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
        const errorMessage = error.message === "Invalid login credentials" 
          ? "Email ou password incorretos" 
          : error.message;
        
        toast.error("Erro ao fazer login", {
          description: errorMessage,
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
        // Query com APENAS colunas que existem no schema
        .select('has_access, name, email, last_login_at')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData) {
        toast.error("Erro ao verificar conta", {
          description: "Não foi possível verificar suas permissões",
        });
        await supabase.auth.signOut();
        return;
      }

      if (!userData.has_access) {
        toast.error("Sem acesso", {
          description: "Sua conta não tem permissão de acesso",
        });
        await supabase.auth.signOut();
        return;
      }

      // Atualizar último login
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);

            // Login bem-sucedido!
      const userName = (userData && userData.name) || email.split('@')[0];
      toast.success(`Bem-vindo, ${userName}`, {
        description: "Redirecionando para o chat...",
        duration: 2000,
      });

      setTimeout(() => {
        router.push("/chat");
        router.refresh();
      }, 1000);

    } catch (error) {
      toast.error("Erro de conexão", {
        description: "Não foi possível fazer login",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast.error("Erro ao iniciar login com Google", {
          description: error.message,
        });
        setIsGoogleLoading(false);
        return;
      }

      // O redirect será automático pelo Supabase
      toast.info("Redirecionando para Google...", {
        description: "Aguarde...",
      });
    } catch (error) {
      toast.error("Erro de conexão", {
        description: "Não foi possível iniciar login com Google",
      });
      setIsGoogleLoading(false);
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
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 text-3xl font-bold text-white"
          >
            D
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
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-12 pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Features info */}
            <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <p className="text-xs text-purple-300">
                Login seguro com verificação de acesso
              </p>
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

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-neutral-900 px-4 text-neutral-500">ou</span>
              </div>
            </div>

            {/* Botão Google */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full h-12 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-3"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar com Google
                </>
              )}
            </Button>

            {/* Link Esqueci a Password */}
            <div className="text-center pt-2">
              <Link 
                href="/esqueci-password" 
                className="text-sm text-neutral-400 hover:text-purple-400 transition-colors inline-flex items-center gap-1"
              >
                Esqueci a password
              </Link>
            </div>

            {/* Link para registo */}
            <div className="pt-4 border-t border-white/5 text-center space-y-3">
              <p className="text-sm text-neutral-400">
                Não tem conta?{" "}
                <Link 
                  href="/acesso" 
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Obter acesso
                </Link>
              </p>
              <p className="text-xs text-neutral-500">
                Precisa de um código de convite para se registar
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
