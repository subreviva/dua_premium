#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lhvymocfsyypjxslcqfh.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxodnltb2Nmc3l5cGp4c2xjcWZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDgxOTIwMywiZXhwIjoyMDQ2Mzk1MjAzfQ.yjUNdtBGW9jHNPCLK4TA9IwzMO0-pxMVpv-8Gm0AZlU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createInvite() {
  const code = 'DESIGNTEST2025';
  
  // Primeiro, deletar se já existe
  await supabase
    .from('invite_codes')
    .delete()
    .eq('code', code);
  
  // Criar novo
  const { data, error } = await supabase
    .from('invite_codes')
    .insert({
      code,
      active: true,
      unlimited: true,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log('✅ Código criado:', code);
  return code;
}

createInvite();
