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

// Token cache para evitar requisições repetidas
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

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
      // Cancela qualquer fala anterior para não sobrepor respostas.
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }

      const result = await chatRef.current.sendMessageStream(text);
      let fullResponse = '';
      let sentenceBuffer = '';
      const sentenceEndRegex = /[.!?]/;

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        sentenceBuffer += chunkText;
        onMessage?.(fullResponse); // Atualiza o texto na UI em tempo real

        // Verifica se temos uma ou mais frases completas no buffer
        if (sentenceEndRegex.test(sentenceBuffer)) {
          const sentences = sentenceBuffer.split(sentenceEndRegex);
          
          // A última parte pode ser um fragmento de frase, então guardamo-la para o próximo chunk.
          const sentencesToSpeak = sentences.slice(0, -1);
          sentenceBuffer = sentences[sentences.length - 1];

          for (const sentence of sentencesToSpeak) {
            if (sentence.trim()) {
              const utterance = new SpeechSynthesisUtterance(sentence.trim());
              utterance.lang = language;
              const voices = speechSynthesis.getVoices();
              const ptVoice = voices.find(voice => voice.lang.startsWith('pt'));
              if (ptVoice) utterance.voice = ptVoice;
              speechSynthesis.speak(utterance);
            }
          }
        }
      }
      
      // Fala a última frase que possa ter ficado no buffer
      if ('speechSynthesis' in window && sentenceBuffer.trim()) {
        const utterance = new SpeechSynthesisUtterance(sentenceBuffer.trim());
        utterance.lang = language;
        const voices = speechSynthesis.getVoices();
        const ptVoice = voices.find(voice => voice.lang.startsWith('pt'));
        if (ptVoice) utterance.voice = ptVoice;
        speechSynthesis.speak(utterance);
      }
      
      metricsRef.current.totalTokens += Math.ceil((text.length + fullResponse.length) / 4);
    } catch (err) {
      // PRODUCTION: Removed console.error("Erro ao enviar para o Gemini:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      onMessage?.(`Erro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [language, onMessage, systemInstruction]);
  
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
      // Usar token em cache se ainda for válido
      let token = cachedToken;
      const now = Date.now();
      
      if (!token || now >= tokenExpiresAt) {
        // PRODUCTION: Removed console.log("🔑 Buscando novo token da API...");
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
        // Token válido por 25 minutos (API dá 30, usamos margem de segurança)
        tokenExpiresAt = now + (25 * 60 * 1000);
        // PRODUCTION: Removed console.log("✅ Token obtido e cacheado com sucesso!");
      } else {
        // PRODUCTION: Removed console.log("♻️ Usando token em cache (válido por mais " + 
                    Math.round((tokenExpiresAt - now) / 60000) + " minutos)");
      }
      
      if (!token) {
        throw new Error("Não foi possível obter token de autenticação");
      }
      
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
