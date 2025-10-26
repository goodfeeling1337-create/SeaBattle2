import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWebSocket } from '../useWebSocket';

// Mock GameContext
vi.mock('../../contexts/GameContext', () => ({
  useGame: () => ({
    ws: null,
    setWs: vi.fn(),
  }),
}));

// Mock Telegram
global.window = {
  Telegram: {
    WebApp: {
      initData: 'test_init_data',
    },
  },
} as any;

describe('useWebSocket', () => {
  it('should be defined', () => {
    expect(useWebSocket).toBeDefined();
  });

  // Note: Полные интеграционные тесты требуют mock WebSocket
  // Это базовый тест структуры
  it('should return api', () => {
    const { result } = renderHook(() => useWebSocket());

    expect(result.current).toHaveProperty('connected');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('connect');
    expect(result.current).toHaveProperty('disconnect');
    expect(result.current).toHaveProperty('on');
    expect(result.current).toHaveProperty('send');
  });
});

