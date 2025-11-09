"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Check, Loader2, RefreshCw } from "lucide-react";
import { supabaseClient } from "@/lib/supabase";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [lastResend, setLastResend] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Countdown para reenviar email
    if (lastResend) {
      const interval = setInterval(() => {
        const secondsLeft = 60 - Math.floor((Date.now() - lastResend) / 1000);
        if (secondsLeft <= 0) {
          setCountdown(0);
          clearInterval(interval);
        } else {
          setCountdown(secondsLeft);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lastResend]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user?.email) {
        toast.error("Erro", { description: "Não foi possível encontrar o teu email" });
        return;
      }

      const { error } = await supabaseClient.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        toast.error("Erro ao reenviar", { description: error.message });
      } else {
        toast.success("Email reenviado", { 
          description: "Verifica a tua caixa de entrada e spam" 
        });
        setLastResend(Date.now());
      }
    } catch (error) {
      toast.error("Erro", { description: "Não foi possível reenviar o email" });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_50%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg px-6"
      >
        <div className="bg-neutral-950/40 backdrop-blur-2xl rounded-2xl p-12 shadow-2xl shadow-black/50 border border-neutral-900">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
              <div className="relative bg-neutral-900 p-6 rounded-full border border-neutral-800">
                <Mail className="w-12 h-12 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl font-semibold text-white">
              Verifica o teu email
            </h1>
            <p className="text-neutral-400 leading-relaxed">
              Enviámos um link de confirmação para o teu email.
              Clica no link para ativar a tua conta.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-8">
            <StepItem 
              number={1}
              text="Abre o teu email"
              completed={false}
            />
            <StepItem 
              number={2}
              text="Clica no link de confirmação"
              completed={false}
            />
            <StepItem 
              number={3}
              text="A tua conta será ativada automaticamente"
              completed={false}
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending || countdown > 0}
              className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800"
              variant="outline"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : countdown > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reenviar em {countdown}s
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reenviar email
                </>
              )}
            </Button>

            <Button
              onClick={() => router.push("/login")}
              variant="ghost"
              className="w-full h-12 text-neutral-400 hover:text-white"
            >
              Já verificaste? Fazer login
            </Button>
          </div>

          {/* Help text */}
          <div className="mt-8 pt-8 border-t border-neutral-900">
            <p className="text-xs text-neutral-600 text-center">
              Não recebeste o email?{" "}
              <span className="text-neutral-400">
                Verifica a pasta de spam ou lixo eletrónico
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface StepItemProps {
  number: number;
  text: string;
  completed: boolean;
}

function StepItem({ number, text, completed }: StepItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className={`
        flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0
        ${completed ? 'bg-green-500/20 border-green-500/50' : 'bg-neutral-900 border-neutral-800'}
        border transition-colors
      `}>
        {completed ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <span className="text-sm text-neutral-500">{number}</span>
        )}
      </div>
      <p className={`text-sm pt-1 ${completed ? 'text-green-400' : 'text-neutral-400'}`}>
        {text}
      </p>
    </div>
  );
}
