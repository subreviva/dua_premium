"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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

// Componente de Progress Steps Premium
const ProgressSteps = ({ currentStep }) => (
  <div className="flex items-center justify-center gap-4 mb-12">
    <div className="flex items-center gap-3">
      <div className={`relative w-10 h-10 rounded-full border-2 transition-all duration-500 ${
        currentStep === "code" 
          ? "border-violet-400 bg-violet-400/10" 
          : "border-violet-600 bg-violet-600"
      }`}>
        <div className="absolute inset-2 rounded-full bg-current opacity-20"></div>
        <div className="absolute inset-3 rounded-full bg-current"></div>
      </div>
      <div className={`h-px w-16 transition-all duration-500 ${
        currentStep === "register" ? "bg-violet-600" : "bg-neutral-700"
      }`}></div>
      <div className={`relative w-10 h-10 rounded-full border-2 transition-all duration-500 ${
        currentStep === "register" 
          ? "border-violet-400 bg-violet-400/10" 
          : "border-neutral-700 bg-neutral-800"
      }`}>
        <div className="absolute inset-2 rounded-full bg-current opacity-20"></div>
        {currentStep === "register" && (
          <div className="absolute inset-3 rounded-full bg-current"></div>
        )}
      </div>
    </div>
  </div>
);

// Componente de Input Premium
const PremiumInput = ({ label, type = "text", placeholder, value, onChange, disabled, required, minLength, maxLength, className = "" }) => (
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
        minLength={minLength}
        maxLength={maxLength}
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

export default function AcessoPage() {
  const router = useRouter();
  const [step, setStep] = useState("code");
  const [code, setCode] = useState("");
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [validatedCode, setValidatedCode] = useState(null);
  const [codeInfo, setCodeInfo] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    audit.pageAccess('/acesso');
  }, []);

  const handleValidateCode = async (e) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      toast.error("Código inválido", { 
        description: "O código deve ter no mínimo 6 caracteres" 
      });
      audit.codeValidation(code, false, 1);
      return;
    }

    setIsValidatingCode(true);
    
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('code, active, used_by, credits')
        .eq('code', code.toUpperCase())
        .single();

      if (error || !data) {
        toast.error("Código não encontrado", { 
          description: "Este código não existe no sistema" 
        });
        audit.codeValidation(code, false, 1);
        return;
      }

      if (!data.active) {
        toast.error("Código já utilizado", { 
          description: "Este código já foi usado por outro usuário" 
        });
        audit.codeValidation(code, false, 1);
        return;
      }

      setValidatedCode(data.code);
      setCodeInfo(data);
      setStep("register");
      
      toast.success("Código validado com sucesso", { 
        description: "Prossiga para completar seu registro" 
      });
      audit.codeValidation(code, true, 1);

    } catch (error) {
      // console.error("Erro ao validar código:", error);
      toast.error("Erro de conexão", { 
        description: "Não foi possível validar o código. Tente novamente." 
      });
      audit.error(error, 'code_validation');
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!name || name.length < 2) {
      toast.error("Nome incompleto", { 
        description: "Digite seu nome completo" 
      });
      return;
    }

    if (!email || !email.includes("@") || !email.includes(".")) {
      toast.error("Email inválido", { 
        description: "Digite um endereço de email válido" 
      });
      return;
    }

    if (!password || password.length < 8) {
      toast.error("Senha muito fraca", { 
        description: "A senha deve ter no mínimo 8 caracteres" 
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Senhas não coincidem", { 
        description: "Confirme sua senha corretamente" 
      });
      return;
    }

    setIsRegistering(true);

    try {
      // Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: { 
          data: { 
            name: name, 
            invite_code: validatedCode 
          } 
        },
      });

      if (authError) {
        toast.error("Erro ao criar conta", { 
          description: authError.message 
        });
        audit.registration(false, validatedCode);
        return;
      }

      if (!authData.user) {
        toast.error("Falha na criação", { 
          description: "Não foi possível criar sua conta" 
        });
        audit.registration(false, validatedCode);
        return;
      }

      // Atualizar dados do usuário
      await supabase
        .from('users')
        .update({ 
          has_access: true, 
          invite_code_used: validatedCode 
        })
        .eq('id', authData.user.id);

      // Marcar código como usado
      await supabase
        .from('invite_codes')
        .update({ 
          active: false, 
          used_by: authData.user.id 
        })
        .eq('code', validatedCode);

      toast.success("Conta criada com sucesso", { 
        description: "Redirecionando para o sistema...", 
        duration: 3000 
      });
      
      audit.registration(true, validatedCode);

      // Redirecionar após delay
      setTimeout(() => {
        router.push("/chat");
      }, 2000);

    } catch (error) {
      // console.error("Erro no registro:", error);
      toast.error("Erro de conexão", { 
        description: "Não foi possível completar o registro" 
      });
      audit.error(error, 'user_registration');
      audit.registration(false, validatedCode);
    } finally {
      setIsRegistering(false);
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
        className="relative z-10 w-full max-w-lg px-6"
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
            Music Studio
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-neutral-400 text-lg"
          >
            {step === "code" ? "Acesso exclusivo por convite" : "Complete seu registro"}
          </motion.p>
        </div>

        {/* Progress Steps */}
        <ProgressSteps currentStep={step} />

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-neutral-900/30 backdrop-blur-xl border border-neutral-700/30 rounded-3xl p-10 shadow-2xl shadow-black/20"
        >
          <AnimatePresence mode="wait">
            {step === "code" ? (
              <motion.form
                key="code-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleValidateCode}
                className="space-y-8"
              >
                <PremiumInput
                  label="Código de Convite"
                  type="text"
                  placeholder="Digite seu código"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isValidatingCode}
                  maxLength={20}
                  required
                  className="text-center text-xl font-mono tracking-widest"
                />

                <PremiumButton
                  type="submit"
                  disabled={isValidatingCode || !code}
                  className="w-full"
                >
                  {isValidatingCode ? (
                    <>
                      <LoadingSpinner size="small" />
                      Validando código...
                    </>
                  ) : (
                    <>
                      Validar código
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8.22 2.97a.75.75 0 0 1 1.06 0L14.53 8.22a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-1.06-1.06L12.44 9H1.75a.75.75 0 0 1 0-1.5h10.69L8.22 4.03a.75.75 0 0 1 0-1.06Z"/>
                      </svg>
                    </>
                  )}
                </PremiumButton>

                <div className="pt-6 border-t border-neutral-700/30 space-y-4">
                  <p className="text-sm text-neutral-500 text-center leading-relaxed">
                    Os códigos de acesso são distribuídos mediante convite.<br/>
                    Entre em contato para solicitar acesso antecipado.
                  </p>
                  <p className="text-center">
                    <Link 
                      href="/login" 
                      className="text-violet-400 hover:text-violet-300 font-medium transition-colors text-sm"
                    >
                      Já possui uma conta? Faça login
                    </Link>
                  </p>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister}
                className="space-y-6"
              >
                {/* Code Validation Success */}
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                      <path d="M9.765 2.735a.5.5 0 0 1 0 .707L5.618 7.589a.5.5 0 0 1-.707 0L2.235 4.913a.5.5 0 1 1 .707-.707L5.265 6.528 9.058 2.735a.5.5 0 0 1 .707 0Z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-medium">Código {validatedCode} validado</span>
                    {codeInfo?.credits && (
                      <span className="text-emerald-300/80 text-sm ml-2">
                        • {codeInfo.credits} créditos
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <PremiumInput
                    label="Nome Completo"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isRegistering}
                    required
                  />

                  <PremiumInput
                    label="Endereço de Email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    disabled={isRegistering}
                    required
                  />

                  <PremiumInput
                    label="Senha"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isRegistering}
                    required
                    minLength={8}
                  />

                  <PremiumInput
                    label="Confirmar Senha"
                    type="password"
                    placeholder="Digite novamente sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isRegistering}
                    required
                    minLength={8}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <PremiumButton
                    variant="outline"
                    onClick={() => {
                      setStep("code");
                      setValidatedCode(null);
                      setCodeInfo(null);
                    }}
                    disabled={isRegistering}
                    className="flex-1"
                  >
                    Voltar
                  </PremiumButton>

                  <PremiumButton
                    type="submit"
                    disabled={isRegistering || !name || !email || !password || !confirmPassword}
                    className="flex-1"
                  >
                    {isRegistering ? (
                      <>
                        <LoadingSpinner size="small" />
                        Criando conta...
                      </>
                    ) : (
                      <>
                        Criar conta
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3.707 6.707l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L7 8.586l3.293-3.293a1 1 0 011.414 1.414z"/>
                        </svg>
                      </>
                    )}
                  </PremiumButton>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-neutral-600 text-sm mt-8"
        >
          Plataforma segura com criptografia avançada
        </motion.p>
      </motion.div>
    </div>
  );
}