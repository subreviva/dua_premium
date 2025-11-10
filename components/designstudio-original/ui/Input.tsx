
import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <input
        id={id}
        className={cn(
          // Base styles - altura otimizada para touch
          'w-full px-4 py-3 md:py-3',
          'bg-gray-700 border border-gray-600 rounded-xl md:rounded-lg',
          'text-gray-200 placeholder-gray-400',
          // Focus e interaction
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'transition-all duration-200',
          // Touch optimization
          'touch-manipulation',
          'text-base md:text-sm', // Evita zoom no iOS
          // Disabled
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Altura mínima para touch
          'min-h-[44px]',
          className
        )}
        {...props}
      />
    </div>
  );
};

export default Input;
