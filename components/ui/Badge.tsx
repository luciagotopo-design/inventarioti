// Componente Badge - Para mostrar estados, prioridades, etc.
import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'error';
  color?: string; // Color personalizado (hex)
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  color,
  className 
}) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const style = color ? {
    backgroundColor: `${color}20`,
    color: color,
    borderColor: color,
  } : undefined;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        !color && variantStyles[variant],
        color && 'border',
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
};

export default Badge;
export { Badge };
