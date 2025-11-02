
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`
        px-4 py-2.5 font-semibold text-white bg-blue-600 rounded-lg
        transition-all duration-200 ease-in-out
        hover:bg-blue-500
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500
        disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
