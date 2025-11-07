"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowLeft, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import Link from "next/link";

const supabase = supabaseClient;

export default function EsqueciPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Email inválido", {
        description: "Por favor, insira um email válido"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Enviar email de recuperação usando Supabase Auth (sistema nativo)
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      if (resetError) {
        // Se houver erro, não revelar detalhes por segurança
        console.error('Erro ao enviar email:', resetError);
      }

      // SEMPRE mostrar mensagem de sucesso (segurança)
      // Não revelar se o email existe ou não
      setEmailSent(true);
      toast.success("Email enviado com sucesso! 📧", {
        description: "Verifique sua caixa de entrada"
      });

    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      toast.error("Erro ao processar solicitação", {
        description: "Tente novamente mais tarde"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
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
                className="mx-auto mb-4"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-white text-2xl">Email Enviado!</CardTitle>
              <CardDescription className="text-neutral-400 mt-2">
                Verifique sua caixa de entrada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300 flex items-start gap-2">
                  <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    Enviámos um email para <strong>{email}</strong> com as instruções para redefinir sua password.
                  </span>
                </p>
              </div>

              <div className="space-y-2 text-sm text-neutral-400">
                <p className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>O link expira em <strong className="text-white">1 hora</strong></span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Verifique a pasta de spam se não encontrar</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Pode fechar esta janela</span>
                </p>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Login
                </Button>
                
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  variant="ghost"
                  className="w-full text-neutral-400 hover:text-white"
                >
                  Tentar outro email
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-neutral-900/80 border-white/10 backdrop-blur-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-white text-2xl">Recuperar Password</CardTitle>
            <CardDescription className="text-neutral-400 mt-2">
              Insira seu email para receber o link de recuperação
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  disabled={isSubmitting}
                  className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-12"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-300">
                  Por segurança, você receberá o email apenas se a conta existir em nosso sistema.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Enviar Link de Recuperação
                    </>
                  )}
                </Button>

                <Link href="/login" className="block">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-neutral-400 hover:text-white hover:bg-white/5"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao Login
                  </Button>
                </Link>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-neutral-500">
                Não tem conta?{" "}
                <Link href="/acesso" className="text-purple-400 hover:text-purple-300 font-medium">
                  Criar conta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-neutral-600 text-xs mt-6">
          © 2025 DUA • Sistema de recuperação seguro
        </p>
      </motion.div>
    </div>
  );
}
