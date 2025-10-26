import { useEffect, useState, useCallback, useRef } from 'react';
import { GameWebSocket } from '../services/websocket';
import { useGame } from '../contexts/GameContext';

export function useWebSocket() {
  const { ws, setWs } = useGame();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<GameWebSocket | null>(null);

  // Подключение
  const connect = useCallback(() => {
    if (wsRef.current?.isConnected()) {
      return;
    }

    const initData = window.Telegram?.WebApp?.initData;

    if (!initData) {
      console.warn('No Telegram initData available');
    }

    const wsClient = new GameWebSocket('ws://localhost:8080');
    wsRef.current = wsClient;

    wsClient.on('ready', () => {
      setConnected(true);
      setError(null);
    });

    wsClient.on('error', (data) => {
      setError(typeof data === 'string' ? data : 'Unknown error');
      setConnected(false);
    });

    wsClient.connect(initData);
    setWs(wsClient as any);
  }, [setWs]);

  // Отключение
  const disconnect = useCallback(() => {
    wsRef.current?.disconnect();
    setConnected(false);
    setWs(null);
    wsRef.current = null;
  }, [setWs]);

  // Подписка на событие
  const on = useCallback((event: string, callback: (data: unknown) => void) => {
    return wsRef.current?.on(event, callback) || (() => {});
  }, []);

  // Отправка сообщения
  const send = useCallback((type: string, payload?: unknown) => {
    wsRef.current?.send({ type, payload });
  }, []);

  // Подключение при монтировании
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected,
    error,
    connect,
    disconnect,
    on,
    send,
    isConnected: wsRef.current?.isConnected() || false,
  };
}

