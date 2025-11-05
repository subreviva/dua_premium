"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface RealtimeVoiceState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  error: string | null;
  transcript: string;
  intermediateTranscript: string;
}

export function useRealtimeVoice() {
  const [state, setState] = useState<RealtimeVoiceState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isThinking: false,
    error: null,
    transcript: "",
    intermediateTranscript: "",
  });

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const shouldStopRef = useRef(false);

  // Conecta ao WebSocket backend
  const connect = useCallback(async () => {
    try {
      // Determina protocolo WebSocket baseado em HTTP/HTTPS
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/realtime-voice`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setState((prev) => ({ ...prev, isConnected: true, error: null }));
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "transcript_intermediate":
              setState((prev) => ({
                ...prev,
                intermediateTranscript: data.text,
              }));
              break;

            case "transcript_final":
              setState((prev) => ({
                ...prev,
                transcript: data.text,
                intermediateTranscript: "",
                isListening: false,
                isThinking: true,
              }));
              break;

            case "gemini_chunk":
              // Texto chegando do Gemini (pode exibir na UI)
              break;

            case "audio_chunk":
              // Áudio TTS chegando
              await handleAudioChunk(data.data);
              break;

            case "audio_complete":
              setState((prev) => ({ ...prev, isThinking: false }));
              break;

            case "error":
              setState((prev) => ({ ...prev, error: data.message }));
              break;
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (error) => {
        setState((prev) => ({
          ...prev,
          error: "Erro de conexão WebSocket",
          isConnected: false,
        }));
      };

      ws.onclose = () => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isListening: false,
        }));
      };
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Erro ao conectar",
      }));
    }
  }, []);

  // Inicia captura de áudio com getUserMedia
  const startListening = useCallback(async () => {
    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket não conectado");
      }

      // Solicita permissão do microfone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      // Cria AudioContext para análise de volume (para animação visual)
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // MediaRecorder para capturar áudio em chunks
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 16000,
      });

      mediaRecorderRef.current = mediaRecorder;

      // Envia chunks de áudio pelo WebSocket
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Converte Blob para base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            wsRef.current?.send(
              JSON.stringify({
                type: "audio_chunk",
                data: base64,
              })
            );
          };
          reader.readAsDataURL(event.data);
        }
      };

      // Captura em chunks de 100ms para baixa latência
      mediaRecorder.start(100);

      setState((prev) => ({ ...prev, isListening: true, error: null }));
      shouldStopRef.current = false;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao acessar microfone";
      setState((prev) => ({ ...prev, error: errorMessage }));
      
      // Se erro de permissão, mostra mensagem específica
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setState((prev) => ({
          ...prev,
          error: "Permissão de microfone negada. Por favor, autorize o acesso.",
        }));
      }
    }
  }, []);

  // Para captura de áudio
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // Sinaliza fim do áudio ao backend
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "audio_end" }));
    }

    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  // Interrupção (barge-in): para áudio TTS e reinicia escuta
  const interrupt = useCallback(() => {
    shouldStopRef.current = true;
    audioQueueRef.current = [];
    isPlayingRef.current = false;

    // Para TTS no backend
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop_tts" }));
    }

    setState((prev) => ({
      ...prev,
      isSpeaking: false,
      isThinking: false,
    }));

    // Reinicia escuta
    startListening();
  }, [startListening]);

  // Processa chunk de áudio TTS recebido
  const handleAudioChunk = async (base64Data: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    try {
      // Decodifica base64 para ArrayBuffer
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decodifica áudio
      const audioBuffer = await audioContextRef.current.decodeAudioData(
        bytes.buffer
      );

      // Adiciona à fila
      audioQueueRef.current.push(audioBuffer);

      // Inicia reprodução se não estiver tocando
      if (!isPlayingRef.current) {
        playNextInQueue();
      }
    } catch (err) {
      console.error("Erro ao processar áudio:", err);
    }
  };

  // Reproduz próximo áudio na fila
  const playNextInQueue = () => {
    if (
      audioQueueRef.current.length === 0 ||
      shouldStopRef.current ||
      !audioContextRef.current
    ) {
      isPlayingRef.current = false;
      setState((prev) => ({ ...prev, isSpeaking: false }));
      return;
    }

    isPlayingRef.current = true;
    setState((prev) => ({ ...prev, isSpeaking: true }));

    const audioBuffer = audioQueueRef.current.shift()!;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);

    source.onended = () => {
      if (!shouldStopRef.current) {
        playNextInQueue();
      } else {
        isPlayingRef.current = false;
        setState((prev) => ({ ...prev, isSpeaking: false }));
      }
    };

    source.start(0);
  };

  // Obtém dados de volume para animação (0-255)
  const getVolumeLevel = useCallback(() => {
    if (!analyserRef.current) return 0;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calcula média
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    return average;
  }, []);

  // Desconecta
  const disconnect = useCallback(() => {
    stopListening();
    shouldStopRef.current = true;
    audioQueueRef.current = [];

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState({
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      isThinking: false,
      error: null,
      transcript: "",
      intermediateTranscript: "",
    });
  }, [stopListening]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    startListening,
    stopListening,
    interrupt,
    getVolumeLevel,
  };
}
