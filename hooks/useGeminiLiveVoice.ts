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
  
  // Promise resolvers for connection
  const connectionPromiseRef = useRef<{ resolve: () => void; reject: (reason?: any) => void } | null>(null);

  // Refs para áudio
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
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

  // 1. CONECTAR SESSÃO (NOVA FUNÇÃO)
  const connect = useCallback(async () => {
    if (isConnected) {
      return;
    }

    setIsLoading(true);
    setError(null);

    return new Promise<void>((resolve, reject) => {
      connectionPromiseRef.current = { resolve, reject };

      fetch("/api/auth/ephemeral-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      .then(tokenResponse => {
        if (!tokenResponse.ok) {
          throw new Error("Falha ao obter token de autenticação");
        }
        return tokenResponse.json();
      })
      .then(async ({ token, model }) => {
        // VALIDAÇÃO RIGOROSA DO MODELO
        if (!model || typeof model !== 'string' || model.trim() === '') {
          throw new Error("O nome do modelo recebido da API é inválido.");
        }

        aiRef.current = new GoogleGenAI({
          apiKey: token,
          httpOptions: { apiVersion: "v1alpha" },
        });

        const config: any = {
          responseModalities: [Modality.AUDIO],
          systemInstruction,
          speechConfig: {
            languageCode: language,
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName,
              },
            },
          },
          contextWindow: 32000,
          realtimeInputConfig: {
            automaticActivityDetection: {
              disabled: false,
              startOfSpeechSensitivity: "START_SENSITIVITY_LOW",
              endOfSpeechSensitivity: "END_SENSITIVITY_LOW",
              silenceDurationMs: 500,
            },
          },
          enableAffectiveDialog: true,
        };

        sessionRef.current = await aiRef.current.live.connect({
          model: model,
          config: config,
          callbacks: {
            onopen: () => {
              setIsConnected(true);
              setIsLoading(false);
              setError(null);
              connectionPromiseRef.current?.resolve();
            },
            onmessage: (message: any) => {
              if (message.text) {
                onMessage?.(message.text);
              }
              if (message.data) {
                try {
                  const audioBlob = new Blob(
                    [Buffer.from(message.data, "base64")],
                    { type: "audio/pcm;rate=24000" }
                  );
                  onAudio?.(audioBlob);
                } catch (e) {
                  // Silently ignore audio processing errors
                }
              }
              if (message.usageMetadata) {
                updateMetrics(message.usageMetadata);
              }
            },
            onerror: (error: any) => {
              const errorMsg = error?.message || error?.toString() || "Erro desconhecido na sessão de voz";
              setError(errorMsg);
              setIsConnected(false);
              setIsLoading(false);
              connectionPromiseRef.current?.reject(new Error(errorMsg));
            },
            onclose: () => {
              setIsConnected(false);
            },
          },
        });
      })
      .catch(err => {
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido ao conectar";
        setError(errorMsg);
        setIsLoading(false);
        connectionPromiseRef.current?.reject(new Error(errorMsg));
      });
    });
  }, [isConnected, systemInstruction, language, voiceName, onMessage, onAudio]);


  // DEPRECATED: initializeSession será substituído por `connect`
  const initializeSession = useCallback(async () => {
    console.warn("initializeSession is deprecated. Use connect() instead.");
    return connect();
  }, [connect]);


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
      setError(errorMsg);
    }
  }, [isConnected]);

  // 3. INICIAR GRAVAÇÃO DE ÁUDIO
  const startAudioCapture = useCallback(async () => {
    if (isRecording) return;
    
    try {
      // A conexão deve ser pré-estabelecida, mas verificamos por segurança.
      if (!isConnected) {
        setError("A conexão não está pronta. A tentar reconectar...");
        await connect(); // Tenta conectar novamente se algo falhou.
      }

      // 1. Solicita permissão de microfone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      
      // 2. Cria AudioContext e carrega o AudioWorklet
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      try {
        await audioContext.audioWorklet.addModule('/audio-processor.js');
      } catch (e) {
        console.error('Failed to load audio worklet', e);
        setError('Falha ao carregar o processador de áudio. O seu navegador pode não ser compatível.');
        return;
      }

      // 3. Cria o nó do worklet e conecta
      const workletNode = new AudioWorkletNode(audioContext, 'resampling-processor', {
        processorOptions: {
          targetSampleRate: 16000,
        },
      });
      workletNodeRef.current = workletNode;

      // 4. Configura o manipulador de mensagens do worklet
      workletNode.port.onmessage = (event: MessageEvent<Int16Array>) => {
        if (sessionRef.current && isRecording) {
          try {
            sessionRef.current.sendClientContent({
              audio: event.data,
            });
          } catch (err) {
            console.error("Error sending audio data:", err);
            setError("Erro ao enviar áudio.");
            stopAudioCapture();
          }
        }
      };

      // 5. Conecta o microfone ao worklet
      sourceRef.current = audioContext.createMediaStreamSource(stream);
      sourceRef.current.connect(workletNode);
      workletNode.connect(audioContext.destination); // Conectar à saída para evitar que o processamento pare

      setIsRecording(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao iniciar captura de áudio";
      if (errorMsg.includes('permission denied')) {
        setError("Permissão para o microfone foi negada.");
      } else {
        setError(errorMsg);
      }
    }
  }, [isConnected, isRecording, connect]);

  // 4. PARAR GRAVAÇÃO DE ÁUDIO
  const stopAudioCapture = useCallback(() => {
    if (!isRecording) return;
    setIsRecording(false);

    // Desconecta e para o worklet
    if (workletNodeRef.current) {
      workletNodeRef.current.port.onmessage = null;
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Fecha o AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Para as faixas do microfone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Sinaliza fim do stream para a API
    if (sessionRef.current) {
      try {
        sessionRef.current.sendRealtimeInput({ audioStreamEnd: true });
      } catch (e) {
        // Erro silencioso ao sinalizar fim
      }
    }
  }, [isRecording]);

  // NOVA FUNÇÃO: Alterna a gravação
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      stopAudioCapture();
    } else {
      await startAudioCapture();
    }
  }, [isRecording, startAudioCapture, stopAudioCapture]);

  // 5. FECHAR SESSÃO
  const closeSession = useCallback(() => {
    stopAudioCapture();
    
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {
        // Erro silencioso ao fechar sessão
      }
      sessionRef.current = null;
    }

    setIsConnected(false);
  }, [stopAudioCapture]);

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

  const getMetrics = useCallback(() => ({
    totalTokens: metricsRef.current.totalTokens,
    estimatedCost: metricsRef.current.estimatedCost,
  }), [metricsRef.current.totalTokens, metricsRef.current.estimatedCost]);

  return {
    connect,
    toggleRecording, // Exporta a nova função
    startAudioCapture,
    stopAudioCapture,
    closeSession,

    // Estados
    isConnected,
    isRecording,
    isLoading,
    error,
    getMetrics,
  };
}

// Funções auxiliares (resampleAudio, toPCM16, updateMetrics)
// ...
function resampleAudio(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) {
    return input;
  }

  const ratio = fromRate / toRate;
  const outputLength = Math.floor(input.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    output[i] = input[Math.floor(i * ratio)];
  }

  return output;
}

function toPCM16(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}
