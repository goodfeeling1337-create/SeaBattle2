import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPrivateRoom, getPrivateRoom, joinPrivateRoom } from '../rooms';

// Mock Prisma Client
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    privateRoom: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  };

  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

describe('Private Rooms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPrivateRoom', () => {
    it('should create a private room with unique code', async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        id: 'room-1',
        code: 'ABCD',
        gameId: null,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        full: false,
      });

      // Получаем mocked instance
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.privateRoom.create as any) = mockCreate;

      const room = await createPrivateRoom();

      expect(mockCreate).toHaveBeenCalled();
      expect(room).toHaveProperty('code');
      expect(room.code).toHaveLength(4);
      expect(room.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('getPrivateRoom', () => {
    it('should return room if exists and not expired', async () => {
      const mockFind = vi.fn().mockResolvedValue({
        id: 'room-1',
        code: 'ABCD',
        gameId: null,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        full: false,
      });

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.privateRoom.findUnique as any) = mockFind;

      const room = await getPrivateRoom('ABCD');

      expect(room).not.toBeNull();
      expect(room?.code).toBe('ABCD');
    });

    it('should return null if room expired', async () => {
      const mockFind = vi.fn().mockResolvedValue({
        id: 'room-1',
        code: 'ABCD',
        gameId: null,
        createdAt: new Date(Date.now() - 20 * 60 * 1000),
        expiresAt: new Date(Date.now() - 10 * 60 * 1000), // Истек 10 минут назад
        full: false,
      });

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.privateRoom.findUnique as any) = mockFind;

      const room = await getPrivateRoom('ABCD');

      expect(room).toBeNull();
    });
  });

  describe('joinPrivateRoom', () => {
    it('should allow joining empty room', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      (prisma.privateRoom.findUnique as any) = vi.fn().mockResolvedValue({
        id: 'room-1',
        code: 'ABCD',
        gameId: null,
        full: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      (prisma.privateRoom.update as any) = vi.fn().mockResolvedValue({});

      const result = await joinPrivateRoom('ABCD', 'user-1', 'game-1');

      expect(result.success).toBe(true);
    });

    it('should reject joining full room', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      (prisma.privateRoom.findUnique as any) = vi.fn().mockResolvedValue({
        id: 'room-1',
        code: 'ABCD',
        gameId: null,
        full: true,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const result = await joinPrivateRoom('ABCD', 'user-2', 'game-2');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Room is full');
    });

    it('should reject joining room with existing game', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      (prisma.privateRoom.findUnique as any) = vi.fn().mockResolvedValue({
        id: 'room-1',
        code: 'ABCD',
        gameId: 'game-exists',
        full: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const result = await joinPrivateRoom('ABCD', 'user-2', 'game-2');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Room already has a game');
    });

    it('should reject joining non-existent room', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      (prisma.privateRoom.findUnique as any) = vi.fn().mockResolvedValue(null);

      const result = await joinPrivateRoom('XXXX', 'user-1', 'game-1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Room not found or expired');
    });
  });
});

