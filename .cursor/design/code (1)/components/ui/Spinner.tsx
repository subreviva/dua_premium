
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div
      className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
