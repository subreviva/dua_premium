import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import pino from "pino";
import { v4 as uuidv4 } from "uuid";
import VoiceSession from "./session";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const PORT = Number(process.env.PORT || 4000);

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

const server = http.createServer(app);

// WebSocket server on /ws
const wss = new WebSocketServer({ server, path: "/ws" });

// Track active sessions per user for rate limiting (max 3)
const activeSessionsByUser: Map<string, Set<string>> = new Map();

// Global session store
const sessions: Map<string, VoiceSession> = new Map();

wss.on("connection", (ws, req) => {
  try {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token") || req.headers["x-ephemeral-token"] as string;
    const userId = url.searchParams.get("user") || (req.headers["x-user-id"] as string) || `anon_${uuidv4()}`;

    if (!token) {
      ws.close(4001, "Missing ephemeral token");
      return;
    }

    // Rate limiting: max 3 sessions/user
    const set = activeSessionsByUser.get(userId) || new Set<string>();
    if (set.size >= Number(process.env.MAX_SESSIONS_PER_USER || 3)) {
      ws.close(4003, "Too many active sessions");
      return;
    }

    const sessionId = uuidv4();
    set.add(sessionId);
    activeSessionsByUser.set(userId, set);

    logger.info({ userId, sessionId }, "New websocket connection");

    const session = new VoiceSession({ ws, sessionId, userId, token, logger });
    sessions.set(sessionId, session);

    session.init().catch((err) => logger.error({ err }, "session.init error"));

    ws.on("close", () => {
      session.close();
      sessions.delete(sessionId);
      const s = activeSessionsByUser.get(userId);
      s?.delete(sessionId);
      if (s && s.size === 0) activeSessionsByUser.delete(userId);
      logger.info({ userId, sessionId }, "connection closed and session cleaned up");
    });

    ws.on("error", (err) => {
      logger.error({ err, userId, sessionId }, "ws error");
      ws.close(1011, "internal error");
    });
  } catch (err) {
    logger.error({ err }, "ws connection handling failed");
    ws.close(1011, "internal server error");
  }
});

server.listen(PORT, () => {
  logger.info({ port: PORT }, "WS server listening");
});

process.on("SIGINT", () => process.exit(0));
