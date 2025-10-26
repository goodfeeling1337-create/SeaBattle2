import { useState } from 'react';
import type { BoardState, Position, Ship } from '../../types';

interface GameBoardProps {
  width: number;
  height: number;
  onBoardChange?: (board: BoardState) => void;
  interactive?: boolean;
  showShips?: boolean;
  className?: string;
}

export function GameBoard({
  width,
  height,
  onBoardChange,
  interactive = true,
  showShips = true,
  className = '',
}: GameBoardProps) {
  const [board, setBoard] = useState<BoardState>({
    width,
    height,
    ships: [],
    hits: [],
    misses: [],
    sunkenShips: [],
  });

  const [selectedShipSize, setSelectedShipSize] = useState<number>(4);
  const [isHorizontal, setIsHorizontal] = useState(true);

  // Получить содержимое клетки
  const getCellContent = (x: number, y: number) => {
    const ship = board.ships.find((s) =>
      s.positions.some((p) => p.x === x && p.y === y)
    );

    if (board.hits.some((h) => h.x === x && h.y === y)) {
      return ship ? 'hit' : 'miss';
    }

    if (board.misses.some((m) => m.x === x && m.y === y)) {
      return 'miss';
    }

    if (showShips && ship) {
      return 'ship';
    }

    return 'empty';
  };

  // Обработчик клика
  const handleCellClick = (x: number, y: number) => {
    if (!interactive) return;

    // Размещение корабля
    if (selectedShipSize > 0) {
      const positions: Position[] = [];
      for (let i = 0; i < selectedShipSize; i++) {
        const newX = isHorizontal ? x + i : x;
        const newY = isHorizontal ? y : y + i;

        if (newX >= width || newY >= height) {
          return; // Не влезает
        }

        positions.push({ x: newX, y: newY });
      }

      const newShip: Ship = {
        id: `ship-${Date.now()}`,
        size: selectedShipSize,
        positions,
      };

      const updatedBoard = {
        ...board,
        ships: [...board.ships, newShip],
      };

      setBoard(updatedBoard);
      onBoardChange?.(updatedBoard);
    }
  };

  return (
    <div className={`game-board ${className}`}>
      <div className="grid grid-cols-10 gap-1 border-2 border-tg-text rounded p-2">
        {Array.from({ length: width * height }).map((_, i) => {
          const x = i % width;
          const y = Math.floor(i / width);
          const content = getCellContent(x, y);

          return (
            <button
              key={i}
              className={`aspect-square border rounded transition-colors ${
                content === 'ship'
                  ? 'bg-blue-600'
                  : content === 'hit'
                  ? 'bg-red-600'
                  : content === 'miss'
                  ? 'bg-gray-400'
                  : 'bg-tg-secondary-bg hover:bg-tg-secondary-bg/80'
              }`}
              onClick={() => handleCellClick(x, y)}
              disabled={!interactive}
            >
              {content === 'hit' && '✖'}
              {content === 'miss' && '○'}
            </button>
          );
        })}
      </div>

      {interactive && (
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isHorizontal}
                onChange={(e) => setIsHorizontal(e.target.checked)}
              />
              <span className="text-sm">Горизонтально</span>
            </label>
          </div>

          <div className="flex gap-2">
            {[4, 3, 2, 1].map((size) => {
              const count = board.ships.filter((s) => s.size === size).length;
              const maxCount = size === 4 ? 1 : size === 3 ? 2 : size === 2 ? 3 : 4;

              return (
                <button
                  key={size}
                  onClick={() => setSelectedShipSize(size)}
                  disabled={count >= maxCount}
                  className={`px-3 py-1 rounded ${
                    selectedShipSize === size
                      ? 'bg-tg-button text-white'
                      : count >= maxCount
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-tg-secondary-bg'
                  }`}
                >
                  {size}x ({count}/{maxCount})
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setBoard({ width, height, ships: [], hits: [], misses: [], sunkenShips: [] });
              onBoardChange?.(board);
            }}
            className="w-full px-4 py-2 bg-red-500 text-white rounded"
          >
            Очистить
          </button>
        </div>
      )}
    </div>
  );
}

