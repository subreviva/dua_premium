"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/lib/supabase";
import Link from "next/link";
import { audit } from "@/lib/audit";
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter";
import { validatePassword } from "@/lib/password-validation";
import { Eye, EyeOff } from "lucide-react";

const supabase = supabaseClient;

export default function AcessoPage() {
  const router = useRouter();
  const [step, setStep] = useState("code");
  const [code, setCode] = useState("");
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [validatedCode, setValidatedCode] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    audit.pageAccess('/acesso');
  }, []);

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      toast.error("Código inválido", { description: "O código deve ter no mínimo 6 caracteres" });
      audit.codeValidation(code, false, 1);
      return;
    }
    setIsValidatingCode(true);
    try {
      const { data, error } = await supabase.from('invite_codes').select('code, active, used_by').eq('code', code.toUpperCase()).single();
      if (error || !data) {
        toast.error("Código inválido", { description: "Este código não existe" });
        audit.codeValidation(code, false, 1);
        return;
      }
      if (!data.active) {
        toast.error("Código inativo", { description: "Este código já foi utilizado" });
        audit.codeValidation(code, false, 1);
        return;
      }
      setValidatedCode(data.code);
      setStep("register");
      toast.success("Código válido", { description: "Complete seu registo para continuar" });
      audit.codeValidation(code, true, 1);
    } catch (error) {
      toast.error("Erro de conexão", { description: "Não foi possível validar o código" });
      audit.error(error as Error, 'code_validation');
      audit.codeValidation(code, false, 1);
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!name || name.length < 2) {
      toast.error("Nome inválido", { 
        description: "O teu nome deve ter pelo menos 2 caracteres" 
      });
      return;
    }
    
    if (!email || !email.includes("@")) {
      toast.error("Email inválido", { 
        description: "Por favor, verifica o formato do email" 
      });
      return;
    }
    
    // Validação ENTERPRISE de password
    const passwordValidation = validatePassword(password, { name, email });
    
    if (!passwordValidation.isValid) {
      toast.error("Password não cumpre requisitos", { 
        description: passwordValidation.feedback[0],
        duration: 5000,
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords não coincidem", { 
        description: "Confirma a password corretamente" 
      });
      return;
    }
    
    // GDPR: Verificar consentimento
    if (!acceptedTerms) {
      toast.error("Termos não aceites", { 
        description: "Deves aceitar os Termos de Serviço e Política de Privacidade",
        duration: 5000,
      });
      return;
    }
    
    setIsRegistering(true);
    
    try {
      // Usar API de registo enterprise
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode: validatedCode,
          name,
          email: email.toLowerCase(),
          password,
          acceptedTerms,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Mostrar mensagens de erro empáticas
        toast.error(data.error || "Erro ao criar conta", { 
          description: data.message || "Por favor, tenta novamente",
          duration: 5000,
        });
        audit.registration(false, validatedCode || undefined);
        return;
      }
      
      if (data.success) {
        toast.success(data.welcomeMessage || "Conta criada com sucesso", { 
          description: "📧 Verifica o teu email para ativar a conta",
          duration: 6000,
        });
        
        audit.registration(true, validatedCode || undefined);
        
        // Redirecionar para página de verificação de email
        setTimeout(() => { 
          router.push("/auth/verify-email"); 
        }, 2000);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Erro de conexão", { 
        description: "Não foi possível completar o registo. Tenta novamente." 
      });
      audit.error(error as Error, 'user_registration');
      audit.registration(false, validatedCode || undefined);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Sophisticated background gradient - Sora style */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.06),transparent_50%)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl px-6"
      >
        
        {/* Ultra-minimal header - No icons, no logos, just typography */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-6xl font-light tracking-tight text-white mb-4"
            style={{ fontFamily: 'var(--font-geist-sans)' }}
          >
            DUA
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-neutral-500 text-sm font-light tracking-wide"
          >
            {step === "code" ? "Insira seu código de acesso" : "Complete seu registo"}
          </motion.p>
        </div>

        {/* Minimal progress indicator - No colors, just subtle dots */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div 
            className={`transition-all duration-500 ${
              step === "code" 
                ? "w-12 h-0.5 bg-white" 
                : "w-2 h-0.5 bg-neutral-800"
            }`} 
          />
          <div 
            className={`transition-all duration-500 ${
              step === "register" 
                ? "w-12 h-0.5 bg-white" 
                : "w-2 h-0.5 bg-neutral-800"
            }`} 
          />
        </div>

        {/* Main card - Ultra clean, no borders, just subtle shadow */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-neutral-950/40 backdrop-blur-2xl rounded-none p-12 shadow-2xl shadow-black/50"
        >
          <AnimatePresence mode="wait">
            {step === "code" ? (
              <motion.form 
                key="code-form" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleValidateCode} 
                className="space-y-8"
              >
                {/* Code input - No label, just placeholder */}
                <div className="space-y-4">
                  <Input 
                    type="text" 
                    placeholder="Código de convite" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value.toUpperCase())} 
                    disabled={isValidatingCode}
                    className="bg-transparent border-0 border-b border-neutral-800 text-white placeholder:text-neutral-700 focus:border-white h-16 text-center text-2xl font-light tracking-[0.5em] rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300"
                    maxLength={20}
                    required
                    autoFocus
                  />
                </div>

                {/* Submit button - Minimal */}
                <Button 
                  type="submit" 
                  disabled={isValidatingCode || !code}
                  className="w-full h-14 bg-white hover:bg-neutral-200 text-black font-light text-base tracking-wide rounded-none transition-all duration-300 disabled:opacity-30"
                >
                  {isValidatingCode ? "Validando" : "Continuar"}
                </Button>

                {/* Footer links - Ultra subtle */}
                <div className="pt-8 border-t border-neutral-900 space-y-3">
                  <p className="text-xs text-neutral-700 text-center font-light">
                    Não tem um código? Entre em contato para acesso antecipado
                  </p>
                  <p className="text-sm text-neutral-600 text-center font-light">
                    Já tem conta?{" "}
                    <Link 
                      href="/login" 
                      className="text-neutral-400 hover:text-white transition-colors duration-300"
                    >
                      Fazer login
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
                transition={{ duration: 0.4 }}
                onSubmit={handleRegister} 
                className="space-y-6"
              >
                {/* Validated code indicator - Minimal */}
                <div className="py-3 border-b border-neutral-800 mb-8">
                  <p className="text-sm text-neutral-500 font-light text-center">
                    Código {validatedCode} validado
                  </p>
                </div>

                {/* Form fields - No icons, clean labels */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs text-neutral-600 font-light tracking-wide uppercase">
                      Nome completo
                    </label>
                    <Input 
                      type="text" 
                      placeholder="Seu nome" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      disabled={isRegistering}
                      className="bg-transparent border-0 border-b border-neutral-800 text-white placeholder:text-neutral-800 focus:border-white h-12 text-base font-light rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-neutral-600 font-light tracking-wide uppercase">
                      Email
                    </label>
                    <Input 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value.toLowerCase())} 
                      disabled={isRegistering}
                      className="bg-transparent border-0 border-b border-neutral-800 text-white placeholder:text-neutral-800 focus:border-white h-12 text-base font-light rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-neutral-600 font-light tracking-wide uppercase">
                      Password
                    </label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 12 caracteres" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        disabled={isRegistering}
                        className="bg-transparent border-0 border-b border-neutral-800 text-white placeholder:text-neutral-800 focus:border-white h-12 text-base font-light rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300 pr-10"
                        required
                        minLength={12}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Meter */}
                    {password && (
                      <PasswordStrengthMeter 
                        password={password}
                        userInfo={{ name, email }}
                        showRequirements={true}
                        showEstimate={true}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-neutral-600 font-light tracking-wide uppercase">
                      Confirmar password
                    </label>
                    <div className="relative">
                      <Input 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme sua password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        disabled={isRegistering}
                        className="bg-transparent border-0 border-b border-neutral-800 text-white placeholder:text-neutral-800 focus:border-white h-12 text-base font-light rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300 pr-10"
                        required
                        minLength={12}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords não coincidem</p>
                    )}
                  </div>
                  
                  {/* GDPR Consent Checkbox */}
                  <div className="flex items-start gap-3 pt-4">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      className="mt-1 border-neutral-700 data-[state=checked]:bg-white data-[state=checked]:border-white"
                    />
                    <label 
                      htmlFor="terms" 
                      className="text-xs text-neutral-500 leading-relaxed cursor-pointer"
                    >
                      Li e aceito os{' '}
                      <Link 
                        href="/termos" 
                        target="_blank"
                        className="text-neutral-300 hover:text-white underline underline-offset-2"
                      >
                        Termos de Serviço
                      </Link>
                      {' '}e a{' '}
                      <Link 
                        href="/privacidade" 
                        target="_blank"
                        className="text-neutral-300 hover:text-white underline underline-offset-2"
                      >
                        Política de Privacidade
                      </Link>
                    </label>
                  </div>
                </div>

                {/* Action buttons - Minimal spacing */}
                <div className="flex gap-4 pt-8">
                  <Button 
                    type="button" 
                    onClick={() => { setStep("code"); setValidatedCode(null); }} 
                    disabled={isRegistering}
                    variant="ghost"
                    className="flex-1 h-14 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 rounded-none font-light text-base transition-all duration-300"
                  >
                    Voltar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isRegistering || !acceptedTerms}
                    className="flex-1 h-14 bg-white hover:bg-neutral-200 text-black font-light text-base rounded-none transition-all duration-300 disabled:opacity-30"
                  >
                    {isRegistering ? "Criando" : "Criar conta"}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Minimal footer */}
        <p className="text-center text-neutral-800 text-xs mt-12 font-light tracking-wide">
          DUA 2025
        </p>
      </motion.div>
    </div>
  );
}
