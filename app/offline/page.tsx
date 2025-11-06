/**
 * Offline Page - Página exibida quando não há conexão
 */
"use client";

import { Wifi, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
          <Wifi className="w-12 h-12 text-red-400" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">
            Sem Conexão
          </h1>
          <p className="text-gray-400 leading-relaxed">
            Você está offline. Verifique sua conexão com a internet e tente novamente.
          </p>
        </div>

        {/* Status Info */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-red-400">Offline</span>
            </div>
            <div className="flex justify-between">
              <span>Última conexão:</span>
              <span className="text-gray-400">
                {typeof window !== 'undefined' 
                  ? localStorage.getItem('lastOnline') || 'Desconhecido'
                  : 'Carregando...'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button 
            onClick={handleRetry} 
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
          
          <Link href="/">
            <Button 
              variant="outline" 
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir para Home
            </Button>
          </Link>
        </div>

        {/* Tips */}
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
          <h3 className="font-semibold text-blue-400 mb-2">Dicas:</h3>
          <ul className="text-sm text-gray-300 space-y-1 text-left">
            <li>• Verifique sua conexão WiFi ou dados móveis</li>
            <li>• Recarregue a página quando voltar online</li>
            <li>• Algumas funções podem funcionar offline</li>
          </ul>
        </div>
      </div>
    </div>
  );
}