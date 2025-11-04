import { useEffect, useRef, useState, useCallback } from "react";

interface UseGeminiLiveAPIProps {
  onMessage?: (message: string) => void;
  systemInstruction?: string;
}

interface SessionMetrics {
  totalTokens: number;
  estimatedCost: number;
}

// Token cache
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

const SEND_SAMPLE_RATE = 16000;
const RECEIVE_SAMPLE_RATE = 24000;
const CHUNK_SIZE = 1024;

export function useGeminiLiveAPI({
  onMessage,
  systemInstruction = "Você é um assistente de bordo de um iate de luxo, extremamente polido, discreto e antecipa as necessidades do utilizador com a máxima elegância.",
}: UseGeminiLiveAPIProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  
  const metricsRef = useRef<SessionMetrics>({
    totalTokens: 0,
    estimatedCost: 0,
  });

  // Converte Float32Array para PCM16
  const floatTo16BitPCM = (float32Array: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };

  // Reproduz áudio recebido
  const playAudioChunk = useCallback(async (pcmData: ArrayBuffer) => {
    if (!audioContextRef.current) return;
    
    audioQueueRef.current.push(pcmData);
    
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      
      while (audioQueueRef.current.length > 0) {
        const chunk = audioQueueRef.current.shift()!;
        
        // Converter PCM para AudioBuffer
        const int16Array = new Int16Array(chunk);
        const float32Array = new Float32Array(int16Array.length);
        
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768.0;
        }
        
        const audioBuffer = audioContextRef.current.createBuffer(
          1,
          float32Array.length,
          RECEIVE_SAMPLE_RATE
        );
        audioBuffer.getChannelData(0).set(float32Array);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        await new Promise<void>((resolve) => {
          source.onended = () => resolve();
          source.start();
        });
      }
      
      isPlayingRef.current = false;
    }
  }, []);

  // Estabelece conexão WebSocket com Live API usando o SDK Python como referência
  const connect = useCallback(async () => {
    if (isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Obter token
      let token = cachedToken;
      const now = Date.now();
      
      if (!token || now >= tokenExpiresAt) {
        console.log("🔑 Obtendo token...");
        const response = await fetch("/api/auth/ephemeral-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Falha ao obter token");
        }
        
        const data = await response.json();
        token = data.token;
        cachedToken = token;
        tokenExpiresAt = now + (25 * 60 * 1000);
        console.log("✅ Token obtido!");
      }
      
      if (!token) throw new Error("Token não disponível");
      
      // Criar AudioContext
      audioContextRef.current = new AudioContext({ sampleRate: RECEIVE_SAMPLE_RATE });
      
      // URL correto baseado no SDK Python: usa v1alpha e BidiGenerateContent
      // Formato: wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${token}`;
      
      console.log("🔌 Conectando ao WebSocket...");
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.binaryType = 'arraybuffer';
      
      wsRef.current.onopen = () => {
        console.log("🔗 WebSocket conectado! Enviando setup...");
        
        // Mensagem de setup baseada no CONFIG do Python
        const setupMessage = {
          setup: {
            model: "models/gemini-2.0-flash-exp",
            generation_config: {
              response_modalities: ["AUDIO"],
              speech_config: {
                voice_config: {
                  prebuilt_voice_config: {
                    voice_name: "Puck"  // Mesma voz do exemplo Python
                  }
                }
              }
            },
            system_instruction: {
              parts: [{ text: systemInstruction }]
            }
          }
        };
        
        console.log("📤 Enviando setup:", JSON.stringify(setupMessage, null, 2));
        wsRef.current?.send(JSON.stringify(setupMessage));
      };
      
      wsRef.current.onmessage = async (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log("📥 Mensagem recebida:", response);
          
          // Setup completo - equivalente ao client.aio.live.connect estabelecido
          if (response.setupComplete) {
            console.log("✅ Setup completo! Pronto para streaming de áudio.");
            setIsConnected(true);
          }
          
          // Áudio recebido - response.data no Python
          if (response.serverContent?.modelTurn?.parts) {
            for (const part of response.serverContent.modelTurn.parts) {
              if (part.inlineData?.mimeType === "audio/pcm") {
                const audioData = Uint8Array.from(atob(part.inlineData.data), c => c.charCodeAt(0));
                await playAudioChunk(audioData.buffer);
              }
              if (part.text) {
                console.log("💬 Texto:", part.text);
                onMessage?.(part.text);
              }
            }
          }
          
          // Turn complete - limpa fila de áudio para permitir interrupções
          if (response.serverContent?.turnComplete) {
            console.log("🔄 Turn complete - limpando fila de áudio");
            audioQueueRef.current = [];
            isPlayingRef.current = false;
          }
          
        } catch (err) {
          console.error("❌ Erro ao processar mensagem:", err, event.data);
        }
      };
      
      wsRef.current.onerror = (err) => {
        console.error("❌ Erro WebSocket:", err);
        setError("Erro de conexão WebSocket");
      };
      
      wsRef.current.onclose = (event) => {
        console.log(`🔌 WebSocket fechado (código: ${event.code}, razão: ${event.reason})`);
        setIsConnected(false);
        
        if (event.code !== 1000) {  // 1000 = fechamento normal
          setError(`Conexão fechada inesperadamente (${event.code})`);
        }
      };
      
    } catch (err) {
      console.error("❌ Erro ao conectar:", err);
      setError(err instanceof Error ? err.message : "Erro ao conectar");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, systemInstruction, onMessage, playAudioChunk]);

  // Captura e envia áudio do microfone
  const startAudioCapture = useCallback(async () => {
    if (isRecording) return;
    if (!isConnected) await connect();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: SEND_SAMPLE_RATE,
        }
      });
      
      mediaStreamRef.current = stream;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: SEND_SAMPLE_RATE });
      }
      
      // Criar AudioWorklet para processar áudio
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(CHUNK_SIZE, 1, 1);
      
      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = floatTo16BitPCM(inputData);
        
        // Enviar áudio no formato correto: { "data": base64, "mime_type": "audio/pcm" }
        // Equivalente ao Python: await self.out_queue.put({"data": data, "mime_type": "audio/pcm"})
        const message = {
          client_content: {
            turns: [{
              role: "user",
              parts: [{
                inline_data: {
                  mime_type: "audio/pcm",
                  data: btoa(String.fromCharCode(...new Uint8Array(pcmData)))
                }
              }]
            }],
            turn_complete: false  // Streaming contínuo
          }
        };
        
        wsRef.current.send(JSON.stringify(message));
      };
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      
      audioWorkletNodeRef.current = processor as any;
      setIsRecording(true);
      setError(null);
      
    } catch (err) {
      setError("Erro ao acessar microfone");
      console.error(err);
    }
  }, [isRecording, isConnected, connect]);

  // Para captura de áudio
  const stopAudioCapture = useCallback(() => {
    if (!isRecording) return;
    
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Limpar fila de áudio
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    
    setIsRecording(false);
  }, [isRecording]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) stopAudioCapture();
    else await startAudioCapture();
  }, [isRecording, startAudioCapture, stopAudioCapture]);

  const closeSession = useCallback(() => {
    stopAudioCapture();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsConnected(false);
  }, [stopAudioCapture]);

  useEffect(() => () => closeSession(), [closeSession]);

  const getMetrics = useCallback(() => ({
    totalTokens: metricsRef.current.totalTokens,
    estimatedCost: metricsRef.current.totalTokens * (0.00015 / 1000),
  }), []);

  return {
    connect,
    toggleRecording,
    startAudioCapture,
    stopAudioCapture,
    closeSession,
    isConnected,
    isRecording,
    isLoading,
    error,
    getMetrics,
  };
}
