"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, KeyRound, Mail, Sparkles, User, Lock, ArrowRight, Check } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { audit } from "@/lib/audit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function AcessoPage() {
  const router = useRouter();
  const [step, setStep] = useState("code");
  const [code, setCode] = useState("");
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [validatedCode, setValidatedCode] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Log page access
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
      toast.success("Código válido! ✅", { description: "Complete seu registo para continuar" });
      audit.codeValidation(code, true, 1);
    } catch (error) {
      // console.error("Erro ao validar código:", error);
      toast.error("Erro de conexão", { description: "Não foi possível validar o código" });
      audit.error(error as Error, 'code_validation');
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.length < 2) {
      toast.error("Nome inválido", { description: "Digite seu nome completo" });
      return;
    }
    if (!email || !email.includes("@")) {
      toast.error("Email inválido", { description: "Digite um email válido" });
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Password fraca", { description: "A password deve ter no mínimo 6 caracteres" });
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords não coincidem", { description: "Confirme sua password corretamente" });
      return;
    }
    setIsRegistering(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: { data: { name: name, invite_code: validatedCode } },
      });
      if (authError) {
        toast.error("Erro ao criar conta", { description: authError.message });
        audit.registration(false, validatedCode || undefined);
        return;
      }
      if (!authData.user) {
        toast.error("Erro ao criar conta", { description: "Não foi possível criar sua conta" });
        audit.registration(false, validatedCode || undefined);
        return;
      }
      await supabase.from('users').update({ has_access: true, invite_code_used: validatedCode }).eq('id', authData.user.id);
      await supabase.from('invite_codes').update({ active: false, used_by: authData.user.id }).eq('code', validatedCode);
      toast.success("Conta criada com sucesso! 🎉", { description: "Redirecionando para o chat...", duration: 3000 });
      audit.registration(true, validatedCode || undefined);
      setTimeout(() => { router.push("/chat"); }, 2000);
    } catch (error) {
      // console.error("Erro no registo:", error);
      toast.error("Erro de conexão", { description: "Não foi possível completar o registo" });
      audit.error(error as Error, 'user_registration');
      audit.registration(false, validatedCode || undefined);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40" style={{ backgroundImage: 'url(https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-1290-fundo%20com%20estas%20cores%20-%20para%20hero%20de%20web....jpeg)' }} />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">DUA</h1>
          <p className="text-neutral-400 text-sm">{step === "code" ? "Insira seu código de acesso" : "Complete seu registo"}</p>
        </div>
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-2 h-2 rounded-full transition-all ${step === "code" ? "bg-purple-500 w-8" : "bg-purple-500/50"}`} />
          <div className={`w-2 h-2 rounded-full transition-all ${step === "register" ? "bg-purple-500 w-8" : "bg-neutral-700"}`} />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.4 }} className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {step === "code" ? (
              <motion.form key="code-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleValidateCode} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 flex items-center gap-2"><KeyRound className="w-4 h-4" />Código de Convite</label>
                  <Input type="text" placeholder="XXXX-XXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} disabled={isValidatingCode} className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-14 text-center text-xl font-mono tracking-widest" maxLength={20} required />
                </div>
                <Button type="submit" disabled={isValidatingCode || !code} className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all">
                  {isValidatingCode ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Validando...</> : <>Validar Código<ArrowRight className="w-5 h-5 ml-2" /></>}
                </Button>
                <div className="pt-4 border-t border-white/5 text-center space-y-2">
                  <p className="text-xs text-neutral-500">Não tem um código? Entre em contato para acesso antecipado.</p>
                  <p className="text-sm text-neutral-400">Já tem conta? <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Fazer login</Link></p>
                </div>
              </motion.form>
            ) : (
              <motion.form key="register-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRegister} className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-green-400">Código {validatedCode} validado</span>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 flex items-center gap-2"><User className="w-4 h-4" />Nome Completo</label>
                  <Input type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} disabled={isRegistering} className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-12" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 flex items-center gap-2"><Mail className="w-4 h-4" />Email</label>
                  <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} disabled={isRegistering} className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-12" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 flex items-center gap-2"><Lock className="w-4 h-4" />Password</label>
                  <Input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isRegistering} className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-12" required minLength={6} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 flex items-center gap-2"><Lock className="w-4 h-4" />Confirmar Password</label>
                  <Input type="password" placeholder="Confirme sua password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isRegistering} className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-12" required minLength={6} />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" onClick={() => { setStep("code"); setValidatedCode(null); }} disabled={isRegistering} variant="outline" className="flex-1 h-12 border-white/20 text-white hover:bg-white/5">Voltar</Button>
                  <Button type="submit" disabled={isRegistering || !name || !email || !password || !confirmPassword} className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold">
                    {isRegistering ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Criando...</> : <><Sparkles className="w-5 h-5 mr-2" />Criar Conta</>}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
        <p className="text-center text-neutral-600 text-xs mt-6">© 2025 DUA • Acesso seguro via Supabase Auth</p>
      </motion.div>
    </div>
  );
}
