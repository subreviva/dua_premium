
import React from 'react';
import { TOOLS } from '../../constants';

const WelcomePanel: React.FC = () => {
  return (
    <div className="space-y-6 text-gray-300">
      <h2 className="text-2xl font-bold text-white">Bem-vindo ao DUA Design</h2>
      <p>
        Este é o seu espaço criativo. Use as ferramentas à esquerda para gerar e manipular conteúdo com o poder da DUA.
      </p>
      <div className="space-y-4">
        {TOOLS.map(tool => (
            <div key={tool.id} className="p-4 bg-gray-700/50 rounded-lg">
                <h3 className="font-semibold text-white">{tool.name}</h3>
                <p className="text-sm text-gray-400">{tool.description}</p>
            </div>
        ))}
      </div>
      <p>As suas criações aparecerão na tela central.</p>
    </div>
  );
};

export default WelcomePanel;
