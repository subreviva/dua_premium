"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Shield, Check } from "lucide-react";
import Link from "next/link";

const supabase = supabaseClient;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    // Verificar se há hash de recuperação do Supabase
    checkRecoverySession();
  }, []);

  const checkRecoverySession = async () => {
    try {
      // Verificar se há sessão de recuperação ativa
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao verificar sessão:', error);
        setIsValid(false);
        toast.error("Sessão inválida", {
          description: "Link de recuperação inválido ou expirado"
        });
        setIsValidating(false);
        return;
      }

      // Se há sessão, o link é válido
      if (session) {
        setIsValid(true);
      } else {
        // Tentar verificar se há parâmetros de recuperação na URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        
        if (accessToken && type === 'recovery') {
          setIsValid(true);
        } else {
          setIsValid(false);
          toast.error("Link inválido", {
            description: "Este link expirou ou já foi usado"
          });
        }
      }
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const validateToken = async (tokenValue: string) => {
    // Função não é mais necessária - Supabase gerencia automaticamente
    return;
  };

  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: "", color: "" };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: "Fraca", color: "text-red-500" };
    if (score === 3) return { score, label: "Média", color: "text-yellow-500" };
    if (score === 4) return { score, label: "Forte", color: "text-blue-500" };
    return { score, label: "Muito Forte", color: "text-green-500" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password muito curta", {
        description: "A password deve ter no mínimo 8 caracteres"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords não coincidem", {
        description: "As passwords devem ser iguais"
      });
      return;
    }

    const strength = getPasswordStrength(password);
    if (strength.score < 3) {
      toast.error("Password fraca", {
        description: "Use letras maiúsculas, minúsculas e números"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Atualizar password usando Supabase Auth (sistema nativo)
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // Obter ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Atualizar metadados do usuário
        const { error: userError } = await supabase
          .from('users')
          .update({
            password_changed_at: new Date().toISOString(),
            failed_login_attempts: 0,
            account_locked_until: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        // Não bloquear se houver erro (tabela pode não existir ainda)
        if (userError) {
          console.error('Aviso ao atualizar metadados:', userError);
        }
      }

      setResetSuccess(true);
      toast.success("Password alterada com sucesso", {
        description: "Redirecionando para o login..."
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao resetar password:', error);
      toast.error("Erro ao alterar password", {
        description: error.message || "Tente novamente"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Validando link...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-neutral-900/80 border-white/10 backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-white text-2xl">Link Inválido</CardTitle>
              <CardDescription className="text-neutral-400 mt-2">
                Este link de recuperação expirou ou já foi usado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/esqueci-password" className="block">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500">
                  Solicitar Novo Link
                </Button>
              </Link>
              <Link href="/login" className="block">
                <Button variant="ghost" className="w-full text-neutral-400 hover:text-white">
                  Voltar ao Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-neutral-900/80 border-white/10 backdrop-blur-xl">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-white text-2xl">Password Alterada!</CardTitle>
              <CardDescription className="text-neutral-400 mt-2">
                Sua password foi alterada com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                <p className="text-sm text-green-300">
                  Redirecionando para o login...
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-neutral-900/80 border-white/10 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white text-2xl">Nova Password</CardTitle>
            <CardDescription className="text-neutral-400 mt-2">
              Escolha uma password forte e segura
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Nova Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-12 pr-12"
                    required
                    minLength={8}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            strength.score <= 2 ? 'bg-red-500' :
                            strength.score === 3 ? 'bg-yellow-500' :
                            strength.score === 4 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(strength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${strength.color}`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-500' : 'text-neutral-500'}`}>
                        <Check className="w-3 h-3" />
                        <span>Mínimo 8 caracteres</span>
                      </div>
                      <div className={`flex items-center gap-2 ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-green-500' : 'text-neutral-500'}`}>
                        <Check className="w-3 h-3" />
                        <span>Letras maiúsculas e minúsculas</span>
                      </div>
                      <div className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-500' : 'text-neutral-500'}`}>
                        <Check className="w-3 h-3" />
                        <span>Números</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirmar Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repita a password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    As passwords não coincidem
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !password || !confirmPassword || password !== confirmPassword}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Alterar Password
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <Link href="/login" className="text-sm text-purple-400 hover:text-purple-300">
                Voltar ao Login
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-neutral-600 text-xs mt-6">
          © 2025 DUA • Reset de password seguro
        </p>
      </motion.div>
    </div>
  );
}
