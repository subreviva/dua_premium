"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, LogOut } from "lucide-react";
import { supabaseClient } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function AcessoNegadoPage() {
  const router = useRouter();
  const supabase = supabaseClient;

  useEffect(() => {
    // Log de tentativa de acesso negado
    console.warn('[ACESSO-NEGADO] Usuário tentou acessar área admin sem permissões');
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-gray-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 text-center"
      >
        {/* Ícone de Acesso Negado */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-white mb-3">
          Acesso Negado
        </h1>

        {/* Mensagem */}
        <p className="text-gray-400 mb-6">
          Não tens permissões para aceder a esta área. 
          Esta secção é restrita a administradores.
        </p>

        {/* Informação Adicional */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-400">
            ⚠️ Esta tentativa de acesso foi registada nos logs de segurança.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/chat')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Chat
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Terminar Sessão
          </Button>
        </div>

        {/* Nota de Rodapé */}
        <p className="text-xs text-gray-600 mt-6">
          Se acreditas que deverias ter acesso, contacta um administrador.
        </p>
      </motion.div>
    </div>
  );
}
