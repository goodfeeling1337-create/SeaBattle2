// Общие типы для фронтенда и бэкенда

export interface Position {
  x: number;
  y: number;
}

export interface Ship {
  id: string;
  size: number;
  positions: Position[];
}

export interface BoardState {
  width: number;
  height: number;
  ships: Ship[];
  hits: Position[];
  misses: Position[];
  sunkenShips: string[];
}

export interface GameState {
  id: string;
  status: 'LOBBY' | 'IN_PROGRESS' | 'FINISHED' | 'ABANDONED';
  players: {
    p1: { id: string; ready: boolean };
    p2?: { id: string; ready: boolean };
  };
  currentTurn?: string;
  winnerId?: string;
  boards: {
    p1: BoardState;
    p2?: BoardState;
  };
}

export interface Shot {
  x: number;
  y: number;
}

export interface ShotResult {
  type: 'MISS' | 'HIT' | 'SINK';
  sunkShipId?: string;
  gameOver?: boolean;
}

export interface User {
  id: string;
  telegramId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  softCurrency: number;
  equippedSkin?: Skin;
}

export interface Skin {
  id: string;
  key: string;
  name: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  assets: {
    version: number;
    name: string;
    sprites: {
      ship: string;
      cell: string;
      hit: string;
      miss: string;
      empty: string;
    };
    cssVars: Record<string, string>;
  };
  previewUrl?: string;
  isDefault: boolean;
  owned: boolean;
  equipped: boolean;
}

export interface RealtimeMessage<T = unknown> {
  type: string;
  payload?: T;
  error?: string;
}

export interface GameMessage {
  gameId: string;
}

export interface BoardMessage extends GameMessage {
  board: BoardState;
}

export interface ShotMessage extends GameMessage {
  x: number;
  y: number;
}

