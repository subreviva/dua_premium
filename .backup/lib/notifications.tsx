/**
 * Sistema de Notificações Premium
 * Feedback visual avançado com animações fluidas
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export interface NotificationConfig {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Ícones para diferentes tipos de notificação
const NotificationIcons = {
  success: (
    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
        <path d="M11.765 3.735a.75.75 0 0 1 0 1.06L6.618 9.942a.75.75 0 0 1-1.06 0L2.235 6.62a.75.75 0 1 1 1.06-1.06L6.088 8.353l4.617-4.618a.75.75 0 0 1 1.06 0Z"/>
      </svg>
    </div>
  ),
  error: (
    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
        <path d="M7 0C3.134 0 0 3.134 0 7s3.134 7 7 7 7-3.134 7-7S10.866 0 7 0zm3.5 9.5L9 10.5 7 8.5 5 10.5 3.5 9.5 5.5 7.5 3.5 5.5 5 4.5 7 6.5 9 4.5l1.5 1L8.5 7.5l2 2z"/>
      </svg>
    </div>
  ),
  warning: (
    <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
        <path d="M7 0a7 7 0 1 0 7 7A7 7 0 0 0 7 0zM7 4a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1zm0 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
      </svg>
    </div>
  ),
  info: (
    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
        <path d="M7 0a7 7 0 1 0 7 7A7 7 0 0 0 7 0zM7 4a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1zm0-2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
      </svg>
    </div>
  )
};

// Sistema de notificações premium
export class PremiumNotifications {
  static show(config: NotificationConfig) {
    const { title, description, type = 'info', duration = 4000, action } = config;

    const colors = {
      success: 'border-emerald-500/20 bg-emerald-500/10',
      error: 'border-red-500/20 bg-red-500/10',
      warning: 'border-yellow-500/20 bg-yellow-500/10',
      info: 'border-blue-500/20 bg-blue-500/10'
    };

    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: 100 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`
            max-w-md w-full bg-neutral-900/90 backdrop-blur-xl 
            border rounded-xl p-4 shadow-2xl
            ${colors[type]}
          `}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {NotificationIcons[type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">
                {title}
              </p>
              {description && (
                <p className="text-neutral-300 text-sm mt-1 leading-relaxed">
                  {description}
                </p>
              )}
              
              {/* Action Button */}
              {action && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    action.onClick();
                    toast.dismiss(t);
                  }}
                  className="mt-3 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {action.label}
                </motion.button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => toast.dismiss(t)}
              className="flex-shrink-0 text-neutral-400 hover:text-white transition-colors p-1"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7 0C3.134 0 0 3.134 0 7s3.134 7 7 7 7-3.134 7-7S10.866 0 7 0zm3.5 9.5L9 10.5 7 8.5 5 10.5 3.5 9.5 5.5 7.5 3.5 5.5 5 4.5 7 6.5 9 4.5l1.5 1L8.5 7.5l2 2z"/>
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className={`absolute bottom-0 left-0 h-1 bg-current opacity-30 ${
              type === 'success' ? 'text-emerald-500' :
              type === 'error' ? 'text-red-500' :
              type === 'warning' ? 'text-yellow-500' :
              'text-blue-500'
            }`}
            style={{ transformOrigin: 'left' }}
          />
        </motion.div>
      ),
      { duration }
    );
  }

  // Métodos de conveniência
  static success(title: string, description?: string, action?: NotificationConfig['action']) {
    this.show({ title, description, type: 'success', action });
  }

  static error(title: string, description?: string, action?: NotificationConfig['action']) {
    this.show({ title, description, type: 'error', action });
  }

  static warning(title: string, description?: string, action?: NotificationConfig['action']) {
    this.show({ title, description, type: 'warning', action });
  }

  static info(title: string, description?: string, action?: NotificationConfig['action']) {
    this.show({ title, description, type: 'info', action });
  }

  // Notificação de loading com promise
  static async loading<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ): Promise<T> {
    const toastId = toast.loading(messages.loading, {
      style: {
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
      }
    });

    try {
      const result = await promise;
      toast.success(messages.success, { id: toastId });
      return result;
    } catch (error) {
      toast.error(messages.error, { id: toastId });
      throw error;
    }
  }
}

// Hook para usar notificações com contexto
export function useNotifications() {
  return {
    show: PremiumNotifications.show,
    success: PremiumNotifications.success,
    error: PremiumNotifications.error,
    warning: PremiumNotifications.warning,
    info: PremiumNotifications.info,
    loading: PremiumNotifications.loading,
  };
}

export default PremiumNotifications;