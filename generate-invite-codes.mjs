#!/usr/bin/env node

/**
 * 🎫 GERADOR DE CÓDIGOS DE ACESSO EXCLUSIVOS - DUA IA
 * 
 * Sistema de códigos únicos para acesso controlado à plataforma
 * - Gera 150 códigos alfanuméricos únicos
 * - Verifica códigos existentes no Supabase
 * - Cria códigos novos apenas se necessário
 * - Exporta lista em formato TXT e JSON
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzE4OTc5MSwiZXhwIjoyMDQyNzY1NzkxfQ.kpTTE3QoN_r_yZNmV_-_yp7NwlIZUbL6u7oTv7ATlpU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Gera código alfanumérico único
 * Formato: XXX-YYYY-ZZZ (ex: DUA-2K5X-7N9)
 */
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const part1 = 'DUA'; // Prefixo fixo
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  
  return `${part1}-${part2}-${part3}`;
}

/**
 * Verifica se código já existe
 */
async function codeExists(code) {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('code')
    .eq('code', code)
    .maybeSingle();
  
  return !!data;
}

/**
 * Gera conjunto de códigos únicos
 */
async function generateUniqueCodes(quantity) {
  const codes = new Set();
  let attempts = 0;
  const maxAttempts = quantity * 10;
  
  console.log(`\n🔄 Gerando ${quantity} códigos únicos...`);
  
  while (codes.size < quantity && attempts < maxAttempts) {
    const code = generateCode();
    
    // Verifica se já existe no set ou no banco
    if (!codes.has(code)) {
      const exists = await codeExists(code);
      if (!exists) {
        codes.add(code);
        if (codes.size % 10 === 0) {
          console.log(`   ✓ ${codes.size} códigos gerados...`);
        }
      }
    }
    
    attempts++;
  }
  
  if (codes.size < quantity) {
    console.warn(`⚠️  Atenção: Apenas ${codes.size} códigos únicos gerados após ${attempts} tentativas`);
  }
  
  return Array.from(codes);
}

/**
 * Insere códigos no Supabase
 */
async function insertCodes(codes) {
  console.log(`\n📥 Inserindo ${codes.length} códigos no Supabase...`);
  
  const codesData = codes.map(code => ({
    code,
    active: true,
    used_by: null,
    created_at: new Date().toISOString()
  }));
  
  // Inserir em lotes de 50
  const batchSize = 50;
  let inserted = 0;
  
  for (let i = 0; i < codesData.length; i += batchSize) {
    const batch = codesData.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('invite_codes')
      .insert(batch);
    
    if (error) {
      console.error(`❌ Erro ao inserir lote ${i / batchSize + 1}:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`   ✓ Lote ${Math.floor(i / batchSize) + 1}: ${batch.length} códigos inseridos`);
    }
  }
  
  console.log(`\n✅ Total inserido: ${inserted} códigos`);
  return inserted;
}

/**
 * Verifica códigos existentes
 */
async function checkExistingCodes() {
  console.log('\n🔍 Verificando códigos existentes no Supabase...');
  
  const { data, error, count } = await supabase
    .from('invite_codes')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('❌ Erro ao buscar códigos:', error.message);
    return { total: 0, active: 0, used: 0, codes: [] };
  }
  
  const active = data?.filter(c => c.active).length || 0;
  const used = data?.filter(c => c.used_by).length || 0;
  
  console.log(`\n📊 Estatísticas:`);
  console.log(`   Total de códigos: ${count || 0}`);
  console.log(`   Códigos ativos: ${active}`);
  console.log(`   Códigos usados: ${used}`);
  console.log(`   Códigos disponíveis: ${active}`);
  
  return { total: count || 0, active, used, codes: data || [] };
}

/**
 * Exporta códigos para arquivo
 */
function exportCodes(codes, existing) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  // TXT - Lista simples
  const txtContent = [
    '═══════════════════════════════════════════════════════════',
    '   🎫 CÓDIGOS DE ACESSO EXCLUSIVOS - DUA IA',
    '═══════════════════════════════════════════════════════════',
    '',
    `Data de Geração: ${new Date().toLocaleString('pt-PT')}`,
    `Total de Códigos: ${codes.length}`,
    `Códigos Existentes: ${existing.total}`,
    `Códigos Disponíveis: ${existing.active}`,
    '',
    '───────────────────────────────────────────────────────────',
    '   NOVOS CÓDIGOS GERADOS',
    '───────────────────────────────────────────────────────────',
    '',
    ...codes.map((code, i) => `${String(i + 1).padStart(3, '0')}. ${code}`),
    '',
    '───────────────────────────────────────────────────────────',
    '   INSTRUÇÕES DE USO',
    '───────────────────────────────────────────────────────────',
    '',
    '1. Cada código é único e pode ser usado apenas uma vez',
    '2. O utilizador insere o código na página de registo',
    '3. Após validação, o código fica marcado como usado',
    '4. Conta DUA IA + DUA COIN criadas automaticamente',
    '5. Acesso completo aos estúdios e chat',
    '',
    '═══════════════════════════════════════════════════════════',
  ].join('\n');
  
  // JSON - Dados completos
  const jsonContent = {
    generated_at: new Date().toISOString(),
    total_codes: codes.length,
    existing_codes: existing.total,
    active_codes: existing.active,
    used_codes: existing.used,
    new_codes: codes,
    all_codes: {
      active: existing.codes.filter(c => c.active && !c.used_by).map(c => c.code),
      used: existing.codes.filter(c => c.used_by).map(c => ({
        code: c.code,
        used_by: c.used_by,
        used_at: c.updated_at
      }))
    },
    statistics: {
      total_available: existing.active + codes.length,
      new_generated: codes.length,
      previously_existing: existing.total
    }
  };
  
  // Salvar arquivos
  const txtFile = `CODIGOS_ACESSO_DUA_${timestamp}.txt`;
  const jsonFile = `CODIGOS_ACESSO_DUA_${timestamp}.json`;
  
  writeFileSync(txtFile, txtContent, 'utf-8');
  writeFileSync(jsonFile, JSON.stringify(jsonContent, null, 2), 'utf-8');
  
  console.log(`\n📄 Arquivos gerados:`);
  console.log(`   ✓ ${txtFile}`);
  console.log(`   ✓ ${jsonFile}`);
  
  return { txtFile, jsonFile };
}

/**
 * Main execution
 */
async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🎫 GERADOR DE CÓDIGOS DE ACESSO - DUA IA                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  try {
    // 1. Verificar códigos existentes
    const existing = await checkExistingCodes();
    
    // 2. Determinar quantos códigos novos precisamos
    const targetTotal = 170; // 170 CÓDIGOS EXCLUSIVOS - ACESSO TOTAL PLATAFORMA DUA IA
    const needToGenerate = Math.max(0, targetTotal - existing.active);
    
    if (needToGenerate === 0) {
      console.log(`\n✅ Já existem ${existing.active} códigos ativos (meta: ${targetTotal})`);
      console.log('   Nenhum código novo necessário.');
      
      // Exportar apenas os existentes
      exportCodes([], existing);
      return;
    }
    
    console.log(`\n📝 Necessário gerar ${needToGenerate} novos códigos`);
    console.log(`   (Meta: ${targetTotal}, Existentes: ${existing.active})`);
    
    // 3. Gerar novos códigos
    const newCodes = await generateUniqueCodes(needToGenerate);
    
    // 4. Inserir no banco
    const inserted = await insertCodes(newCodes);
    
    // 5. Exportar todos os códigos
    const files = exportCodes(newCodes, existing);
    
    console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
    console.log(`║   ✅ PROCESSO CONCLUÍDO COM SUCESSO                       ║`);
    console.log(`╚═══════════════════════════════════════════════════════════╝`);
    console.log(`\n📊 Resumo Final:`);
    console.log(`   • Códigos gerados: ${newCodes.length}`);
    console.log(`   • Códigos inseridos: ${inserted}`);
    console.log(`   • Total disponível: ${existing.active + inserted}`);
    console.log(`   • Meta atingida: ${existing.active + inserted >= targetTotal ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`\n📁 Arquivos: ${files.txtFile}, ${files.jsonFile}\n`);
    
  } catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar
main();
