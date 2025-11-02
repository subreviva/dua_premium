'use client';

import React from 'react';
import { CanvasContent } from '@/types/designstudio-full';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2, Trash2, History } from 'lucide-react';

interface HistoryPanelProps {
  history: CanvasContent[];
  currentIndex: number;
  onUndo: () => void;
  onRedo: () => void;
  onSelect: (content: CanvasContent) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  history, 
  currentIndex, 
  onUndo, 
  onRedo, 
  onSelect,
  onClear 
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <History size={18} />
          Histórico
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={currentIndex <= 0}
          className="flex-1 bg-black/20 border-white/10"
        >
          <Undo2 size={16} className="mr-2" />
          Desfazer
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={currentIndex >= history.length - 1}
          className="flex-1 bg-black/20 border-white/10"
        >
          <Redo2 size={16} className="mr-2" />
          Refazer
        </Button>
      </div>
      <div className="text-sm text-gray-400 text-center">
        {currentIndex + 1} / {history.length}
      </div>
    </div>
  );
};

export default HistoryPanel;
