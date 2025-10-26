// WebSocket сервис для игровых событий
export interface WebSocketMessage {
  type: string;
  payload?: unknown;
  error?: string;
}

export class GameWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners = new Map<string, Set<(data: unknown) => void>>();

  constructor(url: string) {
    this.url = url;
  }

  // Подключение к WebSocket
  connect(initData?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected');
      return;
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;

      // Инициализация с Telegram auth
      if (initData) {
        this.send({
          type: 'init',
          payload: { initData },
        });
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(initData);
    };
  }

  // Переподключение
  private attemptReconnect(initData?: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect(initData);
    }, delay);
  }

  // Отправка сообщения
  send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    this.ws.send(JSON.stringify(message));
  }

  // Подписка на события
  on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Возвращаем функцию отписки
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // Обработка входящих сообщений
  private handleMessage(message: WebSocketMessage): void {
    if (message.error) {
      this.listeners.get('error')?.forEach((cb) => cb(message));
      return;
    }

    this.listeners.get(message.type)?.forEach((cb) => cb(message.payload || message));
  }

  // Отключение
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  // Проверка состояния подключения
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

