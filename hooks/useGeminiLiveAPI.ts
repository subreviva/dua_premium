import { useEffect, useRef, useState, useCallback } from "react";
import { GoogleGenAI, LiveServerMessage, MediaResolution, Modality, Session } from '@google/genai';

interface UseGeminiLiveAPIProps {
  onMessage?: (message: string) => void;
  systemInstruction?: string;
}

// Token cache
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

const SEND_SAMPLE_RATE = 16000;
const CHUNK_SIZE = 1024;
const MODEL = "models/gemini-2.5-flash-native-audio-preview-09-2025";

export function useGeminiLiveAPI({
  onMessage,
  systemInstruction = "Você é um assistente de bordo de um iate de luxo, extremamente polido, discreto e antecipa as necessidades do utilizador com a máxima elegância.",
}: UseGeminiLiveAPIProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sessionRef = useRef<Session | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const responseQueueRef = useRef<LiveServerMessage[]>([]);

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

  // Aguarda mensagem da fila
  const waitMessage = useCallback(async (): Promise<LiveServerMessage> => {
    while (responseQueueRef.current.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return responseQueueRef.current.shift()!;
  }, []);

  // Processa turn completo
  const handleTurn = useCallback(async (): Promise<LiveServerMessage[]> => {
    const turn: LiveServerMessage[] = [];
    let done = false;
    
    while (!done) {
      const message = await waitMessage();
      turn.push(message);
      
      // Processar áudio recebido
      if (message.serverContent?.modelTurn?.parts) {
        for (const part of message.serverContent.modelTurn.parts) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/') && part.inlineData.data) {
            const audioData = Uint8Array.from(atob(part.inlineData.data), c => c.charCodeAt(0));
            audioQueueRef.current.push(audioData.buffer);
            playAudioQueue();
          }
          if (part.text) {
            console.log("💬", part.text);
            onMessage?.(part.text);
          }
        }
      }
      
      if (message.serverContent?.turnComplete) {
        done = true;
        console.log("🔄 Turn complete");
      }
    }
    
    return turn;
  }, [waitMessage, onMessage]);

  // Reproduz fila de áudio
  const playAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    if (!audioContextRef.current) return;
    
    isPlayingRef.current = true;
    
    while (audioQueueRef.current.length > 0) {
      const chunk = audioQueueRef.current.shift()!;
      
      try {
        const int16Array = new Int16Array(chunk);
        const float32Array = new Float32Array(int16Array.length);
        
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768.0;
        }
        
        const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
        audioBuffer.getChannelData(0).set(float32Array);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        await new Promise<void>(resolve => {
          source.onended = () => resolve();
          source.start();
        });
      } catch (err) {
        console.error("Erro ao reproduzir áudio:", err);
      }
    }
    
    isPlayingRef.current = false;
  }, []);

  // Conectar à Live API
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
        const response = await fetch("/api/auth/ephemeral-token", { method: "POST" });
        if (!response.ok) throw new Error("Falha ao obter token");
        
        const data = await response.json();
        token = data.token;
        cachedToken = token;
        tokenExpiresAt = now + (25 * 60 * 1000);
        console.log("✅ Token obtido!");
      }
      
      if (!token) throw new Error("Token não disponível");
      
      // Criar AudioContext
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      // Conectar à Live API usando o SDK oficial
      const ai = new GoogleGenAI({ apiKey: token });
      
      const config = {
        responseModalities: [Modality.AUDIO],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Puck',
            }
          }
        },
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      };
      
      console.log("🔌 Conectando à Live API...");
      
      const session = await ai.live.connect({
        model: MODEL,
        callbacks: {
          onopen: () => {
            console.log("✅ Live API conectada!");
            setIsConnected(true);
            setIsLoading(false);
          },
          onmessage: (message: LiveServerMessage) => {
            responseQueueRef.current.push(message);
          },
          onerror: (e: ErrorEvent) => {
            console.error("❌ Erro Live API:", e.message);
            setError(`Erro: ${e.message}`);
          },
          onclose: (e: CloseEvent) => {
            console.log("🔌 Live API desconectada:", e.reason);
            setIsConnected(false);
            if (e.code !== 1000) {
              setError(`Conexão fechada: ${e.reason || e.code}`);
            }
          },
        },
        config
      });
      
      sessionRef.current = session;
      
      // Iniciar processamento de turns em background
      handleTurn().catch(err => {
        console.error("Erro ao processar turn:", err);
      });
      
    } catch (err) {
      console.error("❌ Erro ao conectar:", err);
      setError(err instanceof Error ? err.message : "Erro ao conectar");
      setIsConnected(false);
      setIsLoading(false);
    }
  }, [isConnected, systemInstruction, handleTurn]);

  // Capturar e enviar áudio
  const startAudioCapture = useCallback(async () => {
    if (isRecording || !isConnected) return;
    
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
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(CHUNK_SIZE, 1, 1);
      
      processor.onaudioprocess = (e) => {
        if (!sessionRef.current) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = floatTo16BitPCM(inputData);
        
        // Enviar áudio usando o formato do SDK oficial
        sessionRef.current.sendClientContent({
          turns: [{
            role: "user",
            parts: [{
              inlineData: {
                mimeType: "audio/pcm",
                data: btoa(String.fromCharCode(...new Uint8Array(pcmData)))
              }
            }]
          }],
          turnComplete: false
        });
      };
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      processorRef.current = processor;
      
      setIsRecording(true);
      console.log("🎤 Gravação iniciada");
      
    } catch (err) {
      setError("Erro ao acessar microfone");
      console.error(err);
    }
  }, [isRecording, isConnected]);

  // Parar captura
  const stopAudioCapture = useCallback(() => {
    if (!isRecording) return;
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Marcar turn como completo
    if (sessionRef.current) {
      sessionRef.current.sendClientContent({
        turns: [],
        turnComplete: true
      });
    }
    
    setIsRecording(false);
    console.log("🎤 Gravação parada");
  }, [isRecording]);

  const toggleRecording = useCallback(async () => {
    if (!isConnected) await connect();
    if (isRecording) stopAudioCapture();
    else await startAudioCapture();
  }, [isRecording, isConnected, connect, startAudioCapture, stopAudioCapture]);

  const closeSession = useCallback(() => {
    stopAudioCapture();
    
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    audioQueueRef.current = [];
    responseQueueRef.current = [];
    setIsConnected(false);
  }, [stopAudioCapture]);

  useEffect(() => () => closeSession(), [closeSession]);

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
  };
}
