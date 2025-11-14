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
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { supabaseClient } from "@/lib/supabase";
import Link from "next/link";

const audit = { pageAccess: () => {} };
const supabase = supabaseClient;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/chat';
  
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
        router.push(redirectPath);
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
      
      console.log('✅ Login bem-sucedido:', {
        userId: data.user.id,
        email: data.user.email,
        redirectPath,
        session: data.session ? 'exists' : 'missing'
      });
      
      toast.success(`Bem-vindo, ${userName}`, {
        description: "Redirecionando...",
        duration: 2000,
      });

      // Aguardar para garantir que o cookie do Supabase foi setado
      // O Supabase precisa de tempo para persistir a sessão nos cookies
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('🔄 Executando redirecionamento para:', redirectPath);
      console.log('🍪 Cookies atuais:', document.cookie);
      
      router.push(redirectPath);
      router.refresh();

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
    <div className="relative min-h-screen flex items-center justify-center bg-[#000000] overflow-hidden">
      {/* Subtle gradient overlays - darker */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(30,58,138,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(88,28,135,0.04),transparent_50%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] px-5 sm:px-6 py-6 sm:py-8"
      >
        {/* Logo/Brand */}
        <div className="mb-14 sm:mb-20">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[32px] sm:text-[40px] font-normal tracking-tight text-white leading-none"
            style={{ fontFamily: 'var(--font-geist-sans)' }}
          >
            DUA
          </motion.h1>
        </div>

        {/* Welcome text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-10 sm:mb-12"
        >
          <h2 className="text-[26px] sm:text-[32px] font-light text-white mb-3 leading-tight tracking-tight">
            Bem-vindo de volta
          </h2>
          <p className="text-[15px] sm:text-[16px] text-neutral-400 font-light leading-relaxed">
            Introduza o seu email para continuar
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                disabled={isLoading}
                className="w-full h-[56px] sm:h-[60px] bg-white/[0.04] border-0 text-white placeholder:text-neutral-500 focus:bg-white/[0.08] text-[16px] sm:text-[17px] font-light rounded-2xl focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0 transition-all duration-200 px-5"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-[56px] sm:h-[60px] bg-white/[0.04] border-0 text-white placeholder:text-neutral-500 focus:bg-white/[0.08] text-[16px] sm:text-[17px] font-light rounded-2xl focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0 transition-all duration-200 px-5 pr-14"
                  required
                  minLength={6}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors touch-manipulation"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Forgot password link */}
              <div className="flex justify-end pt-1">
                <Link
                  href="/esqueci-password"
                  className="text-[14px] text-blue-400 hover:text-blue-300 transition-colors font-light"
                >
                  Esqueci a password
                </Link>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-[56px] sm:h-[60px] bg-white hover:bg-neutral-100 text-black font-normal text-[16px] sm:text-[17px] rounded-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-8 touch-manipulation active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                  />
                  A entrar
                </span>
              ) : (
                "Continuar"
              )}
            </Button>

            {/* Divider */}
            <div className="relative py-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-black px-5 text-[14px] text-neutral-500 font-light">
                  ou continue com
                </span>
              </div>
            </div>

            {/* OAuth buttons - circular */}
            <div className="flex items-center justify-center gap-4">
              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                className="w-[60px] h-[60px] sm:w-[64px] sm:h-[64px] rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center transition-all duration-200 disabled:opacity-40 touch-manipulation active:scale-95"
              >
                {isGoogleLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
                  />
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#ffffff"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#ffffff"
                      opacity="0.8"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#ffffff"
                      opacity="0.7"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#ffffff"
                      opacity="0.9"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
              </button>

              {/* Apple (placeholder) */}
              <button
                type="button"
                disabled
                className="w-[60px] h-[60px] sm:w-[64px] sm:h-[64px] rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center opacity-50 cursor-not-allowed"
              >
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </button>

              {/* Email (placeholder) */}
              <button
                type="button"
                disabled
                className="w-[60px] h-[60px] sm:w-[64px] sm:h-[64px] rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center opacity-50 cursor-not-allowed"
              >
                <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </button>
            </div>

            {/* Sign up link */}
            <div className="pt-10 text-center space-y-4">
              <p className="text-[15px] text-neutral-500 font-light">
                Não tem uma conta?
              </p>
              <Link
                href="/acesso"
                className="block text-[16px] text-white hover:text-neutral-200 transition-colors font-normal"
              >
                Criar conta
              </Link>
            </div>
          </form>
        </motion.div>

        {/* Footer - Language selector style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 pt-8 border-t border-white/[0.06]"
        >
          <div className="flex items-center justify-between text-[14px] text-neutral-600">
            <button className="hover:text-neutral-400 transition-colors font-light flex items-center gap-2">
              <span>Português</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Link href="/privacidade" className="hover:text-neutral-400 transition-colors font-light">
              Privacidade
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
