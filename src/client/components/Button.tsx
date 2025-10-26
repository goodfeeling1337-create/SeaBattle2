import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  disabled?: boolean;
}

export function Button({ children, onClick, variant = 'primary', fullWidth, disabled }: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-tg-button text-tg-button-text hover:opacity-90',
    secondary: 'bg-tg-secondary-bg text-tg-text hover:bg-opacity-80',
  };
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthStyles}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

