import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameWebSocket } from '../websocket';

describe('GameWebSocket', () => {
  let ws: GameWebSocket;

  beforeEach(() => {
    ws = new GameWebSocket('ws://localhost:8080');
  });

  afterEach(() => {
    ws.disconnect();
  });

  it('should create instance', () => {
    expect(ws).toBeDefined();
  });

  it('should subscribe to events', () => {
    const callback = vi.fn();
    const unsubscribe = ws.on('test', callback);

    expect(unsubscribe).toBeDefined();
    expect(typeof unsubscribe).toBe('function');
  });

  it('should notify listeners on events', (done) => {
    const callback = vi.fn();

    ws.on('custom', (data) => {
      expect(data).toEqual({ test: 123 });
      done();
    });

    // Симуляция входящего сообщения
    (ws as any).handleMessage({
      type: 'custom',
      payload: { test: 123 },
    });
  });

  it('should handle errors', (done) => {
    const callback = vi.fn();

    ws.on('error', callback);

    (ws as any).handleMessage({
      type: 'error',
      error: 'Something went wrong',
    });

    expect(callback).toHaveBeenCalled();
    done();
  });

  it('should unsubscribe from events', () => {
    const callback = vi.fn();
    const unsubscribe = ws.on('test', callback);

    unsubscribe();

    // Проверяем что callback не вызывается после отписки
    (ws as any).handleMessage({ type: 'test', payload: {} });
    expect(callback).not.toHaveBeenCalled();
  });

  it('should track connection state', () => {
    expect(ws.isConnected()).toBe(false);
  });
});

