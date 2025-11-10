
import React from 'react';
import { TOOLS } from '@/lib/designstudio-constants';
import { Sparkles, Zap } from 'lucide-react';

const WelcomePanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-4 right-4 opacity-10">
          <Sparkles className="w-32 h-32" strokeWidth={1} />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Bem-vindo ao DUA Design</h2>
              <p className="text-white/70 text-sm mt-1">O seu estúdio criativo profissional alimentado por IA</p>
            </div>
          </div>
          
          <p className="text-white/80 leading-relaxed max-w-2xl">
            Este é o seu espaço criativo. Use as ferramentas da barra lateral para gerar e manipular 
            conteúdo visual com o poder da inteligência artificial. As suas criações aparecerão na tela central.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Ferramentas Disponíveis
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {TOOLS.map((tool, index) => {
            const gradients = [
              'from-blue-500/10 to-purple-500/10',
              'from-purple-500/10 to-pink-500/10',
              'from-pink-500/10 to-orange-500/10',
              'from-orange-500/10 to-amber-500/10',
              'from-amber-500/10 to-yellow-500/10',
              'from-green-500/10 to-emerald-500/10',
              'from-emerald-500/10 to-teal-500/10',
              'from-teal-500/10 to-cyan-500/10',
              'from-cyan-500/10 to-sky-500/10',
              'from-sky-500/10 to-blue-500/10',
              'from-indigo-500/10 to-violet-500/10',
              'from-violet-500/10 to-purple-500/10',
              'from-rose-500/10 to-pink-500/10',
              'from-fuchsia-500/10 to-purple-500/10'
            ];
            const gradient = gradients[index % gradients.length];
            
            return (
              <div 
                key={tool.id} 
                className={`group p-4 rounded-xl bg-gradient-to-br ${gradient} border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]`}
              >
                <h4 className="font-semibold text-white group-hover:text-white/90 transition-colors">
                  {tool.name}
                </h4>
                <p className="text-sm text-white/60 group-hover:text-white/70 mt-1 transition-colors">
                  {tool.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <h4 className="font-semibold text-white mb-3">💡 Dicas Rápidas</h4>
        <ul className="space-y-2 text-sm text-white/70">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Comece selecionando uma ferramenta da barra lateral</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>Use templates para acelerar o seu trabalho criativo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-400 mt-0.5">•</span>
            <span>Todas as criações são guardadas na galeria da sessão</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">•</span>
            <span>Exporte o seu trabalho no painel "Exportar Projeto"</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WelcomePanel;
