import { createContext, useContext, useState, ReactNode } from 'react';
import type { BoardState, Skin, User } from '../../types';

interface GameContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  currentSkin: Skin | null;
  setCurrentSkin: (skin: Skin | null) => void;
  ws: WebSocket | null;
  setWs: (ws: WebSocket | null) => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentSkin, setCurrentSkin] = useState<Skin | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  return (
    <GameContext.Provider value={{ user, setUser, currentSkin, setCurrentSkin, ws, setWs }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

