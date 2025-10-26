import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BattleBoard } from '../BattleBoard';
import type { BoardState } from '../../../types';

describe('BattleBoard', () => {
  const mockBoard: BoardState = {
    width: 10,
    height: 10,
    ships: [
      {
        id: 'ship-1',
        size: 4,
        positions: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
        ],
      },
    ],
    hits: [{ x: 0, y: 0 }],
    misses: [{ x: 5, y: 5 }],
    sunkenShips: [],
  };

  it('should render grid', () => {
    render(<BattleBoard board={mockBoard} fogOfWar={true} />);

    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(100);
  });

  it('should display hits', () => {
    render(<BattleBoard board={mockBoard} fogOfWar={false} />);

    const firstCell = screen.getAllByRole('button')[0];
    expect(firstCell).toHaveClass('bg-red-600');
  });

  it('should display misses', () => {
    render(<BattleBoard board={mockBoard} fogOfWar={false} />);

    const missCellIndex = 5 * 10 + 5; // x=5, y=5
    const missCell = screen.getAllByRole('button')[missCellIndex];
    expect(missCell).toHaveClass('bg-gray-400');
  });

  it('should hide ships with fog of war', () => {
    render(<BattleBoard board={mockBoard} fogOfWar={true} />);

    // Корабль не должен быть виден
    const shipCell = screen.getAllByRole('button')[0];
    expect(shipCell).not.toHaveClass('bg-blue-600');
  });

  it('should show ships without fog of war', () => {
    render(<BattleBoard board={mockBoard} fogOfWar={false} />);

    const shipCell = screen.getAllByRole('button')[0];
    expect(shipCell).toHaveClass('bg-blue-600');
  });

  it('should call onCellClick when clicking unknown cell', () => {
    const onCellClick = vi.fn();
    render(<BattleBoard board={mockBoard} fogOfWar={true} onCellClick={onCellClick} />);

    // Клик по неизвестной клетке
    const unknownCellIndex = 6 * 10 + 6;
    const unknownCell = screen.getAllByRole('button')[unknownCellIndex];

    fireEvent.click(unknownCell);

    expect(onCellClick).toHaveBeenCalledWith(6, 6);
  });

  it('should not call onCellClick for known cells', () => {
    const onCellClick = vi.fn();
    render(<BattleBoard board={mockBoard} fogOfWar={true} onCellClick={onCellClick} />);

    // Клик по уже обстрелянной клетке
    const hitCell = screen.getAllByRole('button')[0];
    fireEvent.click(hitCell);

    expect(onCellClick).not.toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<BattleBoard board={mockBoard} fogOfWar={true} disabled={true} />);

    const cells = screen.getAllByRole('button');
    cells.forEach((cell) => {
      expect(cell).toBeDisabled();
    });
  });

  it('should show title when provided', () => {
    render(<BattleBoard board={mockBoard} fogOfWar={true} title="Поле противника" />);

    expect(screen.getByText('Поле противника')).toBeInTheDocument();
  });
});

