import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleGenAI, LiveServerMessage, Session, Modality, MediaResolution } from "@google/genai";

// --- Constantes ---
const SEND_SAMPLE_RATE = 16000;
const MAX_RECONNECT_ATTEMPTS = 3;
const TOKEN_EXPIRATION_MINUTES = 25;
const MODEL_NAME = "models/gemini-2.5-flash-native-audio-preview-09-2025"; // ATUALIZADO: Modelo exato do código oficial.

// --- Tipos ---
interface UseGeminiLiveAPIProps {
  systemInstruction?: string;
  onMessage?: (text: string) => void;
  onAudio?: (audioChunk: Int16Array) => void; // ATUALIZADO: Streaming de chunks PCM
}

// --- Cache de Token ---
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Hook para interagir com a Gemini Live API (Áudio Nativo) num ambiente de NAVEGADOR.
 * Esta implementação é 100% focada no fluxo de eventos do browser, abandonando
 * os padrões de Node.js (handleTurn/waitMessage) que causavam os erros.
 */
export function useGeminiLiveAPI({
  systemInstruction = "Seja um assistente de IA conversacional.",
  onMessage,
  onAudio,
}: UseGeminiLiveAPIProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<Session | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // --- 1. Processamento de Respostas do Servidor (STREAMING) ---
  const handleServerMessage = useCallback(
    (message: LiveServerMessage) => {
      try {
        if (message.serverContent?.modelTurn?.parts) {
          for (const part of message.serverContent.modelTurn.parts) {
            // Processar texto
            if (part.text) {
              console.log("💬 Texto recebido:", part.text);
              onMessage?.(part.text);
            }
            
            // STREAMING: Enviar áudio imediatamente ao receber
            if (part.inlineData?.data && part.inlineData.mimeType) {
              const audioData = part.inlineData.data;
              console.log(`🔊 Chunk de áudio recebido (${audioData.length} bytes) - enviando para stream`);
              
              // Decodificar base64 para bytes
              const rawData = atob(audioData);
              const buffer = new ArrayBuffer(rawData.length);
              const view = new Uint8Array(buffer);
              for (let i = 0; i < rawData.length; i++) {
                view[i] = rawData.charCodeAt(i);
              }
              
              // OTIMIZAÇÃO: Usar DataView para uma conversão nativa e mais rápida
              const dataView = new DataView(buffer);
              const pcmData = new Int16Array(buffer.byteLength / 2);
              for (let i = 0; i < pcmData.length; i++) {
                // O 'true' no final indica little-endian, o formato padrão para WAV/PCM.
                pcmData[i] = dataView.getInt16(i * 2, true);
              }
              
              // Enviar imediatamente para o player de streaming
              onAudio?.(pcmData);
            }
          }
        }
        
        if (message.serverContent?.turnComplete) {
          console.log("✅ Turno do modelo completo.");
        }
      } catch (e) {
        console.error("❌ Erro ao processar mensagem do servidor:", e);
      }
    },
    [onMessage, onAudio]
  );

  // --- 2. Conexão com a API ---
  const connect = useCallback(async () => {
    if (sessionRef.current || isLoading) return;

    setIsLoading(true);
    setError(null);
    console.log("🔌 Conectando à Live API...");

    try {
      if (!cachedToken || Date.now() > cachedToken.expiresAt) {
        console.log("🔑 Obtendo novo token ephemeral...");
        const response = await fetch("/api/auth/ephemeral-token", { method: "POST" });
        if (!response.ok) throw new Error(`Falha ao obter token: ${response.statusText}`);
        const data = await response.json();
        cachedToken = { token: data.token, expiresAt: Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000 };
        console.log("🔑 Token obtido com sucesso.");
      } else {
        console.log("🔑 Usando token em cache.");
      }

      const ai = new GoogleGenAI({ apiKey: cachedToken.token });

      const connectionConfig = {
        model: MODEL_NAME,
        config: {
            responseModalities: [Modality.AUDIO],
            mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Aoede', // Voz feminina suave e profissional para a DUA
                }
              }
            },
            contextWindowCompression: {
              triggerTokens: '25600',
              slidingWindow: { targetTokens: '12800' },
            },
            systemInstruction: {
              parts: [{
                text: systemInstruction,
              }]
            },
        },
        callbacks: {
          onopen: () => {
            console.log("✅ Live API conectada!");
            setIsConnected(true);
            setIsLoading(false);
            reconnectAttemptsRef.current = 0;
          },
          onmessage: handleServerMessage,
          onerror: (e: any) => {
            console.error("❌ Erro na Live API:", e.message || e);
            setError(e.message || "Ocorreu um erro na conexão.");
            setIsLoading(false);
            setIsConnected(false);
          },
          onclose: (e: CloseEvent) => {
            console.log(`🔌 Live API desconectada (Code: ${e.code}, Reason: ${e.reason}, Clean: ${e.wasClean})`);
            setIsConnected(false);
            setIsLoading(false);
            sessionRef.current = null;
            if (!e.wasClean && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
              reconnectAttemptsRef.current++;
              console.log(`🔄 Tentando reconectar (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
              setTimeout(() => connect(), 2000);
            }
          },
        },
      };

      console.log("📡 Configuração da conexão:", JSON.stringify(connectionConfig.config, null, 2));
      sessionRef.current = await ai.live.connect(connectionConfig);

    } catch (e) {
      const err = e as Error;
      console.error("❌ Falha fatal ao conectar:", err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [handleServerMessage, systemInstruction]);

  // --- 3. Captura e Envio de Áudio (MODERNIZADO COM AUDIOWORKLET) ---
  const startAudioCapture = useCallback(async () => {
    if (isRecording) return;
    
    if (!sessionRef.current || !isConnected) {
      console.warn("Tentativa de gravar sem conexão. Conectando primeiro...");
      await connect();
      // Aguarda a conexão ser estabelecida antes de continuar
      await new Promise<void>(resolve => {
        const interval = setInterval(() => {
          if (sessionRef.current && isConnected) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    }

    console.log("🎤 Iniciando captura de áudio com AudioWorklet (alta performance)...");
    try {
      // MELHORIA: Simplificar a criação do AudioContext (webkit prefix obsoleto)
      audioContextRef.current = new AudioContext({ sampleRate: SEND_SAMPLE_RATE });
      console.log(`🎧 AudioContext criado com sampleRate: ${audioContextRef.current.sampleRate}Hz`);
      
      // Carregar o módulo AudioWorklet (processamento em thread separada)
      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');
      console.log("✅ AudioWorklet módulo carregado");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Criar AudioWorkletNode com configuração de resampling
      audioWorkletNodeRef.current = new AudioWorkletNode(
        audioContextRef.current, 
        'resampling-processor',
        {
          processorOptions: {
            targetSampleRate: SEND_SAMPLE_RATE
          }
        }
      );
      console.log("✅ AudioWorkletNode criado");

      // O worklet processa áudio numa thread separada e envia os dados PCM de volta
      audioWorkletNodeRef.current.port.onmessage = (event) => {
        if (!sessionRef.current || !isConnected) return;

        // Receber o buffer PCM processado (já em Int16)
        const pcmData = new Int16Array(event.data);

        // Converter para base64 de forma otimizada
        let binary = '';
        const bytes = new Uint8Array(pcmData.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = window.btoa(binary);

        try {
          // Enviar para a API Gemini em tempo real
          sessionRef.current.sendRealtimeInput({
            audio: {
              mimeType: `audio/pcm;rate=${SEND_SAMPLE_RATE}`,
              data: base64Audio,
            },
          });
        } catch (e) {
          console.error("❌ Erro ao enviar áudio:", e);
        }
      };

      // Conectar o pipeline de áudio
      source.connect(audioWorkletNodeRef.current);
      // Não conectar ao destination para evitar feedback do microfone
      
      setIsRecording(true);
      console.log("✅ Captura de áudio iniciada com sucesso");
    } catch (e) {
      const err = e as Error;
      console.error("❌ Falha ao iniciar captura de áudio:", err);
      setError("Permissão de microfone negada ou dispositivo não encontrado.");
    }
  }, [isConnected, isRecording, connect]);

  // --- 4. Parar Captura de Áudio ---
  const stopAudioCapture = useCallback(() => {
    if (!isRecording) return;
    console.log("🛑 Parando captura de áudio...");

    // Parar todas as tracks do stream de mídia
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    
    // Fechar e limpar o AudioWorkletNode
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.close();
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
      console.log("✅ AudioWorkletNode desconectado e limpo");
    }
    
    // Fechar o AudioContext
    audioContextRef.current?.close();
    
    mediaStreamRef.current = null;
    audioContextRef.current = null;

    // CORREÇÃO: Enviar sinal de fim de stream de áudio
    // Isto permite que a API saiba que o utilizador terminou de falar
    if (sessionRef.current) {
      try {
        sessionRef.current.sendRealtimeInput({
          audioStreamEnd: true,
        });
        console.log("🏁 Fim de stream de áudio enviado.");
      } catch (e) {
        console.error("❌ Erro ao enviar fim de stream:", e);
      }
    }

    setIsRecording(false);
  }, [isRecording]);

  // --- 5. Funções de Controlo ---
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopAudioCapture();
    } else {
      startAudioCapture();
    }
  }, [isRecording, startAudioCapture, stopAudioCapture]);

  const closeSession = useCallback(() => {
    console.log("🚪 Fechando sessão...");
    stopAudioCapture();
    sessionRef.current?.close();
    sessionRef.current = null;
  }, [stopAudioCapture]);

  // --- 6. Efeito de Limpeza ---
  useEffect(() => {
    return () => {
      closeSession();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    connect,
    toggleRecording,
    closeSession, // Adicionado
    stopAudioCapture, // Adicionado
    isConnected,
    isRecording,
    isLoading,
    error,
  };
}
