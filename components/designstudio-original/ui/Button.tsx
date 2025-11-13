
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
        'px-4 py-3 md:py-2.5 font-semibold text-white bg-orange-500 rounded-xl md:rounded-lg',
        'transition-all duration-200 ease-in-out',
        // Touch optimization
        'touch-manipulation active:scale-[0.97]',
        // Hover e focus
        'hover:bg-orange-600',
        'focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-black focus:ring-orange-500/50',
        // Disabled
        'disabled:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70',
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
