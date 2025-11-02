
import React from 'react';
import { ToolId } from '../types';
import { TOOLS } from '../constants';

interface ToolbarProps {
  activeTool: ToolId | null;
  onToolSelect: (toolId: ToolId) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolSelect }) => {
  return (
    <nav className="flex flex-col items-center bg-gray-900 border-r border-gray-700/50 p-4 space-y-4">
      <div className="text-blue-400 font-bold text-2xl mb-4">DUA</div>
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id)}
          aria-label={tool.name}
          title={tool.name}
          className={`p-3 rounded-lg transition-colors duration-200 ${
            activeTool === tool.id
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {tool.icon}
        </button>
      ))}
    </nav>
  );
};

export default React.memo(Toolbar);
