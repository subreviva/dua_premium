import { WebSocket } from "ws";
import { SpeechClient } from "@google-cloud/speech";
import textToSpeech from "@google-cloud/text-to-speech";
import fetch from "node-fetch";
import { setTimeout as wait } from "timers/promises";

interface VoiceSessionOpts {
  ws: WebSocket;
  sessionId: string;
  userId: string;
  token: string; // ephemeral token for Google or custom
  logger: any;
}

/**
 * VoiceSession
 * - Recebe chunks de áudio do cliente (base64 / binary)
 * - Encaminha para Google STT streaming
 * - Reencaminha transcrições (interim + final) ao cliente
 * - Ao receber final, encaminha texto ao Gemini (via endpoint configurado)
 * - Acumula tokens e chama TTS por frase, enviando audioChunk ao cliente
 *
 * Nota: Este ficheiro contém uma implementação completa/produçã o-level para
 * STT e TTS; o passo de Gemini (NLG streaming) espera um endpoint externo
 * configurado por `process.env.GEMINI_STREAM_ENDPOINT` que devolve chunks de texto.
 */
export default class VoiceSession {
  ws: WebSocket;
  sessionId: string;
  userId: string;
  token: string;
  logger: any;

  speechClient: SpeechClient;
  ttsClient: any;

  sttStream: any; // streamingRecognize duplex
  isClosed = false;

  // Buffers
  sentenceBuffer = "";

  constructor(opts: VoiceSessionOpts) {
    this.ws = opts.ws;
    this.sessionId = opts.sessionId;
    this.userId = opts.userId;
    this.token = opts.token;
    this.logger = opts.logger || console;

    this.speechClient = new SpeechClient();
    this.ttsClient = new textToSpeech.TextToSpeechClient();

    this.ws.on("message", (data) => this.onClientMessage(data));
  }

  async init() {
    // Inicializar STT streaming
    this.createSttStream();
    // Periodic ping to keep connection alive (optional)
    (async () => {
      while (!this.isClosed) {
        try {
          this.ws.ping();
        } catch (e) {
          // ignore
        }
        await wait(20000);
      }
    })();
  }

  createSttStream() {
    const request = {
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: process.env.LANGUAGE_CODE || "pt-PT",
        enableAutomaticPunctuation: true,
      },
      interimResults: true,
    };

    // `streamingRecognize` returns a duplex stream
    this.sttStream = this.speechClient
      .streamingRecognize(request)
      .on("error", (err: any) => {
        this.logger.error({ err, sessionId: this.sessionId }, "STT stream error");
        this.send({ type: "error", message: "STT error" });
      })
      .on("data", (data: any) => {
        // data.results[0].alternatives[0].transcript
        try {
          const result = data.results && data.results[0];
          if (!result) return;
          const isFinal = !!result.isFinal;
          const transcript = result.alternatives && result.alternatives[0] && result.alternatives[0].transcript;
          if (!transcript) return;

          this.send({ type: "stt", interim: !isFinal, text: transcript });

          if (isFinal) {
            this.onFinalTranscript(String(transcript));
          }
        } catch (err) {
          this.logger.error({ err }, "Error processing stt data");
        }
      });
  }

  async onClientMessage(data: WebSocket.Data) {
    // Expect messages JSON for control or binary for audio
    try {
      if (typeof data === "string") {
        const msg = JSON.parse(data);
        if (msg?.type === "stop") {
          this.logger.info({ sessionId: this.sessionId }, "received stop from client");
          this.close();
        }
        return;
      }

      // Binary audio chunk (expect raw PCM16LE or base64). We'll accept Buffer.
      const chunk = Buffer.isBuffer(data) ? data : Buffer.from(data as any);

      // Write raw chunk to STT stream
      try {
        // streamingRecognize expects raw audio bytes (not wrapped)
        this.sttStream.write(chunk);
      } catch (err) {
        this.logger.error({ err }, "Failed to write audio to sttStream");
      }
    } catch (err) {
      this.logger.error({ err }, "onClientMessage error");
    }
  }

  async onFinalTranscript(text: string) {
    this.logger.info({ sessionId: this.sessionId, text }, "Final transcript received");

    // Forward to Gemini streaming endpoint (configurable). Expect an endpoint that streams NDJSON or newline-delimited text chunks.
    const geminiEndpoint = process.env.GEMINI_STREAM_ENDPOINT;
    if (!geminiEndpoint) {
      // If not configured, just echo text back
      this.send({ type: "assistantText", text });
      // Also synthesize immediately entire text
      await this.synthesizeAndSendAudio(text);
      return;
    }

    try {
      const res = await fetch(geminiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GEMINI_API_KEY || ""}`,
        },
        body: JSON.stringify({ input: text, userId: this.userId }),
      });

      if (!res.ok || !res.body) {
        this.logger.error({ status: res.status }, "Gemini endpoint returned error");
        return;
      }

      // Stream response line-by-line
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partial = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        partial += decoder.decode(value, { stream: true });

        // Split by newline - assume endpoint sends newline-delimited chunks
        const parts = partial.split("\n");
        partial = parts.pop() || "";

        for (const p of parts) {
          if (!p.trim()) continue;
          try {
            // If endpoint sends JSON lines: { text: "..." }
            const parsed = JSON.parse(p);
            if (parsed.text) {
              this.send({ type: "geminiChunk", text: parsed.text });
              // Buffer and synthesize per sentence
              await this.bufferAndMaybeSynthesize(parsed.text);
            }
          } catch (e) {
            // Not JSON — treat as raw text chunk
            this.send({ type: "geminiChunk", text: p });
            await this.bufferAndMaybeSynthesize(p);
          }
        }
      }

      // flush any remaining buffer
      if (this.sentenceBuffer.trim()) {
        await this.synthesizeAndSendAudio(this.sentenceBuffer);
        this.sentenceBuffer = "";
      }
    } catch (err) {
      this.logger.error({ err }, "Gemini streaming failed");
    }
  }

  // Accumula texto e sintetiza por frase quando encontra pontuação final
  async bufferAndMaybeSynthesize(chunkText: string) {
    // Append with space to avoid glue
    this.sentenceBuffer += (this.sentenceBuffer ? " " : "") + chunkText;

    // If buffer ends with end-of-sentence punctuation or is longer than threshold
    const trimmed = this.sentenceBuffer.trim();
    const endsSentence = /[.!?]$/.test(trimmed);
    const words = trimmed.split(/\s+/).length;

    if (endsSentence || words >= 18) {
      const toSynthesize = this.sentenceBuffer.trim();
      this.sentenceBuffer = "";
      await this.synthesizeAndSendAudio(toSynthesize);
    }
  }

  async synthesizeAndSendAudio(text: string) {
    try {
      const request = {
        input: { text },
        // Produzir PCM LINEAR16 para compatibilidade low-latency
        audioConfig: {
          audioEncoding: "LINEAR16",
          sampleRateHertz: Number(process.env.TTS_SAMPLE_RATE || 24000),
        },
        voice: {
          languageCode: process.env.LANGUAGE_CODE || "pt-PT",
          name: process.env.VOICE_NAME || "Aoede",
        },
      } as any;

      const [response] = await this.ttsClient.synthesizeSpeech(request);
      const audioContent: Buffer = response.audioContent as Buffer;

      if (audioContent && audioContent.length) {
        this.send({ type: "audioChunk", data: audioContent.toString("base64"), encoding: "base64" });
      }
    } catch (err) {
      this.logger.error({ err }, "TTS synth failed");
    }
  }

  send(obj: any) {
    try {
      if (this.ws.readyState === 1) {
        this.ws.send(JSON.stringify(obj));
      }
    } catch (err) {
      this.logger.error({ err }, "ws send failed");
    }
  }

  async close() {
    this.isClosed = true;
    try {
      this.sttStream && this.sttStream.end();
    } catch (e) {
      // ignore
    }
    try {
      this.ws.close();
    } catch (e) {
      // ignore
    }
  }
}
/**
 * CLASSE DE SESSÃO DE VOZ
 * Implementa os 3 pipelines de forma rigorosa:
 * 
 * Pipeline 1: Áudio → STT → Transcrição (isFinal)
 * Pipeline 2: Texto → Gemini Streaming → Chunks de Texto
 * Pipeline 3: Texto → TTS por Frase → Chunks de Áudio
 */

import { WebSocket } from 'ws';
import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';
import { Readable } from 'stream';

interface VoiceSessionConfig {
  sessionId: string;
  userId: string;
  ws: WebSocket;
  language: string;
  voiceName: string;
}

export class VoiceSession {
  private sessionId: string;
  private userId: string;
  private ws: WebSocket;
  private language: string;
  private voiceName: string;

  // Pipeline 1: Google Cloud STT
  private sttClient: speech.SpeechClient;
  private sttStream: any = null;
  private currentTranscript: string = '';

  // Pipeline 2: Gemini 1.5 Flash (via REST API)
  private geminiApiKey: string;

  // Pipeline 3: Google Cloud TTS
  private ttsClient: textToSpeech.TextToSpeechClient;
  private textBuffer: string = '';
  private isStopped: boolean = false;

  // Métricas
  private metrics = {
    audioChunksReceived: 0,
    transcriptionsReceived: 0,
    geminiChunks: 0,
    audioChunksSent: 0,
  };

  constructor(config: VoiceSessionConfig) {
    this.sessionId = config.sessionId;
    this.userId = config.userId;
    this.ws = config.ws;
    this.language = config.language;
    this.voiceName = config.voiceName;

    // Inicializa clientes Google
    this.sttClient = new speech.SpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    this.ttsClient = new textToSpeech.TextToSpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    this.geminiApiKey = process.env.GOOGLE_API_KEY!;

    console.log(`[${this.sessionId}] Sessão inicializada para usuário ${this.userId}`);
  }

  /**
   * PIPELINE 1: Processa chunk de áudio (Linear16 PCM)
   */
  async processAudioChunk(audioData: Buffer): Promise<void> {
    this.metrics.audioChunksReceived++;

    // Inicializa stream STT se necessário
    if (!this.sttStream) {
      this.initializeSTTStream();
    }

    // Envia áudio para STT
    if (this.sttStream && !this.isStopped) {
      this.sttStream.write(audioData);
    }
  }

  /**
   * Inicializa stream de reconhecimento de fala (STT)
   */
  private initializeSTTStream(): void {
    const request: speech.protos.google.cloud.speech.v1.IStreamingRecognitionConfig = {
      config: {
        encoding: 'LINEAR16' as speech.protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding,
        sampleRateHertz: 16000,
        languageCode: this.language,
        enableAutomaticPunctuation: true,
        model: 'latest_long', // Melhor modelo para conversação
        useEnhanced: true,
      },
      interimResults: true, // Transcrições intermédias
    };

    this.sttStream = this.sttClient
      .streamingRecognize(request)
      .on('error', (error: Error) => {
        console.error(`[${this.sessionId}] Erro no STT:`, error);
        this.send({ type: 'error', message: 'Erro ao processar áudio' });
        
        // Reinicia stream após erro
        this.sttStream = null;
        setTimeout(() => this.initializeSTTStream(), 1000);
      })
      .on('data', (data: any) => {
        this.handleSTTData(data);
      });

    console.log(`[${this.sessionId}] Stream STT inicializado`);
  }

  /**
   * Processa resultados do STT
   */
  private async handleSTTData(data: any): Promise<void> {
    if (!data.results || data.results.length === 0) return;

    const result = data.results[0];
    const transcript = result.alternatives[0]?.transcript || '';

    if (!transcript) return;

    this.metrics.transcriptionsReceived++;

    if (result.isFinal) {
      // TRANSCRIÇÃO FINAL
      console.log(`[${this.sessionId}] Transcrição final: "${transcript}"`);
      
      // Envia transcrição final ao cliente
      this.send({
        type: 'transcription',
        text: transcript,
        isFinal: true,
      });

      // PIPELINE 2: Envia para Gemini
      await this.processWithGemini(transcript);
      
      // Reinicia stream para próxima fala
      this.sttStream.end();
      this.sttStream = null;
    } else {
      // TRANSCRIÇÃO INTERMÉDIA
      this.send({
        type: 'transcription',
        text: transcript,
        isFinal: false,
      });
    }
  }

  /**
   * PIPELINE 2: Processa texto com Gemini (streaming)
   */
  private async processWithGemini(userText: string): Promise<void> {
    if (this.isStopped) return;

    try {
      console.log(`[${this.sessionId}] Enviando para Gemini: "${userText}"`);

      // Chama Gemini em modo streaming
      const result = await this.geminiModel.generateContentStream(userText);

      this.textBuffer = '';

      for await (const chunk of result.stream) {
        if (this.isStopped) break;

        const chunkText = chunk.text();
        if (!chunkText) continue;

        this.metrics.geminiChunks++;

        // Envia chunk de texto ao cliente (efeito de digitação)
        this.send({
          type: 'geminiChunk',
          text: chunkText,
        });

        // Acumula no buffer para TTS
        this.textBuffer += chunkText;

        // PIPELINE 3: Verifica se atingiu final de frase
        await this.checkAndSynthesizeSentence();
      }

      // Síntese de qualquer texto restante
      if (this.textBuffer.trim() && !this.isStopped) {
        await this.synthesizeSpeech(this.textBuffer.trim());
        this.textBuffer = '';
      }

      console.log(`[${this.sessionId}] Resposta Gemini completa`);
    } catch (error) {
      console.error(`[${this.sessionId}] Erro no Gemini:`, error);
      this.send({ type: 'error', message: 'Erro ao gerar resposta' });
    }
  }

  /**
   * Verifica se buffer contém frase completa e sintetiza
   */
  private async checkAndSynthesizeSentence(): Promise<void> {
    // Regex para detectar final de frase
    const sentenceEndRegex = /[.!?]\s+/;
    const match = this.textBuffer.match(sentenceEndRegex);

    if (match) {
      const sentenceEndIndex = match.index! + match[0].length;
      const sentence = this.textBuffer.substring(0, sentenceEndIndex).trim();
      
      if (sentence) {
        // PIPELINE 3: Sintetiza esta frase
        await this.synthesizeSpeech(sentence);
      }

      // Remove frase processada do buffer
      this.textBuffer = this.textBuffer.substring(sentenceEndIndex);
    } else if (this.textBuffer.length > 200) {
      // Limite de segurança: sintetiza após 200 caracteres mesmo sem pontuação
      const sentence = this.textBuffer.substring(0, 200).trim();
      await this.synthesizeSpeech(sentence);
      this.textBuffer = this.textBuffer.substring(200);
    }
  }

  /**
   * PIPELINE 3: Sintetiza fala com Google TTS
   */
  private async synthesizeSpeech(text: string): Promise<void> {
    if (this.isStopped || !text.trim()) return;

    try {
      console.log(`[${this.sessionId}] TTS: "${text.substring(0, 50)}..."`);

      const [response] = await this.ttsClient.synthesizeSpeech({
        input: { text },
        voice: {
          languageCode: this.language,
          name: this.voiceName,
        },
        audioConfig: {
          audioEncoding: 'OGG_OPUS', // Formato compacto e eficiente
          speakingRate: 1.0,
          pitch: 0.0,
        },
      });

      if (response.audioContent && !this.isStopped) {
        this.metrics.audioChunksSent++;

        // Envia chunk de áudio ao cliente
        this.send({
          type: 'audioChunk',
          data: response.audioContent.toString('base64'),
          mimeType: 'audio/ogg; codecs=opus',
        });
      }
    } catch (error) {
      console.error(`[${this.sessionId}] Erro no TTS:`, error);
      // Não envia erro ao cliente para não interromper fluxo
    }
  }

  /**
   * Envia texto direto (sem passar por áudio)
   */
  async sendText(text: string): Promise<void> {
    await this.processWithGemini(text);
  }

  /**
   * Para processamento atual (barge-in)
   */
  async stop(): Promise<void> {
    console.log(`[${this.sessionId}] Stop solicitado (barge-in)`);
    
    this.isStopped = true;
    this.textBuffer = '';

    // Para stream STT
    if (this.sttStream) {
      this.sttStream.end();
      this.sttStream = null;
    }

    // Envia confirmação
    this.send({ type: 'stopped' });

    // Reinicia após 100ms
    setTimeout(() => {
      this.isStopped = false;
      console.log(`[${this.sessionId}] Pronto para nova entrada`);
    }, 100);
  }

  /**
   * Envia mensagem ao cliente via WebSocket
   */
  private send(data: any): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Cleanup de recursos
   */
  cleanup(): void {
    console.log(`[${this.sessionId}] Limpando recursos...`);
    console.log(`[${this.sessionId}] Métricas:`, this.metrics);

    this.isStopped = true;

    if (this.sttStream) {
      this.sttStream.end();
      this.sttStream = null;
    }
  }
}
