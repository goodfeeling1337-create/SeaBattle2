import { useState } from 'react';
import { Button } from '../components/Button';

interface PlacementScreenProps {
  gameId: string;
  onReady: () => void;
  onCancel: () => void;
}

export default function PlacementScreen({ onReady, onCancel }: PlacementScreenProps) {
  const [placed, setPlaced] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold">Размещение кораблей</h2>

      <div className="w-full max-w-md">
        <div className="bg-tg-secondary-bg p-4 rounded-lg mb-4">
          <p className="text-sm text-tg-hint">
            Разместите корабли на доске. Нажмите на клетку для выбора позиции.
          </p>
        </div>

        {/* TODO: Render board for placement */}
        <div className="border-2 border-tg-text rounded p-2 mb-4">
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square border border-tg-hint bg-tg-secondary-bg rounded"
              ></div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={onReady} disabled={!placed} fullWidth>
            Готов
          </Button>
          <Button onClick={onCancel} variant="secondary" fullWidth>
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
}

