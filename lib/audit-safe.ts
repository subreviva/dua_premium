/**
 * Sistema de Auditoria e Logging - VERSÃO SAFE
 * 
 * Registra ações mas NÃO insere em Supabase até tabela audit_logs estar pronta
 */

export interface AuditLogData {
  action: string;
  details?: Record<string, any>;
  userId?: string;
  level?: 'info' | 'warning' | 'error' | 'critical';
}

class AuditLogger {
  async log(data: AuditLogData): Promise<void> {
    // SAFE MODE: Apenas log no console (sem Supabase)
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', data.action, data.details);
    }
    // Não faz NADA em produção até audit_logs existir
  }

  async flush(): Promise<void> {
    // No-op
  }

  // Métodos helper mantidos para compatibilidade
  login(success: boolean, method: string) {
    this.log({
      action: success ? 'login_success' : 'login_failure',
      details: { method },
      level: success ? 'info' : 'warning'
    });
  }

  pageAccess(page: string) {
    this.log({
      action: 'page_access',
      details: { page },
      level: 'info'
    });
  }

  apiCall(endpoint: string, method: string, statusCode?: number) {
    this.log({
      action: 'api_call',
      details: { endpoint, method, statusCode },
      level: statusCode && statusCode >= 400 ? 'error' : 'info'
    });
  }

  codeValidation(code: string, success: boolean, attempts: number) {
    this.log({
      action: success ? 'code_validation_success' : 'code_validation_failure',
      details: { code: code.substring(0, 8) + '...', attempts },
      level: success ? 'info' : 'warning'
    });
  }

  registration(success: boolean, inviteCode?: string) {
    this.log({
      action: success ? 'registration_success' : 'registration_failure',
      details: { inviteCode },
      level: success ? 'info' : 'warning'
    });
  }

  error(error: Error, context: string) {
    this.log({
      action: 'error',
      details: { message: error.message, context, stack: error.stack?.substring(0, 200) },
      level: 'error'
    });
  }
}

export const audit = new AuditLogger();
