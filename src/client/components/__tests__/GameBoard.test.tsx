import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameBoard } from '../GameBoard';

describe('GameBoard', () => {
  it('should render 10x10 grid', () => {
    render(<GameBoard width={10} height={10} />);

    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(100);
  });

  it('should call onBoardChange when ship is placed', () => {
    const onBoardChange = vi.fn();

    render(<GameBoard width={10} height={10} onBoardChange={onBoardChange} />);

    // Клик по клетке для размещения корабля
    const firstCell = screen.getAllByRole('button')[0];
    fireEvent.click(firstCell);

    expect(onBoardChange).toHaveBeenCalled();
  });

  it('should display selected ship size', () => {
    render(<GameBoard width={10} height={10} />);

    const size4Button = screen.getByText('4x (0/1)');
    expect(size4Button).toBeInTheDocument();

    fireEvent.click(size4Button);

    // Проверяем что кнопка активна
    expect(size4Button).toHaveClass('bg-tg-button');
  });

  it('should not place ship if it exceeds boundaries', () => {
    const onBoardChange = vi.fn();

    render(<GameBoard width={10} height={10} onBoardChange={onBoardChange} />);

    // Пытаемся разместить корабль в последней колонке
    const lastColumnCell = screen.getAllByRole('button')[9];
    fireEvent.click(lastColumnCell);

    // Если корабль не влезает, onBoardChange не должен вызваться с новым кораблем
    expect(onBoardChange).not.toHaveBeenCalledWith(
      expect.objectContaining({
        ships: expect.arrayContaining([
          expect.objectContaining({ positions: expect.arrayContaining([{ x: 10, y: 0 }]) }),
        ]),
      })
    );
  });

  it('should be non-interactive when interactive is false', () => {
    const { container } = render(<GameBoard width={10} height={10} interactive={false} />);

    const cells = container.querySelectorAll('button');
    const firstCell = cells[0];

    expect(firstCell).toBeDisabled();
  });

  it('should show ships when showShips is true', () => {
    const { container } = render(<GameBoard width={10} height={10} showShips={true} />);

    const cells = container.querySelectorAll('button');
    // До размещения кораблей все клетки должны быть пустыми
    expect(cells[0]).toHaveClass('bg-tg-secondary-bg');
  });
});

