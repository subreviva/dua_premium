/**
 * Componente de Prompt de Instalação PWA
 * 
 * Exibe uma notificação elegante incentivando a instalação do app
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Zap, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { toast } from 'sonner';

export default function PWAInstallPrompt() {
  const { 
    isInstallable, 
    isInstalled, 
    showInstallPrompt, 
    installPWA, 
    dismissInstallPrompt 
  } = usePWA();
  
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setIsVisible(showInstallPrompt && isInstallable && !isInstalled);
  }, [showInstallPrompt, isInstallable, isInstalled]);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await installPWA();
      toast.success('App instalado! 🎉', {
        description: 'Você pode encontrá-lo na sua tela inicial'
      });
    } catch (error) {
      // console.error('Erro na instalação:', error);
      toast.error('Erro na instalação', {
        description: 'Não foi possível instalar o app'
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 
                       bg-gradient-to-br from-gray-900 to-black border border-purple-500/20 
                       rounded-2xl p-6 shadow-2xl z-50"
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="space-y-4">
              {/* Icon & Title */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Instalar Music Studio
                  </h3>
                  <p className="text-sm text-gray-400">
                    Acesso rápido e offline
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-300">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Inicialização mais rápida</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-300">
                  <Wifi className="w-4 h-4 text-blue-400" />
                  <span>Funciona offline</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-300">
                  <Download className="w-4 h-4 text-green-400" />
                  <span>Apenas 2MB de espaço</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-2">
                <Button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isInstalling ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {isInstalling ? 'Instalando...' : 'Instalar'}
                </Button>
                
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="px-4 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Agora não
                </Button>
              </div>

              {/* Footer */}
              <p className="text-xs text-gray-500 text-center">
                Você pode desinstalar a qualquer momento nas configurações
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Componente de Status de Conexão
export function ConnectionStatus() {
  const { isOnline } = usePWA();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowStatus(true);
    } else if (showStatus) {
      // Esconder após 3 segundos quando voltar online
      const timeout = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline, showStatus]);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
                     px-4 py-2 rounded-full text-sm font-medium
                     ${isOnline 
                       ? 'bg-green-500 text-white' 
                       : 'bg-red-500 text-white'
                     }`}
        >
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white' : 'bg-white animate-pulse'}`} />
            <span>
              {isOnline ? 'Conexão restaurada' : 'Sem conexão'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}