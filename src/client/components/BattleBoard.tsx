import type { BoardState } from '../../types';

interface BattleBoardProps {
  board: BoardState;
  fogOfWar: boolean; // Скрывать непроверенные клетки
  onCellClick?: (x: number, y: number) => void;
  disabled?: boolean;
  title?: string;
}

export function BattleBoard({ board, fogOfWar, onCellClick, disabled, title }: BattleBoardProps) {
  const getCellContent = (x: number, y: number) => {
    const ship = board.ships.find((s) =>
      s.positions.some((p) => p.x === x && p.y === y)
    );

    const isHit = board.hits.some((h) => h.x === x && h.y === y);
    const isMiss = board.misses.some((m) => m.x === x && m.y === y);

    if (isHit) {
      return ship ? 'hit' : 'miss';
    }

    if (isMiss) {
      return 'miss';
    }

    // Туман войны - скрываем корабли противника
    if (fogOfWar && !isHit && !isMiss) {
      return 'unknown';
    }

    // Если туман войны выключен, показываем корабли
    if (!fogOfWar && ship) {
      return 'ship';
    }

    return 'empty';
  };

  const handleCellClick = (x: number, y: number) => {
    if (disabled || !onCellClick) return;

    const content = getCellContent(x, y);

    // Можно стрелять только в неизвестные клетки
    if (content !== 'unknown') return;

    onCellClick(x, y);
  };

  return (
    <div className="battle-board">
      {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}

      <div className="grid grid-cols-10 gap-1 border-2 border-tg-text rounded p-2">
        {Array.from({ length: board.width * board.height }).map((_, i) => {
          const x = i % board.width;
          const y = Math.floor(i / board.width);
          const content = getCellContent(x, y);

          const cellClasses =
            content === 'hit'
              ? 'bg-red-600 text-white'
              : content === 'miss'
              ? 'bg-gray-400'
              : content === 'ship'
              ? 'bg-blue-600'
              : content === 'unknown'
              ? 'bg-tg-secondary-bg hover:bg-tg-secondary-bg/80 cursor-pointer'
              : 'bg-tg-secondary-bg';

          return (
            <button
              key={i}
              className={`aspect-square border rounded transition-colors ${cellClasses}`}
              onClick={() => handleCellClick(x, y)}
              disabled={disabled || content !== 'unknown'}
            >
              {content === 'hit' && <span className="text-white font-bold">✖</span>}
              {content === 'miss' && <span className="text-white">○</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

