import { useState } from 'react';
import { Button } from '../components/Button';

interface BattleScreenProps {
  gameId: string;
  onGameEnd: (winnerId: string) => void;
  onCancel: () => void;
}

export default function BattleScreen({ onGameEnd, onCancel }: BattleScreenProps) {
  const [status, setStatus] = useState<'waiting' | 'your-turn' | 'opponent-turn'>('waiting');

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

        {/* TODO: Render opponent's board with fog of war */}
        <div className="border-2 border-tg-text rounded p-2 mb-4">
          <h3 className="text-sm font-medium mb-2">Поле противника</h3>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 100 }).map((_, i) => (
              <button
                key={i}
                className="aspect-square border border-tg-hint bg-tg-secondary-bg rounded hover:bg-tg-secondary-bg/80"
                disabled={status !== 'your-turn'}
              ></button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={onCancel} variant="secondary">
        Сдаться
      </Button>
    </div>
  );
}

