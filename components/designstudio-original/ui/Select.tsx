
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-white/90 mb-1">
        {label}
      </label>
      <select
        id={id}
        className="w-full p-3 bg-transparent border border-white/[0.08] rounded-lg text-white focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 hover:border-white/[0.15] transition disabled:opacity-50 disabled:cursor-not-allowed"
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;
