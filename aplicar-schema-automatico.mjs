#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

console.log('🚀 APLICANDO SCHEMA CRÉDITOS VIA API SUPABASE\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function executarSQL(sql) {
  // Usar PostgreSQL REST API diretamente
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

async function aplicarSchema() {
  const sql = readFileSync('schema-creditos-sync-duacoin.sql', 'utf8');
  
  console.log('📋 Executando schema SQL completo...\n');
  
  try {
    const result = await executarSQL(sql);
    console.log('✅ Schema aplicado com sucesso!');
    console.log('Resultado:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('⚠️ Método exec_sql não disponível, tentando comando direto...\n');
    
    // Método alternativo: usar query() direto
    const { data, error } = await supabase
      .from('_migrations')
      .select('*')
      .limit(1);
    
    console.log('📝 INSTRUÇÕES MANUAIS:\n');
    console.log('Como exec_sql não está disponível, você precisa aplicar o SQL manualmente:');
    console.log('\n1. Abra: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm');
    console.log('2. Vá em: SQL Editor → + New Query');
    console.log('3. Copie o arquivo: schema-creditos-sync-duacoin.sql');
    console.log('4. Cole no editor e clique RUN\n');
    
    console.log('⏳ Enquanto isso, vou criar os outros componentes do sistema...\n');
  }
}

aplicarSchema();
