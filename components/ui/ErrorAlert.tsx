// Componente ErrorAlert - Alertas de error reutilizables
import React from 'react';

interface ErrorAlertProps {
  title: string;
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}

const styles = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
    buttonBg: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700',
    buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
  },
};

export default function ErrorAlert({ title, message, onRetry, type = 'error' }: ErrorAlertProps) {
  const style = styles[type];

  return (
    <div className="p-8">
      <div className={`${style.bg} border-l-4 ${style.border} p-6 rounded-lg`}>
        <div className="flex items-start">
          <svg 
            className={`w-8 h-8 ${style.iconColor} mr-4 flex-shrink-0`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {type === 'error' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
            {type === 'warning' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            )}
            {type === 'info' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${style.titleColor}`}>{title}</h3>
            <p className={`${style.messageColor} mt-1`}>{message}</p>
            {onRetry && (
              <button 
                onClick={onRetry}
                className={`mt-4 px-4 py-2 ${style.buttonBg} text-white rounded transition font-medium`}
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
