import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { getConfig } from '../config';
import { setupRealtimeHandler } from './realtime';
import { setupRestRoutes } from './rest';

dotenv.config();

const config = getConfig();
const app = express();
const httpServer = createServer(app);

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// CORS для локальной разработки
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Telegram-Init-Data');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket server
const wss = new WebSocketServer({ server: httpServer });
setupRealtimeHandler(wss);

// REST API
setupRestRoutes(app);

const PORT = parseInt(config.PORT, 10);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
  console.log(`🎮 Environment: ${config.NODE_ENV}`);
});

