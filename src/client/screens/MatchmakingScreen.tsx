import { useState, useEffect } from 'react';
import { Button } from '../components/Button';

interface MatchmakingScreenProps {
  onGameStarted: (gameId: string) => void;
  onCancel: () => void;
}

export default function MatchmakingScreen({ onGameStarted, onCancel }: MatchmakingScreenProps) {
  const [status, setStatus] = useState<'connecting' | 'waiting' | 'matched'>('connecting');

  useEffect(() => {
    // TODO: Connect to WebSocket and join queue
    setStatus('waiting');

    // Simulate match found after 3 seconds
    const timer = setTimeout(() => {
      setStatus('matched');
      onGameStarted('mock-game-id');
    }, 3000);

    return () => clearTimeout(timer);
  }, [onGameStarted]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Поиск соперника</h2>
        {status === 'connecting' && <p className="text-tg-hint">Подключение...</p>}
        {status === 'waiting' && <p className="text-tg-hint">Ожидание...</p>}
        {status === 'matched' && <p className="text-green-500">Соперник найден!</p>}
      </div>

      {status === 'waiting' && (
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tg-button"></div>
      )}

      <Button onClick={onCancel} variant="secondary">
        Отмена
      </Button>
    </div>
  );
}

