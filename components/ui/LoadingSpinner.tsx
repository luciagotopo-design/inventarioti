// Componente LoadingSpinner - Estado de carga reutilizable
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
};

export default function LoadingSpinner({ 
  size = 'md', 
  message = 'Cargando...', 
  submessage,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const content = (
    <div className="text-center p-8">
      <div className={`animate-spin rounded-full ${sizes[size]} border-4 border-blue-600 border-t-transparent mx-auto`}></div>
      {message && (
        <p className="mt-6 text-lg font-semibold text-gray-700">{message}</p>
      )}
      {submessage && (
        <p className="mt-2 text-sm text-gray-500">{submessage}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="bg-white rounded-lg shadow-lg">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
