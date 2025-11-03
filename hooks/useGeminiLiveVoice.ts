import { useEffect, useRef, useState, useCallback } from "react";
import { GoogleGenAI, Modality } from "@google/genai";

interface UseGeminiLiveVoiceProps {
  onMessage?: (message: string) => void;
  onAudio?: (audioData: Blob) => void;
  systemInstruction?: string;
  language?: string;
  voiceName?: string;
}

interface SessionMetrics {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  audioInputTokens: number;
  audioOutputTokens: number;
  estimatedCost: number;
}

export function useGeminiLiveVoice({
  onMessage,
  onAudio,
  systemInstruction = "Você é um assistente português amigável e útil.",
  language = "pt-PT",
  voiceName = "Aoede",
}: UseGeminiLiveVoiceProps) {
  const sessionRef = useRef<any>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs para áudio
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Métricas de custo e uso
  const metricsRef = useRef<SessionMetrics>({
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    audioInputTokens: 0,
    audioOutputTokens: 0,
    estimatedCost: 0,
  });

  // 1. INICIALIZAR SESSÃO
  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtém token do backend
      const tokenResponse = await fetch("/api/auth/ephemeral-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!tokenResponse.ok) {
        throw new Error("Falha ao obter token de autenticação");
      }

      const { token, model } = await tokenResponse.json();

      // Cria cliente com token
      aiRef.current = new GoogleGenAI({
        apiKey: token,
        httpOptions: { apiVersion: "v1alpha" },
      });

      // Configuração otimizada para português
      const config: any = {
        responseModalities: [Modality.AUDIO], // Apenas áudio (economiza custos)
        systemInstruction,
        speechConfig: {
          languageCode: language,
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName,
            },
          },
        },
        
        // OTIMIZAÇÃO: Reduz contexto a 32k tokens para economizar
        // (suficiente para conversa típica)
        contextWindow: 32000,

        // OTIMIZAÇÃO: Ativa VAD automático (reduz processamento)
        realtimeInputConfig: {
          automaticActivityDetection: {
            disabled: false,
            startOfSpeechSensitivity: "START_SENSITIVITY_LOW",
            endOfSpeechSensitivity: "END_SENSITIVITY_LOW",
            silenceDurationMs: 500, // Aguarda 500ms de silêncio
          },
        },

        // OTIMIZAÇÃO: Ativa diálogo afetivo (melhor qualidade)
        enableAffectiveDialog: true,
      };

      // Conecta à API
      sessionRef.current = await aiRef.current.live.connect({
        model: model,
        config: config,
        callbacks: {
          onopen: () => {
            console.log("✅ Conexão de voz ao vivo estabelecida");
            setIsConnected(true);
            setError(null);
          },
          onmessage: (message: any) => {
            // Processa mensagens do servidor
            if (message.text) {
              onMessage?.(message.text);
            }

            if (message.data) {
              // Áudio em base64
              try {
                const audioBlob = new Blob(
                  [Buffer.from(message.data, "base64")],
                  { type: "audio/pcm;rate=24000" }
                );
                onAudio?.(audioBlob);
              } catch (e) {
                console.error("Erro ao processar áudio:", e);
              }
            }

            // Rastreia uso de tokens
            if (message.usageMetadata) {
              updateMetrics(message.usageMetadata);
            }
          },
          onerror: (error: any) => {
            console.error("Erro na sessão de voz:", error);
            setError(error.message || "Erro desconhecido");
            setIsConnected(false);
          },
          onclose: () => {
            console.log("❌ Conexão de voz fechada");
            setIsConnected(false);
          },
        },
      });

      setIsLoading(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Erro ao inicializar sessão:", errorMsg);
      setError(errorMsg);
      setIsLoading(false);
    }
  }, [onMessage, onAudio, systemInstruction, language, voiceName]);

  // 2. ENVIAR TEXTO
  const sendText = useCallback(async (text: string) => {
    if (!sessionRef.current || !isConnected) {
      setError("Conexão não estabelecida");
      return;
    }

    try {
      await sessionRef.current.sendClientContent({
        turns: {
          role: "user",
          parts: [{ text }],
        },
        turnComplete: true,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao enviar";
      console.error("Erro ao enviar texto:", errorMsg);
      setError(errorMsg);
    }
  }, [isConnected]);

  // 3. INICIAR GRAVAÇÃO DE ÁUDIO
  const startAudioCapture = useCallback(async () => {
    try {
      if (!isConnected) {
        setError("Conexão não estabelecida. Inicialize primeiro.");
        return;
      }

      // Solicita permissão de microfone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      
      // Cria contexto de áudio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Configura pipeline de processamento
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Processador de áudio (ScriptProcessorNode - deprecated mas ainda funciona)
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Converte áudio para PCM 16-bit a 16kHz (formato obrigatório)
      processor.onaudioprocess = async (event) => {
        const audioData = event.inputBuffer.getChannelData(0);
        
        // Reamostra para 16kHz se necessário
        const resampledData = resampleAudio(audioData, audioContext.sampleRate, 16000);

        // Converte para PCM 16-bit
        const pcmData = new Int16Array(resampledData.length);
        for (let i = 0; i < resampledData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, resampledData[i])) * 0x7FFF;
        }

        // Envia para Gemini
        if (sessionRef.current) {
          try {
            await sessionRef.current.sendRealtimeInput({
              audio: {
                data: Buffer.from(pcmData).toString("base64"),
                mimeType: "audio/pcm;rate=16000",
              },
            });
          } catch (e) {
            console.error("Erro ao enviar áudio:", e);
          }
        }
      };

      setIsRecording(true);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao aceder ao microfone";
      console.error("Erro ao iniciar áudio:", errorMsg);
      setError(errorMsg);
    }
  }, [isConnected]);

  // 4. PARAR GRAVAÇÃO
  const stopAudioCapture = useCallback(() => {
    // Desconecta processador
    if (processorRef.current && audioContextRef.current) {
      processorRef.current.disconnect();
      sourceRef.current?.disconnect();
    }

    // Fecha contexto de áudio
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // Para stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Sinaliza fim do stream
    if (sessionRef.current) {
      try {
        sessionRef.current.sendRealtimeInput({ audioStreamEnd: true });
      } catch (e) {
        console.error("Erro ao sinalizar fim:", e);
      }
    }

    setIsRecording(false);
  }, []);

  // 5. FECHAR SESSÃO
  const closeSession = useCallback(() => {
    stopAudioCapture();
    
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {
        console.error("Erro ao fechar sessão:", e);
      }
      sessionRef.current = null;
    }

    setIsConnected(false);
  }, [stopAudioCapture]);

  // Função auxiliar: reamostragem de áudio
  const resampleAudio = (data: Float32Array, originalRate: number, targetRate: number) => {
    if (originalRate === targetRate) return data;

    const ratio = originalRate / targetRate;
    const newLength = Math.round(data.length / ratio);
    const result = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const idx = i * ratio;
      const lower = Math.floor(idx);
      const upper = Math.ceil(idx);
      const fraction = idx - lower;

      result[i] = data[lower] * (1 - fraction) + data[upper] * fraction;
    }

    return result;
  };

  // Atualiza métricas de custo
  const updateMetrics = (usageMetadata: any) => {
    if (!usageMetadata) return;

    metricsRef.current.totalTokens = usageMetadata.totalTokenCount || 0;
    
    // Calcula custo (native audio rates)
    const inputAudioCost = (usageMetadata.inputTokenCount || 0) * (3.0 / 1_000_000); // $3/M tokens
    const outputAudioCost = (usageMetadata.outputTokenCount || 0) * (12.0 / 1_000_000); // $12/M tokens
    
    metricsRef.current.estimatedCost = inputAudioCost + outputAudioCost;
  };

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      closeSession();
    };
  }, [closeSession]);

  return {
    // Ações
    initializeSession,
    sendText,
    startAudioCapture,
    stopAudioCapture,
    closeSession,

    // Estados
    isConnected,
    isRecording,
    isLoading,
    error,

    // Métricas
    metrics: metricsRef.current,
  };
}
