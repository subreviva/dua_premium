#!/usr/bin/env node

/**
 * 🚀 INSERÇÃO AUTOMÁTICA DE 170 CÓDIGOS VIA CLI
 * Executa SQL diretamente no Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const CODIGOS_170 = [
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
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🚀 INSERÇÃO AUTOMÁTICA DE 170 CÓDIGOS - DUA IA         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Verificar códigos existentes
    console.log('🔍 Verificando códigos existentes...');
    const { data: existing, count } = await supabase
      .from('invite_codes')
      .select('code', { count: 'exact' })
      .in('code', CODIGOS_170);

    const existingCodes = new Set(existing?.map(c => c.code) || []);
    const novos = CODIGOS_170.filter(c => !existingCodes.has(c));

    console.log(`   Total de códigos: ${CODIGOS_170.length}`);
    console.log(`   Já existentes: ${existingCodes.size}`);
    console.log(`   Novos a inserir: ${novos.length}\n`);

    if (novos.length === 0) {
      console.log('✅ Todos os 170 códigos já estão no banco!\n');
      
      // Verificar total
      const { count: totalAtivos } = await supabase
        .from('invite_codes')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);
      
      console.log(`📊 Total de códigos ativos no banco: ${totalAtivos}\n`);
      return;
    }

    // 2. Preparar dados para inserção
    const codesData = novos.map(code => ({
      code,
      active: true,
      used_by: null,
      created_at: new Date().toISOString()
    }));

    // 3. Inserir em lotes de 50
    console.log('📥 Inserindo códigos no Supabase...\n');
    const batchSize = 50;
    let totalInserido = 0;

    for (let i = 0; i < codesData.length; i += batchSize) {
      const batch = codesData.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(codesData.length / batchSize);

      console.log(`   Lote ${batchNum}/${totalBatches}: Inserindo ${batch.length} códigos...`);

      const { data, error } = await supabase
        .from('invite_codes')
        .insert(batch)
        .select();

      if (error) {
        console.error(`   ❌ Erro no lote ${batchNum}:`, error.message);
      } else {
        totalInserido += batch.length;
        console.log(`   ✅ Lote ${batchNum}: ${batch.length} códigos inseridos`);
      }
    }

    console.log(`\n✅ Total inserido: ${totalInserido} códigos\n`);

    // 4. Verificação final
    console.log('🔍 Verificação final...');
    const { count: totalAtivos } = await supabase
      .from('invite_codes')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    const { data: codigosInseridos } = await supabase
      .from('invite_codes')
      .select('code')
      .in('code', CODIGOS_170)
      .eq('active', true);

    console.log(`\n📊 Estatísticas finais:`);
    console.log(`   • Total de códigos ativos no banco: ${totalAtivos}`);
    console.log(`   • Códigos dos 170 confirmados: ${codigosInseridos?.length || 0}`);
    console.log(`   • Códigos inseridos nesta execução: ${totalInserido}`);

    if (codigosInseridos?.length === 170) {
      console.log('\n╔═══════════════════════════════════════════════════════════╗');
      console.log('║   ✅ SUCESSO! 170 CÓDIGOS PRONTOS PARA USO               ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');
    } else {
      console.log(`\n⚠️  Atenção: Apenas ${codigosInseridos?.length} códigos confirmados\n`);
    }

  } catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  }
}

main();
