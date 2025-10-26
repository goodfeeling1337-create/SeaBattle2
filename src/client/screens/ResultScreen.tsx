import { useState } from 'react';
import { Button } from '../components/Button';

interface ResultScreenProps {
  gameId: string;
  onNewGame: () => void;
  onHome: () => void;
}

export default function ResultScreen({ onNewGame, onHome }: ResultScreenProps) {
  const [result] = useState<'win' | 'lose' | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6">
      <div className="text-center">
        {result === 'win' && (
          <>
            <h2 className="text-3xl font-bold text-green-500 mb-2">Победа!</h2>
            <p className="text-tg-hint">Вы потопили все корабли противника</p>
          </>
        )}
        {result === 'lose' && (
          <>
            <h2 className="text-3xl font-bold text-red-500 mb-2">Поражение</h2>
            <p className="text-tg-hint">Все ваши корабли потоплены</p>
          </>
        )}
        {result === null && (
          <>
            <h2 className="text-2xl font-bold mb-2">Игра завершена</h2>
            <p className="text-tg-hint">...</p>
          </>
        )}
      </div>

      <div className="w-full max-w-sm space-y-4 mt-8">
        <Button onClick={onNewGame} fullWidth>
          Новая игра
        </Button>
        <Button onClick={onHome} variant="secondary" fullWidth>
          На главную
        </Button>
      </div>
    </div>
  );
}

