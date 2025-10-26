import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up z-50`}
    >
      <span className="font-bold">{icon[type]}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-80 transition-opacity"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

// Toast provider
export interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

export const useToast = () => {
  // This will be implemented with Context in ToastProvider
  return {
    showToast: (message: string, type?: ToastType) => {
      console.log(`[${type}] ${message}`);
    },
  };
};

