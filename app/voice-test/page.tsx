"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import GeminiLiveVoiceChat from "@/components/GeminiLiveVoiceChat";
import { Button } from "@/components/ui/button";

export default function VoiceTestPage() {
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8 space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Teste do Chat de Voz DUA AI
          </h1>
          <p className="text-gray-400 text-lg">
            Teste completo da funcionalidade Google Gemini Live API - Realtime Voice
          </p>
          
          {!showVoiceChat && (
            <div className="space-y-6 mt-8">
              <div className="bg-black/40 p-6 rounded-lg border border-purple-500/30">
                <h2 className="text-xl font-semibold text-white mb-4">Configurações Ativas:</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>
                    <strong>Modelo:</strong> {process.env.NEXT_PUBLIC_MODEL_NATIVE_AUDIO || "gemini-2.5-flash-native-audio-preview-09-2025"}
                  </div>
                  <div>
                    <strong>Voz:</strong> {process.env.NEXT_PUBLIC_VOICE_NAME || "Aoede"}
                  </div>
                  <div>
                    <strong>Idioma:</strong> {process.env.NEXT_PUBLIC_LANGUAGE_CODE || "pt-PT"}
                  </div>
                  <div>
                    <strong>API Version:</strong> {process.env.NEXT_PUBLIC_GOOGLE_API_VERSION || "v1alpha"}
                  </div>
                </div>
              </div>

              <div className="bg-black/40 p-6 rounded-lg border border-green-500/30">
                <h2 className="text-xl font-semibold text-white mb-4">Funcionalidades a Testar:</h2>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✅ Conexão com Google Gemini Live API</li>
                  <li>✅ Geração de ephemeral token seguro</li>
                  <li>✅ Captura de áudio do microfone</li>
                  <li>✅ Processamento PCM 16-bit a 16kHz</li>
                  <li>✅ VAD (Voice Activity Detection) automático</li>
                  <li>✅ Reprodução de áudio da IA em português</li>
                  <li>✅ Monitoramento de custos em tempo real</li>
                  <li>✅ Rate limiting (máx 3 sessões simultâneas)</li>
                </ul>
              </div>

              <Button
                onClick={() => setShowVoiceChat(true)}
                className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition"
              >
                🎙️ Iniciar Teste de Voz Completo
              </Button>

              <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30 mt-6">
                <p className="text-yellow-200 text-sm">
                  <strong>Nota:</strong> Este teste requer HTTPS e permissões de microfone. 
                  Certifique-se de que sua chave GOOGLE_API_KEY está configurada corretamente no .env.local.
                </p>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showVoiceChat && (
            <div className="mt-8">
              <GeminiLiveVoiceChat onClose={() => setShowVoiceChat(false)} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}