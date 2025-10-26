import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { BattleBoard } from '../components/BattleBoard';
import { useWebSocket } from '../hooks/useWebSocket';
import type { BoardState } from '../../types';

interface BattleScreenProps {
  gameId: string;
  onGameEnd: (winnerId: string) => void;
  onCancel: () => void;
}

export default function BattleScreen({ gameId, onGameEnd, onCancel }: BattleScreenProps) {
  const [status, setStatus] = useState<'waiting' | 'your-turn' | 'opponent-turn'>('waiting');
  const [opponentBoard, setOpponentBoard] = useState<BoardState>({
    width: 10,
    height: 10,
    ships: [],
    hits: [],
    misses: [],
    sunkenShips: [],
  });
  const { send, on } = useWebSocket();

  useEffect(() => {
    // Подписываемся на события игры
    const unsubscribeShot = on('game:shot.result', (data: any) => {
      // Обновляем доску противника
      if (data.x !== undefined && data.y !== undefined) {
        const result = data.result;

        if (result.type === 'MISS') {
          setOpponentBoard((prev) => ({
            ...prev,
            misses: [...prev.misses, { x: data.x, y: data.y }],
          }));
          setStatus('opponent-turn');
        } else if (result.type === 'HIT' || result.type === 'SINK') {
          setOpponentBoard((prev) => ({
            ...prev,
            hits: [...prev.hits, { x: data.x, y: data.y }],
          }));

          if (result.type === 'SINK' && result.gameOver) {
            onGameEnd(data.winnerId);
          }
        }
      }
    });

    const unsubscribeTurn = on('game:turn', (data: any) => {
      if (data.isMyTurn) {
        setStatus('your-turn');
      } else {
        setStatus('opponent-turn');
      }
    });

    return () => {
      unsubscribeShot();
      unsubscribeTurn();
    };
  }, [on, onGameEnd]);

  const handleCellClick = async (x: number, y: number) => {
    if (status !== 'your-turn') return;

    // Отправка выстрела игрока
    send('game:shot.fire', {
      gameId,
      x,
      y,
    });

    // Если игра с ботом - сделать ход бота после небольшой паузы
    // TODO: Проверить isVsBot из Game state
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/game/${gameId}/bot/turn`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Telegram-Init-Data': window.Telegram?.WebApp?.initData || '',
          },
        });

        if (response.ok) {
          const botTurn = await response.json();
          // Обновить UI с результатом хода бота
          setOpponentBoard((prev) => ({
            ...prev,
            hits: botTurn.result.type !== 'MISS' ? [...prev.hits, { x: botTurn.x, y: botTurn.y }] : prev.hits,
            misses: botTurn.result.type === 'MISS' ? [...prev.misses, { x: botTurn.x, y: botTurn.y }] : prev.misses,
          }));

          if (!botTurn.gameOver) {
            setStatus('your-turn');
          } else {
            onGameEnd('bot');
          }
        }
      } catch (error) {
        console.error('Error making bot turn:', error);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold">Битва</h2>

      <div className="w-full max-w-md">
        {status === 'waiting' && (
          <p className="text-center text-tg-hint">Ожидание размещения кораблей...</p>
        )}
        {status === 'your-turn' && (
          <p className="text-center text-green-500">Ваш ход!</p>
        )}
        {status === 'opponent-turn' && (
          <p className="text-center text-tg-hint">Ход соперника...</p>
        )}

        <BattleBoard
          board={opponentBoard}
          fogOfWar={true}
          onCellClick={handleCellClick}
          disabled={status !== 'your-turn'}
          title="Поле противника"
        />
      </div>

      <Button onClick={onCancel} variant="secondary">
        Сдаться
      </Button>
    </div>
  );
}

