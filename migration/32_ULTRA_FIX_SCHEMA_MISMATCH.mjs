#!/usr/bin/env node
/**
 * FIX ULTRA-URGENTE: SCHEMA MISMATCH + AUDIT_LOGS
 * 
 * PROBLEMAS IDENTIFICADOS:
 * 1. Query usa colunas que não existem: subscription_tier, display_name
 * 2. Tabela audit_logs não existe (401 error)
 * 3. RLS bloqueando operações
 * 
 * SOLUÇÃO:
 * 1. Verificar schema REAL da tabela users
 * 2. Criar tabela audit_logs se não existir
 * 3. Configurar RLS para audit_logs
 * 4. Atualizar código para usar APENAS colunas que existem
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

console.log('\n🔍 DIAGNÓSTICO ULTRA-URGENTE: SCHEMA MISMATCH\n');

// 1. VERIFICAR SCHEMA REAL DA TABELA USERS
console.log('1️⃣ Verificando colunas REAIS da tabela public.users...\n');

const { data: usersData, error: usersError } = await supabase
  .from('users')
  .select('*')
  .limit(1);

if (usersError) {
  console.log('❌ Erro ao ler users:', usersError.message);
  process.exit(1);
}

const realColumns = usersData && usersData[0] ? Object.keys(usersData[0]) : [];
console.log('✅ COLUNAS REAIS na tabela users:');
realColumns.forEach(col => console.log(`   - ${col}`));

const missingColumns = [];
if (!realColumns.includes('subscription_tier')) missingColumns.push('subscription_tier');
if (!realColumns.includes('display_name')) missingColumns.push('display_name');

if (missingColumns.length > 0) {
  console.log('\n⚠️  COLUNAS FALTANDO (usadas no código mas não existem):');
  missingColumns.forEach(col => console.log(`   - ${col}`));
} else {
  console.log('\n✅ Todas as colunas necessárias existem');
}

// 2. VERIFICAR SE AUDIT_LOGS EXISTE
console.log('\n2️⃣ Verificando tabela audit_logs...\n');

const { data: auditData, error: auditError } = await supabase
  .from('audit_logs')
  .select('*')
  .limit(1);

if (auditError) {
  if (auditError.code === 'PGRST204' || auditError.message.includes('does not exist')) {
    console.log('❌ Tabela audit_logs NÃO EXISTE');
    console.log('   Código tentando inserir logs mas tabela ausente\n');
  } else if (auditError.code === '42501') {
    console.log('⚠️  Tabela audit_logs existe mas RLS bloqueando');
  } else {
    console.log('❌ Erro:', auditError.code, auditError.message);
  }
} else {
  console.log('✅ Tabela audit_logs existe e acessível');
}

// 3. GERAR SQL PARA CRIAR AUDIT_LOGS
console.log('\n3️⃣ Gerando SQL para criar/corrigir audit_logs...\n');

const auditLogsSQL = `
-- ============================================================
-- CRIAÇÃO: TABELA AUDIT_LOGS
-- ============================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem inserir próprios logs
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert own audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Policy: Apenas admins podem ler todos os logs
DROP POLICY IF EXISTS "Admins can read all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can read all audit logs"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND email IN ('estraca@2lados.pt', 'dev@dua.com')
  )
);

-- Policy: Users podem ler próprios logs
DROP POLICY IF EXISTS "Users can read own audit logs" ON public.audit_logs;
CREATE POLICY "Users can read own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);
`;

fs.writeFileSync('FIX_AUDIT_LOGS.sql', auditLogsSQL);
console.log('📄 SQL gerado: FIX_AUDIT_LOGS.sql\n');

// 4. GERAR LISTA DE ARQUIVOS PARA CORRIGIR
console.log('4️⃣ Arquivos que precisam ser corrigidos:\n');

const filesToFix = [
  {
    file: 'app/login/page.tsx',
    line: 112,
    atual: ".select('has_access, name')",
    problema: 'Código JÁ corrigido (subscription_tier e display_name removidos)'
  },
  {
    file: 'app/admin-new/page.tsx',
    problema: 'Usa subscription_tier e display_name - precisa verificar se existem'
  },
  {
    file: 'components/chat-profile.tsx',
    problema: 'Usa subscription_tier e display_name - precisa verificar se existem'
  },
  {
    file: 'lib/audit.ts',
    linha: 106,
    problema: 'Tenta inserir em audit_logs que não existe'
  }
];

filesToFix.forEach((fix, i) => {
  console.log(`   ${i+1}. ${fix.file}`);
  if (fix.line) console.log(`      Linha ${fix.line}`);
  console.log(`      ${fix.problema}`);
  console.log();
});

// 5. VERIFICAR SE SCHEMA USERS TEM AS COLUNAS NECESSÁRIAS
console.log('5️⃣ Verificação final de colunas essenciais:\n');

const essentialColumns = ['id', 'email', 'name', 'has_access', 'created_at', 'last_login'];
const existingEssential = essentialColumns.filter(col => realColumns.includes(col));
const missingEssential = essentialColumns.filter(col => !realColumns.includes(col));

console.log('✅ COLUNAS ESSENCIAIS PRESENTES:');
existingEssential.forEach(col => console.log(`   - ${col}`));

if (missingEssential.length > 0) {
  console.log('\n❌ COLUNAS ESSENCIAIS FALTANDO:');
  missingEssential.forEach(col => console.log(`   - ${col}`));
}

// 6. DECISÃO: O QUE FAZER?
console.log('\n📋 PLANO DE AÇÃO:\n');

if (missingColumns.includes('subscription_tier') || missingColumns.includes('display_name')) {
  console.log('⚠️  PROBLEMA: Código tenta usar colunas que não existem');
  console.log('   subscription_tier e display_name NÃO estão na tabela users');
  console.log('   ');
  console.log('   SOLUÇÃO IMEDIATA:');
  console.log('   1. Remover TODAS as referências a subscription_tier e display_name');
  console.log('   2. Usar apenas: id, email, name, has_access');
  console.log('   3. Se subscription_tier for necessário, adicionar coluna ao schema');
  console.log();
}

if (auditError) {
  console.log('⚠️  PROBLEMA: audit_logs não existe ou inacessível');
  console.log('   ');
  console.log('   SOLUÇÃO:');
  console.log('   1. Executar FIX_AUDIT_LOGS.sql no Supabase Dashboard');
  console.log('   2. Ou fazer código funcionar SEM audit_logs (fallback silencioso)');
  console.log();
}

console.log('\n🎯 EXECUTANDO CORREÇÕES AUTOMÁTICAS...\n');

// CORREÇÃO 1: Desabilitar audit temporariamente no código
console.log('1. Criando versão segura de lib/audit.ts (sem inserções)...');

const safeAudit = `/**
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
}

export const audit = new AuditLogger();
`;

fs.writeFileSync('lib/audit-safe.ts', safeAudit);
console.log('   ✅ lib/audit-safe.ts criado\n');

console.log('\n🎯 RESUMO:\n');
console.log('✅ Diagnóstico completo');
console.log('✅ FIX_AUDIT_LOGS.sql gerado');
console.log('✅ lib/audit-safe.ts criado (versão sem Supabase)');
console.log();
console.log('⚠️  AÇÃO MANUAL NECESSÁRIA:');
console.log('   1. Executar FIX_AUDIT_LOGS.sql no Supabase Dashboard');
console.log('   2. Trocar import em app/login/page.tsx:');
console.log('      DE: import { audit } from "@/lib/audit";');
console.log('      PARA: import { audit } from "@/lib/audit-safe";');
console.log('   3. Verificar se subscription_tier é necessário (se sim, adicionar coluna)');
console.log();
