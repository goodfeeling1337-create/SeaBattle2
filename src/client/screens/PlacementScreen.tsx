import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { GameBoard } from '../components/GameBoard';
import { useWebSocket } from '../hooks/useWebSocket';
import { generateBotBoard } from '../../domain/bot-placement';
import type { BoardState } from '../../types';

interface PlacementScreenProps {
  gameId: string;
  onReady: () => void;
  onCancel: () => void;
}

export default function PlacementScreen({ gameId, onReady, onCancel }: PlacementScreenProps) {
  const [board, setBoard] = useState<BoardState | null>(null);
  const { send, on, connected } = useWebSocket();

  // Подписка на события
  useEffect(() => {
    const unsubscribe = on('board:set', () => {
      // Доска подтверждена сервером
      console.log('Board set confirmed by server');
    });

    const unsubscribeAllReady = on('game:all_ready', () => {
      // Обе доски готовы, начинаем игру
      console.log('All boards ready, starting battle');
      onReady();
    });

    return () => {
      unsubscribe();
      unsubscribeAllReady();
    };
  }, [on, onReady]);

  const handleBoardChange = (newBoard: BoardState) => {
    setBoard(newBoard);

    // Проверяем что все корабли размещены
    const shipsConfig = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    const hasAllShips = shipsConfig.every(
      (size) => newBoard.ships.filter((s) => s.size === size).length >= 1
    );

    if (hasAllShips && newBoard.ships.length === 10) {
      // Отправляем доску на сервер
      send('game:board.set', {
        gameId,
        board: newBoard,
      });
    }
  };

  const handleAutoPlace = () => {
    // Генерируем случайную доску
    const autoBoard = generateBotBoard(10, 10);
    setBoard(autoBoard);

    // Отправляем на сервер
    if (autoBoard.ships.length === 10) {
      send('game:board.set', {
        gameId,
        board: autoBoard,
      });
    }
  };

  const handleReady = () => {
    if (!board) return;

    // Проверяем что все корабли размещены
    if (board.ships.length !== 10) {
      alert('Разместите все корабли!');
      return;
    }

    onReady();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold">Размещение кораблей</h2>

      <div className="w-full max-w-md">
        <div className="bg-tg-secondary-bg p-4 rounded-lg mb-4">
          <p className="text-sm text-tg-hint">
            Разместите корабли на доске. Нажмите на клетку для выбора позиции.
          </p>
        </div>

        <GameBoard width={10} height={10} onBoardChange={handleBoardChange} showShips={true} />

        {!connected && (
          <p className="text-red-500 text-sm mt-2">Подключение к серверу...</p>
        )}

        <div className="mt-4 space-y-2">
          <Button onClick={handleAutoPlace} variant="secondary" fullWidth>
            🎲 Автоматическое размещение
          </Button>
          
          <div className="flex gap-2">
            <Button onClick={handleReady} disabled={!board || board.ships.length !== 10} fullWidth>
              Готов ({board?.ships.length || 0}/10 кораблей)
            </Button>
            <Button onClick={onCancel} variant="secondary">
              Отмена
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

