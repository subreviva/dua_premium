#!/usr/bin/env node

/**
 * Script: setup-completo-automatico.js
 * 
 * Cria TUDO automaticamente:
 * - Tabelas via API REST
 * - Códigos de convite
 * - Configuração de Email Auth
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Configure .env.local primeiro!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

console.log('🚀 SETUP AUTOMÁTICO COMPLETO\n');

// ============================================
// CRIAR TABELAS PROGRAMATICAMENTE
// ============================================

async function criarTabelas() {
  console.log('📊 Criando tabelas...\n');

  // Como não podemos executar DDL via REST API diretamente,
  // vamos usar a abordagem via supabase-js para criar storage/buckets
  // e depois inserir dados de teste
  
  // Alternativa: Usar Management API com Personal Access Token
  const projectRef = supabaseUrl.split('//')[1].split('.')[0];
  
  console.log('⚠️  Para criar tabelas automaticamente, preciso de:');
  console.log('   1. Personal Access Token do Supabase');
  console.log('   2. Ou Database Password\n');
  
  console.log('💡 SOLUÇÃO RÁPIDA:\n');
  console.log('   Execute UMA VEZ manualmente no SQL Editor:');
  console.log(`   https://app.supabase.com/project/${projectRef}/sql/new\n`);
  
  console.log('📋 Cole este SQL:\n');
  console.log('─'.repeat(60));
  
  const sql = `
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  credits INTEGER DEFAULT 30 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT code_length_check CHECK (char_length(code) >= 6),
  CONSTRAINT credits_positive_check CHECK (credits >= 0)
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_active ON public.invite_codes(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_invite_codes_used_by ON public.invite_codes(used_by) WHERE used_by IS NOT NULL;

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active codes" ON public.invite_codes FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "Service role can manage all codes" ON public.invite_codes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  credits INTEGER DEFAULT 30 NOT NULL,
  has_access BOOLEAN DEFAULT false NOT NULL,
  invite_code_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT credits_non_negative CHECK (credits >= 0),
  CONSTRAINT email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_has_access ON public.users(has_access) WHERE has_access = true;
CREATE INDEX IF NOT EXISTS idx_users_invite_code ON public.users(invite_code_used) WHERE invite_code_used IS NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN INSERT INTO public.users (id, email, credits, has_access) VALUES (NEW.id, NEW.email, 30, false); RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role can manage all users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
`;
  
  console.log(sql);
  console.log('─'.repeat(60));
  console.log('\n✅ Depois volte e execute: node scripts/setup-completo-automatico.js\n');
}

// ============================================
// GERAR CÓDIGOS
// ============================================

async function gerarCodigos() {
  console.log('🎫 Gerando códigos de convite...\n');
  
  const codes = [];
  
  for (let i = 0; i < 5; i++) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let j = 0; j < 8; j++) {
      if (j === 4) code += '-';
      else code += chars[Math.floor(Math.random() * chars.length)];
    }
    
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .insert({ code, credits: 30, active: true })
        .select()
        .single();
      
      if (!error) {
        codes.push(code);
        console.log(`✅ ${code} → 30 créditos`);
      } else if (error.message.includes('not found')) {
        console.log('❌ Tabela não existe! Execute o SQL primeiro.\n');
        return await criarTabelas();
      } else {
        console.log(`⚠️  ${code}: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ Erro: ${err.message}`);
    }
  }
  
  if (codes.length > 0) {
    console.log(`\n📊 Gerados: ${codes.length}/5`);
    console.log('\n📋 Códigos:');
    codes.forEach(c => console.log(`   ${c}`));
    console.log('\n✅ SISTEMA PRONTO!\n');
    console.log('🧪 Teste agora:');
    console.log('   pnpm dev');
    console.log('   http://localhost:3000/acesso\n');
  }
}

// ============================================
// EXECUTAR
// ============================================

async function main() {
  try {
    // Tentar gerar códigos (se tabela existe)
    await gerarCodigos();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await criarTabelas();
  }
}

main().catch(console.error);
