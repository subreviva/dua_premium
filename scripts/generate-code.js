#!/usr/bin/env node

/**
 * Script: generate-code.js
 * 
 * Gera códigos de convite aleatórios e insere no Supabase.
 * 
 * Uso:
 *   node scripts/generate-code.js [quantidade] [creditos]
 * 
 * Exemplos:
 *   node scripts/generate-code.js           # Gera 1 código com 30 créditos
 *   node scripts/generate-code.js 5         # Gera 5 códigos com 30 créditos
 *   node scripts/generate-code.js 10 50     # Gera 10 códigos com 50 créditos cada
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '../.env.local') });

/**
 * Gera um código aleatório de 8 caracteres
 * Formato: XXXX-XXXX (ex: DUA2-X7K9)
 */
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Remove letras confusas: I, O, 0, 1
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    if (i === 4) {
      code += '-'; // Adiciona hífen no meio
    } else {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }
  }
  
  return code;
}

/**
 * Insere códigos no Supabase
 */
async function generateInviteCodes(quantity = 1, credits = 30) {
  // Validar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
    console.log('');
    console.log('Configure no arquivo .env.local:');
    console.log('  NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co');
    console.log('  SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key');
    console.log('');
    process.exit(1);
  }

  // Criar cliente Supabase (com service_role para bypass RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🎫 Gerando códigos de convite...\n');

  const codes = [];

  for (let i = 0; i < quantity; i++) {
    const code = generateCode();
    
    try {
      // Inserir no banco
      const { data, error } = await supabase
        .from('invite_codes')
        .insert({
          code,
          credits,
          active: true,
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Erro ao criar código ${code}:`, error.message);
      } else {
        codes.push(code);
        console.log(`✅ ${code} → ${credits} créditos`);
      }
    } catch (err) {
      console.error(`❌ Erro inesperado:`, err);
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`   Total gerado: ${codes.length}/${quantity}`);
  console.log(`   Créditos por código: ${credits}`);
  console.log('\n📋 Códigos gerados:');
  codes.forEach((code) => console.log(`   ${code}`));
  console.log('');
}

// Parse argumentos da linha de comando
const args = process.argv.slice(2);
const quantity = parseInt(args[0]) || 1;
const credits = parseInt(args[1]) || 30;

// Validar inputs
if (quantity < 1 || quantity > 100) {
  console.error('❌ Quantidade deve ser entre 1 e 100');
  process.exit(1);
}

if (credits < 1 || credits > 1000) {
  console.error('❌ Créditos devem ser entre 1 e 1000');
  process.exit(1);
}

// Executar
console.log(`🚀 Gerando ${quantity} código(s) com ${credits} créditos cada...\n`);
generateInviteCodes(quantity, credits).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
