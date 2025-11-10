
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={cn(
        // Base styles - otimizado para touch
        'px-4 py-3 md:py-2.5 font-semibold text-white bg-blue-600 rounded-xl md:rounded-lg',
        'transition-all duration-200 ease-in-out',
        // Touch optimization
        'touch-manipulation active:scale-[0.97]',
        // Hover e focus
        'hover:bg-blue-500',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500',
        // Disabled
        'disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70',
        // Tamanho mínimo touch-friendly (44px min em mobile)
        'min-h-[44px] md:min-h-0',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
