import { useEffect, useRef, useState, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface UseGeminiLiveVoiceProps {
  onMessage?: (message: string) => void;
  onAudio?: (audioData: Blob) => void;
  systemInstruction?: string;
  language?: string;
  voiceName?: string;
}

interface SessionMetrics {
  totalTokens: number;
  estimatedCost: number;
}

export function useGeminiLiveVoice({
  onMessage,
  onAudio,
  systemInstruction = "Você é um assistente de bordo de um iate de luxo, extremamente polido, discreto e antecipa as necessidades do utilizador com a máxima elegância. A sua comunicação é impecável, concisa e transmite uma sensação de exclusividade e serviço premium.",
  language = "pt-PT",
  voiceName = "Aoede",
}: UseGeminiLiveVoiceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const chatRef = useRef<any>(null);
  
  const metricsRef = useRef<SessionMetrics>({
    totalTokens: 0,
    estimatedCost: 0,
  });
  
  const sendToGemini = useCallback(async (text: string) => {
    if (!chatRef.current) return;
    
    try {
      const result = await chatRef.current.sendMessageStream(text);
      let fullResponse = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        onMessage?.(fullResponse);
      }
      
      if ('speechSynthesis' in window && fullResponse) {
        const utterance = new SpeechSynthesisUtterance(fullResponse);
        utterance.lang = language;
        const voices = speechSynthesis.getVoices();
        const ptVoice = voices.find(voice => voice.lang.startsWith('pt'));
        if (ptVoice) utterance.voice = ptVoice;
        speechSynthesis.speak(utterance);
      }
      
      metricsRef.current.totalTokens += Math.ceil((text.length + fullResponse.length) / 4);
    } catch (err) {
      console.error('Erro ao enviar para Gemini:', err);
      setError('Erro ao processar resposta');
    }
  }, [language, onMessage]);
  
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("O seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.");
      return false;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript;
          sendToGemini(transcript);
        }
      }
    };
    
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setError("Permissão de microfone negada.");
      }
    };
    
    recognitionRef.current = recognition;
    return true;
  }, [language, sendToGemini]);
  
  const connect = useCallback(async () => {
    if (isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/auth/ephemeral-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) throw new Error("Falha ao obter token");
      
      const { token } = await response.json();
      const genAI = new GoogleGenerativeAI(token);
      
      modelRef.current = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction,
      });
      
      chatRef.current = modelRef.current.startChat({ history: [] });
      
      if (!initializeSpeechRecognition()) {
        throw new Error("Reconhecimento de voz não disponível");
      }
      
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conectar");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, systemInstruction, initializeSpeechRecognition]);
  
  const startAudioCapture = useCallback(async () => {
    if (isRecording) return;
    if (!isConnected) await connect();
    if (!recognitionRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      
      mediaStreamRef.current = stream;
      recognitionRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("Erro ao acessar microfone");
    }
  }, [isRecording, isConnected, connect]);
  
  const stopAudioCapture = useCallback(() => {
    if (!isRecording) return;
    
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    setIsRecording(false);
  }, [isRecording]);
  
  const toggleRecording = useCallback(async () => {
    if (isRecording) stopAudioCapture();
    else await startAudioCapture();
  }, [isRecording, startAudioCapture, stopAudioCapture]);
  
  const closeSession = useCallback(() => {
    stopAudioCapture();
    recognitionRef.current = null;
    modelRef.current = null;
    chatRef.current = null;
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
