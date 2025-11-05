/**
 * Hook para gerenciar funcionalidades PWA
 * 
 * Registra Service Worker, gerencia instalação e notificações
 */

'use client';

import { useEffect, useState } from 'react';
import { audit } from '@/lib/audit';

interface PWAHookReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installPWA: () => Promise<void>;
  showInstallPrompt: boolean;
  dismissInstallPrompt: () => void;
}

export function usePWA(): PWAHookReturn {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    registerServiceWorker();

    // Detectar se já está instalado
    detectInstallation();

    // Configurar listeners
    setupEventListeners();

    // Monitor de conexão
    setupOnlineDetection();

    return () => {
      // Cleanup listeners
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        registration.addEventListener('updatefound', () => {
          console.log('Nova versão do SW disponível');
          audit.custom('sw_update_available', { version: 'v1.2.0' });
        });

        console.log('Service Worker registrado:', registration);
        audit.custom('sw_registered', { scope: registration.scope });
      } catch (error) {
        console.error('Falha ao registrar SW:', error);
        audit.error(error as Error, 'sw_registration');
      }
    }
  };

  const detectInstallation = () => {
    // Detectar se já está instalado
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isInWebAppiOS;
      
      setIsInstalled(isInstalled);
      
      if (isInstalled) {
        audit.custom('pwa_already_installed');
      }
    }
  };

  const setupEventListeners = () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }
  };

  const setupOnlineDetection = () => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Armazenar timestamp da última conexão
      if (navigator.onLine) {
        localStorage.setItem('lastOnline', new Date().toLocaleString('pt-BR'));
      }
    }
  };

  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setIsInstallable(true);
    
    // Mostrar prompt após 30 segundos (apenas na primeira visita)
    const hasSeenPrompt = localStorage.getItem('pwa_prompt_seen');
    if (!hasSeenPrompt && !isInstalled) {
      setTimeout(() => {
        setShowInstallPrompt(true);
        audit.custom('pwa_prompt_shown', { trigger: 'auto_after_30s' });
      }, 30000);
    }
  };

  const handleAppInstalled = () => {
    setIsInstalled(true);
    setIsInstallable(false);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    
    audit.custom('pwa_installed', { method: 'user_action' });
    console.log('PWA instalada com sucesso!');
  };

  const handleOnline = () => {
    setIsOnline(true);
    localStorage.setItem('lastOnline', new Date().toLocaleString('pt-BR'));
    audit.custom('connection_restored');
  };

  const handleOffline = () => {
    setIsOnline(false);
    audit.custom('connection_lost');
  };

  const installPWA = async (): Promise<void> => {
    if (!deferredPrompt) {
      throw new Error('PWA não pode ser instalada');
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      audit.custom('pwa_install_prompt_result', { outcome });
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      audit.error(error as Error, 'pwa_installation');
      throw error;
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa_prompt_seen', 'true');
    audit.custom('pwa_prompt_dismissed');
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installPWA,
    showInstallPrompt,
    dismissInstallPrompt,
  };
}

// Hook para push notifications
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Notificações não suportadas');
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      audit.custom('notification_permission_requested', { result });
      
      return result;
    } catch (error) {
      audit.error(error as Error, 'notification_permission');
      throw error;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      throw new Error('Permissão de notificação negada');
    }

    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options,
    });

    audit.custom('notification_sent', { title });

    return notification;
  };

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
  };
}