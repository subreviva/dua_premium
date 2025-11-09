#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════
 * INSERÇÃO AUTOMÁTICA DOS 170 CÓDIGOS DE ACESSO DUA
 * ═══════════════════════════════════════════════════════════════
 * Insere diretamente no Supabase usando Service Role Key
 * ═══════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  🎫 INSERÇÃO AUTOMÁTICA DOS 170 CÓDIGOS DE ACESSO DUA');
console.log('═══════════════════════════════════════════════════════════════\n');

// Validar credenciais
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ ERRO: Credenciais do Supabase não encontradas!\n');
  console.error('Verificando variáveis de ambiente:');
  console.error('  SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗');
  console.error('\nVerifique o arquivo .env.local\n');
  process.exit(1);
}

// Criar cliente Supabase com Service Role Key (bypass RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('✅ Conectado ao Supabase:', SUPABASE_URL);
console.log('✅ Usando Service Role Key (bypass RLS)\n');

// Lista completa dos 170 códigos
const CODES = [
  'DUA-03BN-9QT', 'DUA-044P-OYM', 'DUA-09P2-GDD', 'DUA-11SF-3GX', 'DUA-11UF-1ZR',
  'DUA-17OL-JNL', 'DUA-17Q2-DCZ', 'DUA-1AG9-T4T', 'DUA-1F71-A68', 'DUA-1KVM-WND',
  'DUA-1WG9-7U7', 'DUA-2OZG-PSG', 'DUA-2PH0-G3I', 'DUA-2TEJ-SK9', 'DUA-352J-L4R',
  'DUA-3CTK-MVZ', 'DUA-3E3Z-CR1', 'DUA-3FUG-4QE', 'DUA-3UKV-FA8', 'DUA-44MD-4VD',
  'DUA-4ASV-JAN', 'DUA-4L9D-PR5', 'DUA-578K-5QX', 'DUA-58FX-ZAP', 'DUA-595N-EWJ',
  'DUA-5DG2-MHJ', 'DUA-5GDU-GU4', 'DUA-5HX2-OTO', 'DUA-5ME0-1UZ', 'DUA-5MEO-FFQ',
  'DUA-5T39-ON3', 'DUA-6AAL-KAW', 'DUA-6FQ8-0ZR', 'DUA-6IXL-JID', 'DUA-6SCP-2AR',
  'DUA-6XTN-9NK', 'DUA-6Z1U-9PT', 'DUA-7EUY-DZR', 'DUA-7F5Q-H6A', 'DUA-7FSW-HQH',
  'DUA-7N7T-LD7', 'DUA-8HC5-7SM', 'DUA-8NET-YUG', 'DUA-8O80-GKM', 'DUA-8T1M-4J5',
  'DUA-9P5N-QG0', 'DUA-9S9L-D3W', 'DUA-A77V-408', 'DUA-A7IE-4G4', 'DUA-B5KG-MDT',
  'DUA-B6OT-18R', 'DUA-B7TZ-SRS', 'DUA-BISN-J7T', 'DUA-CJBX-MVP', 'DUA-COPC-B57',
  'DUA-D164-YBU', 'DUA-D5PU-4O2', 'DUA-D7ST-NZR', 'DUA-DC94-L6M', 'DUA-DPOE-8GD',
  'DUA-DS9H-THR', 'DUA-DW7K-F3R', 'DUA-DWE8-MUM', 'DUA-EZS1-2WZ', 'DUA-F1WZ-QN2',
  'DUA-FS8I-EZT', 'DUA-FUG1-XRG', 'DUA-G7WJ-FGS', 'DUA-GFYE-A04', 'DUA-GHVM-R78',
  'DUA-GKD7-2BR', 'DUA-GUFZ-0TT', 'DUA-I3BP-FJC', 'DUA-ICJH-5CO', 'DUA-IFAL-T5L',
  'DUA-IVZX-8A8', 'DUA-J4G2-VLJ', 'DUA-JCZK-A5A', 'DUA-JDVL-FTY', 'DUA-JL3M-FY3',
  'DUA-JNK9-22G', 'DUA-JXC1-Z12', 'DUA-JY3R-IOE', 'DUA-K5JE-H8K', 'DUA-K89W-NE7',
  'DUA-KAWU-ZWV', 'DUA-KJ6G-UCM', 'DUA-KON4-TGW', 'DUA-KRTT-BMU', 'DUA-L8JQ-UX5',
  'DUA-LA1J-SEW', 'DUA-LG12-ZO3', 'DUA-LKDW-PIT', 'DUA-LO44-C89', 'DUA-LOXY-Q41',
  'DUA-LWOW-T1Y', 'DUA-LZMS-6FO', 'DUA-MAA6-QIO', 'DUA-MDDY-PIW', 'DUA-MGP7-MA5',
  'DUA-MJ45-2XO', 'DUA-MLD2-2UM', 'DUA-MNVM-LHW', 'DUA-MTVV-V38', 'DUA-MU56-Z05',
  'DUA-MUTS-JSV', 'DUA-N0AP-HWB', 'DUA-N0WJ-XLG', 'DUA-N9SE-4C1', 'DUA-NJFT-HH8',
  'DUA-NL2B-7NK', 'DUA-NL8B-MJS', 'DUA-NORV-63I', 'DUA-NVM9-ESS', 'DUA-NVYT-G77',
  'DUA-NWUS-5SG', 'DUA-NYB3-4PF', 'DUA-O8T0-M9P', 'DUA-OLGI-Q24', 'DUA-OO81-UP4',
  'DUA-PC2X-2NY', 'DUA-PJ8I-9BN', 'DUA-PKQU-6XP', 'DUA-Q32A-SW3', 'DUA-Q4Q8-18T',
  'DUA-QF11-UWY', 'DUA-QTQ0-RMJ', 'DUA-QULD-ZO8', 'DUA-R0R9-FTT', 'DUA-R9IP-A9A',
  'DUA-REKC-XIP', 'DUA-RM5K-KIQ', 'DUA-RO7R-578', 'DUA-RYIN-TAC', 'DUA-S1HE-BM9',
  'DUA-S8VM-GCH', 'DUA-SS9O-3N5', 'DUA-SZY0-37F', 'DUA-T8H5-240', 'DUA-TH5G-4OB',
  'DUA-TMGC-L07', 'DUA-TQY2-L5H', 'DUA-TWT8-4U1', 'DUA-TXPY-5KF', 'DUA-TZ3L-03T',
  'DUA-U450-QT6', 'DUA-U5YA-J46', 'DUA-UI2I-83Y', 'DUA-UNSP-K53', 'DUA-US35-PBZ',
  'DUA-UWTP-HHP', 'DUA-V3I6-RPH', 'DUA-V58K-LF0', 'DUA-VB8L-2RB', 'DUA-VCJQ-N9F',
  'DUA-VDY7-A55', 'DUA-VI43-SGG', 'DUA-VV41-4D5', 'DUA-W0E2-3II', 'DUA-WEPL-437',
  'DUA-WZY0-3MJ', 'DUA-XDZN-I5I', 'DUA-XE2X-W1E', 'DUA-XH7J-B6X', 'DUA-XYTJ-M6R',
  'DUA-YC38-04D', 'DUA-ZDSQ-45B', 'DUA-ZL1Z-CAF', 'DUA-ZLJZ-3TH', 'DUA-ZPZW-3QS'
];

async function main() {
  console.log('📊 Verificando estado atual da base de dados...\n');

  // 1. Verificar se a tabela existe
  const { data: existing, error: checkError } = await supabase
    .from('invite_codes')
    .select('code, active')
    .limit(1);

  if (checkError) {
    console.error('❌ ERRO: Tabela invite_codes não existe ou não é acessível!');
    console.error('   Erro:', checkError.message);
    console.error('\n💡 SOLUÇÃO: Execute primeiro o SQL no Supabase Dashboard:');
    console.error('   Copie e execute: insert-170-codes.sql (apenas a parte CREATE TABLE)\n');
    process.exit(1);
  }

  console.log('✅ Tabela invite_codes existe e é acessível\n');

  // 2. Verificar quantos códigos já existem
  const { data: allExisting, error: countError } = await supabase
    .from('invite_codes')
    .select('code, active');

  if (countError) {
    console.error('❌ Erro ao contar códigos:', countError.message);
    process.exit(1);
  }

  const existingCodes = new Set(allExisting?.map(c => c.code) || []);
  const missingCodes = CODES.filter(code => !existingCodes.has(code));

  console.log(`   Códigos na DB: ${existingCodes.size}`);
  console.log(`   Códigos esperados: ${CODES.length}`);
  console.log(`   Códigos faltantes: ${missingCodes.length}\n`);

  if (missingCodes.length === 0) {
    console.log('✅ TODOS OS 170 CÓDIGOS JÁ ESTÃO NA BASE DE DADOS!\n');
    
    // Mostrar estatísticas
    const activeCodes = allExisting?.filter(c => c.active).length || 0;
    const usedCodes = (allExisting?.length || 0) - activeCodes;
    
    console.log('📈 Estatísticas:');
    console.log(`   Ativos: ${activeCodes}`);
    console.log(`   Usados: ${usedCodes}\n`);
    
    console.log('═══════════════════════════════════════════════════════════════\n');
    return;
  }

  console.log('📝 Inserindo códigos faltantes...\n');

  // 3. Inserir códigos em lotes de 50 (melhor performance)
  const BATCH_SIZE = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < missingCodes.length; i += BATCH_SIZE) {
    const batch = missingCodes.slice(i, i + BATCH_SIZE);
    const records = batch.map(code => ({
      code,
      active: true,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('invite_codes')
      .insert(records)
      .select();

    if (error) {
      console.error(`   ❌ Erro no lote ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
      errors += batch.length;
    } else {
      inserted += data?.length || 0;
      console.log(`   ✅ Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${data?.length || 0} códigos inseridos`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  RESULTADO FINAL');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`✅ Códigos inseridos: ${inserted}`);
  if (errors > 0) {
    console.log(`❌ Erros: ${errors}`);
  }

  // 4. Verificação final
  const { data: finalCheck } = await supabase
    .from('invite_codes')
    .select('code, active');

  const totalNow = finalCheck?.length || 0;
  const activeNow = finalCheck?.filter(c => c.active).length || 0;
  const usedNow = totalNow - activeNow;

  console.log(`\n📊 Estado final da base de dados:`);
  console.log(`   Total: ${totalNow} / ${CODES.length}`);
  console.log(`   Ativos: ${activeNow}`);
  console.log(`   Usados: ${usedNow}\n`);

  if (totalNow === CODES.length) {
    console.log('🎉 SUCESSO! TODOS OS 170 CÓDIGOS ESTÃO NA BASE DE DADOS!\n');
    console.log('🧪 Teste agora:');
    console.log('   1. Vá para /acesso');
    console.log('   2. Digite: DUA-03BN-9QT');
    console.log('   3. Deve validar com sucesso ✅\n');
  } else {
    console.log('⚠️  Alguns códigos ainda faltam. Execute novamente o script.\n');
  }

  console.log('═══════════════════════════════════════════════════════════════\n');
}

main().catch(error => {
  console.error('\n❌ ERRO FATAL:', error.message);
  console.error('\nStack:', error.stack);
  process.exit(1);
});
