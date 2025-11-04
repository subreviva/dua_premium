/**
 * SERVIDOR WEBSOCKET DE PRODUÇÃO
 * Implementação rigorosa dos 3 pipelines:
 * 
 * Pipeline 1: Voz Usuário → Google STT (streaming) → Texto
 * Pipeline 2: Texto → Gemini 1.5 Flash (streaming) → Texto Resposta
 * Pipeline 3: Texto → Google TTS (por frase) → Áudio (chunks)
 */

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { VoiceSession } from './session.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ 
  server,
  path: '/voice',
  // Configuração de produção
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024
  }
});

const PORT = parseInt(process.env.WS_PORT || '8080', 10);
const RATE_LIMIT = parseInt(process.env.MAX_SESSIONS_PER_USER || '3', 10);

// Mapa de sessões ativas: userId -> Set<sessionId>
const userSessions = new Map<string, Set<string>>();
// Mapa de conexões: ws -> VoiceSession
const activeSessions = new Map<WebSocket, VoiceSession>();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeSessions: activeSessions.size,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// WebSocket connection handler
wss.on('connection', (ws: WebSocket, req) => {
  const sessionId = uuidv4();
  console.log(`[${sessionId}] Nova conexão WebSocket`);

  // Extrai userId do query parameter ou header
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const userId = url.searchParams.get('userId') || 'anonymous';
  const token = url.searchParams.get('token');

  // Valida token (em produção, verificar JWT ou token de sessão)
  if (!token || token.length < 10) {
    ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Token de autenticação inválido' 
    }));
    ws.close(1008, 'Token inválido');
    return;
  }

  // Rate limiting: verifica sessões ativas do usuário
  const userSessionSet = userSessions.get(userId) || new Set();
  if (userSessionSet.size >= RATE_LIMIT) {
    ws.send(JSON.stringify({ 
      type: 'error', 
      message: `Limite de ${RATE_LIMIT} sessões ativas excedido` 
    }));
    ws.close(1008, 'Rate limit excedido');
    return;
  }

  // Registra sessão
  userSessionSet.add(sessionId);
  userSessions.set(userId, userSessionSet);

  // Cria sessão de voz
  const session = new VoiceSession({
    sessionId,
    userId,
    ws,
    language: 'pt-PT',
    voiceName: 'pt-PT-Wavenet-A', // Voz feminina portuguesa
  });

  activeSessions.set(ws, session);

  // Envia confirmação de conexão
  ws.send(JSON.stringify({ 
    type: 'connected', 
    sessionId,
    message: 'Sessão iniciada com sucesso' 
  }));

  // Handler de mensagens
  ws.on('message', async (data: Buffer) => {
    try {
      // Tenta parsear como JSON (comandos)
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'stop':
          // Barge-in: para processamento atual
          await session.stop();
          break;
        
        case 'text':
          // Envia texto direto (sem áudio)
          await session.sendText(message.text);
          break;
        
        default:
          console.warn(`[${sessionId}] Tipo de mensagem desconhecido: ${message.type}`);
      }
    } catch (e) {
      // Não é JSON, assume ser chunk de áudio binário
      // Pipeline 1: Envia para STT
      await session.processAudioChunk(data);
    }
  });

  // Handler de erros
  ws.on('error', (error) => {
    console.error(`[${sessionId}] Erro no WebSocket:`, error);
    cleanup();
  });

  // Handler de fechamento
  ws.on('close', (code, reason) => {
    console.log(`[${sessionId}] Conexão fechada (${code}): ${reason}`);
    cleanup();
  });

  // Cleanup ao desconectar
  function cleanup() {
    session.cleanup();
    activeSessions.delete(ws);
    
    const userSet = userSessions.get(userId);
    if (userSet) {
      userSet.delete(sessionId);
      if (userSet.size === 0) {
        userSessions.delete(userId);
      }
    }
  }

  // Timeout de segurança: fecha após 30 minutos
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        type: 'timeout', 
        message: 'Sessão expirou após 30 minutos' 
      }));
      ws.close(1000, 'Timeout');
    }
  }, 30 * 60 * 1000); // 30 minutos
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, fechando servidor...');
  
  // Fecha todas as sessões ativas
  activeSessions.forEach((session, ws) => {
    session.cleanup();
    ws.close(1001, 'Servidor encerrando');
  });

  wss.close(() => {
    server.close(() => {
      console.log('Servidor fechado');
      process.exit(0);
    });
  });
});

// Inicia servidor
server.listen(PORT, () => {
  console.log(`🎙️  WebSocket server de voz rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/voice?userId=<id>&token=<token>`);
});
