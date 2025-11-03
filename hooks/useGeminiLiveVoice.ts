import { useState, useEffect, useRef, useCallback } from 'react';

// --- Tipos e Constantes ---

const AUDIO_SAMPLE_RATE = 16000; // Taxa de amostragem exigida pelo Gemini
const VAD_THRESHOLD = 0.1; // Limiar de Volume para Detecção de Atividade de Voz (VAD)
const VAD_SILENCE_TIMEOUT_MS = 2000; // Tempo em silêncio antes de parar de gravar
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

type GeminiLiveRequest = {
  audio: string; // Base64-encoded audio
};

type GeminiLiveResponse = {
  // Define a estrutura da resposta da API conforme a documentação
  // Exemplo:
  text?: string;
  audio?: string; // Resposta de áudio em Base64
};

type SessionState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

type UseGeminiLiveVoiceOptions = {
  projectId: string;
  model?: string; // Ex: 'gemini-2.5-flash-native-audio-preview-09-2025'
  voice?: string; // Ex: 'Aoede'
  languageCode?: string; // Ex: 'pt-PT'
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
};

// --- O Hook Principal ---

export function useGeminiLiveVoice({
  projectId,
  model = 'gemini-2.5-flash-native-audio-preview-09-2025',
  voice = 'Aoede',
  languageCode = 'pt-PT',
  onTranscript,
  onError,
}: UseGeminiLiveVoiceOptions) {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Refs para espelhar o estado e evitar closures estagnadas em callbacks não-React
  const sessionStateRef = useRef(sessionState);
  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Refs para gerenciar áudio e estado da sessão
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const authTokenRef = useRef<string | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);

  // --- Funções de Autenticação ---

  const fetchAuthToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/ephemeral-token');
      if (!response.ok) {
        throw new Error(`Falha na autenticação: ${response.statusText}`);
      }
      const { token } = await response.json();
      authTokenRef.current = token;
      return token;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro de autenticação desconhecido');
      setError(e);
      setSessionState('error');
      onError?.(e);
      return null;
    }
  }, [onError]);

  // --- Funções de Gerenciamento de Áudio ---

  const processAudio = useCallback(async (audioData: Float32Array) => {
    // Implementação da Detecção de Atividade de Voz (VAD)
    const volume = Math.sqrt(audioData.reduce((sum, val) => sum + val * val, 0) / audioData.length);
    
    if (volume > VAD_THRESHOLD) {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      audioQueueRef.current.push(audioData);
    } else if (!silenceTimerRef.current) {
      silenceTimerRef.current = setTimeout(() => {
        if (audioQueueRef.current.length > 0) {
          sendAudioToServer();
        }
        silenceTimerRef.current = null;
      }, VAD_SILENCE_TIMEOUT_MS);
    }
  }, []);

  const sendAudioToServer = useCallback(async () => {
    if (audioQueueRef.current.length === 0 || !authTokenRef.current) return;

    setSessionState('processing');
    
    // Concatena e converte o áudio para Base64
    const audioBuffer = new Float32Array(audioQueueRef.current.reduce((len, arr) => len + arr.length, 0));
    let offset = 0;
    for (const arr of audioQueueRef.current) {
      audioBuffer.set(arr, offset);
      offset += arr.length;
    }
    audioQueueRef.current = []; // Limpa a fila

    const pcm16 = new Int16Array(audioBuffer.length);
    for (let i = 0; i < audioBuffer.length; i++) {
      pcm16[i] = Math.max(-32768, Math.min(32767, audioBuffer[i] * 32767));
    }
    
    const base64Audio = Buffer.from(pcm16.buffer).toString('base64');

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/locations/global/models/${model}:streamGenerateContent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokenRef.current}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          // Adicionar outros parâmetros da API aqui
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro da API: ${response.statusText}`);
      }

      const data: GeminiLiveResponse = await response.json();
      
      // Processar a resposta (transcrição e áudio de volta)
      if (data.text) {
        onTranscript?.(data.text, true); // Assumindo que a resposta é final
      }
      if (data.audio) {
        playResponseAudio(data.audio);
      }
      setSessionState('listening');

    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao enviar áudio');
      setError(e);
      setSessionState('error');
      onError?.(e);
    }
  }, [projectId, model, onTranscript, onError]);

  const playResponseAudio = (base64Audio: string) => {
    setSessionState('speaking');
    const audioBlob = new Blob([Buffer.from(base64Audio, 'base64')], { type: 'audio/mpeg' }); // Ajuste o tipo MIME se necessário
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = () => {
      setSessionState('listening');
      URL.revokeObjectURL(audioUrl);
    };
  };

  // --- Funções de Controle da Sessão ---

  const startSession = useCallback(async () => {
    if (sessionStateRef.current !== 'idle' && sessionStateRef.current !== 'error') return;
    
    setError(null);
    setSessionState('listening');

    if (!authTokenRef.current) {
      const token = await fetchAuthToken();
      if (!token) return; // A autenticação falhou
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const context = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE });
      audioContextRef.current = context;
      
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1); // bufferSize, inputChannels, outputChannels

      processor.onaudioprocess = (e) => {
        // Usa refs para obter o estado mais recente dentro do callback
        if (sessionStateRef.current === 'listening' && !isMutedRef.current) {
          const inputData = e.inputBuffer.getChannelData(0);
          processAudio(new Float32Array(inputData));
        }
      };

      source.connect(processor);
      processor.connect(context.destination); // Conectar ao destino para evitar problemas em alguns navegadores
      audioProcessorRef.current = processor;

    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao iniciar a captura de áudio');
      setError(e);
      setSessionState('error');
      onError?.(e);
    }
  }, [fetchAuthToken, processAudio, onError]);

  const stopSession = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    audioQueueRef.current = [];
    setSessionState('idle');
  }, []);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Efeito para limpar a sessão ao desmontar o componente
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    sessionState,
    error,
    isMuted,
    startSession,
    stopSession,
    toggleMute,
  };
}
