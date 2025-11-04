import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleGenAI, LiveServerMessage, Session, Modality, MediaResolution } from "@google/genai";

// --- Constantes ---
const SEND_SAMPLE_RATE = 16000;
const CHUNK_SIZE = 1024;
const MAX_RECONNECT_ATTEMPTS = 3;
const TOKEN_EXPIRATION_MINUTES = 25;
const MODEL_NAME = "models/gemini-2.5-flash-native-audio-preview-09-2025"; // ATUALIZADO: Modelo exato do código oficial.

// --- Tipos ---
interface UseGeminiLiveAPIProps {
  systemInstruction?: string;
  onMessage?: (text: string) => void;
  onAudio?: (audioBlob: Blob) => void;
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
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const audioChunksRef = useRef<string[]>([]); // Buffer para chunks de áudio PCM

  // --- 1. Processamento de Respostas do Servidor ---
  const handleServerMessage = useCallback(
    (message: LiveServerMessage) => {
      try {
        if (message.serverContent?.modelTurn?.parts) {
          const part = message.serverContent.modelTurn.parts[0];
          if (part.text) {
            console.log("💬 Texto recebido:", part.text);
            onMessage?.(part.text);
          }
          if (part.inlineData?.data && part.inlineData.mimeType) {
            const audioData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            console.log(`🔊 Chunk de áudio recebido (${mimeType}, ${audioData.length} bytes)`);
            
            // Acumular chunks em vez de processar individualmente
            audioChunksRef.current.push(audioData);
          }
        }
        if (message.serverContent?.turnComplete) {
          console.log("✅ Turno do modelo completo.");
          
          // Quando o turno estiver completo, processar todos os chunks acumulados
          if (audioChunksRef.current.length > 0) {
            console.log(`🎵 Processando ${audioChunksRef.current.length} chunks de áudio...`);
            
            // Concatenar todos os chunks
            const totalLength = audioChunksRef.current.reduce((acc, chunk) => {
              return acc + atob(chunk).length;
            }, 0);
            
            const concatenated = new Uint8Array(totalLength);
            let offset = 0;
            
            for (const chunk of audioChunksRef.current) {
              const decoded = atob(chunk);
              for (let i = 0; i < decoded.length; i++) {
                concatenated[offset++] = decoded.charCodeAt(i);
              }
            }
            
            // Criar WAV header para PCM 24kHz (formato da API)
            const wavHeader = createWavHeader(concatenated.length, 24000, 1, 16);
            const wavBlob = new Blob([wavHeader, concatenated], { type: 'audio/wav' });
            
            console.log(`✅ Áudio WAV criado (${wavBlob.size} bytes)`);
            onAudio?.(wavBlob);
            
            // Limpar buffer
            audioChunksRef.current = [];
          }
        }
      } catch (e) {
        console.error("❌ Erro ao processar mensagem do servidor:", e);
      }
    },
    [onMessage, onAudio]
  );

  // Função auxiliar para criar WAV header
  const createWavHeader = (dataLength: number, sampleRate: number, numChannels: number, bitsPerSample: number) => {
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    // ChunkID "RIFF"
    view.setUint32(0, 0x52494646, false);
    // ChunkSize
    view.setUint32(4, 36 + dataLength, true);
    // Format "WAVE"
    view.setUint32(8, 0x57415645, false);
    // Subchunk1ID "fmt "
    view.setUint32(12, 0x666d7420, false);
    // Subchunk1Size (16 for PCM)
    view.setUint32(16, 16, true);
    // AudioFormat (1 = PCM)
    view.setUint16(20, 1, true);
    // NumChannels
    view.setUint16(22, numChannels, true);
    // SampleRate
    view.setUint32(24, sampleRate, true);
    // ByteRate
    view.setUint32(28, byteRate, true);
    // BlockAlign
    view.setUint16(32, blockAlign, true);
    // BitsPerSample
    view.setUint16(34, bitsPerSample, true);
    // Subchunk2ID "data"
    view.setUint32(36, 0x64617461, false);
    // Subchunk2Size
    view.setUint32(40, dataLength, true);

    return new Uint8Array(buffer);
  };

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
                  voiceName: 'Puck',
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

  // --- 3. Captura e Envio de Áudio ---
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

    console.log("🎤 Iniciando captura de áudio...");
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SEND_SAMPLE_RATE });
      console.log(`🎧 AudioContext criado com sampleRate: ${audioContextRef.current.sampleRate}Hz`);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(CHUNK_SIZE, 1, 1);

      scriptProcessorRef.current.onaudioprocess = (event) => {
        if (!sessionRef.current || !isConnected) return;
        
        const inputData = event.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
        }
        
        // Converter para base64 (esperado pela API)
        let binary = '';
        const bytes = new Uint8Array(pcmData.buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = window.btoa(binary);

        try {
          // CORREÇÃO CRÍTICA: Usar sendRealtimeInput para áudio em tempo real
          // Isto ativa VAD automático e processamento otimizado
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

      source.connect(scriptProcessorRef.current);
      scriptProcessorRef.current.connect(audioContextRef.current.destination);
      setIsRecording(true);
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

    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    scriptProcessorRef.current?.disconnect();
    audioContextRef.current?.close();
    
    mediaStreamRef.current = null;
    scriptProcessorRef.current = null;
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
