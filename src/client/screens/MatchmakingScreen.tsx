import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { useWebSocket } from '../hooks/useWebSocket';

interface MatchmakingScreenProps {
  onGameStarted: (gameId: string) => void;
  onCancel: () => void;
}

export default function MatchmakingScreen({ onGameStarted, onCancel }: MatchmakingScreenProps) {
  const [status, setStatus] = useState<'connecting' | 'waiting' | 'matched'>('connecting');
  const [gameId, setGameId] = useState<string | null>(null);
  const { send, on, connected } = useWebSocket();

  useEffect(() => {
    if (!connected) {
      setStatus('connecting');
      return;
    }

    // Подписываемся на события матчмейкинга
    const unsubscribe = on('game:started', (data: any) => {
      if (data.gameId) {
        setGameId(data.gameId);
        setStatus('matched');
        onGameStarted(data.gameId);
      }
    });

    on('queue:waiting', () => {
      setStatus('waiting');
    });

    // Вход в очередь
    send('game:queue.join');

    return () => {
      unsubscribe();
    };
  }, [connected, send, on, onGameStarted]);

  const handleCancel = () => {
    send('game:queue.leave');
    onCancel();
  };

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

      {!connected && status === 'connecting' && (
        <div className="text-red-500 text-sm">Не удалось подключиться</div>
      )}

      <Button onClick={handleCancel} variant="secondary">
        Отмена
      </Button>
    </div>
  );
}

