/**
 * Sistema de Auditoria e Logging
 * 
 * Registra ações importantes do usuário para análise de segurança
 * e comportamento. Envia logs para Supabase de forma assíncrona.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface AuditLogData {
  action: string;
  details?: Record<string, any>;
  userId?: string;
  level?: 'info' | 'warning' | 'error' | 'critical';
}

class AuditLogger {
  private queue: AuditLogData[] = [];
  private isProcessing = false;
  private batchSize = 10;
  private flushInterval = 5000; // 5 segundos

  constructor() {
    // Auto-flush a cada 5 segundos
    setInterval(() => this.flush(), this.flushInterval);
    
    // Flush quando a página vai fechar
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  /**
   * Registra uma ação no sistema
   */
  async log(data: AuditLogData): Promise<void> {
    const enrichedData: AuditLogData = {
      ...data,
      level: data.level || 'info',
      details: {
        ...data.details,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        sessionId: this.getSessionId(),
      }
    };

    this.queue.push(enrichedData);

    // Logs críticos são enviados imediatamente
    if (data.level === 'critical' || data.level === 'error') {
      await this.flush();
    }
    
    // Auto-flush se queue ficar muito grande
    if (this.queue.length >= this.batchSize) {
      await this.flush();
    }
  }

  /**
   * Envia todos os logs pendentes para o servidor
   */
  async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    const logsToSend = [...this.queue];
    this.queue = [];

    try {
      for (const logData of logsToSend) {
        await this.sendToSupabase(logData);
      }
    } catch (error) {
      // PRODUCTION: Removed console.error('Erro ao enviar logs de auditoria:', error);
      // Re-add failed logs to queue
      this.queue.unshift(...logsToSend);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Envia um log individual para Supabase
   */
  private async sendToSupabase(logData: AuditLogData): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const auditEntry = {
        user_id: logData.userId || user?.user?.id,
        action: logData.action,
        details: logData.details,
        ip_address: await this.getClientIP(),
        user_agent: logData.details?.userAgent
      };

      const { error } = await supabase
        .from('audit_logs')
        .insert(auditEntry);

      if (error) {
        // PRODUCTION: Removed console.warn('Falha ao inserir log de auditoria:', error.message);
      }
    } catch (error) {
      // Silently fail - não queremos quebrar a UX por causa de logs
    }
  }

  /**
   * Obtém IP do cliente (aproximado)
   */
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Gera/obtém ID da sessão
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = localStorage.getItem('audit_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      localStorage.setItem('audit_session_id', sessionId);
    }
    return sessionId;
  }
}

// Instância singleton do logger
const auditLogger = new AuditLogger();

/**
 * Funções de conveniência para diferentes tipos de logs
 */
export const audit = {
  // Autenticação e segurança
  login: (success: boolean, method: string = 'email') => 
    auditLogger.log({
      action: 'auth.login',
      level: success ? 'info' : 'warning',
      details: { success, method }
    }),

  logout: () => 
    auditLogger.log({
      action: 'auth.logout',
      level: 'info'
    }),

  codeValidation: (code: string, success: boolean, attempt: number = 1) =>
    auditLogger.log({
      action: 'auth.code_validation',
      level: success ? 'info' : 'warning',
      details: { 
        code: code.substring(0, 3) + '***', // Ocultar parte do código
        success, 
        attempt 
      }
    }),

  registration: (success: boolean, inviteCode?: string) =>
    auditLogger.log({
      action: 'auth.registration',
      level: success ? 'info' : 'error',
      details: { 
        success, 
        inviteCode: inviteCode?.substring(0, 3) + '***' 
      }
    }),

  // Navegação e acesso
  pageAccess: (page: string) =>
    auditLogger.log({
      action: 'navigation.page_access',
      level: 'info',
      details: { page }
    }),

  featureAccess: (feature: string, allowed: boolean) =>
    auditLogger.log({
      action: 'feature.access',
      level: allowed ? 'info' : 'warning',
      details: { feature, allowed }
    }),

  // Erros e problemas
  error: (error: Error, context?: string) =>
    auditLogger.log({
      action: 'system.error',
      level: 'error',
      details: {
        message: error.message,
        stack: error.stack,
        context
      }
    }),

  // Ações críticas
  critical: (action: string, details?: Record<string, any>) =>
    auditLogger.log({
      action: `critical.${action}`,
      level: 'critical',
      details
    }),

  // Métricas de performance
  performance: (metric: string, value: number, unit: string = 'ms') =>
    auditLogger.log({
      action: 'performance.metric',
      level: 'info',
      details: { metric, value, unit }
    }),

  // Ações personalizadas
  custom: (action: string, details?: Record<string, any>, level: AuditLogData['level'] = 'info') =>
    auditLogger.log({
      action: `custom.${action}`,
      level,
      details
    })
};

export default auditLogger;