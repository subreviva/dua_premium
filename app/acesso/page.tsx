/**
 * Página: /acesso
 * 
 * Sistema de Acesso Ultra-Premium - Estilo Vercel/v0.dev
 * - Validação de código de convite
 * - Registo com validação em tempo real
 * - Design minimalista e elegante
 * - Sistema de créditos inicial
 * - Animações fluidas
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Mail, Lock, User, Eye, EyeOff, 
  Sparkles, ArrowRight, Check, ShieldCheck, Gift 
} from "lucide-react";
import { supabaseClient } from "@/lib/supabase";
import Link from "next/link";

const supabase = supabaseClient;

// Retry com backoff para rate limiting
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (error?.status !== 429 && !error?.message?.includes('rate limit')) {
        throw error;
      }
      
      if (i === maxRetries - 1) throw error;
      
      const delay = initialDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Validação de password em tempo real
const validatePasswordStrength = (pwd: string) => {
  const checks = {
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  return {
    ...checks,
    score,
    strength: score <= 1 ? 'Fraca' : score <= 2 ? 'Média' : score <= 3 ? 'Boa' : 'Forte',
    color: score <= 1 ? 'red' : score <= 2 ? 'orange' : score <= 3 ? 'yellow' : 'green',
  };
};

export default function AcessoPage() {
  const router = useRouter();
  
  // Steps: code -> register -> success
  const [step, setStep] = useState<'code' | 'register' | 'success'>('code');
  
  // Code validation
  const [code, setCode] = useState("");
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [validatedCode, setValidatedCode] = useState<string | null>(null);
  
  // Registration
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");

  // Password strength
  const passwordStrength = password ? validatePasswordStrength(password) : null;

  // Email validation
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Email inválido");
    } else {
      setEmailError("");
    }
  };

  // Password matching validation
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("As passwords não coincidem");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length < 6) {
      toast.error("Código inválido");
      return;
    }

    setIsValidatingCode(true);

    try {
      const { data, error } = await retryWithBackoff(async () => {
        return await supabase
          .from('invite_codes')
          .select('code, active, used_by')
          .ilike('code', code)
          .limit(1)
          .single();
      });

      if (error || !data) {
        toast.error("Código não encontrado");
        setIsValidatingCode(false);
        return;
      }

      if (!data.active) {
        toast.error("Código desativado");
        setIsValidatingCode(false);
        return;
      }

      if (data.used_by) {
        toast.error("Código já utilizado");
        setIsValidatingCode(false);
        return;
      }

      // Código válido!
      setValidatedCode(data.code);
      toast.success("Código válido!", {
        description: "Complete o seu registo",
      });
      
      setTimeout(() => {
        setStep('register');
      }, 500);

    } catch (error) {
      toast.error("Erro ao validar código");
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!name || name.length < 2) {
      setNameError("Nome deve ter pelo menos 2 caracteres");
      toast.error("Verifique o nome");
      return;
    }

    if (!email || emailError) {
      toast.error("Verifique o email");
      return;
    }

    if (!password || password.length < 8) {
      toast.error("Password deve ter pelo menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As passwords não coincidem");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Aceite os termos para continuar");
      return;
    }

    setIsRegistering(true);

    try {
      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
            invite_code: validatedCode,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error("Este email já está registado");
        } else {
          toast.error("Erro ao criar conta");
        }
        setIsRegistering(false);
        return;
      }

      if (!authData.user) {
        toast.error("Erro ao criar conta");
        setIsRegistering(false);
        return;
      }

      // 2. Criar perfil em users com has_access = true e créditos iniciais
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email.toLowerCase().trim(),
          name: name.trim(),
          has_access: true,
          credits: 100, // Créditos iniciais
          invite_code_used: validatedCode,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        // Não bloqueamos - perfil pode ser criado via trigger
      }

      // 3. Marcar código como usado
      await supabase
        .from('invite_codes')
        .update({ 
          used_by: authData.user.id,
          used_at: new Date().toISOString(),
        })
        .eq('code', validatedCode);

      // Sucesso!
      setStep('success');
      
      setTimeout(() => {
        router.push('/chat');
      }, 3000);

    } catch (error) {
      console.error('Erro no registo:', error);
      toast.error("Erro ao completar registo");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
      
      <AnimatePresence mode="wait">
        {step === 'code' && (
          <motion.div
            key="code"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-[440px]"
          >
            {/* Logo */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="inline-flex items-center gap-2 mb-6"
              >
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-black" />
                </div>
                <span className="text-2xl font-bold text-white">DUA</span>
              </motion.div>
              <h1 className="text-3xl font-semibold text-white mb-2">Obter Acesso</h1>
              <p className="text-[15px] text-white/50">
                Insira o seu código de convite
              </p>
            </div>

            {/* Code Card */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl space-y-6">
              
              {/* Benefits */}
              <div className="space-y-3 p-5 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
                <p className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Benefícios do Acesso
                </p>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    100 créditos iniciais grátis
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Acesso a todos os studios IA
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Suporte prioritário
                  </li>
                </ul>
              </div>

              {/* Code Form */}
              <form onSubmit={handleValidateCode} className="space-y-5">
                <div className="space-y-2.5">
                  <label className="text-[15px] font-medium text-white/80 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Código de Convite
                  </label>
                  <input
                    type="text"
                    placeholder="DUA-XXXX-XXXX"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    disabled={isValidatingCode}
                    className="w-full h-14 rounded-2xl bg-white/[0.04] border border-white/[0.12] text-white placeholder:text-white/30 px-5 text-[15px] font-mono tracking-wider text-center focus:border-white/[0.25] focus:ring-2 focus:ring-white/10 transition-all disabled:opacity-40 outline-none"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-white/40 text-center">
                    Formato: DUA-3CTK-MVZ
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isValidatingCode || !code || code.length < 6}
                  className="w-full h-16 rounded-2xl bg-white text-black hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-[15px] shadow-xl flex items-center justify-center gap-2"
                >
                  {isValidatingCode ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    <>
                      Validar Código
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="pt-6 border-t border-white/[0.08] text-center">
                <p className="text-[15px] text-white/60">
                  Já tem conta?{" "}
                  <Link 
                    href="/login"
                    className="text-white font-medium hover:underline transition-all"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-white/30 text-xs mt-8">
              Precisa de um código? Contacte-nos • © 2025 DUA
            </p>
          </motion.div>
        )}

        {step === 'register' && (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-[440px]"
          >
            {/* Logo */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="inline-flex items-center gap-2 mb-6"
              >
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-black" />
                </div>
                <span className="text-2xl font-bold text-white">DUA</span>
              </motion.div>
              <h1 className="text-3xl font-semibold text-white mb-2">Complete o Registo</h1>
              <p className="text-[15px] text-white/50">
                Código validado • Crie a sua conta
              </p>
            </div>

            {/* Register Card */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl space-y-6">
              
              <form onSubmit={handleRegister} className="space-y-5">
                {/* Name */}
                <div className="space-y-2.5">
                  <label className="text-[15px] font-medium text-white/80 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError("");
                    }}
                    disabled={isRegistering}
                    className={`w-full h-14 rounded-2xl bg-white/[0.04] border ${
                      nameError ? 'border-red-500/50' : 'border-white/[0.12]'
                    } text-white placeholder:text-white/30 px-5 text-[15px] focus:border-white/[0.25] focus:ring-2 focus:ring-white/10 transition-all disabled:opacity-40 outline-none`}
                    required
                    minLength={2}
                  />
                  {nameError && (
                    <p className="text-xs text-red-400">{nameError}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2.5">
                  <label className="text-[15px] font-medium text-white/80 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value.toLowerCase());
                      validateEmail(e.target.value);
                    }}
                    onBlur={() => validateEmail(email)}
                    disabled={isRegistering}
                    className={`w-full h-14 rounded-2xl bg-white/[0.04] border ${
                      emailError ? 'border-red-500/50' : 'border-white/[0.12]'
                    } text-white placeholder:text-white/30 px-5 text-[15px] focus:border-white/[0.25] focus:ring-2 focus:ring-white/10 transition-all disabled:opacity-40 outline-none`}
                    required
                  />
                  {emailError && (
                    <p className="text-xs text-red-400">{emailError}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2.5">
                  <label className="text-[15px] font-medium text-white/80 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isRegistering}
                      className="w-full h-14 rounded-2xl bg-white/[0.04] border border-white/[0.12] text-white placeholder:text-white/30 px-5 pr-14 text-[15px] focus:border-white/[0.25] focus:ring-2 focus:ring-white/10 transition-all disabled:opacity-40 outline-none"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordStrength && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              passwordStrength.color === 'red' ? 'bg-red-500 w-1/4' :
                              passwordStrength.color === 'orange' ? 'bg-orange-500 w-1/2' :
                              passwordStrength.color === 'yellow' ? 'bg-yellow-500 w-3/4' :
                              'bg-green-500 w-full'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength.color === 'red' ? 'text-red-400' :
                          passwordStrength.color === 'orange' ? 'text-orange-400' :
                          passwordStrength.color === 'yellow' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {passwordStrength.strength}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2.5">
                  <label className="text-[15px] font-medium text-white/80 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirmar Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repita a password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isRegistering}
                      className={`w-full h-14 rounded-2xl bg-white/[0.04] border ${
                        passwordError ? 'border-red-500/50' : 'border-white/[0.12]'
                      } text-white placeholder:text-white/30 px-5 pr-14 text-[15px] focus:border-white/[0.25] focus:ring-2 focus:ring-white/10 transition-all disabled:opacity-40 outline-none`}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-400">{passwordError}</p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 p-4 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-white checked:border-white"
                  />
                  <label htmlFor="terms" className="text-xs text-white/60 leading-relaxed cursor-pointer">
                    Aceito os{" "}
                    <Link href="/termos" className="text-white hover:underline">
                      Termos de Serviço
                    </Link>
                    {" "}e{" "}
                    <Link href="/privacidade" className="text-white hover:underline">
                      Política de Privacidade
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    isRegistering || 
                    !name || 
                    !email || 
                    !password || 
                    !confirmPassword || 
                    !acceptedTerms ||
                    !!emailError ||
                    !!passwordError ||
                    !!nameError
                  }
                  className="w-full h-16 rounded-2xl bg-white text-black hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-[15px] shadow-xl flex items-center justify-center gap-2 mt-6"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar Conta
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Back to code */}
              <div className="pt-6 border-t border-white/[0.08] text-center">
                <button
                  onClick={() => setStep('code')}
                  className="text-[15px] text-white/60 hover:text-white/80 transition-colors"
                >
                  ← Voltar ao código
                </button>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-white/30 text-xs mt-8">
              Registo seguro via Supabase • © 2025 DUA
            </p>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-[440px] text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-6"
            >
              <Check className="w-10 h-10 text-green-400" />
            </motion.div>

            <h1 className="text-3xl font-semibold text-white mb-3">
              Conta Criada!
            </h1>
            <p className="text-[15px] text-white/60 mb-2">
              Bem-vindo ao DUA
            </p>
            <p className="text-sm text-white/40 mb-8">
              Redirecionando para o chat...
            </p>

            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Créditos iniciais</span>
                  <span className="text-white font-semibold">100</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Acesso completo</span>
                  <Check className="w-4 h-4 text-green-400" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
