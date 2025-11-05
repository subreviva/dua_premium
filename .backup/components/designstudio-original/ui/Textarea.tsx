
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <textarea
        id={id}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        {...props}
      />
    </div>
  );
};

export default Textarea;
