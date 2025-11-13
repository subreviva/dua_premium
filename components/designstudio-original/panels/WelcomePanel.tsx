
import React from 'react';
import { Circle } from 'lucide-react';

const WelcomePanel: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center">
      {/* Minimal Welcome */}
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
            <Circle className="w-12 h-12 text-orange-500" strokeWidth={0.75} fill="currentColor" fillOpacity={0.2} />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            Selecione uma ferramenta
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Escolha uma ferramenta da barra lateral para começar a criar
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePanel;
